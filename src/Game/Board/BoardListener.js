/**
 * Created by HunterPC on 1/5/2016.
 */

var hasJackpot = false;
var BoardListener = cc.Class.extend({

    ctor: function () {

    },

    onReceived: function (cmd, p) {
        if (cmd !== 25004){
            cc.log("BoardListener::onReceived " + cmd);
        }

        var board = sceneMgr.getRunningScene().getMainLayer();
        switch (cmd) {
            case CMD.CMD_JACKPOT_INFO:
            {

                var jackpot = new CmdJackpotInfo(p);
                jackpot.jackpotPacket = true;
                if (!gamedata.jackpot[1] || gamedata.jackpot[1][gamedata.selectedChanel] != jackpot.diamond[gamedata.selectedChanel] ||
                    gamedata.jackpot[0][gamedata.selectedChanel] != jackpot.gold[gamedata.selectedChanel]) {
                    //cc.log("T log day nay");
                    //cc.log("dddddddddddd", JSON.stringify(gamedata.jackpot));
                    gamedata.jackpot = [jackpot.gold, jackpot.diamond];
                    //cc.log("dddddddddddd", JSON.stringify(gamedata.jackpot));
                    if (board.updateJackpotGUI)
                        board.updateJackpotGUI();
                    var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
                    if (jackpotGui instanceof JackpotGUI)
                        jackpotGui.onUpdateGUI();
                }
                //cc.log("ddd", gamedata.selectedChanel, jackpot.diamond[gamedata.selectedChanel]);
                jackpot.clean();
                break;
            }
            case CMD.CMD_GET_GEM:
            {
                hasJackpot = true;
                sceneMgr.openGUI(JackpotWinGUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
                UPDATING_JACKPOT = true;
                cc.log("jackpotwinpacket");
                var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
                if (jackpotGui)
                    jackpotGui.onUpdateGUI();
                break;
            }
            case CMD.CMD_GET_JACKPOT:
            {
                hasJackpot = true;
                var jackpot = new CmdGetJackpot(p);
                jackpot.jackpotPacket = true;
                if (gamedata.gameLogic && jackpot.chair == gamedata.gameLogic._myChair) {
                    sceneMgr.openGUI(JackpotWin5GUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
                    var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
                    if (jackpotGui)
                        jackpotGui.onUpdateGUI("win5", jackpot);
                } else if (gamedata.gameLogic && jackpot.chair != gamedata.gameLogic._myChair) {
                    sceneMgr.openGUI(JackpotInBoardGUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
                    var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
                    if (jackpotGui)
                        jackpotGui.onUpdateGUI(jackpot);
                }
                jackpot.clean();
                break;
            }
            case CMD.CMD_NOTIFY_GET_GEM:
            {
                var text = new CmdNotifyGetGem(p);
                var config = CommonLogic.getJackpotConfig(text.channel);
                if (!hasJackpot)
                    Toast.makeToast(Toast.LONG, text.username + " đã nhận được một viên " + config.text);
                hasJackpot = false;
                break;
            }
            case CMD.CMD_NOTIFY_GET_JACKPOT:
            {
                var text = new CmdNotifyGetJackpot(p);
                var config = CommonLogic.getJackpotConfig(text.channel);
                if (!hasJackpot)
                    Toast.makeToast(Toast.LONG, "Chúc mừng người chơi " + text.username + " đã nhận được JACKPOT $" + StringUtility.pointNumber(text.jackpot) + " của kênh " + config.name);
                hasJackpot = false;
                break;
            }

            case CMD.CMD_JOIN_ROOM_SUCCESS:
            {
                var join = new CmdReceivedJoinRoomSuccess(p);
                gamedata.gameLogic = new GameLogic();
                gamedata.gameLogic.initWith(join);

                //var gameLayer = new GameLayer();
                //gameLayer._lastGUI = sceneMgr.getRunningScene().getMainLayer()._id;
                //sceneMgr.openScene(GameLayer.className);

                //var isIpad = (cc.winSize.width / cc.winSize.height) <= 4/3 && (cc.winSize.width > 480) && (cc.sys.isNative);
                //if(isIpad)
                //{
                //    cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.FIXED_WIDTH);
                //}

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
                break;
            }
            case CMD.JOIN_ROOM_FAIL:
            {

                var join = new CmdReceivedJoinRoomFail(p);
                //cc.log("fail " + join.reason + "    " + sceneMgr.getRunningScene().getMainLayer()._id);
                sceneMgr.clearLoading();
                join.clean();
                if (sceneMgr.getRunningScene().getMainLayer() instanceof GameLayer) {

                    sceneMgr.showOkCancelDialog("Thông báo", "Kết nối lại bàn chơi thất bại", null, function () {
                        sceneMgr.getRunningScene().getMainLayer().quitGame();
                    }).setOKButton();
                }
                else {
                    sceneMgr.showOkCancelDialog("Thông báo", "Bạn không thể vào bàn chơi này", null, null).setOKButton();
                }

                break;
            }
            case CMD.CMD_REG_QUIT:      // Dang ky roi phong`
            {
                var reg = new CmdReceivedRegQuitRoom(p);
                if (reg.reg) {
                    Toast.makeToast(2.5, "Bạn sẽ được thoát khỏi phòng khi ván chơi kết thúc. Nhấn lần nữa để hủy!!!");
                    gameSound.playDkThoat();
                }
                else {
                    Toast.makeToast(2.5, "Bạn đã hủy đăng ký rời phòng...");
                    gameSound.playHuyThoat();
                }

                break;
            }
            case CMD.CMD_UPDATEGAMEINFO:
            {
                //var isIpad = (cc.winSize.width / cc.winSize.height) <= 4/3 && (cc.winSize.width > 480) && (cc.sys.isNative);
                //if(isIpad)
                //{
                //    cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.FIXED_WIDTH);
                //}

                var continuePlay = new CmdReceivedGameInfo(p);
                gamedata.gameLogic = new GameLogic();
                gamedata.gameLogic.continueWith(continuePlay);


                var gameLayer = new GameLayer();
                gameLayer._lastGUI = "LobbyScene";
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
                break;
            }
            case CMD.CMD_USER_JOIN_ROOM:
            {
                var join = new CmdReceivedUserJoinRoom(p);
                gamedata.gameLogic.userJoinRoom(join);
                join.clean();

                sceneMgr.updateCurrentGUI();
                break;
            }
            case CMD.CMD_UPDATE_OWNERROOM:
            {
                var pk = new CmdReceivedUpdateOwnerRoom(p);
                gamedata.gameLogic.updateOwnerRoom(pk);

                sceneMgr.updateCurrentGUI(pk);
                break;
            }
            case CMD.CMD_AUTO_START:
            {
                var auto = new CmdReceivedAutoStart(p);
                gamedata.gameLogic.autoStart(auto);

                sceneMgr.updateCurrentGUI(auto);
                auto.clean();
                break;
            }
            case CMD.CMD_FIRSTTURN:
            {
                var pk = new CmdReceivedFirstTurn(p);
                gamedata.gameLogic.firstTurn(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_CHIABAI:
            {
                var pk = new CmdReceivedChiaBai(p);
                cc.log("CMD_CHIABAI " + JSON.stringify(pk));
                gamedata.gameLogic.chiabai(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();

                break;
            }
            case CMD.CMD_DANHBAI:
            {
                var pk = new CmdReceivedDanhBai(p);
                cc.log("CMD_DANHBAI " + JSON.stringify(pk));
                gamedata.gameLogic.danhbai(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();

                break;
            }
            case CMD.CMD_BOLUOT:
            {
                var pk = new CmdReceivedBoluot(p);
                gamedata.gameLogic.boluot(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_CHANGETURN:
            {
                var pk = new CmdReceivedChangeTurn(p);
                gamedata.gameLogic.changeturn(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_QUIT_ROOM:
            {
                var pk = new CmdReceivedUserExitRoom(p);
                gamedata.gameLogic.userLeave(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_QUIT_REASON:
            {
                var pk = new CmdReceivedQuitroomReason(p);
                gamedata.gameLogic._gameState = GameState.REASONQUIT;
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_QUIT_ROOM_SUCCESS:
            {
                gamedata.gameLogic.quitRoom();
                sceneMgr.updateCurrentGUI(pk);
                break;
            }
            case CMD.CMD_CREATE_ROOM:
            {
                sceneMgr.clearLoading();
                if (packet.getError() == 4) {
                    sceneMgr.showOKDialog("Thông báo", "Mỗi lần tạo bàn phải cách nhau 10 giây nhé...", null, null);
                }
                else if (packet.getError() == 1) {
                    sceneMgr.showYesNoDialog("Thông báo", "Tạo bàn lỗi --- tiền của bạn quá nhỏ", null, null).setOKButton();
                }
                break;
            }
            case CMD.CMD_QUYETDINHSAM:
            {
                var pk = new CmdReceivedQuyetDinhSam(p);
                gamedata.gameLogic.quyetdinhsam(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_BAOSAM:
            {
                var pk = new CmdReceivedBaoSam(p);
                gamedata.gameLogic.baosam(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_HUYBAOSAM:
            {
                var pk = new CmdReceivedHuyBaoSam(p);
                gamedata.gameLogic.huybaosam(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_CHATCHONG:
            {
                var pk = new CmdReceivedChatChong(p);
                gamedata.gameLogic.chatchong(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_ENDGAME:
            {
                var pk = new CmdReceivedEndGame(p);
                gamedata.gameLogic.endgame(pk);
                cc.log("CMD_ENDGAME:", JSON.stringify(pk));

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_UPDATEMATH:
            {
                var pk = new CmdReceivedUpdateMath(p);
                gamedata.gameLogic.updateMath(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_RECEIVE_JACKPOT:
            {
                var pk = new CmdReceivedJackpot(p);
                gamedata.gameLogic.jackpot(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_GETPLAYERS:
            {
                var pk = new CmdReceivedGetPlayers(p);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }
            case CMD.CMD_SEND_MESSAGE:
            {
                var pkMsg = new CmdReceiveMessage(p);
                fr.crashLytics.log("CMD_SEND_MESSAGE: " + JSON.stringify(pkMsg));
                if (this.inBoardLayer()) {
                    board.onReceiveChatMessage(pkMsg);
                }
                pkMsg.clean();
                break;
            }
        }

        var dateLog = new Date();
        var time = dateLog.toTimeString() + ", " + dateLog.getTime() + ": ";
        fr.crashLytics.setString(cmd.toString(), time);
    },

    inBoardLayer: function () {
        var board = sceneMgr.getRunningScene().getMainLayer();
        if (board instanceof BoardScene) {
            return true;
        }
        return false;
    }

});