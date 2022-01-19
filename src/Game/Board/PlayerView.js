/**
 * Created by HOANGNGUYEN on 7/28/2015.
 */

var PlayerView = cc.Node.extend({
    ctor: function (gameScene) {
        this._super();
        //reference
        this._bg = null;
        this._cardPanel = null;
        this._panel = null;
        this._card = null;                    // doi voi enemy thi co quan card up
        this._numCard = null;                 // va so quan bai tren tay ho

        this._handOnCards = [];             // danh sach card tren tay nguoi choi
        this._baiEndGame = [];              // bai` con lai khi endgame
        this._index = 0;                   // index cua Player trong array cac Player (0  = myPlayer )
        this._moveCard = null;            // Card di chuyen effect
        this._cardFirstTurn = null;       // Card nhan khi quyet dinh turn di dau
        this._listener = null;
        this._touchEnable = false;
        this._touched = false;

        // infomation of player
        this._uiAvatar = null;               // avatar for player
        this.uID = "";
        this.avatarURL = "";
        this._avatarTmp = null;               // avatar fix share image
        this._uiName = null;                  // name for player
        this._uiGold = null;                  // gold
        this._uiTimer = null;                 // timer progress
        this._type = 1;                       // 1-> enemy
        this._sortedCards = kSort_Unkown;

        this._gameScene = gameScene;
        this._enableTouch = true;

        this._levelResult = null;

        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        });
    },

    setPanel: function (panel) {
        this._panel = panel;
        this._panel.setAnchorPoint(cc.p(0.5, 0.5));
        this._panel.x += this._panel.width / 2;
        this._panel.y += this._panel.height / 2;
        this._panel.defaultPos = this._panel.getPosition();

        var avatar = new AvatarUI("Common/defaultAvatar.png", "GameGUI/bgAvatar.png", "");
        panel.addChild(avatar);
        avatar.setPosition(ccui.Helper.seekWidgetByName(panel, "btn").getPosition());
        avatar.setLocalZOrder(1);
        avatar.setScale(1.089);

        var mask = panel.getChildByName("mask");
        var size = mask.getContentSize();
        this.mask = mask;
        this.mask.setLocalZOrder(2);

        var vip = panel.getChildByName("vip");
        vip.ignoreContentAdaptWithSize(true);
        vip.setVisible(false);
        vip.ignoreContentAdaptWithSize(true);
        this.vip = ccui.Scale9Sprite.create(VipManager.getIconVip(10));
        this.vip.setAnchorPoint(cc.p(1, 0.5));
        vip.getParent().addChild(this.vip);
        this.vip.setPosition(vip.getPosition());
        this.vip2 = vip;
        this.vip.setLocalZOrder(3);
        this.vip2.setLocalZOrder(3);
        this.vipParticle = new cc.ParticleSystem("Particles/card.plist");
        this.vipParticle.setPosition(cc.p(this.vip.width / 2, this.vip.height / 2));
        this.vipParticle.setLocalZOrder(-1);
        this.vip.addChild(this.vipParticle);

        this.avatarFrame = mask.getChildByName("frame");
        this.avatarFrame.setLocalZOrder(0);
        this.orgFrame = mask.getChildByName("orgFrame");
        this.orgFrame.setLocalZOrder(0);

        this.view = mask.getChildByName("view");

        this._bg = panel.getChildByName("bg");

        this._uiAvatar = avatar;
        this._uiName = ccui.Helper.seekWidgetByName(panel, "name");
        this._uiGold = ccui.Helper.seekWidgetByName(panel, "gold");

        this.timer = panel.getChildByName("timer");
        this.timer.orgPos = this.timer.getPosition();
        this.timerLabel = this.timer.getChildByName("label");
        this.timer.setVisible(false);
        this.timer.eff = new CustomSkeleton("Animation/clock", "skeleton", 1);
        this.timer.eff.setLocalZOrder(-1);
        this.timer.eff.setScale(0.7);
        this.timer.eff.setPosition(cc.p(this.timer.width / 2, this.timer.height / 2));
        this.timer.addChild(this.timer.eff);

        this.passPanel = panel.getChildByName("passPanel");
        this.passPanel.setVisible(false);
        this.passPanel.pass = this.passPanel.getChildByName("pass");
        this.sSmall = this.passPanel.pass.getScaleX();
        this.passPanel.passClear = this.passPanel.getChildByName("passClear");
        this.sBig = this.passPanel.passClear.getScaleX();

        this.baoPanel = panel.getChildByName("baoPanel");
        this.baoPanel.setVisible(false);
        this.baoPanel.bao = this.baoPanel.getChildByName("bao");
        this.baoPanel.baoCancel = this.baoPanel.getChildByName("baoCancel");
        this.baoPanel.baoCancelClear = this.baoPanel.getChildByName("baoCancelClear");

        panel.getChildByName("demo").setVisible(false);

        this.pEmo = ccui.Helper.seekWidgetByName(panel, "pEmo");

        this.result = panel.getChildByName("result");
        this.resultLose = this.result.getChildByName("bgLose");
        this.resultLose.label = this.resultLose.getChildByName("label");
        this.resultLose.lbGold = this.resultLose.getChildByName("lbGold");
        this.resultLose.lbGoldPos = this.resultLose.lbGold.getPosition();
        this.resultLose.pCards = this.resultLose.getChildByName("cards");
        this.resultLose.cards = [];
        for (var i = 0; i < 10; i++)
            this.resultLose.cards.push(this.resultLose.pCards.getChildByName("card_" + i));
        this.resultLose.stamp = this.resultLose.getChildByName("stamp");
        this.resultLose.lbStamp = this.resultLose.stamp.getChildByName("label");

        this.resultWin = this.result.getChildByName("bgWin");
        this.resultWin.label = this.resultWin.getChildByName("label");
        this.resultWin.eff = new CustomSkeleton("Animation/win", "skeleton", 1);
        this.resultWin.eff.setScale(0.7);
        this.resultWin.eff.setPosition(cc.p(this.resultWin.label.width / 2, this.resultWin.label.height / 2));
        this.resultWin.label.addChild(this.resultWin.eff);
        this.resultWin.lbGold = this.resultWin.getChildByName("lbGold");
        this.resultWin.lbGoldPos = this.resultWin.lbGold.getPosition();
        this.resultWin.fox = new CustomSkeleton("Animation/resultSam", "skeleton", 1);
        this.resultWin.fox.setScale(0.45);
        this.resultWin.fox.setPosition(cc.p(this.resultWin.label.x + this.resultWin.label.width, this.resultWin.label.y - 25));
        this.resultWin.fox.setLocalZOrder(-1);
        this.resultWin.addChild(this.resultWin.fox);

        this.resultBlock = new CustomSkeleton("Animation/resultSam", "skeleton", 1);
        this.resultBlock.setScale(0.45);
        this.resultBlock.setPosition(cc.p(-165, 0));
        this.resultBlock.setLocalZOrder(-1);
        this.result.addChild(this.resultBlock);

        this.lbExp = panel.getChildByName("lbExp");
        this.lbExp.orgPos = this.lbExp.getPosition();

        this.resultBlock.setVisible(false);
        this.resultWin.setVisible(false);
        this.resultLose.setVisible(false);
        this.lbExp.setVisible(false);

        this._card = panel.getChildByName("card");
        this.baoOne = panel.getChildByName("baoOne");
        this.baoOne.setVisible(true);
        this.baoOne.orgPos = this.baoOne.getPosition();
        this.baoOne.eff = new CustomSkeleton("Animation/bao", "skeleton", 1);
        this.baoOne.eff.setPosition(cc.p(this.baoOne.width / 2, 25));
        this.baoOne.addChild(this.baoOne.eff);
    },

    swapSide: function (control) {
        control.setPositionX(- control.getPositionX() + this._bg.width);
        control.orgPos = control.getPosition();
    },

    swapResultGUI: function () {
        this.result.setScaleX(- this.result.getScaleX());

        this.resultLose.label.setScaleX(-1);
        this.resultLose.pCards.setScaleX(-1);
        this.resultLose.lbStamp.setScaleX(-1);

        var lb = this.resultLose.lbGold;
        var posX = lb.getPositionX();
        lb.setScaleX(-1);
        lb.setAnchorPoint(cc.p(1, 0.5));
        lb.setPositionX(posX);

        this.resultWin.label.setScaleX(-1);

        lb = this.resultWin.lbGold;
        posX = lb.getPositionX();
        lb.setScaleX(-1);
        lb.setAnchorPoint(cc.p(1, 0.5));
        lb.setPositionX(posX);
        this.lbExp.setAnchorPoint(cc.p(1, 0.5));
        this.lbExp.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        this.swapSide(this.lbExp);
        this.lbExp.orgPos = this.lbExp.getPosition();
    },

    isSwapped: function () {
        return (this._index === 1 || this._index === 2);
    },

    initCards: function (cards) {
        cc.log("INIT CARD " + JSON.stringify(cards));

        var height = this._cardPanel.getContentSize().height;
        for (var i = 0; i < cards.length; i++) {
            var card = new SamCard(cards[i]);
            card.addEfxBan();
            card.setLocalZOrder(i);
            card._startY = height / 2;
            this._cardPanel.addChild(card);
            this._handOnCards.push(card);
        }

        this.fixPositionHandOnCardForMy(true);
    },

    /* init for myPlayer */
    initForMy: function (gameScene) {
        if (!this._cardPanel) {
            return;
        }

        this.setPosition(this._cardPanel.getPosition().x, this._cardPanel.getPosition().y);
        this._cardPanel.setVisible(false);
        this._index = 0;
        cc.eventManager.addListener(this._listener, this);
        this._touchEnable = true;
        if (!this._moveCard) {
            this._moveCard = new SamCard(60);
            this._moveCard.setVisible(false);
            this._moveCard.setOpacity(100);
            this._moveCard.setLocalZOrder(20);
            this._cardPanel.addChild(this._moveCard);
        }
        this._type = 0;

        var width = this._cardPanel.getContentSize().width;
        var height = this._cardPanel.getContentSize().height;
        this._cardFirstTurn = new SamCard(60);
        this._cardFirstTurn.setVisible(false);
        this._cardFirstTurn.setPosition(cc.p(width / 2, height / 2));
        this._cardPanel.addChild(this._cardFirstTurn);

        this.resultLose = this.result.getChildByName("bgLose");
        this.resultLose.lbGold = this.resultLose.getChildByName("gold");
        this.resultLose.label = this.resultLose.getChildByName("label");
        this.resultLose.setVisible(false);

        this.resultWin = this.result.getChildByName("bgWin");
        this.resultWin.lbGold = this.resultWin.getChildByName("gold");
        this.resultWin.lbGold.setLocalZOrder(1);
        this.resultWin.label = this.resultWin.getChildByName("label");
        this.resultWin.label.setLocalZOrder(1);
        this.resultWin.eff = new CustomSkeleton("Animation/light", "skeleton", 1);
        this.resultWin.eff.setPosition(this.resultWin.width / 2, this.resultWin.height / 2 + 5);
        this.resultWin.eff.setScale(1.25);
        this.resultWin.eff.skeleton.setTimeScale(1.5);
        this.resultWin.addChild(this.resultWin.eff);
        this.resultWin.setVisible(false);

        this.timer = gameScene.getControl("timer");
        this.timer.orgPos = this.timer.getPosition();
        this.timerLabel = this.timer.getChildByName("label");
        this.timer.setVisible(false);
        this.timer.eff = new CustomSkeleton("Animation/clock", "skeleton", 1);
        this.timer.eff.setLocalZOrder(-1);
        this.timer.eff.setScale(1);
        this.timer.eff.setPosition(cc.p(this.timer.width / 2, this.timer.height / 2));
        this.timer.addChild(this.timer.eff);

        this.vip.setAnchorPoint(cc.p(0, 0.5));
        this.swapSide(this.vip);
        this.vip.setPositionY(this._panel.getChildByName("card").getPositionY());

        this.lbExp.orgPos.y += 25;
    },

    enableTouch: function (enable) {
        this._enableTouch = enable;
    },

    /* myPlayer ; fix position cards khi danh quan bai */
    fixPositionHandOnCardForMy: function (immediately) {
        if (this._handOnCards.length === 0)
            return;

        this._cardPanel.setVisible(true);
        var width = this._cardPanel.getContentSize().width;
        var height = this._cardPanel.getContentSize().height;
        //this.setContentSize(cc.size(width, height));

        var cardW = this._handOnCards[0].getContentSize().width;

        var xx = (width - cardW) / 9;       // khoang cach giua 2 card

        if ((this._handOnCards.length % 2) === 0) {
            var idx = this._handOnCards.length / 2 - 1;
            for (var i = idx; i >= 0; i--) {
                this.cardToPosition(this._handOnCards[i], cc.p(width / 2 - xx / 2 - (idx - i) * xx, height / 2), immediately);
            }
            for (var i = idx + 1; i < this._handOnCards.length; i++) {
                this.cardToPosition(this._handOnCards[i], cc.p(width / 2 + xx / 2 + (i - idx - 1) * xx, height / 2), immediately);
            }
        } else {
            var idx = Math.floor(this._handOnCards.length / 2);
            for (var i = idx; i >= 0; i--) {
                this.cardToPosition(this._handOnCards[i], cc.p(width / 2 - (idx - i) * xx, height / 2), immediately);
            }
            for (var i = idx; i < this._handOnCards.length; i++) {
                this.cardToPosition(this._handOnCards[i], cc.p(width / 2 + (i - idx) * xx, height / 2), immediately);
            }
        }
    },

    cardToPosition: function (control, position, immediately) {
        control.stopAllActions();
        if
            (immediately) control.setPosition(position);
        else
            control.runAction(cc.moveTo(0.25, position).easing(cc.easeBackOut()));
    },

    /* myPlayer ; fix position cards khi danh quan bai */

    _chooseCard: null,
    _cardMoveTo: null,
    _firstOrEnd: false,
    _needMove: false,
    _startPoint: cc.p(-1, -1),
    rect: function () {
        if (this._handOnCards.length == 0)
            if (this._handOnCards.length == 0) {
                return cc.rect(0, 0, 0, 0);
            }
        var pos = this.getPosition();
        pos.x += (this._handOnCards[0].getPositionX() - this._handOnCards[0].getContentSize().width * this._handOnCards[0].getAnchorPoint().x);
        pos.y += (this._handOnCards[0].getPositionY() - this._handOnCards[0].getContentSize().height * this._handOnCards[0].getAnchorPoint().y);
        var width = (this._handOnCards[this._handOnCards.length - 1].getPositionX() - this._handOnCards[0].getPositionX()) + this._handOnCards[0].getContentSize().width;
        var height = this._handOnCards[0].getContentSize().height;

        return cc.rect(pos.x, pos.y, width, height);
    },

    onTouchBegan: function (touch, event) {
        this.forceAllCardDown = false;
        var target = event.getCurrentTarget();
        var needTouch = true;
        if (!cc.sys.isNative && touch.getID() === undefined) {
            touch._id = 0;
        }
        for (var i = 0; i < target._handOnCards.length; i++) {
            if (!target._handOnCards[i].isVisible()) {
                needTouch = false;
                break;
            }
        }

        if (touch.getID() != 0 || !target._touchEnable || !needTouch) {
            return false;
        }

        target._touched = true;
        target._needMove = false;
        target._chooseCard = null;
        target._cardMoveTo = null;

        for (var i = target._handOnCards.length - 1; i >= 0; i--) {
            if (target._handOnCards[i].containTouchPoint(touch.getLocation())) {
                target._startPoint = touch.getLocation();
                target._chooseCard = target._handOnCards[i];
                target._chooseCardIdx = i;
                target._moveCard.setID(target._chooseCard._id);

                var anchor = target._chooseCard.calculateAnchorPoint(touch.getLocation());
                target._moveCard.setAnchorPoint(anchor);
                return true;
            }
        }

        for (var i = target._handOnCards.length - 1; i >= 0; i--) {
            if (target._handOnCards[i]._up) target._handOnCards[i].upDown();
        }
        return false;
    },

    onTouchMoved: function (touch, event) {
        var target = event.getCurrentTarget();
        if (touch.getID() != 0 || !target._touchEnable || !target._touched)
            return;

        if (target._startPoint.x == -1 || !target._chooseCard)
            return;
        var distance = cc.pSub(touch.getLocation(), target._startPoint);
        var length = distance.x * distance.x + distance.y * distance.y;
        if (!target._needMove && (length >= 15 * 15)) {
            target._needMove = true;
        }
        if (!target._needMove)
            return;

        target._firstOrEnd = false;
        target._moveCard.setVisible(true);
        try {
            target._chooseCard.setVisible(false);
        } catch (e) {

        }

        target._moveCard.setOpacity(255);
        target._moveCard.setLocalZOrder(20);
        target._moveCard.setPosition(target._cardPanel.convertToNodeSpace(touch.getLocation()));

        if (!this.forceAllCardDown) {
            this.forceAllCardDown = true;

            target._cardEfx = [];
            for (var i = 0; i < target._handOnCards.length; i++) {
                target._handOnCards[i].forceDOWN();
                target._handOnCards[i].setVisible(false);

                var cardEffect = new SamCard(target._handOnCards[i]._id);
                cardEffect.setLocalZOrder(target._handOnCards[i].getLocalZOrder());
                cardEffect.setPosition(target._handOnCards[i].getPosition());
                cardEffect.setVisible(i !== target._chooseCardIdx);

                target._cardPanel.addChild(cardEffect);
                target._cardEfx.push(cardEffect);
            }
        }

        var x = touch.getLocation().x;
        //No longer move
        if (target._handOnCards.length === 1) {
            target._cardMoveTo = target._handOnCards[0];
            return;
        }

        for (var i = target._handOnCards.length - 1; i >= 0; i--) {
            var anchor1 = target._handOnCards[i].convertToWorldSpace(cc.p(0, 0)).x;
            var anchor2 = anchor1 + target._handOnCards[i].getContentSize().width;
            if (i === target._handOnCards.length - 1) {
                if (x >= anchor1) {
                    target.moveCardASide(i);
                    if (x >= anchor2) {
                        target._firstOrEnd = true;
                    }
                    break;
                }
            } else if (i == 0) {
                if (x < target._handOnCards[i + 1].convertToWorldSpace(cc.p(0, 0)).x) {
                    target.moveCardASide(i);
                    if (x < anchor1) {
                        target._firstOrEnd = true;
                    }
                    break;
                }
            } else {
                var anchor3 = target._handOnCards[i + 1].convertToWorldSpace(cc.p(0, 0)).x;
                var anchor = Math.max(anchor3, anchor1);
                if (x >= anchor1 && x < anchor) {
                    target.moveCardASide(i);
                    break;
                }
            }
        }
    },

    moveCardASide: function (index) {
        if (this._cardMoveTo !== null && this._cardMoveTo !== this._handOnCards[index]) {
            //this._cardMoveTo.setColor(cc.WHITE);
            //this._handOnCards[index].setColor(cc.color(100, 100, 100));

            for (var i = 0; i < this._cardEfx.length; i++) {
                //cc.log("CARD MOVE", index, this._chooseCardIdx, i, this._chooseCard);
                var targetIndex = i;
                if (this._chooseCardIdx < index) {
                    if (i > this._chooseCardIdx && i <= index) {
                        targetIndex = i - 1;
                    }
                } else {
                    if (i >= index && i < this._chooseCardIdx) {
                        targetIndex = i + 1;
                    }
                }
                this._cardEfx[i].stopAllActions();
                if (this._cardEfx[i].getPosition() !== this._handOnCards[targetIndex].getPosition()) {
                    this._cardEfx[i].runAction(
                        cc.moveTo(0.15, this._handOnCards[targetIndex].getPosition()).easing(cc.easeBackOut())
                    );
                }
                this._cardEfx[i].setLocalZOrder(this._handOnCards[targetIndex].getLocalZOrder());
            }
        }
        this._cardMoveTo = this._handOnCards[index];
        this._moveCard.setLocalZOrder(this._handOnCards[index].getLocalZOrder());
    },

    onTouchEnded: function (touch, event) {
        var target = event.getCurrentTarget();
        if (touch.getID() != 0 || !target._touchEnable) return;

        target._touched = false;
        if (!target._needMove) {
            gameSound.clickQuanbai();
            for (var i = target._handOnCards.length - 1; i >= 0; i--) {
                if (target._handOnCards[i].containTouchPoint(touch.getLocation()) && target._handOnCards[i].isVisible()) {
                    target._handOnCards[i].upDown();
                    if (target._handOnCards[i]._up) target._gameScene.oneCardCheck(target._handOnCards[i]._id);
                    target._gameScene.kiemtraDanhbai(target._handOnCards[i]._up);
                    return;
                }
            }
        }

        //Card dragging
        if (target._cardMoveTo && target._chooseCard) {
            //Getting card indexes
            var idxChooseCard = target._chooseCardIdx;
            var idxCardMoveTo = -1;
            for (var i = target._handOnCards.length - 1; i >= 0; i--) {
                if (target._cardMoveTo._id === target._handOnCards[i]._id) {
                    idxCardMoveTo = i;
                }
            }
            if (idxCardMoveTo === -1 || idxChooseCard === -1) return;

            var moveTime = 0.25;

            for (var i = 0; i < target._cardEfx.length; i++) {
                target._cardEfx[i].runAction(cc.sequence(
                    cc.delayTime(moveTime),
                    cc.removeSelf()
                ));

                target._handOnCards[i].runAction(cc.sequence(
                    cc.delayTime(moveTime),
                    cc.show()
                ));
            }

            var idCardChoose = target._handOnCards[idxChooseCard]._id;

            if (idxChooseCard < idxCardMoveTo) {
                for (var i = 0; i < target._handOnCards.length; i++) {
                    if (i >= idxChooseCard && i < idxCardMoveTo) {
                        target._handOnCards[i].setID(target._handOnCards[i + 1]._id);
                    }
                }
            } else if (idxChooseCard > idxCardMoveTo) {
                for (var i = target._handOnCards.length - 1; i >= 0; i--) {
                    if (i > idxCardMoveTo && i <= idxChooseCard) {
                        target._handOnCards[i].setID(target._handOnCards[i - 1]._id);
                    }
                }
            }
            target._handOnCards[idxCardMoveTo].setID(idCardChoose);
            target._gameScene.updateBanCards(!target._gameScene.btnPass.isVisible());

            var newAnchorPos = target._moveCard.calculateNewPositionWithNewAnchor(cc.p(.5, .5));
            target._moveCard.setAnchorPoint(cc.p(.5, .5));
            target._moveCard.setPosition(newAnchorPos);
            target._moveCard.setLocalZOrder(target._cardMoveTo.getLocalZOrder());
            target._moveCard.runAction(cc.sequence(
                cc.moveTo(moveTime, target._cardMoveTo.getPosition()).easing(cc.easeBackOut()),
                cc.callFunc(function (sender, pTarget) {
                    pTarget._touchEnable = true;
                }, target, target),
                cc.hide()
            ));
        }

        //Reset attribute
        target._cardMoveTo = null;
        target._needMove = false;
        target._firstOrEnd = false;
        target._startPoint = cc.p(-1, -1);
        target._chooseCard = null;
    },

    updateWithPlayer: function (player) {
        cc.log("UPDATE WITH PLAYER", this.isLeaving, JSON.stringify(player));
        if (!player._ingame) {
            if (!this.isLeaving) this.setVisible(false);
            return;
        }
        if (!player._active) {
            return;
        }

        this._panel.setPosition(this._panel.defaultPos);
        this._panel.setScale(1);
        this._panel.setRotation3D(vec3(0, 0, 0));

        this.info = player._info;
        this.setVisible(true);
        this._uiName.setString(StringUtility.subStringTextLength(player._info["uName"], 10));
        this._uiAvatar.asyncExecuteWithUrl(player._info["uID"], player._info["avatar"]);
        this.uID = player._info["uID"];
        this.avatarURL = player._info["uID"], player._info["avatar"];
        this._uiGold.setString(this.convertGoldString(player._info["bean"]) + "$");

        this.vip.setVisible(player._info["vip"] > 0);
        try {
            if (player._info["vip"] > 0) {
                this.vip2.loadTexture(VipManager.getIconVip(player._info["vip"]));
                this.vip.initWithFile(VipManager.getIconVip(player._info["vip"]));
                this.vip.setContentSize(this.vip2.getContentSize());
                this.vip2.setVisible(false);
                this.vipParticle.setPosition(cc.p(this.vip.width / 2, this.vip.height / 2));
                var color = PlayerView.VIP_PARTICLE[player._info["vip"]];
                this.vipParticle.setStartColor(color);
                color.a = 0;
                this.vipParticle.setEndColor(color);
            }
        } catch (e) {
            cc.error("loi load vip: ", player._info["vip"]);
            if (player._info["vip"] > 0) {
                this.vip.setVisible(false);
                this.vip2.setVisible(true);
                this.vip2.loadTexture(VipManager.getIconVip(player._info["vip"]));
            }
        }

        if (player._info["uID"] === gamedata.getUserId()) {
            var state = (VipManager.getInstance().getRemainTime() > 0) ? 0 : 1;
            this.vip.setState(state);
        }
        this.addVipEffect();


        if (player._status == 1)     // dang xem
        {
            this.viewing(true);
            if (this._index != 0)
                this._card.setVisible(false);
        } else if (player._status == 0) {
            this.setVisible(false);
            if (this._index != 0)
                this._card.setVisible(false);
        } else {
            this.viewing(false);

        }

        player._active = false;
    },

    efxPlayerIn: function () {
        this._panel.stopAllActions();
        this._panel.setOpacity(0);
        this._panel.setPosition(this._panel.defaultPos);
        this._panel.x += this.isSwapped()? 25 : -25;
        this._panel.runAction(cc.spawn(
            cc.moveTo(0.25, this._panel.defaultPos).easing(cc.easeBackOut()),
            cc.fadeIn(0.25)
        ));

        this.vip.setScale(1.5);
        this.vip.setOpacity(0);
        this.vipParticle.setVisible(false);
        this.vip.runAction(cc.sequence(
            cc.delayTime(0.25),
            cc.spawn(
                cc.scaleTo(0.25, 1).easing(cc.easeIn(5)),
                cc.fadeIn(0.1)
            ),
            cc.callFunc(this.addVipEffect.bind(this))
        ))
    },

    efxPlayerOut: function () {
        this.isLeaving = true;
        this._panel.stopAllActions();
        this._panel.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(
                0.25,
                this._panel.defaultPos.x + (this.isSwapped()? 25 : -25),
                    this._panel.defaultPos.y
                ).easing(cc.easeBackIn()),
                cc.fadeOut(0.25)
            ),
            cc.hide(),
            cc.callFunc(function () {
                this.isLeaving = false;
            }.bind(this))
        ));
    },

    convertGoldString: function (gold) {
        if (gold >= 10000000) return StringUtility.formatNumberSymbol(gold);
        else return StringUtility.standartNumber(gold);
    },

    viewing: function (view) {
        if (view) {
            this.view.setVisible(true);
            if (this._index === 0) {
                //TOOLTIP
                this._gameScene.pTooltip.stopAllActions();
                this._gameScene.pTooltip.setVisible(true);
                this._gameScene.pTooltip.lb.setString(localized("TIP_" + Math.floor(Math.random() * 11 + 1)))
                this._gameScene.pTooltip.runAction(cc.sequence(
                    cc.delayTime(15),
                    cc.callFunc(function () {
                        this.setString(localized("TIP_" + Math.floor(Math.random() * 11 + 1)))
                    }.bind(this._gameScene.pTooltip.lb))
                ).repeatForever());
            }
        } else {
            this.view.setVisible(false);
            if (this._index === 0) {
                this._gameScene.pTooltip.stopAllActions();
                this._gameScene.pTooltip.setVisible(false);
            }
        }
    },
    addVipEffect: function () {
        if (!this.info) return;

        var listBenefitHave = VipManager.getInstance().getListBenefitHave(this.info["vip"], false);
        if (listBenefitHave.indexOf(6) >= 0) // key hieu ung vao ban
        {
            this.vipParticle.setVisible(true);
            this.vipParticle.resetSystem();
        } else {
            this.vipParticle.setVisible(false);
        }
    },
    setVisible: function (visible) {
        cc.Node.prototype.setVisible.call(this, visible);
        this._panel.setVisible(visible);
    },
    danhbai: function (cards) {
        var ret = []
        if (this._type == Player.MY) {
            for (var j = 0; j < this._handOnCards.length; j++) {
                this._handOnCards[j].forceDOWN();
                this._handOnCards[j].setVisible(true);
            }

            var check = [];
            for (var i = 0; i < cards.length; i++) {
                for (var j = 0; j < this._handOnCards.length; j++) {
                    if (this._handOnCards[j]._id == cards[i]) {
                        ret.push({
                            id: this._handOnCards[j]._id,
                            x: this._handOnCards[j].convertToWorldSpaceAR(cc.p(0, 0)).x,
                            y: this._handOnCards[j].convertToWorldSpaceAR(cc.p(0, 0)).y,
                            scale: 1
                        });
                        check.push(j);
                        break;
                    }
                }
            }

            check.sort(function (a, b) { return a - b;});
            for (var i = check.length - 1; i >= 0; i--) {
                this._handOnCards[check[i]].removeFromParent(true);
                this._handOnCards.splice(check[i], 1);
            }
            this.fixPositionHandOnCardForMy();
        } else {
            var sam = new SamCard();
            var scale = this._card.width / sam.getContentSize().width;
            for (var i = 0; i < cards.length; i++) {
                ret.push({
                    id: cards[i],
                    x: this._card.convertToWorldSpaceAR(cc.p(0, 0)).x,
                    y: this._card.convertToWorldSpaceAR(cc.p(0, 0)).y,
                    scale: scale
                });
            }
        }
        return ret;
    },

    addEffectTime: function (time, timeRemain) {
        var percent = 1;
        if (timeRemain) {
            percent = timeRemain / time;
            time = timeRemain;
        }

        //Running time circle
        this.timer.stopAllActions();
        this.timer.setOpacity(0);
        this.timer.setVisible(true);
        this.timer.setScale(1);
        this.timer.setRotation(0);
        this.timer.setPosition(cc.p(this.timer.orgPos.x, this.timer.orgPos.y + 50));
        this.timer.runAction(cc.spawn(
            cc.fadeIn(0.1),
            cc.moveTo(0.5, this.timer.orgPos).easing(cc.easeBounceOut())
        ));
        this.timer.runAction(cc.sequence(
            cc.delayTime(time - 5),
            cc.callFunc(function () {
                this.timer.eff.setAnimation(1, "rang", -1);
            }.bind(this))
        ));
        this.timer.eff.setAnimation(1, "idle", -1);

        //Sound play for me
        this.timer._time = time;
        if (this._index === 0)
            this.timer.runAction(cc.sequence(
                cc.callFunc(function () {
                    if (this._time < 5) gameSound.playTimer();
                    this._time--;
                }.bind(this.timer)),
                cc.delayTime(1)
            ).repeat(Math.floor(time)));

        //Count the last 5s
        effectMgr.countdownLabelEffect(this.timerLabel, Math.floor(time), time - Math.floor(time), Math.floor(time));

        //Zoom in out
        this.mask.stopAllActions();
        this.mask.runAction(cc.scaleTo(0.5, 1.2).easing(cc.easeBackOut()));
        this._uiAvatar.stopAllActions();
        this._uiAvatar.runAction(cc.scaleTo(0.5, 1.2).easing(cc.easeBackOut()));
    },

    stopEffectTime: function () {
        this.timer.stopAllActions();
        this.timer.runAction(cc.sequence(
            cc.scaleTo(0.2, 0).easing(cc.easeBackIn()),
            cc.hide()
        ));
        this.timerLabel.stopAllActions();

        //Zoom back
        this.mask.stopAllActions();
        this.mask.runAction(cc.scaleTo(0.25, 1));
        this._uiAvatar.stopAllActions();
        this._uiAvatar.runAction(cc.scaleTo(0.25, 1));
    },

    sapxep: function () {
        var cards = [];                             // card original (de return)
        var tmpCards = [];                          // card de sapxep
        var ret = null;                               // result sau khi sap xep
        for (var i = 0; i < this._handOnCards.length; i++) {
            cards.push(new Card(this._handOnCards[i]._id));
            tmpCards.push(new Card(this._handOnCards[i]._id));
        }

        if (this._sortedCards === kSort_Unkown) {
            ret = GameHelper.sapxepQuanBai(tmpCards, kSort_TangDan);
            this._sortedCards = kSort_TangDan;
        } else if (this._sortedCards === kSort_TangDan) {
            ret = GameHelper.sapxepQuanBai(tmpCards, kSort_Group);
            this._sortedCards = kSort_Group;
        } else if (this._sortedCards === kSort_Group) {
            ret = GameHelper.sapxepQuanBai(tmpCards, kSort_TangDan);
            this._sortedCards = kSort_TangDan;
        }

        for (var i = 0; i < this._handOnCards.length; i++) {
            this._handOnCards[i].setID(ret[i]._id);
        }
        return cards;
    },

    clearBai: function () {
        for (var i = 0; i < this._handOnCards.length; i++) {
            this._handOnCards[i].removeFromParent();
        }
        this._handOnCards = [];
    },

    firstTurn: function (id) {
        if (this._cardPanel) this._cardPanel.setVisible(true);
        if (this._cardFirstTurn instanceof SamCard) {
            this._cardFirstTurn.setID(id);
        } else if (this._cardFirstTurn instanceof cc.Sprite) {
            if (cc.sys.isNative) {
                this._cardFirstTurn.setTexture(cc.textureCache.addImage(SamCard.getCardResource(id, true)));
            } else {
                this._cardFirstTurn.setTexture(SamCard.getCardResource(id, true));
            }
        }
        return this._cardFirstTurn;
    },

    clearBaiEndGame: function () {
        for (var i = 0; i < this._baiEndGame.length; i++) {
            this._baiEndGame[i].runAction(cc.sequence(cc.fadeOut(.4), cc.removeSelf()));
        }
        this._baiEndGame = [];
    },

    addBaiEndGame: function (cards, delayTime) {
        switch (this._index) {
            case 1:
            case 4: {
                var centerPos = this._card.convertToWorldSpaceAR(cc.p(0, 0));
                var deltaY = 22;
                var startY = centerPos.y + deltaY * Math.floor(cards.length / 2);

                var _time = 0;
                if (delayTime) _time += delayTime;
                for (var i = 0; i < cards.length; i++) {
                    var sam = new SamCard(cards[i]);
                    sam.setScale(.72);
                    this.addChild(sam);
                    this._baiEndGame.push(sam);
                    sam.setPosition(cc.p(centerPos.x, startY - deltaY * i));
                    sam.setOpacity(0);
                    sam.runAction(cc.sequence(cc.delayTime(_time), cc.fadeIn(.45)));
                    _time += .05;
                }

                break;
            }
            case 2: {
                var centerPos = this._card.convertToWorldSpaceAR(cc.p(0, 0));
                var deltaY = 40;
                var startY = 0;
                if (cards.length <= 5) {
                    var _time = 0;
                    if (delayTime) _time += delayTime;
                    startY = centerPos.y;
                    for (var i = 0; i < cards.length; i++) {
                        var sam = new SamCard(cards[i]);
                        sam.setScale(.72);
                        this.addChild(sam);
                        this._baiEndGame.push(sam);
                        sam.setPosition(cc.p(centerPos.x, startY - deltaY * i));
                        sam.setOpacity(0);
                        sam.runAction(cc.sequence(cc.delayTime(_time), cc.fadeIn(.45)));
                        _time += .05;
                    }
                } else {
                    startY = centerPos.y;
                    var _time = 0;
                    if (delayTime) _time += delayTime;
                    for (var i = 5; i < cards.length; i++) {
                        var sam = new SamCard(cards[i]);
                        sam.setScale(.72);
                        this.addChild(sam);
                        this._baiEndGame.push(sam);
                        sam.setPosition(cc.p(centerPos.x, startY - deltaY * (i - 5)));
                        sam.setOpacity(0);
                        sam.runAction(cc.sequence(cc.delayTime(_time), cc.fadeIn(.45)));
                        _time += .05;
                    }

                    for (var i = 0; i < 5; i++) {
                        var sam = new SamCard(cards[i]);
                        sam.setScale(.72);
                        this.addChild(sam);
                        this._baiEndGame.push(sam);
                        sam.setPosition(cc.p(centerPos.x + 27, startY - deltaY * i));
                        sam.setOpacity(0);
                        sam.runAction(cc.sequence(cc.delayTime(_time), cc.fadeIn(.45)));
                        _time += .05;
                    }
                }
                break;
            }
            case 3: {
                var centerPos = this._card.convertToWorldSpaceAR(cc.p(0, 0));
                var deltaY = 40;
                var startY = 0;
                var _time = 0;
                if (delayTime) _time += delayTime;
                if (cards.length <= 5) {
                    startY = centerPos.y;
                    for (var i = 0; i < cards.length; i++) {
                        var sam = new SamCard(cards[i]);
                        sam.setScale(.72);
                        this.addChild(sam);
                        this._baiEndGame.push(sam);
                        sam.setPosition(cc.p(centerPos.x, startY - deltaY * i));
                        sam.setOpacity(0);
                        sam.runAction(cc.sequence(cc.delayTime(_time), cc.fadeIn(.45)));
                        _time += .05;
                    }
                } else {
                    startY = centerPos.y;
                    var _time = 0;
                    if (delayTime) _time += delayTime;
                    for (var i = 0; i < 5; i++) {
                        var sam = new SamCard(cards[i]);
                        sam.setScale(.72);
                        this.addChild(sam);
                        this._baiEndGame.push(sam);
                        sam.setPosition(cc.p(centerPos.x - 27, startY - deltaY * i));
                        sam.setOpacity(0);
                        sam.runAction(cc.sequence(cc.delayTime(_time), cc.fadeIn(.45)));
                        _time += .05;
                    }

                    for (var i = 5; i < cards.length; i++) {
                        var sam = new SamCard(cards[i]);
                        sam.setScale(.72);
                        this.addChild(sam);
                        this._baiEndGame.push(sam);
                        sam.setPosition(cc.p(centerPos.x, startY - deltaY * (i - 5)));
                        sam.setOpacity(0);
                        sam.runAction(cc.sequence(cc.delayTime(_time), cc.fadeIn(.45)));
                        _time += .05;
                    }
                }
                break;
            }
        }
    },

    clearHandOncard: function () {
        for (var i = 0; i < this._handOnCards.length; i++) {
            this._handOnCards[i].removeFromParent(true);
        }
        this._handOnCards = [];
    },

    addThang: function (delayTime, samthanhcong)            // Them effect thang'
    {
        var sprite1 = new cc.Sprite("GameGUI/new/effc_0021_Layer-13-copy-7.png");
        var time = .5;
        if (delayTime && isNaN(delayTime))
            time = delayTime;
        this.mask.addChild(sprite1);
        sprite1.setTag(123);

        var size = this.mask.getContentSize();
        sprite1.setPosition(size.width / 2, size.height / 2);

        if (this._index == 0) {
            if (samthanhcong)
                var sprite2 = new cc.Sprite("GameGUI/new/samt_0003_S-m-th-nh-c-ng.png");
            else
                var sprite2 = new cc.Sprite("GameGUI/new/effc_0020_Layer-25.png");
            this._gameScene._effect2D.addChild(sprite2);
            sprite2.setTag(124);
            sprite2.setPosition(cc.winSize.width / 2, 40);
            sprite2.setOpacity(0);
            sprite2.setScale(3);
            sprite2.setVisible(false);
            sprite2.runAction(cc.sequence(cc.delayTime(time), cc.show(), cc.spawn(cc.fadeIn(.5), new cc.EaseBounceOut(cc.scaleTo(.5, .9))), cc.callFunc(function () {
                var forever = cc.repeatForever(cc.sequence(cc.scaleTo(.35, .93), cc.scaleTo(.35, .9)));
                this.runAction(forever);
            }.bind(sprite2))));
        }
    },

    addThua: function (delayTime) {
        var sprite1 = new cc.Sprite("GameGUI/new/effc_0015_Layer-13-copy-7.png");
        this.mask.addChild(sprite1);
        sprite1.setTag(123);
        var size = this.mask.getContentSize();
        sprite1.setPosition(size.width / 2, size.height / 2);

        var time = .5;
        if (delayTime)
            time = delayTime;

        if (this._index == 0) {
            var sprite2 = new cc.Sprite("GameGUI/new/effc_0029_Layer-24.png");
            this._gameScene._effect2D.addChild(sprite2);
            sprite2.setTag(124);
            sprite2.setPosition(cc.winSize.width / 2, 40);
            sprite2.setOpacity(0);
            sprite2.setScale(3);
            sprite2.setVisible(false);
            sprite2.runAction(cc.sequence(cc.delayTime(time), cc.show(), cc.spawn(cc.fadeIn(.5), new cc.EaseBounceOut(cc.scaleTo(.5, .9))), cc.callFunc(function () {
                var forever = cc.repeatForever(cc.sequence(cc.scaleTo(.35, .93), cc.scaleTo(.35, .9)));
                this.runAction(forever);
            }.bind(sprite2))));
        }
    },

    clearThangThua: function () {
        if (this.mask.getChildByTag(123)) {
            this.mask.getChildByTag(123).stopAllActions();
            this.mask.getChildByTag(123).removeFromParent(true);
        }
        if (this._gameScene._effect2D.getChildByTag(124)) {
            this._gameScene._effect2D.getChildByTag(124).stopAllActions();
            this._gameScene._effect2D.getChildByTag(124).removeFromParent(true);
        }

        this._levelResult = null;
    },

    addBao1: function () {
        if (!this._card) return;

        this.baoOne.stopAllActions();
        this.baoOne.setVisible(true);
        this.baoOne.setOpacity(0);
        this.baoOne.setPosition(cc.p(this.baoOne.orgPos.x, this.baoOne.orgPos.y + 20));
        this.baoOne.runAction(cc.spawn(
            cc.moveTo(0.5, this.baoOne.orgPos).easing(cc.easeBounceOut()),
            cc.fadeIn(0.25)
        ));
        this.baoOne.eff.setAnimation(1, "animation10", -1);
    },

    removeBao1: function () {
        if (!this._card) return;

        this.baoOne.stopAllActions();
        this.baoOne.setVisible(false);
    },

    boluot: function () {
        this.clearBao();

        this.passPanel.stopAllActions();
        this.passPanel.setOpacity(0);
        this.passPanel.setScale(1);
        this.passPanel.setVisible(true);
        this.passPanel.runAction(cc.fadeIn(0.1));

        var delayTime = 1;
        this.passPanel.pass.stopAllActions();
        this.passPanel.pass.setScale(1.5);
        this.passPanel.pass.setOpacity(255);
        this.passPanel.pass.runAction(cc.sequence(
            cc.scaleTo(0.25, 1).easing(cc.easeIn(5)),
            cc.delayTime(delayTime),
            cc.spawn(
                cc.scaleTo(0.25, this.sSmall).easing(cc.easeIn(5)),
                cc.fadeOut(0.25)
            )
        ));

        this.passPanel.passClear.stopAllActions();
        this.passPanel.passClear.setVisible(false);
        this.passPanel.passClear.setScale(this.sBig);
        this.passPanel.passClear.runAction(cc.sequence(
            cc.delayTime(0.25 + delayTime),
            cc.show(),
            cc.scaleTo(0.25, 1).easing(cc.easeIn(5))
        ));
    },

    clearBoluot: function () {
        this.passPanel.runAction(cc.sequence(
            cc.delayTime(1),
            cc.scaleTo(0.25, 0).easing(cc.easeBackIn())
        ));
    },

    bao: function () {
        this.baoPanel.stopAllActions();
        this.baoPanel.setOpacity(0);
        this.baoPanel.setScale(1);
        this.baoPanel.setVisible(true);
        this.baoPanel.runAction(cc.fadeIn(0.1));

        this.baoPanel.bao.stopAllActions();
        this.baoPanel.bao.setScale(1.5);
        this.baoPanel.bao.setOpacity(255);
        this.baoPanel.bao.setVisible(true);
        this.baoPanel.bao.runAction(cc.scaleTo(0.25, 1).easing(cc.easeIn(5)));

        this.baoPanel.baoCancel.stopAllActions();
        this.baoPanel.baoCancel.setVisible(false);
        this.baoPanel.baoCancelClear.stopAllActions();
        this.baoPanel.baoCancelClear.setVisible(false);
    },

    baoCancel: function () {
        this.baoPanel.stopAllActions();
        this.baoPanel.setOpacity(0);
        this.baoPanel.setScale(1);
        this.baoPanel.setVisible(true);
        this.baoPanel.runAction(cc.fadeIn(0.1));

        this.baoPanel.baoCancel.stopAllActions();
        this.baoPanel.baoCancel.setScale(1.5);
        this.baoPanel.baoCancel.setVisible(true);
        this.baoPanel.baoCancel.runAction(cc.scaleTo(0.25, 1).easing(cc.easeIn(5)));

        this.baoPanel.bao.stopAllActions();
        this.baoPanel.bao.setVisible(false);
        this.baoPanel.baoCancelClear.stopAllActions();
        this.baoPanel.baoCancelClear.setVisible(false);
    },

    baoNormalize: function () {
        this.baoPanel.stopAllActions();
        this.baoPanel.setOpacity(255);
        this.baoPanel.setScale(1);

        this.baoPanel.bao.stopAllActions();
        this.baoPanel.bao.setScale(1);
        this.baoPanel.bao.setOpacity(255);
        this.baoPanel.bao.setVisible(true);
    },

    baoCancelNormalize: function () {
        this.baoPanel.stopAllActions();
        this.baoPanel.setOpacity(255);
        this.baoPanel.setScale(1);

        this.baoPanel.bao.stopAllActions();
        this.baoPanel.bao.setScale(1);
        this.baoPanel.bao.runAction(cc.fadeOut(0.25));

        this.baoPanel.baoCancel.stopAllActions();
        this.baoPanel.baoCancel.setScale(1);
        this.baoPanel.baoCancel.setOpacity(255);
        this.baoPanel.baoCancel.runAction(cc.spawn(
            cc.scaleTo(0.25, this.sSmall).easing(cc.easeIn(5)),
            cc.fadeOut(0.25)
        ));

        this.baoPanel.baoCancelClear.stopAllActions();
        this.baoPanel.baoCancelClear.setVisible(true);
        this.baoPanel.baoCancelClear.setScale(this.sBig);
        this.baoPanel.baoCancelClear.runAction(cc.scaleTo(0.25, 1).easing(cc.easeIn(5)));
    },

    clearBao: function () {
        this.baoPanel.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.scaleTo(0.25, 0).easing(cc.easeBackIn())
        ));
    },

    chatEmotion: function (idx) {
        var pos = this._uiAvatar.getPosition();
        ChatPlayer.showChatEmotion(idx, this._panel, pos);
    },
    addSmile: function () {
        var pos = this._uiAvatar.getPosition();
        // old add Smile
        var path = "icon/";
        var rd = Math.floor(Math.random() * 10 + 1);
        if (rd >= 10) rd = 10;
        path += (rd + ".png");

        var bg = new cc.Sprite("icon/bg.png");
        bg.setLocalZOrder(3);
        bg.setOpacity(0);
        bg.setPosition(pos);
        bg.runAction(cc.sequence(cc.fadeIn(.5), cc.delayTime(3), cc.fadeOut(.5), cc.removeSelf()));
        this._panel.addChild(bg);

        bg = new cc.Sprite(path);
        bg.setLocalZOrder(4);
        bg.setPosition(pos);
        bg.setScale(0);
        bg.runAction(cc.sequence(cc.scaleTo(.35, 1.45), cc.scaleTo(.2, 1), cc.delayTime(3.25), cc.removeSelf()));
        this._panel.addChild(bg);

        // new add smile
        //var rd = Math.floor(Math.random() * 10 + 1);if(rd>=10)rd = 10;
    },

    chatMessage: function (msg) {
        switch (this._index) {
            case 0: {
                ChatPlayer.showChatMessage(msg, ChatInGameGUI.BOT_LEFT, this._panel, cc.p(50, 100));
                break;
            }
            case 4: {
                ChatPlayer.showChatMessage(msg, ChatInGameGUI.BOT_LEFT, this._panel, cc.p(70, 70));
                break;
            }
            case 3: {
                ChatPlayer.showChatMessage(msg, ChatInGameGUI.TOP_LEFT, this._panel, cc.p(70, 40));
                break;
            }
            case 2: {
                ChatPlayer.showChatMessage(msg, ChatInGameGUI.TOP_RIGHT, this._panel, cc.p(115, 40));
                break;
            }
            default : {
                ChatPlayer.showChatMessage(msg, ChatInGameGUI.BOT_RIGHT, this._panel, cc.p(115, 70));
                break;
            }
        }

    },
    addTmpAvatar: function () {
        //this._avatarTmp = engine.UIAvatar.create("avatar/ava3.png");
        //this._panel.addChild(this._avatarTmp);
        //this._avatarTmp.setPosition(this._uiAvatar.getPosition());
        //this._avatarTmp.asyncExecuteWithUrl(this.uID,this.avatarURL);
        //this._avatarTmp.setLocalZOrder(2);
        //this._uiAvatar.setVisible(false);
    },
    clearTmpAvatar: function () {
        //if(this._avatarTmp)
        //{
        //    this._avatarTmp.removeFromParent(true);
        //    this._uiAvatar.setVisible(true);
        //    this._avatarTmp = null;
        //}
    },

    addIncreaseMoney: function (gold, delay = 0) {
        this.resultWin.stopAllActions();
        this.resultWin.setVisible(true);
        this.resultWin.setOpacity(255);
        this.resultWin.lbGold.setVisible(true);
        this.resultWin.label.setVisible(false);
        this.resultWin.fox.setVisible(false);

        this.addResultLabelEffect(
            this.resultWin.lbGold,
            cc.p(this.resultWin.lbGoldPos.x + 50, this.resultWin.lbGoldPos.y),
            "+" + this.convertGoldString(Math.abs(gold)),
            0.25,
            delay
        );

        var timeStay = 2;
        this.removeResult(timeStay + delay);
    },

    addDecreaseMoney: function (gold, delay = 0) {
        this.resultLose.stopAllActions();
        this.resultLose.setVisible(true);
        this.resultLose.setOpacity(255);
        this.resultLose.width = 0;
        this.resultLose.lbGold.setVisible(true);
        this.resultLose.pCards.setVisible(false);
        this.resultLose.label.setVisible(false);
        this.resultLose.stamp.setVisible(false);

        this.addResultLabelEffect(
            this.resultLose.lbGold,
            cc.p(this.resultWin.lbGoldPos.x + 50, this.resultWin.lbGoldPos.y),
            "-" + this.convertGoldString(Math.abs(gold)),
            0.25,
            delay
        );

        var timeStay = 2;
        this.removeResult(timeStay + delay);
    },

    addLevelExp: function (delayTime = 0) {
        if (this._index !== 0) {
            return;
        }

        var update = this._levelResult;
        if (!update) return;
        var levelExpAdd = update.newLevelExp - update.oldLevelExp;
        cc.log("LEVEL UP EXP", levelExpAdd);
        if (levelExpAdd > 0) {
            this.addResultLabelEffect(
                this.lbExp,
                this.lbExp.orgPos,
                "+" + StringUtility.standartNumber(levelExpAdd) + "exp",
                0.25,
                delayTime
            );

            cc.log("LEVEL UP EXP", update.newLevel - update.oldLevel);

            this.lbExp.runAction(cc.sequence(
                cc.delayTime(delayTime + 1.75),
                cc.fadeOut(0.25)
            ));

            if (update.newLevel > update.oldLevel) {
                this.lbExp.runAction(cc.sequence(
                    cc.delayTime(delayTime + 2),
                    cc.callFunc(function () {
                        this.addResultLabelEffect(
                            this.lbExp,
                            this.lbExp.orgPos,
                            "LEVEL UP",
                            0.25,
                            0
                        );
                    }.bind(this)),
                    cc.delayTime(1.75),
                    cc.fadeOut(0.25)
                ));
            }
        }
    },

    addResultLose: function (gold, cardsID, type, delay) {
        cardsID.sort(function(a, b) {
            return a - b;
        });

        var delayTime = delay? 3 : 0;

        var orgWidth = 423;
        var smallWidth = 130;
        var minWidth = 260;
        var oneCardWidth = 174;
        var scaleTime = 0.25;
        var isThoi = [];

        this.resultLose.stamp.stopAllActions();
        this.resultLose.stamp.setVisible(true);
        this.resultLose.stamp.setScaleX(0);
        this.resultLose.stamp.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.delayTime(scaleTime),
            cc.scaleTo(scaleTime * this.resultLose.stamp.width / smallWidth, 1)
        ));
        switch (type) {
            case GameLayer.END_TYPE_LOSE:
                var fourOfAKind = GameHelper.kiemtraThoiTuQuy(cardsID);
                var havePig = GameHelper.kiemtraThoiHeo(cardsID);

                if (fourOfAKind || havePig) {
                    for (var i = 0; i < cardsID.length; i++) {
                        if (Math.floor(cardsID[i] / 4) === Card.kQuanbai_2) {
                            isThoi.push(true);
                        } else if (i < cardsID.length - 3) {
                            if (Math.floor(cardsID[i] / 4) === Math.floor(cardsID[i + 3] / 4)) {
                                for (var j = 0; j < 4; j++) {
                                    isThoi.push(true);
                                }
                                i = i + j - 1;
                            } else isThoi.push(false);
                        } else {
                            isThoi.push(false);
                        }
                    }

                    if (fourOfAKind && havePig)
                        this.resultLose.lbStamp.setString("Thối");
                    else if (fourOfAKind)
                        this.resultLose.lbStamp.setString("Thối Tứ Quý");
                    else
                        this.resultLose.lbStamp.setString("Thối Heo");
                } else {
                    this.resultLose.stamp.setVisible(false);
                }
                break;
            case GameLayer.END_TYPE_LOSE_DEN_BAO:
                this.resultLose.lbStamp.setString("Đền Báo");
                break;
            case GameLayer.END_TYPE_LOSE_TREO:
                this.resultLose.lbStamp.setString("Treo");
                break;
            case GameLayer.END_TYPE_LOSE_TOI_TRANG:
                this.resultLose.lbStamp.setString("Tới trắng");
                break;
            case GameLayer.END_TYPE_LOSE_SAM_BLOCK:
                this.resultLose.lbStamp.setString("Bị Chặn Sâm");
                break;
            case GameLayer.END_TYPE_DRAW:
                this.resultLose.lbStamp.setString("Hòa");
                break;
        }

        var finalWidth = oneCardWidth + (cardsID.length - 1) * ((orgWidth - oneCardWidth) / (this.resultLose.cards.length - 1));
        if (this.resultLose.stamp.isVisible()) finalWidth = Math.max(minWidth, finalWidth);

        this._card.setVisible(false);

        this.resultLose.stopAllActions();
        this.resultLose.setVisible(true);
        this.resultLose.setOpacity(255);
        this.resultLose.setContentSize(cc.size(smallWidth, 89));
        this.resultLose.setScale(0);
        this.resultLose.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.scaleTo(scaleTime, -1, 1).easing(cc.easeIn(2.5)),
            cc.sequence(
                cc.delayTime((scaleTime / smallWidth) / 2),
                cc.callFunc(function () {
                    this.resultLose.width = this.resultLose.width + 1;
                }.bind(this))
            ).repeat(finalWidth - smallWidth)
        ));

        var cardDelay = 0.1;
        var cardScaleTime = 0.15;
        this.resultLose.pCards.setVisible(true);
        var isSwap = this.isSwapped();
        for (var i = 0; i < this.resultLose.cards.length; i++) {
            var theCard = this.resultLose.cards[isSwap? this.resultLose.cards.length - i - 1: i];
            theCard.stopAllActions();
            if (i < cardsID.length) {
                theCard.setOpacity(0);
                theCard.setVisible(true);
                theCard.setColor(isThoi[i]?
                    cc.color(
                        130 + 75 * (cardsID[i] % 4 / 4),
                        100 + 75 * (cardsID[i] % 4 / 4),
                        170 + 75 * (cardsID[i] % 4 / 4)
                    ) :  cc.WHITE
                );
                theCard.loadTexture(SamCard.getCardResource(cardsID[i], true));
                theCard.runAction(cc.sequence(
                    cc.delayTime(delayTime),
                    cc.delayTime(scaleTime + cardDelay * i),
                    cc.fadeIn(cardScaleTime)
                ));
            } else {
                theCard.setVisible(false);
            }
        }

        this.addResultLabelEffect(
            this.resultLose.lbGold,
            this.resultLose.lbGoldPos,
            "-" + this.convertGoldString(Math.abs(gold)),
            scaleTime,
            scaleTime + cardDelay * cardsID.length + cardScaleTime + delayTime
        );
        this.addLevelExp(scaleTime + cardDelay * cardsID.length + cardScaleTime + delayTime + 1);
    },

    addResultWin: function (gold, cardsID, type, delay) {
        var delayTime = delay? 3 : 0;

        this._card.setVisible(false);

        this.resultWin.stopAllActions();
        this.resultWin.setVisible(true);
        this.resultWin.setOpacity(255);

        var scaleTime = 0.25;
        this.resultWin.eff.stopAllActions();
        this.resultWin.eff.setVisible(false);
        this.resultWin.eff.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.show(),
            cc.callFunc(function () {
                this.resultWin.eff.setAnimation(0, "action", 0);
            }.bind(this)),
            cc.delayTime(this.resultWin.eff.getDuration("action")),
            cc.callFunc(function () {
                this.resultWin.eff.setAnimation(0, "idle", -1);
            }.bind(this))
        ));

        this.resultWin.fox.stopAllActions();
        this.resultWin.fox.setVisible(false);
        this.resultWin.fox.runAction(cc.sequence(
            cc.delayTime(scaleTime * 2 + delayTime),
            cc.show(),
            cc.callFunc(function () {
                this.resultWin.fox.setAnimation(0, "fox_win_action", 0);
            }.bind(this)),
            cc.delayTime(this.resultWin.fox.getDuration("fox_win_action")),
            cc.callFunc(function () {
                this.resultWin.fox.setAnimation(0, "fox_win_idle", -1);
            }.bind(this))
        ));

        this.addResultLabelEffect(
            this.resultWin.lbGold,
            this.resultWin.lbGoldPos,
            "+" + this.convertGoldString(Math.abs(gold)),
            scaleTime,
            scaleTime * 2 + delayTime
        );
        this.addLevelExp(scaleTime * 2 + delayTime + 1);
    },

    addGotSamBlock: function () {
        if (this._index === 0) {
            this._gameScene._effect2D.addBigResult("angry", "angry");
            return;
        }
    },

    removeResult: function (delay = 0) {
        var resultPanel = [];
        resultPanel.push(this.resultWin);
        resultPanel.push(this.resultLose);
        resultPanel.push(this._gameScene._effect2D.getChildByTag(LayerEffect2D.SAM_EFFECT_TAG));
        resultPanel.push(this.lbExp);

        for (var i = 0; i < resultPanel.length; i++) {
            if (resultPanel[i]) {
                resultPanel[i].runAction(cc.sequence(
                    cc.delayTime(delay),
                    cc.fadeOut(0.25),
                    cc.hide()
                ));
            }
        }
    },

    addResultLabelEffect: function (label, orgPos, string, scaleTime, delayTime) {
        var deltaY = 50;
        label.setOpacity(0);
        label.setLocalZOrder(-1);
        label.setVisible(true);
        label.setString(string);
        label.setPosition(cc.p(orgPos.x, orgPos.y - deltaY));
        label.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.fadeIn(scaleTime),
                cc.moveTo(scaleTime, orgPos).easing(cc.easeOut(2.5))
            )
        ));
    },

    useEmoticon: function (id, emoId) {
        var emo = StorageManager.getEmoticonForPlay(id, emoId);
        var duration = emo.playAnimation(1, 2);
        emo.setPosition(this._uiAvatar.getPosition());
        var scale = StorageManager.getEmoticonScale(id) * 0.75;
        this._panel.addChild(emo, 99);
        emo.setOpacity(100);
        emo.setScale(scale * 0.5);
        emo.runAction(cc.sequence(
            cc.spawn(
                cc.fadeTo(0.2, 255),
                cc.scaleTo(0.2, scale).easing(cc.easeBackOut())
            ),
            cc.delayTime(duration - 0.4),
            cc.spawn(
                cc.fadeTo(0.2, 100),
                cc.scaleTo(0.2, scale * 0.5).easing(cc.easeBackIn())
            ),
            cc.removeSelf()
        ));
    },

    setAvatarFrame: function (path) {
        if (path === undefined || path == "") {
            this.avatarFrame.setTexture(null);
            this.avatarFrame.setVisible(false);
            this.orgFrame.setVisible(true);
        } else {
            this.avatarFrame.setTexture(path);
            this.avatarFrame.setVisible(true);
            this.orgFrame.setVisible(false);
        }
    },

    getPlayerWorldPosition: function () {
        return this.mask.getParent().convertToWorldSpace(this.mask.getPosition());
    },

    getAvatarPosition: function(){
        return this._panel.convertToWorldSpace(this._uiAvatar.getPosition());
    }
});
PlayerView.FIRE_COUNT_TAG = 111;
PlayerView.VIP_PARTICLE = [
    cc.color("#ffffff"),
    cc.color("#a07e7e"),
    cc.color("#b3b3b3"),
    cc.color("#bf9a5d"),
    cc.color("#ff6acd"),
    cc.color("#638fff"),
    cc.color("#ffa480"),
    cc.color("#68ff8a"),
    cc.color("#ffc163"),
    cc.color("#ae51ec"),
    cc.color("#ec4749")
];

