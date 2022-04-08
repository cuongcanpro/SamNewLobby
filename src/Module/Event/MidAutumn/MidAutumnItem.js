/**
 * He thong Item moi trong EventMgr Trung THu
 */

var MidAutumnLampInGame = cc.Node.extend({
    ctor: function () {
        this._super();

        this.imgLamp = new cc.Sprite();
        this.addChild(this.imgLamp);
        this.imgLamp.setScale(0.7);

        this.pEffect = new cc.Node();
        this.addChild(this.pEffect);
    },

    playEfxStardust: function () {
        return;
        var pEffect = this.pEffect;
        pEffect.removeAllChildren();
        //effect dom lua bay bay
        this.runAction(
            cc.sequence(
                cc.callFunc(function () {
                    var random = Math.random();
                    if (random < Math.random() * 0.2) {
                        var sprite = new cc.Sprite("res/Event/MidAutumn/MidAutumnUI/firedust.png");
                        sprite.setColor(cc.color(251, 255, 91));
                        sprite.setPosition(-10, -20);
                        pEffect.addChild(sprite);
                        var randomTime = Math.random() * 4 + 3;
                        var rAction1 = Math.random();
                        var rAction2 = Math.random();
                        var rScale = Math.random() * 0.4 + 0.2;
                        var rOpacity = Math.random() * 100 + 155;
                        var rTimeOpacity = Math.random();
                        var rTimeBlink = Math.random() + 0.1;
                        var pos = sprite.getPosition();
                        sprite.setScale(rScale);
                        sprite.setOpacity(rOpacity);
                        var rate = 0.3;
                        var p1 = pos;
                        var p2 = cc.p(pos.x + Math.random() * 100 * rate - 50* rate, pos.y + Math.random() * 150* rate + 50* rate);
                        var p3 = cc.p(p1.x / 2 + p2.x / 2 + Math.random() * 200* rate - 100* rate, p1.y / 2 + p2.y / 2 + Math.random() * 100* rate - 50* rate);
                        var p4 = cc.p(p1.x / 2 + p2.x / 2 + Math.random() * 200 * rate- 100* rate, p1.y / 2 + p2.y / 2 + Math.random() * 100* rate - 50* rate);
                        sprite.runAction(
                            cc.sequence(
                                cc.spawn(
                                    cc.bezierTo(randomTime, [p1, p3, p4, p2]).easing(cc.easeQuarticActionOut(5)),
                                    cc.sequence(
                                        cc.fadeTo(randomTime * rTimeOpacity, 255),
                                        cc.fadeOut(randomTime * (1 - rTimeOpacity))
                                    )
                                ),
                                cc.removeSelf()
                            )
                        )
                        sprite.runAction(
                            cc.sequence(
                                cc.spawn(
                                    cc.sequence(
                                        cc.fadeIn(rTimeBlink),
                                        cc.fadeOut(rTimeBlink)
                                    )
                                )
                            ).repeatForever()
                        );
                    }
                }, this),
                cc.delayTime(0.1)
            ).repeatForever()
        )
    },

    setInfo: function (id) {
        if (id >= 0) {
            this.imgLamp.setTexture(midAutumn.getImgLamp(id));
            this.playEfxStardust();
            this.setVisible(true);
        }
        else {
            try {
                this.setVisible(false);
            }
            catch (e) {
                cc.log("BUG");
            }
        }
    }
})

