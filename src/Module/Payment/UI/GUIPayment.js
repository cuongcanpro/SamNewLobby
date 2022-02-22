/**
 * Cac GUI the hien cac Phuong thuc thanh toan nhu Bank, SMS, ZingCard, GUI bonus Gold, G
 */
var SimOperatorPopup = BaseLayer.extend({

    ctor: function () {
        this.amount = 0;
        this.type = 0;

        this._super("SimOperatorPopup");
        this.initWithBinaryFile("SimOperatorPopup.json");
    },

    initGUI: function () {
        var p = this.getControl("bg");
        this._bg = p;

        this.btnViettel = this.customButton("viettel", PanelCard.BTN_VIETTEL, p);
        this.btnMobi = this.customButton("mobifone", PanelCard.BTN_MOBIFONE, p);
        this.btnVina = this.customButton("vinaphone", PanelCard.BTN_VINAPHONE, p);
        this.customButton("btnClose", PanelCard.BTN_CLOSE, p);

        this.iconViettel = this.getControl("iconMaintainViettel", p);
        this.iconVina = this.getControl("iconMaintainVina", p);
        this.iconMobi = this.getControl("iconMaintainMobi", p);

        this.enableFog();
        this.setBackEnable(true);
    },

    setAmount: function (a, b) {
        this.amount = parseInt(a);
        this.type = parseInt(b);
        this.typeBuy = this.type; // loai mua SMS: Gold, Ve, Offer : 0, 1, 2
        this.updateMaintain();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.updateMaintain();
    },

    updateMaintain: function () {
        var maintainViettel = gamedata.gameConfig.getShopGoldById(Payment.GOLD_SMS_VIETTEL)["isMaintained"][0];
        var maintainVina = gamedata.gameConfig.getShopGoldById(Payment.GOLD_SMS_VINA)["isMaintained"][0];
        var maintainMobi = gamedata.gameConfig.getShopGoldById(Payment.GOLD_SMS_MOBI)["isMaintained"][0];
        maintainViettel = maintainViettel || !gamedata.gameConfig.checkHavePackage(Payment.GOLD_SMS_VIETTEL, this.amount);
        maintainVina = maintainVina || !gamedata.gameConfig.checkHavePackage(Payment.GOLD_SMS_VINA, this.amount);
        maintainMobi = maintainMobi || !gamedata.gameConfig.checkHavePackage(Payment.GOLD_SMS_MOBI, this.amount);
        this.iconViettel.setVisible(maintainViettel);
        this.iconVina.setVisible(maintainVina);
        this.iconMobi.setVisible(maintainMobi);
        this.btnViettel.setOpacity(maintainViettel == 1 ? 150 : 255);
        this.btnVina.setOpacity(maintainVina == 1 ? 150 : 255);
        this.btnMobi.setOpacity(maintainMobi == 1 ? 150 : 255);
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case PanelCard.BTN_VIETTEL:
                if (this.iconViettel.isVisible()) {

                    cc.log("TYPE NE " + this.type);
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("MAINTAIN_SERVICE"));
                    return;
                } else {
                    this.type = Payment.GOLD_SMS_VIETTEL;
                }

                break;
            case PanelCard.BTN_VINAPHONE:
                if (this.iconVina.isVisible()) {

                    cc.log("TYPE NE " + this.type);
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("MAINTAIN_SERVICE"));
                    return;
                } else {
                    this.type = Payment.GOLD_SMS_VINA;
                }
                break;
            case PanelCard.BTN_MOBIFONE:
                if (this.iconMobi.isVisible()) {

                    cc.log("TYPE NE " + this.type);
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("MAINTAIN_SERVICE"));
                    return;
                } else {
                    this.type = Payment.GOLD_SMS_MOBI;
                }
                break;
        }
        if (id != PanelCard.BTN_CLOSE && !gamedata.gameConfig.checkHavePackage(this.type, this.amount)) {
            ToastFloat.makeToast(ToastFloat.SHORT, "Không hỗ trợ gói SMS này");
            this.onClose();
            return;
        }
        this.onClose();
        if (id == PanelCard.BTN_CLOSE)
            return;
        cc.log("TYPE NE " + this.type);
        if (this.typeBuy == Payment.CHEAT_PAYMENT_OFFER)
            PaymentUtils.requestSMSSyntax(id, parseInt(this.amount), Payment.CHEAT_PAYMENT_OFFER, parseInt(this.type), Payment.IS_OFFER);
        else
            PaymentUtils.requestSMSSyntax(id, parseInt(this.amount), Payment.CHEAT_PAYMENT_EVENT, parseInt(this.type), Payment.NO_OFFER);

        cc.log("##SimOperator::purchaseSMS : " + id + "/" + this.amount);
    },

    onBack: function () {
        this.onClose();
    }
});
SimOperatorPopup.className = "SimOperatorPopup";
SimOperatorPopup.TAG = 500;

