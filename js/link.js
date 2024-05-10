chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "displayLink") {
        displayLink(message.data);
    }
});

function displayLink(data) {
    const linkDiv = document.getElementById("linkDiv");
    linkDiv.innerHTML = '<a href="' + data.url + '" target="_blank">' + data.text + '</a>';
}