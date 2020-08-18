var preload = function () {
    // body...
    console.log("开始预先初始化 QYSDK...")

    // Const
    require("qysdk_const").init()

    // BaseUI
    window.Cls_BaseView = require("base_view")
    window.Cls_BasePopup = require("base_popup")
}

var init = function () {
    // body...
    console.log("开始初始化 QYSDK...")

    // Schedule
    window.G_Scheduler = require("scheduler").getInstance()

    // Event
    window.G_Event = require("event").getInstance()

    // Utils
    window.G_Utils = require("utils").getInstance()

    // UIHelper
    window.G_UIHelper = require("ui_helper").getInstance()

    // Plat Helper
    window.G_PlatHelper = new (require("plat_helper"))
    G_PlatHelper.init()
    console.log("当前平台为：" + G_PlatHelper.getPlatDesc())

    // temp
    window.G_WXHelper = G_PlatHelper

    // Downloader
    if (!G_PlatHelper.isQTTPlatform() && G_PlatHelper.getPlat()) {
        window.G_Downloader = require("downloader").getInstance()
    }

    // UIManager
    window.G_UIManager = require("ui_manager").getInstance()

    // GameDB
    window.G_GameDB = require("game_db").getInstance()

    // After GameDB Initialization
    G_GameDB.onLoad(function () {
        // body...
        console.log("GameDB 初始化完成...")

        // SDK Config
        window.G_SDKCfg = require("sdk_conf").getInstance()
        G_SDKCfg.init()

        if (G_SDKCfg.isOpenDataEnabled()) {
            // Open Helper
            window.G_OpenHelper = require("open_helper").getInstance()
        }

        if (G_SDKCfg.isNetwordEnabled()) {
            // WS Helper
            window.G_WSHelper = require("ws_helper").getInstance()
        }

        if (G_SDKCfg.isHttpsEnabled()) {
            // Http Helper
            window.G_HttpHelper = require("http_helper").getInstance()
        }

        // Net Helper
        window.G_NetHelper = require("net_helper").getInstance()
        // first Net Helper
        let arr = G_GameDB.getBaseConfigByID(BaseConfigIDs["BC_HTTP_ADDR_OF_SERVER"]).str.split("||")
        G_NetHelper.registerBaseUrl(arr[0], arr[1])

        // Updator
        if (!G_PlatHelper.isQTTPlatform() && G_PlatHelper.getPlat()) {
            window.G_Updator = require("updator").getInstance()
        }

        // Share
        window.G_Share = new (require("share"))

        // Adv
        window.G_Adv = new (require("adv"))

        // Recommend
        window.G_Recommend = require("recommend").getInstance()

        // open/vivo Adv
        window.G_OVAdv = require("ov_adv").getInstance()

        // Reportor
        window.G_Reportor = require("reportor").getInstance()
    })
}

// preload
preload()

// export
module.exports = {
    init: init
}