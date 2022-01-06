/**
 * Created by cuongcan_pro on 12/21/2017.
 */

var EventTetScene = BaseLayer.extend({

    ctor: function () {
        this._super(EventTetScene.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetGUI.json");
    },

    initGUI: function () {

        //this.bg = this.getControl("bg");
        this.panelFirework = this.getControl("panelFirework");
        this.panelCenter = this.getControl("panelCenter");
        this.panelEffect = this.getControl("panelEffect");
        this.panelEffect.setLocalZOrder(100);
        this.panelMenu = this.getControl("panelMenu");
        this.panelRight = this.getControl("panelRight");
        this.panelLeft = this.getControl("panelLeft");
        this.panelBottom = this.getControl("panelBottom");
        this.panelLeftBottom = this.getControl("panelLeftBottom");
        this.panelRightBottom = this.getControl("panelRightBottom");
        this.panelCenterRight = this.getControl("panelCenterRight");
        this.panelTouch = this.getControl("panelTouch");

        // CUSTOM BUTTON
        this.btnBack = this.customButton("btnBack", EventTetScene.BTN_BACK, this.panelLeft);
        this.btnGold = this.customButton("btnGold", EventTetScene.BTN_GOLD, this.panelMenu);
        this.btnPaper = this.customButton("btnPaper", EventTetScene.BTN_PAPER, this.panelMenu);
        this.btnVibrate = this.customButton("btnVibrate", EventTetScene.BTN_VIBRATE, this.panelBottom);
        this.btnVibrateTen = this.customButton("btnVibrateTen", EventTetScene.BTN_VIBRATE_TEN, this.panelBottom);
        this.btnHelp = this.customButton("btnHelp", EventTetScene.BTN_HELP, this.panelLeft);
        this.btnGift = this.customButton("btnGift", EventTetScene.BTN_GIFT, this.panelLeft);
        this.btnTop = this.customButton("btnTop", EventTetScene.BTN_TOP, this.panelLeft);
        this.btnTopDeco = this.customButton("btnTop", EventTetScene.BTN_TOP, this.panelCenterRight);
        this.btnVibrate.pos = this.btnVibrate.getPosition();
        this.arrayPos = [162, this.panelBottom.getContentSize().width - 162];
        this.btnAuto = this.customButton("btnAuto", EventTetScene.BTN_AUTO, this.panelBottom);
        this.btnAuto.select = this.getControl("select", this.btnAuto);

        // CUSTOM DATA IN BUTTON
        this.labelGold = this.getControl("labelGold", this.btnGold);
        this.labelPaper = this.getControl("labelNum", this.btnPaper);
        this.rope = this.getControl("rope", this.panelBottom);
        this.rope2 = this.getControl("rope2", this.panelBottom);
        this.btnVibrate.lbNum = this.getControl("lbNum", this.btnVibrate);
        this.btnVibrateTen.lbNum = this.getControl("lbNum", this.btnVibrateTen);

        // ADD TREE
        this.iconBottom = this.getControl("iconBottom", this.panelCenter);
        this.imgDeco = this.getControl("imgDeco", this.panelCenter);
        this.addTree();
        this.imgDeco.setLocalZOrder(2);

        // CUSTOM DATA IN LABEL COLLECT
        this.arrayIcon = [];
        this.arrayLabelNum = [];
        this.arrayBgNum = [];
        this.arrayPrice = [];
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            this.arrayIcon.push(this.getControl("icon" + i, this.panelBottom));
            this.arrayBgNum.push(this.getControl("bg", this.arrayIcon[i]));
            this.arrayLabelNum.push(this.getControl("label", this.arrayBgNum[i]));
            //     this.arrayPrice.push(this.getControl("labelPrice" + i, this.panelBottom));
            //     this.arrayPrice[i].setString(eventTet.arrayPrice[i]);
        }
        this.initEffect();
        this.labelTime = this.getControl("labelTime", this.panelRight);

        // ADD TABLEVIEW LIXI LIST
        this.itemInList = this.getControl("list", this.panelLeftBottom);
        this.listLixi = new cc.TableView(this, this.itemInList.getContentSize());
        this.listLixi.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listLixi.setVerticalFillOrder(0);
        this.listLixi.setDelegate(this);
        this.itemInList.addChild(this.listLixi);
        this.listLixi.reloadData();

        // ADD PROGRESS EXP
        this.bgProgress = this.getControl("bgExp", this.panelMenu);
        this.labelExp = this.getControl("labelExp", this.panelMenu)
        var batchNode_scaled_with_insets = new cc.SpriteBatchNode(EventTet.DEFAUT_UI + "progress.png");
        this.progress = new cc.Scale9Sprite();
        this.progress.updateWithBatchNode(batchNode_scaled_with_insets, cc.rect(0, 0, 24, 21), false, cc.rect(10, 10, 4, 1));
        this.bgProgress.addChild(this.progress);
        this.progress.setPosition(cc.p(0, this.bgProgress.getContentSize().height * 0.49));
        this.progress.setContentSize(cc.size(100, 22));
        this.progress.setAnchorPoint(cc.p(0, 0.5));

        var bgProgress = cc.Sprite.create(EventTet.DEFAUT_UI + "bgExp.png");
        this._uiTimer = new cc.ProgressTimer(bgProgress);
        this._uiTimer.setType(cc.ProgressTimer.TYPE_BAR);
        this.bgProgress.addChild(this._uiTimer);
        this._uiTimer.setScale(1.0, 1.06);
        this._uiTimer.setMidpoint(cc.p(1, 0));
        this._uiTimer.setBarChangeRate(cc.p(1, 0));
        this._uiTimer.setPercentage(100);
        this._uiTimer.setPosition(cc.p(bgProgress.getContentSize().width * 0.5, bgProgress.getContentSize().height * 0.52));
        //this._uiTimer.setPosition(cc.p(bgProgress.getContentSize().width * 0.5, -bgProgress.getContentSize().height * 1.58));

        // Init thong tin User
        this.borderAvatar = this.getControl("borderAvatar", this.panelRightBottom);
        this.bgInfo = this.getControl("bg", this.panelRightBottom);
        this.lbName = this.getControl("lbName", this.bgInfo);
        this.lbRank = this.getControl("lbRank", this.bgInfo);
        this.lbNum = this.getControl("lbNum", this.bgInfo);
        this.lbWeek = this.getControl("lbWeek", this.bgInfo);
        this.avatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");////engine.UIAvatar.create("Common/defaultAvatar.png");
        var size = this.borderAvatar.getContentSize();
        this.avatar.setPosition(this.borderAvatar.getPosition());
        this.bgInfo.addChild(this.avatar, 0);
        this.borderAvatar.setLocalZOrder(1);
        this.avatar.setScale(0.77);

        // Init Img Gift TOp thay doi theo tuan
        this.imgGift = this.getControl("imgGift", this.panelCenterRight);

        // INIT EFFECT
        this.countGenLeaf = 0;
        this.isEventTime = true;

        if (!this.effectCoinFall) {
            this.effectCoinFall = new CoinFallEffectEventTet();
            this.effectCoinFall.setScale(0.75);
            this.effectCoinFall.setPosition(-70, 80);
            //this.effectCoinFall.setPositionCoin(cc.p(this.width / 2, this.height * 0.1));
            this.effectCoinFall.setContentSize(this.panelCenter.getContentSize().width * 1.15, this.height * 0.17);

            this.effectCoinFall.setVisible(false);
            this.panelCenter.addChild(this.effectCoinFall);
        }

        this.arrayFirework = [];

        // LOAD CHEAT
        // load cheat panel
        this.pCheat = this.getControl("panelCheat", this.panelLeft);
        //this.pCheat.pos = this.pCheat.getPosition();

        this.customButton("btnCheatText",EventTetScene.BTN_CHEAT_TEXT,this.pCheat);
        this.customButton("btnCheatLixi",EventTetScene.BTN_CHEAT_LIXI,this.pCheat);
        this.customButton("btnReset",EventTetScene.BTN_RESET,this.pCheat);
        this.customButton("btnCheatG",EventTetScene.BTN_CHEAT_G,this.pCheat);
        this.customButton("btnCheatVibrate",EventTetScene.BTN_CHEAT_VIBRATE,this.pCheat);
        this.customButton("btnCheatToken",EventTetScene.BTN_CHEAT_TOKEN,this.pCheat);
        this.customButton("btnCheatTokenN",EventTetScene.BTN_CHEAT_TOKEN_N,this.pCheat);

        this.btnCheat = this.customButton("btnCheat",EventTetScene.BTN_CHEAT,this.panelMenu);

        this.tfCheatText = [];
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            this.tfCheatText.push(this.getControl("tfText" + (i + 1), this.pCheat));
        }
        this.tfSpecialText = this.getControl("tfSpecialText", this.pCheat);
        this.tfNumLixi = this.getControl("tfNumLixi", this.pCheat);
        this.tfIdLixi = this.getControl("tfIdLixi", this.pCheat);
        this.tfCheatG = this.getControl("tfGServer", this.pCheat);
        this.tfCheatGUser = this.getControl("tfGUser", this.pCheat);
        this.tfCheatExp = this.getControl("tfExp", this.pCheat);
        this.tfCheatVibrate = this.getControl("tfVibrate", this.pCheat);
        this.arrayTfCheatToken = [];
        for (var i = 0; i < EventTet.WEEK_END; i++)
            this.arrayTfCheatToken[i] = this.getControl("tfNumToken" + i, this.pCheat);
        this.tfNumUser = this.getControl("tfNumUser", this.pCheat);
        this.pCheat.setVisible(false);
        if (Config.ENABLE_CHEAT) {
            this.btnCheat.setVisible(true);
        }
        else {
            this.btnCheat.setVisible(false);
        }
        // this.btnCheat.setVisible(false);
        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        });
        cc.eventManager.addListener(this._listener, this.panelTouch);
        this.setBackEnable(true);
    },

    onEnterFinish: function() {
        this._super();
        eventTet.isAuto = false;
        this.btnAuto.select.setVisible(false);
        this.isWaitingResult = false;
        this.isVibrate = false;
        this.iconEffectPaper.setVisible(false);
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            this.arrayIconEffect[i].setVisible(false);
            this.arrayLabelEffect[i].setVisible(false);
        }
        this.updateUserInfo();
        this.updateEventInfo();
        this.updateMyRankInfo();
        this.schedule(this.update, 0.04);
        eventTet.eventTetScene = this;
        this.addCoin();
        this.countTimeFireWork = 0;
        this.giftsResult = null;
        this.panelEffect.removeAllChildren();
        this.effectCoinFall.setVisible(false);
        var game = LocalizedString.config("GAME");

        if (eventTet.eventTime < EventTet.WEEK_END) {
            this.imgGift.loadTexture(EventTet.DEFAUT_UI + "imgGift" + eventTet.eventTime + ".png");
        }
        else {
            if (game.indexOf("sam") >= 0) {
                this.imgGift.loadTexture(EventTet.DEFAUT_UI + "imgGiftSam.png");
            }
            else {
                this.imgGift.loadTexture(EventTet.DEFAUT_UI + "imgGift" + eventTet.eventTime + ".png");
            }
        }
    },

    initEffect: function() {
        this.arrayIconEffect = [];
        this.arrayLabelEffect = [];
        for (var i = 0; i < this.arrayIcon.length; i++) {
            var icon = cc.Sprite.create(EventTet.DEFAUT_UI + "label" + i + ".png");
            this.panelBottom.addChild(icon);
            icon.setPosition(this.arrayIcon[i].getPosition());
            var bgNum = cc.Sprite.create(EventTet.DEFAUT_UI + "bgNumLabel.png");
            icon.addChild(bgNum);
            bgNum.setPosition(23, 58);
            var label = BaseLayer.createLabelText("0", cc.color(245, 237, 184));
            bgNum.addChild(label);
            label.setPosition(bgNum.getContentSize().width * 0.5, bgNum.getContentSize().height * 0.5);

            this.arrayIconEffect.push(icon);
            this.arrayLabelEffect.push(label);
            icon.setVisible(false);
        }

        this.iconEffectPaper = this.getControl("iconEffectPaper", this.panelBottom);
        this.labelEffectPaper = this.getControl("labelEffectPaper", this.iconEffectPaper);
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable()) {
            return;
        }
        EventTetSound.stopLobby();
        sceneMgr.openScene(LobbyScene.className);
    },

    onTouchBegan: function(touch, event) {
        return false;
    },
    onTouchMoved: function(touch, event) {
    },
    onTouchEnded: function(touch, event) {
    },

    onButtonRelease: function (btn, id) {
        if (eventTet.eventTime > EventTet.WEEK_END) {
            Toast.makeToast(ToastFloat.SHORT, localized("EVENT_TET_TIMEOUT"));
            this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.onBack.bind(this))));
            //this.onBack();
            return;
        }
        cc.log("ON BUTTON RELEASE");
        switch (id) {
            case EventTetScene.BTN_VIBRATE:
            case EventTetScene.BTN_VIBRATE_TEN:
                var idVibrate;
                if (id == EventTetScene.BTN_VIBRATE) {
                    idVibrate = EventTet.ONE_VIBRATE;
                }
                else {
                    idVibrate = this.btnVibrateTen.idSend;
                }
                cc.log("idVibrate " + id + " " + idVibrate);
                if (this.isWaitingResult || this.isVibrate) {
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("EVENT_TET_VIBRATING"));
                }
                else {

                    var numKey = eventTet.getNumKeyToVibrate(idVibrate);
                    cc.log("NUM KEY " + numKey);

                    if (numKey == 0) {
                        this.vibrate(idVibrate);
                    }
                    else {
                        if (eventTet.keyCoin < numKey) {
                            var gui = sceneMgr.openGUI(EventTetAlertTextGUI.className, EventTet.GUI_ALERT_TEXT, EventTet.GUI_ALERT_TEXT);
                            gui.setInfo(idVibrate);
                        }
                        else {
                            var notShow = cc.sys.localStorage.getItem("notShowAlertEventTet");

                            cc.log("NOT SHOW ALERT " + notShow );
                            var a = 3 + notShow;
                            cc.log("NOT SHOW ALERT 3434 **  " + a );
                            if (parseInt(notShow) == 0 || !notShow) {
                                var gui = sceneMgr.openGUI(EventTetAlertGUI.className, EventTet.GUI_ALERT, EventTet.GUI_ALERT);
                                gui.setType(idVibrate);
                            }
                            else {
                                this.vibrate(idVibrate);
                            }
                        }

                    }
                }
                break;
            case EventTetScene.BTN_GOLD:
                //this.tree.getAnimation().gotoAndPlay("3", -1, -1, 1);
                gamedata.openShop(EventTetScene.className);
                break;
            case EventTetScene.BTN_PAPER:
                //this.tree.getAnimation().gotoAndPlay("3", -1, -1, 1);
                gamedata.openShopTicket(EventTetScene.className);
                break;
            case EventTetScene.BTN_G:
                gamedata.openNapG(EventTetScene.className);
                break;
            case EventTetScene.BTN_CHEAT:
                this.pCheat.setVisible(!this.pCheat.isVisible());
                break;
            case EventTetScene.BTN_CHEAT_TEXT:
                var arrayNumber = [];
                for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
                    var gServer = parseFloat(this.tfCheatText[i].getString());
                    if (isNaN(gServer)) gServer = 0;
                    arrayNumber.push(gServer);
                }
                var exp = parseFloat(this.tfCheatExp.getString());
                if (isNaN(exp)) {
                    // Toast.makeToast(1.0, "Chua nhap so EXP");
                    exp = 0;
                    // return;
                }
                var specialText = parseFloat(this.tfSpecialText.getString());
                if (isNaN(specialText)) {
                    // Toast.makeToast(1.0, "Chua nhap so chu dac biet");
                    specialText = 0;
                    // return;
                }
                eventTet.sendCheatText(specialText, exp, arrayNumber);
                break;
            case EventTetScene.BTN_RESET:
                eventTet.sendReset();
                break;
            case EventTetScene.BTN_CHEAT_G:
                var idGServer = parseFloat(this.tfCheatG.getString());
                if (isNaN(idGServer)) {
                    idGServer = 0;
                    return;
                }
                var idGUser = parseFloat(this.tfCheatGUser.getString());
                if (isNaN(idGUser)) {
                    idGUser = 0;
                    return;
                }
                eventTet.sendCheatG(idGServer, idGUser);
                break;
            case EventTetScene.BTN_CHEAT_EXP:
                var id = parseFloat(this.tfCheatExp.getString());
                if (isNaN(id)) {
                    Toast.makeToast(1.0, "Chua nhap so G");
                    return;
                }
                eventTet.sendCheatExp(id);
                break;
            case EventTetScene.BTN_CHEAT_LIXI:
                var id = parseFloat(this.tfIdLixi.getString());
                if (isNaN(id)) {
                    Toast.makeToast(1.0, "Chua nhap ID lix xi");
                    return;
                }
                var num = parseFloat(this.tfNumLixi.getString());
                if (isNaN(num)) {
                    Toast.makeToast(1.0, "Chua nhap so luong li xi");
                    return;
                }
                eventTet.sendCheatLixi(id, num);
                break;
            case EventTetScene.BTN_CHEAT_VIBRATE:
                var num = parseFloat(this.tfCheatVibrate.getString());
                if (isNaN(num)) {
                    Toast.makeToast(1.0, "Chua nhap so luong");
                    return;
                }

                for (var i = 0; i < num; i++)
                    eventTet.sendVibrate(CmdReceiveEventTetVibrate.TEN);
                break;
            case EventTetScene.BTN_CHEAT_TOKEN:
                var arr = [];
                for (var i = 0; i < EventTet.WEEK_END; i++) {
                    var num = parseFloat(this.arrayTfCheatToken[i].getString());
                    if (isNaN(num)) {
                        arr[i] = 0;
                    }
                    else {
                        arr[i] = num;
                    }
                }
                var numUser = parseInt(this.tfNumUser.getString());
                if (isNaN(numUser)) {
                    eventTet.sendCheatToken(GameData.getInstance().userData.uID, arr);
                }
                else {
                    eventTet.sendCheatToken(numUser, arr);
                }
                break;
            case EventTetScene.BTN_CHEAT_TOKEN_N:
                var arr = [];
                for (var i = 0; i < EventTet.WEEK_END; i++) {
                    var num = parseFloat(this.arrayTfCheatToken[i].getString());
                    if (isNaN(num)) {
                        arr[i] = 0;
                    }
                    else {
                        arr[i] = num;
                    }
                }
                var numUser = parseInt(this.tfNumUser.getString());
                if (isNaN(numUser)) {
                    eventTet.sendCheatToken(GameData.getInstance().userData.uID, arr);
                }
                else {
                    for (var i = 0; i < numUser; i++) {
                        eventTet.sendCheatToken(i + 1, arr);
                    }
                }

                break;
            case EventTetScene.BTN_MENU:
                break;
            case EventTetScene.BTN_TOP:
            {
                // NativeBridge.openWebView(eventTet.eventLinkNews);
              //  eventTet.saveTopInfo(eventTet.createCmdTop());
                eventTet.sendGetTop(eventTet.eventTime);
                var gui = sceneMgr.openGUI(EventTetRankGUI.className);
                //this
                break;
            }
            case EventTetScene.BTN_AUTO:
                eventTet.isAuto = !eventTet.isAuto;
                this.btnAuto.select.setVisible(eventTet.isAuto);
                break;
            case EventTetScene.BTN_HELP:
                // eventTet.isAuto = !eventTet.isAuto;
                // return;
                var gui = sceneMgr.openGUI(EventTetHelpGUI.className, EventTet.GUI_HELP, EventTet.GUI_HELP);
                break;
            case EventTetScene.BTN_GIFT:
                var gui = sceneMgr.openGUI(EventTetRankGUI.className);
                break;
            case EventTetScene.BTN_BACK:
                this.onBack();
                break;

        }
    },

    update: function(dt) {
        // UPDATE EVENT TIME
        if (this.labelTime && this.isEventTime) {
            eventTet.updateEventLoop();
            var str = LocalizedString.to("EVENT_TET_INFO_TIME_LEFT");
            var stime = eventTet.getTimeLeftString();
            str = StringUtility.replaceAll(str, "%time", stime);
            this.labelTime.setString(str);

            var nTime = eventTet.getTimeLeft();
            if(nTime <= 0)
            {
                cc.log(" CURENT WEKK " + eventTet.eventTime);
                if(eventTet.eventTime == EventTet.WEEK_END)
                {
                    this.labelTime.setString(LocalizedString.to("EVENT_TET_TIMEOUT"));
                    eventTet.eventTime = EventTet.WEEK_END + 1;
                }
                else
                {
                    this.labelTime.setString(LocalizedString.to("EVENT_TET_NEXT_WEEK"));
                }

                this.isEventTime = false;
            }
        }

        // UPDATE RUN FIREWORK
        this.countTimeFireWork = this.countTimeFireWork + dt;
        if (this.countTimeFireWork > 0.7) {
            this.countTimeFireWork = 0;
            var i;
            var firework;
            for (i = 0; i < this.arrayFirework.length; i++) {
                if (!this.arrayFirework[i].isVisible()) {
                    firework = this.arrayFirework[i];
                    break;
                }
            }
            if (i == this.arrayFirework.length) {
                firework = db.DBCCFactory.getInstance().buildArmatureNode("phaohoa1");
                this.panelFirework.addChild(firework);
                this.arrayFirework.push(firework);
            }
            firework.setVisible(true);
            firework.getAnimation().gotoAndPlay("run", -1, -1, 1);
            firework.setPosition(Math.random() * 420, 50 + Math.random() * 60);
            //this.arrayFirework.setCompleteListener();
            firework.setCompleteListener(this.onFinishEffectFirework.bind(this, firework));
            var random = 0.5 + Math.random() * 0.5;
            firework.setScale(random);
            firework.setOpacity(255 * random);
            //
            //var p;
            //switch(i) {
            //    case 0:
            //        p = cc.p(50, 50);
            //        break;
            //    case 1:
            //        p = cc.p(150, 110);
            //        break;
            //    case 2:
            //        p = cc.p(400, 90);
            //        break;
            //    default :
            //        p = cc.p(250, 80);
            //        break;
            //}
            //this.arrayFirework[i].setPosition(p);

        }

        // Effect Money run
        if (this.isEffectMoney) {
            this.curEffectMoney += this.deltaEffectMoney;
            this.labelGold.setString(StringUtility.formatNumberSymbol(this.curEffectMoney));
        }
    },

    updateUserInfo: function() {
        //if (this.currentGold == GameData.getInstance().userData.bean) {
        //    this.deltaGold = 0;
        //    this.labelGold.setString(StringUtility.pointNumber(this.currentScore));
        //}
        //else {
        //    var addScore = rollDice.myDataRank[rollDice.currentChannel].score - this.currentScore;
        //    this.addScore(addScore);
        //}
        if (!this.isWaitingResult) {
            this.curEffectMoney = gamedata.userData.bean;
            this.labelGold.setString(StringUtility.formatNumberSymbol(gamedata.userData.bean));
            // this.lbBean.setString(StringUtility.pointNumber(gamedata.userData.coin));

            this.isEffectMoney = false;
        }
        this.labelPaper.setString(StringUtility.pointNumber(eventTet.keyCoin));
        this.updateProgressBar();
        this.setLabelText(GameData.getInstance().userData.displayName, this.lbName);

    },

    updateMyRankInfo: function () {
        var dataTop = eventTet.getIsTop();
        if (dataTop.x >= 0) {
            // truoc do da nam trong Top roi
            var s = localized("EVENT_TET_HAD_RANK");
            s = StringUtility.replaceAll(s, "@rank", dataTop.x);
            s = StringUtility.replaceAll(s, "@week", dataTop.y);
            this.lbRank.setString(s);
        }
        else {
            var data = eventTet.getMyRankData(eventTet.eventTime);
            if (data) {
                this.lbRank.setString(data.myRank);
            }
        }
        var time = "(" + eventTet.eventWeeks[eventTet.eventTime - 1] + "-" + eventTet.getEndWeek(eventTet.eventWeeks[eventTet.eventTime - 1]) + ")";
        this.lbWeek.setString(localized("WEEK") + " " + eventTet.eventTime + " " + time);
        this.lbNum.setString(eventTet.numToken);
    },

    updateProgressBar: function () {
        this.labelExp.setString(eventTet.getExpString());
        var percent = eventTet.getExpPercent();
        var wBar = this.bgProgress.getContentSize().width * percent / 100;
        if (wBar > 27)
            this.progress.setContentSize(wBar, this.progress.getContentSize().height);
        else
            this.progress.setContentSize(27, this.progress.getContentSize().height);
        this._uiTimer.setPercentage(100 - percent);
    },

    updateEventInfo: function () {
        if (this.isWaitingResult)
            return;
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            this.arrayLabelNum[i].setString(eventTet.arrayNumText[i]);
            // this.arrayPrice[i].setString(eventTet.arrayPrice[i]);
            if (eventTet.arrayNumText[i] > 0) {
                this.arrayIcon[i].setOpacity(255);
            }
            else {
                this.arrayIcon[i].setOpacity(150);
            }
        }

        this.listLixi.reloadData();
        if (eventTet.getTimeLeft() > 0)
            this.isEventTime = true;
        var numKey = eventTet.getNumKeyToVibrate(EventTet.ONE_VIBRATE);
        var resource;
        if (numKey > 0) {
            this.btnVibrate.lbNum.setString(numKey);
            this.btnVibrate.lbNum.setVisible(true);
            resource = EventTet.DEFAUT_UI + "BtnVibrate/btnOnePaper.png";
        }
        else {
            this.btnVibrate.lbNum.setVisible(false);
            resource = EventTet.DEFAUT_UI + "BtnVibrate/btnOne.png";
        }
        this.btnVibrate.loadTextures(resource, resource, resource);

        // numKey = eventTet.getNumKeyToVibrate(EventTet.HUNDRED_VIBRATE);
        // cc.log("NUM KEY " + numKey);
        cc.log("CAN do 100 " + eventTet.checkCanVibrate100());
        if (eventTet.checkCanVibrate100()) { // du dieu kien quay 100 lan
            numKey = eventTet.getNumKeyToVibrate(EventTet.HUNDRED_VIBRATE);
            cc.log("NUM KEY " + numKey);
            this.btnVibrateTen.idSend = EventTet.HUNDRED_VIBRATE;
            if (numKey > 0) {
                this.btnVibrateTen.lbNum.setString(numKey);
                resource = EventTet.DEFAUT_UI + "BtnVibrate/btnHundredPaper.png";
                this.btnVibrateTen.lbNum.setVisible(true);
            }
            else {
                resource = EventTet.DEFAUT_UI + "BtnVibrate/btnHundred.png";
                this.btnVibrateTen.lbNum.setVisible(false);
            }
            this.btnVibrateTen.loadTextures(resource, resource, resource);
        }
        else {
            this.btnVibrateTen.idSend = EventTet.TEN_VIBRATE;
            numKey = eventTet.getNumKeyToVibrate(EventTet.TEN_VIBRATE);
            if (numKey > 0) {
                this.btnVibrateTen.lbNum.setString(numKey);
                this.btnVibrateTen.lbNum.setVisible(true);
                resource = EventTet.DEFAUT_UI + "BtnVibrate/btnTenPaper.png";
            }
            else {
                resource = EventTet.DEFAUT_UI + "BtnVibrate/btnTen.png";
                this.btnVibrateTen.lbNum.setVisible(false);
            }
            this.btnVibrateTen.loadTextures(resource, resource, resource);
        }
    },

    onEffectGetMoneyItem: function (value) {
        // cc.log("MONEY " + value);
        this.isEffectMoney = true;
        this.deltaEffectMoney = value * 0.25;
        // this.updateUserInfo();
    },

    showBgSetting: function() {

    },

    addTree: function() {
        if (this.tree)
            this.tree.removeFromParent();

        this.tree = db.DBCCFactory.getInstance().buildArmatureNode("Cayvang");
        this.tree.getAnimation().gotoAndPlay("2");
        this.tree.setPosition(-40, 390);

        this.panelCenter.addChild(this.tree);
    },

    addCoin: function () {
        EventTetSound.playCoinIn();
        for (var i = 0; i < 5; i++) {
            var coin = db.DBCCFactory.getInstance().buildArmatureNode("CoinTet");
            //  coin.getAnimation().gotoAndPlay("run");
            this.panelCenter.addChild(coin);
            switch (i) {
                case 0:
                    coin.setPosition(40, 150);
                    break;
                case 1:
                    coin.setPosition(120, 170);
                    break;
                case 2:
                    coin.setPosition(210, 260);
                    break;
                case 3:
                    coin.setPosition(270, 240);
                    break;
                case 4:
                    coin.setPosition(360, 190);
                    break;
            }
            coin.setVisible(false);
            coin.setScale(0.7);
            coin.runAction(cc.sequence(cc.delayTime(0.6 * Math.random()), cc.callFunc(function (sender) {
                sender.setVisible(true);
                sender.getAnimation().gotoAndPlay("run");
            })));
        }

        for (var i = 1; i <= 16; i++) { // co 16 bieu tuong qua trong animation

            var obj, obj1, img;
            if (cc.sys.isNative) {
                obj = this.tree.getCCSlot("qua" + i);
                obj = obj.getCCChildArmature();
                obj1 = obj.getCCSlot("Layer 1");
                img = obj1.getCCDisplay();
            } else {
                obj = this.tree.getArmature().getSlot("qua" + i);
                obj = obj.getChildArmature();
                obj1 = obj.getSlot("Layer 1");
                img = obj1.getDisplay();
            }
            var random = Math.floor(Math.random() * 2.999);
            img.setTexture(EventTet.DEFAUT_UI + "Lixi/lixi" + random + ".png");
        }
    },

    vibrate: function(num) {
        var numKey = eventTet.getNumKeyToVibrate(num);
        if (eventTet.isAuto) {
            cc.log("EVENT TIME " + eventTet.eventTime);
            if (numKey > eventTet.keyCoin || eventTet.eventTime > EventTet.WEEK_END)
                return;
        }
        EventTetSound.playFirework();
        eventTet.numVibrate = num;
        this.isVibrate = true;
        this.isWaitingResult = true;
        var delayTime = 0;
        CoinFallEffectEventTet.RATE_Position_Y = 10;

        // cc.log("NUM " + num + " NUM KEY " + numKey);
        this.labelPaper.setString(StringUtility.pointNumber(eventTet.keyCoin - numKey));
        this.effectCoinFall.setVisible(true);
        if (num == EventTet.ONE_VIBRATE) {
            this.tree.getAnimation().gotoAndPlay("1", -1, -1, 1);
            delayTime = 2.5;
            this.effectCoinFall.startEffect(100, CoinFallEffectEventTet.TYPE_RAIN);
            // if (num == EventTetScene.BTN_ONE) {
            //     eventTet.sendVibrate(CmdReceiveEventTetVibrate.ONE);
            //     if (this.labelPriceOne.money > 0) {
            //         this.labelG.setString(StringUtility.formatNumberSymbol(GameData.getInstance().userData.coin - this.labelPriceOne.money));
            //         this.effectG(this.btnOne, this.labelPriceOne.money);
            //     }
            // }
            // else {
            eventTet.sendVibrate(CmdReceiveEventTetVibrate.ONE);
            // }
            EventTetSound.playOneTouch();
            if (numKey > 0) {
                this.effectPaper(this.btnVibrate, numKey);
            }
        }
        else {
            this.tree.getAnimation().gotoAndPlay("3", -1, -1, 1);
            delayTime = 3;
            this.effectCoinFall.startEffect(400, CoinFallEffectEventTet.TYPE_RAIN);
            // if (num == EventTetScene.BTN_TEN) {
            //     eventTet.sendVibrate(CmdReceiveEventTetVibrate.TEN);
            //     if (this.labelPriceTen.money > 0) {
            //         this.labelG.setString(StringUtility.formatNumberSymbol(GameData.getInstance().userData.coin - this.labelPriceTen.money));
            //         this.effectG(this.btnTen, this.labelPriceTen.money);
            //     }
            // }
            // else {
            if (num == EventTet.TEN_VIBRATE)
                eventTet.sendVibrate(CmdReceiveEventTetVibrate.TEN);
            else
                eventTet.sendVibrate(CmdReceiveEventTetVibrate.HUNDRED);
            // }
            EventTetSound.playTenTouch();
            if (numKey > 0) {
                this.effectPaper(this.btnVibrateTen, numKey);
            }
        }

        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            this.arrayIconEffect[i].setPosition(this.arrayIcon[i].getPosition());
            this.arrayIconEffect[i].setOpacity(255);
            if (eventTet.arrayNumText[i] < num && eventTet.arrayNumText[i] > 0) {
                this.arrayLabelEffect[i].setString(eventTet.arrayNumText[i]);
                this.arrayLabelEffect[i].setVisible(true);
                this.arrayIconEffect[i].setVisible(true);
                this.arrayLabelNum[i].setString(0);
            }
            else if (eventTet.arrayNumText[i] >= num){
                this.arrayLabelEffect[i].setString(num);
                this.arrayLabelEffect[i].setVisible(true);
                this.arrayIconEffect[i].setVisible(true);
                this.arrayLabelNum[i].setString(eventTet.arrayNumText[i] - num);
            }
            this.arrayIconEffect[i].runAction(cc.sequence(cc.spawn(new cc.EaseBackOut(cc.moveBy(0.5, 0, 50))),cc.fadeOut(0.5),
                cc.callFunc(function (sender) {
                    sender.setVisible(false);
                })));
        }
        //  this.genLeaf();
        this.runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(this.onResultVibrate.bind(this))));
        //  this.tree.setCompleteListener(this.onResultVibrate.bind(this));

    },

    effectPaper: function (btn, price) {
        this.iconEffectPaper.setVisible(true);
        this.iconEffectPaper.setOpacity(255);
        this.iconEffectPaper.setPosition(btn.getPositionX() + 20 , btn.getPositionY() + 50);
        this.iconEffectPaper.runAction(cc.spawn(cc.moveBy(0.7, 0, 50), cc.fadeOut(0.7)));
        this.labelEffectPaper.setString(price);
    },

    onReceiveVibrate: function (cmd) {
        // this.isWaitingResult = false;
        if (cmd.result == 1) {
            this.giftsResult = {};
            for (var i = 0; i < cmd.ids.length; i++) {
                this.giftsResult["" + cmd.ids[i]] = cmd.numbers[i];
                // if (this.giftsResult["" + cmd.ids[i]]) {
                //     this.giftsResult["" + cmd.ids[i]] = this.giftsResult["" + cmd.ids[i]] + 1;
                // }
                // else {
                //     this.giftsResult["" + cmd.ids[i]] = 1;
                // }
                if (eventTet.isItemStored(cmd.ids[i])) {
                    this.genLeaf(cmd.ids[i]);
                }
            }
            if (cmd.bonusGold > 0) {
                this.giftsResult[EventTet.GOLD_ID] = cmd.bonusGold;
            }
            if (this.isVibrate == false) {
                this.showResultVibrate();
            }
        }
        else {
            this.isWaitingResult = false;
            if (cmd.result == CmdReceiveEventTetVibrate.ERROR_NEW_DAY) {
                if (eventTet.eventTime > EventTet.WEEK4) {
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("EVENT_TET_TIMEOUT"));
                    this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.onBack.bind(this))));
                }
                else
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("EVENT_TET_VIBRATE_ERROR_" + cmd.result));
            }
            else {
                ToastFloat.makeToast(ToastFloat.SHORT, localized("EVENT_TET_VIBRATE_ERROR_" + cmd.result));
            }
            this.updateEventInfo();
            this.updateUserInfo();
        }
    },

    genLeaf: function(id) {
        var sprite = cc.Sprite.create(eventTet.getPieceImage(id));
        this.panelEffect.addChild(sprite);
        sprite.setScale(0.6);
        sprite.setPosition(140 + Math.random() * 70, 270 + Math.random() * 80);
        sprite.runAction(cc.sequence(cc.delayTime(0.5 * Math.random()), cc.moveTo(0.5, sprite.getPositionX(), 100), cc.jumpBy(1.3, cc.p(0, 0), 50, 3), cc.spawn(cc.scaleTo(0.5, 5.0), cc.fadeOut(0.5))));
        EventTetSound.playBaoLixi();
    },

    onResultVibrate: function() {
        cc.log("RESULT VIBRATE");
        this.tree.getAnimation().gotoAndPlay("2", -1, -1, -1);
        this.isVibrate = false;
        //this.giftsResult = {};
        //for (var i = 0; i < 16; i++) {
        //    if (i < 6)
        //        this.giftsResult[i + ""] = Math.floor(Math.random() * 5);
        //    else
        //        this.giftsResult[i + 10000 + ""] = Math.floor(Math.random() * 4);
        //}
        if (this.giftsResult) {
            this.showResultVibrate();
        }
    },

    showResultVibrate: function() {
        //for (var i = 0; i < 8; i++) {
        //    if (i < 6)
        //        this.giftsResult[i + ""] = Math.floor(Math.random() * 5);
        //    else
        //        this.giftsResult[i * 10 + ""] = Math.floor(Math.random() * 4);
        //}
        // this.onShowResult();
        var goldPos = this.labelGold.getParent().convertToWorldSpace(this.labelGold.getPosition());
        goldPos.x -= 45;
        var desPos = this.itemInList.getParent().convertToWorldSpace(cc.p(this.itemInList.getPosition().x + this.itemInList.getContentSize().width * 0.5,
            this.itemInList.getPosition().y + this.itemInList.getContentSize().height * 0.5));
        var gui = sceneMgr.openGUI(EventTetReceiveVibrateGiftGUI.className, EventTet.GUI_RECEIVE_VIBRATE_GIFT, EventTet.GUI_RECEIVE_VIBRATE_GIFT);
        if (gui) {
            cc.log("GIFT RESULT " + JSON.stringify(this.giftsResult));
            gui.openGift(this.giftsResult, desPos, goldPos);
        }
    },

    playGame: function () {
        if (CheckLogic.checkQuickPlay()) {
            var pk = new CmdSendQuickPlay();
            GameClient.getInstance().sendPacket(pk);
            pk.clean();
            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
        }
        else {
            if (Math.floor(gamedata.timeSupport) > 0) {
                var pk = new CmdSendGetSupportBean();
                GameClient.getInstance().sendPacket(pk);
                gamedata.showSupportTime = true;
                pk.clean();
            }
            else {
                if (gamedata.checkEnablePayment()) {
                    var msg = LocalizedString.to("QUESTION_CHANGE_GOLD");
                    sceneMgr.showChangeGoldDialog(msg, this, function (buttonId) {
                        if (buttonId == Dialog.BTN_OK) {
                            gamedata.openShop();
                        }
                    });
                }
                else {
                    sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                }
            }
        }
    },

    onFinishEffectShowResult: function () {
        this.isWaitingResult = false;
        //this.enableRollButton(true);
        this.updateEventInfo();
        this.updateUserInfo();
        if (eventTet.isAuto) {
            this.vibrate(eventTet.numVibrate);
        }
    },

    onFinishEffectFirework: function (sender) {
        sender.setVisible(false);
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(60, 93);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new EventTetItemCell();
        }
        cell.setInfo(idx);
        return cell;
    },

    tableCellTouched: function (table, cell) {
        if (eventTet.eventTime > EventTet.WEEK_END) {
            Toast.makeToast(ToastFloat.SHORT, localized("EVENT_TET_TIMEOUT"));
            this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.onBack.bind(this))));
            //this.onBack();
            return;
        }
        cc.log("IDC " + eventTet.arrayLixi[cell.getIdx()].id);
        eventTet.sendGetMap(eventTet.arrayLixi[cell.getIdx()].id);

        // eventTet.mapLixi = [];
        // for (var i = 0; i < 24; i++) {
        //     eventTet.mapLixi[i] = - (Math.floor(Math.random() * 10000000));
        // }
        // eventTet.exchangeLixi();
        // var gui = sceneMgr.openScene(EventTetOpenLixiGUI.className);
        // gui.waitCloseLixi = true;
        // gui.setInfoMap();
    },

    numberOfCellsInTableView: function (table) {
        return EventTet.NUM_GIFT;
    },

    onUpdateGUI: function () {

    }

})
EventTetScene.className = "EventTetScene";
//BROADCAST SERVER
EventTetScene.messageCaches = [];
EventTetScene.timeMessageDisplay = 0;

