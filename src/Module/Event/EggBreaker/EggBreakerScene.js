/**
 * Created by Hunter on 02/14/2016.
 */

// Effect and Sprite
var EggBreakerCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/EventMgr/EggBreaker/EggFullItem.json");
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
        for (var i = 0; i < EggBreaker.NUM_PIECE; i++) {
            var br = ccui.Helper.seekWidgetByName(this._layout, "img_" + i);
            br.num = ccui.Helper.seekWidgetByName(br, "lb");
            br.bg = ccui.Helper.seekWidgetByName(br, "bg");
            this.breaks.push(br);
        }

        // add touch
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
    },

    onTouchItem: function (p, type) {
        switch (type) {
            case 0: // began
            {
                var pos = this.getParent().convertToNodeSpace(p);
                var cp = this.getPosition();
                var rect = cc.rect(cp.x, cp.y, this.circle.getContentSize().width*0.4, this.circle.getContentSize().height*0.4);

                if (cc.rectContainsPoint(rect, pos)) {
                    this.touchPosition = p;
                    this.showItemPopup(true, p);
                }
                else {
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
                this.touchPosition = cc.p(0, 0);
                this.showItemPopup(false);
                break;
            }
        }
    },

    showItemPopup: function (visible) {
        if (visible) {
            if (eggBreaker.eggBreakerScene) {
                eggBreaker.eggBreakerScene.showPopupInfo(this.info, this.touchPosition);
            }
        }
        else {
            if (eggBreaker.eggBreakerScene) {
                eggBreaker.eggBreakerScene.showPopupInfo();
            }

            this.timeCount = 0;
            this.isWaitPopup = false;
            this.touchPosition = null;
        }
    },

    updateInfo: function (idx) {
        this.info = eggBreaker.gifts[idx];

        this.bg.loadTexture(eggBreaker.getGiftBackgroundImage(this.info.id));
        this.img.loadTexture(eggBreaker.getGiftImage(this.info.id));

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

        this.name.setString(eggBreaker.getItemName(this.info.id));

        for (var i = 0; i < this.breaks.length; i++) {
            var piece = this.breaks[i];
            piece.loadTexture(eggBreaker.getPieceImage(this.info.id + i + 1));
            piece.setVisible(this.info.item[i] > 0 && !isGift);
            piece.num.setString(this.info.item[i]);

            piece.num.setVisible(this.info.item[i] > 1);
            piece.bg.setVisible(this.info.item[i] > 1);
        }
    }
});

var EggBreakerPieceConvertCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/EventMgr/EggBreaker/EggBreakerConvertPieceItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.arP = [];
        for(var i = 0 ; i < 1 ; i++) {
            var p = ccui.Helper.seekWidgetByName(this._layout, "p" + i);
            p.img = ccui.Helper.seekWidgetByName(p, "piece");
            p.num = ccui.Helper.seekWidgetByName(p, "num");
            p.gold = ccui.Helper.seekWidgetByName(p, "gold");
            //p.nof = ccui.Helper.seekWidgetByName(p, "nof");

            this.arP.push(p);
        }
    },

    setInfo: function (arInf) {
        var scaleImg = 0.9;
        for(var i = 0 ; i < this.arP.length ; i++) {
            var p = this.arP[i];
            var inf = (i < arInf.length)?arInf[i] : null;
            p.setVisible(false);

            if(inf) {
                p.setVisible(true);

                p.img.removeAllChildren();

                var sp = new cc.Sprite(eggBreaker.getPieceImage(inf.id));
                //sp.setAnchorPoint(cc.p(0,0.5));
                sp.setPosition(p.img.getContentSize().width * 0.5, p.img.getContentSize().height * 0.5);
                p.img.addChild(sp);
                sp.setScale(scaleImg);

                //  p.shadow.setPositionX(p.img.getPositionX() - p.img.getContentSize().width/2 + sp.getContentSize().width*scaleImg/2);

                p.num.setString("X" + inf.num);

                p.gold.setString(StringUtility.pointNumber(inf.gold));

                //p.num.setVisible(inf.num > 1);
                //p.nof.setVisible(inf.num > 1);
            }
        }
    }
});

var EggBreakerGiftCell = cc.TableViewCell.extend({

    ctor : function () {
        this._super();

        this.arInfo = [];
        this.arPos = [];

        var jsonLayout = ccs.load("res/EventMgr/EggBreaker/EggBreakerGiftCell.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.arItem = [];
        for(var i = 0 ; i < 2 ; i++) {
            var item = {};
            item.bg = ccui.Helper.seekWidgetByName(this._layout, "bg_" + i);
            item.img = ccui.Helper.seekWidgetByName(this._layout, "img_" + i);
            item.bgNum = ccui.Helper.seekWidgetByName(this._layout, "bgNum_" + i);
            item.num = ccui.Helper.seekWidgetByName(this._layout, "num_" + i);
            item.name = ccui.Helper.seekWidgetByName(this._layout, "name_" + i);
            this.arItem.push(item);
            this.arPos.push(item.name.getPosition());
        }
    },

    setInfo : function (ar) {
        this.arInfo = ar;
        for(var i = 0; i < this.arItem.length ; i++) {
            var inf = null;
            if(i < ar.length) {
                inf = ar[i];
            }

            //cc.log("--> Set Info " + JSON.stringify(inf));
            var item = this.arItem[i];
            for(var key in item) {
                item[key].setVisible(inf != null);
            }

            if(inf) {
                if(eggBreaker.isItemStored(inf.id))
                {
                    var str = eggBreaker.getItemName(inf.id);
                    str = StringUtility.replaceAll(str,"Samsung","");
                    str = StringUtility.replaceAll(str,"JBL","");
                    str = StringUtility.subStringTextLength(str, 14);
                    item.name.setString(str);
                }
                else
                {
                    item.name.setString(StringUtility.formatNumberSymbol(eggBreaker.getItemValue(inf.id)));
                }

                item.num.setString(inf.value);
                item.num.setVisible(inf.value > 1);
                item.bgNum.setVisible(inf.value > 1);

                item.img.removeAllChildren();

                var sp = new cc.Sprite(inf.isStored ? eggBreaker.getPieceImage(inf.id) : "res/EventMgr/EggBreaker/EggBreakerUI/e10.png");
                sp.setPosition(item.img.getContentSize().width/2,item.img.getContentSize().height/2);
                item.img.addChild(sp);

                var sX = item.img.getContentSize().width/sp.getContentSize().width;
                var sY = item.img.getContentSize().height/sp.getContentSize().height;
                sp.setScale(Math.min(sX,sY));
            }
        }
    },

    getDropInfo : function () {
        var ar = [];
        for(var i = 0; i < this.arInfo.length ; i++) {
            var obj = {};
            var cPos = this.convertToWorldSpace(cc.p(0,0));
            obj.pos = cc.p(cPos.x + this.arPos[i].x,cPos.y + this.arPos[i].y);
            var inf = this.arInfo[i];
            obj.isItem = (inf != null);
            if(inf) {
                obj.id = inf.id;
                obj.value = inf.value;
                obj.isStored = eggBreaker.isItemStored(inf.id);
            }
            ar.push(obj);
        }
        return ar;
    }
});

var EggBreakerImage = cc.Node.extend({

    ctor: function (i, j, itemId) {
        this._super();

        if (itemId === undefined || itemId == null || itemId == 0) itemId = 10;

        this.isMascot = false;

        this.arPosPies = [];
        this.arGift = [];

        this.isStarEffect = false;
        this.arStar = [];

        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);

        this.itemId = itemId;
        this.pX = i;
        this.pY = j;

        var jsonLayout = ccs.load("res/EventMgr/EggBreaker/EggImageItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");

        this.pImg = ccui.Helper.seekWidgetByName(this._layout, "pImg");
        this.gold = ccui.Helper.seekWidgetByName(this.pImg, "gold");
        this.silver = ccui.Helper.seekWidgetByName(this.pImg, "silver");
        this.img = ccui.Helper.seekWidgetByName(this.pImg, "img");
        this.pImg.setVisible(false);
        this.pImg.pos = this.pImg.getPosition();

        this.pImg.setVisible(true);

        this.img.loadTexture(eggBreaker.getEggImage(this.itemId));
        this.gold.setVisible(eggBreaker.isItemOutGame(this.itemId));
        this.silver.setVisible(!eggBreaker.isItemOutGame(this.itemId));

        this.arPosPies = [];
        for (var i = 0; i < EggBreakerPiece.MAX_PIECE; i++) {
            var ppp = ccui.Helper.seekWidgetByName(this._layout, "p" + i);
            this.arPosPies.push(ppp.getPosition());
            ppp.removeFromParent();
        }

        this.isStarEffect = eggBreaker.isItemOutGame(this.itemId);

        if (this.isStarEffect) {
            var a = db.DBCCFactory.getInstance().buildArmatureNode("EggBreakerGold");
            //a.getAnimation().gotoAndPlay("un", -1, -1, 0);
            a.setPosition(this.gold.getPosition());
            this.pImg.addChild(a);
        }
        this.randomAnimate();
    },

    mascotOn: function (mmm) {
        this.isMascot = mmm;
    },

    effectAppear: function (time) {
        if (this.isMascot) return;

        this.bg.setVisible(true);
        this.pImg.setVisible(false);

        if (!time) time = Math.random();

        this.bg.runAction(cc.sequence(cc.delayTime(time), cc.show(), cc.callFunc(function () {
            this.pImg.setVisible(true);
            this.pImg.setScale(0);
            this.pImg.runAction(new cc.EaseBackOut(cc.scaleTo(0.15, 1)));
        }.bind(this))));
    },

    // break egg
    doBreak: function (timeScale, ids) {
        var timeDrop = timeScale * 0.45;
        this.arGift = ids;
        this.isMascot = false;

        this.runAction(cc.sequence(cc.delayTime(timeDrop), cc.callFunc(this.effectBreak.bind(this, timeScale))));
    },

    effectBreak: function (scale) {
        EggBreakerSound.doBreak();

        this.pImg.setVisible(false);

        var gParent = sceneMgr.getMainLayer();
        if (gParent instanceof EggBreakerScene) {
            for (var i = 0; i < EggBreakerPiece.MAX_PIECE; i++) {
                gParent.dropPiece(this.generatePieceImage(i), this.getPiecePos(i), 1, 1 , 1);
            }

            for (var i = 0; i < this.arGift.length; i++) {
                var id = this.arGift[i];
                var rndPos = this.getPiecePos(this.randomRange(0, this.arPosPies.length - 1));
                gParent.dropPiece(eggBreaker.getPieceImage(id), rndPos, eggBreaker.isItemStored(id) ? 0.5 : 1, 4);
            }
        }

        var timeDrop = 0.75;
        var timeAppear = 0.25;
        this.runAction(cc.sequence(cc.delayTime(timeDrop * scale), cc.callFunc(this.effectAppear.bind(this, timeAppear))));
    },

    // anim egg
    randomAnimate: function () {
        var timeDelay = 0 + (parseInt(Math.random() * 100) % 10);
        this.runAction(cc.sequence(cc.delayTime(timeDelay), cc.callFunc(this.animate.bind(this))));
    },

    animate: function () {
        var rnd = parseInt(Math.random() * 10) % 5 == 0;
        if (rnd) {
            this.runAction(cc.sequence(cc.delayTime(5), cc.callFunc(this.randomAnimate.bind(this))));
            return;
        }

        var start = this.randomRange(2, 5);
        var end = -1 * start;
        this.pImg.setRotation(start);

        // act left-right
        var timeRotate = Math.random() * 0.05 + 0.1;
        var act = cc.sequence(new cc.EaseSineIn(cc.rotateTo(timeRotate, end)), new cc.EaseSineIn(cc.rotateTo(timeRotate, start)));

        var timeDelay = (parseInt(Math.random() * 100) % 5);
        var numRepeat = this.randomRange(2, 6);
        this.pImg.runAction(cc.sequence(cc.repeat(act, numRepeat), new cc.EaseBackOut(cc.rotateTo(0.1, 0)), cc.delayTime(timeDelay), cc.callFunc(this.randomAnimate.bind(this))));

        this.starEffect();
    },

    starEffect: function () {
        //if (this.isStarEffect && this.pImg.isVisible()) {
        //    var pos = this.pImg.getPosition();
        //    var size = this.pImg.getContentSize();
        //    var range = [size.width * 0.2, size.width * 0.8];
        //    var rndNumStar = Math.floor(Math.random() * 10) % 5 + 1;
        //    for (var i = 0; i < rndNumStar; i++) {
        //        var xRange = Math.random() * (range[1] - range[0]) + range[0];
        //
        //        for (var j = -1; j < 2; j++) {
        //            if (j == 0) continue;
        //            var sp = new EggBreakerStarEffect();
        //            sp.setDeadY(this.pImg.getContentSize().height);
        //            sp.setPositionX(pos.x + j * xRange);
        //            sp.setPositionY(this.pImg.getPositionY());
        //            this.addChild(sp);
        //
        //            this.arStar.push(sp);
        //        }
        //    }
        //}
    },

    // base func
    update: function (dt) {
        return;
        if (this.isStarEffect) {
            for (var i = this.arStar.length - 1; i >= 0; i--) {
                var star = this.arStar[i];
                star.updateStar(dt);

                if (star.isDead()) {
                    star.removeFromParent();
                    this.arStar.splice(i, 1);
                }
            }
        }
    },

    // utility
    getPiecePos: function (i) {
        var p = this.arPosPies[i];
        if (!p) p = cc.p(0, 0);
        return cc.p(this.getPositionX() + p.x, this.getPositionY() + p.y);
    },

    checkEgg: function (i, j) {
        return (this.pX == i && this.pY == j);
    },

    generatePieceImage: function (pie) {
        return ("res/EventMgr/EggBreaker/EggBreakerUI/br" + (eggBreaker.isItemOutGame(this.itemId) ? "0" : "1") + "" + pie + ".png");
    },

    randomRange: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
});

var EggBreakerPiece = cc.Node.extend({
    ctor: function (item, time, pY,count) {
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
            this.image = new EggBreakerCoinEffect();
            this.image.start();
            this.image.setScale(0.3);
            this.image.setRotation(-Math.random()*360);
        }
        else {
            this.image = new cc.Sprite(this.pieceImage);
        }
        this.addChild(this.image);

        this.acceleration = cc.p(0, 0.25);
        this.velocity = cc.p(this.randomRange(-3, 3), this.randomRange(-2, 0));
    },

    isDead: function () {
        return this.timeLeft < 0;
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
            this.applyForce(cc.p(0, -1*this.count));
            this.count--;
        }
    },

    randomRange: function (a, b) {
        var rnd = Math.random();
        return rnd * (b - a) + a;
    }
});

var EggBreakerGift = cc.Node.extend({
    ctor: function () {
        this._super();

        this.image = null;

        this.velocity = {};
        this.acceleration = {};

        this.lifespan = 255;

        this.mass = 1;

        this.posYDrop = 0;

        this.initUI();
    },

    initUI: function () {
        var ar = ["icon_gold.png", "i1000010.png", "icon_gold.png", "i1000020.png",
            "i1000030.png", "icon_gold.png", "i1000040.png", "i1000050.png",
            "icon_gold.png", "i1000060.png"];
        var strImg = "res/EventMgr/EggBreakerUI/" + ar[parseInt(Math.random() * 10) % ar.length];
        this.image = new cc.Sprite(strImg);
        this.addChild(this.image);

        this.acceleration = cc.p(0, 0.25);
        this.velocity = cc.p(this.randomRange(-3, 3), this.randomRange(-2, 0));
    },

    isDead: function () {
        return this.lifespan < 0;
    },

    applyForce: function (force) {
        var p = JSON.parse(JSON.stringify(force));

        this.acceleration.x += (p.x / this.mass);
        this.acceleration.y += (p.y / this.mass);
    },

    update: function (dt) {
        this.applyForce(cc.p(0, 0.25));

        this.velocity.x -= this.acceleration.x;
        this.velocity.y -= this.acceleration.y;

        var p = this.getPosition();
        p.x += this.velocity.x;
        p.y += this.velocity.y;

        this.lifespan -= 3;
        this.image.setOpacity(this.lifespan);

        this.setPosition(p);

        this.acceleration.x *= 0;
        this.acceleration.y *= 0;
    },

    randomRange: function (a, b) {
        var rnd = Math.random();
        return rnd * (b - a) + a;
    }
});

var EggBreakerGiftEffect = cc.Node.extend({

    ctor: function () {
        this._super();
        this.arGold = [];
    },

    onEnter: function () {
        cc.Node.prototype.onEnter.call(this);

        this.scheduleUpdate();
    },

    addGold: function () {
        for (var i = 0; i < 5; i++) {
            var sp = new EggBreakerGift();
            sp.applyForce(cc.p(0, -7.5));
            this.addChild(sp);
            this.arGold.push(sp);
        }
    },

    update: function (dt) {
        for (var i = this.arGold.length - 1; i >= 0; i--) {
            var p = this.arGold[i];
            if (p) {
                p.update(dt);
                if (p.isDead()) {
                    p.removeFromParent();
                    this.arGold.splice(i, 1);
                }
            }
        }
    }
});

var EggBreakerResultGift = cc.Node.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/EventMgr/EggBreaker/EggBreakerGiftResultNode.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.bgNum = ccui.Helper.seekWidgetByName(this._layout, "bgNum");
        this.num = ccui.Helper.seekWidgetByName(this._layout, "num");
        this.name = ccui.Helper.seekWidgetByName(this._layout, "name");
        this.name.setFontSize(12);
    },

    setGift : function (inf) {
        //cc.log("-->Info " + JSON.stringify(inf));
        if(eggBreaker.isItemStored(inf.id))
        {
            var str = eggBreaker.getItemName(inf.id);
            str = StringUtility.replaceAll(str,"Samsung","");
            str = StringUtility.replaceAll(str,"JBL","");
            //str = StringUtility.subStringTextLength(str, 14);
            this.name.setString(str);
        }
        else
        {
            this.name.setString(StringUtility.formatNumberSymbol(eggBreaker.getItemValue(inf.id)));
        }

        this.num.setString(inf.value);
        this.num.setVisible(inf.value > 1);
        this.bgNum.setVisible(inf.value > 1);

        this.img.removeAllChildren();

        var sp = new cc.Sprite(inf.isStored ? eggBreaker.getPieceImage(inf.id) : "res/EventMgr/EggBreaker/EggBreakerUI/e10.png");
        sp.setPosition(this.img.getContentSize().width/2,this.img.getContentSize().height/2);
        this.img.addChild(sp);

        var sX = this.img.getContentSize().width/sp.getContentSize().width;
        var sY = this.img.getContentSize().height/sp.getContentSize().height;
        sp.setScale(Math.min(sX,sY));
    }

    /*
    setGift: function (inf) {
        this.info = inf;
        this.removeAllChildren();

        var scale = 0.75;
        var pad = 0.75;
        var scaleItem = eggBreaker.isItemStored(inf.id) ? 0.85 : 0.5;

        var bg = new cc.Sprite("res/EventMgr/EggBreakerUI/bg_item_result.png");
        bg.setScale(scale);

        var sp = new cc.Sprite(inf.isStored ? eggBreaker.getPieceImage(inf.id) : "res/EventMgr/EggBreaker/EggBreakerUI/e10.png");

        //var scaleX = bg.getContentSize().width*scale*pad/sp.getContentSize().width;
        //var scaleY = bg.getContentSize().height*scale*pad/sp.getContentSize().height;
        //scaleX = Math.min(scaleX,scaleY);
        sp.setScale(scaleItem);

        var lb = BaseLayer.createLabelText();
        lb.setFontSize(12);
        if (inf.isStored) lb.setString(((inf.value > 1) ? (inf.value + " ") : "") + eggBreaker.getItemName(inf.id));
        else lb.setString(StringUtility.formatNumberSymbol(inf.value));

        this.addChild(bg);
        this.addChild(sp);
        this.addChild(lb);

        lb.setPositionY(-bg.getContentSize().height * scale / 2 - lb.getContentSize().height / 2);
    }
     */
});

var EggBreakerEditorButton = ccui.Button.extend({

    ctor: function (i, j) {
        this._super();

        this.pX = i;
        this.pY = j;
        this.id = 0;
    },

    setEgg: function (id) {
        this.removeAllChildren();

        if (!eggBreaker.isItemOutGame(id))
            id = 10;

        this.id = id;
        var sp = new cc.Sprite(eggBreaker.getEggImage(id));
        this.addChild(sp);
        sp.setPosition(sp.getContentSize().width / 2, sp.getContentSize().height / 2);
    }
});

