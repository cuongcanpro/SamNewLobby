var PotBreakerScene = BaseLayer.extend({
    ctor: function () {
        this._super(PotBreakerScene.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerScene.json");
    },

    initGUI: function () {

        this.bg = this.getControl("bg");

        this.pCenter = this.getControl("pCenter", this.bg);

        this.pNPC = this.getControl("pNPC", this.bg);
        this.pNPC.setVisible(false);
        // var eff = resourceManager.loadDragonbone("bartender");
        // if (eff) {
        //     this.pNPC.addChild(eff);
        //     eff.setVisible(false);
        //     // eff.setPosition(300, 300);
        //     //eff.gotoAndPlay("xoclo", -1, -1, 0);
        // }
        // this.npc = eff;
        this.pNPC.setPosition(this.pCenter.getPositionX() + this.pCenter.getContentSize().width * this._scale * 0.5,
            this.pCenter.getPositionY() + this.pCenter.getContentSize().height * this._scale * 0.5);
        this.pNPC.setVisible(false);

        this.pCenter.pos = this.pCenter.getPosition();
        var pTopLeft = this.getControl("pTopLeft", this.bg);
        var pListButton = this.getControl("pListButton", pTopLeft);
        this.btnBack = this.customButton("btnBack", PotBreakerScene.BTN_BACK, pListButton);
        this.btnGuide = this.customButton("btnGuide", PotBreakerScene.BTN_GUIDE, pListButton);
        this.btnRank = this.customButton("btnRank", PotBreakerScene.BTN_RANK, pListButton);
        var pInfoRankThisWeek = this.getControl("pTop", this.bg);
        this.myRank = this.getControl("myRank", pInfoRankThisWeek);
        this.currentWeek = this.getControl("week", pInfoRankThisWeek);
        this.listTokenThisWeek = [];
        this.pMyToken = this.getControl("pMyToken", pInfoRankThisWeek);
        for (var i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
            var token = this.getControl("token" + i, this.pMyToken);
            token.numberToken = this.getControl("numberToken", token);
            this.listTokenThisWeek.push(token);
        }
        this.txtHadRankBefore = this.getControl("txtHadRankBefore", pInfoRankThisWeek);

        var pTopRight = this.getControl("pTopRight", this.bg);
        this.infoTicket = this.getControl("infoTicket", pTopRight);
        this.infoTicket.number = this.getControl("number", this.infoTicket);
        this.btnAddTicket = this.customButton("btnAddTicket", PotBreakerScene.BTN_ADD_TICKET, this.infoTicket, false);
        this.infoGold = this.getControl("infoGold", pTopRight);
        this.infoGold.number = this.getControl("number", this.infoGold);
        this.btnAddGold = this.customButton("btnAddTicket", PotBreakerScene.BTN_ADD_GOLD, this.infoGold, false);

        var iconGold = this.getControl("icon", this.infoGold);
        this.infoGold.posEffect = this.infoGold.convertToWorldSpace(iconGold.getPosition());
        if (!cc.sys.isNative) {
            this.infoGold.posEffect.x = this.infoGold.posEffect.x + 125;
        }
        // this.infoGold.posEffect = pTopRight.convertToWorldSpace(this.infoGold.getPosition());
        // this.infoGold.posEffect = cc.p(this.infoGold.posEffect.x + iconGold.getPositionX(), this.infoGold.posEffect.y + iconGold.getPositionY())

        var sprite = new cc.Sprite("res/Event/PotBreaker/PotBreakerUI/iconTokenSmall3.png");
        // this.addChild(sprite);
        // sprite.setPosition(this.infoGold.posEffect);

        //var pBottomRight = this.getControl("pBottomRight", this.bg);
        this.bgStorageToken = this.getControl("bgStorage", this.bg);
        this.listButtonToken = [];
        for (i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
            // var btnToken = this.getControl("btnToken" + i, this.bgStorageToken);
            var pToken = this.getControl("pToken" + i, this.bgStorageToken);
            var btnToken = this.customButton("btnToken", PotBreakerScene.BTN_TOKEN_0 + i, pToken, false);
            btnToken.progress = this.getControl("progress", pToken);
            btnToken.prize = this.getControl("prize", pToken);
            btnToken.imgToken = this.getControl("iconToken", pToken);
            btnToken.bgLight = this.getControl("bgLight", pToken);
            btnToken.id = 1000 + (i + 1) * 10;
            btnToken.numToken = 0;
            btnToken.prize.setString(StringUtility.formatNumberSymbol(potBreaker.getItemValue(btnToken.id)));
            this.listButtonToken.push(btnToken);
            // btnToken.setVisible(false);
            var panelEffect = this.getControl("panelEffect", pToken);
            this.effSpecial = resourceManager.loadDragonbone("Ruongqua");
            panelEffect.addChild(this.effSpecial);
            this.effSpecial.gotoAndPlay("" + (i + 1), -1, -1, -1);
            // this.effSpecial.setPosition(this.smallRock);
            // this.effSpecial.setVisible(false);


        }
        this.txtTitleTime = this.getControl("txtTitleTime", this.bg);
        this.txtTitleTime.setString(localized("POT_EVENT_TITLE_TIME_EVENT"));
        this.txtTime = this.getControl("txtTime", this.btnRank);
        this.btnCloseChangeLixi = this.customButton("btnCloseChangeLixi", PotBreakerScene.BTN_CLOSE_CHANGE_LIXI);
        this.btnCloseChangeLixi.setVisible(false);
        var bgMoreListenter = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return true;
            },
            onTouchMoved: function (touch, event) {
            },
            onTouchEnded: function (touch, event) {
                event.getCurrentTarget().onTouchBoard(touch);
            }
        });
        cc.eventManager.addListener(bgMoreListenter, this);

        this.pBoard = this.getControl("pBoard", this.pCenter);
        this.btnBreakAll = this.customButton("btnBreakAll", PotBreakerScene.BTN_BREAK_ALL);
        this.btnBreakAll.numPot = this.getControl("numPot", this.btnBreakAll);
        this.btnBreakAll.numTicket = this.getControl("numTicket", this.btnBreakAll);

        this.pBoard.removeAllChildren(true);
        this.pMapPot = new PotBreakerMapPot();
        this.pBoard.addChild(this.pMapPot);

        var btnCheat = this.customButton("btnCheat", PotBreakerScene.BTN_CHEAT, pTopRight);
        btnCheat.setVisible(Config.ENABLE_CHEAT);
        this.pCheat = this.getControl("pCheat");
        this.pCheat.setVisible(false);
        this.customButton("btnResetEvent", PotBreakerScene.BTN_RESET_EVENT, this.pCheat);
        this.customButton("btnCheatTicket", PotBreakerScene.BTN_CHEAT_NUM_TICKET, this.pCheat);
        this.txtCheatNumTicket = this.getControl("txtCheatNumTicket", this.pCheat);
        this.customButton("btnCheatToken", PotBreakerScene.BTN_CHEAT_NUM_TOKEN, this.pCheat);
        this.txtCheatNumToken = this.getControl("txtCheatNumToken", this.pCheat);
        this.txtNameToken = this.getControl("txtNameToken", this.pCheat);
        this.txtExp= this.getControl("txtExp", this.pCheat);

        this.bubbleText = new PotBreakerBubble();
        this._layout.addChild(this.bubbleText);
        this.bubbleText.setPosition(this.pCenter.getPositionX() + this.pCenter.getContentSize().width * this._scale * 0.6,
            this.pCenter.getPositionY() + this.pCenter.getContentSize().height * 0.85 * this._scale);

        this.pChangeLixiLayer = new PotBreakerChangeLixiLayer();
        this.pChangeLixiLayer.setVisible(false);
        this._layout.addChild(this.pChangeLixiLayer);

        this.pEffectBreak = this.getControl("pEffectBreak");
        this.listCudgel = [];
        // var effectName = "Dapnieu";
        // var effectLink = PotBreaker.DEFAUT_FOLDER_RES + effectName + "/" + effectName;

        this.pGiftFall = this.getControl("pGiftFall", this.bg);
        this.pGround = this.getControl("pGround", this.bg);

        this.pFlower = this.getControl("pFlower", this.bg);

        this.pLixiFly = this.getControl("pLixiFly", this.bg);
        this.numberLixi = this.getControl("numberLixi", this.pLixiFly);
        this.numberLixi.retain();
        this.numberLixi.setVisible(false);

        for (i = 0; i < PotBreaker.NUMBER_POT_IN_MAP; i++){
            try {
                var eff = resourceManager.loadDragonbone("Cuoc");
                if (eff) {
                    this.pEffectBreak.addChild(eff);
                    var pot = this.pMapPot.listPots[i];
                    var potPosition = pot.getParent().convertToWorldSpace(pot.getPosition());
                    eff.setPosition(potPosition.x + 20, potPosition.y);
                    eff.setVisible(false);
                    eff.setCompleteListener(function () {
                        this.runAction(cc.fadeOut(0.5));
                    }.bind(eff));
                    //eff.gotoAndPlay("idle", 0, 1, 1);
                    this.listCudgel.push(eff);
                } else {
                    cc.log("khong co gay");
                }

            } catch (e) {
                cc.error("loi khoi tao gay: ", e);
            }
        }

        var eff = resourceManager.loadDragonbone("LightBg");
        if (eff) {
            this.addChild(eff);
            eff.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.6);
            eff.gotoAndPlay("1", -1, -1, 0);
            this.effectLight = eff;
            this.runEffectLight();
        }
    },

    runEffectLight: function () {
        var randomX = cc.winSize.width * (0.2 + Math.random() * 0.4);
        this.effectLight.setPosition(randomX, cc.winSize.height * 0.6);
        this.effectLight.setOpacity(0);
        this.effectLight.runAction(cc.sequence(cc.fadeIn(0.5), cc.delayTime(3.0), cc.fadeOut(0.5), cc.callFunc(this.runEffectLight.bind(this))));
    },

    onTouchBoard: function (touch) {
        cc.log("ON TOUCH BOARD ");
        this.pChangeLixiLayer.hideLixi();
    },

    onEnterFinish: function () {
        // return;


        potBreaker.potBreakerScene = this;

        sceneMgr.addLoading(localized("LOADING"), true);

        PotBreakerSound.playLobby();
        this.isWaitingResult = false;
        //
        // this.pMore.stopAllActions();
        // this.pMore.setPositionX(this.pMore.posHide);
        // this.pMore.visibleState = false;

        this.onUpdateGUI();
        // this.doEffect();
        this.enableRollButton(false);
        setTimeout(function () {
            var cmd = new CmdSendPotBreakerOpen();
            cmd.putData(1);
            GameClient.getInstance().sendPacket(cmd);
        }, 500);

        var maxWeek = (potBreaker.eventTime < PotBreaker.WEEK_END) ? potBreaker.eventTime : PotBreaker.WEEK_END;
        for (var i = PotBreaker.WEEK_START; i <= maxWeek; i++){
            var cmd2 = new CmdSendPotBreakerGetMyRank();
            cmd2.putData(i);
            GameClient.getInstance().sendPacket(cmd2);
        }

        this.pCheat.setVisible(false);
        this.btnCloseChangeLixi.setVisible(false);
        this.pChangeLixiLayer.setVisible(false);
        this.pGiftFall.removeAllChildren(true);
        this.scheduleUpdate();
        this.setBackEnable(true);

        this.pBoard.removeAllChildren();
        var timeMove = 1.5;
        var windowWidth = cc.director.getWinSize().width;
        //var actionMove = new cc.EaseExponentialInOut(cc.moveTo(timeMove, this.pCenter.getPositionX(),  this.pCenter.getPositionY()));
        this.pMapPot = new PotBreakerMapPot();
        this.pBoard.addChild(this.pMapPot);

        for (i = 0; i < PotBreaker.NUMBER_POT_IN_MAP; i++){
            var pot = this.pMapPot.listPots[i];
            var potPosition = pot.getParent().convertToWorldSpace(pot.getPosition());
            this.listCudgel[i].setPosition(potPosition.x + 20, potPosition.y);
            this.listCudgel[i].setVisible(false);
        }

        //this.pCenter.setPositionX(windowWidth + this.pCenter.getContentSize().width * this.pCenter.getScale());
        var actionShakePots2 = cc.callFunc(function () {
            this.pMapPot.shakeAllPots();
        }.bind(this));
        //this.pCenter.runAction(cc.sequence(actionShakePots2, actionMove.clone()));
        //this.pCenter.runAction(cc.sequence(
        //    cc.delayTime(1.3),
        //    cc.spawn(cc.scaleTo(0.3, 0.95, 0.95), cc.rotateBy(0.3, -1)),
        //    cc.spawn(new cc.EaseBounceOut(cc.scaleTo(0.5, 1.0, 1.0)), new cc.EaseBounceOut(cc.rotateTo(0.5, 0)))
        //));

        // var actionShowNPC = cc.callFunc(function () {
        //     this.pNPC.setVisible(true);
        //     this.npc.gotoAndPlay("jump", -1, -1, 0);
        // }.bind(this));

        var actionShowState = cc.callFunc(function () {
        }.bind(this));

        this.pNPC.setVisible(false);
      //  this.pNPC.runAction(cc.sequence(cc.delayTime(1.0), actionShowNPC, cc.delayTime(0.5), cc.callFunc(this.showRandomState.bind(this))));

        this.countTimeCreateFlower = -1;
        this.deltaTimeCreateFlower = 0.2;
        this.pFlower.removeAllChildren(true);
        this.pFlowerSize = this.pFlower.getContentSize();

        this.pLixiFly.setOpacity(0);
        this.pLixiFly.removeAllChildren(false);
        this.pLixiFly.addChild(this.numberLixi);
        this.numberLixi.setVisible(false);

        this.bubbleText.setOpacity(0);
        this.bubbleText.showText();
        //this.bubbleText.runAction(cc.sequence(cc.delayTime(3.0), cc.fadeOut(0.5), this.bubbleText.showText.bind(this.bubbleText)));

        this.playEfxStardust();
    },

    showRandomState: function () {
        return;
        var random = cc.random0To1();
        if (random < 0.5) {
            this.npc.gotoAndPlay("idle", -1, -1, 0);
        }
        else if (random < 0.65) {
            this.npc.gotoAndPlay("wave", -1, -1, 0);
        }
        else if (random < 0.8) {
            this.npc.gotoAndPlay("quaytay", -1, -1, 0);
        }
        else {
            this.npc.gotoAndPlay("xoclo", -1, -1, 0);
        }
       // this.pNPC.runAction(cc.sequence(cc.delayTime(3.0), cc.callFunc(this.showRandomState.bind(this))));
    },

    onExit: function(){
        this._super();
        this.unscheduleUpdate();
        potBreaker.potBreakerScene = null;
        PotBreakerSound.closeLobby();
        this.pMapPot.removeFromParent(true);
      //  this.pNPC.stopAllActions();
    },

    updateEventInfo: function () {

        this.isEventTime = potBreaker.isInEvent();
        this.infoTicket.number.setString(StringUtility.pointNumber(potBreaker.numberTicket));


        if (!this.isWaitingResult){
            for (var i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
                var tokenInfo = null;
                for (var j in potBreaker.tokenInfos){
                    if (potBreaker.tokenInfos[j].ids === this.listButtonToken[i].id){
                        tokenInfo = potBreaker.tokenInfos[j];
                        break;
                    }
                }
                var numToken = tokenInfo ? tokenInfo.numberToken : 0;
                var numberTokenNeedToClaim =  tokenInfo ? tokenInfo.numberTokenNeedToClaim : PotBreaker.NUMBER_TOKEN_NEED_TO_CLAIM;
                this.listButtonToken[i].progress.setString(numToken + "/" + numberTokenNeedToClaim);
                this.listButtonToken[i].numToken = numToken;
            }

            this.loadBoardPot();
            this.enableRollButton(true);
            this.updateMyRankInfo();
            this.checkEnableToken();
            this.infoGold.number.setString(StringUtility.formatNumberSymbol(gamedata.userData.bean));
        }
    },

    updateMyRankInfo: function(){
        var maxWeek = (potBreaker.eventTime < PotBreaker.WEEK_END) ? potBreaker.eventTime : PotBreaker.WEEK_END;
        // var infoThisWeek = {};
        // for (var i = 0; i < maxWeek; i++){
        //     if (potBreaker.historyTopRank && potBreaker.historyTopRank[i] && potBreaker.historyTopRank[i].week === potBreaker.eventTime){
        //         infoThisWeek = potBreaker.historyTopRank[i];
        //         break;
        //     }
        // }

        if (this.isWaitingResult){
            return;
        }

        this.currentWeek.setString(StringUtility.replaceAll(localized("POT_WEEK_RANK"), "@week", potBreaker.eventTime));

        this.pMyToken.setVisible(true);
        this.txtHadRankBefore.setVisible(false);
        var myRank = (potBreaker.myCurRank > 0 && potBreaker.myCurRank <= PotBreaker.NUMBER_TOP_RANK) ? potBreaker.myCurRank : PotBreaker.NUMBER_TOP_RANK + "+";
        this.myRank.setString(StringUtility.replaceAll(localized("POT_MY_RANK"), "@my_rank", myRank));
        var maxWidth = 0;
        for (i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
            var strNumToken = StringUtility.pointNumber(potBreaker.curTotalNumberToken[i]);
            this.listTokenThisWeek[i].numberToken.setString(strNumToken);
            var numTokenTextTemp = BaseLayer.createLabelText(strNumToken);
            numTokenTextTemp.setFontSize(this.listTokenThisWeek[i].numberToken.getFontSize());
            var strWidth = numTokenTextTemp.getBoundingBox().width;
            if (strWidth > maxWidth){
                maxWidth = strWidth;
            }
        }

        // dich chuyen dan cac token dang sau theo khoang cach lon nhat
        for (i = 1; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
            var preToken = this.listTokenThisWeek[i-1];
            this.listTokenThisWeek[i].setPositionX(preToken.getPositionX() + maxWidth + preToken.getContentSize().width + 10);
        }

        for (i = PotBreaker.WEEK_START; i < maxWeek; i++) {
            var oldData = potBreaker.getMyRankData(i);
            if (oldData){
                if (oldData.myRank !== 0 && oldData.myRank <= PotBreaker.NUMBER_TOP_RANK){
                    this.myRank.setString(StringUtility.replaceAll(localized("POT_MY_RANK"), "@my_rank", "--"));
                    this.pMyToken.setVisible(false);
                    this.txtHadRankBefore.setVisible(true);
                    var strOldRank = localized("POT_HAVE_RANK_OLD_WEEK");
                    strOldRank = StringUtility.replaceAll(strOldRank, "@rank", oldData.myRank);
                    strOldRank = StringUtility.replaceAll(strOldRank, "@week", i);
                    this.txtHadRankBefore.setString(strOldRank);
                    break;
                }
            }
        }

        var rankGui = sceneMgr.getGUI(PotBreaker.GUI_RANK);
        if (rankGui){
            rankGui.updateMyRank();
        }
    },

    checkEnableToken: function(){
        for (var i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
            var tokenInfo = null;
            for (var j in potBreaker.tokenInfos){
                if (potBreaker.tokenInfos[j].ids === this.listButtonToken[i].id){
                    tokenInfo = potBreaker.tokenInfos[j];
                    break;
                }
            }
            var button = this.listButtonToken[i];
            button.stopAllActions();
            button.setRotation(0);
            button.bgLight.setVisible(false);
            button.bgLight.stopAllActions();
            if (tokenInfo){
                if (tokenInfo.numberToken >= tokenInfo.numberTokenNeedToClaim){
                    button.bgLight.setVisible(true);
                    button.bgLight.runAction(cc.repeatForever(cc.rotateBy(0.5, 30)));
                    // var timeShake = 0.1;
                    // var angle = 5;
                    // var actionShake1 = new cc.EaseExponentialInOut(cc.rotateTo(timeShake, angle));
                    // var actionShake2 = new cc.EaseExponentialInOut(cc.rotateTo(timeShake, -angle));
                    // var actionShake0 = new cc.EaseExponentialInOut(cc.rotateTo(timeShake, 0));
                    // var actionScale1 = new cc.EaseBackOut(cc.scaleTo(timeShake, 1.1));
                    // var actionScale2 = new cc.EaseBackIn(cc.scaleTo(timeShake, 1));
                    // var actions = [];
                    // actions.push(actionScale1);
                    // actions.push(actionScale2);
                    // actions.push(actionScale1.clone());
                    // actions.push(actionScale2.clone());
                    // actions.push(actionShake1);
                    // actions.push(actionShake2);
                    // actions.push(actionShake1.clone());
                    // actions.push(actionShake2.clone());
                    // actions.push(actionShake0);
                    // actions.push(cc.delayTime(2));
                    //
                    // button.runAction(cc.sequence(actions).repeatForever());
                }
            }
        }
    },

    onUpdateGUI: function(){
        this.updateUserInfo();
    },

    updateUserInfo: function () {
        if (!this.isWaitingResult) {
            this.infoGold.number.setString(StringUtility.formatNumberSymbol(gamedata.userData.bean));
            this.infoGold.saveGold = gamedata.userData.bean;
        }
    },

    updateRemainTime: function() {
        if (potBreaker.isEndEvent()){
            return;
        }
        if (potBreaker.remainedTime === 0) {
            //if (potBreaker.checkWeek(PotBreaker.WEEK_END)) {
            this.txtTitleTime.setString(localized("POT_EVENT_TIMEOUT"));
            this.txtTime.setVisible(false);
            this.txtTitleTime.setVisible(true);
            potBreaker.eventTime ++;
            sceneMgr.showOkDialogWithAction(LocalizedString.to("POT_EVENT_TIMEOUT"), this, function () {
                sceneMgr.openScene(LobbyScene.className);
                setTimeout(function () {
                    var cmd = new CmdSendPotBreaker();
                    GameClient.getInstance().sendPacket(cmd);
                }, 5000);
            });
            return;
            //} else {
            //    potBreaker.remainedTime = 7 * 24 * 60 * 60 * 1000 - 1;
            //    potBreaker.eventTime ++;
            //}
        }

        var remainTimeStr = potBreaker.getTimeRemainString();

        this.txtTime.setString(remainTimeStr);
        this.txtTitleTime.setVisible(true);
        var strTitleTime = (potBreaker.checkWeek(PotBreaker.WEEK_END)) ? localized("POT_EVENT_TITLE_TIME_EVENT") : localized("POT_TITLE_WEEK_REMAIN");
        strTitleTime = StringUtility.replaceAll(strTitleTime, "@week", potBreaker.eventTime);
        this.txtTitleTime.setString(strTitleTime);
        this.txtTitleTime.setVisible(false);
    },

    loadBoardPot: function () {
        if (this.isBreak && (potBreaker.mapInfo.indexOf(PotBreaker.TYPE_BROKEN_POT) < 0 && potBreaker.mapInfo.indexOf(PotBreaker.TYPE_GOLD_BROKEN_POT) < 0)){
            this.resetMapInfo();
            return;
        }
        this.pMapPot.updateMapInfo();
    },

    onRollResult: function (cmd) {
        // cc.log("+++TimeBreak Response : " + (new Date().getTime() - this.waitBreakTime));

        switch (cmd.result) {
            case 1:
            {
                this.giftsResult = cmd.giftsResult;
                this.numGifts = cmd.numGifts;
                this.listBrokenPot = cmd.listBrokenPot;
                this.isSpecialPot = cmd.isSpecialPot;
                this.isBreak = true;
                // truong hop dap ca map
                if (cmd.rollType >= PotBreaker.ID_BREAK_MAX - 1){
                    this.listBrokenPot = [];
                    for (var i = 0; i < PotBreaker.NUMBER_POT_IN_MAP; i++){
                        this.listBrokenPot.push(i);
                    }
                }
                // truong hop doi li xi
                if (cmd.giftsResult[0] === 0){
                    this.isBreak = false;
                }
                this.showBreak();
                return;
            }
            case 0:
            case 2:
            case 4:
            case 6:
            case 8:
            case 9:
            case 10:
            {
                this.isWaitingResult = false;
                this.enableRollButton(true);
                this.updateEventInfo();
                sceneMgr.showOKDialog(LocalizedString.to("POT_BREAK_RESULT_" + cmd.result));
                break;
            }
            case 3:
            case 5:
            {
                this.isWaitingResult = false;
                sceneMgr.showOkDialogWithAction(LocalizedString.to("POT_BREAK_RESULT_5"), this, function (btnID) {
                    if (btnID == Dialog.BTN_OK) {
                        if (potBreaker.isEndEvent()){
                            sceneMgr.openScene(LobbyScene.className);
                        }
                    }
                });
                this.enableRollButton(true);
                this.updateEventInfo();
                break;
            }
        }
    },

    showBreak: function(){
        var delay = this.pMapPot.doBreakPot(this.listBrokenPot, this.isSpecialPot, this.giftsResult, this.numGifts);
        this.collectGiftOnGround(delay);
    },

    onShowResult: function (delay) {
        setTimeout(function() {
            var desPos = cc.p(cc.director.getWinSize().width * 0.95, cc.director.getWinSize().height / 2);
            var scene = sceneMgr.getRunningScene().getMainLayer();
            if (!(scene instanceof PotBreakerScene)){
                return;
            }
            var gui = sceneMgr.openGUI(PotBreakerOpenResultGUI.className, PotBreaker.GUI_GIFT_RESULT, PotBreaker.GUI_GIFT_RESULT);
            if (gui) {
                gui.openGift(this.giftsResult, this.numGifts, desPos, this.infoGold.posEffect, false);
            }
        }.bind(this),delay * 1000);
    },

    onReceiveToken: function(data, idGift){
        var btnToken = null;
        var delayTime = 1;
        for (var i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
            if (this.listButtonToken[i].id === idGift){
                btnToken = this.listButtonToken[i];
                break;
            }
        }
        if (btnToken){
            var tokenInfo = null;
            for (var j in potBreaker.tokenInfos){
                if (potBreaker.tokenInfos[j].ids === btnToken.id){
                    tokenInfo = potBreaker.tokenInfos[j];
                    break;
                }
            }
            cc.log("onReceiveToken2: ", JSON.stringify(tokenInfo));
            this.pLixiFly.setOpacity(200);
            if (tokenInfo){
                var numberLixi = Math.floor(btnToken.numToken / tokenInfo.numberTokenNeedToClaim);
                var timeMove = 0.5;
                var timeScale = 0.15;
                var miniDelay = 0.14;
                var numTokenRemain = tokenInfo.numberToken % tokenInfo.numberTokenNeedToClaim;
                btnToken.progress.setString(numTokenRemain + "/" + tokenInfo.numberTokenNeedToClaim);
                btnToken.stopAllActions();
                this.numberLixi.setString(1);
                this.numberLixi.setVisible(false);
                this.numberLixi.setOpacity(255);
                for (i = 0; i < numberLixi; i++){
                    var lixi = new cc.Sprite(PotBreaker.DEFAUT_FOLDER_UI + "token" + potBreaker.getTokenLocalId(btnToken.id) + ".png");
                    lixi.setPosition(btnToken.getParent().convertToWorldSpace(btnToken.getPosition()));
                    this.pLixiFly.addChild(lixi);
                    lixi.setLocalZOrder(numberLixi - i);
                    var targetPos = cc.p(cc.winSize.width/2, cc.winSize.height/2);

                    var startPos = lixi.getPosition();
                    var posCenter = cc.p(targetPos.x + (startPos.x - targetPos.x) * 3/4, cc.winSize.height/2);

                    var actionMove = new cc.EaseExponentialOut(new cc.BezierTo(timeMove, [startPos, posCenter, targetPos]));

                    if (i === numberLixi - 1){
                        timeScale = 1;
                    }
                    var actionScale = cc.scaleTo(timeScale, 1.35);
                    var actionFadeOut = cc.fadeOut(timeScale);

                    var dataLixi = {target: this.numberLixi, numLixi: i + 1, time: timeScale};
                    var actionJumpNumber = cc.callFunc(function () {
                        this.target.setVisible(true);
                        this.target.setString(this.numLixi);
                    }.bind(dataLixi));

                    var actionNumLixiFadeOut = cc.callFunc(function () {
                        if (this.numLixi === numberLixi){
                            this.target.runAction(cc.fadeOut(this.time));
                        }
                    }.bind(dataLixi));
                    lixi.runAction(cc.sequence(cc.delayTime(miniDelay * i), cc.spawn(actionMove,
                        cc.sequence(cc.delayTime(timeMove * 2 / 3), actionJumpNumber)),
                        cc.spawn(actionFadeOut, actionScale, actionNumLixiFadeOut), cc.removeSelf(true)));
                }

                delayTime += miniDelay * numberLixi;
            }
        }
        setTimeout(function () {
            this.pLixiFly.runAction(cc.sequence(cc.delayTime(1), cc.fadeOut(0.5)));
            var desPos = cc.p(cc.director.getWinSize().width * 0.95, cc.director.getWinSize().height / 2);

            var gui = sceneMgr.openGUI(PotBreakerOpenResultGUI.className, PotBreaker.GUI_GIFT_RESULT, PotBreaker.GUI_GIFT_RESULT);
            if (gui) {
                gui.openGift(data.giftsResult, data.numGifts, desPos, this.infoGold.posEffect, true);
            }
        }.bind(this), delayTime * 1000);
    },

    onFinishEffectShowResult: function(){
        this.isWaitingResult = false;

        this.enableRollButton(true);
        this.updateEventInfo();
        this.updateUserInfo();
    },

    onEffectGetMoneyItem: function(deltaGold){
        // cc.log("onEffectGetMoneyItem: ", deltaGold);
        this.infoGold.saveGold += deltaGold;
        this.infoGold.number.setString(StringUtility.formatNumberSymbol(this.infoGold.saveGold));
    },

    onEffectUpdateToken: function(id){
        var idToken = potBreaker.getTokenLocalId(id);
        var btnToken =  this.listButtonToken[idToken];
        if (!btnToken) return;
        btnToken.numToken++;
        var numberTokenNeedToClaim = PotBreaker.NUMBER_TOKEN_NEED_TO_CLAIM;
        btnToken.progress.setString(btnToken.numToken + "/" + numberTokenNeedToClaim);
    },

    enableRollButton: function (enable) {
        var color = cc.color(255, 255, 255, 255);
        var action = false;
        var waitRoll = false;
        if (!enable) {
            color = cc.color(70, 70, 70, 255);
            action = false;
            waitRoll = true;
        }

        this.btnBreakAll.setPressedActionEnabled(action);
        this.btnBreakAll.setColor(color);
        this.btnBreakAll.setVisible(enable);

        var numTicketRoll = potBreaker.getCostRoll();
        this.btnBreakAll.numPot.setString(numTicketRoll);
        this.btnBreakAll.numTicket.setString(numTicketRoll);

        this.btnBreakAll.enable = enable;

        if (waitRoll) {
            this.btnBreakAll.setVisible(false);
        }
    },

    onEffectGiftFall: function(potId, giftIds){
        // cc.log("onEffectGiftFall: ", JSON.stringify(giftIds));
        potId = potId|| 0;
        giftIds = giftIds || [];

        if (giftIds.length === 0){
            return;
        }
        var i;
        var potPos = cc.p(cc.winSize.width/2, cc.winSize.height);
        if (this.pMapPot && this.pMapPot.listPots[potId]){
            var pot = this.pMapPot.listPots[potId];
            potPos = pot.getParent().convertToWorldSpace(pot.getPosition());
            potPos.y = potPos.y + pot.rock.getContentSize().height * 0.3;
        }
        for (i = 0; i < giftIds.length; i++){
            var isToken = potBreaker.isItemStored(giftIds[i]);
            if (isToken){
                this.dropToken(giftIds[i], potPos, potId);
            } else {
                var gold = potBreaker.getItemValue(giftIds[i]);
                this.dropGold(gold, potPos, potId, giftIds.length > 1);
            }
        }
    },

    dropGold: function(gold, posStart, potId, isBreakMax){
        // cc.log("dropGold: ", JSON.stringify(arguments));
        var numEffect = potBreaker.getNumberGoldEffect(gold, isBreakMax);
        for (var i = 0; i < numEffect; i++) {
            var sp = new PotBreakerCoinEffect();
            this.pGiftFall.addChild(sp);
            var potLine = Math.floor((PotBreaker.NUMBER_POT_IN_MAP - potId - 1) / 3) + 1;
            var maxJumpX = potLine * 150;
            sp.startFall(posStart, maxJumpX, 0.05 * i);
            sp.start();
            sp.setScale(0.4);
            sp.setTag(1);
        }
    },

    dropToken: function(tokenId, posStart, potId){
        var token = new PotBreakerCoinEffect(potBreaker.getPieceImage(tokenId));
        this.pGiftFall.addChild(token);
        token.setVisible(true);
        token.setScale(0.37);
        token.setTag(tokenId);
        var potLine = Math.floor((PotBreaker.NUMBER_POT_IN_MAP - potId - 1) / 3) + 1;
        var maxJumpX = potLine * 150;
        token.startFall(posStart, maxJumpX, 0);
    },

    collectGiftOnGround: function(delayTime){
        setTimeout(function () {
            var allGifts = this.pGiftFall.getChildren();

            var delay = 0;
            var delta = 0.07;
            for (var i = 0; i < allGifts.length; i++) {
                var gift = allGifts[i];
                if (gift) {
                    try {
                        if (gift.getTag() < PotBreaker.ITEM_STORED) { // tag cua gold
                            var randomX = 20 - Math.random() * 40;
                            var randomY = 20 - Math.random() * 40;
                            var targetX = cc.winSize.width / 2 + randomX;
                            var targetY = cc.winSize.height / 2 + randomY;
                            delay += (allGifts.length > 10) ? 0.0002 : delta;
                        } else {
                            targetX = gift.getPositionX();
                            targetY = cc.winSize.height / 2;
                            delay += (allGifts.length > 10) ? delta / 10 : delta;
                        }

                        var timeMove = 0.5;
                        var actionMoveToCenter = new cc.EaseSineOut(cc.moveTo(timeMove, targetX, targetY));
                        var actionFadeOut = cc.fadeOut(timeMove * 0.4);
                        gift.runAction(cc.sequence(cc.delayTime(delay), cc.spawn(actionMoveToCenter, cc.sequence(cc.delayTime(timeMove * 0.5), actionFadeOut, cc.removeSelf(true)))));

                    } catch (e) {
                        cc.error(e);
                    }
                }
            }

            this.onShowResult(delay * 0.5);
        }.bind(this), delayTime * 1000);
    },

    onButtonRelease: function (btn, id) {
        cc.log("ON BUTTON RELEASE ");
        if (id != PotBreakerScene.BTN_TOKEN_0 && id != PotBreakerScene.BTN_TOKEN_1 && PotBreakerScene.BTN_TOKEN_2 != id && PotBreakerScene.BTN_TOKEN_3 != id) {
            this.pChangeLixiLayer.hideLixi();
        }

        switch (id) {
            case PotBreakerScene.BTN_BACK:{
                this.onBack();
                break;
            }
            case PotBreakerScene.BTN_BREAK_ALL:{
                // var data =  {"result":1,"giftsResult":[1030],"numGifts":[1],"listBrokenPot":[],"isSpecialPot":[]};
                // potBreaker.onReceiveToken(data);
                // var data =  {"unreceivedInGiftId":[1010, 1020],"unreceivedTopGiftId": -1};
                // potBreaker.notifyPotBreakerAction(data);
                // break;

                // var data = {"result":1,"isTop":0,"idGift":1040,"bonusGold":10000000};
                // potBreaker.onChangeAward(data);
                // break;

                var breakType = potBreaker.getCostRoll();
                if (breakType > PotBreaker.NUMBER_POT_IN_MAP){
                    breakType = PotBreaker.ID_BREAK_MAX;
                }
                var pos = -128;
                if (breakType === PotBreaker.ID_BREAK_ONCE){
                    pos = potBreaker.getLastNormalPotId();
                }
                potBreaker.breakPot(breakType, pos);

                this.pMapPot.saveLastTimeGuide();
                this.pMapPot.clearGuide();
                break;
            }
            case PotBreakerScene.BTN_CHEAT:{
                // this.collectGiftOnGround();
                // break;
                if (!Config.ENABLE_CHEAT) return;

                this.pCheat.setVisible(!this.pCheat.isVisible());
                break;
            }
            case PotBreakerScene.BTN_CHEAT_NUM_TICKET:{
                if (!Config.ENABLE_CHEAT) return;

                var numAddTicket = parseInt(this.txtCheatNumTicket.getString());
                var numExp = parseInt(this.txtExp.getString());
                var pCheatTicket = new CmdSendPotBreakerCheatTicket();
                cc.log("EXP " + numExp);
                pCheatTicket.putData(numAddTicket, numExp);
                GameClient.getInstance().sendPacket(pCheatTicket);
                break;
            }
            case PotBreakerScene.BTN_RESET_EVENT:{
                if (!Config.ENABLE_CHEAT) return;

                var pResetEvent = new CmdSendPotBreakerCheatReset();
                GameClient.getInstance().sendPacket(pResetEvent);
                Toast.makeToast(ToastFloat.SHORT, "Send reset event success");
                break;
            }
            case PotBreakerScene.BTN_TOKEN_0:
            case PotBreakerScene.BTN_TOKEN_1:
            case PotBreakerScene.BTN_TOKEN_2:
            case PotBreakerScene.BTN_TOKEN_3: {
                this.cheatTokenId = btn.id;
                this.txtNameToken.setString(potBreaker.getItemName(btn.id));
                if (this.pCheat.isVisible() && Config.ENABLE_CHEAT){
                    return;
                }
                this.pChangeLixiLayer.setVisible(true);
                this.btnCloseChangeLixi.setVisible(false);
                this.pChangeLixiLayer.setInfo(btn.id);
                break;
            }
            case PotBreakerScene.BTN_CLOSE_CHANGE_LIXI:{
                this.btnCloseChangeLixi.setVisible(false);
                // this.pChangeLixiLayer.setVisible(false);
                this.pChangeLixiLayer.hideLixi();
                break;
            }
            case PotBreakerScene.BTN_RANK:{
                sceneMgr.openGUI(PotBreakerRankGUI.className, PotBreaker.GUI_RANK, PotBreaker.GUI_RANK);
                break;
            }
            case PotBreakerScene.BTN_GUIDE:{
                sceneMgr.openGUI(PotBreakerHelpGUI.className, PotBreaker.GUI_HELP, PotBreaker.GUI_HELP);
                break;
            }
            case PotBreakerScene.BTN_CHEAT_NUM_TOKEN:{
                if (!Config.ENABLE_CHEAT) return;

                this.cheatTokenId = this.cheatTokenId || 1010;
                var numAddToken = parseInt(this.txtCheatNumToken.getString());
                var pCheatToken = new CmdSendPotBreakerCheatToken();
                pCheatToken.putData(this.cheatTokenId, numAddToken);
                GameClient.getInstance().sendPacket(pCheatToken);
                break;
            }
            case PotBreakerScene.BTN_ADD_TICKET:{
                gamedata.openShop(PotBreakerScene.className);
                break;
            }
            case PotBreakerScene.BTN_ADD_GOLD:{
                gamedata.openShop(PotBreakerScene.className);
                break;
            }
        }
    },

    resetMapInfo: function(){
        this.isBreak = false;
        var oldMap = this.pMapPot;
        var timeMove = 1.5;
        var timeShake = 0.4;
        var windowWidth = cc.director.getWinSize().width;
        var actionMove = new cc.EaseExponentialInOut(cc.moveBy(timeMove, 0, -cc.winSize.height * 0.8));
        var actionShakePots = cc.callFunc(function () {
            oldMap.shakeAllPots();
        });
        oldMap.runAction(cc.spawn(cc.sequence(actionMove, cc.removeSelf(true)), cc.sequence(cc.delayTime(timeShake), actionShakePots)));

        this.pMapPot = new PotBreakerMapPot();
        this.pBoard.addChild(this.pMapPot);
        //this.pMapPot.setPositionX(windowWidth);
        // var actionShakePots2 = cc.callFunc(function () {
        //     this.pMapPot.shakeAllPots();
        // }.bind(this));
        // this.pMapPot.runAction(cc.sequence(cc.delayTime(0.3), actionShakePots2));
        this.pMapPot.showResetMap();
    },

    plowFlower: function(winSpeed){
        try {
            var flowers = this.pFlower.getChildren();
            for (var i = 0; i < flowers.length; i++){
                flowers[i].updateSpeedX(winSpeed / 2 + Math.random() * winSpeed / 2);
            }
        } catch (e) {
            cc.error("plowFlower: " + e);
        }
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable()) return;

        sceneMgr.openScene(LobbyScene.className);
    },

    update: function (dt) {
        if (potBreaker.remainedTime > 0){
            potBreaker.remainedTime -= dt * 1000;
        } else {
            potBreaker.remainedTime = 0;
        }
        this.updateRemainTime();
        this.bubbleText.updateBubble(dt);

        // this.countTimeCreateFlower += dt;
        // if (this.countTimeCreateFlower > this.deltaTimeCreateFlower){
        //     this.countTimeCreateFlower -= this.deltaTimeCreateFlower;
        //     var flower = new PotBreakerFlowerEffect();
        //     flower.setPosition(Math.random() * this.pFlowerSize.width, this.pFlowerSize.height);
        //     this.pFlower.addChild(flower);
        //     flower.startFall(0, -50);
        // }
    },

    playEfxStardust: function () {
        var pEffect = this.pFlower;
        //pEffect.removeAllChildren();
        //effect dom lua bay bay
        this.runAction(
            cc.repeatForever(cc.sequence(
                cc.callFunc(function () {
                    var random = Math.random();
                    if (random < Math.random() * 0.2) {
                        var sprite = new cc.Sprite("res/Event/PotBreaker/PotBreakerUI/firedust.png");
                        sprite.setColor(cc.color(251, 255, 91));
                        sprite.setPosition(cc.winSize.width * Math.random() * 0.6 + cc.winSize.width * 0.2, 145);
                        pEffect.addChild(sprite);
                        var randomTime = Math.random() * 4 + 3;
                        var rAction1 = Math.random();
                        var rAction2 = Math.random();
                        var rScale = Math.random() * 0.4 + 0.2;
                        var rOpacity = Math.random() * 100 + 155;
                        var rTimeOpacity = Math.random();
                        var rTimeBlink = Math.random() + 0.1;
                        var pos = sprite.getPosition();
                        sprite.setScale(rScale);
                        sprite.setOpacity(rOpacity);
                        var p1 = pos;
                        var p2 = cc.p(pos.x + Math.random() * 100 - 50, pos.y + Math.random() * 150 + 50);
                        var p3 = cc.p(p1.x / 2 + p2.x / 2 + Math.random() * 200 - 100, p1.y / 2 + p2.y / 2 + Math.random() * 100 - 50);
                        var p4 = cc.p(p1.x / 2 + p2.x / 2 + Math.random() * 200 - 100, p1.y / 2 + p2.y / 2 + Math.random() * 100 - 50);
                        sprite.runAction(
                            cc.sequence(
                                cc.spawn(
                                    cc.bezierTo(randomTime, [p1, p3, p4, p2]).easing(cc.easeQuarticActionOut(5)),
                                    cc.sequence(
                                        cc.fadeTo(randomTime * rTimeOpacity, 255),
                                        cc.fadeOut(randomTime * (1 - rTimeOpacity))
                                    )
                                ),
                                cc.removeSelf()
                            )
                        )
                        sprite.runAction(
                            cc.repeatForever(cc.sequence(
                                cc.spawn(
                                    cc.sequence(
                                        cc.fadeIn(rTimeBlink),
                                        cc.fadeOut(rTimeBlink)
                                    )
                                )
                            ))
                        );
                    }
                }, this),
                cc.delayTime(0.1)
            ))
        )
        if (!cc.sys.isNative)
            return;
        //effect co tien bay quanh troi
        this.runAction(
            cc.repeatForever(cc.sequence(
                cc.callFunc(function () {
                    var random = Math.random();
                    if (random < Math.random()) {
                        var fairy = new cc.Sprite("res/Event/PotBreaker/PotBreakerUI/firedust.png");
                        fairy.x = pEffect.width;
                        fairy.y = pEffect.height / 3;
                        pEffect.addChild(fairy);
                        fairy.setScale(0.8);
                        var rTime = Math.random() * 1 + 3;
                        var rAction1 = Math.random();
                        var rAction2 = rAction1 - Math.random() * rAction1 / 2;
                        var pos = fairy.getPosition();
                        var p1 = pos;
                        var p2 = cc.p(0, pos.y - Math.random() * 200 + 100);
                        if (Math.random() < 0.5) {
                            p1 = cc.p(0, pos.y - Math.random() * 200 + 100);
                            p2 = pos;
                            fairy.setPosition(p1);
                        }
                        var p3 = cc.p(p1.x / 2 + p2.x / 2, p1.y / 2 + p2.y / 2);
                        var rd1 = 100 + Math.random() * 300;
                        var rd2 = 50 + Math.random() * 300;
                        var p4 = cc.p(p3.x - rd1, p3.y + rd2);
                        var p5 = cc.p(p3.x + rd1, p3.y - rd2);
                        var timeChange = 1 + Math.round(Math.random() * 4) * 2;
                        var disChange = Math.random() * 20 + 10;
                        var listMove = [];
                        var listP = [p1];
                        var ctr = -1;
                        if (Math.random() < 0.5)
                            ctr = -ctr;
                        for (var i = 0; i < timeChange; i++) {
                            if (Math.random() < 0.5)
                                ctr = -ctr;
                            var rdd1 = (Math.random() * 500) * ctr;
                            var rdd2 = (Math.random() * 300) * ctr;
                            var p = cc.p(p1.x / 2 + p2.x / 2 + rdd1, p1.y / 2 + p2.y / 2 + rdd2);
                            listP.push(p);
                        }
                        listP.push(p2);
                        for (var i = 2; i < listP.length; i += 2) {
                            listMove.push(cc.bezierTo(rTime / (listP.length - 2), [listP[i - 2], listP[i - 1], listP[i]]).easing(cc.easeOut(3)));
                        }
                        fairy.runAction(
                            cc.sequence(
                                cc.spawn(
                                    cc.sequence(listMove).easing(cc.easeInOut(1))
                                ),
                                cc.removeSelf()
                            )
                        )
                        fairy.runAction(
                            cc.repeatForever(cc.sequence(
                                cc.callFunc(function () {
                                    var random = Math.floor(Math.random() * 3 + 2);
                                    for (var i = 0; i < random; i++) {
                                        var sprite = new cc.Sprite("res/Event/PotBreaker/PotBreakerUI/firedust.png");
                                        sprite.setBlendFunc(cc.DST_COLOR, cc.ONE);
                                        sprite.setPosition(fairy.getPosition());
                                        pEffect.addChild(sprite);
                                        var randomTime = Math.random() * 2 + 1;
                                        var rAction1 = Math.random();
                                        var rAction2 = Math.random();
                                        var rScale = Math.random() * 0.3 + 0.2;
                                        var rOpacity = Math.random() * 100 + 155;
                                        var rTimeOpacity = Math.random();
                                        var rTimeBlink = Math.random() + 0.1;
                                        var pos = sprite.getPosition();
                                        sprite.setScale(rScale);
                                        sprite.setOpacity(rOpacity);
                                        var p1 = pos;
                                        var p2 = cc.p(pos.x + Math.random() * 40 + 20, pos.y - Math.random() * 150 + 75);
                                        var p3 = cc.p(p1.x / 2 + p2.x / 2 + Math.random() * 50 - 25, p1.y / 2 + p2.y / 2 + Math.random() * 100 - 50);
                                        var p4 = cc.p(p1.x / 2 + p2.x / 2 + Math.random() * 50 - 25, p1.y / 2 + p2.y / 2 + Math.random() * 100 - 50);
                                        sprite.runAction(
                                            cc.sequence(
                                                cc.spawn(
                                                    cc.bezierTo(randomTime, [p1, p3, p4, p2]),
                                                    cc.sequence(
                                                        cc.fadeOut(randomTime)
                                                    )
                                                ),
                                                cc.removeSelf()
                                            )
                                        );
                                        sprite.runAction(
                                            cc.repeatForever(cc.sequence(
                                                cc.spawn(
                                                    cc.sequence(
                                                        cc.fadeIn(rTimeBlink),
                                                        cc.fadeOut(rTimeBlink)
                                                    )
                                                )
                                            ))
                                        );
                                    }
                                }, this)
                            ))
                        )
                    }
                }, this),
                cc.delayTime(20)
            ))
        )
    },
});

