(async () => {
    console.log("Document Title: " + document.title);
    const body = document.body.innerText;
    const response = await chrome.runtime.sendMessage({pageTitle: document.title, pageBody: body, pageURL: document.URL});
    if (response) {
        console.log(response);
    }
})();
