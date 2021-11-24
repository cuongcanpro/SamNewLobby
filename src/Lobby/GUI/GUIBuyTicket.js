
var GUIBuyTicket = BaseLayer.extend({

    ctor: function () {
        this._super("GUIBuyTicket");
        this.initWithBinaryFile("GUIBuyTicket.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.bgText = this.getControl("bgText");
        this.bgText.pos = this.bgText.getPosition();
        this.imgCongrat = this.getControl("imgCongrat", this.bg);
        this.imgCongrat.pos = this.imgCongrat.getPosition();
        this.lbSource = this.getControl("lbSource", this.bgText);
        this.lbSource.pos = this.lbSource.getPosition();
        this.btnReceive = this.customButton("btn", 0, this.bg);
        this.btnReceive.pos = this.btnReceive.getPosition();
        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        scrollView.setBounceEnabled(true);
        //scrollView.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        scrollView.setBackGroundColor(cc.color(255,255,255));
        //scrollView.setBackGroundImageScale9Enabled(true);
        scrollView.setContentSize(cc.size(800, 300));
        scrollView.setInnerContainerSize(cc.size(GUIBuyTicket.WIDTH_SCROLL, 300));
        scrollView.setAnchorPoint(cc.p(0.5, 0.5));
        scrollView.setPosition(cc.p(this.bg.getContentSize().width * 0.5, 220));
        this.bg.addChild(scrollView);
        this.scrollView = scrollView;

        this.enableFog();
        this.arrayBonusItem = [];
        this.arrayCmdShop = [];
    },

    onEnterFinish: function () {
        this.setFog(true, 200);
        this.scrollView.setVisible(true);
    },

    setInfo: function (cmd) {
        this.cmdShop = cmd;
        this.getInfoPurchase();
        this.setViewPurchase();
    },

    getInfoPurchase: function () {

        // Set VPoint
        this.arrayBonusData = [];
        var bonusVPoint = new ShopSuccessData();
        bonusVPoint.type = ShopSuccessData.TYPE_VPOINT;
        if (this.cmdShop.vPoint > 0) {
            bonusVPoint.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusVPoint.arrayNum.push(this.cmdShop.vPoint);
        }

        if (bonusVPoint.getSum() > 0) {
            this.arrayBonusData.push(bonusVPoint);
        }

        // Set Hour Vip
        var bonusHourVip = new ShopSuccessData();
        bonusHourVip.type = ShopSuccessData.TYPE_HOUR_VIP;
        if (this.cmdShop.hourVip > 0) {
            bonusHourVip.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusHourVip.arrayNum.push(this.cmdShop.hourVip);
        }
        if (bonusHourVip.getSum() > 0) {
            this.arrayBonusData.push(bonusHourVip);
        }

        //Set TIcket
        var bonusTicket = new ShopSuccessData();
        bonusTicket.type = ShopSuccessData.TYPE_TICKET;
        if (this.cmdShop.keyCoin > 0) {
            bonusTicket.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusTicket.arrayNum.push(this.cmdShop.keyCoin);
            bonusTicket.idEvent = event.getIdMainEvent();
        }
        if (bonusTicket.getSum() > 0) {
            this.arrayBonusData.push(bonusTicket);
        }
    },

    setViewPurchase: function () {
        this.btnReceive.setVisible(true);
        this.setBonusItem();

        this.imgCongrat.setPositionY(this.imgCongrat.pos.y + 200);
        this.imgCongrat.runAction(cc.sequence(
            cc.delayTime(0.05),
            new cc.EaseBackOut(cc.moveTo(0.7, this.imgCongrat.getPositionX(), this.imgCongrat.pos.y))
        ));

        this.bgText.setPositionY(this.bgText.pos.y + 200);
        this.bgText.runAction(new cc.EaseBackOut(cc.moveTo(0.7, this.bgText.getPositionX(), this.bgText.pos.y)));

        this.btnReceive.setPositionY(this.btnReceive.pos.y - 200);
        this.btnReceive.runAction(new cc.EaseBackOut(cc.moveTo(0.7, this.btnReceive.getPositionX(), this.btnReceive.pos.y)));

        for (var i = 0; i < this.arrayBonusItem.length; i++) {
            var pos = this.arrayBonusItem[i].getPosition();
            this.arrayBonusItem[i].setPositionX(this.arrayBonusItem[i].getPositionX() + 1000);
            this.arrayBonusItem[i].runAction(cc.sequence(
                cc.delayTime(0.05 * i),
                new cc.EaseBackOut(cc.moveTo(1.0, pos))
            ));
        }
    },

    setBonusItem: function () {
        cc.log("BONUS DATA " + JSON.stringify(this.arrayBonusData));
        for (var i = 0; i < this.arrayBonusData.length; i++) {
            var item = this.getAraryBonusItem();
            item.setInfo(this.arrayBonusData[i]);
            item.setPosition(item.getContentSize().width * (i + 0.5) + GUIBuyTicket.PAD_ITEM * i, GUIBuyTicket.HEIGHT_SCROLL * 0.5);
        }
        var sum = (this.arrayBonusData.length - 1) * GUIBuyTicket.PAD_ITEM + this.arrayBonusData.length * this.arrayBonusItem[0].getContentSize().width;

        if (sum < GUIBuyTicket.WIDTH_SCROLL) {
            this.scrollView.setContentSize(cc.size(sum, GUIBuyTicket.HEIGHT_SCROLL));
        }
        else {
            this.scrollView.setContentSize(cc.size(GUIBuyTicket.WIDTH_SCROLL, GUIBuyTicket.HEIGHT_SCROLL));
        }
        this.scrollView.setInnerContainerSize(cc.size(sum, GUIBuyTicket.HEIGHT_SCROLL));

    },

    getAraryBonusItem: function () {
        var i = 0;
        for (i = 0; i < this.arrayBonusItem.length; i++) {
            if (!this.arrayBonusItem[i].isVisible()) {
                this.arrayBonusItem[i].setVisible(true);
                return this.arrayBonusItem[i];
            }
        }
        var item = new ShopBonusItem();
        this.arrayBonusItem.push(item);
        this.scrollView.addChild(item);
        return item;
    },

    hideComponent: function () {
        this.btnReceive.setVisible(false);
        //   this.btnReceive.runAction(new cc.EaseBackIn(cc.moveBy(0.7, 0, -200)));
        this.imgCongrat.runAction(new cc.EaseBackIn(cc.moveBy(0.7, 0, 200)));
        this.bgText.runAction(new cc.EaseBackIn(cc.moveBy(0.7, 0, 200)));
        this._layerColor.runAction(cc.sequence(
            cc.fadeOut(2.5),
            cc.callFunc(this.onClose.bind(this))
        ));
        this.scrollView.setVisible(false);
    },

    onButtonRelease: function (btn, id) {
        cc.log("ON BUTTON RELEASE *** ");
        this.hideComponent();
        var startGold, endGold;
        var mainLayer = sceneMgr.getMainLayer();
        var delay = 0;
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        var newLevel = NewVipManager.getInstance().getRealVipLevel();

        for (var i = 0; i < this.arrayBonusData.length; i++) {
            this.arrayBonusItem[i].setVisible(false);
            var pStart = this.arrayBonusItem[i].convertToWorldSpace(cc.p(0, 0));
            var pEnd;
            if (mainLayer instanceof LobbyScene) {
                pEnd = mainLayer.getPositionComponent(this.arrayBonusData[i].type);
            }
            else if (mainLayer instanceof ShopIapScene) {
                pEnd = mainLayer.getPositionComponent(this.arrayBonusData[i].type);
            }
            else {
                pEnd = cc.p(0, 0);
            }
            var addBonus = this.arrayBonusData[i].getSum();

            effectMgr.flyItemEffect(sceneMgr.layerSystem, this.arrayBonusData[i].getResourceIcon(), 10, pStart, pEnd, delay, false, false, true);
            delay = delay + 0.5;
            // if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_HOUR_VIP) {
            //     if (mainLayer instanceof ShopIapScene) {
            //         var remainTime = NewVipManager.getInstance().getRemainTime();
            //         NewVipManager.getInstance().setRemainTime(remainTime + addBonus);
            //         setTimeout(function () {
            //             var gui = sceneMgr.getMainLayer();
            //             if (gui instanceof ShopIapScene) {
            //                 mainLayer.txtRemainVipTime.setString(NewVipManager.getRemainTimeString(NewVipManager.getInstance().getRemainTime()));
            //             }
            //         }.bind(this), (delay + 0.5) * 1000);
            //     }
            // }
            // else if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_VPOINT) {
            //     var vipLevel = NewVipManager.getInstance().getVipLevel();
            //     var curVpoint = NewVipManager.getInstance().getVpoint();
            //     NewVipManager.getInstance().setVpoint(curVpoint + addBonus);
            //     if (mainLayer instanceof ShopIapScene) {
            //         effectMgr.runVipProgress(mainLayer.bgProgressVip, mainLayer.progressVip, mainLayer.txtProgress, null, mainLayer.iconCurVip,
            //             mainLayer.iconNextVip, addBonus, delay + 0.5, false, vipLevel, curVpoint);
            //     }
            // }
            // else if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_DIAMOND) {
            //     if (mainLayer instanceof LobbyScene || mainLayer instanceof ShopIapScene) {
            //         var startDiamond = Number.parseFloat(mainLayer.getDiamond());
            //         var endDiamond = startDiamond + Number.parseFloat(addBonus);
            //         if (mainLayer instanceof LobbyScene) {
            //             effectMgr.runLabelPoint(mainLayer._uiDiamond, startDiamond, endDiamond, delay + 0.5, 50, EffectMgr.LABEL_RUN_NUMBER);
            //         }
            //         else {
            //             effectMgr.runLabelPoint(mainLayer._uiDiamond, startDiamond, endDiamond, delay + 0.5, 50);
            //         }
            //         this.targetDiamond = endDiamond;
            //     }
            // }
            //
        }
        // ket thuc Effect Bay vat pham, Update lai du lieu cho cac GUI
        setTimeout(function () {
            cc.log("VO DAY MA *** Reset Bonus " + JSON.stringify(this.arrayBonusData));
            this.arrayBonusData = [];
            if (newLevel > vipLevel) {
                NewVipManager.showUpLevelVip(vipLevel, newLevel);
            }
            NewVipManager.getInstance().setWaiting(false);
            var mainLayer = sceneMgr.getMainLayer();
            if (mainLayer instanceof ShopIapScene) {
                mainLayer.updateVipInfo();
            }
        }.bind(this), (delay + 1.8) * 1000);
    },
});
GUIBuyTicket.PAD_ITEM = 20;
GUIBuyTicket.WIDTH_SCROLL = 750;
GUIBuyTicket.HEIGHT_SCROLL = 200;

GUIBuyTicket.PAYMENT_TYPE_G_GOLD = 0;
GUIBuyTicket.className = "GUIBuyTicket";
GUIBuyTicket.TAG = 2000;

ShopBonusItem =  cc.Node.extend({
    ctor: function () {
        this._super();
        this.setAnchorPoint(cc.p(0, 0));
        this.setCascadeOpacityEnabled(true);

        this.bg = new cc.Sprite("res/Lobby/ShopIAP/ShopSuccess/bgBonus.png");
        this.addChild(this.bg, 1);
        this.bg.setAnchorPoint(cc.p(1.0, 1.0));
        this.bg.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.5);

        this.icon = new cc.Sprite("res/Lobby/ShopIAP/ShopSuccess/iconGold.png");
        this.addChild(this.icon);

        this.labelDescrible = BaseLayer.createLabelText("fkdsjl fjsdj fsld kjfd kf sdfd ssds lfj", cc.color(255, 246, 220, 255));
        this.labelDescrible.setFontName(SceneMgr.FONT_BOLD);
        this.labelDescrible.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.labelDescrible.setAnchorPoint(cc.p(0.5, 0.5));
        this.labelDescrible.setFontSize(16);
        this.labelDescrible.setPosition(0, this.bg.getContentSize().height * 0.35);
        this.labelDescrible.ignoreContentAdaptWithSize(false);
        this.addChild(this.labelDescrible);

        this.btnInfo = new ccui.Button();
        this.btnInfo.setPressedActionEnabled(true);
        this.btnInfo.loadTextures("res/Lobby/ShopIAP/ShopSuccess/btnInfo.png", "res/Lobby/ShopIAP/ShopSuccess/btnInfo.png", "");
        this.btnInfo.addTouchEventListener(this.onTouchEventHandler, this);
        this.btnInfo.setPosition(this.bg.getContentSize().width * 0.35, this.bg.getContentSize().height * 0.4);
        this.addChild(this.btnInfo, 1);

        var p = cc.p(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.9);
        this.lbTitle =  this.createLabel("Gold", cc.color(201, 214, 253, 255), p, this.bg);
        this.lbTitle.setAnchorPoint(cc.p(0.5, 0.5));
        this.lbTitle.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this.startX = this.bg.getContentSize().width * 0.05;

        var lb = this.createLabel(localized("SUM"), cc.color(180, 165, 197, 255), cc.p(this.startX, this.bg.getContentSize().height * 0.2), this.bg);
        this.lbSum = this.createLabel("0", cc.color(254, 221, 151, 255), cc.p(this.startX, this.bg.getContentSize().height * 0.08), this.bg);
        this.setContentSize(this.bg.getContentSize());

        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scrollView.setTouchEnabled(true);
        scrollView.setBounceEnabled(true);
        //   scrollView.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        scrollView.setBackGroundColor(cc.color(255,255,255));
        //scrollView.setBackGroundImageScale9Enabled(true);
        scrollView.setContentSize(cc.size(this.bg.getContentSize().width, 70));
        scrollView.setAnchorPoint(cc.p(0, 1.0));
        scrollView.setPosition(cc.p(0, this.bg.getContentSize().height * 0.75));
        this.bg.addChild(scrollView);
        this.scrollView = scrollView;

    },

    createLabel: function (text, color, pos, parent) {
        var lbSum =  BaseLayer.createLabelText(text, color);
        lbSum.setFontName(SceneMgr.FONT_BOLD);
        parent.addChild(lbSum);
        lbSum.setAnchorPoint(cc.p(0, 0.5));
        lbSum.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        lbSum.setPosition(pos);
        lbSum.setFontSize(14);
        return lbSum;
    },

    onTouchEventHandler: function(sender,type){
        switch (type){
            case ccui.Widget.TOUCH_BEGAN:
                break;
            case ccui.Widget.TOUCH_ENDED:
                this.showInfo();
                break;
        }
    },

    // show thong tin cu the cua Bonus den tu nhieu nguon
    showInfo: function () {
        this.bg.stopAllActions();
        if (!this.bg.isShow)
            this.bg.runAction(new cc.EaseExponentialOut(cc.scaleTo(0.5, 1.0, 1.0)));
        else
            this.bg.runAction(new cc.EaseExponentialOut(cc.scaleTo(0.5, 0.0, 0.0)));
        this.bg.isShow = !this.bg.isShow;
    },

    // set thong tin chung cua Bonus
    setInfo: function (bonusData) {
        this.bg.isShow = false;
        this.bg.setScale(0);
        if (this.groupValue) {
            this.groupValue.removeFromParent();
        }
        this.groupValue = this.createNodeNumber(bonusData.getSum());
        this.addChild(this.groupValue);
        this.groupValue.setPosition(0, -this.bg.getContentSize().height * 0.3);
        this.icon.setTexture(bonusData.getResourceIcon());
        this.icon.setScale(bonusData.getScaleRate());
        this.labelDescrible.setString(bonusData.getTitle());
        this.lbTitle.setString(bonusData.getTitle());

        if (bonusData.arraySubType.length > 1) {
            this.btnInfo.setVisible(true);
            this.setDetailInfo(bonusData);
        }
        else {
            this.btnInfo.setVisible(false);
        }
    },

    // thong tin cu the cua tung Bonus den tu nhung nguon nao
    setDetailInfo: function (bonusData) {
        this.scrollView.removeAllChildren();
        this.lbSum.setString(StringUtility.pointNumber(bonusData.getSum()));
        var count = 0;
        var total = bonusData.arraySubType.length * 2 - 1;
        for (var i = 0; i < bonusData.arraySubType.length; i++) {
            var source = bonusData.getSource(i);
            var value = "+" + StringUtility.pointNumber(bonusData.arrayNum[i]);
            var lbSource = this.createLabel(source,cc.color(180, 165, 197, 255), cc.p(this.startX, ShopBonusItem.PAD_Y * (total - count + 0.7)), this.scrollView);
            count++;
            var lbValue = this.createLabel(value,cc.color(254, 221, 151, 255), cc.p(this.startX, ShopBonusItem.PAD_Y * (total - count + 0.7)), this.scrollView);
            count++;
        }
        this.scrollView.setInnerContainerSize(cc.size(this.bg.getContentSize().width,count * ShopBonusItem.PAD_Y));
    },

    createNodeNumber: function(money) {
        var node = new cc.Node();
        var str = StringUtility.formatNumberSymbol(Math.abs(money));
        var width = 0;
        var height = 0;
        var resource = "res/Lobby/ShopIAP/ShopSuccess/num_";

        var fix = 0;
        var ret;
        for(var i = 0; i < str.length; i++) {
            var xx;
            if (ret) {
                xx = ret.getPositionX() + ret.getContentSize().width * 0.5 + fix;
                fix = 0;
            } else {
                xx = 0;
                fix = 0;
            }
            if(str[i] == '.')
                ret = new cc.Sprite(resource + "dot.png");
            else
                ret = new cc.Sprite(resource + str[i] + ".png");

            if(str[i] == '.')
                fix = 0;
            else
                fix = 0;

            if(str[i] == '.')
                ret.setPosition(xx + ret.getContentSize().width * 0.5, -8);
            else
                ret.setPositionX(xx + ret.getContentSize().width * 0.5);
            node.addChild(ret);
        }
        width = ret.getPositionX() + ret.getContentSize().width * 0.5;
        height = ret.getContentSize().height;
        node.setContentSize(cc.size(width,height));
        node.setAnchorPoint(cc.p(.5,.5));
        return node;
    }
});
ShopBonusItem.PAD_Y = 18;

