/**
 * Created by CPU02314_LOCAL on 12/17/2019.
 */

var OfferButton = cc.Node.extend({
    ctor: function () {
        this._super();
        this.btn = new ccui.Button("Offer/iconOfferNormal.png");
        this.addChild(this.btn);
        this.btn.setPositionY(this.btn.getContentSize().height * 0.3);
        this.btn.addClickEventListener(this.touchEvent.bind(this));

        this.lbTime = new ccui.Text();
        this.addChild(this.lbTime);
        this.lbTime.setFontName(SceneMgr.FONT_BOLD);
        this.lbTime.setString("lfjsdfsd");
        this.lbTime.setPosition(0, -this.btn.getContentSize().height * 0.35);
        //this.lbTime.setColor(cc.color(247,233,187));
        //this.lbTime.enableOutline(cc.color(131,73,52), 1);

        this.lbTime.setFontSize(13);

        this.setContentSize(this.btn.getContentSize().width, this.btn.getContentSize().height * 1.4);
    },

    touchEvent: function () {
        if (offerManager.haveOneOfferById(this.offerData.offerId)) {
            offerManager.showOfferGUI(true, this.offerData);
        } else {
            ToastFloat.makeToast(ToastFloat.SHORT, LocalizedString.to("NO_OFFER"));
        }

    },

    setInfo: function (offer) {
        this.offerData = offer;
        this.setVisible(true);
        if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_NORMAL) {
            this.btn.loadTextures("Offer/iconOfferNormal.png", "Offer/iconOfferNormal.png", "Offer/iconOfferNormal.png");
            this.btn.setPositionX(0);
        }
        else if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_ZALO) {
            if (offer.isFirstPay) {
                this.btn.loadTextures("Offer/iconZaloFirstPay.png", "Offer/iconZaloFirstPay.png", "Offer/iconZaloFirstPay.png");
                this.btn.setPositionX(this.btn.getContentSize().width * 0.15);
            }
            else {
                this.btn.loadTextures("Offer/iconZaloRepay.png", "Offer/iconZaloRepay.png", "Offer/iconZaloRepay.png");
                this.btn.setPositionX(this.btn.getContentSize().width * 0.15);
            }
        }
        else if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_NO_FIX_PRICE) {
            this.btn.loadTextures("Offer/iconSuperOffer.png", "Offer/iconSuperOffer.png", "Offer/iconSuperOffer.png");
            this.btn.setPositionX(this.btn.getContentSize().width * 0.0);
        }
        else {
            if (offer.isFirstPay) {
                this.btn.loadTextures("Offer/iconFirstPay.png", "Offer/iconFirstPay.png", "Offer/iconFirstPay.png");
                this.btn.setPositionX(this.btn.getContentSize().width * 0.0);
            }
            else {
                this.btn.loadTextures("Offer/iconRepay.png", "Offer/iconRepay.png", "Offer/iconRepay.png");
                this.btn.setPositionX(this.btn.getContentSize().width * 0.0);
            }
        }
    },

    updateOffer: function () {
        if (this.isVisible()) {
            this.lbTime.setString(StringUtility.getTimeString(this.offerData.getTimeLeftInSecond()));
        }
    }
});

var GroupOfferButton = cc.Class.extend({
    ctor: function () {
        this.resetData();
    },

    resetData: function () {
        this.arrayButton = [];
    },

    addButton: function (offerData) {
        var btn = LobbyButtonManager.getInstance().getButton(offerData.offerId, LobbyButtonManager.TYPE_OFFER);
        if (!btn) {
            cc.log("ADD OFFER BUTTON ***** ");
            btn = new OfferButton();
            btn.retain();
            btn.setVisible(true);
            LobbyButtonManager.getInstance().addButton(btn, offerData.offerId, LobbyButtonManager.TYPE_OFFER);
        }
        this.arrayButton.push(btn);
        btn.setInfo(offerData);
    },

    updateOffer: function () {

        for (var i = 0; i < this.arrayButton.length; i++) {
            this.arrayButton[i].updateOffer();
        }
        for (var i = 0; i < this.arrayButton.length; i++) {
            if (this.arrayButton[i].isVisible()) {
                var haveOffer = offerManager.haveOneOfferById(this.arrayButton[i].offerData.offerId);
                if (!haveOffer) {
                    this.arrayButton[i].setVisible(false);
                    cc.log("REMOVE BUTTON OFFER IN UPDATE")
                    this.arrayButton.splice(i, 1);
                    i = -1;
                }
            }
        }
    }
});

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

