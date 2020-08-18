
/**
 * 说明：主要用于广告的Scrollview,继承自cc.node；
 * 实现功能：网格式排列添加节点、纵向横向循环滚动（触摸停止，松开继续
 */
var AdvList = cc.Class({
    extends: cc.Node,

    properties: {
        scrollType:{//1 横向滚动(从右向左) ， 2:纵向滚动(从下向上)
            get () {
                return this._scrollType;
            },
            set (value) {
                //检测
                if(this._scrollType === 1 || this._scrollType === 2) {
                    this._scrollType = value;
                    this._reflusDelay();
                }
            },
        },
        isAutoScoll:{
            get () {
                return this._isAutoScoll;
            },
            set (value) {
                this._isAutoScoll = value && true;
                this._reflusDelay();
            }
        },
        oneLineCellCount:{//一行或一列的节点数，当不为零时自动布局，spacing的设置无效
            get () {
                return this._oneLineCellCount;
            },
            set (value) {
                if(typeof value === "number" && value%1 === 0) {
                    this._oneLineCellCount = value;
                    this._reflusDelay();
                }
            }
        },
        size:{
            get () {
                return this._size;
            },
            set (value) {
                if(value instanceof cc.Size) {
                    this._size = value;
                    this._reflusDelay();
                }
            },
            type:cc.Size
        },
        cellSize:{
            get () {
                return this._cellSize;
            },
            set (value) {
                if(value instanceof cc.Size) {
                    this._cellSize = value;
                    this._reflusDelay();
                }
            },
            type:cc.Size
        },
        spacingX:{
            get () {
                return this._spacingX;
            },
            set (value) {
                if(typeof value === "number") {
                    this._spacingX = value;
                    this._reflusDelay();
                }
            }
        },
        spacingY:{
            get () {
                return this._spacingY;
            },
            set (value) {
                if(typeof value === "number") {
                    this._spacingY = value;
                    this._reflusDelay();
                }
            }
        },
        isAutoSpace:{
            default:true,
        },
        scrollSpeed:{
            get () {
                return this._scrollSpeed;
            },
            set (value) {
                if(typeof value === "number") {
                    this._scrollSpeed = value;
                    this._reflusDelay();
                }
            }
        },
        _content: {
            type:cc.Node,
            default:null
        },
        _view:{
            type:cc.Node,
            default:null 
        },

    },
    ctor () {
        this._size = cc.size(0,0);
        this._scrollType = 2;
        this._isAutoScoll = true;
        this._spacingX = 10;
        this._spacingY = 10;
        this._scrollSpeed = 60;
        this._oneLineCellCount = 0;
        this.__cellSize = null;


        this._autoScollSchedule = false;
        this._allReflusSchedule = false;
        this._scrollTween = null;

        var scrollview = this.addComponent(cc.ScrollView);
        var view = new cc.Node("view");
        var mask = view.addComponent(cc.Mask);
        var content = new cc.Node("content");
        var layout = content.addComponent(cc.Layout);

        this._content = content;
        this._view = view;

        this.addChild(view);
        view.addChild(content);

        //默认竖直滚动
        scrollview.content = content;

        scrollview.node.on("scroll-ended",this._scrollEnd,this);
        //scrollview.elastic = false;
        //scrollview.inertia = false;

        //默认网格
        layout.type = cc.Layout.Type.GRID;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;

        //this._updateAll();
        //layout.cellSize = cc.size(50,50);

        this._addEventListener();
    },
    onEnable() {
        //this.node.stopAllActions();
    },
    add (node) {
        this._content.addChild(node);

        this._reflusDelay();
        /*
        if(!this._autoScollSchedule)
        {
            this._autoScollSchedule = true;
            var tmp = this.getComponent(cc.ScrollView).scheduleOnce(function() {
                // 这里的 this 指向 component
                self._reflusAutoScoll();
                self._autoScollSchedule = false;
            }, 0.2);
        }
        */
    },
    clear () {
        this._content.removeAllChildren();
    },
    /**获得添加进list的子节点 */
    getAddChild() {
        return this._content.children;
    },
    
    _reflusDelay () {
        var self = this;
        if(!this._allReflusSchedule)
        {
            //cc.log("执行一次延迟刷新")
            this._allReflusSchedule = true;
            var tmp = this.getComponent(cc.ScrollView).scheduleOnce(function() {
                // 这里的 this 指向 component
                self._updateAll();
                self._allReflusSchedule = false;
            }, 0.3);
        }
    },
    _delayReflusAutoScoll () {
        var self = this;
        var tmp = this.getComponent(cc.ScrollView).scheduleOnce(function() {
            // 这里的 this 指向 component
            self._updateAutoScoll();
        }, 0.3);
    },
    _addEventListener () {
        this.on("touchstart",this._touchStart,this);
        this.on("touchend",this._touchEnd,this);
        this.on("touchcancel",this._touchEnd,this);
        
    },
    _touchStart (event) {
        this._stopScollTween();
    },
    _touchEnd (event) {
        if(this._isAutoScoll) {
            this.getComponent(cc.ScrollView).stopAutoScroll();
            this._reflusAutoScoll();
        }
    },
    _setScollType () {

    },
    _setIsAutoScoll () {

    },
    _scrollEnd:function(event) {
        this._reflusAutoScoll();
    },
    _setSize () {
        this.width = this._size.width;
        this.height = this._size.height;

        this._view.width = this._size.width;
        this._view.height = this._size.height;

        if(this.scrollType === 1) {
            //横向滚动更新 content x坐标,height
        } else if(this.scrollType === 2) {
            //纵向滚动更新 content y坐标,width
        }
    },
    _updateAll () {
        this._updateScollview();
        this._updateView();
        this._updateContent();
        //延时加载滚动，等待content加载完全完成
        this._delayReflusAutoScoll();
    },
    _updateContent () {
        var content = this._content;
        var layout = content.getComponent(cc.Layout);
        var cellsize = this._getCellSize();
        layout.spacingX = this._spacingX;
        layout.spacingY = this._spacingY;
        let count = this._oneLineCellCount;
        switch(this._scrollType)
        {
            case 1://横向滚动
                layout.startAxis = cc.Layout.AxisDirection.VERTICAL;
                content.height = this._size.height;
                content.anchorX = 0;
                content.anchorY = 0.5;
                content.setPosition(-1*this._size.width/2,0);
                if(count > 1 && this.isAutoSpace) {
                    layout.spacingY = (this.height - count * cellsize.height)/(count - 1);
                    layout.spacingX = (this.height - count * cellsize.height)/(count - 1);
                }
                break;
            case 2://纵向滚动
                layout.startAxis = cc.Layout.AxisDirection.HORIZONTAL;
                
                content.width = this._size.width;
                content.anchorX = 0.5;
                content.anchorY = 1;
                content.setPosition(0,this._size.height/2);
                if(count > 1  && this.isAutoSpace) {
                    layout.spacingY = (this.width - count * cellsize.width)/(count - 1);
                    layout.spacingX = (this.width - count * cellsize.width)/(count - 1);
                }
                //cc.log("layout.spacingY:::::::::",layout.spacingY);
                break;    
            default:
                break;
        }
    },
    _updateScollview () {
        var scrollview = this.getComponent(cc.ScrollView);
        switch(this._scrollType)
        {
            case 1://横向滚动
                scrollview.horizontal = true;
                scrollview.vertical = false;
                break;
            case 2://纵向滚动
                scrollview.horizontal = false;
                scrollview.vertical = true;    
                break;    
            default:
                break;
        }
        this.width = this._size.width;
        this.height = this._size.height;
    },
    _updateView() {
        this._view.width = this._size.width;
        this._view.height = this._size.height;
    },
    _updateAutoScoll() {
        this._stopScollTween();
        this._reflusAutoScoll();
    },
    _stopScollTween() {
        if(this._scrollTween) {
            this._scrollTween.stop();
            this._scrollTween = null;
        }
    },
    _setPadding () {

    },
    _reflusAutoScoll () {
        if(!this._isAutoScoll) return;
        var scrollview = this.getComponent(cc.ScrollView);
        var content = this._content;
        var layout = content.getComponent(cc.Layout);
        var isScrolling = scrollview.isScrolling();
        var isAutoScrolling = scrollview.isAutoScrolling();
        //用户正在拖动或正在惯性滚动，跳过
        if(isScrolling || isAutoScrolling) return;
        //content如果大小未超出显示大小，不予滚动
        if(content.width <= this.width && content.height <= this.height) return;
        //cc.log("content.height++++",content.height);
        //默认添加进来的节点大小一致
        var cellsize = this._getCellSize();
        var maxPoint = cc.v2(0,0);
        var criticalPoint = cc.v2(0,0);
        if(this._scrollType === 2)
        {
            //必须要有完整的一排在View之外才予循环滚动
            if(content.height < this.height + cellsize.height) return;
            maxPoint.y = content.height - this.height/2;
            criticalPoint.y = -1 *(content.height - this.height - cellsize.height/2);
            //cc.log("maxPoint.y ==== " ,maxPoint.y);
            //检测当前content是否到达最大位置
            if(content.y >= maxPoint.y) 
            {
                var onelinecount = this._getNodeCountOneLine();
                var removedarr = this._getWillBeRemoveNode();
                var linecount = parseInt(removedarr.length/onelinecount);
                content.y = maxPoint.y - (cellsize.height + layout.spacingY) * linecount;
                
                this._againAddNode(removedarr);
                this._stopScollTween();
            }
            
            if(this._scrollTween === null) {
                this._scrollTween = cc.tween(content)
                .to((maxPoint.y - content.y)/this._scrollSpeed, {position: maxPoint})
                .call(() => { 
                    //content.y = maxPoint.y;
                    this._reflusAutoScoll() })
                .start();
            }
        }
        else if(this._scrollType === 1) 
        {
            if(content.width < this.width + cellsize.width) return;
            maxPoint.x = -1 *(content.width - this.width/2);
            //criticalPoint.x = -1 *(content.width - this.width - cellsize.width/2);
            if(content.x <= maxPoint.x) {
                var onelinecount = this._getNodeCountOneLine();
                var removedarr = this._getWillBeRemoveNode();
                var linecount = parseInt(removedarr.length/onelinecount);
                content.x = maxPoint.x + (cellsize.width + layout.spacingX) * linecount;
                
                this._againAddNode(removedarr);
                this._stopScollTween();
            }
            if(this._scrollTween === null) {
                this._scrollTween = cc.tween(content)
                .to(Math.abs(maxPoint.x - content.x)/this._scrollSpeed, {position: maxPoint})
                .call(() => { 
                    content.x = maxPoint.x;
                    this._reflusAutoScoll() })
                .start();
            }
        }
    },
    _againAddNode (arr) {
        for (let i = 0; i < arr.length; i++) {
            const node = arr[i];
            node.parent = null;
            this._content.addChild(node);
        }
    },
    _reflusScrollTween() {
        this._scrollTween.stop();
        this._scrollTween = null;
    },
    //自动根据容器中节点等间距排列
    _autoArrange () {

    },
    //获取每个节点的size(默认添加进来的节点大小一致，直接取第一个节点的size)
    _getCellSize () {
        if(this._cellSize) return this._cellSize;
        var children = this._content.children;
        if(children.length>0) return cc.size(children[0].width,children[0].height);
        return null;
    },
    //获取一行或一列（根据排列类型）的节点数
    _getNodeCountOneLine () {
        var cell = this._getCellSize();
        var children = this._content.children;
        if(children.length === 0) return 0;
        var count = 0;
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            if(this._scrollType === 2 && node.y === children[0].y) {
                count++;
            } else if(this._scrollType === 1 && node.x === children[0].x) {
                count++;
            } else {
                break;
            }
        }
        return count;
    },
    //获取即将被移除的节点
    _getWillBeRemoveNode () {
        var content = this._content;
        var cellsize = this._getCellSize();
        var children = this._content.children;
        var result = [];
        var criticalPoint = cc.v2(0,0);//content为原点
        if(this._scrollType === 2)
        {
            criticalPoint.y = -1 *(content.height - this.height - cellsize.height/2);
            for (let i = 0; i < children.length; i++) {
                const node = children[i];
                if(node.y >= criticalPoint.y) {
                    result.push(node);
                } else {
                    break;
                }
            }
        } 
        else if(this._scrollType === 1)
        {
            criticalPoint.x = content.width - this.width - cellsize.width/2;
            for (let i = 0; i < children.length; i++) {
                const node = children[i];
                if(node.x <= criticalPoint.x) {
                    result.push(node);
                } else {
                    break;
                }
            }
        }
        return result;
        
    },
    //自动排列暂缓
    //根据view大小和节点大小计算一行或一列（根据排列类型）的节点数
    _clNodeCountOneLine () {
        var cell = this._getCellSize();
        if(cell === null) return null;
        switch (this._scrollType) {
            case 1:
                
                break;
            case 2:
                //(this._size.width/cell.width)
                break;
            default:
                break;
        }
    },
    //
    _clChildPadding () {

    },
    start () {

    },

    // update (dt) {},
});
module.exports = AdvList;