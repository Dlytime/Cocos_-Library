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
        nextSpr:{
            type:cc.Sprite,
            default:null
        },
        nextSfs:{
            type:cc.SpriteFrame,
            default:[]
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let frame = this.node.getChildByName("Frame");
        this._frame = frame;
        this._winContent = frame.getChildByName("winContent");
        this._loseContent = frame.getChildByName("loseContent");

        this.actNode = frame.getChildByName("goBtn");
        this.nextBtn = this.actNode.getChildByName("next");
        this.straightBtn = this.actNode.getChildByName("straightGet");
        this.threeGetBtn = frame.getChildByName("btn_threeGet");
        this._upPos = this.actNode.position;
    },
    init:function(mManager) {
        this.mManager = mManager;
        this.node.stopAllActions();
        if(this.actNode) this.actNode.stopAllActions();
        this.setUI();
        this.mistakeTouchHand();
    },
    setUI:function() {
        this.setContent();
        this.setGoldStr();
        this.setGuanKa();
        this.setBtnSpr();
        this.setThreeBtn();
    },
    setThreeBtn:function() {
        let result = cx_DyDataMgr.getResult();
        if(result == "win") {
            this.threeGetBtn.active = true;
            this.straightBtn.active = true;
            this.nextBtn.active = false;
        } else {
            this.threeGetBtn.active = false;
            this.straightBtn.active = false;
            this.nextBtn.active = true;
        }
    },
    setBtnSpr:function() {
        let result = cx_DyDataMgr.getResult();
        if(result == "win") {
            this.nextSpr.spriteFrame = this.nextSfs[1];
        } else {
            this.nextSpr.spriteFrame = this.nextSfs[0];
        }
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
        }
    },
    setGoldStr:function() {
        let node = cx_ccTools.seekNodeByName(this._frame,"gold");
        let guankaNode = cx_ccTools.seekNodeByName(this._frame,"guanka");
/*         if(cx_DyDataMgr.getResult() == "win") {
            node.active = true;
            guankaNode.active = false;
        } else {
            node.active = false;
            //guankaNode.active = true;
            return;
        } */
        let goldlblNode = null;
        goldlblNode = cx_ccTools.seekNodeByName(this._frame,"goldlbl");
        if(goldlblNode) {
            let goldlbl = goldlblNode.getComponent(cc.Label);
            goldlbl.string = cx_DyDataMgr.getAwardGold();
/*             if(cx_DyDataMgr.getIsThreeAward()) {
                goldlbl.string = cx_DyDataMgr.getAwardGold() * 3;
            } else {
                goldlbl.string = cx_DyDataMgr.getAwardGold();
            } */
            
        }
    },
    setGuanKa:function() {
        let gklblNode = null;
        let result = cx_DyDataMgr.getResult();
        gklblNode = cx_ccTools.seekNodeByName(this._frame,"levellbl");
        if(gklblNode) {
            let levellbl = gklblNode.getComponent(cc.Label);
            if(result == "win") {
                levellbl.string = cx_DyDataMgr.getFormLevel();
            } else {
                levellbl.string = cx_DyDataMgr.getCurrentLevel();
            }
        }
    },
    getGold:function() {
        let award = cx_DyDataMgr.getAwardGold();
        cx_DyDataMgr.addGold(award);
        cx_DyDataMgr.updateCounts();
        this.close();
    },
    threeGetGold:function() {
        let self = this;
        let closedCb = function(result) {
            if(result) {
                self.doThreeGoldAward()
                self.close();
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
                            self.close();
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
        cx_DyDataMgr.setRoundInfo("isthreeAward",true);
        let award = cx_DyDataMgr.getAwardGold();
        let gold = award * 3;
        cx_DyDataMgr.addGold(gold);
        cx_DyDataMgr.updateCounts();
    },
    mistakeTouchHand:function() {
        let self = this;
        let winSize = cc.winSize;
        let downPos = cc.v2(0,-(winSize.height/2 - 60));
        let upPos = this._upPos;
        let actNode = this.actNode;
        let config = cx_DyDataMgr.getMoveMistake();
        this.openMisBtnClick();
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
        this.closeMisBtnClick();
        cx_AdvMgr.hideBanner();
        actNode.setPosition(downPos);
        let seq = cc.sequence(cc.delayTime(st1),cc.callFunc(function() {
            actNode.runAction(cc.sequence(cc.delayTime(st2),cc.moveTo(moveSt,upPos)));
            cx_AdvMgr.showBanner();
            this.openMisBtnClick();
        },self));
        self.node.runAction(seq);
    },
    openMisBtnClick:function() {
        let arr = this.actNode.children;
        for (let i = 0; i < arr.length; i++) {
            const btnNode = arr[i];
            if(btnNode.active) {
                btnNode.children[0].getComponent(cc.Button).interactable = true;
            }
        }
    },
    closeMisBtnClick:function() {
        let arr = this.actNode.children;
        for (let i = 0; i < arr.length; i++) {
            const btnNode = arr[i];
            if(btnNode.active) {
                btnNode.children[0].getComponent(cc.Button).interactable = false;
            }
        }
    },
    backFirstPage:function() {
        cx_DyDataMgr.setRoundInfo("joinType",2);
        this.close();
    },
    goNextLevel:function() {
        cx_DyDataMgr.setRoundInfo("joinType",1);
        this.close();
    },
    start () {

    },

    // update (dt) {},
});