PotBreakerScene.className = "PotBreakerScene";

PotBreakerScene.BTN_BACK = 1;
PotBreakerScene.BTN_GUIDE = 2;
PotBreakerScene.BTN_RANK = 3;
PotBreakerScene.BTN_TOKEN_0 = 4;
PotBreakerScene.BTN_TOKEN_1 = 5;
PotBreakerScene.BTN_TOKEN_2 = 6;
PotBreakerScene.BTN_TOKEN_3 = 7;
PotBreakerScene.BTN_BREAK_ALL = 8;
PotBreakerScene.BTN_CHEAT = 9;
PotBreakerScene.BTN_CHEAT_NUM_TICKET = 10;
PotBreakerScene.BTN_RESET_EVENT = 11;
PotBreakerScene.BTN_CLOSE_CHANGE_LIXI = 12;
PotBreakerScene.BTN_CHEAT_NUM_TOKEN = 13;
PotBreakerScene.BTN_ADD_TICKET = 14;
PotBreakerScene.BTN_ADD_GOLD = 16;

var PotBreakerPot = cc.Node.extend({
    ctor: function (idPot, height) {
        this.idPot = idPot;
        this.heightRope = height;
        this.isShaking = false;
        this.isMoving = false;

        this._super();

        this.bgLight = new cc.Sprite("res/Event/PotBreaker/PotBreakerUI/bgLight.png");
        this.addChild(this.bgLight);
        this.bgLight.setPosition(0, -height);
        this.bgLight.setScale(0.6);
        this.bgLight.setVisible(false);

        var randomId = Math.floor(Math.random() * 1.9999);
        var resource = "res/Event/PotBreaker/PotBreakerUI/rock.png";
        this.rock = new ccui.Button(resource, resource, resource);
        this.rock.addTouchEventListener(this.onTouchEventHandler,this);
        this.rock.setPositionY(this.rock.getContentSize().height * 0.5);
        this.addChild(this.rock);
        this.rock.pos = this.rock.getPosition();

        this.smallRock = new cc.Sprite("res/Event/PotBreaker/PotBreakerUI/brokenNormal.png");
        this.addChild(this.smallRock);
        this.smallRock.setPositionY(this.smallRock.getContentSize().height * 0.5);
        //this.smallRock.setPositionY(-height);
        this.smallRock.setVisible(false);

        this.effSpecial = resourceManager.loadDragonbone("Daquy");
        this.addChild(this.effSpecial);
        this.effSpecial.setPosition(this.smallRock.getPositionX() + 5, this.smallRock.getPositionY());
        this.effSpecial.setVisible(false);

        for (var i = 0; i < 4; i++) {
            if (Math.random() > 0.7) {
                var rock = new cc.Sprite("res/Event/PotBreaker/PotBreakerUI/smallRock_" + i + ".png");
                this.addChild(rock);
                rock.setPositionY(rock.getContentSize().height * 0.3);
                rock.setPositionX(this.rock.getContentSize().width * (-0.5 + Math.random()));
            }
        }

        this.grass = new cc.Sprite("res/Event/PotBreaker/PotBreakerUI/grass.png");
        this.addChild(this.grass);
        this.grass.setPosition(0, this.grass.getContentSize().height * 0.3);

        this.arrayWater = [];
        this.timeGenWater = PotBreakerPot.TIME_GEN_WATER * (0.5 + Math.random() * 0.5);
    },

    onEnter: function(){
        this._super();
        this.scheduleUpdate();
    },

    onExit: function(){
        this._super();
        this.unscheduleUpdate();
    },

    showReset: function () {
        this.setVisible(false);
        this.runAction(cc.sequence(cc.delayTime(0.6 + Math.random() * 0.5), cc.callFunc(this.effectShow.bind(this))));
    },

    effectShow: function () {
        this.setVisible(true);
        this.rock.setScale(0);
        //this.rock.runAction(cc.spawn(cc.scaleTo(0.5, 1.0)));
        this.rock.runAction(cc.spawn(new cc.EaseBounceOut(cc.scaleTo(1.0, 1.0))));
        //this.rock.runAction(new cc.EaseBackOut(cc.moveTo(0.5, 1.0)));
    },

    effectBreakPot: function(delay, isSpecialPot, giftIds){
        var timeRun = 0.6;
        this.isSpecialPot = isSpecialPot;
        this.giftIds = giftIds;
        var actionUpdatePot = cc.callFunc(function () {
            this.updatePotStatus(true, this.isSpecialPot, this.giftIds);
            this.showParticleBreak();
            if (this.isSpecialPot) {
                this.bgLight.setVisible(true);
                this.bgLight.stopAllActions();
                this.bgLight.runAction(cc.sequence(
                    cc.repeat(cc.rotateBy(0.5, 30), 5),
                    cc.fadeOut(0.3),
                    cc.hide()
                ));

            }
        }.bind(this));

        var actionDapNieu = cc.callFunc(function () {
            cc.log("actionDapNieu");
            if (potBreaker.potBreakerScene){
                try {
                    var effect = potBreaker.potBreakerScene.listCudgel[this.idPot];
                    if (effect){
                        effect.setVisible(true);
                        effect.setOpacity(255);
                        // effect.setAnimation(0, 'animation', false);
                        effect.gotoAndPlay("1", 0, 1, 1);
                    }
                } catch (e) {
                    cc.error("loi luc dap: " + e);
                }
            }
        }.bind(this));

        this.runAction(cc.sequence(cc.delayTime(delay),cc.spawn(cc.sequence(cc.delayTime(timeRun), actionUpdatePot), actionDapNieu)));
    },

    showParticleBreak: function () {
        var emitter1 = new cc.ParticleSystem("res/Event/PotBreaker/PotBreakerUI/rock.plist");
        var batch = new cc.ParticleBatchNode(emitter1.texture);
        batch.addChild(emitter1);
        batch.setPosition(this.rock.getPosition());
        this.addChild(batch);
    },

    updatePotStatus: function(wasBroken, isSpecialPot, giftIds){
        this.rock.setVisible(!wasBroken);
        this.smallRock.setVisible(wasBroken && !isSpecialPot);
        this.effSpecial.setVisible(isSpecialPot);
        this.effSpecial.gotoAndPlay("1", -1, -1, 1);
        // this.brokenPot.setVisible(wasBroken && !isSpecialPot);
        // this.brokenGoldPot.setVisible(wasBroken && isSpecialPot);
        if (isSpecialPot) {
            this.smallRock.setTexture("res/Event/PotBreaker/PotBreakerUI/brokenDiamon.png");
        }
        else {
            this.smallRock.setTexture("res/Event/PotBreaker/PotBreakerUI/brokenNormal.png");
        }

        if (potBreaker.potBreakerScene){
            potBreaker.potBreakerScene.onEffectGiftFall(this.idPot, giftIds);
        }
    },

    onTouchEventHandler: function(sender,type){
        switch (type){
            case ccui.Widget.TOUCH_BEGAN:
                break;
            case ccui.Widget.TOUCH_ENDED:
                this.onButtonRelease(sender,sender.getTag());
                break;
        }
    },

    onButtonRelease: function (button, id) {
        cc.log("touch pot: " + this.idPot);
        if (potBreaker.potBreakerScene && potBreaker.potBreakerScene.isWaitingResult) {
            return;
        }
        var breakSuccess = potBreaker.breakPot(PotBreaker.ID_BREAK_ONCE, this.idPot);
        button.setTouchEnabled(!breakSuccess);
        if (potBreaker.potBreakerScene && potBreaker.potBreakerScene.pMapPot){
            potBreaker.potBreakerScene.pMapPot.saveLastTimeGuide();
            potBreaker.potBreakerScene.pMapPot.clearGuide();
        }
        // this.effectBreakPot(0, 0, [1010]);
    },

    resetDefaultStatus: function(){
        this.setRotation(0);
        this.isShaking = false;
        this.isMoving = false;
    },

    shakeToRight: function () {
        return;
        // if (!this.rock.isVisible())
        //     return;
        // return;
        this.stopAllActions();
        this.isMoving = true;
        var targetAngle = PotBreakerPot.MAX_ANGEL_RIGHT - Math.random()*20;
        var actionShake = new cc.EaseExponentialOut(cc.rotateTo(0.8, targetAngle));
        this.runAction(actionShake);

        this.runAction(cc.sequence(cc.delayTime(0.8), cc.callFunc(function () {
            this.isShaking = true;
        }.bind(this))));
    },

    shakeToTarget: function(targetAngle, delayTime){
        return;
        // if (!this.rock.isVisible())
        //     return;
        if (this.isMoving) return;
        if (this.getRotation() !== 0){
            return;
        }
        this.isMoving = true;
        var actionShakeToRandom = new cc.EaseOut(cc.rotateTo(0.5, targetAngle), 1.2);
        this.runAction(actionShakeToRandom);
        this.runAction(cc.sequence(cc.delayTime(0), cc.delayTime(0.5), cc.callFunc(function () {
            this.isShaking = true;
        }.bind(this))));
    },

    shakeToOpposite: function(){
        return;
        var curAngle = this.getRotation();
        var minSub = 2;
        var maxSub = 8;
        // var deltaAngle = minSub + Math.random() * (maxSub - minSub);
        // var newAngle = Math.abs(curAngle) - deltaAngle;
        // if (newAngle < 0) newAngle = 0;
        // var targetAngle = (curAngle > 0) ? -newAngle : newAngle;

        var targetAngle = -curAngle * 0.8;
        if (Math.abs(targetAngle) < 0.2)
            targetAngle = 0;
        var newAngle = targetAngle;

        var actionShakeToOpposite = new cc.EaseInOut(cc.rotateTo(0.5, targetAngle), 1.2);
        this.runAction(actionShakeToOpposite);

        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
            if (newAngle !== 0){
                this.isShaking = true;
            } else {
                this.isMoving = false;
            }
        }.bind(this))));
    },

    generateWater: function () {
        var obj;
        for (var i = 0; i < this.arrayWater.length; i++) {
            if (!this.arrayWater[i].isVisible()) {
                obj = this.arrayWater[i];
                break;
            }
        }

        if (!obj) {
            obj = new cc.Sprite("res/Event/PotBreaker/PotBreakerUI/water.png");
            this.addChild(obj);
            this.arrayWater.push(obj);
        }
        obj.setVisible(true);
        obj.setScale(0);
        obj.setOpacity(0);
        var posX = this.rock.getContentSize().width * (Math.random() * 0.3 - 0.2);
        var posY = this.rock.getContentSize().height * (Math.random() * 0.1 - 0.2);

        obj.setPosition(posX, posY);
        var d1 = 60, d2 = 30;
        var dx1 = d1 * Math.sin(cc.degreesToRadians(this.getRotation()));
        // cc.log("DX1 " + dx1 + " radian " + cc.degreesToRadians(this.node.getRotation()));
        var dy1 = d1 * Math.cos(cc.degreesToRadians(this.getRotation()));
        dy1 = -Math.abs(dy1);

        var dx2 = d2 * Math.sin(cc.degreesToRadians(this.getRotation()));
        var dy2 = d2 * Math.cos(cc.degreesToRadians(this.getRotation()));
        dy2 = -Math.abs(dy2);

        obj.runAction(cc.sequence(
            cc.spawn(cc.fadeTo(0.4, 200), cc.scaleTo(0.4, 1)),
            cc.spawn(cc.moveBy(0.4, dx1, dy1), cc.fadeTo(0.4, 150)),
            cc.spawn(cc.moveBy(0.4, dx2, dy2), cc.fadeOut(0.4)),
            cc.hide()
        ));
        return obj;
    },

    update: function (dt) {
        return;
        //if (this.isShaking){
        //    this.shakeToOpposite();
        //    this.isShaking = false;
        //}

        if (this.rock.isVisible()) {
            this.timeGenWater = this.timeGenWater - dt;
            if (this.timeGenWater <= 0) {
                this.generateWater();
                this.timeGenWater = PotBreakerPot.TIME_GEN_WATER + (0.2 + Math.random() * 0.8);
            }
        }
    }
});

