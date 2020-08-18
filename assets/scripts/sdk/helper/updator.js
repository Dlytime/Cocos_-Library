/*
* 更新
*/
var _Updator = (function () {
	var _instance;

	function init() {
		// body...
		console.log('Init G_Updator Instance...')

		// private
		var _inited = false
		var _version = G_SDKCfg.getAppVersion()

		return {
			init: function () {
				// body...
				if (G_PlatHelper.getPlat()) {
					let rootDir = this._getUpdateRootDir()
					let fs = G_PlatHelper.getPlat().getFileSystemManager()

					try {
						fs.accessSync(rootDir)
						_inited = true
					}
					catch (e) {
		                try {
							fs.mkdirSync(rootDir, true)
							_inited = true
						}
						catch (e) {
			                // notify
							G_Event.dispatchEvent(G_EventName.EN_SYSTEM_ERROR)
						}
					}
				}

				// load local version
				this._refreshVersion()
			},

			getFinalVersion: function () {
				// body...
				return _version
			},

			// cb(statusCode, progress)
			// @param statusCode 0: 正在下载, 1: 成功, -1: 失败
			// @param progress 进度 statusCode为0时有效
			checkUpdate: function ( cb ) {
				// body...
				if (G_PlatHelper.getPlat()) {
					var self = this

					// patch版本
					let version = G_SDKCfg.getPatchVersion()
					if (_version >= version) {
						if (typeof cb === "function") {
                    		cb(1)
                    	}
					}
					else {
						let url = G_GameDB.getBaseConfigByID(BaseConfigIDs["BC_HTTP_ADDR_OF_PATCH_PACKAGE"]).str
						if (url === "") {
							console.error("pls config patch package url first!")

							if (typeof cb === "function") {
	                    		cb(-1)
	                    	}

							// notify
							G_Event.dispatchEvent(G_EventName.EN_SYSTEM_ERROR)
							return
						}

						G_Downloader.download(version.toString(), url, function (statusCode, progress, savePath) {
	                        // body...
	                        if (statusCode === 0) {
	                        	// progress
	                        	if (typeof cb === "function") {
	                        		cb(statusCode, progress)
	                        	}
	                        }
	                        else if (statusCode === 1) {
	                        	// finish
	                        	self._unzipPatch(savePath, function () {
	                        		// body...
	                        		if (typeof cb === "function") {
		                        		cb(statusCode)
		                        	}
	                        	})
	                        }
	                        else if (statusCode === -1) {
	                        	if (typeof cb === "function") {
	                        		cb(statusCode)
	                        	}

	                        	// notify
								G_Event.dispatchEvent(G_EventName.EN_SYSTEM_ERROR)
	                        }
	                    })
					}
				}
				else {
					cb(1)
				}
			},

			_refreshVersion: function () {
				// body...
				if (G_PlatHelper.getPlat()) {
					let verFilePath = this._getUpdateRootDir() + "/ver.txt"
					let fs = G_PlatHelper.getPlat().getFileSystemManager()

					try {
						// access
						fs.accessSync(verFilePath)
						
						// read
						let data = fs.readFileSync(verFilePath, "utf-8")
						let version = parseInt(data, 10)

						if (_version <= version) {
							_version = version
						}
						else {
							// remove old
							this._deleteUpdateRootDir()
						}
					}
					catch (e) {}
				}

				// log
				console.log("Current Resource Version: " + _version.toString())
			},

			_unzipPatch: function ( zipFilePath, cb ) {
				// body...
				if (G_PlatHelper.getPlat()) {
					let fs = G_PlatHelper.getPlat().getFileSystemManager()
					var self = this

					fs.access({
						path: zipFilePath,
						success: function () {
							// body...
							fs.unzip({
								zipFilePath: zipFilePath,
								targetPath: self._getUpdateRootDir(),
								success: function () {
									// body...
									self._refreshVersion()

									if (typeof cb === "function") {
										cb()
									}
								},
								fail: function () {
									// body...
									// notify
									G_Event.dispatchEvent(G_EventName.EN_SYSTEM_ERROR)
								}
							})
						}
					})
				}
			},

			_deleteUpdateRootDir: function ( cb ) {
				// body...
				let fs = G_PlatHelper.getPlat().getFileSystemManager()
			    let rootPath = this._getUpdateRootDir()
			    let rmlist = []

			    let readdir = function (dirPath) {
			        let list = fs.readdirSync(dirPath)
			        if (list) {
			            list.forEach(function (name) {
			                let path = dirPath + '/' + name

			                if (fs.statSync(path).isDirectory()) {
			                    readdir(path)
			                } else {
			                    rmlist.push([1, path])
			                }
			            })
			        }
			        rmlist.push([0, dirPath])
			    }

			    let remove = function () {
			        let info = rmlist.shift()
			        if (info) {
			            if (info[0]) {
			                fs.unlink({
			                    filePath: info[1],
			                    complete: remove,
			                })
			            } else if (info[1] === rootPath) {
			                remove()
			            } else {
			                fs.rmdir({
			                    dirPath: info[1],
			                    recursive: true,
			                    complete: remove,
			                })
			            }
			        }
			    }

			    try {
			    	// read
			        readdir(rootPath)

			        // remove
			        remove()
			    } catch (error) {
			        console.log(error)
			    }
			},

			_getUpdateRootDir: function () {
				// body...
				if (G_PlatHelper.getPlat()) {
					return G_PlatHelper.getPlat().env.USER_DATA_PATH + "/res"
				}
				else {
					return ""
				}
			},
		};
	}

	return {
		getInstance: function () {
			if ( !_instance ) {
				_instance = init();

				// init...
				_instance.init()
			}

			return _instance;
		}
	};
})();

// export
module.exports = _Updator