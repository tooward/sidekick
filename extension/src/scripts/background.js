chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request);
        console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");

        chrome.storage.local.set({ 'pageHTML' : request }, () => {
            if (chrome.runtime.lastError)
                console.log("Error saving results to local storage");
            else
                console.log("Results saved to local storage");
        });
    }
  );