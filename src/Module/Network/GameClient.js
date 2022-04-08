
var ConnectState = function () {
};

ConnectState.DISCONNECTED = 0;
ConnectState.CONNECTING = 1;
ConnectState.CONNECTED = 2;
ConnectState.NEED_QUIT = 3;             // state khi client da disconnect va thong bao cho GUI hien tai de disconnect

var GameClient = cc.Class.extend({
    ctor: function () {
        this._clientID = new Date().getTime();
        this._clientListener = new GameClientListener();
        this._clientListener._listenerID = this._clientID;

        if(cc.sys.isNative)
        {
            this._tcpClient = engine.GsnClient.getInstance();
            this._tcpClient.setFinishConnectListener(this._clientListener.onFinishConnect.bind(this._clientListener));
            this._tcpClient.setDisconnectListener(this._clientListener.onDisconnected.bind(this._clientListener));
            this._tcpClient.setReceiveDataListener(this._clientListener.onReceived.bind(this._clientListener));
            this.connectState = ConnectState.DISCONNECTED;
        }
        else
        {
            this._tcpClient = new WebsocketClient();
            this._tcpClient.listener = this._clientListener;
        }

        this.connectServer = false;
        this.arTimeoutFunc = [];
    },

    getNetwork: function () {
        return this._tcpClient;
    },

    connect: function () {
        if (Config.ENABLE_CHEAT) {
            this._tcpClient.connect(CheatCenter.SERVER_IP, CheatCenter.SERVER_PORT);
            //this._tcpClient.connect("118.102.3.18", 10109);
            // if (cc.sys.isNative)
            //     this._tcpClient.connect(CheatCenter.SERVER_IP, CheatCenter.SERVER_PORT);
            // else
            //     this._tcpClient.connect("118.102.3.18:10259", 10259);;
            cc.log("_________ CONNECT SERVER CHEAT : " + CheatCenter.SERVER_IP + ":" + CheatCenter.SERVER_PORT);
            ToastFloat.makeToast(ToastFloat.LONG,"Connect " + CheatCenter.SERVER_IP + ":" + CheatCenter.SERVER_PORT);
        }
        else {
            if (cc.sys.isNative) {
                if (cc.sys.localStorage.getItem("ipapp")) {
                    this._tcpClient.connect(cc.sys.localStorage.getItem("ipapp"), cc.sys.localStorage.getItem("portapp"));
                    cc.log("___________ CONNECT SERVER SERVICES : " + cc.sys.localStorage.getItem("ipapp") + ":" + cc.sys.localStorage.getItem("portapp"));
                } else {
                    this._tcpClient.connect(Config.SERVER_LIVE, Config.PORT_LIVE);
                    cc.log("_________ CONNECT SERVER LIVE CONFIG : " + Config.SERVER_LIVE + ":" + Config.PORT_LIVE);
                }
            } else {
                if (cc.sys.localStorage.getItem("ssl")){
                    this._tcpClient.connect(cc.sys.localStorage.getItem("ssl"), true);
                    cc.log("___________ CONNECT SERVER SSL SERVICES : " + cc.sys.localStorage.getItem("ssl"));
                } else {
                    this._tcpClient.connect(Config.SERVER_LIVE_WEB, Config.PORT_LIVE_WEB);
                    cc.log("_________ CONNECT SERVER LIVE WEB CONFIG : " + Config.SERVER_LIVE_WEB + ":" + Config.PORT_LIVE_WEB);
                }
            }
        }

        this.connectState = ConnectState.CONNECTING;
        this.connectServer = true;

        timeoutConnectHandler.startCountDown();
    },

    sendPacket: function (pk) {
        if (this._tcpClient && this.connectServer)
            this._tcpClient.send(pk);
        if (pk._cmdId !== 50){
            cc.log("==Send : " , pk._cmdId);
        }
    },

    disconnect: function () {
        this._tcpClient.disconnect();
        if (cc.sys.isNative){
            this._tcpClient.setFinishConnectListener(null);
            this._tcpClient.setDisconnectListener(null);
            this._tcpClient.setReceiveDataListener(null);
        }
        this.connectServer = false;
        timeoutConnectHandler.clearCountDown();
    },

    retryConnectInGame: function () {
        sceneMgr.clearLoading();
        GameClient.destroyInstance();
        GameClient.disconnectHandle();
        RankData.disconnectServer();
    },

    retryManualConnect: function() {
        sceneMgr.clearLoading();
        GameClient.destroyInstance();
        engine.HandlerManager.getInstance().addHandler("login_count", function () {

        });
        engine.HandlerManager.getInstance().getHandler("login_count").setTimeOut(GameClient.TIME_OUT_RETRY, true);
    },

    startPingPong: function () {
        pingPongHandler.startPing();
        timeoutConnectHandler.clearCountDown();
    },

    receivePingPong: function () {
        pingPongHandler.receivePing();
    },

    destroy : function () {
        try {
            this._clientID = 0;
            this._tcpClient = null;

            for (var i = 0, size = this.arTimeoutFunc.length; i < size; i++) {
                clearTimeout(this.arTimeoutFunc[i]);
            }
        }
        catch(e) {
            cc.log("###Detroy Game Client error " + e);
        }
    }
});

