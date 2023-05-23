"use strict";
const Mustache = require('mustache');
import { Firebase } from 'firebase/app'
import  { jQuery } from 'jquery/dist/jquery.min';
import 'bootstrap/dist/css/bootstrap.min.css';
// const entities = require('./entities.js');

console.log("popup.js loaded");
var entities = new Array();
processPage();

// var entities =  processPage();
// if (entities)
//     console.log("** Entities: " + entities.length);
// else  
//     console.log("** No entities found");

// main function for processing the page and displaying results
async function processPage(){
    let results = new Array();

    // retrieve page HTML from local storage
    chrome.storage.local.get(['pageHTML'], (result) => {
        if (result){
            console.log("#1. Results retrived from local storage");
            console.log("--- Page: " + result.pageHTML.pageTitle);

            // send html to cloud function for NLP processing
            // TODO - Uses a POST with URL paramater request. Need to switch to post as page size is often too large for URL parameters
            results = getPostToFunction(result);
            return results;
        }
        else {
            console.log("--- No results found");
        }
    });// End of chrome.storage.local.get
} // End of processPage()

function addListeners(id){
    console.log("Adding listener for: " + id);
    document.getElementById(id).addEventListener('click', function () {saveEntity(id)});
}

// Sends the page HTML to the cloud function for processing
// Uses a POST request with URL encoded parameters
function getPostToFunction(result) {
    // send html to cloud function for NLP processing
    console.log("#2. Sending results to cloud function");
    let results = new Array();
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:1219/covergedev/us-central1/addmessage?text=" + encodeURIComponent(result.pageHTML.pageBody, true) 
            + "&url=" + encodeURIComponent(result.pageHTML.pageURL, true) 
            + "&title=" + encodeURIComponent(result.pageHTML.pageTitle, true) + "&salience=" + encodeURIComponent("0.001", true), true );
    // register the event handler
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            console.log("--- Response status: " + xhr.status);
            console.log("Response text: \n" + xhr.responseText);

            if (xhr.status == 200) {
                console.log("#4. Results received from cloud functions");
                var resp = JSON.parse(decodeURI(xhr.responseText));
                if (resp.savedEntityList && resp.savedEntityList.length > 0){
                    results = processResponse(resp);
                    return results;
                }
                else {
                    console.log("No results found");
                    document.getElementById('resultsrow').display = "block";
                    document.getElementById("results").innerHTML = "No results found";
                }
            }
        }
    }
    xhr.send();
    console.log("#3. Submitted to cloud functions");
}

