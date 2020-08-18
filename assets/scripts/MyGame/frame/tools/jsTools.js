var jsTools = class{
    static _instance = null;
    static _getInstance = function () {
        if(!jsTools._instance) {
            jsTools._instance = new jsTools();
        }
        return jsTools._instance;
    };
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
}
module.exports = jsTools._getInstance();