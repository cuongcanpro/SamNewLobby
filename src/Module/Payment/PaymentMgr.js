var PaymentMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.payments = [];
        this.arrayShopGConfig = [];
        this.arrayShopGoldConfig = [];
        this.buyGoldCount = 0;
    },

    init: function () {
        dispatcherMgr.addListener(UserMgr.EVENT_ON_GET_USER_INFO, this, this.onGetUserInfo);
        dispatcherMgr.addListener(LobbyMgr.EVENT_ON_ENTER_FINISH, this, this.onEnterLobby);
        dispatcherMgr.addListener(UserMgr.EVENT_UPDATE_MONEY, this, this.updateMoney);
    },

    updateMoney: function () {
        var shop = sceneMgr.getMainLayer();
        if (shop instanceof ShopIapScene) {
            shop.updateToCurrentData();
        }
    },

    onGetUserInfo: function (eventName, eventData) {
        this.setRefundInfo(eventData);
        cc.log("SEND FROM on GET USER INFO");
        this.sendUpdateBuyGold();
    },

    onEnterLobby: function () {
        this.openIAP();
        this.checkShowSystemBonus();
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case PaymentMgr.CMD_GET_CONFIG_SHOP: {
                var cmdGetConfigShop = new CmdReceivedConfigShop(pk);
                this.saveConfigShop(cmdGetConfigShop);
                cmdGetConfigShop.clean();
                return true;
            }
            case PaymentMgr.CMD_UPDATE_ENABLE_PAYMENT: {
                var uep = new CmdReceivedNewUpdateEnablePayment(pk);
                cc.log("CMD_UPDATE_ENABLE_PAYMENT: ", JSON.stringify(uep));
                if (Config.ENABLE_SERVICE_ENABLE_PAYMENT) {
                    this.loadPayment(uep.payments);
                    this.parseShopConfig();
                }
                return true;
            }
            case PaymentMgr.CMD_UPDATE_BUYGOLD: {
                this.updateBuyGold(pk);
                return true;
            }
            case PaymentMgr.CMD_BUY_GOLD: {
                var cBGold = new CmdReceiveBuyGold(pk);
                if (cBGold.error != 0) {
                    sceneMgr.showOKDialog(LocalizedString.to("CHANGE_GOLD_FAIL"));
                }
                cBGold.clean();
                break;
            }
            case PaymentMgr.CMD_UPDATE_COIN: {
                var pk = new CmdReceivedUpdateCoin(pk);
                userMgr.getUserInfo().setCoin(pk.coin);
                Toast.makeToast(Toast.SHORT, LocalizedString.to("NAP_G_SUCCESS"));
                sceneMgr.updateCurrentGUI();
                pk.clean();

                PaymentUtils.onUpdateMoney();
                break;
            }
            case PaymentMgr.CMD_SHOP_GOLD_SUCCESS: {
                WaitingPopup.clear();
                sceneMgr.clearLoading();

                var cmd = new CmdReceivedShopGoldSuccess(pk);
                cc.log("CMD_SHOP_GOLD_SUCCESS", JSON.stringify(cmd));

                // var cmdSend = new CmdSendShopGoldSuccess();
                // cmdSend.putData(cmd.purchaseId[0]);
                // GameClient.getInstance().sendPacket(cmdSend);
                // cmdSend.clean();

                // var gui = sceneMgr.getGUIByClassName(GUIShopGoldSuccess.className);
                // if (gui && gui.isShow) {
                //     cc.log("is SHOW " + gui.isShow + " " + gui.isVisible());
                //     gui.setInfo(cmd, false);
                // }
                // else {
                //     gui = sceneMgr.openGUI(GUIShopGoldSuccess.className, GUIShopGoldSuccess.TAG, GUIShopGoldSuccess.TAG);
                //     gui.setInfo(cmd, true);
                // }
                dispatcherMgr.dispatchEvent(PaymentMgr.EVENT_SHOP_GOLD_SUCCESS, cmd);
                break;
            }
            case PaymentMgr.CMD_SHOP_GOLD: {
                var cSG = new CmdReceiveShopGold(pk);
                if (cSG.isOffer)
                    return;
                if (cSG.error == 0) {

                }
                else {
                    sceneMgr.showOKDialog(LocalizedString.to("CHANGE_GOLD_FAIL"));
                }
                return;
                var isChangeGoldSuccess = false;
                if (cSG.error == 0) {
                    if (Config.ENABLE_IAP_REFUND) {
                        if (iapHandler.waitIAP) {
                            // khong hien thi gui doi G
                        } else {
                            // sceneMgr.showOKDialog(LocalizedString.to("CHANGE_GOLD_SUCCESS"));

                            isChangeGoldSuccess = true;
                        }
                    } else {
                        isChangeGoldSuccess = true;

                        var gui = sceneMgr.getGUIByClassName(GUIInputCard.className);
                        if (gui && gui.isVisible()) {
                            gui.onBack();
                        }
                    }

                    if (isChangeGoldSuccess) {
                        VipManager.openChangeGoldSuccess(cSG);
                    }
                    if (cSG.channel == dailyPurchaseManager.getPromoChannel()){
                        if (cSG.packetId == dailyPurchaseManager.getPromoPackage())
                            fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_buy_promo_package");
                        else
                            fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_buy_promo_channel");
                    }
                    else fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "buy_gold");
                } else {
                    sceneMgr.showOKDialog(LocalizedString.to("CHANGE_GOLD_FAIL"));
                }
                cSG.clean();
                break;
            }
            case PaymentMgr.CMD_PURCHASE_CARD: {
                var rPCard = new CmdReceivePurchaseCard(pk);
                cc.log("CMD_PURCHASE_CARD " + JSON.stringify(rPCard));
                rPCard.clean();

                PaymentUtils.responsePurchaseCard(rPCard);
                break;
            }
            case PaymentMgr.CMD_PURCHASE_SMS: {
                var rPSMS = new CmdReceivePurchaseSMS(pk);
                rPSMS.clean();
                cc.log("CMD_PURCHASE_SMS " + JSON.stringify(rPSMS));
                PaymentUtils.purchaseSMS(rPSMS);
                break;
            }
            case PaymentMgr.CMD_PURCHASE_IAP_GOOGLE: {
                var rIapGoogle = new CmdReceivePurchaseIAPGoogle(pk);
                rIapGoogle.clean();

                iapHandler.onResponseIapGoogle(rIapGoogle);
                break;
            }
            case PaymentMgr.CMD_PURCHASE_IAP_APPLE: {
                var rIapGoogle = new CmdReceivePurchaseIAPApple(pk);
                rIapGoogle.clean();

                iapHandler.onResponseIapApple(rIapGoogle);
                break;
            }
            case PaymentMgr.CMD_BUY_ZALO_V2: {
                sceneMgr.clearLoading();
                var cmdBuyGZalo = new CmdReceivedBuyZaloV2(pk);
                cc.log("PACKEG " + JSON.stringify(cmdBuyGZalo));
                if (cmdBuyGZalo.errorCode == 1) {
                    if (fr.platformWrapper.isAndroid()) {
                        this.countZaloPay = 0;
                        NativeBridge.openURLNative(cmdBuyGZalo.deepLink);
                    } else {
                        //NativeBridge.openWebView(cmdBuyGZalo.qrLink, true);
                    }
                } else {
                    var str = LocalizedString.to("ZALOPAY_ERROR_" + cmdBuyGZalo.errorCode) + "\n";
                    var subErrorCode = cmdBuyGZalo.errMsg.substr(cmdBuyGZalo.errMsg.indexOf('(') + 1, 5);
                    if (subErrorCode && subErrorCode == "-1010") {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.BEGIN + "TOP_UP");
                        str += LocalizedString.to("ZALOPAY_ERROR_1010");
                        sceneMgr.showOkCancelDialog(str, this, function (btnId) {
                            switch (btnId) {
                                case Dialog.BTN_OK:
                                    if (this.zalopayPackValue > 0) {
                                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "CLICK_TOPUP");
                                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.END);
                                        var zlpLink = Config.ZALOPAY_DEEP_LINK;
                                        zlpLink = StringUtility.replaceAll(zlpLink, "@amount", this.zalopayPackValue);
                                        var packageName = fr.platformWrapper.getPackageName();
                                        if(packageName) {
                                            zlpLink = StringUtility.replaceAll(zlpLink, "@package", packageName);
                                        }
                                        cc.log("call deeplink: ", JSON.stringify(zlpLink));
                                        this.zalopayPackValue = 0;
                                        NativeBridge.openURLNative(zlpLink);
                                    }
                                    break;
                                case Dialog.BTN_CANCEL:
                                    fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "CLICK_CANCEL");
                                    fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.END);
                                    break;
                            }
                        });
                    } else if (subErrorCode && subErrorCode == "-1800") {
                        str += LocalizedString.to("ZALOPAY_POPUP_ERROR_0");
                        str += "(" + subErrorCode + ")";
                        sceneMgr.showOKDialog(str);
                    } else {
                        str = StringUtility.replaceAll(str, "@n", "\n");
                        str += cmdBuyGZalo.errMsg;
                        sceneMgr.showOKDialog(str);
                    }
                }
                break;
            }
            case PaymentMgr.CMD_IAP_PURCHASE_RESPONSE: {
                var cmd = new CmdReceivedIAPPurchase(pk);
                iapHandler.onIAPPurchaseResponse(cmd);
                break;
            }
            case PaymentMgr.CMD_PURCHASE_IAP_VALIDATE: {
                var cmd = new CmdReceivedIAPValidate(pk);
                iapHandler.onValidateSuccess(cmd);
                break;
            }
            case PaymentMgr.CMD_SEND_BUY_G_ATM: {
                sceneMgr.clearLoading();
                var cmdBuyGATM = new CmdReceivedBuyGATM(pk);
                cc.log("PACKEG " + JSON.stringify(cmdBuyGATM));
                if (cmdBuyGATM.errorCode >= 1) { // || cmdBuyGATM.errorCode == 9) {
                    if (cc.sys.isNative) {
                        PaymentUtils.purchaseATM(cmdBuyGATM.urlDirect);
                    } else {
                        bankPopup.location = cmdBuyGATM.urlDirect;
                    }
                } else {
                    sceneMgr.showOKDialog(cmdBuyGATM.stringMessage + " " + cmdBuyGATM.errorCode);
                    if (!cc.sys.isNative)
                        bankPopup.close();
                }
                break;
            }
            case PaymentMgr.CMD_TRACK_LOG_ZALO: {
                var cmd = new CmdReceivedTrackLogZaloPay(pk);
                cc.log("CMD_TRACK_LOG_ZALO" + JSON.stringify(cmd));
                if (cmd.payType == CmdReceivedTrackLogZaloPay.CREATE_BINDING) {
                    if (cmd.errorCode == 1) {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "BINDING");
                    }
                    else {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "BINDING_FAIL");
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.END);
                    }
                }
                else if (cmd.payType == CmdReceivedTrackLogZaloPay.CREATE_ORDER) {
                    if (cmd.errorCode == 1) {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "ORDER");
                    }
                    else {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "ORDER_FAIL");
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.END);
                    }
                }
                else if (cmd.payType == CmdReceivedTrackLogZaloPay.PAY){
                    if (cmd.errorCode == 1 || cmd.errorCode == 3) {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "PAY");
                    }
                    else {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "PAY_FAIL");
                    }
                    fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.END);
                }

                break;
            }
        }
        return false;
    },

    loadPayment: function (p) {
        this.payments = p;
        if (portalMgr.isPortal()) {
            if (Config.DISABLE_IAP_PORTAL) {
                this.payments[Payment.GOLD_IAP] = false;
                this.payments[Payment.G_IAP] = false;
            }
            for (var i = 0; i < this.payments.length; i++) {
                if (i == Payment.GOLD_IAP || i == Payment.G_IAP) {
                    if (fr && fr.NativePortal && fr.NativePortal.getInstance().isShowInappShop) {
                        this.payments[i] = fr.NativePortal.getInstance().isShowInappShop() && this.payments[i];
                    }
                } else {
                    if (fr && fr.NativePortal && fr.NativePortal.getInstance().isShowLocalShop) {
                        this.payments[i] = fr.NativePortal.getInstance().isShowLocalShop() && this.payments[i];
                    }
                }
            }
        }
        if (!cc.sys.isNative) {
            this.payments[Payment.G_IAP] = false;
            this.payments[Payment.GOLD_IAP] = false;
            this.payments[Payment.G_ZALO] = false;
            this.payments[Payment.GOLD_ZALO] = false;
        }
        if (fr && fr.platformWrapper.isIOs()) {
            this.payments[Payment.G_ZALO] = false;
            this.payments[Payment.GOLD_ZALO] = false;
        }

        //test paument zalopay
        if (Config.ENABLE_CHEAT) {
            // this.payments[Payment.G_ZALO] = true;
            // this.payments[Payment.GOLD_ZING] = false;
            // this.payments[Payment.GOLD_ATM] = false;
            // this.payments[Payment.GOLD_IAP] = false;
            // this.payments[Payment.GOLD_G] = true;
            // this.payments[Payment.GOLD_SMS] = false;
            // this.payments[Payment.G_ATM] = false;
            // this.payments[Payment.G_ZING] = false;
            // this.payments[Payment.G_IAP] = false;
            // this.payments[Payment.GOLD_ZALO] = true;
        }
        //-----------------

        this.payments[Payment.G_CARD] = false;

        cc.log("***PAYMENT : " + this.payments.join());
    },

    saveConfigShop: function (cmd) {
        this.cmdShopConfig = cmd;
        this.loadConfig();
    },

    loadConfig: function () {
        if (!this.cmdShopConfig) return;

        var cmdGetConfigShop = this.cmdShopConfig;
        cc.log("PACKEG " + JSON.stringify(cmdGetConfigShop));
        if (cmdGetConfigShop.type == CmdSendGetConfigShop.GOLD) {
            this.isShopBonusAll = cmdGetConfigShop.isShopBonus;
            this.setNewShopGoldConfig(cmdGetConfigShop.stringConfigGold);
            sceneMgr.updateCurrentGUI();
        } else if (cmdGetConfigShop.type == CmdSendGetConfigShop.G) {
            this.isShopBonusAllG = cmdGetConfigShop.isShopBonusG;
            this.setNewShopGConfig(cmdGetConfigShop.stringConfigG);
            sceneMgr.updateCurrentGUI();
        } else {
            this.isShopBonusAll = cmdGetConfigShop.isShopBonus;
            this.isShopBonusAllG = cmdGetConfigShop.isShopBonusG;
            this.setNewShopGoldConfig(cmdGetConfigShop.stringConfigGold);
            this.setNewShopGConfig(cmdGetConfigShop.stringConfigG);
            cc.log("lfdkjf sl ");
            if (sceneMgr.getRunningScene().getMainLayer() instanceof LobbyScene) {
                this.checkShowSystemBonus();
            }
        }
    },

    setNewShopGoldConfig: function (stringConfig) {
        var configGold = JSON.parse(stringConfig);
        cc.log("Config GOLD " + JSON.stringify(configGold));
        this.versionShopGold = configGold["version"];
        this.arrayShopGoldConfig = [];
        var length = 6;
        for (var i = 0; i < length; i++) {
            var config = configGold["channels"][i + ""];
            if (this.payments[config.id]) {
                var count = 0;
                for (var key in config["packages"]) {
                    count = count + 1;
                }
                config.numPackage = count;
                var priority = config["priority"];
                var j;
                for (j = 0; j < this.arrayShopGoldConfig.length; j++) {
                    if (priority < this.arrayShopGoldConfig[j]["priority"]) {
                        this.arrayShopGoldConfig.splice(j, 0, config);
                        break;
                    }
                }
                if (j == this.arrayShopGoldConfig.length)
                    this.arrayShopGoldConfig.push(config);
            }
        }
        this.setInfoBonusGold(configGold);
    },

    setInfoBonusGold: function (configGold) {
        var bonusStartDate = configGold["bonusStartDate"];
        var bonusEndDate = configGold["bonusEndDate"];
        var array1 = bonusEndDate.split("-");
        for (var i = 0; i < 3 && i < array1.length; i++) {
            if (i == 0)
                this.bonusEndDate = this.bonusEndDate + array1[2 - i];
            else
                this.bonusEndDate = this.bonusEndDate + "-" + array1[2 - i];
        }

        newDate = array1[1] + "/" + array1[2] + "/" + array1[0];
        var timestamp = new Date(newDate).getTime() - 1;
        cc.log("*************** TIME STAMP " + timestamp);
        var date = new Date(timestamp);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var s = day + "-" + month + "-" + year;
        cc.log("*************** TIME STAMP " + s);
        this.bonusEndDate = s;
        cc.log("CONFIG NEW SHOP GOLD " + JSON.stringify(this.arrayShopGoldConfig));

        array1 = bonusStartDate.split("-");
        var newDate = "";
        this.bonusStartDate = "";
        for (var i = 0; i < 3 && i < array1.length; i++) {
            if (i == 0) {
                this.bonusStartDate = this.bonusStartDate + array1[2 - i];
            } else {
                this.bonusStartDate = this.bonusStartDate + "-" + array1[2 - i];
            }
        }
    },

    setNewShopGConfig: function (stringConfig) {
        var configG = JSON.parse(stringConfig);
        this.versionShopG = configG["version"];
        //configGold = JSON.parse()
        this.arrayShopGConfig = [];
        for (var i = 0; i < 5; i++) {
            var config = configG["channels"][i + ""];
            if (this.payments[config.id]) {
                var count = 0;
                for (var key in config["packages"]) {
                    count = count + 1;
                }
                config.numPackage = count;
                var priority = config["priority"];
                var j;
                for (j = 0; j < this.arrayShopGConfig.length; j++) {
                    if (priority < this.arrayShopGConfig[j]["priority"]) {
                        this.arrayShopGConfig.splice(j, 0, config);
                        break;
                    }
                }
                if (j == this.arrayShopGConfig.length)
                    this.arrayShopGConfig.push(config);
            }
        }
        this.setInfoBonusG(configG);
    },

    setInfoBonusG: function (configG) {
        var bonusStartDate = configG["bonusStartDate"];
        var bonusEndDate = configG["bonusEndDate"];
        if (bonusEndDate == "" || !bonusEndDate)
            return;
        var array1 = bonusEndDate.split("-");
        for (var i = 0; i < 3 && i < array1.length; i++) {
            if (i == 0)
                this.bonusEndDateG = this.bonusEndDateG + array1[2 - i];
            else
                this.bonusEndDateG = this.bonusEndDateG + "-" + array1[2 - i];
        }

        newDate = array1[1] + "/" + array1[2] + "/" + array1[0];
        var timestamp = new Date(newDate).getTime() - 1;
        cc.log("*************** TIME STAMP " + timestamp);
        var date = new Date(timestamp);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var s = day + "-" + month + "-" + year;
        cc.log("*************** TIME STAMP " + s);
        this.bonusEndDateG = s;

        array1 = bonusStartDate.split("-");
        var newDate = "";
        this.bonusStartDateG = "";
        for (var i = 0; i < 3 && i < array1.length; i++) {
            if (i == 0) {
                this.bonusStartDateG = this.bonusStartDateG + array1[2 - i];
            } else {
                this.bonusStartDateG = this.bonusStartDateG + "-" + array1[2 - i];
            }
        }
        cc.log("CONFIG NEW SHOP G " + JSON.stringify(this.arrayShopGConfig));
    },

    sendGetConfigShop: function (type, version) {
        var cmd = new CmdSendGetConfigShop();
        cmd.putData(type, version);
        this.sendPacket(cmd);
    },

    sendUpdateBuyGold: function () {
        var cmdUpdateBuyGold = new CmdSendRequestEventShop();
        this.sendPacket(cmdUpdateBuyGold);
    },

    updateBuyGold: function (data) {
        var pk = new CmdReceiveUpdateBuyGold(data);
        cc.log("CMD_UPDATE_BUYGOLD: ", JSON.stringify(pk));
        pk.clean();

        this.arrayValueG = pk.arrayValueG;
        this.arrayIsFirstG = pk.arrayIsFirstG;

        this.arrayValueSMS = pk.arrayValueSMS;
        this.arrayIsFirstSMS = pk.arrayIsFirstSMS;

        this.arrayValueIAP = pk.arrayValueIAP;
        this.arrayIsFirstIAP = pk.arrayIsFirstIAP;

        this.arrayValueZing = pk.arrayValueZing;
        this.arrayIsFirstZing = pk.arrayIsFirstZing;

        this.arrayValueATM = pk.arrayValueATM;
        this.arrayIsFirstATM = pk.arrayIsFirstATM;

        this.arrayValueZalo = pk.arrayValueZalo;
        this.arrayIsFirstZalo = pk.arrayIsFirstZalo;

        if (Config.TEST_SMS_VINA) {
            this.arrayValueSMSViettel = pk.arrayValueSMSViettel;
            this.arrayIsFirstSMSViettel = pk.arrayIsFirstSMSViettel;

            this.arrayValueSMSMobi = pk.arrayValueSMSMobi;
            this.arrayIsFirstSMSMobi = pk.arrayIsFirstSMSMobi;

            this.arrayValueSMSVina = pk.arrayValueSMSVina;
            this.arrayIsFirstSMSVina = pk.arrayIsFirstSMSVina;

            this.arrayBuyCount = pk.arrayBuyCount;
            this.lastBuyGoldType = pk.lastBuyGoldType;
            this.lastBuyGType = pk.lastBuyGType;
        }

        this.buyGoldCount = pk.nBuyGold;
        sceneMgr.updateCurrentGUI();
    },

    setRefundInfo: function (info) {
        iapHandler.setRefundInfo(info);
    },

    onUpdateMoney: function () {
       // iapHandler.onUpdateMoney();
    },

    openShop: function (waiting, callback, defaultTab) {
        cc.log("openShop");
        if (this.checkEnablePayment()) {
            var versionGold = (this.isShopBonusAll) ? -1 : this.versionShopGold;
            this.sendGetConfigShop(CmdSendGetConfigShop.GOLD, versionGold);
            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
            cc.log("openShop Success");
            if (gui instanceof ShopIapScene) {
                if (defaultTab) {
                    gui.selectTabPaymentInGold(defaultTab);
                } else {
                    gui.selectTabPaymentInGold(-1);
                }
            }
        }
    },

    openShopInTab: function (id) {
        if (this.checkEnablePayment()) {
            var versionGold = (this.isShopBonusAll) ? -1 : this.versionShopGold;
            this.sendGetConfigShop(CmdSendGetConfigShop.GOLD, versionGold);
            var gui = sceneMgr.openScene(ShopIapScene.className);
            if (gui instanceof ShopIapScene) {
                gui.selectTabPaymentInGold(id);
            }
        }
    },

    openNapG: function (waiting, callback) {
        if (this.checkEnablePayment() && this.checkEnableNapG()) {
            var versionG = (this.isShopBonusAll) ? -1 : this.versionShopG;
            this.sendGetConfigShop(CmdSendGetConfigShop.G, versionG);
            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
            if (gui instanceof ShopIapScene) {
                gui.selectTabPaymentInG(-1);
            }
        }
    },

    openNapGInTab: function (id, waiting, callback) {
        if (this.checkEnablePayment() && this.checkEnableNapG()) {
            var versionG = (this.isShopBonusAll) ? -1 : this.versionShopG;
            this.sendGetConfigShop(CmdSendGetConfigShop.G, versionG);
            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
            if (gui instanceof ShopIapScene)
                gui.selectTabPaymentInG(id);
        }
    },

    openShopTicket: function (waiting, callback) {
        if (this.checkEnablePayment()) {
            var versionGold = (this.isShopBonusAll) ? -1 : this.versionShopGold;
            this.sendGetConfigShop(CmdSendGetConfigShop.GOLD, versionGold);
            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
            if (gui instanceof ShopIapScene)
                gui.selectTabPaymentInTicket(-1);
        }
    },

    initiatePayment: function (info, type) {
        if (info.isOffer) {
            OfferManager.buyOffer(true, info.offerId);
            shopData.initShopGoldData();
            this.setItemType(type);
            return;
        }

        cc.log("not buy offer");
        var typeBuy = Payment.NO_OFFER;
        var typeCheat = Payment.CHEAT_PAYMENT_NORMAL;
        if (type >= Payment.BUY_TICKET_FROM) {
            typeBuy = Payment.BUY_TICKET;
            typeCheat = Payment.CHEAT_PAYMENT_EVENT;
        }
        switch (type) {
            case Payment.G_IAP : {
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    PaymentUtils.fakePayment(info.costConfig, Constant.G_IAP);
                } else {
                    iapHandler.purchaseItem(iapHandler.getProductIdIAP(info));
                }
                break;
            }
            case Payment.G_ATM : {
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    PaymentUtils.fakePayment(info.cost, Constant.G_ATM);
                } else {
                    var gui = sceneMgr.openGUI(GUIBank.className, GUIBank.TAG, GUIBank.TAG);
                    gui.setInfoBuy(info.cost, false);
                }
                break;
            }
            case Payment.G_ZALO : {
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    PaymentUtils.fakePayment(info.cost, Constant.G_ZALO);
                }
                else {
                    if (this.checkZaloPay()) {
                        var msg = LocalizedString.to("ZALOPAY_MSG");
                        msg = StringUtility.replaceAll(msg, "@value", StringUtility.pointNumber(info.cost));
                        sceneMgr.showOkCancelDialog(msg, this, function (btnId) {
                            if (btnId == Dialog.BTN_OK) {
                                var packageName = fr.platformWrapper.getPackageName();
                                sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
                                var cmd = new CmdSendBuyZaloPayV2();
                                cmd.putData(info.cost, 0, 0, -1, packageName);
                                GameClient.getInstance().sendPacket(cmd);
                                cmd.clean();
                            }
                        });
                    }
                }
                break;
            }
            case Payment.GOLD_IAP:
            case Payment.TICKET_IAP: {
                // Khi mua IAP tu Shop, gan lai gia tri iSOffer ve mac dinh
                offerManager.setOfferIAP(0);
                iapHandler.typeBuy = typeBuy;
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    PaymentUtils.fakePayment(info.costConfig, Constant.GOLD_IAP, typeCheat);
                } else {
                    cc.log("PURCHASE IAP ***** ");
                    iapHandler.purchaseItem(iapHandler.getProductIdIAP(info));
                }
                break;
            }
            case Payment.GOLD_G: {
                var xu = info.cost;
                var gold = info.goldNew;
                if (userMgr.getCoin() < xu) {
                    SceneMgr.getInstance().showAddGDialog(LocalizedString.to("GUI_SHOP_NOT_ENOUGHT_G"), this, function (btnID) {
                        if (btnID == Dialog.BTN_OK) {
                            //this.selectTabShop(ShopIapScene.BTN_G);
                            var gui = sceneMgr.getMainLayer();
                            if (gui instanceof ShopIapScene)
                                gui.selectTabShop(ShopIapScene.BTN_G);
                        }
                    });
                } else {
                    var msg = LocalizedString.to("GUI_SHOP_CONFIRM");
                    msg = StringUtility.replaceAll(msg, "%xu", StringUtility.pointNumber(xu));
                    msg = StringUtility.replaceAll(msg, "%gold", StringUtility.pointNumber(gold));
                    SceneMgr.getInstance().showOkCancelDialog(msg, this, function (btnID) {
                        if (btnID == Dialog.BTN_OK) {
                            var cmd = new CmdBuyGold();
                            cmd.putData(info.id);
                            GameClient.getInstance().sendPacket(cmd);
                        }
                    });
                }
                break;
            }
            case Payment.GOLD_SMS:
                var configSMS = paymentMgr.getShopGoldById(type);
                var operator = 0;
                switch (type) {
                    case Payment.GOLD_SMS_VIETTEL: {
                        operator = PanelCard.BTN_VIETTEL;
                        break;
                    }
                    case Payment.GOLD_SMS_MOBI: {
                        operator = PanelCard.BTN_MOBIFONE;
                        break;
                    }
                    case Payment.GOLD_SMS_VINA: {
                        operator = PanelCard.BTN_VINAPHONE;
                        break;
                    }
                }
                if (configSMS && configSMS["isMaintained"][0]) {
                    sceneMgr.openGUI(GUIMaintainSMS.className, GUIMaintainSMS.TAG, GUIMaintainSMS.TAG);
                } else {
                    if (typeBuy == Payment.CHEAT_PAYMENT_NORMAL) {
                        typeBuy = Payment.CHEAT_PAYMENT_SMS_ALL;
                    }
                    sceneMgr.openGUI(SimOperatorPopup.className, SimOperatorPopup.TAG, SimOperatorPopup.TAG).setAmount(parseInt(info.cost), typeBuy);
                    //PaymentUtils.requestSMSSyntax(operator, parseInt(info.cost), parseInt(info.smsType), type);
                }
                break;
            case Payment.GOLD_ATM:
            case Payment.TICKET_ATM:
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    PaymentUtils.fakePayment(info.cost, Constant.GOLD_ATM, typeCheat);
                } else {
                    var gui = sceneMgr.openGUI(GUIBank.className, GUIBank.TAG, GUIBank.TAG);
                    gui.setInfoBuy(info.cost, true, typeBuy);
                }

                break;
            case Payment.GOLD_ZING:
            case Payment.TICKET_ZING:
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    PaymentUtils.fakePayment(info.cost, Constant.GOLD_ZING, typeCheat);
                } else {
                    var gui = sceneMgr.openGUI(GUIInputCard.className, GUIInputCard.TAG, GUIInputCard.TAG);
                    gui.setInfo(info.cost, typeBuy);
                }
                break;
            case Payment.GOLD_ZALO:
            case Payment.TICKET_ZALO:
                cc.log("TYPE BUY ZALO " + typeBuy);
                fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.BEGIN + "BUY_ZALO");
                fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "CLICK_SHOP");
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
                    PaymentUtils.fakePayment(info.cost, Constant.GOLD_ZALO, typeCheat);
                }
                else {
                    if (this.checkZaloPay()) {
                        var msg = LocalizedString.to("ZALOPAY_MSG");
                        msg = StringUtility.replaceAll(msg, "@value", StringUtility.pointNumber(info.cost));
                        sceneMgr.showOkCancelDialog(msg, this, function (btnId) {
                            if (btnId == Dialog.BTN_OK) {
                                fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "SEND_BUY");
                                var packageName = fr.platformWrapper.getPackageName();
                                sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
                                var cmd = new CmdSendBuyZaloPayV2();
                                cmd.putData(info.cost, 1, typeBuy, -1, packageName);
                                GameClient.getInstance().sendPacket(cmd);
                                cmd.clean();
                                this.zalopayPackValue = info.cost;
                            }
                        });
                    }
                }
                break;
            case Payment.TICKET_SMS: {
                event.buySMSTicket(info);
                break;
            }
        }
        if (type == dailyPurchaseManager.getPromoChannel()){
            if (info.id == dailyPurchaseManager.getPromoPackage())
                fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_promo_package");
            else
                fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_promo_channel");
        }
    },

    checkEnableNapG: function () {
        return this.payments[Payment.G_IAP] || this.payments[Payment.G_CARD] || this.payments[Payment.G_ZALO] || this.payments[Payment.G_ZING] || this.payments[Payment.G_ATM]
    },

    checkEnablePayment: function () {
        for (var i = 0; i < this.payments.length; i++) {
            if (i == Payment.GOLD_G) {
                if (this.payments[i]) {
                    return true;
                }
            } else {
                if (this.payments[i] && !portalMgr.isPortal()) {
                    return true;
                }
            }
        }

        return false;
    },

    checkInReview: function () {
        if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_PAYMENT && CheatCenter.ENABLE_REVIEW) {
            return true;
        }

        var disablePayment = !this.enablepayment;
        if (disablePayment === undefined || disablePayment == null) disablePayment = false;
        var platformDisable = false;
        if (cc.sys.os == cc.sys.OS_IOS) {
            platformDisable = true;
        }

        //cc.log("^^^^^^^^^^^^^^^^^Review " + disablePayment + "|" + platformDisable);
        return (disablePayment && platformDisable);
    },

    checkShowSystemBonus: function () {
        cc.log("CHECK SHOW SYSTEM BONUS ");
        var arrayBonus = this.getMaxShopBonus();
        if (arrayBonus.length > 0) {
            this.showSystemBonus();
        }

        var arrayBonusG = this.getMaxShopGBonus();
        if (arrayBonusG.length > 0) {
            this.showSystemBonusG();
        }
    },


    checkZaloPay: function () {
        if (cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os == cc.sys.OS_IOS)
            return true;
        try {
            if (!fr.platformWrapper.isAndroid()) {
                var str = LocalizedString.to("ZALOPAY_ERROR_10");
                sceneMgr.showOKDialog(str);
                return false;
            }
            // if (Config.ENABLE_CHEAT) {
            //     if (!fr.platformWrapper.isInstalledApp(Config.URL_ZALOPAY_SANBOX)) {
            //         var str = LocalizedString.to("ZALOPAY_ERROR_INSTALL");
            //         //sceneMgr.showOKDialog(str);
            //         Toast.makeToast(Toast.SHORT, str);
            //         return false;
            //     }
            // } else {
            if (!fr.platformWrapper.isInstalledApp(Config.URL_ZALOPAY)) {
                var str = LocalizedString.to("ZALOPAY_ERROR_INSTALL");
                //sceneMgr.showOKDialog(str);
                Toast.makeToast(Toast.SHORT, str);
                return false;
            }
            // }
            return true;
        } catch (e) {
            cc.log("ERROR: CommonLogic.checkInstallZaloPay " + e);
        }
    },

    isBuyG: function (type) {
        cc.log("TYPE DFLSJ " + type);
        if (type == Payment.G_ATM || type == Payment.G_IAP || type == Payment.G_ZALO || type == Payment.G_ZING || type == Payment.G_CARD)
            return true;
        return false;
    },

    showSystemBonus: function () {
        var isShow = false;
        for (var i = 0; i < this.payments.length; i++) {
            if (i == Payment.GOLD_G) {
                if (this.payments[i]) {
                    isShow = true;
                }
            }
        }
        if (!isShow) return;

        var show = false;
        if (cc.sys.localStorage.getItem("systemBonus") == null) {
            show = true;
            var today = new Date();
            cc.sys.localStorage.setItem("systemBonus", today.toISOString().substring(0, 10));
        } else {
            var today = new Date();
            var check = cc.sys.localStorage.getItem("systemBonus") + "";
            if (check != today.toISOString().substring(0, 10)) {
                cc.sys.localStorage.setItem("systemBonus", today.toISOString().substring(0, 10));
                show = true;
            }

        }

        if (show) {
            var sp = sceneMgr.openGUI(GUISystemBonus.className, GUISystemBonus.tag, GUISystemBonus.tag, false);
        }
    },

    showSystemBonusG: function () {
        var isShow = false;
        for (var i = 0; i < this.payments.length; i++) {
            if (i == Payment.GOLD_G) {
                if (this.payments[i]) {
                    isShow = true;
                }
            }
        }
        if (!isShow) return;

        var show = false;
        if (cc.sys.localStorage.getItem("systemBonusG") == null) {
            show = true;
            var today = new Date();
            cc.sys.localStorage.setItem("systemBonusG", today.toISOString().substring(0, 10));
        } else {
            var today = new Date();
            var check = cc.sys.localStorage.getItem("systemBonusG") + "";
            if (check != today.toISOString().substring(0, 10)) {
                cc.sys.localStorage.setItem("systemBonusG", today.toISOString().substring(0, 10));
                show = true;
            }

        }
        if (show) {
            var sp = sceneMgr.openGUI(GUIGBonus.className, GUIGBonus.tag, GUIGBonus.tag, false);
        }
    },

    showTangVangPopup: function () {
        var isShow = false;
        for (var i = 0; i < this.payments.length; i++) {
            if (i == Payment.GOLD_G) {
                if (this.payments[i]) {
                    isShow = true;
                }
            }
        }

        if (!isShow) return;

        var show = false;
        if (cc.sys.localStorage.getItem("popuptangvang") == null) {
            show = true;
            var today = new Date();
            cc.sys.localStorage.setItem("popuptangvang", today.toISOString().substring(0, 10));
        } else {
            var today = new Date();
            var check = cc.sys.localStorage.getItem("popuptangvang") + "";
            if (check != today.toISOString().substring(0, 10)) {
                cc.sys.localStorage.setItem("popuptangvang", today.toISOString().substring(0, 10));
                show = true;
            }

        }
        if (show) {
            var sp = sceneMgr.openGUI(TangVangPopup.className, Dialog.SUPPORT, Dialog.SUPPORT, false);
            if (sp) sp.showBonus(1);
        }

    },

    showTangVangPopup2: function () {
        var isShow = false;
        for (var i = 0; i < this.payments.length; i++) {
            if (i == Payment.IDX_SHOP_G) {
                if (this.payments[i]) {
                    isShow = true;
                }
            }
        }

        if (!isShow) return;

        var show = false;
        if (cc.sys.localStorage.getItem("popuptangvang2") == null) {
            show = true;
            var today = new Date();
            cc.sys.localStorage.setItem("popuptangvang2", today.toISOString().substring(0, 10));
        } else {
            var today = new Date();
            var check = cc.sys.localStorage.getItem("popuptangvang2") + "";
            if (check != today.toISOString().substring(0, 10)) {
                cc.sys.localStorage.setItem("popuptangvang2", today.toISOString().substring(0, 10));
                show = true;
            }

        }
        if (show) {
            var sp = sceneMgr.openGUI(TangVangPopup.className, Dialog.SUPPORT, Dialog.SUPPORT, false);
            if (sp) sp.showBonus(2);
        }

    },

    /**
     * GET Function
     */

    /**
     * Mang nhung Kenh Payment mua GOLD
     * @returns {[]|*[]}
     */
    getArrayChannelGold: function () {
        if (this.arrayShopGoldConfig) {
            var shopGoldLength = this.arrayShopGoldConfig.length;
            var arrayChannel = [];
            for (var i = 0; i < shopGoldLength; i++) {
                var config = this.arrayShopGoldConfig[i];
                var idPayment = config.id;
                cc.log("id Payment " + idPayment);
                var isHot = false;
                if (this.isShopBonusAll && config["isShopBonus"]) {
                    isHot = true;
                } else {
                    if (offerManager.haveOffer()) {
                        isHot = offerManager.checkHaveOfferPayment(idPayment);
                    }
                }
                var imageResource;
                switch (idPayment) {
                    case Payment.GOLD_IAP:
                        if (cc.sys.os == cc.sys.OS_ANDROID) {
                            imageResource = "btnGoogle";

                        } else if (cc.sys.os == cc.sys.OS_IOS) {
                            imageResource = "btnApple";
                        }
                        else {
                            imageResource = "btnGoogle";
                        }
                        break;
                    case Payment.GOLD_ATM:
                        imageResource = "btnATM";
                        break;
                    case Payment.GOLD_ZALO:
                        imageResource = "btnZalo";
                        break;
                    case Payment.GOLD_ZING:
                        imageResource = "btnZing";
                        break;
                    case Payment.GOLD_G:
                        imageResource = "btnG";
                        break;
                    case Payment.GOLD_SMS:
                        imageResource = "btnSMS";
                        break;
                }
                var channel = new ChannelPaymentData(i, imageResource, isHot);
                arrayChannel.push(channel);
            }
            return arrayChannel;
        }
        return [];
    },

    /**
     * Mang nhung Kenh Payment mua GOLD
     * @returns {[]|*[]}
     */
    getArrayChannelG: function () {
        if (this.arrayShopGConfig) {
            var arrayChannel = [];
            for (var i = 0; i < this.arrayShopGConfig.length; i++) {
                var config = this.arrayShopGConfig[i];
                var idPayment = config.id;
                var isHot = false;
                if (this.isShopBonusAllG && config["shopBonus"] > 0) {
                    isHot = true;
                } else {
                    isHot = false;
                }
                var imageResource;
                switch (idPayment) {
                    case Payment.G_IAP:
                        if (cc.sys.os == cc.sys.OS_ANDROID) {
                            imageResource = "btnGoogle";
                        } else if (cc.sys.os == cc.sys.OS_IOS) {
                            imageResource = "btnApple";
                        }
                        else {
                            imageResource = "btnApple";
                        }
                        break;
                    case Payment.G_ATM:
                        imageResource = "btnATM";
                        break;
                    case Payment.G_ZALO:
                        imageResource = "btnZalo";
                        break;
                    case Payment.G_ZING:
                        imageResource = "btnZing";
                        break;
                    case Payment.G_CARD:
                        imageResource = "btnCard";
                        break;
                }
                var channel = new ChannelPaymentData(i, imageResource, isHot);
                arrayChannel.push(channel);
            }
            return arrayChannel;
        }
        return [];
    },

    /**
     * Mang nhung Kenh Payment mua Ticket
     * @returns {[]|*[]}
     */
    getArrayChannelTicket: function () {
        var arrayConfigTicket = eventMgr.getArrayConfigTicket();
        var arrayChannel = [];
        for (var i = 0; i < arrayConfigTicket.length; i++) {
            var config = this.arrayShopGConfig[i];
            var idPayment = arrayConfigTicket[i]["type"];
            var isHot = eventMgr.promoTicket > 0;
            var imageResource;
            switch (idPayment) {
                case Payment.TICKET_IAP:
                    if (cc.sys.os == cc.sys.OS_ANDROID) {
                        imageResource = "btnGoogle";

                    } else if (cc.sys.os == cc.sys.OS_IOS) {
                        imageResource = "btnApple";
                    }
                    break;
                case Payment.TICKET_ATM:
                    imageResource = "btnATM";
                    break;
                case Payment.TICKET_ZALO:
                    imageResource = "btnZalo";
                    break;
                case Payment.TICKET_ZING:
                    imageResource = "btnZing";
                    break;
                case Payment.TICKET_G:
                    imageResource = "btnG";
                    break;
                case Payment.TICKET_SMS:
                    imageResource = "btnSMS";
                    break;
            }
            var channel = new ChannelPaymentData(i, imageResource, isHot);
            arrayChannel.push(channel);
        }
        return arrayChannel;
    },

    getLastBuyGold: function () {
        for (var i = 0; i < paymentMgr.arrayShopGoldConfig.length; i++) {
            if (paymentMgr.arrayShopGoldConfig[i].type === paymentMgr.lastBuyGoldType) {
                return i;
                if (paymentMgr.arrayShopGoldConfig[i]["name"].indexOf("sms") >= 0) {
                    return 0;
                }
                break;
            }
        }
        return 0;
    },

    getLastBuyG: function () {
        var targetTab = 0;
        for (var i = 0; i < paymentMgr.arrayShopGConfig.length; i++) {
            if (paymentMgr.arrayShopGConfig[i].type === paymentMgr.lastBuyGType) {
                cc.log("dm123: " + JSON.stringify(paymentMgr.arrayShopGConfig[i]));
                targetTab = i;
                if (targetTab >= 6 && targetTab < 9) {
                    targetTab = 0;
                }
                break;
            }
        }
        return targetTab;
    },

    getMaxShopBonus: function () {
        var arrayBonus = [];
        if (!this.isShopBonusAll) {
            return arrayBonus;
        }
        var max = 0;
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            var config = this.arrayShopGoldConfig[i];
            if (config.isShopBonus) {
                arrayBonus.push(config.id);
                for (var j = 0; j < config.numPackage; j++) {
                    if (config["packages"][j + ""]["shopBonus"] > max) {
                        max = config["packages"][j + ""]["shopBonus"];
                    }
                }
            }
        }
        if (arrayBonus.length > 0) {
            arrayBonus.push(max); // lay ra mang cac goi khuyen mai, phan tu cuoi cung la gia tri khuyen mai lon nhat
        }
        return arrayBonus;
    },

    getMaxShopGBonus: function () {
        var arrayBonus = [];
        if (!this.isShopBonusAllG) {
            return arrayBonus;
        }
        var max = 0;
        for (var i = 0; i < this.arrayShopGConfig.length; i++) {
            var config = this.arrayShopGConfig[i];
            if (config["shopBonus"] > 0 && config["isMaintained"][0] == 0) {
                arrayBonus.push(config.id);
                if (config["shopBonus"] > max)
                    max = config["shopBonus"];
            }
        }
        if (arrayBonus.length > 0) {
            arrayBonus.push(max); // lay ra mang cac goi khuyen mai, phan tu cuoi cung la gia tri khuyen mai lon nhat
        }
        return arrayBonus;
    },

    getMaxChannelBonus: function () { // lay ra kenh co khuyen mai lon nhat
        var max = 0;
        var channel = 0;
        var arrayBonus = [];
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            var config = this.arrayShopGoldConfig[i];
            if (config.isShopBonus) {
                arrayBonus.push(config.id);
                for (var j = 0; j < config.numPackage; j++) {
                    if (config["packages"][j + ""]["shopBonus"] > max) {
                        max = config["packages"][j + ""]["shopBonus"];
                        channel = i;
                    }
                }
            }
        }
        return channel;
    },

    getMaxChannelGBonus: function () { // lay ra kenh co khuyen mai lon nhat
        var max = 0;
        var channel = 0;
        for (var i = 0; i < this.arrayShopGConfig.length; i++) {
            var config = this.arrayShopGConfig[i];
            if (config["shopBonus"] > 0) {
                if (config["shopBonus"] > max) {
                    max = config["shopBonus"];
                    channel = i;
                }
            }
        }
        return channel;
    },

    getMaxChannelFirstShopBonus: function () {
        var max = 0;
        var channel = 0;
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            var config = this.arrayShopGoldConfig[i];
            for (var j = 0; j < config.numPackage; j++) {
                if (config["packages"][j + ""]["firstBonus"] > max) {
                    max = config["packages"][j + ""]["firstBonus"];
                    channel = i;
                }
            }
        }
        return channel;
    },

    getMaxFirstShopBonus: function () {
        var max = 0;
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            var config = this.arrayShopGoldConfig[i];
            if (Config.TEST_SMS_VINA) {
                if (config["name"] === "sms") continue;
            } else {
                if (config["name"].indexOf("sms_") >= 0) continue;
            }
            for (var j = 0; j < config.numPackage; j++) {
                if (config["packages"][j + ""]["firstBonus"] > max) {
                    max = config["packages"][j + ""]["firstBonus"];
                }
            }
        }
        return max;
    },

    getIsFirstGoldG: function (value) {
        if (cc.isUndefined(this.arrayValueG))
            return 0;
        for (var i = 0; i < this.arrayValueG.length; i++) {
            if (this.arrayValueG[i] == value)
                return this.arrayIsFirstG[i];
        }
        return 0;
    },

    getIsFirstGoldIAP: function (value) {
        if (cc.isUndefined(this.arrayValueIAP))
            return 0;
        for (var i = 0; i < this.arrayValueIAP.length; i++) {
            if (this.arrayValueIAP[i] == value)
                return this.arrayIsFirstIAP[i];
        }
        return 0;
    },

    getIsFirstGoldSMS: function (value) {
        if (cc.isUndefined(this.arrayValueSMS))
            return 0;
        for (var i = 0; i < this.arrayValueSMS.length; i++) {
            if (this.arrayValueSMS[i] == value)
                return this.arrayIsFirstSMS[i];
        }
        return 0;
    },

    getIsFirstGoldZing: function (value) {
        if (cc.isUndefined(this.arrayValueZing))
            return 0;
        for (var i = 0; i < this.arrayValueZing.length; i++) {
            if (this.arrayValueZing[i] == value)
                return this.arrayIsFirstZing[i];
        }
        return 0;
    },

    getIsFirstGoldZalo: function (value) {
        if (cc.isUndefined(this.arrayValueZalo))
            return 0;
        for (var i = 0; i < this.arrayValueZalo.length; i++) {
            if (this.arrayValueZalo[i] == value)
                return this.arrayIsFirstZalo[i];
        }
        return 0;
    },

    getIsFirstGoldATM: function (value) {
        if (cc.isUndefined(this.arrayValueATM))
            return 0;
        for (var i = 0; i < this.arrayValueATM.length; i++) {
            if (this.arrayValueATM[i] == value)
                return this.arrayIsFirstATM[i];
        }
        return 0;
    },

    getShopGoldById: function (id) {
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            if (this.arrayShopGoldConfig[i].id == id)
                return this.arrayShopGoldConfig[i];
        }
    },

    getShopGoldIndexById: function(id){
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            if (this.arrayShopGoldConfig[i].id == id)
                return i;
        }
        return 0;
    },

    getShopGoldByType: function (id) {
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            if (this.arrayShopGoldConfig[i].type == id)
                return this.arrayShopGoldConfig[i];
        }
    },

    getShopGById: function (id) {
        for (var i = 0; i < this.arrayShopGConfig.length; i++) {
            if (this.arrayShopGConfig[i].id == id)
                return this.arrayShopGConfig[i];
        }
    },

    getLastShopGoldId: function () {
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            if (this.arrayShopGoldConfig[i].type == this.lastBuyGoldType) {
                if (this.arrayShopGoldConfig[i].id == Payment.GOLD_SMS_VIETTEL || this.arrayShopGoldConfig[i].id == Payment.GOLD_SMS_VINA ||
                    this.arrayShopGoldConfig[i].id == Payment.GOLD_SMS_MOBI) {
                    return Payment.GOLD_SMS;

                }
                else
                    return this.arrayShopGoldConfig[i].id;
            }
        }
        return Payment.GOLD_SMS;
    },

    getNetworkTelephone: function () {
        return -1;
        /*
        var teleInfo = NativeBridge.getTelephoneInfo();
        var operator = -1;
        switch (teleInfo) {
            case Constant.TELE_VIETTEL:
            {
                operator = Constant.ID_VIETTEL;
                break;
            }
            case Constant.TELE_MOBIFONE:
            {
                operator = Constant.ID_MOBIFONE;
                break;
            }
            case Constant.TELE_VINAPHONE:
            {
                operator = Constant.ID_VINAPHONE;
                break;
            }
            default :
            {
                operator = -1;
                break;
            }
        }

        return operator;
        */
    },

    // khoi tao IAP
    openIAP: function () {
        if (cc.sys.isNative) {
            iapHandler.openIAP();
        }
    }
})

