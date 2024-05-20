const OFFSCREEN_DOCUMENT_PATH = '/html/offscreen.html';
/* Get the selected text from the tab */
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

/* Use an offscreen document to parse the captured DOM */
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


/* Listener for service worker */
chrome.runtime.onMessage.addListener(handleMessages);
async function handleMessages(message) {
    if (message.target !== 'service-worker') {
        return;
    }
    switch (message.type) {
        case 'convert-to-markdown-result':
            //Send the markdown via the API
            sendCaptureToEndpoint(message.data, message.title);
            closeOffscreenDocument();
            break;
        case 'capture':
            //Capture the user selection
            captureTab(message.data.title, message.data.tags);
            break;            
        default:
        console.warn(`Unexpected message type received: '${message.type}'.`);
    }
}

/* Capture the the tab URL and any selected HTML */
async function captureTab(title, tags) {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    const url = tab.url;
    //Get the selected HTML form the tab and then send to the offscreen document for parsing
    const text = await getTextFromSelection(tab.id);
        sendMessageToOffscreenDocument(
            'convert-to-markdown',
            text,
            url,
            title,
            tags
        );
}


/* Close the offscreen document */
async function closeOffscreenDocument() {
    if (!(await hasDocument())) {
        return;
    }
    await chrome.offscreen.closeDocument();
}

/* Check if the offscreen document has been created */
async function hasDocument() {
    const matchedClients = await clients.matchAll();
    for (const client of matchedClients) {
        if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
        return true;
        }
    }
    return false;
}

/* Send the markdown to the Silverbullet endpoint */
function sendCaptureToEndpoint(markdown, title) {
    chrome.storage.sync.get(["hostURL", "token"], (items) => {
        const link = items.hostURL + '/Inbox/' + encodeURI(title);
        const endpoint = link + '.md';
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
                //Update the link span on the popup to show a link to the new Quick Note
                chrome.runtime.sendMessage({
                    type: 'link',
                    target: 'popup',
                    url: link
                });
            }
        })
        .then(data => {
            console.log('Response:', data);
        })
        .catch(error => {
           //Show the api error on the popup
            chrome.runtime.sendMessage({
                type: 'api-error',
                target: 'popup'
            });
        });
    });
}