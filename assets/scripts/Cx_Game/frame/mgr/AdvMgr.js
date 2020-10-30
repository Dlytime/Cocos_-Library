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
        this._initBanner();
        if(G_PlatHelper.isQQPlatform()) {
            this.initBoxAd();
            this.initBlockAd();

/*             if(!this._bannerAd) {
                this._bannerAd = qq.createBannerAd({
                    adUnitId: '163b55e0be33d872ade7669cb187a5cf',
                    style: {
                      width: 320
                    }
                  })
            } */
        }
    }
    _initBanner() {
        let self = this;
        if(G_PlatHelper.isOPPOPlatform()) {

        }
        else if(G_PlatHelper.isQQPlatform())
        {
            self._autoBanner = true;
        } 
        else {
            console.log("首次创建banner");
            let st = 15;
            if(cx_QyMgr.getPlatName() == "qq") {
                //st = 45;
            }
            G_Adv.createAutoRefreshBannerAdv(st,{bottom:0,centerX:0},
                function(){
                    console.log("banner adv create failed !!!");
                },
                function(){
                    self._autoBanner = true;
                    console.log("banner adv create successfully !!!");
                    //G_Adv.showBannerAdv();
            })
        }
    }
    showBanner(cb) {
        let self = this;
        console.log("try show banner广告 ",self._isBannerShowed);
        if(self._isBannerShowed && !G_PlatHelper.isQQPlatform()) return;
        console.log("显示banner广告");
        self._showBanner(cb);
    }
    _showBanner(cb) {
        let self = this;
        if(G_PlatHelper.isOPPOPlatform()) {
            G_OVAdv.showRandomBannerAd();
            self._isBannerShowed = true
        }
         else if(G_PlatHelper.isQQPlatform())
        {
             self._isBannerShowed = true;
             console.log("qq banner show");
              G_Event.dispatchEvent(G_EventName.EN_HIDE_BANNER_AD);
              G_Event.dispatchEvent(G_EventName.EN_SHOW_BANNER_AD);
        } 
        else {
            // body...
            if(self._autoBanner) {
                //G_Event.dispatchEvent(G_EventName.EN_HIDE_BANNER_AD);
                //G_Event.dispatchEvent(G_EventName.EN_SHOW_BANNER_AD);
                self._isBannerShowed = true;
                G_Adv.hideBannerAdv();
                G_Adv.showBannerAdv();
                return;
            }
        }
    }
    _showTTBanner() {
        this._bannerAd_tt = tt.createBannerAd({adUnitId:"1qvlsts5w5v4hg92ff"});
        this._bannerAd_tt.onLoad(function () {
            bannerAd
              .show()
              .then(() => {
                console.log("广告显示成功");
              })
              .catch((err) => {
                console.log("广告组件出现问题", err);
              });
          }); 
    }
    hideBanner() {
        console.log("Try hide banner广告 ", this._isBannerShowed);
        if(!this._isBannerShowed && !G_PlatHelper.isQQPlatform()) return;
        console.log("隐藏banner广告");
        this._isBannerShowed = false;
        
        if(G_PlatHelper.isOPPOPlatform()) {
            G_OVAdv.destroyOnShowBannerAd();
        }
/*         else if(G_PlatHelper.isQQPlatform()) {
            console.log("banner obj is", this._bannerAd)
            this._bannerAd.hide();
        } */
        else if(G_PlatHelper.isQQPlatform()) {
            G_Event.dispatchEvent(G_EventName.EN_HIDE_BANNER_AD)
            //G_Adv.hideBannerAdv();
        }
        else {
            G_Adv.hideBannerAdv();
        }
    }
    showVideo(resultCb,errorCb) {
        let self = this;
        
        this._showVideo(resultCb,errorCb);
    }
    _showVideo(resultCb,errorCb) {
        let self = this;
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
        console.log("拉取视频广告")
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
      if (!window.qq || !window.qq.createAppBox) return null;
      this._appbox = qq.createAppBox({
         adUnitId: "5abcc13470ee455303a5fd283cf027e3"
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
       console.log("try show box ad")
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
   
   initBlockAd() {
       let sysInfo = G_PlatHelper.getSysInfo();
       let x = 10;
       let y = 50;
       let x2 = sysInfo.screenWidth - 120;
       //if(sysInfo.platform == "iphone") x2 = x2 
       console.log("cc.winSize",cc.winSize,x2);
       this._blockAd_1 = qq.createBlockAd({
            adUnitId: '19e91692683eaf083b1d791d9fabf3c7',
            size: 4,
            orientation: 'vertical',
            style: {
              left: x,
              top: y
            }
        })
        this._blockAd_1.onLoad((res)=>{
            console.log("block ad load ",res);
        })
        this._blockAd_1.onError((res)=>{
            console.log("block ad error ",res);
        })


        this._blockAd_2 = qq.createBlockAd({
            adUnitId: 'f29e3d579017f72cd88ae67ef3a94d18',
            size: 4,
            orientation: 'vertical',
            style: {
              left: x2,
              top: y
            }
        })
        this._blockAd_2.onLoad((res)=>{
            console.log("block ad load ",res);
        })
        this._blockAd_2.onError((res)=>{
            console.log("block ad error ",res);
        })
/*         this._blockAd_2 = qq.createBlockAd({
            adUnitId: '850c4b908e26c45c0d7e11c600bf8f4e',
            size: 4,
            orientation: 'vertical',
            style: {
              left: x2,
              top: y
            }
          })  */
   }
   showBlockAd(left,right) {
       console.log("show block ad now ",this._blockAd_1)
        if(this._blockAd_2 && left) {
            this._blockAd_2.show();
        }
        if(this._blockAd_1 && right) {
            //this._blockAd_1.hide();
            this._blockAd_1.show();
        }
   }
   hideBlockAd() {
        if(this._blockAd_1) {
            this._blockAd_1.hide();
        }

        if(this._blockAd_2) {
            this._blockAd_2.hide();
        }
   }
  
}
module.exports = AdvManager._getInstance();