GroupOfferBonus =  cc.Node.extend({
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

var GUIOfferZaloFirstPay = BaseLayer.extend({
    ctor: function () {
        this._super(GUIOfferZaloFirstPay.className);
        this.initWithBinaryFile("GUIOfferZaloFirstPay.json");
    },

    initGUI: function () {
        this.arrayOffer = [];
        this.bg = this.getControl("bg");
        this.btnBuy = this.getControl("btnBuy", this.bg);
        this.btnPayment = this.customButton("btn", GUIOffer.BTN_BUY, this.btnBuy);
        this.iconPayment = this.getControl("iconPayment", this.btnBuy);
        this.customButton("btnClose", GUIOffer.BTN_CLOSE);
        this.lbTime = this.getControl("lbTime", this.bg);
        this.lbTime.ignoreContentAdaptWithSize(true);

        this.lbOldPrice = this.getControl("lbOldPrice", this.btnBuy);
        this.lbOldPrice.ignoreContentAdaptWithSize(true);
        this.lbNewPrice = this.getControl("lbNewPrice", this.btnBuy);
        this.lbNewPrice.ignoreContentAdaptWithSize(true);
        this.line = this.getControl("line", this.btnBuy);
        this.lbPromo = this.getControl("lbPromo", this.bg);
        //this.lbPromo.ignoreContentAdaptWithSize(true);

        this.pItem = this.getControl("pItem", this.bg);
        // this.title = this.getControl("title", this.bg);
        // this.title.pos = this.title.getPosition();
        this.pEff = this.getControl("pEff", this.bg);
        this.btnEff = this.getControl("eff", this.btnBuy);

        // co 2 panel duoc tao rieng cho 2 nhom Bonus: co 3 Bonus va 4 Bonus (bonus thu 4 la khong co dinh)
        this.group3 = this.getControl("group3", this.pItem);

        this.bonusGold3 = this.getControl("bonusGold", this.group3);
        this.lbGold3 = this.getControl("lbNum", this.bonusGold3);
        this.lbGold3.setString("lfksdjflksdjflkjsdlkf");

        this.bonusTime3 = this.getControl("bonusTime", this.group3);
        this.lbTimeBonus3 = this.getControl("lbNum", this.bonusTime3);

        this.bonusGStar3 = this.getControl("bonusGStar", this.group3);
        this.lbGStar3 = this.getControl("lbNum", this.bonusGStar3);

        this.group4 = this.getControl("group4", this.pItem);

        this.bonusGold4 = this.getControl("bonusGold", this.group4);
        this.lbGold4 = this.getControl("lbNum", this.bonusGold4);
        this.lbGold4.setString("lfksdjflksdjflkjsdlkf");

        this.bonusTime4 = this.getControl("bonusTime", this.group4);
        this.lbTimeBonus4 = this.getControl("lbNum", this.bonusTime4);

        this.bonusGStar4 = this.getControl("bonusGStar", this.group4);
        this.lbGStar4 = this.getControl("lbNum", this.bonusGStar4);

        this.bonusEmpty = this.getControl("bonusEmpty", this.group4);
        this.lbEmpty = this.getControl("lbNum", this.bonusEmpty);
        this.imgBonus = this.getControl("imgBonus", this.bonusEmpty);

        this.enableFog();

        // this.setInfo();
    },

    showEffect: function () {

    },

    setInfo: function (offerData) {
        // return;
        var resource = offerData.getResourceTypePayment();
        this.iconPayment.loadTexture(resource);
        this.isShow = true;
        this.offerData = offerData;
        cc.log("DATA OFFER GUIOfferZaloFirstPay " + JSON.stringify(offerData));
        var lbGold, lbGStar, lbTimeBonus, lbEmpty;
        if (offerData.listBonus.length == 3) {
            this.group3.setVisible(true);
            this.group4.setVisible(false);
            lbGold = this.lbGold3;
            lbGStar = this.lbGStar3;
            lbTimeBonus = this.lbTimeBonus3;
        }
        else {
            this.group3.setVisible(false);
            this.group4.setVisible(true);
            lbGold = this.lbGold4;
            lbGStar = this.lbGStar4;
            lbTimeBonus = this.lbTimeBonus4;
        }

        for (var i = 0; i < offerData.listBonus.length; i++) {
            var bonus = offerData.listBonus[i];
            switch (bonus["type"]) {
                case OfferManager.TYPE_GOLD:
                    lbGold.setString(StringUtility.formatNumberSymbol(bonus["value"]) + " Gold");
                    break;
                case OfferManager.TYPE_G_STAR:
                    lbGStar.setString(StringUtility.formatNumberSymbol(bonus["value"]) + " VPoint");
                    break;
                case OfferManager.TYPE_TIME:
                    var s = StringUtility.replaceAll(localized("VIP_FORMAT_HOURS"), "@hour", StringUtility.pointNumber(bonus["value"])) + " VIP";
                    lbTimeBonus.setString(s);
                    break;
                case OfferManager.TYPE_TICKET:
                    this.imgBonus.loadTexture(event.getOfferTicketImage(bonus["eventId"]));
                    this.imgBonus.ignoreContentAdaptWithSize(true);
                    s = StringUtility.pointNumber(bonus["value"]) + " " + event.getOfferTicketString(bonus["eventId"]);
                    this.lbEmpty.setString(s);
                    break;
                case OfferManager.TYPE_DIAMOND:
                    this.imgBonus.ignoreContentAdaptWithSize(true);
                    this.imgBonus.loadTexture("res/Lobby/Offer/bonusDiamond.png");
                    this.lbEmpty.setString(StringUtility.pointNumber(bonus["value"]) + localized("OFFER_DIAMOND"));
                    break;
            }
        }
        this.lbPromo.setString(offerData.description);
        this.showEffect();
        this.updateButton();
        this.startEffect();
    },

    updateButton: function () {
        if (this.btnEff.eff) {
            this.btnEff.eff.gotoAndPlay("1", -1, -1, 0);
        } else {
            var anim = db.DBCCFactory.getInstance().buildArmatureNode("BT_5K");
            this.btnEff.addChild(anim);
            this.btnEff.eff = anim;
            anim.gotoAndPlay("1", -1, -1, 0);
            anim.setPosition(this.btnEff.getContentSize().width / 2, this.btnEff.getContentSize().height / 2);
        }

        var str = LocalizedString.to("ZALOPAY_OFFER_PRICE");
        str = StringUtility.replaceAll(str, "@price", StringUtility.pointNumber(this.offerData.valueOffer));
        this.lbOldPrice.setString(str);
        this.line.setScaleX((this.lbOldPrice.getContentSize().width - 60) / this.line.getContentSize().width);
        this.lbNewPrice.setString(StringUtility.pointNumber(this.offerData.realValue) + " vnđ");

        var s = LocalizedString.to("OFFER_REMAIN_TIME");
        s = StringUtility.replaceAll(s, "@time", StringUtility.getTimeString(this.offerData.getTimeLeftInSecond()));
        this.lbTime.setString(s);
        this.lbTime.setPositionX(this.btnBuy.getPosition().x - this.lbTime.getContentSize().width / 2);
    },

    startEffect: function () {
        this.pEff.removeAllChildren();
        for (var i = 0; i < 2; i++) {
            var dc1 = new cc.Sprite("Lobby/Offer/deco1.png");
            this.pEff.addChild(dc1);
            dc1.setOpacity(0);
            var pEffWidth = this.pEff.getBoundingBox().width;
            var pEffHeight = this.pEff.getBoundingBox().height;
            var tmpPosX1 = (Math.random() * pEffWidth);
            var tmpPosY = this.pEff.getBoundingBox().height;
            var delayTime1 = Math.random() * 4;
            var time = 2;
            dc1.runAction(
                cc.sequence(
                    cc.callFunc(function () {
                        var tmpPosX1 = (Math.random() * pEffWidth + pEffWidth / 4);
                        this.setPosition(cc.p(tmpPosX1, tmpPosY));
                    }.bind(dc1)),
                    cc.delayTime(delayTime1),
                    cc.fadeIn(0),
                    cc.spawn(
                        cc.fadeOut(time),
                        cc.moveTo(time, tmpPosX1, tmpPosY - pEffHeight)
                    )
                ).repeatForever()
            );

            var dc2 = new cc.Sprite("Lobby/Offer/deco2.png");
            this.pEff.addChild(dc2);
            dc2.setOpacity(0);
            var tmpPosX2 = (Math.random() * pEffWidth);
            var delayTime2 = Math.random() * 4;
            dc2.runAction(
                cc.sequence(
                    cc.callFunc(function () {
                        var tmpPosX2 = (Math.random() * pEffWidth + pEffWidth / 4);
                        this.setPosition(cc.p(tmpPosX2, tmpPosY));
                    }.bind(dc2)),
                    cc.delayTime(delayTime2),
                    cc.fadeIn(0),
                    cc.spawn(
                        cc.fadeOut(time),
                        cc.moveTo(time, tmpPosX2, tmpPosY - pEffHeight)
                    )
                ).repeatForever()
            );
        }
    },

    update: function (dt) {
        //  offerManager.timeOffer = offerManager.timeOffer - dt;
        if (!offerManager.haveOneOfferById(this.offerData.offerId)) {
            this.onClose();
            return;
        }
        var s = LocalizedString.to("OFFER_REMAIN_TIME");
        s = StringUtility.replaceAll(s, "@time", StringUtility.getTimeString(this.offerData.getTimeLeftInSecond()));
        this.lbTime.setString(s);

        //vipManager.currentTime = vipManager.currentTime - dt;
        //this.lbRemain.setString(StringUtility.secondToTimeFormat(vipManager.currentTime, [1, 1, 1, 1]));
    },

    showEffect: function () {
        if (!this.offerData)
            return;
        this.bonusGold3.stopAllActions();
        this.bonusTime3.stopAllActions();
        this.bonusGStar3.stopAllActions();
        this.bonusGold3.setScale(0);
        this.bonusTime3.setScale(0);
        this.bonusGStar3.setScale(0);

        this.bonusGold4.stopAllActions();
        this.bonusTime4.stopAllActions();
        this.bonusGStar4.stopAllActions();
        this.bonusEmpty.stopAllActions();
        this.bonusGold4.setScale(0);
        this.bonusTime4.setScale(0);
        this.bonusGStar4.setScale(0);
        this.bonusEmpty.setScale(0);

        if(this.offerData.listBonus.length == 3) {
            this.bonusGold3.runAction(cc.sequence(cc.delayTime(0.1), new cc.EaseBackOut(cc.scaleTo(0.5,1.0))));
            this.bonusGStar3.runAction(cc.sequence(cc.delayTime(0.3), new cc.EaseBackOut(cc.scaleTo(0.5,1.0))));
            this.bonusTime3.runAction(cc.sequence(cc.delayTime(0.6), new cc.EaseBackOut(cc.scaleTo(0.5,1.0))));
        }
        else {
            this.bonusGold4.runAction(cc.sequence(cc.delayTime(0.1), new cc.EaseBackOut(cc.scaleTo(0.5,0.8))));
            this.bonusGStar4.runAction(cc.sequence(cc.delayTime(0.2), new cc.EaseBackOut(cc.scaleTo(0.5,0.8))));
            this.bonusTime4.runAction(cc.sequence(cc.delayTime(0.4), new cc.EaseBackOut(cc.scaleTo(0.5,0.8))));
            this.bonusEmpty.runAction(cc.sequence(cc.delayTime(0.6), new cc.EaseBackOut(cc.scaleTo(0.5,0.8))));
        }
    },

    onEnterFinish: function () {
        this.showEffect();
        this.setShowHideAnimate(this.bg, true);
        this.scheduleUpdate();
    },

    onBack: function () {
        this.isShow = false;
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case GUIOffer.BTN_CLOSE: {
                popUpManager.removePopUp(PopUpManager.OFFER);
                this.onClose();
                break;
            }
            case GUIOffer.BTN_BUY: {
                this.onClose();
                OfferManager.buyOffer(false, this.offerData.offerId);
            }
        }

        popUpManager.removePopUp(PopUpManager.OFFER_ZALO);
    }
});
GUIOfferZaloFirstPay.className = "GUIOfferZaloFirstPay";
GUIOfferZaloFirstPay.tag = 103;

var GUIOfferZaloRepay = BaseLayer.extend({
    ctor: function () {
        this._super(GUIOfferZaloRepay.className);
        this.initWithBinaryFile("GUIOfferZaloRepay.json");
    },

    initGUI: function () {
        this.arrayOffer = [];
        this.bg = this.getControl("bg");
        this.btnBuy = this.getControl("btnBuy", this.bg);
        this.btnPayment = this.customButton("btn", GUIOffer.BTN_BUY, this.btnBuy);
        this.customButton("btnClose", GUIOffer.BTN_CLOSE);
        this.lbTime = this.getControl("lbTime", this.bg);
        this.lbTime.ignoreContentAdaptWithSize(true);

        this.lbOldPrice = this.getControl("lbOldPrice", this.btnBuy);
        this.lbOldPrice.ignoreContentAdaptWithSize(true);
        this.lbNewPrice = this.getControl("lbNewPrice", this.btnBuy);
        this.lbNewPrice.ignoreContentAdaptWithSize(true);
        this.line = this.getControl("line", this.btnBuy);
        this.lbPromo = this.getControl("lbPromo", this.bg);
        this.lbNum = this.getControl("lbNum", this.bg);
        this.lbNum.setVisible(false);
        //this.lbPromo.ignoreContentAdaptWithSize(true);

        this.pItem = this.getControl("pItem", this.bg);
        // this.title = this.getControl("title", this.bg);
        // this.title.pos = this.title.getPosition();
        this.pEff = this.getControl("pEff", this.bg);
        this.btnEff = this.getControl("eff", this.btnBuy);

        this.lbGold = this.getControl("lbGold", this.bg);

        this.lbTimeBonus = this.getControl("lbTimeBonus", this.bg);

        this.lbGStar = this.getControl("lbGStar", this.bg);

        this.decoLeft = this.getControl("decoLeft", this._layout);
        this.decoRight = this.getControl("decoRight", this._layout);
        this.decoLeft.pos = this.decoLeft.getPosition();
        this.decoRight.pos = this.decoRight.getPosition();
        // var programGl = cc.GLProgram.createWithFilenames("res/blurEffect.vsh", "res/blurEffect.fsh");
        // var programState = cc.GLProgramState.getOrCreateWithGLProgram(programGl);
        // this.decoLeft.getVirtualRenderer().setGLProgramState(programState);
        // this.decoRight.getVirtualRenderer().setGLProgramState(programState);

        //this.decoLeft.runAction(cc.waves( 2.0, cc.size(16,12), 4, 20, true, true));
        //sprite.setPosition(300, 300);


        this.effect = db.DBCCFactory.getInstance().buildArmatureNode("LightBg");
        this.addChild(this.effect);
        this.effect.getAnimation().gotoAndPlay("1", -1, -1, -1);
        this.effect.setPosition(cc.winSize.width * 0.75, cc.winSize.height * 0.6);
        this.effect.setRotation(20);
        this.enableFog();

        // this.setInfo();
    },

    setInfo: function (offerData) {
        this.isShow = true;
        this.offerData = offerData;
        this.pItem.removeAllChildren();
        this.arrayOffer = [];
        this.arrayBonus = [];
        for (var i = 0; i < offerData.listBonus.length; i++) {
            cc.log("TYPE BONUS *** " + offerData.listBonus[i]["type"]);
            switch (offerData.listBonus[i]["type"]) {
                case OfferManager.TYPE_GOLD:
                    this.lbGold.setString(StringUtility.formatNumberSymbol(offerData.listBonus[i]["value"]) + " Gold");
                    break;
                case OfferManager.TYPE_G_STAR:
                    this.lbGStar.setString(StringUtility.formatNumberSymbol(offerData.listBonus[i]["value"]) + " VPonit");
                    break;
                case OfferManager.TYPE_TIME:

                    var s = StringUtility.replaceAll(localized("VIP_FORMAT_HOURS"), "@hour", StringUtility.pointNumber(offerData.listBonus[i]["value"])) + " VIP";
                    this.lbTimeBonus.setString(s);
                    cc.log("VAO DAY NE ************** " + s);
                    break;
            }
        }

        this.lbPromo.setString(offerData.description);
        var s = localized("OFFER_NUM_BUY_REMAIN") + offerData.remainBuy + "/" + offerData.maxBuy;
        this.lbNum.setString(s);
        this.updateButton();
        this.startEffect();

    },

    updateButton: function () {
        var offer = offerManager.getOfferById(this.offerData.offerId);
        if (this.btnEff.eff) {
            this.btnEff.eff.gotoAndPlay("1", -1, -1, 0);
        } else {
            var anim = db.DBCCFactory.getInstance().buildArmatureNode("BT_5K");
            this.btnEff.addChild(anim);
            this.btnEff.eff = anim;
            anim.gotoAndPlay("1", -1, -1, 0);
            anim.setPosition(this.btnEff.getContentSize().width / 2, this.btnEff.getContentSize().height / 2);
        }

        var str = LocalizedString.to("ZALOPAY_OFFER_PRICE");
        str = StringUtility.replaceAll(str, "@price", StringUtility.pointNumber(this.offerData.valueOffer));
        this.lbOldPrice.setString(str);
        this.line.setScaleX((this.lbOldPrice.getContentSize().width - 60) / this.line.getContentSize().width);
        this.lbNewPrice.setString(StringUtility.pointNumber(this.offerData.realValue) + " vnđ");

        var s = LocalizedString.to("OFFER_REMAIN_TIME");
        s = StringUtility.replaceAll(s, "@time", StringUtility.getTimeString(this.offerData.getTimeLeftInSecond()));
        this.lbTime.setString(s);
        this.lbTime.setPositionX(this.btnBuy.getPosition().x - this.lbTime.getContentSize().width / 2);
    },

    startEffect: function () {
        this.pEff.removeAllChildren();
        for (var i = 0; i < 2; i++) {
            var dc1 = new cc.Sprite("Lobby/Offer/deco1.png");
            this.pEff.addChild(dc1);
            dc1.setOpacity(0);
            var pEffWidth = this.pEff.getBoundingBox().width;
            var pEffHeight = this.pEff.getBoundingBox().height;
            var tmpPosX1 = (Math.random() * pEffWidth);
            var tmpPosY = this.pEff.getBoundingBox().height;
            var delayTime1 = Math.random() * 4;
            var time = 2;
            dc1.runAction(
                cc.sequence(
                    cc.callFunc(function () {
                        var tmpPosX1 = (Math.random() * pEffWidth + pEffWidth / 4);
                        this.setPosition(cc.p(tmpPosX1, tmpPosY));
                    }.bind(dc1)),
                    cc.delayTime(delayTime1),
                    cc.fadeIn(0),
                    cc.spawn(
                        cc.fadeOut(time),
                        cc.moveTo(time, tmpPosX1, tmpPosY - pEffHeight)
                    )
                ).repeatForever()
            );

            var dc2 = new cc.Sprite("Lobby/Offer/deco2.png");
            this.pEff.addChild(dc2);
            dc2.setOpacity(0);
            var tmpPosX2 = (Math.random() * pEffWidth);
            var delayTime2 = Math.random() * 4;
            dc2.runAction(
                cc.sequence(
                    cc.callFunc(function () {
                        var tmpPosX2 = (Math.random() * pEffWidth + pEffWidth / 4);
                        this.setPosition(cc.p(tmpPosX2, tmpPosY));
                    }.bind(dc2)),
                    cc.delayTime(delayTime2),
                    cc.fadeIn(0),
                    cc.spawn(
                        cc.fadeOut(time),
                        cc.moveTo(time, tmpPosX2, tmpPosY - pEffHeight)
                    )
                ).repeatForever()
            );
        }
    },

    update: function (dt) {
        //  offerManager.timeOffer = offerManager.timeOffer - dt;
        // var offer = offerManager.getOfferById(this.offerData.offerId);
        if (!offerManager.haveOneOfferById(this.offerData.offerId)) {
            this.onClose();
            return;
        }
        var s = LocalizedString.to("OFFER_REMAIN_TIME");
        s = StringUtility.replaceAll(s, "@time", StringUtility.getTimeString(this.offerData.getTimeLeftInSecond()));
        this.lbTime.setString(s);

        //vipManager.currentTime = vipManager.currentTime - dt;
        //this.lbRemain.setString(StringUtility.secondToTimeFormat(vipManager.currentTime, [1, 1, 1, 1]));

    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true);
        this.scheduleUpdate();
        this.decoLeft.setOpacity(0);
        this.decoRight.setOpacity(0);
        this.decoLeft.stopAllActions();
        this.decoRight.stopAllActions();
        // this.decoLeft.setPosition(this.decoLeft.pos.x - 100, this.decoLeft.pos.y + 100);
        // this.decoRight.setPosition(this.decoRight.pos.x - 100, this.decoRight.pos.y + 100);
        this.decoLeft.runAction(cc.spawn(cc.fadeIn(0.5), new cc.EaseSineOut(cc.moveTo(0.5, this.decoLeft.pos))));
        this.decoRight.runAction(cc.spawn(cc.fadeIn(0.5), new cc.EaseSineOut(cc.moveTo(0.5, this.decoRight.pos))));
    },

    onBack: function () {
        this.isShow = false;
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case GUIOffer.BTN_CLOSE: {
                popUpManager.removePopUp(PopUpManager.OFFER);
                this.onClose();
                //var text = new cc.RenderTexture(cc.winSize.width, cc.winSize.height, cc.Texture2D.PIXEL_FORMAT_RGBA8888, 0x88F0);
                //text.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
                //text.begin();
                //sceneMgr.getRunningScene().visit();
                //text.end();
                ////this.bg.addChild(text);
                //
                //var gui = sceneMgr.openGUI(GUIShareFace.className, GUIShareFace.tag, GUIShareFace.tag);
                //gui.addImage(text);
                break;
            }
            case GUIOffer.BTN_BUY: {
                this.onClose();
                OfferManager.buyOffer(false, this.offerData.offerId);
            }
        }

        popUpManager.removePopUp(PopUpManager.OFFER_ZALO);
    }
});
GUIOfferZaloRepay.className = "GUIOfferZaloRepay";
GUIOfferZaloFirstPay.tag = 104;

