/**
 * Created by AnhLN6 on 11/4/2021
 * Main GUI of Fortune Cat
 */

var FortuneCatMainLayer = BaseLayer.extend({
    ctor: function(){
        this._super(FortuneCatMainLayer.className);

        ///user info
        this.unlockingCatImage = null;
        this.remainDuration = null;
        this.secondCounter = 0;
        this.flipClockCounter = 0;

        ///user interaction info
        this.catTouched = null;
        this.catTouchedIndex = null;
        this.catTouchedLocation = null;

        ///GUI components info storage
        this.catSlotList = [];
        this.catSlotImageList = [];
        this.catSlotImageBasePositionList = [];
        this.catSlotBgTimeList = [];
        this.catSlotTimeList = [];
        this.catSlotRects = [];
        this.mainCatRect = null;

        this.progressTooltipRect = null;

        ///animation info
        ///finger tool tip
        this.afkTime = 0;
        this.currentLoop = 0;

        this.initWithBinaryFile("GUIFortuneCat.json");
    },

    initGUI: function(){
        ///GUI components
        this.progressTooltip = this.getControl("progressTooltip", this._layout);
        this.fingerTooltip = this.getControl("fingerTooltip", this._layout);
        this.decoration = this.getControl("decoration", this._layout);
        this.pTopRight = this.getControl("pTopRight", this._layout);
        this.catSlots = this.getControl("catSlots", this._layout);
        this.mainCat = this.getControl("mainCat", this._layout);
        this.guide = this.getControl("guide", this._layout);

        this.mainCatSilhouette = this.getControl("silhouette", this.mainCat);
        this.mainCatBody = this.getControl("cat", this.mainCat);
        this.mainCatImage = this.getControl("catImg", this.mainCatBody);
        this.sandClockIcon = this.getControl("icon", this.mainCatBody);
        this.getControl("btnReceiveReward", this.mainCat).setVisible(false);

        ///decoration
        this.sun1 = this.getControl("sun_1", this.decoration);
        this.sun2 = this.getControl("sun_2", this.decoration);
        this.sun3 = this.getControl("sun_3", this.decoration);
        this.sun4 = this.getControl("sun_4", this.decoration);

        ///cheat
        this.pCheat = this.getControl("pCheat", this._layout);
        this.btnCheat = this.customButton("btnCheat", FortuneCatMainLayer.BTN_CHEAT, this._layout);
        this.btnCheatCat = this.customButton("btnCheatCat", FortuneCatMainLayer.BTN_CHEAT_CAT, this.pCheat);
        this.btnCheatBell = this.customButton("btnCheatBell", FortuneCatMainLayer.BTN_CHEAT_BELL, this.pCheat);
        this.btnCheatUnlock = this.customButton("btnCheatUnlock", FortuneCatMainLayer.BTN_CHEAT_UNLOCK, this.pCheat);
        this.numBellCheat = this.getControl("numBell", this.pCheat);
        this.catIdListCheat = this.getControl("catIdList", this.pCheat);
        this.btnCheat.setVisible(Config.ENABLE_CHEAT);

        ///set up GUI components info
        ///the rect that covers the hit box of the main cat showed when unlocking one
        this.mainCatRect = cc.rect(60, 50, 200, 200);
        this.progressTooltipRect = cc.rect(39, -3, 82, 26);
        this.addCatSlotRect();

        ///logic buttons
        this.btnClose = this.customButton("btnClose", FortuneCatMainLayer.BTN_CLOSE, this.pTopRight);
        this.btnGuide = this.customButton("btnGuide", FortuneCatMainLayer.BTN_GUIDE, this.pTopRight);
        this.btnPlay = this.customButton("btnPlay", FortuneCatMainLayer.BTN_PLAY, this.mainCat);
        this.btnReceiveReward = this.customButton("btnReceiveReward", FortuneCatMainLayer.BTN_RECEIVE_REWARD, this.mainCat);
        this.btnCloseGuide = this.customButton("btnCloseGuide", FortuneCatMainLayer.BTN_CLOSE_GUIDE, this.guide);

        ///action listeners
        this.addTouchCatListener();
        this.addTouchProgressToolTipListener();

        ///finger tooltip
        this.finger = this.getControl("finger", this.fingerTooltip);
        this.fingerTrait = this.getControl("fingerTrait", this.fingerTooltip);
        this.finger.setVisible(false);
        this.fingerTrait.setVisible(false);

        ///progress tooltip
        this.progressTooltipContent = this.getControl("tooltip", this.progressTooltip);
        this.progressTooltipContent.setVisible(false);
        this.progressValue = this.getControl("progress", this.progressTooltip);

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function(){
        this.unscheduleAllCallbacks();
        this.resetFingerTooltip();
        this.resetProgressTooltip();
        this.resetSandClock();
        this.resetBtnReceiveRewardScale();
        this.resetSunPosition();
        this.resetLayoutScale();

        ///if no cat then show guide
        this.checkShowGuide();

        ///no cat or currently unlocking a cat then hide tooltip
        if (FortuneCatManager.getInstance().userCatIdList.length === 0 || FortuneCatManager.getInstance().userOpenCatId !== -1){
            this.fingerTooltip.setVisible(false);
        }
        else {
            this.fingerTooltip.setVisible(true);
            this.schedule(this.showTooltipFinger, FortuneCatMainLayer.UPDATE_FINGER_TOOLTIP_INTERVAL);
        }

        ///currently unlocking a cat then schedule the clock
        if (FortuneCatManager.getInstance().userOpenCatId !== null && FortuneCatManager.getInstance().userOpenCatId !== -1){
            this.updateRemainTime();
            this.updateUnlockingCatGoldValue();
            this.updateCatTitle(FortuneCatManager.getInstance().userOpenCatId);
            this.loadUnlockingCatImage(FortuneCatManager.getInstance().userOpenCatId);
            if (typeof sp !== 'undefined') {
                this.unlockingCatImage.setAnimation(
                    0,
                    "meo " + (FortuneCatManager.getInstance().userOpenCatId + 1).toString() + " idle",
                    true);
            }
        }

        ///update GUI components
        this.updateCatSlotList(FortuneCatManager.getInstance().userCatIdList);
        this.updateMainCat(FortuneCatManager.getInstance().userOpenCatId);
        this.updateProgressValue(FortuneCatManager.getInstance().userNumBell, FortuneCatManager.getInstance().userCatIdList.length);

        ///add animation
        this.animateSun();
        this.animateLayoutIn();
        this.animatePlayNowButton();
    },

    ///start - animate decoration
    animateSun: function(){
        ///numbers based on feeling when run animation
        this.sun1.runAction(cc.sequence(
            cc.moveBy(1.5, 10, 0),
            cc.moveBy(1.5, -10, 0)
        ).repeatForever());
        this.sun2.runAction(cc.sequence(
            cc.moveBy(1.75, 0, 20),
            cc.moveBy(1.75, 0, -20)
        ).repeatForever());
        this.sun3.runAction(cc.sequence(
            cc.moveBy(2.0, 0, 10),
            cc.moveBy(2.0, 0, -10)
        ).repeatForever());
        this.sun4.runAction(cc.sequence(
            cc.moveBy(1.25, -10, 0),
            cc.moveBy(1.25, 10, 0)
        ).repeatForever());
    },

    resetSunPosition: function(){
        this.sun1.setPosition(FortuneCatMainLayer.SUN_1_POS);
        this.sun2.setPosition(FortuneCatMainLayer.SUN_2_POS);
        this.sun3.setPosition(FortuneCatMainLayer.SUN_3_POS);
        this.sun4.setPosition(FortuneCatMainLayer.SUN_4_POS);
    },

    ///animate main GUI when open
    animateLayoutIn: function(){
        var winSize = cc.director.getWinSize();

        this._layout.setPosition(winSize.width / 2, winSize.height / 2);
        this._layout.setAnchorPoint(0.5, 0.5);
        this._layout.setScale(0.5);

        ///numbers based on feeling when run animation
        this._layout.runAction(cc.sequence(
            cc.scaleTo(0.2, 1.05).easing(cc.easeBackOut()),
            cc.scaleTo(0.2, 1).easing(cc.easeBackOut())
            ));
    },

    ///animate main GUI when close
    animateLayoutOut: function(){
        ///numbers based on feeling when run animation
        this._layout.runAction(cc.sequence(
            cc.scaleTo(0.1, 1.05).easing(cc.easeBackOut()),
            cc.scaleTo(0.1, 0.5)
        ));
    },

    resetLayoutScale: function(){
        this._layout.setScale(1);
    },

    animatePlayNowButton: function(){
        this.btnPlay.runAction(cc.sequence(cc.scaleTo(0.5, 1.1), cc.scaleTo(0.5, 1)).repeatForever());
    },
    ///end - animate decoration

    ///start - tooltip finger animation
    ///display the tooltip after every set interval
    showTooltipFinger: function(dt){
        this.afkTime += dt;
        if (this.afkTime > FortuneCatMainLayer.AFK_THRESHOLD){
            this.animateTooltip();
            this.afkTime = 0;
        }
    },

    ///tooltip animation each time it's showed
    animateTooltip: function(){
        this.finger.setVisible(true);
        this.fingerTrait.setTextureRect(cc.rect(0, 0, 0, 0));
        this.fingerTrait.setVisible(true);

        this.finger.runAction(cc.RotateBy(0.8, -FortuneCatMainLayer.FINGER_ROTATE_DEGREE));
        this.schedule(this.animateFinger, FortuneCatMainLayer.UPDATE_FINGER_ANIMATION_INTERVAL);

        var fingerAnimationExpectedDuration = 2000;
        setTimeout(function() {
            this.finger.setVisible(false);
            this.fingerTrait.setVisible(false);
            this.finger.setPosition(FortuneCatMainLayer.FINGER_START_X, FortuneCatMainLayer.FINGER_START_Y);
            this.finger.runAction(cc.RotateBy(0.01, FortuneCatMainLayer.FINGER_ROTATE_DEGREE));
        }.bind(this), fingerAnimationExpectedDuration);
    },

    ///determine how the finger moves and how the trait is revealed
    animateFinger: function(dt){
        ///update counters
        this.currentLoop += 1;

        ///each loop move 1/50 distance
        var numLoopFinger = 50;
        ///trait revealed in 33 loops, each loop reveal 1/33 the trait
        var numLoopTrait = 32;

        ///animate finger
        var deltaY = FortuneCatMainLayer.FINGER_MOVE_DISTANCE_Y / numLoopFinger;
        ///some maths
        var distanceY = Math.abs(this.finger.y - FortuneCatMainLayer.FINGER_START_Y);
        var distanceX = -9 * Math.pow(distanceY, 2) / 25 + 69 * distanceY / 5;

        this.finger.x = FortuneCatMainLayer.FINGER_START_X - distanceX;
        this.finger.y -= deltaY;

        ///animate finger trait
        if (this.currentLoop <= numLoopTrait){
            this.fingerTrait.setTextureRect(cc.rect(
                this.fingerTrait.width - this.fingerTrait.width * this.currentLoop / numLoopTrait,
                0,
                this.fingerTrait.width * this.currentLoop / numLoopTrait,
                this.fingerTrait.height)
            );
            this.fingerTrait.x =
                FortuneCatMainLayer.FINGER_TRAIT_BASE_X +
                this.fingerTrait.width / 2 -
                this.fingerTrait.width * this.currentLoop / numLoopTrait / 2;
        }

        ///stop animation
        var loopLimit = 40;
        if (this.currentLoop >= loopLimit){
            this.currentLoop = 0;
            this.fingerTrait.setTextureRect(cc.rect(0, 0, this.fingerTrait.width, this.fingerTrait.height));
            this.unschedule(this.animateFinger);
        }
    },

    ///reset finger original position and angle, hide the trait, reset current loop
    resetFingerTooltip: function(){
        var fingerOriginalAngle = 30;

        this.finger.setVisible(false);
        this.fingerTrait.setVisible(false);
        this.fingerTrait.setTextureRect(cc.rect(0, 0, 0, 0));
        this.finger.setPosition(FortuneCatMainLayer.FINGER_START_X, FortuneCatMainLayer.FINGER_START_Y);
        this.finger.runAction(cc.rotateTo(0.01, fingerOriginalAngle));
        this.currentLoop = 0;
    },

    ///reset progress tooltip original state (invisible)
    resetProgressTooltip: function(){
        this.progressTooltipContent.setVisible(false);
    },
    ///end - tooltip finger animation

    ///start - set up GUI components info
    ///hit boxes of 3 cat slots
    addCatSlotRect: function(){
        var catSlotWidth = 86;
        var catSlotHeight = 86;
        var slotX = 0;
        var slot1Y = 227;
        var slot2Y = 132;
        var slot3Y = 37;

        var rect1 = cc.rect(slotX, slot1Y, catSlotWidth, catSlotHeight);
        var rect2 = cc.rect(slotX, slot2Y, catSlotWidth, catSlotHeight);
        var rect3 = cc.rect(slotX, slot3Y, catSlotWidth, catSlotHeight);

        this.catSlotRects.push(rect1);
        this.catSlotRects.push(rect2);
        this.catSlotRects.push(rect3);
    },

    ///cat slots updated when
    ///1. Select and unlock a cat
    ///2. Enter this GUI
    updateCatSlotList: function(userCatIdList){
        ///reset relevant components
        this.catSlotList = [];
        this.catSlotImageList = [];
        this.catSlotImageBasePositionList = [];
        this.catSlotBgTimeList = [];
        this.catSlotTimeList = [];

        ///for each cat that user has, show it; else, show silhouette
        for (var i = 0; i < FortuneCatManager.getInstance().maxCat; i++){
            var slot = this.getControl("slot_" + (i + 1).toString(), this.catSlots);
            slot.setLocalZOrder(0);
            var cat = this.getControl("cat", slot);
            var bgTime = this.getControl("bgTime", slot);
            var time = this.getControl("time", slot);
            var silhouette = this.getControl("silhouette", slot);

            if (typeof userCatIdList[i] !== "undefined"){
                silhouette.loadTexture(FortuneCatSilhouetteSlotPathList[userCatIdList[i]]);
                cat.setVisible(true);
                cat.loadTexture(FortuneCatImageSlotPathList[userCatIdList[i]]);
                bgTime.setVisible(true);
                time.setVisible(true);

                var timeValue = FortuneCatUtility.formatCatTime(FortuneCatManager.getInstance().catConfigList[userCatIdList[i]].openTime / 1000);
                time.setString(timeValue);

                this.catSlotList.push(slot);
                this.catSlotImageList.push(cat);
                this.catSlotImageBasePositionList.push(cat.getPosition());
                this.catSlotBgTimeList.push(bgTime);
                this.catSlotTimeList.push(time);
            }
            else {
                silhouette.loadTexture(FortuneCatSilhouetteSlotPathList[0]);
                cat.setVisible(false);
                bgTime.setVisible(false);
                time.setVisible(false);
            }
        }
    },

    ///is a cat unlocked at the moment?
    updateMainCat: function(unlockingCatId){
        if (unlockingCatId !== -1){
            this.mainCatBody.setVisible(true);
            this.mainCatSilhouette.setVisible(false);
        }
        else {
            this.mainCatBody.setVisible(false);
            this.mainCatSilhouette.setVisible(true);
        }
    },

    ///display number of bells user has
    updateProgressValue: function(numBell, userNumCat){
        if (userNumCat < 3){
            this.progressValue.setString(numBell + " / " + FortuneCatManager.getInstance().maxBell);
        }
        else {
            this.progressValue.setString("Đầy");
        }
    },
    ///end - set up GUI components info

    ///start - setup touch listeners
    addTouchCatListener: function(){
        this.touchCatListener = cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: this.onTouchCatBegan.bind(this),
            onTouchMoved: this.onTouchCatMoved.bind(this),
            onTouchEnded: this.onTouchCatEnded.bind(this)
        }, -999);
    },

    addTouchProgressToolTipListener: function(){
        this.touchProgressTooltipListener = cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: this.onTouchProgressTooltipBegan.bind(this),
            onTouchMoved: this.onTouchProgressTooltipMoved.bind(this),
            onTouchEnded: this.onTouchProgressTooltipEnded.bind(this)
        }, -1000);
    },

    onTouchCatBegan: function(touch, event){
        var touchLocation = this.catSlots.convertToNodeSpace(touch.getLocation());

        for (var i = 0; i < this.catSlotRects.length; i++){
            if (
                !this.guide.isVisible() &&
                cc.rectContainsPoint(this.catSlotRects[i], touchLocation) &&
                typeof this.catSlotImageList[i] !== 'undefined' &&
                this.catSlotImageList[i].isVisible()
            ){
                this.fingerTooltip.setVisible(false);
                this.unschedule(this.showTooltipFinger);
                this.unschedule(this.animateFinger);

                ///update cat position
                this.catTouchedLocation = this.catSlotList[i].convertToNodeSpace(touch.getLocation());
                this.catSlotImageList[i].setPosition(this.catTouchedLocation);

                var slot = this.getControl("slot_" + (i + 1).toString(), this.catSlots);
                slot.setLocalZOrder(100);

                ///update relevant/affected variables/GUI components
                this.catTouchedIndex = i;
                this.fingerTooltip.setVisible(false);
                return true;
            }
        }
        return false;
    },

    onTouchCatMoved: function(touch, event){
        if (typeof this.catSlotList[this.catTouchedIndex] !== 'undefined'){
            this.catTouchedLocation = this.catSlotList[this.catTouchedIndex].convertToNodeSpace(touch.getLocation());
            this.catSlotImageList[this.catTouchedIndex].setPosition(this.catTouchedLocation);
        }
    },

    onTouchCatEnded: function(touch, event){
        var touchLocation = this.mainCat.convertToNodeSpace(touch.getLocation());
        ///open cat
        if (cc.rectContainsPoint(this.mainCatRect, touchLocation)){
            if (FortuneCatManager.getInstance().userOpenCatId === -1){
                var pk = new CmdUnlockFortuneCat();
                pk.putData(this.catTouchedIndex);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                this.catSlotImageList[this.catTouchedIndex].setPosition(this.catSlotImageBasePositionList[this.catTouchedIndex]);
                this.catSlotImageList[this.catTouchedIndex].setVisible(false);
                this.catSlotBgTimeList[this.catTouchedIndex].setVisible(false);
                this.catSlotTimeList[this.catTouchedIndex].setVisible(false);
            }
            else {
                this.catSlotImageList[this.catTouchedIndex].setPosition(this.catSlotImageBasePositionList[this.catTouchedIndex]);
            }

            var slot = this.getControl("slot_" + (this.catTouchedIndex + 1).toString(), this.catSlots);
            slot.setLocalZOrder(0);
        }
        ///return cat
        else {
            if (this.catTouchedIndex !== null){
                this.catSlotImageList[this.catTouchedIndex].setPosition(this.catSlotImageBasePositionList[this.catTouchedIndex]);
                this.catTouchedIndex = null;

                var slot = this.getControl("slot_" + (this.catTouchedIndex + 1).toString(), this.catSlots);
                slot.setLocalZOrder(0);
            }
        }
    },

    onTouchProgressTooltipBegan: function(touch, event){
        var touchLocation = this.progressTooltip.convertToNodeSpace(touch.getLocation());

        if (cc.rectContainsPoint(this.progressTooltipRect, touchLocation)){
            this.progressTooltipContent.setVisible(!this.progressTooltipContent.isVisible());
            return true;
        }

        return false;
    },

    onTouchProgressTooltipMoved: function(touch, event){

    },

    onTouchProgressTooltipEnded: function(touch, event){

    },
    ///end - set up touch listeners

    ///start - unlocking cat animation
    updateUnlockingCatInfo: function(catId, catIndex){
        var unlockingCatIndex = catIndex;

        this.catSlotImageList[unlockingCatIndex].setPosition(this.catSlotImageBasePositionList[unlockingCatIndex]);
        this.catSlotImageList[unlockingCatIndex].setVisible(false);
        this.mainCatSilhouette.setVisible(false);
        this.mainCatBody.setVisible(true);
        this.catSlotImageList[catIndex].setVisible(false);
        this.catSlotBgTimeList[catIndex].setVisible(false);
        this.catSlotTimeList[catIndex].setVisible(false);
        this.catTouchedIndex = null;

        this.loadUnlockingCatImage(catId);
        if (typeof sp !== 'undefined') {
            ///cat start unlocking animation
            this.unlockingCatImage.setAnimation(0, "meo " + (catId + 1).toString() + " pick", false);

            ///transition into idle animation
            var transitionDelay = 3000;
            setTimeout(function () {
                this.unlockingCatImage.setAnimation(0, "meo " + (catId + 1).toString() + " idle", true);
            }.bind(this), transitionDelay);
        }

        var catTitle = this.getControl("title", this.mainCatBody);
        var gold = this.getControl("gold", this.mainCatBody);

        var currentCat = FortuneCatManager.getInstance().catConfigList[catId];
        var goldValue = FortuneCatUtility.formatCatGold(currentCat.gold);

        this.updateClockView(Math.floor(FortuneCatManager.getInstance().catConfigList[catId].openTime / 1000));
        catTitle.loadTexture(FortuneCatTitlePathList[catId]);
        gold.setString(goldValue);

        this.schedule(this.showRemainTime, FortuneCatMainLayer.UPDATE_REMAIN_TIME_INTERVAL);
    },

    ///show currently unlocking cat gold value
    updateUnlockingCatGoldValue: function(){
        if (FortuneCatManager.getInstance().userOpenCatId !== -1){
            var gold = this.getControl("gold", this.mainCatBody);
            var currentCat = FortuneCatManager.getInstance().catConfigList[FortuneCatManager.getInstance().userOpenCatId];
            var goldValue = FortuneCatUtility.formatCatGold(currentCat.gold);

            gold.setString(goldValue);
        }
    },

    ///show current remaining time and re-schedule the time update loop
    updateRemainTime: function(){
        this.btnReceiveReward.setVisible(false);
        this.updateClockView(Math.floor(FortuneCatManager.getInstance().userOpenRemainTime / 1000));

        this.schedule(this.showRemainTime, FortuneCatMainLayer.UPDATE_REMAIN_TIME_INTERVAL);
    },

    ///countdown loop
    showRemainTime: function(dt){
        this.secondCounter += dt;
        this.flipClockCounter += dt;

        ///update clock every second
        if (this.secondCounter >= 1){
            this.remainDuration -= 1;
            this.secondCounter = 0;
            this.showClock(this.remainDuration);
        }

        ///flip sand clock icon every 2 seconds
        if (this.flipClockCounter >= 2){
            this.flipClockCounter = 0;
            this.flipSandClock();
        }

        if (this.remainDuration <= 0){
            this.runFinishUnlockingAnimation();
            this.unschedule(this.showRemainTime);
        }
    },

    ///update the time on clock after each interval
    showClock: function(duration){
        this.updateClockView(duration);
    },

    ///update time showed on clock
    updateClockView: function(duration){
        var clock = this.getControl("clock", this.mainCatBody);
        var time = FortuneCatUtility.formatTime(duration);

        this.remainDuration = duration;
        this.getControl("hour", clock).setString(time.hour);
        this.getControl("minute", clock).setString(time.minute);
        this.getControl("second", clock).setString(time.second);
    },

    ///show receive reward button after finish unlocking
    runFinishUnlockingAnimation: function(){
        this.btnReceiveReward.setVisible(true);
        this.btnReceiveReward.runAction(cc.sequence(cc.scaleTo(0.5, 1.1), cc.scaleTo(0.5, 1)).repeatForever());
    },

    resetBtnReceiveRewardScale: function(){
        this.btnReceiveReward.setScale(1);
    },

    ///show image of unlocking cat
    loadUnlockingCatImage: function(catId){
        this.mainCatImage.removeAllChildren();
        if (typeof sp !== 'undefined') {
            var unlockingCatImageX = 151;
            var unlockingCatImageY = 50;

            this.unlockingCatImage = new sp.SkeletonAnimation(fortuneCatFX.catJson, fortuneCatFX.catAtlas);
            this.unlockingCatImage.setAnchorPoint(0.5, 0.5);
            this.unlockingCatImage.setPosition(unlockingCatImageX, unlockingCatImageY);

            this.mainCatImage.addChild(this.unlockingCatImage);
        }
        else {
            var unlockingCatImageX = 151;
            var unlockingCatImageY = 149.5;

            this.unlockingCatImage = ccui.ImageView(FortuneCatImageUnlockingPathList[catId]);
            this.unlockingCatImage.setAnchorPoint(0.5, 0.5);
            this.unlockingCatImage.setPosition(unlockingCatImageX, unlockingCatImageY);

            this.mainCatImage.addChild(this.unlockingCatImage);
        }
    },

    updateCatTitle: function(catId){
        var title = this.getControl("title", this.mainCatBody);

        title.loadTexture(FortuneCatTitlePathList[catId]);
    },

    flipSandClock: function(){
        var flipDuration = 0.5;

        this.sandClockIcon.runAction(cc.rotateBy(flipDuration, 180));
    },

    resetSandClock: function(){
        this.sandClockIcon.runAction(cc.rotateTo(0.01, 0));
    },

    ///end - unlocking cat animation

    ///start - logic show guide
    checkShowGuide: function(){
        if (
            !cc.sys.localStorage.getItem(FortuneCatManager.IS_USER_KNEW_RULE) &&
            FortuneCatManager.getInstance().userCatIdList !== null &&
            FortuneCatManager.getInstance().userCatIdList.length === 0 &&
            FortuneCatManager.getInstance().userOpenRemainTime == 0 &&
            FortuneCatManager.getInstance().userOpenCatId == -1
        ){
             this.guide.setVisible(true);
             cc.sys.localStorage.setItem(FortuneCatManager.IS_USER_KNEW_RULE, "true");
        }
        else {
            this.guide.setVisible(false);
        }
    },
    ///end - logic show guide

    onButtonRelease: function(btn, id){
        switch (id){
            case FortuneCatMainLayer.BTN_CLOSE:
                this.animateLayoutOut();
                var animationFinishDelay = 200;

                setTimeout(function(){
                    this.onClose();
                }.bind(this), animationFinishDelay);
                break;

            case FortuneCatMainLayer.BTN_GUIDE:
                this.guide.setVisible(!this.guide.isVisible());
                break;

            case FortuneCatMainLayer.BTN_CLOSE_GUIDE:
                this.guide.setVisible(false);
                break;

            case FortuneCatMainLayer.BTN_PLAY:
                this.onClose();
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
                break;

            case FortuneCatMainLayer.BTN_RECEIVE_REWARD:
                FortuneCatManager.getInstance().sendGetFortuneCatReward();
                break;

            case FortuneCatMainLayer.BTN_CHEAT:
                this.pCheat.setVisible(!this.pCheat.isVisible());
                break;

            case FortuneCatMainLayer.BTN_CHEAT_UNLOCK:
                this.remainDuration = 0;
                FortuneCatManager.getInstance().lobbyIcon.remainDuration = 0;
                FortuneCatManager.getInstance().sendCheatUnlock();
                break;

            case FortuneCatMainLayer.BTN_CHEAT_BELL:
                var numBell = this.numBellCheat.getString();

                numBell = numBell || 0;
                numBell = parseInt(numBell);

                FortuneCatManager.getInstance().sendCheatBell(numBell);
                break;

            case FortuneCatMainLayer.BTN_CHEAT_CAT:
                var input = this.catIdListCheat.getString();

                input = input || "";
                var catIdList = input.split(",");
                for (var i = 0; i < catIdList.length; i++){
                    catIdList[i] = parseInt(catIdList[i]);
                }

                FortuneCatManager.getInstance().sendCheatCat(catIdList);
                break;
        }
    },

    clearAllTimeout: function(){
        var id = window.setTimeout(function() {}, 0);

        while (id--) {
            window.clearTimeout(id);
        }
    },

    onBack: function(){
        this.onClose();
    },

    onExit: function(){
        this._super();
        this.stopAllActions();
        this.unscheduleAllCallbacks();
        this.clearAllTimeout();
    }
});

