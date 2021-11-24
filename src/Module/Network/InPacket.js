// PACKET
var engine = engine || {};
if (cc.sys.isNative)
    engine.InPacket.extend = cc.Class.extend;
else {
    var INDEX_SIZE_PACKET = 1;
    engine.InPacket = cc.Class.extend({
        ctor: function () {

        },
        init: function (pkg) {
            this._pos = 0;
            this._data = pkg;
            this._length = pkg.length;
            this._controllerId = this.parseByte();
            this._cmdId = this.getShort();
            this._error = this.parseByte();
        },
        getCmdId: function () {
            return this._cmdId;
        },
        getControllerId: function () {
            return this._controllerId;
        },
        getError: function () {
            return this._error;
        },
        parseByte: function () {
            cc.assert(this._pos < this._length, "IndexOutOfBoundsException");
            return this._data[this._pos++];
        },
        getByte: function () {
            var byte = this.parseByte();
            return byte > 240 ? byte - 256 : byte;
        },
        getBool: function () {
            cc.assert(this._pos < this._length, "IndexOutOfBoundsException");
            var b = this._data[this._pos++];
            return b > 0;
        },
        getBytes2: function (size) {
            cc.assert(this._pos + size <= this._length, "IndexOutOfBoundsException");
            var bytes = [];
            for (var i = 0; i < size; i++) {
                bytes.push(this.parseByte());
            }
            return bytes;
        },
        getShort: function () {
            cc.assert(this._pos + 2 <= this._length, "IndexOutOfBoundsException");
            if (this._pos + 2 > this._length) {
                return 0;
            }
            return ((this.parseByte() << 8) + (this.parseByte() & 255));
        },
        getUnsignedShort: function () {
            cc.assert(this._pos + 2 <= this._length, "getUnsignedShort: IndexOutOfBoundsException");
            var a = (this.parseByte() & 255) << 8;
            var b = (this.parseByte() & 255) << 0;
            return a + b;
        },
        getInt: function () {
            cc.assert(this._pos + 4 <= this._length, "getInt: IndexOutOfBoundsException");
            return ((this.parseByte() & 255) << 24) +
                ((this.parseByte() & 255) << 16) +
                ((this.parseByte() & 255) << 8) +
                ((this.parseByte() & 255) << 0);
        },
        getLong: function () {
            var POW_2 = {
                "56": 72057594037927940,
                "48": 281474976710656,
                "40": 1099511627776,
                "32": 4294967296,
                "24": 16777216,
                "16": 65536,
                "8": 256,
                "0": 1
            };
            cc.assert(this._pos + 8 <= this._length, "getLong: IndexOutOfBoundsException");
            return ((this.parseByte() & 255) * POW_2["56"]) +
                ((this.parseByte() & 255) * POW_2["48"]) +
                ((this.parseByte() & 255) * POW_2["40"]) +
                ((this.parseByte() & 255) * POW_2["32"]) +
                ((this.parseByte() & 255) * POW_2["24"]) +
                ((this.parseByte() & 255) * POW_2["16"]) +
                ((this.parseByte() & 255) * POW_2["8"]) +
                ((this.parseByte() & 255) * POW_2["0"]);
        },
        getDouble: function () {
            cc.assert(this._pos + 8 <= this._length, "getLong: IndexOutOfBoundsException");
            var buffer = new ArrayBuffer(8);
            var int8array = new Uint8Array(buffer);

            for (var i = 7; i >= 0; i--) {
                int8array[7 - i] = this.parseByte();
            }
            var dataview = new DataView(buffer);

            return dataview.getFloat64(0);

        },
        getCharArray: function () {
            var size = this.getUnsignedShort();
            return this.getBytes2(size);
        },
        getString: function () {
            var out = this.getCharArray();
            var uintarray = new Uint8Array(out.length);
            for (var i = 0; i < out.length; i++) {
                uintarray[i] = parseInt(out[i], 10);
            }
            var encode = String.fromCharCode.apply(null, uintarray);
            var decode = decodeURIComponent(escape(encode));

            return decodeURI(decode);
        },
        clean: function () {

        }
    })
}


