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
    fetch('https://sbtest.burke.chat/Inbox/test24.md', {
        method: 'PUT',
        headers: {
            'Content-Type': 'text/markdown',
            'Authorization': 'Bearer 1234'
        },
        body: markdownText,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    })
    .then(data => {
        throw new Error(data)
        console.log('Response from API:', data);
    })
    .catch(error => {
        console.error('Error sending data to API:', error);
    });
}
