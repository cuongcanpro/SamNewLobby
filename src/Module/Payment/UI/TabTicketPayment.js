TabTicketPayment = BaseTabShop.extend({
    ctor: function (heightTab) {
        this._super(heightTab);
    },

    onEnterFinish: function () {
        this._super();
        if (this.selectedTab < 0) {
            this.selectTab(this.selectedTab);
        }
        this.loadArrayChannel(paymentMgr.getArrayChannelTicket());
    },

    reloadTab: function () {
        this.selectTab(this.selectedTab);
    },

    selectTab: function (id) {
        if (id < 0)
            id = 0;
        this.selectedTab = id;
        this._super(id);
        this.tabNormalPayment.setVisible(false);
        var arrayConfigTicket = eventMgr.getArrayConfigTicket();
        if (!arrayConfigTicket || !arrayConfigTicket[id])
            return;
        var idPayment = arrayConfigTicket[id]["type"];
        if (!cc.sys.isNative) {
            //this.tabNormalPayment.getTableView().setTouchEnabled(idPayment != Payment.GOLD_SMS);
        }
        var idPaymentCheck = idPayment - Payment.BUY_TICKET_FROM;
        this.showMaintain(false);
        if (idPaymentCheck == Payment.GOLD_SMS) {
            for (var i = Payment.GOLD_SMS_VIETTEL; i <= Payment.GOLD_SMS_VINA; i++) {
                config = paymentMgr.getShopGoldById(i);
                if (config && config["isMaintained"][0] === 0) {
                    break;
                }
            }
            if (i === Payment.GOLD_SMS_VINA) {// tat ca cac nha mang deu bao tri
                this.showMaintain(true);
                this.tabNormalPayment.setVisible(false);
            } else {
                this.tabNormalPayment.setVisible(true);
                this.tabNormalPayment.setItemType(idPayment);
            }
        } else {
            var config = paymentMgr.getShopGoldById(idPaymentCheck);
            if (config && config["isMaintained"][0]) {
                this.showMaintain(true);
            } else {
                this.tabNormalPayment.setVisible(true);
                this.tabNormalPayment.setItemType(idPayment);
            }
        }
    },
});