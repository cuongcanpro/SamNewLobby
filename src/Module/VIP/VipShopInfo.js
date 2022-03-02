var VipShopInfo = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("VipShopInfo.json");
    },

    initGUI: function () {
        this.pVip = this.getControl("pVip");
        this.setContentSize(this.pVip.getContentSize());
        this.pVip.setLocalZOrder(1);
        // this.customButton("btnEnterVip", ShopIapthis.BTN_VIP, this.pVip);
        this.bgProgressVip = this.getControl("bgProgress", this.pVip);
        this.imgVpoint = this.getControl("imgVpoint", this.pVip);
        this.imgVpoint.setVisible(false);
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
            }
            else if (i > 16 && i < 29) {
                this.arrayDot[i] = new ccui.ImageView("Lobby/Common/dotNormal.png");
                this.arrayDot[i].setPosition(startX + padX * (28 - i), startY + 71);
                this.pVip.addChild(this.arrayDot[i]);
            }
            else {
                this.arrayDot[i] = this.getControl("dot" + i, this.pVip);
            }
        }

        // data Effect Dot Vip
        this.timeEffectVip = 0;
        this.stateEffect = 0;
    },

    showVipInfo: function (isEffect) {
        var levelVip = VipManager.getInstance().getVipLevel();
        this.txtVip1.setVisible(levelVip > 0);
        this.iconCurVip.setVisible(levelVip > 0);
        this.txtRemainVipTime.setVisible(levelVip > 0);
        var titvarime = StringUtility.replaceAll(localized("VIP_SHOP_TEXT_0"), "@level", levelVip);
        this.txtVip1.setString(titvarime);
        this.txtRemainVipTime.setString(VipManager.getRemainTimeString(VipManager.getInstance().getRemainTime()));
        var txtTemp = BaseLayer.createLabelText(this.txtVip1.getString());
        txtTemp.setFontSize(this.txtVip1.getFontSize());
        this.txtRemainVipTime.setPositionX(this.txtVip1.getPositionX() + txtTemp.getContentSize().width + 3);

        var texture = VipManager.getIconVip(levelVip);
        if (texture !== ""){
            this.iconCurVip.loadTexture(texture);
        }
        if (levelVip >= VipManager.NUMBER_VIP){
            this.iconNextVip.setVisible(false);
        } else {
            var texture2 = VipManager.getIconVip(levelVip + 1);
            if (texture2 !== ""){
                this.iconNextVip.loadTexture(texture2);
            }
            this.iconNextVip.setVisible(true);
        }

        var nextLevelExp = VipManager.getInstance().getVpointNeed(levelVip);
        var vpoint = VipManager.getInstance().getVpoint();
        // cc.log("vPoint: ", vpoint);
        if (isEffect){
            VipSceneOld.runEffectProgressVip(this.bgProgressVip, this.progressVip, this.txtProgress, this.imgVpoint, 0.7, 0, vpoint, levelVip, this.iconCurVip, this.iconNextVip);
        } else {
            this.txtProgress.setString(StringUtility.pointNumber(vpoint) + " / " +StringUtility.pointNumber(nextLevelExp));
            var percent = vpoint / nextLevelExp * 100;
            if (levelVip + 1 > VipManager.NUMBER_VIP){
                this.txtProgress.setString(StringUtility.pointNumber(vpoint));
                percent = 100;
            }
            this.progressVip.setPercent(percent);
            this.imgVpoint.setPositionX(this.bgProgressVip.getContentSize().width * percent / 100);
        }
    },

    onEnterFinish: function () {
    },

    update: function (dt) {
        VipManager.getInstance().updateTimeVip(dt);
        var remainTime = VipManager.getInstance().getRemainTime();
        this.txtRemainVipTime.setString(VipManager.getRemainTimeString(remainTime));
        this.timeEffectVip = this.timeEffectVip - dt;
        if (this.timeEffectVip < 0) {
            this.timeEffectVip = 0.2;
            this.stateEffect = 1 - this.stateEffect;
            for (var i = 0; i < this.arrayDot.length; i++) {
                if (i % 2 == this.stateEffect) {
                    this.arrayDot[i].loadTexture("Lobby/Common/dotNormal.png");
                }
                else {
                    this.arrayDot[i].loadTexture("Lobby/Common/dotLight.png");
                }
            }
        }
    }
});