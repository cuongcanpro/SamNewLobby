/**
 * Created by HOANGNGUYEN on 8/5/2015.
 */

var NativeBridge = function () {
};

NativeBridge.checkFunctionAvailable = function (fName) {
    if(!fName) return false;

    if(Config.APP_VERSION_JNI_AVAIABLE <= 0) return false;

    if(gamedata.appVersion < Config.APP_VERSION_JNI_AVAIABLE) {
        return false;
    }

    if (cc.sys.os == cc.sys.OS_ANDROID)
        return jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "checkMethod", "(Ljava/lang/String;)Z" , fName);

    if (cc.sys.os == cc.sys.OS_IOS)
        return true;

    return false;
};

NativeBridge.getRefer = function () {
    var refer = "";
    if (cc.sys.os == cc.sys.OS_ANDROID)
        refer = JNI.getRefer();
    return refer;
};

NativeBridge.openHotro = function (packagee, username) {
    cc.log("NativeBridge.openHotro " + packagee + "/" + username);

    if (cc.sys.os == cc.sys.OS_ANDROID)
        JNI.openHotro(packagee,username);
};

NativeBridge.getPlatform = function () {
    if (cc.sys.os == cc.sys.OS_ANDROID)
        return Constant.PLATFORM_ANDROID;
    if (cc.sys.os == cc.sys.OS_IOS)
        return Constant.PLATFORM_IOS;
    // dongpp: lay platform web
    if (!cc.sys.isNative){
        return Constant.PLATFORM_WEB;
    }

    return Config.DEFAULT_PLATFORM;
};

NativeBridge.getDeviceID = function () {
    var ret = Math.floor(Math.random() * 100000000);
    //var ret = 43544;
    if (Config.ENABLE_CHEAT && CheatCenter.IS_FAKE_UID) {
        cc.log("_____________DEVICE__ID_FAKE : " + ret);
        return ret;
    }

    if (cc.sys.os == cc.sys.OS_ANDROID)
        ret = JNI.getDeviceID();
    if (cc.sys.os == cc.sys.OS_IOS)
        ret = jsb.reflection.callStaticMethod("ObjCBridgle", "getIMEI");
    if (!cc.sys.isNative) {
        var deviceIdCache = cc.sys.localStorage.getItem("deviceIdWeb");
        if (!deviceIdCache || deviceIdCache == null) {
            ret = ret + "" + (new Date().getTime());
            cc.sys.localStorage.setItem("deviceIdWeb", ret);
        } else {
            ret = deviceIdCache;
        }
    }

    cc.log("_____________DEVICE__ID : " + ret);
    return ret;
};

NativeBridge.getDeviceModel = function () {
    var ret = "GameJS";
    if (cc.sys.os == cc.sys.OS_ANDROID)
        ret = JNI.getDeviceModel();
    if (cc.sys.os == cc.sys.OS_IOS)
        ret = jsb.reflection.callStaticMethod("ObjCBridgle", "getDeviceModel");
    cc.log("_____________DEVICE__MODEL : " + ret);
    return ret;
};

NativeBridge.getOsVersion = function () {
    var ret = "2.0";
    if (cc.sys.os == cc.sys.OS_ANDROID)
        ret = JNI.getOsVersion();
    else if (cc.sys.os == cc.sys.OS_IOS)
        ret = jsb.reflection.callStaticMethod("ObjCBridgle", "getOsVersion");
    cc.log("_____________OS__VERSION : " + ret);
    return ret;
};

NativeBridge.networkAvaiable = function () {
    var networkstatus = true;
    if (cc.sys.os == cc.sys.OS_ANDROID)
        networkstatus = JNI.getNetworkStatus();
    else if (cc.sys.os == cc.sys.OS_IOS) {
        var network = jsb.reflection.callStaticMethod("ObjCBridgle", "networkAvaiable");
        if (network === "NO") {
            networkstatus = false;
        }
    }
    return networkstatus;
};

NativeBridge.openWebView = function (url, https) {
    if (!https) {
        url = url.replace("https", "http");
    }
    cc.log("NativeBridge.openWebView " + url);
    if (cc.sys.os == cc.sys.OS_ANDROID)
        JNI.openWebView(url);
    else if (cc.sys.os == cc.sys.OS_IOS)
        jsb.reflection.callStaticMethod("ObjCBridgle", "openURL:", url);
    else
        NativeBridge.openURLNative(url);
};

