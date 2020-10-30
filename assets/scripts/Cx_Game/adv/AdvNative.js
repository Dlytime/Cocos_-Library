var AdvNative = class{
    constructor() 
    {
        this._oppoConfigs = 
        {
            "native":[
                {
                    adUnitId:"173890",
                }
            ]
        }
        this._oppoNatvieAd = null;
        this._oppoNativeList = null;
        this._oppoShowInfo = {"imgSf":null};
    }

    _createOppoNativeAdv (cb) {
        let self = this;
        if(G_PlatHelper.isOPPOPlatform()) {
            let nativeAd = qg.createNativeAd(this._oppoConfigs.native[0]);
            this._oppoNatvieAd = nativeAd;
            nativeAd.onLoad(function(res) {
                let list = res.adList;
                self._oppoNativeList = list;
                console.log("Oppo原生广告数据：",list);
                self._loadOppoSpr(function (key,value) {
                    if(typeof cb === "function") {
                        //loadcb(this._convertOppoList(list));
                        cb(self._oppoShowInfo);
                    }
                });

                
            });
        }
    }
    _preCreatOpponNativeAdv() {
        //if()
    }
    destroyOppoNativeAdv() {
        let nativeAd = this._oppoNatvieAd;
        if(nativeAd) {
            nativeAd.destroy();
            this._oppoNatvieAd = null;
            //this._oppoNativeList = null;
        }
    }
    getOppoNativeAdv (cb) {
        let list = this._oppoNativeList;
        if(this._oppoShowInfo.imgSf) {
            cb(this._convertOppoList(this._oppoShowInfo.imgSf));
            this.destroyOppoNativeAdv();
            this._createOppoNativeAdv();
            this._oppoShowInfo = {};
        } 
        else {
            this._createOppoNativeAdv(cb);
        }
    }
    _convertOppoList(list) {
        return {"imgUrl":list.imgUrlList[0]};
    }
    _loadOppoSpr(cb) {
        if(this._oppoNativeList) {
            let list = this._convertOppoList(this._oppoNativeList);
            let remoteUrl = list.imgUrl;
            cc.loader.load(remoteUrl, function (err, texture) {
                // Use texture to create sprite frame
                var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                self._oppoShowInfo.imgSf = spriteFrame;
                if(typeof cb === "function") {
                    cb("imgSf",spriteFrame);
                }
            });
        }
    }
}
var instance = null;
var getInstance = function () {
    if(instance === null) instance = new AdvNative();
    return instance;
}
module.exports = getInstance();