var WChallengeCloverInfo = cc.Node.extend({

    ctor: function () {
        this._super();
        var jsonLayout = ccs.load("res/Event/WeeklyChallenge/WeeklyChallengeCloverInfo.json");
        this.layout = jsonLayout.node;
        ccui.Helper.doLayout(this.layout);
        this.addChild(this.layout);
        this.initGUI();
    },

    initGUI: function () {
        this.bg = this.layout.getChildByName("bg");
        this.btnDetail = this.bg.getChildByName("btnDetail");
        this.bgProgress = this.bg.getChildByName("bgProgress");
        this.progress = this.bgProgress.getChildByName("progress");
        this.lbNumProgress = this.bgProgress.getChildByName("lbNumProgress");
        this.lbNumberClover = this.bg.getChildByName("lbNumberClover");
        this.iconGift = this.bg.getChildByName("iconGift");
        this.bgNumber = this.iconGift.getChildByName("bgNumber");
        this.lbNumGift = this.iconGift.getChildByName("lbNumber");
        this.imgClover = this.bg.getChildByName("imgClover");
        this.btnDetail.addClickEventListener(this.onClickDetail.bind(this));
    },

    onClickDetail: function () {
        WChallenge.getInstance().gui.showCloverProgress();
    },

    updateInfo: function () {
        var wChallenge = WChallenge.getInstance();
        cc.log("UPDATE CLOVER " + wChallenge.currClovers);
        this.lbNumberClover.setString(StringUtility.pointNumber(wChallenge.currClovers));
        this.imgClover.setPositionX(this.lbNumberClover.getPositionX() + this.lbNumberClover.getVirtualRenderer().width * 0.5 + this.imgClover.getContentSize().width * 0.6);
        var percent = 100;
        var i = 0;
        for (i = 0; i < wChallenge.arrayCloverProgress.length; i++) {
            if (wChallenge.currClovers < wChallenge.arrayCloverProgress[i]) {
                percent = wChallenge.currClovers / wChallenge.arrayCloverProgress[i] * 100;
                break;
            }
        }
        i = (i < wChallenge.arrayCloverProgress.length ? i : i - 1);
        this.lbNumProgress.setString(StringUtility.pointNumber(wChallenge.currClovers) + "/" + StringUtility.pointNumber(wChallenge.arrayCloverProgress[i]));
        this.progress.setPercent(percent);
        var count = 0;
        for (var i = 0; i < wChallenge.arrayGiftProgress.length; i++) {
            if (wChallenge.arrayGiftProgress[i] == WChallenge.HAVE_GIFT) {
                count++;
            }
        }
        if (count > 0) {
            this.lbNumGift.setString(count);
        }
        this.lbNumGift.setVisible(count > 0);
        this.bgNumber.setVisible(count > 0);
    },

    onButtonRelease: function (btn, id) {

    },

    onBack: function () {
        this.onClose();
    }
});
WChallengeCloverInfo.className = "WChallengeCloverInfo";
WChallengeCloverInfo.BTN_DETAIL = 1;