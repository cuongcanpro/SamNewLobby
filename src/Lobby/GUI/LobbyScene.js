var LobbyScene = BaseLayer.extend({

    ctor: function () {

        this._imgMinigameNotice = null;
        this._lbMinigameAvaiable = null;

        this._uiAvatar = null;
        this._uiName = null;
        this._uiBean = null;
        this._uiCoin = null;

        this.npc = null;
        this.lasvegas = null;
        this.logo = null;
        this.btnQuickPlay = null;
        this.btnChooseRoom = null;
        this.btnVip = null;
        this.btnMinigame = null;
        this.arPanelFW = [];

        this.btnGold = null;
        this.btnGiftCode = null;
        this.btnG = null;
        this.btnGoldSmall = null;

        this.btnEvent = null;
        this.btnNews = null;
        this.btnMoiban = null;
        this.btnEventInGame = null;

        this.btnCamera = null;
        this.notifyCapture = null;
        this.btnHotNews = null;

        this.isRequestTop = false;
        this.isAnimateGUI = false;

        this._super(LobbyScene.className);
        this.initWithBinaryFile("LobbyGUI.json");
    },

    onEnterFinish: function () {
        this.setBackEnable(true);

        // open billing
        if (cc.sys.isNative) {
            iapHandler.openIAP();
        }

        // load payment default
        if (gamedata.checkEnablePayment()) {
            this.btnGold.setVisible(true);
            if (gamedata.checkEnableNapG())
                this.getControl("btn", this.btnG).setVisible(true);
            else
                this.getControl("btn", this.btnG).setVisible(false);
            this.getControl("btn", this.btnGoldSmall).setVisible(true);
        } else {
            this.btnGold.setVisible(false);

            this.getControl("btn", this.btnG).setVisible(false);
            this.getControl("btn", this.btnGoldSmall).setVisible(false);
        }

        if (!gamedata.checkInReview()) {
            if (Config.enableMinigame() && Config.ENABLE_VIDEO_POKER) {
                this.btnGiftCode.setVisible(false);
                this.btnVip.setVisible(false);
                this.btnNews.setVisible(false);
                this.btnCamera.setVisible(!gamedata.checkDisableSocialViral() && cc.sys.isNative);
            } else if (Config.enableMinigame() && !Config.ENABLE_VIDEO_POKER) {
                this.btnGiftCode.setVisible(false);
                this.btnVip.setVisible(false);
                this.btnNews.setVisible(false);
                this.btnCamera.setVisible(!gamedata.checkDisableSocialViral() && cc.sys.isNative);
            } else if (!Config.enableMinigame() && Config.ENABLE_VIDEO_POKER) {
                this.btnGiftCode.setVisible(true);
                this.btnVip.setVisible(true);
                this.btnNews.setVisible(true);
                this.btnCamera.setVisible(!gamedata.checkDisableSocialViral() && cc.sys.isNative);
            } else if (!Config.enableMinigame() && !Config.ENABLE_VIDEO_POKER) {
                this.btnGiftCode.setVisible(true);
                this.btnVip.setVisible(true);
                this.btnNews.setVisible(true);
                this.btnCamera.setVisible(!gamedata.checkDisableSocialViral() && cc.sys.isNative && cc.sys.isNative);
            }

        } else {
            this.btnGiftCode.setVisible(false);
            this.btnVip.setVisible(false);
            this.btnCamera.setVisible(false);
            this.btnNews.setVisible(false);
            var pBot = this.getControl("bot");
            this.getControl("sp2", pBot).setVisible(false);
            this.getControl("sp3", pBot).setVisible(false);
        }

        // this.btnCamera.setVisible(false);
        this.onUpdateGUI();
        this.updateToCurrentData();
        this.loadAnimation();
        this.onUpdateBtnRank();
        if (!this.isAnimateGUI) {
            this.isAnimateGUI = true;
            this.defaultPosition();
            setTimeout(this.doFinishEffect.bind(this), 100);
            // this.waitEffect();
            // this.effect();
        } else {
            this.defaultPosition();
            setTimeout(this.doFinishEffect.bind(this), 100);
        }

        // hide event button
        this.btnEvent.setVisible(false);
        this.scheduleUpdate();
        LobbyButtonManager.getInstance().scheduleUpdate();

        // show Offer GUI khi bi kick ra khoi ban choi vi het tien
        offerManager.showOfferGUIKick();
        gamedata.checkShowSystemBonus();
        gamedata.checkShowPopupBrand();
        PopupEventFanpage.checkOpenPopup();
        GUIShareFace.checkOpenShare();
        if (!cc.sys.isNative) {
            // this.topLayer._uiTable.setTouchEnabled(true);
        }

        var dailyBonus = NewVipManager.getInstance().getDailyBonusGold();
        if (dailyBonus) {
            if (popUpManager.canShow(PopUpManager.DAILY_BONUS_VIP)) {
                var gui = sceneMgr.openGUI(VipDailyGoldBonusGUI.className, PopUpManager.DAILY_BONUS_VIP, PopUpManager.DAILY_BONUS_VIP);
                gui.setInfoDailyBonus(dailyBonus);
            }
        }
        Event.instance().checkFreeTicket();

        var getInfoVip = new CmdSendGetVipInfo();
        GameClient.getInstance().sendPacket(getInfoVip);
        getInfoVip.clean();

        StorageManager.getInstance().showNotifyStorage();
        DailyPurchaseManager.getInstance().checkNotifyGift();

        //Event Portal
        gamedata.checkEventPortal();
        this.panelSnow.removeAllChildren();
    },

    onExit: function () {
        this._super();
        event.resetEventButton();
        this.unscheduleUpdate();
        LobbyButtonManager.getInstance().unscheduleUpdate();
        this.btnRank.pArrow.removeAllChildren();
    },

    initGUI: function () {
        // Background
        var bg = this.getControl("bg");
        var scale = cc.winSize.height / bg.getContentSize().height;
        bg.setScale(scale);
        bg.setVisible(true);

        this.adult = this.getControl("adult");
        this.adult.setVisible(gamedata.enableAdult);

        this.panelSnow = this.getControl("panelSnow", bg);
        var emitter1 = new cc.ParticleSystem("res/Particles/snow.plist");
        emitter1.setBlendAdditive(true);
        emitter1.setPosVar(cc.p(this.panelSnow.getContentSize().width, this.panelSnow.getContentSize().height));
        emitter1.setGravity(cc.p(0, -10));
        emitter1.setSpeed(30);
        // emitter1.setPosVar(cc.p(100, 100));
        var batch = new cc.ParticleBatchNode(emitter1.texture);
        batch.addChild(emitter1);
        // batch.setPosition(300, 300);
        // this.panelSnow.addChild(batch);
        emitter1.setSourcePosition(cc.p(550, -400));
        emitter1.setStartSize(10)

        //bg.setScale(this._scaleRealX);

        this.npc = this.getControl("npc");
        this.panelBgNew = this.getControl("panelBgNew");

        this.initTopLeft();
        this.initTopRight();
        this.initCenterLeft();
        this.initCenterRight();
        this.initBottom();
        this.initVip();

        // Load Firework Position
        var deltaY = 0;
        if (this._scaleRealX < 1) {
            deltaY = bg.getContentSize().height * (1 - this._scaleRealX) / 2;
        }

        for (var i = 0; i < 3; i++) {
            var p = this.getControl("f" + (i + 1), bg);
            p.setPositionY(p.getPositionY() + deltaY);
            this.arPanelFW.push(p);
        }


        if (Config.ENABLE_POTBREAKER) {
            potBreaker.sendEventPotBreaker();
        }

        cc.log("CREATE BUTTON IN LOBBY ");
        event.createEventInLobby(this);
        // eventTet.onEvent(eventTet.createCmdNotifyEvent());
    },

    initVip: function () {

        if (Config.ENABLE_NEW_VIP) {
            var pTooltipVip = this.btnVip.getChildByName("nTooltipVip");
            this.pTooltipVip = this.getControl("pTooltipVip", pTooltipVip);
            this.pTooltipVip.setLocalZOrder(1);
            this.pTooltipVip.defaultPos = this.pTooltipVip.getPosition();
            this.bgTooltip = this.getControl("bgTooltip", this.pTooltipVip);
            this.bgTooltip.defaultPos = this.bgTooltip.getPosition();
            var iconVip = this.getControl("iconVip", this.bgTooltip);
            iconVip.ignoreContentAdaptWithSize(true);
            iconVip.setVisible(false);
            this.bgTooltip.iconVip = ccui.Scale9Sprite.create(NewVipManager.getIconVip(1));
            iconVip.getParent().addChild(this.bgTooltip.iconVip);
            this.bgTooltip.iconVip2 = iconVip;
            this.bgTooltip.iconVip.setPosition(iconVip.getPosition());
            this.bgTooltip.txtVip = this.getControl("txtVip", this.bgTooltip);
            this.bgTooltip.txtRemain = this.getControl("txtRemain", this.bgTooltip);
            this.bgTooltip.txtTimeRemain = this.getControl("txtTimeRemain", this.bgTooltip);
            this.pTooltipVip.setVisible(false);
        }
    },

    initCenterRight: function () {
        var pRightButton = this.getControl("pRightButton");
        pRightButton.setPositionX(pRightButton.getPositionX() - (cc.winSize.width - Constant.WIDTH) * 0.15);
        this.btnQuickPlay = this.customButton("btnChoingay", LobbyScene.BTN_CHOINGAY, pRightButton);
        this.btnChooseRoom = this.customButton("btnChonban", LobbyScene.BTN_CHONBAN, pRightButton);
        this.btnRank = this.customButton("btnRank", LobbyScene.BTN_RANK, pRightButton);
        this.btnRank.worldPosition = this.btnRank.getWorldPosition();
        this.btnRank.hot = this.getControl("hot", this.btnRank);
        this.btnRank.hot.setLocalZOrder(1);
        this.btnRank.pArrow = this.getControl("pArrow", this.btnRank);
        this.btnRank.pArrow.setLocalZOrder(2);
        this.btnVip = this.customButton("btnVip", LobbyScene.BTN_VIP, pRightButton);

        this.btnQuickPlay.setPressedActionEnabled(false);
        this.btnChooseRoom.setPressedActionEnabled(false);
        this.btnRank.setPressedActionEnabled(false);
        this.btnVip.setPressedActionEnabled(false);
    },

    initBottom: function () {
        var pBotButton = this.getControl("bot");//this.getControl("bot");

        this.btnStorage = this.customButton("btnStorage", LobbyScene.BTN_STORAGE, pBotButton);

        this.btnHotNews = this.customButton("btnHotNews", LobbyScene.BTN_HOT_NEWS, pBotButton);
        this.btnHotNews.hot = this.getControl("imgNotice", this.btnHotNews);
        this.btnHotNews.hot.setVisible(false);

        this.btnGold = this.customButton("btnDoivang", LobbyScene.BTN_DOIVANG, pBotButton);
        this.btnGold.setPressedActionEnabled(false);

        this.btnNews = this.customButton("btnNews", LobbyScene.BTN_THONGBAO, pBotButton);
        this.btnGiftCode = this.customButton("btnGiftCode", LobbyScene.BTN_GUI_GIFTCODE, pBotButton);

        this.btnGold.hot = this.getControl("hot", this.btnGold);
        this.btnGold.hot.setVisible(false);
        this.btnGold.hot.setLocalZOrder(100);

        this.btnEvent = this.customButton("pEventButton", LobbyScene.BTN_EVENT, pBotButton);
        this.btnEvent.setPressedActionEnabled(false);

        this.reloadPositionButtonBottom();
    },

    reloadPositionButtonBottom: function () {
        var startX;
        var width;
        var pBotButton = this.getControl("bot");
        if (event.isInMainEvent()) {
            width = pBotButton.getContentSize().width * 3 / 4;
            startX = pBotButton.getContentSize().width / 4;
            this.btnEvent.setVisible(true);
        } else {
            startX = 0;
            width = pBotButton.getContentSize().width;
            this.btnEvent.setVisible(false);
        }
        var pad = width / 4;
        var count = 0;
        this.btnHotNews.setPositionX(startX + pad * count);
        count++;
        this.btnNews.setPositionX(startX + pad * count);
        count++;
        this.btnGiftCode.setPositionX(startX + pad * count);
        count++;
        this.btnStorage.setPositionX(startX + pad * count);
        count++;
        this.btnGold.setPositionX(startX + pad * count);
    },

    initTopLeft: function () {
        var pLeftTop = this.getControl("pLeftTop");
        this.logo = this.getControl("logo", pLeftTop);
        this.logo.setScale(0.75);

        this.initUserInfo();

        //cheat old exp
        this.pCheatOldExp =  this.getControl("pCheatOldExp", pLeftTop);
        this.pCheatOldExp.setVisible(false);
        var txtOldExp = this.getControl("txtOldExp", this.pCheatOldExp);
        var btnCheatOldExp = this.getControl("btnCheat", this.pCheatOldExp);
        btnCheatOldExp.addTouchEventListener(function(btn, type){
            if (type == ccui.Widget.TOUCH_ENDED){
                var oldExp = parseInt(txtOldExp.getString());
                txtOldExp.setString("");
                if (!isNaN(oldExp)){
                    var pk = new CmdSendCheatOldExp();
                    pk.putData(oldExp);
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();
                }
            }
        }, this);
    },

    initCenterLeft: function () {
        var pLeftCenter = this.getControl("pLeftCenter");
        this.pLeftCenter = pLeftCenter;
        this.btnShare = this.customButton("btnShare", LobbyScene.BTN_SHARE, pLeftCenter);

        this.pButton = this.getControl("pButton", pLeftCenter);
        LobbyButtonManager.getInstance().setPButton(this.pButton);
    },

    initUserInfo: function () {
        var pAvatar = this.getControl("pLeftTop");
        // pAvatar = pBotButton;

        this.btnGoldSmall = this.customButton("btnGold", LobbyScene.BTN_DOIVANG, pAvatar);
        this.btnGoldSmall.setPressedActionEnabled(false);
        this.btnG = this.customButton("btnG", LobbyScene.BTN_NAPG, pAvatar);
        this.btnG.setPressedActionEnabled(false);
        this.btnDiamond = this.customButton("btnDiamond", LobbyScene.BTN_BUY_DIAMOND, pAvatar);
        this.btnDiamond.setPressedActionEnabled(false);
        this.btnDiamond.setTouchEnabled(false);

        var btnAvatar = this.customButton("btnAvatar", LobbyScene.BTN_AVATAR, pAvatar, pAvatar);
        btnAvatar.setPressedActionEnabled(false);
        this.btnAvatar = btnAvatar;

        var bgAvatar = this.getControl("bgAvatar", pAvatar);
        this._uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");////engine.UIAvatar.create("Common/defaultAvatar.png");
        var size = bgAvatar.getContentSize();
        this._uiAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        bgAvatar.addChild(this._uiAvatar, 0);
        this._uiAvatar.setScale(0.77);

        this.defaultFrame = this.getControl("border", bgAvatar);
        this.defaultFrame.setLocalZOrder(1);
        this.avatarFrame = new UIAvatarFrame();
        this.avatarFrame.setPosition(cc.p(size.width / 2, size.height / 2));
        bgAvatar.addChild(this.avatarFrame, 2);
        this.avatarFrame.setScale(0.39);

        var vipImg = this.getControl("imgVip", pAvatar);
        vipImg.setVisible(false);
        this.imgVip = ccui.Scale9Sprite.create(NewVipManager.getIconVip(1));
        vipImg.getParent().addChild(this.imgVip);
        this.imgVip.setPosition(vipImg.getPosition());
        this.imgVip2 = vipImg;
        this.imgVip2.ignoreContentAdaptWithSize(true);

        this._uiName = this.getControl("name", pAvatar);
        this._uiCoin = this.getControl("xu", this.btnG);
        this._uiBean = this.getControl("gold", this.btnGoldSmall);
        this._uiDiamond = this.getControl("diamond", this.btnDiamond);
    },

    initTopRight: function () {
        var pRightTop = this.getControl("pRightTop");

        this.btnCamera = this.customButton("btnCamera", LobbyScene.BTN_SHARE, pRightTop);
        this.notifyCapture = this.getControl("notify", pRightTop);
        this.notifyCapture.setVisible(false);
        this.notifyCapture.pos = this.notifyCapture.getPosition();

        this.notifyCapture.img1 = this.getControl("img1", this.notifyCapture);
        this.notifyCapture.img1.pos = this.notifyCapture.img1.getPosition();

        this.notifyCapture.img2 = this.getControl("img2", this.notifyCapture);
        this.notifyCapture.img2.pos = this.notifyCapture.img2.getPosition();

        this.btnSupport = this.customButton("btnSupport", LobbyScene.BTN_SUPPORT, pRightTop);
        this.btnSetting = this.customButton("btnSetting", LobbyScene.BTN_SETTING, pRightTop);
    },

    waitEffectOneElement: function (parent, element, distanceX, distanceY) {
        var ret = this.getControl(element, parent);
        this.resetDefaultPosition(ret);
        if (distanceY != 0)
            ret.setPositionY(ret.getPositionY() + distanceY);
        if (distanceX != 0)
            ret.setPositionX(ret.getPositionX() + distanceX);
    },

    defaultPosition: function () {
        var ret;
        var pRightButton = this.getControl("pRightButton");
        var pLeftTop = this.getControl("pLeftTop");
        var pRightTop = this.getControl("pRightTop");
        var pBot = this.getControl("bot");
        var pLeftRank = this.getControl("pLeftRank");

        ret = this.getControl("npc");
        ret.setOpacity(255);

        // TOP
        this.waitEffectOneElement(pRightTop, "btnCamera", 0, 0);
        this.waitEffectOneElement(pRightTop, "btnSupport", 0, 0);

        // LEFT_TOP
        this.waitEffectOneElement(pLeftTop, "logo", 0, 0);
        this.waitEffectOneElement(pLeftTop, "bgAvatar", 0, 0);
        this.waitEffectOneElement(pLeftTop, "btnAvatar", 0, 0);
        this.waitEffectOneElement(pLeftTop, "bgName", 0, 0);
        this.waitEffectOneElement(pLeftTop, "name", 0, 0);
        this.waitEffectOneElement(pLeftTop, "btnG", 0, 0);
        this.waitEffectOneElement(pLeftTop, "btnGold", 0, 0);
        // this.waitEffectOneElement(pLeftTop, "imgVip", 0, 150);
        this.resetDefaultPosition(this.imgVip);
        this.imgVip.setPositionY(this.imgVip.getPositionY() + 0);

        // BOT
        this.waitEffectOneElement(this._layout, "bar", 0, -0);
        this.waitEffectOneElement(pBot, "btnSetting", 0, -0);
        this.waitEffectOneElement(pBot, "btnDoivang", 0, -0);
        this.waitEffectOneElement(pBot, "btnGiftCode", 0, -0);
        this.waitEffectOneElement(pBot, "btnNews", 0, -0);
        this.waitEffectOneElement(pBot, "btnHotNews", 0, -0);

        //CENTER RIGHT
        this.waitEffectOneElement(pRightButton, "btnChoingay", 0, 0);
        this.waitEffectOneElement(pRightButton, "btnChonban", 0, 0);
        this.waitEffectOneElement(pRightButton, "btnVip", 0, 0);
        this.waitEffectOneElement(pRightButton, "btnRank", 0, 0);

        // LEFT
        var pLeftCenter = this.getControl("pLeftCenter");

    },

    waitEffect: function () {
        var ret;
        var pRightButton = this.getControl("pRightButton");
        var pLeftTop = this.getControl("pLeftTop");
        var pRightTop = this.getControl("pRightTop");
        var pBot = this.getControl("bot");
        var pLeftRank = this.getControl("pLeftRank");

        ret = this.getControl("npc");
        ret.setOpacity(0);

        // TOP
        this.waitEffectOneElement(pRightTop, "btnCamera", 0, 150);
        this.waitEffectOneElement(pRightTop, "btnSupport", 0, 150);

        // LEFT_TOP
        this.waitEffectOneElement(pLeftTop, "logo", 0, 150);
        this.waitEffectOneElement(pLeftTop, "bgAvatar", 0, 150);
        this.waitEffectOneElement(pLeftTop, "btnAvatar", 0, 150);
        this.waitEffectOneElement(pLeftTop, "bgName", 0, 150);
        this.waitEffectOneElement(pLeftTop, "name", 0, 150);
        this.waitEffectOneElement(pLeftTop, "btnG", 0, 150);
        this.waitEffectOneElement(pLeftTop, "btnGold", 0, 150);
        // this.waitEffectOneElement(pLeftTop, "imgVip", 0, 150);
        this.resetDefaultPosition(this.imgVip);
        this.imgVip.setPositionY(this.imgVip.getPositionY() + 150);

        // BOT
        this.waitEffectOneElement(this._layout, "bar", 0, -150);
        this.waitEffectOneElement(pBot, "btnSetting", 0, -150);
        this.waitEffectOneElement(pBot, "btnDoivang", 0, -150);
        this.waitEffectOneElement(pBot, "btnGiftCode", 0, -150);
        this.waitEffectOneElement(pBot, "btnNews", 0, -150);
        this.waitEffectOneElement(pBot, "btnHotNews", 0, -150);

        //CENTER RIGHT
        this.waitEffectOneElement(pRightButton, "btnChoingay", 400, 0);
        this.waitEffectOneElement(pRightButton, "btnChonban", 400, 0);
        this.waitEffectOneElement(pRightButton, "btnVip", 400, 0);
        this.waitEffectOneElement(pRightButton, "btnRank", 400, 0);

        // LEFT
        var pLeftCenter = this.getControl("pLeftCenter");
    },

    effect: function () {
        var time = 0.7;

        var ret;
        var pRightButton = this.getControl("pRightButton");
        var pLeftTop = this.getControl("pLeftTop");
        var pRightTop = this.getControl("pRightTop");
        var pLeftRank = this.getControl("pLeftRank");
        var pBot = this.getControl("bot");
        var pLeftCenter = this.getControl("pLeftCenter");

        ret = this.getControl("npc");
        ret.runAction(new cc.Sequence(new cc.DelayTime(time), new cc.FadeIn(0.5)));

        // TOP - EFFECT
        var timeTop = 0.3;
        ret = this.getControl("logo", pLeftTop);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, -150)))));

        ret = this.getControl("btnAvatar", pLeftTop);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, -150)))));
        ret = this.getControl("bgAvatar", pLeftTop);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, -150)))));
        ret = this.getControl("bgName", pLeftTop);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, -150)))));
        ret = this.imgVip;
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, -150)))));
        ret = this.getControl("name", pLeftTop);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, -150)))));

        timeTop += 0.1;
        ret = this.getControl("btnGold", pLeftTop);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, -150)))));

        timeTop += 0.1;
        ret = this.getControl("btnG", pLeftTop);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, -150)))));

        // TOP RIGHT
        timeTop += 0.1;
        ret = this.getControl("btnCamera", pRightTop);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, -150)))));

        timeTop += 0.1;
        ret = this.getControl("btnSupport", pRightTop);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, -150)))));

        // BOT - EFFECT
        timeTop = 0;
        ret = this.getControl("bar");
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), cc.moveBy(time, cc.p(0, 150))));

        timeTop += 0.1;
        ret = this.getControl("btnHotNews", pBot);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, 150)))));

        timeTop += 0.1;
        ret = this.getControl("btnNews", pBot);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, 150)))));

        timeTop += 0.1;
        ret = this.getControl("btnGiftCode", pBot);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, 150)))));

        timeTop += 0.1;
        ret = this.getControl("btnSetting", pBot);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, 150)))));

        timeTop += 0.1;
        ret = this.getControl("btnDoivang", pBot);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(0, 150)))));

        // LEFT - EFFECT
        timeTop += 0.2;
        ret = this.getControl("btnShare", pLeftCenter);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(400, 0)))));

        // RIGHT - EFFECT
        timeTop = 0.7;
        ret = this.getControl("btnChoingay", pRightButton);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(-400, 0)))));

        timeTop += 0.1;
        ret = this.getControl("btnChonban", pRightButton);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(-400, 0)))));

        timeTop += 0.1;
        ret = this.getControl("btnVip", pRightButton);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(-400, 0)))));

        timeTop += 0.1;
        ret = this.getControl("btnRank", pRightButton);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(-400, 0)))));

        setTimeout(this.doFinishEffect.bind(this), 1000);
    },

    loadAnimation: function () {
        this.notifyCapture.setVisible(false);

        this.createAnim(this.logo, "LogoSmall");

        var effNPC = this.createAnim(this.npc, "Girl");
        effNPC.setPosition(effNPC.getPosition().x - 300, effNPC.getPosition().y + 280);
        var effect = this.createAnim(this.btnQuickPlay, "Choingay");
        effect.setScale(0.71);
        effect = this.createAnim(this.btnChooseRoom, "Chonban");
        effect.setScale(0.71);
        effect = this.createAnim(this.btnVip, "bt_vip_xephang");
        effect.setScale(0.71);
        effect = this.createAnim(this.btnRank, "bt_vip_xephang");
        effect.getAnimation().gotoAndPlay("2", -1, -1, 0);
        effect.setScale(0.71);
        effect = this.createAnim(this.btnGold, "shopwithtag");
        effect.setScale(0.71);
        effect.setPosition(effect.getPositionX() - 6, effect.getPositionY() + 5);

        effect = this.createAnim(this.btnGoldSmall, "BtnCoin");
        effect.getAnimation().gotoAndPlay("2", -1, -1, 0);
        effect.setPositionX(this.btnGoldSmall.getChildByName("icon").getPositionX());
        effect.setScale(this.btnGoldSmall.getChildByName("icon").getScale() * 0.95);

        effect = this.createAnim(this.btnG, "BtnCoin");
        effect.getAnimation().gotoAndPlay("1", -1, -1, 0);
        effect.setPositionX(this.btnG.getChildByName("icon").getPositionX());
        effect.setScale(this.btnG.getChildByName("icon").getScale() * 0.95);

        for (var i = 0; i < this.arPanelFW.length; i++) {
            var fw = db.DBCCFactory.getInstance().buildArmatureNode("firework" + (i + 1));
            this.arPanelFW[i].removeAllChildren();
        }
        this.countTimeFirework = 0;
        this.genTimeFirework = Math.random() * 2;
    },

    genFireWork: function (dt) {
        this.countTimeFirework = this.countTimeFirework + dt;
        if (this.countTimeFirework > this.genTimeFirework) {
            var randomId = (Math.floor(Math.random() * 3) + 1);
            var timeDelay = 0;
            // randomId = 3;
            var fw = db.DBCCFactory.getInstance().buildArmatureNode("firework" + randomId);
            if (randomId == 1) {
                timeDelay = 0.9;
            }
            else if (randomId == 2) {
                timeDelay = 0.7;
            }
            else {
                timeDelay = 1.2;
            }
            fw.getAnimation().gotoAndPlay("1", -1, -1, 0);
            fw.setPosition(cc.p(this.panelSnow.getContentSize().width * Math.random() * 0.8, this.panelSnow.getContentSize().height * Math.random()));
            fw.runAction(cc.sequence(cc.delayTime(timeDelay), cc.fadeOut(0.3), cc.removeSelf()));
            this.panelSnow.addChild(fw);
            this.countTimeFirework = 0;
            this.genTimeFirework = 0.8 + Math.random() * 0.4;
        }
    },

    createAnim: function (control, anim) {
        if (control === undefined || control == null || anim === undefined || anim == "") return null;

        if (control.anim) {
            control.removeChild(control.anim);
            control.anim = null;
        }

        var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim);
        if (eff) {
            control.addChild(eff);
            eff.setPosition(control.getContentSize().width / 2, control.getContentSize().height / 2);
            eff.getAnimation().gotoAndPlay("1", -1, -1, 0);
            control.anim = eff;
        }
        return eff;
    },

    onUpdateGUI: function (data) {
        if (this._uiAvatar && this._uiName && this._uiBean && this._uiCoin) {
            try {
                this._uiAvatar.asyncExecuteWithUrl(GameData.getInstance().userData.zName, GameData.getInstance().userData.avatar);
            } catch (e) {

            }
            this.setLabelText(GameData.getInstance().userData.displayName, this._uiName);
            this._uiCoin.setString(StringUtility.standartNumber(GameData.getInstance().userData.coin));
            if (!StorageManager.getInstance().waitDiamondNewItem)
                this._uiDiamond.setString(StringUtility.standartNumber(GameData.getInstance().userData.diamond));
            else StorageManager.getInstance().waitDiamondNewItem = false;
        }

        if (this.avatarFrame){
            this.avatarFrame.reload();
            this.defaultFrame.setVisible(!this.avatarFrame.isShow());
        }

        var arrayBonus = gamedata.gameConfig.getMaxShopBonus();
        this.btnGold.hot.setVisible(arrayBonus.length > 0 || event.promoTicket > 0);

        if (gamedata.userData.bean >= ChanelConfig.instance().chanelConfig[0].minGold) {
            this.onEffectSuggestMoney(false);
        }

        hotNews.requestNewDay();
        hotNews.showNewsButton(this.btnHotNews);

        this.updateMission();
        this.updateVipInfo();
    },

    updateToCurrentData: function () {
        this.updateGold(gamedata.getUserGold());
        this.updateG(gamedata.getUserCoin());
        this.updateDiamond(gamedata.getUserDiamond());
        this.onUpdateGUI();
    },

    getGold: function () {
        return this._uiBean.gold;
    },

    getDiamond: function () {
        return this._uiDiamond.diamond;
    },

    getG: function () {
        return this._uiCoin.g;
    },

    updateGold: function (gold) {
        this._uiBean.gold = gold;
        if (this._uiBean) this._uiBean.setString(StringUtility.formatNumberSymbol(this._uiBean.gold));
    },

    updateDiamond: function (diamond) {
        this._uiDiamond.diamond = diamond;
        if (this._uiDiamond) this._uiDiamond.setString(StringUtility.pointNumber(this._uiDiamond.diamond));
    },

    updateG: function (g) {
        this._uiCoin.g = g;
        if (this._uiCoin) this._uiCoin.setString(StringUtility.pointNumber(this._uiCoin.g));
    },

    doFinishEffect: function () {

        var cur = sceneMgr.getRunningScene().getMainLayer();
        if (!(cur instanceof LobbyScene)) return;

        this.onCheckMoney();

        event.showButtonEvent(this.btnEvent);
        event.showHideButtonEventInGame();

        CheckLogic.checkCaptureInBoard();
        gamedata.inLobby = true;
        this.count = 17;

        PersonalInfoGUI.checkOpenGuiFirstTime();
    },

    onCheckMoney: function () {
        if (!gamedata.checkEnablePayment()) return;

        if (gamedata.giftIndex > 0) {
            gamedata.showSupportStartup();
        } else {
            if (gamedata.checkSupportBean()) {
                this.onEffectSuggestMoney();

                if (gamedata.voteAppEnable) {
                    var countShowVote = cc.sys.localStorage.getItem("vote_app_bonus_count");
                    if (countShowVote === undefined || countShowVote == null || countShowVote == "") {
                        countShowVote = 0;
                    }
                    countShowVote = parseInt(countShowVote);
                    if (isNaN(countShowVote)) countShowVote = 0;

                    if (countShowVote < 3) {
                        sceneMgr.openGUI(VoteAppGUI.className, LobbyScene.GUI_VOTE_APP, LobbyScene.GUI_VOTE_APP);
                    }
                }
            }
        }
    },

    onEffectSuggestMoney: function (visible) {
        if (visible === undefined) visible = true;

        this.notifyCapture.setVisible(false);
        // this.btnMoiban.img.setVisible(false);

        if (visible) {
            var today = new Date();
            var sDay = today.toISOString().substring(0, 10);
            var cCaptureDay = cc.sys.localStorage.getItem("capture_success_day");
            if (cCaptureDay === undefined || cCaptureDay == null) cCaptureDay = "";

            if (sDay != cCaptureDay) {
                this.notifyCapture.setVisible(!gamedata.isPortal() && cc.sys.isNative && !gamedata.checkDisableSocialViral());

                this.notifyCapture.img1.setPositionY(this.notifyCapture.img1.pos.y + 100);
                this.notifyCapture.img2.setPositionY(this.notifyCapture.img2.pos.y + 100);

                this.notifyCapture.setPositionX(this.notifyCapture.pos.x + 300);
                this.notifyCapture.setOpacity(0);
                this.notifyCapture.runAction(cc.sequence(cc.spawn(cc.fadeIn(0.5), new cc.EaseBackOut(cc.moveTo(0.5, this.notifyCapture.pos))), cc.callFunc(this.onMoneyDrop.bind(this))));
            }

            var cInviteDay = cc.sys.localStorage.getItem("invite_success_day_" + gamedata.userData.uID);
            if (cInviteDay === undefined || cInviteDay == null) cInviteDay = "";

            if (sDay != cInviteDay) {
                // this.btnMoiban.img.setVisible(true);
                //
                // this.btnMoiban.img.runAction(cc.repeatForever(cc.sequence(cc.spawn(cc.scaleTo(1, 2), cc.fadeOut(1)), cc.callFunc(function () {
                //     this.setScale(1);
                //     this.setOpacity(255);
                // }.bind(this.btnMoiban.img)))));
            }
        }
    },

    onMoneyDrop: function () {
        this.notifyCapture.img1.runAction(new cc.EaseBackOut(cc.moveTo(0.5, this.notifyCapture.img1.pos)));
        this.notifyCapture.img2.runAction(cc.sequence(cc.delayTime(0.25), new cc.EaseBackOut(cc.moveTo(0.5, this.notifyCapture.img2.pos))));

        this.notifyCapture.runAction(cc.sequence(cc.delayTime(5), cc.fadeOut(0.5), cc.hide()));
    },

    onUserLoginSuccess: function () {
        this.isRequestTop = false;
    },

    updateItem: function (item) {
        cc.log("UPDATE ITEM " + item);
        var pBot = this.getControl("bot");
        var ret = this.getControl("panelItem", pBot);
        var oldItem = ret.getChildByTag(10);
        if (oldItem) {
            oldItem.removeFromParent(true);
        }
        if (item) {
            cc.log("ADD ITEM ");
            ret.addChild(item);
            item.setTag(10);
        }
    },

    onUpdateBtnRank: function () {
        if (Config.ENABLE_TESTING_NEW_RANK) {
            return;
        }
        this.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function () {
                if (NewRankData.getOpenResultLastWeek()) {
                    this.btnRank.hot.setVisible(true);
                }
                else{
                    this.btnRank.hot.setVisible(false);
                    if (StorageManager.getInstance().showUnlockItemRank()){
                        //show unlock item
                    }
                }
                if (NewRankData.isEnoughLevelJoinRank) {
                    var pos = this.btnRank.getWorldPosition();
                    pos.x -= 60;
                    pos.y -= 75;
                    var text = localized("NEW_RANK_HAS_OPENED");
                    TooltipFloat.makeTooltip(TooltipFloat.LONG, text, pos, TooltipFloat.SHOW_UP_TYPE_0, 15);
                    NewRankData.isEnoughLevelJoinRank = false;
                }
            }.bind(this))
        ));
    },

    onUpdateBtnRankCallFunc: function (cupChange) {
        this.btnRank.hot.setVisible(true);
        var dataRank = NewRankData.getInstance().getCurRankInfo();
        var curRank = dataRank.rank;
        var oldCup = NewRankData.getInstance().getNumberOldCup();
        var oldRank = NewRankData.getRankByCup(oldCup);
        cc.log("onUpdateBtnRankCallFunc: ", curRank, oldRank, dataRank.rankPoint, oldCup);

        if (oldRank - curRank !== 0) {
            this.effectChangeLevelRank(-cupChange);
        }
    },

    effectChangeLevelRank: function (positionChange) {
        var timeDelay1 = 0.5;
        var timeMove = 0.7;
        var pHeight = this.btnRank.pArrow.getContentSize().height;
        var btnWidth = this.btnRank.getContentSize().width / 2;
        var actionMove = cc.moveBy(timeMove, 0, pHeight * 2);
        var spriteName, posY, anchorY, actionRun;
        if (positionChange > 0) { // bi tut hang
            spriteName = "#iconDownLevel.png";
            posY = pHeight;
            anchorY = 0;
            actionRun = actionMove.reverse();
        } else {
            spriteName = "#iconUpLevel.png";
            posY = 0;
            anchorY = 1;
            actionRun = actionMove;
        }
        for (var i = 0; i < 5; i++) {
            var iconDown = new cc.Sprite(spriteName);
            iconDown.setAnchorPoint(0.5, anchorY);
            iconDown.setPositionY(posY);
            iconDown.setScale(0.7);
            iconDown.setPositionX(this.btnRank.pArrow.getContentSize().width/6 * (i + 1));
            this.btnRank.pArrow.addChild(iconDown);
            iconDown.runAction(cc.sequence(cc.delayTime(timeDelay1 + 0.2 * i), actionRun.clone(),
                cc.fadeOut(0.5), cc.removeSelf()));
        }
    },

    effectGold: function (goldChange, pStart) {
        if (!goldChange) return;
        var pEnd = this._uiBean.getWorldPosition();

        effectMgr.flyCoinEffect(sceneMgr.layerGUI, goldChange, 500000, pStart, pEnd);
        if (this._uiBean)
            effectMgr.runLabelPoint(this._uiBean, (gamedata.userData.bean - goldChange), gamedata.userData.bean, 1.5, null, EffectMgr.LABEL_RUN_NUMBER);
    },

    effectDiamond: function(diamondChange, pStart){
        if (!diamondChange) return;
        var pEnd = this.btnDiamond.convertToWorldSpace(this.btnDiamond.getChildByName("icon").getPosition());

        effectMgr.flyItemEffect(sceneMgr.layerGUI, "Lobby/LobbyGUI/iconDiamond.png", diamondChange, pStart, pEnd, 0, true, false);
        if (this._uiDiamond)
            effectMgr.runLabelPoint(this._uiDiamond, (gamedata.userData.diamond - diamondChange), gamedata.userData.diamond, 1.5);
    },

    getGoldIconPosition: function(){
        return this.btnGoldSmall.convertToWorldSpace(this.btnGoldSmall.getChildByName("icon").getPosition());
    },

    getCoinIconPosition: function(){
        return this.btnG.convertToWorldSpace(this.btnG.getChildByName("icon").getPosition());
    },

    getDiamondIconPosition: function(){
        return this.btnDiamond.convertToWorldSpace(this.btnDiamond.getChildByName("icon").getPosition());
    },

    getVipButtonPosition: function(){
        return this.btnVip.getParent().convertToWorldSpace(this.btnVip.getPosition());
    },

    getRankButtonPosition: function(){
        return this.btnRank.getParent().convertToWorldSpace(this.btnRank.getPosition());
    },

    getStorageButtonPosition: function(){
        return this.btnStorage.getParent().convertToWorldSpace(this.btnStorage.getPosition());
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case LobbyScene.BTN_QUIT: {
                this.onBack();
                break;
            }
            case LobbyScene.BTN_CHONBAN: {
                if (Config.ENABLE_CHEAT) {
                    eventTet.sendReset();
                }
                sceneMgr.openScene(ChooseRoomScene.className);
                break;
            }
            case LobbyScene.BTN_AVATAR: {
                sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO).setInfo(gamedata.userData);
                break;
            }
            case LobbyScene.BTN_CHOINGAY: {
                if (CheckLogic.checkQuickPlay()) {
                    var pk = new CmdSendQuickPlay();
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();

                    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                } else {
                    if (Math.floor(gamedata.timeSupport) > 0) {
                        var pk = new CmdSendGetSupportBean();
                        GameClient.getInstance().sendPacket(pk);
                        gamedata.showSupportTime = true;
                        pk.clean();
                    } else {
                        if (gamedata.checkEnablePayment()) {
                            var msg = LocalizedString.to("QUESTION_CHANGE_GOLD");
                            sceneMgr.showChangeGoldDialog(msg, this, function (buttonId) {
                                if (buttonId == Dialog.BTN_OK) {
                                    gamedata.openShop();
                                }
                            });
                        } else {
                            sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                        }
                    }
                }
                break;
            }
            case LobbyScene.BTN_THONGBAO: {
                NativeBridge.openWebView(gamedata.urlnews);
                break;
            }
            case LobbyScene.BTN_HOTRO: {
                if (gamedata.isAppSupport) {
                    NativeBridge.openHotro(gamedata.support, gamedata.userData.zName);
                } else {
                    NativeBridge.openWebView(gamedata.support);
                }
                break;
            }
            case LobbyScene.BTN_SETTING: {
                sceneMgr.openGUI(SettingGUI.className, LobbyScene.GUI_SETTING, LobbyScene.GUI_SETTING);
                break;
            }
            case LobbyScene.BTN_VIP: {
                NewVipManager.openVip();
                break;
            }
            case LobbyScene.BTN_DOIVANG: {
                gamedata.openShop();
                break;
            }
            case LobbyScene.BTN_NAPG: {
                gamedata.openNapG();
                break;
            }
            case LobbyScene.BTN_GUI_GIFTCODE: {
                this.showGiftCode();
                break;
            }
            case LobbyScene.BTN_EVENT: {
                event.openEvent();
                break;
            }
            case LobbyScene.BTN_HOT_NEWS: {
                hotNews.show();
                break;
            }
            case LobbyScene.BTN_SHARE: {
                this.notifyCapture.setVisible(false);
                // custom gui rieng
                var gui = sceneMgr.openGUI(GUIShareFace.className, GUIShareFace.tag, GUIShareFace.tag);
                gui.addImage(GUIShareFace.getContentShare());
                break;
            }
            case LobbyScene.BTN_SUPPORT: {
                var gui = sceneMgr.openGUI(GUISupportInfo.className, GUISupportInfo.tag, GUISupportInfo.tag, false).showGUI(0, gamedata.numSupport);
                break;
            }
            case LobbyScene.BTN_RANK: {
                this.btnRank.hot.setVisible(false);
                NewRankData.openTableRank();
                break;
            }
            case LobbyScene.BTN_STORAGE: {
                StorageManager.getInstance().openStorageScene();
                break;
            }
            default:
                break;
        }

    },

    sharePhoto: function (isShareImage, image) {
        if (!gamedata.checkOldNativeVersion()) {
            var imgPath = sceneMgr.takeScreenShot(isShareImage, image);
            setTimeout(function () {
                fr.facebook.shareScreenShoot(imgPath, function (result) {
                    var message = "";
                    if (result == -1) {
                        message = localized("INSTALL_FACEBOOK");
                    } else if (result == 1) {
                        message = localized("NOT_SHARE");
                    } else if (result == 0) {
                        message = localized("FACEBOOK_DELAY");

                        var pk = new CmdSendTangGold();
                        GameClient.getInstance().sendPacket(pk);
                        pk.clean();
                    } else {
                        message = localized("FACEBOOK_ERROR");
                    }
                    Toast.makeToast(Toast.SHORT, message);
                });
            }, 500);
        } else {
            this.captureSuccess = function (social, jdata) {
                var message = "";
                var dom = StringUtility.parseJSON(jdata);
                if (dom["error"] == -1) {
                    message = localized("INSTALL_FACEBOOK");
                } else if (dom["error"] == 1) {
                    message = localized("NOT_SHARE");
                } else if (dom["error"] == 0) {
                    message = localized("FACEBOOK_DELAY");

                    var pk = new CmdSendTangGold();
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();
                } else {
                    message = localized("FACEBOOK_ERROR");
                }
                Toast.makeToast(Toast.SHORT, message);


            }.bind(this);

            socialMgr.set(this, this.captureSuccess);
            socialMgr.shareImage2(isShareImage, image);
        }
    },

    showGiftCode: function () {
        sceneMgr.openGUI(GiftCodeScene.className, LobbyScene.GUI_GIFT_CODE, LobbyScene.GUI_GIFT_CODE);
    },

    doFireWork: function (fw, rect) {
        var fPlayFire = function (fw, rect) {
            fw.setPosition(cc.p(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height));
            fw.getAnimation().gotoAndPlay("1", -1, -1, 1);
        };
        var fBack = cc.callFunc(this.doFireWork.bind(this), fw, rect);
        var fDelay = cc.delayTime(Math.floor(Math.random() * 3.5) + 5);
        fw.runAction(cc.sequence(cc.show(), cc.callFunc(fPlayFire.bind(fw), fw, rect), fDelay, cc.hide(), fBack));
    },

    updateGiftCodes: function (datas) {
        var giftCode = sceneMgr.getGUI(LobbyScene.GUI_GIFT_CODE);
        if (giftCode != null && giftCode instanceof GiftCodeScene) {
            giftCode.onUpdateGiftCodes(datas);
        }
    },

    updateMission: function () {

    },

    updateVipInfo: function () {
        if (!Config.ENABLE_NEW_VIP) {
            return;
        }
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        this.pTooltipVip.setVisible(false);
        this.imgVip.setVisible(vipLevel > 0);
        var state = (NewVipManager.getInstance().getRemainTime() > 0) ? 0 : 1;
        this.imgVip.setState(state);
        this.bgTooltip.iconVip.setState(state);
        var texture = NewVipManager.getIconVip(vipLevel);
        // cc.log("updateVipInfo: ", texture, vipLevel);
        if (texture !== "" && vipLevel > 0) {
            try {
                this.imgVip2.loadTexture(texture);
                this.bgTooltip.iconVip2.loadTexture(texture);
                this.imgVip.initWithFile(texture);
                this.bgTooltip.iconVip.initWithFile(texture);
                this.imgVip.setContentSize(this.imgVip2.getContentSize());
                this.bgTooltip.iconVip.setContentSize(this.bgTooltip.iconVip2.getContentSize());
                this.imgVip2.setVisible(false);
                this.bgTooltip.iconVip2.setVisible(false);
            } catch (e) {
                this.imgVip.setVisible(false);
                this.bgTooltip.iconVip.setVisible(false);
                this.imgVip2.setVisible(true);
                this.bgTooltip.iconVip2.setVisible(true);
                this.imgVip2.loadTexture(texture);
                this.bgTooltip.iconVip2.loadTexture(texture);
            }
        }

        if (vipLevel === 0) {
            return;
        }

        this.pTooltipVip.stopAllActions();
        this.bgTooltip.stopAllActions();
        var distanceY = this.bgTooltip.getContentSize().height;
        this.pTooltipVip.setPosition(this.pTooltipVip.defaultPos);
        this.bgTooltip.setPosition(this.bgTooltip.defaultPos);
        this.pTooltipVip.setPositionY(this.pTooltipVip.defaultPos.y + distanceY);
        this.bgTooltip.setPositionY(this.bgTooltip.defaultPos.y - distanceY);
        var actionMoveBy = cc.moveBy(0.2, 0, distanceY);
        this.pTooltipVip.setVisible(true);
        var timeOff = 5;
        var timeOn = 5;
        var delayFirst = 1;
        this.pTooltipVip.runAction(cc.sequence(cc.delayTime(delayFirst), actionMoveBy.reverse(), cc.delayTime(timeOn), actionMoveBy.clone(), cc.delayTime(timeOff - delayFirst)).repeatForever());
        this.bgTooltip.runAction(cc.sequence(cc.delayTime(delayFirst), actionMoveBy.clone(), cc.delayTime(timeOn), actionMoveBy.clone().reverse(), cc.delayTime(timeOff - delayFirst)).repeatForever());

        this.bgTooltip.txtVip.setString(StringUtility.replaceAll(localized("VIP_NAME"), "@level", vipLevel));
        var remainVipTime = NewVipManager.getInstance().getRemainTime();
        this.bgTooltip.txtRemain.setVisible(remainVipTime > 0);
        this.bgTooltip.txtTimeRemain.setString(NewVipManager.getRemainTimeString(remainVipTime));
        var txtTemp = BaseLayer.createLabelText(this.bgTooltip.txtVip.getString());
        this.bgTooltip.txtRemain.setPositionX(this.bgTooltip.txtVip.getPositionX() + txtTemp.getContentSize().width + 5);
    },

    update: function (dt) {
        this.genFireWork(dt);
        NewVipManager.getInstance().updateTimeVip(dt);
        var remainTime = NewVipManager.getInstance().getRemainTime();
        this.bgTooltip.txtTimeRemain.setString(NewVipManager.getRemainTimeString(remainTime));
        offerManager.update();

        this.reloadPositionButtonBottom();
    },

    getPositionComponent: function (type) {
        switch (type) {
            case ShopSuccessData.TYPE_GOLD:
                return this.btnGoldSmall.convertToWorldSpace(cc.p(this.btnGoldSmall.getContentSize().width * 0.5, this.btnGoldSmall.getContentSize().height * 0.5));
            case ShopSuccessData.TYPE_VPOINT:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
            case ShopSuccessData.TYPE_HOUR_VIP:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
            case ShopSuccessData.TYPE_G:
                return this.btnG.convertToWorldSpace(cc.p(this.btnG.getContentSize().width * 0.5, this.btnG.getContentSize().height * 0.5));
            case ShopSuccessData.TYPE_ITEM:
                return this.btnStorage.convertToWorldSpace(cc.p(this.btnStorage.getContentSize().width * 0.5, this.btnStorage.getContentSize().height * 0.5));
            case ShopSuccessData.TYPE_TICKET:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
            case ShopSuccessData.TYPE_DIAMOND:
                return this._uiDiamond.convertToWorldSpace(cc.p(this._uiDiamond.getContentSize().width * 0.5, this._uiDiamond.getContentSize().height * 0.5));
        }
    },

    finishEffectShopSuccess: function () {
        var gui = sceneMgr.getGUIByClassName(GUIShopGoldSuccess.className);
        if (gui.checkShowNextPurchase()) {
            var gui = sceneMgr.openGUI(GUIShopGoldSuccess.className, GUIShopGoldSuccess.TAG, GUIShopGoldSuccess.TAG);
            gui.showNextPurchase();
        }
        else {
            this.updateToCurrentData();
        }
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable()) {
            return;
        }

        var message = gamedata.isPortal() ? LocalizedString.to("LOGOUT_GAME_TO_PORTAL") : LocalizedString.to("_ASKEXIT_");
        sceneMgr.showOkCancelDialog(message, this, function (btnID) {
            switch (btnID) {
                case 0: {
                    gamedata.endGame();
                }
            }
        });
    }
});