NativeBridge.openHTML = function (url) {
    cc.log("NativeBridge.openHTML " + url);
    if (cc.sys.os == cc.sys.OS_ANDROID)
        JNI.openHTML(url);
    else if (cc.sys.os == cc.sys.OS_IOS)
        jsb.reflection.callStaticMethod("ObjCBridgle", "openURL:", url);
    else
        NativeBridge.openURLNative(url);
};

NativeBridge.openWebViewPayment = function (url, https) {
    cc.log("NativeBridge.openWebView " + url);
    if (cc.sys.os == cc.sys.OS_ANDROID)
        JNI.openWebViewPayment(url);
    else if (cc.sys.os == cc.sys.OS_IOS)
        jsb.reflection.callStaticMethod("ObjCBridgle", "openURL:", url);
    else
        NativeBridge.openURLNative(url);
};

NativeBridge.openURLNative = function (url) {
    cc.sys.openURL(url);
};

NativeBridge.sendSMS = function (phone, content) {
    cc.log("NativeBridge.sendSMS : " + phone + "/" + content);

    if (cc.sys.os == cc.sys.OS_ANDROID) {
        JNI.sendSMS(phone,content);
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {
        if (gamedata.isPortal()) {
            jsb.reflection.callStaticMethod("ObjCBridgle", "sendMessage:message:", phone + "", content + "");
        }
        else if(gamedata.appVersion < Config.APP_VERSION_NEW_REVIEW)
            jsb.reflection.callStaticMethod("ObjCBridgle", "sendSMS:message:", phone + "", content + "");
        else
            jsb.reflection.callStaticMethod("ObjCBridgle", "sendTinNhan:message:", phone + "", content + "");
    }
};

NativeBridge.sendLogin = function (acountID, acountType, source) {
    if (cc.sys.os == cc.sys.OS_ANDROID)
        if (gamedata.checkOldNativeVersion()){
            jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "sendLoginZalo", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", acountID + "", acountType + "", source + "", NativeBridge.getRefer() + "");
        }
    else if (cc.sys.os == cc.sys.OS_IOS)
        jsb.reflection.callStaticMethod("ZaloUtils", "sendLogin:acountType:source:refer:", acountID + "", acountType + "", source + "", NativeBridge.getRefer() + "");
}

NativeBridge.sendLoginGSN = function (acountID, acountType, openID, zName) {
    if (cc.sys.os == cc.sys.OS_ANDROID)
        JNI.sendLoginGSN(acountID, acountType, openID, zName);
    else if (cc.sys.os == cc.sys.OS_IOS)
        jsb.reflection.callStaticMethod("ObjCBridgle", "sendLoginGSN:acountType:openID:zName:", acountID + "", acountType + "", openID + "", zName + "");
};

NativeBridge.paymentZaloWallet = function (user, uid, itemId, amount) {

    if (cc.sys.os == cc.sys.OS_ANDROID) {
        JNI.paymentZaloWallet(user, uid, itemId, amount);
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {

    }
};

NativeBridge.vibrate = function () {
    if (!gamedata.vibrate) return;

    if (cc.sys.os == cc.sys.OS_ANDROID)
        JNI.vibrate();
    else if (cc.sys.os == c.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("ObjCBridgle", "vibrate");
    }
};

NativeBridge.getVersionString = function () {
    var ret = "v";
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        ret += JNI.getVersionString();
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {
        ret += jsb.reflection.callStaticMethod("ObjCBridgle", "getVersionString");
    }
    else {
        ret += "W32";
    }

    var jsVersion = cc.sys.localStorage.getItem(LocalizedString.config("KEY_JS_VERSION"));
    if (jsVersion === undefined || jsVersion == null || jsVersion == "") jsVersion = "0";

    ret += "." + gamedata.appVersion + "." + jsVersion;
    return ret;
};

NativeBridge.getVersionCode = function () {
    var ret = "";
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        ret = JNI.getVersionCode();
    }
    else {
        ret = "1";
    }

    ret = parseInt(ret);
    if (isNaN(ret)) ret = 1;

    return ret;
};

NativeBridge.getTelephoneInfo = function () {
    var ret = "";
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        cc.log("NativeBridge.getTelephoneInfo");
        ret = JNI.getNetworkOperator();
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {
        ret = jsb.reflection.callStaticMethod("ObjCBridgle", "getTelephoneInfo");
    }
    else {
        ret = 0;
    }
    return ret;
};

NativeBridge.getNetworkOperator = function () {
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        return JNI.getNetworkOperator();
    }
    return "";
};

