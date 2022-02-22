var RankGameClientListener = cc.Class.extend({
    onFinishConnect: function (isSuccess) {
        cc.log("_________onFinishConnect Rank:" + isSuccess);
        if (isSuccess) {
            if (RankGameClient.getInstance().connectState !== ConnectState.CONNECTED){
                RankGameClient.getInstance().sendPacket(new CmdSendHandshake());
                RankGameClient.getInstance().connectState = ConnectState.CONNECTED;
                // RankGameClient.getInstance().startPingPong();
            }
        } else {
            RankGameClient.getInstance().connectState = ConnectState.DISCONNECTED;
        }
    },

    onDisconnected: function () {
        cc.log("new Rank client disconnect");
        RankGameClient.getInstance().connectServer = false;
        RankGameClient.getInstance().connectState = ConnectState.DISCONNECTED;

        RankGameClient.disconnectHandle();
    },

    onReceived: function (cmd, pk) {

        var packet = new engine.InPacket();
        packet.init(pk);

        var controllerID = packet.getControllerId();
        if(!cc.sys.isNative)
        {
            cmd = packet._cmdId;
        }
        // if (cmd !== 50){
        //     cc.log("Rank server ON RECEIVED PACKET   CMD: " + cmd + "  CONTROLLER ID: " + controllerID + " ERRO.R:  " + packet.getError());
        // }
        if (Config.ENABLE_TESTING_NEW_RANK){
            if (cmd === CMD.HAND_SHAKE){
                var loginpk = new CmdSendLogin();
                if(Config.ENABLE_CHEAT && Config.ENABLE_DEV)
                    loginpk.putData(loginMgr.getSessionKey());
                else
                    loginpk.putData("+++" + loginMgr.getSessionKey());
                RankGameClient.getInstance().sendPacket(loginpk);
                loginpk.clean();
            }
            return;
        }
        switch (cmd) {
            case CMD.HAND_SHAKE:
            {
                var loginpk = new CmdSendLogin();
                if(Config.ENABLE_CHEAT && Config.ENABLE_DEV)
                    loginpk.putData(loginMgr.getSessionKey());
                else
                    loginpk.putData("+++" + loginMgr.getSessionKey());
                RankGameClient.getInstance().sendPacket(loginpk);
                loginpk.clean();

                break;
            }
            case CMD.CMD_PINGPONG:
            {
                RankGameClient.getInstance().receivePingPong();
                break;
            }
            case RankData.CMD_LOGIN:
            {
                if (packet.getError() === 0){
                    cc.log("Login Rank server thanh cong");

                    RankGameClient.getInstance().startPingPong();
                    RankGameClient.getInstance().connectState = ConnectState.CONNECTED;

                    var cmdGetRankConfig = new CmdSendGetRankConfig();
                    cmdGetRankConfig.putData(NativeBridge.getPlatform());
                    RankGameClient.getInstance().sendPacket(cmdGetRankConfig);
                    cmdGetRankConfig.clean();

                    var cmdGetMyRankInfo = new CmdSendGetMyRankInfo();
                    RankGameClient.getInstance().sendPacket(cmdGetMyRankInfo);
                    cmdGetMyRankInfo.clean();

                    var cmdRankInfoLastWeek = new CmdSendGetWeekRank();
                    cmdRankInfoLastWeek.putData(0);
                    RankGameClient.getInstance().sendPacket(cmdRankInfoLastWeek);
                    cmdRankInfoLastWeek.clean();

                    var cmdRankInfoCurWeek = new CmdSendGetWeekRank();
                    cmdRankInfoCurWeek.putData(1);
                    RankGameClient.getInstance().sendPacket(cmdRankInfoCurWeek);
                    cmdRankInfoCurWeek.clean();

                    var cmdGetTopUsers = new CmdSendGetTopUsers();
                    cmdGetTopUsers.putData();
                    RankGameClient.getInstance().sendPacket(cmdGetTopUsers);
                    cmdGetTopUsers.clean();
                } else {
                    cc.error("Login Rank server that bai");
                }

                break;
            }
            case RankData.CMD_GET_RANK_CONFIG:{
                var rankConfig = new CmdReceivedRankConfig(pk);
                RankData.getInstance().setRankConfig(rankConfig);
                rankConfig.clean();
                break;
            }
            case RankData.CMD_GET_RANK_INFO_USER:{
                var rankInfo = new CmdReceivedRankInfo(pk);
                RankData.getInstance().setCurRankInfo(rankInfo);
                rankInfo.clean();
                break;
            }
            case RankData.CMD_LIST_RANK_INFO_IN_WEEK:{
                var rankInfoWeek = new CmdReceivedWeekRank(pk);
                for (var i = 0; i < rankInfoWeek.size; i++)
                    StorageManager.getInstance().addOtherAvatarId(rankInfoWeek.topUser[i].userId, rankInfoWeek.topUser[i].avatarFrame);
                if (rankInfoWeek.isThisWeek){
                    RankData.getInstance().setDataCurWeek(rankInfoWeek);
                } else {
                    RankData.getInstance().setDataLastWeek(rankInfoWeek);
                }
                rankInfoWeek.clean();
                break;
            }
            case RankData.CMD_GET_TOP_USERS:{
                var cmdTopUsers = new CmdReceivedTopUsers(pk);
                for (var i = 0; i < cmdTopUsers.size; i++)
                    StorageManager.getInstance().addOtherAvatarId(cmdTopUsers.topUser[i].userId, cmdTopUsers.topUser[i].avatarFrame);
                RankData.getInstance().setTopUsersData(cmdTopUsers);
                cmdTopUsers.clean();
                break;
            }
            case RankData.CMD_GIFT_LAST_WEEK:{
                var resultLastWeek = new CmdReceiveLastWeekGift(pk);
                RankData.getInstance().setDataResultLastWeek(resultLastWeek);
                resultLastWeek.clean();
                break;
            }
            case RankData.CMD_SUB_CUP_OFFLINE:{
                var cmdTruCup = new CmdReceivedTruCup(pk);
                RankData.getInstance().setDataTruCup(cmdTruCup);
                cmdTruCup.clean();
                break;
            }

        }
        packet.clean();
    }
});
