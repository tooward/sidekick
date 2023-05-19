// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

// The Cloud Natural Language API to analyze the text.
const language = require("@google-cloud/language");
const {JWT} = require('google-auth-library');
const key = require('./shh.json');
const https = require('https');
const entities = require('entities');
const Busboy = require('busboy');

// Constants for setting up JWT credentials and calling API
// const PROJECT_ID = "rock-idiom-386415";
// const HOST = 'fcm.googleapis.com';
// const PATH = '/v1/projects/' + PROJECT_ID + '/messages:send';
// const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/cloud-language';
// const SCOPES = [MESSAGING_SCOPE];

const types = ['UNKNOWN', 'PERSON', 'LOCATION', 'ORGANIZATION', 'EVENT', 'WORK_OF_ART', 'CONSUMER_GOOD', 'OTHER', 'PHONE_NUMBER', 'ADDRESS']

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

// initialize firebase app
initializeApp();

console.log("addmessage called");

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
// https://firebase.google.com/docs/functions/http-events?gen=2nd
exports.addmessage = onRequest(async (req, res) => {

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

    if (!submission.text) {
        console.log("## END ## No text found in request");
        return res.status(400).end();
    }

    // Grab the text parameter & push the new message into Firestore using the Firebase Admin SDK.
    // const pageText = req.query.text;
    const writeSubmission = await getFirestore()
        .collection("submissions")
        .add({pageHTML: submission.text, url : submission.url, title : submission.title });
        console.log(`Saved submission text to ${writeSubmission.id}`);

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
    console.log(`Saved results text to ${writeNLPResult.id}`);

    // Process the results
    const entities = entityResults[0].entities;
    console.log(entities.length  + ' entities found');
    var salience = req.query.salience ? submission.salience : 0.001;
    console.log("## Salience threshold: " + salience);
    var savedEntities = 0;
    var savedEntityList = [];

    entities.forEach(async entity => {
        if (entity.metadata.wikipedia_url && entity.salience > salience) {
            if (entity.type === 'PERSON'){
                savedEntities++;

                var person = new PERSON();
                person.type = entity.type ? entity.type : 'PERSON';
                person.name = entity.name ? entity.name : '';
                person.wikipedia_url = entity.metadata.wikipedia_url ? entity.metadata.wikipedia_url : '';
                person.foundIn = [];

                savedEntityList.push(person);

                const foundIn = new entityFoundIn();
                foundIn.url = req.query.url;
                foundIn.title = req.query.title;
                person.foundIn.push(foundIn);

                const savePerson = await getFirestore()
                .collection("people")
                .add({person: JSON.parse(JSON.stringify(person)) });
                
                console.log("Saved person"); // JSON.stringify(person) }`);
            }
            else if (entity.type === 'ORGANIZATION'){
                savedEntities++;

                var organization = new ORGANIZATION();
                organization.type = entity.type;
                organization.name = entity.name;
                organization.wikipedia_url = entity.metadata.wikipedia_url;

                savedEntityList.push(organization);

                const saveOrganization = await getFirestore()
                .collection("organizations")
                .add({organization: JSON.parse(JSON.stringify(organization)) });

                console.log("Saved organization"); // JSON.stringify(organization) }`);
            }
            else if (entity.type === 'CONSUMER_GOOD'){
                savedEntities++;

                var consumer_good = new CONSUMER_GOOD();
                consumer_good.type = entity.type;
                consumer_good.name = entity.name;
                consumer_good.wikipedia_url = entity.metadata.wikipedia_url;

                savedEntityList.push(consumer_good);

                const saveConsumerGood = await getFirestore()
                .collection("consumergoods")
                .add({consumer_good: JSON.parse(JSON.stringify(consumer_good)) });

                console.log(`Saved consumer good ${ JSON.stringify(consumer_good) }`);
            }
            else if (entity.type === 'WORK_OF_ART'){
                savedEntities++;

                var work_of_art = new WORK_OF_ART();
                work_of_art.type = entity.type;
                work_of_art.name = entity.name;
                work_of_art.wikipedia_url = entity.metadata.wikipedia_url;

                savedEntityList.push(work_of_art);

                const saveWorkOfArt = await getFirestore()
                .collection("workofarts")
                .add({work_of_art: JSON.parse(JSON.stringify(work_of_art)) });

                console.log(`Saved work of art ${ JSON.stringify(work_of_art) }`);
            }
        }
        else  if ((entity.type === 'ADDRESS' || entity.type === 'LOCATION') && entity.salience > salience){
//            console.log("Location Original Content: " + JSON.stringify(entity));
            var location = new LOCATION();
            location.type = entity.type;
            location.name = entity.name;
            location.street_number = entity.metadata.street_number;
            location.locality = entity.metadata.locality;
            location.street_name = entity.metadata.street_name;
            location.postal_code = entity.metadata.postal_code;
            location.country = entity.metadata.country;
            location.broad_region = entity.metadata.broad_region;
            location.narrow_region = entity.metadata.narrow_region;
            location.sublocality = entity.metadata.sublocality;

            if (location.isValid()){
                savedEntities++;
                savedEntityList.push(location);

                const saveLocation = await getFirestore()
                .collection("locations")
                .add({location: JSON.parse(JSON.stringify(location)) });

                console.log("Saved location ${ location.name }" ); //JSON.stringify(location) }`);
            }
        }
        else if (entity.type === 'PHONE_NUMBER' && entity.salience > salience){
            savedEntities++;

            var phone_number = new PHONE_NUMBER();
            phone_number.type = entity.type;
            phone_number.number = entity.metadata.number;
            phone_number.national_prefix = entity.metadata.national_prefix;
            phone_number.area_code = entity.metadata.area_code;
            phone_number.extension = entity.metadata.extension; 
            savedEntityList.push(phone_number);

            const savePhoneNumber = await getFirestore()
            .collection("phonenumbers")
            .add({phone_number: JSON.parse(JSON.stringify(phone_number)) });

            console.log(`Saved phone number ${ JSON.stringify(phone_number) }`);
        }
    });

    console.log(`## Saved ${savedEntities} entities ##`);

    // Clear the stored document

    // Send back the results
    try {
        if (savedEntities > 0) {
            console.log("Saved entities: " + JSON.stringify(savedEntityList));
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