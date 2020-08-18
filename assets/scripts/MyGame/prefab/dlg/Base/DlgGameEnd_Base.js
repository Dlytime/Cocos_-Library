
cc.Class({
    extends: require("Dlg"),

    properties: {
        reviveSt:{
            default:0,
            tooltip:"复活倒计时，若小于等于0，则不使用复活机制"
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let frame = this.node.getChildByName("Frame");
        this._frame = frame;
        this._winContent = frame.getChildByName("winContent");
        this._loseContent = frame.getChildByName("loseContent");

        this.actNode = frame.getChildByName("goBtn");
        this._upPos = this.actNode.position;
    },
    init:function(mManager) {
        this.mManager = mManager;
        this.node.stopAllActions();
        if(this.actNode) this.actNode.stopAllActions();
        this.setUI();
        cx_DyDataMgr.setIsThreeAward(false);
        this.mistakeTouchHand();
    },
    mistakeTouchHand:function() {
        let self = this;
        let winSize = cc.director.getWinSize();
        let downPos = cc.v2(0,-(winSize.height/2 - 60));
        let upPos = this._upPos;
        let actNode = this.actNode;
        let config = cx_DyDataMgr.getMoveMistake();

        let btn = actNode.getComponent(cc.Button);
        btn.interactable = true;
        if(!config) {
            actNode.setPosition(upPos)
            cx_AdvMgr.showBanner();
            return;
        }
        let arr = config.split("||");
        let st1 = arr[0];
        let st2 = arr[1];
        let moveSt = arr[2]
        console.log("开始位移误触");
        btn.interactable = false;
        cx_AdvMgr.hideBanner();
        actNode.setPosition(downPos);
        let seq = cc.sequence(cc.delayTime(st1),cc.callFunc(function() {
            actNode.runAction(cc.sequence(cc.delayTime(st2),cc.moveTo(moveSt,upPos)));
            cx_AdvMgr.showBanner();
            btn.interactable = true;
        },self));
        self.node.runAction(seq);
    },
    setUI:function() {
        this.setContent();
        this.setGoldStr();
    },
    setContent:function() {
        let result = cx_DyDataMgr.getResult();
        if(result == "win")
        {
            this._winContent.active = true;
            this._loseContent.active = false;
        }
        else 
        {
            this._winContent.active = false;
            this._loseContent.active = true;
            this.setBackTime();
        }
    },
    setGoldStr:function() {
        let result = cx_DyDataMgr.getResult();
        let goldlblNode = null;
        if(result == "win") 
        {
            goldlblNode = cx_ccTools.seekNodeByName(this._winContent,"goldlbl");
        } 
        else 
        {
            goldlblNode = cx_ccTools.seekNodeByName(this._loseContent,"goldlbl");
        }
        if(goldlblNode) {
            let goldlbl = goldlblNode.getComponent(cc.Label);
            goldlbl.string = cx_DyDataMgr.getAwardGold();
        }
    },
    setBackTime:function() {
        let timeBg = this._loseContent.getChildByName("timeBg");
        let timelbl = timeBg.getChildByName("timelbl").getComponent(cc.Label);
        let lose_hint = this._loseContent.getChildByName("lose_hint");
        if(this.reviveSt <= 0) {
            timeBg.active = false;
            lose_hint.active = true;
            timelbl.string = "";
            return;
        }
        timeBg.active = true;
        lose_hint.active = false;
        timelbl.string = this.reviveSt;
        this.backTimeCb = function() {
            timelbl.string = (parseInt(timelbl.string) - 1).toString();
            if(timelbl.string == "0" ) {
                this.getGold();
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
                self.close({type:"restart"})
            }
            else 
            {
                self.getGold();
            }
        }
        let errorCb = function() {
            cx_QyMgr.share(function(result) {
                if(result) {
                    cx_QyMgr.share(function(result) {
                        if(result) {
                            self.doThreeGoldAward()
                            self.close({type:"go"});
                        }
                    })
                }
                else {

                }
            })
        }
        cx_AdvMgr.showVideo(closedCb,errorCb);
        //cx_QyMgr.share(closedCb);
    },
    getGold:function() {
        let award = cx_DyDataMgr.getAwardGold();
        cx_DyDataMgr.addGold(award);
        this.mManager._gameRoom.node.emit("updateGold");
        this.close({type:"go"});
    },
    threeGetGold:function() {
        let self = this;
        let closedCb = function(result) {
            if(result) {
                self.doThreeGoldAward()
                self.close({type:"go"});
            }
            else 
            {

            }

        }
        let errorCb = function() {
            cx_QyMgr.share(function(result) {
                if(result) {
                    cx_QyMgr.share(function(result) {
                        if(result) {
                            self.doThreeGoldAward()
                            self.close({type:"go"});
                        }
                    })
                }
                else {

                }
            })
        }
        cx_AdvMgr.showVideo(closedCb,errorCb);
        //cx_QyMgr.share(closedCb);
    },
    doThreeGoldAward:function() {
        cx_DyDataMgr.setIsThreeAward(true);
        let award = cx_DyDataMgr.getAwardGold();
        let gold = award * 3;
        cx_DyDataMgr.addGold(gold);
        cx_DyDataMgr.updateCounts();
    },
    close(info) {
        if(this.mManager) 
        {
            if(this.mManager.node instanceof cc.Node) {
                this.mManager.node.emit(this.node.name+"Closed",{info:info});
            } 
            else if(typeof this.mManager.dlgClosed == "function") {
                this.mManager.dlgClosed(this.node.name,info);
            }
        }
        this.unschedule(this.backTimeCb);
        cx_UIMgr.putNode(this.node);
    },
    start () {

    },

    // update (dt) {},
});