var MidAutumnLampItem = cc.Node.extend({
    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/MidAutumn/MDLampItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        // this._layout.setPosition(this.bg.getContentSize().width * 0.5, 0);
        this.panelGift = ccui.Helper.seekWidgetByName(this._layout, "panelGift");
        this.imgGift = new cc.Sprite();
        this.panelGift.addChild(this.imgGift);
        this.imgGift.setScale(0.8);
        this.lbSender = ccui.Helper.seekWidgetByName(this._layout, "lbSender");
        this.lbUse = ccui.Helper.seekWidgetByName(this._layout, "lbUse");
        this.btnMessage = ccui.Helper.seekWidgetByName(this._layout, "btnMessage");
        this.btnUse = ccui.Helper.seekWidgetByName(this._layout, "btnUse");
        this.btnUse.addClickEventListener(this.onUseItem.bind(this));
        this.imgType = ccui.Helper.seekWidgetByName(this._layout, "imgType");
        this.bgNum = ccui.Helper.seekWidgetByName(this._layout, "bgNum");
        this.lbNum = ccui.Helper.seekWidgetByName(this.bgNum, "lbNum");

        this.bgNumChange = ccui.Helper.seekWidgetByName(this._layout, "bgNumChange");
        this.lbNumChange = ccui.Helper.seekWidgetByName(this.bgNumChange, "lbNum");
        this.bgNumChange.setVisible(false);

        this.setContentSize(this.bg.getContentSize().width * 1.3, this.bg.getContentSize().width * 1.3);
        this._contentSize = cc.size(this.bg.getContentSize().width * 1.3, this.bg.getContentSize().width * 1.3);
        this.btnMessage.addClickEventListener(this.onClickMessage.bind(this));

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,

            onTouchBegan: this.onTouchBegan.bind(this),

            onTouchEnded: this.onTouchEnded.bind(this),

            onTouchMoved: this.onTouchMoved.bind(this),
        }, this.bg);
    },

    onTouchBegan: function (touch, event) {
        if (this.isVisible() && this.info && !this.info.isRolledLamp && this.info.id > 0) {
            var p = touch.getLocation();
            var pos = event.getCurrentTarget().getParent().convertToNodeSpace(p);
            var cp = this.bg.getPosition();
            var rect = cc.rect(cp.x - this.bg.getContentSize().width * 0.5, cp.y - this.bg.getContentSize().height * 0.5, this.bg.getContentSize().width, this.bg.getContentSize().height);
            if (cc.rectContainsPoint(rect, pos)) {
                cc.log("CHAM VO DAY ");
                this.isTouch = true;
                return true;
            } else {
                //this.touchPosition = cc.p(0, 0);
            }
        }
        return false;
    },

    onTouchMoved: function (touch, event) {
        this.isTouch = false;
    },

    onTouchEnded: function (touch, event) {
        if (this.isTouch) {
            cc.log("TOUCH END ");
            this.onClickMessage();
        }
        this.isTouch = false;
    },

    onClickMessage: function () {
        var gui = sceneMgr.getGUIByClassName(MidAutumnLampGUI.className);
        if (gui) {
            var pos = this.convertToWorldSpace(cc.p(0, 0));
            gui.showFriendMessage(pos, this.info.id, this.info.fromUserName, this.info.message);
        }
    },

    onUseItem: function () {
        cc.log("USE ITEM ");
        midAutumn.sendUseLamp(this.info.isRolledLamp, this.info.id, this.info.index);
    },

    updateLampInfo: function (info) {
        this.info = info;
        if (info.id >= 0) {

            this.imgGift.setVisible(true);
            this.imgGift.setTexture(midAutumn.getImgLamp(info.id));

            if (info.type > 1) {
                this.imgType.setVisible(true);
                this.imgType.loadTexture(midAutumn.getImgType(info.type));
            }
            else {
                this.imgType.setVisible(false);
            }

            if (info.isRolledLamp) {
                this.bgNum.setVisible(true);
                this.lbNum.setString(info.num);
                this.lbSender.setVisible(false);
                this.bg.loadTexture("res/Event/MidAutumn/MidAutumnUI/bgLampRoll.png");
                this.btnMessage.setVisible(false);
            }
            else {
                this.btnMessage.setVisible(true);
                this.bgNum.setVisible(false);
                this.lbSender.setVisible(true);
                this.lbSender.setString(StringUtility.subStringTextLength(info.fromUserName));
                this.bg.loadTexture("res/Event/MidAutumn/MidAutumnUI/bgLampFriend.png");
            }
            cc.log("ID Lamp " + info.id);

            var isUsing = midAutumn.isUsingLamp(info.id, info.index, info.isRolledLamp);
            this.lbUse.setVisible(isUsing);
            this.btnUse.setVisible(!isUsing);
        }
        else {
            if (info.fromId < 0) {
                this.bg.loadTexture("res/Event/MidAutumn/MidAutumnUI/bgLampRollEmpty.png");
            }
            else {
                this.bg.loadTexture("res/Event/MidAutumn/MidAutumnUI/bgLampFriendEmpty.png");
            }
            this.btnUse.setVisible(false);
            this.lbSender.setVisible(false);
            this.imgGift.setVisible(false);
            this.bgNum.setVisible(false);
            this.lbUse.setVisible(false);
            this.btnMessage.setVisible(false);
            this.imgType.setVisible(false);
        }
    }
});

var MidAutumnLampSendCell = cc.TableViewCell.extend({
    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/MidAutumn/MDLampSendItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        // this._layout.setPosition(this.bg.getContentSize().width * 0.5, 0);
        this.imgSelect = ccui.Helper.seekWidgetByName(this._layout, "imgSelect");
        this.imgSelect.setVisible(false);
        this.panelGift = ccui.Helper.seekWidgetByName(this._layout, "panelGift");
        this.imgGift = new cc.Sprite();
        this.panelGift.addChild(this.imgGift);
        this.imgGift.setScale(0.6);
        this.lbName = ccui.Helper.seekWidgetByName(this._layout, "lbName");
        this.imgMessage = ccui.Helper.seekWidgetByName(this._layout, "iconMessage");
        this.imgMessage.setVisible(false);

        this.imgType = ccui.Helper.seekWidgetByName(this._layout, "iconType");

        this.bgNum = ccui.Helper.seekWidgetByName(this._layout, "bgNum");
        this.lbNum = ccui.Helper.seekWidgetByName(this._layout, "lbNum");

        this.bgNumChange = ccui.Helper.seekWidgetByName(this._layout, "bgNumChange");
        this.lbNumChange = ccui.Helper.seekWidgetByName(this.bgNumChange, "lbNum");
        this.bgNumChange.setVisible(false);

        this._layout.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.5);

        this.setContentSize(this.bg.getContentSize().width, this.bg.getContentSize().height);
    },

    setSelect: function (value) {
        this.imgSelect.setVisible(value);
    },

    updateLampSendInfo: function (info) {
        this.info = info;
        this.imgGift.setTexture(midAutumn.getImgLamp(info.id));
        this.lbNum.setString(info.num);
        if (info.type > 1) {
            this.imgType.setVisible(true);
            this.imgType.loadTexture(midAutumn.getImgType(info.type));
        }
        else {
            this.imgType.setVisible(false);
        }
    }
});

