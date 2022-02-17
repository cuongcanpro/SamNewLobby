/**
 * Created by CPU02314_LOCAL on 12/17/2019.
 */

var GUIOffer = BaseLayer.extend({
    ctor: function () {
        this._super(GUIOffer.className);
        this.initWithBinaryFile("GUIOffer.json");
    },

    initGUI: function () {
        this.arrayOfferImage = [];
        this.bg = this.getControl("bg");
        this.btnPayment = this.customButton("btn", GUIOffer.BTN_BUY);
        this.customButton("btnClose", GUIOffer.BTN_CLOSE);
        this.lbTime = this.getControl("lbTime", this.bg);
        this.lbPrice = this.getControl("lbPrice", this.btnPayment);
        this.iconType = this.getControl("iconType", this.btnPayment);
        this.iconType = this.btnPayment.getChildByName("iconType");
        this.iconType.setLocalZOrder(3);
        this.lbPrice.setLocalZOrder(3);
        //this.lbTitle = this.getControl("lbTitle", this.bg);

        // if (this.btnEff.eff) {
        //     this.btnEff.eff.gotoAndPlay("1", -1, -1, 0);
        // } else {
        var anim = db.DBCCFactory.getInstance().buildArmatureNode("BT_5K");
        this.btnPayment.addChild(anim);
        // this.btnEff.eff = anim;
        anim.gotoAndPlay("1", -1, -1, 0);
        anim.setPosition(this.btnPayment.getContentSize().width / 2, this.btnPayment.getContentSize().height / 2);
        // }

        //var lbPackage =  this.getControl("lbPackage", this.bg);
        var s = "fjsfsdfsfsflj  @money ljldfs";
        var arrayS = s.split("@money");
        cc.log("SPLIT " + JSON.stringify(arrayS));
        var s1 = arrayS[0] + "<" + "color = YELLOW" + ">" + "200k" + "<" + "/color>" + arrayS[1];
        cc.log(s1);
        var customLabel = new CustomLabel(cc.size(400, 200));
        this.bg.addChild(customLabel);
        customLabel.setDefaultAlignHorizontal(RichTextAlignment.CENTER);
        customLabel.setDefaultAlignVertical(RichTextAlignment.MIDDLE);
        customLabel.setDefaultSize(14);
        customLabel.setDefaultColor(cc.color(249,186,156));
        customLabel.setDefaultFont(SceneMgr.FONT_BOLD);
        customLabel.setString(s1);
        this.lbPackage = customLabel;
        this.lbPackage.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.79);
        //this.lbPackage.setPosition(this.bg.getContentSize().width * 0.5, 200);

        this.iconPayment = this.getControl("iconPayment", this.bg);
        this.enableFog();
        //  this.setInfo();
    },

    setInfo: function (offerData) {
        this.isShow = true;
        this.offerData = offerData;
        cc.log("OFER DATA GUIOffer ** " + JSON.stringify(this.offerData));
        for (var i = 0; i < this.arrayOfferImage.length; i++) {
            this.arrayOfferImage[i].setVisible(false);
        }
        var startY = this.bg.getContentSize().height * 0.17;
        this.arrayBonus = [];
        for (var i = 0; i < offerData.listBonus.length; i++) {
            var bonus = offerData.listBonus[i];
            if (bonus.type == OfferManager.TYPE_TIME && NewVipManager.getInstance().getRealVipLevel() <= 0){
                continue;
            }
            var offer = this.genOffer();
            offer.updateInfo(offerData.offerId, bonus.type, bonus.value, bonus.eventId);
            this.arrayBonus.push(offer);
            //offer.setPosition(this.bg.getContentSize().width * 0.3, startY - 20 * i);
        }
        var w = this.arrayBonus[0].getContentSize().width;
        var pad = 15;
        var sumW = w * this.arrayBonus.length + pad * (this.arrayBonus.length - 1);
        var startX = this.btnPayment.getPositionX() - sumW * 0.5;

        for (var i = 0; i < this.arrayBonus.length; i++) {
            this.arrayBonus[i].setPosition(startX + w * (0.5 + i) + pad * i, startY);
            this.arrayBonus[i].showEffect(i * 0.3);
        }
        //this.lbTitle.setString(offerManager.title);
        //this.lbPackage.setString(offerManager.description);
        var arrayS = offerData.description.split("@money");
        if (arrayS.length > 1) {
            var s = LocalizedString.to("FORMAT_DESCRIPTION_OFFER");
            s = StringUtility.replaceAll(s, "@string1", arrayS[0]);
            s = StringUtility.replaceAll(s, "@string2", arrayS[1]);
            s = StringUtility.replaceAll(s, "@money", StringUtility.pointNumber(offerData.valueOffer));
            this.lbPackage.setString(s);
        } else {
            this.lbPackage.setString(offerData.description);
        }

        this.updateButton();
    },

    updateButton: function () {
        var resource = this.offerData.getResourceTypePayment();
        cc.log("RESOURCE ** " + resource);
        this.iconType.setTexture(resource);
        this.lbPrice.setString(StringUtility.pointNumber(this.offerData.valueOffer) + " VND");
        this.iconType.setPositionX(this.iconType.getContentSize().width * 0.55);
    },

    genOffer: function () {
        var i = 0;
        for (i = 0; i < this.arrayOfferImage.length; i++) {
            if (!this.arrayOfferImage[i].isVisible()) {
                this.arrayOfferImage[i].setVisible(true);
                return this.arrayOfferImage[i];
            }
        }
        var label = new GroupOfferBonus();
        this.arrayOfferImage.push(label);
        this.bg.addChild(label);
        return label;
    },

    update: function (dt) {
        //  offerManager.timeOffer = offerManager.timeOffer - dt;
        if (!offerManager.haveOneOfferById(this.offerData.offerId)) {
            this.onClose();
            return;
        }
        var offer = offerManager.getOfferByGroup(this.offerData.typeGroupOffer);
        var s = LocalizedString.to("OFFER_REMAIN_TIME_SHORT");
        s = StringUtility.replaceAll(s, "@time", StringUtility.getTimeString(offer.getTimeLeftInSecond()));
        this.lbTime.setString(s);

        //vipManager.currentTime = vipManager.currentTime - dt;
        //this.lbRemain.setString(StringUtility.secondToTimeFormat(vipManager.currentTime, [1, 1, 1, 1]));

    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true);
        this.scheduleUpdate();


    },

    onBack: function () {
        this.isShow = false;
    },

    onButtonRelease: function (button, id) {
        popUpManager.removePopUp(PopUpManager.OFFER);
        switch (id) {
            case GUIOffer.BTN_CLOSE: {

                this.onClose();
                break;
            }
            case GUIOffer.BTN_BUY: {
                this.onClose();
                OfferManager.buyOffer(false, this.offerData.offerId);
            }
        }

        popUpManager.removePopUp(PopUpManager.OFFER);
    }
});
GUIOffer.BTN_BUY = 0;
GUIOffer.BTN_CLOSE = 1;
GUIOffer.BTN_INFO = 2;
GUIOffer.tag = 102;
GUIOffer.className = "GUIOffer";

