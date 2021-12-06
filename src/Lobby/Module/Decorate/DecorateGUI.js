/**
 * Created by cuongcan_pro on 7/31/2017.
 */


var DecorateItem = cc.Node.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("DecorateItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);
        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.labelTime = ccui.Helper.seekWidgetByName(this._layout, "labelTime");
        this.labelTime.setLocalZOrder(3);
        this.btnUse = this.customizeButton("btnUse", this._layout, DecorateItem.BTN_USE);
        this.btnBuy = this.customizeButton("btnBuy", this._layout, DecorateItem.BTN_BUY);
        this.btnSelect = this.customizeButton("btnSelect", this._layout, DecorateItem.BTN_SELECT);
        this.labelGold = ccui.Helper.seekWidgetByName(this.btnBuy, "labelPrice");
        this.labelUse = ccui.Helper.seekWidgetByName(this._layout, "labelUse");
        this.panelItem = ccui.Helper.seekWidgetByName(this._layout, "panelItem");
        this.active = ccui.Helper.seekWidgetByName(this._layout, "active");
        this.item =  db.DBCCFactory.getInstance().buildArmatureNode("IconFlag");
        this.panelItem.addChild(this.item);
        this.active.setVisible(false);
        this.data = {};
    },

    customizeButton : function (name, parent, tag) {
        var btn = this.getControl(name, parent);
        btn.setPressedActionEnabled(true);
        btn.setTag(tag);
        btn.addTouchEventListener(this.onTouchEventHandler,this);
        return btn;
    },

    getControl : function (cName,parent) {
        var p = null;
        if(typeof  parent === 'undefined')
        {
            p = this._layout;
        }
        else if(typeof parent === 'string')
        {
            p = ccui.Helper.seekWidgetByName(this._layout,parent);
        }
        else
        {
            p = parent;
        }

        var control = ccui.Helper.seekWidgetByName(p,cName);
        if(control == null)
        {
            cc.log("$getControl error " + cName);
            return null;
        }

        this.analyzeCustomControl(control);

        return control;
    },


    analyzeCustomControl : function (control) {
        if(control.customData === undefined)
        {
            if(control.getTag() < 0) // scale theo ty le nho nhat
            {
                this.processScaleControl(control);
            }
            return;
        }

        var s = control.customData;

        if(s.indexOf("scale") > -1) // scale theo ty le nho nhat
        {
            this.processScaleControl(control);
        }

        if(s.indexOf("subText") > -1) // set text gioi han string
        {
            control["subText"] = control.getString().length;
        }
    },

    processScaleControl : function (control) {
        control.setScale(this._scale);
    },


    onTouchEventHandler: function(sender,type){
        if(type == ccui.Widget.TOUCH_ENDED)
        {
            this.onButtonRelease(sender, sender.getTag());
        }
    },

    onButtonRelease : function (button,id) {
        cc.log("ONBUTTON RELESE");
        var gui = sceneMgr.getGUIByClassName(GUIDecorateItem.className);
        gui.savePosView();
        gui.normalAllItem();
        gui.currentSelectItem = this.data.id;
        var arrayResource = decorateManager.getResource(this.data.id);
        this.item.gotoAndPlay(arrayResource[1], -1, -1, -1);
        this.active.setVisible(true);
        decorateManager.currentSelect = this.data.id;
        //var object = gui.currentDecorateItem;
        //if (object) {
          //  object.normalState();
        //}
        //gui.currentDecorateItem = this;
        gui.setItem(this.data.id);
        switch (id) {
            case DecorateItem.BTN_USE:
                decorateManager.sendUseItem(this.data.id);
                break;
            case DecorateItem.BTN_BUY:
                var gui = sceneMgr.openGUI(GUIBuyDecorateItem.className, GUIBuyDecorateItem.tag, GUIBuyDecorateItem.tag);
                gui.setInfo(this.data);
                break;
            case DecorateItem.BTN_SELECT:

                break;
        }
    },

    normalState: function() {
        var arrayResource = decorateManager.getResource(this.data.id);
        this.item.gotoAndPlay(arrayResource[1], -1, 10000, -1);
        this.active.setVisible(false);
    },

    setInfo: function (idx) {

        var data = decorateManager.arrayDecorate[idx];
        if (this.data.id != data.id) {
            var arrayResource = decorateManager.getResource(data.id);
            if (decorateManager.isFlag(data.id)) {
                this.item.setScale(0.8);
            }
            else {
                switch (data.id) {
                    case 1:
                        this.item.setScale(0.7);
                        break;

                }
            }
            if (decorateManager.currentSelect == data.id) {
                this.item.gotoAndPlay(arrayResource[1], -1, -1, -1);
                this.active.setVisible(true);
            }
            else {
                this.item.gotoAndPlay(arrayResource[1], -1, 100000, -1);
                this.active.setVisible(false);
            }
        }

        this.labelGold.setString(StringUtility.formatNumberSymbol(data.configGold[0]));
        this.data = data;
        this.updateTime();
    },

    updateTime: function () {
        if (this.data.time > 0) {
            this.btnBuy.setVisible(false);
            if (this.data.isUse) {
                this.btnUse.setVisible(false);
                this.labelUse.setVisible(true);
            }
            else {
                this.btnUse.setVisible(true);
                this.labelUse.setVisible(false);
            }
            this.labelTime.setString(this.getTimeLeftString(this.data.time));
            this.labelTime.setVisible(true);
        }
        else {

            this.btnUse.setVisible(false);
            this.btnBuy.setVisible(true);
            this.labelTime.setVisible(false);
            this.labelUse.setVisible(false);
        }
    },

    getTimeLeftString: function (timeLeft) {

        timeLeft = timeLeft / 1000;
        var day = parseInt(timeLeft / 86400);
        timeLeft -= day * 86400;
        var hour = parseInt(timeLeft / 3600);
        timeLeft -= hour * 3600;
        var minute = parseInt(timeLeft / 60);
        timeLeft -= minute * 60;
        timeLeft = parseInt(timeLeft);

        var str = "";
        if (day > 0) {
            str = LocalizedString.to("COMMON_FORMAT_DAY");
            str = StringUtility.replaceAll(str, "@day", day);
        }
        else {
            if(hour > 0) {
                str = LocalizedString.to("COMMON_FORMAT_HOURS");
            }
            else if(minute > 0) {
                str = LocalizedString.to("COMMON_FORMAT_MINUTES");
            }
            else {
                str = LocalizedString.to("COMMON_FORMAT_SECONDS");
            }

            str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
            str = StringUtility.replaceAll(str, "@minute", (minute < 10) ? "0" + minute : minute);
            str = StringUtility.replaceAll(str, "@second", (timeLeft < 10) ? "0" + timeLeft : timeLeft);
        }
        str = localized("AVAILABLE_TEXT") + str;
        return str;
    }
});
DecorateItem.BTN_USE = 1;
DecorateItem.BTN_BUY = 2;
DecorateItem.BTN_SELECT = 3;

var DecorateItemCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();
        var bg = new cc.Sprite("DecorateItem/panelItem.png");
        this.addChild(bg);
        bg.setPosition(bg.getContentSize().width * 0.5, bg.getContentSize().height * 0.4);
        //cc.log("LJKFD " + bg.getContentSize().width * 0.0 + " " + bg.getContentSize.height * 0.0);
   //     bg.setPosition(0, 0);
        this.arrayItem = [];
        for (var i = 0; i < 3; i++) {
            var item = new DecorateItem();
            this.arrayItem.push(item);
            this.addChild(item);
            item.setPosition(135 * i + 32, 50);
        }
    },

    setInfo: function (idx) {
        idx = Math.ceil(decorateManager.arrayDecorate.length / 3) - 1 - idx;
        var i = 0;
        cc.log("IDX " + idx);
        for (i = 0; i < 3; i++) {
            if (idx * 3 + i >= decorateManager.arrayDecorate.length) {
                break;
            }
            this.arrayItem[i].setVisible(true);
            this.arrayItem[i].setInfo(idx * 3 + i);
        }

        for (i; i < 3; i++) {
            this.arrayItem[i].setVisible(false);
        }
    },

    updateTime: function() {
        for (var i = 0; i < 3; i++) {
            this.arrayItem[i].updateTime();
        }
    },

    normalAllItem: function () {
        for (var i = 0; i < 3; i++) {
            this.arrayItem[i].normalState();
        }
    }
});