var MidAutumnLampCell = cc.TableViewCell.extend({
    ctor: function (size) {
        this._super();
        this.arrayItem = [];
        this.size = size;
        var sum = 0;
        for (var i = 0; i < MD_MAX_FRIEND; i++) {
            this.arrayItem[i] = new MidAutumnLampItem();
            this.addChild(this.arrayItem[i]);
            sum = sum + this.arrayItem[i].getContentSize().width;

        }
        var pad = (size.width - sum) / (MD_MAX_FRIEND - 1);
        for (var i = 0; i < MD_MAX_FRIEND; i++) {
            this.arrayItem[i].setPosition(this.arrayItem[i].getContentSize().width * (i + 0.5) + i * pad, size.height * 0.5);
        }
    },

    updateInfo: function (idx) {
        cc.log("UPDATE INFO cell " + idx);
        var start = idx * MD_MAX_FRIEND;
        for (var i = 0; i < MD_MAX_FRIEND; i++) {
            if (start + i < midAutumn.arrayLamp.length) {
                this.arrayItem[i].updateLampInfo(midAutumn.arrayLamp[start + i]);
                this.arrayItem[i].setVisible(true);
            }
            else {
                //this.arrayItem[i].updateLampInfo();
                cc.log("SET VISIBLE " + idx);
                this.arrayItem[i].setVisible(false);
            }
        }
    },

});

var MidAutumnLampStorage = cc.Node.extend({

    ctor: function (size) {
        this._super();
        this.setContentSize(size);

        midAutumn.arrayLamp = [];
        this.uiLamp = new cc.TableView(this, size);
        this.uiLamp.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.uiLamp.setVerticalFillOrder(1);
        this.uiLamp.setDelegate(this);
        this.addChild(this.uiLamp);

        // this.uiLamp.reloadData();

        this.cellHeight = 145;
        // this.uiLamp.setPosition(100, 0);
    },

    onEnterFinish: function () {

    },

    updateListLamp: function () {
        this.uiLamp.reloadData();
        if (this.isVisible()) {
            midAutumn.saveListLamp();
        }
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(this.getContentSize().width, this.cellHeight);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new MidAutumnLampCell(cc.size(this.getContentSize().width, this.cellHeight));
        }
        cell.updateInfo(Math.ceil((midAutumn.arrayLamp.length)/ MD_MAX_FRIEND) - 1 - idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return Math.ceil((midAutumn.arrayLamp.length)/ MD_MAX_FRIEND);
    },

    tableCellTouched: function (table, cell) {

    },
});

