
///<reference path="../node/node.d.ts"/>

declare module "sql.js" {

    type SQLValues = {[key:string]:string|number|Uint8Array};
    type SQLValue = {[key:string]:string|number|Uint8Array};
    type SQLParameter = number|string|Uint8Array;
    type QueryResultItem = SQLParameter[];

    class Database {

        constructor(data:number[]);
        constructor(data:Buffer);
        constructor(data:Uint8Array);

        run(sql:string):Database;
        run(sql:string, params:SQLValues):Database;
        run(sql:string, params:SQLParameter[]):Database;

        exec(sql:string):QueryResults[];

        each(sql:string, callback:(obj:SQLValue) => void, done:() => void):void;
        each(sql:string, params:SQLParameter[], callback:(obj:SQLValue) => void, done:() => void):void;
        each(sql:string, params:SQLValues, callback:(obj:SQLValue) => void, done:() => void):void;

        prepare(sql:string):Statement;
        prepare(sql:string, params?:SQLValues):Statement;
        prepare(sql:string, params:SQLParameter[]):Statement;

        export():Uint8Array;

        close():void;

    }

    class Statement {

        bind():boolean;
        bind(values:SQLValues):boolean;
        bind(values:SQLParameter[]):boolean;

        step():boolean;

        get():QueryResultItem;
        get(params:SQLValues):QueryResultItem;
        get(params:SQLParameter[]):QueryResultItem;

        getColumnNames():string[];

        getAsObject():SQLValue;
        getAsObject(params:SQLValues):SQLValue;
        getAsObject(params:SQLParameter[]):SQLValue;

        run():void;
        run(values:SQLValues):void;
        run(values:SQLParameter[]):void;

        reset():void;

        freemem():void;

        free():boolean;

    }

    interface QueryResults {

        columns:string[];
        values:QueryResultItem[];

    }

}
