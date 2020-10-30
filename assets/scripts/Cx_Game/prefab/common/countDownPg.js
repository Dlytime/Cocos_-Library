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
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._time = 0;
        this._progressBar = this.node.getComponent(cc.ProgressBar);
        this._progressBar.progress = 0;
        this._blockComp = this.node.getComponent(cc.BlockInputEvents);
        this._blockComp.enabled = false;
    },
    init:function(st,mManager,ctrlBtn,tag) {
        this.mManager = mManager;
        this.tag = tag;
        this._time = st;
        this._curTime = st;
        this._blockComp.enabled = true;
    },
    start () {

    },

    update (dt) {
        if(!this._time) return;
        if(this._curTime > 0  && this._time > 0 )
        {
            this._curTime = this._curTime - dt;
            let per = this._curTime / this._time;
            this._progressBar.progress = per;
        }
        else
        {
            this._blockComp.enabled = false;
            this._time = null;
            //if(this.mManager) this.mManager.node.emit("",{});
        }
    },
});
