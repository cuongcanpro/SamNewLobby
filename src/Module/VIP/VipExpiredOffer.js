var VipExpiredOffer = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("VipExpiredOffer.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.customButton("btnClose", VipExpiredOffer.BTN_CLOSE, this.bg);
        this.customButton("btnBuy", VipExpiredOffer.BTN_BUY, this.bg);
        this.pOffer = this.getControl("pOffer");
        this.theOffer = new ItemIapCell(this.pOffer);
        this.pOffer.addChild(this.theOffer);

        this.setBackEnable(true);
        this.enableFog();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg);
        this.itemType = -1;

        var arrayChanel = paymentMgr.getArrayChannelGold();
        cc.log("paymentMgr.getArrayChannelGold()", JSON.stringify(arrayChanel));
        if (arrayChanel.length > 0) {
            if (paymentMgr.arrayShopGoldConfig[arrayChanel[0]["index"]] !== null) {
                var idPayment = paymentMgr.arrayShopGoldConfig[arrayChanel[0]["index"]].id;
                var infoArray = shopData.getDataByPaymentId(idPayment);
                if (infoArray.length > 0) {
                    this.theOffer.setInfo(infoArray[0]);
                    this.itemType = idPayment;
                    return;
                }
            }
        }
        this.theOffer.setVisible(false);
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case VipExpiredOffer.BTN_CLOSE:
                this.onClose();
                break;
            case VipExpiredOffer.BTN_BUY:
                paymentMgr.initiatePayment(this.theOffer, this.itemType);
                break;
        }
    }
});
VipExpiredOffer.className = "VipExpiredOffer";
VipExpiredOffer.BTN_CLOSE = 0;
VipExpiredOffer.BTN_BUY = 1;