LobbyScene.className = "LobbyScene";

LobbyScene.BTN_CHOINGAY = 1;
LobbyScene.BTN_CHONBAN = 2;
LobbyScene.BTN_QUIT = 3;
LobbyScene.BTN_CAMERA = 4;
LobbyScene.BTN_THONGBAO = 5;
LobbyScene.BTN_MINIGAME = 6;
LobbyScene.BTN_VIP = 7;
LobbyScene.BTN_DOIVANG = 8;
LobbyScene.BTN_SETTING = 9;
LobbyScene.BTN_NAPG = 10;
LobbyScene.BTN_GIFTCODE = 11;
LobbyScene.BTN_MOIBAN = 12;
LobbyScene.BTN_AVATAR = 13;
LobbyScene.BTN_FORUM = 14;
LobbyScene.BTN_HOTRO = 15;
LobbyScene.BTN_SOUND = 16;
LobbyScene.BTN_LOGOUT = 17;
LobbyScene.GUI_GIFT_CODE = 19;
LobbyScene.BTN_GUI_GIFTCODE = 20;
LobbyScene.BTN_RANK = 21;
LobbyScene.BTN_MORE = 22;
LobbyScene.BTN_DAILYMISSION = 25;
LobbyScene.BTN_HELP_LOBBY = 26;
LobbyScene.BTN_CHEAT_SUB = 30;
LobbyScene.BTN_CHEAT_ADD = 31;
LobbyScene.BTN_CHEAT_SERVER = 32;
LobbyScene.BTN_EVENT = 50;
LobbyScene.BTN_OLDVERSION = 51;
LobbyScene.BTN_SOCCER = 52;
LobbyScene.BTN_ROULETE = 53;
LobbyScene.BTN_VIDEO_POKER = 54;
LobbyScene.BTN_SHARE = 55;
LobbyScene.BTN_SUPPORT = 56;
LobbyScene.BTN_OFFER = 57;
LobbyScene.BTN_STORAGE = 58;
LobbyScene.BTN_BUY_DIAMOND = 59;
LobbyScene.BTN_HOT_NEWS = 60;
LobbyScene.BTN_GUI_MISSION = 201;
LobbyScene.BTN_WORLD_CUP = 300;
LobbyScene.BTN_EVENT_IN_GAME = 61;
LobbyScene.BTN_RANK = 7000;

