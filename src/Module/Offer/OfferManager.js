/**
 * Created by CPU02314_LOCAL on 12/17/2019.
 */

var OfferData = cc.Class.extend({
    ctor: function () {
        this.timeOffer = 3430;
        this.listBonus = [];
        this.valueOffer = 50000;
        this.typeOffer = "zing";
        this.title = "Offer";
        this.description = "Mus SMS @money de nhan thuong";
        this.typeGroupOffer = 0;
        this.eventId = "";
        this.offerId = -1;
        this.realValue = 0;
        this.isFirstPay = false;
        this.remainBuy = 0;
        this.maxBuy = 0;
        this.bonusPercentage = 0;

    },

    getTimeLeft: function () {
        var time = this.timeOffer - new Date().getTime();
        if (time <= 0) {
            //this.offerId = -1;
            return 0;
        }
        return time;
    },

    getTimeLeftInSecond: function () {
        return this.getTimeLeft() / 1000;
    },

    // chuyen tu loai Payment o Offer thanh Payment trong He thong
    convertOfferPayment: function () {
        var typeOffer = this.getLastBuy();
        //cc.log("convertOfferPayment typeOffer " + typeOffer);
        if (typeOffer == OfferManager.TYPE_IAP) {
            return Payment.GOLD_IAP;
        } else if (typeOffer == OfferManager.TYPE_SMS) {
            return Payment.GOLD_SMS;
        } else if (typeOffer == OfferManager.TYPE_ZALOPAY) {
            return Payment.GOLD_ZALO;
        } else if (typeOffer == OfferManager.TYPE_ZING) {
            return Payment.GOLD_ZING;
        } else if (typeOffer == OfferManager.TYPE_ATM) {
            return Payment.GOLD_ATM;
        }
    },

    getConfigOffer: function () {
        try {
            //  cc.log("LOAD CONFING OFFER *********************** " + this.valueOffer + " ID " + this.offerId);
            var value = this.valueOffer;
            var config = paymentMgr.getShopGoldById(this.convertOfferPayment());
            if (config) {
                for (var i = 0; i < config.numPackage; i++) {

                    var packageShop = config["packages"][i];
                    if (packageShop["value"] == value) {
                        this.configOffer = packageShop;
                        return this.configOffer;
                    }
                }
            }
        } catch (ex) {
            cc.log("JFKLDSJFDKL: ERROR " + ex.stack);
        }
        return null;
    },

    getValueToBuy: function () {
        if (this.isNoPrice()) {
            var idPayment = this.typeOffer;
            if (this.isNoPaymentType()) {
                idPayment = this.getLastBuy();
            }
            var config = paymentMgr.getShopGoldById(this.convertOfferPayment(idPayment));
            for (var i = 0; i < config.numPackage; i++) {
                var packageShop = config["packages"][i];
                if (packageShop["value"] >= this.valueOffer) {
                    if (idPayment == OfferManager.TYPE_IAP) {
                        if (iapHandler.isActiveIapPakage(packageShop["value"])) {
                            return packageShop["value"];
                        }
                    }
                    else {
                        return packageShop["value"];
                    }
                }
            }
        }
        else {
            if (this.typeGroupOffer == OfferManager.TYPE_GROUP_PROMO) {
                // rieng promo loai nay phai dao nguoc gia tri goi mua, goi mua thuc chat lai la realValue, do ben tren da doi 2 gia tri de xu ly chung 1 Flow duoi Client
                return this.realValue;
            }
            else {
                return this.valueOffer;
            }
        }
    },

    getValueToShow: function () {
        if (this.isNoPaymentType()) {
            return this.getValueToBuy();
        }
        else {
            if (this.typeGroupOffer == OfferManager.TYPE_GROUP_ZALO || this.typeGroupOffer == OfferManager.TYPE_GROUP_PROMO) {
                return this.realValue;
            }
            else {
                return this.valueOffer;
            }
        }
    },

    getPaymentString: function () {
        if (this.typeOffer == OfferManager.TYPE_ATM) {
            return "ATM";
        }
        else if (this.typeOffer == OfferManager.TYPE_ZALOPAY) {
            return "ZaloPay";
        }
        else if (this.typeOffer == OfferManager.TYPE_ZING) {
            return "Zing";
        }
        else if (this.typeOffer == OfferManager.TYPE_IAP) {
            return "IAP";
        }
        else if (this.typeOffer == OfferManager.TYPE_G) {
            return "G";
        }
        else if (this.typeOffer == OfferManager.TYPE_SMS) {
            return "SMS";
        }
        return "";
    },

    getResourceTypePayment: function () {
        var resource = "";
        switch (this.typeOffer) {
            case OfferManager.TYPE_ATM:
                resource = "Lobby/Offer/iconATM.png";
                break;
            case OfferManager.TYPE_SMS:
                resource = "Lobby/Offer/iconSMS.png";
                break;
            case OfferManager.TYPE_ZALOPAY:
                resource = "Lobby/Offer/iconZaloPay.png";
                break;
            case OfferManager.TYPE_ZING:
                resource = "Lobby/Offer/iconZing.png";
                break;
            case OfferManager.TYPE_IAP:
                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    resource = "Lobby/Offer/iconGoogle.png";
                } else {
                    resource = "Lobby/Offer/iconApple.png";
                }
                break;
        }
        return resource;
    },

    // trar ve Id Payment Offer se dung de mua Offer, la loai Payment lan mua cuoi cung cua User
    // Neu GUI Offer mo ra tu Shop, thi loai Payment dung de mua la Payment hien tai trong Shop duoc luu o offerManager.selectIdPayment
    getLastBuy: function () {
        if (!this.isNoPaymentType())
            return this.typeOffer;
        var id = paymentMgr.getLastShopGoldId();
        cc.log("getLastBuy getLastShopGoldId " + id);
        cc.log("getLastBuy offerManager.selectIdPayment " + offerManager.selectIdPayment);
        if (offerManager.selectIdPayment > 0)
            id = offerManager.selectIdPayment;
        else if (id == Payment.GOLD_G) {
            id = Payment.GOLD_SMS;
        }
        cc.log("getLastBuy Select " + id + " " + this.convertIdPaymentToOfferPayment(id));
        return this.convertIdPaymentToOfferPayment(id);
    },

    // chuyen ID Payment trong he thong Shop thanh ID payment trong Offer ( 1-> SmS)
    convertIdPaymentToOfferPayment: function (id) {
        switch (id) {
            case Payment.GOLD_ATM:
                return OfferManager.TYPE_ATM;
                break;
            case Payment.GOLD_IAP:
                return OfferManager.TYPE_IAP;
                break;
            case Payment.GOLD_ZALO:
                return OfferManager.TYPE_ZALOPAY;
                break;
            case Payment.GOLD_ZING:
                return OfferManager.TYPE_ZING;
                break;
            case Payment.GOLD_SMS:
            case Payment.GOLD_SMS_VIETTEL:
            case Payment.GOLD_SMS_MOBI:
            case Payment.GOLD_SMS_VINA:
                return OfferManager.TYPE_SMS;
                break;
            case Payment.GOLD_G:
                return OfferManager.TYPE_G;
                break;
        }
    },

    isNoPrice: function () {
        return this.typeGroupOffer == OfferManager.TYPE_GROUP_NO_FIX_PRICE;
    },

    isNoPaymentType: function () {
        return this.typeOffer == OfferManager.TYPE_ALL;
    },

    isSuitableForNoPrice: function (idPayment, value) {
        if (!this.isNoPrice())
            return false;
        if (!this.isNoPaymentType()) {
            if (this.convertOfferPayment() != idPayment)
                return false;
        }
        if (idPayment == Payment.GOLD_IAP) {
            if (value >= this.valueOffer && iapHandler.isActiveIapPakage(value)) {
                return true;
            }
            return false;
        }
        else {
            return value >= this.valueOffer;
        }
    },

});