var EggBreakerCoinEffectLayer = cc.Layer.extend({

    ctor: function () {
        this._super();
        this.listCoin = [];
        this.numEffect = 0;
        this.numCoinNow = 0;
        this.callBack = null;
        this.timeCount = 0;
        this.positionCoin = [0, 0];
        this.isRun = false;
        this.typeEffect = 0;
    },

    setCallbackFinish: function (cb) {
        this.callBack = cb;
    },

    setPositionCoin: function (p) {
        this.positionCoin = p;
    },

    update: function (dt) {
        var coin;
        var isFinish = false;
        for (var i = this.numCoinNow; i < this.numEffect; i++) {
            coin = this.listCoin[i];
            if (coin.visible) {
                coin.updateCoin(dt);
                isFinish = true;
            }
        }
        if (this.numCoinNow > 0) {
            this.timeCount += dt;
            if (this.timeCount >= EggBreakerCoinEffect.TIME_OUT_COIN) {
                var num = 10;
                if (this.typeEffect == EggBreakerCoinEffect.TYPE_FLOW) {
                    num = EggBreakerCoinEffect.NUM_COIN_EACH_TIME * this.timeCount;
                    this.timeCount = 0;
                }
                else if (this.typeEffect == EggBreakerCoinEffect.TYPE_RAIN) {
                    num = EggBreakerCoinEffect.NUM_COIN_RATE_RAIN * 0.05;
                    this.timeCount = EggBreakerCoinEffect.TIME_OUT_COIN - 0.05;
                }
                for (i = 0; i < num; i++) {
                    coin = this.listCoin[this.numCoinNow--];
                    coin.start();
                    if (this.numCoinNow == 0)break;
                }
            }
        }
        else {
            if (!isFinish) {
                this.unscheduleUpdate();
                if (this.callBack) {
                    this.callBack.call();
                }
                this.isRun = false;
            }
        }
    },

    startEffect: function (numEffect, type) {
        if (this.isRun)this.stopEffect();
        var coin;
        this.typeEffect = type;
        this.numEffect = numEffect;
        if (numEffect > this.listCoin.length) {
            for (var i = 0, len = numEffect - this.listCoin.length; i < len; i++) {
                coin = this.getCoinItem();
                this.listCoin.push(coin);
                this.addChild(coin);
            }
        }
        for (var i = 0; i < numEffect; i++) {
            coin = this.listCoin[i];
            coin.stop();
            coin.initCoin(type);
        }
        this.numCoinNow = numEffect - 1;
        this.timeCount = 0;
        this.scheduleUpdate();
        this.setVisible(true);
        this.isRun = true;
        this.runAction(cc.sequence(cc.delayTime(EggBreakerCoinEffect.DELAY_PLAY_SOUND), cc.callFunc(function () {
            EggBreakerSound.playCoin();
        })));
    },

    stopEffect: function () {
        for (var i = 0; i < this.listCoin.length; i++) {
            this.listCoin[i].setVisible(false);
        }
    },

    getCoinItem: function () {
        return new EggBreakerCoinEffect();
    }
});

var EggBreakerCoinEffect = cc.Sprite.extend({

    ctor: function () {
        this._super();
        var animation = cc.animationCache.getAnimation(EggBreakerCoinEffect.NAME_ANIMATION_COIN);
        if (!animation) {
            var arr = [];
            var cache = cc.spriteFrameCache;
            var aniFrame;
            for (var i = 0; i < EggBreakerCoinEffect.NUM_SPRITE_ANIMATION_COIN; i++) {
                aniFrame = new cc.AnimationFrame(cache.getSpriteFrame(EggBreakerCoinEffect.NAME_ANIMATION_COIN + i + ".png"), EggBreakerCoinEffect.TIME_ANIMATION_COIN);
                arr.push(aniFrame);
            }
            for (i = EggBreakerCoinEffect.NUM_SPRITE_ANIMATION_COIN - 2; i >= 1; i--) {
                aniFrame = new cc.AnimationFrame(cache.getSpriteFrame(EggBreakerCoinEffect.NAME_ANIMATION_COIN + i + ".png"), EggBreakerCoinEffect.TIME_ANIMATION_COIN);
                arr.push(aniFrame);
            }
            animation = new cc.Animation(arr, EggBreakerCoinEffect.TIME_ANIMATION_COIN);
            cc.animationCache.addAnimation(animation, EggBreakerCoinEffect.NAME_ANIMATION_COIN);
        }
        this.anim = animation;
        this.setVisible(false);
    },

    initCoin: function (type) {
        this.isCollided = false; //kiem tra da cham dat 1 lan chua
        this.opacity = 0;
        var valueRan;
        if (type == EggBreakerCoinEffect.TYPE_FLOW) {
            this.speedX = 2 * Math.random() * EggBreakerCoinEffect.RATE_SPEED_X - EggBreakerCoinEffect.RATE_SPEED_X;
            //this.speedY = Math.random() * EggBreakerCoinEffect.RATE_SPEED_Y + EggBreakerCoinEffect.DEFAULT_SPEED_Y;
            var def = Math.random() * 800 + 800;
            this.speedY = Math.sqrt(def * def - this.speedX * this.speedX);
            this.speedR = 2 * Math.random() * EggBreakerCoinEffect.RATE_SPEED_R - EggBreakerCoinEffect.RATE_SPEED_R;
            valueRan = Math.random() * (EggBreakerCoinEffect.MAX_SCALE - EggBreakerCoinEffect.MIN_SCALE) + EggBreakerCoinEffect.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var p = cc.p(this.getParent().positionCoin.x + (Math.random() - 0.5) * EggBreakerCoinEffect.RATE_Position_X,
                this.getParent().positionCoin.y + (Math.random() - 0.5) * EggBreakerCoinEffect.RATE_Position_Y);
            this.setPosition(p);
        }
        else if (type == EggBreakerCoinEffect.TYPE_RAIN) {
            this.speedX = 0;
            this.speedY = Math.random() * EggBreakerCoinEffect.RATE_SPEED_X;
            this.speedR = 2 * Math.random() * EggBreakerCoinEffect.RATE_SPEED_R - EggBreakerCoinEffect.RATE_SPEED_R;
            valueRan = Math.random() * (EggBreakerCoinEffect.MAX_SCALE - EggBreakerCoinEffect.MIN_SCALE) + EggBreakerCoinEffect.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var parent = this.getParent();
            this.setPosition(Math.random() * parent.width, parent.height + this.height + Math.random() * EggBreakerCoinEffect.RATE_Position_Y);
        }
        this.setVisible(false);
    },

    start: function () {
        this.setVisible(true);
        var ani = cc.animate(this.anim);
        //ani.setSpeed(Math.random() * 0.5 + 0.5);
        this.runAction(ani.repeatForever());
    },

    stop: function () {
        this.setVisible(false);
        this.stopAllActions();
    },

    updateCoin: function (dt) {
        var opa = this.opacity;
        opa += 1500 * dt;
        if (opa > 255)this.opacity = 255;
        else this.opacity = opa;
        this.x += this.speedX * dt;
        this.y += this.speedY * dt;
        this.speedY -= EggBreakerCoinEffect.GRAVITY * dt;
        this.rotation += this.speedR;
        //cham dat thi cho nhay len 1 lan roi roi tiep
        if (this.y < this.getContentSize().height / 2 && !this.isCollided) {
            this.isCollided = true;
            this.speedY = -this.speedY * (Math.random() * EggBreakerCoinEffect.RATE_JUMP_BACK);
            this.speedX = 0;
        }
        else if (this.y + (this.height * this.scale) < 0 && this.isCollided) {
            this.stop();
        }
    }
});

var EggBreakerStarEffect = cc.Sprite.extend({

    ctor: function () {
        this._super();

        this.setTexture("res/EventMgr/EggBreakerUI/star_light.png");
        this.setScale(0.5);

        this.speedY = 0.5;
        this.lifespan = 100;

        this.curScale = 0.5;
        this.dScale = 0.05;

        this.timeStart = Math.random();
    },

    setDeadY: function (pY) {
        this.pDeadY = pY * 1.5;
    },

    isDead: function () {
        return (this.y > this.pDeadY);
    },

    updateStar: function (dt) {
        if (this.timeStart > 0) {
            this.timeStart -= dt;
            this.setVisible(false);
            return;
        }

        this.setVisible(true);
        this.y += this.speedY;
        this.lifespan -= 1;

        this.curScale -= this.dScale;
        if (this.curScale <= 0 || this.curScale >= 0.5) this.dScale *= -1;

        this.setScale(this.curScale);

        if (this.y > this.pDeadY * 0.75) {
            this.opacity -= 5;
        }
    }
});