PlayerView.createNodeMoney = function (money) {
    var node = new cc.Node();
    var str = "" + Math.abs(money);
    var thang = (money >= 0);
    var width = 0;
    var height = 0;

    var ret = new cc.Sprite(PlayerView.getNumberPath(thang, -2));
    width += ret.getContentSize().width;
    var fix = 0;
    node.addChild(ret);
    for (var i = 0; i < str.length; i++) {
        var xx = ret.getPositionX() + ret.getContentSize().width + fix;
        fix = 0;
        ret = new cc.Sprite(PlayerView.getNumberPath(thang, parseInt(str[i])));
        ret.setPositionX(xx);
        node.addChild(ret);
        width += ret.getContentSize().width;
        height = ret.getContentSize().height;


        if ((i < str.length - 1) && ((str.length - 1 - i) % 3 == 0)) {
            xx = ret.getPositionX() + ret.getContentSize().width;
            ret = new cc.Sprite(PlayerView.getNumberPath(thang, -1));
            ret.setPosition(xx - 7, -9);
            node.addChild(ret);
            fix = 4;
            width += ret.getContentSize().width;
        }
    }
    node.setContentSize(cc.size(width, height));
    node.setAnchorPoint(cc.p(.5, .5));

    return node;
};

PlayerView.getNumberPath = function (thang, number) {
    var path = "common/";
    if (thang)
        path += "bosothang/";
    else
        path += "bosothua/";
    if (number == -1)
        path += "dot";
    else if (number == -2) {
        if (thang)
            path += "cong";
        else
            path += "tru";
    } else {
        path += ("so" + number);
    }
    path += ".png";
    return path;
};

