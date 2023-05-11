import { Injectable, inject, NgZone } from '@angular/core';

// Firebase related imports
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, collectionData, addDoc } from '@angular/fire/firestore';
import { collection, doc, setDoc } from "firebase/firestore";

import { CommentService } from '../services/comments.service';
import { User } from '../../usermgt/services/user';
import { AuthService } from '../../usermgt/services/auth.service';
import { testUserComments } from './testUserComments';
import { testData } from './testdata';

/*
This class helps to generate test data for bootstrapping a unit test or simply facilitating manual testing. 
It is fairly tightly coupled to the current implementation to firebase as it generates users directly from FB, likely the emulator
Each function can be called independently to generate any data which can be returned or stored directly in FB
*/

@Injectable({
    providedIn: 'root'
})

export class testDataService {

    public td: testData;
    private firestore: Firestore = inject(Firestore);
    private auth: Auth = inject(Auth);

    constructor(
        public authService: AuthService,
        public commentService: CommentService
    ){ 
        this.td = new testData();
    }

    async createTestUsersAndData(userCount: number, commentCount: number, saveToFirebase: boolean): Promise<Array<testUserComments>> {
    /// <summary></summary>
    /// <param name="count" type="number"></param>
    /// <returns type="Promise<Array<OComment>>"></returns>  
        try{
            console.log("** START CREATE TEST DATA & USERS **");

            var testUsersWithComments = new Array<testUserComments>(userCount);

            for (let i = 0; i < userCount; i++) {
                await this.createTestUserAndComments(commentCount, saveToFirebase)
                        .then((result:testUserComments) => testUsersWithComments.push(result))
                        .catch((error: Error) => console.log(error.message));
            }

            console.log("** END CREATE TEST DATA & USERS **");
            return (testUsersWithComments);
        }
        catch(error){
            return (error);
        }
    }

    async createTestUserAndComments(commentCount: number, saveToFirebase: boolean, userName?: string): Promise<testUserComments> {
    /// <summary>Creates a single user and the inputted number of requirements for that user. Optionally saves those to Firebase.</summary>
    /// <param name="commentCount" type="number">Number of comments to create for the user.</param>
    /// <param name="saveToFirebase" type="boolean">Save to firebase instance.</param>
    /// <returns type="Promise<OComment>">A test user along with the comments.</returns>

    /**
     *
     * @remarks
     * 
     * @param commentCount - Number of comments to create for the user.
     * @param saveToFirebase - Flag to save to firebase instance.
     * @returns  A test user along with the comments.
     *
     */
        try {
            var userAndComments: testUserComments = new testUserComments();
            var testdata: testData = new testData();
            
            // Create user, saves to FB potentially and user must be logged in to create comments, so must await
            if(userName){
                userAndComments.user = testdata.createTestUser(userName, "password");
            }
            else{
                userAndComments.user = testdata.createTestUser();
            }

            // User will be logged in on creation, so we go ahead and create a bunch of test comments for them
            userAndComments.comments = testdata.createTestComments(commentCount, userAndComments.user.uid);
//             userAndComments.comments = testdata.createTestComments((Math.round(Math.random() * commentCount)), userAndComments.user.uid);

            if (saveToFirebase){
                // firebase login must reflect the account being used to write the records and the call to create an account logs in the user
                this.auth.signOut();
                // need to get back the FB userid and set it on each comment
                // TODO : put this function call and function back in place once figure out promises.
//                let fbu: User = await this.saveTestUserToFirebase(userAndComments.user);

                let newUser = await createUserWithEmailAndPassword(this.auth, userAndComments.user.email, userAndComments.user.password)
                .then((userCredential) => {
                    console.log("TestData Service - saveTestUserToFirebase: Created test user: " + userCredential.user.email + userCredential.user.uid);
                    userAndComments.user.uid = userCredential.user.uid;
                    this.SetUserData(userAndComments.user);
                    const user = userCredential.user;
                    return user;
                })
                .catch((error) => {
                  console.error("TestData Service - saveTestUserToFirebase: Error in creating test user. Error code: " + error.code + " Message: " + error.message);
                  throw error;
                });

                userAndComments.comments.forEach(async c => {
                    c.userId = userAndComments.user.uid;
                    await this.commentService.createComment(c);                    
                });
            }

            return (userAndComments);
        }
        catch(error){
            return (error);
        }
    }

    // public async saveTestUserToFirebase(user: User) : Promise<User> {

    //   await createUserWithEmailAndPassword(this.auth, user.email, user.password)
    //   .then((userCredential) => {
    //       const user = userCredential.user;
    //       return user;
    //     })
    //   .catch((error) => {
    //     console.error("TestData Service - saveTestUserToFirebase: Error in creating test user. Error code: " + error.code + " Message: " + error.message);
    //     throw error;
    //   });
    // }


    async SetUserData(user: User) {
        const usersCollection = collection(this.firestore, "testusers");
        // create a reference to a document in firestore
//        const userRef = doc(usersCollection, user.uid)
        const userData: User = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          password: user.password
        }

        try {
            return addDoc(usersCollection, JSON.parse( JSON.stringify(userData)))
        }
        catch(err) {
            console.error("## Error in saving test user to Firebase: " + err.message); 
            throw err;
        }
    }
}