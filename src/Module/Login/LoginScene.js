
var LoginScene = BaseLayer.extend({

    ctor: function () {
        this.loading = null;

        this.pAccount = null;
        this.pLoading = null;
        this.sub = null;
        this.title = null;
        this.btnClose = null;

        this.icon = null;
        this.logo = null;
        this.effectLogo = null;
        this.dots = [];

        // delay login
        this.idWaitLogin = -1;
        this.idFuncWait = null;

        // login
        this.login_tfName = null;
        this.login_tfPassword = null;
        this.login_name = "";
        this.login_pass = "";

        // loading
        this.tfLoading = null;

        cc.sys.localStorage.setItem(LoginScene.TMP_US_KEY, "");
        cc.sys.localStorage.setItem(LoginScene.TMP_PWD_KEY, "");

        this._super(LoginScene.className);
        this.initWithBinaryFile("LoginGUI.json");
    },

    onEnterFinish : function () {
        if(this.idFuncWait) clearTimeout(this.idFuncWait);
        gamedata.inLobby = false;
        if(gamedata.hasLoadedInfor)
            if (!Config.WITHOUT_LOGIN || cc.sys.isNative) {
                this.showLogin();
            } else {
                this.autoLogin();
            }
        else
            this.showLoadingInformation();
        this.reloadButtonSocial();
    },
    
    autoLogin : function () {

        if(Config.ENABLE_CHEAT)
        {
           // if (true)
         //     return;
            if(CheatCenter.fakeLogin()) return;
        }

        var autologin = cc.sys.localStorage.getItem(LoginScene.AUTO_LOGIN_KEY);

        if ((autologin == "") || (autologin === undefined) || autologin == null) {
            autologin = cc.sys.localStorage.getItem("defaultlogin");
        }

        cc.log("_______AUTO___LOGIN____" + autologin);

        if(Config.WITHOUT_LOGIN && !cc.sys.isNative)
        {

            this.login_tfName.setString("");
            this.login_tfPassword.setString("");
            try {
                if(session_key && (session_key !== ""))
                {
                    gamedata.sessionkey = decodeURIComponent(session_key);
                    //gamedata.sessionkey = "aWQ9NTUzNzI1OTExJnVzZXJuYW1lPWN1b25nbGVhaDMwMzMmc29jaWFsPXppbmdtZSZzb2NpYWxuYW1lPWN1b25nbGVhaDMwMzMmYXZhdGFyPWh0dHAlM0ElMkYlMkZ6aW5ncGxheS5zdGF0aWMuZzYuemluZy52biUyRmltYWdlcyUyRnpwcCUyRnpwZGVmYXVsdC5wbmcmdGltZT0xNTUxNjcwMTQzJm90aGVyPWRlZmF1bHQlM0ElM0F6aW5nbWUlN0N1bmtub3duJTdDdW5rbm93biU3Q2dnJTNBJTNBNTUzNzI1OTExJTNBJTNBMTA3JnRva2VuS2V5PTMwYTViYTBhMzBhZTJjZTcwOWQ5MzhmODhjY2ViMjFk";
                    //gamedata.sessionkey = "lfdj";
                    if (gamedata.sessionkey.substr(0,3) === "+++"){
                        gamedata.sessionkey = gamedata.sessionkey.substring(3,session_key.length);
                    }

                    //Toast.makeToast(3,gamedata.sessionkey);
                }
            } catch (e) {
                cc.error("khong lay duoc session");
            }

            // var sessSave = "BzByEwscDAIODDIQIBUSZiwJdVAcPi1FGTFWSD43ESQEMEhdCDU9SiJUKVQ3OChrAwpPXxxUVlwKCClSN10zOgQgFkIkMTIJCjMqFCQ7NCUsMm5QDDMuACILBFY7KR4%2FPz95QiIhIUkQMQ8UCicePitXZkYLDT5cDQ09Eg84ajwFIFtCIzVSSiQhIRQPOBInPB16XyMLC0UaH1IWDAYKKzQKT14fMQNcIx8yXTwBLyUFJHZTFAgXRxohMUk3NwkhAiQWXSQLBF0kIQtQNDtvKigzQBgIMjICDiIAECQCZmIHIHVTFjE1XBoLIRUMJw4%2BK1dmRgtWIlwNViJII18aKCkzehgIMgADDRwASCNfGj4rV2ZSCwwEXSQhXlY0OGoePD9IEwhUIgUNIi1NIxU7OygdS0ILHDZKGQspTiM4DmIrI24eHAs2BRkxLlw0Owpv";
            // this.setCookie(LoginScene.KEY_SESSION_KEY, sessSave, 10);

            var sessionKey = CookieUtility.getCookie(CookieUtility.KEY_SESSION_KEY);
            if (sessionKey !== ""){
                cc.log("sessionKey: " + sessionKey);
                gamedata.sessionkey = sessionKey;
            } else {
                // sceneMgr.showOKDialog(localized("_LOGIN_ERROR_"));
            }

            if (!gamedata.sessionkey || gamedata.sessionkey === ""){
                sceneMgr.showOKDialog(localized("_LOGIN_ERROR_"));
            }

            cc.log("SessionKey: "+gamedata.sessionkey);
            GameClient.getInstance().connect();
            this.loading = sceneMgr.addLoading(LocalizedString.to("_SINGING_"), true, this);
            this.loading.setTag(LOADING_TAG);
            return;
        }

        if (autologin == SocialManager.GOOGLE) {
            this.onButtonRelease(null, LoginScene.BTN_GG);
        }
        else if (autologin == SocialManager.FACEBOOK) {
            this.onButtonRelease(null, LoginScene.BTN_FB);
        }
        else if (autologin == SocialManager.ZALO) {
//            this.onButtonRelease(null, LoginScene.BTN_ZALO);
            cc.log("AUTO LOGIN ZALO 1 ******************** ");
            this.idWaitLogin = LoginScene.BTN_ZALO;
            this.autoLoginZalo();
        }
        else if (autologin == SocialManager.ZINGME) {
            this.idWaitLogin = LoginScene.BTN_LOGIN_ZME;
            this.autologinZingme();
        }
    },

    autoLoginPortal : function () {
        this.showLoadingInformation(true);

        this.tfLoading.setString(LocalizedString.to("PORTAL_LOADING"));

        socialMgr._currentSocial = SocialManager.ZINGME;

        GameData.getInstance().sessionkey = gamedata.getSessionKeyPortal();
        GameData.getInstance().openID = "";

        GameClient.getInstance().connect();
    },

    customizeGUI: function () {

        var size = cc.director.getWinSize();

        this.setBackEnable(true);

        // bg
        var bg = this.getControl("bg");
        bg.setScaleX(size.width / bg.getContentSize().width);
        bg.setScaleY(size.height / bg.getContentSize().height);
        bg.setPosition(size.width / 2, size.height / 2);

        this.sub = this.getControl("sub");
        this.title = this.getControl("title");
        this.text1 = this.getControl("TextNote1");
        this.text2 = this.getControl("TextNote2");
        this.btnClose = this.customButton("btnQuit", LoginScene.BTN_QUIT);
        return;
        // logo game
        this.icon = this.getControl("icon");
        this.icon.setVisible(false);
        this.icon.setPosition(size.width/2,size.height/2 - this.icon.getContentSize().height*0.125);

        this.logo = new cc.Sprite("common/gametitle.png");
        this.logo.setScale(this._scale);
        this.logo.setLocalZOrder(99);
        this.logo.setVisible(false);
        this.logo.setPosition(this.icon.getPositionX() - this.logo.getContentSize().width*this._scale*0.035,this.icon.getPositionY() + this.logo.getContentSize().height*this._scale*0.275);
        this._layout.addChild(this.logo);

        this.effectLogo = db.DBCCFactory.getInstance().buildArmatureNode("LogoLarge");
        if(this.effectLogo)
        {
            this.effectLogo.setVisible(false);
            this._layout.addChild(this.effectLogo);
            this.effectLogo.setPosition(this.icon.getPosition());
            this.effectLogo.setScale(this._scale);
            this.effectLogo.getAnimation().gotoAndPlay("1",-1,-1,0);
        }

        // loading
        this.pLoading = this.getControl("pLoading");
        this.pLoading.setPositionY(this.icon.getPositionY() - this.icon.getContentSize().height/2 - this.pLoading.getContentSize().height*1.25);

        this.tfLoading = this.getControl("lb",this.pLoading);
        this.tfLoading.setString(LocalizedString.to("DOWNLOAD_GAME_INFORMATION"));

        this.pLoading.light = this.getControl("light",this.pLoading);
        this.pLoading.light.setLocalZOrder(99);
        this.pLoading.light.setVisible(false);

        var dot = this.getControl("dot",this.pLoading);
        this.dots = [];
        this.dots.push(dot);

        for(var i = 0 ; i < 40 ; i++)
        {
            var dotClone = dot.clone();
            dotClone.setPosition(dot.getPositionX() + dot.getContentSize().width*1.15*(i+1),dot.getPositionY());
            this.pLoading.addChild(dotClone);
            this.dots.push(dotClone);
        }

        this.pAccount = this.getControl("pAccount");

        this.bZL = this.customButton("btnZalo", LoginScene.BTN_ZALO, this.pAccount);
        this.bFB = this.customButton("btnFacebook", LoginScene.BTN_FB, this.pAccount);
        this.bGG = this.customButton("btnGoogle", LoginScene.BTN_GG, this.pAccount);
        this.bZE = this.customButton("btnZingme", LoginScene.BTN_ZM, this.pAccount);

        var mappedZalo = cc.sys.localStorage.getItem(LoginScene.MAPPED_ZALO);
        if (!mappedZalo || mappedZalo == undefined) {
            mappedZalo = 0;
        }
        // if (mappedZalo == 1) {
            this.bZL.setVisible(false);
        // }

        this.pLogin = this.getControl("pLogin");
        this.customButton("btnRegister", LoginScene.BTN_REGISTER, this.pLogin);
        this.customButton("btnLogin",LoginScene.BTN_LOGIN_ZME,this.pLogin);
        this.login_tfName = this.getControl("tfAcount", this.pLogin);
        this.login_tfPassword = this.getControl("tfPass", this.pLogin);
        this.login_tfPassword.setPasswordEnabled(true);

        // hide p
        this.pAccount.setVisible(false);
        this.pLoading.setVisible(false);
        this.pAccount.setVisible(false);

        if (Config.WITHOUT_LOGIN && !cc.sys.isNative){
            this.pAccount.setVisible(false);
            this.pLogin.setVisible(false);
            this.getControl("sub").setVisible(false);
            this.icon.setVisible(true);
            this.icon.setPosition(size.width/2-3.5,size.height/2+8.5);
        }
    },

    reloadButtonSocial: function () {
        switch (gamedata.disablesocial) {
            case 1:
            case "1":
            {
                this.bFB.setVisible(false);
                this.bGG.setVisible(false);
                this.bZL.setVisible(false);
                break;
            }
            case 2:
            case "2":
            {
                this.bFB.setVisible(false);
                break;
            }
            case 0:
            case "0":
            {
                this.bGG.setVisible(false);
                break;
            }
            case 3:
            case "3":
            {
                this.bZL.setVisible(false);
                break;
            }
        }
    },

    loadUserDefault  : function () {
        if (cc.sys.localStorage.getItem(LoginScene.USERNAME_KEY) != null) {
            this.login_name = "" + cc.sys.localStorage.getItem(LoginScene.USERNAME_KEY);
        }

        if (cc.sys.localStorage.getItem(LoginScene.PASSWORD_KEY) != null) {
            this.login_pass = "" + cc.sys.localStorage.getItem(LoginScene.PASSWORD_KEY);
        }

        this.login_tfName.setString(this.login_name);
        this.login_tfPassword.setString(this.login_pass);
    },

    onButtonRelease: function (button, id) {
        if(id == LoginScene.BTN_GG || id == LoginScene.BTN_FB || id == LoginScene.BTN_ZALO || id == LoginScene.BTN_ZM || id == LoginScene.BTN_LOGIN_ZME)
        {
            if(Config.ENABLE_CHEAT)
            {
                if(CheatCenter.fakeLogin()) return;
            }
        }

        switch (id) {
            case LoginScene.BTN_GG:
            {
                if(this.idWaitLogin != -1) break;
                this.idWaitLogin = id;

                setTimeout(this.loginGoogle.bind(this),LoginScene.TIME_DELAY_LOGIN);
                break;
            }
            case LoginScene.BTN_FB:
            {
                if(this.idWaitLogin != -1) break;
                this.idWaitLogin = id;

                setTimeout(this.loginFacebook.bind(this),LoginScene.TIME_DELAY_LOGIN);
                break;
            }
            case LoginScene.BTN_ZALO:
            {
                //if(this.idWaitLogin != -1) break;
                //this.idWaitLogin = id;

                //setTimeout(this.loginZalo.bind(this),LoginScene.TIME_DELAY_LOGIN);
                this.idWaitLogin = LoginScene.BTN_ZALO;
                this.autoLoginZalo();
                break;
            }
            case LoginScene.BTN_ZM:
            {
                if (Config.ENABLE_CHEAT) {
                    // if (cc.sys.os != cc.sys.OS_ANDROID && cc.sys.os != cc.sys.IOS) {
                    //     // zingme aWQ9NTIyMjIxMDkwJnVzZXJuYW1lPWN1b25nbGVhaDExMDEmc29jaWFsPXppbmdtZSZzb2NpYWxuYW1lPWN1b25nbGVhaDExMDEmYXZhdGFyPWh0dHAlM0ElMkYlMkZ6aW5ncGxheS5zdGF0aWMuZzYuemluZy52biUyRmltYWdlcyUyRnpwcCUyRnpwZGVmYXVsdC5wbmcmdGltZT0xNTMxODk4NjUzJm90aGVyPWRlZmF1bHQlM0ElM0F6aW5nbWUlN0N1bmtub3duJTdDdW5rbm93biUzQSUzQTUyMjIyMTA5MCUzQSUzQTEwMCZ0b2tlbktleT1lM2FmYzE5ZjA4OGVhNGRmZDUxM2EyZDBhMTgyMjRhNw==
                    //     GameData.getInstance().sessionkey = "aWQ9Mzk2NjU4NzM4JnVzZXJuYW1lPXNvbWkwNSZzb2NpYWw9emluZ21lJnNvY2lhbG5hbWU9JUM0JTkwJUMzJUI0bmcrUFAmYXZhdGFyPWh0dHAlM0ElMkYlMkZ6aW5ncGxheS5zdGF0aWMuZzYuemluZy52biUyRmltYWdlcyUyRnpwcCUyRnpwZGVmYXVsdC5wbmcmdGltZT0xNDcyNjEzOTUzJm90aGVyPWRlZmF1bHQlM0ElM0F6aW5nbWUlN0N1bmtub3duJTdDdW5rbm93biUzQSUzQTM5NjY1ODczOCZ0b2tlbktleT1iN2RlMWEyMWIzOWU3YjRjNWRiZDAyYzk4MjNhY2IxOQ==";
                    //     //  GameData.getInstance().sessionkey = "aWQ9Mzc0NDUxNzMmdXNlcm5hbWU9c2ltbzMyJnNvY2lhbD16aW5nbWUmc29jaWFsbmFtZT1zaW1vMzImYXZhdGFyPWh0dHAlM0ElMkYlMkZ6aW5ncGxheS5zdGF0aWMuZzYuemluZy52biUyRmltYWdlcyUyRnpwcCUyRnpwZGVmYXVsdC5wbmcmdGltZT0xNTI2NTQzMTYwJm90aGVyPWRpc190aWVubGVuJTNBJTNBZGVmYXVsdCUzQSUzQTM3NDQ1MTczJTNBJTNBOTk5JnRva2VuS2V5PTM3NTQ0ODM4NzdmNTNiMGMyZjBiNDFjNWQ1YTNiNDk4";
                    //     GameClient.getInstance().connect();
                    // }
                    // else {
                    //
                    // }
                    sceneMgr.openGUI(TestAccountGUI.className);
                }
                else {
                    try {
                        this.login_tfName.attachWithIME();
                    }
                    catch(e) {

                    }
                }

                break;
            }
            case LoginScene.BTN_REGISTER:
            {
                if (!gamedata.regZing || gamedata.regZing == 0 || gamedata.regZing == "0") {
                    var gui = sceneMgr.openGUI(AccountInputUI.className,LoginScene.GUI_ZINGME,LoginScene.GUI_ZINGME);
                    gui.setParent(this);
                    gui.setTypeGui(AccountInputUI.REGISTER);
                }
                else {
                    NativeBridge.openURLNative("https://play.zing.vn/zpp/services/register/reg.php");
                }
                break;
            }
            case LoginScene.BTN_QUIT:
            {
                this.onBack();
                break;
            }
            case LoginScene.BTN_LOGIN_ZME:
            {
                if(this.idWaitLogin != -1) break;
                this.idWaitLogin = id;

                setTimeout(this.loginZingme.bind(this),LoginScene.TIME_DELAY_LOGIN);
                break;
            }
        }
    },
    
    loginZalo : function () {
        return;
        if(!this.checkInScene()) return;

        this.delayWaitLogin();

        if(!this.checkNetwork()) return;

        cc.sys.localStorage.setItem(LoginScene.AUTO_LOGIN_KEY, SocialManager.ZALO);

        SocialManager.getInstance().set(this, this.onResponseAccessToken.bind(this));
        SocialManager.getInstance().loginZalo();
    },

    loginGoogle : function ()  {
        if(!this.checkInScene()) return;

        this.delayWaitLogin();

        if(!this.checkNetwork()) return;

        cc.sys.localStorage.setItem(LoginScene.AUTO_LOGIN_KEY, SocialManager.GOOGLE);

        SocialManager.getInstance()._currentSocial = SocialManager.GOOGLE;
        SocialManager.getInstance().set(this, this.onResponseSessionKey.bind(this));

        if(!SocialManager.getInstance().getSessionCacheWithId(SocialManager.GOOGLE_CACHE)) {
            if(gamedata.checkOldNativeVersion()) {
                SocialManager.getInstance().set(this, this.onResponseAccessToken.bind(this));
                SocialManager.getInstance().loginGoogle();
            }
            else {
                if(cc.sys.os != cc.sys.OS_WINDOWS)
                    sceneMgr.addLoading();

                fr.google.login(function (res,token) {
                    this.onResponseAccessToken(SocialManager.GOOGLE,JSON.stringify({
                        error : res ? 0 : 1,
                        access_token : token
                    }));

                    if(res)
                        SocialManager.getInstance().getSessionKey(SocialManager.GOOGLE,token);
                }.bind(this));
            }
        }
        else {
            this.loading = sceneMgr.addLoading(LocalizedString.to("_SINGING_"), true, this);
        }
    },

    loginFacebook : function () {
        if(!this.checkInScene()) return;
        this.idWaitLogin = LoginScene.BTN_FB;
        this.delayWaitLogin();

        if(!this.checkNetwork()) return;

        cc.sys.localStorage.setItem(LoginScene.AUTO_LOGIN_KEY, SocialManager.FACEBOOK);

        SocialManager.getInstance()._currentSocial = SocialManager.FACEBOOK;
        SocialManager.getInstance().set(this, this.onResponseSessionKey.bind(this));

        if(!SocialManager.getInstance().getSessionCacheWithId(SocialManager.FACEBOOK_CACHE)) {
            cc.log("LOGIN FACE BOOK 1: New Login without cache");

            if (gamedata.checkOldNativeVersion()) {
                SocialManager.getInstance().set(this, this.onResponseAccessToken.bind(this));
                SocialManager.getInstance().loginFacebook();
            }
            else {
                fr.facebook.login(function (res,token) {
                    this.onResponseAccessToken(SocialManager.FACEBOOK,JSON.stringify({
                        error : res ? 0 : 1,
                        access_token : token
                    }));

                    if(res)
                        SocialManager.getInstance().getSessionKey(SocialManager.FACEBOOK,token);
                }.bind(this));
            }
        }
        else {
            this.loading = sceneMgr.addLoading(LocalizedString.to("_SINGING_"), true, this);
        }
    },

    loginZingme : function () {
        if(!this.checkInScene()) return;

        var uname = this.login_tfName.getString();
        var pass = this.login_tfPassword.getString();

        if(Config.ENABLE_CHEAT && Config.ENABLE_DEV)
        {
            var sFake = parseInt(this.login_tfName.getString());
            if(!sFake) sFake = "1";
            gamedata.sessionkey = sFake;
            GameClient.getInstance().connect();
            // NewRankData.connectToServerRank();
            return;
        }

        if ((uname == "") || (pass == "")) {
            Toast.makeToast(Toast.SHORT, LocalizedString.to("_EMPTYLOGIN_"));
            this.idWaitLogin = -1;
            return;
        }

        cc.sys.localStorage.setItem(LoginScene.TMP_US_KEY, uname);
        cc.sys.localStorage.setItem(LoginScene.TMP_PWD_KEY, pass);

        this.autologinZingme(uname,pass);
    },
    
    delayWaitLogin : function () {
        this.idFuncWait = setTimeout(this.releaseWaitLogin.bind(this),1500);
    },
    
    releaseWaitLogin : function () {
        this.idWaitLogin = -1;
    },
    
    checkNetwork : function () {
        if(!NativeBridge.networkAvaiable())
        {
            sceneMgr.showOKDialog(LocalizedString.to("_NONETWORK_"));
            return false;
        }
        return true;
    },

    checkInScene : function () {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        return !!(gui instanceof  LoginScene);
    },
    
    showLoadingInformation : function (isLoaded) {
        this.pAccount.setVisible(false);
        this.pLoading.setVisible(true);
        this.pLogin.setVisible(false);
        this.sub.setVisible(false);
        this.title.setVisible(false);
        this.btnClose.setVisible(false);
        this.logo.setVisible(true);
        if(this.effectLogo) this.effectLogo.setVisible(true);

        if(isLoaded === undefined || isLoaded == null || !isLoaded)
            setTimeout(gamedata.loadGameInformation.bind(gamedata),0.1);
    },

    showLogin : function () {
        if(gamedata.isPortal()) // Portal -> auto login with portal session
        {
            this.autoLoginPortal();
            return;
        }

        this.pAccount.setVisible(true);
        this.pLogin.setVisible(true);
        this.pLoading.setVisible(false);
        this.sub.setVisible(true);
        this.title.setVisible(true);
        this.btnClose.setVisible(true);
        this.logo.setVisible(false);
        if(this.effectLogo) this.effectLogo.setVisible(false);

        this.idWaitLogin = -1;

        this.loadUserDefault();
        this.autoLogin();
        this.reloadButtonSocial();
    },

    autoLoginZalo: function() {
        return;
        this.delayWaitLogin();

        if(!this.checkNetwork()) return;
        SocialManager.getInstance()._currentSocial = SocialManager.ZALO;
        SocialManager.getInstance().set(this, this.onResponseSessionKey.bind(this));
        cc.log("AUTO LOGIN ZALO 2 ******************** ");
        if (!SocialManager.getInstance().getSessionCacheWithId(SocialManager.ZALO_CACHE))
        {
            this.loading = sceneMgr.addLoading(LocalizedString.to("_SINGING_"), true, this);
            SocialManager.getInstance().getSessionKeyZaloViaDevice();
//                cc.log("Can't Login Zalo with Cache");
  //              Toast.makeToast(1.0, localized("MAINTAIN_SERVICE"));
        }
        else {
            this.loading = sceneMgr.addLoading(LocalizedString.to("_SINGING_"), true, this);
            cc.sys.localStorage.setItem(LoginScene.AUTO_LOGIN_KEY, SocialManager.ZALO);
        }

    },

    autologinZingme : function (uname,pwd) {
        this.delayWaitLogin();

        if(!this.checkNetwork()) return;

        var name = "";
        var pass = "";

        if (cc.sys.localStorage.getItem(LoginScene.USERNAME_KEY) != null) {
            name = "" + cc.sys.localStorage.getItem(LoginScene.USERNAME_KEY);
        }
        if (cc.sys.localStorage.getItem(LoginScene.PASSWORD_KEY) != null) {
            pass = "" + cc.sys.localStorage.getItem(LoginScene.PASSWORD_KEY);
        }

        if(uname && pwd)
        {
            name = uname;
            pass = pwd;
        }

        if(name != "" && pass != "")
        {
            SocialManager.getInstance()._currentSocial = SocialManager.ZINGME;
            SocialManager.getInstance().set(this, this.onResponseSessionKey.bind(this));
            var nameSave = "" + cc.sys.localStorage.getItem(LoginScene.USERNAME_KEY);
            if(name.localeCompare(nameSave) != 0 || !SocialManager.getInstance().getSessionCacheWithId(SocialManager.ZINGME_CACHE))
            {
                cc.log("LOGIN ZINGME 1 ");
                SocialManager.getInstance().set(this, this.onResponseAccessToken.bind(this));
                SocialManager.getInstance().loginZingme(name, pass);
            }

            cc.log("LOGIN ZINGME 2 ");
            this.loading = sceneMgr.addLoading(LocalizedString.to("_SINGING_"), true, this);
            cc.sys.localStorage.setItem(LoginScene.AUTO_LOGIN_KEY, SocialManager.ZINGME);
        }
    },

    onResponseAccessToken: function (social, jdata) {
        if(!sceneMgr.checkMainLayer(LoginScene)) return;

        cc.log("ResponseToken : " + social + "/" + jdata);

        var obj = StringUtility.parseJSON(jdata);

        var error = parseInt(obj["error"]);

        if (error != 0) {
            switch (social) {
                case SocialManager.GOOGLE:
                case SocialManager.FACEBOOK:
                case SocialManager.ZALO:
                    Toast.makeToast(Toast.LONG, LocalizedString.to("_LOGIN_ERROR_"));

                    socialMgr.logout();

                    sceneMgr.clearLoading();
                    return;
            }
        }

        if (error == 0) {
            GameData.getInstance().socialLogined = social;

            switch (social) {
                case SocialManager.ZINGME:
                {
                    GameData.getInstance().access_token = obj["sessionKey"];

                    var tmpUS = cc.sys.localStorage.getItem(LoginScene.TMP_US_KEY);
                    var tmpPWD = cc.sys.localStorage.getItem(LoginScene.TMP_PWD_KEY);

                    if (tmpUS != null && tmpPWD != null && tmpUS != "" && tmpPWD != "") {
                        cc.sys.localStorage.setItem(LoginScene.TMP_US_KEY, "");
                        cc.sys.localStorage.setItem(LoginScene.TMP_PWD_KEY, "");

                        cc.sys.localStorage.setItem(LoginScene.USERNAME_KEY, tmpUS);
                        cc.sys.localStorage.setItem(LoginScene.PASSWORD_KEY, tmpPWD);
                    }
                    break;
                }
                case SocialManager.GOOGLE:
                case SocialManager.FACEBOOK:
                case SocialManager.ZALO:
                {
                    GameData.getInstance().access_token = obj["access_token"];

                    this.loading = sceneMgr.addLoading(LocalizedString.to("_SINGING_"), true);
                    this.loading.setTag(LOADING_TAG);
                    break;
                }
            }

            SocialManager.getInstance().set(this, this.onResponseSessionKey);
        }
        else{
            try{
                if (this.loading && this.loading.getParent())
                    this.loading.removeFromParent(true);
            }
            catch(e)
            {
                cc.log(e);
            }

            sceneMgr.clearLoading();

            switch(error) {
                case 1:
                case 3:
                case 4:
                case 5:
                    sceneMgr.showOKDialog(LocalizedString.to("_LOGIN_ERROR_" + error));
                    break;
                case 2:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                {
                    var str = localized("_LOGIN_ERROR_x");
                    str = StringUtility.replaceAll(str,"%error",error);
                    Toast.makeToast(Toast.LONG,str);
                    break;
                }
                case 20:
                {
                    var str = LocalizedString.to("_LOGIN_ERROR_20");
                    var dob = obj["dob"];
                    if (dob === undefined || dob == null) dob = "";
                    str = StringUtility.replaceAll(str, "%birth", dob);
                    sceneMgr.showOKDialog(str);
                    break;
                }
                default :
                    sceneMgr.showOKDialog(LocalizedString.to("_LOGIN_ERROR_"));
                    break;
            }
        }
    },

    onResponseSessionKey: function (social, jdata) {
        if(!sceneMgr.checkMainLayer(LoginScene)) return;

        cc.log("ResponseSession: " + social + "/" + jdata);

        var obj = {};
        try
        {
            obj = JSON.parse(jdata);
        }
        catch(e)
        {
            obj["error"] = 1;
        }

        if (obj["error"] == 0)
        {
            GameData.getInstance().socialLogined = social;
            GameData.getInstance().sessionkey = obj["sessionKey"];
            GameData.getInstance().openID = obj["openId"];

            GameClient.getInstance().connect();
        }
        else {
            try{
                if (this.loading && this.loading.getParent())
                    this.loading.removeFromParent(true);
            }
            catch(e)
            {
                cc.log(e);
            }

            sceneMgr.showOKDialog(LocalizedString.to("_LOGIN_ERROR_"));
        }
    },

    onBack: function () {
        if(sceneMgr.checkBackAvailable()) return;
        sceneMgr.showOkCancelDialog(LocalizedString.to("_ASKEXIT_"), this, function (btnID) {
            switch (btnID) {
                case 0:
                {
                    if (cc.sys.os == cc.sys.OS_IOS)
                        engine.HandlerManager.getInstance().exitIOS();
                    else
                        cc.director.end();
                }
            }
        });
    }
});

LoginScene.className = "LoginScene";

LoginScene.BTN_LOGIN = 1;
LoginScene.BTN_REGISTER = 2;
LoginScene.BTN_ZALO = 3;
LoginScene.BTN_FB = 4;
LoginScene.BTN_GG = 5;
LoginScene.BTN_ZM = 6;
LoginScene.BTN_QUIT = 7;

LoginScene.BTN_REGISTER_ZME = 10;
LoginScene.BTN_LOGIN_ZME = 11;
LoginScene.BTN_CLOSE_ZME = 12;

LoginScene.GUI_ZINGME = 200;

LoginScene.AUTO_LOGIN_KEY = "autologin";
LoginScene.MAPPED_ZALO = "mappedZalo";
LoginScene.USERNAME_KEY = "username";
LoginScene.PASSWORD_KEY = "password";
LoginScene.TMP_US_KEY = "tmp_username";
LoginScene.TMP_PWD_KEY = "tmp_password";

LoginScene.TF_UNAME = 1;
LoginScene.TF_PWD = 2;
LoginScene.TF_RPWD = 3;

LoginScene.TIME_DELAY_LOGIN = 100;