LobbyScene.GUI_INVITE = 401;
LobbyScene.GUI_USER_INFO = 402;
LobbyScene.GUI_PICK_FRIEND = 403;
LobbyScene.GUI_PANEL_MINIGAME = 404;
LobbyScene.GUI_SETTING = 405;
LobbyScene.GUI_EURO_EVENT = 406;
LobbyScene.GUI_VOTE_APP = 407;
LobbyScene.GUI_WEB_PAY_NOTIFY = 408;
LobbyScene.GUI_IAP_DAILY = 410;

LobbyScene.showTut = true;

//User Info Panel (new User Info GUI)
var UserInfoPanel = BaseLayer.extend({
    ctor: function() {
        this._super();

        this.bg = null;
        this.btnClose = null;
        this.btnSendMessage = null;
        this.btnPersonalInfo = null;
        this.btnStorage = null;

        this.btnTabInfo = null;
        this.btnTabInteract = null;
        this.tabs = {};
        this.tabButtons = {};

        this.displayName = null;
        this.zName = null;
        this.uID = null;
        this.bean = null;
        this.level = null;
        this.winCount = null;
        this.lostCount = null;
        this.version = null;

        this.defaultFrame = null;
        this.avatarBg = null;
        this.avatar = null;
        this.avatarFrame = null;

        this.pMedal = null;
        this.goldMedal = null;
        this.silverMedal = null;
        this.bronzeMedal = null;
        this.rankNotice = null;

        this.imgRank = null;
        this.txtRank = null;
        this.levelRank = null;

        this.tbInteract = null;
        this.cellSize = null;
        this.itemSize = null;
        this.numRow = null;

        //DATA
        this.selectedTab = -1;
        this.interactData = [];

        this.initWithBinaryFile("Lobby/UserInfoPanel.json");
    },

    /* region Base Flow */
    initGUI: function() {
        //main parts
        this.bg = this.getControl("bg");
        var pAvatar = this.getControl("pAvatar", this.bg);
        var pUserInfo = this.getControl("pUserInfo", this.bg);
        var tabBg = this.getControl("tabBg", this.bg);

        //buttons
        this.btnClose = this.customButton("btnClose", UserInfoPanel.BTN_ClOSE, this.bg);
        this.btnSendMessage = this.customButton("btnChat", UserInfoPanel.BTN_SEND_CHAT, this.bg);
        this.btnPersonalInfo = this.customButton("btnPersonalInfo", UserInfoPanel.BTN_PERSONAL_INFO, this.bg);
        this.btnStorage = this.customButton("btnStorage", UserInfoPanel.BTN_STORAGE, this.bg);
        this.version = this.getControl("version", this.bg);
        this.version.ignoreContentAdaptWithSize(true);

        //pAvatar
        this.defaultFrame = this.getControl("defaultFrame", pAvatar);
        this.avatarBg = this.getControl("avatarBg", pAvatar);
        this.avatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.avatar.setPosition(this.avatarBg.width/2, this.avatarBg.height/2);
        this.avatar.setScale(3.05);
        this.avatarBg.addChild(this.avatar);
        this.avatarFrame = new cc.Sprite();
        this.avatarFrame.setPosition(this.avatarBg.width/2, this.avatarBg.height/2);
        this.avatarFrame.setScale(1.5);
        this.avatarBg.addChild(this.avatarFrame);

        //pUserInfo
        this.displayName = this.getControl("username", pUserInfo);
        this.displayName.ignoreContentAdaptWithSize(true);
        this.zName = this.getControl("account", pUserInfo);
        this.zName.ignoreContentAdaptWithSize(true);
        this.uID = this.getControl("id", pUserInfo);
        this.uID.ignoreContentAdaptWithSize(true);
        this.bean = this.getControl("bean", pUserInfo);
        this.bean.ignoreContentAdaptWithSize(true);

        //tabs
        this.btnTabInfo = this.customButton("btnTabInfo", UserInfoPanel.BTN_TAB_INFO, tabBg);
        this.btnTabInfo.setZoomScale(0);
        this.tabButtons[UserInfoPanel.BTN_TAB_INFO] = this.btnTabInfo;
        this.btnTabInteract = this.customButton("btnTabInteract", UserInfoPanel.BTN_TAB_INTERACT, tabBg);
        this.btnTabInteract.setZoomScale(0);
        this.tabButtons[UserInfoPanel.BTN_TAB_INTERACT] = this.btnTabInteract;
        var tabInfo = this.tabs[UserInfoPanel.BTN_TAB_INFO] = this.getControl("pInfo", tabBg);
        var tabInteract = this.tabs[UserInfoPanel.BTN_TAB_INTERACT] = this.getControl("pInteract", tabBg);

        //info
        this.winCount = this.getControl("win", tabInfo);
        this.winCount.ignoreContentAdaptWithSize(true);
        this.lostCount = this.getControl("lose", tabInfo);
        this.lostCount.ignoreContentAdaptWithSize(true);
        this.level = this.getControl("level", this.getControl("pLevel", tabInfo));
        this.level.ignoreContentAdaptWithSize(true);

        this.imgRank = this.getControl("imgRank", tabInfo);
        this.imgRank.ignoreContentAdaptWithSize(true);
        this.levelRank = this.getControl("level", this.imgRank);
        this.levelRank.ignoreContentAdaptWithSize(true);
        this.txtRank = this.getControl("text", this.imgRank);
        this.txtRank.ignoreContentAdaptWithSize(true);
        this.pMedal = this.getControl("pMedal",tabInfo);
        this.rankNotice = this.getControl("rankNotice", tabInfo);
        this.rankNotice.ignoreContentAdaptWithSize(true);

        this.goldMedal = this.getControl("textGoldMedal", this.pMedal);
        this.goldMedal.ignoreContentAdaptWithSize(true);
        this.silverMedal = this.getControl("textSilverMedal", this.pMedal);
        this.silverMedal.ignoreContentAdaptWithSize(true);
        this.bronzeMedal = this.getControl("textBronzeMedal", this.pMedal);
        this.bronzeMedal.ignoreContentAdaptWithSize(true);

        //interact
        this.initTabInteract();
        this.tbInteract = new cc.TableView(this, tabInteract.getContentSize());
        this.tbInteract.setAnchorPoint(0, 0);
        this.tbInteract.setPosition(0, 0);
        tabInteract.addChild(this.tbInteract);
        this.tbInteract.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.tbInteract.setVerticalFillOrder(0);
        this.tbInteract.setDelegate(this);

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function() {
        this.setShowHideAnimate(this.bg, true);
        this.waitOpenStorage = false;
        this.canUseInteract = true;
    },

    onButtonRelease: function(button, id) {
        switch (id) {
            case UserInfoPanel.BTN_ClOSE:
                this.onBack();
                break;
            case UserInfoPanel.BTN_ADD_FRIEND:
                break;
            case UserInfoPanel.BTN_REMOVE_FRIEND:
                break;
            case UserInfoPanel.BTN_SEND_CHAT:
                if (gamedata.gameLogic){
                    for (var i = 0; i < gamedata.gameLogic.players.length; i++){
                        if (gamedata.gameLogic.players[i].ingame && gamedata.gameLogic.players[i].info && gamedata.gameLogic.players[i].info["uID"] == this._user.uID){
                            chatMgr.openChatGUIAtTab(this._user.uID, this._user.displayName);
                            this.onBack();
                            return;
                        }
                    }
                }
                Toast.makeToast(Toast.SHORT, "Người chơi này không còn ở trong bàn chơi.");
                break;
            case UserInfoPanel.BTN_PERSONAL_INFO:
                PersonalInfoGUI.openGUI();
                this.onBack();
                break;
            case UserInfoPanel.BTN_TAB_INFO:
            case UserInfoPanel.BTN_TAB_INTERACT:
                this.selectTab(id);
                break;
            case UserInfoPanel.BTN_STORAGE:
                if(!StorageManager.getInstance().checkEnableItem()){
                    return;
                }
                this.waitOpenStorage = true;

                this.onBack();
                break;
        }
    },

    onBack: function() {
        this.onClose();
    },

    onCloseDone: function() {
        this._super();
        if (this.waitOpenStorage) StorageManager.getInstance().openStorage();
    },
    /* endregion Base Flow */

    /* region Tabs Control */
    selectTab: function(id) {
        if (this.tabs[id] == null) id = UserInfoPanel.BTN_TAB_INFO;
        this.selectedTab = id;

        for (var i in this.tabs){
            this.tabs[i].setVisible(i == this.selectedTab);
            var img = this.getButtonImage(i);
            this.tabButtons[i].loadTextures(img, img, img);
        }
    },

    getButtonImage: function(id) {
        var str = "";
        switch(Number(id)) {
            case UserInfoPanel.BTN_TAB_INFO:
                str = "tabInfo";
                break;
            case UserInfoPanel.BTN_TAB_INTERACT:
                str = "tabInteract";
                break;
        }
        if (id != this.selectedTab)
            str += "Inactive";
        return "Lobby/UserInfoPanel/" + str + ".png";
    },
    /* endregion Tabs Control */

    /* region Tab Interact */
    initTabInteract: function() {
        var tabInteract = this.tabs[UserInfoPanel.BTN_TAB_INTERACT];
        var tbSize = tabInteract.getContentSize();
        this.numRow = UserInfoPanelInteractCell.NUM_ROW;
        this.itemSize = (tbSize.height - (UserInfoPanelInteractCell.PADDING * this.numRow * 2)) / this.numRow;
        this.cellSize = cc.size(UserInfoPanelInteractCell.PADDING * 2 + this.itemSize + UserInfoPanelInteractCell.MARGIN * 2, tbSize.height);
    },

    loadInteractData: function() {
        this.interactData = [];
        if (!StorageManager.getInstance().itemConfig) return;
        if (!StorageManager.getInstance().userItemInfo) return;
        var interactConfig = StorageManager.getInstance().itemConfig[StorageManager.TYPE_INTERACTION];
        var interactInfo = StorageManager.getInstance().userItemInfo[StorageManager.TYPE_INTERACTION];
        if (!interactConfig || !interactInfo) return;

        //id, num, condition{type, num}
        var availableInteract = [];
        var outOfNumInteract = [];
        var unavailableInteract = [];
        for (var interactId in interactConfig){
            var config = interactConfig[interactId];
            var info = interactInfo[interactId];
            var interact = {
                id: Number(interactId),
                num: 0,
                cond: null
            };
            if (info == null){
                interact.cond = {};
                if (NewVipManager.getInstance().getRealVipLevel() < config.vip) {
                    interact.cond = {
                        type: StorageManager.VIP_CONDITION,
                        num: config.vip
                    };
                    unavailableInteract.push(interact);
                }
                else if (gamedata.userData.level < config.level) {
                    interact.cond = {
                        type: StorageManager.LEVEL_CONDITION,
                        num: config.level
                    };
                    unavailableInteract.push(interact);
                }
            }
            else{
                interact.num = info[0].num;
                if (interact.num == 0) outOfNumInteract.push(interact);
                else availableInteract.push(interact);
            }
        }
        this.interactData = [].concat(availableInteract, outOfNumInteract, unavailableInteract);

        if (event.isInEvent(Event.MID_AUTUMN) && event.getEventById(Event.MID_AUTUMN).isFinishDownload) {
            var interact = {
                id: 1001,
                num: 1,
                cond: null
            };
            this.interactData.splice(0, 0, interact);
        }
    },

    tableCellAtIndex: function(table, idx) {
        var cell = table.dequeueCell();
        if (!cell) cell = new UserInfoPanelInteractCell(this.itemSize, this.cellSize, this.numRow, this);

        var interacts = [];
        for (var i = idx * this.numRow; i < this.interactData.length && i < (idx + 1) * this.numRow; i++)
            interacts.push(this.interactData[i]);

        cell.setData(interacts);
        return cell;
    },

    tableCellSizeForIndex: function() {
        return this.cellSize;
    },

    numberOfCellsInTableView: function() {
        return Math.ceil(this.interactData.length / this.numRow);
    },

    useInteract: function(index) {
        var interact = this.interactData[index];
        if (interact.id >= 1000) {
            // danh rieng cho Event
            midAutumn.clickSendSam(this._user.uID, this._user.avatar);
            return;
        }
        if (interact.cond){
            var mess = "Đạt @cond để sử dụng tương tác này.";
            var condStr = "";
            switch(interact.cond.type){
                case StorageManager.VIP_CONDITION:
                    condStr = "vip";
                    break;
                case StorageManager.LEVEL_CONDITION:
                    condStr = "level";
                    break;
            }
            mess = mess.replace("@cond", condStr + " " + interact.cond.num);
            Toast.makeToast(Toast.SHORT, mess);
        }
        else{
            if (interact.num != 0){
                if (this.canUseInteract) {
                    if (this._user.uID != gamedata.userData.uID && CheckLogic.checkInBoard()) {
                        var nChair = null;
                        for (var i = 0; i < gamedata.gameLogic.players.length; i++) {
                            if ((gamedata.gameLogic.players[i].info != null) && (this._user.uID == gamedata.gameLogic.players[i].info["uID"])) {
                                nChair = gamedata.gameLogic.players[i].chairInServer;
                                break;
                            }
                        }
                        if (nChair != null) {
                            StorageManager.getInstance().sendUseInteract(nChair, interact.id);
                        }
                    }
                    this.canUseInteract = false;
                    this.onBack();
                }
            }
            else{
                Toast.makeToast(Toast.SHORT, "Đã hết số lần sử dụng tương tác này.");
            }
        }
    },
    /* endregion Tab Interact */

    /* region Tab Info */
    setInfo: function(inf) {

        this._user = inf;
        if (!this._user.zName)
            this._user.zName = this._user.displayName;
        if (!this._user.uID)
            this._user.uID = this._user.uId;

        try{
            this.avatar.asyncExecuteWithUrl(this._user.uID, this._user.avatar);
            this.displayName.setString(this._user.displayName);
            this.zName.setString(this._user.zName);
            this.uID.setString(this._user.uID);
            this.bean.setString(StringUtility.pointNumber(this._user.bean) + "$");

            this.winCount.setString(StringUtility.pointNumber(this._user.winCount));
            this.lostCount.setString(StringUtility.pointNumber(this._user.lostCount));

            var avatarFramePath = null;
            if (this._user.uID == gamedata.userData.uID) {
                if (this._user.levelExp)
                    this.level.setString(gamedata.gameConfig.getLevelString(this._user.level, this._user.levelExp));
                else
                    this.level.setString(this._user.level);
                this.btnSendMessage.setVisible(false);
                this.btnPersonalInfo.setVisible(true);
                this.btnStorage.setVisible(true);
                avatarFramePath = StorageManager.getInstance().getUserAvatarFramePath();
            }
            else {
                this.level.setString(this._user.level);
                this.btnSendMessage.setVisible(CheckLogic.checkInBoard());
                this.btnPersonalInfo.setVisible(false);
                this.btnStorage.setVisible(false);

                if (StorageManager.getInstance().cacheOtherAvatarId[this._user.uID] != null)
                    avatarFramePath = StorageManager.getAvatarFramePath(StorageManager.getInstance().cacheOtherAvatarId[this._user.uID]);
                else
                    avatarFramePath = ""
            }
            if (avatarFramePath == null || avatarFramePath == ""){
                this.avatarFrame.setTexture(null);
                this.avatarFrame.setVisible(false);
                this.defaultFrame.setVisible(true);
            }
            else{
                this.avatarFrame.setTexture(avatarFramePath);
                this.avatarFrame.setVisible(true);
                this.defaultFrame.setVisible(false);
            }
        }
        catch(e) { cc.log(e); }

        try {
            this.setInfoRank();
        } catch(e) { cc.error(e); }

        try {
            this.version.setString(NativeBridge.getVersionString());
        } catch(e) {}

        //load interact data
        this.loadInteractData();
        this.tbInteract.reloadData();
        if (!CheckLogic.checkInBoard() || this._user.uID == gamedata.userData.uID){
            this.btnTabInteract.setVisible(false);
        }
        else{
            var userInBoard = false;
            if (gamedata.gameLogic){
                for (var i = 0; i < gamedata.gameLogic.players.length; i++){
                    if ((gamedata.gameLogic.players[i].info != null) && (this._user.uID == gamedata.gameLogic.players[i].info["uID"])) {
                        userInBoard = true;
                        break;
                    }
                }
            }
            this.btnTabInteract.setVisible(userInBoard);
        }
        this.selectTab(!this.btnTabInteract.isVisible() ? UserInfoPanel.BTN_TAB_INFO : UserInfoPanel.BTN_TAB_INTERACT);

    },

    setInfoRank: function() {
        var canJoinRank = this._user.level >= NewRankData.MIN_LEVEL_JOIN_RANK && !Config.ENABLE_TESTING_NEW_RANK && Config.ENABLE_NEW_RANK;
        this.rankNotice.setVisible(!canJoinRank);
        this.txtRank.setVisible(canJoinRank);
        this.pMedal.setVisible(canJoinRank);
        this.imgRank.setColor((canJoinRank) ? cc.color("#ffffff") : cc.color("#000000"));
        var conditionKey = (this._user.uID === gamedata.userData.uID) ? "NEW_RANK_MY_CONDITION" : "NEW_RANK_OTHER_CONDITION";
        if (Config.ENABLE_TESTING_NEW_RANK || !Config.ENABLE_NEW_RANK) conditionKey = "NEW_RANK_COMING_SOON";
        var conditionStr = StringUtility.replaceAll(localized(conditionKey), "@number", NewRankData.MIN_LEVEL_JOIN_RANK);
        this.rankNotice.setString(conditionStr);
        StringUtility.breakLabelToMultiLine(this.rankNotice, this.rankNotice.getParent().width - 80);
        if (!canJoinRank) {
            return;
        }

        var goldMedal = this._user.goldMedal;
        var silverMedal = this._user.silverMedal;
        var bronzeMedal = this._user.bronzeMedal;
        var rank = this._user.rank;
        if (this._user.uID === gamedata.userData.uID) {
            goldMedal = NewRankData.getInstance().getNumberGoldMedal();
            silverMedal = NewRankData.getInstance().getNumberSilverMedal() || 0;
            bronzeMedal = NewRankData.getInstance().getNumberBronzeMedal() || 0;
            rank = NewRankData.getInstance().getCurRankInfo()["rank"] || 0;
        }
        this.goldMedal.setString(StringUtility.pointNumber(goldMedal));
        this.silverMedal.setString(StringUtility.pointNumber(silverMedal));
        this.bronzeMedal.setString(StringUtility.pointNumber(bronzeMedal));
        this.txtRank.setString(NewRankData.getRankName(rank).toUpperCase());
        this.imgRank.loadTexture(NewRankData.getRankImg(rank), ccui.Widget.PLIST_TEXTURE);
        this.levelRank.loadTexture(NewRankData.getRankLevelImg(rank), ccui.Widget.PLIST_TEXTURE);
        this.levelRank.setVisible(rank < NewRankData.MAX_RANK);

        var oldAnim = this.imgRank.getChildByTag(50);
        if (oldAnim) {
            oldAnim.removeFromParent(true);
        }
        var animRank = db.DBCCFactory.getInstance().buildArmatureNode("Rank");
        if (animRank) {
            this.imgRank.addChild(animRank, 50, 50);
            var imgRankSize = this.imgRank.getContentSize();
            animRank.setPosition(imgRankSize.width / 2, imgRankSize.height / 2);
            var indexLevel = Math.floor(rank / 3) + 1;
            animRank.gotoAndPlay(indexLevel, 0, -1, 9999);
        }
    }
    /* endregion Tab Info */
});
UserInfoPanel.className = "UserInfoPanel";
UserInfoPanel.BTN_ClOSE = 0;
UserInfoPanel.BTN_ADD_FRIEND = 1;
UserInfoPanel.BTN_REMOVE_FRIEND = 2;
UserInfoPanel.BTN_SEND_CHAT = 3;
UserInfoPanel.BTN_PERSONAL_INFO = 4;
UserInfoPanel.BTN_STORAGE = 5;
UserInfoPanel.BTN_TAB_INFO = 6;
UserInfoPanel.BTN_TAB_INTERACT = 7;

var UserInfoPanelInteractCell = cc.TableViewCell.extend({
    ctor: function(itemSize, cellSize, numRow, userInfoPanel) {
        this._super();
        this.itemSize = itemSize;
        this.cellSize = cellSize;
        this.numRow = numRow;
        this.userInfoPanel = userInfoPanel;

        this.initGUI();
    },

    initGUI: function() {
        this._layout = new cc.Layer(this.cellSize.width, this.cellSize.height);
        this.addChild(this._layout);

        for (var i = 0; i < this.numRow; i++){
            var itemNode = ccs.load("Lobby/InteractItemCell.json").node;
            itemNode.setPosition(UserInfoPanelInteractCell.PADDING + UserInfoPanelInteractCell.MARGIN, this.cellSize.height - (i + 1) * this.itemSize - (2 * i + 1) * UserInfoPanelInteractCell.PADDING);
            itemNode.setScale(this.itemSize / UserInfoPanelInteractCell.SIZE);
            this._layout.addChild(itemNode, 0, i);
            itemNode.img = itemNode.getChildByName("img");
            itemNode.shadow = itemNode.getChildByName("shadow");
            itemNode.num = itemNode.getChildByName("num");
            itemNode.img.ignoreContentAdaptWithSize(true);
            itemNode.shadow.ignoreContentAdaptWithSize(true);
            itemNode.num.ignoreContentAdaptWithSize(true);
            itemNode.bg = itemNode.getChildByName("bg");
            itemNode.bg.setTouchEnabled(true);
            itemNode.bg.setSwallowTouches(false);
            itemNode.bg.addTouchEventListener(function(target, type){
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
                        if (target.isWaitingTouch){
                            this.userInfoPanel.useInteract(this.getIdx() * 2 + target.getParent().getTag());
                            this.userInfoPanel.playSoundButton(-1);
                        }
                        break;
                    case ccui.Widget.TOUCH_CANCELED:
                        break;
                }
            }.bind(this), this);

            itemNode.iconLock = itemNode.getChildByName("iconLock");
            itemNode.textLock = itemNode.iconLock.getChildByName("text");
            itemNode.textLock.ignoreContentAdaptWithSize(true);
        }
    },

    setData: function(interacts) {
        for (var i = 0; i < this.numRow; i++){
            var itemNode = this._layout.getChildByTag(i);
            if (i >= interacts.length) itemNode.setVisible(false);
            else{
                var interact = interacts[i];
                itemNode.setVisible(true);
                if (interact.id < 1000) {
                    var path = StorageManager.getItemIconPath(StorageManager.TYPE_INTERACTION, null, interact.id);
                    var scale = 0.8;
                    itemNode.bg.loadTexture("Lobby/UserInfoPanel/itemBg.png");
                    if (path && path != ""){
                        itemNode.img.setVisible(true);
                        itemNode.shadow.setVisible(true);
                        itemNode.img.loadTexture(path);
                        itemNode.shadow.loadTexture(path);
                        itemNode.img.setScale(scale);
                        itemNode.shadow.setScale(scale);
                    }
                    else{
                        itemNode.img.setVisible(false);
                        itemNode.shadow.setVisible(false);
                    }

                    if (!interact.cond){
                        itemNode.num.setVisible(true);
                        itemNode.iconLock.setVisible(false);
                        this.setNum(itemNode, interact.num);
                    }
                    else{
                        itemNode.num.setVisible(false);
                        itemNode.iconLock.setVisible(true);
                        this.setTextLock(itemNode, interact.cond);
                        itemNode.bg.loadTexture("Lobby/UserInfoPanel/itemBgGray.png");
                        itemNode.img.getVirtualRenderer().setState(1);
                    }
                }
                else {
                    // danh cho su kien Event
                    itemNode.img.setVisible(false);
                    itemNode.bg.loadTexture("res/Event/MidAutumn/MidAutumnUI/btnActionSendSam.png");
                    itemNode.shadow.setVisible(false);
                    itemNode.num.setVisible(false);
                    itemNode.iconLock.setVisible(false);
                }
            }
        }
    },

    setTextLock: function(node, cond) {
        var str = "";
        switch(cond.type){
            case StorageManager.VIP_CONDITION:
                str = "Vip";
                break;
            case StorageManager.LEVEL_CONDITION:
                str = "Level";
                break;
        }
        str += (" " + cond.num);
        node.textLock.setString(str);
        node.iconLock.setPositionX(node.width - (node.textLock.x + node.textLock.getAutoRenderSize().width) * node.iconLock.getScale());
    },

    setNum: function(node, num) {
        node.num.setString(num >= 0 ? num : '\u221e');
        node.num.setTextColor(num != 0 ? cc.color("#ffffff") : cc.color("#ff5b5b"));
        node.num.enableOutline(num != 0 ? cc.color("#4c3093") : cc.color("#6a2035"));
        node.img.getVirtualRenderer().setState(num > 0 ? 0 : 1);
        node.bg.loadTexture(num != 0 ? "Lobby/UserInfoPanel/itemBg.png" : "Lobby/UserInfoPanel/itemBgGray.png")
    }
});
UserInfoPanelInteractCell.PADDING = 2.5;
UserInfoPanelInteractCell.NUM_ROW = 2;
UserInfoPanelInteractCell.SIZE = 80;
UserInfoPanelInteractCell.MARGIN = 2.5;

