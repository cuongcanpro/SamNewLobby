
var JNI = function () {};

JNI.getRefer = function () {
    var refer = "";
    if(gameMgr.checkOldNativeVersion())
        refer = jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "getRefer", "()Ljava/lang/String;");
    else
        refer = fr.platformWrapper.getRefer();
    return refer;
};

JNI.openHotro = function (packagee,username) {
    if(gameMgr.checkOldNativeVersion())
        jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "openApp", "(Ljava/lang/String;Ljava/lang/String;)V", packagee, username);
    else
        fr.platformWrapper.openCSApplication();
};

JNI.getDeviceID = function () {
    var id = "";
    if(gameMgr.checkOldNativeVersion()) {
        id = jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "getIMEI", "()Ljava/lang/String;");
    }
    else {
        id = fr.platformWrapper.getDeviceID();
    }
    return id;
};

JNI.getDeviceModel = function () {
    var id = "";
    if(gameMgr.checkOldNativeVersion()) {
        id = jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "getPhoneModel", "()Ljava/lang/String;");
    }
    else {
        id = fr.platformWrapper.getDeviceModel();
    }
    return id;
};

JNI.getOsVersion = function () {
    var id = "";
    if(gameMgr.checkOldNativeVersion()) {
        id = jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "getOsVersion", "()Ljava/lang/String;");;
    }
    else {
        id = fr.platformWrapper.getOSVersion();
    }
    return id;
};

JNI.getNetworkStatus = function () {
    var status = 0;
    if(gameMgr.checkOldNativeVersion()) {
        status = jsb.reflection.callStaticMethod("gsn/zingplay/utils/NetworkUtility", "checkNetworkAvaiable", "()I") == 1;
    }
    else {
        status = (fr.platformWrapper.getConnectionStatus() != CONNECTION_STATUS.NO_NETWORK);
    }
    return status;
};

JNI.openWebView = function (url) {
    if(gameMgr.checkOldNativeVersion()) {
        jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "openURL", "(Ljava/lang/String;)V", url);
    }
    else {
        WebviewUI.show(url);
    }
};

JNI.openHTML = function (url) {
    if(gameMgr.checkOldNativeVersion()) {
        jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "openHTML", "(Ljava/lang/String;)V", url);
    }
    else {
        WebviewUI.show(url);
    }
};

JNI.openWebViewPayment = function (url) {
    if(gameMgr.checkOldNativeVersion()) {
        NativeBridge.openURLNative(url);
    }
    else {
        WebviewUI.show(url);
    }
};

JNI.sendSMS = function (phone, message) {
    if(gameMgr.checkOldNativeVersion()) {
        jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "sendMessage", "(Ljava/lang/String;Ljava/lang/String;)V", phone + "", message + "");
    }
    else {
        fr.platformWrapper.sendSMS(message,phone);
    }
};

JNI.sendLoginGSN = function (acountID, acountType, openID, zName) {
    if(gameMgr.checkOldNativeVersion()) {
        jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "sendLogin", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", acountID + "", acountType + "", openID + "", zName + "");
    }
    else {
        fr.platformWrapper.trackLoginGSN(acountID, acountType, openID, zName);
    }
};

JNI.paymentZaloWallet = function (user, uid, itemId, amount) {
    if(gameMgr.checkOldNativeVersion())
    {
        jsb.reflection.callStaticMethod("gsn/zingplay/utils/social/ZaloUtils", "paymentGoogleIAP", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", user + "", uid + "", itemId + "", amount + "");
    }
    else
    {

    }

};

JNI.vibrate = function () {
    if(gameMgr.checkOldNativeVersion()) {
        jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "vibrate", "()V");
    }
    else {

    }
};

JNI.getVersionString = function () {
    if(gameMgr.checkOldNativeVersion()) {
        return jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "getVersionString", "()Ljava/lang/String;")
    }

    return fr.platformWrapper.getVersionName() + "." + fr.platformWrapper.getVersionCode();
};

JNI.getVersionCode = function () {
    if(gameMgr.checkOldNativeVersion()) {
        return jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "getVersionCode", "()Ljava/lang/String;");
    }

    return fr.platformWrapper.getVersionCode();
};

JNI.getNetworkOperator = function () {
    if(gameMgr.checkOldNativeVersion()) {
        return jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "getTelephoneInfo", "()Ljava/lang/String;");
    }

    return fr.platformWrapper.getNetworkOperator();
};

JNI.isEmulator = function () {
    if(gameMgr.checkOldNativeVersion()) {
        if(cc.sys.os == cc.sys.OS_ANDROID && NativeBridge.checkFunctionAvailable("isEmulator")) {
            var ret = jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "isEmulator", "()Z");
            cc.log("NativeBridge.isEmulator " + ret);
            return ret;
        }
    }

    return false;
};

JNI.openIAP = function (productIds) {
    if(gameMgr.checkOldNativeVersion()) {
        jsb.reflection.callStaticMethod("gsn/game/billing/GSNGoogleBilling", "openIAP", "(Ljava/lang/String;)V", productIds + "");
    }
    else {
        fr.googleIap.init(Config.GOOGLE_IAP_BASE64,productIds);
    }
};

JNI.purchaseItem = function (itemId) {
    if(gameMgr.checkOldNativeVersion()) {
        jsb.reflection.callStaticMethod("gsn/game/billing/GSNGoogleBilling", "purchase", "(Ljava/lang/String;)V", itemId + "");
    }
    else {
        fr.googleIap.requestPayProduct(itemId);
    }
};

JNI.purchaseItemSuccess = function (data,signature) {
    if(gameMgr.checkOldNativeVersion()) {
        jsb.reflection.callStaticMethod("gsn/game/billing/GSNGoogleBilling", "purchaseSuccess", "(Ljava/lang/String;Ljava/lang/String;)V", data + "", signature + "");
    }
    else {
        fr.googleIap.finishTransactions(data,signature);
    }
};

JNI.logJSManual = function (fName, line, msg, jsVersion) {
    if(gameMgr.checkOldNativeVersion()) {
        jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "logJSError", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
            fName + "", line + "", msg + "", jsVersion);
    } else {
        fr.platformWrapper.logJSError(fName, line, msg, jsVersion);
    }
};

JNI.purchaseZalo = function (zptranstoken) {
    if(gameMgr.checkOldNativeVersion()) {
        jsb.reflection.callStaticMethod("gsn/zingplay/utils/ZPJNI", "purchaseZalo", "(Ljava/lang/String;)V", zptranstoken);
    }
    else {
        fr.zaloPay.payOrder(zptranstoken);
    }
};

JNI.getPrice = function (id,price) {
    cc.log("JNI.getPrice: ", id, price);
    if(!id) return price;

    if (cc.sys.os === cc.sys.OS_ANDROID) {
        return fr.googleIap.getProductLocalCurrencyById(id);
    }

    return price;
};

JNI.getCurrency = function (id,currency) {
    if(!id) return currency;

    if (cc.sys.os == cc.sys.OS_ANDROID) {
        return fr.googleIap.getProductLocalCurrencyById(id);
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {
        return fr.iosiap.getProductCurrency(id);
    }

    return currency;
};