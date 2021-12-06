
// image or sprite

var BlueOceanResultGift = cc.Node.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/BlueOcean/BOGiftResultNode.json");
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
        if (inf.id == BO_GOLD_GIFT_EXTRA_ID || inf.id == BO_DIAMOND_GIFT_EXTRA_ID || inf.id == BO_EXP_GIFT_EXTRA_ID) {
            this.name.setString(StringUtility.formatNumberSymbol(inf.value));
        }
        else if (blueOcean.isItemStored(inf.id)) {
            var str = blueOcean.getItemNameShort(inf.id);
            this.name.setString(str);
        } else {
            this.name.setString(StringUtility.formatNumberSymbol(blueOcean.getItemValue(inf.id)));
        }
        this.img.removeAllChildren();
        var sp;
        if (inf.id == BO_GOLD_GIFT_EXTRA_ID || inf.id == BO_DIAMOND_GIFT_EXTRA_ID || inf.id == BO_EXP_GIFT_EXTRA_ID) {
            this.num.setVisible(false);
            this.bgNum.setVisible(false);
        }
        else {
            this.num.setString(inf.value);
            this.num.setVisible(inf.value > 1);
            this.bgNum.setVisible(inf.value > 1);
            //this.new.setVisible(!blueOcean.checkInLastGifts(inf.id));

        }
        this.new.setVisible(false);
        if (inf.isStored) {
            sp = new cc.Sprite(blueOcean.getPieceImage(inf.id));
        }
        else if (inf.id == BO_DIAMOND_GIFT_EXTRA_ID) {
            sp = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/iconDiamond.png");
        }
        else if (inf.id == BO_EXP_GIFT_EXTRA_ID) {
            sp = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/cellNormal.png");
        }
        else {
            sp = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/e10.png");
        }

        sp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
        this.img.addChild(sp);

        var sX = this.img.getContentSize().width / sp.getContentSize().width;
        var sY = this.img.getContentSize().height / sp.getContentSize().height;
        sp.setScale(Math.min(sX, sY));
    },
});

var BlueOceanPieceItem = cc.Node.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/BlueOcean/BOPieceItem.json");
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
        this.new.setVisible(false);

        if (blueOcean.isItemStored(inf.id)) {
            sName = blueOcean.getItemNameShort(inf.id);

            this.num.setVisible(inf.num > 1);
            this.nof.setVisible(inf.num > 1);
            this.num.setString(inf.num);
        } else {
            sName = StringUtility.formatNumberSymbol(inf.num);
        }
        this.name.setString(sName);

        var sp;
        sp = new cc.Sprite(blueOcean.getPieceImage(inf.id));
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

