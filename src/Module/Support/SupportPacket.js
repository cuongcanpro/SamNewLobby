
CmdSendGetDailyGift = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(SupportMgr.GET_DAILY_GIFT);
    },

    putData: function (index) {
        this.packHeader();
        this.putByte(index);
        this.updateSize();
    }
});

CmdSendGetSupportBean = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(SupportMgr.SUPPORT_BEAN);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendTangGold = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(SupportMgr.CMD_TANGVANG);
            this.putData();

        },
        putData:function(){
            //pack
            this.packHeader();
            //update
            this.updateSize();
        }
    }
);

CmdReceiveDailyGift = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.index = this.getByte();
    }
});

CmdReceivedTangGold  = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.gold = this.getDouble();
    }
});


CmdReceiveSupportBean = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.nBean = this.getInt();
        this.numSupport = this.getByte();
        this.delay = this.getDouble();
        this.isWaitingSpecialSupport = this.getBool();
        this.isSpecial = this.getBool();

        this.remainStart = this.getDouble();
        this.remainEnd = this.getDouble();
    }
});
