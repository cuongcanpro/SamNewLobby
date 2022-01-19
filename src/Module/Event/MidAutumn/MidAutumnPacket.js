/**
 * Created by Hunter on 7/26/2016.
 */

// ------------- RECEIVE -----------------------------
CmdReceiveMidAutumnNotify = CmdReceivedCommon.extend({

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
        this.priceChangePiece = this.getLong();
        this.giftPrices = this.getInts();
        // this.costs = this.getInts();
        // this.bonus = this.getInts();
        // this.showX2G = this.getBool();
        //
        // this.isBuyGEvent = this.getBool();
    },

    generateDayFromTime: function (sDay) {
        var dStart = new Date(sDay);

        var sStart = dStart.getDate() + "/" + (parseInt(dStart.getMonth()) + 1);
        return (sStart);
    }
});

CmdReceiveMidAutumnActionNotify = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.ids = this.getInts();
        this.numbers = this.getInts();

        this.gifts = [];
        for (var i = 0; i < this.ids.length; i++) {
            var item = {};
            item.id = this.ids[i];
            item.gift = this.numbers[i];
            this.gifts.push(item);
        }

        this.notify = this.getBool();

        this.giftToGold = this.getInts();
        this.numberToGold = this.getInts();
        this.toGold = this.getLongs();
        this.totalGold = this.getDouble();
    }
});

CmdReceiveMidAutumnInfo = CmdReceivedCommon.extend({

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
        this.items = this.getStrings();
        this.gifts = this.getInts();
        this.list = {};
        for (var i = 0, size = this.ids.length; i < size; i++) {
            var obj = {};
            obj.item = this.items[i].split(",");
            for (var j = 0; j < obj.item.length; j++) {
                obj.item[j] = +obj.item[j];
            }
            obj.gift = this.gifts[i];

            this.list[this.ids[i]] = obj;
        }

        this.mapInfo = {};
        this.mapInfo.data = this.getString().split(",");
        this.mapInfo.row = this.getByte();
        this.mapInfo.col = this.getByte();
    }
});

CmdReceiveMidAutumnAccumulateInfo = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.keyCoinAdd = this.getInt();
        this.keyCoin = this.getInt();
        this.keyCoinAward = this.getInt();

        this.additionExp = this.getDouble();
        this.currentLevelExp = this.getDouble();
        this.nextLevelExp = this.getDouble();
    }
});

CmdReceiveMidAutumnRoll = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();

        if (this.result == 1) {
            this.ids = this.getInts();
            this.numbers = this.getInts();
            this.rows = this.getBytes();
            this.columns = this.getBytes();
            this.numMoves = this.getBytes();

            this.gifts = {};
            for (var i = 0, size = this.ids.length; i < size; i++) {
                var id = this.ids[i];
                if (id in this.gifts) {
                    this.gifts[id] += this.numbers[i];
                }
                else {
                    this.gifts[id] = this.numbers[i];
                }
            }
            this.bonusGold = this.getDouble();
            if (this.numMoves.length == 0) {
                this.gifts[MD_GOLD_GIFT_EXTRA_ID] = this.bonusGold;
            }
        }
    }
});

CmdReceiveMidAutumnChangeAward = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();
        this.type = this.getByte();
    }
});
CmdReceiveMidAutumnChangeAward.OUT_GAME = 0;
CmdReceiveMidAutumnChangeAward.IN_GAME = 0;

CmdReceiveMidAutumnUserChangeAward = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.userName = this.getString();
        this.giftId = this.getInt();
    }
});

CmdReceiveMidAutumnKeyCoinBonus = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.keyCoin = this.getInt();
        this.option = this.getByte();
    }
});

CmdReceiveMidAutumnGServer = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.gServer = this.getDouble();
        this.gUser = this.getDouble();
    }
});

CmdReceiveMidAutumnShopBonus = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        // this.g2GoldValues = this.getInts();
        // this.g2GoldTickets = this.getInts();
        //
        // this.gTicketValues = this.getInts();
        // this.gTicketTickets = this.getInts();
        // this.gTicketRealTickets = this.getInts();
        //
        // this.smsTicketValues = this.getInts();
        // this.smsTicketTickets = this.getInts();
        //
        // this.iapGFirstValues = this.getInts();
        // this.iapGFirstTickets = this.getInts();
        //
        // this.zingFirstValues = this.getInts();
        // this.zingFirstTickets = this.getInts();
        //
        // this.atmFirstValues = this.getInts();
        // this.atmGFirstTickets = this.getInts();

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

