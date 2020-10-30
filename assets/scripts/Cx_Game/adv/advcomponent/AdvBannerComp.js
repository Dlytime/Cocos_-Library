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
    extends: require("DcAdv_base"),

    properties: {
        advKey:{
            default:"Banner",
            tooltip:"广告类型,对应全局变量G_ADCfg"
        },
        eventNode: {
            type:cc.Node,
            default:null,
            tooltip:"用来接收广告点击事件节点，事件名：“AdvClickCallBack,返回参数 AdvClickResult(成功true,失败false),advInfo 点击的广告信息"
        },
        imgSize:{
            default:cc.size(0,0),
            tooltip:"banner尺寸，默认选取组件所在节点尺寸"
        },
    },
    editor: CC_EDITOR && {
        requireComponent: cc.Sprite,
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on("touchend",this._btnTouchEndCb,this);
    },
    onEnable () {
        this._getAdvOriginalData();
    },
    reflusSprByData() {
        let self = this;
        let arr = this._imgInfoList;
        let info = arr[0];
        let url = info.path;
        cc.loader.load(url, function (err, texture) {
            if(err) {
                return;
            }
            //cc.log("texture:",texture);
            var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
            self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });

    },
    _btnTouchEndCb (event) {
        let node = event.target;
        let cb = event.cb;
        
        let info = this._imgInfoList[0];
        var targetData = info;//this._imgInfoList[targetTag];
        let self = this;

        let plat = G_PlatHelper.getPlatType();
        if(plat == "WIN") {
            if(self.eventNode) {
                self.eventNode.emit("DcAdvClicked",{"result":true,"advInfo":obj});
            } else {
                let canvas = cc.director.getScene().getChildByName("Canvas");
                canvas.emit("DcAdvClicked",{"result":false,"advInfo":targetData});
            }
            return;
        }

        this._toMiniProgram(targetData.advInfo,function(result){
            console.log("导出广告点击返回结果",result);
            if(result)
            {
                cx_DyData.clickedDcAdvArr.push(targetData.appid);
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
        //qy.h_ToMinProgram(obj);

        
        //this._btnClicked(event.target);
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
        console.log(this._imgInfoList);
        this.reflusSprByData();
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
                console.log("banner daochu adv  ",res);
                self._handData(res[_advKey]);
                
            }.bind(this))
        }
    },

    start () {

    },

    // update (dt) {},
});
