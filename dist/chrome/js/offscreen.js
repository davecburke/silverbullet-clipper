import TurndownService from './turndown.js';
/* Listener for offscreen */
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

/* Uses TurndownService to create markdown from a HTML string and user entered tags */
function convertToMarkdown(htmlString, url, title, tags) {
    var turndownService = new TurndownService();
    var markdown;
    var tagsMarkdown = '';
    //Format tags if there are any
    if(tags != null && tags != '') {
        tagsMarkdown = '<p>';
        tags.split(' ').forEach((item) => {
            if(item.startsWith('#')) { //Cater for tags that may already have a leading #
                tagsMarkdown += item + ' ';
            } else { //If there is no leading # then add one
                tagsMarkdown += '#' + item + ' ';
            }
        });
        tagsMarkdown += '</p>'
    }
    if(htmlString != null) { //If there is HTML then create the markdown using the tags and creating a line for the source URL of the capture
        markdown = turndownService.turndown(tagsMarkdown + htmlString + '<p>source: urlPlaceholder</p>');
    } else { //If there is no HTML then just capture the tab URL and any tags
        markdown = turndownService.turndown(tagsMarkdown + '<p>urlPlaceholder</p>');
    }
    //The turndown service escapes any markdown characters in the URL and breaks the link so add the url after markdown coversion
    markdown = markdown.replace("urlPlaceholder", url)
    //Send the markdown to the service worker
    sendToServiceWorker(
        'convert-to-markdown-result',
        markdown,
        title
    );
}

/* Sends markdown and title to the service worker */
function sendToServiceWorker(type, data, title) {
    chrome.runtime.sendMessage({
        type,
        target: 'service-worker',
        data,
        title
    });
}