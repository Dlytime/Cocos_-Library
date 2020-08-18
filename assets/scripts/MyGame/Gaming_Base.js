cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },
    /**
     * 
     * @param {cc.Node} camera 摄像头
     * @param {cc.Node} followNode 跟随节点
     * @param {cc.Vec2} startPos 镜头起始位置
     * @param {cc.Rect} area 镜头活动矩形区域
     * @param {Number} speed 镜头跟随速度(若为空，则默认与followNode速度一致)
     */
    setCameraFollow(camera,followNode,startPos,area,speed) {
        this._followCamera = camera;
        this._followNode = followNode;
        this._followArea = area;
        this._followSpeed = speed;
        camera.setPosition(startPos);
    },
    /**开启镜头跟随*/
    openCameraFollow() {
        this._isCameraFollow = true;
    },
    /**关闭镜头跟随 */
    closeCameraFollow() {
        this._isCameraFollow = false;
    },
    _doCameraFollow(dt) {
        let camera = this._followCamera;
        let node = this._followNode;
        let area = this._followArea;
        let speed = this._followSpeed;

        if(!speed)
        {
               
        }
    },
    update (dt) {
        if(this._isCameraFollow) {
            this._doCameraFollow(dt);
        }
    },
});
