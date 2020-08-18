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
        insertPb:{
            type:cc.Prefab,
            default:null
        }
    },  
 
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //this._sertAdvCount = 0;
    },
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
        this.setAdv();
        //this._mistakeTouchHand();
    },
    setAdv:function() {
        cx_AdvMgr.hideBanner();
        if(this._sertAdvCount === 0 || !this._sertAdvCount) {
            this.showInsertAd();
            this._sertAdvCount = 1;
        } else {
            this._sertAdvCount = 0;
        }
        
    },
    showInsertAd:function() {
        let nodejs = cx_UIMgr.getPreInstance(this.insertPb);
        let node = nodejs.node;
        nodejs.init(this,function() {
            console.log("insert adv closed");
            cx_AdvMgr.showBanner();
        })
        this.node.addChild(node);
    },
    click:function() {
        this.close();
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
