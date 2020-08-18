/**音频管理 */
var AudioManager = class AudioManager{
    static _instance = null;
    static _getInstance() {
        if(AudioManager._instance) {
            return AudioManager._instance;
        } else {
            return new AudioManager();
        }
    }
    constructor() {
       this._bgmUrl = "sound/bgm";
       this._bgmAudioID = null;
       this._bgmClip = null;
       this._audioIdObj = {};
       //this.
    }
    playMusic() {
        //return;
        if(cx_DyDataMgr.getAudio()) {
            console.log("do playMusic");
            let self = this;
            if(self._bgmClip === null) {
                let clip = cx_DyDataMgr.getAuidoClip("bgm");
                self._bgmAudioID = cc.audioEngine.play(clip, true, 0.5);
                self._bgmClip = clip;
            }
            else if(self._bgmAudioID === null) {
                self._bgmAudioID = cc.audioEngine.play(self._bgmClip, true, 0.5);
            }
            else{
                var state = cc.audioEngine.getState(this._bgmAudioID);
                console.log("do playMusic state is",state);
                if(state === cc.audioEngine.AudioState.PAUSED) {
                    console.log("go on do playMusic ");
                    cc.audioEngine.resumeMusic();
                }
                else if(state === cc.audioEngine.AudioState.PLAYING) {
                    return;
                }
                else {
                    //return;
                    this.stopMusic();
                    console.log("restart playMusic ");
                    self._bgmAudioID = cc.audioEngine.play(self._bgmClip, true, 0.5);
                }
                cc.audioEngine.setVolume(self._bgmAudioID,1);
            }

        }
    }
    stopMusic() {
        if(this._bgmAudioID !== null && this._bgmAudioID !== undefined) {
            cc.audioEngine.stop(this._bgmAudioID);
            this._bgmAudioID = null;
        }
    }
    stopAllMusic() {
        cc.audioEngine.stopAll();
        this._bgmAudioID = null;
    }
    pauseMusic() {
        cc.audioEngine.pauseMusic();
    }
   
    playPreEffect(name,loop,volume) {
        let clip = cx_DyDataMgr.getAuidoClip(name);
        this.playEffect(clip,loop,volume);
    }
    playEffect(clip,loop,volume) {
        
        if(clip && cx_DyDataMgr.getAudio()) {
            let id = null;
            if(this._audioIdObj[clip.nativeUrl]) {
                id = this._audioIdObj[clip.nativeUrl].id;
                cc.audioEngine.setVolume(id,volume||0.5);
            }else {
                id = cc.audioEngine.playEffect(clip,!!loop);
                if(loop) {
                    this._audioIdObj[clip.nativeUrl] = id;
                    this._audioIdObj[clip.name] = id;
                }
                volume =  typeof volume == "number"?volume:0.5;
                cc.audioEngine.setVolume(id,volume);
            }
        }
    } 
    setVolume(clip,volume) {
        let id = this._audioIdObj[clip.nativeUrl];
        if(id) {
            cc.audioEngine.setVolume(id,volume||0.5);
        }
    }
    addVolume(clip,num) {
        let id = this._audioIdObj[clip.nativeUrl];
        if(id) {
            let volume = cc.audioEngine.getVolume(id);
            cc.audioEngine.setVolume(id,volume + num ||0);
        }
    }
    stopPreEffect(name) {
        let clip = cx_DyDataMgr.getAuidoClip(name);
        this.stopEffect(clip);
    }
    stopEffect(clip) {
        if(clip) {
            let id = this._audioIdObj[clip.nativeUrl];
            if(id || id === 0) {
                cc.audioEngine.stop(id);
                delete this._audioIdObj[clip.nativeUrl];
            }
        }
    }
}
module.exports = AudioManager._getInstance();