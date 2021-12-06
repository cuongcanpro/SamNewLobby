/**
 * Created by Hunter on 02/14/2016.
 */
var randomFloat = function (min, max) {
    return Math.random() * (max - min) + min;
};

var randomInt = function (xmin, xmax) {
    return Math.floor(Math.random() * (xmax + 1 - xmin) + xmin);
};

var moveLeft = function (sp) {
    var _size = sp.getContentSize();
    var delay = randomFloat(0.3, 1.0);
    var timeMove = randomFloat(1.3, 2.2);
    var func = cc.callFunc(function (sp) {
        sp.stopAllActions();
    }.bind(sp));
    var sequence = cc.sequence(cc.delayTime(delay), cc.EaseBackOut(cc.moveTo(timeMove, cc.p(-_size.width, sp.getPositionY()))), func);
    return sequence;
};

var moveRight = function (sp) {
    var _size = sp.getContentSize();
    var delay = randomFloat(0.3, 1.0);
    var timeMove = randomFloat(1.3, 2.2);
    var func = cc.callFunc(function (sp) {
        sp.stopAllActions();
    }.bind(sp));
    var sequence = cc.sequence(cc.delayTime(delay), cc.EaseBackOut(cc.moveTo(timeMove, cc.p(cc.winSize.width + _size.width, sp.getPositionY()))), func);
    return sequence;
};

var rotateLeaf = function (sp) {
    return cc.sequence(
        cc.spawn(
            cc.rotateTo(0.4, randomInt(2, 4)),
            cc.moveTo(0.4, cc.p(sp.getPositionX(), sp.getPositionY() - randomInt(2, 5)))
        ),
        cc.spawn(
            cc.rotateTo(0.4, randomInt(-2, -4)),
            cc.moveTo(0.4, cc.p(sp.getPositionX(), sp.getPositionY() + randomInt(2, 5)))
        )
    );
};

var StarLight = cc.Class.extend({
    ctor: function (star, rnd) {
        this.star = star;
        if (rnd === undefined) rnd = true;
        this.random = rnd;
        this.doLoop();
        this.bindCallback = cc.callFunc(this.doLoop.bind(this));
    },
    doLoop: function () {
        if (this.random) {
            this.star.setPositionX(randomInt(100, 1000));
            this.star.setPositionY(randomInt(50, 700));
        }
        this.scale = randomFloat(0.2, 0.3);
        this.star.setOpacity(0);
        this.star.setScale(0);
        this.fadeValue = randomInt(200, 255);
        this.timeDelay = randomFloat(0.5, 2.0);
        this.timeDelay2 = randomFloat(0.3, 0.5);
        this.showTime = randomFloat(0.2, 0.5);
        this.hideTime = randomFloat(0.2, 0.5);
    },
    RunAction: function () {
        this.star.runAction(cc.sequence(cc.delayTime(this.timeDelay), cc.spawn(cc.scaleTo(this.showTime, this.scale, this.scale), cc.fadeTo(this.showTime, this.fadeValue)),
            cc.delayTime(this.timeDelay2), cc.spawn(cc.scaleTo(this.hideTime, 0, 0), cc.fadeTo(this.hideTime, 0)),
            this.bindCallback).repeatForever());
    }
});

/**
 * CELL VIEW LUCKY
 */
var LuckyCardCellCheat = cc.TableViewCell.extend({
    ctor: function () {
        this._super();
    },

    setCard: function (id) {
        this.removeAllChildren();

        var img = cc.Sprite.create(luckyCard.getItemImage(id));
        img.setScale(0.5);
        this.addChild(img);
        img.setPosition(img.getContentSize().width / 4, img.getContentSize().height / 4);
    }
});

var LuckyCardCollectionItem = cc.TableViewCell.extend({
    ctor: function (p) {
        this.guiParent = p;

        this.panel = [];

        this.startClickY = 0;

        this._super();
        var jsonLayout = ccs.load("res/Event/LuckyCard/LuckyCardCollectItem.json");
        this._layout = jsonLayout.node;
        this._layout.setContentSize(this._layout.getContentSize().width, this._layout.getContentSize().height);
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.initCell();
    },

    initCell: function () {
        this.imgBG = ccui.Helper.seekWidgetByName(this._layout, "imgBG");
        this.txtName = ccui.Helper.seekWidgetByName(this.imgBG, "txtName");
        this.gifts = [];
        for (var i = 0; i < 4; i++) {
            var pGift = ccui.Helper.seekWidgetByName(this.imgBG, "gift" + i);
            pGift.gift = ccui.Helper.seekWidgetByName(pGift, "gift");
            this.gifts.push(pGift);
        }
        this.numGifts = ccui.Helper.seekWidgetByName(this.imgBG, "numGifts");
        this.numGifts.txt = ccui.Helper.seekWidgetByName(this.numGifts, "txtGifts");
        this.btnGet = ccui.Helper.seekWidgetByName(this.imgBG, "btnGet");
        this.btnGet.setPressedActionEnabled(true);
        this.btnGet.addTouchEventListener(this.onButtonPressed, this);
        this.btnGet.setSwallowTouches(false);

        this.bgNum = ccui.Helper.seekWidgetByName(this.imgBG, "bgNum");
        this.bgNum.txt = ccui.Helper.seekWidgetByName(this.bgNum, "txtNum");

        this.info = null;
    },

    setInfo: function (idx) {

        var giftInfo = luckyCard.gifts[luckyCard.gifts.length - 1 - idx];
        cc.log("IDX " + idx + " DATA " + JSON.stringify(giftInfo));
        if (giftInfo) {
            this.txtName.setString(StringUtility.subStringTextLength(luckyCard.getItemName(giftInfo.id), 15));
            this.info = giftInfo;
            if (giftInfo.gift > 0) {
                this.bgNum.txt.setString(StringUtility.pointNumber(giftInfo.gift));
                for (var i = 0; i < 4; i++) {
                    this.gifts[i].loadTexture("res/Event/LuckyCard/WishStar/bgPiece.png");
                    this.gifts[i].gift.setVisible(true);
                    this.gifts[i].gift.loadTexture(luckyCard.getItemImage(giftInfo.id));
                }
            } else {
                for (var i = 0; i < 4; i++) {
                    this.gifts[i].loadTexture("res/Event/LuckyCard/WishStar/bgPieceBlank.png");
                    this.gifts[i].gift.setVisible(false);
                }
                for (var i = 0; i < giftInfo.item.length; i++) {
                    var index = parseInt(giftInfo.item[i]);
                    this.gifts[index].loadTexture("res/Event/LuckyCard/WishStar/bgPiece.png");
                    this.gifts[index].gift.setVisible(true);
                    this.gifts[index].gift.loadTexture(luckyCard.getItemImage(giftInfo.id));
                }
            }
            this.numGifts.txt.setString((giftInfo.item.length + 4 * giftInfo.gift) + "/4");
            this.btnGet.setVisible(giftInfo.gift > 0);
            this.bgNum.setVisible(giftInfo.gift > 0);
        }
        cc.log("giftInfo", JSON.stringify(giftInfo));
    },

    onButtonPressed: function (sender, type) {
        if (type == ccui.Widget.TOUCH_BEGAN) {
            this.startClickY = sender.getParent().convertToWorldSpace(sender.getPosition()).y;
        }
        if (type == ccui.Widget.TOUCH_ENDED) {
            var endY = sender.getParent().convertToWorldSpace(sender.getPosition()).y;
            if (Math.abs(endY - this.startClickY) < 5)
                this.guiParent.onClickItem(this.info);
        }
    }
});

var LuckyCardCollectItemFlashNode = cc.Node.extend({
    ctor: function (p, size) {
        this._super();
        this.guiParent = p;
        this.size = size;
        this.view = null;
        this.initGUI();
    },

    initGUI: function () {
        this.view = new cc.TableView(this, this.size);
        this.view.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.view.setPosition(5, 0);
        this.view.reloadData();
        this.addChild(this.view);
        this.view.setVisible(true);
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(60, 100);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new LuckyCardCollectItemFlashUI(this);
        }
        cc.log("COLLECTION FLASH GUI UPDATE: " + idx);
        cell.setInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return luckyCard.gifts.length;
    },

    reloadTable: function () {
        //  luckyCard.sortGifts(true);
        this.view.reloadData();
    }
});

var LuckyCardCollectItemFlashUI = cc.TableViewCell.extend({
    ctor: function (p) {
        this.guiParent = p;
        this.startClickY = 0;

        this.panel = [];

        this._super();
        var jsonLayout = ccs.load("res/Event/LuckyCard/LuckyCardCollectItemFlashUI.json");
        this._layout = jsonLayout.node;
        this._layout.setContentSize(this._layout.getContentSize().width, this._layout.getContentSize().height);
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.initCell();
    },

    initCell: function () {
        this.imgBG = ccui.Helper.seekWidgetByName(this._layout, "imgBG");
        this.pGet = [];
        for (var i = 0; i < 4; i++) {
            var p = ccui.Helper.seekWidgetByName(this.imgBG, "p" + i);
            this.pGet.push(p);
        }
        this.txtName = ccui.Helper.seekWidgetByName(this.imgBG, "txtName");
        this.gift = ccui.Helper.seekWidgetByName(this.imgBG, "gift");

        this.bgNum = ccui.Helper.seekWidgetByName(this.imgBG, "bgNum");
        this.bgNum.txt = ccui.Helper.seekWidgetByName(this.bgNum, "txtNum");
    },

    setInfo: function (idx) {
        //return;
        var giftInfo = luckyCard.gifts[idx];
        if (giftInfo) {
            this.removeGift();
            this.txtName.setString(StringUtility.subStringTextLength(luckyCard.getItemName(giftInfo.id), 13));
            var items = cc.Sprite.create(luckyCard.getItemImage(giftInfo.id));
            items.setTag(9999);
            items.setScale(this.gift.width / items.width);
            items.setPosition(this.gift.getContentSize().width / 2, this.gift.getContentSize().height / 2);
            this.gift.addChild(items);
            if (giftInfo.gift > 0) {
                this.gift.setOpacity(255);
                for (var i = 0; i < 4; i++)
                    this.pGet[i].setVisible(true);
                this.bgNum.setVisible(true);
                this.bgNum.txt.setString(StringUtility.pointNumber(giftInfo.gift));
            } else {
                this.gift.setOpacity(100);
                for (var i = 0; i < 4; i++)
                    this.pGet[i].setVisible(false);
                for (var i = 0; i < giftInfo.item.length; i++) {
                    var num = parseInt(giftInfo.item[i]);
                    this.pGet[num].setVisible(true);
                }
                this.bgNum.setVisible(false);
            }
        }
    },

    removeGift: function () {
        var g = this.gift.getChildByTag(9999);
        if (g)
            g.removeFromParent(true);
    }
});

var MoveJelly = cc.Class.extend({
    ctor: function (force, jellyNode, loop) {
        this.loop = loop;
        this.direct = 1; // 1:down, 2:Up
        this.setTarget(jellyNode, force);
    },
    setTarget: function (jellyNode, force) {
        this.defaultPos = jellyNode.getPosition();
        this.deltaY = randomInt(0, 5);
        this.posY = jellyNode.getPositionY() + this.deltaY;
        this.posX = jellyNode.getPositionX();
        this.force = force;
        this.scaleX = jellyNode.getScaleX();
        this.scaleY = jellyNode.getScaleY();
        this.forceX = this.scaleX + this.force;
        this.forceY = this.scaleY - this.force;
        this.jellyNode = jellyNode;
    },
    setScale: function (_scaleX, _scaleY) {
        this.scaleX = _scaleX;
        this.scaleY = _scaleY;
        this.forceX = this.scaleX + this.force;
        this.forceY = this.scaleY - this.force;
    },
    doJelly: function () {
        this.bindCallback = cc.callFunc(this.doLoop.bind(this));
        this.loop = true;
        this.reset();
    },
    pause: function () {
        this.loop = false;
        this.jellyNode.stopAllActions();
    },
    reset: function () {
        this.forceX = this.scaleX + this.force;
        this.forceY = this.scaleY - this.force;
        this.direct = 1; // 1:down, 2:Up
        this.RunAction(this.forceX, this.forceY, this.posX, this.posY);
    },
    RunAction: function (scaleX, scaleY, posX, posY) {
        this.jellyNode.runAction(cc.sequence(cc.spawn(cc.scaleTo(0.25, scaleX, scaleY), cc.moveTo(0.15, cc.p(posX, posY))), this.bindCallback));
    },
    doLoop: function () {
        this.forceX -= randomFloat(0.005, 0.01);
        this.forceY += randomFloat(0.005, 0.01);
        if (this.jellyNode.getPositionY() > this.defaultPos.y)
            this.posY = this.jellyNode.getPositionY() - this.deltaY;
        else
            this.posY = this.jellyNode.getPositionY() + this.deltaY;
        if (this.forceX > this.scaleX || this.forceY < this.scaleY) {
            if (this.direct == 1) {
                this.direct = 2;
                this.RunAction(this.forceY, this.forceX, this.posX, this.posY);
            } else {
                this.direct = 1;
                this.RunAction(this.forceX, this.forceY, this.posX, this.posY);
            }
        } else {
            if (this.loop)
                this.reset(); //loop
            else {
                this.jellyNode.setScale(this.scaleX, this.scaleY);
                this.jellyNode.setPosition(this.defaultPos);
            }

        }
    }
});

var MoveStar = cc.Class.extend({
    ctor: function (star, index) {
        var random_int = function (xmin, xmax) {
            return Math.floor(Math.random() * (xmax + 1 - xmin) + xmin);
        };
        this.curFrm = random_int(0, 8);
        this.star = star;
        this.listStar = [];
        this.moc = 0;
        this.loop = true;
        for (var i = 0; i < 9; i++)
            this.listStar.push("res/Event/LuckyCard/WishStar/Star/star" + i + ".png");
    },
    rotate: function () {
        this.star.setTexture(this.listStar[0]);
        //this.star.setVisible(true);
        this.loop = true;

        this.bindCallback = this.doSchedule.bind(this);
        this.star.unschedule(this.bindCallback);
        this.star.schedule(this.bindCallback, 0, cc.REPEAT_FOREVER, 0);
    },
    rotateTo: function () {
        this.loop = false;
        this.curFrm = 3;
    },
    pause: function () {
        this.loop = false;
        this.curFrm = 2;
        this.star.setTexture(this.listStar[this.curFrm]);
    },
    continueRotate: function () {
        this.loop = true;
    },
    doSchedule: function (dt) {
        this.moc += dt;
        if (this.moc >= 0.05) {
            this.moc = 0;
            if (!this.loop)
                if (this.curFrm == 2)
                    return;
            this.curFrm++;
            if (this.curFrm > 8)
                this.curFrm = 0;
            if (!this.loop && this.curFrm == 2)
                this.star.setTexture("res/Event/LuckyCard/WishStar/star_00.png");
            else
                this.star.setTexture(this.listStar[this.curFrm]);
        }
    },
    stop: function () {
        this.star.unschedule(this.bindCallback);
        this.star.setTexture("res/Event/LuckyCard/WishStar/star_00.png");
    }
});

var LuckyCardObject = cc.Node.extend({
    ctor: function (itemId, justPrize) {
        this._super();

        this._layout = ccs.load("res/Event/LuckyCard/LuckyCardObject.json").node;
        this.addChild(this._layout);

        this.index = -1;
        this.hasDroped = false;

        this.luckyCard = this._layout.getChildByName("luckyCard");

        this.luckyCard.prize = this.luckyCard.getChildByName("prize");
        this.luckyCard.prize.setScale(LuckyCardObject.PRIZE_SCALE);
        this.luckyCard.prize.image = this.luckyCard.prize.getChildByName("image");
        this.luckyCard.prize.label = this.luckyCard.prize.getChildByName("label");
        this.luckyCard.prize.label.defaultPos = this.luckyCard.prize.label.getPosition();
        this.luckyCard.prize.bg = this.luckyCard.prize.getChildByName("bg");
        this.inGameParticle = this.luckyCard.prize.getChildByName("prizeParticle");
        this.inGameParticle.setVisible(false);
        this.setPrize(itemId);

        if (!justPrize) {
            this.luckyCard.default = cc.Sprite.create("res/Event/LuckyCard/WishStar/Star/star2.png");
            this.luckyCard.default.setAnchorPoint(0.5, 0.5);
            this.luckyCard.default.setPosition(cc.p(0, 0));
            this.luckyCard.addChild(this.luckyCard.default);

            this.luckyCard.explode = cc.Sprite.create("res/Event/LuckyCard/WishStar/Bong-bong-sao.png");
            this.luckyCard.explode.setPosition(cc.p(0, 0));
            this.luckyCard.explode.setScale(LuckyCardObject.EXPLODE_SCALE);
            this.luckyCard.explode.setLocalZOrder(-1);
            this.luckyCard.addChild(this.luckyCard.explode);

            this.moveStar = new MoveStar(this.luckyCard.default);
            this.moveJelly = new MoveJelly(0.08, this.luckyCard.explode, true);

            var i = 0;
            this.listJellys = [];
            for (i = 0; i < 4; i++) {
                var efxJelly = new MoveJelly(0.08, this.luckyCard.explode, true);
                this.listJellys.push(efxJelly);
            }
            this.listBall = [];
            this.posBall = [cc.p(60, 60), cc.p(30, -80), cc.p(-70, -60), cc.p(-50, 40)];
            var scale = [0.45, 0.6, 0.5, 0.75];
            for (i = 0; i < 4; i++) {
                var ball = cc.Sprite("res/Event/LuckyCard/WishStar/ballJelly.png");
                ball.setPosition(this.posBall[i]);
                ball.setScale(scale[i]);
                ball.setVisible(false);
                this.luckyCard.addChild(ball, i - 1);
                this.listBall.push(ball);
            }
        } else {
            this.showPrizeOnly();
        }
    },

    scaleIndex: function (time) {
        if (!time) time = 0;
        this.runAction(cc.scaleTo(time, LuckyCardObject.SCALE_INDEX[this.index] * LuckyCardObject.CONVERT_BIG_TO_SMALL));
        this.setLocalZOrder(LuckyCardObject.ORDER_INDEX[this.index]);
    },

    resetState: function (index, pos) {
        this.index = index;
        this.setPosition(pos);
        this.stopJelly();
        this.moveStar.stop();
        this.moveStar.rotate();

        this._layout.setOpacity(0);
        this._layout.setRotation(0);

        this.stopAllActions();

        this.hasDroped = false;

        this.luckyCard.setRotation(0);
        this.luckyCard.setOpacity(255);
        this.luckyCard.setPosition(cc.p(0, 0));
        this.luckyCard.setScale(1);
        //
        this.luckyCard.default.setOpacity(255);
        this.luckyCard.default.setScale(0.9);
        this.luckyCard.default.setPosition(cc.p(0, 0));
        //
        this.luckyCard.explode.setVisible(false);
        this.luckyCard.explode.setOpacity(255);
        this.luckyCard.explode.setScale(LuckyCardObject.EXPLODE_SCALE);
        this.luckyCard.explode.setRotation(0);
        this.luckyCard.explode.setPosition(cc.p(0, 0));
        //
        this.luckyCard.prize.setVisible(true);
        this.luckyCard.prize.setOpacity(0);

        this.showFirst = this.index < LuckyCardScene.CARD_OPEN;
    },

    showPrizeOnly: function () {
        this._layout.setOpacity(255);
        this._layout.setVisible(true);
        this.luckyCard.prize.setVisible(true);
        this.luckyCard.prize.label.setVisible(true);

        //Add effect and particle
        this.outGameImage = cc.Sprite("res/Event/LuckyCard/WishStar/bgPiece.png");
        this.luckyCard.prize.addChild(this.outGameImage);
        this.outGameImage.setPosition(this.luckyCard.prize.bg.getPosition());
        this.outGameImage.setVisible(false);
        this.outGameImage.setLocalZOrder(-1);
        this.outGameImage.orgScaleY = 145 / 165;
        //
    },

    moveCardXtreme: function (pos, timeMove) {
        this.prepareStateXtreme();

        if (this.index >= LuckyCardScene.CARD_OPEN && !this.showFirst) {
            if (this.index == LuckyCardScene.CARD_OPEN) this.changeStateXtreme();
            return;
        }

        // var timeRotate = timeMove / 4;
        // this._layout.runAction(cc.sequence(
        //     cc.rotateTo(timeRotate, 25).easing(cc.easeCubicActionOut()),
        //     cc.delayTime(timeMove - timeRotate),
        //     cc.rotateTo(1, 0).easing(cc.easeElasticOut())
        // ));

        this.scaleIndex(timeMove);
        this.runAction(cc.sequence(
            cc.moveTo(timeMove, pos).easing(cc.easeBackOut()),
            cc.callFunc(function () {
                this.changeStateXtreme();
            }.bind(this))
        ));
    },

    startJelly: function () {
        this.moveStar.pause();
        this.moveJelly.doJelly();

        for (var i = 0; i < this.listBall.length; i++) {
            var ball = this.listBall[i];
            ball.setVisible(true);
            ball.setPosition(this.posBall[i]);
            this.listJellys[i].setTarget(ball, randomFloat(0.06, 0.10));
            ball.runAction(cc.sequence(cc.delayTime(randomFloat(0.05, 0.1)), cc.callFunc(function (i) {
                this.listJellys[i].doJelly();
            }.bind(this, i))));
        }
    },

    stopJelly: function () {
        this.moveJelly.pause();
        this.removeBalls();
    },

    removeBalls: function () {
        if (this.listBall) {
            for (var i = 0; i < this.listBall.length; i++) {
                this.listJellys[i].pause();
                this.listBall[i].setVisible(false);
            }
        }
    },

    playEfxBubble: function () {
        for (var i = 0; i < 4; i++) {
            var pos = this.posBall[i];

            var eff = db.DBCCFactory.getInstance().buildArmatureNode("Nobong");
            if (eff) {
                this.luckyCard.addChild(eff, 100);
                eff.setPosition(pos);
                eff.setScale(LuckyCardObject.CONVERT_BIG_TO_SMALL);
                eff.setVisible(false);
                eff.runAction(
                    cc.sequence(
                        cc.delayTime(randomFloat(0.2, 0.5)),
                        cc.callFunc(function (sender) {
                                sender.setVisible(true);
                                sender.getAnimation().gotoAndPlay("1", -1, -1, 1);
                                sender.setCompleteListener(function (anim) {
                                        anim.runAction(cc.sequence(cc.removeSelf()));
                                    }.bind(sender)
                                );
                            }.bind(eff)
                        )
                    )
                );
            }
        }
        this.runAction(
            cc.sequence(
                cc.delayTime(randomFloat(0.2, 0.5)),
                cc.callFunc(function (sender) {
                        this.luckyCard.explode.setVisible(false);
                        this.luckyCard.prize.setVisible(false);
                        this.removeBalls();
                    }.bind(this)
                )
            )
        );
    },

    moveCard: function (pos, generateItem, timeMove) {
        this.prepareState();

        this.scaleIndex(timeMove);

        if (this.index === LuckyCardScene.CARD_OPEN) {
            cc.log("prize id: ", generateItem);
            this.setPrize(generateItem);
        }

        this.runAction(cc.sequence(
            cc.moveTo(timeMove, pos),
            cc.callFunc(function () {
                this.changeState();
            }.bind(this))
        ));
    },

    prepareStateXtreme: function () {
        if (this.index == 0) this.showFirst = true;
        if (this.index == LuckyCardScene.CARD_OPEN) this.showFirst = false;
        if (this.index > 0 && this.showFirst)
            this._layout.runAction(cc.fadeIn(LuckyCardScene.TIME_MOVE_XTREME));
        else if (this.index == 0)
            this._layout.setOpacity(0);
        this.setVisible(true);
    },

    prepareState: function () {
        if (this.index == 0) this.showFirst = true;
        if (this.index > 0 && this.showFirst) this._layout.runAction(cc.fadeIn(LuckyCardScene.TIME_MOVE));
        else this._layout.setOpacity(0);
        this.setVisible(true);

        //this.luckyCard.default.setOpacity(this.index < 6 ? 255 : 0);
        //this.luckyCard.prize.setOpacity((this.index > 5 && !this.hasDroped) ? 255 : 0);
    },

    changeStateXtreme: function () {
        switch (this.index) {
            case LuckyCardScene.CARD_OPEN:
            case LuckyCardScene.CARD_OPEN - 1:
                //Jump down the pot
                this.luckyCardDrop(LuckyCardScene.TIME_MOVE_XTREME * 2);
                break;
            case LuckyCardScene.NUM_CARD - 1:
            case 0:
                this.resetState(this.index, this.getPosition());
                break;
        }
    },

    changeState: function () {
        switch (this.index) {
            case LuckyCardScene.CARD_OPEN - 1:
                //Do some cool effect
                break;
            case LuckyCardScene.CARD_OPEN:
                this.showPrize();
                break;
            case LuckyCardScene.NUM_CARD - 2:
                this.destroyPrize();
                break;
            case 0:
                this.resetState(this.index, this.getPosition());
                break;
        }
    },

    luckyCardDrop: function (time, parent) {
        if (this.hasDroped) return;

        this.hasDroped = true;
        this.luckyCard.runAction(cc.spawn(
            cc.sequence(
                cc.delayTime(time - 0.05),
                cc.fadeOut(0.15)
            )
        ));
    },

    showPrize: function () {
        if (this.hasDroped) return;
        this.luckyCard.default.runAction(
            cc.sequence(
                cc.delayTime(0.1),
                cc.fadeOut(0.15)
            )
        );
        this.luckyCard.explode.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.show(),
            cc.callFunc(function () {
                this.startJelly();
            }.bind(this))
        ));

        this.luckyCard.prize.runAction(
            cc.sequence(
                cc.delayTime(0.2),
                cc.show(),
                cc.fadeIn(0.1)
            )
        );
    },

    destroyPrize: function () {
        if (this.hasDroped) return;
        this.playEfxBubble();
    },

    setPrize: function (itemId) {
        if (!itemId) itemId = 0;

        this.itemId = itemId;
        this.luckyCard.prize.image.loadTexture(luckyCard.getItemImage(itemId), ccui.Widget.LOCAL_TEXTURE);
        this.luckyCard.prize.bg.setVisible(luckyCard.isItemStored(itemId));
        if (this.outGameImage) this.outGameImage.setVisible(false);

        this.luckyCard.prize.label.setPosition(this.luckyCard.prize.label.defaultPos);
        this.luckyCard.prize.label.setVisible(false);
        if (!luckyCard.isItemStored(itemId)) {
            var value = luckyCard.getItemValue(itemId);
            this.luckyCard.prize.label.setString(isNaN(value) ? "" : StringUtility.formatNumberSymbol(value));
            this.luckyCard.prize.label.y += 25;
        } else {
            this.luckyCard.prize.label.setString(StringUtility.subStringTextLength(luckyCard.getItemName(itemId), 30));
        }
    },

    setLabelText: function (string) {
        this.luckyCard.prize.label.setString(string);
    }
});
LuckyCardObject.SCALE_INDEX = [0.65, 0.8, 1.0, 1.3, 1.6, 1.3, 1.0, 0.8];
LuckyCardObject.ORDER_INDEX = [0, 1, 2, 3, 4, 3, 2, 1];
LuckyCardObject.COLOR_INDEX = [
    cc.color(0, 0, 0),
    cc.color(30, 55, 90),
    cc.color(65, 95, 130),
    cc.color(115, 145, 185),
    cc.color(255, 255, 255),
    cc.color(255, 255, 255),
    cc.color(255, 255, 255),
    cc.color(255, 255, 255)
];
LuckyCardObject.EXPLODE_SCALE = 0.8;
LuckyCardObject.PRIZE_SCALE = 0.65;
LuckyCardObject.CONVERT_BIG_TO_SMALL = 0.67;
LuckyCardObject.FLAP_WING_TIME = 0.25 * 2;
LuckyCardObject.FLAP_TAG = 0;
LuckyCardObject.ACTION_MOVE_CARD = 0;