var GUIOfferRepay = BaseLayer.extend({
    ctor: function () {
        this._super(GUIOfferRepay.className);
        this.initWithBinaryFile("GUIOfferRepay.json");
    },

    initGUI: function () {
        this.arrayOfferImage = [];
        this.bg = this.getControl("bg");
        this.decoLeft = this.getControl("decoLeft");
        this.decoRight = this.getControl("decoRight");
        this.btnBuy = this.getControl("btnBuy", this.bg);
        this.btnPayment = this.customButton("btn", GUIOffer.BTN_BUY, this.btnBuy);
        this.customButton("btnClose", GUIOffer.BTN_CLOSE);
        this.lbTime = this.getControl("lbTime", this.bg);
        this.lbTime.ignoreContentAdaptWithSize(true);

        this.lbOldPrice = this.getControl("lbOldPrice", this.btnBuy);
        this.lbOldPrice.ignoreContentAdaptWithSize(true);
        this.lbNewPrice = this.getControl("lbNewPrice", this.btnBuy);
        this.lbNewPrice.ignoreContentAdaptWithSize(true);
        this.line = this.getControl("line", this.btnBuy);
        //this.lbTitle = this.getControl("lbTitle", this.bg);

        // if (this.btnEff.eff) {
        //     this.btnEff.eff.gotoAndPlay("1", -1, -1, 0);
        // } else {
        this.eff = this.getControl("eff", this.btnBuy);
        var anim = db.DBCCFactory.getInstance().buildArmatureNode("BT_5K");
        this.eff.addChild(anim);

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
        this.lbPackage.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.85);
        //this.lbPackage.setPosition(this.bg.getContentSize().width * 0.5, 200);

        this.iconType = this.getControl("iconType", this.btnBuy);
        this.enableFog();
        //  this.setInfo();
    },

    setInfo: function (offerData) {
        this.isShow = true;
        this.offerData = offerData;
        cc.log("OFER DATA GUIOfferRepay ** " + JSON.stringify(this.offerData));
        for (var i = 0; i < this.arrayOfferImage.length; i++) {
            this.arrayOfferImage[i].setVisible(false);
        }
        var startY = this.bg.getContentSize().height * 0.17;
        this.arrayBonus = [];
        for (var i = 0; i < offerData.listBonus.length; i++) {
            var bonus = offerData.listBonus[i];
            // if (bonus.type == OfferManager.TYPE_TIME && NewVipManager.getInstance().getRealVipLevel() <= 0){
            //     continue;
            // }
            var offer = this.genOffer();
            offer.updateInfo(offerData.offerId, bonus.type, bonus.value, bonus.eventId, bonus.idType, bonus.subType, bonus.id);
            this.arrayBonus.push(offer);
            //offer.setPosition(this.bg.getContentSize().width * 0.3, startY - 20 * i);
        }
        var w = this.arrayBonus[0].getContentSize().width;
        var pad = 15;
        var sumW = w * this.arrayBonus.length + pad * (this.arrayBonus.length - 1);
        var startX = this.btnBuy.getPositionX() - sumW * 0.5;

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

        cc.log("RESOUR CE ** " + resource);
        this.iconType.loadTexture(resource);
        var str = LocalizedString.to("ZALOPAY_OFFER_PRICE");
        str = StringUtility.replaceAll(str, "@price", StringUtility.pointNumber(this.offerData.valueOffer));
        this.lbOldPrice.setString(str);
        this.line.setScaleX((this.lbOldPrice.getContentSize().width - 60) / this.line.getContentSize().width);
        this.lbNewPrice.setString(StringUtility.pointNumber(this.offerData.realValue) + " vnđ");

        var s = LocalizedString.to("OFFER_REMAIN_TIME");
        s = StringUtility.replaceAll(s, "@time", StringUtility.getTimeString(this.offerData.getTimeLeftInSecond()));
        this.lbTime.setString(s);
        // this.lbTime.setPositionX(this.btnBuy.getPosition().x - this.lbTime.getContentSize().width / 2);
    },

    genOffer: function () {
        var i = 0;
        for (i = 0; i < this.arrayOfferImage.length; i++) {
            if (!this.arrayOfferImage[i].isVisible()) {
                this.arrayOfferImage[i].setVisible(true);
                return this.arrayOfferImage[i];
            }
        }
        var label = new GroupOfferRepayBonus();
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

    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true);
        this.decoLeft.setScale(0);
        this.decoRight.setScale(0);
        this.decoLeft.runAction(new cc.EaseBackOut(cc.scaleTo(0.5, 1.0)));
        this.decoRight.runAction(new cc.EaseBackOut(cc.scaleTo(0.5, 1.0)));
        this.scheduleUpdate();
    },

    onBack: function () {
        this.isShow = false;
    },

    onButtonRelease: function (button, id) {
        popUpManager.removePopUp(PopUpManager.OFFER_ZALO);
        switch (id) {
            case GUIOfferRepay.BTN_CLOSE: {
                this.onClose();
                break;
            }
            case GUIOfferRepay.BTN_BUY: {
                this.onClose();
                OfferManager.buyOffer(false, this.offerData.offerId);
            }
        }
    }
});
GUIOfferRepay.BTN_BUY = 0;
GUIOfferRepay.BTN_CLOSE = 1;
GUIOfferRepay.BTN_INFO = 2;
GUIOfferRepay.tag = 102;
GUIOfferRepay.className = "GUIOfferRepay";

