/**
 * Created by HOANGNGUYEN on 7/27/2015.
 */
var BoardScene = BaseLayer.extend({
    ctor: function () {
        this._super("GameScene");
        this._players = [];
        this._effect2D = null;
        this._lastGUI = "";

        this._chatHistories = null;
        this._chatGUI = null;
        this.countPlay = 0;             // so nguoi chat quan trong 1 van (de hien thi effect)
        this.nguoikhacdanhbobaito = false;       // danh dau neu ng khac danh bo bai dac biet
        this.minhdanhbobaito = false;       // danh dau neu minh danh bo bai dac biet
        this.winToiTrang = {
            pos: -1,
            type: GameLayer.END_TYPE_WIN_SAM_DINH,
            cardID: []
        };
        this.playerBao = -1;
        this._cardRecent = [];
        this.hintPool = [];
        this.hintIndex = 0;
        this.hintType = GroupCard.kType_BAIRAC;
        this.logHeight = 0;
        this.sendSam = false;

        this.initWithBinaryFile("GameGUI.json");
    },

    initGUI: function () {
        this.deckCard = this.getControl("deckCard");
        this.deckCard.setVisible(false);
        this.demoCard = this.getControl("demoCard", this.deckCard);
        this.demoCard.setVisible(false);
        this.demoCard.setLocalZOrder(10);
        try {
            this.demoCard.setRotation3D(vec3(0, -53, 90));
        } catch (e) {
            this.demoCard.setRotation(90);
        }

        this.shuffler = db.DBCCFactory.getInstance().buildArmatureNode("Shuffle");
        this.shuffler.setPosition(cc.p(this.deckCard.width / 2, 0));
        this.deckCard.addChild(this.shuffler);
        this.shuffleTime = -1;
    },

    onEnter: function () {
        cc.log("ON ENTER ***************** ");
        BaseLayer.prototype.onEnter.call(this);
        GameLayer.sharedPhoto = false;
        this.onUpdateGUI();
        this.setBackEnable(true);

        this.btnCamera.setEnabled(true);
        this.btnCamera.setOpacity(255);

        this.sendSam = false;

        //RankData
        RankData.addMiniRankGUI(false);
        var miniRankGUI = sceneMgr.getGUI(RankData.MINI_RANK_GUI_TAG);
        if (miniRankGUI) {
            this.btnMiniRank.setVisible(true);
            this.btnMiniRank.setOpacity(255);
        } else {
            this.btnMiniRank.setOpacity(100);
        }

        //Fortune cat
        if (FortuneCatManager.getInstance()) {
            var fortuneCatIcon = new FortuneCatIcon(true);
            FortuneCatManager.getInstance().ingameIcon = fortuneCatIcon;
            this.pTopRight.addChild(fortuneCatIcon);
            this.listTopRight.push(fortuneCatIcon);
        }

        //board voucher
        sceneMgr.openGUI(BoardVoucherGUI.className, BoardVoucherGUI.GUI_TAG, BoardVoucherGUI.GUI_TAG);

        //Event
        this.updateButtonEvent(false);
        eventMgr.setupButtonInGame(this);

        this.updateTopRight();

        this.btnSort.stopAllActions();
        this.btnSort.setRotation(0);
    },

    onExit: function () {

        BaseLayer.prototype.onExit.call(this);
        //GameClient.getInstance().setTargetNotifyNetworkSlow(null);
    },

    networkSlow: function (slow) {
        if (slow) {
            if (!this._layout.getChildByName("bgwifi").isVisible()) {
                this._layout.getChildByName("bgwifi").setVisible(true);
                this._layout.getChildByName("bgwifi").getChildByName("wifi").runAction(new cc.Sequence(cc.delayTime(.5), cc.hide(), cc.delayTime(.5), cc.show()).repeatForever());
            }
        }
        else {
            if (this._layout.getChildByName("bgwifi").isVisible()) {
                this._layout.getChildByName("bgwifi").getChildByName("wifi").stopAllActions();
                this._layout.getChildByName("bgwifi").setVisible(false);
            }
        }
    },

    onEnterFinish: function () {
        if (this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG)) {
            this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG).removeFromParent(true);
        }
        this.stopAutoStart();
        this._cardRecent = [];

        this.notiBg.setVisible(false);
        this._players[0].clearBai();
        this._players[0]._moveCard.setVisible(false);
        for (var i = 1; i < 5; i++) {
            this._players[i]._card.setVisible(false);
        }
        this.btnPlay.setVisible(false);
        this.btnPass.setVisible(false);
        this.btnHint.setVisible(false);

        for (var i = 0; i < 5; i++) {
            this._players[i].resetAction();
        }
        this.notiBg.setVisible(false);
        this._effect2D.clearAll();
        this.deckCard.stopAllActions();
        this.deckCard.setVisible(false);

        this.reason = 0;

        this.getControl("check", this.getControl("btnQuit")).setVisible(false);
        var muccuoc = this.getControl("muccuoc");
        var ban = this.getControl("ban");
        ban.setString(inGameMgr.gameLogic._roomIndex);
        muccuoc.setString(StringUtility.formatNumberSymbol(inGameMgr.gameLogic._bet));
        this.initJackpot();
    },

    playSoundButton: function (id) {
        if (id == GameLayer.BTN_XEPBAI) {
            gameSound.playXepbai();
        }
        else {
            gameSound.playClick();
        }
    },

    createAnim: function (control, anim) {
        cc.log(anim);
        if (control === undefined || control == null || anim === undefined || anim == "") return null;

        if (control.anim) {
            control.removeChild(control.anim);
            control.anim = null;
        }

        var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim);
        if (eff) {
            control.addChild(eff);
            eff.setPosition(control.getContentSize().width / 2, control.getContentSize().height / 2);
            control.anim = eff;
        }
        return eff;
    },

    initJackpot: function () {
        UPDATING_JACKPOT = true;
        var btnjp = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot");
        var jackpot = ccui.Helper.seekWidgetByName(btnjp, "jackpot");

        jackpot.setString("$" + StringUtility.standartNumber(jackpotMgr.jackpot[0][channelMgr.getSelectedChannel()]));

        var introJackpot = this.getControl("introJackpot");
        //cc.log(introJackpot.isVisible());
        var self = this;
        introJackpot.runAction(new cc.Sequence(cc.delayTime(0.5), new cc.Spawn(new cc.CallFunc(function () {
            self.createAnim(this, "TranDiamond");
            this.anim.gotoAndPlay("1", -1);
        }, introJackpot), new cc.FadeOut(0.9))));
        var btn = ccui.Helper.seekWidgetByName(self._layout, "btnJackpot");
        if (!cc.sys.isNative){
            btn.setPositionX(btn.getPositionX() + 40);
        }
        //btn.setVisible(true);
        var listDiamond = ccui.Helper.seekWidgetByName(self._layout, "btnJackpot").getChildByName("listDiamond");
        var dias = listDiamond.getChildren();
        for (var i = 0; i < dias.length; i++) {
            dias[i].setVisible(false);
        }

        btn.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function () {
                this.setVisible(true);
                this.runAction(cc.sequence(
                    cc.callFunc(function () {
                        var jackpot = ccui.Helper.seekWidgetByName(self._layout, "jackpot");
                        jackpot.runAction(cc.sequence(
                            cc.scaleTo(0.2, 0.27),
                            cc.scaleTo(0.2, 0.25)
                        ));

                        for (var j = 0; j < jackpotMgr.jackpot[1][channelMgr.getSelectedChannel()]; j++) {
                            var dia = dias[j];
                            dia.runAction(cc.sequence(
                                cc.delayTime(j * 0.32 + 0.4),
                                cc.show(),
                                cc.scaleTo(0.1, 1.2),
                                cc.scaleTo(0.1, 1)));
                        }

                        for (var j = 0; j < dias.length; j++) {
                            var dia = dias[j];
                            dia.runAction(cc.sequence(
                                cc.delayTime(dias.length * 0.3),
                                cc.scaleTo(0.3, 1.2),
                                cc.callFunc(function () {
                                    self.createAnim(this, "SmallDiamond");
                                    this.anim.gotoAndPlay("1", -1);
                                    this.anim.setCompleteListener(function () {
                                        this.runAction(new cc.ScaleTo(0.1, 1));
                                    }.bind(this));
                                }, dia)
                            ));
                        }
                    }, this)
                ));

                this.runAction(cc.sequence(
                    cc.delayTime(dias.length * 0.32),
                    cc.callFunc(function () {
                        var listDiamond = this.getChildByName("listDiamond");
                        if (jackpotMgr.jackpot[1][channelMgr.getSelectedChannel()] == 4) {
                            self.createAnim(listDiamond, "Bang1");
                            listDiamond.anim.setOpacity(0);
                            listDiamond.anim.runAction(cc.fadeIn(0.25));
                            listDiamond.anim.gotoAndPlay("1", -1);
                        } else {
                            if (listDiamond.anim) {
                                listDiamond.removeChild(listDiamond.anim);
                                listDiamond.anim = null;
                            }
                        }
                        UPDATING_JACKPOT = false;
                    }, this)
                ));
            }, btn)
        ));

        btn.runAction(cc.sequence(
            cc.delayTime(dias.length * 0.32 + 2.9),
            cc.callFunc(function () {
                UPDATING_JACKPOT = false;
                cc.log("updating jackpot", UPDATING_JACKPOT);
            }, btn)
        ));
    },

    updateJackpotGUI: function () {
        fr.crashLytics.log("updateJackpotGUI 1");
        if (UPDATING_JACKPOT) {
            //cc.log("trueeeeeeeeeeeee");
            return;
        }
        UPDATING_JACKPOT = true;
        //cc.log("jackpotupdate");
        var config = jackpotMgr.getJackpotConfig(channelMgr.getSelectedChannel());
        var listDiamond = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot").getChildByName("listDiamond");
        this.dias = listDiamond.getChildren();
        for (var i = 0; i < this.dias.length; i++) {
            if (this.dias[i] instanceof ccui.ImageView) {
                this.dias[i].loadTexture(config.diamond);
            }
        }
        this.btnjp = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot");
        var self = this;

        fr.crashLytics.log("updateJackpotGUI 2");
        //cc.log(jackpotMgr.jackpot[0][channelMgr.getSelectedChannel()]);
        var jackpot = ccui.Helper.seekWidgetByName(this._layout, "jackpot");
        jackpot.setString("$" + StringUtility.standartNumber(jackpotMgr.jackpot[0][channelMgr.getSelectedChannel()]));

        try {
            var lastVisible = -1;
            for (var j = 0; j < jackpotMgr.jackpot[1][channelMgr.getSelectedChannel()]; j++) {
                var dia = this.dias[j];
                if (dia.isVisible() === false) {
                    dia.runAction(cc.sequence(
                        cc.callFunc(function () {
                            this.setVisible(true);
                        }, dia),
                        cc.scaleTo(0.2, 1.2),
                        cc.callFunc(function () {
                            self.createAnim(this, "SmallDiamond");
                            this.anim.gotoAndPlay("1", -1);
                            this.anim.setCompleteListener(function () {
                                this.runAction(cc.scaleTo(0.1, 1));
                            }.bind(this));
                        }, dia)
                    ));
                } else {
                    lastVisible = j;
                }
            }
            for (j = jackpotMgr.jackpot[1][channelMgr.getSelectedChannel()]; j < this.dias.length; j++) {
                this.dias[j].setVisible(false);
            }
            self.runAction(cc.sequence(
                cc.delayTime((lastVisible + 1) * 0.32 + 0.4),
                cc.callFunc(function () {
                    var listDiamond = this.btnjp.getChildByName("listDiamond");
                    if (jackpotMgr.jackpot[1][channelMgr.getSelectedChannel()] == 4) {
                        self.createAnim(listDiamond, "Bang1");
                        listDiamond.anim.gotoAndPlay("1", -1);
                    } else {
                        if (listDiamond.anim) {
                            listDiamond.removeChild(listDiamond.anim);
                            listDiamond.anim = null;
                        }
                    }
                }, self)));
            fr.crashLytics.log("updateJackpotGUI 3");
            this.btnjp.runAction(cc.sequence(
                cc.delayTime(this.dias.length * 0.32 + 1),
                cc.callFunc(function () {
                    UPDATING_JACKPOT = false;
                    cc.log("updating jackpot", UPDATING_JACKPOT);
                }, this.btnjp)
            ));
        } catch (e) {
            fr.crashLytics.log("updateJackpotGUI loi: " + e);
        }

        fr.crashLytics.log("updateJackpotGUI 4");
    },

    customizeGUI: function () {
        var btnCheat = this.customizeButton("btnCheat", GameLayer.BTN_CHEAT);
        cc.log("BTN CHEAT " + btnCheat);
       btnCheat.setVisible(Config.ENABLE_CHEAT);
        btnCheat.setOpacity(255);
        // btnCheat.setScale(10);
        var btnAddBot = this.customizeButton("btnAddBot", GameLayer.BTN_ADD_BOT);
        btnAddBot.setVisible(Config.ENABLE_CHEAT)
        btnAddBot.setOpacity(255);

        this.customizeButton("btnQuit", GameLayer.BTN_QUIT);
        this.btnSort = this.customizeButton("btnXepbai", GameLayer.BTN_XEPBAI);
        this.btnSort.setLocalZOrder(GameLayer.EFFECT_ZORDER);

        this.bg = this.getControl("bg");

        this.pTopRight = this.getControl("panel_button");
        this.listTopRight = [];
        this.btnCamera = this.customizeButton("btnCamera", GameLayer.BTN_CAMERA, this.pTopRight);
        this.btnCamera.setVisible(cc.sys.isNative);
        this.listTopRight.push(this.btnCamera);
        this.btnMiniRank = this.customizeButton("btnNewRank", GameLayer.BTN_NEW_RANK, this.pTopRight);
        this.listTopRight.push(this.btnMiniRank);
        this.btnMiniRank.pArrow = this.getControl("pArrow", this.btnMiniRank);
        this.btnMiniRank.pArrow.setClippingEnabled(true);
        this.btnMiniRank.txtExpChange = this.getControl("txtExpChange", this.btnMiniRank);
        this.btnMiniRank.txtExpChange.setVisible(false);
        this.btnMiniRank.txtExpChange.ignoreContentAdaptWithSize(true);
        this.btnEvent = this.customizeButton("btnEvent", GameLayer.BTN_EVENT, this.pTopRight);
        this.btnEvent.setPressedActionEnabled(false);
        this.listTopRight.push(this.btnEvent);
        this.btnEvent.ticket = this.getControl("ticket", this.btnEvent);
        this.btnEvent.ticket.ignoreContentAdaptWithSize(true);
        this.btnEvent.quantity = this.getControl("quantity", this.btnEvent);
        this.btnEvent.number = 0;
        this.btnEvent.progress = this.getControl("progress", this.btnEvent);
        this.btnEvent.efxTicket = this.getControl("effectTicket", this.btnEvent);
        this.btnEvent.efxTicket.setLocalZOrder(-1);
        this.btnEvent.efxNumber = this.getControl("number", this.btnEvent.efxTicket);
        this.btnEvent.efxImage = this.getControl("image", this.btnEvent.efxTicket);
        this.updateTopRight();

        this.btnPass = this.customizeButton("btnBoluot", GameLayer.BTN_BOLUOT);
        this.btnPass.setVisible(false);
        this.btnPass.imgDisabled = this.getControl("arrow", this.btnPass);
        this.btnPass.pointer = db.DBCCFactory.getInstance().buildArmatureNode("Pointer");
        this.btnPass.pointer.setAnchorPoint(cc.p(0.5, 0));
        this.btnPass.pointer.setPosition(cc.p(this.btnPass.width / 2, this.btnPass.height));
        this.btnPass.addChild(this.btnPass.pointer);

        this.btnPlay = this.customizeButton("btnDanh", GameLayer.BTN_DANH);
        this.btnPlay.setVisible(false);
        this.btnPlay.imgDisabled = this.getControl("arrow", this.btnPlay);
        this.btnPlay.pointer = db.DBCCFactory.getInstance().buildArmatureNode("Pointer");
        this.btnPlay.pointer.setAnchorPoint(cc.p(0.5, 0));
        this.btnPlay.pointer.setPosition(cc.p(this.btnPlay.width / 2, this.btnPlay.height));
        this.btnPlay.addChild(this.btnPlay.pointer);

        this.btnHint = this.customizeButton("btnHint", GameLayer.BTN_HINT);
        this.btnHint.setVisible(false);
        this.btnHint.imgDisabled = this.getControl("arrow", this.btnHint);
        this.btnHint.imgDisabled.setVisible(false);

        this.autoStartPanel = this.getControl("autoStart");
        this.btnStart = this.customizeButton("btnStart", GameLayer.BTN_START, this.autoStartPanel);
        this.autoStartPanel.setVisible(false);
        this.autoStartPanel.lbTime = this.getControl("time", this.autoStartPanel);

        this.notiBg = this.getControl("bg3");

        this.btnPlay.cothedanh = false;
        //run animation btnjackpot
        var btnjp = this.customizeButton("btnJackpot", GameLayer.BTN_JACKPOT);
        btnjp.setPressedActionEnabled(false);
        var introJackpot = this.getControl("introJackpot");

        var config = jackpotMgr.getJackpotConfig(channelMgr.selectedChanel);
        //cc.log(config.intro);
        //introJackpot.loadTexture(config.intro);
        var listDiamond = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot").getChildByName("listDiamond");
        var dias = listDiamond.getChildren();
        for (var i = 0; i < dias.length; i++) {
            dias[i].loadTexture(config.diamond);
        }

        var jackpot = ccui.Helper.seekWidgetByName(btnjp, "jackpot");

        if (cc.sys.os == cc.sys.OS_WP8) {
            if (socialMgr._currentSocial != SocialManager.ZALO) {
                this._layout.getChildByName("btnInvite").setPosition(this._layout.getChildByName("btnCamera").getPosition());
                this._layout.getChildByName("btnCamera").setVisible(false);
            }
        }

        cc.log("CREATE NEW PLAYER");
        this.logForIOS("Start init player");
        for (var i = 0; i < 5; i++) {
            var panel = this._layout.getChildByName("panel" + i);
            var btn = this.getControl("btn", panel);
            btn.setPressedActionEnabled(false);
            btn.setTag(i + GameLayer.BTN_AVATAR_0);
            btn.addTouchEventListener(this.onTouchEventHandler, this);

            this.logForIOS("PLAYER_" + i);
            var player = (i === 0)? new MyView(this) : new PlayerView(this);
            player.setPanel(panel);
            player.setLocalZOrder(-1);
            player.posEmoticon = panel.convertToWorldSpace(btn.getPosition());
            player.initWithScene(this, i);

            this.addChild(player);
            this._players.push(player);
        }

        this._effect2D = new LayerEffect2D(this);
        this.addChild(this._effect2D);
        this._effect2D.setLocalZOrder(GameLayer.EFFECT_ZORDER);

        this.pTooltip = this.getControl("toolTip");
        this.pTooltip.setLocalZOrder(GameLayer.EFFECT_ZORDER);
        this.pTooltip.lb = this.getControl("lb", this.pTooltip);

        this._chatHistories = [];

        var pChat = this.getControl("pChat", this._layout);
        this.customButton("btnQuickChat", GameLayer.BTN_QUICK_CHAT, pChat);
        this.customButton("btnQuickEmote", GameLayer.BTN_QUICK_EMO, pChat);

        if (Config.ENABLE_NEW_VIP){
            // this.chatEmoPanelGUI = new ChatEmoPanel();
            // this.addChild(this.chatEmoPanelGUI);
            // this.chatEmoPanelGUI.setVisible(false);
            // this.chatEmoPanelGUI.setPosition(pChat.getPosition());
            // this.chatEmoPanelGUI.setLocalZOrder(100);
        } else {
            // var pEmo = this.getControl("pEmoticon");
            // this.chatEmoPanelGUI = new ChatEmoPanelGUI();
            // sceneMgr.layerGUI.addChild(this.chatEmoPanelGUI);
            // this.chatEmoPanelGUI.setPosition(pEmo.getPosition());
            // this.chatEmoPanelGUI.defaultPos = pEmo.getPosition();
            // this.chatEmoPanelGUI.setVisible(false);
        }

        // if (event.isInEvent(Event.MID_AUTUMN)) {
        //     this.initEventMidAutumn();
        // }
        // if (event.isInEvent(Event.BLUE_OCEAN)) {
        //     this.initEventBlueOcean();
        // }
        this.logForIOS("customizeGUI");
    },

    updateTopRight: function () {
        var marginX = 10;
        var marginY = 10;
        var margin = cc.p(marginX, marginY);
        for (var i = 0; i < this.listTopRight.length; i++) {
            var button = this.listTopRight[i];
            if (!button.isVisible()) {
                continue;
            }

            var anchorPoint = this.listTopRight[i].getAnchorPoint();
            button.setPosition(cc.p(
                - margin.x - (1 - anchorPoint.x) * button.getContentSize().width * button.getScaleX(),
                - margin.y - (1 - anchorPoint.y) * button.getContentSize().height * button.getScaleY()
            ));
            margin.x += marginX + button.width * button.getScaleX();
        }
    },

    initEventBlueOcean: function () {
        blueOcean.createButtonInGame(cc.p(cc.winSize.width , cc.winSize.height * 0.3), this);
    },

    initEventMidAutumn: function () {
        var array = [];
        var arrayPos = [];
        for (var i = 0; i < this._players.length; i++) {
            array.push(this._players[i]._panel.getChildByName("mask"));
            arrayPos.push(cc.p(5, 60));
        }
        midAutumn.initArrayPlayer(array, arrayPos);
        midAutumn.createButtonInGame(cc.p(cc.winSize.width , cc.winSize.height * 0.3), this);
    },

    getPosWeeklyChallenge: function () {
        var btn = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot");
        var parent = btn.getParent();
        var pos = cc.p(
            btn.getPositionX() + btn.getContentSize().width * 0.5,
            btn.getPositionY() - btn.getContentSize().height * 0.5
        );
        pos = parent.convertToWorldSpace(pos);
        pos = this._layout.convertToNodeSpace(pos);
        return pos;
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable([BoardVoucherGUI.className]))
            return;

        if (this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG))
            return;
        if (this.getChildByTag(GameLayer.CHAT_GUI)) {
            this.getChildByTag(GameLayer.CHAT_GUI).removeFromParent(true);
            return;
        }
        this.onButtonRelease(null, GameLayer.BTN_QUIT);
    },

    onUpdateGUI: function (data) {
        cc.log("UPDATE GUI " + JSON.stringify(data));
        if (!inGameMgr.gameLogic)
            return;

        if (data && data == "updateJackpot") {
            return;
        }
        if (data && data.jackpotPacket) {
            return;
        }

        if (inGameMgr.gameLogic._gameState === GameState.ENDGAME) {
            fr.crashLytics.log("End game step 1");
        }
        cc.log("UPDATE GUI inGameMgr.gameLogic._gameState " + inGameMgr.gameLogic._gameState);
        switch (inGameMgr.gameLogic._gameState) {
            case GameState.JOINROOM:
            {
                var muccuoc = this.getControl("muccuoc");
                var ban = this.getControl("ban");

                ban.setString(inGameMgr.gameLogic._roomIndex);
                muccuoc.setString(StringUtility.formatNumberSymbol(inGameMgr.gameLogic._bet));
                this.stopAutoStart();


                for (var i = 0; i < 5; i++) {
                    this._players[i].updateWithPlayer(inGameMgr.gameLogic._players[i]);
                    if (inGameMgr.gameLogic._players[i]._ingame) {
                        this._players[i].efxPlayerIn();
                        this._players[i].addVipEffect();
                    }
                }
                this.updateStartButton();
                this.updateOwnerRoom(inGameMgr.gameLogic._roomOwnerID)

                cc.log("JOINGAME CHECKING WHAT IS GAMEACTION", inGameMgr.gameLogic.gameAction);
                cc.log("JOINGAME CHECKING USER INFO", JSON.stringify(inGameMgr.gameLogic._players));
                if (inGameMgr.gameLogic._players[0]._status === 1) {
                    for (var i = 1; i < 5; i++) {
                        if ((inGameMgr.gameLogic._players[i]._status !== 0) &&
                            (inGameMgr.gameLogic._players[i]._status !== 1) &&
                            (inGameMgr.gameLogic._players[i]._remainCard > 0)
                        ) {
                            this._players[i]._card.setVisible(true);
                            this._players[i]._numCard.setString("" + inGameMgr.gameLogic._players[i]._remainCard);
                            if (inGameMgr.gameLogic._players[i]._remainCard === 1) {
                                this._players[i].addBao1();
                            }
                        }
                    }

                    if (inGameMgr.gameLogic.gameAction === 4) {
                        cc.log(
                            "current " +
                            inGameMgr.gameLogic._activeLocalChair +
                            "   time:" +
                            inGameMgr.gameLogic.activeTimeRemain
                        );
                        this._players[inGameMgr.gameLogic._activeLocalChair].addEffectTime(inGameMgr.gameLogic.activeTimeRemain);
                    }
                }
                this.btnSort.stopAllActions();
                this.btnSort.setVisible(false);

                this.updateDecorate();

                gameSound.playVaobanNoi();
                break;
            }
            case GameState.PLAYCONTINUE:
            {
                // Cap nhat thong tin phong choi
                var muccuoc = this.getControl("muccuoc");
                var ban = this.getControl("ban");

                ban.setString(inGameMgr.gameLogic._roomIndex);
                muccuoc.setString(StringUtility.formatNumberSymbol(inGameMgr.gameLogic._bet));

                for (var i = 0; i < 5; i++) {
                    this._players[i].resetAction();
                    this._players[i].updateWithPlayer(inGameMgr.gameLogic._players[i]);
                    this._players[i].addVipEffect();
                }

                // Dua vao trang thai cua game de reconnect
                switch (inGameMgr.gameLogic._serverGameState) {
                    case 1:                         // playing
                        for (var i = 1; i < 5; i++) {
                            if (inGameMgr.gameLogic._players[i]._ingame) {
                                this._players[i]._card.setVisible(true);
                                this._players[i]._numCard.setString("" + inGameMgr.gameLogic._players[i]._info["cards"]);
                                if (inGameMgr.gameLogic._players[i]._info["cards"] === 0) {
                                    this._players[i]._card.setVisible(false);
                                } else if (inGameMgr.gameLogic._players[i]._info["cards"] === 1) {
                                    this._players[i].addBao1();
                                }
                            }
                        }

                        cc.log("ACTION GAME RECONNECT  = " + JSON.stringify(inGameMgr.gameLogic));

                        switch (inGameMgr.gameLogic._serverGameAction) {
                            case 4:  // Choi game binh thuong
                                this._players[0].clearBai();
                                this._players[0].initCards(inGameMgr.gameLogic._cardChiabai);
                                this.btnSort.setVisible(true);

                                var localChairTurn = inGameMgr.gameLogic.convertChair(inGameMgr.gameLogic._chairTurn);
                                this._players[localChairTurn].addEffectTime(inGameMgr.gameLogic._timeRemain);

                                if (inGameMgr.gameLogic._cardRecent.length > 0) {
                                    this._effect2D.clearBaiDanh();
                                    this._effect2D.addRecentBai(inGameMgr.gameLogic._cardRecent);
                                    this._cardRecent = inGameMgr.gameLogic._cardRecent;
                                }
                                if (localChairTurn === 0) {
                                    this.newRound = inGameMgr.gameLogic.newRound;
                                    this.hintPool = [];
                                    if (this.newRound) {
                                        this.updateActionButton(this.btnPlay, false, false);
                                        this.updateActionButton(this.btnPass, false, true);
                                        this.updateActionButton(this.btnHint, false, false);
                                        this.hintIndex = 0;
                                        this.hintType = GroupCard.kType_BAIRAC;
                                    }

                                    if (this.kiemtraBoluot()) {
                                        this.kiemtraDanhbai();
                                    } else {
                                        cc.log("KHONG THE DANH");
                                        this.btnPass.runAction(cc.sequence(
                                            cc.delayTime(5),
                                            cc.callFunc(function () {
                                                var pk = new CmdSendDanhBai();
                                                pk.putData(true);
                                                GameClient.getInstance().sendPacket(pk);
                                                pk.clean();
                                            })
                                        ));
                                    }
                                } else {
                                    this.btnPlay.setVisible(false);
                                    this.btnPass.setVisible(false);
                                    this.btnHint.setVisible(false);
                                }

                                var someOneBao = false;
                                for (var i = 0; i < 5; i++) {
                                    if (inGameMgr.gameLogic._players[i]._ingame) {
                                        if (inGameMgr.gameLogic._players[i]._info["baosam"]) {
                                            this._players[i].bao();
                                            someOneBao = true;
                                        }
                                    }
                                }
                                for (var i = 0; i < 5; i++) {
                                    if (inGameMgr.gameLogic._players[i]._ingame) {
                                        if (!inGameMgr.gameLogic._players[i]._info["baosam"]) {
                                            this._players[i].clearBao();
                                        }
                                    }
                                }
                                break;
                            case 2:         // Dang bao sam
                                this._players[0].clearBai();
                                this._players[0].initCards(inGameMgr.gameLogic._cardChiabai);
                                this.btnSort.setVisible(true);
                                for (var i = 1; i < 5; i++) {
                                    if (inGameMgr.gameLogic._players[i]._ingame) {
                                        this._players[i]._card.setVisible(true);
                                        this._players[i]._numCard.setString("" + 10);
                                        if (inGameMgr.gameLogic._players[i]._info["baosam"]) {
                                            this._players[i].bao();
                                        } else {
                                            if (inGameMgr.gameLogic._players[i]._info["huybaosam"]) {
                                                this._players[i].baoCancel();
                                            }
                                        }
                                    }
                                }

                                if (inGameMgr.gameLogic._players[0]._info["baosam"]) {
                                    this._players[0].bao();
                                } else {
                                    if (inGameMgr.gameLogic._players[0]._info["huybaosam"]) {
                                        this._players[0].baoCancel();
                                    } else {
                                        this.addBaoSamLayer(inGameMgr.gameLogic._timeRemain, inGameMgr.gameLogic.typeToiTrang);
                                    }
                                }
                                break;
                        }
                        break;
                    case 0:     // chua start game
                        break;
                    case 2:     // endgame
                        break;
                }

                this.updateDecorate();
                break;
            }
            case GameState.USERJOIN:
                this._players[inGameMgr.gameLogic._activeLocalChair].updateWithPlayer(
                    inGameMgr.gameLogic._players[inGameMgr.gameLogic._activeLocalChair]
                );
                this._players[inGameMgr.gameLogic._activeLocalChair].efxPlayerIn();
                this._players[inGameMgr.gameLogic._activeLocalChair].addVipEffect();
                if (inGameMgr.gameLogic._players[inGameMgr.gameLogic._activeLocalChair]._status !== 1)
                    this.updateStartButton();

                this.updateDecorate();
                break;
            case GameState.USERLEAVE:
            {
                if (inGameMgr.gameLogic._players[inGameMgr.gameLogic._activeLocalChair]._status !== 1) {
                    this.updateStartButton();
                }

                this._players[inGameMgr.gameLogic._activeLocalChair].efxPlayerOut();
                this._players[inGameMgr.gameLogic._activeLocalChair].updateWithPlayer(
                    inGameMgr.gameLogic._players[inGameMgr.gameLogic._activeLocalChair]
                );
                break;
            }
            case GameState.AUTOSTART:
            {
                if (data && data.isCancel) {
                    if (inGameMgr.gameLogic._timeAutoStart > 0) {
                        this.shuffleTime = -1;
                        this.deckCard.stopAllActions();
                        this.deckCard.setVisible(false);
                        this.addAutoStart(inGameMgr.gameLogic._timeAutoStart);
                    } else {
                        this.stopAutoStart();
                        this.shuffleCard();
                    }
                }
                if (data && (!data.isCancel)) {
                    this.stopAutoStart();
                }
                this.updateStartButton();
                break;
            }
            case GameState.UPDATEOWNERROOM:
            {
                if (data) {
                    this.updateStartButton();
                }
                break;
            }
            case GameState.FIRSTTURN:
            {
                if (!data) return;
                this._players[0].clearBai();
                this.btnStart.setVisible(false);

                var delayToolTip = 0;
                var localChair = inGameMgr.gameLogic.convertChair(data.chair);
                if (data.isRandom) {
                    for (var i = 0; i < 5; i++) {
                        var id = inGameMgr.gameLogic._cardFirstTurn[i];
                        var chair = inGameMgr.gameLogic.convertChair(i);
                        if (inGameMgr.gameLogic._players[chair]._ingame &&
                            inGameMgr.gameLogic._players[chair]._status !== 1) {
                            this._players[chair].firstTurn(id).setVisible(true);
                            delayToolTip = this._effect2D.firstTurn(this._players[chair], this.demoCard, chair === localChair);
                        }
                    }
                }

                this.notiBg.getChildByName("text").setString(
                    inGameMgr.gameLogic._players[localChair]._info["uName"] + " được đi lượt đầu tiên !"
                );
                this.notiBg.setVisible(true);
                this.notiBg.setLocalZOrder(GameLayer.EFFECT_ZORDER);
                this.notiBg.setOpacity(0);
                this.notiBg.runAction(cc.sequence(
                    cc.delayTime(delayToolTip),
                    cc.fadeIn(.25),
                    cc.delayTime(3),
                    cc.fadeOut(.5),
                    cc.hide()
                ));
                this.effectTooltip(this.notiBg, delayToolTip + 0.25);
                this.stopAutoStart();

                break;
            }
            case GameState.CHIABAI:
            {
                try {
                    this.stopAction(this.clearResultAction);c
                } catch (e) {}
                RankData.checkOpenRank(false);

                /** Game sound */
                gameSound.playStart2();
                this.playChia = function () {
                    gameSound.playChiaBai();
                }
                this.runAction(cc.sequence(
                    cc.delayTime(.25),
                    cc.callFunc(function () {
                        gameSound.playChiaBai();
                        gameSound.playChiabaiNoi();
                    }),
                    cc.delayTime(.5),
                    cc.callFunc(this.playChia),
                    cc.delayTime(.35),
                    cc.callFunc(this.playChia)
                ));

                /** Game sound */
                for (var i = 1; i < 5; i++) {
                    if (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status > 1)) {
                        this._players[i].resetAction();
                        this._players[i]._numCard.setString("0");

                        this._players[i]._cardFirstTurn.stopAllActions();
                        this._players[i]._cardFirstTurn.runAction(cc.fadeOut(0.1));
                    }
                }
                this._players[0].resetAction();
                this._players[0].clearBai();
                this._players[0]._cardFirstTurn.setVisible(false);
                this._players[0].initCards(inGameMgr.gameLogic._cardChiabai);

                var timeDeal = 0;
                for (var i = 0; i < 5; i++) {
                    if (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status > 1)) {
                        this._players[i].isBao = false;
                        timeDeal = this._effect2D.chiabai(this._players[i], this.demoCard);
                    }
                }
                this.deckCard.runAction(cc.sequence(
                    cc.delayTime(timeDeal),
                    cc.hide()
                ));
                timeDeal += 1;
                this.playerBao = -1;
                inGameMgr.gameLogic._timeBaoSam -= timeDeal;

                this.callbackAddBaoSam = function (sender, typeToiTrang) {
                    this.btnSort.setVisible(true);
                    this._players[0].enableTouch(true);
                    this.addBaoSamLayer(inGameMgr.gameLogic._timeBaoSam, typeToiTrang);

                    for (var i = 1; i < 5; i++) {
                        if (inGameMgr.gameLogic._players[i]._ingame &&
                            inGameMgr.gameLogic._players[i]._status !== 1 &&
                            !this._players[i].baoPanel.isVisible()) {
                            this._players[i].stopEffectTime();
                            this._players[i].addEffectTime(inGameMgr.gameLogic._timeBaoSam);
                        }
                    }
                }

                cc.log("TIME DEAL", timeDeal);
                if (data)
                    this.runAction(cc.sequence(
                        cc.delayTime(timeDeal),
                        cc.callFunc(this.callbackAddBaoSam.bind(this), this, data.toiTrang)
                    ));
                break;
            }
            case GameState.BAOSAM:
            {
                var localChair = inGameMgr.gameLogic.convertChair(data.chair);
                this._players[localChair].stopEffectTime();
                this._players[localChair].bao();
                break;
            }
            case GameState.HUYBAOSAM:
            {
                if (!data) return;

                var localChair = inGameMgr.gameLogic.convertChair(data.chair);
                this._players[localChair].stopEffectTime();
                this._players[localChair].baoCancel();

                if (localChair == 0)
                    gameSound.playHuysam();

                break;
            }
            case GameState.QUYETDINHSAM:
            {
                if (this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG)) {
                    this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG).removeFromParent(true);
                }

                var localChair = -1;
                if (data && data.baosam) {
                    localChair = inGameMgr.gameLogic.convertChair(data.chair);
                    this.playerBao = localChair;
                    this._players[localChair].baoNormalize();

                    var text = localized("NOTIFY_GAME_1");
                    text = StringUtility.replaceAll(text, "@name", inGameMgr.gameLogic._players[localChair]._info["uName"]);

                    this.notiBg.getChildByName("text").setString(text);
                    this.notiBg.setVisible(true);
                    this.notiBg.setOpacity(0);
                    this.notiBg.runAction(cc.sequence(
                        cc.fadeIn(.5),
                        cc.delayTime(3),
                        cc.fadeOut(.5),
                        cc.hide()
                    ));
                    this.effectTooltip(this.notiBg, 0.5);
                }

                for (var i = 0; i < 5; i++) {
                    this._players[i].stopEffectTime();
                    if (localChair === -1 || localChair !== i) this._players[i].clearBao();
                }
                break;
            }
            case GameState.DANHBAI:
            {
                if (data) {
                    //cc.log("bai vua danh: "+JSON.stringify(data));
                    if (inGameMgr.gameLogic._activeLocalChair !== 0) {
                        this._players[inGameMgr.gameLogic._activeLocalChair]._card.setVisible(true);
                        this._players[inGameMgr.gameLogic._activeLocalChair]._numCard.setString("" + data.numberCard);
                        if (data.numberCard === 0) {
                            this._players[inGameMgr.gameLogic._activeLocalChair]._card.setVisible(false);
                            this._players[inGameMgr.gameLogic._activeLocalChair].removeBao1();
                        }
                        else if (data.numberCard === 1) {
                            this._players[inGameMgr.gameLogic._activeLocalChair].addBao1();
                        }
                    }

                    var cards = [];
                    for (var i = 0; i < inGameMgr.gameLogic._cardDanhbai.length; i++) {
                        cards.push(new Card(inGameMgr.gameLogic._cardDanhbai[i]));
                    }

                    var group = new GroupCard(cards);
                    switch (group._typeGroup) {
                        case GroupCard.kType_BAIRAC:
                            if (cards[0]._quanbai === 2) this._effect2D.effectPigs();
                            break;
                        case GroupCard.kType_TUQUY:
                        case GroupCard.kType_DOITUQUY:
                            this._effect2D.tuquy(group._typeGroup === GroupCard.kType_DOITUQUY);
                            break;
                        case GroupCard.kType_DOI:
                        case GroupCard.kType_BALA:
                        case GroupCard.kType_SANHDOC:
                            this._effect2D.multiPlayEffect(group._typeGroup);
                            break;
                    }

                    var bobaidacbiet = false;
                    if (group._typeGroup === GroupCard.kType_TUQUY ||
                        group._typeGroup === GroupCard.kType_DOITUQUY ||
                        (group._typeGroup === GroupCard.kType_SANHDOC && group._cards.length >= 5) ||
                        (group._cards[0]._quanbai === Card.kQuanbai_2 && (
                            group._typeGroup === GroupCard.kType_BAIRAC ||
                            group._typeGroup === GroupCard.kType_DOI ||
                            group._typeGroup === GroupCard.kType_BALA
                        ))) {
                        bobaidacbiet = true;
                    }


                    if (this.newRound) {
                        if (inGameMgr.gameLogic._activeLocalChair === 0) {
                            if (bobaidacbiet) {
                                gameSound.playBobaitodautien();
                            } else {
                                gameSound.playLuotdau();
                            }
                        }
                    } else {
                        if (bobaidacbiet) {
                            if (inGameMgr.gameLogic._activeLocalChair === 0) {
                                if (this.nguoikhacdanhbobaito)  // minh chat duoc bo bai to cua nguoi khac
                                    gameSound.playMinhchatduocbobaito();
                                else            // minh dung` 2 chat bo bai ghe?
                                    gameSound.playBobaitodautien();
                            } else {
                                cc.log(this.minhdanhbobaito);
                                if (this.minhdanhbobaito) {
                                    gameSound.playMinhdanhbaitovabibat();
                                } else {
                                    //gameSound.playChatbai();
                                }
                            }
                        } else {
                            //gameSound.playChatbai();
                        }
                    }

                    if (bobaidacbiet) {
                        if (inGameMgr.gameLogic._activeLocalChair === 0) {
                            this.minhdanhbobaito = true;
                            this.nguoikhacdanhbobaito = false;
                        } else {
                            this.minhdanhbobaito = false;
                            this.nguoikhacdanhbobaito = true;
                        }
                    } else {
                        this.minhdanhbobaito = false;
                        this.nguoikhacdanhbobaito = false;
                    }

                    if (inGameMgr.gameLogic._activeLocalChair === 0) {
                        if (group._typeGroup === GroupCard.kType_SANHDOC &&
                            group._cards[group._cards.length - 1]._quanbai === Card.kQuanbai_A) {
                            gameSound.playSanhtoicot();
                        }
                    }

                    if (this.newRound) {
                        this._effect2D.clearBaiDanh();
                    } else {
                        this._effect2D.darkenPlayedCards();
                    }
                    this._players[inGameMgr.gameLogic._activeLocalChair].autoing(data.isAuto);
                    this._players[inGameMgr.gameLogic._activeLocalChair].autoPlayCard();
                    this._players[inGameMgr.gameLogic._activeLocalChair].stopEffectTime();
                    this._effect2D.playCards(this._players[inGameMgr.gameLogic._activeLocalChair].danhbai(inGameMgr.gameLogic._cardDanhbai));
                    this._cardRecent = inGameMgr.gameLogic._cardDanhbai;
                    if (this.playerBao !== -1 && this.playerBao !== inGameMgr.gameLogic._activeLocalChair)
                        this._players[this.playerBao].addGotSamBlock();

                    // aadd effect mat cuoi khi danh nhieu hon 3 bai`
                    this.countPlay++;
                    var lastPlayer = inGameMgr.gameLogic._activeLocalChair;
                    switch (group._typeGroup) {
                        case GroupCard.kType_BAIRAC:
                            if (cards[0]._quanbai === 2)
                                this._players[inGameMgr.gameLogic._activeLocalChair].addSmile(PlayerView.EMOTION.HAPPY);
                            break;
                        case GroupCard.kType_TUQUY:
                        case GroupCard.kType_DOITUQUY:
                            if (this._cardRecent.length > 0) {
                                for (var i = 1; i < 5; i++) {
                                    var index = lastPlayer - i;
                                    if (index < 0) index += 5;
                                    if (inGameMgr.gameLogic._players[index]._ingame &&
                                        this._players[index] &&
                                        (
                                            this._players[index].passPanel.getScale() !== 1 ||
                                            this._players[index].passPanel.isVisible() === false
                                        ) &&
                                        !this._players[index].view.isVisible()
                                    ) {
                                        lastPlayer = index;
                                        break;
                                    }
                                }
                                this._players[inGameMgr.gameLogic._activeLocalChair].addSmile(PlayerView.EMOTION.MISCHIEF);
                                if (!this.newRound) this._players[lastPlayer].addSmile(PlayerView.EMOTION.ANGRY);
                            } else {
                                this._players[inGameMgr.gameLogic._activeLocalChair].addSmile(PlayerView.EMOTION.HAPPY);
                            }
                            break;
                        case GroupCard.kType_SANHDOC:
                            if (cards.length > 4) {
                                if (this._cardRecent.length > 0) {
                                    for (var i = 1; i < 5; i++) {
                                        var index = lastPlayer - i;
                                        if (index < 0) index += 5;
                                        if (inGameMgr.gameLogic._players[index]._ingame && this._players[index] &&
                                            (this._players[index].passPanel.getScale() !== 1 || this._players[index].passPanel.isVisible() === false))  {
                                            lastPlayer = index;
                                            break;
                                        }
                                    }
                                    this._players[inGameMgr.gameLogic._activeLocalChair].addSmile(PlayerView.EMOTION.MISCHIEF);
                                    if (!this.newRound) this._players[lastPlayer].addSmile(PlayerView.EMOTION.SAD);
                                } else {
                                    this._players[inGameMgr.gameLogic._activeLocalChair].addSmile(PlayerView.EMOTION.HAPPY);
                                }
                            }
                            break;
                    }
                }
                break;
            }
            case GameState.BOLUOT:
            {
                if (data) {
                    this._players[inGameMgr.gameLogic.convertChair(data.chair)].boluot();
                    this._players[inGameMgr.gameLogic.convertChair(data.chair)].autoing(data.isAuto);
                    if (inGameMgr.gameLogic.convertChair(data.chair) === 0 && this.nguoikhacdanhbobaito) {
                        gameSound.playMinhkhongchatduocbobaito();
                        cc.log("minh gap bo bai to khong bat dc");
                    } else {
                        if (inGameMgr.gameLogic.convertChair(data.chair) === 0) gameSound.playBoluot();

                    }
                }

                break;
            }
            case GameState.CHANGETURN:
            {
                if ((inGameMgr.gameLogic._activeLocalChair >= 0 ) && (inGameMgr.gameLogic._activeLocalChair <= 4)) {
                    for (var i = 0; i < 5; i++) {
                        this._players[i].stopEffectTime();
                    }
                    this.newRound = data.newRound;
                    if (data.newRound) {
                        this._effect2D.clearBaiDanh();
                        for (var i = 0; i < 5; i++) {
                            this._players[i].clearBoluot();
                            this._players[i].clearBao();
                        }
                        this.countPlay = 0;
                    }

                    this.btnPass.stopAllActions();
                    if (inGameMgr.gameLogic._activeLocalChair === 0) {
                        this.hintPool = [];
                        if (this.newRound) {
                            this.updateActionButton(this.btnPlay, false, false);
                            this.updateActionButton(this.btnPass, false, true);
                            this.updateActionButton(this.btnHint, false, false);
                            this.hintIndex = 0;
                            this.hintType = GroupCard.kType_BAIRAC;
                        }

                        if (this.kiemtraBoluot()) {
                            this.kiemtraDanhbai();
                        } else {
                            cc.log("KHONG THE DANH");
                            data.time = Math.min(5, data.time);
                            this.btnPass.runAction(cc.sequence(
                                cc.delayTime(5),
                                cc.callFunc(function () {
                                    var pk = new CmdSendDanhBai();
                                    pk.putData(true);
                                    GameClient.getInstance().sendPacket(pk);
                                    pk.clean();
                                })
                            ));
                        }
                    } else {
                        this.btnPlay.setVisible(false);
                        this.btnPass.setVisible(false);
                        this.btnHint.setVisible(false);
                    }

                    this._players[inGameMgr.gameLogic._activeLocalChair].addEffectTime(data.time);
                }
                inGameMgr.gameLogic._gameState = GameState.NONE;
                break;

            }
            case GameState.CHATCHONG:
            {
                var winner = inGameMgr.gameLogic.convertChair(data.winChair);
                this._players[winner].addIncreaseMoney(data.winGold, 1.5);
                this._players[winner].removeResult(5);

                var loser = inGameMgr.gameLogic.convertChair(data.lostChair);
                this._players[loser].addDecreaseMoney(data.lostGold, 0, "Bị Chặt Tứ quý");
                this._players[loser].removeResult(5);

                effectMgr.flyCoinEffect(
                    this._effect2D,
                    data.winGold,
                    data.winGold / 10,
                    this._players[loser].getPlayerWorldPosition(),
                    this._players[winner].getPlayerWorldPosition()
                );

                break;
            }
            case GameState.JACKPOT:
            {
                var local = inGameMgr.gameLogic.convertChair(data.uChair);
                if (local == 0) {
                    this._effect2D.jackpot();
                }
                break;
            }
            case GameState.ENDGAME:
            {
                if (!data) return;

                this.dataEndGame = data;
                fr.crashLytics.log("End game step 2");
                var pk = new CmdSendHold();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                for (var i = 0; i < 5; i++) {
                    this._players[i].stopEffectTime();
                    this._players[i].removeBao1();
                    this._players[i].clearBoluot();
                    this._players[i].clearBao(true);
                }

                if (this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG)) {
                    this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG).removeFromParent(true);
                }

                var isResultMe = false;
                this.winToiTrang = {
                    pos: -1,
                    type: GameLayer.END_TYPE_WIN_SAM_DINH,
                    cardID: []
                }

                cc.log("UPDATING ENDGAME", JSON.stringify(this.dataEndGame.winType));
                for (var i = 0; i < 5; i++) {
                    if (!this.dataEndGame || !this.dataEndGame.winType) {
                        break;
                    }
                    var local = inGameMgr.gameLogic.convertChair(i);

                    if (this.dataEndGame.winType[i] === GameLayer.END_TYPE_WIN_FLUSH ||
                        this.dataEndGame.winType[i] === GameLayer.END_TYPE_WIN_SAM_DINH ||
                        this.dataEndGame.winType[i] === GameLayer.END_TYPE_WIN_FIVE_PAIR||
                        this.dataEndGame.winType[i] === GameLayer.END_TYPE_WIN_FOUR_PIG)
                    {
                        this.winToiTrang = {
                            pos: local,
                            type: this.dataEndGame.winType[i],
                            cardID: this.dataEndGame.cards[i]
                        }
                    }

                    if (local === 0 &&
                        inGameMgr.gameLogic._players[local]._ingame &&
                        this.dataEndGame.winType[i] !== GameLayer.END_TYPE_DRAW &&
                        this.dataEndGame.winType[i] !== 1) {
                        isResultMe = true;
                    }
                    cc.log("LOADING ENDGAME", this.dataEndGame.winType[i], local);
                }
                cc.log("UPDATING ENDGAME", JSON.stringify(this.winToiTrang), isResultMe);
                fr.crashLytics.log("End game step 3", isResultMe);

                this._effect2D.ccRemove = function (sender) {
                    sender.clearBaiDanh();
                };
                this._effect2D.runAction(cc.sequence(
                    cc.delayTime(isResultMe? PlayerView.TIME_RESULT_ANIMATION : 0),
                    cc.callFunc(this._effect2D.ccRemove.bind(this._effect2D), this._effect2D)
                ));

                for (var i = 0; i < 5; i++) {
                    if (!this.dataEndGame || !this.dataEndGame.winType) {
                        break;
                    }
                    var local = inGameMgr.gameLogic.convertChair(i);
                    if (inGameMgr.gameLogic._players[local]._ingame) {
                        cc.log("wintype: " + this.dataEndGame.winType[i]);
                        fr.crashLytics.log("End game step 4: " + JSON.stringify(this.dataEndGame.winType[i]));
                        switch (this.dataEndGame.winType[i]) {
                            case GameLayer.END_TYPE_WIN:
                            case GameLayer.END_TYPE_WIN_SAM:     // Thang bao sam
                            case GameLayer.END_TYPE_WIN_SAM_BLOCK:     // Thang chan sam
                            case GameLayer.END_TYPE_WIN_NORMAL:     // Thang binh thuong
                            case GameLayer.END_TYPE_WIN_SAM_DINH:     // Thang sam dinh
                            case GameLayer.END_TYPE_WIN_FOUR_PIG:     // Thang 4 heo
                            case GameLayer.END_TYPE_WIN_FIVE_PAIR:     // Thang 5 doi
                            case GameLayer.END_TYPE_WIN_FLUSH:     // Thang dong` mau`
                            case GameLayer.END_TYPE_WIN_DEN_BAO:    // Thang' den` bao 1
                                this._players[local].addResultWin(
                                    this.dataEndGame.ketquaTinhTien[i],
                                    this.dataEndGame.cards[i],
                                    this.dataEndGame.winType[i],
                                    isResultMe
                                );
                                break;
                            case GameLayer.END_TYPE_LOSE_DEN_BAO:    // Thua den` bao 1
                            case GameLayer.END_TYPE_LOSE:     // Thua binh thuong
                            case GameLayer.END_TYPE_LOSE_TREO:        // Thua treo
                            case GameLayer.END_TYPE_LOSE_TOI_TRANG:        // Thua toi trang
                            case GameLayer.END_TYPE_LOSE_SAM_BLOCK:        // Thua chan sam
                                this._players[local].addResultLose(
                                    this.dataEndGame.ketquaTinhTien[i],
                                    this.dataEndGame.cards[i],
                                    this.dataEndGame.winType[i],
                                    isResultMe
                                );
                                break;
                            case GameLayer.END_TYPE_DRAW:
                                break;
                        }
                    }
                }

                fr.crashLytics.log("End game step 5");
                this.btnSort.setVisible(false);
                this.btnPass.setVisible(false);
                this.btnPlay.setVisible(false);
                this.btnHint.setVisible(false);

                this.dataEndGame.delayTime = this.dataEndGame.delayTime || 10;
                this.clearResultAction = cc.sequence(
                    cc.delayTime(this.dataEndGame.delayTime),
                    cc.callFunc(this.resetPlayers.bind(this))
                )
                this.runAction(this.clearResultAction);
                break;
            }
            case GameState.UPDATEMATH:
            {
                this._players[0].clearBai();
                this._players[0]._moveCard.setVisible(false);
                for (var i = 1; i < 5; i++) {
                    this._players[i]._card.setVisible(false);
                }

                for (var i = 0; i < 5; i++) {
                    this._players[i].clearThangThua();
                    this._players[i].removeBao1();
                }
                this.notiBg.setVisible(false);
                this._effect2D.clearAll();

                this.updateStartButton();

                this.updateDecorate();
                break;
            }
            case  GameState.NONE:
            {
                break;
            }
            case GameState.REASONQUIT:
            {
                cc.log("minh bi kick  :" + data.reason);
                this.reason = data.reason;
                break;
            }
            case GameState.QUIT:
            {
                this.quitGame();
                break;
            }
        }

        for (var i = 0; i < 5; i++) {
            if (this._players[i])
                this._players[i].updateWithPlayer(inGameMgr.gameLogic._players[i]);
        }

        if (inGameMgr.gameLogic._gameState === GameState.ENDGAME) {
            fr.crashLytics.log("End game step 6");
        }
        if (inGameMgr.gameLogic._gameState === GameState.ENDGAME) {
            fr.crashLytics.log("End game step 7");
        }
    },

    shuffleCard: function () {
        this.deckCard.stopAllActions();
        this.deckCard.setOpacity(0);
        this.deckCard.setVisible(true);
        this.deckCard.runAction(cc.fadeIn(0.25));

        this.shuffler.stopAllActions();
        this.shuffler.getAnimation().gotoAndPlay("card_mix", -1);
        this.shuffleTime = new Date().getTime();
    },

    quitGame: function () {
        //cc.view.setDesignResolutionSize(Constant.WIDTH,Constant.HEIGHT, cc.ResolutionPolicy.FIXED_HEIGHT);

        var layer = null;
        if (this._lastGUI == "ChooseRoomScene") {
            this.loading = sceneMgr.addLoading(LocalizedString.to("LOADING"), true, this);
            this.loading.setTag(LOADING_TAG);
            cc.loader.load(g_choose_room, function () {
                layer = ChooseRoomScene.className;
            }, this)

        }
        else {
            layer = LobbyScene.className;
        }

        var timeToast = 3;
        if (typeof this.reason == "undefined" || this.reason === 0) {
            timeToast = 0;
        } else {
            var message = "Bạn đã bị mời ra khỏi bàn chơi";
            if (this.reason === 1) {
                message = LocalizedString.to("NOT_ENOUGH_GOLD_IN_BOARD");
                offerManager.kickInGame = true;
            } else if (this.reason === 2) {
                message = LocalizedString.to("NOT_ACTIVE_IN_BOARD");
            }

            Toast.makeToast(timeToast, message, layer);
        }
        this.runAction(
            cc.sequence(
                cc.delayTime(timeToast),
                cc.callFunc(function () {
                    SceneMgr.getInstance().openScene(layer);
                    inGameMgr.gameLogic = new GameLogic();
                    if (GameLayer.sharedPhoto) {
                        var pk = new CmdSendTangGold();
                        GameClient.getInstance().sendPacket(pk);
                        pk.clean();
                    }
                    gameSound.playThoatban();
                    gameSound.playThoatbanNoi();
                }.bind(this))
            )
        );
    },

    onButtonRelease: function (button, id) {
        this._players[0].autoing(false);
        switch (id) {
            case GameLayer.BTN_AVATAR_0:
            case GameLayer.BTN_AVATAR_1:
            case GameLayer.BTN_AVATAR_2:
            case GameLayer.BTN_AVATAR_3:
            case GameLayer.BTN_AVATAR_4:
            {
                cc.log("CLICK PLAYER");
                // if (Config.ENABLE_CHEAT) {
                //     this.avatarTestingFunction(button, id);
                //     break;
                // }

                var uID = inGameMgr.gameLogic._players[id - GameLayer.BTN_AVATAR_0]._info["uID"];
                if (uID === userMgr.getUID()) {
                    var guiInfo = sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
                    guiInfo.setInfo(userMgr.getUserInfo());
                } else {
                    var otherInfo = new CmdSendGetOtherRankInfo();
                    otherInfo.putData(uID);
                    GameClient.getInstance().sendPacket(otherInfo);
                    otherInfo.clean();
                    sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
                    sceneMgr.addLoading().timeout(2.5);
                }
                break;
            }
            case GameLayer.BTN_QUIT:
            {
                var button = this.getControl("btnQuit");
                button.getChildByName("check").setVisible(!button.getChildByName("check").isVisible());
                var pk = new CmdSendQuitRoom();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();
                inGameMgr.gameLogic.sendQuitRoom = true;
                break;
            }
            case GameLayer.BTN_CHEAT:
            {
                //var cheat = new LayerCHEAT();
                //this.addChild(cheat,2);
                sceneMgr.openGUI(LayerCHEAT.className, 2);
                break;
            }
            case GameLayer.BTN_CAMERA:
            {
                this.btnCamera.setEnabled(false);
                this.btnCamera.setOpacity(50);

                this.addAvatarFixShare();

                if (!gameMgr.checkOldNativeVersion()) {
                    var imgPath = sceneMgr.takeScreenShot();
                    setTimeout(function () {
                        fr.facebook.shareScreenShoot(imgPath, function (result) {
                            var message = "";
                            if (result == -1) {
                                message = localized("INSTALL_FACEBOOK");
                            }
                            else if (result == 1) {
                                message = localized("NOT_SHARE");
                            }
                            else if (result == 0) {
                                message = localized("FACEBOOK_DELAY");
                                GameLayer.sharedPhoto = true;
                            }
                            else {
                                message = localized("FACEBOOK_ERROR");
                            }
                            Toast.makeToast(Toast.SHORT, message);

                            var scene = sceneMgr.getMainLayer();
                            if (scene instanceof BoardScene) {
                                scene.btnCamera.setEnabled(true);
                                scene.btnCamera.setOpacity(255);
                            }
                        });
                    }, 500);
                } else {
                    this.onShareImg = function (social, jdata) {
                        this.removeAvatarFixShare();
                        var message = "";
                        var dom = JSON.parse(jdata);
                        if (dom["error"] == -1) {
                            message = localized("INSTALL_FACEBOOK");
                        }
                        else if (dom["error"] == 1) {
                            message = localized("NOT_SHARE");
                        }
                        else if (dom["error"] == 0) {
                            message = localized("FACEBOOK_DELAY");
                            GameLayer.sharedPhoto = true;
                        }
                        else {
                            message = localized("FACEBOOK_ERROR");
                        }
                        Toast.makeToast(2.5, message);
                        this.btnCamera.setEnabled(true);
                        this.btnCamera.setOpacity(255);
                    }

                    socialMgr.set(this, this.onShareImg);
                    socialMgr.shareImage(socialMgr._currentSocial);
                }
                break;
            }
            case GameLayer.BTN_NEW_RANK:
            {
                if (this.btnMiniRank.getOpacity() < 255) {
                    Toast.makeToast(Toast.LONG, "Bảo trì tính năng");
                    break;
                }

                var miniRankGUI = sceneMgr.getGUI(RankData.MINI_RANK_GUI_TAG);
                if (miniRankGUI) {
                    miniRankGUI.onButtonRelease(miniRankGUI.btnMiniRank, RankMiniGUI.BTN_MINI_RANK);
                }
                break;
            }
            case GameLayer.BTN_START:
            {
                var pk = new CmdSendStartGame();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                this.autoStartPanel.setVisible(false);
                break;
            }
            case GameLayer.BTN_XEPBAI:
            {
                this.btnSort.stopAllActions();
                this.btnSort.setRotation(0);
                this.btnSort.runAction(cc.sequence(
                    cc.rotateBy(0.2, 20).easing(cc.easeOut(2)),
                    cc.rotateBy(0.5, -220).easing(cc.easeExponentialOut()),
                    cc.rotateBy(0.1, 20).easing(cc.easeOut(2))
                ));

                this._effect2D.sapxepForPlayer(this._players[0]);
                this.kiemtraDanhbai();
                break;
            }
            case GameLayer.BTN_DANH:
            {
                cc.log("GameLayer.BTN_DANH", button.cothedanh);
                if (!button.cothedanh) {
                    Toast.makeToast(2, "Đánh bài không hợp lệ..");
                    break;
                }
                var cards = [];
                for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                    if (this._players[0]._handOnCards[i]._up) {
                        cards.push(Card.convertToServerCard(this._players[0]._handOnCards[i]._id));
                    }
                }

                var pk = new CmdSendDanhBai();
                pk.putData(false, cards);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();
                this.btnPlay.setVisible(false);
                this.btnPass.setVisible(false);
                this.btnHint.setVisible(false);
                this._players[0].stopEffectTime();

                break;
            }
            case GameLayer.BTN_BOLUOT:
            {
                if (this.newRound) return;

                var pk = new CmdSendDanhBai();
                pk.putData(true);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                this.btnPlay.setVisible(false);
                this.btnPass.setVisible(false);
                this.btnHint.setVisible(false);
                this._players[0].stopEffectTime();
                this._players[0].danhbai();

                this.stopAllActions();
                break;
            }
            case GameLayer.BTN_HINT:
            {
                if (this.hintPool.length === 0) {
                    this.updateHintPool();
                }

                var biggestUpCard = 0;
                for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                    if (this._players[0]._handOnCards[i]._up && this._players[0]._handOnCards[i]._id > biggestUpCard) {
                        biggestUpCard = this._players[0]._handOnCards[i]._id;
                    }
                    this._players[0]._handOnCards[i].forceDOWN();
                }

                if (!this.newRound) {
                    cc.log("CHECKING THE POOL HINT", JSON.stringify(this.hintPool));

                    cc.log("GameLayer.BTN_HINT", biggestUpCard);
                    var chosenHintCardIndex = 0;
                    var upCard = new Card(biggestUpCard);
                    for (var i = 0; i < this.hintPool.length; i++) {
                        var card = new Card(this.hintPool[i]);
                        if (card._quanbai > upCard._quanbai || (card._quanbai < upCard._quanbai && card._quanbai === 2)) {
                            chosenHintCardIndex = i;
                            break;
                        }
                    }
                    cc.log("GameLayer.BTN_HINT", chosenHintCardIndex);

                    for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                        if (this._players[0]._handOnCards[i]._id === this.hintPool[chosenHintCardIndex]) {
                            this._players[0]._handOnCards[i].forceUP();
                            this.kiemtraDanhbai(this._players[0]._handOnCards[i]._up);
                            break;
                        }
                    }
                } else {
                    var hintedCards = [];
                    cc.log("HINT POOL", this.hintType, this.hintIndex, JSON.stringify(this.hintPool));
                    while (hintedCards.length === 0) {
                        hintedCards = [];
                        if (this.hintType > GroupCard.kType_TUQUY) {
                            for (var i = this.hintIndex + 1; i < this.hintPool.length; i++)
                                if (this.hintPool[this.hintIndex]._quanbai < this.hintPool[i]._quanbai ||
                                    (this.hintPool[this.hintIndex]._quanbai > this.hintPool[i]._quanbai && this.hintPool[i]._quanbai === 2)) {
                                    this.hintIndex = i;
                                    break;
                                }
                            if (i >= this.hintPool.length) {
                                this.hintIndex = 0;
                            }
                            this.hintType = GroupCard.kType_BAIRAC;
                        }
                        switch (this.hintType) {
                            case GroupCard.kType_BAIRAC:
                                hintedCards.push(this.hintPool[this.hintIndex]);
                                break;
                            case GroupCard.kType_DOI:
                                for (var i = this.hintIndex; i < this.hintPool.length; i++)
                                    if (this.hintPool[i]._quanbai === this.hintPool[this.hintIndex]._quanbai) {
                                        hintedCards.push(this.hintPool[i]);
                                        if (hintedCards.length >= 2) break;
                                    }
                                if (hintedCards.length < 2) hintedCards = [];
                                break;
                            case GroupCard.kType_BALA:
                                for (var i = this.hintIndex; i < this.hintPool.length; i++)
                                    if (this.hintPool[i]._quanbai === this.hintPool[this.hintIndex]._quanbai) {
                                        hintedCards.push(this.hintPool[i]);
                                        if (hintedCards.length >= 3) break;
                                    }
                                if (hintedCards.length < 3) hintedCards = [];
                                break;
                            case GroupCard.kType_TUQUY:
                                for (var i = this.hintIndex; i < this.hintPool.length; i++)
                                    if (this.hintPool[i]._quanbai === this.hintPool[this.hintIndex]._quanbai) {
                                        hintedCards.push(this.hintPool[i]);
                                        if (hintedCards.length >= 4) break;
                                    }
                                if (hintedCards.length < 4) hintedCards = [];
                                break;
                            case GroupCard.kType_SANHDOC:
                                hintedCards.push(this.hintPool[this.hintIndex]);
                                for (var i = this.hintIndex + 1; i < this.hintPool.length; i++)
                                    if (this.hintPool[i]._quanbai === hintedCards[hintedCards.length - 1]._quanbai + 1) {
                                        hintedCards.push(this.hintPool[i]);
                                    }
                                if (hintedCards.length < 3) hintedCards = [];
                                break;
                        }
                        this.hintType++;
                    }

                    for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                        for (var j = 0; j < hintedCards.length; j++)
                            if (this._players[0]._handOnCards[i]._id === hintedCards[j]._id) {
                                cc.log("FOUND THE CARD",  hintedCards[j]._id);
                                this._players[0]._handOnCards[i].forceUP();
                                break;
                            }
                    }
                    this.kiemtraDanhbai();
                }

                break;
            }
            case GameLayer.BTN_HUYBAO:
            {
                if (this.sendSam) break;
                this.sendSam = true;

                var pk = new CmdSendHuyBaoSam();
                pk.putData(true);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                var layerBaoSam = this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG);
                layerBaoSam.bgScene.runAction(cc.scaleTo(0.25, 0).easing(cc.easeBackIn()));
                layerBaoSam.fog.runAction(cc.fadeOut(0.25));
                layerBaoSam.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.removeSelf()
                ));
                break;
            }
            case GameLayer.BTN_BAOSAM:
            {
                if (this.sendSam) break;
                this.sendSam = true;

                var pk = new CmdSendBaoSam();
                pk.putData(true);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                var layerBaoSam = this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG);
                layerBaoSam.bgScene.runAction(cc.scaleTo(0.25, 0).easing(cc.easeBackIn()));
                layerBaoSam.fog.runAction(cc.fadeOut(0.25));
                layerBaoSam.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.removeSelf()
                ));
                break;
            }
            case GameLayer.BTN_QUICK_CHAT:
            {
                cc.log("BTN GameLayer.BTN_QUICK_CHAT");
                sceneMgr.openGUI(ChatPanelGUI.className, ChatPanelGUI.TAG, ChatPanelGUI.TAG)
                    .emotePanel.setVisible(false);
                break;
            }
            case GameLayer.BTN_QUICK_EMO:
            {
                cc.log("BTN GameLayer.BTN_QUICK_EMO");
                sceneMgr.openGUI(ChatPanelGUI.className, ChatPanelGUI.TAG, ChatPanelGUI.TAG)
                    .onButtonRelease(null, ChatPanelGUI.BTN_EMOTE);
                break;
            }
            case GameLayer.BTN_JACKPOT:
            {
                sceneMgr.openGUI(JackpotGUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT, false);
                break;
            }
            case GameLayer.BTN_EVENT:
            {
                this.btnEvent.event.onAccumulate();
                break;
            }
            case GameLayer.BTN_ADD_BOT:
            {
                var pk = new CmdSendAddBot();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();
                break;
            }
        }
    },

    avatarTestingFunction: function (button, id) {
        // //Bao sam
        // this._players[id - GameLayer.BTN_AVATAR_0].initCards([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
        // this.addBaoSamLayer(15, 3);

        // this._players[id - GameLayer.BTN_AVATAR_0].addVipEffect();

        //Chia bai
        // var playerPos = id - GameLayer.BTN_AVATAR_0 + 1;
        // this._players[id - GameLayer.BTN_AVATAR_0].initCards([11, 12, 13, 14, 15, 16, 17, 18, 19, 10]);
        // for (var i = 0; i < 5; i++) {
        //     inGameMgr.gameLogic._players[i]._ingame = true;
        //     inGameMgr.gameLogic._players[i]._status = 2;
        //     this._players[i].setVisible(true);
        //     this._players[playerPos]._card.setVisible(i !== 0);
        //     if (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status > 1)) {
        //         this.shuffleTime = -1;
        //         this._effect2D.chiabai(this._players[i], this.demoCard);
        //     }
        // }

        // First turn determined
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos].firstTurn(45).setVisible(true);
        // this._effect2D.firstTurn(this._players[playerPos], this.demoCard, true);

        //Result panel
        // var playerPos = id - GameLayer.BTN_AVATAR_0 + 1;
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos].addResultWin(-250000, [11, 12, 13, 14, 15, 16, 17, 18, 19, 10]);
        // var playerPos = id - GameLayer.BTN_AVATAR_0 + 2;
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos].addResultWin(-250000, [11, 12, 13, 14, 15, 16, 17, 18, 19, 10]);
        // var playerPos = id - GameLayer.BTN_AVATAR_0 + 3;
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos].addResultLose(-250000, [21, 12, 13, 14, 15, 16, 17, 18, 19, 22], 13);
        // var playerPos = id - GameLayer.BTN_AVATAR_0 + 4;
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos].addResultLose(-250000, [11, 12, 13, 17, 21, 25, 29, 34, 39, 43], 13);
        //
        // this._players[id - GameLayer.BTN_AVATAR_0].initCards([11, 12, 13, 14, 15, 16, 17, 18, 19, 10]);
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos].addResultWin(-250000, [11, 12, 13, 14, 15, 16, 17, 18, 19, 10]);

        // //Init cards
        // this._players[id - GameLayer.BTN_AVATAR_0].initCards([24, 25, 28, 29, 32, 40, 57, 58, 9, 41]);
        // this.btnSort.setVisible(true);

        //Game result
        // var start = new Date().getTime();
        // this._players[id - GameLayer.BTN_AVATAR_0].initCards([14, 11, 17, 12, 19, 13, 16, 18, 15, 10]);
        // this._effect2D.darkenPlayedCards();
        // this._effect2D.clearEffect();
        // this._effect2D.playCards(this._players[id - GameLayer.BTN_AVATAR_0].danhbai([14, 11, 17, 12]));
        // cc.log("FIRST PLAYER", (new Date().getTime() - start) / 1000);
        //
        // var playerPos = id - GameLayer.BTN_AVATAR_0 + 1;
        // inGameMgr.gameLogic._players[playerPos]._ingame = true;
        // this._players[playerPos].initResult(true);
        // this._players[playerPos].setVisible(true);
        // cc.log("SECOND PLAYER", (new Date().getTime() - start) / 1000);
        //
        // playerPos = id - GameLayer.BTN_AVATAR_0 + 2;
        // inGameMgr.gameLogic._players[playerPos]._ingame = true;
        // this._players[playerPos].initResult(true);
        // this._players[playerPos].setVisible(true);
        // cc.log("THIRD PLAYER", (new Date().getTime() - start) / 1000);
        //
        // playerPos = id - GameLayer.BTN_AVATAR_0 + 3;
        // inGameMgr.gameLogic._players[playerPos]._ingame = true;
        // this._players[playerPos].initResult(true);
        // this._players[playerPos].setVisible(true);
        // cc.log("FOURTH PLAYER", (new Date().getTime() - start) / 1000);
        //
        // playerPos = id - GameLayer.BTN_AVATAR_0 + 4;
        // inGameMgr.gameLogic._players[playerPos]._ingame = true;
        // this._players[playerPos].initResult(true);
        // this._players[playerPos].setVisible(true);
        // cc.log("SHOWING SOME OF THIS", (new Date().getTime() - start) / 1000);
        // var packet = {
        //     "winType":[
        //         GameLayer.END_TYPE_LOSE,
        //         GameLayer.END_TYPE_WIN,
        //         GameLayer.END_TYPE_LOSE,
        //         GameLayer.END_TYPE_LOSE,
        //         GameLayer.END_TYPE_LOSE
        //     ],
        //     "ketquaTinhTien":[-75000, -75000, 75000, 0, 0],
        //     "cards":[
        //         [19, 20, 23, 29, 30, 33, 34, 43, 44, 10],
        //         [19, 20, 23, 29, 30, 33, 34, 43, 44, 10],
        //         [19, 20, 23, 29, 30, 33, 34, 43, 44, 10],
        //         [19, 20, 23, 29, 30, 33, 34, 43, 44, 10],
        //         [19, 20, 23, 29, 30, 33, 34, 43, 44, 10]
        //     ],
        //     "delayTime": 12,
        //     "roomJackpot": 0
        // };
        // inGameMgr.gameLogic.endgame(packet);
        // sceneMgr.updateCurrentGUI(packet);
        // cc.log("SHOWING ALL OF THIS", (new Date().getTime() - start) / 1000);

        //test sam result
        //this._effect2D.addSamResult(true);

        //Danh bai
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // // if (playerPos === 0)
        // //     this._players[id - GameLayer.BTN_AVATAR_0].initCards([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        // var cards = [8, 9, 10, 11, 48, 44, 17, 18, 19, 20];
        // this._players[id - GameLayer.BTN_AVATAR_0].initCards(cards);
        // this._effect2D.darkenPlayedCards();
        // this._effect2D.clearEffect();
        // // this._effect2D.multiPlayEffect(3);
        // // this._effect2D.tuquy(false);
        // // this._effect2D.effectPigs(11);
        // // this._effect2D.playCards(this._players[playerPos].danhbai(cards.slice(Math.floor(Math.random() * cards.length))));
        // this._effect2D.playCards(this._players[playerPos].danhbai([8, 9, 10, 11, 48, 44, 17, 18, 19, 20]));

        //Level effect
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // inGameMgr.gameLogic._players[playerPos]._ingame = true;
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos]._levelResult = {
        //     "uId": 1293,
        //     "nChair": 1,
        //     "oldLevel": 1,
        //     "newLevel": 2,
        //     "oldLevelExp": 1000,
        //     "newLevelExp": 2000
        // };
        // this._players[playerPos].addLevelExp();

        //Bao mot
        // var playerPos = id - GameLayer.BTN_AVATAR_0 + 1;
        // inGameMgr.gameLogic._players[playerPos]._ingame = true;
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos]._card.setVisible(true);
        // this._players[playerPos].addBao1();

        //Effect Time
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // inGameMgr.gameLogic._players[playerPos]._ingame = true;
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos].addEffectTime(7, 15);

        // Toi trang
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // this._players[id - GameLayer.BTN_AVATAR_0].initCards([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        // inGameMgr.gameLogic._players[playerPos]._ingame = true;
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos]._card.setVisible(playerPos !== 0);
        // this._effect2D.clearEffect();
        // this._effect2D.effectToiTrang(
        //     this._players[playerPos].danhbai([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]),
        //     GameLayer.END_TYPE_WIN_SAM_DINH,
        //     playerPos === 0
        // );

        // Effect in out
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // inGameMgr.gameLogic._players[playerPos + 1]._ingame = true;
        // this._players[playerPos + 1].updateWithPlayer(inGameMgr.gameLogic._players[playerPos + 1]);
        // this._players[playerPos + 1].setVisible(true);
        // this._players[playerPos + 1].efxPlayerIn();

        // //Chat chong
        // var gold = 12345677;
        // var playerPos1 = id - GameLayer.BTN_AVATAR_0 + 3;
        // inGameMgr.gameLogic._players[playerPos1]._ingame = true;
        // this._players[playerPos1].setVisible(true);
        // this._players[playerPos1]._card.setVisible(playerPos1 !== 0);
        // this._players[playerPos1].addIncreaseMoney(gold, 1.5);
        //
        // var playerPos2 = id - GameLayer.BTN_AVATAR_0;
        // inGameMgr.gameLogic._players[playerPos2]._ingame = true;
        // this._players[playerPos2].setVisible(true);
        // this._players[playerPos2]._card.setVisible(playerPos2 !== 0);
        // this._players[playerPos2].addDecreaseMoney(gold);
        //
        // effectMgr.flyCoinEffect(
        //     this._effect2D,
        //     gold,
        //     gold / 25,
        //     this._players[playerPos2].getPlayerWorldPosition(),
        //     this._players[playerPos1].getPlayerWorldPosition()
        // );

        //JACKPOT TEST
        // hasJackpot = true;
        // //Get a gem
        // sceneMgr.openGUI(JackpotWinGUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
        // UPDATING_JACKPOT = true;
        // cc.log("jackpotwinpacket");
        // var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
        // if (jackpotGui)
        //     jackpotGui.onUpdateGUI();
        //Get total jackpot
        // var jackpot = {
        //     jackpot: 15000000,
        //     chair: inGameMgr.gameLogic._myChair
        // }
        // jackpot.jackpotPacket = true;
        // if (inGameMgr.gameLogic && jackpot.chair == inGameMgr.gameLogic._myChair) {
        //     sceneMgr.openGUI(JackpotWin5GUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
        //     var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
        //     if (jackpotGui) jackpotGui.onUpdateGUI("win5", jackpot);
        // } else if (inGameMgr.gameLogic && jackpot.chair != inGameMgr.gameLogic._myChair) {
        //     sceneMgr.openGUI(JackpotInBoardGUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
        //     var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
        //     if (jackpotGui) jackpotGui.onUpdateGUI(jackpot);
        // }

        //Chat test
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // ChatMgr.playChatEffect(playerPos, "abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb abc acb ");

        // var miniRankGUI = sceneMgr.getGUI(RankData.MINI_RANK_GUI_TAG);
        // if (miniRankGUI) {
        //     miniRankGUI.showExpChange(100, 2);
        // }

        //Event
        // this.updateButtonEvent(true, 32, 75, "", null);
        // // this.effectButtonEventTicket(10);
        // this.effectButtonEvent({
        //     keyCoin: 32,
        //     keyCoinAdd: 57,
        //     keyCoinAward: 0,
        //     additionExp: 0,
        //     nextLevelExp: 500,
        //     currentLevelExp: 200
        // });

        // //Bao stamp
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // inGameMgr.gameLogic._players[playerPos]._ingame = true;
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos].bao();
        // this._players[playerPos].baoNormalize();

        //Got Sam block
        // var playerPos = id - GameLayer.BTN_AVATAR_0 + 1;
        // inGameMgr.gameLogic._players[playerPos]._ingame = true;
        // this._players[playerPos]._card.setVisible(true);
        // this._players[playerPos].setVisible(true);
        // this._players[playerPos].bao();
        // this._players[playerPos].baoNormalize();
        // this._players[playerPos].addGotSamBlock();

        // Hinting cards
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // if (playerPos === 0)
        //     this._players[id - GameLayer.BTN_AVATAR_0].initCards([8, 12, 16, 20, 24, 28, 32, 33, 37, 38]);
        // // [12, 16, 20, 24, 28, 32, 33, 37, 38, 39]
        // this.btnHint.setVisible(true);
        // this.hintPool = [];
        // // this.newRound = true;
        // this.hintIndex = 0;
        // this.hintType = GroupCard.kType_BAIRAC;
        // this._cardRecent = [33];
        // this._effect2D.playCards(this._players[playerPos + 1].danhbai(this._cardRecent));

        //Adding smile
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // this._players[playerPos].addSmile(PlayerView.EMOTION.ANGRY);

        //Autoing:
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // this._players[playerPos].autoing(!this._players[playerPos].darken.isVisible());
        // this._players[playerPos].autoPlayCard(2);
        // this._players[playerPos].initCards([8, 12]);
        // this.effectTooltip(this.pTooltip);

        //useEmoticon:
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // this._players[playerPos].useEmoticon(0, 6);

        // //My Money effect
        // var playerPos = id - GameLayer.BTN_AVATAR_0;
        // this._players[playerPos].addDecreaseMoney(123456789, 0, "Bị Chặt Tứ quý");

        gameSound.playMoisam();
    },

    updateOwnerRoom: function (_roomOwnerID) {
        if (inGameMgr.gameLogic.roomLock && (gamedata.userData.uID == inGameMgr.gameLogic._roomOwnerID)) {
            this.customizePanelMenu(true);
        }
        else {
            this.customizePanelMenu(false);
        }
    },

    customizePanelMenu: function (moiban) {
        moiban = true;
        if (!moiban) {
            ccui.Helper.seekWidgetByName(this._layout, "btnInvite").setVisible(false);
            ccui.Helper.seekWidgetByName(this._layout, "panel_button").pos = GameLayer.DESIGN_WIDTH - 55;
            ccui.Helper.seekWidgetByName(this._layout, "panel_button").deltaX = 100;
            ccui.Helper.seekWidgetByName(this._layout, "panel_button").moiban = false;
        }
        else {
            ccui.Helper.seekWidgetByName(this._layout, "panel_button").pos = GameLayer.DESIGN_WIDTH - 108;
            ccui.Helper.seekWidgetByName(this._layout, "panel_button").deltaX = 100;
            ccui.Helper.seekWidgetByName(this._layout, "panel_button").moiban = true;
        }
    },

    addAutoStart: function (time) {
        this.stopAutoStart();

        if (!this.autoStartPanel.eff) {
            var bg = this.getControl("bg", this.autoStartPanel);
            this.autoStartPanel.eff = new CustomSkeleton("Animation/startGameSpark", "skeleton", 1);
            this.autoStartPanel.eff.setPosition(cc.p(bg.width / 2, bg.height / 2 + 5));
            bg.addChild(this.autoStartPanel.eff);
        }

        this.autoStartPanel.lbTime.setString(Math.floor(time));
        this.autoStartPanel.eff.setAnimation(0, "animation", -1);
        this.autoStartPanel.setVisible(true);
        effectMgr.countdownLabelEffect(
            this.autoStartPanel.lbTime,
            Math.floor(time),
            time - Math.floor(time),
            Math.floor(time)
        );

        this._players[0].clearBai();
        for (var i = 0; i < 5; i++) {
            this._players[i].removeResult();
        }
    },

    stopAutoStart: function () {
        this.autoStartPanel.stopAllActions();
        this.autoStartPanel.setVisible(false);
    },

    kiemtraBoluot: function () {
        if (!this.newRound)      // Truong hop danh trong round
        {
            // Kiem tra xem co phai bo luot khong
            var cardsA = [];
            for (var i = 0; i < this._cardRecent.length; i++) {
                cardsA.push(new Card(this._cardRecent[i]));
            }
            var cardsB = [];
            for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                cardsB.push(new Card(this._players[0]._handOnCards[i]._id));
            }

            var groupA = new GroupCard(cardsA);
            var groupB = new GroupCard(cardsB);

            var cothedanh = GameHelper.kiemtraChatduockhong(groupA, groupB);

            cc.log("cothe danh :  " + cothedanh);

            this.updateActionButton(this.btnPass, !cothedanh, false);
            this.updateActionButton(this.btnPlay, false, !cothedanh);
            this.updateActionButton(this.btnHint, false, !cothedanh);
            this.btnPlay.cothedanh = cothedanh;
            return cothedanh;
        } else return true;
    },

    oneCardCheck: function (id) {
        cc.log("oneCardCheck", id);
        if (!this.newRound && this._cardRecent && this._cardRecent.length === 1 && (Math.floor(this._cardRecent[0] / 4) !== Card.kQuanbai_2)) {   // truong hop la bai rac thi` ktra danh luon
            for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                cc.log("_handOnCards", this._players[0]._handOnCards[i]._id);
                if (this._players[0]._handOnCards[i]._up && id !== this._players[0]._handOnCards[i]._id) {
                    this._players[0]._handOnCards[i].upDown();
                }
            }
        }
    },

    kiemtraDanhbai: function (up) {
        var card = [];
        var cardDown = [];
        var cardHandon = [];

        for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
            cardHandon.push(this._players[0]._handOnCards[i]._id);
            if (this._players[0]._handOnCards[i]._up) {
                card.push(this._players[0]._handOnCards[i]._id);
            } else {
                cardDown.push(this._players[0]._handOnCards[i]._id);
            }
        }

        if (this._cardRecent && !this.newRound) {
            // Kiem tra de nhac bai` tu dong hoac kiem tra danh bai
            if (this._cardRecent.length === 1 && (Math.floor(this._cardRecent[0] / 4) !== Card.kQuanbai_2)) {   // truong hop la bai rac thi` ktra danh luon
                if (this.btnPlay.isVisible()) this.checkDanh(this._cardRecent, card);
            } else {
                if ((card.length === 1) && up) {
                    var cotheChat = GameHelper.recommend(this._cardRecent, cardHandon, card[0]);
                    if (cotheChat.length <= 1) {      // Khong tim dc bai` phu hop
                        //cc.log("khong tim` thay bai` de auto nhac'");
                        if (this.btnPlay.isVisible()) this.checkDanh(this._cardRecent, card);
                    } else {
                        for (var j = 0; j < cotheChat.length; j++) {
                            for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                                if (this._players[0]._handOnCards[i]._id === cotheChat[j]) {
                                    this._players[0]._handOnCards[i].up();
                                }
                            }
                        }
                        if (this.btnPlay.isVisible()) this.kiemtraDanhbai();
                    }
                } else {
                    if (this.btnPlay.isVisible()) this.checkDanh(this._cardRecent, card);
                }
            }
        }

        //Fire cards
        var fireCards = [];
        var cardUp = [];
        for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
            if (this._players[0]._handOnCards[i]._up) {
                fireCards.push(this._players[0]._handOnCards[i]._id);
                cardUp.push(this._players[0]._handOnCards[i]);
            }
        }
        if (GameHelper.checkFourOfAKind(fireCards)) {
            for (var i = 0; i < cardUp.length; i++) cardUp[i].playEfxFire();
        } else {
            for (var i = 0; i < cardUp.length; i++) cardUp[i].hideEfxFire();
        }

        if (!this.btnPlay.isVisible()) return;

        if (this.newRound) {
            if (card.length === 0) {
                this.btnPlay.cothedanh = false;
                this.updateActionButton(this.btnPlay, false);
                return;
            }
            var cards = [];
            for (var i = 0; i < card.length; i++) {
                cards.push(new Card(card[i]));
            }

            var group = new GroupCard(cards);
            cc.log("CHECKING CAN PLAY", JSON.stringify(cards), JSON.stringify(group));
            this.btnPlay.cothedanh = GameHelper.kiemtraDanh(group);
            this.updateActionButton(this.btnPlay, this.btnPlay.cothedanh);
        }

        var all2 = true;
        for (var i = 0; i < cardDown.length; i++) {
            if (Math.floor(cardDown[i] / 4) !== Card.kQuanbai_2) {
                all2 = false;
                break;
            }
        }
        if ((cardDown.length > 0) && all2) {
            this.btnPlay.cothedanh = false;
            this.updateActionButton(this.btnPlay, this.btnPlay.cothedanh);
            Toast.makeToast(2, "Bạn không được đánh 2 cuối cùng...");
        }

    },

    checkDanh: function (inCard, danhCard) {
        var btn = this.btnPlay;
        if (danhCard.length == 0) {
            this.btnPlay.cothedanh = false;
            this.updateActionButton(this.btnPlay, this.btnPlay.cothedanh);
        }
        else {
            var cardsA = [];
            for (var i = 0; i < inCard.length; i++) {
                cardsA.push(new Card(inCard[i]));
            }
            var cardsB = [];
            for (var i = 0; i < danhCard.length; i++) {
                cardsB.push(new Card(danhCard[i]));
            }

            var groupA = new GroupCard(cardsA);
            var groupB = new GroupCard(cardsB);
            if (GameHelper.kiemtraChatQuan(groupA, groupB)) {
                this.btnPlay.cothedanh = true;
                this.updateActionButton(this.btnPlay, this.btnPlay.cothedanh);
                if (groupA._typeGroup !== GroupCard.kType_BAIRAC)
                    gameSound.playNhacbai();
            } else {
                this.btnPlay.cothedanh = false;
                this.updateActionButton(this.btnPlay, this.btnPlay.cothedanh);
            }
        }
    },

    updateBanCards: function (notCheckBanCard = false) {
        var notBanCards = [];
        var cardMine = [];
        for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
            cardMine.push(new Card(this._players[0]._handOnCards[i]._id));
            notBanCards.push(this._players[0]._handOnCards[i]._id);
        }

        if (!notCheckBanCard && (this._cardRecent.length !== 0)) {
            var cardRecent = [];
            for (var i = 0; i < this._cardRecent.length; i++) {
                cardRecent.push(new Card(this._cardRecent[i]));
            }

            notBanCards = GameHelper.checkBanCards(new GroupCard(cardRecent), new GroupCard(cardMine));
        }

        cc.log("updateBanCards", JSON.stringify(notBanCards));
        for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
            var ban = true;
            for (var j = 0; j < notBanCards.length; j++) {
                if (this._players[0]._handOnCards[i]._id === notBanCards[j]) {
                    ban = false;
                    break;
                }
            }
            if (ban)
                this._players[0]._handOnCards[i].showEfxBan();
            else
                this._players[0]._handOnCards[i].hideEfxBan();
        }
    },

    updateHintPool: function () {
        var cardRecent = [];
        var cardMine = [];
        for (var i = 0; i < this._cardRecent.length; i++) {
            cardRecent.push(new Card(this._cardRecent[i]));
        }
        for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
            cardMine.push(new Card(this._players[0]._handOnCards[i]._id));
        }

        if (this.newRound) {
            cc.log("RUN INTO HERE???", JSON.stringify(cardMine));
            this.hintPool = cardMine.sort(function(a, b) {
                if (a._quanbai === 2) return 1;
                if (b._quanbai === 2) return -1;
                return a._id - b._id;
            });
        } else {
            this.hintPool = GameHelper.checkBanCards(new GroupCard(cardRecent), new GroupCard(cardMine));
        }
    },

    updateActionButton: function (button, isEffect, isLock) {
        button.setVisible(true);

        if (isLock !== undefined) {
            button.imgDisabled.setVisible(isLock);
            button.setPressedActionEnabled(!isLock);
        }

        if (!button.pointer) return;
        button.pointer.stopAllActions();
        button.pointer.setVisible(isEffect);
        button.pointer.setScale(0);
        button.pointer.runAction(cc.scaleTo(0.25, 1.5).easing(cc.easeBackOut()));
        button.pointer.getAnimation().setTimeScale(2);
        button.pointer.getAnimation().gotoAndPlay("run", -1);
    },

    addBaoSamLayer: function (time, typeToiTrang) {
        this.sendSam = false;
        gameSound.playMoisam();
        var layer = new BaseLayer("BaoSam");
        layer.initWithBinaryFile("BaoSamLayer.json");
        layer._layout.setScale(1);
        this._layout.addChild(layer, 2);
        layer.fog = layer.getControl("fog");
        layer.setTag(GameLayer.LAYER_SAM_TAG);
        layer.getControl("demo").setVisible(false);

        var btnBaoSam = ccui.Helper.seekWidgetByName(layer._layout, "btnBaoSam");
        btnBaoSam.setCascadeOpacityEnabled(false);
        btnBaoSam.setOpacity(false);
        btnBaoSam.setPressedActionEnabled(true);
        btnBaoSam.setTag(GameLayer.BTN_BAOSAM);
        btnBaoSam.addTouchEventListener(this.onTouchEventHandler, this);
        this._listButton.push(btnBaoSam);

        var title = ccui.Helper.seekWidgetByName(btnBaoSam, "title");
        title.ignoreContentAdaptWithSize(true);

        var eff = new CustomSkeleton("Animation/baoSam", "skeleton", 1);
        eff.setPosition(cc.p(btnBaoSam.width / 2, btnBaoSam.height / 2));
        eff.setLocalZOrder(-1);
        btnBaoSam.addChild(eff);
        eff.setAnimation(1, "animation", -1);

        var btn = ccui.Helper.seekWidgetByName(layer._layout, "btnHuy");
        btn.setPressedActionEnabled(true);
        btn.setTag(GameLayer.BTN_HUYBAO);
        btn.addTouchEventListener(this.onTouchEventHandler, this);
        this._listButton.push(btn);

        var bg = ccui.Helper.seekWidgetByName(layer._layout, "bg");
        var timer = bg.getChildByName("timer");

        var parent = bg;
        var clipper;
        for (var i = 0; i < 2; i++) {
            clipper = new cc.ClippingNode();
            clipper.attr({
                width: parent.width,
                height: parent.height,
                anchorX: 0.5,
                anchorY: 0.5,
                x: parent.width / 2,
                y: parent.height / 2
            });
            clipper.setAlphaThreshold(0.25);
            parent.addChild(clipper);

            var stencil = new cc.Sprite("#baoSam/process.png");
            stencil.attr({
                anchorX: 0,
                anchorY: 0.5,
                x: timer.x,
                y: timer.y
            });
            clipper.setStencil(stencil);
            parent = clipper;
        }
        clipper.getStencil().setAnchorPoint(cc.p(1, 0.5));

        var effect = new cc.Sprite("#baoSam/processEffect.png");
        effect.attr({
            anchorX: 0,
            anchorY: 0.5,
            x: timer.x,
            y: timer.y,
        });
        clipper.addChild(effect);
        var effect2 = new cc.Sprite("#baoSam/processEffect.png");
        effect2.attr({
            anchorX: 0,
            anchorY: 0.5,
            x: effect.width,
            y: effect.height / 2,
        });
        effect.addChild(effect2);
        effect.runAction(cc.sequence(
            cc.moveTo(0, timer.x, timer.y),
            cc.moveBy(7.5, -effect.width, 0)
        ).repeatForever());

        layer.bgScene = layer.getControl("bgScene");

        timer.time = time;
        var fps = time * 60;
        timer.fps = 0;
        timer.maxFps = fps;
        timer.maxWidth = timer.getContentSize().width;
        timer.minWidth = 14;
        timer.stencil = clipper.getStencil();
        timer.runAction(cc.sequence(
            cc.callFunc(function () {
                var width = this.minWidth + (this.maxWidth - this.minWidth) * ((this.maxFps - this.fps) / this.maxFps);
                this.setContentSize(cc.size(width, this.getContentSize().height));
                this.stencil.setPositionX(width);
                this.fps++;
            }.bind(timer)),
            cc.delayTime(time / fps)
        ).repeat(fps));

        layer.bgScene.getChildByName("bg2").setVisible(false);
        if ((typeToiTrang == 1) || (typeToiTrang == 2) || (typeToiTrang == 3) || (typeToiTrang == 4)) {
            var text = localized("NOTIFY_GAME_2");
            switch (typeToiTrang) {
                case 1: // sam dinh
                    text = StringUtility.replaceAll(text, "@type", "Bộ bài Sảnh Rồng");
                    break;
                case 2: // 5 doi
                    text = StringUtility.replaceAll(text, "@type", "Bộ bài 5 Đôi");
                    break;
                case 3: // tu 2
                    text = StringUtility.replaceAll(text, "@type", "Bộ bài Tứ Quý 2");
                    break;
                case 4: //dong mau
                    text = StringUtility.replaceAll(text, "@type", "Bộ bài Đồng Hoa");
                    break;
            }
            title.loadTexture("GameGUI/baoSam/titleSpecial.png");
            layer.bgScene.getChildByName("bg2").getChildByName("text").setString(text);
            layer.bgScene.getChildByName("bg2").setVisible(true);
        }

        //Effect Show Sam
        layer.fog.setOpacity(0);
        layer.fog.runAction(cc.fadeTo(0.25, 150));
        layer.bgScene.setScale(0);
        layer.bgScene.runAction(cc.scaleTo(0.25, 1).easing(cc.easeBackOut()));

        this.btnSort.setVisible(true);
    },

    resetPlayers: function () {
        this._players[0].clearBai();
        for (var i = 0; i < 5; i++) {
            this._players[i].removeResult();
        }
    },

    updateStartButton: function () {
        cc.log("WHAT IS SHOWING THE BUTTON",
            inGameMgr.gameLogic.convertChair(inGameMgr.gameLogic._roomOwner),
            inGameMgr.gameLogic.numberPlayer()
        );

        if ((inGameMgr.gameLogic.convertChair(inGameMgr.gameLogic._roomOwner) === 0)
            && (inGameMgr.gameLogic.numberPlayer() >= 2)) {
            this.btnStart.setVisible(true);
            ccui.Helper.seekWidgetByName(this._layout, "btnCheat").setVisible(Config.ENABLE_CHEAT);
        }
        else {
            this.btnStart.setVisible(false);
            // ccui.Helper.seekWidgetByName(this._layout, "btnCheat").setVisible(false);
        }
    },

    onUseEmoticon: function(nChair, id, emoId) {
        var pView = this._players[0];
        for (var i = 0; i < inGameMgr.gameLogic._players.length; i++) {
            if ((inGameMgr.gameLogic._players[i]._chairInServer != null ) && (nChair == inGameMgr.gameLogic._players[i]._chairInServer)) {
                pView = this._players[i];
                break;
            }
        }
        if (pView != null && pView instanceof PlayerView) {
            pView.useEmoticon(id, emoId);
        }
    },

    addAvatarFixShare: function () {
        for (var i = 0; i < 5; i++) {
            this._players[i].addTmpAvatar();
        }
    },

    removeAvatarFixShare: function () {
        for (var i = 0; i < 5; i++) {
            this._players[i].clearTmpAvatar();
        }
    },

    getPosFromPlayer: function (id) {
        for (var i = 0; i < inGameMgr.gameLogic._players.length; i++) {
            try {
                if (inGameMgr.gameLogic._players[i]._info.uID == id) {
                    return JSON.parse(JSON.stringify(this._players[i].posEmoticon));
                }
            }
            catch (e) {

            }
        }
        return cc.p(0, 0);
    },

    getPosFromServerChair: function(chairInServer) {
        for (var i = 0; i < inGameMgr.gameLogic._players.length; i++) {
            try {
                if (inGameMgr.gameLogic._players[i]._chairInServer == chairInServer) {
                    return JSON.parse(JSON.stringify(this._players[i].posEmoticon));
                }
            }
            catch (e) {

            }
        }
        return cc.p(0, 0);
    },

    updateDecorate: function () {
        if (!Config.ENABLE_DECORATE_ITEM) return;

        cc.log("+WCItems : " + JSON.stringify(inGameMgr.gameLogic.wcItems));

        if (inGameMgr.gameLogic.wcItems) {
            for (var i = 0; i < inGameMgr.gameLogic.wcItems.length; i++) {
                this.onDecorateUser(inGameMgr.gameLogic.wcItems[i], inGameMgr.gameLogic.convertChair(i));
            }

            inGameMgr.gameLogic.wcItems = [];
        }

        cc.log("+WCObject : " + JSON.stringify(inGameMgr.gameLogic.wcObject));
        if (inGameMgr.gameLogic.wcObject) {
            this.onDecorateUser(inGameMgr.gameLogic.wcObject.item, inGameMgr.gameLogic.convertChair(inGameMgr.gameLogic.wcObject.chair));

            inGameMgr.gameLogic.wcObject = null;
        }
    },

    onDecorateUser: function (item, chair) {
        cc.log("######################Deco : " + inGameMgr.gameLogic._gameState + " => " + item + " | " + chair);
        decorateManager.addDecoInGame(item, this._players[chair].pDeco);

    },

    showLevelUp: function(cmd) {
        var localChair = inGameMgr.gameLogic.convertChair(cmd.nChair);
        this._players[localChair]._levelResult = cmd;
    },

    updateAvatarFrame: function(nChair, path) {
        var localChair = inGameMgr.gameLogic.convertChair(nChair);
        this._players[localChair].setAvatarFrame(path);
    },

    effectTooltip: function (tooltipBg, delayTime = 0) {
        var totalTime = 1.5;
        var fadeTime = 0.5;

        var top = tooltipBg.getChildByName("top");
        top.stopAllActions();
        top.setPositionX(tooltipBg.width);
        top.setOpacity(0);
        top.setScaleX(0.25);
        top.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.sequence(
                    cc.fadeIn(fadeTime).easing(cc.easeIn(2)),
                    cc.delayTime(totalTime - 2 * fadeTime),
                    cc.fadeOut(fadeTime).easing(cc.easeOut(2))
                ),
                cc.sequence(
                    cc.scaleTo(totalTime * 0.2, 1, 1).easing(cc.easeIn(5)),
                    cc.scaleTo(totalTime * 0.8, 0.25, 1).easing(cc.easeOut(5))
                ),
                cc.moveBy(totalTime, cc.p(-tooltipBg.width, 0)).easing(cc.easeInOut(5))
            )
        ));

        var bot = tooltipBg.getChildByName("bot");
        bot.stopAllActions();
        bot.setPositionX(0);
        bot.setOpacity(0);
        bot.setScaleX(0.25);
        bot.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.sequence(
                    cc.fadeIn(fadeTime).easing(cc.easeIn(2)),
                    cc.delayTime(totalTime - 2 * fadeTime),
                    cc.fadeOut(fadeTime).easing(cc.easeOut(2))
                ),
                cc.sequence(
                    cc.scaleTo(totalTime * 0.2, 1, 1).easing(cc.easeIn(5)),
                    cc.scaleTo(totalTime * 0.8, 0.25, 1).easing(cc.easeOut(5))
                ),
                cc.moveBy(totalTime, cc.p(tooltipBg.width, 0)).easing(cc.easeInOut(5))
            )
        ));
    },

    getAvatarPosition: function(index){
        return this._players[index].getAvatarPosition();
    },

    updateButtonEvent: function (isShow, number, process, ticketImg, event) {
        if (!isShow) {
            this.btnEvent.setVisible(false);
            return;
        }

        this.btnEvent.setVisible(true);
        this.btnEvent.ticket.loadTexture(ticketImg);
        this.btnEvent.efxImage.loadTexture(ticketImg);
        this.btnEvent.efxTicket.setVisible(false);
        this.btnEvent.quantity.setString(StringUtility.formatNumberSymbol(number));
        this.btnEvent.number = number;
        if (process > 0) process = Math.max(1, process);
        this.btnEvent.progress.setPercent(process);
        this.btnEvent.progress.setOpacity(100);
        this.btnEvent.event = event;
        this.btnEvent.setScale(1);
        this.updateTopRight();
    },

    effectButtonEvent: function (cmd) {
        var timeRun = 0.5;
        var delayTime = 0;
        var marginTime = 0.5;
        var currPercent = this.btnEvent.progress.getPercent();
        var nextPercent = Math.round((cmd.currentLevelExp / cmd.nextLevelExp) * 100);
        var currTicket = cmd.keyCoin - cmd.keyCoinAdd - cmd.keyCoinAward;
        var nextTicket = cmd.keyCoin;

        if (cmd.keyCoinAdd > 0) {
            var incPercent = Math.round(100 - currPercent);
            this.btnEvent.progress.stopAllActions();
            this.btnEvent.progress.setPercent(currPercent);
            this.btnEvent.progress.runAction(cc.sequence(
                cc.delayTime(delayTime),
                cc.fadeIn(0.1)
            ));

            if (incPercent > 0) {
                this.btnEvent.progress.runAction(cc.sequence(
                    cc.delayTime(delayTime),
                    cc.sequence(
                        cc.delayTime(timeRun / incPercent),
                        cc.callFunc(function () {
                            this.setPercent(this.getPercent() + 1);
                        }.bind(this.btnEvent.progress))
                    ).repeat(incPercent)
                ));
            }
            delayTime += timeRun + marginTime;
            currPercent = 0;
        }

        var incTicket = Math.round(nextTicket - currTicket);
        if (incTicket > 0) {
            var moreDelay = 1.2;
            this.btnEvent.quantity.stopAllActions();
            this.btnEvent.quantity.runAction(cc.sequence(
                cc.delayTime(delayTime),
                cc.callFunc(function () {
                    this.effectButtonEventTicket(incTicket);
                }.bind(this)),
                cc.delayTime(moreDelay),
                cc.sequence(
                    cc.delayTime(timeRun / incTicket),
                    cc.callFunc(function () {
                        this.quantity.setString(StringUtility.formatNumberSymbol(this.number + 1));
                        this.number++;
                    }.bind(this.btnEvent))
                ).repeat(incTicket)
            ));
            delayTime += timeRun + marginTime + moreDelay;
        }

        cc.log("THE REMAIN", nextPercent, currPercent);
        var increase = Math.round(nextPercent - currPercent);
        if (increase > 0) {
            this.btnEvent.progress.runAction(cc.sequence(
                cc.delayTime(delayTime),
                cc.fadeIn(0.1)
            ));
            this.btnEvent.progress.runAction(cc.sequence(
                cc.delayTime(delayTime),
                cc.callFunc(function (currPercent) {
                    cc.log("WHAT IS THIS?", currPercent);
                    this.setPercent(currPercent);
                }.bind(this.btnEvent.progress, currPercent)),
                cc.sequence(
                    cc.delayTime(timeRun / increase),
                    cc.callFunc(function () {
                        this.setPercent(this.getPercent() + 1);
                    }.bind(this.btnEvent.progress))
                ).repeat(increase)
            ));
            delayTime += timeRun + marginTime;
        }

        this.btnEvent.progress.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.fadeTo(0.1, 100)
        ));

    },

    effectButtonEventTicket: function (ticket) {
        this.btnEvent.efxTicket.stopAllActions();
        this.btnEvent.efxTicket.setPosition(this.btnEvent.ticket.x - 30, this.btnEvent.ticket.y - 60);
        this.btnEvent.efxTicket.setVisible(true);
        this.btnEvent.efxTicket.setOpacity(0);
        this.btnEvent.efxTicket.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(0.2, cc.p(this.btnEvent.ticket.x, this.btnEvent.ticket.y - 60)).easing(cc.easeOut(5)),
                cc.fadeIn(0.1)
            ),
            cc.delayTime(0.5),
            cc.spawn(
                cc.moveTo(0.3, this.btnEvent.ticket.getPosition()).easing(cc.easeBackIn()),
                cc.fadeOut(0.3).easing(cc.easeIn(5))
            )
        ));

        this.btnEvent.efxImage.stopAllActions();
        this.btnEvent.efxImage.setScale(0);
        this.btnEvent.efxImage.runAction(cc.scaleTo(0.5, 1).easing(cc.easeBackOut()));

        this.btnEvent.efxNumber.stopAllActions();
        this.btnEvent.efxNumber.setString("+" + StringUtility.pointNumber(ticket));
        this.btnEvent.efxNumber.setPosition(0, 0);
        this.btnEvent.efxNumber.setVisible(true);
        this.btnEvent.efxNumber.setOpacity(0);
        this.btnEvent.efxNumber.runAction(cc.spawn(
            cc.moveTo(0.5, cc.p(-30, 0)).easing(cc.easeBackOut()),
            cc.fadeIn(0.1)
        ));

        this.btnEvent.stopAllActions();
        this.btnEvent.setScale(1);
        this.btnEvent.runAction(cc.sequence(
            cc.delayTime(1),
            cc.scaleTo(0.2, 1.1, 0.9).easing(cc.easeOut(2)),
            cc.scaleTo(0.5, 1).easing(cc.easeBackInOut(2))
        ));

        return 1.2;
    },

    effectExpRankChange: function(expChange, positionChange){
        if (expChange === 0) {
            this.btnMiniRank.txtExpChange.setVisible(false);
            this.btnMiniRank.pArrow.removeAllChildren();
            return;
        }

        this.btnMiniRank.txtExpChange.stopAllActions();
        this.btnMiniRank.txtExpChange.setVisible(true);
        this.btnMiniRank.txtExpChange.setString("+" + StringUtility.pointNumber(expChange) + " EXP");
        this.btnMiniRank.txtExpChange.setOpacity(0);
        this.btnMiniRank.txtExpChange.setPositionY(this.btnMiniRank.txtExpChange.defaultPos.y + 20);
        this.btnMiniRank.txtExpChange.runAction(cc.spawn(
            cc.moveTo(1.5, this.btnMiniRank.txtExpChange.defaultPos.x, this.btnMiniRank.txtExpChange.defaultPos.y),
            cc.sequence(
                cc.fadeIn(0.25),
                cc.delayTime(1),
                cc.fadeOut(0.25),
                cc.hide()
            )
        ));

        if (positionChange === 0) return;
        var pArrowSize = this.btnMiniRank.pArrow.getContentSize();
        var actionMove = cc.moveBy(1.5, 0, pArrowSize.height * 2);
        var spriteName, posY, actionRun;
        if (positionChange > 0) { // bi tut hang
            spriteName = "res/Lobby/Ranking/iconDownLevel.png";
            posY = pArrowSize.height * 1.5;
            actionRun = actionMove.reverse().easing(cc.easeIn(3));
        } else {
            spriteName = "res/Lobby/Ranking/iconUpLevel.png";
            posY = -pArrowSize.height * 0.5;
            actionRun = actionMove.easing(cc.easeOut(3));
        }
        for (var i = 0; i < 5; i++) {
            var icon = new cc.Sprite(spriteName);
            icon.setPositionY(posY);
            icon.setScale(1.25);
            icon.setPositionX(pArrowSize.width * Math.random());
            this.btnMiniRank.pArrow.addChild(icon);
            icon.runAction(cc.sequence(
                cc.delayTime(0.1 * i),
                actionRun.clone(),
                cc.removeSelf()
            ));
        }
    },

    logForIOS: function (string) {
        // if (!(Config.ENABLE_CHEAT || gamedata.userData.uID == 376699005 || gamedata.userData.uID == 37445173)) return;
        // var log = new ccui.Text(string, SceneMgr.FONT_BOLD, 15);
        // log.setAnchorPoint(cc.p(0.5, 0));
        // log.setPosition(cc.p(this.bg.width / 2, this.logHeight));
        // this.bg.addChild(log);
        // this.logHeight += log.height;
    }
});
var GameLayer = BoardScene;

