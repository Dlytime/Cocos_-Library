import { constants } from "buffer"

/*
* 自动缩放
* 
*/
cc.Class({
    extends: cc.Component,

    properties: {
        miniScale: {
            default: 1.0,
            tooltip: "最小缩放比",
            type: cc.Float
        },
        maxScale: {
            default: 1.1,
            tooltip: "最大缩放比",
            type: cc.Float
        },
        duration: {
            default: 0.8,
            tooltip: "缩放耗时（秒)",
            type: cc.Float
        },

        _action: null
    },

    onLoad() {
        let doScale = null
        doScale = () => {
            if (this.node) {
                if (this.node.scaleX < this.maxScale) {
                    this._scaleToMax(doScale)
                }
                else {
                    this._scaleToMini(doScale)
                }
            }
        }

        // start
        doScale()
    },

    _scaleToMini( cb ) {
        // clear
        this._clearTween()

        if (this.node && this.node.scaleX > this.miniScale) {
            let realDuation = (this.node.scaleX - this.miniScale) / (this.maxScale - this.miniScale) * this.duration

            // tween
            this._action = this.node.runAction(cc.sequence(
                cc.scaleTo(realDuation, this.miniScale),
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

    _scaleToMax( cb ) {
        // clear
        this._clearTween()

        if (this.node && this.node.scaleX < this.maxScale) {
            let realDuation = (this.maxScale - this.node.scaleX) / (this.maxScale - this.miniScale) * this.duration

            // tween
            this._action = this.node.runAction(cc.sequence(
                cc.scaleTo(realDuation, this.maxScale),
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