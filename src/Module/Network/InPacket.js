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

CmdReceivedNewUpdateEnablePayment = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.payments = this.getBools();
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