EventTetScene.createMessageBroadcast = function (message) {
    if (message == "")
        return null;

    var length = cc.winSize.width * 0.2;
    var _label = new ccui.Text();
    _label.setAnchorPoint(cc.p(0, 0.5));
    _label.setFontName("fonts/tahoma.ttf");
    _label.setFontSize(17);
    _label.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
    _label.setColor(sceneMgr.ccWhite);
    _label.setString(message);
    _label.x = length;
    _label.y = 10;

    var shape = new cc.DrawNode();
    var green = cc.color(0, 255, 0, 255);
    shape.drawRect(cc.p(0, 0), cc.p(length, 50), green);

    var clipper = new cc.ClippingNode();
    clipper.tag = 100;
    clipper.anchorX = 1;
    clipper.anchorY = 0.5;
    clipper.x = cc.winSize.width / 2 + length / 2;
    clipper.y = cc.winSize.height - _label.getContentSize().height * 1.5;
    clipper.stencil = shape;

    clipper.addChild(_label);
    var scale = cc.director.getWinSize().width / Constant.WIDTH;
    scale = (scale > 1) ? 1 : scale;
    clipper.setScale(scale);

    var toX = -_label.getContentSize().width - length;
    var veloc = 30;
    var time = Math.abs(toX / veloc);
    _label.runAction(cc.moveBy(time, cc.p(toX, 0)));
    clipper.runAction(cc.sequence(cc.delayTime(time), cc.removeSelf()));
    return clipper;
};

EventTetScene.onMessageBroadcast = function (message) {
    if (message === undefined || message == null || message == "") return;

    EventTetScene.messageCaches.push(message);

    if (sceneMgr.layerGUI) {
        if (!sceneMgr.layerGUI.getChildByTag(EventTetScene.TAG_BROADCAST)) {
            EventTetScene.loop();
        }
    }
};

EventTetScene.checkAndDisplay = function () {
    if (EventTetScene.messageCaches.length > 0) {
        var message = "" + EventTetScene.messageCaches[0];
        EventTetScene.messageCaches.splice(0, 1);

        if (sceneMgr.layerGUI) {
            if (sceneMgr.layerGUI.getChildByTag(EventTetScene.TAG_BROADCAST))
                sceneMgr.layerGUI.removeChildByTag(EventTetScene.TAG_BROADCAST);

            sceneMgr.layerGUI.addChild(EventTetScene.createMessageBroadcast(message), EventTetScene.TAG_BROADCAST, EventTetScene.TAG_BROADCAST);
        }
    }
};

EventTetScene.loop = function () {
    EventTetScene.checkAndDisplay();

    engine.HandlerManager.getInstance().addHandler("eventTet_message_broadcast", function () {
        EventTetScene.doLoop(EventTetScene.TIME_DELAY_APPEAR);
    });
    engine.HandlerManager.getInstance().getHandler("eventTet_message_broadcast").setTimeOut(1, true);
};

EventTetScene.doLoop = function (t) {
    if (t === undefined) {
        t = EventTetScene.TIME_DEFAULT_APPEAR;
    }


    engine.HandlerManager.getInstance().addHandler("eventTet_broadcast", EventTetScene.loop);
    engine.HandlerManager.getInstance().getHandler("evnetTet_broadcast").setTimeOut(t, true);
};

EventTetScene.BTN_BACK = 0;
EventTetScene.BTN_GOLD = 1;
EventTetScene.BTN_PAPER = 2;
EventTetScene.BTN_VIBRATE = 3;
EventTetScene.BTN_ONE = 4;
EventTetScene.BTN_TEN = 5;
EventTetScene.BTN_CHEAT = 6;
EventTetScene.BTN_CHEAT_TEXT = 7;
EventTetScene.BTN_CHEAT_LIXI = 8;
EventTetScene.BTN_HELP = 9;
EventTetScene.BTN_SOUND = 10;
EventTetScene.BTN_RESET = 11;
EventTetScene.BTN_CHEAT_G = 12;
EventTetScene.BTN_CHEAT_EXP = 13;
EventTetScene.BTN_CHEAT_VIBRATE = 14;
EventTetScene.BTN_MENU = 15;
EventTetScene.BTN_TOP = 16;
EventTetScene.BTN_VIBRATE_TEN = 17;
EventTetScene.BTN_GIFT = 19;
EventTetScene.BTN_AUTO = 20;
EventTetScene.BTN_CHEAT_TOKEN = 40;
EventTetScene.BTN_CHEAT_TOKEN_N = 41;

EventTetScene.TIME_DELAY_APPEAR = 30;
EventTetScene.TIME_DEFAULT_APPEAR = 5;
EventTetScene.TAG_BROADCAST = 999999;

var EventTetItemCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/EventTet/EventTetItemCell.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = this.getControl("bg");
        this.label = this.getControl("labelNum");
    },

    getControl: function (name, parent) {
        if (!parent) parent = this._layout;

        return ccui.Helper.seekWidgetByName(parent, name);
    },

    setInfo: function (idx) {
        this.bg.loadTexture(EventTet.DEFAUT_UI + "Lixi/lixiBig" + (eventTet.arrayLixi[idx].id - EventTet.RANK_GIFT_1) + ".png");
        this.label.setString(eventTet.arrayLixi[idx].num);
    }

});

