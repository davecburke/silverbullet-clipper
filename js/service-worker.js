const OFFSCREEN_DOCUMENT_PATH = '/html/offscreen.html';
const CONFIG_PATH = '/html/config.html';
const LINK_PATH = '/html/link.html';
const POPUP_PATH = '/html/popup.html';

chrome.action.onClicked.addListener(async (tab) => {
    chrome.storage.sync.get(["hostURL", "token"], (items) => {
        if (!items.hostURL || !items.token) {
            chrome.tabs.create({ url: CONFIG_PATH });
        } else {
            chrome.tabs.create({ url: POPUP_PATH });
        }
    });
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

async function sendMessageToOffscreenDocument(type, data, url, title, tags) {
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
        url,
        title,
        tags
    });
}

chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message) {
    if (message.target !== 'service-worker') {
        return;
    }
    switch (message.type) {
        case 'convert-to-markdown-result':
            handleConvertToMarkdownResult(message.data, message.title);
            closeOffscreenDocument();
            break;
        case 'capture':
            console.log('service-worker.js: Line 67 - message',JSON.stringify(message));
            captureTab(message.data.title, message.data.tags);
            break;            
        default:
        console.warn(`Unexpected message type received: '${message.type}'.`);
    }
}

async function captureTab(title, tags) {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    const url = tab.url;
    const text = await getTextFromSelection(tab.id);
        sendMessageToOffscreenDocument(
            'convert-to-markdown',
            text,
            url,
            title,
            tags
        );
}

async function handleConvertToMarkdownResult(markdown, title) {
    sendDataToAPI(markdown, title)
    console.log('Received markdown\n\n', markdown);
    console.log('Received title', title);
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

function sendDataToAPI(markdown, title) {
    chrome.storage.sync.get(["hostURL", "token"], (items) => {
        if (!items.hostURL || !items.token) {
            console.log("Username or password is not saved. Opening options page...");
            chrome.tabs.create({ url: CONFIG_PATH });
        } else {
            const endpoint = items.hostURL + '/Inbox/' + encodeURIComponent(title)  + '.md';
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
                    chrome.runtime.sendMessage({
                        type: 'link',
                        target: 'popup',
                        url: endpoint
                    });
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
