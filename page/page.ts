/**
 * Created by MIC on 2015/12/1.
 */

import * as fs from "fs";
import * as SqlJS from "sql.js";
import {MainWindow} from "./MainWindow.ts";
import {utils} from "./utils";
import {DbMessage} from "./DbMessage";
import {DbMessageCode} from "./DbMessage";
import {DbStartMessage} from "./DbMessage";
import {DbPageMessage} from "./DbMessage";
import {DbProjectMessage} from "./DbMessage";
import {SQLSource} from "./SQLSource";
import {DataRowFormat} from "./contracts/DataRowFormat";
import {TbProjectItem} from "./contracts/TbProjectDetail";

var self:MainWindow = <MainWindow>this;
var DB_PATH:string = "tbkse.db";
var CSV_PATH:string = "tbkse-result.csv";
var db:SqlJS.Database = null;

(function __initializeElements(self:MainWindow):void {
    self.btnDbOpen = <HTMLButtonElement>self.document.querySelector("#btn-db-open");
    self.btnDbCreate = <HTMLButtonElement>self.document.querySelector("#btn-db-create");
    self.btnDbDelete = <HTMLButtonElement>self.document.querySelector("#btn-db-delete");
    self.btnDbClose = <HTMLButtonElement>self.document.querySelector("#btn-db-close");
    self.btnDbExportToCsv = <HTMLButtonElement>self.document.querySelector("#btn-db-export-to-csv");
    self.txtLog = <HTMLDivElement>self.document.querySelector("#text-log");
    self.spanLogHolder = <HTMLSpanElement>self.document.querySelector("#text-log-holder");
    self.divPullProgress = <HTMLDivElement>self.document.querySelector("#pull-progress");
    self.btnGrabStart = <HTMLButtonElement>self.document.querySelector("#btn-grab-start");
    self.btnGrabStop = <HTMLButtonElement>self.document.querySelector("#btn-grab-stop");
    self.lblProgressTitle = <HTMLDivElement>self.document.querySelector("#label-progress-title");
    self.lblProgressValue = <HTMLSpanElement>self.document.querySelector("#label-progress-value");
    self.lblProgressDetail = <HTMLDivElement>self.document.querySelector("#label-progress-detail");
    self.btnClearLog = <HTMLButtonElement>self.document.querySelector("#btn-clear-log");

    self.shouldContinueGrabbing = true;
    self.grabbingFinallyStoppedToken = false;
    self.isDbFileFound = false;
    self.isDbOpened = false;
    self.worker = null;
    self.selectedTypes = null;
    self.cachedProjects = null;
    self.totalProjectCount = 0;
    self.currentProjectIndex = -1;
    self.preparedInsertStatement = null;
})(self);