var EventTetOpenLixiGUI = BaseLayer.extend({

    ctor: function () {
        this._super(EventTetOpenLixiGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetOpenLixiGUI.json");
    },

    initGUI: function () {

        this.panelLeft = this.getControl("panelLeft");
        this.btnBack = this.customButton("btnClose", EventTetOpenLixiGUI.BTN_BACK, this.panelLeft);
        this.btnReset = this.customButton("btnReset", EventTetOpenLixiGUI.BTN_RESET, this._layout);
        this.bgLixi = this.getControl("bg");
        this.panelCenter = this.getControl("panelCenter", this.bgLixi);
        this.labelNum = this.getControl("labelNum", this.bgLixi);
        this.menu = this.getControl("menu");
        this.labelGold = this.getControl("labelGold", this.menu);
        this.labelG = this.getControl("labelG", this.menu);
        this.arrayLixi = [];
        for (var i = 0; i < EventTet.NUM_LIXI; i++) {
            this.arrayLixi[i] = new EventTetButtonLixi(i);
            this.panelCenter.addChild(this.arrayLixi[i]);
        }

        var padX = (this.panelCenter.getContentSize().width - 8 * this.arrayLixi[0].getContentSize().width) / 7;
        var padY = (this.panelCenter.getContentSize().height - 3 * this.arrayLixi[0].getContentSize().height) / 2;
        for (var i = 0; i < EventTet.NUM_LIXI; i++) {
            var row = Math.floor(i / 8);
            var column = i % 8;
            this.arrayLixi[i].setPositionX((column + 0.5) * this.arrayLixi[i].getContentSize().width + padX * column);
            this.arrayLixi[i].setPositionY((row + 0.5) * this.arrayLixi[i].getContentSize().height + padY * row);
            this.arrayLixi[i].pos = this.arrayLixi[i].getPosition();
        }

        this.bgDark = cc.Sprite.create("Lobby/Common/black.png");
        this.bgDark.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
        this.bgDark.setOpacity(0);
        this.bgDark.setScale(20);
        this.addChild(this.bgDark);
        this.spriteLixi = cc.Sprite.create(EventTet.DEFAUT_UI + "Lixi/lixiOpen10.png");
        this.addChild(this.spriteLixi);
        this.setBackEnable(true);

        this.imgGift = new cc.Sprite(EventTet.DEFAUT_UI + "Gift/gift0.png");
        this.addChild(this.imgGift);
        this.imgGift.setVisible(false);
        this.imgGift.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);

        // INIT CHEAT
        this.panelCheat = this.getControl("panelCheat");
        this.customButton = this.customButton("btnCheat", EventTetOpenLixiGUI.BTN_CHEAT, this.panelCheat);
        this.tfNum = this.getControl("tfNum", this.panelCheat);
        if (Config.ENABLE_CHEAT)
            this.panelCheat.setVisible(true);
        else
            this.panelCheat.setVisible(false);
        this.arrayFirework = [];
    },

    onUpdateGUI: function () {

    },

    onEnterFinish: function () {
        this.spriteLixi.setVisible(false);
        if (this.effectLixi)
            this.effectLixi.setVisible(false);
        this.bgDark.setOpacity(0);
        this.spriteLixi.stopAllActions();
        //this.stopAllActions();
        this.updateUserInfo();
        this.countTimeFireWork = 0;
        this.schedule(this.update, 0.04);
        this.imgGift.setVisible(false);
        this.setInfoMap();
    },

    updateEventInfo: function () {
        this.updateNumLixi();
    },

    updateUserInfo: function () {
        this.labelGold.setString(StringUtility.formatNumberSymbol(gamedata.userData.bean));
        this.isEffectMoney = false;
        this.labelG.setString(StringUtility.formatNumberSymbol(GameData.getInstance().userData.coin));
    },

    setInfoMap: function() {
        this.updateNumLixi();
        for (var i = 0; i < this.arrayLixi.length; i++) {
            this.arrayLixi[i].setInfoLixi();
        }
        this.cleanup();
        if (!eventTet.isOpenAll()) {
            this.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(this.openLixi.bind(this))));
            this.isEffect = true;
        }
        this.updateButtonReset();
    },

    updateButtonReset: function () {
        if (eventTet.isOpenAll()) {
            this.btnReset.setVisible(true);
        }
        else {
            this.btnReset.setVisible(false);
        }
    },

    updateNumLixi: function() {
        var lixi = eventTet.getLixiFromId(eventTet.indexLixi);
        var s = localized("EVENT_TET_NUM_AVAILABLE") + lixi.num;
        this.labelNum.setString(s);
        this.updateButtonReset();
    },

    openLixi: function() {
        var count = 0;
        // luu lai vi tri item, dam bao Item duoc trao doi
        for (var i = 0; i < EventTet.NUM_LIXI; i++) {
            if (!eventTet.mapLixi[i].isOpen()) {
                this.arrayLixi[i].openLixi(count * 0.03);
                count++;
            }
        }
        if (this.waitCloseLixi)
            this.runAction(cc.sequence(cc.delayTime(2.5), cc.callFunc(this.closeLixi.bind(this))));
    },

    closeLixi: function() {
        cc.log("CLOSE LIXI ");
        var count = 0;
        for (var i = 0; i < EventTet.NUM_LIXI; i++) {
            if (!eventTet.mapLixi[i].isOpen()) {
                this.arrayLixi[i].closeLixi(count * 0.03);
                count++;
            }
        }
        this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.autoRange.bind(this))));
    },

    autoRange: function() {
        for (var i = 0; i < EventTet.NUM_LIXI; i++) {
            if (!eventTet.mapLixi[i].isOpen()) {
                this.arrayLixi[i].moveTo(cc.p(this.panelCenter.getContentSize().width * 0.5, this.panelCenter.getContentSize().height * 0.5));
            }
        }
        this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.onFinishOpenGUI.bind(this))));
    },

    onFinishOpenGUI: function () {
        this.isEffect = false;
    },

    onReceiveResult: function (cmd) {
        this.updateNumLixi();
        if (cmd.result == 0) {
            this.idGift = cmd.receivedGiftId;
            this.typeGift = cmd.receivedGiftType;
            this.savePosition = cmd.position;
            this.arrayLixi[cmd.position].setVisible(false);
            this.spriteLixi.setPosition(this.panelCenter.convertToWorldSpace(this.arrayLixi[cmd.position].getPosition()));
            this.spriteLixi.setVisible(true);
            this.spriteLixi.setScale(1);
            this.spriteLixi.runAction(cc.sequence(cc.spawn(cc.moveTo(0.3, cc.winSize.width * 0.5,
                cc.winSize.height * 0.5), cc.scaleTo(0.3, 2.5)),
                cc.callFunc((function (sender) {
                    sender.setVisible(false);
                    if (this.effectLixi) {
                        this.effectLixi.removeFromParent();
                    }
                    this.effectLixi = db.DBCCFactory.getInstance().buildArmatureNode("Molixi");
                    this.effectLixi.getAnimation().gotoAndPlay("1");
                    this.effectLixi.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
                    this.addChild(this.effectLixi);

                    this.imgGift.setTexture(eventTet.getGiftImage(this.idGift, this.typeGift));
                    this.imgGift.setVisible(true);
                    this.imgGift.setOpacity(0);
                    this.imgGift.runAction(cc.sequence(cc.delayTime(2.2), cc.fadeIn(0.5), cc.delayTime(1.0), cc.fadeOut(0.5)));
                    this.runAction(cc.sequence(cc.delayTime(3.0), cc.callFunc(this.onFinishEffectOpen.bind(this))));
                }).bind(this))));
            this.bgDark.runAction(cc.fadeTo(0.5, 100));
        }
        else {
            this.isEffect = false;
            if (cmd.result == CmdReceiveEventTetOpenLixi.NOT_IN_EVENT) {
                ToastFloat.makeToast(ToastFloat.SHORT, localized("EVENT_TET_TIMEOUT"));
                this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.callbackToLobby.bind(this))));
                eventTet.eventTime = EventTet.WEEK4 + 1;
            }
            else {
                ToastFloat.makeToast(ToastFloat.SHORT, localized("EVENT_TET_OPEN_ERROR_" + cmd.result));
                if (cmd.result == CmdReceiveEventTetOpenLixi.ERROR_NEW_WEEK)
                    this.runAction(cc.sequence(cc.delayTime(1.5), cc.callFunc(this.onBack.bind(this))));
            }
        }
    },

    callbackToLobby: function () {
        sceneMgr.openScene(LobbyScene.className);
    },

    onFinishEffectOpen: function() {
        cc.log("WHAT THE HELL");
        this.bgDark.runAction(cc.fadeTo(0.5, 0));
        var gui = sceneMgr.openGUI(EventTetReceiveOpenGiftGUI.className, EventTet.GUI_RECEIVE_OPEN_GIFT, EventTet.GUI_RECEIVE_OPEN_GIFT);
        var gift = {"gift": 1, "id": this.idGift, "type": this.typeGift};
        gui.showGift(gift);
        this.arrayLixi[this.savePosition].onFinishOpenEffect(this.idGift, this.typeGift);
        this.updateUserInfo();
    },

    onFinishEffectGift: function () { // callback sau khi gui nhan thuong da hoan thanh
        this.isEffect = false;

        var lixi = eventTet.getLixiFromId(eventTet.indexLixi);
        if (lixi.num == 0) {
            this.waitCloseLixi = false;
            this.setInfoMap();
        }
    },

    resetMap: function () {
        for (var i = 0; i < this.arrayLixi.length; i++) {
            this.arrayLixi[i].effectResetMap();
        }
    },

    update: function(dt) {
        // UPDATE RUN FIREWORK
        this.countTimeFireWork = this.countTimeFireWork + dt;
        if (this.countTimeFireWork > 0.7) {
            this.countTimeFireWork = 0;
            var i;
            var firework;
            for (i = 0; i < this.arrayFirework.length; i++) {
                if (!this.arrayFirework[i].isVisible()) {
                    firework = this.arrayFirework[i];
                    break;
                }
            }
            if (i == this.arrayFirework.length) {
                firework = db.DBCCFactory.getInstance().buildArmatureNode("phaohoa1");
                this.addChild(firework);
                this.arrayFirework.push(firework);
            }
            firework.setVisible(true);
            firework.getAnimation().gotoAndPlay("run", -1, -1, 1);
            firework.setPosition(Math.random() * 800, cc.winSize.height - Math.random() * 70);
            //this.arrayFirework.setCompleteListener();
            firework.setCompleteListener(this.onFinishEffectFirework.bind(this, firework));
            var random = 0.4 + Math.random() * 0.2;
            firework.setScale(random);
            firework.setOpacity(255 * random);
        }
    },

    onFinishEffectFirework: function (sender) {
        sender.setVisible(false);
    },

    onButtonRelease: function (btn, id) {

        switch (id) {
            case EventTetOpenLixiGUI.BTN_BACK:
                this.onBack();
                break;
            case EventTetOpenLixiGUI.BTN_CHEAT:
                var num = parseFloat(this.tfNum.getString());
                if (isNaN(num)) {
                    Toast.makeToast(1.0, "Chua nhap so luong");
                    return;
                }
                var lixi = eventTet.getLixiFromId(eventTet.indexLixi);
                var count = 0;
                cc.log("NUM LIXI CHEAT " + num);
                for (var i = 0; i < EventTet.NUM_LIXI; i++) {
                    if (eventTet.isOpenLixi(i) == false && lixi.num > 0 && count < num) {
                        eventTet.sendOpenLixi(i);
                        lixi.num = lixi.num -1;
                        count++;
                    }
                }
                break;
            case EventTetOpenLixiGUI.BTN_GOLD:
                break;
            case EventTetOpenLixiGUI.BTN_G:
                break;
            case EventTetOpenLixiGUI.BTN_RESET:
                eventTet.sendOpenLixi(0);
                this.btnReset.setVisible(false);
                break;
            default:
                if (eventTet.isOpenLixi(id)) {
                    return;
                }
                if (!this.isEffect) {
                    if (eventTet.getLixiFromId(eventTet.indexLixi).num > 0) {
                        var lixi = eventTet.getLixiFromId(eventTet.indexLixi);
                        lixi.num = lixi.num -1;
                        this.updateNumLixi();
                        eventTet.sendOpenLixi(id);
                        eventTet.sortLixi();
                        var cmd = {"value" : 10000, "position": id};
                        // this.onReceiveResult(cmd);
                        this.isEffect = true;
                    }
                    else {
                        Toast.makeToast(1.0, localized("EVENT_TET_NO_LIXI"));
                    }
                }
                break;
        }
    },

    onBack: function () {
        sceneMgr.openScene(EventTetScene.className);
    }
})
EventTetOpenLixiGUI.className = "EventTetOpenLixiGUI";
EventTetOpenLixiGUI.TIME_MOVE = 0.05;
EventTetOpenLixiGUI.BTN_BACK = 100;
EventTetOpenLixiGUI.BTN_CHEAT = 103;
EventTetOpenLixiGUI.BTN_GOLD = 101;
EventTetOpenLixiGUI.BTN_G = 102;
EventTetOpenLixiGUI.BTN_RESET = 105;

var EventTetButtonLixi = ccui.Button.extend({
    ctor: function (index) {
        this._super();
        var ret = new ccui.Text()
        ret.setAnchorPoint(cc.p(0.5, 0.5));
        ret.setFontName(SceneMgr.FONT_NORMAL);
        ret.setFontSize(13);
        //ret.enableOutline(cc.color(100, 100, 100));
        ret.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        ret.setString("100");
        ret.setColor(cc.color(109, 73, 0));
        ret.setPosition(33, 15);
        this.label = ret;
        this.addChild(ret);

        this.loadTextures(EventTet.DEFAUT_UI + "Lixi/lixiOpen1.png", EventTet.DEFAUT_UI + "Lixi/lixiOpen1.png", "");
        this.index = index;
        this.setPressedActionEnabled(true);
        this.addClickEventListener(this.onClickLixi.bind(this));
        this.iconSelect = cc.Sprite.create(EventTet.DEFAUT_UI + "iconSelect.png");
        this.addChild(this.iconSelect);
    },

    onClickLixi: function () {
        var data = eventTet.mapLixi[this.index];
        if (data.isOpen()) {
            return;
        }
        var mainLayer = sceneMgr.getMainLayer();
        if (!mainLayer.isEffect) {
            if (eventTet.getLixiFromId(eventTet.indexLixi).num > 0) {
                var lixi = eventTet.getLixiFromId(eventTet.indexLixi);
                lixi.num = lixi.num -1;

                mainLayer.updateNumLixi();
                eventTet.sendOpenLixi(this.index);
                eventTet.sortLixi();
              //  var cmd = {"value" : 10000, "position": id};
                // this.onReceiveResult(cmd);
                mainLayer.isEffect = true;
            }
            else {
                Toast.makeToast(1.0, localized("EVENT_TET_NO_LIXI"));
            }
        }
    },

    setInfoLixi: function () {
        var data = eventTet.mapLixi[this.index];
        this.label.setVisible(false);
        this.setVisible(true);
        if (data.isOpen()) { // da mo roi
            this.iconSelect.setVisible(true);
            this.setOpacity(100);
            cc.log("DATA OPEN " + JSON.stringify(data));
            this.loadTextures(eventTet.getImageInMap(data), eventTet.getImageInMap(data));
            // if (data.type == EventTet.TYPE_TOKEN) {
            //     this.label.setVisible(false);
            // }
            // else {
                this.label.setVisible(true);
                this.label.setString(StringUtility.formatNumberSymbol(data.value));
            // }
        }
        else {
            this.setOpacity(255);
            this.iconSelect.setVisible(false);
            this.loadTextures("EventTet/EventTetUI/Lixi/lixiOpen10.png", "EventTet/EventTetUI/Lixi/lixiOpen10.png", "");
        }
        this.setPosition(this.pos);
        this.setScale(1, 1);
    },

    openLixi: function (timeDelay) {
        var data = eventTet.mapLixi[this.index];
        if (!data.isOpen()) {
            // if (eventTet.isItemStored(value)) {
            //     this.runAction(cc.sequence(cc.delayTime(timeDelay), cc.scaleTo(0.1, 0, 1),
            //         cc.callFunc(function (sender) {
            //             var value = Math.abs(eventTet.mapLixi[this.index]);
            //             sender.loadTextures(eventTet.getImageInMap(value), eventTet.getImageInMap(value));
            //             sender.label.setVisible(false);
            //         }).bind(this), cc.scaleTo(0.3, 1, 1), cc.repeat(cc.sequence(cc.scaleTo(0.2, 1.2), cc.scaleTo(0.2, 1.0)), 4)));
            // }
            // else {
                this.runAction(cc.sequence(cc.delayTime(timeDelay), cc.scaleTo(0.1, 0, 1),
                    cc.callFunc(function (sender) {
                        var data = eventTet.mapLixi[this.index];
                        sender.loadTextures(eventTet.getImageInMap(data), eventTet.getImageInMap(data));
                        sender.label.setVisible(true);
                        sender.label.setString(StringUtility.formatNumberSymbol(data.value));
                    }.bind(this)), cc.scaleTo(0.3, 1, 1)));
            // }
        }
    },

    closeLixi: function (timeDelay) {
        this.runAction(cc.sequence(cc.delayTime(timeDelay), cc.scaleTo(0.1, 0, 1),
            cc.callFunc(function (sender) {
                sender.loadTextures("EventTet/EventTetUI/Lixi/lixiOpen10.png", "EventTet/EventTetUI/Lixi/lixiOpen10.png", "");
                sender.label.setVisible(false);
            }.bind(this)), cc.scaleTo(0.3, 1, 1)));
    },

    moveTo: function (pos) {
        this.runAction(cc.sequence(
            new cc.EaseSineOut(cc.moveTo(0.4, pos)),
            cc.delayTime(0.5),
            new cc.EaseSineOut(cc.moveTo(0.4, this.pos))
        ));
    },

    onFinishOpenEffect: function (idGift, typeGift) {
        this.iconSelect.setVisible(true);
        this.setVisible(true);
        this.loadTextures(eventTet.getImageInMapWithId(idGift, typeGift), eventTet.getImageInMapWithId(idGift, typeGift), "");
        // if (eventTet.isItemStored(idGift)) {
        //     this.label.setVisible(false);
        // }
        // else {
            this.label.setVisible(true);
            this.label.setString(StringUtility.formatNumberSymbol(idGift));
        // }
    },

    effectResetMap: function () {
        var timeDelay = this.index % 8;
        timeDelay = timeDelay * 0.1;
        this.runAction(cc.sequence(
            cc.delayTime(timeDelay),
            cc.fadeOut(0.5),
            cc.callFunc(this.callbackReset.bind(this))
        ));
    },

    callbackReset: function () {
        this.iconSelect.setVisible(false);
        this.label.setVisible(false);
        this.setPosition(this.pos.x, this.pos.y + cc.winSize.height * 2);
        this.runAction(new cc.EaseSineOut(cc.moveTo(0.6, this.pos)));
        this.runAction(cc.sequence(cc.delayTime(0.2), cc.fadeIn(0.4)));
        this.loadTextures("EventTet/EventTetUI/Lixi/lixiOpen10.png", "EventTet/EventTetUI/Lixi/lixiOpen10.png", "");
    }
})

var EventTetAccumulateGUI = BaseLayer.extend({

    ctor: function () {
        this.bgCoin = null;
        this.coin = null;
        this.text1 = null;
        //this.text2 = null;

        this.progress = null;

        this.bar = null;
        this.num = null;
        this.exp = null;
        this.bonus = null;

        this.result = {};
        this.perLoad = [];
        this.deltaLoad = [];
        this.curLoad = 0;
        this.timeLoad = 0;

        this.curExpTmp = 0;
        this.nextExpTmp = 0;

        this.isKeyCoinChange = false;

        this._super(EventTetAccumulateGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetAccumulateGUI.json");
    },

    initGUI: function () {
        this.progress = this.getControl("progress");
        // try {
        //     this.progress.setPositionY(CheckLogic.getPositionEvent());
        // }
        // catch (e) {
        //
        // }
        this.progress.defaultPos = this.progress.getPosition();

        //var pDes = this.getControl("ico", this.progress).getPosition();

        this.bar = this.getControl("bar", this.progress);
        //this.num = this.getControl("num", this.progress);
        this.exp = this.getControl("exp", this.progress);
        this.bonus = this.getControl("bonus", this.progress);
        this.bonus.defaultPos = this.bonus.getPosition();
        this.panelButton = this.getControl("panelButton", this.progress);
        this.btnTouch = this.customButton("btnTouch", 0, this.panelButton);
        this.labelClick = this.getControl("labelClick", this.panelButton);

        //this.iconTicket = this.getControl("ico", this.progress);

        this.arrayEffect = [];
        this.arrayIcon = [];
        this.arrayLabel = [];
        this.arrayLight = [];
        for (var i = 0; i < EventTetAccumulateGUI.NUM_ITEM ; i++) {
            this.arrayIcon.push(this.getControl("icon" + i, this.progress));
            this.arrayLight.push(this.getControl("light" + i, this.progress));
            this.arrayIcon[i].setVisible(false);
            this.arrayLabel.push(this.getControl("label" + i, this.progress));
            var sprite = cc.Sprite.create(EventTet.DEFAUT_UI + "labelInGame" + i + ".png");
            this.progress.addChild(sprite);
            this.arrayEffect.push(sprite);
            sprite.setVisible(false);
            sprite.setLocalZOrder(2);
        }

        this.tab = this.getControl("tab");
        this.tab.setPositionY(this.tab.getPositionY() + 80);
        this.tab.setTouchEnabled(true);
        this.tab.setCascadeOpacityEnabled(false);
        this.tab.mainGUI = this;
        this.tab.addTouchEventListener(function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    return;
                case ccui.Widget.TOUCH_MOVED:
                    this.tab.setPositionY(this.tab.getPositionY() )
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                case ccui.Widget.TOUCH_ENDED:
                    cc.log("TOUCH THE TAB BUTTON");
                    // this.showAccumulate({
                    //     keyCoin: eventTet.arrayNumText,
                    //     keyCoinAdd: [0, 0, 0, 0],
                    //     nextLevelExp: eventTet.nextLevelExp,
                    //     currentLevelExp: eventTet.curLevelExp,
                    //     additionExp: 0
                    // });
                    this.showAccumulate({
                        keyCoin: eventTet.arrayNumText,
                        keyCoinAdd: [0, 0, 0, 0],
                        nextLevelExp: eventTet.nextLevelExp,
                        currentLevelExp: eventTet.curLevelExp,
                        additionExp: 0
                    });
                    this.runAction(cc.sequence(cc.delayTime(3), cc.callFunc(this.onCloseGUI.bind(this))));
                    break;
            }
        }, this);
        // this.tab.setTouchEnabled(false);

        // var that = this;
        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this),
            onTouchMoved: function(touch,event){},
            onTouchEnded: function(touch,event){}
        });

        // cc.eventManager.addListener(this._listener,this);
    },

    onTouchBegan: function(touch, event) {
        cc.log("ON TOUCH BEGAN 1 ");
        cc.log("ON TOUCH BEGAN " + JSON.stringify(touch.getLocation()));
        var rect = cc.rect(this.tab.getPositionX() - this.tab.getContentSize().width * 0.25, this.tab.getPositionY() - this.tab.getContentSize().height * 0.5, 60, 80);
        cc.log("RECT NEW " + JSON.stringify(rect));
        this.isMove = false;
        if (cc.rectContainsPoint(rect, touch.getLocation())) {
            this.isTouch = true;
            return true;
        }
        return false;
    },

    onTouchMoved: function(touch, event) {
        if (this.isTouch) {
            this.isMove = true;
            this.tab.setPositionY(touch.getLocation().y);
        }
    },

    onTouchEnded: function(touch, event) {
        this.isTouch = false;
        if (!this.isMove) {
            this.showAccumulate({
                keyCoin: eventTet.arrayNumText,
                keyCoinAdd: [0, 0, 0, 0],
                nextLevelExp: eventTet.nextLevelExp,
                currentLevelExp: eventTet.curLevelExp,
                additionExp: 0
            });
            this.runAction(cc.sequence(cc.delayTime(3), cc.callFunc(this.onCloseGUI.bind(this))));
        }
    },

    onEnterFinish: function () {
        this.result = null;

        this.progress.setPositionX(this.progress.defaultPos.x + this.progress.getContentSize().width * 1.5);

        this.bonus.setVisible(false);
        this.bonus.setString("");
        this.bonus.setPosition(this.bonus.defaultPos);
        this.exp.setString("0/100");

        this.schedule(this.update, EventTetAccumulateGUI.TIME_DELTA);

        this.tab.setOpacity(255);
        this.tab.removeAllChildren();
    },

    showAccumulate: function (cmd) {
        if (!this.haveFox) {
            if (this.fox)
                this.fox.setVisible(false);
            this.labelClick.setVisible(false);
        }
        this.result = cmd;
        this.tab.setTouchEnabled(false);
        this.tab.stopAllActions();
        this.tab.runAction(cc.fadeOut(0.4));
        if (!this.tab.isVisible()) return;
        this.tab.removeAllChildren();
        // this.isKeyCoinChange = (cmd.additionTicket > 0);

        //this.curExpTmp = eventTet.saveCurLevelExp;
        //this.nextExpTmp = eventTet.saveNextLevelExp;

        for (var i = 0; i < this.arrayEffect.length; i++) {
            this.arrayEffect[i].setVisible(false);
        }
        this.curExpTmp = eventTet.curLevelExp;
        this.nextExpTmp = eventTet.nextLevelExp;
        var perExp = eventTet.getExpPercent();
        perExp = (perExp < 5) ? 5 : perExp;
        this.bar.setPercent(perExp);
        //this.num.setString(eventTet.ticket);
        this.exp.setString(eventTet.getExpString());

        this.progress.stopAllActions();
        this.progress.isMoving = true;
        this.progress.runAction(cc.sequence(new cc.EaseBackOut(cc.moveTo(EventTetAccumulateGUI.TIME_MOVE, this.progress.defaultPos)), cc.callFunc(this.endMoving.bind(this))));

        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            this.arrayLight[i].setVisible(false);
            this.arrayLight[i].cleanup();
            this.arrayIcon[i].setVisible(false);
            this.arrayLabel[i].setString(eventTet.arrayNumText[i]);
        }
        this.isShow = true;
    },

    setAllShow: function (bool) {
        this.isAllShow = bool;
        this.tab.setVisible(bool);
        this.tab.setTouchEnabled(bool);
        // this.num.setString(eggBreaker.keyCoin);
    },

    updateCmd: function (cmd) {
        this.result = cmd;

        this.exp.setString(StringUtility.pointNumber(eventTet.curLevelExp) + "/" + StringUtility.pointNumber(eventTet.nextLevelExp));
        var perExp = eventTet.getExpPercent();
        perExp = (perExp < 5) ? 5 : perExp;
        this.bar.setPercent(perExp);
    },

    showEffect: function(id) {
        this.arrayLabel[id].setTag(id);
        this.arrayLabel[id].runAction(cc.sequence(cc.EaseElasticOut(cc.scaleTo(0.15, 1.35)), cc.callFunc(function (sender) {
            this.setString(eventTet.arrayNumText[sender.getTag()]);
        }.bind(this.arrayLabel[id])), cc.scaleTo(0.15, 0.8), cc.scaleTo(0.15, 1)));

        this.arrayIcon[id].setVisible(true);
        this.arrayIcon[id].setOpacity(255);
        this.arrayIcon[id].setScale(0.8);
        this.arrayIcon[id].runAction(cc.sequence(cc.scaleTo(0.3, 1.0), cc.scaleTo(0.3, 0.8), cc.fadeOut(0.3), cc.callFunc(function(sender) {
            sender.setVisible(false);
        })));

        this.arrayLight[id].setVisible(true);
        this.arrayLight[id].runAction(cc.repeatForever(cc.rotateBy(0.4, 30)));
    },

    endMoving: function () {
        // bonus
        this.progress.isMoving = false;
        this.bonus.setVisible(true);
        this.bonus.setString("+" + StringUtility.pointNumber(this.result.additionExp));
        this.bonus.runAction(cc.sequence(cc.scaleTo(0.15, 1.25), cc.scaleTo(0.15, 0.8), cc.scaleTo(0.15, 1)));

        // effect bar progress
        this.perLoad = [];
        this.deltaLoad = [];

        if (eventTet.nextLevelExp > 1) {
            if (eventTet.curLevelExp + this.result.additionExp >= eventTet.nextLevelExp) {
                this.deltaLoad.push(eventTet.nextLevelExp - eventTet.curLevelExp);
                this.deltaLoad.push(this.result.currentLevelExp);
                //this.deltaLoad.push(this.result.additionExp - eventTet.nextLevelExp + eventTet.curLevelExp);

                this.perLoad.push(this.getPerLoad(eventTet.nextLevelExp - eventTet.curLevelExp, eventTet.nextLevelExp));
                this.perLoad.push(this.getPerLoad(this.result.currentLevelExp, this.result.nextLevelExp));
                // this.perLoad.push(this.getPerLoad(this.result.additionExp - eventTet.nextLevelExp + eventTet.curLevelExp, this.result.nextLevelExp));
            }
            else {
                this.deltaLoad.push(this.result.additionExp);
                this.perLoad.push(this.getPerLoad(this.result.additionExp, this.result.nextLevelExp));
            }
        }
        else {
            var oldExp = 0;
            this.exp.setString(StringUtility.pointNumber(oldExp) + "/" + StringUtility.pointNumber(this.result.nextLevelExp));
            this.bar.setPercent(parseFloat(oldExp * 100 / this.result.nextLevelExp));

            this.deltaLoad.push(this.result.currentLevelExp);
            this.perLoad.push(this.getPerLoad(this.result.currentLevelExp, this.result.nextLevelExp));
        }

        // start loading
        this.curLoad = 0;
        this.timeLoad = EventTetAccumulateGUI.TIME_PROGRESS / this.perLoad.length;

        for (var i = 0; i < this.perLoad.length; i++) {
            this.perLoad[i] = EventTetAccumulateGUI.TIME_DELTA * this.perLoad[i] / this.timeLoad;
            this.deltaLoad[i] = EventTetAccumulateGUI.TIME_DELTA * this.deltaLoad[i] / this.timeLoad;
        }

        // update luckyCard info
        eventTet.curLevelExp = this.result.currentLevelExp;
        eventTet.nextLevelExp = this.result.nextLevelExp;
        eventTet.arrayNumText = this.result.keyCoin;
    },

    endCoin: function () {
        if (!this.result)
            return;
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            if (this.result.keyCoinAdd[i] > 0)
                this.showEffect(i);
        }
    },

    onFinishLoad: function () {
        if (this.curLoad >= this.perLoad.length) {
            var perExp = eventTet.getExpPercent();
            perExp = (perExp < 5) ? 5 : perExp;
            this.bar.setPercent(perExp);
            this.exp.setString(eventTet.getExpString());
            this.endCoin();
            if (this.haveFox) {

            }
            else {
                this.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.onCloseGUI.bind(this))));
            }

        }
    },

    onCloseGUI: function () {
        var moveTo = cc.moveTo(EventTetAccumulateGUI.TIME_MOVE, cc.p(this.progress.defaultPos.x + this.progress.getContentSize().width, this.progress.defaultPos.y));
        this.tab.setTouchEnabled(true);
        this.tab.runAction(cc.fadeTo(EventTetAccumulateGUI.TIME_MOVE, 255));
        this.progress.runAction(new cc.EaseBackOut(moveTo));
        // var moveTo = cc.moveTo(EventTetAccumulateGUI.TIME_MOVE, cc.p(this.progress.defaultPos.x + this.progress.getContentSize().width, this.progress.defaultPos.y));
        // this.progress.runAction(cc.sequence(new cc.EaseBackOut(moveTo), cc.callFunc(this.onClose.bind(this))));
        this.isShow = false;
        this.haveFox = false;
    },

    getPerLoad: function (a, b) {
        return (a * 100 / b);
    },

    update: function (dt) {
        if (this.curLoad < this.perLoad.length) {
            this.bar.setPercent(this.bar.getPercent() + this.perLoad[this.curLoad]);

            this.curExpTmp += this.deltaLoad[this.curLoad];
            this.exp.setString(StringUtility.pointNumber(this.curExpTmp) + "/" + StringUtility.pointNumber(this.nextExpTmp));
            this.timeLoad -= EventTetAccumulateGUI.TIME_DELTA;
            if (this.timeLoad <= 0) {
                this.curExpTmp = 0;
                if (this.result)
                    this.nextExpTmp = this.result.nextLevelExp;

                this.bar.setPercent(0);
                this.curLoad += 1;
                this.timeLoad = EventTetAccumulateGUI.TIME_PROGRESS / this.perLoad.length;

                this.onFinishLoad();
            }
        }
    },

    showFox: function () {
        cc.log("SHOW FOX NE ");
        //  if (!this.isShow) {
        if (!this.progress.isMoving)
            this.progress.runAction(cc.sequence(new cc.EaseBackOut(cc.moveTo(EventTetAccumulateGUI.TIME_MOVE, this.progress.defaultPos))));
        // }
        this.labelClick.setVisible(true);
        if (this.fox)
            this.fox.removeFromParent();
        this.fox = db.DBCCFactory.getInstance().buildArmatureNode("cao_tet_2018");
        this.fox.getAnimation().gotoAndPlay("run", -1, -1, 0);
        this.progress.addChild(this.fox);
        this.fox.setPosition(300, 95);
        this.fox.setScale(-1, 1);
        this.fox.runAction(cc.sequence(cc.moveBy(1.8, -250, 0), cc.callFunc(this.finishFoxRun.bind(this))));
        this.haveFox = true;
        this.panelButton.stopAllActions();
        this.panelButton.setPosition(this.fox.getPositionX() - 50, this.fox.getPositionY() - 20);
        this.panelButton.runAction(cc.moveBy(1.8, -250, 0));
        this.countSound = 0;
        this.countSoundFox();
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            this.arrayLabel[i].setString(eventTet.arrayNumText[i]);
        }
        this.exp.setString(StringUtility.pointNumber(eventTet.curLevelExp) + "/" + StringUtility.pointNumber(eventTet.nextLevelExp));
        var perExp = eventTet.getExpPercent();
        perExp = (perExp < 5) ? 5 : perExp;
        this.bar.setPercent(perExp);
    },

    countSoundFox: function() {
        if (this.countSound > 8)
            return;
        EventTetSound.playStep();
        this.runAction(cc.sequence(cc.delayTime(0.25), cc.callFunc(this.countSoundFox.bind(this))));
        this.countSound++;
    },

    finishFoxRun: function() {
        this.fox.getAnimation().gotoAndPlay("idle", -1, -1, 0);
        this.runAction(cc.sequence(cc.delayTime(5.0), cc.callFunc(this.onCloseGUI.bind(this))));
        EventTetSound.playFoxSay(Math.random() > 0.5 ? 1 : 2);
    },

    onEffectGetFox: function() {
        var foxPosition = this.fox.getPosition();
        foxPosition.x = foxPosition.x + 10;
        foxPosition.y = foxPosition.y + 50;
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            this.arrayEffect[i].setPosition(foxPosition);
            this.arrayEffect[i].setVisible(true);
            var point = cc.p(0, foxPosition.y + 50 + Math.random() * 40);
            point.x = Math.random() * 50 * (Math.random() > 0.5 ? 1 : -1) + foxPosition.x;
            var actMove = cc.bezierTo(0.5, [foxPosition, point, this.arrayIcon[i].getPosition()]);
            //sprite.runAction(cc.EaseSineOut(actMove));
            this.arrayEffect[i].runAction(cc.sequence(cc.delayTime(0.05 * i), actMove));
            this.arrayEffect[i].setScale(0.2);
            this.arrayEffect[i].setOpacity(255);
            this.arrayEffect[i].runAction(cc.sequence(cc.delayTime(0.05 * i), cc.scaleTo(0.5, 1), cc.fadeOut(0.6)));
            this.showEffect(i);
        }
        EventTetSound.playBaoLixi();
    },

    setPositionInGame: function() {
        this.progress.setPositionY(CheckLogic.getPositionEvent());
    },

    onButtonRelease : function(button, id) {
        if (this.haveFox) {
            // this.fox.cleanup();
            this.fox.stopAllActions();
            this.fox.getAnimation().gotoAndPlay("jump", -1, -1, 1);
            this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.onEffectGetFox.bind(this))));
            this.haveFox = false;
            this.panelButton.stopAllActions();
            eventTet.sendGetFreeCombo();
            EventTetSound.playClickFox();
        }
    }
});
EventTetAccumulateGUI.className = "EventTetAccumulateGUI";
EventTetAccumulateGUI.NUM_ITEM = 4;
EventTetAccumulateGUI.TIME_PROGRESS = 1;
EventTetAccumulateGUI.TIME_MOVE = 0.5;
EventTetAccumulateGUI.TIME_DELTA = 0.05;