var BlueOceanPiece = cc.Node.extend({
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

var BlueOceanMoney = cc.Node.extend({

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

        var commaY = (new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/bosogold/so1.png")).getContentSize().height;

        for(var i = 0 ; i < nStr.length ; i++)
        {
            var nContent = "res/Event/BlueOcean/BlueOceanUI/bosogold/";
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

var BlueOceanGrid = cc.Node.extend({

    ctor : function (id,x,y) {
        this._super();

        this.ID = BO_CELL_EMPTY;
        this.tempID = BO_CELL_EMPTY;
        this.cellX = x;
        this.cellY = y;
        this.initContent();
        this.updateInfo(id);
    },

    // khoi tao content grid
    initContent: function () {
        // this.bgShadow = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/bgShadow.png");
        // this.addChild(this.bgShadow);
        // this.bgShadow.setPositionY(-8);

        this.bg = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/cellNormal.png");
        this.addChild(this.bg);

        this.imgGift = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/icon_gold.png");
        this.addChild(this.imgGift);
        this.imgGift.setPositionY(5);
        this.imgGift.defaultPos = this.imgGift.getPosition();
        this.imgGift.setLocalZOrder(1);

        this.effectGift = new CustomSkeleton("res/Event/BlueOcean/BlueOceanRes/Spine", "kimcuong", 1);
        this.effectGift.setScale(0.8);
        this.addChild(this.effectGift, 1, 100);
        //  this.effectGift.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.5);
        //this.effectGift.gotoAndPlay("1", -1, -1, 1);
        this.effectGift.setVisible(false);

        this.effectBubble = resourceManager.loadDragonbone("BubbleBreak");
        this.effectBubble.setScale(0.95);
        this.addChild(this.effectBubble, 10, 100);
        //  this.effectGift.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.5);
        //this.effectBubble.gotoAndPlay("1", -1, -1, 0);
        this.effectBubble.setVisible(false);
        this.effectBubble.setPosition(-3, 6);

        var effect = resourceManager.loadDragonbone("FX_nhanqua");
        // effect.gotoAndPlay("1", -1, -1, -1);
        this.addChild(effect);
        //effect.setPosition(this.getPosFromIndex(this.curPos.x, this.curPos.y));
        // effect.runAction(cc.sequence(cc.delayTime(2.0), cc.removeSelf()));
        this.effectSpecial = effect;
        effect.setVisible(false);

        this.lbNum = new ccui.Text();
        this.addChild(this.lbNum, 1);
        this.lbNum.setFontName(SceneMgr.FONT_BOLD);
        this.lbNum.setString("10");
        //  this.lbPercent.setPosition(0, - this.button.getContentSize().height * 0.35);
        this.lbNum.setColor(cc.color(200,213,208));
        this.lbNum.enableOutline(cc.color(110,138,138), 1);
        this.lbNum.setFontSize(24);
        this.lbNum.setPositionY(5);
        this.pEffect = new cc.Node();
        this.addChild(this.pEffect, 10);

        this.imgBubble = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/bubble.png");
        this.imgBubble.setScale(0.6);
        this.addChild(this.imgBubble);
        this.imgBubble.setPositionY(5);
        this.imgBubble.defaultPos = this.imgBubble.getPosition();

        this.setContentSize(this.bg.getContentSize());
    },

    startEffect: function () {
      //  this.pEffect.setVisible(true);
    //    this.addEffect();
    },

    addEffect: function () {
        var sprite = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/star_light.png");
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
      //  this.pEffect.removeAllChildren();
     //   this.pEffect.setVisible(true);
    },

    showLand: function () {
       // this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.callbackShowLand.bind(this))));
        this.bg.runAction(cc.sequence(cc.delayTime(0.5), cc.scaleTo(0.3, 0), cc.callFunc(this.callbackShowLand.bind(this))));
    },

    callbackShowLand: function () {
        this.bg.setTexture("res/Event/BlueOcean/BlueOceanUI/cellNormal.png");
        this.effectBubble.setVisible(true);
        this.effectBubble.gotoAndPlay("1", -1, -1, 1);
        this.bg.runAction(cc.sequence(new cc.EaseBackIn(cc.scaleTo(0.5, 1))));
    },

    updateInfo : function (id) {
        if (id != this.id) {
            this.effectBubble.setVisible(true);
            this.effectBubble.gotoAndPlay("1", -1, 1, 1);
        }
        this.id = id;
        id = parseInt(id);
        // cc.log("cell_normal" + id + ".png");
        // if (id <= 1)
        //     this.bg.setTexture("res/Event/BlueOcean/BlueOceanUI/cell_" + id + ".png");
        // else
        //     this.bg.setTexture("res/Event/BlueOcean/BlueOceanUI/cell_" + 2 + ".png");
        this.effectGift.setVisible(false);
        this.lbNum.setVisible(false);
        this.bg.setTexture("res/Event/BlueOcean/BlueOceanUI/cellNormal.png");
        this.imgBubble.setVisible(false);
        this.imgGift.setScale(1);
        this.effectGift.setVisible(false);
        switch (id) {
            case BO_CELL_GOLD:
                this.stopEffect();
                this.imgGift.setTexture("res/Event/BlueOcean/BlueOceanUI/iconGoldMap.png");
                this.imgGift.setVisible(true);
                break;
            case BO_CELL_ITEM:
                this.stopEffect();
                this.imgGift.setTexture("res/Event/BlueOcean/BlueOceanUI/iconLight.png");
                this.imgGift.setVisible(false);
                this.effectItem.setVisible(true);
                break;
            case BO_CELL_WATER:
                this.imgGift.setVisible(false);
                this.bg.setTexture("res/Event/BlueOcean/BlueOceanUI/cellWater.png");
                break;
            case BO_CELL_CHEST:
                this.imgGift.setVisible(false);
               // this.bg.setTexture("res/Event/BlueOcean/BlueOceanUI/cellCNormal.png");
                break;
            case BO_CELL_MAP:
                this.imgGift.setVisible(true);
                this.imgGift.setTexture("res/Event/BlueOcean/BlueOceanUI/iconMap.png");
                break;
            case BO_CELL_MAP_BUBBLE:
                this.imgGift.setVisible(true);
                this.imgGift.setTexture("res/Event/BlueOcean/BlueOceanUI/iconMap.png");
                this.lbNum.setVisible(true);
             //   this.lbNum.setString(blueOcean.mapInfo.moveNumberToChangeBubble);
                this.imgBubble.setVisible(true);
                break;
            case BO_CELL_ROCK:
                this.lbNum.setVisible(true);
                this.lbNum.setString(blueOcean.mapInfo.moveNumberToChangeMap)
                this.imgGift.setVisible(false);
                this.bg.setTexture("res/Event/BlueOcean/BlueOceanUI/cellRock.png");
                break;
            case 1000010:
            case 1000020:
            case 1000030:
            case 1000040:
            case 1000050:
            case 1000060:
            case 1000070:
                this.imgGift.setVisible(true);
                this.imgGift.setTexture("res/Event/BlueOcean/BlueOceanUI/enMap" + id + ".png");
                //this.effectGift.setVisible(true);
                //this.effectGift.setAnimation(0, "" + id, -1, CustomSkeleton.SCALE_ACTION, id);
                break;
            default:
                this.startEffect();
                this.imgGift.setTexture("res/Event/BlueOcean/BlueOceanUI/enMap" + id + ".png");
                this.imgGift.setVisible(true);
                //  this.effectGift.setVisible(true);
                break;
        }
        // if (!this.imgGift.isVisible() && id != BO_CELL_LAMP) {
        //     this.imgGift.setVisible(true);
        //     this.imgGift.setScale(0);
        //     this.imgGift.runAction(new cc.EaseBounceOut(cc.scaleTo(0.4, 1.0)));
        // }
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
        var resource = BO_IMAGE_CELL_NORMAL_LEVEL + blueOcean.getStageId() + ".png";
        if (this.bg) {
            this.bg.setTexture(resource);
        }
        else {
            this.bg = new cc.Sprite(resource);
            this.addChild(this.bg);
        }

    },

    initGift : function () {
        var resource = BO_IMAGE_BG_GIFT_LEVEL + blueOcean.getStageId() + ".png";
        this.bgGift = new cc.Sprite(resource);
        this.addChild(this.bgGift);

        this.gift = new cc.Sprite(blueOcean.getEggImage(this.ID));
        this.addChild(this.gift);

        this.effectGift = resourceManager.loadDragonbone("Oqua");
        this.effectGift.setScale(0.95);
        //  this.effectGift.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.stopAnimation.bind(this))));

        this.bgGift.addChild(this.effectGift, 1, 100);
        this.effectGift.setPosition(this.bgGift.getContentSize().width * 0.5, this.bgGift.getContentSize().height * 0.5);
        this.effectGift.gotoAndPlay("1", -1, -1, 1);
        // if (blueOcean.getStageId() == 0)
        //     this.effectGift.setOpacity(50);
        // else
        //     this.effectGift.setOpacity(150);

        this.gift.setVisible(!blueOcean.isCharacterHere(this.cellX,this.cellY));
    },

    initGold : function () {
        this.gold = new CoinEffectAnim();
        this.gold.setScale(BO_CELL_GOLD_SCALE);
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
            this.gold.setScale(BO_CELL_GOLD_SCALE);
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
        if(this.ID == BO_CELL_GOLD) {
            this.gold.start();
        }

        if(this.ID > BO_CELL_NONE) {
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

BlueOceanMap = cc.Node.extend({
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
        for (var i = 0; i < BO_ROW; i++) {
            this.arrayData[i] = [];
        }
        this.initMap();
    },

    initMap: function () {
        this.initMascot();
        // this.initArrayOrderGrid();

        var sprite = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/cellNormal.png");
        this.gridSize = sprite.getContentSize();
        this.mapSize = cc.size(BlueOceanMap.WIDTH_ISO * BO_COL, BlueOceanMap.HEIGHT_ISO * BO_ROW);
        this.setContentSize(this.mapSize);
        // this.setPosition(-this.mapSize.width * 0.5, -this.mapSize.height * 0.5);

        this.chest = new BlueOceanChest();
        this.addChild(this.chest);
        this.chest.setPosition(this.mapSize.width + 50, 30);
        this.chest.setLocalZOrder(100);
        this.chest.setVisible(false);

        this.pMapEffect = new cc.Node();
        this.addChild(this.pMapEffect);
        this.pMapEffect.setLocalZOrder(1000);

        this.batchBubble = new cc.SpriteBatchNode(BO_IMAGE_BUBBLE,1000);
        this.addChild(this.batchBubble);
        this.batchBubble.setLocalZOrder(100);
    },

    getPositionChest: function () {
        return this.convertToWorldSpace(cc.p(this.chest.getPositionX(), this.chest.getPositionY() + 20));
    },

    initMascot: function () {
        this.mascot = new ccui.Layout();
        this.addChild(this.mascot);
        this.mascot.setScale(1.0);
        if (!this.mascot.eff) {
            this.mascot.eff = resourceManager.loadDragonbone("cao");
            if (this.mascot.eff) {
                this.mascot.eff.setPosition(cc.p(this.mascot.getContentSize().width / 1.8,0));
                this.mascot.eff.setLocalZOrder(999);
                this.mascot.addChild(this.mascot.eff);
            }

            this.mascot.shadow = new cc.Sprite(BO_IMAGE_CHARACTER_SHADOW_LIGHT);
            this.mascot.shadow.setPosition(cc.p(this.mascot.eff.getPositionX(),-5));
            this.mascot.addChild(this.mascot.shadow);
        }
        this.mascot.eff.gotoAndPlay("idle", -1, -1, 0);
        this.mascot.setLocalZOrder(101);
        this.mascot.setVisible(false);
    },

    onEnterFinish: function () {
        this.isNewMap = true;
        this.isWaitingRollResult = false;
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
        this.chest.onEnterFinish();
        this.batchBubble.removeAllChildren(true);
    },

    clearContent: function () {
        this.arPiece = [];
        this.pMapEffect.removeAllChildren();
        this.clearMovePath();
    },

    loadMap: function () {
        for (var i in this.arPiece) {
            this.arPiece[i].removeFromParent();
        }
        this.arPiece = [];
        var mapInfo = blueOcean.mapInfo.data;
        var mapSize = BO_COL * BO_ROW;
        // blueOcean.mapInfo.row = 0;
        // blueOcean.mapInfo.col = 0;
        this.arrayOrderGrid = [];
        for (var i = 0; i < BO_ROW; i++) {
            for (var j = 0; j < BO_COL; j++) {
                this.arrayData[i][j] = 0;
            }
        }
        for (var i = 0; i < mapSize; i++) {
            if (mapInfo[i] != BO_CELL_EMPTY || true) {
                //var convert = i + 42;
                var row = Math.floor(i / BO_COL);
                var column = i % BO_COL;
                if (!this.arGrid[i]) {
                    this.arGrid[i] = new BlueOceanGrid(mapInfo[i], i);
                    //this.arGrid[i].setPosition(this.arGrid[i].getWidth() * (0.5 + column), this.arGrid[i].getHeight() * (BO_ROW - 0.5 - row));
                    this.addChild(this.arGrid[i]);
                    // screenX = (row + column) * BlueOceanMap.WIDTH_ISO / 2;
                    // screenY = (column - row) * BlueOceanMap.HEIGHT_ISO / 2;
                    screenX = (column + 0.5) * BlueOceanMap.WIDTH_ISO;
                    screenY = (BO_ROW - row - 0.5) * BlueOceanMap.HEIGHT_ISO;
                    this.arGrid[i].setPosition(screenX, screenY);
                //    this.arGrid[i].setLocalZOrder(row * 10 + (10 - column));
                    this.arrayOrderGrid.push(cc.p(row, column));

                }
                else {
                    this.arGrid[i].updateInfo(mapInfo[i]);
                }
                this.arrayData[row][column] = 1;
            }
        }
        //  this.mapSize = cc.size(BO_COL * this.widthIso, BO_ROW * this.heightIso);
        this.mascotIdle(blueOcean.mapInfo.row, blueOcean.mapInfo.col);

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
        this.chest.updateChestInfo();
        this.chest.setVisible(true);
    },

    // chay effect hien thi map khi tu lobby vao lan dau
    effectLoadMap: function () {
        this.mascot.setVisible(false);
        this.countLoadMap = 0;
        this.isRunEffectLoadMap = true;
        var timeDelay = 0.01;
        for (var i = 0; i < this.arrayOrderGrid.length; i++) {
            var grid = this.getGridFromPoint(this.arrayOrderGrid[i].x, this.arrayOrderGrid[i].y);
            grid.setVisible(false);
            grid.effectShow(timeDelay * i);
        }
        this.runAction(cc.sequence(cc.delayTime(timeDelay * (this.arrayOrderGrid.length + 1)), cc.callFunc(this.finishShowMap.bind(this))));


    },

    // Show O Dat moi duoc mo trong Map
    showLand: function () {
        var arrayMap = [];
        for (var i = 0; i < blueOcean.newLandPositionX.length; i++) {
            var sprite = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/iconMap.png");
            this.pMapEffect.addChild(sprite);
            arrayMap.push(sprite);
            arrayMap[i].setPosition(Math.random() * this.mapSize.width, Math.random() * this.mapSize.height);
            for (var j = 0; j < this.arGrid.length; j++) {
                if (this.arGrid[j].id == BO_CELL_MAP_BUBBLE) {
                    arrayMap[i].setPosition(this.arGrid[j].getPosition());
                    this.arGrid[j].imgGift.setVisible(false);
                    break;
                }
            }
        }
        for (var i = 0; i < blueOcean.newLandPositionX.length; i++) {
            var convert = blueOcean.newLandPositionX[i] * BO_COL + blueOcean.newLandPositionY[i];
            convert = blueOcean.getIndexFromPoint(blueOcean.newLandPositionX[i], blueOcean.newLandPositionY[i]);
            this.arGrid[convert].showLand();

            var end = this.arGrid[convert].getPosition();
            var start = arrayMap[i].getPosition();
            var mid = cc.p((start.x + end.x) * 0.5, (start.y + end.y) * 0.5);
            var mid = cc.p(mid.x + (300 - Math.random() * 600), mid.y + (200 - Math.random() * 400));
            var actMove = cc.BezierTo.create(0.5, [start, mid, end]);
            arrayMap[i].runAction(cc.sequence(actMove, cc.fadeOut(0.3), cc.hide()));
        }
        blueOcean.newLandPositionX = [];
        this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(this.callbackShowLand.bind(this))));
    },

    callbackShowLand: function () {
        blueOcean.blueOceanScene.onFinishEffectShowResult();
    },

    // sau khi show effect map, hien mascot
    finishShowMap: function () {
        this.mascot.setVisible(true);
        this.mascot.setScaleY(0);
        this.mascot.runAction(new cc.EaseBackOut(cc.scaleTo(0.5, 1.0)));
        this.isRunEffectLoadMap = false;
    },

    getGridFromPoint: function (row, column) {
        var index = blueOcean.getIndexFromPoint(row, column);
        return this.arGrid[index];
    },

    mascotIdle: function (i, j) {
        // init effect
        // i = 3; j = 7;
        cc.log("ROW " + i + " " + j);
        this.mascot.setScale(1.0);
        this.curPos = cc.p(i, j);
        this.mascot.stopAllActions();
        // this.mascot.eff.gotoAndPlay("Idle", -1, -1, 0);

        if (i !== undefined && j !== undefined) {
            // random trang thai idle cho mascot
            var stateMascot = 2;
            var isFlip = this.mascot.isFlippedX();
            if (j == BO_COL - 1) {
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
        var ani = "idle";
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
        var cmd = blueOcean.blueOceanScene.cmdResult;
        BlueOceanSound.playDiceFly();
        //this.numMoveAvailable = numMoveAvailable;
        var sp = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/dice" + cmd.numMoves + ".png");
        sp.setPosition(pDice);
        this.pMapEffect.addChild(sp, 999999);
        this.numMoveAvailable = cmd.numMoves;
        var pCX = Math.random() * cc.winSize.width;
        var pCY = Math.random() * cc.winSize.height;
        var posCenter = cc.p(pCX, pCY);
        var actMove = new cc.BezierTo(0.5, [sp.getPosition(), posCenter, this.mascot.getPosition()]);
        sp.runAction(cc.sequence(actMove, cc.callFunc(this.generateMovePath.bind(this, this.numMoveAvailable)),
            new cc.EaseBackOut(cc.scaleTo(0.15, 1.5)), cc.scaleTo(0.1, 0), cc.removeSelf()));
    },

    // path move
    clearMovePath: function (anim) {
        if (anim) {
            for (var i in this.movePaths) {
                this.movePaths[i].runAction(cc.sequence(new cc.EaseBackIn(cc.scaleTo(0.5, 0)), cc.removeSelf()));
            }
        } else {
            for (var i in this.movePaths) {
                try {
                    this.movePaths[i].removeFromParent();
                } catch (e) {
                    cc.log(e);
                }
            }
        }
        this.movePaths = [];
    },

    generateMovePath: function (nMove) {
        cc.log("GENERATE MOVE PATH " + nMove);
        var cmd = blueOcean.blueOceanScene.cmdResult;
        nMove = nMove || this.numMoveAvailable;
        //var nMove = blueOcean.blueOceanScene.cmdResult.numMoves;

        //blueOceanSound.playFoxJump();
        this.mascot.eff.gotoAndPlay("jump", -1, -1, 0);
        this.mascot.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.65),cc.callFunc(function () {
                this.mascot.eff.gotoAndPlay("jump", -1, -1, 0);
            }.bind(this)),
            cc.delayTime(3.0),cc.callFunc(function () {
                this.mascot.eff.gotoAndPlay("jump", -1, -1, 0);

                // bubble
                var mPos = this.mascot.getParent().convertToWorldSpace(this.mascot.getPosition());
                mPos.y += 45;
                BubbleToast.makeBubble(BubbleToast.MEDIUM,"Chọn ô di chuyển",mPos);

                // effect move paths
                for(var s in this.movePaths) {
                    var button = this.movePaths[s];
                    button.effect.stopAllActions();
                    button.effect.setOpacity(255);
                    button.effect.setScale(0.65);
                    button.effect.setVisible(false);
                    button.effect.runAction(cc.sequence(cc.delayTime(button.delayTimeEffect),cc.show(),
                        cc.spawn(cc.scaleTo(1,3),cc.fadeOut(1)),cc.hide()
                    ));
                }

               // blueOceanSound.playFoxJump();
            }.bind(this)))));

        this.clearMovePath();
        this.isWaitingChooseDirect = true;

        for (var j = 0; j < BO_MOVE_DIRECT.length; j++) {
            for (var i = 1; i <= nMove; i++) {
                var pos = {
                    x: blueOcean.mapInfo.row + i * BO_MOVE_DIRECT[j][0],
                    y: blueOcean.mapInfo.col + i * BO_MOVE_DIRECT[j][1]
                };
                // cc.log("-->Pos " + JSON.stringify(pos) + "|" + blueOcean.mapInfo.data[pos.x * 11 + pos.y]);
                if (pos.x < 0 || pos.y < 0 || pos.x >= BO_ROW || pos.y >= BO_COL) break;
                if (pos.x >= BO_ROW - 2 && pos.x && pos.y >= BO_COL - 2) {
                    this.chest.enableShowInfo();
                }
                var convert = pos.x * BO_COL + pos.y;
                if (blueOcean.mapInfo.data[convert] == BO_CELL_ROCK ||
                    blueOcean.mapInfo.data[convert] == BO_CELL_WATER ||
                    blueOcean.mapInfo.data[convert] == BO_CELL_MAP_BUBBLE) break;
                cc.log("POS NE " + JSON.stringify(pos));
                var button = new ccui.Button();
                button.setTouchEnabled(true);
                button.loadTextures(BO_IMAGE_CELL_MOVE, BO_IMAGE_CELL_MOVE, "");
                button.addTouchEventListener(this.onSelectDirection.bind(this), this);
                var pos = this.getPosFromIndex(pos.x, pos.y);
                // button.setPosition(pos.x, pos.y + 8);
                button.setTag(1000 + j * 1000 + i);
                button.setPressedActionEnabled(true);
                // this.addChild(button);
                this.arGrid[convert].addChild(button);
                button.setPositionY(5);

                // button.setLocalZOrder(BO_COL * BO_ROW);
                button.setScale(0);
                button.delayTimeEffect = 0.25 + 0.1 * i;
                button.runAction(cc.sequence(cc.delayTime(button.delayTimeEffect), new cc.EaseBackOut(cc.scaleTo(0.5, 0.65))));

                var effect = new cc.Sprite(BO_IMAGE_CELL_MOVE);
                effect.setPosition(effect.getContentSize().width/2,effect.getContentSize().height/2);
                effect.setVisible(false);
                button.addChild(effect);
                button.effect = effect;

                this.movePaths.push(button);
            }
        }

        this.isWaitingSelectDestination = false;
        return;
    },

    onSelectDirection: function (sender, type) {
        if (type == ccui.Widget.TOUCH_ENDED) {
            if(this.isWaitingSelectDestination) return;
            this.isWaitingSelectDestination = true;

            var idx = sender.getTag();
            var direct = parseInt(idx / 1000);
            var move = idx % 1000;

            var cmd = new CmdSendBlueOceanChooseDirect();
            cmd.putData(direct, move);
            GameClient.getInstance().sendPacket(cmd);

            this.moveObject = {
                direct: direct - 1,
                move: move,
                row: blueOcean.mapInfo.row,
                col: blueOcean.mapInfo.col
            };

            this.clearMovePath(true);
        }
    },

    // lay ra toa do cua mascot tren parent
    getMascotPosition: function () {
        return cc.p(this.mascot.getPosition().x + this.getPositionX(), this.mascot.getPositionY() + this.getPositionY());
    },

    // // nhan goi tin chon huong di tu server, xu li de di chuyen cao
    processMoveCmd: function (cmd) {
        if (this.moveObject) {
            var curPos = {
                x: this.moveObject.row,
                y: this.moveObject.col
            };
            var movePos = {
                x: curPos.x + this.moveObject.move * BO_MOVE_DIRECT[this.moveObject.direct][0],
                y: curPos.y + this.moveObject.move * BO_MOVE_DIRECT[this.moveObject.direct][1],
            };

            var cellPath = [];
            for (var i = 1; i <= this.moveObject.move; i++) {
                cellPath.push({
                    x: curPos.x + i * BO_MOVE_DIRECT[this.moveObject.direct][0],
                    y: curPos.y + i * BO_MOVE_DIRECT[this.moveObject.direct][1],
                })
            }
            this.characterMove(curPos, movePos, cellPath, cmd.ids);
        }
        else {
            this.giftsResult = cmd.gifts;
            this.processCharacterRun();

        }
    },

    characterMove: function (curPos, movePos, cellPaths, ids) {
        // cc.log("Move " + JSON.stringify(curPos) + " -> " + JSON.stringify(movePos) + " in " + JSON.stringify(cellPaths));
        //this.chest.updateExp();
        var cmd = blueOcean.blueOceanScene.cmdResult;
        var isFlip = false;
        var sRun = "run";
        if(curPos.y > movePos.y) {isFlip = true; sRun += ""}
        else if(curPos.y < movePos.y) {isFlip = false; sRun += ""}
        else if(curPos.x < movePos.x) sRun += "_down";
        else sRun += "_up";

        // cc.log(JSON.stringify(curPos) + " vs " + JSON.stringify(movePos) + " -> " + sRun + "|" + isFlip);

        var timeScale = 1;
        this.mascot.stopAllActions();
        this.mascot.eff.gotoAndPlay(sRun, -1, -1, 0);
        this.mascot.setFlippedX(isFlip);
        this.mascot.eff.getAnimation().setTimeScale(timeScale);
        var timeMove = this.mascotMoveEffect(this.getPosFromIndex(curPos.x, curPos.y),
            this.getPosFromIndex(movePos.x, movePos.y), false, timeScale , 1, false);
        this.mascot.setPosition(this.getPosFromIndex(curPos.x, curPos.y));
        this.mascot.runAction(cc.sequence(cc.moveTo(timeMove,this.getPosFromIndex(movePos.x, movePos.y)),
            cc.callFunc(function () {
                this.mascot.eff.gotoAndPlay("jump", -1, -1, 0);
                blueOcean.blueOceanScene.showRollResult();
            }.bind(this))));

        var arPosGift = [];
        var nIdxGift = 0;
        for (var i = 0; i < cellPaths.length; i++) {
            var cPos = cellPaths[i];
            var convert = blueOcean.getIndexFromPoint(cPos.x, cPos.y);// cPos.x * BO_COL + cPos.y;
            var giftID = parseInt(blueOcean.mapInfo.data[convert]);

            if (giftID != 0) {
                var ar = [];
                ar.push(ids[nIdxGift]);
                nIdxGift++;
                arPosGift.push(ar);
            }
            if (blueOcean.additionalChestExpByStep[i] > 0) {
                // var label = new ccui.Text();
                // label.setFontSize(20);
                // label.setFontName(SceneMgr.FONT_BOLD);
                // label.setString("+" + blueOcean.additionalChestExpByStep[i]);
                // this.pMapEffect.addChild(label);
                // label.setPosition(this.arGrid[convert].getPosition());
                // label.setVisible(false);
                // label.runAction(cc.sequence(
                //     cc.delayTime(0.5 * i),
                //     cc.show(),
                //     new cc.EaseBackOut(cc.moveBy(0.5, 0, 50)),
                //     cc.delayTime(1.0),
                //     cc.fadeOut(0.5),
                //     cc.hide())
                // );
            }
        }
        // cc.log(JSON.stringify(arPosGift));
        nIdxGift = 0;
        var timeMoveInCell = timeMove/cellPaths.length;
        for (var i = 0; i < cellPaths.length; i++) {
            var cPos = cellPaths[i];
            var giftID = parseInt(blueOcean.mapInfo.data[cPos.x * BO_COL + cPos.y]);

            if (giftID != 0) {
                var arGGG = arPosGift[nIdxGift++];
                this.runAction(cc.sequence(cc.delayTime(timeMoveInCell * (i + 1)), cc.callFunc(function (arGift, cP) {
                    for (var i in arGift) {
                        if (blueOcean.isItemStored(arGift[i])) {
                            this.dropPiece(blueOcean.getPieceImage(arGift[i]), this.getPosFromIndex(cP.x, cP.y), 0.5, 4);
                        } else {
                            var nnn = parseInt(arGift[i] / 5) + 1;
                            for (var xxx = 0; xxx < nnn; xxx++) {
                                this.dropPiece(blueOcean.getPieceImage(arGift[i]), this.getPosFromIndex(cP.x, cP.y), 1, 4);
                            }
                        }

                        var grd = this.arGrid[cP.x + "_" + cP.y];
                        var grd = this.arGrid[blueOcean.getIndexFromPoint(cP.x, cP.y)];
                        if(grd && grd instanceof BlueOceanGrid) {
                            grd.hideGift();
                        }
                        BlueOceanSound.playSoundSingle();
                    }
                }.bind(this, arGGG, cPos))));
            }
        }
    },

    // Effect Bubble
    generateBubbleEffect: function (nScale, timeDelay, timeBubble, yMove) {
        yMove = yMove || 100;

        if(nScale < 0.2) nScale = 0.2;
        if(nScale > 0.8) nScale = 0.8;

        var sp2 = cc.Sprite.create(BO_IMAGE_BUBBLE);
        sp2.setScale(nScale);
        sp2.setVisible(false);
        sp2.setLocalZOrder(BO_MAP_ITEM_ZODER + 9);
        sp2.runAction(cc.sequence(cc.delayTime(timeDelay + Math.random()), cc.show(), cc.sequence(cc.spawn(cc.moveBy(timeBubble, cc.p(0, yMove)),
            cc.sequence(cc.scaleTo(timeBubble / 5, nScale - 0.05), cc.scaleTo(timeBubble / 5, nScale + 0.05),
                cc.scaleTo(timeBubble / 5, nScale - 0.15), cc.scaleTo(timeBubble / 5, nScale - 0.15),
                cc.spawn(cc.scaleTo(timeBubble / 3, 0), cc.fadeOut(timeBubble))))), cc.removeSelf()
        ));
        return sp2;
    },

    bubbleEffectMap : function (maxTime,nBubble,noSound) {
        blueOcean.blueOceanScene.showWave();
        maxTime = maxTime || BO_MAX_TIME_BUBBLE_IN_MAP;
        nBubble = 5;
        var totalTime = 0;

        if(!noSound)
            BlueOceanSound.playBubbleSequence();

        for(var i = -1 ; i < BO_COL + 2 ; i++)  {
            for(var j = 0 ; j < nBubble ; j++) {
                var timeDelay = 3 - Math.random();
                var timeBubble = Math.random()*maxTime;
                var yMove = j * 25;
                var nScale = Math.random();
                var sp = this.generateBubbleEffect(nScale,timeDelay,timeBubble,j * 25);
                this.batchBubble.addChild(sp);
                //var pos = this.getPosFromIndex(BO_ROW + 1,i);
                var pos1 = BO_ROW + 1;
                var pos = cc.p(BlueOceanMap.WIDTH_ISO * (i + 0.5), this.mapSize.height - BlueOceanMap.HEIGHT_ISO * (pos1 + 0.8));
                var idx = Math.random()%2 == 0 ? 1 : -1;
                pos.x += idx * Math.random() * 100;
                pos.y += Math.random() * 200;
                sp.setPosition(pos);
                totalTime = timeDelay + timeBubble;
            }
        }
        return totalTime;
    },

    processCharacterRun: function () {
        BlueOceanSound.playBubbleSequence2();

        blueOcean.blueOceanScene.showWave();
        this.isWaitingRollResult = true;
        this.isWaitingChooseDirect = true;

        var f = setTimeout(function () {
            try {
                if (this.isWaitingRollResult) {
                    blueOcean.blueOceanScene.showRollResult(true);
                    this.removeFuncTimeout("character_run_result");
                }
            }
            catch (e) {
                
            }
        }.bind(this), BO_CHARACTER_EXTREME_RUN);
        this.arSceneFunc = [];
        this.arRunFunc = [];
        this.addFuncTimeout("character_run_result",f);

        for(var s in this.arGrid) {
            this.arGrid[s].hideGift(Math.random());
        }
        var MX = BO_ROW - 1;
        var MY = BO_COL - 1;
        this.giftRunIndex = 0;
        for (var i = 0; i < BO_CHARACTER_NUMBER_EXTREME_RUN; i++) {
            //this.characterRun(cc.p(this.randomRange(0, MX), this.randomRange(0, MY)));
            this.characterRun(this.curPos);
        }

       // this.bubbleEffectMap(ST_TIME_BUBBLE_RESULT_ROLL,ST_BUBBLE_RESULT_ROLL,true);
    },

    characterRun: function (curPos) {
        var maxX = BO_ROW - 1;
        var maxY = BO_COL - 1;

        this.arPos = [];

        var lastDirect = [-2, -2];
        for (var i = 0; i < 50; i++) {
            var arDirect = this.generateDirectAvailable(curPos);
            while (arDirect.length > 0) {
                var continueLast = false;
                var j;
                if (lastDirect[0] != -2) {
                    // truoc do da co 1 huong di, uu tien chon tiep huong di nay
                    for (j = 0; j < arDirect.length; j++) {
                        if (lastDirect[0] == arDirect[j][0] && lastDirect[1] == arDirect[j][1]) {
                            break;
                        }
                    }
                    if (j < arDirect.length) {
                        // huong di tiep hop le
                        continueLast = true;
                    }
                }
                var random;
                if (continueLast) {
                    if (Math.random() < 0.8) {
                        random = j;
                        lastDirect[0] = -2;
                    }
                    else {
                        random = this.randomRange(0, arDirect.length - 1);
                    }
                }
                else {
                    random = this.randomRange(0, arDirect.length - 1);
                }
                var direct = arDirect[random];
                var nMove = 1;
                var movePos = cc.p(
                    curPos.x + direct[0] * nMove,
                    curPos.y + direct[1] * nMove
                );
                if (movePos.x > maxX) movePos.x = maxX;
                if (movePos.y > maxY) movePos.y = maxY;
                if (movePos.x < 0) movePos.x = 0;
                if (movePos.y < 0) movePos.y = 0;
                var convert = blueOcean.getIndexFromPoint(movePos.x, movePos.y);// movePos.x * BO_COL + movePos.y;
                if (this.arGrid[convert].id == BO_CELL_WATER || this.arGrid[convert].id == BO_CELL_CHEST) {
                    // vi tri nay khong thoa man, random lai
                    arDirect.splice(random, 1);
                    lastDirect[0] = -2;
                }
                else {
                    lastDirect = direct;
                    this.arPos.push(movePos);
                    curPos = movePos;
                    arDirect = [];
                    break;
                }
            }
        }
        this.makeCharacterRun();

    },

    makeCharacterRun: function () {
        if (this.arPos.length <= 1)
            return;
        var rCur = this.getPosFromIndex(this.arPos[0].x, this.arPos[0].y);
        var rEnd = this.getPosFromIndex(this.arPos[1].x, this.arPos[1].y);
        var timeScale = BO_CHARACTER_SPEED_EXTREME_RUN;
        this.characterRunEffect(rCur, rEnd, 0.1);
        this.dropPieceInRun(this.arPos[0]);
        this.arPos.splice(0, 1);
        this.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(this.makeCharacterRun.bind(this))));
    },

    // function gui
    addFuncTimeout : function (key,func) {
        this.arSceneFunc[key] = func;
    },

    removeFuncTimeout : function (key) {
        try {
            if(key in this.arSceneFunc) {
                clearTimeout(this.arSceneFunc[key]);
                delete this.arSceneFunc[key];
            }
        }
        catch(e) {
            cc.log("++RemoveFuncError : " + JSON.stringify(e));
        }
    },

    randomRange: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    generateDirectAvailable: function (pos) {
        var ar = JSON.parse(JSON.stringify(BO_MOVE_DIRECT));
        if (pos.y == 0) ar.splice(3, 1);
        if (pos.x == BO_ROW - 1) ar.splice(2, 1);
        if (pos.y == BO_COL - 1) ar.splice(1, 1);
        if (pos.x == 0) ar.splice(0, 1);
        return ar;
    },

    characterRunEffect: function (curPos, movePos, timeMove) {
        // if(parseInt(Math.random()*10)%2 == 0)
        //     SecretTowerSound.playSoundSingle();
        // var timeMove = this.calculateTimeRun(curPos,movePos,timeScale);

        var isFlip = false;
        var sRun = "run";
        if(curPos.x > movePos.x){ isFlip = true; sRun += "";}
        else if(curPos.x < movePos.x) {isFlip = false; sRun += ""}
        else if(curPos.y > movePos.y) sRun += "_down";
        else sRun += "_up";

        // cc.log(JSON.stringify(curPos) + " vs " + JSON.stringify(movePos) + " -> " + sRun + "|" + isFlip);

        this.mascot.eff.gotoAndPlay(sRun, -1, -1, 0);
        this.mascot.setFlippedX(isFlip);
        // this.mascot.eff.getAnimation().setTimeScale(1/timeScale);

        this.mascot.setPosition(curPos);
        this.mascot.stopAllActions();
        this.mascot.runAction(cc.moveTo(timeMove, movePos));
    },

    calculateTimeRun: function (curPos, endPos, timeScale) {
        var disX = endPos.x - curPos.x;
        var disY = endPos.y - curPos.y;
        var distance = Math.sqrt(disX * disX + disY * disY);
        var timeMove = distance * timeScale / 200;
        return timeMove;
    },

    dropPieceInRun: function (pos) {
        var keys = Object.keys(this.giftsResult);
        if (this.giftRunIndex >= keys.length) this.giftRunIndex = 0;

        var id = keys[this.giftRunIndex++];

        // cc.log(id + "|" + this.giftRunIndex + " in " + JSON.stringify(this.giftsResult));

        if (blueOcean.isItemStored(id)) {
            this.dropPiece(blueOcean.getPieceImage(id), this.getPosFromIndex(pos.x, pos.y), 0.5, 4);
        } else {
            var nnn = parseInt(Math.random() * 10) % 10;
            for (var xxx = 0; xxx < nnn; xxx++) {
                this.dropPiece(blueOcean.getPieceImage(id), this.getPosFromIndex(pos.x, pos.y), 1, 4);
            }
        }
    },

    showDropPiece: function () {
        var cmd = blueOcean.blueOceanScene.cmdResult;
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
                blueOcean.blueOceanScene.showRollResult(false);
            }
        }

        var showEffect = false;
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var scale;
            if (blueOcean.isItemStored(id)) {
                scale = 0.5;
                showEffect = true;
            }
            else
                scale = 1.5;
            this.dropPiece(blueOcean.getPieceImage(id), this.getPosFromIndex(this.curPos.x, this.curPos.y), scale, 4);
        }
        if (showEffect) {
            this.getGridFromPoint(this.curPos.x, this.curPos.y).effectReceiveGift();
        }
        // an gift tai vi tri o nay
        this.getGridFromPoint(this.curPos.x, this.curPos.y).hideGift(0);
    },

    mascotMoveEffect: function (curPos, endPos, flipX, timeScale, timeBubble) {
        timeScale = timeScale || 1;
        timeBubble = timeBubble || 2;

        // add shadow
        var disX = endPos.x - curPos.x;
        var disY = endPos.y - curPos.y;
        var distance = Math.sqrt(disX * disX + disY * disY);
        var numShadow = Math.floor(distance / BO_CHARACTER_SHADOW_RATIO);
        var timeMove = this.calculateTimeRun(curPos, endPos, timeScale);
        var delX = disX / numShadow;
        var delY = disY / numShadow;
        var delTime = timeMove / numShadow;
        var curTime = 0;

        var timeShadow = 0.5;


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
        cc.log("DROP PIECE **************");
        var sp = new BlueOceanPiece(img, time, pos.y - 25);
        sp.applyForce(cc.p(0, -5));
        sp.setPosition(pos);
        sp.setScale(scale);
        this.pMapEffect.addChild(sp, BO_MAP_ITEM_ZODER * 2);
        this.arPiece.push(sp);
    },


    // lay vi tri tu toa do: i la hang, j la cot
    getPosFromIndex: function (i, j) {
        cc.log("POS FROM INDEX " + i + " " + j);
        var convert = blueOcean.getIndexFromPoint(i, j); //i * BO_COL + j;
        return this.arGrid[convert].getPosition();

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
    }
})