FortuneCatMainLayer.className = "FortuneCatMainLayer";
FortuneCatMainLayer.tag = 200;

///button list
FortuneCatMainLayer.BTN_CLOSE = 1;
FortuneCatMainLayer.BTN_GUIDE = 2;
FortuneCatMainLayer.BTN_PLAY = 3;
FortuneCatMainLayer.BTN_RECEIVE_REWARD = 4;
FortuneCatMainLayer.BTN_CLOSE_GUIDE = 5;

FortuneCatMainLayer.BTN_CHEAT = 6;
FortuneCatMainLayer.BTN_CHEAT_CAT = 7;
FortuneCatMainLayer.BTN_CHEAT_BELL = 8;
FortuneCatMainLayer.BTN_CHEAT_UNLOCK = 9;

///position config
FortuneCatMainLayer.FINGER_START_X = 180;
FortuneCatMainLayer.FINGER_START_Y = 15;
FortuneCatMainLayer.FINGER_MOVE_DISTANCE_X = 120;
FortuneCatMainLayer.FINGER_MOVE_DISTANCE_Y = 25;
FortuneCatMainLayer.FINGER_ROTATE_DEGREE = 40;
FortuneCatMainLayer.FINGER_TRAIT_BASE_X = 177;
FortuneCatMainLayer.FINGER_TRAIT_BASE_Y = 70;

FortuneCatMainLayer.SUN_1_POS = cc.p(197, 206);
FortuneCatMainLayer.SUN_2_POS = cc.p(374, 285);
FortuneCatMainLayer.SUN_3_POS = cc.p(496, 272);
FortuneCatMainLayer.SUN_4_POS = cc.p(568, 193);

///animation config
FortuneCatMainLayer.AFK_THRESHOLD = 2;
FortuneCatMainLayer.UPDATE_FINGER_TOOLTIP_INTERVAL = 0.5;
FortuneCatMainLayer.UPDATE_FINGER_ANIMATION_INTERVAL = 0.025;
FortuneCatMainLayer.UPDATE_REMAIN_TIME_INTERVAL = 0.5;