/**
 * SCENE AND GUI LUCKY
 */
var LuckyCardScene = BaseLayer.extend({
    ctor: function () {
        // effect card
        this.timeDelayChange = 0;
        this.timeMaxDelay = 0;

        this.isRunningXtreme = false;
        this.countRunningXtreme = 0;

        this.isMoving = false;
        this.isWaitingLucky = false;
        this.typeLucky = -1;

        this.isWaitingResult = false;
        this.isWaitingShowResult = false;
        this.isWaitingCloseResult = false;
        this.cmdResult = null;

        this.pEffect = null;

        this.lights = [];
        this.effectCircle = null;
        this.timeDelayChangeLight = 0;

        this.tutorial = null;
        this.tutorial1 = null;

        this.isEffectMoney = 0;
        this.curEffectMoney = 0;
        this.deltaEffectMoney = 0;

        // user info
        this.lbGold = null;
        this.lbCoin = null;
        this.lbCoinProgress = null;

        this.lbTimeRemain = null;

        this.btnNormal = null;
        this.btnNormalXtreme = null;

        this.costImage = null;

        this.machine = null;

        // tutorial
        this.isTutorial = true;
        this.isTutorial1 = false;

        //metric log
        this.metric = {};
        this.resetMetric();

        this.freeCoin = null;

        this._super(LuckyCardScene.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardScene.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");

        var pInfo = this.getControl("pInfo");
        var bgAvatar = this.getControl("bgAvatar", pInfo);
        this._uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png");
        this._uiAvatar.setPosition(cc.p(bgAvatar.x, bgAvatar.y));
        this._uiAvatar.setScale(bgAvatar.width / (this._uiAvatar.clipping.stencil.width) - 0.05);
        pInfo.addChild(this._uiAvatar, -1);

        var machine = this.getControl("machine");
        this.machine = machine;
        this.machine.Pos = machine.getPosition();
        this.machine.effectPanel = this.getControl("coinEffectPanel", this.machine);
        this.btnCollection = this.getControl("btnCollection");
        this.btnCollection.Pos = this.btnCollection.getPosition();

        this.fox = this.getControl("posFox", this.machine);
        this.fox.defaultPos = this.fox.getPosition();

        this.lbGold = this.getControl("gold", this.getControl("bgGoldCurr", pInfo));
        this.lbCoin = this.getControl("numCoin", this.getControl("numCoinInfo", machine));

        this.effectCircle = this.getControl("effectCircle", machine);
        this.effectCircle.setOpacity(200);
        // this.effectCircle.setScale(0.8);

        this.wallPos = this.getControl("wallPos", machine).getPosition();

        this.tutorial = this.getControl("tutorial", this.btnCollection);
        this.tutorial.circle = this.getControl("circle", this.tutorial);
        this.tutorial.hand = this.getControl("hand", this.tutorial);
        this.tutorial.hand.pos = this.tutorial.hand.getPosition();
        this.tutorial.setVisible(false);
        this.tutorial.setLocalZOrder(99);

        var p = this.getControl("posItem", this.btnCollection);
        this.desPos = this.btnCollection.convertToWorldSpace(p.getPosition());

        var bgTime = this.getControl("bgTime", bg);
        this.lbTimeRemain1 = this.getControl("txt1", bgTime);
        this.lbTimeRemain1.setString(LocalizedString.to("LUCKYCARD_INFO_TIME_LEFT_1"));
        this.lbTimeRemain = this.getControl("time_remain", bgTime);
        this.btnShop = this.customButton("btnShop", LuckyCardScene.BTN_SHOP);
        this.btnShop.setVisible(false);
        this.customButton("btnAddGold", LuckyCardScene.BTN_ADD_GOLD, this.getControl("bgGoldCurr", pInfo));
        this.customButton("btnClose", LuckyCardScene.BTN_CLOSE);
        this.customButton("btnHelp", LuckyCardScene.BTN_HELP);
        this.customButton("btnHist", LuckyCardScene.BTN_HISTORY);
        this.btnTop = this.customButton("btnTop", LuckyCardScene.BTN_TOP);
        this.btnTop.setVisible(false);
        this.customButton("btnDetail", LuckyCardScene.BTN_COLLECTION, this.btnCollection);

        //btn metric
        this.customButton("btnFox", LuckyCardScene.BTN_METRIC_FOG, this.machine);
        this.customButton("btnStar", LuckyCardScene.BTN_METRIC_STAR, this.machine);
        //

        //var effect;
        this.btnNormal = this.customButton("btn1", LuckyCardScene.BTN_NORMAL, machine);
        this.btnNormal.setCascadeOpacityEnabled(false);
        this.btnNormal.setCascadeColorEnabled(true);
        //this.btnNormal.setOpacity(0);

        this.btnNormalXtreme = this.customButton("btn10", LuckyCardScene.BTN_NORMAL_XTREME, machine);
        this.btnNormalXtreme.setCascadeOpacityEnabled(false);
        this.btnNormalXtreme.setCascadeColorEnabled(true);
        //this.btnNormalXtreme.setOpacity(0);

        this.lbNumTicket = this.getControl("lbKeyCoin", machine);

        var panel = this.getControl("panel", machine);

        this.tutorial1 = this.getControl("tutorial1", this.getControl("btn1", machine));
        this.tutorial1.circle = this.getControl("circle", this.tutorial1);
        this.tutorial1.hand = this.getControl("hand", this.tutorial1);
        this.tutorial1.hand.pos = this.tutorial1.hand.getPosition();
        this.tutorial1.setVisible(false);
        this.tutorial1.setLocalZOrder(99);

        this.pEffect = this.getControl("effect");

        this.pos = [];
        for (var i = 0; i < LuckyCardScene.NUM_CARD; i++) {
            this.pos.push(this.getControl("p" + i, panel).getPosition());
        }

        this.cards = [];
        for (var i = 0; i < LuckyCardScene.NUM_CARD; i++) {
            var card = new LuckyCardObject();
            panel.addChild(card);
            this.cards.push(card);
        }

        this.timeDelayChange = LuckyCardScene.TIME_DELAY;
        this.isRunningXtreme = false;

        //btnCollection
        var pView = this.getControl("panelList", this.btnCollection);
        this.view = new LuckyCardCollectItemFlashNode(this, pView.getContentSize());
        this.btnCollection.addChild(this.view);
        this.view.setPosition(pView.getPosition());
        this.view.reloadTable();
        pView.setVisible(false);

        var listenerView = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                var taget = event.getCurrentTarget();
                var localNode = taget.convertToNodeSpace(touch.getLocation());
                var s = taget.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, localNode)) this.locationNodeBegin = localNode;
                return true;
            },
            onTouchMoved: function (touch, event) {
            },
            onTouchEnded: function (touch, event) {
                var taget = event.getCurrentTarget();
                var locationNodeEnd = taget.convertToNodeSpace(touch.getLocation());
                var s = taget.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationNodeEnd) && this.locationNodeBegin) {
                    if ((this.locationNodeBegin.x - locationNodeEnd.x) *
                        (this.locationNodeBegin.x - locationNodeEnd.x) +
                        (this.locationNodeBegin.y - locationNodeEnd.y) *
                        (this.locationNodeBegin.y - locationNodeEnd.y) < 5) {
                        if (luckyCard.isInGUIEvent() && luckyCard.luckyCardScene.metric) {
                            luckyCard.luckyCardScene.metric.touchCollection++;
                            cc.log("METRIC", JSON.stringify(luckyCard.luckyCardScene.metric));
                        }
                        sceneMgr.openGUI(LuckyCardCollectionGUI.className, LuckyCard.GUI_COLLECTION, LuckyCard.GUI_COLLECTION);
                    }
                }
            }
        });
        var pListView = pView.clone();
        pListView.setPosition(pView.getPosition());
        pListView.setVisible(true);
        cc.eventManager.addListener(listenerView, pListView);

        this.btnCollection.addChild(pListView);
        // init cheat panel
        this.pCheat = this.getControl("pCheat");
        this.pCheat.pos = this.pCheat.getPosition();
        //this.pCheat.setVisible(true);

        this.txItem = this.getControl("name", this.pCheat);
        this.txNum = this.getControl("num", this.pCheat);
        this.txNumRoll = this.getControl("numRoll", this.pCheat);
        this.customButton("cheat_item", LuckyCardScene.BTN_CHEAT_ITEM, this.pCheat);
        this.txCoin = this.getControl("coin", this.pCheat);
        this.txExp = this.getControl("exp", this.pCheat);
        this.customButton("cheat_coin", LuckyCardScene.BTN_CHEAT_COIN, this.pCheat);
        this.customButton("cheat_coin_free", LuckyCardScene.BTN_CHEAT_COIN_FREE, this.pCheat);
        this.customButton("show_cheat_list", LuckyCardScene.BTN_SHOW_CHEAT_LIST, this.pCheat);
        this.customButton("cheat_reset_data", LuckyCardScene.BTN_CHEAT_RESET_DATA, this.pCheat);
        this.customButton("btnNumRoll", LuckyCardScene.BTN_CHEAT_NUM_ROLL, this.pCheat);
        this.txGServer = this.getControl("txGServer", this.pCheat);
        this.txGUser = this.getControl("txGUser", this.pCheat);
        this.lbGServer = this.getControl("g_server", this.pCheat);
        this.lbGUser = this.getControl("g_user", this.pCheat);
        this.customButton("cheat_g_server", LuckyCardScene.BTN_CHEAT_G_SERVER, this.pCheat);
        this.customButton("close", LuckyCardScene.BTN_SHOW_HIDE_CHEAT, this.pCheat);

        var cheatList = this.getControl("list", this.pCheat);

        this.viewCheatList = new cc.TableView(this, cheatList.getContentSize());
        this.viewCheatList.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.viewCheatList.setVerticalFillOrder(1);
        this.viewCheatList.setDelegate(this);
        this.viewCheatList.reloadData();
        cheatList.addChild(this.viewCheatList);

        this.visibleCheat();
        this.showHideCheat();

        // other config
        this.setBackEnable(true);

        this.pEfxIntro = this.getControl("pEfxIntro");
        var pIntro = this.getControl("pIntro");
        this.listIntro = [];
        for (var i = 0; i < 15; i++) {
            var intro = this.getControl("img" + i, pIntro);
            this.listIntro.push(intro);
            this.listIntro[i].pos = intro.getPosition();
        }

        this.initEffectShop();
        this.addEffectFox();
    },

    initEffectShop: function () {
        this.btnShop.bonus = this.getControl("bonus", this.btnShop);
        this.btnShop.effect = this.getControl("bg").getChildByName("effectShop");
    },

    initStarLight: function () {
        if (this.listStar) {
            while (this.listStar.length > 0) {
                this.listStar[0].removeFromParent(true);
                this.listStar.shift();
            }
        }
        this.listStar = [];
        var bg = this.getControl("bg");
        for (var i = 0; i < 10; i++) {
            var star = cc.Sprite("res/Event/LuckyCard/WishStar/lightstar.png");
            bg.addChild(star);
            var starLight = new StarLight(star, true);
            starLight.RunAction();
            this.listStar.push(star);
        }
    },

    foxAnimationControl: function () {
        switch (this.efxFox.status) {
            case LuckyCardScene.FOX_TAKE_OFF:
                this.playEfxFox(LuckyCardScene.FOX_IDLE, 3);
                break;
            case LuckyCardScene.FOX_THROW:
                this.playEfxFox(LuckyCardScene.FOX_IDLE, 0);
                break;
        }
    },

    addEffectFox: function () {
        this.efxFox = db.DBCCFactory.getInstance().buildArmatureNode("cao_nemxu");
        if (this.efxFox) {
            this.fox.addChild(this.efxFox);
            this.efxFox.setScale(LuckyCardObject.CONVERT_BIG_TO_SMALL);
            this.efxFox.setPosition(25, -7);
            this.playEfxFox(LuckyCardScene.FOX_IDLE, 0);
            this.efxFox.setCompleteListener(this.foxAnimationControl.bind(this));
        }
    },

    onEnterFinish: function () {
        this.schedule(this.update, 0.01);

        this.isRunningXtreme = false;
        this.isWaitingLucky = false;

        this.typeLucky = -1;

        this.isWaitingResult = false;
        this.isWaitingShowResult = false;
        this.isWaitingCloseResult = false;

        this.timeDelayChange = LuckyCardScene.TIME_DELAY;
        this.isRunningXtreme = false;

        this.cmdResult = null;
        this.isMoving = false;
        this.isWaitingRoll = false;

        this.pEffect.removeAllChildren();
        this.lbNumTicket.setVisible(false);
        this.timeDelayChangeLight = this.generateTimeDelayChangeLight();
        this.effectCircle.runAction(cc.repeatForever(cc.rotateBy(5, 180)));

        if (this.isTutorial) {
            this.isTutorial = false;
            this.playTutorial(false);
        } else {
            this.tutorial.setVisible(false);
        }
        this.tutorial1.setVisible(false);

        this.lbGold.setString(StringUtility.formatNumberSymbol(gamedata.userData.bean));
        this.lbCoin.setString(StringUtility.pointNumber(luckyCard.keyCoin));

        sceneMgr.addLoading("", true);

        var cmd = new CmdSendLuckyCardOpen();
        GameClient.getInstance().sendPacket(cmd);

        //load avatar
        this._uiAvatar.asyncExecuteWithUrl(GameData.getInstance().userData.uID, GameData.getInstance().userData.avatar);

        luckyCard.luckyCardScene = this;

        this.enableRollButton(false);
        this.resetCardDeck();
        this.view.reloadTable();
        this.viewCheatList.getParent().setVisible(false);

        LuckyCardSound.playLobby();

        this.initStarLight();
        if (this.cards) {
            for (var i = 0; i < this.cards.length; i++) {
                this.cards[i].resetState(i, this.pos[Math.min(i, 1)]);
                if (i >= LuckyCardScene.CARD_OPEN) this.cards[i].hasDroped = true;
            }
        }

        this.machine.effectPanel.removeAllChildren();

        this.initIntro();
        this.playEfxStarRun();
        if (luckyCard.firstCoinBonus)
            this.showFirstCoinBonus();
        this.playShopEffect();

        this.removeEfxRutThe();
        this.removeEfxCoin();
        this.removeFreeCoin();

        this.resetMetric();
    },

    initIntro: function () {
        for (var i = 0; i < 9; i++) {
            this.listIntro[i].setPosition(this.listIntro[i].pos);
            if (i == 0 || i == 4 || i == 6)
                this.listIntro[i].runAction(rotateLeaf(this.listIntro[i]));
            this.listIntro[i].runAction(moveLeft(this.listIntro[i]));
        }
        for (var i = 9; i < 15; i++) {
            this.listIntro[i].setPosition(this.listIntro[i].pos);
            if (i == 10 || i == 14)
                this.listIntro[i].runAction(rotateLeaf(this.listIntro[i]));
            this.listIntro[i].runAction(moveRight(this.listIntro[i]));
        }
        this.pEfxIntro.setOpacity(255);
        this.pEfxIntro.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.fadeOut(1.5),
            cc.callFunc(function () {
                this.onFinishEffectShowResult();
            }.bind(this))));
    },

    playEfxStarRun: function () {
        this.effectCircle.setScale(0);
        this.timeDelayChange = LuckyCardScene.TIME_DELAY + 1.5;
        if (this.cards) {
            this.runAction(cc.sequence(
                cc.delayTime(1.0),
                cc.callFunc(function () {
                    this.startMove();
                }.bind(this))
            ));
        }
    },

    showFirstCoinBonus: function () {
        return;
        this.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function () {
                sceneMgr.openGUI(
                    LuckyCardNotifyBonusCoin.className,
                    LuckyCard.GUI_NOTIFY_BONUS_COIN,
                    LuckyCard.GUI_NOTIFY_BONUS_COIN,
                    true
                );
                this.firstCoinBonus = false;
            }.bind(this))
        ));
    },

    playShopEffect: function () {
        this.btnShop.effect.setVisible(luckyCard.showX2G);
        this.btnShop.bonus.setVisible(luckyCard.showX2G);

        this.btnShop.bonus.runAction(cc.sequence(
            cc.rotateTo(0.05, 5),
            cc.sequence(
                cc.rotateBy(0.1, -10),
                cc.rotateBy(0.1, 10)
            ).repeat(5),
            cc.rotateTo(0.05, 0),
            cc.delayTime(3)
        ).repeatForever());
    },

    startMove: function () {
        LuckyCardSound.playMoreBat();
        this.effectCircle.runAction(
            cc.sequence(
                cc.delayTime(0.5),
                cc.scaleTo(LuckyCardScene.TIME_MOVE / 2, LuckyCardScene.EFFECT_CIRCLE_SCALE)
            )
        );
        for (var i = 0; i < LuckyCardScene.CARD_OPEN; i++) {
            this.cards[i].moveCard(this.pos[i], null, LuckyCardScene.TIME_MOVE / 2 + 0.1 * i);
            if (i === LuckyCardScene.CARD_OPEN - 1) {
                this.cards[i].moveStar.rotateTo();
            }
        }
    },

    playEfxFox: function (state, loop) {
        var animation = "idle";
        if (this.efxFox) {
            switch (state) {
                case LuckyCardScene.FOX_IDLE:
                    animation = "idle";
                    loop = 0;
                    break;
                case LuckyCardScene.FOX_TAKE_OFF:
                    animation = "happy";
                    break;
                case LuckyCardScene.FOX_THROW:
                    animation = "nem xu";
                    break;
            }

            this.efxFox.status = state;
            this.efxFox.getAnimation().gotoAndPlay(animation, -1, -1, loop);
        }
    },

    playEfxNemXu: function () {
        var posFox = this.getControl("posFox", this.machine);

        var pos = cc.p(posFox.x + 40 * this._scaleRealX, posFox.y + 60 * this._scaleRealY);
        var desPos = this.wallPos;

        var timeMove = 0.5;
        var bezier = [
            pos,
            cc.p(desPos.x, desPos.y + randomInt(180, 250)),
            desPos
        ];
        var bezierTo = cc.BezierTo.create(timeMove, bezier);

        var sp = new LuckyCardCoinDrop();
        sp.setParameter(0.55, 0.55, Math.round(Math.random() * 5) + 20);
        sp.initCoin();
        sp.start();
        sp.setOpacity(255);
        //var sp = cc.Sprite("WishStar/coin1.png");
        sp.setTag(this.getTagEfxCoin());
        sp.setScale(LuckyCardCoinDrop.scaleEfx);
        sp.setPosition(pos);
        sp.runAction(cc.sequence(bezierTo, cc.removeSelf()));
        this.machine.effectPanel.addChild(sp);
    },

    removeEfxRutThe: function () {
        var star = this.machine.getChildByTag(4999);
        if (star)
            star.removeFromParent(true);
        var panel = this.getControl("panel", this.machine);
        var star2 = panel.getChildByTag(4999);
        if (star2)
            star2.removeFromParent(true);
    },

    removeEfxCoin: function () {
        for (var i = 2010; i < 2025; i++) {
            var coin = this.machine.getChildByTag(i);
            if (coin) coin.removeFromParent(true);
        }
    },

    removeFreeCoin: function () {
        if (this.freeCoin) {
            this.freeCoin.removeFromParent(true);
            this.freeCoin = null;
        }
    },

    resetMetric: function () {
        if (this.metric) {
            this.metric.touchHistory = 0;
            this.metric.touchFox = 0;
            this.metric.touchStar = 0;
            this.metric.touchHelp = 0;
            this.metric.touchCollection = 0;
        }
    },

    efxNemXu: function (type) {
        var callback = cc.callFunc(this.playEfxNemXu.bind(this));

        this.runAction(cc.sequence(
            cc.delayTime(0.25),
            cc.callFunc(function () {
                if (type == 0) {
                    LuckyCardSound.playOneToss();
                } else {
                    LuckyCardSound.playTenToss();
                }
            }.bind(this))
        ));

        if (type == 0) {
            this.playEfxNemXu();
        } else {
            for (var i = 0; i < 10; i++) {
                this.runAction(cc.sequence(cc.delayTime(i * 0.015), callback));
            }
        }
    },

    getTagEfxCoin: function () {
        for (var i = 2010; i < 2025; i++) {
            if (!this.machine.getChildByTag(i))
                return i;
        }
        return 2010;
    },

    onUpdateGUI: function () {
        //this.updateUserInfo();
    },

    efxFreeCoin: function () {
        if (!this.freeCoin) {
            var pos = this.lbCoin.getParent().convertToWorldSpace(this.lbCoin.getPosition());

            var bezier = [cc.p(375, 225), cc.p(500, 400), pos];
            var bezierTo = cc.BezierTo.create(0.55, bezier);

            var sp = new LuckyCardCoinDrop();

            sp.setParameter(0.55, 0.55, Math.round(Math.random() * 5) + 20);
            sp.initCoin();
            sp.start();
            sp.setOpacity(255);
            sp.setScale(0.4);
            sp.setTag(this.getTagEfxCoin());
            sp.setPosition(cc.p(375, 225));
            // sp.runAction(cc.sequence(cc.delayTime(0.25), cc.spawn(cc.moveTo(0.2, cc.p(500, 400)), cc.scaleTo(0.2, 1.1)), cc.delayTime(0.5),
            //     cc.spawn(cc.moveTo(0.2, cc.p(pos)), cc.scaleTo(0.2, 0.2)), cc.removeSelf()));
            sp.runAction(cc.sequence(bezierTo, cc.delayTime(0.15), cc.removeSelf()));
            sp.runAction(cc.sequence(cc.scaleTo(0.25, 1.0), cc.scaleTo(0.25, 0.2)));
            this.machine.effectPanel.addChild(sp, 99999);

            // sp.setOpacity(255);
            // sp.setPosition(cc.p(375, 225));
            // sp.runAction(cc.sequence(bezierTo, cc.delayTime(0.15), cc.removeSelf()));
            // sp.runAction(cc.sequence(cc.scaleTo(0.25, 1.0), cc.scaleTo(0.25, 0.2)));
            // this.machine.effectPanel.addChild(sp, 99999);
        }
    },

    onExit: function () {
        BaseLayer.prototype.onExit.call(this);
        luckyCard.luckyCardScene = null;

        LuckyCardSound.closeLobby();
    },

    enableRollButton: function (enable) {
        this.btnNormal.setColor(enable ? cc.color(255, 255, 255, 255) : cc.color(90, 90, 90, 255));
        this.btnNormalXtreme.setColor(enable ? cc.color(255, 255, 255, 255) : cc.color(90, 90, 90, 255));

        this.btnNormal.setPressedActionEnabled(enable);
        this.btnNormalXtreme.setPressedActionEnabled(enable);

        this.btnNormal.enable = enable;
        this.btnNormalXtreme.enable = enable;

        this.btnNormal.setVisible(true);
        this.btnNormalXtreme.setVisible(true);
    },

    updateUserInfo: function () {
        this.lbGold.setString(StringUtility.formatNumberSymbol(gamedata.userData.bean));
        this.isEffectMoney = false;
    },

    updateCoin: function () {
        cc.log("UPDATE COIN **** " + luckyCard.keyCoin);
        this.lbCoin.setString(StringUtility.pointNumber(luckyCard.keyCoin));
        this.isEffectCoin = false;
    },

    updateEventInfo: function () {
        cc.log(" UPDATE EVENT INFO " + this.isWaitingCloseResult + " " + this.isWaitingResult + " " + this.isWaitingShowResult);
        if (this.isWaitingCloseResult || this.isWaitingResult || this.isWaitingShowResult) {
            return;
        }

        //this.lbCoinProgress.setString(luckyCard.getExpString());
        //this.barProgress.setPercent(luckyCard.getExpPercent());
        this.updateCoin();

        this.isEventTime = luckyCard.isInEvent();

        this.viewCheatList.reloadData();

        if (!this.isWaitingCloseResult) {
            this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
                this.enableRollButton(true);
                if (!this.isMoving) this.timeDelayChange = 0.001;
            }.bind(this))));
        }

        var isNotify = false;
        for (var i = 0; i < luckyCard.gifts.length; i++) {
            if (luckyCard.gifts[i].gift > 0) {
                isNotify = true;
                break;
            }
        }

        if (isNotify) this.playTutorial(true);
        else this.tutorial.setVisible(false);

        this.view.reloadTable();

        if (luckyCard.isFirstTime && luckyCard.keyCoin > 0)
            this.effectIsFirstTime();
    },

    effectIsFirstTime: function () {
        this.tutorial1.setVisible(true);
        if (luckyCard.isFirstTime) luckyCard.isFirstTime = false;
        this.isTutorial1 = true;
        this.playTutorialFirst(true);
        cc.log("isFirstTime");
    },

    playTutorialFirst: function (forever) {
        this.tutorial1.cleanup();
        this.tutorial1.hand.cleanup();
        this.tutorial1.circle.cleanup();
        this.tutorial1.setVisible(true);

        var timeWaitHand = 0.15;
        var timeMove = 0.25;
        var timeZoom = 0.35;

        var handPos = this.tutorial1.hand.pos;
        this.tutorial1.hand.setPosition(handPos);

        this.tutorial1.circle.setOpacity(255);
        this.tutorial1.circle.setScale(0);

        var actHand = cc.sequence(cc.delayTime(timeWaitHand), cc.moveTo(timeMove, cc.p(handPos.x, handPos.y + 5)), cc.delayTime(timeZoom), cc.moveTo(timeMove, handPos));
        var actCircle = cc.sequence(cc.delayTime(timeWaitHand + timeMove), cc.spawn(cc.scaleTo(timeZoom, 3), cc.fadeOut(timeZoom)), cc.callFunc(this.tutorialZoomCircle.bind(this.tutorial1.circle)), cc.delayTime(timeMove));

        if (forever) {
            this.tutorial1.hand.runAction(cc.repeatForever(actHand));
            this.tutorial1.circle.runAction(cc.repeatForever(actCircle));
        } else {
            this.tutorial1.hand.runAction(cc.repeat(actHand, 5));
            this.tutorial1.circle.runAction(cc.repeat(actCircle, 5));
            this.tutorial1.runAction(cc.sequence(cc.delayTime(5 * (timeWaitHand + timeMove + timeZoom + timeMove)), cc.hide()));
        }
    },

    updateGSystem: function (cmd) {
        this.lbGServer.setString("S:" + StringUtility.pointNumber(cmd.gServer));
        this.lbGUser.setString("U:" + StringUtility.pointNumber(cmd.gUser));
    },

    onRollResult: function (cmd) {
        if (cmd.result != 1) {
            this.isWaitingResult = false;
            this.isWaitingShowResult = false;
            this.isWaitingCloseResult = false;
        }
        switch (cmd.result) {
            case 1: {
                luckyCard.updateHist = true;
                this.cmdResult = cmd;

                if (this.isWaitingResult && !this.isWaitingShowResult) {
                    this.isWaitingShowResult = true;
                } else {
                    this.onShowResult();
                }
                break;
            }
            case 0:
            case 2:
            case 3: {
                this.enableRollButton(true);
                this.updateEventInfo();
                sceneMgr.showOKDialog(LocalizedString.to("LUCKYCARD_RESULT_" + cmd.result));
                break;
            }
            case 4: {
                this.enableRollButton(true);
                this.updateEventInfo();
                /*sceneMgr.showAddGDialog(LocalizedString.to("LUCKYCARD_RESULT_4"), this, function (btnID) {
                 if (btnID == Dialog.BTN_OK) {
                 gamedata.openNapG(this._id, true);
                 }
                 });*/
                sceneMgr.openGUI(LuckyCardAlertGUI.className, LuckyCard.GUI_ALERT, LuckyCard.GUI_ALERT);
                break;
            }
            case 5: {
                this.enableRollButton(true);
                this.updateEventInfo();
                sceneMgr.showOKDialog(LocalizedString.to("LUCKYCARD_EVENT_NEW_WEEK"));
                break;
            }
            case 6: {
                this.enableRollButton(true);
                this.updateEventInfo();
                this.updateUserInfo();
                sceneMgr.showOKDialog(LocalizedString.to("LUCKYCARD_EVENT_NEW_DAY"));
                break;
            }

            case 7: {
                sceneMgr.showOkDialogWithAction(LocalizedString.to("LUCKYCARD_EVENT_TIMEOUT"), this, function (btnID) {
                    if (btnID == Dialog.BTN_OK) {
                        sceneMgr.openScene(LobbyScene.className);
                    }
                });
                break;
            }
        }
    },

    onShowResult: function () {
        if (this.cmdResult) {
            cc.log("SHOW RESULT", JSON.stringify(this.cmdResult));
            this.showResult();
        }
    },

    removeFlyCards: function () {
        if (this.flyCards) {
            for (var i = 0; i < this.flyCards.length; i++) {
                var card = this.machine.getChildByTag(this.flyCards[i]);
                if (card) card.removeFromParent(true);
            }
        }
        this.flyCards = [];
    },

    moveGift: function (delay, id) {
        var pos = this.getControl("pos", this.machine).getPosition();

        var card = new LuckyCardObject(id, true); //gift
        card.setPosition(pos.x, pos.y - 100);
        card.setScale(0.3);
        card.setTag(7999 + this.flyCards.length);
        card.setOpacity(50);
        card.setVisible(false);
        this.machine.addChild(card);

        var showGift = cc.spawn(
            cc.EaseBackOut(cc.moveTo(0.3, cc.p(pos.x, pos.y + 400))),
            cc.EaseBackOut(cc.scaleTo(0.3, 1.5, 1.5)), cc.fadeIn(0.3));
        card.runAction(cc.sequence(
            cc.delayTime(delay),
            cc.show(),
            showGift,
            cc.removeSelf()
        ));
        this.flyCards.push(card.getTag());
    },

    playEfxRutThe: function () {
        this.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.callFunc(function () {
                LuckyCardSound.playStarFall();
            }.bind(this))
        ));
        var pos = this.getControl("pos", this.machine).getPosition();
        pos.y += 8;
        var eff = db.DBCCFactory.getInstance().buildArmatureNode("Nhanqua");
        if (eff) {
            eff.setTag(4999);
            eff.setScale(0.67);
            this.machine.addChild(eff, 4999);
            eff.setPosition(pos);
            eff.getAnimation().gotoAndPlay("1", -1, 1, 1);
            eff.setCompleteListener(this.animationGetGift.bind(this));
            eff.step = 1;
        }
    },

    animationGetGift: function (animation) {
        if (animation) {
            if (animation.step == 1) {
                LuckyCardSound.playLightWell();
                animation.step = 2;
                animation.getAnimation().gotoAndPlay("2", -1, 1, 1);
            } else
                animation.runAction(cc.sequence(cc.removeSelf()));
        }
    },

    showResult: function () {
        if (this.cmdResult) {
            this.playEfxRutThe();
            if (this.cmdResult.gifts.length > 1) {
                //efx bay gift tu gieng len
                this.removeFlyCards();
                for (var i = 0; i < this.cmdResult.gifts.length; i++) {
                    cc.log("FROM THE POT: " + JSON.stringify(this.cmdResult.gifts[i]));
                    this.moveGift(1.0 + i * 0.05, this.cmdResult.gifts[i].id);
                }

                this.runAction(cc.sequence(
                    cc.delayTime(0.2),
                    cc.callFunc(function () {
                        this.effectCircle.runAction(cc.scaleTo(0.1, 0));
                    }.bind(this)),
                    cc.delayTime(1.1),
                    cc.callFunc(function () {
                        this.playEfxFox(LuckyCardScene.FOX_TAKE_OFF, 1);
                        var iconPos = cc.p(this.lbGold.getPosition().x - 20.5, this.lbGold.getPosition().y);
                        var goldPos = this.lbGold.getParent().convertToWorldSpace(iconPos);
                        icon = this.getControl("icon", this.lbCoin.getParent());
                        var coinPos = icon.getParent().convertToWorldSpace(icon.getPosition());
                        var desPos = this.desPos;

                        var gui = sceneMgr.openGUI(LuckyCardOpenResultGUI.className, LuckyCard.GUI_GIFT_RESULT, LuckyCard.GUI_GIFT_RESULT);
                        if (gui) gui.openGift(this.cmdResult.gifts, goldPos, desPos, coinPos);
                    }.bind(this))
                ));
            } else {
                this.runAction(cc.sequence(
                    cc.delayTime(0.2),
                    cc.callFunc(function () {
                        this.effectCircle.runAction(cc.scaleTo(0.1, 0));
                    }.bind(this)),
                    cc.delayTime(0.8),
                    cc.callFunc(function () {
                        this.playEfxFox(LuckyCardScene.FOX_TAKE_OFF, 1);
                    }.bind(this))
                ));
                this.showOneGift();
            }
        }
    },

    showOneGift: function () {
        var delayShowGift = 1.0;

        this.runAction(cc.sequence(
            cc.delayTime(delayShowGift),
            cc.callFunc(function () {
                var desPos = this.desPos;
                var pos = this.effectCircle.getPosition();
                var func = cc.callFunc(function () { //func end efx showOneGift
                    if (luckyCard.isItemGold(this.cmdResult.ids[0])) {
                        this.onEffectGetMoneyItem(this.cmdResult.gifts[0].value);
                    }
                    cc.log("oneGift", JSON.stringify(this.cmdResult));
                    this.runAction(cc.sequence(
                        cc.delayTime(0.75),
                        cc.callFunc(function () {
                            this.onFinishEffectShowResult();
                        }.bind(this))
                    ));
                }.bind(this));

                var card = new LuckyCardObject(this.cmdResult.ids[0], true); //gift
                card.setPosition(pos.x, pos.y - 100);
                card.setScale(0.3);
                card.setTag(1999);
                card.setOpacity(50);
                this.machine.effectPanel.addChild(card);

                var showGift = cc.spawn(
                    cc.EaseBackOut(cc.moveTo(0.3, cc.p(pos.x, pos.y + 50))),
                    cc.EaseBackOut(cc.scaleTo(0.3, 1.25)),
                    cc.fadeIn(0.2)
                );
                var timeShowGift = 0.75;
                if (luckyCard.isItemStored(this.cmdResult.ids[0])) {
                    card.runAction(cc.sequence(
                        showGift,
                        cc.callFunc(function () {
                            LuckyCardSound.playSpecialGift();
                        }.bind(this)),
                        cc.delayTime(timeShowGift),
                        cc.spawn(
                            cc.moveTo(0.3, desPos),
                            cc.scaleTo(0.3, 0.4)
                        ),
                        func,
                        cc.removeSelf()
                    ));
                } else if (luckyCard.isItemGold(this.cmdResult.ids[0])) {
                    var dropGold = cc.callFunc(this.dropGold.bind(this, card));
                    card.runAction(cc.sequence(
                        showGift,
                        cc.callFunc(function () {
                            LuckyCardSound.playGift();
                        }.bind(this)),
                        cc.delayTime(timeShowGift),
                        cc.scaleTo(0.2, 0).easing(cc.easeBackIn()),
                        dropGold,
                        cc.spawn(
                            cc.hide(),
                            cc.delayTime(0.5)
                        ),
                        func,
                        cc.removeSelf()
                    ));
                } else {
                    var dropCoin = cc.callFunc(this.dropCoin.bind(this, card));
                    card.runAction(cc.sequence(
                        showGift,
                        cc.delayTime(timeShowGift),
                        cc.scaleTo(0.2, 0).easing(cc.easeBackIn()),
                        dropCoin,
                        cc.spawn(
                            cc.hide(),
                            cc.delayTime(0.4)
                        ),
                        func,
                        cc.removeSelf()
                    ));
                }
            }.bind(this))
        ));
    },

    dropGold: function (card) {
        var timeDelay = 0.05;
        var timeFly = 0.2;
        var iconGoldPos = cc.p(this.lbGold.getPosition().x - 20.5, this.lbGold.getPosition().y);
        var goldPos = this.lbGold.getParent().convertToWorldSpace(iconGoldPos);
        for (var i = 0; i < 10; i++) {
            var sp = new LuckyCardGoldDrop();
            if (sp) {
                sp.setParameter(1, 1, Math.round(Math.random() * 5) + 20);
                sp.initCoin();
                sp.start();
                sp.setPosition(card.getPosition());
                sp.setScale(0.7);
                this.machine.effectPanel.addChild(sp);

                var bezier = [
                    sp.getPosition(),
                    cc.p(
                        sp.getPositionX() - randomInt(-150, 150),
                        sp.getPositionY() + randomInt(-200, 200)),
                    goldPos
                ];

                sp.runAction(cc.sequence(
                    cc.fadeIn(0.1),
                    cc.delayTime(timeDelay * i),
                    cc.spawn(
                        cc.scaleTo(2 * timeFly - timeDelay * i / 10, 0.25),
                        cc.BezierTo.create(2 * timeFly, bezier)
                    ),
                    cc.spawn(
                        cc.scaleTo(0.3, 0.4),
                        cc.fadeOut(0.3)
                    ),
                    cc.removeSelf()
                ));
            } else {
                var sp = cc.Sprite.create(luckyCard.getItemImage(0, false));
                sp.setPosition(card.getPosition());
                this.machine.effectPanel.addChild(sp);
                sp.runAction(cc.sequence(
                    cc.delayTime(timeDelay),
                    cc.moveTo(timeFly - timeDelay, this.goldPos),
                    cc.removeSelf()
                ));
            }
        }
    },

    dropCoin: function (card) {
        var iconCoin = this.getControl("icon", this.lbCoin.getParent());
        var coinPos = iconCoin.getParent().convertToWorldSpace(iconCoin.getPosition());
        var timeDelay = 0.05;
        var timeFly = 0.5;

        var sp = new LuckyCardCoinDrop();

        sp.setParameter(0.55, 0.55, Math.round(Math.random() * 5) + 20);
        sp.initCoin();
        sp.start();
        sp.setOpacity(255);
        //var sp = cc.Sprite("WishStar/coin1.png");
        sp.setTag(this.getTagEfxCoin());
        sp.setScale(LuckyCardCoinDrop.scaleEfx * 3.5);

        sp.setPosition(card.getPosition());
        this.machine.effectPanel.addChild(sp);
        sp.runAction(cc.sequence(
            cc.delayTime(timeDelay),
            cc.spawn(
                cc.moveTo(timeFly, coinPos).easing(cc.easeCubicActionIn()),
                cc.scaleTo(timeFly, 0.1)
            ),
            cc.spawn(
                cc.scaleTo(0.3, 0.2),
                cc.fadeOut(0.3)
            ),
            cc.removeSelf()));
    },

    rainEffect: function (id) {
        var n = 100 + Math.round(Math.random() * 100);
        for (var i = 0; i < n; i++) {
            var droplet;
            var lifeTime = Math.random() + 1;
            var orgScale;

            if (luckyCard.isVPoint(id)) {
                droplet = new cc.Sprite("res/Event/LuckyCard/WishStar/smallGStar.png");
                orgScale = 1.5 + Math.random();
                droplet.setScale(orgScale);
            }
            else if (luckyCard.isDiamond(id)) {
                droplet = new cc.Sprite("res/Event/LuckyCard/WishStar/iconDiamond.png");
                orgScale = 1.5 + Math.random();
                droplet.setScale(orgScale);
            }
            else {
                droplet = new cc.Sprite("res/Event/LuckyCard/WishStar/iconGold.png");
                orgScale = 1.0 + Math.random();
                droplet.setScale(orgScale);
                //
                //orgScale = 0.7;
                //droplet = new LuckyCardGoldDrop();
                //droplet.setScale(orgScale);
                //droplet.runAction(cc.sequence(
                //    cc.delayTime(0.02 * i),
                //    cc.callFunc(function () {
                //        this.start();
                //    }.bind(droplet))
                //));
            }
            this.machine.effectPanel.addChild(droplet);

            droplet.setVisible(false);
            droplet.setPosition(cc.p(
                cc.winSize.width * Math.random(),
                cc.winSize.height * 1.15
            ));

            droplet.runAction(cc.sequence(
                cc.delayTime(0.02 * i),
                cc.show(),
                cc.spawn(
                    cc.rotateTo(lifeTime, 720 + 720 * Math.random()),
                    cc.moveBy(lifeTime, 0, -cc.winSize.height * 1.15 + 150 * Math.random()).easing(cc.easeBounceOut()),
                    cc.moveBy(lifeTime, 500 - 1000 * Math.random(), 0).easing(cc.easeIn(2))
                ),
                cc.spawn(
                    cc.scaleTo(lifeTime / 2, orgScale + 0.3),
                    cc.fadeOut(lifeTime / 2)
                ),
                cc.removeSelf()
            ));
        }
    },


    visibleCheat: function () {
        this.pCheat.setVisible(Config.ENABLE_CHEAT);
    },

    /**
     * EFFECT CARD
     */
    playTutorial: function (forever) {
        this.tutorial.cleanup();
        this.tutorial.hand.cleanup();
        this.tutorial.circle.cleanup();
        this.tutorial.setVisible(true);

        var timeWaitHand = 0.15;
        var timeMove = 0.25;
        var timeZoom = 0.35;

        var handPos = this.tutorial.hand.pos;
        this.tutorial.hand.setPosition(handPos);

        this.tutorial.circle.setOpacity(255);
        this.tutorial.circle.setScale(0);

        var actHand = cc.sequence(cc.delayTime(timeWaitHand), cc.moveTo(timeMove, cc.p(handPos.x, handPos.y + 5)), cc.delayTime(timeZoom), cc.moveTo(timeMove, handPos));
        var actCircle = cc.sequence(cc.delayTime(timeWaitHand + timeMove), cc.spawn(cc.scaleTo(timeZoom, 3), cc.fadeOut(timeZoom)), cc.callFunc(this.tutorialZoomCircle.bind(this.tutorial.circle)), cc.delayTime(timeMove));

        if (forever) {
            this.tutorial.hand.runAction(cc.repeatForever(actHand));
            this.tutorial.circle.runAction(cc.repeatForever(actCircle));
        } else {
            this.tutorial.hand.runAction(cc.repeat(actHand, 5));
            this.tutorial.circle.runAction(cc.repeat(actCircle, 5));
            this.tutorial.runAction(cc.sequence(cc.delayTime(5 * (timeWaitHand + timeMove + timeZoom + timeMove)), cc.hide()));
        }
    },

    tutorialZoomCircle: function () {
        this.setOpacity(255);
        this.setScale(0);
    },

    sortCardDeck: function () {
        for (var i = 0, m = this.cards.length - 1; i < m; i++) {
            for (var j = i; j < m + 1; j++) {
                if (this.cards[i].index > this.cards[j].index) {
                    var ccc = this.cards[i];
                    this.cards[i] = this.cards[j];
                    this.cards[j] = ccc;
                }
            }
        }
    },

    resetCardDeck: function () {
        this.sortCardDeck();

        for (var i = 0; i < this.cards.length; i++) {
            this.cards[i].setPosition(this.pos[i]);
            if (i >= LuckyCardScene.CARD_OPEN) {
                var item = this.generateNextItem();
                this.cards[i].setPrize(item);
            }
        }
    },

    onChangeCard: function () {
        this.isMoving = true;

        var generateItem = this.generateNextItem();

        this.effectCircle.runAction(cc.scaleTo(0.1, 0));
        //LuckyCardSound.playRollOneStar();
        for (var i = 0; i < LuckyCardScene.NUM_CARD; i++) {
            var card = this.cards[i];
            card.index++;
            card.index = card.index % LuckyCardScene.NUM_CARD;

            card.moveCard(this.pos[card.index], generateItem, LuckyCardScene.TIME_MOVE);

            if (card.index === LuckyCardScene.CARD_OPEN - 1 || card.index === LuckyCardScene.CARD_OPEN) {
                card.moveStar.rotateTo();
            }
        }

        this.runAction(cc.sequence(cc.delayTime(LuckyCardScene.TIME_MOVE), cc.callFunc(this.changeCardFinish.bind(this))));
    },

    changeCardFinish: function () {
        this.isMoving = false;
        this.effectCircle.runAction(cc.scaleTo(0.15, LuckyCardScene.EFFECT_CIRCLE_SCALE));

        if (this.isWaitingLucky) {
            this.effectLucky();
        }
    },

    onChangeCardXtreme: function () {
        // auto sort card effect
        this.sortCardDeck();

        // run change card deck
        for (var i = 0; i < LuckyCardScene.CARD_OPEN; i++) {
            var card = this.cards[i];
            if (card.index == LuckyCardScene.CARD_OPEN - 1) {
                card.index = 1;
            } else {
                card.index++;
            }
            //card.index = card.index % LuckyCardScene.NUM_CARD;
            card.moveCardXtreme(this.pos[card.index], LuckyCardScene.TIME_MOVE_XTREME);

            if (card.index == LuckyCardScene.CARD_OPEN - 1 || card.index == LuckyCardScene.CARD_OPEN)
                card.moveStar.pause();
            else if (card.index < LuckyCardScene.CARD_OPEN) {
                card.moveStar.continueRotate();
                if (card.index == 0) {
                    card.stopJelly();
                }
            }
        }

        if (this.countRunningXtreme <= 0) {
            this.timeDelayChange = LuckyCardScene.TIME_DELAY;
            this.isRunningXtreme = false;
            this.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(this.endEffectOpenCard.bind(this))));

            this.cards[0].index = 1;
            //this.cards[0].setPosition(this.pos[1]);
            this.cards[LuckyCardScene.CARD_OPEN - 1].index = 0;
            //this.cards[LuckyCardScene.CARD_OPEN-1].setPosition(this.pos[0]);

            var st = "";
            for (var i = 0; i < LuckyCardScene.CARD_OPEN; i++) {
                var card = this.cards[i];
                st += "{" + i + "," + card.index + "} ";
                if (i == 0) card.index = 1;
                else if (i == 4) card.index = 0;
            }
            //cc.log("card index", st, LuckyCardScene.CARD_OPEN);
        } else {
            //this.runAction(cc.sequence(cc.delayTime(LuckyCardScene.TIME_MOVE_XTREME), cc.callFunc(this.changeCardXtremeFinish.bind(this))));
        }

        // if (this.countRunningXtreme <= 0) {
        //     this.timeDelayChange = LuckyCardScene.TIME_DELAY;
        //     this.isRunningXtreme = false;
        //     this.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(this.endEffectOpenCard.bind(this))));
        // }
    },

    changeCardXtremeFinish: function () {
        //for(var i = 0 ; i < LuckyCardScene.CARD_OPEN ; i++)
        //{
        //    var card = this.cards[i];
        //    if(card.index == LuckyCardScene.CARD_OPEN - 1)
        //    {
        //        card.index = 0;
        //        card.setVisible(false);
        //    }
        //    else
        //    {
        //        card.index++;
        //    }
        //
        //    card.moveCard(this.pos[card.index],-1,LuckyCardScene.TIME_MOVE_XTREME);
        //}

        this.effectOpenCard();
    },

    doLucky: function (type, pos) {
        cc.log("TYPE ROLL " + type);
        if (this.isWaitingRoll) {
            Toast.makeToast(Toast.SHORT, LocalizedString.to("LUCKYCARD_ROLLING"));
            return;
        }

        this.enableRollButton(false);

        var isRoll = true;
        var costRoll = luckyCard.getCostRoll(type);

        if (costRoll > luckyCard.keyCoin) {
            this.enableRollButton(true);
            sceneMgr.openGUI(LuckyCardAlertGUI.className, LuckyCard.GUI_ALERT, LuckyCard.GUI_ALERT);
            return;
        }

        //switch (type) {
        //    case LuckyCard.ROLL_NORMAL_XTREME:
        //    case LuckyCard.ROLL_NORMAL_ONCE:
        //    {
        //        cc.log("doLucky::type: roll normal xtreme", type);
        //        if (costRoll > luckyCard.keyCoin) {
        //            this.enableRollButton(true);
        //            sceneMgr.openGUI(LuckyCardAlertGUI.className, LuckyCard.GUI_ALERT, LuckyCard.GUI_ALERT);
        //            return;
        //        }
        //        break;
        //    }
        //    case LuckyCard.ROLL_ONCE:
        //    case LuckyCard.ROLL_XTREME:
        //    {
        //        cc.log("doLucky::type: roll xtreme", type);
        //        isRoll = (costRoll <= gamedata.userData.coin);
        //        if (isRoll) {
        //            //this.lbBean.setString(StringUtility.pointNumber(gamedata.userData.coin - costRoll));
        //        } else {
        //            this.enableRollButton(true);
        //
        //            if (gamedata.checkEnablePayment()) {
        //                sceneMgr.showAddGDialog(LocalizedString.to("LUCKYCARD_RESULT_5"), this, function (btnID) {
        //                    if (btnID == Dialog.BTN_OK) {
        //                        gamedata.openNapG(this._id, true);
        //                    }
        //                });
        //            } else {
        //                //sceneMgr.showOKDialog(LocalizedString.to("LUCKYCARD_RESULT_4"));
        //                sceneMgr.openGUI(LuckyCardAlertGUI.className, LuckyCard.GUI_ALERT, LuckyCard.GUI_ALERT);
        //            }
        //            return;
        //        }
        //        break;
        //    }
        //}

        if (isRoll) {
            this.lbNumTicket.setVisible(true);
            this.lbNumTicket.setOpacity(255);
            this.lbNumTicket.setString("-" + costRoll);
            if (type == 0)
                this.lbNumTicket.setPosition(this.btnNormal.getPositionX(), this.btnNormal.getPositionY());
            else
                this.lbNumTicket.setPosition(this.btnNormalXtreme.getPositionX(), this.btnNormalXtreme.getPositionY());
            this.lbNumTicket.runAction(cc.sequence(new cc.EaseBackOut(cc.moveBy(0.4, 0, 50)), cc.delayTime(0.5), cc.fadeOut(0.5), cc.hide()));
            luckyCard.keyCoin = luckyCard.keyCoin - costRoll;
            this.updateCoin();
            var callBackSend = cc.callFunc(function (type) {

                // effect card
                this.typeLucky = type;
                this.isWaitingResult = true;
                this.isWaitingShowResult = false;
                this.isWaitingCloseResult = true;

                //Effect pot
                // this.playEfxSmokePot();

                if (this.isMoving) {
                    this.isWaitingLucky = true;
                } else {
                    this.effectLucky();
                }

                // send server
                var num = this.txNumRoll.getString();
                if (!Config.ENABLE_CHEAT || num == "" || isNaN(num)) {
                    num = 1;
                }
                for (var i = 0; i < num; i++) {
                    var cmd = new CmdSendLuckyCardRoll();
                    cmd.putData(type + 1);
                    GameClient.getInstance().sendPacket(cmd);
                }
            }.bind(this, type));

            this.timeDelayChange += 5;
            this.playEfxFox(LuckyCardScene.FOX_THROW, 1);
            this.runAction(
                cc.sequence(
                    cc.delayTime(0.35),
                    cc.callFunc(this.efxNemXu.bind(this, type)),
                    cc.delayTime(0.5),
                    callBackSend
                )
            );
        }
    },

    effectLucky: function () {
        if (this.typeLucky == LuckyCard.ROLL_NORMAL_ONCE || this.typeLucky == LuckyCard.ROLL_ONCE) {
            this.timeDelayChange += LuckyCardScene.TIME_DELAY_GIFT;
            for (var i = 0; i < LuckyCardScene.NUM_CARD; i++) {
                if (this.cards[i].index == LuckyCardScene.CARD_OPEN - 1) {
                    var timeDrop = 0.5;
                    this.cards[i].luckyCardDrop(timeDrop, this);
                    this.runAction(
                        cc.sequence(
                            cc.delayTime(timeDrop),
                            cc.callFunc(
                                this.endEffectOpenCard.bind(this, 1)
                            )
                        )
                    );
                }
            }
        } else {
            cc.log("Card Xtreme");
            LuckyCardSound.playRollTenStar();
            this.countRunningXtreme = LuckyCardScene.NUM_CARD_XTREME;
            this.isRunningXtreme = true;
            this.timeDelayChange = LuckyCardScene.TIME_DELAY_XTREME;

            //efx ngoi sao tren mieng gieng khi quay 10 lan
            var panel = this.getControl("panel", this.machine);
            var star = cc.Sprite("res/Event/LuckyCard/WishStar/star_00.png");
            star.setPosition(this.pos[LuckyCardScene.CARD_OPEN - 1]);
            star.setTag(1999);
            panel.addChild(star);
            star.setVisible(false);
            star.runAction(cc.sequence(cc.delayTime(0.5), cc.show(), cc.delayTime(2.0), cc.callFunc(function () {
                this.effectCircle.stopAllActions();
                this.effectCircle.setVisible(false);
                //LuckyCardSound.playRollTenStar();
            }.bind(this)), cc.removeSelf()));
            star.runAction(cc.sequence(cc.delayTime(0.1), cc.scaleTo(0.05, 1.1), cc.callFunc(function () {
                this.effectCircle.setScale(1.15);
                //LuckyCardSound.playRollOneStar();
            }.bind(this)), cc.scaleTo(0.03, 0.9), cc.callFunc(function () {
                this.effectCircle.setScale(0.85);
            }.bind(this))).repeatForever());
            //this.effectCircle.runAction(cc.sequence(cc.delayTime(0.25), cc.scaleTo(0.05, 1.1), cc.scaleTo(0.05, 0.9)).repeatForever());
        }

        // reset
        this.isWaitingLucky = false;
        this.typeLucky = -1;
    },

    endEffectOpenCard: function (type) {
        /*if (type !== undefined && type != null && type == 1) {
         this.timeDelayChange = this.timeMaxDelay;
         }*/
        this.timeDelayChange = LuckyCardScene.TIME_DELAY_GIFT;

        this.isWaitingResult = false;

        if (this.isWaitingShowResult) {
            this.isWaitingShowResult = false;
            this.isWaitingResult = false;
            this.onShowResult();
        } else {
            this.isWaitingShowResult = true;
        }
    },

    onFinishEffectShowResult: function () {
        this.isWaitingCloseResult = false;
        this.isWaitingShowResult = false;

        //this.enableRollButton(true);
        cc.log("UPDATE FROM SHOW RESULT");
        this.updateEventInfo();
        this.updateUserInfo();
    },

    onEffectGetMoneyItem: function (value) {
        //gameSound.playSoundMoney1();
        this.isEffectMoney = true;
        this.curEffectMoney = gamedata.userData.bean - value;
        //this.curEffectMoney = parseInt(StringUtility.replaceAll(this.lbGold.getString(), ".", ""));
        //this.curEffectMoney = this.curEffectMoney - value;
        this.deltaEffectMoney = value * 0.001;
    },

    onEffectGetCoinItem: function (value) {
        cc.log("HOW MANY COIN GET BACK? " + value + " " + luckyCard.keyCoin);
        this.isEffectCoin = true;
        this.curEffectCoin = luckyCard.keyCoin - value;
        this.deltaEffectCoin = value * (1 / 60);
    },

    effectLight: function () {
        this.timeDelayChangeLight = this.generateTimeDelayChangeLight();

        var rndIdx = Math.floor(Math.random() * 10) % this.lights.length;
        var light = this.lights[rndIdx];
        if (light) {
            light.setOpacity(255);
            light.setVisible(true);
            light.setScale(1);
            light.setRotation(0);

            var rndEffect = Math.floor(Math.random() * 10) % 2;
            switch (rndEffect) {
                case 0: {
                    light.setScale(0);
                    light.runAction(cc.sequence(cc.spawn(cc.scaleTo(0.5, 1), cc.rotateTo(1, 720)), cc.spawn(cc.scaleTo(0.5, 0), cc.rotateTo(1, 720)), cc.hide()));
                    break;
                }
                case 1: {
                    light.runAction(cc.sequence(cc.repeat(cc.sequence(cc.fadeOut(0.5), cc.fadeIn(0.5)), 5), cc.hide()));
                    break;
                }
            }
        }
    },

    generateTimeDelayChangeLight: function () {
        return (Math.floor(Math.random() * 100) % 2 + 1);
    },

    /**
     * END - EFFECT
     */

    onButtonRelease: function (btn, id) {
        if (id != LuckyCardScene.BTN_CLOSE && id != LuckyCardScene.BTN_COLLECTION && !luckyCard.isInEvent()) {
            sceneMgr.showOkDialogWithAction(LocalizedString.to("LUCKYCARD_EVENT_TIMEOUT"), function (buttonId) {
                this.onBack();
            });
            return;
        }
        switch (id) {
            case LuckyCardScene.BTN_CLOSE: {
                this.onBack();
                break;
            }
            case LuckyCardScene.BTN_HELP: {
                // if (Config.ENABLE_CHEAT)
                //     this.sendTestRegister();

                if (this.metric)
                    this.metric.touchHelp++;
                sceneMgr.openGUI(LuckyCardHelpGUI.className, LuckyCard.GUI_HELP, LuckyCard.GUI_HELP);
                break;
            }
            case LuckyCardScene.BTN_HISTORY: {
                if (this.metric)
                    this.metric.touchHistory++;
                luckyCard.requestHistory();
                sceneMgr.openGUI(LuckyCardHistoryGUI.className, LuckyCard.GUI_HISTORY, LuckyCard.GUI_HISTORY);
                break;
            }
            case LuckyCardScene.BTN_TOP: {
                NativeBridge.openWebView(luckyCard.eventLinkNews);
                // NativeBridge.openURLNative(LuckyCard.URL_TOP);
                // Toast.makeToast(Toast.SHORT,localized("COMING_SOON"));
                break;
            }
            case LuckyCardScene.BTN_SHOP:
            case LuckyCardScene.BTN_ADD_GOLD: {
                this.sendMetric(); //log metric
                luckyCard.sendMetricOpenShopX2();
                cc.log("open shop");
                var open = gamedata.checkEnablePayment();
                luckyCard.tabEventShop = true;
                //if (open) sceneMgr.openScene(ShopIapScene.className);
                if (open) {
                    gamedata.openShop();
                }
                break;
            }
            case LuckyCardScene.BTN_RANK: {
                NativeBridge.openWebView(luckyCard.eventLinkNews);
                break;
            }
            case LuckyCardScene.BTN_ADD_G: {
                gamedata.openNapG();
                break;
            }
            case LuckyCardScene.BTN_COLLECTION: {
                if (this.metric)
                    this.metric.touchCollection++;
                this.isTutorial = false;
                sceneMgr.openGUI(LuckyCardCollectionGUI.className, LuckyCard.GUI_COLLECTION, LuckyCard.GUI_COLLECTION);
                break;
            }
            case LuckyCardScene.BTN_NORMAL:
            case LuckyCardScene.BTN_NORMAL_XTREME: {
                if (this.isTutorial1) {
                    this.isTutorial1 = false;
                    this.tutorial1.setVisible(false);
                }
                if (btn.enable !== undefined && btn.enable != null && btn.enable) {
                    if (luckyCard.eventTime < LuckyCard.WEEK_3)
                        this.doLucky(id - LuckyCardScene.BTN_NORMAL);
                    else
                        Toast.makeToast(2, LocalizedString.to("LUCKYCARD_EVENT_TIMEOUT"))
                }

                break;
            }

            case LuckyCardScene.BTN_METRIC_FOG: {
                if (this.metric)
                    this.metric.touchFox++;
                break;
            }
            case LuckyCardScene.BTN_METRIC_STAR: {
                if (this.metric)
                    this.metric.touchStar++;
                break;
            }

            case LuckyCardScene.BTN_CHEAT_ITEM: {
                if (!Config.ENABLE_CHEAT) return;

                var item = this.txItem.id;
                if (item === undefined || item == null) {
                    Toast.makeToast(Toast.SHORT, "Chua chon Item !!!");

                    this.viewCheatList.getParent().setVisible(true);
                    return;
                }
                var num = this.txNum.getString();
                if (num == "" || isNaN(num)) {
                    num = 1;
                }

                var cmd = new CmdSendLuckyCardCheatItem();
                cmd.putData(item, parseInt(num));
                GameClient.getInstance().sendPacket(cmd);

                break;
            }
            case LuckyCardScene.BTN_CHEAT_COIN: {
                if (!Config.ENABLE_CHEAT) return;

                var exp = this.txExp.getString();
                var coin = this.txCoin.getString();

                if (exp == "" || isNaN(exp)) {
                    exp = 0;
                }
                if (coin == "" || isNaN(coin)) {
                    coin = 0;
                }

                var cmd = new CmdSendLuckyCardCheatCoinAccumulate();
                cmd.putData(parseFloat(coin), parseInt(exp));
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case LuckyCardScene.BTN_CHEAT_COIN_FREE: {
                if (!Config.ENABLE_CHEAT) return;

                var cmd = new CmdSendLuckyCardCheatCoinFree();
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case LuckyCardScene.BTN_CHEAT_G_SERVER: {
                if (!Config.ENABLE_CHEAT) return;

                var gServer = parseFloat(this.txGServer.getString());
                if (isNaN(gServer)) gServer = 0;
                var gUser = parseFloat(this.txGUser.getString());
                if (isNaN(gUser)) gUser = 0;

                var cmd = new CmdSendLuckyCardCheatGServer();
                cmd.putData(gServer, gUser);
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case LuckyCardScene.BTN_SHOW_CHEAT_LIST: {
                this.viewCheatList.getParent().setVisible(!this.viewCheatList.getParent().isVisible());
                break;
            }
            case LuckyCardScene.BTN_SHOW_HIDE_CHEAT: {
                this.showHideCheat();
                break;
            }

            case LuckyCardScene.BTN_CHEAT_RESET_DATA: {
                if (!Config.ENABLE_CHEAT) break;
                var cmdReset = new CmdSendLuckyCardCheatResetData();
                GameClient.getInstance().sendPacket(cmdReset);
                cmdReset.clean();
                break;
            }

            case LuckyCardScene.BTN_CHEAT_NUM_ROLL: {
                if (!Config.ENABLE_CHEAT) break;
                if (parseInt(this.txNumRoll.getString()) > 0) {
                    var numRoll = parseInt(this.txNumRoll.getString());
                    if (numRoll < luckyCard.keyCoin) {
                        this.cheatAutoRoll(numRoll % 100);
                        for (var pos = 0; pos < Math.round(numRoll / 100); ++pos) {
                            setTimeout(function () {
                                this.cheatAutoRoll(100);
                            }.bind(this), 5000 * pos);
                        }
                    } else Toast.makeToast(2, "Số Vé cần lớn hơn số lần rút bài");

                }
            }
        }
    },

    showHideCheat: function () {
        if (this.pCheat.getPosition().x != this.pCheat.pos.x) {
            this.pCheat.setPositionX(this.pCheat.pos.x);
        } else {
            this.pCheat.setPositionX(cc.winSize.width);
            //this.pCheat.setPositionX(this.pCheat.getContentSize().width * this._scale);
            this.viewCheatList.getParent().setVisible(false);
        }
    },

    cheatAutoRoll: function (numRoll) {
        cc.log("CHEAT AUTO ROLL: " + numRoll);
        for (var pos = 0; pos < numRoll; ++pos) {
            var cmd = new CmdSendLuckyCardRoll();
            cmd.putData(1);
            GameClient.getInstance().sendPacket(cmd);
        }
    },

    generateNextItem: function () {
        var gifts = luckyCard.giftIds;
        var rndIdx = Math.floor(Math.random() * 100) % gifts.length;
        return gifts[rndIdx];
    },

    sendMetric: function () {
        var total = this.metric.touchStar + this.metric.touchFox + this.metric.touchHistory + this.metric.touchCollection + this.metric.touchHelp;
        if (total > 0) {
            cc.log("send metric log", JSON.stringify(this.metric));
            var cmd = new CmdSendLuckyCardMetric();
            cmd.putData(this.metric.touchStar, this.metric.touchFox, this.metric.touchHistory, this.metric.touchCollection, this.metric.touchHelp);
            GameClient.getInstance().sendPacket(cmd);
            cmd.clean();
        }
    },

    sendTestRegister: function () {
        if (Config.ENABLE_CHEAT && gamedata.userData.uID == 13505545) {
            cc.log("send test register");
            var cmd = new CmdSendLuckyCardCheatRegister();
            cmd.putData();
            GameClient.getInstance().sendPacket(cmd);
            cmd.clean();
        }
    },

    onBack: function () {
        //if (sceneMgr.checkBackAvailable()) {
        //return;
        //}

        if(NewVipManager.getInstance().getDataSave()){
            NewVipManager.getInstance().setWaiting(false);
        }

        //send msg metric
        this.sendMetric();
        luckyCard.sendMetricOpenShopX2();
        //

        sceneMgr.openScene(LobbyScene.className);
    },

    update: function (dt) {
        if (this.timeDelayChange > 0) {
            this.timeDelayChange -= dt;
            if (this.timeDelayChange <= 0) {
                if (this.isRunningXtreme) {
                    this.timeDelayChange = LuckyCardScene.TIME_DELAY_XTREME;
                    //if (this.countRunningXtreme === 10) LuckyCardSound.playMoreBat();
                    this.countRunningXtreme--;
                    this.onChangeCardXtreme();
                } else {
                    this.timeDelayChange = LuckyCardScene.TIME_DELAY;
                    this.onChangeCard();
                }
            }
        }

        if (this.lbTimeRemain && this.isEventTime) {
            var stime = luckyCard.getTimeLeftString();
            var nTime = luckyCard.getTimeLeft();
            this.lbTimeRemain.setString(stime);
            if (nTime <= 0 && this.isEventTime) {
                this.isEventTime = false;
                luckyCard.eventTime = LuckyCard.WEEK_END + 1;
                cc.log("end event", nTime);
                this.runAction(cc.sequence(cc.delayTime(12), cc.callFunc(function () {
                    cc.log("request event info");
                    var cmd = new CmdSendLuckyCard();
                    GameClient.getInstance().sendPacket(cmd);
                    cmd.clean();
                })));
                this.lbTimeRemain.setString(localized("LUCKYCARD_EVENT_TIMEOUT"));
                this.lbTimeRemain1.setVisible(false);
            } else {

            }
        }

        if (this.isEffectMoney) {
            this.curEffectMoney += this.deltaEffectMoney;
            this.lbGold.setString(StringUtility.formatNumberSymbol(this.curEffectMoney));
        }

        if (this.isEffectCoin) {
            this.curEffectCoin += this.deltaEffectCoin;
            this.curEffectCoin = Math.min(luckyCard.keyCoin, this.curEffectCoin);
            this.lbCoin.setString(StringUtility.standartNumber(Math.floor(this.curEffectCoin)));
        }

        if (this.timeDelayChangeLight > 0) {
            this.timeDelayChangeLight -= dt;
            if (this.timeDelayChangeLight <= 0) {
                this.effectLight();
            }
        }
    },

    // list view cheat item
    tableCellSizeForIndex: function (table, idx) {
        return cc.size(75, 120);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new LuckyCardCellCheat();
        }
        cell.setCard(luckyCard.giftStore[idx]);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return luckyCard.giftStore.length;
    },

    tableCellTouched: function (table, cell) {
        var id = luckyCard.giftStore[cell.getIdx()];

        this.txItem.setString(luckyCard.getItemName(id));
        this.txItem.id = id;
    }
});

