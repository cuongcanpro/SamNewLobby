WChallengeDetailInfo = cc.Class.extend({
    ctor: function (guiNode) {
        this.guiNode = guiNode;
        this.intervalTimeRemain = null;
        this.currProgressVal = -1;
        this.maxProgressVal = -1;
        this.isExchangingClover = false;
        this.initGUI();
        this.handlePlayNowBtn();
    },
    initGUI: function () {
        this.dailyDetail = this.guiNode.getChildByName('ChallengeDailyDetail');
        this.challengeEnded = this.guiNode.getChildByName('ChallengeEnded');
        this.challengeEnded.oldX = this.challengeEnded.x;
        this.playNowBtn = this.guiNode.getChildByName('PlayNowBtn');
        this.playNowPulseEff = new cc.Sprite('res/Event/WeeklyChallenge/Popup/Buttons/PlayNow.png');
        this.playNowPulseEff.setPosition(this.playNowBtn.x, this.playNowBtn.y);
        this.guiNode.addChild(this.playNowPulseEff, 10);
        this.playNowPulseEff.runAction(cc.sequence(
            cc.callFunc(function(){
                this.playNowPulseEff.setScale(1);
            }.bind(this)),
            cc.delayTime(3),
            cc.scaleTo(1, 1.4)
        ).repeatForever());
        this.playNowPulseEff.runAction(cc.sequence(
            cc.callFunc(function(){
                this.playNowPulseEff.opacity = 255;
            }.bind(this)),
            cc.delayTime(3),
            cc.fadeOut(1)
        ).repeatForever());
        this.getDailyRewardBtn = new ccui.Button('res/Event/WeeklyChallenge/Popup/Buttons/ClaimRewards.png');
        this.getDailyRewardBtn.setPosition(this.playNowBtn.x, this.playNowBtn.y);
        this.guiNode.addChild(this.getDailyRewardBtn, 10);
        this.timeRemain = this.guiNode.getChildByName('TimeRemainVal');
        this.timeRemain.oldX = this.timeRemain.x;
        this.timeRemain.oldY = this.timeRemain.y;
        this.middleTitle = this.dailyDetail.getChildByName('MiddleTitle');
        this.middleTitle.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.middleTitle.ignoreContentAdaptWithSize(true);

        this.panelGift = this.dailyDetail.getChildByName("panelGift");
        this.goldRewardVal = this.panelGift.getChildByName('GoldVal');
        this.goldRewardVal.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.goldRewardVal.ignoreContentAdaptWithSize(true);

        this.cloverRewardVal = this.panelGift.getChildByName('CloverVal');
        this.cloverRewardVal.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.cloverRewardVal.ignoreContentAdaptWithSize(true);

        this.diamondRewardVal = this.panelGift.getChildByName('DiamondVal');
        this.diamondRewardVal.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.diamondRewardVal.ignoreContentAdaptWithSize(true);

        this.leftTitle = this.dailyDetail.getChildByName('ChallengeTitle');
        this.leftTitle.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.leftTitle.ignoreContentAdaptWithSize(true);
        this.contentChallenge = this.dailyDetail.getChildByName('ChallengeContent');
        this.contentChallenge.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_Helve.ttf');
        this.contentChallenge.ignoreContentAdaptWithSize(true);
        this.archivedMainBar = this.dailyDetail.getChildByName('ArchivedMainBar');
        this.progressText = this.dailyDetail.getChildByName('ProgressTaskVal');
        this.progressText.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.progressText.ignoreContentAdaptWithSize(true);

        // day final end event message
        this.timeTitle = this.guiNode.getChildByName('TimeTitle');
        this.timeTitle.oldX = this.timeTitle.x;
        this.timeTitle.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_Helve.ttf');
        this.timeTitle.ignoreContentAdaptWithSize(true);
        this.timeRemain.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.timeRemain.ignoreContentAdaptWithSize(true);
        this.lowerEndEventTitle = this.challengeEnded.getChildByName('LowerEndEventTitle');
        this.lowerEndEventTitle.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.lowerEndEventTitle.ignoreContentAdaptWithSize(true);
        this.upperEndEventTitle = this.challengeEnded.getChildByName('UpperEndEventTitle');
        this.upperEndEventTitle.setFontName('res/Event/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.upperEndEventTitle.ignoreContentAdaptWithSize(true);
        this.claimRewardBtn = this.guiNode.getChildByName('ClaimRewards');

    },
    setIsExchangingClover: function (isExchangingClover) {
        this.isExchangingClover = isExchangingClover;
        this.updateChallengeDay();
    },
    handlePlayNowBtn: function () {
        this.playNowBtn.addTouchEventListener(function(render, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                var layer = SceneMgr.getInstance().getMainLayer();
                if(layer instanceof LobbyScene) {
                    if (CheckLogic.checkQuickPlay()) {
                        var pk = new CmdSendQuickPlay();
                        GameClient.getInstance().sendPacket(pk);
                        pk.clean();

                        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                    } else {
                        if (Math.floor(gamedata.timeSupport) > 0) {
                            var pk = new CmdSendGetSupportBean();
                            GameClient.getInstance().sendPacket(pk);
                            gamedata.showSupportTime = true;
                            pk.clean();
                        } else {
                            if (gamedata.checkEnablePayment()) {
                                var msg = LocalizedString.to("QUESTION_CHANGE_GOLD");
                                sceneMgr.showChangeGoldDialog(msg, this, function (buttonId) {
                                    if (buttonId == Dialog.BTN_OK) {
                                        gamedata.openShop();
                                    }
                                });
                            } else {
                                sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                            }
                        }
                    }
                }
            }
        }.bind(this))
    },

    setCurrProgress: function(currProgress) {
        this.currProgressVal = currProgress;
        this.updateProgress();
    },
    setMaxProgress: function(maxProgress) {
        this.maxProgressVal = maxProgress;
        this.updateProgress();
    },
    updateProgress: function () {
        if(this.currProgressVal < 0 || this.maxProgressVal <= 0 || this.currProgressVal > this.maxProgressVal) {
            return;
        }
        if(this.currProgressVal === this.maxProgressVal) {
            this.middleTitle.setString(LocalizedString.to("WC_RECEIVE"));
        } else {
            this.middleTitle.setString(LocalizedString.to("WC_COMPLETE_AND_RECEIVE"));
        }
        this.archivedMainBar.setScaleX(this.currProgressVal / this.maxProgressVal);
        this.progressText.setString(this.currProgressVal.toString() + '/' + this.maxProgressVal);
    },
    updateChallengeDay: function() {
        var wChallenge = WChallenge.getInstance();
        var day = wChallenge.challengeDay;
        var isReceivedTodayReward = wChallenge.isReceivedTodayReward();
        var taskIndex = 0;
        if(isReceivedTodayReward) {
            taskIndex = wChallenge.challengeDay;
        } else
        {
            taskIndex = wChallenge.challengeDay - 1;
        }
        if(!isReceivedTodayReward) {
            this.setContentChallenge(wChallenge.getTaskName(wChallenge.currTaskId, wChallenge.currMaxProgress));
            this.setCurrProgress(wChallenge.currProgress);
            this.setMaxProgress(wChallenge.currMaxProgress);
        } else {
            this.setContentChallenge(wChallenge.getTaskName(wChallenge.nextTaskId, wChallenge.nextMaxProgress));
            this.setCurrProgress(wChallenge.nextProgress);
            this.setMaxProgress(wChallenge.nextMaxProgress);
        }
        if(taskIndex < wChallenge.nbOfBasicRewards) {
            var goldReward = 0;
            var cloverReward = 0;
            var diamondReward = 0;
            if (this.currProgressVal !== this.maxProgressVal || wChallenge.rewardStates[taskIndex * 2] === WChallenge.SERVER_REWARD_STATE.CAN_RECEIVE_REWARD) {
                goldReward += wChallenge.goldRewards[taskIndex * 2];
                cloverReward += wChallenge.cloverRewards[taskIndex * 2];
                diamondReward += wChallenge.diamondRewards[taskIndex * 2];
            }
            if (wChallenge.isPremium === 1 &&
                (this.currProgressVal !== this.maxProgressVal ||
                    wChallenge.rewardStates[taskIndex * 2 + 1] === WChallenge.SERVER_REWARD_STATE.CAN_RECEIVE_REWARD)) {
                goldReward += wChallenge.goldRewards[taskIndex * 2 + 1];
                cloverReward += wChallenge.cloverRewards[taskIndex * 2 + 1];
                diamondReward += wChallenge.diamondRewards[taskIndex * 2 + 1];
            }
            this.setGoldReward(goldReward);
            this.setCloverReward(cloverReward);
            this.setDiamondReward(diamondReward);
        }
        this.timeTitle.setVisible(true);
        this.timeRemain.setVisible(true);
        if((day < wChallenge.nbOfBasicRewards && day > 0) || (!isReceivedTodayReward && day === wChallenge.nbOfBasicRewards)) {
            if(wChallenge.rewardStates[(day - 1) * 2] === WChallenge.SERVER_REWARD_STATE.CAN_RECEIVE_REWARD ||
                wChallenge.rewardStates[(day - 1) * 2 + 1] === WChallenge.SERVER_REWARD_STATE.CAN_RECEIVE_REWARD) {
                this.playNowBtn.setVisible(false);
                this.playNowPulseEff.setVisible(false);
                this.getDailyRewardBtn.setVisible(true);
                this.timeTitle.setString(LocalizedString.to("WC_TIME_REMAIN"));
                this.timeTitle.setPositionX(this.timeTitle.oldX);
                this.timeRemain.setPosition(this.timeRemain.oldX, this.timeRemain.oldY);
            } else {
                if (isReceivedTodayReward) {
                    this.timeTitle.setVisible(false);
                    this.timeRemain.setVisible(false);
                    this.timeTitle.runAction(cc.sequence(
                        cc.delayTime(0.5),
                        cc.callFunc(function () {
                            this.timeTitle.setVisible(true);
                            this.timeRemain.setVisible(true);
                            this.timeTitle.setString(LocalizedString.to("WC_TIME_START_NEXT_QUEST"));
                            this.timeTitle.setPositionX(this.playNowBtn.x);
                            this.timeRemain.setPosition(this.playNowBtn.x, this.playNowBtn.y + this.playNowBtn.height/3);
                        }.bind(this))
                    ));
                    this.playNowBtn.setVisible(false);
                    this.playNowPulseEff.setVisible(false);
                }
                else {
                    this.timeTitle.setString(LocalizedString.to("WC_TIME_REMAIN"));
                    this.timeTitle.setPositionX(this.timeTitle.oldX);
                    this.timeRemain.setPosition(this.timeRemain.oldX, this.timeRemain.oldY);
                    this.playNowBtn.setVisible(true);
                    this.playNowPulseEff.setVisible(true);
                }
                this.getDailyRewardBtn.setVisible(false);
            }
            this.dailyDetail.setVisible(true);

            this.claimRewardBtn.setVisible(false);
            this.challengeEnded.setVisible(false);

            var str = LocalizedString.to("WC_DAY_X_CHALLENGE");
            if(wChallenge.rewardStates[(day - 1) * 2] === WChallenge.SERVER_REWARD_STATE.RECEIVED_REWARD &&
                (wChallenge.rewardStates[(day - 1) * 2 + 1] === WChallenge.SERVER_REWARD_STATE.RECEIVED_REWARD || wChallenge.isPremium === 0)
            ) {
                str = StringUtility.replaceAll(str, "@day", (day + 1).toString());
            } else {
                str = StringUtility.replaceAll(str, "@day", day.toString());
            }
            this.leftTitle.setString(str);
        }
        else {
            this.playNowBtn.setVisible(false);
            this.playNowPulseEff.setVisible(false);
            this.dailyDetail.setVisible(false);
            this.getDailyRewardBtn.setVisible(false);

            this.claimRewardBtn.setVisible(true);
            this.challengeEnded.setVisible(true);
            var endEventText = "";
            if (day === wChallenge.nbOfBasicRewards) {
                // endEventText = LocalizedString.to("WC_RECEIVED_REWARD");
                // this.claimRewardBtn.setVisible(false);
                // this.timeTitle.setVisible(false);
                // this.timeRemain.setVisible(false);
                // this.timeTitle.runAction(cc.sequence(
                //     cc.delayTime(0.5),
                //     cc.callFunc(function () {
                //         this.timeTitle.setVisible(true);
                //         this.timeRemain.setVisible(true);
                //         this.timeTitle.setString(LocalizedString.to("WC_TIME_REMAIN_TO_RECEIVE_REWARD"));
                //         this.timeTitle.setPositionX(this.playNowBtn.x);
                //         this.timeRemain.setPosition(this.playNowBtn.x, this.playNowBtn.y + this.playNowBtn.height/3);
                //     }.bind(this))
                // ));
                // this.challengeEnded.setPositionX(this.challengeEnded.oldX);

                this.claimRewardBtn.setVisible(false);
                endEventText = LocalizedString.to("WC_RECEIVED_REWARD");
                this.timeTitle.setVisible(false);
                this.timeRemain.setVisible(false);
                this.challengeEnded.setPositionX(this.guiNode.x);
            }
            else if(day === wChallenge.nbOfBasicRewards + 1 && wChallenge.isExchangedCloverGold === 0 && !this.isExchangingClover && wChallenge.currClovers > 0) {
                this.claimRewardBtn.setVisible(true);
                endEventText = LocalizedString.to("WC_PRE_RECEIVE_REWARD");
                this.timeTitle.setString(LocalizedString.to("WC_TIME_REMAIN"));
                this.timeTitle.setPositionX(this.timeTitle.oldX);
                this.timeRemain.setPosition(this.timeRemain.oldX, this.timeRemain.oldY);
                this.challengeEnded.setPositionX(this.challengeEnded.oldX);
            } else {
                this.claimRewardBtn.setVisible(false);
                endEventText = LocalizedString.to("WC_RECEIVED_REWARD");
                this.timeTitle.setVisible(false);
                this.timeRemain.setVisible(false);
                this.challengeEnded.setPositionX(this.guiNode.x);
            }
            this.upperEndEventTitle.setString(endEventText.split(". ")[0]);
            this.lowerEndEventTitle.setString(endEventText.split(". ")[1]);
        }
    },
    setContentChallenge: function(content) {
        this.contentChallenge.setString(content);
    },
    setGoldReward: function(goldReward) {
        this.goldRewardVal.setString(StringUtility.formatNumberSymbol(goldReward));
    },
    setCloverReward: function(cloverReward) {
        this.cloverRewardVal.setString(cloverReward.toString());
    },
    setDiamondReward: function(diamondReward) {
        this.diamondRewardVal.setString(StringUtility.formatNumberSymbol(diamondReward));
    },
    setEndTimeToday: function (endTimestamp) {
        if(this.intervalTimeRemain !== null) {
            clearInterval(this.intervalTimeRemain)
        }
        this.updateTimeRemainGUI(endTimestamp);
        this.guiNode.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.callFunc(function(){
                this.updateTimeRemainGUI(endTimestamp)
            }.bind(this))
        ).repeatForever());
    },
    onWeekTimeout: function (cb) {
        this.timeoutCb = cb;
    },
    onClaimRewardFinalDay: function (cb) {
        this.callbackClaim = cb;
        this.claimRewardBtn.addTouchEventListener(function(render, eventType){
            if (WChallenge.getInstance().checkRewardNotReceive()) {
                Toast.makeToast(Toast.SHORT, localized("WC_NOT_RECEIVE_GIFT"));
                return;
            }
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                //cb();
                cc.log("vao day ne ");
                this.callbackClaim();
            }
        }.bind(this));
    },
    onClaimDailyRewards: function (cb) {
        this.getDailyRewardBtn.addTouchEventListener(function(render, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                this.getDailyRewardBtn.setVisible(false);
                cb();
            }
        }.bind(this));
    },
    updateTimeRemainGUI: function (endTimestamp) {
        var timeRemainSecondTotal = endTimestamp - Math.round(Date.now() / 1000);
        if(timeRemainSecondTotal < 0) {
            this.timeRemain.setString('00:00:00');
            var wChallenge = WChallenge.getInstance();
            wChallenge.inEvent = false;
            wChallenge.haveEvent = false;
            if(wChallenge.challengeDay) {
                if (this.timeoutCb) {
                    this.timeoutCb();
                }
            }
            return;
        }
        var timeRemainHour = (Math.floor(timeRemainSecondTotal / 3600)).toString();
        var timeRemainMinute = (Math.floor((timeRemainSecondTotal % 3600) / 60)).toString();
        var timeRemainSecond = (timeRemainSecondTotal % 60).toString();
        if(timeRemainHour.length === 1) {
            timeRemainHour = '0' + timeRemainHour;
        }
        if(timeRemainMinute.length === 1) {
            timeRemainMinute = '0' + timeRemainMinute;
        }
        if(timeRemainSecond.length === 1) {
            timeRemainSecond = '0' + timeRemainSecond;
        }
        var timeRemainStr = timeRemainHour + ':' + timeRemainMinute + ':' + timeRemainSecond;
        this.timeRemain.setString(timeRemainStr);

    }
});