GroupOfferRepayBonus =  cc.Node.extend({
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

        this.labelDescrible = BaseLayer.createLabelText("fkdsjl fjsdj fsld kjfd kf sdfd ssds lfj", cc.color(223,251,249, 255));
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
        this.labelValue.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.12);
        this.bg.addChild(this.labelValue);
        this.labelValue.pos = this.labelValue.getPositionY();

        this.labelOldValue = BaseLayer.createLabelText("1000000", cc.color(199,170,126, 255));
        this.labelOldValue.setFontName(SceneMgr.FONT_BOLD);
        this.labelOldValue.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.labelOldValue.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.labelOldValue.setAnchorPoint(cc.p(0.5, 0.5));
        this.labelOldValue.setFontSize(20);
        this.labelOldValue.setPosition(this.bg.getContentSize().width * 0.5, this.labelValue.getPositionY() - 10);
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
        this.bg.setVisible(true);
        this.iconEffect.setOpacity(255);
        this.iconEffect.setScale(1.0);
        this.pos = this.getPositionY();
        this.setPositionY(this.getPositionY() + 400);
        this.runAction(cc.sequence(cc.delayTime(delayTime), cc.moveTo(0.1, this.getPositionX(), this.pos), cc.delayTime(0.2), cc.callFunc(this.callbackShowEffect.bind(this))));
        this.runAction(cc.sequence(cc.delayTime(delayTime+ 0.1), cc.scaleTo(0.2, 1.0, 0.8), new cc.EaseBackOut(cc.scaleTo(0.4, 1.0, 1.0))));
    },

    callbackShowEffect: function () {
        this.iconEffect.runAction(cc.spawn(cc.fadeOut(0.5), cc.scaleTo(0.5, 2.0)));
    },

    updateInfo: function (offerId, type, value, eventId, idType, subType, id) {
        this.bgSale.setVisible(true);
        this.labelOldValue.setVisible(true);
        this.textLine.setVisible(true);
        var offer = offerManager.getOfferById(offerId);
        this.labelDescrible.setVisible(false);
        switch (type) {
            case OfferManager.TYPE_GOLD:
                this.bg.setTexture("res/Lobby/Offer/bgBonusGold.png");
                this.icon.setVisible(false);
                this.labelValue.setString(StringUtility.pointNumber(value) + " Gold");
                var percent = offerManager.getPercentSale(offerId, type, value);
                cc.log("PERCENT LA **** " + percent);
                if (percent <= 0) {
                    this.bgSale.setVisible(false);
                    this.labelOldValue.setVisible(false);
                    this.textLine.setVisible(false);
                    this.labelValue.setPositionY(this.labelValue.pos);
                }
                else {
                    this.labelSale.setString("+" + percent + "%");
                    this.labelOldValue.setString(StringUtility.pointNumber(offer.configOffer["gold"]) + " Gold");
                    this.labelValue.setPositionY(this.labelValue.pos + 10);
                }
                break;
            case OfferManager.TYPE_G_STAR:
                this.bg.setTexture("res/Lobby/Offer/bgBonusVPoint.png");
                this.icon.setVisible(false);
                this.labelValue.setString(StringUtility.pointNumber(value) + " VPoint");
                var percent = offerManager.getPercentSale(offerId, type, value);
                if (percent <= 0) {
                    this.bgSale.setVisible(false);
                    this.labelOldValue.setVisible(false);
                    this.textLine.setVisible(false);
                    this.labelValue.setPositionY(this.labelValue.pos);
                }
                else {
                    this.labelSale.setString("+" + percent + "%");
                    this.labelOldValue.setString(StringUtility.pointNumber(offer.configOffer["vPoint"]) + " VPoint");
                    this.labelValue.setPositionY(this.labelValue.pos + 10);
                }
                break;
            case OfferManager.TYPE_TIME:
                this.bg.setTexture("res/Lobby/Offer/bgBonusTime.png");
                this.icon.setVisible(false);
                var s = StringUtility.replaceAll(localized("VIP_FORMAT_HOURS"), "@hour", StringUtility.pointNumber(value));
                s = s + " VIP";
                this.labelValue.setString(s);
                var percent = offerManager.getPercentSale(offerId, type, value);
                if (percent <= 0) {
                    this.bgSale.setVisible(false);
                    this.labelOldValue.setVisible(false);
                    this.textLine.setVisible(false);
                    this.labelValue.setPositionY(this.labelValue.pos);
                }
                else {
                    this.labelSale.setString("+" + percent + "%");
                    var s = StringUtility.replaceAll(localized("VIP_FORMAT_HOURS"), "@hour", offer.configOffer["hourBonus"]);
                    s = s + " VIP";
                    this.labelOldValue.setString(s);
                    this.labelValue.setPositionY(this.labelValue.pos + 10);
                }
                this.labelDescrible.setVisible(true);
                this.labelDescrible.setString(localized("OFFER_BONUS_TIME_DES"));
                break;
            case OfferManager.TYPE_TICKET:
                this.bg.setTexture("res/Lobby/Offer/bgBonusNormal.png");
                this.icon.setVisible(true);
                this.icon.setTexture(event.getOfferTicketImage(eventId));
                this.labelValue.setString(StringUtility.pointNumber(value) + event.getOfferTicketString(eventId));
                var percent = offerManager.getPercentSale(offerId, type, value, eventId);

                if (percent <= 0) {
                    this.bgSale.setVisible(false);
                    this.labelOldValue.setVisible(false);
                    this.textLine.setVisible(false);
                    this.labelValue.setPositionY(this.labelValue.pos);
                }
                else {
                    this.labelSale.setString("+" + percent + "%");
                    var config = event.getEventTicketConfig(offer.convertOfferPayment(), eventId);
                    var value = config[offer.valueOffer];
                    this.labelOldValue.setString(StringUtility.pointNumber(value) + event.getOfferTicketString(eventId));
                    this.labelValue.setPositionY(this.labelValue.pos + 10);
                }
                this.labelDescrible.setVisible(true);
                this.labelDescrible.setString(localized("OFFER_BONUS_EVENT_DES"));
                break;
            case OfferManager.TYPE_DIAMOND:
                this.bg.setTexture("res/Lobby/Offer/bgBonusNormal.png");
                this.icon.setVisible(true);
                this.icon.setTexture("res/Lobby/Offer/bonusDiamond.png");
                this.labelValue.setString(StringUtility.pointNumber(value) + " Kim cương");
                this.bgSale.setVisible(false);
                this.labelOldValue.setVisible(false);
                this.textLine.setVisible(false);
                break;
            case OfferManager.TYPE_ITEM:
                this.bg.setTexture("res/Lobby/Offer/bgBonusNormal.png");
                this.icon.setVisible(true);
                this.icon.setTexture(StorageManager.getItemIconPath(idType, subType, id));
                this.labelValue.setString(StringUtility.pointNumber(value) + localized("SHOP_GOLD_ITEM"));
                this.bgSale.setVisible(false);
                this.labelOldValue.setVisible(false);
                this.textLine.setVisible(false);
                break;
        }
        this.textLine.setScaleX(this.labelOldValue.getContentSize().width / this.textLine.getContentSize().width);
    }
});