var LuckyCardAlertGUI = BaseLayer.extend({
    ctor: function () {
        this.isQuickPlay = false;
        this._super(LuckyCardAlertGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardAlertGUI.json");
    },
    initGUI: function () {
        this.imgBG = this.getControl("imgBG");
        this.customButton("btnClose", 1, this.imgBG);
        this.btnPlay = this.customButton("btnPlay", 2, this.imgBG);
        this.customButton("btnBuy", 3, this.imgBG);
        this.setBackEnable(true);
    },
    onButtonRelease: function (btn, id) {
        switch (id) {
            case 1:
                this.onClose();
                break;
            case 2:
                if (luckyCard.isInGUIEvent() && luckyCard.luckyCardScene) {
                    luckyCard.luckyCardScene.sendMetric();
                    luckyCard.sendMetricOpenShopX2();
                }
                this.isQuickPlay = true;
                this.onClose();
                break;
            case 3: //shop
            {
                var open = gamedata.checkEnablePayment();
                luckyCard.tabEventShop = true;
                //if (open) sceneMgr.openScene(ShopIapScene.className);
                if (open) {
                    if (luckyCard.isInGUIEvent() && luckyCard.luckyCardScene) {
                        luckyCard.luckyCardScene.sendMetric();
                        luckyCard.sendMetricOpenShopX2();
                    }
                    gamedata.openShop();
                }
                break;
            }
        }
        //sceneMgr.openGUI(LuckyCardHistoryGUI.className, LuckyCard.GUI_HISTORY, LuckyCard.GUI_HISTORY);
    },
    onEnterFinish: function () {
        this.isQuickPlay = false;
        this.setShowHideAnimate(this.imgBG, true);
    },
    onBack: function () {
        this.onClose();
    },
    onCloseDone: function () {
        if (this.isQuickPlay) {
            if (CheckLogic.checkQuickPlay()) {
                var pk = new CmdSendQuickPlay();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();
            } else if (gamedata.checkEnablePayment()) {
                var msg = LocalizedString.to("QUESTION_CHANGE_GOLD");
                sceneMgr.showChangeGoldDialog(msg, this, function (buttonId) {
                    if (buttonId == Dialog.BTN_OK) {
                        gamedata.openShop();
                    }
                });
            } else {
                sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
            }
            //sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
        }
    }
});
LuckyCardAlertGUI.className = "LuckyCardAlertGUI";

var LuckyCardCollectionGUI = BaseLayer.extend({
    ctor: function () {
        this.view = null;
        this.lbTimeRemain = null;

        this._super(LuckyCardCollectionGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardCollectionGUI.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this.customButton("close", 1, bg);
        var timeRemain = this.getControl("time_remain", bg);
        timeRemain.setVisible(false);
        var txts = [];
        txts.push({"text": LocalizedString.to("LUCKYCARD_INFO_TIME_LEFT_0"), "color": cc.color(201, 201, 201, 0)});
        txts.push({"text": "", "font": SceneMgr.FONT_BOLD, "color": cc.color(255, 165, 0, 0)});
        txts.push({"text": LocalizedString.to("LUCKYCARD_INFO_TIME_LEFT_1"), "color": cc.color(201, 201, 201, 0)});
        this.lbTimeRemain = new RichLabelText();
        this.lbTimeRemain.setText(txts);
        this.lbTimeRemain.pos = timeRemain.getPosition();
        this.lbTimeRemain.setPositionY(this.lbTimeRemain.pos.y - this.lbTimeRemain.getHeight() / 2);
        bg.addChild(this.lbTimeRemain);
        this.lbTimeRemain.setVisible(false);

        var pView = this.getControl("list", bg);

        this.note = this.getControl("note", this._bg);

        this.view = new cc.TableView(this, pView.getContentSize());
        this.view.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.view.setPosition(pView.getPosition());
        this.view.reloadData();
        bg.addChild(this.view);

        this.enableFog(true);
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.note.setString(LocalizedString.to("LUCKYCARD_COLLECTION_PIECE"));

        this.setShowHideAnimate(this._bg, true);
        this.scheduleUpdate();

        // luckyCard.sortGifts(false);
        this.view.reloadData();
    },

    setShowHideAnimate: function (parent, customScale) {
        this._showHideAnimate = true;
        if (parent === undefined) {
            this._bgShowHideAnimate = this._layout;
        } else {
            this._bgShowHideAnimate = parent;
        }

        if (customScale === undefined) {
            customScale = false;
        }
        this._currentScaleBg = customScale ? this._scale : 1;

        var size = cc.director.getWinSize();
        this._bgShowHideAnimate.setPosition(cc.p(size.width / 2, -size.height / 2));
        this._bgShowHideAnimate.setOpacity(0);
        this._bgShowHideAnimate.runAction(cc.sequence(cc.spawn(new cc.EaseBackOut(cc.moveTo(0.3, cc.p(size.width / 2, size.height / 2))), cc.fadeIn(0.3)), cc.callFunc(this.finishAnimate, this)));

        if (this._layerColor) {
            this._layerColor.setVisible(true);
            this._layerColor.runAction(cc.fadeTo(0.3, 150));
        }

        if (this._fog) {
            this._fog.setVisible(true);
            this._fog.runAction(cc.fadeTo(0.3, 150));
        }
    },

    onClose: function () {
        //   luckyCard.sortGifts(true);

        if (this._layerColor && this._layerColor.isVisible())
            this._layerColor.runAction(cc.fadeTo(0.3, 0));

        if (this._fog && this._fog.isVisible())
            this._fog.runAction(cc.fadeTo(0.3, 0));

        if (this._showHideAnimate) {
            var size = cc.director.getWinSize();

            this._bgShowHideAnimate.setPosition(size.width / 2, size.height / 2);
            this._bgShowHideAnimate.runAction(cc.spawn(new cc.EaseBackIn(cc.moveTo(0.2, cc.p(size.width / 2, -size.height / 2))), cc.fadeOut(0.2)));
            this.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(this.onCloseDone.bind(this))));
        } else {
            this.onCloseDone();
        }
    },

    onButtonRelease: function (btn, id) {
        this.onBack();
    },

    onClickItem: function (item) {
        if (item.gift <= 0) return;
        cc.log("111111");
        this.onClose();
        cc.log("111111");
        var luckyScene = sceneMgr.getMainLayer();
        cc.log("111111");
        var goldPos = null;
        cc.log("111111");

        if (luckyScene)
            goldPos = luckyScene.lbGold.getParent().convertToWorldSpace(luckyScene.lbGold.getPosition());
        cc.log("111111");

        var open = sceneMgr.openGUI(LuckyCardOpenGiftGUI.className, LuckyCard.GUI_OPEN_GIFT, LuckyCard.GUI_OPEN_GIFT);
        cc.log("111111");

        if (open) open.showGift(item, goldPos);
        cc.log("111111");
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(200, 320);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new LuckyCardCollectionItem(this);
        }
        cell.setInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return luckyCard.gifts.length;
    },

    onBack: function () {
        this.onClose();
    },

    update: function (dt) {
        if (this.lbTimeRemain) {
            var stime = luckyCard.getTimeLeftString();
            var nTime = luckyCard.getTimeLeft();

            if (nTime <= 0) {
                if (luckyCard.checkWeek(LuckyCard.WEEK_3)) {
                    this.lbTimeRemain.updateText(0, LocalizedString.to("LUCKYCARD_EVENT_TIMEOUT"));
                } else {
                    this.lbTimeRemain.updateText(0, LocalizedString.to("LUCKYCARD_EVENT_NEXT_WEEK"));
                }
                this.lbTimeRemain.updateText(1, "");
                this.lbTimeRemain.updateText(2, "");
            } else {
                this.lbTimeRemain.updateText(1, stime);
            }

            this.lbTimeRemain.setPositionX(this.lbTimeRemain.pos.x - this.lbTimeRemain.getWidth() / 2);
        }
    }
});

