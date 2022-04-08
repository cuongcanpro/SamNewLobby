var LoginMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.tag = "LOGIN MGR :";
        this.sessionKey = "";
        this.sessionExpiredTime = 0;
        this.openID = "";

    },

    init: function () {
        dispatcherMgr.addListener(UserMgr.EVENT_ON_GET_USER_INFO, this, this.onGetUserInfo);
        this.preloadResource();
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
        socialMgr.saveSession(this.sessionKey, typeLogin, this.openId, socialMgr._currentSocial, this.sessionExpiredTime);
        NativeBridge.sendLoginGSN(userMgr.getUID() + "", typeLogin, this.openId + "", userMgr.getUserName());
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

                    var mobile = new CmdSendMobile();
                    var platform = 0;
                    if (cc.sys.os == cc.sys.OS_ANDROID) {
                        platform = 3;
                    } else if (cc.sys.os == cc.sys.OS_IOS) {
                        platform = 1;
                    } else if (!cc.sys.isNative) {
                        platform = 0;
                    } else {
                        platform = 3;
                    }
                    mobile.putData(NativeBridge.getDeviceModel(), NativeBridge.getOsVersion(), platform, NativeBridge.getDeviceID(), gameMgr.detectVersionUpdate(), gameMgr.getInstallDate());
                    GameClient.getInstance().sendPacket(mobile);
                    mobile.clean();

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
            case LoginMgr.CMD_MOBILE: {
                var rMobile = new CmdReceiveMobile(pk);
                rMobile.clean();

                cc.log("CMD_MOBILE : " + JSON.stringify(rMobile));

                if (!Config.ENABLE_PAYMENT_SERVICE) {
                    paymentMgr.enablepayment = rMobile.enablepayment;
                    paymentMgr.payments = rMobile.payments;
                }

                if (portalMgr.isPortal()) {
                    if (Config.DISABLE_IAP_PORTAL) {
                        gamedata.payments[Payment.GOLD_IAP] = false;
                        gamedata.payments[Payment.G_IAP] = false;
                    }
                    for (var i = 0; i < gamedata.payments.length; i++) {
                        if (i == Payment.GOLD_IAP || i == Payment.G_IAP) {
                            if (fr && fr.NativePortal && fr.NativePortal.getInstance().isShowInappShop) {
                                gamedata.payments[i] = fr.NativePortal.getInstance().isShowInappShop() && gamedata.payments[i];
                            }
                        } else {
                            if (fr && fr.NativePortal && fr.NativePortal.getInstance().isShowLocalShop) {
                                gamedata.payments[i] = fr.NativePortal.getInstance().isShowLocalShop() && gamedata.payments[i];
                            }
                        }
                    }

                    if (cc.sys.os == cc.sys.OS_IOS) {
                        gamedata.payments[Payment.GOLD_IAP] = false;
                        gamedata.payments[Payment.G_IAP] = false;
                        var n = 0;
                        for (var i = 0; i < gamedata.payments.length; i++) {
                            if (i != Payment.GOLD_G && gamedata.payments[i]) n = 1;
                        }
                        if (n == 0) gamedata.payments[Payment.GOLD_G] = false;
                    }
                }
                //gamedata.payments = [true, true, false, false];
                //gamedata.payments[Payment.G_ZALO] = false;
                //gamedata.payments[Payment.G_ATM] = false;
                //gamedata.payments[Payment.GOLD_ZALO] = false;
                //gamedata.payments[Payment.GOLD_ZING] = false;
                //gamedata.payments[Payment.GOLD_ATM] = false;
                paymentMgr.payments[Payment.G_CARD] = false;
                if (!cc.sys.isNative) {
                    paymentMgr.payments[Payment.G_IAP] = false;
                    paymentMgr.payments[Payment.GOLD_IAP] = false;
                    paymentMgr.payments[Payment.G_ZALO] = false;
                    paymentMgr.payments[Payment.GOLD_ZALO] = false;
                }
                // gamedata.payments[Payment.G_ZALO] = false;
                // gamedata.payments[Payment.GOLD_ZALO] = false;

                if (Config.ENABLE_CHEAT) {
                    if (CheatCenter.ENABLE_PAYMENT) {
                        for (var s in paymentMgr.payments) {
                            paymentMgr.payments[s] = true;
                        }
                    }
                    //gamedata.payments = [false, false, false, false, false, false, false, false, false, false, false, false];
                    paymentMgr.payments[Payment.G_ZALO] = true;
                    paymentMgr.payments[Payment.GOLD_ZALO] = true;
                }
                cc.log("***PAYMENT : " + paymentMgr.payments.join());
                var pk = new CmdSendGetConfig();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                break;
            }
        }
    },

    backToLoginScene: function (autoConnect) {
        if (autoConnect) {
            if (portalMgr.isPortal()) {
                sceneMgr.openScene(LoadingScene.className);
                loginMgr.setSessionKey(portalMgr.getSessionKeyPortal());
                loginMgr.setOpenId("");
                GameClient.getInstance().connect();
            }
            else {
                sceneMgr.openScene(LoginScene.className);
            }
        }
        else {
            if (portalMgr.isPortal()) {
                gameMgr.endGame();
            }
            else {
                sceneMgr.openScene(LoginScene.className);
            }
        }
    },

    autoLoginPortal: function () {
        socialMgr._currentSocial = SocialManager.ZINGME;
        this.setSessionKey(portalMgr.getSessionKeyPortal());
        this.setOpenId("");
        GameClient.getInstance().connect();
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
LoginMgr.CMD_MOBILE = 1011;
