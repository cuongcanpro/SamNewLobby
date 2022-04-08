var InGameMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
    },

    preloadResource: function () {
        var game_animations = [
            {folderpath:"res/Armatures/light/",skeleton:"skeleton.xml",texture:"texture.plist",key:"BG_light_bai"},
            {folderpath:"res/Armatures/jackpot/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Jackpot"},
            {folderpath:"res/Armatures/bang/",skeleton:"skeleton.xml",texture:"texture.plist",key:"BangJackpot"},
            {folderpath:"res/Armatures/diamond/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Diamond"},
            {folderpath:"res/Armatures/getjackpot/",skeleton:"skeleton.xml",texture:"texture.plist",key:"GetJackpot"},
            {folderpath:"res/Armatures/jackpotlogo/",skeleton:"skeleton.xml",texture:"texture.plist",key:"JackpotLogo"},
            {folderpath:"res/Armatures/smalldiamond/",skeleton:"skeleton.xml",texture:"texture.plist",key:"SmallDiamond"},
            {folderpath:"res/Armatures/tranDiamond/",skeleton:"skeleton.xml",texture:"texture.plist",key:"TranDiamond"},
            {folderpath:"res/Armatures/bang1/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Bang1"},
            {folderpath:"res/Armatures/fivediamond/",skeleton:"skeleton.xml",texture:"texture.plist",key:"FiveDiamond"},
            {folderpath:"res/Armatures/Shuffle/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Shuffle"},
            {folderpath:"res/Board/Animation/pointer/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Pointer"}
        ];

        for (var i in game_animations) {
            db.DBCCFactory.getInstance().loadDragonBonesData(game_animations[i].folderpath + game_animations[i].skeleton, game_animations[i].key);
            db.DBCCFactory.getInstance().loadTextureAtlas(game_animations[i].folderpath + game_animations[i].texture, game_animations[i].key);
        }
    },

    init: function () {
        this.preloadResource();
        dispatcherMgr.addListener(UserMgr.EVENT_UPDATE_MONEY, this, this.updateMoney);
    },

    onReceived: function (cmd, p) {
        switch (cmd) {
            case InGameMgr.CMD_JOIN_ROOM_SUCCESS: {
                var join = new CmdReceivedJoinRoomSuccess(p);
                this.gameLogic = new GameLogic();
                this.gameLogic.initWith(join);
                cc.log("CMD_JOIN_ROOM_SUCCESS: ", JSON.stringify(join));

                var curGui = sceneMgr.getRunningScene().getMainLayer();
                if (cc.sys.isNative) {
                    sceneMgr.openScene(GameLayer.className, curGui._id, true);
                } else {
                    this.loading = sceneMgr.addLoading(LocalizedString.to("LOADING"), true, this);
                    this.loading.setTag(LOADING_TAG);

                    sceneMgr.openScene(GameLayer.className, curGui._id, true);

                }

                join.clean();
                //if(boardScene) boardScene.joinRoom(pkJoin);
                //SceneMgr.getInstance().openWithScene(gameLayer);
                return true;
            }
            case InGameMgr.CMD_REG_QUIT: {
                var reg = new CmdReceivedRegQuitRoom(p);
                if (reg.reg) {
                    Toast.makeToast(2.5, "Bạn sẽ được thoát khỏi phòng khi ván chơi kết thúc. Nhấn lần nữa để hủy!!!");
                    gameSound.playDkThoat();
                }
                else {
                    Toast.makeToast(2.5, "Bạn đã hủy đăng ký rời phòng...");
                    gameSound.playHuyThoat();
                }

                return true;
            }
            case InGameMgr.CMD_UPDATEGAMEINFO: {
                var continuePlay = new CmdReceivedGameInfo(p);
                this.gameLogic = new GameLogic();
                this.gameLogic.continueWith(continuePlay);


                var gameLayer = new GameLayer();
                if (GameClient.connectLai) {
                    Toast.makeToast(2.5, "Kết nối lại hệ thống thành công", gameLayer);
                    GameClient.connectLai = false;

                }

                if (sceneMgr.getRunningScene().getMainLayer() instanceof GameLayer) {
                    cc.director.runScene(makeScene(gameLayer));
                }
                else {
                    this.loading = sceneMgr.addLoading(LocalizedString.to("LOADING"), true, this);
                    this.loading.setTag(LOADING_TAG);
                    sceneMgr.openScene(GameLayer.className);
                }

                continuePlay.clean();
                return true;
            }
            case InGameMgr.CMD_USER_JOIN_ROOM:
            {
                var join = new CmdReceivedUserJoinRoom(p);
                this.gameLogic.userJoinRoom(join);
                join.clean();

                sceneMgr.updateCurrentGUI();
                return true;
            }
            case InGameMgr.CMD_UPDATE_OWNERROOM:
            {
                var pk = new CmdReceivedUpdateOwnerRoom(p);
                this.gameLogic.updateOwnerRoom(pk);

                sceneMgr.updateCurrentGUI(pk);
                return true;
            }
            case InGameMgr.CMD_AUTO_START:
            {
                var auto = new CmdReceivedAutoStart(p);
                this.gameLogic.autoStart(auto);
                cc.log("InGameMgr.CMD_AUTO_START", JSON.stringify(auto));

                sceneMgr.updateCurrentGUI(auto);
                auto.clean();
                return true;
            }
            case InGameMgr.CMD_FIRSTTURN:
            {
                var pk = new CmdReceivedFirstTurn(p);
                this.gameLogic.firstTurn(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_CHIABAI:
            {
                var pk = new CmdReceivedChiaBai(p);
                cc.log("CMD_CHIABAI " + JSON.stringify(pk));
                this.gameLogic.chiabai(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();

                return true;
            }
            case InGameMgr.CMD_DANHBAI:
            {
                var pk = new CmdReceivedDanhBai(p);
                cc.log("CMD_DANHBAI " + JSON.stringify(pk));
                this.gameLogic.danhbai(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();

                return true;
            }
            case InGameMgr.CMD_BOLUOT:
            {
                var pk = new CmdReceivedBoluot(p);
                this.gameLogic.boluot(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_CHANGETURN:
            {
                var pk = new CmdReceivedChangeTurn(p);
                this.gameLogic.changeturn(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_QUIT_ROOM:
            {
                var pk = new CmdReceivedUserExitRoom(p);
                this.gameLogic.userLeave(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_QUIT_REASON:
            {
                var pk = new CmdReceivedQuitroomReason(p);
                this.gameLogic._gameState = GameState.REASONQUIT;
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_QUIT_ROOM_SUCCESS:
            {
                this.gameLogic.quitRoom();
                sceneMgr.updateCurrentGUI();
                return true;
            }
            case InGameMgr.CMD_QUYETDINHSAM:
            {
                var pk = new CmdReceivedQuyetDinhSam(p);
                this.gameLogic.quyetdinhsam(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_BAOSAM:
            {
                var pk = new CmdReceivedBaoSam(p);
                this.gameLogic.baosam(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_HUYBAOSAM:
            {
                var pk = new CmdReceivedHuyBaoSam(p);
                this.gameLogic.huybaosam(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_CHATCHONG:
            {
                var pk = new CmdReceivedChatChong(p);
                this.gameLogic.chatchong(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_ENDGAME:
            {
                var pk = new CmdReceivedEndGame(p);
                cc.log("CMD_ENDGAME:", JSON.stringify(pk));

                setTimeout(function () {
                    inGameMgr.gameLogic.endgame();
                    sceneMgr.updateCurrentGUI(pk);
                }, 1000 * PlayerView.TIME_DELAY_ENDGAME_PACKET);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_UPDATEMATH:
            {
                var pk = new CmdReceivedUpdateMath(p);
                this.gameLogic.updateMath(pk);
                cc.log("InGameMgr.CMD_UPDATEMATH", JSON.stringify(pk));

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_RECEIVE_JACKPOT:
            {
                var pk = new CmdReceivedJackpot(p);
                this.gameLogic.jackpot(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case InGameMgr.CMD_GETPLAYERS:
            {
                var pk = new CmdReceivedGetPlayers(p);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
        }
        return false;
    },

    checkInBoard: function () {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        return (gui instanceof BoardScene);
    },

    updateMoney: function (key, update) {
        if (this.checkInBoard() && this.gameLogic) {
            var localChair = this.gameLogic.convertChair(update.nChair);
            if ((localChair >= 0) && (localChair <= 4) && (this.gameLogic._players[localChair]._info)) {
                this.gameLogic._players[localChair]._info["bean"] = update.bean;
                this.gameLogic._players[localChair]._info["exp"] = update.levelScore;
                this.gameLogic._players[localChair]._info["winCount"] = update.winCount;
                this.gameLogic._players[localChair]._info["lostCount"] = update.lostCount;
                this.gameLogic._players[localChair]._info["level"] = update.level;
                this.gameLogic._players[localChair]._info["levelExp"] = update.levelExp;
                this.gameLogic._players[localChair]._info["diamond"] = update.diamond;
                this.gameLogic._players[localChair]._active = true;
            }
            this.gameLogic._gameState = GameState.NONE;
            var gui = sceneMgr.getRunningScene().getMainLayer();
            gui.onUpdateGUI();
        }
    }
})

InGameMgr.instance = null;
InGameMgr.getInstance = function () {
    if (!InGameMgr.instance) {
        InGameMgr.instance = new InGameMgr();
    }
    return InGameMgr.instance;
};
var inGameMgr = InGameMgr.getInstance();


InGameMgr.CMD_QUIT_ROOM = 3008;
InGameMgr.CMD_QUIT_REASON = 3010;
InGameMgr.CMD_QUIT_ROOM_SUCCESS = 3009;
InGameMgr.CMD_AUTO_START = 3107;
InGameMgr.CMD_STARTGAME = 3102;
InGameMgr.CMD_USER_JOIN_ROOM = 3004;
InGameMgr.CMD_UPDATE_OWNERROOM = 3011;
InGameMgr.CMD_FIRSTTURN = 3108;
InGameMgr.CMD_CHIABAI = 3105;
InGameMgr.CMD_CHEATBAI = 3115;

InGameMgr.CMD_GET_INFO_CLIENT = 3205;
InGameMgr.CMD_REG_QUIT = 3026;

InGameMgr.CMD_DANHBAI = 3101;
InGameMgr.CMD_BOLUOT = 3106;
InGameMgr.CMD_CHANGETURN = 3112;
InGameMgr.CMD_BAOSAM = 3109;
InGameMgr.CMD_HUYBAOSAM = 3114;
InGameMgr.CMD_QUYETDINHSAM = 3100;
InGameMgr.CMD_ENDGAME = 3103;
InGameMgr.CMD_UPDATEMATH = 3053;
InGameMgr.CMD_UPDATEGAMEINFO = 3110;
InGameMgr.CMD_CHATCHONG = 3113;
InGameMgr.CMD_HOLD = 3116;
InGameMgr.CMD_NEW_USER_JOIN = 3004;
InGameMgr.CMD_JOIN_ROOM_SUCCESS = 3005;
InGameMgr.CMD_ADD_BOT = 3117;
InGameMgr.CMD_GETPLAYERS = 3200;