var GUIMaintainSMS = BaseLayer.extend({

    ctor: function () {
        this.amount = 0;
        this.type = 0;

        this._super("GUIMaintainSMS");
        this.initWithBinaryFile("GUIMaintainSMS.json");
    },

    initGUI: function () {
        var p = this.getControl("bg");
        this._bg = p;

        this.customButton("btnClose", 0, p);

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        this.onClose();
    },

    onBack: function () {
        this.onClose();
    }
});
GUIMaintainSMS.className = "GUIMaintainSMS";
GUIMaintainSMS.tag = 501;

var GUIInputCard = BaseLayer.extend({

    ctor: function () {
        this.amount = 0;
        this.type = 0;
        this.typeBuy = Payment.NO_OFFER;

        this._super("GUIInputCard");
        this.initWithBinaryFile("GUIInputCard.json");
    },

    initGUI: function () {
        var p = this.getControl("bg");
        this._bg = p;
        this.btnPurchase = this.customButton("btnInput", PanelCard.BTN_PURCHASE);
        this.customButton("btnClose", 0, p);
        var tfCard = this.getControl("txcard");
        var tfSerial = this.getControl("txseri");

        // if (cc.sys.isNative){
        tfCard.setVisible(false);
        this.txCard = BaseLayer.createEditBox(tfCard);
        this.txCard.setTag(AccountInputUI.TF_USERNAME);
        this.txCard.setDelegate(this);
        this.txCard.setPosition(tfCard.getPosition());
        this._bg.addChild(this.txCard);

        tfSerial.setVisible(false);
        this.txSerial = BaseLayer.createEditBox(tfSerial);
        this.txSerial.setTag(AccountInputUI.TF_USERNAME);
        this.txSerial.setDelegate(this);
        this.txSerial.setPosition(tfSerial.getPosition());
        this._bg.addChild(this.txSerial);
        // } else {
        //     this.txCard = tfCard;
        //     this.txSerial = tfSerial;
        // }

        this.enableFog();
        this.setBackEnable(true);
    },

    updateButton: function (visible) {
        //this.btnPurchase.setVisible(visible);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.txCard.setString("");
        this.txSerial.setString("");
        this.setFog(true);
    },

    onButtonRelease: function (btn, id) {
        if (id == PanelCard.BTN_PURCHASE) {
            if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                PaymentUtils.fakePayment(this.amount, Constant.GOLD_ZING);
            } else {
                var card = this.txCard.getString();
                var seri = this.txSerial.getString();

                if (card == "") {
                    sceneMgr.showOKDialog(LocalizedString.to("GUI_ADD_G_INPUT_CODE"));
                } else if (seri == "") {
                    sceneMgr.showOKDialog(LocalizedString.to("GUI_ADD_G_INPUT_SERI"));
                } else {
                    //var cmd = new CmdSendPurchaseCard();
                    //cmd.putData(this.curCardSelect, card, seri);
                    //GameClient.getInstance().sendPacket(cmd);

                    PaymentUtils.purchaseCard(PanelCard.BTN_ZING, card, seri, 1, this.typeBuy);
                    this.updateButton(false);
                    this.onClose();
                }
            }
        } else {
            this.onClose();
        }
    },

    setInfo: function (amount, typeBuy) {
        this.amount = amount;
        if (!typeBuy)
            this.typeBuy = Payment.NO_OFFER;
        else
            this.typeBuy = typeBuy;
    },

    onBack: function () {
        this.onClose();
    }
});
GUIInputCard.className = "GUIInputCard";
GUIInputCard.tag = 502;