var OfferManager = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.kickInGame = false;
        this.arrayOffer = [];
        this.selectIdPayment = -1; // id Payemnt khi mo Offer trong Shop
        this.showWhenLogin = false;
    },

    resetData: function () {
        cc.log("Reset Data " + this.arrayOffer.length);
        for (var i = 0; i < this.arrayOffer.length; i++) {
            this.hideOfferInLobby(this.arrayOffer[i]);
        }
        this.arrayOffer = [];
        this.selectIdPayment = -1;
        this.showWhenLogin = false;
    },

    hideOfferInLobby: function (offerData) {
        var btn = LobbyButtonManager.getInstance().getButton(offerData.offerId, LobbyButtonManager.TYPE_OFFER);
        if (btn) {
            btn.setVisible(false);
        }
    },

    update: function (dt) {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            var offerData = this.arrayOffer[i];
            var btn = LobbyButtonManager.getInstance().getButton(offerData.offerId, LobbyButtonManager.TYPE_OFFER);
            if (offerData.getTimeLeft() <= 0) {
                if (btn) {
                    btn.setVisible(false);
                }
                this.arrayOffer.splice(i - 1);
                i = i - 1;
            }
            else {
                if (!btn) {
                    btn = new OfferButton();
                    btn.retain();
                    LobbyButtonManager.getInstance().addButton(btn, offerData.offerId, LobbyButtonManager.TYPE_OFFER);
                    btn.setInfo(offerData);
                }
                btn.setVisible(true);
                btn.updateOffer();
            }
        }
    },

    isOfferIAP: function () {
        var isOffer = cc.sys.localStorage.getItem(OfferManager.IAP_OFFER_CACHE);
        if (!isOffer || isOffer === undefined) {
            isOffer = 0;
        }
        return parseInt(isOffer);
    },

    setOfferIAP: function (isOffer) {
        cc.sys.localStorage.setItem(OfferManager.IAP_OFFER_CACHE, isOffer);
    },

    haveOffer: function () {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].getTimeLeft() > 0) {
                return true;
            }
        }
        return false;
    },

    haveOneOfferById: function (offerId) {
        var offer = this.getOfferById(offerId);
        if (offer == null)
            return false;
        return offer.getTimeLeft() > 0;
    },

    getOfferByGroup: function (typeGroupOffer) {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].typeGroupOffer == typeGroupOffer)
                return this.arrayOffer[i];
        }
        return null;
    },

    getOfferById: function (offerId) {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].offerId == offerId)
                return this.arrayOffer[i];
        }
        return null;
    },

    getPercentSale: function (offerId, typeOfferBonus, value, eventId) {
        // cc.log("TYPE NE ***** " + typeOfferBonus);
        var oldValue = 0;
        var percent = 0;
        var offer = this.getOfferById(offerId);
        cc.log("OFFER NE " + JSON.stringify(offer) + " TYPE OFFER BONUS " + typeOfferBonus);
        cc.log(" CONFIG OFFER " + JSON.stringify(offer.configOffer));
        var configOffer = offer.getConfigOffer();
        if (configOffer) {
            switch (typeOfferBonus) {
                case OfferManager.TYPE_GOLD:
                    oldValue = configOffer["gold"];
                    cc.log("OLD VALUE la " + oldValue);
                    break;
                case OfferManager.TYPE_G_STAR:
                    oldValue = configOffer["vPoint"];
                    break;
                case OfferManager.TYPE_TIME:
                    oldValue = configOffer["hourBonus"];
                    break;
                case OfferManager.TYPE_TICKET:
                    cc.log("GET PERCENT TICKET " + offer.typeOffer + " " + eventId);
                    var config = event.getEventTicketConfig(offer.convertOfferPayment(), eventId);
                    cc.log("CONFIG TICKET " + JSON.stringify(config));
                    //var convert = this.valueOffer / 100;
                    if (config && config != null && config != undefined)
                        oldValue = config[offer.valueOffer];
                    else
                        oldValue = 0; // khong lay duoc config ve -> gan gia tri lon de coi nhu khong co khuyen mai
                    break;
                case OfferManager.TYPE_DIAMOND:
                    oldValue = 0;
                    break;
            }
            if (oldValue > 0)
                percent = Math.floor(value / oldValue * 100 - 100);
            else percent = 0;
        }
        // cc.log("PERCENT SALE **** " + percent);
        return percent;
    },

    checkHaveOfferPayment: function (id) {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            var idPayment = this.arrayOffer[i].convertOfferPayment();
            if (idPayment == Payment.GOLD_SMS_VIETTEL)
                idPayment = Payment.GOLD_SMS;
            if (idPayment == id) {
                return true;
            }
        }
        return false;
    },

    isSuitableForNoPrice: function (idPayment, value) {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].isSuitableForNoPrice(idPayment, value)) {
                return true;
            }
        }
        return false;
    },

    reloadOffer: function () {
        if (this.arrayOffer.length == 0)
            return;
        if (paymentMgr.payments.length == 0)
            return;
        if (!paymentMgr.cmdShopConfig) {
            return;
        }
        for (var i = 0; i < this.arrayOffer.length; i++) {
            var offer = this.arrayOffer[i];
            var saveOfferId = offer.offerId;
            var cmdLog = new CmdSendLogOffer();
            var config;
            if (offer.typeOffer == OfferManager.TYPE_ALL) {
                continue;
            }
            cc.log("convertOfferPayment " + offer.convertOfferPayment());
            config = paymentMgr.getShopGoldById(offer.convertOfferPayment());
            cc.log("CONFIG SHOP " + JSON.stringify(config));
            if (!config || config["isMaintained"][0]) {
                offer.offerId = -1;
                cc.log("VOD DAY *** ");
                // detect reason
                if (offer.typeOffer == OfferManager.TYPE_IAP) {
                    if (!cc.sys.isNative) {
                        cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_WEB);
                    } else if (cc.sys.os == cc.sys.OS_IOS) {
                        cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_IOS);
                    } else {
                        cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_ENABLE_PAYMENT);
                    }
                } else {
                    cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_ENABLE_PAYMENT);
                }
            } else if (offer.typeOffer == OfferManager.TYPE_IAP) {
                if (!cc.sys.isNative) {
                    offer.offerId = -1;
                    cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_WEB);
                } else if (cc.sys.os == cc.sys.OS_IOS) {
                    offer.offerId = -1;
                    cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_IOS);
                }
                else {
                    // kiem tra xem co goi IAP nao dang duoc Active khong
                    var isExist = false;
                    if (offer.isNoPrice()) {
                        for (var j = 0; j < config.numPackage; j++) {
                            var packageShop = config["packages"][j];
                            if (packageShop["value"] >= offer.valueOffer && iapHandler.isActiveIapPakage(packageShop["value"])) {
                                isExist = true;
                                cmdLog.putData(saveOfferId, OfferManager.SHOW_BUTTON);
                                break;
                            }
                        }
                        if (!isExist) {
                            offer.offerId = -1;
                            cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_IOS);
                        }
                    }
                    else {
                        cmdLog.putData(saveOfferId, OfferManager.SHOW_BUTTON);
                    }
                }
            } else {
                cmdLog.putData(saveOfferId, OfferManager.SHOW_BUTTON);
            }
            GameClient.getInstance().sendPacket(cmdLog);
        }
        this.removeOfferNotAvailable();
    },

    removeOfferNotAvailable: function () {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].offerId < 0) {
                this.hideOfferInLobby(this.arrayOffer[i]);
                this.arrayOffer.splice(i, 1);
                i--;
            }
        }
    },

    showOfferGUIKick: function () {
        if (!this.haveOffer()) {
            return;
        }
        if (this.kickInGame) {
            this.showOfferGUI(true, this.arrayOffer[0]);
        }
        this.kickInGame = false;
    },

    showOfferGUILogin: function () {
        cc.log("showOfferGUILogin **** ");

        if (this.showWhenLogin)
            return;
        if (!this.haveOffer()) {
            return;
        }
        cc.log("showOfferGUILogin **** 1");
        this.autoShow();
    },

    autoShow: function () {
        this.showWhenLogin = true;
        var cur = sceneMgr.getRunningScene().getMainLayer();
        if (cur instanceof LobbyScene) {
            // var random = Math.floor(Math.random() * this.arrayOffer.length * 0.999);
            // this.showOfferGUI(true, this.arrayOffer[random]);
            var show = this.showOfferPrioriy(OfferManager.TYPE_GROUP_ZALO);
            if (!show) {
                show = this.showOfferPrioriy(OfferManager.TYPE_GROUP_PROMO);
            }
            if (!show) {
                show = this.showOfferPrioriy(OfferManager.TYPE_GROUP_NO_FIX_PRICE);
            }
            if (!show) {
                show = this.showOfferPrioriy(OfferManager.TYPE_GROUP_NORMAL);
            }
        }
    },

    showOfferPrioriy: function (type) {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].typeGroupOffer == type) {
                this.showOfferGUI(true, this.arrayOffer[i]);
                return true;
            }
        }
        return false;
    },

    showOfferNoPriceGUI: function (idPayment) {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].isNoPrice()) {
                this.showOfferGUI(true, this.arrayOffer[i]);
                break;
            }
        }
        this.selectIdPayment = idPayment;
    },

    showOfferGUI: function (forceShow, offer) {
        var show = false;
        if (forceShow) {
            show = true;
        }

        if (show) {
            var idPopUp = PopUpManager.OFFER;
            if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_NORMAL) {
                idPopUp = PopUpManager.OFFER;
            }
            else {
                idPopUp = PopUpManager.OFFER_ZALO;
            }
            if (popUpManager.canShow(idPopUp)) {
                cc.log("SHOW OFFER GUI ");
                var cmdLog = new CmdSendLogOffer();
                cmdLog.putData(offer.offerId, OfferManager.SHOW_POP_UP);
                GameClient.getInstance().sendPacket(cmdLog);

                var gui;
                if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_NORMAL) {
                    if (offer.offerId == 173 || offer.offerId == 174 || offer.offerId == 175 || offer.offerId == 176) {
                        gui = sceneMgr.openGUI(GUIOfferQuocKhanh.className, GUIOfferQuocKhanh.tag, GUIOfferQuocKhanh.tag);
                        gui.setInfo(offer);
                    }
                    else {
                        gui = sceneMgr.openGUI(GUIOffer.className, GUIOffer.tag, GUIOffer.tag);
                        gui.setInfo(offer);
                    }
                }
                else if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_ZALO) {
                    if (offer.isFirstPay) {
                        gui = sceneMgr.openGUI(GUIOfferZaloFirstPay.className, GUIOfferZaloFirstPay.tag, GUIOfferZaloFirstPay.tag);
                        gui.setInfo(offer);
                    }
                    else {
                        gui = sceneMgr.openGUI(GUIOfferZaloRepay.className, GUIOfferZaloRepay.tag, GUIOfferZaloRepay.tag);
                        gui.setInfo(offer);
                    }
                }
                else if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_NO_FIX_PRICE) {
                    gui = sceneMgr.openGUI(GUIOfferNoPrice.className, GUIOfferNoPrice.tag, GUIOfferNoPrice.tag);
                    gui.setInfo(offer);
                }
                else {
                    if (offer.isFirstPay) {
                        gui = sceneMgr.openGUI(GUIOfferZaloFirstPay.className, GUIOfferZaloFirstPay.tag, GUIOfferZaloFirstPay.tag);
                        gui.setInfo(offer);
                    }
                    else {
                        gui = sceneMgr.openGUI(GUIOfferRepay.className, GUIOfferRepay.tag, GUIOfferRepay.tag);
                        gui.setInfo(offer);
                    }
                }
            }
        }
        this.selectIdPayment = -1;
    },

    onReceived: function (cmd, data) {
        //return;
        switch (cmd) {
            case OfferManager.CMD_NOTIFY_OFFER:
                this.resetData();
                var cmd = new CmdReceivedNotifyOffer(data);
                cc.log("CMD_NOTIFY_OFFER " + JSON.stringify(cmd));
                for (var i = 0; i < cmd.offerId.length; i++) {
                    var offer = new OfferData();
                    offer.typeOffer = cmd.paymentChannel[i];
                    offer.offerId = cmd.offerId[i];
                    offer.timeOffer = cmd.remainedTime[i] + new Date().getTime();
                    offer.valueOffer = parseInt(cmd.value[i]);
                    offer.title = cmd.title[i];
                    offer.description = cmd.description[i];
                    offer.realValue = cmd.realValue[i];
                    offer.typeGroupOffer = cmd.typeGroupOffer[i];
                    offer.isFirstPay = cmd.isFirstPay[i];
                    offer.remainBuy = cmd.remainBuy[i];
                    offer.maxBuy = cmd.maxBuy[i];
                    var cheat = false;
                    if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_PROMO) {
                        // vai tro cua realValue va value trong Offer nay lai nguoc voi ZaloPay -> Dao vai tro lai
                        var temp = offer.valueOffer;
                        offer.valueOffer = offer.realValue;
                        offer.realValue = temp;
                    }
                    //cheat = true;

                    if (cheat) {
                        offer.offerId = 4;
                        offer.typeOffer = OfferManager.TYPE_ATM;
                        offer.timeOffer = 10000 + new Date().getTime();
                        cmd.bonusGold = 200000000;
                        cmd.bonusGStar = 1000;
                        offer.valueOffer = 50000;
                        offer.description = "khi nao can mua ao giap sat";
                    }

                    if (cmd.bonusGold[i] > 0) {
                        var obj = {"type": OfferManager.TYPE_GOLD, "value": cmd.bonusGold[i]};
                        offer.listBonus.push(obj);
                    }
                    if (cmd.bonusGStar[i] > 0) {
                        var obj = {"type": OfferManager.TYPE_G_STAR, "value": cmd.bonusGStar[i]};
                        offer.listBonus.push(obj);
                    }
                    if (cmd.offerEvent[i] && cmd.offerEvent[i].length > 0) {
                        for (var j = 0; j < cmd.offerEvent[i].length; j++) {
                            var tmp = cmd.offerEvent[i][j];
                            var eventId = eventMgr.getEventIdByName(tmp["eventName"]);
                            var obj = {
                                "type": OfferManager.TYPE_TICKET,
                                "eventId": tmp["eventName"],
                                "value": tmp['ticket']
                            };
                            if (tmp["ticket"] > 0)
                                offer.listBonus.push(obj);
                        }
                    }
                    if (cmd.bonusTime[i] > 0) {
                        var obj = {"type": OfferManager.TYPE_TIME, "value": cmd.bonusTime[i]};
                        offer.listBonus.push(obj);
                    }
                    if (cmd.diamond[i] > 0) {
                        var obj = {"type": OfferManager.TYPE_DIAMOND, "value": cmd.diamond[i]};
                        offer.listBonus.push(obj);
                    }
                    if (cmd.offerItem && cmd.offerItem[i] && cmd.offerItem[i].length > 0) {
                        for (var j = 0; j < cmd.offerItem[i].length; j++) {
                            var tmp = cmd.offerItem[i][j];
                            var eventId = eventMgr.getEventIdByName(tmp["eventName"]);
                            var obj = {
                                "type": OfferManager.TYPE_ITEM,
                                "idType": tmp["type"],
                                "subType": tmp["subType"],
                                "id": tmp["id"],
                                "value": tmp['number']
                            };
                            offer.listBonus.push(obj);
                        }
                    }
                    offer.bonusPercentage = cmd.bonusPercentage[i];
                    // net khong co bonus nao thi coi nhu khong co Offer
                    if (offer.listBonus.length != 0) {
                        this.arrayOffer.push(offer);
                    }
                }

                cc.log("ARRAY OFFER TRUOC KHI RELOAD " + JSON.stringify(this.arrayOffer));
                this.reloadOffer();
                cc.log("ARRAY OFFER SAU KHI RELOAD " + this.arrayOffer.length + " " + JSON.stringify(this.arrayOffer));

                var cur = sceneMgr.getRunningScene().getMainLayer();
                if (cur instanceof LobbyScene && !offerManager.buySuccess) {
                    // show Offer gui sau khi login
                   offerManager.autoShow();
                }
                offerManager.buySuccess = false;
                break;
            case OfferManager.CMD_OFFER_SUCCESS:
                var cmd = new CmdReceivedOfferSuccess(data);
                VipManager.getInstance().setWaiting(true);
                cc.log("CMD_OFFER_SUCCESS" + JSON.stringify(cmd));
                offerManager.buySuccess = true;
        }
    }
});

