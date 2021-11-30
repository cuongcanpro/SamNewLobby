var PaymentMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.payments = [];
        this.arrayShopGConfig = [];
        this.arrayShopGoldConfig = [];
        this.buyGoldCount = 0;
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
                var cBGold = new CmdReceiveBuyGold(p);
                if (cBGold.error != 0) {
                    sceneMgr.showOKDialog(LocalizedString.to("CHANGE_GOLD_FAIL"));
                }
                cBGold.clean();
                break;
            }
            case PaymentMgr.CMD_UPDATE_COIN: {
                var pk = new CmdReceivedUpdateCoin(p);
                userMgr.setCoin(pk.coin);
                Toast.makeToast(Toast.SHORT, LocalizedString.to("NAP_G"));
                sceneMgr.updateCurrentGUI();
                pk.clean();

                iapHandler.onUpdateMoney();
                break;
            }
            case PaymentMgr.CMD_SHOP_GOLD: {
                var cSG = new CmdReceiveShopGold(p);
                if (cSG.isOffer)
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
                        NewVipManager.openChangeGoldSuccess(cSG);
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
                var rPCard = new CmdReceivePurchaseCard(p);
                cc.log("CMD_PURCHASE_CARD " + JSON.stringify(rPCard));
                rPCard.clean();

                iapHandler.responsePurchaseCard(rPCard);
                break;
            }
            case PaymentMgr.CMD_PURCHASE_SMS: {
                var rPSMS = new CmdReceivePurchaseSMS(p);
                rPSMS.clean();

                iapHandler.purchaseSMS(rPSMS);
                break;
            }
            case PaymentMgr.CMD_PURCHASE_IAP_GOOGLE: {
                var rIapGoogle = new CmdReceivePurchaseIAPGoogle(p);
                rIapGoogle.clean();

                iapHandler.onResponseIapGoogle(rIapGoogle);
                break;
            }
            case PaymentMgr.CMD_PURCHASE_IAP_APPLE: {
                var rIapGoogle = new CmdReceivePurchaseIAPApple(p);
                rIapGoogle.clean();

                iapHandler.onResponseIapApple(rIapGoogle);
                break;
            }
            case PaymentMgr.CMD_BUY_ZALO_V2: {
                sceneMgr.clearLoading();
                var cmdBuyGZalo = new CmdReceivedBuyZaloV2(p);
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
                        str += LocalizedString.to("ZALOPAY_ERROR_1010");
                    } else {
                        str = StringUtility.replaceAll(str, "@n", "\n");
                        str += cmdBuyGZalo.errMsg;
                    }
                    sceneMgr.showOKDialog(str);
                }
                break;
            }
            case PaymentMgr.CMD_IAP_PURCHASE_RESPONSE: {
                var cmd = new CmdReceivedIAPPurchase(p);
                iapHandler.onIAPPurchaseResponse(cmd);
                break;
            }
            case PaymentMgr.CMD_PURCHASE_IAP_VALIDATE: {
                var cmd = new CmdReceivedIAPValidate(p);
                iapHandler.onValidateSuccess(cmd);
                break;
            }
            case PaymentMgr.CMD_SEND_BUY_G_ATM: {
                sceneMgr.clearLoading();
                var cmdBuyGATM = new CmdReceivedBuyGATM(p);
                cc.log("PACKEG " + JSON.stringify(cmdBuyGATM));
                if (cmdBuyGATM.errorCode >= 1) { // || cmdBuyGATM.errorCode == 9) {
                    if (cc.sys.isNative) {
                        iapHandler.purchaseATM(cmdBuyGATM.urlDirect);
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
                var cmd = new CmdReceivedTrackLogZaloPay(p);
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
        if (PortalUtil.isPortal()) {
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
        var length = (Config.TEST_SMS_VINA) ? 9 : 6;
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
        iapHandler.onUpdateMoney();
    },

    openShop: function (waiting, callback, defaultTab) {
        if (this.checkEnablePayment()) {
            var cmd = new CmdSendGetConfigShop();
            var versionGold = (this.isShopBonusAll) ? -1 : this.versionShopGold;
            cmd.putData(CmdSendGetConfigShop.GOLD, versionGold);
            GameClient.getInstance().sendPacket(cmd);
            cc.log("SEND WHEN OPEN SHOP");

            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
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
            var cmd = new CmdSendGetConfigShop();
            var versionGold = (this.isShopBonusAll) ? -1 : this.versionShopGold;
            cmd.putData(CmdSendGetConfigShop.GOLD, versionGold);
            GameClient.getInstance().sendPacket(cmd);

            var gui = sceneMgr.openScene(ShopIapScene.className);
            if (gui instanceof ShopIapScene) {
                gui.selectTabPaymentInGold(id);
            }
        }
    },

    openNapG: function (waiting, callback) {
        if (this.checkEnablePayment() && this.checkEnableNapG()) {
            var cmd = new CmdSendGetConfigShop();
            var versionG = (this.isShopBonusAll) ? -1 : this.versionShopG;
            cmd.putData(CmdSendGetConfigShop.G, versionG);
            GameClient.getInstance().sendPacket(cmd);
            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
            if (gui instanceof ShopIapScene) {
                gui.selectTabPaymentInG(-1);
            }
        }
    },

    openNapGInTab: function (id, waiting, callback) {
        if (this.checkEnablePayment() && this.checkEnableNapG()) {
            var cmd = new CmdSendGetConfigShop();
            var versionG = (this.isShopBonusAll) ? -1 : this.versionShopG;
            cmd.putData(CmdSendGetConfigShop.G, versionG);
            GameClient.getInstance().sendPacket(cmd);

            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
            if (gui instanceof ShopIapScene)
                gui.selectTabPaymentInG(id);
        }
    },

    openShopTicket: function (waiting, callback) {
        if (this.checkEnablePayment()) {
            var cmd = new CmdSendGetConfigShop();
            var versionGold = (this.isShopBonusAll) ? -1 : this.versionShopGold;
            cmd.putData(CmdSendGetConfigShop.GOLD, versionGold);
            GameClient.getInstance().sendPacket(cmd);

            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
            if (gui instanceof ShopIapScene)
                gui.selectTabPaymentInTicket(-1);
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
                if (this.payments[i] && !PortalUtil.isPortal()) {
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

    getIsFirstGoldSMSnew: function (paymentType, value) {
        var arrayValueSMS = this.arrayValueSMSViettel;
        var arrayIsFirstSMS = this.arrayIsFirstSMSViettel;
        if (paymentType === Payment.GOLD_SMS_MOBI) {
            arrayValueSMS = this.arrayValueSMSMobi;
            arrayIsFirstSMS = this.arrayIsFirstSMSMobi;
        } else if (paymentType === Payment.GOLD_SMS_VINA) {
            arrayValueSMS = this.arrayValueSMSVina;
            arrayIsFirstSMS = this.arrayIsFirstSMSVina;
        }
        if (cc.isUndefined(arrayValueSMS))
            return 0;
        for (var i = 0; i < arrayValueSMS.length; i++) {
            if (arrayValueSMS[i] === value)
                return arrayIsFirstSMS[i];
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

ConfigLog = {};
ConfigLog.ZALO_PAY = "ZALO_PAY";
ConfigLog.DAILY_PURCHASE = "DAILY_PURCHASE";
ConfigLog.BEGIN = "_begin_";
ConfigLog.END = "_end_";