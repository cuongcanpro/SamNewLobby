
// image or sprite

var MidAutumnResultGift = cc.Node.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/EventMgr/MidAutumn/MDGiftResultNode.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.bgNum = ccui.Helper.seekWidgetByName(this._layout, "bgNum");
        this.num = ccui.Helper.seekWidgetByName(this._layout, "num");
        this.name = ccui.Helper.seekWidgetByName(this._layout, "name");
        this.new = ccui.Helper.seekWidgetByName(this._layout, "new");
    },

    setGift: function (inf) {
        if (inf.id == MD_GOLD_GIFT_EXTRA_ID) {
            this.name.setString(StringUtility.formatNumberSymbol(inf.value));
        }
        else if (midAutumn.isLamp(inf.id) || midAutumn.isItemStored(inf.id)) {
            var str = midAutumn.getItemNameShort(inf.id);
            this.name.setString(str);
        } else {

            this.name.setString(StringUtility.formatNumberSymbol(midAutumn.getItemValue(inf.id)));
        }
        this.img.removeAllChildren();
        var sp;
        if (inf.id == MD_GOLD_GIFT_EXTRA_ID) {
            this.num.setVisible(false);
            this.bgNum.setVisible(false);
        }
        else {
            this.num.setString(inf.value);
            this.num.setVisible(inf.value > 1);
            this.bgNum.setVisible(inf.value > 1);
            this.new.setVisible(!midAutumn.checkInLastGifts(inf.id));
        }

        if (midAutumn.isLamp(inf.id)) {
            sp = new cc.Sprite(midAutumn.getImgLamp(inf.id));
        }
        else if (inf.isStored) {
            sp = new cc.Sprite(midAutumn.getPieceImage(inf.id));
        }
        else {
            sp = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/e10.png");
        }
        sp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
        this.img.addChild(sp);

        var sX = this.img.getContentSize().width / sp.getContentSize().width;
        var sY = this.img.getContentSize().height / sp.getContentSize().height;
        sp.setScale(Math.min(sX, sY));
    },
});

var MidAutumnPieceItem = cc.Node.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/EventMgr/MidAutumn/MDPieceItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.name = ccui.Helper.seekWidgetByName(this._layout, "name");
        this.nof = ccui.Helper.seekWidgetByName(this._layout, "nof");
        this.num = ccui.Helper.seekWidgetByName(this._layout, "num");
        this.new = ccui.Helper.seekWidgetByName(this._layout, "new");
    },

    setInfo: function (inf) {
        cc.log("--PieceItem " + JSON.stringify(inf));
        var sName = "";
        this.num.setVisible(false);
        this.nof.setVisible(false);
        this.new.setVisible(inf.isNew);
        //  this.new.setVisible(false);

        if (midAutumn.isLamp(inf.id)) {
            sName = midAutumn.getItemNameShort(inf.id);
            this.num.setVisible(inf.num > 1);
            this.nof.setVisible(inf.num > 1);
            this.num.setString(inf.num);
        }
        else if (midAutumn.isItemStored(inf.id)) {
            sName = midAutumn.getItemNameShort(inf.id);

            this.num.setVisible(inf.num > 1);
            this.nof.setVisible(inf.num > 1);
            this.num.setString(inf.num);
        } else {
            sName = StringUtility.formatNumberSymbol(inf.num);
        }
        this.name.setString(sName);

        var sp;
        if (midAutumn.isLamp(inf.id))
            sp = new cc.Sprite(midAutumn.getImgLamp(inf.id));
        else
            sp = new cc.Sprite(midAutumn.getPieceImage(inf.id));
        sp.setPosition(this.bg.getContentSize().width / 2, this.bg.getContentSize().height / 2);
        this.bg.addChild(sp);

        if (sp.getContentSize().width > sp.getContentSize().width || sp.getContentSize().height > this.bg.getContentSize().height) {
            var sX = 0;
            // if (sp.getContentSize().width > this.bg.getContentSize().width) {
            sX = (this.bg.getContentSize().width / sp.getContentSize().width);
            // }

            var sY = 0;
            // if (sp.getContentSize().height > this.bg.getContentSize().height) {
            sY = (this.bg.getContentSize().height / sp.getContentSize().height);
            // }

            if (sX > 0 || sY > 0) {
                sp.setScale(sX < sY ? sX : sY);
            }
        }
    },
});

var MidAutumnPiece = cc.Node.extend({
    ctor: function (item, time, pY, count) {
        this._super();

        this.pieceImage = item;
        this.image = null;

        this.velocity = {};
        this.acceleration = {};

        this.timeLeft = parseInt(time);
        this.lifespan = parseInt(time);

        var rotate = this.randomRange(0, 5);
        this.deltaRotate = rotate * ((parseInt(Math.random() * 10) % 2 == 0) ? 1 : -1);

        this.mass = 1;
        this.count = count || 4;

        this.posYDrop = pY;

        this.initUI();
    },

    initUI: function () {
        if (this.pieceImage.indexOf("icon_gold.png") > -1) {
            this.image = new CoinEffectAnim();
            this.image.start();
            this.image.setScale(0.3);
            this.image.setRotation(-Math.random() * 360);
        }
        else if (this.pieceImage.indexOf("lamp") > -1) {
            this.image = new cc.Sprite(this.pieceImage);
        }
        else {
            this.image = new cc.Sprite(this.pieceImage);
        }
        this.addChild(this.image);

        this.acceleration = cc.p(0, 0.25);
        this.velocity = cc.p(this.randomRange(-6, 6), this.randomRange(-4, 0));
    },

    isDead: function () {
        if (this.timeLeft < 0) return true;
        return false;
    },

    applyForce: function (force) {
        var p = JSON.parse(JSON.stringify(force));

        this.acceleration.x += (p.x / this.mass);
        this.acceleration.y += (p.y / this.mass);
    },

    update: function (dt) {
        if (this.count < 0) {
            this.timeLeft -= dt;
            var per = this.timeLeft / this.lifespan;
            this.image.setOpacity(Math.floor(per * 255));
            this.image.stopAllActions();
            return;
        }

        this.applyForce(cc.p(0, 0.25));

        this.velocity.x -= this.acceleration.x;
        this.velocity.y -= this.acceleration.y;

        var p = this.getPosition();
        p.x += this.velocity.x;
        p.y += this.velocity.y;

        this.setPosition(p);

        this.acceleration.x *= 0;
        this.acceleration.y *= 0;

        if (p.y < this.posYDrop) {
            this.applyForce(cc.p(0, -1 * this.count));
            this.count--;
        }
    },

    randomRange: function (a, b) {
        var rnd = Math.random();
        return rnd * (b - a) + a;
    }
});