var CmdReceivedCommon = engine.InPacket.extend({

    ctor: function (pkg) {
        this._super();
        this.init(pkg);
    },

    readData: function () {

    },

    getStrings: function () {
        var arr = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            arr.push(this.getString());
        }
        return arr;
    },

    getLongs: function () {
        var arr = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            arr.push(this.getDouble());
        }
        return arr;
    },

    getInts: function () {
        var arr = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            arr.push(this.getInt());
        }
        return arr;
    },

    getBools: function () {
        var arr = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            arr.push(this.getBool());
        }
        return arr;
    },

    getBytes: function () {
        var arr = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            arr.push(this.getByte());
        }
        return arr;
    },

    getDoubles: function() {
        var arr = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            arr.push(this.getDouble());
        }
        return arr;
    }
});

CmdReceiveMobile = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.version = this.getString();
        this.enablepayment = this.getBool();

        try {
            this.payments = this.getBools();

            if (this.payments.length <= 3)
                this.payments.push(false);
            //   this.payments[3] = false;
            cc.log(" Payments : " + JSON.stringify(this.payments));
        } catch (e) {
            cc.log("Server old: " + e);
            this.payments = [false, false, true];
        }

    }
});

CmdReceiveConnectFail = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.ip = this.getString();
        this.port = this.getInt();
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

CmdReceivedIsHolding = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.chanelID = this.getInt();
        this.roomID = this.getInt();
        this.pass = this.getString();


    }
});

CmdReceivedChanlel = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.chanelID = this.getByte();
        this.selectedLeaf = this.getByte();
        this.jackpot = this.getDouble();
        cc.log("congngggggg", this.jackpot);
    }
});

CmdReceiveAcceptInvitation = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.avatar = this.getString();
        this.toId = this.getInt();
        this.name = this.getString();
        this.money = this.getLong();
        this.channelId = this.getByte();
        this.bet = this.getLong();
        this.numPlayer = this.getByte();
        this.totalPlayer = this.getByte();
        this.leaf = this.getByte();
    }
});

CmdReceiveBuyGold = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.nBuyGold = this.getInt();

        this.arrayValueG = this.getInts();
        this.arrayIsFirstG = this.getBytes();

        this.arrayValueSMS = this.getInts();
        this.arrayIsFirstSMS = this.getBytes();

        this.arrayValueIAP = this.getInts();
        this.arrayIsFirstIAP = this.getBytes();

        this.arrayValueZing = this.getInts();
        this.arrayIsFirstZing = this.getBytes();

        this.arrayValueATM = this.getInts();
        this.arrayIsFirstATM = this.getBytes();

        this.arrayValueZalo = this.getInts();
        this.arrayIsFirstZalo = this.getBytes();
    }
});

CmdReceiveDailyGift = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.index = this.getByte();
    }
});

CmdReceiveGiftCode = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.res = this.getInt();
        this.money = this.getDouble();
    }
});

CmdReceiveInfoVIP = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.gStar = this.getDouble();
        this.type = this.getInt();
        this.time = this.getDouble();
    }
});

CmdReceiveInvitation = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.avatar = this.getString();
        this.toId = this.getInt();
        this.name = this.getString();
        this.money = this.getDouble();
        this.channelId = this.getByte();
        this.bet = this.getDouble();
        this.numPlayer = this.getByte();
        this.totalPlayer = this.getByte();
        this.leaf = this.getByte();
    }
});

CmdReceiveMission = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        var size = this.getInt();
        this.missions = {};

        for (var i = 0; i < size; i++) {
            var mObj = {};
            mObj.id = this.getInt();
            mObj.status = this.getInt();
            mObj.timeStart = this.getDouble();
            mObj.timeRemain = this.getDouble();
            this.missions["" + mObj.id] = mObj;
        }
        this.missions.numMission = size;
    }
});

CmdReceiveNapCard = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.response = this.getInt();
    }
});

CmdReceiveNotifyIsHolding = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.channelId = this.getInt();
        this.roomId = this.getInt();
        this.pass = this.getString();
    }
});

CmdReceiveRegisterVip = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.type = this.getByte();
        this.isOffer = this.getByte();
    }
});

CmdReceiveShopGold = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.error = this.getInt();
        this.isOffer = this.getByte();
        this.channel = this.getInt();
        this.packetId = this.getInt();
        this.goldGet = this.getLong();
        this.voucherGold = this.getLong();
        this.voucherVPoint = this.getInt();
        cc.log("CmdReceiveShopGold: ", JSON.stringify(this));
    }
});

CmdReceiveTangGold = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.gold = this.getDouble();
    }
});

CmdReceiveUpdateXu = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.xu = this.getDouble();
    }
});

