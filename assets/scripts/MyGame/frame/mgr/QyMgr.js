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
            cx_AudioMgr.playMusic();
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
        if(cx_DyDataMgr.getShake()) {
            G_PlatHelper.vibratePhone(!!type);
        }
        
    }
    /**
     * 获取当前平台名字：win,wx,qq,oppo,vivo,tt
     */
    getPlatName() {
        return this._platName;
    }
    /**
     * 平台判断 
     * @param {String} name 平台名称(qq,wx,oppo,vivo,tt,win),name 若为空则返回当前平台名称
     */
    platJudge(name) {
        switch (name) {
            case "qq":
                
                break;
            case "wx":
                
                break;
            case "oppo":
                
                break;     
            case "vivo":
                
                break;
            case "tt":
                
                break;
            case "win":
                
                break;     
            default:
                break;
        }
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
            return "win"//"win" 
        }
    }
}
module.exports = QyManager._getInstance();