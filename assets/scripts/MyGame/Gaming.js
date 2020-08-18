cc.Class({
    extends: cc.Component,

    properties: {
        levelShowlbl:{
            type:cc.Label,
            default:null
        },
        Rocking:{
            type:cc.Node,
            default:null
        },
        cameraNode:{
            type:cc.Node,
            default:null
        },
        hitFxPb:{
            type:cc.Prefab,
            default:null
        },
        skillBtn:{
            type:cc.Node,
            default:[]
        },
        playerInfoShow:{
            type:cc.Node,
            default:null
        },
    },

    // LIFE-CYCLE CALLBACKS:
    AAAAAA() {
        let sf = cx_ccTools.screenNodeShot(this._playerJs.node);
        let node = this.node.getChildByName("AAA");
        node.getComponent(cc.Sprite).spriteFrame = sf;
        node.scaleY = -1;
    },
    onLoad () {
        this._startGameNode = cx_ccTools.seekNodeByName(this.node,"startGame");
        this._startGameNode.zIndex = 100;
        this._Rocking = this.Rocking.getComponent("Rocking");
        this._jumpCd = true;

        this._DIR = cx_DyData.ACTOR_DIR;
        this._STATE = cx_DyData.ACTOR_STATE; 

        this.openCollider();
        this.node.on("attackCheck",this._checkAttack,this);
        this.node.on("onCollision",this.onCollision,this);

        //fight zhuanshu
        this.node.on("updateInfoCtrl",this._updateInfoCtrl,this);
        this.node.on("pauseGameBack",this._pauseGameBack,this);
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
    openCollider:function() {
        //cc.director.getPhysicsManager().enabled = true;
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        //manager.enabledDebugDraw = true;
        //manager.enabledDrawBoundingBox = true;
    },
    closeCollider:function() {
        return;
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
            this._ai.init(this,this._playerJs,this._enemyJs);
        }
        else 
        {
            cx_QyDlgMgr.showDlg("DlgLackPower");
            this.mManager.node.emit("noticeGameRoom",{status:"initGame"});
        }
    },
    /**新手引导 */
    _setHint:function() {

    },
    /**根据游戏状态刷新(Ui) */
    _reflusStatus:function() {
        let status = this._status;
        if(status === "preStart") 
        {
            this._startGameNode.active = true;
        } 
        else if(status == "Gaming") 
        {
            this._startGameNode.active = false;
        } 
        else if(status == "GameEnd")
        {

        }
    },
    /**游戏数据初始化 */
    _initByLevelData:function() {
        let level = cx_DyDataMgr.getCurrentLevel();
        let showlevel = cx_DyDataMgr.getShowLevel();
        this.levelShowlbl.string =  showlevel ;

        this._orderState = null;
        this._attackState = null;
        this._normalStep = 0;
        this._loadLevelPb(level);

        this._initActor(level);
    },
    _initActor(level) {
        let levelData = cx_DyDataMgr.getCurLevelData();
        let name_1 = cx_DyDataMgr.getPersonData().formActorChoosed;
        
        let info_1 = cx_jsTools.deepCopy(cx_DyDataMgr.getPlayerInfo(name_1));
        let info_2 = cx_jsTools.deepCopy(cx_DyDataMgr.getCurLevelEnemyInfo())
        let name_2 = info_2.name;

        //初始化actor
        let self = this;
        let basePath = "prefab/actor/";

        let scale = 0.3;
        cx_LoaderMgr.loadPrefab(basePath+name_1,function(prefab){
            self._playerJs = cx_UIMgr.getNodeJs(prefab);
            let player = self._playerJs.node;
            self.node.addChild(player);
            self._playerJs.init(self,info_1,1,cc.v2(-325,-320));
            player.scale = scale;
            self._checkActorLoad();
        })
        cx_LoaderMgr.loadPrefab(basePath+name_2,function(prefab){
            self._enemyJs = cx_UIMgr.getNodeJs(prefab);
            let enemy = self._enemyJs.node;
            self.node.addChild(enemy);
            self._enemyJs.init(self,info_2,2,cc.v2(325,-320));
            enemy.scaleX = -scale;
            enemy.scaleY = scale;
            self._checkActorLoad();
        })

        //获取ai
        let ainame = "AI_" +  levelData.ai;
        let ai = require(ainame);
        this._ai = new ai();


        //初始化HP等界面信息
        this._playerInfoCtrl = this.playerInfoShow.getComponent("playerInfoShow");
        this._playerInfoCtrl.init(this,info_1,info_2)
    },
    _checkActorLoad:function() {
        if(this._playerJs && this._enemyJs) {
            this._cameraReflus();
        }
    },
    _initPlayerInfoCtrl() {
        //let info_1 = 

    },
    /**重玩 */
    reStart:function() {
        cx_QyDlgMgr.showDlg("DlgShowVs",this.mManager);
        //this.mManager.node.emit("noticeGameRoom",{"status":"gameEnd"});
    },
    pauseGame:function() {
        this._status = "Pause";
    },
    goOnGame:function() {
        this._status = "Gaming";
    },
    AAActrlGame() {
        if(this._status == "Gaming") {
            this.pauseGame();
            cx_QyDlgMgr.showDlg("DlgGamePause",this);
            //cc.director.getScheduler().setTimeScale(0.5);
        }
        else if(this._status == "Pause") {
            this.goOnGame();
        }
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
    TestEndGame:function() {this._endGame(cx_DyDataMgr.getResult() || "win")},
    /**游戏结束处理方法,需告知游戏结果 */
    _endGame:function(result,delayTime) {
        if(this._status == "Gaming") {
            this._status = "GameEnd";
            cx_DyDataMgr.setResult(result);
            if(result == "win") 
            {
                
            } 
            else 
            {

            }
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
        arr.push(this._playerJs?this._playerJs.node:null);
        arr.push(this._enemyJs?this._enemyJs.node:null);
        cx_UIMgr.putNodeArr(arr);
        this._playerJs = null;
        this._enemyJs = null;
        return;
    },
    prefabLoad:function() {

    },
    _loadLevelPb:function(level) {

    },

    fireSkill(event,params) {
        let skill = this._playerJs.playerInfo.skill;
        if(!this._normalStep) this._normalStep = 0;
        let Obj = {"1":"normal","2":"defense","3":"skill_1","4":"skill_2"};
        let name = Obj[params];
        if(name == "normal")
        {
            if(this._normalStep === 0) {
                name = "normal_3";
            } else {if(this._normalStep == 1) {
                name = "normal_2";
            } else {
                name = "normal_1";
            }}
        }
        if(!this._playerJs.isAllowFireSkill(name)) return;
        switch (Obj[params]) {
            case "normal":
                if(!this._normalStep) this._normalStep = 0;
                this._normalStep++;
                let sendinfo = skill["normal_"+this._normalStep];
                sendinfo.step = this._normalStep;
                //sendinfo.name = "normal";
                this._orderState = {"state":this._STATE.Attack,"name":"normal_" + this._normalStep,"params":sendinfo};
                if(this._normalStep === 3) this._normalStep = 0;
                let self = this;
                cx_TimeMgr.initTime(sendinfo.cd + 0.5,"normalAttack",function(){
                    self._normalStep = 0;
                })
                break;
            case "defense":
                //cx_QyDlgMgr.showTips("防御")
                this._orderState = {"state":this._STATE.Defense,"name":"defense","params":skill.defense};
                break;
            case "skill_1":
                //cx_QyDlgMgr.showTips("普通技能")
                skill.skill_1.name = "skill_1";
                this._orderState = {"state":this._STATE.Attack,"name":"skill_1","params":skill.skill_1};
                break;
            case "skill_2":
                //cx_QyDlgMgr.showTips("大招")
                skill.skill_2.name = "skill_2";
                this._orderState = {"state":this._STATE.Attack,"name":"skill_2","params":skill.skill_2};
                break;
            default:
                break;
        }
    },
    /**是否允许玩家释放技能 */
    isAllowFireSkill(skillname) {
        let skill = this._playerJs.playerInfo.skill;
        if(this._playerJs.getState() === this._STATE.Attacked) {
            //cx_QyDlgMgr.showTips("被击状态不能放技能");
            return false;//被击状态不能放技能
        } 
        if(this._playerJs.getState() === this._STATE.Attack) {
            let statelei = this._playerJs.getStateLei();
            if(!statelei.isAllowBreak()) {
                //cx_QyDlgMgr.showTips("攻击中且当前不可被打断");
                return false;//攻击中且当前不可被打断
            }
        }
        if(!this._normalStep) this._normalStep = 0;
        if(skillname == "normal") {
            if(this._normalStep == 0) {
                skillname = "normal_3";
            } else {
                skillname = "null";
            } 
        }
        let name = skillname == "normal"?"normal_"+(this._normalStep + 1):skillname;
        if(this._playerJs.curMp < skill[name].Mp) {
            //cx_QyDlgMgr.showTips("蓝量不够不能放技能");
            return false;//蓝量不够不能放技能
        }
        if(!this._playerJs.getCd(name)) {
            //cx_QyDlgMgr.showTips("技能没Cd");
            return false;//技能没Cd
        } 
        return true;
    },
    _updateInfoCtrl(event) {
        let actor = event.actor;
        let type = event.type;
        if(type == "mp") {
            this._playerInfoCtrl.reflusMp(actor.curMp,actor.pTag);
        }
    },
    tryMove(x,actor) {
        let sum = 80;
        let limit = {"max": 2046 / 2 - sum,"min": -2046/2 + sum};
        let state = actor.getStateLei();

        let other = this._getOtherActor(actor);
        let dis_f = Math.abs(other.node.x - actor.node.x);
        let dis_l = Math.abs(other.node.x -x);
        let dis = other.node.x - actor.node.x;
        let idleDir = dis>0?"left":"right";
        let moveDir = x - actor.node.x > 0?"right":"left";
        let faceDir = dis_l > dis_f ? "noface":"face";

        let sendObj = {"moveDir":moveDir,"faceDir":faceDir,"idleDir":idleDir};
        if(state.stateType === this._STATE.Attack) {
            let attackRange = state.getSkillInfo().attackRange;
            if(attackRange && dis_f < attackRange && dis_l < dis_f) return actor.getMoveLimit()?sendObj: false;
        }
        if(x < limit.max && x > limit.min) {
            //this.node.x = x;
            if(this._colling)
            {
                if(dis_l - dis_f > 0) {//背离另一个玩家
                    return sendObj;
                }
                return actor.getMoveLimit()?sendObj: false;
            }
            else {
                return sendObj;
            }
        }
        return actor.getMoveLimit()?sendObj: false;
    },
    _getOtherActor(actor) {
        if(actor.pTag === 1) {
            return this._enemyJs;
        }
        return this._playerJs;
    },
    /**玩家与玩家碰撞 */
    onCollision(event) {
        this._colling = event.type == "enter"?true:false;
        //console.log("colling : ",this._colling);
    },

    update (dt) {
        if(this._status !== "Gaming") return;
        /**
         * 所有改变状态情境：用户输入(移动，跳跃，技能释放),攻击碰撞检测(优先)
         */
        //let result = this._checkAttack();
        //this._reflueFaceDir();
        if(this._ai) this._ai.update(dt);
        if(this._attackState) 
        {
            this._handAttack();
        } 
        else 
        {
            let state = cx_jsTools.deepCopy(this._orderState);
            this._orderState = null;
            let dir = this._getRockDir();
            this._handInput(this._playerJs,state,dir);
            this._handInput(this._enemyJs,this._ai.getOrderState(),this._ai.getDir());
        }
        this._cameraFollow(dt);
    },
    _checkAttack(event) {
        let attacker = event.actor;
        let beAttacker = this._getOtherActor(attacker);
        if(this._colling || event.type == "skill") {
            this._attackState = {"attacker":attacker,"beAttacker":beAttacker,"params":event.params,"skillType":event.skillType,"skillNode":event.skillNode};
        }
    },
    _setActorZIdex(actor) {
        let other = this._getOtherActor(actor);
        actor.node.zIndex = 1;
        other.node.zIndex = 0;
    },
    _handAttack() {
        if(!this._attackState) return;

        let obj = this._attackState;
        let attacker = obj.attacker;
        let beAttacker = obj.beAttacker;
        if(beAttacker.getImmuneStatus()) {
            this._attackState = null;
            return;
        }

        let info = cx_jsTools.deepCopy(obj.params);
        info.attackDir = attacker.getFaceDir();//attacker.node.scaleX/Math.abs(attacker.node.scaleX);
        if(beAttacker.isFly()) {
            info.addState.push("HitFly");
        }

        let result = this._tryTransState(beAttacker,this._STATE.Attacked,null,info.addState);
        //伤害计算处理/蓝量恢复处理
        let tag = beAttacker.pTag;
        let hp = null;
        if(result)
        {
            hp = info.attack;
            if(info.name !== "skill_2") {
                this.mpAdd(attacker,7,true);
            }
            this.mpAdd(beAttacker,3);
        }
        else {
            if(info.name !== "skill_2") {
                this.mpAdd(attacker,5,true);
            }
            hp = 5;
        }
        let hpresult = this._playerInfoCtrl.decreaseHp(hp,tag);
        if(hpresult === false) {
            let io = tag == 2?"win":"lose";
            info.attackedType = "fly";
            info.repelDis = 200;
            info.repelHight = 150;
            info.repelTime = 1;
            info.isGameOver = true;
            beAttacker.transState(this._STATE.Attacked,info);

            cx_AudioMgr.playPreEffect("finishing");
            cc.director.getScheduler().setTimeScale(0.2);
            this.node.runAction(cc.sequence(
                cc.delayTime(0.1),
                cc.callFunc(()=>{
                    cc.director.getScheduler().setTimeScale(0.3);
                },this),
                cc.delayTime(0.1),
                cc.callFunc(()=>{
                    cc.director.getScheduler().setTimeScale(1);
                },this),
            ))
            this._endGame(io,1);
            //this._preEndGame(beAttacker,io);
        }

        //处理攻击者
        
        //处理被攻击者
        //let params_be = {"state":this._STATE.Attacked,"params":{"rigidTime":params.rigidTime}}
        let beAttackerLei = beAttacker.getStateLei();
        if(result) {
            if(obj.skillType == "bullet") {
                cx_UIMgr.putNode(obj.skillNode);
            }

            //霸体值判断
            if(beAttacker.getBtValue() <= info.tdb) {
                //debugger;
                beAttacker.transState(this._STATE.Attacked,info);
            }
            
        } else if(!result && beAttacker.getState() === this._STATE.Defense) {
            cx_UIMgr.putNode(obj.skillNode);
            beAttackerLei.beAttack();
        }
        this.endDarkFx(beAttacker.pTag);
        this._attackState = null;

        //添加特效
/*         if(!result) {
           // debugger;
            this._tryTransState(beAttacker,this._STATE.Attacked,info.name,info.addState);
        } */
        this._showFx(beAttacker,obj.params);
        //添加音效
        this._playAttackEffect(obj.params);

        this._cameraShake();

        //更新层级关系
        this._setActorZIdex(attacker);

    },
    mpAdd(actor,mp,isShowFx) {
        let result = this._playerInfoCtrl.addMp(mp,actor.pTag);
        actor.curMp = result;
        if(isShowFx) actor.playGetPowerFx();
        //console.log("+mp:"+mp)
    },
    _playAttackEffect(obj) {
        let name = obj.name;
        switch (name) {
            case "normal_1":
                cx_AudioMgr.playPreEffect("punch-01");
                break;
            case "normal_2":
                cx_AudioMgr.playPreEffect("punch-02");
                break;
            case "normal_3":
                cx_AudioMgr.playPreEffect("punch-03");
                break;
            case "skill_1":
                
                break;       
            case "skill_2":
                
                break;        
            default:
                break;
        }
    },
    _showFx(actor,obj) {
        let name = obj.name;
        let offsetX = cx_jsTools.getRandomNum(-5,5);
        let offsetY = cx_jsTools.getRandomNum(-30,30);
        let pos = cc.v2(actor.node.x + offsetX,actor.node.y + actor.node.height*actor.node.scaleY/2 + offsetY)
        switch (name) {
            case "normal_1":
                this._showHitFx(actor,"hit_01",pos);
                break;
            case "normal_2":
                this._showHitFx(actor,"hit_02",pos);
                break;
            case "normal_3":
                this._showHitFx(actor,"hit_02",pos);
                break;
            case "skill_1":
                this._showHitFx(actor,"hit_01",pos);
                break;       
            case "skill_2":
                this._showHitFx(actor,"hit_03",pos);
                break;        
            default:
                break;
        }
    },
    _showHitFx(actor,name,pos) {
        let nodejs = cx_UIMgr.getNodeJs(this.hitFxPb);
        let node = nodejs.node;
        nodejs.init(this,name);
        //nodejs.playFx(name);
        node.setPosition(pos);
        node.zIndex = 3;
        this.node.addChild(node);
    },
    showDardFx(actorName,tag) {
        let node = this.node.getChildByName("darkFx");
        let nodejs = node.getComponent(node.name);
        nodejs.playBgAnim(tag);
        nodejs.playHeadAnim(actorName,tag)
    },
    endDarkFx(tag) {
        let node = this.node.getChildByName("darkFx");
        let nodejs = node.getComponent(node.name);
        nodejs.close(tag);
    },
    _handInput(player,orderState,dir) {
        if(orderState)
        {
            this._transState(player,orderState,dir);
        }
        else if(!dir)
        {
            this._transState(player,{state:this._STATE.Idle});
        }
        else 
        {
            if(!this._jumpCd) {
                dir = dir === this._DIR.LeftUp?this._DIR.Left:(dir === this._DIR.RightUp?this._DIR.Right:dir);
            }
            if(dir == this._DIR.Right || dir == this._DIR.Left)
            {
                player.setDir(dir);
                this._transState(player,{state:this._STATE.Run,name:"Run"},dir);
            }
            else 
            {
                this._transState(player,{state:this._STATE.Jump,name:"Jump"},dir);
            }
        }
    },
    _transState(playerjs,stateInfo,dir) {
        playerjs.setDir(dir);
        let goState = stateInfo.state;
        let addState = stateInfo.params?stateInfo.params.addState:null;
        if(this._tryTransState(playerjs,goState,stateInfo.name,addState)) {
            //console.log("进入状态："+state)
            playerjs.transState(goState,stateInfo.params);
            //if(playerjs.pTag == 1) this._setCd(stateInfo.name);
        }
    },
    _tryTransState(playerjs,goState,name,addState)
    {
        let curState = playerjs.getState();
        let info = this._getAllowState(addState)
        if(info[curState].indexOf(goState) > -1) {
            return true;
        }
        return  false;
    },
    _getAllowState(addState) {
        let STATE = this._STATE;
        let info = {};
        info[STATE.Idle] = [STATE.Run,STATE.Jump,STATE.Attack,STATE.Defense,STATE.Attacked];
        info[STATE.Run] = [STATE.Idle,STATE.Jump,STATE.Attack,STATE.Defense,STATE.Attacked];
        info[STATE.Jump] = [];
        info[STATE.Attack] = [STATE.Attacked,STATE.Attack];
        info[STATE.Defense] = [STATE.Jump,STATE.Run,STATE.Attack];
        info[STATE.Attacked] = [STATE.Attacked];
        let ADD_STATE = cx_DyData.ACTOR_ADD_STATE;
        if(addState)
        {
            for (let i = 0; i < addState.length; i++) {
                const state = addState[i];
                switch (state) {
                    case ADD_STATE.JumpFire:
                        info[STATE.Jump].push(STATE.Attack);
                        break;
                    case ADD_STATE.Bt:
                        let index = info[STATE.Attack].indexOf(STATE.Attacked);
                        if(index > -1) info[STATE.Attack].splice(index, 1);
                        break;        
                    default:
                        break;
                }
            }
        }
        return info;
    },
    _getRockDir() {
        let angle = this._Rocking.getAngle();
        let dir = null;
        if(angle == null) 
        {
            dir = null;
        }
        else if(angle >= 60 && angle <180) 
        {
            dir = this._DIR.Right;
        }
        else if(angle >= 180 && angle <300) 
        {
            dir = this._DIR.Left;
        }
        else if(angle >= 300 && angle < 360)
        {
            dir = this._DIR.LeftUp;
        }
        else if(angle >= 0 && angle < 60)
        {
            dir = this._DIR.RightUp;
        } else {
            debugger
        }
        if(dir === undefined) debugger;
        return dir;
    },
    _cameraFollow(dt) {
        this._cameraReflus(dt);
        return;
        let camera = this.cameraNode;
        let player = this._playerJs.node;
        let bgWidth = 2046;
        let winWidth = cc.winSize.width;//cc.winSize.width;//1334//cc.view.getFrameSize().width;

        let dl = -winWidth/2 + camera.x - player.x;
        let dr = winWidth/2 + camera.x - player.x;
        let d = Math.min(Math.abs(dl),Math.abs(dr));
        let fh = d == Math.abs(dl)?-1:1;
        //if(fh > 0)
        let len = 500;
        if(d <= len )//出屏
        {
            let posX = player.x - (winWidth/2 - len) * fh;

            let disL = posX - winWidth/2;
            let disR = posX + winWidth/2
            if(disL > -bgWidth/2 && disR < bgWidth/2) 
            {
                camera.x = posX;
            }
        }
    },
    _cameraScale(dt) {
        let camera = this.cameraNode.getComponent(cc.Camera);
        let player = this._playerJs.node;
        let enemy = this._enemyJs.node;
        let dis = player.position.sub(enemy.position).mag();
        let max = 2000;
        let min = 0;
        let result = 0.665 + ((max - dis)/max)*0.4;
        camera.zoomRatio = result;
    },
    _cameraReflus(dt) {
        let bgWidth = 2046;
        let d_min = 100; 
        let winWidth = cc.winSize.width;
        let width_min = winWidth;
        let width_max = bgWidth;
        let camera = this.cameraNode.getComponent(cc.Camera);
        let player = this._playerJs.node;
        let enemy = this._enemyJs.node;
        let center_posX = (player.x + enemy.x)/2;
        let actor_l = player.x < enemy.x?player:enemy;
        let actor_r = player.x > enemy.x?player:enemy;
        let dis = player.position.sub(enemy.position).mag();
        let d_left = Math.abs(-bgWidth/2 - actor_l.x);
        let d_right = Math.abs(bgWidth/2 - actor_r.x);
        d_left = d_left > d_min?d_min:d_left;
        d_right = d_right > d_min?d_min:d_right; 
        let tmpWidth = d_left + d_right + dis;
        let screenWidth = tmpWidth < width_min ? width_min:tmpWidth;
        let bordX = bgWidth/2 - screenWidth/2;
        let x = null; //screenWidth/2 + actor_l.x - d_left;
        if(d_left + d_right === d_min * 2 )
        {
            x = center_posX;
        }   
        else 
        {
            let offsetX = Math.abs(d_left - d_right);
            if(d_left > d_right)//右边距离不够
            {
                x = center_posX + offsetX ;
            }
            else//左边距离不够
            {
                x = center_posX - offsetX;
            }
        }
        //x = center_posX;
        //x = cc.misc.lerp(this.cameraNode.x, x, dt * 1.7);
        x = x > bordX? bordX:x;
        x = x < -bordX? -bordX:x;
        this.cameraNode.x = x;
        let zoomRatio = 1 - ((screenWidth - winWidth)/screenWidth)*1
        camera.zoomRatio = zoomRatio//cc.misc.lerp(camera.zoomRatio,zoomRatio, dt * 2);
    },
    _cameraTest(dt) {
        let k = 1.7;

        let bgWidth = 2046;
        let winWidth = cc.winSize.width;
        let bordX = bgWidth/2 - winWidth/2;
        let x = cc.misc.lerp(this.cameraNode.x, this._playerJs.node.x, dt * k);
        x = x > bordX? bordX:x;
        x = x < -bordX? -bordX:x;
        this.cameraNode.x = x;
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
    }
});
