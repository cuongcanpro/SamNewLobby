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
        this._cardRecent = [];

        this.initWithBinaryFileAndOtherSize("GameGUI.json", cc.size(GameLayer.DESIGN_WIDTH, GameLayer.DESIGN_HEIGHT));
    },

    initGUI: function () {
        this.deckCard = this.getControl("deckCard");
        this.deckCard.setVisible(false);
        this.demoCard = this.getControl("demoCard", this.deckCard);
        this.demoCard.setRotation3D(vec3(0, -53, 90));
        this.demoCard.setVisible(false);
        this.demoCard.setLocalZOrder(10);

        this.shuffler = db.DBCCFactory.getInstance().buildArmatureNode("Shuffle");
        this.shuffler.setPosition(cc.p(this.deckCard.width / 2, 0));
        this.deckCard.addChild(this.shuffler);

        this.getControl("demo").setVisible(false);
    },

    onEnter: function () {
        cc.log("ON ENTER ***************** ");
        BaseLayer.prototype.onEnter.call(this);
        this.onUpdateGUI();
        GameLayer.sharedPhoto = false;
        this.setBackEnable(true);
        Event.instance().addGuiInGame();
        //NewRankData.addMiniRankGUI(false);
        //GameClient.getInstance().setTargetNotifyNetworkSlow(this);

        //board voucher
        sceneMgr.openGUI(BoardVoucherGUI.className, BoardVoucherGUI.GUI_TAG, BoardVoucherGUI.GUI_TAG);
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
        this._players[0].clearHandOncard();
        this._players[0]._moveCard.setVisible(false);
        for (var i = 1; i < 5; i++) {
            this._players[i].clearBaiEndGame();
            this._players[i]._card.setVisible(false);
        }

        for (var i = 0; i < 5; i++) {
            this._players[i].clearThangThua();
            this._players[i].removeBao1();
            // this._players[i]._uiHome.setVisible(false);
        }
        if (!cc.sys.isNative) {
            this._players[0].initForMy(this);
        }
        // this._players[gamedata.gameLogic.convertChair(gamedata.gameLogic._roomOwner)]._uiHome.setVisible(true);
        this._effect2D.removeAllChildren(true);
        this._effect2D.effects = [];

        this.getControl("check", this.getControl("btnQuit")).setVisible(false);
        var muccuoc = this.getControl("muccuoc");
        var ban = this.getControl("ban");
        ban.setString(gamedata.gameLogic._roomIndex);
        muccuoc.setString(StringUtility.formatNumberSymbol(gamedata.gameLogic._bet));
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
        if (control === undefined || control == null || anim === undefined || anim == "") return null;

        if (control.anim) {
            control.removeChild(control.anim);
            control.anim = null;
        }

        var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim);
        if (eff) {
            control.addChild(eff);
            eff.setPosition(control.getContentSize().width / 2, control.getContentSize().height / 2);
            //eff.getAnimation().gotoAndPlay("1", -1, -1, 0);
            control.anim = eff;
        }
        return eff;
    },
    initJackpot: function () {
        UPDATING_JACKPOT = true;
        var btnjp = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot");
        var jackpot = ccui.Helper.seekWidgetByName(btnjp, "jackpot");

        jackpot.setString("$" + StringUtility.standartNumber(gamedata.jackpot[0][gamedata.selectedChanel]));

        var introJackpot = this.getControl("introJackpot");
        //cc.log(introJackpot.isVisible());
        self = this;
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

                        for (var j = 0; j < gamedata.jackpot[1][gamedata.selectedChanel]; j++) {
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
                    cc.delayTime(dias.length * 0.32 + 2.9),
                    cc.callFunc(function () {
                        if (gamedata.jackpot[1][gamedata.selectedChanel] == 4) {
                            // self.createAnim(this, "Bang1");
                            // this.anim.gotoAndPlay("1", -1);
                        } else {
                            if (this.anim) {
                                cc.log("1212312");
                                this.removeChild(this.anim);
                                this.anim = null;
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
        //return;
        fr.crashLytics.log("updateJackpotGUI 1");
        if (UPDATING_JACKPOT) {
            //cc.log("trueeeeeeeeeeeee");
            return;
        }
        UPDATING_JACKPOT = true;
        //cc.log("jackpotupdate");
        var listDiamond = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot").getChildByName("listDiamond");
        this.dias = listDiamond.getChildren();
        this.btnjp = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot");
        var self = this;

        fr.crashLytics.log("updateJackpotGUI 2");
        //cc.log(gamedata.jackpot[0][gamedata.selectedChanel]);
        var jackpot = ccui.Helper.seekWidgetByName(this._layout, "jackpot");
        jackpot.setString("$" + StringUtility.standartNumber(gamedata.jackpot[0][gamedata.selectedChanel]));

        try {
            var lastVisible = -1;
            for (var j = 0; j < gamedata.jackpot[1][gamedata.selectedChanel]; j++) {
                var dia = this.dias[j];
                if (dia.isVisible() == false) {
                    dia.runAction(new cc.Sequence(new cc.CallFunc(function () {
                        this.setVisible(true);
                    }, dia), new cc.ScaleTo(0.2, 1.2), new cc.CallFunc(function () {
                        self.createAnim(this, "SmallDiamond");
                        this.anim.gotoAndPlay("1", -1);
                        this.anim.setCompleteListener(function () {
                            this.runAction(new cc.ScaleTo(0.1, 1));
                        }.bind(this));
                    }, dia)));
                } else {
                    lastVisible = j;
                }
            }
            for (j = gamedata.jackpot[1][gamedata.selectedChanel]; j < this.dias.length; j++) {
                this.dias[j].setVisible(false);
            }
            self.runAction(new cc.Sequence(cc.delayTime((lastVisible + 1) * 0.32 + 0.4), new cc.CallFunc(function () {
                if (gamedata.jackpot[1][gamedata.selectedChanel] == 4) {
                    // self.createAnim(this.btnjp, "Bang1");
                    // this.btnjp.anim.gotoAndPlay("1", -1);
                } else {
                    if (this.btnjp.anim) {
                        this.btnjp.removeChild(this.btnjp.anim);
                        this.btnjp.anim = null;
                    }
                }
            }, self)));
            fr.crashLytics.log("updateJackpotGUI 3");
            this.btnjp.runAction(new cc.Sequence(cc.delayTime(this.dias.length * 0.32 + 1), new cc.CallFunc(function () {
                UPDATING_JACKPOT = false;
                cc.log("updating jackpot", UPDATING_JACKPOT);
            }, this.btnjp)));
        } catch (e) {
            fr.crashLytics.log("updateJackpotGUI loi: " + e);
        }

        fr.crashLytics.log("updateJackpotGUI 4");
    },

    customizeGUI: function () {
        this.customizeButton("btnCamera", GameLayer.BTN_CAMERA).setVisible(cc.sys.isNative);
        this.customizeButton("btnChat", GameLayer.BTN_CHAT, this.getControl("panel_button")).setVisible(false);
        this.customizeButton("btnQuit", GameLayer.BTN_QUIT);
        this.btnSort = this.customizeButton("btnXepbai", GameLayer.BTN_XEPBAI);
        this.btnSort.setLocalZOrder(5);
        this.customizeButton("btnCheat", GameLayer.BTN_CHEAT);
        this.customizeButton("btnInvite", GameLayer.BTN_INVITE).setVisible(false);
        this.customizeButton("btnAddBot", GameLayer.BTN_ADD_BOT);

        this.bg = this.getControl("bg");

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

        this.autoStartPanel = this.getControl("autoStart");
        this.btnStart = this.customizeButton("btnStart", GameLayer.BTN_START, this.autoStartPanel);
        this.autoStartPanel.setVisible(false);
        this.autoStartPanel.lbTime = this.getControl("time", this.autoStartPanel);
        var bg = this.getControl("bg", this.autoStartPanel);
        this.autoStartPanel.eff = new CustomSkeleton("Animation/startGameSpark", "skeleton", 1);
        this.autoStartPanel.eff.setPosition(cc.p(bg.width / 2, bg.height / 2 + 5));
        bg.addChild(this.autoStartPanel.eff);

        this.btnPlay.cothedanh = false;
        //run animation btnjackpot
        var btnjp = this.customizeButton("btnJackpot", GameLayer.BTN_JACKPOT);
        btnjp.setPressedActionEnabled(false);
        var introJackpot = this.getControl("introJackpot");

        var config = CommonLogic.getJackpotConfig(gamedata.selectedChanel);
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

        for (var i = 0; i < 5; i++) {
            var panel = this._layout.getChildByName("panel" + i);
            var btn = this.getControl("btn", panel);
            btn.setPressedActionEnabled(false);
            btn.setTag(i + GameLayer.BTN_AVATAR_0);
            btn.addTouchEventListener(this.onTouchEventHandler, this);

            var player = i === 0? new MyView(this) : new PlayerView(this);
            player.setPanel(panel);
            player.pDeco = ccui.Helper.seekWidgetByName(panel, "pEmo");
            player.setLocalZOrder(-1);
            player.posEmoticon = panel.convertToWorldSpace(btn.getPosition());

            if (i === 0)  // myplayer
            {
                player._cardPanel = ccui.Helper.seekWidgetByName(this._layout, "card_panel");
                player._cardPanel.setLocalZOrder(5);
                player.result = ccui.Helper.seekWidgetByName(this._layout, "result_panel");
                player.result.setLocalZOrder(6);
                player.initForMy(this);
                player._type = Player.MY;

                player._card.setVisible(false);
            } else {
                player._numCard = ccui.Helper.seekWidgetByName(player._card, "num");
                player._type = Player.ENEMY;
                player._index = i;

                cc.log("PLAYER VIEW SIZE", player._bg.width);
                if (player.isSwapped()) {
                    player.swapSide(player._card);
                    player.vip.setAnchorPoint(cc.p(0, 0.5));
                    player.swapSide(player.vip);
                    player.swapSide(player.vip2);
                    player.swapSide(player.passPanel);
                    player.swapSide(player.baoPanel);
                    player.swapSide(player.timer);
                    player.swapSide(player.baoOne);
                    player.swapResultGUI();
                }

                player._cardFirstTurn = new cc.Sprite(SamCard.getCardResource(52, true));
                player._cardFirstTurn.setPosition(player._card.getPosition());
                player._cardFirstTurn.setVisible(false);
                panel.addChild(player._cardFirstTurn);
            }
            //this.openGUI(player);

            this.addChild(player);
            this._players.push(player);
        }
        this._effect2D = new LayerEffect2D(this);
        this.addChild(this._effect2D);
        //this.openGUI(this._effect2D);
        this._effect2D.setLocalZOrder(1);

        this.pTooltip = this.getControl("toolTip");
        this.pTooltip.lb = this.getControl("lb", this.pTooltip);

        this._chatHistories = [];

        var pChat = this.getControl("pChat", this._layout);
        this.customButton("btnQuickChat", GameLayer.BTN_QUICK_CHAT, pChat);
        this.customButton("btnQuickEmo", GameLayer.BTN_QUICK_EMO, pChat).setVisible(false);

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

        if (event.isInEvent(Event.MID_AUTUMN)) {
            this.initEventMidAutumn();
        }
        if (event.isInEvent(Event.BLUE_OCEAN)) {
            this.initEventBlueOcean();
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
        var pos = cc.p(cc.winSize.width - 40, cc.winSize.height - 80);
        var btn = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot");
        var parent = btn.getParent();
        pos = cc.p(btn.getPositionX() + btn.getContentSize().width * 0.5, btn.getPositionY() - btn.getContentSize().height * 0.5 * parent.getScale() - 20);
        pos = parent.convertToWorldSpace(pos);
        return pos;
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable([BoardVoucherGUI.className]))
            return;

        if (this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG) || this.getChildByTag(LayerEndGame.TAG))
            return;
        if (this.getChildByTag(GameLayer.CHAT_GUI)) {
            this.getChildByTag(GameLayer.CHAT_GUI).removeFromParent(true);
            return;
        }
        this.onButtonRelease(null, GameLayer.BTN_QUIT);
    },

    onUpdateGUI: function (data) {
        cc.log("UPDATE GUI " + JSON.stringify(data));
        if (!gamedata.gameLogic)
            return;

        if (data && data == "updateJackpot") {
            return;
        }
        if (data && data.jackpotPacket) {
            return;
        }

        if (gamedata.gameLogic._gameState === GameState.ENDGAME) {
            fr.crashLytics.log("End game step 1");
        }
        cc.log("UPDATE GUI gamedata.gameLogic._gameState " + gamedata.gameLogic._gameState);
        switch (gamedata.gameLogic._gameState) {
            case GameState.JOINROOM:
            {
                var muccuoc = this.getControl("muccuoc");
                var ban = this.getControl("ban");

                ban.setString(gamedata.gameLogic._roomIndex);
                muccuoc.setString(StringUtility.formatNumberSymbol(gamedata.gameLogic._bet));


                for (var i = 0; i < 5; i++) {
                    this._players[i].updateWithPlayer(gamedata.gameLogic._players[i]);
                    // this._players[i]._uiHome.setVisible(false);
                    this._players[i].addVipEffect();

                }
                // this._players[gamedata.gameLogic.convertChair(gamedata.gameLogic._roomOwner)]._uiHome.setVisible(true);
                this.updateStartButton();

                this.updateOwnerRoom(gamedata.gameLogic._roomOwnerID)
                if (gamedata.userData.uID == gamedata.gameLogic._roomOwnerID) {
                    //ccui.Helper.seekWidgetByName(this._layout,"btnInvite").setVisible(true);
                }

                if (gamedata.gameLogic._players[0]._status == 1 && gamedata.gameLogic.gameAction == 4) {
                    cc.log("current " + gamedata.gameLogic._activeLocalChair + "   time:" + gamedata.gameLogic.activeTimeRemain);
                    this._players[gamedata.gameLogic._activeLocalChair].addEffectTime(gamedata.gameLogic.activeTimeRemain);

                    for (var i = 1; i < 5; i++) {
                        if ((gamedata.gameLogic._players[i]._status != 0) && (gamedata.gameLogic._players[i]._status != 1) && (gamedata.gameLogic._players[i]._remainCard > 0)) {
                            this._players[i]._card.setVisible(true);
                            this._players[i]._numCard.setString("" + gamedata.gameLogic._players[i]._remainCard);
                            if (gamedata.gameLogic._players[i]._remainCard._remainCard == 1) {
                                this._players[i].addBao1();
                            }
                        }
                    }
                }

                this.btnSort.setVisible(false);

                this.updateDecorate();

                gameSound.playVaoban();
                gameSound.playVaobanNoi();
                break;
            }
            case GameState.PLAYCONTINUE:
            {
                gameSound.playVaoban();
                // Cap nhat thong tin phong choi
                var muccuoc = this.getControl("muccuoc");
                var ban = this.getControl("ban");

                ban.setString(gamedata.gameLogic._roomIndex);
                muccuoc.setString(StringUtility.formatNumberSymbol(gamedata.gameLogic._bet));

                for (var i = 0; i < 5; i++) {
                    this._players[i].updateWithPlayer(gamedata.gameLogic._players[i]);
                    // this._players[i]._uiHome.setVisible(false);
                    this._players[i].addVipEffect();

                }
                // this._players[gamedata.gameLogic.convertChair(gamedata.gameLogic._roomOwner)]._uiHome.setVisible(true);

                // Dua vao trang thai cua game de reconnect
                switch (gamedata.gameLogic._serverGameState) {
                    case 1:                         // playing
                    {
                        for (var i = 1; i < 5; i++) {
                            if (gamedata.gameLogic._players[i]._ingame) {
                                this._players[i]._card.setVisible(true);
                                this._players[i]._numCard.setString("" + gamedata.gameLogic._players[i]._info["cards"]);
                                if (gamedata.gameLogic._players[i]._info["cards"] == 0) {
                                    this._players[i]._card.setVisible(false);
                                }
                                else if (gamedata.gameLogic._players[i]._info["cards"] == 1) {
                                    this._players[i].addBao1();
                                }
                            }

                        }

                        cc.log("ACTION GAME RECONNECT  = " + gamedata.gameLogic._serverGameAction);

                        switch (gamedata.gameLogic._serverGameAction) {
                            case 4:  // Choi game binh thuong
                            {
                                this._players[0].clearBai();
                                this._players[0].initCards(gamedata.gameLogic._cardChiabai);
                                this.btnSort.setVisible(true);


                                var localChairTurn = gamedata.gameLogic.convertChair(gamedata.gameLogic._chairTurn);
                                this._players[localChairTurn].addEffectTime(gamedata.gameLogic._timeRemain);

                                if (gamedata.gameLogic._cardRecent.length > 0) {
                                    this._effect2D.clearBaiDanh();
                                    this._effect2D.addRecentBai(gamedata.gameLogic._cardRecent);
                                    this._cardRecent = gamedata.gameLogic._cardRecent;
                                }
                                if (localChairTurn == 0) {
                                    this.updateActionButton(this.btnPlay, false);
                                    this.updateActionButton(this.btnPass, false, gamedata.gameLogic.newRound);
                                    this.kiemtraDanhbai();
                                }
                                else {
                                    this.btnPlay.setVisible(false);
                                    this.btnPass.setVisible(false);
                                }

                                var someOneBao = false;
                                for (var i = 0; i < 5; i++) {
                                    if (gamedata.gameLogic._players[i]._ingame) {
                                        if (gamedata.gameLogic._players[i]._info["baosam"]) {
                                            this._players[i].baoNormalize();
                                            someOneBao = true;
                                        }
                                    }
                                }
                                for (var i = 0; i < 5; i++) {
                                    if (gamedata.gameLogic._players[i]._ingame) {
                                        if (!gamedata.gameLogic._players[i]._info["baosam"]) {
                                            this._players[i].baoCancelNormalize();
                                        }
                                    }
                                }
                                break;
                            }
                            case 2:         // Dang bao sam
                            {
                                this._players[0].clearBai();
                                this._players[0].initCards(gamedata.gameLogic._cardChiabai);
                                this.btnSort.setVisible(true);
                                for (var i = 1; i < 5; i++) {
                                    if (gamedata.gameLogic._players[i]._ingame) {
                                        this._players[i]._card.setVisible(true);
                                        this._players[i]._numCard.setString("" + 10);
                                        if (gamedata.gameLogic._players[i]._info["baosam"]) {
                                            var localChair = i;
                                            this._players[localChair].bao();
                                        }
                                        else {
                                            if (gamedata.gameLogic._players[i]._info["huybaosam"]) {
                                                var localChair = i;
                                                this._players[localChair].baoCancel();
                                            }
                                        }
                                    }
                                }


                                if (gamedata.gameLogic._players[0]._info["baosam"]) {
                                    var localChair = 0;
                                    this._players[localChair].bao();
                                }
                                else {
                                    if (gamedata.gameLogic._players[0]._info["huybaosam"]) {
                                        var localChair = 0;
                                        this._players[localChair].baoCancel();
                                    }
                                    else {
                                        this.addBaoSamLayer(gamedata.gameLogic._timeRemain, gamedata.gameLogic.typeToiTrang);
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    }
                    case 0:     // chua start game
                    {
                        break;
                    }
                    case 2:     // endgame
                    {
                        break;
                    }
                }

                this.updateDecorate();

                break;
            }
            case GameState.USERJOIN:
            {
                this._players[gamedata.gameLogic._activeLocalChair].updateWithPlayer(gamedata.gameLogic._players[gamedata.gameLogic._activeLocalChair]);
                this._players[gamedata.gameLogic._activeLocalChair].addVipEffect();
                this._players[gamedata.gameLogic._activeLocalChair].efxPlayerIn();
                if (gamedata.gameLogic._players[gamedata.gameLogic._activeLocalChair]._status != 1)
                    this.updateStartButton();
                gameSound.playNguoikhacvaoban();
                this.updateDecorate();
                break;
            }
            case GameState.USERLEAVE:
            {
                if (gamedata.gameLogic._players[gamedata.gameLogic._activeLocalChair]._status != 1) {
                    this.updateStartButton();
                }

                this._players[gamedata.gameLogic._activeLocalChair].efxPlayerOut();
                this._players[gamedata.gameLogic._activeLocalChair].updateWithPlayer(gamedata.gameLogic._players[gamedata.gameLogic._activeLocalChair]);
                break;
            }
            case GameState.AUTOSTART:
            {
                if (data && (data.isCancel) && (gamedata.gameLogic._timeAutoStart > 0))
                    this.addAutoStart(gamedata.gameLogic._timeAutoStart);
                if (data && (!data.isCancel)) {
                    this.stopAutoStart();
                }
                break;
            }
            case GameState.UPDATEOWNERROOM:
            {
                if (data) {
                    for (var i = 0; i < 5; i++) {
                        // this._players[i]._uiHome.setVisible(false);
                    }
                    // this._players[gamedata.gameLogic.convertChair(gamedata.gameLogic._roomOwner)]._uiHome.setVisible(true);
                    this.updateStartButton();

                }
                break;
            }
            case GameState.FIRSTTURN:
            {
                if (!data) return;

                this._players[0].clearBai();
                this.btnStart.setVisible(false);

                if (data.isRandom) {
                    for (var i = 0; i < 5; i++) {
                        var id = gamedata.gameLogic._cardFirstTurn[i];
                        var chair = gamedata.gameLogic.convertChair(i);
                        if (gamedata.gameLogic._players[chair]._ingame &&
                            gamedata.gameLogic._players[chair]._status !== 1) {
                            this._players[chair].firstTurn(id).setVisible(true);
                            this._effect2D.firstTurn(this._players[chair]);
                        }
                    }
                }

                this.getControl("bg3").getChildByName("text").setString(
                    gamedata.gameLogic._players[gamedata.gameLogic.convertChair(data.chair)]._info["uName"] + " được đi lượt đầu tiên !"
                );
                this.getControl("bg3").setVisible(true);
                this.getControl("bg3").setOpacity(0);
                this.getControl("bg3").runAction(cc.sequence(
                    cc.fadeIn(.5),
                    cc.delayTime(1),
                    cc.fadeOut(.5),
                    cc.hide()
                ));

                // Neu con` gui end game thi` tat di
                if (this.getChildByTag(LayerEndGame.TAG)) {
                    this.getChildByTag(LayerEndGame.TAG).onButtonRelease(null, 1);
                }
                this.stopAutoStart();

                break;
            }
            case GameState.CHIABAI:
            {
                NewRankData.checkOpenRank(false);

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
                    if (gamedata.gameLogic._players[i]._ingame && (gamedata.gameLogic._players[i]._status > 1)) {
                        this._players[i].removeBao1();
                        this._players[i]._cardFirstTurn.setVisible(false);
                        this._players[i]._numCard.setString("0");
                    }
                }
                this._players[0].clearBai();
                this._players[0]._cardFirstTurn.setVisible(false);
                this._players[0].initCards(gamedata.gameLogic._cardChiabai);

                for (var i = 0; i < 5; i++) {
                    if (gamedata.gameLogic._players[i]._ingame && (gamedata.gameLogic._players[i]._status > 1)) {
                        this._effect2D.chiabai(this._players[i], this.demoCard);
                    }
                }

                this.callbackAddBaoSam = function (sender, typeToiTrang) {
                    this.btnSort.setVisible(true);
                    this._players[0].enableTouch(true);
                    this.addBaoSamLayer(gamedata.gameLogic._timeBaoSam - 6, typeToiTrang);

                    for (var i = 1; i < 5; i++) {
                        if (gamedata.gameLogic._players[i]._ingame && (gamedata.gameLogic._players[i]._status != 1)) {
                            this._players[i].stopEffectTime();
                            this._players[i].addEffectTime(gamedata.gameLogic._timeBaoSam - 1.75);
                        }
                    }
                }

                if (data)
                    this.runAction(cc.sequence(
                        cc.delayTime(5),
                        cc.callFunc(this.callbackAddBaoSam.bind(this), this, data.toiTrang)
                    ));
                break;
            }
            case GameState.BAOSAM:
            {
                var localChair = gamedata.gameLogic.convertChair(data.chair);
                this._players[localChair].stopEffectTime();
                this._players[localChair].bao();
                break;
            }
            case GameState.HUYBAOSAM:
            {
                if (!data) return;

                var localChair = gamedata.gameLogic.convertChair(data.chair);
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
                    localChair = gamedata.gameLogic.convertChair(data.chair);
                    this._players[localChair].baoNormalize();

                    var text = localized("NOTIFY_GAME_1");
                    text = StringUtility.replaceAll(text, "@name", gamedata.gameLogic._players[localChair]._info["uName"]);

                    this._layout.getChildByName("bg3").getChildByName("text").setString(text);
                    this._layout.getChildByName("bg3").setVisible(true);
                    this._layout.getChildByName("bg3").setOpacity(0);
                    this._layout.getChildByName("bg3").runAction(new cc.Sequence(cc.fadeIn(.5), cc.delayTime(3), cc.fadeOut(.5), cc.hide()));
                }

                for (var i = 0; i < 5; i++) {
                    this._players[i].stopEffectTime();
                    if (localChair === -1) this._players[i].clearBao();
                    else if (localChair !== i) this._players[i].baoCancelNormalize();
                }

                break;
            }
            case GameState.DANHBAI:
            {
                if (data) {
                    //cc.log("bai vua danh: "+JSON.stringify(data));
                    if (gamedata.gameLogic._activeLocalChair != 0) {
                        this._players[gamedata.gameLogic._activeLocalChair]._card.setVisible(true);
                        this._players[gamedata.gameLogic._activeLocalChair]._numCard.setString("" + data.numberCard);
                        if (data.numberCard == 0) {
                            this._players[gamedata.gameLogic._activeLocalChair]._card.setVisible(false);
                        }
                        else if (data.numberCard == 1) {
                            this._players[gamedata.gameLogic._activeLocalChair].addBao1();
                        }
                    }

                    if (this.newRound) this._effect2D.clearEffect();
                    var cards = [];
                    for (var i = 0; i < gamedata.gameLogic._cardDanhbai.length; i++) {
                        cards.push(new Card(gamedata.gameLogic._cardDanhbai[i]));
                    }

                    var group = new GroupCard(cards);
                    switch (group._typeGroup) {
                        case GroupCard.kType_TUQUY:
                            this._effect2D.tuquy();
                            break;
                        case GroupCard.kType_DOI:
                        case GroupCard.kType_BALA:
                        case GroupCard.kType_SANHDOC:
                            this._effect2D.multiPlayEffect(group._typeGroup);
                            break;
                    }
                    // if ((!this.newRound) && (group._typeGroup == GroupCard.kType_TUQUY)) {
                    //     gameSound.playChatAnTien();
                    //     this._effect2D.addLight(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
                    //     this._effect2D.tuquy(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
                    // }
                    // else if (!this.newRound && group._typeGroup == GroupCard.kType_DOITUQUY) {
                    //     gameSound.playChatAnTien();
                    //     this._effect2D.addLight(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
                    //     this._effect2D.doituquy(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
                    // }
                    // else if (!this.newRound && ( group._typeGroup == GroupCard.kType_SANHDOC) && (group._cards.length >= 5)) {
                    //     //gameSound.playPopUp();
                    //     this._effect2D.addLight(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
                    // }
                    // else {
                    //     gameSound.playDanhBai();
                    // }

                    var bobaidacbiet = false;
                    if (group._typeGroup == GroupCard.kType_TUQUY || group._typeGroup == GroupCard.kType_DOITUQUY ||
                        (( group._typeGroup == GroupCard.kType_SANHDOC) && (group._cards.length >= 5)) ||
                        (group._typeGroup == GroupCard.kType_BAIRAC && group._cards[0]._quanbai == Card.kQuanbai_2) ||
                        (group._typeGroup == GroupCard.kType_DOI && group._cards[0]._quanbai == Card.kQuanbai_2) ||
                        (group._typeGroup == GroupCard.kType_BALA && group._cards[0]._quanbai == Card.kQuanbai_2)) {
                        bobaidacbiet = true;
                    }


                    if (this.newRound) {
                        if (bobaidacbiet) {
                            gameSound.playBobaitodautien();
                        }
                        else {
                            gameSound.playLuotdau();
                        }
                    }
                    else {
                        if (bobaidacbiet) {
                            if (gamedata.gameLogic._activeLocalChair == 0) {
                                if (this.nguoikhacdanhbobaito)  // minh chat duoc bo bai to cua nguoi khac
                                    gameSound.playMinhchatduocbobaito();
                                else            // minh dung` 2 chat bo bai ghe?
                                    gameSound.playBobaitodautien();
                            }
                            else {
                                cc.log(this.minhdanhbobaito)
                                if (this.minhdanhbobaito) {
                                    gameSound.playMinhdanhbaitovabibat();
                                }
                                else
                                    gameSound.playChatbai();
                            }
                        }
                        else {
                            gameSound.playChatbai();
                        }
                    }

                    if (bobaidacbiet) {
                        if (gamedata.gameLogic._activeLocalChair == 0) {
                            this.minhdanhbobaito = true;
                            this.nguoikhacdanhbobaito = false;
                        }
                        else {
                            this.minhdanhbobaito = false;
                            this.nguoikhacdanhbobaito = true;
                        }
                    }
                    else {
                        this.minhdanhbobaito = false;
                        this.nguoikhacdanhbobaito = false;
                    }

                    if (gamedata.gameLogic._activeLocalChair == 0) {
                        if ((group._typeGroup == GroupCard.kType_SANHDOC) && (group._cards[group._cards.length - 1]._quanbai == Card.kQuanbai_A)) {
                            gameSound.playSanhtoicot();
                        }
                    }

                    if (this.newRound) {
                        this._effect2D.clearBaiDanh();
                    } else {
                        this._effect2D.darkenPlayedCards();
                    }
                    this._effect2D.playCards(this._players[gamedata.gameLogic._activeLocalChair].danhbai(gamedata.gameLogic._cardDanhbai));

                    this._cardRecent = gamedata.gameLogic._cardDanhbai;

                    // aadd effect mat cuoi khi danh nhieu hon 3 bai`
                    this.countPlay++;
                    if (this.countPlay >= 3) {
                        this._players[gamedata.gameLogic._activeLocalChair].addSmile();
                    }

                }
                break;
            }
            case GameState.BOLUOT:
            {
                if (data) {

                    this._effect2D.clearEffect();
                    this._players[gamedata.gameLogic.convertChair(data.chair)].boluot();
                    if (( gamedata.gameLogic.convertChair(data.chair) == 0 ) && this.nguoikhacdanhbobaito) {
                        gameSound.playMinhkhongchatduocbobaito();
                        cc.log("minh gap bo bai to khong bat dc")
                    }
                    else {
                        gameSound.playBoluot();

                    }
                }

                break;
            }
            case GameState.CHANGETURN:
            {
                if ((gamedata.gameLogic._activeLocalChair >= 0 ) && (gamedata.gameLogic._activeLocalChair <= 4)) {
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

                    this.updateBanCards(data.newRound || gamedata.gameLogic._activeLocalChair !== 0);

                    this.btnPass.stopAllActions();
                    if (gamedata.gameLogic._activeLocalChair === 0) {
                        this.updateActionButton(this.btnPlay, false, false);
                        this.updateActionButton(this.btnPass, false, data.newRound);

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
                    }

                    this._players[gamedata.gameLogic._activeLocalChair].addEffectTime(data.time);
                }
                gamedata.gameLogic._gameState = GameState.NONE;
                break;

            }
            case GameState.CHATCHONG:
            {
                var winner = gamedata.gameLogic.convertChair(data.winChair);
                this._players[winner].addIncreaseMoney(data.winGold, 1.5);
                this._players[winner].removeResult(5);

                var loser = gamedata.gameLogic.convertChair(data.lostChair);
                this._players[loser].addDecreaseMoney(data.lostGold, 0);
                this._players[loser].removeResult(5);

                effectMgr.flyCoinEffect(
                    this._effect2D,
                    data.winGold,
                    0,
                    this._players[winner].getPlayerWorldPosition(),
                    this._players[loser].getPlayerWorldPosition()
                );

                //if (local == 0) gameSound.playTrutien();
                break;
            }
            case GameState.JACKPOT:
            {
                var local = gamedata.gameLogic.convertChair(data.uChair);
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
                    this._players[i].clearBao();
                }

                this._effect2D.ccRemove = function (sender) {
                    sender.clearBaiDanh();
                };

                if (this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG)) {
                    this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG).removeFromParent(true);
                }

                this._effect2D.runAction(cc.sequence(
                    cc.delayTime(3),
                    cc.callFunc(this._effect2D.ccRemove.bind(this._effect2D), this._effect2D)
                ));

                var isResultMe = false;
                this.winToiTrang = {
                    pos: -1,
                    type: GameLayer.END_TYPE_WIN_SAM_DINH,
                    cardID: []
                }
                for (var i = 0; i < 5; i++) {
                    if (!this.dataEndGame || !this.dataEndGame.winType) {
                        break;
                    }
                    var local = gamedata.gameLogic.convertChair(i);

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
                        gamedata.gameLogic._players[local]._ingame &&
                        this.dataEndGame.winType[i] !== GameLayer.END_TYPE_DRAW) {
                        isResultMe = true;
                        break;
                    }
                }

                fr.crashLytics.log("End game step 3");
                var hoa = -1;
                var hoa_Thang_chair = -1, hoa_Thua_chair = -1;       // Nguoi` hoa` cungx co effect
                var thuaChansam = -1;                                            // Nguoi thua se co effect bay tien`
                for (var i = 0; i < 5; i++) {
                    if (!this.dataEndGame || !this.dataEndGame.winType) {
                        break;
                    }
                    var local = gamedata.gameLogic.convertChair(i);
                    if (gamedata.gameLogic._players[local]._ingame) {
                        cc.log("wintype: " + this.dataEndGame.winType[i]);
                        fr.crashLytics.log("End game step 4: " + JSON.stringify(this.dataEndGame.winType[i]));
                        switch (this.dataEndGame.winType[i]) {
                            case GameLayer.END_TYPE_WIN:
                            case GameLayer.END_TYPE_WIN_NORMAL:     // Thang binh thuong
                            case GameLayer.END_TYPE_WIN_SAM:     // Thang bao sam
                            case GameLayer.END_TYPE_WIN_SAM_BLOCK:     // Thang chan sam
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

                        if ((hoa == 0) && (hoa_Thang_chair > 0) && (hoa_Thua_chair > 0)) {
                            this._effect2D.chansamthanhcong(cc.p(cc.winSize.width / 2, cc.winSize.height / 2 + 50));
                            this._effect2D.srcPos = this._players[hoa_Thua_chair]._uiAvatar.convertToWorldSpaceAR(cc.p(.5, .5));
                            this._effect2D.dstPos = this._players[hoa_Thang_chair]._uiAvatar.convertToWorldSpaceAR(cc.p(.5, .5));

                            var time = 1.5;
                            var delay = .75;
                            var yy = 0;
                            for (var i = 0; i < 20; i++) {
                                this._effect2D.moneyFly(cc.pAdd(this._effect2D.srcPos, cc.p(0, yy)), this._effect2D.dstPos, time, delay, true);
                                delay += .05;
                                yy += 1;
                            }
                            gameSound.playThang();
                        }
                        if ((thuaChansam == 0) && (hoa_Thang_chair > 0)) {
                            this._effect2D.srcPos = cc.p(cc.winSize.width / 2 + 100, cc.winSize.height / 2 - 60);
                            this._effect2D.dstPos = this._players[hoa_Thang_chair]._uiAvatar.convertToWorldSpaceAR(cc.p(.5, .5));

                            var time = 1.75;
                            var delay = .5;
                            var yy = 0;
                            for (var i = 0; i < 25; i++) {
                                this._effect2D.moneyFly(cc.pAdd(this._effect2D.srcPos, cc.p(0, yy)), this._effect2D.dstPos, time, delay, false);
                                delay += .075;
                                yy += 1;
                            }
                        }
                    }
                }

                fr.crashLytics.log("End game step 5");
                this.btnSort.setVisible(false);
                this.btnPass.setVisible(false);
                this.btnPlay.setVisible(false);

                this.dataEndGame.delayTime = this.dataEndGame.delayTime || 10;
                this.runAction(cc.sequence(
                    cc.delayTime(this.dataEndGame.delayTime - 5),
                    cc.callFunc(this.addEndGameLayer.bind(this), this, this.dataEndGame)
                ));
                break;
            }
            case GameState.UPDATEMATH:
            {
                this._players[0].clearHandOncard();
                this._players[0]._moveCard.setVisible(false);
                for (var i = 1; i < 5; i++) {
                    this._players[i].clearBaiEndGame();
                    this._players[i]._card.setVisible(false);
                }

                for (var i = 0; i < 5; i++) {
                    this._players[i].clearThangThua();
                    this._players[i].removeBao1();
                    // this._players[i]._uiHome.setVisible(false);
                }

                // this._players[gamedata.gameLogic.convertChair(gamedata.gameLogic._roomOwner)]._uiHome.setVisible(true);
                this._effect2D.removeAllChildren(true);
                this._effect2D.effects = [];

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
                this._players[i].updateWithPlayer(gamedata.gameLogic._players[i]);
        }

        if (gamedata.gameLogic._gameState === GameState.ENDGAME) {
            fr.crashLytics.log("End game step 6");
        }
        if (sceneMgr.getGUI(55))      // invite GUI
        {
            sceneMgr.getGUI(55).onUpdateGUI(data);
        }
        if (gamedata.gameLogic._gameState === GameState.ENDGAME) {
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
        if (typeof this.reason == "undefined") {
            timeToast = 0;
        } else {
            var message = "Bạn đã bị mời ra khỏi bàn chơi";
            if (this.reason == 1) {
                message = LocalizedString.to("NOT_ENOUGH_GOLD_IN_BOARD");
                offerManager.kickInGame = true;
            }
            //else if (this.reason == 0)
            //    message = "Bạn đã bị mời ra khỏi bàn chơi vì không sẵn sàng";

            Toast.makeToast(timeToast, message, layer);
        }
        this.runAction(
            cc.sequence(
                cc.delayTime(timeToast),
                cc.callFunc(function () {
                    SceneMgr.getInstance().openScene(layer);
                    gamedata.gameLogic = new GameLogic();
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
        switch (id) {
            case GameLayer.BTN_AVATAR_0:
            case GameLayer.BTN_AVATAR_1:
            case GameLayer.BTN_AVATAR_2:
            case GameLayer.BTN_AVATAR_3:
            case GameLayer.BTN_AVATAR_4:
            {
                cc.log("CLICK PLAYER");
                // //Bao sam
                // this._players[id - GameLayer.BTN_AVATAR_0].initCards([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
                // this.addBaoSamLayer(15, 1);

                //Chia bai
                // var playerPos = id - GameLayer.BTN_AVATAR_0 + 1;
                // this._players[id - GameLayer.BTN_AVATAR_0].initCards([11, 12, 13, 14, 15, 16, 17, 18, 19, 10]);
                // for (var i = 0; i < 5; i++) {
                //     gamedata.gameLogic._players[i]._ingame = true;
                //     gamedata.gameLogic._players[i]._status = 2;
                //     this._players[i].setVisible(true);
                //     this._players[playerPos]._card.setVisible(i !== 0);
                //     if (gamedata.gameLogic._players[i]._ingame && (gamedata.gameLogic._players[i]._status > 1)) {
                //         this._effect2D.chiabai(this._players[i], this.demoCard);
                //     }
                // }

                //First turn determined
                // var playerPos = id - GameLayer.BTN_AVATAR_0;
                // this._players[playerPos].setVisible(true);
                // this._players[playerPos].firstTurn(45).setVisible(true);
                // this._effect2D.firstTurn(this._players[playerPos]);

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
                // this._players[id - GameLayer.BTN_AVATAR_0].initCards([14, 11, 17, 12, 19, 13, 16, 18, 15, 10]);

                // //Game result
                // this._players[id - GameLayer.BTN_AVATAR_0].initCards([14, 11, 17, 12, 19, 13, 16, 18, 15, 10]);
                //
                // var playerPos = id - GameLayer.BTN_AVATAR_0 + 1;
                // gamedata.gameLogic._players[playerPos]._ingame = true;
                // this._players[playerPos].setVisible(true);
                //
                // playerPos = id - GameLayer.BTN_AVATAR_0 + 2;
                // gamedata.gameLogic._players[playerPos]._ingame = true;
                // this._players[playerPos].setVisible(true);
                //
                // playerPos = id - GameLayer.BTN_AVATAR_0 + 3;
                // gamedata.gameLogic._players[playerPos]._ingame = true;
                // this._players[playerPos].setVisible(true);
                //
                // playerPos = id - GameLayer.BTN_AVATAR_0 + 4;
                // gamedata.gameLogic._players[playerPos]._ingame = true;
                // this._players[playerPos].setVisible(true);
                // var packet = {
                //     "winType":[
                //         GameLayer.END_TYPE_WIN_DEN_BAO,
                //         GameLayer.END_TYPE_LOSE_DEN_BAO,
                //         GameLayer.END_TYPE_LOSE,
                //         GameLayer.END_TYPE_LOSE,
                //         GameLayer.END_TYPE_LOSE_SAM_BLOCK
                //     ],
                //     "ketquaTinhTien":[-75000, -75000, 75000, 0, 0],
                //     "cards":[
                //         [19, 20, 23, 29, 30, 33, 34],
                //         [19, 20, 23, 29, 30, 33, 34, 43],
                //         [19, 20, 23, 29],
                //         [19, 20, 23, 29, 30, 33],
                //         [19, 20]
                //     ],
                //     "delayTime": 12,
                //     "roomJackpot": 0
                // };
                // gamedata.gameLogic.endgame(packet);
                // sceneMgr.updateCurrentGUI(packet);

                //test sam result
                //this._effect2D.addSamResult(true);

                // //Danh bai
                // var playerPos = id - GameLayer.BTN_AVATAR_0;
                // if (playerPos === 0)
                //     this._players[id - GameLayer.BTN_AVATAR_0].initCards([11, 12, 13, 14]);
                // // this._players[id - GameLayer.BTN_AVATAR_0].initCards([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
                // this._effect2D.darkenPlayedCards();
                // this._effect2D.clearEffect();
                // // this._effect2D.multiPlayEffect(3);
                // this._effect2D.tuquy();
                // this._effect2D.playCards(this._players[playerPos].danhbai([11, 12, 13, 14]));

                // //Level effect
                // var playerPos = id - GameLayer.BTN_AVATAR_0;
                // gamedata.gameLogic._players[playerPos]._ingame = true;
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
                // gamedata.gameLogic._players[playerPos]._ingame = true;
                // this._players[playerPos].setVisible(true);
                // this._players[playerPos]._card.setVisible(true);
                // this._players[playerPos].addBao1();

                //Effect Time
                // var playerPos = id - GameLayer.BTN_AVATAR_0;
                // gamedata.gameLogic._players[playerPos]._ingame = true;
                // this._players[playerPos].setVisible(true);
                // this._players[playerPos].addEffectTime(7, 15);

                //Toi trang
                // var playerPos = id - GameLayer.BTN_AVATAR_0;
                // this._players[id - GameLayer.BTN_AVATAR_0].initCards([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
                // gamedata.gameLogic._players[playerPos]._ingame = true;
                // this._players[playerPos].setVisible(true);
                // this._players[playerPos]._card.setVisible(playerPos !== 0);
                // this._effect2D.clearEffect();
                // this._effect2D.effectToiTrang(
                //     this._players[playerPos].danhbai([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]),
                //     8,
                //     playerPos === 0
                // );

                // //Chat chong
                // var gold = 12345677;
                // var playerPos1 = id - GameLayer.BTN_AVATAR_0 + 3;
                // gamedata.gameLogic._players[playerPos1]._ingame = true;
                // this._players[playerPos1].setVisible(true);
                // this._players[playerPos1]._card.setVisible(playerPos1 !== 0);
                // this._players[playerPos1].addIncreaseMoney(gold, 1.5);
                //
                // var playerPos2 = id - GameLayer.BTN_AVATAR_0;
                // gamedata.gameLogic._players[playerPos2]._ingame = true;
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

                // hasJackpot = true;
                // var jackpot = {
                //     jackpot: 15000000,
                //     chair: gamedata.gameLogic._myChair
                // }
                // jackpot.jackpotPacket = true;
                // if (gamedata.gameLogic && jackpot.chair == gamedata.gameLogic._myChair) {
                //     sceneMgr.openGUI(JackpotWin5GUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
                //     var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
                //     if (jackpotGui) jackpotGui.onUpdateGUI("win5", jackpot);
                // } else if (gamedata.gameLogic && jackpot.chair != gamedata.gameLogic._myChair) {
                //     sceneMgr.openGUI(JackpotInBoardGUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
                //     var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
                //     if (jackpotGui) jackpotGui.onUpdateGUI(jackpot);
                // }
                //
                // break;

                if (Config.ENABLE_NEW_RANK && !Config.ENABLE_TESTING_NEW_RANK){
                    var uID = gamedata.gameLogic._players[id - GameLayer.BTN_AVATAR_0]._info["uID"];

                    if (uID === gamedata.getUserId()){
                        var guiInfo = sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
                        guiInfo.setInfo(gamedata.userData);
                    } else {
                        var otherInfo = new CmdSendGetOtherRankInfo();
                        otherInfo.putData(uID);
                        GameClient.getInstance().sendPacket(otherInfo);
                        otherInfo.clean();
                    }
                    return;
                }

                var idx = id - GameLayer.BTN_AVATAR_0;
                var data = {};
                data.avatar = gamedata.gameLogic._players[idx]._info["avatar"];
                data.displayName = gamedata.gameLogic._players[idx]._info["uName"];
                data.winCount = gamedata.gameLogic._players[idx]._info["winCount"];
                data.lostCount = gamedata.gameLogic._players[idx]._info["lostCount"];
                data.bean = gamedata.gameLogic._players[idx]._info["bean"];
                data.levelScore = gamedata.gameLogic._players[idx]._info["exp"];
                data.uID = gamedata.gameLogic._players[idx]._info["uID"];
                data.zName = gamedata.gameLogic._players[idx]._info["uName"];
                data.level = gamedata.gameLogic._players[idx]._info["level"];
                data.levelExp = gamedata.gameLogic._players[idx]._info["levelExp"];

                //sceneMgr.getRunningScene().addChild(new UserInfoGUI(data));
                //sceneMgr.openGUI(UserInfoGUI.className,2,GameLayer.USER_INFO_GUI);

                if(Config.ENABLE_INTERACT_PLAYER) {
                    if(data.uID == gamedata.userData.uID)
                        interactPlayer.openMyGUI();
                    else
                        interactPlayer.openEnemyGUI(data);
                }
                else {
                    sceneMgr.openGUI(CheckLogic.getUserInfoClassName(), LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO).setInfo(data);
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
                gamedata.gameLogic.sendQuitRoom = true;
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
                // NewRankData.getInstance().fakeMyDataInWeek();
                // break;
                this.addAvatarFixShare();

                if (!gamedata.checkOldNativeVersion()) {
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

                    }


                    socialMgr.set(this, this.onShareImg);
                    socialMgr.shareImage(socialMgr._currentSocial);
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
                this._effect2D.sapxepForPlayer(this._players[0]);
                break;
            }
            case GameLayer.BTN_DANH:
            {
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
                this.btnPass.stopAllActions();
                this.btnPass.setOpacity(255);
                this.btnPass.setVisible(false);

                this.stopAllActions();
                break;
            }
            case GameLayer.BTN_HUYBAO:
            {
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
                var pk = new CmdSendBaoSam();
                pk.putData(true);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();
                this._layout.getChildByTag(GameLayer.LAYER_SAM_TAG).removeFromParent(true);
                break;
            }
            case GameLayer.BTN_CHAT:
            {
                sceneMgr.openGUI(ChatPanelGUI.className, ChatMgr.GUI_CHAT_IN_GAME, ChatMgr.GUI_CHAT_IN_GAME);
                break;

            }
            case GameLayer.BTN_INVITE:
            {
                //var invite = new LayerInvite();
                //this.addChild(invite,2);
                sceneMgr.openGUI(LayerInvite.className, 2, 55);
                //var invite = sceneMgr.getGUI(1135);
                //invite.setTag(55);
                var pk = new CmdSendGetPlayers();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();
                break;
            }
            case GameLayer.BTN_QUICK_CHAT:
            {

                sceneMgr.openGUI(ChatPanelGUI.className, ChatMgr.GUI_CHAT_IN_GAME, ChatMgr.GUI_CHAT_IN_GAME);
                break;
            }
            case GameLayer.BTN_QUICK_EMO:
            {
                var gui = sceneMgr.openGUI(ChatEmoGUI.className, ChatEmoGUI.GUI_TAG, ChatEmoGUI.GUI_TAG);
                gui.show();
                break;
            }
            case GameLayer.BTN_JACKPOT:
            {
                sceneMgr.openGUI(JackpotGUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT, false);
                break;
            }
            case GameLayer.BTN_ADD_BOT:
            {
                var pk = new CmdSendAddBot();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();
            }
        }
    },
    updateOwnerRoom: function (_roomOwnerID) {
        if (gamedata.gameLogic.roomLock && (gamedata.userData.uID == gamedata.gameLogic._roomOwnerID)) {
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
            ccui.Helper.seekWidgetByName(this._layout, "btnInvite").setVisible(false);

            ccui.Helper.seekWidgetByName(this._layout, "panel_button").pos = GameLayer.DESIGN_WIDTH - 108;
            ccui.Helper.seekWidgetByName(this._layout, "panel_button").deltaX = 100;

            ccui.Helper.seekWidgetByName(this._layout, "panel_button").moiban = true;
        }
    },

    addAutoStart: function (time) {
        this.stopAutoStart();

        this.autoStartPanel.lbTime.setString(Math.floor(time));
        this.autoStartPanel.eff.setAnimation(0, "animation", -1);
        this.autoStartPanel.setVisible(true);
        effectMgr.countdownLabelEffect(
            this.autoStartPanel.lbTime,
            Math.floor(time),
            time - Math.floor(time),
            Math.floor(time)
        );

        for (var i = 0; i < 5; i++) {
            this._players[i].removeResult();
            if (i === 0) this._players[i].clearBai();
        }
    },

    stopAutoStart: function () {
        this.autoStartPanel.stopAllActions();
        this.autoStartPanel.setVisible(false);
    },

    getImgByNum: function (num) {
        return "res/common/linhtinh/start_" + num + ".png";
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

    updateActionButton: function (button, isEffect, isLock) {
        button.setVisible(true);

        if (isLock !== undefined) {
            button.imgDisabled.setVisible(isLock);
            button.setPressedActionEnabled(!isLock);
        }

        button.pointer.stopAllActions();
        button.pointer.setVisible(isEffect);
        button.pointer.setScale(0);
        button.pointer.runAction(cc.scaleTo(0.25, 1.5).easing(cc.easeBackOut()));
        button.pointer.getAnimation().setTimeScale(2);
        button.pointer.getAnimation().gotoAndPlay("run", -1);
    },

    addBaoSamLayer: function (time, typeToiTrang) {
        gameSound.playMoisam();
        var layer = new BaseLayer("BaoSam");
        layer.initWithBinaryFileAndOtherSize("BaoSamLayer.json", cc.size(GameLayer.DESIGN_WIDTH, GameLayer.DESIGN_HEIGHT));
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

            var stencil = new cc.Sprite("GameGUI/gui_game/process.png");
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

        var effect = new cc.Sprite("GameGUI/gui_game/processEffect.png");
        effect.attr({
            anchorX: 0,
            anchorY: 0.5,
            x: timer.x,
            y: timer.y,
        });
        clipper.addChild(effect);
        var effect2 = new cc.Sprite("GameGUI/gui_game/processEffect.png");
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

        if ((typeToiTrang == 1) || (typeToiTrang == 2) || (typeToiTrang == 3) || (typeToiTrang == 4)) {
            var text = localized("NOTIFY_GAME_2");
            switch (typeToiTrang) {
                case 1: // sam dinh
                    text = StringUtility.replaceAll(text, "@type", "Bộ bài Sâm đỉnh");
                    break;
                case 2: // 5 doi
                    text = StringUtility.replaceAll(text, "@type", "Bộ bài 5 Đôi");
                    break;
                case 3: // tu 2
                    text = StringUtility.replaceAll(text, "@type", "Bộ bài Tứ quý 2");
                    break;
                case 4: //dong mau
                    text = StringUtility.replaceAll(text, "@type", "Bộ bài Đồng màu");
                    break;
            }
            title.loadTexture("GameGUI/Tachfile/titleSpecial.png");
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

    addEndGameLayer: function (sender, data) {
        fr.crashLytics.log("addEndGameLayer: " + JSON.stringify(data));
        // var layer = new LayerEndGame(data);
        // this.addChild(layer);
        // layer.setTag(112);
        // layer.setLocalZOrder(25);
        // //sceneMgr.openGUI(LayerEndGame.className, 2, LayerEndGame.TAG).setInfo(data);
        // //var layer = sceneMgr.getGUI(LayerEndGame.TAG);
        // //layer.;

        // for (var i = 0; i < 5; i++) {
        //     this._players[i].removeResult();
        //     if (i === 0) this._players[i].clearBai();
        // }
    },

    updateChoNguoiKhac: function () {
        if (gamedata.gameLogic.numberPlayer() < 3) {
            if (this.getChildByTag(25)) {
                this.getChildByTag(25).stopAllActions();
                this.getChildByTag(25).removeFromParent(true);
            }

            var spriteFrame = [];
            for (var i = 0; i < 4; i++) {
                spriteFrame.push(new cc.SpriteFrame("common/animation/waitother/waitother_" + i + ".png"), cc.rect(0, 0, 475, 34));
            }

            var animation = new cc.Animation(spriteFrame, .085);
            var animate = new cc.Animate(animation);

            var _wait = cc.Sprite.create("common/animation/waitother/waitother_0.png");
            this.addChild(_wait, 25, 25);

            _wait.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 + 80);
            _wait.runAction(new cc.RepeatForever(animate));
        }
        else {

        }
    },

    updateStartButton: function () {
        if ((gamedata.gameLogic.convertChair(gamedata.gameLogic._roomOwner) == 0)
            && (gamedata.gameLogic.numberPlayer() >= 2)) {
            this.btnStart.setVisible(true);
            ccui.Helper.seekWidgetByName(this._layout, "btnCheat").setVisible(Config.ENABLE_CHEAT);
        }
        else {
            this.btnStart.setVisible(false);
            ccui.Helper.seekWidgetByName(this._layout, "btnCheat").setVisible(false);
        }
    },

    onReceiveChatEmotion: function (p) {
        var pView = this._players[0];
        var idx = 0;
        for (var i = 0; i < gamedata.gameLogic._players.length; i++) {
            if ((gamedata.gameLogic._players[i]._chairInServer != null ) && (p.playerId == gamedata.gameLogic._players[i]._chairInServer)) {
                pView = this._players[i];
                idx = i;
                break;
            }
        }
        if (pView != null && pView instanceof  PlayerView) {
            pView.chatEmotion(p.index);
        }

        var obj = {
            id: p.playerId,
            name: gamedata.gameLogic._players[idx]._info["uName"],
            msg: LocalizedString.to("EMO_" + (p.index - 1))
        };
        this._chatHistories.push(obj);

        var chat = this.getChildByTag(GameLayer.CHAT_GUI);
        if (chat != null && chat instanceof  ChatInGameGUI) {
            //chat.receiveChat(obj);
            gameSound.playChat();
        }
        chatMgr.onChatRoom(gamedata.gameLogic._players[idx]._info, chatMgr.convertEmoToString(p.index));

    },

    onReceiveChatMessage: function (p) {
        fr.crashLytics.log("onReceiveChatMessage 1");
        p.message = ChatFilter.filterString(p.message);
        var pView = this._players[0];
        var idx = 0;
        for (var i = 0; i < gamedata.gameLogic._players.length; i++) {
            cc.log("onReceiveChatMessage: " + JSON.stringify(gamedata.gameLogic._players));
            if ((gamedata.gameLogic._players[i]._chairInServer != null ) && (p.playerId == gamedata.gameLogic._players[i]._chairInServer)) {
                pView = this._players[i];
                idx = i;
                break;
            }
        }
        fr.crashLytics.log("onReceiveChatMessage 2");
        if (pView != null && pView instanceof  PlayerView) {
            pView.chatMessage(p.message);
        }
        fr.crashLytics.log("onReceiveChatMessage 3");
        chatMgr.onChatRoom(gamedata.gameLogic._players[idx]._info, p.message);
        fr.crashLytics.log("onReceiveChatMessage 4");

    },

    onReceiveChatPrivateMessage: function (p) {
        var pView = this._players[0];
        var idx = 0;
        for (var i = 0; i < gamedata.gameLogic._players.length; i++) {
            if ((gamedata.gameLogic._players[i]._chairInServer != null ) && (p.user.uId == gamedata.gameLogic._players[i]._info.uID)) {
                pView = this._players[i];
                idx = i;
                break;
            }
        }
        var msg = "[" + gamedata.userData.name + "] " + p.chat;
        if (pView != null && pView instanceof  PlayerView && idx) {
            pView.chatMessage(msg);
        }
        if (idx) {
            chatMgr.onChatRoom(gamedata.gameLogic._players[idx]._info, msg);
        }

    },

    onUseEmoticon: function(nChair, id, emoId) {
        var pView = this._players[0];
        for (var i = 0; i < gamedata.gameLogic._players.length; i++) {
            if ((gamedata.gameLogic._players[i]._chairInServer != null ) && (nChair == gamedata.gameLogic._players[i]._chairInServer)) {
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
        for (var i = 0; i < gamedata.gameLogic._players.length; i++) {
            try {
                if (gamedata.gameLogic._players[i]._info.uID == id) {
                    return JSON.parse(JSON.stringify(this._players[i].posEmoticon));
                }
            }
            catch (e) {

            }
        }
        return cc.p(0, 0);
    },

    getPosFromServerChair: function(chairInServer) {
        for (var i = 0; i < gamedata.gameLogic._players.length; i++) {
            try {
                if (gamedata.gameLogic._players[i]._chairInServer == chairInServer) {
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

        cc.log("+WCItems : " + JSON.stringify(gamedata.gameLogic.wcItems));

        if (gamedata.gameLogic.wcItems) {
            for (var i = 0; i < gamedata.gameLogic.wcItems.length; i++) {
                this.onDecorateUser(gamedata.gameLogic.wcItems[i], gamedata.gameLogic.convertChair(i));
            }

            gamedata.gameLogic.wcItems = [];
        }

        cc.log("+WCObject : " + JSON.stringify(gamedata.gameLogic.wcObject));
        if (gamedata.gameLogic.wcObject) {
            this.onDecorateUser(gamedata.gameLogic.wcObject.item, gamedata.gameLogic.convertChair(gamedata.gameLogic.wcObject.chair));

            gamedata.gameLogic.wcObject = null;
        }
    },

    onDecorateUser: function (item, chair) {
        cc.log("######################Deco : " + gamedata.gameLogic._gameState + " => " + item + " | " + chair);
        decorateManager.addDecoInGame(item, this._players[chair].pDeco);

    },

    showLevelUp: function(cmd) {
        var localChair = gamedata.gameLogic.convertChair(cmd.nChair);
        this._players[localChair]._levelResult = cmd;
    },

    updateAvatarFrame: function(nChair, path) {
        var localChair = gamedata.gameLogic.convertChair(nChair);
        this._players[localChair].setAvatarFrame(path);
    },

    getAvatarPosition: function(index){
        return this._players[index].getAvatarPosition();
    }
});

var GameLayer = BoardScene;

GameLayer.className = "BoardScene";

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

GameLayer.JACKPOT = 1104;

GameLayer.USER_INFO_GUI = 1112;

GameLayer.CHAT_GUI = 100000;
GameLayer.sharedPhoto = false;
GameLayer.DESIGN_WIDTH = 1200;
GameLayer.DESIGN_HEIGHT = 720;

GameLayer.LAYER_SAM_TAG = 111;

GameLayer.END_TYPE_WIN = 2;
GameLayer.END_TYPE_WIN_NORMAL = 5;
GameLayer.END_TYPE_WIN_SAM = 3;
GameLayer.END_TYPE_WIN_SAM_BLOCK = 4;
GameLayer.END_TYPE_WIN_SAM_DINH = 6;
GameLayer.END_TYPE_WIN_FOUR_PIG = 7;
GameLayer.END_TYPE_WIN_FIVE_PAIR = 8;
GameLayer.END_TYPE_WIN_FLUSH = 9;
GameLayer.END_TYPE_WIN_DEN_BAO = 10;
GameLayer.END_TYPE_LOSE = 13;
GameLayer.END_TYPE_LOSE_DEN_BAO = 11;
GameLayer.END_TYPE_LOSE_TREO = 14;
GameLayer.END_TYPE_LOSE_TOI_TRANG = 15;
GameLayer.END_TYPE_LOSE_SAM_BLOCK = 16;
GameLayer.END_TYPE_DRAW = 12;

var LayerEndGame = BaseLayer.extend({

    ctor: function (data) {
        this._super("EndGame");
        this.initWithBinaryFile("KetQua.json");
        this.data = data;
    },
    customizeGUI: function () {
        this.bg = this.getControl("bg");

        this.customizeButton("btnXacNhan", 1);

        this.panels = [];
        var bg = ccui.Helper.seekWidgetByName(this._layout, "bg");

        bg.setScale(0.75);
        bg.setOpacity(0);
        bg.runAction(cc.spawn(new cc.EaseBackOut(cc.scaleTo(.3, 1)), cc.fadeIn(.3)));

        for (var i = 0; i < 5; i++) {
            this.panels.push(ccui.Helper.seekWidgetByName(bg, "Panel_" + (i + 1)));
            this.panels[i].setVisible(false);
        }
        gameSound.playResult();
        this.show();
        this.setFog(true);
    },
    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true);
    },
    setInfo: function (data) {
        this.data = data;
        cc.log("thong tin ket thuc: " + JSON.stringify(data));
        this.show();
    },
    show: function () {
        if (!this.data || !this.data.winType) {
            cc.error("loi cmnr: " + new Error().stack);
            return;
        }

        var count = 1;
        for (var i = 0; i < 5; i++) {
            switch (this.data.winType[i]) {
                case 2:     // Thang binh thuong
                case 5:
                case 3:     // Thang bao sam
                case 4:     // Thang chan sam
                case 6:     // Thang sam dinh
                case 7:     // Thang 4 heo
                case 8:     // Thang 5 doi
                case 9:     // Thang dong` mau`
                case 10:    // Thang den bao 1
                {
                    this.panels[0].setVisible(true);
                    var local = gamedata.gameLogic.convertChair(i);
                    this.addKQchoPanel(this.panels[0], this.data.winType[i], this.data.cards[i], gamedata.gameLogic._players[local]._info, this.data.ketquaTinhTien[i]);
                    this.panels[0].getChildByName("vien").runAction(new cc.Sequence(cc.fadeTo(0.5, 50), cc.fadeTo(.5, 255)).repeatForever());
                    break;
                }
                case 1:
                {
                    break;
                }
                default :
                {
                    this.panels[count].setVisible(true);
                    var local = gamedata.gameLogic.convertChair(i);
                    this.addKQchoPanel(this.panels[count], this.data.winType[i], this.data.cards[i], gamedata.gameLogic._players[local]._info, this.data.ketquaTinhTien[i]);
                    count++;
                    break;
                }
            }
        }
    },

    textureForWin: function (winType) {
        var path = "";
        switch (winType) {
            case 1:
            {
                break;
            }
            case 5:
            case 2:     // Thang binh thuong
            {
                path = "symbol_0005_TH-NG.png";
                break;
            }
            case 3:     // Thang bao sam
            {
                path = "symbol_0005_TH-NG.png";
                break;
            }
            case 4:     // Thang chan sam
            {
                path = "symbol_0005_TH-NG.png";
                break;
            }
            case 6:     // Thang sam dinh
            {
                path = "symbol_0006_S-m---nh.png";
                break;
            }
            case 7:     // Thang 4 heo
            {
                path = "symbol_0004_T--qu--heo.png";
                break;
            }
            case 8:     // Thang 5 doi
            {
                path = "symbol_0007_5---i.png";
                break;
            }
            case 9:     // Thang dong` mau`
            {
                path = "symbol_0008_10-l-.png";
                break;
            }
            case 10:     // Thang den bao 1
            {
                path = "symbol_0005_TH-NG.png";
                break;
            }
            case 11:     // thua den` bao 1
            {
                path = "den.png";
                break;
            }
            case 12:     // Hoa`
            {
                break;
            }
            case 13:     // Thua thong thuong`
            {
                break;
            }
            case 14:        // treo
            {
                path = "symbol_0001_Treo.png";
                break;
            }
            case 15:        // thua toi trang
            {

                break;
            }
            case 16:        // thua chan sam
            {

                break;
            }
        }
        return path;
    },

    addKQchoPanel: function (panel, winType, cards, info, gold) {
        panel.getChildByName("name").setString(info["uName"]);
        var str = "";
        if (gold < 0) {
            str = "-" + StringUtility.standartNumber(Math.abs(gold));
        }
        else {
            str = "+" + StringUtility.standartNumber(gold);
        }
        panel.getChildByName("gold").setString(str);
        if (gold < 0) {
            panel.getChildByName("gold").setColor(cc.color(201, 201, 201));
        } else {
            panel.getChildByName("gold").setColor(cc.color(255, 255, 0));
        }

        panel.getChildByName("kq").setVisible(false);


        //cc.log(winType+"sss");
        var texture = this.textureForWin(winType);
        switch (winType) {
            case 1:
            {
                break;
            }
            case 2:     // Thang binh thuong
            case 5:
            case 3:     // Thang bao sam
            case 4:     // Thang chan sam
            case 6:     // Thang sam dinh
            case 7:     // Thang 4 heo
            case 8:     // Thang 5 doi
            case 9:     // Thang dong` mau`
            case 10:
            case 11:    // Thua den bao 1
            {
                var node = panel.getChildByName("node");
                var deltaX = 0;
                node.removeAllChildren(true);

                for (var j = 0; j < cards.length; j++) {
                    var sam = new SamCard(cards[j]);
                    node.addChild(sam);
                    sam.setPositionX(deltaX);
                    sam.setScale(.55);
                    deltaX += 25;
                }

                panel.getChildByName("kq").addChild(new cc.Sprite("GameGUI/ketqua/" + texture));
                panel.getChildByName("kq").setVisible(true);
                if (winType == 2) {
                    panel.getChildByName("kq").setPosition(panel.getChildByName("node").getPosition());
                }


                break;
            }
            case 12:     // Hoa`
            case 13:     // Thua thong thuong`
            case 14:      // Thua treo
            case 15:        // thua toi trang
            case 16:        // thua chan sam
            {
                var node = panel.getChildByName("node");
                node.removeAllChildren(true);
                var deltaX = 0;
                for (var j = 0; j < cards.length; j++) {
                    var sam = new SamCard(cards[j]);
                    node.addChild(sam);
                    sam.setPositionX(deltaX);
                    sam.setScale(.55);
                    deltaX += 25;
                }
                if (winType == 14) {
                    panel.getChildByName("kq").addChild(new cc.Sprite("GameGUI/ketqua/" + "symbol_0001_Treo.png"));
                    panel.getChildByName("kq").setVisible(true);
                }
                else if (winType == 13) {
                    if (GameHelper.kiemtraThoiTuQuy(cards)) {
                        panel.getChildByName("kq").addChild(new cc.Sprite("GameGUI/ketqua/" + "symbol_0002_Th-i-t--qu-.png"));
                        panel.getChildByName("kq").setVisible(true);
                    }
                    else if (GameHelper.kiemtraThoiHeo(cards)) {
                        panel.getChildByName("kq").addChild(new cc.Sprite("GameGUI/ketqua/" + "symbol_0003_Th-i-heo.png"));
                        panel.getChildByName("kq").setVisible(true);
                    }
                }
                var pos = panel.getChildByName("node").getPosition();
                panel.getChildByName("kq").setPosition(pos.x + 46, pos.y - 16);

                break;
            }
        }
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case 1:
            {
                this._layerColor.runAction(cc.fadeTo(.2, 0));
                var bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
                bg.setScale(1);
                bg.runAction(cc.spawn(new cc.EaseBackIn(cc.scaleTo(.2, 1.2)), cc.fadeOut(.2)));

                this.runAction(new cc.Sequence(cc.delayTime(.2), cc.removeSelf()));
                break;
            }
        }
    }
})
LayerEndGame.className = "LayerEndGame";
LayerEndGame.TAG = 112;

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
            if (gamedata.gameLogic._players[i]._ingame) {
                var tmp = {};
                tmp["name"] = gamedata.gameLogic._players[i]._info["uName"];
                tmp["chair"] = gamedata.gameLogic._players[i]._chairInServer;
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
        this.customizeButton("btnOK", 1);
        this.customizeButton("btnQuit", 2);

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

var LayerInvite = BaseLayer.extend({
    ctor: function () {
        this._super("invite");
        this.initWithBinaryFile("LayerInvite.json");
        this.list = [];
    },
    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true);
        if (!cc.sys.isNative) {
            this._uiTable.setTouchEnabled(true);
        }
    },
    customizeGUI: function () {
        var bg = this.getControl("bg");
        this.bg = bg;
        this.customizeButton("btnQuit", 0);
        var nen = bg.getChildByName("nen");

        var sizeList = cc.size(nen.getContentSize().width, nen.getContentSize().height - 45);
        this._uiTable = new cc.TableView(this, sizeList);
        this._uiTable.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this._uiTable.setVerticalFillOrder(0);
        this._uiTable.setPosition(5, 10);


        nen.getChildByName("node").addChild(this._uiTable);
        this._uiTable.setDelegate(this);
        this._uiTable.reloadData();
        this.setFog(true);

        this.setShowHideAnimate(bg, true);
    },
    onUpdateGUI: function (data) {

        if (!data || !data.list)
            return;
        this.list = data.list;
        this._uiTable.reloadData();

        if (this.list.length == 0) {
            var bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
            bg.getChildByName("no").setVisible(true);
        } else {
            this.bg.getChildByName("no").setVisible(false);
        }
    },
    tableCellSizeForIndex: function (table, idx) {
        return cc.size(483, 57);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new LayerInviteCell();
        }
        cell._layout.setColor({r: 255, g: 255, b: 255});
        cell.avatar.setDefaultImage();
        cell.name.setString(this.list[idx]["name"]);
        cell.gold.setString(StringUtility.standartNumber(this.list[idx]["bean"]) + "$");
        cell.invite.setVisible(!this.list[idx]["invite"]);
        cell.avatar.asyncExecuteWithUrl(this.list[idx]["uID"] + "", this.list[idx]["avatar"]);

        return cell;
    },
    onButtonRelease: function (btn, id) {
        switch (id) {
            case 0:
            {
                this._layerColor.runAction(cc.fadeTo(.2, 0));
                this.onClose();
                break;
            }
        }
    },

    tableCellTouched: function (table, cell) {
        var idx = cell.getIdx();
        if (!this.list[idx]["invite"]) {
            cell._layout.setColor({r: 175, g: 175, b: 175});
            this.list[idx]["invite"] = true;
            cell.invite.setVisible(false);

            var pk = new CmdSendInvite();
            pk.putData(this.list[idx]["uID"]);

            GameClient.getInstance().sendPacket(pk);
            pk.clean();
        }


    },

    numberOfCellsInTableView: function (table) {
        return this.list.length;
    }

})

LayerInvite.className = "LayerInvite";

var LayerInviteCell = cc.TableViewCell.extend({
    ctor: function () {
        this._super();
        var jsonLayout = ccs.load("LayerInviteCell.json");
        this._layout = jsonLayout.node;
        this._layout.setContentSize(cc.size(cc.winSize.width, this._layout.getContentSize().height));
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.name = ccui.Helper.seekWidgetByName(this._layout, "name");
        this.gold = ccui.Helper.seekWidgetByName(this._layout, "gold");
        this.invite = this._layout.getChildByName("invite");
        //cc.log(this.invite);
        var avatar = ccui.Helper.seekWidgetByName(this._layout, "avatar");
        //cc.log(avatar);
        this.avatar = engine.UIAvatar.create("Common/defaultAvatar.png");
        var size = avatar.getContentSize();
        this.avatar.setPosition(cc.p(size.width / 2, size.height / 2));
        avatar.addChild(this.avatar);


    },
    onEnter: function () {
        cc.TableViewCell.prototype.onEnter.call(this);
    }
})