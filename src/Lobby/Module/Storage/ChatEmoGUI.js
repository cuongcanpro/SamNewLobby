var ChatEmoGUI = BaseLayer.extend({
    ctor: function() {
        this._super(ChatEmoGUI.className);

        this.btnClose = null;
        this.btnList = null;
        this.bgLock = null;
        this.lockText = null;
        this.pItem = null;
        this.prototypeCell = null;
        this.prototypeItems = [];

        this.tbSize = null;
        this.tbPos = null;
        this.cellSize = null;
        this.emoSize = null;
        this.emoPos = [];

        this.emoData = [];
        this.selectedTab = -1;

        this.initWithBinaryFile("Lobby/ChatEmoGUI.json");
    },

    /* region Base Flows */
    initGUI: function() {
        this.btnClose = this.customButton("btnClose", ChatEmoGUI.BTN_CLOSE);
        this.bg = this.getControl("bg");
        this.bg.defaultPosition = this.bg.getPosition();
        this.bg.setCascadeOpacityEnabled(true);
        this.btnList = this.getControl("btnList", this.bg);
        this.btnList.setScrollBarEnabled(false);
        this.btnList.addEventListener(function(lv, type){
            switch(type){
                case ccui.ListView.ON_SELECTED_ITEM_END:
                    this.selectTab(lv.getCurSelectedIndex());
            }
        }.bind(this), this);

        this.bgLock = this.getControl("bgLock", this.bg);
        this.lockText = this.getControl("text", this.bgLock);
        this.pItem = this.getControl("emoPanel", this.bg);
        this.pItem.setVisible(false);
        this.pItem.setLocalZOrder(1);
        this.pItem.setTouchEnabled(true);
        this.prototypeCell = this.getControl("emoCell", this.pItem);
        this.numCol = this.prototypeCell.getChildrenCount();
        for (var i = 0; i < this.numCol; i++) {
            this.prototypeItems.push(this.prototypeCell.getChildByName("emoItem" + i));
            this.emoPos.push(this.prototypeItems[i].getPosition());
        }

        this.tbSize = this.pItem.getContentSize();
        this.tbPos = this.pItem.getPosition();
        this.cellSize = this.prototypeCell.getContentSize();
        this.emoSize = this.prototypeItems[0].getContentSize();

        //init table emo
        this.tbEmo = new cc.TableView(this, this.tbSize);
        this.tbEmo.setAnchorPoint(0, 0);
        this.tbEmo.setPosition(this.tbPos);
        this.tbEmo.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.tbEmo.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.tbEmo.setDelegate(this);
        this.tbEmo.setCascadeOpacityEnabled(true);
        this.tbEmo.getContainer().setCascadeOpacityEnabled(true);
        this.bg.addChild(this.tbEmo);
        this.bg.setTouchEnabled(true);

        this.setBackEnable(true);
    },

    onEnterFinish: function() {
        this.readyToUse = false;
        this.emoData = [];
        if (StorageManager.getInstance().itemConfig) {
            var emoConfig = StorageManager.getInstance().itemConfig[StorageManager.TYPE_EMOTICON];
            if (emoConfig && StorageManager.getInstance().userItemInfo[StorageManager.TYPE_EMOTICON]) {
                for (var emoId in emoConfig) {
                    var emoItemConfig = emoConfig[emoId];
                    if (!emoItemConfig.enable) continue;
                    var emo = {
                        id: emoId,
                        vip: emoItemConfig.vip,
                        level: emoItemConfig.level,
                        listItemId: emoItemConfig.listItemId.slice(),
                        subTypes: []
                    };
                    if (emoItemConfig.groups) {
                        var groups = emoItemConfig.groups;
                        emo.groups = [];
                        for (var i in groups) {
                            emo.groups.push({
                                listItemId: groups[i]["listItemId"],
                                vip: groups[i]["vip"],
                                level: groups[i]["level"]
                            });
                        }
                        emo.listItemId.sort(function (a, b) {
                            var idxA = 0, idxB = 0;
                            for (var i = 0; i < this.length; i++) {
                                if (this[i].listItemId.indexOf(Number(a)) != -1) idxA = i;
                                if (this[i].listItemId.indexOf(Number(b)) != -1) idxB = i;
                            }
                            return idxA - idxB;
                        }.bind(emo.groups))
                    }
                    for (var subType in emoItemConfig.subTypes) {
                        emo.subTypes.push(Number(subType));
                    }
                    this.emoData.push(emo);
                }
            }
        }

        this.btnList.removeAllChildren();
        for (var i in this.emoData){
            var emoId = this.emoData[i].id;

            var btnActive = new cc.Sprite("Storage/emo_panel/tabActive" + emoId + ".png");
            var btnSize = btnActive.getContentSize();
            btnActive.setAnchorPoint(0, 0);
            var timeText = new ccui.Text("", "fonts/tahomabd.ttf", 12);
            timeText.setAnchorPoint(0.5, 0.5);
            timeText.setPosition(38, 9);
            timeText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            timeText.ignoreContentAdaptWithSize(true);
            timeText.enableOutline(cc.color("#be4929"), 1);

            var btnInactive = new cc.Sprite("Storage/emo_panel/tabInactive" + emoId + ".png");
            btnInactive.setAnchorPoint(0.5, 0.5);
            btnInactive.setPosition(this.getBtnTabInactivePos(emoId));

            var panel = new ccui.Layout();
            panel.setContentSize(btnSize);
            panel.addChild(btnInactive, 0, "inactive");
            panel.addChild(btnActive, 0, "active");
            panel.addChild(timeText, 0, "time");
            panel.setTouchEnabled(true);
            panel.setSwallowTouches(false);

            this.btnList.pushBackCustomItem(panel);
        }
        if (this.emoData.length > 0)
            this.selectTab(this.selectedTab);
        else{
            this.selectedTab = -1;
        }
    },

    onButtonRelease: function(button, id) {
        if (!this.readyToUse) return;
        switch (id) {
            case ChatEmoGUI.BTN_CLOSE:
                this.hide();
                break;
        }
    },

    onBack: function() {
        this.onButtonRelease(null, ChatEmoGUI.BTN_CLOSE);
    },

    show: function(id) {
        if (id !== undefined){
            for (var i = 0; i < this.emoData.length; i++){
                if (this.emoData[i].id == id) {
                    this.selectTab(i);
                }
            }
        }
        this.readyToUse = false;
        this.btnClose.setVisible(true);
        this.bg.setPositionX(this.bg.defaultPosition.x - this.bg.width);
        this.bg.setOpacity(0);
        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(0.4, this.bg.defaultPosition.x, this.bg.defaultPosition.y).easing(cc.easeBackOut()),
                cc.fadeIn(0.4)
            ),
            cc.callFunc(function(){
                this.readyToUse = true;
            }.bind(this))
        ));
    },

    hide: function() {
        this.readyToUse = true;
        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(0.4, this.bg.defaultPosition.x - this.bg.width, this.bg.defaultPosition.y).easing(cc.easeBackIn()),
                cc.fadeOut(0.4)
            ),
            cc.callFunc(function(){
                this.btnClose.setVisible(false);
                this.removeFromParent();
            }.bind(this))
        ))
    },
    /* endregion Base Flows */

    //table delegate
    tableCellAtIndex: function(table, idx) {
        var cell = table.dequeueCell();
        if (!cell)
            cell = new ChatEmoCell(this.numCol, this.emoSize, this.emoPos, this.cellSize, this);

        var emoData = [];
        var data = this.emoData[this.selectedTab];
        for (var i = idx * this.numCol; i < data.listItemId.length && i < (idx + 1) * this.numCol; i++){
            var emo = {
                id: data.id,
                emoId: data.listItemId[i],
                animType: StorageManager.getEmoticonAnimationType(data.id),
                scale: this.getEmoticonScale(data.id)
            };
            if (data.groups){
                for (var j = 0; j < data.groups.length; j++){
                    if (data.groups[j].listItemId.indexOf(Number(emo.emoId)) != -1){
                        if (NewVipManager.getInstance().getRealVipLevel() < data.groups[j].vip) {
                            emo.isLock = true;
                            emo.lockMess = "Vip " + data.groups[j].vip;
                        }
                        else if (gamedata.userData.level < data.groups[j].level){
                            emo.isLock = true;
                            emo.lockMess = "Level " + data.groups[j].level;
                        }
                        else emo.isLock = false;
                        break;
                    }
                }
            }
            else emo.isLock = false;

            emoData.push(emo);
        }

        cell.setColor(this.isLock ? cc.color("#aaaaaa") : cc.color("#ffffff"));
        cell.setOpacity(this.isLock ? 100 : 255);
        cell.setData(emoData);
        return cell;
    },

    tableCellSizeForIndex: function(table, idx) {
        return this.cellSize;
    },

    numberOfCellsInTableView: function(table) {
        if (!this.emoData[this.selectedTab]) return 0;
        else return Math.ceil(this.emoData[this.selectedTab].listItemId.length / this.numCol);
    },

    selectTab: function(id) {
        var oldSelectedTab = this.selectedTab;
        if (id < 0 || id >= this.emoData.length) id = 0;
        this.selectedTab = id;
        this.setSelectedButton(this.selectedTab);

        if (NewVipManager.getInstance().getRealVipLevel() < this.emoData[this.selectedTab].vip)
            this.setLock(true, "Cần vip #d để mở khóa".replace("#d",  this.emoData[this.selectedTab].vip));
        else if (gamedata.userData.level < this.emoData[this.selectedTab].level)
            this.setLock(true, "Cần level #d để mở khóa".replace("#d", this.emoData[this.selectedTab].level));
        else{
            var emoId = this.emoData[this.selectedTab].id;
            var selectedEmoInfo = StorageManager.getInstance().userItemInfo[StorageManager.TYPE_EMOTICON][emoId];
            if (selectedEmoInfo)
                this.setLock(false);
            else{
                if (this.emoData[this.selectedTab].subTypes.indexOf(StorageManager.SUBTYPE_EMOTICON.LIMIT_7_DAY) != -1
                    || this.emoData[this.selectedTab].subTypes.indexOf(StorageManager.SUBTYPE_EMOTICON.LIMIT_30_DAY) != -1)
                    this.setLock(true, "Mở khóa trong cửa hàng");
                else if (this.emoData[this.selectedTab].subTypes.indexOf(StorageManager.SUBTYPE_EMOTICON.EVENT_ONLY) != -1)
                    this.setLock(true, "Mở khóa trong sự kiện");
                else
                    this.setLock(true, "Bộ biểu cảm đang bị tạm khóa");
            }
        }

        this.tbEmo.reloadData();
    },

    setSelectedButton: function(id){
        for (var i = 0; i < this.btnList.getItems().length; i++){
            var btn = this.btnList.getItem(i);
            btn.getChildByName("inactive").setVisible(i != id);
            btn.getChildByName("active").setVisible(i == id);
            btn.getChildByName("time").setVisible(i == id);

            if (i == id){
                var emoId = this.emoData[i].id;
                var selectedEmoInfo = StorageManager.getInstance().userItemInfo[StorageManager.TYPE_EMOTICON][emoId];
                if (selectedEmoInfo){
                    var remainTime = selectedEmoInfo[0].remainTime;
                    if (remainTime < 0) btn.getChildByName("time").setVisible(false);
                    else{
                        var m = Math.ceil(remainTime / 60000);
                        var h = Math.floor(m / 60);
                        m -= h * 60;
                        var d = Math.floor(h / 24);
                        h -= d * 24;
                        var timeStr = "";
                        if (d > 0)
                            timeStr = d + "d" + ":" + (h < 10 ? "0":"") + h + "h";
                        else
                            timeStr = (h < 10 ? "0":"") + h + "h" + ":" + (m < 10 ? "0":"") + m + "p";
                        btn.getChildByName("time").setString(timeStr);
                    }
                }
                else btn.getChildByName("time").setVisible(false);
            }
        }
    },

    setLock: function(isLock, mess){
        this.bgLock.setVisible(isLock);
        this.pItem.setVisible(isLock);
        this.tbEmo.setColor(cc.color(100, 100, 100));
        this.isLock = isLock;
        if (isLock)
            this.lockText.setString(mess);
    },

    useEmoticon: function(emoIdx){
        if (!this.readyToUse || !this.emoData[this.selectedTab]) return;
        var id = this.emoData[this.selectedTab].id;
        var emoId = this.emoData[this.selectedTab].listItemId[emoIdx];
        StorageManager.getInstance().sendUseEmoticon(id, emoId);
        this.hide();
    },

    //switch case things
    getBtnTabInactivePos: function(emoId){
        switch(Number(emoId)){
            case 0:
                return cc.p(35, 45);
            case 1:
                return cc.p(36, 49);
        }
        return cc.p(0, 0);
    },

    getEmoticonScale: function(emoId){
        switch(Number(emoId)){
            case 0:
                return 0.7;
            case 1:
                return 0.1;
        }
        return 1;
    }
});

