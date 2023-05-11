import * as faker from '@faker-js/faker'
import { User } from '../../usermgt/services/user';
import { OComment } from '../data/comment';
import { oPlace } from '../data/place';

export interface iTestData {
    createTestUser(userNameIn?: string, passwordIn?: string ): User;
    createTestComment(userId?: string, timestamp?: Date): OComment;
    createTestComments(count: number, userId: string): Array<OComment>; 
    createTestCommentForUser(userId: string): OComment;
    createRandomLocation(): oPlace;
}

export class testData implements iTestData {

    private places: Array<oPlace>; // store places so can be reused rather than having only single instances of places
    private placesCounter: number;
    private randomCommentCount: boolean = true;

    constructor(
    ){
        this.placesCounter = 0;
    }

    public createTestUser(userNameIn?: string, passwordIn?: string ): User {
        var user: User = new User();
        
        let password = faker.faker.internet.password();
        if (passwordIn)
            password = passwordIn;
        user.password = password;
        let fname = faker.faker.name.firstName();
        let lname = faker.faker.name.lastName();
        user.displayName = fname + " " + lname;

        let email =  fname + "." + lname + "@" + faker.faker.internet.domainName();
        console.log("testData - createTestUser(): email: " + email);

        //let email = faker.faker.internet.email();
        if (userNameIn)
            email = userNameIn;
        user.email = email;
        
        user.photoURL = faker.faker.internet.avatar();
        user.emailVerified = false;
        user.email = email;
        return user;
    }

    public createTestCommentForUser(userId: string): OComment{
        var testComment:OComment = this.createTestComment();
        testComment.userId = userId;
        return testComment;
    }

    public createTestComments(count: number, userId: string): Array<OComment> {
        /// <summary>Creates a set of test comments and either saves them or returns them.</summary>
        /// <param name="count" type="number">Number of records to create</param>
        /// <param name="userId" type="number">userId for records (required for saving to Firebase)</param>
        /// <param name="saveToFirebase" type="number">Determines if saves to Firebase in method</param>
        /// <returns type="Promise<Array<OComment>>">A promise that when resolved returns an array of OComment objects.</returns>    
            var results: Array<OComment> = new Array<OComment>();
            
            // build a date range for the test comments to test / simulate sorting by date
            var start: Date = new Date(2020, 1, 1);
            var end: Date = new Date(2020, 12, 31);

            for (let i = 0; i < count; i++) {
                let setDate: Date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
                const comment = this.createTestComment(userId, setDate);
                results.push(comment);
            }

            results = results.sort((a, b) => (a.savedTime.getTime() > b.savedTime.getTime()) ? 1 : ((b.savedTime.getTime() > a.savedTime.getTime()) ? -1 : 0 ));

            return results;
    }

    public createTestComment(userId?: string, timestamp?: Date): OComment{

        var testComment:OComment = new OComment;
        testComment.id = testData.makeid(20);
        testComment.favorite = Boolean(Math.round(Math.random()));
        for (var j=0; j < Math.round(Math.random()); j++){
            testComment.labels[0] = faker.faker.random.word();
        }
        testComment.location = this.createRandomLocation();
        testComment.comment = faker.faker.lorem.paragraph(Math.random() * 10);
        testComment.url = faker.faker.internet.url();

        if (timestamp){
            testComment.savedTime = timestamp;
            testComment.lastUpdateTime = timestamp;
        }

        if (userId) { 
            testComment.userId = userId;
        }

        return testComment;
    }

    public createRandomLocation(): oPlace
    {
        if(!this.places)
            this.places = new Array<oPlace>();

        try{

            // need to occasionaly pick same location to represent data set properly
            if (this.placesCounter > 4){
                this.placesCounter = 0;
                return this.places[(Math.random() * (this.places.length -1))];
            }
            else{
                this.placesCounter++;
            }

            var l: oPlace = new oPlace(faker.faker.address.country(), 
                                       faker.faker.address.state(), 
                                       faker.faker.address.city(), 
                                       null, 
                                       testData.makeid(20));

            this.places.push(l);
            return l;
        }
        catch(err)
        {
            console.log('testData - createRandomLocation(): ## ERROR generating random location: '+ err.message);
            throw err;
        }
    }

    static makeid(length: number) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }

}