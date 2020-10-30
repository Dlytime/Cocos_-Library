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
    static getAngleByDir(dir:cc.Vec2):Number;

    /**
     * 获取当前时间
     * @param {String} exact 获取时间精确度exact(年:y,月:M,日:d,时:h,分:m,秒:s), 格式 yyyy-MM-dd HH:mm:ss
     */
    static getCurTime(exact:String):String;

    /**
     * 获取两个时间的时间间隔
     * @param {Date} startDate 起始日期(字符串自动转日期)
     * @param {Date} endDate 结束日期
     * @param {String} exact 返回精确度(d,h,m,s,ms)
     */
    static getTwoDateInterval(startDate:Date,endDate:Date,exact:string):Number;


    /**
     * 日期加减计算
     * @param {Date} date 日期
     * @param {number} num 数值
     * @param {string} type 类型(y,M,d,h,m,s)
     * @param {string} exact 返回值精确度(y,M,d,h,m,s)
     */
    static dateCount(date:Date,num:Number,type:String,exact:String):String;

    /**
     * 日期格式转字符串
     * @param date 日期
     * @param fmt 转换之后精确度(y,M,d,h,m,s)
     */
    static timeFormat(date:Date,fmt:String):String;

    static getCurMonth():Number;
    static getCurYear():Number;
    static getCurDay():Number;
    static getCurHour():Number;
    static getCurMin():Number;
    static getCurSeconds():Number;
}
/**
 *基于Cocos Creator的工具类 
 */
declare class cx_ccTools {
    /**
     * 获取自身节点下的坐标点在另一个节点下的坐标
     * @param self 自身节点
     * @param other 目标节点
     * @param point 转换的坐标
     */
    static converToOtherNodePos(self:cc.Node,other:cc.Node,point:cc.Vec2):cc.Vec2;

    /**
	* 遍历查找指定名称的节点
	* @param node 根节点
	* @param name 待查找节点名
	*/
    static seekNodeByName(node:cc.Node, name:String):cc.Node;
    
    /**
     * 截屏
     * @param parent 截图父节点
     * @param size (默认为父节点)尺寸大小
     * @param position (默认cc.v2(0,0))中心位置
     */
    static screenNodeShot(parent:cc.Node,size:cc.Size,position:cc.Vec2):cc.SpriteFrame;

    /**裁切图片 */
    static cutSpriteFrameByRect(spriteframe:cc.SpriteFrame,rect:cc.Rect):cc.SpriteFrame;

    /**根据图片数组获得帧动画clip */
    static getAnimClipBySfs(sfarr:Array<cc.SpriteFrame>,clipName:String,loop:Boolean,rate:Number,speed:Number):cc.AnimationClip;

    /**加载本地图片 */
    static loadLocalSf(path:String,cb:Function,params:any);

    /**加载本地Json */
    static loadLocalJson(path:String,cb:Function,params:any);

    /**加载本地音频 */
    static loadLocalAudio(path:String,cb:Function,params:any);

    /**加载本地龙骨资源 返回 {"atlas":atlas,"asset":asset} */
    static loadLocalDragonBone(imageUrl,skeUrl,atlasUrl,cb);

    /**加载本地图集,返回cc_SpriteAtlas */
    static loadLocalPlist(path:String,cb:Function,params:any);


    /**加载远程图片 */
    static loadRemoteSf(path:String,cb:Function,params:any);

    /**加载远程Json */
    static loadRemoteJson(path:String,cb:Function,params:any);

    /**加载远程音频 */
    static loadRemoteAudio(path:String,cb:Function,params:any);

    /**加载远程龙骨资源 返回 {"atlas":atlas,"asset":asset} */
    static loadRemoteDragonBone(imageUrl,skeUrl,atlasUrl,cb);

    /**加载远程图集,返回cc_SpriteAtlas */
    static loadRemotePlist(path:String,cb:Function,params:any);
}
/**
 * 运行数据类
 */
declare class cx_DyData {
    /**内部版本号 */
    static version:String;
    /**当前是否为提审版 */
    static isPatch:Boolean;
    /**玩家是否为首次加入游戏 */
    static isFirstJoinGame:Boolean;
    /**玩家是否为当天首次加入游戏 */
    static isDayFirstJoinGame:Boolean;
    /**当前是否在播放视频中 */
    static isVideoPlaying:Boolean;
    static GAME_RESULT:cc.Enum;
    /**个人存储数据默认配置 */
    static defaultPersonCg:Object;
    /**游戏内容配置数据 */
    static gameConfig:Object;
    static isClickMistake:Boolean;
    static isMoveMistake:Boolean;
    static isBtnMistake:Boolean;
    static isExitMistake:Boolean;
    /**本次游戏开始已经跳转过的其它游戏 */
    static clickedDcAdvArr:Array<Object>;
    /**远程资源服务器默认地址 */
    static remotePath:String;
    /**本地资源存放默认地址 */
    static localPath:String;
    static dyResourceName:Array;
    static dyResourceSg:Object;
    static dyResourceCg:Object;
}
/**
 * 运行数据方法类
 */
declare class cx_DyDataMgr {
    /**更新主界面常驻数据(体力,金币) */
    static updateCounts();
    /**将关卡调为(默认下一)level关 */
    static goNextLevel(level:Number);
    /**获取狂点误触配置 */
    static getClickMistake():String;
    /**获取位移误触配置 */
    static getMoveMistake():String;
    /**获取按钮误触配置 */
    static getBtnMistake():String;
    /**获取退出页误触 */
    static getExitMistake():Boolean;

    /**获取当前即将进入关卡或当前正在进行关卡 */
    static getCurrentLevel():Number;

