/**广告的调用管理，提供统一广告调用接口以及规范广告预制体的添加删除 */

var AdvManager = class AdvManager{
    static _instance = null;
    static _getInstance() {
        if(AdvManager._instance) {
            return AdvManager._instance;
        } else {
            return new AdvManager();
        }
    }
    constructor() {
        this._appbox = null; // 盒子广告对象
        this._boxAdLoad = null; // 盒子广告加载 promise
        this._boxAdCb = null; // 盒子广告监听关闭事件
        this._boxCount = 0; // 统计盒子广告显示次数

        this._isBannerShowed = false;
    }
    initAdv() {
        if(G_PlatHelper.isQQPlatform()) {
            this.initBoxAd();
        }
    }
    showBanner(cb) {
        let self = this;
        console.log("try show banner广告 ",this._isBannerShowed);
        if(this._isBannerShowed) return;
        console.log("显示banner广告");
        if(G_PlatHelper.isOPPOPlatform()) {
            G_OVAdv.showRandomBannerAd();
            self._isBannerShowed = true
        }
        else {
            self._isBannerShowed = true;
            // body...
            if(self._autoBanner) {
                G_Adv.showBannerAdv();
                return;
            }
            G_Adv.createAutoRefreshBannerAdv(15,{bottom:0,centerX:0},
                function(){
                    console.log("banner adv create failed !!!");
                    self._isBannerShowed = false;
                },
                function(){
                    console.log("banner adv create successfully !!!");
                    self._autoBanner = true;
                    G_Adv.showBannerAdv();
            })
        }
    }
    hideBanner() {
        console.log("Try hide banner广告 ", this._isBannerShowed);
        if(!this._isBannerShowed) return;
        console.log("隐藏banner广告");
        this._isBannerShowed = false;
        
        if(G_PlatHelper.isOPPOPlatform()) {
            G_OVAdv.destroyOnShowBannerAd();
        }
        else {
            G_Adv.hideBannerAdv();
        }
    }
    showVideo(resultCb,errorCb) {
        let self = this;
        console.log("拉去视频广告")
        var func = null;
        var resultcb = function(result) {
            if(typeof resultCb == "function") {
                resultCb(result);
            }
            if(!result) {
                //cx_QyDlgMgr.showTips("视频广告获取失败");
            }
            cx_AudioMgr.playMusic();
        }
        var errorcb = function() {
            if(typeof errorCb == "function") {
                errorCb();
            }
            cx_QyDlgMgr.showTips("视频广告获取失败");
            cx_AudioMgr.playMusic();
        }
        if(G_PlatHelper.isOPPOPlatform()) {
            func = G_OVAdv.showRandomVideoAd.bind(G_OVAdv);
        } 
        else {
            func = G_Adv.createVideoAdv.bind(G_Adv);
        }

        func(resultcb,errorcb);
    }
    showNative() {

    }
    hideNative() {

    }

    showInsert() {

    }
    hideInsert() {

    }

    showBox() {

    }
    hideBox() {

    }


    /**
    * 初始创建盒子广告
    */
   initBoxAd() {
       console.log("start create box adv");
      if (!window.qq || !window.qq.createAppBox) return null;
      console.log("start create box adv 01  ");
      this._appbox = qq.createAppBox({
         adUnitId: "fb93624bca75916b8f707b00a65d618f"
      });
      this._boxAdLoad = this._appbox && this._appbox.load && this._appbox.load();

      this._appbox && this._appbox.onClose && this._appbox.onClose(() => {
         console.log('--用户关闭盒子广告');
         this._boxCount += 1;
         if (this._boxCount % 2 == 0) {
            this._boxAdLoad = null;
            this._boxAdLoad = this._appbox && this._appbox.load && this._appbox.load();
         }
         if (typeof this._boxAdCb === 'function') {
            this._appbox.offClose(this._boxAdCb);
            this._boxAdCb = null;
         }
      });
   }
   showBoxAd(cb) {
      if (this._appbox && this._boxAdLoad instanceof Promise) {
         if (typeof cb === 'function') {
            this._boxAdCb = cb;
            this._appbox.onClose(this._boxAdCb);
         }
         this._boxAdLoad.then(() => {
            this._appbox.show && this._appbox.show();
         });
      }
   }
}
module.exports = AdvManager._getInstance();