CmdReceiveMidAutumnRegisterInfor = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.name = this.getString();
        this.phone = this.getString();
        this.cmnd = this.getString();
        this.address = this.getString();
        this.email = this.getString();

        this.giftIds = this.getInts();
    }
});

CmdReceiveMidAutumnRollHistory = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        try {
            this.histories = JSON.parse(this.getString());
        }
        catch(e) {
            this.histories = [];
        }
    }
});

CmdReceiveMidAutumnGiftHistory = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.ids = this.getInts();
    }
});


CmdReceiveMidAutumnChangePiece = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.numPiece = this.getInt();
        this.gold = this.getDouble();
    }
});

CmdReceiveMidAutumnLampInfo = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.rolledId = this.getInts();
        this.rolledNumber = this.getInts();

        this.rolledType = this.getInts();
        for (var i = 0; i < length; i++)
            this.rolledType.push(this.getDouble());

        this.receivedId = this.getInts();
        this.receivedFromUserId = this.getInts();
        this.receivedFromUserName = this.getStrings();
        this.receivedMessage = this.getStrings();
        this.receivedType = this.getInts();

        this.usingLampId = this.getInt();
        this.usingLampIndex = this.getInt();
        this.usingLampIsRolled = this.getByte();

        this.receivedLampTimeToday = this.getInt();
        this.sendLampTimeToday = this.getInt();

        this.lampTypeId = this.getInts();
        this.lampTypeName = this.getStrings();
        this.lampTypeValue = [];
        var length = this.getShort();
        for (var i = 0; i < length; i++)
            this.lampTypeValue[i] = this.getDouble();
    }
});

CmdReceiveMidAutumnChangeLamp = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.isRolledLamp = this.getBytes();
        this.index = this.getInts();
        this.id = this.getInts();
        this.number = this.getInts();
        this.gold = this.getDouble();
    }
});

CmdReceiveMidAutumnSendLamp = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.isSender = this.getByte();
        this.id = this.getInt();
        this.userId = this.getInt();
        this.userName = this.getString();
        this.avatar = this.getString();
        this.message = this.getString();
        this.index = this.getInt();
    }
});
CmdReceiveMidAutumnSendLamp.SUCCESS = 0;
CmdReceiveMidAutumnSendLamp.FAIL = 1;
CmdReceiveMidAutumnSendLamp.FRIEND_RECEIVE_LIMIT = 2;
CmdReceiveMidAutumnSendLamp.SEND_LIMIT = 3;
CmdReceiveMidAutumnSendLamp.FRIEND_STORE_LIMIT = 4;

CmdReceiveMidAutumnUseLamp = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.isRolledLamp = this.getByte();
        this.id = this.getInt();
        this.index = this.getInt();

    }
});

CmdReceiveMidAutumnInGameLamp = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.usingLampId = this.getInts();
    }
});

// ------------- SEND -----------------------------
CmdSendMidAutumn = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_EVENT_NOTIFY);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    },
});

CmdSendMidAutumnOpen = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_OPEN_EVENT);
    },

    putData: function (isOpen) {
        //pack
        this.packHeader();
        this.putByte(isOpen);
        //update
        this.updateSize();
    },
});

CmdSendMidAutumnRoll = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_ROLL_EVENT);
    },

    putData: function (type) {
        cc.log("TYPE " + type);
        this.packHeader();
        this.putByte(type);
        this.updateSize();
    },
});

CmdSendMidAutumnChooseDirect = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_ROLL_CHOOSE_DIRECT);
    },

    putData: function (stage,moveDirect,moveNum) {
        cc.log("++SendChooseDirect " + JSON.stringify(arguments));

        this.packHeader();
        this.putByte(stage);
        this.putByte(moveDirect);
        this.putByte(moveNum);
        this.updateSize();
    },
});

CmdSendMidAutumnChangeAward = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_CHANGE_AWARD);
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
    },
});

CmdSendMidAutumnChangeStage = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_CHANGE_STAGE);
    },

    putData: function (stage) {
        cc.log("++SendChangeStage " + stage);
        this.packHeader();
        this.putByte(stage);
        this.updateSize();
    },
});

CmdSendMidAutumnGetRegisterInfo = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_GET_REGISTER_INFORMATION);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    },
});

CmdSendMidAutumnGetRollHistory = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_GET_ROLL_HISTORY);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    },
});

CmdSendMidAutumnGetGiftHistory = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_GET_GIFT_HISTORY);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    },
});

CmdSendMidAutumnBuyTicketG = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_EVENT_BUY_TICKET_BY_G);
    },

    putData: function (coin) {
        this.packHeader();
        this.putInt(coin);
        this.updateSize();
    },
});


