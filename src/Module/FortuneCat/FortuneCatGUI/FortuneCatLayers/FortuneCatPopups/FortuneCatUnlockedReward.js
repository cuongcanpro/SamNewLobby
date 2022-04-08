
var FortuneCatUnlockedReward = BaseLayer.extend({

    ctor: function () {
        this._super("FortuneCatUnlockedReward");
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
        scrollView.setInnerContainerSize(cc.size(FortuneCatUnlockedReward.WIDTH_SCROLL, 300));
        scrollView.setAnchorPoint(cc.p(0.5, 0.5));
        scrollView.setPosition(cc.p(this.bg.getContentSize().width * 0.5, 220));
        this.bg.addChild(scrollView);
        this.scrollView = scrollView;

        this.enableFog();
        this.arrayBonusItem = [];
        this.arrayBonusData = [];
        this.arrayPosEnd = [];
    },

    onEnterFinish: function () {
        this.setFog(true, 200);
        this.scrollView.setVisible(true);
    },

    resetData: function () {
        this.arrayBonusData = [];
        this.arrayPosEnd = [];
    },

    pushArrayBonus: function (arrayBonus, title) {
        this.resetData();
        for (var i = 0; i < arrayBonus.length; i++) {
            switch (arrayBonus[i].type) {
                case ShopSuccessData.TYPE_GOLD:
                    this.pushGold(arrayBonus[i].num, arrayBonus[i].posEnd);
                    break;
                case ShopSuccessData.TYPE_HOUR_VIP:
                    this.pushHourVip(arrayBonus[i].num, arrayBonus[i].posEnd);
                    break;
                case ShopSuccessData.TYPE_VPOINT:
                    this.pushVPoint(arrayBonus[i].num, arrayBonus[i].posEnd);
                    break;
                case ShopSuccessData.TYPE_TICKET:
                    this.pushTickets(arrayBonus[i].num, arrayBonus[i].posEnd);
                    break;
            }
        }
        this.setViewPurchase();
        this.lbSource.setString(title);
    },

    pushGold: function (gold, posEnd) {
        // set GOLD
        var bonusGold = new ShopSuccessData();
        bonusGold.type = ShopSuccessData.TYPE_GOLD;
        if (gold > 0) {
            bonusGold.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusGold.arrayNum.push(gold);
        }

        if (bonusGold.getSum() > 0) {
            this.arrayBonusData.push(bonusGold);
            if (posEnd) {
                this.arrayPosEnd.push(posEnd);
            }
            else {
                this.arrayPosEnd.push(cc.p(-1, -1));
            }
        }
    },

    pushVPoint: function (vPoint, posEnd) {
        // Set VPoint
        var bonusVPoint = new ShopSuccessData();
        bonusVPoint.type = ShopSuccessData.TYPE_VPOINT;
        if (vPoint > 0) {
            bonusVPoint.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusVPoint.arrayNum.push(vPoint);
        }

        if (bonusVPoint.getSum() > 0) {
            this.arrayBonusData.push(bonusVPoint);
            if (posEnd) {
                this.arrayPosEnd.push(posEnd);
            }
            else {
                this.arrayPosEnd.push(cc.p(-1, -1));
            }
        }
    },

    pushHourVip: function (hourVip, posEnd) {
        // Set Hour Vip
        var bonusHourVip = new ShopSuccessData();
        bonusHourVip.type = ShopSuccessData.TYPE_HOUR_VIP;
        if (hourVip > 0) {
            bonusHourVip.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusHourVip.arrayNum.push(hourVip);
        }
        if (bonusHourVip.getSum() > 0) {
            this.arrayBonusData.push(bonusHourVip);
            if (posEnd) {
                this.arrayPosEnd.push(posEnd);
            }
            else {
                this.arrayPosEnd.push(cc.p(-1, -1));
            }
        }
    },

    pushTickets: function (ticket, posEnd) {
        //Set TIcket
        var bonusTicket = new ShopSuccessData();
        bonusTicket.type = ShopSuccessData.TYPE_TICKET;
        if (ticket > 0) {
            bonusTicket.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusTicket.arrayNum.push(ticket);
            bonusTicket.idEvent = event.getIdMainEvent();
        }
        if (bonusTicket.getSum() > 0) {
            this.arrayBonusData.push(bonusTicket);
            if (posEnd) {
                this.arrayPosEnd.push(posEnd);
            }
            else {
                this.arrayPosEnd.push(cc.p(-1, -1));
            }
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
        var startX = 100;
        for (var i = 0; i < this.arrayBonusData.length; i++) {
            var item = this.getAraryBonusItem();
            item.setInfo(this.arrayBonusData[i]);
            item.setPosition(startX + item.getContentSize().width * (i + 0.5) + FortuneCatUnlockedReward.PAD_ITEM * i, FortuneCatUnlockedReward.HEIGHT_SCROLL * 0.5);
        }
        var sum = (this.arrayBonusData.length - 1) * FortuneCatUnlockedReward.PAD_ITEM + this.arrayBonusData.length * this.arrayBonusItem[0].getContentSize().width + 2 * startX;

        if (sum < FortuneCatUnlockedReward.WIDTH_SCROLL) {
            this.scrollView.setContentSize(cc.size(sum, FortuneCatUnlockedReward.HEIGHT_SCROLL));
        }
        else {
            this.scrollView.setContentSize(cc.size(FortuneCatUnlockedReward.WIDTH_SCROLL, FortuneCatUnlockedReward.HEIGHT_SCROLL));
        }
        this.scrollView.setInnerContainerSize(cc.size(sum, FortuneCatUnlockedReward.HEIGHT_SCROLL));

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
        var vipLevel = vipMgr.getVipLevel();
        var newLevel = vipMgr.getRealVipLevel();

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
            if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_GOLD) {
                if (this.arrayPosEnd[i].x >= 0)
                    pEnd = this.arrayPosEnd[i];
                var timeRun = effectMgr.flyCoinEffect(sceneMgr.layerSystem, addBonus, addBonus / 20, pStart, pEnd);
                this.arrayPosEnd[i].x = -1;
            }
            else {
                effectMgr.flyItemEffect(sceneMgr.layerSystem, this.arrayBonusData[i].getResourceIcon(), 10, pStart, pEnd, delay, false, false, true);
            }

            delay = delay + 0.5;
        }
        // ket thuc Effect Bay vat pham, Update lai du lieu cho cac GUI
        setTimeout(function () {
            cc.log("VO DAY MA *** Reset Bonus " + JSON.stringify(this.arrayBonusData));
            this.arrayBonusData = [];
            if (newLevel > vipLevel) {
                VipManager.showUpLevelVip(vipLevel, newLevel);
            }
            vipMgr.setWaiting(false);
            var mainLayer = sceneMgr.getMainLayer();
            if (mainLayer instanceof ShopIapScene) {
                mainLayer.updateVipInfo();
            }
            gamedata.updateUserInfoNow();
        }.bind(this), (delay + 1.8) * 1000);
    },
});
FortuneCatUnlockedReward.PAD_ITEM = 20;
FortuneCatUnlockedReward.WIDTH_SCROLL = 750;
FortuneCatUnlockedReward.HEIGHT_SCROLL = 200;

FortuneCatUnlockedReward.className = "FortuneCatUnlockedReward";
FortuneCatUnlockedReward.TAG = 201;
