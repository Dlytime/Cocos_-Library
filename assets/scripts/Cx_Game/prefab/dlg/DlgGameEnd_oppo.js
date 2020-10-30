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
        awardGoldlbl:{
            type:cc.Label, 
            default:null
        },
        misActNode:{ 
            type:cc.Node,
            default:null
        },
        winBar:{
            type:cc.Node,
            default:null
        },
        loseBar:{
            type:cc.Node, 
            default:null
        },
        timeslbl:{
            type:cc.Label,
            default:null
        },
    },  
 
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    init:function(mManager) {
        this.mManager = mManager;
        let data = cx_DyDataMgr.getLevelData();
        let gold = data.awardGold;
        this.awardGoldlbl.string = gold;
        
        let result = cx_DyDataMgr.getResult();
        if(result == "win") {
            this._winHand()
        } else {
            this._loseHand();
        }

        this.node.stopAllActions()
        this._mistakeTouchHand();
        //this.setAdv();
    },
    setAdv:function() {
        cx_AdvMgr.showBanner();
    },
    _winHand:function() {
        this.winBar.active = true;
        this.loseBar.active = false;
    },
    _loseHand:function() {
        this.winBar.active = false;
        this.loseBar.active = true;

        this.timeslbl.string = "10";
        this.callback = function() {
            // 这里的 this 指向 component
            this.timeslbl.string = (parseInt(this.timeslbl.string) - 1).toString();
            if(this.timeslbl.string == "0" ) {
                this.getGold();
                this.unschedule(this.callback);
            }
        };
        this.schedule(this.callback, 1);
    },
    getGold:function() {
        this._getGold();
        this.close({type:"go"});
    },
    _getGold:function() {
        let data = cx_DyDataMgr.getLevelData();
        let gold = data.awardGold;
        cx_DyDataMgr.addGold(gold);
        this.mManager._gameRoom.node.emit("updateGold");
    },
    reStartLive:function() {
        this.unschedule(this.callback);
        let self = this;
        let closedCb = function(result) {
            if(result) {
                console.log("复活玩家");
                self.close({type:"restart"})
            }
            else 
            {
                //self.getGold();
                self.getGold();
            }

        }
        let errorCb = function() {
            cx_QyMgr.share(function(result) {
                if(result) {
                    cx_QyMgr.share(function(result) {
                        if(result) {
                            self._doThreeGoldAward()
                            self.close({type:"go"});
                        }
                    })
                }
                else {
                    //self.getGold();
                }
                
            })
        }
        //cx_AdvMgr.showVideo(closedCb,errorCb);
        cx_AdvMgr.showVideo(closedCb);
    },
    threeGetGold:function() {
        let self = this;
        let closedCb = function(result) {
            if(result) {
                console.log("广告观看完毕");
                self._doThreeGoldAward()
                console.log("关闭结算界面");
                self.close({type:"go"});
            }
            else 
            {
                //self.getGold();
            }

        }
        let errorCb = function() {
            cx_QyMgr.share(function(result) {
                if(result) {
                    cx_QyMgr.share(function(result) {
                        if(result) {
                            self._doThreeGoldAward()
                            self.close({type:"go"});
                        }
                    })
                }
                else {
                    //self.getGold();
                }
                
            })
        }
        //cx_AdvMgr.showVideo(closedCb,errorCb);
        cx_QyMgr.share(closedCb);
    },
    _doThreeGoldAward:function() {
        let self = this;
        let data = cx_DyDataMgr.getLevelData();
        let gold = data.awardGold * 3;
        cx_DyDataMgr.addGold(gold);
        self.mManager.mManager.node.emit("updateGold");
    },
    _mistakeTouchHand:function() {
        let self = this;
        let downPos = cc.v2(0,-720);
        let upPos = cc.v2(0,-485);
        let actNode = this.misActNode;
        G_MistakeMgr.isMoveMistakeEnabled(function(result){
            console.log("isMisTouch:" ,result);
            if(result) {
                console.log("开始位移误触");
                cx_AdvMgr.hideBanner();
                actNode.setPosition(downPos);
                let seq = cc.sequence(cc.delayTime(1.3),cc.callFunc(function() {
                    actNode.runAction(cc.moveTo(0.1,upPos));
                    cx_AdvMgr.showBanner();
                },self));
                self.node.runAction(seq);
            }
            else {
                actNode.setPosition(upPos)
                cx_AdvMgr.showBanner();
            }
        })//parseInt(G_Switch.getConfigByKey("onlineMistakeStatus"))
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
        this.unschedule(this.callback);
        cx_UIMgr.putNode(this.node);
    },
    start () {

    },

    // update (dt) {},
});