// Scene and GUI
var EggBreakerScene = BaseLayer.extend({

    ctor: function () {
        this.eggs = [];

        this.piecesResult = [];
        this.giftsResult = {};

        this.arPiece = [];

        this._super(EggBreakerScene.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerScene.json");
    },

    initGUI: function () {
        db.DBCCFactory.getInstance().loadDragonBonesData("Armatures/zingplaymascot/skeleton.xml", "zingplaymascot");
        db.DBCCFactory.getInstance().loadTextureAtlas("Armatures/zingplaymascot/texture.plist", "zingplaymascot");

        var winSize = cc.director.getWinSize();

        var banner = this.getControl("banner");

        var pRight = this.getControl("pRightTop");
        var pTop = this.getControl("pBanner");
        var board = this.getControl("pButton");
        var pItem = this.getControl("pItem");
        var pLeftTop = this.getControl("pLeftTop");
        this.titleEvent = this.getControl("titleEvent");

        this.pFullItem = pItem;
        this.pFullItem.posShow = cc.p(this.pFullItem.getPositionX(), this.pFullItem.getPositionY());
        this.pFullItem.posHide = cc.p(pItem.getPositionX() + pItem.getContentSize().width, pItem.getPositionY());
        this.pFullItem.btn = this.customButton("btn", EggBreakerScene.BTN_COLLAPSE, this.pFullItem);
        this.btnCloseFullItem = this.customButton("btnCloseFullItem", EggBreakerScene.BTN_COLLAPSE);
        this.pLiteItem = this.getControl("pItemCollapse");
        this.pLiteItem.posShow = cc.p(this.pLiteItem.getPositionX(), this.pLiteItem.getPositionY());
        this.pLiteItem.posHide = cc.p(this.pLiteItem.getPositionX() + this.pLiteItem.getContentSize().width, this.pLiteItem.getPositionY());

        this.uiGiftLite = new EggBreakerCollectionsCollapseGUI(this.pLiteItem);

        // save to effect
        this.eTop = pTop;
        this.eTop.pos = pTop.getPosition();
        this.eRight = pRight;
        this.eRight.pos = pRight.getPosition();
        this.eItem = pItem;
        this.eItem.pos = pItem.getPosition();
        this.eButton = board;
        this.eButton.pos = board.getPosition();

        // load board
        this.panelCenter = this.getControl("panelCenter");
        this.pBoard = this.getControl("panel");
        var tmpMascot = this.getControl("mascot");
        tmpMascot.removeFromParent();

        this.mascot = tmpMascot.clone();
        this.mascot.retain();
        this.mascot.setLocalZOrder(999);
        this.mascot.setScale(this._scale);

        //this.boardSize = cc.size(winSize.width - pItem.getContentSize().width * this._scale, winSize.height - pTop.getContentSize().height * this._scale - board.getContentSize().height * this._scale);
        this.boardSize = cc.size(winSize.width * 0.64, winSize.height * 0.46);
        this.eggSize = cc.size(this.boardSize.width / EggBreakerScene.MAX_COL, this.boardSize.height / EggBreakerScene.MAX_ROW);
        this.eggPos = cc.p(this.pBoard.getContentSize().width / 2 - this.boardSize.width / 2.1, this.pBoard.getContentSize().height / 2 + this.boardSize.height / 1.95 - this.eggSize.height);
        this.eggPos = cc.p(this.pBoard.getContentSize().width / 2 - this.boardSize.width / 2.1, this.pBoard.getContentSize().height / 2 + this.boardSize.height / 1.95 - this.eggSize.height);
        this.eggDeltaSize = cc.size(this.mascot.getContentSize().width * this._scale, this.mascot.getContentSize().height * this._scale);
        this.pBoard.setPositionX(winSize.width * 0.35);
        this.panelCenter.setPositionX(this.pBoard.getPositionX() + this.boardSize.width * 0.15);
        this.panelCenter.setPositionY(this.pBoard.getPositionY() + this.boardSize.height * 0.65);
        board.setPositionX(this.pBoard.getPositionX());

        this.btnNormal = this.customButton("oneBreak", EggBreakerScene.BTN_NORMAL, board, false);
        this.btnNormal.cost = this.getControl("lb", this.btnNormal);

        this.btnNormalXtreme = this.customButton("xtremeBreak", EggBreakerScene.BTN_XTREME, board, false);
        this.btnNormalXtreme.cost = this.getControl("lb", this.btnNormalXtreme);


        this.btnBean = this.customButton("beanBreak", EggBreakerScene.BTN_BEAN, board, false);
        this.btnBean.cost = this.getControl("lb", this.btnBean);

        this.btnBeanXtreme = this.customButton("xtremeBeanBreak", EggBreakerScene.BTN_BEAN_XTREME, board, false);
        this.btnBeanXtreme.cost = this.getControl("lb", this.btnBeanXtreme);
        var iconDiscount = this.getControl("iconSale", this.btnBeanXtreme);
        //this.btnBeanXtreme.label = this.getControl("labelDiscount", iconDiscount);
        //this.btnBeanXtreme.label.setString("-" + eggBreaker.getBonusDiscount() + "%");
        this.btnBean.setVisible(false);
        this.btnBeanXtreme.setVisible(false);

        this.costImage = this.getControl("cost", board);
        this.costImage.lb = this.getControl("lb", this.costImage);
        this.costImage.setVisible(false);

        // user info
        var bGold = this.customButton("gold", EggBreakerScene.BTN_SHOP, pRight, false);
        this.lbGold = this.getControl("lb", bGold);
        var bG = this.customButton("xu", EggBreakerScene.BTN_ADD_G, pRight, false);
        this.lbBean = this.getControl("lb", bG);

        this.barHammer = this.getControl("bar_hammer", this.panelCenter);
        this.barHammer.point = this.getControl("point", this.barHammer);
        this.barHammer.progress = this.getControl("progress", this.barHammer);
        var parentHammer = this.barHammer;
        this.lbHammer = this.getControl("lb", parentHammer);

        // popup item
        this.popupItem = this.getControl("pInfoItem");
        this.popupItem.lbInfo = this.getControl("lb", this.popupItem);
        this.popupItem.lbName = this.getControl("name", this.popupItem);
        this.showPopupInfo();

        // collection list
        this.itemInList = this.getControl("bg", pItem);
        var bListGift = this.getControl("list", pItem);
        var bSizeGift = bListGift.getContentSize();
        this.uiGift = new cc.TableView(this, cc.size(bSizeGift.width * 1.05, bSizeGift.height));
        this.uiGift.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.uiGift.setVerticalFillOrder(1);
        this.uiGift.setDelegate(this);
        bListGift.addChild(this.uiGift);
        this.uiGift.reloadData();

        var lbTimeReset = this.getControl("time", pItem);
        var txts = [];
        txts.push({"text": LocalizedString.to("EGG_INFO_TIME_LEFT_0"), "color": cc.color(86, 179, 126, 0), "size": 15});
        txts.push({"text": "", "font": SceneMgr.FONT_BOLD, "color": cc.color(255, 165, 0, 0), "size": 15});
        txts.push({"text": LocalizedString.to("EGG_INFO_TIME_LEFT_1"), "color": cc.color(86, 179, 126, 0), "size": 15});
        this.lbTimeRemain = new RichLabelText();
        this.lbTimeRemain.setText(txts);
        this.lbTimeRemain.pos = lbTimeReset.getPosition();
        this.lbTimeRemain.setPositionY(this.lbTimeRemain.pos.y - this.lbTimeRemain.getHeight() / 2);
        lbTimeReset.setVisible(false);
        lbTimeReset.getParent().addChild(this.lbTimeRemain);

        // more button
        this.customButton("btnMore",EggBreakerScene.BTN_MORE,pLeftTop);
        this.btnRegisteredInfo = this.customButton("btnRegisterInfo", EggBreakerScene.BTN_REGIS_INFO, pLeftTop);
        this.pMore = this.getControl("pMore");
        this.pMore.posHide = this.pMore.getPositionX();
        this.pMore.posShow = this.pMore.posHide + this.pMore.getContentSize().width * 1.05;
        this.pMore.visibleState = false;

        this.customButton("close",EggBreakerScene.BTN_CLOSE,this.pMore);
        this.customButton("help",EggBreakerScene.BTN_HELP,this.pMore);
        this.customButton("news",EggBreakerScene.BTN_NEWS,this.pMore);
        this.customButton("sound",EggBreakerScene.BTN_SOUND,this.pMore);
        this.iconSound = this.getControl("iconSound",this.pMore);
        if (EggBreakerSound.musicOn) {
            this.iconSound.loadTexture("res/EventMgr/EggBreaker/EggBreakerUI/btnSoundOn.png");
        }
        else {
            this.iconSound.loadTexture("res/EventMgr/EggBreaker/EggBreakerUI/btnSoundOff.png");
        }

        var bgMoreListenter = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return true;
            },
            onTouchMoved: function (touch, event) {
            },
            onTouchEnded: function (touch, event) {
                event.getCurrentTarget().onTouchBoard(touch);
            }
        });
        cc.eventManager.addListener(bgMoreListenter, this);

        // load cheat panel
        this.pCheat = this.getControl("pCheat");
        this.pCheat.pos = this.pCheat.getPosition();

        this.pDirect = this.getControl("pDirect");
        this.customButton("up",EggBreakerScene.BTN_CHEAT_DIRECT_UP,this.pDirect);
        this.customButton("right",EggBreakerScene.BTN_CHEAT_DIRECT_RIGHT,this.pDirect);
        this.customButton("down",EggBreakerScene.BTN_CHEAT_DIRECT_DOWN,this.pDirect);
        this.customButton("left",EggBreakerScene.BTN_CHEAT_DIRECT_LEFT,this.pDirect);
        this.pDirect.setVisible(false);

        this.txItem = this.getControl("name", this.pCheat);
        this.txNum = this.getControl("num", this.pCheat);
        this.txNumRoll = this.getControl("numRoll", this.pCheat);
        this.customButton("cheat_item", EggBreakerScene.BTN_CHEAT_ITEM, this.pCheat);
        this.txCoin = this.getControl("coin", this.pCheat);
        this.txExp = this.getControl("exp", this.pCheat);
        this.customButton("cheat_coin", EggBreakerScene.BTN_CHEAT_COIN, this.pCheat);
        this.customButton("cheat_coin_free", EggBreakerScene.BTN_CHEAT_COIN_FREE, this.pCheat);
        this.txGServer = this.getControl("txGServer", this.pCheat);
        this.txGUser = this.getControl("txGUser", this.pCheat);
        this.lbGServer = this.getControl("g_server", this.pCheat);
        this.lbGUser = this.getControl("g_user", this.pCheat);
        this.lbLevel = this.getControl("level", this.pCheat);
        this.customButton("cheat_g_server", EggBreakerScene.BTN_CHEAT_G_SERVER, this.pCheat);
        this.customButton("btnReset", EggBreakerScene.BTN_CHEAT_RESET, this.pCheat);
        this.arBtnPie = [];
        for (var i = 1; i <= 4; i++) {
            this.arBtnPie.push(this.customButton("pie" + i, (EggBreakerScene.BTN_CHEAT_PIE_1 + i - 1), this.pCheat));
        }
        this.selectCheatPie(EggBreakerScene.BTN_CHEAT_PIE_1);
        if (Config.ENABLE_CHEAT)
            this.customButton("title", EggBreakerScene.BTN_SHOW_HIDE_CHEAT, this.titleEvent, false);
        else
            this.getControl("title", this.titleEvent).setVisible(false);

        this.visibleCheat();
        this.anim = db.DBCCFactory.getInstance().buildArmatureNode("EggBreakerBg");
        if (this.anim) {
            var bg = this.getControl("bg");
            bg.addChild(this.anim);
            //this.anim.setPosition(this.getContentSize().width * 0.5, this.getContentSize().height * 0.5);
            this.anim.getAnimation().gotoAndPlay("1", -1, -1, 0);
            var scaleX = cc.visibleRect.width / 800.0;
            var scaleY = cc.winSize.height / 480.0;
            cc.log(" width + " + cc.winSize.width  + "height " + cc.winSize.height);
            this.anim.setScaleX(scaleX);
            this.anim.setScaleY(scaleY);
        }
        //this.anim.setVisible(false);
        // other config
        this.setBackEnable(true);
    },

    onUpdateGUI: function () {
        this.updateUserInfo();
    },

    onEnterFinish: function () {
        eggBreaker.eggBreakerScene = this;

        sceneMgr.addLoading("", true);

        EggBreakerSound.playLobby();

        this.isWaitingResult = false;

        this.lbHammer.setString("");
        this.effHammerShow = false;
        this.isFirstHammerShow = true;

        this.uiGift.reloadData();
        this.uiGiftLite.uiGift.reloadData();

        // clean effect
        this.costImage.setVisible(false);
        this.currentMapInfo = {};
        this.mascot.pos = cc.p(-1, -1);
        for (var s in this.eggs) {
            try {
                this.eggs[s].removeFromParent();
            }
            catch (e) {

            }
        }
        this.eggs = [];
        this.pBoard.removeAllChildren();
        this.arPiece = [];
        this.pBoard.addChild(this.mascot);
        this.mascot.setPosition(cc.p(-200,0));

        this.pMore.stopAllActions();
        this.pMore.setPositionX(this.pMore.posHide);
        this.pMore.visibleState = false;

        this.hideHammerProgress();
        this.onUpdateGUI();
        this.doEffect();
        this.enableRollButton(false);
        setTimeout(function () {
            var cmd = new CmdSendEggBreakerOpen();
            cmd.putData(1);
            GameClient.getInstance().sendPacket(cmd);
        }, 500);
        this.doActionItemList(1);
        if(this.fAutoHideItemList) {
            clearTimeout(this.fAutoHideItemList);
        }
        this.fAutoHideItemList = setTimeout(function () {
            this.doActionItemList(0);
        }.bind(this),2000);

        if (eggBreaker.isRegisterSuccess){
            var cmdGetRegisInfo = new CmdSendEggBreakerGetRegisterInfo();
            GameClient.getInstance().sendPacket(cmdGetRegisInfo);
            cmdGetRegisInfo.clean();
        }
        this.btnRegisteredInfo.setVisible(eggBreaker.isRegisterSuccess);
        //eggBreaker.updateEventInfo(eggBreaker.createCmdInfo());
        this.scheduleUpdate();
    },

    onTouchBoard : function (touch) {
        this.showMoreButton(false);
    },

    showMoreButton: function (visible) {
        visible = visible || false;
        this.pMore.stopAllActions();
        var pX = 0;
        var action = false;

        if(visible) {
            if(!this.pMore.visibleState) {
                this.pMore.setPositionX(this.pMore.posHide);
                pX = this.pMore.posShow;
                action = true;
            }
        }
        else {
            if(this.pMore.visibleState) {
                this.pMore.setPositionX(this.pMore.posShow);
                pX = this.pMore.posHide;
                action = true;
            }
        }

        this.pMore.visibleState = visible;
        if(action) {
            this.pMore.runAction(new cc.EaseBackOut(cc.moveTo(0.25, cc.p(pX, this.pMore.getPositionY()))));
        }
    },

    doEffect: function () {
        this.effectControl(this.eTop, false, 200, 0.5);
        this.effectControl(this.eRight, false, 200, 0.5);
        this.effectControl(this.eButton, false, -200, 0.5);
        this.effectControl(this.eItem, true, 200, 0.5);
    },

    effectControl: function (p, directX, deltaPos, time) {
        if (directX) {
            p.setPositionX(p.pos.x + deltaPos);
        }
        else {
            p.setPositionY(p.pos.y + deltaPos);
        }

        p.runAction(new cc.EaseBackOut(cc.moveTo(time, p.pos)));
    },

    enableRollButton: function (enable) {
        var color = cc.color(255, 255, 255, 255);
        var action = false;
        if (!enable) {
            color = cc.color(70, 70, 70, 255);
            action = false;
        }

        this.btnNormal.setPressedActionEnabled(action);
        this.btnNormal.setColor(color);
        this.btnBean.setPressedActionEnabled(action);
        this.btnBean.setColor(color);
        this.btnNormalXtreme.setPressedActionEnabled(action);
        this.btnNormalXtreme.setColor(color);
        this.btnBeanXtreme.setPressedActionEnabled(action);
        this.btnBeanXtreme.setColor(color);

        this.btnNormal.cost.setString(eggBreaker.getCostRoll(EggBreaker.ROLL_ONCE));
        this.btnNormalXtreme.cost.setString(eggBreaker.getCostRoll(EggBreaker.ROLL_XTREME));
        //this.btnBean.cost.setString(eggBreaker.getCostRoll(EggBreaker.ROLL_ONCE));
        //this.btnBeanXtreme.cost.setString(eggBreaker.getCostRoll(EggBreaker.ROLL_XTREME));

        this.btnNormal.enable = enable;
        this.btnNormalXtreme.enable = enable;
        this.btnBean.enable = enable;
        this.btnBeanXtreme.enable = enable;

        //var isOnceXtreme = (eggBreaker.keyCoin >= eggBreaker.getCostRoll(EggBreaker.ROLL_XTREME) * 2);
        //this.btnNormal.setVisible(!isOnceXtreme);
        //this.btnNormalXtreme.setVisible(isOnceXtreme);

        var bROnce = eggBreaker.getBonusCostRoll(EggBreaker.ROLL_ONCE);
        //this.btnBean.bonus.setVisible(bROnce > 0);
        //this.btnBean.bonus.num.setVisible(bROnce > 0);
        //this.btnBean.bonus.num.setString("-" + bROnce + "%");

        var bRXtreme = eggBreaker.getBonusCostRoll(EggBreaker.ROLL_XTREME);
        //this.btnBeanXtreme.bonus.setVisible(bRXtreme > 0);
        //this.btnBeanXtreme.bonus.num.setVisible(bRXtreme > 0);
        //this.btnBeanXtreme.bonus.num.setString("-" + bRXtreme + "%");

    },

    visibleCheat: function () {
        if (Config.ENABLE_CHEAT) {
            this.pCheat.setVisible(true);
            this.lbLevel.setVisible(true);
        }
        else {
            this.lbLevel.setVisible(false);
            this.pCheat.setVisible(false);
        }
    },

    // update event and user info
    updateUserInfo: function () {
        if (!this.isWaitingResult) {
            this.lbGold.realGold = gamedata.userData.bean;
            this.lbGold.setString(StringUtility.formatNumberSymbol(gamedata.userData.bean));
            this.lbBean.setString(StringUtility.pointNumber(gamedata.userData.coin));

            this.isEffectMoney = false;
        }
    },

    updateEventInfo: function () {

        this.isEventTime = eggBreaker.isInEvent();

        this.lbHammer.setString(localized("EGG_HAVING") + " " + StringUtility.pointNumber(eggBreaker.keyCoin));
        this.lbLevel.setString(eggBreaker.curLevel);

        this.lbTimeRemain.updateText(0, LocalizedString.to("EGG_INFO_TIME_LEFT_0"));
        this.lbTimeRemain.updateText(2, LocalizedString.to("EGG_INFO_TIME_LEFT_1"));

        if (!this.isWaitingResult) {
            if (this.isFirstHammerShow)
                this.showHammerProgress();

            this.loadBoardEgg();
            this.enableRollButton(true);
            this.uiGift.reloadData();
            this.uiGiftLite.uiGift.reloadData();
        }
        this.barHammer.point.setString(eggBreaker.getExpString());
        this.barHammer.progress.setPercent(eggBreaker.getExpPercent());

    },

    updateGSystem: function (cmd) {
        this.lbGServer.setString("S:" + StringUtility.pointNumber(cmd.gServer));
        this.lbGUser.setString("U:" + StringUtility.pointNumber(cmd.gUser));
    },

    openItem: function (info) {
        this.currentItemSelect = info.id; // for cheat

        this.txItem.setString(eggBreaker.getItemName(info.id));
        this.txItem.id = info.id;

        if (info.gift > 0) {
            var open = sceneMgr.openGUI(EggBreakerOpenGiftGUI.className, EggBreaker.GUI_OPEN_GIFT, EggBreaker.GUI_OPEN_GIFT);
            if (open) open.showGift(info);
        }
    },

    hideHammerProgress: function (effect) {
        //this.barHammer.stopAllActions();
        //
        //if (effect)  this.barHammer.runAction(cc.sequence(new cc.EaseBackIn(cc.scaleTo(0.35, 0)), cc.hide()));
        //else this.barHammer.setVisible(false);
    },

    showHammerProgress: function () {
        //this.barHammer.stopAllActions();
        //
        //if (this.isFirstHammerShow) {
        //    this.barHammer.point.setString("0/" + StringUtility.pointNumber(eggBreaker.nextLevelExp));
        //    this.barHammer.progress.setPercent(0);
        //}
        //else {
        //    this.barHammer.point.setString(eggBreaker.getExpString());
        //    this.barHammer.progress.setPercent(eggBreaker.getExpPercent());
        //}
        //
        //this.barHammer.setScale(0);
        //this.barHammer.setVisible(true);
        //this.effHammerShow = false;
        //this.barHammer.runAction(cc.sequence(cc.delayTime(0.15), new cc.EaseBackInOut(cc.scaleTo(0.25, 1)), cc.delayTime(0.15), cc.callFunc(function () {
        //    if (this.isFirstHammerShow) {
        //        this.isFirstHammerShow = false;
        //        this.effHammerShow = true;
        //        this.curHammerPoint = 0;
        //    }
        //    else {
        //        this.barHammer.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.hideHammerProgress.bind(this, true))));
        //    }
        //}.bind(this))));
    },

    selectCheatPie: function (id) {
        this.currentCheatPie = id % 10;

        for (var i = 0; i < this.arBtnPie.length; i++) {
            var btn = this.arBtnPie[i];
            btn.setColor((btn.getTag() != id) ? cc.color(255, 255, 255, 0) : cc.color(255, 0, 0, 0));
        }
    },

    showPopupInfo: function (inf, pos) {
        if (inf === undefined && pos === undefined) {
            this.popupItem.setVisible(false);
        }
        else {
            this.popupItem.setVisible(true);
            this.popupItem.lbInfo.setString(LocalizedString.to("EGG_COLLECTION_PIECE"));
            this.popupItem.lbName.setString(eggBreaker.getItemName(inf.id));
            this.popupItem.setPosition(pos.x - 45,pos.y);
        }
    },

    doActionItemList: function (action) {
        this.currentItemList = action;

        this.pFullItem.setVisible(true);
        this.pLiteItem.setVisible(true);
        var timeActionShow = 0.5;
        var timeActionHide = 0.25;
        if (action == 1) {
            this.pFullItem.setPosition(this.pFullItem.posHide);
            // this.pFullItem.fog.setOpacity(0);
            this.pLiteItem.setPosition(this.pLiteItem.posShow);

            this.pLiteItem.runAction(new cc.EaseBackIn(cc.moveTo(timeActionHide, this.pLiteItem.posHide)));
            this.pFullItem.runAction(cc.sequence(cc.delayTime(timeActionHide), new cc.EaseBackOut(cc.moveTo(timeActionShow, this.pFullItem.posShow))));
            // this.pFullItem.fog.runAction(cc.sequence(cc.delayTime(timeActionHide),cc.fadeIn(timeActionHide)));
        }
        else {
            if(this.fAutoHideItemList) {
                clearTimeout(this.fAutoHideItemList);
                this.fAutoHideItemList = null;
            }

            this.pLiteItem.setPosition(this.pLiteItem.posHide);
            this.pFullItem.setPosition(this.pFullItem.posShow);
            // this.pFullItem.fog.setOpacity(255);

            this.pFullItem.runAction(new cc.EaseBackIn(cc.moveTo(timeActionHide, this.pFullItem.posHide)));
            this.pLiteItem.runAction(cc.sequence(cc.delayTime(timeActionHide), new cc.EaseBackOut(cc.moveTo(timeActionShow, this.pLiteItem.posShow))));
            // this.pFullItem.fog.runAction(cc.fadeOut(timeActionHide));
        }
        this.btnCloseFullItem.setVisible(action);
    },

    // Board Egg
    loadBoardEgg: function () {
        // check cache array
        var isMapCache = false;
        var isMascotCache = false;
        if (this.currentMapInfo) {
            var count = 1;
            var size = eggBreaker.mapInfo.data.length;
            for (var i = 0; i < size; i++) {
                if (this.currentMapInfo.data && this.currentMapInfo.data[i] && this.currentMapInfo.data[i] == eggBreaker.mapInfo.data[i]) {
                    count++;
                }
            }
            isMapCache = (count == size );

            if (this.mascot.pos.x == eggBreaker.mapInfo.row && this.mascot.pos.y == eggBreaker.mapInfo.col)
                isMascotCache = true;
        }

        if (!isMapCache || !isMascotCache) {
            this.currentMapInfo = eggBreaker.mapInfo;
        }

        // load board
        if (!isMapCache) {
            cc.log("++++Change New Map+++");

            this.mascot.pos = cc.p(-1, -1);
            for (var s in this.eggs) {
                try {
                    this.eggs[s].removeFromParent();
                }
                catch (e) {

                }
            }
            this.eggs = [];
            this.pBoard.removeAllChildren();
            this.pBoard.addChild(this.mascot);

            for (var i = 0; i < EggBreakerScene.MAX_ROW; i++) {
                for (var j = 0; j < EggBreakerScene.MAX_COL; j++) {
                    if (EGG_MODE_EDITOR) {
                        var sp = new EggBreakerEditorButton(i, j);
                        sp.loadTextures("res/EventMgr/EggBreaker/EggBreakerUI/eb.png", "res/EventMgr/EggBreaker/EggBreakerUI/eb.png");
                        sp.setPressedActionEnabled(true);
                        sp.setTag(1000 + i * EggBreakerScene.MAX_COL + j);
                        sp.addTouchEventListener(this.onTouchEventHandler, this);
                        sp.setPosition(this.getPosFromIndex(i, j, 2));
                    }
                    else {
                        var id = parseInt(this.currentMapInfo.data[i * EggBreakerScene.MAX_COL + j]);
                        var sp = new EggBreakerImage(i, j, id);
                        if (i == eggBreaker.mapInfo.row && j == eggBreaker.mapInfo.col) {
                            sp.mascotOn(true);
                            sp.pImg.setVisible(false);
                        }
                        else {
                            sp.effectAppear();
                        }

                        sp.setPosition(this.getPosFromIndex(i, j));
                    }
                    this.pBoard.addChild(sp);
                    this.eggs.push(sp);
                }
            }
        }

        if (!EGG_MODE_EDITOR) {
            if (!isMascotCache) {
                this.mascotIdle(this.currentMapInfo.row, this.currentMapInfo.col, false);
            }
        }
    },

    getEggIndex: function (i, j) {
        for (var s in this.eggs) {
            if (this.eggs[s].checkEgg(i, j)) return this.eggs[s];
        }
        return null;
    },

    getPosFromIndex: function (i, j, type) { // type - 1 : mascot break , - 2 : image , mascot right, - 3 : mascot left , 4 : mascot break left
        if (!type) type = 0;

        var p = cc.p(this.eggPos.x + j * this.eggSize.width * 1.3, this.eggPos.y - i * this.eggSize.height);
        if (type == 1) {
            return cc.p(p.x - this.eggDeltaSize.width / 4, p.y + this.eggDeltaSize.height / 1.5);
        }
        else if (type == 2) {
            return cc.p(p.x + this.eggDeltaSize.width / 1.75, p.y + this.eggDeltaSize.height / 1.35);
        }
        else if (type == 3) {
            return cc.p(p.x + this.eggDeltaSize.width * 0.6, p.y + this.eggDeltaSize.height / 1.35);
        }
        else if (type == 4) {
            return cc.p(p.x + this.eggDeltaSize.width * 1.5, p.y + this.eggDeltaSize.height / 1.35);
        }
        return p;
    },

    mascotIdle: function (i, j, stop) {
        if (this.isWaitingResult) {
            this.onShowResult();
        }
        // init effect
        if (!this.mascot.eff) {
            this.mascot.eff = db.DBCCFactory.getInstance().buildArmatureNode("zingplaymascot");
            if (this.mascot.eff) {
                this.mascot.eff.setPosition(cc.p(this.mascot.getContentSize().width / 1.8, 0));
                this.mascot.addChild(this.mascot.eff);
            }
        }

        this.mascot.eff.getAnimation().gotoAndPlay("idle", -1, -1, 0);
        this.mascot.eff.getAnimation().setTimeScale(1);
        if (i !== undefined && j !== undefined) {
            var stateMascot = 2;
            var isFlip = this.mascot.isFlippedX();
            if (j == EggBreakerScene.MAX_COL - 1) {
                stateMascot = 3;
            }
            else if (j == 0) {
                stateMascot = 2;
            }
            else {
                stateMascot = (isFlip ? 3 : 2);
            }

            var pos = this.getPosFromIndex(i, j, stateMascot);
            this.mascot.setFlippedX(stateMascot == 3);
            if (stop) this.mascot.runAction(cc.moveTo(0.5, pos));
            else this.mascot.setPosition(pos);

            this.mascot.pos = cc.p(i, j);
            var egg = this.getEggIndex(i, j);
            if (egg) {
                egg.mascotOn(true);
            }
        }
    },

    mascotBreak: function (x, y) {
        if (!this.mascot.eff) {
            this.mascot.eff = db.DBCCFactory.getInstance().buildArmatureNode("zingplaymascot");
            if (this.mascot.eff) {
                this.mascot.eff.setPosition(cc.p(this.mascot.getContentSize().width / 1.8, 0));
                this.mascot.addChild(this.mascot.eff);
            }
        }

        this.mascot.stopAllActions();
        this.mascot.eff.getAnimation().gotoAndPlay("idle", -1, -1, 0);

        var sizePs = this.piecesResult.pieces.length;
        if (this.piecesResult.cur < 0 || this.piecesResult.cur >= sizePs) {
            this.mascotIdle(x, y, true);
            return;
        }

        var p = this.piecesResult.pieces[this.piecesResult.cur++];
        var i = p.row;
        var j = p.col;

        var oldPos = {};
        if (this.mascot.pos.x == -1 || this.mascot.pos.y == -1) {
            if (x != undefined && y != undefined) oldPos = cc.p(x, y);
            else oldPos = cc.p(0, 0);
        }
        else {
            oldPos = this.mascot.pos;
        }

        var checkKeep = (j == oldPos.y);
        var curFlip = this.mascot.isFlippedX();

        //var flipX = (j < oldPos.y);
        var flipX = checkKeep?curFlip : (j < oldPos.y);

        var timeBreak = 0.85;
        var timeScale = (sizePs > 1) ? 0.5 : 1;
        this.mascot.setFlippedX(flipX);
        var posEnd = this.getPosFromIndex(i, j, 2);
        var pos = this.getPosFromIndex(i, j, flipX ? 4 : 1);
        var timeMoveMascot = this.mascotMoveEffect(this.mascot.getPosition(), pos, flipX, timeScale);
        this.mascot.runAction(cc.sequence(cc.moveTo(timeMoveMascot, pos), cc.callFunc(function () {
            this.mascot.eff.getAnimation().gotoAndPlay("left", -1, -1, 0);
            this.mascot.eff.getAnimation().setTimeScale(1 / timeScale);
            var egg = this.getEggIndex(i, j);
            if (egg) egg.doBreak(timeScale, p.ids);
        }.bind(this, i, j, p.ids)), cc.delayTime(timeBreak * timeScale), cc.callFunc(this.mascotBreak.bind(this, i, j))));

        var egg = this.getEggIndex(this.mascot.pos.x, this.mascot.pos.y);
        if (egg) {
            this.mascot.pos = cc.p(-1, -1);

            egg.mascotOn(false);
            egg.effectAppear(0.5);
        }

        var egg = this.getEggIndex(x, y);
        if (egg) egg.mascotOn(false);
    },

    mascotMoveEffect: function (curPos, endPos, flipX, timeScale) {
        // add shadow
        var disX = endPos.x - curPos.x;
        var disY = endPos.y - curPos.y;
        var distance = Math.sqrt(disX * disX + disY * disY);
        var numShadow = Math.floor(distance / 15);
        var timeMove = distance * timeScale / 200;
        var delX = disX / numShadow;
        var delY = disY / numShadow;
        var delTime = timeMove / numShadow;
        var curTime = 0;
        for (var i = 0; i < numShadow; i++) {
            var sp = new cc.Sprite("res/EventMgr/EggBreaker/EggBreakerUI/mascotZP.png");
            sp.setScale(this._scale);
            sp.setFlippedX(flipX);
            this.pBoard.addChild(sp);
            curPos.x += delX;
            curPos.y += delY;
            curTime += delTime;
            sp.setPosition(cc.p(curPos.x, curPos.y + 30 * this._scale));
            sp.setVisible(false);
            sp.runAction(cc.sequence(cc.delayTime(curTime), cc.show(), cc.fadeOut(0.5), cc.removeSelf()));
        }
        return timeMove;
    },

    dropPiece: function (img, pos, scale, time) {
        var sp = new EggBreakerPiece(img, time, pos.y - 25);
        sp.applyForce(cc.p(0, -5));
        sp.setPosition(pos);
        sp.setScale(scale);
        this.pBoard.addChild(sp, 9999);
        this.arPiece.push(sp);
    },

    generateBoard: function () {
        if (EGG_MODE_EDITOR) {
            var str = "";
            for (var i = 0; i < this.eggs.length; i++) {
                str += (this.eggs[i].id + ",");
            }
            cc.log(str);
        }
    },
    // end

    // animation and effect
    doBreak: function (type, pos) {
        if (this.isWaitingResult) {
            Toast.makeToast(Toast.SHORT, LocalizedString.to("EGG_BREAKING"));
            return;
        }

        this.enableRollButton(false);

        var isRoll = true;
        var costRoll = eggBreaker.getCostRoll(type);

        switch (type) {
            case EggBreaker.ROLL_NORMAL_XTREME:
            case EggBreaker.ROLL_NORMAL_ONCE:
            {
                this.costImage.loadTexture("res/EventMgr/EggBreakerUI/xu.png");
                this.costImage.lb.setString("-" + costRoll);

                isRoll = (costRoll <= gamedata.userData.coin);
                if (isRoll) {
                    this.lbBean.setString(StringUtility.pointNumber(gamedata.userData.coin - costRoll));
                }
                else {
                    this.enableRollButton(true);

                    sceneMgr.showAddGDialog(LocalizedString.to("EGG_BREAK_RESULT_5"), this, function (btnID) {
                        if (btnID == Dialog.BTN_OK) {
                            gamedata.openNapG(this._id, true);
                        }
                    });
                    return;
                }
                break;
            }
            case EggBreaker.ROLL_ONCE:
            case EggBreaker.ROLL_XTREME:
            {
                this.costImage.loadTexture("res/EventMgr/EggBreakerUI/hammer.png");
                this.costImage.lb.setString("-" + costRoll);

                if (costRoll > eggBreaker.keyCoin) {
                    this.enableRollButton(true);
                    //Toast.makeToast(Toast.SHORT, LocalizedString.to("EGG_BREAK_RESULT_4"));
                    sceneMgr.openGUI(EggBreakerHammerDialog.className,EggBreaker.GUI_HAMMER_DIALOG,EggBreaker.GUI_HAMMER_DIALOG);
                    return;
                }
                else {
                    this.lbHammer.setString(localized("EGG_HAVING") + " "  + StringUtility.pointNumber(eggBreaker.keyCoin - costRoll));
                }
                break;
            }
        }

        if (isRoll) {
            var num = this.txNumRoll.getString();
            if (!Config.ENABLE_CHEAT || num == "" || isNaN(num)) {
                num = 1;
            }

            //if (type == EggBreaker.ROLL_NORMAL_XTREME || type == EggBreaker.ROLL_XTREME) {
            //    num = 1;
            //    //ToastFloat.makeToast(ToastFloat.SHORT,"Chỉ cheat số lần quay với quay 1 lần !!!");
            //}

            if (num > 1) {
                ToastFloat.makeToast(ToastFloat.SHORT, "Đang cheat số lần đập trứng " + num);
                this.numCheat = num;
                this.typeCheat = type;
                this.doCheat();
            }
            else {
                var cmd = new CmdSendEggBreakerRoll();
                cmd.putData(type + 1);
                GameClient.getInstance().sendPacket(cmd);
            }

            // effect cost
            var p = (pos === undefined) ? cc.p(0, 0) : pos;
            this.costImage.setPosition(p);
            this.costImage.setVisible(true);
            this.costImage.runAction(cc.sequence(cc.moveTo(1, cc.p(p.x, p.y + 50)), cc.hide()));

            this.isWaitingResult = true;

            this.waitBreakTime = new Date().getTime();
            if (this.currentItemList !== 0){
                this.doActionItemList(0);
            }
        }
    },

    doCheat: function () {
        var cmd = new CmdSendEggBreakerRoll();
        cmd.putData(this.typeCheat + 1);
        GameClient.getInstance().sendPacket(cmd);
        this.numCheat--;
        if (this.numCheat <= 0)
            return;
        setTimeout(this.doCheat.bind(this), 200);
    },

    onRollResult: function (cmd) {
        cc.log("+++TimeBreak Response : " + (new Date().getTime() - this.waitBreakTime));

        this.pDirect.setVisible(false);

        switch (cmd.result) {
            case 1:
            {
                this.giftsResult = cmd.gifts;
                this.piecesResult = {};
                this.piecesResult.pieces = cmd.pieces;
                this.piecesResult.cur = 0;
                this.mascotBreak();
                break;
            }
            case 0:
            case 2:
            case 3:
            case 4:
            case 6:
            {
                this.isWaitingResult = false;
                this.enableRollButton(true);
                this.updateEventInfo();
                sceneMgr.showOKDialog(LocalizedString.to("EGG_BREAK_RESULT_" + cmd.result));
                break;
            }
            case 5:
            {
                this.isWaitingResult = false;
                this.enableRollButton(true);
                this.updateEventInfo();
                sceneMgr.showAddGDialog(LocalizedString.to("EGG_BREAK_RESULT_5"), this, function (btnID) {
                    if (btnID == Dialog.BTN_OK) {
                        gamedata.openNapG(this._id, true);
                    }
                });
                break;
            }
        }
    },

    onShowResult: function () {
        var goldPos = this.lbGold.getParent().convertToWorldSpace(this.lbGold.getPosition());
        goldPos.x -= 45;
        var desPos = this.itemInList.getParent().convertToWorldSpace(this.itemInList.getPosition());

        var gui = sceneMgr.openGUI(EggBreakerOpenResultGUI.className, EggBreaker.GUI_GIFT_RESULT, EggBreaker.GUI_GIFT_RESULT);
        if (gui) {
            gui.openGift(this.giftsResult, desPos, goldPos);
        }
    },

    onEffectGetMoneyItem: function (value) {
        this.isEffectMoney = true;
        if(this.lbGold.realGold)
            this.curEffectMoney = this.lbGold.realGold;
        else
            this.curEffectMoney = parseInt(StringUtility.replaceAll(this.lbGold.getString(), ".", ""));

        this.deltaEffectMoney = value * 0.25;
    },

    onFinishEffectShowResult: function () {
        this.isWaitingResult = false;

        this.enableRollButton(true);
        this.updateEventInfo();
        this.updateUserInfo();
    },
    //end

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(170, 160);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new EggBreakerCell();
        }
        cell.updateInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return eggBreaker.gifts.length;
    },

    tableCellTouched: function (table, cell) {
        this.openItem(cell.info);
    },

    // function gui
    onExit: function () {
        BaseLayer.prototype.onExit.call(this);

        eggBreaker.eggBreakerScene = null;
        eggBreaker.notifyEvent = false;
        this.isWaitingResult = false;

        this.pDirect.setVisible(false);
        this.pCheat.setPositionX(this.pCheat.pos.x);

        EggBreakerSound.closeLobby();
    },

    onButtonRelease: function (btn, id) {
        if (EGG_MODE_EDITOR) {
            if (id >= 1000 && btn instanceof EggBreakerEditorButton) {
                btn.setEgg(this.currentItemSelect);
                return;
            }
            else {
                this.generateBoard();
                return;
            }
        }
        if (!eggBreaker.isInEvent()) {
            if (id != EggBreakerScene.BTN_MORE && id != EggBreakerScene.BTN_CLOSE) {
                ToastFloat.makeToast(ToastFloat.SHORT, LocalizedString.to("EGG_EVENT_TIMEOUT"));
                return;
            }
        }
        switch (id) {
            case EggBreakerScene.BTN_MORE:
            {
                this.showMoreButton(!this.pMore.visibleState);
                break;
            }
            case EggBreakerScene.BTN_CLOSE:
            {
                this.onBack();
                break;
            }
            case EggBreakerScene.BTN_HELP:
            {
                sceneMgr.openGUI(EggBreakerHelpGUI.className,EggBreaker.GUI_HELP,EggBreaker.GUI_HELP);
                break;
            }
            case EggBreakerScene.BTN_SOUND:
            {
                EggBreakerSound.musicOn = !EggBreakerSound.musicOn;
                if (EggBreakerSound.musicOn) {
                    EggBreakerSound.playLobby();
                }
                else {
                    EggBreakerSound.closeLobby();
                }
                if (EggBreakerSound.musicOn) {
                    //   this.iconSound.loadTexture("EggBreaker/btnSoundOn.png");
                    cc.log("ON ");
                    this.iconSound.loadTexture("res/EventMgr/EggBreaker/EggBreakerUI/btnSoundOn.png");
                }
                else {
                    //this.iconSound.loadTexture("EggBreaker/btnSoundOff.png");
                    cc.log("OFF");
                    this.iconSound.loadTexture("res/EventMgr/EggBreaker/EggBreakerUI/btnSoundOff.png");
                }
                cc.sys.localStorage.setItem("eventEggBreakerMusic", EggBreakerSound.musicOn ? 1 : 0);
                break;
            }
            case EggBreakerScene.BTN_NEWS:
            {
                NativeBridge.openWebView(eggBreaker.eventLinkNews);
                break;
            }
            case EggBreakerScene.BTN_SHOP:
            case EggBreakerScene.BTN_ADD_GOLD:
            {
                gamedata.openShopTicket(EggBreakerScene.className);
                break;
            }
            case EggBreakerScene.BTN_ADD_G:
            {
                gamedata.openNapG(EggBreakerScene.className);
                break;
            }
            case EggBreakerScene.BTN_HAMMER:
            {
                this.showHammerProgress();
                break;
            }
            case EggBreakerScene.BTN_NORMAL:
            case EggBreakerScene.BTN_XTREME:
            case EggBreakerScene.BTN_BEAN:
            case EggBreakerScene.BTN_BEAN_XTREME:
            {
                if (btn.enable !== undefined && btn.enable != null && btn.enable) {
                    this.doBreak(id - EggBreakerScene.BTN_NORMAL, btn.getPosition());
                }
                break;
            }
            case EggBreakerScene.BTN_CHEAT_ITEM:
            {
                if (!Config.ENABLE_CHEAT) return;

                var item = this.txItem.id;
                if (item === undefined || item == null) {
                    Toast.makeToast(Toast.SHORT, "Chua chon Item !!!");
                    return;
                }
                var num = this.txNum.getString();
                if (num == "" || isNaN(num)) {
                    num = 1;
                }

                var piece = this.currentCheatPie;

                var itemPieceId = parseInt(item) + parseInt(piece);
                var cmd = new CmdSendEggBreakerCheatItem();
                cmd.putData(itemPieceId, parseInt(num));
                GameClient.getInstance().sendPacket(cmd);

                break;
            }
            case EggBreakerScene.BTN_CHEAT_COIN:
            {
                if (!Config.ENABLE_CHEAT) return;

                var exp = this.txExp.getString();
                var coin = this.txCoin.getString();

                if (exp == "" || isNaN(exp)) {
                    exp = 0;
                }
                if (coin == "" || isNaN(coin)) {
                    coin = 0;
                }

                var cmd = new CmdSendEggBreakerCheatCoinAccumulate();
                cmd.putData(parseFloat(coin), parseInt(exp));
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case EggBreakerScene.BTN_CHEAT_COIN_FREE:
            {
                if (!Config.ENABLE_CHEAT) return;

                var cmd = new CmdSendEggBreakerCheatCoinFree();
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case EggBreakerScene.BTN_CHEAT_RESET:
            {
                if (!Config.ENABLE_CHEAT) return;

                var cmd = new CmdSendEggBreakerCheatReset();
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case EggBreakerScene.BTN_CHEAT_G_SERVER:
            {
                if (!Config.ENABLE_CHEAT) return;

                var gServer = parseFloat(this.txGServer.getString());
                if (isNaN(gServer)) gServer = 0;
                var gUser = parseFloat(this.txGUser.getString());
                if (isNaN(gUser)) gUser = 0;

                var cmd = new CmdSendEggBreakerCheatGServer();
                cmd.putData(gServer, gUser);
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case EggBreakerScene.BTN_SHOW_HIDE_CHEAT:
            {
                if (this.pCheat.getPosition().x != this.pCheat.pos.x) {
                    this.pCheat.setPositionX(this.pCheat.pos.x);
                }
                else {
                    this.pCheat.setPositionX(this.pCheat.getContentSize().width * this._scale);
                }

                var mascotPos = this.mascot.convertToWorldSpace(cc.p(0,0));
                this.pDirect.setVisible(true);
                this.pDirect.setPosition(this._layout.convertToNodeSpace(mascotPos));
                break;
            }
            case EggBreakerScene.BTN_CHEAT_PIE_1:
            case EggBreakerScene.BTN_CHEAT_PIE_2:
            case EggBreakerScene.BTN_CHEAT_PIE_3:
            case EggBreakerScene.BTN_CHEAT_PIE_4:
            {
                this.selectCheatPie(id);
                break;
            }
            case EggBreakerScene.BTN_CHEAT_DIRECT_UP:
            case EggBreakerScene.BTN_CHEAT_DIRECT_LEFT:
            case EggBreakerScene.BTN_CHEAT_DIRECT_DOWN:
            case EggBreakerScene.BTN_CHEAT_DIRECT_RIGHT:
            {
                this.isWaitingResult = true;

                var cmd = new CmdSendEggBreakerCheatDirect();
                cmd.putData(id - EggBreakerScene.BTN_CHEAT_DIRECT_UP + 1);
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case EggBreakerScene.BTN_COLLAPSE:{
                this.doActionItemList(0);
                break;
            }
            case EggBreakerScene.BTN_REGIS_INFO:{
                var gui = sceneMgr.openGUI(EggBreakerRegisterInformationGUI.className, EggBreaker.GUI_INFORMATION, EggBreaker.GUI_INFORMATION);
                gui.showRegisInfo(false);
                break;
            }
        }

        if(id != EggBreakerScene.BTN_MORE) {
            this.showMoreButton(false);
        }
    },

    onBack: function () {
        cc.log("click on back");
        if (sceneMgr.checkBackAvailable()) return;

        this.currentMap = [];
        sceneMgr.openScene(LobbyScene.className);
    },

    update: function (dt) {
        // update egg image
        for (var s in this.eggs) {
            this.eggs[s].update(dt);
        }

        // update event time
        if (this.lbTimeRemain && this.isEventTime) {
            var stime = eggBreaker.getTimeLeftString();
            var nTime = eggBreaker.getTimeLeft();

            if (nTime <= 0) {
                if (eggBreaker.checkWeek(EggBreaker.WEEK_4)) {
                    this.lbTimeRemain.updateText(0, LocalizedString.to("EGG_EVENT_TIMEOUT"));
                    eggBreaker.eventTime = EggBreaker.WEEK_4 + 1;

                    this.enableRollButton(false);

                    // Kick user to Lobby if QC want
                    //sceneMgr.openScene(LobbyScene.className);
                }
                else {
                    this.lbTimeRemain.updateText(0, LocalizedString.to("EGG_EVENT_NEXT_WEEK"));
                }
                this.lbTimeRemain.updateText(1, "");
                this.lbTimeRemain.updateText(2, "");

                this.isEventTime = false;
            }
            else {
                this.lbTimeRemain.updateText(1, stime);
            }

            this.lbTimeRemain.setPositionX(this.lbTimeRemain.pos.x - this.lbTimeRemain.getWidth() / 2);
        }

        // Effect Money run
        if (this.isEffectMoney) {
            this.curEffectMoney += this.deltaEffectMoney;
            this.lbGold.realGold = this.curEffectMoney;
            this.lbGold.setString(StringUtility.formatNumberSymbol(this.curEffectMoney));
        }

        // Effect Hammer show progress
        if (this.effHammerShow) {
            this.curHammerPoint += Math.floor(eggBreaker.curLevelExp * dt);

            this.barHammer.point.setString(StringUtility.pointNumber(this.curHammerPoint) + "/" + StringUtility.pointNumber(eggBreaker.nextLevelExp));
            this.barHammer.progress.setPercent(parseFloat(this.curHammerPoint * 100 / eggBreaker.nextLevelExp));
            if (this.curHammerPoint >= eggBreaker.curLevelExp) {
                this.effHammerShow = false;
                this.curHammerPoint = eggBreaker.curLevelExp;
                this.barHammer.point.setString(eggBreaker.getExpString());
                this.barHammer.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.hideHammerProgress.bind(this, true))));
            }
        }

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
});

var EggBreakerCollectionsCollapseGUI = BaseLayer.extend({

    ctor: function (parentNode) {
        this._super("EggBreakerCollectionsCollapseGUI");
        this.parentNode = parentNode;

        this.customButton("btn", EggBreakerScene.BTN_EXPAND, this.parentNode);

        var bListGift = this.getControl("list", this.parentNode);
        var bSizeGift = bListGift.getContentSize();
        this.uiGift = new cc.TableView(this, cc.size(bSizeGift.width * 1.05, bSizeGift.height));
        this.uiGift.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.uiGift.setVerticalFillOrder(1);
        this.uiGift.setDelegate(this);
        bListGift.addChild(this.uiGift);
        this.uiGift.reloadData();
    },

    onButtonRelease: function (btn, id) {
        eggBreaker.eggBreakerScene.doActionItemList(1);
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(60, 70);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new EggBreakerLiteCell();
        }
        cell.updateInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return eggBreaker.gifts.length;
    },

    tableCellTouched: function (table, cell) {
        if(EggBreakerScene.ITEM_LIST_MODE == 0) {
            eggBreaker.eggBreakerScene.doActionItemList(1);
        }
        else {
            eggBreaker.eggBreakerScene.openItem(cell.info);
        }
    }
});

var EggBreakerLiteCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/EventMgr/EggBreaker/EggLiteItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.name = ccui.Helper.seekWidgetByName(this._layout, "name");

        this.notify = ccui.Helper.seekWidgetByName(this._layout, "notify");
        this.numGift = ccui.Helper.seekWidgetByName(this._layout, "numGift");

        this.breaks = [];
        for (var i = 0; i < EggBreaker.NUM_PIECE; i++) {
            var br = ccui.Helper.seekWidgetByName(this._layout, "pie" + i);
            this.breaks.push(br);
        }

        // add touch
        //if(EggBreakerScene.ITEM_LIST_MODE) {
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
        //}
    },

    onTouchItem: function (p, type) {
        switch (type) {
            case 0: // began
            {
                var pos = this.getParent().convertToNodeSpace(p);
                var cp = this.getPosition();
                var rect = cc.rect(cp.x, cp.y,this.bg.getPositionX() + this.bg.getContentSize().width,this.bg.getPositionY() + this.bg.getContentSize().height);

                if (cc.rectContainsPoint(rect, pos)) {
                    this.touchPosition = p;
                    this.showItemPopup(true, p);
                }
                else {
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
                this.touchPosition = cc.p(0, 0);
                this.showItemPopup(false);
                break;
            }
        }
    },

    showItemPopup: function (visible) {
        // cc.log("++ShowPopup " + visible);
        if (visible) {
            if (eggBreaker.eggBreakerScene) {
                eggBreaker.eggBreakerScene.showPopupInfo(this.info, this.touchPosition);
            }
        }
        else {
            if (eggBreaker.eggBreakerScene) {
                eggBreaker.eggBreakerScene.showPopupInfo();
            }

            this.timeCount = 0;
            this.isWaitPopup = false;
            this.touchPosition = null;
        }
    },

    updateInfo: function (idx) {
        this.info = eggBreaker.gifts[idx];

        this.notify.setVisible(this.info.gift > 0);
        this.numGift.setVisible(this.info.gift > 0);
        this.numGift.setString(this.info.gift);
        //
        this.img.removeAllChildren();
        var sprImg = new cc.Sprite(eggBreaker.getGiftImage(this.info.id));
        this.img.addChild(sprImg);
        sprImg.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
        this.name.setString(eggBreaker.getItemNameShort(this.info.id));

        var isGift = this.info.gift > 0;
        for (var i = 0; i < this.breaks.length; i++) {
            var piece = this.breaks[i];
            piece.setVisible(this.info.item[i] > 0 || isGift);
        }
    }
});