(function __initializeMemberFunctions(self:MainWindow):void {
    self.debugLog = (text:string, scrollDown:boolean = true):void => {
        var newText = (new Date()).toLocaleString() + ">> " + text;
        var newNode = self.document.createElement("div");
        newNode.textContent = newText;
        self.txtLog.insertBefore(newNode, self.spanLogHolder);
        if (scrollDown) {
            self.spanLogHolder.scrollIntoView(true);
        }
    };

    self.enableCheckboxes = (enabled:boolean):void => {
        var checkboxes:NodeListOf<HTMLInputElement> = <NodeListOf<HTMLInputElement>>self.document.querySelectorAll("input[type=checkbox]");
        for (var i in checkboxes) {
            if (checkboxes.hasOwnProperty(i) && jQuery.isNumeric(i)) {
                checkboxes[i].disabled = !enabled;
            }
        }
    };

    self.initProgressBar = () => {
        utils.initProgressBar(self.divPullProgress);
    };

    self.setProgressValue = (percent:number):void => {
        percent = ((percent * 100) | 0) / 100;
        utils.setProgressValue(self.divPullProgress, percent);
        self.lblProgressValue.textContent = percent.toString() + "%";
    };

    self.setProgressBarActive = (active:boolean):void => {
        utils.setProgressBarActiveState(self.divPullProgress, active);
    };

    self.setProgressText = (s1:string, s2?:string) => {
        if (s2 === undefined) {
            self.lblProgressDetail.textContent = s1;
        } else {
            self.lblProgressTitle.textContent = s1;
            self.lblProgressDetail.textContent = s2;
        }
    };

    self.updateControlStateAccordingToGrabbing = (started:boolean):void => {
        if (started) {
            self.btnDbCreate.disabled = true;
            self.btnDbDelete.disabled = true;
            self.btnDbOpen.disabled = true;
            self.btnDbClose.disabled = true;
            self.btnDbExportToCsv.disabled = true;
            self.btnGrabStart.disabled = true;
            self.btnGrabStop.disabled = false;
            self.enableCheckboxes(false);
            self.setProgressBarActive(true);
        } else {
            self.btnDbCreate.disabled = self.isDbFileFound || self.isDbOpened;
            self.btnDbDelete.disabled = !self.isDbFileFound || self.isDbOpened;
            self.btnDbOpen.disabled = self.isDbOpened;
            self.btnDbClose.disabled = !self.isDbOpened;
            self.btnDbExportToCsv.disabled = !self.isDbOpened;
            self.btnGrabStart.disabled = false;
            self.btnGrabStop.disabled = true;
            self.enableCheckboxes(true);
            self.setProgressBarActive(false);
        }
    };

    self.startGrabbing = (ids:string[]):void => {
        self.worker = new Worker("WorkerThread.js");
        self.worker.onmessage = mainGrabbingLoop;
        var msg:DbStartMessage = {
            code: DbMessageCode.START,
            completed: false,
            ids: ids.slice()
        };
        self.shouldContinueGrabbing = true;
        self.worker.postMessage(msg);
        self.setProgressValue(0);
    };

    self.cleanupGrabbing = (succeeded:boolean = true):void => {
        if (succeeded) {
            self.debugLog("正在保存到数据库...");
            self.saveDatabase(false);

            self.debugLog("完成。请导出为 CSV 文件。");
            self.setProgressText("完成", "完成。");
            self.setProgressValue(100);
        } else {
            self.debugLog("爬取过程被中止。");
            self.setProgressText("中止", "被手工中止。");
        }

        if (self.preparedInsertStatement !== null) {
            self.preparedInsertStatement.free();
            self.preparedInsertStatement = null;
        }
        self.shouldContinueGrabbing = false;
        self.worker.terminate();
        self.worker.onmessage = null;
        self.worker = null;
        self.cachedProjects = null;
        self.totalProjectCount = 0;
        self.currentProjectIndex = -1;
        self.updateControlStateAccordingToGrabbing(false);
    };

    self.saveDatabase = (close:boolean):void => {
        if (db) {
            if (!fs.existsSync(DB_PATH)) {
                utils.createFile(DB_PATH);
            }
            var data = db.export();
            utils.writeFileSync(DB_PATH, data);
            if (close) {
                db.close();
            }
        }
    };
})(self);

(function __initializeEventHandlers(self:MainWindow):void {
    self.document.body.onload = page_Load;
    self.window.addEventListener("resize", page_Resize);
    self.window.addEventListener("unload", page_Unload);
    self.btnDbOpen.addEventListener("click", btnDbOpen_Click);
    self.btnDbCreate.addEventListener("click", btnDbCreate_Click);
    self.btnDbDelete.addEventListener("click", btnDbDelete_Click);
    self.btnDbClose.addEventListener("click", btnDbClose_Click);
    self.btnDbExportToCsv.addEventListener("click", btnDbExportToCsv_Click);
    self.btnGrabStart.addEventListener("click", btnGrabStart_Click);
    self.btnGrabStop.addEventListener("click", btnGrabStop_Click);
    self.btnClearLog.addEventListener("click", btnClearLog_Click);
})(self);

function page_Load(ev:Event):void {
    var dbExists = fs.existsSync(DB_PATH);
    self.isDbFileFound = dbExists;
    self.btnDbCreate.disabled = dbExists;
    self.btnDbDelete.disabled = !dbExists;
    self.btnDbOpen.disabled = !dbExists;
    self.btnDbClose.disabled = true;
    self.btnDbExportToCsv.disabled = true;
    self.btnGrabStart.disabled = true;
    self.btnGrabStop.disabled = true;
    self.initProgressBar();
    self.enableCheckboxes(false);

    self.setProgressText("开始", "等待爬取开始。");
    self.debugLog("数据库位置: " + DB_PATH);
    self.debugLog(dbExists ? "发现数据库。" : "未发现数据库。");
    page_Resize(null);
}

function page_Resize(ev:Event):void {
    var curTop = utils.getAbsoluteTop(self.txtLog);
    var maxHeight = self.innerHeight - curTop - 10;
    self.txtLog.style.maxHeight = maxHeight.toString() + "px";
}

function page_Unload(ev:Event):void {
    self.saveDatabase(true);
    db = null;
}

