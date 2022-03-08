var GUIOfferNoPrice = BaseLayer.extend({
    ctor: function () {
        this._super(GUIOfferNoPrice.className);
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
        cc.log("OFFER DATA GUIOfferNoPrice" + JSON.stringify(this.offerData));
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
        }
        var w = this.arrayBonus[0].getContentSize().width;
        var pad = -24;
        var sumW = w * this.arrayBonus.length + pad * (this.arrayBonus.length - 1);
        var startX = this.btnBuy.getPositionX() - sumW * 0.5;

        for (var i = 0; i < this.arrayBonus.length; i++) {
            this.arrayBonus[i].setPosition(startX + w * (0.5 + i) + pad * i, startY);
            this.arrayBonus[i].showEffect(i);
        }
        var s = StringUtility.pointNumber(offerData.valueOffer) + " " + localized("VND") + " " + localized("EQUAL") + " " + offerData.getPaymentString();
        if (offerData.isNoPaymentType())
            s = StringUtility.pointNumber(offerData.valueOffer) + " " + localized("VND");

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

var GroupOfferNoPriceBonus = cc.Node.extend({
    ctor: function () {
        this._super();
        this.setAnchorPoint(cc.p(0, 0));
        this.setCascadeOpacityEnabled(true);

        this.bg = new cc.Sprite("res/Lobby/Offer/bgBonusNoPrice.png");
        this.addChild(this.bg);
        this.bg.setPosition(0, 0);
        this.bg.setPositionX(0);
        this.bg.setPositionY(this.bg.getContentSize().height * 0.5);

        this.icon = new cc.Sprite("res/Lobby/Offer/bonusGold.png");
        this.bg.addChild(this.icon);
        this.icon.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.57);

        this.labelDescrible = BaseLayer.createLabelText("Description here", cc.color(167,97,37, 255));
        this.labelDescrible.setFontName(SceneMgr.FONT_NORMAL);
        this.labelDescrible.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.labelDescrible.setAnchorPoint(cc.p(0.5, 0.5));
        this.labelDescrible.setFontSize(20);
        this.labelDescrible.setPosition(this.bg.getContentSize().width * 0.525, this.bg.getContentSize().height * 0.8);
        this.labelDescrible.setContentSize(cc.size(this.bg.getContentSize().width * 0.75, 80));
        this.labelDescrible.ignoreContentAdaptWithSize(false);
        this.labelDescrible.setSkewX(10);
        this.bg.addChild(this.labelDescrible);

        this.labelValue = BaseLayer.createLabelText("1000000", cc.color(167,97,37, 255));
        this.labelValue.setFontName(SceneMgr.FONT_BOLD);
        this.labelValue.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.labelValue.setAnchorPoint(cc.p(0.5, 0.5));
        this.labelValue.setFontSize(30);
        this.labelValue.setPosition(this.bg.getContentSize().width * 0.45, this.bg.getContentSize().height * 0.12);
        this.bg.addChild(this.labelValue);
        this.labelValue.pos = this.labelValue.getPositionY();

        this.setContentSize(this.icon.getContentSize());
    },

    showEffect: function (idx) {
        this.stopAllActions();
        this.pos = this.getPositionX();

        this.setOpacity(0);
        this.setPositionX(this.getPositionX() + 400);
        this.runAction(cc.sequence(
            cc.delayTime(idx * 0.075),
            cc.spawn(
                cc.fadeIn(0.25),
                cc.moveTo(0.5 - idx * 0.05, this.pos, this.getPositionY()).easing(cc.easeBackOut())
            )
        ));
        this.setScale(1);
        this.runAction(cc.sequence(
            cc.delayTime(idx * 0.075 + (0.35 - idx * 0.05) * 0.7),
            cc.scaleTo(0.08 + idx * 0.02, 0.75, 1),
            cc.scaleTo(0.06 + idx * 0.005, 1, 1)
        ));
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
                this.icon.setTexture(eventMgr.getOfferTicketImage(eventId));
                this.labelValue.setString(StringUtility.pointNumber(value) + " " + eventMgr.getOfferTicketString(eventId));
                this.labelDescrible.setVisible(true);
                this.labelDescrible.setString(localized("OFFER_BONUS_EVENT_DES"));
                break;
            case OfferManager.TYPE_DIAMOND:
                this.icon.setTexture("res/Lobby/Offer/bonusDiamond.png");
                this.labelValue.setString(StringUtility.pointNumber(value) + " Kim cương");
                break;
            case OfferManager.TYPE_ITEM:
                if (StorageManager.getInstance().itemConfig) {
                    var config = StorageManager.getInstance().itemConfig[idType];
                    cc.log("CONFIG ITEM " + JSON.stringify(config));
                    this.icon.setTexture(StorageManager.getItemIconPath(idType, subType, id));
                    this.labelValue.setString(OfferManager.getNameItem(idType, id, subType, value));
                }
                else {
                    this.setVisible(false);
                }

                break;
        }
    }
});