var GUIOfferQuocKhanh = BaseLayer.extend({
    ctor: function () {
        this._super(GUIOfferQuocKhanh.className);
        this.initWithBinaryFile("GUIOfferQuocKhanh.json");
    },

    initGUI: function () {
        this.arrayOfferImage = [];
        this.bg = this.getControl("bg");
        this.btnBuy = this.getControl("btnBuy", this.bg);
        this.btnPayment = this.customButton("btn", GUIOffer.BTN_BUY, this.btnBuy);
        this.customButton("btnClose", GUIOffer.BTN_CLOSE);
        this.lbTime = this.getControl("lbTime", this.bg);
        this.lbTime.ignoreContentAdaptWithSize(true);
        this.panelFirework = this.getControl("panelFirework", this.bg);

        this.lbNewPrice = this.getControl("lbNewPrice", this.btnBuy);
        this.lbNewPrice.ignoreContentAdaptWithSize(true);
        this.eff = this.getControl("eff", this.btnBuy);
        var anim = db.DBCCFactory.getInstance().buildArmatureNode("BT_5K");
        this.eff.addChild(anim);
        anim.gotoAndPlay("1", -1, -1, 0);
        anim.setPosition(this.btnPayment.getContentSize().width / 2, this.btnPayment.getContentSize().height / 2);

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
        this.lbPackage.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.85);
        //this.lbPackage.setPosition(this.bg.getContentSize().width * 0.5, 200);

        this.iconType = this.getControl("iconType", this.btnBuy);
        this.enableFog();
        for (var i = 0; i < 5; i++) {
            this.playFireWork();
        }
    },

    playFireWork: function () {
        var random = Math.floor(Math.random() * 2.999 + 1);
        var fw = db.DBCCFactory.getInstance().buildArmatureNode("firework" + random);
        this.panelFirework.addChild(fw);
        fw.setPosition(this.panelFirework.getContentSize().width * Math.random(), this.panelFirework.getContentSize().height * Math.random());
        fw.getAnimation().gotoAndPlay("1", -1, -1, 1);
        fw.setCompleteListener(this.onFinishEffectFirework.bind(this, fw));
    },

    onFinishEffectFirework: function (fw) {
        fw.removeFromParent();
        this.playFireWork();
    },

    setInfo: function (offerData) {
        this.isShow = true;
        this.offerData = offerData;
        cc.log("OFER DATA GUIOfferRepay ** " + JSON.stringify(this.offerData));
        for (var i = 0; i < this.arrayOfferImage.length; i++) {
            this.arrayOfferImage[i].setVisible(false);
        }
        var startY = this.bg.getContentSize().height * 0.17;
        this.arrayBonus = [];
        for (var i = 0; i < offerData.listBonus.length; i++) {
            var bonus = offerData.listBonus[i];
            var offer = this.genOffer();
            offer.updateInfo(offerData.offerId, bonus.type, bonus.value, bonus.eventId);
            this.arrayBonus.push(offer);
            //offer.setPosition(this.bg.getContentSize().width * 0.3, startY - 20 * i);
        }
        var w = this.arrayBonus[0].getContentSize().width;
        var pad = 15;
        var sumW = w * this.arrayBonus.length + pad * (this.arrayBonus.length - 1);
        var startX = this.btnBuy.getPositionX() - sumW * 0.5;

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
        this.iconType.loadTexture(resource);
        var str = LocalizedString.to("ZALOPAY_OFFER_PRICE");
        str = StringUtility.replaceAll(str, "@price", StringUtility.pointNumber(this.offerData.valueOffer));
        this.lbNewPrice.setString(StringUtility.pointNumber(this.offerData.realValue) + " vnđ");

        var s = LocalizedString.to("OFFER_REMAIN_TIME");
        s = StringUtility.replaceAll(s, "@time", StringUtility.getTimeString(this.offerData.getTimeLeftInSecond()));
        this.lbTime.setString(s);
        // this.lbTime.setPositionX(this.btnBuy.getPosition().x - this.lbTime.getContentSize().width / 2);
    },

    genOffer: function () {
        var i = 0;
        for (i = 0; i < this.arrayOfferImage.length; i++) {
            if (!this.arrayOfferImage[i].isVisible()) {
                this.arrayOfferImage[i].setVisible(true);
                return this.arrayOfferImage[i];
            }
        }
        var label = new GroupOfferRepayBonus();
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
            case GUIOfferQuocKhanh.BTN_CLOSE: {
                this.onClose();
                break;
            }
            case GUIOfferQuocKhanh.BTN_BUY: {
                this.onClose();
                OfferManager.buyOffer(false, this.offerData.offerId);
            }
        }
    }
});
GUIOfferQuocKhanh.BTN_BUY = 0;
GUIOfferQuocKhanh.BTN_CLOSE = 1;
GUIOfferQuocKhanh.BTN_INFO = 2;
GUIOfferQuocKhanh.tag = 102;
GUIOfferQuocKhanh.className = "GUIOfferQuocKhanh";