GameClient.instance = null;

GameClient.connectCount = 0;
GameClient.retryCount = 0;
GameClient.reconnect = false;

GameClient.holding = false;
GameClient.holdingRoom = 0;
GameClient.holdingPass = "";
GameClient.connectLai = false;

GameClient.MAX_RETRY_CONNECT = 3;
GameClient.MAX_NETWORK_UNSTABLE = 5;
GameClient.TIME_OUT_RETRY = 5;

GameClient.PINGPONG_TIMEOUT = 15;
GameClient.PINGPONG_INTERVAL = 5;
GameClient.NETWORK_SLOW_NOTIFY = 5;

GameClient.NETWORK_STATE_TIME_NOTIFY = [0.1, 1, 5, 10];

GameClient.getInstance = function () {
    if (!GameClient.instance) {
        GameClient.instance = new GameClient();
    }
    return GameClient.instance;
};

GameClient.checkAvailableListener = function (_id) {
    if(!GameClient.instance) return false;

    return (GameClient.instance._clientID == _id);
};

GameClient.destroyInstance = function () {
    fr.crashLytics.logGameClient("destroyInstance");
    if (cc.sys.isNative){
        engine.GsnClient.destroyInstance();
    }

    if (GameClient.instance) {
        GameClient.instance.destroy();
        GameClient.instance = null;
    }
};

GameClient.disconnectHandle = function () {
    fr.crashLytics.logGameClient("disconnectHandle");
    if (!inGameMgr.checkInBoard()) {
        var dlg = sceneMgr.openGUI(GUIDisconnect.className, GUIDisconnect.ZODER, GUIDisconnect.TAG);
        dlg.setMessage(LocalizedString.to("_CONNECTFAILED_"), null, function (btnID) {
            var autoConnect = true;
            if (btnID == 0) {
                // no action
            }
            else {
                cc.sys.localStorage.setItem("autologin", -1);
                autoConnect = false;
            }

            loginMgr.backToLoginScene(autoConnect);
        });
    }
    else {
        CheckLogic.showNotifyNetworkSlow(true);
        GameClient.processRetryConnect();
    }
};

GameClient.connectFailedHandle = function () {
    fr.crashLytics.logGameClient("connectFailedHandle");
    // clear old connect
    GameClient.getInstance().disconnect();
    GameClient.destroyInstance();

    // notify
    if (!inGameMgr.checkInBoard()) {
        sceneMgr.clearLoading();
        socialMgr.clearSession();

        var dlg = sceneMgr.openGUI(GUIDisconnect.className, GUIDisconnect.ZODER, GUIDisconnect.TAG);
        dlg.setMessage(LocalizedString.to("_CONNECTFAILED_"), null, function (btnID) {
            var autoConnect = true;
            if (btnID == 0) {
            }
            else {
                cc.sys.localStorage.setItem("autologin", -1);
                autoConnect = false;
            }
            loginMgr.backToLoginScene(autoConnect);
        });
    }
    else {
        GameClient.processRetryConnect();
    }

    RankData.disconnectServer();
};

GameClient.processRetryConnect = function () {
    fr.crashLytics.logGameClient("processRetryConnect");
    cc.log("+++Retry Connect " + GameClient.connectCount);

    CheckLogic.retryConnectInBoard(true);

    if (GameClient.connectCount >= GameClient.MAX_RETRY_CONNECT) {
        GameClient.showNetworkFail();
    }
    else {
        engine.HandlerManager.getInstance().addHandler("login_count", function () {
            GameClient.getInstance().connect();
            GameClient.connectCount++;
        });
        engine.HandlerManager.getInstance().getHandler("login_count").setTimeOut(GameClient.TIME_OUT_RETRY, true);
    }
};

GameClient.showNetworkFail = function () {
    fr.crashLytics.logGameClient("showNetworkFail");
    var isNetwork = NativeBridge.networkAvaiable();

    if (GameClient.retryCount >= GameClient.MAX_NETWORK_UNSTABLE) {
        isNetwork = false;
        GameClient.retryCount = 0;
    }
    else {
        GameClient.retryCount++;
    }

    var msg = "";
    if (isNetwork) {
        msg = LocalizedString.to("DISCONNECT_UNKNOWN");
    }
    else {
        msg = LocalizedString.to("CHECK_NETWORK");
    }

    var dlg = sceneMgr.openGUI(GUIDisconnect.className, GUIDisconnect.ZODER, GUIDisconnect.TAG);
    dlg.setMessage(LocalizedString.to("_CONNECTFAILED_"), null, function (btnID) {
        if (btnID == 0) {
            GameClient.connectCount = 0;
            GameClient.getInstance().connect();
        }
        else {
            cc.sys.localStorage.setItem("autologin", -1);
            loginMgr.backToLoginScene(false);
        }
    });
};