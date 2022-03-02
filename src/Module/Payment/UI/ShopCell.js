
var ItemIapCell = cc.TableViewCell.extend({

    ctor: function (p) {
        this._super();

        this.tParent = p;
        this._layout = ccs.load("ShopIapItem.json").node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.btn = ccui.Helper.seekWidgetByName(this._layout, "btn");
        this.cost = ccui.Helper.seekWidgetByName(this.btn, "vnd");
        this.currency = ccui.Helper.seekWidgetByName(this.btn, "lb");
        this.bgTime = ccui.Helper.seekWidgetByName(this.btn, "bgTime");
        this.lbTime = ccui.Helper.seekWidgetByName(this.bgTime, "lbTime");
        this.bgTime.setVisible(false);

        this.uptoLevelVip = ccui.Helper.seekWidgetByName(this._layout, "uptoLevelVip");
        this.uptoLevelVip.ignoreContentAdaptWithSize(true);
        this.iconUp = ccui.Helper.seekWidgetByName(this._layout, "iconUp");
        this.iconUp.defaultPos = this.iconUp.getPosition();
        var btn = ccui.Helper.seekWidgetByName(this.uptoLevelVip, "btnTooltip");
        btn.addTouchEventListener(this.onTouchEventHandler, this);

        this.goldOld = this.cloneLabel(ccui.Helper.seekWidgetByName(this._layout, "gold_old"));
        this.goldOld.setColor(cc.color(200, 200, 200));
        this.iconLine = ccui.Helper.seekWidgetByName(this._layout, "iconLine");
        this.goldNew = new NumberGroupCustom("res/Lobby/ShopIAP/Number/num_", -4, NumberGroupCustom.TYPE_POINT);
        this.goldNew.setPositionX(this._layout.getContentSize().width * 0.5);
        this.goldNew.setPositionY(this.goldOld.getPositionY() - 40);
        this.goldNew.defaultPos = this.goldNew.getPosition();
        this.bg.addChild(this.goldNew);

        this.bgBonus = ccui.Helper.seekWidgetByName(this._layout, "bgBonus");
        this.bgBonus.bonus = ccui.Helper.seekWidgetByName(this.bgBonus, "bonus");
        this.bgBonus.bonus.ignoreContentAdaptWithSize(true);
        this.bgBonus.addClickEventListener(this.onClickBonus.bind(this));
        this.bgBonus.setLocalZOrder(2);

        this.lastActionUpdate = 0;

        this.groupBonus = new GroupShopBonus();
        this.bg.addChild(this.groupBonus);
        this.groupBonus.setPosition(ItemIapCell.WIDTH_ITEM * 0.5 - this.groupBonus.getContentSize().width * 0.5, 500)

        this.groupBonusSource = new GroupBonusSource();
        this.bg.addChild(this.groupBonusSource);
        this.groupBonusSource.setVisible(false);
    },

    onClickBonus: function () {
        this.groupBonusSource.showGroup();
    },

    /**
     * Info Key
     * - id : id of pack in-app-purchase google
     * - id_ios : id of pack in-app-purchase apple
     * - cost : gia tien
     * - goldNew : gold nhan dc
     * - goldOld : gold cu
     * - star : gStar nhan dc
     * - bonus : bonus nhan dc
     * @param inf
     */
    setInfo: function (inf) {
        //cc.log("IAPItemCell : " + JSON.stringify(inf));

        this.info = inf;
        this.lastActionUpdate = 0;
        this._layout.removeChildByTag(TOOLTIP_FLOAT_TAG);

        //image
        this.createImage();

        //pack cost
        if (!isNaN(inf.cost))
            this.cost.setString(StringUtility.pointNumber(inf.cost));
        else
            this.cost.setString(inf.cost);
        cc.log("WIDTH LABEL ***** " + this.cost.getContentSize().width + " " + this.cost.getAutoRenderSize().width + " " + this.cost.getVirtualRendererSize().width);
        this.currency.setPositionX(this.cost.getAutoRenderSize().width * 0.5 + this.cost.getPositionX() + 10);
        if (inf.type == Payment.GOLD_G) {
            this.currency.setVisible(false);
        }
        else {
            this.currency.setVisible(true);
        }

        //level up vip
        this.uptoLevelVip.setVisible(false);
        this.iconUp.setVisible(false);
        if (inf.uptoLevelVip > 0) {
            var imgVip = VipManager.getIconVip(inf.uptoLevelVip);
            if (imgVip) {
                this.uptoLevelVip.loadTexture(imgVip);
                this.uptoLevelVip.setVisible(true);
                this.iconUp.setVisible(true);
                this.iconUp.stopAllActions();
                this.iconUp.setPosition(this.uptoLevelVip.getPositionX() + this.uptoLevelVip.getContentSize().width/2 - this.iconUp.width/2 - 2, this.uptoLevelVip.getPositionY() + this.uptoLevelVip.getContentSize().height/2 - this.iconUp.height/2 - 2);
                this.iconUp.runAction(cc.sequence(cc.moveBy(0.2, 0, 3), cc.moveBy(0.5, 0, -3)).repeatForever());
            }
        }

        //gold value
        this.goldNew.setNumber(inf.goldNew);
        this.goldOld.setString(StringUtility.pointNumber(inf.goldOld));
        this.goldOld.setVisible(inf.goldNew != inf.goldOld);
        this.iconLine.setContentSize(cc.size(this.goldOld.getAutoRenderSize().width, this.iconLine.getContentSize().height));
        this.iconLine.setVisible(inf.goldNew != inf.goldOld);
        // if (this.goldOld.isVisible()) this.goldNew.setPositionY(this.goldNew.defaultPos.y);
        // else this.goldNew.setPositionY(this.goldOld.getPositionY() - 10);

        // group Bonus
       this.groupBonus.setInfo(inf);
       this.groupBonus.setPositionY(this.goldNew.getPositionY() - 40 - this.groupBonus.getContentSize().height);

        //bonus
        var sum = 0;
        if (inf.bonusValue && inf.bonusValue > 0){
            sum = sum + inf.bonusValue;
            if (inf.curVoucher != null) {
                if (inf.curVoucher.bonusType == StorageManager.BONUS_GOLD) {
                    sum = sum + inf.curVoucher.bonusValue;
                }
            }
        }
        if (sum == 0) {
            if (inf.curVoucher != null) {
                if (inf.curVoucher.bonusType == StorageManager.BONUS_VPOINT) {
                    sum = sum + inf.curVoucher.bonusValue;
                }
            }
        }

        this.bgBonus.setVisible(sum > 0);
        if (sum > 0){
            this.bgBonus.bonus.setString("+" + sum + "%");
            this.groupBonusSource.setInfo(inf);
            this.groupBonusSource.hideGroup();
            this.groupBonusSource.setPosition(this.bgBonus.getPositionX(),this.bgBonus.getPositionY() - this.bgBonus.getContentSize().height * 0.52);
        }
        else {
            this.bgBonus.setVisible(false);
        }
        this.groupBonusSource.setVisible(false);

        // check Offer
        if (inf.isOfferNoPrice) {
            this.img.removeAllChildren();

            var sp = ccui.Button.create("res/Lobby/Offer/iconSuperOffer.png");
            sp.setPressedActionEnabled(true);
            sp.loadTextures("res/Lobby/Offer/iconSuperOffer.png", "res/Lobby/Offer/iconSuperOffer.png", "");
            sp.addTouchEventListener(this.showOffer, this);
         //   sp.setScale(this._scale);
            this.img.addChild(sp);
            sp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
        }
    },

    showOffer: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                offerManager.showOfferNoPriceGUI(this.info.type);
                break;
        }
    },

    createImage: function () {
        this.img.removeAllChildren();
        this.img.setScale(0.8);

        if (this.info.promoDailyPurchase){
            var temp = new ccui.ImageView("Lobby/DailyPurchase/btnLobby.png", 0, "DailyPurchase");
            this.img.addChild(temp);
            temp.setAnchorPoint(0.5, 0);
            temp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2 - temp.getContentSize().height / 2);

            temp.runAction(cc.sequence(
                cc.scaleTo(0.3, 0.95, 1.05).easing(cc.easeSineInOut()),
                cc.scaleTo(0.3, 1.05, 0.95).easing(cc.easeSineInOut())
            ).repeatForever());
        }
        else {
            var sp = new cc.Sprite(this.info.img);
            sp.setAnchorPoint(cc.p(0.5, 0.35));
          //  sp.setScale(this._scale);
            this.img.addChild(sp);
            sp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
        }
    },

    cloneLabel: function (lb) {
        var ret = BaseLayer.createLabelText();
        ret.setFontSize(lb.getFontSize());
        ret.setTextColor(lb.getTextColor());
        ret.setFontName(lb.getFontName());
        ret.setPosition(lb.getPosition());
        ret.setTextHorizontalAlignment(lb.getTextHorizontalAlignment());
        ret.setTextVerticalAlignment(lb.getTextVerticalAlignment());
        ret.setAnchorPoint(lb.getAnchorPoint());
        ret.setString(lb.getString());
        ret.setRotationX(lb.getRotationX());
        ret.setRotationY(lb.getRotationY());
        lb.getParent().addChild(ret);
        lb.setVisible(false);
        return ret;
    },

    updateButton: function (state) {
        if (this.lastActionUpdate == state) return;
        this.lastActionUpdate = state;

        if (state == 1) {
            this.btn.setBright(0);
            this.bgTime.setVisible(false);
        } else {
//            this.cost.setColor(cc.color(197, 197, 197, 0));
            this.btn.setBright(1);
            this.bgTime.setVisible(true);
        }
    },

    onTouchEventHandler: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                this.onButtonRelease(sender, sender.getTag());
                break;
        }
    },

    onButtonRelease: function (btn, id) {
        if (!this.uptoLevelVip.isVisible()) {
            return;
        }

        var level = this.info.uptoLevelVip;
        var text = StringUtility.replaceAll(localized("VIP_TOOLTIP_4"), "@number", level);
        var tooltip = new TooltipFloat();
        var pos = this.btn.getPosition();
        pos.x -= this.btn.getContentSize().width * 0.1;
        tooltip.setTooltip(text, TooltipFloat.MEDIUM, pos, TooltipFloat.SHOW_UP_TYPE_3);
        this._layout.addChild(tooltip, TOOLTIP_FLOAT_TAG, TOOLTIP_FLOAT_TAG);
    },

    update: function (dt) {
        if (!isNaN(this.info.limitTimeIdx)) {
            var nTime = iapHandler.getTimeLimitLeft(this.info.limitTimeIdx);
            if (nTime <= 0) {
                this.updateButton(1);
            } else {
                this.updateButton(2);
            }

            this.lbTime.setString(iapHandler.getTimeLimitString(this.info.limitTimeIdx));
        }
    }
});
ItemIapCell.WIDTH_ITEM = 320;
ItemIapCell.HEIGHT_ITEM = 480;
ItemIapCell.CURRENCY_IAP = "VND";
ItemIapCell.CURRENCY_SMS = "VND";
ItemIapCell.CURRENCY_G = "G";
ItemIapCell.CURRENCY_ATM = "VND";
ItemIapCell.CURRENCY_ZING = "VND";
ItemIapCell.CURRENCY_ZALO = "VND";