var MidAutumnLampGUI = BaseLayer.extend({

    ctor: function () {
        this._super(MidAutumnLampGUI.className);
        if (CheckLogic.isNewLobby())
            this.initWithBinaryFileAndOtherSize("res/Event/MidAutumn/MidAutumnLampGUI.json", cc.size(800, 480));
        else
            this.initWithBinaryFile("res/Event/MidAutumn/MidAutumnLampGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");
        this.tabStorage = this.customButton("tabStorage", MidAutumnLampGUI.BTN_STORAGE, this._bg, false);
        this.tabStorage.oldSize = this.tabStorage.getContentSize();
        this.tabStorage.lbTitle = this.getControl("lbTitle", this.tabStorage);

        this.tabChangeLamp = this.customButton("tabChangeLamp", MidAutumnLampGUI.BTN_CHANGE_LAMP, this._bg, false);
        this.tabChangeLamp.lbTitle = this.getControl("lbTitle", this.tabChangeLamp);
        this.tabChangeLamp.oldSize = this.tabStorage.getContentSize();

        this.btnClose = this.customButton("btnClose", MidAutumnLampGUI.BTN_CLOSE, this._bg, false);
        this.pStorage = this.getControl("pStorage", this._bg);
        this.pChangeLamp = this.getControl("pChangeLamp", this._bg);
        this.lbNumFriendSend = this.getControl("lbNumFriendSend", this.pStorage);

        this.changeLamp = new MDChangeLamp();
        this.pChangeLamp.addChild(this.changeLamp);

        this.storage = new MidAutumnLampStorage(this.pStorage.getContentSize());
        this.pStorage.addChild(this.storage);

        this.pChangeLamp.setVisible(false);

        this.friendMessage = new MDFriendMessage();
        this.addChild(this.friendMessage);
        this.friendMessage.setVisible(false);

        var tHisNormal = "res/Event/MidAutumn/MidAutumnUI/tabSelect.png";
        var tHisSelect = "res/Event/MidAutumn/MidAutumnUI/tab.png";
        this.tabStorage.loadTextures(tHisNormal, tHisNormal, tHisSelect);
        this.tabStorage.setContentSize(this.tabStorage.oldSize);
        this.tabStorage.lbTitle.setColor(cc.color(35, 106, 42, 255));

        this.tabChangeLamp.loadTextures(tHisSelect, tHisSelect, tHisNormal);
        this.tabChangeLamp.setContentSize(this.tabChangeLamp.oldSize);
        this.tabChangeLamp.lbTitle.setColor(cc.color(159, 234, 105, 255));

        this.pStorage.setVisible(true);
        this.pChangeLamp.setVisible(false)

        this.enableFog();
    },

    showFriendMessage: function (pos, id, userName, message) {
        this.friendMessage.setInfoFriendMessage(id, userName, message);
        this.friendMessage.show(pos, id);
    },

    updateListLamp: function () {
        this.storage.updateListLamp();
        this.changeLamp.updateListLampChange();
        this.lbNumFriendSend.setString(localized("MD_NUM_FRIEND_SEND") + " " + midAutumn.receivedLampTimeToday + "/" + MD_MAX_FRIEND);
    },

    onEnterFinish: function () {
        this.friendMessage.setVisible(false);
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        this.friendMessage.setVisible(false);
        MidAutumnSound.playBubbleSingle();
        switch (id) {
            case MidAutumnLampGUI.BTN_STORAGE:
                var tHisNormal = "res/Event/MidAutumn/MidAutumnUI/tabSelect.png";
                var tHisSelect = "res/Event/MidAutumn/MidAutumnUI/tab.png";
                this.tabStorage.loadTextures(tHisNormal, tHisNormal, tHisSelect);
                this.tabStorage.setContentSize(this.tabStorage.oldSize);
                this.tabStorage.lbTitle.setColor(cc.color(35, 106, 42, 255));

                this.tabChangeLamp.loadTextures(tHisSelect, tHisSelect, tHisNormal);
                this.tabChangeLamp.setContentSize(this.tabChangeLamp.oldSize);
                this.tabChangeLamp.lbTitle.setColor(cc.color(159, 234, 105, 255));

                this.pStorage.setVisible(true);
                this.pChangeLamp.setVisible(false);
                this.storage.updateListLamp();
                break;
            case MidAutumnLampGUI.BTN_CHANGE_LAMP:
                var tHisNormal = "res/Event/MidAutumn/MidAutumnUI/tabSelect.png";
                var tHisSelect = "res/Event/MidAutumn/MidAutumnUI/tab.png";
                this.tabChangeLamp.loadTextures(tHisNormal, tHisNormal, tHisSelect);
                this.tabChangeLamp.setContentSize(this.tabChangeLamp.oldSize);
                this.tabChangeLamp.lbTitle.setColor(cc.color(35, 106, 42, 255));

                this.tabStorage.loadTextures(tHisSelect, tHisSelect, tHisNormal);
                this.tabStorage.setContentSize(this.tabStorage.oldSize);
                this.tabStorage.lbTitle.setColor(cc.color(159, 234, 105, 255));

                this.pStorage.setVisible(false);
                this.pChangeLamp.setVisible(true);
                this.changeLamp.updateListLampChange();
                break;
            case MidAutumnLampGUI.BTN_CLOSE:
                this.onClose();
                break;
        }

    },
});
MidAutumnLampGUI.TAG = 10000;
MidAutumnLampGUI.BTN_CHANGE_LAMP = 0;
MidAutumnLampGUI.BTN_STORAGE= 1;
MidAutumnLampGUI.BTN_CLOSE = 2;
MidAutumnLampGUI.className = "MidAutumnLampGUI";

