/**
 * Created by Hunter on 7/26/2016.
 */

// ------------- RECEIVE -----------------------------
CmdReceiveLuckyCardNotify = CmdReceivedCommon.extend({

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
        //this.costs = this.getInts();
        //this.bonus = this.getInts();

        var startDays = this.getLongs();
        var endDays = this.getLongs();

        this.eventWeeks = [];
        for (var i = 0; i < startDays.length; i++) {
            this.eventWeeks.push(this.generateDayFromTime(startDays[i], endDays[i]));
        }
        this.eventDayFrom = this.generateDayFromTime(startDays[0]);
        this.eventDayTo = this.generateDayFromTime(endDays[endDays.length - 1]);

        this.isRegisterSuccess = this.getBool();


        //this.showX2G = this.getBool();
        //this.isFirstTime = this.getBool();
        this.eventLinkNews = this.getString();
    },

    generateDayFromTime: function (sDay) {
        var dStart = new Date(sDay);
        //var sStart = dStart.getDate() + "-" + (this.getMonth(parseInt(dStart.getMonth()) + 1));
        var sStart = dStart.getDate() + "/" + (parseInt(dStart.getMonth() + 1));
        return (sStart);
    },

    getMonth: function (mon) {
        switch (mon) {
            case 1:
                return "Jan";
            case 2:
                return "Feb";
            case 3:
                return "Mar";
            case 4:
                return "Apr";
            case 5:
                return "May";
            case 6:
                return "Jun";
            case 7:
                return "July";
            case 8:
                return "Aug";
            case 9:
                return "Sep";
            case 10:
                return "Oct";
            case 11:
                return "Nov";
            case 12:
                return "Dec";
        }
        return "";
    },
});

CmdReceiveLuckyCardActionNotify = CmdReceivedCommon.extend({

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
            item.num = this.numbers[i];
            item.isStored = luckyCard.isItemStored(item.id);
            this.gifts.push(item);
        }

        this.notify = this.getBool();

    }
});

CmdReceiveLuckyCardInfo = CmdReceivedCommon.extend({

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
        for (var i = 0; i < this.ids.length; i++) {
            if (this.ids[i] < LuckyCard.ITEM_STORED) continue;

            var item = {};
            item.id = this.ids[i];
            item.gift = this.gifts[i];
            var s = this.items[i];
            if ((s == "" || s.localeCompare("") == 0) && item.gift == 0)
                continue;
            if (s == "" || s.localeCompare("") == 0) {
                item.item = [];
            } else {
                var arraySplit = s.split(",");
                item.item = arraySplit;
            }
            cc.log("WHAT THE HELL " + JSON.stringify(item));

            //if (item.item == 0 && item.gift > 0) item.item = LuckyCard.MAX_ITEM_CONVERT_GIFT;
            this.list[this.ids[i]] = item;
        }
        cc.log("WHY 5 ");
    }
});

CmdReceiveLuckyCardAccumulateInfo = CmdReceivedCommon.extend({

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

CmdReceiveLuckyCardRoll = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();
        this.ids = this.getInts();
        this.numbers = this.getInts();

        /*
        this.gifts = [];
        this.haveItem = false;
        for (var i = 0; i < this.ids.length; i++) {
            var item = {};
            item.id = this.ids[i];
            item.value = 0;
            item.num = 1;// this.numbers[i];
            item.isStored = luckyCard.isItemStored(item.id);
            if (!item.isStored)
            {
                item.value = luckyCard.getItemValue(item.id);
            }
            else
            {
                this.haveItem = true;
            }
            item.num = 1;
            for(var j = 0 ; j < this.numbers[i] -1 ; j++)
            {
                this.gifts.push(item);
            }
            this.gifts.push(item);
        }
        */


        var count = 0;
        for (var i = 0; i < this.numbers.length; i++) {
            count += this.numbers[i];
            if (count > 3) break;
        }

        this.gifts = [];
        this.haveItem = false;
        for (var i = 0; i < this.ids.length; i++) {
            var item = {};
            item.id = this.ids[i];
            item.value = 0;
            item.num = this.numbers[i];
            item.isStored = luckyCard.isItemStored(item.id);
            if (!item.isStored) {
                item.value = luckyCard.getItemValue(item.id);
            } else {
                this.haveItem = true;
            }
            if (count <= 3) {
                item.num = 1;
                for (var j = 0; j < this.numbers[i] - 1; j++) {
                    this.gifts.push(item);
                }
            }
            this.gifts.push(item);
        }

    }
});

CmdReceiveLuckyCardChangeAward = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();
        this.type = this.getByte();
    }
});

CmdReceiveLuckyCardUserChangeAward = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.userName = this.getString();
        this.giftId = this.getInt();
    }
});

CmdReceiveLuckyCardKeyCoinBonus = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.keyCoin = this.getInt();
        //this.type = 0;
        this.type = this.getByte();
    }
});

