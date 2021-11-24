WChallengeItem = cc.Class.extend({
    ctor: function (guiNode, id) {
        this.guiNode = guiNode;
        this.id = id;
        this.isPremium = id % 2 === 1;
        this.state = -1;
        this.id2goiVangLevel = {
            0: 1,
            1: 11,
            2: 1,
            3: 22,
            4: 2,
            5: 33,
            6: 2,
            7: 4,
            8: 2,
            9: 5,
            10: 3,
            11: 5,
            12: 3,
            13: 6
        };
        this.goiVangLevel = this.id2goiVangLevel[id];
        this.onTouchEndCbs = [];
        this.clovers = -1;
        this.initGUI();
        this.handleBtnGetReward();
    },
    setGold: function(gold) {
        this.gold = gold;
    },
    setClovers: function(clovers) {
        this.clovers = clovers;
        var goiVangLevel = this.id2goiVangLevel[this.id];
        if(!this.goiVangLevel) {
            if(this.clovers < 3) {
                goiVangLevel = 1;
            } else if (this.clovers < 6) {
                goiVangLevel = 2;
            } else if (this.clovers < 25) {
                goiVangLevel = 3;
            } else if (this.clovers < 30) {
                goiVangLevel = 4;
            } else if (this.clovers < 50) {
                goiVangLevel = 5;
            } else {
                goiVangLevel = 6;
            }
        }
        var spriteGoiVangLink = 'res/EventMgr/WeeklyChallenge/Popup/GoiVang/GoiVang' + goiVangLevel + '.png';
        this.goiVangButton.loadTextures(spriteGoiVangLink, spriteGoiVangLink, spriteGoiVangLink);
    },
    initGUI: function () {
        this.blurNormalBg = this.guiNode.getChildByName('BlurNormalBg');
        this.activeBg = this.guiNode.getChildByName('ActiveBg');
        this.goiVangButton = this.guiNode.getChildByName('GoiVangBtn');
        this.shiningBg = this.guiNode.getChildByName('Shining');
        this.shiningBg.runAction(cc.rotateBy(8, 360).repeatForever());
        this.tickIcon = this.guiNode.getChildByName('TickIcon');
        this.lockIcon = this.guiNode.getChildByName('LockIcon');
        this.failedIcon = this.guiNode.getChildByName('FailedIcon');
    },
    handleBtnGetReward: function () {

        this.goiVangButton.addTouchEventListener(function(render, eventType){

            if(eventType === ccui.Widget.TOUCH_ENDED) {
                for(var i in this.onTouchEndCbs) {
                    this.onTouchEndCbs[i]();
                }
            }
            if(this.state !== CHALLENGE_ITEM_STATE.CLAIM_REWARD) {
                return;
            }
            switch (eventType) {
                case ccui.Widget.TOUCH_BEGAN:
                    this.goiVangButton.setScale(1.1);
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                    this.goiVangButton.setScale(1);
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    this.goiVangButton.setScale(1);
                    this.getReward();
            }
        }.bind(this));
    },
    getReward: function () {
        var cmd = new CmdSendWChallengeGetReward();
        cc.log("ID REWARD " + this.id);
        cmd.putData(this.id);
        this.goiVangButton.setEnabled(false);
        this.guiNode.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(function(){
                this.goiVangButton.setEnabled(true);
            }.bind(this))
        ));
        // wait for animation
        setTimeout(function(){
            GameClient.getInstance().sendPacket(cmd);
        }.bind(this), 1300);
    },
    onTouchEnd: function (cb) {
        this.onTouchEndCbs.push(cb);
    },
    setState: function(state) {
        if(this.state === state) {
            return;
        }
        this.state = state;
        this.tickIcon.setVisible(false);
        this.failedIcon.setVisible(false);
        this.lockIcon.setVisible(false);
        this.shiningBg.setVisible(false);
        switch(this.state) {
            case CHALLENGE_ITEM_STATE.DONE:
                this.tickIcon.setVisible(true);
                break;
            case CHALLENGE_ITEM_STATE.MISS:
                this.failedIcon.setVisible(true);
                break;
            case CHALLENGE_ITEM_STATE.CLAIM_REWARD:
                this.shiningBg.setVisible(true);
                break;
            case CHALLENGE_ITEM_STATE.LOCKED:
                this.doLockEffect();
                break;
        }
        this.updateBgTexture();
    },
    doUnlockEffect: function () {
        this.lockIcon.setVisible(true);
        this.tickIcon.setVisible(false);
        this.failedIcon.setVisible(false);
        this.shiningBg.setVisible(false);
        var currState = this.state;
        this.state = -1;
        var rightRotate = cc.rotateBy(0.02, 6);
        var leftRotate = cc.rotateBy(0.02, -6);
        var restoreState = cc.callFunc(function(){
            this.setState(currState);
        }.bind(this));
        var rotateAction = cc.sequence(
            leftRotate,
            rightRotate,
            rightRotate,
            leftRotate
        ).repeat(9);
        this.lockIcon.runAction(rotateAction);
        this.lockIcon.runAction(cc.scaleTo(0.8, 1.8));
        this.lockIcon.runAction(cc.sequence(cc.fadeOut(2), restoreState));
    },
    doLockEffect: function () {
        var jumpEff = cc.jumpBy(0.3, cc.p(0, 0), 35, 1);
        var delayEff = cc.delayTime(this.id * 0.05);
        var showLockEff = cc.callFunc(function(){this.lockIcon.setVisible(true);}.bind(this));
        this.lockIcon.runAction(cc.sequence(delayEff, showLockEff, jumpEff));
    },
    updateBgTexture: function () {
        if(this.state === CHALLENGE_ITEM_STATE.ACTIVE || this.state === CHALLENGE_ITEM_STATE.CLAIM_REWARD) {
            this.activeBg.setVisible(true);
            this.blurNormalBg.setVisible(false);
        } else {
            this.blurNormalBg.setVisible(true);
            this.activeBg.setVisible(false);
        }
    }
});