PaymentMgr.instance = null;
PaymentMgr.getInstance = function () {
    if (!PaymentMgr.instance) {
        PaymentMgr.instance = new PaymentMgr();
    }
    return PaymentMgr.instance;
};
var paymentMgr = PaymentMgr.getInstance();

PaymentMgr.CMD_UPDATE_BUYGOLD = 5003;
PaymentMgr.CMD_PURCHASE_CARD = 8900;
PaymentMgr.CMD_PURCHASE_SMS = 8901;
PaymentMgr.CMD_PURCHASE_IAP_GOOGLE = 8902;
PaymentMgr.CMD_PURCHASE_IAP_APPLE = 8903;

PaymentMgr.CMD_IAP_PURCHASE_RESPONSE = 8886;
PaymentMgr.CMD_PURCHASE_IAP_VALIDATE = 8904;
PaymentMgr.CMD_BUY_G_ZALO = 4885;
PaymentMgr.CMD_BUY_G_ATM = 4886;
PaymentMgr.CMD_SEND_BUY_G_ATM = 4887;
PaymentMgr.CMD_BUY_ZALO_V2 = 4889;
PaymentMgr.CMD_GET_CONFIG_SHOP = 1009;

PaymentMgr.CMD_PURCHASE_IAP_GOOGLE_PORTAL = 8912;
PaymentMgr.CMD_PURCHASE_IAP_APPLE_PORTAL = 8903;
PaymentMgr.CMD_PURCHASE_IAP_GOOGLE_MULTI_PORTAL = 8913;
PaymentMgr.CMD_UPDATE_ENABLE_PAYMENT = 8930;