ChatEmoGUI.className = "ChatEmoGUI";
ChatEmoGUI.BTN_CLOSE = 0;
ChatEmoGUI.GUI_TAG = 820;

ChatEmoGUI.TYPE_DRAGONBONE = 0;
ChatEmoGUI.TYPE_SPINE = 1;

var ChatEmoCell = cc.TableViewCell.extend({
    ctor: function(numCol, emoSize, emoPos, cellSize, chatEmoGUI) {
        this._super();
        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);

        this.numCol = numCol;
        this.emoSize = emoSize;
        this.emoPos = emoPos;
        this.cellSize = cellSize;
        this.chatEmoGUI = chatEmoGUI;

        this._layout = new cc.Layer(this.cellSize.width, this.cellSize.height);
        this._layout.setCascadeColorEnabled(true);
        this._layout.setCascadeOpacityEnabled(true);
        this.addChild(this._layout);

        for (var i = 0; i < this.numCol; i++){
            var panel = new ccui.Layout();
            panel.setContentSize(this.emoSize);
            panel.setPosition(this.emoPos[i]);
            panel.setTouchEnabled(true);
            panel.setSwallowTouches(false);
            panel.setCascadeColorEnabled(true);
            panel.setCascadeOpacityEnabled(true);
            panel.addTouchEventListener(function(target, type){
                if (target.isLock) return;
                switch(type){
                    case ccui.Widget.TOUCH_BEGAN:
                        target.isWaitingTouch = true;
                        break;
                    case ccui.Widget.TOUCH_MOVED:
                        if (target.isWaitingTouch) {
                            var touchBeganPos = target.getTouchBeganPosition();
                            var touchMovePos = target.getTouchMovePosition();
                            if (Math.sqrt(Math.pow(touchMovePos.x - touchBeganPos.x, 2) + Math.pow(touchMovePos.y - touchBeganPos.y, 2)) > 2)
                                target.isWaitingTouch = false;
                        }
                        break;
                    case ccui.Widget.TOUCH_ENDED:
                        if (target.isWaitingTouch){
                            this.chatEmoGUI.useEmoticon(this.getIdx() * this.numCol + target.getTag());
                        }
                        break;
                    case ccui.Widget.TOUCH_CANCELED:
                        break;
                }
            }.bind(this), this);

            panel.emoLock = new cc.Sprite("Storage/emo_panel/emoLock.png");
            panel.emoLock.setAnchorPoint(0.5, 0.5);
            panel.emoLock.setPosition(this.emoSize.width/2, this.emoSize.height/2);
            panel.addChild(panel.emoLock, 1, 0);
            panel.lockText = new ccui.Text("", "fonts/tahoma.ttf", 13);
            panel.lockText.setAnchorPoint(0.5, 0.5);
            panel.lockText.setPosition(this.emoSize.width/2, 28);
            panel.lockText.setTextColor(cc.color("#e8dff0"));
            panel.lockText.ignoreContentAdaptWithSize(true);
            panel.lockText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            panel.lockText.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
            panel.addChild(panel.lockText, 1, 1);

            this._layout.addChild(panel, 0, i);
        }

        this.cacheAnim = [];
        for (var i = 0; i < this.numCol; i++)
            this.cacheAnim.push({});
    },

    setData: function(emoData) {
        for (var i = 0; i < this.numCol; i++){
            var panel = this._layout.getChildByTag(i);
            if (i >= emoData.length) panel.setVisible(false);
            else{
                panel.setVisible(true);
                var emo = emoData[i];
                panel.emoLock.setVisible(emo.isLock);
                panel.lockText.setVisible(emo.isLock);
                panel.isLock = emo.isLock;
                if (emo.isLock){
                    panel.lockText.setString(emo.lockMess);
                }

                panel.removeChildByTag(999);
                var anim;
                switch(emo.animType) {
                    case StorageManager.ANIM_TYPE_DRAGONBONES:
                        anim = this.cacheAnim[i][emo.id];
                        if (!anim){
                            anim = db.DBCCFactory.getInstance().buildArmatureNode("Emoticon" + emo.id);
                            anim.setPosition(this.emoSize.width / 2, this.emoSize.height / 2);
                            anim.retain();
                            anim.setScale(emo.scale);
                            this.cacheAnim[i][emo.id] = anim;
                        }
                        anim.getAnimation().gotoAndPlay("" + emo.emoId, -1, -1, 0);
                        break;
                    case StorageManager.ANIM_TYPE_SPINE:
                        if (!this.cacheAnim[i][emo.id])
                            this.cacheAnim[i][emo.id] = {};
                        anim = this.cacheAnim[i][emo.id][emo.emoId];
                        if (!anim){
                            anim = new CustomSkeleton("Armatures/Emoticon/" + emo.id, emo.emoId);
                            anim.setPosition(this.emoSize.width / 2, this.emoSize.height / 2);
                            anim.retain();
                            anim.setScale(emo.scale);
                            anim.setAnimation(0, 'animation', true);
                            this.cacheAnim[i][emo.id][emo.emoId] = anim;
                        }
                        break;
                }
                panel.addChild(anim, 0, 999);
            }
        }
    }
});