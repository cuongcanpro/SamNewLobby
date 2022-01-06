
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
            if(CheatCenter.fakeLogin()) return;
        }

        var autologin = cc.sys.localStorage.getItem(LoginScene.AUTO_LOGIN_KEY);

        if ((autologin == "") || (autologin === undefined) || autologin == null) {
            autologin = cc.sys.localStorage.getItem("defaultlogin");
            autologin = 8;
        }

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

        cc.log("_______AUTO___LOGIN____" + autologin);

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

        // logo game
        this.icon = this.getControl("icon");
        this.icon.setVisible(false);
        this.icon.setPosition(size.width/2,size.height/2 - this.icon.getContentSize().height*0.125);

        this.logo = cc.Sprite.create("common/gametitle.png");
        this.logo.setScale(this._scale);
        this.logo.setLocalZOrder(99);
        //this.logo.setVisible(false);
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
        this.pLoading.setLocalZOrder(10);

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
        // if (!mappedZalo || mappedZalo == undefined) {
        //     mappedZalo = 0;
        // }
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
                    if (cc.sys.os != cc.sys.OS_ANDROID && cc.sys.os != cc.sys.IOS) {
                        // zingme aWQ9NTIyMjIxMDkwJnVzZXJuYW1lPWN1b25nbGVhaDExMDEmc29jaWFsPXppbmdtZSZzb2NpYWxuYW1lPWN1b25nbGVhaDExMDEmYXZhdGFyPWh0dHAlM0ElMkYlMkZ6aW5ncGxheS5zdGF0aWMuZzYuemluZy52biUyRmltYWdlcyUyRnpwcCUyRnpwZGVmYXVsdC5wbmcmdGltZT0xNTMxODk4NjUzJm90aGVyPWRlZmF1bHQlM0ElM0F6aW5nbWUlN0N1bmtub3duJTdDdW5rbm93biUzQSUzQTUyMjIyMTA5MCUzQSUzQTEwMCZ0b2tlbktleT1lM2FmYzE5ZjA4OGVhNGRmZDUxM2EyZDBhMTgyMjRhNw==
                        GameData.getInstance().sessionkey = "aWQ9Mzc0NDUxNzMmdXNlcm5hbWU9c2ltbzMyJnNvY2lhbD16aW5nbWUmc29jaWFsbmFtZT1zaW1vMzImYXZhdGFyPWh0dHAlM0ElMkYlMkZ6aW5ncGxheS5zdGF0aWMuZzYuemluZy52biUyRmltYWdlcyUyRnpwcCUyRnpwZGVmYXVsdC5wbmcmdGltZT0xNTI2NTQzMTYwJm90aGVyPWRpc190aWVubGVuJTNBJTNBZGVmYXVsdCUzQSUzQTM3NDQ1MTczJTNBJTNBOTk5JnRva2VuS2V5PTM3NTQ0ODM4NzdmNTNiMGMyZjBiNDFjNWQ1YTNiNDk4";
                        //  GameData.getInstance().sessionkey = "aWQ9Mzc0NDUxNzMmdXNlcm5hbWU9c2ltbzMyJnNvY2lhbD16aW5nbWUmc29jaWFsbmFtZT1zaW1vMzImYXZhdGFyPWh0dHAlM0ElMkYlMkZ6aW5ncGxheS5zdGF0aWMuZzYuemluZy52biUyRmltYWdlcyUyRnpwcCUyRnpwZGVmYXVsdC5wbmcmdGltZT0xNTI2NTQzMTYwJm90aGVyPWRpc190aWVubGVuJTNBJTNBZGVmYXVsdCUzQSUzQTM3NDQ1MTczJTNBJTNBOTk5JnRva2VuS2V5PTM3NTQ0ODM4NzdmNTNiMGMyZjBiNDFjNWQ1YTNiNDk4";
                        GameClient.getInstance().connect();
                    }
                    else {

                    }
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
        if(!this.checkInScene()) return;

        this.delayWaitLogin();

        if(!this.checkNetwork()) return;

        cc.sys.localStorage.setItem(LoginScene.AUTO_LOGIN_KEY, SocialManager.ZALO);

        SocialManager.getInstance().set(this, this.onResponseAccessToken.bind(this));
        SocialManager.getInstance().loginZalo();
    },
    
    loginGoogle : function () {
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

        // auto login face neu truoc do da luu lai session key
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
        cc.sys.localStorage.setItem(LoginScene.AUTO_LOGIN_KEY, SocialManager.FACEBOOK);
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
        return gui instanceof LoginScene;
    },
    
    showLoadingInformation : function (isLoaded) {
        this.pAccount.setVisible(false);
        this.pLoading.setVisible(true);
        this.pLogin.setVisible(false);
        this.sub.setVisible(false);
        this.title.setVisible(false);
        this.btnClose.setVisible(false);
        //this.logo.setVisible(true);
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
                    try{
                        if (this.loading && this.loading.getParent())
                            this.loading.removeFromParent(true);
                    }
                    catch(e)
                    {
                        cc.log(e);
                    }

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
LoginScene.KEY_SESSION_KEY = "zp_sessionKey";

LoginScene.KEY_DID = "key_DID";

var AccountInputUI = BaseLayer.extend({

    ctor: function () {
        // register
        this.xhr = null;                          // HTTP request control

        this._tfName = null;
        this._tfPassword = null;
        this._tfRePassword = null;
        this._tfCmnd = null;

        this.inputDay = 0;
        this.inputMon = 0;
        this.inputYear = 0;

        this.btnDay = null;
        this.btnMon = null;
        this.btnYear = null;
        this.btnCheck = null;
        this.btnAccept = null;

        this.pDay = null;
        this.pMon = null;
        this.pYear = null;

        this.rangeYearOld = 0;

        this._name = "";
        this._pass = "";
        this._repass = "";

        this.savePos = null;
        this.typeGui = AccountInputUI.REGISTER;

        this._super("AccountInputGUI");
        this.initWithBinaryFile("AccountInputGUI.json");
    },

    setParent : function (p) {
        this.loginScene = p;
    },

    initGUI: function () {
        this.setBackEnable(true);

        this.getControl("title");

        this.customButton("btnQuit",LoginScene.BTN_CLOSE_ZME);

        this.pRegister = this.getControl("pRegister");
        this.btnAccept = this.customButton("btnRegister", LoginScene.BTN_REGISTER_ZME, this.pRegister);

        var tfname = this.getControl("tfAcount", this.pRegister);
        tfname.setVisible(false);
        this._tfName = BaseLayer.createEditBox(tfname);
        this._tfName.setInputFlag(1);
        this._tfName.setTag(AccountInputUI.TF_USERNAME);
        this._tfName.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this._tfName.setDelegate(this);
        this.pRegister.addChild(this._tfName);

        var tfPassword = this.getControl("tfPass", this.pRegister);
        tfPassword.setVisible(false);
        this._tfPassword = BaseLayer.createEditBox(tfPassword);
        this._tfPassword.setTag(AccountInputUI.TF_PASSWORD);
        this._tfPassword.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        this._tfPassword.setDelegate(this);
        this.pRegister.addChild(this._tfPassword);

        var tfRePassword = this.getControl("tfRepass", this.pRegister);
        tfRePassword.setVisible(false);
        this._tfRePassword = BaseLayer.createEditBox(tfRePassword);
        this._tfRePassword.setTag(AccountInputUI.TF_REPASSWORD);
        this._tfRePassword.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        this._tfRePassword.setDelegate(this);
        this.pRegister.addChild(this._tfRePassword);

        this.btnDay = this.customButton("btnDay",AccountInputUI.BTN_DAY,this.pRegister);
        this.btnDay.lb = this.getControl("lb",this.btnDay);
        this.btnDay.setPressedActionEnabled(false);
        this.btnMon = this.customButton("btnMon",AccountInputUI.BTN_MON,this.pRegister);
        this.btnMon.lb = this.getControl("lb",this.btnMon);
        this.btnMon.setPressedActionEnabled(false);
        this.btnYear = this.customButton("btnYear",AccountInputUI.BTN_YEAR,this.pRegister);
        this.btnYear.lb = this.getControl("lb",this.btnYear);
        this.btnYear.setPressedActionEnabled(false);

        this.pMon = new PanelDropList(this,PanelDropList.TYPE_MON,this.btnMon);
        this.pMon.setPos(this.btnMon.getPosition());
        this.pMon.setVisible(false);
        this.pRegister.addChild(this.pMon);

        this.pYear = new PanelDropList(this,PanelDropList.TYPE_YEAR,this.btnYear);
        this.pYear.setPos(this.btnYear.getPosition());
        this.pYear.setVisible(false);
        this.pRegister.addChild(this.pYear);

        this.pDay = new PanelDropList(this,PanelDropList.TYPE_DAY,this.btnDay);
        this.pDay.setPos(this.btnDay.getPosition());
        this.pDay.setVisible(false);
        this.pRegister.addChild(this.pDay);

        this.adultPanel = this.getControl("adult",this.pRegister);

        var tfCMND = this.getControl("tfCmnd", this.adultPanel);
        tfCMND.setVisible(false);
        this._tfCmnd = BaseLayer.createEditBox(tfCMND);
        this._tfCmnd.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this._tfCmnd.setDelegate(this);
        this._tfCmnd.setTag(AccountInputUI.TF_CMND);
        this._tfCmnd.setMaxLength(12);
        this.adultPanel.addChild(this._tfCmnd);

        this.btnCheck = this.customButton("btnCheck",AccountInputUI.BTN_CHECK,this.adultPanel);
        this.btnCheck.img = this.getControl("tick",this.adultPanel);
        this.btnCheck.img.setVisible(false);
    },

    editBoxEditingDidBegin: function(editBox) {
        //if (editBox.getTag() == AccountInputUI.TF_USERNAME) {
        if (editBox.getTag() == AccountInputUI.TF_USERNAME) {
            Toast.makeToast(Toast.LONG, LocalizedString.to("_LENGTHUSER_"));
        }
        else if (editBox.getTag() == AccountInputUI.TF_PASSWORD) {
            Toast.makeToast(Toast.LONG, LocalizedString.to("REMEMBER_PASSWORD"));
        }
    },

    editBoxReturn : function (editBox) {
        var tag = parseInt(editBox.getTag());
        if(isNaN(tag)) return;

        switch (tag)
        {
            case AccountInputUI.TF_CMND:
            {
                if(!this.checkIdCardValid(this._tfCmnd.getString()))
                {
                    Toast.makeToast(Toast.SHORT,LocalizedString.to("_INPUT_CMND_INVALID_"));
                }
                break;
            }
            case AccountInputUI.TF_USERNAME:
            {

                break;
            }
            case AccountInputUI.TF_PASSWORD:
            {

                break;
            }
            case AccountInputUI.TF_REPASSWORD:
            {
                var repass = this._tfRePassword.getString();
                var pass = this._tfPassword.getString();
                if(repass != pass)
                {
                    Toast.makeToast(Toast.LONG, LocalizedString.to("_CHECKPASSWORD_"));
                }
                break;
            }
        }
    },
    
    onEnterFinish : function () {
        if(this.savePos == null)
            this.savePos = this.getPosition();
        else
            this.setPosition(this.savePos);

        this._tfName.setString("");
        this._tfPassword.setString("");
        this._tfRePassword.setString("");

        var time = new Date();
        this.btnDay.lb.setString("--");
        this.btnMon.lb.setString("--");
        this.btnYear.lb.setString("----");

        this.inputDay = 0;
        this.inputMon = 0;
        this.inputYear = 0;

        this.adultPanel.setVisible(false);

        this.setPositionY(this.savePos.y - 500);
        this.runAction(cc.moveTo(0.15,this.savePos));
        this.autoSelectDate();
    },

    setTypeGui: function(type) {
        this.typeGui = type;
    },

    onResponseAccessToken: function (social, jdata) {
       // if(!sceneMgr.checkMainLayer(AccountInputUI)) return;

        cc.log("ResponseToken : " + social + "/" + jdata);

        var obj = StringUtility.parseJSON(jdata);

        var error = parseInt(obj["error"]);

        if (error == 0) {
          //  GameData.getInstance().access_token = obj["sessionKey"];
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
                    //sceneMgr.showOKDialog(LocalizedString.to("_LOGIN_ERROR_" + error));
                    SceneMgr.getInstance().showOkDialogWithAction(localized("_LOGIN_ERROR_" + error), this, this.getSessionKeyMap.bind(this));
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
                   // sceneMgr.showOKDialog(str);
                    SceneMgr.getInstance().showOkDialogWithAction(str, this, this.getSessionKeyMap.bind(this));
                    break;
                }
                default :
                   // sceneMgr.showOKDialog(LocalizedString.to("_LOGIN_ERROR_"));
                    SceneMgr.getInstance().showOkDialogWithAction(localized("_LOGIN_ERROR_"), this, this.getSessionKeyMap.bind(this));
                    break;
            }
        }
    },

    onResponseSessionKey: function (social, jdata) {
       // if(!sceneMgr.checkMainLayer(AccountInputUI)) return;

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
            //GameData.getInstance().socialLogined = social;
            //GameData.getInstance().sessionkey = obj["sessionKey"];
            //GameData.getInstance().openID = obj["openId"];
            //
            //GameClient.getInstance().connect();

            // Gui goi tin mapping len Server Socket
            var pk = new CmdSendMapZalo();
            GameData.getInstance().sessionkey = obj["sessionKey"];
            GameData.getInstance().openID = obj["openId"];
            pk.putData(obj["sessionKey"]);
            GameClient.getInstance().sendPacket(pk);
            pk.clean();
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

           // sceneMgr.showOKDialog(LocalizedString.to("_LOGIN_ERROR_"));
            SceneMgr.getInstance().showOkDialogWithAction(localized("_LOGIN_ERROR_"), this, this.getSessionKeyMap.bind(this));
        }
    },

    autoSelectDate : function () {
        this.select(PanelDropList.TYPE_DAY,{name : "1" , value : 1});
        this.select(PanelDropList.TYPE_MON,{name : PanelDropList.getMonthString(1) , value : 1});
        this.select(PanelDropList.TYPE_YEAR,{name : "1990" , value : 1990});
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case LoginScene.BTN_CLOSE_ZME:
            {
                this.onBack();
                break;
            }
            case LoginScene.BTN_REGISTER_ZME:
            {
                this._name = this._tfName.getString();
                this._pass = this._tfPassword.getString();
                this._repass = this._tfRePassword.getString();

                if (this._name == "" || this._pass == "" || this._repass == "") {
                    Toast.makeToast(Toast.LONG, LocalizedString.to("_CHECKREGISTER_"));
                }
                else if (this._name.length < 6 || this._name.length > 24)
                {
                    Toast.makeToast(Toast.LONG, LocalizedString.to("_LENGTHUSER_"));
                }
                else if (this._pass.length < 6 || this._pass.length > 35)
                {
                    Toast.makeToast(Toast.LONG, LocalizedString.to("_LENGTHPASS_"));
                }
                else if (this._pass != this._repass) {
                    Toast.makeToast(Toast.LONG, LocalizedString.to("_CHECKPASSWORD_"));
                }
                else {
                    if(this.inputDay == 0 || this.inputMon == 0 || this.inputYear == 0)
                    {
                        Toast.makeToast(Toast.LONG, LocalizedString.to("_INPUT_BIRTHDAY_"));
                    }
                    else
                    {
                        var isOk = false;

                        if(this.rangeYearOld == 0)
                        {
                            isOk = true;
                        }
                        else if(this.rangeYearOld == 1)
                        {
                            var cmnd = this._tfCmnd.getString().trim();

                            if(this.checkIdCardValid(cmnd))
                            {
                                isOk = true;
                            }
                            else
                            {
                                Toast.makeToast(Toast.SHORT,LocalizedString.to("_INPUT_CMND_INVALID_"));
                            }
                        }
                        else
                        {
                            var cmnd = this._tfCmnd.getString().trim();
                            var check = this.btnCheck.img.isVisible();
                            if(!this.checkIdCardValid(cmnd))
                            {
                                Toast.makeToast(Toast.LONG, LocalizedString.to("_INPUT_CMND_INVALID_"));
                            }
                            else if(!check)
                            {
                                Toast.makeToast(Toast.LONG, LocalizedString.to("_CHECK_ADULT_"));
                            }
                            else
                            {
                                isOk = true;
                            }
                        }

                        if(isOk)
                        {
                            sceneMgr.addLoading(LocalizedString.to("_REGISTERING_"));

                            var data = "username=" + this._name.toLowerCase();
                            data += "&password=" + md5(this._pass);
                            data += "&gameid=" + LocalizedString.config("GAME");
                            data += "&dob=" + this.getFullBirthday();
                            var mac = md5(LocalizedString.config("GAME") + this._name.toLowerCase() + md5(this._pass) + Config.SECRETKEY);
                            data += "&mac=" + mac;
                            data += "&v=" + 2;
                            var url = Constant.ZINGME_REGISTER_URL + "?" + data;
                            cc.log("URL " + url);
                            this.xhr = LoginHelper.registerRequest(url, 10000, null, this.onResponseRegister.bind(this), this.errorHttp.bind(this));

                            engine.HandlerManager.getInstance().addHandler("register_zingme", this.onTimeOutRegister.bind(this));
                            engine.HandlerManager.getInstance().getHandler("register_zingme").setTimeOut(10, true);
                        }
                    }
                }
                break;
            }
            case AccountInputUI.BTN_DAY:
            {
                this.pMon.setVisible(false);
                this.pYear.setVisible(false);
                this.pDay.setVisible(!this.pDay.isVisible());

                this.visibleDropList(this.pDay.isVisible());
                break;
            }
            case AccountInputUI.BTN_MON:
            {
                this.pDay.setVisible(false);
                this.pYear.setVisible(false);
                this.pMon.setVisible(!this.pMon.isVisible());

                this.visibleDropList(this.pMon.isVisible());
                break;
            }
            case AccountInputUI.BTN_YEAR:
            {
                this.pDay.setVisible(false);
                this.pMon.setVisible(false);
                this.pYear.setVisible(!this.pYear.isVisible());

                this.visibleDropList(this.pYear.isVisible());
                break;
            }
            case AccountInputUI.BTN_CHECK:
            {
                this.btnCheck.img.setVisible(!this.btnCheck.img.isVisible());
                break;
            }
        }
    },

    visibleDropList : function (visible) {
        this.btnCheck.setTouchEnabled(!visible);
        this._tfCmnd.setTouchEnabled(!visible);
        this._tfName.setTouchEnabled(!visible);
        this._tfPassword.setTouchEnabled(!visible);
        this._tfRePassword.setTouchEnabled(!visible);
        this.btnAccept.setTouchEnabled(!visible);
    },
    
    calculateRangeYearOld : function () {
        var time = new Date();
        var curYear = parseInt(time.getFullYear());
        var curMonth = parseInt(time.getMonth() + 1);
        var curDay = parseInt(time.getDate());

        var oldYear = parseInt(this.inputYear); if(isNaN(oldYear)) oldYear = curYear - AccountInputUI.RANGE_ADULT_0;
        var oldMon = parseInt(this.inputMon); if(isNaN(oldMon)) oldMon = curYear;
        var oldDay = parseInt(this.inputDay); if(isNaN(oldDay)) oldDay = curYear;

        if(this.checkOverYearOld(curDay,curMonth,curYear,oldDay,oldMon,oldYear,AccountInputUI.RANGE_ADULT_0))
        {
            this.rangeYearOld = 0;

            this.adultPanel.setVisible(false);
        }
        else if (this.checkOverYearOld(curDay,curMonth,curYear,oldDay,oldMon,oldYear,AccountInputUI.RANGE_ADULT_1))
        {
            if(this.rangeYearOld != 1)
            {
                Toast.makeToast(Toast.SHORT,LocalizedString.to("_ADULT_IDCARD_"));
            }
            this.rangeYearOld = 1;

            this.btnCheck.setVisible(false);
            this.adultPanel.setVisible(true);
        }
        else
        {
            if(this.rangeYearOld != 2)
            {
                Toast.makeToast(Toast.SHORT,LocalizedString.to("_ADULT_PROTECT_"));
            }
            this.rangeYearOld = 2;

            this.btnCheck.setVisible(true);
            this.adultPanel.setVisible(true);
        }
    },

    checkOverYearOld : function (d1, m1, y1, d, m, y, range) {

        var deltaY = y1 - y;

        if(deltaY > range)
        {
            return true;
        }
        else if(deltaY < range)
        {
            return false;
        }
        else
        {
            if(m1 < m) return false;
            else if(m1 > m) return true;
            else return (d<=d1);
        }
    },

    checkIdCardValid : function (id) {
        if(id === undefined || id == null) id = "";
        id = id.trim();

        return id.length == 9 || id.length == 12;
    },

    select : function (type, info) {
        switch (type)
        {
            case PanelDropList.TYPE_DAY:
            {
                this.btnDay.lb.setString(info.name);
                this.inputDay = info.value;
                break;
            }
            case PanelDropList.TYPE_MON:
            {
                this.btnMon.lb.setString(info.name);
                this.inputMon = info.value;
                break;
            }
            case PanelDropList.TYPE_YEAR:
            {
                this.btnYear.lb.setString(info.name);
                this.inputYear = info.value;
                break;
            }
        }

        this.calculateRangeYearOld();

        this.pDay.setVisible(false);
        this.pMon.setVisible(false);
        this.pYear.setVisible(false);

        this.pDay.updateDay(this.inputMon,this.inputYear);

        if(this.inputDay > PanelDropList.calculateDayOfMonth(this.inputMon,this.inputYear))
        {
            this.inputDay = 1;
            this.btnDay.lb.setString(this.inputDay);
        }

        this.visibleDropList(false);
    },
    
    getFullBirthday : function () {
        var str = "dd-mm-yyyy";
        str = StringUtility.replaceAll(str,"dd",this.inputDay);
        str = StringUtility.replaceAll(str,"mm",this.inputMon);
        str = StringUtility.replaceAll(str,"yyyy",this.inputYear);
        return str;
    },

    errorHttp: function () {
        engine.HandlerManager.getInstance().forceRemoveHandler("register_zingme");
        this.onResponseRegister("{\"error\": -11}");
    },

    getSessionKeyMap: function() {
        SocialManager.getInstance().set(this, this.onResponseAccessToken.bind(this));
        SocialManager.getInstance().loginZingmeForMapping(this._name, this._pass);
        this.loading = sceneMgr.addLoading(LocalizedString.to("_SINGING_"), true, this);
    },

    onResponseRegister: function (data) {
        sceneMgr.clearLoading();
        if (data) {
            cc.log("ResponseRegister_Fix : " + data);
            var obj = StringUtility.parseJSON(data);

            if (obj["error"] == -11) {
                Toast.makeToast(Toast.LONG, localized("_REGISTERFAIL_"));
            }
            else if (obj["error"] == -10) {
                Toast.makeToast(Toast.LONG, localized("_REGISTERFAIL_"));
            }
        } else {
            cc.log("ResponseRegister_Services : " + this.xhr.responseText);
            var obj = StringUtility.parseJSON(this.xhr.responseText);

            engine.HandlerManager.getInstance().forceRemoveHandler("register_zingme");
            var error = parseInt(obj["error"]);
            switch (error) {
                case 0:
                {
                    if (this.typeGui == AccountInputUI.REGISTER) {
                        cc.sys.localStorage.setItem(LoginScene.USERNAME_KEY, this._name);
                        cc.sys.localStorage.setItem(LoginScene.PASSWORD_KEY, this._pass);
                        this.loginScene.loadUserDefault();

                        this.moveToLogin = function (id) {
                            if (id == Dialog.BTN_OK) {
                                this.onBack();
                            }
                        };
                        SceneMgr.getInstance().showOkDialogWithAction(localized("_REGISTERSUCESSFUL_"), this, this.moveToLogin.bind(this));
                    }
                    else {
                        // thuc hien viec map data zalo sang Zingme, gui len de lay accessToken
                      //  SocialManager.getInstance().set(this, this.onResponseSessionKey.bind(this));
                        this.getSessionKeyMap();
                    }
                    break;
                }
                case 5:
                case -5:
                case 6:
                {
                    Toast.makeToast(Toast.LONG, localized("_REGISTER_ERROR_" + error));
                    break;
                }
                case 2:
                case 7:
                {
                    var str = localized("_LENGTHUSER_");
                    Toast.makeToast(Toast.LONG,str);
                    break;
                }
                case 3:
                case 4:
                case 8:
                case 9:
                {
                    var str = localized("_REGISTER_ERROR_x");
                    str = StringUtility.replaceAll(str,"%error",error);
                    Toast.makeToast(Toast.LONG,str);
                    break;
                }
                default :
                {
                    Toast.makeToast(Toast.LONG, localized("_REGISTER_ERROR_"));
                    break;
                }
            }
        }
    },

    onTimeOutRegister: function () {
        this.xhr.abort();
        this.onResponseRegister("{\"error\": -10}");
    },

    onBack: function () {
        var savePos = this.getPosition();
        savePos.y -= 500;
        this.runAction(cc.sequence(cc.moveTo(0.15,savePos),cc.removeSelf()));
    }
});

