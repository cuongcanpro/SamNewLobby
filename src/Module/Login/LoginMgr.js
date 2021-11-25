var LoginMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.tag = "LOGIN MGR :";
        this.sessionKey = "";
        this.openId = "";
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/LogoLarge/skeleton.xml","LogoLarge");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/LogoLarge/texture.plist", "LogoLarge");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/loadingZP/skeleton.xml","loadingZP");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/loadingZP/texture.plist", "loadingZP");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/firework2/skeleton.xml","firework2");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/firework2/texture.plist", "firework2");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/firework1/skeleton.xml","firework1");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/firework1/texture.plist", "firework1");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/firework3/skeleton.xml","firework3");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/firework3/texture.plist", "firework3");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Choingay/skeleton.xml","Choingay");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Choingay/texture.plist", "Choingay");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Chonban/skeleton.xml","Chonban");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Chonban/texture.plist", "Chonban");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/MinigameBTN/skeleton.xml","MinigameBTN");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/MinigameBTN/texture.plist", "MinigameBTN");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/shopwithtag/skeleton.xml","shopwithtag");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/shopwithtag/texture.plist", "shopwithtag");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/bt_vip_xephang/skeleton.xml","bt_vip_xephang");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/bt_vip_xephang/texture.plist", "bt_vip_xephang");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/VipBTN/skeleton.xml","VipBTN");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/VipBTN/texture.plist", "VipBTN");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/jackpot/skeleton.xml","jackpot");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/jackpot/texture.plist", "jackpot");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Girl/skeleton.xml","Girl");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Girl/texture.plist", "Girl");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/BtnCoin/skeleton.xml","BtnCoin");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/BtnCoin/texture.plist", "BtnCoin");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/LogoSmall/skeleton.xml","LogoSmall");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/LogoSmall/texture.plist", "LogoSmall");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/AddGBTN/skeleton.xml","AddGBTN");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/AddGBTN/texture.plist", "AddGBTN");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Lasvegas/skeleton.xml","Lasvegas");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Lasvegas/texture.plist", "Lasvegas");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/ShopBTN/skeleton.xml","ShopBTN");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/ShopBTN/texture.plist", "ShopBTN");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Lasvegas/skeleton.xml","Lasvegas");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Lasvegas/texture.plist", "Lasvegas");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Emoticon/0/skeleton.xml","Emoticon0");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Emoticon/0/texture.plist", "Emoticon0");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Emoticon/skeleton.xml","Emoticon");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Emoticon/texture.plist", "Emoticon");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Coin/skeleton.xml","Coin");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Coin/texture.plist", "Coin");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/IconHot/skeleton.xml","IconHot");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/IconHot/texture.plist", "IconHot");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/DotEff/skeleton.xml","DotEff");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/DotEff/texture.plist", "DotEff");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/LightBg/skeleton.xml","LightBg");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/LightBg/texture.plist", "LightBg");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Notify/skeleton.xml","Notify");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Notify/texture.plist", "Notify");
    },

    onReceived: function (cmd, pk) {
        cc.log(this.tag + cmd);
        switch (cmd) {
            case CMD.CMD_LOGIN: {
                if (pk.getError() == 0) {
                    GameClient.getInstance().startPingPong();
                    GameClient.getInstance().connectState = ConnectState.CONNECTED;

                    var request = new CmdSendGameInfo();
                    request.putData(NativeBridge.getDeviceModel(), NativeBridge.getOsVersion(),
                        NativeBridge.getPlatform(), NativeBridge.getDeviceID(), gameMgr.appVersion, "aa", "aa",
                        Constant.APP_FOOTBALL, gameMgr.detectVersionUpdate(), gameMgr.getInstallDate(),
                        gameMgr.gameConfig.configVersion, !GameClient.isWaitingReconnect);
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
    }

})

LoginMgr.instance = null;
LoginMgr.getInstance = function () {
    if (!LoginMgr.instance) {
        LoginMgr.instance = new LoginMgr();
    }
    return LoginMgr.instance;
};
var loginMgr = LoginMgr.getInstance();