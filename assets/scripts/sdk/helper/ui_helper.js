/*
* 全局UI帮助
* 主要用过微信提供的接受实现一些特性UI的功能
*/

var _UIHelper = (function () {
	var _instance;

	function init() {
		// body...
		console.log('Init G_UIHelper Instance...')

		var _lastScene = null
		var _defaultHeadTexture = null
		var _remoteHeadCached = {}

		return {
			init: function () {
				cc.loader.loadRes("comm/default_head", 
					(err, texture) => {
						if (err) {
							console.error(err)
						}
						else {
							// save
							_defaultHeadTexture = texture
						}
					}
				)
			},

			/**
			 * 遍历查找指定名称的节点
			 * @param {cc.Node} node 
			 * @param {string} name 
			 */
			seekNodeByName: function (node, name) {
				// body...
			    if (node.name === name) return node

			    var c = undefined
			    node.children.forEach(element => {
			        if (!c) c = this.seekNodeByName(element, name)
			    })

			    return c
			},

			enterScene: function (scene, progressCb, errCb) {
				// body...
				if (_lastScene && _lastScene == scene) {
					return
				}

				// save
				_lastScene = scene

				cc.director.preloadScene(scene,
					function (percent) {
						// body...
						if (typeof progressCb === "function") {
							progressCb(percent)
						}
					},
					function () {
						// body...
						cc.director.loadScene(scene, function (err) {
				            _lastScene = null

				            if (typeof errCb === "function") {
				            	errCb(err)
				            }
				        })
					}
				)
			},

			// 将content中的指定节点水平间隔排列
			layoutItemsInContent: function ( content, nodeArr, gap ) {
				// body...
				if (content && nodeArr && nodeArr.length > 0 && (typeof gap === "number")) {
					let totalWidth = 0
					for (let i = 0; i < nodeArr.length; i++) {
						totalWidth += nodeArr[i].width * nodeArr[i].scaleX 
						if (i !== 0) {
							totalWidth += gap
						}
					}

					let firstPosX = (content.width - totalWidth) / 2 - content.width * content.anchorX

					for (let i = 0; i < nodeArr.length; i++) {
						if (i === 0) {
							nodeArr[i].x = firstPosX + nodeArr[i].width * nodeArr[i].scaleX * nodeArr[i].anchorX
						}
						else {
							let leftPosX = nodeArr[i - 1].x + nodeArr[i - 1].width * nodeArr[i - 1].scaleX * (1 - nodeArr[i - 1].anchorX) + gap
							nodeArr[i].x = leftPosX + nodeArr[i].width * nodeArr[i].scaleX * nodeArr[i].anchorX
						}
					}
				}
			},

			// 刷新按钮的免费获取方式
			refreshFreeWayOfBtn: function (btn, videoIconPath = "comm/video_icon", shareIconPath = "comm/share_icon") {
				if (btn) {
					if (!btn.getWay) {
						// default
						btn._way = G_FreeGetWay.FGW_NONE

						btn.getWay = function () {
							return btn._way
						}
					}

					if (!btn.refreshWay) {
						btn.refreshWay = function () {
							G_FreeGetMgr.getNextFreeGetWay(function ( way ) {
								console.log("next free get way:", way)
								btn._way = way
				
								let icon = G_UIHelper.seekNodeByName(btn, "icon")
								if (icon) {
									if (way === G_FreeGetWay.FGW_ADV) {
										cc.loader.loadRes(videoIconPath, cc.SpriteFrame, function(err, spriteFrame) {
											icon.getComponent(cc.Sprite).spriteFrame = spriteFrame
										})
									}
									else {
										cc.loader.loadRes(shareIconPath, cc.SpriteFrame, function(err, spriteFrame) {
											icon.getComponent(cc.Sprite).spriteFrame = spriteFrame
										})
									}
								}

								if (way === G_FreeGetWay.FGW_NONE && !G_Share.isSupport()) {
									btn.visible = false
								}
							})
						}
					}

					if (!btn.doTouch) {
						btn.doTouch = function ( shareScene, succCb, failCb ) {
							// video
							if (btn.getWay() === G_FreeGetWay.FGW_ADV) {
								// pause bgm
								G_SoundMgr.pauseMusic()

								let checkVideoRet = function ( isEnded ) {
									// resume bgm
									G_SoundMgr.resumeMusic()

									if (isEnded) {
										// succ cb
										if (typeof succCb === "function") {
											succCb()
										}
									}
									else {
										// no finish
										G_PlatHelper.showToast(G_GameDB.getUIWordByID(UIWordIDs["UIWORD_ID_ADV_FAIL"]).word)

										// fail cb
										if (typeof failCb === "function") {
											failCb()
										}
									}
								}

								if (G_PlatHelper.isOPPOPlatform() || G_PlatHelper.isVIVOPlatform()) {
									let funcName = "showRandomVideoAd"
									let func = G_OVAdv[funcName]
									if (func) {
										let adObj = func.call(G_OVAdv, function (isEnded) {
											checkVideoRet(isEnded)
										}, function (cdTime) {
											// resume bgm
											G_SoundMgr.resumeMusic()
											
											if (cdTime === -1) {
												// retry later
												G_PlatHelper.showToast(G_GameDB.getUIWordByID(UIWordIDs["UIWORD_ID_VIDEO_NOT_READY_YET"]).word)
											}
											else {
												// not ready yet
												let formatStr = G_GameDB.getUIWordByID(UIWordIDs["UIWORD_ID_FORMAT_OF_VIDEO_NOT_READY_YET"]).word
												G_PlatHelper.showToast(formatStr.format(cdTime.toString()))
											}

											// fail cb
											if (typeof failCb === "function") {
												failCb()
											}
										})

										if (!adObj) {
											// resume bgm
											G_SoundMgr.resumeMusic()

											// fail cb
											if (typeof failCb === "function") {
												failCb()
											}
										}
									}
								}
								else if (G_PlatHelper.isQTTPlatform()) {
									G_PlatHelper.getPlat().showVideo(res => {
										if (res === 1 || res === 0) {
											checkVideoRet(true)
										}
										else if (res === 2) {
											checkVideoRet(false)
										}
										else {
											// retry later
											G_PlatHelper.showToast(G_GameDB.getUIWordByID(UIWordIDs["UIWORD_ID_VIDEO_NOT_READY_YET"]).word)
											
											// fail cb
											if (typeof failCb === "function") {
												failCb()
											}
										}
									})
								}
								else {
									G_Adv.createVideoAdv(function ( isEnded ) {
										checkVideoRet(isEnded)
									}, function () {
										// not support video anymore

										// resume bgm
										G_SoundMgr.resumeMusic()

										// refresh
										btn.refreshWay()

										// fail cb
										if (typeof failCb === "function") {
											failCb()
										}
									})
								}
							}
							else {
								// share
								G_Share.share(shareScene, null, true, function (bSucc) {
									// body...
									if (bSucc) {
										if (btn.getWay() === G_FreeGetWay.FGW_SHARE) {
											// succ cb
											if (typeof succCb === "function") {
												succCb()
											}
										}
										else {
											// no more
											G_PlatHelper.showToast(G_GameDB.getUIWordByID(UIWordIDs["UIWORD_ID_NO_MORE_REWARD"]).word)
										}
									}

									// fail cb
									if (typeof failCb === "function") {
										failCb()
									}
								})
							}
						}
					}

					// init
					btn._originalScale = btn.scaleX

					// refresh
					btn.refreshWay()
				}
			},

			delayShow: function ( node, delay = 3.0 ) {
				if (node && !G_PlatHelper.isOPPOPlatform()) {
					node.visible = false

					G_Scheduler.schedule("Delay_Show_Of_" + G_Utils.generateString(32), function () {
						node.visible = true
					}, delay, 0)
				}
				else {
					node.visible = true
				}
			},

			autoMoveWithDefaultConfig(node, offsetPos, cb) {
				G_Switch.getMoveMistakeConfig(cfg => {
					this.autoMove(node, 0, cfg.hold1, cfg.hold2, cfg.move, true, offsetPos, cb)
				})
			},

			autoMove: function ( node, hideDuration, holdDuration_1, holdDuration_2, moveDuration, isTween, offsetPos, cb ) {
				if (node) {
					if (!node._originalPos) {
						node._originalPos = {x: node.x, y: node.y}
					}

					// clear
					node.stopAllActions()
					
					// move to target pos
					node.visible = false
					node.x = node._originalPos.x + offsetPos.x
					node.y = node._originalPos.y + offsetPos.y

					node.runAction(
						cc.sequence(
							cc.delayTime(hideDuration),
							cc.callFunc(() => {
								node.visible = true
								if (typeof cb === "function") {
									cb("hide_finished")
								}
							}),
							cc.delayTime(holdDuration_1),
							cc.callFunc(() => {
								if (typeof cb === "function") {
									cb("hold_finished_1")
								}
							}),
							cc.delayTime(holdDuration_2),
							cc.callFunc(() => {
								if (typeof cb === "function") {
									cb("hold_finished_2")
								}

								if (isTween) {
									node.runAction(
										cc.sequence(
											cc.moveTo(moveDuration, cc.v2(node._originalPos.x, node._originalPos.y)),
											cc.callFunc(function () {
												// move to default pos
												node.x = node._originalPos.x
												node.y = node._originalPos.y
					
												if (typeof cb === "function") {
													cb("move_finished")
												}
											})
										)
									)
								}
								else {
									node.runAction(
										cc.sequence(
											cc.delayTime(moveDuration),
											cc.callFunc(function () {
												// move to default pos
												node.x = node._originalPos.x
												node.y = node._originalPos.y
					
												if (typeof cb === "function") {
													cb("move_finished")
												}
											})
										)
									)
								}
							}),
							
						)
					)
				}	
			},

			// 将世界坐标转化为OpenGL坐标
			// Window端不会有变化
			convertToOpenGLPt: function ( worldPt ) {
				// body...
				let openGLPt = cc.v2(0, 0)

				if (typeof worldPt.x === "undefined" || worldPt.x === null
					|| typeof worldPt.y === "undefined" || worldPt.y === null) {
					return openGLPt
				}

				let sysInfo = G_PlatHelper.getSysInfo()
				
				openGLPt.x = worldPt.x / cc.winSize.width * sysInfo.screenWidth
				openGLPt.y = (1 - worldPt.y / cc.winSize.height) * sysInfo.screenHeight

				return openGLPt
			},

			// 将世界Size转化为OpenGL的Size
			// Window端不会有变化
			convertToOpenGLSize: function ( worldSize ) {
				// body...
				let openGLSize = cc.size(0, 0)

				if (typeof worldSize.width === "undefined" || worldSize.width === null
					|| typeof worldSize.height === "undefined" || worldSize.height === null) {
					return openGLSize
				}

				let sysInfo = G_PlatHelper.getSysInfo()
				
				openGLSize.width = worldSize.width / cc.winSize.width * sysInfo.screenWidth
				openGLSize.height = worldSize.height / cc.winSize.height * sysInfo.screenHeight

				return openGLSize
			},

			// 将OpenGL坐标转化为世界坐标
			// Window端不会有变化
			convertToWorldPt: function ( openGLPt ) {
				// body...
				let worldPt = cc.v2(0, 0)

				if (typeof openGLPt.x === "undefined" || openGLPt.x === null
					|| typeof openGLPt.y === "undefined" || openGLPt.y === null) {
					return worldPt
				}

				let sysInfo = G_PlatHelper.getSysInfo()
				
				worldPt.x = openGLPt.x / sysInfo.screenWidth * cc.winSize.width
				worldPt.y = openGLPt.y / sysInfo.screenHeight * cc.winSize.height

				return worldPt
			},

			// 将OpenGL的Size转化为世界Size
			// Window端不会有变化
			convertToWorldSize: function ( openGLSize ) {
				// body...
				let worldSize = cc.size(0, 0)

				if (typeof openGLSize.width === "undefined" || openGLSize.width === null
					|| typeof openGLSize.height === "undefined" || openGLSize.height === null) {
					return worldSize
				}

				let sysInfo = G_PlatHelper.getSysInfo()
				
				worldSize.width = openGLSize.width / sysInfo.screenWidth * cc.winSize.width
				worldSize.height = openGLSize.height / sysInfo.screenHeight * cc.winSize.height

				return worldSize
			},

			loadRemoteHead: function (avatarUrl, cb) {
				// body...
				if (!this._checkString(avatarUrl) || avatarUrl.indexOf("https://") !== 0) {
					if (typeof cb === "function") {
						cb(avatarUrl, _defaultHeadTexture)
					}
					return
				}

				if (typeof _remoteHeadCached[avatarUrl] === "undefined") {
					if (typeof cb === "function") {
						cb(avatarUrl, _defaultHeadTexture)
					}
				}
				else {
					if (typeof cb === "function") {
						cb(avatarUrl, _remoteHeadCached[avatarUrl])
					}
				}

				cc.loader.load({
						url: avatarUrl,
						type: 'png'
					}, 
					(err, texture) => {
						if (err) {
							console.error(err)
						}
						else {
							// save
							_remoteHeadCached[avatarUrl] = texture

							if (typeof cb === "function") {
								cb(avatarUrl, texture)
							}
						}
					}
				)
			},

			_checkString: function (title) {
				// body...
				if (typeof title === "string" && title !== "") {
					return true
				}
				else {
					return false
				}
			}
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
module.exports = _UIHelper