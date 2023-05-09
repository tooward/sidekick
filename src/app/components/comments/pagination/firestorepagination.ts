import { OComment } from "../data/comment";
import { userPagination } from "./userpagination";

export type sortBy = "savedTime" | "domain";
export type filterBy = "savedTime" | "domain" | "location" | "favorite";
export enum navDirection{
    refresh,
    forward,
    back
}

export interface firestorePagination {

    // A simple implementation of pagination that uses infinite scroll type pagination
    // This is the only method possible without implementing a function to keep track of pages and record count
    // It requests the current page of records and asks for the first item on the next page in that same query
    // If there is a record that would be on the next page, it enables the next page control via a simple boolean
    // If there is no record in the next page it disables it.
    // The control keeps track of the preceeding records with a simple array of records it push onto as it navs forward, pops as it navs back

    // Note this capability is retained but added capability to see all pages and navigate to / between them directly 
    // This capability requires the firestore function to be in place as it calculates the pagination on each write (add or delete)

    // Pagination is built using guidance from:
    // https://medium.com/@achidera20/managing-auth-state-in-your-angular-firebase-app-c08d62cf3f43
    // https://firebase.google.com/docs/firestore/query-data/query-cursors

    // pagination variables
    pageRecordSize: number;

    queryRecordsPerPage: number; // query is typically +1 record used to detect if 'next' pagination is possible
    displayRecordsPerPage: number; // records to display on the page. Lower by 1 record than query
    currentPage: number;
    totalPages: number;
    defaultSort: sortBy;
    sortBy?: sortBy;    
    pageToQuery: number;
    disableNext: boolean;
    disablePrevious: boolean;
    startAfterRecords: number[]; // OComment[];
    // can be a number or string depending on the sortby property (TODO - change to union type)
    startAfterRecord: any;
    // user pagination is the persisted record of pagination records that are updated by the firestore function
    // it is only needed for numerical page listings. The next, last function will work without the function
    userPaginationRecord?: userPagination;
    pagesEnabled: boolean;
}

export class firestorePagination implements firestorePagination {

    queryRecordsPerPage: number; // query is typically +1 record used to detect if 'next' pagination is possible
    displayRecordsPerPage: number; // records to display on the page. Lower by 1 record than query
    currentPage: number = 1;
    totalPages: number = 0;
    static defaultSort: sortBy = "savedTime";

    pageToQuery: number = 0;
    sortBy?: sortBy = this.defaultSort;
    disableNext: boolean = true;
    disablePrevious: boolean = true;
    startAfterRecords: number[] = [];
    startAfterRecordKeyFields: number[] = [];
    startAfterRecord: any;
    userPaginationRecord?: userPagination;
    pagesEnabled: boolean = false;

    constructor(){
        this.disableNext = true;
        this.disablePrevious = true;
    }

    /*
    New function that uses the userPagination 
    - sets the startAfter record to the position passed in 
      Note: The page input is the index in array but position 0 is record 1 (the first page is a null as we use startAfter)
    - sets current page
    - sets disabled previous or next
    */
    jumpToPage(position: number): number {
        if(position && (position <= this.userPaginationRecord.totalPages)){
            this.currentPage = position;
            this.userPaginationRecord.currentDisplayPage = position;

            // disable previous if on first page
            if (this.userPaginationRecord.currentDisplayPage == 1){
                this.disablePrevious = true;
            }
            else{
                this.disablePrevious = false;
            }

            // disable next is based on where in the pagination index we are
            if (this.userPaginationRecord.totalPages == this.userPaginationRecord.currentDisplayPage){
                this.disableNext = true;
            }
            else{
                this.disableNext = false;
            }

            this.startAfterRecord = this.startAfterRecords[position -1];

            return this.startAfterRecord;

        }
        else{
            return null;
        }
    } //moveToPage()

    moveForward(): any {

        // assume that moved to next page, so need to show back button
        // at this point don't know if there is another page of records, assume not until retrieve result set
        this.disableNext = true;
        if(this.startAfterRecords.length >= this.currentPage){
            this.disablePrevious = false;
            this.currentPage++;
            this.setStartAftertRecord();

            if (this.userPaginationRecord){
                this.userPaginationRecord.currentDisplayPage++;
            }
            
            return this.startAfterRecord;
        }
        else{
            return null;
        }
    }

    moveBackward(): any {

        this.disableNext = false;

        // if we are on the first page now, there is no back page
        if (this.currentPage == 1)
        {
            this.disablePrevious = true;
            this.setStartAftertRecord();
            return null;
        }
        else{

            this.currentPage--;
            if (this.userPaginationRecord){
                this.userPaginationRecord.currentDisplayPage--;
            }
            this.setStartAftertRecord();
            if (this.currentPage == 1){
                this.disablePrevious = true;
            }
            return this.startAfterRecord;
        }

    }

    setNextPage(nextPageStartAfterRecord: OComment){
        // check if we have this already - need to be resilient with multiple replies from observable with results
        // it may be that the next page record changed. Out of scope for now, assume static query results (cloud function should solve for this)
        if (!this.startAfterRecords[this.currentPage - 1] && this.currentPage !== 1){
            this.startAfterRecords.push(nextPageStartAfterRecord.savedTime.getTime());
        }
        this.disableNext = false;
    }

    setThisPage(thisPageStartAfterRecord: OComment){
        // only set if don't already have a record in this position
        if (!this.startAfterRecords[this.currentPage - 1] && this.currentPage !== 1){
            this.startAfterRecords.push(thisPageStartAfterRecord.savedTime.getTime());
//            this.startAfterRecordKeyFields.push(thisPageStartAfterRecord.savedTime.getTime());
            // first record must be empty in start after
            if (this.currentPage === 0 && this.startAfterRecords[0]){
                this.startAfterRecords[0] = null;
            }
        }
    }

    noNextPage(){
        this.disableNext = true;
    }

    setStartAftertRecord(){
        if (this.currentPage === 1)
        {
            this.startAfterRecord = null;
        }
        else {
            this.startAfterRecord = this.startAfterRecords[this.currentPage -1];
        }
    }

    setUserPaginationRecord(up: userPagination){
        this.pagesEnabled = true;
        this.userPaginationRecord = up;

        // setup the pages array. First record needs to be null in the startAfter model.
        this.startAfterRecords.push(null);        
        if (this.userPaginationRecord.pagesStartAfterRecord){
            this.userPaginationRecord.pagesStartAfterRecord.forEach(element => {
                this.startAfterRecords.push(element);
            });

            this.totalPages = this.startAfterRecords.length;
            this.userPaginationRecord.totalPages = this.totalPages;
        }

        // need to remove the last startAfter item in the array if the record count ends with '0' (10, 20 etc)
        // this is because in the function we save the startAfter record on the 0th item in anticipation of new page
        // but on the 0th record there is no next page yet
        // done for efficiency in the function as it doesn't have to query when there is an item inserted that starts a new page
        if (this.userPaginationRecord.totalRecords.toString().endsWith('0')
        &&  this.userPaginationRecord.totalRecords > 0){
                this.userPaginationRecord.ignoreLastStartAfter = true;
                this.startAfterRecords.pop();
        }
    }// setUserPaginationRecord()

}