PotBreakerPot.MAX_ANGEL_RIGHT = -30;
PotBreakerPot.TIME_GEN_WATER = 1;

var PotBreakerMapPot = BaseLayer.extend({
    ctor: function () {
        this.timeWaitNextRandom = 0;
        this._super(PotBreakerMapPot.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerMapPot.json");
    },

    initGUI: function () {
        this.pMap = this.getControl("pMap");
        this.listPots = [];
        this.arrayPos = [];
        for (var i = 0; i < 9; i++) {
            var panel = this.getControl("Panel_" + i);
            panel.setTouchEnabled(false);
            var pos1 = panel.getPosition();
            this.arrayPos.push(pos1);
            var height = panel.getContentSize().height;
            var pot = new PotBreakerPot(i, height);
            pot.setPosition(pos1);
            this.pMap.addChild(pot);
            this.listPots.push(pot);
        }

        this.pGuide = this.getControl("pGuide");
        this.hand1 = new cc.Sprite(PotBreaker.DEFAUT_FOLDER_UI + "hand1.png");
        this.hand1.setAnchorPoint(0, 1);
        this.pGuide.addChild(this.hand1);
        this.hand2 = new cc.Sprite(PotBreaker.DEFAUT_FOLDER_UI + "hand2.png");
        this.hand2.setAnchorPoint(0, 1);
        this.pGuide.addChild(this.hand2);
        this.pGuide.setLocalZOrder(2000);
    },

    onEnterFinish: function(){
        this.saveLastTimeGuide();
        this.resetDefaultStatus();
        this.scheduleUpdate();

        this.hand1.setVisible(false);
        this.hand2.setVisible(false);
    },

    onExit: function(){
        this._super();
        this.unscheduleUpdate();
    },

    doBreakPot: function(listBrokenPots, isSpecialPots, giftsResult, numGifts){
        // if (listBrokenPots.length === 1){
        PotBreakerSound.doBreak();
        // }

        var i, j;
        var listGift = [];
        var totalGift = 0;
        for (i = 0; i < numGifts.length; i++){
            totalGift += numGifts[i];
        }
        for (i = 0; i < numGifts.length; i++){
            for (j = 0;j < numGifts[i]; j++){
                listGift.push(giftsResult[i]);
            }
        }
        var realGiftIds = [];
        if (totalGift < PotBreaker.ROLL_MAX_NUM){
            for (i = 0; i < totalGift; i++){
                realGiftIds.push([listGift[i]]);
            }
        } else {
            for (i = 0; i < PotBreaker.NUMBER_POT_IN_MAP; i++){
                var gifts = [];
                for (j = 0; j < 10; j++){
                    gifts.push(listGift[i * 10 + j]);
                }
                realGiftIds.push(gifts);
            }
        }

        // cc.log("realGiftIds: ", JSON.stringify(realGiftIds), totalGift, JSON.stringify(listGift));

        var extraTime = 0.05 * totalGift;

        if (totalGift === PotBreaker.NUMBER_POT_IN_MAP){
            var totalSpecialPot = 1;
            var randomPercentTotalSpecialPot = Math.random();
            if (randomPercentTotalSpecialPot > 0.9){
                totalSpecialPot = 3;
            } else if (randomPercentTotalSpecialPot > 0.6){
                totalSpecialPot = 2;
            }
            var randomSpecialPots = [];
            for (i = 0; i < PotBreaker.NUMBER_POT_IN_MAP; i++){
                randomSpecialPots[i] = 0;
            }
            for (i = 0; i < totalSpecialPot; i++){
                randomSpecialPots[i] = 1;
            }
            // cc.log("randomSpecialPots: ", JSON.stringify(randomSpecialPots));
            isSpecialPots = this.shuffeArray(randomSpecialPots);
            cc.log("randomSpecialPots: ", isSpecialPots.length, JSON.stringify(isSpecialPots));
        } else if (totalGift === PotBreaker.ROLL_MAX_NUM){
            extraTime = 0.1 * PotBreaker.NUMBER_POT_IN_MAP;
            for (i = 0; i < PotBreaker.NUMBER_POT_IN_MAP; i++){
                isSpecialPots[i] = 1;
            }
        }


        var listPots = [];
        for (j = 0; j < listBrokenPots.length; j++){
            var pot = {};
            pot.id = listBrokenPots[j];
            pot.isSpecialPot = isSpecialPots[j];
            pot.giftIds = realGiftIds[j];
            listPots.push(pot);
        }
        var delayTime = 0;
        var listBreakType = [PotBreakerMapPot.TYPE_BREAK_0, PotBreakerMapPot.TYPE_BREAK_1, PotBreakerMapPot.TYPE_BREAK_2,
            PotBreakerMapPot.TYPE_BREAK_3, PotBreakerMapPot.TYPE_BREAK_4, PotBreakerMapPot.TYPE_BREAK_5, PotBreakerMapPot.TYPE_BREAK_6];
        var randomIndex = Math.floor(Math.random() * 9);
        if (randomIndex > listBreakType.length - 1){
            listPots = this.shuffeArray(listPots);
        } else {
            var breakType = listBreakType[randomIndex];
            var listBrokenNew = [];
            for (i = 0; i < breakType.length; i++){
                var indexBrokenPot = listBrokenPots.indexOf(breakType[i]);
                if (indexBrokenPot >= 0){
                    pot = {};
                    pot.id = breakType[i];
                    pot.isSpecialPot = listPots[indexBrokenPot].isSpecialPot;
                    pot.giftIds = listPots[indexBrokenPot].giftIds;
                    listBrokenNew.push(pot);
                }
            }
            listPots = listBrokenNew;
        }

        cc.log("doBreakPot: " + JSON.stringify(listPots));
        var deltaTime = 0.2;
        var deltaTimeSpecial = 0.5;
        for (i = 0; i < listPots.length; i++){
            this.listPots[listPots[i].id].effectBreakPot(delayTime, listPots[i].isSpecialPot, listPots[i].giftIds);
            if (randomIndex === 6){
                if (i === 0 || i === 4){
                    delayTime += deltaTimeSpecial;
                }
            } else if (randomIndex === 5){
                if (i === 0){
                    delayTime += deltaTimeSpecial;
                }
            } else if (randomIndex === 4 || randomIndex === 2){
                if (i % 3 === 2){
                    delayTime += deltaTimeSpecial;
                }
            } else if (randomIndex === 3){
                if (i === 0 || i === 2 || i === 5 || i === 7){
                    delayTime += deltaTimeSpecial;
                }
            } else {
                delayTime += deltaTime;
            }
        }
        delayTime += 1.7 + extraTime;
        return delayTime;
    },

    shuffeArray: function(array){
        var currentIndex = array.length, tempValue, randomIdx;

        while (currentIndex !== 0){
            randomIdx = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            tempValue = array[currentIndex];
            array[currentIndex] = array[randomIdx];
            array[randomIdx] = tempValue;
        }

        return array;
    },

    resetDefaultStatus: function(){
        for (var i = 0; i < this.listPots.length; i++){
            this.listPots[i].resetDefaultStatus();
        }
    },

    updateMapInfo: function(){
        for (var i = 0; i < this.listPots.length; i++){
            this.listPots[i].updatePotStatus(potBreaker.mapInfo[i] !== PotBreaker.TYPE_NORMAL_POT, potBreaker.mapInfo[i] === PotBreaker.TYPE_GOLD_BROKEN_POT, []);
        }
    },

    shakeAllPots: function () {
        for (var i = 0; i < this.listPots.length; i++){
            this.listPots[i].shakeToRight();
        }
    },

    guideBreakPot: function(){
        if (potBreaker.potBreakerScene && potBreaker.potBreakerScene.isWaitingResult){
            return;
        }
        var normalPots = potBreaker.getListNormalPotId();
        if (normalPots && normalPots.length === 0){
            return;
        }

        var randomIdx = Math.floor(Math.random() * (normalPots.length - 0.1));
        var targetPos = this.arrayPos[normalPots[randomIdx]];
        // var btnPot = targetPot.rock;
        // if (!btnPot){
        //     return;
        // }
        //  var targetPos = this.convertToWorldSpace(targetPos);
        this.hand1.setPosition(targetPos);
        this.hand2.setPosition(targetPos);
        this.hand1.stopAllActions();
        this.hand2.stopAllActions();
        this.hand1.setVisible(true);
        this.hand1.setOpacity(0);
        this.hand2.setVisible(false);

        var timeFade = 0.5;
        var actionFadeIn = cc.fadeIn(timeFade);
        var actionBlink1 = cc.callFunc(function () {
            this.hand1.setVisible(false);
            this.hand2.setVisible(true);
        }.bind(this));
        var actionBlink2 = cc.callFunc(function () {
            this.hand1.setVisible(true);
            this.hand2.setVisible(false);
        }.bind(this));
        var actionFadeOut = cc.fadeOut(timeFade);
        var actionDelayMini = cc.delayTime(0.3);
        var actionDelayFade = cc.delayTime(0.5);
        var actions = [actionFadeIn, actionDelayFade, actionBlink1, actionDelayMini.clone(), actionBlink2,
            actionDelayMini.clone(), actionBlink1.clone(), actionDelayMini.clone(), actionBlink2.clone(), actionDelayFade.clone(), actionFadeOut];
        this.hand1.runAction(cc.sequence(actions));
    },

    checkGuide: function(){
        var d = new Date();
        var curTime = d.getTime();
        var lastTime = PotBreakerMapPot.LAST_TIME_GUIDE;

        if (isNaN(lastTime)) lastTime = 0;

        if (curTime - lastTime > PotBreakerMapPot.GUIDE_COUNT_DOWN_TIME) {
            this.saveLastTimeGuide();
            this.guideBreakPot();
        }
    },

    saveLastTimeGuide: function(){
        PotBreakerMapPot.LAST_TIME_GUIDE = new Date().getTime();
    },

    clearGuide: function(){
        this.hand1.stopAllActions();
        this.hand1.setVisible(false);
        this.hand2.setVisible(false);
    },

    showResetMap: function () {
        for (var i = 0; i < this.listPots.length; i++){
            this.listPots[i].showReset();
        }
    },

    update: function (dt) {
        this.timeWaitNextRandom -= dt;
        if (this.timeWaitNextRandom > 0){
            return;
        }
        // if (Math.random() * 100 < 5){
        var targetAngle = PotBreakerMapPot.MAX_ANGLE_RANDOM - Math.random() * PotBreakerMapPot.MAX_ANGLE_RANDOM * 2;
        if (Math.abs(targetAngle) < 3) return;
        var delayTime = 0.15;
        //var i = Math.floor(Math.random() * this.listPots.length * 0.9999);
        for (var i = 0; i < this.listPots.length; i++){
            // if (Math.random() > 0.5) {
            //     continue;
            // }
            //  var delay = (i % 3) * delayTime;
            //  if (targetAngle > 0) delay = (2 - (i % 3)) * delayTime;
            //delay += Math.floor(i / 3) * 0.07;
            // var delay = 0;
            //  var delay = Math.random() * 0.5;
            this.listPots[i].shakeToTarget(targetAngle, 0);
        }
        this.timeWaitNextRandom = PotBreakerMapPot.TIME_NEXT_RANDOM_SHAKE;
        // if (potBreaker.potBreakerScene && Math.random() < 0.5){
        //     potBreaker.potBreakerScene.plowFlower(-targetAngle * 100);
        // }
        // }

        this.checkGuide();
    }
});

PotBreakerMapPot.TIME_NEXT_RANDOM_SHAKE = 0.5;
PotBreakerMapPot.MAX_ANGLE_RANDOM = 13;
PotBreakerMapPot.TYPE_BREAK_0 = [0, 1, 2, 3, 4, 5, 6, 7, 8];
PotBreakerMapPot.TYPE_BREAK_1 = [8, 7, 6, 5, 4, 3, 2, 1, 0];
PotBreakerMapPot.TYPE_BREAK_2 = [0, 3, 6, 1, 4, 7, 2, 5, 8];
PotBreakerMapPot.TYPE_BREAK_3 = [2, 1, 5, 0, 4, 8, 3, 7, 6];
PotBreakerMapPot.TYPE_BREAK_4 = [6, 7, 8, 5, 4, 3, 0, 1, 2];
PotBreakerMapPot.TYPE_BREAK_5 = [4, 0, 1, 2, 3, 5, 6, 7, 8];
PotBreakerMapPot.TYPE_BREAK_6 = [4, 1, 5, 7, 3, 0, 2, 8, 6];

PotBreakerMapPot.GUIDE_COUNT_DOWN_TIME = 10000;
PotBreakerMapPot.LAST_TIME_GUIDE = 0;

var PotBreakerAccumulateGUI = BaseLayer.extend({
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

        this._super(PotBreakerAccumulateGUI.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerAccumulateGUI.json");
    },

    initGUI: function () {
        this.progress = this.getControl("progress");
        this.progress.defaultPos = this.progress.getPosition();

        this.bar = this.getControl("bar", this.progress);
        this.num = this.getControl("num", this.progress);
        this.exp = this.getControl("exp", this.progress);
        this.bonus = this.getControl("bonus", this.progress);
        this.bonus.defaultPos = this.bonus.getPosition();


        this.tab = this.getControl("tab");
        this.tab.setTouchEnabled(true);
        this.tab.setCascadeOpacityEnabled(false);
        this.tab.mainGUI = this;
        this.tab.addTouchEventListener(function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    return;
                case ccui.Widget.TOUCH_MOVED:
                    break;
                case ccui.Widget.TOUCH_CANCELED:
                case ccui.Widget.TOUCH_ENDED:
                    cc.log("TOUCH THE TAB BUTTON " + potBreaker.numberTicket);
                    this.showAccumulate({
                        keyCoin: potBreaker.numberTicket,
                        nextLevelExp: potBreaker.nextLevelExp,
                        curLevelExp: potBreaker.curLevelExp,
                        additionExp: 0
                    });
                    this.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.onCloseGUI.bind(this))));
                    break;
            }
        }, this);

        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.result = null;

        this.progress.setPositionX(this.progress.defaultPos.x + this.progress.getContentSize().width);

        this.bonus.setVisible(false);
        this.bonus.setString("");
        this.bonus.setPosition(this.bonus.defaultPos);
        this.exp.setString(potBreaker.curLevelExp + "/" + potBreaker.nextLevelExp);

        this.tab.setOpacity(255);
        this.tab.removeAllChildren();
    },

    showAccumulate: function (cmd) {
        if (!cmd) return;
        //this.potionPrepare();
        cc.log("KEY COI " + cmd.keyCoin);
        this.tab.setTouchEnabled(false);
        this.tab.stopAllActions();
        this.tab.runAction(cc.fadeOut(PotBreakerAccumulateGUI.TIME_MOVE));

        this.result = cmd;
        this.isKeyCoinChange = (cmd.keyCoin > potBreaker.numberTicket);

        this.curExpTmp = potBreaker.curLevelExp;
        this.nextExpTmp = (potBreaker.nextLevelExp <= cmd.nextLevelExp) ? potBreaker.nextLevelExp : cmd.nextLevelExp;

        var perExp = potBreaker.getExpPercent();
        perExp = (perExp < 2.5 && perExp > 0) ? 2.5 : perExp;
        this.bar.setPercent(perExp);
        this.num.setString(StringUtility.pointNumber(potBreaker.numberTicket));
        this.exp.setString(potBreaker.getExpString());

        this.progress.runAction(cc.sequence(
            cc.moveTo(PotBreakerAccumulateGUI.TIME_MOVE, this.progress.defaultPos).easing(cc.easeExponentialOut()),
            cc.callFunc(this.endMoving.bind(this))
        ));

        if (!this.tab.isVisible()) return;
        this.tab.removeAllChildren();
    },

    resetDefaultPosition: function (control) {
        this._super(control);
        if (control === undefined) return;
        try {
            if (control.defaultRot === undefined) control.defaultRot = control.getRotationY();
            else control.setRotation(control.defaultRot);
        } catch (e) {

        }
        try {
            if (control.defaultSca === undefined) control.defaultSca = control.getScale();
            else control.setScale(control.defaultSca);
        } catch (e) {

        }
    },

    endMoving: function () {
        // effect bar progress
        this.perLoad = [];
        this.deltaLoad = [];

        //this.potionEffect();
        if (this.result.curLevelExp != potBreaker.curLevelExp ||
            this.result.nextLevelExp != potBreaker.nextLevelExp ||
            this.result.keyCoin != potBreaker.numberTicket) {
            if (potBreaker.nextLevelExp > 1) {
                if (potBreaker.curLevelExp + this.result.additionExp >= potBreaker.nextLevelExp) {
                    this.deltaLoad.push(potBreaker.nextLevelExp - potBreaker.curLevelExp);
                    this.deltaLoad.push(this.result.additionExp - potBreaker.nextLevelExp + potBreaker.curLevelExp);

                    this.perLoad.push(this.getPerLoad(potBreaker.nextLevelExp - potBreaker.curLevelExp, potBreaker.nextLevelExp));
                    this.perLoad.push(this.getPerLoad(this.result.additionExp - potBreaker.nextLevelExp + potBreaker.curLevelExp, this.result.nextLevelExp));
                } else {
                    this.deltaLoad.push(this.result.additionExp);
                    this.perLoad.push(this.getPerLoad(this.result.additionExp, this.result.nextLevelExp));
                }
            } else {
                var oldExp = this.result.currentLevelExp - this.result.additionExp;
                this.exp.setString(StringUtility.pointNumber(oldExp) + "/" + StringUtility.pointNumber(this.result.nextLevelExp));
                this.bar.setPercent(parseFloat(oldExp * 100 / this.result.nextLevelExp));

                this.deltaLoad.push(this.result.additionExp);
                this.perLoad.push(this.getPerLoad(this.result.additionExp, this.result.nextLevelExp));
            }

            // bonus
         //   this.bonus.setVisible(this.isKeyCoinChange);
            this.bonus.setVisible(true);
            this.bonus.setString("+" + StringUtility.pointNumber(this.result.additionExp));
            this.bonus.runAction(cc.sequence(
                cc.scaleTo(0.15, 1.25, 1.25),
                cc.scaleTo(0.15, 0.8, 0.8),
                cc.scaleTo(0.15, 1, 1)
            ));

            // start loading
            this.curLoad = 0;
            this.timeLoad = PotBreakerAccumulateGUI.TIME_PROGRESS / this.perLoad.length;
            for (var i = 0; i < this.perLoad.length; i++) {
                this.perLoad[i] = PotBreakerAccumulateGUI.TIME_DELTA * this.perLoad[i] / this.timeLoad;
                this.deltaLoad[i] = PotBreakerAccumulateGUI.TIME_DELTA * this.deltaLoad[i] / this.timeLoad;
            }
            this.schedule(this.update, PotBreakerAccumulateGUI.TIME_DELTA);

            // update luckyCard info
            potBreaker.curLevelExp = this.result.currentLevelExp;
            potBreaker.nextLevelExp = this.result.nextLevelExp;
            potBreaker.numberTicket = this.result.keyCoin;
          //  this.num.setString(StringUtility.pointNumber(potBreaker.numberTicket));
        } else this.bonus.setVisible(false);
    },

    endCoin: function () {
        if (this.isKeyCoinChange) {
            this.num.runAction(cc.sequence(
                cc.scaleTo(0.15, 1.25, 1.25),
                cc.callFunc(function () {
                    this.setString(StringUtility.pointNumber(potBreaker.numberTicket));
                }.bind(this.num)),
                cc.scaleTo(0.15, 0.8, 0.8),
                cc.scaleTo(0.15, 1, 1)
            ));
        } else {
            this.num.setString(StringUtility.pointNumber(potBreaker.numberTicket));
        }
    },

    onFinishLoad: function () {
        if (this.curLoad >= this.perLoad.length) {
            var perExp = potBreaker.getExpPercent();
            perExp = (perExp < 2.5 && perExp > 0) ? 2.5 : perExp;
            this.bar.setPercent(perExp);
            this.exp.setString(potBreaker.getExpString());
            this.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.onCloseGUI.bind(this))));

            this.endCoin();
        }
    },

    onCloseGUI: function () {
        var moveTo = cc.moveTo(PotBreakerAccumulateGUI.TIME_MOVE, cc.p(this.progress.defaultPos.x + this.progress.getContentSize().width, this.progress.defaultPos.y));
        this.tab.setTouchEnabled(true);
        this.tab.runAction(cc.fadeTo(LuckyCardAccumulateGUI.TIME_MOVE, 255));
        this.progress.runAction(moveTo.easing(cc.easeExponentialOut()));
    },

    getPerLoad: function (a, b) {
        return (a * 100 / b);
    },

    update: function (dt) {
        if (this.curLoad < this.perLoad.length) {
            this.bar.setPercent(this.bar.getPercent() + this.perLoad[this.curLoad]);

            this.curExpTmp += this.deltaLoad[this.curLoad];
            this.exp.setString(StringUtility.pointNumber(this.curExpTmp) + "/" + StringUtility.pointNumber(this.nextExpTmp));

            this.timeLoad -= LuckyCardAccumulateGUI.TIME_DELTA;
            if (this.timeLoad <= 0) {
                this.curExpTmp = 0;
                this.nextExpTmp = this.result.nextLevelExp;

                this.bar.setPercent(0);
                this.curLoad += 1;
                if (this.perLoad.length > 0) this.timeLoad = PotBreakerAccumulateGUI.TIME_PROGRESS / this.perLoad.length;

                this.onFinishLoad();
            }
        }
    }
});

