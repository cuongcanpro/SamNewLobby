
CmdSendLogin = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LoginMgr.CMD_LOGIN);

    },
    putData: function (sessionkey) {
        //pack
        this.packHeader();

        var session = CookieUtility.getCookie(CookieUtility.KEY_SESSION_KEY);
        if (session !== "") {
            sessionkey = gameMgr.getSessionKey();
        }
        cc.log("SESSION KEY " + sessionkey);
        if (cc.sys.isNative || Config.ENABLE_DEV) {
            this.putString(sessionkey);
        } else {
            this.putString(sessionkey, true);
        }
        this.putString(NativeBridge.getDeviceID());
        if (session !== "") {
            this.putInt(!cc.sys.isNative);
        }
        //update
        this.updateSize();
    }
});


var CmdSendMobile = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LoginMgr.CMD_MOBILE);

    },
    putData: function (deviceModel, osVersion, mobile, deviceID, update, installDate) {
        cc.log("SendMobile : " + gamedata.appVersion + "/" + deviceModel + "/" + osVersion + "/" + mobile + "/" + deviceID + "/" + update + "/" + installDate);
        this.packHeader();
        this.putString("" + deviceModel);
        this.putString("" + osVersion);
        this.putByte(mobile);
        this.putString("" + deviceID);
        this.putString(gameMgr.appVersion);
        this.putString("aa");
        this.putString("aa");
        this.putInt(Constant.APP_FOOTBALL);

        this.putByte(update);
        // this.putByte(true);
        this.putString(installDate);

        if (gamedata.networkOperator != "") {
            this.putShort(1);
            if (Config.ENABLE_PAYMENT_SERVICE) {
                this.putString("12345");
            } else {
                this.putString("");
            }
        } else {
            this.putShort(0);
        }
        this.putInt(1); // version de phan biet ban IOS cu
        this.updateSize();
    }
});

CmdSendGetConfig = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(UserMgr.CMD_GET_CONFIG);

        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdReceiveConnectFail = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.ip = this.getString();
        this.port = this.getInt();
    }
});


CmdReceiveMobile = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.version = this.getString();
        this.enablepayment = this.getBool();

        try {
            this.payments = this.getBools();

            if (this.payments.length <= 3)
                this.payments.push(false);
            //   this.payments[3] = false;
            cc.log(" Payments : " + JSON.stringify(this.payments));
        } catch (e) {
            cc.log("Server old: " + e);
            this.payments = [false, false, true];
        }

    }
});