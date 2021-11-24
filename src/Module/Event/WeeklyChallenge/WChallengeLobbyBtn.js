WChallengeLobbyBtn = cc.Layer.extend({
    ctor: function (ctx, playerPosX, playerPosY) {
        this._super();
        this.ctx = ctx;
        this.isShowingTaskName = false;
        this.setPosition(cc.winSize.width/2, cc.winSize.height/2);
        this.anchorX = 0;
        this.anchorY = 0;
        this.day = -1;
        this.state = -1;
        this.currProgress = -1;
        this.maxProgress = -1;
        this.playerPosX = playerPosX;
        this.playerPosY = playerPosY;
        this.layerEffect = new cc.Node();
        this.addChild(this.layerEffect);
        this.layerEffect.setLocalZOrder(10);
        this.initGUI();
        this.setState(0);
        this.setDay(4);
    },
    setPlayerPos: function (playerPosX, playerPosY) {
        this.playerPosX = playerPosX;
        this.playerPosY = playerPosY;
    },
    onEnter: function () {
        this._super();
        this.layerEffect.removeAllChildren(true);
        var wChallenge = WChallenge.getInstance();
        if(!wChallenge.isInEvent()) {
            //this.setVisible(false);
        }
        this.isLayerExited = false;
        this.updateGUI();
        this.updateDataListener = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: WChallenge.EVENT.WCHALLENGE_UPDATE_DATA,
            callback: function(){
                this.updateGUI();
            }.bind(this)
        });
        cc.eventManager.addListener(this.updateDataListener, 1);
        if(this.ctx === WChallengeLobbyBtn.IN_GAME_CTX) {
            this.takeAllRewardListener = cc.EventListener.create({
                event: cc.EventListener.CUSTOM,
                eventName: WChallenge.EVENT.WCHALLENGE_TAKE_ALL_REWARD,
                callback: function(event){
                    var data = event.getUserData();
                    if (data.goldReceived <= 0 && data.cloverReceived <= 0) return;
                    this.doEffectGetAllReward(data.goldReceived, data.cloverReceived, data.diamondReceived);
                    this.setState(WChallengeLobbyBtn.CLEARED_STATE);
                }.bind(this)
            });
            cc.eventManager.addListener(this.takeAllRewardListener, 1);
        }

        if (wChallenge.delayGetConfigFlag) {
            wChallenge.loadUserInfo();
            wChallenge.delayGetConfigFlag = false;
        }
        if (wChallenge.delayOpenMainGuiFlag) {
            wChallenge.openMainGUI();
            wChallenge.delayOpenMainGuiFlag = false;
        }
    },
    initGUI: function () {
        // GUI for in challenge
        this.inChallengeLayer = new cc.Layer();
        this.inChallengeBg = new ccui.Button('res/Lobby/EventMgr/weeklyChallenge/Lobby/Background2.png');
        this.handleTouchBtn(this.inChallengeBg);
        this.inChallengeBg.setPosition(0, 0);
        this.inChallengeLayer.addChild(this.inChallengeBg, 0);
        this.titleInChallenge = new cc.Sprite('res/Lobby/EventMgr/weeklyChallenge/Lobby/WeeklyChallenge.png');
        this.titleInChallenge.setPosition(0, -this.inChallengeBg.height/4);
        this.inChallengeLayer.addChild(this.titleInChallenge, 5);
        this.taskUpperTitle = new ccui.Text('Scoop', SceneMgr.FONT_BOLD, 12);
        this.taskUpperTitle.setPosition(0, -5);
        this.taskUpperTitle.setColor(cc.color(252,234,194));
        this.taskUpperTitle.enableOutline(cc.color(247,90,75), 1);
        this.taskUpperTitle.setVisible(false);
        this.inChallengeLayer.addChild(this.taskUpperTitle, 5);
        this.taskLowerTitle = new ccui.Text('12 Straight', SceneMgr.FONT_BOLD, 14);
        this.taskLowerTitle.setPosition(0, -21);
        this.taskLowerTitle.setColor(cc.color(252,234,194));
        this.taskLowerTitle.enableOutline(cc.color(247,90,75), 1);
        this.taskLowerTitle.setVisible(false);
        this.inChallengeLayer.addChild(this.taskLowerTitle, 5);
        this.blankProgress = new cc.Sprite('res/Lobby/EventMgr/weeklyChallenge/Lobby/BlankProgress.png');
        this.blankProgress.setPosition(0, - this.inChallengeBg.height/2 - 8);
        this.inChallengeLayer.addChild(this.blankProgress, 10);
        this.archivedProgress = new ccui.LoadingBar('res/Lobby/EventMgr/weeklyChallenge/Lobby/ArchivedProgress.png');
        this.archivedProgress.setPosition(this.blankProgress.getPosition());
        this.inChallengeLayer.addChild(this.archivedProgress, 11);

        // GUI for claim reward
        var claimText = LocalizedString.to("WC_CLAIM_REWARD").split(" ");
        if (!WChallenge.getInstance().isFinishDownload)
            claimText = "Nhan thuong";
        this.claimRewardLayer = new cc.Layer();
        this.claimRewardBg = new ccui.Button('res/Lobby/EventMgr/weeklyChallenge/Lobby/Background2.png');
        this.handleTouchBtn(this.claimRewardBg);
        this.claimRewardBg.setPosition(0, 0);
        this.claimRewardLayer.addChild(this.claimRewardBg, 0);
        this.claimRewardUpperTitle = new ccui.Text(claimText[0], SceneMgr.FONT_BOLD, 15);
        this.claimRewardUpperTitle.setColor(cc.color(252,234,194));
        this.claimRewardUpperTitle.enableOutline(cc.color(247,90,75), 1);
        this.claimRewardUpperTitle.setPosition(0, -3);
        this.claimRewardLowerTitle = new ccui.Text(claimText[1], SceneMgr.FONT_BOLD, 15);
        this.claimRewardLowerTitle.setColor(cc.color(252,234,194));
        this.claimRewardLowerTitle.enableOutline(cc.color(247,90,75), 1);
        this.claimRewardLowerTitle.setPosition(0, -this.claimRewardBg.height/4 - 2);
        this.claimRewardLayer.addChild(this.claimRewardUpperTitle, 5);
        this.claimRewardLayer.addChild(this.claimRewardLowerTitle, 5);


        // GUI for cleared challenge
        this.clearedLayer = new cc.Layer();
        this.clearedBg = new ccui.Button('res/Lobby/EventMgr/weeklyChallenge/Lobby/Background1.png');
        this.handleTouchBtn(this.clearedBg);
        this.clearedLayer.addChild(this.clearedBg, 0);
        this.clearedLowerTitle = new cc.Sprite('res/Lobby/EventMgr/weeklyChallenge/Lobby/Cleared.png');
        this.clearedLowerTitle.setScale(0.7);
        this.clearedLowerTitle.setPosition(0, -this.clearedBg.height/4 - 5);
        this.clearedLayer.addChild(this.clearedLowerTitle, 5);
        this.clearedUpperTitle = new ccui.Text('Day 2', SceneMgr.FONT_BOLD, 12);
        this.clearedUpperTitle.setColor(cc.color(252,234,194));
        this.clearedUpperTitle.color = new cc.Color(200, 255, 200, 255);
        this.clearedLayer.addChild(this.clearedUpperTitle, 5);

        this.addChild(this.inChallengeLayer, 0);
        this.addChild(this.claimRewardLayer, 0);
        this.addChild(this.clearedLayer, 0);

        // effect when take reward
    },
    updateGUI: function () {

        var wChallenge = WChallenge.getInstance();
        if (!wChallenge.isFinishDownload) {
            return;
        }

        if(!wChallenge.isUserInfoLoaded || !wChallenge.isConfigLoaded) {
            return;
        }

        this.setDay(wChallenge.challengeDay);

        if(wChallenge.challengeDay === wChallenge.nbOfBasicRewards + 1) {
            cc.log("VO DAY NE WC 1 ");
            if (wChallenge.checkRewardNotReceive()) {
                this.setState(WChallengeLobbyBtn.CLAIM_REWARD_STATE);
            }
            else if(wChallenge.isExchangedCloverGold === 1) {
                this.setState(WChallengeLobbyBtn.CLEARED_STATE);
            } else {
                this.setState(WChallengeLobbyBtn.CLAIM_REWARD_STATE);
            }
            return;
        }
        if(wChallenge.currProgress < wChallenge.currMaxProgress) {
            cc.log("VO DAY NE WC 2 " + wChallenge.checkRewardNotReceive());
            if (wChallenge.checkRewardNotReceive()) {
                this.setState(WChallengeLobbyBtn.CLAIM_REWARD_STATE);
            }
            else {
                this.setState(WChallengeLobbyBtn.IN_CHALLENGE_STATE);
            }
            this.setCurrProgress(wChallenge.currProgress);
            this.setMaxProgress(wChallenge.currMaxProgress);
        } else {
            // if((wChallenge.rewardStates[(this.day - 1) * 2] !== WChallenge.SERVER_REWARD_STATE.RECEIVED_REWARD) ||
            //     (
            //         wChallenge.rewardStates[(this.day - 1) * 2 + 1] !== WChallenge.SERVER_REWARD_STATE.RECEIVED_REWARD
            //         && wChallenge.isPremium === 1
            //     )
            // )
            cc.log("CHAY VO CHECK REWARD " + wChallenge.checkRewardNotReceive());
            if (wChallenge.checkRewardNotReceive())
            {
                this.setState(WChallengeLobbyBtn.CLAIM_REWARD_STATE);
            }
            else {
                this.setState(WChallengeLobbyBtn.CLEARED_STATE);
            }
        }
        if(this.updateNameTaskId) {
            clearInterval(this.updateNameTaskId);
        }
        if(this.state === WChallengeLobbyBtn.IN_CHALLENGE_STATE) {
            var taskNameSplit = LocalizedString.to(wChallenge.getKeyTask(wChallenge.currTaskId)).split(' @num ');
            if(taskNameSplit.length > 1) {
                this.taskUpperTitle.setString(taskNameSplit[0]);
                if (taskNameSplit[0].length > 6) {
                    this.taskUpperTitle.setFontSize(12);
                }
                this.taskLowerTitle.setString(StringUtility.replaceAll(' @num ' + taskNameSplit.slice(1).join(' '), "@num", wChallenge.currMaxProgress));
            }
            this.updateNameTaskId = setInterval(function(){
                this.isShowingTaskName = !this.isShowingTaskName;
                if (this.isShowingTaskName) {
                    this.taskUpperTitle.setVisible(true);
                    this.taskLowerTitle.setVisible(true);
                    this.titleInChallenge.setVisible(false);
                } else {
                    this.taskUpperTitle.setVisible(false);
                    this.taskLowerTitle.setVisible(false);
                    this.titleInChallenge.setVisible(true);
                }
                // effect
                var effAction = cc.sequence(
                    cc.scaleTo(0.1, 1.15),
                    cc.scaleTo(0.1, 1)
                );
                this.inChallengeBg.runAction(effAction.clone());
                this.taskUpperTitle.runAction(effAction.clone());
                this.taskLowerTitle.runAction(effAction.clone());
                this.titleInChallenge.runAction(effAction.clone());
            }.bind(this), 3000);
        }
    },
    takeAllRewardEffect: function (goldReceived, cloverReceived) {


    },
    handleTouchBtn: function(btn) {
        btn.setScale9Enabled(false);
        btn.setZoomScale(0);
        btn.addTouchEventListener(function(render, eventType){
            if(eventType === ccui.Widget.TOUCH_CANCELED || eventType === ccui.Widget.TOUCH_ENDED) {
                this.setScale(1);
            }
            if(eventType === ccui.Widget.TOUCH_BEGAN) {
                if(this.ctx !== WChallengeLobbyBtn.IN_GAME_CTX || this.state !== WChallengeLobbyBtn.CLEARED_STATE) {
                    this.setScale(1.1);
                }
            }
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                if(this.ctx === WChallengeLobbyBtn.LOBBY_CTX) {
                    WChallenge.getInstance().openMainGUI();
                }
                if(this.ctx === WChallengeLobbyBtn.IN_GAME_CTX) {
                    if(this.state === WChallengeLobbyBtn.CLAIM_REWARD_STATE) {
                        this.handleClaimRewardInGame();
                    }
                }
            }
        }.bind(this), this);
    },
    setState: function (state) {
        this.setRotation(0);
        this.setScale(1);
        if(this.claimRewardAction1) {
            this.stopAction(this.claimRewardAction1);
            this.claimRewardAction1 = null;
        }
        if(this.claimRewardAction2) {
            this.stopAction(this.claimRewardAction2);
            this.claimRewardAction2 = null;
        }
        if(state === WChallengeLobbyBtn.CLAIM_REWARD_STATE) {
            this.claimRewardAction1 = cc.sequence(
                cc.rotateTo(0.1, -10),
                cc.rotateTo(0.1, 10),
                cc.rotateTo(0.1, 0),
                cc.delayTime(1)
            );
            this.claimRewardAction2 = cc.sequence(
                cc.scaleTo(0.1, 0.95),
                cc.scaleTo(0.1, 1.1),
                cc.scaleTo(0.1, 1),
                cc.delayTime(1)
            );
            this.runAction(this.claimRewardAction1.repeatForever());
            this.runAction(this.claimRewardAction2.repeatForever());
        }
        if(this.state === state) {
            return;
        }
        this.state = state;
        this.clearedLayer.setVisible(false);
        this.claimRewardLayer.setVisible(false);
        this.inChallengeLayer.setVisible(false);
        if(this.state === WChallengeLobbyBtn.CLEARED_STATE) {
            this.clearedLayer.setVisible(true);
        }
        if(this.state === WChallengeLobbyBtn.CLAIM_REWARD_STATE) {
            this.claimRewardLayer.setVisible(true);
        }
        if(this.state === WChallengeLobbyBtn.IN_CHALLENGE_STATE) {
            this.inChallengeLayer.setVisible(true);
        }
    },
    doEffectGetAllReward: function (goldReward, cloversReward, diamondReward) {
        cc.log(" doEffectGetAllReward " + goldReward + " , " + cloversReward + " , " + diamondReward);
        var playerNodePos = this.convertToNodeSpace(cc.p(this.playerPosX, this.playerPosY));
        var oriGoldReward = goldReward;
        var oriCloversReward = cloversReward;
        var oriDiamondReward = diamondReward; // fake Effect Diamond
        if (diamondReward > 0)
            diamondReward = 100;
        setTimeout(function(){
            if(this.isLayerExited) {
                return;
            }
            var valRewardEff = new WChallengeGetRewardEffect();
            valRewardEff.setGoldVal(oriGoldReward);
            valRewardEff.setCloverVal(oriCloversReward);
            valRewardEff.setDiamondVal(oriDiamondReward);
            this.layerEffect.addChild(valRewardEff, 100);
            valRewardEff.setOriPos(this.playerPosX, this.playerPosY);
            valRewardEff.doFlyUpEffect(true);
        }.bind(this), 2000);
        var self = this;
        function goldFlyEff() {
            if(self.isLayerExited) {
                return;
            }
            var goldIcon = new cc.Sprite('res/EventMgr/WeeklyChallenge/Popup/Icons/GoldIcon.png');
            goldIcon.setPosition(-30, -50);
            self.layerEffect.addChild(goldIcon, 100);
            goldIcon.runAction(cc.sequence(
                cc.moveTo(0.8, playerNodePos.x, playerNodePos.y),
                cc.callFunc(function(){
                    goldIcon.removeFromParent();
                }.bind(this))
            ));
            if(goldReward >= 10000) {
                goldReward -= Math.round(goldReward * 0.3);
            } else if (goldReward > 0) {
                goldReward -= 3000;
            }
            if(goldReward > 0) {
                setTimeout(goldFlyEff, 100);
            }
        }
        goldFlyEff();
        function cloverFlyEff() {
            if(self.isLayerExited) {
                return;
            }
            var cloverIcon = new cc.Sprite('res/EventMgr/WeeklyChallenge/Popup/Icons/CloverIcon.png');
            cloverIcon.setPosition(30, -50);
            self.addChild(cloverIcon, 100);
            cloverIcon.runAction(cc.sequence(
                cc.moveTo(0.8, playerNodePos.x, playerNodePos.y),
                cc.callFunc(function(){
                    cloverIcon.removeFromParent();
                }.bind(this))
            ));
            if(cloversReward >= 10) {
                cloversReward -= Math.round(cloversReward * 0.3);
            } else if (cloversReward > 3) {
                cloversReward -= 3;
            } else {
                cloversReward -= 1;
            }
            if(cloversReward > 0) {
                setTimeout(cloverFlyEff, 100);
            }
        }
        cloverFlyEff();

        function diamondFlyEff() {
            if(self.isLayerExited) {
                return;
            }
            var cloverIcon = new cc.Sprite('res/EventMgr/WeeklyChallenge/Popup/Icons/iconDiamond.png');
            cloverIcon.setPosition(50, -50);
            self.addChild(cloverIcon, 100);
            cloverIcon.runAction(cc.sequence(
                cc.moveTo(0.8, playerNodePos.x, playerNodePos.y),
                cc.callFunc(function(){
                    cloverIcon.removeFromParent();
                }.bind(this))
            ));
            if(diamondReward >= 10) {
                diamondReward -= Math.round(diamondReward * 0.3);
            } else if (diamondReward > 3) {
                diamondReward -= 3;
            } else {
                diamondReward -= 1;
            }
            if(diamondReward > 0) {
                setTimeout(diamondFlyEff, 100);
            }
        }
        if (diamondReward > 0)
            diamondFlyEff();
    },
    handleClaimRewardInGame: function () {
        if (WChallenge.getInstance().claimRewardInGameFlag) {
            Toast.makeToast(Toast.LONG, LocalizedString.to("WC_CLAIM_REWARD_AFTER_END_GAME"));
        }
        else {
            var cmd = new CmdSendWChallengeTakeAllReward();
            GameClient.getInstance().sendPacket(cmd);
        }
    },
    setCurrProgress: function (progress) {
        this.currProgress = progress;
        this.updateProgressBar();
    },
    setMaxProgress: function(progress) {
        this.maxProgress = progress;
        this.updateProgressBar();
    },
    updateProgressBar: function () {
        if(this.currProgress < 0 || this.maxProgress < 0) {
            return;
        }
        var scale = this.currProgress / this.maxProgress;
        if(scale > 1) {
            scale = 1;
        }
        this.archivedProgress.setPercent(scale * 100);
    },
    setDay: function (day) {
        if(day === this.day) {
            return;
        }
        this.day = day;
        var str = LocalizedString.to("WC_DAY_X");
        str = StringUtility.replaceAll(str, "@day", day.toString());
        this.clearedUpperTitle.setString(str);
    },
    onExit: function () {
        this._super();
        this.isLayerExited = true;
        if(this.updateDataListener) {
            cc.eventManager.removeListener(this.updateDataListener);
        }
        if(this.ctx === WChallengeLobbyBtn.IN_GAME_CTX && this.takeAllRewardListener) {
            cc.eventManager.removeListener(this.takeAllRewardListener);
        }
        if(this.updateNameTaskId) {
            clearInterval(this.updateNameTaskId);
        }
        this.claimRewardAction1 = null;
        this.claimRewardAction2 = null;
    }
});
WChallengeLobbyBtn.className = "WChallengeLobbyBtn";
WChallengeLobbyBtn.CLEARED_STATE = 2;
WChallengeLobbyBtn.CLAIM_REWARD_STATE = 1;
WChallengeLobbyBtn.IN_CHALLENGE_STATE = 0;

WChallengeLobbyBtn.LOBBY_CTX = 0;
WChallengeLobbyBtn.IN_GAME_CTX = 1;
