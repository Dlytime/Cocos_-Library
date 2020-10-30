// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: require("prefab_base"),

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    init:function(mManager) {
        this.mManager = mManager;
        this.openCloseEmit();
    },
    openCloseEmit() {
        this._closeEmit = false;
    },
    closeCloseEmit() {
        this._closeEmit = true;
    },
    setCloseCb(cb) {
        this._closeCb = cb;
    },
    share:function() {
        cx_QyMgr.share();
    },
    emitGameRoom:function(order,paramObj) {
        let node = cc.director.getScene().getChildByName("Canvas");
        node.emit(order||"updateCounts",paramObj||{});
    },
    noticeGameRoom(order) {
        if(!order) return;
        let node = cc.director.getScene().getChildByName("Canvas");
        node.emit("noticeGameRoom",{"status":order});
    },
    updateCounts:function() {
        this.emitGameRoom("updateCounts");
    },
    close(info) {
        if(this.mManager && !this._closeEmit) 
        {
            if(this.mManager.node instanceof cc.Node) {
                this.mManager.node.emit(this.node.name+"Closed",{info:info});
            } 
            else if(typeof this.mManager.dlgClosed == "function") {
                this.mManager.dlgClosed(this.node.name,info);
            }
        }

        if(typeof this._closeCb == "function") {
            this._closeCb();
            this._closeCb = false;
        }
        cx_UIMgr.putNode(this.node);
    },
    start () {

    },

    // update (dt) {},
});