AccountInputUI.className = "AccountInputUI";

AccountInputUI.BTN_DAY = 20;
AccountInputUI.BTN_MON = 21;
AccountInputUI.BTN_YEAR = 22;
AccountInputUI.BTN_CHECK = 23;

AccountInputUI.TF_USERNAME = 1;
AccountInputUI.TF_PASSWORD = 2;
AccountInputUI.TF_REPASSWORD = 3;
AccountInputUI.TF_CMND = 4;

AccountInputUI.RANGE_ADULT_0 = 18;
AccountInputUI.RANGE_ADULT_1 = 14;

AccountInputUI.REGISTER = 0;
AccountInputUI.MAP_ACCOUNT = 1;

var ItemDropList = cc.TableViewCell.extend({

    ctor: function (size) {
        this._super();
        this.info = null;

        this.bg = cc.Scale9Sprite.create("LoginGUI/bgDropItem.png");
        var sX = size.width/this.bg.getContentSize().width;
        this.bg.setScaleX(sX);
        this.bg.setScaleY(0.98);

        this.lb = BaseLayer.createLabelText();
        this.lb.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.lb.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this.bg.setVisible(true);
        this.addChild(this.bg);
        this.addChild(this.lb);

        this.bg.setPosition(this.bg.getContentSize().width*sX/2,this.bg.getContentSize().height/2);
        this.lb.setPosition(this.bg.getPosition());//X() - this.lb.getContentSize().width/2,this.bg.getPositionY() - this.lb.getContentSize().height/2);
    },
    
    setInfo : function (info) {
        this.info = info;
        this.lb.setString(info.name);
    },

    getInfo : function () {
        return this.info;
    }

});

