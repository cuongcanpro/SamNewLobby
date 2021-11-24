var SettingData = cc.Class.extend({
    ctor: function () {
        this.sound = true;
        this.music = true;
        this.vibrate = true;
        this.acceptFriend = true;
        this.acceptInvite = true;

    }
})

var GameMgr = cc.Class.extend({
    ctor: function () {
        this.hasLoadedInfor = false;
        this.settingData = new SettingData();
        this.networkOperator = "";
        this.arrayMgr = [];
    },

    startGame: function () {
        this.initVersion();
        this.initFramework();
        this.initForWeb();
        this.initEmulatorDectector();
        GameWrapper.addIgnoreSceneCache();
        CheatCenter.checkEnableCheat();
        NativeBridge.getTelephoneInfo();
        NativeBridge.getNetworkOperator();
        cc.director.runScene(makeScene(new LoginScene()));
    },

    initVersion: function () {
        // load app version, chi co tac dung cho cac phien ban cu
        if (cc.sys.localStorage.getItem(LocalizedString.config("KEY_APP_VERSION"))) {
            this.appVersion = cc.sys.localStorage.getItem(LocalizedString.config("KEY_APP_VERSION"));
        } else {
            if (cc.sys.os == cc.sys.OS_ANDROID)
                this.appVersion = Config.APP_VERSION_ANDROID_DEFAULT;
            else
                this.appVersion = Config.APP_VERSION_IOS_DEFAULT;
        }
        if (PortalUtil.isPortal()) {
            cc.sys.localStorage.setItem(LocalizedString.config("KEY_JS_VERSION"), fr.platformWrapper.getScriptVersion());
        }
    },

    initFramework: function () {
        var isOldNative = this.checkOldNativeVersion();
        cc.log("start game end load app version: " + isOldNative);
        // init framework
        if (!isOldNative && cc.sys.isNative) {
            fr.google.init();
            fr.facebook.init();
            fr.zaloPay.init(Config.ZALO_PAY_ID);
            fr.platformWrapper.init();
            fr.fcm.init();
            fr.crashLytics.init();
            fr.paymentInfo.init();
            fr.tracker.enableLogErrorJSNew();
            fr.tracker.logCheckAPK(Config.URL_ZALOPAY);

            if (PortalUtil.isPortal()) {
                if (Config.ENABLE_MULTI_PORTAL)
                    fr.paymentInfo.loadInfo();
                fr.portalState.init();
            }
        }
    },

    // new framework
    checkOldNativeVersion: function () {
        if (cc.sys.os == cc.sys.OS_WINDOWS) return true;
        if (cc.sys.os == cc.sys.OS_IOS) return true;
        cc.log("#checkOldNativeVersion " + gamedata.appVersion + " vs " + Config.OLD_VERSION + " -> " + (gamedata.appVersion <= Config.OLD_VERSION));
        return gamedata.appVersion <= Config.OLD_VERSION;
    },

    initForWeb: function () {
        if (!cc.sys.isNative) {
            if (Config.ENABLE_CHEAT) {
                var bakLog = cc._cocosplayerLog || cc.log;

                cc.log = function () {
                    bakLog.call(this, cc.formatStr.apply(cc, arguments));
                };
            } else {
                cc.log = function () {
                };
            }
        }
    },

    initEmulatorDectector: function () {
        this.emulatorDetector =  new EmulatorDetector(function (detect, data) {
            if (detect)
                gamedata.dataEmulator = JSON.stringify(data);
            else
                gamedata.dataEmulator = "";
        }.bind(this));
    },

    /**
     * Ham nay duoc goi khi da vao toi GUI Login, bat dau load thong tin Cache cua Game
     */
    loadGameInformation: function () {
        if (this.hasLoadedInfor) return;
        this.hasLoadedInfor = true;
        this.loadUserDefault();
        this.loadSetting();
        this.loadGameService();
    },

    loadUserDefault: function () {
        // load userdefault
        try {
            var uname = cc.sys.localStorage.getItem(LocalizedString.config("KEY_USERNAME_NEW"));
            var pwd = cc.sys.localStorage.getItem(LocalizedString.config("KEY_PASSWORD_NEW"));
            var login = cc.sys.localStorage.getItem(LocalizedString.config("KEY_LOGIN_NEW"));

            if (login !== undefined && login != null && login != "-10") {
                var autologin = cc.sys.localStorage.getItem(LoginScene.AUTO_LOGIN_KEY);
                if (autologin !== undefined && autologin != -1) {
                    cc.log("---" + login);
                    cc.sys.localStorage.setItem(LoginScene.AUTO_LOGIN_KEY, login);
                }
                cc.sys.localStorage.setItem(LocalizedString.config("KEY_LOGIN_NEW"), "-10");
            }

            if (uname !== undefined && pwd !== undefined && uname != null && pwd != null && uname != "" && pwd != "") {
                cc.sys.localStorage.setItem(LoginScene.USERNAME_KEY, uname);
                cc.sys.localStorage.setItem(LoginScene.PASSWORD_KEY, pwd);

                cc.sys.localStorage.setItem(LocalizedString.config("KEY_USERNAME_NEW"), "");
                cc.sys.localStorage.setItem(LocalizedString.config("KEY_PASSWORD_NEW"), "");
            }

            cc.log("___LOAD__USER__DEFAULT " + uname + "/" + pwd + "/" + login);
        } catch (e) {

        }
    },

    loadSetting: function () {
        if (cc.sys.localStorage.getItem("sound")) {
            var sound = cc.sys.localStorage.getItem("sound");
            this.settingData.sound = sound > 2;
            gameSound.on = this.settingData.sound;
        }

        var vibrate = cc.sys.localStorage.getItem("vibrate");
        if (vibrate !== undefined && vibrate != null) {
            this.settingData.vibrate = (vibrate == 1);
        }

        var invite = cc.sys.localStorage.getItem("invite");
        if (invite !== undefined && invite != null) {
            this.settingData.acceptInvite = (invite == 1);
        }

        var friend = cc.sys.localStorage.getItem("friend");
        if (friend !== undefined && friend != null) {
            this.settingData.acceptFriend = (friend == 1);
        }
    },

    loadGameService: function () {
        var data = cc.sys.localStorage.getItem(LocalizedString.config("KEY_DATA_URL"));
        if (data == null || data === undefined || data == "") {
            this.checkAppVersion();
        } else {
            try {
                cc.log("__AppVersionFromCache : " + data);
                this.readGameService(StringUtility.parseJSON(data));
            } catch (e) {
                this.checkAppVersion();
            }
        }
    },

    checkAppVersion: function () {
        var data = "";
        if (!cc.sys.isNative) {
            var game = LocalizedString.config("GAME_WEB");
            if (game === "GAME_WEB") game = "sam_web";
            data += "game=" + game;
        } else {
            if (cc.sys.os == cc.sys.OS_ANDROID)
                data += "game=" + LocalizedString.config("GAME_ANDROID");
            else if (cc.sys.os == cc.sys.OS_IOS)
                data += "game=" + LocalizedString.config("GAME_IOS");
            else
                data += "game=" + LocalizedString.config("GAME_ANDROID");
        }

        data += ("&device=" + NativeBridge.getDeviceID() + "&version=" + gamedata.appVersion);
        data += ("&referer=" + NativeBridge.getRefer());

        engine.HandlerManager.getInstance().forceRemoveHandler("check_version");
        engine.HandlerManager.getInstance().addHandler("check_version", this.onTimeout.bind(this));
        engine.HandlerManager.getInstance().getHandler("check_version").setTimeOut(10, true);

        this.xhr = LoginHelper.getRequest(Constant.APP_VERSION_URL, data, null, null, this.onResponse.bind(this));
        cc.log("# JsonRequest " + Constant.APP_VERSION_URL + "?" + data);
        // this.onFinishLoadInformation();
    },

    onResponse: function () {
        if (!cc.sys.isNative && (!this.xhr || (this.xhr.readyState !== XMLHttpRequest.DONE)))
            return;
        cc.log("__AppVersionFromServices : " + this.xhr.responseText);
        var obj = StringUtility.parseJSON(this.xhr.responseText);
        this.readGameService(obj);

        engine.HandlerManager.getInstance().forceRemoveHandler("check_version");
    },

    onTimeout: function () {
        cc.log("__________TIMEOUT___CHECK___VERSION_______________");
        this.xhr.abort();
        this.onFinishLoadInformation();
    },

    readGameService: function (obj) {
        // parse services
        if (obj["ipapp"] && obj["portapp"]) {
            GameData.getInstance().ipapp = "" + obj["ipapp"];
            GameData.getInstance().portapp = "" + obj["portapp"];

            cc.sys.localStorage.setItem("ipapp", GameData.getInstance().ipapp);
            cc.sys.localStorage.setItem("portapp", GameData.getInstance().portapp);
        }

        //if ((obj["enablepayment"] != null)) {
        //    cc.sys.localStorage.setItem("enablepayment", obj["enablepayment"]);
        //    gamedata.enablepayment = obj["enablepayment"];
        //}

        if ((obj["enablefacebook"] != null)) {
            GameData.getInstance().enablefacebook = false;
            cc.sys.localStorage.setItem("enablefacebook", obj["enablefacebook"]);
        }

        if (obj["disableLoginSocial"] != null) {
            gamedata.disablesocial = obj["disableLoginSocial"];
            cc.sys.localStorage.setItem("disableLoginSocial", obj["disableLoginSocial"]);
        }

        if (obj["source"] != null) {
            gamedata.source = obj["source"];
            cc.sys.localStorage.setItem("source", obj["source"]);
        } else {
            gamedata.source = "";
        }

        if (obj["enableAdultIcon"] != null) {
            gamedata.enableAdult = (obj["enableAdultIcon"] == 1);
        } else {
            gamedata.enableAdult = true;
        }

        if (obj["update_link"] != null) {
            gamedata.storeUrl = obj["update_link"];
            cc.sys.localStorage.setItem("update_link", obj["update_link"]);
        }

        if (obj["defautlogin"] != null) {
            gamedata.defaultlogin = obj["defautlogin"];
            cc.sys.localStorage.setItem("defaultlogin", obj["defautlogin"]);
        }

        if (obj["isAppSupport"] != null) {
            gamedata.isAppSupport = (obj["isAppSupport"] == 1);
            cc.sys.localStorage.setItem("isAppSupport", obj["isAppSupport"]);
        }

        if ((obj["support"] != null) && (obj["forum"] != null)) {
            gamedata.support = obj["support"];
            gamedata.forum = obj["forum"];

            if (gamedata.isAppSupport)
                gamedata.supporturl = "http://hotro.zing.vn";
            else
                gamedata.supporturl = gamedata.support;

            gamedata.supportphone = "";

            cc.sys.localStorage.setItem("support", obj["support"]);
            cc.sys.localStorage.setItem("forum", obj["forum"]);

            cc.sys.localStorage.setItem("supporturl", gamedata.supporturl);
            cc.sys.localStorage.setItem("supportphone", gamedata.supportphone);
        }

        if (obj["urlnews"] != null) {
            gamedata.urlnews = obj["urlnews"];
            cc.sys.localStorage.setItem("urlnews", obj["urlnews"]);
        }
        if (obj["old_version"] != null) {
            gamedata.old_version_link = obj["old_version"];
            cc.sys.localStorage.setItem("old_version", obj["old_version"]);
        }

        if (obj["regZing"] != null) {
            gamedata.regZing = obj["regZing"];
        } else {
            gamedata.regZing = "0";
        }

        if (obj["ssl"] != null) {
            gamedata.domainLoginWss = obj["ssl"];
            cc.sys.localStorage.setItem("ssl", obj["ssl"]);
        }

        if (obj["sslRank"] != null) {
            cc.sys.localStorage.setItem("sslRank", obj["sslRank"]);
        }

        if (obj["ipAppRank"] && obj["portAppRank"]) {

            cc.sys.localStorage.setItem("ipAppRank", obj["ipAppRank"]);
            cc.sys.localStorage.setItem("portAppRank", obj["portAppRank"]);
        }
        // finish loading
        this.onFinishLoadInformation();
    },

    /**
     * Doc duoc thong tin Version thi moi bat dau show GUI Login hay tu dong Dang nhap vao Game
     */
    onFinishLoadInformation: function () {
        var g = sceneMgr.getRunningScene().getMainLayer();
        if (!Config.WITHOUT_LOGIN || cc.sys.isNative) {
            g.showLogin();
        } else {
            g.autoLogin();
        }
    },

    updateNetworkOperator: function () {
        cc.log("##UpdateNetwork Operator");
        this.networkOperator = "";
        this.networkOperator = NativeBridge.getTelephoneInfo();
        if (this.networkOperator == "") {
            this.networkOperator = NativeBridge.getNetworkOperator();
        }
        cc.log("##NetworkOperator : " + this.networkOperator);
    },

    addToArrayMgr: function (mgr) {
        this.arrayMgr.push(mgr);
    },

    resetData: function () {
        for (var i = 0; i < this.arrayMgr.length; i++) {
            this.arrayMgr[i].resetData();
        }
    },

    endGame: function () {
        if (PortalUtil.isPortal()) {
            try {
                fr.NativeService.endGame();
            } catch (e) {
                cc.director.end();
            }
        } else {
            if (cc.sys.os == cc.sys.OS_IOS)
                engine.HandlerManager.getInstance().exitIOS();
            else
                cc.director.end();
        }
    },

    // function scene
    onEnterScene: function () {
        CheatCenter.openCheatPopup();

        PingPongHandler.getInstance().checkNeedPing();
        BroadcastMgr.getInstance().reloadBroadcast();
    },

    onUpdateScene: function (dt) {
        BroadcastMgr.getInstance().updateBroadcast(dt);
        PingPongHandler.getInstance().updatePing(dt);
        TimeoutConnectHandler.getInstance().updateCountDown(dt);

        // if (gamedata.countZaloPay >= 0) {
        //     gamedata.countZaloPay = gamedata.countZaloPay + dt;
        //     if (gamedata.countZaloPay > 10) {
        //         // show thong bao cai zalo
        //         gamedata.countZaloPay = -1;
        //         var str = LocalizedString.to("ZALOPAY_ERROR_INSTALL");
        //         Toast.makeToast(Toast.SHORT, str);
        //     }
        // }
        eventMgr.updateEventLoop(dt);
        try {
            downloadEventManager.updateDownload();
        } catch (e) {

        }
    },
});

GameMgr.instance = null;
GameMgr.getInstance = function () {
    if (!GameMgr.instance) {
        GameMgr.instance = new GameMgr();
    }
    return GameMgr.instance;
};
var gameMgr = GameMgr.getInstance();