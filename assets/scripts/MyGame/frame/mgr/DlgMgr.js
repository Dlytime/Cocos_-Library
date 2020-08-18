/**小游戏通用对话框显示及跳转管理 */

var QyDlgManager = class QyDlgManager{
    static _instance = null;
    static _getInstance() {
        if(QyDlgManager._instance) {
            return QyDlgManager._instance;
        } else {
            return new QyDlgManager();
        }
    }
    constructor() {
        this._dlgNodeObj = {};
        this._dirConfig = 
        {

        }
        this._dirConfig_lose = 
        {
            "win":{"start":"DlgShowResultAnim","DlgShowResultAnim":"DlgGameEnd","DlgGameEnd":"DlgActorSelect","DlgActorSelect":"DlgShowVs"},
            "wx":{"start":"DlgShowResultAnim","DlgShowResultAnim":"DlgGameEnd","DlgGameEnd":"DlgActorSelect","DlgActorSelect":"DlgShowVs"},
            "oppo":{},
            "qq":{},
        }
        this._dirConfig_win = 
        {
            "win":{"start":"DlgShowResultAnim","DlgShowResultAnim":"DlgGameEnd","DlgGameEnd":"DlgActorSelect","DlgActorSelect":"DlgShowVs"},
            "wx":{"start":"DlgShowResultAnim","DlgShowResultAnim":"DlgGameEnd","DlgGameEnd":"DlgActorSelect","DlgActorSelect":"DlgShowVs"},
            "oppo":{},
            "qq":{},
        }
        this._dirConfig_break = 
        {
            "win":{"start":"DlgActorSelect","DlgActorSelect":"DlgShowVs"},
            "wx":{"start":"DlgActorSelect","DlgActorSelect":"DlgShowVs"},
            "oppo":{},
            "qq":{},
        }
    }
    init(_gameRoom) {
        this._gameRoom = _gameRoom;
        this._addNode = _gameRoom.node;
/*         let self = this;
        G_MistakeMgr.isExitMistakeEnabled(function(result){
            if(result) {
                console.log("退出误触开启");
                self._dirConfig.wx.start = "DlgExitAdv";
            }
            else {
                self._dirConfig.wx.start = "DlgShowResult";

                //self._dirConfig.wx.start = "DlgExitAdv";
            }
        }) */
    }
    /**游戏结束对话框自动流程 */
    autoGameEndDlg(type) {
        this._dirConfig = type?this["_dirConfig_"+type]:this._dirConfig_win;
        let name = this._dirConfig[this._getPlat()].start;
        if(name == "GameRoom") {
            this._gameRoom.node.emit("noticeGameRoom",{status:"initGame"});
            return;
        }
        this.showDlg(name);
    }
    showTips(msg) {
        if(!msg || msg== "") return;
        let prefab = this.getPrefab("Tips");
        let nodejs = cx_UIMgr.getPreInstance(prefab);
        let node = nodejs.node;
        let parent = cc.director.getScene().getChildByName("Canvas");
        parent.addChild(node);
        nodejs.onInit(msg);
        node.zIndex = 9999;

        node.runAction(cc.sequence(cc.delayTime(1.5),cc.callFunc(function(){
            cx_UIMgr.putNode(node);
        },this)));
    }

    addDlgFullAdv_dc(mManager,closeCb) {
        let name = "DlgFullAdv_dc";
        let prefab = this.getPrefab(name);
        let nodejs = cx_UIMgr.getPreInstance(prefab);
        let node = nodejs.node;
        nodejs.init(mManager,closeCb);
        this._addNode.addChild(node);
    }

    /**获取Prefab */
    getPrefab(name) {
        return cx_DyDataMgr.getPrefab(name);
    }
    /**获取已添加dlg的管理类 */
    getNodeJs(name) {
        let node = this._dlgNodeObj[name];
        if(node) {
            let nodejs = node.getComponent(name);
            return nodejs;
        } else {
            return null;
        }

    }
    _commonAdd(name,mManager,info) {
        let prefab = this.getPrefab(name);
        let nodejs = cx_UIMgr.getPreInstance(prefab);
        let node = nodejs.node;
        if(!mManager) mManager = this;
        this._addNode.addChild(node);
        if(info) {
            nodejs.init(mManager,info);
        } else {
            nodejs.init(mManager);
        }
        
        this["_"+name+"Node"] = node;
        return nodejs;
    }
    /**
     * 对话关闭调用方法
     * @param {string} name 对话框名字
     * @param {Object} info (可选)关闭时附带信息
     */
    dlgClosed(name,info) {
        if(!name) return;

        let nextName = null;
        let plat = this._getPlat();
        let config = this._dirConfig[plat];
        //if(name == "DlgGameEnd" || name == "DlgGameEnd_oppo") {
        if(typeof config[name] == "object" && info && info.type){
            nextName = config[name][info.type];
        } 
        else {
            nextName = config[name];
        }
        if(nextName == "GameRoom") {
            let order = "initGame";
            if(cx_DyDataMgr.getJoinType() === 1) {
                order = "startGame";
            }
            this._gameRoom.node.emit("noticeGameRoom",{status:order});
        } 
        else if(nextName) {
            this.showDlg(nextName);
        }
        this._gameRoom.node.emit("updateCounts"); 
        
    }

    /**
     * 显示对话框(流程：先找show_name_plat，不存在则自动添加流程:先找预制体name_plat，不存在则使用默认name)
     * @param {string} name 名字(确保脚本名和预制体名一致)
     * @param {Object} mManager 管理者(可选)
     * @param {Object} info 附带信息(可选)
     */
    showDlg(name,mManager,info) {
        let tmpNode = this._dlgNodeObj[name];
        if(tmpNode && (tmpNode instanceof cc.Node && tmpNode.parent)) return;
        let func = this["show"+name];
        let _nodejs = null;
        if(typeof func == "function") {
            _nodejs = this["show"+name](mManager,info);
        } else {
            let nodejs = this._commonAdd(name,mManager,info);
            _nodejs = nodejs;
        }
        this._dlgNodeObj[name] = _nodejs.node;

        _nodejs.node.group = "UI";
        return _nodejs;
    }
    closeDlg(name) {
        let node = this._dlgNodeObj[name];
        if(node && node instanceof cc.Node) {
            //
            let nodejs = node.getComponent(node.name);
            if(typeof nodejs.close == "function") {
                let closefunc = nodejs.close.bind(nodejs);
                closefunc(nodejs.closedInfo);
            } else {
                cx_UIMgr.putNode(node);
            }
        }
    }
    _getPlat() {
        return cx_QyMgr.getPlatName();
    }
}
module.exports = QyDlgManager._getInstance();