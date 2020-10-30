const GameBase = require('GameBase');
cc.Class({
    extends: GameBase,

    properties: {
        topBarWidth:{
            type:cc.Widget,
            default:null
        },
        btnSetting:{
            type:cc.Button,
            default:null
        },
        GamingNode:{
            type:cc.Node,
            default:null
        },
        dlgLoadingPre:{
            type:cc.Prefab,
            default:null
        },
        bgSpr:{
            type:cc.Sprite,
            default:null
        },
    },

    // LIFE-CYCLE CALLBACKS:
    //广告种类：
    onLoad () {
        //console.log(new cc.rect(0,0,10,20))
        this._super();
        if ( G_PlatHelper.isOPPOPlatform() && qg.reportMonitor){
            qg.reportMonitor('game_scene', 0);
        }
        this._Gaming = this._getGaming();
        this._onRegisterEvent();
        this._initResolution();
        this._initGameData();
        //this._initAudioClip();
        this._intMgr();

        this._initUI();

        this._showLoading(); 

    },
    /**注册游戏事件 */
    _onRegisterEvent:function() {
        this.node.on("resourceLoadEnd",this._resourceLoadEnd,this);
        this.node.on("noticeGameRoom",this._noticeGameRoom,this);
        this.node.on("updateCounts",this._updateGoldZsNum,this);
        this.node.on("DcAdvClicked",this._DcAdvClickHand,this);//导出广告点击处理
        //this.node.on("gameStarted",this._gameStarted,this);

        G_Event.addEventListerner("EN_APP_AFTER_ONSHOW",this._backGameInit.bind(this),this.node);//后台返回处理
    },
    _backGameInit() {
        console.log("EN_APP_AFTER_ONSHOW _backGameInit");
        if(cx_QyMgr.getPlatName() == "vivo") { 
            if(cx_DyData.isVideoPlaying) {
                cx_AudioMgr.stopAllMusic();
            }
            return;
        }
        cx_AudioMgr.backMusicHand();
    },
    /**分辨率适配处理 */
    _initResolution:function() {
        cx_ResolutionMgr.setTop(this.topBarWidth);
        let setNode = this.node.getChildByName("topUIBar");
        if(setNode) {
            let Widget = setNode.getComponent(cc.Widget);
            cx_ResolutionMgr.setTop(Widget);
        }
    },
    /**初始化所有游戏数据 */
    _initGameData:function() {
        //cx_DyDataMgr.loaderGameData();
    },
    /**初始化音频 */
    _initAudioClip:function() {
        cx_AudioMgr.playMusic();
    },
    /**获取游戏场景管理类 */
    _getGaming:function() {
        return this.GamingNode.getComponent("Gaming");
        //return this.Gaming.getComponent("Gaming");
    },
    /**管理脚本初始化 */
    _intMgr:function() {
        cx_TimeMgr.init(this);
        cx_QyMgr.init(this);
        cx_DyDataMgr.init(this);
        cx_LoaderMgr.init(this);
        cx_AdvMgr.initAdv(this);
        cx_QyDlgMgr.init(this);
        cx_UIMgr.init(this);
    },
    /**初始化场景UI */
    _initUI:function() {
        this.topBarWidth.node.zIndex = 9999;
        this._initRoomContent();
        this._updateGoldZsNum();
    },
    _resourceLoadEnd:function() {
        this._initAudioClip();
    },
    /**通知GameRoom当前游戏进程 */
    _noticeGameRoom:function(event) {
        let status = event.status;
        switch (status) {
            case "loadEnd":
                this._Gaming.prefabLoad()
                break;
            case "initGame":
                this._initGame();
                this._reflusUI(status);
                this._reflusAdv(status)
                break;
            case "gameStart":
                this._gameStart();
                this._reflusUI(status);
                this._reflusAdv(status);
                break;
            case "gameEnd":
                this._gameEnd();
                this._reflusUI(status);
                this._reflusAdv(status);
                this._initGame();
                break;
            case "startGame":
                //this._initGame();
                this._Gaming.startGame();
                break;
            case "backToFirstPage":
                break;
            default:
                break;
        }
    },
    _DcAdvClickHand:function(event) {
        let result = event.result;
        if(result) 
        {

        } 
        else 
        {
            if(G_PlatHelper.isWXPlatform())
            {
                let nodejs = cx_QyDlgMgr.showDlg("DlgFullAdv");
                nodejs.node.zIndex = 2000;
                nodejs.closeCloseEmit();
            }
        }
    },
    _initGame:function() {
        this._Gaming.init(this);
    },
    _gameStart:function() {
        if(G_PlatHelper.isWXPlatform())
        {
            if(wx.aldStage) 
            {
                let level = cx_DyDataMgr.getShowLevel();
                let obj = {
                    stageId   : level,     //关卡ID 该字段必传
                    stageName : "第"+level+"关", //关卡名称  该字段必传
                    userId    : G_PlayerInfo.getOpenID() //用户ID 可选
                }
                wx.aldStage.onStart(obj);
                console.log("ald report level start info ",obj);
            }
        }
    },
    _gameEnd:function() {
        if(G_PlatHelper.isWXPlatform())
        {
            if(wx.aldStage) 
            {
                let result = cx_DyDataMgr.getRoundInfo("result");
                let _result = result == "win"?"complete":"fail";
                let level = cx_DyDataMgr.getShowLevel();
                let obj = {
                    stageId   : level,    //关卡ID 该字段必传
                    stageName : "第"+level+"关", //关卡名称  该字段必传
                    userId    : G_PlayerInfo.getOpenID(),  //用户ID 可选
                    event     : _result,   //关卡完成  关卡进行中，用户触发的操作    该字段必传
                    params    : {
                      desc    : "关卡完成"   //描述
                    }
                  }
                wx.aldStage.onEnd(obj);
                console.log("ald report level end info ",obj);
            }
        }
        
        if(cx_DyDataMgr.getResult() == "win") {
            this._goNextLevel();
        } else{
            cx_DyDataMgr.goNextLevel(cx_DyDataMgr.getCurrentLevel());
        }
        this._Gaming.prefabLoad();
        cx_QyDlgMgr.autoGameEndDlg(cx_DyDataMgr.getResult());
    },

    _reflusUI:function(status) {
        switch (status) {
            case "initGame":
                this._setRoomContent(true);
                this.btnSetting.node.active = true;
                break;
            case "gameStart":
                this._setRoomContent(false);
                this.btnSetting.node.active = false;
                break;
            case "gameEnd":

                break;
            default:
                break;
        }
    },
    _reflusAdv:function(status) {
        let plat = cx_QyMgr.getPlatName();
        switch (status) {
            case "initGame":
                    switch (plat) {
                        case "wx":
                            cx_QyDlgMgr.showDlg("DlgRoomAdv");
                            let nodejs = cx_QyDlgMgr.getNodeJs("DlgRoomAdv");
                            nodejs.showShakeAdv();
                            break;
                        case "qq":
                            cx_AdvMgr.showBanner();
                            break;
                        case "oppo":
                            cx_AdvMgr.showBanner();
                            break;
                        case "vivo":
                            cx_AdvMgr.showBanner();
                            break;
                        case "tt":
                            cx_AdvMgr.showBanner();
                            break;
                        default:
                            break;
                    }
                break;
            case "gameStart":
                switch (plat) {
                    case "wx":
                     let nodejs = cx_QyDlgMgr.getNodeJs("DlgRoomAdv");
                        nodejs.hideShakeAdv();
                        break;
                    case "qq":
                        cx_AdvMgr.showBanner();
                        break;
                    case "oppo":
                        cx_AdvMgr.showBanner();
                        break;
                    case "vivo":
                        cx_AdvMgr.hideBanner();
                        this._showOvNatvieAdv();
                        break;
                    case "tt":
                        cx_AdvMgr.showBanner();
                        break;
                    default:
                        break;
                }
                break;
            case "gameEnd":

                break;
            default:
                break;
        }
    },
    _showOvNatvieAdv() {
        if(this._ovNatvieAdvNode)
        {
            this._ovNatvieAdvNode.active = true;
        }
        else 
        {
            let nodejs = cx_UIMgr.getPreNodeJs("ovNative");
            let node = nodejs.node;
            this.node.addChild(node);
            let winWidth = cc.winSize.width;
            let pos = cc.v2(winWidth/2 - node.width/2 - 10 , 88); 
            node.setPosition(pos);

            this._ovNatvieAdvNode = node;
        }
    },
    _hideOvNativeAdv() {
        if(this._ovNatvieAdvNode) this._ovNatvieAdvNode.active = false;
    },
    _getOvNativeNode() {
        return this._ovNatvieAdvNode;
    },
    _goNextLevel:function(event) {
        cx_DyDataMgr.goNextLevel();
    },
    _updateGoldZsNum:function() {
        let goldlblNode = cx_ccTools.seekNodeByName(this.topBarWidth.node,"gold_zs_lbl");
        if(goldlblNode) {
            goldlblNode.getComponent(cc.Label).string = cx_DyDataMgr.getGold();
        }

        let powerlblNode = cx_ccTools.seekNodeByName(this.topBarWidth.node,"power_lbl");
        if(powerlblNode) {
            powerlblNode.getComponent(cc.Label).string = cx_DyDataMgr.getPower();
        }

    },
    _showLoading:function() {
        let nodejs = cx_UIMgr.getNodeJs(this.dlgLoadingPre);
        let node = nodejs.node;
        nodejs.init(this); 
        this.node.addChild(node);
        node.zIndex = 1000;
        this._loadingNode = node;
    },
    _showRoomAdv() {
        cx_AdvMgr.hideBanner();
        cx_QyDlgMgr.showDlg("DlgRoomAdv");
    },
    _hideRoomAdv() {
        cx_QyDlgMgr.closeDlg("DlgRoomAdv");
    },

    _setRoomContent:function(status) {
        let plat = cx_QyMgr.getPlatName();
        let node = cx_ccTools.seekNodeByName(this.node,"roomContent_"+plat);
        if(node) {
            node.active = status;
        }
    },
    _initRoomContent:function() {
        let wx = cx_ccTools.seekNodeByName(this.node,"roomContent_wx");
        let qq = cx_ccTools.seekNodeByName(this.node,"roomContent_qq");
        let oppo = cx_ccTools.seekNodeByName(this.node,"roomContent_oppo");
        let vivo = cx_ccTools.seekNodeByName(this.node,"roomContent_vivo");
        let tt = cx_ccTools.seekNodeByName(this.node,"roomContent_tt");

        if(wx) wx.active = false;
        if(qq) qq.active = false;
        if(oppo) oppo.active = false;
        if(vivo) vivo.active = false;
        if(tt) tt.active = false;
    },
   
    ondlgSetting:function() {
        cx_QyDlgMgr.showDlg("DlgSetting");
    },
    ondlgLackPower:function() {
        cx_QyDlgMgr.showDlg("DlgLackPower");
    },
    share:function() {
        cx_QyMgr.share();
    },
    morePlay:function() {
        let plat = cx_QyMgr.getPlatName();
        switch (plat) {
            case "wx":
                cx_QyDlgMgr.showDlg("DlgMorePlay");
                break;
            case "qq":
                cx_AdvMgr.showBoxAd();
                break;        
            default:
                cx_QyDlgMgr.showDlg("DlgMorePlay");
                break;
        }
        
        
    },
    start () {

    },

    // update (dt) {},
});