/**
 * Thong tin nhung bonus % cua goi, khuyen mai Gold, nap lan dau, khuyen mai Vip, Vourcher....
 */
GroupBonusSource = cc.Node.extend({
    ctor: function () {
        this._super();
        this.arrayBonusRow = [];
        this.bg = new cc.Scale9Sprite("res/Lobby/ShopIAP/ShopCell/bgInfoBonus.png");
        this.addChild(this.bg);
        this.bg.setAnchorPoint(cc.p(0, 0));
        this.setAnchorPoint(cc.p(0.8, 1.0));
    },

    setInfo: function (shopPackage) {
        cc.log("SHOP PACKAGE *** " + JSON.stringify(shopPackage));

        for (var i = 0; i < this.arrayBonusRow.length; i++) {
            this.arrayBonusRow[i].setVisible(false);
        }
        var levelVip = VipManager.getInstance().getRealVipLevel();
        var count = 0;
        var pad = 30;
        if (shopPackage.curVoucher != null) {
            var bonusRow = this.getShopBonusRow();
            var s = "+" + shopPackage.curVoucher.bonusValue + "% ";
            if (shopPackage.curVoucher.bonusType == StorageManager.BONUS_GOLD) {
                s = s + "Vourcher Gold";
            }
            else {
                s = s + "Vourcher VPoint";
            }
            bonusRow.setVisible(true);
            bonusRow.setString(s);
            bonusRow.setPosition(5, pad * (count + 1.0));
            count++;
        }

        if (shopPackage.bonusValue && shopPackage.bonusValue > 0) {
            var s = "+" + shopPackage.bonusValue + "% " + shopPackage.bonus + (shopPackage.isBonusVip ? levelVip : "");
            var bonusRow = this.getShopBonusRow();
            bonusRow.setVisible(true);
            bonusRow.setString(s);
            bonusRow.setPosition(10, pad * (count + 1.0));
            count++;
        }
        this.bg.setContentSize(this.bg.getContentSize().width, pad * (count + 1));
        this.setContentSize(cc.size(this.bg.getContentSize().width, pad * (count + 1)));
        this.shopPackage = shopPackage;
    },

    getShopBonusRow: function () {
        for (var i = 0; i < this.arrayBonusRow.length; i++) {
            if (!this.arrayBonusRow[i].isVisible())
                return this.arrayBonusRow[i];
        }
        var bonus = new ccui.Text();
        bonus.setFontSize(16);
        bonus.setFontName(SceneMgr.FONT_NORMAL);
        bonus.setAnchorPoint(cc.p(0, 0.5));
        this.arrayBonusRow.push(bonus);
        this.addChild(bonus);
        return bonus;
    },

    showGroup: function () {
        cc.log("SHOP PACKAGE " + JSON.stringify(this.shopPackage));
        cc.log("THONG TIN BONUS " + this.shopPackage.bonusValue + " " + this.shopPackage.bonus);
        this.isShow = !this.isShow;
        this.stopAllActions();
        if (this.isShow) {
            this.setVisible(true);
            this.setScale(0);
            this.runAction(cc.sequence(
                new cc.EaseBackOut(cc.scaleTo(0.5, 1, 1)),
                cc.delayTime(2.0),
                cc.callFunc(this.showGroup.bind(this))
            ));
        }
        else {
            this.runAction(new cc.EaseBackIn(cc.scaleTo(0.3, 0, 0)));
        }
    },

    hideGroup: function () {
        this.setVisible(false);
        this.isShow = false;
    }
})

