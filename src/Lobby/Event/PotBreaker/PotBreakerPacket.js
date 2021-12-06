/**
 * Created by Hunter on 7/26/2016.
 */

// ------------- RECEIVE -----------------------------
var CmdReceivePotBreakerNotify = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.eventTime = this.getByte();
        this.giftIds = this.getInts();
        this.giftNames = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            this.giftNames.push(this.getString());
        }
        this.giftValues = this.getLongs();

        this.timeLeft = this.getDouble();

        var startDays = this.getLongs();
        var endDays = this.getLongs();
        this.eventWeeks = [];
        for (var i = 0; i < startDays.length; i++) {
            this.eventWeeks.push(this.generateDayFromTime(startDays[i], endDays[i]));
        }
        this.eventDayFrom = this.generateDayFromTime(startDays[0]);
        this.eventDayTo = this.generateDayFromTime(endDays[endDays.length - 1]);

        this.isRegisterSuccess = this.getBool();
        this.urlNews = this.getString();
    },

    generateDayFromTime: function (sDay) {
        var dStart = new Date(sDay);

        var sStart = dStart.getDate() + "/" + (parseInt(dStart.getMonth()) + 1);
        return (sStart);
    }
});

var CmdReceivePotBreakerActionNotify = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.unreceivedInGiftId = this.getInts();
        this.unreceivedTopGiftId = this.getInt();
        this.bonusGold = this.getDouble();
    }
});

var CmdReceivePotBreakerInfo = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.numberTicket = this.getInt();

        this.ids = this.getInts();
        this.numberToken = this.getInts();
        this.numberTokenNeedToClaim = this.getInts();

        this.mapInfo = this.getBytes();
        this.unreceivedInGiftId = this.getInts();
        this.unreceivedTopGiftId = this.getInt();

        this.numGoldPot = this.getByte();

        this.currentLevelExp = this.getDouble();
        this.nextLevelExp = this.getDouble();
        this.curLevel = this.getInt();
    }
});

var CmdReceivePotBreakerTicketReceive = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.numberTicket = this.getInt();
        this.reasonReceive = this.getDouble();
    }
});

CmdReceivePotBreakerTicketReceive.PLAY_GAME_TICKET = 0;
CmdReceivePotBreakerTicketReceive.BUY_GOLD_TICKET = 1;
CmdReceivePotBreakerTicketReceive.FREE_TICKET = 2;

var CmdReceivePotBreakerRoll = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.rollType = this.getByte();
        this.result = this.getByte();

        if (this.result == 1) {
            this.giftsResult = this.getInts();
            this.numGifts = this.getInts();
            this.listBrokenPot = this.getBytes();
            this.isSpecialPot = this.getBytes();
        }
    }
});

var CmdReceivePotBreakerChangeAward = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();
        this.isTop = this.getByte();
        this.idGift = this.getInt();
        this.bonusGold = this.getDouble();
    }
});

var CmdReceivePotBreakerGServer = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.gServer = this.getDouble();
        this.gUser = this.getDouble();
    }
});

var CmdReceivePotBreakerTopInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.week = this.getByte();
        this.remainedTime = this.getDouble();
        this.topRanks = this.getBytes();
        this.topUserIds = this.getInts();
        this.topNames = this.getStrings();
        this.topAvatars = this.getStrings();
        this.topTokens = this.getStrings();
        this.topAward = this.getInts();
    }
});

var CmdReceivePotBreakerMyRankInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.week = this.getByte();
        this.myRank = this.getByte();
        this.totalNumberToken = [];
        var lengthToken = this.getShort();
        for (var i = 0; i < lengthToken; i++){
            this.totalNumberToken.push(this.getDouble());
        }
    }
});

var CmdReceivePotBreakerTicketInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.isStartGame = this.getByte();
        this.numberTicket = this.getInt();
        this.userId = this.getInt();
    }
});

