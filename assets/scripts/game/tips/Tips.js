cc.Class({
    extends: Cls_BasePopup,

    properties: {
        _bg: null,
        _content: null,
        _maxContendWidth: cc.winSize.width * 0.8
    },

    onLoad() {
        // init UI
        this._initUI()

        // default
        this._doClean()
    },

    _initUI() {
        // body...
        let bg = G_UIHelper.seekNodeByName(this.node, "bg").getComponent(cc.Sprite)
        if (bg) {
            // save
            this._bg = bg
        }

        let content = G_UIHelper.seekNodeByName(this.node, "content").getComponent(cc.Label)
        if (content) {
            // save
            this._content = content
        }
    },

    onInit( content ) {
        // body...
        this._doClean()

        // fill content
        this._content.node.x = 0
        this._content.node.y = 0
        this._content.overflow = cc.Label.Overflow.NONE
        this._content.string = content
        if (cc.ENGINE_VERSION >= "2.2") {
            this._content._forceUpdateRenderData()
        }
        else {
            this._content._updateRenderData(true)
        }

        // overflow
        if (this._content.node.width > this._maxContendWidth) {
            this._content.overflow = cc.Label.Overflow.RESIZE_HEIGHT
            this._content.node.width = this._maxContendWidth
            if (cc.ENGINE_VERSION >= "2.2") {
                this._content._forceUpdateRenderData()
            }
            else {
                this._content._updateRenderData(true)
            }
        }

        // extend bg
        this._bg.node.width = this._content.node.width + 30
        this._bg.node.height = this._content.node.height + 30

        // action
        this._bg.node.runAction(
            cc.sequence(
                cc.delayTime(2.0),
                cc.callFunc(() => {
                    // body...
                    G_UIManager.hideUI("tips")
                })
            )
        )
    },

    onHide() {
        this._doClean()
    },

    _doClean() {
        // body...
        this._bg.node.stopAllActions()
    }
});
