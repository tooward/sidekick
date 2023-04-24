// Angular imports
import { Component, OnInit, Input, isDevMode } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Injectable, NgZone, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

// data imports
import { OComment } from '../data/comment'
import { CommentService } from '../services/comments.service';
import { Subscription } from 'rxjs';

// Firebase related imports
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-commentnewedit',
  templateUrl: './comment-edit.component.html',
  styleUrls: ['./comment-edit.component.css']
})

export class CommentEditComponent implements OnInit {

  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  // model variables
  commentForm: UntypedFormGroup = new UntypedFormGroup({});
  @Input() model: OComment = new OComment();
  commentObservableSubscription$: Subscription;
  modelRetrieved: boolean = false;

  isDevMode: boolean = isDevMode();
  editMode: boolean = false;
  cid: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public cservice: CommentService,
  ) {
      this.buildForm();

      // if existing comment, load it
      this.route.paramMap.subscribe((params : ParamMap) => {
        this.cid = params.get('id');
        if (this.cid)
          this.editMode = true;
      });
  }

  ngOnInit(): void {
    // create empty model for new form
    this.model = new OComment();

    // if id is populated then this is an edit, obtain the comment from storage
    if(this.cid){
      this.commentObservableSubscription$ = 
              this.cservice.getComment(this.cid)
                            .subscribe(res => (
                                        this.model = OComment.plainToClass(res),
                                        this.model.id = this.cid,
                                        this.setValuesToForm(),
                                        this.modelRetrieved = true
                                      ));
    }
  }

  ngOnDestroy(): void{
    // clean up subscription to observable from service
    // this.commentObservableSubscription$.unsubscribe();
  }

  async onSubmit(){

    if(this.model && !this.model.id){
    // this is a new comment      
      this.getValuesFromForm();
      this.cservice.createComment(this.model);
      this.router.navigate(['list']);
    }
    else if (this.model && this.model.id){
    // this is an existing comment
      this.getValuesFromForm();       
      this.cservice.updateComment(this.model);
      console.log("Updated data: " + this.model);
      // redirect to list
      this.router.navigate(['list']);
    }
  }

  buildForm(){
    this.commentForm  = new UntypedFormGroup({
      comment: new UntypedFormControl(''),
      labels: new UntypedFormControl(''),
      favorite: new UntypedFormControl(''),
      url: new UntypedFormControl('', Validators.required),
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
      // this.model.labels = this.commentForm.value.labels; // labels are pushed directly into the model by the chips control
      this.model.comment = this.commentForm.value.comment;
      // this.model.visibility = this.commentForm.value.visibility;
      // this.model.location = this.commentForm.value.location; // location is set by control
      // this.model.favorite = this.commentForm.value.favorite; // favorite is set by control
      this.model.url = this.commentForm.value.url;
    }
  }


  // Favorite button methods
  public toggleFavorite() {
    this.model.favorite = !this.model.favorite;
  }

}