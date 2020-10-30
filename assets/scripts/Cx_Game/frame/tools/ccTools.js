var LoadRemotePlist = require("LoadRemotePlist");
const { type } = require("os");
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
     * @param {cc.Vec2} point 转换的坐标
     */
    converToOtherNodePos:function(self,other,point) {
        point = point?point:self.position;
        let pos = self.convertToWorldSpaceAR(point);
        let final = other.parent.convertToNodeSpaceAR(pos);
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
    screenNodeShot(parent,size,position) {
        let node = this._rendNode;
        node.parent = parent;
        size = size?size:cc.size(parent.width,parent.height);
        position = position?position:cc.v2(0,0);
        node.setPosition(position);
        let camera = node.getComponent(cc.Camera);
        // 设置你想要的截图内容的 cullingMask
        camera.cullingMask = 8//0xffffffff;
        
        // 新建一个 RenderTexture，并且设置 camera 的 targetTexture 为新建的 RenderTexture，这样 camera 的内容将会渲染到新建的 RenderTexture 中。
        let texture = new cc.RenderTexture();
        let gl = cc.game._renderContext;
        // 如果截图内容中不包含 Mask 组件，可以不用传递第三个参数
        texture.initWithSize(size.width*parent.scale, size.height*parent.scale, gl.STENCIL_INDEX8);
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

    //资源加载

    /**加载本地图片 */
    loadLocalSf(path,cb,params) {
        let url = path.split(".png")[0];
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
            if(err) console.error(err);
            if(typeof cb == "function" && spriteFrame instanceof cc.SpriteFrame) {
                cb(spriteFrame,params);
            }
        });
    },

    /**加载远程服务器png图片*/
    loadRemoteSf(path,cb,params) {
        cc.loader.load(path, function (err, texture) {
            // Use texture to create sprite frame
            if(err) console.error(err);
            if(typeof cb == "function" && texture instanceof cc.Texture2D) {
                let spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                cb(spriteFrame,params);
                return;
            }
            cb(null,params);
        });
    },
    /**
     * 加载本地Json
     * @param {String} path 本地路径
     * @param {Function} cb 回调函数
     * @param {any} params 回调参数
     */
    loadLocalJson(path,cb,params){
        cc.loader.loadRes(path, function (err, object) {
            if (err) {
                console.log(err);
                return;
            }
            if(typeof cb == "function") cb(object.json,params);
            
        });
    },

    /**
     * 加载远程Json
     * @param {String} path 远程路径
     * @param {Function} cb 回调函数
     * @param {any} params 回调参数
     */
    loadRemoteJson(path,cb,params) {
        cc.loader.load({ url: path, type: 'txt' }, (error, json) => {
            if (error) {
                console.log(err);
                return;
            }
            if(typeof cb == "function") cb(json,params);
        });
    },

    /**加载本地音频 */
    loadLocalAudio(path,cb,params) {
        cc.loader.loadRes(path, cc.AudioClip, function (err, clip) {
            if(typeof cb === "function") {
                if(clip instanceof cc.AudioClip) {
                    cb(clip,params);
                } else {
                    cc.error(err);
                    cb(null,params);
                }
            }
        });
    },
    /**加载远程音频 */
    loadRemoteAudio(path,cb,params) {
        cc.loader.load(path, function (err, clip) {
            if(err) {
                console.error(err);
                if(typeof cb == "function") {
                    cb(null,params)
                }
            } 
            else if(cb && clip instanceof cc.AudioClip) {
                cb(clip,params);
            }
        });
    },

    /**动态加载预制体 */
    loadLocalPrefab(path,cb,params) {
        cc.loader.loadRes(path, function (err, prefab) {
            if(err) console.error(err);
            if(typeof cb === "function") {
                if(prefab instanceof cc.Prefab) {
                    cb(prefab,params);
                }
                else {
                    cb(null,params);
                }
            }
        });
    },

    /**加载远程预制体 */
    loadRemotePrefab(path,cb,params) {
        cc.loader.load(path, function (err, prefab) {
            if(err) console.error(err);
            debugger;
            if(typeof cb === "function") {
                if(prefab instanceof cc.Prefab) {
                    cb(prefab,params);
                }
                else {
                    cb(null,params);
                }
            }
        });
    },

    /**加载本地龙骨资源 返回 {"atlas":atlas,"asset":asset}*/
    loadLocalDragonBone(imageUrl,skeUrl,atlasUrl,cb,params) {
        cc.loader.loadRes(imageUrl, (error1, texture) => {
            cc.loader.loadRes(skeUrl/* ,dragonBones.DragonBonesAsset */, (error2, atlasJson) => {
                cc.loader.loadRes(atlasUrl/* ,dragonBones.DragonBonesAtlasAsset */, (error3, dragonBonesJson) => {
                    if(error1 || error2 || error3) {
                        console.error("dragonBones load faild: "+ imageUrl);
                        cb(null) ;
                    };
                    var atlas = new dragonBones.DragonBonesAtlasAsset();
                    atlas._uuid = atlasUrl;
                    atlas.atlasJson = dragonBonesJson.atlasJson; 
                    atlas.texture = texture;

                    var asset = new dragonBones.DragonBonesAsset();
                    asset._uuid = skeUrl;
                    asset.dragonBonesJson = atlasJson.dragonBonesJson;

                    if(typeof cb == "function") cb({"atlas":atlas,"asset":asset},params) ;
                });
            });
        });
    },

    /**加载远程龙骨资源 返回 {"atlas":atlas,"asset":asset}*/
    loadRemoteDragonBone(imageUrl,skeUrl,atlasUrl,cb,params) {
        cc.loader.load(imageUrl, (error1, texture) => {
            cc.loader.load({ url: atlasUrl, type: 'txt' }, (error2, atlasJson) => {
                cc.loader.load({ url: skeUrl, type: 'txt' }, (error3, dragonBonesJson) => {
                    if(error1 || error2 || error3) {
                        console.error("dragonBones load faild: "+ imageUrl);
                        cb(null) ;
                    };
                    var atlas = new dragonBones.DragonBonesAtlasAsset();
                    atlas._uuid = atlasUrl;
                    atlas.atlasJson = atlasJson;
                    atlas.texture = texture;

                    var asset = new dragonBones.DragonBonesAsset();
                    asset._uuid = skeUrl;
                    asset.dragonBonesJson = dragonBonesJson;

                    if(typeof cb == "function") cb({"atlas":atlas,"asset":asset},params) ;
                });
            });
        });
    },

    /**
     * 加载本地图集
     * @return {cc_SpriteAtlas}  
     */
    loadLocalPlist(path,cb,params) {
        cc.loader.loadRes(path, cc.SpriteAtlas, function (err, atlas) {
            if(err) console.error(err);
            if(typeof cb === "function") {
                if(atlas) {
                    cb(atlas,params);
                }
                else {
                    cb(null,params);
                }
            }
        });
    },

    /**
     * 加载远程图集
     * @return {cc_SpriteAtlas}  
     */
    loadRemotePlist(path,cb,params) {
        LoadRemotePlist(path,(err, atlas)=>{
            if(err) console.error(err);
            if(typeof cb === "function") {
                if(atlas) {
                    cb(atlas,params);
                }
                else {
                    cb(null,params);
                }
            }
        });
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