
cc.Class({
    extends: require("Dlg"),

    properties: {
        actNode:cc.Node,
        advNode:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:
    onEnable() {
        //cx_AdvMgr.hideBanner();
        this.node.stopAllActions();
        let isAutoClick = G_Switch.getConfigByKey("isAutoClick");
        if(isAutoClick && isAutoClick > 0) {
            let self = this;
            let js = this.advNode.getComponent("AdvListComp");
            js.autoClick(function(result) {
                self._mistakeTouchHand();
            });
        } 
        else {
            this._mistakeTouchHand();
        }
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
            self.node.runAction(cc.sequence(cc.delayTime(arr[0]),cc.callFunc(function() {
                cx_AdvMgr.showBanner();
                btn.interactable = true;
            },this),cc.delayTime(arr[1]),cc.callFunc(function() {cx_AdvMgr.hideBanner()})));
        }
    },
    start () {

    },

    // update (dt) {},
});