CmdReceiveLuckyCardGServer = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.gServer = this.getDouble();
        this.gUser = this.getDouble();
    }
});

CmdReceiveLuckyCardShopBonus = CmdReceivedCommon.extend({

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

        this.gTicketValues = this.getInts();
        this.gTicketTickets = this.getInts();
        cc.log("SMS TICKETsdf " + JSON.stringify(this.gTicketTickets));
        //
        this.smsTicketValues = this.getInts();
        this.smsTicketTickets = this.getInts();
        cc.log("SMS TICKET " + JSON.stringify(this.smsTicketTickets));

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

CmdReceiveLuckyCardCheatError = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.textString = this.getString();
    }
});

CmdReceiveLuckyCardHistory = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.numHist = this.getInt();
        this.listHist = [];
        for (var i = 0; i < this.numHist; i++) {
            var hist = {};
            var arr = this.getString().split(" ");
            try {
                hist.date = arr[0];
                hist.times = arr[1];
            } catch (e) {
                cc.log("get date-time error");
            }
            hist.keyCoin = this.getInt();
            hist.gifts = [];
            var nums = this.getInt();
            for (var j = 0; j < nums; j++) {
                var gift = {};
                gift.id = this.getInt();
                gift.num = this.getInt();
                cc.log("NUM GIFT *********** " + gift.num);
                hist.gifts.push(gift);
            }
            this.listHist.push(hist);
        }
    }
});

// ------------- SEND -----------------------------
CmdSendLuckyCard = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_EVENT_NOTIFY);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendLuckyCardOpen = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_OPEN_EVENT);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendLuckyCardRoll = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_ROLL_EVENT);
    },

    putData: function (type) {
        this.packHeader();
        cc.log("ROLL NEW *****" + type);
        this.putByte(type);
        this.updateSize();
    }
});

CmdSendLuckyCardChangeAward = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_CHANGE_AWARD);
    },

    putData: function (type, ids, cmnd, phone, email, name, add) {
        if (name === undefined) name = "";
        if (phone === undefined) phone = "";
        if (cmnd === undefined) cmnd = "";
        if (add === undefined) add = "";
        if (email === undefined) email = "";

        cc.log("#SendChangeAward : " + type + "," + JSON.stringify(ids) + " ----- " + cmnd + " , " + phone + " , " + email + " , " + name + " , " + add);

        this.packHeader();
        this.putByte(type ? 1 : 0);
        //this.putShort(ids.length);
        //for(var i = 0 ; i < ids.length ;i++)
        //{
        //    this.putInt(ids[i]);
        //}
        if (ids.length > 0) {
            this.putInt(ids[0]);
        }

        this.putString(cmnd);
        this.putString(phone);
        this.putString(email);
        this.putString(name);
        this.putString(add);
        this.updateSize();
    }
});

CmdSendLuckyCardMetric = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_EVENT_METRIC_LOG);
    },

    putData: function (nFog, nStar, nHistory, nHelp, nCollection) {
        this.packHeader();
        this.putInt(nStar);
        this.putInt(nFog);
        this.putInt(nHistory);
        this.putInt(nCollection);
        this.putInt(nHelp);
        this.updateSize();
    }
});

CmdSendLuckyCardMetricBuyCoin = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_EVENT_METRIC_BUY_SUCCESS);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendLuckyCardMetricOpenShopX2 = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_EVENT_METRIC_OPEN_SHOP_X2);
    },

    putData: function (nOpen) {
        this.packHeader();
        this.putInt(nOpen);
        this.updateSize();
    }
});

CmdSendLuckyCardCheatItem = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_CHEAT_ITEM);
    },

    putData: function (item, num) {
        cc.log("CHEAT ITEM " + item + " " + num);
        this.packHeader();
        this.putInt(item);
        this.putInt(num);
        this.updateSize();
    }
});

CmdSendLuckyCardCheatCoinFree = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_CHEAT_COIN_FREE_DAY);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendLuckyCardCheatCoinAccumulate = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_CHEAT_COIN_ACCUMULATE);
    },

    putData: function (coin, exp) {
        this.packHeader();
        this.putInt(coin);
        this.putLong(exp);
        this.updateSize();
    }
});

CmdSendLuckyCardCheatGServer = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_CHEAT_G_SERVER);
    },

    putData: function (gServer, gUser) {
        this.packHeader();
        this.putLong(gServer);
        this.putLong(gUser);
        this.updateSize();
    }
});

CmdSendLuckyCardCheatResetData = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_CHEAT_RESET_DATA);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendLuckyCardCheatRegister = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_CHEAT_REGISTER);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.putString("gsn12345");
        this.putString("0987654321");
        this.putString("1234567890");
        this.putString("165 thai ha");
        this.putString("meomeo@gmail.com");
        this.updateSize();
    }
});

CmdSendLuckyCardRequestHistory = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyCard.CMD_EVENT_HISTORY);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});