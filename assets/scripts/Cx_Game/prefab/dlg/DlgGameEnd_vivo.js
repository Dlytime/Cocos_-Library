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
    extends: require("DlgGameEnd_Base"),

    properties: { 
        lblGoSpr:cc.Sprite,
        nativeBanner:cc.Node
    },  
 
    onLoad () {
        this._super();
        let bg = this.node.getChildByName("bg");
        bg.getComponent(cc.Sprite).spriteFrame = cx_DyDataMgr.getSf("goBg_0");
        let board = this._frame.getChildByName("blackBoard");
        board.getComponent(cc.Sprite).spriteFrame = cx_DyDataMgr.getSf("blackBoard");

        this._goBtn = this.actNode.getComponent(cc.Button);
        this._threeBtn = this._frame.getChildByName("threeBtn").getComponent(cc.Button);
        this._nextClose = this._frame.getChildByName("nextClose");
        this._againBtnNode = this._frame.getChildByName("playAgain");
    
        if(cx_DyData.patch) {
            let per_1 = cx_ccTools.seekNodeByName(this.node,"per_1");
            let per_2 = cx_ccTools.seekNodeByName(this.node,"per_2");
            per_1.active = false;
            per_2.active = false;
        }
    },
    onEnable() {
        this._setAdv();
    },
    _setAdv:function() {
        //cx.AdvMgr.hideBanner();
        //this._hideNativeBanner();
        let reuslt = cx_DyDataMgr.getResult();
        if(reuslt == "win")
        {
            this._showNativeBanner();
            this._threeBtn.node.active = true;
            this._againBtnNode.active = false;
            this._goBtn.node.active = true;
            this._nextClose.active = false;
        }
        else 
        {

            this._hideNativeBanner();
            this._showInsertAd();
            this._threeBtn.node.active = true;
            this._againBtnNode.active = true;
            this._goBtn.node.active = false;
            this._nextClose.active = false;
        }

        //this._showInsertAd();
/*         if(this._sertAdvCount === 0 || !this._sertAdvCount) {
            this.showInsertAd();
            this._sertAdvCount = 1;
        } else {
            this._sertAdvCount = 0;
        } */
    },
    _showInsertAd:function() {
        let self = this;
        let nodejs = cx_UIMgr.getPreNodeJs("insertAd");
        let node = nodejs.node;
        nodejs.init(this,function() {
            console.log("insert adv closed");
            self._hideNativeBanner();
        })
        this.node.addChild(node);
    },
    _showNativeBanner() {
        this.nativeBanner.active = true;
    },
    _hideNativeBanner() {
        this.nativeBanner.active = false;
    },
    mistakeTouchHand:function() {
        let data = cx_DyDataMgr.getBtnMistake();
        cx_AdvMgr.hideBanner();
        if(!data) {
            this._goBtn.interactable = true;
            this._threeBtn.interactable = true;
            return;
        }
        let arr = data.split("||");
        let st_1 = parseFloat(arr[0]) || 1.5;
        let st_2 = parseFloat(arr[1]) || 0.5;
        this._goBtn.interactable = false;
        this._threeBtn.interactable = false;
        cx_TimeMgr.delayFunc(st_1,()=>{
            cx_AdvMgr.showBanner();
        },this);
        cx_TimeMgr.delayFunc(st_1 + st_2,()=>{
            this._goBtn.interactable = true;
            this._threeBtn.interactable = true;
            cx_AdvMgr.hideBanner();
        },this);
    },
    setGoldStr:function() {
        let result = cx_DyDataMgr.getResult();
        let goldlblNode = null;
        goldlblNode = cx_ccTools.seekNodeByName(this._frame,"goldlbl");
        if(goldlblNode) {
            let goldlbl = goldlblNode.getComponent(cc.Label);
            let awardGold = cx_DyDataMgr.getAwardGold();
            let give = result == "win"?awardGold:3;
            goldlbl.string = give; 
        }
    },
    getGold:function() {
        let goldlblNode = cx_ccTools.seekNodeByName(this._frame,"goldlbl");
        let goldlbl = goldlblNode.getComponent(cc.Label);
        let award = parseInt(goldlbl.string);
        cx_DyDataMgr.addGold(award);
        this._preClose();
    },
    threeGetGold:function() {
        let self = this;
        let closedCb = function(result) {
            if(result) {
                self.doThreeGoldAward();
                self._preClose();
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
                            self._preClose();
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
        let goldlblNode = cx_ccTools.seekNodeByName(this._frame,"goldlbl");
        let goldlbl = goldlblNode.getComponent(cc.Label);
        let award = parseInt(goldlbl.string);
        let gold = award * 3;
        cx_DyDataMgr.addGold(gold);
        cx_DyDataMgr.updateCounts();
    },
    setBackTime() {

    },
    start () {

    },
    _preClose() {
        let result = cx_DyDataMgr.getResult();
        console.log("pre close ",result)
        if(result == "win") {
            this._hideNativeBanner();
            this._showInsertAd();
            this._threeBtn.node.active = false;
            this._goBtn.node.active = false;
            this._nextClose.active = true;
        }
        else {
            this.close();
        }
    },
    // update (dt) {},
});
