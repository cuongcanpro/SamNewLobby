/**
 * Created by AnhLN6 on 8/13/2021
 * Created and animate Lucky Bonus scene
 */

//scene and GUI
var LuckyBonusScene = BaseLayer.extend({
    ctor: function(){
        //store reels art
        this.reelList = [];

        //store streaks art
        this.streakList = [];
        this.bonusImage = null;

        //store slot machine components
        this.slotMachine = null;
        this.lever = null;

        //user info
        this.avatarImage = null;
        this.currentStreak = null;
        this.afkTime = 0;
        this.toolTipShowedTime = 0;
        this.updateStreakAfterFreeSpin = false;
        this.userVipRemainTime = null;
        this.userCurrentGold = null;

        //reward
        this.totalGold = null;
        this.baseGold = null;
        this.currentGold = 0;
        this.winUpToNeon = 0;
        this.lastRollBetG = 0;
        this.areThreeSlotsSame = null;

        //btn list
        this.exitBtn = null;
        this.spinBtn = null;

        //bet info
        this.betG = 0;
        this.betLevel = 0;
        this.winUpTo = 0;

        this._super(LuckyBonusScene.className);
        this.initWithJsonFile("res/Lobby/GUILuckyBonus.json");
    },

    initGUI: function(){
        //GUI components
        this.slotMachine = this.getControl("slotMachine", this._layout);
        this.pBotLeft = this.getControl("pBotLeft", this._layout);
        this.pBotRight = this.getControl("pBotRight", this._layout);
        this.handTip = this.getControl("hand", this.slotMachine);
        this.handTip.setVisible(false);

        //logic btn
        this.exitBtn = this.customButton("backBtn", LuckyBonusScene.BTN_EXIT, this._layout);
        this.addGoldBtn = this.customButton("addUserGold", LuckyBonusScene.BTN_ADD_GOLD, this._layout);
        this.addGBtn = this.customButton("addUserG", LuckyBonusScene.BTN_ADD_G, this._layout);
        this.avatarBtn = this.customButton("avatar", LuckyBonusScene.BTN_AVATAR, this._layout);
        this.spinBtn = this.customButton("spinBtn", LuckyBonusScene.BTN_SPIN, this.slotMachine);
        this.reduceBetGBtn = this.customButton("reduceBetGBtn", LuckyBonusScene.BTN_REDUCE_BET, this.slotMachine);
        this.addBetGBtn = this.customButton("addBetGBtn", LuckyBonusScene.BTN_ADD_BET, this.slotMachine);
        this.totalRewardTipBtn = this.customButton("totalRewardTipBtn", LuckyBonusScene.BTN_REWARD_DETAIL, this.slotMachine);

        //cheat btn
        this.cheatBtn = this.customButton("cheatBtn", LuckyBonusScene.BTN_CHEAT);
        this.cheatUserDataBtn = this.customButton("cheatUserDataBtn", LuckyBonusScene.BTN_CHEAT_USER_DATA);
        this.cheatRollResultBtn = this.customButton("cheatRollResultBtn", LuckyBonusScene.BTN_CHEAT_ROLL_RESULT);
        this.checkRollRatioBtn = this.customButton("checkRollRatioBtn", LuckyBonusScene.BTN_CHECK_ROLL_RATIO);

        this.loadStreak(LuckyBonusManager.getInstance().userCurrentStreak);
        this.loadSpinBtn();
        this.loadLever();
        this.loadUserInfo();
        this.loadCheat();
    },

    onEnterFinish: function(){
        luckyBonusSound.preloadAllSound();
        this.loadUserAvatar();
        this.loadSlots();
        this.createReels();
        this.enableAllBtn();
        this.removeAllExistingEffect();
        this.createVipCheckSchedule();
        this.setCheatState();
        this.setBackEnable(true);
        this.animateGUI();
    },

    setCheatState: function(){
        this.pCheat.setVisible(false);
        this.cheatBtn.setVisible(Config.ENABLE_CHEAT);
    },

    runLeverSpriteFrameAnimation: function(){
        var action = cc.animate(this.anim);
        this.leverSprite.runAction(action);
    },

    createVipCheckSchedule: function(){
        this.userVipRemainTime = NewVipManager.getInstance().getRemainTime() / 1000;
        this.schedule(this.checkUserVipExpire, 1);
    },

    loadUserAvatar: function(){
        this.avatarImage.asyncExecuteWithUrl(GameData.getInstance().userData.uID, GameData.getInstance().userData.avatar);
    },

    createReels: function(){
        for (var i = 0; i < LuckyBonusScene.NUMBER_OF_REELS; i++){
            var slotList = [];
            var currentReel = this.getControl("reel_" + i.toString(), this.slotMachine);
            //create slots for each reels
            for (var j = 0; j < LuckyBonusScene.NUMBER_OF_SLOTS_PER_REEL; j++){
                var slotImage = this.getControl("slot_" + i.toString() + "_" + j.toString(), currentReel);
                slotList.push(slotImage);
            }
            var reel = new Reel(slotList);
            this.reelList.push(reel);
        }
    },

    loadUserInfo: function(){
        var pBotLeft = this.getControl("pBotLeft", this._layout);
        var userGold = this.getControl("userGold", pBotLeft);
        var userG = this.getControl("userG", pBotLeft);
        var userAvatarBg = this.getControl("avatarBorder", pBotLeft);
        this.avatarImage = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.avatarImage.setPosition(cc.p(36.5, 36.5));
        this.avatarImage.setScale(userAvatarBg.width / (this.avatarImage.clipping.stencil.width) - 0.05);

        this.getControl("value", userGold).setString(this.formatGoldValue(gamedata.userData.bean));
        this.getControl("value", userG).setString(this.formatGoldValue(gamedata.userData.coin));
        userAvatarBg.addChild(this.avatarImage);
        this.updateVipInfo();
    },

    loadSlots: function(){
        for (var i = 0; i < LuckyBonusScene.NUMBER_OF_REELS; i++){
            var currentReel = this.getControl("reel_" + i.toString(), this.slotMachine);
            currentReel.removeAllChildren();
            for (var j = 0; j < LuckyBonusScene.NUMBER_OF_SLOTS_PER_REEL; j++){
                var slot = new ccui.ImageView("res/Lobby/GUILuckyBonus/token/" + (j + 1).toString() + ".png");
                slot.x = LuckyBonusScene.SLOT_X;
                slot.y = LuckyBonusScene.SLOT_BASE_Y + j * LuckyBonusScene.SLOT_Y_INCREMENT;
                slot.setName("slot_" + i.toString() + "_" + j.toString());
                currentReel.addChild(slot);
            }
            var slotCover = new ccui.ImageView("res/Lobby/GUILuckyBonus/22.png");
            slotCover.setPosition(LuckyBonusScene.SLOT_COVER_POSITION);
            slotCover.setName("slotCover");
            currentReel.addChild(slotCover);
        }
    },

    loadLever: function(){
        if (typeof sp !== 'undefined'){
            var leverPos = this.getControl("lever", this.slotMachine);
            this.lever = new sp.SkeletonAnimation("res/Lobby/GUILuckyBonus/effect/lever.json", "res/Lobby/GUILuckyBonus/effect/lever.atlas");
            this.lever.setPosition(0, 0);
            this.lever.setScale(0.6);

            leverPos.addChild(this.lever);
        }
        else {
            var leverPos = this.getControl("lever", this.slotMachine);
            this.leverSprite = cc.Sprite("res/Lobby/GUILuckyBonus/effect/1.png");
            this.leverSprite.setPosition(30, 0);
            var time = 0.2;

            var animation = cc.animationCache.getAnimation("lever");
            if (!animation) {
                var arr = [];
                var aniFrame;
                for (var i = 1; i <= LuckyBonusScene.NUMBER_OF_LEVER_FRAME; i++) {
                    aniFrame = new cc.AnimationFrame(cc.SpriteFrame("res/Lobby/GUILuckyBonus/effect/" + i.toString() + ".png", cc.rect(0, 0, 161, 252)), time);
                    arr.push(aniFrame);
                }
                animation = new cc.Animation(arr, time);
                cc.animationCache.addAnimation(animation, "lever");
            }
            this.anim = animation;


            leverPos.addChild(this.leverSprite);
        }
    },

    loadSpinBtn: function(){
        this.betLevel = 0;
        this.betG = LuckyBonusManager.getInstance().allowG[this.betLevel];
        this.winUpTo = this.calculateMaxReward();

        this.updateBetG();
        if (LuckyBonusManager.getInstance().userNumberOfFreeSpin > 0){
            this.spinBtn.loadTextures("res/Lobby/GUILuckyBonus/12.png", "res/Lobby/GUILuckyBonus/12.png", "res/Lobby/GUILuckyBonus/12.png");
            this.getControl("betG", this.slotMachine).setVisible(false);
        }
        else {
            this.spinBtn.loadTextures("res/Lobby/GUILuckyBonus/13.png", "res/Lobby/GUILuckyBonus/13.png", "res/Lobby/GUILuckyBonus/13.png");
            this.getControl("betG", this.slotMachine).setVisible(true);
        }
    },

    loadStreak: function(currentStreak){
        this.currentStreak = currentStreak;

        for (var i = 0; i < LuckyBonusScene.MAX_STREAK_DAY; i++){
            if (i !== currentStreak){
                this.drawStreak(i);
            }
            else {
                this.drawCurrentStreak(currentStreak);
            }
        }

        this.updateBonus();
        this.updateWinUpTo();
    },

    loadCheat: function(){
        this.pCheat = this.getControl("pCheat", this._layout);
        this.pCheatUserData = this.getControl("cheatUserData", this.pCheat);
        this.pCheatRollResult = this.getControl("cheatRollResult", this.pCheat);
        this.pCheckRollRatio = this.getControl("checkRollRatio", this.pCheat);

        this.pCheatUserData.streakIndex = this.getControl("streakIndex", this.pCheatUserData);
        this.pCheatUserData.numSpin = this.getControl("numSpin", this.pCheatUserData);

        this.pCheatRollResult.numG = this.getControl("numG", this.pCheatRollResult);
        this.pCheatRollResult.result = this.getControl("result", this.pCheatRollResult);

        this.pCheckRollRatio.numRoll = this.getControl("numRoll", this.pCheckRollRatio);
        this.pCheckRollRatio.itemCheck = this.getControl("itemCheck", this.pCheckRollRatio);
    },

    drawStreak: function(currentStreak){
        var bonusColumn = this.getControl("bonus", this.slotMachine);

        var bonus = new ccui.ImageView("res/Lobby/GUILuckyBonus/9.png");
        bonus.setName("bonus_" + (currentStreak + 1).toString());
        bonus.setPosition(cc.p(LuckyBonusScene.BONUS_X, LuckyBonusScene.BONUS_BASE_Y + currentStreak * LuckyBonusScene.BONUS_Y_INCREMENT));

        var value = new ccui.Text();
        var valuePosIndex = currentStreak === 0 ? 0 : 1;
        value.setName("value");
        value.setString(LuckyBonusManager.getInstance().streakBonus[currentStreak].toString());
        value.setFontName("res/Lobby/GUILuckyBonus/tahomabd.ttf");
        value.setFontSize(20);
        value.setAnchorPoint(LuckyBonusScene.BONUS_VALUE_ANCHOR);
        value.setColor(LuckyBonusScene.BONUS_VALUE_COLOR);
        value.setPosition(cc.p(LuckyBonusScene.BONUS_VALUE_X[valuePosIndex], LuckyBonusScene.BONUS_VALUE_Y));
        bonus.addChild(value);

        var percentIcon = new ccui.Text();
        percentIcon.setName("percentIcon");
        percentIcon.setString("%");
        percentIcon.setFontName("res/Lobby/GUILuckyBonus/tahoma.ttf");
        percentIcon.setFontSize(12);
        percentIcon.setAnchorPoint(LuckyBonusScene.BONUS_ICON_ANCHOR);
        percentIcon.setColor(LuckyBonusScene.BONUS_ICON_COLOR);
        percentIcon.setPosition(cc.p(LuckyBonusScene.BONUS_ICON_X[valuePosIndex], LuckyBonusScene.BONUS_ICON_Y));
        bonus.addChild(percentIcon);

        var day = new ccui.Text();
        day.setName("day");
        day.setString((currentStreak + 1).toString());
        day.setFontName("res/Lobby/GUILuckyBonus/tahoma.ttf");
        day.setFontSize(12);
        day.setAnchorPoint(LuckyBonusScene.BONUS_DAY_ANCHOR);
        day.setColor(LuckyBonusScene.BONUS_DAY_COLOR);
        day.setPosition(cc.p(LuckyBonusScene.BONUS_DAY_X, LuckyBonusScene.BONUS_DAY_Y));
        bonus.addChild(day);

        bonusColumn.addChild(bonus);
        this.streakList.push(bonus);
    },

    drawCurrentStreak: function(currentStreak){
        var bonusColumn = this.getControl("bonus", this.slotMachine);

        var bonus = new ccui.ImageView("res/Lobby/GUILuckyBonus/10.png");
        bonus.setName("bonus_" + (currentStreak + 1).toString());
        bonus.setPosition(cc.p(LuckyBonusScene.BONUS_X, LuckyBonusScene.BONUS_BASE_Y + currentStreak * LuckyBonusScene.BONUS_Y_INCREMENT));

        var value = new ccui.Text();
        var valuePosIndex = currentStreak === 0 ? 0 : 1;
        value.setName("value");
        value.setString(LuckyBonusManager.getInstance().streakBonus[currentStreak].toString());
        value.setFontName("res/Lobby/GUILuckyBonus/tahomabd.ttf");
        value.setFontSize(20);
        value.setAnchorPoint(LuckyBonusScene.BONUS_VALUE_ANCHOR);
        value.setColor(LuckyBonusScene.STREAK_BONUS_VALUE_COLOR);
        value.setPosition(cc.p(LuckyBonusScene.STREAK_BONUS_VALUE_X[valuePosIndex], LuckyBonusScene.STREAK_BONUS_VALUE_Y));
        bonus.addChild(value);

        var percentIcon = new ccui.Text();
        percentIcon.setName("percentIcon");
        percentIcon.setString("%");
        percentIcon.setFontName("res/Lobby/GUILuckyBonus/tahoma.ttf");
        percentIcon.setFontSize(12);
        percentIcon.setAnchorPoint(LuckyBonusScene.BONUS_ICON_ANCHOR);
        percentIcon.setColor(LuckyBonusScene.STREAK_BONUS_ICON_COLOR);
        percentIcon.setPosition(cc.p(LuckyBonusScene.STREAK_BONUS_ICON_X[valuePosIndex], LuckyBonusScene.STREAK_BONUS_ICON_Y));
        bonus.addChild(percentIcon);

        var day = new ccui.Text();
        day.setName("day");
        day.setString((currentStreak + 1).toString());
        day.setFontName("res/Lobby/GUILuckyBonus/tahoma.ttf");
        day.setFontSize(12);
        day.setAnchorPoint(LuckyBonusScene.BONUS_DAY_ANCHOR);
        day.setColor(LuckyBonusScene.BONUS_DAY_COLOR);
        day.setPosition(cc.p(LuckyBonusScene.STREAK_BONUS_DAY_X, LuckyBonusScene.STREAK_BONUS_DAY_Y));
        bonus.addChild(day);

        var image = new ccui.ImageView("res/Lobby/GUILuckyBonus/ngay_" + (currentStreak + 1).toString() + ".png");
        image.setName("bonusIcon");
        image.setPosition(cc.p(LuckyBonusScene.STREAK_BONUS_IMAGE_X, LuckyBonusScene.STREAK_BONUS_IMAGE_BASE_Y + currentStreak * LuckyBonusScene.STREAK_BONUS_IMAGE_Y_INCREMENT));

        bonusColumn.addChild(bonus);
        bonusColumn.addChild(image);
        this.streakList.push(bonus);
        this.bonusImage = image;
    },

    //upon entering scene
    animateGUI: function(){
        this.animateStreakColumn();
        this.animateUserInfo();
        this.animateTip();
        this.animateVipInfo();
        this.animateWinUpTo();
        if (LuckyBonusManager.getInstance().userNumberOfFreeSpin > 0){
            this.animateHandTip();
            this.schedule(this.showHandTip, 0.5);
        }
    },

    animateStreakColumn: function(){
        var bonusArray = [];
        for (var i = 1; i <= LuckyBonusScene.MAX_STREAK_DAY; i++){
            bonusArray.push(this.getControl("bonus_" + i.toString(), this.slotMachine));
        }
        for (var i = 0; i < bonusArray.length; i++){
            bonusArray[i].x -= 200;
        }

        var bonusIcon = this.getControl("bonusIcon", this.slotMachine);
        if (bonusIcon){
            bonusIcon.y = LuckyBonusScene.STREAK_BONUS_IMAGE_BASE_Y - 100;
            bonusIcon.setVisible(false);
        }

        var startingStreak = 1;
        this.animateStreak(startingStreak, bonusArray, bonusIcon);
    },

    animateStreak: function(streak, streakNodeArray, bonusIcon){
        if (streak < LuckyBonusScene.MAX_STREAK_DAY){
            setTimeout(function() {
                var action = cc.MoveBy(0.5, 200, 0);
                action.easing(cc.easeBackOut());
                streakNodeArray[streak - 1].runAction(action);
                this.animateStreak(streak + 1, streakNodeArray, bonusIcon);
            }.bind(this), 100);
        }
        else {
            var action = cc.MoveBy(0.5, 200, 0);
            action.easing(cc.easeBackOut());
            streakNodeArray[streak - 1].runAction(action);
            if (bonusIcon){
                bonusIcon.setVisible(true);
                var action = cc.MoveBy(0.5, 0, LuckyBonusScene.STREAK_BONUS_IMAGE_Y_INCREMENT * (LuckyBonusManager.getInstance().userCurrentStreak) + 100);
                action.easing(cc.easeBackOut());
                bonusIcon.runAction(action);
            }
        }
    },

    animateUserInfo: function(){
        var userAvatar = this.getControl("userAvatar", this.pBotLeft);
        var userGold = this.getControl("userGold", this.pBotLeft);
        var userG = this.getControl("userG", this.pBotLeft);

        userAvatar.y -= 100;
        userGold.y -= 100;
        userG.y -= 100;

        setTimeout(function() {
            var action = cc.MoveBy(0.5, 0, 100);
            action.easing(cc.easeBackOut());
            userAvatar.runAction(action);
            setTimeout(function() {
                var action = cc.MoveBy(0.5, 0, 100);
                action.easing(cc.easeBackOut());
                userGold.runAction(action);
                setTimeout(function() {
                    var action = cc.MoveBy(0.5, 0, 100);
                    action.easing(cc.easeBackOut());
                    userG.runAction(action);
                }, 100);
            }, 100);
        }, 100);
    },

    animateTip: function(){
        var tipBtn = this.getControl("tipBtn", this.pBotRight);
        var tip = this.getControl("tip", this.pBotRight);

        tipBtn.y -= 100;
        tip.y -= 100;

        setTimeout(function() {
            var action = cc.MoveBy(0.5, 0, 100);
            action.easing(cc.easeBackOut());
            tipBtn.runAction(action);
            setTimeout(function() {
                var action = cc.MoveBy(0.5, 0, 100);
                action.easing(cc.easeBackOut());
                tip.runAction(action);
            }, 100);
        }, 100);
    },

    animateVipInfo: function(){
        setTimeout(function() {
            var vipInfo = this.getControl("vip", this.slotMachine);
            var vipIcon = this.getControl("icon", vipInfo);
            vipIcon.setScale(LuckyBonusScene.VIP_ICON_SCALE[LuckyBonusManager.getInstance().userVipLevel], LuckyBonusScene.VIP_ICON_SCALE[LuckyBonusManager.getInstance().userVipLevel]);
            var effect = db.DBCCFactory.getInstance().buildArmatureNode("HighlightBig");

            if (effect) {
                var effectPos = cc.p(
                    this.slotMachine.x - this.slotMachine.width / 2 + vipInfo.x + vipIcon.x,
                    this.slotMachine.y - this.slotMachine.height / 2 + vipInfo.y + vipIcon.y
                );
                this._layout.addChild(effect, 102);
                effect.gotoAndPlay("1" , 0, -1, 1);
                effect.setPosition(effectPos);
                effect.setScale(0.2, 0.2);
                setTimeout(function() {
                    this._layout.removeChild(effect);
                }.bind(this), 3000);
            }
        }.bind(this), 1000);
    },

    animateWinUpTo: function(){
        this.neonImageList = ["res/Lobby/GUILuckyBonus/19.png", "res/Lobby/GUILuckyBonus/18.png"];
        this.neon = this.getControl("neon", this.slotMachine);
        this.schedule(this.changeWinUpToNeon, 1);
    },

    changeWinUpToNeon: function(){
        this.neon.loadTexture(this.neonImageList[this.winUpToNeon]);
        if (this.winUpToNeon !== 0){
            this.winUpToNeon = 0;
        }
        else {
            this.winUpToNeon = 1;
        }
    },

    animateHandTip: function(){
        setTimeout(function() {
            this.handTip.setVisible(true);
            var actionArray = [];
            for (var i = 0; i < 3; i++){
                var actionForward = cc.MoveBy(0.5, -5, -10);
                var actionBackward = cc.MoveBy(0.5, 5, 10);
                actionArray.push(actionForward);
                actionArray.push(actionBackward);
            }
            var sequence = cc.sequence(actionArray);
            this.handTip.runAction(sequence);
            setTimeout(function() {
                this.handTip.setVisible(false);
            }.bind(this), 3000);
        }.bind(this), 1000);
    },

    showHandTip: function(dt){
        this.afkTime += dt;
        this.toolTipShowedTime += dt;
        if (this.afkTime >= LuckyBonusScene.AFK_THRESHOLD){
            this.animateHandTip();
            this.afkTime = 0;
        }
        if (this.toolTipShowedTime >= LuckyBonusScene.SEND_LOG_TOOLTIP_THRESHOLD){
            LuckyBonusManager.getInstance().sendLogTooltipEffect(2);
            this.toolTipShowedTime = 0;
        }
    },

    //spin logic
    spinWheels: function(resultList){
        ///run lever animation
        if (this.lever !== null){
            this.lever.setAnimation(0, "animation", false);
        }
        else{
            this.runLeverSpriteFrameAnimation();
        }
        luckyBonusSound.playLever();

        if (resultList[0] === resultList[1] && resultList[1] === resultList[2]){
            this.areThreeSlotsSame = true;
        }
        else {
            this.areThreeSlotsSame = false;
        }

        var firstTwoReelSameResult = false;
        var intenseLastRound = false;
        if (resultList[0] === resultList[1]){
            firstTwoReelSameResult = true;
        }
        var slowDownDuration = Reel.SLOT_SLOW_DOWN_DEFAULT_DURATION;
        var minSlowDownTravelDistance = Reel.REEL_MIN_SLOW_DOWN_TRAVEL_DISTANCE;

        for (var i = 0; i < this.reelList.length; i++){
            var initAcceleration = -Math.floor(Math.random() * 2001 + 1500);
            if (i === 2 && firstTwoReelSameResult){
                intenseLastRound = true;
            }
            this.reelList[i].init(initAcceleration, slowDownDuration, minSlowDownTravelDistance, resultList[i], intenseLastRound);
            slowDownDuration += Reel.SLOT_SLOW_DOWN_DURATION_INCREMENT;
            if (i === 1 && firstTwoReelSameResult){
                slowDownDuration += 2;
            }
            minSlowDownTravelDistance += Reel.REEL_SLOW_DOWN_TRAVEL_DISTANCE_INCREMENT;
        }

        setTimeout(function() {
            luckyBonusSound.playWheelRolling();
            setTimeout(function() {
                luckyBonusSound.playWheelRolling();
            }, 3000);
        }, 500);

        if (intenseLastRound){
            setTimeout(function() {
                audioEngine.stopAllEffects();
                stopWheelAudioId = luckyBonusSound.playWheelRollingStop();
            }, 7000);
        }
        else {
            setTimeout(function() {
                audioEngine.stopAllEffects();
                stopWheelAudioId = luckyBonusSound.playWheelRollingStop();
            }, 5000);
        }
        this.schedule(this.spin);
    },

    spin: function(dt){
        for (var i = 0; i < this.reelList.length; i++){
            this.reelList[i].update(dt);
        }
        if (this.checkSpinFinished()){
            this.unschedule(this.spin);
            this.runFinishRollAnimation();
            setTimeout(function() {
                luckyBonusSound.playScoreCount();
                this.schedule(this.showTotalGold, 0.02);
            }.bind(this), 2500);
            setTimeout(function() {
                luckyBonusSound.playScoreCount();
            }, 4500);
        }
    },

    //slot glowing effect
    runFinishRollAnimation: function(){
        setTimeout(function() {
            for (var i = 0; i < LuckyBonusScene.NUMBER_OF_REELS; i++){
                var currentReelWidget = this.getControl("reel_" + i.toString(), this.slotMachine);
                var currentReel = this.reelList[i];
                var glowAnim = ccui.ImageView("res/Lobby/GUILuckyBonus/token/" + (currentReel.result + 1).toString() + "_glow.png");
                glowAnim.setScale(1, 1);
                glowAnim.setName("glowAnim");
                glowAnim.setLocalZOrder(-1);
                glowAnim.setPosition(cc.p(LuckyBonusScene.SLOT_X, LuckyBonusScene.SLOT_BASE_Y));
                currentReelWidget.addChild(glowAnim);

                var actionArray = [];
                for (var j = 0; j < 3; j++){
                    var actionScaleDown = cc.ScaleTo(0.5, 0.6, 0.6);
                    var actionScaleUp = cc.ScaleTo(0.5, 1, 1);
                    actionArray.push(actionScaleDown);
                    actionArray.push(actionScaleUp);
                }
                var sequence = cc.sequence(actionArray);
                glowAnim.runAction(sequence);
                this.removeGlowAnimation(currentReelWidget, glowAnim);
            }
            if (this.areThreeSlotsSame){
                luckyBonusSound.playWin();
            }
            else {
                luckyBonusSound.playEnd();
            }
        }.bind(this), 1000);
    },

    runFlyingBonusTextAnimation: function(){
        var bonusText = this.getControl("bonusText", this.slotMachine);
        var bonusValue = this.getControl("value", bonusText);
        var totalGold = this.getControl("totalGold", this.slotMachine);

        var flyBonusValue = new ccui.Text();
        flyBonusValue.setName("flyBonusValue");
        flyBonusValue.setString(bonusValue.getString());
        flyBonusValue.setFontName("res/Lobby/GUILuckyBonus/tahomabd.ttf");
        flyBonusValue.setFontSize(20);
        flyBonusValue.setColor(cc.color(164, 98, 99));
        flyBonusValue.setPosition(cc.p(bonusValue.width, bonusValue.height));
        bonusValue.addChild(flyBonusValue);

        var action = cc.MoveBy(1, totalGold.x - bonusText.x - bonusValue.x, totalGold.y - bonusText.y - bonusValue.y);
        flyBonusValue.runAction(action);
        setTimeout(function() {
            bonusValue.removeAllChildren();
        }, 1000);
    },

    removeGlowAnimation: function(reel, anim){
        setTimeout(function() {
            reel.removeChild(anim);
        }, 3000);
    },

    checkSpinFinished: function(){
        for (var i = 0; i < this.reelList.length; i++){
            if (this.reelList[i].hasStopped !== true){
                return false;
            }
        }
        return true;
    },

    //update info
    updateStreak: function(newStreak){
        //update streak when reload scene, switch user, cheat, etc.
        if (!this.updateStreakAfterFreeSpin){
            if (this.currentStreak === newStreak){
                this.updateBonus();
                this.updateWinUpTo();
                return;
            }
            else {
                var lastStreak = this.getControl("bonus_" + (this.currentStreak + 1).toString(), this.slotMachine);
                //streak = 1 has a different posX of value
                var valueStreakIndex = this.currentStreak === 0 ? 0 : 1;
                lastStreak.loadTexture("res/Lobby/GUILuckyBonus/9.png");
                this.getControl("value", lastStreak).setPositionX(LuckyBonusScene.BONUS_VALUE_X[valueStreakIndex]);
                this.getControl("value", lastStreak).setColor(LuckyBonusScene.BONUS_VALUE_COLOR);
                this.getControl("percentIcon", lastStreak).setPositionX(LuckyBonusScene.BONUS_ICON_X[valueStreakIndex]);
                this.getControl("percentIcon", lastStreak).setColor(LuckyBonusScene.BONUS_ICON_COLOR);
                this.getControl("day", lastStreak).setPositionX(LuckyBonusScene.BONUS_DAY_X);

                var currentStreak = this.getControl("bonus_" + (newStreak + 1).toString(), this.slotMachine);
                var valueStreakIndex = newStreak === 0 ? 0 : 1;
                currentStreak.loadTexture("res/Lobby/GUILuckyBonus/10.png");
                this.getControl("value", currentStreak).setPositionX(LuckyBonusScene.STREAK_BONUS_VALUE_X[valueStreakIndex]);
                this.getControl("value", lastStreak).setColor(LuckyBonusScene.BONUS_VALUE_COLOR);
                this.getControl("percentIcon", currentStreak).setPositionX(LuckyBonusScene.STREAK_BONUS_ICON_X[valueStreakIndex]);
                this.getControl("percentIcon", lastStreak).setColor(LuckyBonusScene.BONUS_ICON_COLOR);
                this.getControl("day", currentStreak).setPositionX(LuckyBonusScene.STREAK_BONUS_DAY_X);

                var bonusImageTexture = "res/Lobby/GUILuckyBonus/ngay_" + (newStreak + 1).toString() + ".png";
                this.bonusImage.setPositionY(LuckyBonusScene.STREAK_BONUS_IMAGE_BASE_Y + newStreak * LuckyBonusScene.STREAK_BONUS_IMAGE_Y_INCREMENT);
                this.bonusImage.loadTexture(bonusImageTexture);
            }
            this.updateBonus();
            this.updateWinUpTo();

            this.currentStreak = newStreak;
        }
        //update streak after first free spin
        else {
            this.updateStreakAfterFreeSpin = false;
            var lastStreak = this.getControl("bonus_" + (this.currentStreak + 1).toString(), this.slotMachine);
            var actionFadeOut = cc.FadeOut(0.5);
            lastStreak.runAction(actionFadeOut);
            setTimeout(function() {
                //streak = 1 has a different posX of value
                var valueStreakIndex = this.currentStreak === 0 ? 0 : 1;
                lastStreak.loadTexture("res/Lobby/GUILuckyBonus/9.png");
                this.getControl("value", lastStreak).setPositionX(LuckyBonusScene.BONUS_VALUE_X[valueStreakIndex]);
                this.getControl("value", lastStreak).setColor(LuckyBonusScene.BONUS_VALUE_COLOR);
                this.getControl("percentIcon", lastStreak).setPositionX(LuckyBonusScene.BONUS_ICON_X[valueStreakIndex]);
                this.getControl("percentIcon", lastStreak).setColor(LuckyBonusScene.BONUS_ICON_COLOR);
                this.getControl("day", lastStreak).setPositionX(LuckyBonusScene.BONUS_DAY_X);
                var actionFadeIn = cc.FadeIn(0.5);
                lastStreak.runAction(actionFadeIn);

                var currentStreak = this.getControl("bonus_" + (newStreak + 1).toString(), this.slotMachine);
                var actionFadeOut = cc.FadeOut(0.5);
                currentStreak.runAction(actionFadeOut);
                setTimeout(function() {
                    var valueStreakIndex = newStreak === 0 ? 0 : 1;
                    currentStreak.loadTexture("res/Lobby/GUILuckyBonus/10.png");
                    this.getControl("value", currentStreak).setPositionX(LuckyBonusScene.STREAK_BONUS_VALUE_X[valueStreakIndex]);
                    this.getControl("value", lastStreak).setColor(LuckyBonusScene.BONUS_VALUE_COLOR);
                    this.getControl("percentIcon", currentStreak).setPositionX(LuckyBonusScene.STREAK_BONUS_ICON_X[valueStreakIndex]);
                    this.getControl("percentIcon", lastStreak).setColor(LuckyBonusScene.BONUS_ICON_COLOR);
                    this.getControl("day", currentStreak).setPositionX(LuckyBonusScene.STREAK_BONUS_DAY_X);
                    var actionFadeIn = cc.FadeIn(0.5);
                    currentStreak.runAction(actionFadeIn);

                    var actionMoveBy = cc.MoveBy(0.5, 0, LuckyBonusScene.STREAK_BONUS_IMAGE_BASE_Y + newStreak * LuckyBonusScene.STREAK_BONUS_IMAGE_Y_INCREMENT - this.bonusImage.getPositionY());
                    actionMoveBy.easing(cc.easeBackInOut());
                    this.bonusImage.runAction(actionMoveBy);

                    setTimeout(function() {
                        var bonusImageTexture = "res/Lobby/GUILuckyBonus/ngay_" + (newStreak + 1).toString() + ".png";
                        this.bonusImage.setPositionY(LuckyBonusScene.STREAK_BONUS_IMAGE_BASE_Y + newStreak * LuckyBonusScene.STREAK_BONUS_IMAGE_Y_INCREMENT);
                        this.bonusImage.loadTexture(bonusImageTexture);
                    }.bind(this), 500);

                    this.updateBonus();
                    this.updateWinUpTo();

                    this.currentStreak = newStreak;
                }.bind(this), 500);
            }.bind(this), 500);
        }
    },

    updateBonus: function(){
        var bonusValue = this.getControl("bonusText", this.slotMachine);

        if (NewVipManager.getInstance().getRemainTime() > 0){
            this.getControl("value", bonusValue).setString("+" + (LuckyBonusManager.getInstance().streakBonus[LuckyBonusManager.getInstance().userCurrentStreak] + LuckyBonusManager.getInstance().vipBonus[LuckyBonusManager.getInstance().userVipLevel]).toString() + "%");
        }
        else{
            this.getControl("value", bonusValue).setString("+" + LuckyBonusManager.getInstance().streakBonus[LuckyBonusManager.getInstance().userCurrentStreak].toString() + "%");
        }
    },

    resetBonus: function(){
        var bonusValue = this.getControl("bonusText", this.slotMachine);
        this.getControl("value", bonusValue).setString("+0%");
    },

    updateWinUpTo: function(){
        var winUpToValue = this.getControl("winUpTo", this.slotMachine);
        this.winUpTo = this.calculateMaxReward();
        this.getControl("value", winUpToValue).setString(this.formatGoldValue(this.winUpTo));
    },

    updateUserResource: function(){
        this.updateUserGold();
        this.updateUserG();
    },

    updateUserGold: function(){
        var userGold = this.getControl("userGold", this.pBotLeft);

        this.getControl("value", userGold).setString(this.formatGoldValue(gamedata.userData.bean));
    },

    runUpdateUserGoldAnimation: function(){
        var userGold = this.getControl("userGold", this.pBotLeft);

        //update in 50 loops, 0.02s/1 loop
        this.userCurrentGold += this.totalGold / 50;
        this.getControl("value", userGold).setString(this.formatGoldValue(this.userCurrentGold));

        if (this.userCurrentGold >= gamedata.userData.bean){
            this.unschedule(this.runUpdateUserGoldAnimation);
        }
    },

    updateUserG: function(){
        var userG = this.getControl("userG", this.pBotLeft);

        this.getControl("value", userG).setString(this.formatGoldValue(gamedata.userData.coin));
    },

    updateVipInfo: function(){
        var userVipInfo = this.getControl("vip", this.slotMachine);
        this.updateVipIcon();
        this.getControl("level", userVipInfo).setString("VIP" + LuckyBonusManager.getInstance().userVipLevel);
        this.getControl("bonus", userVipInfo).setString("+" + LuckyBonusManager.getInstance().vipBonus[LuckyBonusManager.getInstance().userVipLevel] + "%");

        this.updateBonus();
        this.updateWinUpTo();
    },

    updateVipIcon: function(){
        var userVipInfo = this.getControl("vip", this.slotMachine);
        var oldVipIcon = this.getControl("icon", userVipInfo);

        userVipInfo.removeChild(oldVipIcon);

        if (LuckyBonusManager.getInstance().userVipLevel === 0){
            var vipIcon = new ccui.ImageView("res/Lobby/GUIVipNew/imgVipFree.png");
        }
        else {
            var vipIcon = new ccui.ImageView("res/Lobby/GUIVipNew/iconVipNormal/iconVipNormal" + LuckyBonusManager.getInstance().userVipLevel + ".png");
        }

        vipIcon.setName("icon");
        vipIcon.setPosition(LuckyBonusScene.VIP_ICON_POSITION);
        vipIcon.setScale(LuckyBonusScene.VIP_ICON_SCALE[LuckyBonusManager.getInstance().userVipLevel], LuckyBonusScene.VIP_ICON_SCALE[LuckyBonusManager.getInstance().userVipLevel]);
        userVipInfo.addChild(vipIcon);
    },

    updateSpinBtn: function(){
        if (LuckyBonusManager.getInstance().userNumberOfFreeSpin === 0){
            this.spinBtn.loadTextures("res/Lobby/GUILuckyBonus/13.png", "res/Lobby/GUILuckyBonus/13.png", "res/Lobby/GUILuckyBonus/13.png");
            this.getControl("betG", this.slotMachine).setVisible(true);
        }
        else {
            this.spinBtn.loadTextures("res/Lobby/GUILuckyBonus/12.png", "res/Lobby/GUILuckyBonus/12.png", "res/Lobby/GUILuckyBonus/12.png");
            this.getControl("betG", this.slotMachine).setVisible(false);
        }
    },

    updateBetG: function(){
        var betGValue = this.getControl("betG", this.slotMachine);
        var winUpToValue = this.getControl("winUpTo", this.slotMachine);
        this.winUpTo = this.calculateMaxReward();

        this.getControl("value", betGValue).setString(this.betG.toString());
        this.getControl("value", betGValue).x = LuckyBonusScene.BET_G_VALUE_POSITION[this.betLevel];
        this.getControl("betGIcon", betGValue).x = this.getControl("value", betGValue).width + LuckyBonusScene.BET_G_ICON_POS_OFFSET;
        this.getControl("value", winUpToValue).setString(this.formatGoldValue(this.winUpTo));
    },

    runUpdateGoldAnimation: function(){
        luckyBonusSound.playGoldCoin();
        var totalGoldPos = this.getControl("totalGold", this.slotMachine);
        var animStartPos = new cc.p(
            this.slotMachine.x - this.slotMachine.width / 2 + totalGoldPos.x,
            this.slotMachine.y - this.slotMachine.height / 2 + totalGoldPos.y
        );
        var pBotLeft = this.getControl("pBotLeft", this._layout);
        var animEndPos = this.getControl("userGold", pBotLeft).getPosition();
        if (this.totalGold >= 1000000){
            var time = effectMgr.flyCoinEffect(this, this.totalGold, this.totalGold / 50, animStartPos, animEndPos);
        }
        else {
            var time = effectMgr.flyCoinEffect(this, this.totalGold, this.totalGold / 10, animStartPos, animEndPos);
        }
    },

    //utilities
    calculateMaxReward: function(){
        if (LuckyBonusManager.getInstance().userNumberOfFreeSpin === 0){
            return LuckyBonusManager.getInstance().rollResultConfig[0].gold * LuckyBonusManager.getInstance().gToGoldFactor * (1 + (LuckyBonusManager.getInstance().streakBonus[LuckyBonusManager.getInstance().userCurrentStreak] + LuckyBonusManager.getInstance().vipBonus[LuckyBonusManager.getInstance().userVipLevel]) / 100) * this.betG;
        }
        else {
            return LuckyBonusManager.getInstance().rollResultConfig[0].gold * (1 + (LuckyBonusManager.getInstance().streakBonus[LuckyBonusManager.getInstance().userCurrentStreak] + LuckyBonusManager.getInstance().vipBonus[LuckyBonusManager.getInstance().userVipLevel]) / 100);
        }
    },

    showTotalGold: function(){
        //each loop is 0.02s, result in 1-second animation of updating gold value
        var numberOfUpdateLoops = 50;
        this.currentGold += this.baseGold * this.lastRollBetG / numberOfUpdateLoops;
        this.getControl("totalGold", this.slotMachine).setString(this.formatTotalGoldValue(this.currentGold) + "$");
        if (this.currentGold >= this.baseGold * this.lastRollBetG){
            this.unschedule(this.showTotalGold);
            this.runFlyingBonusTextAnimation();
            setTimeout(function() {
                this.schedule(this.showBonusGold, 0.02);
            }.bind(this), 1000);
        }
    },

    showBonusGold: function(){
        //each loop is 0.02s, result in 0.5-second animation of updating gold value
        var numberOfUpdateLoops = 25;
        this.currentGold += (this.totalGold - this.baseGold * this.lastRollBetG) / numberOfUpdateLoops;
        this.getControl("totalGold", this.slotMachine).setString(this.formatTotalGoldValue(this.currentGold) + "$");
        if (this.currentGold >= this.totalGold){
            this.unschedule(this.showBonusGold);
            this.runUpdateGoldAnimation();
            setTimeout(function() {
                luckyBonusSound.playScoreCount();
                this.userCurrentGold = gamedata.userData.bean - this.totalGold;
                this.schedule(this.runUpdateUserGoldAnimation, 0.02);
                this.updateSpinBtn();
                this.resetTotalGold();
                this.updateStreak(LuckyBonusManager.getInstance().userCurrentStreak);
                this.setBackEnable(true);
                this.enableAllBtn();
            }.bind(this), 2500);
        }
    },

    checkUserVipExpire: function(dt){
        this.userVipRemainTime -= dt;
        if (this.userVipRemainTime <= 0){
            LuckyBonusManager.getInstance().userVipLevel = 0;
            LuckyBonusManager.getInstance().userVipRemainTime = 0;
            this.updateVipInfo();
            this.unschedule(this.checkUserVipExpire);
        }
    },

    resetTotalGold: function(){
        this.currentGold = 0;
        this.lastRollBetG = 0;
        this.getControl("totalGold", this.slotMachine).setString("0$");
    },

    resetBetG: function(){
        this.betLevel = 0;
        this.betG = LuckyBonusManager.getInstance().allowG[this.betLevel];
        this.updateBetG();
    },

    resetSlot: function(){
        this.reelList = [];
    },

    resetPosition: function(){
        this.resetStreakPosition();
        this.resetUserInfoPosition();
        this.resetTipPosition();
    },

    resetStreakPosition: function(){
        for (var i = 1; i <= LuckyBonusScene.MAX_STREAK_DAY; i++){
            var currentStreak = this.getControl("bonus_" + i.toString(), this.slotMachine);
            currentStreak.x = LuckyBonusScene.BONUS_X;
        }

        var bonusIcon = this.getControl("bonusIcon", this.slotMachine);
        bonusIcon.y = LuckyBonusScene.STREAK_BONUS_IMAGE_BASE_Y + this.currentStreak * LuckyBonusScene.STREAK_BONUS_IMAGE_Y_INCREMENT;
    },

    resetUserInfoPosition: function(){
        var userAvatar = this.getControl("userAvatar", this.pBotLeft);
        var userGold = this.getControl("userGold", this.pBotLeft);
        var userG = this.getControl("userG", this.pBotLeft);

        userAvatar.y = LuckyBonusScene.USER_AVATAR_Y;
        userGold.y = LuckyBonusScene.USER_GOLD_Y;
        userG.y = LuckyBonusScene.USER_G_Y;
    },

    resetTipPosition: function(){
        var tipBtn = this.getControl("tipBtn", this.pBotRight);
        var tip = this.getControl("tip", this.pBotRight);

        tipBtn.y = LuckyBonusScene.TIP_BTN_Y;
        tip.y = LuckyBonusScene.TIP_Y;
    },

    removeAllExistingEffect: function(){
        //remove glowing effect if exists (due to disconnect)
        for (var i = 0; i < LuckyBonusScene.NUMBER_OF_REELS; i++){
            var currentReelWidget = this.getControl("reel_" + i.toString(), this.slotMachine);
            var glowAnim = this.getControl("glowAnim", currentReelWidget);

            currentReelWidget.removeChild(glowAnim);
        }

        //remove flying bonus text if exists
        var bonusText = this.getControl("bonusText", this.slotMachine);
        var bonusValue = this.getControl("value", bonusText);
        bonusValue.removeAllChildren();
    },

    clearAllTimeout: function(){
        var id = window.setTimeout(function() {}, 0);

        while (id--) {
            window.clearTimeout(id);
        }
    },

    formatGoldValue: function(value){
        if (value < 1000000){
            var totalGold = value;
            var resultString = "";

            while (Math.floor(totalGold / 1000) !== 0){
                var addedString = (totalGold % 1000).toString();
                while (addedString.length < 3){
                    addedString = "0" + addedString;
                }
                resultString = "." + addedString + resultString;
                totalGold = Math.floor(totalGold / 1000);
            }

            resultString = (totalGold % 1000).toString() + resultString;
            return resultString;
        }
        else if (value < 1000000000){
            var totalGold = value;

            //1 decimal
            var resultString = Math.floor(totalGold / 1000000 * 10) / 10 + "M";

            return resultString;
        }
        else {
            var totalGold = value;

            //1 decimal
            var resultString = Math.floor(totalGold / 1000000000 * 10) / 10 + "B";

            return resultString;
        }
    },

    formatTotalGoldValue: function(value){
        var totalGold = value;
        var resultString = "";

        while (Math.floor(totalGold / 1000) !== 0){
            var addedString = (totalGold % 1000).toString();
            while (addedString.length < 3){
                addedString = "0" + addedString;
            }
            resultString = "." + addedString + resultString;
            totalGold = Math.floor(totalGold / 1000);
        }

        resultString = (totalGold % 1000).toString() + resultString;
        return resultString;
    },

    checkEnoughG: function(){
        if (this.betG <= gamedata.userData.coin){
            return true;
        }
        else {
            return false;
        }
    },

    //button enable/disable
    disableAllBtn: function(){
        this.exitBtn.setEnabled(false);
        this.spinBtn.setEnabled(false);
        this.reduceBetGBtn.setEnabled(false);
        this.addBetGBtn.setEnabled(false);
        this.addGoldBtn.setEnabled(false);
        this.addGBtn.setEnabled(false);
        this.avatarBtn.setEnabled(false);
    },

    enableAllBtn: function(){
        this.exitBtn.setEnabled(true);
        this.spinBtn.setEnabled(true);
        this.reduceBetGBtn.setEnabled(true);
        this.addBetGBtn.setEnabled(true);
        this.addGoldBtn.setEnabled(true);
        this.addGBtn.setEnabled(true);
        this.avatarBtn.setEnabled(true);
    },

    //buttons' handlers
    onButtonRelease: function(btn, id){
        switch(id){
            case LuckyBonusScene.BTN_EXIT:
                this.onBack();
                break;

            case LuckyBonusScene.BTN_SPIN:
                this.unschedule(this.showHandTip);

                if (LuckyBonusManager.getInstance().userNumberOfFreeSpin > 0){
                    this.lastRollBetG = 1;
                    this.disableAllBtn();
                    this.setBackEnable(false);
                    LuckyBonusManager.getInstance().sendRollLuckyBonus(LuckyBonusScene.ROLL_FREE, LuckyBonusScene.FREE_ROLL_CHARGE_CONSUME);
                }
                else {
                    if (this.checkEnoughG()){
                        this.disableAllBtn();
                        this.setBackEnable(false);
                        this.lastRollBetG = this.betG;
                        LuckyBonusManager.getInstance().sendRollLuckyBonus(LuckyBonusScene.ROLL_G, this.betG);
                    }
                    else{
                        sceneMgr.openGUI(NotEnoughGPopup.className, LuckyBonusManager.NOT_ENOUGH_G_POP_UP, LuckyBonusManager.NOT_ENOUGH_G_POP_UP);
                    }
                }
                break;

            case LuckyBonusScene.BTN_REDUCE_BET:
                if (this.betLevel > 0){
                    this.betLevel -= 1;
                    this.betG = LuckyBonusManager.getInstance().allowG[this.betLevel];
                    this.updateBetG();
                }
                break;

            case LuckyBonusScene.BTN_ADD_BET:
                if (this.betLevel < LuckyBonusManager.getInstance().allowG.length - 1){
                    this.betLevel += 1;
                    this.betG = LuckyBonusManager.getInstance().allowG[this.betLevel];
                    this.updateBetG();
                }
                break;

            case LuckyBonusScene.BTN_ADD_GOLD:
                gamedata.openShop();
                break;

            case LuckyBonusScene.BTN_ADD_G:
                gamedata.openNapG();
                break;

            case LuckyBonusScene.BTN_AVATAR:
                sceneMgr.openGUI(CheckLogic.getUserInfoClassName(), LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO).setInfo(gamedata.userData);
                break;

            case LuckyBonusScene.BTN_REWARD_DETAIL:
                sceneMgr.openGUI(PrizeDetailPopup.className, LuckyBonusManager.PRIZE_DETAIL_POP_UP, LuckyBonusManager.PRIZE_DETAIL_POP_UP);
                break;

            case LuckyBonusScene.BTN_CHEAT:
                this.pCheat.setVisible(!this.pCheat.isVisible());
                break;

            case LuckyBonusScene.BTN_CHEAT_USER_DATA:
                var streakIndex = this.pCheatUserData.streakIndex.getString();
                var numSpin = this.pCheatUserData.numSpin.getString();

                streakIndex = streakIndex || 0;
                numSpin = numSpin || 0;
                streakIndex = parseInt(streakIndex);
                numSpin = parseInt(numSpin);

                LuckyBonusManager.getInstance().sendCheatUserLuckyBonusData(streakIndex, numSpin);
                break;

            case LuckyBonusScene.BTN_CHEAT_ROLL_RESULT:
                var numG = this.pCheatRollResult.numG.getString();
                var result = this.pCheatRollResult.result.getString();

                numG = numG || 0;
                result = result || "0#0#0";
                numG = parseInt(numG);

                LuckyBonusManager.getInstance().sendCheatRollResult(numG, result);
                break;

            case LuckyBonusScene.BTN_CHECK_ROLL_RATIO:
                var numRoll = this.pCheckRollRatio.numRoll.getString();
                var itemCheckRaw = this.pCheckRollRatio.itemCheck.getString();

                numRoll = numRoll || 0;
                numRoll = parseInt(numRoll);
                itemCheckRaw = itemCheckRaw || "-1#-1"
                itemCheckRaw = itemCheckRaw.split("#");

                for (var i = 0; i < itemCheckRaw.length; i++){
                    itemCheckRaw[i] = parseInt(itemCheckRaw[i]);
                }

                var itemCheck = [];
                for (var i = 0; i < LuckyBonusManager.REQUEST_CHECK_ROLL_RATIO_ARRAY_ITEM_MAX_LENGTH; i++){
                    if (itemCheckRaw[i] >= 0){
                        itemCheck.push(itemCheckRaw[i]);
                    }
                }

                LuckyBonusManager.getInstance().sendCheckRollRatio(numRoll, itemCheck);
                break;
        }
    },

    onBack: function(){
        sceneMgr.openScene(LobbyScene.className);
    },

    onExit: function(){
        this._super();
        audioEngine.stopAllEffects();
        audioEngine.stopMusic();
        this.stopAllActions();
        this.resetBetG();
        this.resetSlot();
        this.unscheduleAllCallbacks();
        this.resetPosition();
        this.clearAllTimeout();
    }
});

