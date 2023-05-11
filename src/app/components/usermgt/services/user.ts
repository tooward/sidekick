 export interface iUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    emailVerified: boolean;
    password?: string; // only used for test data
 }
 
export class User implements iUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    emailVerified: boolean;
    password?: string; // only used for test data
    
    constructor (){    }

    public static getUserNameFromEmail(email: string): string{
        if (email.includes('@')){
            let userName: string;
            userName = email.substring(0, email.indexOf('@'));
            return userName;
        }
        else{
            return null;
        }
    }
}