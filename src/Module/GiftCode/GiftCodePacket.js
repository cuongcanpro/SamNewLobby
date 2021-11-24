
CMD.CMD_GET_LIST_CODE_NEW = 13003;
CMD.CMD_USE_CODE = 13001;

CmdReceiveListCodeNew = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.listCodes = [];


        var size = this.getInt();

        for (var i = 0; i < size; i++) {
            var sObj = {};
            sObj.giftCode = this.getString();
            sObj.desc = this.getString();
            sObj.expire = this.getLong();
            sObj.gold = this.getLong();
            sObj.gstar = this.getLong();
            this.listCodes.push(sObj);
        }
    }
});

CmdReceivedUseGiftCode = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.error = this.getError();
        this.result = this.getString();
    }
});

//----------------------------------------------------------------------------------------------------------------------

CmdSendGetCodeNew = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_GET_LIST_CODE_NEW);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendUseGiftCode = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_USE_CODE);
    },

    putData: function (code, type) {
        this.packHeader();
        this.putString(code);
        this.putInt(type);
        this.updateSize();
    }
});