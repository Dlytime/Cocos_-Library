
cc.Class({
    extends: require("Dlg"),

    properties: {
        actNode:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:
    onEnable() {
        //cx_AdvMgr.hideBanner();
        this.node.stopAllActions();
        this._isFirst = false;
        this.actNode.active = false;
        cx_TimeMgr.delayFunc(2,()=>{
            this.actNode.active = true;
        },this);
        //this._mistakeTouchHand();
    },
    _mistakeTouchHand:function() {
        //return;
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
    onclick(event) {
        let btn = event.target.getComponent(cc.Button);
        let si = cx_DyDataMgr.getBtnMistake();
        let data = G_Switch.getConfigByKey("mistake_btn_2");
        if(this._isFirst)
        {
            if(si && data) {
                let arr = data.split("||");
                let st_1 = parseFloat(arr[0]) || 1;
                let st_2 = parseFloat(arr[1]) || 1;
                btn.interactable = false;
                cx_TimeMgr.delayFunc(st_1,()=>{
                    cx_AdvMgr.showBanner();
                },this);
                cx_TimeMgr.delayFunc(st_1 +st_2,()=>{
                    btn.interactable = true;
                    cx_AdvMgr.hideBanner();
                },this);
            }
            else
            {
                this.close();
            }
            this._isFirst = false;
        }
        else
        {
            this.close();
        }
    },
    start () {

    },

    // update (dt) {},
});