var GUIDecorateItem = BaseLayer.extend({
    ctor: function () {
        this.view = null;
        this._super("GUIDecorateItem");
        this._layerColor = new cc.LayerColor(cc.BLACK);
        this.addChild(this._layerColor);
        this.initWithBinaryFile("GUIDecorateItem.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this.customButton("btnClose", GUIDecorateItem.BTN_CLOSE, bg);
        this.labelGold = this.getControl("labelGold", bg);
        this.labelName = this.getControl("labelName", bg);

        var bgAvatar = ccui.helper.seekWidgetByName(this._layout, "bgAvatar");
        var bgAvatar1 = ccui.helper.seekWidgetByName(this._layout, "bgAvatar1");
        this._uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        var size = bgAvatar.getContentSize();
        var scale = size.width / this._uiAvatar.getImageSize().width;
        this._uiAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        this._uiAvatar.setScale(scale);
        bgAvatar.addChild(this._uiAvatar);
        this.panelItem = this.getControl("panelCurrentItem", bgAvatar1);
        this.item = db.DBCCFactory.getInstance().buildArmatureNode("IconFlag");
        this.panelItem.addChild(this.item);
        this.arrayCell = [];
        var pView = this.getControl("panelItem", bg);
        this.view = new cc.TableView(this, pView.getContentSize());
        this.view.setAnchorPoint(cc.p(0.5, 0.5));
        this.view.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        //this.view.setPosition(pView.getPosition());
        this.view.setDelegate(this);
        this.view.reloadData();
        pView.addChild(this.view);
        this.enableFog();
        this.setBackEnable(true);
        this.idSelectItem = 0;
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.isSearch = false;
        this.view.reloadData();
        this.setItem(decorateManager.currentItem);
        this.updateUserInfo();
        this.schedule(this.update, 1.0);
        this.normalAllItem();
        decorateManager.currentSelect = 0;
        //var obj = this.currentDecrorateItem;
        //if (obj) {
        //    obj.normalState();
        //}
        //this.currentDecrorateItem = null;
    },


    updateUserInfo: function() {
        this.labelGold.setString(StringUtility.pointNumber(GameData.getInstance().userData.bean));
        this.labelName.setString(GameData.getInstance().userData.displayName);
        this._uiAvatar.asyncExecuteWithUrl(GameData.getInstance().userData.uID, GameData.getInstance().userData.avatar);
    },

    normalAllItem: function() {
        for (var i = 0; i < this.arrayCell.length; i++) {
            this.arrayCell[i].normalAllItem();
        }
    },

    setItem: function(id) {
        if (id <= 0) {
            this.idItem = -1;
            if (this.item) {
                this.item.setVisible(false);
            }
            return;
        }
        var arrayResource = decorateManager.getResource(id);
        if (decorateManager.isFlag(id)) {
            this.item.setScale(0.7);
        }
        else {
            switch (id) {
                case 1:
                    this.item.setScale(0.6);
                    break;

            }
        }
        this.item.setVisible(true);
        this.item.gotoAndPlay(arrayResource[1], -1, -1, -1);
        this.idItem = id;
    },

    setShowHideAnimate: function (parent, customScale) {
        this._showHideAnimate = true;
        if (parent === undefined) {
            this._bgShowHideAnimate = this._layout;
        }
        else {
            this._bgShowHideAnimate = parent;
        }

        if (customScale === undefined) {
            customScale = false;
        }
        this._currentScaleBg = customScale ? this._scale : 1;

        var size = cc.director.getWinSize();
        this._bgShowHideAnimate.setPosition(cc.p(size.width / 2, -size.height / 2));
        this._bgShowHideAnimate.setOpacity(0);
        this._bgShowHideAnimate.runAction(cc.sequence(cc.spawn(new cc.EaseBackOut(cc.moveTo(0.3, cc.p(size.width / 2, size.height / 2))), cc.fadeIn(0.3)), cc.callFunc(this.finishAnimate, this)));

        if (this._layerColor) {
            this._layerColor.setVisible(true);
            this._layerColor.runAction(cc.fadeTo(0.3, 150));
        }

        if (this._fog) {
            this._fog.setVisible(true);
            this._fog.runAction(cc.fadeTo(0.3, 150));
        }
    },

    onClose: function () {
        if (this._layerColor && this._layerColor.isVisible())
            this._layerColor.runAction(cc.fadeTo(0.3, 0));

        if (this._fog && this._fog.isVisible())
            this._fog.runAction(cc.fadeTo(0.3, 0));

        if (this._showHideAnimate) {
            var size = cc.director.getWinSize();

            this._bgShowHideAnimate.setPosition(size.width / 2, size.height / 2);
            this._bgShowHideAnimate.runAction(cc.spawn(new cc.EaseBackIn(cc.moveTo(0.2, cc.p(size.width / 2, -size.height / 2))), cc.fadeOut(0.2)));
            this.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(this.onCloseDone.bind(this))));
        }
        else {
            this.onCloseDone();
        }
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case GUIDecorateItem.BTN_CLOSE:
                this.onBack();
                //cc.log("POSTION " + this.view.getContentOffset().y);
                break;
        }

    },

    savePosView: function() {
        this.savePos = this.view.getContentOffset();
    },

    updatePosView: function() {
        this.view.reloadData();
        if (this.savePos)
            this.view.setContentOffset(this.savePos, false);
    },

    update: function () {
        decorateManager.updateTime();
        for (var i = 0; i < this.arrayCell.length; i++) {
            this.arrayCell[i].updateTime();
        }
    },


    tableCellSizeForIndex: function (table, idx) {
        return cc.size(450, 170);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new DecorateItemCell(this);
            this.arrayCell.push(cell);
        }
        cell.setInfo(idx);

        return cell;
    },

    tableCellTouched: function (table, cell) {
        var idx = cell.getIdx();
    },

    numberOfCellsInTableView: function (table) {
       return Math.ceil(decorateManager.arrayDecorate.length / 3);
    },

    onBack: function () {
        this.onClose();
    }


});