WChallengeItemTooltip = cc.Layer.extend({
    ctor: function () {
        this._super();
        var jsonLayout = ccs.load('res/EventMgr/WeeklyChallenge/WeeklyChallengeTooltipItem.json');
        this._layout = jsonLayout.node;
        this.addChild(this._layout);
        this.initGUI();
        this.anchorX = -0.1;
        this.anchorY = -0.1;
        this.setVisible(false);
        this.isShowing = false;
    },
    initGUI: function () {
        this.tooltip = this._layout.getChildByName('Tooltip');
        this.tooltip1 = this._layout.getChildByName('Tooltip1');
        this.panelGift = this._layout.getChildByName('PanelGift');

        this.goldText = this.panelGift.getChildByName('GoldText');
        this.goldText.setFontName('res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.goldText.ignoreContentAdaptWithSize(true);

        this.cloverText = this.panelGift.getChildByName('CloverText');
        this.cloverText.setFontName('res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.cloverText.ignoreContentAdaptWithSize(true);

        this.diamondText = this.panelGift.getChildByName('DiamondText');
        this.diamondText.setFontName('res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.diamondText.ignoreContentAdaptWithSize(true);

        this.plusSign = this.panelGift.getChildByName('PlusSign');
        this.plusSign.setFontName('res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.plusSign.ignoreContentAdaptWithSize(true);

        this.plusSign0 = this.panelGift.getChildByName('PlusSign_0');
        this.plusSign0.setFontName('res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.plusSign0.ignoreContentAdaptWithSize(true);

        this.iconDiamond = this.panelGift.getChildByName('DiamondIcon');

    },
    show: function () {
        if(this.isShowing) return;
        this.isShowing = true;
        this.setVisible(true);
        this.setScale(0.2);
        this.runAction(cc.scaleTo(0.2, 1).easing(cc.easeBackOut(2.0)));
    },
    hide: function () {
        if(this.isShowing === false) return;
        this.setScale(1);
        this.runAction(cc.sequence(
            cc.scaleTo(0.2, 0.2).easing(cc.easeBackIn(2.0)),
            cc.callFunc(function(){
                this.setVisible(false);
                this.isShowing = false;
            }.bind(this))
        ));
    },
    setGoldVal: function (amount) {
        this.goldText.setString(StringUtility.formatNumberSymbol(amount));
    },
    setCloverVal: function (amount) {
        this.cloverText.setString(StringUtility.formatNumberSymbol(amount));
    },
    setDiamondVal: function (amount) {
        if (amount > 0) {
            this.diamondText.setString(StringUtility.formatNumberSymbol(amount));
            this.diamondText.setVisible(true);
            this.iconDiamond.setVisible(true);
            this.plusSign0.setVisible(true);
            this.tooltip.setVisible(false);
            this.tooltip1.setVisible(true);
            this.panelGift.setPositionX(-this.panelGift.getContentSize().width * 0.5);
        }
        else {
            this.diamondText.setVisible(false);
            this.iconDiamond.setVisible(false);
            this.plusSign0.setVisible(false);
            this.tooltip.setVisible(true);
            this.tooltip1.setVisible(false);
            this.panelGift.setPositionX(-this.panelGift.getContentSize().width * 0.33);
        }
    }
});

WChallengeBarItem  = cc.Layer.extend({
    ctor: function (guiNode) {
        this._super();
        this.guiNode = guiNode;
        this.state = -1;
        this.progress = -1;
        this.maxProgress = -1;
        this.initGUI();
        this.setState(2);
    },
    initGUI: function () {
        this.bar = this.guiNode.getChildByName('ArchivedDailyBar');
        this.title = this.guiNode.getChildByName('BarTitle');
        this.title.setFontName('res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold_Italic.ttf');
        this.title.ignoreContentAdaptWithSize(true);
    },
    setTitle: function (text) {
        this.title.setString(text);
    },
    setProgress: function (val) {
        if(val === this.progress) {
            return;
        }
        this.progress = val;
        this.updateProgressUI();

    },
    setMaxProgress: function (val) {
        if(val === this.maxProgress) {
            return;
        }
        this.maxProgress = val;
        this.updateProgressUI();
    },
    updateProgressUI: function () {
        if(this.progress < 0 || this.maxProgress < 0) {
            return;
        }
        this.bar.setScaleX(Math.min(this.progress / this.maxProgress, 1));
    },
    setState: function (state) {
        if(this.state === state) {
            return;
        }
        this.state = state;
        if(this.state === WChallengeBarItem.STATE.PASSED) {
            this.bar.setVisible(true);
            this.bar.setOpacity(100);
            this.title.color = new cc.Color(56, 150, 38, 255);
            this.title.setOpacity(200);
        }
        if(this.state === WChallengeBarItem.STATE.ACTIVE) {
            this.bar.setVisible(true);
            this.bar.setOpacity(255);
            this.title.color = new cc.Color(255, 255, 255, 255);
            this.title.setOpacity(255);
        }
        if(this.state === WChallengeBarItem.STATE.NOT_YET_TIME) {
            this.bar.setVisible(false);
            this.title.color = new cc.Color(200, 200, 200, 255);
            this.title.setOpacity(80);
        }
    }
});

WChallengeBarItem.STATE = {
    PASSED: 0,
    ACTIVE: 1,
    NOT_YET_TIME: 2
};

WChallengeAsidePopup = cc.Class.extend({
    ctor: function (guiNode) {
        this.guiNode = guiNode;
        this.isActive = -1;
        this.initGUI();
        // this.isShowingTooltip = false;
        // this.pnTooltip.setVisible(false);
        // this.setActive(0);
    },
    initGUI: function () {
        this.youHaveText = this.guiNode.getChildByName('YouHave');
        this.youHaveText.setFontName('res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold_Italic.ttf');
        this.youHaveText.ignoreContentAdaptWithSize(true);
        this.finalTextText = this.guiNode.getChildByName('FinalDay');
        var str = LocalizedString.to("WC_DAY_X");
        str = StringUtility.replaceAll(str, "@day", (WChallenge.getInstance().nbOfBasicRewards + 1).toString());
        this.finalTextText.setString(str);
        this.finalTextText.setFontName('res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold_Italic.ttf');
        this.finalTextText.ignoreContentAdaptWithSize(true);
        this.tickIcon = this.guiNode.getChildByName('TickIcon');
        this.currClover = this.guiNode.getChildByName('CurrCloverVal');
        this.imgClover = this.guiNode.getChildByName("imgClover");
        this.currClover.setFontName('res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.currClover.ignoreContentAdaptWithSize(true);
        this.currGoldExchanged = this.guiNode.getChildByName('CurrGoldExchanged');
        this.currGoldExchanged.setFontName('res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold.ttf');
        this.currGoldExchanged.ignoreContentAdaptWithSize(true);
        this.cloverExchange = this.guiNode.getChildByName('CloverExchange');
        this.nodeArrow = this.guiNode.getChildByName("nodeArrow");
        this.imgArrow = new cc.ProgressTimer(new cc.Sprite("res/EventMgr/WeeklyChallenge/Popup/arrow.png"));
        this.imgArrow.type = cc.ProgressTimer.TYPE_BAR;
        this.imgArrow.midPoint = cc.p(0.5, 1);
        this.imgArrow.barChangeRate = cc.p(0, 1);
        this.nodeArrow.addChild(this.imgArrow);
        this.imgArrow.runAction(cc.sequence(
            cc.progressTo(0.7, 100),
            cc.callFunc(function () {
                this.imgArrow.midPoint = cc.p(0.5, 0);
            }.bind(this)),
            cc.progressTo(0.5, 0),
            cc.callFunc(function () {
                this.imgArrow.midPoint = cc.p(0.5, 1);
            }.bind(this))
        ).repeatForever());

        // this.pnTooltip = this.guiNode.getChildByName("pnTooltip");
        // this.tooltipText = this.pnTooltip.getChildByName("lblTooltip");
        // this.tooltipText.setFontName("res/EventMgr/WeeklyChallenge/Fonts/UTM_Helve.ttf");
        // this.tooltipText.ignoreContentAdaptWithSize(true);
        // this.cloverText = this.pnTooltip.getChildByName("cloverText");
        // this.cloverText.setFontName("res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold.ttf");
        // this.cloverText.ignoreContentAdaptWithSize(true);
        // this.goldText = this.pnTooltip.getChildByName("goldText");
        // this.goldText.setFontName("res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold.ttf");
        // this.goldText.ignoreContentAdaptWithSize(true);
        // this.equalSign = this.pnTooltip.getChildByName("equalSign");
        // this.equalSign.setFontName("res/EventMgr/WeeklyChallenge/Fonts/UTM_HelveBold.ttf");
        // this.equalSign.ignoreContentAdaptWithSize(true);
        // this.btnShowTooltip = this.guiNode.getChildByName("btnTooltip");
        // this.btnShowTooltip.addTouchEventListener((render, eventType) => {
        //     switch (eventType) {
        //         case ccui.Widget.TOUCH_BEGAN:
        //             break;
        //         case ccui.Widget.TOUCH_CANCELED:
        //             break;
        //         case ccui.Widget.TOUCH_ENDED:
        //             if (this.isShowingTooltip)  this.hideTooltip();
        //             else this.showTooltip();
        //             break;
        //         default: break;
        //     }
        // })
    },
    setState: function (state) {
        if(state === this.state) {
            return;
        }
        this.state = state;
        this.tickIcon.setVisible(false);
        switch(this.state) {
            case WChallengeAsidePopup.STATE.NORMAL:
                this.cloverExchange.setVisible(true);
                break;
            case WChallengeAsidePopup.STATE.ACTIVE:
                this.cloverExchange.setVisible(false);
                break;
            case WChallengeAsidePopup.STATE.SELECTED:
                this.cloverExchange.setVisible(false);
                break;
            case WChallengeAsidePopup.STATE.ENED:
                this.cloverExchange.setVisible(false);
                this.tickIcon.setVisible(true);
                break;
        }
    },
    setCurrClover: function (clover) {
        this.currClover.setString(StringUtility.formatNumberSymbol(clover));
        var goldExchanged = WChallenge.getInstance().goldPerClover * clover;
        this.currGoldExchanged.setString(StringUtility.formatNumberSymbol(goldExchanged));
        // this.imgClover.setPositionX(this.youHaveText.x + this.currClover.getVirtualRendererSize().width/2);
        this.currClover.setPositionX(this.imgClover.getPositionX() - this.imgClover.getContentSize().width * 0.7);
        //this.currClover.setPositionX(this.youHaveText.x - this.imgClover.width/2);
        //  this.imgClover.setPositionX(this.youHaveText.x + this.currClover.getVirtualRendererSize().width/2);
    }
    // showTooltip: function () {
    //     if(this.isShowingTooltip) return;
    //     this.isShowingTooltip = true;
    //     this.pnTooltip.setVisible(true);
    //     this.pnTooltip.setScale(0.2);
    //     this.pnTooltip.runAction(cc.sequence(
    //         cc.scaleTo(0.2, 1).easing(cc.easeBackOut(2.0)),
    //         cc.delayTime(5),
    //         cc.callFunc(function () {
    //             this.hideTooltip();
    //         }.bind(this))
    //     ));
    // },
    // hideTooltip: function () {
    //     if(!this.isShowingTooltip) return;
    //     this.pnTooltip.setScale(1);
    //     this.pnTooltip.runAction(cc.sequence(
    //         cc.scaleTo(0.2, 0.2).easing(cc.easeBackIn(2.0)),
    //         cc.callFunc(() => {
    //             this.pnTooltip.setVisible(false);
    //             this.isShowingTooltip = false;
    //         })
    //     ));
    // }
});

WChallengeAsidePopup.STATE = {};
WChallengeAsidePopup.STATE.NORMAL = 0;
WChallengeAsidePopup.STATE.SELECTED = 1;
WChallengeAsidePopup.STATE.ACTIVE = 2;
WChallengeAsidePopup.STATE.ENED = 3;



WChallengeCheatPopup = cc.Layer.extend({
    ctor: function () {
        this._super();
        this.initGUI();
        this.handleSubmit();
    },
    initGUI: function () {
        this.disabledLayer = new WChallengeDisabledLayer();
        this.addChild(this.disabledLayer, 0);
        // cheat progress
        this.progressInput = new ccui.TextField("     Nhập số nhiệm vụ hiện tại     ", "Arial", 30);
        this.progressInput.anchorX = 0.5;
        this.progressInput.setPosition(0, 150);
        this.addChild(this.progressInput, 10);
        this.submitBtn = ccui.Button();
        this.submitBtn.setTitleText('OK');
        this.submitBtn.setTitleFontSize(28);
        this.submitBtn.setPosition(0, 100);
        this.addChild(this.submitBtn, 10);
        // cheat day
        this.dayInput = new ccui.TextField("Nhập ngày hiện tại (1 - 8)", "Arial", 30);
        this.dayInput.anchorX = 0.5;
        this.dayInput.setPosition(0, 0);
        this.addChild(this.dayInput, 10);
        this.daySubmitBtn = ccui.Button();
        this.daySubmitBtn.setTitleText("OK");
        this.daySubmitBtn.setTitleFontSize(28);
        this.daySubmitBtn.setPosition(-80, -50);
        this.addChild(this.daySubmitBtn, 10);
        this.dayCancelBtn = ccui.Button();
        this.dayCancelBtn.setTitleText("Cancel");
        this.dayCancelBtn.setTitleFontSize(28);
        this.dayCancelBtn.setPosition(80, -50);
        this.addChild(this.dayCancelBtn, 10);
        // cheat reset
        this.resetBtn = ccui.Button();
        this.resetBtn.setTitleText("RESET INFO");
        this.resetBtn.setTitleFontSize(28);
        this.resetBtn.setPosition(0, -150);
        this.addChild(this.resetBtn, 10);

        var testText = BaseLayer.createLabelText("TEST 11", cc.color(255, 255, 255));
        testText.setPosition(-200, -200);
        this.addChild(testText, 999);
    },
    handleSubmit: function () {
        this.submitBtn.addTouchEventListener(function(render, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                var progressVal = parseInt(this.progressInput.getString());
                if(isNaN(progressVal)) {
                    return;
                }
                if(progressVal < 0) {
                    progressVal = 0;
                }
                if(progressVal > 1000000000) {
                    progressVal = 1000000000;
                }
                var cmd = new CmdSendWChallengeCheatTask();
                cmd.putData(progressVal);
                GameClient.getInstance().sendPacket(cmd);
            }
        }.bind(this));
        this.resetBtn.addTouchEventListener(function(render, eventType){
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                var cmd = new CmdSendCheatResetInfo();
                GameClient.getInstance().sendPacket(cmd);
            }
        }.bind(this));
        this.daySubmitBtn.addTouchEventListener(function(render, eventType){
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                var day = parseInt(this.dayInput.getString());
                if (isNaN(day)) {
                    return;
                }
                WChallenge.getInstance().gui.close();
                this.setVisible(false);
                setTimeout(function () {
                    var cmd = new CmdSendCheatDay();
                    cmd.putData(day);
                    GameClient.getInstance().sendPacket(cmd);
                }, 500);
            }
        }.bind(this));
        this.dayCancelBtn.addTouchEventListener(function(render, eventType){
            WChallenge.getInstance().gui.close();
            this.setVisible(false);
            setTimeout(function () {
                var cmd = new CmdSendCheatDay();
                cmd.putData(-1);
                GameClient.getInstance().sendPacket(cmd);
            }, 500);
        }.bind(this));
    }
});

WChallengeDisabledLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        this.bgDisabledLayer = ccui.Button();
        this.bgDisabledLayer.setTitleText('                                    ');
        this.bgDisabledLayer.setScale(100);
        this.bgDisabledLayer.setSwallowTouches(true);
        this.addChild(this.bgDisabledLayer, 0);
        this.blurLayer = new cc.Sprite();
        this.blurLayer.setTextureRect(cc.rect(0, 0, 2 * cc.winSize.width, 2 * cc.winSize.height));
        this.blurLayer.color = cc.color(10, 10, 10);
        this.blurLayer.setOpacity(200);
        this.addChild(this.blurLayer, 0);
    },
    setBlurOpacity: function (opacity) {
        this.blurLayer.setOpacity(opacity);
    }
});

