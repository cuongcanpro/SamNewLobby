/**
 * Created by HunterPC on 1/5/2016.
 */

var InGameMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
    },

    init: function () {
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Other/Animation/Anchot/skeleton.xml","Anchot");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Other/Animation/Anchot/texture.plist", "Anchot");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Other/Animation/Bet/skeleton.xml","Bet");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Other/Animation/Bet/texture.plist", "Bet");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Other/Animation/Nhi/skeleton.xml","Nhi");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Other/Animation/Nhi/texture.plist", "Nhi");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Other/Animation/My/Nhi_ba/skeleton.xml","Nhi_ba");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Other/Animation/My/Nhi_ba/texture.plist", "Nhi_ba");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Other/Animation/Ukhan/skeleton.xml","Ukhan");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Other/Animation/Ukhan/texture.plist", "Ukhan");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Other/Animation/My/Bet_mom/skeleton.xml","Bet_mom");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Other/Animation/My/Bet_mom/texture.plist", "Bet_mom");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Other/Animation/My/Nhat_U/skeleton.xml","Nhat_U");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Other/Animation/My/Nhat_U/texture.plist", "Nhat_U");

    },

    onReceived: function (cmd, pkg) {
        cc.log("BoardListener::onReceived " + cmd);

        switch (cmd) {
            case InGameMgr.CMD_JOIN_ROOM_SUCCESS:
            {
                var join = new CmdReceivedJoinRoomSuccess(pkg);
                cc.log("CMD_JOIN_ROOM_SUCCESS: " + JSON.stringify(join));
                inGameMgr.gameLogic = new GameLogic();
                inGameMgr.gameLogic.isEnterGame = " JOIN ROOM ";
                inGameMgr.gameLogic.initWith(join);

                try {
                    //cc.view.setDesignResolutionSize(800, 480, cc.ResolutionPolicy.FIXED_HEIGHT);
                    // if(isIpad())
                    //     cc.view.setDesignResolutionSize(800, 480, cc.ResolutionPolicy.FIXED_WIDTH);
                    inGameMgr.gameLogic.saveData = join;
                    var gameLayer = SceneMgr.getInstance().openScene(BoardScene.className);
                    gameLayer.initData = join;
                    gameLayer._lastGUI = sceneMgr.getRunningScene().getMainLayer()._id;
                    join.clean();
                } catch (e) {
                    cc.log("ERROR " + e.stack);
                    cc.sys.localStorage.setItem(Config.KEY_LAST_ERROR, "cant_open_JOIN_ROOM_SUCCESS" + e);
                }

                sceneMgr.clearLoading();
                break;
            }
            case InGameMgr.CMD_UPDATEGAMEINFO:
            {
                var continuePlay = new CmdReceivedGameInfo(pkg);
                inGameMgr.gameLogic = new GameLogic();
                inGameMgr.gameLogic.isEnterGame = " CONTINUE GAME ";
                inGameMgr.gameLogic.continueWith(continuePlay);
                inGameMgr.gameLogic.saveData = continuePlay;

                if(isIpad())
                    cc.view.setDesignResolutionSize(800, 480, cc.ResolutionPolicy.FIXED_WIDTH);

                if(sceneMgr.getRunningScene().getMainLayer() instanceof GameLayer)
                {
                    try {
                        var gameLayer = new GameLayer();
                        gameLayer._lastGUI = "LobbyScene";
                        gameLayer.saveData = continuePlay;
                        cc.director.runScene(makeScene(gameLayer));
                    } catch (e) {
                        cc.sys.localStorage.setItem(Config.KEY_LAST_ERROR, "cant_open_CMD_UPDATEGAMEINFO " + e);
                    }
                }
                else
                {
                    try {
                        var gameLayer = SceneMgr.getInstance().openScene(BoardScene.className);
                        gameLayer._lastGUI = "LobbyScene";
                        gameLayer.saveData = continuePlay;
                    } catch (e) {
                        cc.sys.localStorage.setItem(Config.KEY_LAST_ERROR, "cant_open_update_game_already_in_game " + e);
                    }
                }
                continuePlay.clean();
                if(GameClient.connectLai)
                {
                    Toast.makeToast(2.5,"Kết nối lại hệ thống thành công",gameLayer);
                    GameClient.connectLai = false;
                }
                break;
            }
            case InGameMgr.CMD_USER_JOIN_ROOM:        // User vao` phong`
            {
                var join = new CmdReceivedUserJoinRoom(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.userJoinRoom(join);
                    sceneMgr.updateCurrentGUI(join);
                }
                join.clean();
                break;
            }
            case InGameMgr.CMD_UPDATEJACKPOT:
            {
                var join = new CmdUpdateJackpot(pkg);
                cc.log("JACK POT " + join.jackpot);
                if(gamedata && inGameMgr.gameLogic)
                {
                    inGameMgr.gameLogic.jackpot(join);
                }
                if(gamedata)
                    gamedata.jackpot = join.jackpot;
                join.clean();
                if(sceneMgr.getRunningScene().getMainLayer() instanceof GameLayer)
                    sceneMgr.updateCurrentGUI(join);
                break;
            }
            case InGameMgr.CMD_USERVIEW:          // User view game
            {
                var join = new CmdReceivedUserView(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.userView(join);

                    sceneMgr.updateCurrentGUI(join);
                }
                join.clean();
                break;
            }
            case InGameMgr.CMD_UPDATE_OWNERROOM:
            {
                var pk = new CmdReceivedUpdateOwnerRoom(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.updateOwnerRoom(pk);

                    sceneMgr.updateCurrentGUI(pk);

                }
                break;
            }
            case InGameMgr.CMD_VIEWGAMEINFO:          // minh` xem game info
            {
                var auto = new CmdReceivedViewGameInfo(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.viewgame(auto);

                    sceneMgr.updateCurrentGUI(auto);
                }
                auto.clean();
                break;
            }
            case InGameMgr.CMD_AUTO_START:
            {
                var auto = new CmdReceivedAutoStart(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.autoStart(auto);

                    sceneMgr.updateCurrentGUI(auto);
                }
                auto.clean();
                break;
            }
            case InGameMgr.CMD_USERTAKECHAIR:
            {
                var pk = new CmdReceivedUserTakeChair(pkg)
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.userTakeChair(pk);

                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_NOTIFYSTART:
            {
                var pk = new CmdReceivedNotifyStartGame(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.notifyStart(pk);
                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_UPDATE_MY_CARD:
            {
                var pk = new CmdReceivedUpdateMyCard(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.updateMyCard(pk);
                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();

                break;
            }
            case InGameMgr.CMD_CHANGETURN:
            {
                var pk = new CmdReceivedChangeTurn(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.changeturn(pk);
                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_OUTROOM:
            {
                var pk = new CmdReceivedOutRoomResult(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.outroom(pk);

                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_RECEIVEDCARD:
            {
                if (sceneMgr.checkInBoard()) {
                    var pk = new CmdReceivedGetCard(pkg);
                    if (inGameMgr.gameLogic) {
                        inGameMgr.gameLogic.getCard(pk);

                        sceneMgr.updateCurrentGUI(pk);
                    }
                    pk.clean();
                }
                break;
            }
            case InGameMgr.CMD_DANHBAI:
            {
                if (sceneMgr.checkInBoard()) {
                    var pk = new CmdReceivedThrowCard(pkg);
                    if(inGameMgr.gameLogic) {
                        inGameMgr.gameLogic.danhbai(pk);
                        sceneMgr.updateCurrentGUI(pk);
                    }
                    pk.clean();
                }
                break;
            }
            case InGameMgr.CMD_REQUEST_SHOWPHOM:
            {
                if (sceneMgr.checkInBoard()) {
                    var pk = new CmdReceivedRequestShowPhom(pkg);
                    if (inGameMgr.gameLogic) {
                        inGameMgr.gameLogic.requestShowPhom(pk);
                        sceneMgr.updateCurrentGUI(pk);
                    }
                    pk.clean();
                }
                break;
            }
            case InGameMgr.CMD_HAPHOM:
            {
                if (sceneMgr.checkInBoard()) {
                    var pk = new CmdReceivedHaPhom(pkg);
                    if (inGameMgr.gameLogic) {
                        inGameMgr.gameLogic.haphom(pk);
                        sceneMgr.updateCurrentGUI(pk);
                    }
                    pk.clean();
                }
                break;
            }
            case InGameMgr.CMD_QUIT_ROOM:
            {
                var pk = new CmdReceivedUserExitRoom(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.userLeave(pk)

                    sceneMgr.updateCurrentGUI(pk);

                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_QUIT_REASON:
            {
                var pk = new CmdReceivedQuitroomReason(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic._gameState = GameState.REASONQUIT;
                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_QUIT_ROOM_SUCCESS:
            {
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.quitRoom();
                    sceneMgr.updateCurrentGUI(pk);
                }
                break;
            }
            case InGameMgr.CMD_RATE_BIGBET:
            {
                var pk = new CmdReceivedRateBigbet(pkg)
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.rateBigbet(pk);

                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_GAME_RESULT:
            {
                var pk = new CmdReceivedGameResult(pkg)
                if(inGameMgr.gameLogic)
                {
                    inGameMgr.gameLogic.gameresult(pk);

                    sceneMgr.updateCurrentGUI(pk);

                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_TAILUOT:
            {
                var pk = new CmdReceivedTailuot(pkg)
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.tailuot(pk);

                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_REQUEST_GUIBAI:
            {
                var pk = new CmdReceivedRequestGuibai(pkg)
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.requestguibai(pk);

                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_GUIBAI:
            {
                var pk = new CmdReceivedGuibai(pkg)
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.guibai(pk);

                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_U:
            {
                var pk = new CmdReceivedU(pkg)
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.u(pk);

                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_ENDGAME:
            {
                var pk = new CmdReceivedEndGame(pkg)
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.endgame(pk);

                    sceneMgr.updateCurrentGUI(pk);

                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_UPDATEMATH:
            {
                var pk = new CmdReceivedUpdateMath(pkg)
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.updateMath(pk)

                    sceneMgr.updateCurrentGUI(pk);

                }
                pk.clean();
                break;
            }
            case InGameMgr.CMD_JACKPOT:
            {
                var pk = new CmdReceivedJackpot(pkg);
                if(inGameMgr.gameLogic) {
                    inGameMgr.gameLogic.jackpot(pk)

                    sceneMgr.updateCurrentGUI(pk);
                }
                pk.clean();
                break;
            }
        }
    },

    checkInBoard: function () {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        return (gui instanceof BoardScene);
    },
});


InGameMgr.instance = null;
InGameMgr.getInstance = function () {
    if (!InGameMgr.instance) {
        InGameMgr.instance = new InGameMgr();
    }
    return InGameMgr.instance;
};
var inGameMgr = InGameMgr.getInstance();

InGameMgr.CMD_JOIN_ROOM_SUCCESS =  3005
InGameMgr.CMD_UPDATEJACKPOT = 2007
InGameMgr.CMD_QUIT_ROOM = 3008
InGameMgr.CMD_QUIT_REASON = 3010
InGameMgr.CMD_QUIT_ROOM_SUCCESS = 3009
InGameMgr.CMD_AUTO_START = 3012
InGameMgr.CMD_STARTGAME = 3013
InGameMgr.CMD_NOTIFYSTART = 3014
InGameMgr.CMD_RATE_BIGBET = 3300
InGameMgr.CMD_UPDATE_MY_CARD = 3022
InGameMgr.CMD_CHANGETURN = 3023
InGameMgr.CMD_RECEIVEDCARD = 3017
InGameMgr.CMD_HAPHOM = 3019
InGameMgr.CMD_REQUEST_SHOWPHOM = 3024
InGameMgr.CMD_TAILUOT = 3020
InGameMgr.CMD_GUIBAI = 3021
InGameMgr.CMD_U = 3025
InGameMgr.CMD_GAME_RESULT = 3026
InGameMgr.CMD_REQUEST_GUIBAI = 3027
InGameMgr.CMD_ENDGAME = 3015
InGameMgr.CMD_JACKPOT = 3056
InGameMgr.CMD_USERTAKECHAIR = 3028
InGameMgr.CMD_USERVIEW = 3029
InGameMgr.CMD_OUTROOM = 3911
InGameMgr.CMD_USER_JOIN_ROOM =  3004
InGameMgr.CMD_UPDATE_OWNERROOM =  3011
InGameMgr.CMD_DANHBAI = 3018
InGameMgr.CMD_VIEWGAMEINFO = 3101
InGameMgr.CMD_UPDATEMATH = 3031
InGameMgr.CMD_UPDATEGAMEINFO = 3061
InGameMgr.CMD_CHEAT_BOT = 3117;