NativeBridge.isEmulator = function () {
    return JNI.isEmulator();
};

NativeBridge.openIAP = function (productIds) {
    cc.log("NativeBridge::openIAP " + productIds);
    if (cc.sys.os === cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("ObjCBridgle", "openIAP:", productIds);
    } else {
        JNI.openIAP(productIds);
    }
};

NativeBridge.purchaseItem = function (itemId) {
    cc.log("NativeBridge::purchaseItem " + itemId);

    if (!itemId) return;

    if (cc.sys.os == cc.sys.OS_ANDROID) {
        JNI.purchaseItem(itemId);
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("ObjCBridgle", "purchaseIAP:", itemId);
    }
};

NativeBridge.purchaseItemSuccess = function (data, signature) {
    cc.log("NativeBridge::purchaseItemSuccess " + JSON.stringify(arguments));

    if (cc.sys.os == cc.sys.OS_ANDROID) {
        if (!data && !signature) return;
        JNI.purchaseItemSuccess(data,signature);
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {
        if (!data) return;
        jsb.reflection.callStaticMethod("ObjCBridgle", "purchaseIAPSuccess:", data);
    }
};

NativeBridge.logJSManual = function (fName, line, msg, jsVersion) {
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        JNI.logJSManual(fName, line, msg, jsVersion);
    }
    //else if (cc.sys.os == cc.sys.OS_IOS)
    //    jsb.reflection.callStaticMethod("ZaloUtils", "sendLogin:acountType:source:refer:", acountID + "", acountType + "", source + "", NativeBridge.getRefer() + "");
};

NativeBridge.purchaseZalo = function (zptranstoken) {
    cc.log("NativeBridge.purchaseZalo : " + zptranstoken);

    if (cc.sys.os == cc.sys.OS_ANDROID) {
        JNI.purchaseZalo(zptranstoken);
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("ObjCBridgle", "purchaseZalo:zptranstoken:", zptranstoken + "");
    }
};

NativeBridge.openFanpage = function (pageId) {
    var fbWebUrl = "https://www.facebook.com/" + pageId;
    var fbAppUrl = "fb://";
    if(cc.sys.os === cc.sys.OS_ANDROID)
        fbAppUrl += "page/";
    if(cc.sys.os === cc.sys.OS_IOS)
        fbAppUrl += "profile/";
    fbAppUrl += pageId;

    cc.log("NativeBridge.openFanpage: " , fbWebUrl, fbAppUrl);
    if (cc.sys.os === cc.sys.OS_WINDOWS || !cc.sys.isNative){
        NativeBridge.openURLNative(fbWebUrl);
        return;
    }
    if(!cc.Application.getInstance().openURL(fbAppUrl)) {
        cc.Application.getInstance().openURL(fbWebUrl);
    }
};

NativeBridge.openFanpageHotNews = function (url) {
    var fbWebUrl = url;
    var fbAppUrl = "fb://";
    if(cc.sys.os === cc.sys.OS_ANDROID)
        fbAppUrl += "facewebmodal/f?href=";
    if(cc.sys.os === cc.sys.OS_IOS)
        fbAppUrl += "profile/";
    fbAppUrl += url;

    cc.log("NativeBridge.openFanpageHotNews: " , fbWebUrl, fbAppUrl);
    if (cc.sys.os === cc.sys.OS_WINDOWS || !cc.sys.isNative){
        NativeBridge.openURLNative(fbWebUrl);
        return;
    }
    if(!cc.Application.getInstance().openURL(fbAppUrl)) {
        cc.Application.getInstance().openURL(fbWebUrl);
    }
};

NativeBridge.openStorePage = function (pageId) {
    var storeWebUrl = "http://play.google.com/store/apps/details?id=" + pageId;
    var storeAppUrl = "";
    if(cc.sys.os == cc.sys.OS_ANDROID)
        storeAppUrl += "market://details?id=";
    if(cc.sys.os == cc.sys.OS_IOS)
        return;
    storeAppUrl += pageId;

    if(!cc.Application.getInstance().openURL(storeAppUrl)) {
        cc.Application.getInstance().openURL(storeWebUrl);
    }
};

// Common Function
NativeBridge.JNI = "gsn/zingplay/utils/ZPJNI";
NativeBridge.TYPE_STRING = "Ljava/lang/String;";
NativeBridge.TYPE_INT = "I";
NativeBridge.TYPE_BOOL = "Z";
NativeBridge.TYPE_VOID = "V";