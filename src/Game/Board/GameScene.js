/**
 * Created by HOANGNGUYEN on 7/27/2015.
 */

var isIpad = function ()
{
    if (cc.sys.isNative)
        return (cc.winSize.width / cc.winSize.height <= 4 / 3) && (cc.winSize.width > 480);
    else
        return false;
}

var GameLayer = BaseLayer.extend({

    ctor: function (data) {

        this._super("GameLayer");
        this._players = [];
        this._effect2D = null;
        this._lastGUI = "";

        //this.initWithBinaryFile("TalaGameGUI.json");
        this.initWithBinaryFileAndOtherSize("TalaGameGUI.json", cc.size(800, 480));

        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        });

        cc.eventManager.addListener(this._listener, this);
        this.initData = data;

    },
    onEnter: function () {
        cc.log("onEnter BoardScene");
        BaseLayer.prototype.onEnter.call(this);
        this.setBackEnable(true);

        cc.sys.localStorage.setItem(Config.KEY_LAST_ERROR, "last_time_join_room_success");
        Event.instance().addGuiInGame();
        this._effect2D.clearEffect();

        RankData.addMiniRankGUI(false);
        chatMgr.onJoinRoom();
    },
    onExit: function () {
        BaseLayer.prototype.onExit.call(this);
        if (isIpad())
            cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.FIXED_HEIGHT);
        //GameClient.getInstance().setTargetNotifyNetworkSlow(null);
    },
    networkSlow: function (slow) {
        if (slow) {
            if (!this._layout.getChildByName("bgwifi").isVisible()) {
                this._layout.getChildByName("bgwifi").setVisible(true);
                this._layout.getChildByName("bgwifi").getChildByName("wifi").runAction(cc.sequence(cc.delayTime(.5), cc.hide(), cc.delayTime(.5), cc.show()).repeatForever());
            }
        } else {
            if (this._layout.getChildByName("bgwifi").isVisible()) {
                this._layout.getChildByName("bgwifi").getChildByName("wifi").stopAllActions();
                this._layout.getChildByName("bgwifi").setVisible(false);

            }
        }

    },
    playSoundButton: function (id) {
        if (id == GameLayer.BTN_XEPBAI) {
            gameSound.playXepbai();
        } else {
            gameSound.playClick();
        }
    },
    initGUI: function () {


        this.logMyCard = [];
        this.logReceiveCard = [];
        this.logThrowCard = [];
        this.logHaPhom = [];

        this.customizeButton("btnQuit", GameLayer.BTN_QUIT);
        this.customizeButton("btnXepbai", GameLayer.BTN_XEPBAI);
        this.customizeButton("btnBoluot", GameLayer.BTN_BOLUOT);
        this.customizeButton("btnDanh", GameLayer.BTN_DANH);
        this.customizeButton("btnStart", GameLayer.BTN_START);
        this.customizeButton("btnGroup", GameLayer.BTN_GROUP);
        this.customizeButton("btnJackpot", GameLayer.BTN_JACKPOT).setPressedActionEnabled(false);
        this.customizeButton("btnEmo", GameLayer.BTN_EMO);
        this.customizeButton("btnPanelChat", GameLayer.BTN_CHAT);


        this._layout.getChildByName("btnGroup").setPressedActionEnabled(false);
        this._layout.getChildByName("btnGroup").setLocalZOrder(100);
        this._layout.getChildByName("btnDanh").cothedanh = false;
        this.btnQuit = this._layout.getChildByName("btnQuit");
        this.btnQuit.outroom = false;
        this.updateDockCard(-1);


        if (cc.sys.os == cc.sys.OS_WP8) {
            if (socialMgr._currentSocial != SocialManager.ZALO) {
                this._layout.getChildByName("btnCamera").setVisible(false);
            }
        }
        for (var i = 0; i < 4; i++) {
            var panel = ccui.Helper.seekWidgetByName(this._layout, "panel" + i);
            var btn = ccui.Helper.seekWidgetByName(panel, "btn");
            btn.setPressedActionEnabled(true);
            btn.setTag(i + 12);
            btn.addTouchEventListener(this.onTouchEventHandler, this);

            var player = new PlayerView(this);
            player._index = i;
            player.setPanel(panel);
            if (i == 0)      // myplayer
            {
                var card_panel = ccui.Helper.seekWidgetByName(this._layout, "card_panel");
                player._cardPanel = card_panel;
                player.initForMy();

                player._type = Player.MY;
            } else {
                player._card = ccui.Helper.seekWidgetByName(panel, "card");
                player._numCard = ccui.Helper.seekWidgetByName(player._card, "num");
                player._type = Player.ENEMY;

            }
            this._layout.addChild(player);
            this._players.push(player);
        }
        this._effect2D = new LayerEffect2D(this._layout.getContentSize());
        // this._effect2D.setPosition(-this._layout.getContentSize().width * 0.5, - this._layout.getContentSize().height * 0.5);
        this._layout.addChild(this._effect2D);
        this._effect2D.setLocalZOrder(1000);
        this._effect2D.myPlayer = this._players[0];

        this.boardVoucherGUI = new BoardVoucherGUI();
        this._layout.addChild(this.boardVoucherGUI, BoardVoucherGUI.GUI_TAG);

        this.setActionButton("", false);

        this.touchID = -1;

        this.onUpdateGUI(inGameMgr.gameLogic.saveData);
        cc.log("CALL UPDATE GUI ");

        if (event.isInEvent(Event.MID_AUTUMN)) {
            this.initEventMidAutumn();
        }
        if (event.isInEvent(Event.BLUE_OCEAN)) {
            this.initEventBlueOcean();
        }
        if (Config.ENABLE_CHEAT) {
            this.btnCheatBot = new ccui.Button();
            this.addChild(this.btnCheatBot);
            this.btnCheatBot.setTitleText("BOT");
            this.btnCheatBot.setTitleFontSize(25);
            this.btnCheatBot.setPosition(30, 100);
            this.btnCheatBot.addClickEventListener(this.onSendBot.bind(this));
            this.btnCheatBot.setVisible(false);
        }
    },

    onSendBot: function () {
        cc.log("Send Bot***");
        var pkQuit = new CmdSendCheatBot();
        GameClient.getInstance().sendPacket(pkQuit);
        pkQuit.clean();
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
        midAutumn.createButtonInGame(cc.p(cc.winSize.width, cc.winSize.height * 0.3), this);
    },

    getPosWeeklyChallenge: function () {
        var btnJackpot = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot");
        var pos = btnJackpot.getPosition();
        pos.x = pos.x - 120 - 50;
        return pos;
    },

    onBack: function () {
        this.onButtonRelease(null, GameLayer.BTN_QUIT);
    },
    getLastEnemyNeasrt: function () {
        for (var i = 1; i < 4; i++) {
            if (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status != 4)) {
                return i;
            }
        }
        return 1;
    },

    onTouchBegan: function (touch, event) {
        if (touch.getID() != 0)
            return false;
        this.touchID = touch.getID();
        return true;
    },
    onTouchMoved: function (touch, event) {

    },
    onTouchEnded: function (touch, event)                 // Game handler
    {
        if (touch.getID() != this.touchID)
            return;

        var target = event.getCurrentTarget();
        // An card tu doi thu
        if (target._players[0].canGetCard && target._players[0].canGetCardFromEnemy) {
            if (target._players[0].enemyCard.containTouchPoint(touch.getLocation())) {
                var pk = new CmdSendCard();
                pk.putData(inGameMgr.gameLogic._players[target.getLastEnemyNeasrt()]._chairInServer);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                target._players[0].enemyCard.removeArrow();
                target._players[0].enemyCard.removeEatable();
                target.removeArrowGroup();
                target._players[0].canGetCard = false;
                target._players[0].canGetCardFromEnemy = false;
            }
        }

        var button = ccui.Helper.seekWidgetByName(target._layout, "btnDanh");
        if (button.action === "guibai") {
            for (var i = 0; i < 4; i++) {
                var idx = target._players[i].selectPhom(touch.getLocation());
                if (idx != -1) {
                    var suit = new TalaSuit();
                    var maxID = 0;
                    for (var j = 0; j < target._players[i]._listPhom[idx].length; j++) {
                        suit.cards.push(new Card(target._players[i]._listPhom[idx][j].id))
                        if (target._players[i]._listPhom[idx][j].id > maxID)
                            maxID = target._players[i]._listPhom[idx][j].id;
                    }
                    suit.genSuitType();
                    for (var j = 0; j < target._players[0]._handOnCards.length; j++) {
                        if (TalaGameRule.kiemtraGuiBai(suit, new Card(target._players[0]._handOnCards[j].id))) {
                            target._players[0]._handOnCards[j].removeArrow();
                            target._players[i]._listPhom[idx][1].removeArrow();

                            var senderChair = inGameMgr.gameLogic._players[0]._chairInServer;
                            var senderCardID = target._players[0]._handOnCards[j].id;
                            var targetChair = inGameMgr.gameLogic._players[i]._chairInServer;
                            var targetCardID = maxID;

                            var pk = new CmdSendGuibai();
                            pk.putData(senderChair, senderCardID, targetChair, targetCardID);
                            GameClient.getInstance().sendPacket(pk);
                            pk.clean();
                        }
                    }
                }
            }
        }
    },

    updateBlackList: function () {
        for (var i = 0; i < 4; i++) {
            if (this._players[i])
                this._players[i].checkBlackList();
        }
    },

    playerInGame: function (zingId) {

        for (var i = 0; i < 4; i++) {
            if (inGameMgr.gameLogic._players[i] && inGameMgr.gameLogic._players[i]._ingame) {
                if (inGameMgr.gameLogic._players[i]._info["uID"] == zingId) {
                    return true;
                }
            }
        }
        return false;
    },

    getPosFromPlayer: function (zingId) {
        for (var i = 0; i < 4; i++) {
            if (inGameMgr.gameLogic._players[i] && inGameMgr.gameLogic._players[i]._ingame) {
                if (inGameMgr.gameLogic._players[i]._info["uID"] == zingId) {
                    cc.log("GET POS ");
                    return this._players[i].getPosAvatar();
                }
            }
        }
        return cc.p(0, 0);
    },

    onUpdateGUI: function (data) {
        if (!inGameMgr.gameLogic)
            return;
        if (inGameMgr.gameLogic._myChair >= 0) {
            for (var i = 0; i < 4; i++) {
                if (this._players[i])
                    this._players[i].updateWithPlayer(inGameMgr.gameLogic._players[i]);
            }
            cc.log("UPDATE PLAYER VIEW " + inGameMgr.gameLogic._myChair);
        }
        switch (inGameMgr.gameLogic._gameState) {
            case GameState.JOINROOM: {
                if (!data)
                    return;
                var muccuoc = ccui.Helper.seekWidgetByName(this._layout, "muccuoc");
                var ban = ccui.Helper.seekWidgetByName(this._layout, "ban");
                var jackpot = ccui.Helper.seekWidgetByName(this._layout, "jackpot");
                var imgTypeRoom = (inGameMgr.gameLogic.isModeSolo) ? "imgModeSolo.png" : "imgModeNormal.png";
                imgTypeRoom = "NewGameGUI/" + imgTypeRoom;
                this.getControl("imgTypeRoom").loadTexture(imgTypeRoom);

                ban.setString(inGameMgr.gameLogic._roomIndex);
                muccuoc.setString(StringUtility.formatNumberSymbol(inGameMgr.gameLogic._bet));
                jackpot.setString(StringUtility.standartNumber(gamedata.jackpot) + "$");

                this.myViewGame = null;
                if (inGameMgr.gameLogic._myChair >= 0) {
                    for (var i = 0; i < 4; i++) {
                        this._players[i].updateWithPlayer(inGameMgr.gameLogic._players[i]);
                        this._players[i]._uiHome.setVisible(false);
                        this._players[i].addVipEffect();
                    }
                    this._players[inGameMgr.gameLogic.convertChair(inGameMgr.gameLogic._roomOwner)]._uiHome.setVisible(true);
                    this.updateStartButton();

                    this.updateOwnerRoom(inGameMgr.gameLogic._roomOwnerID);
                    for (var i = 0; i < 4; i++) {
                        this._players[i].updateItem(inGameMgr.gameLogic._players[i].idItem);
                    }
                } else {
                    sceneMgr.addLoading("Đang tải dữ liệu bàn chơi", true, this);
                    this.myViewGame = data;
                    inGameMgr.gameLogic._players[0]._status = 4;
                    var pk = new CmdSendViewGame();
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();
                    inGameMgr.gameLogic.gamePlaying = false;
                }

                inGameMgr.gameLogic._bigbet = data.bigbet > 0;
                if (data.bigbet > 0) {
                    this.addBigbet(data.bigbet, true);
                }

                this._layout.getChildByName("btnQuit").outroom = false;
                gameSound.playVaoban();
                this.updateChoNguoiKhac();
                break;
            }
            case GameState.RATE_BIGBET: {
                if (!data)
                    break;
                inGameMgr.gameLogic._bigbet = data.bigbet > 0;
                this.addBigbet(data.bigbet, false);
                break;
            }
            case GameState.PLAYCONTINUE: {
                if (!data)
                    return;
                // Cap nhat thong tin phong choi
                cc.log("CAP NHAT CONTINUE");
                var muccuoc = ccui.Helper.seekWidgetByName(this._layout, "muccuoc");
                var ban = ccui.Helper.seekWidgetByName(this._layout, "ban");
                var jackpot = ccui.Helper.seekWidgetByName(this._layout, "jackpot");

                var imgTypeRoom = (inGameMgr.gameLogic.isModeSolo) ? "imgModeSolo.png" : "imgModeNormal.png";
                imgTypeRoom = "NewGameGUI/" + imgTypeRoom;
                this.getControl("imgTypeRoom").loadTexture(imgTypeRoom);

                this._layout.getChildByName("btnXepbai").setVisible(true);


                ban.setString(inGameMgr.gameLogic._roomIndex);
                muccuoc.setString(StringUtility.formatNumberSymbol(inGameMgr.gameLogic._bet));
                jackpot.setString(StringUtility.standartNumber(gamedata.jackpot) + "$");

                for (var i = 0; i < 4; i++) {
                    this._players[i].updateWithPlayer(inGameMgr.gameLogic._players[i]);
                    this._players[i]._uiHome.setVisible(false);
                    this._players[i].addVipEffect();
                    if (i != 0)
                        this._players[i]._panel.getChildByName("card").setVisible(true);
                    this._players[i].updateItem(inGameMgr.gameLogic._players[i].idItem);

                }
                this._players[inGameMgr.gameLogic.convertChair(inGameMgr.gameLogic._roomOwner)]._uiHome.setVisible(true);

                this.updateDockCard(data.deckCard);

                this.logMyCard = [];
                this.logReceiveCard = [];
                this.logThrowCard = [];
                this.logHaPhom = [];
                for (var i = 0; i < 4; i++) {
                    var local = inGameMgr.gameLogic.convertChair(i);
                    if (local > -1) {
                        // ADD card da~ nem va card tren tay
                        for (var j = 0; j < data.playerCards[i]["throwCards"].length; j++) {
                            this._players[local].addTalaCardThrow(data.playerCards[i]["throwCards"][j]);
                        }
                        for (var j = 0; j < data.playerCards[i]["handOnCards"].length; j++) {
                            if (data.playerCards[i]["isEatens"][j] && (local != 0)) {
                                this._players[local].addTalaCardEaten(data.playerCards[i]["handOnCards"][j])
                            }
                        }
                        // show phom neu co
                        if (data.playerCards[i]["isShowCard"]) {
                            var cards = [];
                            for (var j = 0; j < data.playerCards[i]["phom"].length; j++) {
                                for (var k = 0; k < data.playerCards[i]["phom"][j].length; k++) {
                                    cards.push(data.playerCards[i]["phom"][j][k]);
                                }
                            }
                            if (cards.length > 0) {
                                this._players[local].haphom(cards, true);
                                this._players[local].setDarkAllCard();
                            }
                            if (local != 0)
                                for (var j = 0; j < data.playerCards[i]["handOnCards"].length; j++) {
                                    this._players[local].setLogicCard(data.playerCards[i]["handOnCards"], data.playerCards[i]["isEatens"]);
                                }

                        }
                        if (local == 0) {
                            this.logMyCard = data.playerCards[i]["handOnCards"];
                            this._players[local].initCards(data.playerCards[i]["handOnCards"]);
                            for (var j = 0; j < this._players[local]._handOnCards.length; j++) {
                                this._players[local]._handOnCards[j].setVisible(true);
                                this._players[local].addEatenForCard(this._players[local]._handOnCards[j], data.playerCards[i]["isEatens"][j]);
                            }
                            this._players[local].sapxep();
                        }


                    }
                }
                var currentLocal = inGameMgr.gameLogic.convertChair(data.currentChair);

                // kiem tra an quan khi den luot , update trang thai

                this._players[currentLocal].addEffectTime(data.turnTime, data.turnTime);
                if (data.playerAction == 1)
                    this._players[currentLocal].updateState("dangboc");
                if (data.playerAction == 2)
                    this._players[currentLocal].updateState("dangdanh");
                if (data.playerAction == 3)
                    this._players[currentLocal].updateState("dangha");
                if (data.playerAction == 4)
                    this._players[currentLocal].updateState("danggui");

                if (currentLocal == 0) {
                    switch (data.playerAction) {
                        case 1:         // minh` boc bai
                        {
                            this._players[0].canGetCard = true;
                            this.addArrowGroup();

                            var groupLogic = TalaGameRule.copyCardGroup(this._players[0]);

                            var lastEnemy = this.getLastEnemyNeasrt();
                            this._players[0].enemyCard = null;
                            if (this._players[lastEnemy]._throwCards.length > 0)
                                this._players[0].enemyCard = this._players[lastEnemy]._throwCards[this._players[lastEnemy]._throwCards.length - 1];

                            if (this._players[0].enemyCard) {
                                var cardCheck = new Card(this._players[0].enemyCard.id);
                                if (TalaGameRule.kiemtraAnQuan(groupLogic, cardCheck)) {
                                    this._players[0].enemyCard.addEatable();
                                    this._players[0].enemyCard.setDark(false);
                                    this._players[0].enemyCard.addArrow();
                                    this._players[0].canGetCardFromEnemy = true;
                                } else {
                                    this._players[0].canGetCardFromEnemy = false;
                                }
                            }
                            break;
                        }
                        case 2:     // minh` danh bai
                        {
                            this.setActionButton("danhbai", true);
                            break;
                        }
                        case 3:     // minh ha bai
                        {
                            var group1 = TalaGameRule.copyCardGroup(this._players[0]);
                            var group2 = TalaGameRule.tuDongHaBai(group1);
                            this._players[0].showPhomHandOn(group2);

                            this.setActionButton("habai", true);

                            break;
                        }
                        case 4:         // minh gui bai
                        {
                            this.setActionButton("guibai", true);
                            for (var i = 0; i < 4; i++) {
                                if (inGameMgr.gameLogic._players[i]._ingame && (this._players[i]._listPhom.length > 0)) {
                                    for (var j = 0; j < this._players[i]._listPhom.length; j++) {
                                        var suitt = this._players[i]._listPhom[j];
                                        var group1 = new TalaGroupCard([]);
                                        for (var z = 0; z < suitt.length; z++) {
                                            group1.cards.push(new Card(suitt[z].id));
                                        }
                                        var suit = TalaGameRule.findAllSuit(group1)[0];

                                        for (var k = 0; k < this._players[0]._handOnCards.length; k++) {
                                            var card = new Card(this._players[0]._handOnCards[k].id);
                                            if (TalaGameRule.kiemtraGuiBai(suit, card)) {
                                                this._players[0]._handOnCards[k].addArrow();
                                                this._players[0]._handOnCards[k].len();

                                                suitt[1].addArrow();
                                            }
                                        }

                                    }
                                }
                            }

                            break;
                        }
                    }
                }


                break;
            }
            case GameState.USERJOIN: {
                this._players[inGameMgr.gameLogic._activeLocalChair].updateWithPlayer(inGameMgr.gameLogic._players[inGameMgr.gameLogic._activeLocalChair]);
                this._players[inGameMgr.gameLogic._activeLocalChair].addVipEffect();
                this._players[inGameMgr.gameLogic._activeLocalChair].updateItem(inGameMgr.gameLogic._players[inGameMgr.gameLogic._activeLocalChair].idItem);
                if (inGameMgr.gameLogic._players[inGameMgr.gameLogic._activeLocalChair]._status != 4)
                    this.updateStartButton();
                this.updateChoNguoiKhac();

                if (Config.ENABLE_BLACK_LIST) {
                    blackList.sendGetBlackList();
                    this.updateBlackList();
                }

                break;
            }
            case GameState.USERLEAVE: {
                if (inGameMgr.gameLogic.numberPlayer() < 2) {
                    this.stopAutoStart();
                }
                this._players[inGameMgr.gameLogic._activeLocalChair].updateWithPlayer(inGameMgr.gameLogic._players[inGameMgr.gameLogic._activeLocalChair]);
                if (inGameMgr.gameLogic._players[inGameMgr.gameLogic._activeLocalChair]._status != 4)
                    this.updateStartButton();
                this.updateChoNguoiKhac();
                this.updateBlackList();
                break;
            }
            case GameState.USERVIEW: {
                var localChair = inGameMgr.gameLogic.convertChair(data.uChair);
                inGameMgr.gameLogic._players[localChair]._status = data.uStatus;
                inGameMgr.gameLogic._players[localChair]._ingame = true;
                inGameMgr.gameLogic._players[localChair]._active = true;
                inGameMgr.gameLogic._players[localChair]._chairInServer = data.uChair;
                inGameMgr.gameLogic._players[localChair]._info = data.info;
                this._players[localChair].updateItem(data.info.idItem);
                this._players[localChair].updateWithPlayer(inGameMgr.gameLogic._players[localChair]);
                this.updateBlackList();
                break;
            }
            case GameState.USERTAKECHAIR: {
                if (data.error == 0 && this.myViewGame) {
                    inGameMgr.gameLogic._myChair = data.uChair;


                    for (var i = 0; i < inGameMgr.gameLogic._players.length; i++) {
                        inGameMgr.gameLogic._players[i]._ingame = false;
                    }

                    for (var i = 0; i < inGameMgr.gameLogic._players.length; i++) {
                        var chair = inGameMgr.gameLogic.convertChair(i);
                        if (chair == 0)
                            this.myViewGame.playerStatus[i] = 4;
                        if (this.myViewGame.playerStatus[i] != 0) {
                            inGameMgr.gameLogic._players[chair]._ingame = true;
                            inGameMgr.gameLogic._players[chair]._active = true;
                            inGameMgr.gameLogic._players[chair]._info = this.myViewGame.playerInfo[i];
                            inGameMgr.gameLogic._players[chair]._status = this.myViewGame.playerStatus[i];
                            inGameMgr.gameLogic._players[chair]._chairInServer = i;

                            if (this.myViewGame.playerStatus[i] != 4) {
                                this._players[chair]._panel.getChildByName("card").setVisible(true);
                            }
                        }
                    }
                    inGameMgr.gameLogic._players[0]._info["uName"] = gamedata.userData.displayName;
                    inGameMgr.gameLogic._players[0]._info["uID"] = GameData.getInstance().userData.uID;
                    inGameMgr.gameLogic._players[0]._info["avatar"] = GameData.getInstance().userData.avatar;
                    inGameMgr.gameLogic._players[0]._info["bean"] = GameData.getInstance().userData.bean;
                    inGameMgr.gameLogic._players[0]._info["vip"] = GameData.getInstance().userData.typeVip - 1;
                    this.updateBlackList();
                }
                break;
            }
            case GameState.VIEWGAMEINFO: {
                sceneMgr.clearLoading();
                this.updateDockCard(data.dockCard);
                inGameMgr.gameLogic.gamePlaying = true;
                for (var i = 0; i < 4; i++) {
                    var local = inGameMgr.gameLogic.convertChair(i);
                    if ((local != 0) && data.players[i]) {
                        // ADD card da~ nem va card tren tay
                        for (var j = 0; j < data.playerCards[i]["throwCards"].length; j++) {
                            this._players[local].addTalaCardThrow(data.playerCards[i]["throwCards"][j]);
                        }
                        for (var j = 0; j < data.playerCards[i]["handOnCards"].length; j++) {
                            if (data.playerCards[i]["isEatens"][j]) {
                                this._players[local].addTalaCardEaten(data.playerCards[i]["handOnCards"][j])
                            }
                        }
                        // show phom neu co
                        if (data.playerCards[i]["isShowCard"]) {
                            var cards = [];
                            var log = "phom cua thang " + local + " ";
                            for (var j = 0; j < data.playerCards[i]["phom"].length; j++) {
                                for (var k = 0; k < data.playerCards[i]["phom"][j].length; k++) {
                                    cards.push(data.playerCards[i]["phom"][j][k]);
                                    log += (data.playerCards[i]["phom"][j][k] + " ");
                                }
                            }
                            cc.log(log);
                            if (cards.length > 0) {
                                this._players[local].haphom(cards, true);
                                this._players[local].setDarkAllCard();
                            }
                            for (var j = 0; j < data.playerCards[i]["handOnCards"].length; j++) {
                                this._players[local].setLogicCard(data.playerCards[i]["handOnCards"], data.playerCards[i]["isEatens"]);
                            }
                        }
                        this._players[local].updateItem(data.arrayItem[i]);
                    }
                }

                // NOTE : con` trang thai cua nguoi choi , update sau
                var currentLocal = inGameMgr.gameLogic.convertChair(data.currentChair);
                this._players[currentLocal].addEffectTime(data.turnTime, data.turnTime);

                break;
            }
            case GameState.OUTROOM: {
                if (data.result == 0) {
                    Toast.makeToast(1.5, "Bạn sẽ được thoát khỏi phòng khi ván chơi kết thúc, Nhấn lần nữa để hủy.");
                    var button = this._layout.getChildByName("btnQuit");
                    button.getChildByName("check").setVisible(true);
                    button.outroom = true;
                } else {
                    Toast.makeToast(1.5, "Bạn đã hủy đăng ký rời phòng");
                    var button = this._layout.getChildByName("btnQuit");
                    button.getChildByName("check").setVisible(false);
                    button.outroom = false;

                }
                inGameMgr.gameLogic._gameState = GameState.NONE;
                break;
            }
            case GameState.AUTOSTART: {
                if (!data)
                    return;
                inGameMgr.gameLogic.chairStart = data.chairStart;
                inGameMgr.gameLogic._roomOwner = data.chairStart;

                if (data.autoType == 2) {
                    this.addAutoStart(inGameMgr.gameLogic._timeAutoStart);
                } else if (data.autoType == 1 || data.autoType == 0) {
                    this.stopAutoStart();
                }

                this.updateStartButton();
                break;
            }
            case GameState.UPDATEOWNERROOM: {
                if (data) {
                    for (var i = 0; i < 4; i++) {
                        this._players[i]._uiHome.setVisible(false);
                    }
                    this._players[inGameMgr.gameLogic.convertChair(inGameMgr.gameLogic._roomOwner)]._uiHome.setVisible(true);
                    this.updateStartButton();

                }
                break;
            }
            case GameState.NOTIFY_START:        // bat dau chia bai
            {
                if (!data)
                    return;
                this.stopAutoStart();
                inGameMgr.gameLogic.gamePlaying = true;
                this.updateChoNguoiKhac();
                this._players[0].clearBai();
                ccui.Helper.seekWidgetByName(this._layout, "btnStart").setVisible(false);
                gameSound.playBatDauGame();
                gameSound.playVaoBanNoi();


                this.playChia = function () {
                    gameSound.playChiaBai();
                }
                inGameMgr.gameLogic._cardChiabai = [52, 52, 52, 52, 52, 52, 52, 52, 52, 52];
                this._players[0].initCards(inGameMgr.gameLogic._cardChiabai);
                inGameMgr.gameLogic.logInitCard = "INIT DEFAULT ";
                this._effect2D.showCard = false;
                for (var i = 0; i < 4; i++) {
                    if (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status != 4)) {
                        this._effect2D.chiabai(this._players[i]);
                    }
                }
                this.runAction(cc.sequence(cc.delayTime(.25), cc.callFunc(function () {
                    gameSound.playChiaBai();
                }), cc.delayTime(.5), cc.callFunc(this.playChia), cc.delayTime(.35), cc.callFunc(this.playChia)))

                this.runAction(cc.sequence(cc.delayTime(.35), cc.callFunc(function () {
                    gameSound.playBatDauGame();
                })))

                this.updateDockCard(data.nDeckCard);

                break;
            }
            case GameState.UPDATE_MYCARD: {
                if (!data)
                    break;
                var group = new TalaGroupCard([]);
                this.logMyCard = data.cards;
                this.logReceiveCard = [];
                this.logThrowCard = [];
                this.logHaPhom = [];
                for (var i = 0; i < data.cards.length; i++) {
                    group.cards.push(new Card(data.cards[i]));
                }
                var groupSapxep = TalaGameRule.arrangeCard(group);
                inGameMgr.gameLogic._cardChiabai = [];
                for (var i = 0; i < groupSapxep.cards.length; i++) {
                    inGameMgr.gameLogic._cardChiabai.push(groupSapxep.cards[i].id);
                }
                this._players[0].clearBai();
                this._players[0].initCards(inGameMgr.gameLogic._cardChiabai);
                inGameMgr.gameLogic.logInitCard = "INIT MYCARD ";
                if (!this._effect2D.showingCard) {
                    this._effect2D.checkShowCard();
                }
                break;
            }
            case GameState.CHANGETURN: {

                this.setActionButton("", false);
                var localChair = inGameMgr.gameLogic.convertChair(data.chair);
                if ((inGameMgr.gameLogic._players[0]._status == 4) && (localChair == 0))
                    break;


                this.setActionButton("", false);
                var btnXep = this._layout.getChildByName("btnXepbai");
                if (inGameMgr.gameLogic._players[0]._status != 4 && !btnXep.isVisible()) {
                    btnXep.setVisible(true);
                }

                if (this._players[0].cotheGuiBai) {
                    for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                        this._players[0]._handOnCards[i].removeArrow();
                    }

                    for (var i = 0; i < 4; i++) {
                        for (var j = 0; j < this._players[i]._listPhom.length; j++) {
                            var suit = this._players[i]._listPhom[j];
                            for (var k = 0; k < suit.length; k++) {
                                suit[k].removeArrow();
                            }
                        }
                    }

                    this._players[0].cotheGuiBai = false;
                }

                if ((localChair >= 0) && (localChair <= 4)) {

                    for (var i = 0; i < 4; i++) {
                        this._players[i].stopEffectTime();
                        this._players[i].updateState("");
                    }

                    this._players[localChair].addEffectTime(data.time);
                    this.removeArrowGroup();
                    if (data.cangetcard == true) {
                        this._players[localChair].updateState("dangboc");
                    } else
                        this._players[localChair].updateState("dangdanh");
                    if (localChair == 0) {

                        if (inGameMgr.gameLogic._players[0]._status == 4)
                            return;
                        if (data.cangetcard == true)         // get form group of enemy
                        {

                            this._players[0].canGetCard = true;
                            this.addArrowGroup();
                            var groupLogic = TalaGameRule.copyCardGroup(this._players[0]);
                            if (this._players[0].enemyCard) {
                                var cardCheck = new Card(this._players[0].enemyCard.id);
                                if (TalaGameRule.kiemtraAnQuan(groupLogic, cardCheck)) {
                                    this._players[0].enemyCard.addEatable();
                                    this._players[0].enemyCard.setDark(false);
                                    this._players[0].enemyCard.addArrow();
                                    this._players[0].canGetCardFromEnemy = true;
                                } else {
                                    this._players[0].canGetCardFromEnemy = false;

                                }
                            }

                        } else {
                            this.setActionButton("danhbai", true);
                        }
                    }
                }
                inGameMgr.gameLogic._gameState = GameState.NONE;
                break;

            }
            case GameState.RECEIVED_CARD:               // 1 nguoi nhan bai, chu y chuyen quan
            {
                if (!data || (data.nDeckCard == undefined))
                    return;
                this.updateDockCard(data.nDeckCard);
                var target = inGameMgr.gameLogic.convertChair(data.targetCardChair);
                this._players[target].updateState("dangdanh");
                if (target == 0) {
                    if (this.logReceiveCard)
                        this.logReceiveCard.push(data.cardID);
                    if (inGameMgr.gameLogic._players[0]._status != 4)
                        this.setActionButton("danhbai", true);

                }

                if (data.srcCardChair == -1) {
                    gameSound.playBocbai();
                    if (target == 0) {
                        if (inGameMgr.gameLogic._players[0]._status == 4)
                            return;
                        var cardGet = this._players[0].addTalaCard(data.cardID);
                        var cardEff = new cc.Sprite("res/common/cards/labai_52__.png");
                        var pos = this._layout.getChildByName("btnGroup").getChildByName("dock").convertToWorldSpaceAR(cc.p(.5, .5));
                        cardEff.setPosition(this._effect2D.convertToNodeSpace(pos));
                        this._effect2D.addChild(cardEff);

                        var test = cardGet.convertToWorldSpaceAR(cc.p(.5, .5));
                        var destPos = this._effect2D.convertToNodeSpace(test);

                        GameLayer.effectCardMove(.25, cardEff, cardGet, 1.3, destPos);

                        this.removeArrowGroup();
                        if (this._players[0].enemyCard && this._players[0].canGetCardFromEnemy) {
                            this._players[0].enemyCard.removeArrow();
                            this._players[0].enemyCard.removeEatable();
                        }
                        this._players[0].canGetCard = false;
                        this._players[0].canGetCardFromEnemy = false;

                        if (this._players[0]._throwCards.length == 3)
                            gameSound.playVongCuoiBocBaiNoi();
                        else
                            gameSound.playVongBinhThuongBocBaiNoi();

                    } else {
                        var cardEff = new cc.Sprite("res/common/cards/labai_52__.png");
                        var pos = this._layout.getChildByName("btnGroup").getChildByName("dock").convertToWorldSpaceAR(cc.p(.5, .5));
                        cardEff.setPosition(this._effect2D.convertToNodeSpace(pos));
                        this._effect2D.addChild(cardEff);

                        var test = this._players[target]._panel.getChildByName("card").convertToWorldSpaceAR(cc.p(.5, .5));
                        var destPos = this._effect2D.convertToNodeSpace(test);

                        GameLayer.effectCardMove(.25, cardEff, null, 1, destPos);

                        if (data.cardID < 52) {
                            this._players[target].addLogicCard(data.cardID, false);
                        }
                    }
                } else {
                    var src = inGameMgr.gameLogic.convertChair(data.srcCardChair);
                    var cardAdd = this._players[target].addTalaCard(data.cardID, true);

                    this._players[src].addEmoticon(false);
                    this._players[target].addEmoticon(true);


                    if (target == 0) {
                        if (inGameMgr.gameLogic._players[0]._status == 4)
                            return;
                        this._players[0].sapxep();
                        for (var j = 0; j < this._players[0]._handOnCards.length; j++) {
                            if (this._players[0]._handOnCards[j].id == data.cardID) {
                                cardAdd = this._players[0]._handOnCards[j];
                                break;
                            }
                        }
                        if (data.chotha) {
                            this._effect2D.addAnchot();
                        }
                    }

                    gameSound.playAnBaiRac();

                    if (data.chotha) {
                        gameSound.playAnChotNoi();
                    } else {
                        gameSound.playAnQuanBaiNoi();
                    }


                    var cardThrow = this._players[src].getThrowCard(data.cardID);
                    if (!cardThrow)
                        return;

                    var cardEff = new TalaCard(data.cardID);
                    cardEff.setScale(.66);
                    this._effect2D.addChild(cardEff);
                    cardEff.setPosition(this._effect2D.convertToNodeSpace(cardThrow.convertToWorldSpaceAR(cc.p(.5, .5))));
                    var scale = 1;
                    if (target == 0) {
                        scale = 1.3;
                    } else {
                        if (data.cardID < 52) {
                            this._players[target].addLogicCard(data.cardID, true);
                        }
                    }
                    GameLayer.effectCardMove(.25, cardEff, cardAdd, scale, this._effect2D.convertToNodeSpace(cardAdd.convertToWorldSpaceAR(cc.p(.5, .5))))

                    this._players[src].removeThrowCard(data.cardID);

                    this._players[target].addMoney(data.nMoney, 2.5);
                    this._players[src].addMoney(-data.nMoney, 2.5);

                    if (inGameMgr.gameLogic._bigbet)
                        this.effectBigbet(target);


                }

                if (data.throwCardChair >= 0)        // co chuyen la bai
                {
                    var throwChair = inGameMgr.gameLogic.convertChair(data.throwCardChair);
                    var src = inGameMgr.gameLogic.convertChair(data.srcCardChair);

                    if (this._players[throwChair]._throwCards.length == 0)
                        return;
                    var startPos = this._effect2D.convertToNodeSpace(this._players[throwChair]._throwCards[this._players[throwChair]._throwCards.length - 1].convertToWorldSpaceAR(cc.p(.5, .5)));
                    var cardEff = new TalaCard(this._players[throwChair]._throwCards[this._players[throwChair]._throwCards.length - 1].id);
                    cardEff.setScale(.69);
                    cardEff.setPosition(startPos);

                    this._effect2D.addChild(cardEff);

                    var moveCard = this._players[src].addTalaCardThrow(this._players[throwChair]._throwCards[this._players[throwChair]._throwCards.length - 1].id);
                    var destPos = this._effect2D.convertToNodeSpace(moveCard.convertToWorldSpaceAR(cc.p(.5, .5)));
                    this._players[throwChair]._throwCards[this._players[throwChair]._throwCards.length - 1].removeFromParent();
                    this._players[throwChair]._throwCards.splice(this._players[throwChair]._throwCards.length - 1, 1);
                    GameLayer.effectCardMove(.25, cardEff, moveCard, .69, destPos);
                }

                break;
            }
            case GameState.DANHBAI:             // 1 nguoi danh' bai` ra
            {
                if (!data)
                    break;
                var localChair = inGameMgr.gameLogic.convertChair(data.chair);
                if (localChair < 0 || localChair > 3)
                    return;

                gameSound.playDanhBai();
                var cardThrow = this._players[localChair].throwTalaCard(data.cardID);

                if (localChair != this.getLastEnemyNeasrt()) {
                    var chot = false;
                    var all4 = true;
                    var all3 = true;
                    if (this._players[localChair]._throwCards.length == 4) {
                        for (var i = 0; i < 4; i++) {
                            if (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status != 4)) {
                                if (this._players[i]._throwCards.length < 4) {
                                    all4 = false;
                                    break;
                                }
                            }
                        }
                        chot = !all4;
                        if (!all4)
                            gameSound.playDanhQuanChotNoi();
                    } else if (this._players[localChair]._throwCards.length == 3) {
                        for (var i = 0; i < 4; i++) {
                            if (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status != 4)) {
                                if (this._players[i]._throwCards.length < 3) {
                                    all3 = false;
                                    break;
                                }
                            }
                        }
                        chot = all3;
                        if (chot) {
                            gameSound.playDanhQuanChotNoi();
                        } else
                            gameSound.playDanhBaiThuongNoi();
                    } else
                        gameSound.playDanhBaiThuongNoi();

                }

                if (localChair == 0) {
                    var cardEff = new TalaCard(data.cardID);
                    this._effect2D.addChild(cardEff);
                    if (this.logThrowCard)
                        this.logThrowCard.push(data.cardID);

                    //var s = "STRING LOG *** MyCard " + JSON.stringify(this.logMyCard) + " ReceiveCard: " + JSON.stringify(this.logReceiveCard) + " ThrowCard: " + JSON.stringify(this.logThrowCard)
                    //  + " HaBai: " + JSON.stringify(this.logHaPhom) + " UID: " + gamedata.userData.uID;

                    if (!cardThrow || cardThrow == null || cc.isUndefined(cardThrow) || !cardThrow.posOfCardThrow || cc.isUndefined(cardThrow.posOfCardThrow) || cardThrow.posOfCardThrow == null) {
                        var s = " CARD ID: " + data.cardID + " MY CARD: ";
                        if (this._players[localChair] && this._players[localChair]._handOnCards) {
                            for (var i = 0; i < this._players[localChair]._handOnCards.length; i++) {
                                s = s + this._players[localChair]._handOnCards[i].id + " ";
                            }
                        }
                        s = s + " IS ENTER GAME " + inGameMgr.gameLogic.isEnterGame;
                        s = s + " LOG INIT CARD: " + inGameMgr.gameLogic.logInitCard;
                        //NativeBridge.logJSManual("GameScene.js", 10000, s, NativeBridge.getVersionString());
                        GameClient.getInstance().retryConnectInGame();
                        return;
                    }
                    cardEff.setPosition(this._effect2D.convertToNodeSpace(cardThrow.posOfCardThrow));
                    GameLayer.effectCardMove(.25, cardEff, cardThrow, .66, this._effect2D.convertToNodeSpace(cardThrow.convertToWorldSpaceAR(cc.p(.5, .5))));
                } else {
                    var cardEff = new TalaCard(data.cardID);
                    cardEff.setScale(.66);
                    this._effect2D.addChild(cardEff);
                    var pos = this._players[localChair]._panel.getChildByName("card").convertToWorldSpaceAR(cc.p(.5, .5));
                    cardEff.setPosition(this._effect2D.convertToNodeSpace(pos));
                    GameLayer.effectCardMove(.25, cardEff, cardThrow, .66, this._effect2D.convertToNodeSpace(cardThrow.convertToWorldSpaceAR(cc.p(.5, .5))));
                    if (data.cardID < 52) {
                        this._players[localChair].removeLogicCard(data.cardID);
                    }
                }

                if (localChair == this.getLastEnemyNeasrt()) {
                    this._players[0].enemyCard = cardThrow;
                }

                break;
            }
            case GameState.REQUEST_SHOWPHOM: {
                if (!data)
                    return;
                var localChair = inGameMgr.gameLogic.convertChair(data.chair);
                if (!inGameMgr.gameLogic._players[localChair]._ingame || (inGameMgr.gameLogic._players[localChair]._status == 4))
                    return;
                if (data.mom) {
                    if (this._players[localChair]._listPhom.length == 0) {
                        this._players[localChair].displayKQ(-1, 5);
                        gameSound.playMom();
                    }

                    this._players[localChair].setDarkAllCard();
                    this._players[localChair].updateState("");
                } else {
                    this._players[localChair].addEffectTime(data.turnTime, data.turnTime);
                    this._players[localChair].updateState("dangha");
                    if (localChair == 0) {
                        var group1 = TalaGameRule.copyCardGroup(this._players[0]);
                        var group2 = TalaGameRule.tuDongHaBai(group1);


                        this._players[0].showPhomHandOn(group2);
                        gameSound.playNhacbai();

                        this.setActionButton("habai", true);
                    }

                }
                if (localChair != 0 && (this._players[localChair]._logicCards.cards.length == 0)) {
                    this._players[localChair].setLogicCard(data.allCard, data.eatCards);
                }
                break;
            }
            case GameState.HA_PHOM: {
                if (!data)
                    return;
                gameSound.playHaPhom();
                var localChair = inGameMgr.gameLogic.convertChair(data.chair);
                this._players[localChair].haphom(data.cards, false);
                if (data.chair == 0)
                    this.logHaPhom = data.cards;
                this._players[localChair].setDarkAllCard();
                this._players[localChair].updateState("");

                break;
            }
            case GameState.GAME_RESULT: {
                this.setActionButton("", false);
                this.updateDockCard(-1);
                inGameMgr.gameLogic.gamePlaying = false;

                if (this._players[0].cotheGuiBai) {
                    for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                        this._players[0]._handOnCards[i].removeArrow();
                    }
                    for (var i = 0; i < 4; i++) {
                        for (var j = 0; j < this._players[i]._listPhom.length; j++) {
                            var suit = this._players[i]._listPhom[j];
                            for (var k = 0; k < suit.length; k++) {
                                suit[k].removeArrow();
                            }
                        }
                    }

                    this._players[0].cotheGuiBai = false;
                }

                // effect rank
                this.rank(data.rank, data.mom);

                //data endgame
                var dataendgame = this.createDataEndGame(data.rank, data.mom, data.moneyGet);

                //effect money
                for (var i = 0; i < data.moneyGet.length; i++) {
                    var local = inGameMgr.gameLogic.convertChair(i);
                    if (inGameMgr.gameLogic._players[local]._ingame && (inGameMgr.gameLogic._players[local]._status != 4)) {
                        this._players[local].addMoney(data.moneyGet[i], 2.5, true);
                    }

                }

                for (var i = 0; i < this._players.length; i++) {
                    this._players[i].updateState("")
                    this._players[i].stopEffectTime();
                    if (inGameMgr.gameLogic._players[i]._ingame && inGameMgr.gameLogic._players[i]._status != 4) {
                        this._players[i].displayLogicCard();
                        this._players[i].setDarkAllCard();
                    }
                }

                // Tiep tuc muon choi
                var button = this._layout.getChildByName("btnQuit");
                if (!button.outroom) {
                    // Tiep tuc muon choi
                    var pk = new CmdSendConnectRoom();
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();
                }

                break;
            }
            case GameState.TAI_LUOT: {
                if (!data)
                    return;
                var localChair = inGameMgr.gameLogic.convertChair(data.chair);
                this._players[localChair].tailuot();
                break;
            }
            case GameState.REQUEST_GUIBAI: {
                var localChair = inGameMgr.gameLogic.convertChair(data.chair);
                this._players[localChair].stopEffectTime();
                this._players[localChair].addEffectTime(data.turnTime, data.turnTime);
                this._players[localChair].updateState("danggui");


                if (localChair == 0) {
                    this.setActionButton("guibai", true);
                    for (var i = 0; i < 4; i++) {
                        if (this._players[i]._listPhom.length > 0) {
                            for (var j = 0; j < this._players[i]._listPhom.length; j++) {
                                var suitt = this._players[i]._listPhom[j];
                                //var group1 = new TalaGroupCard([]);
                                var suit = new TalaSuit();
                                for (var z = 0; z < suitt.length; z++) {
                                    suit.cards.push(new Card(suitt[z].id));
                                }
                                suit.genSuitType();
                                //var suit = TalaGameRule.findAllSuit(group1)[0];

                                for (var k = 0; k < this._players[0]._handOnCards.length; k++) {
                                    var card = new Card(this._players[0]._handOnCards[k].id);
                                    if (TalaGameRule.kiemtraGuiBai(suit, card)) {
                                        this._players[0]._handOnCards[k].addArrow();
                                        this._players[0]._handOnCards[k].len();
                                        this._players[0].cotheGuiBai = true;
                                        suitt[1].addArrow();
                                    }
                                }

                            }
                        }
                    }
                }

                break;
            }
            case GameState.GUI_BAI: {
                gameSound.playGuiBai();
                var localSender = inGameMgr.gameLogic.convertChair(data.senderChair);
                var localTarget = inGameMgr.gameLogic.convertChair(data.targetChair);

                this._players[localSender].daGuiBai = true;

                var cardGui = this._players[localTarget].addCardToPhom(data.senderCardID, data.targetCardID);

                var cardEff = new TalaCard(data.senderCardID);
                if (localSender == 0) {
                    var tmp = this._players[0].getCardHandOn(data.senderCardID);
                    if (tmp != null) {
                        cardEff.setPosition(this._effect2D.convertToNodeSpace(tmp.convertToWorldSpaceAR(cc.p(.5, .5))));
                        this._effect2D.addChild(cardEff);

                        GameLayer.effectCardMove(.25, cardEff, cardGui, .69, this._effect2D.convertToNodeSpace(cardGui.convertToWorldSpaceAR(cc.p(.5, .5))));

                        this._players[0].removeCardFromHandOn(data.senderCardID);
                    }

                    // check tiep va gui tiep
                    var button = ccui.Helper.seekWidgetByName(this._layout, "btnDanh");
                    if (button.action == "autosend") {
                        for (var i = 0; i < 4; i++) {
                            for (var z = 0; z < this._players[i]._listPhom.length; z++) {
                                var idx = z;
                                if (idx != -1) {
                                    var suit = new TalaSuit();
                                    var maxID = 0;
                                    for (var j = 0; j < this._players[i]._listPhom[idx].length; j++) {
                                        suit.cards.push(new Card(this._players[i]._listPhom[idx][j].id))
                                        if (this._players[i]._listPhom[idx][j].id > maxID)
                                            maxID = this._players[i]._listPhom[idx][j].id;
                                    }
                                    suit.genSuitType();
                                    for (var j = 0; j < this._players[0]._handOnCards.length; j++) {
                                        if (TalaGameRule.kiemtraGuiBai(suit, new Card(this._players[0]._handOnCards[j].id))) {
                                            this._players[0]._handOnCards[j].removeArrow();
                                            this._players[i]._listPhom[idx][1].removeArrow();

                                            var senderChair = inGameMgr.gameLogic._players[0]._chairInServer;
                                            var senderCardID = this._players[0]._handOnCards[j].id;
                                            var targetChair = inGameMgr.gameLogic._players[i]._chairInServer;
                                            var targetCardID = maxID;

                                            var pk = new CmdSendGuibai();
                                            pk.putData(senderChair, senderCardID, targetChair, targetCardID);
                                            GameClient.getInstance().sendPacket(pk);
                                            pk.clean();
                                        }
                                    }
                                }
                            }
                        }
                    }

                } else {
                    cardEff.setScale(.69);
                    var tmp = this._players[localSender]._panel.getChildByName("card");
                    cardEff.setPosition(this._effect2D.convertToNodeSpace(tmp.convertToWorldSpaceAR(cc.p(.5, .5))));
                    this._effect2D.addChild(cardEff);
                    if (cardGui) {
                        GameLayer.effectCardMove(.25, cardEff, cardGui, .69, this._effect2D.convertToNodeSpace(cardGui.convertToWorldSpaceAR(cc.p(.5, .5))));
                    }

                    this._players[localSender].removeCardFromHandOn(data.senderCardID);
                }

                break;
            }
            case GameState.U: {
                inGameMgr.gameLogic.gamePlaying = false;
                this.updateDockCard(-1);
                for (var i = 0; i < this._players.length; i++) {
                    this._players[i].stopEffectTime();
                    this._players[i].updateState("");
                }
                this.setActionButton("", false);

                var isUkhan = false;
                var isHabai = false;
                var dataendgame = [];

                var localChair = inGameMgr.gameLogic.convertChair(data.chair);
                if ((localChair == 0 && this._players[0]._listPhom.length > 0) || (localChair != 0 && this._players[localChair]._listPhom.length > 0))      // nhan bai` va` u`
                {
                    isUkhan = false;
                    isHabai = true;
                } else    // co the u khan hoac u tron
                {
                    var group = new TalaGroupCard([]);
                    for (var i = 0; i < data.allCard.length; i++) {
                        group.cards.push(new Card(data.allCard[i]));
                    }
                    isUkhan = TalaGameRule.kiemtraUKhan(group);
                    if (localChair != 0)
                        this._players[localChair].setLogicCard(data.allCard, data.eatCard);
                }
                if (isUkhan) {
                    for (var i = 0; i < 4; i++) {
                        if (localChair == i) // nguoi`u` khan
                        {
                            var obj = {};
                            this._players[localChair].displayKQ(4, -1);
                            if (localChair == 0)         // nguoi u khan la minh
                            {
                                this._players[localChair].myKQ(4, 5.5);
                                this._effect2D.jackpot();
                                obj["my"] = true;
                            } else {
                                this._players[0].myKQ(3, 5.5);
                                obj["my"] = false;

                            }
                            this._players[i].displayLogicCard(false);

                            obj["rank"] = 4;
                            obj["uid"] = inGameMgr.gameLogic._players[localChair]._info["uID"];
                            obj["id"] = "" + inGameMgr.gameLogic._players[localChair]._info["uName"];
                            obj["diem"] = 0;
                            obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                            dataendgame.push(obj);
                        } else {
                            if (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status != 4)) {
                                this._players[i].displayKQ(3, -1);
                                this._players[i].displayLogicCard();
                                this._players[i].setDarkHandOnCard();

                                var obj = {};
                                if (i == 0)         // nguoi u khan la minh
                                {
                                    obj["my"] = true;
                                } else {
                                    obj["my"] = false;
                                }

                                obj["rank"] = 3;
                                obj["uid"] = inGameMgr.gameLogic._players[i]._info["uID"];
                                obj["id"] = "" + inGameMgr.gameLogic._players[i]._info["uName"];
                                obj["diem"] = 0;
                                obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                                dataendgame.push(obj);
                            }
                        }

                    }
                } else {
                    if (localChair == 0) {
                        var myCard = TalaGameRule.copyCardGroup(this._players[0]);
                        var showCard = TalaGameRule.tuDongHaBai(myCard);
                        var sol = TalaGameRule.kiemtraHaBai(myCard, showCard);


                        if (sol.suit.length > 0) {
                            for (var i = 0; i < sol.suit.length; i++) {
                                var card = [];
                                for (var j = 0; j < sol.suit[i].cards.length; j++) {
                                    card.push(sol.suit[i].cards[j].id)
                                }
                                this._players[0].add_1_phom(card);

                            }
                            var kq = data.uTron ? 5 : 6;
                            this._players[0].displayKQ(kq, -1);
                            this._players[0].myKQ(kq, 5.5);

                            var obj = {};
                            obj["my"] = true;

                            obj["rank"] = kq;
                            obj["uid"] = inGameMgr.gameLogic._players[0]._info["uID"];
                            obj["id"] = "" + inGameMgr.gameLogic._players[0]._info["uName"];
                            obj["diem"] = 0;
                            obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                            dataendgame.push(obj);


                            for (var i = 1; i < 4; i++) {
                                this._players[i].displayKQ(3, -1);

                                if (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status != 4)) {
                                    var obj = {};
                                    obj["my"] = false;
                                    obj["rank"] = 3;
                                    obj["uid"] = inGameMgr.gameLogic._players[i]._info["uID"];
                                    obj["id"] = "" + inGameMgr.gameLogic._players[i]._info["uName"];
                                    obj["diem"] = 0;
                                    obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                                    dataendgame.push(obj);
                                }
                            }
                        } else    // gui het bai xong u`
                        {
                            var kq = 6;
                            this._players[0].displayKQ(kq, -1);
                            this._players[0].myKQ(kq, 5.5);
                            var obj = {};
                            obj["my"] = true;

                            obj["rank"] = kq;
                            obj["uid"] = inGameMgr.gameLogic._players[localChair]._info["uID"];
                            obj["id"] = "" + inGameMgr.gameLogic._players[localChair]._info["uName"];
                            obj["diem"] = 0;
                            obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                            dataendgame.push(obj);
                            for (var i = 1; i < 4; i++) {
                                this._players[i].displayKQ(3, -1);

                                if (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status != 4)) {
                                    var obj = {};
                                    obj["my"] = false;
                                    obj["rank"] = 3;
                                    obj["uid"] = inGameMgr.gameLogic._players[i]._info["uID"];
                                    obj["id"] = "" + inGameMgr.gameLogic._players[i]._info["uName"];
                                    obj["diem"] = 0;
                                    obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                                    dataendgame.push(obj);
                                }
                            }
                        }


                    } else        // doi' thu u`
                    {
                        if (this._players[localChair].daGuiBai) {
                            this._players[localChair]._card.setVisible(false);
                        }
                        if (isHabai)         // neu doi thu da ha bai xong moi' u`
                        {
                            var enemyHandOnCard = new TalaGroupCard([]);
                            for (var i = 0; i < this._players[localChair]._logicCards.cards.length; i++) {
                                var notAdd = false;
                                for (var j = 0; j < this._players[localChair]._listPhom.length; j++) {
                                    for (var k = 0; k < this._players[localChair]._listPhom[j].length; k++) {
                                        if (this._players[localChair]._logicCards.cards[i].id == this._players[localChair]._listPhom[j][k].id) {
                                            notAdd = true;		// Neu da co trong danh sach phom thi` khong add vao cac card tren tay doi' thu
                                            break;
                                        }
                                    }
                                }
                                if (!notAdd) {
                                    enemyHandOnCard.putCardIn(new Card(this._players[localChair]._logicCards.cards[i]));
                                }
                            }

                            var showCard = TalaGameRule.tuDongHaBai(enemyHandOnCard);
                            var sol = TalaGameRule.kiemtraHaBai(enemyHandOnCard, showCard);
                            if (sol.suit.length > 0) {
                                for (var i = 0; i < sol.suit.length; i++) {
                                    var card = [];
                                    for (var j = 0; j < sol.suit[i].cards.length; j++) {
                                        card.push(sol.suit[i].cards[j].id)
                                    }
                                    this._players[localChair].add_1_phom(card);
                                }
                                for (var i = 0; i < this._players[localChair]._eatenCards.length; i++) {
                                    this._players[localChair]._eatenCards[i].removeFromParent();
                                }
                                this._players[localChair]._eatenCards = [];
                                var kq = data.uTron ? 5 : 6;
                                this._players[localChair].displayKQ(kq, -1);
                                if (data.uTron) {
                                    this._players[localChair]._card.setVisible(false);
                                }

                                var obj = {};
                                obj["my"] = false;

                                obj["rank"] = kq;
                                obj["uid"] = inGameMgr.gameLogic._players[localChair]._info["uID"];
                                obj["id"] = "" + inGameMgr.gameLogic._players[localChair]._info["uName"];
                                obj["diem"] = 0;
                                obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                                dataendgame.push(obj);


                                for (var i = 0; i < 4; i++) {
                                    if (i != localChair && (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status != 4))) {
                                        this._players[i].displayKQ(3, -1);

                                        var obj = {};
                                        obj["my"] = false;
                                        if (i == 0)
                                            obj["my"] = true;

                                        obj["rank"] = 3;
                                        obj["uid"] = inGameMgr.gameLogic._players[i]._info["uID"];
                                        obj["id"] = "" + inGameMgr.gameLogic._players[i]._info["uName"];
                                        obj["diem"] = 0;
                                        obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                                        dataendgame.push(obj);
                                    }

                                }
                                this._players[0].myKQ(3, 5.5);

                            } else {
                                this._players[localChair]._eatenCards = [];
                                var kq = 6;
                                this._players[localChair].displayKQ(kq, -1);

                                var obj = {};
                                obj["my"] = false;

                                obj["rank"] = kq;
                                obj["uid"] = inGameMgr.gameLogic._players[localChair]._info["uID"];
                                obj["id"] = "" + inGameMgr.gameLogic._players[localChair]._info["uName"];
                                obj["diem"] = 0;
                                obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                                dataendgame.push(obj);

                                for (var i = 0; i < 4; i++) {
                                    if (i != localChair && (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status != 4))) {
                                        this._players[i].displayKQ(3, -1);

                                        var obj = {};
                                        obj["my"] = false;
                                        if (i == 0)
                                            obj["my"] = true;

                                        obj["rank"] = 3;
                                        obj["uid"] = inGameMgr.gameLogic._players[i]._info["uID"];
                                        obj["id"] = "" + inGameMgr.gameLogic._players[i]._info["uName"];
                                        obj["diem"] = 0;
                                        obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                                        dataendgame.push(obj);
                                    }
                                }
                                this._players[0].myKQ(3, 5.5);
                            }
                        } else    // doi thu u` binh thuong (nhan bai` xong u`)
                        {
                            var myCard = new TalaGroupCard([]);
                            for (var i = 0; i < data.allCard.length; i++) {
                                var tala = new Card(data.allCard[i]);
                                tala.isEaten = data.eatCard[i];
                                myCard.putCardIn(tala);
                            }
                            var showCard = TalaGameRule.tuDongHaBai(myCard);
                            var sol = TalaGameRule.kiemtraHaBai(myCard, showCard);
                            if (sol.suit.length > 0) {
                                var kq = data.uTron ? 5 : 6;
                                this._players[localChair].displayKQ(kq, -1);
                                this._players[localChair].haphom(sol, false);

                                if (data.uTron) {
                                    this._players[localChair]._card.setVisible(false);
                                }

                                var obj = {};
                                obj["my"] = false;

                                obj["rank"] = kq;
                                obj["uid"] = inGameMgr.gameLogic._players[localChair]._info["uID"];
                                obj["id"] = "" + inGameMgr.gameLogic._players[localChair]._info["uName"];
                                obj["diem"] = 0;
                                obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                                dataendgame.push(obj);

                                for (var i = 0; i < 4; i++) {
                                    if (i != localChair && (inGameMgr.gameLogic._players[i]._ingame && (inGameMgr.gameLogic._players[i]._status != 4))) {
                                        this._players[i].displayKQ(3, -1);

                                        var obj = {};
                                        obj["my"] = false;
                                        if (i == 0)
                                            obj["my"] = true;

                                        obj["rank"] = 3;
                                        obj["uid"] = inGameMgr.gameLogic._players[i]._info["uID"];
                                        obj["id"] = "" + inGameMgr.gameLogic._players[i]._info["uName"];
                                        obj["diem"] = 0;
                                        obj["bichu"] = "mom";//obj["gold"] = (money[i]>0?"+":money[i]<0?"-":"") + StringUtility.pointNumber(money[i]);
                                        dataendgame.push(obj);
                                    }
                                }
                                this._players[0].myKQ(3, 5.5);
                            }
                        }
                    }
                }

                // efect money

                for (var i = 0; i < data.playerMoney.length; i++) {
                    if (data.playerMoney[i] != 0) {
                        var lChair = inGameMgr.gameLogic.convertChair(i);
                        this._players[lChair].addMoney(data.playerMoney[i], 2.5, true);

                        for (var j = 0; j < dataendgame.length; j++) {
                            if (dataendgame[j]["uid"] == inGameMgr.gameLogic._players[lChair]._info["uID"]) {
                                dataendgame[j]["gold"] = (data.playerMoney[i] > 0 ? "+" : data.playerMoney[i] < 0 ? "-" : "") + StringUtility.pointNumber(data.playerMoney[i]);
                            }
                        }

                        if (data.playerMoney[i] > 0 && inGameMgr.gameLogic._bigbet) {
                            this.effectBigbet(lChair);
                        }
                        if (data.isDentien == i) {
                            //   Den tien.............................
                            this._players[lChair].dentien();
                        }
                    }
                }

                for (var i = 0; i < this._players.length; i++) {
                    this._players[i].setDarkAllCard();
                }

                var button = this._layout.getChildByName("btnQuit");
                if (!button.outroom) {
                    // Tiep tuc muon choi
                    var pk = new CmdSendConnectRoom();
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();
                }

                break;
            }
            case GameState.ENDGAME: {
                if (!(inGameMgr.gameLogic._players[0]._ingame))
                    return;
                this.endgame();
                break;
            }
            case GameState.JACKPOT: {
                var jackpot = ccui.Helper.seekWidgetByName(this._layout, "jackpot");
                jackpot.setString(StringUtility.standartNumber(gamedata.jackpot) + "$");
                break;
            }
            case GameState.UPDATEMATH: {
                this.endgame();
                this._players[inGameMgr.gameLogic.convertChair(inGameMgr.gameLogic._roomOwner)]._uiHome.setVisible(true);
                this.updateStartButton();
                this.updateChoNguoiKhac();
                break;
            }
            case  GameState.NONE: {
                break;
            }
            case GameState.REASONQUIT: {
                if (inGameMgr.gameLogic._players[0]._chairInServer == data.chair) {
                    this.reason = data.reason;
                    cc.log("QUIT GAME VI1`   " + data.reason)
                }
                break;
            }
            case GameState.QUIT: {
                this.quitGame();
                break;
            }
        }

        inGameMgr.gameLogic._gameState = GameState.NONE;
    },
    quitGame: function () {

        // if (isIpad())
        //     cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.FIXED_HEIGHT);

        var layer = null;
        if (this._lastGUI == "ChooseRoomScene") {
            layer = ChooseRoomScene.className;
        } else {
            layer = LobbyScene.className;
        }

        var openLayer = SceneMgr.getInstance().openScene(layer);

        if (typeof this.reason == "undefined") {
            this.reason = 6;
        } else {
            var localize = "KICKROOM_";
            var reason = this.reason;
            var message = "";

            if (reason == 10 || reason == -1 || reason == 3 || reason == 0 || reason == 6 || reason == 2 || reason == 4 || reason == 1) {
                if (reason == -1) {
                    reason = 3;
                }

            } else
                reason = 6;

            localize += reason;
            message = localized(localize);

            if (reason == 0) {
                offerManager.kickInGame = true;
            }

            Toast.makeToast(3.5, message, openLayer);
            if (this.reason == 0) {
                var checkSupport = gamedata.checkInSpecialTimeSupport();
                if (checkSupport && checkSupport.error == 0) {
                    gamedata.showSupportBean(0, false);
                }
            }
        }


        inGameMgr.gameLogic = new GameLogic();
        inGameMgr.gameLogic.isEnterGame = " NOT INIT ENTER ";
        gameSound.playThoatban();
    },

    endgame: function () {
        sceneMgr.clearLoading();
        this.updateDockCard(-1);
        this.addBigbet(-1, false);
        var btnXep = this._layout.getChildByName("btnXepbai");
        btnXep.setVisible(false);

        this._players[0]._moveCard.setVisible(false);
        for (var i = 1; i < 4; i++) {
            this._players[i]._card.setVisible(false);
        }

        for (var i = 0; i < 4; i++) {
            this._players[i].removeKQ();
            this._players[i]._uiHome.setVisible(false);
            this._players[i].reset();
        }

        this._effect2D.clearEffect();

        inGameMgr.gameLogic._bigbet = false;
    },
    onButtonRelease: function (button, id) {
        switch (id) {
            case GameLayer.BTN_AVATAR_0:
            case GameLayer.BTN_AVATAR_1:
            case GameLayer.BTN_AVATAR_2:
            case GameLayer.BTN_AVATAR_3:
            case GameLayer.BTN_AVATAR_4: {
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
            case GameLayer.BTN_CHAT: {
                chatMgr.openChatGUI();
                break;
            }
            case GameLayer.BTN_EMO: {
                StorageManager.getInstance().openChatEmoGUI();
                break;
            }
            case GameLayer.BTN_QUIT: {

                var pk = new CmdSendQuitRoom();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                this.btnQuit.getChildByName("check").setVisible(!this.btnQuit.getChildByName("check").isVisible());

                break;
            }
            case GameLayer.BTN_GROUP: {
                if (this._players[0].canGetCard) {
                    var pk = new CmdSendCard();
                    pk.putData(-1);
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();

                    this.removeArrowGroup();
                    if (this._players[0].enemyCard && this._players[0].canGetCardFromEnemy) {
                        this._players[0].enemyCard.removeArrow();
                        this._players[0].enemyCard.removeEatable();

                    }

                    this._players[0].canGetCard = false;
                    this._players[0].canGetCardFromEnemy = false;
                }

                break;
            }
            case GameLayer.BTN_START: {
                var pk = new CmdSendStartGame();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                ccui.Helper.seekWidgetByName(this._layout, "btnStart").setVisible(false);
            }
                break;
            case GameLayer.BTN_XEPBAI: {
                this._effect2D.sapxepForPlayer(this._players[0]);
                break;
            }
            case GameLayer.BTN_DANH: {

                var cards = [];
                for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                    if (this._players[0]._handOnCards[i]._up) {
                        cards.push(this._players[0]._handOnCards[i]);
                    }
                }

                if (button.action == "danhbai") {
                    if (cards.length == 0) {
                        Toast.makeToast(1.5, "Bạn cần chọn quân bài để đánh nhé..", this)
                    } else if (cards.length > 1) {
                        Toast.makeToast(1.5, "Bạn chỉ đưuọc chọn 1 quân bài để đánh..", this)
                    } else {
                        var groupLogic = TalaGameRule.copyCardGroup(this._players[0]);
                        var cardCheck = new Card(cards[0].id);
                        cardCheck.isEaten = cards[0].m_IsEaten;
                        var cothevut = TalaGameRule.kiemtraVutQuan(groupLogic, cardCheck);
                        if (cothevut) {
                            var pk = new CmdSendDanhBai();
                            pk.putData(cards[0].id);
                            GameClient.getInstance().sendPacket(pk);
                            pk.clean();
                            ccui.Helper.seekWidgetByName(this._layout, "btnDanh").setVisible(false);
                        } else {
                            Toast.makeToast(1.5, "Đánh bài không hợp lệ ...", this)
                        }

                    }
                } else if (button.action == "habai") {
                    var allCards = TalaGameRule.copyCardGroup(this._players[0]);
                    var selectCards = new TalaGroupCard([]);
                    for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                        if (this._players[0]._handOnCards[i]._up) {
                            var card = new Card(this._players[0]._handOnCards[i].id);
                            card.isEaten = this._players[0]._handOnCards[i].m_IsEaten;
                            selectCards.cards.push(card);
                        }
                    }
                    var allSolls = TalaGameRule.kiemtraHaBai(allCards, selectCards);
                    if (allSolls.suit.length > 0) {
                        this.setActionButton("", false);
                        var cards = [];
                        for (var i = 0; i < this._players[0]._handOnCards.length; i++) {
                            if (this._players[0]._handOnCards[i]._up) {
                                cards.push(this._players[0]._handOnCards[i].id);
                            }
                        }
                        var pk = new CmdSendNotifyShowPhom();
                        pk.putData(inGameMgr.gameLogic._players[0]._chairInServer, cards);
                        GameClient.getInstance().sendPacket(pk);
                        pk.clean();
                    } else {
                        Toast.makeToast(1.5, "Hạ bài không hợp lệ...", this);
                    }
                } else if (button.action == "guibai") {
                    this.setActionButton("autosend", false);
                    for (var i = 0; i < 4; i++) {
                        for (var z = 0; z < this._players[i]._listPhom.length; z++) {
                            var idx = z;
                            if (idx != -1) {
                                var suit = new TalaSuit();
                                var maxID = 0;
                                for (var j = 0; j < this._players[i]._listPhom[idx].length; j++) {
                                    suit.cards.push(new Card(this._players[i]._listPhom[idx][j].id))
                                    if (this._players[i]._listPhom[idx][j].id > maxID)
                                        maxID = this._players[i]._listPhom[idx][j].id;
                                }
                                suit.genSuitType();
                                for (var j = 0; j < this._players[0]._handOnCards.length; j++) {
                                    if (TalaGameRule.kiemtraGuiBai(suit, new Card(this._players[0]._handOnCards[j].id))) {
                                        this._players[0]._handOnCards[j].removeArrow();
                                        this._players[i]._listPhom[idx][1].removeArrow();

                                        var senderChair = inGameMgr.gameLogic._players[0]._chairInServer;
                                        var senderCardID = this._players[0]._handOnCards[j].id;
                                        var targetChair = inGameMgr.gameLogic._players[i]._chairInServer;
                                        var targetCardID = maxID;

                                        var pk = new CmdSendGuibai();
                                        pk.putData(senderChair, senderCardID, targetChair, targetCardID);
                                        GameClient.getInstance().sendPacket(pk);
                                        pk.clean();
                                    }
                                }
                            }
                        }

                    }
                }

                break;
            }
            case GameLayer.BTN_BOLUOT: {
                var pk = new CmdSendDanhBai();
                pk.putData(true);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();
                ccui.Helper.seekWidgetByName(this._layout, "btnDanh").setVisible(false);
                ccui.Helper.seekWidgetByName(this._layout, "btnBoluot").stopAllActions();
                ccui.Helper.seekWidgetByName(this._layout, "btnBoluot").setOpacity(255);
                ccui.Helper.seekWidgetByName(this._layout, "btnBoluot").setVisible(false);

                this.stopAllActions();
                break;
            }
            case GameLayer.BTN_JACKPOT: {
                if (Config.ENABLE_CHEAT) {
                    this.onSendBot();
                    return;
                }
                var jackpot = new JackpotHelpGUI();
                this.addChild(jackpot, 100, 1);
                break;
            }
        }
    },
    addAutoStart: function (time) {

        this.stopAutoStart();
        var after = new cc.Sprite("common/afterTime.png");
        after.setPosition(this._layout.getContentSize().width / 2, this._layout.getContentSize().height / 2 + 107);
        this._layout.addChild(after, 20, 20);

        var chuc = Math.floor(time / 10);
        var donvi = Math.floor(time % 10);

        var sChuc = new cc.Sprite(this.getImgByNum(chuc));
        var sDonvi = new cc.Sprite(this.getImgByNum(donvi));

        this._layout.addChild(sChuc, 21, 21);
        this._layout.addChild(sDonvi, 22, 22);

        if (chuc == 0) {
            sChuc.setVisible(false);
            sDonvi.setPosition(this._layout.getContentSize().width / 2, this._layout.getContentSize().height / 2 + 70);
        } else {
            sChuc.setPosition(this._layout.getContentSize().width / 2 - 15, this._layout.getContentSize().height / 2 + 70);
            sDonvi.setPosition(this._layout.getContentSize().width / 2 + 15, this._layout.getContentSize().height / 2 + 70);
        }

        this.autoStart = time;

        this.callbackAuto = function () {
            this.autoStart--;
            if (this.autoStart < 0)
                return;
            var chuc = Math.floor(this.autoStart / 10);
            var donvi = Math.floor(this.autoStart % 10);

            var sChuc = this._layout.getChildByTag(21);
            var sDonvi = this._layout.getChildByTag(22);
            if (sChuc && sDonvi) {
                sChuc.setTexture(this.getImgByNum(chuc));
                sDonvi.setTexture(this.getImgByNum(donvi));

                if (chuc == 0) {
                    sChuc.setVisible(false);
                    sDonvi.setPosition(this._layout.getContentSize().width / 2, this._layout.getContentSize().height / 2 + 70);
                } else {
                    sChuc.setPosition(this._layout.getContentSize().width / 2 - 15, this._layout.getContentSize().height / 2 + 70);
                    sDonvi.setPosition(this._layout.getContentSize().width / 2 + 15, this._layout.getContentSize().height / 2 + 70);
                }
            }


        }

        after.runAction(new cc.RepeatForever(cc.sequence(cc.delayTime(1), cc.callFunc(this.callbackAuto.bind(this), this, null))));
    },
    stopAutoStart: function () {
        if (this._layout.getChildByTag(20)) {
            this._layout.getChildByTag(20).stopAllActions();
            this._layout.getChildByTag(20).removeFromParent();
        }
        if (this._layout.getChildByTag(21)) {
            this._layout.getChildByTag(21).removeFromParent();
        }
        if (this._layout.getChildByTag(22)) {
            this._layout.getChildByTag(22).removeFromParent();
        }
    },
    getImgByNum: function (num) {
        return "res/common/linhtinh/start_" + num + ".png";
    },

    setActionButton: function (action, visible) {
        var button = ccui.Helper.seekWidgetByName(this._layout, "btnDanh");
        button.action = action;
        button.setVisible(visible);

        button.getChildByName("arrow").setPositionY(69);
        button.getChildByName("arrow").stopAllActions();
        if (visible)
            button.getChildByName("arrow").runAction(cc.sequence(cc.moveBy(.2, cc.p(0, 15)), cc.moveBy(.2, cc.p(0, -15))).repeatForever());

        this._players[0].showPhom = false;
        if (button.action == "habai") {
            this._players[0].showPhom = true;
            button.loadTextures("res/Other/NewGameGUI/talaingame_0002_Group-1-copy-6.png", "res/Other/NewGameGUI/talaingame_0002_Group-1-copy-6.png", "res/Other/NewGameGUI/talaingame_0002_Group-1-copy-6.png");
        } else if (button.action == "danhbai") {
            button.loadTextures("res/Other/NewGameGUI/talaingame_0024_Group-1-copy-9.png", "res/Other/NewGameGUI/talaingame_0024_Group-1-copy-9.png", "res/Other/NewGameGUI/talaingame_0024_Group-1-copy-9.png");
        } else if (button.action == "guibai") {
            this._players[0].showPhom = true;
            button.loadTextures("res/Other/NewGameGUI/talaingame_0001_Group-1-copy-7.png", "res/Other/NewGameGUI/talaingame_0001_Group-1-copy-7.png", "res/Other/NewGameGUI/talaingame_0001_Group-1-copy-7.png");
        }
    },

    updateDockCard: function (number) {
        if (number < 0) {
            this._layout.getChildByName("btnGroup").setVisible(false);
            return;

        }
        this._layout.getChildByName("btnGroup").setVisible(true);
        if (number < 10)
            this._layout.getChildByName("btnGroup").getChildByName("number").setString("0" + number);
        else
            this._layout.getChildByName("btnGroup").getChildByName("number").setString("" + number);
    },
    rank: function (kq, mom) {
        for (var i = 0; i < kq.length; i++) {
            if (kq[i] == (inGameMgr.gameLogic.numberPlayer() - 1)) {
                kq[i] = 3;
            }
        }
        for (var i = 0; i < 4; i++) {
            var _localChair = inGameMgr.gameLogic.convertChair(i);
            if (_localChair == 0) {
                if (inGameMgr.gameLogic._players[0]._ingame && (inGameMgr.gameLogic._players[0]._status != 4)) {
                    var myRank = kq[i];
                    var rank__ = myRank;
                    if (mom[i]) {
                        myRank = -1;
                    }
                    this._players[0].displayKQ(myRank, -1);
                    if (rank__ == 0 && mom[i]) // Truong hop mom' all va` minh` ha. truoc'
                        myRank = 0;
                    this._players[0].myKQ(myRank, 5.5);      // hien thi man` hinh chinh
                }
            } else {
                if (inGameMgr.gameLogic._players[_localChair]._ingame && (inGameMgr.gameLogic._players[_localChair]._status != 4)) {
                    var myRank = kq[i];
                    if (mom[i]) {
                        myRank = -1;
                    }
                    this._players[_localChair].displayKQ(myRank, -1);
                }
            }
        }
    },
    createDataEndGame: function (kq, mom, money) {
        var dataendgame = [];

        for (var i = 0; i < kq.length; i++) {
            if (kq[i] == (inGameMgr.gameLogic.numberPlayer() - 1)) {
                kq[i] = 3;
            }
        }
        for (var i = 0; i < 4; i++) {
            var _localChair = inGameMgr.gameLogic.convertChair(i);
            if (_localChair == 0) {
                if (inGameMgr.gameLogic._players[0]._ingame && (inGameMgr.gameLogic._players[0]._status != 4)) {
                    var myRank = kq[i];
                    var rank__ = myRank;
                    if (mom[i]) {
                        myRank = -1;
                    }
                    this._players[0].displayKQ(myRank, -1);
                    if (rank__ == 0 && mom[i]) // Truong hop mom' all va` minh` ha. truoc'
                        myRank = 0;
                    //this._players[0].myKQ(myRank,5.5);      // hien thi man` hinh chinh
                    var obj = {};
                    obj["my"] = true;
                    obj["rank"] = myRank;
                    obj["id"] = "" + inGameMgr.gameLogic._players[0]._info["uName"];
                    obj["diem"] = 100;
                    obj["bichu"] = "mom";
                    obj["gold"] = (money[i] > 0 ? "+" : money[i] < 0 ? "-" : "") + StringUtility.pointNumber(money[i]);
                    dataendgame.push(obj);
                }
            } else {
                if (inGameMgr.gameLogic._players[_localChair]._ingame && (inGameMgr.gameLogic._players[_localChair]._status != 4)) {
                    var myRank = kq[i];
                    if (mom[i]) {
                        myRank = -1;
                    }
                    this._players[_localChair].displayKQ(myRank, -1);

                    var obj = {};
                    obj["my"] = false;
                    obj["rank"] = myRank;
                    obj["id"] = "" + inGameMgr.gameLogic._players[_localChair]._info["uName"];
                    obj["diem"] = 100;
                    obj["bichu"] = "mom";
                    obj["gold"] = (money[i] > 0 ? "+" : money[i] < 0 ? "-" : "") + StringUtility.pointNumber(money[i]);
                    dataendgame.push(obj);
                }
            }
        }
        return dataendgame;
    },
    updateOwnerRoom: function (_roomOwnerID) {
    },

    updateChoNguoiKhac: function () {
        if (inGameMgr.gameLogic.gamePlaying) {
            if (this.getChildByTag(25)) {
                this.getChildByTag(25).stopAllActions();
                this.getChildByTag(25).removeFromParent(true);
            }
            return;
        }

        if (inGameMgr.gameLogic.numberPlayer() < 2) {
            if (this.getChildByTag(25)) {
                this.getChildByTag(25).stopAllActions();
                this.getChildByTag(25).removeFromParent(true);
            }

            var animation = new cc.Animation();
            for (var i = 0; i < 4; i++) {
                animation.addSpriteFrameWithFile("res/common/animation/waitother/waitother_" + i + ".png");
            }
            animation.setDelayPerUnit(.085);

            var _wait = cc.Sprite.create("res/common/animation/waitother/waitother_0.png");
            _wait.setTag(25)
            this.addChild(_wait, 25);

            _wait.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 + 80);
            _wait.runAction(new cc.RepeatForever(cc.animate(animation)));
        } else {
            if (this.getChildByTag(25)) {
                this.getChildByTag(25).stopAllActions();
                this.getChildByTag(25).removeFromParent(true);
            }
        }
    },

    updateStartButton: function () {
        if (inGameMgr.gameLogic.gamePlaying || (inGameMgr.gameLogic._players[0]._status == 4)) {
            ccui.Helper.seekWidgetByName(this._layout, "btnStart").setVisible(false);
            if (this.getChildByTag(25)) {
                this.getChildByTag(25).stopAllActions();
                this.getChildByTag(25).removeFromParent(true);
            }
            return;
        }


        if (inGameMgr.gameLogic._roomOwner < 0) {
            ccui.Helper.seekWidgetByName(this._layout, "btnStart").setVisible(false);
            ccui.Helper.seekWidgetByName(this._layout, "btnCheat").setVisible(false);
            this.updateChoNguoiKhac();
            return;
        }

        if ((inGameMgr.gameLogic.convertChair(inGameMgr.gameLogic._roomOwner) == 0)
            && (inGameMgr.gameLogic.numberPlayer() >= 2)) {
            ccui.Helper.seekWidgetByName(this._layout, "btnStart").setVisible(true);
            ccui.Helper.seekWidgetByName(this._layout, "cheat2").setVisible(Config.ENABLE_CHEAT);
            ccui.Helper.seekWidgetByName(this._layout, "cheat1").setVisible(Config.ENABLE_CHEAT);
            ccui.Helper.seekWidgetByName(this._layout, "cheat2").setVisible(false);
            ccui.Helper.seekWidgetByName(this._layout, "cheat1").setVisible(false);
        } else {
            ccui.Helper.seekWidgetByName(this._layout, "btnStart").setVisible(false);
            ccui.Helper.seekWidgetByName(this._layout, "btnCheat").setVisible(false);
            ccui.Helper.seekWidgetByName(this._layout, "cheat2").setVisible(false);
            ccui.Helper.seekWidgetByName(this._layout, "cheat1").setVisible(false);

        }
    },

    addArrowGroup: function () {
        var arrow = this._layout.getChildByName("btnGroup").getChildByName("arrow");
        arrow.setVisible(true);
        arrow.runAction(cc.sequence(cc.moveBy(.2, cc.p(0, 15)), cc.moveBy(.2, cc.p(0, -15))).repeatForever());
    },
    removeArrowGroup: function () {
        var arrow = this._layout.getChildByName("btnGroup").getChildByName("arrow");
        arrow.stopAllActions();
        arrow.setPositionY(119);
        arrow.setVisible(false);
    },

    addBigbet: function (bigbet, direct) {
        var bb = this._layout.getChildByName("bigbet");
        var cuoclon = bb.getChildByName("cuoclon");
        if (bigbet <= 0) {
            bb.setVisible(false)
            return;
        }
        bb.setVisible(true);
        cuoclon.setString("" + bigbet);

        if (!direct) {
            cuoclon.setVisible(false);
            bb.runAction(cc.sequence(new cc.EaseElasticOut(cc.rotateBy(1.5, -360)), new cc.CallFunc(function (target) {
                var effect = new cc.ParticleSystem("res/Particles/bigbet.plist");
                effect.setPosition(cc.p(target.getContentSize().width / 2, target.getContentSize().height / 2));
                target.addChild(effect);
                target.getChildByName("cuoclon").setVisible(true);
            })));
        }

    },
    effectBigbet: function (playerIdx) {
        for (var i = 0; i < 5; i++) {
            var star = new cc.Sprite("res/common/yellowStarBig.png");
            var srcPos = this._effect2D.convertToNodeSpace(this._layout.getChildByName("bigbet").convertToWorldSpaceAR(cc.p(.5, 1)));
            srcPos.y -= this._layout.getChildByName("bigbet").getContentSize().height / 2;
            var destPos = this._effect2D.convertToNodeSpace(this._players[playerIdx]._panel.getChildByName("btn").convertToWorldSpaceAR(cc.p(.5, .5)));

            star.setPosition(srcPos);
            this._effect2D.addChild(star);
            star.setVisible(false);
            star.runAction(cc.sequence(cc.delayTime(i * .2), cc.show(), cc.spawn(cc.rotateBy(1, -90), cc.moveTo(1, destPos), cc.fadeOut(1)), cc.removeSelf()));
        }

    },

    onUseEmoticon: function(nChair, id, emoId) {
        var pView = this._players[inGameMgr.gameLogic.convertChair(nChair)];
        if (pView != null && sceneMgr.checkInBoard()) {
            pView.useEmoticon(id, emoId);
        }
    },

    getPosFromServerChair: function(chairInServer) {
        for (var i = 0; i < inGameMgr.gameLogic._players.length; i++) {
            try {
                if (inGameMgr.gameLogic._players[i]._chairInServer == chairInServer) {
                    return this._players[i].getPosAvatar();
                }
            }
            catch (e) {

            }
        }
        return cc.p(0, 0);
    },

    showLevelUp: function(cmd){
        var localChair = inGameMgr.gameLogic.convertChair(cmd.nChair);
        this._players[localChair].addLevelExp(cmd);
    },

    updateAvatarFrame: function(nChair, path) {
        var localChair = inGameMgr.gameLogic.convertChair(nChair);
        this._players[localChair].setAvatarFrame(path);
    },

    getAvatarPosition: function(index){
        return this._players[index].getAvatarPosition();
    }
});

