const OFFSCREEN_DOCUMENT_PATH = '/html/offscreen.html';
const CONFIG_PATH = '/html/config.html';
const LINK_PATH = '/html/link.html';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(["hostURL", "token"], (items) => {
        if (!items.hostURL || !items.token) {
            console.log("Username or password is not saved. Opening options page...");
            chrome.tabs.create({ url: CONFIG_PATH });
        } else {
            // chrome.storage.sync.set({ "hostURL": null, "token": null}, () => {
            //     console.log("URL and token saved.");
            //     window.close();
            // });
            console.log('service-worker.js: Line 10 - items.hostURL',items.hostURL);
            console.log('service-worker.js: Line 11 - items.token',items.token);
        }
    });
});

chrome.action.onClicked.addListener(async (tab) => {
    const url = tab.url;
    const text = await getTextFromSelection(tab.id);
    sendMessageToOffscreenDocument(
        'convert-to-markdown',
        text,
        url
    );
});

async function getTextFromSelection(tabId) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: () => {
                var range = window.getSelection().getRangeAt(0);
                var div = document.createElement('div');
                div.appendChild(range.cloneContents());
                var html = div.innerHTML;
                return html;
            },
        }, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[0].result);
            }
        });
    });
}

async function sendMessageToOffscreenDocument(type, data, url) {
    if (!(await hasDocument())) {
        await chrome.offscreen.createDocument({
            url: OFFSCREEN_DOCUMENT_PATH,
            reasons: [chrome.offscreen.Reason.DOM_PARSER],
            justification: 'Parse DOM'
        });
    }
    chrome.runtime.sendMessage({
        type,
        target: 'offscreen',
        data,
        url
    });
}

chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message) {
    if (message.target !== 'background') {
        return;
    }
    switch (message.type) {
        case 'convert-to-markdown-result':
            handleConvertToMarkdownResult(message.data);
            closeOffscreenDocument();
            break;
        default:
        console.warn(`Unexpected message type received: '${message.type}'.`);
    }
}

async function handleConvertToMarkdownResult(markdown) {
    sendDataToAPI(markdown)
    console.log('Received markdown\n\n', markdown);
}

async function closeOffscreenDocument() {
    if (!(await hasDocument())) {
        return;
    }
    await chrome.offscreen.closeDocument();
}

async function hasDocument() {
    const matchedClients = await clients.matchAll();
    for (const client of matchedClients) {
        if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
        return true;
        }
    }
    return false;
}

function sendDataToAPI(markdown) {
    chrome.storage.sync.get(["hostURL", "token"], (items) => {
        if (!items.hostURL || !items.token) {
            console.log("Username or password is not saved. Opening options page...");
            chrome.tabs.create({ url: CONFIG_PATH });
        } else {
            let timestamp = getDatetimeStamp(new Date());
            const endpoint = items.hostURL + '/Inbox/' + encodeURIComponent(timestamp)  + '.md';
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'text/markdown',
                    'Authorization': 'Bearer ' + items.token
                },
                body: markdown,
            };
            fetch(endpoint, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                } else {
                    //Show link to new page
                    console.log('service-worker.js: Line 127 - endpoint',endpoint);
                    console.log('service-worker.js: Line 129 - print', items.hostURL + '/Inbox/' + timestamp  + '.md');

                }
            })
            .then(data => {
                console.log('Response:', data);
            })
            .catch(error => {
                console.log('Error sending data to API:', error);
            });
        }
    });
    
    
}

function getDatetimeStamp(datetime) {
    return datetime.getFullYear().toString() + '-' + (datetime.getMonth() + 1).toString().padStart(2,'0') + '-' + datetime.getDate().toString().padStart(2,'0') + ' ' + datetime.getHours().toString().padStart(2,'0') + ":" + datetime.getMinutes().toString().padStart(2,'0') + ':' + datetime.getSeconds().toString().padStart(2,'0');
}
