var MINI_PRELOAD_LENGTH = 20

cc.Class({
    extends: cc.ScrollView,

    properties: {
        // 原horizontal和vertical属性不再起作用
        horizontal: {
            default: false,
            override: true,
            visible: false
        },
        vertical: {
            default: true,
            override: true,
            visible: false
        },
        // 是否水平方向
        landscape: false,
        // Cell之间间隔
        gap: 0,
        // 最上面/左边的Cell与顶部/左部的间隔
        firstGap: 0,
        // 最下面/右边的Cell与底部/右部的间隔
        lastGap: 0,
        _cellRects: [],
        _workCells: [],
        _freeCells: [],
        _freeNodeParent: null,
        _cellCount: 0,
        // 提前进入显示区域前就开始加载的长度（取cell一半的长度）
        _peloadLenght: 0,
        // 填充方向
        _fillDirection: true,
        _dirtyCell: false,
        _sizeOfIndex: null,
        _cellAtIndex: null,
        _countOfCell: null,
    },

    onLoad () {
        this._freeNodeParent = new cc.Node()
        this._freeNodeParent.active = false
        this._freeNodeParent.zIndex = -1000
        this._freeNodeParent.parent = this.node

        var _this = this
        this.node.on('scrolling', function() {
            _this._onContentMoved()
        })
    },

    onDestroy() {
        this._workCells = undefined
        this._freeCells = undefined
    },

    start () {
        this.setContentSize(cc.size(this.node.width, this.node.height))
        this.gap = this.gap || 0
        this.firstGap = this.firstGap || 0
        this.lastGap = this.lastGap || 0
        this.setLandscape(this.landscape)
    },

    lateUpdate(dt) {
        if(this._dirtyCell) {
            this._reloadNodes()
        }
    },

    /**
     * 更改TableView大小必须调用此函数 否则会显示不对
     * @param {Size} size 目标大小 
     */
    setContentSize(size) {
        var content = this.content
        var mask = content.parent
        var node = this.node
        
        mask.width = size.width
        mask.height = size.height

        content.anchorX = 0
        content.anchorY = 0
        mask.anchorX = 0
        mask.anchorY = 0
        mask.x = -node.width * node.anchorX
        mask.y = -node.height * node.anchorY
    },

    /**
     * 设置Cell之间间隔
     * @param {number} gap 
     */
    setGap(gap) {
        this.gap = gap
    },

    /**
     * 设置最上面/左边的Cell与顶部/左部的间隔
     * @param {number} gap 
     */
    setFirstGap(gap) {
        this.firstGap = gap
    },

    /**
     * 设置最下面/右边的Cell与底部/右部的间隔
     * @param {number} gap 
     */
    setLastGap(gap) {
        this.lastGap = gap
    },

    /**
     * 设置是否横向模式(默认false)
     * @param {boolean} bLandscape 
     */
    setLandscape(bLandscape) {
        this.landscape = bLandscape
        this.horizontal = bLandscape
        this.vertical = !bLandscape
    },

    /**
     * 设置是否反转方向(默认 左至右  下至上)(反转则 右至左 上至下)
     * @param {boolean} bNegative 
     */
    setFillDirection(bNegative) {
        this._fillDirection = !bNegative
    },

    /**
     * 获取指定cell大小回调
     * @param {function} callback 
     */
    sizeOfIndex(callback) {
        this._sizeOfIndex = callback
    },

    /**
     * 获取指定cell
     * @param {function} callback 
     */
    cellAtIndex(callback) {
        this._cellAtIndex = callback
    },

    /**
     * 获取cell的数量
     * @param {function} callback 
     */
    countOfCells(callback) {
        this._countOfCell = callback
    },

    /**
     * 获取所有工作的cell
     */
    getWorkCells() {
        return this._workCells
    },

    /**
     * 取出一个空闲的cell
     */
    dequeueCell() {
        if(this._freeCells.length > 0)
        {
            var cell = this._freeCells[0]
            this._freeCells.splice(0, 1)
            return cell
        }
    },

    /**
     * 重置数据刷新界面,当属性被重新设置后需要调用此接口方可生效
     */
    reloadData() {
        // recycle exist cells
        this._cellRects.forEach(element => {
            if(element.node)
            {
                this._deliverFreeNode(element.node)
                element.node = null
            }
        });

        var viewWidth = this.node.width
        var viewHeight = this.node.height
        var width = 0
        var height = 0
        this._peloadLenght = 0

        if(this.landscape)
        {
            width = this.firstGap
            height = viewHeight
        }
        else
        {
            width = viewWidth
            height = this.firstGap
        }

        var content = this.content
        var count = this._cellCount = this._countOfCell(this)

        // caculate and record show rect
        for(var index = 0; index < count; ++index)
        {
            var size = this._sizeOfIndex(this, index)

            if(this._cellRects.length <= index)
            {
                this._cellRects.push({
                    x:0,
                    y:0,
                    width:0,
                    height:0,
                    node:null,
                })
            }

            var rect = this._cellRects[index]
            rect.width = size.width
            rect.height = size.height

            if(this.landscape)
            {
                rect.x = width
                rect.y = (height - size.height) / 2

                if (index < count - 1) {
                    width = width + size.width + this.gap
                }
                else {
                    width = width + size.width + this.lastGap
                }
                
                if(this._peloadLenght < size.width)
                {
                    this._peloadLenght = size.width
                }
            }
            else
            {
                rect.x = (width - size.width) / 2
                rect.y = height

                if (index < count - 1) {
                    height = height + size.height + this.gap
                }
                else {
                    height = height + size.height + this.lastGap
                }

                if(this._peloadLenght < size.height)
                {
                    this._peloadLenght = size.height
                }
            }
        }

        // set content size
        content.width = Math.max(viewWidth, width)
        content.height = Math.max(viewHeight, height)

        if(!this._fillDirection) {
            content.x = viewWidth - content.width
            content.y = viewHeight - content.height
            
            for(var k = 0; k < this._cellCount; ++k)
            {
                var rect = this._cellRects[k]
                if(this.landscape)
                {
                    // 右至左
                    rect.x = content.width - rect.x - rect.width
                }
                else
                {
                    // 上至下
                    rect.y = content.height - rect.y - rect.height
                }
            }

            this.node.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
                if(this.landscape)
                {
                    this.scrollToRight()
                }
                else
                {
                    this.scrollToTop()
                }

                this._reloadNodes()
            }, this)))
        }
        else {
            content.x = 0
            content.y = 0

            this.node.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
                if(this.landscape)
                {
                    this.scrollToLeft()
                }
                else
                {
                    this.scrollToBottom()
                }

                this._reloadNodes()
            }, this)))
        }
    },

    _onContentMoved() {
        if(!this._dirtyCell) {
            this._reloadNodes()
        }
    },

    _reloadNodes() {
        this._dirtyCell = false

        var content = this.content
        var diff = Math.max(MINI_PRELOAD_LENGTH, this._peloadLenght / 2)
        var leftPosX = -content.x
        var bottomPosY = -content.y
        var rightPosX = leftPosX + this.node.width
        var topPosY = bottomPosY + this.node.height
        leftPosX = leftPosX - diff
        bottomPosY = bottomPosY - diff
        rightPosX = rightPosX + diff
        topPosY = topPosY + diff

        for(var index = 0; index < this._cellCount; ++index)
        {
            var rect = this._cellRects[index]

            if(rect.x > rightPosX
                || rect.y > topPosY
                || rect.x + rect.width < leftPosX
                || rect.y + rect.height < bottomPosY) {
                // not in show rect
                if(rect.node)
                {
                    this._deliverFreeNode(rect.node)
                    rect.node = null
                }
            }
            else {
                // in show rect
                if(!rect.node)
                {
                    rect.node = this._cellAtIndex(this, index)
                    if(rect.node)
                    {
                        // add into content
                        var node = rect.node
                        this._addWorkNode(node)

                        // set position
                        var realWidth = node.width * node.scaleX
                        var realHeight = node.height * node.scaleY
                        var leftBottomPosX = rect.x + (rect.width - realWidth) / 2
                        var leftBottomPosY = rect.y + (rect.height - realHeight) / 2
                        node.x = leftBottomPosX + realWidth * node.anchorX
                        node.y = leftBottomPosY + realHeight * node.anchorY
                    }
                }
            }
        }
    },

    _addWorkNode(node) {
        if (node) {
            node.parent = this.content
            this._workCells.push(node)

            for (let i = 0; i < this._freeCells.length; i++) {
                if (this._freeCells[i] === node) {
                    this._freeCells.splice(i, 1)
                    break
                }
            }
        }
    },

    _deliverFreeNode(node) {
        if(node) {
            node.parent = this._freeNodeParent
            this._freeCells.push(node)

            for (let i = 0; i < this._workCells.length; i++) {
                if (this._workCells[i] === node) {
                    this._workCells.splice(i, 1)
                    break
                }
            }
        }
    },
});
