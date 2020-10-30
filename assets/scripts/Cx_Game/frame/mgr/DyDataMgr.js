/**承载游戏运行中的全局数据公共调用方法 */

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
        //游戏配置数据
        this._configs = {

        };
        this._gaming = 
        {
            level:{},//关卡数据
            //...其它游戏配置数据
        };

        this._formLevel = null;
    }
    init(mManager) {
        this.mManager = mManager;
        this.loaderGameData();
        this._platConfigHand();
        this._initPatch();
        this._initMistakeEnabled();
    }

    //特定游戏特殊方法

    /**更新主界面显示数据 */
    updateCounts(){
        let node = this.mManager?this.mManager.node:null;
        if(!node) node = cc.director.getScene().getChildByName("Canvas");
        node.emit("updateCounts");
    }
    /**加载下一关游戏数据 */
    goNextLevel(level) {
        this._formLevel = this.getCurrentLevel();
        let len = this.getLevelCount();
/*         if(this._personal.maxLevel && this._personal.maxLevel >= len) {
            this._personal.currentLevel = cx_jsTools.getRandomNum(1,len);
        }
        else  */
        if(level) {
            this._personal.currentLevel = level;
        } 
        else
        {
            if(this._personal.currentLevel >= len) {
                this._personal.currentLevel = 1;
            } else {
                this._personal.currentLevel ++;
            }
        }

        if(!this._personal.maxLevel || this._personal.maxLevel < this._personal.currentLevel) {
            this._personal.maxLevel = this._personal.currentLevel;
        }
        this.delyStorage();
    }
    joinGame() {
        //return true;
        if(!this._configs.isOpenPower) return true;
        let power = this.getPower();
        let powerCost = this.getLevelData().powerCost;
        if(power < powerCost) return false;
        this.setPower(power - powerCost);
        return true;
    }
    
    //通用方法
    getClickMistake() {
        return cx_DyData.isClickMistake? G_Switch.getConfigByKey("mistake_click")||"100||0.005||0.005||0.175||0.5||1-3||0.5||1.5":null;
    }
    getMoveMistake() {
        return cx_DyData.isMoveMistake?G_Switch.getConfigByKey("mistake_move")||"1.5||2||0.4" : null;
    }
    getBtnMistake() {
        return cx_DyData.isBtnMistake?G_Switch.getConfigByKey("mistake_btn")||"0.5||1.5":null;
    }
    getExitMistake() {
        return cx_DyData.isExitMistake;
    }

    /**获取当前即将进入关卡或当前正在进行关卡 */
    getCurrentLevel() {
        return this._personal.currentLevel;
    }
    /**获取当前玩家玩过的最大关卡 */
    getPlayerMaxLevel() {
        return this._personal.maxLevel;
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
    /**设置个人存储信息 */
    setPersonData(key,value) {
        this._personal[key] = value;
        this.delyStorage();
    }
    /**获取个人存储信息 */
    getPersonData(key) {
        return key?this._personal[key]:this._personal;
    }
    /**获取(默认当前)关卡数据 */
    getLevelData(level) {
        level = level?level:this.getCurrentLevel();
        return this._gaming.level[level - 1];
    }
    /**获取(默认当前)关卡体力值消耗 */
    getLevelPowerCost(level) {
        level = level?level:this.getCurrentLevel();
        return this.getLevelData(level).powerCost;
    }
    /**获取关卡数量 */
    getLevelCount() {
        return this._gaming.level.length;
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
    setAudioStatus(status) {
        this._personal.isOpenVoice = !!status;
        this.delyStorage();
    }
    /**获取音频设置状态*/
    getAudioStatus() {
        return this._personal.isOpenVoice;
    }
    /**设置震动状态 */
    setShakeStatus(status) {
        this._personal.isOpenShake = !!status;
        this.delyStorage();
    } 
    /**获取震动设置状态*/
    getShakeStatus() {
        return this._personal.isOpenShake;
    }

    /**设置局结束信息(result(win,lose),isthreeAward(true,false),joinType(1 直接加入，2 返回首页)) */
    setRoundInfo(key,value) {
        cx_DyData.roundInfo[key] = value;
    }
    /**获取局结束信息(result(win,lose),isthreeAward(true,false),joinType(1 直接加入，2 返回首页)) */
    getRoundInfo(key) {
        return cx_DyData.roundInfo[key];
    }
    /**获取最新完成局游戏结果 */
    getResult() {
        return cx_DyData.roundInfo["result"];
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

    getPreResource(type,name) {
        let a = cx_DyData.dyResourceSg[type];
        if(a) a = a[name];
        return a?a:null;
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

    /**
     * 加载游戏所需的数据，一般在游戏入口执行 
     */
    loaderGameData() {
        let personal = cc.sys.localStorage.getItem('personalData');
        let time = cx_jsTools.getCurTime("d");

        this._personal = null;
        if(personal) 
        {
            this._personal = JSON.parse(personal) ;
            if(time !== this._personal.lastLoginTime) {//
                this._everyDayReflus();
                cx_DyData.isDayFirstJoinGame = true;
            } else {
                cx_DyData.isDayFirstJoinGame = false;
            }
        }
        else 
        {
            //首次进入游戏
            cx_DyData.isFirstJoinGame = true;
            cx_DyData.isDayFirstJoinGame = true;

            this._firstJoinGame();
        }
        this.delyStorage();
        this._configs = cx_DyData.gameConfig;
        this._gaming.level = G_GameDB.getConfigs("TBStageConfig").list;
        console.log("levelDate:",this._gaming.level);
/*         this._playerSkillObj = this._transListToObj(G_GameDB.getConfigs("TBPlayerSkill"),["actor","name"]);
        this._aiSkillObj = this._transListToObj(G_GameDB.getConfigs("TBAISkill"),["itemId","name"]);
        this._playerValue = this._transListToObj(G_GameDB.getConfigs("TBPlayer"),["name"]);
        this._aiValue = this._transListToObj(G_GameDB.getConfigs("TBAI"),["itemId"]);

        this._gaming.level = G_GameDB.getConfigs("TBStageConfig").list;
        this._levelConfig = this._transListToObj({list:this._gaming.level},["stage"]); */
    }
    //每日个人存储数据刷新
    _everyDayReflus() {
        let data = cx_DyData.defaultPersonCg;
        this.setPower(data.power);
    }
    //首次进入游戏数据初始化
    _firstJoinGame() {
        let data = cx_DyData.defaultPersonCg;
        this._personal = data;
        this.setPower(data.power);
        this.setGold(data.gold);

        this._personal.lastLoginTime = cx_jsTools.getCurTime("d");
    }
    //版本更迭数据更新
    _versionChangeReflus() {

    }
    _transListToObj(list,params) {
        let info = list;
        let arr = info.list;
        let reusultObj = {};
        for (let i = 0; i < arr.length; i++) {
            const obj = arr[i];
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    //字符串转数字
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

    //内部方法
    _initMistakeEnabled() {
        let self = this;
        G_Switch.isClickMistakeEnabled(function(result){
            cx_DyData.isClickMistake = result;
        })
        G_Switch.isMoveMistakeEnabled(function(result){
            cx_DyData.isMoveMistake = result;
        })
        G_Switch.isBtnMistakeEnabled(function(result){
            cx_DyData.isBtnMistake = result;
        })
        G_Switch.isExitMistakeEnabled(function(result){
            cx_DyData.isExitMistake = result;
        })
    }
    _initPatch() {
        let self = this;
        G_Switch.getCommitVersion(function ( commitVersion ) {
            if (commitVersion === G_SDKCfg.getAppVersion()) {
                // commit
                cx_DyData.patch = true;
            }
            else {
                // online
                cx_DyData.patch = false;
            }

            console.log("cur version is patch",cx_DyData.patch);
            self._transDataPatch();
        }.bind(G_Switch))
    }
    /**针对是否为提审版对数据进行特殊处理 */
    _transDataPatch() {

    }
    /**针对多平台进行配置数据区分处理 */
    _platConfigHand() {
        
    }


    //内部特殊方法，无视限制
    _setCurrentLevel(level) {
        this._personal.currentLevel = level;
        this.delyStorage();
    }
    _addPower(value) {
        this._personal.power = this._personal.power + value;
    }
    _addGold(value) {
        this._personal.gold = this._personal.gold + value;
    }
}
module.exports = cx_DyDataMgr._getInstance();