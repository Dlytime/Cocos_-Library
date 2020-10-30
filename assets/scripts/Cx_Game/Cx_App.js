/**游戏入口模块的统一加载 */
/* let _log = console.log;
console.log = function () {
   let bool = true;
   if (bool) {
      _log.apply(null, arguments);
   }
}; */
cc.Class({
    extends: cc.Component,

    onLoad () {
        window.cx_AudioMgr = require("AudioMgr");
        window.cx_LoaderMgr = require("LoaderMgr");
        window.cx_QyMgr = require("QyMgr");
        window.cx_UIMgr = require("UIMgr");
        window.cx_jsTools = require("jsTools");
        window.cx_ccTools = require("ccTools");
        window.cx_AdvMgr = require("AdvMgr");
        window.cx_ResolutionMgr = require("ResolutionMgr");
        window.cx_QyDlgMgr = require("DlgMgr");
        window.cx_DyData = require("DyData");
        window.cx_DyDataMgr = require("DyDataMgr");
        window.cx_TimeMgr = require("TimeMgr");
        window.cx_EventMgr = require("EventMgr");
    },

    start () {

    },

    update (dt) {
        cx_TimeMgr.update(dt);
    },
});
