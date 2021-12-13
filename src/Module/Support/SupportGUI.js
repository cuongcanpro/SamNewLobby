/**
 * Created by HunterPC on 8/31/2015.
 */

var GUISupportInfo = BaseLayer.extend({
    ctor: function() {
        this._super(GUISupportInfo.className);

        this.bg = null;
        this.btnX = null;
        this.btnClose = null;
        this.btnReceive = null;
        this.btnReceived = null;
        this.initValue = null;
        this.totalValue = null;
        this.description = null;
        this.valueBonusLevel = null;
        this.valueBonusEvent = null;
        this.imgVip = null;
        this.labelLevel = null;
        this.light1 = null;
        this.light2 = null;
        this.light3 = null;

        this.initWithBinaryFile("GUISupportInfo.json");
    },

    initGUI: function() {
        this.bg = this._layout.getChildByName("bg");
        this.btnX = this.customButton("btnX", GUISupportInfo.BTN_X, this.bg);
        this.btnClose = this.customButton("btnClose", GUISupportInfo.BTN_CLOSE, this.bg);
        this.btnReceive = this.customButton("btnReceive", GUISupportInfo.BTN_RECEIVE, this.bg);
        this.btnReceived = this.customButton("btnReceived", GUISupportInfo.BTN_RECEIVED, this.bg);
        this.btnReceived.setTouchEnabled(false);

        this.initValue = new NumberGroup();
        this.initValue.setPositionY(195);
        this.initValue.setScale(0.4);
        this.bg.addChild(this.initValue);

        this.totalValue = new NumberGroup();
        this.totalValue.setPosition(this.bg.width/2, 55);
        this.totalValue.setScale(0.65);
        this.bg.addChild(this.totalValue);

        this.description = this.getControl("text", this.bg);
        this.description.ignoreContentAdaptWithSize(true);
        this.valueBonusLevel = this.getControl("valueBonusLevel", this.bg);
        this.valueBonusEvent = this.getControl("valueBonusEvent", this.bg);
        this.imgVip = this.bg.getChildByName("imgVip");
        this.labelLevel = this.getControl("lbBonusLevel", this.bg);

        this.light1 = this.bg.getChildByName("light1");
        this.light2 = this.bg.getChildByName("light2");
        this.light3 = this.bg.getChildByName("light3");
        this.light1.setOpacity(0);
        this.light2.setOpacity(0);
        this.light3.setOpacity(0);

        this.pStar = this.getControl("pStar", this.bg);
        this.pEff = this.getControl("pEff", this.bg);

        this.enableFog();
    },

    initEffect: function() {
        if (!this.effHL) {
            var effect = db.DBCCFactory.getInstance().buildArmatureNode("Highlight");
            if (effect) {
                this.bg.addChild(effect, -1);
                effect.setPosition(this.pEff.getPosition());
                effect.gotoAndPlay("1", -1, -1, 1);
                effect.setVisible(false);
                effect.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
                    this.setVisible(true);
                }.bind(effect))));
                effect.setCompleteListener(function () {
                    this.setVisible(false);
                }.bind(effect));
            }
            this.effHL = effect;
        } else {
            this.effHL.gotoAndPlay("1", -1, -1, 1);
            this.effHL.setVisible(false);
            this.effHL.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
                this.setVisible(true);
            }.bind(this.effHL))));
            this.effHL.setCompleteListener(function () {
                this.setVisible(false);
            }.bind(this.effHL));
        }
    },

    onEnterFinish: function() {
        this._super();
        this.setShowHideAnimate(this.bg, true);
    },

    showGUI: function(money, isSpecial) {
        var isShowSpecial = false;
        this.btnReceive.setVisible(false);
        this.btnClose.setVisible(false);
        this.btnReceived.setVisible(false);
        if (money > 0) {
            this.totalValue.setNumber(money);
            if (!isSpecial) {
                if (gamedata.numSupport == 0)
                    this.description.setString(LocalizedString.to("SUPPORT_MONEY_NUM_0"));
                else if (gamedata.numSupport >= 1)
                    this.description.setString(StringUtility.replaceAll(LocalizedString.to("SUPPORT_MONEY_NUM_1"), "@num", gamedata.numSupport));
                else
                    this.description.setString("");
            }
            else{
                isShowSpecial = true;
                this.description.setString(LocalizedString.to("SUPPORT_MONEY_SPECIAL"));
            }
            this.btnReceive.setVisible(true);
            this.effectLight(true);
        }
        else {
            var specialSupport = gamedata.gameConfig.specialSupport.bonusGold;
            if (gamedata.numSupport <= 0){
                var checkSpecial = gamedata.checkInSpecialTimeSupport();
                if (checkSpecial && checkSpecial.error == 0){       //not special time yet
                    isShowSpecial = true;
                    this.description.setString(StringUtility.replaceAll(LocalizedString.to("SUPPORT_MONEY_SPECIAL_2"), "@time", checkSpecial.time + "\n"));
                    this.btnClose.setVisible(true);
                    this.effectLight(true);
                }
                else if (checkSpecial && checkSpecial.error == 1){  //in special time
                    isShowSpecial = true;
                    this.description.setString(StringUtility.replaceAll(LocalizedString.to("SUPPORT_INFO_3"), "@time", checkSpecial.time));
                    this.btnClose.setVisible(true);
                    this.effectLight(true);
                }
                else{   //special time over
                    this.description.setString(LocalizedString.to("SUPPORT_INFO_1"));
                    this.btnReceived.setVisible(true);
                    this.effectLight(false);
                }
            }
            else{
                var numSupport = (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) ? (gamedata.gameConfig.vipConfig[VipManager.getInstance().getVipLevel()].support.length - 1) : (gamedata.gameConfig.vipConfig[0].support.length - 1);
                this.description.setString(StringUtility.replaceAll(LocalizedString.to("SUPPORT_INFO_2"), "@num", numSupport));
                this.btnClose.setVisible(true);
                this.effectLight(true);
            }

            if (isShowSpecial){
                this.totalValue.setNumber(specialSupport);
            }
            else {
                if (money <= 0) {
                    if (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) {
                        this.totalValue.setNumber(gamedata.gameConfig.getTotalSupportBean(gamedata.userData.level, gamedata.gameConfig.vipConfig[VipManager.getInstance().getVipLevel()].support[1]));
                    } else {
                        this.totalValue.setNumber(gamedata.gameConfig.getTotalSupportBean(gamedata.userData.level, gamedata.gameConfig.vipConfig[0].support[1]));
                    }
                }
            }
        }

        this.bg.getChildByName("dot0").setVisible(!isShowSpecial);
        this.bg.getChildByName("dot1").setVisible(!isShowSpecial);
        this.bg.getChildByName("dot2").setVisible(!isShowSpecial);
        this.getControl("lbBonusVip", this.bg).setVisible(!isShowSpecial);
        this.getControl("lbBonusLevel", this.bg).setVisible(!isShowSpecial);
        this.getControl("lbBonusEvent", this.bg).setVisible(!isShowSpecial);
        this.bg.getChildByName("imgVip").setVisible(!isShowSpecial);
        this.initValue.setVisible(!isShowSpecial);
        this.valueBonusLevel.setVisible(!isShowSpecial);
        this.valueBonusEvent.setVisible(!isShowSpecial);

        if (!isShowSpecial){
            var vipLevel = (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) ? VipManager.getInstance().getVipLevel() : 0;
            this.imgVip.setTexture("Offer/iconVip" + vipLevel + ".png");
            this.valueBonusLevel.setString("+" + gamedata.gameConfig.getLevelBonus(gamedata.userData.level) + "%");
            this.valueBonusEvent.setString("+0%");
            this.labelLevel.setString("Bonus Lv " + gamedata.userData.level);
            var vipBonus = (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) ? gamedata.gameConfig.vipConfig[VipManager.getInstance().getVipLevel()].support[1] : 30000;
            this.initValue.setNumber(vipBonus);
            this.initValue.setPositionX(375);
        }
        else{
            var chest = this.bg.getChildByName("chest");
            var deltaX = this.bg.getContentSize().width/2 - chest.getPositionX();
            chest.setPositionX(chest.getPositionX() + deltaX);
            this.pEff.setPositionX(this.pEff.getPositionX() + deltaX);
            this.pStar.setPositionX(this.pStar.getPositionX() + deltaX);
            this.light1.setPositionX(this.light1.getPositionX() + deltaX);
            this.light2.setPositionX(this.light2.getPositionX() + deltaX);
            this.light3.setPositionX(this.light3.getPositionX() + deltaX);
        }
        this.initEffect();
    },

    onButtonRelease: function(button, id) {
        switch(id) {
            case GUISupportInfo.BTN_X:
            case GUISupportInfo.BTN_CLOSE:
                this.bg.stopAllActions();
                this.onClose();
                break;
            case GUISupportInfo.BTN_RECEIVE:
                this.runAction(cc.sequence(
                    cc.callFunc(function () {
                        this.coinEffect();
                        this.btnReceive.setTouchEnabled(false);
                        this.btnReceive.runAction(cc.fadeOut(0.5));
                    }.bind(this)),
                    cc.delayTime(2),
                    cc.callFunc(function () {
                        this.bg.stopAllActions();
                        this.onClose();
                    }.bind(this))
                ));
                break;
        }

        popUpManager.removePopUp(PopUpManager.SUPPORT);
    },

    effectLight: function(show) {
        this.light1.setVisible(show);
        this.light2.setVisible(show);
        this.light3.setVisible(show);
        if (!show) return;

        this.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function(){
                this.light1.setOpacity(0);
                this.light1.setScale(0.5);
                this.light2.setOpacity(0);
                this.light3.setOpacity(0);

                this.light3.stopAllActions();
                this.light3.runAction(cc.rotateBy(1, 30).repeatForever());
                this.light3.runAction(cc.sequence(cc.fadeIn(1.5), cc.fadeOut(1.5)).repeatForever());

                this.light2.stopAllActions();
                this.light2.runAction(cc.rotateBy(2, 30).repeatForever());
                this.light2.runAction(cc.sequence(cc.fadeOut(1.5), cc.fadeIn(1.5)).repeatForever());

                this.light1.stopAllActions();
                this.light1.runAction(cc.sequence(
                    cc.spawn(cc.scaleTo(1.5, 1), cc.fadeIn(1.5)),
                    cc.spawn(cc.scaleTo(0.75, 1.25), cc.fadeOut(0.75)),
                    cc.scaleTo(0, 0.5)
                ).repeatForever());

                this.pStar.removeAllChildren();
                for (var pos = 0; pos < 5; ++pos){
                    var tg = new cc.Sprite("Lobby/Offer/star.png");
                    this.pStar.addChild(tg);
                    tg.setPosition(this.pStar.getBoundingBox().width / 2, this.pStar.getBoundingBox().height / 2);
                    tg.setScale(0.15 + Math.random() * 0.3);
                    tg.runAction(cc.rotateBy(1, 30).repeatForever());
                    tg.setOpacity(0);

                    var delaX = (0.75 + 0.75 * Math.random()) * this.pStar.getBoundingBox().width * (Math.pow(-1, Math.round(Math.random())));
                    var delaY = (0.5 + 0.5 * Math.random()) * this.pStar.getBoundingBox().height * (Math.pow(-1, Math.round(Math.random())));
                    var delayTime = Math.random() * 4;
                    tg.posi = tg.getPosition();
                    tg.runAction(cc.sequence(
                        cc.callFunc(function () {
                            this.setPosition(this.posi);
                        }.bind(tg)),
                        cc.delayTime(delayTime), cc.fadeIn(0),
                        cc.spawn(cc.fadeOut(2.75), cc.moveTo(2.75, tg.posi.x + delaX, tg.posi.y + delaY))
                    ).repeatForever());
                }
            }.bind(this))
        ));
    },

    coinEffect: function () {
        this.pEff.removeAllChildren();
        var size = this.pEff.getBoundingBox();
        var coinEffect = new CoinFallEffect();
        coinEffect.setPosition(0, 0);
        coinEffect.setPositionCoin(cc.p(size.width / 2, size.height / 2));
        coinEffect.setContentSize(size.width * 0.5, size.height * 0.5);
        coinEffect.setVisible(false);

        this.pEff.addChild(coinEffect);
        var num = 30;
        if (this.money > 300000) num = 60;
        else if (this.money > 1000000) num = 100;
        else if (this.money > 10000000) num = 150;
        coinEffect.startEffect(num, CoinFallEffect.TYPE_FLOW);
        coinEffect.setAutoRemove(true);

        if (gamedata.sound) {
            cc.audioEngine.playEffect(lobby_sounds["coinFall"], false);
        }
    }
});