var GUIBank = BaseLayer.extend({

    ctor: function () {
        this.amount = 0;
        this.type = 0;
        this.isOffer = false;

        this._super("GUIBank");
        this.initWithBinaryFile("GUIBank.json");
    },

    initGUI: function () {
        var p = this.getControl("bg");
        this.panelCenter = this.getControl("panelCenter");
        this._bg = p;

        this.customButton("btnClose", 100, p);
        this.arrayImage = ["123PTPB", "123POCB", "123PPGB", "123PSGB", "123PNAB", "123PGPB", "123PABB", "123PNVB", "123PVAB", "123PHDB", "123POCEB",
            "123PVPB", "123PMB", "123PVIB", "123PMRTB", "123PSCB", "123PACB", "123PEIB", "123PBIDV", "123PAGB", "123PTCB", "123PVTB", "123PDAB", "123PVCB", "25"];
        this.arrayID = ["TPB", "OCB", "PGB", "SGB", "NAB", "GPB", "ABB", "NVB", "VAB", "HDB", "OJB",
            "VPB", "MB", "VIB", "MSB", "SCB", "ACB", "EIB", "BIDV", "VARB", "TCB", "VTB", "DAB", "VCB", "CC"];
        var padX = -100;
        var padY = -1;
        for (var i = 0; i < 24; i++) {
            var button = new ccui.Button();
            button.setTouchEnabled(true);
            button.loadTextures("ShopIAP/IconBank/Bank" + this.arrayImage[i] + ".png", "ShopIAP/IconBank/Bank" + this.arrayImage[i] + ".png", "");
            if (padX == -100) {
                padX = (this.panelCenter.getContentSize().width - 4 * button.getContentSize().width) / 3;
                padY = (this.panelCenter.getContentSize().height - 6 * button.getContentSize().height) / 5;
            }
            button.setPosition(button.getContentSize().width * (i % 4 + 0.5) + padX * (i % 4), button.getContentSize().height * (Math.floor(i / 4) + 0.5) + padY * (Math.floor(i / 4)));
            this.panelCenter.addChild(button);
            button.setTag(i);
            button.setPressedActionEnabled(true);
            button.addTouchEventListener(this.onTouchEventHandler, this);
        }



        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.enableFog();
        this.setShowHideAnimate(this._bg, true);
    },

    setInfoBuy: function (value, isBuyGold, isOffer) {
        this.value = value;
        this.isBuyGold = isBuyGold;
        if (!isOffer)
            this.isOffer = Payment.NO_OFFER;
        else
            this.isOffer = isOffer;
        cc.log("IS OFFER " + this.isOffer);
    },

    onButtonRelease: function (btn, id) {
        if (id < 100) {
            var pk = new CmdSendBuyGATM();
            cc.log("VALUE " + this.value);
            pk.putData(this.value, this.arrayID[id], this.isBuyGold, this.isOffer);
            GameClient.getInstance().sendPacket(pk);
            if (!cc.sys.isNative)
                bankPopup = window.open("");
        }
        this.onClose();
    },

    onBack: function () {
        this.onClose();
    }
});
GUIBank.className = "GUIBank";
GUIBank.tag = 503;
var bankPopup = null;

