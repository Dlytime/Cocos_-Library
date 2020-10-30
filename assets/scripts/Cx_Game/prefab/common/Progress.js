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
        progressBar:{
            type:cc.ProgressBar,
            default:null
        },
        type:{
            default:0,
            tooltip:"0 从左往右增加 || 1 从右往左减少"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._isRuning = false;
        this.schedule(function() {
            // 这里的 this 指向 component
            let progress = this.progressBar.progress;
            if(this._ac > 0) 
            {
                if(progress < 1 && progress < this._curPress) {
                    this.progressBar.progress = progress + 0.01 * this._speed * this._ac;
                    this._isRuning = true;
                } 
                else {
                    this._isRuning = false;
                }
            }
            else 
            {
                if(progress > 0 && progress > this._curPress) {
                    this.progressBar.progress = progress + 0.01 * this._speed * this._ac;
                    this._isRuning = true;
                } else {
                    this._isRuning = false;
                }
            }
            
        }, 0.02);
    },
    init:function(mManager,info) {
        this.mManager = mManager;
        info = info || {};
        this._speed = info.speed || 0.35;
        //this._curPress = info.initProgress;

        this.setType(this.type);
    },
    setType(type) {
        if(type == "0") 
        {
            this.progressBar.progress = 0;
            this._curPress = 0;
            this._ac = 1;
        } 
        else 
        {
            this.progressBar.progress = 1;
            this._curPress = 1;
            this._ac = -1;
        }
    },
    setSpeed() {

    },
    setProgress(value) {
        this._curPress = value;
    },
    changeProgress(value) {
        this.progressBar.progress = value;
        this.setProgress(value);
    },
    isRuning() {
        return this._isRuning;
    },
    setRightNow() {

    },
    start () {

    },
    // update (dt) {},
});
