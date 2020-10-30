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

        this._loadResultInfo = 
        {
            "totalCounts":0,"loadCounts":0,"completeCounts":0,
            "sfs":{"loadCounts":0,"successList":[],"failedList":[]},
            "plist":{"loadCounts":0,"successList":[],"failedList":[]},
            "json":{"loadCounts":0,"successList":[],"failedList":[]},
            "audio":{"loadCounts":0,"successList":[],"failedList":[]},
            "prefab":{"loadCounts":0,"successList":[],"failedList":[]},
            "dragonBones":{"loadCounts":0,"successList":[],"failedList":[]},
        };
        this._initResourceCg();
        this._initResourceLoad();
    }
    _initResourceCg() {
        //let info = cx_DyData.dyResourceCg
    }
    _initResourceLoad() {
        this.preLoadResource(cx_DyData.dyResourceCg.local.audio,"audio","local","common");
        this.preLoadResource(cx_DyData.dyResourceCg.local.prefab,"prefab","local","common");
        this.preLoadResource(cx_DyData.dyResourceCg.local.prefab,"prefab","local","gamePb");

        let plat = cx_QyMgr.getPlatName();
        this.preLoadResource(cx_DyData.dyResourceCg.local.prefab,"prefab","local",plat);
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

    /**
     * 资源预加载(加载完成后资源自动放入 dyResourceSg)
     * @param {Object} arrCg 加载数组对象(格式对应DyData dyResourceCg)
     * @param {String} resType 资源类型(sfs,json,plist,audio,prefab,dragonBones)
     * @param {String} loadType 加载类型(local,remote)
     * @param {String} tag 加载标签(若不为空，则只加载该标签资源)
     */
    preLoadResource(arrCg,resType,loadType,tag) {
        if(resType == "dragonBones") {
            this.preLoadDragonBones(arrCg,loadType,tag);
            return;
        } 

        let self = this;
        let arr = arrCg;

        let lastCg = {"sfs":".png","audio":".clip","prefab":"","json":".json","plist":".plist"};
        let funcCg = {"sfs":"Sf","audio":"Audio","prefab":"Prefab","json":"Json","plist":"Plist"};
        let funcTag = funcCg[resType];

        let basePath = loadType == "local"?this._localPath:this._remotePath;
        let loadFunc = loadType == "local"?cx_ccTools["loadLocal"+funcTag]:cx_ccTools["loadRemote"+funcTag];
        let type1 = resType + "/";
        let type2 = lastCg[resType];

        for (let i = 0; i < arr.length; i++) {
            const tmp = arr[i];
            let path = null;
            let name = null;
            if(typeof tmp == "string")
            {
                if(tag && tag !== "common") continue;
                path = basePath + type1 + tmp + type2;
                name = tmp;
            }
            else if(tmp instanceof Object)
            {
                if(tag && tmp.tag !== tag) continue;
                name = tmp.name;
                path = tmp.totalPath?tmp.totalPath:(basePath + (tmp.path?tmp.path:type1) + name + type2) ;
            }
            else continue;
            this._startPreLoad(resType,loadType,name);
            loadFunc(path,function(res,key){
                if(res) {
                    cx_DyData.dyResourceSg[resType][key] = res;
                    self._checkPreLoad(resType,key,true);
                } else {
                    self._checkPreLoad(resType,key,false);
                    console.error(resType + " preLoad faild: "+key);
                } 
            },name)
        }
    }
    isPreLoading(resType) {
        let obj = this._loadResultInfo;
        if(resType) 
        {
            if(cx_DyData.dyResourceName.indexOf(resType)) 
            {
                return obj[resType].loadCounts > obj[resType].completeCounts;
            }
            else
            {
                console.error("resType wrong,please check it!")
                return false;
            }
        }
        else
        {
            return obj.loadCounts > obj.completeCounts;
        }
    }
    getPreLoadResult() {
        return this._loadResultInfo;
    }
    _initClip(i,clip) {
        if(cx_QyMgr.getPlatName() == "vivo") return;
        cx_TimeMgr.delayFunc(0.02*i,()=>{
            cx_AudioMgr.playEffect(clip,false,0);
        })
    }

    preLoadDragonBones(cgArr,loadType,tag) {
        let arr = cgArr;
        let basePath = loadType == "local"?this._localPath:this._remotePath;
        var imageUrl = basePath + "dragonBones/png/" + info.image;
        var skeUrl = basePath + "dragonBones/" + info.ske; 
        var atlasUrl = basePath + "dragonBones/" + info.atlas;
        var loadFunc = loadType == "local"?cx_ccTools.loadLocalDragonBone:cx_ccTools.loadRemoteDragonBone;
        for (let i = 0; i < arr.length; i++) {
            const info = arr[i];
            if(tag && info.tag !==tag) continue;

            this._startPreLoad("dragonBones",loadType,name);

            loadFunc(imageUrl,skeUrl,atlasUrl,(date)=>{
                if(date) {
                    cx_DyData.dyResourceSg.dragonBones[oneInfo.name] = date;
                    self._checkPreLoad("dragonBones",oneInfo.name,true)
                } else {
                    self._checkPreLoad("dragonBones",oneInfo.name,false)
                }
            },info);
        }
    }
    _startPreLoad(resType,loadType,name) {
        this._loadResultInfo.loadCounts++;
        this._loadResultInfo[resType].loadCounts++;
    }
    _checkPreLoad(resType,name,status) {
        let result = status?"success":"faild";
        console.log(resType + " load " + result + "："+ name);
        
        this._loadResultInfo.completeCounts++
        if(result == "success"){
            this._loadResultInfo[resType].successList.push(name);
        } else {
            this._loadResultInfo[resType].failedList.push(name)
        } 
        if(this._loadResultInfo.loadCounts === this._loadResultInfo.completeCounts) 
        {
            console.log("resource load end  ",this._loadResultInfo);
        }

        if(resType == "audio") 
        {
            if(name == "bgm" && result == "success") {
                cx_AudioMgr.playMusic();
            }
        }
/*         if(type == "audio" && this._getLoadPercent(type) >= 1) {
            let node = cc.director.getScene().getChildByName("Canvas");
            node.emit("resourceLoadEnd");
        } */
    }

    /**内部资源加载(只传相对路径,无需后缀,不支持龙骨) */
    loadRes(resType,loadType,path,cb,params) {
        let lastCg = {"sfs":".png","audio":".clip","prefab":"","json":".json","plist":".plist"};
        let funcCg = {"sfs":"Sf","audio":"Audio","prefab":"Prefab","json":"Json","plist":"Plist"};
        let funcTag = funcCg[resType];

        let basePath = loadType == "local"?this._localPath:this._remotePath;
        let loadFunc = loadType == "local"?cx_ccTools["loadLocal"+funcTag]:cx_ccTools["loadRemote"+funcTag];
        let type2 = lastCg[resType];//资源后缀

        let loadPath = basePath + resType + "/" + path + type2;

        loadFunc(loadPath,cb,params);
    }
    /**内部龙骨加载(相对路径)*/
    loadDragonBone(imageUrl,skeUrl,atlasUrl,cb,params) {
        let basePath = loadType == "local"?this._localPath:this._remotePath;
        let loadFunc = loadType == "local"?cx_ccTools.loadLocalDragonBone:cx_ccTools.loadRemoteDragonBone;
        imageUrl = basePath + imageUrl;
        skeUrl = basePath + skeUrl;
        atlasUrl = basePath + atlasUrl;
        loadFunc(imageUrl,skeUrl,atlasUrl,cb,params);
    }
}
module.exports = LoaderMgr._getInstance();