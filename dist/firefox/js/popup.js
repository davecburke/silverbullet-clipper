/* Listener for the popup */
browser.runtime.onMessage.addListener(handleMessages);
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
        browser.storage.sync.set({ "hostURL": hostURL, "token": token }, () => {
            hideConfigure();
            showCapture();
        });
    });
    //Capture button event
    const captureButton = document.getElementById("capture");
    captureButton.addEventListener("click", () => {
        const linkSpan = document.getElementById("link");
        linkSpan.textContent = '';
        const title = document.getElementById("title").value;
        const tags = document.getElementById("tags").value;
        let data = {'title': title, 'tags': tags};
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
    browser.storage.sync.get(["hostURL", "token"]).then(items => {
        if(items === null || items.hostURL === null || items.hostURL === '' || items.token === null || items.token === '') {
            hideCapture();
            showConfigure();
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
    browser.storage.sync.get(["hostURL", "token"], (items) => {
        document.getElementById('hostURL').value = items?.hostURL || '';
        document.getElementById('token').value = items?.token || '';
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
    browser.runtime.sendMessage({
        type,
        target: 'service-worker',
        data
    });
}