PotBreakerAccumulateGUI.TIME_PROGRESS = 1;
PotBreakerAccumulateGUI.TIME_MOVE = 0.5;
PotBreakerAccumulateGUI.TIME_DELTA = 0.05;

var PotBreakerEventNotifyGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(PotBreakerEventNotifyGUI.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerEventNotifyGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", PotBreakerEventNotifyGUI.BTN_CLOSE, this._bg);
        this.btnJoin = this.customButton("join", PotBreakerEventNotifyGUI.BTN_JOIN, this._bg);
        this.btnJoin.runAction(cc.repeatForever(cc.sequence(
            new cc.EaseBounceOut(cc.scaleTo(0.6, 1.2)),
            cc.scaleTo(0.3, 1.0)
        )));

        this.lbTime = this.getControl("lbTime",this._bg);

        var eff = resourceManager.loadDragonbone("LightBg");
        if (eff) {
            this.addChild(eff);
            eff.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.4);
            eff.gotoAndPlay("1", -1, -1, 0);
        }

        // this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        potBreaker.saveCurrentDay();

        this.lbTime.setString(potBreaker.eventDayFrom + " đến " + potBreaker.eventDayTo);

        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        this.onBack();

        if (id === PotBreakerEventNotifyGUI.BTN_JOIN) {
            potBreaker.openEvent();
        }
    },

    onBack: function () {
        popUpManager.removePopUp(PopUpManager.NOTIFY_OUT_GAME);
        this.onClose();
    }
});

var PotBreakerHammerDialog = BaseLayer.extend({

    ctor: function () {
        this._super(PotBreakerHammerDialog.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerHammerDialog.json");
    },

    initGUI: function () {
//        this.bg = this.getControl("bg");
        this.panel = this.getControl("panel");

        this.customButton("btnShop", PotBreakerHammerDialog.BTN_SHOP, this.panel);
        this.customButton("btnPlay", PotBreakerHammerDialog.BTN_PLAY_GAME, this.panel);
        this.customButton("btnClose", PotBreakerHammerDialog.BTN_CLOSE, this.panel);

        this.enableFog();
        this.setBackEnable();
    },

    onEnterFinish: function () {
        var timeShow = 0.25;
        if (this._fog) {
            this._fog.setOpacity(0);
            this._fog.setVisible(true);
            this._fog.runAction(cc.fadeTo(timeShow, 150));
        }

        //this.bg.setScale(0);
        //this.bg.setOpacity(0);
        this.panel.setScale(0);
        this.panel.setOpacity(0);
        //this.bg.runAction(cc.spawn(new cc.EaseBackOut(cc.scaleTo(timeShow,0.65)),cc.fadeIn(timeShow)));
        this.panel.runAction(cc.spawn(new cc.EaseBackOut(cc.scaleTo(timeShow, this._scale)), cc.fadeIn(timeShow)));
    },

    onButtonRelease: function (btn, id) {
        var timeShow = 0.25;
        if (this._fog) {
            this._fog.runAction(cc.fadeOut(timeShow));
        }

        //   this.bg.runAction(cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeShow,0)),cc.fadeOut(timeShow)));
        this.panel.runAction(cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeShow, 0)), cc.fadeOut(timeShow)));
        if (id == PotBreakerHammerDialog.BTN_SHOP)
            this.runAction(cc.sequence(cc.delayTime(timeShow), cc.callFunc(this.onCloseShop.bind(this))));
        else if (id == PotBreakerHammerDialog.BTN_PLAY_GAME)
            this.runAction(cc.sequence(cc.delayTime(timeShow), cc.callFunc(this.onClosePlay.bind(this))));
        else
            this.runAction(cc.sequence(cc.delayTime(timeShow), cc.callFunc(this.onCloseDone.bind(this))));
    },

    onCloseDone: function () {
        this.removeFromParent();
    },

    onCloseShop: function () {
        gamedata.openShop(PotBreakerScene.className);
        this.removeFromParent();
    },

    onClosePlay: function () {
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
                            gamedata.openShop(PotBreakerScene.className);
                        }
                    });
                }
                else {
                    sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                }
            }
        }
        this.removeFromParent();
    }
});

PotBreakerHammerDialog.BTN_PLAY_GAME = 1;
PotBreakerHammerDialog.BTN_SHOP = 2;
PotBreakerHammerDialog.BTN_CLOSE = 3;