var MidAutumnSendLampGUI = BaseLayer.extend({

    ctor: function () {
        this._super(MidAutumnSendLampGUI.className);
        this.initWithBinaryFile("res/Event/MidAutumn/MidAutumnSendLampGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");
        this.btnSend = this.customButton("btnSend", MidAutumnSendLampGUI.BTN_SEND, this._bg);
        this.customButton("btnClose", MidAutumnSendLampGUI.BTN_CANCEL, this._bg);

        this.arrayCell = [];
        this.panelLamp = this._bg.getChildByName("panelLamp");
        this.uiLamp = new cc.TableView(this, this.panelLamp.getContentSize());
        this.uiLamp.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.uiLamp.setVerticalFillOrder(1);
        this.uiLamp.setDelegate(this);
        this.panelLamp.addChild(this.uiLamp);
        this.uiLamp.reloadData();

        this.panelAvatar = this.getControl("panelAvatar", this._bg);
        this.uiAvatar = engine.UIAvatar.createWithMask("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.panelAvatar.addChild(this.uiAvatar);
        this.uiAvatar.setPosition(this.panelAvatar.getContentSize().width * 0.5, this.panelAvatar.getContentSize().height * 0.5);
        this.uiAvatar.setScale(1.5);

        var _txInput = ccui.Helper.seekWidgetByName(this._bg,"tfMessage");
        this.txInputTemp = _txInput;
        _txInput.setVisible(false);
        if (cc.sys.isNative){
            this._txInput = BaseLayer.createEditBox(this.txInputTemp);
            this._txInput.setFontColor(cc.color(182, 78, 2, 255));
            this._bg.addChild(this._txInput);
        }

        this.userId = 0;
        this.ignoreAllButtonSound();
        this.enableFog();
        this.select = -1;
    },

    updateListLampSend: function () {
        this.uiLamp.reloadData();
    },

    onEnterFinish : function () {
        midAutumn.sendGetLampInfo();
        this.setShowHideAnimate(this._bg,true);
        this.btnSend.setVisible(true);
        if (!cc.sys.isNative){
            this._txInput = BaseLayer.createEditBox(this.txInputTemp);
            this._txInput.setFontColor(cc.color(182, 78, 2, 255));
            this._bg.addChild(this._txInput);
        }
        this.select = -1;
        for (var i = 0; i < this.arrayCell.length; i++) {
            this.arrayCell[i].setSelect(false);
        }
        for (var i = 0; i < midAutumn.arrayLampToSend.length; i++) {
            midAutumn.arrayLampToSend[i].isSelect = false;
        }
    },

    onExit: function () {
        this._super();
        if (!cc.sys.isNative){
            this._txInput.removeFromParent(true);
        }
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(120, 106);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new MidAutumnLampSendCell();
            this.arrayCell.push(cell);
        }
        cell.updateLampSendInfo(midAutumn.arrayLampToSend[idx]);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return midAutumn.arrayLampToSend.length;
    },

    tableCellTouched: function (table, cell) {
        for (var i = 0; i < this.arrayCell.length; i++) {
            this.arrayCell[i].setSelect(false);
        }
        cell.setSelect(true);
        this.select = cell.getIdx();
        for (var i = 0; i < midAutumn.arrayLampToSend.length; i++) {
            midAutumn.arrayLampToSend[i].isSelect = false;
        }
        midAutumn.arrayLampToSend[this.select].isSelect = true;
    },

    setUserInfo: function (userId, avatar) {
        this.userId = userId;
        this.uiAvatar.asyncExecuteWithUrl(userId, avatar);
        // this.
    },

    onButtonRelease: function (btn, id) {
        MidAutumnSound.playBubbleSingle();
        switch (id) {
            case MidAutumnSendLampGUI.BTN_SEND:
                if (this.select >= 0) {
                    var info = midAutumn.arrayLampToSend[this.select];
                    if (info.num <= 1) {
                        ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_NUM_SEND_BIGGER_1"));
                        return;
                    }
                    else {
                        midAutumn.sendSendLamp(info.id, this.userId, this._txInput.getString());
                        this.btnSend.setVisible(false);
                    }
                    this.onClose();
                }
                else {
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_NOT_SELECT_LAMP"));
                }
                break;
            case MidAutumnSendLampGUI.BTN_CANCEL:
                this.onClose();
                break;
        }

    },
});

MidAutumnSendLampGUI.BTN_SEND = 0;
MidAutumnSendLampGUI.BTN_CANCEL = 1;
MidAutumnSendLampGUI.className = "MidAutumnSendLampGUI";
MidAutumnSendLampGUI.TAG = 1000;

var MidAutumnReceiveLampGUI = BaseLayer.extend({

    ctor: function () {
        this._super(MidAutumnSendLampGUI.className);
        this.initWithBinaryFile("res/Event/MidAutumn/MidAutumnReceiveLampGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");
        this.customButton("btnUse", MidAutumnReceiveLampGUI.BTN_USE, this._bg);
        this.customButton("btnStorage", MidAutumnReceiveLampGUI.BTN_STORAGE, this._bg);
        this.customButton("btnClose", MidAutumnReceiveLampGUI.BTN_STORAGE, this._bg);
        this.lbMessage = this.getControl("lbMessage", this._bg);
        this.lbName = this.getControl("lbName", this._bg);
        this.bgLamp = this.getControl("bgLamp", this._bg);
        this.imgLamp = new cc.Sprite();
        this.bgLamp.addChild(this.imgLamp);
        this.imgLamp.setScale(0.4);
        this.imgLamp.setPosition(this.bgLamp.getContentSize().width * 0.5, this.bgLamp.getContentSize().height * 0.5);
        this.ignoreAllButtonSound();
        this.enableFog();
    },

    onEnterFinish : function () {
        this.setShowHideAnimate(this._bg,true);
    },

    onExit: function () {
        this._super();

    },

    setInfo: function (idLamp, indexLamp, userId, userName, avatar, message) {
        this.id = idLamp;
        this.index = indexLamp;
        this.userId = userId;
        this.lbMessage.setString(message);
        this.lbName.setString(userName);
        this.imgLamp.setTexture(midAutumn.getImgLamp(idLamp));
        // this.
    },

    onButtonRelease: function (btn, id) {
        MidAutumnSound.playBubbleSingle();
        switch (id) {
            case MidAutumnReceiveLampGUI.BTN_USE:
                midAutumn.sendUseLamp(false, this.id, this.index);
                break;
            case MidAutumnReceiveLampGUI.BTN_STORAGE:

                break;
        }
        this.onClose();
    },
});
MidAutumnReceiveLampGUI.TAG = 10002;
MidAutumnReceiveLampGUI.BTN_USE = 0;
MidAutumnReceiveLampGUI.BTN_STORAGE = 1;
MidAutumnReceiveLampGUI.className = "MidAutumnReceiveLampGUI";

