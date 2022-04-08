
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


CmdReceivedUserInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.getPlayerInit = this.getByte();
        // this.isShopBonus = this.getBool();
        // this.showBonusNotice = this.getByte();
        this.avatar = this.getString();
        this.uId = this.getInt();
        this.userName = this.getString();
        this.gold = this.getDouble();
        this.zMoney = this.getDouble();
        this.levelScore = this.getDouble();
        this.getInt();
        this.getInt();
        this.getString();
        this.getByte();
        this.getInt();

        this.winCount = this.getInt();
        this.lostCount = this.getInt();
        this.zName = this.getString();

        this.getInt();
        //  this.isShopIAPBonus = this.getByte();

        this.totalGIAP = this.getInt();
        cc.log("TOTAL GIAP " + this.totalGIAP);
        this.idPackage = this.getInt();
        this.totalDayIAP = this.getInt();
        this.dayReceivedIAP = this.getInt();
        this.arrayPackageIAP = this.getBools();
        //
        for (var i = 0; i < this.arrayPackageIAP.length; i++) {
            cc.log("PACKAGE ***** " + this.arrayPackageIAP[i]);
        }

        if (Config.ENABLE_IAP_LIMIT_TIME) {
            this.totalGIAP = this.getInt();
            this.idPackage = this.getInt();
            this.totalDayIAP = this.getInt();
            this.dayReceivedIAP = this.getInt();
            this.arrayPackageIAP = this.getBools();
            this.arrayPackageTime = this.getLongs();
        }

        this.level = this.getInt();
        this.levelExp = this.getDouble();
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


var CmdReceivedAvatarConfig = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.avatarConfigs = this.getStrings();
    }
});


var CmdSendInBoardAvatar = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(UserMgr.CMD_CHANGE_AVATAR);
    },

    putData: function (avatarIndex) {
        //pack
        this.packHeader();
        this.putByte(avatarIndex);
        //update
        this.updateSize();
    }
});