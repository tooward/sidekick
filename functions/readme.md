# Firebase functions

## Summary

Firebase functions are used for the following purposes:
- to receive a posting of web pages content from the chrome extension, send that information to the Google NLP API to identify entities and return those to the extension
- to save entities passed back from the extension in the users account
- to scan for graph related connections on the newly saved entities
- to update entities affected by postings, updates or deletes

## Articles

The following articles were helpful in undestanding how to implement this.

https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#Type
https://medium.com/@rosssicherman/sentiment-analysis-with-google-clouds-natural-language-api-and-node-99d3b7ddd35

## Setup

Google requires a service account to access the NLP API. Credentials are stored in a JSON file. 
Firebase Functions can access this file using an environment variable but this must be set using [enivronment variables](https://firebase.google.com/docs/functions/config-env?gen=2nd#env-variables). 

Firebase uses the [dotenv library](https://www.npmjs.com/package/dotenv) to load environment variables from a .env file.
When testing the NLP API stand-alone with [ADC](https://cloud.google.com/docs/authentication/application-default-credentials) simply set environment variable: 'export GOOGLE_APPLICATION_CREDENTIALS=./shh.json'
https://firebase.google.com/docs/functions/config-env?gen=2nd

"You can use the GOOGLE_APPLICATION_CREDENTIALS environment variable to provide the location of a credential JSON file." I am using the service account key.

## POST processing
https://firebase.google.com/docs/functions/http-events?gen=2nd

From [Google sample](https://cloud.google.com/functions/docs/samples/functions-http-form-data). Node.js doesn't have a built-in multipart/form-data parsing library. Use the ['busboy'](https://www.npmjs.com/package/busboy) library from NPM to parse these requests.



## Google NLP APIs

https://medium.com/@rosssicherman/sentiment-analysis-with-google-clouds-natural-language-api-and-node-99d3b7ddd35

## Google Authentication

The firebase function must authenticate with the Google API library and uses JSON web tokens ([JWT](https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest#json-web-tokens)) to do this. This requires the [google-auth-library](https://www.npmjs.com/package/google-auth-library). 

[Scope for NLP](https://developers.google.com/identity/protocols/oauth2/scopes#language)

## Libraries used

https://github.com/cheeriojs/cheerio

# TODOs
- need to swap out the service account key as it is not recommended.
