var UserMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.userInfo = new UserInfo();
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case UserMgr.CMD_GET_USER_INFO: {
                sceneMgr.clearLoading();

                // READ DATA
                var info = new CmdReceivedUserInfo(pk);
                cc.log("CMD_GET_USER_INFO: " + JSON.stringify(info));
                this.userInfo.setUserInfo(info);

                // LOAD SCENE GAME
                if (!info.isHolding) {
                    channelMgr.autoSelectChannel();
                    paymentMgr.setRefundInfo(info);
                    paymentMgr.sendUpdateBuyGold();
                    supportMgr.sendGetSupport();
                    lobbyMgr.openLobbyScene();
                    //football.getMyHistory();
                    if (GameClient.connectLai) {
                        Toast.makeToast(Toast.SHORT, LocalizedString.to("RECONNECT_SUCCESS"));
                        GameClient.connectLai = false;
                    }
                    fr.crashLytics.setUserIdentifier(info.uId);
                    fr.crashLytics.setString(info.uId, "+++" + loginMgr.getSessionKey());
                }
                loginMgr.loginGameSuccess();

                // sent event portal tet 2021
                portalMgr.checkEvent();

                // Log simulator
                LogUtil.sendLogSimulator();

                // gui log check install app zalopay
                LogUtil.sendLogInstallZaloPay();
                break;
            }
            case UserMgr.CMD_UPDATE_MONEY: {
                var update = new CmdReceivedUpdateBean(pk);
              //  CheckLogic.onUpdateMoney(update);
                this.updateMoney(update);
                paymentMgr.onUpdateMoney();
                update.clean();
                sceneMgr.updateCurrentGUI();
                break;
            }
            case UserMgr.CMD_GET_CONFIG: {
                var cmd = new CmdReceivedConfig(pk);
                cmd.clean();
                gameConfig.loadServerConfig(cmd.jsonConfig);
                return true;
            }
        }
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
        return this.userInfo.getGold();
    },

    getCoin: function () {
        return this.userInfo.getCoin();
    },

    getLevel: function () {
        return this.userInfo.getLevel();
    },

    getDiamond: function () {
        return this.userInfo.getDiamond();
    },

    getUID: function () {
        return this.userInfo.getUID();
    },

    getAvatar: function () {
        return this.userInfo.getAvatar();
    },

    getUserName: function () {
        return this.userInfo.getUserName();
    },

    getDisplayName: function () {
        return this.userInfo.getDisplayName();
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

UserMgr.CMD_GET_USER_INFO = 1001;
UserMgr.CMD_UPDATE_MONEY = 1007;
UserMgr.CMD_GET_CONFIG = 1004;