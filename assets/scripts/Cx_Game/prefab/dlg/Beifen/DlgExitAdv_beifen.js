// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var ImageAnimation = require("ImageAnimation");
cc.Class({
    extends: require("Dlg"),

    properties: {
        copyItem:{
            type:cc.Node,
            default:null    
        },
        content:{
            type:cc.Node,
            default:null
        },
        advKey:"Exit",
        maxCells:8,
        imgSize:cc.size(120,120)
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._imgInfoList = [];
        this._clickedArr = [];//已经跳转过的游戏记录
        this._getAdvOriginalData();
    },
    clicked:function(event) {
        let target = event.target;
        var targetData = this._imgInfoList[target.myTag];
        let self = this;
        this._toMiniProgram(targetData.advInfo,function(result){
            console.log("退出页广告点击返回结果",result);
            if(result)
            {
                //self._replaceBtnNode(node);
            }
            if(self.eventNode) {
                let obj =  G_Utils.cloneDeep(targetData);
                self.eventNode.emit("AdvCallBack",{"result":result,"advInfo":targetData});
            }
            
        })
    },
    _handData (originalData) {
        var arr = this._convertToLocalAdvInfos(originalData);
        if(!arr || arr.length === 0 ) return;
        let imgInfoArr = [];
        for (let i = 0; i < arr.length; i++) {
            imgInfoArr[i] = arr[i];
            imgInfoArr[i].width = this.imgSize.width;
            imgInfoArr[i].height = this.imgSize.height;
            imgInfoArr[i].speed = 1;
        }
        this._imgInfoList = imgInfoArr;

        for (let i = 0; i < imgInfoArr.length; i++) {
            const info = imgInfoArr[i];
            if(i >= this.maxCells) break;

            let node = cc.instantiate(this.copyItem);
            let mask = node.getChildByName("mask");
            let titlelbl = node.getChildByName("title").getComponent(cc.Label);

            let imgNode = this._getImgNode(info);
            mask.addChild(imgNode);
            titlelbl.string = info.title;
            node.myTag = i;

            node.active = true;
            this.content.addChild(node);
        }
    },
    _getImgNode:function(imgData) {
        let node = new ImageAnimation();
        node.name = "img";
        node.updateImageData(imgData);
        node.animSpeed = imgData.speed;
        return node;
    },
    _toMiniProgram( advInfo, touchCb ) {
        if (advInfo) {
            G_Reportor.report(G_ReportEventName.REN_NAVIGATION_TO_MINIPROGRAM)

            let toMin = {
                adv_id: advInfo.adv_id,
                appId: advInfo.appid,
                pkgName: advInfo.appid,
                path: advInfo.path,
            }

            toMin.success = function () {
                G_Reportor.report(G_ReportEventName.REN_NAVIGATION_TO_MINIPROGRAM_SUCCESS)

                if (typeof touchCb === "function") {
                    touchCb(true)
                }
            }

            toMin.fail = function ( err ) {
                if (err && err.errMsg.indexOf("fail cancel") !== -1) {
                    G_Reportor.report(G_ReportEventName.REN_NAVIGATION_TO_MINIPROGRAM_CANCEL)
                }
                else {
                    G_Reportor.report(G_ReportEventName.REN_NAVIGATION_TO_MINIPROGRAM_ERROR)
                }

                if (typeof touchCb === "function") {
                    touchCb(false)
                }
            }


            if (G_PlatHelper.getPlat() && G_PlatHelper.getPlat().h_ToMinProgram) {
                console.log("点击导出广告",toMin);
                console.log(G_PlatHelper.getPlat());
                console.log(G_PlatHelper.getPlat().h_ToMinProgram);
                G_PlatHelper.getPlat().h_ToMinProgram(toMin);
                
            }
        }
    },
    _getAdvOriginalData () {
        var self = this;
        let _advKey = G_ADCfg[this.advKey];
        if(!_advKey) console.error("advKey set wrong！");
        let plat = G_PlatHelper.getPlatType();
        let arr = [_advKey];
        //debugger;
        if(plat == "WIN" ) {//!cc.sys.isMobile
            this._getTestData(function(res){
                var _advKey = "ee2a98b3ba79d62950534db9641ee913";
                self._handData(res[_advKey]);
            });
        }
        else {
            G_ADVMgr.getIconButtons(arr, function (res) {
                self._handData(res[_advKey]);
                console.log("微信导出广告  ",res)
            }.bind(this))
        }
    },
    _getTestData (cb) {
        var self = this;
        cc.loader.loadRes('imgdata.json', function (err, object) {
            if (err) {
                console.log(err);
                return;
            }
            cb(object.json);
            //self._originalData = object.json["ee2a98b3ba79d62950534db9641ee913"];
        });
    },
    _convertToLocalAdvInfos( advInfos ) {
        let localAdvInfos = []
        let backupAdvInfos = []

        if (Array.isArray(advInfos)) {
            for (let i = 0; i < advInfos.length; i++) {
                let advInfo = advInfos[i]

                if (Array.isArray(advInfo.logo_attr)) {
                    let randomIndex = G_Utils.random(0, advInfo.logo_attr.length - 1)

                    for (let j = 0; j < advInfo.logo_attr.length; j++) {
                        let cloneAdvInfo = G_Utils.cloneDeep(advInfo)
                        let each = advInfo.logo_attr[j]
                        if (each && typeof each === "object") {
                            cloneAdvInfo.logo_url = G_Utils.cloneDeep(each)
                        }
                        else {
                            cloneAdvInfo.logo_url = each
                        }

                        if (j === randomIndex) {
                            localAdvInfos.push(cloneAdvInfo)
                        }
                        else {
                            backupAdvInfos.push(cloneAdvInfo)
                        }
                    }
                }
                else {
                    if (typeof advInfo.logo_url === "string") {
                        localAdvInfos.push(advInfo)
                    }
                    else if (Array.isArray(advInfo.logo_url)) {
                        let randomIndex = G_Utils.random(0, advInfo.logo_url.length - 1)
    
                        for (let j = 0; j < advInfo.logo_url.length; j++) {
                            let cloneAdvInfo = G_Utils.cloneDeep(advInfo)
                            let each = advInfo.logo_url[j]
                            if (each && typeof each === "object") {
                                cloneAdvInfo.logo_url = G_Utils.cloneDeep(each)
                            }
                            else {
                                cloneAdvInfo.logo_url = each
                            }
    
                            if (j === randomIndex) {
                                localAdvInfos.push(cloneAdvInfo)
                            }
                            else {
                                backupAdvInfos.push(cloneAdvInfo)
                            }
                        }
                    }
                }
            }
        }

        G_Utils.shuffleArray(localAdvInfos)

        if (backupAdvInfos.length > 0) {
            G_Utils.shuffleArray(backupAdvInfos)
            localAdvInfos = localAdvInfos.concat(backupAdvInfos)
        }
        var result = [];
        for (let i = 0; i < localAdvInfos.length; i++) {
            const data = localAdvInfos[i];
            var info = data.logo_url;
            info.advKey = this.advKey;
            info.adv_id = data.adv_id;
            info.appid = data.appid;
            //info._path = data._path;
            info.advInfo = data;
            info.title = data.title;
            result.push(info);
        }
        cc.log("localAdvInfos::::",result);
        return result;
    },
    start () {

    },

    // update (dt) {},
});
