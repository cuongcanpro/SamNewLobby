
var ItemIapCell = cc.TableViewCell.extend({

    ctor: function (p) {
        this._super();

        this.tParent = p;
        this._layout = ccs.load("ShopIapItem.json").node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);

        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.btn = ccui.Helper.seekWidgetByName(this._layout, "btn");
        this.cost = ccui.Helper.seekWidgetByName(this.btn, "vnd");
        this.currency = ccui.Helper.seekWidgetByName(this.btn, "lb");
        this.uptoLevelVip = ccui.Helper.seekWidgetByName(this._layout, "uptoLevelVip");
        this.uptoLevelVip.ignoreContentAdaptWithSize(true);
        this.iconUp = ccui.Helper.seekWidgetByName(this._layout, "iconUp");
        this.iconUp.defaultPos = this.iconUp.getPosition();
        var btn = ccui.Helper.seekWidgetByName(this.uptoLevelVip, "btnTooltip");
        btn.addTouchEventListener(this.onTouchEventHandler, this);

        this.goldOld = this.cloneLabel(ccui.Helper.seekWidgetByName(this._layout, "gold_old"));
        this.goldOld.setColor(cc.color(200, 200, 200));
        this.goldNew = this.cloneLabel(ccui.Helper.seekWidgetByName(this._layout, "gold_new"));
        this.goldNew.defaultPos = this.goldNew.getPosition();
        this.line = ccui.Helper.seekWidgetByName(this._layout, "line");

        this.star = this.cloneLabel(ccui.Helper.seekWidgetByName(this._layout, "star"));
        this.star.ignoreContentAdaptWithSize(true);
        this.star.defaultPosition = this.star.getPosition();
        this.starOld = this.cloneLabel(ccui.Helper.seekWidgetByName(this._layout, "star_old"));
        this.starOld.ignoreContentAdaptWithSize(true);
        this.starOld.defaultPosition = this.starOld.getPosition();
        this.vPointLine = ccui.Helper.seekWidgetByName(this._layout, "vpoint_line");
        this.gStar = ccui.Helper.seekWidgetByName(this._layout, "iconStar");

        this.timeVip = this.cloneLabel(ccui.Helper.seekWidgetByName(this._layout, "timeVip"));
        this.timeVip.ignoreContentAdaptWithSize(true);
        this.iconTimeVip = ccui.Helper.seekWidgetByName(this._layout, "iconTimeVip");

        this.arrayLbGachaCoin = [];
        this.arrayIconGachaCoin = [];
        for (var i = 0; i < 2; i++) {
            this.arrayIconGachaCoin.push(ccui.Helper.seekWidgetByName(this._layout, "iconGacha_" + i));
            this.arrayLbGachaCoin.push(ccui.Helper.seekWidgetByName(this._layout, "lbGacha_" + i));
        }

        this.bgBonus = ccui.Helper.seekWidgetByName(this._layout, "bgBonus");
        this.bgBonus.text = ccui.Helper.seekWidgetByName(this.bgBonus, "text");
        this.bgBonus.bonus = ccui.Helper.seekWidgetByName(this.bgBonus, "bonus");
        this.bgBonus.text.ignoreContentAdaptWithSize(true);
        this.bgBonus.bonus.ignoreContentAdaptWithSize(true);

        this.bgBonusGold = ccui.Helper.seekWidgetByName(this._layout, "bgBonusGold");
        this.bgBonusGold.text = ccui.Helper.seekWidgetByName(this.bgBonusGold, "text");
        this.bgBonusGold.bonus = ccui.Helper.seekWidgetByName(this.bgBonusGold, "bonus");
        this.bgBonusGold.bonus.ignoreContentAdaptWithSize(true);

        this.bgBonusVip = ccui.Helper.seekWidgetByName(this._layout, "bgBonusVip");
        this.bgBonusVip.text = ccui.Helper.seekWidgetByName(this.bgBonusVip, "text");
        this.bgBonusVip.bonus = ccui.Helper.seekWidgetByName(this.bgBonusVip, "bonus");
        this.bgBonusVip.bonus.ignoreContentAdaptWithSize(true);

        this.bonusValue = ccui.Helper.seekWidgetByName(this._layout, "bonusValue");

        this.lastActionUpdate = 0;
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
        if (inf.smsType == 1) {
            if (Config.ENABLE_EVENT_TET)
                this.goldNew.setString(StringUtility.pointNumber(inf.goldNew) + " " + localized("EVENT_TET_LABEL_SHOP"));
            else
                this.goldNew.setString(StringUtility.pointNumber(inf.goldNew));
        } else {
            this.goldNew.setString(StringUtility.pointNumber(inf.goldNew));
        }
        this.goldOld.setString(StringUtility.pointNumber(inf.goldOld));
        if (inf.goldColor)
            this.goldNew.setColor(inf.goldColor);
        else
            this.goldNew.setColor(cc.color(255, 171, 27, 0));
        this.goldOld.setVisible(inf.goldNew != inf.goldOld);
        if (this.goldOld.isVisible()) this.goldNew.setPositionY(this.goldNew.defaultPos.y);
        else this.goldNew.setPositionY(this._layout.getContentSize().height/2);
        this.line.setVisible(inf.goldNew != inf.goldOld);
        this.line.setPositionX(this.goldOld.getPositionX() + this.goldOld.getContentSize().width / 2);
        this.line.setScaleX(this.goldOld.getContentSize().width / this.line.getContentSize().width);

        //vip points
        this.star.setVisible(inf.vPoint > 0);
        this.gStar.setVisible(inf.vPoint > 0);
        this.star.setString("+" + StringUtility.pointNumber(inf.vPoint));
        this.starOld.setVisible(inf.vPointOld != null);
        this.vPointLine.setVisible(inf.vPointOld != null);
        if (inf.vPointOld != null){
            this.starOld.setString("+" + StringUtility.pointNumber(inf.vPointOld));
            this.vPointLine.setScaleX(this.starOld.getContentSize().width / this.vPointLine.getContentSize().width);
            this.vPointLine.setPositionX(this.starOld.getPositionX() - this.starOld.getContentSize().width/2);
        }
        this.gStar.setPositionX(this.star.getPositionX() + this.star.getContentSize().width + 5);

        //time vip
        var levelVip = VipManager.getInstance().getRealVipLevel();
        inf.hourBonus = inf.hourBonus || 0;
        this.timeVip.setVisible(inf.vPoint > 0 && inf.hourBonus > 0 && levelVip > 0);
        this.timeVip.setString(StringUtility.replaceAll(localized("VIP_SHOP_HOUR_BONUS"), "@number", inf.hourBonus));
        this.iconTimeVip.setVisible(inf.vPoint > 0 && inf.hourBonus > 0 && levelVip > 0);
        this.iconTimeVip.setPositionX(this.timeVip.getPositionX() + this.timeVip.getContentSize().width + 4);

        //event item bonus
        eventMgr.updateItemInShop(this.arrayLbGachaCoin, this.arrayIconGachaCoin, this.bonusValue, inf);

        //bonus
        this.bgBonusGold.setVisible(false);
        this.bgBonusVip.setVisible(false);
        if (inf.curVoucher != null){
            var bgBonus = null;
            if (inf.curVoucher.bonusType == StorageManager.BONUS_GOLD)
                bgBonus = this.bgBonusGold;
            if (inf.curVoucher.bonusType == StorageManager.BONUS_VPOINT)
                bgBonus = this.bgBonusVip;
            bgBonus.setVisible(true);
            bgBonus.bonus.setString("+" + inf.curVoucher.bonusValue + "%");
        }

        this.bgBonus.setVisible(inf.bonusValue && inf.bonusValue > 0);
        if (inf.bonusValue && inf.bonusValue > 0){
            this.bgBonus.text.setString(inf.bonus + (inf.isBonusVip ? levelVip : ""));
            this.bgBonus.bonus.setString("+" + inf.bonusValue + "%");
        }
    },

    setButton: function (type) {
        switch (type) {
            case Payment.GOLD_G:
            case Payment.TICKET_G: {
                this.btn.loadTextures("ShopIAP/g_btn.png", "ShopIAP/g_btn.png");
                this.currency.setString(ItemIapCell.CURRENCY_G);
                this.currency.setColor(cc.color(52, 104, 2, 0));
                this.cost.setColor(cc.color(52, 104, 2, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_ATM:
            case Payment.G_ATM:
            case Payment.TICKET_ATM: {
                this.btn.loadTextures("ShopIAP/ATMBtn.png", "ShopIAP/ATMBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ATM);
                this.currency.setColor(cc.color(62, 23, 89, 0));
                this.cost.setColor(cc.color(62, 23, 89, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_ZING:
            case Payment.G_ZING:
            case Payment.TICKET_ZING: {
                this.btn.loadTextures("ShopIAP/zingBtn.png", "ShopIAP/zingBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ZING);
                this.currency.setColor(cc.color(121, 5, 48, 0));
                this.cost.setColor(cc.color(121, 5, 48, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_IAP:
            case Payment.G_IAP:
            case Payment.TICKET_IAP: {
                this.scheduleUpdate();

                this.btn.loadTextures(this.getIAPImage(), this.getIAPImage());
                this.cost.setColor(this.getIAPColor());
                this.currency.setVisible(false);
                break;
            }
            case Payment.GOLD_SMS_VIETTEL:
            case Payment.GOLD_SMS_MOBI:
            case Payment.GOLD_SMS_VINA:
            case Payment.GOLD_SMS:
            case Payment.TICKET_SMS: {
                this.btn.loadTextures("ShopIAP/btn_sms.png", "ShopIAP/btn_sms.png");
                this.currency.setString(ItemIapCell.CURRENCY_SMS);
                this.currency.setColor(cc.color(149, 64, 46, 0));
                this.cost.setColor(cc.color(149, 64, 46, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.G_ZALO:
            case Payment.GOLD_ZALO:
            case Payment.TICKET_ZALO: {
                this.btn.loadTextures("ShopIAP/zaloBtn.png", "ShopIAP/zaloBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ZALO);
                this.currency.setColor(cc.color(255, 255, 255, 0));
                this.cost.setColor(cc.color(255, 255, 255, 0));
                this.currency.setVisible(true);
                break;
            }
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
            sp.setScale(this._scale);
            this.img.addChild(sp);
            sp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
        }
    },

    getIAPImage: function () {
        if (cc.sys.os == cc.sys.OS_IOS) {
            return "ShopIAP/iap_ios_btn.png";
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            return "ShopIAP/iap_btn.png";
        }

        return "ShopIAP/iap_ios_btn.png";
    },

    getIAPColor: function () {
        if (cc.sys.os == cc.sys.OS_IOS) {
            return cc.color(12, 45, 115, 0);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            return cc.color(19, 90, 77, 0);
        }

        return cc.color(12, 45, 115, 0);
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
            this.btn.loadTextures(this.getIAPImage(), this.getIAPImage());
            this.cost.setColor(this.getIAPColor());
            this.currency.setVisible(false);
        } else {
            this.btn.loadTextures("ShopIAP/btn_iap_limit_time.png", "ShopIAP/btn_iap_limit_time.png");
            this.cost.setColor(cc.color(197, 197, 197, 0));
            this.currency.setVisible(true);
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
        pos.x -= this.btn.getContentSize().width / 2;
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

            this.currency.setString(iapHandler.getTimeLimitString(this.info.limitTimeIdx));
        }
    }
});
ItemIapCell.CURRENCY_IAP = "VND";
ItemIapCell.CURRENCY_SMS = "VND";
ItemIapCell.CURRENCY_G = "G";
ItemIapCell.CURRENCY_ATM = "VND";
ItemIapCell.CURRENCY_ZING = "VND";
ItemIapCell.CURRENCY_ZALO = "VND";

var OfferIapCell = cc.TableViewCell.extend({
    ctor: function (p) {
        this._super();

        this.tParent = p;
        var jsonLayout = ccs.load("OfferIapItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);

        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.currentImage = null;
        this.btn = ccui.Helper.seekWidgetByName(this._layout, "btn");
        this.oldCost = ccui.Helper.seekWidgetByName(this._layout, "lbOldPrice");
        this.oldCost.ignoreContentAdaptWithSize(true);
        this.cost = ccui.Helper.seekWidgetByName(this.btn, "vnd");
        this.currency = ccui.Helper.seekWidgetByName(this.btn, "lb");
        this.goldOld = ccui.Helper.seekWidgetByName(this._layout, "lbOldGold");
        this.goldOld.ignoreContentAdaptWithSize(true);
        this.goldNew = ccui.Helper.seekWidgetByName(this._layout, "lbGold");
        this.line1 = ccui.Helper.seekWidgetByName(this._layout, "line1");
        this.line2 = ccui.Helper.seekWidgetByName(this._layout, "line2");
        this.time = ccui.Helper.seekWidgetByName(this._layout, "lbTime");
        this.time.ignoreContentAdaptWithSize(true);
        this.lbPromo2 = ccui.Helper.seekWidgetByName(this._layout, "lbPromo2");
        this.lbPromo2.ignoreContentAdaptWithSize(true);
        this.lbBonus = ccui.Helper.seekWidgetByName(this._layout, "lbBonus");
        this.lbBonus.ignoreContentAdaptWithSize(true);

        this.lastActionUpdate = 0;
    },

    setInfo: function (inf) {
        this.info = inf;
        this.lastActionUpdate = 0;

        this.createImage();
        if (!isNaN(inf.cost))
            this.cost.setString(StringUtility.pointNumber(inf.cost));
        else
            this.cost.setString(inf.cost);

        if (!isNaN(inf.costConfig)) {
            if (inf.costConfig == inf.cost) {
                this.oldCost.setVisible(false);
                this.line1.setVisible(false);
            } else {
                this.oldCost.setString(StringUtility.pointNumber(inf.costConfig) + " vnđ");
                this.line1.setScaleX(this.oldCost.getContentSize().width / this.line1.getContentSize().width);
            }
        } else {
            this.oldCost.setVisible(false);
            this.line1.setVisible(false);
        }

        this.goldOld.setString(StringUtility.pointNumber(inf.goldOld));
        this.goldNew.setString(StringUtility.pointNumber(inf.goldNew));
        var str = "";
        str += "+ " + StringUtility.pointNumber(inf.vPoint) + " VPoint";


        this.goldOld.setVisible(inf.goldNew != inf.goldOld);
        this.line2.setVisible(inf.goldNew != inf.goldOld);

        this.line2.setPositionX(this.goldOld.getPositionX() + this.goldOld.getContentSize().width / 2);
        this.line2.setScaleX(this.goldOld.getContentSize().width / this.line2.getContentSize().width);

        var levelVip = VipManager.getInstance().getRealVipLevel();
        inf.hourBonus = inf.hourBonus || 0;
        if (inf.hourBonus > 0 && inf.vPoint > 0 && levelVip > 0) {
            str += "\n+ " + inf.hourBonus + "h VIP";
        }

        if (inf.bonus.length <= 0) {
            this.lbPromo2.setVisible(false);
        } else {
            this.lbPromo2.setVisible(true);
            this.lbPromo2.setString(inf.bonus);
        }

        //set info bonus ticket
        var offerEvent = inf.offerEvents;
        for (var i = 0; i < offerEvent.length; i++) {
            var eOffer = offerEvent[i];
            str += "\n+ " + eOffer["value"] + " " + eventMgr.getOfferTicketString(eOffer["eventId"]);
        }

        //set info bonus diamond
        if (inf.diamondBonus > 0) {
            str += "\n+ " + inf.diamondBonus + " Kim cương";
        }

        if (str.length > 0) {
            this.lbBonus.setString(str);
        }
        var offer = offerManager.getOfferById(inf.offerId);
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
        this.time.setString(s);
        this.unscheduleUpdate();
        this.scheduleUpdate();
    },

    setButton: function (type) {
        switch (type) {
            case Payment.GOLD_G:
            case Payment.TICKET_G: {
                this.btn.loadTextures("ShopIAP/g_btn.png", "ShopIAP/g_btn.png");
                this.currency.setString(ItemIapCell.CURRENCY_G);
                this.currency.setColor(cc.color(52, 104, 2, 0));
                this.cost.setColor(cc.color(52, 104, 2, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_ATM:
            case Payment.G_ATM:
            case Payment.TICKET_ATM: {
                this.btn.loadTextures("ShopIAP/ATMBtn.png", "ShopIAP/ATMBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ATM);
                this.currency.setColor(cc.color(62, 23, 89, 0));
                this.cost.setColor(cc.color(62, 23, 89, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_ZING:
            case Payment.G_ZING:
            case Payment.TICKET_ZING: {
                this.btn.loadTextures("ShopIAP/zingBtn.png", "ShopIAP/zingBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ZING);
                this.currency.setColor(cc.color(121, 5, 48, 0));
                this.cost.setColor(cc.color(121, 5, 48, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_IAP:
            case Payment.G_IAP:
            case Payment.TICKET_IAP: {
                this.scheduleUpdate();

                this.btn.loadTextures(this.getIAPImage(), this.getIAPImage());
                this.cost.setColor(this.getIAPColor());
                this.currency.setVisible(false);
                break;
            }
            case Payment.GOLD_SMS_VIETTEL:
            case Payment.GOLD_SMS_MOBI:
            case Payment.GOLD_SMS_VINA:
            case Payment.GOLD_SMS:
            case Payment.TICKET_SMS: {
                this.btn.loadTextures("ShopIAP/btn_sms.png", "ShopIAP/btn_sms.png");
                this.currency.setString(ItemIapCell.CURRENCY_SMS);
                this.currency.setColor(cc.color(149, 64, 46, 0));
                this.cost.setColor(cc.color(149, 64, 46, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.G_ZALO:
            case Payment.GOLD_ZALO:
            case Payment.TICKET_ZALO: {
                this.btn.loadTextures("ShopIAP/zaloBtn.png", "ShopIAP/zaloBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ZALO);
                this.currency.setColor(cc.color(255, 255, 255, 0));
                this.cost.setColor(cc.color(255, 255, 255, 0));
                this.currency.setVisible(true);
                break;
            }
        }
    },

    createImage: function () {
        this.img.removeAllChildren();

        var sp = new cc.Sprite(this.info.img);
        sp.setScale(this._scale);
        this.img.addChild(sp);
        sp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
    },

    getIAPImage: function () {
        if (cc.sys.os == cc.sys.OS_IOS) {
            return "ShopIAP/iap_ios_btn.png";
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            return "ShopIAP/iap_btn.png";
        }

        return "ShopIAP/iap_ios_btn.png";
    },

    getIAPColor: function () {
        if (cc.sys.os == cc.sys.OS_IOS) {
            return cc.color(12, 45, 115, 0);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            return cc.color(19, 90, 77, 0);
        }

        return cc.color(12, 45, 115, 0);
    },

    update: function (dt) {
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

        this.time.setString(s);
    }
});

var ShopItemCell = cc.TableViewCell.extend({
    ctor: function(numCol, itemScale, itemSpace, highlight, tabItemPayment) {
        this._super(ShopItemCell.className);
        this.numCol = numCol;
        this.itemScale = itemScale;
        this.itemSpace = itemSpace;
        this.highlight = highlight;
        this.tabItemPayment = tabItemPayment;

        this._layout = new cc.Layer(StorageItemCell.WIDTH * this.itemScale * this.numCol + this.itemSpace * this.numCol, StorageItemCell.HEIGHT * this.itemScale + this.itemSpace);
        for (var i = 0; i < this.numCol; i++){
            var itemNode = ccs.load("Lobby/ShopItem.json").node;
            itemNode.setPosition(this.itemSpace + i * (this.itemSpace + StorageItemCell.WIDTH * this.itemScale), this.itemSpace/2);
            itemNode.setScale(this.itemScale);
            this._layout.addChild(itemNode, 0, i);
            itemNode.img = itemNode.getChildByName("img");
            itemNode.img.ignoreContentAdaptWithSize(true);
            itemNode.shadow = itemNode.getChildByName("shadow");
            itemNode.shadow.ignoreContentAdaptWithSize(true);
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
                if (item.path && item.path != ""){
                    itemNode.img.setVisible(true);
                    itemNode.img.loadTexture(item.path);
                    itemNode.img.setScale(item.scale);
                    itemNode.shadow.setVisible(true);
                    itemNode.shadow.loadTexture(item.path);
                    itemNode.shadow.setScale(item.scale);
                }
                else{
                    itemNode.img.setVisible(false);
                    itemNode.shadow.setVisible(false);
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
ShopItemCell.WIDTH = 110;
ShopItemCell.HEIGHT = 110;
ShopItemCell.MIN_COL = 2;
ShopItemCell.MAX_COL = 3;
ShopItemCell.MIN_SPACE = 15;
ShopItemCell.MIN_SCALE = 0.75;