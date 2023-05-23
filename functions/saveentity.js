// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const { doc, setDoc, collection } = require("firebase/firestore"); 

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

// Comms libraries
const https = require('https');

class ENTITY {
    type;
    foundIn;
}

class entityFoundIn {
    url;
    title;
    domain;
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

class PHONE_NUMBER extends ENTITY {
    number;
    national_prefix;
    area_code;
    extension;

    constructor() {
        super();
        this.type = 'PHONE_NUMBER';
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

class WORK_OF_ART extends ENTITY {
    name;
    wikipedia_url;

    constructor() {
        super();
        this.type = 'WORK_OF_ART';
    }
}

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

console.log("## 1. saveentity() called");

// initialize firebase app
const app = initializeApp();
var db = getFirestore(app);

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/
// https://firebase.google.com/docs/functions/http-events?gen=2nd
exports.saveentity = onRequest(async (req, res) => {

    if (req.method !== 'POST') {
        // Return a "method not allowed" error
        console.log('Not POST. Request = ' + req.method);
        // return res.status(405).end();
    }

    console.log("-- Request method: " + req.method);

    // This code will process each non-file field in the form.
    let entityJSON = req.query.entity;
    if (!submission.entity) {
        console.log("-- END - No text found in post");
        return res.status(400).end();
    }

    var entity = new ENTITY();
    entity = JSON.parse(decodeURIComponent(entityJSON));
    console.log("2. Entity received: " + JSON.stringify(entity));

    let savedEntity = await saveEntity(entities[i], foundIn);

    if (savedEntity){
        console.log("3. Saved entity: " + savedEntity.name);
    }

    // Send back the results
    try {
        res.status(200).send("Saved entity " + savedEntity.name);
        console.log("4. Returned success 200" );
    }
    catch (err) {
        console.log("Error: " + err);
        res.status(500).send( "Error: " + err );
    }
  });

async function saveEntity(entity) {

    if (entity.type === 'PERSON'){

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
        organization.wikipedia_url = entity.metadata.wikipedia_url;

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
        consumer_good.wikipedia_url = entity.metadata.wikipedia_url;

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
        work_of_art.wikipedia_url = entity.metadata.wikipedia_url;

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
} 