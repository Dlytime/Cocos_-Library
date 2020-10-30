cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {        
        this.node.on("endGame",this._endGame,this);
        this.node.on("playEffect",this.playEffect,this);
    },

    start () {

    },
    init(Gaming) {
        this.Gaming = Gaming;
        //this.initWater();
        this.boy = null;
        this.rigid_boy = null;
        this.boyJs = null;
        this.girl = null;
        this.rigid_girl = null;
        this.girlJs = null;
        this.bear = null;
        this.rigid_bear = null;
        this.bearJs = null;
        
        this._waterCount = 0;

        this._component = {};
        this.initNodes();
        this.initBg();
        this.initActor();
        this.initByCg();
    },
    initNodes() {
        let cpArr = ["girl","boy","bear","bolt","floor","pullgan","slider","slider_floor","stone"];
        for (let i = 0; i < cpArr.length; i++) {
            const cpName = cpArr[i];
            this._component[cpName] = {};
        }
        let arr = this.node.children;
        for (let i = arr.length - 1; i >= 0; i--) {
            const node = arr[i];
            let tmparr = node.name.split("_");
            //if(tmparr.length <2) continue;
            let name = tmparr[0];
            if(name == "water") {
                this.addWater(node);
            }
            if(cpArr.indexOf(name) >= 0) 
            {
                let tag = tmparr[1] || "default";
                let nodejs = node.getComponent(name);
                if(!nodejs || !nodejs.init) debugger;
                nodejs.init(this);
                nodejs.setTag(tag);
                this._component[name][tag] = nodejs;
            }

        }
        console.log(this._component);
    },
    getComp(name,tag) {
        return this._component[name][tag];
    },
    initBg() {
        let level = cx_DyDataMgr.getCurrentLevel();
        let name = "frame_" + level;
        let frame = this.node.getChildByName("frame");

        let loadType = "local";
        
        cx_LoaderMgr.loadRes("sfs",loadType,name,(sf)=>{
            frame.getComponent(cc.Sprite).spriteFrame = sf;
        });

        let wallMask = this.Gaming.wallMask;
        cx_LoaderMgr.loadRes("sfs",loadType,"fmask_"+level,(sf)=>{
            wallMask.spriteFrame = sf;
        });

        let wallSpr = wallMask.node.getChildByName("wall").getComponent(cc.Sprite);
        let step = cx_DyDataMgr.getLevelData().step;
        cx_LoaderMgr.loadRes("sfs",loadType,"wall_"+step,(sf)=>{
            wallSpr.spriteFrame = sf;
        });

        let bgSpr = this.Gaming.bgSpr;
        cx_LoaderMgr.loadRes("sfs",loadType,"bg_"+step,(sf)=>{
            bgSpr.spriteFrame = sf;
        });

        wallMask.node.width = frame.width - 5;
        wallMask.node.height = frame.height - 5;

        wallMask.node.setPosition(frame.position);
        this.node.y = this.node.y + 50;
        wallMask.node.y = wallMask.node.y + 50;
        
    },
    initActor() {
        this._initActor("boy");
        this._initActor("girl");
        this._initActor("bear");

        this.openUpdate();
    },
    _initActor(name) {
        this[name] = cx_ccTools.seekNodeByName(this.node,name);
        if(this[name]) {
            this[name+"Js"] = this[name].getComponent(name);
            this[name+"Js"].init(this);
            this["rigid_"+name] = this[name].getComponent(cc.RigidBody);
        } 
    },
    initByCg(){},//重写
    openWater() {
        this.closeWater();
        return;
        this.Gaming.sp_water_show.node.active = true;
        this.Gaming.camera_water.node.active = true;
    },
    closeWater() {
        this.Gaming.sp_water_show.node.active = false;
        this.Gaming.camera_water.node.active = false;
    },
    addWater(node) {
        let maskNode = this.Gaming.wallMask.node;
        let pos = node.position;
        node.parent = maskNode;
        node.active = true;
    },
    _addWater(color,pos) {
        return;
        let nodejs = cx_UIMgr.getPreNodeJs("water");
        nodejs.setColor(color);
        let node = nodejs.node;
        node.setPosition(pos);
        this.node.addChild(node);

        this["_waterArr_"+color].push(node);
    },
    _creatRandomBubble(pos) {
        let randomDir = cx_jsTools.getDirByAngle(cx_jsTools.getRandomNum(-40,40));
        let randomDis = cx_jsTools.getRandomNum(10,50);
        let randomScale = cx_jsTools.getRandomNum(1,10)/10;
        let endPos = cc.v2(pos.x + randomDir.x * randomDis,pos.y + randomDir.y * randomDis);
        
    },
    endGame(result) {
        this.Gaming.node.emit("endGame",{"result":result});
        
    },
    _endGame(event) {
        this.Gaming.closePhysic();
        this.Gaming.reStartBtn.node.active = false;
        let result = event.result;
        let actor = event.actor;
        this.closeUpdate();
        if(result == "win") 
        {
            this.showWin();
        } else {
            this.showLose(actor);
        }
    },
    showWin() {
        let boy = this.boy;
        let girl = this.girl;
        //this.Gaming.closeCollider();
/*         this.rigid_boy.active = false;
        this.rigid_girl.active = false; */
        if(boy.x > girl.x) 
        {
            boy.scaleX = -Math.abs(boy.scaleX);
            girl.scaleX = Math.abs(girl.scaleX);
        }
        else 
        {
            boy.scaleX = Math.abs(boy.scaleX);
            girl.scaleX = -Math.abs(girl.scaleX);
        }

        this.boyJs.playAnim("guoguan");
        this.girlJs.playAnim("guoguan");

        let time = 1.5;
        let dis = 30;
/*         this.rigid_boy.gravityScale = 0;
        this.rigid_girl.gravityScale = 0;
        this.rigid_boy.linearVelocity = cc.v2(dis * boy.scaleX * -1 * time,0);
        this.rigid_girl.linearVelocity = cc.v2(dis * girl.scaleX * -1 * time,0); */
        boy.runAction(cc.moveBy(time,cc.v2(dis * boy.scaleX * -1,0)));
        girl.runAction(cc.moveBy(time,cc.v2(dis * girl.scaleX * -1,0)));
        let heart = cx_UIMgr.getPreNode("heartAnim");
        heart.setPosition(cc.v2((boy.x + girl.x)/2,(boy.y + girl.y)/2 + 150*boy.scaleY ));
        this.node.addChild(heart);
        cx_TimeMgr.delayFunc(time,()=>{
            this.endGame("win");
        },this);

        cx_AudioMgr.playPreEffect("heart");
    },
    showLose(actorName) {
        actorName = actorName?actorName:"boy";
        this[actorName+"Js"].playAnim("daiji3");
        cx_TimeMgr.delayFunc(0.5,()=>{
            //cx_AudioMgr.playPreEffect("hit_lava");
            this.endGame("lose");
        },this);

        cx_AudioMgr.playPreEffect("hit_lava"); 
    },

    playEffect(event) {
        let name = event.name;
        if(name == "swim") 
        {
            if(!this.isBrokeSwim) 
            {
                cx_AudioMgr.playPreEffect("swim");
                this.isBrokeSwim = true;
                cx_TimeMgr.delayFunc(2,function() {
                    // 这里的 this 指向 component
                    this.isBrokeSwim = false;
                }, this);
            }

        }
    },

    isStoneEffect(stone) {
        let stoneCollidr = stone.getComponent(cc.RigidBody);
        if(stoneCollidr.linearVelocity.mag() > 50) return true;
        return false;
    },



    closeUpdate() {
        this._isUpDate = false;
    },
    openUpdate() {
        this._isUpDate = true;
    },
    update (dt) {
        if(this._isUpDate) this.updateActor();
    },
    updateActor() {
        this._updateActor("boy");
        this._updateActor("girl");
        this._updateActor("bear");
    },
    _updateActor(name) {
        let node = this[name];
        let nodejs = this[name+"Js"];
        if(!node || nodejs.isLive === false) return;
        let js = this[name + "Js"];
        let rigid = this["rigid_" + name];

        let vecSp = rigid.linearVelocity;
        //水平运动动画处理
        let spX = vecSp.x;
        let absX = Math.abs(vecSp.x);

        let spY = vecSp.y;
        let absY = Math.abs(vecSp.y);

        if(absX < 20 && absY < 20)
        {
            js.playAnim("daiji");
        }
        else 
        {
            if(absY > 20 && absX < absY/2) 
            {
                js.playAnim("fukong");
            }
            else if(absX > 20)
            {
                node.scaleX = absX/spX * Math.abs(node.scaleX);
                js.playAnim("zoulu");

                if(name == "bear") node.scaleX = -node.scaleX;
            }
        }

    },
    checkGameEnd() {

    },
});
