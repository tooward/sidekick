/*
// Share class definitions with the extension
// import { ENTITY, PERSON, LOCATION, ORGANIZATION, CONSUMER_GOOD, WORK_OF_ART} from './entities.js';

import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { doc, setDoc, collection } from "firebase/firestore"; 

// The Firebase Admin SDK to access Firestore.
import { initializeApp } from "firebase-admin/app";
import { getFirestore }  from "firebase-admin/firestore";

// The Cloud Natural Language API to analyze the text.
import language  from "@google-cloud/language";
// import { key } from './shh.json' assert { type: 'json' };

// Comms libraries
import https from 'https';
import Busboy from 'busboy';


// Share class definitions with the extension
// const { ENTITY, PERSON, LOCATION, ORGANIZATION, CONSUMER_GOOD, WORK_OF_ART} = require('../extension/src/scripts/entities.js');
*/
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const { doc, setDoc, collection } = require("firebase/firestore"); 

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

// The Cloud Natural Language API to analyze the text.
const language = require("@google-cloud/language");
const {JWT} = require('google-auth-library');
const key = require('./shh.json');

// Comms libraries
const https = require('https');
const Busboy = require('busboy');

String.prototype.hashCode = function() {
    var hash = 0,
      i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash + 2147483647 + 1;
  }

  console.log("Functions loaded");

    // initialize firebase app
    const app = initializeApp();
    var db = getFirestore(app);

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
// https://firebase.google.com/docs/functions/http-events?gen=2nd
exports.addmessage = onRequest(async (req, res) => {

    console.log("## 1. addmessage called");
    if (req.method !== 'POST') {
        // Return a "method not allowed" error
        console.log('Not POST. Request = ' + req.method);
        // return res.status(405).end();
    }

    console.log("Request method: " + req.method);

    // This code will process each non-file field in the form.
    var submission = new Object();
    submission.url = req.query.url;
    submission.title = req.query.title;
    submission.text = req.query.text;
    submission.salience = req.query.salience;


    if (!submission.text) {
        console.log("## END ## No text found in request");
        return res.status(400).end();
    }


    // Grab the text parameter & push the new message into Firestore using the Firebase Admin SDK.
    // const pageText = req.query.text;
    const writeSubmission = await getFirestore()
        .collection("submissions")
        .add({pageHTML: submission.text, url : submission.url, title : submission.title });
        console.log(`## 2. Saved submission text to ${writeSubmission.id}`);

    // Call the NLP API
    const options = {
        keyFilename: './shh.json',
        projectId: 'rock-idiom-386415'
    };
    const client = new language.LanguageServiceClient(options);
    const entityDocument = {
        content: submission.text,
        type: 'PLAIN_TEXT',
    };
    
    const entityResults = await client.analyzeEntities({ document: entityDocument });
    const writeNLPResult = await getFirestore()
        .collection("nlpresults")
        .add({nlpresults: JSON.stringify(entityResults), url : submission.url, title : submission.title });
    console.log(`## 2b.  Saved NLP results text to ${writeNLPResult.id}`);

    // Process the results
    const entities = entityResults[0].entities;
    console.log(entities.length  + ' entities found in NLP results');
    var salience = req.query.salience ? submission.salience : 0.001;
    console.log("Salience threshold: " + salience);
    var savedEntityList = [];

    // await entities.forEach(async entity => {
    for (let i=0; i<entities.length; i++){
        if (entities[i].metadata.wikipedia_url && entities[i].salience > salience) {
            const foundIn = new entityFoundIn();
            foundIn.url = req.query.url;
            foundIn.title = req.query.title;

            let savedEntity = await createEntityFromNLPResults(entities[i], foundIn);
            if (savedEntity) {
                console.log("## 4. Created entity: " + savedEntity.name);
                savedEntityList.push(savedEntity);
            }
        }
    }
    //);

    console.log(`## Saved ${savedEntityList.length} entities ##`);

    // Clear the stored document

    // Send back the results
    try {
        if (savedEntityList.length > 0) {
            console.log("## 5. Returned entities: " + savedEntityList.length ); // + JSON.stringify(savedEntityList));
            res.status(200).send({ savedEntityList });
        }
        else {
            res.status(200).send({ result : "No entities saved" });
        }
    }
    catch (err) {
        console.log("Error: " + err);
        res.status(500).send( "Error: " + err );
    }
  });

  // Creates an entity from the a single result from NLP result set
  // Refactored to remove the save which is now only done on post from client