var EventTetRegisterInformationGUI = BaseLayer.extend({

    ctor: function () {
        this.giftIds = [];

        this.txName = null;
        this.txAddress = null;
        this.txCmnd = null;
        this.txSdt = null;
        this.txEmail = null;

        this.btnRegister = null;

        this._super(EventTetRegisterInformationGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetRegisterInformationGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.btnClose = this.customButton("close", EventTetRegisterInformationGUI.BTN_CLOSE, this._bg);
        this.btnRegister = this.customButton("complete", EventTetRegisterInformationGUI.BTN_OK, this._bg);
        this.btnSendCMND = this.customButton("btnSendCMND", EventTetRegisterInformationGUI.BTN_SEND_CMND, this._bg);

        this.btnRegister.enable = false;

        this.giftName = this.getControl("gift", this._bg);
        this.noteRegister = this.getControl("noteRegister", this._bg);

        // init editbox
        this.txName = this.createExitBox(this.getControl("bgName", this._bg), LocalizedString.to("EVENT_TET_NAME"), EventTetRegisterInformationGUI.TF_NAME);
        this.txName.setMaxLength(30);
        this._bg.addChild(this.txName);

        this.txAddress = this.createExitBox(this.getControl("bgAdd", this._bg), LocalizedString.to("EVENT_TET_ADDRESS"), EventTetRegisterInformationGUI.TF_ADDRESS);
        this.txAddress.setMaxLength(100);
        this._bg.addChild(this.txAddress);

        this.txCmnd = this.createExitBox(this.getControl("bgCmnd", this._bg), LocalizedString.to("EVENT_TET_CMND"), EventTetRegisterInformationGUI.TF_CMND);
        this.txCmnd.setMaxLength(50);
        this._bg.addChild(this.txCmnd);

        this.txSdt = this.createExitBox(this.getControl("bgSdt", this._bg), LocalizedString.to("EVENT_TET_PHONE"), EventTetRegisterInformationGUI.TF_PHONE);
        this.txSdt.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this.txSdt.setMaxLength(50);
        this._bg.addChild(this.txSdt);

        this.txEmail = this.createExitBox(this.getControl("bgEmail", this._bg), LocalizedString.to("EVENT_TET_EMAIL"), EventTetRegisterInformationGUI.TF_EMAIL);
        this.txEmail.setMaxLength(100);
        this._bg.addChild(this.txEmail);

        this.enableFog();

    },

    createExitBox: function (bg, name, tag) {
        var edb = new cc.EditBox(bg.getContentSize(), new cc.Scale9Sprite());
        edb.setFont("fonts/tahoma.ttf", 17);
        edb.setPlaceHolder(name);
        edb.setPlaceholderFontName("fonts/tahoma.ttf");
        edb.setPlaceholderFontSize(17);
        edb.setPlaceholderFontColor(cc.color(220, 220, 220));
        edb.setPosition(bg.getPosition());
        edb.setDelegate(this);
        edb.setAnchorPoint(cc.p(0.5, 0.5));
        edb.setDelegate(this);
        edb.setTag(tag);
        edb.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
        return edb;
    },

    checkTextInput: function (str, minLen, alert) {
        var ok = true;
        var maxLen = 150;
        if (str === undefined || str == null) {
            ok = false;
        }
        else {
            if (str.length < minLen || str.length > maxLen) {
                ok = false;
            }
        }

        if (!ok) {
            Toast.makeToast(Toast.SHORT, alert);
        }

        ok = true;
        return ok;
    },

    validateEmail: function (email, alert) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var ok = re.test(email);
        if (!ok) {
            Toast.makeToast(Toast.SHORT, alert);
        }
        return ok;
    },

    autoCheckRegisterEnable: function () {
        var name = this.txName.getString().trim();
        var address = this.txAddress.getString().trim();
        var cmnd = this.txCmnd.getString().trim();
        var sdt = this.txSdt.getString().trim();
        var email = this.txEmail.getString().trim();

        if (name.length < 3 || address.length < 3 || cmnd.length < 9 || sdt.length < 9 || email.length < 3) {
            this.enableRegisterButton(false);
            return false;
        }
        this.enableRegisterButton(true);
        return true;
    },

    enableRegisterButton: function (enable) {
        if (enable) {
            this.btnRegister.setPressedActionEnabled(true);
            this.btnRegister.setColor(cc.color(255, 255, 255, 255));
        }
        else {
            this.btnRegister.setPressedActionEnabled(false);
            this.btnRegister.setColor(cc.color(92, 92, 92, 255));
        }
        this.btnRegister.enable = enable;
    },

    editBoxReturn: function (editBox) {
        var tag = parseInt(editBox.getTag());
        if (isNaN(tag)) return;

        var str = editBox.getString().trim();
        switch (tag) {
            case EventTetRegisterInformationGUI.TF_NAME:
            {
                this.checkTextInput(str, 3, LocalizedString.to("EVENT_TET_INPUT_NAME"));
                break;
            }
            case EventTetRegisterInformationGUI.TF_ADDRESS:
            {
                this.checkTextInput(str, 3, LocalizedString.to("EVENT_TET_INPUT_ADDRESS"));
                break;
            }
            case EventTetRegisterInformationGUI.TF_PHONE:
            {
                this.checkTextInput(str, 9, LocalizedString.to("EVENT_TET_INPUT_PHONE"));
                break;
            }
            case EventTetRegisterInformationGUI.TF_CMND:
            {
                this.checkTextInput(str, 9, LocalizedString.to("EVENT_TET_INPUT_CMND"));
                break;
            }
            case EventTetRegisterInformationGUI.TF_EMAIL:
            {
                this.validateEmail(str, LocalizedString.to("EVENT_TET_INPUT_EMAIL"));
                break;
            }
        }

        this.autoCheckRegisterEnable();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        // this.btnSendCMND.setVisible(eventTet.isRegisterSuccess && eventTet.getTotalPriceGift() > 500000);
        if (!eventTet.isRegisterSuccess) {
            this.txName.setString("");
            this.txAddress.setString("");
            this.txCmnd.setString("");
            this.txSdt.setString("");
            this.txEmail.setString("");

            this.enableRegisterButton(false);
        }
    },

    updateInfoRegister: function () {
        var data = eventTet.registerData;
        this.txName.setString(data.fullName);
        this.txAddress.setString(data.address);
        this.txCmnd.setString(data.identity);
        this.txSdt.setString(data.phone);
        this.txEmail.setString(data.email);

        var str = "";
        var gIds = data.registeredGiftIds;
        gIds.sort(function (a, b) {
            return b - a;
        });
        var length = (gIds.length <= 2) ? gIds.length : 2;
        for (var i = 0; i < length; i++) {
            str += eventTet.getItemName(gIds[i]);
            if (i < length - 1) {
                str += ", ";
            }
        }
        if (gIds.length > 2) str += ", ...";
        this.giftName.setString(str);
       // this.btnSendCMND.setVisible(eventTet.isRegisterSuccess && eventTet.getTotalPriceGift() > 500000);
    },

    updateInfor: function (gIds, auto) {
        var str = "";
        for (var i = 0; i < gIds.length; i++) {
            str += eventTet.getItemName(gIds[i]);
            if (i < gIds.length - 1) {
                str += ",";
            }
        }
        this.giftName.setString(str);
        this.giftIds = gIds;
        this.isAuto = auto;
    },

    onRegisterSuccess: function () {
        cc.log("ON REGISTER SUCCESS ");
        this.onClose();
    },

    onCloseDone: function () {
        this._super();
        eventTet.isWaitResponse = false;
    },

    onCompleteRegister: function () {
        if (eventTet.isWaitResponse)
            return;
        this.autoCheckRegisterEnable();

        var name = this.txName.getString().trim();
        var address = this.txAddress.getString().trim();
        var cmnd = this.txCmnd.getString().trim();
        var sdt = this.txSdt.getString().trim();
        var email = this.txEmail.getString().trim();

        if (!this.checkTextInput(name, 3, LocalizedString.to("EVENT_TET_INPUT_NAME"))) {
            return;
        }
        else if (!this.checkTextInput(address, 3, LocalizedString.to("EVENT_TET_INPUT_ADDRESS"))) {
            return;
        }
        else if (!this.checkTextInput(cmnd, 9, LocalizedString.to("EVENT_TET_INPUT_CMND"))) {
            return;
        }
        else if (!this.checkTextInput(sdt, 9, LocalizedString.to("EVENT_TET_INPUT_PHONE"))) {
            return;
        }
        else if (!this.validateEmail(email, LocalizedString.to("EVENT_TET_INPUT_EMAIL"))) {
            return;
        }
        else {
            var cmd = new CmdSendEventTetChangeAward();
            cmd.putData(false, this.giftIds[0], name, address, cmnd, sdt, email);
            GameClient.getInstance().sendPacket(cmd);
            eventTet.isWaitResponse = true;
        }
    },

    onButtonRelease: function (btn, id) {
        cc.log("BUTTON ID " + id);
        if (id == EventTetRegisterInformationGUI.BTN_SEND_CMND) {
            try {
                if (!cc.sys.isNative) {
                    NativeBridge.openURLNative("https://www.facebook.com/messages/t/401519949863382")
                }
                else if (cc.sys.os === cc.sys.OS_IOS) {
                    cc.Application.getInstance().openURL("fb-messenger://user-thread/401519949863382");
                }
                else if (cc.sys.os === cc.sys.OS_ANDROID) {
                    if(!cc.Application.getInstance().openURL("fb://messaging/401519949863382")) {
                        cc.Application.getInstance().openURL("https://www.facebook.com/messages/t/401519949863382");
                    }
                }
            }
            catch (e) {

            }
            return;
        }
        if (id == EventTetRegisterInformationGUI.BTN_OK) {
            if (this.btnRegister.enable) {
                cc.log("COMPLETE REGISTER ");
                this.onCompleteRegister();
            }
        }
        else {
            this.onBack();
        }
    },

    onBack: function () {
        this.onClose();
    }
});
EventTetRegisterInformationGUI.className = "EventTetRegisterInformationGUI";
EventTetRegisterInformationGUI.BTN_CLOSE = 0;
EventTetRegisterInformationGUI.BTN_OK = 1;
EventTetRegisterInformationGUI.BTN_SEND_CMND = 5;
EventTetRegisterInformationGUI.TF_NAME = 1;
EventTetRegisterInformationGUI.TF_ADDRESS = 2;
EventTetRegisterInformationGUI.TF_PHONE = 3;
EventTetRegisterInformationGUI.TF_CMND = 4;
EventTetRegisterInformationGUI.TF_EMAIL = 5;

/**
 * Dialog Event
 */