/**
 * Moi mot GOI mua se co khuyen mai tang kem VPoint, gio vip, Item Event...
 */
GroupShopBonus = cc.Node.extend({
    ctor: function (isOffer) {
        this._super();
        this.arrayBonusRow = [];
        if (isOffer)
            this.bg = new cc.Scale9Sprite("res/Lobby/ShopIAP/ShopCell/bgGroupBonusOffer.png");
        else
            this.bg = new cc.Scale9Sprite("res/Lobby/ShopIAP/ShopCell/bgItemBonus.png");
        this.addChild(this.bg);
        this.bg.setAnchorPoint(cc.p(0, 0));
        this.setContentSize(this.bg.getContentSize());
    },

    setInfo: function (shopPackage) {
        for (var i = 0; i < this.arrayBonusRow.length; i++) {
            this.arrayBonusRow[i].setVisible(false);
        }
        this.arrayBonus = ShopBonusData.getArrayBonus(shopPackage);
        if (this.arrayBonus.length == 0) {
            this.setVisible(false);
            return;
        }
        this.setVisible(true);
        var height = (this.arrayBonus.length < 3 ? 3 : this.arrayBonus.length) * ShopBonusRow.PAD_Y;
        for (var i = 0; i < this.arrayBonus.length; i++) {
            var row = this.getShopBonusRow();
            row.setInfo(this.arrayBonus[i]);
            row.setPosition(10 , height - (i + 0.5) * ShopBonusRow.PAD_Y);
            row.setVisible(true);
        }
        this.bg.setContentSize(this.bg.getContentSize().width, height);
        this.setContentSize(cc.size(this.bg.getContentSize().width, height));
    },

    setInfoOffer: function (shopPackage) {

        for (var i = 0; i < this.arrayBonusRow.length; i++) {
            this.arrayBonusRow[i].setVisible(false);
        }
        this.arrayBonus = ShopBonusData.getArrayBonusOffer(shopPackage);
        if (this.arrayBonus.length == 0) {
            this.setVisible(false);
            return;
        }
        this.setVisible(true);
        var height = (this.arrayBonus.length < 3 ? 3 : this.arrayBonus.length) * ShopBonusRow.PAD_Y;
        for (var i = 0; i < this.arrayBonus.length; i++) {
            var row = this.getShopBonusRow();
            row.setInfo(this.arrayBonus[i]);
            row.setPosition(10 , height - (i + 0.5) * ShopBonusRow.PAD_Y);
            row.setVisible(true);
        }
        this.bg.setContentSize(this.bg.getContentSize().width, height);
        this.setContentSize(cc.size(this.bg.getContentSize().width, height));
    },

    getShopBonusRow: function () {
        for (var i = 0; i < this.arrayBonusRow.length; i++) {
            if (!this.arrayBonusRow[i].isVisible())
                return this.arrayBonusRow[i];
        }
        var bonus = new ShopBonusRow(this);
        this.arrayBonusRow.push(bonus);
        this.addChild(bonus);
        return bonus;
    },
})

