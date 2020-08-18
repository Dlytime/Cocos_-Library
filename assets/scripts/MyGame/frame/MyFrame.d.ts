/**
 *原生JS工具类 
 */
declare class cx_jsTools {
    /**
     * 获取从min~max随机整数
     * @param {Number} min 最小值
     * @param {Number} max 最大值
     */
    static getRandomNum(min:Number,max:Number):Number;

    /**深度拷贝对象或数组 */
    static deepCopy(o);

    /**
    * 获取角度对应的单位向量
    * @param {Number} angle 
    */
   static getDirByAngle(angle:number):cc.v2;

    /**
     * 获取dir对应的angle
     * @param {cc.v2} dir 单位向量
     */
    static getAngleByDir(dir:cc.Vec2):Number
}
/**
 *基于Cocos Creator的工具类 
 */
declare class cx_ccTools {
    /**
     * 获取自身节点下的坐标点在另一个节点下的坐标
     * @param {cc.Node} self 自身节点
     * @param {cc.Node} other 目标节点
     * @param {cc.Vec2}} point 转换的坐标
     */
    static converToOtherNodePos:function(self,other,point);

    /**
	* 遍历查找指定名称的节点
	* @param {cc.Node} node 根节点
	* @param {String} name 待查找节点名
	*/
	static seekNodeByName: function (node, name)
}
/**
 * 运行数据类
 */
declare class cx_DyData {
    static ACTOR_STATE:cc.Enum<Idle>;
    static ACTOR_DIR:cc.Enum<Left,Right,Up,LeftUp,RightUp>;
}
/**
 * 运行数据方法类
 */
declare class cx_DyDataMgr {

}
/**
 * 资源加载类
 */
declare class cx_LoaderMgr {

}
/**
 * 音频管理类
 */
declare class cx_AudioMgr {

}