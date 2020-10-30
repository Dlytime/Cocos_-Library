var jsTools = class{
    static _instance = null;
    static _getInstance = function () {
        if(!jsTools._instance) {
            jsTools._instance = new jsTools();
        }
        return jsTools._instance;
    };

    constructor() {

    }

    /**
     * 获取从min~max随机整数
     * @param {Number} min 最小值
     * @param {Number} max 最大值
     */
    getRandomNum(min,max){
        //parseInt(Math.random()*(max-min+1)+min,10);
        return  Math.floor(Math.random()*(max-min+1)+min);
    }
    /**检测数组是否存在undefined */
    checkArrHasUf(arr) {
        for (let i = 0; i < arr.length; i++) {
            if(arr[i] === undefined) return true;
        }
        return false;
    }
    /**深度拷贝对象数组 */
    deepCopy(o) {
        if (o instanceof Array) {
            var n = [];
            for (var i = 0; i < o.length; ++i) {
                n[i] = this.deepCopy(o[i]);
            }
            return n;
    
        } else if (o instanceof Object) {
            var n = {}
            for (var i in o) {
                n[i] = this.deepCopy(o[i]);
            }
            return n;
        } else {
            return o;
        }
    }
    deleteValue(arr,value) {
        
    }
    /**
     * 获取角度对应的单位向量
     * @param {Number} angle 
     */
    getDirByAngle(angle){
        if(angle === 0) {
            return cc.v2(0,1);
        } 
        else if(Math.abs(angle) === 90) {
            return cc.v2(1,0);
        }
        else if(angle === 180) {
            return cc.v2(0,-1);
        } 
        else if(angle === 270) {
            return cc.v2(-1,0);
        }
        var l = angle*Math.PI/180;
        return cc.v2(Math.sin(l),Math.cos(l)).normalizeSelf();
    }
    /**
     * 获取dir对应的angle
     * @param {cc.v2} dir 单位向量
     */
    getAngleByDir(dir){
        let len_x = dir.x;
        let len_y = dir.y;
        if(len_y === 0) {
            if(len_x < 0) {
                return 270;
            } else if(len_x > 0) {
                return 90
            }
            return 0;
        }
        if(len_x === 0) {
            if(len_y >=0) {
                return 0;
            } else  if(len_y < 0) {
                return 180;
            }
        }

        let tan_yx = Math.abs(len_y)/Math.abs(len_x);
        let angle = 0;
        if(len_y > 0 && len_x < 0) {
            angle = 270 + Math.atan(tan_yx) * 180/Math.PI;
        } else  if(len_y > 0 && len_x > 0) {
            angle = 90 - Math.atan(tan_yx) * 180/Math.PI;
        } else if(len_y < 0 && len_x < 0) {
            angle = 270 - Math.atan(tan_yx) * 180 / Math.PI;
        } else if(len_y < 0 && len_x > 0) {
            angle = Math.atan(tan_yx) * 180/Math.PI + 90;
        }
        return angle;

        if(dir && dir.mag() !== 0) {
            return -(90-Math.atan2(dir.y,dir.x)*180/Math.PI);
        } 
        return null;
    }

    //时间类方法:所有返回值都为字符串或数值类型

    /**
     * 获取当前时间
     * @param {string} exact 获取时间精确度exact(年:y,月:M,日:d,时:h,分:m,秒:s), 格式 yyyy-MM-dd HH:mm:ss
     */
    getCurTime(exact) {
        let date = new Date();
        let str =  this.timeFormat(date,this._getExactStr(exact));
        return str;
    }
    /**获取当前月份 */
    getCurMonth() {
        return new Date().getMonth() + 1;
    }
    /**获取当前年 */
    getCurYear() {
        return new Date().getFullYear();
    }
    /**获取当前日 */
    getCurDay() {
        return new Date().getDate();
    }
    /**获取当前小时 */
    getCurHour() {
        return new Date().getHours();
    }
    /**获取当前分 */
    getCurMin() {
        return new Date().getMinutes();
    }
    /**获取当前秒 */
    getCurSeconds() {
        return new Date().getSeconds();
    }

    /**
     * 获取两个时间的时间间隔
     * @param {Date} startDate 起始日期(字符串自动转日期)
     * @param {Date} endDate 结束日期
     * @param {str} exact 返回精确度(d,h,m,s,ms)
     */
    getTwoDateInterval(startDate,endDate,exact) {
        if(typeof startDate == "string") startDate = new Date(startDate);
        if(typeof endDate == "string") endDate = new Date(endDate);
        if(startDate instanceof Date && endDate instanceof Date)
        {
            let ms = endDate - startDate;
            return this._transMs(ms,exact);
        }
        console.error("input date is not instanceof Date,please check format");
        return null;
    }
    /**
     * 日期加减计算
     * @param {Date} date 日期
     * @param {number} num 数值
     * @param {string} type 类型(y,M,d,h,m,s)
     * @param {string} exact 返回值精确度(y,M,d,h,m,s)
     */
    dateCount(date,num,type,exact) {
        if(typeof date == "string") date = new Date(date);
        if(date instanceof Date) 
        {
            let tmp = date;
            let obj = {"y":"FullYear","M":"Month","d":"Date","h":"Hours","m":"Minutes","s":"Seconds"};
            let fun = obj[type];
            tmp["set"+fun](tmp["get"+fun]() + num);
            let str =  this.timeFormat(tmp,this._getExactStr(exact));
            return str;
        }
    }
    timeFormat(date,fmt) {
        let tmp = this._getExactStr(fmt);
        fmt = tmp?tmp:fmt;
        var o = {
            "M+": date.getMonth() + 1, //月份 
            "d+": date.getDate(), //日 
            "H+": date.getHours(), //小时 
            "m+": date.getMinutes(), //分 
            "s+": date.getSeconds(), //秒 
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    _getExactStr(exact) {
        let str = null;
        switch (exact) {
            case "y":
                str = "yyyy";
                break;
            case "M":
                str = "yyyy-MM";
                break;
            case "d":
                str = "yyyy-MM-dd";
                break;
            case "h":
                str = "yyyy-MM-dd HH";
            case "m":
                str = "yyyy-MM-dd HH:mm";
                break;
            case "s":
                str = "yyyy-MM-dd HH:mm:ss";
                break;
            default:
                console.warn("please input exact to get time")
                return null;
        }
        return str;
    }
    _transMs(ms,exact) {
        let result = null;
        switch (exact) {
            case "d":
                result = ms/1000/60/60/24;
                break;
            case "h":
                result = ms/1000/60/60;
            case "m":
                result = ms/1000/60;
                break;
            case "s":
                result = ms/1000;
                break;
            case "ms":
                result = ms;
                break;
            default:
                console.error("please input exact to trans ms")
                return null
        }
        return result;
    }

}
module.exports = jsTools._getInstance();