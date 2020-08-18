/**承载游戏运行中的全局数据以及公共调用方法 */

var cx_DyDataMgr = class cx_DyDataMgr{
    static _instance = null;
    static _getInstance() {
        if(cx_DyDataMgr._instance) {
            return cx_DyDataMgr._instance;
        } else {
            return new cx_DyDataMgr();
        }
    }
    constructor() {
        //个人相关的存储数据，初始化时赋予
        this._personal = {};
        //全局配置数据
        this._configs = {

        };
        this._gaming = 
        {
            level:{},//关卡数据
            settings:{}//游戏场景的配置数据
        };

        //其它数据
        this._clickedDcAdvArr = [];//已经点击过的导出广告数组
        //误触
        this._isClickMistake = false;
        this._isMoveMistake = false;
        this._isBtnMistake = false;
        this._isExitMistake = false;

        this._formLevel = null;
    }
    init(mManager) {
        let self = this;
        this.mManager = mManager;
        G_MistakeMgr.isClickMistakeEnabled(function(result){
            self._isClickMistake = result;
        })
        G_MistakeMgr.isMoveMistakeEnabled(function(result){
            self._isMoveMistake = result;
        })
        G_MistakeMgr.isBtnMistakeEnabled(function(result){
            self._isBtnMistake = result;
        })
        G_MistakeMgr.isExitMistakeEnabled(function(result){
            self._isExitMistake = result;
        })
    }
    getClickMistake() {
        
        return this._isClickMistake? G_Switch.getConfigByKey("mistake_click")||"100||0.005||0.005||0.175||0.5||1-3||0.5||1.5":null;
    }
    getMoveMistake() {
        return this._isMoveMistake?G_Switch.getConfigByKey("mistake_move")||"1.5||2||0.4" : null;
    }
    getBtnMistake() {
        return this._isBtnMistake?G_Switch.getConfigByKey("mistake_btn")||"0.5||1":null;
    }
    getExitMistake() {
        return this._isExitMistake;
    }
    /**
     * 加载游戏所需的数据，一般在游戏入口执行 
     */
    loaderGameData() {
        let personal = cc.sys.localStorage.getItem('personalData');
        let data = require("GameConfig");
        let time = this._getCurrentTime();
        if(personal) {
            this._personal = JSON.parse(personal) ;
            if(time !== this._personal.lastLoginTime) {//
                this.setPower(data.configs.power);
                this.setGold(data.configs.gold);
            }
        }
        else {
            //首次进入游戏
            this._personal = data.personal;
            this.setPower(data.configs.power);
            this.setGold(data.configs.gold);
        }
        this._personal.lastLoginTime = time;
        this.delyStorage();
        this._configs = data.configs;
        this._gaming = data.gaming;

        this._playerSkillObj = this._transListToObj(G_GameDB.getConfigs("TBPlayerSkill"),["actor","name"]);
        this._aiSkillObj = this._transListToObj(G_GameDB.getConfigs("TBAISkill"),["itemId","name"]);
        this._playerValue = this._transListToObj(G_GameDB.getConfigs("TBPlayer"),["name"]);
        this._aiValue = this._transListToObj(G_GameDB.getConfigs("TBAI"),["itemId"]);

        this._gaming.level = G_GameDB.getConfigs("TBStageConfig").list;
        this._levelConfig = this._transListToObj({list:this._gaming.level},["stage"]);
        
        console.log(this.getCurLevelData());
        console.log(this.getCurLevelEnemyInfo());
        console.log(this.getPlayerInfo("leopard"));
    }

    _transListToObj(list,params) {
        let info = list;
        let arr = info.list;
        let reusultObj = {};
        for (let i = 0; i < arr.length; i++) {
            const obj = arr[i];
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    let arry = obj[key].toString().split(";");
                    if(key == "addState") {
                        obj[key] = [];
                        continue;
                    }
                    if(arry.length > 1)
                    {
                        for (let i = 0; i < arry.length; i++) {
                            const arri = arry[i];
                            const valuei = parseFloat(arri);
                            arry[i] = isNaN(valuei)?arri:valuei;
                        }
                        obj[key] = arry;
                    }
                    else
                    {
                        const value = parseFloat(obj[key]);
                        obj[key] = isNaN(value)?obj[key]:value;
                        if(key == "addState") {
                            obj[key] = [];
                        }
                    }

                }
            }

            let tmpObj = reusultObj;
            for (let j = 0; j < params.length; j++) {
                const key = obj[params[j]];
                if(!key) break;
                if(j === params.length - 1) {
                    tmpObj[key] = obj;
                } else {
                    if(!reusultObj[key]) reusultObj[key] = {};
                    tmpObj = reusultObj[key];
                }
            }
        }
        //console.log(reusultObj);
        return reusultObj;
    }

    //特定游戏特殊方法
    getCurLevelEnemyInfo() {
        let level = this.getCurrentLevel();
        let levelCg = this._levelConfig[level.toString()];
        let itemId = levelCg.itemId;
        let enemyInfo = this._aiValue[itemId];
        enemyInfo.skill = this._aiSkillObj[itemId];
        return enemyInfo;
    }
    getPlayerInfo(name) {
        let cg = this._playerValue[name];
        cg.skill = this._playerSkillObj[name];
        return cg;
    }
    getCurLevelData() {
        let level = this.getCurrentLevel();
        let levelCg = this._levelConfig[level.toString()];
        return levelCg;
    }
    getCurActorName() {
        let name_1 = this.getPersonData().formActorChoosed;
        let name_2 = this.getLevelData().name;
        return {"player":name_1,"enemy":name_2};
    }
    //

    //通用方法
    /**获取当前即将进入关卡或当前正在进行关卡 */
    getCurrentLevel() {
        return this._personal.currentLevel;
    }
    /**获取界面显示关卡 */
    getShowLevel() {
        return this.getCurrentLevel();
    }
    /**获取上一次已完成关卡 */
    getFormLevel() {
        return this._formLevel || this.getCurrentLevel();
    }
    /**获取上一次已经完成关卡奖励 */
    getAwardGold() {
        let data = this._gaming.level[this.getFormLevel() - 1];
        let gold = data.awardGold;
        return gold;
    }
    setIsThreeAward(value) {
        this._isThreeAward = !!value;
    }
    getIsThreeAward() {
        return  !!this._isThreeAward; 
    }
    /**设置个人存储信息 */
    setPersonData(key,value) {
        this._personal[key] = value;
        this.delyStorage();
    }
    /**获取个人存储信息 */
    getPersonData(key) {
        return key?this._personal[key]:this._personal;
    }
    /**获取当前关卡数据 */
    getLevelData() {
        let level = this.getCurrentLevel();
        return this._gaming.level[level - 1];
    }
    getGameDataByKey(key) {
        return this._gaming[key];
    }
    /**获取关卡数量 */
    getLevelCount() {
        return this._gaming.level.length;
    }
    /**更新主界面显示数据 */
    updateCounts(){
        let node = this.mManager?this.mManager.node:null;
        if(!node) node = cc.director.getScene().getChildByName("Canvas");
        this.mManager.node.emit("updateCounts");
    }

    setGold(value) {
        if(value>=0) {
            this._personal.gold = value;
            this.delyStorage();
        }
    }
    setPower(value) {
        if(value>=0) {
            this._personal.power = value;
            this.delyStorage();
        }
    }

    addGold(value) {
        let result = this._personal.gold + value;
        if(result >= 0) {
            this._personal.gold = result;
        } else {
            this._personal.gold = 0;
        }
        this.delyStorage();
        return this._personal.gold;
    }

    addPower(value) {
        let result = this._personal.power + value;
        if(result > this._configs.maxPower) {
            return false;
        } 
        if(result >= 0) {
            this._personal.power = result;
        } else {
            this._personal.power = 0;
        }
        this.delyStorage();
        return this._personal.power;
    }

    /**加载下一关游戏数据 */
    goNextLevel() {
        let len = this.getLevelCount();
/*         if(this._personal.maxLevel && this._personal.maxLevel >= len) {
            this._personal.currentLevel = cx_jsTools.getRandomNum(1,len);
        }
        else  */if(this._personal.currentLevel >= len) {
            this._personal.currentLevel = 1;
        } else {
            this._personal.currentLevel ++;
        }

        if(!this._personal.maxLevel || this._personal.maxLevel < this._personal.currentLevel) {
            this._personal.maxLevel = this._personal.currentLevel;
        }
        this.delyStorage();
    }
    joinGame() {
        return true;
        if(!this._configs.isOpenPower) return true;
        let power = this.getPower();
        let powerCost = this.getLevelData().powerCost || 1;
        if(power < powerCost) return false;
        this.setPower(power - powerCost);
        return true;
    }
    /**获取玩家拥有金币 */
    getGold() {
        return this._personal.gold;
    }
    /**获取玩家拥有体力 */
    getPower() {
        return this._personal.power;
    }
    /**设置音频播放状态 */
    setAudio(status) {
        this._personal.isOpenVoice = !!status;
        this.delyStorage();
    }
    /**获取音频设置状态*/
    getAudio() {
        return this._personal.isOpenVoice;
    }
    /**设置震动状态 */
    setShake(status) {
        this._personal.isOpenShake = !!status;
        this.delyStorage();
    } 
    /**获取震动设置状态*/
    getShake() {
        return this._personal.isOpenShake;
    }
    /**设置最新完成局游戏结果 */
    setResult(result) {
        this._gameResult = result;
    }
    /**获取最新完成局游戏结果 */
    getResult() {
        return this._gameResult;
    }
    /**设置加入类型（1 直接加入，2 返回首页） */
    setJoinType(value) {
        this._joinType = value;
    }
    /**获取加入类型（1 直接加入，2 返回首页）*/
    getJoinType() {
        return this._joinType || 1;
    }
    
    /**获取预加载图片 */
    getSf(name) {
        let sf = cx_DyData.dyResourceSg.sfs[name];
        return sf?sf:null;
    }
    /**获取预加载音频 */
    getAuidoClip(name) {
        let clip = cx_DyData.dyResourceSg.audio[name];
        return clip?clip:null;
    }
    /**获取预加载预制体 */
    getPrefab(name) {
        let pb = cx_DyData.dyResourceSg.prefab[name];
        return pb?pb:null;
    }
    storage() {
        let data = this._personal;
        cc.sys.localStorage.setItem('personalData', JSON.stringify(data));
    }
    /**延迟存储 */
    delyStorage() {
        if(this._preStorage) return;
        let self = this;
        setTimeout(() => {
            self.storage();
            self._preStorage = false;
        }, 0.1);
    }
    //内部方法

    _getCurrentTime() {
        var date = new Date();
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    }
    _setCurrentLevel(level) {
        this._personal.currentLevel = level;
        this.delyStorage();
    }
    _setCurrentStep(step) {
        this._personal.currentStep = step;
    }
    _addPower(value) {
        this._personal.power = this._personal.power + value;
    }
    _addGold(value) {
        this._personal.gold = this._personal.gold + value;
    }
}
module.exports = cx_DyDataMgr._getInstance();