//------------------------------------------------------ SEND -------------------------------------------------------

var CmdSendGetRankConfig = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(NewRankData.CMD_GET_RANK_CONFIG);

        // this.putData();
    },
    putData:function(platform){
        //pack
        this.packHeader();
        this.putByte(platform);
        //update
        this.updateSize();
    }
});

var CmdSendGetMyRankInfo = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(NewRankData.CMD_GET_RANK_INFO_USER);

        this.putData();
    },
    putData:function(){
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

var CmdSendGetOtherRankInfo = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(NewRankData.CMD_RANK_INFO_OTHER_USER);
    },
    putData:function(userId){
        //pack
        this.packHeader();
        this.putInt(userId);
        //update
        this.updateSize();
    }
});

var CmdSendGetWeekRank = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(NewRankData.CMD_LIST_RANK_INFO_IN_WEEK);
    },
    putData:function(isThisWeek){
        //pack
        this.packHeader();
        this.putByte(isThisWeek);
        //update
        this.updateSize();
    }
});

var CmdSendGetTopUsers = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(NewRankData.CMD_GET_TOP_USERS);
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendPingpongNewRank = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(0);
        this.setCmdId(NewRankData.CMD_PINGPONG);
        this.putData();
    },

    putData: function () {
        this.packHeader();

        this.updateSize();
    }
});

var CmdSendConfirmResultLastWeek = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(NewRankData.CMD_GIFT_LAST_WEEK);
        this.putData();
    },

    putData: function () {
        this.packHeader();

        this.updateSize();
    }
});

var CmdSendConfirmTruCup = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(NewRankData.CMD_SUB_CUP_OFFLINE);
        this.putData();
    },

    putData: function () {
        this.packHeader();

        this.updateSize();
    }
});

var CmdSendCheatNewRankInfo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(NewRankData.CMD_CHEAT_INFO);
    },

    putData: function (cup, goldMedal, silverMedal, bronzeMedal) {
        cc.log("CmdSendCheatNewRankInfo: ", cup, goldMedal, silverMedal, bronzeMedal);
        this.packHeader();
        this.putInt(cup);
        this.putInt(goldMedal);
        this.putInt(silverMedal);
        this.putInt(bronzeMedal);
        this.updateSize();
    }
});

var CmdSendCheatGoldWin = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(NewRankData.CMD_CHEAT_GOLD_WIN);
    },

    putData: function (goldWin) {
        cc.log("CmdSendCheatGoldWin: ", goldWin);
        this.packHeader();
        this.putLong(goldWin);
        this.updateSize();
    }
});

//---------------------------------------------------- RECEIVE -----------------------------------------------------

var CmdReceivedRankConfig = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.rankConfig = this.getString();
    }
});

var CmdReceivedRankInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.error = this.getError();
        cc.log("CmdReceivedRankInfo: ", this.error);
        if (this.error === 0){
            this.rank = this.getByte();
            this.rankPoint = this.getInt();
            this.goldMedal = this.getInt();
            this.silverMedal = this.getInt();
            this.bronzeMedal = this.getInt();
        }
    }
});

var CmdReceivedOtherRankInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.rank = this.getByte();
        this.goldMedal = this.getInt();
        this.silverMedal = this.getInt();
        this.bronzeMedal = this.getInt();
        this.bean = this.getLong();
        this.level = this.getInt();
        this.winCount = this.getInt();
        this.lostCount = this.getInt();
        this.uID = this.getInt();
        this.displayName = this.getString();
        this.avatar = this.getString();
    }
});

var CmdReceivedWeekRank = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.isThisWeek = this.getBool();
        this.remainTime = this.getLong();
        this.isOpening = this.getBool();
        this.weekLevel = this.getByte();
        this.size = this.getInt();
        this.topUser = [];
        for (var i = 0; i < this.size; i++){
            var user = {};
            user.userId = this.getInt();
            user.userName = this.getString();
            user.avatar = this.getString();
            user.goldWin = this.getLong();
            user.avatarFrame = this.getInt();
            this.topUser.push(user);
        }
        this.numGameToday = this.getInt();
    }
});

var CmdReceivedTopUsers = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.size = this.getInt();
        this.topUser = [];
        for (var i = 0; i < this.size; i++){
            var user = {};
            user.userId = this.getInt();
            user.userName = this.getString();
            user.avatar = this.getString();
            user.goldWin = this.getLong();
            user.avatarFrame = this.getInt();
            this.topUser.push(user);
        }
    }
});

var CmdReceiveLastWeekGift = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.rankIdx = this.getByte();
        this.tableSize = this.getByte();
        this.oldCup = this.getInt();
        this.cup = this.getInt();
        this.goldGift = this.getLong();
        this.goldMedal = this.getByte();
        this.silverMedal = this.getByte();
        this.bronzeMedal = this.getByte();
        this.goldWinLastWeek = this.getLong();
        this.packId = this.getInt();
    }
});

var CmdReceivedTruCup = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.cup = this.getInt();
        this.offlineWeek = this.getInt();
        this.oldCup = this.getInt();
    }
});