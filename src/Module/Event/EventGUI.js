
var EventButton = cc.Node.extend({
    ctor: function (isMainEvent) {
        this._super();
        this.isMainEvent = isMainEvent || false;
        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);
        // hinh anh mac dinh cho EventMgr, se duoc hien thi neu khong co animation
        this.button = new ccui.Button("LobbyGUI/btnOffer.png");
        this.addChild(this.button);
        this.button.setScale9Enabled(true);
        this.button.addClickEventListener(this.touchEvent.bind(this));
        this.button.setOpacity(0);
        this.button.setScale(0.7);

        // node animation, de them effect vao button EventMgr, tung EventMgr se cai dat rieng
        this.anim = new cc.Node();
        this.anim.setCascadeColorEnabled(true);
        this.anim.setCascadeOpacityEnabled(true);
        this.addChild(this.anim);

        // notification khi event can hien thi
        this.notify = new cc.Node();
        this.addChild(this.notify);
        this.notify.setPosition(this.isMainEvent ? this.button.getContentSize().width * 0.4 : 30, this.isMainEvent ? this.button.getContentSize().height * 0.4 : 20);

        // label time
        this.time = new ccui.Text("fsdfds", SceneMgr.FONT_BOLD, 13);
        this.addChild(this.time);
        this.time.ignoreContentAdaptWithSize(true);
        this.time.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.time.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.time.setPosition(0, this.isMainEvent ? -this.button.getContentSize().height * 0.35 : -32);
        this.time.setAnchorPoint(0.5, 0.5);
        this.time.setColor(cc.color(247, 233, 187));
        this.time.enableOutline(cc.color(131, 73, 52), 1);
        this.time.pos = this.time.getPosition();

        this.nodeDownload = new cc.Node();
        this.addChild(this.nodeDownload);
        this.nodeDownload.setScale(0.7);

        this.bgDownload = new cc.Sprite("res/Lobby/Event/bgDownload.png");
        this.nodeDownload.addChild(this.bgDownload);

        this.bgProgress = new cc.Sprite("res/Lobby/Event/bgProgress.png");
        this.bgDownload.addChild(this.bgProgress);
        this.bgProgress.setPosition(this.bgDownload.getContentSize().width * 0.5, this.bgDownload.getContentSize().height * 0.5);

        this.progress = new cc.ProgressTimer(new cc.Sprite("res/Lobby/Event/progress.png"));
        this.progress.setType(cc.ProgressTimer.TYPE_RADIAL);
        this.progress.setPercentage(50);
        this.progress.setPosition(this.bgProgress.getContentSize().width/2,this.bgProgress.getContentSize().height/2);
        this.bgProgress.addChild(this.progress);

        this.lbPercent = new ccui.Text();
        this.bgProgress.addChild(this.lbPercent);
        this.lbPercent.setFontName(SceneMgr.FONT_BOLD);
        this.lbPercent.setString("100");
        this.lbPercent.setPosition(this.bgProgress.getContentSize().width * 0.5, this.bgProgress.getContentSize().height * 0.5);
        this.lbPercent.setFontSize(20);

        this.iconDownload = new cc.Sprite("res/Lobby/Event/iconDownload.png");
        this.bgDownload.addChild(this.iconDownload);
        this.iconDownload.setPosition(this.bgDownload.getContentSize().width * 0.5, this.bgDownload.getContentSize().height * 0.5);

        this.haveData = false;
        this.isDownloading = false;
        this.bgDownload.setVisible(false);
    },

    onEnter: function(){
        this._super();
        this.notify.removeAllChildren();
        var anim = db.DBCCFactory.getInstance().buildArmatureNode("Notify");
        anim.gotoAndPlay("1", -1, -1, 0);
        this.notify.addChild(anim);
    },

    reset: function () {
        this.setVisible(false);
        this.anim.removeAllChildren(false);
        this.notify.setVisible(false);
        this.time.setVisible(false);
        this.button.setVisible(false);
        this.anim.eff = null;
        this.dataEvent = null;
        this.haveData = false;
    },

    hideComponent: function () {
        this.notify.setVisible(false);
        this.time.setVisible(false);
        this.button.setVisible(false);
    },

    touchEvent: function () {
        eventMgr.openEventInGame(this.dataEvent.idEvent);
    },

    setInfo: function (dataEvent) {
        this.dataEvent = dataEvent;
        // Do EventMgr WChallenge an het cac thanh phan cua Button EventMgr, phai show lai
        this.notify.setVisible(true);
        this.time.setVisible(true);
        this.button.setVisible(true);
        this.setVisible(true);
        this.haveData = true;
    },

    waitDownload: function () {
        this.iconDownload.setScaleX(1);
        this.bgDownload.setVisible(true);
        this.bgProgress.setVisible(false);
        this.iconDownload.setVisible(true);
        this.iconDownload.setTexture("res/Lobby/Event/iconDownload.png");
    },

    queueDownload: function () {
        cc.log("QUEUE DOWNLOAD *** ");
        this.bgProgress.setVisible(true);
        this.progress.setPercentage(0);
        this.lbPercent.setVisible(false);
        this.count = 0;
        this.callbackIconDownloadQueue();
        this.iconDownload.setScaleX(0);
    },

    callbackIconDownloadQueue: function () {
        var timeRotate = 0.4;
        if (this.count >= 4) {
            this.count = 0;
        }
        this.iconDownload.setTexture("res/Lobby/Event/iconLoading_" + this.count + ".png");
        this.iconDownload.runAction(cc.sequence(
            cc.scaleTo(timeRotate, 1, 1),
            cc.scaleTo(timeRotate, 0, 1),
            cc.callFunc(this.callbackIconDownload.bind(this))
        ));
        this.count++;
    },

    startDownload: function () {
        this.bgDownload.setVisible(true);
        this.isDownloading = true;
        this.bgProgress.setVisible(true);
        this.progress.setPercentage(0);
        this.lbPercent.setString("0");
        this.lbPercent.setVisible(true);
        this.iconDownload.setVisible(true);
        this.iconDownload.stopAllActions();
        this.lbPercent.stopAllActions();
        var timeRotate = 0.4;
        var timeDelay = 0.0;
        this.bgDownload.setScale(0);
        this.lbPercent.runAction(cc.repeatForever(
            cc.sequence(
                cc.scaleTo(timeRotate, 1, 1),
                cc.delayTime(timeDelay),
                cc.scaleTo(timeRotate, 0, 1.0),
                cc.delayTime(timeDelay + timeRotate * 2)
            )
        ));
        this.count = 0;
        this.callbackIconDownload();
        this.anim.setOpacity(150);
        this.bgDownload.runAction(cc.EaseBackOut(cc.scaleTo(0.5, 1, 1)));
    },

    callbackIconDownload: function () {
        var timeRotate = 0.4;
        var timeDelay = 0.0;
        if (this.count >= 4) {
            this.count = 0;
        }
        this.iconDownload.setTexture("res/Lobby/Event/iconLoading_" + this.count + ".png");
        this.iconDownload.runAction(cc.sequence(
            cc.delayTime(timeDelay + timeRotate * 2),
            cc.scaleTo(timeRotate, 1, 1),
            cc.delayTime(timeDelay),
            cc.scaleTo(timeRotate, 0, 1),
            cc.callFunc(this.callbackIconDownload.bind(this))
        ));
        this.count++;
    },

    updateDownload: function (percent) {
        if (!this.isDownloading) {
            this.startDownload();
        }
        this.progress.setPercentage(percent);
        this.lbPercent.setString(Math.floor(percent));
    },

    finishDownload: function (isFinish) {
        if (!isFinish) {
            // download Fail
            this.lbPercent.setVisible(false);
            this.iconDownload.stopAllActions();
            this.iconDownload.setScaleX(1);
            this.lbPercent.stopAllActions();
            this.iconDownload.setTexture("res/Lobby/Event/iconDownloadFail.png");
            this.anim.setOpacity(150);
            this.bubbleFail = new cc.Sprite("res/Lobby/Event/bubbleFail.png");
            this.nodeDownload.addChild(this.bubbleFail);
            this.bubbleFail.setPosition(60, 50);
            this.bubbleFail.setScale(0);
            this.bubbleFail.runAction(cc.sequence(
                cc.EaseBackOut(cc.scaleTo(0.5, 1, 1)),
                cc.delayTime(0.5),
                cc.EaseBackIn(cc.scaleTo(0, 0, 0)),
                cc.removeSelf(),
                cc.callFunc(this.waitDownload.bind(this))
            ));
        }
        else {
            this.lbPercent.setVisible(false);
            this.iconDownload.stopAllActions();
            this.lbPercent.stopAllActions();
            this.iconDownload.setTexture("res/Lobby/Event/iconDownloadDone.png");
            this.iconDownload.runAction(cc.EaseBackOut(cc.scaleTo(0.3, 1, 1)));
            this.bgDownload.runAction(cc.sequence(
                cc.delayTime(1.0),
                cc.EaseBackIn(cc.scaleTo(0.5, 0, 0))
            ));
            this.anim.setOpacity(255);
        }
    }
})