// Setting GUI
var SettingGUI = BaseLayer.extend({

    ctor: function (user) {
        this._super();
        //this._layerColor = new cc.LayerColor(cc.BLACK);
        //this.addChild(this._layerColor);
        this.initWithBinaryFile("SettingGUI.json");
        this._user = user;
    },

    customizeGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this.customButton("close", SettingGUI.BTN_CLOSE, bg);

        this.swSound = this.createSwitchButton(bg, this.getControl("sound", bg), SettingGUI.BTN_SOUND, gamedata.sound);
        this.swVibrate = this.createSwitchButton(bg, this.getControl("vibrate", bg), SettingGUI.BTN_VIBRATE, gamedata.vibrate);
        this.swInvite = this.createSwitchButton(bg, this.getControl("invite", bg), SettingGUI.BTN_INVITE, gamedata.acceptInvite);
        this.swFriend = this.createSwitchButton(bg, this.getControl("friend", bg), SettingGUI.BTN_FRIEND, gamedata.acceptFriend);

        this.customButton("logout", SettingGUI.BTN_LOGOUT, bg).setVisible(!(!cc.sys.isNative && Config.WITHOUT_LOGIN));
        this.customButton("support", SettingGUI.BTN_SUPPORT, bg);
        this.customButton("fanpage", SettingGUI.BTN_FANPAGE, bg);

        this.getControl("txMail", bg).setString(!gamedata.isAppSupport ? gamedata.support : gamedata.supporturl);
        this.getControl("txPhone", bg).setString(gamedata.supportphone);

        var version = this.getControl("version", bg);
        version.setString(NativeBridge.getVersionString());
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.setFog(true);
    },

    finishAnimate: function () {
        this.swSound.setOn(gamedata.sound, true);
        this.swVibrate.setOn(gamedata.vibrate, true);
        this.swInvite.setOn(gamedata.acceptInvite, true);
        this.swFriend.setOn(gamedata.acceptFriend, true);
    },

    createSwitchButton: function (parent, btn, id, value) {
        var switchControl = new cc.ControlSwitch
        (
            new cc.Sprite("GUISetting/bgBtn.png"),
            new cc.Sprite("GUISetting/btnOn.png"),
            new cc.Sprite("GUISetting/btnOff.png"),
            new cc.Sprite("GUISetting/icon.png"),
            new cc.LabelTTF("", "Arial", 16),
            new cc.LabelTTF("", "Arial", 16)
        );
        btn.setVisible(false);
        switchControl.setOn(value, true);
        switchControl.setPosition(btn.getPosition());
        switchControl.setTag(id);
        parent.addChild(switchControl);

        var mask = new cc.Sprite("GUISetting/maskBtn.png");
        parent.addChild(mask);
        mask.setPosition(btn.getPosition());

        switch (id) {
            case SettingGUI.BTN_SOUND:
                switchControl.addTargetWithActionForControlEvents(this, this.changeSound, cc.CONTROL_EVENT_VALUECHANGED);
                break;
            case SettingGUI.BTN_FRIEND:
                switchControl.addTargetWithActionForControlEvents(this, this.changeFriend, cc.CONTROL_EVENT_VALUECHANGED);
                break;
            case SettingGUI.BTN_VIBRATE:
                switchControl.addTargetWithActionForControlEvents(this, this.changeVibrate, cc.CONTROL_EVENT_VALUECHANGED);
                break;
            case SettingGUI.BTN_INVITE:
                switchControl.addTargetWithActionForControlEvents(this, this.changeInvite, cc.CONTROL_EVENT_VALUECHANGED);
                break;
        }
        return switchControl;
    },

    changeSound: function (sender, controlEvent) {
        var value = sender.isOn();
        cc.sys.localStorage.setItem("sound", value ? 3 : 1);
        gamedata.sound = value;
        gameSound.on = value;
    },

    changeVibrate: function (sender, controlEvent) {
        var value = sender.isOn();
        cc.sys.localStorage.setItem("vibrate", value ? 1 : 0);
        gamedata.vibrate = value;
    },

    changeFriend: function (sender, controlEvent) {
        var value = sender.isOn();
        cc.sys.localStorage.setItem("friend", value ? 1 : 0);
        gamedata.acceptFriend = value;
    },

    changeInvite: function (sender, controlEvent) {
        var value = sender.isOn();
        cc.sys.localStorage.setItem("invite", value ? 1 : 0);
        gamedata.acceptInvite = value;
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case SettingGUI.BTN_CLOSE: {
                this.onClose();
                //gameSound.playSoundxepbai_samchi();
                break;
            }
            case SettingGUI.BTN_LOGOUT: {
                var message = gamedata.isPortal() ? LocalizedString.to("LOGOUT_GAME_TO_PORTAL") : LocalizedString.to("_ASKLOGOUT_");
                sceneMgr.showOkCancelDialog(message, this, function (btnID) {
                    if (btnID == 0) {
                        if (gamedata.isPortal()) {
                            gamedata.endGame();
                        } else {
                            socialMgr.clearSession();
                            GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
                            engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
                            engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");
                            GameClient.getInstance().disconnect();
                            GameClient.destroyInstance();
                            NewRankData.disconnectServer();

                            cc.sys.localStorage.setItem("autologin", -1);
                            this.runAction(new cc.Sequence([new cc.DelayTime(.1), new cc.CallFunc(function () {
                                gamedata.backToLoginScene();
                            }, this, null)]));
                        }
                    }
                });
                break;
            }
            case SettingGUI.BTN_SUPPORT: {
                if (gamedata.isAppSupport) {
                    NativeBridge.openHotro(gamedata.support, gamedata.userData.zName);
                } else {
                    NativeBridge.openWebView(gamedata.support);
                }
                break;
            }
            case SettingGUI.BTN_FANPAGE: {
                NativeBridge.openWebView(gamedata.forum);
                break;
            }
        }
    },

    onBack: function () {
        this.onClose();
    }
});
SettingGUI.className = "SettingGUI";
SettingGUI.BTN_CLOSE = 1;
SettingGUI.BTN_SOUND = 2;
SettingGUI.BTN_VIBRATE = 3;
SettingGUI.BTN_INVITE = 4;
SettingGUI.BTN_FRIEND = 5;
SettingGUI.BTN_LOGOUT = 6;
SettingGUI.BTN_SUPPORT = 7;
SettingGUI.BTN_FANPAGE = 8;

