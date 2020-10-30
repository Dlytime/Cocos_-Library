cc.Class({
    extends: require("prefab_base"),

    properties: {
        
    },

    onLoad () {
        this.reflusCollier();
    },
    //onEnable() {},
    //start () {},
    reflusCollier() {
        let collier = this.node.getComponent(cc.PhysicsCircleCollider);
        collier.radius = this.node.width / 2 - 10;
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        if(otherCollider.node.name == "boy" || otherCollider.node.name == "girl" || otherCollider.node.name == "bear") 
        {
            if(this.mManager.isStoneEffect(this.node)) this.stoneBroke();
        } 
    },

    stoneBroke() {
        console.log("stone broke!");
        let node = cx_UIMgr.getPreNode("stoneBroke");
        this.node.parent.addChild(node);
        node.setPosition(this.node.position);
        this.node.destroy();

        cx_AudioMgr.playPreEffect("stone_hit"); 
    },
    close() {

    },
    // update (dt) {},
});