var PotBreakerOpenGiftGUI = BaseLayer.extend({

    ctor: function () {
        this.gift = null;
        this.lbNotice = null;
        this.lbName = null;
        this.info = null;
        this.btn = null;

        this.share = null;
        this.logo_zp = null;

        this.panel = null;
        this.title = null;
        this.circle = null;

        this.pEffect = null;

        this._super(PotBreakerOpenGiftGUI.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerOpenGiftGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.getControl("left");
        this.getControl("right");

        this.logo_zp = this.getControl("logo");

        this.panel = this.getControl("panel");

        this.pEffect = this.getControl("effect");

        this.lbNotice = this.getControl("lb", this.panel);
        this.lbName = this.getControl("gift", this.panel);
        this.gift = this.getControl("img", this.panel);
        this.gift.pos = this.gift.getPosition();
        this.btn = this.customButton("btn", 1, this.panel);
        this.share = this.customButton("share", 2, this.panel);

        if (!cc.sys.isNative) {
            this.share.setVisible(false);
            this.btn.setPositionX(this.panel.getContentSize().width * 0.5);
        }

        this.title = this.getControl("title", this.panel);
        this.circle = this.getControl("circle", this.panel);
        this.particle = this.panel.getChildByName("particle");
        this.txtRank = this.getControl("txtRank", this.panel);

        this.lbNotice.pos = this.lbNotice.getPosition();
        this.lbName.pos = this.lbName.getPosition();
        this.gift.pos = this.gift.getPosition();
        this.btn.pos = this.btn.getPosition();
        this.share.pos = this.share.getPosition();
        this.title.pos = this.title.getPosition();
        this.circle.pos = this.circle.getPosition();
        this.particle.pos = this.particle.getPosition();
        this.txtRank.pos = this.txtRank.getPosition();

        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.bg.setOpacity(255);

        this.panel.setVisible(true);
        this.panel.setOpacity(255);

        this.pEffect.removeAllChildren();

        this.btn.setVisible(true);
        this.share.setVisible(true);

        if (!cc.sys.isNative) {
            this.share.setVisible(false);
        }

        this.logo_zp.setVisible(false);
        this.arrayFirework = [];
        this.countTimeFireWork = 0;
        this.scheduleUpdate();

        var maxWeek = (potBreaker.eventTime < PotBreaker.WEEK_END) ? potBreaker.eventTime : PotBreaker.WEEK_END;
        for (var i = PotBreaker.WEEK_START; i <= maxWeek; i++){
            var cmd2 = new CmdSendPotBreakerGetMyRank();
            cmd2.putData(i);
            GameClient.getInstance().sendPacket(cmd2);
        }
    },

    doAnimate: function () {
        var time = 0;
        var tDrop = 0.3;

        this.btn.setVisible(true);
        this.share.setVisible(true);

        if (!cc.sys.isNative) {
            this.share.setVisible(false);
        }

        this.circle.setVisible(true);
        this.particle.setVisible(true);

        this.title.setVisible(true);
        this.lbName.setVisible(true);
        this.lbNotice.setVisible(true);
        time += 0.15;
        this.title.setPositionY(this.title.pos.y + 50);
        this.title.runAction(cc.moveTo(tDrop, this.title.pos));
        time += 0.1;
        this.txtRank.setPositionY(this.txtRank.pos.y + 500);
        this.txtRank.runAction(cc.sequence(cc.delayTime(time), new cc.EaseBackOut(cc.moveTo(tDrop, this.txtRank.pos))));
        time += 0.1;
        this.lbNotice.setPositionY(this.lbNotice.pos.y + 500);
        this.lbNotice.runAction(cc.sequence(cc.delayTime(time), new cc.EaseBackOut(cc.moveTo(tDrop, this.lbNotice.pos))));
        time += 0.05;
        this.lbName.setPositionY(this.lbName.pos.y + 500);
        this.lbName.runAction(cc.sequence(cc.delayTime(time), new cc.EaseBackOut(cc.moveTo(tDrop, this.lbName.pos))));
        this.btn.setPositionY(this.btn.pos.y - 400);
        this.btn.runAction(cc.sequence(cc.delayTime(time), new cc.EaseBackOut(cc.moveTo(tDrop, this.btn.pos))));

        this.share.setPositionY(this.btn.pos.y - 400);
        this.share.runAction(cc.sequence(cc.delayTime(time), new cc.EaseBackOut(cc.moveTo(tDrop, this.share.pos))));
        time += 0.15;
        this.gift.setPosition(this.gift.pos);
        this.gift.setScale(0);
        this.gift.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(PotBreakerSound.playGift), new cc.EaseBackOut(cc.scaleTo(0.5, 0.8))));
        this.circle.setScale(0);
        this.circle.runAction(cc.sequence(cc.spawn(cc.scaleTo(1.5, 1), cc.rotateTo(1.5, 360)), cc.repeatForever(cc.rotateBy(0.15, 5))));
        this.circle.runAction(cc.repeatForever(cc.rotateBy(0.15, 5)));
    },

    hideAnimate: function () {
        var tDrop = 0.3;

        this.btn.setVisible(true);
        this.share.setVisible(true);
        if (!cc.sys.isNative) {
            this.share.setVisible(false);
        }

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

        this.share.setPosition(this.share.pos);
        this.share.runAction(new cc.EaseBackIn(cc.moveTo(tDrop, cc.p(this.share.pos.x, this.share.pos.y - 400))));
    },

    showGift: function (inf, auto) {
        if (auto === undefined || auto == null) auto = false;
        this.isAutoGift = auto;
        cc.log("INFO GIFT " + JSON.stringify(inf));
        this.info = inf;

        this.gift.setScale(1);
        this.gift.removeAllChildren();
        this.gift.stopAllActions();
        this.lbName.setString(potBreaker.getItemName(this.info.idGift));

        var sp = new cc.Sprite(potBreaker.getTopGiftImage(this.info.idGift));
        //sp.setScale(1.25);
        this.gift.addChild(sp);
        this.gift.setOpacity(255);
        var pSize = this.gift.getContentSize();
        sp.setPosition(pSize.width / 2, pSize.height / 2);

        this.doAnimate();
        this.updateMyRank();
    },

    onGiftSuccess: function () {
        this.circle.setVisible(false);
        this.particle.setVisible(false);

        //var numGold = (this.info.idGift % 1000) * 10;
        var numGold = 100;
        var timeDone = 1 + numGold / 100;
        var eff = new PotBreakerCoinEffectLayer();
        eff.setPositionCoin(SceneMgr.convertPosToParent(this.pEffect, this.gift));
        eff.startEffect(numGold, PotBreakerCoinEffect.TYPE_FLOW);
        eff.setCallbackFinish(this.onBack.bind(this));
        this.pEffect.addChild(eff);
        this.gift.runAction(cc.fadeOut(timeDone));

        var eff = new ImageEffectLayer();
        this.pEffect.addChild(eff);
        eff.setPositionCoin(SceneMgr.convertPosToParent(this.pEffect, this.gift));
        eff.startEffect(100, ImageEffectLayer.TYPE_FLOW, "res/Lobby/GUIVipNew/iconVpoint.png");

        if (this.bg) {
            this.bg.setVisible(true);
            this.bg.runAction(cc.fadeOut(timeDone));
        }
    },

    updateMyRank: function(){
        var strOldRank = localized("POT_TITLE_OPEN_GIFT_GUI");
        this.txtRank.setString(strOldRank);
        this.txtRank.setVisible(false);
        for (var i = PotBreaker.WEEK_START; i < potBreaker.eventTime; i++) {
            var oldData = potBreaker.getMyRankData(i);
            if (oldData){
                if (oldData.myRank !== 0 && oldData.myRank <= PotBreaker.NUMBER_TOP_RANK){
                    strOldRank = StringUtility.replaceAll(strOldRank, "@rank", oldData.myRank);
                    strOldRank = StringUtility.replaceAll(strOldRank, "@week", i);
                    this.txtRank.setVisible(true);
                    this.txtRank.setString(strOldRank);
                    break;
                }
            }
        }
    },

    update: function (dt) {
        // UPDATE RUN FIREWORK
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
                firework = resourceManager.loadDragonbone("firework1");
                this.addChild(firework);
                firework.setScale(2.0);
                this.arrayFirework.push(firework);
            }
            firework.setVisible(true);
            firework.gotoAndPlay("1", -1, -1, 1);
            firework.setPosition(Math.random() * 520 + 100, 100 + Math.random() * 300);
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
    },

    onFinishEffectFirework: function (sender) {
        sender.setVisible(false);
    },

    onButtonRelease: function (button, id) {
        if (id == 1) {
            if (this.isWaitResponse)
                return;
            if (this.info.idGift <= PotBreaker.ITEM_IN_GAME) {
                this.hideAnimate();
                cc.log("REGISTER SUCCESS " + potBreaker.isRegisterSuccess);
                if (potBreaker.isRegisterSuccess) {
                    var cmd = new CmdSendPotBreakerChangeAward();
                    cmd.putData(true, [this.info.idGift]);
                    GameClient.getInstance().sendPacket(cmd);
                }
                else {
                    potBreaker.showRegisterInformation([this.info.idGift]);
                }

                this.onBack();
            }
            else {
                this.isWaitResponse = true;
                var cmd = new CmdSendPotBreakerChangeAward();
                cmd.putData(true, [this.info.idGift]);
                GameClient.getInstance().sendPacket(cmd);
                this.onGiftSuccess();
                NewVipManager.getInstance().setWaiting(true);
            }
        }
        else {
            this.onCapture();
        }
    },

    onCapture: function () {
        this.share.setVisible(false);
        this.btn.setVisible(false);

        //this.girl.setVisible(true);
        this.logo_zp.setVisible(true);
        //this.logo_event.setVisible(true);

        if (!gamedata.checkOldNativeVersion()) {
            var imgPath = sceneMgr.takeScreenShot();
            setTimeout(function () {
                fr.facebook.shareScreenShoot(imgPath, function(result){
                    var message = "";
                    if (result == -1) {
                        message = localized("INSTALL_FACEBOOK");
                    }
                    else if (result == 1) {
                        message = localized("NOT_SHARE");
                    }
                    else if (result == 0) {
                        message = localized("FACEBOOK_DELAY");
                    }
                    else {
                        message = localized("FACEBOOK_ERROR");
                    }
                    Toast.makeToast(Toast.SHORT, message);
                });
            }, 500);
        } else {
            this.captureSuccess = function (social, jdata) {
                var message = "";
                var dom = StringUtility.parseJSON(jdata);
                if (dom["error"] == -1) {
                    message = localized("INSTALL_FACEBOOK");
                }
                else if (dom["error"] == 1) {
                    message = localized("NOT_SHARE");
                }
                else if (dom["error"] == 0) {
                    message = localized("FACEBOOK_DELAY");
                }
                else {
                    message = localized("FACEBOOK_ERROR");
                }
                Toast.makeToast(Toast.SHORT, message);

                //this.topLayer.doneCapturePanel();
            }.bind(this);

            socialMgr.set(this, this.captureSuccess);
            socialMgr.shareImage(socialMgr._currentSocial);

        }

        this.btn.setVisible(true);
        this.share.setVisible(true);

        //this.girl.setVisible(false);
        this.logo_zp.setVisible(false);
        //this.logo_event.setVisible(false);
    },

    onBack: function () {
        this.onClose();
        popUpManager.removePopUp(PopUpManager.RECEIVE_OUT_GIFT);
        potBreaker.showAutoGift();
        NewVipManager.checkShowUpLevelVip();
        this.isWaitResponse = false;
    },
});

var PotBreakerCoinEffectLayer = cc.Layer.extend({

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
            if (this.timeCount >= PotBreakerCoinEffect.TIME_OUT_COIN) {
                var num = 10;
                if (this.typeEffect === PotBreakerCoinEffect.TYPE_FLOW) {
                    num = PotBreakerCoinEffect.NUM_COIN_EACH_TIME * this.timeCount;
                    this.timeCount = 0;
                }
                else if (this.typeEffect == PotBreakerCoinEffect.TYPE_RAIN) {
                    num = PotBreakerCoinEffect.NUM_COIN_RATE_RAIN * 0.05;
                    this.timeCount = PotBreakerCoinEffect.TIME_OUT_COIN - 0.05;
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
                if (this.callBack) {
                    this.callBack.call();
                }
                this.isRun = false;
            }
        }
    },

    startEffect: function (numEffect, type) {
        if (this.isRun)this.stopEffect();
        var coin;
        this.typeEffect = type;
        this.numEffect = numEffect;
        if (numEffect > this.listCoin.length) {
            for (var i = 0, len = numEffect - this.listCoin.length; i < len; i++) {
                coin = this.getCoinItem();
                this.listCoin.push(coin);
                this.addChild(coin);
            }
        }
        for (var i = 0; i < numEffect; i++) {
            coin = this.listCoin[i];
            coin.stop();
            coin.initCoin(type);
        }
        this.numCoinNow = numEffect - 1;
        this.timeCount = 0;
        this.scheduleUpdate();
        this.setVisible(true);
        this.isRun = true;
        this.runAction(cc.sequence(cc.delayTime(PotBreakerCoinEffect.DELAY_PLAY_SOUND), cc.callFunc(function () {
            PotBreakerSound.playCoin();
        })));
    },

    stopEffect: function () {
        for (var i = 0; i < this.listCoin.length; i++) {
            this.listCoin[i].setVisible(false);
        }
    },

    getCoinItem: function () {
        return new PotBreakerCoinEffect();
    }
});

