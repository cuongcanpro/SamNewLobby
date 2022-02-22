var LoginMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.tag = "LOGIN MGR :";
        this.sessionKey = "";
        this.sessionExpiredTime = 0;
        this.openId = "";
        this.preloadResource();
    },

    initListener: function () {
        dispatcherMgr.addListener(UserMgr.EVENT_ON_GET_USER_INFO, this, this.onGetUserInfo);
    },

    preloadResource: function () {
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/LogoLarge/skeleton.xml","LogoLarge");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/LogoLarge/texture.plist", "LogoLarge");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/loadingZP/skeleton.xml","loadingZP");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/loadingZP/texture.plist", "loadingZP");
    },

    onGetUserInfo: function (eventName, eventData) {
        GameClient.isWaitingReconnect = false;

        // save session and send log game
        var typeLogin = Constant.ZINGME;
        switch (socialMgr._currentSocial) {
            case SocialManager.FACEBOOK:
                typeLogin = Constant.FACEBOOK;
                break;
            case SocialManager.GOOGLE:
                typeLogin = Constant.GOOGLE;
                break;
            case SocialManager.ZALO:
                typeLogin = Constant.ZALO;
                break;
            case SocialManager.ZINGME:
                typeLogin = Constant.ZINGME;
                break;
        }
        try {
            if (portalMgr.isPortal()) {
                typeLogin = fr.NativePortal.getInstance().getSocialType();
                switch (typeLogin) {
                    case Constant.FACEBOOK:
                        socialMgr._currentSocial = SocialManager.FACEBOOK;
                        break;
                    case Constant.GOOGLE:
                        socialMgr._currentSocial = SocialManager.GOOGLE;
                        break;
                    case Constant.ZALO:
                        socialMgr._currentSocial = SocialManager.ZALO;
                        break;
                    case Constant.ZINGME:
                        socialMgr._currentSocial = SocialManager.ZINGME;
                        break;
                }
            }
        } catch (e) {
            typeLogin = Constant.ZINGME;
        }
        socialMgr.saveSession(this.sessionKey, typeLogin, this.openID, socialMgr._currentSocial, this.sessionExpiredTime);
        NativeBridge.sendLoginGSN(userMgr.getUID() + "", typeLogin, this.openID + "", userMgr.getUserName());
    },

    onReceived: function (cmd, pk) {
        var packet = new engine.InPacket();
        packet.init(pk);
        switch (cmd) {
            case LoginMgr.CMD_LOGIN: {
                cc.log(this.tag + cmd);
                if (packet.getError() == 0) {
                    GameClient.getInstance().startPingPong();
                    GameClient.getInstance().connectState = ConnectState.CONNECTED;

                    var request = new CmdSendGameInfo();
                    request.putData(NativeBridge.getDeviceModel(), NativeBridge.getOsVersion(),
                        NativeBridge.getPlatform(), NativeBridge.getDeviceID(), gameMgr.appVersion, "aa", "aa",
                        Constant.APP_FOOTBALL, gameMgr.detectVersionUpdate(), gameMgr.getInstallDate(),
                        gameConfig.configVersion, !GameClient.isWaitingReconnect);
                    this.sendPacket(request);
                    request.clean();

                    RankData.connectToServerRank();
                    broadcastMgr.onStart();
                    // reset du lieu cua moi Module khi nhan duoc goi Login
                    gameMgr.resetData();

                } else if (packet.getError() == -44) {
                    cc.log("_____________________LOGIN FAIL____________________");
                    sceneMgr.clearLoading();
                    socialMgr.clearSession();
                    sceneMgr.showOKDialog(LocalizedString.to("LOGIN_FAILED_MAINTAIN"), null, function (btnID) {
                        var checkPortal = false;
                        loginMgr.backToLoginScene(checkPortal);
                    });
                    sceneMgr.clearLoading();
                } else {
                    cc.log("_______________________________________LOGIN FAIL___________________________________");
                    var log = " Login Fail: " + pk.getError() + " " + gameMgr.getSessionKey();
                    sceneMgr.clearLoading();
                    socialMgr.clearSession();
                    sceneMgr.showOkCancelDialog(LocalizedString.to("LOGIN_FAILED") + " " + pk.getError(), null, function (btnID) {
                        var checkPortal = false;
                        if (btnID == 0) {

                        } else {
                            cc.sys.localStorage.setItem("autologin", -1);
                            checkPortal = true;
                        }

                        loginMgr.backToLoginScene(checkPortal);
                    });
                    sceneMgr.clearLoading();
                    throw new Error(log);
                }
                return true;
            }
            case LoginMgr.CMD_LOGIN_FAIL: {
                cc.log("_______________________________RETRY RECONNECT OTHER SERVER________________________________");

                var cmdConnectFail = new CmdReceiveConnectFail(p);
                cc.sys.localStorage.setItem("ipapp", cmdConnectFail.ip);
                cc.sys.localStorage.setItem("portapp", cmdConnectFail.port);

                GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
                GameClient.getInstance().disconnect();
                GameClient.destroyInstance();

                setTimeout(function () {
                    GameClient.getInstance().connect();
                }, 1000);

                RankData.disconnectServer();
                return true;
            }
        }
    },

    backToLoginScene: function (checkPortal) {
        if (checkPortal && portalMgr.isPortal()) {
            gameMgr.endGame();
            return;
        }

        var curScene = sceneMgr.getMainLayer();
        if (curScene instanceof LoginScene && (portalMgr.isPortal() || !cc.sys.isNative)) {
            curScene.autoLoginPortal();
        } else {
            sceneMgr.openScene(LoginScene.className);
        }
    },


    setSessionKey: function (session_key) {
        this.sessionKey = decodeURIComponent(session_key);
        //this.sessionkey = "aWQ9NTUzNzI1OTExJnVzZXJuYW1lPWN1b25nbGVhaDMwMzMmc29jaWFsPXppbmdtZSZzb2NpYWxuYW1lPWN1b25nbGVhaDMwMzMmYXZhdGFyPWh0dHAlM0ElMkYlMkZ6aW5ncGxheS5zdGF0aWMuZzYuemluZy52biUyRmltYWdlcyUyRnpwcCUyRnpwZGVmYXVsdC5wbmcmdGltZT0xNTUxNjcwMTQzJm90aGVyPWRlZmF1bHQlM0ElM0F6aW5nbWUlN0N1bmtub3duJTdDdW5rbm93biU3Q2dnJTNBJTNBNTUzNzI1OTExJTNBJTNBMTA3JnRva2VuS2V5PTMwYTViYTBhMzBhZTJjZTcwOWQ5MzhmODhjY2ViMjFk";
        //this.sessionkey = "lfdj";
        if (this.sessionKey.substr(0,3) === "+++"){
            this.sessionKey = this.sessionKey.substring(3, this.sessionKey.length);
        }
        cc.log("SET SESSION KEY " + session_key);
    },

    getSessionKey: function () {
        return this.sessionKey;
    },

    setOpenId: function (openId) {
        this.openId = openId;
    },

    getOpenId: function () {
        return this.openId;
    },
})

LoginMgr.instance = null;
LoginMgr.getInstance = function () {
    if (!LoginMgr.instance) {
        LoginMgr.instance = new LoginMgr();
    }
    return LoginMgr.instance;
};
var loginMgr = LoginMgr.getInstance();

LoginMgr.CMD_LOGIN = 1;
LoginMgr.CMD_LOGIN_FAIL = 2;