GUIDecorateItem.className = "GUIDecorateItem";
GUIDecorateItem.BTN_CLOSE = 1;
GUIDecorateItem.BTN_CLOSE_SEARCH = 2;
GUIDecorateItem.BTN_SEARCH = 3;
GUIDecorateItem.SEARCH_EDIT_BOX = 5;
GUIDecorateItem.tag = 801;


var GUIBuyDecorateItem = BaseLayer.extend({
    ctor: function () {
        this.view = null;
        this._super("GUIBuyDecorateItem");
        this._layerColor = new cc.LayerColor(cc.BLACK);
        this.addChild(this._layerColor);
        this.initWithBinaryFile("GUIBuyDecorateItem.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;
        this.labelGold = this.getControl("labelGold", bg);
        this.labelName = this.getControl("labelName", bg);
        this.imgSelect = this.getControl("imgSelect", bg);
        this.customButton("btnClose", GUIBuyDecorateItem.BTN_CLOSE, bg);
        this.btnBuy = this.customButton("btnBuy", GUIBuyDecorateItem.BTN_BUY, bg);
        this.arrayBtnSelect = [];
        this.arrayLabel = [];
        for (var i = 0; i < 3; i++) {
            this.arrayBtnSelect.push(this.customButton("btnTime" + i, GUIBuyDecorateItem.BTN_SELECT + i, bg));
            this.arrayLabel.push(this.getControl("labelTime" + i, bg));
        }

        this.labelPrice = this.getControl("labelPrice", bg);
        this.labelNameItem = this.getControl("labelNameItem", bg);

        var bgAvatar = ccui.helper.seekWidgetByName(this._layout, "bgAvatar");
        var bgAvatar1 = ccui.helper.seekWidgetByName(this._layout, "bgAvatar1");
        this._uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        var size = bgAvatar.getContentSize();
        var scale = size.width / this._uiAvatar.getImageSize().width;
        this._uiAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        this._uiAvatar.setScale(scale);
        bgAvatar.addChild(this._uiAvatar);
        this.panelItem = this.getControl("panelCurrentItem", bgAvatar1);
        this.item = db.DBCCFactory.getInstance().buildArmatureNode("IconFlag");
        this.panelItem.addChild(this.item);
        this.enableFog();
        this.setBackEnable(true);
        this.typeSelect = 0;

    },

    setInfo: function(data) {
        cc.log("DATA " + JSON.stringify(data));
        this.data = data;
        for (var i = 0; i < 3; i++) {
            var s = localized("COMMON_FORMAT_DAY");
            s = StringUtility.replaceAll(s, "@day", data.configTime[i]);
            cc.log("DAY " + s);
            this.arrayLabel[i].setString(s);
            this.arrayLabel[i].setColor(cc.color(255, 255, 255));
        }
        this.imgSelect.setPosition(this.arrayBtnSelect[this.typeSelect].getPosition());
        this.labelPrice.setString(StringUtility.pointNumber(data.configGold[this.typeSelect]));
        this.arrayLabel[this.typeSelect].setColor(cc.color(240, 240, 66));
        this.labelNameItem.setString(data.name);
        this.setItem(data.id);
    },

    setItem: function(id) {
        if (id <= 0) {
            this.idItem = -1;
            if (this.item) {
                this.item.setVisible(false);
            }
            return;
        }
        var arrayResource = decorateManager.getResource(id);
        if (decorateManager.isFlag(id)) {
            this.item.setScale(0.7);
        }
        else {
            switch (id) {
                case 1:
                    this.item.setScale(0.7);
                    break;

            }
        }
        this.item.setVisible(true);
        this.item.gotoAndPlay(arrayResource[1], -1, -1, -1);
        this.idItem = id;

    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.imgSelect.setPosition(this.arrayBtnSelect[this.typeSelect].getPosition());
        this.updateUserInfo();
    },

    updateUserInfo: function() {
        this.labelGold.setString(StringUtility.pointNumber(GameData.getInstance().userData.bean));
        this.labelName.setString(GameData.getInstance().userData.displayName);
        this._uiAvatar.asyncExecuteWithUrl(GameData.getInstance().userData.uID, GameData.getInstance().userData.avatar);
    },

    setShowHideAnimate: function (parent, customScale) {
        this._showHideAnimate = true;
        if (parent === undefined) {
            this._bgShowHideAnimate = this._layout;
        }
        else {
            this._bgShowHideAnimate = parent;
        }

        if (customScale === undefined) {
            customScale = false;
        }
        this._currentScaleBg = customScale ? this._scale : 1;

        var size = cc.director.getWinSize();
        this._bgShowHideAnimate.setPosition(cc.p(size.width / 2, -size.height / 2));
        this._bgShowHideAnimate.setOpacity(0);
        this._bgShowHideAnimate.runAction(cc.sequence(cc.spawn(new cc.EaseBackOut(cc.moveTo(0.3, cc.p(size.width / 2, size.height / 2))), cc.fadeIn(0.3)), cc.callFunc(this.finishAnimate, this)));

        if (this._layerColor) {
            this._layerColor.setVisible(true);
            this._layerColor.runAction(cc.fadeTo(0.3, 150));
        }

        if (this._fog) {
            this._fog.setVisible(true);
            this._fog.runAction(cc.fadeTo(0.3, 150));
        }
    },

    onClose: function () {
        if (this._layerColor && this._layerColor.isVisible())
            this._layerColor.runAction(cc.fadeTo(0.3, 0));

        if (this._fog && this._fog.isVisible())
            this._fog.runAction(cc.fadeTo(0.3, 0));

        if (this._showHideAnimate) {
            var size = cc.director.getWinSize();

            this._bgShowHideAnimate.setPosition(size.width / 2, size.height / 2);
            this._bgShowHideAnimate.runAction(cc.spawn(new cc.EaseBackIn(cc.moveTo(0.2, cc.p(size.width / 2, -size.height / 2))), cc.fadeOut(0.2)));
            this.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(this.onCloseDone.bind(this))));
        }
        else {
            this.onCloseDone();
        }
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case GUIBuyDecorateItem.BTN_CLOSE:
                this.onBack();
                break;
            case GUIBuyDecorateItem.BTN_BUY:
                if (GameData.getInstance().userData.bean < this.data.configGold[this.typeSelect]) {
                    var msg = LocalizedString.to("NOT_ENOUGH_GOLD_TO_BUY");
                    sceneMgr.showChangeGoldDialog(msg, this, function (buttonId) {
                        if (buttonId == Dialog.BTN_OK) {
                            gamedata.openShop();
                        }
                    });
                }
                else {
                    decorateManager.sendBuyItem(this.data.id, this.data.configTime[this.typeSelect]);
                }
                break;
            default:
                this.typeSelect = id - GUIBuyDecorateItem.BTN_SELECT;
                this.imgSelect.setPosition(this.arrayBtnSelect[this.typeSelect].getPosition());
                this.labelPrice.setString(StringUtility.pointNumber(this.data.configGold[this.typeSelect]));
                for (var i = 0; i < 3; i++) {
                    this.arrayLabel[i].setColor(cc.color(255, 255, 255));
                }
                this.arrayLabel[this.typeSelect].setColor(cc.color(240, 240, 66));
                break;
        }

    },

    onBack: function () {
        this.onClose();
    }


});

GUIBuyDecorateItem.className = "GUIBuyDecorateItem";
GUIBuyDecorateItem.BTN_CLOSE = 1;
GUIBuyDecorateItem.BTN_BUY = 2;
GUIBuyDecorateItem.BTN_SELECT = 10;
GUIBuyDecorateItem.SEARCH_EDIT_BOX = 5;
GUIBuyDecorateItem.tag = 802;
