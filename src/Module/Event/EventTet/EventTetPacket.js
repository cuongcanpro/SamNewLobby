/**
 * Created by cuongcan_pro on 12/21/2017.
 */

/*
    Packet Send
 */

// ------------- SEND -----------------------------
CmdSendEventTet = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_EVENT_NOTIFY);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendEventTetOpen = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_OPEN_EVENT);
    },

    putData: function (isOpen) {
        //pack
        this.packHeader();
        this.putByte(isOpen);
        //update
        this.updateSize();
    }
});

CmdSendEventTetGetMap = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_GET_MAP);
    },

    putData: function (index) {
        //pack
        this.packHeader();
        //update
        cc.log("INDEX " + index);
        this.putInt(index);
        this.updateSize();
    }
});

CmdSendEventTetOpenLixi = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_OPEN_LIXI);
    },

    putData: function (idLixi, position) {
        //pack
        this.packHeader();
        //update
        this.putInt(idLixi);
        this.putByte(position);
        this.updateSize();
    }
});


CmdSendEventTetGetShop = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.GET_SHOP_INFO);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendEventTetReset = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_RESET);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});


CmdSendEventTetVibrate = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_VIBRATE_EVENT);
    },

    putData: function (type) {
        this.packHeader();
        cc.log("TYPE VIBRATE " + type);
        this.putByte(type);
        this.updateSize();
    }
});

CmdSendEventTetFreeCombo = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_FREE_COMBO);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});


CmdSendEventTetCheatText = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_CHEAT_TEXT);
    },

    putData: function (specialText, exp, data) {
        this.packHeader();
        cc.log("SPECIAL Text " + specialText);
        this.putInt(specialText);
        this.putLong(exp);
        this.putShort(data.length);
        for (var i = 0; i < data.length; i++)
            this.putInt(data[i]);
        this.updateSize();
    }
});

CmdSendEventTetCheatLixi = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_CHEAT_LIXI);
    },

    putData: function (id, num) {
        this.packHeader();
        this.putInt(id);
        this.putInt(num);
        this.updateSize();
    }
});

CmdSendEventTetCheatG = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_CHEAT_G);
    },

    putData: function (numServer, numUser) {
        this.packHeader();
        this.putLong(numServer);
        this.putLong(numUser);
        this.updateSize();
    }
});

CmdSendEventTetCheatExp = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_CHEAT_EXP);
    },

    putData: function (num) {
        this.packHeader();
        this.putInt(num);
        this.updateSize();
    }
});

CmdSendEventTetCheatItem = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_CHEAT_ITEM);
    },

    putData: function (item, num) {
        this.packHeader();
        this.putInt(item);
        this.putInt(num);
        this.updateSize();
    }
});

CmdSendEventTetCheatCoinAccumulate = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_CHEAT_COIN_ACCUMULATE);
    },

    putData: function (coin, exp) {
        this.packHeader();
        this.putInt(coin);
        this.putLong(exp);
        this.updateSize();
    }
});

CmdSendEventTetGetFree = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_GET_FREE);
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendEventTetChangeAward = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_REGISTER);
    },

    putData: function (type, id, name, add, cmnd, phone, email) {
        if (name === undefined) name = "";
        if (phone === undefined) phone = "";
        if (cmnd === undefined) cmnd = "";
        if (add === undefined) add = "";
        if (email === undefined) email = "";

        cc.log("#SendChangeAward : " + type + "," + id + "," + name + " , " + phone + " , " + cmnd + " , " + add + " , " + email);

        this.packHeader();
        this.putByte(type ? 1 : 0);
        this.putInt(id);

        this.putString(name);
        this.putString(phone);
        this.putString(cmnd);
        this.putString(add);
        this.putString(email);
        this.updateSize();
    }
});


