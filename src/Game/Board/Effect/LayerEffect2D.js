/**
 * Created by HOANG on 8/19/2015.
 */

var LayerEffect2D = cc.Layer.extend({
    ctor: function (gameScene) {
        this._super();
        this._gameScene = gameScene;
        this.effects = [];
        this.cardDanh = [];
    },

    chiabai: function (player, startNode) {
        var offset = 0;
        var time = 0;
        var posY = 15;
        var timedelay = (56/24) + 0.25;
        var timeMove = .5;
        var timeFlip = .2;
        var timeEachCard = .125;

        this._gameScene.shuffleCard();
        var sceneScale = this._gameScene._layout.getScaleX();

        for (var i = 0; i < 10; i++) {
            var sprite = new cc.Sprite(LayerEffect2D.CARD_BACK);
            this.addChild(sprite);
            sprite.setPosition(startNode.convertToWorldSpaceAR(cc.p(0, 0)));
            sprite.setRotation3D(startNode.getRotation3D());
            sprite.setLocalZOrder(1);
            sprite.setScaleX(startNode.getScaleX());
            sprite.setScaleY(startNode.getScaleY());
            sprite.setVisible(false);

            if (player._index === 0) {
                var pos = player._handOnCards[i].convertToWorldSpaceAR(cc.p(0, 0));
                var scaleWidth = player._handOnCards[i].getContentSize().width / sprite.getContentSize().width;
                scaleWidth *= sceneScale;
                var actionSpawn = cc.spawn(
                    cc.moveTo(timeMove, pos).easing(cc.easeBackOut()),
                    cc.scaleTo(timeMove, scaleWidth).easing(cc.easeBackOut()),
                    cc.rotateTo(timeMove, vec3(0, 0, 0)).easing(cc.easeBackOut())
                );
                sprite.runAction(cc.sequence(
                    cc.delayTime(timedelay),
                    cc.show(),
                    actionSpawn,
                    cc.scaleTo(timeFlip, 0, scaleWidth),
                    cc.removeSelf()
                ));

                player._handOnCards[i].setVisible(true);
                player._handOnCards[i].setScaleX(0);
                player._handOnCards[i].runAction(cc.sequence(
                    cc.delayTime(timeMove + timeFlip + timedelay),
                    cc.scaleTo(.1, 1, 1)
                ));
            } else {
                var pos = player._card.convertToWorldSpaceAR(cc.p(0, 0));
                player._card.setVisible(false);
                player._card._tmpCount = 0;
                var func = function (sender, target) {
                    target._tmpCount++;
                    target.setVisible(true);
                    ccui.Helper.seekWidgetByName(target, "num").setString("" + target._tmpCount);
                }

                var scaleTarget = (player._card.width / sprite.getContentSize().width) * sceneScale;
                sprite.runAction(cc.sequence(
                    cc.delayTime(timedelay + player._index * timeEachCard * 0.5),
                    cc.show(),
                    cc.spawn(
                        cc.scaleTo(timeMove, scaleTarget),
                        cc.moveTo(timeMove, pos),
                        cc.rotateTo(timeMove, vec3(0, 0, 0)).easing(cc.easeBackOut())
                    ),
                    cc.callFunc(func, sprite, player._card),
                    cc.removeSelf()
                ));
            }

            timedelay += timeEachCard;
        }

        timedelay -= timeEachCard;
        this._gameScene.deckCard.runAction(cc.sequence(
            cc.delayTime(timedelay),
            cc.hide()
        ));
    },

    firstTurn: function (player) {
        if (player._index !== -1) {
            var sprite = new cc.Sprite(LayerEffect2D.CARD_BACK);
            sprite.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
            this.addChild(sprite);

            var scale = (player._cardFirstTurn.getContentSize().width * player._cardFirstTurn.getScaleY())
                / sprite.getContentSize().width;
            if (scale !== 0) scale /= 1.5;

            cc.log("FIRST TURN CARD SCALE", player._index, scale);
            cc.log("FIRST TURN CARD WIDTH",
                player._cardFirstTurn.getContentSize().width,
                player._cardFirstTurn.getScaleY(),
                sprite.getContentSize().width
            );

            var moveTime = 0.35;
            var flipTime = 0.25;
            var pos = player._cardFirstTurn.convertToWorldSpaceAR(cc.p(0, 0));
            var actionSpawn = cc.spawn(
                cc.moveTo(moveTime, pos),
                cc.scaleTo(moveTime, scale)
            );
            sprite.runAction(cc.sequence(
                actionSpawn,
                cc.scaleTo(flipTime, 0, scale),
                cc.removeSelf()
            ));

            player._cardFirstTurn.setVisible(true);
            player._cardFirstTurn.setScaleX(0);
            player._cardFirstTurn.runAction(cc.sequence(
                cc.delayTime(moveTime + flipTime),
                cc.scaleTo(flipTime, player._cardFirstTurn.getScaleY())
            ));
        }
    },

    playCards: function (cards) {
        cards.sort(function (a, b) {
            return a.id - b.id;
        });
        var poss = this.generatePos(cards);

        var deltaX = (0.5 - Math.random()) * 15;
        var deltaY = (0.5 - Math.random()) * 15;
        var rotation = (0.5 - Math.random()) * 10;

        var timeMove = 0.4;
        var timeDelay = 0.15;
        var scale = this._gameScene._layout.getScaleX();
        var scaleBig = 1.25;

        var cardId = [];
        for (var i = 0; i < cards.length; i ++) cardId.push(cards[i].id);
        var strongCards = cards.length > 2 || GameHelper.checkAPig(cardId);
        var isMulti = cards.length > 3;

        var firstEase;
        var secondEase;
        if (strongCards) {
            firstEase = cc.easeBackOut();
            secondEase = cc.easeIn(3);
            scaleBig = 1.8;
        } else {
            firstEase = cc.easeIn(2);
            secondEase = cc.easeOut(2);
        }

        for (var i = 0; i < poss.length; i++) {
            var sam = new SamCard(cards[i].id);
            sam.setPosition(cc.p(cards[i].x, cards[i].y));
            sam.setScale(scale * cards[i].scale);
            var actionArray = [];
            var posMid;
            var posFinal;
            var firstRotation;
            var secondRotation;

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
                secondRotation = poss[0].alpha + rotation;
                posFinal = cc.p(poss[0].x + deltaX, poss[0].y + deltaY);
            }

            //Move cards
            var arrMove = [
                cc.moveTo(timeMove / 2, posMid).easing(firstEase),
                cc.scaleTo(timeMove / 2, scale * scaleBig).easing(cc.easeBackOut()),
                cc.rotateTo(timeMove / 2, firstRotation)
            ];
            if (i === 0) arrMove.push(
                cc.callFunc(function () {
                    gameSound.playCardPlay();
                })
            );
            actionArray.push(cc.spawn(arrMove));

            //Drop cards
            if (strongCards) actionArray.push(cc.delayTime(timeDelay));
            var arrDrop = [
                cc.moveTo(timeMove / 2, posFinal).easing(secondEase),
                cc.scaleTo(timeMove / 2, scale).easing(cc.easeIn(3)),
                cc.rotateTo(timeMove / 2, vec3(45 + rotation, 0, secondRotation))
            ]
            actionArray.push(cc.spawn(arrDrop));

            //Card bouncing
            var arrBounce = [
                cc.scaleTo(0.1, scale * 1.05).easing(cc.easeOut(2)),
                cc.rotateTo(0.05, vec3(0, 0, secondRotation)).easing(cc.easeOut(2)),
                cc.moveTo(0.1, posFinal.x + deltaX, posFinal.y + deltaY).easing(cc.easeOut(2)),
            ];
            if (i === 0) arrBounce.push(
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
                if (i === 0) arrSlide.push(
                    cc.callFunc(function () {
                        gameSound.playCardSlide();
                    })
                );
                actionArray.push(cc.spawn(arrSlide));
            }

            sam.runAction(cc.sequence(actionArray));
            this.cardDanh.push(sam);
            this.addChild(sam);
        }
    },

    addRecentBai: function (cards) {
        var poss = this.generatePos(cards);
        this.cardDanh = [];
        for (var i = 0; i < poss.length; i++) {
            var sam = new SamCard(cards[i]);
            sam.setPosition(cc.p(poss[i].x, poss[i].y));
            sam.setRotation(poss[i].alpha);
            //var action = cc.spawn(cc.moveTo(.25,cc.p(poss[i].x,poss[i].y)),cc.rotateTo(.25,poss[i].alpha));
            //var action2 = cc.sequence(cc.scaleTo(.125,1.35),cc.scaleTo(.125,1));
            //sam.runAction(cc.sequence(cc.delayTime(i *.075),cc.spawn(new cc.EaseOut(action,1.5),action2)));
            this.cardDanh.push(sam);
            this.addChild(sam);
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
                                cc.removeSelf()
                            ));
                    }
                } catch (e) {

                }
            }
            this.cardDanh = [];
        }
    },

    darkenPlayedCards: function () {
        var color = cc.color(200, 200, 200);
        if (this.cardDanh && this.cardDanh.length) {
            for (var i = 0; i < this.cardDanh.length; i++) {
                try {
                    if (this.cardDanh[i]) {
                        if (this.cardDanh[i].getColor() !== color) {
                            this.cardDanh[i].runAction(
                                cc.tintTo(.1, color)
                            );
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


    generatePos: function (cards) {
        var length = cards.length;

        var deltaX = 30;
        var deltaY = 8;
        var deltaAlpha = 10;

        var startX = cc.winSize.width / 2 - deltaX * ((length - 1) / 2.25);
        var startY = cc.winSize.height / 2 + 60;
        var startAlpha = -deltaAlpha * ((length - 1) / 1.7);
        var result = [];

        var orgNode = new cc.Node();
        orgNode.setPosition(cc.p(startX, startY));
        orgNode.setRotation(startAlpha);
        this.addChild(orgNode);
        var tmp = {
            x: orgNode.x,
            y: orgNode.y,
            alpha: orgNode.getRotation()
        }
        result.push(tmp);

        var lastNode = orgNode;
        for (var i = 1; i < length; i++) {
            var tempNode = new cc.Node();
            tempNode.setPosition(cc.p(deltaX, -deltaY));
            tempNode.setRotation(deltaAlpha);
            lastNode.addChild(tempNode);

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

        // if (length % 2 === 0) {
        //     for (var i = (length / 2 - 1); i >= 0; i--) {
        //         var tmp = {
        //             x: (startX - deltaX / 2 - i * deltaX),
        //             y: (startY - deltaY / 2 - deltaY * i),
        //             alpha: (startAlpha - deltaAlpha / 2 - deltaAlpha * i)
        //         }
        //         result.push(tmp);
        //     }
        //     for (var i = 0; i < (length / 2); i++) {
        //         var tmp = {
        //             x: (startX + deltaX / 2 + i * deltaX),
        //             y: (startY - deltaY / 2 - deltaY * i),
        //             alpha: (startAlpha + deltaAlpha / 2 + deltaAlpha * i)
        //         }
        //         result.push(tmp);
        //     }
        //     return result;
        // } else {
        //     for (var i = (Math.floor(length / 2)); i >= 1; i--) {
        //         var tmp = {x: (startX - i * deltaX), y: (startY - deltaY * i), alpha: (startAlpha - deltaAlpha * i)}
        //         result.push(tmp);
        //     }
        //     result.push({x: startX, y: startY - deltaY / 2, alpha: 0})
        //     for (var i = 1; i <= (Math.floor(length / 2)); i++) {
        //         var tmp = {x: (startX + i * deltaX), y: (startY - deltaY * i), alpha: (startAlpha + deltaAlpha * i)}
        //         result.push(tmp);
        //     }
        //     return result;
        // }
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
        this._gameScene.updateBanCards(!this._gameScene.btnPass.isVisible());
        var sortedCards = [];
        for (var i = 0; i < player._handOnCards.length; i++) {
            player._handOnCards[i].forceDOWN();
            player._handOnCards[i].setVisible(false);
            sortedCards.push(new Card(player._handOnCards[i]._id));
        }

        var _2dCards = [];
        for (var i = 0; i < originalCards.length; i++) {
            var card = new SamCard(originalCards[i]._id);
            var pos = player._handOnCards[i].convertToWorldSpaceAR(cc.p(0, 0));
            card.setPosition(this.convertToNodeSpace(pos));
            card.setLocalZOrder(i);
            card.setScale(sceneScale);
            this.addChild(card);
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

        var samResult = new CustomSkeleton("Animation/resultSam", "skeleton", 1);
        samResult.setScale(this._gameScene._layout.getScaleX());
        samResult.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height * (1 / 3)));
        samResult.setTag(LayerEffect2D.SAM_EFFECT_TAG);
        samResult.setVisible(false);
        samResult.idle = idle;
        samResult.action = action;
        this.addChild(samResult);

        samResult.runAction(cc.sequence(
            cc.delayTime(samResult.getDuration(action) + 2),
            cc.callFunc(function () {
                samResult.setAnimation(0, samResult.idle, -1);
            }.bind(samResult)),
            cc.callFunc(function () {
                this._gameScene._effect2D.clearBaiDanh();
            }.bind(this))
        ).repeatForever());

        samResult.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(function () {
                samResult.setVisible(true);
                samResult.setAnimation(0, samResult.action, -1);
            }.bind(samResult)),
            cc.delayTime(1),
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

    toitrang: function (type, pos, handOnCards, enemy, enemyCards) {
        var center = cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
        this.rect = cc.rect(center.x - 185, center.y + 20, 300, 200);
        var time = 0;

        if (!enemy) {
            for (var i = 0; i < handOnCards.length; i++) {
                var card = new SamCard(handOnCards[i]._id);
                this.addChild(card);
                card.setPosition(handOnCards[i].convertToWorldSpaceAR(cc.p(.5, .5)));
                card.runAction(cc.sequence(cc.delayTime(time += .065), new cc.EaseExponentialOut(cc.spawn(cc.scaleTo(.25, .75), cc.moveTo(.25, cc.p(center.x - 110 + 25 * i, pos.y + 10))))));

                handOnCards[i].runAction(cc.sequence(cc.delayTime(time), cc.hide()));
            }

        } else {
            for (var i = 0; i < enemyCards.length; i++) {
                var card = new SamCard(enemyCards[i]);
                this.addChild(card);
                card.setPosition(enemy.convertToWorldSpaceAR(cc.p(.5, .5)));
                card.setScale(.75);
                card.runAction(cc.sequence(cc.delayTime(time += .065), new cc.EaseExponentialOut(cc.spawn(cc.scaleTo(.25, .75), cc.moveTo(.25, cc.p(center.x - 110 + 25 * i, pos.y + 10))))));
                enemy.setVisible(false);
            }

        }


        this.runAction(cc.sequence(cc.delayTime(.75), cc.callFunc(function () {
            var effect = null;
            switch (type) {
                case 1: {
                    effect = this.createAnimation("Samdinh");
                    break;
                }
                case 2: {
                    effect = this.createAnimation("Tuquyheo");
                    break;
                }
                case 3: {
                    effect = this.createAnimation("5Doi");
                    break;
                }
                case 4: {
                    effect = this.createAnimation("Dongmau");
                    break;
                }
            }
            if (!effect) return;
            this.addChild(effect);
            effect.setPosition(cc.p(pos.x, pos.y + 80));
            effect.getAnimation().gotoAndPlay("1", -1, -1, 1);

            this.runAction(cc.sequence(cc.delayTime(.35), cc.callFunc(function () {
                this.addPhaohoa(this.rect);
                gameSound.playFire1();
            }.bind(this))).repeat(15));
        }.bind(this))));
    },

    tuquy: function () {
        var effect = new CustomSkeleton("Animation/fourOfAKind", "skeleton", 0.8);
        if (!effect) return;

        this.addChild(effect);
        effect.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height * 0.8));
        effect.setVisible(false);
        effect.setLocalZOrder(10);
        effect.skeleton.setTimeScale(1.5);

        effect.runAction(cc.sequence(
            cc.delayTime(0.75),
            cc.callFunc(function () {
                this.setAnimation(1, "animation", 0);
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
    },

    multiPlayEffect: function (type) {
        var timeMove = 0.2;
        var delayTime = 0.3;

        var nodeEfx = new cc.Node();
        nodeEfx.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height * 0.81));
        nodeEfx.setScale(0.9);
        this.addChild(nodeEfx);

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

        var scale = this._gameScene._layout.getScaleX();

        var efxNode = cc.Node();
        efxNode.setCascadeOpacityEnabled(true);
        this.addChild(efxNode);
        this.effects.push(efxNode);
        efxNode.runAction(cc.sequence(
            cc.delayTime(3.5),
            cc.fadeOut(0.25)
        ));

        var name = type === GameLayer.END_TYPE_WIN_SAM_DINH? "royalFlush" : "others";

        var animBg = new sp.SkeletonAnimation("Animation/toiTrang/" + name + ".json", "Animation/toiTrang/skeleton.atlas");
        animBg.setVisible(false);
        animBg.setLocalZOrder(-1);
        animBg.setScale(scale);
        animBg.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2 - 50));
        efxNode.addChild(animBg);
        animBg.runAction(cc.sequence(
            cc.delayTime(0.4),
            cc.callFunc(function (anim) {
                anim.setVisible(true);
                anim.setAnimation(1, "animation_back", 0);
            }, animBg),
            cc.delayTime(animBg.findAnimation("animation_back").duration),
            cc.callFunc(function (anim) {
                anim.setAnimation(1, "idle_back", -1);
            }, animBg)
        ));

        var animTop = new sp.SkeletonAnimation("Animation/toiTrang/" + name + ".json", "Animation/toiTrang/skeleton.atlas");
        animTop.setVisible(false);
        animTop.setLocalZOrder(1);
        animTop.setScale(scale);
        animTop.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2 - 50));
        efxNode.addChild(animTop);
        animTop.runAction(cc.sequence(
            cc.delayTime(0.4),
            cc.callFunc(function (anim, type) {
                anim.setVisible(true);
                anim.setAnimation(1, "animation_top_" + type, 0);
            }, animTop, type),
            cc.delayTime(animTop.findAnimation("animation_top_" + type).duration),
            cc.callFunc(function (anim, type) {
                anim.setAnimation(1, "idle_top_" + type, -1);
            }, animTop, type)
        ));

        cards.sort(function (a, b) {
            return a.id - b.id;
        });
        var pos = this.generatePos(cards);

        for (var i = 0; i < pos.length; i++) {
            var sam = new SamCard(cards[i].id);
            sam.setPosition(cc.p(cards[i].x, cards[i].y));
            sam.setScale(scale);
            efxNode.addChild(sam);

            pos[i].y -= 50;

            var actionArray = [];
            actionArray.push(cc.delayTime(i * deltaTime));

            if (isMe) {
                var aLeaveHand = cc.spawn(
                    cc.moveTo(moveTime, cc.p(cards[i].x, cards[i].y - sam.height * scale)).easing(cc.easeBackIn()),
                    cc.scaleTo(moveTime, 0, scale)
                );
                actionArray.push(aLeaveHand);
            } else {
                sam.setVisible(false);
            }

            var aHide = cc.spawn(
                cc.moveTo(0, cc.p(pos[i].x, pos[i].y)).easing(cc.easeBackOut()),
                cc.scaleTo(0, 0),
                cc.rotateTo(0, pos[i].alpha)
            );
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
        }
    },
});
LayerEffect2D.CARD_BACK = "GameGUI/cardBack.png";
LayerEffect2D.SAM_EFFECT_TAG = 115;