PaymentMgr.CMD_BUY_GOLD = 9997;
PaymentMgr.CMD_UPDATE_COIN = 1012;
PaymentMgr.CMD_SHOP_GOLD_SUCCESS = 4890;
PaymentMgr.CMD_SEND_SHOP_GOLD_SUCCESS = 4891;
PaymentMgr.CMD_SHOP_GOLD = 1008;

PaymentMgr.EVENT_SHOP_GOLD_SUCCESS = "paymentMgrEventShopGoldSuccess";

ConfigLog = {};
ConfigLog.ZALO_PAY = "ZALO_PAY";
ConfigLog.DAILY_PURCHASE = "DAILY_PURCHASE";
ConfigLog.BEGIN = "_begin_";
ConfigLog.END = "_end_";

var Payment = function () {
};

Payment.IDX_IAP_G = 0;
Payment.IDX_IAP_GOLD = 1;
Payment.IDX_SHOP_G = 2;
Payment.IDX_ZALO_G = 3;

Payment.GOLD_IAP = 0;
Payment.GOLD_ATM = 2;
Payment.GOLD_ZALO = 4;
Payment.GOLD_ZING = 6;
Payment.GOLD_G = 10;
Payment.GOLD_SMS = 8;

Payment.G_IAP = 1;
Payment.G_ATM = 3;
Payment.G_ZALO = 5;
Payment.G_ZING = 7;
Payment.G_CARD = 9;