var MidAutumnLampChangeItem = cc.Node.extend({
    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/MidAutumn/MDLampSendItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        // this._layout.setPosition(this.bg.getContentSize().width * 0.5, 0);
        this.imgSelect = ccui.Helper.seekWidgetByName(this._layout, "imgSelect");
        this.panelGift = ccui.Helper.seekWidgetByName(this._layout, "panelGift");
        this.imgGift = new cc.Sprite();
        this.panelGift.addChild(this.imgGift);
        this.imgGift.setScale(0.6);
        this.lbName = ccui.Helper.seekWidgetByName(this._layout, "lbName");

        this.bgNum = ccui.Helper.seekWidgetByName(this._layout, "bgNum");
        this.lbNum = ccui.Helper.seekWidgetByName(this._layout, "lbNum");

        this.bgNumChange = ccui.Helper.seekWidgetByName(this._layout, "bgNumChange");
        this.lbNumChange = ccui.Helper.seekWidgetByName(this.bgNumChange, "lbNum");
        this.bgNumChange.setVisible(false);

        this.imgMessage = ccui.Helper.seekWidgetByName(this._layout, "iconMessage");
        this.imgMessage.setVisible(false);
        this.imgType = ccui.Helper.seekWidgetByName(this._layout, "iconType");

        this.imgSelect.setVisible(false);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,

            onTouchBegan: this.onTouchBegan.bind(this),

            onTouchEnded: this.onTouchEnded.bind(this),

            onTouchMoved: this.onTouchMoved.bind(this),
        }, this.bg);
        this.setScale(0.8);
        this.setContentSize(this.bg.getContentSize().width * 1.05, this.bg.getContentSize().height * 0.8);
    },

    onTouchBegan: function (touch, event) {
        if (this.isVisible()) {
            var p = touch.getLocation();
            var pos = event.getCurrentTarget().getParent().convertToNodeSpace(p);
            var cp = this.bg.getPosition();
            var rect = cc.rect(cp.x - this.bg.getContentSize().width * 0.5, cp.y - this.bg.getContentSize().height * 0.5, this.bg.getContentSize().width, this.bg.getContentSize().height);
            if (cc.rectContainsPoint(rect, pos)) {
                cc.log("CHAM VO DAY ");
                this.isTouching = true;
                this.touchTime = new Date().getTime();
                this.schedule(this.update.bind(this), 0.1);
                this.lastNumChange = this.info.numChange;
                return true;
            } else {
                //this.touchPosition = cc.p(0, 0);
            }
        }
        return false;
    },

    onTouchMoved: function (touch, event) {
        cc.log("DELTA NE " + touch.getDelta().y);
        if (Math.abs(touch.getDelta().y) > 2)
            this.isTouching = false;
    },

    onTouchEnded: function (touch, event) {
        if (this.isTouching) {
            var time = new Date().getTime() - this.touchTime;
            if (time < 1000) {
                this.countTouch++;
                this.info.numChange = this.info.numChange + 1;
                var targetNum = this.info.num;
                if (midAutumn.isUsingLamp(this.info.id, this.info.index, this.info.isRolledLamp)) {
                    targetNum = targetNum - 1;
                    if (this.info.numChange > targetNum) {
                        Toast.makeToast(Toast.SHORT, localized("MD_CHANGE_LAMP_USING"));
                    }
                }
                if (this.info.numChange > targetNum) {
                    this.info.numChange = targetNum;
                }
                this.updateLabelNum();
                if (this.countTouch > 5) {
                    Toast.makeToast(Toast.SHORT, localized("MD_CHANGE_PIECE_TOUCH"));
                }
            }
        }
        this.isTouching = false;
        this.unscheduleAllCallbacks();
    },

    update: function () {
        var time = new Date().getTime() - this.touchTime;
        if (time > 500) {
            this.countTouch = 0;
            var num = 0;
            var d = (this.info.num - this.lastNumChange) / 20;
            num = 1 + Math.floor((time - 500) / 100 * d);
            var targetCompare = 0;
            if (midAutumn.isUsingLamp(this.info.id, this.info.index, this.info.isRolledLamp)) {
                targetCompare = 2;
            }
            else {
                targetCompare = 1;
            }
            if (this.info.num - this.lastNumChange - num < targetCompare) {
                this.info.numChange = this.info.num - targetCompare + 1;
            }
            else {
                this.info.numChange = this.lastNumChange + num;
            }
            this.updateLabelNum();
        }
    },

    updateLabelNum: function () {
        if (this.info.numChange > 0) {
            this.bgNumChange.setVisible(true);
            this.bgNum.setVisible(false);
            this.lbNumChange.setString(this.info.numChange + "/" + this.info.num);
        }
        else {
            this.bgNumChange.setVisible(false);
            this.lbNum.setString(this.info.num);
            this.bgNum.setVisible(true);
        }
        //this.breaks[idBreak].num.setString(this.info.item[idBreak] - this.info.numChange[idBreak]);
        var gui = sceneMgr.getGUIByClassName("MidAutumnLampGUI");
        if (gui)
            gui.changeLamp.updateButtonChange();
    },

    setSelect: function (value) {
        this.imgSelect.setVisible(value);
    },

    updateLampChange: function (info) {
        this.info = info;
        this.imgGift.setTexture(midAutumn.getImgLamp(info.id));
        if (info.isRolledLamp) {
            this.imgMessage.setVisible(false);
        }
        else {
            this.imgMessage.setVisible(true);
        }
        if (info.type > 1) {
            this.imgType.setVisible(true);
            this.imgType.loadTexture(midAutumn.getImgType(info.type));
        }
        else {
            this.imgType.setVisible(false);
        }
        this.updateLabelNum();
    },
});

