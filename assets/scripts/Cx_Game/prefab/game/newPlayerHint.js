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
    extends: require("prefab_base"),

    properties: {
        startPos:cc.v2(),
        endPos:cc.v2(),
        moveTime:0.5,
        isClick:true
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._hand = this.node.getChildByName("hand");
    },
    onEnable() {
        if(this.isShow) return;
        if(this.isClick) 
        {
            this.playHandClickAnim();
        }
        else if(this.startPos.mag() !== 0 || this.endPos.mag() !== 0)
        {
            this.playHandMoveAnim();
        }
        this.isShow = true;
        this.node.runAction(cc.sequence(cc.delayTime(4),cc.callFunc(()=>{
            this.node.active = false;
        },this)));
    },
    playHandMoveAnim() {
        this._hand.setPosition(this.startPos);
        let st = this.moveTime;
        let act = cc.repeatForever(
            cc.sequence(
                cc.moveTo(st,this.endPos),
                cc.moveTo(st,this.startPos)
            )
        );
        this._hand.runAction(act);
    },
    playHandClickAnim() {
        let st = 0.6;
        let act = cc.repeatForever(
            cc.sequence(
                cc.spawn(cc.fadeOut(st),cc.scaleTo(st,0.8),cc.moveBy(st,cc.v2(0,-20))),
                cc.spawn(cc.fadeIn(st),cc.scaleTo(st,1),cc.moveBy(st,cc.v2(0,20))),
            )
        );
        this._hand.runAction(act);
    },
    start () {

    },

    // update (dt) {},
});
