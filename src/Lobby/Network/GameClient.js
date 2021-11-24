/**
 * Created by KienVN on 5/21/2015.
 */

var WebSocketState = function(){};

WebSocketState.CONNECTING = 0;
WebSocketState.OPEN = 1;
WebSocketState.CLOSING = 2;
WebSocketState.CLOSED = 3;

var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket;

var WebsocketClient = cc.Class.extend({
    ctor: function(){
        this.listener = null;
        this.ws = null;
        this._clientState = WebSocketState.CLOSED;
    },
    getHandshakeRequest: function()
    {
        var obj = {};
        obj.c = 0;
        obj.a = 0;
        obj.p = {};
        obj.p["cl"] = "JavaScript";
        obj.p["api"] = "1.2.0";

        return JSON.stringify(obj);
    },
    handleHandshake: function(){
    },
    connect: function(domain, isSsl)
    {
        if (this._clientState === WebSocketState.CONNECTING){
            cc.log("Client is processing connect, please try later!");
            return;
        }
        if (this._clientState === WebSocketState.OPEN || this._clientState === WebSocketState.CLOSING){
            this.reconnect();
            return;
        }
        // var domain = "socket-dev.service.zingplay.com:10259";
        //if (cc.sys.localStorage.getItem("ssl")) {
        //    domain = cc.sys.localStorage.getItem("ssl");
        //}

        // this._host = domain.split(":")[0];
        // this._port = domain.split(":")[1];
        this._host = domain.split(":")[0];
        this._port = domain.split(":")[1] ? domain.split(":")[1] : 843 ;
        var host = this._host;
        var port = this._port;
        var link = "wss://"+host+":"+port+"/websocket";
        cc.log("web socket connected:  " + link);
        this.ws = new WebSocket(link);
        // this._host = host;
        // this._port = port;
        // this._isSsl = isSsl;
        // cc.log("host: "+ host + ", post: "+ port);
        // var websocketLink = (!CheatCenter.ENABLE_USE_WEBSOCET) ? "/websocket" : "";
        // if (!isSsl){
        //     this.ws = new WebSocket("ws" + (isSsl?"s":"") + "://"+host+":"+port + websocketLink);
        // } else {
        //     this.ws = new WebSocket("ws" + (isSsl?"s":"") + "://"+host+":"+port + websocketLink, ["TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"]);
        // }

        this.ws.binaryType = "arraybuffer";
        this.ws.onopen = this.onSocketConnect.bind(this);
        this.ws.onclose = this.onSocketClose.bind(this);
        this.ws.onmessage = this.onSocketData.bind(this);
        this.ws.onerror = this.onSocketError.bind(this);
        this._isReconnecting = false;
        this._clientState = WebSocketState.CONNECTING;

    },
    onSocketConnect : function(){
        this._clientState = WebSocketState.OPEN;
        cc.log("onSocketConnect");
        if(this.listener && this.listener.onFinishConnect)
        {
            this.listener.target = this;
            this.listener.onFinishConnect.call(this.listener,true);
        }
    },
    onSocketClose: function(){
        cc.log("CONNECT CLOSED");
        this.ws = null;
        var oldClientState = this._clientState;
        this._clientState = WebSocketState.CLOSED;
        if (oldClientState === WebSocketState.CONNECTING){
            if(this.listener && this.listener.onFinishConnect)
            {
                this.listener.onFinishConnect.call(this.listener,false);
            }
        } else if (this._isReconnecting){
            this._isReconnecting = false;
            this.connect(this._host, this._port, this._isSsl);
        } else {
            if(this.listener && this.listener.onDisconnected)
            {
                this.listener.target = this;
                this.listener.onDisconnected.call(this.listener);
            }
        }

    },
    onSocketData: function(a){
        var data = new Uint8Array(a.data);
        if(this.listener && this.listener.onReceived)
        {
            this.listener.onReceived.call(this.listener,0,data);
        }
    },
    onSocketError: function(){
        cc.log("error connect");
        if(this.listener && this.listener.onFinishConnect)
        {
            this.listener.target = this;
            this.listener.onFinishConnect.call(this.listener,false);
        }
    },
    send: function(packet){
        if (this._clientState !== WebSocketState.OPEN){
            cc.log("need to connect server before send packet");
            return;
        }
        var data = new Int8Array(packet._length);
        for(var i=0;i<packet._length;i++)
        {
            data[i] = packet._data[i];
        }
        if (this.ws){
            this.ws.send(data.buffer);
        }

    },
    disconnect: function()
    {
        if (this.ws) this.ws.close();
    },

    reconnect: function(){
        if (this._host === undefined){
            cc.log("call connect first!");
            return;
        }
        if (this._clientState === WebSocketState.OPEN || this._clientState === WebSocketState.CLOSING){
            this._isReconnecting = true;
            this.disconnect();
        } else if (this._clientState === WebSocketState.CLOSED){
            this.connect(this._host, this._port, this._isSsl);
        }

    }

});

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
        engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
        engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");
        sceneMgr.clearLoading();
        GameClient.destroyInstance();
        GameClient.disconnectHandle();
        NewRankData.disconnectServer();
    },

    retryManualConnect: function() {
        engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
        engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");
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
    if (!CheckLogic.checkInBoard()) {
        sceneMgr.showOkCancelDialog(LocalizedString.to("_CONNECTFAILED_"), null, function (btnID) {
            var checkPortal = false;
            if (btnID == 0) {
                // no action
            }
            else {
                cc.sys.localStorage.setItem("autologin", -1);
                checkPortal = true;
            }

            gamedata.backToLoginScene(checkPortal);
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
    if (!CheckLogic.checkInBoard()) {
        sceneMgr.clearLoading();
        socialMgr.clearSession();

        sceneMgr.showOkCancelDialog(LocalizedString.to("CONFIRM_CONNECT"), null, function (btnID) {
            var checkPortal = false;
            if (btnID == 0) {
            }
            else {
                cc.sys.localStorage.setItem("autologin", -1);
                checkPortal = true;
            }

            gamedata.backToLoginScene(checkPortal);
        });
    }
    else {
        GameClient.processRetryConnect();
    }

    NewRankData.disconnectServer();
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

    sceneMgr.showOkCancelDialog(msg, null, function (btnID) {
        if (btnID == 0) {
            GameClient.connectCount = 0;
            GameClient.getInstance().connect();
        }
        else {
            cc.sys.localStorage.setItem("autologin", -1);
            gamedata.backToLoginScene(true);
        }
    });
};

var PingPongHandler = cc.Class.extend({
    ctor : function () {
        this.timePingPong = 0;
        this.timeDelayPingPong = 0;
        this.timeRetryPingPong = 0;
        this.arStateTime = [];

        this.isRetryPingpong = false;
        this.isDelayPingpong = false;
        this.isPingpong = false;

        this.isNetworkSlow = false;

        this.isStopHandler = true;
    },

    startPing : function () {
        this.isStopHandler = false;

        this.sendPing();

        this.timePingPong = 0;
        this.timeDelayPingPong = 0;
        this.isDelayPingpong = false;
        this.isPingpong = true;
        this.isNetworkSlow = false;

        this.arStateTime = JSON.parse(JSON.stringify(GameClient.NETWORK_STATE_TIME_NOTIFY));

        CheckLogic.showNotifyNetworkSlow(false);
        CheckLogic.updateNetworkState();
        CheckLogic.retryConnectInBoard();
    },

    receivePing : function () {
        this.timePingPong = 0;
        this.timeDelayPingPong = 0;
        this.timeRetryPingPong = 0;

        this.isRetryPingpong = false;
        this.isDelayPingpong = true;
        this.isPingpong = false;

        this.isNetworkSlow = false;

        CheckLogic.showNotifyNetworkSlow(false);
        CheckLogic.updateNetworkState();
    },

    sendPing : function () {
        this.timeRetryPingPong = 0;
        this.isRetryPingpong = true;

        var pk = new CmdSendPingpong();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    checkNeedPing : function () {
        if(sceneMgr.checkMainLayer(LoginScene)) {
            this.isStopHandler = true;
        }
    },

    autoDisconnect : function () {
        this.isStopHandler = true;

        this.isPingpong = false;
        this.isDelayPingpong = false;
        this.timePingPong = 0;
        this.timeDelayPingPong = 0;

        CheckLogic.updateNetworkState(0);

        sceneMgr.clearLoading();

        GameClient.getInstance().disconnect();
        GameClient.destroyInstance();
        GameClient.disconnectHandle();

        GameClient.connectLai = !!CheckLogic.checkInBoard();

        NewRankData.disconnectServer();
    },

    updatePing : function (dt) {
        if(this.isStopHandler) return;

        // check state ping and check timeout ping
        if(this.isPingpong) {
            if(this.timePingPong < GameClient.PINGPONG_TIMEOUT) {
                this.timePingPong += dt;

                // network state wifi
                for(var i = 0, size = this.arStateTime.length ; i < size ; i++) {
                    if(this.timePingPong > this.arStateTime[i]) {
                        CheckLogic.updateNetworkState(size - i - 1);
                        this.arStateTime.splice(i,1);
                        break;
                    }
                }

                // network slowly
                if(this.timePingPong > GameClient.NETWORK_SLOW_NOTIFY && !this.isNetworkSlow) {
                    this.isNetworkSlow = true;
                    CheckLogic.showNotifyNetworkSlow(true);
                }

                // pingpong timeout
                if(this.timePingPong >= GameClient.PINGPONG_TIMEOUT) {
                    this.autoDisconnect();
                }
            }
        }

        // retry send ping if connect slow
        if(this.isRetryPingpong) {
            if(this.timeRetryPingPong < GameClient.PINGPONG_INTERVAL) {
                this.timeRetryPingPong += dt;
                if(this.timeRetryPingPong >= GameClient.PINGPONG_INTERVAL) {
                    this.sendPing();
                }
            }
        }

        // delay to send ping
        if(this.isDelayPingpong && this.timeDelayPingPong < GameClient.PINGPONG_INTERVAL) {
            this.timeDelayPingPong += dt;

            if(this.timeDelayPingPong >= GameClient.PINGPONG_INTERVAL) {
                this.startPing();
            }
        }
    }
});

PingPongHandler._inst = null;
PingPongHandler.getInstance = function () {
    if(!PingPongHandler._inst) {
        PingPongHandler._inst = new PingPongHandler();
    }
    return PingPongHandler._inst;
};
pingPongHandler = PingPongHandler.getInstance();

var TimeoutConnectHandler = cc.Class.extend({

    ctor : function () {
        this.timeCountDown = 0;
        this.isWaitConnect = false;
    },

    startCountDown : function () {
        cc.log("##TimeoutConnect::startCountDown");
        this.isWaitConnect = true;
        this.timeCountDown = Config.TIMEOUT_CONNECT_SERVER;
    },

    clearCountDown : function () {
        cc.log("##TimeoutConnect::clearTimeout");
        this.isWaitConnect = false;
        this.timeCountDown = 0;
    },

    doTimeoutConnect : function () {
        if(Config.TIMEOUT_CONNECT_SERVER == 0) return;

        cc.log("##TimeoutConnect::onTimeout ");
        this.clearCountDown();
        GameClient.destroyInstance();

        sceneMgr.clearLoading();

        if(CheckLogic.checkInBoard()) {
            GameClient.processRetryConnect();
        }
        else {
            sceneMgr.showOkCancelDialog(LocalizedString.to("CONFIRM_CONNECT"), null, function (btnID) {
                var checkPortal = false;
                if (btnID == 0) {
                }
                else {
                    cc.sys.localStorage.setItem("autologin", -1);
                    checkPortal = true;
                }

                gamedata.backToLoginScene(checkPortal);
            });
        }

        NewRankData.disconnectServer();
    },

    updateCountDown : function (dt) {
        if(Config.TIMEOUT_CONNECT_SERVER == 0) return;

        if(this.isWaitConnect) {
            if(this.timeCountDown > 0) {
                this.timeCountDown -= dt;
                if(this.timeCountDown <= 0) {
                    this.doTimeoutConnect();
                }
            }
        }
    }

});

TimeoutConnectHandler._inst = null;

TimeoutConnectHandler.getInstance = function () {
    if(!TimeoutConnectHandler._inst) {
        TimeoutConnectHandler._inst = new TimeoutConnectHandler();
    }
    return TimeoutConnectHandler._inst;
};

timeoutConnectHandler = TimeoutConnectHandler.getInstance();