/*
 * All Receive User Action
 * Created by Hunter on 5/25/2016.
 */

var GameClientListener = cc.Class.extend({

    ctor: function () {
        this._listenerID = 0;
        this.social = new SocialNetworkListener();
        this.football = new FootballHandler();
        this.inGame = new BoardListener();
    },

    onFinishConnect: function (isSuccess) {
        if (!GameClient.checkAvailableListener(this._listenerID)) {
            cc.log("_________onFinishConnect in other client #############");
            return;
        }

        cc.log("_________onFinishConnect:" + isSuccess);
        if (isSuccess) {
            GameClient.getInstance().sendPacket(new CmdSendHandshake());
            GameClient.getInstance().connectState = ConnectState.CONNECTING;
            GameClient.connectCount = 0;
            GameClient.retryCount = 0;
            fr.crashLytics.logGameClient("onFinishConnect");
            gameMgr.updateNetworkOperator();
        } else {
            GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
            GameClient.connectFailedHandle();
        }
    },

    onDisconnected: function () {
        if (!GameClient.checkAvailableListener(this._listenerID)) {
            cc.log("_______onDisconnected in other client ##############");
            return;
        }

        cc.log("_______onDisconnected________");
        GameClient.getInstance().connectServer = false;
        if (GameClient.getInstance().connectState == ConnectState.CONNECTED) {
            GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
            engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
            engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");
            sceneMgr.clearLoading();
            GameClient.destroyInstance();
            if (sceneMgr.getMainLayer() instanceof LoginScene)
                return;
            GameClient.disconnectHandle();
            fr.crashLytics.logGameClient("onDisconnected-connected");
            NewRankData.disconnectServer();
        } else if (GameClient.getInstance().connectState == ConnectState.CONNECTING) {
            GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
            engine.HandlerManager.getInstance().forceRemoveHandler("login");
            sceneMgr.clearLoading();
            GameClient.destroyInstance();
            if (sceneMgr.getMainLayer() instanceof LoginScene)
                return;
            GameClient.connectFailedHandle();
            fr.crashLytics.logGameClient("onDisconnected-connecting");
            NewRankData.disconnectServer();
        }

        GameClient.connectLai = !!CheckLogic.checkInBoard();
    },

    onReceived: function (cmd, pk) {
        if (!GameClient.checkAvailableListener(this._listenerID)) {
            cc.log(" ON RECEIVED PACKET in other client ##############");
            return;
        }

        var packet = new engine.InPacket();
        packet.init(pk);

        var pkg = pk;
        var p = pk;

        var controllerID = packet.getControllerId();
        if (!cc.sys.isNative) {
            cmd = packet._cmdId;
        }

        if (cmd != 50 && cmd != 20001 && cmd != 25004)
            cc.log(" ON RECEIVED PACKET   CMD: " + cmd + "  CONTROLLER ID: " + controllerID + " ERRO.R:  " + packet.getError());

        if (controllerID == 0) {
            switch (cmd) {
                case CMD.HAND_SHAKE: {
                    var loginpk = new CmdSendLogin();
                    if (Config.ENABLE_CHEAT && Config.ENABLE_DEV)
                        loginpk.putData(GameData.getInstance().sessionkey);
                    else
                        loginpk.putData("+++" + GameData.getInstance().sessionkey);
                    GameClient.getInstance().sendPacket(loginpk);
                    loginpk.clean();

                    break;
                }
                case CMD.CMD_PINGPONG: {
                    GameClient.getInstance().receivePingPong();
                    break;
                }
                case CMD.CMD_ANOTHER_COM: {
                    if (packet.getError() == 3) {
                        sceneMgr.clearLoading();

                        GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
                        engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
                        engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");

                        GameClient.getInstance().disconnect();
                        GameClient.destroyInstance();

                        sceneMgr.showOkCancelDialog(LocalizedString.to("DISCONNECT_LOGIN"), null, function (btnID) {
                            var checkPortal = false;
                            if (btnID == 0) {
                            } else {
                                cc.sys.localStorage.setItem("autologin", -1);
                                cc.sys.localStorage.setItem("session", "");
                                checkPortal = true;
                            }

                            gamedata.backToLoginScene(checkPortal);
                        });

                        NewRankData.disconnectServer();
                    }
                    break;
                }
            }
            packet.clean();
            return;
        }

        for (var i = 0; i < gameMgr.arrayMgr.length; i++) {
            var mgr = gameMgr.arrayMgr[i];
            if (mgr.onReceived(cmd, pk))
                return;
        }
        switch (cmd) {
            case CMD.CMD_LOGIN: {
                if (packet.getError() == 0) {
                    cc.log("_________________________________LOGIN SUCCESSFUL___________________________________");

                    GameClient.getInstance().startPingPong();
                    GameClient.getInstance().connectState = ConnectState.CONNECTED;

                    var request = new CmdSendGameInfo();
                    request.putData(NativeBridge.getDeviceModel(), NativeBridge.getOsVersion(),
                        NativeBridge.getPlatform(), NativeBridge.getDeviceID(), gamedata.appVersion, "aa", "aa",
                        Constant.APP_FOOTBALL, gamedata.detectVersionUpdate(), gamedata.getInstallDate(),
                        gamedata.gameConfig.configVersion, !GameClient.isWaitingReconnect);
                    GameClient.getInstance().sendPacket(request);
                    request.clean();

                    NewRankData.connectToServerRank();
                    broadcastMgr.onStart();
                    chatMgr.resetData();
                    StorageManager.getInstance().resetData();
                    DailyPurchaseManager.getInstance().resetData();
                    LuckyBonusManager.getInstance().resetData();

                    // gui log check install app zalopay
                    try {
                        if (fr.platformWrapper.isAndroid()) {
                            var packageName = Config.URL_ZALOPAY;
                            var isInstalled = fr.platformWrapper.checkInstallApp(packageName);
                            if (Config.ENABLE_CHEAT) {
                                packageName = Config.URL_ZALOPAY_SANBOX;
                                isInstalled += fr.platformWrapper.isInstalledApp(packageName);
                            }
                            var logClient = new CmdSendClientInfo();
                            if (isInstalled == 0) {
                                logClient.putData(isInstalled, 4);
                            } else {
                                logClient.putData("1", 4);
                            }
                            GameClient.getInstance().sendPacket(logClient);
                            logClient.clean();
                        }
                    } catch (e) {

                    }

                    if (Config.ENABLE_DECORATE_ITEM) {
                        decorateManager.reset();
                    }
                } else if (packet.getError() == -44) {
                    cc.log("_____________________LOGIN FAIL____________________");
                    sceneMgr.clearLoading();
                    socialMgr.clearSession();
                    sceneMgr.showOKDialog(LocalizedString.to("LOGIN_FAILED_MAINTAIN"), null, function (btnID) {
                        var checkPortal = false;
                        //if (btnID == 0) {
                        //
                        //}
                        //else {
                        //    cc.sys.localStorage.setItem("autologin", -1);
                        //    checkPortal = true;
                        //}

                        gamedata.backToLoginScene(checkPortal);
                    });

                    sceneMgr.clearLoading();
                } else {
                    cc.log("_______________________________________LOGIN FAIL___________________________________");
                    var log = " Login Fail: " + packet.getError() + " " + GameData.getInstance().sessionkey;
                    var s = "JavaScript error: assets/src/Lobby/Network/GameClientListener.js line 2222TypeError: " + log + " " + (new Error()).stack;
                    cc.log(s);
                    NativeBridge.logJSManual("assets/src/Lobby/Network/GameClientListener.js", "2222", s, NativeBridge.getVersionString());
                    sceneMgr.clearLoading();
                    socialMgr.clearSession();
                    sceneMgr.showOkCancelDialog(LocalizedString.to("LOGIN_FAILED") + " " + packet.getError(), null, function (btnID) {
                        var checkPortal = false;
                        if (btnID == 0) {

                        } else {
                            cc.sys.localStorage.setItem("autologin", -1);
                            checkPortal = true;
                        }

                        gamedata.backToLoginScene(checkPortal);
                    });

                    sceneMgr.clearLoading();
                    throw new Error(log);
                }
                break;
            }
            case CMD.CMD_LOGIN_FAIL: {
                cc.log("_______________________________RETRY RECONNECT OTHER SERVER________________________________");

                var cmdConnectFail = new CmdReceiveConnectFail(p);
                GameData.getInstance().ipapp = cmdConnectFail.ip;
                GameData.getInstance().portapp = cmdConnectFail.port;

                cc.sys.localStorage.setItem("ipapp", GameData.getInstance().ipapp);
                cc.sys.localStorage.setItem("portapp", GameData.getInstance().portapp);

                GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
                engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
                engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");
                GameClient.getInstance().disconnect();
                GameClient.destroyInstance();

                setTimeout(function () {
                    GameClient.getInstance().connect();
                }, 1000);

                NewRankData.disconnectServer();
                break;
            }

            case NewRankData.CMD_RANK_INFO_OTHER_USER: {
                var otherInfo = new CmdReceivedOtherRankInfo(p);
                cc.log("otherInfo: ", JSON.stringify(otherInfo));
                sceneMgr.clearLoading();
                var otherInfoGUI = sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
                otherInfoGUI.setInfo(otherInfo);
                otherInfo.clean();
                break;
            }

            case CMD.CMD_PORTAL_GIFT_CODE: {
                var cmd = new CmdReceivedPortalGiftCode(p);
                cc.log("CMD_PORTAL_GIFT_CODE", JSON.stringify(cmd));
                if (p.error == 0) {
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("GIFT CODE SUCCESS "));
                }

                break;
            }
            default : {
                this.inGame.onReceived(cmd, pkg);
                this.football.onReceive(cmd, pkg);
                this.social.onReceived(cmd, pkg);

                if (Config.ENABLE_MINIGAME)
                    roulete.onReceive(cmd, pkg);

                if (Config.ENABLE_VIDEO_POKER)
                    videoPoker.onReceive(cmd, pkg);

                if (Config.ENABLE_TUTORIAL)      // Tutorial Poker
                    tutorialListener.onReceived(cmd, pkg);

                if (Config.ENABLE_DECORATE_ITEM)
                    decorateManager.onReceive(cmd, pkg);

                offerManager.onReceived(cmd, pkg);
                event.onReceive(cmd, pkg);
                //chatMgr.onReceive(cmd, pkg);
                NewVipManager.getInstance().onReceive(cmd, pkg);
                StorageManager.getInstance().onReceive(cmd, pkg);
                dailyPurchaseManager.onReceive(cmd, pkg);
                LuckyBonusManager.getInstance().onReceive(cmd, pkg);

                break;
            }
        }
        packet.clean();
    }
});