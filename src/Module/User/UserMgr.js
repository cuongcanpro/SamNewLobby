var UserMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.userInfo = new UserInfo();
    },

    onReceived: function (cmd, pk) {
        cc.log(this.tag + cmd);
        switch (cmd) {
            case CMD.CMD_GET_USER_INFO: {
                sceneMgr.clearLoading();

                // READ DATA
                var info = new CmdReceivedUserInfo(p);
                this.userInfo.setUserInfo(info);

                // LOAD SCENE GAME
                if (!info.isHolding) {
                    channelMgr.autoSelectChannel();
                    offerManager.resetData();
                    userMgr.setRefundInfo(info);
                    userMgr.sendGetSupport();
                    lobbyMgr.openLobbyScene();
                    football.getMyHistory();
                    football.resetData();
                    if (GameClient.connectLai) {
                        Toast.makeToast(Toast.SHORT, LocalizedString.to("RECONNECT_SUCCESS"));
                        GameClient.connectLai = false;
                    }

                    // request shop event
                    var cmdEvent = new CmdSendRequestEventShop();
                    GameClient.getInstance().sendPacket(cmdEvent);

                    fr.crashLytics.setUserIdentifier(info.uId);
                    fr.crashLytics.setString(info.uId, "+++" + GameData.getInstance().sessionkey);
                }
                Event.instance().onGetUserInfoSuccess();
                loginMgr.loginGameSuccess();

                // sent event portal tet 2021
                PortalUtil.checkEvent();

                // Log simulator
                LogUtil.sendLogSimulator();

                // gui log check install app zalopay
                LogUtil.sendLogInstallZaloPay();
                break;
            }
            case CMD.CMD_UPDATE_MONEY: {
                var update = new CmdReceivedUpdateBean(p);
                CheckLogic.onUpdateMoney(update);
                this.updateMoney(update);
                paymentMgr.onUpdateMoney();
                update.clean();
                sceneMgr.updateCurrentGUI();
                break;
            }
            case CMD.CMD_GET_CONFIG: {
                var cmd = new CmdReceivedConfig(p);
                cmd.clean();
                gamedata.setGameConfig(cmd.jsonConfig);
                break;
            }
        }
    },

    loadCacheConfig: function () {
        this.clear();
        var version = -1;
        var json = "";
        var obj = {};

        var version = parseInt(cc.sys.localStorage.getItem(GameConfig.KEY_SAVE_CONFIG_VERSION));
        if (isNaN(version)) {
            version = -1;
        }

        if (version >= 0) {
            var json = cc.sys.localStorage.getItem(GameConfig.KEY_SAVE_CONFIG_JSON);
            if (json) {
                cc.log("+++GameConfig Cache : " + json);

                try {
                    obj = JSON.parse(json);
                } catch (e) {
                    version = -1;
                }
            } else {
                version = -1;
            }
        }

        if (version >= 0) {
            try {
                this.config = obj;
                this.configVersion = version;

                this.parseConfig();
            } catch (e) {
                this.config = {};
                this.configVersion = -1;
            }
        }
    },

    loadServerConfig: function (json) {
        this.clear();

        cc.log("+++GameConfig : " + json.length + " -> " + json);

        try {
            this.config = JSON.parse(json);
            this.configVersion = this.config.configVersion;
            this.parseConfig();
            this.saveConfig();
        } catch (e) {
            cc.error("###GameData::server config error " + e);
        }
    },

    saveConfig: function () {
        if (this.config && this.configVersion >= 0) {
            cc.sys.localStorage.setItem(GameConfig.KEY_SAVE_CONFIG_JSON, JSON.stringify(this.config));
            cc.sys.localStorage.setItem(GameConfig.KEY_SAVE_CONFIG_VERSION, this.configVersion);
        }
    },

    parseConfig: function () {
        channelMgr.loadConfig(this.config);
        football.loadConfig(this.config);
        NewVipManager.getInstance().loadConfig(this.config);
        supportMgr.loadConfig(this.config);
    },

    updateMoney: function (update) {
        cc.log("+++UpdateMoney " + JSON.stringify(update));

        if (this.userInfo.getUID() == update.uID) {
            this.userInfo.setGold(update.bean);
            this.userInfo.setCoin(update.coin);
            this.userInfo.setWinCount(update.winCount);
            this.userInfo.setLostCount(update.lostCount);
            //this.userInfo.levelScore = update.levelScore;
            this.userInfo.setLevel(update.level);
            this.userInfo.setLevelExp(update.levelExp);
            this.userInfo.setDiamond(update.diamond);

            //dispatch event update weekly challenge GUI
            var event = new cc.EventCustom(GameData.UPDATE_MONEY_EVENT);
            cc.eventManager.dispatchEvent(event);
        }

        var gui = sceneMgr.getRunningScene().getMainLayer();
        if (gui instanceof LobbyScene || gui instanceof ChooseRoomScene) {
            supportMgr.checkSupportBean();
        }
    },

    getGold: function () {
        this.userInfo.getGold();
    },

    getCoin: function () {
        this.userInfo.getCoin();
    },

    getLevel: function () {
        this.userInfo.getLevel();
    },

    getDiamond: function () {
        this.userInfo.getDiamond();
    },

    getUID: function () {
        this.userInfo.getUID();
    },

    // check social login
    checkDisableSocialViral: function () {
        if (Config.DISABLE_FACEBOOK_VIRAL && socialMgr._currentSocial != SocialManager.ZALO) {
            return true;
        }
        // khong cho user duoi level 2 thay nut share
        return this.level < 2;
    },
})

UserMgr.instance = null;
UserMgr.getInstance = function () {
    if (!UserMgr.instance) {
        UserMgr.instance = new UserMgr();
    }
    return UserMgr.instance;
};
var userMgr = UserMgr.getInstance();