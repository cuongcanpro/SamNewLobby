var GUISupportSpecial = BaseLayer.extend({
    ctor: function () {
        this._super(GUISupportSpecial.className);
        this.initWithBinaryFile("GUISupportSpecial.json");
    },

    initGUI: function () {
        this.bg = this._layout.getChildByName("bg");
        this.btnX = this.customButton("btnX", GUISupportSpecial.BTN_X, this.bg);

        this.pReceive = this.getControl("pReceive", this.bg);
        this.btnReceive = this.customButton("btnReceive", GUISupportSpecial.BTN_RECEIVE, this.pReceive);

        this.totalValue = new NumberGroupCustom("res/Lobby/ShopIAP/Number/num_", -5, NumberGroupCustom.TYPE_POINT, true);
        this.totalValue.setScale(1.3);
        this.totalValue.setPosition(this.btnReceive.getPositionX(), this.btnReceive.getPositionY() + this.btnReceive.getContentSize().height * 1.4);
        this.pReceive.addChild(this.totalValue);

        this.pHelp = this.getControl("pHelp", this.bg);
        this.btnBuy = this.customButton("btnBuy", GUISupportSpecial.BTN_BUY, this.pHelp);
        this.lbTime = this.getControl("lbTime", this.pHelp);

        this.pEff = this.getControl("pEff", this.bg);
        this.enableFog();
    },

    showInfo: function (gold) {
        this.pReceive.setVisible(gold > 0);
        this.pHelp.setVisible(gold <= 0);
        if (gold > 0) {
            this.totalValue.setNumber(gold);
        }
        else {
            var checkSpecial = supportMgr.checkInSpecialTimeSupport();
            this.lbTime.setString(checkSpecial.time);
        }
    },

    onButtonRelease: function(button, id) {
        cc.log("sdflkj" + id);
        switch(id) {
            case GUISupportSpecial.BTN_X:
                this.bg.stopAllActions();
                this.onClose();
                break;
            case GUISupportSpecial.BTN_BUY:
                cc.log("sdflkj");
                this.bg.stopAllActions();
                paymentMgr.openShop();
                this.onClose();
                break;
            case GUISupportSpecial.BTN_RECEIVE:
                this.runAction(cc.sequence(
                    cc.callFunc(function () {
                        this.coinEffect();
                        this.btnReceive.setTouchEnabled(false);
                        this.btnReceive.runAction(cc.fadeOut(0.5));
                    }.bind(this)),
                    cc.delayTime(2),
                    cc.callFunc(function () {
                        this.bg.stopAllActions();
                        this.onClose();
                    }.bind(this))
                ));
                break;
        }

        popUpManager.removePopUp(PopUpManager.SUPPORT);
    },

    coinEffect: function () {
        this.pEff.removeAllChildren();
        var size = this.pEff.getBoundingBox();
        var coinEffect = new CoinFallEffect();
        coinEffect.setPosition(0, 0);
        coinEffect.setPositionCoin(cc.p(size.width / 2, size.height / 2));
        coinEffect.setContentSize(size.width * 0.5, size.height * 0.5);
        coinEffect.setVisible(false);

        this.pEff.addChild(coinEffect);
        var num = 30;
        if (this.money > 300000) num = 60;
        else if (this.money > 1000000) num = 100;
        else if (this.money > 10000000) num = 150;
        coinEffect.startEffect(num, CoinFallEffect.TYPE_FLOW);
        coinEffect.setAutoRemove(true);

        if (settingMgr.sound) {
            cc.audioEngine.playEffect(lobby_sounds["coinFall"], false);
        }
    }
})


GUISupportSpecial.className = "GUISupportSpecial";
GUISupportSpecial.BTN_X = 0;
GUISupportSpecial.BTN_BUY = 1;
GUISupportSpecial.BTN_RECEIVE = 2;
GUISupportSpecial.tag = 1004;