var LuckyCardOpenResultGUI = BaseLayer.extend({
    ctor: function () {
        this.pos = [];

        this.title = null;
        this.btn = null;
        this.gift = null;

        this.goldPos = null;
        this.coinPos = null;
        this.desPos = null;

        this.logo_zp = null;

        this.defaultItem = null;

        this.bg = null;
        this.cards = [];

        this.isAutoGift = false;
        this.cmd = null;

        this._super(LuckyCardOpenResultGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardOpenResultGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        var panel = this.getControl("panel");

        this.title = this.getControl("congrat", panel);
        this.title.pos = this.title.getPosition();

        this.btn = this.customButton("btnGet", 1, panel);
        this.btn.pos = this.btn.getPosition();

        this.share = this.customButton("btnShare", 2, panel);
        this.share.pos = this.share.getPosition();

        this.number = this.getControl("number", panel);
        this.logo_zp = this.getControl("logo", panel);

        this.gift = this.getControl("gift", panel);
        this.defaultItem = this.getControl("pDefault", this.gift);
        this.defaultItem.size = this.defaultItem.getContentSize();
        //this.defaultItem.size.height += this.defaultItem.size.height * 0.5;
        this.defaultItem.padX = this.defaultItem.size.width * 0.5;
        this.defaultItem.padY = this.defaultItem.size.height * 0.05;

        for (var i = 0; i < 11; i++) {
            this.pos.push(this.getControl("p" + i, this.gift).getPosition());
        }

        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.gift.removeAllChildren();
        this.cards = [];

        this.title.setVisible(false);
        this.btn.setVisible(false);
        this.share.setVisible(false);
        this.logo_zp.setVisible(false);

        this.title.setPosition(this.title.pos);
        this.btn.setPosition(this.btn.pos);
        this.share.setPosition(this.share.pos);
        this.number.setVisible(false);
    },

    openAutoGift: function (cmd) {
        this.isAutoGift = true;

        this.title.setVisible(true);
        this.btn.setVisible(true);
        this.share.setVisible(true);
        this.bg.setOpacity(200);

        this.cmd = cmd;

        var nGift = cmd.gifts.length;
        var nCol = [];
        var nRow = 1;

        if (nGift > 5) {
            nRow = 2;
            nCol[0] = 5;
            nCol[1] = nGift - 5;
        } else {
            nRow = 1;
            nCol[0] = nGift;
        }

        var count = 0;
        for (var j = 0; j < nRow; j++) {
            var pStart = this.calculateStartPos(nCol[j], nRow, j);
            for (var i = 0; i < nCol[j]; i++) {
                var info = cmd.gifts[count++];
                var sName = luckyCard.getItemName(info.id);
                var card = new LuckyCardObject(info.id, true);
                card.info = info;
                if (sName.length > 16 && nCol[j] > 1) sName = sName.substring(0, 14) + "...";
                if (luckyCard.isItemOutGame(info.id))
                    card.setLabelText(((info.num > 1) ? (info.num + " ") : "") + sName, 0);
                else
                    card.setLabelText(((info.num > 1) ? (info.num + "x") : "") + sName, 0);

                card.setPosition(pStart.x + i * (this.defaultItem.size.width + this.defaultItem.padX), pStart.y);
                this.gift.addChild(card);
            }
        }
    },

    openGift: function (gifts, goldPos, desPos, coinPos) {
        this.isAutoGift = false;

        var numGift = gifts.length;

        this.goldPos = this.gift.convertToNodeSpace(goldPos);
        this.coinPos = this.gift.convertToNodeSpace(coinPos);
        this.desPos = this.gift.convertToNodeSpace(desPos);
        //this.desPos = cc.p(this.desPos.x - this.gift.getBoundingBox().width /4, this.desPos.y - this.gift.getBoundingBox().height /2);
        cc.log("POSITION : " + JSON.stringify(this.desPos));

        var timeDelay = 0.15;
        var timeDrop = 0.35;
        for (var i = 0; i < numGift; i++) {
            var gInfo = gifts[i];
            var pos = {};
            if (numGift > 1)
                pos = this.pos[i]; // pos by index
            else
                pos = this.pos[10]; // pos center

            var card = new LuckyCardObject(gifts[i].id, true);
            card.setScale(1.5);
            card.info = gInfo;
            card.setPosition(pos.x, pos.y + 680);
            // if (!gInfo.isStored) {
            //     //card.setLabel(StringUtility.formatNumberSymbol(gInfo.value));
            //     card.setLabelText(StringUtility.formatNumberSymbol(gInfo.value));
            // }

            this.gift.addChild(card);
            this.cards.push(card);

            card.runAction(cc.sequence(
                cc.delayTime(i * timeDelay),
                cc.moveTo(timeDrop, pos).easing(cc.easeIn(2)),
                cc.callFunc(this.finishCardMoving.bind(card))
            ));
        }

        this.bg.setOpacity(0);
        this.bg.setVisible(true);
        this.bg.runAction(cc.fadeTo(timeDelay * numGift + timeDrop, 220));

        this.runAction(cc.sequence(
            cc.delayTime(timeDrop),
            cc.callFunc(LuckyCardSound.playGift),
            cc.delayTime(timeDelay * numGift),
            cc.callFunc(this.onFinishEffect.bind(this))
        ));

        if (numGift == 1 && (gifts[0].id > LuckyCard.ITEM_STORED) && luckyCard.getInfoGift(gifts[0].id)) {
            var strNum = LocalizedString.to("LUCKYCARD_EVENT_HAVING") + " " + (luckyCard.getInfoGift(gifts[0].id).item % 4 + luckyCard.getInfoGift(gifts[0].id).gift * 4) + "/4";
            this.number.setString(strNum);
            this.number.setVisible(true);

        } else this.number.setVisible(false);
    },

    getGift: function () {
        this.title.setVisible(true);
        this.title.setPosition(this.title.pos);
        this.title.runAction(new cc.EaseBackIn(cc.moveTo(0.35, cc.p(this.title.pos.x, this.title.pos.y + 400))));

        this.btn.setVisible(true);
        this.btn.setPosition(this.btn.pos);
        this.btn.runAction(new cc.EaseBackIn(cc.moveTo(0.35, cc.p(this.btn.pos.x, this.btn.pos.y - 400))));

        this.share.setVisible(true);
        this.share.setPosition(this.share.pos);
        this.share.runAction(new cc.EaseBackIn(cc.moveTo(0.35, cc.p(this.share.pos.x, this.share.pos.y - 400))));

        var timeDelay = 0.15;
        var timeFly = 0.25;
        var size = this.cards.length;
        //size = 1;
        var valueGold = 0;
        var valueCoin = 0;
        for (var i = 0; i < size; i++) {
            var card = this.cards[i];
            cc.log("REWARD WINDOWS CARD INFO: " + JSON.stringify(card.info));
            if (card.info.isStored) {
                card.runAction(cc.sequence(
                    cc.delayTime(i * timeDelay),
                    cc.moveTo(timeFly - timeDelay * i / size, this.desPos),
                    cc.scaleTo(timeFly, 0).easing(cc.easeBackIn()),
                    cc.removeSelf()
                ));
            } else if (!luckyCard.isItemCoin(card.info.id)) {
                card.runAction(cc.sequence(
                    cc.scaleTo(0.2, 0).easing(cc.easeBackIn()),
                    cc.callFunc(this.goldDrop.bind(this, card.getPosition(), i)),
                    cc.removeSelf()
                ));
                valueGold += card.info.value;
            } else {
                card.runAction(cc.sequence(
                    cc.scaleTo(0.2, 0).easing(cc.easeBackIn()),
                    cc.callFunc(this.coinDrop.bind(this, card.getPosition(), i, card.info.value)),
                    cc.removeSelf()
                ));
                valueCoin += card.info.value;
            }

        }

        if (luckyCard.luckyCardScene) {
            luckyCard.luckyCardScene.onEffectGetMoneyItem(valueGold);
        }
        if (luckyCard.luckyCardScene) {
            luckyCard.luckyCardScene.onEffectGetCoinItem(valueCoin);
        }

        this.bg.setOpacity(220);
        this.bg.setVisible(true);
        this.bg.runAction(cc.fadeOut(timeDelay * size + 2 * timeFly));
        this.runAction(cc.sequence(cc.delayTime(timeDelay * size + 2 * timeFly), cc.callFunc(this.onCloseGUI.bind(this))));
    },

    goldDrop: function (pos, i) {
        var result = false;
        var timeDelay = 0.08; //randomFloat(0.02, 0.04);
        var timeFly = 0.20;
        for (var xx = 0; xx < 5; xx++) {
            var sp = new LuckyCardGoldDrop();
            if (sp) {
                sp.setParameter(1, 1, Math.round(Math.random() * 5) + 20);
                sp.initCoin();
                sp.start();
                sp.setPosition(pos);
                sp.setScale(0.7);
                this.gift.addChild(sp);

                var bezier = [
                    sp.getPosition(),
                    cc.p(sp.getPositionX() - randomInt(-150, 150), sp.getPositionY() + randomInt(-200, 200)),
                    this.goldPos
                ];
                sp.runAction(cc.sequence(
                    cc.fadeIn(0.1),
                    cc.delayTime(timeDelay * i + xx * 0.02),
                    cc.spawn(
                        cc.scaleTo(2 * timeFly - timeDelay * i / 10, 0.25),
                        cc.BezierTo.create(2 * timeFly, bezier),
                        cc.repeatForever(cc.rotateBy(0.3, 30))
                    ),
                    cc.spawn(
                        cc.scaleTo(0.3, 0.4),
                        cc.fadeOut(0.3)
                    ),
                    cc.removeSelf()
                ));

                result = true;
            }
        }
        return result;
    },

    coinDrop: function (pos, i, num) {
        var result = false;
        var timeDelay = 0.08; //randomFloat(0.02, 0.04);
        var timeFly = 0.20;
        for (var xx = 0; xx < num; xx++) {
            var sp = new LuckyCardCoinDrop();
            if (sp) {

                sp.setParameter(0.55, 0.55, Math.round(Math.random() * 5) + 20);
                sp.initCoin();
                sp.start();
                sp.setOpacity(255);
                sp.setScale(LuckyCardCoinDrop.scaleEfx * 3.5);

                sp.setPosition(pos);
                this.gift.addChild(sp);

                var bezier = [
                    sp.getPosition(),
                    cc.p(sp.getPositionX() - randomInt(-150, 150), sp.getPositionY() + randomInt(-200, 200)),
                    this.coinPos
                ];
                sp.runAction(cc.sequence(
                    cc.fadeIn(0.1),
                    cc.delayTime(timeDelay * i + xx * 0.02),
                    cc.spawn(
                        cc.scaleTo(2 * timeFly - timeDelay * i / 10, 0.1),
                        cc.BezierTo.create(2 * timeFly, bezier)
                    ),
                    cc.spawn(
                        cc.scaleTo(0.3, 0.2),
                        cc.fadeOut(0.3)
                    ),
                    cc.removeSelf()
                ));

                result = true;
            }
        }
        return result;
    },

    finishCardMoving: function (card) {
        if (card.itemId > LuckyCard.ITEM_STORED) {
            card.outGameImage.setVisible(true);
            card.outGameImage.runAction(cc.sequence(
                cc.scaleTo(0, 1, this.outGameImage.orgScaleY),
                cc.fadeIn(0),
                cc.scaleTo(0.5, 1.5, this.outGameImage.orgScaleY * 1.5),
                cc.spawn(cc.scaleTo(0.5, 1.75, this.outGameImage.orgScaleY * 1.75), cc.fadeOut(0.5)),
                cc.delayTime(0.5)
            ).repeatForever());

            LuckyCardSound.playSpecialGift();
        } else {
            card.outGameImage.setVisible(false);
            if (luckyCard.isItemCoin(card.itemId))
                card.inGameParticle.setStartColor(cc.color(255, 90, 255));
            card.inGameParticle.setVisible(true);
            this.inGameParticle.setEmissionRate(50);
            this.inGameParticle.resetSystem();
        }
    },

    onFinishEffect: function () {
        this.title.setVisible(true);
        this.title.setPositionY(this.title.pos.y + 400);
        this.title.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.title.pos)));

        this.btn.setVisible(true);
        this.btn.setPositionY(this.btn.pos.y - 400);
        this.btn.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.btn.pos)));

        this.share.setVisible(true);
        this.share.setPositionY(this.share.pos.y - 400);
        this.share.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.share.pos)));
    },

    effectMoney: function (sender, value) {
        if (value === undefined || value == null) return;

        if (luckyCard.luckyCardScene) {
            luckyCard.luckyCardScene.onEffectGetMoneyItem(value);
        }
    },

    onButtonRelease: function (btn, id) {
        if (id == 1) {
            this.onBack();
        } else {
            this.onCapture();
        }
    },

    onBack: function () {
        if (this.isAutoGift) {
            var gIds = [];
            for (var i = 0; i < this.cmd.gifts.length; i++) {
                if (luckyCard.isItemOutGame(this.cmd.gifts[i].id)) {
                    gIds.push(this.cmd.gifts[i].id);
                }
            }
            if (gIds.length > 0) {
                if (luckyCard.isRegisterSuccess) {
                    var cmd = new CmdSendLuckyCardChangeAward();
                    cmd.putData(false, gIds);
                    GameClient.getInstance().sendPacket(cmd);
                    //NewVipManager.getInstance().setWaiting(true);
                } else {
                    luckyCard.showRegisterInformation(gIds);
                }
            }
            this.onClose();
        } else {
            this.getGift();
        }
    },

    onCapture: function () {
        this.share.setVisible(false);
        this.btn.setVisible(false);

        this.logo_zp.setVisible(true);

        if (!gamedata.checkOldNativeVersion()) {
            var imgPath = sceneMgr.takeScreenShot();
            setTimeout(function () {
                fr.facebook.shareScreenShoot(imgPath, function (result) {
                    var message = "";
                    if (result == -1) {
                        message = localized("INSTALL_FACEBOOK");
                    } else if (result == 1) {
                        message = localized("NOT_SHARE");
                    } else if (result == 0) {
                        message = localized("FACEBOOK_DELAY");
                    } else {
                        message = localized("FACEBOOK_ERROR");
                    }
                    Toast.makeToast(Toast.SHORT, message);
                });
            }, 500);
        } else {
            this.captureSuccess = function (social, jdata) {
                var message = "";
                var dom = StringUtility.parseJSON(jdata);
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

                //this.topLayer.doneCapturePanel();
            }.bind(this);

            socialMgr.set(this, this.captureSuccess);
            socialMgr.shareImage(socialMgr._currentSocial);

        }

        this.share.setVisible(true);
        this.btn.setVisible(true);

        this.logo_zp.setVisible(false);
    },

    onCloseGUI: function () {
        luckyCard.luckyCardScene.onFinishEffectShowResult();
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
        pos.y = pSize.height * 0.5 - nHeight / 2 + iH * row + iH / 2 - cc.winSize.height * 0.03;
        return pos;
    }
});

