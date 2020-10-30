cc.Class({
    extends: require("DlgShowResult_Base"),

    properties: {
        hand:cc.Node
    },  
 
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._super();
        this.hand.active = false;
        //this.openHandHint();
    },
    start () {

    },
    setUI:function() {
        this.setContent();
        this.setGoldStr();
        this.setGuanKa();
        this.setBtnSpr();
        //this.setThreeBtn();
    },
    openHandHint:function() {
        this.hand.active = true;
        let posArr = [cc.v2(-175,75),cc.v2(100,75),cc.v2(300,75),cc.v2(-175,-150),cc.v2(100,-150),cc.v2(300,-150)]
        let act = cc.repeatForever(cc.sequence(
            cc.callFunc(function(){
                let sum = cx_jsTools.getRandomNum(0,posArr.length - 1);
                this.hand.setPosition(posArr[sum]);
                this.hand.opacity = 255;
                this.hand.runAction(cc.fadeOut(1))
            },this),
            //cc.fadeTo(1,10),
            cc.delayTime(1.3),
        ))
        this.hand.runAction(act);
    },
    closeHandHint:function() {
        this.hand.stopAllActions();
        this.hand.active = false;
    },
    setGuanKa:function() {
        let gklblNode = null;
        gklblNode = cx_ccTools.seekNodeByName(this._frame,"levellbl");
        let result = cx_DyDataMgr.getResult();
        if(gklblNode) {
            let levellbl = gklblNode.getComponent(cc.Label);
            if(result == "win") {
                levellbl.string = cx_DyDataMgr.getFormLevel();
            } else {
                levellbl.string = cx_DyDataMgr.getCurrentLevel();
            }
        }
    },
    // update (dt) {},
});
