/**
 * Created by MIC on 2015/12/2.
 */

import * as fs from "fs";

export abstract class SQLSource {

    static get CREATE_TABLE():string {
        SQLSource._create_table = SQLSource._create_table || fs.readFileSync("./scripts/sql/create-table.sql", "utf-8");
        return SQLSource._create_table;
    }

    static get COUNT_RECORDS():string {
        SQLSource._count_records = SQLSource._count_records || fs.readFileSync("./scripts/sql/count-records.sql", "utf-8");
        return SQLSource._count_records;
    }

    static get DELETE_ALL_FROM_TABLE():string {
        SQLSource._delete_all_from_table = SQLSource._delete_all_from_table || fs.readFileSync("./scripts/sql/delete-all-from-table.sql", "utf-8");
        return SQLSource._delete_all_from_table;
    }

    static get INSERT_RECORD():string {
        SQLSource._insert_record = SQLSource._insert_record || fs.readFileSync("./scripts/sql/insert-record.sql", "utf-8");
        return SQLSource._insert_record;
    }

    static get SELECT_ALL():string {
        SQLSource._select_all = SQLSource._select_all || fs.readFileSync("./scripts/sql/select-all.sql", "utf-8");
        return SQLSource._select_all;
    }

    private static _create_table:string = null;
    private static _count_records:string = null;
    private static _delete_all_from_table:string = null;
    private static _insert_record:string = null;
    private static _select_all:string = null;

}
