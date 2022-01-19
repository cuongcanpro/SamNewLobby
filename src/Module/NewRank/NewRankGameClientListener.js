var NewRankGameClientListener = cc.Class.extend({
    onFinishConnect: function (isSuccess) {
        cc.log("_________onFinishConnect Rank:" + isSuccess);
        if (isSuccess) {
            if (NewRankGameClient.getInstance().connectState !== ConnectState.CONNECTED){
                NewRankGameClient.getInstance().sendPacket(new CmdSendHandshake());
                NewRankGameClient.getInstance().connectState = ConnectState.CONNECTED;
                // NewRankGameClient.getInstance().startPingPong();
            }
        } else {
            NewRankGameClient.getInstance().connectState = ConnectState.DISCONNECTED;
        }
    },

    onDisconnected: function () {
        cc.log("new Rank client disconnect");
        NewRankGameClient.getInstance().connectServer = false;
        NewRankGameClient.getInstance().connectState = ConnectState.DISCONNECTED;

        NewRankGameClient.disconnectHandle();
    },

    onReceived: function (cmd, pk) {

        var packet = new engine.InPacket();
        packet.init(pk);

        var controllerID = packet.getControllerId();
        if(!cc.sys.isNative)
        {
            cmd = packet._cmdId;
        }
        if (cmd !== 50){
            cc.log("Rank server ON RECEIVED PACKET   CMD: " + cmd + "  CONTROLLER ID: " + controllerID + " ERRO.R:  " + packet.getError());
        }
        if (Config.ENABLE_TESTING_NEW_RANK){
            if (cmd === CMD.HAND_SHAKE){
                var loginpk = new CmdSendLogin();
                if(Config.ENABLE_CHEAT && Config.ENABLE_DEV)
                    loginpk.putData(GameData.getInstance().sessionkey);
                else
                    loginpk.putData("+++" + GameData.getInstance().sessionkey);
                NewRankGameClient.getInstance().sendPacket(loginpk);
                loginpk.clean();
            }
            return;
        }
        switch (cmd) {
            case CMD.HAND_SHAKE:
            {
                var loginpk = new CmdSendLogin();
                if(Config.ENABLE_CHEAT && Config.ENABLE_DEV)
                    loginpk.putData(GameData.getInstance().sessionkey);
                else
                    loginpk.putData("+++" + GameData.getInstance().sessionkey);
                NewRankGameClient.getInstance().sendPacket(loginpk);
                loginpk.clean();

                break;
            }
            case CMD.CMD_PINGPONG:
            {
                NewRankGameClient.getInstance().receivePingPong();
                break;
            }
            case NewRankData.CMD_LOGIN:
            {
                if (packet.getError() === 0){
                    cc.log("Login Rank server thanh cong");

                    NewRankGameClient.getInstance().startPingPong();
                    NewRankGameClient.getInstance().connectState = ConnectState.CONNECTED;

                    var cmdGetRankConfig = new CmdSendGetRankConfig();
                    cmdGetRankConfig.putData(NativeBridge.getPlatform());
                    NewRankGameClient.getInstance().sendPacket(cmdGetRankConfig);
                    cmdGetRankConfig.clean();

                    var cmdGetMyRankInfo = new CmdSendGetMyRankInfo();
                    NewRankGameClient.getInstance().sendPacket(cmdGetMyRankInfo);
                    cmdGetMyRankInfo.clean();

                    var cmdRankInfoLastWeek = new CmdSendGetWeekRank();
                    cmdRankInfoLastWeek.putData(0);
                    NewRankGameClient.getInstance().sendPacket(cmdRankInfoLastWeek);
                    cmdRankInfoLastWeek.clean();

                    var cmdRankInfoCurWeek = new CmdSendGetWeekRank();
                    cmdRankInfoCurWeek.putData(1);
                    NewRankGameClient.getInstance().sendPacket(cmdRankInfoCurWeek);
                    cmdRankInfoCurWeek.clean();

                    var cmdGetTopUsers = new CmdSendGetTopUsers();
                    cmdGetTopUsers.putData();
                    NewRankGameClient.getInstance().sendPacket(cmdGetTopUsers);
                    cmdGetTopUsers.clean();
                } else {
                    cc.error("Login Rank server that bai");
                }

                break;
            }
            case NewRankData.CMD_GET_RANK_CONFIG:{
                var rankConfig = new CmdReceivedRankConfig(pk);
                NewRankData.getInstance().setRankConfig(rankConfig);
                rankConfig.clean();
                break;
            }
            case NewRankData.CMD_GET_RANK_INFO_USER:{
                var rankInfo = new CmdReceivedRankInfo(pk);
                NewRankData.getInstance().setCurRankInfo(rankInfo);
                rankInfo.clean();
                break;
            }
            case NewRankData.CMD_LIST_RANK_INFO_IN_WEEK:{
                var rankInfoWeek = new CmdReceivedWeekRank(pk);
                for (var i = 0; i < rankInfoWeek.size; i++)
                    StorageManager.getInstance().addOtherAvatarId(rankInfoWeek.topUser[i].userId, rankInfoWeek.topUser[i].avatarFrame);
                if (rankInfoWeek.isThisWeek){
                    NewRankData.getInstance().setDataCurWeek(rankInfoWeek);
                } else {
                    NewRankData.getInstance().setDataLastWeek(rankInfoWeek);
                }
                rankInfoWeek.clean();
                break;
            }
            case NewRankData.CMD_GET_TOP_USERS:{
                var cmdTopUsers = new CmdReceivedTopUsers(pk);
                for (var i = 0; i < cmdTopUsers.size; i++)
                    StorageManager.getInstance().addOtherAvatarId(cmdTopUsers.topUser[i].userId, cmdTopUsers.topUser[i].avatarFrame);
                NewRankData.getInstance().setTopUsersData(cmdTopUsers);
                cmdTopUsers.clean();
                break;
            }
            case NewRankData.CMD_GIFT_LAST_WEEK:{
                var resultLastWeek = new CmdReceiveLastWeekGift(pk);
                NewRankData.getInstance().setDataResultLastWeek(resultLastWeek);
                resultLastWeek.clean();
                break;
            }
            case NewRankData.CMD_SUB_CUP_OFFLINE:{
                var cmdTruCup = new CmdReceivedTruCup(pk);
                NewRankData.getInstance().setDataTruCup(cmdTruCup);
                cmdTruCup.clean();
                break;
            }
        }
        packet.clean();
    }
});

//----------------------------------------------------------------------------------------------------------------------

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

//----------------------------------------------------------------------------------------------------------------------

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
