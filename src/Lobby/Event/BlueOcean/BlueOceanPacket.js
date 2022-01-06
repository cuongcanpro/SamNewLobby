/**
 * Created by Hunter on 7/26/2016.
 */

// ------------- RECEIVE -----------------------------
CmdReceiveBlueOceanNotify = CmdReceivedCommon.extend({

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
        this.changeToGold = this.getDouble();

        this.treasureRewardName = this.getStrings();
        this.treasureRewardType = this.getStrings();
        this.treasureRewardValue = this.getStrings();

        this.treasureRewardExp = this.getInts();
        this.treasureRewardLevel = this.getInts();

        //this.isRegisterSuccess = this.getBool();
        //this.urlNews = this.getString();
        //this.priceChangePiece = this.getLong();
        //this.giftPrices = this.getInts();
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

CmdReceiveBlueOceanActionNotify = CmdReceivedCommon.extend({

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
        this.totalGold = this.getDouble();
    }
});

CmdReceiveBlueOceanInfo = CmdReceivedCommon.extend({

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
        this.remainedMoveValue = this.getByte();
        this.moveNumberToChangeMap = this.getByte();

        this.chestLevel = this.getInt();
        this.currentChestExp = this.getInt();
        this.needChestExp = this.getInt();
        this.levelReceived = this.getInt();
        //this.completePercentage = this.getByte();

    }
});

CmdReceiveBlueOceanAccumulateInfo = CmdReceivedCommon.extend({

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

CmdReceiveBlueOceanRoll = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();

        if (this.result == 1) {
            this.ids = this.getInts();
            this.numbers = this.getInts();
            this.isNeedUserChooseDirection = this.getByte();
            this.numMoves = this.getByte();
            if (this.isNeedUserChooseDirection)
                return;
            this.bonusGold = this.getDouble();

            this.additionalChestExp = this.getInt();
            this.additionalChestExpByStep = this.getInts();

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

            if (this.bonusGold > 0) {
                this.gifts[BO_GOLD_GIFT_EXTRA_ID] = this.bonusGold;
            }

            if (this.additionalChestExp > 0) {
                this.gifts[BO_EXP_GIFT_EXTRA_ID] = this.additionalChestExp;
            }
        }
    }
});

CmdReceiveBlueOceanChangeAward = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();
        this.type = this.getInt();
    }
});
CmdReceiveBlueOceanChangeAward.OUT_GAME = 0;
CmdReceiveBlueOceanChangeAward.IN_GAME = 0;

CmdReceiveBlueOceanUserChangeAward = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.userName = this.getString();
        this.giftId = this.getInt();
    }
});

CmdReceiveBlueOceanKeyCoinBonus = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.keyCoin = this.getInt();
        this.option = this.getByte();
    }
});

CmdReceiveBlueOceanGServer = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.gServer = this.getDouble();
        this.gUser = this.getDouble();
    }
});

CmdReceiveBlueOceanShopBonus = CmdReceivedCommon.extend({

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

        // this.smsTicketValues = this.getInts();
        // this.smsTicketTickets = this.getInts();
        //
        // this.iapTicketValues = this.getInts();
        // this.iapTicketTickets = this.getInts();
        //
        // this.zingTicketValues = this.getInts();
        // this.zingTicketTickets = this.getInts();
        //
        // this.atmTicketValues = this.getInts();
        // this.atmTicketTickets = this.getInts();
        //
        // this.zaloTicketValues = this.getInts();
        // this.zaloTicketTickets = this.getInts();
        //
        // this.promoTicket = this.getInt();
        // this.startPromoTicket = this.generateDayFromTime(this.getString());
        // this.endPromoTicket = this.generateDayFromTimeEnd(this.getString());

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

CmdReceiveBlueOceanRegisterInfor = CmdReceivedCommon.extend({

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

CmdReceiveBlueOceanRollHistory = CmdReceivedCommon.extend({

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

CmdReceiveBlueOceanGiftHistory = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.ids = this.getInts();
    }
});

CmdReceiveBlueOceanChangePiece = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.numPiece = this.getInt();
        this.gold = this.getDouble();
    }
});

CmdReceiveBlueOceanOpenChest = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.chestLevel = this.getInt();
        var size = this.getShort();
        this.treasureRewardName = [];
        for (var i = 0; i < size; i++) {
            this.treasureRewardName.push(this.getString());
        }
        size = this.getShort();
        this.treasureRewardType = [];
        for (var i = 0; i < size; i++) {
            this.treasureRewardType.push(this.getString());
        }
        this.treasureRewardValue = this.getInts();
        this.treasureRewardNumber = this.getInts();
    }
});



// ------------- SEND -----------------------------
CmdSendBlueOcean = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_EVENT_NOTIFY);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendBlueOceanOpen = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_OPEN_EVENT);
    },

    putData: function (isOpen) {
        //pack
        this.packHeader();
        this.putByte(isOpen);
        //update
        this.updateSize();
    }
});

