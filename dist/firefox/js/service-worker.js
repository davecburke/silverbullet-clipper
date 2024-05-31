
/* Get the selected text from the tab */
async function getTextFromSelection(tabId) {
    return new Promise((resolve, reject) => {
        browser.tabs.executeScript(tabId, {
            code: `
                var range = window.getSelection().getRangeAt(0);
                var div = document.createElement('div');
                div.appendChild(range.cloneContents());
                var html = div.innerHTML;
                html;
            `
        })
        .then(result => {
            resolve(result[0]);
        })
        .catch(error => {
            reject(error);
        });
    });
}

/* Get the title of the web page from the tab */
async function getTitleFromTab(tabId) {
    return new Promise((resolve, reject) => {
        browser.tabs.executeScript(tabId, {
            code: `document.title;`
        })
        .then(result => {
            resolve(result[0]);
        })
        .catch(error => {
            reject(error);
        });
    });
}

/* Use an offscreen document to parse the captured DOM */
function sendMessageToOffscreenDocument(type, data, url, title, tags) {
    browser.runtime.sendMessage({
        type,
        target: 'offscreen',
        data,
        url,
        title,
        tags
    });
}



/* Listener for service worker */
browser.runtime.onMessage.addListener(handleMessages);
async function handleMessages(message) {
    if (message.target !== 'service-worker') {
        return;
    }
    switch (message.type) {
        case 'convert-to-markdown-result':
            //Send the markdown via the API
            sendCaptureToEndpoint(message.data, message.title);
            
            break;
        case 'capture':
            //Capture the user selection
            captureTab(message.data.title, message.data.tags, message.data.appendPageTitle);
            break;            
        default:
        console.warn(`Unexpected message type received: '${message.type}'.`);
    }
}

/* Capture the the tab URL and any selected HTML */
async function captureTab(title, tags, appendPageTitle) {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await browser.tabs.query(queryOptions);
    const url = tab.url;
    if(appendPageTitle) {
        //Get the title of the web page from the tab
        let pageTitle = await getTitleFromTab(tab.id);
        title += ' (' + pageTitle + ')';
    }
    const invalidCharactersRegex = /[^a-zA-Z0-9\-_\s\(\):]/g;
    title = title.replace(invalidCharactersRegex,'_');
    browser.storage.sync.get(["maxTitleLength"], (items) => {
        let maxTitleLength = Number(items.maxTitleLength || '70');
        if (Number.isInteger(maxTitleLength) && maxTitleLength > 0) {
            title = (title.length > maxTitleLength)?title.substring(0,maxTitleLength - 5) + '...)':title;    
        }
    });
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


/* Send the markdown to the Silverbullet endpoint */
function sendCaptureToEndpoint(markdown, title) {
    browser.storage.sync.get(["hostURL", "token", "directory"], (items) => {
        items.directory = (items.directory == null)?'Inbox':items.directory;
        const link = items.hostURL + '/' + items.directory + '/' + encodeURI(title);
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
                browser.runtime.sendMessage({
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
            browser.runtime.sendMessage({
                type: 'api-error',
                target: 'popup'
            });
        });
    });
}
