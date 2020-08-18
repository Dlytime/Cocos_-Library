import ShareBase from "./share_base";

var UnSupportShare = cc.Class({
	extends: ShareBase,

    ctor() {
    },

    /**
	 * 是否支持分享
	 */
	isSupport() {
		return false
	}
})

var WXShare = cc.Class({
	extends: ShareBase,

    ctor() {
		this._cfgs = {}
    },

    /**
	 * 是否支持分享
	 */
	isSupport() {
		return true
	},

	_makeAndSaveShareInfo( _scene_name, _extendParams, _cfg, _customQueryObj, _showFailTips, _cb ) {
		let shareInfo = this._super(_scene_name, _extendParams, _cfg, _customQueryObj, _showFailTips, _cb)

		if (_cfg) {
			shareInfo.title = _cfg.title
			shareInfo.imageUrl = _cfg.img_url
		}

		return shareInfo
	},

	_getOnMenuShareFunc( cb ) {
		if (typeof cb !== "function") {
			return
		}

		if (G_PlatHelper.getPlat() && this.isSupport()) {
			G_SDKCfg.isAldReportEnabled(isEnabled => {
				if (isEnabled) {
					cb(G_PlatHelper.getPlat().aldOnShareAppMessage)
				}
				else {
					G_SDKCfg.isQyReportEnabled(isEnabled => {
						if (isEnabled) {
							cb(G_PlatHelper.getPlat().h_OnShareAppMessage)
						}
						else {
							cb(G_PlatHelper.getPlat().onShareAppMessage)
						}
					})
				}
			})
		}
		else {
			cb(null)
		}
	},

	_getShareAppFunc() {
		if (G_PlatHelper.getPlat() && this.isSupport()) {
			if (G_SDKCfg.isAldReportEnabledSync()) {
				return G_PlatHelper.getPlat().aldShareAppMessage
			}
			else if (G_SDKCfg.isQyReportEnabledSync()) {
				return G_PlatHelper.getPlat().h_ShareAppMessage
			}
			else {
				return G_PlatHelper.getPlat().shareAppMessage
			}
		}

		return null
	}
})

var QQShare = cc.Class({
	extends: ShareBase,

    ctor() {
		this._cfgs = {}
    },

    /**
	 * 是否支持分享
	 */
	isSupport() {
		return true
	},

	_makeAndSaveShareInfo( _scene_name, _extendParams, _cfg, _customQueryObj, _showFailTips, _cb ) {
		let shareInfo = this._super(_scene_name, _extendParams, _cfg, _customQueryObj, _showFailTips, _cb)

		if (_cfg) {
			shareInfo.title = _cfg.title
			shareInfo.imageUrl = _cfg.img_url
		}

		return shareInfo
	},

	_getOnMenuShareFunc( cb ) {
		if (typeof cb !== "function") {
			return
		}

		if (G_PlatHelper.getPlat() && this.isSupport()) {
			G_SDKCfg.isAldReportEnabled(isEnabled => {
				if (isEnabled) {
					cb(G_PlatHelper.getPlat().aldOnShareAppMessage)
				}
				else {
					G_SDKCfg.isQyReportEnabled(isEnabled => {
						if (isEnabled && G_PlatHelper.getPlat().h_OnShareAppMessage) {
							cb(G_PlatHelper.getPlat().h_OnShareAppMessage)
						}
						else {
							cb(G_PlatHelper.getPlat().onShareAppMessage)
						}
					})
				}
			})
		}
		else {
			cb(null)
		}
	},

	_getShareAppFunc() {
		if (G_PlatHelper.getPlat() && this.isSupport()) {
			if (G_SDKCfg.isAldReportEnabledSync()) {
				return G_PlatHelper.getPlat().aldShareAppMessage
			}
			else if (G_SDKCfg.isQyReportEnabledSync()) {
				return G_PlatHelper.getPlat().h_ShareAppMessage
			}
			else {
				return G_PlatHelper.getPlat().shareAppMessage
			}
		}

		return null
	}
})

var TTShare = cc.Class({
	extends: ShareBase,

    ctor() {
		this._cfgs = {}
    },

    /**
	 * 是否支持分享
	 */
	isSupport() {
		return true
	},

	/**
	 * 分享视频
	 * @param {String} scene_name 场景名，必须属于G_ShareScene
	 * @param {String} videoPath 视频地址
	 * @param {Object} customQueryObj 自定义参数
	 * @param {Boolean} showFailTips 是否显示失败提示，默认true
	 * @param {Function} cb 回调函数
	 */
	shareVideo(scene_name, videoPath, customQueryObj, showFailTips = true, cb = null) {
		// body...
		if (!this._checkString(scene_name) || !this._checkString(videoPath)) {
			if (typeof cb === "function") {
				cb(false)
			}
			return
		}

		if (this.isSupport()) {
			if (!this.isReady()) {
				this._initedCbs[scene_name] = {
					extendParams: {videoPath: videoPath},
					customQueryObj: customQueryObj,
					showFailTips: showFailTips,
					cb: cb
				}
			}
			else {
				this._doShare(scene_name, {videoPath: videoPath}, customQueryObj, showFailTips, cb)
			}
		}
		else {
			if (typeof cb === "function") {
				cb(true)
			}
		}
	},

	_makeAndSaveShareInfo( _scene_name, _extendParams, _cfg, _customQueryObj, _showFailTips, _cb ) {
		let shareInfo = this._super(_scene_name, _extendParams, _cfg, _customQueryObj, _showFailTips, _cb)

		if (_cfg) {
			shareInfo.templateId = _cfg.template_id
		}

		if (_extendParams && typeof _extendParams.videoPath !== "undefined") {
			shareInfo.channel = "video"
			shareInfo.extra = {
				videoPath: _extendParams.videoPath
			}
		}

		let queryStr = ""
		let launchOpts = G_PlatHelper.getPlat().getLaunchOptionsSync()
		if (launchOpts && launchOpts.query) {
			for (let key in launchOpts.query) {
				let val = launchOpts.query[key].toString()

				if (key === "sc") {
					val = (parseInt(val) + 1).toString()
				}

				if (queryStr === "") {
					queryStr += key + "=" + val
				}
				else {
					queryStr += "&" + key + "=" + val
				}
			}
		}
		if (queryStr !== "") {
			shareInfo.query = queryStr
		}

		return shareInfo
	},

	_getOnMenuShareFunc( cb ) {
		if (typeof cb !== "function") {
			return
		}

		if (G_PlatHelper.getPlat() && this.isSupport()) {
			cb(G_PlatHelper.getPlat().onShareAppMessage)
		}
		else {
			cb(null)
		}
	},

	_getShareAppFunc() {
		if (G_PlatHelper.getPlat() && this.isSupport()) {
			return G_PlatHelper.getPlat().shareAppMessage
		}

		return null
	},

	_getShareFailTips( _extendParams ) {
		// body...
		if (_extendParams && typeof _extendParams.videoPath !== "undefined") {
			if (!this._shareFailTips) {
				this._shareFailTips = []
				this._shareFailTips.push(G_GameDB.getUIWordByID(UIWordIDs["UIWORD_ID_SHARE_VIDEO_FAIL_TIPS_ONE"]).word)
			}
	
			return this._shareFailTips
		}
		else {
			return this._super()
		}
	}
})

var _Share = null

if (typeof window.qq !== "undefined") {
    _Share = QQShare
}
else if (typeof window.tt !== "undefined") {
    _Share = TTShare
}
else if (typeof window.wx !== "undefined") {
    _Share = WXShare
}
else {
    _Share = UnSupportShare
}

// export
module.exports = _Share