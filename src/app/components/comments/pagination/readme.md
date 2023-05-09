# Pagination

A simple implementation of pagination that uses infinite scroll type pagination.

There are two pagination styles with different implementation needs:
1. Simple previous / next navigation.
2. Links directly to pages in the full data set.

Firebase does not keep track of the count of records for a particular query (ex: how many comments a user has). This must be tracked separately if option 2 is required. However, the workaround for the next navigation is to query for one more record than needed for the page. If it exists, it is not displayed but the next navigation item is enabled.

The firestorepagination class tracks the next / back status. 

The userpagination is the persisted record of pagination records that are updated by a firestore function (i.e. function that lives in FB not a query called by client). It is only needed for numerical page listings. The next, last function will work without the function. This capability requires the firestore function to be in place as it calculates the pagination on each write (add or delete).

## Sources
Pagination is built using guidance from:
https://medium.com/@achidera20/managing-auth-state-in-your-angular-firebase-app-c08d62cf3f43
https://firebase.google.com/docs/firestore/query-data/query-cursors