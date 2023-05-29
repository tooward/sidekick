import { Injectable, inject } from '@angular/core';
import { Firestore, connectFirestoreEmulator, getCountFromServer, collection, query, orderBy, startAfter, where, collectionData, addDoc, deleteDoc, getDocs, getDoc, doc, docData, Timestamp, CollectionReference, queryEqual, DocumentReference, DocumentData, setDoc, limit, QuerySnapshot } from '@angular/fire/firestore';
import { Observable, throwError, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { firestorePagination } from '../../pagination/firestorepagination';
import { userPagination } from '../../pagination/userpagination';
import { OComment } from '../data/comment';

@Injectable({
  providedIn: 'root'
})

/*
Need to add authentication to this service
https://stackoverflow.com/questions/44928646/angularfire-firebase-checking-the-authentication-state
*/

export class CommentService {
  /*

  Use addDoc to add a new document without an id, setDoc to update an existing document as it requires an id to be specified
  https://firebase.google.com/docs/firestore/manage-data/add-data

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
commentsCollectionReference: string = 'comments';
firestore: Firestore = inject(Firestore);
lastDoc: any;

  constructor() {
      const commentsCollection = collection(this.firestore, this.commentsCollectionReference);
      this.comments$ = collectionData(commentsCollection) as Observable<OComment[]>;
  }

  getComment(commentId: string): Observable<OComment>{
    // get a reference to the collection
    const ref = doc(this.firestore, this.commentsCollectionReference, commentId);
    const comment = docData(ref) as Observable<OComment>;
    comment.subscribe();
    return comment;

  } // end getComment()
  
  async createComment(comment: OComment){
      if (comment){
        comment.setDomain();
        if (!comment.savedTime){
          comment.savedTime = new Date(Date.now());
        }
              
        console.log("CommentService - createComment(): Document JSON: " + JSON.stringify(comment));
  
        try {
          return addDoc(collection(this.firestore, this.commentsCollectionReference), JSON.parse( JSON.stringify(comment)));
        }
        catch(err){
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
          else{
            return err;
          }
        }
      }
      else{
        console.log("Comment is null or undefined");      
        return;
      }
    }// end createComment()

  //TODO - revisit this function, ensure Promise is correct (seem to be handling errors and resolution here)
async updateComment(comment: OComment){
    if (comment.id){
      comment.lastUpdateTime = new Date(Date.now());
      // setDoc requires existing id
      try {
        return setDoc(doc(this.firestore, this.commentsCollectionReference, comment.id), JSON.parse( JSON.stringify(comment)))
      }
      catch(err){
        if (err.exists){
          if (err.code === 'permission-denied') {
            console.log('The user does not have access to this');
            throw err;
          }
          else if(err.code === 'unauthenticated'){
            throw new Error('unauthenticated');
          }
        }
        else{
          return err;
        }
      }
    }
    else{
      console.log("Comment has no id, use createComment() instead");
      return;
    }
  } // end updateComment()

  async deleteComment(comment: OComment){
    if(comment.id){
      try {
        return deleteDoc(doc(this.firestore, this.commentsCollectionReference, comment.id));
      }
      catch(err){
        if (err.exists){
          if (err.code === 'permission-denied') {
            console.log('The user does not have access to this');
          }
          else if(err.code === 'unauthenticated'){
            throw new Error('unauthenticated');
          }
        }
      }
    }
  } // end deleteComment()

  async deleteCommentById(commentId: string){
    if(commentId){
      try {
        return deleteDoc(doc(this.firestore, this.commentsCollectionReference, commentId));
      }
      catch(err){
        if (err.exists){
          if (err.code === 'permission-denied') {
            console.log('The user does not have access to this');
          }
          else if(err.code === 'unauthenticated'){
            throw new Error('unauthenticated');
          }
        }
      }
    }
  }

  getComments(userId: string): Observable<OComment[]> {

      // const q = query(collection(this.firestore, this.commentsCollectionReference), where("userid", "==", true));
      // const querySnapshot = getDocs(collection(this.firestore, this.commentsCollectionReference));
      this.comments$ = collectionData(collection(this.firestore, this.commentsCollectionReference)) as Observable<OComment[]>;

      return this.comments$;

  } // getComments()

  /*
   * https://firebase.google.com/docs/firestore/query-data/aggregation-queries
   */
  async getCommentsCountByUser(userId: string): Promise<number> {
    console.log("CommentService getCommentsCountByUser() called with user Id: " + userId);

    try {
      let count: number;
      const q = query(collection(this.firestore, this.commentsCollectionReference), where("userId", "==", userId));
      const querySnapshot = await getCountFromServer(q);
      count = querySnapshot.data().count;
      return count;
    }
    catch(err){
      console.log("Error in getCommentsCountByUser() method of comment service: " + err);
      throw err;
    }
  } // end getCommentsCountByUser()

  /*
    Using the firestore model it takes three parameters:
    - start of range record
    - end of range record
    - number of items in a page

    This function is modified from original getComments to return the typed observable directly
    This allows pagination to work properly as it retains the firebase type for pagination

    The calling component must keep track of these items to ensure proper pagination.
    https://firebase.google.com/docs/firestore/query-data/query-cursors
  */
async getCommentsPaginated(recordsPerPage: number, userId: string, startAfterRecord?: any, sortby?: string) : Promise<OComment[]> {

  // console.log("CommentService getCommentsPaginated() called");
  // if (startAfterRecord){
  //   console.log("CommentService getCommentsPaginated() startAfterRecord.id is: " + startAfterRecord.id);
  //   console.log("CommentService getCommentsPaginated() startAfterRecord is: " + JSON.stringify(startAfterRecord));
  // }

  let orderby: string;
  let cCollection: OComment[] = [];

  if (!sortby){
    orderby = firestorePagination.defaultSort;
  }
  else{
    orderby = sortby;
  }

  const q = query(collection(this.firestore, this.commentsCollectionReference), 
                  where("userId", "==", userId),
                  orderBy(orderby),
                  startAfter(startAfterRecord ? startAfterRecord : 0), //startAfterRecord ? startAfterRecord.id : 0),
                  limit(recordsPerPage));

  const querySnapshot = await getDocs(q);
  this.lastDoc = querySnapshot.docs[querySnapshot.docs.length - 2]; // want second to last record for start after

//      console.log("Comment Service - getCommentsPaginated() - Query: \n" + JSON.stringify(q));
//      console.log("Comment Service - getCommentsPaginated() - Last doc: " + JSON.stringify(this.lastDoc));

  cCollection = querySnapshot.docs.map(a => {
        let data = OComment.plainToClass(a.data());
        data.id = a.id;
        return data;
  });

  return cCollection;
} // end getCommentsPaginated()
  
    getUserPagination(userId: string): Observable<userPagination>{
      let up$: Observable<userPagination>;
      const ref = doc(this.firestore, userPagination.tableName, userId);
      up$ = docData(ref) as Observable<userPagination>;
      up$.subscribe();
      return up$; 
    } // end getUserPagination()

}