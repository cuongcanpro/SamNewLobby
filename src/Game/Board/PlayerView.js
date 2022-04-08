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

        // infomation of player
        this._uiAvatar = null;               // avatar for player
        this.uID = "";
        this._avatarTmp = null;               // avatar fix share image
        this._uiName = null;                  // name for player
        this._uiGold = null;                  // gold
        this._uiTimer = null;                 // timer progress
        this._type = 1;                       // 1-> enemy
        this._sortedCards = kSort_Unknown;

        this._gameScene = gameScene;

        this._levelResult = null;
    },

    setPanel: function (panel) {
        this._panel = panel;
        this._panel.setAnchorPoint(cc.p(0.5, 0.5));
        this._panel.x += (this._panel.x < cc.winSize.width * 0.5? 1 : -1) * this._panel.width / 2;
        this._panel.y += this._panel.height / 2;
        this._panel.defaultPos = this._panel.getPosition();

        var mask = panel.getChildByName("mask");
        this.mask = mask;
        this.mask.setLocalZOrder(2);

        var avatar = new AvatarUI("Common/defaultAvatar_ingame.png", "GameGUI/player/bgAvatar.png", "");
        mask.addChild(avatar);
        avatar.setPosition(cc.p(this.mask.width / 2, this.mask.height / 2));
        avatar.setLocalZOrder(-1);
        avatar.setScale(1.05);
        this._uiAvatar = avatar;
        this._gameScene.logForIOS("DONE AVATAR");

        this.avatarFrame = mask.getChildByName("frame");
        this.avatarFrame.setLocalZOrder(0);
        this.orgFrame = mask.getChildByName("orgFrame");
        this.orgFrame.setLocalZOrder(0);

        this.view = mask.getChildByName("view");

        this._bg = panel.getChildByName("bg");
        this._bg.defaultPos = this._bg.getPosition();
        this._uiName = ccui.Helper.seekWidgetByName(panel, "name");
        this._uiName.defaultPos = this._uiName.getPosition();
        this._uiGold = ccui.Helper.seekWidgetByName(panel, "gold");
        this._uiGold.defaultPos = this._uiGold.getPosition();
        this._uiRank = ccui.Helper.seekWidgetByName(panel, "rank");
        this._uiRank.defaultPos = this._uiRank.getPosition();
        this._uiRank.ignoreContentAdaptWithSize(true);

        var vip = panel.getChildByName("vip");
        vip.ignoreContentAdaptWithSize(true);
        vip.y = this._uiName.y;
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
        this._gameScene.logForIOS("DONE VIP");

        this.timer = panel.getChildByName("timer");
        this.timer.orgPos = this.timer.getPosition();
        this.timerLabel = this.timer.getChildByName("label");
        this.timer.setVisible(false);

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
        this.baoPanel.orgPos = this.baoPanel.bao.getPosition();
        this.baoPanel.pos = this.baoPanel.getPosition();
        this.baoPanelEfx = [];

        this.pEmo = ccui.Helper.seekWidgetByName(panel, "pEmo");
        this.pDeco = this.pEmo;

        this.lbExp = panel.getChildByName("lbExp");
        this.lbExp.orgPos = this.lbExp.getPosition();
        this.lbExp.setVisible(false);

        this._card = panel.getChildByName("card");
        this.baoOne = panel.getChildByName("baoOne");
        this.baoOne.setVisible(true);
        this.baoOne.orgPos = this.baoOne.getPosition();

        this.darken = this.mask.getChildByName("darken");
        this.darken.setVisible(false);
        this.auto = this.mask.getChildByName("auto");
        this.auto.eyes0 = this.auto.getChildByName("eyes0");
        this.auto.eyes1 = this.auto.getChildByName("eyes1");
        this.auto.setVisible(false);

        this.vipEfx = false;

        dispatcherMgr.addListener(RankData.EVENT_RECEIVED_DATA, this, this.onReceivedRankData);
    },

    initResult: function () {
        cc.log("INITING RESULT", this._index);
        var position = this._panel.getChildByName("result");
        this.result = ccs.load("GameGUIPlayerResult.json").node;
        this.result.setPosition(position.getPosition());
        this.result.setScaleX(-1);
        this._panel.addChild(this.result);
        this.resultLose = this.result.getChildByName("bgLose");
        this.resultLose.label = this.resultLose.getChildByName("label");
        this.resultLose.labelToiTrang = this.resultLose.getChildByName("labelToiTrang");
        this.resultLose.lbGold = this.resultLose.getChildByName("lbGold");
        this.resultLose.lbGoldPos = this.resultLose.lbGold.getPosition();
        this.resultLose.lbGoldToiTrang = this.resultLose.getChildByName("lbGoldToiTrang");
        this.resultLose.lbGoldToiTrangPos = this.resultLose.lbGoldToiTrang.getPosition();
        this.resultLose.pCards = this.resultLose.getChildByName("cards");
        this.resultLose.cards = [];
        for (var i = 0; i < 10; i++)
            this.resultLose.cards.push(this.resultLose.pCards.getChildByName("card_" + i));
        this.resultLose.stamp = this.resultLose.getChildByName("stamp");
        this.resultLose.lbStamp = this.resultLose.stamp.getChildByName("label");

        this.resultWin = this.result.getChildByName("bgWin");
        this.resultWin.label = this.resultWin.getChildByName("label");
        this.resultWin.lbGold = this.resultWin.getChildByName("lbGold");
        this.resultWin.lbGoldPos = this.resultWin.lbGold.getPosition();

        this.resultWin.setVisible(false);
        this.resultLose.setVisible(false);

        if (this.isSwapped()) {
            this.swapResultGUI();
        }
    },

    initEffectResultBlock: function () {
        if (!this.result) {
            this.initResult();
        }

        this.resultBlock = new CustomSkeleton("Animation/resultSam", "skeleton");
        this.resultBlock.setScale(0.45);
        this.resultBlock.setScaleX(-0.45);
        this.resultBlock.setPosition(cc.p(-165, 0));
        this.resultBlock.setLocalZOrder(-1);
        this.result.addChild(this.resultBlock);

        this.resultBlock.setVisible(false);
    },

    initEffectResultWin: function () {
        this.resultWin.eff = new CustomSkeleton("Animation/win", "skeleton");
        this.resultWin.eff.setScale(0.7);
        this.resultWin.eff.setPosition(cc.p(this.resultWin.label.width / 2, this.resultWin.label.height / 2));
        this.resultWin.label.addChild(this.resultWin.eff);

        this.resultWin.fox = new CustomSkeleton("Animation/resultSam", "skeleton");
        this.resultWin.fox.setScale(0.45);
        this.resultWin.fox.setPosition(cc.p(this.resultWin.label.x + this.resultWin.label.width, this.resultWin.label.y - 25));
        this.resultWin.fox.setLocalZOrder(-1);
        this.resultWin.addChild(this.resultWin.fox);
    },

    swapSide: function (control) {
        control.setPositionX(- control.getPositionX() + this._bg.width);
        control.orgPos = control.getPosition();
    },

    swapResultGUI: function () {
        this.result.setScaleX(- this.result.getScaleX());

        this.resultLose.label.setScaleX(-1);
        this.resultLose.labelToiTrang.setScaleX(-1);
        this.resultLose.pCards.setScaleX(-1);
        this.resultLose.lbStamp.setScaleX(-1);

        this.swapLabel(this.resultLose.lbGold);
        this.swapLabel(this.resultLose.lbGoldToiTrang);

        this.resultWin.label.setScaleX(-1);
        this.swapLabel(this.resultWin.lbGold);
    },

    swapLabel: function (lb) {
        var posX = lb.getPositionX();
        lb.setScaleX(-1);
        lb.setAnchorPoint(cc.p(1, 0.5));
        lb.setPositionX(posX);
    },

    swapBaoGUI: function () {
        this.baoPanel.setScaleX(-1);
        this.baoPanel.bao.getChildByName("lb").setScaleX(1);
        this.baoPanel.baoCancel.getChildByName("lb").setScaleX(1);
    },

    isSwapped: function () {
        return (this._index === 1 || this._index === 2);
    },

    resetAction: function () {
        this.removeResult(0, true);
        this.removeBao1();
        this.isBao = false;
        this.clearBao(false, true);
        this.clearBoluot();
        this.stopEffectTime();
        this.clearSmile();
        this.autoing();
        this._cardFirstTurn.setVisible(false);
        this.pLevel.setVisible(false);
    },

    initWithScene: function (gameScene, index) {
        this._numCard = ccui.Helper.seekWidgetByName(this._card, "num");
        this._type = Player.ENEMY;
        this._index = index;

        if (this.isSwapped()) {
            this.swapSide(this._card);
            this.vip.setAnchorPoint(cc.p(0, 0.5));
            this.swapSide(this.vip);
            this.swapSide(this.vip2);
            this.swapSide(this.passPanel);
            this.swapSide(this.timer);
            this.swapSide(this.baoOne);
            this.swapBaoGUI();
        }
        this._gameScene.logForIOS("DONE SWAP");

        this._cardFirstTurn = new cc.Sprite(SamCard.getCardResource(52, true));
        this._cardFirstTurn.setPosition(this._card.getPosition());
        this._cardFirstTurn.setVisible(false);
        this._panel.addChild(this._cardFirstTurn);

        this.pLevel = this._panel.getChildByName("pLevel");
        this.pLevel.removeAllChildren();
        this._gameScene.logForIOS("DONE initWithScene");
    },

    _chooseCard: null,
    _cardMoveTo: null,
    _firstOrEnd: false,
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

    updateWithPlayer: function (player) {
        if (!player._ingame) {
            if (!this.isLeaving) this.setVisible(false);
            return;
        }
        if (!player._active) {
            return;
        }

        this._panel.setPosition(this._panel.defaultPos);
        this._panel.setScale(1);
        try {
            this._panel.setRotation3D(vec3(0, 0, 0));
        } catch (e) {
            this._panel.setRotation(0);
        }

        this.info = player._info;
        this.setVisible(true);

        if (Config.ENABLE_CHEAT && player._info["uName"].indexOf("bot_") !== -1) {
            var nameArr = ["Hoàng Ngọc", "Tuấn Anh", "Hùng Hưng", "Linh Linh", "Châu Ngọc", ""];
            this._uiName.setString(StringUtility.subStringTextLength(nameArr[this._index], 10));
            var avatArr = ["avatar_1.png", "avatar_2.png", "avatar_3.png", "avatar_4.png", "avatar_5.png", "avatar_6.png"];
            this._uiAvatar.asyncExecuteWithUrl(
                player._info["uID"],
                "https://static.service.zingplay.com/tienlen/avatar/" + avatArr[this._index]
            );
        } else {
            this._uiName.setString(StringUtility.subStringTextLength(player._info["uName"], 10));
            this._uiAvatar.asyncExecuteWithUrl(player._info["uID"], player._info["avatar"]);
        }

        this.uID = player._info["uID"];
        this._uiGold.setString(this.convertGoldString(player._info["bean"]) + "$");
        cc.log("DU MA ** " + player._info["bean"]);
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
        }

        if (player._info["uID"] === userMgr.getUID()) {
            var state = (VipManager.getInstance().getRemainTime() > 0) ? 0 : 1;
            this.vip.setState(state);
        }
        this.addVipEffect();

        if (player._info["uID"] === userMgr.getUID()) {
            if (RankData.getInstance().getCurRankInfo()) {
                this.updateWithRank(RankData.getInstance().getCurRankInfo().rank);
            } else {
                this.updateWithRank();
            }
        } else {
            this.updateWithRank();
            var otherInfo = new CmdSendGetOtherRankInfo();
            otherInfo.putData(player._info["uID"]);
            GameClient.getInstance().sendPacket(otherInfo);
            otherInfo.clean();
        }

        if (player._status === 1)     // dang xem
        {
            this.viewing(true);
            if (this._index !== 0) this._card.setVisible(false);
        } else if (player._status === 0) {
            this.setVisible(false);
            if (this._index !== 0) this._card.setVisible(false);
        } else {
            this.viewing(false);
        }

        player._active = false;
    },

    updateWithRank: function (rank) {
        var offset = 0;
        if (!isNaN(rank) && rank >= 0) {
            this._uiRank.setVisible(true);
            this._uiRank.loadTexture(RankData.getRankNameImg(rank));
            this._uiRank.setScale(0.6);
            offset = this._uiRank.height * this._uiRank.getScaleX();
        } else {
            this._uiRank.setVisible(false);
            //TESTING
            // this._uiRank.setVisible(true);
            // this._uiRank.loadTexture(RankData.getRankNameImg(Math.floor(Math.random() * 9)));
            // this._uiRank.setScale(0.6);
            // offset = this._uiRank.height * this._uiRank.getScaleX() - 5;
        }
        this._bg.y = this._bg.defaultPos.y - offset;
        this._uiName.y = this._uiName.defaultPos.y - offset;
        this._uiGold.y = this._uiGold.defaultPos.y - offset;
    },

    onReceivedRankData: function (eventString, otherInfo) {
        if (!this._panel.isVisible() || this.uID !== otherInfo.uID) return;
        this.updateWithRank(otherInfo.rank);
    },

    efxPlayerIn: function () {
        this.resetAction();

        this._panel.stopAllActions();
        this._panel.setOpacity(0);
        this._panel.setPosition(this._panel.defaultPos);
        this._panel.x += this.isSwapped()? 25 : -25;
        this._panel.runAction(cc.spawn(
            cc.moveTo(0.25, this._panel.defaultPos).easing(cc.easeBackOut()),
            cc.fadeIn(0.25)
        ));
        this.clearSmile();

        // this.vip.setScale(1.5);
        // this.vipParticle.setVisible(false);

        // if (this.vipEfx) this.vipEfx.removeFromParent();
        // this.vip.runAction(cc.sequence(
        //     cc.delayTime(0.25),
        //     cc.callFunc(function () {
        //         this.vipEfx = new VipBoardIcon();
        //         this.vip.addChild(this.vipEfx);
        //         this.vipEfx.setPosition(cc.p(this.vip.width / 2, this.vip.height / 2));
        //         this.vipEfx._layout.setScale(0.5);
        //         this.vipEfx.open();
        //     }.bind(this))
        // ));
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
                this._gameScene.pTooltip.lb.setString(localized("TIP_" + Math.floor(Math.random() * 11 + 1)));
                this._gameScene.effectTooltip(this._gameScene.pTooltip);
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

    autoing: function (isAuto) {
        if (isAuto === 1) {
            this.darken.setVisible(true);
            if (!this.auto.isVisible()) {
                this.auto.stopAllActions();
                this.auto.setScale(0);
                this.auto.setRotation(-45);
                this.auto.setVisible(true);
                this.auto.eyes0.setVisible(true);
                this.auto.eyes1.setVisible(false);
                this.auto.runAction(cc.sequence(
                    cc.spawn(
                        cc.rotateTo(0.5, 2.5).easing(cc.easeBackOut()),
                        cc.scaleTo(0.5, 1).easing(cc.easeBackOut())
                    ),
                    cc.callFunc(function () {
                        this.runAction(cc.sequence(
                            cc.rotateTo(1, -2.5).easing(cc.easeInOut(10)),
                            cc.rotateTo(1, 2.5).easing(cc.easeInOut(10))
                        ).repeatForever())
                    }.bind(this.auto))
                ));

                if (this._index === 0) {
                    cc.log("SHOW TOOL TIP");
                    this._gameScene.pTooltip.stopAllActions();
                    this._gameScene.pTooltip.setVisible(true);
                    this._gameScene.pTooltip.setOpacity(0);
                    this._gameScene.pTooltip.lb.setString(localized("TIP_AFK"));
                    this._gameScene.pTooltip.runAction(cc.fadeIn(0.25));
                    this._gameScene.effectTooltip(this._gameScene.pTooltip, 0.25);
                }
            }
        } else {
            this.auto.stopAllActions();
            this.auto.setVisible(false);
            this.darken.setVisible(false);
            if (this._index === 0) {
                cc.log("HIDE TOOL TIP");
                this._gameScene.pTooltip.stopAllActions();
                this._gameScene.pTooltip.setVisible(false);
            }
        }
    },

    autoPlayCard: function (delay = 0) {
        if (!this.auto.isVisible()) return;
        this.auto.runAction(cc.sequence(
            cc.delayTime(delay),
            cc.scaleTo(0.25, 1.2).easing(cc.easeBackIn()),
            cc.callFunc(function () {
                this.eyes0.setVisible(false);
                this.eyes1.setVisible(true);
            }.bind(this.auto)),
            cc.delayTime(0.5),
            cc.scaleTo(0.25, 1).easing(cc.easeBackIn()),
            cc.callFunc(function () {
                this.eyes0.setVisible(true);
                this.eyes1.setVisible(false);
            }.bind(this.auto))
        ))
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
        var scale = this._card.width / SamCard.ORG_WIDTH;
        var pos = this._card.convertToWorldSpaceAR(cc.p(0, 0));
        for (var i = 0; i < cards.length; i++) {
            ret.push({
                id: cards[i],
                x: pos.x,
                y: pos.y,
                scale: scale
            });
        }
        return ret;
    },

    addEffectTime: function (time, timeRemain) {
        var percent = 1;
        if (timeRemain) {
            percent = timeRemain / time;
            time = timeRemain;
        }

        if (!this.timer.eff) {
            this.timer.eff = new CustomSkeleton("Animation/clock", "skeleton", 1);
            this.timer.eff.setLocalZOrder(-1);
            this.timer.eff.setScale(0.7);
            this.timer.eff.setPosition(cc.p(this.timer.width / 2, this.timer.height / 2));
            this.timer.addChild(this.timer.eff);
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
        this.mask.runAction(cc.scaleTo(0.5, 1.1).easing(cc.easeBackOut()));
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
        this.mask.runAction(cc.scaleTo(0.25, 0.9));
    },

    sapxep: function () {
        var cards = [];                             // card original (de return)
        var tmpCards = [];                          // card de sapxep
        var ret = null;                               // result sau khi sap xep
        for (var i = 0; i < this._handOnCards.length; i++) {
            cards.push(new Card(this._handOnCards[i]._id));
            tmpCards.push(new Card(this._handOnCards[i]._id));
        }

        this._sortedCards = (this._sortedCards + 1) % kSort_Unknown;
        ret = GameHelper.sapxepQuanBai(tmpCards, this._sortedCards);

        for (var i = 0; i < this._handOnCards.length; i++) {
            this._handOnCards[i].setID(ret[i]._id);
        }
        return cards;
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
        if (this.isBao) return;

        if (!this.baoOne.eff) {
            this.baoOne.eff = new CustomSkeleton("Animation/bao", "skeleton", 1);
            this.baoOne.eff.setPosition(cc.p(this.baoOne.width / 2, 25));
            this.baoOne.addChild(this.baoOne.eff);
        }

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
        this.baoPanel.setVisible(true);
        this.baoPanel.runAction(cc.fadeIn(0.25));

        this.baoPanel.bao.stopAllActions();
        this.baoPanel.bao.setScaleX(-1);
        this.baoPanel.bao.setScaleY(1);
        this.baoPanel.bao.setVisible(true);
        this.baoPanel.bao.setPositionX(this.baoPanel.orgPos.x - 250);
        this.baoPanel.bao.setPositionY(this.baoPanel.orgPos.y);
        this.baoPanel.bao.runAction(cc.moveTo(0.5, this.baoPanel.orgPos).easing(cc.easeBackOut()));

        for (var i = 0; i < this.baoPanelEfx.length; i++) {
            this.baoPanelEfx[i].stopAllActions();
            this.baoPanelEfx[i].setVisible(false);
        }

        this.baoPanel.baoCancel.stopAllActions();
        this.baoPanel.baoCancel.setVisible(false);
    },

    baoCancel: function () {
        this.baoPanel.stopAllActions();
        this.baoPanel.setOpacity(0);
        this.baoPanel.setVisible(true);
        this.baoPanel.runAction(cc.fadeIn(0.25));

        this.baoPanel.baoCancel.stopAllActions();
        this.baoPanel.baoCancel.setVisible(true);
        this.baoPanel.baoCancel.setPositionX(this.baoPanel.orgPos.x - 250);
        this.baoPanel.baoCancel.setPositionY(this.baoPanel.orgPos.y);
        this.baoPanel.baoCancel.runAction(cc.moveTo(0.5, this.baoPanel.orgPos).easing(cc.easeBackOut()));

        this.baoPanel.bao.stopAllActions();
        this.baoPanel.bao.setVisible(false);
    },

    baoNormalize: function () {
        this.isBao = true;
        var numberEfx = this.baoPanelEfx.length;
        if (numberEfx === 0) {
            numberEfx = 3;
            for (var i = 0; i < numberEfx; i++) {
                cc.log("RUN CREATE HERE??", i);
                var sprite = new cc.Sprite("#player/bao.png");
                sprite.setPosition(cc.p(this.baoPanel.bao.width / 2, this.baoPanel.bao.height / 2));
                sprite.setLocalZOrder(-1);
                this.baoPanel.bao.addChild(sprite);
                this.baoPanelEfx.push(sprite);
            }
        }

        cc.log("RUN OUT HERE??", numberEfx);
        var widthForward = -100;
        var time = 0.5;
        for (var i = 0; i < numberEfx; i++) {
            cc.log("RUN IN HERE??", i);
            var efxSprite = this.baoPanelEfx[i];
            efxSprite.stopAllActions();
            efxSprite.setPosition(cc.p(this.baoPanel.bao.width / 2, this.baoPanel.bao.height / 2));
            efxSprite.runAction(cc.sequence(
                cc.delayTime(i * time),
                cc.callFunc(function (position, widthForward) {
                    this.setOpacity(150);
                    this.setVisible(true);
                    this.runAction(cc.sequence(
                        cc.fadeTo(0, 150),
                        cc.moveTo(0, position),
                        cc.spawn(
                            cc.moveBy(2, widthForward, 0),
                            cc.fadeOut(2).easing(cc.easeIn(2))
                        ),
                        cc.delayTime(1)
                    ).repeatForever())
                }.bind(efxSprite, cc.p(this.baoPanel.bao.width / 2, this.baoPanel.bao.height / 2), widthForward))
            ))
        }
    },

    clearBao: function (isEndGame, immediate) {
        if (this.isBao && !isEndGame) return;

        if (immediate)
            this.baoPanel.setVisible(false);
        else
            this.baoPanel.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.fadeOut(0.15),
                cc.hide()
            ));
    },

    chatEmotion: function (idx) {
        var pos = this._uiAvatar.getPosition();
        ChatPlayer.showChatEmotion(idx, this._panel, pos);
    },

    addSmile: function (emotion) {
        if (this.auto.isVisible()) return;
        if (this._index === 0) return;

        var list = [];
        switch (emotion) {
            case PlayerView.EMOTION.ANGRY:
                list = ["8", "10", "14", "20"];
                break;
            case PlayerView.EMOTION.HAPPY:
                list = ["1", "5", "7", "12", "13", "16"];
                break;
            case PlayerView.EMOTION.MISCHIEF:
                list = ["3", "4", "17", "18"];
                break;
            case PlayerView.EMOTION.SAD:
                list = ["2", "9", "11", "15", "19"];
                break;
            default:
                list = ["6"];
                break;
        }
        var emote = new CustomSkeleton("Animation/autoEmote", "skeleton");
        emote.setAnimation(0, list[Math.floor(Math.random() * list.length)], -1);
        this.effectEmote(emote, 2);
    },

    clearSmile: function () {
        var emote = this._panel.getChildByTag(PlayerView.EMOTE_TAG);
        while (emote) {
            try {
                emote.removeFromParent();
            } catch (e) {}
            emote = this._panel.getChildByTag(PlayerView.EMOTE_TAG);
        }
    },

    chatMessage: function (msg) {
    },

    addTmpAvatar: function () {
    },

    clearTmpAvatar: function () {
    },

    addIncreaseMoney: function (gold, delay = 0) {
        if (!this.result) {
            this.initResult();
        }
        if (!this.resultWin.eff) this.initEffectResultWin();

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

    addDecreaseMoney: function (gold, delay = 0, reason = "") {
        if (!this.result) {
            this.initResult();
        }

        this.resultLose.stopAllActions();
        this.resultLose.setVisible(true);
        this.resultLose.setOpacity(255);
        this.resultLose.width = 0;
        this.resultLose.lbGold.setVisible(true);
        this.resultLose.pCards.setVisible(false);
        this.resultLose.label.setVisible(false);
        this.resultLose.stamp.setVisible(false);
        this.resultLose.lbGoldToiTrang.setVisible(false);
        this.resultLose.labelToiTrang.setVisible(false);

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
    },

    addResultLose: function (gold, cardsID, type, delay) {
        if (!this.result) {
            this.initResult();
        }

        var isToiTrang = type === GameLayer.END_TYPE_WIN_FLUSH ||
            type === GameLayer.END_TYPE_WIN_SAM_DINH ||
            type === GameLayer.END_TYPE_WIN_FIVE_PAIR||
            type === GameLayer.END_TYPE_WIN_FOUR_PIG;

        cardsID.sort(function(a, b) {
            return a - b;
        });

        var delayTime = delay? PlayerView.TIME_RESULT_ANIMATION : PlayerView.TIME_RESULT_LASTCARD;

        var orgWidth = 423;
        var smallWidth = 130;
        var minWidth = 260;
        var oneCardWidth = 174;
        var scaleTime = 0.25;

        var isThoi = this.setLabelLose(type, cardsID);

        var finalWidth = oneCardWidth + (cardsID.length - 1) * ((orgWidth - oneCardWidth) / (this.resultLose.cards.length - 1));
        if (this.resultLose.stamp.isVisible()) finalWidth = Math.max(minWidth, finalWidth);

        this._card.stopAllActions();
        this._card.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.hide()
        ));

        this.resultLose.stopAllActions();
        this.resultLose.setVisible(true);
        this.resultLose.setOpacity(255);
        this.resultLose.setContentSize(cc.size(smallWidth, 89));
        this.resultLose.setScale(0);
        var deltaWidth = (finalWidth - smallWidth) / cardsID.length;
        this.resultLose.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.scaleTo(scaleTime, -1, 1).easing(cc.easeIn(2.5)),
            cc.sequence(
                cc.delayTime(scaleTime / (finalWidth - smallWidth)),
                cc.callFunc(function (deltaWidth, finalWidth) {
                    this.resultLose.width = Math.min(this.resultLose.width + deltaWidth, finalWidth);
                }.bind(this, deltaWidth, finalWidth))
            ).repeat(cardsID.length)
        ));

        this.resultLose.label.setVisible(true);

        var cardDelay = 0.05;
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

        if (isToiTrang) {
            this.resultLose.lbGold.stopAllActions();
            this.resultLose.lbGold.setOpacity(0);
            this.resultLose.label.setVisible(false);
            this.resultLose.labelToiTrang.setVisible(true);
            this.addResultLabelEffect(
                this.resultLose.lbGoldToiTrang,
                this.resultLose.lbGoldToiTrangPos,
                "+" + this.convertGoldString(Math.abs(gold)),
                scaleTime,
                scaleTime + cardDelay * cardsID.length + cardScaleTime + delayTime
            );
        } else {
            this.resultLose.lbGoldToiTrang.stopAllActions();
            this.resultLose.lbGoldToiTrang.setOpacity(0);
            this.resultLose.label.setVisible(true);
            this.resultLose.labelToiTrang.setVisible(false);
            this.addResultLabelEffect(
                this.resultLose.lbGold,
                this.resultLose.lbGoldPos,
                "-" + this.convertGoldString(Math.abs(gold)),
                scaleTime,
                scaleTime + cardDelay * cardsID.length + cardScaleTime + delayTime
            );
        }
        //this.addLevelExp(scaleTime + cardDelay * cardsID.length + cardScaleTime + delayTime + 1);
    },

    setLabelLose: function (type, cardsID) {
        var isThoi = [];
        this.resultLose.stamp.setVisible(true);
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
                this.resultLose.stamp.setVisible(false);
                break;
            case GameLayer.END_TYPE_LOSE_SAM_BLOCK:
                this.resultLose.lbStamp.setString("Bị Chặn Sâm");
                break;
            case GameLayer.END_TYPE_DRAW:
                this.resultLose.lbStamp.setString("Hòa");
                break;
            case GameLayer.END_TYPE_WIN_FLUSH:
                this.resultLose.lbStamp.setString("Đồng Hoa");
                break;
            case GameLayer.END_TYPE_WIN_SAM_DINH:
                this.resultLose.lbStamp.setString("Sâm Đỉnh");
                break;
            case GameLayer.END_TYPE_WIN_FIVE_PAIR:
                this.resultLose.lbStamp.setString("Năm Đôi");
                break;
            case GameLayer.END_TYPE_WIN_FOUR_PIG:
                this.resultLose.lbStamp.setString("Tứ Quý Heo");
                break;
            default:
                this.resultLose.stamp.setVisible(false);
                break;
        }

        return isThoi;
    },

    addResultWin: function (gold, cardsID, type, delay) {
        if (!this.result) {
            this.initResult();
        }

        if (type === GameLayer.END_TYPE_WIN_FLUSH ||
            type === GameLayer.END_TYPE_WIN_SAM_DINH ||
            type === GameLayer.END_TYPE_WIN_FIVE_PAIR||
            type === GameLayer.END_TYPE_WIN_FOUR_PIG)
        {
            this.addResultLose(gold, cardsID, type, delay);
            return;
        }

        var delayTime = delay? PlayerView.TIME_RESULT_ANIMATION : PlayerView.TIME_RESULT_LASTCARD;

        this._card.stopAllActions();
        this._card.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.hide()
        ));

        this.resultWin.stopAllActions();
        this.resultWin.setVisible(true);
        this.resultWin.setOpacity(255);

        var scaleTime = 0.25;
        if (!this.resultWin.eff) this.initEffectResultWin();
        this.resultWin.eff.stopAllActions();
        this.resultWin.eff.setVisible(false);
        this.resultWin.eff.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.show(),
            cc.callFunc(function () {
                this.setAnimation(0, "action", 0);
            }.bind(this.resultWin.eff)),
            cc.delayTime(this.resultWin.eff.getDuration("action")),
            cc.callFunc(function () {
                this.setAnimation(0, "idle", -1);
            }.bind(this.resultWin.eff))
        ));

        this.resultWin.fox.stopAllActions();
        this.resultWin.fox.setVisible(false);
        this.resultWin.fox.runAction(cc.sequence(
            cc.delayTime(scaleTime * 2 + delayTime),
            cc.show(),
            cc.callFunc(function () {
                this.setAnimation(0, "fox_win_action", 0);
            }.bind(this.resultWin.fox)),
            cc.delayTime(this.resultWin.fox.getDuration("fox_win_action")),
            cc.callFunc(function () {
                this.setAnimation(0, "fox_win_idle", -1);
            }.bind(this.resultWin.fox))
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
        if (!this.isBao) return;
        if (!this.resultBlock) {
            this.initEffectResultBlock();
        }

        this.clearBao(true);
        this.resultBlock.stopAllActions();
        this.resultBlock.setVisible(true);
        this.resultBlock.setOpacity(0);
        this.resultBlock.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(function () {
                this.setAnimation(0, "angry", -1);
            }.bind(this.resultBlock)),
            cc.fadeIn(0.25),
            cc.delayTime(2),
            cc.fadeOut(0.25)
        ))
    },

    removeResult: function (delay = 0, immediate = false) {
        var resultPanel = [];
        resultPanel.push(this.resultWin);
        resultPanel.push(this.resultLose);
        resultPanel.push(this._gameScene._effect2D.getChildByTag(LayerEffect2D.SAM_EFFECT_TAG));
        resultPanel.push(this.lbExp);
        resultPanel.push(this.resultBlock);

        for (var i = 0; i < resultPanel.length; i++) {
            if (resultPanel[i]) {
                if (immediate)
                    resultPanel[i].setVisible(false);
                else
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
        cc.log("PLAYER useEmoticon", id, emoId);
        var scale = StorageManager.getEmoticonScale(id) * 0.75;
        var emo = StorageManager.getEmoticonForPlay(id, emoId);
        emo.setScale(scale);
        var duration = emo.playAnimation(1, 2);
        this.effectEmote(emo, duration);
    },

    effectEmote: function (emote, duration) {
        var timeInOut = 0.2;
        var bgEmote = new cc.Sprite("ChatNew/bgEmote.png");
        var bgScale = this.isSwapped()? -1 : 1;
        var orgRot = this.isSwapped()? 90 : -90;
        bgEmote.setAnchorPoint(cc.p(0, 0));
        bgEmote.setPosition(this._uiAvatar.getPosition());
        bgEmote.y += this.mask.height / 2 - 10;
        bgEmote.x += (this.mask.width / 3) * bgScale;
        bgEmote.setOpacity(0);
        bgEmote.setScale(0);
        bgEmote.setRotation(orgRot);
        bgEmote.runAction(cc.sequence(
            cc.spawn(
                cc.fadeTo(timeInOut, 255),
                cc.scaleTo(timeInOut, 1 * bgScale, 1).easing(cc.easeBackOut()),
                cc.rotateTo(timeInOut, 0).easing(cc.easeBackOut())
            ),
            cc.delayTime(duration - timeInOut * 2),
            cc.spawn(
                cc.fadeTo(timeInOut, 100),
                cc.scaleTo(timeInOut, 0).easing(cc.easeBackIn()),
                cc.rotateTo(timeInOut, orgRot).easing(cc.easeBackIn())
            ),
            cc.removeSelf()
        ));
        bgEmote.addChild(emote);
        bgEmote.setTag(PlayerView.EMOTE_TAG);
        bgEmote.setLocalZOrder(5);
        emote.setPosition(cc.p(bgEmote.width * 0.5, bgEmote. height  * 0.6));
        var emoteScale = emote.getScale();
        emote.setScale(0);
        emote.runAction(cc.sequence(
            cc.scaleTo(timeInOut, emoteScale).easing(cc.easeBackOut()),
            cc.delayTime(duration - timeInOut * 2),
            cc.scaleTo(timeInOut, 0).easing(cc.easeBackIn())
        ))
        this._panel.addChild(bgEmote);
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
PlayerView.EMOTE_TAG = 112;
PlayerView.TIME_RESULT_ANIMATION = 3.5;
PlayerView.TIME_RESULT_LASTCARD = 0;
PlayerView.TIME_DELAY_ENDGAME_PACKET = 2.5;
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
PlayerView.TOTAL_INGAME_AVATAR = 8;
PlayerView.EMOTION = {
    ANGRY: 0,
    MISCHIEF: 1,
    HAPPY: 2,
    SAD: 3
};

var MyView = PlayerView.extend({
    ctor: function (gameScene) {
        this._super(gameScene);

        this._touchEnable = false;
        this._touched = false;
        this._enableTouch = true;

        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        });
    },

    /* init for myPlayer */
    initWithScene: function (gameScene, index) {
        this._cardPanel = ccui.Helper.seekWidgetByName(gameScene._layout, "card_panel");
        this._cardPanel.setLocalZOrder(5);
        this.result = ccui.Helper.seekWidgetByName(gameScene._layout, "result_panel");
        this.result.setLocalZOrder(6);
        this._type = Player.MY;
        this._index = index;

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
        this._gameScene.logForIOS("DONE EventListener");

        this._cardFirstTurn = new SamCard(60);
        this._cardFirstTurn.setVisible(false);
        this._cardFirstTurn.setPosition(cc.p(
            this._cardPanel.width * 0.5 - (this._cardPanel.x - this._cardPanel.x * (5/6)) * 0.5,
            this._cardPanel.height * 0.5
        ));
        this._cardPanel.addChild(this._cardFirstTurn);
        this._gameScene.logForIOS("DONE CARD");

        this.resultLose = this.result.getChildByName("bgLose");
        this.resultLose.lbGold = this.resultLose.getChildByName("gold");
        this.resultLose.label = this.resultLose.getChildByName("label");
        this.resultLose.stamp = this.resultLose.getChildByName("type");
        this.resultLose.lbStamp = this.resultLose.stamp.getChildByName("txt");
        this.resultLose.stampPos = this.resultLose.stamp.getPosition();
        this.resultLose.setVisible(false);

        this.resultWin = this.result.getChildByName("bgWin");
        this.resultWin.lbGold = this.resultWin.getChildByName("gold");
        this.resultWin.lbGold.setLocalZOrder(1);
        this.resultWin.label = this.resultWin.getChildByName("label");
        this.resultWin.label.setLocalZOrder(1);
        this.resultWin.eff = new CustomSkeleton("Animation/light", "skeleton", 1);
        this.resultWin.eff.setPosition(this.resultWin.width / 2, this.resultWin.height / 2 + 5);
        this.resultWin.eff.setScale(1.25);
        this.resultWin.eff.setTimeScale(1.5);
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
        this._gameScene.logForIOS("DONE TIME");

        var myBaoPosition = cc.p(-80, 120);
        this.baoPanel.bao.setPosition(myBaoPosition);
        this.baoPanel.bao.getChildByName("lb").y += 28;
        this.baoPanel.baoCancel.setPosition(myBaoPosition);
        this.baoPanel.baoCancel.getChildByName("lb").y += 28;
        this.baoPanel.orgPos = this.baoPanel.bao.getPosition();
        this._gameScene.logForIOS("DONE BAO");

        this._card.setVisible(false);

        this.pLevel = this._panel.getChildByName("pLevel");
        this.pLevel.glow = this.pLevel.getChildByName("glow");
        this.pLevel.glow.stopSystem();
        this.pLevel.arrow = this.pLevel.getChildByName("arrow");
        this.pLevel.arrow.stopSystem();
        this.pLevel.arrow2 = this.pLevel.getChildByName("arrow2");
        this.pLevel.arrow2.stopSystem();
        this._gameScene.logForIOS("DONE LEVEL");
    },

    initCards: function (cards) {
        cc.log("INIT CARD " + JSON.stringify(cards));

        var height = this._cardPanel.getContentSize().height;
        for (var i = 0; i < cards.length; i++) {
            var card;
            if (i < this._handOnCards.length) {
                card = this._handOnCards[i];
                card.setID(cards[i]);
            } else {
                card = new SamCard(cards[i]);
                this._cardPanel.addChild(card);
                this._handOnCards.push(card);
            }
            card.addEfxBan();
            card.setLocalZOrder(i);
            card._startY = height / 2;
        }
        for (var j = i; j < this._handOnCards.length; j) {
            this._handOnCards[i].removeFromParent();
            this._handOnCards.pop();
        }

        this.fixPositionHandOnCardForMy(true);
    },

    clearBai: function () {
        var allCards = this._cardPanel.getChildren();
        for (var i = 0; i < allCards.length; i++) {
            if (allCards[i] !== this._cardFirstTurn && allCards[i] !== this._moveCard)
                allCards[i].removeFromParent()
        }
        this._handOnCards = [];
    },

    /* myPlayer ; fix position cards khi danh quan bai */
    fixPositionHandOnCardForMy: function (immediately) {
        if (this._handOnCards.length === 0) return;

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
        if (immediately)
            control.setPosition(position);
        else
            control.runAction(cc.moveTo(0.25, position).easing(cc.easeBackOut()));
    },
    /* myPlayer ; fix position cards khi danh quan bai */

    danhbai: function (cards) {
        var ret = []
        for (var j = 0; j < this._handOnCards.length; j++) {
                this._handOnCards[j].forceDOWN();
                this._handOnCards[j].setVisible(true);
        }
        if (!cards) return;
        var check = [];
        for (var i = 0; i < cards.length; i++) {
            for (var j = 0; j < this._handOnCards.length; j++) {
                if (this._handOnCards[j]._id === cards[i]) {
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
        return ret;
    },

    enableTouch: function (enable) {
        this._enableTouch = enable;
    },

    onTouchBegan: function (touch, event) {
        this.forceAllCardDown = false;
        var target = event.getCurrentTarget();
        target.autoing(false);
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

        if (touch.getID() !== 0 || !target._touchEnable || !needTouch) {
            return false;
        }

        target._touched = true;
        target._startId = null;
        target._endId = null;

        cc.log("onTouchBegan");
        for (var i = target._handOnCards.length - 1; i >= 0; i--) {
            if (target._handOnCards[i].containTouchPoint(touch.getLocation())) {
                target._startId = i;
                target._endId = i;
                target._handOnCards[i].showEfxBan();
                cc.log("onTouchBegan", target._startId, target._endId);
                return true;
            }
        }

        var removeAll = false;
        for (var i = target._handOnCards.length - 1; i >= 0; i--) {
            if (target._handOnCards[i]._up) {
                target._handOnCards[i].upDown();
                removeAll = true;
            }
        }
        if (removeAll) target._gameScene.kiemtraDanhbai();

        return false;
    },

    onTouchMoved: function (touch, event) {
        var target = event.getCurrentTarget();
        if (touch.getID() !== 0 || !target._touchEnable || !target._touched) return;
        if (target._startId === null) return;

        for (var i = target._handOnCards.length - 1; i >= 0; i--) {
            if (target._handOnCards[i].containTouchPoint(touch.getLocation())) {
                target._endId = i;
                break;
            }
        }
        var start = target._startId;
        var end = target._endId;
        if (start > end) {
            start = target._endId;
            end = target._startId;
        }
        cc.log("onTouchMoved", start, end);
        for (var i = 0; i < target._handOnCards.length; i++) {
            if (i >= start && i <= end)
                target._handOnCards[i].showEfxBan();
            else
                target._handOnCards[i].hideEfxBan();
        }
    },

    onTouchEnded: function (touch, event) {
        var target = event.getCurrentTarget();
        if (touch.getID() !== 0 || !target._touchEnable) return;

        target._touched = false;
        if (target._startId === target._endId) {
            gameSound.clickQuanbai();
            target._handOnCards[target._startId].upDown();
            target._handOnCards[target._startId].hideEfxBan();
            if (target._handOnCards[target._startId]._up)
                target._gameScene.oneCardCheck(target._handOnCards[target._startId]._id);
            target._gameScene.kiemtraDanhbai(target._handOnCards[target._startId]._up);
            return;
        }
        var start = target._startId;
        var end = target._endId;
        if (start > end) {
            start = target._endId;
            end = target._startId;
        }
        cc.log("onTouchEnded", start, end);
        for (var i = 0; i < target._handOnCards.length; i++) {
            target._handOnCards[i].hideEfxBan();
            if (i >= start && i <= end)
                target._handOnCards[i].forceUP();
            else
                target._handOnCards[i].forceDOWN();
        }
        target._gameScene.kiemtraDanhbai();
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

    addResultWin: function (gold, cardsID, type, delay) {
        var delayTime = delay? PlayerView.TIME_RESULT_ANIMATION : PlayerView.TIME_RESULT_LASTCARD;

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

    addResultLose: function (gold, cardsID, type, delay) {
        var delayTime = delay? PlayerView.TIME_RESULT_ANIMATION : PlayerView.TIME_RESULT_LASTCARD;

        this.addEffectResult(this.resultLose, "-" + this.convertGoldString(Math.abs(gold)), delayTime);
        this.addLevelExp(delayTime + 1);
        this.resultLose.label.setVisible(true);

        cc.log("ADD MY RESULT LOSE", JSON.stringify(this._gameScene.winToiTrang));
        gameSound.playThua();
        switch (type) {
            case GameLayer.END_TYPE_LOSE_SAM_BLOCK:
                this._gameScene._effect2D.addBigResult("lose_action", "lose_idle");
                break;
            case GameLayer.END_TYPE_LOSE_TOI_TRANG:
                if (this._gameScene.winToiTrang.pos !== -1)
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

        this.setLabelLose(type, cardsID);
        this.resultLose.stamp.stopAllActions();
        this.resultLose.stamp.setOpacity(0);
        this.resultLose.stamp.setPosition(this.resultLose.stampPos);
        this.resultLose.stamp.x += 75;
        this.resultLose.stamp.runAction(cc.sequence(
            cc.delayTime(delayTime + 0.5),
            cc.spawn(
                cc.fadeIn(0.25),
                cc.moveTo(0.5, this.resultLose.stampPos).easing(cc.easeOut(3))
            )
        ));
    },

    addIncreaseMoney: function (gold, delay = 0) {
        this.addEffectResult(this.resultWin, "+" + this.convertGoldString(Math.abs(gold)), delay);
        this.resultWin.label.setVisible(false);
        this.resultWin.eff.setAnimation(1, "idle", -1);
    },

    addDecreaseMoney: function (gold, delay = 0, reason = "") {
        this.addEffectResult(this.resultLose, "-" + this.convertGoldString(Math.abs(gold)), delay);
        this.resultLose.label.setVisible(false);
        this.resultWin.eff.setAnimation(1, "idle", -1);
        if (reason !== "") {
            this.resultLose.stamp.setVisible(true);
            this.resultLose.lbStamp.setString(reason);
        } else {
            this.resultLose.stamp.setVisible(false);
        }
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
    },

    addGotSamBlock: function () {
        //do noting
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
                "+" + StringUtility.standartNumber(levelExpAdd) + " exp",
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
                    cc.delayTime(delayTime + 1.25),
                    cc.callFunc(function () {
                        this.pLevel.runAction(cc.sequence(
                            cc.show(),
                            cc.callFunc(function () {
                                this.pLevel.glow.resetSystem();
                                this.pLevel.arrow.resetSystem();
                                this.pLevel.arrow2.resetSystem();
                            }.bind(this)),
                            cc.spawn(
                                cc.fadeIn(0.1),
                                cc.delayTime(1.75)
                            ),
                            cc.callFunc(function () {
                                this.pLevel.glow.stopSystem();
                                this.pLevel.arrow.stopSystem();
                                this.pLevel.arrow2.stopSystem();
                            }.bind(this)),
                            cc.fadeOut(0.5)
                        ));
                    }.bind(this)),
                    cc.delayTime(0.75),
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

    addEffectTime: function (time, timeRemain) {
        this._super(time, timeRemain);
        this.baoPanel.stopAllActions();
        this.baoPanel.setOpacity(255);
        this.baoPanel.runAction(cc.moveTo(0.5, cc.p(this.baoPanel.pos.x, this.baoPanel.pos.y + 20)).easing(cc.easeBackOut()));
    },

    stopEffectTime: function () {
        this._super();
        this.baoPanel.stopAllActions();
        this.baoPanel.setOpacity(255);
        this.baoPanel.runAction(cc.moveTo(0.25, this.baoPanel.pos).easing(cc.easeBackIn()));
    },

    getVoucherPosition: function () {
        return this._panel.convertToWorldSpace(cc.p(
            this.vip.x,
            this.mask.y + this.mask.height * 0.35
        ));
    }
});