var cls = cc.Class({
    extends: cc.Component,

    properties: {
        _callbacks: {
            default: {},
            visible: false
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