var GroupOfferBonus = cc.Node.extend({
    ctor: function () {
        this._super();
        this.setAnchorPoint(cc.p(0, 0));
        this.setCascadeOpacityEnabled(true);

        this.iconEffect = new cc.Sprite("res/Lobby/Offer/bgFold.png");
        this.addChild(this.iconEffect);
        this.iconEffect.setPosition(0, 0);
        this.iconEffect.setPositionY(this.iconEffect.getContentSize().height * 0.5);

        this.bg = new cc.Sprite("res/Lobby/Offer/itemBg.png");
        this.addChild(this.bg);
        this.bg.setPosition(0, 0);
        this.bg.setPositionX(0);
        this.bg.setPositionY(this.bg.getContentSize().height * 0.5);

        this.icon = new cc.Sprite("res/Lobby/Offer/bonusGold.png");
        this.bg.addChild(this.icon);
        this.icon.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.57);

        this.labelDescrible = BaseLayer.createLabelText("fkdsjl fjsdj fsld kjfd kf sdfd ssds lfj", cc.color(237,161,130, 255));
        this.labelDescrible.setFontName(SceneMgr.FONT_NORMAL);
        this.labelDescrible.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.labelDescrible.setAnchorPoint(cc.p(0.5, 0.5));
        this.labelDescrible.setFontSize(13);
        this.labelDescrible.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.7);
        this.labelDescrible.setContentSize(cc.size(this.bg.getContentSize().width * 0.9, 80));
        this.labelDescrible.ignoreContentAdaptWithSize(false);
        this.labelDescrible.setSkewX(10);
        // this.labelDescrible.setSkewY(50);
        this.bg.addChild(this.labelDescrible);

        this.labelValue = BaseLayer.createLabelText("1000000", cc.color(167,97,37, 255));
        this.labelValue.setFontName(SceneMgr.FONT_BOLD);
        this.labelValue.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.labelValue.setAnchorPoint(cc.p(0.5, 0.5));
        this.labelValue.setFontSize(20);
        this.labelValue.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.22);
        this.bg.addChild(this.labelValue);

        this.labelOldValue = BaseLayer.createLabelText("1000000", cc.color(199,170,126, 255));
        this.labelOldValue.setFontName(SceneMgr.FONT_BOLD);
        this.labelOldValue.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.labelOldValue.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.labelOldValue.setAnchorPoint(cc.p(0.5, 0.5));
        this.labelOldValue.setFontSize(20);
        this.labelOldValue.setPosition(this.bg.getContentSize().width * 0.5, this.labelValue.getPositionY() - 25);
        this.bg.addChild(this.labelOldValue);

        this.textLine = new cc.Sprite("res/Lobby/Offer/text_line.png");
        this.bg.addChild(this.textLine);
        this.textLine.setPosition(this.bg.getContentSize().width * 0.5, this.labelOldValue.getPositionY());
        this.textLine.setOpacity(50);

        this.bgSale = new cc.Sprite("res/Lobby/Offer/bgSale.png");
        this.bg.addChild(this.bgSale);
        this.bgSale.setPosition(this.bg.getContentSize().width * 1.0 - this.bgSale.getContentSize().width * 0.45,
            this.bg.getContentSize().height - this.bgSale.getContentSize().height * 0.45);

        this.labelSale = BaseLayer.createLabelText("Vang", cc.color(248,255,169));
        this.labelSale.setFontName(SceneMgr.FONT_BOLD);
        this.labelSale.setString("100%");
        this.labelSale.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.labelSale.setAnchorPoint(cc.p(0.5, 0.5));
        this.labelSale.setFontSize(16);
        this.labelSale.setPosition(this.bgSale.getContentSize().width * 0.55, this.bgSale.getContentSize().height * 0.65);
        this.bgSale.addChild(this.labelSale);
        this.labelSale.setColor(cc.color(254, 245, 209, 255));

        this.setContentSize(this.icon.getContentSize());
    },

    showEffect: function (delayTime) {
        this.stopAllActions();
        this.bg.setVisible(false);
        this.iconEffect.setOpacity(255);
        this.iconEffect.setScale(1.0);
        this.pos = this.getPositionY();
        this.setPositionY(this.getPositionY() + 400);
        this.runAction(cc.sequence(cc.delayTime(delayTime), cc.moveTo(0.1, this.getPositionX(), this.pos), cc.delayTime(0.2), cc.callFunc(this.callbackShowEffect.bind(this))));
        this.runAction(cc.sequence(cc.delayTime(delayTime+ 0.1), cc.scaleTo(0.2, 1.0, 0.8), new cc.EaseBackOut(cc.scaleTo(0.4, 1.0, 1.0))));
    },

    callbackShowEffect: function () {
        if (cc.sys.isNative) {
            var orbitCamera1 = cc.orbitCamera(0.0, 1, 0, -180, 0, 0, 0);
            var orbitCamera2 = cc.orbitCamera(0.2, 1, 0, -180, 90, 0, 0);
            this.runAction(cc.sequence(orbitCamera1, orbitCamera2, cc.callFunc(this.callbackShowEffect1.bind(this))));
        }
        else{
            this.setScaleX(1);
            this.runAction(cc.sequence(cc.scaleTo(0.2, 0, 1), cc.callFunc(this.callbackShowEffect1.bind(this))));
        }
    },

    callbackShowEffect1: function () {
        this.iconEffect.runAction(cc.spawn(cc.fadeOut(0.5), cc.scaleTo(0.5, 2)));
        this.bg.setVisible(true);
        if (cc.sys.isNative){
            this.runAction(cc.orbitCamera(0.2, 1, 0, -90, 90, 0, 0));
        }
        else{
            this.runAction(cc.scaleTo(0.2, 1));
        }
    },

    updateInfo: function (offerId, type, value, eventId) {
        this.bgSale.setVisible(true);
        this.labelOldValue.setVisible(true);
        this.textLine.setVisible(true);
        var offer = offerManager.getOfferById(offerId);
        this.labelDescrible.setVisible(false);
        switch (type) {
            case OfferManager.TYPE_GOLD:
                this.icon.setTexture("res/Lobby/Offer/bonusGold.png");
                this.labelValue.setString(StringUtility.pointNumber(value) + " Gold");
                var percent = offerManager.getPercentSale(offerId, type, value);
                if (percent <= 0) {
                    this.bgSale.setVisible(false);
                    this.labelOldValue.setVisible(false);
                    this.textLine.setVisible(false);
                }
                else {
                    this.labelSale.setString("+" + percent + "%");
                    this.labelOldValue.setString(StringUtility.pointNumber(offer.configOffer["gold"]) + " Gold");
                }
                break;
            case OfferManager.TYPE_G_STAR:
                this.icon.setTexture("res/Lobby/Offer/bonusGStar.png");
                this.labelValue.setString(StringUtility.pointNumber(value) + " VPoint");
                var percent = offerManager.getPercentSale(offerId, type, value);
                if (percent <= 0) {
                    this.bgSale.setVisible(false);
                    this.labelOldValue.setVisible(false);
                    this.textLine.setVisible(false);
                }
                else {
                    this.labelSale.setString("+" + percent + "%");
                    this.labelOldValue.setString(StringUtility.pointNumber(offer.configOffer["vPoint"]) + " VPoint");
                }
                break;
            case OfferManager.TYPE_TIME:
                this.icon.setTexture("res/Lobby/Offer/bonusTime.png");
                var s = StringUtility.replaceAll(localized("VIP_FORMAT_HOURS"), "@hour", StringUtility.pointNumber(value));
                s = s + " VIP";
                this.labelValue.setString(s);
                var percent = offerManager.getPercentSale(offerId, type, value);
                if (percent <= 0) {
                    this.bgSale.setVisible(false);
                    this.labelOldValue.setVisible(false);
                    this.textLine.setVisible(false);
                }
                else {
                    this.labelSale.setString("+" + percent + "%");
                    var s = StringUtility.replaceAll(localized("VIP_FORMAT_HOURS"), "@hour", offer.configOffer["hourBonus"]);
                    s = s + " VIP";
                    this.labelOldValue.setString(s);
                }
                this.labelDescrible.setVisible(true);
                this.labelDescrible.setString(localized("OFFER_BONUS_TIME_DES"));
                break;
            case OfferManager.TYPE_TICKET:
                this.icon.setTexture(event.getOfferTicketImage(eventId));
                this.labelValue.setString(StringUtility.pointNumber(value) + event.getOfferTicketString(eventId));
                var percent = offerManager.getPercentSale(offerId, type, value, eventId);

                if (percent <= 0) {
                    this.bgSale.setVisible(false);
                    this.labelOldValue.setVisible(false);
                    this.textLine.setVisible(false);
                }
                else {
                    this.labelSale.setString("+" + percent + "%");
                    var config = event.getEventTicketConfig(offer.convertOfferPayment(), eventId);
                    var value = config[offer.valueOffer];
                    this.labelOldValue.setString(StringUtility.pointNumber(value) + event.getOfferTicketString(eventId));
                }
                this.labelDescrible.setVisible(true);
                this.labelDescrible.setString(localized("OFFER_BONUS_EVENT_DES"));
                break;
            case OfferManager.TYPE_DIAMOND:
                this.icon.setTexture("res/Lobby/Offer/bonusDiamond.png");
                this.labelValue.setString(StringUtility.pointNumber(value) + " Kim cương");
                this.bgSale.setVisible(false);
                this.labelOldValue.setVisible(false);
                this.textLine.setVisible(false);
                break;
        }
        this.textLine.setScaleX(this.labelOldValue.getContentSize().width / this.textLine.getContentSize().width);
    }
});