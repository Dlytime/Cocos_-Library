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
        pullBar:cc.Node,
        pullGan:cc.Node,
        btn:cc.Button,
        pullLen:{
            default:150,
            tooltip:"推送长度"
        },
        pullTime:{
            default:0.5,
            tooltip:"推送时间"
        }
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this._rigid = this.pullBar.getComponent(cc.RigidBody);
        this._collier = this.pullBar.getComponent(cc.PhysicsBoxCollider);
        this._arrow = this.pullBar.getChildByName("arrow");
        this.reflusCollier();


        this.pullBar.y = 0;
        this.pullGan.height = 0; 


        let dirObj = {"0":cc.v2(0,1),"90":cc.v2(1,0),"180":cc.v2(0,-1),"270":cc.v2(-1,0)};//{"0":"left","90":"up","180":"right","270":"down"};
        this.pullDir = dirObj[this.node.rotation];
    },
    init(mManager) {
        this.mManager = mManager;
    },
    doPull() {
        //this.pullBar.runAction(cc.moveBy(0.2,cc.v2(0,this.pullLen)));
        let rigid =  this._rigid;
        let st = this.pullTime;
        let speed = this.pullLen / st;
        rigid.linearVelocity = cc.v2(this.pullDir.x * speed,this.pullDir.y * speed);

        let btn = this.btn//this.pullBar.getComponent(cc.Button);
        btn.interactable = false;
        cx_TimeMgr.delayFunc(st,()=>{
            if(!this.node) return;
            btn.interactable = true;
            rigid.linearVelocity = cc.v2();
            this._arrow.rotation = 0;

            this._act = null;
        },this);

        this._act = "pull";
    },
    doBack() {
        let rigid =  this._rigid;
        let st = this.pullTime;
        let speed = this.pullLen / st;
        rigid.linearVelocity = cc.v2(-1*this.pullDir.x * speed,-1*this.pullDir.y * speed);
        cx_TimeMgr.delayFunc(st,()=>{
            if(!this.node) return;
            rigid.linearVelocity = cc.v2();
            this.pullBar.y = 0;
            this.pullGan.height = 0; 

            this._arrow.rotation = 180;

            this._act = null;
        },this);

        this._act = "back";
    },
    click() {
        if(this.pullGan.height === 0) {
            this.doPull();
        } else {
            this.doBack();
        }

    },
    reflusCollier() {
        let collier = this._collier;
        collier.size.width = this.pullBar.width;
        collier.size.height = this.pullBar.height;
        collier.offset.x = -this.pullBar.width/2;
        this._arrow.rotation = 180;
    },
    start () {

    },
    update (dt) {
        if(this._act == "pull") {
            this.pullGan.height = Math.abs(this.pullBar.y) + this.pullBar.width;
        } else if(this._act == "back"){
            this.pullGan.height = Math.abs(this.pullBar.y);
        }
    },
});
