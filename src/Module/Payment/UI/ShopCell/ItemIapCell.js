
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
        this.effShop = new CustomSkeleton("Armatures/Shop", "shop", 1);
        this.bg.addChild(this.effShop);
        this.effShop.setPosition(this.img.getPosition());
        this.btn.setLocalZOrder(2);

        this.lbRoot = ccui.Helper.seekWidgetByName(this._layout, "lbRoot")
        this.goldOld = ccui.Helper.seekWidgetByName(this.lbRoot, "gold_old");
        this.goldOld.setColor(cc.color(200, 200, 200));
        this.iconLine = ccui.Helper.seekWidgetByName(this.lbRoot, "iconLine");
        this.iconLine.setVisible(false);
        this.goldNew = new NumberGroupCustom("res/Lobby/ShopIAP/Number/num_", -4, NumberGroupCustom.TYPE_POINT);
        this.goldNew.setPositionX(this._layout.getContentSize().width * 0.5);
        this.goldNew.setPositionY(this.lbRoot.getPositionY() - 35);
        this.goldNew.defaultPos = this.goldNew.getPosition();
        this.bg.addChild(this.goldNew);

        this.bgBonus = ccui.Helper.seekWidgetByName(this._layout, "bgBonus");
        this.bgBonus.bonus = ccui.Helper.seekWidgetByName(this.bgBonus, "bonus");
        this.bgBonus.bonus.ignoreContentAdaptWithSize(true);
        this.bgBonus.addTouchEventListener(this.onClickBonus, this);
        this.bgBonus.setLocalZOrder(2);
        this.bgBonus.setSwallowTouches(false);
        this.touchedBonus = false;

        this.lastActionUpdate = 0;

        this.groupBonus = new GroupShopBonus();
        this.bg.addChild(this.groupBonus);
        this.groupBonus.setPosition(ItemIapCell.WIDTH_ITEM * 0.479, 260);

        this.groupBonusSource = new GroupBonusSource();
        this.bg.addChild(this.groupBonusSource);
        this.groupBonusSource.setVisible(false);
    },

    onClickBonus: function (sender, type) {
        switch (type){
            case ccui.Widget.TOUCH_BEGAN:
                this.touchedBonus = true;
                break;
            case ccui.Widget.TOUCH_ENDED:
                this.groupBonusSource.showGroup();
                break;
        }
    },

    isTouchedBonus: function () {
        var result = this.touchedBonus;
        this.touchedBonus = false;
        return result;
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
        cc.log("IAPItemCell : " + JSON.stringify(inf));

        this.touchedBonus = false;
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
            this.scheduleUpdate();
        }
        else if (inf.type == Payment.GOLD_G) {
            this.currency.setVisible(true);
            this.currency.setString("G");
        }
        else {
            this.currency.setVisible(true);
            this.currency.setString("₫");
        }

        //gold value
        this.goldNew.setNumber(inf.goldNew);
        this.goldOld.setString(StringUtility.pointNumber(inf.goldOld));
        this.lbRoot.setVisible(inf.goldNew != inf.goldOld);
        this.iconLine.setContentSize(cc.size(this.goldOld.getAutoRenderSize().width, this.iconLine.getContentSize().height));
        // if (this.goldOld.isVisible()) this.goldNew.setPositionY(this.goldNew.defaultPos.y);
        // else this.goldNew.setPositionY(this.goldOld.getPositionY() - 10);
        if (!inf.type || paymentMgr.isBuyG(inf.type))
            this.goldNew.setPositionX(ItemIapCell.WIDTH_ITEM * 0.5);
        else
            this.goldNew.setPositionX(this.lbRoot.getPositionX() + this.goldNew.getContentSize().width * 0.5);


        // group Bonus
        this.groupBonus.setInfo(inf);

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
        // this.img.setScale(0.8);

        if (this.info.promoDailyPurchase){
            var temp = new ccui.ImageView("Lobby/DailyPurchase/btnLobby.png", 0, "DailyPurchase");
            this.img.addChild(temp);
            temp.stopAllActions();
            temp.setVisible(true);
            temp.setPosition(20, 70);
            temp.runAction(cc.sequence(
                cc.scaleTo(0.3, 0.95, 1.05).easing(cc.easeSineInOut()),
                cc.scaleTo(0.3, 1.05, 0.95).easing(cc.easeSineInOut())
            ).repeatForever());
            this.effShop.setVisible(false);
        }
        else if (this.info.isOfferNoPrice) {
            var sp = ccui.Button.create("res/Lobby/Offer/iconSuperOffer.png");
            sp.setPosition(20, 70);
            sp.setPressedActionEnabled(true);
            sp.loadTextures("res/Lobby/Offer/iconSuperOffer.png", "res/Lobby/Offer/iconSuperOffer.png", "");
            sp.addTouchEventListener(this.showOffer, this);
            //   sp.setScale(this._scale);
            this.img.addChild(sp);
            sp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
            this.effShop.setVisible(false);
        }
        else {
            this.effShop.setVisible(true);
            var s = "";
            if (paymentMgr.isBuyG(this.info.type)) {
                s = "g_" + (this.info.index + 1);
                this.effShop.setPositionY(this.img.getPositionY() + 6 * this.info.index);
            }
            else {
                s = "gold_" + (this.info.index + 1);
                this.effShop.setPositionY(this.img.getPositionY());
            }
            this.effShop.setAnimation(0, s, -1);
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
            this.btn.setBright(1);
            this.bgTime.setVisible(false);
        } else {
//            this.cost.setColor(cc.color(197, 197, 197, 0));
            this.btn.setBright(0);
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
        this.setCascadeOpacityEnabled(true);
    },

    setInfo: function (shopPackage) {
        cc.log("SHOP PACKAGE *** " + JSON.stringify(shopPackage));

        for (var i = 0; i < this.arrayBonusRow.length; i++) {
            this.arrayBonusRow[i].setVisible(false);
        }
        var levelVip = VipManager.getInstance().getRealVipLevel();
        var count = 0;
        var pad = 30;
        var padding = 20;
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
            bonusRow.setPosition(padding, pad * (count + 0.5) + padding);
            count++;
        }

        if (shopPackage.bonusValue && shopPackage.bonusValue > 0) {
            var s = "+" + shopPackage.bonusValue + "% " + shopPackage.bonus + (shopPackage.isBonusVip ? levelVip : "");
            var bonusRow = this.getShopBonusRow();
            bonusRow.setVisible(true);
            bonusRow.setString(s);
            bonusRow.setPosition(padding, pad * (count + 0.5) + padding);
            count++;
        }
        this.bg.setContentSize(this.bg.getContentSize().width, pad * (count) + 2 * padding);
        this.setContentSize(cc.size(this.bg.getContentSize().width, pad * (count) + 2 * padding));
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
        // this.bg.setAnchorPoint(cc.p(0, 0));
        this.setContentSize(this.bg.getContentSize());
        this.setCascadeOpacityEnabled(true);
    },

    setInfo: function (shopPackage) {
        this.arrayBonus = ShopBonusData.getArrayBonus(shopPackage);
        this.updateView();
    },

    setInfoOffer: function (shopPackage) {
        this.arrayBonus = ShopBonusData.getArrayBonusOffer(shopPackage);
        this.updateView();
    },

    updateView: function () {
        for (var i = 0; i < this.arrayBonusRow.length; i++) {
            this.arrayBonusRow[i].setVisible(false);
        }
        if (this.arrayBonus.length == 0) {
            this.setVisible(false);
            return;
        }
        this.setVisible(true);
        var startY = this.bg.getContentSize().height * 0.5 - GroupShopBonus.PADDING;
        var startX = -this.bg.getContentSize().width * 0.5 + GroupShopBonus.PADDING;
        for (var i = 0; i < this.arrayBonus.length; i++) {
            var row = this.getShopBonusRow();
            row.setInfo(this.arrayBonus[i]);
            row.setPosition(startX , startY - (i + 0.5) * ShopBonusRow.PAD_Y);
            row.setVisible(true);
        }
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

GroupShopBonus.PADDING = 18;

/**
 * Hang Bonus di kem trong Group Bonus
 */
ShopBonusRow =  cc.Node.extend({
    ctor: function () {
        this._super();
        this.setAnchorPoint(cc.p(0, 0));
        this.setCascadeOpacityEnabled(true);

        this.icon = new cc.Sprite("res/Lobby/Vip/iconVpoint.png");
        this.addChild(this.icon);
        this.icon.setPositionX(this.icon.getContentSize().width * 0.5);

        this.labelNumOld = BaseLayer.createLabelText("fkdsjl fjsdj fsld kjfd", cc.color("#7b7ef9"));
        this.labelNumOld.setFontName(SceneMgr.FONT_BOLD);
        this.labelNumOld.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        this.labelNumOld.setAnchorPoint(cc.p(0, 0.5));
        this.labelNumOld.setFontSize(18);
        this.labelNumOld.ignoreContentAdaptWithSize(false);
        this.labelNumOld.setPositionX(ShopBonusRow.START_LABEL);
        this.addChild(this.labelNumOld);

        this.iconLine = new ccui.ImageView("res/Lobby/ShopIAP/line.png");
        this.labelNumOld.addChild(this.iconLine);
        this.iconLine.setAnchorPoint(cc.p(0, 0.5));
        this.iconLine.setScale9Enabled(true);
        this.iconLine.setPositionY(10);
        this.iconLine.setContentSize(50, 1);
        this.iconLine.setColor(cc.color("#7b7ef9"));

        this.labelNum = BaseLayer.createLabelText("fkdsjl fjsdj fsld kjfd", cc.color(255, 246, 220, 255));
        this.labelNum.setFontName(SceneMgr.FONT_BOLD);
        this.labelNum.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        this.labelNum.setAnchorPoint(cc.p(0, 0.5));
        this.labelNum.setFontSize(18);
        this.labelNum.ignoreContentAdaptWithSize(false);
        this.labelNum.setPositionX(ShopBonusRow.START_LABEL);
        this.labelNum.enableOutline(cc.color("#4e4e9c"), 1);
        this.addChild(this.labelNum);

        this.labelDescrible = BaseLayer.createLabelText("fkdsjl fjsdj fsld kjfd", cc.color(255, 246, 220, 255));
        this.labelDescrible.setFontName(SceneMgr.FONT_NORMAL);
        this.labelDescrible.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        this.labelDescrible.setAnchorPoint(cc.p(0, 0.5));
        this.labelDescrible.setFontSize(18);
        this.labelDescrible.ignoreContentAdaptWithSize(false);
        this.labelDescrible.enableOutline(cc.color("#4e4e9c"), 1);
        this.addChild(this.labelDescrible);
    },

    // set thong tin chung cua Bonus
    setInfo: function (bonusData) {
        this.icon.setTexture(bonusData.getResourceIcon());
        this.icon.setScale(bonusData.getScaleRate());

        if (bonusData.numOld && bonusData.numOld < bonusData.num && bonusData.type == ShopBonusData.TYPE_VPOINT) {
            this.labelNumOld.setVisible(true);
            this.labelNumOld.setString(bonusData.numOld);
            this.labelNum.setPositionX(this.labelNumOld.getPositionX() +  this.labelNumOld.getAutoRenderSize().width + 3);
            this.iconLine.setContentSize(cc.size(this.labelNumOld.getAutoRenderSize().width , 2));
        }
        else {
            this.labelNumOld.setVisible(false);
            this.labelNum.setPositionX(ShopBonusRow.START_LABEL);
        }
        this.labelNum.setString("+" + bonusData.num);

        this.labelDescrible.setString(bonusData.getTitle());
        if (bonusData.type == ShopBonusData.TYPE_UP_VIP) {
            this.labelNum.setVisible(false);
            this.labelDescrible.setPositionX(ShopBonusRow.START_LABEL);
        }
        else {
            this.labelNum.setVisible(true);
            this.labelDescrible.setPositionX(this.labelNum.getPositionX() + this.labelNum.getAutoRenderSize().width + 3);
        }
    },
});
ShopBonusRow.PAD_Y = 28;
ShopBonusRow.START_LABEL = 35;