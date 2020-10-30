cc.Class({
    extends: require("prefab_base"),

    properties: {
        bolt:cc.Node,
        sliderBg:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.reflusCollier();
        this._rigid = this.bolt.getComponent(cc.RigidBody)
        let offlen = 15;
        this._max = this.sliderBg.width/2 - offlen - this.bolt.width/2;
        this._min = -this.sliderBg.width/2 + offlen + this.bolt.width/2;
        this.bolt.on("touchmove",this._touchMove,this);
        this.bolt.on("touchend",this._touchEnd,this);
        this.bolt.on("touchcancel",this._touchEnd,this);

        this._touchDir = "shu";
        if(this.sliderBg.rotation === 0)  this._touchDir = "heng";
    },
    reflusCollier() {
        let collier = this.bolt.getComponent(cc.PhysicsBoxCollider);
        collier.size.width = this.bolt.width;
        collier.size.height = this.bolt.height;
    },
    _touchMove(event) {
        let bolt = this.bolt;
        let touch = event.getLocation();
        let pos = this.node.convertToNodeSpaceAR(touch);

        let rigid = this._rigid;
        if(this._touchDir == "shu")
        {
            let tmp = event.getDelta();
            let dy = tmp.y;
            let targetY = bolt.x - dy;
            
            if(targetY > this._min && targetY < this._max) 
            {
                //this.bolt.y = targetY;
                //this.dot.y = targetY;
                let vdir = cc.v2(0,dy).normalizeSelf();
                let len = Math.abs(dy) * 80;
                rigid.linearVelocity = cc.v2(vdir.x * len,vdir.y * len);
            }
            else 
            {
                rigid.linearVelocity = cc.v2(0,0);
            }
        }
        else 
        {
            let dx = event.getDelta().x;
            let targetX = bolt.x + dx;
            if(targetX > this._min && targetX < this._max) 
            {
                //this.bolt.y = targetY;
                //this.dot.y = targetY;
                let vdir = cc.v2(dx,0).normalizeSelf();
                let len = Math.abs(dx) * 80;
                rigid.linearVelocity = cc.v2(vdir.x * len,vdir.y * len);
            }
            else 
            {
                rigid.linearVelocity = cc.v2(0,0);
            } 
        }
        this._touching = true;
    },
    _touchEnd() {
        let rigid = this.bolt.getComponent(cc.RigidBody);
        rigid.linearVelocity = cc.v2(0,0);
    },
    start () {

    },

     update (dt) {
        if(!this._touching) {
            this._rigid.linearVelocity = cc.v2(0,0);
        } else {
            this._touching = false;
        }

        if(this.bolt.x < this._min) this.bolt.x = this._min;
        if(this.bolt.x > this._max) this.bolt.x = this._max;

     },
});
