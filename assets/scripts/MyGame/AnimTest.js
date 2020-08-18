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
        dragonBone:cc.Node,
        dragonAnimName:"",

        rateAnim:cc.Animation,
        rateAnimName:""
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.armatureDisplay = this.dragonBone.getComponent(dragonBones.ArmatureDisplay);
        this.armature = this.armatureDisplay.armature();
    },
    playAnim:function() {
        this.armatureDisplay.playAnimation(this.dragonAnimName,1);
        this.rateAnim.play(this.rateAnimName);
    },
    start () {

    },

    // update (dt) {},
});