function btnDbOpen_Click(ev:Event):void {
    if (self.isDbFileFound) {
        db = new SqlJS.Database(fs.readFileSync(DB_PATH));
        self.debugLog("已打开数据库。");
        self.isDbOpened = true;
        self.btnDbCreate.disabled = true;
        self.btnDbOpen.disabled = true;
        self.btnDbDelete.disabled = true;
        self.btnDbClose.disabled = false;
        self.btnDbExportToCsv.disabled = false;
        self.btnGrabStart.disabled = false;
        self.enableCheckboxes(true);
    }
}

function btnDbCreate_Click(ev:Event):void {
    if (db) {
        return;
    }
    utils.createFile(DB_PATH);
    db = new SqlJS.Database(null);
    var createTableSql:string = SQLSource.CREATE_TABLE;
    console.log(createTableSql);
    db.run(createTableSql);
    utils.writeFileSync(DB_PATH, db.export());
    self.debugLog("已创建数据库。");
    self.isDbFileFound = true;
    self.btnDbCreate.disabled = true;
    self.btnDbDelete.disabled = false;
    self.btnDbOpen.disabled = false;
    self.btnDbClose.disabled = true;
    self.btnDbExportToCsv.disabled = true;
}

function btnDbClose_Click(ev:Event):void {
    if (!db) {
        return;
    }
    db.close();
    db = null;
    self.debugLog("已关闭数据库。");
    self.btnDbCreate.disabled = self.isDbFileFound;
    self.btnDbDelete.disabled = !self.isDbFileFound;
    self.btnDbOpen.disabled = !self.isDbFileFound;
    self.btnDbClose.disabled = true;
    self.btnDbExportToCsv.disabled = true;
    self.btnGrabStart.disabled = true;
    self.btnGrabStop.disabled = true;
    self.enableCheckboxes(false);
    self.isDbOpened = false;
}

function btnDbDelete_Click(ev:Event):void {
    if (db) {
        db.close();
        db = null;
    }
    fs.unlinkSync(DB_PATH);
    self.debugLog("已删除数据库。");
    self.btnDbCreate.disabled = false;
    self.btnDbDelete.disabled = true;
    self.btnDbOpen.disabled = true;
    self.btnDbClose.disabled = true;
    self.btnDbExportToCsv.disabled = true;
    self.btnGrabStart.disabled = true;
    self.btnGrabStop.disabled = true;
    self.enableCheckboxes(false);
    self.isDbFileFound = false;
}

function btnDbExportToCsv_Click(ev:Event):void {
    self.debugLog("正在导出 CSV 文件...");

    var strCsv:string;

    // 处理表头
    var headers:string[] = [];
    var csvSchemaContent:string = fs.readFileSync("./scripts/csv-schema.txt", "utf-8");
    var csvSchemaLines:string[] = csvSchemaContent.split("\r\n");
    for (var i = 0; i < csvSchemaLines.length; ++i) {
        var line = csvSchemaLines[i];
        if (line.charCodeAt(0) !== "#".charCodeAt(0)) {
            var lineHeaders = line.split(",");
            for (var j = 0; j < lineHeaders.length; ++j) {
                if (lineHeaders[j].trim().length > 0) {
                    headers.push(lineHeaders[j].trim());
                }
            }
        }
    }
    strCsv = headers.join(",");

    var strCsvComponent:string;
    var queryResults = db.exec(SQLSource.SELECT_ALL);
    var rows = queryResults[0].values;
    var value:any;

    for (var rowCounter = 0; rowCounter < rows.length; ++rowCounter) {
        strCsvComponent = "\r\n";
        for (i = 0; i < rows[rowCounter].length; ++i) {
            value = rows[rowCounter][i];
            if (typeof value === "string") {
                strCsvComponent += decodeURIComponent(value);
            } else {
                strCsvComponent += value.toString();
            }
            if (i < headers.length - 1) {
                strCsvComponent += ",";
            }
        }
        strCsv += strCsvComponent;
    }
    queryResults = null;
    rows = null;

    // Node only supports UTF-8 encoding...
    //fs.writeFileSync(CSV_PATH, strCsv, os.type().toLowerCase().substring(0, 3) === "win" ? "gbk" : "utf-8");
    try {
        fs.writeFileSync(CSV_PATH, strCsv);
        self.debugLog("已导出到 " + CSV_PATH + " (位于 " + fs.realpathSync(".") + ")。");
    } catch (ex) {
        console.error(ex);
    }

}

