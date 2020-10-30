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
    extends: cc.Component,

    properties: {
        iconSpr:cc.Sprite,
        bannerSpr:cc.Sprite,
        autoUpdateSt:5,
        eventNode:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if(this.iconSpr.node.active) {
            this._type = "icon";
        } else {
            this._type = "banner";
        }
        this.node.opacity = 0;
        this.show();
    },
    onEnable() {
        this._check();
    },
    start () {

    },
    _check() {
        if (!this._insertAdObj || !this._insertAdInfo) {
            console.log("ovNative is null !");
            if(this.eventNode) {
                console.log("ovNative is emit !");
                this.eventNode.emit("ovNativeFailed");
            }
            this._reflus();
        }
    },
    show:function() {
        let plat = cx_QyMgr.getPlatName();
        if(plat == "vivo" || plat == "oppo") {
            this._init();
/*             if(this._type == "banner") {
                this._init();
            } else {
                this.node.runAction(cc.sequence(cc.delayTime(3),cc.callFunc(this._init,this)));
            } */
        }
    },
    _init:function() {
        this._st = null;
        this._reflus();
        if(this._type == "icon") 
        {
            this.schedule(function() {
                // 这里的 this 指向 component
                if(this.node.active) this._reflus();
            }, this.autoUpdateSt);
        }
    },
    _reflus:function() {
        this._insertAdInfo = null;
        this._insertAdObj = null;
        this.node.opacity = 0;
        this._initData();
        this._reflusSpr();
    },
    _initData:function() {
        let ret = G_OVAdv.getNextNativeAdInfo();
        console.log("getNextNativeAdInfo: ",ret);
/*          ret = [{},{
            "title":"",
            "imgUrlList":[
                "https://img.hnquyou.com/2019-11-20/ea6c46be9f4ad2635fb312ea6645366f.png",
                "https://img.hnquyou.com/2019-11-09/91a5ce28b1b36f5fdcce1dd1a3f9c9b0.png",
            ]
        }]  */
        if (ret) {
            let insertAdObj = ret[0]
            let insertAdInfo = ret[1]

            if (insertAdObj && insertAdInfo) {
                // save
                this._insertAdObj = insertAdObj
                this._insertAdInfo = insertAdInfo
                this._title = insertAdInfo.title;
                this._imgUrlList = insertAdInfo.imgUrlList;
                //console.log("native imglist is ",insertAdInfo.imgUrlList,this._type);
                G_OVAdv.reportNativeAdShow(insertAdObj, insertAdInfo.adId)
            }
        }
        else {
            if(this.eventNode) {
                this.eventNode.emit("ovNativeFailed");
            }
        }
    },
    _reflusSpr:function() {
        let list = this._imgUrlList;
        if(!list || list.length === 0) {
            return;
        } 
        let imgUrl = null;
        if(list.length > 1) {
            let st = cx.jsTools.getRandomNum(0,list.length - 1,this._st);
            imgUrl = list[st];
            this._st = st;
        } else {
            imgUrl = list[0];
            this._st = 0;
        }
        
        let self = this;
        let spr = null;
        if(self._type == "icon") {
            spr = self.iconSpr;
        } else {
            spr = self.bannerSpr;
        }
        if(!spr.spriteFrame) {
            this.node.opacity = 0;
        };
        cc.loader.load(imgUrl, (err, texture) => {
            if (err) {
                return
            }
            if (imgUrl === this._insertAdInfo.imgUrlList[self._st]) {
                spr.spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                self.node.opacity = 255;
                if(self.eventNode) {
                    self.eventNode.emit("ovNativeShow");
                }
            }
        })
    },
    clickAdv:function() {
        console.log("click native adv",this._insertAdObj,this._insertAdInfo);
        if (this._insertAdObj && this._insertAdInfo) {
            console.log("click native adv");
            G_OVAdv.reportNativeAdClick(this._insertAdObj, this._insertAdInfo.adId, this._insertAdInfo.localAdID);
            this.close();
        }
    },
    close:function() {
        if(this._type = "banner") {
            G_OVAdv.reportNativeAdHide();
            this._reflus();
        }
        if(this.eventNode) {
            this.eventNode.emit("ovNativeClicked");
        }
        this.node.active = false;
        //cx.UIMgr.putNode(this.node);
    },
    // update (dt) {},
});