var PotBreakerCoinEffect = cc.Sprite.extend({

    ctor: function (nameSprite) {
        this._super(nameSprite);
        if (!nameSprite){
            var animation = cc.animationCache.getAnimation(PotBreakerCoinEffect.NAME_ANIMATION_COIN);
            if (!animation) {
                var arr = [];
                var cache = cc.spriteFrameCache;
                var aniFrame;
                for (var i = 0; i < PotBreakerCoinEffect.NUM_SPRITE_ANIMATION_COIN; i++) {
                    aniFrame = new cc.AnimationFrame(cache.getSpriteFrame(PotBreakerCoinEffect.NAME_ANIMATION_COIN + i + ".png"), PotBreakerCoinEffect.TIME_ANIMATION_COIN);
                    arr.push(aniFrame);
                }
                for (i = PotBreakerCoinEffect.NUM_SPRITE_ANIMATION_COIN - 2; i >= 1; i--) {
                    aniFrame = new cc.AnimationFrame(cache.getSpriteFrame(PotBreakerCoinEffect.NAME_ANIMATION_COIN + i + ".png"), PotBreakerCoinEffect.TIME_ANIMATION_COIN);
                    arr.push(aniFrame);
                }
                animation = new cc.Animation(arr, PotBreakerCoinEffect.TIME_ANIMATION_COIN);
                cc.animationCache.addAnimation(animation, PotBreakerCoinEffect.NAME_ANIMATION_COIN);
            }
            this.anim = animation;
        }

        this.setVisible(false);
    },

    initCoin: function (type) {
        this.isCollided = false; //kiem tra da cham dat 1 lan chua
        this.opacity = 0;
        var valueRan;
        if (type === PotBreakerCoinEffect.TYPE_FLOW) {
            this.speedX = 2 * Math.random() * PotBreakerCoinEffect.RATE_SPEED_X - PotBreakerCoinEffect.RATE_SPEED_X;
            //this.speedY = Math.random() * PotBreakerCoinEffect.RATE_SPEED_Y + PotBreakerCoinEffect.DEFAULT_SPEED_Y;
            var def = Math.random() * 800 + 800;
            this.speedY = Math.sqrt(def * def - this.speedX * this.speedX);
            this.speedR = 2 * Math.random() * PotBreakerCoinEffect.RATE_SPEED_R - PotBreakerCoinEffect.RATE_SPEED_R;
            valueRan = Math.random() * (PotBreakerCoinEffect.MAX_SCALE - PotBreakerCoinEffect.MIN_SCALE) + PotBreakerCoinEffect.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var p = cc.p(this.getParent().positionCoin.x + (Math.random() - 0.5) * PotBreakerCoinEffect.RATE_Position_X,
                this.getParent().positionCoin.y + (Math.random() - 0.5) * PotBreakerCoinEffect.RATE_Position_Y);
            this.setPosition(p);
        }
        else if (type === PotBreakerCoinEffect.TYPE_RAIN) {
            this.speedX = 0;
            this.speedY = Math.random() * PotBreakerCoinEffect.RATE_SPEED_X;
            this.speedR = 2 * Math.random() * PotBreakerCoinEffect.RATE_SPEED_R - PotBreakerCoinEffect.RATE_SPEED_R;
            valueRan = Math.random() * (PotBreakerCoinEffect.MAX_SCALE - PotBreakerCoinEffect.MIN_SCALE) + PotBreakerCoinEffect.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var parent = this.getParent();
            this.setPosition(Math.random() * parent.width, parent.height + this.height + Math.random() * PotBreakerCoinEffect.RATE_Position_Y);
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
        this.speedY -= PotBreakerCoinEffect.GRAVITY * dt;
        this.rotation += this.speedR;
        //cham dat thi cho nhay len 1 lan roi roi tiep
        if (this.y < this.getContentSize().height / 2 && !this.isCollided) {
            this.isCollided = true;
            this.speedY = -this.speedY * (Math.random() * PotBreakerCoinEffect.RATE_JUMP_BACK);
            this.speedX = 0;
        }
        else if (this.y + (this.height * this.scale) < 0 && this.isCollided) {
            this.stop();
        }
    },

    startFall: function(posStart, randomX, delay){
        setTimeout(function () {
            this.speedX = 0;
            this.speedY = Math.random() * PotBreakerCoinEffect.RATE_SPEED_X;
            this.speedR = 2 * Math.random() * PotBreakerCoinEffect.RATE_SPEED_R - PotBreakerCoinEffect.RATE_SPEED_R;
            this.maxRandomX = randomX;
            var potWidth = 50;
            var potHeight = 35;
            var targetX = posStart.x + potWidth / 2 - Math.random() * potWidth;
            var tarGetY = posStart.y + Math.random() * potHeight / 2;
            this.setPosition(targetX, tarGetY);
            this.scheduleUpdate();
        }.bind(this), delay*1000);
    },

    endFall: function(){
        this.unscheduleUpdate();
    },

    updateFall: function (dt) {
        var opa = this.opacity;
        opa += 1500 * dt;
        if (opa > 255)this.opacity = 255;
        else this.opacity = opa;
        this.x += this.speedX * dt;
        this.y += this.speedY * dt;
        this.speedY -= PotBreakerCoinEffect.GRAVITY * dt;
        this.rotation += this.speedR;
        //cham dat thi cho nhay len 1 lan roi roi tiep
        if (this.y < 50) {
            if (this.isCollided){
                this.endFall();
            } else {
                this.isCollided = true;
                this.speedY = -this.speedY * (Math.random() * PotBreakerCoinEffect.RATE_JUMP_BACK);
                var maxSpeedX = this.maxRandomX || 100;
                this.speedX = maxSpeedX - Math.random() * maxSpeedX * 2;
            }
        }
    },

    update: function (dt) {
        this.updateFall(dt);
    }
});

var PotBreakerHelpGUI = BaseLayer.extend({

    ctor: function () {

        this._currentPage = null;
        this._pageHelp = null;

        this._arrPage = null;
        this._pageInfo = null;

        this.curPage = -1;
        this.isGuideTab = false;

        this._super(PotBreakerHelpGUI.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerHelpGUI.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        var btnClose = this.customButton("btnClose", PotBreakerHelpGUI.BTN_CLOSE, bg);

        this._pageHelp = this.getControl("pageHelp", bg);
        var page = this._pageHelp.getPage(0);
        var game = LocalizedString.config("GAME");
        if (game.indexOf("sam") >= 0 || game.indexOf("binh") >= 0) {
            // page.setBackGroundImage("res/Event/PotBreaker/PotBreakerUI/help1_1.png");
        }

        // page.setVisible(false);

        this._arrPage = [];
        for (var i = 0; i < PotBreakerHelpGUI.NUM_PAGE_HELP; i++) {
            this._arrPage[i] = this.customButton("btnPage" + i, i, bg);
            this._arrPage[i].setPressedActionEnabled(false);
        }

        this._currentPage = this.getControl("imgCurPage", bg);
        this._pageHelp.addEventListener(this.onPageListener.bind(this), this);
        this._pageHelp.setCustomScrollThreshold(0.3);

        this.btnTabGuide = this.customButton("btnTabGuide", PotBreakerHelpGUI.BTN_TAB_GUIDE, bg, false);
        this.btnRegisterInfo = this.customButton("btnRegisterInfo", PotBreakerHelpGUI.BTN_TAB_REGISTER_INFO, bg, false);
        this.pHelp = this.getControl("pHelp", bg);
        this.pRegisterInfo = this.getControl("pRegisterInfo", bg);
        this.pHaveInfo = this.getControl("pHaveInfo", this.pRegisterInfo);
        this.txtNoInfo = this.getControl("txtNoInfo", this.pRegisterInfo);

        this.txtRegisName = this.getControl("txtName", this.pRegisterInfo);
        this.txtRegisPhone = this.getControl("txtSdt", this.pRegisterInfo);
        this.txtRegisIdentity = this.getControl("txtCmnd", this.pRegisterInfo);
        this.txtRegisAddress = this.getControl("txtAdd", this.pRegisterInfo);
        this.txtRegisEmail = this.getControl("txtEmail", this.pRegisterInfo);
        this.gift = this.getControl("gift", this.pRegisterInfo);
        this.btnFanpage = this.customButton("btnFanpage", PotBreakerHelpGUI.BTN_FANPAGE, this.pRegisterInfo);

        this.enableFog(true);
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);

        this.onPageListener();
        this.switchTabGuide(true);

        var cmd = new CmdSendPotBreakerGetRegisterInfo();
        GameClient.getInstance().sendPacket(cmd);
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
        }
    },

    switchTabGuide: function(isGuideTab){
        this.isGuideTab = isGuideTab;
        if (isGuideTab){
            this.btnRegisterInfo.getChildByName("bg").setOpacity(100);
            this.btnRegisterInfo.getChildByName("title").setColor(cc.color("#FFFFFF"));
            this.btnTabGuide.getChildByName("bg").setOpacity(255);
            this.btnTabGuide.getChildByName("title").setColor(cc.color("#E55D23"));
        } else {
            this.btnRegisterInfo.getChildByName("bg").setOpacity(255);
            this.btnRegisterInfo.getChildByName("title").setColor(cc.color("#E55D23"));
            this.btnTabGuide.getChildByName("bg").setOpacity(100);
            this.btnTabGuide.getChildByName("title").setColor(cc.color("#FFFFFF"));
        }

        this.pHelp.setVisible(isGuideTab);
        this.pRegisterInfo.setVisible(!isGuideTab);

        this.pHaveInfo.setVisible(potBreaker.isRegisterSuccess);
        this.txtNoInfo.setVisible(!potBreaker.isRegisterSuccess);
    },

    onButtonRelease: function (button, id) {
        if (id == PotBreakerHelpGUI.BTN_FANPAGE) {
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
        switch (id) {
            case PotBreakerHelpGUI.BTN_PAGE_0:
            case PotBreakerHelpGUI.BTN_PAGE_1:
            case PotBreakerHelpGUI.BTN_PAGE_2:
            case PotBreakerHelpGUI.BTN_PAGE_3:
            case PotBreakerHelpGUI.BTN_PAGE_4:{
                this._pageHelp.scrollToPage(id);
                this.onPageListener();
                break;
            }
            case PotBreakerHelpGUI.BTN_CLOSE:{
                this.onBack();
                break;
            }
            case PotBreakerHelpGUI.BTN_TAB_GUIDE:
            case PotBreakerHelpGUI.BTN_TAB_REGISTER_INFO:{
                this.switchTabGuide(id === PotBreakerHelpGUI.BTN_TAB_GUIDE);
                break;
            }
        }
    },

    updateRegisterInfo: function(){
        var data = potBreaker.registerInfo;
        if (potBreaker.isRegisterSuccess){
            this.txtRegisName.setString(data.fullName);
            this.txtRegisAddress.setString(data.address);
            this.txtRegisEmail.setString(data.email);
            this.txtRegisIdentity.setString(data.identity);
            this.txtRegisPhone.setString(data.phone);

            this.gift.setString(potBreaker.getItemName(data.registerGiftIds[0]));
        }

        this.switchTabGuide(this.isGuideTab);
    },

    onBack: function () {
        this.onClose();
    }
});

var PotBreakerRegisterInformationGUI = BaseLayer.extend({

    ctor: function () {
        this.giftIds = [];

        this.txName = null;
        this.txAddress = null;
        this.txCmnd = null;
        this.txSdt = null;
        this.txEmail = null;

        this.btnRegister = null;

        this._super(PotBreakerRegisterInformationGUI.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerRegisterInformationGUI.json");
    },

    initGUI: function () {

        this._bg = this.getControl("bg");

        this.customButton("close", PotBreakerRegisterInformationGUI.BTN_CLOSE, this._bg);
        this.btnRegister = this.customButton("complete", PotBreakerRegisterInformationGUI.BTN_OK, this._bg);
        this.btnRegister.enable = false;
        this.btnFanpage = this.customButton("btnFanpage", PotBreakerRegisterInformationGUI.BTN_FANPAGE, this._bg);

        this.pRegister = this.getControl("pRegister", this._bg);

        this.giftName = this.getControl("gift", this._bg);

        // init editbox
        this.txName = this.createExitBox(this.getControl("bgName", this._bg), LocalizedString.to("POT_NAME"), PotBreakerRegisterInformationGUI.TF_NAME);
        this.txName.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this.txName.setMaxLength(28);
        this.pRegister.addChild(this.txName);

        this.txAddress = this.createExitBox(this.getControl("bgAdd", this._bg), LocalizedString.to("POT_ADDRESS"), PotBreakerRegisterInformationGUI.TF_ADDRESS);
        this.txAddress.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this.txAddress.setMaxLength(28);
        this.pRegister.addChild(this.txAddress);

        this.txCmnd = this.createExitBox(this.getControl("bgCmnd", this._bg), LocalizedString.to("POT_CMND"), PotBreakerRegisterInformationGUI.TF_CMND);
        this.txCmnd.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this.txCmnd.setMaxLength(28);
        this.pRegister.addChild(this.txCmnd);

        this.txSdt = this.createExitBox(this.getControl("bgSdt", this._bg), LocalizedString.to("POT_PHONE"), PotBreakerRegisterInformationGUI.TF_PHONE);
        this.txSdt.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this.txSdt.setMaxLength(28);
        this.pRegister.addChild(this.txSdt);

        this.txEmail = this.createExitBox(this.getControl("bgEmail", this._bg), LocalizedString.to("POT_EMAIL"), PotBreakerRegisterInformationGUI.TF_EMAIL);
        this.txEmail.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this.txEmail.setMaxLength(30);
        this.pRegister.addChild(this.txEmail);

        this.pSuccess = this.getControl("pSuccess", this._bg);
        this.pSuccess.setVisible(false);

        this.enableFog();
        this.setBackEnable(true);
    },

    createExitBox: function (bg, name, tag) {
        var edb = new cc.EditBox(bg.getContentSize(), new cc.Scale9Sprite());
        edb.setFont("res/fonts/tahomabd.ttf", 17);
        edb.setPlaceHolder(name);
        edb.setPlaceholderFont("res/fonts/tahomabd.ttf", 15);
        // edb.setPlaceholderFontSize(15);
        edb.setPlaceholderFontColor(cc.color(135, 75, 45));
        var position = bg.getPosition();
        position.x += 20;
        edb.setPosition(position);
        edb.setFontColor(cc.color(0, 102, 0));
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

    editBoxEditingDidEnd: function (editBox) {
        var tag = parseInt(editBox.getTag());
        if (isNaN(tag)) return;

        var str = editBox.getString().trim();
        switch (tag) {
            case PotBreakerRegisterInformationGUI.TF_NAME:
            {
                this.checkTextInput(str, 3, LocalizedString.to("POT_INPUT_NAME"));
                break;
            }
            case PotBreakerRegisterInformationGUI.TF_ADDRESS:
            {
                this.checkTextInput(str, 3, LocalizedString.to("POT_INPUT_ADDRESS"));
                break;
            }
            case PotBreakerRegisterInformationGUI.TF_PHONE:
            {
                this.checkTextInput(str, 9, LocalizedString.to("POT_INPUT_PHONE"));
                break;
            }
            case PotBreakerRegisterInformationGUI.TF_CMND:
            {
                this.checkTextInput(str, 9, LocalizedString.to("POT_INPUT_CMND"));
                break;
            }
            case PotBreakerRegisterInformationGUI.TF_EMAIL:
            {
                this.validateEmail(str, LocalizedString.to("POT_INPUT_EMAIL"));
                break;
            }
        }

        this.autoCheckRegisterEnable();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);

        this.txName.setString("");
        this.txAddress.setString("");
        this.txCmnd.setString("");
        this.txSdt.setString("");
        this.txEmail.setString("");

        this.enableRegisterButton(false);
    },

    updateInfor: function (gIds) {
        var str = "";
        for (var i = 0; i < gIds.length; i++) {
            str += potBreaker.getItemName(gIds[i]);
            if (i < gIds.length - 1) {
                str += ",";
            }
        }
        this.giftName.setString(str);
        this.giftIds = gIds;
        this.pRegister.setVisible(true);
        this.pSuccess.setVisible(false);
        this.isWaitResponse = false;
    },

    updateInfoGiftAfterEvent: function () {
        this.giftName.setString(event.giftName);
        this.giftIds = event.giftId;
        this.pRegister.setVisible(true);
        this.pSuccess.setVisible(false);
        this.isWaitResponse = false;
        this.isReceiveAfterEvent = true;
    },

    onCompleteRegister: function () {
        if (this.isWaitResponse)
            return;
        this.autoCheckRegisterEnable();

        var name = this.txName.getString().trim();
        var address = this.txAddress.getString().trim();
        var cmnd = this.txCmnd.getString().trim();
        var sdt = this.txSdt.getString().trim();
        var email = this.txEmail.getString().trim();

        if (!this.checkTextInput(name, 3, LocalizedString.to("POT_INPUT_NAME"))) {
            return;
        }
        else if (!this.checkTextInput(address, 3, LocalizedString.to("POT_INPUT_ADDRESS"))) {
            return;
        }
        else if (!this.checkTextInput(cmnd, 9, LocalizedString.to("POT_INPUT_CMND"))) {
            return;
        }
        else if (!this.checkTextInput(sdt, 9, LocalizedString.to("POT_INPUT_PHONE"))) {
            return;
        }
        else if (!this.validateEmail(email, LocalizedString.to("POT_INPUT_EMAIL"))) {
            return;
        }
        else {
            if (this.isReceiveAfterEvent) {
                var cmd = new CmdSendEventChangeAward();
                cmd.putData(event.eventIdRegister, this.giftIds, name, address, cmnd, sdt, email);
                GameClient.getInstance().sendPacket(cmd);
                this.isWaitResponse = true;//
                this.onClose();
            }
            else {
                var cmd = new CmdSendPotBreakerChangeAward();
                cmd.putData(true, this.giftIds, name, address, cmnd, sdt, email);
                GameClient.getInstance().sendPacket(cmd);
                this.isWaitResponse = true;//
            }

            // var split = PotBreaker.SPLIT_SYMBOL;
            // var saveInfo = name + split + address + split + cmnd + split + sdt + split + email;
            // cc.sys.localStorage.setItem(PotBreaker.KEY_SAVE_INFO, saveInfo);
            // this.pSuccess.setVisible(true);
            // this.pRegister.setVisible(false);
        }
    },

    onRegisterSuccess: function(){
        this.pSuccess.setVisible(true);
        this.pRegister.setVisible(false);
    },

    onButtonRelease: function (btn, id) {
        if (id == PotBreakerRegisterInformationGUI.BTN_FANPAGE) {
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

        if (id == PotBreakerRegisterInformationGUI.BTN_OK) {
            if (this.btnRegister.enable)
                this.onCompleteRegister();
        }
        else {
            this.onBack();
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var PotBreakerOpenResultGUI = BaseLayer.extend({

    ctor: function () {
        this.pos = [];

        this.title = null;
        this.btn = null;
        this.gift = null;

        this.goldPos = null;
        this.desPos = null;

        this.logo_zp = null;

        this.defaultItem = null;

        this.bg = null;
        this.spGifts = [];
        this.arGifts = [];

        this.list = null;
        this.uiGift = null;

        this.isAutoGift = false;
        this.cmd = null;

        this.countTimeCreateFlower = 0;
        this.deltaTimeCreateFlower = 0.4;

        this.maxSpeedThrowFlowerX = 300;
        this.maxSpeedThrowFlowerY = -400;
        this.randomSpeedY = 500;
        this.randomSpeedX = 1000;

        this._super(PotBreakerOpenResultGUI.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerOpenResultGUI.json");
    },

    initGUI: function () {
        var winSize = cc.director.getWinSize();

        this.bg = this.getControl("bg");
        var top = this.getControl("pTop");
        var bot = this.getControl("pBot");

        this.bgSize = this.bg.getContentSize();

        this.title = this.getControl("congrat0", top);
        this.title.pos = this.title.getPosition();
        this.bgTitle = this.getControl("bgCongrat", top);
        this.title2 = this.getControl("congrat1", top);
        this.bgTitle.pos = this.bgTitle.getPosition();
        this.title2.pos = this.title2.getPosition();

        this.btn = this.customButton("btnGet", 1, bot);
        this.btn.pos = this.btn.getPosition();

        this.deco = this.getControl("deco");
        this.deco.pos = this.deco.getPosition();

        this.share = this.customButton("btnShare", 2, bot);
        this.share.pos = this.share.getPosition();

        this.logo_zp = this.getControl("logo", bot);

        // item in list <= 10
        this.gift = this.getControl("pCenter");
        this.defaultItem = this.getControl("defaultItem", this.gift).clone();
        this.defaultItem.size = this.defaultItem.getContentSize();
        this.defaultItem.size.width *= 1.05;
        this.defaultItem.size.height *= 1.15;
        this.defaultItem.padX = this.defaultItem.size.width * 0.05;
        this.defaultItem.padY = this.defaultItem.size.height * 0.05;

        // update pos
        var pTop = this.calculateStartPos(5, 2, 0);
        var pBot = this.calculateStartPos(5, 2, 1);

        var topH = (winSize.height - pTop.y - this.defaultItem.size.height / 2) / 2;
        var pY = pTop.y + this.defaultItem.size.height / 2 + topH + top.getContentSize().height * this._scale / 2;
        if (pY > winSize.height) pY = winSize.height;
        // top.setPositionY(pY);
        //  bot.setPositionY(pBot.y / 2 - this.defaultItem.size.height / 10 - bot.getContentSize().height * this._scale);

        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.gift.removeAllChildren();

        this.title.setVisible(false);
        this.btn.setVisible(false);
        //this.share.setVisible(false);
        this.logo_zp.setVisible(false);


        this.title.setPosition(this.title.pos);
        this.btn.setPosition(this.btn.pos);
        this.deco.setPosition(this.deco.pos);
        this.deco.setVisible(false);
        this.title2.setVisible(false);
        this.bgTitle.setVisible(false);
        this.title2.setPosition(this.title2.pos);
        this.bgTitle.setPosition(this.bgTitle.pos);

        this.scheduleUpdate();

        // this.decorLeft.setRotation(-45);
        // this.decorRight.setRotation(45);
        // this.share.setPosition(this.share.pos);
    },

    onExit: function(){
        this._super();
        this.bg.removeAllChildren(true);
        this.unscheduleUpdate();
        popUpManager.removePopUp(PopUpManager.RECEIVE_IN_GIFT);
    },

    // open gui
    openGift: function (obj, numGift, desPos, goldPos, isReceiveToken) {
        this.isAutoGift = false;

        this.goldPos = this.gift.convertToNodeSpace(goldPos);
        this.desPos = this.gift.convertToNodeSpace(desPos);

        // cc.log("openGift: " , JSON.stringify(obj), JSON.stringify(numGift), JSON.stringify(desPos), JSON.stringify(goldPos));
        var gifts = [];

        var i;
        var totalGold = 0;
        for (i = 0; i < obj.length; i++){
            if (!potBreaker.isItemStored(obj[i])){
                // case doi li xi
                if (obj[i] === 0){
                    totalGold = numGift[i];
                    break;
                }
                totalGold += potBreaker.getItemValue(obj[i]) * numGift[i];
            }
        }
        var ooo = {};

        for (i = 0; i < obj.length; i++){
            ooo = {};
            ooo.id = obj[i];
            ooo.isStored = potBreaker.isItemStored(ooo.id);
            ooo.value = numGift[i];
            if (ooo.isStored){
                var idToken = potBreaker.getTokenLocalId(ooo.id);
                var targetToken = potBreaker.potBreakerScene.listButtonToken[idToken].imgToken;
                var targetPos = targetToken.getParent().convertToWorldSpace(targetToken.getPosition());
                ooo.desPos = this.gift.convertToNodeSpace(targetPos);
                // cc.log("targetPos: " , JSON.stringify(targetPos), JSON.stringify(ooo.desPos));
                gifts.push(ooo);
            }
        }

        gifts.sort(function (a, b) {
            return (parseInt(a.id) - parseInt(b.id));
        });

        if (totalGold > 0){
            ooo = {};
            ooo.id = 100;
            ooo.isStored = false;
            ooo.value = totalGold;
            ooo.desPos = this.desPos;
            gifts.push(ooo);
        }

        // cc.log("ShowGift : " + JSON.stringify(gifts));

        this.arGifts = gifts;

        var nGift = gifts.length;

        this.gift.removeAllChildren();

        var nCol = [];
        var nRow = 1;

        nCol[0] = nGift;

        var timeDelay = 0.5;
        var timeShow = 0.5;
        var count = 0;
        this.spGifts = [];

        var pStart = this.calculateStartPos(nCol[0], nRow, 0);
        for (i = 0; i < nCol[0]; i++) {
            var inf = gifts[count++];

            var p = new PotBreakerResultGift();
            p.setGift(inf, isReceiveToken);
            p.setPosition(pStart.x + i * (this.defaultItem.size.width + this.defaultItem.padX), pStart.y);
            p.setScale(0);
            p.runAction(cc.sequence(cc.delayTime(timeShow * 2 + 0.1 * i), new cc.EaseBackOut(cc.scaleTo(timeShow, 1))));
            this.gift.addChild(p);
            this.spGifts.push(p);
        }

        var actionSound = (isReceiveToken) ? cc.callFunc(PotBreakerSound.playGift) : cc.callFunc(PotBreakerSound.playFinishBreak);
        this.runAction(cc.sequence(cc.delayTime(timeDelay), actionSound));

        this.bg.stopAllActions();
        this.bg.setOpacity(0);
        this.bg.setVisible(true);
        this.bg.runAction(cc.sequence(cc.fadeTo(timeShow , 220), cc.callFunc(this.onFinishEffect.bind(this))));

        var strImage = (isReceiveToken) ? "titleChangeLixi.png" : "title_receive.png";
        strImage = PotBreaker.DEFAUT_FOLDER_UI + strImage;
        this.title2.loadTexture(strImage);
    },

    getGift: function () {
        var delay = 0;
        this.runEffectMoveOut(this.deco, 0, 400, delay);

        // delay += 0.3;
        this.runEffectMoveOut(this.title, 0, 400, delay);
        // delay += 0.2;
        this.runEffectMoveOut(this.bgTitle, 0, 400, delay);
        this.runEffectMoveOut(this.title2, 0, 400, delay);
        this.runEffectMoveOut(this.btn, 0, -400, delay);

        delay += 0.3;
        //  this.share.setVisible(true);
        //  this.share.setPosition(this.share.pos);
        //  this.share.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.share.pos.x, this.share.pos.y - 400))));

        this.bg.setOpacity(220);
        this.bg.setVisible(true);
        this.bg.runAction(cc.fadeOut(2));

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
                time = this.dropPiece(ggg.id, ggg.value, spGift.getPosition(), ggg.desPos, true);
                actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id, ggg.value, spGift.getPosition(), ggg.desPos, false));
            }
            else {  // drop gold
                var num = potBreaker.getItemValue(ggg.id) * ggg.value;
                time = this.dropGold(num, spGift.getPosition(), this.goldPos, true);
                actDrop = cc.callFunc(this.dropGold.bind(this, num, spGift.getPosition(), this.goldPos, false));
            }

            if (time > lastTime) lastTime = time;

            actHide = cc.spawn(cc.scaleTo(timeHide, 0), cc.fadeOut(timeHide));
            totalEffectTime += lastTime;
            spGift.runAction(cc.sequence(cc.delayTime(delay + delayTime * (i + 1)), actHide, actDrop));
            // spGift.runAction(cc.sequence(actHide, actDrop));
        }
        totalTime = lastTime + delayTime * size + timeHide + delay;
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
            var sp = new cc.Sprite(potBreaker.getPieceImage(id));
            sp.id = id;
            var scale = 0.25;
            // sp.setScale(scale);
            var rnd = parseInt(Math.random() * 10) % 2 == 0;
            var pCX = Math.random() * winSize.width;
            var pCY = Math.random() * winSize.height;
            var posCenter = cc.p(pCX, pCY);
            var actMove = new cc.BezierTo(timeMove, [pStart, posCenter, pEnd]);
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            var actScale = cc.scaleTo(timeMove, scale);
            var actionSound = cc.callFunc(function () {
                if (this === 0){
                    PotBreakerSound.playPiece();
                }
            }.bind(i));
            sp.runAction(cc.sequence(cc.delayTime(dTime * i), cc.spawn(actMove, actScale), actHide, actionSound,
                cc.callFunc(function () {
                    if (potBreaker.potBreakerScene) {
                        potBreaker.potBreakerScene.onEffectUpdateToken(this.id);
                    }
                }.bind(sp))));
            sp.setPosition(pStart);
            this.gift.addChild(sp, value - i);
        }

        return 0;
    },

    dropGold: function (gold, pStart, pEnd, checkTime) {
        // if (num > 50) num = 50;


        var timeMove = 1.5;
        var dTime = 0.2;
        var timeHide = 0.25;
        var timeShow = 0.15;

        if (checkTime) {
            return timeMove + timeHide + dTime + timeShow;
        }

        var winSize = cc.director.getWinSize();
        var rangeX = [-50, 50];
        var rangeY = [-50, 50];

        var num = potBreaker.getNumberGoldEffect(gold);
        var goldReturn = Math.floor(gold / num);
        for (var i = 0; i < num; i++) {
            //var sp = cc.Sprite.create("Event/PotBreaker/PotBreakerUI/icon_gold.png");
            var sp = new PotBreakerCoinEffect();
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
            var actMove = new cc.EaseSineOut(new cc.BezierTo(timeMove, [posStart, posCenter, pEnd]));
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            sp.setPosition(posStart);
            sp.setRotation(rndRotate);
            this.gift.addChild(sp);
            sp.setScale(0);

            var actionSound = cc.callFunc(function () {
                if (this < 3){
                    PotBreakerSound.playSingleCoin();
                }
            }.bind(i));

            sp.runAction(cc.sequence(cc.delayTime(Math.random() * dTime), actShow, cc.spawn(actMove, cc.sequence(cc.delayTime(1.5 * Math.random()), actionSound)), cc.callFunc(function () {
                if (potBreaker.potBreakerScene) {
                    potBreaker.potBreakerScene.onEffectGetMoneyItem(goldReturn);
                }
            }.bind(this, goldReturn)), actHide));
        }
        return 0;
    },

    finishCardMoving: function () {
        cc.error("sua lai finishCardMoving");
        // var card = new PotBreakerImage(-1, this.scaleCard != 1);
        // card.setPosition(this.getPosition());
        // this.getParent().addChild(card);
        // card.zoomEffect(this.scaleCard != 1);
    },

    onFinishEffect: function () {
        var delay = 0;
        this.runEffectMoveIn(this.deco, 0, 400, delay);
        // this.runEffectMoveIn(this.decorRight, 400, 400, delay);
        delay += 0.3;
        this.runEffectScale(this.title, 0.01, delay);
        delay += 0.15;
        this.runEffectScale(this.bgTitle, 0.01, delay);
        delay += 0.15;
        this.runEffectScale(this.title2, 0.01, delay);
        delay += 0.2;

        this.runEffectMoveIn(this.btn, 0, -400, delay);

        // this.throwFlower();
        //  this.share.setVisible(true);
        //  this.share.setPositionY(this.share.pos.y - 400);
        //  this.share.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.share.pos)));
    },

    runEffectMoveIn: function(target, startX, startY, delay){
        target.setVisible(true);
        target.setPosition(target.pos.x + startX, target.pos.y + startY);
        target.runAction(cc.sequence(cc.delayTime(delay),new cc.EaseBackOut(cc.moveTo(0.35, target.pos))));
    },

    runEffectMoveOut: function(target, startX, startY, delay){
        target.setVisible(true);
        target.setPosition(target.pos);
        target.runAction(cc.sequence(cc.delayTime(delay),new cc.EaseBackIn(cc.moveTo(0.5, cc.p(target.pos.x + startX, target.y + startY)))));
    },

    runEffectScale: function(target, startScale, delay){
        target.setVisible(true);
        target.setScale(startScale);
        target.runAction(cc.sequence(cc.delayTime(delay),new cc.EaseBackOut(cc.scaleTo(0.35, 1))));
    },

    throwFlower: function(){
        var numFlower = 25;
        for (var i = 0; i < numFlower; i++) {
            var flower = new PotBreakerFlowerEffect();
            flower.setPosition(0, this.bgSize.height);
            this.bg.addChild(flower);
            setTimeout(function () {
                this.startFall(this.targetSpeedX, this.targetSpeedY);
            }.bind(flower), Math.random() * 300);
            flower.targetSpeedX = this.maxSpeedThrowFlowerX + Math.random() * this.randomSpeedX;
            flower.targetSpeedY = this.maxSpeedThrowFlowerY - Math.random() * this.randomSpeedY;
        }

        for (i = 0; i < numFlower; i++) {
            flower = new PotBreakerFlowerEffect();
            flower.setPosition(this.bgSize.width, this.bgSize.height);
            this.bg.addChild(flower);
            setTimeout(function () {
                this.startFall(-this.targetSpeedX, this.targetSpeedY);
            }.bind(flower), Math.random() * 300);
            flower.targetSpeedX = this.maxSpeedThrowFlowerX + Math.random() * this.randomSpeedX;
            flower.targetSpeedY = this.maxSpeedThrowFlowerY - Math.random() * this.randomSpeedY;
        }
    },

    effectMoney: function (sender, value) {
        if (value === undefined || value == null) return;

        if (potBreaker.potBreakerScene) {
            potBreaker.potBreakerScene.onEffectGetMoneyItem(value);
        }
    },

    // ui function
    onButtonRelease: function (btn, id) {
        if (id == 1) {
            this.onBack();
        }
        else {
            this.onCapture();
        }
    },

    onBack: function () {
        // if (this.isAutoGift) {
        //     var gIds = [];
        //     for (var i = 0; i < this.cmd.gifts.length; i++) {
        //         if (potBreaker.isItemOutGame(this.cmd.gifts[i].id)) {
        //             gIds.push(this.cmd.gifts[i].id);
        //         }
        //     }
        //     if (gIds.length > 0) {
        //         if (potBreaker.isRegisterSuccess) {
        //             var cmd = new CmdSendPotBreakerChangeAward();
        //             cmd.putData(false, gIds);
        //             GameClient.getInstance().sendPacket(cmd);
        //         }
        //         else {
        //             potBreaker.showRegisterInformation(gIds);
        //         }
        //     }
        //     this.onClose();
        // }
        // else {
        this.getGift();
        popUpManager.removePopUp(PopUpManager.RECEIVE_IN_GIFT);
        //this.onCloseGUI();
        // }
    },

    onCapture: function () {
        this.share.setVisible(false);
        this.btn.setVisible(false);

        this.logo_zp.setVisible(true);

        this.onShareImg = function (social, jdata) {
            var message = "";
            var dom = StringUtility.parseJSON(jdata);// JSON.parse(jdata);
            if (dom["error"] == -1) {
                message = localized("INSTALL_FACEBOOK");
            }
            else if (dom["error"] == 1) {
                message = localized("NOT_SHARE");
            }
            else if (dom["error"] == 0) {
                message = localized("FACEBOOK_DELAY");
            }
            else {
                message = localized("FACEBOOK_ERROR");
            }
            Toast.makeToast(Toast.SHORT, message);

        }.bind(this);

        socialMgr.set(this, this.onShareImg);
        socialMgr.shareImage(SocialManager.FACEBOOK);

        this.share.setVisible(true);
        this.btn.setVisible(true);

        this.logo_zp.setVisible(false);
    },

    onCloseGUI: function () {
        if (potBreaker.potBreakerScene){
            potBreaker.potBreakerScene.onFinishEffectShowResult();
        }

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
        pos.y = pSize.height / 1.5 - nHeight / 2 ;
        return pos;
    },

    update: function (dt) {
        // this.countTimeCreateFlower += dt;
        // if (this.countTimeCreateFlower > this.deltaTimeCreateFlower){
        //     this.countTimeCreateFlower -= this.deltaTimeCreateFlower;
        //     var flower = new PotBreakerFlowerEffect();
        //     flower.setPosition(Math.random() * this.bgSize.width, this.bgSize.height);
        //     this.bg.addChild(flower);
        //     flower.startFall(0, 0);
        // }
    }
});

var PotBreakerResultGift = cc.Node.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/PotBreaker/PotBreakerGiftResultNode.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.num = ccui.Helper.seekWidgetByName(this._layout, "num");
        this.name = ccui.Helper.seekWidgetByName(this._layout, "name");
        this.particle = this._layout.getChildByName("particle");
        this.circle = ccui.Helper.seekWidgetByName(this._layout, "circle");

        this.circle.setScale(0);
        this.circle.runAction(cc.sequence(cc.spawn(cc.scaleTo(1.5, 1), cc.rotateTo(1.5, 360)), cc.repeatForever(cc.rotateBy(0.15, 5))));
        this.circle.runAction(cc.repeatForever(cc.rotateBy(0.15, 5)));
    },

    setGift: function (inf, isToken) {
        // cc.log("-->Info " + JSON.stringify(inf));
        isToken = isToken || false;
        if (potBreaker.isItemStored(inf.id)) {
            var str = potBreaker.getItemName(inf.id);
            this.name.setString(str);
            this.name.setColor(potBreaker.getItemColor(inf.id));
        }
        else {
            this.name.setString(StringUtility.formatNumberSymbol(inf.value));
            this.name.setColor(cc.color("#fef5d7"));
        }

        this.particle.setVisible(isToken);
        this.circle.setVisible(isToken);

        this.num.setString("x"+inf.value);
        this.num.setVisible(inf.value > 1 && potBreaker.isItemStored(inf.id));

        this.img.removeAllChildren();

        if (inf.isStored){
            var effect;

            effect = new cc.Sprite(PotBreaker.DEFAUT_FOLDER_UI + "iconToken" + inf.id + ".png");
            effect.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
            this.img.addChild(effect);
            effect.setScale(0.8);


        } else {
            var sprite = new cc.Sprite(inf.isStored ? potBreaker.getPieceImage(inf.id) : "res/Event/PotBreaker/PotBreakerUI/e10.png");
            sprite.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
            this.img.addChild(sprite);

            var sX = this.img.getContentSize().width / sprite.getContentSize().width;
            var sY = this.img.getContentSize().height / sprite.getContentSize().height;
            sprite.setScale(Math.min(sX, sY));
        }
    }
});

