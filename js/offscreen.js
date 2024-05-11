chrome.runtime.onMessage.addListener(handleMessages);
async function handleMessages(message) {
    if (message.target !== 'offscreen') {
        return false;
    }
    switch (message.type) {
        case 'convert-to-markdown':
            convertToMarkdown(message.data, message.url, message.title, message.tags);
            break;
        default:
        console.warn(`Unexpected message type received: '${message.type}'.`);
        return false;
    }
}

function convertToMarkdown(htmlString, url, title, tags) {
    var turndownService = new TurndownService();
    var markdown;
    var tagsMarkdown = '';
    if(tags != null && tags != '') {
        tagsMarkdown = '<p>';
        tags.split(' ').forEach((item) => {
            if(item.startsWith('#')) {
                tagsMarkdown += item + ' ';
            } else {
                tagsMarkdown += '#' + item + ' ';
            }
        });
        tagsMarkdown += '</p>'
    }
    if(htmlString != null) {
        markdown = turndownService.turndown(tagsMarkdown + htmlString + '<p>source: <a href="' + url + '" target="_blank">' + url + '</a></p>');
    } else {
        markdown = url
    }
    sendToBackground(
        'convert-to-markdown-result',
        markdown,
        title
    );
}

function sendToBackground(type, data, title) {
    chrome.runtime.sendMessage({
        type,
        target: 'service-worker',
        data,
        title
    });
}