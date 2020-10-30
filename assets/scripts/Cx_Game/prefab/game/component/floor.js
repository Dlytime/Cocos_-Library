cc.Class({
    extends: require("prefab_base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.reflusCollier();
    },
    reflusCollier() {
        let collier = this.node.getComponent(cc.PhysicsBoxCollider);
        collier.size.width = this.node.width;
        collier.size.height = this.node.height;
    },
    start () {

    },

    // update (dt) {},
});
