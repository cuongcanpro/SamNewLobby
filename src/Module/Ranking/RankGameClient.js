var RankGameClient = cc.Class.extend({
    ctor: function () {
        this._clientListener2 = new RankGameClientListener();

        if(cc.sys.isNative)
        {
            this._tcpClient2 = fr.GsnClient.create();
            this._tcpClient2.setFinishConnectListener(this._clientListener2.onFinishConnect.bind(this._clientListener2));
            this._tcpClient2.setDisconnectListener(this._clientListener2.onDisconnected.bind(this._clientListener2));
            this._tcpClient2.setReceiveDataListener(this._clientListener2.onReceived.bind(this._clientListener2));
        }
        else
        {
            this._tcpClient2 = new WebsocketClient();
            this._tcpClient2.listener = this._clientListener2;
        }

        this.connectState = ConnectState.DISCONNECTED;

        this.connectServer = false;

        return true;
    },

    connect: function (/* timeout */) {
        if (Config.ENABLE_CHEAT) {
            this._tcpClient2.connect(CheatCenter.SERVER_NEW_RANK_IP, CheatCenter.SERVER_NEW_RANK_PORT);
            cc.log("_________ CONNECT SERVER NEW RANK PRIVATE CONFIG : " + CheatCenter.SERVER_NEW_RANK_IP + ":" + CheatCenter.SERVER_NEW_RANK_PORT);
        }
        else {
            if (cc.sys.isNative) {
                if (cc.sys.localStorage.getItem("ipAppRank")) {
                    cc.log("___________ CONNECT RANK SERVER SERVICES : " + cc.sys.localStorage.getItem("ipAppRank") + ":" + cc.sys.localStorage.getItem("portAppRank"));
                    this._tcpClient2.connect(cc.sys.localStorage.getItem("ipAppRank"), cc.sys.localStorage.getItem("portAppRank"));
                } else {
                    cc.log("_________ CONNECT RANK SERVER LIVE  CONFIG : " + RankData.IP_LIVE + ":" + RankData.PORT_LIVE);
                    this._tcpClient2.connect(RankData.IP_LIVE, RankData.PORT_LIVE);
                }
            } else {
                if (cc.sys.localStorage.getItem("sslRank")){
                    cc.log("___________ CONNECT RANK SERVER SSL SERVICES : " + cc.sys.localStorage.getItem("sslRank"));
                    this._tcpClient2.connect(cc.sys.localStorage.getItem("sslRank"), true);
                } else {
                    cc.log("_________ CONNECT RANK SERVER LIVE WEB CONFIG : " + RankData.IP_LIVE_WEB);
                    this._tcpClient2.connect(RankData.IP_LIVE_WEB);
                }
            }
        }

        this.connectState = ConnectState.CONNECTING;
        this.connectServer = true;
    },

    sendPacket: function (pk) {
        if (this._tcpClient2 && this.connectServer){
            this._tcpClient2.send(pk);
        }
        if (pk._cmdId !== 50){
            cc.log("== New Rank Send : " , pk._cmdId);
        }
    },

    disconnect: function () {
        cc.log(" new rank disconnect");
        this._tcpClient2.disconnect();
        this.connectServer = false;
    },

    startPingPong: function () {
        var pk = new CmdSendPingpongRank();
        this.sendPacket(pk);
        pk.clean();
        engine.HandlerManager.getInstance().addHandler("RankPingPong", function () {
            cc.log("#PingPong chat New Rank Timeout -> Disconnect !");
            RankGameClient.getInstance().connectState = ConnectState.DISCONNECTED;
            RankGameClient.getInstance().disconnect();
            RankGameClient.destroyInstance();
            sceneMgr.clearLoading();

            RankGameClient.disconnectHandle();
        });
        engine.HandlerManager.getInstance().getHandler("RankPingPong").setTimeOut(20, true);
    },

    receivePingPong: function () {
        engine.HandlerManager.getInstance().addHandler("received_RankPingPong", function () {
            engine.HandlerManager.getInstance().forceRemoveHandler("RankPingPong");
            RankGameClient.getInstance().startPingPong();
        });
        engine.HandlerManager.getInstance().getHandler("received_RankPingPong").setTimeOut(5, true);
    },

    isRankConnected: function () {
        return this.connectState === ConnectState.CONNECTED;
    }
});

RankGameClient.firstInit = true;
RankGameClient.instance = null;
RankGameClient.connectLai = false;

RankGameClient.getInstance = function () {
    if (RankGameClient.firstInit) {
        RankGameClient.instance = new RankGameClient();

        RankGameClient.firstInit = false;
    }
    return RankGameClient.instance;
};

RankGameClient.destroyInstance = function () {
};

RankGameClient.disconnectHandle = function () {
    RankGameClient.getInstance().connectState = ConnectState.DISCONNECTED;
};
