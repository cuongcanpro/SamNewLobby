
CmdSendGetUserInfo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(UserMgr.CMD_GET_USER_INFO);
        this.putData();
    },

    putData: function () {
        this.packHeader();
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
        }

        //update
        this.updateSize();
    }
});


CmdReceivedUserInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.uId = this.getInt();
        this.userName = this.getString();
        this.zName = this.getString();
        this.avatar = this.getString();
        this.gold = this.getDouble();
        this.zMoney = this.getDouble();
        this.levelScore = this.getDouble();
        this.winCount = this.getInt();
        this.lostCount = this.getInt();
        //this.isShopBonus = this.getByte();
        //this.isShopIAPBonus = this.getByte();

        this.isHolding = this.getBool();

        this.payments = this.getBools();

        if (Config.ENABLE_IAP_LIMIT_TIME) {
            this.totalGIAP = this.getInt();
            this.idPackage = this.getInt();
            this.totalDayIAP = this.getInt();
            this.dayReceivedIAP = this.getInt();
            this.arrayPackageIAP = this.getBools();
            this.arrayPackageTime = this.getLongs();
        }

        this.enablePayment = this.getBool();

        this.level = this.getInt();
        this.levelExp = Number(this.getLong());
        this.diamond = this.getDouble();
    }
});


CmdReceivedUpdateBean = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.uID = this.getInt();
        this.nChair = this.getByte();
        this.bean = this.getDouble();
        this.coin = this.getDouble();
        this.levelScore = this.getDouble();
        this.winCount = this.getInt();
        this.lostCount = this.getInt();
        this.level = this.getInt();
        this.levelExp = this.getDouble();
        this.diamond = this.getDouble();

        var info = {};
        info.coin = this.coin;
        info.uId = this.uID;
        info.bean = this.bean;
        info.levelScore = this.levelScore;
        info.winCount = this.winCount;
        info.lostCount = this.lostCount;
        info.level = this.level;
        info.levelExp = this.levelExp;
        info.diamond = this.diamond;
        this.info = info;
    }
});

CmdReceivedUpdateCoin = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.coin = this.getDouble();
    }
});

CmdReceivedConfig = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.jsonConfig = this.getString();
    }
});