var MidAutumnMoney = cc.Node.extend({

    ctor : function () {
        this._super();
        this._width = 0;
        this._height = 0;
    },

    setNumber : function (number) {
        if(number < 0) return;

        this.removeAllChildren();
        this.setPosition(cc.p(0,0));

        var nStr = StringUtility.formatNumberSymbol(number).toLowerCase();

        cc.log(nStr);

        var curX = 0;
        var curY = 0;

        var commaY = (new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/bosogold/so1.png")).getContentSize().height;

        for(var i = 0 ; i < nStr.length ; i++)
        {
            var nContent = "res/EventMgr/MidAutumn/MidAutumnUI/bosogold/";
            var isComma = false;
            if(nStr.charAt(i) == '.')
            {
                nContent += "dot.png";
                isComma = true;
            }
            else
            {
                nContent += "so" + nStr.charAt(i) + ".png";
            }

            var ns = new cc.Sprite(nContent);
            this.addChild(ns);
            ns.setPositionX(curX + ns.getContentSize().width/2);
            if(isComma)
            {
                var y = ns.getContentSize().height;
                ns.setPositionY(- commaY/2 + y/2);
            }
            else
            {
                ns.setPositionY(curY);
            }

            curX += ns.getContentSize().width*1.1;

            this._height = ns.getContentSize().height;
        }

        this._width = curX;

        this.updatePosition();
    },

    updatePosition : function () {
        this.setPositionX(this.getPositionX() - this._width/2);
    }
});

var MidAutumnGrid = cc.Node.extend({

    ctor : function (id,x,y) {
        this._super();

        this.ID = MD_CELL_EMPTY;
        this.tempID = MD_CELL_EMPTY;
        this.cellX = x;
        this.cellY = y;
        this.initContent();
        this.updateInfo(id);
    },

    // khoi tao content grid
    initContent: function () {
        this.bgShadow = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/bgShadow.png");
        this.addChild(this.bgShadow);
        this.bgShadow.setPositionY(-8);

        this.bg = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/cell_0.png");
        this.addChild(this.bg);

        this.imgGift = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/icon_gold.png");
        this.addChild(this.imgGift);
        this.imgGift.setPositionY(10);
        this.imgGift.defaultPos = this.imgGift.getPosition();

        this.effectGift = resourceManager.loadDragonbone("Oqua");
        this.effectGift.setScale(0.95);
        this.addChild(this.effectGift, 1, 100);
        //  this.effectGift.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.5);
        this.effectGift.gotoAndPlay("1", -1, -1, 1);
        this.effectGift.setVisible(false);

        this.effectItem = resourceManager.loadDragonbone("OBimat");
        this.effectItem.setScale(0.95);
        this.addChild(this.effectItem, 10, 100);
        //  this.effectGift.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.5);
        this.effectItem.gotoAndPlay("1", -1, -1, 0);
        this.effectItem.setVisible(false);
        this.effectItem.setPosition(-3, 6);


        var effect = resourceManager.loadDragonbone("FX_nhanqua");
        // effect.gotoAndPlay("1", -1, -1, -1);
        this.addChild(effect);
        //effect.setPosition(this.getPosFromIndex(this.curPos.x, this.curPos.y));
        // effect.runAction(cc.sequence(cc.delayTime(2.0), cc.removeSelf()));
        this.effectSpecial = effect;
        effect.setVisible(false);

        this.pEffect = new cc.Node();
        this.addChild(this.pEffect, 10);

        this.setContentSize(this.bg.getContentSize());
    },

    startEffect: function () {
        this.stopEffect();
        this.pEffect.setVisible(true);
        this.addEffect();
    },

    addEffect: function () {
        var sprite = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/star_light.png");
        var pX = this.imgGift.getContentSize().width * (Math.random() * 0.8 - 0.4);
        var pY = this.imgGift.getContentSize().height * (Math.random() * 0.6 - 0.3);
        sprite.setPosition(pX, pY);
        sprite.setOpacity(0);
        sprite.setScale(0);
        var scale = Math.random() * 0.7 + 0.4;
        sprite.runAction(cc.sequence(cc.fadeIn(0.3), cc.delayTime(0.4), cc.fadeOut(0.3)));
        sprite.runAction(cc.sequence(cc.scaleTo(0.3, scale), cc.delayTime(0.4), cc.scaleTo(0.3, 0.2)));
        sprite.runAction(cc.rotateBy(1.6, 350));
        this.pEffect.addChild(sprite);

        var time = Math.random() * 0.4 + 0.4;
        this.pEffect.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(this.addEffect.bind(this))));
    },

    stopEffect: function () {
        this.pEffect.removeAllChildren();
        this.pEffect.stopAllActions();
        this.pEffect.setVisible(true);
    },

    updateInfo : function (id) {
        id = parseInt(id);
        // cc.log("cell_normal" + id + ".png");
        if (id <= 1)
            this.bg.setTexture("res/EventMgr/MidAutumn/MidAutumnUI/cell_" + id + ".png");
        else
            this.bg.setTexture("res/EventMgr/MidAutumn/MidAutumnUI/cell_" + 2 + ".png");
        this.effectGift.setVisible(false);
        this.effectItem.setVisible(false);
        switch (id) {
            case MD_CELL_GOLD:
                this.stopEffect();
                this.imgGift.setTexture("res/EventMgr/MidAutumn/MidAutumnUI/iconGoldMap.png");
                this.imgGift.setVisible(true);
                break;
            case MD_CELL_LAMP:
                this.stopEffect();
                this.imgGift.setTexture("res/EventMgr/MidAutumn/MidAutumnUI/iconLight.png");
                this.imgGift.setVisible(false);
                this.effectItem.setVisible(true);
                break;
            default:
                this.startEffect();
                this.imgGift.setTexture("res/EventMgr/MidAutumn/MidAutumnUI/enMap" + id + ".png");
                this.imgGift.setVisible(false);
                //  this.effectGift.setVisible(true);
                break;
        }
        if (!this.imgGift.isVisible() && id != MD_CELL_LAMP) {
            this.imgGift.setVisible(true);
            this.imgGift.setScale(0);
            this.imgGift.runAction(new cc.EaseBounceOut(cc.scaleTo(0.4, 1.0)));
        }
    },

    setNormalState: function () {
        this.imgGift.setPositionY(this.imgGift.defaultPos.y);
        this.imgGift.setOpacity(255);
        this.bg.setOpacity(255);
        this.bg.setScale(1);
        this.setVisible(true);
    },

    effectShow: function (timeDelay) {
        // an qua di
        this.imgGift.setPositionY(this.imgGift.defaultPos.y + 60);
        this.imgGift.setOpacity(0);
        this.bg.setOpacity(0);
        this.bg.setScale(0);

        this.effectSpecial.setVisible(false);


        var func = function () {
            this.setVisible(true);
            // hien bg len
            this.bg.runAction(cc.spawn(
                cc.fadeIn(0.3),
                new cc.EaseBackOut(cc.scaleTo(0.4, 0.95))
            ));
            // hien qua len
            this.imgGift.runAction(cc.sequence(cc.delayTime(0.2), cc.spawn(
                cc.fadeIn(0.3),
                new cc.EaseBounceOut(cc.moveTo(0.5, this.imgGift.defaultPos)),
                new cc.EaseBounceOut(cc.scaleTo(0.5, 1.0))
            )));
        };
        this.runAction(cc.sequence(cc.delayTime(timeDelay), cc.callFunc(func.bind(this))));
    },

    effectReceiveGift: function () {
        this.effectSpecial.setVisible(true);
        this.effectSpecial.gotoAndPlay("1", -1, -1, 1);
        this.effectSpecial.runAction(cc.sequence(cc.delayTime(2.0), cc.hide()));
    },

    effectJumpIn: function (timeDelay) {
        this.stopAllActions();
        this.runAction(cc.sequence(cc.delayTime(timeDelay), cc.scaleTo(0.1, 0.8), new cc.EaseBackOut(cc.scaleTo(0.3, 1.0))));
    },

    clearAll : function () {
        this.removeAllChildren();

        this.bg = null;
        this.gift = null;
        this.bgGift = null;
        this.gold = null;
        this.stone = null;
    },

    initBG : function () {
        var resource = MD_IMAGE_CELL_NORMAL_LEVEL + midAutumn.getStageId() + ".png";
        if (this.bg) {
            this.bg.setTexture(resource);
        }
        else {
            this.bg = new cc.Sprite(resource);
            this.addChild(this.bg);
        }

    },

    initGift : function () {
        var resource = MD_IMAGE_BG_GIFT_LEVEL + midAutumn.getStageId() + ".png";
        this.bgGift = new cc.Sprite(resource);
        this.addChild(this.bgGift);

        this.gift = new cc.Sprite(midAutumn.getEggImage(this.ID));
        this.addChild(this.gift);

        this.effectGift = resourceManager.loadDragonbone("Oqua");
        this.effectGift.setScale(0.95);
        //  this.effectGift.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.stopAnimation.bind(this))));

        this.bgGift.addChild(this.effectGift, 1, 100);
        this.effectGift.setPosition(this.bgGift.getContentSize().width * 0.5, this.bgGift.getContentSize().height * 0.5);
        this.effectGift.gotoAndPlay("1", -1, -1, 1);
        // if (midAutumn.getStageId() == 0)
        //     this.effectGift.setOpacity(50);
        // else
        //     this.effectGift.setOpacity(150);

        this.gift.setVisible(!midAutumn.isCharacterHere(this.cellX,this.cellY));
    },

    initGold : function () {
        this.gold = new CoinEffectAnim();
        this.gold.setScale(MD_CELL_GOLD_SCALE);
        this.gold.start();
        this.addChild(this.gold);
    },

    hideGift : function (time) {
        time = time || 0;

        if(time <= 0) {
            if(this.imgGift) this.imgGift.setVisible(false);
            //if(this.bgGift) this.gift.setVisible(false);
            //if(this.gold) this.gold.setVisible(false);
        }
        else {
            if(this.imgGift) this.imgGift.runAction(cc.sequence(cc.delayTime(time),new cc.EaseBackIn(cc.scaleTo(0.15,0)),cc.hide()));
            // if(this.bgGift) this.bgGift.runAction(cc.sequence(cc.delayTime(time),new cc.EaseBackIn(cc.scaleTo(0.15,0)),cc.hide()));
            //if(this.gold) this.gold.runAction(cc.sequence(cc.delayTime(time),new cc.EaseBackIn(cc.scaleTo(0.15,0)),cc.hide()));
        }
    },

    showGift : function () {
        // this.initBG();
        if(this.gift) {
            this.gift.setVisible(true);
            this.gift.setScale(1);
        }
        if(this.bgGift) {
            this.bgGift.setVisible(true);
            this.bgGift.setScale(1);
        }
        if(this.gold) {
            this.gold.setVisible(true);
            this.gold.setScale(MD_CELL_GOLD_SCALE);
            this.gold.start();
        }
    },

    compare : function (id, x, y) {
        if(this.cellX != x) return false;
        if(this.cellY != y) return false;
        if(this.ID != parseInt(id)) return false;
        return true;
    },

    effect : function () {
        if(this.ID == MD_CELL_GOLD) {
            this.gold.start();
        }

        if(this.ID > MD_CELL_NONE) {
            this.gift.runAction(cc.sequence(
                cc.delayTime(Math.random()),
                new cc.EaseBackOut(cc.scaleTo(0.35,1.1)),
                cc.delayTime(0.5),
                cc.scaleTo(0.25,1)
            ));
        }
    },

    toString : function () {
        return this.ID + "|" + this.cellX + "|" + this.cellY;
    },

    getWidth: function () {
        return this.getContentSize().width;
    },

    getHeight: function () {
        return this.getContentSize().height;
    }
});


