/**
 * Created by MIC on 2015/12/1.
 */

import * as SqlJS from "sql.js";
import {TbPageListItem} from "./contracts/TbPageList";

export interface MainWindow extends Window {

    btnDbOpen:HTMLButtonElement;
    btnDbCreate:HTMLButtonElement;
    btnDbDelete:HTMLButtonElement;
    btnDbClose:HTMLButtonElement;
    btnDbExportToCsv:HTMLButtonElement;

    btnGrabStart:HTMLButtonElement;
    btnGrabStop:HTMLButtonElement;

    btnClearLog:HTMLButtonElement;

    txtLog:HTMLDivElement;
    spanLogHolder:HTMLSpanElement;
    divPullProgress:HTMLDivElement;

    lblProgressTitle:HTMLDivElement;
    lblProgressValue:HTMLSpanElement;
    lblProgressDetail:HTMLDivElement;

    debugLog(text:string):void;
    enableCheckboxes(enabled:boolean):void;
    initProgressBar():void;
    setProgressValue(percent:number):void;
    setProgressBarActive(active:boolean):void;
    setProgressText(detail:string):void;
    setProgressText(title:string, detail:string):void;

    shouldContinueGrabbing: boolean;
    isDbOpened:boolean;
    isDbFileFound:boolean;
    grabbingFinallyStoppedToken:boolean;

    startGrabbing(ids:string[]):void;
    updateControlStateAccordingToGrabbing(started:boolean):void;
    cleanupGrabbing(succeeded?:boolean):void;

    worker:Worker;
    preparedInsertStatement:SqlJS.Statement;

    selectedTypes:{[typeID:string]:string};
    cachedProjects:TbPageListItem[];
    totalProjectCount:number;
    currentProjectIndex:number;

    saveDatabase(close:boolean):void;

}
