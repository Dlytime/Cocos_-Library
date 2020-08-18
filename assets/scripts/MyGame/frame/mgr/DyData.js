var data = 
{
    //通用存储变量
    roundResult:"lose",
    backGameType:null,
    threeAward:null,

    //通用定义变量
    GAME_RESULT:cc.Enum({
        "win":"win",
        "lose":"lose",
        "break":"break"
    }),

    //游戏特殊
    ACTOR_STATE: cc.Enum({
        Idle:1,//站立
        Run:2,//跑
        Jump:3,//跳跃
        Defense:4,//防御
        Attack:5,
        //Attack_bt:6,//攻击(霸体,不可被打断)
        Attacked:7,//被攻击(硬直)
        HitFly:8//被击飞
    }),
    ACTOR_ADD_STATE:cc.Enum({
        JumpFire:"JumpFire",//空中释放
        Bt:"Bt"//霸体
    }),
    ACTOR_DIR:cc.Enum({
        Left:1,
        Right:2,
        Up:3,
        LeftUp:4,
        RightUp:5
    }),

    actorNameArr:["leopard","doctor" ,"captain","giant","lron" /* ,"spider" */],
    actorCnName:{"leopard":"黑豹","doctor":"奇异博士","captain":"美国队长","giant":"绿巨人","lron":"钢铁侠","spider":"蜘蛛侠"},
    maxHp:2800,
    maxAttack:500,
    maxMp:150,

    //资源加载
    remotePath:"https://image.game.hnquyou.com/upload/CX/Fight/V8/",//远程服务器路径,层级和resource保持一致
    localPath:"game/",//本地resource下资源路径

    //资源配置，若使用默认路径（remotePath/key/name），可直接写资源名字符串(龙骨除外)
    dyResourceCg:
    {
        sfs:
        [
            "goBg_0","goBg_1","blackBoard"
        ],
        audio:
        [
            "bgm","begin-big","big-hit","big-hit-02","choose","big-shoot","big-shoot-02","fallground","finishing","hit-miss","MD_big",
            "jump","ko","menu","punch-01","punch-02","punch-03","walk","medium-shoot","medium-hit","countingdown","finishing"
        ],
        prefab:
        [
            "DlgSetting",
            "DlgActorSelect","DlgShowResultAnim","DlgShowVs","DlgGamePause",
            "DlgGameEnd",
            {"name":"falldown","path":"prefab/fx/"},{"name":"Fx_GetPower","path":"prefab/fx/"},{"name":"Ex01","path":"prefab/fx/"},
            {"name":"skill_leopard","path":"prefab/fx/"},
            {"name":"doctor_xuli","path":"prefab/fx/"},
            {"name":"MD_skill01","path":"prefab/fx/"},
        ],
        dragonBones:
        [
            {"name":"leopard","image":"black_leopard_tex.png","ske":"black_leopard_ske.json","atlas":"black_leopard_tex.json"},
            {"name":"doctor","image":"doctor_tex.png","ske":"doctor_ske.json","atlas":"doctor_tex.json"},
            {"name":"captain","image":"MD_tex.png","ske":"MD_ske.json","atlas":"MD_tex.json"},
            {"name":"giant","image":"lvjuren_tex.png","ske":"lvjuren_ske.json","atlas":"lvjuren_tex.json"},
            {"name":"lron","image":"Gangtiexia_tex.png","ske":"Gangtiexia_ske.json","atlas":"Gangtiexia_tex.json"},
            {"name":"spider","image":"zhuzhuxia_tex.png","ske":"zhuzhuxia_ske.json","atlas":"zhuzhuxia_tex.json"},
        ]
    },
    //资源存储对象
    dyResourceSg:
    {
        sfs:{},
        audio:{},
        prefab:{},
        dragonBones:{}
    },
};
module.exports = data;