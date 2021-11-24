var ChannelMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.chanelConfig = [];
        this.betTime = 3;
        this.selectedChanel = 0;
        this.roomList = [];
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case CMD.CMD_SELECT_CHANEL: {
                var selectChanel = new CmdReceivedChanlel(pk);
                selectChanel.clean();

                if (selectChanel.getError() == 0) {
                    this.selectedChanel = selectChanel.chanelID;
                    sceneMgr.updateCurrentGUI();
                    var curLayer = sceneMgr.getRunningScene().getMainLayer();
                    if (curLayer.updateJackpotGUI) {
                        curLayer.updateJackpotGUI("init");
                    }
                } else {
                    var gui = sceneMgr.getRunningScene().getMainLayer();
                    if (gui instanceof ChooseRoomScene) {
                        sceneMgr.showOKDialog(LocalizedString.to("CHANGE_CHANNEL_FAIL"));
                    }
                }
                return true;
            }
            case CMD.CMD_REFRESH_TABLE: {
                var table = new CmdReceivedRefreshTable(pk);
                if (sceneMgr.getRunningScene().getMainLayer() instanceof ChooseRoomScene) {
                    this.roomlist = table.list;
                    sceneMgr.updateCurrentGUI();
                }
                return true;
            }
            case CMD.SEARCH_TABLE: {
                if (sceneMgr.getRunningScene().getMainLayer() instanceof ChooseRoomScene) {
                    var search = new CmdReceivedUpdateSearchTable(pk);
                    this.roomlist = search.list;
                    sceneMgr.updateCurrentGUI(search);
                    search.clean();
                }
                return true;
            }
            case CMD.CMD_LOCK_ACCOUNT: {
                if (CheckLogic.checkInBoard())
                    return;
                sceneMgr.clearLoading();
                sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_IN_WAIT_ROOM"));
                break;
            }
            case CMD.ACCEPT_INVITATION: {
                var cai = new CmdReceiveAcceptInvitation(p);
                if (cai.error != 0) {
                    sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_NOT_REAL_ROOM"));
                }

                cai.clean();
                break;
            }

            case CMD.JOIN_ROOM_FAIL: {
                if (CheckLogic.checkInBoard())
                    return;
                sceneMgr.clearLoading();
                var pkJoinRoomFail = new CmdReceivedJoinRoomFail(p);
                pkJoinRoomFail.clean();
                GameClient.holding = false;

                cc.log("### JOIN ROOM FAIL " + JSON.stringify(pkJoinRoomFail));

                switch (pkJoinRoomFail.reason) {
                    case 0:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_NOT_ENOUGHT_MONEY"));
                        break;
                    case 1:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_WRONG_PASS"));
                        break;
                    case 2:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_FULL"));
                        break;
                    case 3:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_IN_ROOM"));
                        break;
                    case 4:
                    case 11:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_DELETE_ROOM"));
                        break;
                    case 5:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_LOW_ROOM"));
                        break;
                    case 7:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_NOT_REAL_ROOM"));
                        break;
                    case 8:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_IN_WAIT_ROOM"));
                        break;
                    case 9:
                        sceneMgr.showOKDialog(LocalizedString.to("ROULETE_PLAYING"));
                        break;
                    default:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_UNKNOWN") + pkJoinRoomFail.reason);
                        break;
                }
                break;
            }
            case CMD.CMD_CREATE_ROOM: {
                sceneMgr.clearLoading();
                var msgCmdRCreateRoom = new CmdReceiveCreateRoom(p);
                msgCmdRCreateRoom.clean();
                switch (msgCmdRCreateRoom.getError()) {
                    case 1: {
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_NOT_ENOUGHT_MONEY"));
                        break;
                    }
                    case 2: {
                        var nameRoom = ChanelConfig.instance().chanelConfig[this.selectedChanel].name;
                        var fullRoom = LocalizedString.to("CREATE_ROOM_FULL");
                        StringUtility.replaceAll(fullRoom, "%name", nameRoom);
                        sceneMgr.showOKDialog(LocalizedString.to(fullRoom));
                        break;
                    }
                    case 3:
                        sceneMgr.showOKDialog(LocalizedString.to("CREATE_ROOM_WRONG_BET"));
                        break;
                    case 4:
                        sceneMgr.showOKDialog(LocalizedString.to("CREATE_ROOM_QUICK"));
                        break;
                    case 5:
                        sceneMgr.showOKDialog(LocalizedString.to("CREATE_ROOM_IN_GAME"));
                        break;
                    case 8:
                        sceneMgr.showOKDialog(LocalizedString.to("ROULETE_PLAYING"));
                        break;
                    default:
                        sceneMgr.showOKDialog(LocalizedString.to("CREATE_ROOM_ERROR") + " " + msgCmdRCreateRoom.getError());
                        break;
                }

                break;
            }
        }
        return false;
    },

    loadConfig: function (obj) {
        this.betTime = 3;
        this.chanelConfig = [];
        var maxChanel = obj["maxChannel"];
        var chanKenh = obj["chankenh"];
        for (var i = 0; i < maxChanel; i++) {
            var chanelObj = obj["" + i];

            var chanel = {
                leafEnd: chanelObj["leafEnd"],
                leafStart: chanelObj["leafStart"],
                minGold: chanelObj["minGold"],
                maxGold: chanelObj["maxGold"],
                comission: chanelObj["comission"],
                jackpot: chanelObj["jackpot"],
                jackpotLevel: chanelObj["jackpotLevel"],
                name: chanelObj["name"],
                bet: chanelObj["betsAdvange"],
                betAdvance: chanelObj["betsAdvange"],
                canPlay: chanKenh[i]
            };
            this.chanelConfig.push(chanel);
        }
    },

    autoSelectChannel: function () {
        var cId = this.getCurrentChanel() + 0;
        if (cId < 0) cId = 0;
        var pk = new CmdSendSelectChanel();
        pk.putData(cId);
        this.sendPacket(pk);
        pk.clean();
    },

    getMinBet: function () {
        return this.chanelConfig[0].betAdvance[0];
    },

    getBet: function (id) {
        return this.chanelConfig[this.selectedChanel].bet[id];
    },

    getBetAdvance: function (id) {
        return this.chanelConfig[this.selectedChanel].betAdvance[id];
    },

    /**
     * Lay ra index Bet phu hop nhat trong Kenh choi
     * @param gold
     * @returns {number}
     */
    betLevel: function (gold) {
        var i;
        if (gold == 0)
            return -1;

        for (i = 0; i < this.chanelConfig.length; i++) {
            if (this.chanelConfig[i].maxGold >= gold) {
                if (this.chanelConfig[i].bet[0] * this.betTime <= gold)
                    return i;
                else
                    return i - 1;

            } else {
                if (this.chanelConfig[i].maxGold == -1) {
                    return i;
                }
            }
        }
        return i;
    },

    getSuitableBet: function () {
        for (var i = this.chanelConfig[this.selectedChanel].bet.length - 1; i >= 0; i--) {
            if (this.chanelConfig[this.selectedChanel].bet[i] * this.betTime < userMgr.getGold()) {
                return i;
            }
        }
        return 0;
    },

    /**
     * Lay Kenh choi phu hop voi muc tien cua nguoi choi
     * @returns {number}
     */
    getCurrentChannel: function () {
        var i;
        if (userMgr.getGold() == 0)
            return -1;

        for (i = 0; i < this.chanelConfig.length; i++) {

            if (this.chanelConfig[i].maxGold >= userMgr.getGold()) {

                if (this.chanelConfig[i].bet[0] * this.betTime <= userMgr.getGold())
                    return i;
                else
                    return i - 1;

            } else {
                if (this.chanelConfig[i].maxGold == -1) {
                    return i;
                }
            }
        }

        return i;
    },

    checkDownLevel: function () {
        var i;

        var currentChannel = this.getCurrentChannel();
        for (i = 0; i < this.chanelConfig[currentChannel].canPlay.length; i++) {
            if (this.chanelConfig[currentChannel].canPlay[i] == this.selectedChanel)
                return true;
        }
        return false;
    },

    getMaxGoldCanPlayInChannel: function () {
        for (var i = this.chanelConfig.length - 1; i >= 0; i--) {
            for (var j = 0; j < this.chanelConfig[i].canPlay.length; j++)
                if (this.chanelConfig[i].canPlay[j] == this.selectedChanel) {
                    return this.chanelConfig[i].maxGold + 1;
                }

        }
        return 0;
    },


})

ChannelMgr.instance = null;
ChannelMgr.getInstance = function () {
    if (!ChannelMgr.instance) {
        ChannelMgr.instance = new ChannelMgr();
    }
    return ChannelMgr.instance;
};
var channelMgr = ChannelMgr.getInstance();