import { oPlace } from "./place";

export interface iOComment {
    id: string;
    userId: string;
    userName?: string;
    userAvatar?: string;
    comment: string;
//    sharing?: CommentShare[];
    url: string;
    domain?: string;
    labels?: string[];
    location?: oPlace;
    favorite?: boolean;
    savedTime: Date;
    lastUpdateTime?: Date;
}

export class OComment implements iOComment {
    id: string = "";
    userId: string = "";
    userName?: string;
    userAvatar?: string;
    comment: string = "";
//    sharing?: CommentShare[];
    url: string = "";
    domain?: string;
    labels?: string[];
    location?: oPlace;
    favorite?: boolean;
    savedTime: Date = new Date();
    lastUpdateTime?: Date  = new Date();


    getSavedTimeAsEpoch(): number | undefined {
        if (this.savedTime){
            return this.savedTime.getMilliseconds();
        }
        else{
            return undefined;
        }
    }

    setSavedTimeWithEpoch(timeinepoch: number){
        if (timeinepoch)
            this.savedTime = new Date(timeinepoch);
    }

    setDomain(){
        if(this.url){
            try{
              let comurl = new URL(this.url.toString());
              this.domain = comurl.host ? comurl.host : ""; 
            }
            catch(err){
              console.log("Unable to get domain from url. error: ")
            }
          }
    }
    
    constructor (){
        this.labels = [];
    }

    public getJSON(): JSON {
        // get the current time and save it as the last update time
        this.lastUpdateTime = new Date();
        // convert the Date objects to epoch time for storage in Firestore
        this.lastUpdateTime = new Date(this.lastUpdateTime.getTime());

        // this.lastUpdateTime.toJSON = function(){ return this.getTime(); }
        // this.savedTime.toJSON = function(){ return this.getTime(); }
        let result: JSON = JSON.parse( JSON.stringify(this));
 
        console.log("JSON for place: " + result);
        return result;
    }

    // write a function to convert a plain object to a class instance
    public static plainToClass(plain: any): OComment {
        let c = new OComment();
    
        if (plain.userId){
            c.userId = plain.userId;
        }

        if (plain.userName){
            c.userName = plain.userName;
        }

        if (plain.userAvatar){
            c.userAvatar = plain.userAvatar;
        }

        if (plain.comment){
            c.comment = plain.comment;
        }

        if (plain.url){
            c.url = plain.url;
        }

        if (plain.domain){
            c.domain = plain.domain;
        }

        if (plain.labels){
            c.labels = plain.labels;
        }
        
        if (plain.favorite){
            c.favorite = plain.favorite;
        }

        if (plain.savedTime){
            // use internal representation as Date object, not epoch
            try{
                c.savedTime = new Date(parseInt(plain.savedTime));
            //                console.log("~ index.ts - firestoreDocumentDataToClass - value savedTime: " + c.savedTime);
            }
            catch(exception){
                console.log("~ comment.ts - plainToClass - #ERROR# in savedTime: " + exception);
            }
        }

        if (plain.lastUpdateTime){
            // use internal representation as Date object, not epoch
            try{
                c.lastUpdateTime = new Date(parseInt(plain.lastUpdateTime));
            //                console.log("~ index.ts - firestoreDocumentDataToClass - value savedTime: " + c.savedTime);
            }
            catch(exception){
                console.log("~ comment.ts - plainToClass - #ERROR# in lastUpdateTime: " + exception);
            }
        }
    
        return c;
    }
}