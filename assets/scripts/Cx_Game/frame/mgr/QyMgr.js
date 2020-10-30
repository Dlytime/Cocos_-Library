/**负责和趣游框架的对接 */
var QyManager = class QyManager{
    static _instance = null;
    static _getInstance() {
        if(QyManager._instance) {
            return QyManager._instance;
        } else {
            return new QyManager();
        }
    }
    constructor() {
       this._platName = null;
       
    }
    init() {
        this._platName = this._getPlat();
    }
    /**分享 */
    share(cb) {
        let self = this;
        self._startShare();
        console.log("start try to share");
        G_Share.share(G_ShareScene.SS_SHARE_APP, null, true, function (bSucc) {//UI_help  refreshFreeWayOfBtn
            // body...
            console.log(" share callBack result ",bSucc);
            let result = self._endShare();
            if (bSucc && result ) {
                // succ
                console.log("share app succ...!!!");
                if(typeof cb === "function") {
                    cb(true);
                }
                
            } else {
                console.log("share app faild...!!!",bSucc);
                if(typeof cb === "function") {
                    cb(false);
                }
            }
            if(self.getPlatName() == "vivo" ) return;
            cx_AudioMgr.backMusicHand();
        })
    }
    _startShare() {
        let date = new Date();
        let min = date.getMinutes();
        let seconds = date.getSeconds();
        this.shareDt = {"min":min,"seconds":seconds};
        
    }
    _endShare() {
        let formDate = this.shareDt;
        let date = new Date();
        let min = date.getMinutes();
        let seconds = date.getSeconds();
        let successSt = 3;
        console.log("分享开始时间：",this.shareDt,"分享结束时间：",{"min":min,"seconds":seconds});
        if(min > formDate.min || seconds - formDate.seconds > successSt) {
            return true;
        } 
        return false;
    }
    /**震动 true 长震动*/
    shake(type) {
        if(cx_DyDataMgr.getShakeStatus()) {
            G_PlatHelper.vibratePhone(!!type);
        }
        
    }
    /**
     * 获取当前平台名字：win,wx,qq,oppo,vivo,tt
     */
    getPlatName() {
        return this._platName;
    }

    _getPlat() {
        if(G_PlatHelper.isWXPlatform()) {
            return "wx";
        } else if(G_PlatHelper.isQQPlatform()) {
            return "qq";
        } else if(G_PlatHelper.isOPPOPlatform()) {
            return "oppo";
        } else if(G_PlatHelper.isVIVOPlatform()) {
            return "vivo";
        } else if(G_PlatHelper.isTTPlatform()) {
            return "tt";
        } else {
            return "wx"//"win" 
        }
    }
}
module.exports = QyManager._getInstance();