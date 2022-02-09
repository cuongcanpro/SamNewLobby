/**
 * Created by AnhLN6 on 11/4/2021
 * Show type of cat player receives ingame
 */

var FortuneCatIngameRewardGUI = BaseLayer.extend({

    ctor: function () {
        this._lbNotice = null;
        this._posMoney = null;
        this._moneyGroup = null;
        this._imgGold = null;
        this._type = -1;
        this.money = 0;
        this.effHL = null;

        this._super(FortuneCatIngameRewardGUI.className);
        this.initWithBinaryFile("GUIFortuneCatIngameReward.json");
    },

    initGUI: function () {
        var panel = this.getControl("panel");
        this.panel = panel;
        this.btn = this.customizeButton("btnOk", 1, panel);
        this.btn.posi = this.btn.getPosition();
        this.bg = panel;
        this.img = this.getControl("img", panel);
        this.img.posi = this.img.getPosition();
        this.catTitle = this.getControl("catTitle", panel);
        this.light = this.getControl("light", panel);
        this.light2 = this.getControl("light2", panel);
        this.circleLight = this.getControl("circleLight", panel);
        this.text = this.getControl("text", panel);
        this.text.posi = this.text.getPosition();
        this.panelGold = this.getControl("panelGold", panel);
        this.panelGold.setVisible(false);
        this.title = this.getControl("title", panel);
        this.title.posi = this.title.getPosition();
        this.titleBg = this.getControl("titleBg", panel);
        this.titleBg.setVisible(false);

        this._moneyGroup = new NumberGroupGold();
        this.panel.addChild(this._moneyGroup);
        var textGold = this.getControl("gold", this.panelGold);
        this._posMoney = this.panel.convertToNodeSpace(textGold.getParent().convertToWorldSpace(textGold.getPosition()));
        this._moneyGroup.setPosition(this._posMoney);
        this._moneyGroup.posi = this._posMoney;

        this.pEff = this.getControl("pEff", panel);
        this.pEff.removeAllChildren();

        this.enableFog();
    },

    enableFog : function() {
        this._fog = new cc.LayerColor(cc.BLACK);
        this._fog.setVisible(true);
        this.addChild(this._fog,-999);

        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch,event){return true;},
            onTouchMoved: function(touch,event){},
            onTouchEnded: function(touch,event){}
        });

        cc.eventManager.addListener(this._listener,this);
        this._fog.runAction(cc.fadeTo(.25,200));
    },

    onEnterFinish: function () {
        this.effectHighLight();
        this.img.setOpacity(0);
        this.title.setOpacity(0);
        this.btn.setOpacity(0);
        this.light.setOpacity(0);
        this.light2.setOpacity(0);
        this.text.setOpacity(0);
        this.circleLight.setOpacity(0);
        var pStar = this.getControl("pStar", this.bg);
        pStar.removeAllChildren();
        this.pEff.removeAllChildren();

        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function(){this.effectLight();}.bind(this))));

        this._moneyGroup.setPosition(this._posMoney);
        this.titleBg.setVisible(false);
        this.catTitle.setVisible(false);

        var titleBgDelay = 1500;
        var titleCatDelay = 1500;

        this.titleBg.retain();
        this.catTitle.retain();

        setTimeout(function(){
            ///if didn't retain, it'll cause invalid native object when user click receive before the delay run out
            this.titleBg.setVisible(true);
            this.titleBg.release();
        }.bind(this), titleBgDelay);
        setTimeout(function(){
            this.catTitle.setVisible(true);
            this.catTitle.release();
        }.bind(this), titleCatDelay);
    },

    setFixScale: function (target, scale) {
        target.setScale(scale * target.getVirtualRendererSize().width / target.getContentSize().width,
            scale * target.getVirtualRendererSize().height / target.getContentSize().height);
    },

    loadInfo: function(pathImg, title, scale, textReason, money) {
        this.img.loadTexture(pathImg);
        this.catTitle.loadTexture(title);
        this.setFixScale(this.img, scale);
        this.setFixScale(this.catTitle, scale);
        this.text.setString(textReason);
        this.setMoney(money);

    },

    effectHighLight: function() {
        if(!this.effHL) {
            var effect2 = db.DBCCFactory.getInstance().buildArmatureNode("Highlight");
            if (effect2) {
                this.bg.addChild(effect2, -1);
                effect2.setPosition(this.bg.getContentSize().width / 2, this.bg.getContentSize().height / 2);
                effect2.gotoAndPlay("1" , -1, -1, 1);
                effect2.setVisible(false);
                effect2.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
                    this.setVisible(true);
                }.bind(effect2))));
                effect2.setCompleteListener(function () {
                    this.setVisible(false);
                }.bind(effect2));
            }
            this.effHL = effect2;
        } else {
            this.effHL.gotoAndPlay("1" , -1, -1, 1);
            this.effHL.setVisible(false);
            this.effHL.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
                this.setVisible(true);
            }.bind(this.effHL))));
            this.effHL.setCompleteListener(function () {
                this.setVisible(false);
            }.bind(this.effHL));
        }
    },

    effFirst: function(control) {
        control.setPosition(this.panel.getContentSize().width / 2, this.panel.getContentSize().height / 2);
        control.setOpacity(0);
        control.runAction(cc.spawn(cc.moveTo(0.5, control.posi), cc.fadeIn(0.5)));
    },

    effectLight: function() {
        this.light.setOpacity(0);
        this.circleLight.setOpacity(0);
        this.circleLight.setScale(0.5);
        this.light2.setOpacity(0);

        this.effFirst(this.img);
        this.effFirst(this.text);
        this.effFirst(this.btn);
        this.effFirst(this.title);

        this._moneyGroup.setVisible(true);
        this._moneyGroup.setPosition(this._moneyGroup.posi.x, this.panel.getContentSize().height / 2);
        this._moneyGroup.setOpacity(0);
        this._moneyGroup.runAction(cc.spawn(cc.moveTo(0.5, this._moneyGroup.posi), cc.fadeIn(0.5)));

        this.light.stopAllActions();
        this.light.runAction(cc.rotateBy(1, 30).repeatForever());
        this.light.runAction(cc.sequence(cc.fadeIn(1.5), cc.fadeOut(1.5)).repeatForever());

        this.light2.stopAllActions();
        this.light2.runAction(cc.rotateBy(2, 30).repeatForever());
        this.light2.runAction(cc.sequence(cc.fadeOut(1.5), cc.fadeIn(1.5)).repeatForever());

        this.circleLight.stopAllActions();
        this.circleLight.runAction(cc.sequence(cc.spawn(cc.scaleTo(1.5, 1), cc.fadeIn(1.5)), cc.spawn(cc.scaleTo(0.75, 1.25), cc.fadeOut(0.75)), cc.scaleTo(0, 0.5)).repeatForever());

        var pStar = this.getControl("pStar", this.bg);
        pStar.removeAllChildren();

        for(var pos = 0; pos < 5; ++pos ){
            var tg = new cc.Sprite("Congratulations/star.png");
            pStar.addChild(tg);
            tg.setPosition(pStar.getBoundingBox().width / 2, pStar.getBoundingBox().height / 2);
            tg.setScale(0.15 + Math.random() * 0.3);
            tg.runAction(cc.rotateBy(1, 30).repeatForever());
            tg.setOpacity(0);

            var delaX = (0.75 + 0.75 * Math.random()) * pStar.getBoundingBox().width * (Math.pow(-1, Math.round(Math.random())));
            var delaY = (0.5 + 0.5 * Math.random()) * pStar.getBoundingBox().height * (Math.pow(-1, Math.round(Math.random())));
            var delayTime = Math.random() * 4;
            tg.posi = tg.getPosition();
            tg.runAction(cc.sequence(cc.callFunc(function() {
                    this.setPosition(this.posi);
                }.bind(tg)),
                cc.delayTime(delayTime), cc.fadeIn(0) ,cc.spawn(cc.fadeOut(2.75), cc.moveTo(2.75, tg.posi.x + delaX, tg.posi.y + delaY))).repeatForever());
        }
    },

    setMoney: function(money) {
        this.money = money;
        this._moneyGroup.setNumber(money);
        this._moneyGroup.posi = this._moneyGroup.getPosition();
        this._moneyGroup.setVisible(false);
    },

    onBack: function() {
        if(this.money > 0) {
            this.pEff.removeAllChildren();
            var size = this.pEff.getBoundingBox();
            var coinEffect = new CoinFallEffect();
            coinEffect.setPosition(0, 0);
            coinEffect.setPositionCoin(cc.p(size.width / 2, size.height / 2));
            coinEffect.setContentSize(size.width * 0.5, size.height * 0.5);
            coinEffect.setVisible(false);

            this.pEff.addChild(coinEffect);
            var num = 30;
            if(this.money > 300000) num = 60; else if(this.money > 1000000) num = 100; else if(this.money > 10000000) num = 150;
            coinEffect.startEffect(num, CoinFallEffect.TYPE_FLOW);
            coinEffect.setAutoRemove(true);

            this.panel.runAction(cc.sequence(cc.delayTime(3), cc.callFunc(function(){
                this.onClose();
            }.bind(this))));
        } else {
            this.onClose();
        }
    },

    onButtonRelease: function (button, id) {
        this.onBack();
    }
});

