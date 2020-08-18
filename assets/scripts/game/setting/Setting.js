cc.Class({
    extends: Cls_BasePopup,

    properties: {
    },

    onLoad () {
        // init UI
        this._initUI()
    },

    _initUI: function () {
        // body...
        let closeBtn = G_UIHelper.seekNodeByName(this.node, "closeBtn").getComponent(cc.Button)
        if (closeBtn) {
            closeBtn.node.on('click', this.onCloseTouched, this)
        }

        let shareBtn = G_UIHelper.seekNodeByName(this.node, "shareAppBtn").getComponent(cc.Button)
        if (shareBtn) {
            shareBtn.node.on('click', this.onShareTouched, this)

            // visible
            shareBtn.node.active = G_Share.isSupport()
        }

        let soundSwitchBtn = G_UIHelper.seekNodeByName(this.node, "soundSwitchBtn").getComponent(cc.Button)
        if (soundSwitchBtn) {
            soundSwitchBtn.node.on('click', this.onSoundSwitchTouched, this)

            // init
            this._initSwitchBtn(soundSwitchBtn)
            soundSwitchBtn.setWitchState(G_SoundMgr.isSoundEnable())
        }

        let muteSwitchBtn = G_UIHelper.seekNodeByName(this.node, "muteSwitchBtn").getComponent(cc.Button)
        if (muteSwitchBtn) {
            muteSwitchBtn.node.on('click', this.onMuteSwitchTouched, this)

            // init
            this._initSwitchBtn(muteSwitchBtn)
            muteSwitchBtn.setWitchState(G_PlayerInfo.isMuteEnable())

            // visible
            G_UIHelper.seekNodeByName(this.node, "muteIcon").active = G_PlatHelper.isSupportVibratePhone()
            G_UIHelper.seekNodeByName(this.node, "muteText").active = G_PlatHelper.isSupportVibratePhone()
            G_UIHelper.seekNodeByName(this.node, "muteSwitchBtn").active = G_PlatHelper.isSupportVibratePhone()
        }
    },

    _initSwitchBtn( switchBtn ) {
        switchBtn.setWitchState = function ( isOn ) {
            if (switchBtn._isOn !== isOn) {
                switchBtn._isOn = isOn

                if (isOn) {
                    cc.loader.loadRes("game/popup/setting/on_btn", cc.SpriteFrame, function(err, spriteFrame) {
                        if (switchBtn._isOn) {
                            switchBtn.node.getComponent(cc.Sprite).spriteFrame = spriteFrame
                        }
                    })
                }
                else {
                    cc.loader.loadRes("game/popup/setting/off_btn", cc.SpriteFrame, function(err, spriteFrame) {
                        if (!switchBtn._isOn) {
                            switchBtn.node.getComponent(cc.Sprite).spriteFrame = spriteFrame
                        }
                    })
                }
            }
        }

        switchBtn.getWitchState = function () {
            return switchBtn._isOn
        }

        // default
        switchBtn.setWitchState(false)
    },

    onCloseTouched( btn ) {
        G_UIManager.hideUI("setting")
    },

    onShareTouched( btn ) {
        // share
        G_Share.share(G_ShareScene.SS_SHARE_APP, null, false, function (bSucc) {
            // body...
            if (bSucc) {
                // succ
                console.log("share app succ...")
            }
        })
    },

    onSoundSwitchTouched( btn ) {
        if (G_SoundMgr.isSoundEnable()) {
            G_SoundMgr.setSoundEnable(false)
        }
        else {
            G_SoundMgr.setSoundEnable(true)
        }
        btn.setWitchState(G_SoundMgr.isSoundEnable())
    },

    onMuteSwitchTouched( btn ) {
        if (G_PlayerInfo.isMuteEnable()) {
            G_PlayerInfo.setMuteEnable(false)
        }
        else {
            G_PlayerInfo.setMuteEnable(true)
        }
        btn.setWitchState(G_PlayerInfo.isMuteEnable())
    }
});