GameLayer.className = "BoardScene";

GameLayer.FONT_LIGHT = cc.sys.isNative ? "fonts/robotoLight.ttf" : "robotoLight";
GameLayer.FONT_BOLD = cc.sys.isNative ? "fonts/robotoBold.ttf" : "robotoBold";

GameLayer.EFFECT_ZORDER = 5;

GameLayer.BTN_CAMERA = 1;
GameLayer.BTN_CHAT = 2;
GameLayer.BTN_QUIT = 3;
GameLayer.BTN_XEPBAI = 4;
GameLayer.BTN_BOLUOT = 5;
GameLayer.BTN_DANH = 6;
GameLayer.BTN_START = 7;
GameLayer.BTN_BAOSAM = 8;
GameLayer.BTN_HUYBAO = 9;
GameLayer.BTN_CHEAT = 10;
GameLayer.BTN_INVITE = 11;

GameLayer.BTN_AVATAR_0 = 12;
GameLayer.BTN_AVATAR_1 = 13;
GameLayer.BTN_AVATAR_2 = 14;
GameLayer.BTN_AVATAR_3 = 15;
GameLayer.BTN_AVATAR_4 = 16;

GameLayer.BTN_MENU = 17;
GameLayer.BTN_QUICK_EMO = 18;
GameLayer.BTN_QUICK_CHAT = 19;
GameLayer.BTN_JACKPOT = 20;
GameLayer.BTN_ADD_BOT = 21;
GameLayer.BTN_NEW_RANK = 22;
GameLayer.BTN_EVENT = 23;
GameLayer.BTN_HINT = 24;

