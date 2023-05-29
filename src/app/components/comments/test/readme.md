# Entities & Comments testing

This folder contains a UI that calls into a service which generates test data, optionally saving that testdata to firebase.

The UI is via the testui (/test in routing). Click 'generate data' and a new user is created along with the number of comments specified (currently hard coded in the testui component class).
- A user account is created in Firebase.
- The records are optionally saved in Firestore.
- This is done in the context of the client that executes it so it will log out of the current user and log in as the newly created user.
- Data is generated using the [faker library](https://fakerjs.dev/)