MidAutumnLampChangeItem.NORMAL = 0;
MidAutumnLampChangeItem.CHANGE = 1;

var MidAutumnLampChangeCell = cc.TableViewCell.extend({
    ctor: function (size) {
        this._super();
        this.arrayItem = [];
        this.size = size;
        var sum = 0;
        for (var i = 0; i < MD_NUM_LAMP_CHANGE; i++) {
            this.arrayItem[i] = new MidAutumnLampChangeItem();
            this.addChild(this.arrayItem[i]);
            sum = sum + this.arrayItem[i].getContentSize().width;

        }
        var pad = (size.width - sum) / (MD_NUM_LAMP_CHANGE - 1);
        for (var i = 0; i < MD_NUM_LAMP_CHANGE; i++) {
            this.arrayItem[i].setPosition(this.arrayItem[i].getContentSize().width * (i + 0.5) + i * pad, size.height * 0.5);
        }
    },

    updateLampChangeCell: function (idx) {
        var start = idx * MD_NUM_LAMP_CHANGE;
        for (var i = 0; i < MD_NUM_LAMP_CHANGE; i++) {
            if (start + i < midAutumn.arrayLampChange.length) {
                this.arrayItem[i].updateLampChange(midAutumn.arrayLampChange[start + i]);
                this.arrayItem[i].setVisible(true);
            }
            else {
                //this.arrayItem[i].updateLampInfo();
                this.arrayItem[i].setVisible(false);
            }
        }
    },
});

