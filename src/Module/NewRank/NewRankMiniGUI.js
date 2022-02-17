var NewRankMiniGUI = BaseLayer.extend({
    ctor: function () {
        this._super();

        this.myRankInfoCell = null;
        this.myRankIdx = -1;
        this.data = null;

        this.isOpening = false;
        this.isHolding = false;
        this.timeOpenMiniRank = 0;

        this.initWithBinaryFile("NewRankInGameLayer.json");
    },

    initGUI: function () {
        this.pMiniRank = this.getControl("pMiniRank");
        this.pTable = this.getControl("pTable");
        var sTableRank = this.getControl("sTableRank", this.pMiniRank);
        sTableRank.setVisible(false);
        this.sTableRank = new cc.TableView(this, sTableRank.getContentSize());
        this.sTableRank.setAnchorPoint(sTableRank.getAnchorPoint());
        this.sTableRank.setPosition(sTableRank.getPosition());
        this.sTableRank.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.sTableRank.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.sTableRank.setDelegate(this);
        this.sTableRank.ignoreAnchorPointForPosition(false);
        this.pTable.addChild(this.sTableRank);

        this.btnMiniRank = this.customButton("btnMiniRank", NewRankMiniGUI.BTN_MINI_RANK);
        this.btnMiniRank.setVisible(false);
        this.btnClose = this.customButton("btnClose", NewRankMiniGUI.BTN_CLOSE);
        this.btnTest = this.customButton("btnTest", NewRankMiniGUI.BTN_TEST);
        this.btnTest.setVisible(false);

        this.pArrow = this.getControl("pArrow", this.btnMiniRank);
        this.pArrow.setClippingEnabled(true);
        this.txtExpChange = this.getControl("txtExpChange", this.btnMiniRank);
        this.txtExpChange.setVisible(false);
        this.txtExpChange.ignoreContentAdaptWithSize(true);
        var pTouch = this.getControl("pTouch");
        pTouch.setTouchEnabled(true);
        pTouch.setLocalZOrder(100);
        pTouch.addTouchEventListener(function(layout, type){
            switch(type){
                case ccui.Widget.TOUCH_BEGAN:
                    this.isHolding = true;
                    break;
                case ccui.Widget.TOUCH_ENDED:
                case ccui.Widget.TOUCH_CANCELED:
                    this.isHolding = false;
                    this.timeOpenMiniRank = NewRankMiniGUI.TIME_CLOSE_MINI_RANK * 1000;
                    break;
            }
        }.bind(this), this);

        this.title = this.getControl("title", this.pMiniRank);
        this.title.setVisible(false);
        this.animTitle = db.DBCCFactory.getInstance().buildArmatureNode("TitleRank");
        var imgRankPos = this.title.getPosition();
        if (this.animTitle) {
            this.title.getParent().addChild(this.animTitle);
            this.animTitle.setPosition(imgRankPos.x, imgRankPos.y);
            this.animTitle.gotoAndPlay("1", 0, -1, 9999);
        }

        this.txtTooLate = this.getControl("txtTooLate", this.pMiniRank);
        this.myRankInfoCell = new NewRankPersonalInfoCell(true);
        this.myRankInfoCell.setVisible(false);
        this.pTable.addChild(this.myRankInfoCell);
    },

    onEnterFinish: function () {
        this.pMiniRank.setPositionX(this.pMiniRank.defaultPos.x + this.pMiniRank.getContentSize().width);
        this.btnClose.setVisible(false);
        this.txtExpChange.setVisible(false);
        this.pArrow.removeAllChildren(true);

        this.myRankIdx = -1;
        this.myRankInfoCell.setVisible(false);
        this.updateDetailRankInfo(true);
        this.scheduleUpdate();
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case NewRankMiniGUI.BTN_CLOSE: {   //btnClose
                NewRankData.showMiniRankGUI(false);
                break;
            }
            case NewRankMiniGUI.BTN_MINI_RANK: {   //btnMiniRank
                if (NewRankData.checkOpenRank(true)) {
                    NewRankData.numberOpenGuiRankTracking++;
                    NewRankData.showMiniRankGUI(true);
                }
                break;
            }
            case NewRankMiniGUI.BTN_TEST: {   //btnTest
                NewRankData.getInstance().fakeMyDataInWeek();
                break;
            }
        }
    },

    onExit: function () {
        this._super();
        NewRankData.sendTrackingOpenGUI();
    },

    showTooltipOpenRank: function () {
        var pos = this.btnMiniRank.getWorldPosition();
        pos.x -= 164;
        var text = localized("NEW_RANK_HAS_OPENED");
        TooltipFloat.makeTooltip(TooltipFloat.LONG, text, pos, TooltipFloat.SHOW_UP_TYPE_3, 15);
    },

    showMiniRank: function (isShow) {
        this.pMiniRank.stopAllActions();
        if (isShow){
            this.updateDetailRankInfo(false);

            this.txtTooLate.setVisible(this.data.size == 0 && !this.data.isOpening);
            this.sTableRank.setVisible(this.data.size > 0 || this.data.isOpening);
            this.getControl("pTouch").setSwallowTouches(true);

            this.pMiniRank.setPositionX(this.pMiniRank.defaultPos.x + this.pMiniRank.getContentSize().width);
            this.pMiniRank.runAction(cc.moveTo(0.5, this.pMiniRank.defaultPos).easing(cc.easeBackOut()));
            this.timeOpenMiniRank = NewRankMiniGUI.TIME_CLOSE_MINI_RANK * 1000;

            if (this.myRankIdx != -1) {
                var myRankIdx = NewRankData.getInstance().getMyRankPosition(true);
                if (this.myRankIdx == myRankIdx) {
                    this.pMiniRank.runAction(cc.sequence(
                        cc.delayTime(0.5),
                        cc.callFunc(function(){this.scrollToIdx(myRankIdx, 0.5);}.bind(this)),
                        cc.delayTime(0.5),
                        cc.callFunc(function(){
                            this.getControl("pTouch").setSwallowTouches(false);
                            this.timeOpenMiniRank = NewRankMiniGUI.TIME_CLOSE_MINI_RANK * 1000;
                        }.bind(this))
                    ));
                }
                else{
                    var oldIdx = this.myRankIdx;
                    this.myRankIdx = myRankIdx;
                    this.pMiniRank.runAction(cc.sequence(
                        cc.callFunc(function(){ this.jumpToIdx(oldIdx); }.bind(this)),
                        cc.callFunc(function(){ this.effectRankChange(oldIdx, myRankIdx); }.bind(this))
                    ));
                }
            }
        }
        else{
            this.pMiniRank.runAction(
                cc.moveTo(0.5, this.pMiniRank.defaultPos.x + this.pMiniRank.getContentSize().width, this.pMiniRank.defaultPos.y).easing(cc.easeBackIn())
            );
        }
        this.isOpening = isShow;
        this.btnClose.setVisible(isShow);
    },

    updateDetailRankInfo: function (forceUpdateIdx) {
        this.data = NewRankData.getInstance().getDataCurWeek();
        if (!this.data){
            this.data = {};
            this.data.topUser = [];
            this.data.weekLevel = 0;
            this.data.isOpening = false;
            this.data.size = 0;
        }
        if (this.myRankIdx < 0 || this.myRankIdx >= this.data.size)
            this.myRankIdx = -1;

        if (this.data.size == 0 && !this.data.isOpening) return;
        for (var i = 0; i < this.data.topUser.length; i++) {
            var info = this.data.topUser[i];
            if (info.isUser && info.userId == userMgr.getUID()) {
                this.myRankInfoCell.updateInfo(info, this.data.size, this.data.weekLevel, false);
                this.myRankInfoCell._layout.setPositionY(0);
                if (forceUpdateIdx || this.myRankIdx == -1) this.myRankIdx = info.idx;
            }
        }

        this.sTableRank.unscheduleAllCallbacks();
        this.sTableRank.reloadData();
    },

    effectRankChange: function(oldIdx, curIdx){
        if (oldIdx < 0) oldIdx = 0;
        if (oldIdx >= this.data.size) oldIdx = this.data.size - 1;
        if (oldIdx == curIdx || oldIdx == -1) return;

        var startPos = this.pTable.convertToNodeSpace(this.indexToPosition(oldIdx));
        var endPos = this.pTable.convertToNodeSpace(this.indexToPosition(curIdx));
        var cellHeight = this.myRankInfoCell.bg.getContentSize().height + NewRankGUI.PADDING_CELL;

        this.myRankInfoCell.setPosition(startPos);
        this.myRankInfoCell.setScale(1);
        this.myRankInfoCell.stopAllActions();
        this.myRankInfoCell.runAction(cc.sequence(
            cc.show(),
            cc.callFunc(function(){
                this.schedule(this.hideCurCell);
                var offset = (oldIdx - curIdx) / Math.abs(oldIdx - curIdx);
                var idx = oldIdx;
                while(idx != curIdx){
                    var cell = this.sTableRank.cellAtIndex(idx);
                    if (cell){
                        cell._layout.setPositionY(cell._layout.getPositionY() + offset * cellHeight);
                        cell._layout.stopAllActions();
                        cell._layout.runAction(cc.sequence(
                            cc.delayTime(0.5),
                            cc.moveTo(0.25, cell._layout.getPositionX(), cell._layout.getPositionY() - offset * cellHeight)
                        ));
                    }
                    idx -= offset;
                }
            }.bind(this)),
            cc.delayTime(0.5),
            cc.scaleTo(0.25, 1.1),
            cc.callFunc(function(){
                this.scrollToIdx(curIdx, 0.5);
            }.bind(this)),
            cc.moveTo(0.5, endPos),
            cc.scaleTo(0.25, 1),
            cc.hide(),
            cc.callFunc(function(){
                this.unschedule(this.hideCurCell);
                this.showCurCell();
                this.getControl("pTouch").setSwallowTouches(false);
                this.timeOpenMiniRank = NewRankMiniGUI.TIME_CLOSE_MINI_RANK * 1000;
            }.bind(this))
        ));
    },

    indexToPosition: function(idx){
        var cellHeight = this.myRankInfoCell.bg.getContentSize().height + NewRankGUI.PADDING_CELL;
        var tableHeight = this.sTableRank.getViewSize().height;
        var tableWidth = this.sTableRank.getViewSize().width;
        var tableInnerHeight = this.sTableRank.getContentSize().height;
        if (tableHeight < tableInnerHeight){
            var cellY = (this.data.topUser.length - idx - 1 + 1/2) * cellHeight;
            if (cellY <= tableHeight/2) return this.sTableRank.convertToWorldSpace(cc.p(tableWidth/2, cellY));
            if (cellY >= tableInnerHeight - tableHeight/2) return this.sTableRank.convertToWorldSpace(cc.p(tableWidth/2, tableHeight - (tableInnerHeight - cellY)));
            return this.sTableRank.convertToWorldSpace(cc.p(tableWidth/2, tableHeight/2));
        }
        else{
            var cellY = (this.data.topUser.length - idx - 1 + 1/2) * cellHeight + tableHeight - tableInnerHeight;
            return this.sTableRank.convertToWorldSpace(cc.p(tableWidth/2, cellY));
        }
    },

    hideCurCell: function(){
        var cell = this.sTableRank.cellAtIndex(this.myRankIdx);
        if (cell) cell.setVisible(false);
    },

    showCurCell: function(){
        var cell = this.sTableRank.cellAtIndex(this.myRankIdx);
        if (cell) cell.setVisible(true);
    },

    tableCellAtIndex: function(table, idx){
        var cell = table.dequeueCell();
        if (!cell){
            cell = new NewRankPersonalInfoCell(true);
            cell._layout.setPositionX(this.sTableRank.getViewSize().width/2);
        }
        cell.setVisible(true);
        cell._layout.stopAllActions();
        cell.updateInfo(this.data.topUser[idx], this.data.size, this.data.weekLevel, false);
        return cell;
    },

    tableCellSizeForIndex: function(){
        return cc.size(this.sTableRank.getViewSize().width, this.myRankInfoCell.bg.getContentSize().height + NewRankGUI.PADDING_CELL);
    },

    numberOfCellsInTableView: function(){
        if (this.data) return this.data.topUser.length;
        else return 0;
    },

    scrollToIdx: function(idx, time){
        var tableHeight = this.sTableRank.getViewSize().height;
        var tableInnerHeight = this.sTableRank.getContentSize().height;
        var cellY = (this.data.topUser.length - idx - 1 + 1/2) * this.tableCellSizeForIndex(null, 0).height;
        if (tableHeight < tableInnerHeight) {
            var offset = tableInnerHeight - cellY - tableHeight / 2;
            var totalOffset = tableInnerHeight - tableHeight;
            var percent = offset / totalOffset;
            percent = 1 - Math.min(1, Math.max(0, percent));
            this.sTableRank.setContentOffsetInDuration(cc.p(0, this.sTableRank.minContainerOffset().y * percent), time);
        }
    },

    jumpToIdx: function(idx){
        var tableHeight = this.sTableRank.getViewSize().height;
        var tableInnerHeight = this.sTableRank.getContentSize().height;
        var cellY = (this.data.topUser.length - idx - 1 + 1/2) * this.tableCellSizeForIndex(null, 0).height;
        if (tableHeight < tableInnerHeight) {
            var offset = tableInnerHeight - cellY - tableHeight / 2;
            var totalOffset = tableInnerHeight - tableHeight;
            var percent = offset / totalOffset;
            percent = 1 - Math.min(1, Math.max(0, percent));
            this.sTableRank.setContentOffset(cc.p(0, this.sTableRank.minContainerOffset().y * percent));
        }
    },

    update: function (dt) {
        if (this.isOpening && !this.isHolding) {
            this.timeOpenMiniRank -= dt * 1000;
            if (this.timeOpenMiniRank < 0) {
                this.showMiniRank(false);
            }
        }
    }
});

NewRankMiniGUI.className = "NewRankMiniGUI";
NewRankMiniGUI.TIME_CLOSE_MINI_RANK = 3;
NewRankMiniGUI.BTN_CLOSE = 0;
NewRankMiniGUI.BTN_MINI_RANK = 1;
NewRankMiniGUI.BTN_TEST = 2;