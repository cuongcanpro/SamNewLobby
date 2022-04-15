/**
 * Send packet
 */

CmdSendSelectChanel = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(ChannelMgr.CMD_SELECT_CHANEL);

    },
    putData: function (chanelID) {
        //pack
        this.packHeader();
        this.putByte(chanelID);
        //update
        this.updateSize();
    }
});

CmdSendRefreshTable = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(ChannelMgr.CMD_REFRESH_TABLE);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendQuickPlay = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(ChannelMgr.CMD_QUICK_PLAY);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        this.putByte(-1);
        //update
        this.updateSize();
    }
});

CmdSendQuickPlayChannel = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(ChannelMgr.CMD_QUICK_PLAY);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        this.putByte(channelMgr.selectedChanel);
        cc.log("CmdSendQuickPlay: ", channelMgr.selectedChanel);
        //update
        this.updateSize();
    }
});

var CmdSendQuickPlayCustom = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(ChannelMgr.CMD_QUICK_PLAY_CUSTOM);
    },
    putData: function (channelId, quickPlayType, roomMode, bigBet) {
        roomMode = roomMode || 0;
        cc.log("CmdSendQuickPlayCustom: ", JSON.stringify(arguments));
        //pack
        this.packHeader();
        this.putByte(channelId);
        this.putByte(quickPlayType);
        this.putInt(roomMode);
        cc.log("BIG BET " + bigBet);
        this.putByte(bigBet);

        //update
        this.updateSize();
    }
});
CmdSendQuickPlayCustom.ROOM_SOLO = 1;
CmdSendQuickPlayCustom.ROOM_NORMAL = 0;

CmdSendQuickPlayCustom.BIG_BET = 1;
CmdSendQuickPlayCustom.NORMAL_BET = 0;

CmdSendQuickPlayCustom.TYPE_QUICK_PLAY = 1;
CmdSendQuickPlayCustom.TYPE_SELECT_ROOM = 2;

CmdSendCreateRoom = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(ChannelMgr.CMD_CREATE_ROOM);
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

/**
 * Receive packet
 */
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


CmdReceivedRefreshTable = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.list = [];

        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            this.list.push(new Object());
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
            this.list[i].personCount = this.getByte();
        }
        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].totalCount = this.getByte();
            this.list[i].isModeSolo = (this.list[i].totalCount === 2);
            // this.list[i].isModeSolo = Math.random() > 0.5;
        }
        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].type = this.getByte();
        }

        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].tableName = this.getString();
        }


        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].bet = this.getDouble();
        }

        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].requirePass = this.getInt();
        }

        this.getShort();
        for (var i = 0; i < size; i++) {
            this.list[i].bigBet = this.getBool();
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