OfferManager.getNameItem = function (idType, id, subType, num) {
    if (idType == StorageManager.TYPE_AVATAR || idType == StorageManager.TYPE_EMOTICON) {
        var config = StorageManager.getInstance().itemConfig;
        var expireTime = config[idType][id]["subTypes"][subType].expireTime;
        if (expireTime < 0) {
            return localized("TIME_FOREVER");
        }
        else {
            return expireTime + " " + localized("TIME_DAY");
        }
    }
    else {
        return num + " " + localized("SHOP_GOLD_ITEM");
    }
}

OfferManager.getValueOfferToBuy = function (offer) {
    if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_PROMO) {
        // rieng promo loai nay phai dao nguoc gia tri goi mua, goi mua thuc chat lai la realValue, do ben tren da doi 2 gia tri de xu ly chung 1 Flow duoi Client
        return offer.realValue;
    }
    else {
        return offer.valueOffer;
    }
};

OfferManager.buyOffer = function (isInShop, offerId) {
    var offer = offerManager.getOfferById(offerId);
    if (!offerManager.haveOneOfferById(offerId)) {
        var msg = LocalizedString.to("OFFER_ERROR_1");

        if (offer.getTimeLeft() <= 0) {
            msg = LocalizedString.to("OFFER_ERROR_2");
        }
        sceneMgr.showOKDialog(msg);
        return;
    }
    var typeOffer = offer.getLastBuy();

    cc.log("TYPE OFER ** " + typeOffer);
    if (typeOffer == OfferManager.TYPE_SMS) {
        var networkInfo = paymentMgr.getNetworkTelephone();
        var operator = 0;
        var configSMS;
        var type = 0;
        switch (networkInfo) {
            case Constant.ID_VIETTEL: {
                operator = PanelCard.BTN_VIETTEL;
                configSMS = paymentMgr.getShopGoldById(Payment.GOLD_SMS_VIETTEL);
                type = Payment.GOLD_SMS_VIETTEL;
                break;
            }
            case Constant.ID_MOBIFONE: {
                operator = PanelCard.BTN_MOBIFONE;
                configSMS = paymentMgr.getShopGoldById(Payment.GOLD_SMS_MOBI);
                type = Payment.GOLD_SMS_MOBI;
                break;
            }
            case Constant.ID_VINAPHONE: {
                operator = PanelCard.BTN_VINAPHONE;
                configSMS = paymentMgr.getShopGoldById(Payment.GOLD_SMS_VINA);
                type = Payment.GOLD_SMS_VINA;
                break;
            }
            default : {
                operator = 0;
                break;
            }
        }
        cc.log("OFFER iS NO PRICE **** " + offer.isNoPrice());
        if (operator == 0) {
            if (offer.isNoPrice())
                sceneMgr.openGUI(SimOperatorPopup.className, SimOperatorPopup.TAG, SimOperatorPopup.TAG).setAmount(offer.getValueToBuy(), Payment.CHEAT_PAYMENT_NORMAL);
            else
                sceneMgr.openGUI(SimOperatorPopup.className, SimOperatorPopup.TAG, SimOperatorPopup.TAG).setAmount(offer.getValueToBuy(), Payment.CHEAT_PAYMENT_OFFER);
        } else {
            //var configSMS = paymentMgr.getShopGoldById(Payment.GOLD_SMS);
            if (!configSMS || configSMS["isMaintained"][0]) {
                sceneMgr.openGUI(GUIMaintainSMS.className, GUIMaintainSMS.TAG, GUIMaintainSMS.TAG);
            } else {
                if (offer.isNoPrice())
                    PaymentUtils.requestSMSSyntax(operator, offer.getValueToBuy(), Payment.CHEAT_PAYMENT_NORMAL, type, Payment.NO_OFFER);
                else
                    PaymentUtils.requestSMSSyntax(operator, offer.getValueToBuy(), Payment.CHEAT_PAYMENT_OFFER, type, Payment.IS_OFFER);
            }
        }
    } else if (typeOffer == OfferManager.TYPE_ATM) {
        if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
            if (offer.isNoPrice())
                PaymentUtils.fakePayment(offer.getValueToBuy(), Constant.GOLD_ATM, Payment.CHEAT_PAYMENT_NORMAL);
            else
                PaymentUtils.fakePayment(offer.getValueToBuy(), Constant.GOLD_ATM, Payment.CHEAT_PAYMENT_OFFER);
        } else {
            var gui = sceneMgr.openGUI(GUIBank.className, GUIBank.TAG, GUIBank.TAG);
            if (offer.isNoPrice())
                gui.setInfoBuy(offer.getValueToBuy(), true, Payment.NO_OFFER);
            else
                gui.setInfoBuy(offer.getValueToBuy(), true, Payment.IS_OFFER);
        }
    } else if (typeOffer == OfferManager.TYPE_ZALOPAY) {
        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.BEGIN + "BUY_ZALO");
        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "CLICK_OFFER");
        if (Config.ENABLE_NEW_OFFER) {
            if (CheckLogic.checkZaloPay()) {
                var curGui = sceneMgr.getRunningScene().getMainLayer();
                var msg = LocalizedString.to("ZALOPAY_MSG");
                msg = StringUtility.replaceAll(msg, "@value", StringUtility.pointNumber(offer.getValueToShow(offer)));
                sceneMgr.showOkCancelDialog(msg, curGui, function (btnId) {
                    if (btnId == Dialog.BTN_OK) {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "SEND_BUY");
                        var packageName = fr.platformWrapper.getPackageName();
                        if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
                            if (offer.isNoPrice())
                                PaymentUtils.fakePayment(offer.getValueToBuy(), Constant.GOLD_ZALO, Payment.CHEAT_PAYMENT_NORMAL);
                            else
                                PaymentUtils.fakePayment(offer.getValueToBuy(), Constant.GOLD_ZALO, Payment.CHEAT_PAYMENT_OFFER);
                        }
                        else {
                            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(5);
                            var cmd = new CmdSendBuyZaloPayV2();
                            if (offer.isNoPrice())
                                cmd.putData(offer.getValueToBuy(), 1, Payment.NO_OFFER, offer.offerId, packageName);
                            else
                                cmd.putData(offer.getValueToBuy(), 1, Payment.IS_OFFER, offer.offerId, packageName);
                            GameClient.getInstance().sendPacket(cmd);
                            cmd.clean();
                            paymentMgr.zalopayPackValue = offer.getValueToBuy();
                        }
                    }
                });
            }
        }
        else {
            if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                PaymentUtils.fakePayment(OfferManager.getValueOfferToBuy(offer), Constant.GOLD_ZALO, Payment.CHEAT_PAYMENT_OFFER);
            }
            else {
                sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                var cmd = new CmdSendBuyGZalo();
                cmd.putData(OfferManager.getValueOfferToBuy(offer), 1, Payment.IS_OFFER);
                GameClient.getInstance().sendPacket(cmd);
            }
        }
    } else if (typeOffer == OfferManager.TYPE_ZING) {
        if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
            if (offer.isNoPrice())
                PaymentUtils.fakePayment(offer.getValueToBuy(), Constant.GOLD_ZING, Payment.CHEAT_PAYMENT_NORMAL);
            else
                PaymentUtils.fakePayment(offer.getValueToBuy(), Constant.GOLD_ZING, Payment.CHEAT_PAYMENT_OFFER);
        } else {
            var gui = sceneMgr.openGUI(GUIInputCard.className, GUIInputCard.TAG, GUIInputCard.TAG);
            if (offer.isNoPrice())
                gui.setInfo(offer.getValueToBuy(), Payment.NO_OFFER);
            else
                gui.setInfo(offer.getValueToBuy(), Payment.IS_OFFER);
        }
    } else if (typeOffer == OfferManager.TYPE_IAP) {
        var goldIap = paymentMgr.getShopGoldById(Payment.GOLD_IAP);
        var obj = {};
        if (goldIap) {
            for (var i = 0; i < goldIap.numPackage; i++) {

                var packageShop = goldIap["packages"][i];
                if (packageShop["value"] == offer.getValueToBuy()) {
                    obj.id = packageShop["androidId"];
                    obj.id_ios = packageShop["iOSId"];
                    obj.id_ios_portal = packageShop["portalIOSId"];
                    obj.id_portal = packageShop["portalAndroidId"];
                    obj.id_multi_portal = packageShop["id_gg_portal"];
                    obj.id_multi_ios_portal = packageShop["id_ios_portal"];
                    obj.cost = iapHandler.getProductPrice(obj.id, obj.id_ios, packageShop["value"]);
                    obj.costConfig = packageShop["value"];
                }
            }
        }
        if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
            if (offer.isNoPrice())
                PaymentUtils.fakePayment(obj.costConfig, Constant.GOLD_IAP, Payment.CHEAT_PAYMENT_NORMAL);
            else
                PaymentUtils.fakePayment(obj.costConfig, Constant.GOLD_IAP, Payment.CHEAT_PAYMENT_OFFER);
        } else {
            if (offer.isNoPrice())
                offerManager.setOfferIAP(0);
            else
                offerManager.setOfferIAP(1);
            iapHandler.purchaseItem(iapHandler.getProductIdIAP(obj));
        }
    }
    popUpManager.removePopUp(PopUpManager.OFFER);
};

