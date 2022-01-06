/**
 * Created by Hunter on 5/25/2016.
 */

CmdReceivedUserInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.getPlayerInit = this.getByte();
        // this.isShopBonus = this.getBool();
        // this.showBonusNotice = this.getByte();
        this.avatar = this.getString();
        this.uId = this.getInt();
        this.userName = this.getString();
        this.gold = this.getDouble();
        this.zMoney = this.getDouble();
        this.levelScore = this.getDouble();
        this.winCount = this.getInt();
        this.lostCount = this.getInt();
        this.getInt();
        this.getInt();

        this.zName = this.getString();
        this.getByte();
        this.getInt();
      //  this.isShopIAPBonus = this.getByte();
		
		if (Config.ENABLE_IAP_LIMIT_TIME) {
            this.totalGIAP = this.getInt();
            this.idPackage = this.getInt();
            this.totalDayIAP  = this.getInt();
            this.dayReceivedIAP  = this.getInt();
            this.arrayPackageIAP = this.getBools();
            this.arrayPackageTime = this.getLongs();
        }

        this.level = this.getInt();
		this.levelExp = this.getDouble();
		this.diamond = this.getDouble();
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
        for(var i = 0 ;i<size;i++)
        {
            this.list.push({});
        }
        for(var i = 0 ;i<size;i++)
        {
            this.list[i].tableID = this.getInt();
        }
        this.getShort();
        for(var i = 0 ;i<size;i++)
        {
            this.list[i].tableIndex = this.getInt();
        }

        this.getShort();
        for(var i = 0 ;i<size;i++)
        {
            this.list[i].tableName = this.getString();
        }
        this.getShort();
        for(var i = 0 ;i<size;i++)
        {
            this.list[i].type = this.getByte();
        }


        this.getShort();
        for(var i = 0 ;i<size;i++)
        {
            this.list[i].bet = this.getByte();
        }

        this.getShort();
        for(var i = 0 ;i<size;i++)
        {
            this.list[i].personCount = this.getByte();
        }
        this.getShort();
        for(var i = 0 ;i<size;i++)
        {
            this.list[i].totalCount = this.getByte();
        }


        this.getShort();
        for(var i = 0 ;i<size;i++)
        {
            this.list[i].requirePass = this.getByte();
        }
        cc.log("FINISH READ");
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

CmdReceiveSupportBean = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.nBean = this.getInt();
        this.numSuport = this.getByte();
        this.delay = this.getDouble();
        this.isWaitingSpecialSupport = this.getBool();
        this.isSpecial = this.getBool();

        this.remainStart = this.getDouble();
        this.remainEnd = this.getDouble();
    }
});

CmdSendCreateRoom = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CREATE_ROOM);
    },
    putData: function (bet,type,name,pass,bigBet,num) {
        this.packHeader();

        this.putString(name);
        this.putByte(bet);
        this.putString(pass);
        this.putByte(type);
        this.putByte(num);

        //update
        this.updateSize();
    }
});

CmdSendCheatMoney= CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_MONEY);
    },
    putData:function(money,coin){
        //pack
        this.packHeader();
        this.putLong(money);
        this.putInt(coin);

        //update
        this.updateSize();
    }
});

CmdSendCheatJackpot = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_JACKPOT);
    },
    putData: function (jp) {
        //pack
        this.packHeader();
        this.putLong(jp);
        //update
        this.updateSize();
    }
});

CmdSendCheatEXP = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_EXP);
    },

    putData: function (exp) {
        //pack
        this.packHeader();
            this.putInt(exp);

        //update
        this.updateSize();
    }
});

CmdSendCheatOldExp = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_OLD_EXP);
    },

    putData: function(oldExp) {
        //pack
        this.packHeader();
        this.putLong(oldExp);
        cc.log("Send cheat old exp: " + oldExp);
        //update
        this.updateSize();
    }
});

CmdSendCheatGStar = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_GSTAR);
    },

    putData: function (gstar) {
        //pack
        this.packHeader();
        this.putLong(gstar);

        //update
        this.updateSize();
    }
});

CmdSendCheatConfigCard = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_CARD);
    },
    putData: function (cards) {
        //pack
        this.packHeader();
        this.putShort(cards.length);
        for (var i = 0; i < cards.length; i++) {
            this.putInt(cards[i]);
        }
        //update
        this.updateSize();
    }
});
