// chrome.runtime.onMessage.addListener(handleMessages);
// async function handleMessages(message) {
//     if (message.target !== 'popup') {
//         return false;
//     }
//     switch (message.type) {
//         case 'configure':
//             convertToMarkdown(message.data,message.url);
//             break;
//         default:
//         console.warn(`Unexpected message type received: '${message.type}'.`);
//         return false;
//     }
// }

document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("save");
    saveButton.addEventListener("click", () => {
        const hostURL = document.getElementById("hostURL").value;
        const token = document.getElementById("token").value;
        chrome.storage.sync.set({ "hostURL": hostURL, "token": token }, () => {
            hideConfigure();
            showCapture();
        });
    });
    
    const captureButton = document.getElementById("capture");
    captureButton.addEventListener("click", () => {
        sendToBackground('capture');
    });

    const closeButton = document.getElementById("close");
    closeButton.addEventListener("click", () => {
        hideConfigure();
        showCapture();
    });

    const configureButton = document.getElementById("configure");
    configureButton.addEventListener("click", () => {
        hideCapture();
        showConfigure();
    });
    displayTitle();
});

function showConfigure() {
    var configure = document.getElementById("articleConfigure");
    if (configure.classList.contains("hidden")) {
        configure.classList.remove("hidden");
    }
    chrome.storage.sync.get(["hostURL", "token"], (items) => {
        document.getElementById('hostURL').value = items?.hostURL || '';
        document.getElementById('token').value = items?.token || '';
    });
}

function hideConfigure() {
    var configure = document.getElementById("articleConfigure");
    if (!configure.classList.contains("hidden")) {
        configure.classList.add("hidden");
    }
}

function showCapture() {
    var capture = document.getElementById("articleCapture");
    if (capture.classList.contains("hidden")) {
        capture.classList.remove("hidden");
    }
}

function hideCapture() {
    var capture = document.getElementById("articleCapture");
    if (!capture.classList.contains("hidden")) {
        capture.classList.add("hidden");
    }
}

function displayTitle() {
    document.getElementById('title').value = getDatetimeStamp(new Date());
}

function getDatetimeStamp(datetime) {
    return datetime.getFullYear().toString() + '-' + (datetime.getMonth() + 1).toString().padStart(2,'0') + '-' + datetime.getDate().toString().padStart(2,'0') + ' ' + datetime.getHours().toString().padStart(2,'0') + ":" + datetime.getMinutes().toString().padStart(2,'0') + ':' + datetime.getSeconds().toString().padStart(2,'0');
}

function sendToBackground(type, data) {
    chrome.runtime.sendMessage({
        type,
        target: 'background'
    });
}