GameLayer.JACKPOT = 1104;

GameLayer.USER_INFO_GUI = 1112;

GameLayer.CHAT_GUI = 100000;
GameLayer.sharedPhoto = false;
GameLayer.DESIGN_WIDTH = 1200;
GameLayer.DESIGN_HEIGHT = 720;

GameLayer.LAYER_SAM_TAG = 111;

GameLayer.END_TYPE_WIN = 2;
GameLayer.END_TYPE_WIN_SAM = 3;
GameLayer.END_TYPE_WIN_SAM_BLOCK = 4;
GameLayer.END_TYPE_WIN_NORMAL = 5;
GameLayer.END_TYPE_WIN_SAM_DINH = 6;
GameLayer.END_TYPE_WIN_FOUR_PIG = 7;
GameLayer.END_TYPE_WIN_FIVE_PAIR = 8;
GameLayer.END_TYPE_WIN_FLUSH = 9;
GameLayer.END_TYPE_WIN_DEN_BAO = 10;
GameLayer.END_TYPE_LOSE_DEN_BAO = 11;
GameLayer.END_TYPE_DRAW = 12;
GameLayer.END_TYPE_LOSE = 13;
GameLayer.END_TYPE_LOSE_TREO = 14;
GameLayer.END_TYPE_LOSE_TOI_TRANG = 15;
GameLayer.END_TYPE_LOSE_SAM_BLOCK = 16;