async function createEntityFromNLPResults(entity, foundIn) {
    let key;
    if (entity.metadata.wikipedia_url) {
        key = (entity.metadata.wikipedia_url.hashCode().toString());
    }
        
    if (entity.type === 'PERSON'){

        var person = new PERSON();
        person.id = key;
        person.type = entity.type ? entity.type : 'PERSON';
        person.name = entity.name ? entity.name : '';
        person.wikipedia_url = entity.metadata.wikipedia_url ? entity.metadata.wikipedia_url : '';

        if (foundIn){
            person.foundIn = [];
            person.foundIn.push(foundIn);
        }
        return person;


        // try {
        //     //THIS WORKS!
        //     // const savePerson = await getFirestore()
        //     // .collection("people")
        //     // .add({ person: JSON.parse(JSON.stringify(person)) });
        //     //END THIS WORKS!
            
        //     // use set to ensure use of the same key
        //     await getFirestore().collection("people").doc(key).set( JSON.parse(JSON.stringify(person)) );     
        //     console.log("## 3. Saved person: " + key);
        //     return person;
        // }
        // catch(err){
        //     console.log("Error saving person: " + key + "\nError:" + err);
        // }
    }
    else if (entity.type === 'ORGANIZATION'){

        var organization = new ORGANIZATION();
        organization.id = key;
        organization.type = entity.type;
        organization.name = entity.name;
        organization.wikipedia_url = entity.metadata.wikipedia_url;

        if (foundIn){
            organization.foundIn = [];
            organization.foundIn.push(foundIn);
        }

        return organization;

        // try {
        //     // use set to ensure use of the same key
        //     await getFirestore().collection("organizations").doc(key).set(JSON.parse(JSON.stringify(organization)));     
        //     console.log("## 3. Saved organization: " + key);
        //     return organization;

        //     // const saveOrganization = await getFirestore()
        //     // .collection("organizations")
        //     // .add({organization: JSON.parse(JSON.stringify(organization)) });
        // }
        // catch(err){
        //     console.log("Error saving organization: " + key + "\nError:" + err);
        // }
    }
    else if (entity.type === 'CONSUMER_GOOD'){

        var consumer_good = new CONSUMER_GOOD();
        consumer_good.id = key;
        consumer_good.type = entity.type;
        consumer_good.name = entity.name;
        consumer_good.wikipedia_url = entity.metadata.wikipedia_url;

        if (foundIn){
            consumer_good.foundIn = [];
            consumer_good.foundIn.push(foundIn);
        }
        
        return consumer_good;

        // try {
        //     // use set to ensure use of the same key
        //     await getFirestore().collection("consumergoods").doc(key).set(JSON.parse(JSON.stringify(consumer_good)));     
        //     console.log("## 3. Saved consumer_good: " + key);
        //     return consumer_good;

        //     // const saveConsumerGood = await getFirestore()
        //     // .collection("consumergoods")
        //     // .add({consumer_good: JSON.parse(JSON.stringify(consumer_good)) });
        // }
        // catch(err){
        //     console.log("Error saving consumer_good: " + key + "\nError:" + err);
        // }
    }
    else if (entity.type === 'WORK_OF_ART'){

        var work_of_art = new WORK_OF_ART();
        work_of_art.id = key;
        work_of_art.type = entity.type;
        work_of_art.name = entity.name;
        work_of_art.wikipedia_url = entity.metadata.wikipedia_url;

        if (foundIn){
            work_of_art.foundIn = [];
            work_of_art.foundIn.push(foundIn);
        }

        return work_of_art;

        // try {
        //     // use set to ensure use of the same key
        //     await getFirestore().collection("workofarts").doc(key).set(JSON.parse(JSON.stringify(work_of_art)));     
        //     console.log("## 3. Saved consumer_good: " + key);
        //     return work_of_art;

        //     // const saveWorkOfArt = await getFirestore()
        //     // .collection("workofarts")
        //     // .add({work_of_art: JSON.parse(JSON.stringify(work_of_art)) });
        // }
        // catch(err){
        //     console.log("Error saving work of art: " + key + "\nError:" + err);
        // }
    }
    else {
        return null;
    }
} 

