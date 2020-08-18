cc.Class({
    extends: Cls_BasePopup,

    properties: {
        _title: null,
        _desc: null,
        _advBtn: null,
        _closeBtn: null,
        _clickBtn: null,
        _insertAdObj: null,
        _insertAdInfo: null
    },

    onLoad() {
        // init UI
        this._initUI()
    },

    _initUI() {
        // body...
        let title = G_UIHelper.seekNodeByName(this.node, "title").getComponent(cc.Label)
        if (title) {
            // save
            this._title = title
        }

        let desc = G_UIHelper.seekNodeByName(this.node, "desc").getComponent(cc.Label)
        if (desc) {
            // save
            this._desc = desc
        }

        let advBtn = G_UIHelper.seekNodeByName(this.node, "advBtn").getComponent(cc.Sprite)
        if (advBtn) {
            // save
            this._advBtn = advBtn

            advBtn.node.on('click', this.onAdvTouched, this)
        }

        let closeBtn = G_UIHelper.seekNodeByName(this.node, "closeBtn").getComponent(cc.Button)
        if (closeBtn) {
            // save
            this._closeBtn = closeBtn

            closeBtn.node.on('click', this.onCloseTouched, this)
        }

        let clickBtn = G_UIHelper.seekNodeByName(this.node, "clickBtn").getComponent(cc.Button)
        if (clickBtn) {
            // save
            this._clickBtn = clickBtn

            clickBtn.node.on('click', this.onClickTouched, this)
        }
    },

    onInit() {
        // body...
        let ret = G_OVAdv.getNextNativeAdInfo()

        if (ret) {
            let insertAdObj = ret[0]
            let insertAdInfo = ret[1]

            if (insertAdObj && insertAdInfo) {
                // save
                this._insertAdObj = insertAdObj
                this._insertAdInfo = insertAdInfo
    
                if (this._title) {
                    this._title.string = insertAdInfo.title
                }
    
                if (this._advBtn && insertAdInfo.imgUrlList.length > 0) {
                    let imgUrl = insertAdInfo.imgUrlList[0]
                    cc.loader.load(imgUrl, (err, texture) => {
                        if (err) {
                            return
                        }

                        if (imgUrl === this._insertAdInfo.imgUrlList[0]) {
                            this._advBtn.spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height))
                        }
                    })
                }
    
                if (this._desc) {
                    this._desc.string = insertAdInfo.desc
                }
    
                // report ad show
                G_OVAdv.reportNativeAdShow(insertAdObj, insertAdInfo.adId)
            }

            G_MistakeMgr.isBtnMistakeEnabled(isEnabled => {
                if (isEnabled) {
                    cc.loader.loadRes("ad/ov/insert_ad_check_btn", cc.SpriteFrame, function(err, spriteFrame) {
                        this._advBtn.skin = "ad/ov/insert_ad_check_btn"
                        this._advBtn.spriteFrame = spriteFrame
                    })
                }
                else {
                    cc.loader.loadRes("ad/ov/insert_ad_shutdown_btn", cc.SpriteFrame, function(err, spriteFrame) {
                        this._advBtn.skin = "ad/ov/insert_ad_shutdown_btn"
                        this._advBtn.spriteFrame = spriteFrame
                    })
                }
            })
        }
    },

    onHide() {
    },

    onCloseTouched( btn ) {
        if (btn.skin === "ad/ov/insert_ad_check_btn") {
            // click
            this._clickAdv()
        }
        else {
            // close
            G_OVAdv.reportNativeAdHide()
        }

        G_UIManager.hideUI("insertAd")
    },

    onClickTouched( btn ) {
        // click
        this._clickAdv()

        G_UIManager.hideUI("insertAd")
    },

    onAdvTouched( btn ) {
        // click
        this._clickAdv()
    },

    _clickAdv() {
        if (this._insertAdObj && this._insertAdInfo) {
            G_OVAdv.reportNativeAdClick(this._insertAdObj, this._insertAdInfo.adId, this._insertAdInfo.localAdID)
        }
    }
});
