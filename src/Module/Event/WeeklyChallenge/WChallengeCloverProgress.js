var WChallengeCloverProgress = cc.Node.extend({

    ctor: function () {
        this._super();
        var jsonLayout = ccs.load("res/Event/WeeklyChallenge/WeeklyChallengeCloverProgress.json");
        this.layout = jsonLayout.node;
        ccui.Helper.doLayout(this.layout);
        this.addChild(this.layout);
        this.initGUI();
    },

    initGUI: function () {
        this.bg = this.layout.getChildByName("bg");

        this.btnClose = this.bg.getChildByName("close");
        this.btnClose.addClickEventListener(this.onClickClose.bind(this));
        this.scrollView = this.bg.getChildByName("scrollView");

        this.totalWidthProgress = WChallengeCloverProgress.PAD_ITEM * (WChallenge.getInstance().arrayCloverProgress.length) + 10;
        this.bgProgress = cc.Scale9Sprite.create("res/Event/WeeklyChallenge/CloverProgress/bgProgressChest2.png");
        this.bgProgress.setAnchorPoint(0, 0);
        this.scrollView.addChild(this.bgProgress);
        this.bgProgress.setInsetLeft(10);
        this.bgProgress.setInsetRight(10);
        this.bgProgress.setContentSize(this.totalWidthProgress, this.bgProgress.getContentSize().height);
        this.bgProgress.setPositionY(this.scrollView.getContentSize().height * 0.43);

        this.progress = cc.Scale9Sprite.create("res/Event/WeeklyChallenge/CloverProgress/progressChest2.png");
        this.progress.setAnchorPoint(0, 0);
        this.scrollView.addChild(this.progress);
        this.progress.setInsetLeft(10);
        this.progress.setInsetRight(10);
        this.progress.setContentSize(this.totalWidthProgress, this.progress.getContentSize().height);
        this.progress.setPositionY(this.bgProgress.getPositionY() + 2);

        this.arrayInfo = [];
        for (var i = 0; i < WChallenge.getInstance().arrayCloverProgress.length; i++) {
            this.arrayInfo[i] = new CloverProgressItem(i);
            this.scrollView.addChild(this.arrayInfo[i]);
            this.arrayInfo[i].setPosition(WChallengeCloverProgress.PAD_ITEM * (1 + i), this.bgProgress.getPositionY() + 7);
        }

        var pad = 10;
        this.scrollView.setInnerContainerSize(cc.size(this.totalWidthProgress + pad, this.scrollView.getInnerContainerSize().height));
    },

    onClickClose: function () {
        WChallenge.getInstance().gui.hideCloverProgress();
    },

    showProgress: function (time) {
        //this.setVisible(true);
        if (this.isShow)
            return;
        this.bg.stopAllActions();
        this.isShow = true;
        this.bg.runAction(cc.EaseBackOut(cc.ScaleTo(time, 1.0, 1.0)));
    },

    hideProgress: function (time) {
        //this.setVisible(false);
        this.isShow = false;
        this.bg.stopAllActions();
        this.bg.runAction(cc.EaseBackIn(cc.scaleTo(time, 0, 1.0)));
    },

    updateInfo: function () {
        var wChallenge = WChallenge.getInstance();
        for (var i = 0; i < this.arrayInfo.length; i++) {
            this.arrayInfo[i].updateInfo();
        }
        var percent = 1;
        if (wChallenge.currClovers >=  wChallenge.arrayCloverProgress[wChallenge.arrayCloverProgress.length - 1]) {
            percent = 1;
        }
        else {
            for (var i = 0; i < wChallenge.arrayCloverProgress.length; i++) {
                if (wChallenge.currClovers < wChallenge.arrayCloverProgress[i]) {
                    var percentInOneLevel = 1 / wChallenge.arrayCloverProgress.length;
                    var percentInLevel;
                    if (i == 0) {
                        percentInLevel = (wChallenge.currClovers - 0) / (wChallenge.arrayCloverProgress[i]);
                    }
                    else {
                        percentInLevel = (wChallenge.currClovers - wChallenge.arrayCloverProgress[i - 1]) / (wChallenge.arrayCloverProgress[i] - wChallenge.arrayCloverProgress[i - 1]);
                    }
                    percent = i * percentInOneLevel + percentInLevel * percentInOneLevel;
                    break;
                }
            }
        }
        cc.log("this.totalWidthProgress " + this.totalWidthProgress + " percent " + percent);
        this.progress.setContentSize(this.totalWidthProgress * percent, this.progress.getContentSize().height);
        this.scrollView.scrollToPercentHorizontal(percent * 100, 0.2, true);
    },

    onButtonRelease: function (btn, id) {
        this.onBack();
    },

    onBack: function () {
        this.onClose();
    }
});
WChallengeCloverProgress.className = "WChallengeCloverProgress";
WChallengeCloverProgress.TAG = 105;
WChallengeCloverProgress.PAD_ITEM = 70;
WChallengeCloverProgress.BTN_CLOSE = 1;


