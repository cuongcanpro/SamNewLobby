/**
 * Created by hoangnq on 8/6/15.
 */

var SocialManager = cc.Class.extend({

    ctor: function () {

        this._target = null;
        this._selector = null;

        this._currentSocial = 0;

        this.topServer = null;

        // ZALO OauthCode
        this.zaloOauthCODE = "";
    },

    set: function (target, selector) {
        // cc.log("--setCallback " + JSON.stringify(arguments));

        this._target = target;
        this._selector = selector;
    },

    loginZingme: function (username, password) {
        this._currentSocial = SocialManager.ZINGME;

        var data = "username=" + username.toLowerCase();
        data += "&password=" + md5(password);
        data += "&gameid=" + LocalizedString.config("GAME");
        cc.log("DATA********** " + LocalizedString.config("GAME") + " " +  username.toLowerCase() + " " + md5(password) + " " + Config.SECRETKEY);
        var mac = md5(LocalizedString.config("GAME") + username.toLowerCase() + md5(password) + Config.SECRETKEY);
        //mac = "b05f3360643b619e980b8b4078f7867e";
        data += "&mac=" + mac;
        data += "&v=" + 2;
        cc.log("#Login::" + Constant.ZINGME_SERVICE_URL + data);
        this.xhrLoginZingme = LoginHelper.getRequest(Constant.ZINGME_SERVICE_URL, data, 10000, this.onTimeOut.bind(this), this.onResponseAcessTokenZingMe.bind(this), this.errorHttp.bind(this));

        engine.HandlerManager.getInstance().addHandler("login_zingme", this.onTimeoutAcessTokenZingMe.bind(this));
        engine.HandlerManager.getInstance().getHandler("login_zingme").setTimeOut(10, true);
    },

    loginZingmeForMapping: function (username, password) {
        //  this._currentSocial = SocialManager.ZINGME;
        var data = "username=" + username.toLowerCase();
        data += "&password=" + md5(password);
        data += "&gameid=" + LocalizedString.config("GAME");
        var mac = md5(LocalizedString.config("GAME") + username.toLowerCase() + md5(password) + Config.SECRETKEY);
        data += "&mac=" + mac;
        data += "&v=" + 2;
        this.xhr = LoginHelper.getRequest(Constant.ZINGME_SERVICE_URL, data, 10000, this.onTimeOut.bind(this), this.onResponseAcessTokenZingMeForMapping.bind(this), this.errorHttp.bind(this));

        engine.HandlerManager.getInstance().addHandler("login_zingme", this.onTimeoutAcessTokenZingMeMapping.bind(this));
        engine.HandlerManager.getInstance().getHandler("login_zingme").setTimeOut(10, true);
    },

    errorHttp: function () {
        engine.HandlerManager.getInstance().forceRemoveHandler("login_zingme");
        engine.HandlerManager.getInstance().forceRemoveHandler("getSessionKey");

        if (this._selector && this._target)
            this._selector.call(this._target, this._currentSocial, "{\"error\": -1}");
    },

    logout: function () {
        if (portalMgr.isPortal()) return;

        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("FacebookUtils", "logout");
            jsb.reflection.callStaticMethod("ZaloUtils", "logout");
        }
        else if (cc.sys.os == cc.sys.OS_ANDROID) {
            if (gameMgr.checkOldNativeVersion()) {
                jsb.reflection.callStaticMethod("gsn/zingplay/utils/social/FacebookUtils", "logout", "()V");
                jsb.reflection.callStaticMethod("gsn/zingplay/utils/social/ZaloUtils", "unauthenticate", "()V");
            }
            else {
                fr.google.logout();
                fr.facebook.logout();
            }
        }

    },

    getSessionKey: function (social, accesstoken) {
        var strLog = "###SocialManager::getSessionKey";
        // if (social == SocialManager.ZALO && this.getSessionCacheZalo())
        // return;

        //if(social != SocialManager.ZALO && this.getSessionCache()) return;
        // Toast.makeToast(1.0, "GET NEW ACCESSTOKEN thanh cong");
        var s = this.getStringCacheFromId(social);
        if(this.getSessionCacheWithId(s))
            return;

        strLog += " -process social-";
        var _social = "";
        this._currentSocial = social;
        switch (social) {
            case SocialManager.GOOGLE:
                _social = "google";
                break;
            case SocialManager.ZINGME:
                _social = "zingme";
                break;
            case SocialManager.FACEBOOK:
                _social = "facebook";
                break;
            case SocialManager.ZALO:
                _social = "zalo";
                break;
        }

        strLog += "(" + _social + ")";
        engine.HandlerManager.getInstance().addHandler("getSessionKey", this.onTimeOutSessionKey.bind(this));
        engine.HandlerManager.getInstance().getHandler("getSessionKey").setTimeOut(10, true);

        var data = "service_name=getSessionKey&clientInfo=" + _social + gameMgr.source + "&gameId=" + LocalizedString.config("GAME") + "&social=" + _social + "&accessToken=" + accesstoken;
        cc.log("###Done " + strLog + "/" + data);
        this.xhr = LoginHelper.getRequest(Constant.PORTAL_SERVICE_URL, data, 10000, this.onTimeOutSessionKey.bind(this), this.onResponseSessionkey.bind(this), this.errorHttp.bind(this));

    },

    getSessionKeyForMapping: function (social, accesstoken) {
        var strLog = "###SocialManager::getSessionKeyForMapping";
        strLog += " -process social-";
        var _social = "zingme";
        strLog += "(" + _social + ")";
        engine.HandlerManager.getInstance().addHandler("getSessionKey", this.onTimeOutSessionKey.bind(this));
        engine.HandlerManager.getInstance().getHandler("getSessionKey").setTimeOut(10, true);

        var data = "service_name=getSessionKey&clientInfo=" + _social + gameMgr.source + "&gameId=" + LocalizedString.config("GAME") + "&social=" + _social + "&accessToken=" + accesstoken;
        this.xhr = LoginHelper.getRequest(Constant.PORTAL_SERVICE_URL, data, 10000, this.onTimeOutSessionKey.bind(this), this.onResponseSessionkey.bind(this), this.errorHttp.bind(this));
        cc.log("###Done " + strLog + "/" + data);
    },

    loginGoogle: function () {
        this._currentSocial = SocialManager.GOOGLE;

        this.callbackGG = function (jdata) {
            cc.log("###SocialManager::ResonseGoogleToken :" + jdata);

            if (this._selector && this._target)
                this._selector.call(this._target, this._currentSocial, jdata);
            var obj = StringUtility.parseJSON(jdata);
            if (obj["error"] == 0) {
                var token = obj["token"];
                this.getSessionKey(SocialManager.GOOGLE, token);
            }
        };
        engine.HandlerManager.getInstance().addHandler("login_google", this.callbackGG.bind(this));
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("GoogleUtils", "login");
        }
        else if (cc.sys.os === cc.sys.OS_ANDROID && gameMgr.checkOldNativeVersion()) {
            jsb.reflection.callStaticMethod("gsn/zingplay/utils/social/GoogleUtils", "getAccessToken", "()V");
        }
    },

    loginFacebook: function () {
        this._currentSocial = SocialManager.FACEBOOK;
        this.callbackFB = function (jdata) {
            cc.log("###SocialManager::ResonseFacebookToken :" + jdata);

            if (this._selector && this._target)
                this._selector.call(this._target, this._currentSocial, jdata);
            var obj = StringUtility.parseJSON(jdata);
            if (obj["error"] == 0) {
                var token = obj["access_token"];
                this.getSessionKey(SocialManager.FACEBOOK, token);
            }
            else {
                //sceneMgr.clearLoading();
            }
        };
        engine.HandlerManager.getInstance().addHandler("login_facebook", this.callbackFB.bind(this));
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("FacebookUtils", "login");
        }
        else if (cc.sys.os === cc.sys.OS_ANDROID && gameMgr.checkOldNativeVersion()) {
            jsb.reflection.callStaticMethod("gsn/zingplay/utils/social/FacebookUtils", "getAccessToken", "()V");
        }
    },

    loginZalo: function () {
        this._currentSocial = SocialManager.ZALO;
        Toast.makeToast(1.0, "GET NEW ACCESSTOKEN ");
        this.callbackZalo = function (jdata) {
            cc.log("###SocialManager::ResonseZaloToken :" + jdata);
            if (this._selector && this._target)
                this._selector.call(this._target, this._currentSocial, jdata);
            var obj = JSON.parse(jdata);
            if (obj["error"] == 0) {
                var token = obj["access_token"];
                this.getSessionKey(SocialManager.ZALO, token);
            }
        };
        engine.HandlerManager.getInstance().addHandler("login_zalo", this.callbackZalo.bind(this));
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("ZaloUtils", "login");
        }
        else if (cc.sys.os === cc.sys.OS_ANDROID && gameMgr.checkOldNativeVersion()) {
            jsb.reflection.callStaticMethod("gsn/zingplay/utils/social/ZaloUtils", "authenticate", "()V");
        }
    },

    /* zing accesstoken -- handle response*/
    onTimeOut: function () {
        cc.log("###SocialManager::onTimeOutZingMe");
    },

    onTimeoutAcessTokenZingMe: function () {
        cc.log("###SocialManager::onTimeoutAccessTokenZingMe");
        this.xhrLoginZingme.abort();
        if (this._selector && this._target)
            this._selector.call(this._target, SocialManager.ZINGME, "{\"error\": -1}");
    },

    onResponseAcessTokenZingMe: function () {
        cc.log("###SocialManager::onResponseAccessTokenZingMe");
        if(!cc.sys.isNative && (!this.xhrLoginZingme || (this.xhrLoginZingme.readyState !== XMLHttpRequest.DONE)))
            return;
        engine.HandlerManager.getInstance().forceRemoveHandler("login_zingme");
        if (this._selector && this._target)
            this._selector.call(this._target, SocialManager.ZINGME, this.xhrLoginZingme.responseText);
        var obj = StringUtility.parseJSON(this.xhrLoginZingme.responseText);
        if (obj["error"] == 0) {
            this.getSessionKey(SocialManager.ZINGME, obj["sessionKey"]);
        }
    },

    onTimeoutAcessTokenZingMeMapping: function () {
        cc.log("###SocialManager::onTimeoutAccessTokenZingMe");
        this.xhr.abort();
        if (this._selector && this._target)
            this._selector.call(this._target, SocialManager.ZINGME, "{\"error\": -1}");
    },

    onResponseAcessTokenZingMeForMapping: function () {
        cc.log("###SocialManager::onResponseAcessTokenZingMeForMapping");

        engine.HandlerManager.getInstance().forceRemoveHandler("login_zingme");
        if (this._selector && this._target)
            this._selector.call(this._target, SocialManager.ZINGME, this.xhr.responseText);
        var obj = StringUtility.parseJSON(this.xhr.responseText);
        if (obj["error"] == 0) {
            this.getSessionKeyForMapping(SocialManager.ZINGME, obj["sessionKey"]);
        }
    },

    saveSession: function (session, social, openID, typesocial) {
        cc.log("###SocialManager::SaveSession");
        var s = this.getStringCacheFromId(typesocial);
        this.saveSessionWithId(session, social, openID, typesocial, s);
    },

    saveSessionWithId: function (session, social, openID, typesocial, stringId) {
        cc.sys.localStorage.setItem("social" + stringId, social);
        if (typesocial == SocialManager.ZALO) {
            var oldSession = cc.sys.localStorage.getItem("session" + stringId);
            if (oldSession && oldSession != "") {
                // khong ghi de gia tri key zalo cu
                cc.log("KHONG SAVE LAI GIA TRI ZALO ");
            }
            else {
                cc.sys.localStorage.setItem("session" + stringId, session);
            }
        }
        else {
            cc.sys.localStorage.setItem("session" + stringId, session);
        }
        cc.sys.localStorage.setItem("openID" + stringId, openID);
        cc.sys.localStorage.setItem("typesocial" + stringId, typesocial);
    },

    clearSession: function () {
        cc.log("###SocialManager::cleasSession");
        this.clearSessionWithId("");
        this.clearSessionWithId(SocialManager.FACEBOOK_CACHE);
        this.clearSessionWithId(SocialManager.ZINGME_CACHE);
        this.clearSessionWithId(SocialManager.GOOGLE_CACHE);

        this.logout();
    },

    clearSessionWithId: function (stringId) {
        cc.sys.localStorage.setItem("social" + stringId, "");
        cc.sys.localStorage.setItem("session" + stringId, "");
        cc.sys.localStorage.setItem("openID" + stringId, "");
        cc.sys.localStorage.setItem("typesocial" + stringId, -1);
    },

    getStringCacheFromId: function(social) {
        var s = "";
        if (social == SocialManager.FACEBOOK)
            s = SocialManager.FACEBOOK_CACHE;
        else if (social == SocialManager.ZALO)
            s = SocialManager.ZALO_CACHE;
        else if (social == SocialManager.ZINGME)
            s = SocialManager.ZINGME_CACHE;
        else if (social == SocialManager.GOOGLE)
            s = SocialManager.GOOGLE_CACHE;
        return s;
    },

    getSessionCacheWithId : function (stringId) {
        //    if (stringId.localeCompare(SocialManager.FACE))
        // lay session tu cache, dau tien lay Session da luu tu cac ban game truoc, luc nay chua co dinh danh Face hay Zalo....
        cc.log("AUTO LOGIN ZALO 3 ******************** " + stringId);
        if (this.sessionExistWithId("")) {
            var session = cc.sys.localStorage.getItem("session");
            var openID = cc.sys.localStorage.getItem("openID");
            var typesocial = cc.sys.localStorage.getItem("typesocial");
            if (typesocial == SocialManager.ZALO) {
                cc.log("SESSION KEY ZALO " + session);
                cc.sys.localStorage.setItem("saveSessionKeyZalo", session);
            }
            if (typesocial == this._currentSocial) {
                var obj = {};
                obj["error"] = 0;
                obj["sessionKey"] = session;
                obj["openId"] = openID;
                cc.log("###GetSessionKey From Cache ");
                this.onResponseSessionkey(JSON.stringify(obj));
                return true;
            }
        }

        cc.log("chi chay duoc den day");
        // neu nhu khong co cac session kieu chua co dinh danh kia, moi di lay cac session luu co dinh danh Facebook, Zalo
        if (this.sessionExistWithId(stringId)) {
            var session = cc.sys.localStorage.getItem("session" + stringId);
            var openID = cc.sys.localStorage.getItem("openID" + stringId);
            var typesocial = cc.sys.localStorage.getItem("typesocial" + stringId);
            if (typesocial == SocialManager.ZALO) {
                cc.log("SESSION KEY ZALO " + session);
                cc.sys.localStorage.setItem("saveSessionKeyZalo", session);
            }
            cc.log("sessionExistWithId: ", session, openID, typesocial, this._currentSocial);
            if (typesocial == this._currentSocial) {
                var obj = {};
                obj["error"] = 0;
                obj["sessionKey"] = session;
                obj["openId"] = openID;
                cc.log("###GetSessionKey From Cache ");
                this.onResponseSessionkey(JSON.stringify(obj));
                return true;
            }
        }
        return false;
    },

    getSession: function (session, social, openID, typesocial) {
        social = cc.sys.localStorage.getItem("social");
        session = cc.sys.localStorage.getItem("session");
        openID = cc.sys.localStorage.getItem("openID");
        typesocial = cc.sys.localStorage.getItem("typesocial");

        cc.log("###SocialManager::getSession from storage " + social + "/" + openID + "/" + typesocial + "/" + session);
    },

    sessionExistWithId: function (stringId) {
        var session = cc.sys.localStorage.getItem("session" + stringId);
        return (session && session != "");
    },

    onTimeOutSessionKey: function () {
        cc.log("###SocialManager::onTimeOutSessionKey");

        if (this._selector && this._target)
            this._selector.call(this._target, this._currentSocial, "{\"error\": -1}");

        this._selector = null;
    },

    onResponseSessionkey: function (data) {
        var data2 = (data) ? data : null;
        if (data2 == null && this.xhr){
            data2 = this.xhr.responseText;
        }
        cc.log("###SocialManager::onResponseSessionKey " + data2);
        if((!cc.sys.isNative && (!this.xhr || this.xhr.readyState !== XMLHttpRequest.DONE)) && !data2)
        {
            return;
        }

        // cc.log("--callback sessionkey " + this._selector + "|" + this._target);
        if (this._selector && this._target) {
            var control = (cc.sys.isNative) ? data : (!data.isTrusted);
            cc.log("control: " + control);
            if (control) {
                this._selector.call(this._target, this._currentSocial, data);
            }
            else {
                // cc.log("responseText: " + JSON.stringify(this.xhr.responseText));
                this._selector.call(this._target, this._currentSocial, this.xhr.responseText);
            }
        }
        engine.HandlerManager.getInstance().forceRemoveHandler("getSessionKey");
    },

    shareImage: function (social) {
        this.shot = sceneMgr.takeScreenShot();
        this.social = social;

        setTimeout(this.processShareImage.bind(this), 0.5);
    },

    shareImage2: function(isShareImage, image){
        this.shot = sceneMgr.takeScreenShot(isShareImage, image);
        cc.log("this.shot: ", this.shot);
        this.social = SocialManager.FACEBOOK;

        setTimeout(this.processShareImage.bind(this), 0.5);
    },

    processShareImage: function () {
        engine.HandlerManager.getInstance().addHandler("screen", function () {
            if (this.shot == "")
                return;
            this.screenShot = this.shot;
            switch (this.social) {
                default:
                {
                    engine.HandlerManager.getInstance().addHandler("share_fb", function (jdata) {

                        if (this._selector && this._target)
                            this._selector.call(this._target, this._currentSocial, jdata);
                    }.bind(this));
                    if (cc.sys.os === cc.sys.OS_ANDROID && gameMgr.checkOldNativeVersion())
                        jsb.reflection.callStaticMethod("gsn/zingplay/utils/social/FacebookUtils", "openDialogSharePhoto", "(Ljava/lang/String;)V", this.shot);
                    else if (cc.sys.os === cc.sys.OS_IOS) {
                        try {
                            jsb.reflection.callStaticMethod("FacebookUtils", "sharePhoto:", this.shot);
                        } catch (e) {

                        }
                    }
                    break;
                }
            }

        }.bind(this));
        engine.HandlerManager.getInstance().getHandler("screen").setTimeOut(0.1, true);
    }
});

SocialManager.GOOGLE = 0;
SocialManager.ZINGME = 1;
SocialManager.FACEBOOK = 2;
SocialManager.ZALO = 3;
SocialManager.PORTAL = 4;

SocialManager.FACEBOOK_CACHE = "Facebook";
SocialManager.ZALO_CACHE = "Zalo";
SocialManager.GOOGLE_CACHE = "Google";
SocialManager.ZINGME_CACHE = "ZingMe";

SocialManager.GET_FRIENDS_TIMEOUT = 20;
SocialManager.GET_FRIENDS_TIME_CACHE = 1800000;
SocialManager.GET_FRIENDS_DATA_KEY = "key_friends_data_";
SocialManager.GET_FRIENDS_TIME_KEY = "key_friends_time_";

SocialManager.firstinit = true;
SocialManager.sharedInstance = null;

SocialManager.getInstance = function () {
    if (SocialManager.firstinit) {
        SocialManager.sharedInstance = new SocialManager();
        SocialManager.firstinit = false;
    }
    return SocialManager.sharedInstance;
};

var socialMgr = SocialManager.getInstance();