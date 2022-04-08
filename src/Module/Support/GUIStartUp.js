var GUIStartUp = BaseLayer.extend({

    ctor: function () {
        this._lbNotice = null;
        this._posMoney = null;
        this._moneyGroup = null;
        this._type = -1;

        this._super(GUIStartUp.className);
        this.initWithBinaryFile("GUIStartUp.json");
    },

    initGUI : function () {
        this.pStar = this.getControl("pStar");
        var bg = this.getControl("bg");
        this.bg = bg;

        this.btnOk = this.customizeButton("btnOK",1, bg);
        this._lbNotice = ccui.Helper.seekWidgetByName(bg,"lbNotice");
        this.lbGold = this.getControl("lbGold");

        this.pEff = this.getControl("pEff");
        this.arrayLight = [];
        this.pLight = this.getControl("pLight");
        for (var i = 0; i < 5; i++) {
            this.arrayLight[i] = this.getControl("iconLight_" + i);
        }

        this.arrayStar = [];
        this.enableFog();
        this._listener.setSwallowTouches(false);
        this.timeEffect = 0;
        this.countLight = 0;
        this.timeStar = 0;
    },

    onEnterFinish : function () {
        this.setShowHideAnimate(this.bg,true);
        this.scheduleUpdate();

        this.pStar.setOpacity(255);
    },

    update: function (dt) {
        this.timeEffect = this.timeEffect - dt;
        if (this.timeEffect < 0) {
            this.countLight++;
            if (this.countLight >= this.arrayLight.length) {
                this.countLight = 0;
            }
            this.timeEffect = 0.5;
            var light = this.arrayLight[this.countLight];
            light.stopAllActions();
            light.setScale(0);
            light.runAction(cc.sequence(
                cc.scaleTo(0.5, 2.0),
                cc.scaleTo(1.0, 0.0)
            ))
            light.runAction(cc.sequence(
                cc.fadeIn(0.2),
                cc.delayTime(0.8),
                cc.fadeOut(1.0)
            ))
            light.runAction(cc.rotateBy(3.0,359));
        }
        this.timeStar = this.timeStar - dt;
        if (this.timeStar < 0) {
            this.timeStar = 0.2;
            var star = this.getStar();
            star.stopAllActions();
            star.setPosition(0, 0);
            var randomX = this.bg.getContentSize().width * (0.4 - Math.random() * 0.8) + star.getPositionX();
            var randomY = this.bg.getContentSize().height * (0.5 - Math.random() * 0.2) + star.getPositionY();
            star.runAction(cc.sequence(cc.moveTo(4.0, cc.p(randomX, randomY)), cc.hide()));
            star.runAction(cc.sequence(cc.delayTime(3.8), cc.fadeOut(0.2)));
            star.runAction(cc.sequence(
                cc.fadeTo(0.1, 125 * Math.random()),
                cc.delayTime(0.1),
                cc.fadeIn(0.1)
            ).repeatForever());
            star.runAction(cc.rotateBy(0.1, 30).repeatForever());
        }
    },

    getStar: function () {
        var i;
        var star;
        for (i = 0; i < this.arrayStar.length; i++) {
            if (this.arrayStar[i].isVisible()) {
                star = this.arrayStar[i];
            }
        }
        if (i == this.arrayStar.length) {
            star = new cc.Sprite("SupportGUI/star.png");
            this.pStar.addChild(star);
            this.arrayStar.push(star);
        }
        star.setVisible(true);
        return star;
    },

    showSupportStartup : function () {
        cc.log("show start up nay");
        this.lbGold.setString(StringUtility.pointNumber(supportMgr.dailyGift) + " GOLD");
    },

    showCoinEffect: function () {
        this.pEff.removeAllChildren();
        var size = this.pEff.getBoundingBox();
        var coinEffect = new CoinFallEffect();
        coinEffect.setPosition(0, 0);
        coinEffect.setPositionCoin(cc.p(size.width / 2, size.height / 2));
        coinEffect.setContentSize(size.width * 0.5, size.height * 0.5);
        coinEffect.setVisible(false);

        this.pEff.addChild(coinEffect);
        var num = 150;
        coinEffect.startEffect(num, CoinFallEffect.TYPE_FLOW);
        coinEffect.setAutoRemove(true);

        if (settingMgr.sound) {
            cc.audioEngine.playEffect(lobby_sounds["coinFall"], false);
        }
    },

    onButtonRelease : function (button, id) {
        if(id == 1) {
            if(supportMgr.giftIndex >= 0 || true) {
                var sendGetDailyGift = new CmdSendGetDailyGift();
                sendGetDailyGift.putData(supportMgr.giftIndex);
                GameClient.getInstance().sendPacket(sendGetDailyGift);
                supportMgr.giftIndex = -1;
                this.runAction(cc.sequence(
                    cc.callFunc(function () {
                        this.showCoinEffect();
                        this.btnOk.setTouchEnabled(false);
                        this.btnOk.runAction(cc.fadeOut(0.5));
                        this.pStar.runAction(cc.fadeOut(0.5));
                    }.bind(this)),
                    cc.delayTime(2),
                    cc.callFunc(function () {
                        this.bg.stopAllActions();
                        this.onClose();
                    }.bind(this))
                ));
            }
        }
        //this.onClose();
    },

    onCloseDone: function () {
        if (this._layerColor) this._layerColor.setVisible(false);
        if (this._fog) this._fog.setVisible(false);
    }
});
GUIStartUp.className = "GUIStartUp";