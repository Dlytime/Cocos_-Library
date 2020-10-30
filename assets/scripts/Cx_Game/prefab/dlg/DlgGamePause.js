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
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    onEnable() {
        cx_AudioMgr.stopPreEffect("walk");
    },
    start () {
    },
    click(event,params) {
        let self  = this;
        switch (params) {
            case "1":
                this.mManager.node.emit("pauseGameBack",{type:"goGame"});
                break;
            case "2":
                if(G_PlatHelper.isWXPlatform())
                {
                    var closeCb = function() {
                        self.mManager.node.emit("pauseGameBack",{type:"restart"});
                    }
                    this.showFullAdv(closeCb);
                }
                else 
                {
                    this.mManager.node.emit("pauseGameBack",{type:"restart"});
                }
               
                break;
            case "3":
                if(G_PlatHelper.isWXPlatform())
                {
                    var closeCb = function() {
                        self.mManager.node.emit("pauseGameBack",{type:"backFirst"});
                    }
                    this.showFullAdv(closeCb);
                }
                else 
                {
                    this.mManager.node.emit("pauseGameBack",{type:"backFirst"});
                }
                
                break;        
            default:
                break;
        }
        this.close();
    },
    showFullAdv(closeCb) {
        let nodejs = cx_QyDlgMgr.showDlg("DlgFullAdv");
        nodejs.node.zIndex = 2000;
        nodejs.closeCloseEmit();
        nodejs.setCloseCb(closeCb);
    },
    // update (dt) {},
});