var MyView = PlayerView.extend({
    addResultWin: function (gold, cardsID, type, delayTime = 3) {
        this.addEffectResult(this.resultWin, "+" + this.convertGoldString(Math.abs(gold)), delayTime);
        this.addLevelExp(delayTime + 1);
        this.resultWin.label.setVisible(true);
        this.resultWin.eff.setAnimation(1, "idle", -1);

        gameSound.playThang();
        switch (type) {
            case GameLayer.END_TYPE_WIN_SAM:
                this._gameScene._effect2D.addBigResult("win_action", "win_idle");
                break;
            case GameLayer.END_TYPE_DRAW:
                break;
            case GameLayer.END_TYPE_WIN_FLUSH:
            case GameLayer.END_TYPE_WIN_SAM_DINH:
            case GameLayer.END_TYPE_WIN_FOUR_PIG:
            case GameLayer.END_TYPE_WIN_FIVE_PAIR:
                this._gameScene._effect2D.effectToiTrang(
                    this.danhbai(this._gameScene.winToiTrang.cardID),
                    type,
                    true
                );
                break;
            default:
                this._gameScene._effect2D.addBigResult("fox_win_action", "fox_win_idle");
                break;
        }
    },

    addResultLose: function (gold, cardsID, type, delayTime = 3) {
        this.addEffectResult(this.resultLose, "-" + this.convertGoldString(Math.abs(gold)), delayTime);
        this.addLevelExp(delayTime + 1);
        this.resultLose.label.setVisible(true);

        gameSound.playThua();
        switch (type) {
            case GameLayer.END_TYPE_LOSE_SAM_BLOCK:
                this._gameScene._effect2D.addBigResult("lose_action", "lose_idle");
                break;
            case GameLayer.END_TYPE_LOSE_TOI_TRANG:
                this._gameScene._effect2D.effectToiTrang(
                    this._gameScene._players[this._gameScene.winToiTrang.pos].danhbai(this._gameScene.winToiTrang.cardID),
                    this._gameScene.winToiTrang.type,
                    false
                );
                break;
            default:
                this._gameScene._effect2D.addBigResult("fox_lose_action", "fox_lose_idle");
                break;
        }
    },

    addIncreaseMoney: function (gold, delay = 0) {
        this.addEffectResult(this.resultWin, "+" + this.convertGoldString(Math.abs(gold)), delay);
        this.resultWin.label.setVisible(false);
        this.resultWin.eff.setAnimation(1, "idle", -1);
    },

    addDecreaseMoney: function (gold, delay = 0) {
        this.addEffectResult(this.resultLose, "-" + this.convertGoldString(Math.abs(gold)), delay);
        this.resultLose.label.setVisible(false);
        this.resultWin.eff.setAnimation(1, "idle", -1);
    },

    addEffectResult: function (pResult, string, delayTime) {
        pResult.stopAllActions();
        pResult.setVisible(true);
        pResult.setOpacity(0);
        pResult.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.fadeIn(0.5)
        ));
        pResult.lbGold.setString(string);
    }
});