// Angular imports
import { Component, OnInit, isDevMode } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';

// data imports
import { OComment } from '../data/comment'
import { CommentService } from '../services/comments.service';

// Firebase related imports
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

// Old imports
import { firestorePagination, navDirection, sortBy } from '../pagination/firestorepagination';
import { userPagination } from '../pagination/userpagination';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-commentlist',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})

/*
  https://github.com/angular/angularfire/blob/master/docs/firestore/documents.md
  DocumentChangeAction - is always returned in query
  DocumentChange - 'payload' field of DocumentChangeAction, holds metadata on each document for change type (observable)
  DocumentSnapshot - 'doc' field of DocumentChange, contains Document id and other metadata for document
  DocumentData - 'data()' field of DocumentSnapshot, contains data properties
*/

export class CommentlistComponent implements OnInit {

  fbcomments: OComment[];
  isDevMode: boolean = isDevMode();
//  private commentsCollection: collection<OComment>;
  comments$: Observable<OComment[]>;
  pagination: firestorePagination;
  public navdir = navDirection;
  loading: boolean = true;
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  private user: User;
  private userLoggedIn: boolean = false;
 
  constructor(
    public cservice: CommentService,
    public authService: AuthService,
    private route: ActivatedRoute
  ){
    console.log("CommentlistComponent constructor()");
  }

  ngOnInit(): void {

    console.log("CommentlistComponent ngOnInit()");

    if(this.authService.userData !== null && this.authService.isLoggedIn){
      this.userLoggedIn = true;
      console.log("ngOnInit() User IS signed in");
    }
    else {
      console.log("ngOnInit() User is NOT signed in.");
    }

    this.auth.onAuthStateChanged((user) => {
      //      if (this.authService.userData !== null && this.authService.isLoggedIn) {
        if (user) {
          console.log("CommentListComponent - constructor() User is signed in as: " + user.uid );
          // get the current state for the user
          this.user = user;
          this.userLoggedIn = true;
        }
        else{
          console.log("constructor() User is NOT signed in.");
        }
    });      

    // this will set the infinite scroll navigation controls by default. Doesn't conflict with userPagination but redundant
    if (!this.pagination){
      this.pagination = new firestorePagination();
      this.pagination.displayRecordsPerPage = userPagination.recordsPerPageDefault;
      // need to add an additional record to detect if there is another page of records and set the next page button
      this.pagination.queryRecordsPerPage = this.pagination.displayRecordsPerPage + 1;
      this.pagination.currentPage = 1;

      // obtain the user pagination for the pagination control
      if(!this.pagination.userPaginationRecord) {

        const user = this.auth.currentUser;
        if (user !== null) {
          this.cservice.getUserPagination(user.uid).subscribe(res=>
          {
            if (res){
              this.pagination.setUserPaginationRecord(userPagination.plainToClass(res));
            }
            else{
              this.pagination.pagesEnabled = false;
            }
          });
        }
      }

      console.log("Pagination OnInit()");
      this.getCommentsPaginated();
    }

  } // ngOnInit()

  getComments(orderby?: string) {
      var res: Observable<OComment[]>;

      const user = this.auth.currentUser;
      if (user !== null) {
        this.cservice.getComments(user.uid).subscribe(
          res => this.fbcomments = res,
          err => this.handleFBQueryError(err)
        );
      }
      else {
        console.log("User not logged in");
      }
  }

  delete(comment: OComment){
    if (confirm("Are you sure you want to delete this comment?")){
      this.cservice.deleteComment(comment).then(() => {
        let index = this.fbcomments.indexOf(comment);
        this.fbcomments.splice(index, 1);
      });
    }
  }

  /*
    Returns the next or prior set of paginated results, or empty set if no results
    Using the firestore pagination model this component must maintain state of first and last record in set.
    It also needs to maintain the order by state
    These records are used to set the start of the next result set
    To obtain the next page, pass in the last record in the set along with the next flag
    To obtain the prior page, pass in the first record in the set along with the prior flag
    Firestore does not keep track of record count. 
    Only workaround for number of pages is to keep track of this separately with a function that tracks count.
    This is challenging as need separate counters for separate filters.
  */
  getCommentsPaginated(sortByIn?: sortBy, navigationDirection?: number, page?: number){
    console.log("CommentListComponent getCommentsPaginated()");

    this.loading = true;
    
    var res: Observable<OComment[]>;
    
    // STARTHERE - in this function use the page (index in the array + 1) to retrieve the correct startAfter record and get the page from there
    let pageNavigatedTo: number;
    // check if passed as URL parameter instead of into the method
    if (!page){
      try{
        pageNavigatedTo = parseInt(this.route.snapshot.paramMap.get('page'));
      }
      catch(exception){
        console.log(exception);
      }
    }
    else{
      pageNavigatedTo = page;
    }

    if (sortByIn && sortByIn !== this.pagination.defaultSort){
      this.pagination.sortBy = sortByIn;
    }

    if (pageNavigatedTo){
      this.pagination.jumpToPage(pageNavigatedTo);
    }
    else if (navigationDirection === navDirection.forward){
      this.pagination.moveForward();
    }
    else if (navigationDirection === navDirection.back){
      this.pagination.moveBackward();
    }

    if (this.authService.isLoggedIn) {
      console.log("getCommentsPaginated() - user is logged in");
      if (this.authService.userData !== null){
        console.log("getCommentsPaginated() - userData is NOT null");
//        console.log("getCommentsPaginated() - userData.: " + JSON.stringify(this.authService.userData));
      }
    }
    else{
      console.log("getCommentsPaginated() - user is NOT logged in");
    }

    if (this.authService.isLoggedIn) {
      this.cservice.getCommentsPaginated(this.pagination.queryRecordsPerPage, 
                                         this.authService.userData.uid, this.pagination.startAfterRecord, 
                                         this.pagination.sortBy)
                   .then(
                    res => {
                      console.log("Comment-List - getCommentsPaginated: Query paginated with query records per page: " + this.pagination.queryRecordsPerPage + " and page: " + this.pagination.currentPage);
                      console.log("Comment-List - getCommentsPaginated: Query paginated with startAfterRecord: " + this.pagination.startAfterRecord);
                      console.log("Comment-List - getCommentsPaginated: Query returned records: " + res.length);

                      // don't display first on next page record, if exists
                      this.fbcomments = res.slice(0, (this.pagination.displayRecordsPerPage));
                      // store first record in this page in array allowing to pop them off as move backward or reference in index for paging
                      this.pagination.setThisPage(res[0]);

                      if (res.length > 0){
                        // Next page is required only if the additional record over the pagination limit was returned.
                        if (res.length > this.pagination.displayRecordsPerPage){
                          this.pagination.setNextPage(res[res.length - 2]); // take last record of display as calling startafter
                        }
                        else{
                          this.pagination.noNextPage();
                        }
                      }

                      this.loading=false;
                    },
                    err => {
                      this.handleFBQueryError(err);
                      this.loading=false;
                    }
                    );
    } else {
      console.error("CommentlistComponent - getCommentsPaginated(): user NOT logged in");
      this.loading=false;
    }
  } // getCommentsPaginated()

  handleFBQueryError(err: any): void
  {
    if (err.exists){
      if (err.code === 'permission-denied') {
        console.log('Permission denied.'+ err.message);
      }
      else if(err.code === 'unauthenticated'){
        throw new Error('unauthenticated');
      }
    }
    else{
      console.log('Permission denied.'+ err.message);
      return null;
    }
  }

}