/**
 * Hang Bonus di kem trong Group Bonus
 */
ShopBonusRow =  cc.Node.extend({
    ctor: function () {
        this._super();
        this.setAnchorPoint(cc.p(0, 0));
        this.setCascadeOpacityEnabled(true);

        this.icon = new cc.Sprite("res/Lobby/GUIVipNew/iconVpoint.png");
        this.addChild(this.icon);
        this.icon.setPositionX(this.icon.getContentSize().width * 0.5);

        this.labelDescrible = BaseLayer.createLabelText("fkdsjl fjsdj fsld kjfd", cc.color(255, 246, 220, 255));
        this.labelDescrible.setFontName(SceneMgr.FONT_BOLD);
        this.labelDescrible.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        this.labelDescrible.setAnchorPoint(cc.p(0, 0.5));
        this.labelDescrible.setFontSize(16);
        this.labelDescrible.ignoreContentAdaptWithSize(false);
        this.labelDescrible.setPositionX(this.icon.getPositionX() + this.icon.getContentSize().width * 0.8);
        this.addChild(this.labelDescrible);
    },

    // set thong tin chung cua Bonus
    setInfo: function (bonusData) {
        this.icon.setTexture(bonusData.getResourceIcon());
        this.icon.setScale(bonusData.getScaleRate());
        this.labelDescrible.setString(bonusData.getTitle());
    },
});
ShopBonusRow.PAD_Y = 40;

