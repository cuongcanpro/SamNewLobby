
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
        this.groupBonus.setPosition(ItemIapCell.WIDTH_ITEM * 0.5 - this.groupBonus.getContentSize().width * 0.525, 500)

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
        if (inf.type == Payment.GOLD_IAP || inf.type == Payment.G_IAP) {
            this.currency.setVisible(false);
        }
        else if (inf.type == Payment.GOLD_G) {
            this.currency.setVisible(true);
            this.currency.setString("G");
        }
        else {
            this.currency.setVisible(true);
            this.currency.setString("₫");
        }

        //level up vip
        this.uptoLevelVip.setVisible(false);
        this.iconUp.setVisible(false);
        // if (inf.uptoLevelVip > 0) {
        //     var imgVip = VipManager.getIconVip(inf.uptoLevelVip);
        //     if (imgVip) {
        //         this.uptoLevelVip.loadTexture(imgVip);
        //         this.uptoLevelVip.setVisible(true);
        //         this.iconUp.setVisible(true);
        //         this.iconUp.stopAllActions();
        //         this.iconUp.setPosition(this.uptoLevelVip.getPositionX() + this.uptoLevelVip.getContentSize().width/2 - this.iconUp.width/2 - 2, this.uptoLevelVip.getPositionY() + this.uptoLevelVip.getContentSize().height/2 - this.iconUp.height/2 - 2);
        //         this.iconUp.runAction(cc.sequence(cc.moveBy(0.2, 0, 3), cc.moveBy(0.5, 0, -3)).repeatForever());
        //     }
        // }

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
ShopBonusRow.PAD_Y = 32;