var EggBreakerPieceConvertGUI = BaseLayer.extend({

    ctor : function () {
        this.arPiece = [];

        this._super(EggBreakerPieceConvertGUI.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerConvertPieceGUI.json");
    },

    initGUI : function () {
        this._bg = this.getControl("bg");

        this.gold = this.getControl("gold",this._bg);
        this.customButton("btn",1,this._bg);

        var list = this.getControl("list",this._bg);
        this.uiGift = new cc.TableView(this, list.getContentSize());
        this.uiGift.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.uiGift.setVerticalFillOrder(0);
        this.uiGift.setDelegate(this);
        list.addChild(this.uiGift);
        this.uiGift.reloadData();
    },

    onEnterFinish : function () {
        this.setShowHideAnimate(this._bg,true);
    },

    showPieces : function (ar,total) {
        //ar = [];
        //total = 0;
        //
        //var arGifts = [1011,1012,1023,1024,1000011,1000013,1000023,1000021,1000041,1000052];
        //for(var i = 0 ; i < 7 ; i++) {
        //    var obj = {};
        //
        //    var rnd = parseInt(Math.random()*10) % arGifts.length;
        //    obj.id = arGifts[rnd];
        //    obj.num = rnd * 5;
        //    obj.gold = rnd * 10000000;
        //
        //    total += obj.gold;
        //    ar.push(obj);
        //}

        ar.sort(function (a, b) {
            return (parseInt(b.id) - parseInt(a.id));
        });

        this.arPiece = ar;

        this.uiGift.reloadData();
        this.gold.setString(localized("EGG_SUM") + ": " + StringUtility.pointNumber(total));
    },

    getArInfo : function (idx) {
        var ar = [];
        ar.push(this.arPiece[idx]);
        return ar;
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(500, 85);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new EggBreakerPieceConvertCell();
        }
        cell.setInfo(this.getArInfo(idx));
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return this.arPiece.length;
    },

    onButtonRelease : function (btn, id) {
        var gui = sceneMgr.getMainLayer();
        if (gui instanceof EggBreakerScene){
            gui.updateUserInfo();
        }
        this.onBack();
    },

    onBack: function () {
        this.onClose();
    }
});

var EggBreakerOpenResultGUI = BaseLayer.extend({

    ctor: function () {
        this.pos = [];

        this.title = null;
        this.btn = null;
        this.gift = null;

        this.goldPos = null;
        this.desPos = null;

        this.logo_zp = null;

        this.defaultItem = null;

        this.bg = null;
        this.spGifts = [];
        this.arGifts = [];

        this.list = null;
        this.uiGift = null;

        this.isScrollGui = false;

        this.isAutoGift = false;
        this.cmd = null;

        this._super(EggBreakerOpenResultGUI.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerOpenResultGUI.json");
    },

    initGUI: function () {
        var winSize = cc.director.getWinSize();

        this.bg = this.getControl("bg");
        var top = this.getControl("pTop");
        var bot = this.getControl("pBot");

        this.title = this.getControl("congrat", top);
        this.title.pos = this.title.getPosition();

        this.btn = this.customButton("btnGet", 1, bot);
        this.btn.pos = this.btn.getPosition();

        this.share = this.customButton("btnShare", 2, bot);
        this.share.pos = this.share.getPosition();

        this.logo_zp = this.getControl("logo", bot);

        // item in list <= 10
        this.gift = this.getControl("pCenter");
        this.defaultItem = this.getControl("defaultItem", this.gift).clone();
        this.defaultItem.size = this.defaultItem.getContentSize();
        this.defaultItem.defaultWidth = this.defaultItem.size.width * 1.05;
        this.defaultItem.size.width = this.defaultItem.defaultWidth;
        this.defaultItem.size.height *= 1.15;
        this.defaultItem.padX = this.defaultItem.size.width * 0.0;
        this.defaultItem.padY = this.defaultItem.size.height * 0.15;

        // item in list > 10
        this.list = this.getControl("pList");
        var iLeft = this.getControl("left",this.list);
        var iRight = this.getControl("right",this.list);
        iLeft.setLocalZOrder(10);
        iRight.setLocalZOrder(10);
        var pSize = this.list.getContentSize();
        //var listSize = cc.size(winSize.width - iLeft.getContentSize().width*2*this._scale);
        this.uiGift = new cc.TableView(this, pSize);
        this.uiGift.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.uiGift.setVerticalFillOrder(1);
        this.uiGift.setDelegate(this);
        this.list.addChild(this.uiGift);
        this.uiGift.reloadData();

        // update pos
        var pTop = this.calculateStartPos(5, 2, 0);
        var pBot = this.calculateStartPos(5, 2, 1);

        var topH = (winSize.height - pTop.y - this.defaultItem.size.height / 2) / 2;
        var pY = pTop.y + this.defaultItem.size.height / 2 + topH + top.getContentSize().height * this._scale / 2;
        if (pY > winSize.height) pY = winSize.height;
        // top.setPositionY(pY);
        //  bot.setPositionY(pBot.y / 2 - this.defaultItem.size.height / 10 - bot.getContentSize().height * this._scale);

        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.gift.removeAllChildren();

        this.title.setVisible(false);
        this.btn.setVisible(false);
        //this.share.setVisible(false);
        this.logo_zp.setVisible(false);

        this.title.setPosition(this.title.pos);
        this.btn.setPosition(this.btn.pos);
        this.defaultItem.size.width = this.defaultItem.defaultWidth;
        // this.share.setPosition(this.share.pos);
    },

    // open gui
    openGift: function (obj, desPos, goldPos) {
        this.isAutoGift = false;
        this.isScrollGui = false;

        this.goldPos = this.gift.convertToNodeSpace(goldPos);
        this.desPos = this.gift.convertToNodeSpace(desPos);

        var gifts = [];
        for (var key in obj) {
            var ooo = {};
            ooo.isStored = eggBreaker.isItemStored(key);
            ooo.id = key;
            ooo.value = obj[key];
            gifts.push(ooo);
            if (ooo.isStored){
                var str = eggBreaker.getItemName(key);
                str = StringUtility.replaceAll(str,"Samsung","");
                str = StringUtility.replaceAll(str,"Laptop","");
                var textTemp = BaseLayer.createLabelText(str);
                textTemp.setFontSize(14);
                if (this.defaultItem.size.width < textTemp.getContentSize().width){
                    this.defaultItem.size.width = textTemp.getContentSize().width;
                }
            }
            //gifts.push(ooo);
        }

        gifts.sort(function (a, b) {
            return (parseInt(b.id) - parseInt(a.id));
        });

        //var str = "%5B%7B%22isStored%22%3Atrue%2C%22id%22%3A%221000053%22%2C%22value%22%3A1%7D%2C%7B%22isStored%22%3Atrue%2C%22id%22%3A%221000052%22%2C%22value%22%3A1%7D%2C%7B%22isStored%22%3Atrue%2C%22id%22%3A%221000051%22%2C%22value%22%3A1%7D%2C%7B%22isStored%22%3Atrue%2C%22id%22%3A%221000023%22%2C%22value%22%3A1%7D%2C%7B%22isStored%22%3Atrue%2C%22id%22%3A%221024%22%2C%22value%22%3A1%7D%2C%7B%22isStored%22%3Atrue%2C%22id%22%3A%221022%22%2C%22value%22%3A1%7D%2C%7B%22isStored%22%3Atrue%2C%22id%22%3A%221013%22%2C%22value%22%3A1%7D%2C%7B%22isStored%22%3Afalse%2C%22id%22%3A%226%22%2C%22value%22%3A1%7D%2C%7B%22isStored%22%3Afalse%2C%22id%22%3A%225%22%2C%22value%22%3A2%7D%2C%7B%22isStored%22%3Afalse%2C%22id%22%3A%224%22%2C%22value%22%3A1%7D%2C%7B%22isStored%22%3Afalse%2C%22id%22%3A%223%22%2C%22value%22%3A5%7D%2C%7B%22isStored%22%3Afalse%2C%22id%22%3A%222%22%2C%22value%22%3A8%7D%2C%7B%22isStored%22%3Afalse%2C%22id%22%3A%221%22%2C%22value%22%3A6%7D%5D";
        //str = decodeURIComponent(str);
        //gifts = JSON.parse(str);
        //
        //cc.log("ShowGift : " + JSON.stringify(gifts));

        this.arGifts = gifts;

        var nGift = gifts.length;

        this.gift.removeAllChildren();
        this.list.setVisible(false);

        //   this.share.setPressedActionEnabled(nGift <= 12);

        if(nGift > 12) {
            this.showGiftScroll();
            return;
        }

        // for (var i = gifts.length; i < 12; i++) {
        //     gifts.push(gifts[gifts.length - 1]);
        // }
        // nGift = 11;

        var nCol = [];
        var nRow = 1;

        if (nGift > 5) {
            nRow = 2;
            var x1 = parseInt(nGift / 2);
            var x2 = nGift - x1;
            nCol[0] = x1;
            nCol[1] = x2;
        }
        else {
            nRow = 1;
            nCol[0] = nGift;
        }

        var timeDelay = 0.5;
        var timeShow = 1;
        var count = 0;
        this.spGifts = [];
        for (var j = 0; j < nRow ; j++) {
            var pStart = this.calculateStartPos(nCol[j], nRow, j);
            for (var i = 0; i < nCol[j]; i++) {
                var inf = gifts[count++];

                var p = new EggBreakerResultGift();
                p.setGift(inf);
                p.setPosition(pStart.x + i * (this.defaultItem.size.width + this.defaultItem.padX), pStart.y);
                p.setPosition(pStart.x + i * (this.defaultItem.size.width + 10), pStart.y);
                // p.setPosition(pStart.x + 0, pStart.y);
                p.setScale(0);
                p.runAction(cc.sequence(cc.delayTime(timeDelay), new cc.EaseBackOut(cc.scaleTo(timeShow, 1))));
                this.gift.addChild(p);
                this.spGifts.push(p);
            }
        }

        this.runAction(cc.sequence(cc.delayTime(timeDelay),cc.callFunc(EggBreakerSound.playFinishBreak)));

        this.bg.setOpacity(0);
        this.bg.setVisible(true);
        this.bg.runAction(cc.sequence(cc.fadeTo(timeShow + timeDelay, 220), cc.callFunc(this.onFinishEffect.bind(this))));
    },

    getGiftScrollIndex : function (idx) {
        var ar = [];
        ar.push(this.arGifts[idx]);

        var maxCol = 0;
        var size = this.arGifts.length;
        if(size % 2 == 0) maxCol = size/2;
        else maxCol = parseInt(size/2) + 1;
        var cIdx = idx + maxCol;
        if(cIdx < size)
            ar.push(this.arGifts[idx+maxCol]);

        return ar;
    },

    showGiftScroll : function () {
        this.isScrollGui = true;
        this.list.setVisible(true);
        this.uiGift.reloadData();

        this.runAction(cc.sequence(cc.delayTime(0.15),cc.callFunc(EggBreakerSound.playFinishBreak)));

        this.bg.setOpacity(0);
        this.bg.setVisible(true);
        this.bg.runAction(cc.sequence(cc.fadeTo(0.25, 220), cc.callFunc(this.onFinishEffect.bind(this))));
    },

    getGiftInScroll : function () {
        var size = this.arGifts.length;
        if(size %2 == 0) size = size/2;
        else size = parseInt(size/2) + 1;

        var totalTime = 0;
        var timeHide = 0.1;
        var delayTime = 0.25;
        var lastTime = 0;
        var totalEffectTime = 0;

        for(var i = 0; i < size ; i++) {
            var cell = this.uiGift.cellAtIndex(i);
            if(cell) {
                var ar = cell.getDropInfo();
                for(var j = 0; j < ar.length ; j++) {
                    var ggg = ar[j];
                    if(ggg && ggg.isItem) {
                        var time = 0;
                        var actDrop = null;
                        var actHide = null;
                        var startPos = this.gift.convertToNodeSpace(ggg.pos);
                        startPos.x += 128/4;
                        startPos.y += 330/4;
                        if (ggg.isStored) { // pie image
                            time = this.dropPiece(ggg.id, ggg.value, startPos, this.desPos, true);
                            actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id, ggg.value, startPos, this.desPos, false));
                        }
                        else {  // drop gold
                            var num = eggBreaker.getItemValue(ggg.id) * ggg.value;
                            time = this.dropGold(num, startPos, this.goldPos, true);
                            actDrop = cc.callFunc(this.dropGold.bind(this, num, startPos, this.goldPos, false));
                        }

                        if (time > lastTime) lastTime = time;

                        actHide = cc.spawn(cc.scaleTo(timeHide, 0), cc.fadeOut(timeHide));
                        totalEffectTime += lastTime;
                        cell.runAction(cc.sequence(cc.delayTime(delayTime * (i + 1)), actHide, actDrop));
                    }
                }
            }
        }

        totalTime = lastTime + delayTime * size + timeHide;
        this.runAction(cc.sequence(cc.delayTime(totalTime), cc.callFunc(this.onCloseGUI.bind(this))));
    },

    getGift: function () {
        this.title.setVisible(true);
        this.title.setPosition(this.title.pos);
        this.title.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.title.pos.x, this.title.pos.y + 400))));

        this.btn.setVisible(true);
        this.btn.setPosition(this.btn.pos);
        this.btn.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.btn.pos.x, this.btn.pos.y - 400))));

        //  this.share.setVisible(true);
        //  this.share.setPosition(this.share.pos);
        //  this.share.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.share.pos.x, this.share.pos.y - 400))));

        this.bg.setOpacity(220);
        this.bg.setVisible(true);
        this.bg.runAction(cc.fadeOut(2));

        if(this.isScrollGui) {
            this.getGiftInScroll();
            return;
        }

        var totalTime = 0;
        var timeHide = 0.1;
        var delayTime = 0.25;
        var lastTime = 0;
        var totalEffectTime = 0;
        var size = 0;
        for (var i = 0, size = this.arGifts.length; i < size; i++) {
            var ggg = this.arGifts[i];
            var spGift = this.spGifts[i];
            var time = 0;
            var actDrop = null;
            var actHide = null;
            if (ggg.isStored) { // pie image
                time = this.dropPiece(ggg.id, ggg.value, spGift.getPosition(), this.desPos, true);
                actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id, ggg.value, spGift.getPosition(), this.desPos, false));
            }
            else {  // drop gold
                var num = eggBreaker.getItemValue(ggg.id) * ggg.value;
                time = this.dropGold(num, spGift.getPosition(), this.goldPos, true);
                actDrop = cc.callFunc(this.dropGold.bind(this, num, spGift.getPosition(), this.goldPos, false));
            }

            if (time > lastTime) lastTime = time;

            actHide = cc.spawn(cc.scaleTo(timeHide, 0), cc.fadeOut(timeHide));
            totalEffectTime += lastTime;
            spGift.runAction(cc.sequence(cc.delayTime(delayTime * (i + 1)), actHide, actDrop));
        }
        totalTime = lastTime + delayTime * size + timeHide;
        this.runAction(cc.sequence(cc.delayTime(totalTime), cc.callFunc(this.onCloseGUI.bind(this))));
    },

    // effect
    dropPiece: function (id, value, pStart, pEnd, checkTime) {
        var timeMove = 0.5;
        var timeHide = 0.25;
        var dTime = 0.1;
        if (checkTime) {
            return timeMove + dTime * value + timeHide;
        }

        var winSize = cc.director.getWinSize();
        for (var i = 0; i < value; i++) {
            var sp = new cc.Sprite(eggBreaker.getPieceImage(id));
            sp.setScale(0.6);
            var rnd = parseInt(Math.random() * 10) % 2 == 0;
            var pCX = Math.random() * winSize.width;
            var pCY = Math.random() * winSize.height;
            var posCenter = cc.p(pCX, pCY);
            var actMove = cc.bezierTo(timeMove, [pStart, posCenter, pEnd]);
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            sp.runAction(cc.sequence(cc.delayTime(dTime * i), cc.spawn(actMove,cc.callFunc(EggBreakerSound.playPiece)), actHide));
            sp.setPosition(pStart);
            this.gift.addChild(sp);
        }

        return 0;
    },

    dropGold: function (gold, pStart, pEnd, checkTime) {
        var num = Math.floor(gold / 100000);

        if (num < 2) num = Math.floor(Math.random() * 5) + 5;

        if (gold > 10000000) num = Math.floor(gold / 1000000);

        num = (num < 10) ? num : (10 + parseInt(num / 5));
        var goldReturn = Math.floor(gold / num);

        var timeMove = 1.5;
        var dTime = 0.5;
        var timeHide = 0.25;
        var timeShow = 0.15;

        if (checkTime) {
            return timeMove + timeHide + dTime + timeShow;
        }

        var winSize = cc.director.getWinSize();
        var rangeX = [-50, 50];
        var rangeY = [-50, 50];

        num = (num < 10) ? num : (10 + parseInt(num/5));

        for (var i = 0; i < num; i++) {
            //var sp = new cc.Sprite("res/EventMgr/EggBreakerUI/icon_gold.png");
            var sp = new EggBreakerCoinEffect();
            sp.start();

            // random pos start
            var rndX = Math.random() * (rangeX[1] - rangeX[0]) + rangeX[0];
            var rndY = Math.random() * (rangeY[1] - rangeY[0]) + rangeY[0];

            var rndRotate = -(Math.random() * 360);

            var pCX = Math.random() * winSize.width;
            var pCY = Math.random() * winSize.height;

            var posStart = cc.p(pStart.x + rndX, pStart.y + rndY);
            var posCenter = cc.p(pCX, pCY);

            var actionSound = cc.callFunc(function () {
                if (this < 3){
                    EggBreakerSound.playSingleCoin();
                }
            }.bind(i));

            var actShow = new cc.EaseBackOut(cc.scaleTo(timeShow, 0.4));
            var actMove = new cc.EaseSineOut(cc.bezierTo(timeMove, [posStart, posCenter, pEnd]));
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            sp.setPosition(posStart);
            sp.setRotation(rndRotate);
            this.gift.addChild(sp);
            sp.setScale(0);

            sp.runAction(cc.sequence(cc.delayTime(Math.random() * dTime), actShow, cc.spawn(actMove,cc.sequence(cc.delayTime(1.5*Math.random()),actionSound)), cc.callFunc(function () {
                if (eggBreaker.eggBreakerScene) {
                    eggBreaker.eggBreakerScene.onEffectGetMoneyItem(goldReturn);
                }
            }.bind(this, goldReturn)), actHide));
        }
        return 0;
    },

    finishCardMoving: function () {
        var card = new EggBreakerImage(-1, this.scaleCard != 1);
        card.setPosition(this.getPosition());
        this.getParent().addChild(card);
        card.zoomEffect(this.scaleCard != 1);
    },

    onFinishEffect: function () {
        this.title.setVisible(true);
        this.title.setPositionY(this.title.pos.y + 400);
        this.title.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.title.pos)));

        this.btn.setVisible(true);
        this.btn.setPositionY(this.btn.pos.y - 400);
        this.btn.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.btn.pos)));

        //  this.share.setVisible(true);
        //  this.share.setPositionY(this.share.pos.y - 400);
        //  this.share.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.share.pos)));
    },

    effectMoney: function (sender, value) {
        if (value === undefined || value == null) return;

        if (eggBreaker.eggBreakerScene) {
            eggBreaker.eggBreakerScene.onEffectGetMoneyItem(value);
        }
    },

    // ui function
    onButtonRelease: function (btn, id) {
        if (id == 1) {
            if (eggBreaker.isSendRegister)
                return;
            this.onBack();
        }
        else {
            if(this.isScrollGui) return;
            this.onCapture();
        }
    },

    onBack: function () {
        if (this.isAutoGift) {
            var gIds = [];
            for (var i = 0; i < this.cmd.gifts.length; i++) {
                if (eggBreaker.isItemOutGame(this.cmd.gifts[i].id)) {
                    gIds.push(this.cmd.gifts[i].id);
                }
            }
            if (gIds.length > 0) {
                if (eggBreaker.isRegisterSuccess) {
                    eggBreaker.isSendRegister = true;
                    var cmd = new CmdSendEggBreakerChangeAward();
                    cmd.putData(false, gIds);
                    GameClient.getInstance().sendPacket(cmd);
                }
                else {
                    eggBreaker.showRegisterInformation(gIds);
                }
            }
            this.onCloseDone();
        }
        else {
            this.getGift();
            //this.onCloseGUI();
        }
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(128, 330);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new EggBreakerGiftCell(this);
        }
        cell.setVisible(true);
        cell.setScale(1);
        cell.setInfo(this.getGiftScrollIndex(idx));
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        var size = this.arGifts.length;
        if(size %2 == 0) return size/2;

        return parseInt(size/2) + 1;
    },

    onCapture: function () {
        this.share.setVisible(false);
        this.btn.setVisible(false);

        this.logo_zp.setVisible(true);

        if (!gamedata.checkOldNativeVersion()) {
            var imgPath = sceneMgr.takeScreenShot();
            setTimeout(function () {
                fr.facebook.shareScreenShoot(imgPath, function(result){
                    var message = "";
                    if (result == -1) {
                        message = localized("INSTALL_FACEBOOK");
                    }
                    else if (result == 1) {
                        message = localized("NOT_SHARE");
                    }
                    else if (result == 0) {
                        message = localized("FACEBOOK_DELAY");
                    }
                    else {
                        message = localized("FACEBOOK_ERROR");
                    }
                    Toast.makeToast(Toast.SHORT, message);
                });
            }, 500);
        } else {
            this.onShareImg = function (social, jdata) {
                var message = "";
                var dom = StringUtility.parseJSON(jdata);// JSON.parse(jdata);
                if (dom["error"] == -1) {
                    message = localized("INSTALL_FACEBOOK");
                } else if (dom["error"] == 1) {
                    message = localized("NOT_SHARE");
                } else if (dom["error"] == 0) {
                    message = localized("FACEBOOK_DELAY");
                } else {
                    message = localized("FACEBOOK_ERROR");
                }
                Toast.makeToast(Toast.SHORT, message);

            }.bind(this);

            socialMgr.set(this, this.onShareImg);
            socialMgr.shareImage(SocialManager.FACEBOOK);
        }

        this.share.setVisible(true);
        this.btn.setVisible(true);

        this.logo_zp.setVisible(false);
    },

    onCloseGUI: function () {
        eggBreaker.eggBreakerScene.onFinishEffectShowResult();

        this.onClose();
    },

    calculateStartPos: function (nCol, nRow, row) {
        var iW = (this.defaultItem.size.width + this.defaultItem.padX);
        var iH = (this.defaultItem.size.height + this.defaultItem.padY);
        var nWidth = nCol * iW;
        var nHeight = nRow * iH;

        var pSize = this.gift.getContentSize();

        var pos = {};
        pos.x = pSize.width / 2 - nWidth / 2 + iW / 2;
        pos.y = pSize.height / 1.9 + nHeight / 2 - iH * row - iH / 2;
        return pos;
    }
});

