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

    },  
 
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._super();
        let bg = this.node.getChildByName("bg");
        bg.getComponent(cc.Sprite).spriteFrame = cx_DyDataMgr.getSf("goBg_0");
        let board = this._frame.getChildByName("blackBoard");
        board.getComponent(cc.Sprite).spriteFrame = cx_DyDataMgr.getSf("blackBoard");
    },
    setGoldStr:function() {
        let result = cx_DyDataMgr.getResult();
        let goldlblNode = null;
        goldlblNode = cx_ccTools.seekNodeByName(this._frame,"goldlbl");
        if(goldlblNode) {
            let goldlbl = goldlblNode.getComponent(cc.Label);
            goldlbl.string = cx_DyDataMgr.getAwardGold();
        }
    },
    setBackTime() {

    },
    start () {

    },

    // update (dt) {},
});
