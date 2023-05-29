# Pagination

A simple implementation of pagination that is tightly coupled (for now) to the query model. Still, if anyone is reading this might be good to see how to do pagination in Angular + Firebase as it is not simple.

There are two pagination styles with different implementation needs:
1. Simple previous / next navigation.
2. Links directly to pages in the full data set.

In the current implementation the user pagination is the persisted record of pagination records that are updated by the firestore function. It is only needed for numerical page listings. The next, last function will work without the function.

## Firebase limitations and approaches

Queries can paginate data easily be using query [cursors](https://firebase.google.com/docs/firestore/query-data/query-cursors). Additionally, a [count](https://firebase.google.com/docs/firestore/query-data/aggregation-queries+) of records can be obtained to calculate pagination easily. An older approach is to use a trigger in Firebase to keep track of the count of records for a query. This is what is currently in place as the code originally was written when count didn't exist.

## Simple prev/next navigation

Firebase does not keep track of the count of records for a particular query (ex: how many comments a user has). This must be tracked separately if option 2 is required. However, the workaround for the next navigation is to query for one more record than needed for the page. If it exists, it is not displayed but the next navigation item is enabled.

Variables:
- disableNext & disablePrevious = controls whether to display the next or previous buttons on the results page
- displayRecordsPerPage = number of records to show per page. Default is on userPagination.recordsPerPageDefault;
- queryRecordsPerPage = set to displayRecordsPerPage + 1. Query is +1 record used to detect if 'next' pagination is possible.
- currentPage = page that the user is currently viewing. Set to 1 on initialization.
- navigationDirection = variable passed in from view that determines if move forward, back or just refesh the query.

Lifecycle:
- A pagination object is created that holds the basic parameters for pagination. These include records to display per page
- An array stores the query value for the start after condition that will bring up the pages results. For the first page this should remain null. However, on the first page query one extra record over display is requested. If that exists then we know there is another page. The last record in the list is used for the start after. ex: if there are 11 results the 10th record is the start after record (as it retrieves the 11th result forward).
- If the user calls nextPage the moveForward() function sets the proper start after record for the query pulling it from the startAfterRecords array.

## Pages with links


The firestorepagination class tracks the next / back status. 

The userpagination is the persisted record of pagination records that are updated by a firestore function (i.e. function that lives in FB not a query called by client). It is only needed for numerical page listings. The next, last function will work without the function. This capability requires the firestore function to be in place as it calculates the pagination on each write (add or delete).
