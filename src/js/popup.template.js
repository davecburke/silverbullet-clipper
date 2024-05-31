/* Listener for the popup */
<%= runTime %>.runtime.onMessage.addListener(handleMessages);
async function handleMessages(message) {
    if (message.target !== 'popup') {
        return false;
    }
    const linkSpan = document.getElementById("link");
    switch (message.type) {
        case 'link':
            //Display the link to the new Quick Note
            var link = document.createElement('a');
            link.href = message.url;
            link.textContent = 'Go to Quick Note';
            link.target = '_blank'; // This opens the link in a new tab
            linkSpan.appendChild(link);
            break;
        case 'api-error':
            //Display the error
            linkSpan.textContent = 'Unable to send capture to SilverBullet. Please check your configuration.';
            break;    
        default:
        console.warn(`Unexpected message type received: '${message.type}'.`);
        return false;
    }
}

/* On document load */
document.addEventListener("DOMContentLoaded", () => {
    //Credentials save button event
    const saveButton = document.getElementById("save");
    saveButton.addEventListener("click", () => {
        const hostURL = document.getElementById("hostURL").value;
        const token = document.getElementById("token").value;
        const directory = document.getElementById('directory').value;
        const appendPageTitleDefault = document.getElementById('append-page-title-default').checked;
        <%= runTime %>.storage.sync.set({ "hostURL": hostURL, "token": token, "directory": directory, "appendPageTitleDefault": appendPageTitleDefault }, () => {
            hideConfigure();
            showCapture();
            document.getElementById('append-page-title').checked = appendPageTitleDefault;
        });
    });
    //Capture button event
    const captureButton = document.getElementById("capture");
    captureButton.addEventListener("click", () => {
        const linkSpan = document.getElementById("link");
        linkSpan.textContent = '';
        const title = document.getElementById("title").value;
        const tags = document.getElementById("tags").value;
        const appendPageTitle = document.getElementById('append-page-title').checked;
        let data = {'title': title, 'tags': tags, 'appendPageTitle': appendPageTitle};
        //Tell the service worker to capture the tab
        sendToServiceWorker('capture',data);
    });
    //Credentials close button event
    const closeButton = document.getElementById("close");
    closeButton.addEventListener("click", () => {
        hideConfigure();
        showCapture();
    });
    //Configure button event
    const configureButton = document.getElementById("configure");
    configureButton.addEventListener("click", () => {
        hideCapture();
        showConfigure();
    });
    displayTitle();
    //Prompt to provide credentials if they are missing
    <%= runTime %>.storage.sync.get(["hostURL", "token", "directory", "appendPageTitleDefault"]).then(items => {
        if(items === null || items.hostURL === null || items.hostURL === '' 
            || items.token === null || items.token === '' 
            || items.directory === null || items.directory === '') 
        {
            hideCapture();
            showConfigure();
        } else if(items !== null && items.appendPageTitleDefault !== null && items.appendPageTitleDefault) {
            document.getElementById('append-page-title').checked = items.appendPageTitleDefault;
        }
    }).catch(error => {
        console.error('Error retrieving storage:', error);
    });
});

/* Show the configure article */
function showConfigure() {
    var configure = document.getElementById("articleConfigure");
    if (configure.classList.contains("hidden")) {
        configure.classList.remove("hidden");
    }
    //Get the hostURL and token from storage
    <%= runTime %>.storage.sync.get(["hostURL", "token", "directory", "appendPageTitleDefault"], (items) => {
        document.getElementById('hostURL').value = items?.hostURL || '';
        document.getElementById('token').value = items?.token || '';
        document.getElementById('directory').value = items.directory || 'Inbox';
        document.getElementById('append-page-title-default').checked = items.appendPageTitleDefault;
    });
}

/* Hide the configure article */
function hideConfigure() {
    var configure = document.getElementById("articleConfigure");
    if (!configure.classList.contains("hidden")) {
        configure.classList.add("hidden");
    }
}

/* Show the capture article */
function showCapture() {
    var capture = document.getElementById("articleCapture");
    if (capture.classList.contains("hidden")) {
        capture.classList.remove("hidden");
    }
}

/* Hide the capture article */
function hideCapture() {
    var capture = document.getElementById("articleCapture");
    if (!capture.classList.contains("hidden")) {
        capture.classList.add("hidden");
    }
}

/* Display the default timestamp title */
function displayTitle() {
    document.getElementById('title').value = getDatetimeStamp(new Date());
}

/* Get the current timestamp */
function getDatetimeStamp(datetime) {
    return datetime.getFullYear().toString() + '-' + (datetime.getMonth() + 1).toString().padStart(2,'0') + '-' + datetime.getDate().toString().padStart(2,'0') + ' ' + datetime.getHours().toString().padStart(2,'0') + ":" + datetime.getMinutes().toString().padStart(2,'0') + ':' + datetime.getSeconds().toString().padStart(2,'0');
}

/* Send a message to the service worker */
function sendToServiceWorker(type, data) {
    <%= runTime %>.runtime.sendMessage({
        type,
        target: 'service-worker',
        data
    });
}