CmdSendBlueOceanRoll = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_ROLL_EVENT);
    },

    putData: function (type) {
        cc.log("TYPE " + type);
        this.packHeader();
        this.putByte(type);
        this.updateSize();
    }
});

CmdSendBlueOceanChooseDirect = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_ROLL_CHOOSE_DIRECT);
    },

    putData: function (moveDirect,moveNum) {
        cc.log("++SendChooseDirect " + JSON.stringify(arguments));

        this.packHeader();
        this.putByte(moveDirect);
        this.putByte(moveNum);
        this.updateSize();
    }
});

CmdSendBlueOceanChangeAward = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHANGE_AWARD);
    },

    putData: function (type, id, name, add, cmnd, phone, email) {
        if (name === undefined) name = "";
        if (phone === undefined) phone = "";
        if (cmnd === undefined) cmnd = "";
        if (add === undefined) add = "";
        if (email === undefined) email = "";

        cc.log("#SendChangeAward : " + type + "," + id + "," + name + " , " + phone + " , " + cmnd + " , " + add + " , " + email);

        this.packHeader();
        //this.putByte(type ? 1 : 0);
        this.putInt(id);

        this.putString(name);
        this.putString(phone);
        this.putString(cmnd);
        this.putString(add);
        this.putString(email);
        this.updateSize();
    }
});

CmdSendBlueOceanChangeStage = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHANGE_STAGE);
    },

    putData: function (stage) {
        cc.log("++SendChangeStage " + stage);
        this.packHeader();
        this.putByte(stage);
        this.updateSize();
    }
});

CmdSendBlueOceanGetRegisterInfo = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_GET_REGISTER_INFORMATION);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendBlueOceanGetRollHistory = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_GET_ROLL_HISTORY);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendBlueOceanGetGiftHistory = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_GET_GIFT_HISTORY);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendBlueOceanBuyTicketG = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_EVENT_BUY_TICKET_BY_G);
    },

    putData: function (coin) {
        this.packHeader();
        this.putInt(coin);
        this.updateSize();
    }
});


CmdSendBlueOceanChangePiece = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHANGE_PIECE);
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
    }
});

// Cheat
CmdSendBlueOceanCheatItem = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHEAT_ITEM);
    },

    putData: function (item, num) {
        cc.log("++CheatItem : " + JSON.stringify(arguments));
        this.packHeader();
        this.putInt(item);
        this.putInt(num);
        this.updateSize();
    }
});

CmdSendBlueOceanCheatCoinFree = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHEAT_COIN_FREE_DAY);
        this.putData();
    },

    putData: function () {
        cc.log("++CheatCoinFree");
        this.packHeader();
        this.updateSize();
    }
});

CmdSendBlueOceanCheatReset = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHEAT_RESET);
        this.putData();
    },

    putData: function () {
        cc.log("++CheatResetServer");
        this.packHeader();
        this.updateSize();
    }
});

CmdSendBlueOceanCheatCoinAccumulate = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHEAT_COIN_ACCUMULATE);
    },

    putData: function (coin, exp, chest) {
        cc.log("++CheatCoin-Exp : " + JSON.stringify(arguments));
        this.packHeader();
        this.putInt(coin);
        this.putLong(exp);
        this.putInt(chest);
        this.updateSize();
    }
});

CmdSendBlueOceanCheatNumRoll = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHEAT_NUM_ROLL);
    },

    putData: function (numRoll) {
        this.packHeader();
        this.putByte(numRoll);
        this.updateSize();
    }
});

CmdSendBlueOceanCheatGServer = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHEAT_G_SERVER);
    },

    putData: function (gServer, gUser) {
        cc.log("++CheatGServer : " + JSON.stringify(arguments));
        this.packHeader();
        this.putLong(gServer);
        this.putLong(gUser);
        this.updateSize();
    }
});

CmdSendBlueOceanCheatRock = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHEAT_NUM_ROCK);
    },

    putData: function (rock, map) {
        this.packHeader();
        this.putByte(rock);
        this.putByte(map);
        this.updateSize();
    }
});


CmdSendBlueOceanCheatPos = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHEAT_POS);
    },

    putData: function (row, column) {
        this.packHeader();
        this.putByte(row);
        this.putByte(column);
        this.updateSize();
    }
});

CmdSendBlueOceanCheatConvert = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_CHEAT_CONVERT);
    },

    putData: function (row, column) {
        this.packHeader();
        cc.log("ROW COLUMN " + row +  " " + column);
        this.putByte(row);
        this.putByte(column);
        this.updateSize();
    }
});

CmdSendBlueOceanOpenChest = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(BO_CMD_OPEN_CHEST);
    },

    putData: function (level) {
        this.packHeader();
        cc.log("Level " + level);
        this.putInt(level);
        this.updateSize();
    }
});