var DialogEvent = BaseLayer.extend({

    ctor: function () {
        this._bg = null;
        this._btnOK = null;
        this._btnCancel = null;
        this._pCenter = null;
        this._pLeft = null;
        this._pRight = null;
        this._lb_message = null;

        this._target = null;
        this._callback = null;
        this._btnId = -1;

        this._super(DialogEvent.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetDialog.json");
    },

    customizeGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this._btnOK = this.customButton("btnOk", DialogEvent.BTN_OK, bg);
        this._btnCancel = this.customButton("btnCancel", DialogEvent.BTN_CANCEL, bg);
        this._btnClose = this.customButton("btnQuit", DialogEvent.BTN_QUIT, bg);

        this._lb_message = this.getControl("lb_message", bg);

        this._pLeft = this._btnOK.getPosition();
        this._pRight = this._btnCancel.getPosition();
        this._pCenter = ccui.Helper.seekWidgetByName(ccui.Helper.seekWidgetByName(this._layout, "bg"), "btnCenter").getPosition();

        this.okResource = EventTet.DEFAUT_UI + "btnOk.png";
        this.cancelResource = EventTet.DEFAUT_UI + "btnCancel.png";
        this.setFog(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
    },

    resetButton: function () {
        this._btnOK.setVisible(false);
        this._btnCancel.setVisible(false);

        this._btnOK.setPosition(this._pLeft);
        this._btnCancel.setPosition(this._pRight);

        this._target = null;
        this._callback = null;
        this._btnId = -1;
    },

    onButtonRelease: function (sender, id) {
        this._btnId = id;
        this.onClose();
    },

    onCloseDone: function () {
        BaseLayer.prototype.onCloseDone.call(this);

        if (this._callback != null)
            this._callback.call(this._target, this._btnId);
    },

    setOkCancel: function (message, target, selector, okImage, cancelImage) {
        this.setMessage(message);
        this._target = target;
        this._callback = selector;

        if (okImage)
            this._btnOK.loadTextures(okImage, okImage, "");
        else
            this._btnOK.loadTextures(this.okResource, this.okResource, "");

        if (cancelImage)
            this._btnCancel.loadTextures(cancelImage, cancelImage, "");
        else
            this._btnCancel.loadTextures(this.cancelResource, this.cancelResource, "");

        this._btnOK.setPosition(this._pLeft);
        this._btnCancel.setPosition(this._pRight);
        this._btnOK.setVisible(true);
        this._btnCancel.setVisible(true);

    },

    setOkWithAction: function (message, target, selector, okImage) {
        this.setMessage(message);
        this._target = target;
        this._callback = selector;

        if (okImage)
            this._btnOK.loadTextures(okImage, okImage, "");
        else
            this._btnOK.loadTextures(this.okResource, this.okResource, "");
        this._btnOK.setVisible(true);
        this._btnOK.setPosition(this._pCenter);

        this._btnCancel.setVisible(false);
        // this._btnClose.setVisible(false);
    },

    setOKNotify: function (message, okImage) {
        this.setMessage(message);

        if (okImage)
            this._btnOK.loadTextures(okImage, okImage, "");
        else
            this._btnOK.loadTextures(this.okResource, this.okResource, "");
        this._btnOK.setVisible(true);
        this._btnOK.setPosition(this._pCenter);

        this._btnCancel.setVisible(false);
    },

    setChangeGold: function (message, target, selector) {
        this.setMessage(message);
        this._target = target;
        this._callback = selector;

        this._btnOK.loadTextures("Dialog/btnGold.png", "Dialog/btnGold.png", "");
        this._btnOK.setVisible(true);
        this._btnOK.setPosition(this._pLeft);

        this._btnCancel.setVisible(true);
        this._btnCancel.setPosition(this._pRight);
    },

    setMessage: function (message) {
        this.resetButton();
        this.setLabelText(message, this._lb_message);
    }
});
DialogEvent.className = "DialogEvent";

/**
 * Dialog Confirm Event
 */

var EventTetAlertGUI = BaseLayer.extend({

    ctor: function () {
        this._bg = null;
        this._btnOK = null;
        this._btnCancel = null;
        this._btnSelect = null;
        this.labelPrice = null;

        this._target = null;
        this._callback = null;
        this._btnId = -1;

        this._super(EventTetAlertGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetAlertGUI.json");
    },

    customizeGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this._btnOK = this.customButton("btnOk", EventTetAlertGUI.BTN_OK, bg);
        this._btnCancel = this.customButton("btnCancel", EventTetAlertGUI.BTN_CANCEL, bg);
        this._btnClose = this.customButton("btnQuit", EventTetAlertGUI.BTN_QUIT, bg);
        this._btnSelect = this.customButton("btnSelect", EventTetAlertGUI.BTN_CHECK, bg);
        this._btnSelect.isSelect = true;
        // cc.sys.localStorage.setItem("notShowAlertEventTet", 1);
        this.labelPrice = this.getControl("labelPrice", bg);
        this.arrayImgText = [];
        this.arrayLabel = [];
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            this.arrayImgText.push(this.getControl("text" + i, bg));
            this.arrayLabel.push(this.getControl("label", this.arrayImgText[i]));
        }
        this.setFog(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (sender, id) {
        switch (id) {
            case EventTetAlertGUI.BTN_OK:
                cc.sys.localStorage.setItem("notShowAlertEventTet", (this._btnSelect.isSelect ? 1 : 0));
                eventTet.eventTetScene.vibrate(this.type);
                this.onClose();
                break;
            case EventTetAlertGUI.BTN_CANCEL:
                this.onClose();
                break;
            case EventTetAlertGUI.BTN_QUIT:
                this.onClose();
                break;
            case EventTetAlertGUI.BTN_CHECK:
                this._btnSelect.isSelect = !this._btnSelect.isSelect;
                if (this._btnSelect.isSelect) {
                    this._btnSelect.loadTextures(EventTet.DEFAUT_UI + "select.png", EventTet.DEFAUT_UI + "select.png");
                }
                else {
                    this._btnSelect.loadTextures(EventTet.DEFAUT_UI + "noSelect.png", EventTet.DEFAUT_UI + "noSelect.png");
                }
                break;
        }

    },

    setType: function(type) {
        var fix;
        this.type = type;
        var money;
        cc.log("TYNE " + type);
        fix = type;
        money = eventTet.getNumKeyToVibrate(type);

        var count = 0;
        var arrayText = [];
        for (var i = 0; i < eventTet.arrayNumText.length; i++) {
            if (eventTet.arrayNumText[i] < fix) {
                this.arrayImgText[i].setVisible(true);
                //this.arrayImgText[count].loadTexture(EventTet.DEFAUT_UI + "text" + i + ".png");
                //count++;
                arrayText.push(this.arrayImgText[i]);
                this.arrayLabel[i].setString((fix - eventTet.arrayNumText[i]) + "");
            }
            else {
                this.arrayImgText[i].setVisible(false);
            }
        }
        var padX = arrayText[0].getContentSize().width * 0.4;
        var width = padX * (arrayText.length - 1) + arrayText[0].getContentSize().width * arrayText.length;
        var startX = this._bg.getContentSize().width * 0.5 - width * 0.5;
        for (var i = 0; i < arrayText.length; i++) {
            arrayText[i].setPositionX(startX + padX * i + arrayText[i].getContentSize().width * (i + 0.5));
        }
        //var s = localized("EVENT_TET_BUY_TEXT");
        //     s = StringUtility.replaceAll(s, "@money", money);

        this.setLabelText(money, this.labelPrice);
    }

});
EventTetAlertGUI.className = "EventTetAlertGUI";
EventTetAlertGUI.BTN_OK = 0;
EventTetAlertGUI.BTN_CANCEL = 1;
EventTetAlertGUI.BTN_QUIT = 2;
EventTetAlertGUI.BTN_CHECK = 3;
EventTetAlertGUI.ZODER = 10000;
EventTetAlertGUI.TAG = 10000;

var EventTetAlertTextGUI = BaseLayer.extend({

    ctor: function () {
        this._bg = null;
        this._btnOK = null;
        this._btnCancel = null;
        this._btnSelect = null;
        this.labelPrice = null;

        this._target = null;
        this._callback = null;
        this._btnId = -1;

        this._super(EventTetAlertTextGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetAlertTextGUI.json");
    },

    customizeGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this._btnOK = this.customButton("btnOk", EventTetAlertTextGUI.BTN_OK, bg);
        this._btnCancel = this.customButton("btnCancel", EventTetAlertTextGUI.BTN_CANCEL, bg);
        this._btnClose = this.customButton("btnQuit", EventTetAlertTextGUI.BTN_QUIT, bg);
        this.arrayImgText = [];
        this.arrayLabel = [];
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            this.arrayImgText.push(this.getControl("text" + i, bg));
            this.arrayLabel.push(this.getControl("label", this.arrayImgText[i]));
        }
        this.setFog(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (sender, id) {
        switch (id) {
            case EventTetAlertTextGUI.BTN_OK:
                this.onCloseDone();
                gamedata.openShopTicket(EventTetScene.className);
                // var gui = sceneMgr.getMainLayer();
                // if (gui && gui instanceof ShopIapScene)
                //     gui.selectTab(ShopIapScene.TAB_SMS);

                break;
            case EventTetAlertTextGUI.BTN_CANCEL:
                if (CheckLogic.checkQuickPlay()) {
                    var pk = new CmdSendQuickPlay();
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();
                    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                }
                else {
                    if (Math.floor(gamedata.timeSupport) > 0) {
                        var pk = new CmdSendGetSupportBean();
                        GameClient.getInstance().sendPacket(pk);
                        gamedata.showSupportTime = true;
                        pk.clean();
                    }
                    else {
                        if (gamedata.checkEnablePayment()) {
                            var msg = LocalizedString.to("QUESTION_CHANGE_GOLD");
                            sceneMgr.showChangeGoldDialog(msg, this, function (buttonId) {
                                if (buttonId == Dialog.BTN_OK) {
                                    gamedata.openShop();
                                }
                            });
                        }
                        else {
                            sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                        }
                    }
                }
                this.onClose();
                break;
            case EventTetAlertTextGUI.BTN_QUIT:
                this.onClose();
                break;
        }

    },

    setInfo: function(type) {
        var fix = type;
        var arrayText = [];
        for (var i = 0; i < eventTet.arrayNumText.length; i++) {
            if (eventTet.arrayNumText[i] < fix) {
                this.arrayImgText[i].setVisible(true);
                arrayText.push(this.arrayImgText[i]);
                this.arrayLabel[i].setString((fix - eventTet.arrayNumText[i]) + "");
            }
            else {
                this.arrayImgText[i].setVisible(false);
            }
        }
        var padX = arrayText[0].getContentSize().width * 0.4;
        var width = padX * (arrayText.length - 1) + arrayText[0].getContentSize().width * arrayText.length;
        var startX = this._bg.getContentSize().width * 0.5 - width * 0.5;
        for (var i = 0; i < arrayText.length; i++) {
            arrayText[i].setPositionX(startX + padX * i + arrayText[i].getContentSize().width * (i + 0.5));
        }
    }

});
EventTetAlertTextGUI.className = "EventTetAlertTextGUI";
EventTetAlertTextGUI.BTN_OK = 0;
EventTetAlertTextGUI.BTN_CANCEL = 1;
EventTetAlertTextGUI.BTN_QUIT = 2;

var EventTetReceiveText = BaseLayer.extend({

    ctor: function () {
        this._super(EventTetReceiveText.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetReceiveText.json");
    },

    customizeGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;
        this._btnOK = this.customButton("btnOk", 0, bg);
        this._btnClose = this.customButton("btnQuit", 1, bg);
        this.labelMessage = this.getControl("labelMessage", bg);
        var bgNumber = this.getControl("bgNumber", bg);
        this.lbNum = this.getControl("lb", bgNumber);
        this.iconText = this.getControl("icon", bg);
        this.setFog(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (sender, id) {
        this.onClose();
    },

    setMessage: function (num, index) {
        cc.log("NUM " + num);
        // this.labelMessage.setString(localized("EVENT_TET_RECEIVE_TEXT") + " " + num);
        this.lbNum.setString(num);
        if (index >= 0)
            this.iconText.loadTexture(EventTet.DEFAUT_UI + "label" + index + ".png");
        else
            this.iconText.loadTexture(EventTet.DEFAUT_UI + "iconKeyCoinLarge.png");
    }
});
EventTetReceiveText.className = "EventTetReceiveText";

var EventTetReceiveOpenGiftGUI = BaseLayer.extend({

    ctor: function () {
        this.gift = null;
        this.lbNotice = null;
        this.lbName = null;
        this.info = null;
        this.btn = null;

        this.share = null;
        this.panel = null;
        this.title = null;
        this.circle = null;

        this.pEffect = null;

        this._super(EventTetReceiveOpenGiftGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetReceiveOpenGiftGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");

        this.panel = this.getControl("panel");

        this.pEffect = this.getControl("effect");

        this.lbNotice = this.getControl("lb", this.panel);
        this.lbName = this.getControl("gift", this.panel);
        this.gift = this.getControl("img", this.panel);
        this.gift.pos = this.gift.getPosition();
        this.btn = this.customButton("btn", 1, this.panel);
        this.title = this.getControl("title", this.panel);
        this.circle = this.getControl("circle", this.panel);
        this.particle = this.panel.getChildByName("particle");

        this.lbNotice.pos = this.lbNotice.getPosition();
        this.lbName.pos = this.lbName.getPosition();
        this.gift.pos = this.gift.getPosition();
        this.btn.pos = this.btn.getPosition();
        this.title.pos = this.title.getPosition();
        this.circle.pos = this.circle.getPosition();
        this.particle.pos = this.particle.getPosition();

        if (!this.effectCoinFall) {
            this.effectCoinFall = new CoinFallEffectEventTet();
            this.effectCoinFall.setPosition(0, 0);
            this.effectCoinFall.setPositionCoin(cc.p(this.width / 2, this.height / 2));
            this.effectCoinFall.setContentSize(this.width, this.height);
            this.effectCoinFall.setVisible(false);
            this.addChild(this.effectCoinFall);
        }
    },

    onEnterFinish: function () {
        this.bg.setOpacity(255);

        this.panel.setVisible(true);
        this.panel.setOpacity(255);

        this.pEffect.removeAllChildren();
        this.arrayFirework = [];
        this.btn.setVisible(true);
        this.scheduleUpdate();
        this.countTimeFireWork = 0;
    },

    doAnimate: function () {
        var time = 0;
        var tDrop = 0.3;

        this.btn.setVisible(true);

        this.circle.setVisible(true);
        this.particle.setVisible(true);

        this.title.setVisible(true);
        this.lbName.setVisible(true);
        this.lbNotice.setVisible(true);

        time += 0.15;
        this.title.setPositionY(this.title.pos.y + 500);
        this.title.runAction(new cc.EaseBackOut(cc.moveTo(tDrop, this.title.pos)));

        time += 0.1;
        this.lbNotice.setPositionY(this.lbNotice.pos.y + 500);
        this.lbNotice.runAction(cc.sequence(cc.delayTime(time), new cc.EaseBackOut(cc.moveTo(tDrop, this.lbNotice.pos))));

        time += 0.05;
        this.lbName.setPositionY(this.lbName.pos.y + 500);
        this.lbName.runAction(cc.sequence(cc.delayTime(time), new cc.EaseBackOut(cc.moveTo(tDrop, this.lbName.pos))));

        this.btn.setPositionY(this.btn.pos.y - 400);
        this.btn.runAction(cc.sequence(cc.delayTime(time), new cc.EaseBackOut(cc.moveTo(tDrop, this.btn.pos))));

        time += 0.15;
        this.gift.setPosition(this.gift.pos);
        this.gift.setScale(0);
        this.gift.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(EventTetSound.playGift), new cc.EaseBackOut(cc.scaleTo(0.5, 1))));

        this.circle.setScale(0);
        this.circle.runAction(cc.sequence(cc.spawn(cc.scaleTo(1.5, 1), cc.rotateTo(1.5, 360)), cc.repeatForever(cc.rotateBy(0.15, 5))));
        this.circle.runAction(cc.repeatForever(cc.rotateBy(0.15, 5)));
    },

    hideAnimate: function () {
        var tDrop = 0.3;

        this.btn.setVisible(true);

        this.circle.setVisible(true);
        this.particle.setVisible(true);

        this.title.setVisible(true);
        this.lbName.setVisible(true);
        this.lbNotice.setVisible(true);

        this.title.setPosition(this.title.pos);
        this.title.runAction(new cc.EaseBackIn(cc.moveTo(tDrop, cc.p(this.title.pos.x, this.title.pos.y + 500))));

        this.lbNotice.setPosition(this.lbNotice.pos);
        this.lbNotice.runAction(new cc.EaseBackIn(cc.moveTo(tDrop, cc.p(this.lbNotice.pos.x, this.lbNotice.pos.y + 500))));

        this.lbName.setPosition(this.lbName.pos);
        this.lbName.runAction(new cc.EaseBackIn(cc.moveTo(tDrop, cc.p(this.lbName.pos.x, this.lbName.pos.y + 500))));

        this.btn.setPosition(this.btn.pos);
        this.btn.runAction(new cc.EaseBackIn(cc.moveTo(tDrop, cc.p(this.btn.pos.x, this.btn.pos.y - 400))));
    },

    showGift: function (inf, auto) {
        cc.log("INFO GIFT " + JSON.stringify(inf));
        if (auto === undefined || auto == null) auto = false;
        this.isAutoGift = auto;

        this.info = inf;

        this.gift.setScale(1);
        this.gift.removeAllChildren();

        if (inf.type == EventTet.TYPE_OUT_GAME || inf.type == EventTet.TYPE_GOLD_DIAMOND) {
            this.lbName.setString(inf.gift + "x" + eventTet.getItemName(this.info.id));
            this.showFirework = true;
            for (var i = 0; i < this.arrayFirework.length; i++) {
                this.arrayFirework[i].setVisible(false);
            }
        }
        else if (inf.type == EventTet.TYPE_TOKEN) {
            this.lbName.setString(inf.gift + "x Hoa Mai");
            this.showFirework = false;
        }
        else {
            this.lbName.setString(eventTet.getItemName(this.info.id));
            this.showFirework = false;
        }

        var sp = cc.Sprite.create(eventTet.getGiftImage(this.info.id, this.info.type));
        sp.setScale(0.9);
        this.gift.addChild(sp);
        this.gift.setOpacity(255);
        var pSize = this.gift.getContentSize();
        sp.setPosition(pSize.width / 2, pSize.height / 2);

        this.doAnimate();
    },

    onGiftSuccess: function () {
        this.circle.setVisible(false);
        this.particle.setVisible(false);

        if (this.info.type == EventTet.TYPE_DIAMOND || this.info.type == EventTet.TYPE_GOLD_DIAMOND) {
            var eff = new ImageEffectLayer();
            this.pEffect.addChild(eff);
            eff.setPositionCoin(SceneMgr.convertPosToParent(this.pEffect, this.gift));
            eff.startEffect(100, ImageEffectLayer.TYPE_FLOW, "res/Event/EventTet/EventTetUI/iconDiamond.png");
            eff.setCallbackFinish(this.onBack.bind(this));
        }

        if (this.info.type == EventTet.TYPE_GOLD || this.info.type == EventTet.TYPE_GOLD_DIAMOND) {
            var numGold = (this.info.id % 1000) * 10;
            var timeDone = 1 + numGold / 100;
            this.effectCoinFall.startEffect(100, CoinFallEffectEventTet.TYPE_FLOW);
            this.gift.runAction(cc.fadeOut(timeDone));

            if (this.bg) {
                this.bg.setVisible(true);
                this.bg.runAction(cc.fadeOut(timeDone));
            }
            this.runAction(cc.sequence(cc.delayTime(4.0), cc.callFunc(this.onBack.bind(this))));
        }
        if (this.info.type == EventTet.TYPE_TOKEN) {
            this.gift.runAction(cc.sequence(cc.fadeOut(1.0), cc.callFunc(this.onBack.bind(this))));
        }
        // this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.onBack.bind(this))));
    },

    onButtonRelease: function (button, id) {
        if (id == 1) {
            if (eventTet.isWaitResponse)
                return;
            this.hideAnimate();
            for (var i = 0; i < this.arrayFirework.length; i++) {
                this.arrayFirework[i].setVisible(false);
            }

            if (this.info.type == EventTet.TYPE_OUT_GAME) {
                eventTet.isAutoGift = this.isAutoGift;
                if (eventTet.isRegisterSuccess) {
                    var cmd = new CmdSendEventTetChangeAward();
                    cmd.putData(false, this.info.id);
                    GameClient.getInstance().sendPacket(cmd);
                    eventTet.isWaitResponse = true;
                }
                else {
                    var gui = sceneMgr.openGUI(EventTetRegisterInformationGUI.className, EventTet.GUI_REGISTER, EventTet.GUI_REGISTER);
                    if(gui) gui.updateInfor([this.info.id], this.isAutoGift);
                }

                this.onBack();
            }
            else if (this.info.type == EventTet.TYPE_GOLD_DIAMOND) {
                var cmd = new CmdSendEventTetChangeAward();
                cmd.putData(false, this.info.id);
                GameClient.getInstance().sendPacket(cmd);
            }
            else {
                this.onGiftSuccess();
            }
        }
        else {
            this.onCapture();
        }
    },

    update: function (dt) {
        // UPDATE RUN FIREWORK
        if (this.showFirework) {
            this.countTimeFireWork = this.countTimeFireWork + dt;
            if (this.countTimeFireWork > 0.4) {
                this.countTimeFireWork = 0;
                var i;
                var firework;
                for (i = 0; i < this.arrayFirework.length; i++) {
                    if (!this.arrayFirework[i].isVisible()) {
                        firework = this.arrayFirework[i];
                        break;
                    }
                }
                if (i == this.arrayFirework.length) {
                    //  var fw = db.DBCCFactory.getInstance().buildArmatureNode("firework" + (i + 1));
                    firework = db.DBCCFactory.getInstance().buildArmatureNode("firework1");
                    this.addChild(firework);
                    firework.setScale(2.0);
                    this.arrayFirework.push(firework);
                }
                firework.setVisible(true);
                firework.getAnimation().gotoAndPlay("1", -1, -1, 1);
                firework.setPosition(Math.random() * 420 + 200, 320 + Math.random() * 80);
                //this.arrayFirework.setCompleteListener();
                firework.setCompleteListener(this.onFinishEffectFirework.bind(this, firework));
                var random = 0.5 + Math.random() * 0.5;
                firework.setScale(random);
                firework.setScale(1.8);
                firework.setOpacity(255 * random);
                //
                //var p;
                //switch(i) {
                //    case 0:
                //        p = cc.p(50, 50);
                //        break;
                //    case 1:
                //        p = cc.p(150, 110);
                //        break;
                //    case 2:
                //        p = cc.p(400, 90);
                //        break;
                //    default :
                //        p = cc.p(250, 80);
                //        break;
                //}
                //this.arrayFirework[i].setPosition(p);

            }
        }
    },

    onFinishEffectFirework: function (sender) {
        sender.setVisible(false);
    },

    onBack: function () {
        this.effectCoinFall.stopEffect();
        this.onClose();
        var gui = sceneMgr.getMainLayer();
        if (gui instanceof EventTetOpenLixiGUI){
            gui.onFinishEffectGift();
        }
    },

    onCloseDone: function () {
        this._super();
        eventTet.isWaitResponse = false;
    }
});
EventTetReceiveOpenGiftGUI.className = "EventTetReceiveOpenGiftGUI";

/**
 * GUI MO QUA KHI RUNG CAY
 */
var EventTetReceiveVibrateGiftGUI = BaseLayer.extend({

    ctor: function () {
        this.pos = [];

        this.title = null;
        this.btn = null;
        this.gift = null;

        this.goldPos = null;
        this.desPos = null;

        this.defaultItem = null;

        this.bg = null;
        this.spGifts = [];
        this.arGifts = [];

        this.list = null;
        this.uiGift = null;

        this.isScrollGui = false;

        this.isAutoGift = false;
        this.cmd = null;

        this._super(EventTetReceiveVibrateGiftGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetReceiveVibrateGiftGUI.json");
    },

    initGUI: function () {
        var winSize = cc.director.getWinSize();

        this.bg = this.getControl("bg");
        var top = this.getControl("pTop");
        var bot = this.getControl("pBot");

        this.title = this.getControl("congrat", top);
        this.title.pos = this.title.getPosition();

        this.btn = this.customButton("btnGet", 1, bot);
        this.btn.pos = this.btn.getPosition();
        this.lbAuto = this.getControl("lbAuto", this.btn);
        this.lbAuto.setVisible(false);

        // item in list <= 10
        this.gift = this.getControl("pCenter");
        this.defaultItem = this.getControl("defaultItem", this.gift).clone();
        this.defaultItem.size = this.defaultItem.getContentSize();
        //this.defaultItem.size.width *= 0.75;
        //this.defaultItem.size.height *= 0.8;
        this.defaultItem.padX = this.defaultItem.size.width * 0.8;
        this.defaultItem.padY = this.defaultItem.size.height * 0.3;

        // item in list > 10
        this.list = this.getControl("pList");
        //var iLeft = this.getControl("left",this.list);
        var pSize = this.list.getContentSize();
        //var listSize = cc.size(winSize.width - iLeft.getContentSize().width*2*this._scale);
        this.uiGift = new cc.TableView(this, pSize);
        this.uiGift.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.uiGift.setVerticalFillOrder(1);
        this.uiGift.setDelegate(this);
        this.list.addChild(this.uiGift);
        this.uiGift.reloadData();

        // update pos
        var pTop = this.calculateStartPos(5, 2, 0);
        var pBot = this.calculateStartPos(5, 2, 1);

        var topH = (winSize.height - pTop.y - this.defaultItem.size.height / 2) / 2;
        var pY = pTop.y + this.defaultItem.size.height / 2 + topH + top.getContentSize().height * this._scale / 2;
        if (pY > winSize.height) pY = winSize.height;
        top.setPositionY(pY);
        bot.setPositionY(pBot.y / 2 - this.defaultItem.size.height / 10 - bot.getContentSize().height * this._scale);

    },

    onEnterFinish: function () {
        this.gift.removeAllChildren();

        this.title.setVisible(false);
        this.btn.setVisible(false);

        this.title.setPosition(this.title.pos);
        this.btn.setPosition(this.btn.pos);
    },

    // open gui
    openGift: function (obj, desPos, goldPos) {
        this.isAutoGift = false;
        this.isScrollGui = false;

        this.goldPos = this.gift.convertToNodeSpace(goldPos);
        this.desPos = this.gift.convertToNodeSpace(desPos);
        cc.log("ARRAY GIFT " + JSON.stringify(obj));
        var gifts = [];
        for (var key in obj) {
            var ooo = {};
            ooo.isStored = eventTet.isItemStored(key);
            ooo.id = key;
            ooo.value = obj[key];
            gifts.push(ooo);
            //gifts.push(ooo);
        }


        gifts.sort(function (a, b) {
            return (parseInt(b.id) - parseInt(a.id));
        });

        this.arGifts = gifts;

        var nGift = gifts.length;

        this.gift.removeAllChildren();
        this.list.setVisible(false);

        if(nGift > 12) {
            this.showGiftScroll();
            return;
        }

        var nCol = [];
        var nRow = 1;

        if (nGift > 5) {
            nRow = 2;
            var x1 = parseInt(nGift / 2);
            var x2 = nGift - x1;
            nCol[0] = x1;
            nCol[1] = x2;
        }
        else {
            nRow = 1;
            nCol[0] = nGift;
        }

        var timeDelay = 0.5;
        var timeShow = 1;
        var count = 0;
        this.spGifts = [];
        for (var j = 0; j < nRow ; j++) {
            var pStart = this.calculateStartPos(nCol[j], nRow, j);
            for (var i = 0; i < nCol[j]; i++) {
                var inf = gifts[count++];

                var p = new EventTetResultGift();
                p.setGift(inf);
                p.setPosition(pStart.x + i * (this.defaultItem.size.width + this.defaultItem.padX), pStart.y);
                p.setScale(0);
                p.runAction(cc.sequence(cc.delayTime(timeDelay), new cc.EaseBackOut(cc.scaleTo(timeShow, 1))));
                this.gift.addChild(p);
                this.spGifts.push(p);
            }
        }

        this.runAction(cc.sequence(cc.delayTime(timeDelay),cc.callFunc(EventTetSound.playFinishBreak)));

        this.bg.setOpacity(0);
        this.bg.setVisible(true);
        this.bg.runAction(cc.sequence(cc.fadeTo(timeShow + timeDelay, 220), cc.callFunc(this.onFinishEffect.bind(this))));
    },

    getGiftScrollIndex : function (idx) {
        var ar = [];
        ar.push(this.arGifts[idx]);

        var maxCol = 0;
        var size = this.arGifts.length;
        if(size % 2 == 0) maxCol = size/2;
        else maxCol = parseInt(size/2) + 1;
        var cIdx = idx + maxCol;
        if(cIdx < size)
            ar.push(this.arGifts[idx+maxCol]);

        return ar;
    },

    showGiftScroll : function () {
        this.isScrollGui = true;
        this.list.setVisible(true);
        this.uiGift.reloadData();

        this.runAction(cc.sequence(cc.delayTime(0.15),cc.callFunc(EventTetSound.playFinishBreak)));

        this.bg.setOpacity(0);
        this.bg.setVisible(true);
        this.bg.runAction(cc.sequence(cc.fadeTo(0.25, 220), cc.callFunc(this.onFinishEffect.bind(this))));
    },

    getGiftInScroll : function () {
        var size = this.arGifts.length;
        if(size %2 == 0) size = size/2;
        else size = parseInt(size/2) + 1;

        var totalTime = 0;
        var timeHide = 0.1;
        var delayTime = 0.25;
        var lastTime = 0;
        var totalEffectTime = 0;

        for(var i = 0; i < size ; i++) {
            var cell = this.uiGift.cellAtIndex(i);
            if(cell) {
                var ar = cell.getDropInfo();
                for(var j = 0; j < ar.length ; j++) {
                    var ggg = ar[j];
                    if(ggg && ggg.isItem) {
                        var time = 0;
                        var actDrop = null;
                        var actHide = null;
                        var startPos = this.gift.convertToNodeSpace(ggg.pos);
                        startPos.x += 128/4;
                        startPos.y += 330/4;
                        if (ggg.isStored) { // pie image
                            time = this.dropPiece(ggg.id, ggg.value, startPos, this.desPos, true);
                            actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id, ggg.value, startPos, this.desPos, false));
                        }
                        else {  // drop gold
                            var num = eventTet.getItemValue(ggg.id) * ggg.value;
                            time = this.dropGold(num, startPos, this.goldPos, true);
                            actDrop = cc.callFunc(this.dropGold.bind(this, num, startPos, this.goldPos, false));
                        }

                        if (time > lastTime) lastTime = time;

                        actHide = cc.spawn(cc.scaleTo(timeHide, 0), cc.fadeOut(timeHide));
                        totalEffectTime += lastTime;
                        cell.runAction(cc.sequence(cc.delayTime(delayTime * (i + 1)), actHide, actDrop));
                    }
                }
            }
        }

        totalTime = lastTime + delayTime * size + timeHide;
        this.runAction(cc.sequence(cc.delayTime(totalTime), cc.callFunc(this.onCloseGUI.bind(this))));
    },

    getGift: function () {
        this.title.setVisible(true);
        this.title.setPosition(this.title.pos);
        this.title.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.title.pos.x, this.title.pos.y + 400))));

        this.btn.setVisible(true);
        this.btn.setPosition(this.btn.pos);
        this.btn.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.btn.pos.x, this.btn.pos.y - 400))));

        this.bg.setOpacity(220);
        this.bg.setVisible(true);
        this.bg.runAction(cc.fadeOut(2));

        if(this.isScrollGui) {
            this.getGiftInScroll();
            return;
        }

        var totalTime = 0;
        var timeHide = 0.1;
        var delayTime = 0.25;
        var lastTime = 0;
        var totalEffectTime = 0;
        var size = 0;
        for (var i = 0, size = this.arGifts.length; i < size; i++) {
            var ggg = this.arGifts[i];
            var spGift = this.spGifts[i];
            var time = 0;
            var actDrop = null;
            var actHide = null;
            if (ggg.isStored) { // pie image
                time = this.dropPiece(ggg.id, ggg.value, spGift.getPosition(), this.desPos, true);
                actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id, ggg.value, spGift.getPosition(), this.desPos, false));
            }
            else {  // drop gold
                var num = eventTet.getItemValue(ggg.id) * ggg.value;
                time = this.dropGold(num, spGift.getPosition(), this.goldPos, true);
                actDrop = cc.callFunc(this.dropGold.bind(this, num, spGift.getPosition(), this.goldPos, false));
            }

            if (time > lastTime) lastTime = time;

            actHide = cc.spawn(cc.scaleTo(timeHide, 0), cc.fadeOut(timeHide));
            totalEffectTime += lastTime;
            spGift.runAction(cc.sequence(cc.delayTime(delayTime * (i + 1)), actHide, actDrop));
        }
        totalTime = lastTime + delayTime * size + timeHide;
        this.runAction(cc.sequence(cc.delayTime(totalTime), cc.callFunc(this.onCloseGUI.bind(this))));
    },

    // effect
    dropPiece: function (id, value, pStart, pEnd, checkTime) {
        var timeMove = 0.5;
        var timeHide = 0.25;
        var dTime = 0.1;
        if (checkTime) {
            return timeMove + dTime * value + timeHide;
        }

        var winSize = cc.director.getWinSize();
        for (var i = 0; i < value; i++) {
            var sp = cc.Sprite.create(eventTet.getPieceImage(id));
            sp.setScale(0.6);
            var rnd = parseInt(Math.random() * 10) % 2 == 0;
            var pCX = Math.random() * winSize.width;
            var pCY = Math.random() * winSize.height;
            var posCenter = cc.p(pCX, pCY);
            var actMove = cc.bezierTo(timeMove, [pStart, posCenter, pEnd]);
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            sp.runAction(cc.sequence(cc.delayTime(dTime * i), cc.spawn(actMove,cc.callFunc(EventTetSound.playPiece)), actHide));
            sp.setPosition(pStart);
            this.gift.addChild(sp);
        }

        return 0;
    },

    dropGold: function (gold, pStart, pEnd, checkTime) {
        var num = Math.floor(gold / 100000);
        if (num < 1) num = 1;
        var goldReturn = Math.floor(gold / num);

        var timeMove = 1.5;
        var dTime = 0.5;
        var timeHide = 0.25;
        var timeShow = 0.15;

        if (checkTime) {
            return timeMove + timeHide + dTime + timeShow;
        }

        var winSize = cc.director.getWinSize();
        var rangeX = [-50, 50];
        var rangeY = [-50, 50];

        num = (num < 10) ? num : (10 + parseInt(num/5));
        cc.log("NUM NE ******** " + num);
        if (num > 50)
            num = 50;

        for (var i = 0; i < num; i++) {
            //var sp = cc.Sprite.create("Event/EventTetUI/icon_gold.png");
            var sp = new EventTetCoinEffect();
            sp.start();

            // random pos start
            var rndX = Math.random() * (rangeX[1] - rangeX[0]) + rangeX[0];
            var rndY = Math.random() * (rangeY[1] - rangeY[0]) + rangeY[0];

            var rndRotate = -(Math.random() * 360);

            var pCX = Math.random() * winSize.width;
            var pCY = Math.random() * winSize.height;

            var posStart = cc.p(pStart.x + rndX, pStart.y + rndY);
            var posCenter = cc.p(pCX, pCY);

            var actShow = new cc.EaseBackOut(cc.scaleTo(timeShow, 0.4));
            var actMove = new cc.EaseSineOut(cc.bezierTo(timeMove, [posStart, posCenter, pEnd]));
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            sp.setPosition(posStart);
            sp.setRotation(rndRotate);
            this.gift.addChild(sp);
            sp.setScale(0);

            sp.runAction(cc.sequence(
                cc.delayTime(Math.random() * dTime), actShow,
                cc.spawn(actMove,cc.sequence(cc.delayTime(1.5 * Math.random()),
                    cc.callFunc(function () {
                        if (Math.random() < 0.1) EventTetSound.playSingleCoin()
                    }))),
                cc.callFunc(function () {
                    if (eventTet.eventTetScene) {
                        eventTet.eventTetScene.onEffectGetMoneyItem(goldReturn);
                    }
                }.bind(this, goldReturn)), actHide));
        }
        return 0;
    },

    finishCardMoving: function () {
        var card = new EventTetImage(-1, this.scaleCard != 1);
        card.setPosition(this.getPosition());
        this.getParent().addChild(card);
        card.zoomEffect(this.scaleCard != 1);
    },

    onFinishEffect: function () {
        if (eventTet.isAuto) {
            this.lbAuto.setVisible(true);
            this.runAction(cc.repeat(cc.sequence(cc.delayTime(1), cc.callFunc(this.callbackAuto.bind(this))), 3));
            this.countAuto = 4;
            this.callbackAuto();
        }
        else {
            this.lbAuto.setVisible(false);
        }
        this.title.setVisible(true);
        this.title.setPositionY(this.title.pos.y + 400);
        this.title.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.title.pos)));

        this.btn.setVisible(true);
        this.btn.setPositionY(this.btn.pos.y - 400);
        this.btn.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.btn.pos)));
    },

    callbackAuto: function () {
        this.countAuto--;
        if (this.countAuto == 0) {
            this.onBack();
            return;
        }
        var s = localized("EVENT_TET_AUTO");
        s = StringUtility.replaceAll(s, "@second", this.countAuto);
        this.lbAuto.setString(s);

    },

    effectMoney: function (sender, value) {
        if (value === undefined || value == null) return;

        if (eventTet.eventTetScene) {
            eventTet.eventTetScene.onEffectGetMoneyItem(value);
        }
    },

    // ui function
    onButtonRelease: function (btn, id) {
        if (id == 1) {
            this.stopAllActions();
            this.onBack();
        }
        else {
            if(this.isScrollGui) return;
            this.onCapture();
        }
    },

    onBack: function () {
        if (this.isAutoGift) {
            var gIds = [];
            for (var i = 0; i < this.cmd.gifts.length; i++) {
                if (eventTet.isItemOutGame(this.cmd.gifts[i].id)) {
                    gIds.push(this.cmd.gifts[i].id);
                }
            }
            if (gIds.length > 0) {
                if (eventTet.isRegisterSuccess) {
                    var cmd = new CmdSendEventTetChangeAward();
                    cmd.putData(false, gIds);
                    GameClient.getInstance().sendPacket(cmd);
                }
                else {
                    eventTet.showRegisterInformation(gIds);
                }
            }
            this.onClose();
        }
        else {
            this.getGift();
            //this.onCloseGUI();
        }
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(130, 330);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new EventTetGiftCell(this);
        }
        cell.setVisible(true);
        cell.setScale(1);
        cell.setInfo(this.getGiftScrollIndex(idx));
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        var size = this.arGifts.length;
        if(size %2 == 0) return size/2;

        return parseInt(size/2) + 1;
    },

    onCloseGUI: function () {
        eventTet.eventTetScene.onFinishEffectShowResult();
        this.onClose();
    },

    calculateStartPos: function (nCol, nRow, row) {
        var iW = (this.defaultItem.size.width + this.defaultItem.padX);
        var iH = (this.defaultItem.size.height + this.defaultItem.padY);
        var nWidth = nCol * iW;
        var nHeight = nRow * iH;

        var pSize = this.gift.getContentSize();

        var pos = {};
        pos.x = pSize.width / 2 - nWidth / 2 + iW / 2;
        pos.y = pSize.height / 1.9 + nHeight / 2 - iH * row - iH / 2;
        return pos;
    }
});
EventTetReceiveVibrateGiftGUI.className = "EventTetReceiveVibrateGiftGUI";

