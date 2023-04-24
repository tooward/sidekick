import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Registration } from './registration';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})

export class RegistrationComponent implements OnInit {
  // https://angular.io/api/core/inject
//  firestore: Firestore // = inject(Firestore);
//  registrationsCollection = collection(this.firestore, 'Marketing')

// Firestore related code
  items$: Observable<Registration[]>;
  registration: Registration = { email: ''};
  confirmation: Boolean = false;

// Form related code
  registrationForm = new UntypedFormGroup({
    email: new UntypedFormControl('', Validators.email)
    });

  constructor(private firestore: Firestore) {
      const registrationsCollection = collection(firestore, 'Comments')
      this.items$ = collectionData(registrationsCollection) as Observable<any[]>;    
  }

  onSubmit() {
    this.registration.email = this.registrationForm.value.email;
    addDoc(collection(this.firestore, 'Comments'), this.registration);
    this.confirmation = true;
  }

  ngOnInit(): void {
  }

}