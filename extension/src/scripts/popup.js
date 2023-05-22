"use strict";
const Mustache = require('mustache');
import { Firebase } from 'firebase/app'
import  { jQuery } from 'jquery/dist/jquery.min';
import 'bootstrap/dist/css/bootstrap.min.css';

console.log("popup.js loaded");

class ENTITY {
    type;
    foundIn;
}

class PERSON extends ENTITY {
    name;
    wikipedia_url;

    constructor() {
        super();
        this.type = 'PERSON';
    }
}

class LOCATION extends ENTITY {
    name;
    street_number;
    locality;
    street_name;
    postal_code;
    country;
    broad_region; // administrative area, such as the state, if detected
    narrow_region; // smaller administrative area, such as county, if detected
    sublocality; //  used in Asian addresses to demark a district within a city, if detected
    wikipedia_url;

    constructor() {
        super();
        this.type = 'LOCATION';
    }

    isValid() {
        if (this.street_number || this.locality || this.street_name 
         || this.postal_code || this.country || this.broad_region 
         || this.narrow_region || this.sublocality)
            return true;
        else
            return false;
    }
}

class ORGANIZATION extends ENTITY {
    name;
    wikipedia_url;

    constructor() {
        super();
        this.type = 'ORGANIZATION';
    }
}

class CONSUMER_GOOD extends ENTITY {
    name;
    wikipedia_url;

    constructor() {
        super();
        this.type = 'CONSUMER_GOOD';
    }
}

class WORK_OF_ART extends ENTITY {
    name;
    wikipedia_url;

    constructor() {
        super();
        this.type = 'WORK_OF_ART';
    }
}

var results = new Array();

// TEMPLATES
var elementTemplate = '<div class="entityBox"><p class="entityTitle"><a href="{{wikipedia_url}}">{{name}}</a></p></div>';

chrome.storage.local.get(['pageHTML'], (result) => {
    if (result){
        console.log(result);
        console.log(result.pageHTML.pageTitle);
        console.log("Results retrived from local storage")
        // document.getElementById("purl").value = result.pageHTML.pageURL;
        // document.getElementById("ptitle").value = result.pageHTML.pageTitle;
        // document.getElementById("pbody").value = result.pageHTML.pageBody;

        // START POST
//         var http = new XMLHttpRequest();

//         // Turn the data object into an array of URL-encoded key/value pairs.
//         var params = "?url=" + encodeURIComponent(result.pageHTML.pageURL) 
//                     + "&text=" + encodeURIComponent(result.pageHTML.pageBody) 
//                     + "&title=" + encodeURIComponent(result.pageHTML.pageTitle) 
// //                    + "&salience=" + encodeURIComponent("0.001");

//         var url = 'http://127.0.0.1:1219/covergedev/us-central1/addmessage' + params;
// //        var data = new setParametersURLEncoded(result.pageHTML.pageURL, result.pageHTML.pageBody, result.pageHTML.pageTitle, "0.001");

//         // // List key/value pairs
//         // for(let [name, value] of data) {
//         //     console.log(`${name} = ${value}`);
//         // }

//         http.open('GET', url, true);
//         //        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');        
//         http.onreadystatechange = function() {
//         //Call a function when the state changes.
//             if(http.readyState == 4 && http.status == 200) {
//                 console.log(http.responseText);
//                 var resp = JSON.parse(http.responseText);
//                 console.log(resp.result);
//                 if (resp.result){
//                     console.log(resp.result);
//                     // array.forEach(element => {
                        
//                     // });
//                     document.getElementById("purl").innerHTML = JSON.stringify(resp.result);
//                 }
//             }
//             else if (http.readyState == 4 && http.status != 200){
//                 console.log("Error: " + http.status + " " + http.statusText);
//             }
//         }

//         http.send(params);
//         console.log("submitted to cloud functions");

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:1219/covergedev/us-central1/addmessage?text=" + encodeURIComponent(result.pageHTML.pageBody, true) 
                + "&url=" + encodeURIComponent(result.pageHTML.pageURL, true) 
                + "&title=" + encodeURIComponent(result.pageHTML.pageTitle, true) + "&salience=" + encodeURIComponent("0.001", true), true );
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                console.log("Response status: " + xhr.status);
                console.log("Response text: \n" + xhr.responseText);
 
                if (xhr.status == 200) {
                    var resp = JSON.parse(decodeURI(xhr.responseText));
                    console.log("Result size: " + resp.savedEntityList.length)
                    for (let i = 0; i < resp.savedEntityList.length; i++)
                    {
                        let element = resp.savedEntityList[i];
//                        console.log(JSON.stringify(element));

                        if (element.type == "PERSON"){
                            var person = new PERSON();
                            person.name = element.name;
                            person.wikipedia_url = element.wikipedia_url;
                            person.foundIn = element.foundIn;
                            results.push(person);

//                            console.log(JSON.stringify(element));
//                            document.getElementById("results").innerHTML = JSON.stringify(element);

                            let output = Mustache.render(elementTemplate, element);
                            let node = document.createElement('div');
                            node.innerHTML = output;
                            document.getElementById('people').appendChild(node);

                        }
                        else if (element.type == "LOCATION"){
                            var location = new LOCATION();
                            location.street_number = element.street_number;
                            location.locality = element.locality;
                            location.street_name = element.street_name;
                            location.postal_code = element.postal_code;
                            location.country = element.country;
                            location.broad_region = element.broad_region;
                            location.narrow_region = element.narrow_region;
                            location.sublocality = element.sublocality;
                            location.wikipedia_url = element.wikipedia_url;
                            location.foundIn = element.foundIn;
                            results.push(location);

                            let output = Mustache.render(elementTemplate, element);
                            let node = document.createElement('div');
                            node.innerHTML = output;
                            document.getElementById('places').appendChild(node);
                        }
                        else if (element.type == "ORGANIZATION"){
                            var organization = new ORGANIZATION();
                            organization.name = element.name;
                            organization.wikipedia_url = element.wikipedia_url;
                            organization.foundIn = element.foundIn;
                            results.push(organization);

//                            console.log(JSON.stringify(element));

                            let output = Mustache.render(elementTemplate, element);
                            let node = document.createElement('div');
                            node.innerHTML = output;
                            document.getElementById('organizations').appendChild(node);
                        }
                        else if (element.type == "CONSUMER_GOOD"){
                            var cgood = new CONSUMER_GOOD();
                            cgood.name = element.name;
                            cgood.wikipedia_url = element.wikipedia_url;
                            cgood.foundIn = element.foundIn;
                            results.push(cgood);

//                            console.log(JSON.stringify(element));

                            let output = Mustache.render(elementTemplate, element);
                            let node = document.createElement('div');
                            node.innerHTML = output;
                            document.getElementById('cgoods').appendChild(node);                            
                        }
                        else if (element.type == "WORK_OF_ART"){
                            var art = new WORK_OF_ART();
                            art.name = element.name;
                            art.wikipedia_url = element.wikipedia_url;
                            art.foundIn = element.foundIn;
                            results.push(art);

                            let output = Mustache.render(elementTemplate, element);
                            let node = document.createElement('div');
                            node.innerHTML = output;
                            document.getElementById('art').appendChild(node);   
                        }
                    }
                }
            }
        }
        xhr.send();
        console.log("submitted to cloud functions");
    }
    else {
        console.log("No results found");
    }
});

function setParametersURLEncoded (url, body, title, salience) {
    var data = new FormData();
    data.append('url', url);
    data.append('text', body);
    data.append('title', title);
    data.append('salience', salience);
    return data;
}