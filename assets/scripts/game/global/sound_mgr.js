var _SoundMgr = (function () {
	var _instance;

	function init() {
		// body...
		console.log('Init G_SoundMgr Instance...')

		var _bgmAudioClip = null
		var _bgmAudioID = 0
		var _playingEffectID = {}

		var _init = function () {
			// body...
			if (G_PlatHelper.getPlat()) {
				if (G_PlatHelper.getPlat().onAudioInterruptionBegin) {
					G_PlatHelper.getPlat().onAudioInterruptionBegin(function () {
						// pause all sounds
						cc.audioEngine.pauseAll()
					})
				}

				if (G_PlatHelper.getPlat().onAudioInterruptionEnd) {
					G_PlatHelper.getPlat().onAudioInterruptionEnd(function () {
						// resume all sounds
						cc.audioEngine.resumeAll()
					})
				}
			}
		}

		return {
			init: function () {
				// init
				_init()
			},

			playMusic: function ( bgmClip ) {
				// body...
				this.stopMusic()

				// save
				if (bgmClip) {
					_bgmAudioClip = bgmClip
				}

				if (bgmClip && G_PlayerInfo.isSoundEnable()) {
					// allow play
					_bgmAudioID = cc.audioEngine.playMusic(bgmClip, true)
				}
			},

			stopMusic: function () {
				// body...
				if (_bgmAudioClip !== null) {
					cc.audioEngine.stop(_bgmAudioID)
					_bgmAudioClip = null
					_bgmAudioID = 0
				}
			},

			playSound: function ( effectClip, isLoop = false ) {
				// body...
				if (G_PlayerInfo.isSoundEnable()) {
					_playingEffectID[effectClip.name] = cc.audioEngine.playEffect(effectClip, isLoop)
				}
			},

			stopSound: function ( effectClip ) {
				// body...
				if (effectClip && typeof _playingEffectID[effectClip.name] !== "undefined") {
					cc.audioEngine.stop(_playingEffectID[effectClip.name])
					delete _playingEffectID[effectClip.name]
				}
			},

			pauseMusic: function () {
				cc.audioEngine.pauseMusic()
			},

			resumeMusic: function () {
				if (G_PlayerInfo.isSoundEnable()) {
					if (_bgmAudioClip !== null) {
						cc.audioEngine.resumeMusic()
					}
				}
			},

			setSoundEnable: function ( isEnabled ) {
				// body...
				if (G_PlayerInfo.isSoundEnable() !== isEnabled) {
					G_PlayerInfo.setSoundEnable(isEnabled)

					if (isEnabled && _bgmAudioClip !== null) {
						this.playMusic(_bgmAudioClip)
					}
				}
			},

			isSoundEnable: function () {
				return G_PlayerInfo.isSoundEnable()
			}
		};
	}

	return {
		getInstance: function () {
			if ( !_instance ) {
				_instance = init();
			}

			return _instance;
		}
	};
})();

// global
window.G_SoundMgr = _SoundMgr.getInstance()