/**
 * Thong tin cua Ruong bau hien thi tren thanh Progress cua GUi Inffo RUong
 */
var CloverProgressItem = ccui.Layout.extend({
    ctor: function (index) {
        this._super();
        this.index = index;

        this.dot = cc.Sprite.create("res/Event/WeeklyChallenge/CloverProgress/dotInfo.png");
        this.addChild(this.dot);

        this.iconTick = cc.Sprite.create("res/Event/WeeklyChallenge/CloverProgress/iconTickReceived.png");
        this.addChild(this.iconTick);
        this.iconTick.setPositionY(40);
        this.setContentSize(cc.size(100, 100));

        this.iconLock = cc.Sprite.create("res/Event/WeeklyChallenge/CloverProgress/iconLock.png");
        this.addChild(this.iconLock);
        this.iconLock.setPosition(this.iconTick.getPosition());

        this.lbNumLand = new ccui.Text();
        this.lbNumLand.setColor(cc.color(141, 183, 4));
        this.lbNumLand.setString("10");
        this.lbNumLand.setFontSize(12);
        this.lbNumLand.setFontName(SceneMgr.FONT_BOLD);
        this.addChild(this.lbNumLand);
        this.lbNumLand.setPositionY(this.iconLock.getPositionY() - 20);
        this.lbNumLand.setString(WChallenge.getInstance().arrayCloverProgress[index]);

        this.bgGold = new cc.Sprite("res/Event/WeeklyChallenge/CloverProgress/bgGold.png");
        this.addChild(this.bgGold);
        this.bgGold.setPositionY(this.iconTick.getPositionY() + 55);

        this.lbBonus = new ccui.Text();
        this.lbBonus.setColor(cc.color(152, 88, 46));
        this.lbBonus.setFontSize(12);
        this.lbBonus.setFontName(SceneMgr.FONT_BOLD);
        this.bgGold.addChild(this.lbBonus);
        this.lbBonus.setPositionX(this.bgGold.getContentSize().width * 0.5);
        this.lbBonus.setPositionY(20);
        this.lbBonus.setString(StringUtility.formatNumberSymbol(WChallenge.getInstance().arrayGoldProgress[index]));


        var s = "res/Event/WeeklyChallenge/CloverProgress/btnReceiveChest.png";
        this.btnReceive = new ccui.Button(s, s, s);
        this.addChild(this.btnReceive);
        this.btnReceive.setPosition(this.iconTick.getPosition());
        this.btnReceive.addClickEventListener(this.onClickReceive.bind(this));
    },

    onClickReceive: function () {
        cc.log("ON CLICK RECEIVE ");
        //WChallenge.getInstance().sendGetPogressGift(this.index, false);
        WChallenge.getInstance().sendGetPogressGift(this.index, true);
    },

    updateInfo: function () {
        var wChallenge = WChallenge.getInstance();
        if (wChallenge.arrayGiftProgress[this.index] == WChallenge.NO_GIFT) {
            this.btnReceive.setVisible(false);
            this.lbNumLand.setVisible(true);
            this.iconLock.setVisible(true);
            this.iconTick.setVisible(false);
        }
        else if (wChallenge.arrayGiftProgress[this.index] == WChallenge.HAVE_GIFT) {
            this.btnReceive.setVisible(true);
            this.iconTick.setVisible(false);
            this.lbNumLand.setVisible(false);
            this.iconLock.setVisible(false);
        }
        else {
            this.btnReceive.setVisible(false);
            this.iconTick.setVisible(true);
            this.lbNumLand.setVisible(false);
            this.iconLock.setVisible(false);
        }
    },
})