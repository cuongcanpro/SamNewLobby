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