CmdSendEventTetGetInfoRegister = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_GET_INFO_REGISTER);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendEventTetGetGiftRegister = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_GET_GIFT_REGISTER);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendEventTetLookBack = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_GET_LOOK_BACK);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendEventTetGetLookBack = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_RECEIVE_LOOK_BACK);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendEventTetGetFreeText = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventTet.CMD_GET_FREE);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});


/*
 Packet Receive
 */

CmdReceiveEventTetNotify = CmdReceivedCommon.extend({

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
        this.wordNames = this.getStrings();
        this.giftPrices = this.getInts();
        // this.costs = this.getInts();
        // this.bonus = this.getInts();
        //
        // this.showX2G = this.getBool();


    },

    generateDayFromTime: function (sDay) {
        var dStart = new Date(sDay);

        var sStart = dStart.getDate() + "/" + (parseInt(dStart.getMonth()) + 1);
        return (sStart);
    }
});


CmdReceiveEventTetActionNotify = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.ids = this.getInts();
        this.numbers = this.getInts();
        //
        //this.gifts = [];
        //for (var i = 0; i < this.ids.length; i++) {
        //    var item = {};
        //    item.id = this.ids[i];
        //    item.gift = this.numbers[i];
        //    this.gifts.push(item);
        //}
        //
        //this.notify = this.getBool();
        //
        //this.ids = this.getInts();
        //this.nums = this.getInts();
        //this.golds = this.getLongs();
        //this.totalGold = this.getDouble();
        //
        //this.pieces = [];
        //for(var i = 0, size = this.ids.length ; i < size ; i++) {
        //    var obj = {};
        //    obj.id = this.ids[i];
        //    obj.num = this.nums[i];
        //    obj.gold = this.golds[i];
        //    this.pieces.push(obj);
        //}
    }
});


CmdReceiveEventTetInfo = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.keyCoin = this.getInt();

        this.currentLevelExp = this.getDouble();
        this.nextLevelExp = this.getDouble();

        this.curLevel = this.getInt();

        this.ids = this.getInts();
        this.lixi = this.getInts();
        this.availableReceive = this.getInts();
        this.arrayNumText = this.getInts();
        //this.items = this.getStrings();
        //this.gifts = this.getInts();
        //
        //this.list = {};
        //for (var i = 0, size = this.ids.length; i < size; i++) {
        //    var obj = {};
        //    obj.item = this.items[i].split(",");
        //    for (var j = 0; j < obj.item.length; j++) {
        //        obj.item[j] = +obj.item[j];
        //    }
        //    obj.gift = this.gifts[i];
        //
        //    this.list[this.ids[i]] = obj;
        //}
        //
        //
        //this.mapInfo = {};
        //this.mapInfo.data = this.getString().split(",");
        //this.mapInfo.row = this.getByte();
        //this.mapInfo.col = this.getByte();
    }
});

CmdReceiveEventTetAccumulateInfo = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.keyCoinAdd = this.getInts();
        this.keyCoin = this.getInts();

        this.additionExp = this.getDouble();
        this.currentLevelExp = this.getDouble();
        this.nextLevelExp = this.getDouble();
    }
});

CmdReceiveEventTetChangeAward = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();
        this.type = this.getByte();
    }
});


CmdReceiveEventTetUserChangeAward = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.userName = this.getString();
        this.giftId = this.getInt();
    }
});

CmdReceiveEventTetKeyCoinBonus = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.option = this.getByte();
        this.keyCoin = this.getInt();
        this.arrayText = this.getInts();
    }
});

