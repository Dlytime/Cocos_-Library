var ImageAnimation = cc.Class({
    name: "ImageAnimation",
    extends: cc.Node,

    properties: {
        animSpeed: {
            get() {
                return this._speed
            },
            set(value) {
                if(typeof value === "number" && value >= 0) {
                    this._speed = value
                    this._setAnimSpeed()
                }
            }
        },
        _defaultAnimName: {
            default: "gif"
        },
        _speed: {
            default: 1,
            type: cc.Float
        },
        _size: {
            default: null
        },
        _imgData: {
            default: {},
            type: cc.Object
        }
    },

    ctor() {
        this.name = "ImageAnimation"
        this.addComponent(cc.Sprite)
        this.addComponent(cc.Animation)
    },

    setSize(width, height) {
        if(typeof width === "number" && typeof height === "number" && width >= 0 && height >= 0) {
            this._size = cc.size(width, height)
            this._updateSize()
        }
    },

    setImageData(imgData) {
        if(!this._checkImgData(imgData)) return
        this._imgData = imgData
        this._updateSelf()
    },

    getImgData() {
        return this._imgData
    },

    _checkImgData(imageData) {
        if(!imageData || typeof imageData !== "object") return false
        
        if(this._isTwoObjectsEqual(this._imgData, imageData)) return false

        return true
    },

    _setAnimSpeed() {
        let anim = this.getComponent(cc.Animation)
        let animState = anim.getAnimationState(this._defaultAnimName)

        if(animState) {
            animState.speed = this._speed
        }
    },

    _updateSelf() {
        let self = this
        let imgData = this._imgData

        const type = this._getImageDataType(imgData)
        switch(type)
        {
            case "sprite":
                this._getSpriteFrame(imgData, spriteframe => {
                    if(!self._isTwoObjectsEqual(imgData, self._imgData)) return
                    self._updateSprite(spriteframe)
                    self._updateAnimation([])
                })
                break

            case "gif":
                this._getSpriteFrameArr(imgData, spriteframes => {
                    if(!self._isTwoObjectsEqual(imgData, self._imgData)) return
                    self._updateSprite(null)
                    self._updateAnimation(spriteframes)
                })
                break

            default:
                break
        }
    },

    _updateSprite(spriteframe) {
        if(spriteframe instanceof cc.SpriteFrame) {
            this.getComponent(cc.Sprite).spriteFrame = spriteframe
        }
        else {
            this.getComponent(cc.Sprite).spriteFrame = null
        }
    },

    _updateAnimation(spriteframes) {
        let animation = this.getComponent(cc.Animation)
        animation.stop()

        let clips = animation.getClips()
        for (let i = 0; i < clips.length; i++) {
            animation.removeClip(clips[i])
        }

        if(spriteframes && spriteframes.length > 1) {
            let clip = cc.AnimationClip.createWithSpriteFrames(spriteframes, spriteframes.length)
            clip.name = this._defaultAnimName
            clip.wrapMode = cc.WrapMode.Loop
            animation.addClip(clip)

            // play with speed
            let animState = animation.play(clip.name)
            animState.speed = this._speed
        }
    },

    _updateSize() {
        let spr = this.getComponent(cc.Sprite)

        if(this._size === null) {
            spr.sizeMode = cc.Sprite.SizeMode.TRIMMED
        }
        else {
            spr.sizeMode = cc.Sprite.SizeMode.CUSTOM

            // set size
            this.width = this._size.width
            this.height = this._size.height
        }
    },

    _getSpriteFrameArr(imgData, cb) {
        this._loadImage(imgData.path, spriteframe => {
            let arr = this._cutSpriteFrame(spriteframe, imgData.width, imgData.height, imgData.frame_count)

            if (typeof cb === "function") {
                cb(arr)
            }
        })
    },

    _getSpriteFrame(imgData, cb) {
        this._loadImage(imgData.path, cb)
    },

    _loadImage(imgUrl, cb) {
        let remoteUrl = imgUrl
        cc.loader.load(remoteUrl, (err, texture) => {
            if(err || texture.url !== imgUrl) {
                return
            }
            
            let spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height))
            if (typeof cb === "function") {
                cb(spriteFrame)
            }
        })
    },

    _getImageDataType(imgData) {
        if(imgData.frame_count === 1) {
            return "sprite"
        }
        else if(imgData.frame_count > 1) {
            return "gif"
        }
        else {
            cc.error("imgData wrong, frame_count not match...")
            return null
        }
    },

    _cutSpriteFrame(spriteframe, width, height, count) {
        let size = spriteframe.getOriginalSize()
        let texture = spriteframe.getTexture()
        let colNum = Math.round(size.width / width)
        let rowNum = Math.round(size.height / height)
        let arr = []
        let index = 0

        for (let i = 0; i < rowNum; i++) {
            for (let j = 0; j < colNum; j++) {
                let sp = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height))
                sp.setRect(new cc.Rect(j * width, i * height, width, height))
                arr.push(sp)

                index++
                if(index >= count) { 
                    return arr
                }
            }
        }

        return arr
    },

    _isTwoObjectsEqual(a, b) {
        let a_keys = Object.getOwnPropertyNames(a)
        let b_keys = Object.getOwnPropertyNames(b)

        if (a_keys.length != b_keys.length) {
            return false
        }

        for (let i = 0; i < a_keys.length; i++) {
            let key = a_keys[i]
            let propA = a[key]
            let propB = b[key]
            if (propA !== propB) {
                return false
            }
        }

        return true
    }
});

// export
module.exports = ImageAnimation