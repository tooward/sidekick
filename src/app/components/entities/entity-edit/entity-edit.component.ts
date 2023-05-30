// Angular imports
import { Component, OnInit, Input, isDevMode } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UntypedFormGroup } from '@angular/forms';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

// data imports
import { ENTITY } from '../data/entities';
import { EntitiesService } from '../services/entities.service';

// Firebase related imports
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-entity-edit',
  templateUrl: './entity-edit.component.html',
  styleUrls: ['./entity-edit.component.css']
})
export class EntityEditComponent implements OnInit {

  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  // model variables
  @Input () id: string; // comment: OComment;
  entityForm: UntypedFormGroup = new UntypedFormGroup({});
  model: ENTITY = new ENTITY();
  entityObservableSubscription$: any;
  modelRetrieved: boolean = false;
  isDevMode: boolean = isDevMode();
  editMode: boolean = false;
  eid: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public service: EntitiesService,
  ) {  
//    console.log("EntityEditComponent Constructor()");
  }

  ngOnInit(): void {
    // create empty model for new form
    this.model = new ENTITY();
    this.buildForm();

    // if existing comment, load it
    this.route.paramMap.subscribe((params : ParamMap) => {
      this.eid = params.get('id');
      if (this.eid){
        this.editMode = true;
        console.log("EntityEditComponent ngOnInit() - id: " + this.eid);
      }
    });

    // alternate from heros tutorial https://angular.io/guide/router-tutorial-toh#define-routes
    // this.route.paramMap.pipe(
    //   switchMap((params: ParamMap) =>
    //   this.model.id = params.get('id')!)
    // );    

    // if id is populated then this is an edit, obtain the comment from storage
    if(this.eid){
      console.log("Entity edit: Getting entity from storage");
      this.entityObservableSubscription$ = this.service.get(this.eid).subscribe(res => (
                                        this.model = ENTITY.plainToClass(res),
                                        this.model.id = this.eid,
                                        this.setValuesToForm(),
                                        this.modelRetrieved = true
                                      ));
    }

    // retrieve a url if submitted with bookmarklet
    // if (this.route.snapshot.data.url){
    //   this.model.url = this.route.snapshot.data.url;
    //   this.commentForm.patchValue({'url' : this.model.url});
    // }
  } // ngOnInit()

  async onSubmit(){
    console.log("Entity edit: onSubmit()");
    console.log("Entity edit: Id is: " + this.model.id);

    if (this.auth.currentUser !== null && this.model){
      console.log("Entity edit: Id is: " + this.model.id);
      this.model.userId = this.auth.currentUser.uid;

      // determining if this is new or an update is done by the service
      this.getValuesFromForm();
      console.log("Entity edit: Saving entity: " + this.model.name );
      this.service.save(this.model);
        
      // redirect to read view
      this.router.navigate(['entities']);

    } else {
      throw new Error("Please login and try to save again.");
    }

  }// onSubmit()

  buildForm(){
    this.entityForm  = new FormGroup({
      type: new FormControl<string|null>(''),
      name: new FormControl<string|null>(''),
      id: new FormControl<string|null>(''),
      wikipedia_url: new FormControl<string|null>('')
    });
  }

  setValuesToForm(){
    if (this.model){
       console.log("Entity edit: Setting values to form");
      this.entityForm.patchValue({'type' : this.model.type});
      this.entityForm.patchValue({'name' : this.model.name});
      this.entityForm.patchValue({'id' : this.model.id});
      console.log("Entity edit: Setting values to form. Id is: " + this.model.id);
      this.entityForm.patchValue({'wikipedia_url' : this.model.wikipedia_url});
    }
  }

  getValuesFromForm(){
    if (this.entityForm.value){
      console.log("Entity edit: Getting values from form");
      this.model.type = this.entityForm.value.type;
      this.model.name = this.entityForm.value.name;
      this.model.id = this.entityForm.value.id;
      this.model.wikipedia_url = this.entityForm.value.wikipedia_url;
    }
  }

}