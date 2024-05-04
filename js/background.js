chrome.action.onClicked.addListener(async (tab) => {
    const url = tab.url;
    const text = await getTextFromSelection(tab.id);
    sendDataToAPI(url,text);
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

function sendDataToAPI(url, text) {
    // Make a request to your API endpoint
    const markdownText = `
    # My Markdown Document

    This is **bold** and *italic* text.

    - List item 1
    - List item 2
    - List item 3
    `;
    const endpoint = 'https://sbtest.burke.chat/Inbox/' + encodeURIComponent(getDatetimeStamp(new Date()))  + '.md';
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'text/markdown',
            'Authorization': 'Bearer 1234'
        },
        body: markdownText,
    };
    fetch(endpoint, requestOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    })
    .then(data => {
        console.log('Response:', data);
    })
    .catch(error => {
        console.log('Error sending data to API:', error);
    });
}

function getDatetimeStamp(datetime) {
    return datetime.getFullYear().toString() + '-' + (datetime.getMonth() + 1).toString().padStart(2,'0') + '-' + datetime.getDate().toString().padStart(2,'0') + ' ' + datetime.getHours().toString().padStart(2,'0') + ":" + datetime.getMinutes().toString().padStart(2,'0') + ':' + datetime.getSeconds().toString().padStart(2,'0');
}
