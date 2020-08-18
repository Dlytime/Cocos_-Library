var UIManager = cc.Class({
    extends: cc.Component,

    ctor:function() {
        this._prefabs = {};
        this._nodepools = {};
    },
    init:function(GameRoom) {
        this.GameRoom = GameRoom;
    },
    //废弃
    getPreInstance:function(prefab,classname) {
        let jsname = classname || prefab.name;
        if(this._prefabs[jsname] === undefined || this._prefabs[jsname] === null)
        {
            this.registerPrefab(prefab,jsname);
        }
        let node = this._getPreNode(jsname);
        if(node === null) cc.error(jsname + "not found");
        let nodejs = node.getComponent(jsname);
        if(node && !nodejs) return node;
        return nodejs;

    },
    getNodeJs:function(prefab,classname) {
        let jsname = classname || prefab.name;
        if(this._prefabs[jsname] === undefined || this._prefabs[jsname] === null)
        {
            this.registerPrefab(prefab,jsname);
        }
        let node = this._getPreNode(jsname);
        if(node === null) cc.error(jsname + "not found");
        let nodejs = node.getComponent(jsname);
        if(node && !nodejs) return node;
        return nodejs;
    },
    getNode:function(prefab,classname) {
        let jsname = classname || prefab.name;
        if(this._prefabs[jsname] === undefined || this._prefabs[jsname] === null)
        {
            this.registerPrefab(prefab,jsname);
        }
        let node = this._getPreNode(jsname);
        if(node === null) cc.error(jsname + "not found");
        if(node ) return node;
    },
    getPreNodeJs:function(name,classname) {
        let jsname = classname || name;
        if(this._prefabs[jsname] === undefined || this._prefabs[jsname] === null)
        {
            let prefab = cx_DyDataMgr.getPrefab(name); 
            this.registerPrefab(prefab,jsname);
        }
        let node = this._getPreNode(jsname);
        if(node === null) cc.error(jsname + "not found");
        let nodejs = node.getComponent(jsname);
        if(node && !nodejs) return node;
        return nodejs;
    },
    getPreNode:function(name,classname) {
        let jsname = name;
        if(this._prefabs[jsname] === undefined || this._prefabs[jsname] === null)
        {
            let prefab = cx_DyDataMgr.getPrefab(name); 
            this.registerPrefab(prefab,jsname);
        }
        let node = this._getPreNode(jsname);
        if(node === null) cc.error(jsname + "not found");
        if(node ) return node;
    },
    putNode:function(node,classname) {
        if(!node) return;
        let jsname = classname || node.name;
        let nodepool = this._nodepools[jsname];
        if(nodepool) {
            /* node.destroy()// */nodepool.put(node);
        } else {
            node.destroy();
        }
        
    },
    autoPutNode:function(st,node) {
        let self = this;
        this.GameRoom.scheduleOnce(function() {
            // 这里的 this 指向 component
            self.putNode(node)
        }, st);
    },
    putNodeArr:function(nodeArr,classname) {
        if(nodeArr && nodeArr.length > 0)
        {
            for (let i = nodeArr.length - 1; i >= 0; i--) {
                const node = nodeArr[i];
                this.putNode(node,classname);
            }
        }
    },
    registerPrefab:function(prefab,name) {
        this._nodepools[name] = new cc.NodePool(name);
        this._prefabs[name] = prefab;
    },
    _getPreNode:function(name) {
        let node = null;
        let nodepool = this._nodepools[name];
        if(!nodepool) return null;
        if(nodepool.size() > 0) {
            node = nodepool.get();
        } else {
            node = cc.instantiate(this._prefabs[name]);
        }
        return node;
    },
});
let _instance = null;
let getInstance = function() {
    if(_instance) {
        return _instance;
    } else {
        _instance = new UIManager();
        return _instance;
    }
};
module.exports = getInstance();