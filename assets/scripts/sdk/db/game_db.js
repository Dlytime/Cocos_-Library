var _GameDB = (function () {
	var _instance;
	var _db;
	
	function init() {
		// body...
		console.log('Init G_GameDB Instance...');

		var _loaded = false;
		var _onLoadCbs = [];
		var _dbs = {};
		var _configs = null;

		var _load = function () {
			cc.loader.loadResDir('conf/db', function(err, assets, urls) {
				for (let i = 0; i < assets.length; i++) {
	
					let class_name = assets[i].name
					let content_str = assets[i].text
	
					// save
					if (class_name != '' && content_str != '' && _db[class_name]) {
						let serialize_btyes = G_Utils.HexString2Uint8Array(content_str)
						let conf = new _db[class_name].decode(serialize_btyes)
	
						if (conf) {
							_dbs[class_name] = conf
						}
					}
				}
	
				// mark loaded
				_loaded = true;
	
				for (let j = 0; j < _onLoadCbs.length; j++) {
					_onLoadCbs[j]()
				}
	
				_onLoadCbs = []
			})
		}

		return {
			isLoaded: function () {
				// body...
				return _loaded
			},

			load( db ) {
				_db = db

				// global
				window.db = db
				window.BaseConfigIDs = db.BaseConfigIDs
				window.UIWordIDs = db.UIWordIDs

				// start load
				_load()
			},

			registerAll: function (configs) {
				// body...
				if (configs) {
					_configs = configs

					for (let i = 0; i < _configs.length; i++) {
						let info = _configs[i]
						if (info && typeof info.key !== "undefined") {
							if (info.getFunc === true) {
								let funcName = "get" + info.key + "ByID"
								this[funcName] = function ( id ) {
									// body...
									return this.getConfigByID("TB" + info.key, id)
								}.bind(this)
							}

							if (info.getAllFunc === true) {
								let funcName = "getAll" + info.key + "s"
								this[funcName] = function () {
									// body...
									let cfgs = this.getConfigs("TB" + info.key)

									if (cfgs) {
										return cfgs.list
									}
									else {
										return []
									}
								}.bind(this)
							}

							if (info.getCountFunc === true) {
								let funcName = "getAll" + info.key + "Count"
								this[funcName] = function () {
									// body...
									let cfgs = this.getConfigs("TB" + info.key)

									if (cfgs) {
										return cfgs.list.length
									}
									else {
										return 0
									}
								}.bind(this)
							}
						}
					}
				}
			},

			// register load finished callback
			onLoad: function ( loadCb ) {
				// body...
				if (loadCb != null && "function" == typeof loadCb) {
					if (this.isLoaded()) {
						loadCb()
					}
					else {
						_onLoadCbs[_onLoadCbs.length] = loadCb
					}
				}
			},

			addDB: function ( cls_name, cfg ) {
				// body...
				if (cfg) {
					var conf_list = this.getConfigs("TB" + cls_name)

					if (typeof conf_list === "undefined") {
						_dbs["TB" + cls_name] = new hcddw["TB" + cls_name]
						conf_list = _dbs["TB" + cls_name]
					}

					if (conf_list) {
						var list = conf_list.list
						list.push(cfg)
					}
				}
			},

			replaceDB: function ( cls_name, id, cfg ) {
				// body...
				if (cfg) {
					var conf_list = this.getConfigs("TB" + cls_name)

					if (conf_list) {
						var list = conf_list.list

						for (var i = 0; i < list.length; i++) {
							var conf = list[i]
	
							if (conf && conf.id === id) {
								list[i] = cfg
							}
						}
					}
				}
			},

			// 打印指定的DB数据，只在windows端可用
			printDB: function ( cls_name ) {
				if (!G_PlatHelper.getPlat()) {
					var conf_list = this.getConfigs("TB" + cls_name)

					if (conf_list) {
						let serialize_btyes = conf_list.constructor.encode(conf_list).finish()
						let serialize_text = G_Utils.Uint8Array2HexString(serialize_btyes)
						
						console.log(serialize_text)
					}
				}
			},

			getConfigByID: function ( cls_name, id ) {
				// body...
				var conf_list = this.getConfigs(cls_name)

				if (conf_list) {
					var list = conf_list.list

					for (var i = 0; i < list.length; i++) {
						var conf = list[i]

						if (conf && conf.id === id) {
							return conf
						}
					}
				}

				return null
			},

			getConfigs: function ( cls_name ) {
				// body...
				if (cls_name == null || cls_name == '') {
					return null
				}

				if (!this.isLoaded()) {
					return null
				}
				else {
					return _dbs[cls_name]
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
module.exports = _GameDB