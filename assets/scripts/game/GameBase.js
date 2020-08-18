/**
 * 主游戏场景View
 */
cc.Class({
    extends: Cls_BaseView,

    properties: {
    },

    onLoad() {
        // init UI
        this._onInitUI()
  
        // register events
        this._onRegisterEvent()
    },

    /**
     * 第一次加入场景（引擎提供）
     */
    onEnable() {
        // body...
        G_Event.dispatchEvent(G_EventName.EN_FIRST_OPEN_MAIN_SCENE)
    },

    _onInitUI() {
        // body...
        if (typeof this.onInitUI === "function") {
            this.onInitUI()
        }
    },

    _onRegisterEvent() {
        // 商业banner广告相关
        G_Event.addEventListerner(G_EventName.EN_SHOW_OWN_BANNER_AD, () => {
            if (typeof this.onShowOwnBanner === "function") {
                this.onShowOwnBanner()
            }
        })

        G_Event.addEventListerner(G_EventName.EN_HIDE_OWN_BANNER_AD, () => {
            if (typeof this.onHideOwnBanner === "function") {
                this.onHideOwnBanner()
            }
        })

        // 原生插屏广告相关
        G_Event.addEventListerner(G_EventName.EN_SHOW_OWN_INSERT_AD, function () {
            if (typeof this.onShowOwnInsertAd === "function") {
                this.onShowOwnInsertAd()
            }
            
        }.bind(this))

        // 本地提示相关
        G_Event.addEventListerner(G_EventName.EN_SHOW_LOCAL_TIPS, function ( content ) {
            if (typeof this.onShowLocalTips === "function") {
                this.onShowLocalTips(content)
            }
            
        }.bind(this))

        G_Event.addEventListerner(G_EventName.EN_HIDE_LOCAL_TIPS, function () {
            if (typeof this.onHideLocalTips === "function") {
                this.onHideLocalTips()
            }
        }.bind(this))

        if (typeof this.onRegisterEvent === "function") {
            this.onRegisterEvent()
        }
    }
})