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
        isOpenHand:true
    },  
 
    onLoad () {
        this._super();
        this._goBtn = this.actNode.getComponent(cc.Button);
        this._threeBtn = this._frame.getChildByName("threeBtn").getComponent(cc.Button);
        
        if(this.isOpenHand === true)
        {
            this.hand = cx_ccTools.seekNodeByName(this.node,"hand");
            this._handPosArr = this._getHandPosArr();
            this._startHandHint();
            this.schedule(function() {
                // 这里的 this 指向 component
                this._startHandHint();
            }, 1.5);
        }
    },
    _getHandPosArr() {
        let x = -680/2 + 206/2;
        let y = 450/2 - 229/2;
        let spaceX = 20;
        let spaceY = 0;

        let arr = [];
        for (let i = 0; i < 3; i++) {
            arr.push(cc.v2(x + (206 + spaceX)*i,y));
        }

        for (let i = 0; i < 3; i++) {
            arr.push(cc.v2(x + (206 + spaceX)*i,-y));
        }
        return arr;

    },
    _startHandHint() {
        let st = cx_jsTools.getRandomNum(1,6) - 1;
        let nextPos = this._handPosArr[st];
        let act = cc.sequence(
            cc.moveTo(0.5,nextPos),
            cc.spawn(cc.fadeOut(0.5),cc.scaleTo(0.5,0.8),cc.moveBy(0.5,cc.v2(0,-20))),
            cc.spawn(cc.fadeIn(0.5),cc.scaleTo(0.5,1),cc.moveBy(0.5,cc.v2(0,20))),
        );
        this.hand.runAction(act);
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
        this.close();
    },
    start () {

    },

    // update (dt) {},
});