var GUIOfferNoPrice = BaseLayer.extend({
    ctor: function () {
        this._super(GUIOfferQuocKhanh.className);
        this.initWithBinaryFile("GUIOfferNoPrice.json");
    },

    initGUI: function () {
        this.arrayOfferImage = [];
        this.bg = this.getControl("bg");
        this.btnBuy = this.getControl("btnBuy", this.bg);
        this.btnPayment = this.customButton("btn", GUIOffer.BTN_BUY, this.btnBuy);
        this.customButton("btnClose", GUIOffer.BTN_CLOSE);
        this.lbTime = this.getControl("lbTime", this.bg);
        this.lbTime.ignoreContentAdaptWithSize(true);
        this.panelFirework = this.getControl("panelFirework", this.bg);

        this.lbNewPrice = this.getControl("lbNewPrice", this.btnBuy);
        this.lbNewPrice.ignoreContentAdaptWithSize(true);
        this.eff = this.getControl("eff", this.btnBuy);
        var anim = db.DBCCFactory.getInstance().buildArmatureNode("BT_5K");
        this.eff.addChild(anim);
        anim.gotoAndPlay("1", -1, -1, 0);
        anim.setPosition(this.btnPayment.getContentSize().width / 2, this.btnPayment.getContentSize().height / 2);

        this.panelBonus = this.getControl("panelBonus", this.bg);
        this.lbBonus = this.getControl("lbBonus", this.panelBonus);

        this.lbPackage = this.getControl("lbPackage", this.bg);
        this.iconType = this.getControl("iconType", this.btnBuy);
        this.enableFog();
    },

    setInfo: function (offerData) {
        this.isShow = true;
        this.offerData = offerData;
        cc.log("OFER DATA GUIOfferRepay ** " + JSON.stringify(this.offerData));
        for (var i = 0; i < this.arrayOfferImage.length; i++) {
            this.arrayOfferImage[i].setVisible(false);
        }
        var startY = this.bg.getContentSize().height * 0.17;
        this.arrayBonus = [];
        for (var i = 0; i < offerData.listBonus.length; i++) {
            var bonus = offerData.listBonus[i];
            var offer = this.genOffer();
            offer.updateInfo(offerData.offerId, bonus.type, bonus.value, bonus.eventId, bonus.idType, bonus.subType, bonus.id);
            this.arrayBonus.push(offer);
            //offer.setPosition(this.bg.getContentSize().width * 0.3, startY - 20 * i);
        }
        var w = this.arrayBonus[0].getContentSize().width;
        var pad = 15;
        var sumW = w * this.arrayBonus.length + pad * (this.arrayBonus.length - 1);
        var startX = this.btnBuy.getPositionX() - sumW * 0.5;

        for (var i = 0; i < this.arrayBonus.length; i++) {
            this.arrayBonus[i].setPosition(startX + w * (0.5 + i) + pad * i, startY);
            this.arrayBonus[i].showEffect(i * 0.3);
        }
        var s = StringUtility.pointNumber(offerData.valueOffer) + " " + localized("ROULETE_VND") + " " + localized("EQUAL") + " " + offerData.getPaymentString();
        if (offerData.isNoPaymentType())
            s = StringUtility.pointNumber(offerData.valueOffer) + " " + localized("ROULETE_VND");

        this.lbPackage.setString(s);
        if (offerData.bonusPercentage > 0)
            this.lbBonus.setString("+" + offerData.bonusPercentage + "%");
        else
            this.panelBonus.setVisible(false);
        this.updateButton();
    },

    updateButton: function () {
        var resource = this.offerData.getResourceTypePayment();
        if (resource != "") {
            this.iconType.loadTexture(resource);
            this.iconType.setVisible(true);
        }
        else {
            this.iconType.setVisible(false)
        }
        var str = LocalizedString.to("ZALOPAY_OFFER_PRICE");
        str = StringUtility.replaceAll(str, "@price", StringUtility.pointNumber(this.offerData.valueOffer));
        this.lbNewPrice.setString(StringUtility.pointNumber(this.offerData.valueOffer) + " vnđ");

        var s = LocalizedString.to("OFFER_REMAIN_TIME");
        s = StringUtility.replaceAll(s, "@time", StringUtility.getTimeString(this.offerData.getTimeLeftInSecond()));
        this.lbTime.setString(s);
        // this.lbTime.setPositionX(this.btnBuy.getPosition().x - this.lbTime.getContentSize().width / 2);
    },

    genOffer: function () {
        var i = 0;
        for (i = 0; i < this.arrayOfferImage.length; i++) {
            if (!this.arrayOfferImage[i].isVisible()) {
                this.arrayOfferImage[i].setVisible(true);
                return this.arrayOfferImage[i];
            }
        }
        var label = new GroupOfferNoPriceBonus();
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

    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true);
        this.scheduleUpdate();
    },

    onBack: function () {
        this.isShow = false;
    },

    onButtonRelease: function (button, id) {
        popUpManager.removePopUp(PopUpManager.OFFER_ZALO);
        switch (id) {
            case GUIOfferQuocKhanh.BTN_CLOSE: {
                this.onClose();
                break;
            }
            case GUIOfferQuocKhanh.BTN_BUY: {
                this.onClose();
                OfferManager.buyOffer(false, this.offerData.offerId);
            }
        }

    }
});
GUIOfferNoPrice.BTN_BUY = 0;
GUIOfferNoPrice.BTN_CLOSE = 1;
GUIOfferNoPrice.BTN_INFO = 2;
GUIOfferNoPrice.tag = 102;
GUIOfferNoPrice.className = "GUIOfferNoPrice";

