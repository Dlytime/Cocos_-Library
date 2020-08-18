/**视情况用js\json\proto存储 */
var GameConfig = 
{
    "versions":"1.0.0",

    "currentLevel":1,

    "personal":
    {
        "currentLevel":1,
        "currentStep":1,
        "maxLevel":null,
        "lastLoginTime":"2020-02-20",

        "isOpenVoice":true,
        "isOpenShake":true,

        "gold":0,//金币
        "power":5,//体力
        "prop":["leopard","doctor","captain","lron"],//拥有道具

        "formActorChoosed":"leopard",//上次游戏选择的英雄
    },
    "configs":
    {
        //"goldCost":0,//标准金币消耗数量
        //"goldAward":20,//过关标准金币奖励数量
        //"powerCost":6,//标准体力消耗量
        "power":5,
        "maxPower":5,
        "gold":0,
        "isOpenPower":true,
        "sharePowerAward":2,//分享一次体力奖励
        "prop": 
        [
            {
                name:"",
                price:0,
                unlockLevel:1
            }
        ]
    },
    "gaming":
    {
        "isSplitLevel":false,
        "settings":
        {
        },
        "level":
        [

        ]

    }
}
module.exports = GameConfig;