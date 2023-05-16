import { Injectable, NgZone, inject } from '@angular/core';
import { User } from './user';
import { Auth, connectAuthEmulator } from '@angular/fire/auth';

import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { collection, doc, setDoc } from "firebase/firestore";

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  public userData: any; // Save logged in user data
  public signedIn: boolean = false;
  public uid: string = "";

  constructor(
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    
    // TODO - compiler flag to remove this in production
    connectAuthEmulator(this.auth, "http://localhost:9099"); // port set in firebase.json

    console.log("AuthService constructor()");

    /* Saving user data in localstorage when
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.signedIn = true;
        this.userData = user;
        this.uid = user.uid;
        localStorage.setItem('user', JSON.stringify(this.userData));
        localStorage.setItem('uid', this.uid);
        JSON.parse(localStorage.getItem('user')!);
      } 
      else {
        this.signedIn = false;
        this.userData = null;
        this.uid = "";
        localStorage.setItem('user', 'null');
        localStorage.setItem('uid', "");
        JSON.parse(localStorage.getItem('user')!);
      }
    });

    // this.authStatusListener();
  }

  // WIP - need to create obersvable subject for other components to subscribe to.
  // For now other components should be able to check the signedIn status on the service (but seem to have issues)
  // private authStatusSub = new BehaviorSubject(this.currentUser);
  // currentAuthStatus = this.authStatusSub.asObservable();
//   authStatusListener(){
//     this.auth.onAuthStateChanged((user)=>{
//       if(user){
//         this.signedIn = true;
//         this.userData = user;
//         this.uid = user.uid;
//         localStorage.setItem('user', JSON.stringify(this.userData));
//         localStorage.setItem('uid', this.uid);
// //        JSON.parse(localStorage.getItem('user')!);

//         console.log(user);
//         console.log('User is logged in');

//         this.authStatusSub.next(user);
//       }
//       else{
//         this.authStatusSub.next(null);
//         console.log('User is logged out');
//       }
//     })
//   }

  // Sign in with email/password
  async SignIn(email: string, password: string) {
    try {
      const result = await this.afAuth
        .signInWithEmailAndPassword(email, password);
      this.SetUserData(result.user);
      this.afAuth.authState.subscribe((user_1) => {
        if (user_1) {
          this.router.navigate(['comments']);
          console.log("AuthService SignIn() user: " + user_1.uid);
        }
      });
    } catch (error) {
      window.alert(error.message);
      console.error("AuthService SignIn() error: " + error.message);
    }
  }
  
  // Sign up with email/password
  async SignUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.SendVerificationMail();
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  // Send email verfificaiton when new user sign up
  async SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }

  // Reset Forgot password
  async ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  // Returns true when user is logged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null; // && user.emailVerified !== false ? true : false;
  }

  // Sign in with Google
async  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider()).then((res: any) => {
      this.router.navigate(['dashboard']);
    });
  }

  // Auth logic to run auth providers
async AuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.router.navigate(['dashboard']);
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error);
      });
  }
  /* Setting up user data when sign in with username/password,  sign up with username/password and sign in with social auth provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: any) {
    const usersCollection = collection(this.firestore, "users");
    // create a reference to a document in firestore
    const userRef = doc(usersCollection, user.uid)

    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };

    return setDoc(userRef, userData);
  }
  
  // Sign out
async SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }
}