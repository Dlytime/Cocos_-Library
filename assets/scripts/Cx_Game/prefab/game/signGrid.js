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
        bgSpr:cc.Sprite,
        awardSpr:cc.Sprite,
        gouBg:cc.Node,
        gou:cc.Node,
        awardNumlbl:cc.Label,
        daySpr:cc.Sprite,

        goldSf:cc.SpriteFrame,
        powerSf:cc.SpriteFrame,
        bgSf_yellow:cc.SpriteFrame,
        bgSf_zi:cc.SpriteFrame,
        daySfs:{
            type:cc.SpriteFrame,
            default:[]
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {}, 

    init(mManager,type,day,awardType,awardNum) {
        this.mManager = mManager;
        this.type = type;
        this.day = day;
        this.awardType = awardType;
        this.awardNum = awardNum;

        return;
        this.setType(type);
        this.setDay(day);
        this.setAward(awardType,awardNum);
    },
    //type:1 已签到  2 可签到  3 不可签到
    setType(type) {
        this.type = type;
        let btn = this.node.getComponent(cc.Button);
        if(type == "1")
        {
            btn.interactable = false;
            this.gouBg.active = true;
            this.gou.active = true;
            
            this.bgSpr.spriteFrame = this.bgSf_yellow;
        }
        else if(type == "2")
        {
            btn.interactable = true;
            this.gouBg.active = false;
            this.gou.active = false;

            this.bgSpr.spriteFrame = this.bgSf_yellow;
        }
        else 
        {
            btn.interactable = false;
            this.gouBg.active = false;
            this.gou.active = false;

            this.bgSpr.spriteFrame = this.bgSf_zi;
        }
    },

    setDay(day) {
        this.daySpr.spriteFrame = this.daySfs[day - 1];
    },

    setAward(awardType,awardNum) {
        this.awardNumlbl.string = awardNum;
        if(awardType == "gold")
        {
            this.awardSpr.spriteFrame = this.goldSf;
        }
        else if(awardType == "power") {
            this.awardSpr.spriteFrame = this.powerSf;
        }
    },

    clickSign() {
        this.mManager.node.emit("doSign",{"awardNum":this.awardNum,"awardType":this.awardType,"nodejs":this,"day":this.day})
    },
    start () {

    },

    // update (dt) {},
});
