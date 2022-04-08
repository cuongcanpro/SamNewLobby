var GUISupportInfo = BaseLayer.extend({
    ctor: function() {
        this._super(GUISupportInfo.className);

        this.bg = null;
        this.btnX = null;
        this.btnReceive = null;
        this.totalValue = null;
        this.description = null;
        this.valueBonusLevel = null;
        this.valueBonusEvent = null;
        this.imgVip = null;
        this.labelLevel = null;
        this.labelVip = null;

        this.initWithBinaryFile("GUISupportInfo.json");
    },

    initGUI: function() {
        this.bg = this._layout.getChildByName("bg");
        this.btnX = this.customButton("btnX", GUISupportInfo.BTN_X, this.bg);
        this.btnReceive = this.customButton("btnReceive", GUISupportInfo.BTN_RECEIVE, this.bg);
        this.iconArrow = this.getControl("arrow", this.bg);
        this.iconGold = this.getControl("iconGold", this.bg);

        this.totalValue = new NumberGroupCustom("res/Lobby/ShopIAP/Number/num_", -4, NumberGroupCustom.TYPE_POINT, true);
        this.totalValue.setScale(1.05);
        this.totalValue.setPosition(this.btnReceive.getPositionX() - 30, this.btnReceive.getPositionY() + this.btnReceive.getContentSize().height * 0.95);
        this.bg.addChild(this.totalValue);

        this.lbNum = this.getControl("lbNum", this.bg);
        this.lbNum.ignoreContentAdaptWithSize(true);
        this.lbHelp = this.getControl("lbHelp", this.bg);

        this.bgGift = this.getControl("bgGift", this.bg);
        this.bgLevel = this.getControl("bgLevel", this.bgGift);
        this.bgEvent = this.getControl("bgEvent", this.bgGift);
        this.valueBonusLevel = this.getControl("valueBonusLevel", this.bgLevel);
        this.valueBonusEvent = this.getControl("valueBonusEvent", this.bgEvent);
        this.valueBonusVip = this.getControl("valueBonusVip", this.bgGift);

        var bg1 = this.getControl("bgVip", this.bgGift);
        this.imgVip = bg1.getChildByName("icon");
        this.labelLevel = this.getControl("lbBonusLevel", this.bg);
        this.labelVip = this.getControl("lbBonusLevel", this.bg);

        this.pEff = this.getControl("pEff", this.bg);

        this.enableFog();
    },

    onEnterFinish: function() {
        this._super();
        this.setShowHideAnimate(this.bg, true);
        this.scheduleUpdate();
        this.pEff.removeAllChildren();
    },

    update: function (dt) {
        if (Math.random() < 0.1) {
            var paper = new Paper();
            paper.setPosition(cc.p(-cc.winSize.width * 0.5 + this.pEff.getContentSize().width * 0.5, 500));
            this.pEff.addChild(paper);
            paper.startEffect();
        }
        this.iconGold.setPositionX(this.totalValue.getPositionX() + this.totalValue.getContentSize().width * 0.5 + this.iconGold.getContentSize().width * 0.65);
    },

    showGUI: function(money) {
        this.btnReceive.setVisible(false);
        var targetMoney;
        if (money > 0) {
            this.lbHelp.setVisible(false);
            this.totalValue.setNumber(money);
            targetMoney = money;
            if (supportMgr.numSupport == 0)
                this.lbNum.setString(LocalizedString.to("SUPPORT_MONEY_NUM_0"));
            else if (supportMgr.numSupport >= 1)
                this.lbNum.setString(StringUtility.replaceAll(LocalizedString.to("SUPPORT_MONEY_NUM_1"), "@num", supportMgr.numSupport));
            this.btnReceive.setVisible(true);
            this.iconArrow.setVisible(true);
        }
        else {
            var specialSupport = supportMgr.specialSupport.bonusGold;
            if (supportMgr.numSupport <= 0){
                // da het lan ho tro, show thong bao quay lai vao ngay mai
                this.lbHelp.setString(LocalizedString.to("SUPPORT_COMEBACK_TOMORROW"));
                var numSupport = (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) ? (vipMgr.vipConfig[VipManager.getInstance().getVipLevel()].support.length - 1) : (vipMgr.vipConfig[0].support.length - 1);
                this.lbNum.setString(StringUtility.replaceAll(LocalizedString.to("SUPPORT_INFO_2"), "@num", numSupport));
            }
            else {
                // van con lan nhan ho tro nhung chua du dieu kien nhan, show thong bao quay lai nhan khi du dieu kien
                this.lbHelp.setString(LocalizedString.to("SUPPORT_COMEBACK_SUITABLE"));
                this.lbNum.setString(StringUtility.replaceAll(LocalizedString.to("SUPPORT_INFO_2"), "@num", supportMgr.numSupport));

            }
            if (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) {
                targetMoney = levelMgr.getTotalSupportBean(userMgr.getLevel(), vipMgr.vipConfig[VipManager.getInstance().getVipLevel()].support[1]);
            } else {
                targetMoney = levelMgr.getTotalSupportBean(userMgr.getLevel(), vipMgr.vipConfig[0].support[1]);
            }
            this.totalValue.setNumber(targetMoney);
            this.iconArrow.setVisible(false);
        }

        var vipLevel = (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) ? VipManager.getInstance().getVipLevel() : 0;
        this.imgVip.setTexture("Offer/iconVip" + vipLevel + ".png");
        if (vipLevel == 0) {
            this.labelVip.setString("VIP FREE");
        }
        else {
            this.labelVip.setString("VIP " + vipLevel);
        }
        this.valueBonusLevel.setString("+" + levelMgr.getLevelBonus(userMgr.getLevel()) + "%");
        this.valueBonusEvent.setString("+0%");
        this.labelLevel.setString("Bonus Lv " + userMgr.getLevel());
        var vipBonus = (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) ? vipMgr.vipConfig[VipManager.getInstance().getVipLevel()].support[1] : 30000;
        this.valueBonusVip.setString(StringUtility.pointNumber(vipBonus));

        if (levelMgr.getLevelBonus(userMgr.getLevel()) > 0) {
            var startMoney;
            if (VipManager.getInstance().getVipLevel() > 0 && VipManager.getInstance().getRemainTime() > 0) {
                startMoney = vipMgr.vipConfig[VipManager.getInstance().getVipLevel()].support[1];
            } else {
                startMoney = vipMgr.vipConfig[0].support[1];
            }
            this.totalValue.setNumber(startMoney);
            this.totalValue.setTargetNumber(0.5, targetMoney);
            this.bgLevel.runAction(cc.sequence(cc.delayTime(0.4), cc.scaleTo(0.2, 1.2), cc.scaleTo(0.3, 1.0)));
        }
    },

    onButtonRelease: function(button, id) {
        switch(id) {
            case GUISupportInfo.BTN_X:
            case GUISupportInfo.BTN_CLOSE:
                this.bg.stopAllActions();
                this.onClose();
                break;
            case GUISupportInfo.BTN_RECEIVE:
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
});

GUISupportInfo.className = "GUISupportInfo";
GUISupportInfo.BTN_X = 0;
GUISupportInfo.BTN_CLOSE = 1;
GUISupportInfo.BTN_RECEIVE = 2;
GUISupportInfo.BTN_RECEIVED = 3;
GUISupportInfo.tag = 1002;