OfferManager.TYPE_GOLD = 0;
OfferManager.TYPE_G_STAR = 1;
OfferManager.TYPE_VIP = 2;
OfferManager.TYPE_TICKET = 3;
OfferManager.TYPE_TIME = 4;
OfferManager.TYPE_DIAMOND = 5;
OfferManager.TYPE_ITEM = 6;

OfferManager.TYPE_SMS = "sms";
OfferManager.TYPE_IAP = "iap";
OfferManager.TYPE_ZING = "zing";
OfferManager.TYPE_ATM = "atm";
OfferManager.TYPE_ZALOPAY = "zalopay";
OfferManager.TYPE_ALL = "all";

OfferManager.TYPE_GROUP_NORMAL = 0;
OfferManager.TYPE_GROUP_ZALO = 1;
OfferManager.TYPE_GROUP_PROMO = 2;
OfferManager.TYPE_GROUP_NO_FIX_PRICE = 3;

OfferManager.NOT_SHOW_WEB = 2;
OfferManager.NOT_SHOW_ENABLE_PAYMENT = 3;
OfferManager.NOT_SHOW_IOS = 4;
OfferManager.SHOW_BUTTON = 0;
OfferManager.SHOW_POP_UP = 1;

OfferManager.CMD_NOTIFY_OFFER = 8934;
OfferManager.CMD_OFFER_SUCCESS = 8932;
OfferManager.CMD_LOG_OFFER = 8933;
OfferManager.CMD_RESET_OFFER_ZALO = 8013;

OfferManager.IAP_OFFER_CACHE = "iapOffer";

OfferManager.isInited = false;
OfferManager.instance = null;
OfferManager.getInstance = function () {
    if (OfferManager.isInited == false) {
        OfferManager.isInited = true;
        OfferManager.instance = new OfferManager();
    }
    return OfferManager.instance;
};

var offerManager = OfferManager.getInstance();