var CmdReceivePotBreakerShopBonus = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.g2GoldFirstValue = this.getInts();
        this.g2GoldFirstTicket = this.getInts();

        this.smsGoldFirstValue = this.getInts();
        this.smsGoldFirstTicket = this.getInts();

        this.iapGoldFirstValue = this.getInts();
        this.iapGoldFirstTicket = this.getInts();

        this.zingGoldFirstValue = this.getInts();
        this.zingGoldFirstTicket = this.getInts();

        this.atmGoldFirstValue = this.getInts();
        this.atmGoldFirstTicket = this.getInts();

        this.zaloPayGoldFirstValue = this.getInts();
        this.zaloPayGoldFirstTicket = this.getInts();
    }
});

var CmdReceivePotBreakerRegisterInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.fullName = this.getString();
        this.phone = this.getString();
        this.identity = this.getString();
        this.address = this.getString();
        this.email = this.getString();

        this.registerGiftIds = this.getInts();
    }
});

var CmdReceivePotBreakerNumberTicket = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.numberTickets = this.getInt();
    }
});

CmdReceivePotBreakerAccumulateInfo = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.keyCoinAdd = this.getInt();
        this.keyCoin = this.getInt();

        this.additionExp = this.getDouble();
        this.currentLevelExp = this.getDouble();
        this.nextLevelExp = this.getDouble();
    }
});


// ------------- SEND -----------------------------
var CmdSendPotBreaker = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_EVENT_NOTIFY);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    },
});

var CmdSendPotBreakerOpen = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_OPEN_EVENT);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    },
});

var CmdSendPotBreakerRoll = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_ROLL_EVENT);
    },

    putData: function (id, position) {
        cc.log("CmdSendPotBreakerRoll " , id , position);
        this.packHeader();
        this.putByte(id);
        this.putByte(position);
        this.updateSize();
    },
});

var CmdSendPotBreakerChangeAward = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_CHANGE_AWARD);
    },

    putData: function (isTop, id, name, add, cmnd, phone, email) {
        if (name === undefined) name = "";
        if (phone === undefined) phone = "";
        if (cmnd === undefined) cmnd = "";
        if (add === undefined) add = "";
        if (email === undefined) email = "";

        cc.log("#SendChangeAward : " + isTop + "," + id + "," + name + " , " + phone + " , " + cmnd + " , " + add + " , " + email);

        this.packHeader();
        this.putByte(isTop ? 1 : 0);
        this.putInt(id);

        this.putString(name);
        this.putString(phone);
        this.putString(cmnd);
        this.putString(add);
        this.putString(email);
        this.updateSize();
    },
});

var CmdSendPotBreakerCheatTicket = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_CHEAT_TICKET);
    },

    putData: function (numberAddTicket, numberAddExp) {
        this.packHeader();
        this.putInt(numberAddTicket);
        this.putLong(numberAddExp);
        this.updateSize();
    },
});

var CmdSendPotBreakerGetInfoTop = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_TOP_INFO);
    },

    putData: function (week) {
        this.packHeader();
        this.putByte(week);
        this.updateSize();
    }
});

var CmdSendPotBreakerGetMyRank = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_MY_RANK);
    },

    putData: function (week) {
        cc.log("CmdSendPotBreakerGetMyRank: " + week);
        this.packHeader();
        this.putByte(week);
        this.updateSize();
    }
});

var CmdSendPotBreakerCheatToken = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_CHEAT_ITEM);
    },

    putData: function (item, num) {
        this.packHeader();
        this.putInt(item);
        this.putInt(num);
        this.updateSize();
    },
});

var CmdSendPotBreakerCheatReset = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_CHEAT_RESET_EVENT);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    },
});


var CmdSendPotBreakerCheatGServer = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_CHEAT_G_SERVER);
    },

    putData: function (gServer, gUser) {
        this.packHeader();
        this.putLong(gServer);
        this.putLong(gUser);
        this.updateSize();
    },
});

var CmdSendPotBreakerGetRegisterInfo = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_GET_REGISTER_INFO);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    },
});

var CmdSendPotBreakerGetNumberTicket = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_GET_NUMBER_TICKET);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    },
});

var CmdSendPotBreakerGetFreeTicket = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PotBreaker.CMD_GET_FREE_TICKET);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    },
});

