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
        this.labelVip = null;

        this.initWithBinaryFile("GUISupportInfo.json");
    },

    initGUI: function() {
        this.bg = this._layout.getChildByName("bg");
        this.btnX = this.customButton("btnX", GUISupportInfo.BTN_X, this.bg);
        this.btnClose = this.customButton("btnClose", GUISupportInfo.BTN_CLOSE, this.bg);
        this.btnReceive = this.customButton("btnReceive", GUISupportInfo.BTN_RECEIVE, this.bg);
        this.btnReceived = this.customButton("btnReceived", GUISupportInfo.BTN_RECEIVED, this.bg);
        this.btnReceived.setTouchEnabled(false);

        this.initValue = new NumberGroupCustom("res/Lobby/ShopIAP/Number/num_", -4, NumberGroupCustom.TYPE_POINT);
        this.initValue.setPositionY(195);
        this.initValue.setScale(0.4);
        this.bg.addChild(this.initValue);

        this.totalValue = new NumberGroupCustom("res/Lobby/ShopIAP/Number/num_", -4, NumberGroupCustom.TYPE_POINT);
        this.totalValue.setPosition(this.bg.width/2, 55);
        this.totalValue.setScale(1.05);
        this.totalValue.setPosition(this.btnReceive.getPositionX(), this.btnReceive.getPositionY() + this.btnReceive.getContentSize().height * 0.8);
        this.bg.addChild(this.totalValue);

        this.description = this.getControl("text", this.bg);
        this.description.ignoreContentAdaptWithSize(true);

        this.bgGift = this.getControl("bgGift", this.bg);
        this.valueBonusLevel = this.getControl("valueBonusLevel", this.bgGift);
        this.valueBonusEvent = this.getControl("valueBonusEvent", this.bgGift);
        this.valueBonusVip = this.getControl("valueBonusVip", this.bgGift);

        var bg1 = this.getControl("bgVip", this.bgGift);
        this.imgVip = bg1.getChildByName("icon");
        this.labelLevel = this.getControl("lbBonusLevel", this.bg);
        this.labelVip = this.getControl("lbBonusLevel", this.bg);

        this.bgGiftSpecial = this.getControl("bgGiftSpecial", this.bg);
        this.valueBonusSpecial = this.getControl("valueBonusSpecial", this.bgGiftSpecial);

        this.enableFog();
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
        this.bgGift.setVisible(false);
        this.bgGiftSpecial.setVisible(false);
        if (money > 0) {
            this.totalValue.setNumber(money);
            if (!isSpecial) {
                if (supportMgr.numSupport == 0)
                    this.description.setString(LocalizedString.to("SUPPORT_MONEY_NUM_0"));
                else if (supportMgr.numSupport >= 1)
                    this.description.setString(StringUtility.replaceAll(LocalizedString.to("SUPPORT_MONEY_NUM_1"), "@num", supportMgr.numSupport));
                else
                    this.description.setString("");
                this.bgGift.setVisible(true);
            }
            else{
                isShowSpecial = true;
                this.description.setString(LocalizedString.to("SUPPORT_MONEY_SPECIAL"));
                this.bgGiftSpecial.setVisible(true);
                this.valueBonusSpecial.setString("+" + StringUtility.pointNumber(money));
            }
            this.btnReceive.setVisible(true);
        }
        else {
            var specialSupport = supportMgr.specialSupport.bonusGold;
            if (supportMgr.numSupport <= 0){
                var checkSpecial = supportMgr.checkInSpecialTimeSupport();

                if (checkSpecial && checkSpecial.error == 0){       //not special time yet
                    isShowSpecial = true;
                    this.description.setString(StringUtility.replaceAll(LocalizedString.to("SUPPORT_MONEY_SPECIAL_2"), "@time", checkSpecial.time + "\n"));
                    this.btnClose.setVisible(true);
                }
                else if (checkSpecial && checkSpecial.error == 1){  //in special time
                    isShowSpecial = true;
                    this.description.setString(StringUtility.replaceAll(LocalizedString.to("SUPPORT_INFO_3"), "@time", checkSpecial.time));
                    this.btnClose.setVisible(true);
                }
                else {   //special time over
                    this.description.setString(LocalizedString.to("SUPPORT_INFO_1"));
                    this.btnReceived.setVisible(true);
                }
            }
            else{
                var numSupport = (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) ? (vipMgr.vipConfig[VipManager.getInstance().getVipLevel()].support.length - 1) : (vipMgr.vipConfig[0].support.length - 1);
                this.description.setString(StringUtility.replaceAll(LocalizedString.to("SUPPORT_INFO_2"), "@num", numSupport));
                this.btnClose.setVisible(true);
            }

            if (isShowSpecial){
                this.totalValue.setNumber(specialSupport);
                this.valueBonusSpecial.setString("+" + StringUtility.pointNumber(specialSupport));
                this.bgGiftSpecial.setVisible(true);
            }
            else {
                if (money <= 0) {
                    if (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) {
                        this.totalValue.setNumber(levelMgr.getTotalSupportBean(userMgr.getLevel(), vipMgr.vipConfig[VipManager.getInstance().getVipLevel()].support[1]));
                    } else {
                        this.totalValue.setNumber(levelMgr.getTotalSupportBean(userMgr.getLevel(), vipMgr.vipConfig[0].support[1]));
                    }
                }
                this.bgGift.setVisible(true);
            }
        }

        if (!isShowSpecial){
            var vipLevel = (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) ? VipManager.getInstance().getVipLevel() : 0;
            this.imgVip.setTexture("Offer/iconVip" + vipLevel + ".png");
            this.valueBonusLevel.setString("+" + levelMgr.getLevelBonus(userMgr.getLevel()) + "%");
            this.valueBonusEvent.setString("+0%");
            this.labelLevel.setString("Bonus Lv " + userMgr.getLevel());
            var vipBonus = (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) ? vipMgr.vipConfig[VipManager.getInstance().getVipLevel()].support[1] : 30000;
            this.valueBonusVip.setString(vipBonus);
        }
        else{

        }
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

        if (settingMgr.sound) {
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

var GUIStartUp = BaseLayer.extend({

    ctor: function () {
        this._lbNotice = null;
        this._posMoney = null;
        this._moneyGroup = null;
        this._imgGold = null;
        this._type = -1;
        this.titles = [];

        this._super(GUIStartUp.className);
        this.initWithBinaryFile("GUIStartUp.json");
    },

    initGUI : function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this.customizeButton("btnOK",1, bg);
        this._lbNotice = ccui.Helper.seekWidgetByName(bg,"lbNotice");
        this.lbGold = this.getControl("lbGold");

        this.enableFog();
    },

    onEnterFinish : function () {
        this.setShowHideAnimate(this._bg,true);
    },

    showSupportStartup : function () {
        cc.log("show start up nay");
        this.lbGold.setString(StringUtility.pointNumber(supportMgr.dailyGift) + " GOLD");
    },

    onButtonRelease : function (button, id) {
        if(id == 1) {
            if(supportMgr.giftIndex >= 0) {
                var sendGetDailyGift = new CmdSendGetDailyGift();
                sendGetDailyGift.putData(supportMgr.giftIndex);
                GameClient.getInstance().sendPacket(sendGetDailyGift);
                supportMgr.giftIndex = -1;
            }
        }
        this.onClose();
    }
});
GUIStartUp.className= "GUIStartUp";

var GUIShareFace = BaseLayer.extend({
    ctor: function () {
        this._super(GUIShareFace.className);
        this.initWithBinaryFile("GUIShareFace.json");
    },

    initGUI: function () {
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