document.addEventListener("DOMContentLoaded", () => {
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