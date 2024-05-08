chrome.runtime.onMessage.addListener(handleMessages);
async function handleMessages(message) {
    if (message.target !== 'offscreen') {
        return false;
    }
    switch (message.type) {
        case 'convert-to-markdown':
            convertToMarkdown(message.data,message.url);
            break;
        default:
        console.warn(`Unexpected message type received: '${message.type}'.`);
        return false;
    }
}

function convertToMarkdown(htmlString, url) {
    var turndownService = new TurndownService();
    var markdown;
    if(htmlString != null) {
        markdown = turndownService.turndown(htmlString + '<p>source: <a href="' + url + '" target="_blank">' + url + '</a></p>');
    } else {
        markdown = url
    }
    sendToBackground(
        'convert-to-markdown-result',
        markdown
    );
}

function sendToBackground(type, data) {
    chrome.runtime.sendMessage({
        type,
        target: 'background',
        data
    });
}