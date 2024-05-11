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
        case 'capture':
            captureTab();
            break;            
        default:
        console.warn(`Unexpected message type received: '${message.type}'.`);
    }
}

async function captureTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    const url = tab.url;
    const text = await getTextFromSelection(tab.id);
        sendMessageToOffscreenDocument(
            'convert-to-markdown',
            text,
            url
        );
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

// Function to wait for the tab to be fully loaded
function waitForTabLoad(tabId, timestamp, endpoint) {
    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
        if (updatedTabId === tabId && changeInfo.status === "complete") {
            chrome.tabs.sendMessage(tabId, {
                action: "displayLink",
                data: {
                    text: timestamp,
                    url: endpoint
                }
            });
            // Remove the listener
            chrome.tabs.onUpdated.removeListener(listener);
        }
    });
}

function sendLinkData(tabId, timestamp, endpoint) {
    chrome.tabs.sendMessage(tabId, {
        action: "displayLink",
        data: {
            text: timestamp,
            url: endpoint
        }
    });
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
                    chrome.windows.create({
                        type: "popup",
                        url: LINK_PATH,
                        width: 300,
                        height: 150
                    }, (linkWindow) => {
                        waitForTabLoad(linkWindow.tabs[0].id, timestamp, endpoint);
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

function getDatetimeStamp(datetime) {
    return datetime.getFullYear().toString() + '-' + (datetime.getMonth() + 1).toString().padStart(2,'0') + '-' + datetime.getDate().toString().padStart(2,'0') + ' ' + datetime.getHours().toString().padStart(2,'0') + ":" + datetime.getMinutes().toString().padStart(2,'0') + ':' + datetime.getSeconds().toString().padStart(2,'0');
}
