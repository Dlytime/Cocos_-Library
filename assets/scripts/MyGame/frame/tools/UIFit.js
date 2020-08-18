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
    extends: cc.Component,

    properties: {
        left:-1,
        right:-1,
        top:-1,
        down:-1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let width = cc.winSize.width;
        let height = cc.winSize.height;
        if(this.left > 0) {
            this.node.x = -width/2 + this.left + this.node.width/2;
        }
        if(this.right > 0) {
            this.node.x = width/2 - this.right -this.node.width/2;
        }
        if(this.top > 0) {
            this.node.y = height/2 - this.top - this.node.height/2;
        }
        if(this.down > 0) {
            this.node.y = -height/2 + this.down + this.node.height/2;
        }
    },
    start () {

    },

    // update (dt) {},
});
