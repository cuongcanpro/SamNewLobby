
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