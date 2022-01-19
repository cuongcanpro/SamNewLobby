TabGoldPayment = BaseTabShop.extend({
    ctor: function (heightTab) {
        this._super(heightTab);
    },

    initGUI: function () {
        this._super();
    },

    onEnterFinish: function () {
        this._super();
        if (this.selectedTab < 0) {
            this.selectTabMostBought();
        } else {
            this.selectTab(this.selectedTab);
        }
        paymentMgr.sendGetConfigShop(CmdSendGetConfigShop.GOLD, paymentMgr.versionShopGold);
        this.loadArrayChannel(paymentMgr.getArrayChannelGold());
    },

    reloadTab: function () {
        this.selectTab(this.selectedTab);
        paymentMgr.sendGetConfigShop(CmdSendGetConfigShop.GOLD, paymentMgr.versionShopGold);
    },

    selectTabMostBought: function () {
        this.selectTab(paymentMgr.getLastBuyGold());
    },

    selectTab: function (id) {
        cc.log("selectTab ** FIRST : ", id);
        if (paymentMgr.arrayShopGoldConfig[id] == null) id = 0;
        this._super(id);
        this.tabNormalPayment.setVisible(false);
        var idPayment = paymentMgr.arrayShopGoldConfig[id].id;
        if (!cc.sys.isNative) {
            this.tabNormalPayment.getTableView().setTouchEnabled(idPayment != Payment.GOLD_SMS);
        }
        this.showMaintain(false);

        var config = paymentMgr.getShopGoldById(idPayment);
        if (config && config["isMaintained"][0]) {
            this.showMaintain(true);
        } else {
            this.tabNormalPayment.setVisible(true);
            this.tabNormalPayment.setItemType(idPayment);
        }
    },
});