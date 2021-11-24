
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