CmdReceiveUpdateBuyGold = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.nBuyGold = this.getInt();

        this.arrayValueG = this.getInts();
        this.arrayIsFirstG = this.getBytes();

        this.arrayValueSMS = this.getInts();
        this.arrayIsFirstSMS = this.getBytes();

        this.arrayValueIAP = this.getInts();
        this.arrayIsFirstIAP = this.getBytes();

        this.arrayValueZing = this.getInts();
        this.arrayIsFirstZing = this.getBytes();

        this.arrayValueATM = this.getInts();
        this.arrayIsFirstATM = this.getBytes();

        this.arrayValueZalo = this.getInts();
        this.arrayIsFirstZalo = this.getBytes();

        if (Config.TEST_SMS_VINA) {
            this.arrayValueSMSViettel = this.getInts();
            this.arrayIsFirstSMSViettel = this.getBytes();

            this.arrayValueSMSMobi = this.getInts();
            this.arrayIsFirstSMSMobi = this.getBytes();

            this.arrayValueSMSVina = this.getInts();
            this.arrayIsFirstSMSVina = this.getBytes();

            this.arrayBuyCount = this.getInts();

            this.lastBuyGoldType = this.getByte();
            this.lastBuyGType = this.getByte();
        }
    }
});

CmdReceiveCode = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.listCodes = [];

        var gc = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            gc.push(this.getString());
        }

        var des = [];
        size = this.getShort();
        for (var i = 0; i < size; i++) {
            des.push(this.getString());
        }

        for (var i = 0; i < size; i++) {
            var sObj = {};
            sObj.giftCode = gc[i];
            sObj.desc = des[i];
            this.listCodes.push(sObj);
        }
    }
});

CmdReceiveEmotion = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.index = this.getByte();
        this.playerId = this.getByte();
    }
});

CmdReceiveMessage = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.playerId = this.getByte();
        this.getString();
        this.message = this.getString();
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

CmdReceivedUpdateJackpot = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.jackpot = this.getDouble();
    }
});

CmdReceivedServerNotifyMessage = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.message = this.getString();
    }
});

CmdReceivedGetPlayers = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.list = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            var dat = {};
            dat.avatar = this.getString();
            dat.uID = this.getInt();
            dat.name = this.getString();
            dat.bean = this.getDouble();
            dat.invite = false;

            this.list.push(dat);
        }
    }
});

CmdReceivePurchaseCard = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.response = this.getInt();
        this.message = this.getString();
    }
});

CmdReceivePurchaseSMS = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.service = this.getString();
        this.syntax = this.getString();
    }

});

CmdReceivePurchaseIAPGoogle = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.purchaseData = this.getString();
        this.signature = this.getString();
    }
});

CmdReceivePurchaseIAPApple = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.success = [];
        this.failed = [];

        var n = this.getShort();
        for (var i = 0; i < n; i++) {
            var obj = {};
            obj.id = this.getString();
            obj.num = this.getInt();
            this.success.push(obj);
        }

        n = this.getShort();
        for (var i = 0; i < n; i++) {
            var obj = {};
            obj.id = this.getString();
            obj.num = this.getInt();
            this.failed.push(obj);
        }
    },

    getIdSuccess: function () {
        var ret = "";
        for (var i = 0, sizz = this.success.length; i < sizz; i++) {
            if (gamedata.isPortal() && Config.ENABLE_MULTI_PORTAL)
                ret += fr.PaymentInfo.getPackageID(this.success[i].id);
            else
                ret += this.success[i].id;
            if (i < sizz - 1) {
                ret += ",";
            }
        }
        return ret;
    },

    getIdFailed: function () {
        var ret = "";
        for (var i = 0, sizz = this.failed.length; i < sizz; i++) {
            if (gamedata.isPortal() && Config.ENABLE_MULTI_PORTAL)
                ret += fr.PaymentInfo.getPackageID(this.failed[i].id);
            else
                ret += this.failed[i].id;
            // ret += this.failed[i].id;
            if (i < sizz - 1) {
                ret += ",";
            }
        }
        return ret;
    },

    getIds: function () {
        return this.getIdSuccess() + "," + this.getIdFailed();
    }
});

CmdReceivedIAPValidate = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.packId = this.getInt();
        this.enable = this.getBool();
    }
});

// CHAT
CmdReceiveAllFriend = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        var sSender = this.getString();
        if (sSender != "") {
            this.json = JSON.parse(sSender);
        } else {
            this.json = null;
        }
    }
});