Payment.GOLD_SMS_VIETTEL = 11;
Payment.GOLD_SMS_MOBI = 12;
Payment.GOLD_SMS_VINA = 13;

Payment.TICKET_G = 30;
Payment.TICKET_SMS = 28;
Payment.TICKET_ZING = 26;
Payment.TICKET_IAP = 20;
Payment.TICKET_ATM = 22;
Payment.TICKET_ZALO = 24;

Payment.SMS_VIETTEL = 0;
Payment.SMS_VINA = 1;
Payment.SMS_MOBI = 2;

Payment.CARD_VIETTEL = 0;
Payment.CARD_VINA = 1;
Payment.CARD_MOBI = 2;
Payment.CARD_VINAMOBILE = 3;

Payment.BONUS_NONE = 0;
Payment.BONUS_FIRST = 1;
Payment.BONUS_VIP = 2;
Payment.BONUS_SYSTEM = 3;

Payment.CHEAT_PAYMENT_NORMAL = 0;
Payment.CHEAT_PAYMENT_EVENT = 1;
Payment.CHEAT_PAYMENT_OFFER = 2;
Payment.CHEAT_PAYMENT_SMS_ALL = 3;

Payment.IS_OFFER = 1;
Payment.NO_OFFER = 0;
Payment.BUY_TICKET = 3;

Payment.BUY_TICKET_FROM = 20;

Payment.BUY_SMS_INDEX = 1;
Payment.BUY_IAP_INDEX = 2;
Payment.BUY_ZING_INDEX = 4;
Payment.BUY_ATM_INDEX = 5;
Payment.BUY_ZALO_INDEX = 6;
Payment.BUY_SMS_VIETTEL_INDEX = 7;
Payment.BUY_SMS_MOBI_INDEX = 8;
Payment.BUY_SMS_VINA_INDEX = 9;

Payment.OPERATOR_VIETTEL = 4;
Payment.OPERATOR_MOBIFONE = 2;
Payment.OPERATOR_VINAPHONE = 3;