var GUISystemBonus = BaseLayer.extend({

    ctor: function () {
        this.nodeKM = null;
        this.typeKM = 0;

        this._super("GUISystemBonus");
        this.initWithBinaryFile("GUISystemBonus.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customizeButton("btnOK", 1, this._bg);
        this.customizeButton("btnClose", 0, this._bg);

        this.nodeKM = this._bg.getChildByName("bonus");
        this.labelBonus = this.getControl("labelBonus", this._bg);
        this.labelTime = this.getControl("labelTime", this._bg);
        this.lableNote = this.getControl("labelNote", this._bg);
        this.labelChannelApply = this.getControl("labelChannelApply", this._bg);
        this.lableNote.setString(localized("NOTE_BONUS_GOLD"));

        this.lbTimeRemain = new RichLabelText();
        //this.lbTimeRemain.setText(txts);
        this._bg.addChild(this.lbTimeRemain);
        //this._bg.removeChild(this.lbTimeRemain);
        this.enableFog();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.loadInfo();
    },

    onButtonRelease: function (button, id) {
        this.onClose();

        if (id == 1) {
            //sceneMgr.openScene(ShopScene.className);
            var idTab = gamedata.gameConfig.getMaxChannelBonus();
            gamedata.openShopInTab(idTab);

        }
        popUpManager.removePopUp(PopUpManager.SHOP_BONUS);
    },

    loadInfo: function () {
        var arrayBonus = gamedata.gameConfig.getMaxShopBonus();
        this.labelBonus.setString(arrayBonus[arrayBonus.length - 1] + "%");

        var txts = [];
        var applyFor = localized("APPLY_FOR");
        txts.push({"text": localized("APPLY_FOR"), "color": cc.color(237, 233, 165), "size": 15});
        if (arrayBonus.length > 2) {
            txts.push({
                "text": " " + this.getNameShop(arrayBonus[0]),
                "font": SceneMgr.FONT_BOLD,
                "color": cc.color(255, 255, 255, 0),
                "size": 15
            });
            txts.push({"text": localized("AND"), "color": cc.color(237, 233, 165, 0), "size": 15});
            applyFor += " " + this.getNameShop(arrayBonus[0]) + ",";
            for (var i = 1; i < arrayBonus.length - 1; i++) {
                var s;
                if (i < 2) {
                    s = " " + this.getNameShop(arrayBonus[i])
                } else {
                    s = ", " + this.getNameShop(arrayBonus[i]);
                }
                if (!!this.getNameShop(arrayBonus[i])) {
                    txts.push({
                        "text": s,
                        "font": SceneMgr.FONT_BOLD,
                        "color": cc.color(255, 255, 255, 0),
                        "size": 15
                    });
                    applyFor += s;
                }
            }
        } else {
            txts.push({
                "text": " " + this.getNameShop(arrayBonus[0]),
                "font": SceneMgr.FONT_BOLD,
                "color": cc.color(255, 255, 255, 0),
                "size": 15
            });
            applyFor += this.getNameShop(arrayBonus[0]);
        }

        this.removeChild(this.lbTimeRemain);
        this.lbTimeRemain = new RichLabelText();
        this.lbTimeRemain.setText(txts);
        this.lbTimeRemain.setVisible(false);
        this._bg.addChild(this.lbTimeRemain);
        this.lbTimeRemain.setPosition(this._bg.getContentSize().width * 0.9 - this.lbTimeRemain.getWidth(), 10);
        var s = localized("TIME_BONUS");
        s = StringUtility.replaceAll(s, "@time1", gamedata.gameConfig.bonusStartDate.substr(0, 5));
        s = StringUtility.replaceAll(s, "@time2", gamedata.gameConfig.bonusEndDate);
        this.labelTime.setString(s);
        if (gamedata.gameConfig.bonusStartDate === gamedata.gameConfig.bonusEndDate) {
            this.labelTime.setString(StringUtility.replaceAll(localized("DAY"), "%day", gamedata.gameConfig.bonusEndDate));
        }
        this.labelChannelApply.setString(applyFor);
    },

    getNameShop: function (id) {
        switch (id) {
            case Payment.GOLD_ATM:

                return "ATM";
                break;
            case Payment.GOLD_G:
                return "Shop Gold";
                break;
            case Payment.GOLD_ZING:
                return "Zing Card";
                break;
            case Payment.GOLD_ZALO:
                return "Zalo Pay";
                break;
            case Payment.GOLD_IAP:
                if (cc.sys.os == cc.sys.OS_IOS)
                    return "Apple Store";
                else
                    return "Google";
                break;
            case Payment.GOLD_SMS:
                return "SMS";
                break;
        }
    }
});
GUISystemBonus.className = "GUISystemBonus";
GUISystemBonus.tag = 504;

var GUIGBonus = BaseLayer.extend({

    ctor: function () {
        this.nodeKM = null;
        this.typeKM = 0;

        this._super("GUIGBonus");
        this.initWithBinaryFile("GUIGBonus.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customizeButton("btnOK", 1, this._bg);
        this.customizeButton("btnClose", 0, this._bg);

        this.nodeKM = this._bg.getChildByName("bonus");
        this.labelBonus = this.getControl("labelBonus", this._bg);
        this.labelTime = this.getControl("labelTime", this._bg);
        var txts = [];
        txts.push({"text": LocalizedString.to("EGG_INFO_TIME_LEFT_0"), "color": cc.color(86, 179, 126, 0), "size": 15});
        txts.push({
            "text": " flsdjkfldsj  ",
            "font": SceneMgr.FONT_BOLD,
            "color": cc.color(255, 165, 0, 0),
            "size": 15
        });
        txts.push({"text": LocalizedString.to("EGG_INFO_TIME_LEFT_1"), "color": cc.color(86, 179, 126, 0), "size": 15});

        this.lbTimeRemain = new RichLabelText();
        //this.lbTimeRemain.setText(txts);
        this._bg.addChild(this.lbTimeRemain);
        //this._bg.removeChild(this.lbTimeRemain);
        this.enableFog();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.loadInfo();
    },

    onButtonRelease: function (button, id) {
        this.onClose();

        if (id == 1) {
            //sceneMgr.openScene(ShopScene.className);
            var idTab = gamedata.gameConfig.getMaxChannelGBonus();
            gamedata.openNapGInTab(idTab);
        }
        popUpManager.removePopUp(PopUpManager.SHOP_BONUS);
    },

    loadInfo: function () {
        var arrayBonus = gamedata.gameConfig.getMaxShopGBonus();
        this.labelBonus.setString(arrayBonus[arrayBonus.length - 1] + "%");

        var txts = [];
        txts.push({"text": localized("APPLY_FOR"), "color": cc.color(235, 233, 165), "size": 15});
        if (arrayBonus.length > 2) {
            txts.push({
                "text": " " + this.getNameShop(arrayBonus[0]),
                "font": SceneMgr.FONT_BOLD,
                "color": cc.color(255, 255, 255, 0),
                "size": 15
            });
            txts.push({"text": localized("AND"), "color": cc.color(237, 233, 165, 0), "size": 15});
            for (var i = 1; i < arrayBonus.length - 1; i++) {
                var s;
                if (i < 2) {
                    s = " " + this.getNameShop(arrayBonus[i])
                } else {
                    s = ", " + this.getNameShop(arrayBonus[i]);
                }
                txts.push({
                    "text": s,
                    "font": SceneMgr.FONT_BOLD,
                    "color": cc.color(255, 255, 255, 0),
                    "size": 15
                });
            }
        } else {
            txts.push({
                "text": " " + this.getNameShop(arrayBonus[0]),
                "font": SceneMgr.FONT_BOLD,
                "color": cc.color(255, 255, 255, 0),
                "size": 15
            });
        }

        this.removeChild(this.lbTimeRemain);
        this.lbTimeRemain = new RichLabelText();
        this.lbTimeRemain.setText(txts);
        this._bg.addChild(this.lbTimeRemain);
        this.lbTimeRemain.setPosition(this._bg.getContentSize().width * 0.89 - this.lbTimeRemain.getWidth(), 20);
        var s = localized("TIME_BONUS");
        s = StringUtility.replaceAll(s, "@time1", gamedata.gameConfig.bonusStartDateG);
        s = StringUtility.replaceAll(s, "@time2", gamedata.gameConfig.bonusEndDateG);
        this.labelTime.setString(s);
    },

    getNameShop: function (id) {
        switch (id) {
            case Payment.G_ATM:
                return "ATM";
                break;
            case Payment.G_CARD:
                return "Card";
                break;
            case Payment.G_ZING:
                return "Zing Card";
                break;
            case Payment.G_ZALO:
                return "Zalo Pay";
                break;
            case Payment.G_IAP:
                if (cc.sys.os == cc.sys.OS_IOS)
                    return "Apple Store";
                else
                    return "Google";
                break;

        }
    }
});
GUIGBonus.className = "GUIGBonus";
GUIGBonus.tag = 505;

var ZingCardPanel = BaseLayer.extend({

    ctor: function () {
        this.btnPurchase = null;

        this.txCard = null;
        this.txSerial = null;

        this._super("ZingCardPanel");
        this.initWithBinaryFile("ZingCardPanel.json");
    },

    initGUI: function () {
        this._layout.setScale(this._scale);
       // this._layout.setVisible(false);
        this.btnPurchase = this.customButton("purchase", ZingCardPanel.BTN_PURCHASE);
        this.pInput = this.getControl("pInput");

        var tfCard = this.getControl("txcard", this.pInput);
        var tfSerial = this.getControl("txseri", this.pInput);

        if (cc.sys.isNative) {
            tfCard.setVisible(false);
            this.txCard = BaseLayer.createEditBox(tfCard);
            this.txCard.setTag(AccountInputUI.TF_USERNAME);
            this.txCard.setDelegate(this);
            this.txCard.setPosition(tfCard.getPosition());
            this.pInput.addChild(this.txCard);

            tfSerial.setVisible(false);
            this.txSerial = BaseLayer.createEditBox(tfSerial);
            this.txSerial.setTag(AccountInputUI.TF_USERNAME);
            this.txSerial.setDelegate(this);
            this.txSerial.setPosition(tfSerial.getPosition());
            this.pInput.addChild(this.txSerial);
        } else {
            this.txCard = tfCard;
            this.txSerial = tfSerial;
        }
    },

    updateInfo: function () {
    },

    updateButton: function (visible) {
        //this.btnPurchase.setVisible(visible);
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case ZingCardPanel.BTN_PURCHASE : {
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    var card = this.txCard.getString();
                    PaymentUtils.fakePayment(parseInt(card), Constant.G_ZING);
                } else {
                    var card = this.txCard.getString();
                    var seri = this.txSerial.getString();

                    if (card == "") {
                        sceneMgr.showOKDialog(LocalizedString.to("GUI_ADD_G_INPUT_CODE"));
                        return;
                    } else if (seri == "") {
                        sceneMgr.showOKDialog(LocalizedString.to("GUI_ADD_G_INPUT_SERI"));
                        return;
                    } else {
                        //var cmd = new CmdSendPurchaseCard();
                        //cmd.putData(this.curCardSelect, card, seri);
                        //GameClient.getInstance().sendPacket(cmd);

                        PaymentUtils.purchaseCard(PanelCard.BTN_ZING, card, seri);
                        this.updateButton(false);
                    }
                }

                break;
            }
        }
    }
});
ZingCardPanel.BTN_PURCHASE = 1;
ZingCardPanel.BTN_STORE = 2;
ZingCardPanel.BTN_SMS = 3;
ZingCardPanel.SMS = [
    {
        id: 0,
        image: "res/Lobby/ShopIAP/zingcard_0.png",
        cost: 11500,
        value: 10000,
        syntax: "ZINGXU 10000",
        currency: "vnd",
        phone: "9150"
    },
    {
        id: 1,
        image: "res/Lobby/ShopIAP/zingcard_1.png",
        cost: 23000,
        value: 20000,
        syntax: "ZINGXU 20000",
        currency: "vnd",
        phone: "9150"
    },
    {
        id: 2,
        image: "res/Lobby/ShopIAP/zingcard_2.png",
        cost: 57500,
        value: 50000,
        syntax: "ZINGXU 50000",
        currency: "vnd",
        phone: "9150"
    },
    {
        id: 3,
        image: "res/Lobby/ShopIAP/zingcard_2.png",
        cost: 115000,
        value: 100000,
        syntax: "ZINGXU 100000",
        currency: "vnd",
        phone: "9150"
    }
];
ZingCardPanel.STORE_URL = "https://zingplay.com/zcard";


