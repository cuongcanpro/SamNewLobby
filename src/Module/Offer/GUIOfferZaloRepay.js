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
GUIOfferZaloRepay.tag = 104;