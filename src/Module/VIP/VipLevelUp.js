var VipLevelUp = BaseLayer.extend({
    ctor: function () {
        this._super(VipLevelUp.className);
        this.initWithBinaryFile("VipLevelUp.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.btnClose = this.customButton("btnClose", VipLevelUp.BTN_CLOSE);

        this.oldVip = this.getControl("imgOldVip", this.bg);
        this.oldVip.setCascadeOpacityEnabled(false);
        this.oldVip.setOpacity(0);
        this.oldVip.effect = db.DBCCFactory.getInstance().buildArmatureNode("Gem");
        this.oldVip.effect.setPosition(cc.p(this.oldVip.width / 2, this.oldVip.height / 2));
        this.oldVip.addChild(this.oldVip.effect);
        this.newVip = this.getControl("imgNewVip", this.bg);
        this.newVip.setCascadeOpacityEnabled(false);
        this.newVip.setOpacity(0);
        this.newVip.highlight = db.DBCCFactory.getInstance().buildArmatureNode("HighlightBig");
        this.newVip.highlight.setPosition(cc.p(this.newVip.width / 2, this.newVip.height / 2));
        this.newVip.addChild(this.newVip.highlight);
        this.newVip.effect = db.DBCCFactory.getInstance().buildArmatureNode("Gem");
        this.newVip.effect.setPosition(cc.p(this.newVip.width / 2, this.newVip.height / 2));
        this.newVip.addChild(this.newVip.effect);

        this.pLight = this.getControl("pLight", this.bg);
        this.pLight.vipSparkle = this.getControl("vipSparkle", this.pLight);

        var pBenefit = this.getControl("pBenefit", this.bg);
        this.benefit = new VipBenefitNode();
        this.benefit.setPosition(cc.p(pBenefit.width / 2, pBenefit.height / 2));
        pBenefit.addChild(this.benefit);

        this.level = this.getControl("level", this.bg);
        this.lbGuide = this.getControl("lbGuide", this.bg);

        this.enableFog();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg);
        this.pLight.setScale(0);
        this.pLight.vipSparkle.removeAllChildren();
        this.btnClose.setVisible(false);

        this.scheduleUpdate();
    },

    setInfo: function (oldLevel, newLevel) {
        this.oldLevel = oldLevel;
        this.newLevel = newLevel;

        this.benefit.setBenefit(this.oldLevel, false);
        this.benefit.updatePosition(0);
        var pBenefit = this.getControl("pBenefit", this.bg);
        pBenefit.setScale(0);
        pBenefit.runAction(cc.sequence(
            cc.delayTime(0.25),
            cc.scaleTo(0.15, 0.95).easing(cc.easeBackOut())
        ));
        this.benefit.turnOnOffTime(false);

        var timeEffect = 0.5;
        var timeDelay = 1;
        if (this.oldLevel > 0) {
            this.oldVip.effect.setVisible(true);
            this.oldVip.effect.gotoAndPlay("lv" + this.oldLevel + "_1", -1, -1, 0);
            this.level.setString("VIP " + this.oldLevel);
        } else {
            this.oldVip.effect.setVisible(false);
            this.oldVip.setOpacity(255);
            this.level.setString("VIP FREE");
        }
        this.oldVip.setScale(1);
        this.oldVip.runAction(cc.sequence(
            cc.delayTime(timeDelay),
            cc.scaleTo(timeEffect, 0).easing(cc.easeBackIn())
        ))

        this.newVip.setScale(0);
        this.newVip.highlight.setVisible(false);
        this.newVip.runAction(cc.sequence(
            cc.delayTime(timeDelay + timeEffect),
            cc.callFunc(function () {
                this.newVip.effect.gotoAndPlay("lv" + this.newLevel + "_0", -1, -1, 1);
                this.newVip.effect.setCompleteListener(function () {
                    this.newVip.effect.gotoAndPlay("lv" + this.newLevel + "_1", -1, -1, 0);
                    this.runLight();
                }.bind(this));
            }.bind(this)),
            cc.scaleTo(0.1, 1.5),
            cc.callFunc(function () {
                this.newVip.highlight.setVisible(true);
                this.newVip.highlight.gotoAndPlay("1" , 0, -1, 1);

                this.level.setPosition(this.level.defaultPos);
                this.level.setScale(2);
                this.level.setString("VIP " + this.newLevel);
                this.level.runAction(cc.spawn(
                    cc.fadeIn(0.1),
                    cc.scaleTo(0.25, 1).easing(cc.easeIn(5))
                ));
            }.bind(this)),
            cc.delayTime(timeEffect * 2 - 0.1),
            cc.callFunc(this.effectLevelUp.bind(this))
        ));

        this.level.setString("VIP " + (this.oldLevel > 0? this.oldLevel : "FREE"));
        this.level.runAction(cc.sequence(
            cc.delayTime(timeDelay),
            cc.spawn(
                cc.fadeOut(timeEffect).easing(cc.easeOut(2.5)),
                cc.moveTo(timeEffect, cc.p(this.level.defaultPos.x, this.level.defaultPos.y - this.level.height))
            )
        ));

        this.lbGuide.setOpacity(0);
    },

    effectLevelUp: function () {
        this.benefit.setBenefit(this.newLevel);
        this.benefit.updatePosition(0.25);
        this.benefit.turnOffReceivedStamp();

        this.lbGuide.runAction(cc.fadeIn(1).easing(cc.easeIn(2.5)));
    },

    runLight: function () {
        for (var i = 0; i < 2; i++) {
            var light = this.getControl("light_" + i, this.pLight);
            VipScene.runLightEffect(light, i);
        }
        this.pLight.runAction(cc.sequence(
            cc.scaleTo(0.5, 1).easing(cc.easeBackOut()),
            cc.callFunc(function () {
                this.btnClose.setVisible(true);
            }.bind(this))
        ));
    },

    onButtonRelease: function (button, id) {
        this.btnClose.setVisible(false);
        this.lbGuide.setVisible(false);
        vipMgr.checkShowDailyBonus();
        VipManager.showUpLevelVipBonus(this.oldLevel, this.newLevel);
    },

    update: function (dt) {
        if (Math.random() < 0.025) {
            var vipSparkle = new VipSparkle();
            this.pLight.vipSparkle.addChild(vipSparkle);
            vipSparkle.startEffect();
        }
    },

    effectReceived: function () {
        this.benefit.runEffectReceive();
        setTimeout(function () {
            this.onClose();
        }.bind(this), 1000);
    }
})
VipLevelUp.className = "VipLevelUp";
VipLevelUp.BTN_CLOSE = 0;