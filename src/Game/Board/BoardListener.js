/**
 * Created by HunterPC on 1/5/2016.
 */

var BoardListener = cc.Class.extend({

    ctor: function () {

    },

    onReceived: function (cmd, pkg) {
        cc.log("BoardListener::onReceived " + cmd);
        var dateLog = new Date();
        var time = dateLog.toTimeString() + ", " + dateLog.getTime() + ": ";
        fr.crashLytics.setString(cmd.toString(), time);

        var board = sceneMgr.getRunningScene().getMainLayer();
        if(gamedata.gameLogic)
            gamedata.gameLogic.gameState = GameState.NONE;
        switch (cmd) {
            case CMD.CMD_JOIN_ROOM_SUCCESS:
            {
                sceneMgr.clearLoading();
                var join = new CmdReceivedJoinRoomSuccess(pkg);
                cc.log("CMD_JOIN_ROOM_SUCCESS: " + JSON.stringify(join));
                gamedata.gameLogic = new GameLogic();
                gamedata.gameLogic.initWith(join);
                join.clean();

                var curGui = sceneMgr.getRunningScene().getMainLayer();
                var boardScene = sceneMgr.openScene(MaubinhLayer.className,curGui._id,true);
                break;
            }
            case CMD.CMD_REG_QUIT:      // Dang ky roi phong`
            {
                if(!gamedata.gameLogic)
                    return;

                var pkg = new CmdReceivedRegQuitRoom(pkg);
                gamedata.gameLogic.regQuit(pkg);
                pkg.clean();

                sceneMgr.updateCurrentGUI();
                break;
            }
            case CMD.CMD_NOT_REG_QUIT:
            {
                if(!gamedata.gameLogic)
                    return;
                var pkg = new CmdReceivedNotRegQuitRoom(pkg);
                gamedata.gameLogic.notRegQuit(pkg);
                pkg.clean();
                sceneMgr.updateCurrentGUI();
                break;
            }
            case CMD.CMD_USER_JOIN_ROOM:
            {
                var join = new CmdReceivedUserJoinRoom(pkg);
                gamedata.gameLogic.userJoinRoom(join);
                join.clean();

                sceneMgr.updateCurrentGUI();
                break;
            }
            case CMD.CMD_UPDATE_OWNERROOM:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedUpdateOwnerRoom(pkg);
                gamedata.gameLogic.updateOwnerRoom(pk);

                sceneMgr.updateCurrentGUI(pk);
                break;
            }
            case CMD.CMD_AUTO_START:
            {
                if(!gamedata.gameLogic)
                    return;
                var auto = new CmdReceivedAutoStart(pkg);
                gamedata.gameLogic.autoStart(auto);

                sceneMgr.updateCurrentGUI(auto);
                auto.clean();

                break;
            }

            case CMD.CMD_NOTIFY_START:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedChiaBai(pkg);
                gamedata.gameLogic.chiabai(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();

                break;
            }
            case CMD.CMD_QUIT_ROOM:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedUserExitRoom(pkg);
                gamedata.gameLogic.userLeave(pk)

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }

            case CMD.CMD_QUIT_REASON:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedKickFromRoom(pkg);
                gamedata.gameLogic.kickFromRoom(pk);
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
            case CMD.CMD_JACKPOT:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedJackpot(pkg);
                gamedata.gameLogic.jackpot(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }


            // Game Binh
            case CMD.CMD_READY:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedReady(pkg);
                gamedata.gameLogic.ready(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }

            case CMD.CMD_UN_READY:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedUnReady(pkg);
                gamedata.gameLogic.unReady(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }

            case CMD.CMD_RECEIVE_END_CARDS:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedEndCard(pkg);
                gamedata.gameLogic.endCard(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }

            case CMD.CMD_BINH_CHI_INDEX:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedChiIndex(pkg);
                gamedata.gameLogic.chiIndex(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }

            case CMD.CMD_NOTIFY_BINH_CHI:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedCompareChiNew(pkg);
                gamedata.gameLogic.compareChi(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }

            case CMD.CMD_BINH_SUMMARY:
            case CMD.CMD_NOTIFY_BINH_SUMMARY:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedSummary(pkg);
                cc.log("SUMMARY ");
                gamedata.gameLogic.summary(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }

            case CMD.CMD_NOTIFY_BINH_XAP_BAI:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedXapBaiNew(pkg);
                gamedata.gameLogic.sapBai(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                break;
            }

            case CMD.CMD_NOTIFY_GAME_END:
            {
                if(!gamedata.gameLogic)
                    return;
                gamedata.gameLogic.gameEnd();
                sceneMgr.updateCurrentGUI(pk);
                break;
            }

            case CMD.CMD_BINH_SO_BAI:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedSoBai(pkg);
                gamedata.gameLogic.soBai(pk);
                sceneMgr.updateCurrentGUI(pk);
                break;
            }

            case CMD.CMD_NOTIFY_BINH_SO_BAI:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedBinhSoBai(pkg);
                gamedata.gameLogic.binhSoBai(pk);
                sceneMgr.updateCurrentGUI(pk);
                break;
            }

            case CMD.CMD_NOTIFY_BINH_XAP_LANG:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedSapLang(pkg);
                gamedata.gameLogic.sapLang(pk);
                sceneMgr.updateCurrentGUI(pk);
                break;
            }

            case CMD.CMD_NOTIFY_BINH_TINH_AT:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedBinhAt(pkg);
                gamedata.gameLogic.tinhAt(pk);
                sceneMgr.updateCurrentGUI(pk);
                break;
            }

            case CMD.CMD_BINH_REQUEST_END_CARD:
            {
                if(!gamedata.gameLogic)
                    return;
                gamedata.gameLogic.requestEndCard();
                sceneMgr.updateCurrentGUI();
                break;
            }

            case CMD.CMD_NOTIFY_BAO_MAU_BINH:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedBaoMauBinh(pkg);
                gamedata.gameLogic.baoMauBinh(pk);
                break;
            }

            case CMD.CMD_UPDATEGAMEINFO:
            {
                gamedata.gameLogic = new GameLogic();
                var pk = new CmdReceivedUpdateGameInfo(pkg);
                gamedata.gameLogic.updateInfoGame(pk);

                if(this.inBoardLayer()) {
                    sceneMgr.updateCurrentGUI();
                }
                else
                    SceneMgr.getInstance().openScene(MaubinhLayer.className);

                break;
            }
            case CMD.CMD_NOTIFY_JACKPOT:
            {
                var pk = new CmdReceivedNotifyJackpot(pkg);
                cc.log("WHAT THE FUCK ");
                if(gamedata.jackpotValue === undefined)
                    gamedata.jackpotValue = 0;
                cc.log("JACK POT " + pk.jackpot);
                if(gamedata.jackpotValue == pk.jackpot)
                    return;
                gamedata.oldJackpot = gamedata.jackpotValue;
                gamedata.changeJackpot = Math.floor((pk.jackpot - gamedata.oldJackpot) / 10);
                gamedata.jackpotValue = pk.jackpot;
                if(!gamedata.gameLogic)
                    return;

                gamedata.gameLogic.updateJackpot(pk);
                sceneMgr.updateCurrentGUI();
                break;
            }
            case CMD.CMD_VIEW_GAME_INFO:
            {
                if(!gamedata.gameLogic)
                    return;
                var pk = new CmdReceivedViewGame(pkg);
                gamedata.gameLogic.updateViewGame(pk);
                sceneMgr.updateCurrentGUI();
                break;
            }
            case CMD.CMD_REG_LOG:
            {
                var pkMsg = new CmdReceiveRegLog(pkg);
                cc.log("DATA LEAVE " + JSON.stringify(pkMsg));
                pkMsg.clean();
                break;
            }
        }
    },

    inBoardLayer: function () {
        var board = sceneMgr.getRunningScene().getMainLayer();
        return board instanceof MaubinhLayer;
    }

});