FortuneCatIngameRewardGUI.className = "FortuneCatIngameRewardGUI";
FortuneCatIngameRewardGUI.tag = 350;

var NumberGroupGold = cc.Node.extend({
    ctor: function () {
        this._super();
        this._width = 0;
        this._height = 0;
    },

    setNumber: function (number) {
        if (number <= 0) return;
        var nStr = StringUtility.pointNumber(number);

        var dc = cc.Sprite("Lobby/Congratulations/plus.png");
        dc.setPosition(0, 0);
        this.addChild(dc);

        var curX = dc.getPositionX() + dc.getContentSize().width / 2;
        var curY = dc.getPositionY();

        var commaY = (new cc.Sprite("Lobby/Congratulations/n1.png")).getContentSize().height;

        for (var i = 0; i < nStr.length; i++) {
            var nContent = "Lobby/Congratulations/";
            var isComma = false;
            if (nStr.charAt(i) == ',') {
                nContent += "dot.png";
                isComma = true;
            }
            else {
                nContent += "n" + nStr.charAt(i) + ".png";
            }
            var ns = new cc.Sprite(nContent);
            this.addChild(ns);
            ns.setPositionX(curX + ns.getContentSize().width / 2);
            if (isComma) {
                var y = ns.getContentSize().height;
                ns.setPositionY(-commaY / 2 + y / 2);
            }
            else {
                ns.setPositionY(curY);
            }

            curX += ns.getContentSize().width;

            this._height = ns.getContentSize().height;
        }

        this._width = curX;
        this.updatePosition();
    },

    updatePosition: function () {
        this.setPositionX(this.getPositionX() - this._width / 2);
    }
});