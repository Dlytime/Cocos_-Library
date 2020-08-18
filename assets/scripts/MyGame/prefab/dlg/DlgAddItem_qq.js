// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: require("Dlg"),

    properties: {
        ProgressBar:{
            type:cc.ProgressBar,
            default:null
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let config = cx_DyDataMgr.getClickMistake("data");//G_Switch.getConfigByKey("mistake_click");
        let arr = config.split("||");
        console.log("mistake click data is  " ,config);
        this._updateSt = parseFloat(arr[0])/1000;//进度条更新时间
        this._minBack = parseFloat(arr[1]);//最小下降百分比
        this._maxBack = parseFloat(arr[2]);//最大下降百分比

        //this._backPer = 0.05;//每秒退后百分比
        this._goPerOnce = parseFloat(arr[3]);//每次点击前进百分比

        this._touchValue = parseFloat(arr[4]);//触发值
        let temp = arr[5].split("-");
        this._touchSt_min = parseFloat(temp[0]);
        this._touchSt_max = parseFloat(temp[1]);
        this._touchPercent = parseFloat(arr[6]);
        this._TouchEndTime = parseFloat(arr[7]);
    },
    onEnable() {
        this.ProgressBar.progress = 0;
        cx_AdvMgr.hideBanner()
        this.openClick();
        
        this._hasClick = false;
        this._touchSt = 0;
        this.unschedule(this._crazyBack);
        this.schedule(this._crazyBack, this._updateSt);
    },
    _crazyBack:function() {
        let per = cx_jsTools.getRandomNum(this._minBack * 1000,this._maxBack * 1000)/1000;
        let jian = per;
        let progress = this.ProgressBar.progress;
        if(/* progress > this._minBack && progress < this._maxBack &&  */progress >0 && progress <1) {
            this.ProgressBar.progress = progress - jian;
        } else if(progress >= 1) {
            this._endCrazyClick();
        } 
    },
    openClick:function() {
        this._isAllowClick = true;
    },
    closeClick:function() {
        this._isAllowClick = false;
    },
    crazyClick:function() {
        if(!this._isAllowClick) return;
        let st = this._goPerOnce;
        this.ProgressBar.progress = this.ProgressBar.progress + st;
        if(this.ProgressBar.progress >= 1) {
            this._endCrazyClick();
        }
        else if(this.ProgressBar.progress > this._touchValue && this._hasClick === false) {
            let random = cx_jsTools.getRandomNum(1,10);
            if(random/10 >= this._touchPercent  && this._touchSt > this._minBack && this._touchSt < this._maxBack) {
                this._touchSt ++;
                return;
            } else {
                if(cx_DyDataMgr.getClickMistake()) {
                    this._misTouchFunc();
                } 
                else 
                {
    
                }
            }

        }
    },
    _misTouchFunc:function() {
        cx_AdvMgr.showBanner();
        //this.closeClick();
        this.node.runAction(cc.sequence(cc.delayTime(this._TouchEndTime),cc.callFunc(function(){
            //this.openClick();
            this._endCrazyClick();
        },this)))
        this._hasClick = true;
    },
    _endCrazyClick:function() {
        this.unschedule(this._crazyBack);
        cx_UIMgr.putNode(this.node);
        cx_AdvMgr.showBanner();
        if(typeof this.endCb === "function") {
            this.endCb();
        }
        
    },
});