var WaitingPopup = cc.Node.extend({

    ctor: function (txt) {
        this._super();

        this.timeout = 0;

        this.bg = null;
        this.img = null;
        this.txt = null;

        this.bg = new ccui.Scale9Sprite("Lobby/Common/9patch.png");
        this.addChild(this.bg);
        this.bg.setOpacity(180);

        this.img = new cc.Sprite("common/circlewait.png");
        this.addChild(this.img);

        this.txt = BaseLayer.createLabelText();
        this.txt.setString("");
        this.addChild(this.txt);

        this.txt.setString(txt);

        this.img.stopAllActions();
        this.img.runAction(cc.repeatForever(cc.rotateBy(1.2, 360)));

        var w = this.txt.getContentSize().width + this.img.getContentSize().width;
        w *= 1.2;
        var h = this.img.getContentSize().height;
        h *= 2;

        this.bg.setPreferredSize(cc.size(w, h));

        this.img.setPositionX(-w / 2 + this.img.getContentSize().width / 1.5);
        this.txt.setPositionX(this.img.getPositionX() + this.img.getContentSize().width / 1.5 + this.txt.getContentSize().width / 2);
    },

    setTimeout: function (t) {
        if (t)
            this.runAction(cc.sequence(cc.delayTime(t), cc.removeSelf()));
    }
});
WaitingPopup.show = function (txt, timeout) {
    WaitingPopup.clear();

    var p = new WaitingPopup(txt);
    p.setTimeout(timeout);
    p.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
    sceneMgr.layerGUI.addChild(p, 1308, 1308);
};
WaitingPopup.clear = function () {
    var p = sceneMgr.layerGUI.getChildByTag(1308);
    if (p) {
        p.removeFromParent();
    }
};

