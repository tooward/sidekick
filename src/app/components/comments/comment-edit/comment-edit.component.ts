// Angular imports
import { Component, OnInit, Input, isDevMode } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Injectable, NgZone, inject } from '@angular/core';
import { Auth, UserMetadata, onAuthStateChanged } from '@angular/fire/auth';
import { switchMap } from 'rxjs/operators';

// data imports
import { OComment } from '../data/comment'
import { CommentService } from '../services/comments.service';

// Firebase related imports
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';


@Component({
  selector: 'app-commentnewedit',
  templateUrl: './comment-edit.component.html',
  styleUrls: ['./comment-edit.component.css']
})

export class CommentEditComponent implements OnInit {

  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  // model variables
  @Input () id: string; // comment: OComment;
  commentForm: UntypedFormGroup = new UntypedFormGroup({});
  model: OComment = new OComment();
  commentObservableSubscription$: any;
  modelRetrieved: boolean = false;
  isDevMode: boolean = isDevMode();
  editMode: boolean = false;
  cid: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public cservice: CommentService,
  ) {  
    console.log("Comment edit Constructor()");
  }

  ngOnInit(): void {
    console.log("Comment edit ngOnInit()");

    // create empty model for new form
    this.model = new OComment();
    this.buildForm();

    // if existing comment, load it
    this.route.paramMap.subscribe((params : ParamMap) => {
      this.cid = params.get('id');
      if (this.cid){
        this.editMode = true;
        console.log("Comment edit ngOnInit - id: " + this.cid);
      }
    });

    // alternate from heros tutorial https://angular.io/guide/router-tutorial-toh#define-routes
    // this.route.paramMap.pipe(
    //   switchMap((params: ParamMap) =>
    //   this.model.id = params.get('id')!)
    // );    

    // if id is populated then this is an edit, obtain the comment from storage
    if(this.cid){
      console.log("Comment edit: Getting comment from storage");
      this.commentObservableSubscription$ = 
              this.cservice.getComment(this.cid)
                            .subscribe(res => (
                                        this.model = OComment.plainToClass(res),
                                        this.model.id = this.cid,
                                        this.setValuesToForm(),
                                        this.modelRetrieved = true
                                      ));
    }

    // retrieve a url if submitted with bookmarklet
    // if (this.route.snapshot.data.url){
    //   this.model.url = this.route.snapshot.data.url;
    //   this.commentForm.patchValue({'url' : this.model.url});
    // }
  }

  ngOnDestroy(): void{
    // clean up subscription to observable from service
    // this.commentObservableSubscription$.unsubscribe();
  }

  async onSubmit(){

    if (this.auth.currentUser !== null) {
      this.model.userId = this.auth.currentUser.uid;
      this.model.userName = this.auth.currentUser.displayName ? this.auth.currentUser.displayName : this.auth.currentUser.email;
    
      if(this.model && !this.model.id){
      // this is a new comment      
        this.getValuesFromForm();
        this.cservice.createComment(this.model);
      }
      else if (this.model && this.model.id){
      // this is an existing comment
        this.getValuesFromForm();       
        this.cservice.updateComment(this.model);
        console.log("Updated data: " + this.model);
      }
        // redirect to read view
        this.router.navigate(['comment', this.model.id] );
    } else {
      throw new Error("Please login and try to save again.");
    }
  }

  buildForm(){
    this.commentForm  = new FormGroup({
      comment: new FormControl<string|null>(''),
      labels: new FormControl<string|null>(''),
      favorite: new FormControl<boolean|null>(false),
      url: new FormControl<string|null>('', Validators.required),
    });
  }

  setValuesToForm(){
    if (this.model){
       console.log("Comment edit: Setting values to form");
      this.commentForm.patchValue({'comment' : this.model.comment});
      this.commentForm.patchValue({'url' : this.model.url});
    }
  }

  getValuesFromForm(){
    if (this.commentForm.value){
      this.model.comment = this.commentForm.value.comment;
      this.model.url = this.commentForm.value.url;
    }
  }


  // Favorite button methods
  public toggleFavorite() {
    this.model.favorite = !this.model.favorite;
  }

}