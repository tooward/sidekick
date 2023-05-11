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
    startAfterRecords: any[];
    // TODO - change to union type. Can be a number or string depending on the sortby property
    startAfterRecord: any;
    userPaginationRecord?: userPagination;
    pagesEnabled: boolean;
}

export class firestorePagination implements firestorePagination {

    queryRecordsPerPage: number; 
    displayRecordsPerPage: number; 
    currentPage: number = 1;
    totalPages: number = 0;
    static defaultSort: sortBy = "savedTime";

    pageToQuery: number = 0;
    sortBy?: sortBy = this.defaultSort;
    disableNext: boolean = true;
    disablePrevious: boolean = true;
    startAfterRecords: any[] = new Array<any>();
    startAfterRecord: any;
    userPaginationRecord?: userPagination;
    pagesEnabled: boolean = false;

    constructor() {
        this.disableNext = true;
        this.disablePrevious = true;
        this.displayRecordsPerPage = userPagination.recordsPerPageDefault;
        this.queryRecordsPerPage = this.displayRecordsPerPage + 1; // query is +1 record used to detect if 'next' pagination is possible
        this.currentPage = 1;
    }

    setNavigation(pageNavigatedTo: number, navigationDirection: navDirection) {
        if (pageNavigatedTo){
            this.jumpToPage(pageNavigatedTo);
          }
          else if (navigationDirection === navDirection.forward){
            this.moveForward();
          }
          else if (navigationDirection === navDirection.back){
            this.moveBackward();
          }
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

        console.log("Firestore Pagination - moveForward() called");
        
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

//            return this.startAfterRecord;
        }
        else{
            console.log("Firestore Pagination - moveForward(): returned null as start after record length was " + this.startAfterRecord.length 
                        + ", less than current page " + this.currentPage);
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
        }

    }

    setNextPage(nextPageStartAfterRecord: any){

//        console.log("Firestore Pagination - setNextPage(): nextPageStartAfterRecord " + JSON.stringify(nextPageStartAfterRecord));

//        if (!this.startAfterRecords[this.currentPage - 1] && this.currentPage !== 1){
            console.log("Firestore Pagination - setNextPage(): adding startAfterRecord to array at position " + (this.currentPage) 
                        + " with value " + JSON.stringify(nextPageStartAfterRecord));
            this.startAfterRecords[this.currentPage] = JSON.stringify(nextPageStartAfterRecord); //.push(JSON.parse(JSON.stringify(nextPageStartAfterRecord)));
//            console.log("Firestore Pagination - setNextPage(): value in array: \n" + JSON.stringify(this.startAfterRecords[this.startAfterRecords.length - 1]));
//        }

        this.disableNext = false;
    }

    setThisPage(thisPageStartAfterRecord: OComment){
        console.log("Firestore Pagination - setThisPage(): currentPage: " + this.currentPage);

        // don't set if page is first page (1) as that should be null.
        if (this.currentPage !== 1){
            // only set if don't already have a record in this position.
            if (!this.startAfterRecords[this.currentPage - 1]){
                console.log("Firestore Pagination - setThisPage(): adding startAfterRecord to array at position " + (this.currentPage - 1));
                console.log("Firestore Pagination - setThisPage(): with value " + JSON.stringify(thisPageStartAfterRecord));
                this.startAfterRecords.push(thisPageStartAfterRecord);
                // first record must be empty in start after
                if (this.currentPage === 0 && this.startAfterRecords[0]){
                    this.startAfterRecords[0] = null;
                }
            }
        }
        else{
            console.log("Firestore Pagination - setThisPage(): On page 1, setting startAfterRecord to null");
            this.startAfterRecords[0] = null;
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