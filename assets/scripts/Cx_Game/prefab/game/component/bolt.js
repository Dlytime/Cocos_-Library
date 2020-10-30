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
        this._btn = this.node.getComponent(cc.Button);
        this._btn.interactable = false;
        this.node.on("touchstart",this.click,this);
    },
    onEnable() {
        this._btn.interactable = true;
        this.node.opactiy = 255;
    },
    start () {

    },
    reflusCollier() {
        let collier = this.node.getComponent(cc.PhysicsBoxCollider);
        collier.size.width = this.node.width;
        collier.size.height = 20//this.node.height;
    },
    click() {
        //this._btn.interactable = false;
        this.node.off("touchstart",this.click,this);
        let len = this.node.width;
        let rotation = this.node.rotation;
        let dir = rotation == 0 ? cc.v2(-1,0) :cx_jsTools.getDirByAngle(rotation - 90);
        let offpos = cc.v2(dir.x * len,dir.y * len);


        let rigid = this.node.getComponent(cc.RigidBody);
        let st = 0.2;
        let speed = len / st;
        rigid.linearVelocity = cc.v2(dir.x * speed,dir.y * speed);
        let act = cc.sequence(cc.delayTime(st),cc.callFunc(()=>{
            rigid.linearVelocity = cc.v2(0,0);
        },this),cc.delayTime(0.1),cc.fadeOut(0.2));
        this.node.runAction(act);

        cx_AudioMgr.playPreEffect("pin_removed");  

        if(this.mManager) {
            this.mManager.node.emit();
        }
    },
    close() {

    },
    // update (dt) {},
});
