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
        timelbl:cc.Label,
        noFhBtn:cc.Button,
        fhBtn:cc.Button,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },
    onEnable() {
        this._mistakeTouchHand();
    },
    init(mManager,cb) {
        this.mManage = mManager;
        this.__closeCb = cb;
        this.timelbl.string = "10";
        this.setBackTime();
    },
    setBackTime:function() {
        let timelbl = this.timelbl;
        this.backTimeCb = function() {
            timelbl.string = (parseInt(timelbl.string) - 1).toString();
            if(timelbl.string == "0" ) {
                this.noLive();
                this.unschedule(this.backTimeCb);
            }
        };
        this.schedule(this.backTimeCb, 1);
    },
    reStartLive:function() {
        this.unschedule(this.backTimeCb);
        let self = this;
        let closedCb = function(result) {
            if(result) {
                console.log("复活玩家");
                self._reLive();
            }
            else 
            {
                self.noLive();
            }
        }
        let errorCb = function() {

        }
        cx_AdvMgr.showVideo(closedCb,errorCb);
        //cx_QyMgr.share(
    },
    _reLive() {
        this.unschedule(this.backTimeCb);
        this.__closeCb(true);
        this.close();
    },
    noLive() {
        this.unschedule(this.backTimeCb);
        this.__closeCb(false);
        this.close();
    },
    _mistakeTouchHand:function() {
        let data = cx_DyDataMgr.getBtnMistake();
        cx_AdvMgr.hideBanner();
        if(!data) {
            this.noFhBtn.interactable = true;
            this.fhBtn.interactable = true;
            return;
        }
        let arr = data.split("||");
        let st_1 = parseFloat(arr[0]) || 1.5;
        let st_2 = parseFloat(arr[1]) || 0.5;
        this.noFhBtn.interactable = false;
        this.fhBtn.interactable = false;
        cx_TimeMgr.delayFunc(st_1,()=>{
            cx_AdvMgr.showBanner();
        },this);
        cx_TimeMgr.delayFunc(st_1 + st_2,()=>{
            this.noFhBtn.interactable = true;
            this.fhBtn.interactable = true;
            cx_AdvMgr.hideBanner();
        },this);
    },
    start () {

    },

    // update (dt) {},
});
