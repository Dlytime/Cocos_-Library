/**\
 * 组件功能：继承CC.Node,根据约定数据结构imgData刷新Sprite和Animation组件，显示一张图片或动画
 * imgData = {
                    width: 96,
                    height: 96,
                    path: "https://image.game.hnquyou.com/loading_gif.png",
                    frame_count: 12
    }
    调用：var tmp = new ImageAnimation();tmp.updateImageData(imgData);node.addChild(tmp);
    修改播放速度：tmp.animSpeed = 3;
 */

var ImageAnimation = cc.Class({
    extends: cc.Node,
    properties: {
        animSpeed:{
            get(){
                return this._speed; 
            },
            set(value){
                if(typeof value == "number" && value >= 0) {
                    this._speed = value;
                    this._setAnimSpeed();
                }
            }
        },
        _defaultAnimName:"gif",
        _speed:1,
        _size:null,
        _tag:null,
    },
    ctor :function() {
        this._speed = 1;
        this._size = null;
        this._imgData = {};
        this.addComponent(cc.Sprite);
        this.addComponent(cc.Animation);
        //因Cocos一直存在的Bug，构造函数携参会报警告，new完之后必须调用updateImageData方法
        //this.updateImageData(imgData);
    },
    setSize:function(width,height) {
        if(typeof width === "number" && typeof height === "number" && width >= 0 && height >= 0) {
            this._size = cc.size(width,height);
            this._setSize();
        }
    },
    setTags:function(tag) {
        this._tag = tag;
    },
    getTags:function() {
        return this._tag;
    },
    updateImageData(imgData) {
        if(!this._imgDataCheck(imgData)) return;
        this._imgData = imgData;
        this._updateSelf();
    },
    getImgData:function() {
        return this._imgData;
    },


    _setAnimSpeed:function() {
        var anim = this.getComponent(cc.Animation);
        var animState = anim.getAnimationState(this._defaultAnimName);
        if(animState) {
            animState.speed = this._speed;
        }
    },

    _imgDataCheck:function(newImgData) {
        if(newImgData === null || newImgData === undefined || typeof newImgData !== "object" )  return false;

        /*
        //判断对象是否包含指定键
        var props = Object.getOwnPropertyNames(a);
        if(typeof props !== Array || props.length < 4) return false;
        var arr = ["width","height","path","frame_count"];
        for (let i = 0; i < arr.length; i++) {
            const value = arr[i];
            if(props.indexOf(value) < 0) return false;
        }*/
        //必须保证path有效
        if(newImgData.path === undefined || newImgData.path === null || newImgData.path === "") return false;
        //判断是否相等
        if(this._isObjectValueEqual(this._imgData,newImgData)) return false;
        return true;
    },
    _updateSelf:function() {
        var self = this;
        var imgData = this._imgData;
        var width = imgData.width;
        var height = imgData.height;
        this.setSize(width,height);
        const type = this._adjustType(imgData);
        switch(type)
        {
            case "sprite":
                this._getSpriteFrame(imgData,function(spriteframe) {
                    if(!self._isObjectValueEqual(imgData,self._imgData)) return;//检测数据是否已经更新
                    self._updateSprite(spriteframe);
                    self._updateAnimation([]);
                });
                break;
            case "gif":
                this._getSpriteFrameArr(imgData,function(SFarr){
                    if(!self._isObjectValueEqual(imgData,self._imgData)) return;
                    self._updateSprite(null);
                    self._updateAnimation(SFarr);
                 })
                break;
            default:
                break;
        }
    },
    _updateSprite:function(spriteframe) {
        if(spriteframe instanceof cc.SpriteFrame) {
            this.getComponent(cc.Sprite).spriteFrame = spriteframe;
            //cc.log("width",this.width,"height",this.height);
        }
        else {
            this.getComponent(cc.Sprite).spriteFrame = null;
        }
    },
    _updateAnimation:function(SFarr) {
        var animation = this.getComponent(cc.Animation);
        animation.stop();
        //移除clip
        let cliparr = animation.getClips();
        for (let i = 0; i < cliparr.length; i++) {
            animation.removeClip(cliparr[i]);
        }

        if(SFarr !== undefined && SFarr !== null && SFarr.length>1)
        {
            var clip = cc.AnimationClip.createWithSpriteFrames(SFarr, SFarr.length);
            clip.name = this._defaultAnimName;
            clip.wrapMode = cc.WrapMode.Loop;
            animation.addClip(clip);
            var animState = animation.play(clip.name);
            animState.speed = this._speed;
        }
    },
    _setSize:function() {
        var spr = this.getComponent(cc.Sprite);
        if(this._size === null) {
            spr.sizeMode = cc.Sprite.SizeMode.TRIMMED;
        }
        else {
            spr.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            this.width = this._size.width;
            this.height = this._size.height;
        }
    },
    _getSpriteFrameArr:function(imgData,callfunc) {
        this._loadImage(imgData.path,function(spriteframe){
            let arr = this._cutSpriteFrame(spriteframe,imgData.width,imgData.height,imgData.frame_count);
            callfunc(arr);
        }.bind(this));
    },
    _getSpriteFrame:function(imgData,callfunc) {
        this._loadImage(imgData.path,callfunc);
    },

    _loadImage:function(imgUrl,callfunc) {
        var self = this;
        var remoteUrl = imgUrl;
        cc.loader.load(remoteUrl, function (err, texture) {
            if(err) {
                return;
            }
            //cc.log("texture:",texture);
            var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
            callfunc(spriteFrame);
        });
    },

    _adjustType:function(imgData) {
        if(imgData.frame_count === 1) {
            return "sprite";
        } else if(imgData.frame_count > 1){
            return "gif";
        } else {
            cc.error("imgData wrong ,frame_count not match");
            return null;
        }
    },
    _cutSpriteFrame:function(spriteframe,width,height,count) {
        let size = spriteframe.getOriginalSize();
        let texture = spriteframe.getTexture();
        let colNum = Math.round(size.width/width);//列数
        let rowNum = Math.round(size.height/height);//行数
        let arr = [];
        let st = 0;
        for (let i = 0; i < rowNum ; i++) {
            for (let j = 0; j < colNum ; j++) {
                let newSf = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                newSf.setRect(new cc.Rect(j * width, i * height, width, height));
                arr.push(newSf);
                st++;
                if(st >= count) { 
                    return arr;
                }
            }
        }
        return arr;
    },
    //比较两对象相等，仅适用于键值非对象情况
    _isObjectValueEqual:function(a, b) {
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];
            var propA = a[propName];
            var propB = b[propName];
            if ( propA !== propB) {
                    return false;
            }
        }
        return true;
    }
});
module.exports = ImageAnimation;