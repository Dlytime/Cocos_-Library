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
        closeBtn_wx:{
            type:cc.Button,
            default:null
        }
    },

    // LIFE-CYCLE CALLBACKS:
    onEnable() {
        let plat = cx_QyMgr.getPlatName();
        switch (plat) {
            case "wx":
                this.closeBtn_wx.node.active = false;
                this.node.runAction(cc.sequence(cc.delayTime(2),cc.callFunc(function(){this.closeBtn_wx.node.active = true},this)));
                break;
            default:
                break;
        }
    },
    onLoad () {
        let plat = cx_QyMgr.getPlatName();
        let frame = this.node.getChildByName("Frame");
        let arr = frame.children;
        for (let i = 0; i < arr.length; i++) {
            const node = arr[i];
            if(node.name == plat) {
                node.active = true;
            } else {
                node.active = false;
            }
        }
    },

    start () {

    },

    // update (dt) {},
});