var MDChangeLamp = BaseLayer.extend({
    ctor: function () {
        this._super("");

        var jsonLayout = ccs.load("res/Event/MidAutumn/MDChangeLamp.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.panelItem = ccui.Helper.seekWidgetByName(this._layout, "panelItem");
        this.btnChange = this.customButton("btnChange", MDChangeLamp.CHANGE, this._layout);
        // this.checkBox = ccui.Helper.seekWidgetByName(this._layout, "checkBox");
        this.btnDeselect = this.customButton("btnDeselect", MDChangeLamp.DESELECT_ALL, this._layout);
        this.btnSelect = this.customButton("btnSelectAll", MDChangeLamp.SELECT_ALL, this._layout);
        this.lbGold = this.getControl("lbGold", this._layout);
        this.lbNoPiece = this.getControl("lbNoPiece", this.panelItem);

        this.arrayLbPrice = [];
        this.arrayLbNum = [];
        for (var i = 0; i < 3; i++) {
            this.arrayLbPrice[i] = this.getControl("lbPrice_" + i, this._layout);
            this.arrayLbNum[i] = this.getControl("lbNum_" + i, this._layout);
        }

        this.heightCell = 100;
        this.listItem = new cc.TableView(this, cc.size(this.panelItem.getContentSize().width, this.panelItem.getContentSize().height));
        this.listItem.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listItem.setVerticalFillOrder(1);
        this.listItem.setDelegate(this);
        this.panelItem.addChild(this.listItem);
        this.listItem.reloadData();
    },

    onEnterFinish: function () {
        if (midAutumn.arrayLampChange.length > 0) {
            this.lbNoPiece.setVisible(false);
        }
        else {
            this.lbNoPiece.setVisible(true);
        }

        // this.updateListLampChange();
    },

    updateButtonChange: function () {
        var sum = 0;
        for (var i = 0; i < midAutumn.lampTypeId.length; i++) {
            var type = midAutumn.lampTypeId[i];
            var num = midAutumn.getNumLampChangeByType(type)
            this.arrayLbNum[i].setString(num);
            sum = sum + num * midAutumn.lampTypeValue[i];
        }
        this.lbGold.setString(StringUtility.pointNumber(sum));
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case MDChangeLamp.CHANGE:
                cc.log("CHANGE ITEM");
                midAutumn.sendChangeLamp();
                break;
            case MDChangeLamp.DESELECT_ALL:
                cc.log("DESELECT");
                midAutumn.resetChangeLamp();
                this.updateButtonChange();
                this.listItem.reloadData();
                break;
            case MDChangeLamp.SELECT_ALL:
                midAutumn.autoSelectChangeLamp();
                this.updateButtonChange();
                this.listItem.reloadData();
                break;
            default:
                break;
        }
    },

    updateListLampChange: function () {
        for (var i = 0; i < midAutumn.lampTypeId.length; i++) {
            this.arrayLbPrice[i].setString(StringUtility.formatNumberSymbol(midAutumn.lampTypeValue[i]));
        }
        midAutumn.resetChangeLamp();
        this.listItem.reloadData();
        this.updateButtonChange();
        if (midAutumn.arrayLampChange.length > 0) {
            this.lbNoPiece.setVisible(false);
        }
        else {
            this.lbNoPiece.setVisible(true);
        }
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(this.panelItem.getContentSize().width, this.heightCell);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new MidAutumnLampChangeCell(cc.size(this.panelItem.getContentSize().width, this.heightCell));
        }
        cell.updateLampChangeCell(Math.ceil(midAutumn.arrayLampChange.length / MD_NUM_LAMP_CHANGE) - idx - 1);
        // cell.updateLampChangeCell(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return Math.ceil(midAutumn.arrayLampChange.length / MD_NUM_LAMP_CHANGE);
    },
});
MDChangeLamp.SELECT_ALL = 0;
MDChangeLamp.DESELECT_ALL = 1;
MDChangeLamp.CHANGE = 2;

var MDFriendMessage = cc.Node.extend({
    ctor: function () {
        this._super();
        var jsonLayout = ccs.load("res/Event/MidAutumn/MDFriendMessage.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        // this._layout.setPosition(this.bg.getContentSize().width * 0.5, 0);
        this.panelGift = ccui.Helper.seekWidgetByName(this._layout, "panelGift");
        this.lbName = ccui.Helper.seekWidgetByName(this._layout, "lbName");
        this.lbMessage = ccui.Helper.seekWidgetByName(this._layout, "lbMessage");

        this.imgGift = new cc.Sprite();
        this.panelGift.addChild(this.imgGift);
        this.imgGift.setPosition(this.panelGift.getContentSize().width * 0.5, this.panelGift.getContentSize().height * 0.5);
        this.imgGift.setScale(0.5);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,

            onTouchBegan: this.onTouchBegan.bind(this),

            onTouchEnded: this.onTouchEnded.bind(this),

            onTouchMoved: this.onTouchMoved.bind(this),
        }, this.bg);
        this.setContentSize(this.bg.getContentSize().width * 1.0, this.bg.getContentSize().height * 1.0);
    },

    onTouchBegan: function (touch, event) {
        if (this.isVisible())
            this.setVisible(false);
        return false;
    },

    onTouchMoved: function (touch, event) {

    },

    onTouchEnded: function (touch, event) {

    },

    setInfoFriendMessage: function (id, userName, message) {
        this.imgGift.setTexture(midAutumn.getImgLamp(id));
        this.lbName.setString(userName);
        this.lbMessage.setString(message);
    },

    show: function (pos) {
        this.setPosition(pos.x, pos.y - this.bg.getContentSize().height * 0.7);
        this.setVisible(true);
        this.stopAllActions();
        this.setScale(0);
        this.runAction(new cc.EaseBackOut(cc.scaleTo(0.5, 1.0)));
    },
});

var LampModel = cc.Class.extend({
    ctor: function () {
        this.id = -1;
        this.index = 0;
        this.message = "";
        this.fromId = -1;
        this.gold = 0;
        this.num = 0;
        this.isSelect = false;
        this.isNew = false;
        this.isRolledLamp = false;
        this.numChange = 0;
        this.type = 0;
        this.fromUserName = "";
    },

    clone: function (model) {
        this.id = model.id;
        this.index = model.index;
        this.message = model.message;
        this.fromId = model.fromId;
        this.gold = model.gold;
        this.num = model.num;
        this.isSelect = false;
        this.isNew = model.isNew;
        this.isRolledLamp = model.isRolledLamp;
        this.type = model.type;
        this.fromUserName = model.fromUserName;
    }
})