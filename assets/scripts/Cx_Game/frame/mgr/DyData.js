/**承载游戏初始数据配置和运行数据 */
var data = 
{
    version:"1.0.0",
    //通用存储变量
    isPatch:false,//是否为提审版
    isFirstJoinGame:false,//是否为首次进入游戏
    isDayFirstJoinGame:false,//是否为当天首次进入游戏
    isVideoPlaying:false,//是否处于视频播放中

    //通用定义变量
    GAME_RESULT:cc.Enum({
        "win":"win",
        "lose":"lose",
        "break":"break"
    }),

    //个人存储数据默认配置
    defaultPersonCg:
    {
        version:"1.0.0",
        lastLoginTime:"2020-03-05",
        gold:0,
        power:5,
        currentLevel:1,
        maxLevel:1,
        isOpenVoice:true,
        isOpenShake:true,
        prop:[],
    },
    gameConfig:
    {
        maxPower:30,//体力值上限
        isOpenPower:false,//是否开启体力系统
    },

    //游戏特殊(每局游戏开始之前重置)
    roundInfo:
    {
        result:"lose",
        isthreeAward:null,
        joinType:null,
    },
    isClickMistake:null,
    isMoveMistake:null,
    isBtnMistake:null,
    isExitMistake:null,
    clickedDcAdvArr: [],//已经点击过的导出广告数组
    //资源加载
    remotePath:"https://image.game.hnquyou.com/upload/CX/Cx_Game/V1/",//远程服务器路径,层级和resource保持一致
    localPath:"game/",//本地resource下资源路径

    //资源配置，若使用默认路径（remotePath/key/name），可直接写资源名字符串(默认tag为 common )(龙骨除外)
    dyResourceName:["sfs","plist","json","audio","prefab","dragonBones"],
    dyResourceCg:
    {
        "local":
        {
            sfs:
            [
                "girl_diving_arm_left"
            ],
            //远程图集
            plist:
            {
    
            },
            json:
            [
                
            ],
            audio:
            [
                "bgm","swim","pin_removed","heart","hit_lava","stone_hit","growl","pin_blocked",
            ],
            prefab:
            [
                //通用
                /* "DlgLackPower" ,*/"DlgSetting","Tips","DlgGameEnd",

                //game
                {"name":"water","path":"prefab/game/","tag":"gamePb"},
                {"name":"stoneBroke","path":"prefab/game/","tag":"gamePb"},{"name":"heartAnim","path":"prefab/game/","tag":"gamePb"},
    
                //平台区分
                {"name":"DlgRoomAdv","path":"prefab/","tag":"wx"},{"name":"DlgMorePlay","path":"prefab/","tag":"wx"},{"name":"DlgGameEnd","path":"prefab/","tag":"wx"},{"name":"DlgShowResult","path":"prefab/","tag":"wx"},{"name":"DlgFullAdv","path":"prefab/","tag":"wx"},{"name":"DlgExitAdv","path":"prefab/","tag":"wx"},
                {"name":"DlgGameEnd_vivo","path":"prefab/","tag":"vivo"},{"name":"ovNative","path":"prefab/adv/","tag":"vivo"},{"name":"insertAd","path":"prefab/adv/","tag":"vivo"},
                //游戏区分
            ],
            dragonBones:
            [
                //{"name":"leopard","image":"black_leopard_tex.png","ske":"black_leopard_ske.json","atlas":"black_leopard_tex.json"}
            ]
        },
        "remote":
        {
            sfs:
            [

            ],
            //远程图集
            plist:
            {
    
            },
            json:
            [
                
            ],
            audio:
            [
                "bgm"
            ],
            dragonBones:
            [
                //{"name":"leopard","image":"black_leopard_tex.png","ske":"black_leopard_ske.json","atlas":"black_leopard_tex.json","tag":null}
            ]
        }
    },
    //资源存储对象
    dyResourceSg:
    {
        sfs:{},
        json:{},
        audio:{},
        prefab:{},
        dragonBones:{},
        plist:{},
    },
/*     //资源加载状况
    dyResourceStatus:
    {
        //"local":{"sfs":{"wait":null,"success":null,"faild":null}...},
        //"remote":{"sfs":{"wait":null,"success":null,"faild":null}...},
    } */
};
module.exports = data;