var PotBreakerChangeLixiLayer = BaseLayer.extend({
    ctor: function () {
        this.tokenId = 0;
        this._super(PotBreakerChangeLixiLayer.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerChangeLixiLayer.json");
    },

    initGUI: function () {
        this.pChange = this.getControl("pChange");
        var bg = this.getControl("bg", this.pChange);

        this.txtMoney = this.getControl("txtMoney", bg);
        this.txtName = this.getControl("txtName", bg);
        this.imgToken = this.getControl("imgToken", bg);
        this.imgLixi = this.getControl("imgLixi", bg);
        this.txtNumToken = this.getControl("txtNumToken", bg);
        this.txtNumLixi = this.getControl("txtNumLixi", bg);
        this.txtChangeLixiNote = this.getControl("txtChangeLixiNote", bg);
        this.btnChange = this.customButton("btnChange", PotBreakerChangeLixiLayer.BTN_CHANGE, bg);
        this.btnClose = this.customButton("btnClose", PotBreakerChangeLixiLayer.BTN_CLOSE, bg);
    },

    setInfo: function (tokenId) {
        var timeDelay = this.hideLixi();

        this.tokenId = tokenId;
        var localId = potBreaker.getTokenLocalId(tokenId);
        this.imgToken.loadTexture(potBreaker.getPieceImage(tokenId));
        this.imgLixi.loadTexture(potBreaker.getLixiImage(localId));
        this.txtName.setString(potBreaker.getItemName(tokenId));
        var moneyStr = StringUtility.formatNumberSymbol(potBreaker.getItemValue(tokenId));
        moneyStr += localized("POT_GOLD");
        this.txtMoney.setString(moneyStr);

        var tokenInfo = null;
        for (var i in potBreaker.tokenInfos){
            if (potBreaker.tokenInfos[i].ids === tokenId){
                tokenInfo = potBreaker.tokenInfos[i];
                break;
            }
        }

        var numToken = tokenInfo ? tokenInfo.numberToken : 0;
        var numTokenNeedToClaim = tokenInfo ? tokenInfo.numberTokenNeedToClaim : PotBreaker.NUMBER_TOKEN_NEED_TO_CLAIM;
        var canChange = numToken >= numTokenNeedToClaim;
        this.txtChangeLixiNote.setVisible(!canChange);
        var lixiNote = localized("POT_CHANGE_LIXI_NOTE");
        lixiNote = StringUtility.replaceAll(lixiNote, "@token", potBreaker.getItemName(this.tokenId));
        var note2 = localized("POT_CHANGE_LIXI_NOTE1");
        note2 = StringUtility.replaceAll(note2, "@token", potBreaker.getItemName(this.tokenId));
        lixiNote = lixiNote + "\n" + note2;
        // lixiNote = "lfjsd \nfkjdsl";
        // this.txtChangeLixiNote.ignoreContentAdaptWithSize(true);
        this.txtChangeLixiNote.setString(lixiNote);
        this.btnChange.setVisible(canChange);
        var numLixiCanChange = Math.floor(numToken / numTokenNeedToClaim);
        this.txtNumLixi.setString("x" + numLixiCanChange);
        this.txtNumToken.setString(numToken + "/" + numTokenNeedToClaim);

        if (potBreaker.potBreakerScene){
            var btnToken = potBreaker.potBreakerScene.listButtonToken[localId];
            var oldPos = btnToken.getParent().convertToWorldSpace(btnToken.getPosition());
            var targetX;
            if (tokenId % 100 <= 20) { // token o phia ben trai, show thong tin bi che, day toa do ra ben phai
                targetX = oldPos.x + btnToken.getContentSize().width /2 + this.pChange.getContentSize().width;
            }
            else {
                targetX = oldPos.x - btnToken.getContentSize().width /2;
            }

            targetX = oldPos.x - btnToken.getContentSize().width /2;

            var time = 0.5;
            var actionMove = new cc.EaseExponentialOut(cc.moveTo(time,targetX, oldPos.y));
            var actionScale = new cc.EaseExponentialOut(cc.scaleTo(time,1));
            var actionShow = new cc.EaseExponentialOut(cc.fadeIn(time/2));
            this.pChange.runAction(cc.sequence(cc.delayTime(timeDelay),cc.callFunc(function () {
                this.pChange.setOpacity(125);
                this.pChange.setPosition(oldPos);
                this.pChange.setScale(0.01);
            }.bind(this)), cc.spawn(actionMove, actionScale, actionShow)));
        }
    },

    hideLixi: function(){

        var localId = potBreaker.getTokenLocalId(this.tokenId);
        this.pChange.stopAllActions();
        if (potBreaker.potBreakerScene && this.isVisible() && localId >= 0){
            var btnToken = potBreaker.potBreakerScene.listButtonToken[localId];
            var oldPos = btnToken.getParent().convertToWorldSpace(btnToken.getPosition());
            var time = 0.3;
            var actionMove = new cc.EaseExponentialOut(cc.moveTo(time,oldPos));
            var actionScale = new cc.EaseExponentialOut(cc.scaleTo(time,0.01));
            var actionTime = time * 2 / 3;
            var actionHide = new cc.EaseExponentialOut(cc.fadeOut(actionTime));
            this.pChange.runAction(cc.sequence(cc.spawn(actionMove, actionScale, actionHide)));
            this.tokenId = 0;
            return actionTime;
        }
        return 0;
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case PotBreakerChangeLixiLayer.BTN_CLOSE:{
                this.hideLixi();
                break;
            }
            case PotBreakerChangeLixiLayer.BTN_CHANGE:{
                this.onChangeLixi();
                break;
            }
        }
    },

    onChangeLixi: function () {
        this.setVisible(false);
        this.btnChange.setVisible(false);
        this.txtChangeLixiNote.setVisible(true);
        var pChange = new CmdSendPotBreakerChangeAward();
        pChange.putData(false, this.tokenId);
        GameClient.getInstance().sendPacket(pChange);
        if (potBreaker.potBreakerScene){
            potBreaker.potBreakerScene.isWaitingResult = true;
        }

        for (var i in potBreaker.tokenInfos){
            if (potBreaker.tokenInfos[i].ids === this.tokenId){
                potBreaker.tokenInfos[i].numberToken = potBreaker.tokenInfos[i].numberToken % potBreaker.tokenInfos[i].numberTokenNeedToClaim;
            }
        }
        if (potBreaker.potBreakerScene){
            potBreaker.potBreakerScene.onButtonRelease(null, PotBreakerScene.BTN_CLOSE_CHANGE_LIXI);
        }
    }

});

