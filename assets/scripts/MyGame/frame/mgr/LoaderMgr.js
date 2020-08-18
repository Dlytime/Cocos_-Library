/**小游戏资源加载管理 */
var LoaderMgr = class LoaderMgr{
    static _instance = null;
    static _getInstance() {
        if(LoaderMgr._instance) {
            return LoaderMgr._instance;
        } else {
            return new LoaderMgr();
        }
    }
    constructor() {
        //方法中传的路径一律为相对路径
    }

    /**初始化(预加载) */
    init() {
        this._localPath = cx_DyData.localPath;
        this._remotePath = cx_DyData.remotePath;

        this._sfCg = cx_DyData.dyResourceCg.sfs;
        this._audioCg = cx_DyData.dyResourceCg.audio;
        this._dragonBonesCg = cx_DyData.dyResourceCg.dragonBones;
        this._prefabCg = cx_DyData.dyResourceCg.prefab;

        this._totalPreCount = this._countPreResource();
        this._isLoadOver = false;
        this._preLoadSfs();
        this._preLoadAudio();
        this._preLoadPb();
        this._preLoadDragonBones();
    }
    /**预加载龙骨赋予 */
    getDragonBone(name,node) {
        let info = cx_DyData.dyResourceSg.dragonBones[name];
        if(!info) console.error("no dragonBone find");
        var dragonDisplay = node.getComponent(dragonBones.ArmatureDisplay);
        dragonDisplay.dragonAtlasAsset = info.atlas;
        dragonDisplay.dragonAsset = info.asset;

        dragonDisplay.armatureName = 'Armature';
        return dragonDisplay;
    }
    isLoadOver() {
        return this._isLoadOver;
    }
    _countPreResource() {
        let sum = 0;
        let obj = cx_DyData.dyResourceCg;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const arr = obj[key];
                sum = sum + arr.length;
            }
        }
        return sum;
    }
    _preLoadSfs() {
        let self = this;
        let arr = this._sfCg;
        let type1 = "sfs/";
        let type2 = ".png";
        for (let i = 0; i < arr.length; i++) {
            const tmp = arr[i];
            let path = null;
            let name = null;
            if(typeof tmp == "string")
            {
                path = this._remotePath + type1 + tmp + type2;
                name = tmp;
            }
            else
            {
                name = tmp.name;
                path = tmp.totalPath?tmp.totalPath:(this._remotePath + tmp.path + name + type2) ;
            }
            this.loadRemoteSf(path,function(sf,key){
                if(sf instanceof cc.SpriteFrame) {
                    cx_DyData.dyResourceSg.sfs[key] = sf;
                    self._checkPreLoad("sfs",key,true);
                } else {
                    self._checkPreLoad("sfs",key,false);
                    cc.error("sf preLoad faild: "+key);
                } 
            },name)
        }
    }
    _preLoadAudio() {
        let self = this;
        let arr = this._audioCg;
        let type1 = "audio/";
        let type2 = ".mp3";
        for (let i = 0; i < arr.length; i++) {
            const tmp = arr[i];
            let path = null;
            let name = null;
            if(typeof tmp == "string")
            {
                path = this._remotePath + type1 + tmp + type2;
                name = tmp;
            }
            else
            {
                name = tmp.name;
                path = tmp.totalPath?tmp.totalPath:(this._remotePath + tmp.path + name +  type2) ;
            }
            this.loadRemoteAudio(path,function(clip,key){
                if(clip instanceof cc.AudioClip) {
                    cx_DyData.dyResourceSg.audio[key] = clip;
                    cx_AudioMgr.playEffect(clip,false,0);
                    self._checkPreLoad("audio",key,true);
                } else {
                    cc.error("audio preLoad faild: "+key);
                    self._checkPreLoad("audio",key,false);
                } 
            },name)
        }
    }
    _preLoadPb() {
        let self = this;
        let arr = this._prefabCg;
        for (let i = 0; i < arr.length; i++) {
            const tmp = arr[i];
            let path = null;
            let name = null;
            if(typeof tmp == "string")
            {
                path = "prefab/" + tmp ;
                name = tmp;
            }
            else
            {
                name = tmp.name;
                path = tmp.path + name;
            }
            this.loadPrefab(path,function(prefab,key){
                if(prefab instanceof cc.Prefab) {
                    cx_DyData.dyResourceSg.prefab[key] = prefab;
                    self._checkPreLoad("prefab",key,true)
                } else {
                    self._checkPreLoad("prefab",key,false)
                    cc.error("audio preLoad faild: "+key);
                } 
            },name)
        }
    }
    _preLoadDragonBones() {
        let arr = this._dragonBonesCg;
        for (let i = 0; i < arr.length; i++) {
            const info = arr[i];
            this._preLoadDragonBone(info);
        }
    }
    _preLoadDragonBone(info) {
        let self = this;

        var imageUrl = this._remotePath + "dragonBones/" + info.image;
        var skeUrl = this._remotePath + "dragonBones/" + info.ske; 
        var atlasUrl = this._remotePath + "dragonBones/" + info.atlas;
        cc.loader.load(imageUrl, (error1, texture) => {
            cc.loader.load({ url: atlasUrl, type: 'txt' }, (error2, atlasJson) => {
                cc.loader.load({ url: skeUrl, type: 'txt' }, (error3, dragonBonesJson) => {
                    var atlas = new dragonBones.DragonBonesAtlasAsset();
                    atlas._uuid = atlasUrl;
                    atlas.atlasJson = atlasJson;
                    atlas.texture = texture;

                    var asset = new dragonBones.DragonBonesAsset();
                    asset._uuid = skeUrl;
                    asset.dragonBonesJson = dragonBonesJson;

                    cx_DyData.dyResourceSg.dragonBones[info.name] = {"atlas":atlas,"asset":asset};

                    let status = true;
                    if(error1 || error2 || error3) status = false;
                    self._checkPreLoad("dragonBones",info.name,status)
                });
            });
        });
    }
    _checkPreLoad(type,name) {
        this._totalPreCount--;
        if(this._totalPreCount <= 0) 
        {
            let node = cc.director.getScene().getChildByName("Canvas");
            node.emit("resourceLoadEnd");
            this._isLoadOver = true;
            console.log("资源加载完毕  ",cx_DyData.dyResourceSg);
        }
    }
    /**自动加载，若resource下未找到图片则转远程服务器加载 */
    autoLoadSf(path,cb) {
        let url = this._localPath + path;
        var self = this;
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
            //self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            if(typeof cb == "function" && spriteFrame instanceof cc.SpriteFrame) {
                cb(spriteFrame);
            } else {
                self.loadRemoteSf(path,cb);
            }
            
        });
    }
    /**加载本地resource下图片 */
    loadSf(path,cb,params) {
        let url = this._localPath + path;
        var self = this;
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
            //self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            console.log(path+" back result ",spriteFrame);
            if(err) console.log(err);
            if(typeof cb == "function" && spriteFrame instanceof cc.SpriteFrame) {
                cb(spriteFrame,params);
            }
            
        });
    }
    /**加载远程服务器png图片*/
    loadRemoteSf(path,cb,params) {
        cc.loader.load(path, function (err, texture) {
            // Use texture to create sprite frame
            if(texture && typeof cb == "function") {
                let spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                cb(spriteFrame,params);
            }
            else if(!texture && typeof cb == "function") {
                cb(null,params);
            }
        });
    }
    /**
     * 加载一组远程图片，按返回原顺序sf数组
     * @param {Array<String>} pathArr 远程路径数组
     * @param {Function} cb 全部图片加载完成回调函数
     */
    loadRemoteSfs(pathArr,cb) {
        if(!this._sfsTag) {
            this._sfsTag = 1;
        } else {
            this._sfsTag++;
        }
        let arrName = "_sfs_" + this._sfsTag;
        this[arrName] = [];

        for (let i = 0; i < arr.length; i++) {
            const path = arr[i];
            this._loadRemoteSfs(arrName,i,path,pathArr,cb);
        }
    }
    _loadRemoteSfs(arrName,tag,path,pathArr,cb) {
        let self = this;
        let remotePath = this._remotePath + path + ".png";
        cc.loader.load(remotePath, function (err, texture) {
            // Use texture to create sprite frame
            if(texture && typeof cb == "function") {
                let spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                let arr = self[arrName];
                arr[tag] = spriteFrame;
                if(arr.length === pathArr.length && !cx_jsTools.checkArrHasUf(arr)) {
                    cb(arr);
                }
            }
        });
    }
    /**加载图集(一般图集资源不使用动态加载) */
    loadAtlas(path,cb) {

    }
    loadJson(path,cb){
        var self = this;
        path = this._localPath + path + ".json";
        cc.loader.loadRes(path, function (err, object) {
            if (err) {
                console.log(err);
                return;
            }
            cb(object.json);
            //self._originalData = object.json["ee2a98b3ba79d62950534db9641ee913"];
        });
    }
    autoLoadAudio(url,cb) {
        let self = this;
        this.loadAudio(url,function(clip){
            if(clip) {
                cb(clip);
            } else {
                self.loadRemoteAudio(url,function(clip){
                    cb(clip);
                })
            }
        })
    }
    loadAudio(url,cb,params) {
        cc.loader.loadRes(url, cc.AudioClip, function (err, clip) {
            if(typeof cb === "function") {
                if(clip instanceof cc.AudioClip) {
                    cb(clip,params);
                } else {
                    cc.error(err);
                    cb(null,params);
                }
            }
        });
    }
    loadRemoteAudio(url,cb,params) {
        let self = this;
        cc.loader.load(url, function (err, clip) {
            //cc.log(clip);
            if(err) {
                console.error(err);
                if(typeof cb == "function") {
                    cb(null,params)
                }
            } 
            else if(cb && clip instanceof cc.AudioClip) {
                cb(clip,params);
            }
        });
    }
    /**动态加载预制体 */
    loadPrefab(path,cb,params) {
        cc.loader.loadRes(path, function (err, prefab) {
            if(err) console.error(err);
            if(typeof cb === "function") {
                if(prefab instanceof cc.Prefab) {
                    cb(prefab,params);
                }
                else {
                    cb(null,params);
                    //console.error(path+" load wrong !!");
                }
            }
        });
    }

    LoadDragonBone(node) {
        var dragonDisplay = node.getComponent(dragonBones.ArmatureDisplay);

        var imageUrl = this._remotePath + "dragonBones/" + "black_leopard_tex.png";
        var skeUrl = this._remotePath + "dragonBones/" + "black_leopard_ske.json"; 
        var atlasUrl = this._remotePath + "dragonBones/" + "black_leopard_tex.json";
        cc.loader.load(imageUrl, (error, texture) => {
            cc.loader.load({ url: atlasUrl, type: 'txt' }, (error, atlasJson) => {
                cc.loader.load({ url: skeUrl, type: 'txt' }, (error, dragonBonesJson) => {
                    var atlas = new dragonBones.DragonBonesAtlasAsset();
                    atlas._uuid = atlasUrl;
                    atlas.atlasJson = atlasJson;
                    atlas.texture = texture;

                    var asset = new dragonBones.DragonBonesAsset();
                    asset._uuid = skeUrl;
                    asset.dragonBonesJson = dragonBonesJson;

                    dragonDisplay.dragonAtlasAsset = atlas;
                    dragonDisplay.dragonAsset = asset;

                    dragonDisplay.armatureName = 'Armature';
                    dragonDisplay.playAnimation('Idle', 0);
                });
            });
        });
    }
}
module.exports = LoaderMgr._getInstance();