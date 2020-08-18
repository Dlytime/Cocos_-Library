

cc.Class({
    extends: cc.Component,

    properties: {
        closeCBtn:cc.Button,
        _title: null,
        _image: null,
        _desc: null,
        _closeBtn: null,
        _clickBtn: null,
        _insertAdObj: null,
        _insertAdInfo: null
    },

    onLoad() {
        if(!this._st) this._st = 0;
        // init UI
        this._initUI()
    },
    onEnable() {
        this.onInit();
    },
    init:function(mManager,closeCb) {
        this.mManager = mManager;
        this.closeCb = closeCb;
        
    }, 
    _initUI() {
        // body...
        let title = G_UIHelper.seekNodeByName(this.node, "title").getComponent(cc.Label)
        if (title) {
            // save
            this._title = title 
        }

        let image = G_UIHelper.seekNodeByName(this.node, "image").getComponent(cc.Sprite)
        if (image) {
            // save
            this._image = image
        }

        let desc = G_UIHelper.seekNodeByName(this.node, "desc").getComponent(cc.Label)
        if (desc) {
            // save
            this._desc = desc
        }

        let closeBtn = G_UIHelper.seekNodeByName(this.node, "closeBtn").getComponent(cc.Button)
        if (closeBtn) {
            // save
            this._closeBtn = closeBtn

            closeBtn.node.on('click', this.onCloseTouched, this)
        }

        let clickBtn = G_UIHelper.seekNodeByName(this.node, "clickBtn").getComponent(cc.Button)
        if (clickBtn) {
            // save
            this._clickBtn = clickBtn

            clickBtn.node.on('click', this.onClickTouched, this)
        }
    },

    onInit() {
        // body...
        this._st ++;
        let ret = G_OVAdv.getNextNativeAdInfo()
        console.log("G_OVAdv.getNextNativeAdInfo runed ,result = ",ret);
        if(!ret) this.onCloseTouched();
        if (ret) {
            let insertAdObj = ret[0]
            let insertAdInfo = ret[1]

            if (insertAdObj && insertAdInfo) {
                // save
                this._insertAdObj = insertAdObj
                this._insertAdInfo = insertAdInfo
    
                if (this._title) {
                    this._title.string = insertAdInfo.title
                }
    
                if (this._image && insertAdInfo.imgUrlList.length > 0) {
                    let imgUrl = insertAdInfo.imgUrlList[0]
                    cc.loader.load(imgUrl, (err, texture) => {
                        if (err) {
                            return
                        }

                        if (imgUrl === this._insertAdInfo.imgUrlList[0]) {
                            this._image.spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height))
                        }
                    })
                }
    
                if (this._desc) {
                    this._desc.string = insertAdInfo.desc
                }
    
                // report ad show
                G_OVAdv.reportNativeAdShow(insertAdObj, insertAdInfo.adId)
            }
        }
        let st = parseInt(G_Switch.getConfigByKey("intervalOfBtnMistakes")) ;
        console.log("insertAdv current st is " ,this._st,"      ",st);
        if(st < 0) {
            this._clickBtn.node.active = true;
            this.closeCBtn.node.active = false;
        } 
        else 
        {
            if(st == this._st) {
                console.log("seartch adv");
                this._clickBtn.node.active = true;
                this.closeCBtn.node.active = false;
                this._st = 0;
            } else {
                this._clickBtn.node.active = false;
                this.closeCBtn.node.active = true;
            }
        }

        //位移误触 1.3 0.1
    },

    onHide() {
    },

    onCloseTouched( btn ) {
        G_OVAdv.reportNativeAdHide()
        G_UIManager.hideUI("InsertAd")

        if(this.mManager) {
            this.mManager.node.emit("InsertAdClosed");
        }

        this.close();
    },

    onClickTouched( btn ) {
        if (this._insertAdObj && this._insertAdInfo) {
            G_OVAdv.reportNativeAdClick(this._insertAdObj, this._insertAdInfo.adId)
        }

        //G_UIManager.hideUI("InsertAd")
        this.close();

    },
    close() {
        cx_UIMgr.putNode(this.node);
        if(this.closeCb) {
            this.closeCb();
        }
    }
});