var EventTetHelpGUI = BaseLayer.extend({

    ctor: function () {

        this._currentPage = null;
        this._pageHelp = null;

        this._arrPage = null;
        this._pageInfo = null;

        this.curPage = -1;

        this._super(EventTetHelpGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetHelpGUI.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        var btnClose = this.customButton("btnClose", EventTetHelpGUI.BTN_CLOSE, bg);
        this.btnNext = this.customButton("btnNext", EventTetHelpGUI.BTN_NEXT, bg);

        this._pageHelp = this.getControl("pageHelp", bg);

        this._arrPage = [];
        for (var i = 0; i < EventTetHelpGUI.NUM_PAGE_HELP; i++) {
            this._arrPage[i] = this.customButton("btnPage" + i, i, bg);
            this._arrPage[i].setPressedActionEnabled(false);
        }
        for (var i = 0; i < 4; i++) // so luong button help
            this.customButton("btn" + i, 100 + i, this._layout);
        this._currentPage = this.getControl("imgCurPage", bg);
        this._pageHelp.addEventListener(this.onPageListener.bind(this), this);
        this._pageHelp.setCustomScrollThreshold(0.5);
        this.labelHelp = this.getControl("labelHelp", bg);
        this.labelHelp.setString(localized("EVENT_TET_HELP_0"));
        this.enableFog(true);
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);

        this.onPageListener();
    },

    onPageListener: function () {
        if (this.curPage == -1) {
            this.curPage = this._pageHelp.getCurPageIndex();
            this._currentPage.setPosition(this._arrPage[this.curPage].getPosition());
        }
        else {
            this._currentPage.setPosition(this._arrPage[this.curPage].getPosition());

            this.curPage = this._pageHelp.getCurPageIndex();
            var newPos = this._arrPage[this._pageHelp.getCurPageIndex()].getPosition();
            this._currentPage.runAction(cc.moveTo(0.1, newPos));
            // this.labelHelp.setString(localized("EVENT_TET_HELP_" + this.curPage));
        }
        if (this._pageHelp.getCurPageIndex() == EventTetHelpGUI.NUM_PAGE_HELP - 1) {
            this.btnNext.setVisible(false);
        }
        else {
            this.btnNext.setVisible(true);
        }
    },

    onButtonRelease: function (button, id) {
        if (id >= 0 && id < EventTetHelpGUI.NUM_PAGE_HELP) {
            this._pageHelp.scrollToPage(id);
            return;
        }
        switch (id) {
            case EventTetHelpGUI.BTN_CLOSE:
                this.onBack();
                break;
            case EventTetHelpGUI.BTN_NEXT:
                this._pageHelp.scrollToPage(this._pageHelp.getCurPageIndex() + 1);
                break;
        }
    },

    selectTab: function(selectTab) {
        this._pageHelp.scrollToPage(selectTab);
    },

    onBack: function () {
        this.onClose();
    }
});
EventTetHelpGUI.className = "EventTetHelpGUI";
EventTetHelpGUI.NUM_PAGE_HELP = 6;
EventTetHelpGUI.BTN_CLOSE = 6;
EventTetHelpGUI.BTN_NEXT = 7;

var EventTetNotifyGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(EventTetNotifyGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetNotifyGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");
        this.iconTag = this.getControl("tag", this._bg);
        this.customButton("close", EventTetNotifyGUI.BTN_CLOSE, this._bg);
        this.customButton("join", EventTetNotifyGUI.BTN_JOIN, this._bg);

        var pTime = this.getControl("time");
        //
        //var txts = [];
        //txts.push({"text": LocalizedString.to("EGG_INFO_TIME_FROM"), "color": cc.color(188, 2, 36, 0)});
        //txts.push({"text": "", "font": SceneMgr.FONT_BOLD, "color": cc.color(48, 92, 4, 0)});
        //txts.push({"text": LocalizedString.to("EGG_INFO_TIME_TO"), "color": cc.color(188, 2, 36, 0)});
        //txts.push({"text": "", "font": SceneMgr.FONT_BOLD, "color": cc.color(48, 92, 4, 0)});
        //this.lbTime = new RichLabelText();
        //this.lbTime.setText(txts);
        //this.lbTime.pos = pTime.getPosition();

        this.lbTime = this.getControl("labelTime", this._bg);
        this.lbTime.setVisible(false);
        //this.lbTime.setPositionY(this.lbTime.pos.y - this.lbTime.getHeight() / 2);
        //this._bg.addChild(this.lbTime);
        // var nodeAnimation = this.getControl("nodeAnimation", this._bg);
        //
        // var eff = db.DBCCFactory.getInstance().buildArmatureNode("PopUp");
        // if (eff) {
        //     nodeAnimation.addChild(eff);
        //     //eff.setPosition(300, 300);
        //     eff.getAnimation().gotoAndPlay("1", -1, -1, 0);
        //     //control.anim = eff;
        // }
        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        eventTet.saveCurrentDay();
        this.lbTime.setString(eventTet.eventDayFrom + "-" + eventTet.eventDayTo);
        if (eventTet.eventTime == EventTet.WEEK_4) {
            var game = LocalizedString.config("GAME");
            if (game.indexOf("sam") >= 0) {
                this._bg.loadTexture(EventTet.DEFAUT_UI + "PopUp/bgWeek" + eventTet.eventTime + "Sam.png");
            }
            else {
                this._bg.loadTexture(EventTet.DEFAUT_UI + "PopUp/bgWeek" + eventTet.eventTime + ".png");
            }
        }
        else {
            this._bg.loadTexture(EventTet.DEFAUT_UI + "PopUp/bgWeek" + eventTet.eventTime + ".png");
        }
        this.iconTag.loadTexture(EventTet.DEFAUT_UI + "PopUp/tag" + eventTet.eventTime + ".png");
        this.iconTag.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.rotateBy(0.2, 40),
            cc.rotateBy(0.3, -50),
            new cc.EaseBackOut(cc.rotateBy(0.4, 10))
        ));
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        this.onBack();

        if (id == EventTetNotifyGUI.BTN_JOIN) {
            eventTet.sendOpenEvent();
        }
    },

    onBack: function () {
        this.onClose();
    }
});
EventTetNotifyGUI.className = "EventTetNotifyGUI";
EventTetNotifyGUI.BTN_CLOSE = 1;
EventTetNotifyGUI.BTN_JOIN = 2;

var EventTetGiftCell = cc.TableViewCell.extend({

    ctor : function () {
        this._super();

        this.arInfo = [];
        this.arPos = [];

        var jsonLayout = ccs.load("res/Event/EventTet/EventTetGiftCell.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.arItem = [];
        for(var i = 0 ; i < 2 ; i++) {
            var item = {};
            item.bg = ccui.Helper.seekWidgetByName(this._layout, "bg_" + i);
            item.img = ccui.Helper.seekWidgetByName(this._layout, "img_" + i);
            item.bgNum = ccui.Helper.seekWidgetByName(this._layout, "bgNum_" + i);
            item.num = ccui.Helper.seekWidgetByName(this._layout, "num_" + i);
            item.name = ccui.Helper.seekWidgetByName(this._layout, "name_" + i);
            item.labelTicket = ccui.Helper.seekWidgetByName(this._layout, "labelTicket_" + i);
            this.arItem.push(item);
            this.arPos.push(item.name.getPosition());
        }
    },

    setInfo : function (ar) {
        this.arInfo = ar;
        for(var i = 0; i < this.arItem.length ; i++) {
            var inf = null;
            if(i < ar.length) {
                inf = ar[i];
            }

            //cc.log("--> Set Info " + JSON.stringify(inf));
            var item = this.arItem[i];
            for(var key in item) {
                item[key].setVisible(inf != null);
            }

            if(inf) {
                if(eventTet.isItemStored(inf.id))
                {
                    var str = eventTet.getItemName(inf.id);
                    // str = StringUtility.replaceAll(str,"Samsung","");
                    item.name.setString(str);
                    item.labelTicket.setVisible(true);
                }
                else
                {
                    item.name.setString(StringUtility.formatNumberSymbol(eventTet.getItemValue(inf.id)));
                    item.labelTicket.setVisible(false);
                }

                item.num.setString(inf.value);
                item.num.setVisible(inf.value > 1);
                item.bgNum.setVisible(inf.value > 1);

                item.img.removeAllChildren();
                var s = (eventTet.getPieceImage(inf.id));
                cc.log("LFJKD " + s);
                var sp = cc.Sprite.create(s);
                sp.setPosition(item.img.getContentSize().width/2,item.img.getContentSize().height/2);
                item.img.addChild(sp);

                var sX = item.img.getContentSize().width/sp.getContentSize().width;
                var sY = item.img.getContentSize().height/sp.getContentSize().height;
                //  sp.setScale(Math.min(sX,sY));
            }
        }
    },

    getDropInfo : function () {
        var ar = [];
        for(var i = 0; i < this.arInfo.length ; i++) {
            var obj = {};
            var cPos = this.convertToWorldSpace(cc.p(0,0));
            obj.pos = cc.p(cPos.x + this.arPos[i].x,cPos.y + this.arPos[i].y);
            var inf = this.arInfo[i];
            obj.isItem = (inf != null);
            if(inf) {
                obj.id = inf.id;
                obj.value = inf.value;
                obj.isStored = eventTet.isItemStored(inf.id);
            }
            ar.push(obj);
        }
        return ar;
    }
});
var EventTetResultGift = cc.Node.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/EventTet/EventTetGiftResultNode.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.bgNum = ccui.Helper.seekWidgetByName(this._layout, "bgNum");
        this.num = ccui.Helper.seekWidgetByName(this._layout, "num");
        this.name = ccui.Helper.seekWidgetByName(this._layout, "name");
        this.labelTicket = ccui.Helper.seekWidgetByName(this._layout, "labelTicket");
    },

    setGift : function (inf) {
        cc.log("-->Info " + JSON.stringify(inf));
        if(eventTet.isItemStored(inf.id))
        {
            cc.log("vao day 1");
            var str = eventTet.getItemName(inf.id);
            str = StringUtility.replaceAll(str,"Samsung","");
            this.name.setString(str);
            this.labelTicket.setVisible(true);
        }
        else if (inf.id == EventTet.GOLD_ID) {
            this.name.setString(StringUtility.formatNumberSymbol(inf.value));
            this.labelTicket.setVisible(false);
        }
        else
        {
            cc.log("vao day 2");
            this.name.setString(StringUtility.formatNumberSymbol(eventTet.getItemValue(inf.id)));
            this.labelTicket.setVisible(false);
        }

        if (inf.id != EventTet.GOLD_ID) {
            this.num.setString(inf.value);
            this.num.setVisible(inf.value > 1);
            this.bgNum.setVisible(inf.value > 1);
        }
        else {
            this.bgNum.setVisible(false);
            this.num.setVisible(false);
        }

        this.img.removeAllChildren();

        var sp = cc.Sprite.create(eventTet.getPieceImage(inf.id));
        sp.setPosition(this.img.getContentSize().width/2,this.img.getContentSize().height/2);
        this.img.addChild(sp);

        var sX = this.img.getContentSize().width/sp.getContentSize().width;
        var sY = this.img.getContentSize().height/sp.getContentSize().height;
        // sp.setScale(Math.min(sX,sY));
    }

});
var EventTetCoinEffect = cc.Sprite.extend({

    ctor: function () {
        this._super();
        var animation = cc.animationCache.getAnimation(EventTetCoinEffect.NAME_ANIMATION_COIN);
        if (!animation) {
            var arr = [];
            var cache = cc.spriteFrameCache;
            var aniFrame;
            for (var i = 0; i < EventTetCoinEffect.NUM_SPRITE_ANIMATION_COIN; i++) {
                aniFrame = new cc.AnimationFrame(cache.getSpriteFrame(EventTetCoinEffect.NAME_ANIMATION_COIN + i + ".png"), EventTetCoinEffect.TIME_ANIMATION_COIN);
                arr.push(aniFrame);
            }
            for (i = EventTetCoinEffect.NUM_SPRITE_ANIMATION_COIN - 2; i >= 1; i--) {
                aniFrame = new cc.AnimationFrame(cache.getSpriteFrame(EventTetCoinEffect.NAME_ANIMATION_COIN + i + ".png"), EventTetCoinEffect.TIME_ANIMATION_COIN);
                arr.push(aniFrame);
            }
            animation = new cc.Animation(arr, EventTetCoinEffect.TIME_ANIMATION_COIN);
            cc.animationCache.addAnimation(animation, EventTetCoinEffect.NAME_ANIMATION_COIN);
        }
        this.anim = animation;
        this.setVisible(false);
    },

    initCoin: function (type) {
        this.isCollided = false; //kiem tra da cham dat 1 lan chua
        this.opacity = 0;
        var valueRan;
        if (type == EventTetCoinEffect.TYPE_FLOW) {
            this.speedX = 2 * Math.random() * EventTetCoinEffect.RATE_SPEED_X - EventTetCoinEffect.RATE_SPEED_X;
            //this.speedY = Math.random() * EventTetCoinEffect.RATE_SPEED_Y + EventTetCoinEffect.DEFAULT_SPEED_Y;
            var def = Math.random() * 800 + 800;
            this.speedY = Math.sqrt(def * def - this.speedX * this.speedX);
            this.speedR = 2 * Math.random() * EventTetCoinEffect.RATE_SPEED_R - EventTetCoinEffect.RATE_SPEED_R;
            valueRan = Math.random() * (EventTetCoinEffect.MAX_SCALE - EventTetCoinEffect.MIN_SCALE) + EventTetCoinEffect.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var p = cc.p(this.getParent().positionCoin.x + (Math.random() - 0.5) * EventTetCoinEffect.RATE_Position_X,
                this.getParent().positionCoin.y + (Math.random() - 0.5) * EventTetCoinEffect.RATE_Position_Y);
            this.setPosition(p);
        }
        else if (type == EventTetCoinEffect.TYPE_RAIN) {
            this.speedX = 0;
            this.speedY = Math.random() * EventTetCoinEffect.RATE_SPEED_X;
            this.speedR = 2 * Math.random() * EventTetCoinEffect.RATE_SPEED_R - EventTetCoinEffect.RATE_SPEED_R;
            valueRan = Math.random() * (EventTetCoinEffect.MAX_SCALE - EventTetCoinEffect.MIN_SCALE) + EventTetCoinEffect.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var parent = this.getParent();
            this.setPosition(Math.random() * parent.width, parent.height + this.height + Math.random() * EventTetCoinEffect.RATE_Position_Y);
        }
        this.setVisible(false);
    },

    start: function () {
        this.setVisible(true);
        var ani = cc.animate(this.anim);
        //ani.setSpeed(Math.random() * 0.5 + 0.5);
        this.runAction(ani.repeatForever());
    },

    stop: function () {
        this.setVisible(false);
        this.stopAllActions();
    },

    updateCoin: function (dt) {
        var opa = this.opacity;
        opa += 1500 * dt;
        if (opa > 255)this.opacity = 255;
        else this.opacity = opa;
        this.x += this.speedX * dt;
        this.y += this.speedY * dt;
        this.speedY -= EventTetCoinEffect.GRAVITY * dt;
        this.rotation += this.speedR;
        //cham dat thi cho nhay len 1 lan roi roi tiep
        if (this.y < this.getContentSize().height / 2 && !this.isCollided) {
            this.isCollided = true;
            this.speedY = -this.speedY * (Math.random() * EventTetCoinEffect.RATE_JUMP_BACK);
            this.speedX = 0;
        }
        else if (this.y + (this.height * this.scale) < 0 && this.isCollided) {
            this.stop();
        }
    }
});
var CoinFallEffectEventTet = cc.Layer.extend({

    ctor: function () {
        this._super();
        this.listCoin = [];
        this.numEffect = 0;
        this.numCoinNow = 0;
        this.callBack = null;
        this.timeCount = 0;
        this.positionCoin = [0, 0];
        this.isRun = false;
        this.typeEffect = 0;
    },

    setCallbackFinish: function (cb) {
        this.callBack = cb;
    },

    setPositionCoin: function (p) {
        this.positionCoin = p;
    },

    update: function (dt) {
        var coin;
        var isFinish = false;
        for (var i = this.numCoinNow; i < this.numEffect; i++) {
            coin = this.listCoin[i];
            if (coin.visible) {
                coin.updateCoin(dt);
                isFinish = true;
            }
        }
        if (this.numCoinNow > 0) {
            this.timeCount += dt;
            if (this.timeCount >= CoinFallEffectEventTet.TIME_OUT_COIN) {
                var num = 10;
                if (this.typeEffect == CoinFallEffectEventTet.TYPE_FLOW) {
                    num = CoinFallEffectEventTet.NUM_COIN_EACH_TIME * this.timeCount;
                    this.timeCount = 0;
                }
                else if (this.typeEffect == CoinFallEffectEventTet.TYPE_RAIN) {
                    num = CoinFallEffectEventTet.NUM_COIN_RATE_RAIN * 0.05;
                    this.timeCount = CoinFallEffectEventTet.TIME_OUT_COIN - 0.05;
                }
                for (i = 0; i < num; i++) {
                    coin = this.listCoin[this.numCoinNow--];
                    coin.start();
                    if (this.numCoinNow == 0)break;
                }
            }
        }
        else {
            if (!isFinish) {
                this.unscheduleUpdate();
                //if (this.callBack) {
                //    //var cb = this.callBack.bind(this.targetCB);
                //    //this.runAction(this.callBack);
                //}
                this.setVisible(false);
                this.isRun = false;
            }
        }
    },

    startEffect: function (numEffect, type) {
        if (this.isRun)this.stopEffect();
        var coin;
        this.typeEffect = type;
        this.numEffect = numEffect;
        var i, len;
        if (numEffect > this.listCoin.length) {
            for (i = 0, len = numEffect - this.listCoin.length; i < len; i++) {
                coin = this.getCoinItem();
                this.listCoin.push(coin);
                this.addChild(coin);
            }
        }
        for (i = 0; i < numEffect; i++) {
            coin = this.listCoin[i];
            coin.stop();
            coin.initCoin(type);
        }
        this.numCoinNow = numEffect - 1;
        this.timeCount = 0;
        this.scheduleUpdate();
        this.setVisible(true);
        this.isRun = true;
        this.runAction(cc.sequence(cc.delayTime(CoinFallEffectEventTet.DELAY_PLAY_SOUND), cc.callFunc(function(){
            EventTetSound.playCoinFall();
        })));
    },

    stopEffect: function () {
        for (var i = 0; i < this.listCoin.length; i++) {
            this.listCoin[i].setVisible(false);
        }
    },

    getCoinItem: function () {
        return new CoinEffectEventTet();
    }
});

