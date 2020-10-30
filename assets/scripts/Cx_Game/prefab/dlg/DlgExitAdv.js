
cc.Class({
    extends: require("Dlg"),

    properties: {
        btn:cc.Button
    },

    // LIFE-CYCLE CALLBACKS:
    onEnable() {
        //cx_AdvMgr.hideBanner();
        this.node.stopAllActions();
        this._mistakeTouchHand();
    },
    /*close:function() {

    },*/
    _mistakeTouchHand:function() {
        let data = cx_DyDataMgr.getBtnMistake();
        cx_AdvMgr.hideBanner();
        if(!data) {
            this.btn.interactable = true;
            return;
        }
        let arr = data.split("||");
        let st_1 = parseFloat(arr[0]) || 1.5;
        let st_2 = parseFloat(arr[1]) || 0.5;
        this.btn.interactable = false;
        cx_TimeMgr.delayFunc(st_1,()=>{
            cx_AdvMgr.showBanner();
        },this);
        cx_TimeMgr.delayFunc(st_1 + st_2,()=>{
            this.btn.interactable = true;
            cx_AdvMgr.hideBanner();
        },this);
    },
    onclick(event) {
        this.close();
    },
    start () {

    },

    // update (dt) {},
});
