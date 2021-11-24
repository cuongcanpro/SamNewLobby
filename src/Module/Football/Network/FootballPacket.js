/**
 * Created by HunterPC on 9/7/2015.
 */

/**
 * Created by HunterPC on 8/27/2015.
 */

// ------------- RECEIVE -----------------------------
CmdReceiveGetBet = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

    }
});

CmdReceiveGetConfigWC = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.config = this.getString();
        this.host = this.getString();
    }
});

CmdReceiveHistoryBetAMatchToUser = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        var num = this.getInt();

        this.listHistory = [];

        for (var i = 0; i < num; i++) {
            var hObj = {};
            hObj.historyBetId = this.getInt();
            hObj.game = this.getString();
            hObj.homeId = this.getByte();
            hObj.awayId = this.getByte();
            hObj.time = this.getDouble();
            hObj.rateMatch = this.getDouble();
            hObj.scoreHome = this.getByte();
            hObj.scoreAway = this.getByte();
            hObj.moneyBet = this.getDouble();
            hObj.betType = this.getByte();
            hObj.betValue = this.getDouble();
            hObj.rateMoney = this.getDouble();
            hObj.duDoanScoreHome = this.getByte();
            hObj.duDoanScoreAway = this.getByte();
            hObj.moneyGet = this.getDouble();
            hObj.totalMoneyGet = this.getDouble();
            hObj.isReceive = this.getBool();
            hObj.status = this.getByte();
            hObj.nResult = this.getByte();

            this.listHistory.push(hObj);
        }
    }
});

CmdReceiveHistoryBetToUser = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.isMyHistory = this.getBool();

        var num = this.getInt();
        this.listHistory = [];

        for (var i = 0; i < num; i++) {
            var hObj = {};
            hObj.historyBetId = this.getInt();
            hObj.game = this.getString();
            hObj.homeId = this.getByte();
            hObj.awayId = this.getByte();
            hObj.time = this.getDouble();
            hObj.rateMatch = this.getDouble();
            hObj.scoreHome = this.getByte();
            hObj.scoreAway = this.getByte();
            hObj.moneyBet = this.getDouble();
            hObj.betType = this.getByte();
            hObj.betValue = this.getDouble();
            hObj.rateMoney = this.getDouble();
            hObj.duDoanScoreHome = this.getByte();
            hObj.duDoanScoreAway = this.getByte();
            hObj.moneyGet = this.getDouble();
            hObj.totalMoneyGet = this.getDouble();
            hObj.isReceive = this.getBool();
            hObj.status = this.getByte();
            hObj.nResult = this.getByte();

            this.listHistory.push(hObj);
        }
    }
});

CmdReceiveUserBet = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

    }
});

CmdReceiveUpdateListMatch = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.listHistory = [];

        var num = this.getInt();
        for (var i = 0; i < num; i++) {
            var data = {};
            data.Id = this.getInt();
            data.time = this.getDouble();
            data.home = this.getByte();
            data.away = this.getByte();
            data.rateWinLostHome = this.getDouble();
            data.rateWinLostAway = this.getDouble();
            data.rateWinLostMoneyHome = this.getDouble();
            data.rateWinLostMoneyAway = this.getDouble();
            data.rateTaiXiu = this.getDouble();
            data.rateMoneyDuoiTaiXiu = this.getDouble();
            data.rateMoneyTrenTaiXiu = this.getDouble();
            data.scoreResultHome = this.getByte();
            data.scoreResultAway = this.getByte();
            data.status = this.getByte();
            this.listHistory.push(data);
        }
    }
});

CmdReceiveTopXuiXeo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.listRank = [];

        var num = this.getByte();
        for (var i = 0; i < num; i++) {
            var data = {};
            data.uId = this.getInt();
            data.username = this.getString();
            data.nWin = this.getInt();
            data.nLost = this.getInt();
            data.nDraw = this.getInt();
            data.rateWin = this.getDouble();
            data.point = this.getDouble();
            this.listRank.push(data);
        }
    }
});

CmdReceiveTopCaoThu = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.listRank = [];

        var num = this.getByte();
        for (var i = 0; i < num; i++) {
            var data = {};
            data.uId = this.getInt();
            data.username = this.getString();
            data.nWin = this.getInt();
            data.nLost = this.getInt();
            data.nDraw = this.getInt();
            data.rateWin = this.getDouble();
            data.point = this.getDouble();
            this.listRank.push(data);
        }
    }
});

CmdReceiveInfoEvent = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.data = {};
        this.data.isEnterInfo = this.getBool();
        this.data.nWin = this.getInt();
        this.data.nLost = this.getInt();
        this.data.nDraw = this.getInt();
        this.data.nRateWin = this.getDouble();
        this.data.point = this.getDouble();
        this.data.rankCaoThu = this.getInt();
        this.data.rankXuiXeo = this.getInt();
    }
});

CmdReceiveListMath = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.matchCount = this.getByte();
    }
});

// ------------- SEND -----------------------------
CmdSendBetMatch = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(FootballHandler.EVENT_WORLD_CUP_BET);
    },

    putData: function (matchId, betType, moneyBet, betValue, scoreHome, scoreAway) {
        this.packHeader();
        this.putInt(matchId);
        this.putInt(betType);
        this.putLong(moneyBet);
        this.putInt(betValue);
        this.putInt(scoreHome);
        this.putInt(scoreAway);
        this.updateSize();
    }
});

CmdSendGetBet = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(FootballHandler.EVENT_WORLD_CUP_GET_MONEY);
    },

    putData: function (uid, name) {
        this.packHeader();
        this.putInt(uid);
        this.putString(name);
        this.updateSize();
    }
});

CmdSendGetConfigWC = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(FootballHandler.EVENT_WORLD_CUP_GET_CONFIG);

        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendGetHistory = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(FootballHandler.EVENT_WORLD_CUP_HISTORY_TOP_USER);
    },

    putData: function (uid) {
        this.packHeader();
        this.putInt(uid);
        this.updateSize();
    }
});

CmdSendGetMyHistory = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(FootballHandler.EVENT_WORLD_CUP_UPDATE_HISTORY_BET);

        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendListMatch = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(FootballHandler.EVENT_WORLD_CUP_LIST_MATCH);

        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendGetWCInfo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(FootballHandler.EVENT_WORLD_CUP_INFO);

        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});