var CoinEffectEventTet = cc.Sprite.extend({
    ctor: function () {
        this._super();
        this.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame(CoinFallEffectEventTet.NAME_ANIMATION_COIN + Math.floor(Math.random() * 4) + ".png"));
        var animation = cc.animationCache.getAnimation(CoinFallEffectEventTet.NAME_ANIMATION_COIN);
        if (!animation) {
            var arr = [];
            var cache = cc.spriteFrameCache;
            var aniFrame;
            for (var i = 0; i < CoinFallEffectEventTet.NUM_SPRITE_ANIMATION_COIN; i++) {
                aniFrame = new cc.AnimationFrame(cache.getSpriteFrame(CoinFallEffectEventTet.NAME_ANIMATION_COIN + i + ".png"), CoinFallEffectEventTet.TIME_ANIMATION_COIN);
                arr.push(aniFrame);
            }
            for (i = CoinFallEffectEventTet.NUM_SPRITE_ANIMATION_COIN - 2; i >= 1; i--) {
                aniFrame = new cc.AnimationFrame(cache.getSpriteFrame(CoinFallEffectEventTet.NAME_ANIMATION_COIN + i + ".png"), CoinFallEffectEventTet.TIME_ANIMATION_COIN);
                arr.push(aniFrame);
            }
            animation = new cc.Animation(arr, CoinFallEffectEventTet.TIME_ANIMATION_COIN);
            cc.animationCache.addAnimation(animation, CoinFallEffectEventTet.NAME_ANIMATION_COIN);
        }
        this.anim = animation;
        this.setVisible(false);
    },

    initCoin: function (type) {
        this.isCollided = false; //kiem tra da cham dat 1 lan chua
        this.opacity = 0;
        var valueRan;
        if (type == CoinFallEffectEventTet.TYPE_FLOW) {
            this.speedX = 2 * Math.random() * CoinFallEffectEventTet.RATE_SPEED_X - CoinFallEffectEventTet.RATE_SPEED_X;
            //this.speedY = Math.random() * CoinFallEffectEventTet.RATE_SPEED_Y + CoinFallEffectEventTet.DEFAULT_SPEED_Y;
            var def = Math.random() * 800 + 800;
            this.speedY = Math.sqrt(def * def - this.speedX * this.speedX);
            this.speedR = 2 * Math.random() * CoinFallEffectEventTet.RATE_SPEED_R - CoinFallEffectEventTet.RATE_SPEED_R;
            valueRan = Math.random() * (CoinFallEffectEventTet.MAX_SCALE - CoinFallEffectEventTet.MIN_SCALE) + CoinFallEffectEventTet.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var p = cc.p(this.getParent().positionCoin.x + (Math.random() - 0.5) * CoinFallEffectEventTet.RATE_Position_X,
                this.getParent().positionCoin.y + (Math.random() - 0.5) * CoinFallEffectEventTet.RATE_Position_Y);
            this.setPosition(p);
        }
        else if (type == CoinFallEffectEventTet.TYPE_RAIN) {
            this.speedX = 0;
            this.speedY = Math.random() * CoinFallEffectEventTet.RATE_SPEED_X;
            this.speedR = 2 * Math.random() * CoinFallEffectEventTet.RATE_SPEED_R - CoinFallEffectEventTet.RATE_SPEED_R;
            valueRan = Math.random() * (CoinFallEffectEventTet.MAX_SCALE - CoinFallEffectEventTet.MIN_SCALE) + CoinFallEffectEventTet.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var parent = this.getParent();
            this.setPosition(Math.random() * parent.width, parent.height + this.height + Math.random() * CoinFallEffectEventTet.RATE_Position_Y);
        }
        this.setVisible(false);
    },

    start: function () {
        this.setVisible(true);
        var ani = cc.animate(this.anim);
        //ani.setSpeed(Math.random() * 0.5 + 0.5);
        this.runAction(ani.repeatForever());
    },

    stop: function () {
        this.setVisible(false);
        this.stopAllActions();
    },

    updateCoin: function (dt) {
        var opa = this.opacity;
        opa += 1500 * dt;
        if (opa > 255)this.opacity = 255;
        else this.opacity = opa;
        this.x += this.speedX * dt;
        this.y += this.speedY * dt;
        this.speedY -= CoinFallEffectEventTet.GRAVITY * dt;
        this.rotation += this.speedR;
        //cham dat thi cho nhay len 1 lan roi roi tiep
        if (this.y < 0 && !this.isCollided) {
            this.isCollided = true;
            this.speedY = -this.speedY * (Math.random() * CoinFallEffectEventTet.RATE_JUMP_BACK);
            this.speedX = 0;
        }
        else if (this.y + (this.height * this.scale) < 0 && this.isCollided) {
            this.stop();
        }
    }
});

var EventTetHistoryGUI = BaseLayer.extend({

    ctor: function () {
        this.arTabRequest = [];

        this._super(EventTetHistoryGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetHistoryGUI.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");

        this.tabGift = this.customButton("tabGift", EventTetHistoryGUI.BTN_GIFT, bg, false);
        this.tabGift.ySelect = this.tabGift.getPositionY() - 2;
        this.tabGift.yNormal = this.tabGift.getPositionY();
        this.tabGift.lbTitle = this.getControl("lbTitle", this.tabGift);
        this.tabInfo = this.customButton("tabInformation", EventTetHistoryGUI.BTN_INFO, bg, false);
        this.tabInfo.ySelect = this.tabInfo.getPositionY() - 2;
        this.tabInfo.yNormal = this.tabInfo.getPositionY();
        this.tabInfo.lbTitle = this.getControl("lbTitle", this.tabInfo);

        this.customButton("close", EventTetHistoryGUI.BTN_CLOSE, bg);

        this.pInfo = this.getControl("pInfo", bg);
        var pInfoData = this.getControl("pInfoData", this.pInfo)
        this.pInfo.notice = this.getControl("pInfoEmpty", bg);
        this.pInfo.fullname = this.getControl("name", pInfoData);
        this.pInfo.address = this.getControl("add", pInfoData);
        this.pInfo.cmnd = this.getControl("cmnd", pInfoData);
        this.pInfo.phone = this.getControl("sdt", pInfoData);
        this.pInfo.email = this.getControl("email", pInfoData);
        this.pInfo.lbGift = this.getControl("lbGift", pInfoData);
        this.btnFanpage = this.customButton("btnFanpage", EventTetHistoryGUI.BTN_FANPAGE, pInfoData);
        this.pInfoData = pInfoData;

        this.pGift = this.getControl("pGift", bg);
        this.pGift.pListGift = this.getControl("pListGift", this.pGift);
        this.pGift.notice = this.getControl("pGiftEmpty", this.pGift);
        var panelGift = new EventTetPanelGift(this.pGift);
        this.pGift.panel = panelGift;
        this.pGift.pListGift.addChild(panelGift);

        this.onButtonRelease(null, EventTetHistoryGUI.BTN_GIFT);

        this.ignoreAllButtonSound();

        this.enableFog(true);
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        // this.updateInfoRegister();
        eventTet.sendGetInfoRegister();
        eventTet.sendGetGiftRegister();
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case EventTetHistoryGUI.BTN_CLOSE:
                this.onBack();
                break;
            case EventTetHistoryGUI.BTN_GIFT:
                this.tabInfo.loadTextures(EventTet.DEFAUT_UI + "btnInfo.png", EventTet.DEFAUT_UI + "btnInfo.png", EventTet.DEFAUT_UI + "btnInfo.png");
                this.tabGift.loadTextures(EventTet.DEFAUT_UI + "btnGiftRegisterSelect.png", EventTet.DEFAUT_UI + "btnGiftRegisterSelect.png", EventTet.DEFAUT_UI + "btnGiftRegisterSelect.png");
                this.pInfo.setVisible(false);
                this.pGift.setVisible(true);
                this.updateInfoRegister();
                break;
            case EventTetHistoryGUI.BTN_INFO:
                this.tabInfo.loadTextures(EventTet.DEFAUT_UI + "btnInfoSelect.png", EventTet.DEFAUT_UI + "btnInfoSelect.png", EventTet.DEFAUT_UI + "btnInfoSelect.png");
                this.tabGift.loadTextures(EventTet.DEFAUT_UI + "btnGiftRegister.png", EventTet.DEFAUT_UI + "btnGiftRegister.png", EventTet.DEFAUT_UI + "btnGiftRegister.png");
                this.pInfo.setVisible(true);
                this.pGift.setVisible(false);
                this.updateInfoRegister();
                break;
            case EventTetHistoryGUI.BTN_FANPAGE:
                try {
                    if (!cc.sys.isNative) {
                        NativeBridge.openURLNative("https://www.facebook.com/messages/t/401519949863382")
                    }
                    else if (cc.sys.os === cc.sys.OS_IOS) {
                        cc.Application.getInstance().openURL("fb-messenger://user-thread/401519949863382");
                    }
                    else if (cc.sys.os === cc.sys.OS_ANDROID) {
                        if(!cc.Application.getInstance().openURL("fb://messaging/401519949863382")) {
                            cc.Application.getInstance().openURL("https://www.facebook.com/messages/t/401519949863382");
                        }
                    }
                }
                catch (e) {

                }
                return;
                break;
        }
    },

    updateInfoRegister: function () {
        if (eventTet.isRegisterSuccess) {
            var data = eventTet.registerData;
            cc.log("DATA ** " + JSON.stringify(data));
            this.pInfo.fullname.setString(data.fullName);
            this.pInfo.address.setString(data.address);
            this.pInfo.cmnd.setString(data.identity);
            this.pInfo.phone.setString(data.phone);
            this.pInfo.email.setString(data.email);

            var str = "";
            var gIds = data.registeredGiftIds;
            gIds.sort(function (a, b) {
                return b - a;
            });
            var length = (gIds.length <= 4) ? gIds.length : 4;
            for (var i = 0; i < length; i++) {
                str += eventTet.getItemName(gIds[i]);
                if (i < length - 1) {
                    str += ", ";
                }
            }
            if (gIds.length > 4) str += ", ...";
            this.pInfo.lbGift.setString(str);
            this.btnFanpage.setVisible(eventTet.isRegisterSuccess && eventTet.getTotalPriceGift() > 500000);
        }

        this.pGift.notice.setVisible(!eventTet.isRegisterSuccess);
        this.pInfo.notice.setVisible(!eventTet.isRegisterSuccess);
        this.pGift.pListGift.setVisible(eventTet.isRegisterSuccess);
        this.pGift.panel.updateData();
        this.pInfoData.setVisible(eventTet.isRegisterSuccess);
    },

    onBack: function () {
        this.onClose();
    }
});
EventTetHistoryGUI.className = "EventTetHistoryGUI";
EventTetHistoryGUI.BTN_CLOSE = 0;
EventTetHistoryGUI.BTN_GIFT = 1;
EventTetHistoryGUI.BTN_INFO = 2;
EventTetHistoryGUI.BTN_FANPAGE = 3;

var EventTetPanelGift = BaseLayer.extend({

    ctor: function (parent) {
        this._super("");
        this.listHistory = new cc.TableView(this, parent.getContentSize());
        this.listHistory.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.listHistory.setVerticalFillOrder(1);
        this.listHistory.setDelegate(this);
        this.addChild(this.listHistory);
        this.listHistory.reloadData();
    },

    onEnterFinish: function(){
        if (!cc.sys.isNative){
            this.listHistory.setTouchEnabled(true);
        }
    },

    updateData: function () {
        this.listHistory.reloadData();
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(300, 300);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new EventTetGiftHistoryCell();
        }
        cell.updateInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return eventTet.registerData.registeredGiftIds.length;
    }
});

var EventTetGiftHistoryCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        this.imgGift = new cc.Sprite(EventTet.DEFAUT_UI + "gift3.png");
        this.addChild(this.imgGift);
        this.imgGift.setPosition(150, 150);

        this.lbGift = new ccui.Text("fjldfljd");
        this.lbGift.setColor(cc.color(209, 83, 16, 255));
        this.lbGift.setFontSize(20);
        this.addChild(this.lbGift);
        this.lbGift.setPosition(150, 50);
        this.setContentSize(300, 300);
    },

    updateInfo: function (idx) {
        var gIds = eventTet.registerData.registeredGiftIds;
        gIds.sort(function (a, b) {
            return b - a;
        });
        // var length = (gIds.length <= 2) ? gIds.length : 2;
        var str = eventTet.getItemName(gIds[idx]);
        this.imgGift.setTexture(eventTet.getGiftImage(gIds[idx]));
        this.lbGift.setString(str);
    }
});

var EventTetLookBackGUI = BaseLayer.extend({

    ctor: function () {

        this._currentPage = null;
        this._pageHelp = null;

        this._arrPage = null;
        this._pageInfo = null;

        this.curPage = -1;

        this._super(EventTetLookBackGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetLookBackGUI.json");
    },

    initGUI: function () {
        var bg = this.getControl("Panel_7");
        this.panelShare = this.getControl("panelShare", bg);
        this.logo = this.getControl("logo", this.panelShare);
        var game = LocalizedString.config("GAME");
        this.logo.loadTexture("res/Event/EventTet/logo" + game + ".png");

        this._bg = bg;
        bg = this.getControl("bg", bg);
        this.btnClose = this.customButton("btnClose", EventTetLookBackGUI.BTN_CLOSE, bg);
        this.btnNext = this.customButton("btnNext", EventTetLookBackGUI.BTN_NEXT, bg);
        this.btnShare = this.customButton("btnShare", EventTetLookBackGUI.BTN_SHARE, bg);
        this.lbNoteReceived = bg.getChildByName("lbNoteReceived");
        this.lbNoteReceived.setVisible(false);
        this._pageHelp = this.getControl("pageHelp", bg);

        this._arrPage = [];
        for (var i = 0; i <= EventTetLookBackGUI.MAX_DAY; i++) {
            this._arrPage[i] = this.customButton("btnPage" + i, EventTetLookBackGUI.PAGE_ID + i, this._bg);
            this._arrPage[i].lb = this.getControl("lb", this._arrPage[i]);
            this._arrPage[i].pos = this._arrPage[i].getPosition();
            this._arrPage[i].setPressedActionEnabled(false);
        }
        this.arrayItem = [];
        for (var i = 0; i <= EventTetLookBackGUI.MAX_DAY; i++) {
            var page = this._pageHelp.getPage(i);
            this.arrayItem[i] = new EventTetLookBackItem();
            page.addChild(this.arrayItem[i]);
        }
        for (var i = 0; i <= EventTetLookBackGUI.MAX_DAY; i++) {
            this.arrayItem[i].setInfo("fdffsdfdsfsfsfdsfsfsdfdsfdsf", "fdffsdfdsfsfsdfdsfsdfsdfsdf", "fdffdsfdsfsdfsdfsdfsdfsdffdsfsdf", "kf", i);
        }
        // for (var i = 0; i < 4; i++) // so luong button help
        //     this.customButton("btn" + i, 100 + i, this._layout);
        // this._currentPage = this.getControl("imgCurPage", bg);
        this._pageHelp.addEventListener(this.onPageListener.bind(this), this);
        this._pageHelp.setCustomScrollThreshold(20);
        this.enableFog(true);
        this.setBackEnable(true);
        this.setInfo(eventTet.pkgLookBack);
        if (eventTet.pkgLookBack.currentDay == 0) {
            this.selectTab(eventTet.pkgLookBack.currentDay);
        }
        else {
            this.selectTab(eventTet.pkgLookBack.currentDay + 1);
        }
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.onPageListener();
    },

    setInfo: function (pkg) {
        this.currentDay = pkg.currentDay;
        for (var i = 0; i < EventTetLookBackGUI.MAX_DAY; i++) {
            if (i == EventTetLookBackGUI.MAX_DAY - 1) {
                this.arrayItem[i + 1].setInfo(pkg.bonusGold, pkg.bonusTicket, "", pkg.rank[i], i + 1);
            }
            else {
                this.arrayItem[i + 1].setInfo(pkg.prefixMessage[i], pkg.suffixMessage[i], pkg.value[i], pkg.rank[i], i + 1);
            }
        }
        if (pkg.receivedGift == CmdReceiveEventTetLookBack.DEVICE_RECEIVED) {
            this.lbNoteReceived.setVisible(true);
        }
        else {
            this.lbNoteReceived.setVisible(false);
        }
    },

    onPageListener: function () {
        // if (this.curPage == -1) {
        //     this.curPage = this._pageHelp.getCurPageIndex();
        //     this._currentPage.setPosition(this._arrPage[this.curPage].getPosition());
        // }
        // else {
        //     this._currentPage.setPosition(this._arrPage[this.curPage].getPosition());
        //
        //     this.curPage = this._pageHelp.getCurPageIndex();
        //     var newPos = this._arrPage[this._pageHelp.getCurPageIndex()].getPosition();
        //     this._currentPage.runAction(cc.moveTo(0.1, newPos));
        //     this.labelHelp.setString(localized("EVENT_TET_HELP_" + this.curPage));
        // }
        for (var i = 0; i < this._arrPage.length; i++) {
            if (eventTet.currentDay + 1 >= i) {
                this._arrPage[i].loadTextures(EventTet.DEFAUT_UI + "btnDayNormal.png", EventTet.DEFAUT_UI + "btnDayNormal.png", EventTet.DEFAUT_UI + "btnDayNormal.png");
                this._arrPage[i].lb.setColor(cc.color(211, 108, 34, 255));
            }
            else {
                this._arrPage[i].loadTextures(EventTet.DEFAUT_UI + "btnDayDisable.png", EventTet.DEFAUT_UI + "btnDayDisable.png", EventTet.DEFAUT_UI + "btnDayDisable.png");
                this._arrPage[i].lb.setColor(cc.color(165, 165, 165, 255));
            }
            this._arrPage[i].setPositionY(this._arrPage[i].pos.y);
        }
        this._arrPage[this._pageHelp.getCurPageIndex()].loadTextures(EventTet.DEFAUT_UI + "btnDaySelect.png", EventTet.DEFAUT_UI + "btnDaySelect.png", EventTet.DEFAUT_UI + "btnDaySelect.png");
        this._arrPage[this._pageHelp.getCurPageIndex()].lb.setColor(cc.color(255, 255, 255, 255));
        this._arrPage[this._pageHelp.getCurPageIndex()].setPositionY(this._arrPage[this._pageHelp.getCurPageIndex()].pos.y + 10);
        this.btnShare.setVisible(true);
        if (this._pageHelp.getCurPageIndex() < EventTetLookBackGUI.MAX_DAY) {
            this.btnNext.setVisible(true);
        }
        else {
            this.btnNext.setVisible(false);
        }

        if (this._pageHelp.getCurPageIndex() > eventTet.currentDay + 1) {
            this.btnShare.setVisible(false);
        }

    },

    onReceiveLookBack: function (result) {

        switch (result) {
            case CmdReceiveEventTetGetLookBack.SUCCESS:
            case CmdReceiveEventTetGetLookBack.DEVICE_RECEIVED:
                this.arrayItem[EventTetLookBackGUI.MAX_DAY].effectReceive();
                eventTet.pkgLookBack.receivedGift = CmdReceiveEventTetLookBack.USER_RECEIVED;
                this.setInfo(eventTet.pkgLookBack);
                //this.btnReceive.loadTextures(EventTet.DEFAUT_UI + "iconReceived.png", EventTet.DEFAUT_UI + "iconReceived.png", EventTet.DEFAUT_UI + "iconReceived.png");
                break;
            case CmdReceiveEventTetGetLookBack.USER_RECEIVED:
            case CmdReceiveEventTetGetLookBack.WRONG_DAY:
                sceneMgr.showOKDialog(LocalizedString.to("EVENT_TET_LOOK_BACK_RECEIVE_" + result));
                break;
            default:
                sceneMgr.showOKDialog(LocalizedString.to("EVENT_TET_LOOK_BACK_RECEIVE_ERROR"));
                break;
        }

    },

    onButtonRelease: function (button, id) {
        if (id >= EventTetLookBackGUI.PAGE_ID) {
            this._pageHelp.scrollToPage(id - EventTetLookBackGUI.PAGE_ID);
            return;
        }
        switch (id) {
            case EventTetLookBackGUI.BTN_CLOSE:
                this.onBack();
                break;
            case EventTetLookBackGUI.BTN_NEXT:
                if (this._pageHelp.getCurPageIndex() < EventTetLookBackGUI.MAX_DAY)
                    this.selectTab(this._pageHelp.getCurPageIndex() + 1);
                break;
            case EventTetLookBackGUI.BTN_SHARE:
                cc.log("SHARE FACE");
                this.onCapture();
                break;

        }

    },

    onCapture: function () {
        this.btnShare.setVisible(false);
        for (var i = 0; i < this._arrPage.length; i++) {
            this._arrPage[i].setVisible(false);
        }
        this.btnClose.setVisible(false);
        this.lbNoteReceived.setVisible(false);
        this.panelShare.setVisible(true);

        if (!gamedata.checkOldNativeVersion()) {
            var imgPath = sceneMgr.takeScreenShot();
            setTimeout(function () {
                fr.facebook.shareScreenShoot(imgPath, function (result) {
                    var message = "";
                    if (result == -1) {
                        message = localized("INSTALL_FACEBOOK");
                    } else if (result == 1) {
                        message = localized("NOT_SHARE");
                    } else if (result == 0) {
                        message = localized("FACEBOOK_DELAY");

                    } else {
                        message = localized("FACEBOOK_ERROR");
                    }
                    Toast.makeToast(Toast.SHORT, message);
                });
            }, 500);
        } else {
            this.onShareImg = function (social, jdata) {
                var message = "";
                var dom = StringUtility.parseJSON(jdata);// JSON.parse(jdata);
                if (dom["error"] == -1) {
                    message = localized("INSTALL_FACEBOOK");
                } else if (dom["error"] == 1) {
                    message = localized("NOT_SHARE");
                } else if (dom["error"] == 0) {
                    message = localized("FACEBOOK_DELAY");
                } else {
                    message = localized("FACEBOOK_ERROR");
                }
                Toast.makeToast(Toast.SHORT, message);

            }.bind(this);

            socialMgr.set(this, this.onShareImg);
            socialMgr.shareImage(SocialManager.FACEBOOK);
        }

        this.btnShare.setVisible(true);
        for (var i = 0; i < this._arrPage.length; i++) {
            this._arrPage[i].setVisible(true);
        }
        this.btnClose.setVisible(true);
        this.lbNoteReceived.setVisible(true);
        this.panelShare.setVisible(false);
    },

    selectTab: function(selectTab) {
        this._pageHelp.scrollToPage(selectTab);
    },

    onBack: function () {
        this.onClose();
    }
});
EventTetLookBackGUI.className = "EventTetLookBackGUI";
EventTetLookBackGUI.TAG = 1002;
EventTetLookBackGUI.BTN_CLOSE = 0;
EventTetLookBackGUI.BTN_NEXT = 1;
EventTetLookBackGUI.BTN_SHARE = 2;

EventTetLookBackGUI.NOT_RECEIVED = 1;
EventTetLookBackGUI.USER_RECEIVED = 1;
EventTetLookBackGUI.DEVICE_RECEIVED = 2;

// EventTetLookBackGUI.MAX_PAGE = 6;
EventTetLookBackGUI.MAX_DAY = 5;
EventTetLookBackGUI.PAGE_ID = 10;
var EventTetLookBackItem = cc.Node.extend({
    ctor: function () {
        this._super();
        var jsonLayout = ccs.load("res/Event/EventTet/LookBackItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);
        this.setContentSize(this._layout.getContentSize());

        this.lbTime = ccui.Helper.seekWidgetByName(this._layout, "lbTime");
        this.panelNormal = ccui.Helper.seekWidgetByName(this._layout, "panelNormal");
        this.panelFirst = ccui.Helper.seekWidgetByName(this._layout, "panelFirst");
        this.panelLast = ccui.Helper.seekWidgetByName(this._layout, "panelLast");
        this.panelNext = ccui.Helper.seekWidgetByName(this._layout, "panelNext");
        this.arrayLb = [];
        for (var i = 0; i < 3; i++) {
            this.arrayLb[i] = ccui.Helper.seekWidgetByName(this._layout, "lb" + i);
        }
        this.btnReceive = ccui.Helper.seekWidgetByName(this.panelLast, "btnReceive");
        this.btnReceive.pos = this.btnReceive.getPosition();
        this.btnReceive.addClickEventListener(this.onReceive.bind(this));
        this.iconDay = this.panelNormal.getChildByName("iconDay");
        this.iconRank = this.panelNormal.getChildByName("iconRank");
        this.iconRankSum = this.panelLast.getChildByName("iconRankSum");
        this.iconGold = this.panelLast.getChildByName("iconGold");
        this.iconKeyCoin = this.panelLast.getChildByName("iconKeyCoin");
        this.iconKeyCoin.pos = this.iconKeyCoin.getPosition();
        this.lbGold = this.iconGold.getChildByName("lbGold");
        this.lbKeyCoin = this.iconKeyCoin.getChildByName("lbKeyCoin");
        this.lbNoteReceived = this.panelLast.getChildByName("lbNoteReceived");
        this.lbNoteReceived.setVisible(false);
    },

    onReceive: function () {
        eventTet.sendReceiveLookBack();
        this.btnReceive.setTouchEnabled(false);
    },

    effectReceive: function () {
        var pos1, pos2, posCenter;
        var lobbyScene = sceneMgr.getMainLayer();
        if (this.iconGold.isVisible()) {
            var sprite = new cc.Sprite(EventTet.DEFAUT_UI + "Lixi/lixi7.png");
            sceneMgr.layerSystem.addChild(sprite);
            pos1 = this.iconGold.getParent().convertToWorldSpace(this.iconGold.getPosition());
            pos2 = lobbyScene.btnAvatar.getParent().convertToWorldSpace(lobbyScene.btnAvatar.getPosition());
            posCenter = cc.p(Math.random() * cc.winSize.width, cc.winSize.height);
            sprite.setPosition(pos1);

            var actMove = cc.bezierTo(0.7, [pos1, posCenter, pos2]);
            sprite.runAction(cc.sequence(new cc.EaseSineOut(actMove), cc.delayTime(0.2), new cc.EaseBackIn(cc.scaleTo(0.4, 0)), cc.hide()));
        }

        sprite = new cc.Sprite(EventTet.DEFAUT_UI + "iconKeyCoinLarge.png");
        sprite.setScale(0.6);
        sceneMgr.layerSystem.addChild(sprite);
        pos1 = this.iconKeyCoin.getParent().convertToWorldSpace(this.iconKeyCoin.getPosition());
        if (lobbyScene instanceof LobbyScene)
            pos2 = lobbyScene.btnEvent.getParent().convertToWorldSpace(lobbyScene.btnEvent.getPosition());
        else pos2 = cc.p(100, 20);
        pos2.y = pos2.y + 50;
        posCenter = cc.p(Math.random() * cc.winSize.width, cc.winSize.height);
        sprite.setPosition(pos1);
        var actMove = cc.bezierTo(0.7, [pos1, posCenter, pos2]);
        sprite.runAction(cc.sequence(new cc.EaseSineOut(actMove), cc.delayTime(0.2), new cc.EaseBackIn(cc.scaleTo(0.4, 0)), cc.hide()));
    },

    hideAll: function () {
        this.panelNext.setVisible(false);
        this.panelNormal.setVisible(false);
        this.panelFirst.setVisible(false);
        this.panelLast.setVisible(false);
    },

    setInfo: function (prefixMessage, suffixMessage, value, rank, day) {
        this.hideAll();
        if (day == 0) {
            this.panelFirst.setVisible(true);
        }
        else if (day == EventTetLookBackGUI.MAX_DAY) {
            // trang cuoi cung tuy thuoc vao ngay hien tai da la ngay cuoi cung chua de show ra noi dung tuong ung
            if (eventTet.currentDay < EventTetLookBackGUI.MAX_DAY - 1) {
                this.panelNext.setVisible(true);
            }
            else {
                this.panelLast.setVisible(true);
                // eventTet.pkgLookBack.receivedGift = CmdReceiveEventTetLookBack.DEVICE_RECEIVED;
                cc.log("RECEIVE GIFT " + eventTet.pkgLookBack.receivedGift);
                if (eventTet.pkgLookBack.receivedGift == CmdReceiveEventTetLookBack.NOT_RECEIVED || eventTet.pkgLookBack.receivedGift == CmdReceiveEventTetLookBack.DEVICE_RECEIVED) {
                    this.btnReceive.loadTextures(EventTet.DEFAUT_UI + "btnReceive.png", EventTet.DEFAUT_UI + "btnReceive.png", EventTet.DEFAUT_UI + "btnReceive.png");
                    this.btnReceive.setTouchEnabled(true);
                    this.btnReceive.setPositionY(this.btnReceive.pos.y);
                    if (eventTet.pkgLookBack.receivedGift == CmdReceiveEventTetLookBack.DEVICE_RECEIVED)
                        this.lbNoteReceived.setVisible(true);
                    else
                        this.lbNoteReceived.setVisible(false);
                }
                else {
                    this.btnReceive.loadTextures(EventTet.DEFAUT_UI + "iconReceived.png", EventTet.DEFAUT_UI + "iconReceived.png", EventTet.DEFAUT_UI + "iconReceived.png");
                    this.btnReceive.setTouchEnabled(false);
                    this.lbNoteReceived.setVisible(false);
                    this.btnReceive.setPositionY(this.btnReceive.pos.y + 40);
                }
                if (eventTet.pkgLookBack.receivedGift == CmdReceiveEventTetLookBack.DEVICE_RECEIVED || prefixMessage == 0){
                    this.iconGold.setVisible(false);
                    this.iconKeyCoin.setPositionX(this.iconKeyCoin.pos.x - 50);
                }
                else {
                    this.iconGold.setVisible(true);
                    this.iconKeyCoin.setPositionX(this.iconKeyCoin.pos.x );
                }
                this.lbGold.setString(StringUtility.pointNumber(prefixMessage));
                this.lbKeyCoin.setString("x" + StringUtility.pointNumber(suffixMessage));
                this.iconRankSum.loadTexture(EventTet.DEFAUT_UI + "icon" + rank + ".png");
            }
        }
        else {
            // cac trang binh thuong cung dua vao trang hien tai so voi ngay hien tai de so noi dung tuong ung
            if (eventTet.currentDay + 1 < day) {
                this.panelNext.setVisible(true);
            }
            else {
                this.panelNormal.setVisible(true);
                this.arrayLb[0].setString(prefixMessage);
                this.arrayLb[1].setString(value);
                this.arrayLb[2].setString(suffixMessage);
                this.lbTime.setString("Ngay " + day);
                this.iconDay.setTexture(EventTet.DEFAUT_UI + "imageDay" + day + ".png");
                if (rank == "S+") {
                    this.iconRank.loadTexture(EventTet.DEFAUT_UI + "iconSPlus.png");
                }
                else if (rank == "S-") {
                    this.iconRank.loadTexture(EventTet.DEFAUT_UI + "iconSMinus.png");
                }
                else {
                    this.iconRank.loadTexture(EventTet.DEFAUT_UI + "icon" + rank + ".png");
                }
                // var s1 = prefixMessage + "<" + "color = YELLOW" + ">" + " " + value + "<" + "/color> " + suffixMessage;
                // this.labelContent.setString(s1);
            }
        }

    }
})

DialogEvent.BTN_OK = 0;
DialogEvent.BTN_CANCEL = 1;
DialogEvent.BTN_QUIT = 2;
DialogEvent.ZODER = 10000;
DialogEvent.TAG = 10000;

EventTetCoinEffect.RATE_SPEED_Y = 600;
EventTetCoinEffect.DEFAULT_SPEED_Y = 850;
EventTetCoinEffect.RATE_SPEED_X = 350;
EventTetCoinEffect.RATE_SPEED_R = 10;
EventTetCoinEffect.RATE_Position_X = 70;
EventTetCoinEffect.RATE_Position_Y = 70;
EventTetCoinEffect.MIN_SCALE = 0.32;
EventTetCoinEffect.MAX_SCALE = 0.42;
EventTetCoinEffect.RATE_JUMP_BACK = 0.5;
EventTetCoinEffect.GRAVITY = 2300;
EventTetCoinEffect.POSI = 90;
EventTetCoinEffect.NAME_ANIMATION_COIN = "gold";
EventTetCoinEffect.NUM_SPRITE_ANIMATION_COIN = 5;
EventTetCoinEffect.NUM_COIN_EACH_TIME = 100;
EventTetCoinEffect.NUM_COIN_RATE_RAIN = 100;
EventTetCoinEffect.TIME_ANIMATION_COIN = 0.3;
EventTetCoinEffect.TIME_OUT_COIN = 0.05;
EventTetCoinEffect.TYPE_FLOW = 0;
EventTetCoinEffect.TYPE_RAIN = 1;
EventTetCoinEffect.DELAY_PLAY_SOUND = 0.3;

CoinFallEffectEventTet.RATE_SPEED_Y = 600;
CoinFallEffectEventTet.DEFAULT_SPEED_Y = 850;
CoinFallEffectEventTet.RATE_SPEED_X = 350;
CoinFallEffectEventTet.RATE_SPEED_R = 10;
CoinFallEffectEventTet.RATE_Position_X = 70;
CoinFallEffectEventTet.RATE_Position_Y = 70;
CoinFallEffectEventTet.MIN_SCALE = 0.32;
CoinFallEffectEventTet.MAX_SCALE = 0.42;
CoinFallEffectEventTet.RATE_JUMP_BACK = 0.5;
CoinFallEffectEventTet.GRAVITY = 2300;
CoinFallEffectEventTet.POSI = 90;
CoinFallEffectEventTet.NAME_ANIMATION_COIN = "gold";
CoinFallEffectEventTet.NUM_SPRITE_ANIMATION_COIN = 5;
CoinFallEffectEventTet.NUM_COIN_EACH_TIME = 100;
CoinFallEffectEventTet.NUM_COIN_RATE_RAIN = 100;
CoinFallEffectEventTet.TIME_ANIMATION_COIN = 0.3;
CoinFallEffectEventTet.TIME_OUT_COIN = 0.05;
CoinFallEffectEventTet.TYPE_FLOW = 0;
CoinFallEffectEventTet.TYPE_RAIN = 1;
CoinFallEffectEventTet.DELAY_PLAY_SOUND = 0.3;


var EventTetPromoTicketGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(EventTetPromoTicketGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetPromoTicketGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", EventTetPromoTicketGUI.BTN_CLOSE, this._bg);
        this.btnJoin = this.customButton("join", EventTetPromoTicketGUI.BTN_SHOP, this._bg);
        this.btnJoin.runAction(cc.repeatForever(cc.sequence(
            new cc.EaseBounceOut(cc.scaleTo(0.6, 1.2)),
            cc.scaleTo(0.3, 1.0)
        )));

        this.lbTime = this.getControl("lbTime", this._bg);

        this.ignoreAllButtonSound();

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        //midAutumn.saveCurrentDay();
        if (event.startPromoTicket.localeCompare(event.endPromoTicket) != 0)
            this.lbTime.setString(localized("EVENT_TET_DAY") + " " + event.startPromoTicket + "-" + event.endPromoTicket);
        else
            this.lbTime.setString(localized("EVENT_TET_DAY") + " " + event.startPromoTicket);
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        if (id == EventTetPromoTicketGUI.BTN_SHOP) {
            gamedata.openShopTicket();
        }
        else {
            this.onBack();
        }
    },

    onBack: function () {
        this.onClose();
    }
});

