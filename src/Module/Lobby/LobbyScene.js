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

        this.btnEvent = null;
        this.btnNews = null;
        this.btnMoiban = null;
        this.btnEventInGame = null;

        this.btnCamera = null;
        this.btnHotNews = null;

        this.isRequestTop = false;
        this.isAnimateGUI = false;

        this._super(LobbyScene.className);
        this.initWithBinaryFile("LobbyGUI.json");
    },

    onEnterFinish: function () {
        dispatcherMgr.dispatchEvent(LobbyMgr.EVENT_ON_ENTER_FINISH);
        this.setBackEnable(true);

        // load payment default
        if (paymentMgr.checkEnablePayment()) {
            this.btnGold.setVisible(true);
            if (paymentMgr.checkEnableNapG())
                this.pUserInfo.btnCoin.setVisible(true);
            else
                this.pUserInfo.btnCoin.setVisible(false);
            this.pUserInfo.btnGold.setVisible(true);
        } else {
            this.btnGold.setVisible(false);

            this.pUserInfo.btnCoin.setVisible(false);
            this.pUserInfo.btnGold.setVisible(false);
        }

        this.updateMoreButtonTopRight();
        this.onUpdateGUI();
        this.updateToCurrentData();

        if (Config.ENABLE_NEW_RANK)
            this.onUpdateBtnRank();
       
        if (!this.isAnimateGUI || true) {
            this.isAnimateGUI = true;
            this.defaultPosition();
            this.waitEffect();
            this.effect();
        } else {
            this.defaultPosition();
            setTimeout(this.doFinishEffect.bind(this), 100);
        }

        // hide event button
        this.scheduleUpdate();
        LobbyButtonManager.getInstance().scheduleUpdate();
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
        // if (cc.winSize.width > bg.getContentSize().width) {
        //     bg.setScaleX(cc.winSize.width / bg.getContentSize().width);
        // }
        bg.setScale(cc.winSize.height / bg.getContentSize().height);
        bg.setVisible(true);
        this.bg = bg;

        this.adult = this.getControl("adult");
        this.adult.setVisible(gameMgr.enableAdult);

        this.npc = this.getControl("npc");
        this.panelBgNew = this.getControl("panelBgNew");

        this.initSnow();
        this.initTopLeft();
        this.initBottom();
        this.initCenterLeft();
        this.initCenterRight();
        this.loadAnimation();
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

        eventMgr.createEventInLobby(this);
    },

    initSnow: function () {
        this.panelSnow = this.getControl("panelSnow", this.bg);
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
    },

    initBottom: function () {
        var pBotButton = this.getControl("bot");//this.getControl("bot");
        this.arrayBottom = [];
        this.bar = this.getControl("bar");

        this.btnEvent = this.customButton("pEventButton", LobbyScene.BTN_EVENT, pBotButton);
        this.pBtnEvent = this.getControl("pButton", this.btnEvent);
        this.imgEmpty = this.getControl("imgEmpty", this.btnEvent);
        this.btnEvent.setPressedActionEnabled(false);

        this.btnStorage = this.customButton("btnStorage", LobbyScene.BTN_STORAGE, pBotButton);
        this.btnHotNews = this.customButton("btnHotNews", LobbyScene.BTN_HOT_NEWS, pBotButton);
        this.btnHotNews.hot = this.getControl("pNotice", this.btnHotNews);
        var anim = db.DBCCFactory.getInstance().buildArmatureNode("Notify");
        anim.gotoAndPlay("1", -1, -1, 0);
        this.btnHotNews.hot.addChild(anim);
       this.btnHotNews.hot.setVisible(false);

        this.btnGold = this.customButton("btnDoivang", LobbyScene.BTN_DOIVANG, pBotButton);
        this.btnGold.setPressedActionEnabled(false);

        this.btnNews = this.customButton("btnNews", LobbyScene.BTN_THONGBAO, pBotButton);
        this.btnNews.loadTextures(
            "res/Lobby/Feedback/btnLobby.png",
            "res/Lobby/Feedback/btnLobby.png",
            "res/Lobby/Feedback/btnLobby.png"
        );

        this.btnGiftCode = this.customButton("btnGiftCode", LobbyScene.BTN_GUI_GIFTCODE, pBotButton);
        this.btnSetting = this.customButton("btnSetting", LobbyScene.BTN_SETTING, pBotButton);

        this.btnGold.hot = this.getControl("pNotice", this.btnGold);
        this.btnGold.hot.setVisible(false);
        var anim = db.DBCCFactory.getInstance().buildArmatureNode("Notify");
        anim.gotoAndPlay("1", -1, -1, 0);
        this.btnGold.hot.addChild(anim);
        this.btnGold.hot.setLocalZOrder(100);

        this.arrayBottom.push(this.btnEvent);
        this.arrayBottom.push(this.btnHotNews);
        this.arrayBottom.push(this.btnNews);
        this.arrayBottom.push(this.btnGiftCode);
        this.arrayBottom.push(this.btnStorage);
        this.arrayBottom.push(this.btnSetting);
        this.arrayBottom.push(this.btnGold);
    },

    initCenterRight: function () {
        this.pRightButton = this.getControl("pRightButton");
        this.pRightButton.setPositionX(cc.winSize.width * 0.5 + this.bar.getContentSize().width * 0.5);
        this.arrayTopRight = [];
        this.btnSupport = this.customButton("btnSupport", LobbyScene.BTN_SUPPORT, this.pRightButton);
        this.arrayTopRight.push(this.btnSupport);
        this.btnCamera = this.customButton("btnCamera", LobbyScene.BTN_SHARE, this.pRightButton);
        this.btnCamera.setVisible(false);
        this.arrayTopRight.push(this.btnCamera);

        this.btnQuickPlay = this.customButton("btnChoingay", LobbyScene.BTN_CHOINGAY, this.pRightButton);
        this.btnChooseRoom = this.customButton("btnChonban", LobbyScene.BTN_CHONBAN, this.pRightButton);
        this.btnRank = this.customButton("btnRank", LobbyScene.BTN_RANK, this.pRightButton);
        this.btnRank.worldPosition = this.btnRank.getWorldPosition();
        this.btnRank.hot = this.getControl("hot", this.btnRank);
        this.btnRank.hot.setLocalZOrder(1);
        this.btnRank.hot.setVisible(false);
        this.btnRank.pArrow = this.getControl("pArrow", this.btnRank);
        this.btnRank.pArrow.setLocalZOrder(10);
        this.btnMinigame = this.customButton("btnMinigame", LobbyScene.BTN_MINIGAME, this.pRightButton);
        this.btnVip = this.customButton("btnVip", LobbyScene.BTN_VIP, this.pRightButton);

        this.btnQuickPlay.setPressedActionEnabled(false);
        this.btnChooseRoom.setPressedActionEnabled(false);
        this.btnRank.setPressedActionEnabled(false);
        this.btnVip.setPressedActionEnabled(false);
        this.btnMinigame.setPressedActionEnabled(false);

        this.arrayCenterRight = [];
        this.arrayCenterRight.push(this.btnQuickPlay);
        this.arrayCenterRight.push(this.btnChooseRoom);
        this.arrayCenterRight.push(this.btnRank);
        this.arrayCenterRight.push(this.btnMinigame);
        this.arrayCenterRight.push(this.btnVip);
    },

    initTopLeft: function () {
        var pLeftTop = this.getControl("pLeftTop");
        this.arrayLeftTop = [];
        this.logo = this.getControl("logo", pLeftTop);
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

    initUserInfo: function () {
        var pLeftTop = this.getControl("pLeftTop");
        this.pAvatar = this.getControl("pAvatar", pLeftTop);

        this.btnAvatar = this.customButton("btnAvatar", LobbyScene.BTN_AVATAR, this.pAvatar);
        this.btnAvatar.setLocalZOrder(10);

        this._uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");////engine.UIAvatar.create("Common/defaultAvatar.png");
        var size = this.pAvatar.getContentSize();
        this._uiAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        this._uiAvatar.setScale(1);
        this.pAvatar.addChild(this._uiAvatar, 0);

        this.defaultFrame = this.getControl("border", this.pAvatar);
        this.defaultFrame.setLocalZOrder(1);
        this.avatarFrame = new UIAvatarFrame();
        this.avatarFrame.setPosition(cc.p(size.width / 2, size.height / 2));
        this.avatarFrame.setScale(0.48);
        this.pAvatar.addChild(this.avatarFrame, 2);

        var bgName = this.getControl("bgName", this.pAvatar);
        this.lbName = this.getControl("lbName", bgName);

        var bgVip = this.getControl("bgVip", this.pAvatar);
        this.imgVip = this.getControl("imgVip", bgVip);
        this.imgVip.ignoreContentAdaptWithSize(true);
        this.lbVip = this.getControl("lbVip", bgVip);

        this.pUserInfo = new UserDetailInfo();
        this.pUserInfo.setPosition(
            bgName.getPositionX() + bgName.getContentSize().width * 0.5 + UserDetailInfo.PAD_BTN,
            bgName.getPositionY()
        );
        this.pAvatar.addChild(this.pUserInfo);

        this.arrayLeftTop.push(this.pAvatar);
        this.arrayLeftTop.push(this.logo);
        this.arrayLeftTop.push(this.pUserInfo.btnGold);
        this.arrayLeftTop.push(this.pUserInfo.btnCoin);
        this.arrayLeftTop.push(this.pUserInfo.btnDiamond);
    },

    initCenterLeft: function () {
        var pLeftCenter = this.getControl("pLeftCenter");
        this.pButton = this.getControl("pButton", pLeftCenter);
        pLeftCenter.setPositionX(cc.winSize.width * 0.5 - this.bar.getContentSize().width * 0.5);
        LobbyButtonManager.getInstance().setPButton(this.pButton);
    },

    initTopRightPosition: function () {
        var defaultX = this.arrayTopRight[0].x;
        var defaultY = this.arrayTopRight[0].y;
        var distance = -110;
        for (var i = 0; i < this.arrayTopRight.length; i++) {
            this.arrayTopRight[i].defaultPos = cc.p(defaultX, defaultY);
            cc.log("POSITION", i, JSON.stringify(this.arrayTopRight[i].defaultPos));
            if (this.arrayTopRight[i].isVisible()) {
                defaultX += distance;
            }
        }
    },

    defaultPosition: function () {
        this.npc.setOpacity(255);
        this.initTopRightPosition();

        this.setPositionComponent(this.arrayBottom, 0, 0);
        this.setPositionComponent(this.arrayLeftTop, 0, 0);
        this.setPositionComponent(this.arrayCenterRight, 0, 0);
        this.setPositionComponent(this.arrayTopRight, 0, 0);
    },

    waitEffect: function () {
        this.npc.setOpacity(0);

        this.setPositionComponent(this.arrayBottom, 0, -200);
        this.setPositionComponent(this.arrayLeftTop, 0, 200);
        this.setPositionComponent(this.arrayCenterRight, 200, 0);
        this.setPositionComponent(this.arrayTopRight, 200, 0);
    },

    setPositionComponent: function (component, dx, dy) {
        for (var i = 0; i < component.length; i++) {
            component[i].stopAllActions();
            this.resetDefaultPosition(component[i]);
            component[i].setPosition(component[i].getPositionX() + dx, component[i].getPositionY() + dy);
        }
    },

    effect: function () {
        this.npc.runAction(cc.fadeIn(0.5));
        this.effectComponent(this.arrayBottom);
        this.effectComponent(this.arrayLeftTop);
        this.effectComponent(this.arrayCenterRight);
        this.effectComponent(this.arrayTopRight);
        setTimeout(this.doFinishEffect.bind(this), 1000);
    },

    effectComponent: function (component) {
        var dTime = 0.1;
        var time = 0.5;
        for (var i = 0; i < component.length; i++) {
            var ret = component[i];
            var pos = ret.defaultPos;
            ret.runAction(new cc.Sequence(
                new cc.DelayTime(dTime * i),
                new cc.EaseBackOut(cc.moveTo(time, pos))
            ));

            ret.setOpacity(0);
            ret.runAction(cc.sequence(
                cc.delayTime(dTime * i),
                cc.fadeIn(0.5)
            ));
        }
    },

    updateMoreButtonTopRight: function () {
        return;
    },

    loadAnimation: function () {
        this.effShop = new CustomSkeleton("Armatures/LobbyBtn", "button", 1);
        this.btnGold.addChild(this.effShop);
        this.effShop.setPosition(this.btnGold.getContentSize().width * 0.5, this.btnGold.getContentSize().height * 0.9);
        this.effShop.setAnimation(0, "shop", -1);

        this.effGirl = new CustomSkeleton("Armatures/Girl", "Girl", 1);
        this.npc.addChild(this.effGirl);
        this.effGirl.setPosition(this.npc.getContentSize().width * 0.35, this.npc.getContentSize().height * 0.27);
        this.effGirl.setAnimation(0, "animation", -1);

        this.effPlayNow = new CustomSkeleton("Armatures/Choingay", "choingay", 1);
        this.btnQuickPlay.addChild(this.effPlayNow);
        this.effPlayNow.setPosition(this.btnQuickPlay.getContentSize().width * 0.5, this.btnQuickPlay.getContentSize().height * 0.5);
        this.effPlayNow.setAnimation(0, "run", -1);

        this.effChooseRoom = new CustomSkeleton("Armatures/Chonban", "chonban", 1);
        this.btnChooseRoom.addChild(this.effChooseRoom);
        this.effChooseRoom.setPosition(this.btnChooseRoom.getContentSize().width * 0.41, this.btnChooseRoom.getContentSize().height * 0.46);
        this.effChooseRoom.setAnimation(0, "run", -1);

        this.effRank = new CustomSkeleton("Armatures/RankBTN", "xephang", 1);
        this.btnRank.addChild(this.effRank);
        this.effRank.setPosition(this.btnRank.getContentSize().width * 0.5, this.btnRank.getContentSize().height * 0.5);
        this.effRank.setAnimation(0, "run", -1);

        this.effMiniGame = new CustomSkeleton("Armatures/MinigameBTN", "minigame", 1);
        this.btnMinigame.addChild(this.effMiniGame);
        this.effMiniGame.setPosition(this.btnMinigame.getContentSize().width * 0.5, this.btnMinigame.getContentSize().height * 0.5);
        this.effMiniGame.setAnimation(0, "run", -1);

        this.effVip = new CustomSkeleton("Armatures/VipBTN", "vipclub", 1);
        this.btnVip.addChild(this.effVip);
        this.effVip.setPosition(this.btnVip.getContentSize().width * 0.5, this.btnVip.getContentSize().height * 0.5);
        this.effVip.setAnimation(0, "run", -1);

        return;
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
        if (this._uiAvatar && this.lbName) {
            try {
                this._uiAvatar.asyncExecuteWithUrl(userMgr.getUserName(), userMgr.getAvatar());
            } catch (e) {

            }
            this.setLabelText(userMgr.getDisplayName(), this.lbName);
            if (!StorageManager.getInstance().waitDiamondNewItem)
                this.pUserInfo.updateDiamond(userMgr.getDiamond());
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

    updateToCurrentData: function () {
        this.pUserInfo.updateToCurrentData();
    },

    doFinishEffect: function () {
        cc.log("doFinishEffect ********* ");
        var cur = sceneMgr.getRunningScene().getMainLayer();
        if (!(cur instanceof LobbyScene)) return;

        eventMgr.showButtonEvent(this.pBtnEvent);
        PersonalInfoGUI.checkOpenGuiFirstTime();
    },

    onEffectSuggestMoney: function (visible) {

    },

    onUpdateBtnRank: function () {
        if (Config.ENABLE_TESTING_NEW_RANK) {
            return;
        }
        this.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function () {
                if (RankData.getOpenResultLastWeek()) {
                    this.btnRank.hot.setVisible(true);
                }
                else{
                    this.btnRank.hot.setVisible(false);
                    if (StorageManager.getInstance().showUnlockItemRank()){
                        //show unlock item
                    }
                }
                if (RankData.isEnoughLevelJoinRank) {
                    var pos = this.btnRank.getWorldPosition();
                    pos.x -= 60;
                    pos.y -= 75;
                    var text = localized("NEW_RANK_HAS_OPENED");
                    TooltipFloat.makeTooltip(TooltipFloat.LONG, text, pos, TooltipFloat.SHOW_UP_TYPE_0, 15);
                    RankData.isEnoughLevelJoinRank = false;
                }
            }.bind(this))
        ));
    },

    onUpdateBtnRankCallFunc: function (cupChange) {
        this.btnRank.hot.setVisible(true);
        var dataRank = RankData.getInstance().getCurRankInfo();
        var curRank = dataRank.rank;
        var oldCup = RankData.getInstance().getNumberOldCup();
        var oldRank = RankData.getRankByCup(oldCup);
        cc.log("onUpdateBtnRankCallFunc: ", curRank, oldRank, dataRank.rankPoint, oldCup);

        if (oldRank - curRank !== 0) {
            this.effectChangeLevelRank(-cupChange);
        }
    },

    effectChangeLevelRank: function (positionChange) {
        var timeMove = 1;
        var pHeight = this.btnRank.pArrow.getContentSize().height;
        var spriteName, posY, anchorY, actionRun;
        if (positionChange > 0) { // bi tut hang
            spriteName = "res/Lobby/Ranking/iconLevelDown.png";
            posY = pHeight;
            anchorY = 0;
            actionRun = -pHeight;
        } else {
            spriteName = "res/Lobby/Ranking/iconLevelUp.png";
            posY = 0;
            anchorY = 1;
            actionRun = pHeight;
        }
        for (var i = 0; i < 5; i++) {
            var iconDown = new cc.Sprite(spriteName);
            iconDown.setAnchorPoint(0.5, anchorY);
            iconDown.setOpacity(0);
            this.btnRank.pArrow.addChild(iconDown);
            iconDown.runAction(cc.sequence(
                cc.delayTime(0.25 * i),
                cc.callFunc(function () {
                    this.runAction(cc.sequence(
                        cc.callFunc(function () {
                            var pArrow = this.getParent();
                            this.setPositionX(pArrow.getContentSize().width * Math.random());
                            this.setOpacity(255);
                            this.y = posY;
                            this.setScale(0.5 + 0.5 * Math.random());
                        }.bind(this)),
                        cc.spawn(
                            cc.fadeOut(timeMove).easing(cc.easeIn(2.5)),
                            cc.moveBy(timeMove, 0, actionRun).easing(cc.easeOut(2))
                        )
                    ).repeatForever());
                }.bind(iconDown))
            ));
        }
    },

    effectGold: function (goldChange, pStart) {
        if (!goldChange) return;
        var pEnd = this.getGoldIconPosition();

        effectMgr.flyCoinEffect(sceneMgr.layerGUI, goldChange, 500000, pStart, pEnd);
        if (this._uiBean)
            effectMgr.runLabelPoint(this._uiBean, (userMgr.getGold() - goldChange), userMgr.getGold(), 1.5, null, true);
    },

    effectDiamond: function(diamondChange, pStart){
        if (!diamondChange) return;
        var pEnd = this.getDiamondIconPosition();

        effectMgr.flyItemEffect(sceneMgr.layerGUI, "Lobby/LobbyGUI/iconDiamond.png", diamondChange, pStart, pEnd, 0, true, false);
        if (this._uiDiamond)
            effectMgr.runLabelPoint(this._uiDiamond, (userMgr.getDiamond() - diamondChange), userMgr.getDiamond(), 1.5);
    },

    getGoldIconPosition: function(){
        return this.pUserInfo.btnGold.convertToWorldSpace(this.pUserInfo.iconGold.getPosition());
    },

    getCoinIconPosition: function(){
        return this.btnG.convertToWorldSpace(this.btnG.getChildByName("icon").getPosition());
    },

    getDiamondIconPosition: function(){
        return this.pUserInfo.btnDiamond.convertToWorldSpace(this.pUserInfo.iconDiamond.getPosition());
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
        cc.log("LOBBY BUTTON PRESS", button.getName(), id);
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
                // sceneMgr.openGUI(ReceivedGUI.className);
                // return;
                // sceneMgr.openGUI(ChatPanelGUI.className, ChatPanelGUI.TAG, ChatPanelGUI.TAG);
                // return;
                userMgr.openUserInfoGUI(userMgr.userInfo, UserInfoTab.TAB_INFROMATION);
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
            case LobbyScene.BTN_SETTING: {
                settingMgr.openSettingGUI();
                break;
            }
            case LobbyScene.BTN_VIP: {
                VipManager.openVip(LobbyScene.className);
                // supportMgr.showSupportStartup();
                //VipManager.openVip();
                break;
            }
            case LobbyScene.BTN_MINIGAME: {
                Toast.makeToast(ToastFloat.MEDIUM, localized("COMING_SOON"));
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
            case LobbyScene.BTN_GUI_GIFTCODE: {
                this.showGiftCode();
                break;
            }
            case LobbyScene.BTN_EVENT: {
                if (eventMgr.isInEvent())
                    eventMgr.openEvent();
                else
                    ToastFloat.makeToast(ToastFloat.SHORT, "Vui lòng đợi Sự kiện kế tiếp");
                break;
            }
            case LobbyScene.BTN_HOT_NEWS: {
                hotNews.show();
                break;
            }
            case LobbyScene.BTN_SUPPORT: {
                supportMgr.showSupportInLobby();
                //sceneMgr.openGUI(GUISupportInfo.className, GUISupportInfo.tag, GUISupportInfo.tag, false).showGUI(0, supportMgr.numSupport);
                // sceneMgr.openGUI(GUIStartUp.className, GUISupportInfo.tag, GUISupportInfo.tag, false);
                // supportMgr.numSupport = 0;
                // sceneMgr.openGUI(GUISupportInfo.className, GUISupportInfo.tag, GUISupportInfo.tag, false).showGUI(33330, 1);
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
                    RankData.openTableRank();
                } else {
                    Toast.makeToast(ToastFloat.MEDIUM, localized("COMING_SOON"));
                }
                this.btnRank.pArrow.removeAllChildren();
                break;
            }
            case LobbyScene.BTN_STORAGE: {
                userMgr.openUserInfoGUI(userMgr.userInfo, UserInfoTab.TAB_AVATAR);
                break;
            }
            case LobbyScene.BTN_THONGBAO: {
                if (FeedbackGUI.checkNewDay()) sceneMgr.openGUI(FeedbackGUI.className, 1, 1, false);
                // NativeBridge.openWebView(gamedata.urlnews);
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
        var vipLevel = VipManager.getInstance().getVipLevel();
        this.imgVip.setVisible(vipLevel > 0);
        var state = (VipManager.getInstance().getRemainTime() > 0) ? 0 : 1;
        this.imgVip.getVirtualRenderer().setState(state);
        var texture = VipManager.getIconVip(vipLevel);
        // cc.log("updateVipInfo: ", texture, vipLevel);
        if (texture !== "" && vipLevel > 0) {
            try {
                this.imgVip.loadTexture(texture);
                this.imgVip.setVisible(true);
                this.lbVip.setString("VIP " + vipLevel);
                this.lbVip.setPositionX(this.lbVip.defaultPos.x);
            } catch (e) {
                this.imgVip.setVisible(false);
            }
        }

        if (vipLevel === 0) {
            this.lbVip.setString("Free");
            this.lbVip.setPositionX(this.lbVip.defaultPos.x - 5);
            this.imgVip.setVisible(false);
        }
    },

    update: function (dt) {
        this.genFireWork(dt);
        downloadEventManager.updateDownload();
        if (eventMgr.isInEvent()) {
            this.imgEmpty.setVisible(false);
            eventMgr.updateEventLoop();
        }
        else {
            this.imgEmpty.setVisible(true);

        }
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable()) {
            return;
        }

        var message = portalMgr.isPortal() ? LocalizedString.to("LOGOUT_GAME_TO_PORTAL") : LocalizedString.to("_ASKEXIT_");
        sceneMgr.showOkCancelDialog(message, this, function (btnID) {
            switch (btnID) {
                case 0: {
                    portalMgr.endGame();
                }
            }
        });
    },

    getPositionComponent: function (type) {
        switch (type) {
            case ShopSuccessData.TYPE_GOLD:
                return this.getGoldIconPosition();
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
                return this.getDiamondIconPosition();
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