GroupOfferNoPriceBonus =  cc.Node.extend({
    ctor: function () {
        this._super();
        this.setAnchorPoint(cc.p(0, 0));
        this.setCascadeOpacityEnabled(true);

        this.iconEffect = new cc.Sprite("res/Lobby/Offer/bgFold.png");
        this.addChild(this.iconEffect);
        this.iconEffect.setPosition(0, 0);
        this.iconEffect.setPositionY(this.iconEffect.getContentSize().height * 0.5);

        this.bg = new cc.Sprite("res/Lobby/Offer/bgBonusNoPrice.png");
        this.addChild(this.bg);
        this.bg.setPosition(0, 0);
        this.bg.setPositionX(0);
        this.bg.setPositionY(this.bg.getContentSize().height * 0.5);

        this.icon = new cc.Sprite("res/Lobby/Offer/bonusGold.png");
        this.bg.addChild(this.icon);
        this.icon.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.57);

        this.labelDescrible = BaseLayer.createLabelText("fkdsjl fjsdj fsld kjfd kf sdfd ssds lfj", cc.color(223,251,249, 255));
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
        this.labelValue.setPosition(this.bg.getContentSize().width * 0.45, this.bg.getContentSize().height * 0.12);
        this.bg.addChild(this.labelValue);
        this.labelValue.pos = this.labelValue.getPositionY();

        this.setContentSize(this.icon.getContentSize());
    },

    showEffect: function (delayTime) {
        this.stopAllActions();
        this.bg.setVisible(true);
        this.iconEffect.setOpacity(255);
        this.iconEffect.setScale(1.0);
        this.pos = this.getPositionY();
        this.setPositionY(this.getPositionY() + 400);
        this.runAction(cc.sequence(cc.delayTime(delayTime), cc.moveTo(0.1, this.getPositionX(), this.pos), cc.delayTime(0.2), cc.callFunc(this.callbackShowEffect.bind(this))));
        this.runAction(cc.sequence(cc.delayTime(delayTime+ 0.1), cc.scaleTo(0.2, 1.0, 0.8), new cc.EaseBackOut(cc.scaleTo(0.4, 1.0, 1.0))));
    },

    callbackShowEffect: function () {
        this.iconEffect.runAction(cc.spawn(cc.fadeOut(0.5), cc.scaleTo(0.5, 2.0)));
    },

    updateInfo: function (offerId, type, value, eventId, idType, subType, id) {
        var offer = offerManager.getOfferById(offerId);
        this.labelDescrible.setVisible(false);
        switch (type) {
            case OfferManager.TYPE_GOLD:
                this.icon.setTexture("res/Lobby/Offer/bonusGold.png");
                this.labelValue.setString(StringUtility.pointNumber(value) + " Gold");
                break;
            case OfferManager.TYPE_G_STAR:
                this.icon.setTexture("res/Lobby/Offer/bonusGStar.png");
                this.labelValue.setString(StringUtility.pointNumber(value) + " VPoint");
                break;
            case OfferManager.TYPE_TIME:
                this.icon.setTexture("res/Lobby/Offer/bonusTime.png");
                var s = StringUtility.replaceAll(localized("VIP_FORMAT_HOURS"), "@hour", StringUtility.pointNumber(value));
                s = s + " VIP";
                this.labelValue.setString(s);
                this.labelDescrible.setVisible(true);
                this.labelDescrible.setString(localized("OFFER_BONUS_TIME_DES"));
                break;
            case OfferManager.TYPE_TICKET:
                this.icon.setTexture(event.getOfferTicketImage(eventId));
                this.labelValue.setString(StringUtility.pointNumber(value) + " " + event.getOfferTicketString(eventId));
                this.labelDescrible.setVisible(true);
                this.labelDescrible.setString(localized("OFFER_BONUS_EVENT_DES"));
                break;
            case OfferManager.TYPE_DIAMOND:
                this.icon.setTexture("res/Lobby/Offer/bonusDiamond.png");
                this.labelValue.setString(StringUtility.pointNumber(value) + " Kim cương");
                break;
            case OfferManager.TYPE_ITEM:
                var config = StorageManager.getInstance().itemConfig[idType];
                cc.log("CONFIG ITEM " + JSON.stringify(config));
                this.icon.setTexture(StorageManager.getItemIconPath(idType, subType, id));
                this.labelValue.setString(OfferManager.getNameItem(idType, id, subType, value));
                break;
        }
    }
});