function btnGrabStart_Click(ev:Event):void {
    try {
        var t = db.exec(SQLSource.COUNT_RECORDS);
        var recordCount:number = <number>t[0].values[0][0];
        if (recordCount > 0) {
            if (!self.confirm("数据库中存在爬取记录。继续操作将清除已有记录，确认吗？")) {
                return;
            }
            db.run(SQLSource.DELETE_ALL_FROM_TABLE);
        }
    } catch (ex) {
        console.log(ex);
        return;
    }

    function getSelectedTypeIDs():{[typeID:string]:string} {
        var r:{[typeID:string]:string} = Object.create(null);
        var checkboxes:NodeListOf<HTMLInputElement> = <NodeListOf<HTMLInputElement>>self.document.querySelectorAll("input[type=checkbox]");
        var id:string;
        var text:string;
        for (var i in checkboxes) {
            if (checkboxes.hasOwnProperty(i) && jQuery.isNumeric(i) && checkboxes[i].checked) {
                id = checkboxes[i].value;
                text = checkboxes[i].getAttribute("content");
                r[id] = text;
            }
        }
        return r;
    }

    var selectedTypes = getSelectedTypeIDs();
    var idStrings:string[] = Object.keys(selectedTypes);
    if (idStrings.length <= 0) {
        self.debugLog("未选中任何类别，不进行爬取。");
        return;
    }

    self.selectedTypes = selectedTypes;
    self.updateControlStateAccordingToGrabbing(true);
    self.debugLog("开始爬取。");
    self.setProgressText("初始化", "正在获取整体统计信息...");
    self.startGrabbing(idStrings);
}

function btnGrabStop_Click(ev:Event):void {
    self.shouldContinueGrabbing = false;
    self.btnGrabStop.disabled = true;
    self.debugLog("已经发出了停止爬取信号，正在等待响应。");
    var handle:number;
    handle = self.setInterval(():void => {
        if (self.grabbingFinallyStoppedToken) {
            self.clearInterval(handle);
            self.cleanupGrabbing(false);
            self.grabbingFinallyStoppedToken = false;
            self.debugLog("已经停止爬取。");
        }
    }, 10);
}

function btnClearLog_Click(ev:Event):void {
    while (self.txtLog.children.length > 1) {
        self.txtLog.removeChild(self.txtLog.children[0]);
    }
}