GUISupportInfo.className = "GUISupportInfo";
GUISupportInfo.BTN_X = 0;
GUISupportInfo.BTN_CLOSE = 1;
GUISupportInfo.BTN_RECEIVE = 2;
GUISupportInfo.BTN_RECEIVED = 3;
GUISupportInfo.tag = 1002;

var SupportBeanGUI = BaseLayer.extend({

    ctor: function () {
        this._lbNotice = null;
        this._posMoney = null;
        this._moneyGroup = null;
        this._imgGold = null;
        this._type = -1;
        this.titles = [];

        this._super(SupportBeanGUI.className);
        this.initWithBinaryFile("SupportBeanGUI.json");
    },

    initGUI : function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this.titles[0] = this.getControl("title0",bg);
        this.titles[1] = this.getControl("title1",bg);

        this.customizeButton("btnOK",1,bg);

        this._lbTitle = ccui.Helper.seekWidgetByName(bg,"lbTitle");
        this._lbNotice = ccui.Helper.seekWidgetByName(bg,"lbNotice");
        this._moneyGroup = new NumberGroup();
        bg.addChild(this._moneyGroup);

        this._imgGold = this.getControl("imgGold",bg);
        this._posMoney = this.getControl("imgMoney",bg).getPosition();
        this._moneyGroup.setPosition(this._posMoney);

        this.enableFog();
    },

    onEnterFinish : function () {
        this.setShowHideAnimate(this._bg,true);
    },

    showSupportBean : function ( money , numSupport) {
        this._type = SupportBeanGUI.BEAN;
        for(var i = 0 ; i < this.titles.length ; i++)
        {
            this.titles[i].setVisible(this._type == i);
        }

        this._moneyGroup.setNumber(money);

        this._lbNotice.setVisible(true);
        if (gamedata.numSupport == 0)
            this._lbNotice.setString(LocalizedString.to("SUPPORT_MONEY3"));
        else if (gamedata.numSupport == 1)
            this._lbNotice.setString(LocalizedString.to("SUPPORT_MONEY1"));
            // else if (gamedata.numSupport == 2)
        //     this._lbNotice.setString(LocalizedString.to("SUPPORT_MONEY1"));
        else
            this._lbNotice.setString("");
    },

    showSupportStartup : function () {
        cc.log("show start up nay");
        this._type = SupportBeanGUI.START_UP;
        for(var i = 0 ; i < this.titles.length ; i++)
        {
            this.titles[i].setVisible(this._type == i);
        }

        this._lbNotice.setVisible(false);
        this._moneyGroup.setNumber(supportMgr.dailyGift);

        this._imgGold.setPositionY(this._imgGold.getPositionY() - this._lbNotice.getContentSize().height);
        this._moneyGroup.setPositionY(this._moneyGroup.getPositionY() - this._lbNotice.getContentSize().height);
    },

    onButtonRelease : function (button, id) {
        if(id == 1) {
            if(this._type == SupportBeanGUI.START_UP) {
                if(supportMgr.giftIndex >= 0) {
                    var sendGetDailyGift = new CmdSendGetDailyGift();
                    sendGetDailyGift.putData(supportMgr.giftIndex);
                    GameClient.getInstance().sendPacket(sendGetDailyGift);
                    supportMgr.giftIndex = -1;
                }
            }
        }

        this.onClose();
    }
});
SupportBeanGUI.className= "SupportBeanGUI";

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
                    supportMgr.sharePhoto(true, GUIShareFace.getContentShare(true));
                }
                break;
            }
        }
    }
});
GUIShareFace.checkOpenShare = function(){
    if (portalMgr.isPortal() || !cc.sys.isNative){
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