/**
 * Cac phuong thuc ho tro cac kenh thanh toan
 */
PaymentUtils = cc.Class.extend({
    ctor: function () {
        this._super();
    }
})
// purchase card
PaymentUtils.purchaseCard = function (cType, card, seri, isBuyGold, isForOffer) {
    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);

    this.isWaitPurchase = true;
    if (!isForOffer)
        isForOffer = Payment.NO_OFFER;
    var cmd = new CmdSendPurchaseCard();
    cmd.putData(cType, card, seri, isBuyGold, isForOffer);
    GameClient.getInstance().sendPacket(cmd);
}

PaymentUtils.responsePurchaseCard = function (cmd) {
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
        sceneMgr.clearLoading();

        var gui = sceneMgr.getMainLayer();
        //if (gui instanceof AddGIapScene) {
        //    if (gui.tabCard) gui.tabCard.updateButton(true);
        //}
    }
}

PaymentUtils.onUpdateMoney = function () {
    if (this.isWaitPurchase) {
        this.isWaitPurchase = false;
        sceneMgr.clearLoading();

        sceneMgr.showOKDialog(LocalizedString.to("PURCHASE_CARD_SUCCESS"));

        var gui = sceneMgr.getMainLayer();
        //if (gui instanceof AddGIapScene) {
        //    if (gui.tabCard) gui.tabCard.updateButton(true);
        //}
    }
}

// purchase sms
PaymentUtils.requestSMSSyntax = function (operator, amount, event, smsType, isOffer) {
    event = event || 0;
    if (!isOffer)
        isOffer = 0;
    cc.log("SMS TYPE " + smsType);
    if ((Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS)) //(cc.sys.os != cc.sys.OS_ANDROID && cc.sys.os != cc.sys.OS_IOS) ||
    {
        ToastFloat.makeToast(ToastFloat.LONG, "Fake SMS " + amount);
        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
        PaymentUtils.fakeSMS(amount, event, Payment.GOLD_SMS); // gop 3 loai SMS lam mot nen truong smsType ko duoc dung nua
    }
    else {
        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);

        var cmd = new CmdSendPurchaseSMS();
        cmd.putData(operator, amount, event, isOffer);
        GameClient.getInstance().sendPacket(cmd);
    }
}

PaymentUtils.purchaseSMS = function (rPSMS) {
    sceneMgr.clearLoading();
    if (cc.sys.isNative) {
        if (rPSMS.service == "" || rPSMS.syntax == "") {
            sceneMgr.showOKDialog(LocalizedString.to("PURCHASE_TINNHAN_FAIL"));
            return;
        }
        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(5);
        NativeBridge.sendSMS(rPSMS.service, rPSMS.syntax);
    }
    else {
        var scene = sceneMgr.openGUI(SmsSyntaxPopup.className, SmsSyntaxPopup.tag,  SmsSyntaxPopup.tag);
        scene.setSyntax(rPSMS.syntax, rPSMS.service);
    }
}

PaymentUtils.fakeSMS = function (amount, event, type) {
    var smsType = type || "sms";
    switch (type) {
        case Payment.GOLD_SMS:{
            smsType = "sms";
            break;
        }
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
}


/**
 *
 * @param amount
 * @param type
 * @param typeBuy: 0 la mua Gold, 1 la mua OFfer, 2 la mua ve cho event
 */
PaymentUtils.fakePayment = function (amount, type, isOffer) {
    if (!isOffer)
        isOffer = Payment.NO_OFFER;
    cc.log("FAKE " + amount + " TYPE " + type);
    var url = Constant.SMS_PRIVATE;
    var data = "gameId=" + LocalizedString.config("GAME") + "&username=" + userMgr.getUserName() + "&uId=" + userMgr.getUID() + "&paymentType=" + type + "&amount=" + amount + "&forEvent=" + isOffer;

    this.xhr = cc.loader.getXMLHttpRequest();
    this.xhr.open("GET", url + "?" + data, true);
    cc.log("URL " + url + "?" + data);
    this.xhr.send();
}

PaymentUtils.purchaseZalo = function (zptranstoken) {
    NativeBridge.purchaseZalo(zptranstoken);
    if(gameMgr.checkOldNativeVersion())
        engine.HandlerManager.getInstance().addHandler("payZalo", this.onPayZalo.bind(this));
}

PaymentUtils.purchaseATM = function (urlDirect) {
    NativeBridge.openWebViewPayment(urlDirect);
}

PaymentUtils.onPayZalo = function (data) {
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
}