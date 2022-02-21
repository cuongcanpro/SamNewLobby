/*
 * All Receive User Action
 * Created by Hunter on 5/25/2016.
 */

var GameClientListener = cc.Class.extend({

    ctor: function () {
        this._listenerID = 0;
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
                        loginpk.putData(loginMgr.getSessionKey());
                    else
                        loginpk.putData("+++" + loginMgr.getSessionKey());
                    GameClient.getInstance().sendPacket(loginpk);
                    loginpk.clean();
                    break;
                }
                case CMD.CMD_PINGPONG: {
                    pingPongHandler.receivePing();
                    break;
                }
                case CMD.CMD_ANOTHER_COM: {
                    if (packet.getError() == 3) {
                        sceneMgr.clearLoading();
                        GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
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
                            loginMgr.backToLoginScene(checkPortal);
                        });
                        NewRankData.disconnectServer();
                    }
                    break;
                }

            }
            //packet.clean();
            return;
        }

        for (var i = 0; i < gameMgr.arrayMgr.length; i++) {
            var mgr = gameMgr.arrayMgr[i];
            if (mgr.onReceived(cmd, pk))
                return;
        }

    }
});