var GUIShareFace = BaseLayer.extend({
    ctor: function () {
        this._super(GUIShareFace.className);
        this.initWithBinaryFile("GUIShareFace.json");
    },

    initGUI: function () {
        this.arrayOffer = [];
        this.bg = this.getControl("bg");
        this.customButton("btnShare", GUIShareFace.BTN_SHARE);
        this.customButton("btnClose", GUIShareFace.BTN_CLOSE);
        this.panelImage = this.getControl("panelImage");
        this.enableFog();
    },

    onEnterFinish: function() {
        this.setShowHideAnimate(this.bg, true);

    },

    addImage: function (image) {
        var scale = this.panelImage.getContentSize().height / cc.winSize.height;
        image.setScale(scale);
        this.panelImage.addChild(image);
        image.setPosition(this.panelImage.getContentSize().width * 0.5, this.panelImage.getContentSize().height * 0.5);
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case GUIShareFace.BTN_CLOSE: {
                this.onClose();
                break;
            }
            case GUIShareFace.BTN_SHARE: {
                this.onCloseDone();
                var cur = sceneMgr.getRunningScene().getMainLayer();
                if (cur instanceof LobbyScene) {
                    // cur.sharePhoto();
                    cur.sharePhoto(true, GUIShareFace.getContentShare(true));
                }
                break;
            }
        }
    }
});
GUIShareFace.checkOpenShare = function(){
    if (PortalMgr.isPortal() || !cc.sys.isNative){
        return;
    }
    var minDateNum = new Date(GUIShareFace.changeFormatTime(GUIShareFace.START_DATE)).getTime();
    var maxDateNum = new Date(GUIShareFace.changeFormatTime(GUIShareFace.END_DATE)).getTime();
    var date = new Date();
    var currentTime = date.getTime();
    var today = date.getDate() + "/" + date.getMonth();
    cc.log("GUIShareFace.checkOpenShare min max " + minDateNum + " " + maxDateNum , today, currentTime, (currentTime < maxDateNum), (currentTime > minDateNum));
    var isInTimeEvent = false;
    if (currentTime < maxDateNum && currentTime > minDateNum) {
        isInTimeEvent = true;
    }

    if (isInTimeEvent){
        cc.log('trong thoi gian share facebook');
        var keyLocal = "showShareFace_" + today;
        var showShareFace = cc.sys.localStorage.getItem(keyLocal);
        if (showShareFace == null || !showShareFace) {
            var gui = sceneMgr.openGUI(GUIShareFace.className, GUIShareFace.tag, GUIShareFace.tag);
            gui.addImage(GUIShareFace.getContentShare());
            cc.sys.localStorage.setItem(keyLocal, 1);
        }
    }
};
GUIShareFace.changeFormatTime = function(date){
    var arrTime = date.split("/");
    return arrTime[1] + "/" + arrTime[0] + "/" + arrTime[2];
};
GUIShareFace.getContentShare = function(isShowExtraInfo){
    var layout = new ccui.Layout();
    layout.setContentSize(Constant.WIDTH, Constant.HEIGHT);
    layout.setClippingEnabled(true);
    layout.setAnchorPoint(0.5, 0.5);
    if (isShowExtraInfo) layout.setPosition(Constant.WIDTH / 2, Constant.HEIGHT / 2);

    var otherBanner = false;
    var otherSprite;
    // var arrayBonus = gamedata.gameConfig.getMaxShopBonus();
    // if (arrayBonus.length > 0) {
    //     otherBanner = true;
    //     otherBanner = "res/Lobby/GUIShareFace/bannerShareX2.png";
    // }
    if (event.isInEvent()){
        otherBanner = true;
        otherSprite = "res/Lobby/GUIShareFace/bannerEvent.png";
    }

    if (otherBanner){
        var banner = new cc.Sprite(otherSprite);
        banner.setPosition(Constant.WIDTH / 2, Constant.HEIGHT / 2);
        banner.setScaleX(Constant.WIDTH / banner.getContentSize().width);
        banner.setScaleY(Constant.HEIGHT / banner.getContentSize().height);
        layout.addChild(banner);
        return layout;
    }
    var bg = new cc.Sprite("res/Lobby/GUIShareFace/banner2.png");
    bg.setPosition(Constant.WIDTH / 2, Constant.HEIGHT / 2);
    bg.setScaleX(Constant.WIDTH / bg.getContentSize().width);
    bg.setScaleY(Constant.HEIGHT / bg.getContentSize().height);
    // layout.setPosition(-cc.winSize.width / 2, -cc.winSize.height / 2);
    var extraInfo = new cc.Sprite("res/Lobby/GUIShareFace/extraInfo.png");
    bg.addChild(extraInfo);
    extraInfo.setPosition(cc.winSize.width / 2, 20);
    extraInfo.setVisible(false);
    layout.addChild(bg);
    return layout;
};
GUIShareFace.START_DATE = "26/03/2020";
GUIShareFace.END_DATE = "30/04/2020";
GUIShareFace.BTN_SHARE = 0;
GUIShareFace.BTN_CLOSE = 1;
GUIShareFace.tag = 1002;
GUIShareFace.className = "GUIShareFace";
