
cc.Class({
    extends:require("Dlg"),

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this._maxPower = 20;
        this._addPower = 5;
    },
    onEnable() {
        //cx_AdvMgr.showBanner();
    },
    // onLoad () {},
    freeGet:function() {
        //if(cx_QyMgr.getPlatName() == "win") cx_DyDataMgr.addPower(this._addPower)
        let data = cx_DyDataMgr.getPersonData();
        let st = data.powerTvSt;
        if(st <=0) {
            cx_QyDlgMgr.showTips("今日看视频得体力次数已用完,明日继续战斗吧~")
            return;
        }
        let power = cx_DyDataMgr.getPower();
        if(power >= this._maxPower) {
            cx_QyDlgMgr.showTips("您的体力已满！");
            return;
        }
        let self = this;
        let closedCb = function(result) {
            if(result) {
                st--;
                let tmp = self._maxPower - power;
                let num = tmp > self._addPower?self._addPower:tmp;
                cx_DyDataMgr.addPower(num);
                cx_DyDataMgr.setPersonData("powerTvSt",st);
                self.mManager.updateCounts();
                self.close();
            }
            else 
            {

            }

        }
        let errorCb = function() {
/*             let tmp = self._maxPower - power;
            let num = tmp > self._addPower?self._addPower:tmp;
            cx_DyDataMgr.addPower(num);
            self.mManager.updateCounts();
            self.close(); */
/*             cx_QyMgr.share(function(result) {
                if(result) {
                    cx_QyMgr.share(function(result) {
                        if(result) {
                            cx_DyDataMgr.addPower(self._addPower);
                            self.updateCounts();
                            self.close();
                        }
                    })
                }
                else {

                }
            }) */
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
            let result = cx_DyDataMgr.addPower(this._addPower);
            if(result) {
                cx_DyDataMgr.addGold(-1*cost);
                cx_DyDataMgr.updateCounts();
            } else {
                cx_QyDlgMgr.showTips("体力已到限额！");
            }
        }
    },
/*     close() {
        //cx_AdvMgr.hideBanner();
        this._super();
    }, */
    start () {
        
    },

    // update (dt) {},
});
