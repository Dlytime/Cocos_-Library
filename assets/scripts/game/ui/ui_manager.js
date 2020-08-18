var UIRegisterInfos = require("./conf/ui_registor") 

var _UIManager = (function () {
	var _instance;
	
	function init() {
		// body...
        console.log('Init G_UIManager Instance...');
        
        var _UIInfos = {}
        var _UIRoot = null

        var _checkString = function (string) {
			// body...
			if (typeof string !== "string" || string === "") {
				return false
			}

			return true
		}

		return {
            registerAllUIs() {
				UIRegisterInfos.forEach(info => {
					this.registerUI(info.key, info.zIndex, info.isAutoDestory, info.cls, info.prefab)
				})
			},

            registerUI( key, zIndex, isAutoDestory, cls, prefabPath ) {
            	// body...
                if (!_checkString(key)) {
                	console.error("UIManager.registerUI: key must be a type of string and not empty...")
                	return
                }

                if (typeof _UIInfos[key] !== "undefined") {
                	console.error("UIManager.registerUI: {0} has registered before...".format(key))
                	return
                }

                if (!_checkString(prefabPath) ) {
                    console.error("UIManager.registerUI: prefabPath must be a type of string and not empty...")
                    return
                }

                _UIInfos[key] = {
                	key: key,
                	zIndex: zIndex,
                    isAutoDestory: isAutoDestory,
                    cls: cls,
                    clsObj: null,
                    prefab: null,
                    closeCb: null,
                    node: null,
                }
                
                cc.loader.loadRes(prefabPath, cc.Prefab, (err, pref) => {
                    if (err) {
                        console.error(err)
        
                        // notify
                        G_Event.dispatchEvent(G_EventName.EN_SYSTEM_ERROR)
                    }
                    else {
                        // save
                        _UIInfos[key].prefab = pref
                    }
                })

                console.log("UIManager.registerUI: {0} UI has registered successful...".format(key))
            },

            unregisterUI( key ) {
            	// body...
                let info = this._doCheck(key, "unregisterUI")

                if (info) {
                    delete _UIInfos[key]

                    console.log("UIManager.unregisterUI: {0} UI has unregistered successful...".format(key))
                }
            },

            // 一般一个场景注册一次，离开场景反注册
            registerUIRoot( root ) {
                _UIRoot = root
            },

            unregisterUIRoot() {
                _UIRoot = null
            },

            showUI( key, closeCb ) {
                let info = this._doCheck(key, "showUI")

                if (info) {
                    if (!info.node) {
                        info.node = cc.instantiate(info.prefab)

                        if (info.node) {
                            info.clsObj = info.node.getComponent(info.cls)
                            info.node.zIndex = info.zIndex
                            info.node.parent = _UIRoot
                        }
                    }

                    // save
                    info.closeCb = closeCb

                    // show
                    if (arguments.length > 2) {
                        let args = Array.prototype.slice.call(arguments)
                        args.shift()
                        args.shift()
                        info.clsObj.showUI.apply(info.clsObj, args)
                    }
                    else {
                        info.clsObj.showUI.apply(info.clsObj, [])
                    }

                    return [info.node, info.clsObj]
                }

                return null
            },

            hideUI( key ) {
                let info = this._doCheck(key, "hideUI")
                
                if (info && info.node) {
                    let onHideFinished = null
                    onHideFinished = function () {
                        // body...
                        info.clsObj.unregisterCallback("close", onHideFinished)
                      
                        if (typeof info.closeCb === "function") {
                            info.closeCb()
                            info.closeCb = null
                        }
                        
                        if (info.isAutoDestory) {
                           this._destroyUI(info)
                        }
                    }.bind(this)
                    
                    // hide
                    info.clsObj.registerCallback("close", onHideFinished)
                    info.clsObj.hideUI()
                }
            },

            getUI( key ) {
                let info = this._doCheck(key, "getUI")

                if (info) {
                    return [info.node, info.clsObj]
                }
                else {
                    return null
                }
            },

            preloadUI( keys, cb ) {
                // body...
                let nodes = []

                if (typeof keys === "string") {
                    let key = keys
                    nodes.push(this._doPreloadUI(key))
                }
                else if (Array.isArray(keys)) {
                    for (let i = 0; i < keys.length; i++) {
                        let key = keys[i]
                        nodes.push(this._doPreloadUI(key))
                    }
                }

                G_Scheduler.schedule("UIManager_Preload_UI", function () {
                    // body...
                    for (let i = 0; i < nodes.length; i++) {
                        let node = nodes[i]
                        node.active = false
                        node.opacity = 255
                    }
                    
                    // cb
                    if (typeof cb === "function") {
                        cb()
                    }
                }.bind(this), 0.1, 0)
            },

            _doPreloadUI( key ) {
                let info = this._doCheck(key, "preloadUI")

                if (info) {
                    let ret = this.showUI(key)
                    let node = null

                    if (ret) {
                        node = ret[0]
                    }

                    if (node) {
                        node.opacity = 0
                        return node
                    }
                }

                return null
            },

            _doCheck( key, tag ) {
                if (!_checkString(key)) {
                    console.error("UIManager.{0}: key must be a type of string and not empty...".format(tag))
                    return null
                }

                let info = _UIInfos[key]

                if (typeof info === "undefined") {
                    console.error("UIManager.{0}: {1} has not registered before...".format(tag, key))
                    return null
                }

                return info
            },

            _destroyUI( info ) {
                if (info && info.node) {
                    info.node.destroy()
                    info.node = null
                }
            },
		};
	}

	return {
		getInstance: function () {
			if ( !_instance ) {
				_instance = init();
			}

			return _instance;
		}
	};
})();

// export
module.exports = _UIManager