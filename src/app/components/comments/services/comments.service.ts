import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, collectionData, addDoc, getDocs, doc, docData, Timestamp, CollectionReference, queryEqual, DocumentReference } from '@angular/fire/firestore';
import { Observable, throwError } from 'rxjs';
import { OComment } from '../data/Comment';

import { map } from 'rxjs/operators';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})

/*
Need to add authentication to this service
https://stackoverflow.com/questions/44928646/angularfire-firebase-checking-the-authentication-state
*/


export class CommentService {
  /*
  https://github.com/angular/angularfire/blob/master/docs/firestore/documents.md
  DocumentChangeAction - is always returned in query
  DocumentChange - 'payload' field of DocumentChangeAction, holds metadata on each document for change type (observable)
  DocumentSnapshot - 'doc' field of DocumentChange, contains Document id and other metadata for document
  DocumentData - 'data()' field of DocumentSnapshot, contains data properties


  https://firebase.google.com/docs/reference/js/firebase.firestore#firestoreerrorcode
  Firestore error codes. 
  
  Esclate these errors back to admin:
  "deadline-exceeded" | "internal" | "resource-exhausted" | "failed-precondition"

  Handle these errors: 
  - "invalid-argument" | "not-found" | "already-exists" | "permission-denied"  | "out-of-range" | "unauthenticated"
  
  Retry on these errors:
  "unavailable" | "data-loss" 
*/

comments$: Observable<OComment[]>;
//comment$: Observable<OComment>;
commentsCollectionReference: string = 'comments';
firestore: Firestore = inject(Firestore);

  constructor() {
      const commentsCollection = collection(this.firestore, this.commentsCollectionReference);
      this.comments$ = collectionData(commentsCollection) as Observable<OComment[]>;
  }

  getComments(userId: string): Observable<OComment[]>{

    //const q = query(collection(this.firestore, this.commentsCollectionReference), where("userid", "==", true));
      const querySnapshot = getDocs(collection(this.firestore, this.commentsCollectionReference));
      this.comments$ = collectionData(collection(this.firestore, this.commentsCollectionReference)) as Observable<OComment[]>;

      return this.comments$;

  } // getComments()


    getComment(commentId: string): Observable<OComment>{
      // get a reference to the collection
      const ref = doc(this.firestore, this.commentsCollectionReference, commentId);
      const comment = docData(ref) as Observable<OComment>;
      comment.subscribe();
      return comment;

    } // getComment()
  
    createComment(comment: OComment){
      if (comment){
        comment.setDomain();
  
        // add timestamp for save
        if (!comment.savedTime){
          comment.savedTime = new Date(Date.now());
        }
              
        console.log("Date saving as : " + JSON.stringify(comment.savedTime));
  
        console.log("Document JSON: " + JSON.stringify(comment));
  
        return new Promise<any>((resolve, reject) => {
          addDoc(collection(this.firestore, this.commentsCollectionReference), JSON.parse( JSON.stringify(comment)))
            .then(res => resolve(console.log("Recorded: " + comment.id)), err => reject(console.log("Error:" + err)))
            .catch(err => {
              if (err.exists){
                if (err.code === 'permission-denied') {
                  console.log('The user does not have access to this');
                  throw err;
                }
                else if(err.code === 'unauthenticated'){
                  throw err;
                }
                else{
                  console.log("Error in createComment method of comment service: " + err);
                  throw err;
                }
              }
            });            
         });
      }
      else{
        console.log("Comment is null or undefined");      
        return;
      }
    }

  //TODO - revisit this function, ensure Promise is correct (seem to be handling errors and resolution here)
  updateComment(comment: OComment){
    if (comment.id){
      comment.lastUpdateTime = new Date(Date.now());

      return new Promise<any>((resolve, reject) =>{
        this.afs
        .collection(this.commentsCollectionReference)
        .doc(comment.id)
        .set(comment.getJSON())
        .then(
          res => {console.log("updated " + comment.id)}, 
          err => reject(console.log("Error on: " + comment.id + " - error: " + err)));
      }).catch(
        err => {
        if (err.exists){
          if (err.code === 'permission-denied') {
            console.log('The user does not have access to this');
            throw err;
          }
          else if(err.code === 'unauthenticated'){
            throw new Error('unauthenticated');
          }
        }
      });
    }
    else{
      return;
    }
  }
}
