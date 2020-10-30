cc.Class({
    extends: require("prefab_base"),

    properties: {

    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //this.armatureDisplay  = cx_LoaderMgr.getDragonBone(this.node.name,this.node);
        this.isLive = true;
        this.isSwim = true;
        this.rigidBody = this.node.getComponent(cc.RigidBody);
        this.rigidBody.enabledContactListener = true;
    },
    init(mManager) {
        this.mManager = mManager;
        this.armatureDisplay = this.node.getComponent(dragonBones.ArmatureDisplay);
        this.playAnim("daiji");
    },
    testDra() {
        var d = this.armatureDisplay.armature();
        var c = d._skinData.displays
        c.shenti[0].texture.spriteFrame = this.testSf;
    },
    playAnim:function(name,playTimes,isReflus,speed) {
        if(this._actorAnim == name && !isReflus) return;
        if(typeof speed == "number") {
            this.armatureDisplay.timeScale = speed;
        } else {
            this.armatureDisplay.timeScale = 1;
        }
        if(name && name !== "") {
            //this.armature.animation.fadeIn(name, -1, -1, 0, 'hit');
            //this.armatureDisplay.playAnimation("Idle",-1);
            playTimes =  playTimes?playTimes:0;
            this.armatureDisplay.playAnimation(name,playTimes);
            this._actorAnim = name;
        }
    },
    pauseAnim:function() {
        this.armatureDisplay.timeScale = 0;
    },
    setTimeScale:function(st) {
        this.armatureDisplay.timeScale = st;
    },
    goOnAnim:function() {
        this.armatureDisplay.timeScale = 1;
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        let self = selfCollider.node;
        let other = otherCollider.node;
        let selfName = self.name.split("_")[0];
        let otherName = other.name.split("_")[0];
        if(selfName == "girl" || selfName == "boy")
        {
            if(otherName == "bear") 
            {
                //self.getComponent(selfName).playAnim("daiji3");
                
                this.endGame("lose",selfName);
            } 
            else if(otherName == "stone") 
            {
                if(this.mManager.isStoneEffect(other)) this.endGame("lose",selfName);
            }
            else if(otherName == "water")
            {
                this.endGame("lose",selfName);
            }
            else if(otherName == "girl") 
            {
                this.endGame("win");
            }
        }
        if(this.isSwim && (otherName == "bolt" || otherName == "frame") && otherName !== "bear") {
/*             cx_AudioMgr.playPreEffect("swim");
            this.isSwim = false;
            this.scheduleOnce(function() {
                // 这里的 this 指向 component
                this.isSwim = true;
            }, 2); */
            this.mManager.node.emit("playEffect",{"actor":this,"name":"swim"});
        }
    },

    endGame(result,actor) {
        this.mManager.node.emit("endGame",{"result":result,"actor":actor});
    },
    start () {

    },

    // update (dt) {},
});
