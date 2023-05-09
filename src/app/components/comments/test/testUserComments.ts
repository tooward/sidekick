import { User } from '../../../shared/services/user';
import { OComment } from "../data/comment";

export interface testUserComments{
    user: User;
    comments: Array<OComment>;
}

export class testUserComments implements testUserComments{
    constructor(){}
}