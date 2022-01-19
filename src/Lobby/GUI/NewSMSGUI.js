/**
 * Create by Dongpp
 */

var NewSMSGUI = BaseLayer.extend({
    ctor: function (_parent, _tbSize, _itemSize) {
        this.guiParent = _parent;
        this.tbList = null;
        this.tbSize = _tbSize;
        this.itemSize = _itemSize;
        this._super("NewSMSGUI");
        this.initWithBinaryFile("NewSMSLayer.json");
    },

    onEnterFinish: function(){
        cc.log("ON ENTER FINISH ESMS GUI *** ");
        this.autoSelectTab();
    },

    show: function () {
        this.setVisible(true);
        cc.log("CURRENT TAB " + this.currentTab);
        this.onButtonRelease(null, this.currentTab);
    },

    initGUI: function () {
        this.bg = this.getControl("bg");

        this.btnViettel = this.customButton("btnViettel", NewSMSGUI.BTN_VIETTEL, this.bg, false);
        this.btnViettel.imgOff = this.getControl("imgOff", this.btnViettel);
        this.btnViettel.imgMaintain = this.getControl("imgMaintain", this.btnViettel);
        this.btnViettel.imgMaintain.setVisible(false);

        this.btnMobi = this.customButton("btnMobi", NewSMSGUI.BTN_MOBI, this.bg, false);
        this.btnMobi.imgOff = this.getControl("imgOff", this.btnMobi);
        this.btnMobi.imgMaintain = this.getControl("imgMaintain", this.btnMobi);
        this.btnMobi.imgMaintain.setVisible(false);

        this.btnVina = this.customButton("btnVina", NewSMSGUI.BTN_VINA, this.bg, false);
        this.btnVina.imgOff = this.getControl("imgOff", this.btnVina);
        this.btnVina.imgMaintain = this.getControl("imgMaintain", this.btnVina);
        this.btnVina.imgMaintain.setVisible(false);

        var bgSize = this.bg.getContentSize();
        var tableSize =  cc.size(this.tbSize.width, this.tbSize.height - this.itemSize.height + 5);

        this.tabSMS = new PanelIapItem(this, tableSize, this.itemSize);
//        this.tabSMS.setItemType(Payment.GOLD_SMS_VIETTEL);
        this._layout.addChild(this.tabSMS);

        // this.bg.setPositionY(this.bg.getPositionY() + this.itemSize.height - 3);
        this.bg.setPositionY(tableSize.height + this.itemSize.height/2 - 5);
    },

    updateData: function () {
        this.tabSMS.tbList.reloadData();
    },

    autoSelectTab: function(){
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

        var networkInfo = operator;
        var targetDefault = NewSMSGUI.BTN_VIETTEL;
        switch (networkInfo) {
            case Constant.ID_VIETTEL:
            {
                targetDefault = NewSMSGUI.BTN_VIETTEL;
                break;
            }
            case Constant.ID_MOBIFONE:
            {
                targetDefault = NewSMSGUI.BTN_MOBI;
                break;
            }
            case Constant.ID_VINAPHONE:
            {
                targetDefault = NewSMSGUI.BTN_VINA;
                break;
            }
            default :
            {
                targetDefault = NewSMSGUI.BTN_VIETTEL;
                break;
            }
        }

        var targetTab = 0;
        for (var i = 6; i < gamedata.gameConfig.arrayShopGoldConfig.length; i++){
            if (gamedata.gameConfig.arrayShopGoldConfig[i].type === gamedata.gameConfig.lastBuyGoldType){
                targetTab = i;
                break;
            }
        }
        var buttonId = -1;
        var config = gamedata.gameConfig.arrayShopGoldConfig[targetTab];
        // cc.log("old config:" + JSON.stringify(config));
        switch (config && config["name"]){
            case "sms_viettel":
            {
                buttonId = NewSMSGUI.BTN_VIETTEL;
                break;
            }
            case "sms_mobifone":
            {
                buttonId = NewSMSGUI.BTN_MOBI;
                break;
            }
            case "sms_vinaphone":
            {
                buttonId = NewSMSGUI.BTN_VINA;
                break;
            }
        }

        cc.log("auto select sms: " + targetTab, buttonId, targetDefault, networkInfo);

        if (buttonId >= 0){
            this.onButtonRelease(null, buttonId);
            return;
        }

        this.onButtonRelease(null, targetDefault);
    },

    selectItem: function(info, type){
        this.guiParent.saveGold = info.goldNew;
        // cc.log("select item: " , JSON.stringify(info), type);
        var configSMS = gamedata.gameConfig.getShopGoldById(type);
        var operator = 0;
        switch (type) {
            case Payment.GOLD_SMS_VIETTEL:
            {
                operator = PanelCard.BTN_VIETTEL;
                break;
            }
            case Payment.GOLD_SMS_MOBI:
            {
                operator = PanelCard.BTN_MOBIFONE;
                break;
            }
            case Payment.GOLD_SMS_VINA:
            {
                operator = PanelCard.BTN_VINAPHONE;
                break;
            }
        }
        if (configSMS && configSMS["isMaintained"][0]) {
            sceneMgr.openGUI(GUIMaintainSMS.className, GUIMaintainSMS.TAG, GUIMaintainSMS.TAG);
        }
        else {
            PaymentUtils.requestSMSSyntax(operator, parseInt(info.cost), parseInt(info.smsType), type);
        }
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case NewSMSGUI.BTN_VIETTEL:
            case NewSMSGUI.BTN_MOBI:
            case NewSMSGUI.BTN_VINA:
            {
                this.currentTab = id;
                var itemType = id + Payment.GOLD_SMS_VIETTEL - 1;
                var config = gamedata.gameConfig.getShopGoldById(itemType);
                if (config && config["isMaintained"][0] !== 0) {
                    this.autoSelectTabNotMaintain();
                    break;
                }
                this.tabSMS.setItemType(itemType);
                this.btnViettel.imgOff.setVisible(id !== NewSMSGUI.BTN_VIETTEL);
                this.btnMobi.imgOff.setVisible(id !== NewSMSGUI.BTN_MOBI);
                this.btnVina.imgOff.setVisible(id !== NewSMSGUI.BTN_VINA);
                break;
            }
        }
    },

    autoSelectTabNotMaintain: function () {
        for (var i = Payment.GOLD_SMS_VIETTEL; i <= Payment.GOLD_SMS_VINA; i++){
            var config = gamedata.gameConfig.getShopGoldById(i);
            if (config && config["isMaintained"][0] === 0) {
                this.onButtonRelease(null, i - Payment.GOLD_SMS_VIETTEL + 1);
                return;
            }
        }
    }
});

NewSMSGUI.className = "NewSMSGUI";

NewSMSGUI.BTN_VIETTEL = 1;
NewSMSGUI.BTN_MOBI = 2;
NewSMSGUI.BTN_VINA = 3;