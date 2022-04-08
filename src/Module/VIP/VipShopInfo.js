var VipShopInfo = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("VipShopInfo.json");
    },

    initGUI: function () {
        this.pVip = this.getControl("pVip");
        this.setContentSize(this.pVip.getContentSize());
        this.pVip.setLocalZOrder(1);
        this.customButton("btnEnterVip", 1, this.pVip);
        this.bgProgressVip = this.getControl("bgProgress", this.pVip);
        this.imgVpoint = this.getControl("imgVpoint", this.pVip);
        this.progressVip = this.getControl("progressVip", this.pVip);
        this.txtProgress = this.getControl("txtProgress", this.pVip);
        this.iconNextVip = this.getControl("iconNextVip", this.pVip);
        this.iconCurVip = this.getControl("iconCurVip", this.pVip);
        this.iconNextVip.ignoreContentAdaptWithSize(true);
        this.iconCurVip.ignoreContentAdaptWithSize(true);
        this.txtVip1 = this.getControl("txtVip1", this.pVip);
        this.txtRemainVipTime = this.getControl("txtRemainTime", this.pVip);

        this.arrayDot = [];
        var padX = 22;
        var startX = 45;
        var startY = 12;
        for (var i = 0; i < 34; i++) {
            if (i < 12) {
                this.arrayDot[i] = new ccui.ImageView("Lobby/Common/dotNormal.png");
                this.arrayDot[i].setPosition(startX + padX * i, startY);
                this.pVip.addChild(this.arrayDot[i]);
            } else if (i > 16 && i < 29) {
                this.arrayDot[i] = new ccui.ImageView("Lobby/Common/dotNormal.png");
                this.arrayDot[i].setPosition(startX + padX * (28 - i), startY + 71);
                this.pVip.addChild(this.arrayDot[i]);
            } else {
                this.arrayDot[i] = this.getControl("dot" + i, this.pVip);
            }
            this.arrayDot[i].light = new ccui.ImageView("Lobby/Common/dotLight.png");
            this.arrayDot[i].light.setPosition(cc.p(this.arrayDot[i].width * 0.5, this.arrayDot[i].height * 0.5));
            this.arrayDot[i].addChild(this.arrayDot[i].light);
        }

        // data Effect Dot Vip
        this.timeEffectVip = 0;
        this.stateEffect = 0;

        this.stateEffect = VipShopInfo.STATE_0;
        this.countDot = 0;

        this.stateLight = 0;
        this.length = 1;
        this.base = 2;
        this.excess = 0;
        this.timeBase = 0.25;
    },

    showVipInfo: function (isEffect) {
        var levelVip = VipManager.getInstance().getVipLevel();
        this.txtRemainVipTime.setVisible(levelVip > 0);
        if (levelVip > 0) {
            var remainTimeLabel = StringUtility.replaceAll(localized("VIP_SHOP_TEXT_0"), "@level", levelVip);
            this.txtVip1.setString(remainTimeLabel);
        } else {
            this.txtVip1.setString(LocalizedString.to("VIP_SHOP_NO"));
        }
        this.txtRemainVipTime.setString(VipManager.getRemainTimeString(VipManager.getInstance().getRemainTime()));
        var txtTemp = BaseLayer.createLabelText(this.txtVip1.getString());
        txtTemp.setFontSize(this.txtVip1.getFontSize());
        this.txtRemainVipTime.setPositionX(this.txtVip1.getPositionX() + txtTemp.getContentSize().width + 7.5);

        var texture = VipManager.getIconVip(levelVip);
        if (texture !== "") {
            this.iconCurVip.loadTexture(texture);
            this.iconCurVip.setScale(1);
        } else {
            this.iconCurVip.loadTexture(VipManager.getImageVip(levelVip));
            this.iconCurVip.setScale(0.37);
        }
        if (levelVip >= VipManager.NUMBER_VIP){
            this.iconNextVip.setVisible(false);

            var deltaWidth = this.iconCurVip.width * 0.5;
            this.iconCurVip.x += deltaWidth;
            this.bgProgressVip.x += deltaWidth;
            this.txtVip1.x += deltaWidth;
            this.txtRemainVipTime.x += deltaWidth;
        } else {
            var texture2 = VipManager.getIconVip(levelVip + 1);
            if (texture2 !== ""){
                this.iconNextVip.loadTexture(texture2);
            }
            this.iconNextVip.setVisible(true);

            this.iconCurVip.x = this.iconCurVip.defaultPos.x;
            this.bgProgressVip.x = this.bgProgressVip.defaultPos.x;
            this.txtVip1.x = this.txtVip1.defaultPos.x;
        }

        var nextLevelExp = VipManager.getInstance().getVpointNeed(levelVip);
        var vpoint = VipManager.getInstance().getVpoint();
        // cc.log("vPoint: ", vpoint);
        if (isEffect){
            // VipSceneOld.runEffectProgressVip(this.bgProgressVip, this.progressVip, this.txtProgress, this.imgVpoint, 0.7, 0, vpoint, levelVip, this.iconCurVip, this.iconNextVip);
        } else {
            this.txtProgress.setString(StringUtility.pointNumber(vpoint) + " / " +StringUtility.pointNumber(nextLevelExp));
            var percent = vpoint / nextLevelExp * 100;
            if (levelVip + 1 > VipManager.NUMBER_VIP){
                this.txtProgress.setString(StringUtility.pointNumber(vpoint));
                percent = 100;
            }
            this.progressVip.setPercent(percent);
        }
    },

    onEnterFinish: function () {
        this.stateEffect = VipShopInfo.STATE_0;
        this.countDot = 0;
        for (var i = 0; i < this.arrayDot.length; i++) {
            this.turnLight(i, false);
        }
    },

    onButtonRelease: function (button, id) {
        cc.log("PRESS THE BUTTON");
        if (vipMgr.getVipLevel() <= 0) {
            VipManager.openVip(ShopIapScene.className);
        }
    },

    turnLight: function (index, isOn) {
        if (index >= this.arrayDot.length || index < 0) return;

        var efxTime = 0.15;
        var light = this.arrayDot[index].light;
        light.stopAllActions();
        if (isOn) {
            light.runAction(cc.spawn(
                cc.fadeIn(efxTime).easing(cc.easeOut(2.5)),
                cc.scaleTo(efxTime, 1).easing(cc.easeBackOut())
            ));
        } else {
            light.runAction(cc.spawn(
                cc.fadeOut(efxTime).easing(cc.easeIn(2.5)),
                cc.scaleTo(efxTime, 0).easing(cc.easeBackIn())
            ));
        }
    },

    update: function (dt) {
        VipManager.getInstance().updateTimeVip(dt);
        var remainTime = VipManager.getInstance().getRemainTime();
        this.txtRemainVipTime.setString(VipManager.getRemainTimeString(remainTime));
        this.timeEffectVip = this.timeEffectVip - dt;
        if (this.timeEffectVip < 0) {
            if (this.stateEffect == VipShopInfo.STATE_0) {
                this.turnLight(this.countDot, true);
                this.countDot++;
                if (this.countDot >= this.arrayDot.length) {
                    this.stateEffect = VipShopInfo.STATE_1;
                    this.timeEffectVip = 0.5;
                    this.stateLight = 0;
                }
                else {
                    this.timeEffectVip = 0.05;
                }
            } else if (this.stateEffect == VipShopInfo.STATE_1) {
                for (var i = 0; i < this.arrayDot.length; i++) {
                    this.turnLight(i, this.stateLight % 2 !== 0);
                }
                this.stateLight++;
                if (this.stateLight > 5) {
                    this.stateEffect = VipShopInfo.STATE_2;
                    this.timeEffectVip = 0.5;
                }
                else {
                    this.timeEffectVip = 0.4;
                }
            } else {
                this.timeEffectVip = this.timeBase;
                this.stateEffect = 1 - this.stateEffect;
                if (Math.random() < (1 - this.timeBase) * 0.5) {
                    this.length = 1 + Math.floor(Math.random() * 3);
                    this.base = Math.floor(Math.random() * 3) + 1 + this.length;
                    this.excess = Math.floor(Math.random() * this.base);
                    this.timeBase = 0.2 + Math.random() * 0.1;
                } else {
                    this.excess++;
                    this.excess = this.excess % this.base;
                }
                for (var i = 0; i < this.arrayDot.length; i++) {
                    var isOn = false;
                    for (var j = 0; j < this.length; j++)
                        if (this.excess + j === i % this.base) {
                            isOn = true;
                            break;
                        }
                    this.turnLight(i, isOn);
                }
            }
        }
    }
});

VipShopInfo.STATE_0 = 0;
VipShopInfo.STATE_1 = 1;
VipShopInfo.STATE_2 = 2;