BlueOceanMap.WIDTH_ISO = 59;
BlueOceanMap.HEIGHT_ISO = 58;

// TABLE CELL
var BlueOceanFullCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/BlueOcean/BOFullItem.json");
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
        for (var i = 0; i < BO_NUM_PIECE; i++) {
            var br = ccui.Helper.seekWidgetByName(this._layout, "img_" + i);
            // br.setTouchEnabled(true);
            br.num = ccui.Helper.seekWidgetByName(br, "lb");

            br.bg = ccui.Helper.seekWidgetByName(br, "bg");
            br.bg.sizeWidth = br.bg.getContentSize().width;
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
        this.typeItem = BO_ITEM_IN_MAIN_SCENE;
        this.touchId = -1;
    },

    setType: function (typeItem) {
        this.typeItem = typeItem;
        if (this.typeItem == BO_ITEM_IN_CHANGE_SCENE) {
            this.name.setColor(cc.color(182, 78, 2, 255));
        }
    },

    onTouchItem: function (p, type) {
        if (this.typeItem == BO_ITEM_IN_MAIN_SCENE) {
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
                                    ToastFloat.makeToast(ToastFloat.SHORT, localized("BO_CHANGE_PIECE_LAST"));
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
                                Toast.makeToast(Toast.SHORT, localized("BO_CHANGE_PIECE_TOUCH"));
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
        var gui = sceneMgr.getGUIByClassName(BlueOceanPieceChangeGUI.className);
        if (gui)
            gui.updateButtonChange();
    },

    updateInOneBreak: function (idBreak) {
        if (idBreak < 0 || idBreak > 3)
            return;
        if (!this.breaks[idBreak]) {
            return;
        }
        // if (this.info.numChange[idBreak] > 0) {
            // this.breaks[idBreak].bgNumChange.setVisible(true);
            // this.breaks[idBreak].num.setVisible(false);
            // this.breaks[idBreak].bg.setVisible(false);
        // this.breaks[idBreak].lbNumChange.setString(this.info.numChange[idBreak] + "/" + this.info.item[idBreak]);
        var s = this.info.numChange[idBreak] + "/" + this.info.item[idBreak];
        // s = "33/43";
        if (s.length <= 4) {
            this.breaks[idBreak].bg.setContentSize(this.breaks[idBreak].bg.sizeWidth, this.breaks[idBreak].bg.getContentSize().height);
        }
        else {
            this.breaks[idBreak].bg.setContentSize(this.breaks[idBreak].bg.sizeWidth * 1.3, this.breaks[idBreak].bg.getContentSize().height);
        }
        this.breaks[idBreak].num.setString(s);
        // }
        // else {
        //     this.breaks[idBreak].bgNumChange.setVisible(false);
        //     this.breaks[idBreak].num.setVisible(true);
        //     this.breaks[idBreak].bg.setVisible(true);
        // }
    },

    showItemPopup: function (visible) {
        if (visible) {
            if (blueOcean.blueOceanScene) {
                blueOcean.blueOceanScene.showPopupInfo(this.info, this.touchPosition);
            }
        } else {
            if (blueOcean.blueOceanScene) {
                blueOcean.blueOceanScene.showPopupInfo();
            }

            this.timeCount = 0;
            this.isWaitPopup = false;
            this.touchPosition = null;
        }
    },

    updateInfo: function (idx) {
        this.info = blueOcean.gifts[idx];
        this.updateContent();
        // cc.log("--ItemFullCell " + idx + " : " + JSON.stringify(this.info));
    },

    updateInfoChange: function (idx) {
        this.info = blueOcean.arrayGiftChange[idx];
        this.updateContent();
        for (var i = 0; i < this.breaks.length; i++) {
            this.updateInOneBreak(i);
        }
    },

    updateContent: function () {
        this.countTouch = 0;
        this.bg.loadTexture(blueOcean.getGiftBackgroundImage(this.info.id));
        this.img.loadTexture(blueOcean.getGiftImage(this.info.id));

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

        var sName = blueOcean.getItemNameSub(this.info.id);
        this.name.setString(sName);

        for (var i = 0; i < this.breaks.length; i++) {
            var piece = this.breaks[i];
            piece.loadTexture(blueOcean.getPieceImage(this.info.id + i + 1));
            piece.setVisible(this.info.item[i] > 0 && !isGift);
            //piece.num.setString(this.info.item[i]);
            piece.num.setString(this.info.item[i] - this.info.numChange[i]);

            piece.num.setVisible(this.info.item[i] > 1);
            piece.bg.setVisible(this.info.item[i] > 1);
            piece.bgNumChange.setVisible(false);
        }

    },
});

var BlueOceanLiteCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/BlueOcean/BOLiteItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.name = ccui.Helper.seekWidgetByName(this._layout, "name");

        this.notify = ccui.Helper.seekWidgetByName(this._layout, "notify");
        this.numGift = ccui.Helper.seekWidgetByName(this._layout, "numGift");

        this.breaks = [];
        for (var i = 0; i < BO_NUM_PIECE; i++) {
            var br = ccui.Helper.seekWidgetByName(this._layout, "pie" + i);
            this.breaks.push(br);
        }

        cc.log("LITE ITEM NE ");
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
            if (blueOcean.blueOceanScene) {
                blueOcean.blueOceanScene.showPopupInfo(this.info, this.touchPosition);
            }
        } else {
            if (blueOcean.blueOceanScene) {
                blueOcean.blueOceanScene.showPopupInfo();
            }

            this.timeCount = 0;
            this.isWaitPopup = false;
            this.touchPosition = null;
        }
    },

    updateInfo: function (idx) {
        this.info = blueOcean.gifts[idx];
        // cc.log("--ItemLiteCell " + idx + " : " + JSON.stringify(this.info));

        this.notify.setVisible(this.info.gift > 0);
        this.numGift.setVisible(this.info.gift > 0);
        this.numGift.setString(this.info.gift);

        this.img.removeAllChildren();
        var sprImg = new cc.Sprite(blueOcean.getGiftImage(this.info.id));
        this.img.addChild(sprImg);
        sprImg.setScale(0.45);
        sprImg.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
        this.name.setString(blueOcean.getItemNameShort(this.info.id));

        var isGift = this.info.gift > 0;
        for (var i = 0; i < this.breaks.length; i++) {
            var piece = this.breaks[i];
            piece.setVisible(this.info.item[i] > 0 || isGift);
        }
    }
});

var BlueOceanPiecesHistoryCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        //var jsonLayout = ccs.load("BlueOceanHistoryItem.json");
        var jsonLayout = ccs.load("res/Event/BlueOcean/BOPiecesHistoryItem.json");
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
        var rollObj = blueOcean.arRollHistory[idx];

        if (rollObj && rollObj.pieces) {
            var n = Object.keys(rollObj.pieces).length;
            n = (n % BO_PIECE_MAX_ROW == 0) ? (n / BO_PIECE_MAX_ROW) : parseInt(n / BO_PIECE_MAX_ROW) + 1;
            n = (n == 0) ? 1 : n;
            this._layout.setPositionY(n * BO_PIECE_IMAGE_SIZE + 30);
        }

        var str = LocalizedString.to("BO_ROLL_HISTORY_ITEM");
        str = StringUtility.replaceAll(str, "@num", rollObj.roll);
        this.lbRoll.setString(str);

        // generate image piece
        var lastY = 0;
        this.pGift.removeAllChildren();
        var i = 0;
        for (var s in rollObj.pieces) {
            var img = new BlueOceanPieceItem();
            img.setInfo({
                id : s,
                num : rollObj.pieces[s],
                isNew: rollObj.isNews[s]
            });
            this.pGift.addChild(img);

            img.setPosition(BO_PIECE_IMAGE_SIZE * (i % BO_PIECE_MAX_ROW), -BO_PIECE_IMAGE_SIZE / 5 - parseInt(i / BO_PIECE_MAX_ROW) * BO_PIECE_IMAGE_SIZE);
            lastY = img.getPositionY();
            ++i;
        }
        lastY = lastY - 30;
        this.empty.setVisible(Object.keys(rollObj.pieces).length == 0);
        this.line.setPositionY(lastY - BO_PIECE_IMAGE_SIZE / 1.25);
    }
});

var BlueOceanGiftHistoryCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/BlueOcean/BOGiftHistoryItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.itemName = ccui.Helper.seekWidgetByName(this._layout, "sname");
        this.gift = ccui.Helper.seekWidgetByName(this._layout, "gift");
    },

    updateInfo: function (idx) {
        var giftId = blueOcean.arGiftHistory[idx];
        // cc.log("--Item : " + giftId);
        if (giftId == -1) {
            this.itemName.setString(LocalizedString.to("BO_GIFT_HISTORY_EMPTY"));
            this.gift.setVisible(false);
        } else {
            this.itemName.setString(blueOcean.getItemName(giftId));
            this.gift.setVisible(true);
            this.gift.removeAllChildren();

            var sp = new cc.Sprite(blueOcean.getGiftImageOpen(giftId));
            sp.setPosition(this.gift.getContentSize().width / 2, this.gift.getContentSize().height / 2);

            var sX = this.gift.getContentSize().width / sp.getContentSize().width * 0.85;
            var sY = this.gift.getContentSize().height / sp.getContentSize().height * 0.85;
            sp.setScale(sX > sY ? sX : sY);
            this.gift.addChild(sp);
        }
    }
});

var BlueOceanGiftCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        this.arInfo = [];
        this.arPos = [];

        var jsonLayout = ccs.load("res/Event/BlueOcean/BOGiftCell.json");
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
                if (inf.id == BO_GOLD_GIFT_EXTRA_ID) {
                    item.name.setString(StringUtility.formatNumberSymbol(inf.value));
                }
                else if (inf.id == BO_EXP_GIFT_EXTRA_ID) {
                    item.name.setString(StringUtility.formatNumberSymbol(inf.value));
                }
                else if (blueOcean.isItemStored(inf.id)) {
                    var str = blueOcean.getItemNameShort(inf.id);
                    item.name.setString(str);
                } else {
                    item.name.setString(StringUtility.formatNumberSymbol(blueOcean.getItemValue(inf.id)));
                }

                if (inf.id == BO_GOLD_GIFT_EXTRA_ID || inf.id == BO_EXP_GIFT_EXTRA_ID) {
                    item.num.setVisible(false);
                    item.bgNum.setVisible(false);
                }
                else {
                    item.num.setString(inf.value);
                    item.num.setVisible(inf.value > 1);
                    item.bgNum.setVisible(inf.value > 1);
                   // item.new.setVisible(!blueOcean.checkInLastGifts(inf.id));
                    item.new.setVisible(false);
                }


                item.img.removeAllChildren();
                var sp;
                if (inf.isStored) {
                    sp = new cc.Sprite(blueOcean.getPieceImage(inf.id));
                }
                else if (inf.id == BO_EXP_GIFT_EXTRA_ID) {
                    sp = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/cellNormal.png");
                }
                else {
                    sp = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/e10.png");
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
                obj.isStored = blueOcean.isItemStored(inf.id);
            }
            ar.push(obj);
        }
        return ar;
    },
});

// TABLE VIEW
var BlueOceanCollectionsCollapseGUI = BaseLayer.extend({

    ctor: function (parentNode) {
        this._super("BlueOceanCollectionsCollapseGUI");
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

        BlueOceanSound.playBubbleSingle();

        blueOcean.blueOceanScene.doActionItemList(BO_SHOW_LIST_ITEM_FULL);
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(90, 100);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new BlueOceanLiteCell();
        }
        cell.updateInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return blueOcean.gifts.length;
    },

    tableCellTouched: function (table, cell) {
        if (blueOcean.blueOceanScene.itemListMode == 0) {
            blueOcean.blueOceanScene.doActionItemList(1);
        } else {
            blueOcean.blueOceanScene.openItem(cell.info);
        }
    },
});

var BlueOceanCollectionsExpandGUI = BaseLayer.extend({

    ctor: function (parentNode) {
        this._super("BlueOceanCollectionsExpandGUI");
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
        BlueOceanSound.playBubbleSingle();
        blueOcean.blueOceanScene.doActionItemList(BO_SHOW_LIST_ITEM_MINI);
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(230, 250);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new BlueOceanFullCell();
        }
        cell.updateInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return blueOcean.gifts.length;
    },

    tableCellTouched: function (table, cell) {
        try {
            blueOcean.blueOceanScene.openItem(cell.info);

        } catch (e) {

        }
    },
});

/**
 * Button Ruong bau ben goc phai man hinh
 */
