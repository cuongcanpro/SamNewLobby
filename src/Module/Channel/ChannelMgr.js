var ChannelMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.chanelConfig = [];
        this.betTime = 3;
        this.selectedChanel = 0;
        this.roomList = [];
    },

    initListener: function () {
        dispatcherMgr.addListener(UserMgr.EVENT_ON_GET_USER_INFO, this, this.autoSelectChannel);
    },

    inChooseRoomScene: function (){
        var gui = sceneMgr.getRunningScene().getMainLayer();
        if (gui instanceof ChooseRoomScene) {
            return true;
        }
        return false;
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case ChannelMgr.CMD_SELECT_CHANEL: {
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
            case ChannelMgr.CMD_REFRESH_TABLE: {
                var table = new CmdReceivedRefreshTable(pk);
                if (sceneMgr.getRunningScene().getMainLayer() instanceof ChooseRoomScene) {
                    this.roomList = table.list;
                    sceneMgr.updateCurrentGUI();
                }
                return true;
            }
            case ChannelMgr.SEARCH_TABLE: {
                if (sceneMgr.getRunningScene().getMainLayer() instanceof ChooseRoomScene) {
                    var search = new CmdReceivedUpdateSearchTable(pk);
                    this.roomlist = search.list;
                    sceneMgr.updateCurrentGUI(search);
                    search.clean();
                }
                return true;
            }
            case ChannelMgr.CMD_LOCK_ACCOUNT: {
                if (CheckLogic.checkInBoard())
                    return;
                sceneMgr.clearLoading();
                sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_IN_WAIT_ROOM"));
                break;
            }
            case ChannelMgr.ACCEPT_INVITATION: {
                var cai = new CmdReceiveAcceptInvitation(p);
                if (cai.error != 0) {
                    sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_NOT_REAL_ROOM"));
                }

                cai.clean();
                break;
            }

            case ChannelMgr.JOIN_ROOM_FAIL: {
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
            case ChannelMgr.CMD_CREATE_ROOM: {
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

    setConfig: function (obj, chanKenh) {
        this.betTime = 3;
        this.chanelConfig = [];
        var maxChanel = obj["maxChannel"];
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

    getCurrentChanel: function () {
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

    autoSelectChannel: function () {
        var cId = this.getCurrentChanel() + 0;
        if (cId < 0) cId = 0;
        this.sendSelectChannel(cId);
    },

    sendSelectChannel: function (idChannel) {
        var pk = new CmdSendSelectChanel();
        pk.putData(idChannel);
        this.sendPacket(pk);
        pk.clean();
    },

    sendRefreshTable: function () {
        var pk = new CmdSendRefreshTable();
        this.sendPacket(pk);
        pk.clean();
    },

    sendQuickPlay: function () {
        var pk = new CmdSendQuickPlay();
        this.sendPacket(pk);
        pk.clean();
    },

    sendQuickPlayChannel: function () {
        var pk = new CmdSendQuickPlayChannel();
        this.sendPacket(pk);
        pk.clean();
    },

    sendQuickPlayCustom: function (roomInfo) {
        var pk = new CmdSendQuickPlayCustom();
        cc.log("save channel: " + this.saveChannel);
        var channel = (this.saveChannel) ? this.saveChannel : this.selectedChanel;
        pk.putData(channel, roomInfo.bet);
        this.sendPacket(pk);
        pk.clean();
    },

    checkQuickPlay: function () {
        if (userMgr.getGold() > this.getMinBet() * this.betTime)
            return true;
        return false;
    },

    checkCreateRoomMinGold: function () {
        var minGold = this.chanelConfig[this.selectedChanel].minGold;
        return (minGold > userMgr.getGold());
    },

    checkCreateRoomMaxGold: function () {
        var maxGold = this.chanelConfig[this.selectedChanel].maxGold;
        return (maxGold < userMgr.getGold());
    },

    checkNotifyNotEnoughGold: function (roomInfo) {
        if (roomInfo.type == 1) {
            if (this.getBetAdvance(roomInfo.bet) * this.betTime > userMgr.getGold()) {
                SceneMgr.getInstance().showOKDialog(LocalizedString.to("PLAY_NOT_ENOUGHT_GOLD_ROOM"));
                return true;
            }
        } else {
            if (this.getBet(roomInfo.bet) * this.betTime > userMgr.getGold()) {
                SceneMgr.getInstance().showOKDialog(LocalizedString.to("PLAY_NOT_ENOUGHT_GOLD_ROOM"));
                return true;
            }
        }
        return false;
    },

    getMinGoldCreateRoom: function () {
        return this.chanelConfig[this.selectedChanel].minGold;
    },

    getMaxGoldCreateRoom: function () {
        return this.getMaxGoldCanPlayInChannel();
    },

    getMinGoldSupport: function () {
        return this.chanelConfig[0].minGold;
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

    getMinGoldInChannel: function (idChannel) {
        return this.chanelConfig[idChannel].minGold;
    },

    getMaxGoldInChannel: function (idChannel) {
        return this.chanelConfig[idChannel].maxGold;
    },

    onEnterChannel: function () {
        if (this.selectedChanel == -1) {
            this.autoSelectChannel();
        }
        else {
            var pk = new CmdSendRefreshTable();
            GameClient.getInstance().sendPacket(pk);
            pk.clean();
        }
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


ChannelMgr.CMD_SELECT_CHANEL = 2001;
ChannelMgr.CMD_CREATE_ROOM = 2004;
ChannelMgr.CMD_RECEIVE_JACKPOT = 2007;
ChannelMgr.CMD_REFRESH_TABLE = 2008;
ChannelMgr.SEARCH_TABLE = 2013;
ChannelMgr.CMD_QUICK_PLAY = 2103;
ChannelMgr.CMD_QUICK_PLAY_CUSTOM = 2101;
ChannelMgr.CMD_LOCK_ACCOUNT = 68;
ChannelMgr.JOIN_ROOM_FAIL = 3007;