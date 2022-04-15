//RECEIVE

var CmdReceiveChatTong = CmdReceivedCommon.extend({
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
        this.content = decodeURI(this.getString());
        this.toID = this.getInt();
    }
});

var CmdReceiveSystemNotify = CmdReceivedCommon.extend({
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

var CmdReceiveMessage = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.playerId = this.getByte();
        this.getString();
        this.message = decodeURI(this.getString());
    }
});

//SEND

var CmdSendChatString = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_SEND_MESSAGE);
    },

    putData: function (msg) {
        this.packHeader();
        this.putString(msg);
        this.updateSize();
    },
});

var CmdSendChatTotal = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHAT_TOTAL);
    },

    putData: function (toId, typeMsg, msg) {
        this.packHeader();
        this.putInt(typeMsg);
        this.putInt(toId);
        this.putString(msg);
        this.updateSize();
    },
});