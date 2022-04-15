/**
 * Created by AnhLN6 on 11/4/2021
 * Animates Fortune Cat icon in lobby
 */

let FortuneCatIcon = cc.Node.extend({
    ctor: function(isIngameIcon){
        this._super();
        this.setCascadeOpacityEnabled(true);

        this.isIngameIcon = isIngameIcon;
        this.remainDuration = null;
        this.secondCounter = 0;
        this.highlightAction = null;

        if (isIngameIcon){
            this.tooltipPanel = new ccui.Layout();
            this.tooltipPanel.setAnchorPoint(1, 0.5);
            this.tooltipPanel.x = 0;
            this.tooltipPanel.width = 175;
            this.tooltipPanel.height = 50;
            this.tooltipPanel.setClippingEnabled(true);
            this.addChild(this.tooltipPanel);

            this.ingameTooltip = new ccui.ImageView(fortuneCatRes.ingameTooltip);
            this.ingameTooltip.setAnchorPoint(0, 0.5);
            this.ingameTooltip.x = 150;
            this.ingameTooltip.y = 25
            this.tooltipPanel.addChild(this.ingameTooltip);
        }

        this.btn = new ccui.Button();
        if (isIngameIcon){
            this.btn.loadTextures(
                fortuneCatRes.iconIngame,
                fortuneCatRes.iconIngame,
                fortuneCatRes.iconIngame);
        }
        else {
            this.btn.loadTextures(
                fortuneCatRes.iconLobby,
                fortuneCatRes.iconLobby,
                fortuneCatRes.iconLobby);
        }
        this.btn.setPressedActionEnabled(true);
        this.btn.setAnchorPoint(0.5, 0.5);
        this.addChild(this.btn);

        this.bgTime = new ccui.ImageView(fortuneCatRes.bgTime);
        this.bgTime.y = -3;
        this.bgTime.setVisible(false);
        this.addChild(this.bgTime);

        if (isIngameIcon){
            this.time = new ccui.Text("00 : 00 : 00", SceneMgr.FONT_BOLD, 12);
            let timeY = -35;
            this.time.setColor(FortuneCatIcon.TIME_COLOR);
            this.time.y = timeY;
            this.time.setVisible(false);
            this.addChild(this.time);
        }
        else {
            this.time = new ccui.Text("00 : 00 : 00", SceneMgr.FONT_BOLD, 10);
            let timeY = -2;
            this.time.setColor(FortuneCatIcon.TIME_COLOR);
            this.time.y = timeY;
            this.time.setVisible(false);
            this.addChild(this.time);
        }

        this.progress = new ccui.Text("0/5", SceneMgr.FONT_BOLD, 17);
        let progressY = -30;
        this.progress.y = progressY;
        this.addChild(this.progress);

        this.progressBg = new ccui.ImageView(fortuneCatRes.progressBg);
        this.progressBg.y = -32;
        this.addChild(this.progressBg);

        this.progressBar = new ccui.LoadingBar(fortuneCatRes.progressBar);
        this.progressBar.setPercent(0);
        this.progressBar.y = -32;
        this.addChild(this.progressBar);

        this.fullWarning = new ccui.Text("Đầy", SceneMgr.FONT_BOLD, 17);
        this.fullWarning.y = progressY;
        this.fullWarning.setVisible(false);
        this.addChild(this.fullWarning);

        ///lobby icon hides progress
        if (!isIngameIcon){
            this.progress.setVisible(false);
            this.progressBg.setVisible(false);
            this.progressBar.setVisible(false);
        }
        else {
            this.bgTime.setVisible(false);
            this.time.setVisible(false);
            this.progress.setColor(FortuneCatIcon.INGAME_COLOR);
            this.fullWarning.setColor(FortuneCatIcon.INGAME_COLOR);
            this.progress.setVisible(false);
        }

        this.exclamation = new cc.Node();
        let exclamationX = 40;
        let exclamationY = 40;
        this.exclamation.setPosition(exclamationX, exclamationY);
        this.exclamation.setVisible(false);
        let anim = db.DBCCFactory.getInstance().buildArmatureNode("Notify");
        anim.gotoAndPlay("1", -1, -1, 0);
        this.exclamation.addChild(anim);
        this.addChild(this.exclamation);

        ///lobby icon and ingame icon has different position
        if (!isIngameIcon){
            let iconX = 120;
            let iconY = 14;

            this.setPosition(iconX, iconY);
            this.btn.addClickEventListener(function(){
                FortuneCatManager.getInstance().userClickedFortuneCatIcon = true;
                FortuneCatManager.getInstance().isIngameIcon = false;
                FortuneCatManager.getInstance().sendGetUserData();
            });
        }
        else {
            this.checkIngameReposition();
            this.btn.addClickEventListener(function(){
                FortuneCatManager.getInstance().userClickedFortuneCatIcon = true;
                FortuneCatManager.getInstance().isIngameIcon = true;
                FortuneCatManager.getInstance().sendGetUserData();
            }.bind(this));
            this.exclamation.setVisible(false);
        }

        if (FortuneCatManager.getInstance().checkNotifyCondition()){
            this.notifyFinishUnlocking(true);
        }

        if (isIngameIcon){
            this.updateProgress();
        }
    },

    onEnter: function () {
        this._super();
        this.updateProgress();
    },

    ///update display of number of bells user has
    updateProgress: function(){
        var progressChangeDuration = 0.5;
        var currentPercent = this.progressBar.getPercent();
        var targetPercent = FortuneCatManager.getInstance().userNumBell / FortuneCatManager.getInstance().maxBell * 100;

        this.progress.setString(FortuneCatManager.getInstance().userNumBell + "/" + FortuneCatManager.getInstance().maxBell);
        if (targetPercent < currentPercent){
            if (targetPercent === 0){
                targetPercent = 100;
                this.progressBar.stopAllActions();
                this.progressBar.runAction(cc.sequence(
                    cc.sequence(
                        cc.callFunc(function(){
                            this.progressBar.setPercent(this.progressBar.getPercent() + 1);
                        }.bind(this)),
                        cc.delayTime(progressChangeDuration / (targetPercent - currentPercent))
                    ).repeat(targetPercent - currentPercent),
                    cc.callFunc(function(){
                        this.progressBar.setPercent(targetPercent)
                    }.bind(this)),
                    cc.delayTime(0.5),
                    cc.callFunc(function(){
                        this.progressBar.setPercent(0);
                    }.bind(this))
                ));
            }
            else {
                this.progressBar.stopAllActions();
                this.progressBar.runAction(cc.sequence(
                    cc.sequence(
                        cc.callFunc(function(){
                            this.progressBar.setPercent(this.progressBar.getPercent() + 1);
                        }.bind(this)),
                        cc.delayTime(progressChangeDuration / (100 - currentPercent))
                    ).repeat(100 - currentPercent),
                    cc.callFunc(function(){
                        this.progressBar.setPercent(100)
                    }.bind(this)),
                    cc.delayTime(0.5),
                    cc.callFunc(function(){
                        this.progressBar.setPercent(0);
                    }.bind(this)),
                    cc.sequence(
                        cc.callFunc(function(){
                            this.progressBar.setPercent(this.progressBar.getPercent() + 1);
                        }.bind(this)),
                        cc.delayTime(progressChangeDuration / targetPercent)
                    ).repeat(targetPercent),
                    cc.callFunc(function(){
                        this.progressBar.setPercent(targetPercent)
                    }.bind(this))
                ));
            }
        }
        else if (targetPercent > currentPercent){
            this.progressBar.stopAllActions();
            this.progressBar.runAction(cc.sequence(
                cc.sequence(
                    cc.callFunc(function(){
                        this.progressBar.setPercent(this.progressBar.getPercent() + 1);
                    }.bind(this)),
                    cc.delayTime(progressChangeDuration / (targetPercent - currentPercent))
                ).repeat(targetPercent - currentPercent),
                cc.callFunc(function(){
                    this.progressBar.setPercent(targetPercent)
                }.bind(this))
            ));
        }
        else {
            ///do nothing
        }

        this.checkFullCat();
    },

    ///only ingame icon shows number of bells user has
    showProgress: function(){
        this.time.setVisible(false);
        this.bgTime.setVisible(false);
    },

    ///only lobby icon shows time remaining
    showTime: function(){
        if (!this.isIngameIcon){
            this.progress.setVisible(false);
            this.time.setVisible(true);
            this.bgTime.setVisible(true);
        }
    },

    checkFullCat: function(){
        if (FortuneCatManager.getInstance().userCatIdList && FortuneCatManager.getInstance().userCatIdList.length === 3){
            if (this.isIngameIcon){
                this.progressBar.setVisible(false);
                this.progressBg.setVisible(false);
                this.fullWarning.setVisible(true);
            }
        }
        else {
            if (this.isIngameIcon){
                this.progressBar.setVisible(true);
                this.progressBg.setVisible(true);
            }
            this.fullWarning.setVisible(false);
        }
    },

    ///init time countdown when receive unlock authorized packet from server
    showUnlocking: function(){
        this.showTime();
        let currentCat = FortuneCatManager.getInstance().catConfigList[FortuneCatManager.getInstance().userOpenCatId];
        this.remainDuration = currentCat.openTime / 1000;

        let time = FortuneCatUtility.formatTime(this.remainDuration);
        this.time.setString(time.hour + " : " + time.minute + " : " + time.second);

        this.schedule(this.showRemainTime, FortuneCatIcon.UPDATE_TIME_INTERVAL);
    },

    ///countdown loop
    showRemainTime: function(dt){
        this.secondCounter += dt;
        if (this.secondCounter >= 1){
            this.remainDuration -= 1;
            this.secondCounter = 0;
            this.updateClock();
        }
        if (this.remainDuration <= 0){
            this.showProgress();
            this.notifyFinishUnlocking(true);
            this.unschedule(this.showRemainTime);
        }
    },

    ///change display of time
    updateClock: function(){
        let time = FortuneCatUtility.formatTime(this.remainDuration);
        this.time.setString(time.hour + " : " + time.minute + " : " + time.second);
    },

    ///update time displayed when switch from other GUI to lobby GUI, called when enter lobby scene
    updateRemainTime: function(duration){
        this.unschedule(this.showRemainTime);

        this.showTime();
        this.remainDuration = duration;

        let time = FortuneCatUtility.formatTime(this.remainDuration);
        this.time.setString(time.hour + " : " + time.minute + " : " + time.second);

        this.schedule(this.showRemainTime, FortuneCatIcon.UPDATE_TIME_INTERVAL);
    },

    ///reposition the icon if user has ranking function (has another icon in game scene)
    checkIngameReposition: function(){
        return;
        let winSize = cc.director.getWinSize();
        let iconX, iconY;
        let ingameIconOffsetY = 85;
        let ingameIconOffsetXWithRank = 85;
        let ingameIconOffsetXWithoutRank = 30;

        ///ingame scene has rank icon
        if (userMgr.getLevel() >= RankData.MIN_LEVEL_JOIN_RANK){
            iconX = winSize.width - ingameIconOffsetXWithRank;
            iconY = winSize.height - ingameIconOffsetY;
        }
        else {
            iconX = winSize.width - ingameIconOffsetXWithoutRank;
            iconY = winSize.height - ingameIconOffsetY;
        }

        this.setPosition(iconX, iconY);
    },

    ///show/hide exclamation notification
    notifyFinishUnlocking: function(show){
        if (this.isIngameIcon){
            return;
        }
        this.exclamation.setVisible(show);
    },

    checkNoCatUnlock: function(){
        if (
            FortuneCatManager.getInstance().userCatIdList !== null &&
            FortuneCatManager.getInstance().userCatIdList.length > 0 &&
            FortuneCatManager.getInstance().userOpenCatId == -1
        ) {
            this.highlightAction = cc.sequence(
                cc.scaleTo(0.5, 1.1),
                cc.scaleTo(0.5, 1)
            ).repeatForever();
            this.btn.runAction(this.highlightAction);
        }
    },

    stopHighlight: function(){
        if (this.highlightAction !== null){
            this.btn.stopAction(this.highlightAction);
            this.highlightAction = null;
            this.btn.runAction(cc.scaleTo(0.001, 1));
        }
    },

    ///fortune cat add bell fx
    ///Move function out from GameScene
    addFlyCatFx: function(catType, delay){
        if (!this.isIngameIcon) return;

        this.scheduleOnce(function(){
            this.removeChildByName("catReward");

            var catReward = new cc.Node();
            catReward.setPosition(-60, 0);
            catReward.setName("catReward");

            var bonusValue = new ccui.Text("+1", SceneMgr.FONT_BOLD, 15);
            bonusValue.setPosition(-30, 0);
            bonusValue.setColor(cc.color("fdec41"));

            var catImg = new ccui.ImageView(FortuneCatImageSlotPathList[catType]);
            catImg.setScale(0.6);
            catImg.setPosition(0, 0);

            bonusValue.runAction(cc.Sequence(
                cc.delayTime(0.5),
                cc.moveBy(1, 90, 0).easing(cc.easeBackIn()),
                cc.hide()
            ));

            catImg.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.moveBy(1, 60, 0).easing(cc.easeBackIn()),
                cc.hide()
            ));

            this.runAction(cc.Sequence(
                cc.delayTime(1.5),
                cc.ScaleTo(0.2, 1.3),
                cc.ScaleTo(0.2, 1)
            ));

            catReward.addChild(bonusValue);
            catReward.addChild(catImg);
            this.addChild(catReward);

            let flyCatAnimationExpectedDuration = 2;
            this.scheduleOnce(function(){
                this.updateProgress();
            }.bind(this), flyCatAnimationExpectedDuration);
        }.bind(this), delay);
    },

    //Endgame efx for inGameIcon
    endGameFx: function () {
        if (!this.isIngameIcon) return;

        ///fortune cat flow
        this.updateProgress();
        this.checkIngameReposition();
    },

    getContentSize: function () {
        if (this.isIngameIcon) {
            return this.btn.getContentSize();
        }
        return cc.p(0, 0);
    },

    getAnchorPoint: function () {
        return cc.p(0.5, 0.5);
    },
});

FortuneCatIcon.TIME_COLOR = cc.color(200, 192, 213);
FortuneCatIcon.INGAME_COLOR = cc.color("#C88081");
FortuneCatIcon.UPDATE_TIME_INTERVAL = 0.5;

