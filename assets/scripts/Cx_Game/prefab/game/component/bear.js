cc.Class({
    extends: require("actor_base"),

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._super();
        this.isLive = true;
    },

    start () {

    },
    onBeginContact: function (contact, selfCollider, otherCollider) {
        if(!this.isLive) return;
        if(otherCollider.node.name == "boy" || otherCollider.node.name == "girl") 
        {
            this.touchActor(otherCollider.node);
        }
        else if (otherCollider.node.name == "stone")
        {
            if(this.mManager.isStoneEffect(otherCollider.node)) this.fallDown(otherCollider.node);
        }
    },
    touchActor(actor) {
        if(this.node.x > actor.x)
        {
            this.node.scaleX = Math.abs(this.node.scaleX);
        }
        else 
        {
            this.node.scaleX = -Math.abs(this.node.scaleX);
        }

        this.playAnim("fennu",1);
        cx_AudioMgr.playPreEffect("growl");  
    },
    fallDown(stone) {
        if(this.node.x > stone.x) 
        {
            this.node.scaleX = Math.abs(this.node.scaleX);
        }
        else 
        {
            this.node.scaleX = -Math.abs(this.node.scaleX);
        }
        this.playAnim("daodi",1);

        this.isLive = false;
        let collider = this.node.getComponent(cc.PhysicsBoxCollider);
        let rigid = this.node.getComponent(cc.RigidBody);
        setTimeout(() => {
            rigid.active = false;
        }, 0);
        
        //collider.apply();
/*         this.node.removeComponent(cc.PhysicsBoxCollider);
        this.node.removeComponent(cc.RigidBody); */
    }
    // update (dt) {},
});
