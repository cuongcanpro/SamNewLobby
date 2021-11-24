/**
 * Created by Hunter on 5/25/2016.
 */

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

CmdReceivedRefreshTable = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.list = [];

        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            this.list.push({});
        }
        for (var i = 0; i < size; i++) {
            this.list[i].tableID = this.getInt();
        }
        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].tableIndex = this.getInt();
        }

        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].tableName = this.getString();
        }
        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].type = this.getByte();
        }

        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].bet = this.getByte();
        }

        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].personCount = this.getByte();
        }
        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].totalCount = this.getByte();
        }

        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].bigBet = this.getBool();
        }

        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].requirePass = this.getInt();
        }
    }
});

CmdReceivedUpdateSearchTable = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {

        this.list = [];
        this.list.push({});

        this.list[0].tableID = this.getInt();
        this.list[0].tableIndex = this.getInt();
        this.list[0].personCount = this.getByte();
        this.list[0].totalCount = this.getByte();
        this.list[0].type = this.getByte();
        this.list[0].tableName = this.getString();
        this.list[0].requirePass = this.getByte();

        this.list[0].bet = this.getByte();
        this.list[0].bigBet = this.getByte();

    }
});

CmdReceiveSupportBean = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.nBean = this.getInt();
        this.numSupport = this.getByte();
        this.delay = this.getDouble();
        this.isWaitingSpecialSupport = this.getBool();
        this.isSpecial = this.getBool();

        this.remainStart = this.getDouble();
        this.remainEnd = this.getDouble();
    }
});

CmdSendCreateRoom = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CREATE_ROOM);
    },
    putData: function (name, bet, bigbet, password, numpeople) {
        //pack
        this.packHeader();

        this.putString(name);
        this.putByte(bet);
        this.putByte(1);
        this.putString(password);
        this.putByte(numpeople);
        this.putByte(bigbet);

        //update
        this.updateSize();
    }
});

CmdSendCheatMoney = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_MONEY);
    },
    putData: function (money, coin, exp) {
        //pack
        this.packHeader();
        this.putLong(money);
        this.putLong(coin);
        this.putLong(exp);
        cc.log("SEND EXP " + exp);

        //update
        this.updateSize();
    }
});

CmdSendCheatJackpot = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_JACKPOT);
    },

    putData: function (jp) {
        //pack
        this.packHeader();
        this.putInt(jp);
        //update
        this.updateSize();
    }
});

CmdSendCheatEXP = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_EXP);
    },

    putData: function (exp) {
        //pack
        this.packHeader();
        this.putLong(exp);

        //update
        this.updateSize();
    }
});

CmdSendCheatOldExp = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_OLD_EXP);
    },

    putData: function(oldExp) {
        //pack
        this.packHeader();
        this.putLong(oldExp);
        cc.log("Send cheat old exp: " + oldExp);
        //update
        this.updateSize();
    }
});

CmdSendCheatGStar = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_GSTAR);
    },

    putData: function (gstar) {
        //pack
        this.packHeader();
        this.putLong(gstar);

        //update
        this.updateSize();
    }
});

CmdSendCheatConfigCard = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_CARD);
    },
    putData: function (cards) {
        //pack
        this.packHeader();

        if (Config.ENABLE_CHEAT) {
            this.putByte(1);
        } else {
            this.putByte(0);
        }

        this.putByte(1);

        this.putShort(cards.length);
        for (var i = 0; i < cards.length; i++) {
            this.putByte(cards[i]);
        }

        //update
        this.updateSize();
    }
});