import TurndownService from './turndown.js';
/* Listener for offscreen */
browser.runtime.onMessage.addListener(handleMessages);
async function handleMessages(message) {
    if (message.target !== 'offscreen') {
        return false;
    }
    switch (message.type) {
        case 'convert-to-markdown':
            convertToMarkdown(message.data, message.url, message.title, message.pageTitle, message.tags, message.saveMetadataAsFrontmatter, message.sourceTitle);
            break;
        default:
        console.warn(`Unexpected message type received: '${message.type}'.`);
        return false;
    }
}

/* Uses TurndownService to create markdown from a HTML string and user entered tags */
function convertToMarkdown(htmlString, url, title, pageTitle, tags, saveMetadataAsFrontmatter, sourceTitle) {
    var turndownService = new TurndownService();
    var markdown;
    var tagsMarkdown = '';
    var frontmatter = '';
    if(saveMetadataAsFrontmatter) {
        frontmatter = '---\n';
        frontmatter += 'source-title: ' + sanitizeYamlString(sourceTitle) + '\n';
        frontmatter += 'source-page-title: ' + sanitizeYamlString(pageTitle) + '\n';
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
    let markdownText = (saveMetadataAsFrontmatter ? '' : tagsMarkdown);
    if (htmlString != null) { //If there is HTML then create the markdown using the tags and creating a line for the source URL of the capture
        markdownText += htmlString;
    }
    markdown = turndownService.turndown(markdownText + '<p>title: pageTitlePlaceHolder<br>source: urlPlaceholder</p>');
    //The turndown service escapes any markdown characters in the URL and breaks the link so add the url after markdown coversion
    markdown = markdown.replace("urlPlaceholder", url);
    markdown = markdown.replace("pageTitlePlaceHolder", pageTitle);
    markdown = fixMarkdownImageUrls(markdown);
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

function fixMarkdownImageUrls(markdown) {
    // Matches: ![alt](url "optional title")
    // - Group 1: alt text
    // - Group 2: the raw URL (http/https), without surrounding <>.
    // - Group 3: optional title part (incl. leading whitespace)
    const imgRegex = /!\[([^\]]*)\]\(\s*<?(https?:\/\/[^)\s>]+)>?(\s+(?:"[^"]*"|'[^']*'|\([^)]+\)))?\s*\)/g;

    return markdown.replace(imgRegex, (match, alt, url, titlePart = '') => {
        // If URL already ends with a known image extension (before ? or #), leave it.
        if (/\.(jpg|jpeg|png|gif|webp|svg|avif)(?=[$?#])/i.test(url) || /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url)) {
            return match;
        }
        // Append .jpg before any query/hash
        const fixedUrl = url.replace(/(?=(\?|#|$))/, '.jpg');
        return `![${alt}](${fixedUrl}${titlePart || ''})`;
    });
}



/* Get the current date stamp */
function getDateStamp(date) {
    return date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString().padStart(2,'0') + '-' + date.getDate().toString().padStart(2,'0');
}

/* Sends markdown and title to the service worker */
function sendToServiceWorker(type, data, title) {
    browser.runtime.sendMessage({
        type,
        target: 'service-worker',
        data,
        title
    });
}

function sanitizeYamlString(string) {
    const specialChars = [':', '-', '?', '{', '}', '[', ']', ',', '#', '&', '*', '!', '|', '>', "'", '"', '%', '@', '`'];
    
    // Check if the string contains any special YAML characters
    if (specialChars.some(char => string.includes(char))) {
        // Use double quotes if the string contains single quotes
        if (string.includes("'")) {
            return `"${string}"`;
        }
        // Otherwise, use single quotes
        return `'${string}'`;
    }
    return string;
}