var PanelDropList = cc.Node.extend({
        
    ctor : function (parent,type,btn) {
        this._super();

        this.panel = parent;
        this.dropType = type;
        this.itemData = [];
        this.itemSize = btn.getContentSize();

        switch (this.dropType)
        {
            case PanelDropList.TYPE_DAY:
            {
                this.itemData = PanelDropList.createDay();
                break;
            }
            case PanelDropList.TYPE_MON:
            {
                this.itemData = PanelDropList.createMonth();
                break;
            }
            case PanelDropList.TYPE_YEAR:
            {
                this.itemData = PanelDropList.createYear();
                break;
            }
        }

        this.pList = new cc.TableView(this, cc.size(this.itemSize.width,this.itemSize.height*5));
        this.pList.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.pList.setDelegate(this);
        this.pList.reloadData();
        this.addChild(this.pList);
    },

    setPos : function (pos) {
        this.setPositionX(pos.x - this.itemSize.width/2);
        this.setPositionY(pos.y - this.itemSize.height*5*1.05);
    },

    updateDay : function (mm,yyyy) {
        if(this.dropType != PanelDropList.TYPE_DAY) return;
        if(mm === undefined || yyyy === undefined || mm*yyyy == 0) return;
        var day = PanelDropList.calculateDayOfMonth(mm,yyyy);
        this.itemData = PanelDropList.createDay(day);
        this.pList.reloadData();
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ItemDropList(this.itemSize);
        }
        cell.setInfo(this.itemData[idx]);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return this.itemSize;
    },

    numberOfCellsInTableView: function (table) {
        return this.itemData.length;
    },

    tableCellTouched: function (table, cell) {
        this.panel.select(this.dropType,cell.getInfo());
    }
});