var BlueOceanChest = cc.Node.extend({
    ctor: function () {
        this._super();

        var btn = new ccui.Button();
        btn.setOpacity(0);
        btn.setPressedActionEnabled(true);
        btn.setScale(0.5);
        // btn.setContentSize(200, 200);
        btn.loadTextures("res/Event/BlueOcean/BlueOceanUI/chestLevel1.png", "res/Event/BlueOcean/BlueOceanUI/chestLevel1.png", "");
        btn.addClickEventListener(this.touchEvent1.bind(this));
        btn.setPositionY(10);
        // btn.setPosition(300, 300);
        this.addChild(btn);
        this.btnChest = btn;

        this.chestEffect = new CustomSkeleton("res/Event/BlueOcean/BlueOceanRes/Spine", "ruong", 1);
        this.addChild(this.chestEffect);
        this.chestEffect.setAnimation(0, "1", 0);
        this.chestEffect.setScale(0.45);
        this.chestEffect.setPositionY(20);
        this.chestEffect.pos = this.chestEffect.getPosition();
        this.chestEffect.rScaleY = this.chestEffect.getScaleY();

        this.levelEffect = new CustomSkeleton("res/Event/BlueOcean/BlueOceanRes/Spine", "FX_LevelUp", 1);
        this.addChild(this.levelEffect);
        this.levelEffect.setAnimation(0, "1", 0);
        this.levelEffect.setScale(0.45);
        this.levelEffect.setVisible(false);
        this.levelEffect.setPositionY(-10);

        this.bgProgress = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/bgProgressChest1.png");
        this.addChild(this.bgProgress);
        this.bgProgress.setPosition(0, -20);

        this.progress = new cc.Scale9Sprite("res/Event/BlueOcean/BlueOceanUI/progressChest.png");
        this.bgProgress.addChild(this.progress);
        this.progress.setAnchorPoint(cc.p(0, 0.5));
        this.progress.setPosition(25, this.bgProgress.getContentSize().height * 0.55);
        this.progress.setInsetLeft(10);
        this.progress.setInsetRight(10);

        this.lbPercent = new ccui.Text();
        this.bgProgress.addChild(this.lbPercent);
        this.lbPercent.setFontName(SceneMgr.FONT_BOLD);
        this.lbPercent.setString("100%");
        this.lbPercent.setPosition(this.bgProgress.getContentSize().width * 0.5, -this.bgProgress.getContentSize().height * 0.4);
        this.lbPercent.setColor(cc.color(247,233,187));
        this.lbPercent.enableOutline(cc.color(131,73,52), 1);
        this.lbPercent.setFontSize(13);

        this.pEffect = new cc.Node();
        this.addChild(this.pEffect);
        this.arrayLabelEffect = [];
    },

    onEnterFinish: function () {
        for (var i = 0; i < this.arrayLabelEffect.length; i++) {
            this.arrayLabelEffect[i].stopAllActions();
            this.arrayLabelEffect[i].setVisible(false);
        }

        this.stopAllActions();
        this.setScale(1);
        this.enableShowInfo(true);
    },

    enableShowInfo: function (enable) {
        this.btnChest.setEnabled(enable);
    },

    genLablelEffect: function () {
        var label = null;
        for (var i = 0; i < this.arrayLabelEffect.length; i++) {
            if (!this.arrayLabelEffect[i].isVisible()) {
                label = this.arrayLabelEffect[i];
                break;
            }
        }
        if (label == null) {
            label = new ccui.Text();
            this.addChild(label);
            label.setFontName(SceneMgr.FONT_BOLD);
            label.setFontSize(15);
            this.arrayLabelEffect.push(label);
        }
        label.setVisible(true);
        return label;
    },

    updateExp: function () {
        this.arrayExp = [];
        for (var i = 0; i < blueOcean.additionalChestExpByStep.length; i++) {
            this.arrayExp[i] = blueOcean.additionalChestExpByStep[i];
        }
        this.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(this.callbackUpdateExp.bind(this))));
    },

    callbackUpdateExp: function () {
        if (this.arrayExp.length == 0)
            return;
        if (this.arrayExp != 0) {
            var label = this.genLablelEffect();
            label.setString("+" + this.arrayExp[0]);
            label.setOpacity(0);
            label.setPositionY(30);
            label.setPositionX(30 - Math.random() * 60);
            label.runAction(cc.sequence(
                cc.fadeIn(0.2),
                new cc.EaseBackOut(cc.moveBy(0.5, 0, 40)),
                //cc.delayTime(1.0),
                cc.fadeOut(0.4),
                cc.hide())
            );
            this.chestExp = this.chestExp + this.arrayExp[0];
            if (this.chestExp > this.needChestExp) {
                this.chestExp = this.chestExp - this.needChestExp;
                this.needChestExp = blueOcean.needChestExp;
                // this.chestLevel = this.chestLevel + 1;
            }
            cc.log("CALLBACK UPDATE EXP " + this.chestExp);
            this.lbPercent.setString(this.chestExp + "/" + this.needChestExp);
            this.updateProgress();
            this.lbPercent.stopAllActions();
            this.lbPercent.setScale(1.0);
            this.lbPercent.runAction(cc.sequence(cc.scaleTo(0.1, 1.2), cc.scaleTo(0.1, 1.0)));
        }
        this.arrayExp.splice(0, 1);
        this.stopAllActions();
        this.runAction(cc.sequence(cc.scaleTo(0.05, 1.1), cc.scaleTo(0.05, 1.0), cc.callFunc(this.callbackUpdateExp.bind(this))));
    },

    touchEvent1: function () {
        // show thong tin ruong hien tai
        sceneMgr.openGUI(BlueOceanChestInfoGUI.className);
        // this.open();
    },

    callbackLevelUp: function () {
        this.levelEffect.setVisible(false);
    },

    updateChestInfo: function () {
        this.treasureLevel = blueOcean.treasureLevel;
        this.chestExp = blueOcean.currentChestExp;
        this.needChestExp = blueOcean.needChestExp;
        this.chestEffect.setAnimation(0, "" + blueOcean.treasureLevel + "_idle", -1, CustomSkeleton.SCALE_ACTION, "" + blueOcean.treasureLevel);

        var s = LocalizedString.to("BO_LEVEL") + " " + blueOcean.chestLevel + ": " +  blueOcean.currentChestExp + "/" + blueOcean.needChestExp;
        this.lbPercent.setString(s);
        if (blueOcean.passTreasureLevel != blueOcean.treasureLevel) {
            this.levelEffect.setVisible(true);
            this.levelEffect.setAnimation(0, "animation", 1);
            this.runAction(cc.sequence(cc.delayTime(1.75), cc.callFunc(this.callbackLevelUp.bind(this))));
        }
        this.updateProgress();
        this.enableShowInfo(true);
        if (blueOcean.chestLevel > 1 && blueOcean.levelReceived < blueOcean.chestLevel - 1) {
            this.chestEffect.stopAllActions();
            this.chestEffect.setPositionY(this.chestEffect.pos.y);
            this.chestEffect.setScaleY(this.chestEffect.rScaleY);
            this.chestEffect.runAction(cc.repeatForever(
               cc.sequence(
                   cc.spawn(
                       cc.EaseExponentialIn(cc.moveBy(0.4, 0, 30)),
                       cc.scaleTo(0.4, this.chestEffect.getScaleX(), this.chestEffect.rScaleY * 1.1)
                   ),
                   cc.spawn(
                       cc.EaseBounceOut(cc.moveTo(0.5, this.chestEffect.getPosition())),
                       cc.EaseBounceOut(cc.scaleTo(0.5, this.chestEffect.getScaleX(), this.chestEffect.rScaleY * 0.8))
                   ),
                   cc.EaseSineOut(cc.scaleTo(0.2, this.chestEffect.getScaleX(), this.chestEffect.rScaleY * 1.0)),
                   cc.delayTime(0.5)
               )
            ));
        }
        else {
            this.chestEffect.stopAllActions();
            this.chestEffect.setPositionY(this.chestEffect.pos.y);
            this.chestEffect.setScaleY(this.chestEffect.rScaleY);
        }
    },

    updateProgress: function () {
        var percent = this.chestExp / this.needChestExp;

        if (percent == 0) {
            this.progress.setVisible(false);
        }
        else {
            this.progress.setVisible(true);
            if (percent < 0.05) {
                percent = 0.05;
            }
            var w = percent * this.bgProgress.getContentSize().width * 0.67;
            if (w < 20) {
                this.progress.setContentSize(10, this.progress.getContentSize().height);
            }
            else {
                this.progress.setContentSize(w, this.progress.getContentSize().height);
            }
        }

    },
})

/**
 * Thong tin cua Ruong bau hien thi tren thanh Progress cua GUi Inffo RUong
 */
var BlueOceanChestInfoItem = ccui.Layout.extend({
    ctor: function (index, data) {
        this._super();
        this.index = index;
        this.bubble = new BlueOceanBubbleBonus();
        this.addChild(this.bubble);
        this.bubble.setPositionY(10);
        this.bubble.setInfo(index, data);

        this.dot = cc.Sprite.create("res/Event/BlueOcean/BlueOceanUI/dotInfo.png");
        this.addChild(this.dot);

        this.iconTick = cc.Sprite.create("res/Event/BlueOcean/BlueOceanUI/iconTickReceived.png");
        this.addChild(this.iconTick);
        this.iconTick.setPositionY(-33);
        this.setContentSize(cc.size(100, 100));

        this.lbNumLand = new ccui.Text();
        this.lbNumLand.setColor(cc.color(141, 183, 4));
        this.lbNumLand.setString("10");
        this.lbNumLand.setFontSize(12);
        this.lbNumLand.setFontName(SceneMgr.FONT_BOLD);
        this.addChild(this.lbNumLand);
        this.lbNumLand.setPositionY(this.iconTick.getPositionY() + 6);

        var s = "res/Event/BlueOcean/BlueOceanUI/btnReceiveChest.png";
        this.btnReceive = new ccui.Button(s, s, s);
        this.addChild(this.btnReceive);
        this.btnReceive.setPosition(this.iconTick.getPosition());
        this.btnReceive.addClickEventListener(this.onClickReceive.bind(this));
    },

    onClickReceive: function () {
        cc.log("ON CLICK RECEIVE ");
        blueOcean.sendOpenChest(this.index + 1);
        var gui = sceneMgr.getGUIByClassName(BlueOceanChestInfoGUI.className);
        if (gui) {
         //   gui.onClose();
        }
        //this.onClose();
    },

    updateInfo: function () {
        cc.log("INDEX " + this.index + " chess level " + blueOcean.chestLevel);
        if (this.index + 1 < blueOcean.chestLevel) {
            if (this.index < blueOcean.levelReceived) {
                this.iconTick.setVisible(true);
                this.btnReceive.setVisible(false);
            }
            else {
                this.btnReceive.setVisible(true);
            }
            this.lbNumLand.setVisible(false);
        }
        else {
            this.iconTick.setVisible(false);
            this.btnReceive.setVisible(false);
            this.lbNumLand.setVisible(true);
            this.lbNumLand.setString(StringUtility.pointNumber(blueOcean.treasureRewardExp[this.index]));
        }
    },
})

