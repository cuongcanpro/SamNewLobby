/**
 * Created by Hunter on 7/26/2016.
 */

// ------------- RECEIVE -----------------------------
CmdReceiveEggBreakerNotify = CmdReceivedCommon.extend({

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
        var year = new Date().getFullYear();
        this.eventDayTo = this.generateDayFromTime(endDays[endDays.length - 1]) + "/" + year;

        this.isRegisterSuccess = this.getBool();
        this.urlNews = this.getString();
        this.giftPrices = this.getInts();
        //this.costs = this.getInts();
        //this.bonus = this.getInts();
        //this.showX2G = this.getBool();
    },

    generateDayFromTime: function (sDay) {
        var dStart = new Date(sDay);

        var sStart = dStart.getDate() + "/" + (parseInt(dStart.getMonth()) + 1);
        return (sStart);
    }
});

CmdReceiveEggBreakerActionNotify = CmdReceivedCommon.extend({

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

        this.ids = this.getInts();
        this.nums = this.getInts();
        this.golds = this.getLongs();
        this.totalGold = this.getDouble();

        this.pieces = [];
        for(var i = 0, size = this.ids.length ; i < size ; i++) {
            var obj = {};
            obj.id = this.ids[i];
            obj.num = this.nums[i];
            obj.gold = this.golds[i];
            this.pieces.push(obj);
        }
    }
});

CmdReceiveEggBreakerInfo = CmdReceivedCommon.extend({

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

CmdReceiveEggBreakerAccumulateInfo = CmdReceivedCommon.extend({

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

CmdReceiveEggBreakerRoll = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();

        if (this.result == 1) {
            this.ids = this.getInts();
            this.rows = this.getBytes();
            this.cols = this.getBytes();

            // Pieces
            var num = this.rows.length;
            this.pieces = [];
            for (var i = 0; i < num; i++) {
                var obj = {};
                obj.row = this.rows[i];
                obj.col = this.cols[i];
                obj.ids = [];
                for (var j = 0; j < 3; j++) {
                    obj.ids.push(this.ids[i * 3 + j]);
                }
                this.pieces.push(obj);
            }

            // Gifts
            this.gifts = {};
            for (var i = 0, size = this.ids.length; i < size; i++) {
                var id = this.ids[i];

                if (id in this.gifts) {
                    this.gifts[id] += 1;
                }
                else {
                    this.gifts[id] = 1;
                }
            }
        }
    }
});

CmdReceiveEggBreakerChangeAward = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.result = this.getByte();
        this.type = this.getByte();
    }
});

CmdReceiveEggBreakerUserChangeAward = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.userName = this.getString();
        this.giftId = this.getInt();
    }
});

CmdReceiveEggBreakerKeyCoinBonus = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.keyCoin = this.getInt();
        this.reasonGet = this.getByte(); // 0: coin free, 1: mua gold, 2: user lau chua dang nhap, 3: user top cu
        this.coinFree = (this.reasonGet == 0);
        this.vPoint = this.getInt();
        this.hourVip = this.getInt();
    }
});

CmdReceiveEggBreakerKeyCoinBonus.TYPE_COIN_FREE = 0;
CmdReceiveEggBreakerKeyCoinBonus.TYPE_COIN_BUY_GOLD = 1;
CmdReceiveEggBreakerKeyCoinBonus.TYPE_COIN_BUY_TICKET = 5;
CmdReceiveEggBreakerKeyCoinBonus.TYPE_COIN_OLD_USER = 2;  // user da lau chua login
CmdReceiveEggBreakerKeyCoinBonus.TYPE_COIN_OLD_TOP_USER = 3;  // user top outgift cac su kien truoc
CmdReceiveEggBreakerKeyCoinBonus.TYPE_COIN_OFFER = 14;  // user top outgift cac su kien truoc


CmdReceiveEggBreakerGServer = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.gServer = this.getDouble();
        this.gUser = this.getDouble();
    }
});

CmdReceiveEggBreakerShopBonus = CmdReceivedCommon.extend({

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
        this.keyCoin = this.getInt();

        this.smsDirectVPoint = this.getInts();       // So VPoint duoc tang SMS
        this.smsDirectVipHour = this.getInts();      // So gio VIP duoc tang SMS
        this.iapDirectVPoint = this.getInts();       // So VPoint duoc tang IAP
        this.iapDirectVipHour = this.getInts();      // So gio VIP duoc tang IAP
        this.zingDirectVPoint = this.getInts();      // So VPoint duoc tang Zing
        this.zingDirectVipHour = this.getInts();     // So gio VIP duoc tang Zing
        this.atmDirectVPoint = this.getInts();       // So VPoint duoc tang ATM
        this.atmDirectVipHour = this.getInts();      // So gio VIP duoc tang ATM
        this.zaloPayDirectVPoint = this.getInts();   // So VPoint duoc tang ZaloPay
        this.zaloPayDirectVipHour = this.getInts();  // So gio VIP duoc tang ZaloPa
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

CmdReceiveEggBreakerRegisterInfo = CmdReceivedCommon.extend({

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
        this.registeredGiftIds = this.getInts();
    }
});

// ------------- SEND -----------------------------
CmdSendEggBreaker = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_EVENT_NOTIFY);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendEggBreakerOpen = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_OPEN_EVENT);
    },

    putData: function (isOpen) {
        //pack
        this.packHeader();
        //update
        if (!isOpen)
            isOpen = 0;
        this.putByte(isOpen);
        this.updateSize();
    }
});

CmdSendEggBreakerShopEventConfig = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_EVENT_SHOP_BONUS);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendEggBreakerRoll = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_ROLL_EVENT);
    },

    putData: function (type) {
        cc.log("TYPE " + type);
        this.packHeader();
        this.putByte(type);
        this.updateSize();
    }
});

CmdSendEggBreakerChangeAward = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_CHANGE_AWARD);
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

CmdSendEggBreakerCheatItem = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_CHEAT_ITEM);
    },

    putData: function (item, num) {
        this.packHeader();
        this.putInt(item);
        this.putInt(num);
        this.updateSize();
    }
});

CmdSendEggBreakerCheatCoinFree = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_CHEAT_COIN_FREE_DAY);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendEggBreakerCheatReset = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_CHEAT_RESET);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendEggBreakerCheatCoinAccumulate = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_CHEAT_COIN_ACCUMULATE);
    },

    putData: function (coin, exp) {
        this.packHeader();
        this.putInt(coin);
        this.putLong(exp);
        this.updateSize();
    }
});

CmdSendEggBreakerCheatGServer = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_CHEAT_G_SERVER);
    },

    putData: function (gServer, gUser) {
        this.packHeader();
        this.putLong(gServer);
        this.putLong(gUser);
        this.updateSize();
    }
});

CmdSendEggBreakerCheatDirect = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_CHEAT_BREAK_DIRECT);
    },

    putData: function (direct) {
        this.packHeader();
        this.putByte(direct);
        this.updateSize();
    }
});

CmdSendEggBreakerGetRegisterInfo = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EggBreaker.CMD_REGISTER_INFO);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});
