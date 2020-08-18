//var AdvList = require("AdvList");
var ImageAnimation = require("ImageAnimation");
cc.Class({
    extends: cc.Component,

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
        advKey:{
            default:"",
            tooltip:"广告类型,对应全局变量G_ADCfg"
        },
        eventNode: {
            type:cc.Node,
            default:null,
            tooltip:"用来接收广告点击事件节点，事件名：“AdvClickCallBack,返回参数 AdvClickResult(成功true,失败false),advInfo 点击的广告信息"
        },
        isLoopPlay: {
            default:true,
            tooltip:"是否循环切换图片"
        },
        playTime: {
            default:3,
            tooltip:"循环切换图片时间间隔"
        },
        animSpeed:{
            default:1,
            tooltip:"gif类型时动画播放速度"
        },
        imgSize:{
            default:cc.size(0,0)
        },
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },
    onEnable () {
        this._advInfoArr = null;
        this._getAdvOriginalData();
    },
    _loopPlay () {
        let self = this;
        if(this.isLoopPlay) {
            this.schedule(function() {
                // 这里的 this 指向 component
                let sum = cx_jsTools.getRandomNum(1,5);
                this._st  = this._st + sum;
                let st = this._st > (this._advInfoArr.length - 1) ? 0:this._st;
                this._st = st;
                let imgData = this._advInfoArr[st];
                if(!imgData) debugger;
                this._updateBtn(imgData);
            }, this.playTime);
        }
    },
    _getAdvOriginalData () {
        var self = this;
        let _advKey = G_ADCfg[this.advKey];
        if(!_advKey) console.error(" Banner advKey set wrong！");
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
                console.log("微信导出广告 Banner  ",res)
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
    _handData (originalData) {
        var arr = this._convertToLocalAdvInfos(originalData);
        if(!arr || arr.length === 0 ) return;
        for (let i = 0; i < arr.length; i++) {
           
            arr[i].width = this.imgSize.width;
            arr[i].height = this.imgSize.height;
            arr[i].speed = this.animSpeed;
        }
        this._advInfoArr = arr;
        var imgData = arr[0];
        this._st = 0;

        this.imgData = imgData; 
        let imgnode = this._getImgNode();
        this._imgNode = imgnode;
        this._updateBtn(imgData);
        this._loopPlay();
        imgnode.on("touchend",this._btnTouchEndCb,this);
    },
    _btnTouchEndCb (event) {
        let node = event.target;
        //var targetTag = node.mytag;
        var targetData = this._advInfoArr[this._st];
        let self = this;
        this._toMiniProgram(targetData.advInfo,function(result){
            console.log("退出页导出广告点击返回结果",result);
            //self._replaceBtnNode(node);
            if(result)
            {
                //self._clickedArr.push(mytag);
            }
            let obj =  G_Utils.cloneDeep(targetData);
            if(self.eventNode) {
                self.eventNode.emit("DcAdvClicked",{"result":result,"advInfo":obj});
            } else {
                let canvas = cc.director.getScene().getChildByName("Canvas");
                canvas.emit("DcAdvClicked",{"result":result,"advInfo":targetData});
            }
        })
        //this._btnClicked(event.target);
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
                console.log("点击广告",toMin);
                console.log(G_PlatHelper.getPlat());
                console.log(G_PlatHelper.getPlat().h_ToMinProgram);
                G_PlatHelper.getPlat().h_ToMinProgram(toMin);
                
            }
        }
    },
    _replaceBtnNode:function() {

    },
    _getImgNode() {
        var node = G_UIHelper.seekNodeByName(this.node, "img");
        if(!node){
            node = new ImageAnimation();
            node.name = "img";
            this.node.addChild(node);
        }
        return node;
    },
    _updateBtn(imgData) {
        let node = this._imgNode;
        node.updateImageData(imgData);
        node.animSpeed = imgData.speed;

        return;
        if(node.hasEventListener("touchend") === false) {
            node.on("touchend",this._btnTouchEndCb,this);
        }
        if(node.hasEventListener("touchstart") === false) {
            node.on("touchstart",this._btnTouchStartCb,this);
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
            console.log("开始获取广告数据！！！",arr);
            G_ADVMgr.getIconButtons(arr, function (res) {
                console.log("广告数据为：：！！！",res);
                self._handData(res[_advKey]);
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
            info.adv_id = data.adv_id;
            info.appid = data.appid;
            info.title = data.title;
            info.advInfo = data;
            result.push(info);
        }
        cc.log("localAdvInfos::::",result);
        return result;
    }
    // update (dt) {},
});
