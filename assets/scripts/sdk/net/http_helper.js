/**
 * http网络访问
 * Support send/get json/proto data from target url via https...
 *
 */
var __HttpHelper = cc.Class({
	extends: cc.Component,

	// properties
	properties: {
		_getServerTimeFunc: {
			default: null,
			visible: false
		}
	},

	registerGetServerTimeFunc: function ( func ) {
		// body...
		if (typeof func === "function") {
			this._getServerTimeFunc = func
		}
	},

	_getServerTime: function () {
		// body...
		if (this._getServerTimeFunc) {
			return this._getServerTimeFunc()
		}
		else {
			return Math.round(new Date() / 1000)
		}
	},

	/**
	 * 创建获取Json数据请求
	 * @param {String} url 请求地址
	 * @param {Function} cb 回调函数
	 */
	getJson: function (url, cb) {
		// body...
		this._doJsonRequest('GET', url, null, null, cb)
	},

	/**
	 * 创建发送Json数据请求
	 * @param {String} url 请求地址
	 * @param {Object} header 头部数据
	 * @param {Object} jsonData 数据对象
	 * @param {Function} cb 回调函数
	 */
	sendJson: function (url, header, jsonData, cb) {
		// body...
		this._doJsonRequest('POST', url, header, jsonData, cb)
	},

	/**
	 * 创建发送Form数据请求
	 * @param {String} url 请求地址
	 * @param {Object} header 头部数据
	 * @param {Object} objData 数据对象
	 * @param {Function} cb 回调函数
	 */
	sendForm: function (url, header, objData, cb) {
		// body...
		this._doFormRequest('POST', url, header, objData, cb)
	},

	_doJsonRequest: function (way, url, header, jsonData, cb) {
		// body...
		let request = this._createRequest(way, url, cb)

		try {
	        if (jsonData) {
				// header
				request.setRequestHeader('content-type', 'application/json')
				if (typeof header === "object") {
					for (let key in header) {
						request.setRequestHeader(key, header[key])
					}
				}

				// send
				request.send(JSON.stringify(jsonData))
			}
			else {
				// send
				request.send(null)
			}
	    }
	    catch (e) {
	    	console.error(e)

	    	if (typeof cb === "function") {
	    		cb(false, '未知错误')
	    	}
	    }
	},

	_doFormRequest: function (way, url, header, objData, cb) {
		// body...
		let request = this._createRequest(way, url, cb)

		try {
	        if (objData) {
				// header
				request.setRequestHeader('content-type', 'application/x-www-form-urlencoded')
				if (typeof header === "object") {
					for (let key in header) {
						request.setRequestHeader(key, header[key])
					}
				}

				let urlEncodedData = null
				let urlEncodedDataPairs = []

				for (let key in objData) {
					urlEncodedDataPairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(objData[key]))
				}

				if (urlEncodedDataPairs.length > 0) {
					// 将配对合并为单个字符串，并将所有%编码的空格替换为
					// “+”字符；匹配浏览器表单提交的行为。
					urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+')
				}

				// send
				request.send(urlEncodedData)
			}
			else {
				// send
				request.send(null)
			}
	    }
	    catch (e) {
	    	console.error(e)

	    	if (typeof cb === "function") {
	    		cb(false, '未知错误')
	    	}
	    }
	},

	_createRequest: function (way, url, cb) {
		// body...
		var self = this

		let request = this._createBaseRequest(way, url, function (rspData, rspDataType) {
			// body...
			if (typeof cb === "function") {
				if (typeof rspData === "undefined") {
					cb(false, '返回数据格式错误')
				}
				else {
					if (rspDataType === "json") {
						cb(true, JSON.parse(rspData))
					}
					else {
						cb(false, '返回数据解析错误')
					}
				}
			}
		})

		return request
	},

	/**
	 * 创建发送Proto数据请求
	 * @param {String} url 请求地址
	 * @param {Object} header 头部数据
	 * @param {Object} protoData proto数据对象
	 * @param {Function} cb 回调函数
	 */
	sendProto: function (url, header, protoData, cb) {
		// body...
		if (typeof protoData !== "undefined" && typeof protoData.constructor !== "undefined") {
			let request = this._createProtoDataRequest('POST', url, cb)

			if (typeof request !== "undefined") {
				// header
				request.setRequestHeader('content-type', 'application/json')
				if (typeof header === "object") {
					for (let key in header) {
						request.setRequestHeader(key, header[key])
					}
				}

				let send_obj = new Object();
				let serialize_btyes = protoData.constructor.encode(protoData).finish()
				let serialize_text = G_Utils.Uint8Array2HexString(serialize_btyes)
				send_obj['data'] = serialize_text

				try {
					// send
					request.send(JSON.stringify(send_obj))
				}
				catch (e) {
					console.error(e)

			    	if (typeof cb === "function") {
			    		cb(false, '请求数据错误')
			    	}
				}
			}
			else {
				if (typeof cb === "function") {
					cb(false, '未知错误')
				}
			}
		}
	},

	/**
	 * 创建获取proto数据请求
	 * @param {String} url 请求地址
	 * @param {Function} cb 回调函数
	 */
	getProto: function (url, cb) {
		// body...
		let request = this._createProtoDataRequest('GET', url, cb)

		if (typeof request !== "undefined") {
			try {
				// send
				request.send(null)
			}
			catch (e) {
				console.error(e)

		    	if (typeof cb === "function") {
		    		cb(false, '请求数据错误')
		    	}
			}
		}
		else {
			if (typeof cb === "function") {
				cb(false, '未知错误')
			}
		}
	},

	_createProtoDataRequest: function (way, url, cb) {
		// body...
		var self = this

		let request = this._createBaseRequest(way, url, function (rspData, rspDataType) {
			// body...
			if (typeof cb === "function") {
				if (typeof rspData === "undefined") {
					cb(false, '未知错误')
				}
				else {
					if (rspDataType === "json") {
						self._checkProtoResponse(JSON.parse(rspData), function (bSucc, errMsgOrProtoData) {
							// body...
							if (bSucc) {
								let protoData = errMsgOrProtoData
								cb(true, protoData)
							}
							else {
								let errMsg = errMsgOrProtoData
								cb(false, errMsg)
							}
						})
					}
					else {
						cb(false, '返回数据格式错误')
					}
				}
			}
		})

		return request
	},

	_createBaseRequest: function (way, url, cb) {
		// body...
		if (way !== "GET" && way !== "POST") {
			console.error("Http Err: Only Support GET or POST Way of Request, Way: {0}".format(way))
			return undefined
		}

		if (typeof url === "undefined" || url === "") {
			console.error("Http Err: url Is Not Right, Url: {0}".format(url))
			return undefined
		}

		var request = cc.loader.getXMLHttpRequest();
		if (url.indexOf('?') == -1) {
			url = "{0}?timestamp={1}".format(url, this._getServerTime().toString())
		}
		request.open(way, url, true)

		// print...
		console.log("req url: {0}".format(url))

		// set succ cb
		request.onload = function () {
			// body...
			if (typeof cb === "function") {
				if (request.readyState === 4) {
					if (request.status >= 200 && request.status < 300) {
						if (request.getResponseHeader('content-type') === 'arraybuffer') {
							cb(request.response, "arraybuffer")
						}
						else if (request.getResponseHeader('content-type') === 'application/json') {
							cb(request.responseText, "json")
						}
						else {
							let bChecked = false

							try {
								JSON.parse(request.responseText)
								bChecked = true
								cb(request.responseText, "json")
							}
							catch (e) {
								console.error(e)
								
								if (!bChecked) {
									cb(request.responseText, "text")
								}
							}
						}
					}
					else {
						cb()
					}
				}
				else {
					cb()
				}
			}
		}

		// set timeout and cb
		request.timeout = G_SDKCfg.getHttpsCfgs().timeout_of_request
		request.ontimeout = function (e) {
			// body...
			if (typeof cb === "function") {
				cb()
			}
		}

		request.onerror = function(e) {
			console.error(e)

			if (typeof cb === "function") {
	        	cb()
	        }
	    }

		return request
	},

	_checkProtoResponse: function (jsonData, cb) {
		// body...
		if (typeof cb === "function") {
			if (typeof jsonData.data !== "undefined") {
				let serialize_text = jsonData.data
				let serialize_btyes = G_Utils.HexString2Uint8Array(serialize_text)
				let protoData = new db["ResponseClient"].decode(serialize_btyes)

				if (protoData.ret == 1) {
					cb(true, protoData)
				}
				else {
					cb(false, G_GameDB.getNetErrorByID(protoData.ret).word)
				}
			}
			else {
				cb(false, "返回数据格式错误")
			}
		}
	},
})

var _HttpHelper = (function () {
	var _instance;

	function init() {
		// body...
		console.log('Init G_HttpHelper Instance...')

		// create and return
		return (new __HttpHelper())
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
module.exports = _HttpHelper