MidAutumnMap = cc.Node.extend({
    ctor: function () {
        this._super();
        this.arGrid = [];
        this.arPiece = [];
        this.pMapEffect = null;
        this.moveObject = null;
        this.movePaths = [];
        this.arrayData = [];
        this.arrayCloud = [];
        this.timeGenCloud = 0;
        this.arrayAnimation = [];
        for (var i = 0; i < MD_ROW; i++) {
            this.arrayData[i] = [];
        }
        this.initMap();
    },

    initMap: function () {
        var shadow = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/shadowMap.png");
        this.addChild(shadow);
        shadow.setPosition(shadow.getContentSize().width * 0.49, shadow.getContentSize().height * 0.45);
        this.shadow = shadow;
        shadow.setOpacity(0);
        shadow.setVisible(false);


        // var deco = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/deco.png");
        // this.addChild(deco);

        this.deco = resourceManager.loadDragonbone("Logo");
        this.addChild(this.deco, 10, 100);
        this.deco.gotoAndPlay("1", -1, -1, 0);

        //var deco1 = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/titleEvent.png");
        // this.addChild(deco1);

        this.initMascot();
        // this.initArrayOrderGrid();

        var sprite = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/cell_0.png");
        this.gridSize = sprite.getContentSize();
        this.mapSize = cc.size(MidAutumnMap.WIDTH_ISO * MD_COL, MidAutumnMap.HEIGHT_ISO * MD_ROW);
        this.setContentSize(this.mapSize);
        this.setPosition(-this.mapSize.width * 0.5, 0);
        this.deco.setPosition(this.mapSize.width * 0.58, this.mapSize.height * 0.12);
        //deco1.setPosition(this.mapSize.width * 0.18, this.mapSize.height * 0.4);
        // var logo = resourceManager.loadDragonbone("Logo_Noel");
        // this.addChild(logo);
        // logo.setPosition(this.mapSize.width * 0.62, this.mapSize.height * 0.64);
        // logo.gotoAndPlay("1", -1, -1, -1);

        this.pMapEffect = new cc.Node();
        this.addChild(this.pMapEffect);
        this.pMapEffect.setLocalZOrder(1000);

        for (var i = 0; i < MD_ROW; i++)
            this.arrayAnimation[i] = [];
        for (var i = 0; i < MD_COL; i++) {
            this.arrayAnimation[0][i] = 3;
            this.arrayAnimation[MD_ROW - 1][i] = 1;
        }
        for (var i = 1; i < MD_ROW - 1; i++) {
            this.arrayAnimation[i][0] = 4;
            this.arrayAnimation[i][MD_COL - 1] = 2;
        }
        this.arrayAnimation[3][1] = 3;
        this.arrayAnimation[3][2] = 3;
        this.arrayAnimation[3][3] = 4;
        this.arrayAnimation[2][3] = 4;
        this.arrayAnimation[1][3] = 4;
    },

    initMascot: function () {
        this.mascot = new ccui.Layout();
        this.addChild(this.mascot);
        this.mascot.setScale(1.0);
        if (!this.mascot.eff) {
            this.mascot.eff = resourceManager.loadDragonbone("plane");
            if (this.mascot.eff) {
                this.mascot.eff.setPosition(cc.p(this.mascot.getContentSize().width / 1.8,0));
                this.mascot.eff.setLocalZOrder(999);
                this.mascot.addChild(this.mascot.eff);
            }

            this.mascot.shadow = new cc.Sprite(MD_IMAGE_CHARACTER_SHADOW_LIGHT);
            this.mascot.shadow.setPosition(cc.p(this.mascot.eff.getPositionX(),10));
            this.mascot.addChild(this.mascot.shadow);
        }
        this.mascot.eff.gotoAndPlay("idle_1", -1, -1, 0);
        this.mascot.setLocalZOrder(100);
        this.mascot.setVisible(false);
    },

    genCloud: function (dt) {
        this.timeGenCloud = this.timeGenCloud + dt;
        if (this.timeGenCloud < 5) {
            return;
        }
        this.timeGenCloud = 0;
        cc.log("GEN CLOUD *** ");
        var cloud = null;
        for (var i = 0; i < this.arrayCloud.length; i++) {
            if (!this.arrayCloud[i].isVisible()) {
                cloud = this.arrayCloud[i];
            }
        }
        if (cloud == null) {
            cloud = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/cloud.png");
            this.arrayCloud.push(cloud);
            this.addChild(cloud);
            cloud.setLocalZOrder(1000);
        }
        cloud.setOpacity(0);
        var scale = Math.random() * 0.7 + 0.3;
        cloud.setScale(scale);
        var randomX = this.mapSize.width * 0.4 * Math.random();
        var randomY = this.mapSize.height * 0.8 * Math.random() - this.mapSize.height * 0.4;
        cloud.setPosition(randomX, randomY);
        cloud.runAction(cc.moveBy(10, 300, 0));
        cloud.runAction(cc.sequence(cc.fadeTo(2.0, 200), cc.delayTime(2.0), cc.fadeOut(5.0)));
    },

    onEnterFinish: function () {
        this.isNewMap = true;
        this.mascot.stopAllActions();
        this.mascot.setVisible(false);
        for (var i = 0; i < this.arGrid.length; i++) {
            if (this.arGrid[i]){
                this.arGrid[i].effectSpecial.setVisible(false);
                this.arGrid[i].stopEffect();
                this.arGrid[i].setNormalState();
            }
        }
        for (var i = 0; i < this.arrayCloud.length; i++) {
            if (this.arrayCloud[i])
                this.arrayCloud[i].setVisible(false);
        }
        this.clearContent();
    },

    clearContent: function () {
        this.arPiece = [];
        this.pMapEffect.removeAllChildren();
    },

    loadMap: function () {
        for (var i in this.arPiece) {
            this.arPiece[i].removeFromParent();
        }
        this.arPiece = [];
        var mapInfo = midAutumn.mapInfo.data;
        var mapSize = MD_COL * MD_ROW;
        // midAutumn.mapInfo.row = 0;
        // midAutumn.mapInfo.col = 0;
        this.arrayOrderGrid = [];
        for (var i = 0; i < MD_ROW; i++) {
            for (var j = 0; j < MD_COL; j++) {
                this.arrayData[i][j] = 0;
            }
        }
        for (var i = 0; i < mapSize; i++) {
            if (mapInfo[i] != MD_CELL_EMPTY) {
                //var convert = i + 42;
                var row = Math.floor(i / MD_COL);
                var column = i % MD_COL;
                if (!this.arGrid[i]) {
                    this.arGrid[i] = new MidAutumnGrid(mapInfo[i], i);
                    //this.arGrid[i].setPosition(this.arGrid[i].getWidth() * (0.5 + column), this.arGrid[i].getHeight() * (MD_ROW - 0.5 - row));
                    this.addChild(this.arGrid[i]);
                    screenX = (row + column) * MidAutumnMap.WIDTH_ISO / 2;
                    screenY = (column - row) * MidAutumnMap.HEIGHT_ISO / 2;
                    this.arGrid[i].setPosition(screenX + this.arGrid[i].getWidth() * 0.5, screenY);
                    this.arGrid[i].setLocalZOrder(row * 10 + (10 - column));
                    this.arrayOrderGrid.push(cc.p(row, column));

                }
                else {
                    this.arGrid[i].updateInfo(mapInfo[i]);
                }
                this.arrayData[row][column] = 1;
            }
        }
        //  this.mapSize = cc.size(MD_COL * this.widthIso, MD_ROW * this.heightIso);
        this.mascotIdle(midAutumn.mapInfo.row, midAutumn.mapInfo.col);

        if (this.isNewMap) {
            this.effectLoadMap();
        }
        else {
            for (var i = 0; i < this.arGrid.length; i++) {
                if (this.arGrid[i]){
                    this.arGrid[i].setNormalState();
                }
            }
        }

        this.isNewMap = false;
    },

    // chay effect hien thi map khi tu lobby vao lan dau
    effectLoadMap: function () {
        this.shadow.setOpacity(0);
        this.shadow.stopAllActions();
        this.shadow.runAction(cc.sequence(cc.delayTime(1.8), cc.fadeIn(1.0)));
        this.mascot.setVisible(false);
        this.countLoadMap = 0;
        this.isRunEffectLoadMap = true;
        var timeDelay = 0.05;
        for (var i = 0; i < this.arrayOrderGrid.length; i++) {
            var grid = this.getGridFromPoint(this.arrayOrderGrid[i].x, this.arrayOrderGrid[i].y);
            grid.setVisible(false);
            grid.effectShow(timeDelay * i);
        }
        this.runAction(cc.sequence(cc.delayTime(timeDelay * (this.arrayOrderGrid.length + 1)), cc.callFunc(this.finishShowMap.bind(this))));


    },

    // sau khi show effect map, hien mascot
    finishShowMap: function () {
        this.mascot.setVisible(true);
        this.mascot.setScaleY(0);
        this.mascot.runAction(new cc.EaseBackOut(cc.scaleTo(0.5, 1.0)));
        this.isRunEffectLoadMap = false;
    },

    getGridFromPoint: function (row, column) {
        var index = midAutumn.getIndexFromPoint(row, column);
        return this.arGrid[index];
    },

    mascotIdle: function (i, j) {
        // init effect
        // i = 3; j = 7;
        this.mascot.setScale(1.0);
        this.curPos = cc.p(i, j);
        this.mascot.stopAllActions();
        // this.mascot.eff.gotoAndPlay("Idle", -1, -1, 0);

        if (i !== undefined && j !== undefined) {
            // random trang thai idle cho mascot
            var stateMascot = 2;
            var isFlip = this.mascot.isFlippedX();
            if (j == MD_COL - 1) {
                stateMascot = 3;
            } else if (j == 0) {
                stateMascot = 2;
            } else {
                stateMascot = (isFlip ? 3 : 2);
            }

            var pos = this.getPosFromIndex(i, j, stateMascot);
            //this.mascot.setFlippedX(stateMascot == 3);
            this.mascot.pos = cc.p(i, j);
            this.mascot.setPosition(pos);
        }
        this.getGridFromPoint(i, j).hideGift(0);
        var ani = "idle_" + this.arrayAnimation[i][j];
        this.mascot.eff.gotoAndPlay(ani, -1, -1, 0);

        // this.mascot.runAction(cc.sequence(cc.delayTime(5.0), cc.callFunc(this.genAnimateFox.bind(this))));
        //this.effectDiceToPath(cc.p(300, 300), 4);
        // this.generateMovePath(4, 0, 5);
    },

    genAnimateFox: function () {
        this.mascot.stopAllActions();
        var ani = Math.random() > 0.5 ? "Idle" : "Idle2";
        this.mascot.eff.gotoAndPlay(ani, -1, -1, 0);
        this.mascot.runAction(cc.sequence(cc.delayTime(5.0), cc.callFunc(this.genAnimateFox.bind(this))));
    },

    // effect xuc xac sau khi quay ra ket qua nhay den vi tri cua cao
    effectDiceToPath: function (pDice) {
        var cmd = midAutumn.midAutumnScene.cmdResult;
        MidAutumnSound.playDiceFly();
        //this.numMoveAvailable = numMoveAvailable;
        var sp = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/dice" + cmd.numMoves[0] + ".png");
        sp.setPosition(pDice);
        this.pMapEffect.addChild(sp, 999999);

        var pCX = Math.random() * cc.winSize.width;
        var pCY = Math.random() * cc.winSize.height;
        var posCenter = cc.p(pCX, pCY);
        var actMove = new cc.BezierTo(0.5, [sp.getPosition(), posCenter, this.mascot.getPosition()]);
        sp.runAction(cc.sequence(actMove, cc.callFunc(this.processMoveCmd.bind(this)),
            new cc.EaseBackOut(cc.scaleTo(0.15, 1.5)), cc.scaleTo(0.1, 0), cc.removeSelf()));
    },

    processMoveCmd: function () {
        var cmd = midAutumn.midAutumnScene.cmdResult;
        if (cmd.numMoves.length <= 10) {
            this.generateMovePath();
        }
        else {

        }
    },

    generateMovePath: function () {
        //nMove = nMove || this.numMoveAvailable;
        var cmd = midAutumn.midAutumnScene.cmdResult;

        // play effect fox JUMP
        MidAutumnSound.playFoxJump();

        this.arrayPath = [];
        var lastPoint;
        for (var i = 0; i < cmd.rows.length; i++) {
            this.arrayPath.push(cc.p(cmd.rows[i], cmd.columns[i]));
        }
        this.arrayMove = cmd.numMoves;
        this.arrayId = cmd.ids;
        this.isRun = false;
        // this.curPos = cc.p(midAutumn.mapInfo.row, midAutumn.mapInfo.col);
        this.characterMove();
    },

    autoGenerateMovePath: function () {
        var cmd = midAutumn.midAutumnScene.cmdResult;
        this.arrayPath = [];
        this.arrayId = [];
        var currentPoint = this.curPos;
        var num = Math.floor(2 * (MD_ROW + MD_COL) * 1.2);
        var count = 0;
        for (var i = 0; i < cmd.ids.length; i++) {
            this.arrayId.push(cmd.ids[i]);
            count++;
            if (count > num)
                break;
            if (i == cmd.ids.length - 1) {
                i = 0;
            }
        }

        for (var i = 0; i < num; i++) {
            // chi co the di chuyen sang ben trai
            var nextPoint = cc.p(0, 0);

            if (currentPoint.x == 0) {
                // di chuyen di sang phai
                nextPoint.y = currentPoint.y + 1;
                if (nextPoint.y > MD_COL - 1) {
                    nextPoint.y = MD_COL - 1;
                    nextPoint.x = 1;
                }
                else {
                    nextPoint.x = currentPoint.x;
                }
            }
            else if (currentPoint.x == MD_MOVE_SPLIT_HORIZONTAL && currentPoint.y <= MD_MOVE_SPLIT_VERTICAL) {
                if (currentPoint.y == 0) {
                    if (Math.random() > 0.5) {
                        nextPoint.y = currentPoint.y + 1;
                        nextPoint.x = currentPoint.x;
                    }
                    else {
                        nextPoint.y = currentPoint.y;
                        nextPoint.x = currentPoint.x - 1;
                    }
                }
                else {
                    // di chuyen sang phai
                    nextPoint.y = currentPoint.y + 1;
                    if (nextPoint.y > MD_MOVE_SPLIT_VERTICAL) {
                        nextPoint.y = MD_MOVE_SPLIT_VERTICAL;
                        nextPoint.x = MD_MOVE_SPLIT_HORIZONTAL - 1;
                    }
                    else {
                        nextPoint.x = currentPoint.x;
                    }
                }
            }
            else if (currentPoint.x == MD_ROW - 1) {
                // di chuyen Sang trai
                nextPoint.y = currentPoint.y - 1;
                if (nextPoint.y < 0) {
                    nextPoint.x = MD_ROW - 2;
                    nextPoint.y = 0;
                }
                else {
                    nextPoint.x = currentPoint.x;
                }
            }
            else {
                // di chuyen di len hoac di xuong
                if (currentPoint.y > MD_MOVE_SPLIT_VERTICAL) {
                    // di chuyen di xuong
                    nextPoint.x = currentPoint.x + 1;
                    if (nextPoint.x > MD_ROW - 1) {
                        nextPoint.y = MD_COL - 1;
                        nextPoint.x = MD_ROW - 1;
                    }
                    else {
                        nextPoint.y = currentPoint.y;
                    }
                }
                else {
                    // di chuyen di len
                    nextPoint.x = currentPoint.x - 1;
                    if (nextPoint.x < 0) {
                        nextPoint.y = nextPoint.y;
                        nextPoint.x = 0;
                    }
                    else {
                        nextPoint.y = currentPoint.y;
                    }
                }
            }
            this.arrayPath.push(nextPoint);
            currentPoint = nextPoint;
        }
        this.isRun = true;
        this.characterMove();
    },

    // lay ra toa do cua mascot tren parent
    getMascotPosition: function () {
        return cc.p(this.mascot.getPosition().x + this.getPositionX(), this.mascot.getPositionY() + this.getPositionY());
    },

    //
    // // nhan goi tin chon huong di tu server, xu li de di chuyen cao
    // processMoveCmd: function (cmd) {
    //     if (this.moveObject) {
    //         var curPos = {
    //             x: this.moveObject.row,
    //             y: this.moveObject.col
    //         };
    //         var movePos = {
    //             x: curPos.x + this.moveObject.move * MD_MOVE_DIRECT[this.moveObject.direct][0],
    //             y: curPos.y + this.moveObject.move * MD_MOVE_DIRECT[this.moveObject.direct][1],
    //         };
    //
    //         var cellPath = [];
    //         for (var i = 1; i <= this.moveObject.move; i++) {
    //             cellPath.push({
    //                 x: curPos.x + i * MD_MOVE_DIRECT[this.moveObject.direct][0],
    //                 y: curPos.y + i * MD_MOVE_DIRECT[this.moveObject.direct][1],
    //             })
    //         }
    //
    //         this.characterMove(curPos, movePos, cellPath, cmd.ids);
    //     }
    //     else {
    //         this.processCharacterRun();
    //     }
    // },

    // xu li di chuyen cao khi server tra ve
    characterMove: function () {
        var timeScale = 1.0 ;
        if (this.isRun) {
            timeScale = 0.3;
            // quay 100 lan, cao chay tren map, ket thuc khi het duong di
            if (this.arrayPath.length == 0) {
                this.mascot.eff.gotoAndPlay("fun", -1, -1, 1);
                //this.mascot.eff.getAnimation().setTimeScale(1);
                midAutumn.midAutumnScene.showRollResult(false);
                return;
            }
            else {
                this.showDropPiece();
            }
        }
        else {
            if (this.arrayMove.length > 0) {
                if (this.arrayMove[0] == 0) {
                    // di chuyen het so diem mot lan tung xuc xac, show qua roi
                    if (this.arrayMove.length > 1) {
                        // van con di chuyen tiep, chi show qua roi
                        this.showDropPiece();
                        // remove phan tu chi so di chuyen dau tien
                        this.arrayMove.shift();
                    }
                    else {
                        // het duong di chuyen, show ra qua tuong ung
                        this.mascot.eff.gotoAndPlay("fun", -1, -1, 1);
                        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.showDropPiece.bind(this))));
                        return;
                    }
                }
            }
            this.arrayMove[0] = this.arrayMove[0] - 1;
        }

        // kiem tra de xu ly flip cao hoac chay animation tuong ung
        var isFlip = false;
        var sRun = "run_";
        var movePos = this.arrayPath.shift();

        if(this.curPos.y > movePos.y) {isFlip = true; sRun += "Side"}
        else if(this.curPos.y < movePos.y) {isFlip = false; sRun += "Side"}
        else if(this.curPos.x < movePos.x) sRun += "Down";
        else sRun += "Up";

        sRun = "run_";
        var dx = movePos.x - this.curPos.x;
        var dy = movePos.y - this.curPos.y;

        if (dx < 0) {
            sRun = "run_4";
        }
        else if (dx > 0) {
            sRun = "run_2";
        }
        else {
            if (dy > 0) {
                sRun = "run_3";
            }
            else {
                sRun = "run_1";
            }
        }
        cc.log("RUN NE " + sRun);
        this.mascot.stopAllActions();
        this.mascot.eff.gotoAndPlay(sRun, -1, -1, 0);
        //this.mascot.setFlippedX(isFlip);
        //   this.mascot.eff.getAnimation().setTimeScale(1 / timeScale);
        // var timeMove = this.mascotMoveEffect(this.getPosFromIndex(curPos.x, curPos.y),
        //     this.getPosFromIndex(movePos.x, movePos.y), false, timeScale , 1, false);
        var timeMove = 0.3;

        var p1 = this.getPosFromIndex(this.curPos.x, this.curPos.y);
        var p3 = this.getPosFromIndex(movePos.x, movePos.y);
        var p2 = cc.p(0, 0);
        p2.x = (p1.x + p3.x) / 2 - 25 + Math.random() * 50;
        p2.y = (p1.y + p3.y) / 2 - 25 + Math.random() * 50;
        var moveAction = new cc.BezierTo(timeMove * timeScale, [p1, p2, p3]);
        this.mascot.setPosition(this.getPosFromIndex(this.curPos.x, this.curPos.y));
        this.mascot.runAction(cc.sequence(
            cc.moveTo(timeMove * timeScale, this.getPosFromIndex(movePos.x, movePos.y)),
            // moveAction,
            cc.callFunc(this.characterMove.bind(this)))
        );
        var index = midAutumn.getIndexFromPoint(this.curPos.x, this.curPos.y);
        this.arGrid[index].effectJumpIn((timeMove - 0.2) * timeScale);
        this.curPos = movePos;
    },

    showDropPiece: function () {
        var cmd = midAutumn.midAutumnScene.cmdResult;
        var ids;
        if (this.isRun) {
            // lay ra 1 phan tu
            if (this.arrayId.length >= 1) {
                ids = this.arrayId.slice(0, 2);
                this.arrayId.splice(0, 1);
            }

        }
        else {
            // lay ra 3 phan tu trong mang di chuyen, moi o co 3 phan qua roi ra
            ids = this.arrayId.slice(0, 4);
            this.arrayId.splice(0, 3);
            if (this.arrayPath.length == 0) {
                // show gift result
                midAutumn.midAutumnScene.showRollResult(false);
            }
        }

        var showEffect = false;
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var scale;
            if (midAutumn.isLamp(id)) {
                scale = 0.3;
                showEffect = true;
            }
            else if (midAutumn.isItemStored(id)) {
                scale = 0.5;
                showEffect = true;
            }
            else
                scale = 1.5;
            this.dropPiece(midAutumn.getPieceImage(id), this.getPosFromIndex(this.curPos.x, this.curPos.y), scale, 4);
        }
        if (showEffect) {
            this.getGridFromPoint(this.curPos.x, this.curPos.y).effectReceiveGift();
        }
        // an gift tai vi tri o nay
        this.getGridFromPoint(this.curPos.x, this.curPos.y).hideGift(0);
    },

    dropPiece: function (img, pos, scale, time) {
        // cc.log("++DropPiece " + JSON.stringify(arguments));

        var sp = new MidAutumnPiece(img, time, pos.y - 25);
        sp.applyForce(cc.p(0, -5));
        sp.setPosition(pos);
        sp.setScale(scale);
        this.pMapEffect.addChild(sp, ST_MAP_ITEM_ZODER * 2);
        this.arPiece.push(sp);
    },

    mascotMoveEffect: function (curPos, endPos, flipX, timeScale, timeBubble) {
        timeScale = timeScale || 1;
        timeBubble = timeBubble || 2;

        // add shadow
        var disX = endPos.x - curPos.x;
        var disY = endPos.y - curPos.y;
        var distance = Math.sqrt(disX * disX + disY * disY);
        var numShadow = Math.floor(distance / MD_CHARACTER_SHADOW_RATIO);
        var timeMove = this.calculateTimeRun(curPos, endPos, timeScale);
        var delX = disX / numShadow;
        var delY = disY / numShadow;
        var delTime = timeMove / numShadow;
        var curTime = 0;

        var timeShadow = 0.5;
        // for (var i = 0; i < numShadow; i++) {
        //     curPos.x += delX;
        //     curPos.y += delY;
        //     curTime += delTime;
        //
        //     var nScale = Math.random()/2;
        //     var sp2 = this.generateBubbleEffect(nScale, curTime, timeBubble);
        //     sp2.setPosition(curPos);
        //     this.pMapEffect.addChild(sp2);
        // }

        return timeMove;
    },

    calculateTimeRun: function (curPos, endPos, timeScale) {
        var disX = endPos.x - curPos.x;
        var disY = endPos.y - curPos.y;
        var distance = Math.sqrt(disX * disX + disY * disY);
        var timeMove = distance * timeScale / 200;
        return timeMove;
    },

    // roi manh trong qua trinh di chuyen cua cao
    dropPiece: function (img, pos, scale, time) {
        // cc.log("++DropPiece " + JSON.stringify(arguments));

        var sp = new MidAutumnPiece(img, time, pos.y - 25);
        sp.applyForce(cc.p(0, -5));
        sp.setPosition(pos);
        sp.setScale(scale);
        this.pMapEffect.addChild(sp, MD_MAP_ITEM_ZODER * 2);
        this.arPiece.push(sp);
    },


    // lay vi tri tu toa do: i la hang, j la cot
    getPosFromIndex: function (i, j) {
        cc.log("POS FROM INDEX " + i + " " + j);
        var convert = i * MD_ROW + j;
        return this.arGrid[convert].getPosition();
        //return cc.p(this.gridSize.width * (j + 0.5), this.mapSize.height - this.gridSize.height * (i + 0.8));
    },

    update: function (dt) {
        // Effect drop piece from egg
        for (var i = this.arPiece.length - 1; i >= 0; i--) {
            var p = this.arPiece[i];
            if (p) {
                p.update(dt);
                if (p.isDead()) {
                    p.removeFromParent();
                    this.arPiece.splice(i, 1);
                }
            }
        }
        this.genCloud(dt);
    }
})

