"use strict";
import { PERSON, LOCATION, ORGANIZATION, CONSUMER_GOOD, WORK_OF_ART } from './entities.js';
const Mustache = require('mustache');
import 'jquery';
// Import our custom CSS
import '../assets/scss/styles.scss'
// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

console.log("popup.js loaded");
var entities = new Array(); // global scope
processPage();

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

    // TEMPLATES
    var elementTemplate = '<div class="entityBox"><p class="entityTitle"><img src="./assets/images/{{type}}.svg" class="card-image"/><a href="{{wikipedia_url}}" target=”_blank”>{{name}}</a></p><button id="{{id}}" type="button" class="btn btn-primary">Save</button></div>';

    console.log("#5. Processing results count: " + resp.savedEntityList.length);

    for (let i = 0; i < resp.savedEntityList.length; i++)
    {
        let element = resp.savedEntityList[i];

        if (element.type == "PERSON"){
            var person = new PERSON();
            person.genericToClass(element);
            entities.push(person);

            let output = Mustache.render(elementTemplate, element);
            let node = document.createElement('div');
            node.innerHTML = output;
            document.getElementById('people').appendChild(node);
            addListeners(person.id);
        }
        else if (element.type == "LOCATION"){
            var location = new LOCATION();
            location.genericToClass(element);
            entities.push(location);

            let output = Mustache.render(elementTemplate, element);
            let node = document.createElement('div');
            node.innerHTML = output;
            document.getElementById('places').appendChild(node);
            addListeners(location.id);
        }
        else if (element.type == "ORGANIZATION"){
            var organization = new ORGANIZATION();
            organization.genericToClass(element);
            entities.push(organization);

            let output = Mustache.render(elementTemplate, element);
            let node = document.createElement('div');
            node.innerHTML = output;
            document.getElementById('organizations').appendChild(node);
            addListeners(organization.id);
        }
        else if (element.type == "CONSUMER_GOOD"){
            var cgood = new CONSUMER_GOOD();
            cgood.genericToClass(element);
            entities.push(cgood);

            let output = Mustache.render(elementTemplate, element);
            let node = document.createElement('div');
            node.innerHTML = output;
            document.getElementById('cgoods').appendChild(node);
            addListeners(cgood.id);                        
        }
        else if (element.type == "WORK_OF_ART"){
            var art = new WORK_OF_ART();
            art.genericToClass(element);
            entities.push(art);

            let output = Mustache.render(elementTemplate, element);
            let node = document.createElement('div');
            node.innerHTML = output;
            document.getElementById('art').appendChild(node);
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
    if (entity) {
        console.log("Saving entity: " + entity.name);
        console.log("Entity data: " + JSON.stringify(entity));

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
} // end of postToFunction()