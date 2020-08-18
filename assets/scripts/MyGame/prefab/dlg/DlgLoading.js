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
        percents:cc.Label,
        progressBar:cc.ProgressBar
    },

    // LIFE-CYCLE CALLBACKS:
 
    // onLoad () {}, 
    init:function(mManager) {
        this.mManager = mManager;
        this.playPercent();
    },
    playPercent() {
        this.percent = 0;
        var st = 1;
        this.callback = function () {
            this.percent = this.percent + st;
           
            if(this.percent >= 100)  {
                this.percents.string = "100%";
                this.unschedule(this.callback);
                this.node.runAction(cc.sequence(cc.delayTime(0.3),cc.callFunc(function(){
                     this.mManager.node.emit("noticeGameRoom",{status:"initGame"});
                     this.close();
                },this)));
            } else {
                this.percents.string = this.percent.toString() + "%";
                this.progressBar.progress = this.percent / 100;
            }
        }
        this.schedule(this.callback, 0.01);
    },
    start () {

    },

    // update (dt) {},
});
