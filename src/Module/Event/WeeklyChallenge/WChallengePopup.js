WChallengePopup = BaseLayer.extend({
    ctor: function () {

        this._super(WChallengePopup.className);
        this.setPosition(cc.winSize.width/2, cc.winSize.height/2);
        this.DAILY_ITEM_SPACE = 75;
        this.disabledLayer = new WChallengeDisabledLayer();
        this.addChild(this.disabledLayer, 0);
        this.initWithBinaryFile('res/Event/WeeklyChallenge/WeeklyChallengeFlexMainGUI.json');
        this.firstRenderUnlockBtn = true;
        this.didActiveItemEffect = false;
        this.shopBtn.addTouchEventListener(function(render, eventType){
            if(eventType === ccui.Widget.TOUCH_BEGAN) {
                this.shopAnimation.setScale(1.1);
            }
            if(eventType === ccui.Widget.TOUCH_CANCELED) {
                this.shopAnimation.setScale(1);
            }
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                gamedata.openShop();
                WChallenge.getInstance().delayOpenMainGuiFlag = true;
            }
        }.bind(this));
        this.showingTooltipId = -1;
        this.hideTooltipTimeoutId = null;
        this.renderUserInfo();
        this.updateGoldInfo();
        this.updateGoldListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "fldjs",
            callback: function(){
                this.updateGoldInfo();
            }.bind(this)
        });
        cc.eventManager.addListener(this.updateGoldListener, 1);
        this.loadUserInfoListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: WChallenge.EVENT.WCHALLENGE_LOAD_USER_INFO,
            callback: function(){
                this.renderUserInfo();
            }.bind(this)
        });
        cc.eventManager.addListener(this.loadUserInfoListener, 1);
        this.loadConfigListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: WChallenge.EVENT.WCHALLENGE_LOAD_CONFIG,
            callback: function(){
                this.renderUserInfo();
            }.bind(this)
        });
        cc.eventManager.addListener(this.loadConfigListener, 1);
        this.unlockPremiumBtn.addTouchEventListener(function(render, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                WChallenge.getInstance().openUnlockPremiumGUI();
            }
        }.bind(this));
        this.detailInfo.onWeekTimeout(function(){
            this.close();
        }.bind(this));
        this.detailInfo.onClaimDailyRewards(function(){
            var delayEachReq = 250;
            var currDelay = 0;
            var totalGold = 0;
            var totalClover = 0;
            var worldOriPos = null;
            for (var i = 0; i < this.challengeItems.length; i++) {
                if(this.challengeItems[i].state === CHALLENGE_ITEM_STATE.CLAIM_REWARD) {
                    setTimeout(function(cItem){
                        cItem.getReward();
                    }.bind(this), currDelay, this.challengeItems[i]);
                    currDelay += delayEachReq;
                    var getRewardEffect = new WChallengeGetRewardEffect();
                    var id = this.challengeItems[i].id;
                    totalGold += this.challengeItems[id].gold;
                    totalClover += this.challengeItems[id].clovers;
                    worldOriPos = this.challengeItems[id].guiNode.getParent().convertToWorldSpace(this.challengeItems[id].guiNode.getPosition());
                }
            }
            if (worldOriPos != null) {
                var worldGoldPos = this.goldBar.getParent().convertToWorldSpace(cc.p(this.goldBar.x - this.goldBar.width / 2 + 20, this.goldBar.y));
                var worldCloverPos = this.pCloverInfo.imgClover.getParent().convertToWorldSpace(this.pCloverInfo.imgClover.getPosition());
                getRewardEffect.setOriPos(worldOriPos.x, worldOriPos.y);
                getRewardEffect.setGoldPos(worldGoldPos.x, worldGoldPos.y);
                getRewardEffect.setCloverPos(worldCloverPos.x, worldCloverPos.y);
                getRewardEffect.setCloverVal(totalClover);
                getRewardEffect.setGoldVal(totalGold);
                this.addChild(getRewardEffect, 40);
                getRewardEffect.doEffect(true);
            }
        }.bind(this));
        this.detailInfo.onClaimRewardFinalDay(function(){
            this.detailInfo.setIsExchangingClover(true);
            var wChallenge = WChallenge.getInstance();
            var currClovers = wChallenge.currClovers;
            var self = this;
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
            function doEffect() {
                if(currClovers >= 100) {
                    currClovers -= Math.round(currClovers * 0.2);
                } else if(currClovers > 10) {
                    currClovers -= Math.round(currClovers * 0.15);
                } else {
                    currClovers -= 1;
                }
                self.aside.setCurrClover(currClovers);
                if(currClovers > 0) {
                    setTimeout(doEffect, timePerClovers*1000);
                }
            }
            var effTime = effectMgr.flyCoinEffect(this, wChallenge.currClovers, 0.05,
                cc.p(this.pCloverInfo.getPositionX(), this.pCloverInfo.getPositionY()), cc.p(this.goldBar.x - this.goldBar.width/2 + 20, this.goldBar.y));
            var timePerClovers = effTime/currClovers;
            doEffect();
            var bubbleGold = BaseLayer.createLabelText("+" + StringUtility.standartNumber(wChallenge.currClovers*wChallenge.goldPerClover), cc.color(255,238,89));
            bubbleGold.setFontName("Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf");
            bubbleGold.setFontSize(30);
            bubbleGold.enableOutline(cc.color(108,57,27), 1);
            bubbleGold.setPosition(this.goldBar.x, this.goldBar.y);
            this.addChild(bubbleGold);
            bubbleGold.setOpacity(0);
            bubbleGold.runAction(cc.sequence(
                cc.delayTime(effTime),
                cc.spawn(
                    cc.fadeIn(0.2),
                    cc.moveBy(0.5, 0, 50).easing(cc.easeBackOut(2.0))
                ),
                cc.delayTime(1.5),
                cc.fadeOut(0.2)
            ));
            setTimeout(function(){
                var cmd = new CmdSendWChallengeExchangeGoldClover();
                GameClient.getInstance().sendPacket(cmd);
            }.bind(this), 2000);
            setTimeout(function(){
                blurLayer.runAction(cc.sequence(
                    cc.fadeOut(0.5),
                    cc.callFunc(function () {
                        blurLayer.removeFromParent();
                    })
                ))
            }.bind(this), effTime*1000);
        }.bind(this));

        this.setBackEnable(true);
    },
    onEnter: function () {
        this._super();

        var lobby = sceneMgr.getMainLayer();
        if (lobby instanceof LobbyScene) {
            lobby.setBackEnable(false);
        }

        if (cc.winSize.width/cc.winSize.height > Constant.WIDTH/Constant.HEIGHT) {
            this._scaleRealX = 1;
        }

        var wChallenge = WChallenge.getInstance();
        var challengeDay = wChallenge.challengeDay;
        if(wChallenge.enteredGUI && wChallenge.enteredGUI[challengeDay - 1] === 0) {
            wChallenge.enteredGUI[challengeDay - 1] = 1;
            var cmd = new CmdSendWChallengeOpenGUI();
            GameClient.getInstance().sendPacket(cmd);
        }
        var nbOfBasicRewards = wChallenge.nbOfBasicRewards;
        if(nbOfBasicRewards > 7) {
            var itemScrollWidthPercent = 100 / (wChallenge.nbOfBasicRewards - 7);
            var scrollPercent = itemScrollWidthPercent * (wChallenge.challengeDay - 1.5);
            scrollPercent = Math.max(0, Math.min(scrollPercent, 100));
            this.dailyItemsScrollView.scrollToPercentHorizontal(scrollPercent, 1.5, true);
        }
        else {
            this.dailyItemsScrollView.width += this.dailyItemsScrollView.width + 50;
        }

        this._layout.setScale(0.6*this._scaleRealX);
        this._layout.runAction(cc.scaleTo(0.35, this._scaleRealX).easing(cc.easeBackOut(2.0)));
        // effect for detail info
        this.detailInfo.guiNode.setVisible(false);
        this.detailInfo.guiNode.setPositionY(this.detailInfo.guiNode.y + 100);
        this.detailInfo.guiNode.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function(){
                this.detailInfo.guiNode.setVisible(true);
            }.bind(this)),
            cc.moveBy(0.3, 0, -100),
            cc.callFunc(function(){
                this.detailInfo.guiNode.setLocalZOrder(15);
            }.bind(this))
        ));
        this.finalDayChoice.opacity = 0;
        this.finalDayChoice.runAction(cc.sequence(
            cc.delayTime(1),
            cc.fadeIn(0.3)
        ));
    },

    initGUI: function () {
        this.bg = this._layout.getChildByName("Bg");
        this.finalDayChoice = this._layout.getChildByName('FinalDayChoice');
        this.currGold = this.getControl('GoldVal');
        this.currGold.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.goldBar = this._layout.getChildByName("GoldBar");
        this.avatarBorder = this._layout.getChildByName('AvatarBorder');
        this.avatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.avatar.setScale(0.8);
        this.avatar.setPosition(this.avatarBorder.width/2, this.avatarBorder.height/2);
        this.avatarBorder.addChild(this.avatar, -1);
        this.avatar.asyncExecuteWithUrl(gamedata.userData.uID, gamedata.userData.avatar);

        // cheat
        this.toggleCheatBtn = ccui.Button();
        this.toggleCheatBtn.setTitleText("Cheat");
        this.toggleCheatBtn.setTitleFontSize(30);
        this.toggleCheatBtn.setPosition(-cc.winSize.width/2 + 70, cc.winSize.height/2 - 50);
        this.addChild(this.toggleCheatBtn, 55);
        this.isCheatPopupVisible = false;
        this.toggleCheatBtn.addTouchEventListener(function(render, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                this.isCheatPopupVisible = !this.isCheatPopupVisible;
                this.cheatPopup.setVisible(this.isCheatPopupVisible);
            }
        }.bind(this));
        this.cheatPopup = new WChallengeCheatPopup();
        this.cheatPopup.setVisible(this.isCheatPopupVisible);
        this.addChild(this.cheatPopup, 50);
        if(Config.ENABLE_CHEAT) {
            this.toggleCheatBtn.setVisible(true);
        } else {
            this.toggleCheatBtn.setVisible(false);
        }
        this.closeBtn = this.getControl('CloseBtn');
        this.closeBtn.addTouchEventListener(function(render, eventType){
            if(eventType === ccui.Widget.TOUCH_BEGAN) {
                this.closeBtn.runAction(cc.scaleTo(0.1, 1.2));
            }
            if(eventType === ccui.Widget.TOUCH_ENDED || eventType === ccui.Widget.TOUCH_CANCELED) {
                this.closeBtn.runAction(cc.scaleTo(0.1, 1));
            }
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                this.close();
            }
        }.bind(this));
        this.shopBtn = this.getControl('ShopBtn');
        this.shopAnimation = db.DBCCFactory.getInstance().buildArmatureNode("Muala");
        if (this.shopAnimation) {
            this._layout.addChild(this.shopAnimation, this.shopBtn.getLocalZOrder() + 1);
            this.shopAnimation.setPosition(this.shopBtn.x, this.shopBtn.y);
            this.shopAnimation.getAnimation().gotoAndPlay("1", -1 , -1, -1);
        }
        this.unlockPremiumBtn = this.getControl('UnlockBtn');
        this.lockAnimation = db.DBCCFactory.getInstance().buildArmatureNode("Lock");
        if (this.lockAnimation) {
            this._layout.addChild(this.lockAnimation, this.unlockPremiumBtn.getLocalZOrder() + 1);
            this.lockAnimation.setPosition(this.unlockPremiumBtn.x, this.unlockPremiumBtn.y);
            this.lockAnimation.getAnimation().gotoAndPlay("1", -1 , -1, -1);
        }
        this.challengeItems = [];
        this.challengeBars = [];
        this.rewardTooltips = [];
        this.dailyItemsScrollView = this._layout.getChildByName('DailyItemScrollView');
        var wChallenge = WChallenge.getInstance();

        var MAX_DAY = wChallenge.nbOfBasicRewards || 7;
        this.dailyItemsViewBasicWidth = (this.DAILY_ITEM_SPACE + 0.5) * MAX_DAY;
        this.dailyItemsScrollView.innerWidth = this.dailyItemsViewBasicWidth;
        this.dailyItemsScrollView.setScrollBarOpacity(0);
        var FIRST_DAILY_ITEM_POSITION = cc.p(42, 247);
        this.dailyItems = [];
        for(var day = 0; day < MAX_DAY; day++) {
            var wChallengeDailyItem = new WChallengeDailyItem();
            this.dailyItems.push(wChallengeDailyItem);
            wChallengeDailyItem.setPosition(FIRST_DAILY_ITEM_POSITION.x + this.DAILY_ITEM_SPACE * day, FIRST_DAILY_ITEM_POSITION.y);
            this.dailyItemsScrollView.addChild(wChallengeDailyItem);
            var challengeBarNode = wChallengeDailyItem.dailyProgressNode;
            var challengeBar = new WChallengeBarItem(challengeBarNode);
            challengeBar.setTitle('Day ' + (day + 1).toString());
            this.challengeBars.push(challengeBar);
        }

        this.activeItemAnimation = db.DBCCFactory.getInstance().buildArmatureNode("FX_Light");
        if (this.activeItemAnimation) {
            this.dailyItemsScrollView.addChild(this.activeItemAnimation, 20);
            this.activeItemAnimation.setVisible(false);
        }

        var self = this;
        for(var itemId = 0; itemId < MAX_DAY * 2; itemId++) {
            var wChallengeDailyItem = this.dailyItems[Math.floor(itemId/2)];
            var challengeItemNode;
            if(itemId % 2 === 0) {
                challengeItemNode = wChallengeDailyItem.basicItemNode;
            } else {
                challengeItemNode = wChallengeDailyItem.premiumItemNode;
            }
            var challengeItem = new WChallengeItem(challengeItemNode, itemId);
            challengeItem.setClovers(wChallenge.cloverRewards[itemId]);
            challengeItem.setGold(wChallenge.goldRewards[itemId]);
            this.challengeItems.push(challengeItem);
            challengeItem.onTouchEnd(function() {
                if(this.state !== CHALLENGE_ITEM_STATE.CLAIM_REWARD) {
                    self.showTooltip(this.id);
                } else {
                    var getRewardEffect = new WChallengeGetRewardEffect();
                    var id = this.id;
                    var worldOriPos = self.challengeItems[id].guiNode.getParent().convertToWorldSpace(self.challengeItems[id].guiNode.getPosition());
                    var worldGoldPos = self.goldBar.getParent().convertToWorldSpace(cc.p(self.goldBar.x - self.goldBar.width/2 + 20, self.goldBar.y));
                    var worldCloverPos = self.pCloverInfo.imgClover.getParent().convertToWorldSpace(self.pCloverInfo.imgClover.getPosition());
                    getRewardEffect.setOriPos(worldOriPos.x, worldOriPos.y);
                    getRewardEffect.setGoldPos(worldGoldPos.x, worldGoldPos.y);
                    getRewardEffect.setCloverPos(worldCloverPos.x, worldCloverPos.y);
                    getRewardEffect.setCloverVal(self.challengeItems[id].clovers);
                    getRewardEffect.setGoldVal(self.challengeItems[id].gold);
                    self.addChild(getRewardEffect, 40);
                    getRewardEffect.doEffect(true);
                }
            }.bind(challengeItem));
            this.getRewardEffect = new WChallengeGetRewardEffect();
            this._layout.addChild(this.getRewardEffect, 40);
            // tooltip
            var rewardTooltip = new WChallengeItemTooltip();
            if(itemId % 2 === 1) {
                rewardTooltip.setPosition(wChallengeDailyItem.x + wChallengeDailyItem.activeNode.width,
                    wChallengeDailyItem.y + wChallengeDailyItem.activeNode.height/4 + wChallengeDailyItem.activeNode.height/6);
            } else {
                rewardTooltip.setPosition(wChallengeDailyItem.x + wChallengeDailyItem.activeNode.width,
                    wChallengeDailyItem.y - wChallengeDailyItem.activeNode.height/4 + wChallengeDailyItem.activeNode.height/6);
            }
            this.rewardTooltips.push(rewardTooltip);
            this.dailyItemsScrollView.addChild(rewardTooltip, 5);
        }
        var detailInfoNode = this._layout.getChildByName('DetailInfo');
        this.detailInfo = new WChallengeDetailInfo(detailInfoNode);

        var pClover = this._layout.getChildByName("pCloverInfo");
        this.pCloverInfo = new WChallengeCloverInfo();
        pClover.addChild(this.pCloverInfo);

        var pProgress = this._layout.getChildByName("pProgress");
        this.pCloverProgress = new WChallengeCloverProgress();
        pProgress.addChild(this.pCloverProgress);
        this.pCloverProgress.hideProgress(0);

        this.basicContainer = this._layout.getChildByName("BasicContainer");
        this.premiumContainer = this._layout.getChildByName("PremiumContainer");
    },

    showCloverProgress: function () {
        this.pCloverProgress.showProgress(0.5);
        this.pCloverProgress.updateInfo();
        this.dailyItemsScrollView.setVisible(false);
        this.basicContainer.setVisible(false);
        this.premiumContainer.setVisible(false);
        this.lockAnimation.setVisible(false);
    },

    hideCloverProgress: function () {
        this.pCloverProgress.hideProgress(0.5);
        this.dailyItemsScrollView.setVisible(true);
        this.basicContainer.setVisible(true);
        this.premiumContainer.setVisible(true);
        this.lockAnimation.setVisible(true);
    },

    showTooltip: function (id) {
        if(this.showingTooltipId >= 0) {
            if(this.hideTooltipTimeoutId) {
                if(this.showingTooltipId === id) {
                    return;
                }
                clearTimeout(this.hideTooltipTimeoutId);
                this.hideTooltipTimeoutId = null;
            }
            this.rewardTooltips[this.showingTooltipId].hide();
        }
        var scrollXPos = this.dailyItemsScrollView.getInnerContainerPosition().x;
        var itemOffset = -Math.round(scrollXPos / this.DAILY_ITEM_SPACE);
        this.rewardTooltips[id].show();
        this.showingTooltipId = id;
        this.hideTooltipTimeoutId = setTimeout(function(){
            this.rewardTooltips[this.showingTooltipId].hide();
            this.hideTooltipTimeoutId = null;
        }.bind(this), 5000);
    },
    choiceActiveItem: function (day) {
        var nbOfBasicRewards = WChallenge.getInstance().nbOfBasicRewards;
        for(var i = 0; i < nbOfBasicRewards; i++) {
            if(i + 1 === day) {
                this.dailyItems[i].setIsActive(true);
                this.dailyItems[i].setLocalZOrder(1);
            } else {
                this.dailyItems[i].setIsActive(false);
                this.dailyItems[i].setLocalZOrder(0);
            }

        }
        if(day === nbOfBasicRewards) {
            this.dailyItemsScrollView.innerWidth = this.dailyItemsViewBasicWidth + 8;
        } else {
            this.dailyItemsScrollView.innerWidth = this.dailyItemsViewBasicWidth;
        }
    },
    doActiveItemEffect: function () {
        if(this.didActiveItemEffect) {
            return;
        }
        var delayTime = WChallengePopup.getDelayAnimActiveItem();
        this.animationTimeoutId = setTimeout(function(){
            this.activeItemAnimation.setVisible(true);
            this.activeItemAnimation.getAnimation().gotoAndPlay("1", -1, -1 , 1);
        }.bind(this), delayTime * 1000);
        this.didActiveItemEffect = true;
    },
    setChallengeDay: function (day) {
        var wChallenge = WChallenge.getInstance();
        var isReceivedTodayReward = wChallenge.isReceivedTodayReward();
        this.detailInfo.updateChallengeDay(day);
        this.finalDayChoice.setVisible(false);
        if(day > wChallenge.nbOfBasicRewards) {
            // highlight final day
            this.finalDayChoice.setVisible(true);
            this.choiceActiveItem(day);
        }
        else {
            if (!isReceivedTodayReward) {
                this.choiceActiveItem(day);
                this.activeItemAnimation.setPosition(this.dailyItems[day - 1].x, this.dailyItems[day - 1].y);
                this.doActiveItemEffect();
            } else {
                if (day < wChallenge.nbOfBasicRewards) {
                    this.activeItemAnimation.setPosition(this.dailyItems[day].x, this.dailyItems[day].y);
                    this.choiceActiveItem(day + 1);
                    this.doActiveItemEffect();
                } else {
                    this.activeItemAnimation.setPosition(this.dailyItems[day - 1].x, this.dailyItems[day - 1].y);
                    this.choiceActiveItem(day);
                    this.doActiveItemEffect();
                }
            }
        }
        // update bars ui
        for(var i = 0; i < this.challengeBars.length; i++) {
            var challengeBar = this.challengeBars[i];
            var str = LocalizedString.to("WC_DAY_X");
            str = StringUtility.replaceAll(str, "@day", (i + 1).toString());
            challengeBar.setTitle(str);
            var activeIndex = day - 1;
            if(isReceivedTodayReward) {
                activeIndex += 1;
            }
            if(i < activeIndex) {
                challengeBar.setState(WChallengeBarItem.STATE.PASSED);
            } else
            if(i === activeIndex) {
                challengeBar.setState(WChallengeBarItem.STATE.ACTIVE);
                if(isReceivedTodayReward) {
                    challengeBar.setTitle(LocalizedString.to("WC_TOMORROW"));
                }
            } else {
                challengeBar.setState(WChallengeBarItem.STATE.NOT_YET_TIME);
            }
        }
    },
    doEffectShowUnlockBtn: function () {
        if(!this.firstRenderUnlockBtn) {
            this.lockAnimation.setVisible(true);
            this.unlockPremiumBtn.setVisible(true);
            return;
        }
        this.firstRenderUnlockBtn = false;
        this.lockAnimation.setScale(3);
        this.lockAnimation.setVisible(false);
        this.unlockPremiumBtn.setVisible(false);
        this.lockAnimation.runAction(cc.sequence(
            cc.delayTime(0.8),
            cc.callFunc(function(){
                this.lockAnimation.setVisible(true);
                this.unlockPremiumBtn.setVisible(true);
            }.bind(this)),
            cc.scaleTo(0.3, 1)
        ));
    },
    renderUserInfo: function () {
        var wChallenge = WChallenge.getInstance();
        if(!wChallenge.isConfigLoaded || !wChallenge.isUserInfoLoaded) {
            return;
        }
        // disable/enable buy unlock
        if(wChallenge.isPremium || wChallenge.isExchangedCloverGold === 1) {
            this.lockAnimation.setVisible(false);
            this.unlockPremiumBtn.setVisible(false);
        } else {
            this.doEffectShowUnlockBtn();
        }
        // render detail info
        this.detailInfo.setEndTimeToday(wChallenge.startTime + 86400 * wChallenge.challengeDay);
        this.setChallengeDay(wChallenge.challengeDay);

        this.updateRewardStates();
        // update progress of challenge bars
        for(var i = 0; i < this.challengeBars.length; i++) {
            var challengeBar = this.challengeBars[i];
            challengeBar.setProgress(wChallenge.taskProgresses[i]);
            challengeBar.setMaxProgress(wChallenge.tasksConfig[i].number);
        }
        // update gold and clover item reward
        for(var i = 0; i < this.challengeItems.length; i++) {
            this.rewardTooltips[i].setGoldVal(wChallenge.goldRewards[i]);
            this.rewardTooltips[i].setCloverVal(wChallenge.cloverRewards[i]);
            this.rewardTooltips[i].setDiamondVal(wChallenge.diamondRewards[i]);
        }
        this.pCloverInfo.updateInfo();
    },
    updateGoldInfo: function () {
        var userData = GameData.getInstance().userData;
        var currGold = (userData && userData.bean) || 0;
        this.setCurrGold(currGold);
        this.avatar.asyncExecuteWithUrl(userData.uID, userData.avatar);
    },
    updateRewardStates: function () {
        // update progress bars
        // update rewards
        var wChallenge = WChallenge.getInstance();
        for(var itemIndex = 0; itemIndex < this.challengeItems.length; itemIndex++) {
            if(itemIndex % 2 === 1 && !wChallenge.isPremium) {
                this.challengeItems[itemIndex].setState(CHALLENGE_ITEM_STATE.LOCKED);
                continue;
            }

            // set state from server to correspond state in client
            switch (wChallenge.rewardStates[itemIndex]) {
                case WChallenge.SERVER_REWARD_STATE.CANNOT_RECEIVE_REWARD:
                    if(Math.floor(itemIndex / 2) + 1 === wChallenge.challengeDay) {
                        this.challengeItems[itemIndex].setState(CHALLENGE_ITEM_STATE.ACTIVE)
                    } else if(Math.floor(itemIndex / 2) + 1 > wChallenge.challengeDay){
                        this.challengeItems[itemIndex].setState(CHALLENGE_ITEM_STATE.NOT_YET_TIME)
                    } else {
                        this.challengeItems[itemIndex].setState(CHALLENGE_ITEM_STATE.MISS);
                    }
                    break;
                case WChallenge.SERVER_REWARD_STATE.CAN_RECEIVE_REWARD:
                    this.challengeItems[itemIndex].setState(CHALLENGE_ITEM_STATE.CLAIM_REWARD);
                    break;
                case WChallenge.SERVER_REWARD_STATE.RECEIVED_REWARD:
                    this.challengeItems[itemIndex].setState(CHALLENGE_ITEM_STATE.DONE);
                    break;
                case WChallenge.SERVER_REWARD_STATE.MISS_REWARD:
                    this.challengeItems[itemIndex].setState(CHALLENGE_ITEM_STATE.MISS);
                    break;
            }
            // if(itemIndex % 2 === 1 && wChallenge.isPremium && wChallenge.isAnimatedUnlockPremium === 0) {
            //     this.challengeItems[itemIndex].doUnlockEffect();
            // }
        }
        if(wChallenge.isPremium && wChallenge.isAnimatedUnlockPremium === 0) {
            this.runAction(cc.sequence(
                cc.callFunc(function () {
                    var getRewardEffect = new WChallengeGetRewardEffect();
                    var worldOriPos = cc.p(cc.winSize.width/2, cc.winSize.height/2);
                    var worldGoldPos = this.getPositionGold();
                    var worldCloverPos = this.pCloverInfo.imgClover.getParent().convertToWorldSpace(this.pCloverInfo.imgClover.getPosition());
                    getRewardEffect.setOriPos(worldOriPos.x, worldOriPos.y);
                    getRewardEffect.setGoldPos(worldGoldPos.x, worldGoldPos.y);
                    getRewardEffect.setCloverPos(worldCloverPos.x, worldCloverPos.y);
                    getRewardEffect.setCloverVal(100);
                    getRewardEffect.setGoldVal(9600000);
                    this.addChild(getRewardEffect, 40);
                    getRewardEffect.doEffect(true);
                }.bind(this)),
                cc.delayTime(2),
                cc.callFunc(function () {
                    for(var itemIndex = 0; itemIndex < this.challengeItems.length; itemIndex++) {
                        if(itemIndex % 2 === 1 && wChallenge.isPremium && wChallenge.isAnimatedUnlockPremium === 0) {
                            this.challengeItems[itemIndex].doUnlockEffect();
                        }
                    }
                }.bind(this))
            ));
            var cmd = new CmdSendWChallengeAnimatedUnlockPremium();
            GameClient.getInstance().sendPacket(cmd);
            wChallenge.isAnimatedUnlockPremium = 1;
        }
    },
    setCurrGold: function (currGold) {
        this.currGold.setString(StringUtility.formatNumberSymbol(currGold));
    },

    getPositionGold: function () {
        var worldGoldPos = this.goldBar.getParent().convertToWorldSpace(cc.p(this.goldBar.x - this.goldBar.width/2 + 20, this.goldBar.y));
        return worldGoldPos;
    },

    close: function () {
        
        this._layout.runAction(
            cc.sequence(
                cc.scaleTo(0.35, 0.6*this._scaleRealX).easing(cc.easeBackIn(2.0)),
                cc.callFunc(function(){
                    this.removeFromParent();
                    var lobby = sceneMgr.getMainLayer();
                    if (lobby instanceof LobbyScene) {
                        lobby.setBackEnable(true);
                    }
                }.bind(this))
            )
        );
        try {
            gamedata.updateUserInfoNow();
        }
        catch (e) {

        }
    },
    onBack: function () {
        this.close();
    },
    onExit: function () {
        this._super();
        cc.eventManager.removeListener(this.loadConfigListener);
        cc.eventManager.removeListener(this.loadUserInfoListener);
        cc.eventManager.removeListener(this.updateGoldListener);
        if(this.hideTooltipTimeoutId) {
            clearTimeout(this.hideTooltipTimeoutId);
        }
        if(this.animationTimeoutId) {
            clearTimeout(this.animationTimeoutId);
        }
    }
});

WChallengePopup.getDelayAnimActiveItem = function () {
    var delayTime = 0.4;
    var wChallenge = WChallenge.getInstance();
    if(wChallenge.isPremium === 0) {
        delayTime = 1.5;
    }
    else if (wChallenge.isAnimatedUnlockPremium === 0) {
        delayTime = 2;
    }
    return delayTime;
};

CHALLENGE_ITEM_STATE = {
    DONE: 0,
    MISS: 1,
    ACTIVE: 2,
    CLAIM_REWARD: 3,
    NOT_YET_TIME: 4,
    LOCKED: 5
};

WChallengePopup.className = 'WChallengePopup';
