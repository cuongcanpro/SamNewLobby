/**
 * Created by Hunter on 11/28/2016.
 */

var IAPHandler = cc.Class.extend({

    ctor: function () {
        this.productDetails = [];
        this.typeBuy = IAPHandler.BUY_GOLD;
        this.isWaitingConsume = false;
        this.waitIAP = false;
        this.arrayPackageOpen = [1, 0, 0, 0, 0];
        this.arrayPackageTime = [0, 0, 0, 0, 0];

        // waiting purchase
        this.iapWaits = [];
    },

    // user ifno
    setRefundInfo: function (info) {
        this.iapWaits = [];

        if (Config.ENABLE_IAP_LIMIT_TIME) {
            iapHandler.arrayPackageOpen = info.arrayPackageIAP;
            iapHandler.arrayPackageTime = [];
            for(var i = 0, size = info.arrayPackageTime.length ; i < size ; i++) {
                iapHandler.arrayPackageTime.push(Math.floor((Date.now() + info.arrayPackageTime[i]*1000) / 1000));
            }
        }
    },

    // product config
    getProductPrice: function (id_android, id_ios, cost) {
        var id = "";
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            id = id_android;
        }
        else {
            id = id_ios;
        }

        if(id != "" && id !== undefined) {
            if (gameMgr.checkOldNativeVersion()) {
                if (this.productDetails[id]) {
                    return this.productDetails[id]["price"];
                }
            }
            else {
                return JNI.getPrice(id,cost);
            }
        }
        return cost;
    },

    getProductCurrency: function (id_android, id_ios, currency) {
        var id = "";
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            id = id_android;
        }
        else {
            id = id_ios;
        }

        if (id != "") {
            if(gameMgr.checkOldNativeVersion()) {
                if (this.productDetails[id]) {
                    return this.productDetails[id]["price_currency_code"];
                }
            }
            else {
                return JNI.getCurrency(id,currency);
            }
        }
        return currency;
    },

    getProductIdIAP: function (info) {
        cc.log("vao day ");
        cc.log("INFO " + JSON.stringify(info));
        if (!info || !info.id || !info.id_ios) return "";

        if (cc.sys.os == cc.sys.OS_ANDROID) {
            if (portalMgr.isPortal()) {
                if (Config.ENABLE_MULTI_PORTAL)
                    return fr.paymentInfo.getProductID(info.id_multi_portal);
                else
                    return info.id_portal;
            }
            else {
                return info.id;
            }

        }
        else if (cc.sys.os == cc.sys.OS_IOS) {
            if (portalMgr.isPortal()) {
                if (Config.ENABLE_MULTI_PORTAL)
                    return fr.paymentInfo.getProductID(info.id_multi_ios_portal);
                else
                    return info.id_ios_portal;
            }
            else {
                return info.id_ios;
            }
        }
        else {
            return info.id;
        }
    },

    getTimeLimitLeft : function (idx) {
        if(idx < 0 || idx >= iapHandler.arrayPackageTime.length) return 0;

        var timeNow = Math.floor(Date.now() / 1000);
        return iapHandler.arrayPackageTime[idx] - timeNow;
    },

    getTimeLimitString : function (idx) {
        var timeLeft = this.getTimeLimitLeft(idx);
        if(timeLeft <= 0) return "";

        var day = parseInt(timeLeft / 86400);
        day = day < 10 ? "0" + day : day;
        timeLeft -= day * 86400;
        var hour = parseInt(timeLeft / 3600);
        hour = hour < 10 ? "0" + hour : hour;
        timeLeft -= hour * 3600;
        var minute = parseInt(timeLeft / 60);
        minute = minute < 10 ? "0" + minute : minute;
        timeLeft -= minute * 60;
        timeLeft = timeLeft < 10 ? "0" + timeLeft : timeLeft;

        return hour + ":" + minute + ":" + timeLeft;
    },

    getPackIndex : function (packId) {
        var goldIap = paymentMgr.getShopGoldById(Payment.GOLD_IAP);
        for (var i = 0; i < goldIap.numPackage; i++) {
            var id;
            var id_ios;
            if (portalMgr.isPortal()) {
                id = goldIap["packages"][i]["portalAndroidId"];
                id_ios = goldIap["packages"][i]["portalIOSId"];
                if (Config.ENABLE_MULTI_PORTAL) {
                    id = fr.paymentInfo.getProductID(goldIap["packages"][i]["id_gg_portal"]);
                    id_ios = fr.paymentInfo.getProductID(goldIap["packages"][i]["id_ios_portal"]);
                }
            }
            else {
                id = goldIap["packages"][i]["androidId"];
                id_ios = goldIap["packages"][i]["iOSId"];
            }
            if(packId == id || packId == id_ios) {
                return i;
            }
        }

        goldIap = paymentMgr.getShopGById(Payment.G_IAP);
        for (var i = 0; i < goldIap.numPackage; i++) {
            var id;
            var id_ios;
            if (portalMgr.isPortal()) {
                id = goldIap["packages"][i]["portalAndroidId"];
                id_ios = goldIap["packages"][i]["portalIOSId"];
                if (Config.ENABLE_MULTI_PORTAL) {
                    id = fr.paymentInfo.getProductID(goldIap["packages"][i]["id_gg_portal"]);
                    id_ios = fr.paymentInfo.getProductID(goldIap["packages"][i]["id_ios_portal"]);
                }
            }
            else {
                id = goldIap["packages"][i]["androidId"];
                id_ios = goldIap["packages"][i]["iOSId"];
            }

            if(packId == id || packId == id_ios) {
                return i;
            }
        }

        return -1;
    },

    // action
    openIAP: function () {
        if (Config.DISABLE_IAP_PORTAL) {
            if (portalMgr.isPortal()) return;
        }
        else if (portalMgr.isPortal() && cc.sys.os == cc.sys.OS_IOS) {
            return;
        }

        var productIds = "";
        try {
            var goldIap = paymentMgr.getShopGoldById(Payment.GOLD_IAP);
            for (var i = 0; i < goldIap.numPackage; i++) {
                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    productIds += goldIap["packages"][i]["androidId"];
                }
                else {
                    productIds += goldIap["packages"][i]["iOSId"];
                }

                productIds += ",";
            }

            goldIap = paymentMgr.getShopGById(Payment.G_IAP);
            for (var i = 0; i < goldIap.numPackage; i++) {
                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    productIds += goldIap["packages"][i]["androidId"];
                }
                else {
                    productIds += goldIap["packages"][i]["iOSId"];
                }

                productIds += ",";
            }
        } catch (e) {

        }

        if(gameMgr.checkOldNativeVersion()) {
            engine.HandlerManager.getInstance().addHandler("iap_products_detail", this.onIAPProducts.bind(this));
            engine.HandlerManager.getInstance().addHandler("iap_purchase_state", this.onIAPPurchase.bind(this));
        }
        NativeBridge.openIAP(productIds);
    },

    purchaseItem: function (item) {
        cc.log("PURCHASE ITEM " + item);
        if (Config.DISABLE_IAP_PORTAL)
            if (portalMgr.isPortal()) return;

        if (!item || item == "") return;

        if (this.isWaitingConsume) {
            sceneMgr.showOKDialog(LocalizedString.to("IAP_WAITING_CONSUME"));
            return;
        }
        cc.log("PASS CHECK " + offerManager.isOfferIAP());

        if(Config.ENABLE_IAP_LIMIT_TIME && !offerManager.isOfferIAP()) {
            this.validatePack(item);
            return;
        }

        if (cc.sys.os != cc.sys.OS_ANDROID && cc.sys.os != cc.sys.OS_IOS && Config.ENABLE_CHEAT) {
            // test
            var data = {};
            data.result = 1;
            data.num = 1;
            data.data0 = "{\"packageName\":\"gsn.game.zingplaynew1\",\"productId\":\"pack_1\",\"purchaseTime\":1481008141806,\"purchaseState\":0,\"purchaseToken\":\"oackmnenkoomcfbadcbohbml.AO-J1OySzpw68_cjWM-HOHcUszD0PP-ad8Kd7_jHeVxFb0PGHcmKXJZwXntziiEOEBRDt4JmArBd4-nFXSsgnqbET5fMEZuJSKTJOLvA-Chg_UpCRBvtzmU\"}";
            data.signature0 = "drFXnKapgqWRqe1sdAfbuWIWVtlthMqbEgluBZbwzlQtrGHFsdBsQxOxR3cxSFXMjAtDvvr5KPqomrxnrjA7h4Z8yeZz3BNiw7y2MAsyf9lG4biW7vRnrl19M+iRrZYyRZeHokjmqVWGQq0l64oRGc\/NK+eb6bTGHzMOYH8YPdytj3BB24D1dAHTVX8g\/zB0UwTHNgqFALzjk8hqECq6tFlbPWCMHTCULYye85NY1LW8hIWjWxsM4lVIjBCdWqa\/h+QE60YE6EV3BpDkoZQ4+M1B9ZhJiuqMP3ygMfagpueSJ2nO3+GhIxyHfqdp4Ltp204BupaM27RWvub5JpG6fw==";
            this.onIAPPurchase(JSON.stringify(data));
            // end test
        }
        else {
            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
            NativeBridge.purchaseItem(item);
            if(gameMgr.checkOldNativeVersion())
                engine.HandlerManager.getInstance().addHandler("iap_purchase_state", this.onIAPPurchase.bind(this));
        }
    },

    validatePack : function (item) {
        var packIdx = this.getPackIndex(item);
        if(this.getTimeLimitLeft(packIdx) > 0) return;

        for(var i = 0, size = this.iapWaits.length ; i < size ; i++) {
            if(this.iapWaits[i].pack == item) {
                sceneMgr.showOKDialog(LocalizedString.to("IAP_WAITING_VALIDATE"));
                return;
            }
        }

        sceneMgr.addWaiting();

        var cmd = new CmdSendPurchaseValidate();
        cmd.putData(packIdx);
        GameClient.getInstance().sendPacket(cmd);

        this.iapWaits.push({
            idx : packIdx,
            pack : item
        });

        cc.log("++Wait Validate : " + JSON.stringify(this.iapWaits));
    },

    onValidateSuccess : function (cmd) {
        cc.log("++Validate Success : " + JSON.stringify(cmd) + "\n - Wait : " + JSON.stringify(this.iapWaits));

        var item = "";
        for(var i = this.iapWaits.length - 1; i >= 0 ; i--) {
            if(this.iapWaits[i].idx == cmd.packId) {
                item = this.iapWaits[i].pack;

                this.iapWaits.splice(i,1);
            }
        }

        if(item != "") {
            if(cmd.enable) {
                if(cc.sys.os != cc.sys.OS_ANDROID && cc.sys.os != cc.sys.OS_IOS) {
                    sceneMgr.clearWaiting();
                    sceneMgr.showOKDialog("WIN32::Purchase " + item);
                }
                else {
                    NativeBridge.purchaseItem(item);
                    if(gameMgr.checkOldNativeVersion())
                        engine.HandlerManager.getInstance().addHandler("iap_purchase_state", this.onIAPPurchase.bind(this));
                }
            }
            else {
                sceneMgr.clearWaiting();
                sceneMgr.showOKDialog(LocalizedString.to("IAP_ERROR_VALIDATE"));
            }
        }
    },

    consumeItem: function (data, signature) {
        if (Config.DISABLE_IAP_PORTAL)
            if (portalMgr.isPortal()) return;

        sceneMgr.clearWaiting();
        this.isWaitingConsume = false;

        NativeBridge.purchaseItemSuccess(data, signature);
    },

    // server response
    onResponseIapGoogle: function (cmd) {
        cc.log("IAPHandler::onResponseIapGoogle " + cmd.getError());

        this.consumeItem(cmd.purchaseData, cmd.signature);

        var error = cmd.getError();
        if (error != 0) {
            sceneMgr.showOKDialog(LocalizedString.to("IAP_PURCHASE_ERROR") + cmd.getError());
        }
        else {
            this.waitIAP = true; // doi goi tin DailyGoldIAP tu Server, trong trang thai nay se khong show Gui Doi G thanh cong khi co goi tin do gui ve nua
        }
    },

    onResponseIapApple: function (cmd) {
        cc.log("IapHandler::onResponseIapApple " + JSON.stringify(cmd));

        this.consumeItem(cmd.getIds());

        var error = cmd.getError();
        if (error != 0) {
            sceneMgr.showOKDialog(LocalizedString.to("IAP_PURCHASE_ERROR") + cmd.getError());
        }
        else {
            this.waitIAP = true; // doi goi tin DailyGoldIAP tu Server, trong trang thai nay se khong show Gui Doi G thanh cong khi co goi tin do gui ve nua
        }
    },

    onIAPPurchaseResponse : function (cmd) {
        cc.log("++PurchaseSuccess : " + JSON.stringify(cmd));

        iapHandler.arrayPackageOpen = cmd.enables;
        iapHandler.arrayPackageTime = [];
        for(var i = 0, size = cmd.times.length ; i < size ; i++) {
            iapHandler.arrayPackageTime.push(Math.floor((Date.now() + cmd.times[i]*1000) / 1000));
        }
    },

    // native callback
    onIAPPurchase: function (data) {
        sceneMgr.clearWaiting();

        var obj = {};
        try {
            obj = JSON.parse(data);
        }
        catch (e) {
            obj["result"] = IAPHandler.PURCHASE_ERROR;
        }

        cc.log("IAPHandler::onIAPPurchase " + data);

        switch (obj.result) {
            case IAPHandler.PURCHASE_SUCCESS:
            {
                if (obj["num"]) {
                    var num = obj["num"];
                    if (num > 0) {
                        sceneMgr.addWaiting();
                        this.isWaitingConsume = true;
                        setTimeout(function () {
                            sceneMgr.clearWaiting();
                        }, 5000);
                    }

                    for (var i = 0; i < num; i++) {
                        var pObj = {};
                        pObj.data = obj["data" + i];
                        pObj.signature = obj["signature" + i];
                        cc.log("PurchaseObj " + JSON.stringify(pObj));

                        if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_AUTO_CONSUME) {
                            cc.log("AUTO CONSUME");
                            this.consumeItem(pObj.data, pObj.signature);
                        }

                        if (cc.sys.os == cc.sys.OS_ANDROID) {
                            // send to server finish purchase
                            if (portalMgr.isPortal()) {
                                if (Config.ENABLE_MULTI_PORTAL) {
                                    var cmd = new CmdSendPurchaseIAPGoogleMultiPortal();
                                    cmd.putData(pObj.data, pObj.signature, fr.platformWrapper.getPackageName(), (offerManager.isOfferIAP() ? Payment.IS_OFFER : this.typeBuy));
                                    GameClient.getInstance().sendPacket(cmd);
                                }
                                else {
                                    var cmd = new CmdSendPurchaseIAPGooglePortal();
                                    cmd.putData(pObj.data, pObj.signature, (offerManager.isOfferIAP() ? Payment.IS_OFFER : this.typeBuy));
                                    GameClient.getInstance().sendPacket(cmd);
                                }
                            }
                            else {
                                var cmd = new CmdSendPurchaseIAPGoogle();
                                cmd.putData(pObj.data, pObj.signature, (offerManager.isOfferIAP() ? Payment.IS_OFFER : this.typeBuy));
                                GameClient.getInstance().sendPacket(cmd);
                            }
                            cc.log("IAPHandler::sendPurchase Google to Server \n Data :  " + pObj.data + "\n Signature : " + pObj.signature);
                        }
                        else if (cc.sys.os == cc.sys.OS_IOS) {
                            // send to server finish purchase
                            if (portalMgr.isPortal()) {
                                var cmd = new CmdSendPurchaseIAPApplePortal();
                                cmd.putData(pObj.data);
                                GameClient.getInstance().sendPacket(cmd);
                            }
                            else {
                                var cmd = new CmdSendPurchaseIAPApple();
                                cmd.putData(pObj.data);
                                GameClient.getInstance().sendPacket(cmd);
                            }
                            cc.log("IAPHandler::sendPurchase Apple to Server \n Data :  " + pObj.data);
                        }
                        else {
                            cc.log("IAPHandler::iap on platform not support");
                            //if(Config.ENABLE_CHEAT) {
                            //    iapHandler.onIAPNewResponse();
                            //}
                        }
                    }
                }
                break;
            }
            case IAPHandler.PURCHASE_WAITING:
            {
                sceneMgr.showOKDialog(LocalizedString.to("IAP_PURCHASE_WAITING"));
                break;
            }
            case IAPHandler.PURCHASE_CANCELED:
            {

                break;
            }
            default :
            {
                sceneMgr.showOKDialog(LocalizedString.to("IAP_PURCHASE_ERROR") + "(" + obj.result + ")");
                break;
            }
        }
    },

    onIAPProducts: function (data) {
        var obj = {};
        try {
            obj = JSON.parse(data);
            cc.log("onIAPProducts: " + JSON.stringify(data));
        }
        catch (e) {
            return;
        }

        for (var s in obj) {
            this.productDetails[s] = JSON.parse(obj[s]);
        }
    },

    isActiveIapPakage: function (value) {
        var config = paymentMgr.getShopGoldById(Payment.GOLD_IAP);
        // kiem tra xem co goi IAP nao dang duoc Active khong
        var iapEnable = iapHandler.arrayPackageOpen;
        for (var i = 0; i < config.numPackage; i++) {
            var packageShop = config["packages"][i];
            if (packageShop["value"] == value) {
                if (iapEnable[i]) {
                    var nTime = iapHandler.getTimeLimitLeft(i);
                    if (nTime <= 0) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
    }

});

IAPHandler.STATE_OPEN = "iap_open_state";
IAPHandler.STATE_PURCHASE = "iap_purchase_state";

IAPHandler.PURCHASE_SUCCESS = 1;
IAPHandler.PURCHASE_ERROR = 3;
IAPHandler.PURCHASE_WAITING = 2;
IAPHandler.PURCHASE_CANCELED = 4;

IAPHandler.IAP_GOOGLE_SUCCESS = 0;
IAPHandler.IAP_GOOGLE_DUPLICATE_TRANX = 1;
IAPHandler.IAP_GOOGLE_INVALID_SIGN = 2;
IAPHandler.IAP_GOOGLE_INVALID_PACK = 3;
IAPHandler.IAP_GOOGLE_ERROR_BILLING = 5;

IAPHandler.BUY_GOLD = 0;
IAPHandler.BUY_TICKET = 2;

IAPHandler.firstinit = true;
IAPHandler.sharedInstance = null;

IAPHandler.getInstance = function () {
    if (IAPHandler.firstinit) {
        IAPHandler.sharedInstance = new IAPHandler();
        IAPHandler.firstinit = false;
    }
    return IAPHandler.sharedInstance;
};

var iapHandler = IAPHandler.getInstance();