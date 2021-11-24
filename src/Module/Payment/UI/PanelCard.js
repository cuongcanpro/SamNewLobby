/**
 * Card Vietel, Vina, Mobi : hien khong dung Kenh Payment nay nua
 */

var PanelCard = BaseLayer.extend({

    ctor: function () {
        this.btnViettel = null;
        this.btnMobifone = null;
        this.btnVinaphone = null;
        this.btnZing = null;
        this.btnVinamobile = null;

        this.normalColor = cc.color(152, 130, 166, 0);
        this.selectColor = cc.color(165, 215, 110, 0);

        this.curCardSelect = 0;

        this.btnPurchase = null;

        this.txCard = null;
        this.txSerial = null;

        this._super("PanelCard");
        this.initWithBinaryFile("ShopCardPanel.json");
    },

    initGUI: function () {
        this._layout.setScale(this._scale);

        this.panelCenter = this.getControl("panelCenter");
        this.panelMaintain = this.getControl("panelMaintain");
        this.btnViettel = this.customButton("viettel", PanelCard.BTN_VIETTEL);
        this.btnViettel.img = this.getControl("img", this.btnViettel);
        this.btnViettel.lb = this.getControl("lb", this.btnViettel);

        this.btnMobifone = this.customButton("mobifone", PanelCard.BTN_MOBIFONE);
        this.btnMobifone.img = this.getControl("img", this.btnMobifone);
        this.btnMobifone.lb = this.getControl("lb", this.btnMobifone);

        this.btnVinaphone = this.customButton("vinaphone", PanelCard.BTN_VINAPHONE);
        this.btnVinaphone.img = this.getControl("img", this.btnVinaphone);
        this.btnVinaphone.lb = this.getControl("lb", this.btnVinaphone);

        this.btnZing = this.customButton("zing", PanelCard.BTN_ZING);
        //this.btnZing.img = this.getControl("img", this.btnZing);
        //this.btnZing.lb = this.getControl("lb", this.btnZing);

        this.btnVinamobile = this.customButton("vinamobile", PanelCard.BTN_VINAMOBILE);
        this.btnVinamobile.img = this.getControl("img", this.btnVinamobile);
        this.btnVinamobile.lb = this.getControl("lb", this.btnVinamobile);

        this.btnPurchase = this.customButton("purchase", PanelCard.BTN_PURCHASE);

        var tfCard = this.getControl("txcard");
        var tfSerial = this.getControl("txseri");

        // if (cc.sys.isNative){
        tfCard.setVisible(false);
        this.txCard = BaseLayer.createEditBox(tfCard);
        this.txCard.setTag(AccountInputUI.TF_USERNAME);
        this.txCard.setDelegate(this);
        this.txCard.setPosition(tfCard.getPosition());
        this.panelCenter.addChild(this.txCard);

        tfSerial.setVisible(false);
        this.txSerial = BaseLayer.createEditBox(tfSerial);
        this.txSerial.setTag(AccountInputUI.TF_USERNAME);
        this.txSerial.setDelegate(this);
        this.txSerial.setPosition(tfSerial.getPosition());
        this.panelCenter.addChild(this.txSerial);
        // } else {
        //     this.txCard = tfCard;
        //     this.txSerial = tfSerial;
        // }

        this.curCardSelect = -1;
    },

    onEnterFinish: function () {
        if (this.curCardSelect < 0) {
            if (type == PanelCard.CARD) {
                this.onButtonRelease(null, PanelCard.BTN_VIETTEL);
            } else {
                this.onButtonRelease(null, PanelCard.BTN_ZING);
            }
        }

        if (this.type == PanelCard.ZING) {
            var config = gamedata.gameConfig.getShopGById(Payment.G_ZING);
            if (config) {
                this.panelCenter.setVisible(config["isMaintained"][0] == 0);
                this.panelMaintain.setVisible(config["isMaintained"][0] == 1);
            }
            this.curCardSelect = PanelCard.BTN_ZING;
        }
    },

    autoSelectCard: function () {
        var operator = gamedata.getNetworkTelephone();

        switch (operator) {
            case Constant.ID_VIETTEL: {
                this.onButtonRelease(null, PanelCard.BTN_VIETTEL);
                break;
            }
            case Constant.ID_MOBIFONE: {
                this.onButtonRelease(null, PanelCard.BTN_MOBIFONE);
                break;
            }
            case Constant.ID_VINAPHONE: {
                this.onButtonRelease(null, PanelCard.BTN_VINAPHONE);
                break;
            }
            case Constant.ID_VINAMOBILE: {
                this.onButtonRelease(null, PanelCard.BTN_VINAMOBILE);
                break;
            }
            default : {
                this.onButtonRelease(null, PanelCard.BTN_VIETTEL);
                break;
            }
        }

        this.txCard.setString("");
        this.txSerial.setString("");

        this.updateButton(true);
    },

    updateButton: function (visible) {
        //  this.btnPurchase.setVisible(visible);
    },

    setType: function (type) {
        this.type = type;
        if (type == PanelCard.CARD) {
            this.btnViettel.setVisible(true);
            this.btnVinamobile.setVisible(true);
            this.btnMobifone.setVisible(true);
            this.btnVinaphone.setVisible(true);
            this.btnZing.setVisible(false);
        } else {
            this.btnViettel.setVisible(false);
            this.btnVinamobile.setVisible(false);
            this.btnMobifone.setVisible(false);
            this.btnVinaphone.setVisible(false);
            this.btnZing.setVisible(true);
            this.curCardSelect = PanelCard.BTN_ZING;
        }

    },

    onButtonRelease: function (btn, id) {
        if (id == PanelCard.BTN_PURCHASE) {
            if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                cc.log("VAO DAY NE ");
                var card = this.txCard.getString();
                if (this.type == PanelCard.CARD) {
                    var type = "";
                    if (this.curCardSelect == PanelCard.BTN_VIETTEL)
                        type = Constant.VIETTEL;
                    else if (this.curCardSelect == PanelCard.BTN_MOBIFONE)
                        type = Constant.MOBI;
                    else if (this.curCardSelect == PanelCard.BTN_VINAPHONE)
                        type = Constant.VINA;
                    iapHandler.fakePayment(parseInt(card), type);
                } else {
                    iapHandler.fakePayment(parseInt(card), Constant.G_ZING);
                }
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

                    iapHandler.purchaseCard(this.curCardSelect, card, seri, 0);
                    this.updateButton(false);
                }
            }
        } else {
            //if (id == PanelCard.BTN_VINAMOBILE) {
            //    if (!Config.ENABLE_VINA_MOBILE) {
            //        Toast.makeToast(1.0, localized("COMING_SOON"));
            //        return;
            //    }
            //}
            if (this.type == PanelCard.CARD) {
                this.btnViettel.img.setVisible(id == PanelCard.BTN_VIETTEL);
                this.btnViettel.lb.setColor((id == PanelCard.BTN_VIETTEL) ? this.selectColor : this.normalColor);

                this.btnMobifone.img.setVisible(id == PanelCard.BTN_MOBIFONE);
                this.btnMobifone.lb.setColor((id == PanelCard.BTN_MOBIFONE) ? this.selectColor : this.normalColor);

                this.btnVinaphone.img.setVisible(id == PanelCard.BTN_VINAPHONE);
                this.btnVinaphone.lb.setColor((id == PanelCard.BTN_VINAPHONE) ? this.selectColor : this.normalColor);

                this.btnVinamobile.img.setVisible(id == PanelCard.BTN_VINAMOBILE);
                this.btnVinamobile.lb.setColor((id == PanelCard.BTN_VINAMOBILE) ? this.selectColor : this.normalColor);
                if (gamedata.gameConfig) {
                    var config = gamedata.gameConfig.getShopGById(Payment.G_CARD);
                    if (config) {
                        if (id == PanelCard.BTN_VIETTEL) {
                            this.panelCenter.setVisible(config["isMaintained"][Payment.CARD_VIETTEL] == 0);
                            this.panelMaintain.setVisible(config["isMaintained"][Payment.CARD_VIETTEL] == 1);
                        } else if (id == PanelCard.BTN_VINAPHONE) {
                            this.panelCenter.setVisible(config["isMaintained"][Payment.CARD_VINA] == 0);
                            this.panelMaintain.setVisible(config["isMaintained"][Payment.CARD_VINA] == 1);
                        } else if (id == PanelCard.BTN_VINAMOBILE) {
                            this.panelCenter.setVisible(config["isMaintained"][Payment.CARD_VINAMOBILE] == 0);
                            this.panelMaintain.setVisible(config["isMaintained"][Payment.CARD_VINAMOBILE] == 1);
                        } else if (id == PanelCard.BTN_MOBIFONE) {
                            this.panelCenter.setVisible(config["isMaintained"][Payment.CARD_MOBI] == 0);
                            this.panelMaintain.setVisible(config["isMaintained"][Payment.CARD_MOBI] == 1);
                        }
                    }
                }
            } else {

            }
            this.curCardSelect = id;
        }
    }
});
PanelCard.CARD = 0;
PanelCard.ZING = 1;
PanelCard.BTN_VIETTEL = 4;
PanelCard.BTN_MOBIFONE = 2;
PanelCard.BTN_VINAPHONE = 3;
PanelCard.BTN_ZING = 1;
PanelCard.BTN_VINAMOBILE = 45;
PanelCard.BTN_CLOSE = 10;
PanelCard.BTN_PURCHASE = 10;