// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: require("Dlg"),

    properties: {
        content:cc.Node,
        gridPb:cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on("doSign",this._doSign,this);
        this._isCanSign = false;
        this.initAll();
    },
    initAll() {
        this.content.removeAllChildren();


        let config = cx_DyData.signAward;
        let signDay = cx_DyDataMgr.getPersonData("signDay");
        let signDate = cx_DyDataMgr.getPersonData("signDate");

        if(signDate !== cx_jsTools.getCurTime("d") && signDay == 6) {
            this.day7btn.interactable = true;
            this.gou7.active = false;
        }
        else if(signDate == cx_jsTools.getCurTime("d") && signDay == 7){
            this.day7btn.interactable = false;
            this.gou7.active = true;
        }
        else {
            this.day7btn.interactable = false;
            this.gou7.active = false;
        }

        
        signDay = signDay?signDay:0;
        if(signDate !== cx_jsTools.getCurTime("d")) signDay++;
        signDay = signDay >= 7?1:signDay;
        for (let i = 0; i < 7; i++) {
            let info = config[i];
            
            let type = null;
            if(i === signDay - 1)
            {
                if(signDate !== cx_jsTools.getCurTime("d")) {
                    type = "2";
                    this._isCanSign = true;
                } else {
                    type = "1";
                }
            }
            else if(i < signDay - 1)
            {
                type = "1";
            }
            else {
                type = "3";
            }
            //type,day,awardType,awardNum
            
            let day = i+1;
            let awardType = info.awardType;
            let awardNum = info.awardNum;

            

            let nodejs = cx_UIMgr.getNodeJs(this.gridPb);
            let node = nodejs.node;
            this.content.addChild(node); 
            nodejs.init(this,type,day,awardType,awardNum);

            if(this._isCanSign && !this._signInfo) this._signInfo = {"day":day,"awardType":awardType,"awardNum":awardNum,"nodejs":nodejs};
        }

    },
    _doSign(event) {
        let nodejs = event.nodejs;
        let awardType = event.awardType;
        let awardNum = event.awardNum;
        let day = event.day;
        nodejs.setType(1);

        let date = cx_jsTools.getCurTime("d");
        cx_DyDataMgr.setPersonData("signDay",day);
        cx_DyDataMgr.setPersonData("signDate",date);
        if(awardType == "gold")
        {
            cx_DyDataMgr.addGold(awardNum);
            cx_QyDlgMgr.showTips("恭喜获得 "+awardNum+" 金币");

            this.mManager.updateCounts();
        }

        this._isCanSign = false;
    },
    sign() {
        if(!this._isCanSign) {
            cx_QyDlgMgr.showTips("今天已经签过到啦~");
            return;
        } 
        this._doSign(this._signInfo);
    },
    lockActor() {
        let info = cx_DyData.signAward[6];
        let name = info.name;
        cx_DyDataMgr.unLockActor(name,"sign");
        let date = cx_jsTools.getCurTime("d");
        cx_DyDataMgr.setPersonData("signDay",7);
        cx_DyDataMgr.setPersonData("signDate",date);

        this.gou7.active = true;
    },
    start () {

    },

    // update (dt) {},
});
