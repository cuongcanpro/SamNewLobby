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
        paymentMgr.openIAP();

        // load payment default
        if (paymentMgr.checkEnablePayment()) {
            this.btnGold.setVisible(true);
            if (paymentMgr.checkEnableNapG())
                this.getControl("btn", this.btnG).setVisible(true);
            else
                this.getControl("btn", this.btnG).setVisible(false);
            this.getControl("btn", this.btnGoldSmall).setVisible(true);
        } else {
            this.btnGold.setVisible(false);

            this.getControl("btn", this.btnG).setVisible(false);
            this.getControl("btn", this.btnGoldSmall).setVisible(false);
        }
        this.btnCamera.setVisible(!userMgr.checkDisableSocialViral() && cc.sys.isNative && cc.sys.isNative);

        // this.btnCamera.setVisible(false);
        this.updateMoreButtonTopRight();
        this.onUpdateGUI();
        this.loadAnimation();
        if (Config.ENABLE_NEW_RANK)
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
        offerManager.addOfferToGroup();
        offerManager.showOfferGUIKick();
        paymentMgr.checkShowSystemBonus();
        NewVipManager.getInstance().checkShowDailyBonus();
        eventMgr.checkFreeTicket();
        NewVipManager.getInstance().sendGetVipInfo();
        StorageManager.getInstance().showNotifyStorage();
        DailyPurchaseManager.getInstance().checkNotifyGift();

        // EventMgr PORTAL
        PortalUtil.checkEventPortal();

        //init lucky bonus
        if (this.btnCamera.isVisible())
            this.btnLuckyBonus.setPosition(LuckyBonusManager.LOBBY_BTN_POS_X_WITH_CAMERA_BTN, LuckyBonusManager.LOBBY_BTN_POS_Y);
        else this.btnLuckyBonus.setPosition(LuckyBonusManager.LOBBY_BTN_POS_X_WITHOUT_CAMERA_BTN, LuckyBonusManager.LOBBY_BTN_POS_Y);
        LuckyBonusManager.getInstance().checkShowNotify(this.btnLuckyBonus);
    },


    onExit: function () {
        this._super();
        eventMgr.resetEventButton();
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
        this.adult.setVisible(gameMgr.enableAdult);

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
        emitter1.setStartSize(10);

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
        eventMgr.createEventInLobby(this);
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
            this.bgTooltip.iconVip = new ccui.Scale9Sprite(NewVipManager.getIconVip(1));
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
        //pRightButton.setPositionX(pRightButton.getPositionX() - (cc.winSize.width - Constant.WIDTH) * 0.15);

        this.btnQuickPlay = this.customButton("btnChoingay", LobbyScene.BTN_CHOINGAY, pRightButton);
        this.btnChooseRoom = this.customButton("btnChonban", LobbyScene.BTN_CHONBAN, pRightButton);
        this.btnRank = this.customButton("btnRank", LobbyScene.BTN_RANK, pRightButton);
        this.btnRank.worldPosition = this.btnRank.getWorldPosition();
        this.btnRank.hot = this.getControl("hot", this.btnRank);
        this.btnRank.hot.setLocalZOrder(1);
        this.btnRank.pArrow = this.getControl("pArrow", this.btnRank);
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
        this.btnSetting = this.customButton("btnSetting", LobbyScene.BTN_SETTING, pBotButton);

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
        if (eventMgr.isInMainEvent() || eventMgr.isEndEvent()) {
            width = pBotButton.getContentSize().width * 3 / 4;
            startX = pBotButton.getContentSize().width / 4;
            this.btnEvent.setVisible(true);
        } else {
            startX = 0;
            width = pBotButton.getContentSize().width;
            this.btnEvent.setVisible(false);
        }
        var pad = width / 5;
        var count = 0;
        this.btnHotNews.setPositionX(startX + pad * count);
        count++;
        this.btnNews.setPositionX(startX + pad * count);
        count++;
        this.btnGiftCode.setPositionX(startX + pad * count);
        count++;
        this.btnSetting.setPositionX(startX + pad * count);
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
        this.btnShare = this.customButton("btnShare", LobbyScene.BTN_SHARE, pLeftCenter);

        this.pOffer = this.getControl("pOffer", pLeftCenter);
        this.pOffer.pos = this.pOffer.getPosition();
        offerManager.setGroupOffer(this.pOffer);

        this.pEvent = this.getControl("pEvent", pLeftCenter);
        this.pEvent.allowUpdate = true;
        eventMgr.initArrayBtnEvent(this.pEvent);

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
        this.imgVip = new ccui.Scale9Sprite(NewVipManager.getIconVip(1));
        vipImg.getParent().addChild(this.imgVip);
        this.imgVip.setPosition(vipImg.getPosition());
        this.imgVip2 = vipImg;
        this.imgVip2.ignoreContentAdaptWithSize(true);

        this._uiName = this.getControl("name", pAvatar);
        this._uiCoin = this.getControl("xu", this.btnG);
        this._uiBean = this.getControl("gold", this.btnGoldSmall);
        this._uiDiamond = this.getControl("diamond", this.btnDiamond);

        this._uiCoin.ignoreContentAdaptWithSize(true);
        this._uiBean.ignoreContentAdaptWithSize(true);
        this._uiDiamond.ignoreContentAdaptWithSize(true);
    },

    initTopRight: function () {
        var pRightTop = this.getControl("pRightTop");

        this.btnCamera = this.customButton("btnCamera", LobbyScene.BTN_SHARE, pRightTop);
        this.notifyCapture = this.getControl("notify", pRightTop);
        this.notifyCapture.setVisible(false);
        this.notifyCapture.setLocalZOrder(1);
        this.notifyCapture.pos = this.notifyCapture.getPosition();

        this.notifyCapture.img1 = this.getControl("img1", this.notifyCapture);
        this.notifyCapture.img1.pos = this.notifyCapture.img1.getPosition();

        this.notifyCapture.img2 = this.getControl("img2", this.notifyCapture);
        this.notifyCapture.img2.pos = this.notifyCapture.img2.getPosition();

        this.btnSupport = this.customButton("btnSupport", LobbyScene.BTN_SUPPORT, pRightTop);

        this.btnLuckyBonus = new LuckyBonusButton();
        pRightTop.addChild(this.btnLuckyBonus);
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
        this.waitEffectOneElement(pLeftCenter, "pOffer", -0, 0);
        this.waitEffectOneElement(pLeftCenter, "pEvent", -0, 0);

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
        this.waitEffectOneElement(pLeftCenter, "pOffer", -400, 0);
        this.waitEffectOneElement(pLeftCenter, "pEvent", -400, 0);
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
        timeTop += 0.1;
        ret = this.getControl("pOffer", pLeftCenter);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(400, 0)))));

        timeTop += 0.2;
        ret = this.getControl("btnShare", pLeftCenter);
        ret.runAction(new cc.Sequence(new cc.DelayTime(timeTop), new cc.EaseBackOut(cc.moveBy(time, cc.p(400, 0)))));

        timeTop += 0.25;
        ret = this.getControl("pEvent", pLeftCenter);
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

    updateMoreButtonTopRight: function () {
        return;
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
        effect = this.createAnim(this.btnRank, "bt_vip_xephang", "2");
        effect.setScale(0.71);
        effect = this.createAnim(this.btnGold, "shopwithtag");
        effect.setScale(0.71);
        effect.setPosition(effect.getPositionX() - 6, effect.getPositionY() + 5);

        effect = this.createAnim(this.btnGoldSmall, "BtnCoin", "2");
        effect.setPositionX(this.btnGoldSmall.getChildByName("icon").getPositionX());
        effect.setScale(this.btnGoldSmall.getChildByName("icon").getScale() * 0.95);

        effect = this.createAnim(this.btnG, "BtnCoin");
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

    createAnim: function (control, anim, trackIndex) {
        if (control === undefined || control == null || anim === undefined || anim == "") return null;
        trackIndex = trackIndex || "1";

        if (control.anim) {
            control.removeChild(control.anim);
            control.anim = null;
        }

        var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim);
        if (eff) {
            control.addChild(eff);
            eff.setPosition(control.getContentSize().width / 2, control.getContentSize().height / 2);
            eff.getAnimation().gotoAndPlay(trackIndex, -1, -1, 0);
            control.anim = eff;
        }
        return eff;
    },

    onUpdateGUI: function (data) {
        if (this._uiAvatar && this._uiName && this._uiBean && this._uiCoin) {
            try {
                this._uiAvatar.asyncExecuteWithUrl(userMgr.getUserName(), userMgr.getAvatar());
            } catch (e) {

            }
            this.setLabelText(userMgr.getDisplayName(), this._uiName);
            cc.log("GOLD NE ** " + userMgr.getGold());
            this._uiBean.setString(StringUtility.formatNumberSymbol(userMgr.getGold()));
            this._uiCoin.setString(StringUtility.standartNumber(userMgr.getGold()));
            if (!StorageManager.getInstance().waitDiamondNewItem)
                this._uiDiamond.setString(StringUtility.standartNumber(userMgr.getDiamond()));
            else StorageManager.getInstance().waitDiamondNewItem = false;
        }

        if (this.avatarFrame){
            this.avatarFrame.reload();
            this.defaultFrame.setVisible(!this.avatarFrame.isShow());
        }

        var arrayBonus = paymentMgr.getMaxShopBonus();
        this.btnGold.hot.setVisible(arrayBonus.length > 0 || eventMgr.promoTicket > 0);

        if (userMgr.getGold() >= channelMgr.getMinGoldSupport()) {
            this.onEffectSuggestMoney(false);
        }
        hotNews.requestNewDay();
        hotNews.showNewsButton(this.btnHotNews);
        this.updateVipInfo();
    },

    doFinishEffect: function () {

        var cur = sceneMgr.getRunningScene().getMainLayer();
        if (!(cur instanceof LobbyScene)) return;

        supportMgr.checkShowSupportStartUp();
        eventMgr.showButtonEvent(this.btnEvent);
        eventMgr.showHideButtonEventInGame();

        CheckLogic.checkCaptureInBoard();
        CheckLogic.checkShowTutorial();
        PersonalInfoGUI.checkOpenGuiFirstTime();
    },

    onEffectSuggestMoney: function (visible) {
        if (visible === undefined) visible = true;

        this.notifyCapture.setVisible(false);

        if (visible) {
            this.updateMoreButtonTopRight();
            var today = new Date();
            var sDay = today.toISOString().substring(0, 10);
            var cCaptureDay = cc.sys.localStorage.getItem("capture_success_day");
            if (cCaptureDay === undefined || cCaptureDay == null) cCaptureDay = "";

            if (sDay != cCaptureDay) {
                this.notifyCapture.setVisible(!PortalUtil.isPortal() && cc.sys.isNative && !userMgr.checkDisableSocialViral());

                this.notifyCapture.img1.setPositionY(this.notifyCapture.img1.pos.y + 100);
                this.notifyCapture.img2.setPositionY(this.notifyCapture.img2.pos.y + 100);

                this.notifyCapture.setPositionX(this.notifyCapture.pos.x + 300);
                this.notifyCapture.setOpacity(0);
                this.notifyCapture.runAction(cc.sequence(cc.spawn(cc.fadeIn(0.5), new cc.EaseBackOut(cc.moveTo(0.5, this.notifyCapture.pos))), cc.callFunc(this.onMoneyDrop.bind(this))));
            }
        }
    },

    onMoneyDrop: function () {
        this.notifyCapture.img1.runAction(new cc.EaseBackOut(cc.moveTo(0.5, this.notifyCapture.img1.pos)));
        this.notifyCapture.img2.runAction(cc.sequence(cc.delayTime(0.25), new cc.EaseBackOut(cc.moveTo(0.5, this.notifyCapture.img2.pos))));

        this.notifyCapture.runAction(cc.sequence(cc.delayTime(5), cc.fadeOut(0.5), cc.hide()));
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
            iconDown.setPositionX(this.btnRank.pArrow.getContentSize().width / 2 - btnWidth / 2 + btnWidth * Math.random());
            this.btnRank.pArrow.addChild(iconDown);
            iconDown.runAction(cc.sequence(cc.delayTime(timeDelay1 + 0.2 * i), actionRun.clone(),
                cc.fadeOut(0.5), cc.removeSelf()));
        }
    },

    effectGold: function (goldChange, pStart) {
        if (!goldChange) return;
        var pEnd = this.btnGoldSmall.convertToWorldSpace(this.btnGoldSmall.getChildByName("icon").getPosition());

        effectMgr.flyCoinEffect(sceneMgr.layerGUI, goldChange, 500000, pStart, pEnd);
        if (this._uiBean)
            effectMgr.runLabelPoint(this._uiBean, (userMgr.getGold() - goldChange), userMgr.getGold(), 1.5, null, true);
    },

    effectDiamond: function(diamondChange, pStart){
        if (!diamondChange) return;
        var pEnd = this.btnDiamond.convertToWorldSpace(this.btnDiamond.getChildByName("icon").getPosition());

        effectMgr.flyItemEffect(sceneMgr.layerGUI, "Lobby/LobbyGUI/iconDiamond.png", diamondChange, pStart, pEnd, 0, true, false);
        if (this._uiDiamond)
            effectMgr.runLabelPoint(this._uiDiamond, (userMgr.getDiamond() - diamondChange), userMgr.getDiamond(), 1.5);
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
                sceneMgr.openScene(ChooseRoomScene.className);
                break;
            }
            case LobbyScene.BTN_AVATAR: {
                sceneMgr.openGUI(CheckLogic.getUserInfoClassName(), LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO).setInfo(gamedata.userData);
                break;
            }
            case LobbyScene.BTN_CHOINGAY: {
                if (channelMgr.checkQuickPlay()) {
                    channelMgr.sendQuickPlay();
                    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                } else {
                    if (paymentMgr.checkEnablePayment()) {
                        var msg = LocalizedString.to("QUESTION_CHANGE_GOLD");
                        sceneMgr.showChangeGoldDialog(msg, this, function (buttonId) {
                            if (buttonId == Dialog.BTN_OK) {
                                paymentMgr.openShop();
                            }
                        });
                    } else {
                        sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                    }
                }
                break;
            }
            case LobbyScene.BTN_THONGBAO: {
                NativeBridge.openWebView(gameMgr.urlnews);
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
                paymentMgr.openShop();
                break;
            }
            case LobbyScene.BTN_NAPG: {
                paymentMgr.openNapG();
                break;
            }
            case LobbyScene.BTN_CAMERA: {
                this.notifyCapture.setVisible(false);

                var gui = sceneMgr.openGUI(GUIShareFace.className, GUIShareFace.tag, GUIShareFace.tag, false);
                gui.addImage(GUIShareFace.getContentShare());
                break;
            }
            case LobbyScene.BTN_GUI_GIFTCODE: {
                this.showGiftCode();
                break;
            }
            case LobbyScene.BTN_EVENT: {
                eventMgr.openEvent();
                break;
            }
            case LobbyScene.BTN_DAILYMISSION: {
                CheckLogic.showDailyMissionGUI();
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
                return;
            }
            case LobbyScene.BTN_SUPPORT: {
                sceneMgr.openGUI(GUISupportInfo.className, GUISupportInfo.tag, GUISupportInfo.tag, false).showGUI(0, supportMgr.numSupport);
                break;
            }
            case LobbyScene.BTN_EVENT_IN_GAME: {
                eventMgr.openEventInGame(button.idEvent);
                break;
            }
            case LobbyScene.BTN_OFFER: {
                if (offerManager.haveOffer()) {
                    offerManager.showOfferGUI(true);
                } else {
                    ToastFloat.makeToast(ToastFloat.SHORT, LocalizedString.to("NO_OFFER"));
                }
                break;
            }
            case LobbyScene.BTN_RANK: {
                if (Config.ENABLE_NEW_RANK) {
                    this.btnRank.hot.setVisible(false);
                    NewRankData.openTableRank();
                } else {
                    Toast.makeToast(ToastFloat.MEDIUM, localized("COMING_SOON"));
                }
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

        offerManager.groupOffer.updateOffer();
        this.pEvent.setPositionY(this.pOffer.pos.y - offerManager.groupOffer.getContentSize().height + 5);

        this.reloadPositionButtonBottom();
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable()) {
            return;
        }

        var message = PortalUtil.isPortal() ? LocalizedString.to("LOGOUT_GAME_TO_PORTAL") : LocalizedString.to("_ASKEXIT_");
        sceneMgr.showOkCancelDialog(message, this, function (btnID) {
            switch (btnID) {
                case 0: {
                    PortalUtil.endGame();
                }
            }
        });
    },

    getPositionComponent: function (type) {
        switch (type) {
            case ShopSuccessData.TYPE_GOLD:
                return this.btnGoldSmall.convertToWorldSpace(cc.p(this.btnGoldSmall.getContentSize().width * 0.5, this.btnGoldSmall.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_VPOINT:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_HOUR_VIP:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_G:
                return this.btnG.convertToWorldSpace(cc.p(this.btnG.getContentSize().width * 0.5, this.btnG.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_ITEM:
                return this.btnStorage.convertToWorldSpace(cc.p(this.btnStorage.getContentSize().width * 0.5, this.btnStorage.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_TICKET:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_DIAMOND:
                return this._uiDiamond.convertToWorldSpace(cc.p(this._uiDiamond.getContentSize().width * 0.5, this._uiDiamond.getContentSize().height * 0.5));
                break;
        }
    },
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