MidAutumnMap.WIDTH_ISO = 98;
MidAutumnMap.HEIGHT_ISO = 60;

// TABLE CELL
var MidAutumnFullCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/EventMgr/MidAutumn/MDFullItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.line = ccui.Helper.seekWidgetByName(this._layout, "line");
        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.get = ccui.Helper.seekWidgetByName(this._layout, "get");
        this.name = ccui.Helper.seekWidgetByName(this._layout, "name");
        this.bgGift = ccui.Helper.seekWidgetByName(this._layout, "notify");
        this.numGift = ccui.Helper.seekWidgetByName(this._layout, "numGift");

        this.circle = ccui.Helper.seekWidgetByName(this._layout, "circle");
        this.particle = this._layout.getChildByName("particle");

        this.breaks = [];
        for (var i = 0; i < MD_NUM_PIECE; i++) {
            var br = ccui.Helper.seekWidgetByName(this._layout, "img_" + i);
            // br.setTouchEnabled(true);
            br.num = ccui.Helper.seekWidgetByName(br, "lb");
            br.bg = ccui.Helper.seekWidgetByName(br, "bg");
            // br.onTouchBegan = function (touch, event) {
            //     cc.log("ON TOUCH BEGAN ");
            //     return true;
            // }
            br.bgNumChange =  ccui.Helper.seekWidgetByName(br, "bgNumChange");
            br.lbNumChange = ccui.Helper.seekWidgetByName(br.bgNumChange, "lbNum");
            this.breaks.push(br);
        }

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,

            onTouchBegan: function (touch, event) {
                event.getCurrentTarget().onTouchItem(touch.getLocation(), 0);
                return true;
            },

            onTouchEnded: function (touch, event) {
                event.getCurrentTarget().onTouchItem(touch.getLocation(), 1);
            },

            onTouchMoved: function (touch, event) {
                event.getCurrentTarget().onTouchItem(touch.getLocation(), 2);
            }
        }, this);
        this.typeItem = MD_ITEM_IN_MAIN_SCENE;
        this.touchId = -1;
    },

    setType: function (typeItem) {
        this.typeItem = typeItem;
        if (this.typeItem == MD_ITEM_IN_CHANGE_SCENE) {
            this.name.setColor(cc.color(182, 78, 2, 255));
        }
    },

    onTouchItem: function (p, type) {
        if (this.typeItem == MD_ITEM_IN_MAIN_SCENE) {
            switch (type) {
                case 0: // began
                {
                    var pos = this.getParent().convertToNodeSpace(p);
                    var cp = this.getPosition();
                    var rect = cc.rect(cp.x, cp.y, this._layout.getContentSize().width, this._layout.getContentSize().height);
                    if (cc.rectContainsPoint(rect, pos)) {
                        this.touchPosition = p;
                        this.showItemPopup(true, p);
                    } else {
                        this.touchPosition = cc.p(0, 0);
                    }
                    break;
                }
                case 2: // move
                {
                    if (this.touchPosition) {
                        if (this.touchPosition.x * this.touchPosition.y == 0) break;

                        var dX = Math.abs(p.x - this.touchPosition.x);
                        var dY = Math.abs(p.y - this.touchPosition.y);
                        if (dX > 20 || dY > 10) {
                            cc.log("HIDE POPUP ");
                            this.showItemPopup(false);
                        }
                    }
                    break;
                }
                case 1: // end
                {
                    if (this.touchPosition && (this.touchPosition.x > 0 || this.touchPosition.y > 0)) {
                        this.touchPosition = cc.p(0, 0);
                        // this.showItemPopup(false);
                    }
                    break;
                }
            }
        }
        else {
            switch (type) {
                case 0: // began
                {
                    var pos1 = this.convertToNodeSpace(p);
                    for (var i = 0; i < 4; i++) {
                        var rect1 = cc.rect(this.breaks[i].getPosition().x - this.breaks[i].getContentSize().width * 0.5, this.breaks[i].getPosition().y- this.breaks[i].getContentSize().height * 0.5,
                            this.breaks[i].getContentSize().width, this.breaks[i].getContentSize().height);
                        if (cc.rectContainsPoint(rect1, pos1)) {
                            this.touchId = i;
                            if (this.info.item[this.touchId] - this.info.numChange[this.touchId] < 2) {
                                if (this.info.item[this.touchId] - this.info.numChange[this.touchId] == 1) {
                                    ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_CHANGE_PIECE_LAST"));
                                }
                                this.touchId = -1;
                                return;
                            }
                            this.touchPosition = p;
                            this.touchTime = new Date().getTime();
                            this.schedule(this.update.bind(this), 0.1);
                            this.lastNumChange = this.info.numChange[this.touchId];
                            break;
                        }
                    }

                    break;
                }
                case 2: // move
                {
                    if (this.touchId >= 0) {
                        if (this.touchPosition.x * this.touchPosition.y == 0) break;

                        var dX = Math.abs(p.x - this.touchPosition.x);
                        var dY = Math.abs(p.y - this.touchPosition.y);
                        if (dX > 20 || dY > 10) {
                            this.touchId = -1;
                            return;
                        }
                    }
                    break;
                }
                case 1: // end
                {
                    if (this.touchId >= 0) {
                        var time = new Date().getTime() - this.touchTime;
                        if (time < 1000) {
                            this.countTouch++;
                            this.info.numChange[this.touchId] = this.info.numChange[this.touchId] + 1;
                            this.updateLabelNum(this.touchId);
                            if (this.countTouch > 5) {
                                this.countTouch = 0;
                                Toast.makeToast(Toast.SHORT, localized("MD_CHANGE_PIECE_TOUCH"));
                            }
                        }
                    }
                    this.touchId = -1;
                    this.unscheduleAllCallbacks();
                    break;
                }
            }
        }
    },

    update: function () {
        var time = new Date().getTime() - this.touchTime;
        if (time > 500) {
            this.countTouch = 0;
            var num = 0;
            var d = (this.info.item[this.touchId] - this.lastNumChange) / 20;
            num = 1 + Math.floor((time - 500) / 100 * d);

            if (this.info.item[this.touchId] - this.lastNumChange - num < 2) {
                this.info.numChange[this.touchId] = this.info.item[this.touchId] - 1;
            }
            else {
                this.info.numChange[this.touchId] = this.lastNumChange + num;
            }
            this.updateLabelNum(this.touchId);
        }
    },

    updateLabelNum: function (idBreak) {
        this.updateInOneBreak(idBreak);
        //this.breaks[idBreak].num.setString(this.info.item[idBreak] - this.info.numChange[idBreak]);
        var gui = sceneMgr.getGUIByClassName("MidAutumnHistoryGUI");
        if (gui && gui.pChangePiece)
            gui.pChangePiece.panel.updateButtonChange();
    },

    updateInOneBreak: function (idBreak) {
        if (idBreak < 0 || idBreak > 3)
            return;
        if (!this.breaks[idBreak]) {
            return;
        }
        if (this.info.numChange[idBreak] > 0) {
            this.breaks[idBreak].bgNumChange.setVisible(true);
            this.breaks[idBreak].num.setVisible(false);
            this.breaks[idBreak].bg.setVisible(false);
            this.breaks[idBreak].lbNumChange.setString(this.info.numChange[idBreak] + "/" + this.info.item[idBreak]);
        }
        else {
            this.breaks[idBreak].bgNumChange.setVisible(false);
            this.breaks[idBreak].num.setVisible(true);
            this.breaks[idBreak].bg.setVisible(true);
        }
    },

    showItemPopup: function (visible) {
        if (visible) {
            if (midAutumn.midAutumnScene) {
                midAutumn.midAutumnScene.showPopupInfo(this.info, this.touchPosition);
            }
        } else {
            if (midAutumn.midAutumnScene) {
                midAutumn.midAutumnScene.showPopupInfo();
            }

            this.timeCount = 0;
            this.isWaitPopup = false;
            this.touchPosition = null;
        }
    },

    updateInfo: function (idx) {
        this.info = midAutumn.gifts[idx];
        this.updateContent();
        // cc.log("--ItemFullCell " + idx + " : " + JSON.stringify(this.info));
    },

    updateInfoChange: function (idx) {
        this.info = midAutumn.arrayGiftChange[idx];
        this.updateContent();
        for (var i = 0; i < this.breaks.length; i++) {
            this.updateInOneBreak(i);
        }
    },

    updateContent: function () {
        this.countTouch = 0;
        this.bg.loadTexture(midAutumn.getGiftBackgroundImage(this.info.id));
        this.img.loadTexture(midAutumn.getGiftImage(this.info.id));

        var isGift = this.info.gift > 0;

        this.img.setVisible(isGift);
        this.get.setVisible(isGift);
        this.bg.setVisible(!isGift);

        this.bgGift.setVisible(this.info.gift > 1);
        this.numGift.setVisible(this.info.gift > 1);
        this.numGift.setString(this.info.gift);

        this.circle.setVisible(isGift);
        if (isGift) this.circle.runAction(cc.repeatForever(cc.rotateBy(0.15, 5)));
        this.particle.setVisible(isGift);

        var sName = midAutumn.getItemNameSub(this.info.id);
        this.name.setString(sName);

        for (var i = 0; i < this.breaks.length; i++) {
            var piece = this.breaks[i];
            piece.loadTexture(midAutumn.getPieceImage(this.info.id + i + 1));
            piece.setVisible(this.info.item[i] > 0 && !isGift);
            //piece.num.setString(this.info.item[i]);
            piece.num.setString(this.info.item[i] - this.info.numChange[i]);

            piece.num.setVisible(this.info.item[i] > 1);
            piece.bg.setVisible(this.info.item[i] > 1);
            piece.bgNumChange.setVisible(false);
        }

    },
});

var MidAutumnLiteCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/EventMgr/MidAutumn/MDLiteItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.name = ccui.Helper.seekWidgetByName(this._layout, "name");

        this.notify = ccui.Helper.seekWidgetByName(this._layout, "notify");
        this.numGift = ccui.Helper.seekWidgetByName(this._layout, "numGift");

        this.breaks = [];
        for (var i = 0; i < MD_NUM_PIECE; i++) {
            var br = ccui.Helper.seekWidgetByName(this._layout, "pie" + i);
            this.breaks.push(br);
        }

        cc.log("LITE ITEM NE ");

        // cc.eventManager.addListener({
        //     event: cc.EventListener.TOUCH_ONE_BY_ONE,
        //
        //     onTouchBegan: function (touch, event) {
        //         event.getCurrentTarget().onTouchItem(touch.getLocation(), 0);
        //         return true;
        //     },
        //
        //     onTouchEnded: function (touch, event) {
        //         event.getCurrentTarget().onTouchItem(touch.getLocation(), 1);
        //     },
        //
        //     onTouchMoved: function (touch, event) {
        //         event.getCurrentTarget().onTouchItem(touch.getLocation(), 2);
        //     }
        // }, this);
        //}
    },

    onTouchItem: function (p, type) {
        switch (type) {
            case 0: // began
            {
                var pos = this.getParent().convertToNodeSpace(p);
                var cp = this.getPosition();
                var rect = cc.rect(cp.x, cp.y, this.bg.getPositionX() + this.bg.getContentSize().width, this.bg.getPositionY() + this.bg.getContentSize().height);

                if (cc.rectContainsPoint(rect, pos)) {
                    this.touchPosition = p;
                    this.showItemPopup(true, p);
                } else {
                    this.touchPosition = cc.p(0, 0);
                }
                break;
            }
            case 2: // move
            {
                if (this.touchPosition) {
                    if (this.touchPosition.x * this.touchPosition.y == 0) break;

                    var dX = Math.abs(p.x - this.touchPosition.x);
                    var dY = Math.abs(p.y - this.touchPosition.y);
                    if (dX > 20 || dY > 10) {
                        this.showItemPopup(false);
                    }
                }
                break;
            }
            case 1: // end
            {
                if (this.touchPosition && (this.touchPosition.x > 0 || this.touchPosition.y > 0)) {
                    this.touchPosition = cc.p(0, 0);
                    // this.showItemPopup(false);
                }
                break;
            }
        }
    },

    showItemPopup: function (visible) {
        if (visible) {
            if (midAutumn.midAutumnScene) {
                midAutumn.midAutumnScene.showPopupInfo(this.info, this.touchPosition);
            }
        } else {
            if (midAutumn.midAutumnScene) {
                midAutumn.midAutumnScene.showPopupInfo();
            }

            this.timeCount = 0;
            this.isWaitPopup = false;
            this.touchPosition = null;
        }
    },

    updateInfo: function (idx) {
        this.info = midAutumn.gifts[idx];
        // cc.log("--ItemLiteCell " + idx + " : " + JSON.stringify(this.info));

        this.notify.setVisible(this.info.gift > 0);
        this.numGift.setVisible(this.info.gift > 0);
        this.numGift.setString(this.info.gift);

        this.img.removeAllChildren();
        var sprImg = new cc.Sprite(midAutumn.getGiftImage(this.info.id));
        this.img.addChild(sprImg);
        sprImg.setScale(0.45);
        sprImg.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
        this.name.setString(midAutumn.getItemNameShort(this.info.id));

        var isGift = this.info.gift > 0;
        for (var i = 0; i < this.breaks.length; i++) {
            var piece = this.breaks[i];
            piece.setVisible(this.info.item[i] > 0 || isGift);
        }
    }
});

var MidAutumnPiecesHistoryCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        //var jsonLayout = ccs.load("MidAutumnHistoryItem.json");
        var jsonLayout = ccs.load("res/EventMgr/MidAutumn/MDPiecesHistoryItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.lbRoll = ccui.Helper.seekWidgetByName(this._layout, "lbRoll");
        this.empty = ccui.Helper.seekWidgetByName(this._layout, "lbEmpty");
        this.pGift = this._layout.getChildByName("gift");
        this.line = ccui.Helper.seekWidgetByName(this._layout, "line");
        if (!cc.sys.isNative){
            var lbRollTemp = this.lbRoll;
            lbRollTemp.setVisible(false);
            this.lbRoll = BaseLayer.createLabelText(lbRollTemp);
            lbRollTemp.getParent().addChild(this.lbRoll);
            this.lbRoll.setPosition(lbRollTemp.getPosition());
            this.lbRoll.setAnchorPoint(lbRollTemp.getAnchorPoint());
            this.lbRoll.setColor(lbRollTemp.getTextColor());
            this.lbRoll.ignoreContentAdaptWithSize(true);
            var size = cc.size(lbRollTemp.getContentSize().width * 0.8, lbRollTemp.getContentSize().height);
            this.lbRoll.setTextAreaSize(size);
        }
    },

    updateInfo: function (idx) {
        var rollObj = midAutumn.arRollHistory[idx];

        if (rollObj && rollObj.pieces) {
            var n = Object.keys(rollObj.pieces).length;
            n = (n % MD_PIECE_MAX_ROW == 0) ? (n / MD_PIECE_MAX_ROW) : parseInt(n / MD_PIECE_MAX_ROW) + 1;
            n = (n == 0) ? 1 : n;
            this._layout.setPositionY(n * MD_PIECE_IMAGE_SIZE + 30);
        }

        var str = LocalizedString.to("MD_ROLL_HISTORY_ITEM");
        str = StringUtility.replaceAll(str, "@num", rollObj.roll);
        this.lbRoll.setString(str);

        // generate image piece
        var lastY = 0;
        this.pGift.removeAllChildren();
        var i = 0;
        for (var s in rollObj.pieces) {
            var img = new MidAutumnPieceItem();
            img.setInfo({
                id : s,
                num : rollObj.pieces[s],
                isNew: rollObj.isNews[s]
            });
            this.pGift.addChild(img);

            img.setPosition(MD_PIECE_IMAGE_SIZE * (i % MD_PIECE_MAX_ROW), -MD_PIECE_IMAGE_SIZE / 5 - parseInt(i / MD_PIECE_MAX_ROW) * MD_PIECE_IMAGE_SIZE);
            lastY = img.getPositionY();
            ++i;
        }
        lastY = lastY - 30;
        this.empty.setVisible(Object.keys(rollObj.pieces).length == 0);
        this.line.setPositionY(lastY - MD_PIECE_IMAGE_SIZE / 1.25);
    }
});

var MidAutumnGiftHistoryCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/EventMgr/MidAutumn/MDGiftHistoryItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.itemName = ccui.Helper.seekWidgetByName(this._layout, "sname");
        this.gift = ccui.Helper.seekWidgetByName(this._layout, "gift");
    },

    updateInfo: function (idx) {
        var giftId = midAutumn.arGiftHistory[idx];
        // cc.log("--Item : " + giftId);
        if (giftId == -1) {
            this.itemName.setString(LocalizedString.to("MD_GIFT_HISTORY_EMPTY"));
            this.gift.setVisible(false);
        } else {
            this.itemName.setString(midAutumn.getItemName(giftId));
            this.gift.setVisible(true);
            this.gift.removeAllChildren();

            var sp = new cc.Sprite(midAutumn.getGiftImageOpen(giftId));
            sp.setPosition(this.gift.getContentSize().width / 2, this.gift.getContentSize().height / 2);

            var sX = this.gift.getContentSize().width / sp.getContentSize().width * 0.85;
            var sY = this.gift.getContentSize().height / sp.getContentSize().height * 0.85;
            sp.setScale(sX > sY ? sX : sY);
            this.gift.addChild(sp);
        }
    }
});

var MidAutumnGiftCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        this.arInfo = [];
        this.arPos = [];

        var jsonLayout = ccs.load("res/EventMgr/MidAutumn/MDGiftCell.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.arItem = [];
        for (var i = 0; i < 2; i++) {
            var item = {};
            item.bg = ccui.Helper.seekWidgetByName(this._layout, "bg_" + i);
            item.img = ccui.Helper.seekWidgetByName(this._layout, "img_" + i);
            item.bgNum = ccui.Helper.seekWidgetByName(this._layout, "bgNum_" + i);
            item.num = ccui.Helper.seekWidgetByName(this._layout, "num_" + i);
            item.name = ccui.Helper.seekWidgetByName(this._layout, "name_" + i);
            item.new = ccui.Helper.seekWidgetByName(this._layout, "new_" + i);

            this.arItem.push(item);
            this.arPos.push(item.name.getPosition());
        }
    },

    setInfo: function (ar) {
        this.arInfo = ar;
        for (var i = 0; i < this.arItem.length; i++) {
            var inf = null;
            if (i < ar.length) {
                inf = ar[i];
            }

            //cc.log("--> Set Info " + JSON.stringify(inf));
            var item = this.arItem[i];
            item.bg.stopAllActions();
            item.bg.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(1, 1.05, 0.98), cc.scaleTo(1, 0.95, 1.05))));
            for (var key in item) {
                item[key].setVisible(inf != null);
            }

            if (inf) {
                if (inf.id == MD_GOLD_GIFT_EXTRA_ID) {
                    item.name.setString(StringUtility.formatNumberSymbol(inf.value));
                }
                else if (midAutumn.isItemStored(inf.id) || midAutumn.isLamp(inf.id)) {
                    var str = midAutumn.getItemNameShort(inf.id);
                    item.name.setString(str);
                } else {
                    item.name.setString(StringUtility.formatNumberSymbol(midAutumn.getItemValue(inf.id)));
                }

                if (inf.id == MD_GOLD_GIFT_EXTRA_ID) {
                    item.num.setVisible(false);
                    item.bgNum.setVisible(false);
                }
                else {
                    item.num.setString(inf.value);
                    item.num.setVisible(inf.value > 1);
                    item.bgNum.setVisible(inf.value > 1);
                    item.new.setVisible(!midAutumn.checkInLastGifts(inf.id));
                }


                item.img.removeAllChildren();
                var sp;
                if (midAutumn.isLamp(inf.id)) {
                    sp = new cc.Sprite(midAutumn.getImgLamp(inf.id));
                }
                else if (inf.isStored) {
                    sp = new cc.Sprite(midAutumn.getPieceImage(inf.id));
                }
                else {
                    sp = new cc.Sprite("res/EventMgr/MidAutumn/MidAutumnUI/e10.png");
                }

                sp.setPosition(item.img.getContentSize().width / 2, item.img.getContentSize().height / 2);
                item.img.addChild(sp);

                var sX = item.img.getContentSize().width / sp.getContentSize().width;
                var sY = item.img.getContentSize().height / sp.getContentSize().height;
                sp.setScale(Math.min(sX, sY));
            }
        }
    },

    getDropInfo: function () {
        var ar = [];
        for (var i = 0; i < this.arInfo.length; i++) {
            var obj = {};
            var cPos = this.convertToWorldSpace(cc.p(0, 0));
            obj.pos = cc.p(cPos.x + this.arPos[i].x, cPos.y + this.arPos[i].y);
            var inf = this.arInfo[i];
            obj.isItem = (inf != null);
            if (inf) {
                obj.id = inf.id;
                obj.value = inf.value;
                obj.isStored = midAutumn.isItemStored(inf.id);
            }
            ar.push(obj);
        }
        return ar;
    },
});

