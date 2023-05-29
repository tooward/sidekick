import { User } from '../../usermgt/services/user';
import { OComment } from "../data/comment";
import { ENTITY } from '../../entities/data/entities';

export interface testUserData{
    user: User;
    comments: Array<OComment>;
    entities: Array<ENTITY>;
}

export class testUserData implements testUserData{
    constructor(){}
}