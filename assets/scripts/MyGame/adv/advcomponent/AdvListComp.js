// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
/**
 * 广告滚动框组件，自动获取广告数据添加IMG节点，支持背景和img title显示
 */
var qy = require("qy");
var AdvList = require("AdvList");
var ImageAnimation = require("ImageAnimation");
var ScrollType = cc.Enum({
    HORIZONTAL: 1,
    VERTICAL: 2,
});
var BgzIndex = cc.Enum({
    0: 0,
    1: 1,
});
cc.Class({
    extends: cc.Component,

    properties: {
        advKey:{
            default:"",
            tooltip:"广告类型,对应全局变量G_ADCfg"
        },
        eventNode: {
            type:cc.Node,
            default:null,
            tooltip:"用来接收广告点击事件节点，事件名：“AdvClickCallBack,返回参数 AdvClickResult(成功true,失败false),advInfo 点击的广告信息"
        },
        listSize:{
            default:cc.size(200,200),
            tooltip:""
        },
        isAutoScoll:{
            default:true,
            tooltip:"是否开启自动滚动"
        },
        scrollType:{
            type:ScrollType,
            default:ScrollType.HORIZONTAL,
            tooltip:"自动滚动类型"
        },
        scrollSpeed:{
            default:30,
            tooltip:"自动滚动每秒移动像素值"
        },
        oneLineCellCount:{
            default:0,
            tooltip:"一行(垂直)或一列(水平)显示img数量"
        },
        maxShowCells:{
            default:0,
            tooltip:"list中最大显示数量,若小于等于0则代表不限制"
        },
        

        imgSize:{
            default:cc.size(100,100),
            tooltip:""
        },
        animSpeed:{
            default:1,
            tooltip:"gif类型时动画播放速度"
        },

        isShowBg:{
            default:false,
            tooltip:"是否给Img添加背景"
        },
        bgSize:{
            default:cc.size(120,120),
            tooltip:"背景尺寸，isShowBg为true时生效"
        },
        offsetPoint:{
            default:cc.v2(0,0),
            tooltip:"Img(title)在背景节点下的位置，isShowBg为true时生效"
        },
        bgzIndex:{
            type:BgzIndex,
            default:0,
            tooltip:"bg相对于img节点深度，0代表bg在img之下，反之在上"
        },
        bgSpriteFrame:{
            type:cc.SpriteFrame,
            default:null,
            tooltip:"Img背景图片，isShowBg为true时生效"
        },
        bgSpriteFrameArr:{
            type:cc.SpriteFrame,
            default:[],
            tooltip:"Img背景图片数组，isShowBg为true时生效,优先使用"
        },
        isShowTitle:{
            default:false,
            tooltip:"是否给Img下方添加标题文字"
        },
        titleColor:{
            //type:cc.Color,
            default:new cc.Color(0,0,0,0) 
        },
        titleSpaceY:{
            default:8,
            tooltip:"标题和Img的Y方向间距"
        },
        /**
         * !#en The font of label.
         * !#zh 文本字体。
         * @property {Font} font
         */
        font: {
            type: cc.Font,
            default:null,
            tooltip: "title使用字体",
        },

        _isSystemFontUsed: true,
        fontSize: {
            default:25,
            tooltip:"字体大小"
        },
        spacingX:{
            default:-1,
            tooltip:"List的X方向间距，为负则默认使用自动布局"
        },
        spacingY:{
            default:-1,
            tooltip:"List的Y方向间距，为负则默认使用自动布局"
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._bgst = 0;
        this._nodeArr = [];
        this.listNode = new AdvList();


        this.node.addChild(this.listNode);
    },

    start () {
        this._updateList();
    },
    onEnable () {
        this._imgInfoList = [];
        //cx_DyDataMgr._clickedDcAdvArr = [];//已经跳转过的游戏记录
        this._getAdvOriginalData();
    },
    reflusListByData() {
        let arr = this._imgInfoList;
        let len = Math.min(arr.length,this.maxShowCells);
        if(this.maxShowCells <= 0) len = arr.length;
        for (let i = 0; i < len; i++) {
            let info = arr[i];
            let node = this._getNode(i);
            this._updateNode(node,info);
            if(!node.parent){
                this.listNode.add(node);
            }
        }
        if(this._isAutoClick) {
            this._autoClick();
        }
    },
    //获取list中第st个imgNode,从0下标开始
    _getNode (st) {
        var arr = this.listNode.getAddChild();
        var node = null;
        if(arr.length > st ) {
            node = arr[st];
        } else {
            node = this._creatNode();
            node.mytag = st;
        }
        return node;
    },
    _creatNode () {
        var node = new cc.Node("spr");
        let bgSpr = node.addComponent(cc.Sprite);
        bgSpr.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        let bgSf = this._getBgSf();
        if(this.isShowBg && this.bgzIndex === 0 && bgSf instanceof cc.SpriteFrame) bgSpr.spriteFrame =  bgSf;

        let layout = new cc.Node("layout").addComponent(cc.Layout);
        layout.type = cc.Layout.Type.VERTICAL;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;

        node.width = this.bgSize.width;
        node.height = this.bgSize.height;

        let imgNode = new ImageAnimation();
        imgNode.name = "img";

        let lbl = new cc.Node("title").addComponent(cc.Label);
        lbl.string = "";
        lbl.fontSize = this.fontSize;
        lbl.node.color = this.titleColor;
        lbl.lineHeight = this.fontSize;
        lbl.verticalAlign = cc.Label.VerticalAlign.CENTER;
        layout.spacingY = this.titleSpaceY || 8;
        if(this.font) {
            lbl.useSystemFont = false;
            lbl.font = this.font;
        }
        if(!this.isShowTitle) {
            lbl.node.active = false;
        }
        //lbl.spacingY = info.title.paddingY;
        

        layout.node.addChild(imgNode);
        layout.node.addChild(lbl.node);
        layout.node.setPosition(this.offsetPoint);

        node.addChild(layout.node);
        if(this.bgzIndex === 1 && bgSf instanceof cc.SpriteFrame) {
            let dspr = new cc.Node("downbg").addComponent(cc.Sprite);
            dspr.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            dspr.spriteFrame = bgSf;
            dspr.node.width = this.bgSize.width;
            dspr.node.height = this.bgSize.height;
            node.addChild(dspr.node);
        }    
        this._nodeArr.push(node);
        return node;
    },
    _getBgSf:function() {
        let arr = this.bgSpriteFrameArr;
        if(arr.length > 0) 
        {
            let st = this._bgst;
            if(st < arr.length - 1) {
                this._bgst ++;
            } else {
                this._bgst = 0;
            }
            return arr[st];
        }
        else
        {
            return this.bgSpriteFrame;
        }
    },
    _toMiniProgram( advInfo, touchCb ) {
        console.log("跳转到导出广告",advInfo)
        if (advInfo) {
            G_Reportor.report(G_ReportEventName.REN_NAVIGATION_TO_MINIPROGRAM)

            let toMin = {
                adv_id: advInfo.adv_id,
                appId: advInfo.appid,
                pkgName: advInfo.appid,
                path: advInfo.path,
            }
            console.log("toMin",toMin);
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
                console.log(G_PlatHelper.getPlat());
                console.log(G_PlatHelper.getPlat().h_ToMinProgram);
                G_PlatHelper.getPlat().h_ToMinProgram(toMin);
                
            }
        }
    },
    _updateNode (node,imgData) {
        let layoutNode = node.getChildByName("layout");
        let imgNode = layoutNode.getChildByName("img");
        let titleNode = layoutNode.getChildByName("title");
        imgNode.updateImageData(imgData);
        
        if(!this.isShowTitle) {
            titleNode.active = false;
        } else {
            titleNode.active = true;
            titleNode.getComponent(cc.Label).string = imgData.title;
            //titleNode.getComponent(cc.Label).string = "少天不离"
        }

        if(node.hasEventListener("touchend") === false) {
            node.on("touchend",this._btnTouchEndCb,this);
        }
        /*if(node.hasEventListener("touchstart") === false) {
            node.on("touchstart",this._btnTouchStartCb,this);
        }*/
    },
    /**随机自动点击一个广告进入 */
    autoClick:function(cb) {
        this._isAutoClick = true;
        this._AutoClickCb = cb;
    },
    _autoClick:function() {
        var cb = this._AutoClickCb;
        var arr = this.listNode.getAddChild();
        let st = cx_jsTools.getRandomNum(0,arr.length - 1);
        let node = arr[st];
        this._btnTouchEndCb({"target":node,"cb":cb});
        this._isAutoClick = false;
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
    //点击list中节点后替换节点
    _replaceBtnNode (target) {
        var datalist = this._imgInfoList;
        var maxShowCells = this.maxShowCells;
        if(datalist.length > maxShowCells)
        {
            let arr = this._nodeArr;
            let tmparr = [];
            for (let j = 0; j < datalist.length; j++) {
                let is = true;
                for (let i = 0; i < arr.length; i++) {
                    let node = arr[i];
                    if(node.mytag == j) {
                        is = false;
                        continue;
                    } 
                }
                if(is) tmparr.push({"tag":j,"info":datalist[j]});
            }
            if(tmparr.length > 0) {
                let st = cx_jsTools.getRandomNum(0,tmparr.length);
                let mytag = tmparr[st].tag;
                var imgData = datalist[mytag];
                /*var targetTag = target.mytag;
                var targetData = datalist[targetTag];
                if(targetTag && typeof targetTag === "number") {
                    datalist[randomIndex] = targetData;
                    datalist[targetTag] = imgData;
                }*/
                target.mytag = mytag;
                this._updateNode(target,imgData);
            }
        }
    },
    _handData (originalData) {
        var arr = this._convertToLocalAdvInfos(originalData);
        if(!arr || arr.length === 0 ) return;
        let imgInfoArr = [];
        for (let i = 0; i < arr.length; i++) {
            imgInfoArr[i] = arr[i];
            imgInfoArr[i].width = this.imgSize.width;
            imgInfoArr[i].height = this.imgSize.height;
            imgInfoArr[i].speed = this.animSpeed;
        }
        this._imgInfoList = imgInfoArr;
        this.reflusListByData();
    },

    _updateList(){
        let node = this.listNode;
        node.size = this.listSize;
        if(this.bgSpriteFrame instanceof cc.SpriteFrame || this.bgSpriteFrameArr.length > 0 || this.isShowTitle) {
            node.cellSize = this.bgSize;
        } else{
            node.cellSize = this.imgSize;
        }
        
        node.oneLineCellCount = this.oneLineCellCount;
        node.scrollType = this.scrollType;
        node.isAutoScoll = this.isAutoScoll;
        node.scrollSpeed = this.scrollSpeed;
        if(this.spacingX >= 0) {
            node.isAutoSpace = false;
            node.spacingX = this.spacingX;
        }
        if(this.spacingY >= 0) {
            node.isAutoSpace = false;
            node.spacingY = this.spacingY;
        } 
        //node.clear();
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
            info.title = data.title;
            info.advInfo = data;
            result.push(info);
        }
        cc.log("localAdvInfos::::",result);
        return result;
    }
    // update (dt) {},
});