//classname list
LuckyBonusScene.className = "LuckyBonusScene";

//btn
LuckyBonusScene.BTN_EXIT = 1;
LuckyBonusScene.BTN_SPIN = 2;
LuckyBonusScene.BTN_REDUCE_BET = 3;
LuckyBonusScene.BTN_ADD_BET = 4;
LuckyBonusScene.BTN_ADD_GOLD = 5;
LuckyBonusScene.BTN_ADD_G = 6;
LuckyBonusScene.BTN_AVATAR = 7;
LuckyBonusScene.BTN_REWARD_DETAIL = 8;

LuckyBonusScene.BTN_CHEAT = 9;
LuckyBonusScene.BTN_CHEAT_USER_DATA = 10;
LuckyBonusScene.BTN_CHEAT_ROLL_RESULT = 11;
LuckyBonusScene.BTN_CHECK_ROLL_RATIO = 12;

//logic config
LuckyBonusScene.NUMBER_OF_REELS = 3;
LuckyBonusScene.NUMBER_OF_SLOTS_PER_REEL = 10;
LuckyBonusScene.MAX_STREAK_DAY = 7;
LuckyBonusScene.BASE_BONUS = 10;
LuckyBonusScene.AFK_THRESHOLD = 10;
LuckyBonusScene.SEND_LOG_TOOLTIP_THRESHOLD = 5;