EventTetPromoTicketGUI.className = "EventTetPromoTicketGUI";
EventTetPromoTicketGUI.BTN_CLOSE = 0;
EventTetPromoTicketGUI.BTN_SHOP = 1;
EventTetPromoTicketGUI.TAG = 1000;

var EventTetRankGUI = BaseLayer.extend({
    ctor: function () {
        this.currentTab = 0;
        this.myWeek = 0;
        this.dataTop = null;
        this._super(EventTetRankGUI.className);
        this.initWithBinaryFile("res/Event/EventTet/EventTetRankGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.customButton("btnClose", EventTetRankGUI.BTN_CLOSE, this.bg);
        this.pWeek = this.getControl("pWeek", this.bg);
        this.listButtonWeek = [];
        for (var i = EventTet.WEEK_START; i <= EventTet.WEEK_END; i++){
            var btnWeek = this.customButton("btnWeek" + i , EventTetRankGUI.BTN_WEEK_1 + i -1, this.pWeek);
            btnWeek.title = this.getControl("title", btnWeek);
            btnWeek.time = this.getControl("time", btnWeek);
            this.listButtonWeek.push(btnWeek);
        }

        this.pMyRank = this.getControl("pMyRank", this.bg);
        this.pJumpMyWeek = this.getControl("pJumpMyWeek", this.pMyRank);
        this.pJumpMyWeek.txtNote = this.getControl("txtNote", this.pJumpMyWeek);
        this.pJumpMyWeek.btnJump = this.customButton("btnJumpMyWeek", EventTetRankGUI.BTN_JUMP_TO_MY_WEEK, this.pJumpMyWeek);

        this.myRank = this.pMyRank.getChildByName("myRank");
        this.myRank.bg = this.getControl("bg", this.myRank);
        this.myRank.bg.setVisible(false);
        this.myRank.txtRank = this.getControl("txtRank", this.myRank);
        var avatar = this.getControl("avatar", this.myRank);
        avatar.setVisible(false);
        var spriteTemp = new cc.Sprite('Common/maskAvatar.png');
        this.myRank.avatar = engine.UIAvatar.createWithMask("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.myRank.avatar.setScale(avatar.getContentSize().width / (spriteTemp.getContentSize().width * 1.05));
        this.myRank.avatar.setPosition(avatar.getPosition());
        this.myRank.addChild(this.myRank.avatar, -1);
        this.myRank.txtName = this.getControl("txtName", this.myRank);
        this.myRank.imgMiniGift = this.getControl("imgGift", this.myRank);
        this.myRank.lbMyToken = this.getControl("lbToken", this.myRank);
        this.myRank.lbGift = this.getControl("lbGift", this.myRank);

        this.pRank = this.getControl("pRank", this.bg);
        this.uiTopRank = new cc.TableView(this, this.pRank.getContentSize());
        this.uiTopRank.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.uiTopRank.setVerticalFillOrder(0);
        this.uiTopRank.setDelegate(this);
        this.pRank.addChild(this.uiTopRank);
        this.pRank.txtNoInfo = this.getControl("txtNoInfo", this.pRank);
        this.pRank.txtNoInfo.setString(localized("EVENT_TET_HAVE_NO_INFO"));
        this.pRank.txtNoInfo.setVisible(false);
        this.itemSize = cc.size(721, 62);

        this.lbTime = this.getControl("lbTime", this._layout);

        this.btnEnterGuide = this.customButton("btnEnterGuide", EventTetRankGUI.BTN_ENTER_GUIDE, this.bg);
        this.btnNews = this.customButton("btnNews", EventTetRankGUI.BTN_NEWS, this.bg);
        this.updateRemainTime();
        this.enableFog();

    },

    update: function (dt) {
        this.updateRemainTime();
    },

    updateRemainTime: function() {
        if (eventTet.isEndEvent()){
            return;
        }
        if (eventTet.remainedTime === 0) {
            if (eventTet.checkWeek(EventTet.WEEK_END)) {
                this.lbTime.setString(localized("EVENT_TET_EVENT_TIMEOUT"));
                return;
            } else {
            }
        }
        var remainTimeStr = eventTet.getTimeRemainString();
        var strTitleTime = (eventTet.eventTime == EventTet.WEEK_END) ? localized("EVENT_TET_EVENT_TITLE_TIME_EVENT") : localized("EVENT_TET_TITLE_WEEK_REMAIN");
        strTitleTime = StringUtility.replaceAll(strTitleTime, "@week", eventTet.eventTime);
        strTitleTime = strTitleTime + " " + remainTimeStr;
        this.lbTime.setString(strTitleTime);
        this.lbTime.setVisible(true);
    },

    setUserInfo: function(){
        this.myRank.avatar.asyncExecuteWithUrl(GameData.getInstance().userData.uID, GameData.getInstance().userData.avatar);
        this.myRank.txtName.setString(gamedata.userData.displayName);
    },

    updateMyRank: function(week){
        week = week || this.currentTab + 1;

        var data = eventTet.getMyRankData(week);
        if (data){
            this.myRank.setVisible(true);
            this.pJumpMyWeek.setVisible(false);
            // cc.log("updateMyRank: " + JSON.stringify(data));
            var isTop = data.myRank > 0 && data.myRank <= EventTet.NUMBER_TOP_RANK;
            var rank = (isTop) ? data.myRank : EventTet.NUMBER_TOP_RANK + "+";
            this.myRank.imgMiniGift.setVisible(isTop);
            if (isTop){
                this.myRank.imgMiniGift.loadTexture(eventTet.getTopGiftImage(data.giftId));
                this.myRank.lbGift.setString(eventTet.giftNames[data.giftId]);
                this.myRank.imgMiniGift.setVisible(true);
                this.myRank.lbGift.setVisible(true);
            }
            else {
                this.myRank.imgMiniGift.setVisible(false);
                this.myRank.lbGift.setVisible(false);
            }
            this.myRank.txtRank.setString(rank);
            this.myRank.lbMyToken.setString(StringUtility.pointNumber(data.numToken));

            for (var i = EventTet.WEEK_START; i < week; i++){
                var oldData = eventTet.getMyRankData(i);
                if (oldData){
                    if (oldData.myRank !== 0 && oldData.myRank <= EventTet.NUMBER_TOP_RANK){
                        this.myRank.setVisible(false);
                        this.pJumpMyWeek.setVisible(true);
                        this.pJumpMyWeek.btnJump.setVisible(true);
                        this.myWeek = i;
                        var strOldRank = localized("EVENT_TET_HAVE_RANK_OLD_WEEK");
                        strOldRank = StringUtility.replaceAll(strOldRank, "@rank", oldData.myRank);
                        strOldRank = StringUtility.replaceAll(strOldRank, "@week", i);
                        this.pJumpMyWeek.txtNote.setString(strOldRank);
                    }
                }
            }
        } else {
            this.myRank.setVisible(false);
            this.pJumpMyWeek.setVisible(true);
            this.pJumpMyWeek.btnJump.setVisible(false);
            this.pJumpMyWeek.txtNote.setString(localized("EVENT_TET_HAVE_NO_INFO"));
        }
    },

    updateListTop: function(week){
        if (week != this.currentTab + 1)
            return;

        var data = eventTet.getTopRankData(week);
        this.dataTop = data;

        if (data){
            cc.log("VO DAY NE ");
            this.uiTopRank.reloadData();
            this.pRank.txtNoInfo.setVisible(data.topRanks.length === 0);
            this.uiTopRank.setVisible(true);
        } else {
            cc.log("VO DAY NE 1");
            this.pRank.txtNoInfo.setVisible(true);
            this.uiTopRank.setVisible(false);
        }

    },

    onEnterFinish: function(){
        if (eventTet.eventTime <= EventTet.WEEK_END ) {
            this.onButtonRelease(null, eventTet.eventTime + EventTetRankGUI.BTN_WEEK_1 - 1);
        }
        else {
            this.onButtonRelease(null, EventTet.WEEK_END + EventTetRankGUI.BTN_WEEK_1 - 1);
            this.lbTime.setString(localized("EVENT_TET_EVENT_TIMEOUT"));
        }

        var maxWeek = (eventTet.eventTime < EventTet.WEEK_END) ? eventTet.eventTime : EventTet.WEEK_END;
        for (var i = 1 ; i <= maxWeek; i++){
            var cmd3 = new CmdSendEventTetGetInfoTop();
            cmd3.putData(i);
            GameClient.getInstance().sendPacket(cmd3);

            var cmd2 = new CmdSendEventTetGetMyRank();
            cmd2.putData(i);
            GameClient.getInstance().sendPacket(cmd2);
        }

        this.loadDataEvent();
        this.setUserInfo();
        this.scheduleUpdate();
    },

    loadDataEvent: function(){
        var startWeeks = eventTet.eventWeeks;
        for (var i = 0; i < EventTet.WEEK_END; i++){
            var startWeek = startWeeks[i];
            var endWeek = eventTet.getEndWeek(startWeek);
            this.listButtonWeek[i].time.setString(startWeek + " - " + endWeek);
          //  this.listButtonWeek[i].title.setString(StringUtility.replaceAll(localized("EVENT_TET_WEEK"), "@week", i + 1));
        }
    },

    switchTabHistory: function(tab){
        this.currentTab = tab;
        for (var i = 0; i < EventTet.WEEK_END; i++){
            var btnWeek = this.listButtonWeek[i];
            if (btnWeek){
                btnWeek.loadTextures(EventTet.DEFAUT_UI + "Top/tab.png", EventTet.DEFAUT_UI + "Top/tab.png");
            }
        }
        this.listButtonWeek[tab].loadTextures(EventTet.DEFAUT_UI + "Top/tabSelect.png", EventTet.DEFAUT_UI + "Top/tabSelect.png");
        this.updateMyRank(tab + 1);
        this.updateListTop(tab + 1);
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case EventTetRankGUI.BTN_CLOSE:{
                this.onClose();
                break;
            }
            case EventTetRankGUI.BTN_WEEK_1:
            case EventTetRankGUI.BTN_WEEK_2:
            case EventTetRankGUI.BTN_WEEK_3:
            case EventTetRankGUI.BTN_WEEK_4:{
                this.switchTabHistory(id - EventTetRankGUI.BTN_WEEK_1);
                break;
            }
            case EventTetRankGUI.BTN_JUMP_TO_MY_WEEK:{
                if (this.myWeek >= EventTet.WEEK_START && this.myWeek < EventTet.WEEK_END){
                    this.switchTabHistory(this.myWeek - 1);
                } else {
                    Toast.makeToast(ToastFloat.MEDIUM, localized("EVENT_TET_BREAK_RESULT_0"));
                }
                break;
            }
            case EventTetRankGUI.BTN_NEWS:
            {
                NativeBridge.openWebView(eventTet.eventLinkNews);
                break;
            }
        }
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new EventTetRankItem();
        }

        if (this.dataTop){
            cell.setInfoRank(this.dataTop, idx)
        }

        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return this.itemSize;
    },

    tableCellTouched: function (table, cell) {
        var pos = cell.getParent().convertToNodeSpace(cell.getPosition());
        var idGift = this.dataTop.topAward[cell.getIdx()];
        // this.imgMiniGift.loadTexture(potBreaker.getTopGiftImageMini(data.topAward[idx]));
        var pos = cell.getPosInfo();
    },

    numberOfCellsInTableView: function (table) {
        var data = this.dataTop;
        return (data  && data.topRanks) ? data.topRanks.length : 0;
    },
});

EventTetRankGUI.BTN_CLOSE = 4;
EventTetRankGUI.BTN_WEEK_1 = 0;
EventTetRankGUI.BTN_WEEK_2 = 1;
EventTetRankGUI.BTN_WEEK_3 = 2;
EventTetRankGUI.BTN_WEEK_4 = 3;
EventTetRankGUI.BTN_JUMP_TO_MY_WEEK = 5;
EventTetRankGUI.BTN_ENTER_GUIDE = 6;
EventTetRankGUI.BTN_NEWS = 7;

EventTetRankGUI.className = "EventTetRankGUI";
EventTetRankGUI.TAG = 200;

var EventTetRankItem = cc.TableViewCell.extend({
    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/EventTet/EventTetRankItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.txtRank = ccui.Helper.seekWidgetByName(this._layout, "txtRank");
        this.txtName = ccui.Helper.seekWidgetByName(this._layout, "txtName");
        this.imgMiniGift = ccui.Helper.seekWidgetByName(this._layout, "imgGift");
        this.lbToken = ccui.Helper.seekWidgetByName(this._layout, "lbToken");
        this.lbGift = ccui.Helper.seekWidgetByName(this._layout, "lbGift");

        var avatar = ccui.Helper.seekWidgetByName(this._layout, "avatar");
        var avatarRim = ccui.Helper.seekWidgetByName(this._layout, "avatarRim");
        avatarRim.setLocalZOrder(1);
        avatar.setVisible(false);
        var spriteTemp = new cc.Sprite('Common/maskAvatar.png');
        this.uiAvatar = engine.UIAvatar.createWithMask("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.uiAvatar.setScale(avatar.getContentSize().width / (spriteTemp.getContentSize().width * 1.05));
        this.uiAvatar.setPosition(avatar.getPosition());
        this._layout.addChild(this.uiAvatar, 0);
    },

    getPosInfo: function () {
        var pos = this.imgMiniGift.getParent().convertToWorldSpace(this.imgMiniGift.getPosition());
        pos.x = pos.x + this.imgMiniGift.getContentSize().width * 0.4;
        pos.y = pos.y + this.imgMiniGift.getContentSize().height * 0.9;
        return pos;
    },

    setInfoRank: function (data, idx) {
        // cc.log("setInfoRank: " + JSON.stringify(data));
        if (data == null){
            return;
        }
        this.data = data;
        try {
            this.uiAvatar.asyncExecuteWithUrl(data.topUserIds[idx], data.topAvatars[idx]);
            this.txtRank.setString(data.topRanks[idx]);
            this.txtName.setString(data.topNames[idx]);
            this.lbToken.setString(data.topTokens[idx]);
            this.lbGift.setString(eventTet.giftNames[data.topAward[idx]]);
            cc.log("RESOURCE " + eventTet.getTopGiftImage(data.topAward[idx], data.week));
            this.imgMiniGift.loadTexture(eventTet.getTopGiftImage(data.topAward[idx], data.week));
        } catch (e) {
            cc.log("Error " + e.stack);
        }
    },
});