var ShopSuccessData = cc.Class.extend({
    ctor: function () {
        this.type = 0;
        this.arraySubType = [];
        this.arrayNum = [];

        this.typeItem = "";
        this.subTypeItem = "";
        this.idItem = "";
        this.idEvent = "";
    },

    getSum: function () {
        var sum = 0;
        for (var i = 0; i < this.arraySubType.length; i++) {
            cc.log("SUm " + this.arrayNum[i]);
            sum = sum + this.arrayNum[i];
        }
        return sum;
    },

    getSource: function (index) {
        var s = localized("SHOP_GOLD_SOURCE_" + this.arraySubType[index]);
        var percent = Math.floor(this.arrayNum[index] / this.arrayNum[0] * 100);
        if (index != 0)
            return s + " " + percent + "%";
        else
            return s;
    },

    getScaleRate: function () {
        if (this.type == ShopSuccessData.TYPE_ITEM) {
            if (this.typeItem == StorageManager.TYPE_AVATAR) {
                return 0.5;
            }
            else {
                return 0.7;
            }
        } else if (this.type == ShopSuccessData.TYPE_TICKET) {
            return 0.7;
        }
        else {
            return 1.0;
        }
    },

    getResourceIcon: function () {
        switch (this.type) {
            case ShopSuccessData.TYPE_G:
                return "res/Lobby/ShopIAP/ShopSuccess/iconG.png";
                break;
            case ShopSuccessData.TYPE_GOLD:
                return "res/Lobby/ShopIAP/ShopSuccess/iconGold.png";
                break;
            case ShopSuccessData.TYPE_VPOINT:
                return "res/Lobby/ShopIAP/ShopSuccess/iconVPoint.png";
                break;
            case ShopSuccessData.TYPE_HOUR_VIP:
                return "res/Lobby/ShopIAP/ShopSuccess/iconHourVip.png";
                break;
            case ShopSuccessData.TYPE_TICKET:
                cc.log("GET Resource ticket " + this.idEvent + " " + event.getOfferTicketImage(this.idEvent));
                return event.getOfferTicketImage(this.idEvent);
                break;
            case ShopSuccessData.TYPE_DIAMOND:
                return "res/Lobby/ShopIAP/ShopSuccess/iconDiamond.png";
                break;
            case ShopSuccessData.TYPE_ITEM:
                return StorageManager.getItemIconPath(this.typeItem, this.subTypeItem, this.idItem);
                break;
        }
    },

    getTitle: function () {
        switch (this.type) {
            case ShopSuccessData.TYPE_G:
                return "G";
                break;
            case ShopSuccessData.TYPE_GOLD:
                return "Gold";
                break;
            case ShopSuccessData.TYPE_VPOINT:
                return "VPoint";
                break;
            case ShopSuccessData.TYPE_HOUR_VIP:
                return localized("SHOP_GOLD_HOUR_VIP");
                break;
            case ShopSuccessData.TYPE_TICKET:
                return event.getOfferTicketString(this.idEvent);
                break;
            case ShopSuccessData.TYPE_DIAMOND:
                return localized("OFFER_DIAMOND");
                break;
            case ShopSuccessData.TYPE_ITEM:
                return localized("SHOP_GOLD_ITEM");
                break;
        }
    },
})

ShopSuccessData.TYPE_G = 0;
ShopSuccessData.TYPE_GOLD = 1;
ShopSuccessData.TYPE_VPOINT = 2;
ShopSuccessData.TYPE_HOUR_VIP = 3;
ShopSuccessData.TYPE_DIAMOND = 4;
ShopSuccessData.TYPE_ITEM = 5;
ShopSuccessData.TYPE_TICKET = 6;

ShopSuccessData.SUBTYPE_SHOP_GOLD = 0;
ShopSuccessData.SUBTYPE_MISSION = 1;
ShopSuccessData.SUBTYPE_OFFER = 2;
ShopSuccessData.SUBTYPE_VOUCHER = 3;
ShopSuccessData.SUBTYPE_VIP = 4;
ShopSuccessData.SUBTYPE_EVENT_SYSTEM = 5; // khuyen mai toan he thong