(async () => {

    // if (jQuery) {  
    //     console.log("jQuery loaded");
    // } else {
    //     console.log("jQuery not loaded");
    // }

    console.log("Document Title: " + document.title);
    // const $ = jQuery;
    // console.log("jQuery Version: " + $.fn.jquery);
//    $('html').find("script, style, meta, link, ifram, svg").remove();
    // let results = $.root.html;

    const body = document.body.innerText;
    const response = await chrome.runtime.sendMessage({pageTitle: document.title, pageBody: body, pageURL: document.URL});
    if (response) {
        console.log(response);
    }

})();
