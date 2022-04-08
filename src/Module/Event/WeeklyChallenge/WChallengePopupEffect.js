WChallengeGetRewardEffect = cc.Layer.extend({
    ctor: function () {
        this._super();
        this.cloverPosX = 0;
        this.cloverPosY = 0;
        this.goldPosX = 0;
        this.goldPosY = 0;
        this.goldVal = 0;
        this.diamondVal = 0;
        this.initGUI();
    },
    initGUI: function () {
        this.goldEffect = new cc.Sprite('res/Event/WeeklyChallenge/Popup/Icons/GoldIcon.png');
        this.goldEffect.setPosition(-20, 0);
        this.addChild(this.goldEffect, 1);

        this.cloverEffect = new cc.Sprite('res/Event/WeeklyChallenge/Popup/Icons/CloverIcon.png');
        this.cloverEffect.setPosition(40, 0);
        this.addChild(this.cloverEffect, 1);

        this.diamondEffect = new cc.Sprite('res/Event/WeeklyChallenge/Popup/Icons/iconDiamond.png');
        this.diamondEffect.setPosition(100, 0);
        this.addChild(this.diamondEffect, 1);

        this.goldRewardValEffect = new ccui.Text('200K', 'res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf', 18);
        this.goldRewardValEffect.anchorX = 1;
        this.goldRewardValEffect.color = cc.color(237, 237, 0);
        this.goldRewardValEffect.setPosition(-5, this.goldEffect.height/2);
        this.goldEffect.addChild(this.goldRewardValEffect, 0);

        this.cloverRewardValEffect = new ccui.Text('30', 'res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf', 18);
        this.cloverRewardValEffect.anchorX = 1;
        this.cloverRewardValEffect.color = cc.color(11, 220, 0);
        this.cloverRewardValEffect.setPosition( - 5, this.cloverEffect.height/2);
        this.cloverEffect.addChild(this.cloverRewardValEffect, 0);

        this.diamondRewardValEffect = new ccui.Text('30', 'res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf', 18);
        this.diamondRewardValEffect.anchorX = 1;
        this.diamondRewardValEffect.color = cc.color(205, 60, 97);
        this.diamondRewardValEffect.setPosition( - 5, this.diamondEffect.height/2);
        this.diamondEffect.addChild(this.diamondRewardValEffect, 0);

        this.goldEffect.setCascadeOpacityEnabled(true);
        this.cloverEffect.setCascadeOpacityEnabled(true);
        this.diamondEffect.setCascadeOpacityEnabled(true);
        this.setVisible(false);
    },
    setGoldVal: function (goldVal) {
        this.goldRewardValEffect.setString(StringUtility.formatNumberSymbol(goldVal));
        this.goldVal = goldVal;
    },
    setCloverVal: function (cloverVal) {
        this.cloverRewardValEffect.setString(StringUtility.formatNumberSymbol(cloverVal));
    },
    setDiamondVal: function (diamondVal) {
        this.diamondRewardValEffect.setString(StringUtility.formatNumberSymbol(diamondVal));
        this.diamondVal = diamondVal;
    },
    setOriPos: function (oriPosX, oriPosY) {
        this.oriPosX = oriPosX;
        this.oriPosY = oriPosY;
    },
    setCloverPos: function (cloverPosX, cloverPosY) {
        this.cloverPosX= cloverPosX;
        this.cloverPosY= cloverPosY;
    },
    setGoldPos: function (goldPosX, goldPosY) {
        this.goldPosX= goldPosX;
        this.goldPosY= goldPosY;
    },
    doFlyUpEffect: function (isAutoRemove) {
        this.setVisible(true);

        this.setPosition(this.convertToNodeSpace(cc.p(this.oriPosX, this.oriPosY)));
        var EFFECT_TIME = 1.5;
        this.runAction(cc.sequence(
            cc.delayTime(EFFECT_TIME),
            cc.callFunc(function(){
                if(isAutoRemove === true) {
                    this.removeFromParent();
                }
            }.bind(this))
        ));
        var fadeOutEff = cc.sequence(cc.delayTime(EFFECT_TIME * 0.1), cc.fadeOut(EFFECT_TIME * 0.9));
        var goldMoveEff = cc.moveBy(EFFECT_TIME, 0, 100);
        var cloverMoveEff = cc.moveBy(EFFECT_TIME, 0, 100);
        var diamondMoveEff = cc.moveBy(EFFECT_TIME, 0, 100);
        this.goldEffect.runAction(fadeOutEff.clone());
        this.goldEffect.runAction(goldMoveEff.clone());
        this.cloverEffect.runAction(fadeOutEff.clone());
        this.cloverEffect.runAction(cloverMoveEff.clone());
        if (this.diamondVal > 0) {
            this.diamondEffect.setVisible(true);
            this.diamondEffect.runAction(fadeOutEff.clone());
            this.diamondEffect.runAction(diamondMoveEff.clone());
        }
        else {
            this.diamondEffect.setVisible(false);
        }

    },
    doEffect: function (isAutoRemove) {
        this.setVisible(true);
        this.goldEffect.setVisible(false);
        this.diamondEffect.setVisible(false);
        // this.setPosition(this.convertToNodeSpace(cc.p(this.oriPosX, this.oriPosY)));
        var blurLayer = new cc.LayerColor(cc.color(0,0,0, 0));
        blurLayer.setPosition(-cc.winSize.width/2, -cc.winSize.height/2);
        blurLayer.setContentSize(cc.winSize.width, cc.winSize.height);
        this.addChild(blurLayer);
        var mapListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return true;
            }.bind(this),
            onTouchMoved: function (touch, event) {
            }.bind(this),
            onTouchEnded: function (touch, event) {
            }.bind(this)
        });
        cc.eventManager.addListener(mapListener, blurLayer);
        blurLayer.runAction(cc.fadeTo(0.5, 110));
        var effTime = effectMgr.flyCoinEffect(this, this.goldVal, 5000,
            this.convertToNodeSpace(cc.p(this.oriPosX, this.oriPosY)),this.convertToNodeSpace(cc.p(this.goldPosX, this.goldPosY)));

        if (this.diamondVal > 0) {
            var s = "WeeklyChallenge/Popup/Icons/iconDiamond.png";
            effectMgr.flyItemEffect(this, s,1000,
                this.convertToNodeSpace(cc.p(this.oriPosX, this.oriPosY)),this.convertToNodeSpace(cc.p(600, 450)), 0);
        }

        this.cloverEffect.runAction(cc.sequence(
            cc.moveTo(effTime, this.convertToNodeSpace(cc.p(this.cloverPosX, this.cloverPosY))),
            cc.spawn(
                cc.fadeOut(0.5),
                cc.scaleTo(1, 1.3)
            )
        ));
        var goldBubbleTime = 3;
        var bubbleGold = BaseLayer.createLabelText("+" + StringUtility.standartNumber(this.goldVal), cc.color(255,238,89));
        bubbleGold.setFontName("res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf");
        bubbleGold.setFontSize(30);
        bubbleGold.enableOutline(cc.color(108,57,27), 1);
        bubbleGold.setAnchorPoint(0, 0.5);
        bubbleGold.setPosition(this.convertToNodeSpace(cc.p(this.goldPosX, this.goldPosY)));
        this.addChild(bubbleGold, 1);
        bubbleGold.setOpacity(0);
        bubbleGold.runAction(cc.sequence(
            cc.delayTime(effTime),
            cc.spawn(
                cc.fadeIn(0.2),
                cc.moveBy(goldBubbleTime - 2.5, 0, 50).easing(cc.easeBackOut(2.0))
            ),
            cc.delayTime(1.5),
            cc.fadeOut(0.2)
        ));
        setTimeout(function(){
            blurLayer.runAction(cc.sequence(
                cc.fadeOut(0.5),
                cc.callFunc(function () {
                    blurLayer.removeFromParent();
                })
            ))
        }.bind(this), effTime*1000);
        this.runAction(cc.sequence(
            cc.delayTime(effTime + goldBubbleTime),
            cc.callFunc(function(){
                this.setVisible(false);
                if(isAutoRemove === true) {
                    this.removeFromParent();
                }
            }.bind(this))
        ));
    }
});
