"use strict";
import { PERSON, LOCATION, ORGANIZATION, CONSUMER_GOOD, WORK_OF_ART } from './entities.js';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
const Mustache = require('mustache');
import 'jquery';
// Import our custom CSS
import '../assets/scss/styles.scss'
// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'
// Load wink-nlp package.
const winkNLP = require( 'wink-nlp' );
// Load english language model — light version.
const model = require( 'wink-eng-lite-web-model' );
var nlpu = require( 'wink-nlp-utils' );

// Variables
    const firebaseConfig = {
        projectId: 'covergedev',
        appId: '1:357303688739:web:545fac01e1f936efc7db96',
        storageBucket: 'covergedev.appspot.com',
        locationId: 'us-central',
        apiKey: 'AIzaSyBFF7-SbqVhFwKo468P-RTdrLrLRzqpHCE',
        authDomain: 'covergedev.firebaseapp.com',
        messagingSenderId: '357303688739',
    };
    var user;
    var signedIn = false;

// Setup
    console.log("popup.js loaded");
    var auth;
    var app;
    document.getElementById("loginbtn").addEventListener('click', function () {login()});

// Initialize Firebase
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        connectAuthEmulator(auth, "http://localhost:9099");
    }
    catch (err){
        console.log("Error in getAuth or initializeApp. " + err.message);
    }

    document.onreadystatechange = () => {
        if (document.readyState === 'complete') {
            console.log("Document ready");

        }
      };

    var entities = new Array(); // global scope

// login - if not logged in then display login div
    onAuthStateChanged(auth, (ruser) => {
        console.log("onAuthStateChanged");
        if (ruser) {
            console.log("User signed in");
            user = ruser;
            signedIn = true;
            document.getElementById("login").style.display = "none";
            document.getElementById("results").style.display = "block";
            processPage();
        } else {
            console.log("User not signed in");
            signedIn = false;
            document.getElementById("login").style.display = "block";
            document.getElementById("results").style.display = "none";
        }
    });

    // logged in then hide the login div and process the page
    if (signedIn){
        processPage();
    }

// main function for processing the page and displaying results
async function processPage(){
    let results = new Array();

    // retrieve page HTML from local storage
    chrome.storage.local.get(['pageHTML'], (result) => {
        if (result){
            console.log("#1. Results retrived from local storage");
//            console.log("--- Page: " + result.pageHTML.pageTitle);

            /** Instantiate winkNLP **/
//            processEntitiesWink(result.pageHTML.pageBody);

            /** Server Call to Google APIs **/
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

function processEntitiesWink(text) {

    // try names with wink nlp utilities
    // let testStr = 'Dr. Sarah Connor M. Tech., PhD. - AI. Mr. John Doe, B. Tech. - CS. Ms. Jane Doe, M. Tech. - CS.';
    // let sentences = nlpu.string.sentences(testStr);
    // sentences.forEach(element => {
    //     let name = nlpu.string.extractPersonsName(element);        
    //     console.log("\nWinkNLP NAME: " + name);
    //     console.log("\nWinkNLP sentence: " + element);
    // });

    // process with wink nlp
    const nlp = winkNLP( model );
    // Obtain "its" helper to extract item properties.
    const its = nlp.its;
    const doc = nlp.readDoc(text);
    console.log("WinkNLP: " + doc.entities().out(its.type));
    // doc.entities()
    //     .each((e) => {
    //       // Extract type of entity using .out() with “its.value”
    //       // as input parameter.
    //       if (e.out(its.type) === 'DATE')
    //         console.log(e.parentSentence().out() + ' => ' + e.out() + ' => ' + e.out(its.type) + "\n");
    //     });
} // End of processEntitiesWink()

function login(){
    console.log("Logging in");
    let email = document.getElementById("email").value;
    console.log("Email: " + email);
    let password = document.getElementById("password").value;
    console.log("Password: " + password);
    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        this.user = userCredential.user;
        document.getElementById("login").style.display = "none";
        document.getElementById("results").style.display = "block";
      })
      .catch((error) => {
        console.log("Sign-in error: " + error.code + " " + error.message); 
      });
} // End of login()

function addListeners(id){
//    console.log("Adding listener for: " + id);
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
//            console.log("Response text: \n" + xhr.responseText);

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
        entity.userId = user.uid;
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