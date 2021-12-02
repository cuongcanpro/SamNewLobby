/**
 * Created by Hunter on 11/28/2016.
 */

var IAPHandler = cc.Class.extend({

    ctor: function () {
        this.productDetails = [];
        this.typeBuy = IAPHandler.BUY_GOLD;
        this.isWaitingConsume = false;

        /**
         * iapRefundInfo
         * + dayLeft : số ngày đã nhận goldf
         * + dayTotal : tổng sổ ngày
         * + productId : id của gói gold đã mua
         * + active : có gói active hay không
         */
        this.iapRefundInfo = {};
        this.iapRefundInfo.dayLeft = 2;
        this.iapRefundInfo.dayTotal = 5;
        this.iapRefundInfo.productId = "pack_1";
        this.iapRefundInfo.productIndex = 0;
        this.iapRefundInfo.totalGIAP = 0;
        this.iapRefundInfo.active = false;
        this.receivedDailyGold = false;
        this.cmdReceiveGold = null;
        this.waitIAP = false;
        this.arrayPackageOpen = [1, 0, 0, 0, 0];
        this.arrayPackageTime = [0, 0, 0, 0, 0];

        // waiting purchase
        this.iapWaits = [];
    },

    // user ifno
    setRefundInfo: function (info) {
        this.iapWaits = [];

        if (Config.ENABLE_IAP_REFUND) {
            iapHandler.iapRefundInfo.totalGIAP = info.totalGIAP;
            iapHandler.iapRefundInfo.dayTotal = info.totalDayIAP;
            iapHandler.iapRefundInfo.dayLeft = info.dayReceivedIAP;
            iapHandler.iapRefundInfo.productIndex = info.idPackage;
            iapHandler.arrayPackageOpen = info.arrayPackageIAP;
            iapHandler.iapRefundInfo.active = info.idPackage >= 0;
            cc.log("TOTAL G IAP " + info.dayReceivedIAP + "  " + info.totalDayIAP + "  " + info.totalGIAP);
        }

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

    checkIapRefundProductActive: function (pack) {
        return !!(iapHandler.iapRefundInfo.active && iapHandler.iapRefundInfo.productIndex == pack);
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
            sceneMgr.addWaiting();
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

    // purchase card
    purchaseCard: function (cType, card, seri, isBuyGold, isForOffer) {
        WaitingPopup.show(LocalizedString.to("PURCHASE_CARD_PROCESS"));

        this.isWaitPurchase = true;
        if (!isForOffer)
            isForOffer = Payment.NO_OFFER;
        var cmd = new CmdSendPurchaseCard();
        cmd.putData(cType, card, seri, isBuyGold, isForOffer);
        GameClient.getInstance().sendPacket(cmd);
    },

    responsePurchaseCard: function (cmd) {
        if (cmd.response > 1) {
            // wait response from services
        }
        else if (cmd.response < 1) {
            sceneMgr.showOKDialog(cmd.message);
        }
        else {
            sceneMgr.showOKDialog(LocalizedString.to("PURCHASE_CARD_SUCCESS"));
        }

        if (cmd.response <= 1) {
            this.isWaitPurchase = false;
            WaitingPopup.clear();

            var gui = sceneMgr.getMainLayer();
            //if (gui instanceof AddGIapScene) {
            //    if (gui.tabCard) gui.tabCard.updateButton(true);
            //}
        }
    },

    onUpdateMoney: function () {
        if (this.isWaitPurchase) {
            this.isWaitPurchase = false;
            WaitingPopup.clear();

            sceneMgr.showOKDialog(LocalizedString.to("PURCHASE_CARD_SUCCESS"));

            var gui = sceneMgr.getMainLayer();
            //if (gui instanceof AddGIapScene) {
            //    if (gui.tabCard) gui.tabCard.updateButton(true);
            //}
        }
    },

    onIAPNewResponse: function (cmd) {
        sceneMgr.clearWaiting();

        var gui = sceneMgr.openGUI(IAPGoldDailyGUI.className, LobbyScene.GUI_IAP_DAILY, LobbyScene.GUI_IAP_DAILY);
        if (gui && gui instanceof IAPGoldDailyGUI) {
            var cmd1 = new Object();
            cmd1.totalDay = 5;
            cmd1.dayReceived = 1;
            cmd1.index = 0;
            cmd1.gold = 10000000;

            //   gui.setInfo(cmd1);
            cc.log("CLJ " + cmd1.gold);
        }
    },

    // purchase sms
    requestSMSSyntax: function (operator, amount, event, smsType, isOffer) {
        event = event || 0;
        if (!isOffer)
            isOffer = 0;
        cc.log("SMS TYPE " + smsType);
        if ((Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS)) //(cc.sys.os != cc.sys.OS_ANDROID && cc.sys.os != cc.sys.OS_IOS) ||
        {
            ToastFloat.makeToast(ToastFloat.LONG, "Fake SMS " + amount);

            this.fakeSMS(amount, event, smsType);
        }
        else {
            WaitingPopup.show(LocalizedString.to("TINNHAN_WAITING_REQUEST"));

            var cmd = new CmdSendPurchaseSMS();
            cmd.putData(operator, amount, event, isOffer);
            GameClient.getInstance().sendPacket(cmd);
        }
    },

    purchaseSMS: function (rPSMS) {
        WaitingPopup.clear();
        if (cc.sys.isNative) {
            WaitingPopup.show(LocalizedString.to("TINNHAN_WAITING_PROCESS"), 5);

            if (rPSMS.service == "" || rPSMS.syntax == "") {
                sceneMgr.showOKDialog(LocalizedString.to("PURCHASE_TINNHAN_FAIL"));
                return;
            }

            NativeBridge.sendSMS(rPSMS.service, rPSMS.syntax);
        }
        else {
            var scene = sceneMgr.openGUI(SmsSyntaxPopup.className, SmsSyntaxPopup.tag,  SmsSyntaxPopup.tag);
            scene.setSyntax(rPSMS.syntax, rPSMS.service);
        }
    },

    fakeSMS: function (amount, event, type) {
        var smsType = type || "sms";
        switch (type) {
            case Payment.GOLD_SMS_VIETTEL:{
                smsType = "sms_viettel";
                break;
            }
            case Payment.GOLD_SMS_MOBI:{
                smsType = "sms_mobifone";
                break;
            }
            case Payment.GOLD_SMS_VINA:{
                smsType = "sms_vinaphone";
                break;
            }
        }
        if (event == Payment.CHEAT_PAYMENT_OFFER)
            smsType = "sms";
        var url = Constant.SMS_PRIVATE;
        var data = "gameId=" + LocalizedString.config("GAME") + "&username=" + userMgr.getUserName() + "&uId=" + userMgr.getUID() + "&paymentType=" + smsType + "&amount=" + amount + "&forEvent=" + event;

        this.xhr = cc.loader.getXMLHttpRequest();
        this.xhr.open("GET", url + "?" + data, true);
        this.xhr.send();
    },


    /**
     *
     * @param amount
     * @param type
     * @param typeBuy: 0 la mua Gold, 1 la mua OFfer, 2 la mua ve cho event
     */
    fakePayment: function (amount, type, typeBuy) {
        if (!typeBuy)
            typeBuy = 0;
        cc.log("FAKE " + amount + " TYPE " + type);
        var url = Constant.SMS_PRIVATE;
        var data = "gameId=" + LocalizedString.config("GAME") + "&username=" + userMgr.getUserName() + "&uId=" + userMgr.getUID() + "&paymentType=" + type + "&amount=" + amount + "&forEvent=" + typeBuy;

        this.xhr = cc.loader.getXMLHttpRequest();
        this.xhr.open("GET", url + "?" + data, true);
        cc.log("URL " + url + "?" + data);
        this.xhr.send();
    },

    purchaseZalo: function (zptranstoken) {
        NativeBridge.purchaseZalo(zptranstoken);
        if(gameMgr.checkOldNativeVersion())
            engine.HandlerManager.getInstance().addHandler("payZalo", this.onPayZalo.bind(this));
    },

    purchaseATM: function (urlDirect) {
        NativeBridge.openWebViewPayment(urlDirect);
    },

    onPayZalo: function (data) {
        cc.log("ON PAY ZALO ****** ");
        var obj = {};
        try {
            obj = JSON.parse(data);
        }
        catch (e) {
            return;
        }

        if (obj.error == 0) {
            cc.log(" Purchase Zalo thanh cong");
        }
        else {
            ToastFloat.makeToast(ToastFloat.LONG, localized("PURCHASE_TINNHAN_FAIL") + "  " + obj.error);
        }
    },

    showDailyGold: function () {
        if (this.receivedDailyGold) {
            this.receivedDailyGold = false;
            var gui = sceneMgr.openGUI(IAPGoldDailyGUI.className, LobbyScene.GUI_IAP_DAILY, LobbyScene.GUI_IAP_DAILY);
            if (gui && gui instanceof IAPGoldDailyGUI) {
                gui.setInfo(this.cmdReceiveGold);
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