/**
 * Created by MIC on 2015/12/1.
 */

import * as fs from "fs";

export class utils {

    static getAbsoluteTop(elem:HTMLElement):number {
        var t = elem.offsetTop;
        while (elem.offsetParent !== null) {
            elem = <HTMLElement>elem.offsetParent;
            t += elem.offsetTop;
        }
        return t;
    }

    static createFile(path:string):void {
        var fd = fs.openSync(path, "a");
        fs.closeSync(fd);
    }

    static writeFileSync(path:string, data:Uint8Array):void {
        var fd = fs.openSync(path, "w");
        var buf = new Buffer(data);
        fs.writeSync(fd, buf, 0, data.length, 0);
        fs.closeSync(fd);
    }

    static setProgressValue(progressBar:HTMLDivElement, percent:number):void {
        percent |= 0;
        progressBar.style.width = percent.toString() + "%";
        progressBar.setAttribute("aria-valuenow", percent.toString());
    }

    static initProgressBar(progressBar:HTMLDivElement):void {
        progressBar.setAttribute("aria-valuemin", "0");
        progressBar.setAttribute("aria-valuemax", "100");
        progressBar.setAttribute("aria-valuenow", "0");
        utils.setProgressValue(progressBar, 0);
    }

    static setProgressBarActiveState(progressBar:HTMLDivElement, active:boolean):void {
        /*
         // ES5 style
         var classes:string[] = progressBar.className.split(" ");
         var activeIndex = classes.indexOf("active");
         if (active) {
         if (activeIndex < 0) {
         classes.push("active");
         progressBar.className = classes.join(" ");
         }
         } else {
         if (activeIndex >= 0) {
         classes.splice(activeIndex, 1);
         progressBar.className = classes.join(" ");
         }
         }
         */
        // ES6 style
        var func:(s:string) => void;
        func = (active ? progressBar.classList.add : progressBar.classList.remove).bind(progressBar.classList);
        func("active");
    }

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

    static sum(array:number[]):number {
        var s = 0;
        for (var i = 0; i < array.length; ++i) {
            s += array[i];
        }
        return s;
    }

    static sumT<T>(array:T[], selection:(t:T) => number):number {
        var s = 0;
        for (var i = 0; i < array.length; ++i) {
            s += selection(array[i]);
        }
        return s;
    }

    static getMin<T>(array:T[], compareFunc:(tl:T, tr:T) => number):{index:number, value:T} {
        if (!array) {
            return null;
        }
        var r:{index:number, value:T} = Object.create(null);
        var c:number;
        r.index = 0;
        for (var i = 1; i < array.length; ++i) {
            c = compareFunc(array[r.index], array[i]);
            if (c > 0) {
                r.index = i;
            }
        }
        r.value = array[r.index];
        return r;
    }

    static getMin2<T>(array:T[], primaryFunc:(tl:T, tr:T) => number, secondaryFunc:(tl:T, tr:T) => number):{index:number, value:T} {
        if (!array) {
            return null;
        }
        var c:number;
        var indices:number[] = [];
        indices.push(0);
        for (var i = 1; i < array.length; ++i) {
            c = primaryFunc(array[indices[0]], array[i]);
            if (c > 0) {
                while (indices.length > 0) {
                    indices.pop();
                }
                indices.push(i);
            } else if (c === 0) {
                indices.push(i);
            }
        }
        var index:number = indices[0];
        if (indices.length > 1) {
            for (i = 1; i < indices.length; ++i) {
                c = secondaryFunc(array[index], array[indices[i]]);
                if (c > 0) {
                    index = i;
                }
            }
        }
        var r:{index:number, value:T} = Object.create(null);
        r.index = index;
        r.value = array[index];
        return r;
    }

    static compareNumber(nl:number, nr:number):number {
        return nl < nr ? -1 : nl > nr ? 1 : 0;
    }

    static getTbStatusFromText(statusText:string):number {
        var r = 0;
        switch (statusText) {
            case "计划中":
                r = 2;
                break;
            case "审核中":
                r = 2;
                break;
            case "审核不通过":
                r = 3;
                break;
            case "审核通过":
                r = 2;
                break;
            case "筹款中":
                r = 2;
                break;
            case "筹款失败":
                r = 3;
                break;
            case "筹款失败退款成功":
                r = 3;
                break;
            case "制作中":
                r = 2;
                break;
            case "项目延期":
                r = 2;
                break;
            case "预热中":
                r = 1;
                break;
            case "项目成功":
                r = 1;
                break;
            case "项目违规":
                r = 3;
                break;
            case "项目失败":
                r = 3;
                break;
            default:
                break;
        }
        return r;
    }

    static mapStateTo012(statusText:string):number {
        var r = -1;
        switch (statusText) {
            case "计划中":
            case "审核中":
            case "审核通过":
            case "筹款中":
            case "制作中":
            case "项目延期":
            case "预热中":
                r = 2;
                break;
            case "审核不通过":
            case "筹款失败":
            case "筹款失败退款成功":
            case "项目违规":
            case "项目失败":
                r = 0;
                break;
            case "项目成功":
                r = 1;
                break;
            default:
                break;
        }
        return r;
    }

    static cloneObject(sourceObject:any):any {
        if (sourceObject === undefined || sourceObject === null) {
            return sourceObject;
        }
        if (typeof sourceObject === "string" || typeof sourceObject === "number") {
            return sourceObject;
        }
        /* Arrays */
        if (sourceObject instanceof Array) {
            var tmpArray:any[] = [];
            for (var i = 0; i < sourceObject.length; ++i) {
                tmpArray.push(utils.cloneObject(sourceObject[i]));
            }
            return tmpArray;
        }
        /* ES6 classes. Chrome has implemented a part of them so they must be considered. */
        if ((<any>window)["Map"] !== undefined && sourceObject instanceof Map) {
            var newMap = new Map<any, any>();
            sourceObject.forEach((v:any, k:any) => {
                newMap.set(k, v);
            });
            return newMap;
        }
        if ((<any>window)["Set"] !== undefined && sourceObject instanceof Set) {
            var newSet = new Set<any>();
            sourceObject.forEach((v:any) => {
                newSet.add(v);
            });
            return newSet;
        }
        /* Classic ES5 functions. */
        if (sourceObject instanceof Function) {
            var fn = (function ():Function {
                return function () {
                    return sourceObject.apply(this, arguments);
                }
            })();
            fn.prototype = sourceObject.prototype;
            for (var key in sourceObject) {
                if (sourceObject.hasOwnProperty(key)) {
                    (<any>fn)[key] = (<any>sourceObject)[key];
                }
            }
            return fn;
        }
        /* Classic ES5 objects. */
        if (sourceObject instanceof Object || typeof sourceObject === "object") {
            var newObject = Object.create(null);
            for (var key in sourceObject) {
                if (sourceObject.hasOwnProperty(key)) {
                    newObject[key] = utils.cloneObject(sourceObject[key]);
                }
            }
            return newObject;
        }
        return undefined;
    }

}