var OfferIapCell = cc.TableViewCell.extend({
    ctor: function (p) {
        this._super();

        this.tParent = p;
        var jsonLayout = ccs.load("OfferIapItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.btn = ccui.Helper.seekWidgetByName(this._layout, "btn");
        this.cost = ccui.Helper.seekWidgetByName(this.btn, "vnd");
        this.currency = ccui.Helper.seekWidgetByName(this.btn, "lb");
        this.lbOldPrice = ccui.Helper.seekWidgetByName(this.btn, "lbOldPrice");
        this.imgLine = ccui.Helper.seekWidgetByName(this.btn, "imgLine");
        this.lbTime = ccui.Helper.seekWidgetByName(this.btn, "lbTime");

        this.goldOld = ccui.Helper.seekWidgetByName(this._layout, "gold_old");
        this.goldNew = new NumberGroupCustom("res/Lobby/ShopIAP/Number/num_", -4, NumberGroupCustom.TYPE_POINT);
        this.goldNew.setPositionX(this._layout.getContentSize().width * 0.5);
        this.goldNew.setPositionY(this.goldOld.getPositionY() - 40);
        this.goldNew.defaultPos = this.goldNew.getPosition();
        this.bg.addChild(this.goldNew);
        this.bgBonus = ccui.Helper.seekWidgetByName(this._layout, "bgBonus");
        this.bgBonus.setLocalZOrder(2);

        this.pPromo = ccui.Helper.seekWidgetByName(this._layout, "pPromo");
        this.lbPromo = ccui.Helper.seekWidgetByName(this.pPromo, "lbPromo");
        this.lbPromo.setPositionX(ItemIapCell.WIDTH_ITEM);

        this.arrayDot = [];
        for (var i = 0; i < 12; i++) {
            this.arrayDot[i] = new cc.Sprite("Lobby/Common/dotNormal.png");
            this._layout.addChild(this.arrayDot[i]);
            this.arrayDot[i].setPosition(24 * (i + 1), ItemIapCell.HEIGHT_ITEM - 16);
        }
        this.stateEffect = 0;
        this.timeEfffect = 0;

        this.lastActionUpdate = 0;

        this.groupBonus = new GroupShopBonus(true);
        this.bg.addChild(this.groupBonus);
        this.groupBonus.setPosition(ItemIapCell.WIDTH_ITEM * 0.5 - this.groupBonus.getContentSize().width * 0.5, 500)

        this.lastActionUpdate = 0;
    },

    setInfo: function (inf) {
        this.info = inf;
        this.lastActionUpdate = 0;

        if (!isNaN(inf.cost))
            this.cost.setString(StringUtility.pointNumber(inf.cost));
        else
            this.cost.setString(inf.cost);

        if (!isNaN(inf.costConfig)) {
            if (inf.costConfig == inf.cost) {
                this.lbOldPrice.setVisible(false);
                this.imgLine.setVisible(false);
            } else {
                this.lbOldPrice.setString(StringUtility.pointNumber(inf.costConfig) + " vnđ");
                this.imgLine.setScaleX(this.lbOldPrice.getContentSize().width / this.imgLine.getContentSize().width);
            }
        } else {
            this.lbOldPrice.setVisible(false);
        }

        this.goldOld.setString(StringUtility.pointNumber(inf.goldOld));
        this.goldNew.setNumber(inf.goldNew);
        this.goldOld.setVisible(inf.goldNew != inf.goldOld);

        if (inf.bonus.length <= 0) {
            this.lbPromo.setVisible(false);
        } else {
            this.lbPromo.setVisible(true);
            this.lbPromo.setString(inf.bonus);
        }

        //set info bonus ticket
        this.groupBonus.setInfoOffer(inf);
        this.groupBonus.setPositionY(this.goldNew.getPositionY() - 40 - this.groupBonus.getContentSize().height);

        this.updateTime();
        this.unscheduleUpdate();
        this.scheduleUpdate();
    },

    updateTime: function () {
        var offer = offerManager.getOfferById(this.info.offerId);
        if (offer) {
            var time = offer.getTimeLeftInSecond();
            var s = LocalizedString.to("OFFER_REMAIN_TIME_2");
            if (time >= 1) {
                var str = StringUtility.getTimeString2(time);
                s = StringUtility.replaceAll(s, "@time", str);
            } else {
                s = LocalizedString.to("OFFER_REMAIN_TIME_3");
            }
        }
        else {
            s = LocalizedString.to("OFFER_REMAIN_TIME_3");
        }
        this.lbTime.setString(s);
    },

    update: function (dt) {
        this.updateTime();
        if (this.lbPromo.isVisible()) {
            this.lbPromo.setPositionX(this.lbPromo.getPositionX() - 0.8);
            if (this.lbPromo.getPositionX() < -200) {
                this.lbPromo.setPositionX(ItemIapCell.WIDTH_ITEM);
            }
        }
        this.timeEfffect = this.timeEfffect - dt;
        if (this.timeEfffect < 0) {
            this.timeEfffect = 0.2;
            this.stateEffect = 1 - this.stateEffect;
            for (var i = 0; i < this.arrayDot.length; i++) {
                this.arrayDot[i].setTexture(i % 2 == this.stateEffect ? "Lobby/Common/dotNormal.png" : "Lobby/Common/dotLight.png");
            }
        }
    }
});

/**
 * SHOP ITEM
 */

var ShopItemCell = cc.TableViewCell.extend({
    ctor: function(numCol, itemScale, itemSpace, highlight, tabItemPayment) {
        this._super(ShopItemCell.className);
        this.numCol = numCol;
        this.itemScale = itemScale;
        this.itemSpace = itemSpace;
        this.highlight = highlight;
        this.tabItemPayment = tabItemPayment;

        this._layout = new cc.Layer(ShopItemCell.WIDTH * this.itemScale * this.numCol + this.itemSpace * this.numCol, ShopItemCell.HEIGHT * this.itemScale + this.itemSpace);
        for (var i = 0; i < this.numCol; i++){
            var itemNode = ccs.load("Lobby/ShopItem.json").node;
            itemNode.setPosition(this.itemSpace + i * (this.itemSpace + ShopItemCell.WIDTH * this.itemScale), this.itemSpace/2);
            itemNode.setScale(this.itemScale);
            this._layout.addChild(itemNode, 0, i);
            itemNode.img = itemNode.getChildByName("img");
            itemNode.img.ignoreContentAdaptWithSize(true);
            itemNode.lbName = itemNode.getChildByName("lbName");
            itemNode.lbName.ignoreContentAdaptWithSize(true);
            itemNode.promoBg = itemNode.getChildByName("promoBg");
            itemNode.promo = itemNode.promoBg.getChildByName("promo");
            itemNode.promo.ignoreContentAdaptWithSize(true);
            itemNode.iconDiamond = itemNode.getChildByName("iconDiamond");
            itemNode.diamond = itemNode.iconDiamond.getChildByName("diamond");
            itemNode.diamond.ignoreContentAdaptWithSize(true);
            itemNode.iconLock = itemNode.getChildByName("iconLock");
            itemNode.condition = itemNode.iconLock.getChildByName("condition");
            itemNode.condition.ignoreContentAdaptWithSize(true);
            itemNode.iconLimit = itemNode.getChildByName("timeLimit");
            itemNode.iconLimit.setLocalZOrder(1);
            itemNode.getChildByName("bg").setTouchEnabled(true);
            itemNode.getChildByName("bg").setSwallowTouches(false);
            itemNode.getChildByName("bg").addTouchEventListener(function(target, type){
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
                        if (target.isWaitingTouch)
                            this.tabItemPayment.selectItem(target.getParent().index, target.getParent());
                        break;
                    case ccui.Widget.TOUCH_CANCELED:
                        break;
                }
            }.bind(this), this);
        }
        this.addChild(this._layout);
    },

    setData: function(items) {
        for (var i = 0; i < this.numCol; i++){
            var itemNode = this._layout.getChildByTag(i);
            if (i >= items.length) itemNode.setVisible(false);
            else{
                var item = items[i];
                itemNode.setVisible(true);
                cc.log("DA TA ITEM **** " + JSON.stringify(item));
                itemNode.lbName.setString(item.name);
                if (item.path && item.path != ""){
                    itemNode.img.setVisible(true);
                    itemNode.img.loadTexture(item.path);
                    itemNode.img.setScale(item.scale);
                }
                else{
                    itemNode.img.setVisible(false);
                }
                itemNode.index = item.index;

                var conditions = [];
                for (var j = 0; j < item.data.conditions.length; j++){
                    var condition = item.data.conditions[j];
                    switch(condition.type){
                        case StorageManager.VIP_CONDITION:
                            if (VipManager.getInstance().getRealVipLevel() < condition.num)
                                conditions.push(condition);
                            break;
                        case StorageManager.LEVEL_CONDITION:
                            if (userMgr.getLevel() < condition.num)
                                conditions.push(condition);
                            break;
                    }
                }
                if (conditions.length == 0){
                    itemNode.iconLock.setVisible(false);
                    itemNode.iconDiamond.setVisible(true);
                    ShopItemCell.setDiamond(itemNode, item.data.options[item.selectedOption].price);
                }
                else{
                    itemNode.iconLock.setVisible(true);
                    itemNode.iconDiamond.setVisible(false);
                    ShopItemCell.setConditions(itemNode, conditions);
                }

                itemNode.iconLimit.setVisible(item.data.remainTime >= 0);
                if (item.data.remainTime >= 0){
                    itemNode.iconLimit.stopAllActions();
                    itemNode.iconLimit.setRotation(0);
                    itemNode.iconLimit.runAction(cc.sequence(
                        cc.rotateTo(0.1, -20), cc.rotateTo(0.1, 19), cc.rotateTo(0.1, -18), cc.rotateTo(0.1, 17),
                        cc.rotateTo(0.1, -16), cc.rotateTo(0.1, 15), cc.rotateTo(0.1, -14), cc.rotateTo(0.1, 13),
                        cc.rotateTo(0.1, -12), cc.rotateTo(0.1, 11), cc.rotateTo(0.1, -10), cc.rotateTo(0.1, 9),
                        cc.rotateTo(0.1, -8), cc.rotateTo(0.1, 7), cc.rotateTo(0.1, -6), cc.rotateTo(0.1, 5),
                        cc.rotateTo(0.1, -4), cc.rotateTo(0.1, 3), cc.rotateTo(0.1, -2), cc.rotateTo(0.1, 1),
                        cc.rotateTo(0.1, 0), cc.delayTime(2)
                    ).repeatForever());
                }

                var maxDiscount = 0;
                for (var j = 0; j < item.data.options.length; j++)
                    maxDiscount = Math.max(item.data.options[j]["discount"], maxDiscount);
                ShopItemCell.setDiscount(itemNode, maxDiscount);

                if (item.isSelected){
                    this.highlight.removeFromParent();
                    itemNode.addChild(this.highlight);
                }
                else{
                    itemNode.removeChild(this.highlight);
                }
            }
        }
    }
});
ShopItemCell.setDiscount = function(itemNode, discount) {
    if (discount <= 0)
        itemNode.promoBg.setVisible(false);
    else{
        itemNode.promoBg.setVisible(true);
        itemNode.promo.setString("-" + discount + "%");
    }
};
ShopItemCell.setConditions = function(itemNode, conditions){
    if (conditions.length == 0){
        itemNode.iconLock.setVisible(false);
        return;
    }
    var cond = conditions[0];
    var condStr = "";
    switch(cond.type){
        case StorageManager.VIP_CONDITION:
            condStr += "Vip ";
            break;
        case StorageManager.LEVEL_CONDITION:
            condStr += "Level ";
    }
    condStr += cond.num;
    itemNode.condition.setString(condStr);
    var w = itemNode.condition.x + itemNode.condition.getAutoRenderSize().width;
    var d = w/2 - itemNode.iconLock.width/2;
    itemNode.iconLock.setPositionX(itemNode.width/2 - d);
};
ShopItemCell.setDiamond = function(itemNode, price) {
    itemNode.diamond.setString(StringUtility.standartNumber(price));
    var w = itemNode.diamond.x + itemNode.diamond.getAutoRenderSize().width;
    var d = w/2 - itemNode.iconDiamond.width/2;
    itemNode.iconDiamond.setPositionX(itemNode.width/2 - d);
};
ShopItemCell.className = "ShopItemCell";
ShopItemCell.WIDTH = 213;
ShopItemCell.HEIGHT = 309;
ShopItemCell.MIN_COL = 4;
ShopItemCell.MAX_COL = 4;
ShopItemCell.MIN_SPACE = 15;
ShopItemCell.MIN_SCALE = 0.75;