//position config
LuckyBonusScene.BONUS_X = 37;
LuckyBonusScene.BONUS_BASE_Y = 10;
LuckyBonusScene.BONUS_Y_INCREMENT = 40;
LuckyBonusScene.BONUS_VALUE_X = [28, 32];
LuckyBonusScene.BONUS_VALUE_Y = 18;
LuckyBonusScene.BONUS_VALUE_ANCHOR = cc.p(1, 0.5);
LuckyBonusScene.BONUS_VALUE_COLOR = cc.color(164, 98, 99);
LuckyBonusScene.BONUS_ICON_X = [28, 32];
LuckyBonusScene.BONUS_ICON_Y = 17;
LuckyBonusScene.BONUS_ICON_ANCHOR = cc.p(0, 0.5);
LuckyBonusScene.BONUS_ICON_COLOR = cc.color(164, 98, 99);
LuckyBonusScene.BONUS_DAY_X = 48;
LuckyBonusScene.BONUS_DAY_Y = 28;
LuckyBonusScene.BONUS_DAY_ANCHOR = cc.p(1, 0.5);
LuckyBonusScene.BONUS_DAY_COLOR = cc.color(255, 255, 255);

LuckyBonusScene.STREAK_BONUS_VALUE_X = [39, 42];
LuckyBonusScene.STREAK_BONUS_VALUE_Y = 18;
LuckyBonusScene.STREAK_BONUS_VALUE_COLOR = cc.color(247, 255, 126);
LuckyBonusScene.STREAK_BONUS_ICON_X = [39, 42];
LuckyBonusScene.STREAK_BONUS_ICON_Y = 17;
LuckyBonusScene.STREAK_BONUS_ICON_COLOR = cc.color(247, 255, 126);
LuckyBonusScene.STREAK_BONUS_DAY_X = 62;
LuckyBonusScene.STREAK_BONUS_DAY_Y = 28;
LuckyBonusScene.STREAK_BONUS_IMAGE_X = 100;
LuckyBonusScene.STREAK_BONUS_IMAGE_BASE_Y = 40;
LuckyBonusScene.STREAK_BONUS_IMAGE_Y_INCREMENT = 40;

