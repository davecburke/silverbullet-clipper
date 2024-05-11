document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["hostURL", "token"], (items) => {
        document.getElementById('hostURL').value = items?.hostURL || '';
        document.getElementById('token').value = items?.token || '';
    });
    const saveButton = document.getElementById("save");
    saveButton.addEventListener("click", () => {
        const hostURL = document.getElementById("hostURL").value;
        const token = document.getElementById("token").value;
        chrome.storage.sync.set({ "hostURL": hostURL, "token": token }, () => {
            console.log("URL and token saved.");
            window.close();
        });
    });
});