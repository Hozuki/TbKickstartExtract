declare module "sql.js" {

    type SQLValues = {[key:string]:string|number|Uint8Array};
    type SQLValue = {[key:string]:string|number|Uint8Array};
    type QueryResultValue = Array<number|string|Uint8Array>;

    class Database {

        constructor(data:number[]);
        constructor(data:Buffer);

        run(sql:string, params?:SQLValues):Database;

        exec(sql:string):QueryResults[];

        each(sql:string, callback:(obj:SQLValue) => void, done:() => void):void;
        each(sql:string, params:SQLValues, callback:(obj:SQLValue) => void, done:() => void):void;

        prepare(sql:string, params?:SQLValues):Statement;

        export():Uint8Array;

        close():void;

    }

    class Statement {

        bind(values:SQLValues):boolean;

        step():boolean;

        get(params:SQLValues):QueryResultValue;

        getColumnNames():string[];

        getAsObject(params:SQLValues):SQLValue;

        run(values:any):void;
        run(values:SQLValues):void;

        reset():void;

        freemem():void;

        free():boolean;

    }

    interface QueryResults {

        columns:string[];
        values:QueryResultValue[];

    }

}