var EggBreakerOpenGiftGUI = BaseLayer.extend({

    ctor: function () {
        this.gift = null;
        this.lbNotice = null;
        this.lbName = null;
        this.info = null;
        this.btn = null;

        this.share = null;
        this.logo_zp = null;

        this.panel = null;
        this.title = null;
        this.circle = null;

        this.pEffect = null;

        this._super(EggBreakerOpenGiftGUI.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerOpenGiftGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");

        this.logo_zp = this.getControl("logo");

        this.panel = this.getControl("panel");

        this.pEffect = this.getControl("effect");

        this.lbNotice = this.getControl("lb", this.panel);
        this.lbName = this.getControl("gift", this.panel);
        this.gift = this.getControl("img", this.panel);
        this.gift.pos = this.gift.getPosition();
        this.btn = this.customButton("btn", 1, this.panel);
        this.share = this.customButton("share", 2, this.panel);

        this.title = this.getControl("title", this.panel);
        this.circle = this.getControl("circle", this.panel);
        this.particle = this.panel.getChildByName("particle");

        this.lbNotice.pos = this.lbNotice.getPosition();
        this.lbName.pos = this.lbName.getPosition();
        this.gift.pos = this.gift.getPosition();
        this.btn.pos = this.btn.getPosition();
        this.share.pos = this.share.getPosition();
        this.title.pos = this.title.getPosition();
        this.circle.pos = this.circle.getPosition();
        this.particle.pos = this.particle.getPosition();

        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.bg.setOpacity(255);

        this.panel.setVisible(true);
        this.panel.setOpacity(255);

        this.pEffect.removeAllChildren();

        this.btn.setVisible(true);
        this.share.setVisible(true);

        this.logo_zp.setVisible(false);
        this.arrayFirework = [];
        this.countTimeFireWork = 0;
        this.scheduleUpdate();
    },

    doAnimate: function () {
        var time = 0;
        var tDrop = 0.3;

        this.btn.setVisible(true);
        this.share.setVisible(true);

        this.circle.setVisible(true);
        this.particle.setVisible(true);

        this.title.setVisible(true);
        this.lbName.setVisible(true);
        this.lbNotice.setVisible(true);

        time += 0.15;
        this.title.setPositionY(this.title.pos.y + 500);
        this.title.runAction(cc.EaseBackOut(cc.moveTo(tDrop, this.title.pos)));

        time += 0.1;
        this.lbNotice.setPositionY(this.lbNotice.pos.y + 500);
        this.lbNotice.runAction(cc.sequence(cc.delayTime(time), cc.EaseBackOut(cc.moveTo(tDrop, this.lbNotice.pos))));

        time += 0.05;
        this.lbName.setPositionY(this.lbName.pos.y + 500);
        this.lbName.runAction(cc.sequence(cc.delayTime(time), cc.EaseBackOut(cc.moveTo(tDrop, this.lbName.pos))));

        this.btn.setPositionY(this.btn.pos.y - 400);
        this.btn.runAction(cc.sequence(cc.delayTime(time), cc.EaseBackOut(cc.moveTo(tDrop, this.btn.pos))));

        this.share.setPositionY(this.btn.pos.y - 400);
        this.share.runAction(cc.sequence(cc.delayTime(time), cc.EaseBackOut(cc.moveTo(tDrop, this.share.pos))));

        time += 0.15;
        this.gift.setPosition(this.gift.pos);
        this.gift.setScale(0);
        this.gift.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(EggBreakerSound.playGift), cc.EaseBackOut(cc.scaleTo(0.5, 1))));

        this.circle.setScale(0);
        this.circle.runAction(cc.sequence(cc.spawn(cc.scaleTo(1.5, 1), cc.rotateTo(1.5, 360)), cc.repeatForever(cc.rotateBy(0.15, 5))));
        this.circle.runAction(cc.repeatForever(cc.rotateBy(0.15, 5)));
    },

    hideAnimate: function () {
        var tDrop = 0.3;

        this.btn.setVisible(true);
        this.share.setVisible(true);

        this.circle.setVisible(true);
        this.particle.setVisible(true);

        this.title.setVisible(true);
        this.lbName.setVisible(true);
        this.lbNotice.setVisible(true);

        this.title.setPosition(this.title.pos);
        this.title.runAction(cc.EaseBackIn(cc.moveTo(tDrop, cc.p(this.title.pos.x, this.title.pos.y + 500))));

        this.lbNotice.setPosition(this.lbNotice.pos);
        this.lbNotice.runAction(cc.EaseBackIn(cc.moveTo(tDrop, cc.p(this.lbNotice.pos.x, this.lbNotice.pos.y + 500))));

        this.lbName.setPosition(this.lbName.pos);
        this.lbName.runAction(cc.EaseBackIn(cc.moveTo(tDrop, cc.p(this.lbName.pos.x, this.lbName.pos.y + 500))));

        this.btn.setPosition(this.btn.pos);
        this.btn.runAction(cc.EaseBackIn(cc.moveTo(tDrop, cc.p(this.btn.pos.x, this.btn.pos.y - 400))));

        this.share.setPosition(this.share.pos);
        this.share.runAction(cc.EaseBackIn(cc.moveTo(tDrop, cc.p(this.share.pos.x, this.share.pos.y - 400))));
    },

    showGift: function (inf, auto) {
        this.isWaitReceive = false;
        if (auto === undefined || auto == null) auto = false;
        this.isAutoGift = auto;

        this.info = inf;

        this.gift.setScale(1);
        this.gift.removeAllChildren();

        if (inf.gift > 1) {
            this.lbName.setString(inf.gift + "x" + eggBreaker.getItemName(this.info.id));
        }
        else {
            this.lbName.setString(eggBreaker.getItemName(this.info.id));
        }

        if (eggBreaker.isItemOutGame(inf.id))
            this.lbName.setString(((inf.gift > 1) ? (inf.gift + " ") : "") + eggBreaker.getItemName(this.info.id));

        var sp = new cc.Sprite(eggBreaker.getGiftImage(this.info.id));
        sp.setScale(1.5);
        this.gift.addChild(sp);
        this.gift.setOpacity(255);
        var pSize = this.gift.getContentSize();
        sp.setPosition(pSize.width / 2, pSize.height / 2);

        this.doAnimate();
    },

    onGiftSuccess: function () {
        this.circle.setVisible(false);
        this.particle.setVisible(false);

        var numGold = (this.info.id % 1000) * 10;
        var timeDone = 1 + numGold / 100;
        var eff = new EggBreakerCoinEffectLayer();
        eff.setPositionCoin(SceneMgr.convertPosToParent(this.pEffect, this.gift));
        eff.startEffect(numGold, EggBreakerCoinEffect.TYPE_FLOW);
        eff.setCallbackFinish(this.onBack.bind(this));
        this.pEffect.addChild(eff);
        this.gift.runAction(cc.fadeOut(timeDone));

        if (this.bg) {
            this.bg.setVisible(true);
            this.bg.runAction(cc.fadeOut(timeDone));
        }
    },

    update: function (dt) {
        // UPDATE RUN FIREWORK
        this.countTimeFireWork = this.countTimeFireWork + dt;
        if (this.countTimeFireWork > 0.4) {
            this.countTimeFireWork = 0;
            var i;
            var firework;
            for (i = 0; i < this.arrayFirework.length; i++) {
                if (!this.arrayFirework[i].isVisible()) {
                    firework = this.arrayFirework[i];
                    break;
                }
            }
            if (i == this.arrayFirework.length) {
                //  var fw = db.DBCCFactory.getInstance().buildArmatureNode("firework" + (i + 1));
                firework = db.DBCCFactory.getInstance().buildArmatureNode("firework1");
                this.addChild(firework);
                firework.setScale(2.0);
                this.arrayFirework.push(firework);
            }
            firework.setVisible(true);
            firework.getAnimation().gotoAndPlay("1", -1, -1, 1);
            firework.setPosition(Math.random() * 420 + 200, 320 + Math.random() * 80);
            //this.arrayFirework.setCompleteListener();
            firework.setCompleteListener(this.onFinishEffectFirework.bind(this, firework));
            var random = 0.5 + Math.random() * 0.5;
            firework.setScale(random);
            firework.setScale(1.8);
            firework.setOpacity(255 * random);
            //
            //var p;
            //switch(i) {
            //    case 0:
            //        p = cc.p(50, 50);
            //        break;
            //    case 1:
            //        p = cc.p(150, 110);
            //        break;
            //    case 2:
            //        p = cc.p(400, 90);
            //        break;
            //    default :
            //        p = cc.p(250, 80);
            //        break;
            //}
            //this.arrayFirework[i].setPosition(p);

        }
    },

    onFinishEffectFirework: function (sender) {
        sender.setVisible(false);
    },


    onButtonRelease: function (button, id) {
        if (id == 1) {
            this.hideAnimate();

            if (eggBreaker.isItemOutGame(this.info.id)) {
                if (eggBreaker.isRegisterSuccess) {
                    if (!eggBreaker.isSendRegister) {
                        var cmd = new CmdSendEggBreakerChangeAward();
                        cmd.putData(false, this.info.id);
                        GameClient.getInstance().sendPacket(cmd);
                    }
                }
                else {
                    eggBreaker.showRegisterInformation([this.info.id]);
                }

                this.onCloseDone();
                eggBreaker.showAutoGift();
            }
            else {
                if (this.isAutoGift) {
                    this.onGiftSuccess();
                }
                else {
                    if (!eggBreaker.isSendRegister && !this.isWaitReceive) {
                        var cmd = new CmdSendEggBreakerChangeAward();
                        cmd.putData(true, this.info.id);
                        GameClient.getInstance().sendPacket(cmd);
                        this.isWaitReceive = true;
                    }
                }
            }
        }
        else {
            this.onCapture();
        }
    },

    onCapture: function () {
        this.share.setVisible(false);
        this.btn.setVisible(false);

        //this.girl.setVisible(true);
        this.logo_zp.setVisible(true);
        //this.logo_event.setVisible(true);

        if (!gamedata.checkOldNativeVersion()) {
            var imgPath = sceneMgr.takeScreenShot();
            setTimeout(function () {
                fr.facebook.shareScreenShoot(imgPath, function(result){
                    var message = "";
                    if (result == -1) {
                        message = localized("INSTALL_FACEBOOK");
                    }
                    else if (result == 1) {
                        message = localized("NOT_SHARE");
                    }
                    else if (result == 0) {
                        message = localized("FACEBOOK_DELAY");
                    }
                    else {
                        message = localized("FACEBOOK_ERROR");
                    }
                    Toast.makeToast(Toast.SHORT, message);
                });
            }, 500);
        } else {
            this.onShareImg = function (social, jdata) {
                var message = "";
                var dom = StringUtility.parseJSON(jdata);// JSON.parse(jdata);
                if (dom["error"] == -1) {
                    message = localized("INSTALL_FACEBOOK");
                } else if (dom["error"] == 1) {
                    message = localized("NOT_SHARE");
                } else if (dom["error"] == 0) {
                    message = localized("FACEBOOK_DELAY");
                } else {
                    message = localized("FACEBOOK_ERROR");
                }
                Toast.makeToast(Toast.SHORT, message);

            }.bind(this);

            socialMgr.set(this, this.onShareImg);
            socialMgr.shareImage(SocialManager.FACEBOOK);
        }

        this.btn.setVisible(true);
        this.share.setVisible(true);

        //this.girl.setVisible(false);
        this.logo_zp.setVisible(false);
        //this.logo_event.setVisible(false);
    },

    onBack: function () {
        this.onClose();

        eggBreaker.showAutoGift();
    }
});

