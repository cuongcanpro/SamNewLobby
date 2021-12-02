
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


CmdSendGameInfo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(UserMgr.CMD_GET_CONFIG);
    },

    putData: function (deviceName, osVersion, platform, deviceId, appVersion, trackingSource, mac, footballVersion, isUpdateApp, installDate, configVersion, quickConnect) {
        cc.log("++GameInfo " + JSON.stringify(arguments));

        //pack
        this.packHeader();

        this.putString(deviceName);
        this.putString(osVersion);
        this.putByte(platform);
        this.putString(deviceId);
        this.putString(appVersion);
        this.putString(trackingSource);
        this.putString(mac);
        this.putInt(footballVersion);
        this.putByte(isUpdateApp ? 1 : 0);
        this.putString(installDate);

        this.putInt(configVersion);
        this.putByte(quickConnect ? 1 : 0);

        var networkInfo = NativeBridge.getTelephoneInfo();
        if (networkInfo && networkInfo != "") {
            this.putShort(1);
            this.putString(networkInfo);
            cc.log("Sim Operator : " + networkInfo);
        } else {
            this.putShort(0);
            this.putString("");
        }
        this.putInt(1); // version de phan biet ban IOS cu

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