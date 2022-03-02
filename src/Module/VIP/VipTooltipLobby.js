var VipTooltipLobby = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("Vip_TooltipLobby.json");
    },

    initGUI: function () {
        this.pTooltipVip = this.getControl("pTooltipVip");
        this.setContentSize(this.pTooltipVip.getContentSize());

        this.pTooltipVip.defaultPos = this.pTooltipVip.getPosition();
        this.bgTooltip = this.getControl("bgTooltip", this.pTooltipVip);
        this.bgTooltip.defaultPos = this.bgTooltip.getPosition();
        var iconVip = this.getControl("iconVip", this.bgTooltip);
        iconVip.ignoreContentAdaptWithSize(true);
        iconVip.setVisible(false);
        this.bgTooltip.iconVip = new ccui.Scale9Sprite(VipManager.getIconVip(1));
        iconVip.getParent().addChild(this.bgTooltip.iconVip);
        this.bgTooltip.iconVip2 = iconVip;
        this.bgTooltip.iconVip.setPosition(iconVip.getPosition());
        this.bgTooltip.txtVip = this.getControl("txtVip", this.bgTooltip);
        this.bgTooltip.txtRemain = this.getControl("txtRemain", this.bgTooltip);
        this.bgTooltip.txtTimeRemain = this.getControl("txtTimeRemain", this.bgTooltip);
        // this.pTooltipVip.setVisible(false);
    },

    updateVipInfo: function () {
        var vipLevel = VipManager.getInstance().getVipLevel();
        var state = (VipManager.getInstance().getRemainTime() > 0) ? 0 : 1;
        this.bgTooltip.iconVip.setState(state);
        var texture = VipManager.getIconVip(vipLevel);
        // cc.log("updateVipInfo: ", texture, vipLevel);
        if (texture !== "" && vipLevel > 0) {
            try {
                this.bgTooltip.iconVip2.loadTexture(texture);
                this.bgTooltip.iconVip.initWithFile(texture);
                this.bgTooltip.iconVip.setContentSize(this.bgTooltip.iconVip2.getContentSize());
                this.bgTooltip.iconVip2.setVisible(false);
            } catch (e) {
                this.bgTooltip.iconVip.setVisible(false);
                this.bgTooltip.iconVip2.setVisible(true);
                this.bgTooltip.iconVip2.loadTexture(texture);
            }
        }

        if (vipLevel === 0) {
            return;
        }
        cc.log("SHOW TOOOL TIP *** ");
        this.pTooltipVip.stopAllActions();
        this.bgTooltip.stopAllActions();
        var distanceY = this.bgTooltip.getContentSize().height;
        this.pTooltipVip.setPosition(this.pTooltipVip.defaultPos);
        this.bgTooltip.setPosition(this.bgTooltip.defaultPos);
        this.pTooltipVip.setPositionY(this.pTooltipVip.defaultPos.y + distanceY);
        this.bgTooltip.setPositionY(this.bgTooltip.defaultPos.y - distanceY);
        var actionMoveBy = cc.moveBy(0.2, 0, distanceY);
        this.pTooltipVip.setVisible(true);
        var timeOff = 5;
        var timeOn = 5;
        var delayFirst = 1;
        this.pTooltipVip.runAction(cc.sequence(cc.delayTime(delayFirst), actionMoveBy.reverse(), cc.delayTime(timeOn), actionMoveBy.clone(), cc.delayTime(timeOff - delayFirst)).repeatForever());
        this.bgTooltip.runAction(cc.sequence(cc.delayTime(delayFirst), actionMoveBy.clone(), cc.delayTime(timeOn), actionMoveBy.clone().reverse(), cc.delayTime(timeOff - delayFirst)).repeatForever());

        this.bgTooltip.txtVip.setString(StringUtility.replaceAll(localized("VIP_NAME"), "@level", vipLevel));
        var remainVipTime = VipManager.getInstance().getRemainTime();
        this.bgTooltip.txtRemain.setVisible(remainVipTime > 0);
        this.bgTooltip.txtTimeRemain.setString(VipManager.getRemainTimeString(remainVipTime));
        var txtTemp = BaseLayer.createLabelText(this.bgTooltip.txtVip.getString());
        this.bgTooltip.txtRemain.setPositionX(this.bgTooltip.txtVip.getPositionX() + txtTemp.getContentSize().width + 5);
    },

    onEnterFinish: function () {

    },

    update: function (dt) {
        var remainTime = VipManager.getInstance().getRemainTime();
        this.bgTooltip.txtTimeRemain.setString(VipManager.getRemainTimeString(remainTime));
    }
});