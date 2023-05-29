export interface userPaginationInterface {
    id: string;
    totalRecords: number;
    totalPages: number;
    pagesStartAfterRecord: Date[];
    recordsPerPage: number;
    currentDisplayPage: number; // holds array position in pagesStartAfterRecord
}

export class userPagination implements userPaginationInterface {
    public static tableName: string = "pagination";
    public static recordsPerPageDefault: number = 10;

    id: string = "";
    totalRecords: number = 0;
    totalPages: number = 0;
    pagesStartAfterRecord: any[] = new Array<any>();
    recordsPerPage: number = 10;
    currentDisplayPage: number = 1;
    ignoreLastStartAfter: boolean;

    constructor(){
        if (this.totalRecords.toString().endsWith('0')){
            this.ignoreLastStartAfter = true;
        }
    }

    public static plainToClass(plain: any): userPagination {
        var p = new userPagination();
    
        if (plain.id){
            p.id = plain.id;
        }

        if (plain.totalRecords){
            p.totalRecords = plain.totalRecords;
        }

        if (plain.totalPages){
            p.totalPages = plain.totalPages;
        }

        if (plain.pagesStartAfterRecord){
            p.pagesStartAfterRecord = plain.pagesStartAfterRecord;
        }

        if (plain.recordsPerPage){
            p.recordsPerPage = plain.recordsPerPage;
        }

        if (plain.currentDisplayPage){
            p.currentDisplayPage = plain.currentDisplayPage;
        }

        return p;
    }
    
}