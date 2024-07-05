<% if (taskName === 'chrome') { %>const OFFSCREEN_DOCUMENT_PATH = '/html/offscreen.html';<% } %>
/* Get the selected text from the tab */
<% if (taskName === 'chrome') { %>async function getTextFromSelection(tabId) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: () => {
                function makeUrlsAbsolute(html, baseUrl) {
                    const div = document.createElement('div');
                    div.innerHTML = html;
                    const baseElement = document.createElement('base');
                    baseElement.href = baseUrl;
                    div.prepend(baseElement);

                    const elements = div.querySelectorAll('[src], [href]');
                    elements.forEach((el) => {
                        if (el.hasAttribute('href')) {
                            el.href = new URL(el.getAttribute('href'), baseUrl).href;
                        }
                        if (el.hasAttribute('src')) {
                            el.src = new URL(el.getAttribute('src'), baseUrl).href;
                        }
                    });

                    baseElement.remove();
                    return div.innerHTML;
                }

                try {
                    const selection = window.getSelection();
                    if (!selection.rangeCount) {
                        throw new Error('No selection range found');
                    }
                    const range = selection.getRangeAt(0);
                    const div = document.createElement('div');
                    div.appendChild(range.cloneContents());
                    const html = div.innerHTML;
                    const absoluteHtml = makeUrlsAbsolute(html, document.location.href);
                    return absoluteHtml;
                } catch (error) {
                    console.error('Error getting selection:', error);
                    return null;
                }
            }
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error('Script execution error:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else if (results && results[0] && results[0].result) {
                resolve(results[0].result);
            } else {
                console.warn('No result returned from script execution');
                resolve(null);
            }
        });
    });
}

/* Get the title of the web page from the tab */
async function getTitleFromTab(tabId) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                func: () => document.title
            },
            (results) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(results[0].result);
                }
            }
        );
    });
}

/* Use an offscreen document to parse the captured DOM */
async function sendMessageToOffscreenDocument(type, data, url, title, tags, saveMetadataAsFrontmatter) {
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
        tags,
        saveMetadataAsFrontmatter
    });
}<% } %><% if (taskName === 'firefox') { %>async function getTextFromSelection(tabId) {
    return new Promise((resolve, reject) => {
        browser.tabs.executeScript(tabId, {
            code: `
                function makeUrlsAbsolute(html, baseUrl) {
                    var div = document.createElement('div');
                    div.innerHTML = html;

                    var baseElement = document.createElement('base');
                    baseElement.href = baseUrl;
                    div.prepend(baseElement);

                    // Resolve relative URLs to absolute URLs
                    var elements = div.querySelectorAll('[src], [href]');
                    elements.forEach(function(el) {
                        if (el.hasAttribute('href')) {
                            el.href = new URL(el.getAttribute('href'), baseUrl).href;
                        }
                        if (el.hasAttribute('src')) {
                            el.src = new URL(el.getAttribute('src'), baseUrl).href;
                        }
                    });

                    baseElement.remove(); // Remove the base element after processing
                    return div.innerHTML;
                }

                var selection = window.getSelection();
                var absoluteHtml;

                if (selection.rangeCount > 0) {
                    var range = selection.getRangeAt(0);
                    var div = document.createElement('div');
                    div.appendChild(range.cloneContents());
                    var html = div.innerHTML;

                    // Process text with makeUrlsAbsolute
                    absoluteHtml = makeUrlsAbsolute(html, document.location.href);
                } else {
                    // If no text is selected, return null
                    absoluteHtml = null;
                }

                // Return the processed HTML with absolute URLs or null if no text selected
                absoluteHtml;
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
function sendMessageToOffscreenDocument(type, data, url, title, tags, saveMetadataAsFrontmatter) {
    browser.runtime.sendMessage({
        type,
        target: 'offscreen',
        data,
        url,
        title,
        tags,
        saveMetadataAsFrontmatter
    });
}
<% } %>


/* Listener for service worker */
<%= runTime %>.runtime.onMessage.addListener(handleMessages);
async function handleMessages(message) {
    if (message.target !== 'service-worker') {
        return;
    }
    switch (message.type) {
        case 'convert-to-markdown-result':
            //Send the markdown via the API
            sendCaptureToEndpoint(message.data, message.title);
            <% if (taskName === 'chrome') { %>closeOffscreenDocument();<% } %>
            break;
        case 'capture':
            //Capture the user selection
            captureTab(message.data.title, message.data.tags, message.data.appendPageTitle, message.data.saveMetadataAsFrontmatter);
            break;            
        default:
        console.warn(`Unexpected message type received: '${message.type}'.`);
    }
}

/* Capture the the tab URL and any selected HTML */
async function captureTab(title, tags, appendPageTitle, saveMetadataAsFrontmatter) {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await <%= runTime %>.tabs.query(queryOptions);
    const url = tab.url;
    if(appendPageTitle) {
        //Get the title of the web page from the tab
        let pageTitle = await getTitleFromTab(tab.id);
        title += ' (' + pageTitle + ')';
    }
    const invalidCharactersRegex = /[^a-zA-Z0-9\-_\s\(\):]/g;
    title = title.replace(invalidCharactersRegex,'_');
    <%= runTime %>.storage.sync.get(["maxTitleLength"], (items) => {
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
            tags,
            saveMetadataAsFrontmatter
        );
}

<% if (taskName === 'chrome') { %>
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
<% } %>
/* Send the markdown to the Silverbullet endpoint */
function sendCaptureToEndpoint(markdown, title) {
    <%= runTime %>.storage.sync.get(["hostURL", "token", "directory"], (items) => {
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
                <%= runTime %>.runtime.sendMessage({
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
            <%= runTime %>.runtime.sendMessage({
                type: 'api-error',
                target: 'popup'
            });
        });
    });
}