LogUtil = cc.Class.extend({
    ctor: function () {

    }
})

LogUtil.sendLogInstallZaloPay = function () {
    try {
        if (fr.platformWrapper.isAndroid()) {
            var packageName = Config.URL_ZALOPAY;
            var isInstalled = fr.platformWrapper.checkInstallApp(packageName);
            if (Config.ENABLE_CHEAT) {
                packageName = Config.URL_ZALOPAY_SANBOX;
                isInstalled += fr.platformWrapper.isInstalledApp(packageName);
            }
            var logClient = new CmdSendClientInfo();
            if (isInstalled == 0) {
                logClient.putData(isInstalled, 4);
            } else {
                logClient.putData("1", 4);
            }
            GameClient.getInstance().sendPacket(logClient);
            logClient.clean();
        }
    } catch (e) {

    }
}

LogUtil.sendLogSimulator = function () {
    if (fr.platformWrapper.isAndroid()) {
        //service_name=log_simulator&username=test&userId=test&deviceId=deviceId&deviceModel=model&isSimulator=1
        if (!LogUtil.isSendCheckSimulator) {
            var link = "http://120.138.65.103:470/";
            //link = Constant.ZINGME_SERVICE_URL;
            var data = "service_name=log_simulator";
            data += "&username=" + "sam|" + GameData.getInstance().userData.zName;
            data += "&userId=" + info.uId;
            data += "&deviceId=" + NativeBridge.getDeviceID();
            data += "&deviceModel=" + NativeBridge.getDeviceModel();
            data += "&isSimulator=" + (gamedata.emulatorDetector.isEmulator() ? 1 : 0);
            data += "&data=" + gamedata.dataEmulator;
            cc.log("#Login::" + Constant.ZINGME_SERVICE_URL + data);
            var onSuccess = function () {
                cc.log("Success CHECK SIMULATOR ");
                cc.log("TEXT RESPONSE " + this.xhrCheckSimulator.responseText);
            }.bind(this);
            var onError = function () {
                cc.log("on Error CHECK SIMULATOR ");
            }.bind(this);
            cc.log("CHECK NE " + link + data);
            this.xhrCheckSimulator = LoginHelper.getRequest(link, data, 10000, null, onSuccess, onError);
        }
        LogUtil.isSendCheckSimulator = true;
    }
}

LogUtil.sendLogLogin = function () {
    if (!cc.sys.isNative) {
        try {
            var accType = Constant.ZINGME;
            var type = userMgr.getUserName().substr(0, 2);
            if (type === "fb") {
                accType = Constant.FACEBOOK;
            }
            if (type === "zl") {
                accType = Constant.ZALO;
            }
            if (type === "gg") {
                accType = Constant.GOOGLE;
            }

            gsntracker.login(info.uId, accType, info.uId, GameData.getInstance().userData.zName);
        } catch (e) {
            cc.error("Can not send login tracker: " + e);
        }
    }
}