# Entities

Components to display entities that are captured in the extension, form relationships, add data and search for relationships. Staring simple with just display of what is captured in the extension.

## TODO
[ ] Only displaying base class fields on forms and read views. Modify based on super class.
[ ] Need to add [authentication]( https://stackoverflow.com/questions/44928646/angularfire-firebase-checking-the-authentication-state) to this service.
[ ] Manage [error codes](https://firebase.google.com/docs/reference/js/firebase.firestore#firestoreerrorcode) from Firestore.
    - Esclate these errors back to admin: "deadline-exceeded" | "internal" | "resource-exhausted" | "failed-precondition"
    - Handle these errors: "invalid-argument" | "not-found" | "already-exists" | "permission-denied"  | "out-of-range" | "unauthenticated"
    - Retry on these errors: "unavailable" | "data-loss" 