var LayerCHEAT = BaseLayer.extend({
    ctor: function () {
        this._super("CHEAT");
        this.initWithBinaryFile("CheatGUI.json");

    },
    onTouchBegan: function (touch, event) {

        var target = event.getCurrentTarget();
        target.selectCard = null;
        for (var i = target.cards.length - 1; i >= 0; i--) {
            if (target.cards[i].isVisible() && target.cards[i].containTouchPoint(touch.getLocation())) {
                target.selectCard = target.cards[i];
                return true;
            }
        }

        return true;
    },
    onTouchMoved: function (touch, event) {
        var target = event.getCurrentTarget();
        if (target.selectCard) {
            var delta = touch.getDelta();
            target.selectCard.setPosition(cc.pAdd(target.selectCard.getPosition(), delta));
        }
    },
    onTouchEnded: function (touch, event) {
        var target = event.getCurrentTarget();
        if (target.selectCard) {
            var posW = target.selectCard.convertToWorldSpaceAR(cc.p(0, 0));
            for (var i = 0; i < target._players.length; i++) {
                var pos = target._players[i]["panel"].convertToWorldSpaceAR(cc.p(0, 0));
                var rect = cc.rect(pos.x, pos.y, target._players[i]["panel"].getContentSize().width, target._players[i]["panel"].getContentSize().height);
                if (cc.rectContainsPoint(rect, posW)) {
                    var sam = new SamCard(target.selectCard._id);
                    sam.setScale(.55);
                    sam.setPositionX(target._players[i]["cards"].length * 30);
                    target._players[i]["panel"].getChildByName("node").addChild(sam);
                    target._players[i]["cards"].push(sam);

                    for (var i = 0; i < target.cards.length; i++) {
                        if (target.cards[i]._id == target.selectCard._id) {
                            target.cards.splice(i, 1);
                            target.selectCard.removeFromParent(true);
                            target.selectCard = null;
                            break;
                        }
                    }
                }
            }
        }
    },
    initCheat: function () {
        this._players = [];
        for (var i = 0; i < 5; i++) {
            if (inGameMgr.gameLogic._players[i]._ingame) {
                var tmp = {};
                tmp["name"] = inGameMgr.gameLogic._players[i]._info["uName"];
                tmp["chair"] = inGameMgr.gameLogic._players[i]._chairInServer;
                tmp["cards"] = [];
                this._players.push(tmp);
            }
        }
        //_players.sort(function(a, b){return a["chair"]- b["chair"]});

        for (var i = 0; i < this._players.length; i++) {
            this._players[i]["panel"] = this.panels[i];
            this.panels[i].setVisible(true);
            this.panels[i].getChildByName("name").setString(this._players[i]["name"]);
            if (this._players[i]["name"] == gamedata.userData.zName)       // minh`
            {
                this.panels[i].getChildByName("name").setString("Mình :" + this._players[i]["name"]);
                this.panels[i].getChildByName("name").setColor({r: 255, g: 0, b: 0});
            }
        }

    },
    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true);
    },

    customizeGUI: function () {
        this.bg = this.getControl("bg");
        var btn = this.customizeButton("btnOK", 1);
        btn.setPosition(100, 100);
        btn.loadTextures("Common/btnGreen.png", "Common/btnGreen.png", "Common/btnGreen.png");

        var btnQuit = this.customizeButton("btnQuit", 2);
        btnQuit.loadTextures("Common/btnClose.png", "Common/btnClose.png", "Common/btnClose.png")

        this.panels = [];
        this.cards = [];
        var bg = ccui.Helper.seekWidgetByName(this._layout, "bg");

        bg.setScale(0.75);
        bg.setOpacity(0);
        bg.runAction(cc.spawn(new cc.EaseBackOut(cc.scaleTo(.3, 1)), cc.fadeIn(.3)));

        for (var i = 0; i < 5; i++) {
            this.panels.push(ccui.Helper.seekWidgetByName(bg, "Panel" + i));
            this.panels[i].setVisible(false);
        }
        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        });
        this.setFog(true);

        var node = bg.getChildByName("node");
        node.setPositionX(node.getPositionX() + 200);
        var xx = 0;
        var deltaY = -30;
        for (var i = 8; i < 21; i++) {
            var sam = new SamCard(i);
            node.addChild(sam);
            sam.setScale(.55);
            sam.setLocalZOrder(i - 8);
            sam.setPosition(cc.p(xx, (i - 8) * deltaY));
            this.cards.push(sam);
        }
        xx += 30;
        for (var i = 21; i < 34; i++) {
            var sam = new SamCard(i);
            node.addChild(sam);
            sam.setScale(.55);
            sam.setLocalZOrder(i - 8);
            sam.setPosition(cc.p(xx, (i - 21) * deltaY));
            this.cards.push(sam);

        }

        xx += 30;
        for (var i = 34; i < 47; i++) {
            var sam = new SamCard(i);
            node.addChild(sam);
            sam.setScale(.55);
            sam.setLocalZOrder(i - 8);
            sam.setPosition(cc.p(xx, (i - 34) * deltaY));
            this.cards.push(sam);

        }

        xx += 30;
        for (var i = 47; i < 60; i++) {
            var sam = new SamCard(i);
            node.addChild(sam);
            sam.setScale(.55);
            sam.setLocalZOrder(i - 8);
            sam.setPosition(cc.p(xx, (i - 47) * deltaY));
            this.cards.push(sam);

        }

        this.initCheat();
    },
    onButtonRelease: function (btn, id) {
        switch (id) {
            case 1:
            {
                this._players.sort(function (a, b) {
                    return a["chair"] - b["chair"]
                });

                var cards_ = [];
                var selectFirstTurn = 0;
                for (var i = 0; i < this._players.length; i++) {
                    if (this._players[i]["panel"].getChildByName("check").isSelected()) {
                        selectFirstTurn = this._players[i]["chair"];
                    }
                    for (var j = 0; j < this._players[i]["cards"].length; j++) {
                        cards_.push(Card.convertToServerCard(this._players[i]["cards"][j]._id));
                    }
                }
                for (var i = 0; i < this.cards.length; i++) {
                    cards_.push(Card.convertToServerCard(this.cards[i]._id));
                }

                // send cheat
                var pk = new CmdSendCheatBai();
                pk.putData(selectFirstTurn, cards_, true);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                this._layerColor.runAction(cc.fadeTo(.2, 0));
                var bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
                bg.setScale(1);
                bg.runAction(cc.spawn(new cc.EaseBackIn(cc.scaleTo(.2, 1.2)), cc.fadeOut(.2)));

                this.runAction(new cc.Sequence(cc.delayTime(.2), cc.removeSelf()));
                break;
            }
            case 2:
            {

                this._players.sort(function (a, b) {
                    return a["chair"] - b["chair"]
                });

                var cards_ = [];
                var selectFirstTurn = 0;
                for (var i = 0; i < this._players.length; i++) {
                    if (this._players[i]["panel"].getChildByName("check").isSelected()) {
                        selectFirstTurn = this._players[i]["chair"];
                    }
                    for (var j = 0; j < this._players[i]["cards"].length; j++) {
                        cards_.push(Card.convertToServerCard(this._players[i]["cards"][j]._id));
                    }
                }
                for (var i = 0; i < this.cards.length; i++) {
                    cards_.push(Card.convertToServerCard(this.cards[i]._id));
                }

                // send cheat
                var pk = new CmdSendCheatBai();
                cc.log("card: " + JSON.stringify(cards_));
                pk.putData(selectFirstTurn, cards_, false);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                this._layerColor.runAction(cc.fadeTo(.2, 0));
                var bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
                bg.setScale(1);
                bg.runAction(cc.spawn(new cc.EaseBackIn(cc.scaleTo(.2, 1.2)), cc.fadeOut(.2)));

                this.runAction(new cc.Sequence(cc.delayTime(.2), cc.removeSelf()));
                break;
            }
        }
    }
});

LayerCHEAT.className = "LayerCHEAT";