// Processes the response from the server
// Returns an array of entities
function processResponse(resp) {
//    let results = new Array();

    // TEMPLATES
    var elementTemplate = '<div class="entityBox"><p class="entityTitle"><a href="{{wikipedia_url}}">{{name}}</a></p><button id="{{id}}" type="button">Save</button></div>';

    console.log("#5. Processing results count: " + resp.savedEntityList.length);

    for (let i = 0; i < resp.savedEntityList.length; i++)
    {
        let element = resp.savedEntityList[i];

        if (element.type == "PERSON"){
            var person = new PERSON();
            person.id = element.id;
            person.name = element.name;
            person.wikipedia_url = element.wikipedia_url;
            person.foundIn = element.foundIn;
            entities.push(person);

            let output = Mustache.render(elementTemplate, element);
            let node = document.createElement('div');
            node.innerHTML = output;
            document.getElementById('people').appendChild(node);
            document.getElementById('peoplerow').display = "block";
            addListeners(person.id);
        }
        else if (element.type == "LOCATION"){
            var location = new LOCATION();
            location.id = element.id;
            location.name = element.name;
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
            entities.push(location);

            let output = Mustache.render(elementTemplate, element);
            let node = document.createElement('div');
            node.innerHTML = output;
            document.getElementById('places').appendChild(node);
            document.getElementById('placesrow').display = "block";
            addListeners(location.id);
        }
        else if (element.type == "ORGANIZATION"){
            var organization = new ORGANIZATION();
            organization.id = element.id;
            organization.name = element.name;
            organization.wikipedia_url = element.wikipedia_url;
            organization.foundIn = element.foundIn;
            entities.push(organization);

            let output = Mustache.render(elementTemplate, element);
            let node = document.createElement('div');
            node.innerHTML = output;
            document.getElementById('organizations').appendChild(node);
            document.getElementById('organizationsrow').display = "block";
            addListeners(organization.id);
        }
        else if (element.type == "CONSUMER_GOOD"){
            var cgood = new CONSUMER_GOOD();
            cgood.id = element.id;
            cgood.name = element.name;
            cgood.wikipedia_url = element.wikipedia_url;
            cgood.foundIn = element.foundIn;
            entities.push(cgood);

            let output = Mustache.render(elementTemplate, element);
            let node = document.createElement('div');
            node.innerHTML = output;
            document.getElementById('cgoods').appendChild(node);
            document.getElementById('cgoodsrow').display = "block";    
            addListeners(cgood.id);                        
        }
        else if (element.type == "WORK_OF_ART"){
            var art = new WORK_OF_ART();
            art.id = element.id;
            art.name = element.name;
            art.wikipedia_url = element.wikipedia_url;
            art.foundIn = element.foundIn;
            entities.push(art);

            let output = Mustache.render(elementTemplate, element);
            let node = document.createElement('div');
            node.innerHTML = output;
            document.getElementById('art').appendChild(node);
            document.getElementById('artrow').display = "block";  
            addListeners(art.id);
        }
    }
    console.log("#6. Processed results count: " + entities.length);
    return;
}

function setFormData (url, body, title, salience) {
    var data = new FormData();
    data.append('url', url);
    data.append('text', body);
    data.append('title', title);
    data.append('salience', salience);
    return data;
}

function saveEntity(id){
    // get the entity from the entities array
    let entity = entities.find(x => x.id === id);
    if (entity){
    console.log("Saving entity: " + entity.name);

    // save entity to firebase
    console.log("#0. Sending post to save entity to firebase");

    var exhr = new XMLHttpRequest();
    exhr.open("POST", "http://127.0.0.1:1219/covergedev/us-central1/saveentity?entity=" + encodeURIComponent(JSON.stringify(entity)));

    // register the event handler
    exhr.onreadystatechange = function() {
        if (exhr.readyState == 4) {
            console.log("--- Response status: " + exhr.status);

            if (exhr.status == 200) {
                console.log("#2. Entity saved.");
                return true;
            }
        }
    }
    exhr.send();
    console.log("#1. Submitted to cloud functions");
    }
    else{
        console.log("Entity not found");
        alert("Entity not found");
    }
} // end of saveEntity()

// sends HTML to cloud function for processing
// Uses a POST request with formData allowing for larger page sizes
// TODO - not working yet!
function postToFunction(result){

    //      START POST
        var http = new XMLHttpRequest();
        var url = 'http://127.0.0.1:1219/covergedev/us-central1/addmessage';
        var data = new setFormData(result.pageHTML.pageURL, result.pageHTML.pageBody, result.pageHTML.pageTitle, "0.001");

        http.open('POST', url, true);
        // TODO - change the register even to async call
        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                console.log(http.responseText);
                var resp = JSON.parse(http.responseText);
                console.log(resp.result);
                if (resp.result){
                    console.log("Response status: " + xhr.status);
                    console.log("Response text: \n" + xhr.responseText);
     
                    if (xhr.status == 200) {
                        var resp = JSON.parse(decodeURI(xhr.responseText));
                        results = processResponse(resp)
                    }    
                }
            }
            else if (http.readyState == 4 && http.status != 200){
                console.log("Error: " + http.status + " " + http.statusText);
            }
        }

        http.send(params);
        console.log("submitted to cloud function");
}

class ENTITY {
    id;
    type;
    foundIn;
    wikipedia_url;

    // Creates a unique ID for the entity based on the wikipedia URL.
    // If there is no wikipedia URL uses GUID generated on the server.
    genereateId () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;

    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash + 2147483647 + 1;
    }

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