var SmsSyntaxPopup = BaseLayer.extend({
    ctor: function () {
        this._super("SmsSyntaxPopup");
        this.initWithBinaryFile("SmsSyntaxPopup.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");
        this.customButton("btnClose", 1, this._bg);

        this.syntaxLb = this.getControl("syntax", this._bg);

        this.numberLb = this.getControl("number", this._bg);

        if (Config.ENABLE_QR_SMS_SYNTAX) {
            this.QRimage = new AvatarUI("ShopIAP/testQR.png", "ShopIAP/testQR.png", true);
            this._bg.addChild(this.QRimage);
            this.QRimage.setPositionX(this._bg.getContentSize().width / 2);
        }
    },

    setSyntax: function (syntax, number) {
        this.syntaxLb.setString(syntax);
        this.numberLb.setString(number);

        if (Config.ENABLE_QR_SMS_SYNTAX) {
            var urlQRcode = Constant.LINK_CREATE_QR_CODE + encodeURI("smsto:" + number + ":" + syntax);
            this.QRimage.asyncExecuteWithUrl(encodeURI(syntax + "_" + number), urlQRcode);
        }
    },

    onEnterFinish: function () {
        this.setFog(true);
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        this.onClose();
    }
});
SmsSyntaxPopup.className = "SmsSyntaxPopup";
SmsSyntaxPopup.tag = 504;


