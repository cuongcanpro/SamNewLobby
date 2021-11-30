
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


CmdSendMobile = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_MOBILE);

    },
    putData: function (deviceModel, osVersion, mobile, deviceID, update, installDate) {
        cc.log("SendMobile : " + deviceModel + "/" + osVersion + "/" + mobile + "/" + deviceID + "/" + update + "/" + installDate);
        //pack
        this.packHeader();
        this.putString("" + deviceModel);
        this.putString("" + osVersion);
        this.putByte(mobile);
        this.putString("" + deviceID);

        this.putString(gamedata.appVersion);
        this.putString("aa");
        this.putString("aa");
        this.putInt(Constant.APP_FOOTBALL);

        this.putByte(update);
        this.putString(installDate);

        if (gamedata.networkOperator != "") {
            this.putShort(1);
            this.putString(gamedata.networkOperator);
        } else {
            this.putShort(0);
        }

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