/**
 * Bubble the hien nhung Bonus duoc cong them cua Ruong
 */
var BlueOceanBubbleBonus = cc.Node.extend({
    ctor: function () {
        this._super();
        this.bubble = cc.Scale9Sprite.create("res/Event/BlueOcean/BlueOceanUI/bubbleGift.png");
        this.bubble.setAnchorPoint(0.5, 0);
        this.addChild(this.bubble);
        this.bubble.setInsetTop(10);
        this.bubble.setInsetBottom(20);

        this.arrayLb = [];
        this.arrayIcon = [];
        for (var i = 0; i < 3; i++) {
            this.arrayIcon[i] = cc.Sprite.create("res/Event/BlueOcean/BlueOceanUI/iconTickReceived.png");
            this.addChild(this.arrayIcon[i]);
            this.arrayIcon[i].setPositionX(this.bubble.getContentSize().width * 0.2);
            this.arrayIcon[i].setPositionY(8 + BlueOceanBubbleBonus.PAD_Y * (i + 1));

            this.arrayLb[i] = new ccui.Text();
            this.arrayLb[i].setFontSize(12);
            this.arrayLb[i].setFontName(SceneMgr.FONT_NORMAL);
            this.arrayLb[i].setColor(cc.color(138, 86, 69));
            this.arrayLb[i].setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
            this.arrayLb[i].setAnchorPoint(cc.p(1, 0.5));
            this.arrayLb[i].setPosition(this.bubble.getContentSize().width * 0.05, this.arrayIcon[i].getPositionY());
            this.addChild(this.arrayLb[i]);
        }
        this.lbLevel = new ccui.Text();
        this.lbLevel.setFontName(SceneMgr.FONT_BOLD);
        this.lbLevel.setFontSize(12);
        this.lbLevel.setColor(cc.color(138, 86, 69));
        this.lbLevel.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.lbLevel.setPosition(0, 30);
        this.addChild(this.lbLevel);
        this.setContentSize(this.bubble.getContentSize());
    },

    setInfo: function (index, data) {
        var s;
        for (var i = 0; i < 3; i++) {
            if (i < data.arrayType.length) {
                this.arrayIcon[i].setVisible(true);
                this.arrayLb[i].setVisible(true);

                if (data.arrayType[i] == BlueOcean.BONUS_GOLD) {
                    this.arrayIcon[i].setTexture("res/Event/BlueOcean/BlueOceanUI/iconGoldSmall.png");
                    //this.arrayIcon[i].setScale(0.4);
                    s = StringUtility.formatNumberSymbol(data.arrayValue[i]);
                }
                else if (data.arrayType[i] == BlueOcean.BONUS_DIAMOND) {
                    this.arrayIcon[i].setTexture("res/Event/BlueOcean/BlueOceanUI/iconDiamondSmall.png");
                    //this.arrayIcon[i].setScale(0.4);
                    s = StringUtility.formatNumberSymbol(data.arrayValue[i]);
                }
                else {
                    this.arrayIcon[i].setTexture("res/Event/BlueOcean/BlueOceanUI/iconPieceSmall.png");
                    //this.arrayIcon[i].setScale(0.3);
                    s = data.arrayValue[i];
                }
                this.arrayLb[i].setString(s);
            }
            else {
                this.arrayIcon[i].setVisible(false);
                this.arrayLb[i].setVisible(false);
            }
        }
        this.lbLevel.setString("Level " + (index + 1));
        this.lbLevel.setPositionY((data.arrayType.length + 1 ) * BlueOceanBubbleBonus.PAD_Y + 5);
        this.bubble.setContentSize(this.bubble.getContentSize().width, BlueOceanBubbleBonus.PAD_Y * (data.arrayType.length + 2));
    }
})
BlueOceanBubbleBonus.PAD_Y = 21;

/**
 * Bonus the hien thong tin nhan thuong cua Level Cuoi cung cua RUong
 */
var BlueOceanBonusAll = cc.Node.extend({
    ctor: function () {
        this._super();
        this.bgProgress = cc.Scale9Sprite.create("res/Event/BlueOcean/BlueOceanUI/bgProgressChest2.png");
        this.addChild(this.bgProgress);
        this.bgProgress.setInsetLeft(10);
        this.bgProgress.setInsetRight(10);
        this.bgProgress.setContentSize(BlueOceanBonusAll.WIDTH, this.bgProgress.getContentSize().height);

        this.progress = cc.Scale9Sprite.create("res/Event/BlueOcean/BlueOceanUI/progressChest2.png");
        this.progress.setAnchorPoint(0, 0.5);
        this.addChild(this.progress);
        this.progress.setInsetLeft(10);
        this.progress.setInsetRight(10);
        this.widthProgress = BlueOceanBonusAll.WIDTH * 0.97;
        this.progress.setContentSize(this.widthProgress, this.progress.getContentSize().height);
        this.progress.setPosition(-this.widthProgress * 0.5, this.bgProgress.getPositionY());

        this.bg = cc.Sprite.create("res/Event/BlueOcean/BlueOceanUI/bgBonusAll.png");
        this.addChild(this.bg);
        this.bg.setPositionY(42);

        var iconGold = cc.Sprite.create("res/Event/BlueOcean/BlueOceanUI/iconGoldSmall.png");
        var iconDiamond = cc.Sprite.create("res/Event/BlueOcean/BlueOceanUI/iconDiamondSmall.png");
        var iconPiece = cc.Sprite.create("res/Event/BlueOcean/BlueOceanUI/iconPieceSmall.png");
        this.bg.addChild(iconGold);
        this.bg.addChild(iconDiamond);
        this.bg.addChild(iconPiece);
        iconGold.setPosition(50, 28);
        iconDiamond.setPosition(95, iconGold.getPositionY());
        iconPiece.setPosition(130, iconGold.getPositionY());

        this.lbGold = this.createText(iconGold);
        this.lbDiamond = this.createText(iconDiamond);
        this.lbPiece = this.createText(iconPiece);

        var data = blueOcean.arrayBonusData[blueOcean.arrayBonusData.length - 1];
        for (var i = 0; i < data.arrayType.length; i++) {
            if (data.arrayType[i] == BlueOcean.BONUS_GOLD) {
                this.lbGold.setString(StringUtility.formatNumberSymbol(data.arrayValue[i]));
            }
            else if (data.arrayType[i] == BlueOcean.BONUS_DIAMOND) {
                this.lbDiamond.setString(StringUtility.formatNumberSymbol(data.arrayValue[i]));
            }
            else {
                this.lbPiece.setString(StringUtility.formatNumberSymbol(data.arrayValue[i]));
            }
        }

        var s = "res/Event/BlueOcean/BlueOceanUI/btnReceiveChest.png";
        this.btnReceive = new ccui.Button(s, s, s);
        this.addChild(this.btnReceive);
        this.btnReceive.setPositionY(-30);
        this.btnReceive.addClickEventListener(this.onClickReceive.bind(this));
        this.btnReceive.setLocalZOrder(1);

        this.bgNumGift = cc.Sprite.create("res/Event/BlueOcean/BlueOceanUI/bgNumGift.png");
        this.btnReceive.addChild(this.bgNumGift);
        this.bgNumGift.setPosition(60, 36);

        this.lbNumGift = new ccui.Text();
        this.lbNumGift.setFontName(SceneMgr.FONT_BOLD);
        this.lbNumGift.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.bgNumGift.addChild(this.lbNumGift);
        this.lbNumGift.setPosition(this.bgNumGift.getContentSize().width * 0.5, this.bgNumGift.getContentSize().height * 0.5);

        this.lbNumLand = new ccui.Text();
        this.lbNumLand.setFontSize(14);
        this.lbNumLand.setColor(cc.color(141, 183, 4));
        this.lbNumLand.setFontName(SceneMgr.FONT_BOLD);
        this.lbNumLand.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.addChild(this.lbNumLand);
        this.lbNumLand.setPositionY(this.btnReceive.getPositionY());
    },

    onClickReceive: function () {
        blueOcean.sendOpenChest(-1);
        var gui = sceneMgr.getGUIByClassName(BlueOceanChestInfoGUI.className);
        if (gui) {
          //  gui.onClose();
        }
    },

    createText: function (control) {
        var lbGold = new ccui.Text();
        lbGold.setAnchorPoint(1.0, 0.5);
        lbGold.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        lbGold.setColor(cc.color(138, 86, 69));
        this.bg.addChild(lbGold);
        lbGold.setPosition(control.getPositionX() - 10, control.getPositionY())
        return lbGold;
    },

    updateInfo: function () {
        this.lbNumLand.setString(blueOcean.currentChestExp + "/" + blueOcean.needChestExp);
        if (blueOcean.chestLevel < blueOcean.numLevel) {
            this.btnReceive.setVisible(false);
            this.progress.setContentSize(0, this.progress.getContentSize().height);
            this.lbNumLand.setString("0/" + blueOcean.treasureRewardExp[blueOcean.treasureRewardExp.length - 1]);
            return;
        }

        var percent = (blueOcean.currentChestExp / blueOcean.needChestExp);
        if (percent > 1)
            percent = 1;
        this.progress.setContentSize(this.widthProgress * percent, this.progress.getContentSize().height);
        var targetCompare = blueOcean.levelReceived;
        if (targetCompare < blueOcean.numLevel) {
            targetCompare = blueOcean.numLevel;
        }
        if (targetCompare < blueOcean.chestLevel) {
            this.btnReceive.setVisible(true);
            this.lbNumGift.setString(blueOcean.chestLevel - targetCompare);
        }
        else {
            this.btnReceive.setVisible(false);
        }
    },
})

BlueOceanBonusAll.WIDTH = 200;



