WChallengeBuyPremiumPopup = BaseLayer.extend({
    ctor: function () {
        this._super(WChallengeBuyPremiumPopup.className);
        this.setPosition(cc.winSize.width*0.6, cc.winSize.height/2);
        this.initWithBinaryFile('res/Event/WeeklyChallenge/BuyPremiumPopup.json');
        this.btnClose.addTouchEventListener(function(render, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                this.close();
            }
        }.bind(this));
        this.btnUnlock.addTouchEventListener(function(render, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                if (gamedata.userData.coin < WChallenge.getInstance().premiumPrice) {
                    SceneMgr.getInstance().showAddGDialog(LocalizedString.to("WC_BUY_PREMIUM_NOT_ENOUGH_G"), this, function (btnID) {
                        if (btnID == Dialog.BTN_OK) {
                            gamedata.openNapG();
                        }
                    });
                }
                else {
                    var cmd = new CmdSendWChallengeBuyPremium();
                    GameClient.getInstance().sendPacket(cmd);
                }
                this.close();
            }
        }.bind(this));
    },
    onEnter: function () {
        this._super();

        WChallenge.getInstance().gui.setBackEnable(false);

        if (cc.winSize.width/cc.winSize.height > Constant.WIDTH/Constant.HEIGHT) {
            this._scaleRealX = 1;
        }

        this.imgAllReward.setOpacity(0);
        this.imgInsReward.setOpacity(0);
        this.imgAllGet.setOpacity(0);
        this.imgInsGet.setOpacity(0);
        this.btnUnlock.setOpacity(0);
        this.btnClose.setOpacity(0);

        this._layout.setScale(0.6*this._scaleRealX);
        this._layout.runAction(cc.sequence(
            cc.scaleTo(0.35, this._scaleRealX).easing(cc.easeBackOut(2.0)),
            cc.callFunc(this.runEffect.bind(this))
            )
        );
    },
    initGUI: function () {
        this.disabledLayer = new WChallengeDisabledLayer();
        this.addChild(this.disabledLayer, 0);
        this._layout.setLocalZOrder(1);
        this.btnClose = this._layout.getChildByName('btnClose');
        this.btnUnlock = this._layout.getChildByName('btnUnlock');
        this.imgPackageName = this._layout.getChildByName("imgPackageName");
        this.imgAllReward= this._layout.getChildByName("imgAllReward");
        this.imgInsReward= this._layout.getChildByName("imgInsReward");
        this.imgAllGet = this._layout.getChildByName("imgAllGet");
        this.imgInsGet = this._layout.getChildByName("imgInsGet");
    },
    close: function () {
        this._layout.runAction(cc.sequence(
            cc.scaleTo(0.35, 0.6*this._scaleRealX).easing(cc.easeBackIn(2.0)),
            cc.callFunc(function(){
                this.removeFromParent();
                WChallenge.getInstance().gui.setBackEnable(true);
            }.bind(this))
        ));
    },
    onBack: function () {
        this.close();
    },
    runEffect: function () {
        var effTime = 0.35;
        this.imgAllReward.setScale(2.5);
        this.imgInsReward.setScale(2.5);
        this.imgAllGet.setScale(2.5);
        this.imgInsGet.setScale(2.5);
        this.btnUnlock.setPositionX(this.btnUnlock.x + 200);
        this.imgPackageName.runAction(cc.sequence(
            cc.callFunc(function () {
                this.imgInsReward.runAction(cc.scaleTo(effTime, 1).easing(cc.easeBackOut(3.0)));
                this.imgInsReward.runAction(cc.fadeIn(effTime));
                this.imgInsGet.runAction(cc.scaleTo(effTime, 1).easing(cc.easeBackOut(3.0)));
                this.imgInsGet.runAction(cc.fadeIn(effTime));
            }.bind(this)),
            cc.delayTime(0.5),
            cc.callFunc(function () {
                this.imgAllReward.runAction(cc.scaleTo(effTime, 1).easing(cc.easeBackOut(3.0)));
                this.imgAllReward.runAction(cc.fadeIn(effTime));
                this.imgAllGet.runAction(cc.scaleTo(effTime, 1).easing(cc.easeBackOut(3.0)));
                this.imgAllGet.runAction(cc.fadeIn(effTime));
            }.bind(this)),
            cc.delayTime(0.5),
            cc.callFunc(function () {
                this.btnUnlock.runAction(cc.moveBy(2*effTime, -200, 0));
                this.btnUnlock.runAction(cc.fadeIn(2*effTime));
            }.bind(this)),
            cc.delayTime(0.4),
            cc.callFunc(function () {
                this.btnClose.runAction(cc.fadeIn(2*effTime));
                this.setBackEnable(true);
            }.bind(this))
        ));
    }
});

WChallengeBuyPremiumPopup.className = 'WChallengeBuyPremiumPopup';