    /**获取当前玩家玩过的最大关卡 */
    static getPlayerMaxLevel():Number;
    /**获取界面显示关卡(根据不同游戏更改) */
    static getShowLevel():Number;
    /**获取上一次已完成关卡 */
    static getFormLevel():Number;
    /**获取上一次已经完成关卡金币奖励 */
    static getAwardGold():Number;

    /**获取(默认当前)关卡体力值消耗 */
    static getLevelPowerCost(level);
    /**设置个人存储信息 */
    static setPersonData(key,value);
    /**获取个人存储信息 */
    static getPersonData(key);
    /**获取(默认当前)关卡数据 */
    static getLevelData(level):Object;
    /**获取关卡数量 */
    static getLevelCount():Number;

    /**获取玩家拥有金币 */
    static getGold():Number;
    /**获取玩家拥有体力 */
    static getPower():Number;
    /**设置音频播放状态 */
    static setAudioStatus(status:Boolean);
    /**获取音频设置状态*/
    static getAudioStatus():Boolean;
    /**设置震动状态 */
    static setShakeStatus(status:Boolean);
    /**获取震动设置状态*/
    static getShakeStatus():Boolean;

    /**设置局结束信息(result(win,lose),isthreeAward(true,false),joinType(1 直接加入，2 返回首页)) */
    static setRoundInfo(key,value);
    /**获取局结束信息(result(win,lose),isthreeAward(true,false),joinType(1 直接加入，2 返回首页)) */
    static getRoundInfo(key):String;
    /**获取最新完成局游戏结果(win,lose) */
    static getResult():String;

    static setGold(value);
    static setPower(value);
    static addGold(value);
    static addPower(value);

    /**
     * 获取预加载资源(依据dyResourceSg)
     * @param type 类型(sf,json,audio,prefab,dragonBones,plist)
     * @param name 名字
     */
    static getPreResource(type,name):Object;
    static storage()
    static delyStorage()
}
/** 
 * 资源加载类
 */
declare class cx_LoaderMgr {
    /**
     * 资源预加载(加载完成后资源自动放入 dyResourceSg)
     * @param arrCg 加载数组对象(格式对应DyData dyResourceCg)
     * @param resType 资源类型(sfs,json,plist,audio,prefab,dragonBones)
     * @param loadType 加载类型(local,remote)
     * @param tag 加载标签(若不为空，则只加载该标签资源)
     */
    static preLoadResource(arrCg:Array,resType,loadType,tag);

    /**
     * 资源是否还在加载中
     * @param resType 资源类型
     */
    static isPreLoading(resType):Boolean;

    /**获取资源加载信息        
     * {
            "totalCounts":0,"loadCounts":0,"completeCounts":0,
            "sfs":{"loadCounts":0,"successList":[],"failedList":[]},
            "plist":{"loadCounts":0,"successList":[],"failedList":[]},
            "json":{"loadCounts":0,"successList":[],"failedList":[]},
            "audio":{"loadCounts":0,"successList":[],"failedList":[]},
            "prefab":{"loadCounts":0,"successList":[],"failedList":[]},
            "dragonBones":{"loadCounts":0,"successList":[],"failedList":[]},
        } */
    static getPreLoadResult():Object;

    /**内部资源加载(只传相对路径,无需后缀,不支持龙骨) */
    static loadRes(resType,loadType,path,cb);

    /**内部龙骨加载(相对路径)*/
    static loadDragonBone(imageUrl,skeUrl,atlasUrl,cb,params)

    /**预加载龙骨赋予 */
    static getDragonBone(name:String,node:cc.Node):dragonBones.ArmatureDisplay;
}
/**
 * 音频管理类
 */
declare class cx_AudioMgr {
    /**播放预加载音效 */
    static playPreEffect(name,loop,volume);
} 
/**
 * UI管理类
 */
declare class cx_UIMgr {
    static getNodeJs(prefab):NodeJs;
    static getNode(prefab):cc.Node;

    /**获取预加载预制体对象 */
    static getPreNodeJs(name):NodeJs;

    /**获取预加载预制体节点 */
    static getPreNode(name):NodeJs;

    /**回收节点 */
    static putNode(node);

    /**回收一组节点 */
    static putNodeArr(arr:Array<cc.Node>);
}  
/**
 * 广告管理类
 */
declare class cx_AdvMgr {
    static showBanner();
    static hideBanner();

    static showVideo(resultCb,errorCb);
    static showBoxAd(cb);

}

/**
 * 广告管理类
 */
declare class cx_TimeMgr {
    /**
     * 延时dt秒执行函数
     * @param dt 延时
     * @param cb 回调函数
     * @param mManager 管理域
     * @param params 回调参数
     */
    static delayFunc(dt:Number,cb:Function,mManager:Object,params:any)
}

/**
 * 趣游框架管理类
 */
declare class cx_QyMgr {
    static share(cb);

    /**震动 true(长震动) false(短震动)*/
    static shake(type);

    /**
     * 获取当前平台名字：win,wx,qq,oppo,vivo,tt
     */
    static getPlatName()
}

/**
 * 趣游对话框管理类
 */
declare class cx_QyDlgMgr {
    /**游戏结束对话框自动流程(win,lose,break) */
    static autoGameEndDlg(type);

    static showTips(msg)

    /**
     * 显示对话框(流程：先找show_name_plat，不存在则自动添加流程:先找预制体name_plat，不存在则使用默认name)
     * @param {string} name 名字(确保脚本名和预制体名一致)
     * @param {Object} mManager 管理者(可选)
     * @param {Object} info 附带信息(可选)
     */
    static showDlg(name,mManager,info)
}