CmdSendMidAutumnChangePiece = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_CHANGE_PIECE);
    },

    putData: function (arrayId, arrayPiece, arrayNum, arrayGoldId, arrayGoldPiece, arrayGoldNum) {
        cc.log("CHANGE PIECE DATA " + JSON.stringify(arguments));
        this.packHeader();
        this.putShort(arrayId.length);
        for (var i = 0; i < arrayId.length; i++) {
            this.putInt(arrayId[i]);
        }
        this.putShort(arrayPiece.length);
        for (var i = 0; i < arrayPiece.length; i++) {
            this.putByte(arrayPiece[i]);
        }
        this.putShort(arrayNum.length);
        for (var i = 0; i < arrayNum.length; i++) {
            this.putInt(arrayNum[i]);
        }
        this.putShort(arrayGoldId.length);
        for (var i = 0; i < arrayGoldId.length; i++) {
            this.putInt(arrayGoldId[i]);
        }
        this.putShort(arrayGoldPiece.length);
        for (var i = 0; i < arrayGoldPiece.length; i++) {
            this.putByte(arrayGoldPiece[i]);
        }
        this.putShort(arrayGoldNum.length);
        for (var i = 0; i < arrayGoldNum.length; i++) {
            this.putInt(arrayGoldNum[i]);
        }
        this.updateSize();
    },
});

// Cheat
CmdSendMidAutumnCheatItem = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_CHEAT_ITEM);
    },

    putData: function (item, num) {
        cc.log("++CheatItem : " + JSON.stringify(arguments));
        this.packHeader();
        this.putInt(item);
        this.putInt(num);
        this.updateSize();
    },
});

CmdSendMidAutumnCheatCoinFree = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_CHEAT_COIN_FREE_DAY);
        this.putData();
    },

    putData: function () {
        cc.log("++CheatCoinFree");
        this.packHeader();
        this.updateSize();
    },
});

CmdSendMidAutumnCheatReset = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_CHEAT_RESET);
        this.putData();
    },

    putData: function () {
        cc.log("++CheatResetServer");
        this.packHeader();
        this.updateSize();
    },
});

CmdSendMidAutumnCheatCoinAccumulate = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_CHEAT_COIN_ACCUMULATE);
    },

    putData: function (coin, exp) {
        cc.log("++CheatCoin-Exp : " + JSON.stringify(arguments));
        this.packHeader();
        this.putInt(coin);
        this.putLong(exp);
        this.updateSize();
    },
});

CmdSendMidAutumnCheatNumRoll = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_CHEAT_NUM_ROLL);
    },

    putData: function (numRoll) {
        this.packHeader();
        this.putByte(numRoll);
        this.updateSize();
    },
});

CmdSendMidAutumnCheatGServer = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_CHEAT_G_SERVER);
    },

    putData: function (gServer, gUser) {
        cc.log("++CheatGServer : " + JSON.stringify(arguments));
        this.packHeader();
        this.putLong(gServer);
        this.putLong(gUser);
        this.updateSize();
    },
});

CmdSendMidAutumnGetLampInfo = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_GET_LAMP_INFO);
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    },
});

CmdSendMidAutumnSendLamp = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_SEND_LAMP);
    },

    putData: function (id, toId, message) {
        cc.log("SEND LAMP ** " + JSON.stringify(arguments));
        this.packHeader();
        this.putInt(id);
        this.putInt(toId);
        this.putString(message);
        this.updateSize();
    },
});


CmdSendMidAutumnUseLamp = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_USE_LAMP);
    },

    putData: function (isRolledLamp, id, index) {
        this.packHeader();
        this.putByte(isRolledLamp);
        this.putInt(id);
        this.putInt(index);

        this.updateSize();
    },
});

CmdSendMidAutumnChangeLamp = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(MD_CMD_CHANGE_LAMP);
    },

    putData: function (isRolledLamp, index, id, number) {
        cc.log("SEND CHANGE LAMP " + JSON.stringify(arguments));
        this.packHeader();
        var length = isRolledLamp.length;
        this.putShort(length);
        for (var i = 0; i < length; i++)
            this.putByte(isRolledLamp[i]);
        this.putShort(length);
        for (var i = 0; i < length; i++)
            this.putInt(index[i]);
        this.putShort(length);
        for (var i = 0; i < length; i++)
            this.putInt(id[i]);
        this.putShort(length);
        for (var i = 0; i < length; i++)
            this.putInt(number[i]);
        this.updateSize();
    },
});

