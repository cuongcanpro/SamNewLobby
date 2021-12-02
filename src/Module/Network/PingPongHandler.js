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
