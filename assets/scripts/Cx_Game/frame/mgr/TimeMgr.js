var TimeMgr = cc.Class({
    extends: cc.Component,

    ctor:function() {
        this._stObj = [];
    },
    init(GameRoom) {
        this.GameRoom = GameRoom;
    },

    initTime(st,tag,cb) {
        this[tag] = st;
        this._stObj[tag] = {"st":st,"cb":cb};
    },
    /**延迟Dt秒执行 */
    delayFunc(dt,cb,mManager,params) {
        this.GameRoom.scheduleOnce(function(){
            cb.apply(mManager,params);
        },dt);
    },
    update(dt) {
        let object = this._stObj;
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                const info = object[key];
                info.st = info.st - dt;
                if(info.st <= 0) {
                    if(typeof info.cb == "function") {
                        info.cb();
                        delete this._stObj[key];
                    }
                }
            }
        }
    },
});
let _instance = null;
let getInstance = function() {
    if(_instance) {
        return _instance;
    } else {
        _instance = new TimeMgr();
        return _instance;
    }
};
module.exports = getInstance();