function mainGrabbingLoop(ev:MessageEvent):void {
    if (!self.shouldContinueGrabbing) {
        self.grabbingFinallyStoppedToken = true;
        return;
    }

    var msg = <DbMessage>ev.data;
    switch (msg.code) {
        case DbMessageCode.START:
            handleStart();
            break;
        case DbMessageCode.LIST_TYPE_PAGE:
            handleListTypePage();
            break;
        case DbMessageCode.GET_PROJECT_DETAIL:
            handleGetProjectDetail();
            break;
        default:
            break;
    }

    function handleStart():void {
        var m = <DbStartMessage>msg;

        var amountReport = "";
        m.ids.forEach((id:string, index:number):void => {
            amountReport += " \"" + self.selectedTypes[id] + "\"类项目总数:" + m.totals[index].toString();
        });
        self.totalProjectCount = utils.sum(m.totals);
        amountReport += " 总计:" + self.totalProjectCount.toString();
        self.debugLog("初始化完成。" + amountReport);
        self.setProgressText("已获取整体统计信息。");
        if (self.totalProjectCount <= 0) {
            self.cleanupGrabbing();
            return;
        } else {
            var newMsg:DbStartMessage = {
                code: DbMessageCode.LIST_TYPE_PAGE,
                completed: false,
                ids: m.ids.slice(),
                totals: m.totals.slice()
            };
            self.worker.postMessage(newMsg);
            self.setProgressText("正在获取分页信息...");
        }
    }

    function handleListTypePage():void {
        var m = <DbPageMessage>msg;

        self.debugLog("获取分页信息完成。");
        self.setProgressText("已缓存项目列表。");
        self.cachedProjects = m.items;

        self.debugLog("开始爬取与统计项目信息。");
        self.setProgressText("分项目统计", "正在爬取与统计项目信息... (共 " + self.totalProjectCount.toString() + ")");

        self.preparedInsertStatement = db.prepare(SQLSource.INSERT_RECORD);
        var newMsg:DbProjectMessage = {
            code: DbMessageCode.GET_PROJECT_DETAIL,
            completed: false,
            projectID: self.cachedProjects[0].id
        };
        self.worker.postMessage(newMsg);
    }

    function handleGetProjectDetail():void {
        var m = <DbProjectMessage>msg;

        try {
            ++self.currentProjectIndex;
            insertRecord();
            self.debugLog("爬取进度: 项目 " + (self.currentProjectIndex + 1).toString() + "/" + self.totalProjectCount.toString());
            self.setProgressValue((self.currentProjectIndex + 1) / self.totalProjectCount * 100);

            if (self.currentProjectIndex + 1 >= self.totalProjectCount) {
                self.cleanupGrabbing();
                return;
            } else {
                var newMsg:DbProjectMessage = {
                    code: DbMessageCode.GET_PROJECT_DETAIL,
                    completed: false,
                    projectID: self.cachedProjects[self.currentProjectIndex + 1].id
                };
                self.worker.postMessage(newMsg);
            }
        } catch (ex) {
            console.log(ex);
            self.cleanupGrabbing();
        }

        function insertRecord():void {
            var row:DataRowFormat = {};
            try {
                var currentProjectAbstract = self.cachedProjects[self.currentProjectIndex];
                var currentProjectDetail = m.response.data;
                row.id = parseInt(currentProjectAbstract.id);
                row.type = parseInt(currentProjectAbstract.category_id);
                row.name = currentProjectAbstract.name;
                row.url = currentProjectAbstract.link;
                row.project_state = parseInt(currentProjectAbstract.status_value);
                row.project_tb_state = utils.getTbStatusFromText(currentProjectAbstract.status);
                row.project_state_text = currentProjectAbstract.status;
                row.total_money = parseFloat(currentProjectDetail.curr_money);
                row.total_person = parseInt(currentProjectDetail.support_person);
                row.target_money = parseFloat(currentProjectDetail.target_money);
                row.is_succeeded = utils.mapStateTo012(row.project_state_text);
                row.like_count = parseFloat(currentProjectDetail.focus_count);
                if (currentProjectDetail.items.length > 0) {
                    // 如果还有可以询价的产品
                    var comparePrice = utils.getMin(currentProjectDetail.items, (tl:TbProjectItem, tr:TbProjectItem):number => {
                        return utils.compareNumber(parseFloat(tl.price), parseFloat(tr.price));
                    });
                    row.lowest_price = parseFloat(comparePrice.value.price);
                    row.lowest_price_person = parseInt(comparePrice.value.support_person);
                    var compareHot = utils.getMin2(
                        currentProjectDetail.items,
                        (tl:TbProjectItem, tr:TbProjectItem):number => {
                            // 这里要比较出最大值，所以反号
                            // 比较内容为购买人数，越多越好
                            return -utils.compareNumber(parseInt(tl.support_person), parseInt(tr.support_person));
                        }, (tl:TbProjectItem, tr:TbProjectItem):number => {
                            // 比较内容为价格，越少越好
                            return utils.compareNumber(parseFloat(tl.price), parseFloat(tr.price));
                        });
                    row.hottest_price = parseFloat(compareHot.value.price);
                    row.hottest_price_person = parseInt(compareHot.value.support_person);
                    row.is_hottest_price_full = (parseInt(compareHot.value.support_person) >= compareHot.value.total) ? 1 : 0;
                    var compareMoney = utils.getMin(currentProjectDetail.items, (tl:TbProjectItem, tr:TbProjectItem):number => {
                        // 同理，反号
                        return -utils.compareNumber(parseFloat(tl.price) * parseInt(tl.support_person), parseFloat(tr.price) * parseInt(tr.support_person));
                    });
                    row.most_money_price = parseFloat(compareMoney.value.price);
                    row.most_money_price_person = parseInt(compareMoney.value.support_person);
                } else {
                    // 要不然就只能报错了
                    row.lowest_price = -1;
                    row.lowest_price_person = -1;
                    row.hottest_price = -1;
                    row.hottest_price_person = -1;
                    row.is_hottest_price_full = -1;
                    row.most_money_price = -1;
                    row.most_money_price_person = -1;
                }

                var dr = <{[key:string]:string}>row;
                var newRowObj:{[index:string]:any} = {};
                for (var k in dr) {
                    if (row.hasOwnProperty(k)) {
                        if (typeof dr[k] === "string") {
                            // 编码问题总是很头疼，干脆按URI规范编码起来
                            newRowObj["@" + k] = encodeURIComponent(dr[k]);
                        } else {
                            newRowObj["@" + k] = dr[k];
                        }
                    }
                }

                self.preparedInsertStatement.run(newRowObj);
            } catch (ex) {
                console.log(ex);
            }
        }
    }
}