WChallengeDailyItem = BaseLayer.extend({
    ctor: function () {
        this._super(WChallengeDailyItem.className);
        this.initWithBinaryFile('res/EventMgr/WeeklyChallenge/WeeklyChallengeDailyItem.json');
        this.isActive = null;
    },
    onEnter: function () {
        this._super();
        this.activeNode.setScaleY(0);
        this.activeNode.runAction(cc.sequence(
            cc.delayTime(WChallengePopup.getDelayAnimActiveItem()),
            cc.scaleTo(0.3, 1)
        ));
        this.choiceNode.opacity = 0;
        this.choiceNode.y = this.choiceNode.y + 100;
        this.choiceNode.runAction(cc.sequence(
            cc.delayTime(1),
            cc.moveBy(0.3, 0, -100)
        ));
        this.choiceNode.runAction(cc.sequence(
            cc.delayTime(1),
            cc.fadeIn(0.3)
        ));
    },
    initGUI: function () {
        this.premiumItemNode = this._layout.getChildByName('WChallengeItemPremium');
        this.basicItemNode = this._layout.getChildByName('WChallengeItemBasic');
        this.dailyProgressNode = this._layout.getChildByName('DailyProgress');
        this.activeNode = this._layout.getChildByName('Active');
        this.choiceNode = this._layout.getChildByName('Choice');
    },
    setIsActive: function (isActive) {
        if(isActive === this.isActive) {
            return;
        }
        this.isActive = isActive;
        this.choiceNode.setVisible(isActive);
        this.activeNode.setVisible(isActive);
    }
});
WChallengeDailyItem.className = 'WChallengeDailyItem';
