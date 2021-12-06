var WChallengeAutoGetRewardGUI = BaseLayer.extend({
    ctor: function () {
        this._super(WChallengeAutoGetRewardGUI.className);
        this.setPosition(0, 0);
        this.initGUI();
        this.handleClaimRewardBtn();
        this.updateRewardVal();
    },
    initGUI: function () {
        var W = cc.winSize.width;
        var H = cc.winSize.height;
        this.disabledLayer = new WChallengeDisabledLayer();
        this.addChild(this.disabledLayer, 0);
        this.titleText = new cc.Sprite('res/Event/WeeklyChallenge/congratulation-get-reward.png');
        this.titleText.setPosition(W/2, H - 70);
        this.addChild(this.titleText, 5);
        this.descriptionText = BaseLayer.createLabelText("Chuc mung", cc.color(210, 210, 210));
        this.descriptionText.setPosition(W/2, H - 120);
        this.descriptionText.setFontSize(24);
        this.descriptionText.setFontName(SceneMgr.FONT_BOLD);
        this.addChild(this.descriptionText, 5);
        this.goiVang = new cc.Sprite();
        this.goiVang.setPosition(W/2, H/2);
        this.addChild(this.goiVang, 5);
        this.shiningBg = new cc.Sprite('res/Event/WeeklyChallenge/Popup/Shining.png');
        this.shiningBg.setPosition(W/2, H/2);
        this.shiningBg.setScale(1.5);
        this.shiningBg.runAction(cc.rotateBy(8, 360).repeatForever());
        this.addChild(this.shiningBg, 2);
        this.goldIcon = new cc.Sprite('res/Event/WeeklyChallenge/Popup/Icons/GoldIcon.png');
        this.goldIcon.setPosition(W/2 - 30, H/2 - 100);
        this.goldIcon.setScale(1.3);
        this.addChild(this.goldIcon, 5);
        this.goldRewardText = BaseLayer.createLabelText('50K', cc.color(237, 237, 0));
        this.goldRewardText.setAnchorPoint(0, 0.5);
        this.goldRewardText.setPosition(this.goldIcon.width + 10, this.goldIcon.height/2);
        this.goldRewardText.setFontSize(24);
        this.goldRewardText.setFontName(SceneMgr.FONT_BOLD);
        this.goldIcon.addChild(this.goldRewardText, 1);
        this.cloverIcon = new cc.Sprite('res/Event/WeeklyChallenge/Popup/Icons/CloverIcon.png');
        this.cloverIcon.setPosition(W/2 - 30, H/2 - 140);
        this.cloverIcon.setScale(1.3);
        this.addChild(this.cloverIcon, 5);
        this.cloverRewardText = BaseLayer.createLabelText('x5', cc.color(50, 220, 0));
        this.cloverRewardText.setAnchorPoint(0, 0.5);
        this.cloverRewardText.setPosition(this.cloverIcon.width + 10, this.cloverIcon.height/2);
        this.cloverRewardText.setFontSize(24);
        this.cloverRewardText.setFontName(SceneMgr.FONT_BOLD);
        this.cloverIcon.addChild(this.cloverRewardText, 5);
        this.claimRewardBtn = ccui.Button('res/Event/WeeklyChallenge/Popup/Buttons/ClaimRewards.png');
        this.claimRewardBtn.setPosition(W/2, 50);
        this.addChild(this.claimRewardBtn, 5);
    },
    updateRewardVal: function () {
        var wChallenge = WChallenge.getInstance();
        this.setCloverVal(wChallenge.autoTakeCloverReward);
        this.setGoldVal(wChallenge.autoTakeGoldReward);
        var txt = LocalizedString.to("WC_RECEIVED_DAY_X_REWARD");
        this.descriptionText.setString(StringUtility.replaceAll(txt, "@day", wChallenge.oldDay));
    },
    handleClaimRewardBtn: function () {
        this.claimRewardBtn.addTouchEventListener(function(render, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED) {
                this.removeFromParent();
                try {
                    gamedata.updateUserInfoNow();
                }
                catch (e) {

                }
            }
        }.bind(this));
    },
    setGoldVal: function (val) {
        this.goldRewardText.setString(StringUtility.formatNumberSymbol(val));
    },
    setCloverVal: function (val) {
        this.cloverRewardText.setString(StringUtility.formatNumberSymbol(val));
        var goiVangId = 1;
        if(val >= 50) {
            goiVangId = 6;
        } else if (val >= 30) {
            goiVangId = 5
        } else if (val >= 30) {
            goiVangId = 4
        } else if (val >= 10) {
            goiVangId = 3
        } else if (val >= 3) {
            goiVangId = 2
        }
        var goiVangPath = 'res/Event/WeeklyChallenge/VangLaTo/GoiVang%s.png'.replace('%s', goiVangId.toString());
        this.goiVang.setScale(0.5 + goiVangId * 0.05);
        this.goiVang.setTexture(goiVangPath);
    }
});

WChallengeAutoGetRewardGUI.className = 'WChallengeAutoGetRewardGUI';