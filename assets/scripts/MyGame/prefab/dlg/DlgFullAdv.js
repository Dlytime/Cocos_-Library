
cc.Class({
    extends: require("Dlg"),

    properties: {
        actNode:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:
    onEnable() {
        //cx_AdvMgr.hideBanner();
        this.node.stopAllActions();
        this._mistakeTouchHand();
    },
    // onLoad () {},
    /*close:function() {

    },*/
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
            },this),cc.delayTime(st2),cc.callFunc(function(){
                cx_AdvMgr.hideBanner()
                btn.interactable = true;
            },this)));
        }
    },
    start () {

    },

    // update (dt) {},
});
