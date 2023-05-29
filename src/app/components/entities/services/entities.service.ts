import { Injectable, inject } from '@angular/core';
import { Firestore, DocumentReference, connectFirestoreEmulator, getCountFromServer, collection, query, orderBy, startAfter, where, collectionData, addDoc, deleteDoc, getDocs, getDoc, doc, docData, setDoc, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { firestorePagination } from '../../pagination/firestorepagination';
import { userPagination } from '../../pagination/userpagination';
import { ENTITY } from '../data/entities';

@Injectable({
  providedIn: 'root'
})

export class EntitiesService {
  /**
  * Service for managing entities in Firestore
  * TODO: Add error handling for Firestore error codes.
    - Esclate these errors back to admin: "deadline-exceeded" | "internal" | "resource-exhausted" | "failed-precondition"
    - Handle these errors: "invalid-argument" | "not-found" | "already-exists" | "permission-denied"  | "out-of-range" | "unauthenticated"
    -  Retry on these errors: "unavailable" | "data-loss" 
  */

  public entities$: Observable<ENTITY[]>;
  public entitiesCollectionReference: string = 'entities';
  public firestore: Firestore = inject(Firestore);
  public lastDoc: any;

  /**
   * 
   * Constructor for EntitiesService
   * Uses injected Firestore service & class property for entities collection reference
   * Sets up observable for entities collection
   */
  constructor() {
      const entitiesCollection = collection(this.firestore, this.entitiesCollectionReference);
      this.entities$ = collectionData(entitiesCollection) as Observable<ENTITY[]>;

//      connectFirestoreEmulator(this.firestore, 'localhost', 1234);
  }

  /**
   * 
   * Returns an entity from the firebase store
   * @param entityId
   * @returns Observable<ENTITY>
   */
  get(entityId: string): Observable<ENTITY>{

    const ref = doc(this.firestore, this.entitiesCollectionReference, entityId);
    const comment = docData(ref) as Observable<ENTITY>;
    comment.subscribe();

    return comment;
  } // end getComment()
  
  /**
   * 
   * creates an entity in firebase store
   * @param entity Entity object to be created
   * @returns Promise<DocumentReference<any>>
   */
  async save(entity: ENTITY) {
      if (!entity){
        console.log("EntitiesService - createEntity(): entity is null or undefined");      
        return null;
      }

      // set the savedTime to now if it is not set
      if (!entity.savedTime){
        entity.savedTime = new Date(Date.now());
      }

      try {
          if (entity.id === undefined || entity.id === null || entity.id === ''){
            console.log("Saving entity (w/ add method to generate id in FB). type: " + entity.type + " name: " + entity.name);
            return addDoc(collection(this.firestore, this.entitiesCollectionReference), JSON.parse( JSON.stringify(entity)));
          }
          else {
              // use set to ensure use of the same key
              console.log("Saving entity (w/ set method as id existed already). type: " + entity.type + " id: " + entity.id + " name: " + entity.name);
              return setDoc(doc(this.firestore, this.entitiesCollectionReference, entity.id), JSON.parse( JSON.stringify(entity)));
          }
      }
      catch(err){
        if (err.exists){
          if (err.code === 'permission-denied') {
            console.log('EntitiesService - createEntity(): The user does not have access to this');
            throw err;
          }
          else if(err.code === 'unauthenticated'){
            console.log('EntitiesService - createEntity(): The user is not authenticated');
            throw err;
          }
          else{
            console.log("EntitiesService - createEntity(): Error in createComment method of comment service: " + err);
            throw err;
          }
        }
        else{
          return err;
        }
      }
      
  }// end createComment()

/**
 * updates existing entity in firebase store
 * @param entity 
 * @returns 
 */
  async update(entity: ENTITY){
    if (!entity.id){
      console.log("EntitiesService - update(): Comment has no id, use save() instead");
      return;
    }

    entity.updatedTime = new Date(Date.now());
    
    try {
      return setDoc(doc(this.firestore, this.entitiesCollectionReference, entity.id), JSON.parse( JSON.stringify(entity)))
    }
    catch(err){
      if (err.exists){
        if (err.code === 'permission-denied') {
          console.log('EntitiesService - update(): The user does not have access to this');
          throw err;
        }
        else if(err.code === 'unauthenticated'){
          throw new Error('EntitiesService - update(): user is unauthenticated');
        }
      }
      else{
        throw err;
      }
    }
    
  } // end updateComment()

  /**
   * Deletes an entity from firestore
   * @param entity 
   * @returns 
   */
  async delete(entity: ENTITY){
    if(!entity.id){
      console.log("EntitiesService - delete(): entity has no id");
      throw Error("EntitiesService - delete(): entity has no id");
    }

    try {
      return deleteDoc(doc(this.firestore, this.entitiesCollectionReference, entity.id));
    }
    catch(err){
      if (err.exists){
        if (err.code === 'permission-denied') {
          console.log('EntitiesService - delete(): The user does not have access to this');
        }
        else if(err.code === 'unauthenticated'){
          throw new Error('EntitiesService - delete(): unauthenticated');
        }
      }
    }    
  } // end deleteComment()

  async deleteById(entityId: string){
    if(entityId){
      try {
        return deleteDoc(doc(this.firestore, this.entitiesCollectionReference, entityId));
      }
      catch(err){
        if (err.exists){
          if (err.code === 'permission-denied') {
            console.log('EntitiesService deleteById: The user does not have access to this');
          }
          else if(err.code === 'unauthenticated'){
            throw new Error('EntitiesService deleteById(): unauthenticated');
          }
        }
      }
    }
  }

  /**
   * Returns a list of all entities for a given user without pagination and no query string
   * @param userId 
   * @returns 
   */
  getEntitiesForUser(userId: string): Observable<ENTITY[]> {
      this.entities$ = collectionData(collection(this.firestore, this.entitiesCollectionReference)) as Observable<ENTITY[]>;
      return this.entities$;

  } // getComments()

  /**
   * Returns a count of users saved entities
   * https://firebase.google.com/docs/firestore/query-data/aggregation-queries
   */
  async getEntityCountByUser(userId: string): Promise<number> {
    try {
      let count: number;
      const q = query(collection(this.firestore, this.entitiesCollectionReference), where("userId", "==", userId));
      const querySnapshot = await getCountFromServer(q);
      return querySnapshot.data().count;
    }
    catch(err){
      console.log("EntitiesService getEntityCountByUser(): " + err);
      throw err;
    }
  } // end getCommentsCountByUser()

  /**
    * Returns a list of all entities for a given user with pagination
    * @param userId
    * @param startAfterRecord
    * @param recordsPerPage
    * @returns
    * 
  */
  async getEntitiesPaginated(recordsPerPage: number, userId: string, startAfterRecord?: any, sortby?: string) : Promise<ENTITY[]> {

    let orderby: string;
    let results: ENTITY[] = [];

    if (!sortby){
      orderby = firestorePagination.defaultSort;
    }
    else{
      orderby = sortby;
    }

    const q = query(collection(this.firestore, this.entitiesCollectionReference), 
                    where("userId", "==", userId),
                    orderBy(orderby),
                    startAfter(startAfterRecord ? startAfterRecord : 0), //startAfterRecord ? startAfterRecord.id : 0),
                    limit(recordsPerPage));

    const querySnapshot = await getDocs(q);
    this.lastDoc = querySnapshot.docs[querySnapshot.docs.length - 2]; // want second to last record for start after

    results = querySnapshot.docs.map(a => {
          let data = ENTITY.plainToClass(a.data());
          data.id = a.id;
          return data;
    });

    return results;
  } // end getCommentsPaginated()
  
  /**
   * Returns a users paginagtion object which contains the last record and the total number of records
   * @param userId 
   * @returns 
   */
  getUserPagination(userId: string): Observable<userPagination>{
        let up$: Observable<userPagination>;
        const ref = doc(this.firestore, userPagination.tableName, userId);
        up$ = docData(ref) as Observable<userPagination>;
        up$.subscribe();
        return up$; 
  } // end getUserPagination()

  } // end CommentService class