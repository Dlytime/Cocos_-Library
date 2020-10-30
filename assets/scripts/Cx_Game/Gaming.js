cc.Class({
    extends: cc.Component,

    properties: {
        guankalbl_startGame:cc.Label,
        guankalbl_gaming:cc.Label,
        sp_water_show:cc.Sprite,
        camera_water:cc.Camera,
        wallMask:cc.Mask,
        bgSpr:cc.Sprite,
        reStartBtn:cc.Button,
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this._startGameNode = cx_ccTools.seekNodeByName(this.node,"startGame");
        this._startGameNode.zIndex = 100;
        this._logoAnim = this._startGameNode.getChildByName("logo").getComponent(cc.Animation);
        this.node.on("endGame",this._endGameEvent,this);
        this.openWater();
        this.openCollider();
    },
    openWater() {
        return;
        const texture = new cc.RenderTexture();
        let sp_water_show = this.sp_water_show;
        texture.initWithSize(sp_water_show.node.width, sp_water_show.node.height);
        const spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);
        this.camera_water.targetTexture = texture;
        sp_water_show.spriteFrame = spriteFrame;
        //sp_water_show.node.zIndex = 100;
    },
    _pauseGameBack:function(event) {
        switch (event.type) {
            case "goGame":
                this.goOnGame();
                break;
            case "restart":
                this.reStart();
                break;
            case "backFirst":
                this._status = "Gaming";
                this._endGame("break");
                break;            
            default:
                break;
        }
    },
    openPhysic() {
        cc.director.getPhysicsManager().enabled = true;
    },
    openCollider:function() {
        cc.director.getPhysicsManager().enabled = true;
/*         cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        cc.PhysicsManager.DrawBits.e_pairBit |
        cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        cc.PhysicsManager.DrawBits.e_jointBit |
        cc.PhysicsManager.DrawBits.e_shapeBit
        ; */


        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
/*         manager.enabledDebugDraw = true;
        manager.enabledDrawBoundingBox = true; */
    },
    closePhysic() {
        cc.director.getPhysicsManager().enabled = false;
    },
    closeCollider:function() {
        cc.director.getPhysicsManager().enabled = false;
        var manager = cc.director.getCollisionManager();
        manager.enabled = false;
        //manager.enabledDebugDraw = true;
        //manager.enabledDrawBoundingBox = true;
    },
    init:function(mManager) {
        this.mManager = mManager;
        this._levelData = cx_jsTools.deepCopy(cx_DyDataMgr.getLevelData());

        this._ai = null;

        this._recycleNodes();
        this._transLevelData();
        this._initByLevelData();
        this._setHint();

        this._status = "preStart";//"preStart","Gaming","GameEnd"
        this._reflusStatus();
    },
    /**关卡数据二次处理 */
    _transLevelData:function() {

    },
    startGame:function() {
        if(this._status == "Gaming") return;
        let isAllow = cx_DyDataMgr.joinGame();
        if(isAllow)
        {
            this._status = "Gaming";
            this._reflusStatus();
            this.mManager.node.emit("noticeGameRoom",{status:"gameStart"});
            cx_DyDataMgr.updateCounts();
            this._startGame();
            if(cx_DyDataMgr.getCurrentLevel() === 1/*  && !G_PlatHelper.isWINPlatform() */) {
                this._showDlgNewPlayerHint();
            } 
        }
        else 
        {
            cx_QyDlgMgr.showDlg("DlgLackPower");
            this.mManager.node.emit("noticeGameRoom",{status:"initGame"});
        }
    },
    _startGame() {
        this._showLevel();
    },
    /**重玩 */
    reStart:function() {
        let level = cx_DyDataMgr.getCurrentLevel();
        let power = cx_DyDataMgr.getPower();
        let needPower = cx_DyDataMgr.getLevelPowerCost(level);
        if(power < needPower) {
            cx_QyDlgMgr.showDlg("DlgLackPower",this);
        } else {
            this._recycleNodes();
            this._initByLevelData();
        }
        //this.mManager.node.emit("noticeGameRoom",{"status":"gameEnd"});
    },
    /**新手引导 */
    _setHint:function() {

    },
    /**根据游戏状态刷新(Ui) */
    _reflusStatus:function() {
        let status = this._status;
        if(status === "preStart") 
        {
            this.guankalbl_gaming.node.parent.active = false;
            this.guankalbl_startGame.node.parent.active = true;
            this._logoAnim.play();
            this.reStartBtn.node.active = false;
            this._startGameNode.active = true;
        } 
        else if(status == "Gaming") 
        {
            this.guankalbl_gaming.node.parent.active = true;
            this.guankalbl_startGame.node.parent.active = false;
            this._logoAnim.stop();
            this.reStartBtn.node.active = true;
            this._startGameNode.active = false;
        } 
        else if(status == "GameEnd")
        {

        }
    },
    /**游戏数据初始化 */
    _initByLevelData:function() {

        let level = cx_DyDataMgr.getCurrentLevel();
        //let showlevel = cx_DyDataMgr.getShowLevel();
        this.guankalbl_startGame.string = level;
        this.guankalbl_gaming.string = level;

        let self = this;
        cx_LoaderMgr.loadRes("prefab","local","level/level_"+level,(prefab)=>{
            let node = cx_UIMgr.getNode(prefab);
            let jsComp = "level";//require(node.name)?node.name:"level";
            let nodejs = node.addComponent(jsComp);
            //let nodejs = cx_UIMgr.getNodeJs(prefab);
            //let node = nodejs.node;
            nodejs.init(this);
            self.node.addChild(node);
            
            self._curLevelNode = node;
            self._curLevelNodeJs = nodejs;

            if(self._status == "Gaming") {
                self._showLevel();
            } else {
                self._hideLevel();
            }
            
        });


        let bgSpr = this.bgSpr;
        let step = cx_DyDataMgr.getLevelData().step;
        cx_LoaderMgr.loadRes("sfs","local","bg_"+step,(sf)=>{
            bgSpr.spriteFrame = sf;
        });


    },

    _hideLevel() {
        this.closePhysic();
        this.wallMask.node.active = false;
        this._curLevelNode.active = false;
    },
    _showLevel() {
        this.openPhysic();
        this.wallMask.node.active = true;
        this._curLevelNode.active = true;
    },

    pauseGame:function() {
        this._status = "Pause";
    },
    goOnGame:function() {
        this._status = "Gaming";
    },
    /**分帧加载 */
    _timesLoad:function() {
        let times = 1;
        this.callback = function () {
            if (true) {
                // 在第六次执行回调时取消这个计时器
                this.unschedule(this.callback);
                this.callback = null;
                return;
            }
        }
        this.schedule(this.callback, times);
    },
    _endGameEvent(event) {
        let result = event.result;
        let delayTime = event.delayTime;
        this._endGame(result,delayTime);
    },
    TestEndGame:function(event,params) {this._endGame(params|| "win")},
    /**游戏结束处理方法,需告知游戏结果 */
    _endGame:function(result,delayTime) {
        if(this._status !== "GameEnd") {
            this._status = "GameEnd";
            cx_DyDataMgr.setRoundInfo("result",result);
            if(delayTime) {
                cx_TimeMgr.delayFunc(delayTime,function(){
                    this.mManager.node.emit("noticeGameRoom",{"status":"gameEnd"});
                },this)
            } else {
                this.mManager.node.emit("noticeGameRoom",{"status":"gameEnd"});
            }
        }
    },
    /**资源节点回收 */
    _recycleNodes:function() {
        let arr = [];
        cx_UIMgr.putNodeArr(arr);

        if(this._curLevelNode) this._curLevelNode.destroy();
        let water_blue = this.wallMask.node.getChildByName("water_blue");
        let water_red = this.wallMask.node.getChildByName("water_red");
        if(water_blue) water_blue.destroy();
        if(water_red) water_red.destroy();
        this._curLevelNode = null;
        return;
    },
    prefabLoad:function() {
        //this.init(this.mManager);
    },

    update (dt) {

    },
    _cameraFollow(dt) {
        this._cameraReflus(dt);
    },
    _cameraShake() {
        let st = 0.02;
        let len = 5;
        let act = cc.repeat(cc.sequence(
            cc.moveBy(st,cc.v2(-len,-len)),
            cc.moveBy(st,cc.v2(len,len)),
            cc.moveBy(st,cc.v2(-len + 3,len - 2)),
            cc.moveBy(st,cc.v2(len - 3,-len +2))
        ),1);
        this.cameraNode.runAction(act);
    },

    _showDlgNewPlayerHint:function() {

    },
});
