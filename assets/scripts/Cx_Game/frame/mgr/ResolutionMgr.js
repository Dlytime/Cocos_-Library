/**分辨率适配管理 */

var ResolutionManager = class ResolutionManager{
    static _instance = null;
    static _getInstance() {
        if(ResolutionManager._instance) {
            return ResolutionManager._instance;
        } else {
            return new ResolutionManager();
        }
    }
    constructor() {
        
    }
    setTop(topWidth) {
        if(!topWidth) return;
        let size = cc.view.getFrameSize();
        let widget = topWidth;
        widget.top = 0;
        let bl = size.height/size.width;
        //console.log("当前屏幕比例："+bl);
        /*if(bl > 1.8 && bl <= 2) {
            widget.top = 50;
        }
        else */if(bl > 1.8) {
            widget.top = 75;
        } else {
            widget.top = 0;
        }
    }
    setDown(downWidth) {

    }
}
module.exports = ResolutionManager._getInstance();