var LuckyCardOpenGiftGUI = BaseLayer.extend({
    ctor: function () {
        this.gift = null;
        this.lbNotice = null;
        this.lbName = null;
        this.info = null;
        this.btn = null;

        this.share = null;
        //this.girl = null;
        //this.logo_event = null;
        this.logo_zp = null;

        this.pEffect = null;

        this.panel = null;
        this.title = null;
        this.particle = null;
        this.circle = null;

        // effect gold drop
        this.spaceEffect = null;
        this.debugNode = null;
        this.spriteBatchNode = null;
        this.effSprites = [];
        this.goldPos = null;
        this.isGStar = false;
        this.effectGstar = null;

        this._super(LuckyCardOpenGiftGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardOpenGiftGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        cc.log("DONE INIT GUI");
        //this.girl = this.getControl("girl");
        this.effectGstar = this.getControl("panelGstar");
        this.logo_zp = this.getControl("logo");
        cc.log("DONE INIT GUI");

        this.panel = this.getControl("panel");
        cc.log("DONE INIT GUI");

        this.pEffect = this.getControl("effect");
        cc.log("DONE INIT GUI");

        this.lbNotice = this.getControl("lb", this.panel);
        this.lbName = this.getControl("gift", this.panel);
        this.gift = this.getControl("img", this.panel);
        this.gift.pos = this.gift.getPosition();
        this.btn = this.customButton("btn", 1, this.panel);
        this.share = this.customButton("share", 2, this.panel);
        cc.log("DONE INIT GUI");

        this.title = this.getControl("title", this.panel);
        this.circle = this.getControl("circle", this.panel);
        this.particle = this.panel.getChildByName("particle");
        cc.log("DONE INIT GUI");

        this.lbNotice.pos = this.lbNotice.getPosition();
        this.lbName.pos = this.lbName.getPosition();
        this.gift.pos = this.gift.getPosition();
        this.btn.pos = this.btn.getPosition();
        this.share.pos = this.share.getPosition();
        this.title.pos = this.title.getPosition();
        this.circle.pos = this.circle.getPosition();
        this.particle.pos = this.particle.getPosition();
        cc.log("DONE INIT GUI");

        this.setBackEnable(true);
        cc.log("DONE INIT GUI");
    },

    initSpaceEffect: function () {
        // add physic layer
        if (this.debugNode && this.debugNode.getParent()) {
            this.debugNode.removeFromParent();
            this.debugNode = null;

            this.spaceEffect = null;
        }

        if (this.spriteBatchNode) {
            this.spriteBatchNode.removeAllChildren(true);
        } else {
            this.spriteBatchNode = new cc.SpriteBatchNode("res/Event/LuckyCard/WishStar/item_0.png");
            this.addChild(this.spriteBatchNode);
        }

        this.spaceEffect = new cp.Space();
        this.spaceEffect.gravity = cp.v(0, -3000);

        //add grand
        var winSize = cc.director.getWinSize();
        var staticBody = this.spaceEffect.getStaticBody();
        var wall = new cp.SegmentShape(staticBody, cp.v(0, -295), cp.v(winSize.width, -295), 300);
        wall.setElasticity(0.5);
        wall.setFriction(1);
        this.spaceEffect.addStaticShape(wall);

        this.debugNode = new cc.PhysicsDebugNode(this.spaceEffect.handle);
        this.debugNode.visible = false;
        this.addChild(this.debugNode, 100);

        this.effSprites = [];
    },

    effectGstarRain: function () {
        this.bg.setVisible(false);

        this.info = {id: 1005};

        this.effectGstar.removeAllChildren();
        var n = 100 + Math.round(Math.random() * 100);
        for (var i = 0; i < n; i++) {
            var droplet;
            var lifeTime = Math.random() + 1;

            if (luckyCard.isVPoint(this.info.id)) {
                droplet = new cc.Sprite("res/Event/LuckyCard/WishStar/smallGStar.png");
                droplet.setScale(0.75 + Math.random());
            }
            else if (luckyCard.isDiamond(this.info.id)) {
                droplet = new cc.Sprite("res/Event/LuckyCard/WishStar/iconDiamond.png");
                droplet.setScale(0.75 + Math.random());
            }
            else {
                droplet = new LuckyCardGoldDrop();
                droplet.setScale(0.5);
                droplet.runAction(cc.sequence(
                    cc.delayTime(0.02 * i),
                    cc.callFunc(function () {
                        this.start();
                    }.bind(droplet)),
                    cc.scaleTo(lifeTime, 1)
                ))
            }
            this.effectGstar.addChild(droplet);

            droplet.setVisible(false);
            droplet.setPosition(cc.p(
                cc.winSize.width * Math.random(),
                cc.winSize.height * 1.15
            ));

            droplet.runAction(cc.sequence(
                cc.delayTime(0.02 * i),
                cc.show(),
                cc.spawn(
                    cc.rotateTo(lifeTime, 720 + 720 * Math.random()),
                    cc.moveBy(lifeTime, 0, -cc.winSize.height * 1.15).easing(cc.easeBounceOut()),
                    cc.moveBy(lifeTime, 500 - 1000 * Math.random(), 0).easing(cc.easeIn(2))
                ),
                cc.moveBy(lifeTime / 6, 0, 150 + 150 * Math.random()),
                cc.spawn(
                    cc.scaleTo(lifeTime / 6, 1.2),
                    cc.fadeOut(lifeTime / 6)
                )
            ));
        }
    },

    createSpritePhysic: function (size, pos) {
        // this.effectGstarRain();
        this.bg.setVisible(false);
        if (luckyCard.luckyCardScene) luckyCard.luckyCardScene.rainEffect(this.info.id);
        return;

        var body = new cp.Body(1, cp.momentForBox(1, size.width, size.height));
        body.setPos(pos);
        this.spaceEffect.addBody(body);

        var shape = cp.BoxShape(body, size.width, size.height);
        shape.setElasticity(0.5);
        shape.setFriction(0.5);
        this.spaceEffect.addShape(shape);

        var sprite = new cc.PhysicsSprite("res/Event/LuckyCard/WishStar/smallGoldEffect.png");
        sprite.setBody(body.handle);
        sprite.setPosition(pos);
        this.spriteBatchNode.addChild(sprite);

        this.effSprites.push(sprite);
    },

    onFinishEffectPhysics: function () {
        this.runAction(cc.sequence(cc.delayTime(3.5), cc.callFunc(this.onClose.bind(this))));
        NewVipManager.checkShowUpLevelVip();
        return;
        if (this.info.id == 1004) {
            this.runAction(cc.sequence(cc.delayTime(2.5), cc.callFunc(this.onClose.bind(this))));
            return;
        }
        var winSize = cc.director.getWinSize();
        var time = 0;
        for (var i = 0; i < this.effSprites.length; i++) {
            var sp = cc.Sprite.create("res/Event/LuckyCard/WishStar/smallGoldEffect.png");
            sp.setPosition(this.effSprites[i].getPosition());
            this.spriteBatchNode.addChild(sp);
            this.effSprites[i].removeFromParent();
            time = 0.01 * i;
            if (this.goldPos) {
                var bezier = [sp.getPosition(), cc.p(winSize.width / 2, winSize.height / 2), this.goldPos];
                sp.runAction(cc.sequence(cc.delayTime(time), cc.spawn(cc.scaleTo(0.25, 0.5), cc.fadeTo(0.25, 25), cc.BezierTo.create(0.25, bezier)), cc.sequence(cc.scaleTo(0.1, 1), cc.scaleTo(0.05, 0.1)), cc.removeSelf()));
            }
        }
        //this.spriteBatchNode.removeAllChildren();
        this.effSprites = [];

        time += 0.25;

        if (this.bg) {
            this.bg.setVisible(true);
            this.bg.runAction(cc.fadeOut(time));
        }
        this.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(this.onClose.bind(this))));
    },

    onEnterFinish: function () {
        this.bg.setOpacity(255);
        this.bg.setVisible(true);

        this.panel.setVisible(true);
        this.panel.setOpacity(255);

        this.pEffect.setVisible(false);
        this.pEffect.removeAllChildren();

        this.btn.setVisible(true);
        this.share.setVisible(true);
        this.share.setBright(true);

        //this.girl.setVisible(false);
        //this.logo_event.setVisible(false);
        this.logo_zp.setVisible(false);

        this.initSpaceEffect();
        this.scheduleUpdate();
        this.effectGstar.removeAllChildren();
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
        //this.lbNotice.setVisible(true);

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
        this.gift.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(LuckyCardSound.playGift), cc.EaseBackOut(cc.scaleTo(0.5, 1))));

        this.circle.setScale(0);
        this.circle.runAction(cc.sequence(cc.spawn(cc.scaleTo(1.5, 1), cc.rotateTo(1.5, 360)), cc.repeatForever(cc.rotateBy(0.15, 5))));
        this.circle.runAction(cc.repeatForever(cc.rotateBy(0.15, 5)));
    },

    showGift: function (inf, goldPos) {
        this.info = inf;
        this.goldPos = goldPos;
        this.gift.removeAllChildren();
        this.gift.setOpacity(255);
        this.gift.setVisible(true);

        if (inf.gift > 1) {
            this.lbName.setString(inf.gift + "x" + luckyCard.getItemName(this.info.id));
        } else {
            this.lbName.setString(luckyCard.getItemName(this.info.id));
        }

        if (luckyCard.isItemOutGame(inf.id))
            this.lbName.setString(((inf.gift > 1) ? (inf.gift + " ") : "") + luckyCard.getItemName(this.info.id));

        cc.log("IMAGE " + luckyCard.getGiftImage(this.info.id));
        var sp = cc.Sprite.create(luckyCard.getGiftImage(this.info.id));
        sp.setScale(0.8);
        this.gift.addChild(sp);
        var pSize = this.gift.getContentSize();
        sp.setPosition(pSize.width / 2, pSize.height / 2);

        this.doAnimate();
    },

    onGiftSuccess: function () {
        //this.pEffect.setVisible(true);
        //this.circle.setVisible(false);
        //this.particle.setVisible(false);
        //
        ////var numGold = (this.info.id % 1000) * 10;
        //var timeDone = 2;
        //var numGold = 100;
        //var eff = new CoinEffectLayer();
        //eff.setPositionCoin(SceneMgr.convertPosToParent(this.pEffect, this.gift));
        //eff.startEffect(numGold, CoinEffectLayer.TYPE_FLOW);
        //eff.setCallbackFinish(this.onBack.bind(this));
        //this.pEffect.addChild(eff);
        //this.gift.runAction(cc.fadeOut(timeDone));
        //
        //if (this.bg) {
        //    this.bg.setVisible(true);
        //    this.bg.runAction(cc.fadeOut(timeDone));
        //}
        //return;
        //this.pEffect.setVisible(true);
        //var emitter = new cc.ParticleSystem("res/Event/LuckyCard/particle_money_" + this.info.id +".plist");
        //this.pEffect.addChild(emitter);
        //emitter.setPosition(0,size.height);
        //
        //this.panel.runAction(cc.sequence(cc.delayTime(0.5),cc.fadeOut(0.5),cc.delayTime(1),cc.callFunc(this.onBack.bind(this))));

        var time = 0.25;
        this.gift.setPosition(this.gift.pos);
        this.gift.runAction(cc.EaseBackIn(cc.moveTo(time, cc.p(this.gift.pos.x, this.gift.pos.y + 650))));

        var winSize = cc.director.getWinSize();
        var nGold = (this.info.id - 1000);
        var deltaGold = 30;
        var numGold = nGold * deltaGold;

        var size = cc.size(40, 40);
        var pos = cc.p(50, winSize.height);
        var deltaPos = Math.round(winSize.width / 32);

        var count = 0;
        var line = 0;
        numGold = 1;
        for (var i = 0; i < numGold; i++) {
            var nextPos = pos.x + deltaPos * count;
            if (nextPos > winSize.width - 50) {
                count = 0;
                line++;
            } else {
                count++;
            }

            this.runAction(cc.sequence(
                cc.delayTime(time + Math.random()),
                cc.callFunc(this.createSpritePhysic.bind(this, size, cc.p(nextPos, pos.y + line * 40)))
            ));
        }

        this.runAction(cc.sequence(cc.delayTime(3), cc.callFunc(this.onFinishEffectPhysics.bind(this))));
    },

    //effect get money
    effectGetMoney: function () {
        var emitter1 = new cc.ParticleSystem("Particles/BurstPipe.plist");
        var batch = new cc.ParticleBatchNode(emitter1.texture);
        batch.setScale(1.4);
        batch.addChild(emitter1);
        batch.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height));
        this.addChild(batch);
    },

    onButtonRelease: function (button, id) {
        if (id == 1) {
            var gIds = [];
            gIds.push(this.info.id);

            this.btn.setVisible(false);
            this.share.setVisible(false);

            this.circle.setVisible(false);
            this.particle.setVisible(false);

            this.title.setVisible(false);
            this.lbName.setVisible(false);
            this.lbNotice.setVisible(false);

            if (luckyCard.isItemOutGame(this.info.id)) {
                if (luckyCard.isRegisterSuccess) {
                    var cmd = new CmdSendLuckyCardChangeAward();
                    cmd.putData(false, gIds);
                    GameClient.getInstance().sendPacket(cmd);
                } else {
                    this.onBack();

                    luckyCard.showRegisterInformation(gIds);
                }
            } else {
                var cmd = new CmdSendLuckyCardChangeAward();
                cmd.putData(true, gIds);
                GameClient.getInstance().sendPacket(cmd);
                NewVipManager.getInstance().setWaiting(true);
            }
        } else {
            this.onCapture();
        }
    },

    onCapture: function () {
        cc.log("onCapture 2");
        this.share.setVisible(false);
        this.btn.setVisible(false);

        //this.girl.setVisible(true);
        this.logo_zp.setVisible(true);
        //this.logo_event.setVisible(true);

        if (!gamedata.checkOldNativeVersion()) {
            var imgPath = sceneMgr.takeScreenShot();
            setTimeout(function () {
                fr.facebook.shareScreenShoot(imgPath, function (result) {
                    var message = "";
                    if (result == -1) {
                        message = localized("INSTALL_FACEBOOK");
                    } else if (result == 1) {
                        message = localized("NOT_SHARE");
                    } else if (result == 0) {
                        message = localized("FACEBOOK_DELAY");
                    } else {
                        message = localized("FACEBOOK_ERROR");
                    }
                    Toast.makeToast(Toast.SHORT, message);
                });
            }, 500);
        } else {
            this.captureSuccess = function (social, jdata) {
                var message = "";
                var dom = StringUtility.parseJSON(jdata);
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

                //this.topLayer.doneCapturePanel();
            }.bind(this);

            socialMgr.set(this, this.captureSuccess);
            socialMgr.shareImage(socialMgr._currentSocial);

        }

        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
            this.share.setVisible(true);
            this.btn.setVisible(true);
        }.bind(this))));

        //this.girl.setVisible(false);
        this.logo_zp.setVisible(false);
        //this.logo_event.setVisible(false);
    },

    onBack: function () {
        this.onClose();
    },

    update: function (dt) {
        if (this.spaceEffect)
            this.spaceEffect.step(dt);
    },
});

