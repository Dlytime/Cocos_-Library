cc.Class({
    extends: require("Dlg"),

    properties: {
        awardGoldlbl:{
            type:cc.Label, 
            default:null
        },
        resultSpr:{
            type:cc.Sprite,
            default:null
        },
        winSf:{
            type:cc.SpriteFrame,
            default:null
        },
        loseSf:{
            type:cc.SpriteFrame,
            default:null
        },
        misActNode:{
            type:cc.Node,
            default:null
        },
        nextSpr:{
            type:cc.Sprite,
            default:null
        },
        nextLeveSf:{
            type:cc.SpriteFrame,
            default:null
        },
        reStartSf:{
            type:cc.SpriteFrame,
            default:null
        },
        levelLbl:{
            type:cc.Label,
            default:null
        },
        downDcAdv:cc.Node
    },  
 
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    init:function(mManager) {
        this.mManager = mManager;
        let data = cx_DyDataMgr.getLevelData();
        let gold = data.awardGold;
        this.awardGoldlbl.string = gold;

        this.levelLbl.string = data.level;

        let result = cx_DyDataMgr.getResult();
        this.result = result;
        if(result == "win") {
            this.resultSpr.spriteFrame = this.winSf;
            this.nextSpr.spriteFrame = this.nextLeveSf;
        } else {
            this.resultSpr.spriteFrame = this.loseSf;
            this.nextSpr.spriteFrame = this.reStartSf;
        }

        this.node.stopAllActions();
        //this.setAdv();
        this._mistakeTouchHand();
    },
    setAdv:function() {
        this.downDcAdv.active = false;
        cx_AdvMgr.showBanner();
    },
    _mistakeTouchHand:function() {
        let self = this;
        let downPos = cc.v2(0,-600);
        let upPos = cc.v2(0,-400);
        let actNode = this.misActNode;
        G_MistakeMgr.isMoveMistakeEnabled(function(result){
            console.log("isMisTouch:" ,result);
            if(result) {
                console.log("开始位移误触");
                cx_AdvMgr.hideBanner();
                actNode.setPosition(downPos);
                let seq = cc.sequence(cc.delayTime(0.5),cc.callFunc(function() {
                    actNode.runAction(cc.sequence(cc.delayTime(1),cc.moveTo(0.1,upPos)));
                    cx_AdvMgr.showBanner();
                },self));
                self.node.runAction(seq);
            }
            else {
                actNode.setPosition(upPos)
                cx_AdvMgr.showBanner();
            }
        })//parseInt(G_Switch.getConfigByKey("onlineMistakeStatus"))
    },
    click:function() {
        this.close();
    },
    share:function() {
        cx_QyMgr.share();
    },
    clickCenter:function() {
        cx_AdvMgr.showBoxAd();
    },
    /*
    close:function() {
        //this.mManager.node.emit("dlgGameEndClosed");
        cx_UIMgr.putNode(this.node);
    },*/
    start () {

    },

    // update (dt) {},
});
