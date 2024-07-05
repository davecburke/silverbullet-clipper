import TurndownService from './turndown.js';
/* Listener for offscreen */
chrome.runtime.onMessage.addListener(handleMessages);
async function handleMessages(message) {
    if (message.target !== 'offscreen') {
        return false;
    }
    switch (message.type) {
        case 'convert-to-markdown':
            convertToMarkdown(message.data, message.url, message.title, message.tags, message.saveMetadataAsFrontmatter);
            break;
        default:
        console.warn(`Unexpected message type received: '${message.type}'.`);
        return false;
    }
}

/* Uses TurndownService to create markdown from a HTML string and user entered tags */
function convertToMarkdown(htmlString, url, title, tags, saveMetadataAsFrontmatter) {
    var turndownService = new TurndownService();
    var markdown;
    var tagsMarkdown = '';
    var frontmatter = '';
    if(saveMetadataAsFrontmatter) {
        frontmatter = '---\n';
        frontmatter += 'source-title: ' + title.replaceAll(':','-') + '\n';
        frontmatter += 'source-url: ' + url + '\n';
        frontmatter += 'created-date: ' +  getDateStamp(new Date());
    }
    //Format tags if there are any
    if(tags != null && tags != '') {
        if(saveMetadataAsFrontmatter) {
            frontmatter += '\ntags:';
            tags.split(' ').forEach((item) => {
                // if(item.startsWith('#')) { //Cater for tags that may already have a leading #
                    frontmatter += '\n- ' + item.replace('#','');
                // } else {
                    // frontmatter += '\n- ' + item.replace('#','');
                // }
            });
        } else {
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
    }
    if(htmlString != null) { //If there is HTML then create the markdown using the tags and creating a line for the source URL of the capture
        markdown = turndownService.turndown(((saveMetadataAsFrontmatter)?'':tagsMarkdown) + htmlString + '<p>source: urlPlaceholder</p>');
    } else { //If there is no HTML then just capture the tab URL and any tags
        markdown = turndownService.turndown(((saveMetadataAsFrontmatter)?'':tagsMarkdown) + '<p>urlPlaceholder</p>');
    }
    //The turndown service escapes any markdown characters in the URL and breaks the link so add the url after markdown coversion
    markdown = markdown.replace("urlPlaceholder", url);
    //Add frontmatter if wanted
    if(saveMetadataAsFrontmatter) {
        markdown = frontmatter + '\n' + '---' + '\n\n' + markdown;
    }
    //Send the markdown to the service worker
    sendToServiceWorker(
        'convert-to-markdown-result',
        markdown,
        title
    );
}

/* Get the current date stamp */
function getDateStamp(date) {
    return date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString().padStart(2,'0') + '-' + date.getDate().toString().padStart(2,'0');
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