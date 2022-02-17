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
                    loginpk.putData(loginMgr.getSessionKey());
                else
                    loginpk.putData("+++" + loginMgr.getSessionKey());
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
                    loginpk.putData(loginMgr.getSessionKey());
                else
                    loginpk.putData("+++" + loginMgr.getSessionKey());
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