// TABLE VIEW
var MidAutumnCollectionsCollapseGUI = BaseLayer.extend({

    ctor: function (parentNode) {
        this._super("MidAutumnCollectionsCollapseGUI");
        this.parentNode = parentNode;

        this.customButton("btn", 0, this.parentNode);

        var bListGift = this.getControl("list", this.parentNode);
        var bSizeGift = bListGift.getContentSize();
        this.uiGift = new cc.TableView(this, cc.size(bSizeGift.width * 1.05, bSizeGift.height));
        this.uiGift.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.uiGift.setVerticalFillOrder(1);
        this.uiGift.setDelegate(this);
        bListGift.addChild(this.uiGift);
        this.uiGift.reloadData();


        this.ignoreAllButtonSound();
    },

    onEnterFinish: function(){
        if (!cc.sys.isNative){
            this.uiGift.setTouchEnabled(true);
        }
    },

    onButtonRelease: function (btn, id) {

        MidAutumnSound.playBubbleSingle();

        midAutumn.midAutumnScene.doActionItemList(MD_SHOW_LIST_ITEM_FULL);
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(90, 100);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new MidAutumnLiteCell();
        }
        cell.updateInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return midAutumn.gifts.length;
    },

    tableCellTouched: function (table, cell) {
        if (midAutumn.midAutumnScene.itemListMode == 0) {
            midAutumn.midAutumnScene.doActionItemList(1);
        } else {
            midAutumn.midAutumnScene.openItem(cell.info);
        }
    },
});

var MidAutumnCollectionsExpandGUI = BaseLayer.extend({

    ctor: function (parentNode) {
        this._super("MidAutumnCollectionsExpandGUI");
        this.parentNode = parentNode;
        this.customButton("btn", 0, this.parentNode);

        var bListGift = this.getControl("list", this.parentNode);
        var bSizeGift = bListGift.getContentSize();
        this.uiGift = new cc.TableView(this, cc.size(bSizeGift.width * 1.0, bSizeGift.height));
        this.uiGift.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.uiGift.setVerticalFillOrder(1);
        this.uiGift.setDelegate(this);
        bListGift.addChild(this.uiGift);
        this.uiGift.reloadData();

        this.ignoreAllButtonSound();
    },

    onEnterFinish: function(){
        if (!cc.sys.isNative){
            this.uiGift.setTouchEnabled(true);
        }
    },

    onButtonRelease: function (btn, id) {
        MidAutumnSound.playBubbleSingle();
        midAutumn.midAutumnScene.doActionItemList(MD_SHOW_LIST_ITEM_MINI);
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(150, 180);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new MidAutumnFullCell();
        }
        cell.updateInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return midAutumn.gifts.length;
    },

    tableCellTouched: function (table, cell) {
        try {
            midAutumn.midAutumnScene.openItem(cell.info);

        } catch (e) {

        }
    },
});

var MidAutumnPanelChangePiece = BaseLayer.extend({

    ctor: function (parent) {
        this._super("");

        var jsonLayout = ccs.load("res/EventMgr/MidAutumn/MDChangePiece.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.panelItem = ccui.Helper.seekWidgetByName(this._layout, "panelItem");
        this.btnChange = this.customButton("btnChange", MD_PANEL_CHANGE, this._layout);
        // this.checkBox = ccui.Helper.seekWidgetByName(this._layout, "checkBox");
        this.btnDeselect = this.customButton("btnDeselect", MD_PANEL_DESELECT, this._layout);
        this.btnSelect = this.customButton("btnSelectAll", MD_PANEL_SELECT_ALL, this._layout);
        this.lbNum = this.getControl("lbNum", this._layout);
        this.lbGold = this.getControl("lbGold", this.btnChange);
        this.lbNoPiece = this.getControl("lbNoPiece", this.panelItem);

        this.listItem = new cc.TableView(this, cc.size(300, this.panelItem.getContentSize().height));
        this.listItem.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listItem.setVerticalFillOrder(1);
        this.listItem.setDelegate(this);
        this.panelItem.addChild(this.listItem);
        this.listItem.reloadData();

    },

    onEnterFinish: function () {
        if (midAutumn.arrayGiftChange.length > 0) {
            this.lbNoPiece.setVisible(false);
        }
        else {
            this.lbNoPiece.setVisible(true);
        }

        this.updateData();
    },

    updateButtonChange: function () {
        this.lbGold.setString(StringUtility.pointNumber(midAutumn.getGoldChange()));
        this.lbNum.setString(midAutumn.getNumChange() + " * " + "500.000");
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case MD_PANEL_CHANGE:
                cc.log("CHANGE ITEM");
                midAutumn.sendListChange();
                break;
            case MD_PANEL_DESELECT:
                cc.log("DESELECT");
                midAutumn.resetChange();
                this.updateButtonChange();
                this.listItem.reloadData();
                break;
            case MD_PANEL_SELECT_ALL:
                midAutumn.autoSelectChange();
                this.updateButtonChange();
                this.listItem.reloadData();
                break;
            default:
                break;
        }

    },

    updateData: function () {
        this.listItem.reloadData();
        this.updateButtonChange();
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(195, 200);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new MidAutumnFullCell();
            cell.setType(MD_ITEM_IN_CHANGE_SCENE);
        }
        cell.updateInfoChange(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return midAutumn.arrayGiftChange.length;
    },
});