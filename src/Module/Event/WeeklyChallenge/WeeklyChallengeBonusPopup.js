var WChallengeBonusPopup = BaseLayer.extend({
    ctor: function () {
        this._super(WChallengeBonusPopup.className);

        this.initWithBinaryFile("res/Event/WeeklyChallenge/WeeklyChallengeBonusPopup.json");

    },

    onEnter: function () {
        this._super();

        if (cc.winSize.width/cc.winSize.height > Constant.WIDTH/Constant.HEIGHT) {
            this._scaleRealX = 1;
        }

        this.imgBg.loadTexture("GUIVipNew/bg/bgCommon.png");
        this.imgTitle.loadTexture("GUIVipNew/imgTitleChangeGold.png");
        this.btnReceive.loadTextures("GUIVipNew/btnReceiveNow.png", "GUIVipNew/btnReceiveNow.png", "GUIVipNew/btnReceiveNow.png");
        this.lblNotice.setString(LocalizedString.to("WC_RECEIVED_CLOVER_FROM_SHOP"));

        this.pnLayout.setScale(0.6*this._scaleRealX);
        this.pnLayout.runAction(cc.sequence(
            cc.scaleTo(0.35, this._scaleRealX).easing(cc.easeBackOut(2.0))
            )
        );
    },

    initGUI: function () {
        this.pnLayout = this.getControl("pnLayout");
        this.imgBg = this.getControl("imgBg");
        this.imgTitle = this.getControl("imgTitle");
        this.lblCloverBonus = this.getControl("lblCloverBonus");
        this.lblCloverBonus.setFontName(SceneMgr.FONT_BOLD);
        this.lblCloverBonus.ignoreContentAdaptWithSize(true);
        this.lblNotice = this.getControl("lblNotice");
        this.lblNotice.ignoreContentAdaptWithSize(true);
        this.btnReceive = this.customButton("btnReceive", WChallengeBonusPopup.BTN_RECEIVE);
        this.imgClover = this.getControl("imgClover");
    },

    setCloversBonus: function (clovers) {
        this.lblCloverBonus.setString("+" + StringUtility.standartNumber(clovers));
        this.imgClover.setPositionX(this.btnReceive.x + this.lblCloverBonus.getVirtualRendererSize().width/2);
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case WChallengeBonusPopup.BTN_RECEIVE:
            {
                this.close();
                break;
            }
            default : break;
        }
    },

    close: function () {
        this.pnLayout.runAction(cc.sequence(
            cc.scaleTo(0.35, 0.6*this._scaleRealX).easing(cc.easeBackIn(2.0)),
            cc.callFunc(function(){this.removeFromParent()}.bind(this))
        ));
    }
});

WChallengeBonusPopup.className = "WChallengeBonusPopup";
WChallengeBonusPopup.BTN_RECEIVE = 0;