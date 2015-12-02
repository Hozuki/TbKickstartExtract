/**
 * Created by MIC on 2015/12/1.
 */

import {DbMessage} from "./DbMessage";
import {DbStartMessage} from "./DbMessage";
import {TbPageListResponse} from "./contracts/TbPageList";
import {DbPageMessage} from "./DbMessage";
import {TbPageListItem} from "./contracts/TbPageList";
import {DbProjectMessage} from "./DbMessage";
import {TbProjectDetailResponse} from "./contracts/TbProjectDetail";

var worker = <Worker>this;

worker.onmessage = OnMessage;

function OnMessage(ev:MessageEvent):void {
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

        var totals:number[] = [];
        for (var i = 0; i < m.ids.length; ++i) {
            var obj:any = MiniUtils.ajaxGetSync("https://hstar-hi.alicdn.com/dream/ajax/getProjectList.htm", {
                "page": 1,
                "pageSize": 1,
                "projectType": m.ids[i],
                "type": 6,
                "status": "",
                "sort": 1,
                "callback": "jsonpList"
            }, "jsonpList");
            var objParsed = <TbPageListResponse>obj;
            totals.push(parseFloat(objParsed.total));
            if (i < m.ids.length - 1) {
                // 减速，防止被刷
                MiniUtils.sleep(400);
            }
        }
        var newMsg:DbStartMessage = {
            code: DbMessageCode.START,
            completed: true,
            ids: m.ids,
            totals: totals
        };
        worker.postMessage(newMsg);
    }

    function handleListTypePage():void {
        var m = <DbPageMessage>msg;

        var items:TbPageListItem[] = [];
        for (var i = 0; i < m.ids.length; ++i) {
            var obj:any = MiniUtils.ajaxGetSync("https://hstar-hi.alicdn.com/dream/ajax/getProjectList.htm", {
                "page": 1,
                "pageSize": m.totals[i],
                "projectType": m.ids[i],
                "type": 6,
                "status": "",
                "sort": 1,
                "callback": "jsonpList"
            }, "jsonpList");
            var objParsed = <TbPageListResponse>obj;
            for (var j = 0; j < objParsed.data.length; ++j) {
                items.push(objParsed.data[j]);
            }
            if (i < m.ids.length - 1) {
                // 减速，防止被刷
                MiniUtils.sleep(400);
            }
        }
        var newMsg:DbPageMessage = {
            code: DbMessageCode.LIST_TYPE_PAGE,
            completed: true,
            ids: m.ids,
            totals: m.totals.slice(),
            items: items
        };
        worker.postMessage(newMsg);
    }

    function handleGetProjectDetail():void {
        var m = <DbProjectMessage>msg;

        var responseText:string = MiniUtils.ajaxGetSync("https://izhongchou.taobao.com/dream/ajax/getProjectForDetail.htm", {
            "id": m.projectID,
            "ac": ""
        });
        try {
            // 淘宝有些东西是无法通过JSON校验的，如ID=10052997，其JSON在最后一个"answer"处被报未知字符（虽然检查了一下好像没问题）
            // 所以几乎可以肯定阿里的人要通过 eval() 的方式来放宽限制——潜在的攻击入口
            //m.response = <TbProjectDetailResponse>JSON.parse(responseText);
            m.response = <TbProjectDetailResponse>(eval("(" + responseText + ")"));
        } catch (ex) {
            console.log(m.projectID);
            console.log(responseText);
            console.log(ex);
            throw ex;
        }
        m.completed = true;
        worker.postMessage(m);
    }
}

abstract class MiniUtils {

    static sleep(millis:number):void {
        if (millis <= 0) {
            return;
        }
        var now = Date.now();
        var target = now + millis;
        while (true) {
            if (Date.now() >= target) {
                return;
            }
        }
    }

    static ajaxGetSync(baseUrl:string, queryParams:any = null, jsonpCallbackName:string = null):any {
        var xhr = new XMLHttpRequest();
        var newUrl = baseUrl;
        if (queryParams) {
            newUrl += "?";
            for (var key in queryParams) {
                if (queryParams.hasOwnProperty(key)) {
                    newUrl = newUrl + key + "=" + queryParams[key].toString() + "&";
                }
            }
        }
        if (newUrl.length > baseUrl.length) {
            newUrl = newUrl.substring(0, newUrl.length - 2);
        }
        xhr.open("get", newUrl, false);
        xhr.send();
        if (jsonpCallbackName === undefined || jsonpCallbackName === null) {
            return xhr.responseText;
        } else {
            // 正则的方法很奇怪地没法用，只好用土办法直接替换
            /*
             var regexStr = "^[\s]*" + jsonpCallbackName + "[\s]*\((.+)[\s]*\)[\s]*$";
             var regex = new RegExp(regexStr);
             var cookedString:RegExpMatchArray = xhr.responseText.match(regex);
             */
            var i1:number, i2:number;
            i1 = xhr.responseText.indexOf("(");
            i2 = xhr.responseText.lastIndexOf(")");
            var text = xhr.responseText.substring(i1 + 1, i2 - 1);
            // WebWorker 环境下 JSON.parse() 可用
            return JSON.parse(text);
        }
    }

}

enum DbMessageCode {
    NONE = 0,
    START = 1,
    LIST_TYPE_PAGE = 2,
    GET_PROJECT_DETAIL = 3
}
