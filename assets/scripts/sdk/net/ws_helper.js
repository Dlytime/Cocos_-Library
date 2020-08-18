var Msg = require("msg")
var WS = require("web_socket")

/*
* websocket网络访问
* 只能通过send发送proto数据
*/
var __WSHelper = cc.Class({
	extends: cc.Component,

	// properties
	properties: {
		_eventMap: {
			default: {},
			visible: false
		},
		_connect: undefined,
		_tryConnectTimes: 0,
		_unSendMsgInfos: {
			default: [],
			visible: false
		},
		_sentMsgInfos: {
			default: [],
			visible: false
		},
		_resendMsgInfos: {
			default: [],
			visible: false
		},
	},

	// methods
	registerAll: function (list) {
		// body...
		for (var i = 0; i < list.length; i++) {
			this.register(list[i].cmdID, list[i].reqClassName, list[i].rspClassName)
		}
	},

	register: function (_cmdID, _reqClassName, _rspClassName) {
		// body...
		this._eventMap[_cmdID] = {
			cmdID: _cmdID,
			reqClassName: _reqClassName,
			rspClassName: _rspClassName,
		}

		this._schedule()
	},

	send: function (cmdID, content, cb, errCb) {
		// body...
		let msgInfo = this._makeMsgInfo(cmdID, content, cb, errCb)

		// add into
		this._addIntoUnsendList(msgInfo)

		// connect if not connect
		if (typeof this._connect === "undefined") {
			this._doConnect()
		}
	},

	_doSend: function (msgInfo) {
		// body...
		if (this._canRetainIntoSentList(msgInfo.cmdID)) {
			let reqBuf = this._makeReqBuf(msgInfo.cmdID, msgInfo.content)

			if (typeof reqBuf !== "undefined") {
				let sendMsg = Msg.create(msgInfo.cmdID, reqBuf)

				if (typeof sendMsg !== "undefined") {
					// send
					this._connect.send(sendMsg.encode())

					// retain
					this._retainIntoSentList(msgInfo)

					return
				}
			}
		}

		msgInfo.doErrCallback()
	},

	_isReadyToSend: function () {
		// body...
		if (typeof this._connect !== "undefined" && this._connect.isConnected()) {
			return true
		}

		return false
	},

	_doConnect: function () {
		// body...
		var self = this

		// connect
		this._connect = new WS()
		this._connect.connect(G_SDKCfg.getNetAddr())

		// add connect times
		this._addTryConnectTimes()

		// cbs
		this._connect.onConnectOpen = function () {
			// body...
			console.log("Is Ready To Send...")

			// reset connect times
			self._resetTryConnectTimes()
		}

		this._connect.onConnectClose = function () {
			self._connect = undefined

			// reconnect
			if (self._sentMsgInfos.length > 0) {
				// release all
				self._releaseAllFromSendList()

				for (let i = self._sentMsgInfos.length - 1; i >= 0; i--) {
					let msgInfo = self._sentMsgInfos[i]

					if (msgInfo.sendCount >= G_SDKCfg.getNetCfgs().max_try_send_times) {
						self._sentMsgInfos.splice(i, 1)

						// err cb
						msgInfo.doErrCallback()
					}
					else {
						self._resendMsgInfos.push(msgInfo)
					}
				}
			}

			if (self._tryConnectTimes < G_SDKCfg.getNetCfgs().max_connect_times) {
				self._doConnect()
			}
			else {
				if (self._unSendMsgInfos.length > 0) {
					for (let i = 0; i < self._unSendMsgInfos.length; i++) {
						let msgInfo = self._unSendMsgInfos[i]
						msgInfo.doErrCallback()
					}

					self._unSendMsgInfos.splice(0, self._unSendMsgInfos.length)
				}
				
				if (self._resendMsgInfos.length > 0) {
					for (let i = 0; i < self._resendMsgInfos.length; i++) {
						let msgInfo = self._resendMsgInfos[i]
						msgInfo.doErrCallback()
					}

					self._resendMsgInfos.splice(0, self._resendMsgInfos.length)
				}
			}
		}

		this._connect.onConnectError = function () {
			// resend
			if (self._sentMsgInfos.length > 0) {
				// release all
				self._releaseAllFromSendList()

				for (let i = self._sentMsgInfos.length - 1; i >= 0; i--) {
					let msgInfo = self._sentMsgInfos[i]

					if (msgInfo.sendCount >= G_SDKCfg.getNetCfgs().max_try_send_times) {
						self._sentMsgInfos.splice(i, 1)

						// err cb
						msgInfo.doErrCallback()
					}
					else {
						self._doSend(msgInfo)
					}
				}
			}
		}

		this._connect.onGotMessage = function (data) {
			if (self._sentMsgInfos.length > 0) {
				let recvMsg = Msg.decode(data)

				if (typeof recvMsg !== "undefined") {
					let msgInfo = self._getFromSentList(recvMsg.getCmdID())

					let rspMsg = self._makeRspMsg(recvMsg.getCmdID(), recvMsg.getMsg())
					if (typeof rspMsg !== "undefined") {
						msgInfo.doCallback(rspMsg.toJSON())
					}
					else {
						msgInfo.doErrCallback()
					}
					
					// remove
					self._removeFromSentList(recvMsg.getCmdID())
				}
			}
			
		}
	},

	_makeMsgInfo: function (_cmdID, _content, _cb, _errCb) {
		// body...
		if (typeof _cb !== "undefined" && typeof _cb !== "function") {
			_cb = undefined
			console.log("Can Not Support Callback Of CmdID: {0}".format(_cmdID.toString()))
		}

		if (typeof _errCb !== "undefined" && typeof _errCb !== "function") {
			_errCb = undefined
			console.log("Can Not Support Error Callback Of CmdID: {0}".format(_cmdID.toString()))
		}

		return {
			cmdID: _cmdID,
			content: _content,
			cb: _cb,
			errCb: _errCb,
			sendCount: 0,
			isSending: false,

			doCallback: function () {
				// body...
				if (typeof this.cb === "function") {
					let args = Array.prototype.slice.call(arguments)
					this.cb.apply(null, args)
				}
			},

			doErrCallback: function () {
				// body...
				if (typeof this.errCb === "function") {
					let args = Array.prototype.slice.call(arguments)
					this.errCb.apply(null, args)
				}
			},

			markSendState: function () {
				// body...
				this.sendCount += 1
				this.isSending = true
			},

			markUnsendState: function () {
				// body...
				this.isSending = false
			}
		}
	},

	_makeReqMsg: function (cmdID, content) {
		// body...
		if (this._eventMap.hasOwnProperty(cmdID)) {
			let class_name = this._eventMap[cmdID].reqClassName

			if (class_name !== "" && db.hasOwnProperty(class_name)) {
				return db[class_name].create(content)
			}
		}

		return undefined
	},

	_makeReqBuf: function (cmdID, content) {
		// body...
		let reqMsg = this._makeReqMsg(cmdID, content)

		if (typeof reqMsg !== "undefined") {
			let class_name = this._eventMap[cmdID].reqClassName

			// encode
			return db[class_name].encode(reqMsg).finish()
		}
	},

	_makeRspMsg: function (cmdID, buffer) {
		// body...
		if (this._eventMap.hasOwnProperty(cmdID)) {
			let class_name = this._eventMap[cmdID].rspClassName

			if (class_name !== "" && db.hasOwnProperty(class_name)) {
				// decode
				return db[class_name].decode(buffer)
			}
		}

		return undefined
	},

	_addIntoUnsendList: function (msgInfo) {
		// body...
		if (typeof msgInfo === "undefined") {
			return
		}

		this._unSendMsgInfos.push(msgInfo)

		// schedule if not
		this._schedule()
	},

	_getFromUnsendList: function ( bPop ) {
		// body...
		let msgInfo = undefined

		if (this._unSendMsgInfos.length > 0) {
			msgInfo = this._unSendMsgInfos[0]

			// pop
			if (bPop) {
				this._unSendMsgInfos.splice(0, 1)
			}
		}

		if (this._unSendMsgInfos.length == 0) {
			// unschedule
			this._unschedule()
		}

		return msgInfo
	},

	_retainIntoSentList: function (msgInfo) {
		// body...
		let _msgInfo = this._getFromSentList(msgInfo.cmdID)

		if (typeof _msgInfo === "undefined") {
			this._sentMsgInfos.push(msgInfo)
			_msgInfo = msgInfo
		}

		// send state(retain)
		_msgInfo.markSendState()
	},

	_releaseAllFromSendList: function () {
		// body...
		for (let i = 0; i < this._sentMsgInfos.length; i++) {
			// unsend state(release)
			this._sentMsgInfos[i].markUnsendState()
		}
	},

	_removeFromSentList: function (cmdID) {
		// body...
		for (let i = 0; i < this._sentMsgInfos.length; i++) {
			if (this._sentMsgInfos[i].cmdID === cmdID) {
				// unsend state
				this._sentMsgInfos[i].markUnsendState()

				this._sentMsgInfos.splice(i, 1)
			}
		}
	},

	_canRetainIntoSentList: function (cmdID) {
		// body...
		return (this._getRetainCountIntoSendList(cmdID) < G_SDKCfg.getNetCfgs().max_try_send_times)
	},

	_getRetainCountIntoSendList: function (cmdID) {
		// body...
		let _msgInfo = this._getFromSentList(cmdID)

		if (typeof _msgInfo !== "undefined") {
			return _msgInfo.sendCount
		}

		return 0
	},

	_getFromSentList: function (cmdID) {
		// body...
		for (let i = 0; i < this._sentMsgInfos.length; i++) {
			if (this._sentMsgInfos[i].cmdID === cmdID) {
				return this._sentMsgInfos[i]
			}
		}

		return undefined
	},

	_update: function () {
		// body...
		if (this._isReadyToSend()) {
			// resent msgs if exist
			if (this._resendMsgInfos.length > 0) {
				for (let i = 0; i < this._resendMsgInfos.length; i++) {
					this._doSend(this._resendMsgInfos[i])
				}

				this._resendMsgInfos.splice(0, this._resendMsgInfos.length)
			}

			let msgInfo = this._getFromUnsendList()

			if (typeof msgInfo !== "undefined") {
				if (this._getRetainCountIntoSendList(msgInfo.cmdID) === 0) {
					// pop
					this._getFromUnsendList(true)

					// send
					this._doSend(msgInfo)
				}
			}
		}
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

	_addTryConnectTimes: function () {
		// body...
		this._tryConnectTimes += 1

		// schedule
		this._scheduleConnectTimeout()
	},

	_resetTryConnectTimes: function () {
		// body...
		this._tryConnectTimes = 0

		// schedule
		this._unscheduleConnectTimeout()
	},

	_connectTimeout: function () {
		// body...
		this._unscheduleConnectTimeout()

		// must call on next frame
		var self = this
		let scheduler = cc.director.getScheduler()
		scheduler.schedule(function () {
			// body...
			if (typeof self._connect !== "undefined") {
				self._connect.close()
			}
		}, this, 0, 0, 0, false);
	},

	_scheduleConnectTimeout: function () {
		// body...
		this._unscheduleConnectTimeout()

		let scheduler = cc.director.getScheduler()
		scheduler.schedule(this._connectTimeout, this, G_SDKCfg.getNetCfgs().timeout_of_connect, 0, 0, false);
	},

	_unscheduleConnectTimeout: function () {
		// body...
		let scheduler = cc.director.getScheduler()
		scheduler.unschedule(this._connectTimeout, this)
	},
})

var _WSHelper = function() {
	var _instance;

	function init() {
		// body ...
		console.log("Init G_WSHelper Instance...")

		return (new __WSHelper())
	}

	return {
		getInstance: function () {
			if ( !_instance ) {
				_instance = init();
			}

			return _instance;
		}
	};
}();

// export
module.exports = _WSHelper