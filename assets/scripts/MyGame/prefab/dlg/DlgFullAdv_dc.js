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
        actNode:cc.Node,
    },
    onEnable() {
        //cx_AdvMgr.hideBanner();
        this.node.stopAllActions();
        this._mistakeTouchHand();
    },
    init:function(mManager,closeCb) {
        this.mManager = mManager;
        this.closeCb = closeCb;
    },
    _mistakeTouchHand:function() {
        let self = this;
        cx_AdvMgr.hideBanner();
        let data = cx_DyDataMgr.getBtnMistake();
        let btn = this.actNode.getComponent(cc.Button);
        btn.interactable = true;
        if(data) {
            btn.interactable = false;
            console.log("mistake_btn data is ",data);
            let arr = data.split("||");
            let st1 = parseFloat(arr[0]) || 1.5;
            let st2 = parseFloat(arr[1]) || 0.5;
            this.node.runAction(cc.sequence(cc.delayTime(st1),cc.callFunc(function(){
                cx_AdvMgr.showBanner();
                btn.interactable = true;
            },this),cc.delayTime(st2),cc.callFunc(function(){
                cx_AdvMgr.hideBanner()
            },this)));
        }
    },
    // LIFE-CYCLE CALLBACKS:
    // onLoad () {},
    close:function() {  
        this.node.stopAllActions();
        cx_UIMgr.putNode(this.node);
        if(typeof this.closeCb == "function") {
            this.closeCb();
        }
    },

    start () {

    },

    // update (dt) {},
});
