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
    extends:require("Dlg"),

    properties: {
        goldCost:100,
        powerAdd:1
    },

    // LIFE-CYCLE CALLBACKS:
    onEnable() {
        //cx_AdvMgr.showBanner();
    },
    // onLoad () {},
    freeGet:function() {
        if(cx_QyMgr.getPlatName() == "win") cx_DyDataMgr.addPower(5)
        let power = cx_DyDataMgr.getPower();
        if(power >= 5) {
            cx_QyDlgMgr.showTips("您的体力已满！");
            return;
        }
        let self = this;
        let closedCb = function(result) {
            if(result) {
                cx_DyDataMgr.addPower(self.powerAdd);
                self.updateCounts();
                self.close();
            }
            else 
            {

            }

        }
        let errorCb = function() {
            cx_QyMgr.share(function(result) {
                if(result) {
                    cx_QyMgr.share(function(result) {
                        if(result) {
                            cx_DyDataMgr.addPower(self.powerAdd);
                            self.updateCounts();
                            self.close();
                        }
                    })
                }
                else {

                }
            })
        }
        cx_AdvMgr.showVideo(closedCb,errorCb);
    },
    buyPower:function() {
        let power = cx_DyDataMgr.getPower();
        if(power >= 5) {
            cx_QyDlgMgr.showTips("您的体力已满！");
            return;
        }
        let cost = this.goldCost;
        let goldCount = cx_DyDataMgr.getGold();
        if(cost > goldCount) {
            cx_QyDlgMgr.showTips("金币不足，购买体力失败！");
        }
        else {
            let result = cx_DyDataMgr.addPower(this.powerAdd);
            if(result) {
                cx_DyDataMgr.addGold(-1*cost);
                cx_DyDataMgr.updateCounts();
            } else {
                cx_QyDlgMgr.showTips("体力已到限额！");
            }
        }
    },
    close() {
        //cx_AdvMgr.hideBanner();
        this._super();
    },
    start () {
        
    },

    // update (dt) {},
});
