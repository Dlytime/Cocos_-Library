var OpenType = cc.Enum({
    None: 0,
    Scale: 1,
    Opacity: 2,
});

var CloseType = cc.Enum({
    None: 0,
    Scale: 1,
    Opacity: 2,
});

var cls = cc.Class({
    extends: cc.Component,

    properties: {
        rootNode: {
            default: null,
            type: cc.Node,
            tooltip: "根节点，一般为打开关闭动画的根节点"
        },
        _callbacks: {
            default: {},
            visible: false
        },
        openType: {
            type: cc.Enum(OpenType),
            default: OpenType.None,
            tooltip: "弹窗打开方式"
        },
        closeType: {
            type: cc.Enum(CloseType),
            default: CloseType.None,
            tooltip: "弹窗关闭方式"
        }
    },

    showUI() {
        this.node.active = true

        // init
        if (arguments.length > 0) {
            this._onInit(...arguments)
        }
        else {
            this._onInit()
        }

        if (this.openType === OpenType.Scale) {
            this._runScaleOpenAction(() => {
                // body...
                this._onShow()
            })
        }
        else if (this.openType === OpenType.Opacity) {
            this._runOpacityOpenAction(() => {
                this._onShow()
            })
        }
        else {
            this._onShow()
        }
    },

    hideUI() {
        if (this.closeType === CloseType.Scale) {
            this._runScaleCloseAction(() => {
                // body...
                this._onHide()
            })
        }
        else if (this.closeType === CloseType.Opacity) {
            this._runOpacityCloseAction(() => {
                // body...
                this._onHide()
            })
        }
        else {
            this._onHide()
        }
    },

    isOnShow() {
        return this.node.active
    },

    _onInit() {
        if (this.rootNode) {
            this.rootNode.anchorX = 0.5
            this.rootNode.anchorY = 0.5
            this.rootNode.x = 0
            this.rootNode.y = 0
            this.rootNode.opacity = 255
        }

        if (typeof this.onInit === "function") {
            if (arguments.length > 0) {
                this.onInit(...arguments)
            }
            else {
                this.onInit()
            }
        }
    },

    _onShow() {
        if (this.rootNode) {
            this.rootNode.stopAllActions()
        }
        
        if (typeof this.onShow === "function") {
            this.onShow()
        }
    },

    _onHide() {
        if (typeof this.onHide === "function") {
            this.onHide()
        }

        // hide
        this.node.active = false

        // cb
        this.invokeCallback("close")
    },

    _runScaleOpenAction( cb ) {
        if (this.rootNode) {
            this.rootNode.stopAllActions()

            // init scale
            this.rootNode.setScale(0.8)

            // action
            this.rootNode.runAction(cc.sequence(cc.scaleTo(0.5, 1.0, 1.0).easing(cc.easeElasticOut(0.5)), cc.callFunc(function () {
                // body...
                if (typeof cb === "function") {
                    cb()
                }
            })))
        }
    },

    _runOpacityOpenAction(cb) {
        if (this.rootNode) {
            this.rootNode.stopAllActions()

            this.rootNode.opacity = 0;

            this.rootNode.runAction(
                cc.sequence(
                    cc.fadeIn(0.4),
                    cc.callFunc(function () {
                        // body...
                        if (typeof cb === "function") {
                            cb()
                        }
                    })
                )
            )
        }
    },

    _runScaleCloseAction( cb ) {
        if (this.rootNode) {
            this.rootNode.stopAllActions()

            // init scale
            this.rootNode.setScale(1.0)

            // action
            this.rootNode.runAction(cc.sequence(cc.scaleTo(0.5, 0.1, 0.1).easing(cc.easeElasticIn(0.5)), cc.callFunc(function () {
                // body...
                if (typeof cb === "function") {
                    cb()
                }
            })))
        }
    },

    _runOpacityCloseAction(cb) {
        if (this.rootNode) {
            this.rootNode.stopAllActions()

            this.rootNode.opacity = 255;

            this.rootNode.runAction(
                cc.sequence(
                    cc.fadeOut(0.4),
                    cc.callFunc(function () {
                        // body...
                        if (typeof cb === "function") {
                            cb()
                        }
                    })
                )
            )
        }
    },

    registerCallback: function (key, cb) {
        // body...
        if (!this._checkString(key)) {
            return
        }

        if (typeof this._callbacks[key] === "undefined") {
            this._callbacks[key] = []
        }

        // add cb
        this._callbacks[key].push(cb)
    },

    unregisterCallback: function (key, cb) {
        // body...
        if (!this._checkString(key)) {
            return
        }

        if (typeof this._callbacks[key] !== "undefined") {
            if (!cb) {
                this._callbacks[key] = []
            }
            else {
                let cbs = this._callbacks[key]

                let targetIndex = cbs.indexOf(cb)
                if (targetIndex > -1) {
                    cbs.splice(targetIndex, 1)
                }
            }
        }
    },

    invokeCallback: function (key) {
        // body...
        if (!this._checkString(key)) {
            return
        }

        if (typeof this._callbacks[key] !== "undefined") {
            let cbs = [].concat(this._callbacks[key])

            // arguments
            let args = Array.prototype.slice.call(arguments)
            args.shift()

            // callback
            for (let i = 0; i < cbs.length; i++) {
                let cb = cbs[i]
                cb.apply(null, args)
            }
        }
    },

    _checkString: function (string) {
        // body...
        if (typeof string !== "string" || string === "") {
            return false
        }

        return true
    }
});

// export
module.exports = cls