LuckyBonusScene.NUMBER_OF_LEVER_FRAME = 9;

LuckyBonusScene.SLOT_X = 50;
LuckyBonusScene.SLOT_BASE_Y = 80;
LuckyBonusScene.SLOT_Y_INCREMENT = 100;
LuckyBonusScene.SLOT_COVER_POSITION = cc.p(50, 77.5);

LuckyBonusScene.USER_AVATAR_Y = 0;
LuckyBonusScene.USER_GOLD_Y = 24;
LuckyBonusScene.USER_G_Y = 24;

LuckyBonusScene.TIP_BTN_Y = 35;
LuckyBonusScene.TIP_Y = 25;

LuckyBonusScene.VIP_ICON_SCALE = [0.35, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.7, 0.7, 0.7, 0.7];
LuckyBonusScene.VIP_ICON_POSITION = cc.p(45, 40);

LuckyBonusScene.BET_G_VALUE_POSITION = [70, 70, 75, 75, 75, 75, 80];
LuckyBonusScene.BET_G_ICON_POS_OFFSET = 10;
LuckyBonusScene.ROLL_FREE = 0;
LuckyBonusScene.ROLL_G = 1;
LuckyBonusScene.FREE_ROLL_CHARGE_CONSUME = 1;

var LuckyBonusButton = cc.Node.extend({
    ctor: function(){
        this._super();

        this.bg = ccui.ImageView("Lobby/GUILuckyBonus/iconLobby/slotMachine.png");
        this.addChild(this.bg);
        this.reels = new ccui.ImageView("Lobby/GUILuckyBonus/iconLobby/reels.png");
        this.reels.setPosition(0.5, 10);
        this.addChild(this.reels);
        this.lever = new cc.Sprite("Lobby/GUILuckyBonus/iconLobby/lever_1.png");
        this.lever.setPosition(-25, 10);
        this.addChild(this.lever, -1);
        this.hot = new ccui.ImageView("Lobby/GUILuckyBonus/iconLobby/hot.png");
        this.hot.setPosition(17, 25);
        this.addChild(this.hot, 1);

        for (var i = 0; i < LuckyBonusButton.NUMBER_OF_REELS; i++){
            var reel = new ccui.Layout();
            reel.setAnchorPoint(0.5, 0.5);
            reel.setContentSize(LuckyBonusButton.REEL_SIZE);
            reel.setPosition(LuckyBonusButton.REEL_SIZE.width/2 + 10 * i, 1 + LuckyBonusButton.REEL_SIZE.height/2);
            reel.setClippingEnabled(true);
            this.reels.addChild(reel, 0, i);

            var slot = new ccui.ImageView("Lobby/GUILuckyBonus/iconLobby/slot.png");
            slot.setPosition(LuckyBonusButton.REEL_POS.x, LuckyBonusButton.REEL_POS.y);
            reel.addChild(slot, 0, 0);

            slot = new ccui.ImageView("Lobby/GUILuckyBonus/iconLobby/slot.png");
            slot.setPosition(LuckyBonusButton.REEL_POS.x, LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
            reel.addChild(slot, 0, 1);
        }

        this.btn = new ccui.Button();
        this.btn.ignoreContentAdaptWithSize(false);
        this.btn.setContentSize(this.bg.getContentSize());
        this.btn.setAnchorPoint(0.5, 0.5);
        this.addChild(this.btn);
        this.btn.addClickEventListener(function(){
            LuckyBonusManager.getInstance().enterLuckyBonusScene = true;
            LuckyBonusManager.getInstance().userClickedLuckyBonusIcon = true;
            LuckyBonusManager.getInstance().sendGetUserInfo(1);
        });
    },

    onEnter: function(){
        this._super();

        for (var i = 0; i < LuckyBonusButton.NUMBER_OF_REELS; i++){
            var reel = this.reels.getChildByTag(i);
            var slot0 = reel.getChildByTag(0);
            slot0.setPositionY(LuckyBonusButton.REEL_POS.y);
            slot0.stopAllActions();
            slot0.runAction(cc.sequence(
                cc.delayTime(1.1),
                cc.sequence(
                    cc.moveBy(0.4, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineIn()),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot0)),
                    cc.moveBy(0.05, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineIn())
                ),
                cc.sequence(
                    cc.moveBy(0.025, 0, -LuckyBonusButton.REEL_SIZE.height),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot0)),
                    cc.moveBy(0.025, 0, -LuckyBonusButton.REEL_SIZE.height)
                ).repeat(28 + i * 10),
                cc.sequence(
                    cc.moveBy(0.05, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineOut()),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot0)),
                    cc.moveBy(0.4, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineOut()).easing(cc.easeBackOut())
                ),
                cc.delayTime(3.4 + 10 * (LuckyBonusButton.NUMBER_OF_REELS - i - 1) * 0.05)
            ).repeatForever());

            var slot1 = reel.getChildByTag(1);
            slot1.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
            slot1.runAction(cc.sequence(
                cc.delayTime(1.1),
                cc.sequence(
                    cc.moveBy(0.4, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineIn()),
                    cc.moveBy(0.05, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineIn()),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot1))
                ),
                cc.sequence(
                    cc.moveBy(0.05, 0, -2 * LuckyBonusButton.REEL_SIZE.height),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot1))
                ).repeat(28 + i * 10),
                cc.sequence(
                    cc.moveBy(0.05, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineOut()),
                    cc.moveBy(0.4, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineOut()).easing(cc.easeBackOut()),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot1))
                ),
                cc.delayTime(3.4 + 10 * (LuckyBonusButton.NUMBER_OF_REELS - i - 1) * 0.05)
            ).repeatForever());
        }

        var frames = [];
        for (var i = 0; i < 3; i++){
            var frame = new cc.SpriteFrame("Lobby/GUILuckyBonus/iconLobby/lever_" + (i+1).toString() + ".png", cc.rect(0, 0, 17, 33));
            frames.push(frame);
        }
        var anim = new cc.Animation(frames, 0.05);

        this.lever.setTexture("Lobby/GUILuckyBonus/iconLobby/lever_1.png");
        this.lever.runAction(cc.sequence(
            cc.delayTime(1),
            cc.animate(anim).easing(cc.easeSineOut()),
            cc.delayTime(0.2),
            cc.animate(anim).reverse().easing(cc.easeSineIn()),
            cc.delayTime(6.3)
        ).repeatForever());

        this.showNotify(false);
    },

    showNotify: function(show){
        this.hot.setVisible(show);
        this.hot.stopAllActions();
        if (show){
            this.hot.runAction(cc.sequence(
                cc.show(),
                cc.delayTime(0.5),
                cc.hide(),
                cc.delayTime(1)
            ).repeatForever());
        }
    }
});
LuckyBonusButton.NUMBER_OF_REELS = 3;
LuckyBonusButton.REEL_SIZE = cc.size(9, 17);
LuckyBonusButton.REEL_POS = cc.p(5, 8);
