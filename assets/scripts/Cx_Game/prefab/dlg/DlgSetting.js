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
        shakeSpr:{
            type:cc.Sprite,
            default:null
        },
        audioSpr:{
            type:cc.Sprite,
            default:null
        },
        openSf:{
            type:cc.SpriteFrame,
            default:null
        },
        closeSf:{
            type:cc.SpriteFrame,
            default:null
        },
        downBtn:{
            type:cc.Button,
            default:null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if(cx_QyMgr.getPlatName() == "wx") {
            this.downBtn.node.active = true;
        } else {
            this.downBtn.node.active = false;
        }

        this._gou_auido = this.audioSpr.node.getChildByName("gou_white");
        this._circle_auido = this.audioSpr.node.getChildByName("circle");

        this._gou_shake = this.shakeSpr.node.getChildByName("gou_white");
        this._circle_shake = this.shakeSpr.node.getChildByName("circle");

    },
    init:function(mManager) {
        this.mManager = mManager;
        this._reflus();
    },
    onEnable() {
        //cx_AdvMgr.showBanner();
    },
    _reflus:function() {
        let pos_left = cc.v2(-60,0);
        let pos_right = cc.v2(60,0);
        let audio = cx_DyDataMgr.getAudioStatus();
        let shake = cx_DyDataMgr.getShakeStatus();

        if(audio) {
            this.audioSpr.spriteFrame = this.openSf;
            this._gou_auido.setPosition(pos_left);
            this._circle_auido.setPosition(pos_right);

            cx_AudioMgr.playMusic();
        } 
        else {
            this.audioSpr.spriteFrame = this.closeSf;
            this._gou_auido.setPosition(pos_right);
            this._circle_auido.setPosition(pos_left);

            cx_AudioMgr.stopMusic();
        }
        if(shake) {
            this.shakeSpr.spriteFrame = this.openSf;
            this._gou_shake.setPosition(pos_left);
            this._circle_shake.setPosition(pos_right);
        } 
        else {
            this.shakeSpr.spriteFrame = this.closeSf;
            this._gou_shake.setPosition(pos_right);
            this._circle_shake.setPosition(pos_left);
        }
    },
    clickAudio:function() {
        let audio = cx_DyDataMgr.getAudioStatus();
        cx_DyDataMgr.setAudioStatus(!audio);
        
        this._reflus();
    },
    clickShake:function() {
        let shake = cx_DyDataMgr.getShakeStatus();
        cx_DyDataMgr.setShakeStatus(!shake);
        this._reflus();
    },
    clickDownBtn:function() {
        cx_QyMgr.share(function(result) {

        })
    },
    close:function() {
        //cx_AdvMgr.hideBanner();
        cx_UIMgr.putNode(this.node);
    },
    start () {

    },

    // update (dt) {},
});