var GUIPopupBrand = BaseLayer.extend({
    ctor: function () {
        this._super(GUIPopupBrand.className);
        this.initWithBinaryFile("GUIPopupBrand.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.customButton("btnClose", GUIPopupBrand.BTN_CONFIRM);
        this.enableFog();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true);
    },

    onBack: function () {

    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case GUIPopupBrand.BTN_CONFIRM: {
                this.onClose();
                break;
            }
        }
    }
});
GUIPopupBrand.className = "GUIPopupBrand";
GUIPopupBrand.BTN_CONFIRM = 0;
GUIPopupBrand.tag = 102;

var LobbyButtonManager = cc.Class.extend({
    ctor: function(){
        this.pButton = null;
        this.buttonMap = {};    //store ref to buttons
        this.buttonArray = [];  //store buttons order
    },

    hideAll: function () {
        for (var i = 0; i < this.buttonArray.length; i++){
            var type = this.buttonArray[i].type;
            var id = this.buttonArray[i].id;
            var button = this.buttonMap[type][id];
            button.setVisible(false);
        }
    },

    setPButton: function(pButton){
        this.pButton = pButton;
        this.pButton.removeAllChildren();
        this.pButton.unscheduleAllCallbacks();

        for (var i = 0; i < this.buttonArray.length; i++){
            var type = this.buttonArray[i].type;
            var id = this.buttonArray[i].id;
            var button = this.buttonMap[type][id];
            button.removeFromParent();
            this.pButton.addChild(button);
        }
    },

    scheduleUpdate: function(){
        this.pButton.schedule(this.update.bind(this), 0);
    },

    unscheduleUpdate: function(){
        this.pButton.unscheduleAllCallbacks();
    },

    getButton: function(id, type) {
        if (id == undefined) return null;
        if (this.buttonMap[type] && this.buttonMap[type][id]) return this.buttonMap[type][id];
        return null;
    },

    /**
     * @param {cc.Node} button
     * @param {string} unique id
     * @param {int} type for priority
     */
    addButton: function(button, id, type){
        cc.log("ADD TO LobbyBUtton " + type + " " + id);
        if (id == undefined) return;
        if (LobbyButtonManager.BUTTON_TYPES.indexOf(type) == -1) type = LobbyButtonManager.TYPE_DEFAULT;

        if (this.buttonMap[type] && this.buttonMap[type][id]) {
            this.buttonMap[type][id].setVisible(true);
            return;
        }
        if (!this.buttonMap[type]) this.buttonMap[type] = {};
        cc.log("ADD TO LobbyBUtton1 " + type + " " + id);
        button.retain();
        if (button.getParent()) button.removeFromParent();
        if (this.pButton) {
            this.pButton.addChild(button);

        }
        this.buttonMap[type][id] = button;
        this.buttonArray.push({type: type, id: id});
        this.buttonArray.sort(function(a, b){
            return a.type - b.type;
        });
    },

    /**
     * @param {string} unique id
     * @param {int} type for priority
     */
    removeButton: function(id, type){
        cc.log("REMOVE TO LobbyBUtton " + type + " " + id);
        if (id == undefined) return;
        if (LobbyButtonManager.BUTTON_TYPES.indexOf(type) == -1) type = LobbyButtonManager.TYPE_DEFAULT;

        for (var i = 0; i < this.buttonArray.length; i++){
            var button = this.buttonArray[i];
            if (button.type == type && button.id == id){
                if (this.pButton) this.pButton.removeChild(this.buttonMap[type][id]);
                delete this.buttonMap[type][id];
                this.buttonArray.splice(i, 1);
                break;
            }
        }
    },

    update: function(){
        var count = 0;
        for (var i = 0; i < this.buttonArray.length; i++){
            var type = this.buttonArray[i].type;
            var id = this.buttonArray[i].id;
            var button = this.buttonMap[type][id];

            if (!button.isVisible()) continue;
            var row = count % LobbyButtonManager.MAX_ROW;
            var col = Math.floor(count / LobbyButtonManager.MAX_ROW);
            button.setPosition(col * LobbyButtonManager.OFFSET.x, -row * LobbyButtonManager.OFFSET.y);
            count++;
        }
    }
});
LobbyButtonManager.instance = null;
LobbyButtonManager.getInstance = function(){
    if (!LobbyButtonManager.instance)
        LobbyButtonManager.instance = new LobbyButtonManager();
    return LobbyButtonManager.instance;
};
LobbyButtonManager.OFFSET = cc.p(80, 80);
LobbyButtonManager.MAX_ROW = 3;

LobbyButtonManager.BUTTON_TYPES = [
    (LobbyButtonManager.TYPE_OFFER = 0),
    (LobbyButtonManager.TYPE_EVENT = 1),
    (LobbyButtonManager.TYPE_DEFAULT = 100)
];