GameLayer.effectCardMove = function (time, cardEff, card, scaleTo, destPos) {
    if (card) {
        card.stopAllActions();
        card.setVisible(false);
        card.runAction(cc.sequence(cc.delayTime(time), cc.show()));
    }

    var action1 = new cc.EaseSineInOut(cc.moveTo(time, destPos));
    var action2 = new cc.EaseSineInOut(cc.scaleTo(time, scaleTo));
    cardEff.runAction(cc.sequence(cc.spawn(action1, action2), cc.removeSelf()));
}

GameLayer.BTN_CAMERA = 1;
GameLayer.BTN_CHAT = 2;
GameLayer.BTN_EMO = 22;
GameLayer.BTN_QUIT = 3;
GameLayer.BTN_XEPBAI = 4;
GameLayer.BTN_BOLUOT = 5;
GameLayer.BTN_DANH = 6;
GameLayer.BTN_START = 7;
GameLayer.BTN_BAOSAM = 8;
GameLayer.BTN_HUYBAO = 9;
GameLayer.BTN_CHEAT = 10;
GameLayer.BTN_INVITE = 11;
GameLayer.BTN_GROUP = 17;

GameLayer.BTN_AVATAR_0 = 12;
GameLayer.BTN_AVATAR_1 = 13;
GameLayer.BTN_AVATAR_2 = 14;
GameLayer.BTN_AVATAR_3 = 15;
GameLayer.BTN_AVATAR_4 = 16;

GameLayer.BTN_MENU = 18;
GameLayer.BTN_JACKPOT = 19;

var BoardScene = GameLayer;

BoardScene.className = "BoardScene";

var JackpotHelpGUI = BaseLayer.extend({

    ctor: function () {
        this._super("JackpotHelpGUI");
        this.initWithBinaryFile("TalaJackpotHelp.json");
    },

    customizeGUI: function () {
        var bg = this.getControl("bg");
        this.customizeButton("close", 1, bg);

        this.setShowHideAnimate(bg, true);
        this.setBackEnable(true);
        this.setFog(true);
    },

    onBack: function () {
        this.onClose();
    },

    onButtonRelease: function (btn, id) {
        this.onClose();
    }
});