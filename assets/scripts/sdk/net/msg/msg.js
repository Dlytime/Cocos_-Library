/*
* 协议消息
* 
*/

// const
var SIZE_OF_MSG_HEAD = 6
var MAX_SIZE_OF_MSG_BODY = 0xFFFF - SIZE_OF_MSG_HEAD
var FLAG_OF_MSG_HEAD = 0x66DD
var MASK = 256
var MAX_OF_CMD_ID = 0xFFFF

var MsgHead = cc.Class({
	// properties
	_cmdID: 0,
	_msgLen: 0,

	// methods
	init: function (cmdID, len) {
		// body...
		if (this._setCmdID(cmdID) && this._setBodyLen(len)) {
			return true
		}
		
		return false
	},

	getCmdID: function () {
		// body...
		return this._cmdID
	},

	encode: function () {
		// body...
		let bytes = []

		// flag
		bytes.push(Math.floor(FLAG_OF_MSG_HEAD / MASK))
		bytes.push(FLAG_OF_MSG_HEAD % MASK)

		// cmdID
		bytes.push(Math.floor(this._cmdID / MASK))
		bytes.push(this._cmdID % MASK)

		// len
		bytes.push(Math.floor(this._msgLen / MASK))
		bytes.push(this._msgLen % MASK)

		return bytes
	},

	// @return succ or fail
	_setCmdID: function (cmdID) {
		// body...
		if (cmdID >= 0 && cmdID <= MAX_OF_CMD_ID) {
			this._cmdID = cmdID
			return true
		}
		else {
			return false
		}
	},

	// @return succ or fail
	_setBodyLen: function (len) {
		// body...
		if (len >= 0 && len <= MAX_SIZE_OF_MSG_BODY) {
			this._msgLen = len
			return true
		}
		else {
			return false
		}
	},
})

MsgHead.create = function (cmdID, len) {
	// body...
	let head = new MsgHead()

	if (head.init(cmdID, len)) {
		return head
	}

	return undefined
}

MsgHead.decode = function (bytes) {
	// body...
	if (typeof bytes !== "undefined" && bytes.byteLength >= SIZE_OF_MSG_HEAD) {
		let headBytes = new Uint8Array(bytes, 0, SIZE_OF_MSG_HEAD)

		if (headBytes[0] * MASK + headBytes[1] === FLAG_OF_MSG_HEAD) {
			let cmdID = headBytes[2] * MASK + headBytes[3]
			let len = headBytes[4] * MASK + headBytes[5]

			return MsgHead.create(cmdID, len)
		}
	}

	return undefined
}

var Msg = cc.Class({
	// properties
	_head: undefined,
	_msg: undefined,

	// methods
	init: function (cmdID, msg) {
		// body...
		if (msg !== undefined) {
			this._head = MsgHead.create(cmdID, msg.length)

			if (this._head !== undefined) {
				this._msg = msg

				return true
			}
		}

		return false
	},

	setHead: function (head) {
		// body...
		this._head = head
	},

	setMsg: function (msg) {
		// body...
		this._msg = msg
	},

	getCmdID: function () {
		// body...
		if (this._head != undefined) {
			return this._head.getCmdID()
		}

		return 0
	},

	getMsg: function () {
		// body...
		return this._msg
	},

	encode: function () {
		// body...
		let bytes = this._head.encode()

		// push back
		for (let i = 0; i < this._msg.length; i++) {
			bytes.push(this._msg[i])
		}

		return new Uint8Array(bytes).buffer
	},
})

Msg.create = function (cmdID, body) {
	// body...
	let msg = new Msg()

	if (msg.init(cmdID, body)) {
		return msg
	}

	return undefined
}

Msg.decode = function (bytes) {
	// body...
	let head = MsgHead.decode(bytes)

	if (typeof head !== "undefined") {
		let body = new Uint8Array(bytes, SIZE_OF_MSG_HEAD)

		return Msg.create(head.getCmdID(), body)
	}

	return undefined
}

module.exports = Msg;