CmdReceiveEventTetShopBonus = CmdReceivedCommon.extend({

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

        // this.gTicketValues = this.getInts();
        // this.gTicketTickets = this.getInts();

        this.smsTicketValues = this.getInts();
        this.smsTicketTickets = this.getInts();

        this.iapTicketValues = this.getInts();
        this.iapTicketTickets = this.getInts();

        this.zingTicketValues = this.getInts();
        this.zingTicketTickets = this.getInts();

        this.atmTicketValues = this.getInts();
        this.atmTicketTickets = this.getInts();

        this.zaloTicketValues = this.getInts();
        this.zaloTicketTickets = this.getInts();

        this.promoTicket = this.getInt();
        this.startPromoTicket = this.generateDayFromTime(this.getString());
        this.endPromoTicket = this.generateDayFromTimeEnd(this.getString());

    },

    generateDayFromTimeEnd: function (sDay) {
        var dStart = new Date(sDay);
        cc.log("TIME NEW " + dStart.getTime());
        dStart.setHours(0);
        var time = (dStart.getTime() - 1);
        var dNew = new Date(time);
        var sStart = dNew.getDate() + "/" + (parseInt(dNew.getMonth()) + 1);
        return (sStart);
    },

    generateDayFromTime: function (sDay) {
        var dStart = new Date(sDay);

        var sStart = dStart.getDate() + "/" + (parseInt(dStart.getMonth()) + 1);
        return (sStart);
    }
});

CmdReceiveEventTetMapLixi = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        // this.result = this.getByte();
        // this.lixiType = this.getByte();
        this.giftId = this.getInt();
        this.mapLixi = this.getInts();
        //this.coinFree = (this.getByte() == 0);
    }
});

CmdReceiveEventTetOpenLixi = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();
        this.giftId = this.getInt();
        this.receivedGiftId = this.getInt();
        this.position = this.getByte();
        this.mapLixi = this.getInts();
        this.numLixi = this.getInt();
    }
});
CmdReceiveEventTetOpenLixi.SUCCESS = 0;
CmdReceiveEventTetOpenLixi.INVALID_TYPE = 1;
CmdReceiveEventTetOpenLixi.INVALID_POSITION = 2;
CmdReceiveEventTetOpenLixi.PROCESSING_ERROR = 3;
CmdReceiveEventTetOpenLixi.CELL_OPENNED = 4;
CmdReceiveEventTetOpenLixi.NOT_IN_EVENT = 5;
CmdReceiveEventTetOpenLixi.ERROR_NEW_WEEK = 7;

CmdReceiveEventTetVibrate = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();
        this.ids = this.getInts();
        this.numbers = this.getInts();
        this.bonusGold = this.getDouble();
        //this.coinFree = (this.getByte() == 0);
    }
});
CmdReceiveEventTetVibrate.ERROR_NEW_DAY = 6;

CmdReceiveEventTetVibrate.ONE = 1;
CmdReceiveEventTetVibrate.TEN = 2;
CmdReceiveEventTetVibrate.HUNDRED = 4;

CmdReceiveEventTetShopText = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.ids = this.getInts();
    }
});


CmdReceiveEventTetCheatG = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.gServer = this.getDouble();
        this.gUser = this.getDouble();
    }
});


CmdReceiveEventTetGiftRegister = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.giftIds = this.getInts();
    }
});


CmdReceiveEventTetInfoRegister = CmdReceivedCommon.extend({

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
    }
});

CmdReceiveEventTetLookBack = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.currentDay = this.getInt();
        this.prefixMessage = this.getStrings();
        this.suffixMessage = this.getStrings();
        this.value = this.getStrings();
        this.rank = this.getStrings();
        this.isFinal = this.getBools();
        this.bonusGold = this.getDouble();
        this.bonusTicket = this.getInt();
        this.receivedGift = this.getByte();
    }
});

CmdReceiveEventTetLookBack.NOT_RECEIVED = 0;
CmdReceiveEventTetLookBack.USER_RECEIVED = 1;
CmdReceiveEventTetLookBack.DEVICE_RECEIVED = 2;

CmdReceiveEventTetGetLookBack = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.bonusGold = this.getDouble();
        this.bonusTicket = this.getInt();
    }
});

CmdReceiveEventTetGetLookBack.SUCCESS = 0;
CmdReceiveEventTetGetLookBack.USER_RECEIVED = 1;
CmdReceiveEventTetGetLookBack.DEVICE_RECEIVED = 2;
CmdReceiveEventTetGetLookBack.WRONG_DAY = 3;






