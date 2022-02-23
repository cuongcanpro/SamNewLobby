var UserMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.userInfo = new UserInfo();
        dispatcherMgr.addListener("_get_test", this, this.onTest);
    },

    onTest: function () {
        // return 4;
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case UserMgr.CMD_GET_USER_INFO: {
                sceneMgr.clearLoading();

                // READ DATA
                var info = new CmdReceivedUserInfo(pk);
                cc.log("CMD_GET_USER_INFO: " + JSON.stringify(info));
                this.userInfo.setUserInfo(info);

                if (!info.isHolding) {
                    //football.getMyHistory();
                    if (GameClient.connectLai) {
                        Toast.makeToast(Toast.SHORT, LocalizedString.to("RECONNECT_SUCCESS"));
                        GameClient.connectLai = false;
                    }
                    fr.crashLytics.setUserIdentifier(info.uId);
                    fr.crashLytics.setString(info.uId, "+++" + loginMgr.getSessionKey());
                }
                dispatcherMgr.dispatchEvent(UserMgr.EVENT_ON_GET_USER_INFO, info);
                // Log simulator
                LogUtil.sendLogSimulator();

                // gui log check install app zalopay
                LogUtil.sendLogInstallZaloPay();
                break;
            }
            case UserMgr.CMD_UPDATE_MONEY: {
                var update = new CmdReceivedUpdateBean(pk);
                this.updateMoney(update);
                dispatcherMgr.dispatchEvent(UserMgr.EVENT_UPDATE_MONEY, update);
                update.clean();
                break;
            }
            case UserMgr.CMD_GET_CONFIG: {
                var cmd = new CmdReceivedConfig(pk);
                cmd.clean();
                gameConfig.loadServerConfig(cmd.jsonConfig);
                return true;
            }
            case UserMgr.CMD_GET_AVATAR_CONFIG: {
                var cmd = new CmdReceivedAvatarConfig(pk);
                cmd.clean();
                cc.log("CMD_GET_AVATAR_CONFIG", JSON.stringify(cmd));
                this.listAvatars = cmd.avatarConfigs;
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

    getUserInfo: function () {
        return this.userInfo;
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
UserMgr.CMD_GET_AVATAR_CONFIG = 1114;
UserMgr.CMD_CHANGE_AVATAR = 1113;

UserMgr.EVENT_ON_GET_USER_INFO = "userMgrOnGetUserInfo";
UserMgr.EVENT_UPDATE_MONEY = "userMgrUpdateMoney";
UserMgr.EVENT_GET_POS_COMPONENT = "_get_userMgrGetPosComponent";
UserMgr.EVENT_GET_VALUE = "_get_userMgrGetValue";
UserMgr.EVENT_EFFECT_LABEL = "userMgrEffectLabel";

UserMgr.TYPE_DATA_GOLD = 0;
UserMgr.TYPE_DATA_COIN = 1;
UserMgr.TYPE_DATA_DIAMOND = 2;
UserMgr.TYPE_DATA_ITEM = 3;
UserMgr.TYPE_DATA_TICKET = 4;
UserMgr.TYPE_DATA_VPOINT = 5;
UserMgr.TYPE_DATA_HOUR_VIP = 6;