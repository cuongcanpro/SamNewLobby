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
                    this.imgBonus.loadTexture(eventMgr.getOfferTicketImage(bonus["eventId"]));
                    this.imgBonus.ignoreContentAdaptWithSize(true);
                    s = StringUtility.pointNumber(bonus["value"]) + " " + eventMgr.getOfferTicketString(bonus["eventId"]);
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