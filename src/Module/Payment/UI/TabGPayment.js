TabGPayment = BaseTabShop.extend({
    ctor: function (heightTab) {
        this._super(heightTab);
    },

    initGUI: function () {
        this._super();
        this.tabZing = new ZingCardPanel();
        this.addChild(this.tabZing);
        this.tabZing.setPosition(cc.winSize.width * 0.5, this.heightTab * 0.5);
     //   this.tabZing.setPosition(this.panelCardPos);

    },

    onEnterFinish: function () {
        this._super();
        if (this.selectedTab < 0) {
            this.selectTabMostBought();
        } else {
            this.selectTab(this.selectedTab);
        }
        paymentMgr.sendGetConfigShop(CmdSendGetConfigShop.G, paymentMgr.versionShopG);
        this.loadArrayChannel(paymentMgr.getArrayChannelG());
    },

    reloadTab: function () {
        this.selectTab(this.selectedTab);
        paymentMgr.sendGetConfigShop(CmdSendGetConfigShop.G, paymentMgr.versionShopG);
    },

    selectTabMostBought: function () {
        this.selectTab(paymentMgr.getLastBuyG());
    },

    selectTab: function (id) {
        if (paymentMgr.arrayShopGConfig[id] == null) id = 0;
        this._super(id);
        this.tabNormalPayment.setVisible(false);
        this.tabZing.setVisible(false);
        var idPayment = paymentMgr.arrayShopGConfig[id].id;
        if (!cc.sys.isNative) {
            this.tabNormalPayment.getTableView().setTouchEnabled(idPayment != Payment.G_ZING);
        }
        this.showMaintain(false);
        if (idPayment == Payment.G_ZING) {
            this.tabZing.setVisible(true);
        } else {
            var config = paymentMgr.getShopGById(idPayment);
            if (config && config["isMaintained"][0]) {
                this.showMaintain(true);
            } else {
                this.tabNormalPayment.setVisible(true);
                this.tabNormalPayment.setItemType(idPayment);
            }
        }
    },
});