var LuckyCardAccumulateGUI = BaseLayer.extend({
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

        this._super(LuckyCardAccumulateGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardAccumulateGUI.json");
    },

    initGUI: function () {
        this.progress = this.getControl("progress");
        this.progress.defaultPos = this.progress.getPosition();

        this.bar = this.getControl("bar", this.progress);
        this.num = this.getControl("num", this.progress);
        this.exp = this.getControl("exp", this.progress);
        this.bonus = this.getControl("bonus", this.progress);
        this.bonus.defaultPos = this.bonus.getPosition();

        this.imgTipX2 = this.getControl("imgTipX2", this.progress);

        var panel = this.getControl("imagePanel", this.progress);
        panel.setVisible(false);
        this.mainPotion = this.getControl("image_1", panel);
        this.potionOne = this.getControl("image_0", panel);
        this.potionTwo = this.getControl("image", panel);

        //this.getControl("title", this.progress).setString(LocalizedString.to("LUCKYCARD_TOTAL_KEYCOIN"));

        this.tab = this.getControl("tab");
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
                        keyCoin: luckyCard.keyCoin,
                        nextLevelExp: luckyCard.nextLevelExp,
                        curLevelExp: luckyCard.curLevelExp,
                        additionExp: 0
                    });
                    this.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.onCloseGUI.bind(this))));
                    break;
            }
        }, this);
    },

    onEnterFinish: function () {
        this.result = null;

        this.progress.setPositionX(this.progress.defaultPos.x + this.progress.getContentSize().width);

        this.bonus.setVisible(false);
        this.bonus.setString("");
        this.bonus.setPosition(this.bonus.defaultPos);
        this.exp.setString(luckyCard.curLevelExp + "/" + luckyCard.nextLevelExp);

        this.tab.setOpacity(255);
        this.tab.removeAllChildren();
        this.imgTipX2.setVisible(luckyCard.showX2G && luckyCard.showx2_daily);
    },

    showAccumulate: function (cmd) {
        if (!cmd) return;
        //this.potionPrepare();

        this.tab.setTouchEnabled(false);
        this.tab.stopAllActions();
        this.tab.runAction(cc.fadeOut(LuckyCardAccumulateGUI.TIME_MOVE));

        this.result = cmd;
        this.isKeyCoinChange = (cmd.keyCoin > luckyCard.keyCoin);

        this.curExpTmp = luckyCard.curLevelExp;
        this.nextExpTmp = (luckyCard.nextLevelExp <= cmd.nextLevelExp) ? luckyCard.nextLevelExp : cmd.nextLevelExp;

        var perExp = luckyCard.getExpPercent();
        perExp = (perExp < 2.5 && perExp > 0) ? 2.5 : perExp;
        this.bar.setPercent(perExp);
        this.num.setString(StringUtility.pointNumber(luckyCard.keyCoin));
        this.exp.setString(luckyCard.getExpString());

        this.progress.runAction(cc.sequence(
            new cc.EaseExponentialOut(cc.moveTo(LuckyCardAccumulateGUI.TIME_MOVE, this.progress.defaultPos)),
            cc.callFunc(this.endMoving.bind(this))
        ));

        if (!this.tab.isVisible()) return;
        this.tab.removeAllChildren();
    },

    setAllShow: function (bool) {
        this.isAllShow = bool;
        this.tab.setVisible(bool);
        this.tab.setTouchEnabled(bool);
    },

    potionPrepare: function () {
        this.resetDefaultPosition(this.mainPotion);
        this.mainPotion.setVisible(false);
        this.resetDefaultPosition(this.potionOne);
        this.potionOne.setVisible(false);
        this.resetDefaultPosition(this.potionTwo);
        this.potionTwo.setVisible(false);
    },

    potionEffect: function () {
        this.mainPotion.y += 50;
        this.mainPotion.runAction(cc.sequence(
            cc.fadeOut(0),
            cc.show(),
            cc.fadeIn(0.1),
            cc.spawn(
                cc.moveTo(0.25, this.mainPotion.defaultPos.x, this.mainPotion.defaultPos.y).easing(cc.easeIn(3)),
                cc.scaleTo(0.25, this.mainPotion.defaultSca - 0.3, this.mainPotion.defaultSca + 0.3)
            ),
            cc.scaleTo(0.15, this.mainPotion.defaultSca + 0.3, this.mainPotion.defaultSca - 0.3).easing(cc.easeOut(3)),
            cc.scaleTo(0.15, this.mainPotion.defaultSca).easing(cc.easeIn(3))
        ));
        this.potionOne.runAction(cc.sequence(
            // cc.scaleTo(0, 0.2),
            cc.rotateTo(0, 0),
            cc.delayTime(0.5),
            cc.show(),
            cc.spawn(
                cc.rotateTo(0.25, this.potionOne.defaultRot).easing(cc.easeBackOut()),
                cc.scaleTo(0.25, this.potionOne.defaultSca).easing(cc.easeBackOut())
            )
        ));
        this.potionTwo.runAction(cc.sequence(
            // cc.scaleTo(0, 0.2),
            cc.rotateTo(0, 0),
            cc.delayTime(0.65),
            cc.show(),
            cc.spawn(
                cc.rotateTo(0.25, this.potionTwo.defaultRot).easing(cc.easeBackOut()),
                cc.scaleTo(0.25, this.potionTwo.defaultSca).easing(cc.easeBackOut())
            )
        ));
    },

    resetDefaultPosition: function (control) {
        this._super(control);
        if (control === undefined) return;
        try {
            if (control.defaultRot === undefined) control.defaultRot = control.getRotationY();
            else control.setRotation(control.defaultRot);
        } catch (e) {

        }
        try {
            if (control.defaultSca === undefined) control.defaultSca = control.getScale();
            else control.setScale(control.defaultSca);
        } catch (e) {

        }
    },

    endMoving: function () {
        // effect bar progress
        this.perLoad = [];
        this.deltaLoad = [];

        //this.potionEffect();
        if (this.result.curLevelExp != luckyCard.curLevelExp ||
            this.result.nextLevelExp != luckyCard.nextLevelExp ||
            this.result.keyCoin != luckyCard.keyCoin) {
            if (luckyCard.nextLevelExp > 1) {
                if (luckyCard.curLevelExp + this.result.additionExp >= luckyCard.nextLevelExp) {
                    this.deltaLoad.push(luckyCard.nextLevelExp - luckyCard.curLevelExp);
                    this.deltaLoad.push(this.result.additionExp - luckyCard.nextLevelExp + luckyCard.curLevelExp);

                    this.perLoad.push(this.getPerLoad(luckyCard.nextLevelExp - luckyCard.curLevelExp, luckyCard.nextLevelExp));
                    this.perLoad.push(this.getPerLoad(this.result.additionExp - luckyCard.nextLevelExp + luckyCard.curLevelExp, this.result.nextLevelExp));
                } else {
                    this.deltaLoad.push(this.result.additionExp);
                    this.perLoad.push(this.getPerLoad(this.result.additionExp, this.result.nextLevelExp));
                }
            } else {
                var oldExp = this.result.currentLevelExp - this.result.additionExp;
                this.exp.setString(StringUtility.pointNumber(oldExp) + "/" + StringUtility.pointNumber(this.result.nextLevelExp));
                this.bar.setPercent(parseFloat(oldExp * 100 / this.result.nextLevelExp));

                this.deltaLoad.push(this.result.additionExp);
                this.perLoad.push(this.getPerLoad(this.result.additionExp, this.result.nextLevelExp));
            }

            // bonus
            this.bonus.setVisible(this.isKeyCoinChange);
            this.bonus.setString("+" + StringUtility.pointNumber(this.result.keyCoinAdd));
            this.bonus.runAction(cc.sequence(
                cc.scaleTo(0.15, 1.25, 1.25),
                cc.scaleTo(0.15, 0.8, 0.8),
                cc.scaleTo(0.15, 1, 1)
            ));

            // start loading
            this.curLoad = 0;
            this.timeLoad = LuckyCardAccumulateGUI.TIME_PROGRESS / this.perLoad.length;
            for (var i = 0; i < this.perLoad.length; i++) {
                this.perLoad[i] = LuckyCardAccumulateGUI.TIME_DELTA * this.perLoad[i] / this.timeLoad;
                this.deltaLoad[i] = LuckyCardAccumulateGUI.TIME_DELTA * this.deltaLoad[i] / this.timeLoad;
            }
            this.schedule(this.update, LuckyCardAccumulateGUI.TIME_DELTA);

            // update luckyCard info
            luckyCard.curLevelExp = this.result.currentLevelExp;
            luckyCard.nextLevelExp = this.result.nextLevelExp;
            luckyCard.keyCoin = this.result.keyCoin;
        } else this.bonus.setVisible(false);
    },

    endCoin: function () {
        if (this.isKeyCoinChange) {
            this.num.runAction(cc.sequence(
                cc.scaleTo(0.15, 1.25, 1.25),
                cc.callFunc(function () {
                    this.setString(StringUtility.pointNumber(luckyCard.keyCoin));
                }.bind(this.num)),
                cc.scaleTo(0.15, 0.8, 0.8),
                cc.scaleTo(0.15, 1, 1)
            ));
        } else {
            this.num.setString(StringUtility.pointNumber(luckyCard.keyCoin));
        }
    },

    onFinishLoad: function () {
        if (this.curLoad >= this.perLoad.length) {
            var perExp = luckyCard.getExpPercent();
            perExp = (perExp < 2.5 && perExp > 0) ? 2.5 : perExp;
            this.bar.setPercent(perExp);
            this.exp.setString(luckyCard.getExpString());
            this.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.onCloseGUI.bind(this))));

            if (this.result.keyCoinAward <= 0) {
                this.endCoin();
            }
        }
    },

    onCloseGUI: function () {
        cc.log("CLOSE ACCUMULATE");
        var moveTo = cc.moveTo(LuckyCardAccumulateGUI.TIME_MOVE, cc.p(this.progress.defaultPos.x + this.progress.getContentSize().width, this.progress.defaultPos.y));
        if (this.isAllShow) {
            this.tab.setTouchEnabled(true);
            this.tab.runAction(cc.fadeTo(LuckyCardAccumulateGUI.TIME_MOVE, 255));
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
            this.bar.setPercent(this.bar.getPercent() + this.perLoad[this.curLoad]);

            this.curExpTmp += this.deltaLoad[this.curLoad];
            this.exp.setString(StringUtility.pointNumber(this.curExpTmp) + "/" + StringUtility.pointNumber(this.nextExpTmp));

            this.timeLoad -= LuckyCardAccumulateGUI.TIME_DELTA;
            if (this.timeLoad <= 0) {
                this.curExpTmp = 0;
                this.nextExpTmp = this.result.nextLevelExp;

                this.bar.setPercent(0);
                this.curLoad += 1;
                if (this.perLoad.length > 0) this.timeLoad = LuckyCardAccumulateGUI.TIME_PROGRESS / this.perLoad.length;

                this.onFinishLoad();
            }
        }
    }
});

var LuckyCardEventNotifyGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(LuckyCardEventNotifyGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardEventNotifyGUI.json");
    },

    initGUI: function () {
        //this.timeTxt = this.getControl("time");

        this.bg = this.getControl("bg_image");
        this.customButton("close", LuckyCardEventNotifyGUI.BTN_CLOSE, this.bg);
        this.btnJoin = this.customButton("join", LuckyCardEventNotifyGUI.BTN_JOIN, this.bg);

        this.txtStartTime = this.getControl("time1", this.bg);
        this.txtEndTime = this.getControl("time3", this.bg);

        // var pTime = this.getControl("time");
        //
        // var txts = [];
        // txts.push({"text": LocalizedString.to("LUCKYCARD_INFO_TIME_FROM"), "color": cc.color(255, 255, 255, 0)});
        // txts.push({"text": "", "font": SceneMgr.FONT_BOLD, "color": cc.color(255, 243, 172, 0)});
        // txts.push({"text": LocalizedString.to("LUCKYCARD_INFO_TIME_TO"), "color": cc.color(255, 255, 255, 0)});
        // txts.push({"text": "", "font": SceneMgr.FONT_BOLD, "color": cc.color(255, 243, 172, 0)});
        // this.lbTime = new RichLabelText();
        // this.lbTime.setText(txts);
        // this.lbTime.pos = pTime.getPosition();
        // this.lbTime.setPositionY(this.lbTime.pos.y - this.lbTime.getHeight() / 2);
        // this.lbTime.setVisible(false);
        // pTime.addChild(this.lbTime);

        // this.fox = this.getControl("fox");
        // this.fox.defaultPos = this.fox.getPosition();
        // this.efxFox = db.DBCCFactory.getInstance().buildArmatureNode("cao_nemxu");
        // if (this.efxFox) {
        //     this.fox.addChild(this.efxFox);
        //     this.fox.setScale(0.8);
        //     this.playEfxFox(LuckyCardScene.FOX_IDLE, 0);
        //     this.efxFox.setCompleteListener(this.foxAnimationControl.bind(this));
        // }
        // this.getControl("period").setString(luckyCard.eventDayFrom + "-" + luckyCard.eventDayTo);
        //this.lbTime.setString(midAutumn.eventDayFrom + "-" + midAutumn.eventDayTo);

        this.enableFog();
        this.setBackEnable(true);
    },

    foxAnimationControl: function () {
        switch (this.efxFox.status) {
            case LuckyCardScene.FOX_TAKE_OFF:
                this.playEfxFox(LuckyCardScene.FOX_IDLE, 3);
                break;
            case LuckyCardScene.FOX_THROW:
                this.playEfxFox(LuckyCardScene.FOX_IDLE, 0);
                break;
        }
    },

    playEfxFox: function (state, loop) {
        var animation = "idle";
        if (this.efxFox) {
            switch (state) {
                case LuckyCardScene.FOX_IDLE:
                    animation = "idle";
                    loop = 0;
                    break;
                case LuckyCardScene.FOX_TAKE_OFF:
                    animation = "happy";
                    break;
                case LuckyCardScene.FOX_THROW:
                    animation = "nem xu";
                    break;
            }

            this.efxFox.status = state;
            this.efxFox.getAnimation().gotoAndPlay(animation, -1, -1, loop);
        }
    },

    onEnterFinish: function () {
        luckyCard.saveCurrentDay();
        cc.log("TIME NE " + luckyCard.eventDayFrom);
        this.txtStartTime.setString(luckyCard.eventDayFrom);
        this.txtEndTime.setString(luckyCard.eventDayTo);

        //this.lbTime.setPositionX(this.lbTime.pos.x - this.lbTime.getWidth() / 2);
        this.btnJoin.stopAllActions();
        this.btnJoin.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.3, 1.1), cc.scaleTo(0.3, 1.0))));
        //this.setShowHideAnimate(this._bg, true);
    },

    doEffect: function () {
        this.doScaleStart(this.getControl("close", this.bg));
        this.doScaleStart(this.getControl("join", this.bg));
        //this.doScaleStart(this.getControl("bg_image"));
        //this.doScaleStart(this.getControl("period"));
    },

    doScaleStart: function (obj) {
        obj.runAction(cc.sequence(
            cc.scaleTo(0, 0),
            cc.delayTime(1.5),
            cc.scaleTo(0.5, 1).easing(cc.easeBackOut())
        ));
    },

    onButtonRelease: function (btn, id) {
        this.onBack();

        if (id == LuckyCardEventNotifyGUI.BTN_JOIN) {
            luckyCard.openEvent(Event.LUCKY_CARD);
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var LuckyCardNapGNotifyGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(LuckyCardNapGNotifyGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardNapGNotifyGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", LuckyCardNapGNotifyGUI.BTN_CLOSE, this._bg);
        this.customButton("nap_g", LuckyCardNapGNotifyGUI.BTN_NAP_G, this._bg);

        this.lbTime = this.getControl("time", this._bg);
        this.lb = this.getControl("lb", this._bg);

        //this.listStar = [];
        //for(var i=0;i<5;i++){
        //    var star = this.getControl("star" + i, this._bg);
        //    var starLight = new StarLight(star, false);
        //    starLight.RunAction();
        //    this.listStar.push(star);
        //}

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        luckyCard.saveCurrentDayNapG();
        this.setShowHideAnimate(this._bg, true);

        this.lbTime.setString(luckyCard.eventWeeks[luckyCard.eventTime - 1]);

        this.lbTime.setVisible(false);
        this.lb.setVisible(false);
    },

    onButtonRelease: function (btn, id) {
        this.onBack();

        if (id == LuckyCardNapGNotifyGUI.BTN_NAP_G) {
            var open = gamedata.checkEnablePayment();
            luckyCard.tabEventShop = true;
            if (open) gamedata.openShop();
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var LuckyCardHelpGUI = BaseLayer.extend({

    ctor: function () {

        this._currentPage = null;
        this._pageHelp = null;

        this._arrPage = null;
        this._pageInfo = null;

        this.curPage = -1;

        this._super(LuckyCardHelpGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardHelpGUI.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        var btnClose = this.customButton("btnClose", 5, bg);

        this._pageHelp = this.getControl("pageHelp", bg);
        this._pageHelp.setCustomScrollThreshold(this._pageHelp.getContentSize().width / 10);

        this._pageHelp.addEventListener(this.onPageListener.bind(this), this);

        this._arrPage = [];
        for (var i = 0; i < 4; i++) {
            this._arrPage[i] = this.customButton("btnPage" + i, i, bg);
            this._arrPage[i].setPressedActionEnabled(false);
        }

        this._currentPage = this.getControl("imgCurPage", bg);

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
        } else {
            this._currentPage.setPosition(this._arrPage[this.curPage].getPosition());

            this.curPage = this._pageHelp.getCurPageIndex();
            var newPos = this._arrPage[this._pageHelp.getCurPageIndex()].getPosition();
            this._currentPage.runAction(cc.moveTo(0.1, newPos));
        }
    },

    onButtonRelease: function (button, id) {
        if (id >= 0 && id < 4) {
            this._pageHelp.scrollToPage(id);
        } else {
            this.onBack();
        }
        this.onBack();
    },

    onBack: function () {
        this.onClose();
    }
});

var LuckyCardRegisterInformationGUI = BaseLayer.extend({
    ctor: function () {
        this.giftIds = [];

        this.txName = null;
        this.txAddress = null;
        this.txCmnd = null;
        this.txSdt = null;
        this.txEmail = null;

        this.btnRegister = null;

        this._super(LuckyCardRegisterInformationGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardRegisterInformationGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");
        this.pRegis = this.getControl("pRegis", this._bg);
        this.pInfo = this.getControl("pInfo", this._bg);

        this.customButton("close", LuckyCardRegisterInformationGUI.BTN_CLOSE, this._bg);

        this.btnRegister = this.customButton("complete", LuckyCardRegisterInformationGUI.BTN_OK, this.pRegis);

        this.giftName = this.getControl("gift", this.pRegis);

        // init editbox
        this.txName = this.createExitBox(this.getControl("bgName", this._bg), LocalizedString.to("LUCKYCARD_NAME"), LuckyCardRegisterInformationGUI.TF_NAME);
        this.txName.setMaxLength(100);
        this.pRegis.addChild(this.txName);

        this.txAddress = this.createExitBox(this.getControl("bgAdd", this._bg), LocalizedString.to("LUCKYCARD_ADDRESS"), LuckyCardRegisterInformationGUI.TF_ADDRESS);
        this.txAddress.setMaxLength(100);
        this.pRegis.addChild(this.txAddress);

        this.txCmnd = this.createExitBox(this.getControl("bgCmnd", this._bg), LocalizedString.to("LUCKYCARD_CMND"), LuckyCardRegisterInformationGUI.TF_CMND);
        this.txCmnd.setMaxLength(100);
        this.pRegis.addChild(this.txCmnd);

        this.txSdt = this.createExitBox(this.getControl("bgSdt", this._bg), LocalizedString.to("LUCKYCARD_PHONE"), LuckyCardRegisterInformationGUI.TF_PHONE);
        this.txSdt.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this.txSdt.setMaxLength(100);
        this.pRegis.addChild(this.txSdt);

        this.txEmail = this.createExitBox(this.getControl("bgEmail", this._bg), LocalizedString.to("LUCKYCARD_EMAIL"), LuckyCardRegisterInformationGUI.TF_EMAIL);
        this.txEmail.setMaxLength(100);
        this.pRegis.addChild(this.txEmail);

        var imgAccept = this.getControl("imgAccept", this.pRegis);
        this.btnAccept = this.customButton("btnAccept", LuckyCardRegisterInformationGUI.BTN_ACCEPT, imgAccept);
        this.btnAccept.tick = this.getControl("tick", imgAccept);
        this.btnAccept.tick.setVisible(false);
        this.btnAccept.accept = false;

        var txtCondition = this.getControl("txtCondition", imgAccept);
        this.customButton("btnCondition", LuckyCardRegisterInformationGUI.BTN_COND, txtCondition);

        //pInfo
        this.customButton("btnBack", LuckyCardRegisterInformationGUI.BTN_BACK, this.pInfo);
        this.customButton("btnAgree", LuckyCardRegisterInformationGUI.BTN_ACCEPT2, this.pInfo);

        this.enableFog();
        this.setBackEnable(true);
    },

    createExitBox: function (bg, name, tag) {
        edb = new cc.EditBox(bg.getContentSize(), new cc.Scale9Sprite());
        edb.setFont("fonts/tahoma.ttf", 17);
        edb.setPlaceHolder(name);
        edb.setPosition(bg.getPosition());
        edb.setDelegate(this);
        edb.setAnchorPoint(cc.p(0.5, 0.5));
        edb.setDelegate(this);
        edb.setTag(tag);
        edb.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
        return edb;
    },

    checkTextInput: function (str, minLen, alert) {
        var ok = true;
        if (str === undefined || str == null) {
            ok = false;
        } else {
            if (str.length < minLen) {
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

        if (name.length < 3 || address.length < 3 || cmnd.length < 9 || sdt.length < 9 || !this.btnAccept.accept) {
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
        } else {
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
            case LuckyCardRegisterInformationGUI.TF_NAME: {
                this.checkTextInput(str, 3, LocalizedString.to("LUCKYCARD_INPUT_NAME"));
                break;
            }
            case LuckyCardRegisterInformationGUI.TF_ADDRESS: {
                this.checkTextInput(str, 3, LocalizedString.to("LUCKYCARD_INPUT_ADDRESS"));
                break;
            }
            case LuckyCardRegisterInformationGUI.TF_PHONE: {
                this.checkTextInput(str, 9, LocalizedString.to("LUCKYCARD_INPUT_PHONE"));
                break;
            }
            case LuckyCardRegisterInformationGUI.TF_CMND: {
                this.checkTextInput(str, 9, LocalizedString.to("LUCKYCARD_INPUT_CMND"));
                break;
            }
            case LuckyCardRegisterInformationGUI.TF_EMAIL: {
                //this.validateEmail(str, LocalizedString.to("LUCKYCARD_INPUT_EMAIL"));
                break;
            }
        }

        this.autoCheckRegisterEnable();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);

        this.pInfo.setVisible(false);
        this.pRegis.setVisible(true);
        this.btnAccept.accept = false;
        this.btnAccept.tick.setVisible(false);

        this.txName.setString("");
        this.txAddress.setString("");
        this.txCmnd.setString("");
        this.txSdt.setString("");
        this.txEmail.setString("");

        this.enableRegisterButton(false);
    },

    updateInfor: function (gIds) {
        var str = "";
        for (var i = 0; i < gIds.length; i++) {
            str += luckyCard.getItemName(gIds[i]);
            if (i < gIds.length - 1) {
                str += ",";
            }
        }
        this.giftName.setString(str);
        this.giftIds = gIds;
    },

    onCompleteRegister: function () {
        this.autoCheckRegisterEnable();

        var name = this.txName.getString().trim();
        var address = this.txAddress.getString().trim();
        var cmnd = this.txCmnd.getString().trim();
        var sdt = this.txSdt.getString().trim();
        var email = this.txEmail.getString().trim();

        if (!this.checkTextInput(name, 3, LocalizedString.to("LUCKYCARD_INPUT_NAME"))) {
            return;
        } else if (!this.checkTextInput(address, 3, LocalizedString.to("LUCKYCARD_INPUT_ADDRESS"))) {
            return;
        } else if (!this.checkTextInput(cmnd, 9, LocalizedString.to("LUCKYCARD_INPUT_CMND"))) {
            return;
        } else if (!this.checkTextInput(sdt, 9, LocalizedString.to("LUCKYCARD_INPUT_PHONE"))) {
            return;
        }
            //else if (!this.validateEmail(email, LocalizedString.to("LUCKYCARD_INPUT_EMAIL"))) {
            //    return;
        //}
        else {
            if (!email) email = "default@gmail.com";
            var cmd = new CmdSendLuckyCardChangeAward();
            cmd.putData(false, this.giftIds, cmnd, sdt, email, name, address);
            GameClient.getInstance().sendPacket(cmd);
        }
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case LuckyCardRegisterInformationGUI.BTN_OK: {
                if (this.btnRegister.enable)
                    this.onCompleteRegister();
                break;
            }
            case LuckyCardRegisterInformationGUI.BTN_ACCEPT: {
                this.btnAccept.accept = !this.btnAccept.accept;
                this.btnAccept.tick.setVisible(this.btnAccept.accept);
                this.autoCheckRegisterEnable();
                break;
            }
            case LuckyCardRegisterInformationGUI.BTN_ACCEPT2: {
                this.btnAccept.accept = true;
                this.btnAccept.tick.setVisible(this.btnAccept.accept);
                this.autoCheckRegisterEnable();
                this.pInfo.setVisible(false);
                this.pRegis.setVisible(true);
                break;
            }
            case LuckyCardRegisterInformationGUI.BTN_BACK: {
                this.pInfo.setVisible(false);
                this.pRegis.setVisible(true);
                break;
            }
            case LuckyCardRegisterInformationGUI.BTN_COND: {
                cc.log("OPEN TERMS AND CONDITIONS");
                //NativeBridge.openURLNative(LuckyCard.URL_POLICY);
                this.pInfo.setVisible(true);
                this.pRegis.setVisible(false);
                break;
            }
            default: {
                this.onBack();
                break;
            }
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var LuckyCardNotifyEndEventGUI = BaseLayer.extend({
    ctor: function () {
        this._super(LuckyCardNotifyEndEventGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardNotifyEndEventGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg", this._layout);
        this.customizeButton("close", 1, this.bg);
        this.customizeButton("rank", 2, this.bg);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true);
        this.setBackEnable(true);
        // this.setFox(true);
    },

    onButtonRelease: function (sender, id) {
        if (id == 1) {
            this.onClose();
        } else {
            NativeBridge.openWebView(luckyCard.eventLinkNews);
        }
    }
});
LuckyCardNotifyEndEventGUI.className = "LuckyCardNotifyEndEventGUI";

var LuckyCardNotifyBonusCoin = BaseLayer.extend({

    ctor: function () {
        this._super(LuckyCardNotifyEndEventGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardNotifyBonusCoin.json");
    },

    initGUI: function () {
        this.imgBG = this.getControl("imgBG", this._layout);
        this.customizeButton("btnClose", 1, this.imgBG);
        this.customizeButton("btnWish", 2, this.imgBG);
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.imgBG, true);
    },

    onButtonRelease: function (sender, id) {
        if (id === 1) {
        } else if (id === 2) {
            var gui = sceneMgr.getMainLayer();
            if (gui && gui instanceof LobbyScene) {
                sceneMgr.openScene(LuckyCardScene.className);
            }
        }
        this.onClose();
    },

    onCloseDone: function () {
        if (luckyCard.isInGUIEvent() && luckyCard.luckyCardScene) {
            luckyCard.luckyCardScene.efxFreeCoin();
        }
    }
});
LuckyCardNotifyBonusCoin.className = "LuckyCardNotifyBonusCoin";

var LuckyCardHistoryItem = cc.TableViewCell.extend({
    ctor: function (p) {
        this.guiParent = p;

        this.panel = [];

        this.startClickY = 0;

        this._super();
        var jsonLayout = ccs.load("res/Event/LuckyCard/LuckyCardHistoryItem.json");
        this._layout = jsonLayout.node;
        this._layout.setContentSize(this._layout.getContentSize().width, this._layout.getContentSize().height);
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.initCell();
    },

    initCell: function () {

        this.imgBG = ccui.Helper.seekWidgetByName(this._layout, "imgBG");
        this.txtDate = ccui.Helper.seekWidgetByName(this.imgBG, "txtDate");
        this.txtTime = ccui.Helper.seekWidgetByName(this.imgBG, "txtTime");
        this.txtStar = ccui.Helper.seekWidgetByName(this.imgBG, "txtStar");
        this.gifts = [];
        for (var i = 0; i < 9; i++) {
            var p = ccui.Helper.seekWidgetByName(this.imgBG, "iconGift" + i);
            p.txtNum = ccui.Helper.seekWidgetByName(p, "txtNum");
            p.txtName = ccui.Helper.seekWidgetByName(p, "txtName");
            p.setVisible(false);
            this.gifts.push(p);
        }
    },

    resetInfo: function () {
        for (var i = 0; i < 9; i++)
            this.gifts[i].setVisible(false);
    },

    setInfo: function (idx) {
        this.resetInfo();
        var histInfo = luckyCard.history[idx];
        if (histInfo) {
            this.txtDate.setString(histInfo.date);
            this.txtTime.setString(histInfo.times);
            var wishes = histInfo.keyCoin / LuckyCardScene.COIN_PER_WISH;
            this.txtStar.setString(wishes);

            //cc.log("",histInfo.date, histInfo.times, "gifts length", histInfo.gifts.length);
            var totalGold = 0;
            var totalCoin = 0;
            for (var i = 0; i < histInfo.gifts.length; i++) {
                if (luckyCard.isItemGold(histInfo.gifts[i].id)) {
                    //cc.log("gold", histInfo.gifts[i].id, histInfo.gifts[i].num, luckyCard.getItemValue(histInfo.gifts[i].id));
                    totalGold += parseInt(luckyCard.getItemValue(histInfo.gifts[i].id)) * histInfo.gifts[i].num;
                } else if (luckyCard.isItemCoin(histInfo.gifts[i].id)) {
                    //cc.log("coin", histInfo.gifts[i].id, histInfo.gifts[i].num, luckyCard.getItemValue(histInfo.gifts[i].id));
                    totalCoin += parseInt(luckyCard.getItemValue(histInfo.gifts[i].id)) * histInfo.gifts[i].num;
                }
            }
            var index = 0;
            if (totalGold > 0) {
                this.gifts[index].setVisible(true);
                this.gifts[index].loadTexture("res/Event/LuckyCard/WishStar/smallGold.png");
                this.gifts[index].txtNum.setVisible(false);
                this.gifts[index].txtName.setString(StringUtility.pointNumber(totalGold));
                index++;
            }
            if (totalCoin > 0) {
                this.gifts[index].setVisible(true);
                this.gifts[index].loadTexture("res/Event/LuckyCard/WishStar/smallKeyCoin.png");
                this.gifts[index].txtNum.setVisible(false);
                this.gifts[index].txtName.setString(StringUtility.pointNumber(totalCoin));
                index++;
            }

            for (var i = 0; i < histInfo.gifts.length; i++) {
                //cc.log("history id", histInfo.gifts[i].id, histInfo.gifts[i].num, luckyCard.getItemValue(histInfo.gifts[i].id));
                if (luckyCard.isItemStored(histInfo.gifts[i].id)) {
                    this.gifts[index].setVisible(true);
                    this.gifts[index].loadTexture("res/Event/LuckyCard/WishStar/smallPiece.png");
                    this.gifts[index].txtNum.setVisible(true);
                    this.gifts[index].txtNum.setString(StringUtility.pointNumber(histInfo.gifts[i].num));
                    this.gifts[index].txtName.setString(StringUtility.subStringTextLength(luckyCard.getItemName(histInfo.gifts[i].id), 13));
                    index++;
                }
            }
        }
    },
});

var LuckyCardHistoryGUI = BaseLayer.extend({
    ctor: function () {
        this._super(LuckyCardHistoryGUI.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardHistoryGUI.json");
    },

    initGUI: function () {
        this.imgBG = this.getControl("imgBG", this._layout);
        this.customizeButton("btnClose", 1, this.imgBG);
        this.lbEmpty = this.getControl("lbEmpty", this.imgBG);

        this.pView = this.getControl("pView", this.imgBG);
        this.view = new cc.TableView(this, this.pView);
        this.view.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.view.setPosition(this.pView.getPosition());
        this.view.reloadData();
        this.imgBG.addChild(this.view);
        this.view.setVisible(true);

        this.getControl("description", this.imgBG).setString(LocalizedString.to("LUCKYCARD_HISTORY_DESCRIPTION"));
        this.getControl(
            "time",
            this.getControl("iconTime", this.imgBG)
        ).setString(LocalizedString.to("LUCKYCARD_HISTORY_TIME"));
        this.getControl(
            "wish",
            this.getControl("iconWish", this.imgBG)
        ).setString(LocalizedString.to("LUCKYCARD_HISTORY_POTION"));
        this.getControl(
            "reward",
            this.getControl("iconRewards", this.imgBG)
        ).setString(LocalizedString.to("LUCKYCARD_HISTORY_REWARDS"));

        this.enableFog(true);
        this.setBackEnable(true);
    },

    // test:function(){
    //     luckyCard.history = [];
    //     var id = [1,2,3,4,5,6,7,8,9,10,11,1001,1002,1003,1004,1000001,1000002,1000003,1000004,1000005];
    //     for(var i=0; i<1000; i++){
    //         var hist = {};
    //         hist.date = "11/6/2019";
    //         hist.times = "17:45:34";
    //         hist.keyCoin = 14;
    //         hist.gifts = [];
    //         for(var j=0;j<9;j++){
    //             var gift = {};
    //             gift.id = id[randomInt(0, id.length-1)];
    //             gift.num = randomInt(1,10);
    //             hist.gifts.push(gift);
    //         }
    //         luckyCard.history.push(hist);
    //     }
    // },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.imgBG, true);

        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.reloadTable.bind(this)))); //waiting 0.5s to load table view
    },

    onButtonRelease: function (sender, id) {
        if (id == 1) {
            this.onClose();
        }
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(580, 84);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new LuckyCardHistoryItem(this);
        }
        cell.setInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        if (luckyCard.history.length == 0) {
            this.lbEmpty.setVisible(true);
        } else {
            this.lbEmpty.setVisible(false);
        }
        return luckyCard.history.length;
    },

    reloadTable: function () {
        cc.log("reloadTable");
        //this.test();
        this.view.reloadData();
    }
});
LuckyCardHistoryGUI.className = "LuckyCardHistoryGUI";

var LuckyCardLobbyButton = BaseLayer.extend({
    ctor: function () {
        this._super(LuckyCardLobbyButton.className);
        this.initWithBinaryFile("res/Event/LuckyCard/LuckyCardLobbyButton.json");
    },

    initGUI: function () {
        this.panel = this.getControl("panel");

        this.btn = this.customButton("btnEvent", LuckyCardLobbyButton.BTN_EVENT, this.panel);
        this.btn.defaultPos = this.btn.getPosition();
        this.customButton("secondaryButton", LuckyCardLobbyButton.BTN_EVENT, this.panel);
        this.btn.setVisible(false);

        this.pumpkin = this.getControl("pumpkin", this.panel);
        this.pumpkin.defaultPos = this.pumpkin.getPosition();
        this.pumpkin.defaultRot = this.pumpkin.getRotation();
        this.pumpkin.setVisible(false);
        this.leaf = this.getControl("leaf", this.panel);
        this.leaf.defaultPos = this.leaf.getPosition();
        this.leaf.setVisible(false);

        this.prizes = [];
        for (var i = 0; i < 5; i++) {
            var image = this.getControl("image_" + i, this.panel);
            this.prizes.push(image);
            this.resetPrize(this.prizes[this.prizes.length - 1]);
            image.setVisible(false);
        }

        this.animateButton();
    },

    animateButton: function () {
        this.animation = db.DBCCFactory.getInstance().buildArmatureNode("Icon");
        if (this.animation) {
            this.panel.addChild(this.animation);
            this.animation.setScale(0.67);
            this.animation.setPosition(this.btn.x, this.btn.y - 50);
            this.animation.getAnimation().gotoAndPlay("1", -1, -1, 0);
        }
    },

    resetPrize: function (prize) {
        this.resetDefaultPosition(prize);
        prize.setScale(0.1);
        prize.setOpacity(0);
    },

    inOutEffect: function (enter) {
        if (enter) {
            this.panel.setScale(0);
            this.panel.runAction(cc.sequence(
                cc.delayTime(0.3),
                cc.scaleTo(0.5, 1).easing(cc.easeBackOut())
            ));
        } else {
            this.panel.runAction(cc.scaleTo(0.25, 0).easing(cc.easeBackIn()));
        }
    },

    shuffleArray: function (array) {
        for (var i = array.length - 1; i >= 0; i--) {
            var index = Math.floor(Math.random() * (i + 1));

            var temp = array[i];
            array[i] = array[index];
            array[index] = temp;
        }

        return array;
    },

    onButtonRelease: function (sender, id) {
        if (id == LuckyCardLobbyButton.BTN_EVENT) {
            event.openEvent(Event.LUCKY_CARD);
        }
    }
});
LuckyCardLobbyButton.BTN_EVENT = 0;
LuckyCardLobbyButton.className = "LuckyCardLobbyButton";


var LuckyCardGoldDrop = cc.Sprite.extend({
    ctor: function () {
        this._super();
        this.anim = this.createAnimSpriteFrame();
        this.scaleMax = 0.4;
        this.scaleMin = 0.3;
        this.rateSpeedR = 10;
        this.setVisible(false);
    },

    createAnimSpriteFrame: function () {
        var anim = cc.animationCache.getAnimation("goldS");
        if (!anim) {
            cc.spriteFrameCache.addSpriteFrames("res/Event/LuckyCard/WishStarRes/gold.plist", "res/Event/LuckyCard/WishStarRes/gold.png");
            var anims = [];
            for (var i = 0; i < 8; i++) {
                anims.push(cc.spriteFrameCache.getSpriteFrame("gold" + i + ".png"));
            }
            anim = new cc.Animation(anims, 0.1);
            cc.animationCache.addAnimation(anim, "goldS");
        }
        return anim;
    },

    setParameter: function (scaleMax, scaleMin, speedR) {
        this.scaleMax = scaleMax;
        this.scaleMin = scaleMin;
        this.rateSpeedR = speedR;
    },

    initCoin: function () {
        this.setOpacity(0);
        var valueRan;

        this.speedR = 2 * Math.random() * this.rateSpeedR - this.rateSpeedR;
        valueRan = Math.random() * (this.scaleMax - this.scaleMin) + this.scaleMin;
        this.setScale(valueRan, valueRan);

        this.speedX = 0;
        this.speedY = Math.random() * 300;

        this.setVisible(false);
    },

    start: function () {
        LuckyCardSound.playCoin();
        if (this.anim) {
            this.setVisible(true);
            var ani = cc.animate(this.anim);
            this.runAction(ani.repeatForever());
            this.runAction(cc.rotateBy(0.5 + 0.5 * Math.random(), 360));
        }
    }
});

var LuckyCardCoinDrop = cc.Sprite.extend({

    ctor: function () {
        this._super();

        this.anim = this.createAnimSpriteFrame();
        this.scaleMax = 0.5;
        this.scaleMin = 0.3;
        this.rateSpeedR = 10;
        this.setVisible(false);
    },

    createAnimSpriteFrame: function () {
        var anim = cc.animationCache.getAnimation("coinS");
        if (!anim) {
            cc.spriteFrameCache.addSpriteFrames("res/Event/LuckyCard/WishStarRes/coin.plist", "res/Event/LuckyCard/WishStarRes/coin.png");
            var anims = [];
            for (var i = 0; i < 8; i++) {
                anims.push(cc.spriteFrameCache.getSpriteFrame("coinA" + i + ".png"));
            }
            anim = new cc.Animation(anims, randomFloat(0.05, 0.15));
            cc.animationCache.addAnimation(anim, "coinS");
            cc.log("create efx rotate coin");
        }
        return anim;
    },

    setParameter: function (scaleMax, scaleMin, speedR) {
        this.scaleMax = scaleMax;
        this.scaleMin = scaleMin;
        this.rateSpeedR = speedR;
    },

    initCoin: function () {
        this.setOpacity(0);
        var valueRan;

        this.speedR = 2 * Math.random() * this.rateSpeedR - this.rateSpeedR;
        valueRan = Math.random() * (this.scaleMax - this.scaleMin) + this.scaleMin;
        this.setScale(valueRan, valueRan);

        this.speedX = 0;
        this.speedY = Math.random() * 300;

        this.setVisible(false);
    },

    start: function () {
        if (this.anim) {
            cc.log("start efx rotate coin");
            this.setVisible(true);
            var ani = cc.animate(this.anim);
            this.runAction(ani.repeatForever());
        }
    }
});
LuckyCardCoinDrop.scaleEfx = 0.1;

/**
 * LUCKY BROADCASE MESSAGE
 */
LuckyCardScene.messageCaches = [];
LuckyCardScene.timeMessageDisplay = 0;

LuckyCardScene.createMessageBroadcast = function (message) {
    if (message == "")
        return null;

    var bg = cc.Sprite("res/Event/LuckyCard/WishStar/broadcast_bg.png");
    bg.setPosition(cc.p(bg.width / 2, bg.height / 2));

    //var logo = cc.Sprite("WishStar/broadcast_logo.png");
    //logo.setAnchorPoint(cc.p(1, 0));
    //logo.x = -10;
    //logo.y = -10;

    var length = bg.width;
    var height = bg.height;

    var _label = new ccui.Text();
    _label.setAnchorPoint(cc.p(0, 0.5));
    _label.setFontName("fonts/tahomabd.ttf");
    _label.setFontSize(16);
    _label.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
    _label.setColor(sceneMgr.ccWhite);
    _label.setString(message);
    _label.x = length;
    _label.y = bg.height / 2;
    //_label.addChild(logo);

    var shape = new cc.DrawNode();
    var green = cc.color(0, 255, 0, 255);
    shape.drawRect(cc.p(0, 0), cc.p(length, height), green);

    var clipper = new cc.ClippingNode();
    clipper.tag = 100;
    clipper.anchorX = 1;
    clipper.anchorY = 0;
    clipper.x = cc.winSize.width / 2 - length / 2;
    clipper.y = cc.winSize.height - height;
    clipper.stencil = shape;

    clipper.addChild(bg);
    clipper.addChild(_label);
    clipper.setScaleY(0);

    var toX = -(length + _label.width);
    var veloc = 70;
    var delay = 0.25;
    var time = Math.abs(toX / veloc);
    _label.runAction(cc.moveBy(time, cc.p(toX, 0)));
    clipper.runAction(cc.sequence(cc.delayTime(time), cc.removeSelf()));
    clipper.runAction(cc.sequence(cc.delayTime(delay), cc.scaleTo(0.25, 1).easing(cc.easeBackOut())));

    return clipper;
};

LuckyCardScene.onMessageBroadcast = function (message) {
    if (message === undefined || message == null || message == "") return;

    LuckyCardScene.messageCaches.push(message);

    if (sceneMgr.layerGUI) {
        if (!sceneMgr.layerGUI.getChildByTag(LuckyCardScene.TAG_BROADCAST)) {
            LuckyCardScene.loop();
        }
    }
};

LuckyCardScene.checkAndDisplay = function () {
    if (LuckyCardScene.messageCaches.length > 0) {
        var message = "" + LuckyCardScene.messageCaches[0];
        LuckyCardScene.messageCaches.splice(0, 1);

        if (sceneMgr.layerGUI) {
            if (sceneMgr.layerGUI.getChildByTag(LuckyCardScene.TAG_BROADCAST))
                sceneMgr.layerGUI.removeChildByTag(LuckyCardScene.TAG_BROADCAST);

            sceneMgr.layerGUI.addChild(LuckyCardScene.createMessageBroadcast(message), LuckyCardScene.TAG_BROADCAST, LuckyCardScene.TAG_BROADCAST);
        }
    }
};

LuckyCardScene.loop = function () {
    LuckyCardScene.checkAndDisplay();

    engine.HandlerManager.getInstance().addHandler("luckyCard_message_broadcast", function () {
        LuckyCardScene.doLoop(LuckyCardScene.TIME_DELAY_APPEAR);
    });
    engine.HandlerManager.getInstance().getHandler("luckyCard_message_broadcast").setTimeOut(1, true);
};

LuckyCardScene.doLoop = function (t) {
    if (t === undefined) {
        t = LuckyCardScene.TIME_DEFAULT_APPEAR;
    }


    engine.HandlerManager.getInstance().addHandler("luckyCard_broadcast", LuckyCardScene.loop);
    engine.HandlerManager.getInstance().getHandler("luckyCard_broadcast").setTimeOut(t, true);
};

/**
 * LUCKY STATIC VARIABLE
 */
LuckyCardScene.TIME_DELAY_APPEAR = 30;
LuckyCardScene.TIME_DEFAULT_APPEAR = 5;
LuckyCardScene.TAG_BROADCAST = 999999;

LuckyCardScene.TIME_DELAY = 2;
LuckyCardScene.TIME_MOVE = 0.4;

LuckyCardScene.TIME_DELAY_GIFT = 5;

LuckyCardScene.TIME_DELAY_XTREME = 0.25; // min >= TIME_MOVE_XTREME
LuckyCardScene.TIME_MOVE_XTREME = 0.2;

LuckyCardScene.NUM_CARD = 8;
LuckyCardScene.CARD_OPEN = 5;

LuckyCardScene.BTN_CLOSE = 1;
LuckyCardScene.BTN_HELP = 2;
LuckyCardScene.BTN_SHOP = 3;
LuckyCardScene.BTN_ADD_GOLD = 4;
LuckyCardScene.BTN_ADD_G = 5;
LuckyCardScene.BTN_COLLECTION = 6;
LuckyCardScene.BTN_HISTORY = 7;
LuckyCardScene.BTN_METRIC_FOG = 8;
LuckyCardScene.BTN_METRIC_STAR = 9;

LuckyCardScene.BTN_NORMAL = 10;
LuckyCardScene.BTN_NORMAL_XTREME = 11;
LuckyCardScene.BTN_BEAN = 11;
LuckyCardScene.BTN_BEAN_XTREME = 12;
LuckyCardScene.BTN_TOP = 14;

LuckyCardScene.BTN_CHEAT = 20;
LuckyCardScene.BTN_CHEAT_ITEM = 21;
LuckyCardScene.BTN_CHEAT_COIN = 22;
LuckyCardScene.BTN_CHEAT_COIN_FREE = 23;
LuckyCardScene.BTN_CHEAT_G_SERVER = 24;
LuckyCardScene.BTN_SHOW_CHEAT_LIST = 25;
LuckyCardScene.BTN_SHOW_HIDE_CHEAT = 26;
LuckyCardScene.BTN_CHEAT_RESET_DATA = 27;
LuckyCardScene.BTN_CHEAT_NUM_ROLL = 28;

//LuckyCardScene.CARD_SCALE = 0.55;
LuckyCardScene.CARD_SCALE = 1.0;
LuckyCardScene.NUM_CARD_XTREME = 10;

LuckyCardScene.EFFECT_CIRCLE_SCALE = 0.8;

LuckyCardScene.CLOUD_POSITION = [
    {min: 550, max: 1600},
    {min: 360, max: 1100},
    {min: 0, max: 860},
];

LuckyCardScene.COIN_PER_WISH = 5;

LuckyCardScene.FOX_IDLE = 0;
LuckyCardScene.FOX_THROW = 1;
LuckyCardScene.FOX_TAKE_OFF = 2;

LuckyCardAccumulateGUI.TIME_PROGRESS = 1;
LuckyCardAccumulateGUI.TIME_MOVE = 0.5;
LuckyCardAccumulateGUI.TIME_DELTA = 0.05;

LuckyCardEventNotifyGUI.BTN_CLOSE = 1;
LuckyCardEventNotifyGUI.BTN_JOIN = 2;

LuckyCardNapGNotifyGUI.BTN_CLOSE = 1;
LuckyCardNapGNotifyGUI.BTN_NAP_G = 2;

LuckyCardRegisterInformationGUI.BTN_CLOSE = 0;
LuckyCardRegisterInformationGUI.BTN_OK = 1;
LuckyCardRegisterInformationGUI.BTN_ACCEPT = 2;
LuckyCardRegisterInformationGUI.BTN_COND = 3;
LuckyCardRegisterInformationGUI.BTN_BACK = 4;
LuckyCardRegisterInformationGUI.BTN_ACCEPT2 = 5;

LuckyCardRegisterInformationGUI.TF_NAME = 1;
LuckyCardRegisterInformationGUI.TF_ADDRESS = 2;
LuckyCardRegisterInformationGUI.TF_PHONE = 3;
LuckyCardRegisterInformationGUI.TF_CMND = 4;
LuckyCardRegisterInformationGUI.TF_EMAIL = 5;

LuckyCardCollectionItem.NUM_ITEM = 1;
LuckyCardCollectionItem.ITEM_NOT_ENOUGH = 35;
LuckyCardCollectionItem.ITEM_FULL = 255;
LuckyCardCollectionItem.ITEM_OVER = 175;

/**
 * CLASS NAME LUCKY GUI AND SCENE
 */
LuckyCardScene.className = "LuckyCardScene";
LuckyCardCollectionGUI.className = "LuckyCardCollectionGUI";
LuckyCardHelpGUI.className = "LuckyCardHelpGUI";
LuckyCardAccumulateGUI.className = "LuckyCardAccumulateGUI";
LuckyCardEventNotifyGUI.className = "LuckyCardEventNotifyGUI";
LuckyCardNapGNotifyGUI.className = "LuckyCardNapGNotifyGUI";
LuckyCardRegisterInformationGUI.className = "LuckyCardRegisterInformationGUI";
LuckyCardOpenResultGUI.className = "LuckyCardOpenResultGUI";
LuckyCardOpenGiftGUI.className = "LuckyCardOpenGiftGUI";