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
        if(G_PlatHelper.isOPPOPlatform()) {
            this.downBtn.node.active = false;
        }
    },
    init:function(mManager) {
        this.mManager = mManager;
        this._reflus();
    },
    onEnable() {
        //cx_AdvMgr.showBanner();
    },
    _reflus:function() {
        let pos_open = cc.v2(92,0);
        let pos_close = cc.v2(-60,0);
        let audio = cx_DyDataMgr.getAudio();
        let shake = cx_DyDataMgr.getShake();
        if(audio) {
            this.audioSpr.spriteFrame = this.openSf;
            this.audioSpr.node.setPosition(pos_open);

            cx_AudioMgr.playMusic();
        } 
        else {
            this.audioSpr.spriteFrame = this.closeSf;
            this.audioSpr.node.setPosition(pos_close);

            cx_AudioMgr.stopMusic();
        }
        if(shake) {
            this.shakeSpr.spriteFrame = this.openSf;
            this.shakeSpr.node.setPosition(pos_open);
        } 
        else {
            this.shakeSpr.spriteFrame = this.closeSf;
            this.shakeSpr.node.setPosition(pos_close);
        }
    },
    clickAudio:function() {
        let audio = cx_DyDataMgr.getAudio();
        cx_DyDataMgr.setAudio(!audio);
        
        this._reflus();
    },
    clickShake:function() {
        let shake = cx_DyDataMgr.getShake();
        cx_DyDataMgr.setShake(!shake);
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