CmdReceiveChatTong = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.response = this.getBool();
        this.msgType = this.getInt();
        var sSender = this.getString();
        if (sSender != "") {
            this.sender = JSON.parse(sSender);
        } else {
            this.sender = null;
        }
        this.content = this.getString();
        this.toID = this.getInt();
    }
});

CmdReceiveModFriend = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.action = this.getInt();
        var sSender = this.getString();
        if (sSender != "") {
            this.friendJson = JSON.parse(sSender);
        } else {
            this.friendJson = null;
        }
    }
});

CmdReceiveSystemNotify = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.response = this.getBool();
        this.name = this.getString();
        this.exprired = this.getLong();
        this.reason = this.getString();
        this.hour = this.getInt();
    }
});

CmdReceiveStatusFriend = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.timeStep = this.getInt();
        var sSender = this.getString();
        if (sSender != "") {
            this.json = JSON.parse(sSender);
        } else {
            this.json = null;
        }
    }
});

CmdReceivedJoinRoomFail = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.reason = this.getByte();
    }
});

CmdReceiveCreateRoom = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
    }
});

CmdReceivedBuyGZalo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.errorCode = this.getInt();
        this.stringMessage = this.getString();
        this.zptranstoken = this.getString();
    }
});

CmdReceivedBuyZaloV2 = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.errorCode = this.getInt();
        this.deepLink = this.getString();
        this.qrLink = this.getString();
        this.errMsg = this.getString();
    }
});

CmdReceivedIAPDailyGold = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.gold = this.getInt();
        this.totalDay = this.getInt();
        this.dayReceived = this.getInt();
        this.index = this.getInt();
        this.GStar = this.getInt();
    }
});

CmdReceivedIAPPurchase = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.enables = this.getBools();
        this.times = this.getLongs();
    }
});

CmdReceivedBuyGATM = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.errorCode = this.getInt();
        this.stringMessage = this.getString();
        this.urlDirect = this.getString();
    }
});

CmdReceivedConfigShop = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.type = this.getByte();
        var typeShopBonus = this.getByte();
        if (typeShopBonus == 1) {
            this.isShopBonus = true;
            this.isShopBonusG = false;
        } else if (typeShopBonus == 2) {
            this.isShopBonus = false;
            this.isShopBonusG = true;
        } else if (typeShopBonus == 3) {
            this.isShopBonus = true;
            this.isShopBonusG = true;
        } else {
            this.isShopBonus = false;
            this.isShopBonusG = false;
        }

        this.stringConfigGold = this.getString();
        this.stringConfigG = this.getString();

    }
});

CmdReceivedMapZalo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

    }
});

CmdReceivedNotifyMapZalo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

    }
});

CmdReceivedNotifyMappedZalo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.username = this.getString();
        this.sessionKey = this.getString();
    }
});

CmdReceivedSorry = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.gold = this.getDouble();
        this.gStar = this.getInt();
    }
});

CmdReceivedNewUpdateEnablePayment = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.payments = this.getBools();
    }
});

CmdReceivedLevelUp = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function() {
        this.uId = this.getInt();
        this.nChair = this.getByte();
        this.oldLevel = this.getInt();
        this.newLevel = this.getInt();
        this.oldLevelExp = Number(this.getLong());
        this.newLevelExp = Number(this.getLong());
    }
});

CmdReceivedLevelConfig = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function() {
        this.maxLevel = this.getInt();
        this.levelExpAdd = JSON.parse(this.getString());
        this.level = JSON.parse(this.getString());
        this.bonus = JSON.parse(this.getString());
    }
});

CmdReceivedTrackLogZaloPay = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.payType = this.getInt();
        this.errorCode = this.getInt();
        this.subErrorCode = this.getInt();
    }
});
CmdReceivedTrackLogZaloPay.CREATE_BINDING = 1;
CmdReceivedTrackLogZaloPay.CREATE_ORDER = 2;
CmdReceivedTrackLogZaloPay.PAY = 3;


CmdReceivedPortalGiftCode = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.giftCode = this.getString();
        this.error = this.getInt();
    }
});


CmdReceivedNotifyEventRegister = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.eventId = this.getString();
        this.giftId = this.getInt();
        this.giftName = this.getString();
    }
});

CmdReceivedSendEventRegister = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.eventId = this.getString();
        this.giftId = this.getInt();
        this.giftName = this.getString();
    }
});