function processPOSTForm() {

//    console.log('** REQUEST **' + req.query.url + ' ' + req.query.title + ' ' + req.query.text + ' ' + req.query.salience);

    /*
    // POST FORM METHOD

    if (req.method === 'POST') {
        console.log('POST request');
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
            console.log(body);
            res.end('ok');
        });
    }

    const busboy = Busboy({headers: req.headers});
    console.log("Headers: " + JSON.stringify(req.headers));




    busboy.on('field', (name, val, info) => {
        if (name === 'url'){
            console.log("** REQUEST url: " + val);
            submission.url = val;
        }
        else if (name === 'title'){
            console.log("** REQUEST title: " + val);
            submission.title = val;
        }
        else if (name === 'text'){
            console.log("** REQUEST text: " + val);
            submission.text = val;
        }
        else if (name === 'salience'){
            console.log("** REQUEST salience: " + val);
            submission.salience = val;
        }
        else {
            console.log("** REQUEST unknown field: " + fieldname);
            console.log(`Field [${name}]: value: %j`, val);
        }
    });

    // END POST FORM METHOD

    */
}

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/
// https://firebase.google.com/docs/functions/http-events?gen=2nd
exports.saveentity = onRequest(async (req, res) => {
    console.log("## saveentity() called ##");

    if (req.method !== 'POST') {
        // Return a "method not allowed" error
        console.log('Not POST. Request = ' + req.method);
        // return res.status(405).end();
    }

    console.log("Request method: " + req.method);

    // This code will process each non-file field in the form.
    let entityJSON = req.query.entity;
//    console.log("Entity JSON: " + entityJSON);
    if (!entityJSON) {
        console.log("END - No text found in post");
        return res.status(400).end();
    }

    var entity = new ENTITY();
    entity = JSON.parse(entityJSON);
    console.log("Entity posted for save: " + JSON.stringify(entity));

    let status = await saveEntity(entity);

    if (status){
        console.log("Saved entity: " + entity.name);
    }

    // Send back the results
    try {
        res.status(200).send("Saved entity. id: " + entity.id + " name: " + entity.name);
        console.log("Returned success 200" );
    }
    catch (err) {
        console.log("Error: " + err);
        res.status(500).send( "Error: " + err );
    }
  });