var EggBreakerAccumulateGUI = BaseLayer.extend({

    ctor: function () {
        this.bgCoin = null;
        this.coin = null;
        this.text1 = null;
        //this.text2 = null;

        this.progress = null;

        this.bar = null;
        this.num = null;
        this.exp = null;
        this.bonus = null;

        this.result = {};
        this.perLoad = [];
        this.deltaLoad = [];
        this.curLoad = 0;
        this.timeLoad = 0;

        this.curExpTmp = 0;
        this.nextExpTmp = 0;

        this.isKeyCoinChange = false;

        this._super(EggBreakerAccumulateGUI.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerAccumulateGUI.json");
    },

    initGUI: function () {
        var pEffect = this.getControl("effect");

        this.bgCoin = this.getControl("bgCoin", pEffect);
        this.text1 = this.getControl("text_1", pEffect);
        this.text1.pos = this.text1.getPosition();
        //this.text2 = this.getControl("text_2",pEffect);
        //this.text2.pos = this.text2.getPosition();

        this.coin = this.getControl("coin");
        this.coin.posStart = this.coin.getPosition();

        this.progress = this.getControl("progress");
        this.progress.setPositionY(this.progress.getPositionY() + 50);
        this.progress.defaultPos = this.progress.getPosition();

        this.coin.posDes = SceneMgr.convertPosToParent(this._layout, this.getControl("ico", this.progress));

        this.bar = this.getControl("bar", this.progress);
        this.num = this.getControl("num", this.progress);
        this.exp = this.getControl("exp", this.progress);
        this.bonus = this.getControl("bonus", this.progress);
        this.bonus.defaultPos = this.bonus.getPosition();

        this.tab = this.getControl("tab");
        this.tab.setPositionY(this.tab.getPositionY() + 50);
        this.tab.setTouchEnabled(true);
        this.tab.setCascadeOpacityEnabled(false);
        this.tab.mainGUI = this;
        this.tab.addTouchEventListener(function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    return;
                case ccui.Widget.TOUCH_MOVED:
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                case ccui.Widget.TOUCH_ENDED:
                    cc.log("TOUCH THE TAB BUTTON");
                    this.showAccumulate({
                        keyCoin: eggBreaker.keyCoin,
                        nextLevelExp: eggBreaker.nextLevelExp,
                        currentLevelExp: eggBreaker.curLevelExp,
                        additionExp: 0
                    });
                    this.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.onCloseGUI.bind(this))));
                    break;
            }
        }, this);

        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        cc.log("ON FINISH HERE *** ");
        this.result = null;

        this.bgCoin.setVisible(false);
        this.bgCoin.setOpacity(255);
        this.text1.setVisible(false);
        //this.text2.setVisible(false);
        this.coin.setVisible(false);
        this.coin.setPosition(this.coin.posStart);
        this.coin.setScale(this._scale);

        this.progress.setPositionX(this.progress.defaultPos.x + this.progress.getContentSize().width);

        this.bonus.setVisible(false);
        this.bonus.setString("");
        this.bonus.setPosition(this.bonus.defaultPos);
        this.exp.setString(eggBreaker.curLevelExp + "/" + eggBreaker.nextLevelExp);

        this.tab.setOpacity(255);
        this.tab.removeAllChildren();

        this.schedule(this.update, EggBreakerAccumulateGUI.TIME_DELTA);

    },

    showAccumulate: function (cmd) {
        cc.log("WHY NOt HERE " +  JSON.stringify(cmd));
        //eggBreaker.curLevelExp = 8000;
        //eggBreaker.nextLevelExp = 10000;
        //eggBreaker.keyCoin = 1;
        //
        //cmd = {};
        //cmd.keyCoinAdd = 20;
        //cmd.keyCoin = 20;
        //cmd.keyCoinAward = 2;
        //
        //cmd.additionExp = 13500;
        //cmd.currentLevelExp = 13500;
        //cmd.nextLevelExp = 20000;
        this.result = cmd;
        this.tab.setTouchEnabled(false);
        this.tab.stopAllActions();
        this.tab.runAction(cc.fadeOut(EggBreakerAccumulateGUI.TIME_MOVE));
        this.isKeyCoinChange = (cmd.keyCoin > eggBreaker.keyCoin);
        this.progress.stopAllActions();
        this.progress.setPositionX(this.progress.defaultPos.x + this.progress.getContentSize().width);
        this.stopAllActions();

        this.curExpTmp = eggBreaker.curLevelExp;
        this.nextExpTmp = eggBreaker.nextLevelExp;

        var perExp = eggBreaker.getExpPercent();
        this.bar.setPercent(perExp);
        this.num.setString(eggBreaker.keyCoin);
        this.exp.setString(eggBreaker.getExpString());
        //
        this.progress.runAction(cc.sequence(new cc.EaseExponentialOut(cc.moveTo(EggBreakerAccumulateGUI.TIME_MOVE, this.progress.defaultPos)), cc.callFunc(this.endMoving.bind(this))));
        //this.progress.runAction(cc.sequence(cc.delayTime(EggBreakerAccumulateGUI.TIME_MOVE), cc.callFunc(this.endMoving.bind(this))));

        // effect coin
        if (this.result.keyCoinAward > 0) {
            this.bgCoin.setVisible(true);
            this.bgCoin.runAction(cc.repeatForever(cc.rotateBy(0.1, 10)));
            this.bgCoin.runAction(cc.sequence(cc.delayTime(1.5), cc.fadeOut(0.5)));

            this.text1.setVisible(true);
            this.text1.setOpacity(0);
            //this.text2.setVisible(true);
            //this.text2.setOpacity(0);
            this.text1.setPositionY(this.text1.pos.y - 100);
            //this.text2.setPositionY(this.text2.pos.y - 100);
            var moveUp1 = cc.spawn(cc.EaseBackOut(cc.moveTo(0.5, this.text1.pos)), cc.fadeIn(0.5));
            //var moveUp2 = cc.spawn(cc.EaseBackOut(cc.moveTo(0.5,this.text2.pos)),cc.fadeIn(0.5));
            var upHide1 = cc.spawn(cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.text1.pos.x, this.text1.pos.y + 100))), cc.fadeOut(0.5));
            //var upHide2 = cc.spawn(cc.EaseBackIn(cc.moveTo(0.5,cc.p(this.text2.pos.x,this.text2.pos.y + 100))),cc.fadeOut(0.5));
            this.text1.runAction(cc.sequence(moveUp1, cc.delayTime(1), upHide1));
            //this.text2.runAction(cc.sequence(cc.delayTime(0.1),moveUp2,cc.delayTime(1),upHide2));

            var bezier = [this.coin.posStart, cc.p(this.coin.posStart.x, this.coin.posDes.y), this.coin.posDes];
            // var spawn1 = cc.spawn(new cc.EaseSineOut(cc.moveTo(0.5, this.coin.posDes)), cc.scaleTo(0.5, 0.3)); //cc.BezierTo.create(0.5, bezier)
            var spawn1 = cc.scaleTo(0.5, 0.3); //cc.BezierTo.create(0.5, bezier)
            var showZoom = cc.spawn(cc.EaseBackOut(cc.scaleTo(0.5, this._scale)), cc.fadeIn(0.5));
            this.coin.setVisible(true);
            this.coin.setOpacity(0);
            this.coin.setScale(0);
            this.coin.runAction(cc.sequence(showZoom, cc.delayTime(1), spawn1, cc.delayTime(0.1),
                cc.scaleTo(0.1, 0.7), cc.scaleTo(0.1, 0.25), cc.scaleTo(0.1, 0.45),
                cc.hide(), cc.callFunc(this.endCoin.bind(this))));
        }

        if (!this.tab.isVisible()) return;
        this.tab.removeAllChildren();
    },

    setAllShow: function (bool) {
        this.isAllShow = bool;
        this.tab.setVisible(bool);
        this.tab.setTouchEnabled(bool);
        this.num.setString(eggBreaker.keyCoin);
    },

    endMoving: function () {
        // bonus
        this.bonus.setVisible(true);
        this.bonus.setString("+" + StringUtility.pointNumber(this.result.additionExp));
        this.bonus.runAction(cc.sequence(cc.scaleTo(0.15, 1.25), cc.scaleTo(0.15, 0.8), cc.scaleTo(0.15, 1)));

        if (this.result.additionExp <= 0)
            return;

        // effect bar progress
        this.perLoad = [];
        this.deltaLoad = [];

        if (eggBreaker.nextLevelExp > 1) {
            if (eggBreaker.curLevelExp + this.result.additionExp >= eggBreaker.nextLevelExp) {
                this.deltaLoad.push(eggBreaker.nextLevelExp - eggBreaker.curLevelExp);
                this.deltaLoad.push(this.result.additionExp - eggBreaker.nextLevelExp + eggBreaker.curLevelExp);

                this.perLoad.push(this.getPerLoad(eggBreaker.nextLevelExp - eggBreaker.curLevelExp, eggBreaker.nextLevelExp));
                this.perLoad.push(this.getPerLoad(this.result.additionExp - eggBreaker.nextLevelExp + eggBreaker.curLevelExp, this.result.nextLevelExp));
            }
            else {
                this.deltaLoad.push(this.result.additionExp);
                this.perLoad.push(this.getPerLoad(this.result.additionExp, this.result.nextLevelExp));
            }
        }
        else {
            var oldExp = 0;
            cc.log(" VO DAY NE *** " + eggBreaker.curLevelExp);
            this.exp.setString(StringUtility.pointNumber(eggBreaker.curLevelExp) + "/" + StringUtility.pointNumber(this.result.nextLevelExp));
            // this.bar.setPercent(parseFloat(oldExp * 100 / this.result.nextLevelExp));

            this.deltaLoad.push(this.result.currentLevelExp);
            this.perLoad.push(this.getPerLoad(this.result.currentLevelExp, this.result.nextLevelExp));
        }

        // start loading
        this.curLoad = 0;
        this.timeLoad = EggBreakerAccumulateGUI.TIME_PROGRESS / this.perLoad.length;
        for (var i = 0; i < this.perLoad.length; i++) {
            this.perLoad[i] = EggBreakerAccumulateGUI.TIME_DELTA * this.perLoad[i] / this.timeLoad;
            this.deltaLoad[i] = EggBreakerAccumulateGUI.TIME_DELTA * this.deltaLoad[i] / this.timeLoad;
        }

        // update eggBreaker info
        eggBreaker.curLevelExp = this.result.currentLevelExp;
        eggBreaker.nextLevelExp = this.result.nextLevelExp;
        eggBreaker.keyCoin = this.result.keyCoin;
    },

    endCoin: function () {
        if (this.isKeyCoinChange) {
            this.num.runAction(cc.sequence(cc.scaleTo(0.15, 1.25), cc.callFunc(function () {
                this.setString(eggBreaker.keyCoin);
            }.bind(this.num)), cc.scaleTo(0.15, 0.8), cc.scaleTo(0.15, 1)));
        }
        else {
            this.num.setString(eggBreaker.keyCoin);
        }
    },

    onFinishLoad: function () {
        if (this.curLoad >= this.perLoad.length) {
            this.bgCoin.setVisible(false);
            var perExp = eggBreaker.getExpPercent();
            cc.log("PER EXP " + perExp);
            perExp = (perExp < 5) ? 5 : perExp;
            this.bar.setPercent(perExp);
            this.exp.setString(eggBreaker.getExpString());
            this.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.onCloseGUI.bind(this))));

            if (this.result && this.result.keyCoinAward <= 0) {
                this.endCoin();
            }
        }
    },

    onCloseGUI: function () {
        cc.log("ON CLOSE GUI " + this.isAllShow);
        var moveTo = cc.moveTo(EggBreakerAccumulateGUI.TIME_MOVE, cc.p(this.progress.defaultPos.x + this.progress.getContentSize().width, this.progress.defaultPos.y));

        if (this.isAllShow) {
            this.tab.setTouchEnabled(true);
            this.tab.runAction(cc.fadeTo(EggBreakerAccumulateGUI.TIME_MOVE, 255));
            this.progress.runAction(cc.EaseExponentialOut(moveTo));
        } else {
            this.progress.runAction(cc.sequence(new cc.EaseExponentialOut(moveTo), cc.callFunc(this.onClose.bind(this))));
        }
    },

    getPerLoad: function (a, b) {
        return (a * 100 / b);
    },

    update: function (dt) {
        if (this.curLoad < this.perLoad.length) {
            // this.bar.setPercent(this.bar.getPercent() + this.perLoad[this.curLoad]);

            this.curExpTmp += this.deltaLoad[this.curLoad];
            this.exp.setString(StringUtility.pointNumber(this.curExpTmp) + "/" + StringUtility.pointNumber(this.nextExpTmp));

            this.timeLoad -= EggBreakerAccumulateGUI.TIME_DELTA;
            if (this.timeLoad <= 0) {
                this.curExpTmp = 0;
                if (this.result)
                    this.nextExpTmp = this.result.nextLevelExp;

                this.bar.setPercent(0);
                this.curLoad += 1;
                this.timeLoad = EggBreakerAccumulateGUI.TIME_PROGRESS / this.perLoad.length;

                this.onFinishLoad();
            }
        }
    }
});

var EggBreakerEventNotifyGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(EggBreakerEventNotifyGUI.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerEventNotifyGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", EggBreakerEventNotifyGUI.BTN_CLOSE, this._bg);
        this.btnJoin = this.customButton("join", EggBreakerEventNotifyGUI.BTN_JOIN, this._bg);
        this.btnJoin.runAction(cc.repeatForever(cc.sequence(
            cc.EaseBounceOut(cc.scaleTo(0.6, 1.2)),
            cc.scaleTo(0.3, 1.0)
        )));

        // var pTime = this.getControl("time", this.btnJoin);

        //var txts = [];
        //txts.push({"text": LocalizedString.to("EGG_INFO_TIME_FROM"), "color": cc.color(188, 2, 36, 0)});
        //txts.push({"text": "", "font": SceneMgr.FONT_BOLD, "color": cc.color(48, 92, 4, 0)});
        //txts.push({"text": LocalizedString.to("EGG_INFO_TIME_TO"), "color": cc.color(188, 2, 36, 0)});
        //txts.push({"text": "", "font": SceneMgr.FONT_BOLD, "color": cc.color(48, 92, 4, 0)});
        this.lbTime = this.getControl("lbTime", this.btnJoin);
        //   this.lbTime.setText(txts);
        //   this.lbTime.pos = pTime.getPosition();
        //   this.lbTime.setPositionY(this.lbTime.pos.y - this.lbTime.getHeight() / 2);
        //   this._bg.addChild(this.lbTime);

        this.pBreakEgg = this.getControl("pBreakEgg");

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        eggBreaker.saveCurrentDay();

        //  this.lbTime.updateText(1, eggBreaker.eventDayFrom);
        cc.log("SHOW NOTIFY GUI " + eggBreaker.eventDayFrom + "-" + eggBreaker.eventDayTo);
        this.lbTime.setString(eggBreaker.eventDayFrom + "-" + eggBreaker.eventDayTo);
        //this.lbTime.updateText(3, eggBreaker.eventDayTo);
        //this.lbTime.setPositionX(this.lbTime.pos.x - this.lbTime.getWidth() / 2);

        // this.setShowHideAnimate(this._bg, true);
        this.showEffectOpen();
    },

    showEffectOpen: function(){
        this._bg.setPosition(this.pBreakEgg.getPosition());
        this._bg.setScale(0);

        var egg = new EggBreakerImage(0, 0);
        egg.img.setVisible(false);
        egg.gold.setVisible(false);
        egg.silver.setVisible(false);
        this.pBreakEgg.addChild(egg);
        var actionAnimate = cc.callFunc(function () {
            this.animate();
        }.bind(egg));

        egg.gold.runAction(cc.sequence(cc.delayTime(0.3), cc.show(), cc.delayTime(0.5), actionAnimate));

        var mascot = db.DBCCFactory.getInstance().buildArmatureNode("zingplaymascot");
        if (mascot){
            mascot.getAnimation().gotoAndPlay("idle", -1, -1, 0);
            mascot.getAnimation().setTimeScale(1);
            mascot.setPosition(-30, 20);
            this.pBreakEgg.addChild(mascot);
            mascot.setVisible(false);
            mascot.runAction(cc.sequence(cc.delayTime(1), cc.show(), cc.delayTime(0.5), cc.callFunc(function () {
                this.getAnimation().gotoAndPlay("left", 0, -1, 1);
                if (egg) egg.doBreak(0.8);
            }.bind(mascot)), cc.delayTime(0.5), cc.callFunc(this.effectMoveBg.bind(this)), cc.delayTime(0.3), cc.hide()));
        }
    },

    effectMoveBg: function(){
        var timeBgAction = 1;
        var actionBgScale = cc.scaleTo(timeBgAction, 1).easing(cc.easeExponentialOut());
        var actionBgMove = cc.moveTo(timeBgAction, this._bg.defaultPos.x, this._bg.defaultPos.y).easing(cc.easeBackOut()).easing(cc.easeExponentialOut());
        // var actionBgMove = cc.moveTo(timeBgAction, this._bg.defaultPos.x, this._bg.defaultPos.y).easing(cc.easeExponentialOut());
        this._bg.runAction(cc.spawn(actionBgMove, actionBgScale));
    },

    onButtonRelease: function (btn, id) {
        this.onBack();

        if (id == EggBreakerEventNotifyGUI.BTN_JOIN) {
            eggBreaker.openEvent();
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var EggBreakerNapGNotifyGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(EggBreakerNapGNotifyGUI.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerNapGNotifyGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", EggBreakerNapGNotifyGUI.BTN_CLOSE, this._bg);
        this.customButton("nap_g", EggBreakerNapGNotifyGUI.BTN_NAP_G, this._bg);

        this.lbTime = this.getControl("time", this._bg);
        this.lb = this.getControl("lb", this._bg);

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        eggBreaker.saveCurrentDayNapG();
        this.setShowHideAnimate(this._bg, true);

        this.lbTime.setString(eggBreaker.eventWeeks[eggBreaker.eventTime - 1]);

        this.lbTime.setVisible(false);
        this.lb.setVisible(false);
    },

    onButtonRelease: function (btn, id) {
        this.onBack();

        if (id == EggBreakerNapGNotifyGUI.BTN_NAP_G) {
            gamedata.openNapG(EggBreakerScene.className);
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var EggBreakerHelpGUI = BaseLayer.extend({

    ctor: function () {

        this._currentPage = null;
        this._pageHelp = null;

        this._arrPage = null;
        this._pageInfo = null;

        this.curPage = -1;

        this._super(EggBreakerHelpGUI.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerHelpGUI.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        var btnClose = this.customButton("btnClose", EggBreakerHelpGUI.NUM_PAGE_HELP + 1, bg);

        this._pageHelp = this.getControl("pageHelp", bg);
        this._pageHelp.setCustomScrollThreshold(150);

        this._arrPage = [];
        for (var i = 0; i < EggBreakerHelpGUI.NUM_PAGE_HELP; i++) {
            this._arrPage[i] = this.customButton("btnPage" + i, i, bg);
            this._arrPage[i].setPressedActionEnabled(false);
        }

        this._currentPage = this.getControl("imgCurPage", bg);
        this._pageHelp.addEventListener(this.onPageListener.bind(this), this);

        this.enableFog(true);
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);

        this.onPageListener();
    },

    onPageListener: function () {
        if (this.curPage == -1) {
            this.curPage = this._pageHelp.getCurPageIndex();
            this._currentPage.setPosition(this._arrPage[this.curPage].getPosition());
        }
        else {
            this._currentPage.setPosition(this._arrPage[this.curPage].getPosition());

            this.curPage = this._pageHelp.getCurPageIndex();
            var newPos = this._arrPage[this._pageHelp.getCurPageIndex()].getPosition();
            this._currentPage.runAction(cc.moveTo(0.1, newPos));
        }
    },

    onButtonRelease: function (button, id) {
        if (id >= 0 && id < EggBreakerHelpGUI.NUM_PAGE_HELP) {
            this._pageHelp.scrollToPage(id);
        }
        else {
            this.onBack();
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var EggBreakerRegisterInformationGUI = BaseLayer.extend({

    ctor: function () {
        this.giftIds = [];

        this.txName = null;
        this.txAddress = null;
        this.txCmnd = null;
        this.txSdt = null;
        this.txEmail = null;

        this.btnRegister = null;

        this._super(EggBreakerRegisterInformationGUI.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerRegisterInformationGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", EggBreakerRegisterInformationGUI.BTN_CLOSE, this._bg);
        this.btnRegister = this.customButton("complete", EggBreakerRegisterInformationGUI.BTN_OK, this._bg);
        this.btnRegister.enable = false;

        this.btnSendCMND = this.customButton("btnSendCMND", EggBreakerRegisterInformationGUI.BTN_SEND_CMND, this._bg);

        this.giftName = this.getControl("gift", this._bg);

        // init editbox
        this.txName = this.createExitBox(this.getControl("bgName", this._bg), LocalizedString.to("EGG_NAME"), EggBreakerRegisterInformationGUI.TF_NAME);
        this.txName.setMaxLength(100);
        this._bg.addChild(this.txName);

        this.txAddress = this.createExitBox(this.getControl("bgAdd", this._bg), LocalizedString.to("EGG_ADDRESS"), EggBreakerRegisterInformationGUI.TF_ADDRESS);
        this.txAddress.setMaxLength(100);
        this._bg.addChild(this.txAddress);

        this.txCmnd = this.createExitBox(this.getControl("bgCmnd", this._bg), LocalizedString.to("EGG_CMND"), EggBreakerRegisterInformationGUI.TF_CMND);
        this.txCmnd.setMaxLength(100);
        this._bg.addChild(this.txCmnd);

        this.txSdt = this.createExitBox(this.getControl("bgSdt", this._bg), LocalizedString.to("EGG_PHONE"), EggBreakerRegisterInformationGUI.TF_PHONE);
        this.txSdt.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this.txSdt.setMaxLength(100);
        this._bg.addChild(this.txSdt);

        this.txEmail = this.createExitBox(this.getControl("bgEmail", this._bg), LocalizedString.to("EGG_EMAIL"), EggBreakerRegisterInformationGUI.TF_EMAIL);
        this.txEmail.setMaxLength(100);
        this._bg.addChild(this.txEmail);

        this.pRegister = this.getControl("pRegister");
        this.pInfo = this.getControl("pInfo");

        this.enableFog();
        this.setBackEnable(true);
    },

    createExitBox: function (bg, name, tag) {
        var edb = new cc.EditBox(bg.getContentSize(), new cc.Scale9Sprite());
        edb.setFont("fonts/tahoma.ttf", 17);
        edb.setPlaceHolder(name);
        edb.setPlaceholderFontName("fonts/tahoma.ttf");
        edb.setPlaceholderFontSize(15);
        edb.setPlaceholderFontColor(cc.color(220, 220, 220));
        edb.setPosition(bg.getPosition());
        edb.x += 10;
        edb.setDelegate(this);
        edb.setAnchorPoint(cc.p(0.5, 0.5));
        edb.setDelegate(this);
        edb.setTag(tag);
        edb.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
        return edb;
    },

    checkTextInput: function (str, minLen, alert) {
        var ok = true;
        var maxLen = 150;
        if (str === undefined || str == null) {
            ok = false;
        }
        else {
            if (str.length < minLen || str.length > maxLen) {
                ok = false;
            }
        }

        if (!ok) {
            Toast.makeToast(Toast.SHORT, alert);
        }

        ok = true;
        return ok;
    },

    validateEmail: function (email, alert) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var ok = re.test(email);
        if (!ok) {
            Toast.makeToast(Toast.SHORT, alert);
        }
        return ok;
    },

    autoCheckRegisterEnable: function () {
        var name = this.txName.getString().trim();
        var address = this.txAddress.getString().trim();
        var cmnd = this.txCmnd.getString().trim();
        var sdt = this.txSdt.getString().trim();
        var email = this.txEmail.getString().trim();

        if (name.length < 3 || address.length < 3 || cmnd.length < 9 || sdt.length < 9 || email.length < 3) {
            this.enableRegisterButton(false);
            return false;
        }
        this.enableRegisterButton(true);
        return true;
    },

    enableRegisterButton: function (enable) {
        if (enable) {
            this.btnRegister.setPressedActionEnabled(true);
            this.btnRegister.setColor(cc.color(255, 255, 255, 255));
        }
        else {
            this.btnRegister.setPressedActionEnabled(false);
            this.btnRegister.setColor(cc.color(92, 92, 92, 255));
        }
        this.btnRegister.enable = enable;
    },

    editBoxReturn: function (editBox) {
        var tag = parseInt(editBox.getTag());
        if (isNaN(tag)) return;

        var str = editBox.getString().trim();
        switch (tag) {
            case EggBreakerRegisterInformationGUI.TF_NAME:
            {
                this.checkTextInput(str, 3, LocalizedString.to("EGG_INPUT_NAME"));
                break;
            }
            case EggBreakerRegisterInformationGUI.TF_ADDRESS:
            {
                this.checkTextInput(str, 3, LocalizedString.to("EGG_INPUT_ADDRESS"));
                break;
            }
            case EggBreakerRegisterInformationGUI.TF_PHONE:
            {
                this.checkTextInput(str, 9, LocalizedString.to("EGG_INPUT_PHONE"));
                break;
            }
            case EggBreakerRegisterInformationGUI.TF_CMND:
            {
                this.checkTextInput(str, 9, LocalizedString.to("EGG_INPUT_CMND"));
                break;
            }
            case EggBreakerRegisterInformationGUI.TF_EMAIL:
            {
                this.validateEmail(str, LocalizedString.to("EGG_INPUT_EMAIL"));
                break;
            }
        }

        this.autoCheckRegisterEnable();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);

        this.txName.setString("");
        this.txAddress.setString("");
        this.txCmnd.setString("");
        this.txSdt.setString("");
        this.txEmail.setString("");

        this.enableRegisterButton(false);
        this.showRegisInfo(true);
    },

    showRegisInfo: function(isRegisInfo){
        this.btnSendCMND.setVisible(eggBreaker.getTotalPriceGift() > 500000);
        this.pInfo.setVisible(!isRegisInfo);
        this.pRegister.setVisible(isRegisInfo);
        this.txName.setTouchEnabled(isRegisInfo);
        this.txAddress.setTouchEnabled(isRegisInfo);
        this.txCmnd.setTouchEnabled(isRegisInfo);
        this.txSdt.setTouchEnabled(isRegisInfo);
        this.txEmail.setTouchEnabled(isRegisInfo);

        if (!isRegisInfo){
            var data = eggBreaker.registerData;
            this.txName.setString(data.fullName);
            this.txAddress.setString(data.address);
            this.txCmnd.setString(data.identity);
            this.txSdt.setString(data.phone);
            this.txEmail.setString(data.email);

            var str = "";
            var gIds = data.registeredGiftIds;
            gIds.sort(function (a, b) {
                return b - a;
            });
            var length = (gIds.length <= 2) ? gIds.length : 2;
            for (var i = 0; i < length; i++) {
                str += eggBreaker.getItemName(gIds[i]);
                if (i < length - 1) {
                    str += ", ";
                }
            }
            if (gIds.length > 2) str += ", ...";
            this.giftName.setString(str);
        }
    },

    updateInfor: function (gIds) {
        var str = "";
        for (var i = 0; i < gIds.length; i++) {
            str += eggBreaker.getItemName(gIds[i]);
            if (i < gIds.length - 1) {
                str += ",";
            }
        }
        this.giftName.setString(str);
        this.giftIds = gIds;
    },

    onCompleteRegister: function () {
        if (eggBreaker.isSendRegister)
            return;
        this.autoCheckRegisterEnable();

        var name = this.txName.getString().trim();
        var address = this.txAddress.getString().trim();
        var cmnd = this.txCmnd.getString().trim();
        var sdt = this.txSdt.getString().trim();
        var email = this.txEmail.getString().trim();

        if (!this.checkTextInput(name, 3, LocalizedString.to("EGG_INPUT_NAME"))) {}
        else if (!this.checkTextInput(address, 3, LocalizedString.to("EGG_INPUT_ADDRESS"))) {}
        else if (!this.checkTextInput(cmnd, 9, LocalizedString.to("EGG_INPUT_CMND"))) {}
        else if (!this.checkTextInput(sdt, 9, LocalizedString.to("EGG_INPUT_PHONE"))) {}
        else if (!this.validateEmail(email, LocalizedString.to("EGG_INPUT_EMAIL"))) {}
        else {
            eggBreaker.isSendRegister = true;
            var cmd = new CmdSendEggBreakerChangeAward();
            cmd.putData(false, this.giftIds, name, address, cmnd, sdt, email);
            GameClient.getInstance().sendPacket(cmd);
        }
    },

    onButtonRelease: function (btn, id) {
        if (id == EggBreakerRegisterInformationGUI.BTN_SEND_CMND) {
            try {
                if (!cc.sys.isNative) {
                    NativeBridge.openURLNative("https://www.facebook.com/messages/t/401519949863382")
                }
                else if (cc.sys.os === cc.sys.OS_IOS) {
                    cc.Application.getInstance().openURL("fb-messenger://user-thread/401519949863382");
                }
                else if (cc.sys.os === cc.sys.OS_ANDROID) {
                    if(!cc.Application.getInstance().openURL("fb://messaging/401519949863382")) {
                        cc.Application.getInstance().openURL("https://www.facebook.com/messages/t/401519949863382");
                    }
                }
            }
            catch (e) {

            }
            return;
        }

        if (id == EggBreakerRegisterInformationGUI.BTN_OK) {
            if (this.btnRegister.enable)
                this.onCompleteRegister();
        }
        else {
            this.onBack();
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var EggBreakerReceiveGratefulTicket = BaseLayer.extend({

    ctor: function () {
        this._super(EggBreakerReceiveGratefulTicket.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerGratefulTicket.json");
    },

    onEnterFinish: function(){
        this.setShowHideAnimate(this._bg,true);
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("btnClose", 0, this._bg);
        this.customButton("close", 0, this._bg);

        this.txtDes = this.getControl("txtDes",this._bg);
        this.txtNumTicket = this.getControl("txtNumberTicket",this._bg);

        this.setBackEnable(true);
    },

    setInfoGratefullTicket: function(numTicket, gratefulType){
        var txtDes = localized("EGG_GRATEFUL_OLD_USER");
        if (gratefulType == CmdReceiveEggBreakerKeyCoinBonus.TYPE_COIN_OLD_TOP_USER){
            txtDes = localized("EGG_GRATEFUL_OLD_TOP_USER");
        }

        txtDes = StringUtility.replaceAll(txtDes, "@game", localized("GAME_NAME"));

        this.txtDes.setString(txtDes);

        var txtNumTicket = localized("EGG_GRATEFUL_NUMBER_TICKET");
        txtNumTicket = StringUtility.replaceAll(txtNumTicket, "@number", numTicket);
        this.txtNumTicket.setString(txtNumTicket);
    },

    onButtonRelease: function (btn, id) {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        if (gui instanceof LobbyScene){
            potBreaker.openPotBreaker();
        }

        this.onBack();
    },

    onBack: function () {
        this.onClose();
    }
});

var EggBreakerHammerDialog = BaseLayer.extend({

    ctor : function () {
        this._super(EggBreakerHammerDialog.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerHammerDialog.json");
    },

    initGUI : function () {
//        this.bg = this.getControl("bg");
        this.panel = this.getControl("panel");

        this.customButton("btnShop",EggBreakerHammerDialog.BTN_SHOP,this.panel);
        this.customButton("btnPlay",EggBreakerHammerDialog.BTN_PLAY_GAME,this.panel);
        this.customButton("btnClose",EggBreakerHammerDialog.BTN_CLOSE,this.panel);

        this.enableFog();
        this.setBackEnable();
    },

    onEnterFinish : function () {
        var timeShow  = 0.25;
        if(this._fog)
        {
            this._fog.setOpacity(0);
            this._fog.setVisible(true);
            this._fog.runAction(cc.fadeTo(timeShow,150));
        }

        //this.bg.setScale(0);
        //this.bg.setOpacity(0);
        this.panel.setScale(0);
        this.panel.setOpacity(0);
        //this.bg.runAction(cc.spawn(new cc.EaseBackOut(cc.scaleTo(timeShow,0.65)),cc.fadeIn(timeShow)));
        this.panel.runAction(cc.spawn(new cc.EaseBackOut(cc.scaleTo(timeShow, this._scale)),cc.fadeIn(timeShow)));
    },

    onButtonRelease : function (btn, id) {
        var timeShow  = 0.25;
        if(this._fog)
        {
            this._fog.runAction(cc.fadeOut(timeShow));
        }

        //   this.bg.runAction(cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeShow,0)),cc.fadeOut(timeShow)));
        this.panel.runAction(cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeShow,0)),cc.fadeOut(timeShow)));
        if (id == EggBreakerHammerDialog.BTN_SHOP)
            this.runAction(cc.sequence(cc.delayTime(timeShow),cc.callFunc(this.onCloseShop.bind(this))));
        else if (id == EggBreakerHammerDialog.BTN_PLAY_GAME)
            this.runAction(cc.sequence(cc.delayTime(timeShow),cc.callFunc(this.onClosePlay.bind(this))));
        else
            this.runAction(cc.sequence(cc.delayTime(timeShow),cc.callFunc(this.onCloseDone.bind(this))));
    },

    onCloseDone : function () {
        this.removeFromParent();
    },

    onCloseShop: function() {
        gamedata.openShopTicket(EggBreakerScene.className);
        this.removeFromParent();
    },

    onClosePlay: function() {
        if (CheckLogic.checkQuickPlay()) {
            var pk = new CmdSendQuickPlay();
            GameClient.getInstance().sendPacket(pk);
            pk.clean();
            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
        }
        else {
            if (Math.floor(gamedata.timeSupport) > 0) {
                var pk = new CmdSendGetSupportBean();
                GameClient.getInstance().sendPacket(pk);
                gamedata.showSupportTime = true;
                pk.clean();
            }
            else {
                if (gamedata.checkEnablePayment()) {
                    var msg = LocalizedString.to("QUESTION_CHANGE_GOLD");
                    sceneMgr.showChangeGoldDialog(msg, this, function (buttonId) {
                        if (buttonId == Dialog.BTN_OK) {
                            gamedata.openShop();
                        }
                    });
                }
                else {
                    sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                }
            }
        }
        this.removeFromParent();
    }
});
EggBreakerHammerDialog.BTN_PLAY_GAME = 1;
EggBreakerHammerDialog.BTN_SHOP = 2;
EggBreakerHammerDialog.BTN_CLOSE = 3;
EggBreakerScene.messageCaches = [];
EggBreakerScene.timeMessageDisplay = 0;

var EggBreakerPromoTicketGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(EggBreakerPromoTicketGUI.className);
        this.initWithBinaryFile("res/EventMgr/EggBreaker/EggBreakerPromoTicketGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", EggBreakerPromoTicketGUI.CLOSE, this._bg);
        this.btnJoin = this.customButton("join", EggBreakerPromoTicketGUI.SHOP, this._bg);
        this.btnJoin.runAction(cc.repeatForever(cc.sequence(
            new cc.EaseBounceOut(cc.scaleTo(0.6, 1.2)),
            cc.scaleTo(0.3, 1.0)
        )));

        this.lbTime = this.getControl("lbTime", this._bg);

        this.ignoreAllButtonSound();

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        //midAutumn.saveCurrentDay();
        if (event.startPromoTicket.localeCompare(event.endPromoTicket) == 0) {
            var s  = localized("EGG_TIME_LEFT_FORMAT_DAY");
            s = StringUtility.replaceAll(s, "@day ", "");
            s = s + " " + event.startPromoTicket;
            this.lbTime.setString(s);
        }
        else {
            this.lbTime.setString(localized("EGG_INFO_TIME_FROM") + event.startPromoTicket + localized("EGG_INFO_TIME_TO") + event.endPromoTicket);
        }

        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        // MidAutumnSound.playBubbleSingle();
        if (id == EggBreakerPromoTicketGUI.SHOP) {
            gamedata.openShopTicket();
        }
        this.onCloseDone();
    },

    onBack: function () {
        this.onClose();
    }
});

EggBreakerPromoTicketGUI.className = "EggBreakerPromoTicketGUI";
EggBreakerPromoTicketGUI.TAG = 105;
EggBreakerPromoTicketGUI.SHOP = 0;
EggBreakerPromoTicketGUI.CLOSE = 1;

EggBreakerScene.createMessageBroadcast = function (message) {
    if (message == "")
        return null;

    var sprite = new cc.Sprite("res/EventMgr/EggBreaker/EggBreakerUI/bgBroadcast.png");
    sprite.y = 10;

    var length = cc.winSize.width * 0.2;
    var _label = new ccui.Text();
    _label.setAnchorPoint(cc.p(0, 0.5));
    _label.setFontName("fonts/tahoma.ttf");
    _label.setFontSize(17);
    _label.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
    _label.setColor(sceneMgr.ccWhite);
    _label.setString(message);
    _label.x = length;
    _label.y = 10;

    var shape = new cc.DrawNode();
    var green = cc.color(0, 255, 0, 255);
    shape.drawRect(cc.p(0, 0), cc.p(length, 50), green);

    var clipper = new cc.ClippingNode();
    clipper.tag = 100;
    clipper.anchorX = 1;
    clipper.anchorY = 0.5;
    clipper.x = cc.winSize.width / 2;
    clipper.y = cc.winSize.height - _label.getContentSize().height * 1.5;
    clipper.stencil = shape;
    clipper.addChild(sprite);
    clipper.addChild(_label);
    var scale = cc.director.getWinSize().width / Constant.WIDTH;
    scale = (scale > 1) ? 1 : scale;
    clipper.setScale(scale);

    var toX = -_label.getContentSize().width - length;
    var veloc = 30;
    var time = Math.abs(toX / veloc);
    _label.runAction(cc.moveBy(time, cc.p(toX, 0)));
    clipper.runAction(cc.sequence(cc.delayTime(time), cc.removeSelf()));
    return clipper;
};

EggBreakerScene.onMessageBroadcast = function (message) {
    if (message === undefined || message == null || message == "") return;

    EggBreakerScene.messageCaches.push(message);

    if (sceneMgr.layerGUI) {
        if (!sceneMgr.layerGUI.getChildByTag(EggBreakerScene.TAG_BROADCAST)) {
            EggBreakerScene.loop();
        }
    }
};

EggBreakerScene.checkAndDisplay = function () {
    if (EggBreakerScene.messageCaches.length > 0) {
        var message = "" + EggBreakerScene.messageCaches[0];
        EggBreakerScene.messageCaches.splice(0, 1);

        if (sceneMgr.layerGUI) {
            if (sceneMgr.layerGUI.getChildByTag(EggBreakerScene.TAG_BROADCAST))
                sceneMgr.layerGUI.removeChildByTag(EggBreakerScene.TAG_BROADCAST);

            sceneMgr.layerGUI.addChild(EggBreakerScene.createMessageBroadcast(message), EggBreakerScene.TAG_BROADCAST, EggBreakerScene.TAG_BROADCAST);
        }
    }
};

EggBreakerScene.loop = function () {
    EggBreakerScene.checkAndDisplay();

    engine.HandlerManager.getInstance().addHandler("eggBreaker_message_broadcast", function () {
        EggBreakerScene.doLoop(EggBreakerScene.TIME_DELAY_APPEAR);
    });
    engine.HandlerManager.getInstance().getHandler("eggBreaker_message_broadcast").setTimeOut(1, true);
};

EggBreakerScene.doLoop = function (t) {
    if (t === undefined) {
        t = EggBreakerScene.TIME_DEFAULT_APPEAR;
    }


    engine.HandlerManager.getInstance().addHandler("eggBreaker_broadcast", EggBreakerScene.loop);
    engine.HandlerManager.getInstance().getHandler("eggBreaker_broadcast").setTimeOut(t, true);
};

EggBreakerPiece.MAX_PIECE = 6;

EggBreakerScene.TIME_DELAY_APPEAR = 30;
EggBreakerScene.TIME_DEFAULT_APPEAR = 5;
EggBreakerScene.TAG_BROADCAST = 999999;

EggBreakerScene.TIME_WAIT_EGG_ANIMATE = 5;

EggBreakerScene.MAX_ROW = 3;
EggBreakerScene.MAX_COL = 8;

EggBreakerScene.TIME_DELAY = 1.5;
EggBreakerScene.TIME_MOVE = 0.35;

EggBreakerScene.TIME_DELAY_XTREME = 0.15;
EggBreakerScene.TIME_MOVE_XTREME = 0.075;

EggBreakerScene.NUM_CARD = 7;
EggBreakerScene.CARD_OPEN = 4;

EggBreakerScene.BTN_CLOSE = 1;
EggBreakerScene.BTN_HELP = 2;
EggBreakerScene.BTN_SHOP = 3;
EggBreakerScene.BTN_ADD_GOLD = 4;
EggBreakerScene.BTN_ADD_G = 5;
EggBreakerScene.BTN_COLLECTION = 6;
EggBreakerScene.BTN_HAMMER = 7;
EggBreakerScene.BTN_NEWS = 8;
EggBreakerScene.BTN_MORE = 9;
EggBreakerScene.BTN_SOUND = 70;

EggBreakerScene.BTN_NORMAL= 10;
EggBreakerScene.BTN_XTREME = 11;
EggBreakerScene.BTN_BEAN = 10;
EggBreakerScene.BTN_BEAN_XTREME = 11;

EggBreakerScene.BTN_CHEAT = 20;
EggBreakerScene.BTN_CHEAT_ITEM = 21;
EggBreakerScene.BTN_CHEAT_COIN = 22;
EggBreakerScene.BTN_CHEAT_COIN_FREE = 23;
EggBreakerScene.BTN_CHEAT_G_SERVER = 24;
EggBreakerScene.BTN_SHOW_HIDE_CHEAT = 26;

EggBreakerScene.BTN_CHEAT_PIE_1 = 31;
EggBreakerScene.BTN_CHEAT_PIE_2 = 32;
EggBreakerScene.BTN_CHEAT_PIE_3 = 33;
EggBreakerScene.BTN_CHEAT_PIE_4 = 34;

EggBreakerScene.BTN_CHEAT_DIRECT_UP = 35;
EggBreakerScene.BTN_CHEAT_DIRECT_RIGHT = 36;
EggBreakerScene.BTN_CHEAT_DIRECT_DOWN = 37;
EggBreakerScene.BTN_CHEAT_DIRECT_LEFT = 38;
EggBreakerScene.BTN_CHEAT_RESET = 39;


EggBreakerScene.BTN_REGIS_INFO = 40;

EggBreakerScene.BTN_COLLAPSE = 50;
EggBreakerScene.BTN_EXPAND = 51;
EggBreakerScene.ITEM_LIST_MODE = 0;

EggBreakerScene.CARD_SCALE = 0.55;
EggBreakerScene.NUM_CARD_XTREME = 10;

EggBreakerAccumulateGUI.TIME_PROGRESS = 1;
EggBreakerAccumulateGUI.TIME_MOVE = 0.5;
EggBreakerAccumulateGUI.TIME_DELTA = 0.05;

EggBreakerEventNotifyGUI.BTN_CLOSE = 1;
EggBreakerEventNotifyGUI.BTN_JOIN = 2;

EggBreakerNapGNotifyGUI.BTN_CLOSE = 1;
EggBreakerNapGNotifyGUI.BTN_NAP_G = 2;

EggBreakerRegisterInformationGUI.BTN_CLOSE = 0;
EggBreakerRegisterInformationGUI.BTN_OK = 1;
EggBreakerRegisterInformationGUI.BTN_SEND_MAIL = 2;
EggBreakerRegisterInformationGUI.BTN_SEND_CMND = 3;

EggBreakerRegisterInformationGUI.TF_NAME = 1;
EggBreakerRegisterInformationGUI.TF_ADDRESS = 2;
EggBreakerRegisterInformationGUI.TF_PHONE = 3;
EggBreakerRegisterInformationGUI.TF_CMND = 4;
EggBreakerRegisterInformationGUI.TF_EMAIL = 5;

EggBreakerHelpGUI.NUM_PAGE_HELP = 4;

EggBreakerCoinEffect.RATE_SPEED_Y = 600;
EggBreakerCoinEffect.DEFAULT_SPEED_Y = 850;
EggBreakerCoinEffect.RATE_SPEED_X = 350;
EggBreakerCoinEffect.RATE_SPEED_R = 10;
EggBreakerCoinEffect.RATE_Position_X = 70;
EggBreakerCoinEffect.RATE_Position_Y = 70;
EggBreakerCoinEffect.MIN_SCALE = 0.32;
EggBreakerCoinEffect.MAX_SCALE = 0.42;
EggBreakerCoinEffect.RATE_JUMP_BACK = 0.5;
EggBreakerCoinEffect.GRAVITY = 2300;
EggBreakerCoinEffect.POSI = 90;
EggBreakerCoinEffect.NAME_ANIMATION_COIN = "gold";
EggBreakerCoinEffect.NUM_SPRITE_ANIMATION_COIN = 5;
EggBreakerCoinEffect.NUM_COIN_EACH_TIME = 100;
EggBreakerCoinEffect.NUM_COIN_RATE_RAIN = 100;
EggBreakerCoinEffect.TIME_ANIMATION_COIN = 0.3;
EggBreakerCoinEffect.TIME_OUT_COIN = 0.05;
EggBreakerCoinEffect.TYPE_FLOW = 0;
EggBreakerCoinEffect.TYPE_RAIN = 1;
EggBreakerCoinEffect.DELAY_PLAY_SOUND = 0.3;

// className
EggBreakerScene.className = "EggBreakerScene";
EggBreakerHelpGUI.className = "EggBreakerHelpGUI";
EggBreakerAccumulateGUI.className = "EggBreakerAccumulateGUI";
EggBreakerEventNotifyGUI.className = "EggBreakerEventNotifyGUI";
EggBreakerNapGNotifyGUI.className = "EggBreakerNapGNotifyGUI";
EggBreakerRegisterInformationGUI.className = "EggBreakerRegisterInformationGUI";
EggBreakerOpenResultGUI.className = "EggBreakerOpenResultGUI";
EggBreakerOpenGiftGUI.className = "EggBreakerOpenGiftGUI";
EggBreakerPieceConvertGUI.className = "EggBreakerPieceConvertGUI";
EggBreakerHammerDialog.className = "EggBreakerHammerDialog";
EggBreakerReceiveGratefulTicket.className = "EggBreakerReceiveGratefulTicket";


// VARIABLE
var EGG_MODE_EDITOR = false;
