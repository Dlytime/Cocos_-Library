// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var LoadRemotePlist = require("LoadRemotePlist");
cc.Class({
    extends: cc.Component,

    properties: {
        frame:cc.Node,
        content:cc.Node,
        cell:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:
    onEnable() {


    },
    onLoad () {
        this.node.zIndex = 1000;
        this.content.removeAllChildren();
        let maxLevel = cx_DyDataMgr.getLevelCount();
        for (let i = 0; i < maxLevel; i++) {
            let node = this._getNode();
            let lbl = node.getChildByName("level").getComponent(cc.Label);
            lbl.string = i+1;
            node.levelTag = i+1;
            this.content.addChild(node);
        }
    },

    _getNode:function() {
        return cc.instantiate(this.cell);
    },
    start () {

    },
    click:function(event) {
        let target = event.target;
        let level = target.levelTag;
        cx_DyDataMgr._setCurrentLevel(level);
        this.node.parent.emit("noticeGameRoom",{status:"initGame"});
        this.closeOpen();
    },
    addPower:function() {
        cx_DyDataMgr._addPower(50);
        cx_DyDataMgr.updateCounts();
    },
    addGold:function() {
        cx_DyDataMgr._addGold(100);
        cx_DyDataMgr.updateCounts();
    },
    setPlat:function(event,params) {
        let arr = ["win","wx","qq","oppo","vivo","tt"];
        let st = parseInt(params);
        cx_QyMgr._platName = arr[st];
        cx_QyDlgMgr.showTips("当前测试平台设置为："+arr[st]);
    },
    closeOpen:function() {
        this.frame.active = !this.frame.active;
    }
    // update (dt) {},
});
