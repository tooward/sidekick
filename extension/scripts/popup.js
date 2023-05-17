console.log("popup.js loaded");

chrome.storage.local.get(['pageHTML'], (result) => {
    if (result){
        console.log(result);
        console.log(result.pageHTML.pageTitle); 
        console.log("Results retrived from to local storage")
        document.getElementById("purl").innerHTML = result.pageHTML.pageURL;
        document.getElementById("pbody").innerHTML = result.pageHTML.pageBody;

        var data = new FormData();
        data.append('page', result.pageHTML.pageTitle);

        // var xhr = new XMLHttpRequest();
        // xhr.open('POST', 'http://127.0.0.1:1219/covergedev/us-central1/addmessage', true);
        // xhr.onload = function () {
        //     // do something to response
        //     console.log(this.responseText);
        // };
        // xhr.send(data);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:1219/covergedev/us-central1/addmessage?text=" + encodeURIComponent(result.pageHTML.pageBody, true));
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                // JSON.parse does not evaluate the attacker's scripts.
                var resp = JSON.parse(xhr.responseText);
                console.log(resp);
                console.log("submitted to cloud functions");
            }
        }
        xhr.send();
    }
    else {
        console.log("No results found");
    }
});