async function saveEntity(entity) {
    try {
        if (entity.id === undefined || entity.id === null || entity.id === ''){
            await getFirestore().collection(entity.collection).add({ person: JSON.parse(JSON.stringify(entity)) });
            console.log("Saved entity (w/ add method to generate id in FB). type: " + entity.type + " name: " + entity.name);
        }
        else {
            // use set to ensure use of the same key
            await getFirestore().collection(entity.collection).doc(entity.id).set( JSON.parse(JSON.stringify(entity)) );
            console.log("Saved entity (w/ set method as id existed already). type: " + entity.type + " id: " + entity.id + " name: " + entity.name);
            return true;
        }
    }
    catch(err){
        console.log("Error saving entity: " + entity.id + "\nError:" + err);
        return false;
    }

/*
    if (entity.type === 'PERSON'){
        var person = new PERSON();
        
        person.id = key;
        person.type = entity.type ? entity.type : 'PERSON';
        person.name = entity.name ? entity.name : '';
        person.wikipedia_url = entity.wikipedia_url ? entity.wikipedia_url : '';
        person.foundIn = entity.foundIn ? entity.foundIn : [];

        try {            
            // use set to ensure use of the same key
            await getFirestore().collection("people").doc(entity.id).set( JSON.parse(JSON.stringify(person)) );     
            console.log("## 3. Saved person: " + key);
            return person;
        }
        catch(err){
            console.log("Error saving person: " + key + "\nError:" + err);
        }
    }
    else if (entity.type === 'ORGANIZATION'){

        var organization = new ORGANIZATION();
        organization.type = entity.type;
        organization.name = entity.name;
        organization.wikipedia_url = entity.wikipedia_url ? entity.wikipedia_url : '';

        try {
            // use set to ensure use of the same key
            await getFirestore().collection("organizations").doc(entity.id).set(JSON.parse(JSON.stringify(organization)));     
            console.log("## 3. Saved organization: " + key);
            return organization;
        }
        catch(err){
            console.log("Error saving organization: " + key + "\nError:" + err);
        }

    }
    else if (entity.type === 'CONSUMER_GOOD'){

        var consumer_good = new CONSUMER_GOOD();
        consumer_good.type = entity.type;
        consumer_good.name = entity.name;
        consumer_good.wikipedia_url = entity.wikipedia_url ? entity.wikipedia_url : '';

        try {
            // use set to ensure use of the same key
            await getFirestore().collection("consumergoods").doc(entity.id).set(JSON.parse(JSON.stringify(consumer_good)));     
            console.log("## 3. Saved consumer_good: " + key);
            return consumer_good;
        }
        catch(err){
            console.log("Error saving consumer_good: " + key + "\nError:" + err);
        }
    }
    else if (entity.type === 'WORK_OF_ART'){

        var work_of_art = new WORK_OF_ART();
        work_of_art.type = entity.type;
        work_of_art.name = entity.name;
        work_of_art.wikipedia_url = entity.wikipedia_url ? entity.wikipedia_url : '';

        try {
            // use set to ensure use of the same key
            await getFirestore().collection("workofarts").doc(entity.id).set(JSON.parse(JSON.stringify(work_of_art)));     
            console.log("## 3. Saved consumer_good: " + key);
            return work_of_art;
        }
        catch(err){
            console.log("Error saving work of art: " + key + "\nError:" + err);
        }
    }
    else {
        return null;
    }
    */
} // end saveEntity()

/*** ENTITIES ****/

class entityFoundIn {
    url;
    title;
    domain;
}

class ENTITY {
    type;
    collection;
    id;
    name;
    wikipedia_url;
    foundIn;

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

    genericToClass(element){
        this.id = element.id ? element.id : null;
        this.name = element.name ? element.name : null;
        this.wikipedia_url = element.wikipedia_url ? element.wikipedia_url : null;
        this.foundIn = element.foundIn ? element.foundIn : null;
    }

}

class PERSON extends ENTITY {
    constructor() {
        super();
        this.type = 'PERSON';
        this.collection = "entities";
    }
}

class LOCATION extends ENTITY {
    street_number;
    locality;
    street_name;
    postal_code;
    country;
    broad_region; // administrative area, such as the state, if detected
    narrow_region; // smaller administrative area, such as county, if detected
    sublocality; //  used in Asian addresses to demark a district within a city, if detected

    constructor() {
        super();
        this.type = 'LOCATION';
        this.collection = "entities";
    }

    genericToClass(element){
        super.genericToClass(element);
        this.street_number = element.street_number ? element.street_number : null;
        this.locality = element.locality ? element.locality : null;
        this.street_name = element.street_name ? element.street_name : null;
        this.postal_code = element.postal_code ? element.postal_code : null;
        this.country = element.country ? element.country : null;
        this.broad_region = element.broad_region ? element.broad_region : null;
        this.narrow_region = element.narrow_region ? element.narrow_region : null;
        this.sublocality = element.sublocality ? element.sublocality : null;
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

    constructor() {
        super();
        this.type = 'ORGANIZATION';
        this.collection = "entities";
    }
}

class CONSUMER_GOOD extends ENTITY {

    constructor() {
        super();
        this.type = 'CONSUMER_GOOD';
        this.collection = "entities";
    }
}

class WORK_OF_ART extends ENTITY {

    constructor() {
        super();
        this.type = 'WORK_OF_ART';
        this.collection = "entities";
    }
}

/***  END ENTITIES ***/