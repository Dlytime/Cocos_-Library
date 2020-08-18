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
        downAdv:cc.Node,
        imgSize:cc.size(150,150),
        animClip:cc.AnimationClip,
        content:cc.Node,
        advKey:"FullScene"
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._imgArr = [];
        this._clickedArr = [];
        this.startLoadAdv();
        
    },
    init:function() {
        this.showDownAdv();
        this.showShakeAdv();
    },
    showDownAdv:function() {
        this.downAdv.active = true;
    },
    hideDownAdv:function() {
        this.downAdv.active = false;
    },
    showShakeAdv:function() {
        this.content.active = true;
    },
    hideShakeAdv:function() {
        this.content.active = false;
    },
    startLoadAdv () {
        var self = this;
        let _advKey = G_ADCfg[this.advKey];
        let plat = G_PlatHelper.getPlatType();
        let arr = [_advKey];
        console.log("adv shake _advKey is "+ _advKey);
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
            arr[i].speed = 1;//this.animSpeed;
        }
        this._st = 0;
        this._imgInfoList = arr;
        for (let i = 0; i < 8; i++) {
            var imgData = arr[i];
        
            this.imgData = imgData; 
            let imgnode = this._getImgNode(i,imgData.title);
            this._imgArr.push(imgnode);
            this._imgNode = imgnode;
            this._updateBtn(imgnode,imgData,i);
            //this._loopPlay();
            imgnode.on("touchend",this._btnTouchEndCb,this);
        }
    },
    _getImgNode(tag,title) {
        //var node = G_UIHelper.seekNodeByName(this.node, "img");
        let contentArr = this.content.children;
        if(false) {
            let addNode = contentArr[tag];
            let lbl = addNode.getChildByName("title").getComponent(cc.Label);
            let node = null;
            if(!node){
                node = new ImageAnimation();
                //let anim = node.addComponent(cc.Animation);
                //anim.addClip(this.animClip);
                //var animState = anim.play(this.animClip.name);
                lbl.string = title;
                node.name = "img";
                node.y = 20;
                addNode.addChild(node);
            }
            return node;
        } else {
            let node = null;
            if(!node){
                node = new ImageAnimation();
                let anim = node.addComponent(cc.Animation);
                anim.addClip(this.animClip);
                var animState = anim.play(this.animClip.name);
                node.name = "img";
                this.content.addChild(node);
            }
            return node;
        }
    },
    _updateBtn(imgnode,imgData,tag) {
        let node = imgnode;
        node.updateImageData(imgData);
        node.animSpeed = imgData.speed;
        node.mytag = tag;
        return;
        if(node.hasEventListener("touchend") === false) {
            node.on("touchend",this._btnTouchEndCb,this);
        }
        if(node.hasEventListener("touchstart") === false) {
            node.on("touchstart",this._btnTouchStartCb,this);
        }

    },
    _btnTouchEndCb (event) {
        let node = event.target;
        let cb = event.cb;
        var targetTag = node.mytag;
        let appid = this._imgInfoList[targetTag].appid;
        let info = this._getGoInfoList(targetTag,appid);
        var targetData = info.imgData;//this._imgInfoList[targetTag];
        let mytag = info.mytag;
        let self = this;

        let plat = G_PlatHelper.getPlatType();
        if(plat == "WIN") {
            let obj =  G_Utils.cloneDeep(targetData);
            cx_DyDataMgr._clickedDcAdvArr.push(targetData.appid);
            if(self.eventNode) {
                self.eventNode.emit("DcAdvClicked",{"result":true,"advInfo":obj});
            } else {
                let canvas = cc.director.getScene().getChildByName("Canvas");
                canvas.emit("DcAdvClicked",{"result":true,"advInfo":targetData});
            }
            return;
        }

        this._toMiniProgram(targetData.advInfo,function(result){
            console.log("导出广告点击返回结果",result);
            self._replaceBtnNode(node);
            if(result)
            {
                cx_DyDataMgr._clickedDcAdvArr.push(targetData.appid);
            }
            let obj =  G_Utils.cloneDeep(targetData);
            if(self.eventNode) {
                self.eventNode.emit("DcAdvClicked",{"result":result,"advInfo":obj});
            } else {
                let canvas = cc.director.getScene().getChildByName("Canvas");
                canvas.emit("DcAdvClicked",{"result":result,"advInfo":targetData});
            }
            if(cb && typeof cb == "function") {
                cb(result);
            } 
        })

        //this._replaceBtnNode(node);
        //qy.h_ToMinProgram(obj);

        
        //this._btnClicked(event.target);
    },
    _getGoInfoList:function(tag,appid) {
        let arr = cx_DyDataMgr._clickedDcAdvArr;
        /*let is = true;
        for (let i = 0; i < arr.length; i++) {
            const tmptag = arr[i];
            if(tag == tmptag) {
                is = false;
                break;
            }
        }*/
        console.log(arr);
        if(arr.indexOf(appid) < 0) {
            return {"imgData":this._imgInfoList[tag],"mytag":tag};
        }

        let list = this._imgInfoList;
        for (let i = 0; i < list.length; i++) {
            const info = list[i];
            if(arr.indexOf(info.appid) > -1) continue;
            return {"imgData":info,"mytag":i};;
        }
        return {"imgData":this._imgInfoList[tag],"mytag":tag};

    },
    _replaceBtnNode:function(targetNode) {
        let arr = this._imgArr;
        let infoarr = this._imgInfoList;
        let tmparr = [];
        for (let i = 0; i < infoarr.length; i++) {
            const info = infoarr[i];
            let is = true;
            for (let j = 0; j < arr.length; j++) {
                const imgNode = arr[j];
                if(imgNode.mytag == i) {
                    is = false;
                    break;
                }
            }
            if(is) {
                tmparr.push({info:info,mytag:i});
                if(tmparr.length === infoarr.length - arr.length) break;
            }
        }

        let st = cx_jsTools.getRandomNum(0,tmparr.length);
        this._updateBtn(targetNode,tmparr[st].info,tmparr[st].mytag);
        
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
    },
    start () {

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
    // update (dt) {},
});
