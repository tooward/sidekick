// Angular imports
import { Component, OnInit, isDevMode } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';

// data imports
import { ENTITY } from '../data/entities';
import { EntitiesService } from '../services/entities.service';

// Firebase related imports
import { Observable } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';

import { firestorePagination, navDirection, sortBy } from '../../pagination/firestorepagination';
import { userPagination } from '../../pagination/userpagination';
import { AuthService } from 'src/app/components/usermgt/services/auth.service';

@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.css']
})

/**
 * EntityListComponent - Displays a list of entities for a user
 */
export class EntityListComponent implements OnInit {

  public isDevMode: boolean = isDevMode();
  public entities: ENTITY[];
  public pagination: firestorePagination;
  public navdir = navDirection;
  public loading: boolean = true;
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  private user: User;
  private userLoggedIn: boolean = false;
  private lastDoc: any;
  public recordCount: number = 0;
 
  constructor(
    public service: EntitiesService,
    public authService: AuthService,
    private route: ActivatedRoute
  ){
//    console.log("EntityListComponent constructor()");
  }

  ngOnInit(): void {

    console.log("EntityListComponent ngOnInit()");

    this.auth.onAuthStateChanged((user) => {
        if (user) {
          // get the current state for the user
          this.user = user;
          this.userLoggedIn = true;
          console.log("EntityListComponent - ngOnInit: User is signed in as: " + user.uid );

          // get record count from comments service
// TODO - put this back in place but needs debugging
          // this.service.getEntityCountByUser(user.uid).then(res => { 
          //   this.recordCount = res;
          //   this.pagination.totalPages = Math.ceil(this.recordCount / this.pagination.queryRecordsPerPage);
          //   this.pagination.pagesEnabled = true;
          //   console.log("EntityListComponent - constructor() - record count: " + this.recordCount);
          // }).catch(err => console.log(err));
        }
        else{
          console.log("EntityListComponent - constructor(): User is NOT signed in.");
        }
    });

    // This will set the infinite scroll navigation controls by default. It doesn't conflict with userPagination.
    if (!this.pagination){
      console.log("CommentlistComponent - OnInit(): Pagination not set. Setting default pagination.");
      this.pagination = new firestorePagination();

      // obtain the user pagination for the pagination control. User pagination is stored as a firestore record
      if(!this.pagination.userPaginationRecord) {
        const user = this.auth.currentUser;
        if (user !== null) {
          this.service.getUserPagination(user.uid).subscribe(res=>
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

      this.getEntitiesPaginated();
    }

  } // ngOnInit()

  getComments(orderby?: string) {
      var res: Observable<ENTITY[]>;

      const user = this.auth.currentUser;
      if (user !== null) {
        this.service.getEntitiesForUser(user.uid).subscribe(
          res => this.entities = res,
          err => this.handleFBQueryError(err)
        );
      }
      else {
        console.log("User not logged in");
      }
  }

  delete(entity: ENTITY){
    if (confirm("Are you sure you want to delete this entity?")){
      this.service.delete(entity).then(() => {
        let index = this.entities.indexOf(entity);
        this.entities.splice(index, 1);
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
async  getEntitiesPaginated(sortByIn?: sortBy, navigationDirection?: number, page?: number){
     console.log("EntityListComponent getEntitiesPaginated()");
    // console.log("CommentListComponent getCommentsPaginated() - sortByIn: " + sortByIn);
    // console.log("CommentListComponent getCommentsPaginated() - navigationDirection: " + navigationDirection);
    // console.log("CommentListComponent getCommentsPaginated() - page: " + page);

    this.loading = true;
    
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
    this.pagination.setNavigation(pageNavigatedTo, navigationDirection);
  
    this.auth.onAuthStateChanged(user => {
      if (user != null) {
        this.service.getEntitiesPaginated(this.pagination.queryRecordsPerPage, 
          user.uid,
          this.pagination.startAfterRecord, 
          this.pagination.sortBy)
        .then(
          res => {
          if (res.length > 0){
            console.log("EntityListComponent - getEntitiesPaginated() - res.length: " + res.length);
            // Next page is required only if the additional record over the pagination limit was returned.
            if (res.length > this.pagination.displayRecordsPerPage){
              this.pagination.setNextPage(this.service.lastDoc); // res[res.length - 2]); // take last record of display as calling startafter;
            }
            else{
              this.pagination.noNextPage();
            }
          }

          // don't display first on next page record, if exists
          this.entities = res.slice(0, (this.pagination.displayRecordsPerPage));
          this.loading=false;
          },
          err => {
            console.log("Entity-List - getCommentsPaginated - error: " + err);
            //this.handleFBQueryError(err);
            this.loading=false;
          }
          );
        }
        else{ 
          console.error("CommentlistComponent - getCommentsPaginated(): user NOT logged in");
          this.loading=false;
        }
      });
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