/**
 * Created by HOANG on 8/19/2015.
 */

var LayerEffect2D = cc.Layer.extend({
    ctor: function (gameScene) {
        this._super();
        this._gameScene = gameScene;
        this.effects = [];
        this.cardDanh = [];
        this.cardPool = [];
        this.cardDealPool = [];

        this.orgNode = new cc.Node();
        this.orgNode.setTag(LayerEffect2D.KEEPING_NODE);
        this.addChild(this.orgNode);
    },

    getCard: function (id) {
        var card;
        if (this.cardPool.length > 0) {
            card = this.cardPool[0];
            card.setID(id);
            this.cardPool.shift();
        } else {
            card = new SamCard(id);
            card.retain();
            this.addChild(card);
        }
        card.setOpacity(255);
        card.setVisible(true);
        card.setColor(cc.color("#ffffff"));
        try {
            card.setRotation3D(vec3(0, 0, 0));
        } catch (e) {
            card.setRotation(0);
        }
        return card;
    },

    returnCard: function (card) {
        card.setVisible(false);
        this.cardPool.push(card);
    },

    returnCardToiTrang: function (card) {
        card.setVisible(false);
        card.retain();
        card.setAnchorPoint(cc.p(0.5, 0.5));
        try {
            card.removeFromParent();
            this.addChild(card);
        } catch (e) {}
        this.cardPool.push(card);
    },

    getCardDeal: function () {
        var cardDeal;
        if (this.cardDealPool.length > 0) {
            cardDeal = this.cardDealPool.shift();
        } else {
            cardDeal = new cc.Sprite(LayerEffect2D.CARD_BACK);
            cardDeal.setTag(LayerEffect2D.KEEPING_NODE);
            this.addChild(cardDeal);
        }
        return cardDeal;
    },

    removeCardDeal: function (cardDeal) {
        cardDeal.setVisible(false);
        this.cardDealPool.push(cardDeal);
    },

    chiabai: function (player, startNode) {
        if (this._gameScene.shuffleTime === -1) this._gameScene.shuffleCard();

        cc.log("CALCULATE TIME:", this._gameScene.shuffleTime);
        var passTime = ((new Date().getTime()) - this._gameScene.shuffleTime) / 1000;
        cc.log("CALCULATE TIME:", passTime);
        var timeDelay = Math.max(0, (56/24) - passTime) + 0.25;
        var timeMove = .5;
        var timeFlip = 0.2;
        var timeEachCard = .125;

        if (player._index !== 0) {
            player._card._tmpCount = 0;
        }

        for (var i = 0; i < 10; i++) {
            this.runAction(cc.sequence(
                cc.delayTime(timeDelay + (player._index === 0? 0 : player._index * timeEachCard * 0.5)),
                cc.callFunc(this.dealCardOne.bind(this, player, startNode, i))
            ));

            if (player._index === 0) {
                player._handOnCards[i].setVisible(true);
                player._handOnCards[i].setScaleX(0);
                player._handOnCards[i].runAction(cc.sequence(
                    cc.delayTime(timeDelay + timeMove + timeFlip),
                    cc.scaleTo(timeFlip, 1, 1).easing(cc.easeBackOut())
                ));
            }
            timeDelay += timeEachCard;
        }

        timeDelay -= timeEachCard;
        return timeDelay;
    },

    dealCardOne: function (player, startNode, i) {
        var sceneScale = this._gameScene._layout.getScaleX();
        var timeMove = .5;
        var timeFlip = .2;

        var sprite = this.getCardDeal();
        sprite.setPosition(startNode.convertToWorldSpaceAR(cc.p(0, 0)));
        try {
            sprite.setRotation3D(vec3(startNode.getRotation3D()));
        } catch (e) {
            sprite.setRotation(startNode.getRotation());
        }
        sprite.setLocalZOrder(50 - (i * 5 + player._index));
        sprite.setScaleX(startNode.getScaleX());
        sprite.setScaleY(startNode.getScaleY());
        sprite.setVisible(false);

        if (player._index === 0) {
            var pos = player._handOnCards[i].convertToWorldSpaceAR(cc.p(0, 0));
            var scaleWidth = player._handOnCards[i].getContentSize().width / sprite.getContentSize().width;
            scaleWidth *= sceneScale;
            var overMove = cc.p((pos.x - sprite.x) * 0.1, -25);
            try {
                var rotateAct = cc.rotateTo(timeMove, vec3(0, 0, 0));
            } catch (e) {
                var rotateAct = cc.rotateTo(timeMove, 0);
            }
            var actionSpawn = cc.spawn(
                cc.moveTo(timeMove, cc.p(pos.x + overMove.x, pos.y + overMove.y)).easing(cc.easeIn(2)),
                cc.scaleTo(timeMove, scaleWidth),
                rotateAct
            );
            sprite.runAction(cc.sequence(
                cc.show(),
                actionSpawn,
                cc.spawn(
                    cc.scaleTo(timeFlip, 0, scaleWidth).easing(cc.easeIn(2)),
                    cc.moveTo(timeFlip, pos).easing(cc.easeOut(2))
                ),
                cc.callFunc(function (cardDeal) {
                    this.removeCardDeal(cardDeal);
                }.bind(this, sprite))
            ));
        } else {
            var pos = player._card.convertToWorldSpaceAR(cc.p(0, 0));
            player._card.setVisible(false);
            var func = function (sender, target) {
                target._tmpCount++;
                target.setVisible(true);
                ccui.Helper.seekWidgetByName(target, "num").setString("" + target._tmpCount);
            }

            var scaleTarget = (player._card.width / sprite.getContentSize().width) * sceneScale;
            try {
                var r1 = cc.rotateTo(timeMove / 2, vec3(0, 0, 90));
                var r2 = cc.rotateTo(timeMove / 2, vec3(0, 0, 0)).easing(cc.easeBackOut());
            } catch (e) {
                var r1 = cc.rotateTo(timeMove / 2, 90);
                var r2 = cc.rotateTo(timeMove / 2, 0).easing(cc.easeBackOut());
            }
            sprite.runAction(cc.sequence(
                cc.show(),
                cc.spawn(
                    cc.scaleTo(timeMove, scaleTarget),
                    cc.moveTo(timeMove, pos),
                    cc.sequence(
                        r1,
                        r2.easing(cc.easeBackOut())
                    )
                ),
                cc.callFunc(func, sprite, player._card),
                cc.removeSelf()
            ));
        }
    },

    firstTurn: function (player, startNode, isFirst) {
        if (player._index !== -1) {
            player._cardFirstTurn.stopAllActions();
            var bigScale = 1.5;
            var moveUp = 0;
            if (player._index === 0) {
                bigScale = 1.3;
                moveUp = player._cardFirstTurn.height * (bigScale - 1) * 0.5;
                player._cardFirstTurn.setPosition(cc.p(player._cardPanel.width / 2, player._cardPanel.height / 2));
            }

            player._cardFirstTurn.setVisible(true);
            player._cardFirstTurn.setScale(1);
            player._cardFirstTurn.setScaleX(0);
            player._cardFirstTurn.setOpacity(255);
            player._cardFirstTurn.setColor(cc.color("#ffffff"));

            var sprite = this.getCardDeal();
            sprite.stopAllActions();
            sprite.setPosition(startNode.convertToWorldSpaceAR(cc.p(0, 0)));

            try {
                sprite.setRotation3D(vec3(startNode.getRotation3D()));
            } catch (e) {
                sprite.setRotation(startNode.getRotation());
            }
            sprite.setVisible(false);
            sprite.setScaleX(startNode.getScaleX());
            sprite.setScaleY(startNode.getScaleY());

            var scale = (player._cardFirstTurn.getContentSize().width * player._cardFirstTurn.getScaleY())
                / sprite.getContentSize().width;
            scale *= this._gameScene._layout.getScaleX();

            cc.log("FIRST TURN CARD SCALE", player._index, scale);
            cc.log("FIRST TURN CARD WIDTH",
                player._cardFirstTurn.getContentSize().width,
                player._cardFirstTurn.getScaleY(),
                sprite.getContentSize().width
            );

            var multiplier = 1;
            var moveTime = 0.35 * multiplier;
            var flipTime = 0.25 * multiplier;
            var delayTime = 0.05 * player._index;
            var pos = player._cardFirstTurn.convertToWorldSpaceAR(cc.p(0, 0));
            try {
                var rotateAct = cc.rotateTo(moveTime, vec3(0, 0, 0));
            } catch (e) {
                var rotateAct = cc.rotateTo(moveTime, 0);
            }
            var actionSpawn = cc.spawn(
                cc.show(),
                cc.moveTo(moveTime, pos).easing(cc.easeOut(2)),
                cc.scaleTo(moveTime, scale),
                rotateAct
            );
            sprite.runAction(cc.sequence(
                cc.delayTime(delayTime),
                actionSpawn,
                cc.scaleTo(flipTime, 0, scale),
                cc.callFunc(function (cardDeal) {
                    this.removeCardDeal(cardDeal);
                }.bind(this, sprite))
            ));

            player._cardFirstTurn.runAction(cc.sequence(
                cc.delayTime(moveTime + delayTime + flipTime),
                cc.scaleTo(flipTime, player._cardFirstTurn.getScaleY()).easing(cc.easeOut(2)),
                cc.delayTime(0.5),
                cc.spawn(
                    cc.tintTo(0.1, isFirst? cc.color("#ffffff") : cc.color("#696969")),
                    cc.scaleTo(0.25, player._cardFirstTurn.getScaleY() * (isFirst? bigScale : 1)).easing(cc.easeBackOut()),
                    cc.moveBy(0.25, cc.p(0, (isFirst? moveUp : 0))).easing(cc.easeBackOut())
                )
            ));
            return moveTime + flipTime * 1.5;
        }
        return 0;
    },

    playCards: function (cards) {
        cards.sort(function (a, b) {
            return a.id - b.id;
        });

        if (cards.length >= 3) {
            var lastCard = new Card(cards[cards.length - 1].id);
            var closeCard = new Card(cards[cards.length - 2].id);
            if (lastCard._quanbai === 14 && closeCard._quanbai !== 13) {
                cards.sort(function (a, b) {
                    if (Math.floor(a.id / 4) === 14) return -1;
                    if (Math.floor(b.id / 4) === 14) return 1;
                    return a.id - b.id;
                });
            }
        }

        var poss = this.generatePos(cards);

        var deltaX = (0.5 - Math.random()) * 15;
        var deltaY = (0.5 - Math.random()) * 15;
        var rotation = (0.5 - Math.random()) * 10;

        var timeMove = 0.3;
        var timeDelay = 0.15;
        var scale = this._gameScene._layout.getScaleX();
        var scaleBig = 1.25;

        var cardId = [];
        for (var i = 0; i < cards.length; i ++) cardId.push(cards[i].id);
        var strongCards = cards.length > 2 || GameHelper.checkAPig(cardId);
        var isMulti = false;

        var firstEase;
        var secondEase;
        if (strongCards) {
            firstEase = cc.easeOut(1);
            secondEase = cc.easeIn(3);
            scaleBig = 1.8;
        } else {
            firstEase = cc.easeOut(1);
            secondEase = cc.easeIn(1);
        }

        for (var i = 0; i < poss.length; i++) {
            var sam = this.getCard(cards[i].id);
            sam.setPosition(cc.p(cards[i].x, cards[i].y));
            sam.setScale(scale * cards[i].scale);
            var actionArray = [];
            var posMid;
            var posFinal;
            var firstRotation;
            var secondRotation;
            var rotateAct;

            if (strongCards) {
                posMid = cc.p(poss[i].x, poss[i].y - 25);
            } else {
                posMid = cc.p((poss[i].x + cards[i].x) / 2, (poss[i].y + cards[i].y) / 2);
            }

            if (!isMulti) {
                firstRotation = poss[i].alpha;
                secondRotation = poss[i].alpha + rotation;
                posFinal = cc.p(poss[i].x, poss[i].y);
            } else {
                firstRotation = poss[i].alpha;
                secondRotation = poss[Math.round(poss.length / 2)].alpha + rotation;
                posFinal = cc.p(poss[Math.round(poss.length / 2)].x + deltaX, poss[Math.round(poss.length / 2)].y + deltaY);
            }

            //Move cards
            var arrMove = [
                cc.moveTo(timeMove / 2, posMid).easing(firstEase),
                cc.scaleTo(timeMove / 2, scale * scaleBig).easing(cc.easeBackOut()),
                cc.rotateTo(timeMove / 2, firstRotation)
            ];
            if (i === 0) actionArray.push(
                cc.callFunc(function () {
                    // gameSound.playCardPlay();
                })
            );
            actionArray.push(cc.spawn(arrMove));

            //Drop cards
            if (strongCards) actionArray.push(cc.delayTime(timeDelay));
            try {
                rotateAct = cc.rotateTo(timeMove / 2, vec3(45 + rotation, 0, secondRotation));
            } catch (e) {
                rotateAct = cc.rotateTo(timeMove / 2, secondRotation);
            }
            var arrDrop = [
                cc.moveTo(timeMove / 2, posFinal).easing(secondEase),
                cc.scaleTo(timeMove / 2, scale).easing(cc.easeIn(3)),
                rotateAct
            ]
            actionArray.push(cc.spawn(arrDrop));

            //Card bouncing
            try {
                rotateAct = cc.rotateTo(0.05, vec3(0, 0, secondRotation)).easing(cc.easeOut(2));
            } catch (e) {
                rotateAct = cc.rotateTo(0.05, secondRotation).easing(cc.easeOut(2));
            }
            var arrBounce = [
                cc.scaleTo(0.1, scale * 1.05).easing(cc.easeOut(2)),
                rotateAct,
                cc.moveTo(0.1, posFinal.x + deltaX, posFinal.y + deltaY).easing(cc.easeOut(2))
            ];
            if (i === 0) actionArray.push(
                cc.callFunc(function () {
                    gameSound.playCardDrop(this.length > 3);
                }.bind(cards))
            );
            actionArray.push(cc.sequence(
                cc.spawn(arrBounce),
                cc.scaleTo(0.1, scale).easing(cc.easeIn(2))
            ));

            //Card multi open
            if (isMulti) {
                var timeCardMove = 0.2 / (cards.length - 1);
                var arrSlide = [
                    cc.moveTo(i * timeCardMove, poss[i].x + deltaX, poss[i].y + deltaY).easing(cc.easeBackOut()),
                    cc.rotateTo(i * timeCardMove, poss[i].alpha + rotation).easing(cc.easeBackOut()),
                ];
                if (i === 0) actionArray.push(
                    cc.callFunc(function () {
                        gameSound.playCardSlide();
                    })
                );
                actionArray.push(cc.spawn(arrSlide));
            }

            sam.runAction(cc.sequence(actionArray));
            sam.setLocalZOrder(this.cardDanh.length + 1);
            this.cardDanh.push(sam);
        }
    },

    addRecentBai: function (cards) {
        var poss = this.generatePos(cards);
        var scale = this._gameScene._layout.getScaleX();
        this.cardDanh = [];
        for (var i = 0; i < poss.length; i++) {
            var sam = this.getCard(cards[i]);
            sam.setPosition(cc.p(poss[i].x, poss[i].y));
            sam.setRotation(poss[i].alpha);
            sam.setScale(scale);
            this.cardDanh.push(sam);
        }
    },

    clearBaiDanh: function () {
        if (this.cardDanh && this.cardDanh.length) {
            for (var i = 0; i < this.cardDanh.length; i++) {
                try {
                    if (this.cardDanh[i]) {
                        this.cardDanh[i].stopAllActions();
                        this.cardDanh[i].runAction(
                            cc.sequence(
                                cc.fadeOut(.1),
                                cc.callFunc(this.returnCard.bind(this, this.cardDanh[i]))
                            ));
                    }
                } catch (e) {

                }
            }
            this.cardDanh = [];
        }
    },

    darkenPlayedCards: function () {
        var color = cc.color("#bebebe");
        if (this.cardDanh && this.cardDanh.length) {
            for (var i = this.cardDanh.length; i >= 0; i--) {
                try {
                    if (this.cardDanh[i]) {
                        if (this.cardDanh[i].getColor() !== color) {
                            this.cardDanh[i].runAction(
                                cc.tintTo(.25, color)
                            );
                        } else {
                            break;
                        }
                    }
                } catch (e) {

                }
            }
        }
    },

    clearEffect: function () {
        for (var i = 0; i < this.effects.length; i++) {
            this.effects[i].removeFromParent(true);
        }
        this.effects = [];
    },

    clearAll: function () {
        this.clearEffect();

        var all = this.getChildren();
        for (var i = 0; i < all.length; i++) {
            if (!all[i] instanceof SamCard && all[i].getTag() !== LayerEffect2D.KEEPING_NODE) {
                all[i].removeFromParent(true);
            } else {
                all[i].setVisible(false);
            }
        }

    },

    generatePos: function (cards) {
        var length = cards.length;

        var deltaX = 30;
        var deltaY = 8;
        var deltaAlpha = 10;

        var startX = cc.winSize.width / 2 - deltaX * ((length - 1) / 2.25);
        var startY = cc.winSize.height / 2 + 50 - (cards.length - 1) * 2;
        var startAlpha = -deltaAlpha * ((length - 1) / 1.7);
        var result = [];

        var orgNode = this.orgNode;
        orgNode.setPosition(cc.p(startX, startY));
        orgNode.setRotation(startAlpha);
        var tmp = {
            x: orgNode.x,
            y: orgNode.y,
            alpha: startAlpha
        }
        result.push(tmp);

        var lastNode = orgNode;
        for (var i = 1; i < length; i++) {
            var tempNode = lastNode.getChildByTag(LayerEffect2D.KEEPING_NODE);
            if (!tempNode) {
                tempNode = new cc.Node();
                lastNode.addChild(tempNode);
            }
            tempNode.setTag(LayerEffect2D.KEEPING_NODE);
            tempNode.setPosition(cc.p(deltaX, -deltaY));
            tempNode.setRotation(deltaAlpha);

            var position = lastNode.convertToWorldSpace(tempNode.getPosition());
            tmp = {
                x: position.x,
                y: position.y,
                alpha: startAlpha + i * deltaAlpha
            }
            result.push(tmp);

            lastNode = tempNode;
        }
        cc.log("RESULT", JSON.stringify(result));
        return result;
    },

    sapxepForPlayer: function (player) {
        var needTouch = true;
        for (var i = 0; i < player._handOnCards.length; i++) {
            if (!player._handOnCards[i].isVisible()) {
                needTouch = false;
                break;
            }
        }
        if (!needTouch) return;

        var sceneScale = this._gameScene._layout.getScaleX();
        var originalCards = player.sapxep();
        var sortedCards = [];
        for (var i = 0; i < player._handOnCards.length; i++) {
            player._handOnCards[i].forceDOWN();
            player._handOnCards[i].setVisible(false);
            sortedCards.push(new Card(player._handOnCards[i]._id));
        }

        var _2dCards = [];
        for (var i = 0; i < originalCards.length; i++) {
            var card = this.getCard(originalCards[i]._id);
            var pos = player._handOnCards[i].convertToWorldSpaceAR(cc.p(0, 0));
            card.setPosition(this.convertToNodeSpace(pos));
            card.setLocalZOrder(i);
            card.setScale(sceneScale);
            _2dCards.push(card);
        }

        var time = 0.5;
        for (var i = 0; i < _2dCards.length; i++) {
            for (var j = 0; j < sortedCards.length; j++) {
                if (sortedCards[j]._id === originalCards[i]._id) {
                    var posMove = _2dCards[j].getPosition();
                    _2dCards[i].setLocalZOrder(j);
                    _2dCards[i].runAction(cc.sequence(
                        cc.scaleTo(0.2 + 0.01 * j, (1 + j * 0.02) * sceneScale),
                        cc.moveTo(time, posMove).easing(cc.easeExponentialOut()),
                        cc.scaleTo(0.1 + 0.01 * j, sceneScale),
                        cc.removeSelf()
                    ));

                    player._handOnCards[j].runAction(cc.sequence(
                        cc.delayTime(time),
                        cc.show()
                    ));
                    break;
                }
            }
        }
    },

    addBigResult: function (action, idle) {
        var theOldSam = this.getChildByTag(LayerEffect2D.SAM_EFFECT_TAG);
        if (theOldSam) {
            theOldSam.stopAllActions();
            theOldSam.removeFromParent(true);
        }

        var samResult = new CustomSkeleton("Animation/resultSam", "skeleton");
        samResult.setScale(this._gameScene._layout.getScaleX());
        samResult.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height * (1 / 3)));
        samResult.setTag(LayerEffect2D.SAM_EFFECT_TAG);
        samResult.setVisible(false);
        samResult.setLocalZOrder(100);
        samResult.idle = idle;
        samResult.action = action;
        this.addChild(samResult);

        samResult.runAction(cc.sequence(
            cc.delayTime(PlayerView.TIME_RESULT_LASTCARD),
            cc.callFunc(function () {
                this._gameScene._effect2D.clearBaiDanh();
            }.bind(this)),
            cc.callFunc(function () {
                samResult.setVisible(true);
                samResult.setAnimation(0, samResult.action, -1);
            }.bind(samResult)),
            cc.delayTime(samResult.getDuration(action)),
            cc.callFunc(function () {
                samResult.setAnimation(0, samResult.idle, -1);
            }.bind(samResult))
        ).repeatForever());

        samResult.runAction(cc.sequence(
            cc.delayTime(PlayerView.TIME_RESULT_ANIMATION),
            cc.spawn(
                cc.scaleTo(0.5, 0).easing(cc.easeBackIn()),
                cc.fadeOut(0.5)
            ),
            cc.removeSelf()
        ));
    },

    createAnimation: function (key) {
        var ret = db.DBCCFactory.getInstance().buildArmatureNode(key);
        return ret;
    },

    jackpot: function () {
        var particle = cc.ParticleSystem("Particles/BurstPipe.plist");
        particle.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height));
        this.addChild(particle);

        var j = db.DBCCFactory.getInstance().buildArmatureNode("Jackpot");
        j.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
        j.getAnimation().gotoAndPlay("1");
        this.addChild(j);
    },

    chansamthanhcong: function (pos) {
        var effect = this.createAnimation("Chansamthanhcong");
        if (!effect) return;
        this.addChild(effect);
        effect.setPosition(pos);
        effect.getAnimation().gotoAndPlay("1", -1, -1, 1);
        effect.runAction(cc.sequence(cc.delayTime(.2), cc.callFunc(function () {
            this.getAnimation().gotoAndPlay("2", -1, -1);
        }.bind(effect))))

        return effect;
    },

    baosamthatbai: function (pos) {
        var effect = this.createAnimation("Baosamthatbai");
        if (!effect) return;
        this.addChild(effect);
        effect.setPosition(pos);
        effect.getAnimation().gotoAndPlay("1", -1, -1, 1);
        return effect;
    },

    tuquy: function (isDouble) {
        var effect = new CustomSkeleton("Animation/fourOfAKind", "skeleton", 0.8);
        if (!effect) return;

        this.addChild(effect);
        effect.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height * 0.8));
        effect.setVisible(false);
        effect.setLocalZOrder(10);
        effect.setTimeScale(1.5);
        effect.animationName = + isDouble? "doituquy" : "tuquy";
        effect.runAction(cc.sequence(
            cc.delayTime(0.75),
            cc.callFunc(function () {
                this.setAnimation(1, this.animationName, 0);
            }.bind(effect)),
            cc.show(),
            cc.delayTime(5),
            cc.hide()
        ));
        this.effects.push(effect);

        for (var i = 0; i < 5; i++)
            this.shakeEffect(this._gameScene._players[i]._panel);
        // this.shakeEffect(this._gameScene.bg);
    },

    shakeEffect: function (controller) {
        var scale = this._gameScene._layout.getScaleX();
        var rotVar = 10;
        var scaleMorph = 1.1;
        var defaultPos = controller.getPosition();
        if (!defaultPos) defaultPos = cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
        var posMorph = cc.p(
            defaultPos.x + (defaultPos.x - (cc.winSize.width / 2)) * 0.05,
            defaultPos.y + (defaultPos.y - (cc.winSize.height / 2)) * 0.05
        );
        cc.log("SHAKE EFX", JSON.stringify(scale), JSON.stringify(posMorph), JSON.stringify(controller.defaultPos), JSON.stringify(cc.winSize));

        try {
            controller.runAction(cc.sequence(
                cc.delayTime(0.75),
                cc.spawn(
                    cc.scaleTo(0.25, scaleMorph).easing(cc.easeOut(5)),
                    cc.rotateTo(0.25,
                        vec3(
                            (1 - 2 * Math.random()) * rotVar,
                            (1 - 2 * Math.random()) * rotVar,
                            0
                        )
                    ).easing(cc.easeOut(5)),
                    cc.moveTo(0.25, posMorph).easing(cc.easeOut(5))
                ),
                cc.spawn(
                    cc.scaleTo(0.5, 1).easing(cc.easeBounceOut()),
                    cc.rotateTo(0.5, vec3(0, 0, 0)).easing(cc.easeBounceOut()),
                    cc.moveTo(0.5, controller.defaultPos).easing(cc.easeBounceOut())
                )
            ));
        } catch (e) {}
    },

    multiPlayEffect: function (type) {
        var timeMove = 0.2;
        var delayTime = 0.3;

        var nodeEfx = new cc.Node();
        nodeEfx.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height * 0.81));
        nodeEfx.setScale(0.9);
        this.addChild(nodeEfx, 1);

        nodeEfx.runAction(cc.sequence(
            cc.delayTime(timeMove * 4 + delayTime),
            cc.scaleTo(0.25, 0).easing(cc.easeBackIn())
        ))

        var title = new cc.Sprite("Animation/multi/cards_" + type + ".png");
        title.setVisible(false);
        title.setPosition(cc.p(0, 0));
        title.setScale(0);
        nodeEfx.addChild(title);

        title.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.show(),
            cc.scaleTo(timeMove, 1).easing(cc.easeIn(3))
        ));

        var titleGlow = new cc.Sprite("Animation/multi/glow_" + type + ".png");
        titleGlow.setPosition(cc.p(title.width / 2, title.height / 2));
        titleGlow.setScale(1);
        title.addChild(titleGlow);

        titleGlow.runAction(cc.sequence(
            cc.delayTime(delayTime + timeMove),
            cc.spawn(
                cc.scaleTo(timeMove, 1.5).easing(cc.easeOut(3)),
                cc.fadeOut(timeMove)
            )
        ));

        var left = new cc.Sprite("Animation/multi/" + Math.floor(Math.random() * 4) + ".png");
        left.setAnchorPoint(cc.p(1, 0.5));
        left.setPosition(cc.p(-title.width / 2 - 50, 10));
        left.setRotation(15);
        left.setVisible(false);
        left.setOpacity(0);
        nodeEfx.addChild(left);

        left.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.show(),
            cc.spawn(
                cc.moveTo(timeMove, cc.p(-title.width / 2, 0)).easing(cc.easeIn(2)),
                cc.fadeIn(timeMove)
            ),
            cc.spawn(
                cc.moveTo(timeMove * 2, cc.p(-title.width / 2 - 25, -10)).easing(cc.easeOut(2)),
                cc.rotateTo(timeMove * 2, -15),
                cc.fadeOut(timeMove * 2)
            )
        ));

        var right = new cc.Sprite("Animation/multi/" + Math.floor(Math.random() * 4) + ".png");
        right.setAnchorPoint(cc.p(0, 0.5));
        right.setPosition(cc.p(title.width / 2 + 50, 10));
        right.setRotation(-15);
        right.setVisible(false);
        right.setOpacity(0);
        nodeEfx.addChild(right);

        right.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.show(),
            cc.spawn(
                cc.moveTo(timeMove, cc.p(title.width / 2, 0)).easing(cc.easeIn(2)),
                cc.fadeIn(timeMove)
            ),
            cc.spawn(
                cc.moveTo(timeMove * 2, cc.p(title.width / 2 + 25, -10)).easing(cc.easeOut(2)),
                cc.rotateTo(timeMove * 2, 15),
                cc.fadeOut(timeMove * 2)
            )
        ));

        this.effects.push(nodeEfx);
    },

    doituquy: function (pos) {
        var effect = this.createAnimation("Haituquy");
        if (!effect) return;

        this.addChild(effect);
        effect.setPosition(cc.p(pos.x, pos.y + 127));
        effect.getAnimation().gotoAndPlay("1", -1, -1, 0);
        effect.setVisible(false);

        effect.runAction(cc.sequence(cc.delayTime(.45), cc.show(), cc.delayTime(5), cc.hide()));
        this.effects.push(effect);
    },

    addLight: function (pos) {
        var effect = this.createAnimation("BG_light_bai");
        if (!effect) return;
        this.addChild(effect);
        effect.setPosition(cc.p(pos.x + 17, pos.y + 25));
        effect.getAnimation().gotoAndPlay("1", -1, -1, 0);
        effect.setVisible(false);
        effect.runAction(cc.sequence(cc.delayTime(.45), cc.show()));

        this.effects.push(effect);
    },

    addPhaohoa: function (rect) {
        var rdeffect = Math.floor(Math.random() * 3) + 1;
        if (rdeffect >= 4) rdeffect = 3;
        var eff = this.createAnimation("firework" + rdeffect);
        eff.setScale(1);
        if (!eff) return;

        this.addChild(eff);
        eff.setPosition(cc.p(rect.x + Math.random() * rect.width, rect.y + Math.random() * rect.height));
        eff.getAnimation().gotoAndPlay("1", 0, .75, 1);
    },

    bezierEffect: function (target, time, delay, config, visible) {
        target.setVisible(visible);
        target.runAction(cc.sequence(cc.delayTime(delay), cc.show(), new cc.EaseExponentialOut(cc.bezierTo(time, config)), cc.delayTime(1), cc.removeSelf()));
    },

    moneyFly: function (posSrc, posDst, time, delay, visible) {
        var rdChip = Math.floor(Math.random() * 6 + 1);
        if (rdChip > 6) rdChip = 6;
        var chip = new cc.Sprite("chip/chip" + rdChip + ".png");

        var rdX = Math.random() * 200;
        var rdY = Math.random() * 200;

        this.addChild(chip, 3);
        chip.setPosition(posSrc);
        var config = [posSrc, cc.pAdd(cc.pSub(posSrc, cc.p(-100, -100)), cc.p(rdX, rdY)), posDst];

        this.bezierEffect(chip, time, delay, config, visible);
    },

    effectToiTrang: function (cards, type, isMe) {
        var moveTime = 0.2;
        var deltaTime = 0.01;
        var showTime = 0.4;
        var fadeOutTime = 0.25;

        var scale = this._gameScene._layout.getScaleX();

        var efxNode = cc.Node();
        efxNode.setCascadeOpacityEnabled(true);
        this.addChild(efxNode);
        this.effects.push(efxNode);
        efxNode.runAction(cc.sequence(
            cc.delayTime(PlayerView.TIME_RESULT_ANIMATION),
            cc.fadeOut(fadeOutTime)
        ));

        var name = type === GameLayer.END_TYPE_WIN_SAM_DINH? "royalFlush" : "others";

        var animBg = new CustomSkeleton("Animation/toiTrang", name, 1, "skeleton");
        animBg.setVisible(false);
        animBg.setLocalZOrder(0);
        animBg.setScale(scale);
        animBg.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2 - 50));
        efxNode.addChild(animBg);
        animBg.runAction(cc.sequence(
            cc.delayTime(0.4),
            cc.callFunc(function (anim) {
                anim.setVisible(true);
                anim.setAnimation(1, "animation_back", 0);
            }, animBg),
            cc.delayTime(animBg.getDuration("animation_back")),
            cc.callFunc(function (anim) {
                anim.setAnimation(1, "idle_back", -1);
            }, animBg)
        ));

        var animTop = new CustomSkeleton("Animation/toiTrang", name, 1, "skeleton");
        animTop.setVisible(false);
        animTop.setLocalZOrder(cards.length + 1);
        animTop.setScale(scale);
        animTop.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2 - 50));
        efxNode.addChild(animTop);
        animTop.runAction(cc.sequence(
            cc.delayTime(0.4),
            cc.callFunc(function (anim, type) {
                anim.setVisible(true);
                anim.setAnimation(1, "animation_top_" + type, 0);
            }, animTop, type),
            cc.delayTime(animTop.getDuration("animation_top_" + type)),
            cc.callFunc(function (anim, type) {
                anim.setAnimation(1, "idle_top_" + type, -1);
            }, animTop, type)
        ));

        cards.sort(function (a, b) {
            return a.id - b.id;
        });
        var pos = this.generatePos(cards);
        var scaleLeave = cc.scaleTo(moveTime, 0, scale);

        for (var i = 0; i < pos.length; i++) {
            var sam = this.getCard(cards[i].id);
            sam.setPosition(cc.p(cards[i].x, cards[i].y));
            sam.setScale(scale);
            sam.retain();
            sam.removeFromParent();
            sam.setLocalZOrder(i + 1);
            efxNode.addChild(sam);

            pos[i].y -= 25;

            var actionArray = [];
            actionArray.push(cc.delayTime(i * deltaTime));

            if (isMe) {
                var aLeaveHand = cc.spawn(
                    cc.moveTo(moveTime, cc.p(cards[i].x, cards[i].y - sam.height * scale)).easing(cc.easeBackIn()),
                    scaleLeave.clone()
                );
                actionArray.push(aLeaveHand);
            } else {
                sam.setVisible(false);
            }

            var aHide = cc.callFunc(function (pos) {
                this.setPosition(cc.p(pos.x, pos.y));
                this.setScale(0);
                this.setRotation(pos.alpha);
            }.bind(sam, pos[i]));
            actionArray.push(aHide);

            var aChange = cc.callFunc(function () {
                this.setVisible(true);
                this.setAnchorPoint(cc.p(0.5, 0));
            }.bind(sam));
            actionArray.push(aChange);
            actionArray.push(cc.delayTime(showTime + moveTime));

            var aShow = cc.scaleTo(moveTime, scale).easing(cc.easeBackOut());
            actionArray.push(aShow);

            sam.runAction(cc.sequence(actionArray));
            sam.runAction(cc.sequence(
                cc.delayTime(PlayerView.TIME_RESULT_ANIMATION + fadeOutTime),
                cc.callFunc(this.returnCardToiTrang.bind(this, sam))
            ));
        }
    },

    effectPigs: function () {
        var delayTime = 0.4;

        var efxNode = cc.Node();
        efxNode.setCascadeOpacityEnabled(true);
        efxNode.setLocalZOrder(this.cardDanh.length);
        this.addChild(efxNode);
        this.effects.push(efxNode);

        var scale = this._gameScene._layout.getScaleX();
        var pos = cc.p(cc.winSize.width / 2, cc.winSize.height / 2 + 50);
        var action = cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.fadeIn(0.1),
                cc.scaleTo(0.1, scale)
            ),
            cc.spawn(
                cc.fadeOut(0.75).easing(cc.easeIn(2)),
                cc.scaleTo(0.5, scale * 0.85).easing(cc.easeIn(2)),
                cc.rotateBy(0.75, Math.random() < 0.5? 1.5 : -1.5)
            )
        );

        var glow_harsh = new cc.Sprite("Animation/pig/glow_harsh.png");
        glow_harsh.setBlendFunc(cc.DST_COLOR, cc.ONE);
        glow_harsh.setPosition(pos);
        glow_harsh.setScale(scale * 0.5);
        glow_harsh.setOpacity(0);
        glow_harsh.setRotation(Math.random() * 360);
        glow_harsh.runAction(action.clone());

        var explosion = new cc.Sprite("Animation/pig/explosion.png");
        explosion.setPosition(pos);
        explosion.setScale(scale * 0.5);
        explosion.setOpacity(0);
        explosion.setRotation(Math.random() * 360);
        explosion.runAction(action.clone());

        //The dot
        var listParticle = [];
        var number = 10;
        for (var i = 0; i < number; i++) {
            var dot = new cc.Sprite("Animation/pig/dot.png");
            dot.setScale(0.75 + Math.random() * 0.75);
            dot.setColor(cc.color("#ffffff"));
            dot.setBlendFunc(cc.ONE, cc.ONE_MINUS_SRC_ALPHA);
            listParticle.push(dot);
            efxNode.addChild(dot);
        }

        for (var i = 0; i < listParticle.length; i++) {
            var time = 0.7 + Math.random() * 0.2;
            var img = listParticle[i];
            var destination = cc.p(
                (Math.random() < 0.5? 1 : -1) * (Math.random() * 200),
                (Math.random() < 0.5? 1 : -1) * (Math.random() * 200)
            );
            var distance = Math.sqrt(destination.x * destination.x + destination.y * destination.y);
            var multiplier = (75 + Math.random() * 50) / distance;
            img.setPosition(pos);
            img.setRotation(Math.random() * 360);
            img.setOpacity(0);
            img.runAction(cc.sequence(
                cc.tintTo(0.2 + Math.random() * 0.05, cc.color("#737373")).easing(cc.easeIn(5)),
                cc.tintTo(0.2 + Math.random() * 0.05, cc.color("#ffffff")).easing(cc.easeOut(25))
            ).repeatForever());
            img.runAction(cc.sequence(
                cc.delayTime(delayTime),
                cc.fadeIn(0.1),
                cc.spawn(
                    cc.moveBy(time / multiplier, destination.x * multiplier, destination.y * multiplier).easing(cc.easeOut(25)),
                    cc.fadeOut(Math.min(1, time / multiplier)),
                    cc.scaleTo(Math.min(1, time / multiplier), 0.01),
                    cc.rotateBy(time / multiplier, Math.random() < 0.5? 90 : -90).easing(cc.easeOut(25))
                )
            ));
        }

        efxNode.addChild(glow_harsh);
        efxNode.addChild(explosion);
    }
});
LayerEffect2D.CARD_BACK = "#cardBack.png";
LayerEffect2D.SAM_EFFECT_TAG = 115;
LayerEffect2D.KEEPING_NODE = 116;
