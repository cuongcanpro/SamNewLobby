var LoginMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.tag = "LOGIN MGR :";
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/LogoLarge/skeleton.xml","LogoLarge");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/LogoLarge/texture.plist", "LogoLarge");
    },

    onReceived: function (cmd, pk) {
        cc.log(this.tag + cmd);
        switch (cmd) {
            case CMD.CMD_LOGIN: {
                if (pk.getError() == 0) {
                    cc.log("_________________________________LOGIN SUCCESSFUL___________________________________");

                    GameClient.getInstance().startPingPong();
                    GameClient.getInstance().connectState = ConnectState.CONNECTED;

                    var request = new CmdSendGameInfo();
                    request.putData(NativeBridge.getDeviceModel(), NativeBridge.getOsVersion(),
                        NativeBridge.getPlatform(), NativeBridge.getDeviceID(), gameMgr.appVersion, "aa", "aa",
                        Constant.APP_FOOTBALL, gamedata.detectVersionUpdate(), gamedata.getInstallDate(),
                        gamedata.gameConfig.configVersion, !GameClient.isWaitingReconnect);
                    this.sendPacket(request);
                    request.clean();

                    NewRankData.connectToServerRank();
                    broadcastMgr.onStart();
                    this.resetData();

                } else if (pk.getError() == -44) {
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
                    var log = " Login Fail: " + pk.getError() + " " + GameData.getInstance().sessionkey;
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
                break;
            }
            case CMD.CMD_LOGIN_FAIL: {
                cc.log("_______________________________RETRY RECONNECT OTHER SERVER________________________________");

                var cmdConnectFail = new CmdReceiveConnectFail(p);
                cc.sys.localStorage.setItem("ipapp", cmdConnectFail.ip);
                cc.sys.localStorage.setItem("portapp", cmdConnectFail.port);

                GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
                engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
                engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");
                GameClient.getInstance().disconnect();
                GameClient.destroyInstance();

                setTimeout(function () {
                    GameClient.getInstance().connect();
                }, 1000);

                NewRankData.disconnectServer();
                break;
            }
        }
    },

    backToLoginScene: function (checkPortal) {
        if (checkPortal && PortalUtil.isPortal()) {
            gameMgr.endGame();
            return;
        }

        var curScene = sceneMgr.getMainLayer();
        if (curScene instanceof LoginScene && (PortalUtil.isPortal() || !cc.sys.isNative)) {
            curScene.autoLoginPortal();
        } else {
            sceneMgr.openScene(LoginScene.className);
        }
    },

    loginGameSuccess: function () {
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
            if (gamedata.isPortal()) {
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
        socialMgr.saveSession(gamedata.sessionkey, typeLogin, gamedata.openID, socialMgr._currentSocial, gamedata.sessionExpiredTime);
        NativeBridge.sendLoginGSN(gamedata.userData.uID + "", typeLogin, gamedata.openID + "", gamedata.userData.zName);
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