PanelDropList.createDay = function (day) {
    if(day === undefined) day = 31;

    var ar = [];
    for(var i = day ; i >= 1 ;i--)
    {
        ar.push({name:i,value:i});
    }
    return ar;
};

PanelDropList.createMonth = function () {
    var ar = [];
    for(var i = 12 ; i >= 1 ;i--)
    {
        ar.push({name:PanelDropList.getMonthString(i),value:i});
    }
    return ar;
};

PanelDropList.createYear = function () {
    var ar = [];

    var curYear = parseInt(new Date().getFullYear());

    for(var i = curYear - 100 ; i < curYear - 2 ;i++)
    {
        ar.push({name:i,value:i});
    }
    return ar;
};

PanelDropList.getMonthString = function (m) {
    var str = LocalizedString.to("REGISTER_MONTH_FIELD");
    return StringUtility.replaceAll(str,"%m",m);
};

PanelDropList.calculateDayOfMonth = function (mm,yyyy) {
    if(mm === undefined || yyyy === undefined) return 31;
    if(mm == 0) yyyy = 1;
    if(yyyy == 0) yyyy = 1900;

    return new Date(yyyy, mm, 0).getDate();
};

PanelDropList.TYPE_DAY = 1;
PanelDropList.TYPE_MON = 2;
PanelDropList.TYPE_YEAR = 3;
