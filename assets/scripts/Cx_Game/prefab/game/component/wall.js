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

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.reflusCollier();
    },

    start () {

    },
    reflusCollier() {
        let collier = this.node.getComponent(cc.PhysicsBoxCollider);
        collier.size.width = this.node.width;
        collier.size.height = this.node.height;
    }
    // update (dt) {},
});
