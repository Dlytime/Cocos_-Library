/*
* 自动摇摆
* 
*/
cc.Class({
    extends: cc.Component,

    properties: {
        gap: {
            default: 3.0,
            tooltip: "缩放耗时（秒）",
            type: cc.Float
        },

        _action: null,
        _shakeTimes: 0
    },

    onLoad() {
        let doShake = null
        doShake = () => {
            if (this.node) {
                if (this._shakeTimes > 0 && this._shakeTimes % 3 === 0) {
                    this._shakeTimes = 0
                    this._shakeToMiddle(() => {
                        G_Scheduler.schedule("auto_shake_" + G_Utils.generateString(32), doShake, this.gap, 0)
                    })
                }
                else {
                    if (this.node.angle > -15) {
                        this._shakeTimes += 1
                        this._shakeToRight(doShake)
                    }
                    else {
                        this._shakeTimes += 1
                        this._shakeToLeft(doShake)
                    }
                }
            }
        }

        // start
        doShake()
    },

    _shakeToLeft( cb ) {
        // clear
        this._clearTween()

        if (this.node && this.node.angle < 15) {
            let realDuation = (15 - this.node.angle) / 30 * 0.05

            // tween
            this._action = this.node.runAction(cc.sequence(
                cc.rotateTo(realDuation, 15),
                cc.callFunc(() => {
                    this._action = null

                    if (typeof cb === "function") {
                        cb()
                    }
                })
            ))
        }
        else {
            if (typeof cb === "function") {
                cb()
            }
        }
    },

    _shakeToRight( cb ) {
        // clear
        this._clearTween()

        if (this.node && this.node.angle > -15) {
            let realDuation = (this.node.angle + 15) / 30 * 0.05

            // tween
            this._action = this.node.runAction(cc.sequence(
                cc.rotateTo(realDuation, -15),
                cc.callFunc(() => {
                    this._action = null

                    if (typeof cb === "function") {
                        cb()
                    }
                })
            ))
        }
        else {
            if (typeof cb === "function") {
                cb()
            }
        }
    },

    _shakeToMiddle( cb ) {
        // clear
        this._clearTween()

        if (this.node && this.node.angle != 0) {
            let realDuation = Math.abs(this.node.angle) / 30 * 0.05

            // tween
            this._action = this.node.runAction(cc.sequence(
                cc.rotateTo(realDuation, 0),
                cc.callFunc(() => {
                    this._action = null

                    if (typeof cb === "function") {
                        cb()
                    }
                })
            ))
        }
        else {
            if (typeof cb === "function") {
                cb()
            }
        }
    },

    _clearTween() {
        if (this.node && this._action !== null) {
            this.node.stopAction(this._action)
            this._action = null
        }
    }
})