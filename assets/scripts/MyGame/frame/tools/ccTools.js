var ccTools = cc.Class({
    extends: cc.Component,
    ctor() {
        let node = new cc.Node("rend");
        let canmera = node.addComponent(cc.Camera);
        canmera.enabled = false;
        //canmera.cullingMask = 8;
        node.width = 10;
        node.height= 10;
        this._rendNode = node;
    },
    /**
     * 获取自身节点下的坐标点在另一个节点下的坐标
     * @param {cc.Node} self 自身节点
     * @param {cc.Node} other 目标节点
     * @param {cc.Vec2}} point 转换的坐标
     */
    converToOtherNodePos:function(self,other,point) {
        let pos = self.convertToWorldSpaceAR(point);
        let final = other.convertToNodeSpaceAR(pos);
        return final;
    },
    /**
	* 遍历查找指定名称的节点
	* @param {cc.Node} node 
	* @param {string} name 
	*/
	seekNodeByName: function (node, name) {
		// body...
		if (node.name === name) return node
			var c = undefined
			node.children.forEach(element => {
			    if (!c) c = this.seekNodeByName(element, name)
			})
			return c;
    },
    delayFunc(node,mManager,st,cb) {
        node.runAction(cc.sequence(
            cc.delayTime(st),
            cc.callFunc(cb,mManager)
        ))
    },
    screenNodeShot(parent,info) {
        let node = this._rendNode;
        node.parent = parent;
        node.setPosition(cc.v2(0,400));
        //node.parent = cc.director.getScene();
        let camera = node.getComponent(cc.Camera);
        // 设置你想要的截图内容的 cullingMask
        camera.cullingMask = 8//0xffffffff;
        
        // 新建一个 RenderTexture，并且设置 camera 的 targetTexture 为新建的 RenderTexture，这样 camera 的内容将会渲染到新建的 RenderTexture 中。
        let texture = new cc.RenderTexture();
        let gl = cc.game._renderContext;
        // 如果截图内容中不包含 Mask 组件，可以不用传递第三个参数
        texture.initWithSize(parent.width*parent.scale, parent.height*parent.scale, gl.STENCIL_INDEX8);
        camera.targetTexture = texture;
        // 渲染一次摄像机，即更新一次内容到 RenderTexture 中
        camera.render();
        let newSf = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
        return newSf;
    },
    /**
     * 将一张大图按约定顺序裁切成等大小的小图(一般用于帧动画,目前仅支持先从左往右，再从上往下排列)
     * @param {cc.SpriteFrame} spriteframe 
     * @param {cc.size} cellSize 裁切的每张图片尺寸
     * @param {Number} count 裁切的图片数量
     */
    cutSpriteFrame:function(spriteframe,cellSize,count,initPos) {
        initPos = initPos || cc.v2(0,0);
        let size = spriteframe.getOriginalSize();
        let texture = spriteframe.getTexture();
        let colNum = Math.round(size.width/cellSize.width);//列数
        let rowNum = Math.round(size.height/cellSize.height);//行数
        let arr = [];
        let st = 0;
        for (let i = 0; i < rowNum ; i++) {
            for (let j = 0; j < colNum ; j++) {
                let newSf = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                newSf.setRect(new cc.Rect(j * cellSize.width + initPos.x, i * cellSize.height+initPos.y, cellSize.width, cellSize.height));
                arr.push(newSf);
                st++;
                if(st >= count) { 
                    return arr;
                }
            }
        }
        return arr;
    },

    /**
     * 裁切出一张图上的rect区域，返回sf
     * @param {cc.SpriteFrame} spriteframe 
     * @param {cc.Rect} rect 
     */
    cutSpriteFrameByRect:function(spriteframe,rect) {
        let texture = spriteframe.getTexture();
        let newSf = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
        newSf.setRect(rect);
        return newSf;
    },

     /**
      * 根据图片数组生成动画clip
      * @param {Array<cc.SpriteFrame>} sfarr 图片数组
      * @param {String} clipName 动画名字
      * @param {Bollon} loop 是否循环播放
      * @param {Number} rate 帧率(可选，默认为图片数量)
      * @param {Number} speed 播放速度(可选，默认为1)
      */
    getAnimClipBySfs:function(sfarr,clipName,loop,rate,speed) {
        if(!sfarr || sfarr.length < 1) return;
        var clip = cc.AnimationClip.createWithSpriteFrames(sfarr, rate || sfarr.length);
        clip.name = clipName;
        if(loop) clip.wrapMode = cc.WrapMode.Loop;
        if(speed) clip.speed = speed;
        return clip;
    },

    /**
     * 将图集Json中的坐标信息转换为Rect
     * @param {Object} point 
     */
    transPlistPointToRect:function(point,size){
        return cc.v2(point.x,point.y - size.height)
    },

    transToVec2:function(value) {
        if( value instanceof Array) {
            let arr = [];
            for (let i = 0; i < value.length; i++) {
                const p = value[i];
                arr.push(cc.v2(p.x,p.y));
            }
            return arr;
        } else {
            return cc.v2(value.x,value.y);
        }
    },
});
var _instance = null;
var getInstance = function() {
    if(!_instance) {
        _instance = new ccTools();
    } 
    return _instance;
}
module.exports = getInstance();