var TangVangPopup = BaseLayer.extend({

    ctor: function () {
        this.nodeKM = null;
        this.typeKM = 0;

        this._super("TangVangPopup");
        this.initWithBinaryFile("res/Lobby/TangVangPopup.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customizeButton("btnOK", 1, this._bg);
        this.customizeButton("btnClose", 0, this._bg);

        this.nodeKM = this._bg.getChildByName("bonus");
        this.labelBonus = this.getControl("labelBonus", this._bg);

        this.enableFog();
    },

    onEnterFinish : function () {
        this.setShowHideAnimate(this._bg,true);
        gamedata.startTrackingOffer();
    },

    onButtonRelease: function (button, id) {
        if (id === 1) {
            gamedata.updateInfoTrackingOffer(2);
            var idTab = gamedata.gameConfig.getMaxChannelFirstShopBonus();
            gamedata.openShopInTab(idTab);
        } else {
            gamedata.sendTrackingOffer();
            this.onClose();
        }
    },

    showBonus : function (type) {
        if(type == 1) this.showKhuyenmai1();
        else this.showKhuyenmai2();
    },

    loadInfo : function () {
        this.labelBonus.setString(gamedata.gameConfig.getMaxFirstShopBonus() + "%");
    },

    showKhuyenmai1: function () {
        this.loadInfo();
    },

    showKhuyenmai2: function () {
        this.loadInfo();
    }
});

TangVangPopup.createNodeMoney = function (money) {
    var node = new cc.Node();
    var str = "" + Math.abs(money);
    var thang = (money >= 0);
    var width = 0;
    var height = 0;

    var fix = 0;
    for (var i = 0; i < str.length; i++) {
        //var xx = ret.getPositionX() + ret.getContentSize().width + fix;fix = 0;
        var xx = 0;
        var ret = new cc.Sprite(TangVangPopup.getNumberPath(parseInt(str[i])));
        ret.setPositionX(xx + width);
        node.addChild(ret);
        width += ret.getContentSize().width - 10;
        height = ret.getContentSize().height;


    }
    var ret = new cc.Sprite(TangVangPopup.getNumberPath(-1));
    ret.setPositionX(xx + width);
    node.addChild(ret);
    width += ret.getContentSize().width;

    ret = new cc.Sprite("TangVang/gold.png");
    ret.setPositionX(xx + width + 40);
    node.addChild(ret);
    width += ret.getContentSize().width;

    node.setContentSize(cc.size(width, height));
    node.setAnchorPoint(cc.p(.5, .5));

    return node;
};

TangVangPopup.getNumberPath = function (number) {
    var path = "TangVang/tangvang";
    if (number == -1)
        path += "percent";
    else {
        path += ("so" + number);
    }
    path += ".png";
    return path;
};

TangVangPopup.className = "TangVangPopup";
