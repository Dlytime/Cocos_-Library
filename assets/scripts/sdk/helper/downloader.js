// 最大可同步下载数量
var MAX_DOWNLOADING_COUNT = 8
var DIR_NAME_OF_DOWNLOAD = "download"

var __Downloader = cc.Class({
	extends: cc.Component,

	// properties
	properties: {
		_downloadingList: {
			default: {},
			visible: false
		},
		_waitingList: {
			default: [],
			visible: false
		},
		_inited: false,
	},

	ctor: function () {
		// body...
		this._downloadingList.count = 0
	},

	init: function () {
		// body...
		if (G_PlatHelper.getPlat()) {
			let rootDir = this._getDownloadRootDir()
			let fs = G_PlatHelper.getPlat().getFileSystemManager()

			try {
				fs.accessSync(rootDir)
				this._inited = true
			}
			catch (e) {
                try {
					fs.mkdirSync(rootDir, true)
					this._inited = true
				}
				catch (e) {
	                // notify
					G_Event.dispatchEvent(G_EventName.EN_SYSTEM_ERROR)
				}
			}
		}
	},

	// @param fileBody 存储路径（不含后缀）, 无效则随机生成
	// @param url 网络路径
	// @param cb(statusCode, progress, savePath) 回调
	// @cb param statusCode -1: 失败, 0: 正在下载, 1: 成功
	// @cb param progress 进度 statusCode为0时有效
	// @cb param savePath 存储路径
	download: function ( fileBody, url, cb ) {
		// body...
		if (G_PlatHelper.getPlat()) {
			if (!this._isUrlValid(url)) {
				return
			}

			let taskInfo = {
				fileBody: fileBody,
				url: url,
				task: null,
				cbs: []
			}
			taskInfo.cbs.push(cb)

			// push into wait list
			this._waitingList.push(taskInfo)

			// schedule
			if (!this._isScheduled()) {
				this._schedule()
			}
		}
	},

	_isUrlValid: function ( url ) {
		// body...
		if (typeof url !== "string" || url.indexOf("https://") !== 0) {
			console.error("Download Url Error, Check Input: " + url)
			return false
		}

		return true
	},

	_doDownload: function ( taskInfo ) {
		// body...
		if (taskInfo) {
			let _taskInfo = this._downloadingList[taskInfo.url]

			if (typeof _taskInfo !== "undefined") {
				for (let i = 0; i < taskInfo.cbs.length; i++) {
					_taskInfo.cbs.push(taskInfo.cbs[i])
				}

				return
			}
			else {
				if (G_PlatHelper.getPlat()) {
					let saveFilePath = this._makeSaveFilePath(taskInfo.fileBody, taskInfo.url)

					if (this._isTargetFileExist(saveFilePath)) {
						// succ
						this._doCallback(taskInfo, 1, undefined, saveFilePath)
					}
					else {
						var self = this

						taskInfo.task = G_PlatHelper.getPlat().downloadFile({
							url: taskInfo.url,
							filePath: saveFilePath,
							success: function ( res ) {
								// body...
								if (res.statusCode === 200) {
									// succ
									self._doCallback(taskInfo, 1, undefined, saveFilePath)
								}
								else {
									// fail
									self._doCallback(taskInfo, -1)
								}
							},
							fail: function ( res ) {
								// body...
								// fail
								self._doCallback(taskInfo, -1)
							},
							complete: function (res) {
								// body...
								if (typeof self._downloadingList[taskInfo.url] !== "undefined") {
									delete self._downloadingList[taskInfo.url]
									self._downloadingList.count -= 1
								}
							}
						})

						taskInfo.task.onProgressUpdate(function (res) {
							// body...
							// progress
							self._doCallback(taskInfo, 0, res.progress)
						})

						// add into downloading list
						this._downloadingList[taskInfo.url] = taskInfo
						this._downloadingList.count += 1
					}
				}
				else {
					this._doCallback(taskInfo, -1)
				}
			}
		}
	},

	_doCallback: function ( taskInfo, statusCode, progress, savePath ) {
		// body...
		if (taskInfo) {
			for (let i = 0; i < taskInfo.cbs.length; i++) {
				let cb = taskInfo.cbs[i]

				if (typeof cb === "function") {
					cb(statusCode, progress, savePath)
				}
			}
		}
	},

	_update: function () {
		// body...
		if (!this._inited) {
			return
		}

		if (this._downloadingList.count >= MAX_DOWNLOADING_COUNT) {
			console.warn("Max Download Connections, Waiting...")
			return
		}

		if (this._waitingList.length > 0) {
			this._doDownload(this._waitingList[0])
			this._waitingList.splice(0, 1)
		}
		else {
			// unschedule
			this._unschedule()
		}
	},

	_isTargetFileExist: function ( filePath ) {
		// body...
		if (G_PlatHelper.getPlat()) {
			if (typeof filePath === "string" && filePath !== "") {
				try {
					let fs = G_PlatHelper.getPlat().getFileSystemManager()
					fs.accessSync(filePath)

					return true
				}
				catch (e) {
	                return false
				}
			}
			else {
				return false
			}
		}
		else {
			return false
		}
	},

	_makeSaveFilePath: function ( body, url ) {
		// body...
		if (G_PlatHelper.getPlat()) {
			let ext = url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2)

			if (typeof body === "string" && body !== "") {
				return this._getDownloadRootDir() + "/" + body + "." + ext
			}
			else {
				return this._getDownloadRootDir() + "/" + hex_md5(url) + "." + ext
			}
		}
		else {
			return url
		}
	},

	_getDownloadRootDir: function () {
		// body...
		return G_PlatHelper.getPlat().env.USER_DATA_PATH + "/" + DIR_NAME_OF_DOWNLOAD
	},

	_schedule: function () {
		// body...
		if (this._isScheduled()) {
			return
		}

		let scheduler = cc.director.getScheduler()
		scheduler.schedule(this._update, this, 0, cc.macro.REPEAT_FOREVER, 0, false);
	},

	_isScheduled: function () {
		// body...
		let scheduler = cc.director.getScheduler()
		return scheduler.isScheduled(this._update, this)
	},

	_unschedule: function () {
		// body...
		let scheduler = cc.director.getScheduler()
		scheduler.unschedule(this._update, this)
	},
})


var _Downloader = function() {
	var _instance;

	function init() {
		// body ...
		console.log("Init G_Downloader Instance...")

		return (new __Downloader())
	}

	return {
		getInstance: function () {
			if ( !_instance ) {
				_instance = init();

				// init
				_instance.init()
			}

			return _instance;
		}
	};
}();

// export
module.exports = _Downloader