var PotBreakerRankGUI = BaseLayer.extend({
    ctor: function () {
        this.currentTab = 0;
        this.myWeek = 0;
        this.dataTop = null;
        this._super(PotBreakerRankGUI.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerRankGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.customButton("btnClose", PotBreakerRankGUI.BTN_CLOSE, this.bg);
        this.pWeek = this.getControl("pWeek", this.bg);
        this.listButtonWeek = [];
        for (var i = PotBreaker.WEEK_START; i <= PotBreaker.WEEK_END; i++){
            var btnWeek = this.customButton("btnWeek" + i , PotBreakerRankGUI.BTN_WEEK_1 + i -1, this.pWeek);
            btnWeek.bg = this.getControl("bg", btnWeek);
            btnWeek.title = this.getControl("title", btnWeek);
            btnWeek.time = this.getControl("time", btnWeek);
            this.listButtonWeek.push(btnWeek);
        }

        this.pMyRank = this.getControl("pMyRank", this.bg);
        this.pJumpMyWeek = this.getControl("pJumpMyWeek", this.pMyRank);
        this.pJumpMyWeek.txtNote = this.getControl("txtNote", this.pJumpMyWeek);
        this.pJumpMyWeek.btnJump = this.customButton("btnJumpMyWeek", PotBreakerRankGUI.BTN_JUMP_TO_MY_WEEK, this.pJumpMyWeek);

        this.myRank = this.pMyRank.getChildByName("myRank");
        var pRankMyItem = this.myRank.getChildByName("pRankItem");
        this.myRank.bg = this.getControl("bg", pRankMyItem);
        this.myRank.bg.setVisible(false);
        this.myRank.txtRank = this.getControl("txtRank", pRankMyItem);
        var avatar = this.getControl("avatar", pRankMyItem);
        avatar.setVisible(false);
        var spriteTemp = new cc.Sprite('Common/maskAvatar.png');
        this.myRank.avatar = engine.UIAvatar.createWithMask("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.myRank.avatar.setScale(avatar.getContentSize().width / (spriteTemp.getContentSize().width * 1.05));
        this.myRank.avatar.setPosition(avatar.getPosition());
        pRankMyItem.addChild(this.myRank.avatar, -1);
        this.myRank.txtName = this.getControl("txtName", pRankMyItem);
        this.myRank.imgMiniGift = this.getControl("imgMiniGift", pRankMyItem);
        var pToken = this.getControl("pToken", pRankMyItem);
        this.listNumMyToken = [];
        for (i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
            this.listNumMyToken.push(this.getControl("numToken" + i, pToken));
        }

        this.pRank = this.getControl("pRank", this.bg);
        this.uiTopRank = new cc.TableView(this, this.pRank.getContentSize());
        this.uiTopRank.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.uiTopRank.setVerticalFillOrder(0);
        this.uiTopRank.setDelegate(this);
        this.pRank.addChild(this.uiTopRank);
        this.pRank.txtNoInfo = this.getControl("txtNoInfo", this.pRank);
        this.pRank.txtNoInfo.setString(localized("POT_HAVE_NO_INFO"));
        this.pRank.txtNoInfo.setVisible(false);
        this.itemSize = cc.size(660, 75);

        this.lbTime = this.getControl("lbTime", this._layout);

        this.btnEnterGuide = this.customButton("btnEnterGuide", PotBreakerRankGUI.BTN_ENTER_GUIDE, this.bg);
        this.btnNews = this.customButton("btnNews", PotBreakerRankGUI.BTN_NEWS, this.bg);
        this.updateRemainTime();

        this.tooltip = new PotBreakerTooltipGift();
        this.addChild(this.tooltip);
        this.tooltip.setVisible(false);
    },

    update: function (dt) {

        this.updateRemainTime();

        // this.countTimeCreateFlower += dt;
        // if (this.countTimeCreateFlower > this.deltaTimeCreateFlower){
        //     this.countTimeCreateFlower -= this.deltaTimeCreateFlower;
        //     var flower = new PotBreakerFlowerEffect();
        //     flower.setPosition(Math.random() * this.pFlowerSize.width, this.pFlowerSize.height);
        //     this.pFlower.addChild(flower);
        //     flower.startFall(0, -50);
        // }
    },

    updateRemainTime: function() {
        if (potBreaker.isEndEvent()){
            return;
        }
        if (potBreaker.remainedTime === 0) {
            if (potBreaker.checkWeek(PotBreaker.WEEK_END)) {
                this.lbTime.setString(localized("POT_EVENT_TIMEOUT"));
                return;
            } else {
            }
        }
        // var timeRemain = potBreaker.remainedTime;
        // var totalSeconds = Math.floor(timeRemain / 1000);
        // var numSeconds = totalSeconds % 60;
        // var totalMinutes = Math.floor(totalSeconds / 60);
        // var numMinutes = totalMinutes % 60;
        // var totalHour = Math.floor(totalMinutes / 60);
        // var numHours = totalHour % 24;
        // var totalDay = Math.floor(totalHour / 24);
        //
        // // cc.log("updateRemainTime: " , totalDay , numHours , numMinutes , numSeconds);
        //
        // var strDays = StringUtility.replaceAll(localized("POT_TIME_LEFT_FORMAT_DAY"), "@day", totalDay);
        // var strHours = StringUtility.replaceAll(localized("POT_TIME_LEFT_FORMAT_HOURS"), "@hour", numHours);
        // var strMinutes = StringUtility.replaceAll(localized("POT_TIME_LEFT_FORMAT_MINUTES"), "@minute", numMinutes);
        // var strSeconds = StringUtility.replaceAll(localized("POT_TIME_LEFT_FORMAT_SECONDS"), "@second", numSeconds);
        //
        // var remainTimeStr = "";
        // var enoughInfoTime = false;
        // if (totalDay > 0){
        //     remainTimeStr += strDays;
        //     remainTimeStr += " ";
        //     remainTimeStr += strHours;
        //
        //     enoughInfoTime = true;
        // }
        //
        // if (numHours > 0 && !enoughInfoTime){
        //     remainTimeStr += strHours;
        //     remainTimeStr += " ";
        //     remainTimeStr += strMinutes;
        //
        //     enoughInfoTime = true;
        // }
        //
        // if (!enoughInfoTime){
        //     remainTimeStr += strMinutes;
        //     remainTimeStr += " ";
        //     remainTimeStr += strSeconds;
        // }

        var remainTimeStr = potBreaker.getTimeRemainString();
        var strTitleTime = (potBreaker.checkWeek(PotBreaker.WEEK_END)) ? localized("POT_EVENT_TITLE_TIME_EVENT") : localized("POT_TITLE_WEEK_REMAIN");
        strTitleTime = StringUtility.replaceAll(strTitleTime, "@week", potBreaker.eventTime);
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

        var data = potBreaker.getMyRankData(week);
        if (data){
            this.myRank.setVisible(true);
            this.pJumpMyWeek.setVisible(false);
            // cc.log("updateMyRank: " + JSON.stringify(data));
            var isTop = data.myRank > 0 && data.myRank <= PotBreaker.NUMBER_TOP_RANK;
            var rank = (isTop) ? data.myRank : PotBreaker.NUMBER_TOP_RANK + "+";
            this.myRank.imgMiniGift.setVisible(isTop);
            if (isTop){
                this.myRank.imgMiniGift.loadTexture(potBreaker.getTopGiftImageMini(potBreaker.getGiftIdFromRank(data.myRank, week)));
            }

            this.myRank.txtRank.setString(rank);
            for (var i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
                this.listNumMyToken[i].setString(StringUtility.pointNumber(data.totalNumberToken[i]));
            }
            for (i = PotBreaker.WEEK_START; i < week; i++){
                var oldData = potBreaker.getMyRankData(i);
                if (oldData){
                    if (oldData.myRank !== 0 && oldData.myRank <= PotBreaker.NUMBER_TOP_RANK){
                        this.myRank.setVisible(false);
                        this.pJumpMyWeek.setVisible(true);
                        this.pJumpMyWeek.btnJump.setVisible(true);
                        this.myWeek = i;
                        var strOldRank = localized("POT_HAVE_RANK_OLD_WEEK");
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
            this.pJumpMyWeek.txtNote.setString(localized("POT_HAVE_NO_INFO"));
        }
    },

    updateListTop: function(week){
        week = week || this.currentTab + 1;

        cc.log("WEEK " + week);

        var data = potBreaker.getTopRankData(week);
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
        if (potBreaker.eventTime <= PotBreaker.WEEK_END ) {
            this.onButtonRelease(null, potBreaker.eventTime + PotBreakerRankGUI.BTN_WEEK_1 - 1);
        }
        else {
            this.onButtonRelease(null, PotBreaker.WEEK_END + PotBreakerRankGUI.BTN_WEEK_1 - 1);
            this.lbTime.setString(localized("POT_EVENT_TIMEOUT"));
        }

        var maxWeek = (potBreaker.eventTime < PotBreaker.WEEK_END) ? potBreaker.eventTime : PotBreaker.WEEK_END;
        for (var i = 1 ; i <= maxWeek; i++){
            var cmd3 = new CmdSendPotBreakerGetInfoTop();
            cmd3.putData(i);
            GameClient.getInstance().sendPacket(cmd3);

            var cmd2 = new CmdSendPotBreakerGetMyRank();
            cmd2.putData(i);
            GameClient.getInstance().sendPacket(cmd2);
        }

        this.loadDataEvent();
        this.setUserInfo();
        this.scheduleUpdate();
    },

    loadDataEvent: function(){
        return;
        var startWeeks = potBreaker.eventWeeks;

        for (var i = 0; i < PotBreaker.WEEK_END; i++){
            var startWeek = startWeeks[i];
            var endWeek = this.getEndWeek(startWeek);
            this.listButtonWeek[i].time.setString(startWeek + " - " + endWeek);
            this.listButtonWeek[i].title.setString(StringUtility.replaceAll(localized("POT_WEEK"), "@week", i + 1));
        }
    },

    getEndWeek: function(startWeekDate){
        var temp = startWeekDate.split("/");
        var day = temp[0], month = temp[1];
        var today = new Date();
        var year = today.getFullYear();
        var startWeek = new Date(month + "/" + day + "/" + year);
        var weekend = new Date(startWeek.getTime() + 6*24*60*60*1000);
        var weekendMonth = weekend.getMonth() + 1;
        return weekend.getDate() + "/" + weekendMonth;
    },

    switchTabHistory: function(tab){
        this.currentTab = tab;
        for (var i = 0; i < PotBreaker.WEEK_END; i++){
            var btnWeek = this.listButtonWeek[i];
            if (btnWeek){
                btnWeek.bg.setOpacity(100);
                btnWeek.title.setColor(cc.color("#FFFFFF"));
                btnWeek.time.setColor(cc.color("#F8DD9D"));
            }
        }

        this.listButtonWeek[tab].bg.setOpacity(255);
        this.listButtonWeek[tab].title.setColor(cc.color("#E55D23"));
        this.listButtonWeek[tab].time.setColor(cc.color("#E55D23"));

        this.updateMyRank(tab + 1);
        this.updateListTop(tab + 1);
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case PotBreakerRankGUI.BTN_CLOSE:{
                this.onClose();
                break;
            }
            case PotBreakerRankGUI.BTN_WEEK_1:
            case PotBreakerRankGUI.BTN_WEEK_2:
            case PotBreakerRankGUI.BTN_WEEK_3:{
                this.switchTabHistory(id - PotBreakerRankGUI.BTN_WEEK_1);
                break;
            }
            case PotBreakerRankGUI.BTN_JUMP_TO_MY_WEEK:{
                if (this.myWeek >= PotBreaker.WEEK_START && this.myWeek < PotBreaker.WEEK_END){
                    this.switchTabHistory(this.myWeek - 1);
                } else {
                    Toast.makeToast(ToastFloat.MEDIUM, localized("POT_BREAK_RESULT_0"));
                }
                break;
            }
            case PotBreakerRankGUI.BTN_ENTER_GUIDE:{
                var scene = sceneMgr.openGUI(PotBreakerHelpGUI.className, PotBreaker.GUI_HELP, PotBreaker.GUI_HELP);
                if (scene){
                    scene.onButtonRelease(null, PotBreakerHelpGUI.BTN_PAGE_0);
                }
                this.onClose();
                break;
            }
            case PotBreakerRankGUI.BTN_NEWS:
            {
                NativeBridge.openWebView(potBreaker.eventLinkNews);
                break;
            }
        }
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new PotBreakerRankItem();
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
        this.tooltip.showText(pos, potBreaker.getItemName(idGift));
    },

    numberOfCellsInTableView: function (table) {
        var data = this.dataTop;
        return (data  && data.topRanks) ? data.topRanks.length : 0;
    },
});

var PotBreakerRankItem = cc.TableViewCell.extend({
    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/PotBreaker/PotBreakerRankItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.pRankItem = ccui.Helper.seekWidgetByName(this._layout, "pRankItem");
        this.txtRank = ccui.Helper.seekWidgetByName(this.pRankItem, "txtRank");
        this.txtName = ccui.Helper.seekWidgetByName(this.pRankItem, "txtName");
        this.imgMiniGift = ccui.Helper.seekWidgetByName(this.pRankItem, "imgMiniGift");
        this.pToken = ccui.Helper.seekWidgetByName(this.pRankItem, "pToken");
        this.listNumToken = [];
        for (var i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
            var numToken = ccui.Helper.seekWidgetByName(this.pToken, "numToken" + i);
            this.listNumToken.push(numToken);
            numToken.setColor(cc.color("#AD4417"));
        }
        this.txtRank.setColor(cc.color("#AD4417"));
        this.txtName.setColor(cc.color("#AD4417"));

        var avatar = ccui.Helper.seekWidgetByName(this.pRankItem, "avatar");
        var avatarRim = ccui.Helper.seekWidgetByName(this.pRankItem, "avatarRim");
        avatarRim.setLocalZOrder(1);
        avatar.setVisible(false);
        var spriteTemp = new cc.Sprite('Common/maskAvatar.png');
        this.uiAvatar = engine.UIAvatar.createWithMask("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.uiAvatar.setScale(avatar.getContentSize().width / (spriteTemp.getContentSize().width * 1.05));
        this.uiAvatar.setPosition(avatar.getPosition());
        this.pRankItem.addChild(this.uiAvatar, 0);
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
            var numTokens = data.topTokens[idx].split(",");
            for (var i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
                this.listNumToken[i].setString(StringUtility.pointNumber(numTokens[i]));
            }
            this.imgMiniGift.loadTexture(potBreaker.getTopGiftImageMini(data.topAward[idx]));
        } catch (e) {

        }
    },
});

var PotBreakerRankItemMini = cc.TableViewCell.extend({
    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("res/Event/PotBreaker/PotBreakerRankItemMini.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");

        this.thutu = ccui.Helper.seekWidgetByName(this.bg, "rank");
        var avatar = ccui.Helper.seekWidgetByName(this.bg, "avatar");
        this.txtName = ccui.Helper.seekWidgetByName(this.bg, "name");
        this.listNumToken = [];
        for (var i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
            this.listNumToken.push(ccui.Helper.seekWidgetByName(this.bg, "txtNumToken" + i));
        }
        this.avatar = engine.UIAvatar.createWithMask("Common/defaultAvatar.png", "Common/maskAvatar.png", "");

        var size = avatar.getContentSize();
        this.avatar.setPosition(cc.p(size.width / 2, size.height / 2));
        avatar.addChild(this.avatar);
    },

    setInfoRankMini: function (data, idx) {
        // cc.log("setInfoRankMini: " + JSON.stringify(data));
        if (data == null){
            return;
        }
        try {
            this.thutu.removeAllChildren();
            var sp = null;
            var rank = data.topRanks[idx];
            var prefix = "";
            if (!cc.sys.isNative) {
                prefix = "#";
            }
            if (rank <= 10 && rank >= 1) {
                sp = new cc.Sprite(prefix + "TopFriend/rank" + rank + ".png");
            }
            else {
                sp = new cc.Sprite(prefix + "TopFriend/rank10plus.png");
            }
            this.thutu.addChild(sp);
            sp.setPosition(this.thutu.getContentSize().width / 2, this.thutu.getContentSize().height / 2);
            this.avatar.asyncExecuteWithUrl(data.topUserIds[idx], data.topAvatars[idx]);
            this.txtName.setString(data.topNames[idx]);
            var numTokens = data.topTokens[idx].split(",");
            for (var i = 0; i < PotBreaker.NUMBER_TOKEN_TYPE; i++){
                this.listNumToken[i].setString(StringUtility.pointNumber(numTokens[i]));
            }
        } catch (e) {
            cc.error("loi gi the :" + e);
        }
    },
});

var PotBreakerTopLayer = cc.Layer.extend({

    ctor: function (size, pos) {
        this._super();
        this.dataTop = null;

        this.loading = new cc.Sprite("common/circlewait.png");
        this.addChild(this.loading);
        this.loading.runAction(cc.repeatForever(cc.rotateBy(1.2, 360)));
        this.loading.setPosition(size.width / 1.8, -size.height / 2);
        this.loading.setVisible(false);

        this._uiTable = new cc.TableView(this, size);
        this._uiTable.setPosition(pos);
        this._uiTable.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.addChild(this._uiTable);
        this._uiTable.setDelegate(this);
        this._uiTable.setVerticalFillOrder(0);


        this._capturePanel = new cc.Node();
        this.addChild(this._capturePanel);

        this._uiTable.reloadData();
    },

    loadCapturePanel: function () {
        if (socialMgr.topServer) {
            var nSize = socialMgr.topServer.length;
            nSize = (nSize > 5) ? 5 : nSize;
            for (var i = 0; i < nSize; i++) {
                var cell = new PotBreakerRankItemMini();
                cell.setInfoRankMini(this.dataTop, i);
                this._capturePanel.addChild(cell);
                cell.setPosition(0, -PotBreakerTopLayer.CELL_HEIGHT * (i + 1));
            }

            this._capturePanel.setVisible(true);
            this._uiTable.setVisible(false);
        }
    },

    doneCapturePanel: function () {
        this._uiTable.setVisible(true);

        this._capturePanel.setVisible(false);
        this._capturePanel.removeAllChildren();
    },

    updateFriends : function () {
        this.dataTop = potBreaker.getTopRankData(potBreaker.eventTime);
        this._uiTable.reloadData();
        this.loading.setVisible(false);
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(cc.winSize.width, PotBreakerTopLayer.CELL_HEIGHT);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();

        if (!cell) {
            cell = new PotBreakerRankItemMini();
        }
        cell.setInfoRankMini(this.dataTop, idx);

        return cell;
    },


    numberOfCellsInTableView: function (table) {
        var data = this.dataTop;
        return (data  && data.topRanks) ? data.topRanks.length : 0;
    },

    startRequestTop: function (social) {

    },

    onResponseTopZing: function () {

    },

    onSocialCallback: function (social, dom) {

    }
});

var PotBreakerReceiveTicketFree = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(PotBreakerReceiveTicketFree.className);
        this.initWithBinaryFile("res/Event/PotBreaker/PotBreakerReceiveTicketFree.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("btnClose", 0, this._bg);

        this.lbNumTicket = this.getControl("numTicket",this._bg);

        this.setBackEnable(true);
    },

    setInfoFreeTicket: function(numTicket){
        this.lbNumTicket.setString(numTicket);
    },

    onButtonRelease: function (btn, id) {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        if (gui instanceof LobbyScene){
            potBreaker.openEvent();
        }

        this.onBack();
    },

    onBack: function () {
        this.onClose();
    }
});

var PotBreakerFlowerEffect = cc.Node.extend({
    ctor: function () {
        this._super();
        var randomeId = Math.floor(Math.random() * 1.99);
        var flower = new cc.Sprite(PotBreaker.DEFAUT_FOLDER_UI + "flower" + randomeId + ".png");
        // flower.setOpacity(130);
        flower.setOpacity(130 + Math.random() * 120);
        this.addChild(flower);
    },

    startFall: function(startSpeedX, startSpeedY){
        this.speedX = startSpeedX + Math.random() * PotBreakerFlowerEffect.RATE_SPEED_X;
        this.speedY = startSpeedY + Math.random() * PotBreakerFlowerEffect.RATE_SPEED_Y;
        // cc.log("startFall: " , this.speedX, this.speedY);
        this.speedR = 2 * Math.random() * PotBreakerFlowerEffect.RATE_SPEED_R - PotBreakerFlowerEffect.RATE_SPEED_R;
        this.scheduleUpdate();
    },

    updateSpeedX: function(speedX){
        this.speedX += speedX;
    },

    endFall: function(){
        this.unscheduleUpdate();
    },

    updateFall: function (dt) {
        this.x += this.speedX * dt;
        this.y += this.speedY * dt;
        this.speedY -= PotBreakerFlowerEffect.GRAVITY * dt;
        this.rotation += this.speedR;
        if (this.y < -10) {
            this.endFall();
        }
    },

    update: function (dt) {
        this.updateFall(dt);
    }
});


var PotBreakerTooltipGift = cc.Node.extend({
    ctor: function () {
        this._super();
        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);
        var sprite = new cc.Sprite("res/Event/PotBreaker/PotBreakerUI/bgTooltip.png");
        this.addChild(sprite);
        sprite.setOpacity(200);
        this.bg = sprite;
        this.lbContent1 = this.createLabel();
    },

    createLabel: function() {
        var lbContent = new ccui.Text();
        this.addChild(lbContent);
        lbContent.setFontName(SceneMgr.FONT_NORMAL);
        lbContent.setContentSize(cc.size(this.bg.getContentSize().width * 0.95, 50));
        lbContent.ignoreContentAdaptWithSize(false);
        lbContent.setColor(cc.color(50, 50, 50, 50));
        lbContent.setFontSize(13);
        lbContent.setString("Phan Thuong");
        lbContent.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        lbContent.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        lbContent.setPosition(0, 5);
        return lbContent;
    },

    showText: function (pos, string) {
        this.lbContent1.setString(string);
        this.setVisible(true);
        this.setPosition(pos);
        this.stopAllActions();
        this.setOpacity(0);
        this.runAction(cc.sequence(cc.fadeIn(0.5), cc.delayTime(2.0), cc.fadeOut(0.5), cc.hide()));
    },

});

var PotBreakerBubble = cc.Node.extend({
    ctor: function () {
        this._super();
        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);
        var sprite = new cc.Sprite("res/Event/PotBreaker/PotBreakerUI/bgTooltip.png");
        this.addChild(sprite);
        sprite.setOpacity(200);
        this.bg = sprite;

        this.arrayText = ["Trên xe còn:\n @num viên đá đặc biệt ",
            "4 @name có thể pha \n1 Sinh tố @name ",
            "Bấm vào viên đá \nđể đập riêng lẻ ",
            "Chơi mức cược cao \ndễ kiếm Thìa hơn ",
            "Việt Quất là loại \nquả hiếm nhất ",
            "Quả hiếm hơn được \nưu tiên khi xếp hạng "];

        this.arrayFruit = ["Việt Quất","Dâu Tây","Cam","Chanh"];

        this.lbContent1 = this.createLabel();
        this.lbContent2 = this.createLabel();
        this.lbContent1.setPosition(0, 15);
        this.lbContent2.setPosition(0, -10);
        this.countTime = -1;
        this.step = 1;
        this.lastRandom = -1;
        this.showText();
    },

    createLabel: function() {
        var lbContent = new ccui.Text();
        this.addChild(lbContent);
        lbContent.setFontName(SceneMgr.FONT_NORMAL);
        lbContent.setContentSize(cc.size(this.bg.getContentSize().width * 0.95, 50));
        lbContent.ignoreContentAdaptWithSize(false);
        lbContent.setColor(cc.color(50, 50, 50, 50));
        lbContent.setFontSize(13);
        lbContent.setString(localized(this.arrayText[0]));
        lbContent.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        lbContent.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        lbContent.setPosition(0, 5);
        return lbContent;
    },

    updateBubble: function (dt) {
        if (this.countTime >= 0) {
            this.countTime = this.countTime + dt;
            if (this.countTime > PotBreakerBubble.TIME_STATE) {
                this.countTime = -1;
                this.step++;
                this.runAction(cc.sequence(cc.fadeOut(0.5), cc.callFunc(this.showText.bind(this))));
            }
        }

    },

    showText: function () {

        if (this.step >= PotBreakerBubble.MAX_TOOLTIP) {
            this.step = 0;
        }
        var s1 = "";
        var s2 = "";
        // if (this.step == 0 && potBreaker.numGoldPot == 0) {
        //     this.step = 1;
        // }

        if (this.step != 0) {
            var random;
            do {
                random = Math.floor(Math.random() * 4.999999 + 1);
            }
            while (random == this.lastRandom);
            this.lastRandom = random;
        }
        else {
            this.lastRandom = this.step;
        }
        s1 = localized("POT_BUBBLE_" + this.lastRandom + "_0");
        s2 = localized("POT_BUBBLE_" + this.lastRandom + "_1");
        if (this.step == 0) { // cau random ve da dac biet
            if (potBreaker.numGoldPot == 0) {
                s1 = localized("POT_BUBBLE_6_0");
                s2 = localized("POT_BUBBLE_6_1");
                this.lbContent2.setColor(cc.color(50, 50, 50, 255));
            }
            else {
                s2 = StringUtility.replaceAll(s2,"@num", potBreaker.numGoldPot);
                this.lbContent2.setColor(cc.color(245, 20, 50, 255));
            }
        }
        else {
            if (this.lastRandom == 1) { // can thay the ten loai qua
                var random1 = Math.floor(Math.random() * 3.999999);
                var s = localized("POT_FRUIT_" + random1);
                s1 = StringUtility.replaceAll(s1,"@name", s);
                s2 = StringUtility.replaceAll(s2,"@name", s);
                cc.log("CHange text " + s1);
            }
            this.lbContent2.setColor(cc.color(50, 50, 50, 255));
        }
        this.lbContent1.setString(s1);
        this.lbContent2.setString(s2);
        this.runAction(cc.sequence(cc.fadeIn(0.5), cc.callFunc(this.startCount.bind(this))));
    },

    startCount: function () {
        this.countTime = 0;
    }
});

PotBreakerBubble.TIME_STATE = 5;
PotBreakerBubble.MAX_TOOLTIP = 3;
PotBreakerBubble.TIME_DELAY = 1;

PotBreakerFlowerEffect.RATE_SPEED_Y = 40;
PotBreakerFlowerEffect.RATE_SPEED_X = 50;
PotBreakerFlowerEffect.RATE_SPEED_R = 20;
PotBreakerFlowerEffect.GRAVITY  = 80;

PotBreakerTopLayer.CELL_HEIGHT = 49;

PotBreakerRankGUI.BTN_CLOSE = 4;
PotBreakerRankGUI.BTN_WEEK_1 = 0;
PotBreakerRankGUI.BTN_WEEK_2 = 1;
PotBreakerRankGUI.BTN_WEEK_3 = 2;
PotBreakerRankGUI.BTN_JUMP_TO_MY_WEEK = 5;
PotBreakerRankGUI.BTN_ENTER_GUIDE = 6;
PotBreakerRankGUI.BTN_NEWS = 7;

PotBreakerChangeLixiLayer.BTN_CHANGE = 1;
PotBreakerChangeLixiLayer.BTN_CLOSE = 2;

PotBreakerEventNotifyGUI.BTN_CLOSE = 1;
PotBreakerEventNotifyGUI.BTN_JOIN = 2;

PotBreakerAccumulateGUI.BTN_SHOW_INFO = 0;
PotBreakerAccumulateGUI.BTN_SHOW_NUMBER_TICKET = 1;
PotBreakerAccumulateGUI.BTN_HIDE_NUMBER_TICKET = 2;

PotBreakerRegisterInformationGUI.BTN_CLOSE = 0;
PotBreakerRegisterInformationGUI.BTN_OK = 1;
PotBreakerRegisterInformationGUI.BTN_FANPAGE = 2;

PotBreakerRegisterInformationGUI.TF_NAME = 1;
PotBreakerRegisterInformationGUI.TF_ADDRESS = 2;
PotBreakerRegisterInformationGUI.TF_PHONE = 3;
PotBreakerRegisterInformationGUI.TF_CMND = 4;
PotBreakerRegisterInformationGUI.TF_EMAIL = 5;

PotBreakerHelpGUI.NUM_PAGE_HELP = 5;
PotBreakerHelpGUI.BTN_PAGE_0 = 0;
PotBreakerHelpGUI.BTN_PAGE_1 = 1;
PotBreakerHelpGUI.BTN_PAGE_2 = 2;
PotBreakerHelpGUI.BTN_PAGE_3 = 3;
PotBreakerHelpGUI.BTN_PAGE_4 = 4;
PotBreakerHelpGUI.BTN_CLOSE = 5;
PotBreakerHelpGUI.BTN_TAB_REGISTER_INFO = 6;
PotBreakerHelpGUI.BTN_TAB_GUIDE = 7;
PotBreakerHelpGUI.BTN_FANPAGE = 8;

PotBreakerCoinEffect.RATE_SPEED_Y = 600;
PotBreakerCoinEffect.DEFAULT_SPEED_Y = 850;
PotBreakerCoinEffect.RATE_SPEED_X = 350;
PotBreakerCoinEffect.RATE_SPEED_R = 10;
PotBreakerCoinEffect.RATE_Position_X = 70;
PotBreakerCoinEffect.RATE_Position_Y = 70;
PotBreakerCoinEffect.MIN_SCALE = 0.32;
PotBreakerCoinEffect.MAX_SCALE = 0.42;
PotBreakerCoinEffect.RATE_JUMP_BACK = 0.5;
PotBreakerCoinEffect.GRAVITY = 2300;
PotBreakerCoinEffect.POSI = 90;
PotBreakerCoinEffect.NAME_ANIMATION_COIN = "gold";
PotBreakerCoinEffect.NUM_SPRITE_ANIMATION_COIN = 5;
PotBreakerCoinEffect.NUM_COIN_EACH_TIME = 100;
PotBreakerCoinEffect.NUM_COIN_RATE_RAIN = 100;
PotBreakerCoinEffect.TIME_ANIMATION_COIN = 0.3;
PotBreakerCoinEffect.TIME_OUT_COIN = 0.05;
PotBreakerCoinEffect.TYPE_FLOW = 0;
PotBreakerCoinEffect.TYPE_RAIN = 1;
PotBreakerCoinEffect.DELAY_PLAY_SOUND = 0.3;

PotBreakerScene.className = "PotBreakerScene";
PotBreakerHelpGUI.className = "PotBreakerHelpGUI";
PotBreakerAccumulateGUI.className = "PotBreakerAccumulateGUI";
PotBreakerEventNotifyGUI.className = "PotBreakerEventNotifyGUI";
PotBreakerRegisterInformationGUI.className = "PotBreakerRegisterInformationGUI";
PotBreakerOpenResultGUI.className = "PotBreakerOpenResultGUI";
PotBreakerOpenGiftGUI.className = "PotBreakerOpenGiftGUI";
PotBreakerHammerDialog.className = "PotBreakerHammerDialog";
PotBreakerMapPot.className = "PotBreakerMapPot";
PotBreakerChangeLixiLayer.className = "PotBreakerChangeLixiLayer";
PotBreakerRankGUI.className = "PotBreakerRankGUI";
PotBreakerReceiveTicketFree.className = "PotBreakerReceiveTicketFree";