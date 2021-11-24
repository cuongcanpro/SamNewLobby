
// GUI
var MidAutumnScene = BaseLayer.extend({

    ctor: function () {
        // piece and gift
        this.giftsResult = {};
        this.currentItemList = 0;
        this.itemListMode = 0;

        // map
        this.mapComponent = null;
        this.isNewMap = false;
        this.arGrid = {};
        this.nTimeEffect = 0;

        // moving
        this.isWaitingChooseDirect = false;
        this.isWaitingRollResult = false;
        this.isWaitingSelectDestination = false;
        this.isWaitingChangeStage = false;



        this.arRunFunc = [];
        this.arSceneFunc = [];

        this.isFirstJoin = true;
        this.isChangeStage = false;

        this.nTimeBubbleEffect = 0;

        this._super(MD_SCENE_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnScene.json");
    },

    initGUI: function () {
        var winSize = cc.director.getWinSize();

        this.bgScene = this.getControl("bg");
        this.bgScene.sX = this._scale;
        this.bgScene.sY = this._scale;
        this.bgScene.pos = this.bgScene.getPosition();

        this.bgBoard = this.getControl("board");
        this.bgBoard.pos = this.bgBoard.getPosition();

        var pRight = this.getControl("pRightTop");
        var pButton = this.getControl("pButton");
        var pLeftTop = this.getControl("pLeftTop");

        // effect
        this.panelRightTop = pRight;
        this.panelRightTop.posShow = pRight.getPosition();
        this.panelLeftTop = pLeftTop;
        this.panelLeftTop.posShow = pLeftTop.getPosition();
        this.pButtonRoll = pButton;
        this.pButtonRoll.posShow = pButton.getPosition();

        this.pRollDice = this.getControl("pRoll");
        this.pRollDice.setVisible(false);
        this.light1 = this.pRollDice.getChildByName("light1");
        this.light2 = this.pRollDice.getChildByName("light2");
        this.light1.setOpacity(0);
        this.light2.setOpacity(0);

        this.dice = this.getControl("bottomDice", this.pRollDice);
        this.dice.pos = cc.p(this.dice.getPositionX(), this.dice.getPositionY());

        this.diceResult = this.getControl("result", this.dice);

        this.upDice = this.getControl("upDice", this.dice);
        this.upDice.setVisible(false);
        this.upDice.pos = cc.p(this.upDice.getPositionX(), this.upDice.getPositionY());

        this.layerEffect = cc.Node.create();
        this.addChild(this.layerEffect);

        // load board
        this.pMap = this.getControl("panel", this.bgBoard);
        this.mapComponent = new MidAutumnMap();
        this.bgBoard.addChild(this.mapComponent);

        // roll button
        this.btnRollOnce = this.customButton("roll1", MD_SCENE_BTN_ROLL_ONCE, pButton, false);
        this.btnRollOnce.cost = this.getControl("cost", this.btnRollOnce);

        this.btnRollTen = this.customButton("roll10", MD_SCENE_BTN_ROLL_TEN, pButton, false);
        this.btnRollTen.cost = this.getControl("cost", this.btnRollTen);

        this.btnRollHundred = this.customButton("roll100", MD_SCENE_BTN_ROLL_HUNDRED, pButton, false);
        this.btnRollHundred.cost = this.getControl("cost", this.btnRollHundred);
        this.btnRollHundred.num = this.getControl("num", this.btnRollHundred);

        this.costImage = this.getControl("costEffect");
        this.costImage.lb = this.getControl("lb", this.costImage);
        this.costImage.setVisible(false);

        // user info
        var bGold = this.getControl("gold", pRight);
        this.lbGold = this.getControl("lb", bGold);
        this.lbGold.posEffect = this.lbGold.getParent().convertToWorldSpace(this.lbGold.getPosition());
        if (!cc.sys.isNative){
            this.lbGold.posEffect = pRight.convertToWorldSpace(bGold.getPosition());
        }
        this.lbGold.posEffect.x -= 55;

        this.bgHarmer = this.getControl("bgTicket", pRight);
        this.barHammer = this.getControl("bar_hammer", pRight);
        this.barHammer.point = this.getControl("point", this.barHammer);
        this.barHammer.progress = this.getControl("progress", this.barHammer);
        this.lbHammer = this.getControl("lbHarmer", this.bgHarmer);
        this.customButton("buyTicket",MD_SCENE_BTN_SHOP, this.bgHarmer);

        this.bgGold = this.getControl("bgTicket", pRight);
        this.customButton("gold",MD_SCENE_BTN_SHOP, pRight);
        this.customButton("btnBuy",MD_SCENE_BTN_SHOP, pRight);

        // popup item
        this.popupItem = this.getControl("pInfoItem");
        this.popupItem.lbInfo = this.getControl("lb", this.popupItem);
        this.popupItem.lbName = this.getControl("name", this.popupItem);
        this.btnChange = this.customButton("btnChange", MD_SCENE_BTN_CHANGE, this.popupItem);
        this.showPopupInfo();

        // collection list
        this.pFullItem = this.getControl("pItem");
        this.pFullItem.posShow = cc.p(this.pFullItem.getPositionX(), this.pFullItem.getPositionY());
        this.pFullItem.posHide = cc.p(this.pFullItem.getPositionX() + this.pFullItem.getContentSize().width,
            this.pFullItem.getPositionY());
        this.pLiteItem = this.getControl("pItemCollapse");
        this.pLiteItem.posShow = cc.p(this.pLiteItem.getPositionX(), this.pLiteItem.getPositionY());
        this.pLiteItem.posHide = cc.p(this.pLiteItem.getPositionX() + this.pLiteItem.getContentSize().width,
            this.pLiteItem.getPositionY());

        this.uiGiftFull = new MidAutumnCollectionsExpandGUI(this.pFullItem);
        this.uiGiftLite = new MidAutumnCollectionsCollapseGUI(this.pLiteItem);

        // event time
        var pTime = this.getControl("pTime");
        var txts = [];
        txts.push({"text": LocalizedString.to("MD_INFO_TIME_LEFT_0") + " ", "color": cc.color(255, 247, 211, 0), "size": 15});
        txts.push({"text": "", "font": SceneMgr.FONT_BOLD, "color": cc.color(194, 255, 73, 0), "size": 15});
        txts.push({"text": LocalizedString.to("MD_INFO_TIME_LEFT_1"), "color": cc.color(255, 247, 211, 0), "size": 15});
        this.lbTimeRemain = new RichLabelText();
        this.lbTimeRemain.setText(txts);
        this.lbTimeRemain.parentSize = pTime.getContentSize();
        pTime.addChild(this.lbTimeRemain);
        this.lbTimeFull = this.getControl("lbTime", pTime);
        this.lbTimeFull.setVisible(false);

        // load cheat panel
        this.pCheat = this.getControl("pCheat");
        this.pCheat.pos = this.pCheat.getPosition();

        this.txItem = this.getControl("name", this.pCheat);
        this.txNum = this.getControl("num", this.pCheat);
        this.txNumRoll = this.getControl("numRoll", this.pCheat);
        this.customButton("btnNumRoll", MD_SCENE_CHEAT_NUM_ROLL, this.pCheat);
        this.customButton("cheat_item", MD_SCENE_CHEAT_ITEM, this.pCheat);
        this.txCoin = this.getControl("coin", this.pCheat);
        this.txExp = this.getControl("exp", this.pCheat);
        this.customButton("cheat_coin", MD_SCENE_CHEAT_EXP_COIN, this.pCheat);
        this.customButton("cheat_coin_free", MD_SCENE_CHEAT_COIN_FREE, this.pCheat);
        this.txGServer = this.getControl("txGServer", this.pCheat);
        this.txGUser = this.getControl("txGUser", this.pCheat);
        this.lbGServer = this.getControl("g_server", this.pCheat);
        this.lbGUser = this.getControl("g_user", this.pCheat);
        this.lbLevel = this.getControl("level", this.pCheat);
        this.customButton("cheat_g_server", MD_SCENE_CHEAT_G_SERVER, this.pCheat);
        this.customButton("btnReset", MD_SCENE_CHEAT_RESET_SERVER, this.pCheat);
        this.customButton("btnFullTime", MD_SCENE_CHEAT_SHOW_FULLTIME, this.pCheat);
        this.arBtnPie = [];
        for (var i = 1; i <= 4; i++) {
            this.arBtnPie.push(this.customButton("pie" + i, (MD_SCENE_CHEAT_PIE_1 + i - 1), this.pCheat));
        }
        this.selectCheatPie(MD_SCENE_CHEAT_PIE_1);

        if (Config.ENABLE_CHEAT) {
            this.iconDice = this.customButton("dice", MD_SCENE_BTN_CHEAT, this.pButtonRoll);
        }
        else {
            this.iconDice = this.getControl("dice", this.pButtonRoll);
            this.iconDice.setVisible(false);
        }

        // button scene
        this.customButton("close", MD_SCENE_BTN_CLOSE, pLeftTop);
        this.customButton("help", MD_SCENE_BTN_HELP, pLeftTop);
        this.customButton("news", MD_SCENE_BTN_NEWS, pLeftTop);
        this.btnLamp = this.customButton("btnLamp", MD_SCENE_BTN_LAMP, pLeftTop);
        this.btnLamp.pos = this.btnLamp.convertToWorldSpace(cc.p(this.btnLamp.getContentSize().width * 0.5, this.btnLamp.getContentSize().width * 0.5));
        this.customButton("history", MD_SCENE_BTN_HISTORY, this.pLiteItem);

        // touch in scene
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

        // update board pos
        this.initSizeBoard();

        // sound
        this.ignoreAllButtonSound();
        this.visibleCheat();
        this.setBackEnable(true);
        this.bgCloud = this.getControl("bgCloud");
        this.bgCloud.rootScaleX = this.bgCloud.getScaleX();
        this.bgCloud.rootScaleY = this.bgCloud.getScaleY();
    },

    reloadGUI: function () {
        if (this._super()) {
            // this.boardSize = this.pMap.getContentSize();// cc.size(winSize.width * 0.64, winSize.height * 0.46);
            // this.eggSize = cc.size(this.pMap.width / MD_COL, this.pMap.height / MD_ROW);
            // this.eggPos = cc.p(this.pMap.getContentSize().width / 2 - this.boardSize.width / 2.1,
            //     this.pMap.getContentSize().height / 2 + this.boardSize.height / 1.95 - this.eggSize.height);
            // this.eggPos = cc.p(this.pMap.getContentSize().width / 2 - this.boardSize.width / 2.1,
            //     this.pMap.getContentSize().height / 2 + this.boardSize.height / 1.95 - this.eggSize.height);
            var pRight = this.getControl("pRightTop");
            var pButton = this.getControl("pButton");
            var pLeftTop = this.getControl("pLeftTop");

            this.pFullItem = this.getControl("pItem");
            this.pFullItem.posShow = cc.p(this.pFullItem.getPositionX(), this.pFullItem.getPositionY());
            this.pFullItem.posHide = cc.p(this.pFullItem.getPositionX() + this.pFullItem.getContentSize().width,
                this.pFullItem.getPositionY());
            this.pLiteItem = this.getControl("pItemCollapse");
            this.pLiteItem.posShow = cc.p(this.pLiteItem.getPositionX(), this.pLiteItem.getPositionY());
            this.pLiteItem.posHide = cc.p(this.pLiteItem.getPositionX() + this.pLiteItem.getContentSize().width,
                this.pLiteItem.getPositionY());

            this.initSizeBoard();

            this.isNewMap = true;
            this.pFullItem.setVisible(false);
            this.pLiteItem.setVisible(true);
            this.pFullItem.stopAllActions();
            this.pLiteItem.stopAllActions();
            // this.loadMap();
        }

    },

    initSizeBoard: function () {
        var pRight = this.getControl("pRightTop");
        var pButton = this.getControl("pButton");
        var pLeftTop = this.getControl("pLeftTop");
        var w = (cc.winSize.width - this.pLiteItem.getContentSize().width * this._scale);
        var scale;
        if (cc.winSize.width / cc.winSize.height >= 479 / 800) {
            scale = 1;
        }
        else {
            scale = 0.95;
        }
        var pSizeReal = cc.size(
            w * scale,
            cc.winSize.height * scale
        );
        var rate1 = pSizeReal.width / pSizeReal.height;
        var rate2 = this.mapComponent.mapSize.width / this.mapComponent.mapSize.height;
        if (rate1 > rate2) {
            // lay theo chieu cao
            var scale = pSizeReal.height / this.mapComponent.mapSize.height;
            this.bgBoard.setScale(scale);
        }
        else {
            // lay theo chieu rong
            var scale = pSizeReal.width / this.mapComponent.mapSize.width;
            this.bgBoard.setScale(scale);
        }
        this.bgBoard.setPosition(w * 0.5, cc.winSize.height * 0.5);
        this.pButtonRoll.setPositionX(w * 0.49);
        this.pButtonRoll.posShow = this.pButtonRoll.getPosition();
        this.pRollDice.setPositionX(w / 2);
    },

    setIsWaitingRollResult: function (value) {
        this.isWaitingRollResult = value;
    },

    onUpdateGUI: function () {
        this.updateUserInfo();
    },

    onEnterFinish: function () {
        MidAutumnSound.playLobby();

        this.lbGold.posEffect = this.lbGold.getParent().convertToWorldSpace(this.lbGold.getPosition());
        this.lbGold.posEffect.x = this.lbGold.posEffect.x - 45;
        this.btnLamp.pos = this.btnLamp.convertToWorldSpace(cc.p(this.btnLamp.getContentSize().width * 0.5, this.btnLamp.getContentSize().width * 0.5));
        // init scene
        midAutumn.midAutumnScene = this;

        // reset
        this.setIsWaitingRollResult(false);
        this.isWaitingEffectMove = false;
        this.lbHammer.setString("");

        // clean effect
        this.pRollDice.setVisible(false);

        // reset time effect random cell
        this.nTimeEffect = MD_CELL_EFFECT_COUNT_DOWN;

        // clear map
        this.mapComponent.onEnterFinish();
        this.layerEffect.removeAllChildren();

        // clear func
        try {
            for(var i in this.arRunFunc) {
                clearTimeout(this.arRunFunc[i]);
            }
            this.arRunFunc = [];
        }
        catch(e) {
            cc.log("ClearFunc : " + JSON.stringify(e));
        }

        this.costImage.setVisible(false);
        this.arGrid = {};

        this.onUpdateGUI();

        // effect show scene
        this.isFirstJoin = true;
        this.isWaitShowScene = true;

        this.panelRightTop.setVisible(false);
        this.panelLeftTop.setVisible(false);
        this.pLiteItem.setVisible(false);
        this.pFullItem.setVisible(false);

        this.enableRollButton(false);
        this.pButtonRoll.setVisible(true);

        // get event info
        var cmd = new CmdSendMidAutumnOpen();
        cmd.putData(1);
        GameClient.getInstance().sendPacket(cmd);


        // update scene
        this.scheduleUpdate();

        if (!cc.sys.isNative){
            this.uiGiftFull.uiGift.setTouchEnabled(true);
        }
        this.bgCloud.setScaleX(this.bgCloud.rootScaleX);
        this.bgCloud.setScaleY(this.bgCloud.rootScaleY);
        this.bgCloud.stopAllActions();
        this.bgCloud.setOpacity(255);
        this.bgCloud.runAction(cc.spawn(cc.fadeOut(1.5), cc.scaleTo(1.5, this.bgCloud.rootScaleX * 2.0, this.bgCloud.rootScaleY * 2.0)));
    },

    onTouchBoard: function (touch) {
        if(touch.getLocation().x < cc.director.getWinSize().width*3/4) {
            if(this.currentItemList == 1) {
                this.doActionItemList(MD_SHOW_LIST_ITEM_MINI);
            }
        }
    },

    enableRollButton: function (enable,effect) {
        if(!midAutumn.isInEvent()) enable = false;

        effect = false;
        if(effect) {
            if(enable) {
                this.pButtonRoll.setVisible(true);
                this.pButtonRoll.setPositionY(-500);
                this.pButtonRoll.runAction(new cc.EaseBackOut(cc.moveTo(0.25,this.pButtonRoll.posShow)));
            }
            else {
                this.pButtonRoll.setVisible(true);
                this.pButtonRoll.setPosition(this.pButtonRoll.posShow);
                this.pButtonRoll.runAction(new cc.EaseBackOut(cc.moveTo(0.25,cc.p(this.pButtonRoll.posShow.x,-500))));
            }
        }
        else {
            this.pButtonRoll.setVisible(enable);
        }

        this.btnRollOnce.cost.setString(StringUtility.pointNumber(
            midAutumn.getCostRoll(MD_SCENE_BTN_ROLL_ONCE - MD_SCENE_BTN_ROLL_ONCE)));
        this.btnRollTen.cost.setString(StringUtility.pointNumber(
            midAutumn.getCostRoll(MD_SCENE_BTN_ROLL_TEN - MD_SCENE_BTN_ROLL_ONCE)));
        this.btnRollHundred.typeRoll = 2;
        // quay nhieu lan phan lam nhieu truong hop, nho nhat la type roll co id = 2

        if (midAutumn.keyCoin >= midAutumn.costRoll[2]) {
            this.btnRollTen.setVisible(false);
            this.btnRollHundred.setVisible(true);
            if (midAutumn.keyCoin >= midAutumn.costRoll[3]) {
                this.btnRollHundred.typeRoll = 3;
            }
            this.btnRollHundred.cost.setString(StringUtility.pointNumber(
                midAutumn.getCostRoll(this.btnRollHundred.typeRoll)));
            this.btnRollHundred.num.setString(StringUtility.pointNumber(
                midAutumn.getCostRoll(this.btnRollHundred.typeRoll)));
        }
        else {
            this.btnRollHundred.setVisible(false);
            this.btnRollTen.setVisible(true);
        }

        // var costHundred = midAutumn.getCostRoll(MD_SCENE_BTN_ROLL_HUNDRED - MD_SCENE_BTN_ROLL_ONCE);
        // if (costHundred <= midAutumn.keyCoin) {
        //     this.btnRollHundred.setVisible(false);
        //     this.btnRollTen.setVisible(true);
        // } else {
        //     this.btnRollHundred.setVisible(false);
        //     this.btnRollTen.setVisible(true);
        // }
    },

    visibleCheat: function () {
        if (Config.ENABLE_CHEAT) {
            this.pCheat.setVisible(true);
            this.lbLevel.setVisible(true);
        } else {
            this.lbLevel.setVisible(false);
            this.pCheat.setVisible(false);
        }
    },

    // show scene
    effectShowScene : function () {
        this.isWaitShowScene = false;

        // effect top left - right
        this.panelLeftTop.setVisible(true);
        this.panelRightTop.setVisible(true);
        this.panelLeftTop.setPositionY(cc.winSize.height + 500);
        this.panelRightTop.setPositionY(cc.winSize.height + 500);

        this.panelLeftTop.runAction(new cc.EaseBackOut(cc.moveTo(0.25,this.panelLeftTop.posShow)));
        this.panelRightTop.runAction(new cc.EaseBackOut(cc.moveTo(0.25,this.panelRightTop.posShow)));
        this.currentItemList = -1;
        this.doActionItemList(MD_SHOW_LIST_ITEM_MINI);
        // this.doActionItemList(MD_SHOW_LIST_ITEM_FULL);
        // if (this.fAutoHideItemList) {
        //     clearTimeout(this.fAutoHideItemList);
        // }
        // this.fAutoHideItemList = setTimeout(function () {
        //     this.doActionItemList(MD_SHOW_LIST_ITEM_MINI);
        // }.bind(this), 2000);

        this.updateItemList();
    },

    generateMovePath: function (nMove) {
        nMove = nMove || this.numMoveAvailable;

        //    MidAutumnSound.playFoxJump();
        this.map.generateMovePath(nMove);
        this.isWaitingChooseDirect = true;
        this.isWaitingSelectDestination = false;
    },

    doRoll: function (idx, pos) {
        if (this.mapComponent.isRunEffectLoadMap)
            return;
        if (this.isWaitingRollResult) return;
        if (this.isWaitingChooseDirect) return;
        // quay extreme, gia quay se khac, tuy vao so ve ma user dang co, quay 30, 50, 100 lan
        var cost;
        if (idx == 2) {
            idx = this.btnRollHundred.typeRoll;
        }

        var cost = midAutumn.getCostRoll(idx);
        if (cost <= midAutumn.keyCoin) {
            this.costImage.lb.setString("-" + StringUtility.pointNumber(cost));
            var p = (pos === undefined) ? cc.p(0, 0) : pos;
            this.costImage.setPosition(p);
            this.costImage.setVisible(true);
            this.costImage.stopAllActions();
            this.costImage.runAction(cc.sequence(cc.moveTo(1, cc.p(p.x, p.y + 50)), cc.hide()));

            this.lbHammer.setString(StringUtility.pointNumber(midAutumn.keyCoin - cost));

            if (idx == 0)
                this.effectStartRollDice();
            else if (idx == 1) {
                this.effectStartRollExtreme();
            }
            else {
                //this.mapComponent.autoGenerateMovePath();
            }

            this.setIsWaitingRollResult(true);
            this.mapComponent.moveObject = null;

            var cmd = new CmdSendMidAutumnRoll();
            cmd.putData(midAutumn.getTypeRoll(idx));
            GameClient.getInstance().sendPacket(cmd);

            this.enableRollButton(false);

            midAutumn.saveLastGifts();
        } else {
            midAutumn.showHammerEmpty(MD_HAMMER_ROLL_EMPTY);
        }
    },

    // effect roll
    effectStartRollDice : function () {
        this.countRoll = 0;
        this.maxCountRoll = MD_ROLL_DICE_TIME;

        this.pRollDice.setVisible(true);
        this.upDice.setVisible(true);
        this.upDice.setPosition(this.upDice.pos.x, this.upDice.pos.y + 300);
        this.upDice.runAction(cc.spawn(cc.moveTo(MD_UP_DICE_MOVE, this.upDice.pos.x, this.upDice.pos.y),
            cc.sequence(cc.scaleTo(0.3, 1.1, 0.9),
                cc.callFunc(this.effectRollDiceClosePlate.bind(this)),
                new cc.EaseBounceOut(cc.scaleTo(0.5, 1.0, 1.0)))));
        this.light1.runAction(cc.fadeOut(0.5));
        this.light2.runAction(cc.spawn(cc.scaleTo(0.5, 0, 1.0), cc.fadeOut(0.5)));

        // var sp = cc.Sprite.create("res/EventMgr/MidAutumn/MidAutumnUI/dice1.png");
        // var pDesDice = this.diceResult.getPosition();
        // var pStartDice = this.iconDice.getParent().convertToWorldSpace(this.iconDice.getPosition());
        //
        // var pCX = Math.random() * cc.winSize.width;
        // var pCY = Math.random() * cc.winSize.height;
        // var posCenter = cc.p(pCX, pCY);
        // sp.setPosition(this.dice.convertToNodeSpace(pStartDice));
        //
        // var actMove = cc.BezierTo.create(MD_UP_DICE_MOVE/2, [sp.getPosition(), posCenter, pDesDice]);
        //
        // sp.runAction(cc.sequence(actMove,cc.removeSelf()));
        //
        // this.dice.addChild(sp, 999999);

        // this.diceResult.setVisible(false);
        this.diceResult.loadTexture("res/EventMgr/MidAutumn/MidAutumnUI/dice1.png");
        // this.diceResult.runAction(cc.sequence(cc.delayTime(MD_UP_DICE_MOVE/2),cc.show()));
    },

    effectRollDiceClosePlate: function () {
        var distance = 20;
        var x = Math.random() * distance;
        var y = Math.random() * distance;

        this.rotateValue = 5;
        this.effectRotatePlate();

        MidAutumnSound.playClosePlate();
    },

    effectRotatePlate: function () {
        if (this.rotateValue == 0) {
            this.dice.runAction(cc.sequence(cc.rotateTo(MD_PLATE_DICE_CHANGE_DIRECT, this.rotateValue),
                cc.callFunc(this.effectRollDiceShow.bind(this))));
            this.setPosition(0, 0);
        } else {
            this.dice.runAction(cc.sequence(cc.rotateTo(MD_PLATE_DICE_CHANGE_DIRECT, this.rotateValue),
                cc.callFunc(this.effectRotatePlate.bind(this))));
            var temp = Math.abs(this.rotateValue);
            temp = temp - 1;
            this.rotateValue = temp * (this.rotateValue / Math.abs(this.rotateValue));
            this.rotateValue = this.rotateValue * -1;

            var x = Math.random() * 2;
            x = Math.random() > 0.5 ? x : -x;

            var y = Math.random() * 2;
            y = Math.random() > 0.5 ? y : -y;

            this.runAction(cc.moveTo(MD_PLATE_DICE_MOVE, x, y));
        }
    },

    effectRollDiceShow: function (sender) {

        if (this.countRoll >= this.maxCountRoll) {
            // goi tin result da tra ve
            if (!this.isWaitingRollResult) {
                this.effectShowResultRollDice();
                return;
            } else {
                this.countRoll = 0;
            }
        }
        this.countRoll++;
        var distance = 50;
        var x = 0;
        var y = 0;
        x = Math.random() * distance;
        x = Math.random() > 0.5 ? x : -x;
        x = this.dice.pos.x + x;

        distance = 5;
        y = Math.random() * distance;
        y = Math.random() > 0.5 ? y : -y;
        y = this.dice.pos.y + y;

        distance = Math.sqrt((x - this.dice.getPositionX()) * (x - this.dice.getPositionX()) + (y - this.dice.getPositionY()) * (y - this.dice.getPositionY()));
        var distanceRoot = 30.0;
        var timeRoot = 0.08;
        var timeReal = distance / distanceRoot * timeRoot;
        if (this.countRoll < this.maxCountRoll - 1) {
            sender.runAction(cc.sequence(cc.moveTo(timeReal, cc.p(x, y)), cc.callFunc(this.effectRollDiceShow.bind(this), sender)));
            if (this.countRoll % 2 == 0) {
                var p = this.pRollDice.convertToWorldSpace(this.dice);
                var smoke = new cc.ParticleSystem("res/Particles/smoke.plist");
                smoke.setBlendAdditive(true);
                smoke.setAutoRemoveOnFinish(true);
                this.layerEffect.addChild(smoke);
                smoke.setPosition(cc.p(p.x - this.dice.getContentSize().width * 0.3 + this.dice.getContentSize().width * Math.random() * 0.6,
                    p.y - 50 + Math.random() * 30));

                var fire = new cc.ParticleSystem("res/Particles/explodeFire.plist");
                fire.setAutoRemoveOnFinish(true);
                fire.setBlendAdditive(true);
                this.layerEffect.addChild(fire);
                fire.setPosition(cc.p(p.x - this.dice.getContentSize().width * 0.3 + this.dice.getContentSize().width * Math.random() * 0.6,
                    p.y - 70 + Math.random() * 30));

            }

            MidAutumnSound.playRollPlate();
        } else {
            sender.runAction(cc.sequence(cc.moveTo(timeRoot, this.dice.pos), cc.delayTime(0.5), cc.callFunc(this.effectRollDiceShow.bind(this), sender)));
        }
    },

    effectShowResultRollDice: function () {
        if (!this.cmdResult) {
            return;
        }
        if (this.cmdResult && this.cmdResult.result != 1) {
            this.pRollDice.setVisible(false);
            this.pRollDice.stopAllActions();
            return;
        }

        if (this.cmdResult.numMoves.length == 0) {
            // truogn hop quay 1 lan, chi co tung xuc xac va show ket qua
            this.pRollDice.setVisible(false);
            this.pRollDice.stopAllActions();
            this.showRollResult(false);
            return;
        }

        MidAutumnSound.playOpenPlate();

        var count = 0;
        var numMove = this.cmdResult.numMoves[0];
        this.diceResult.loadTexture("res/EventMgr/MidAutumn/MidAutumnUI/dice" + numMove + ".png");

        this.upDice.runAction(cc.moveTo(0.5, this.upDice.pos.x, this.upDice.pos.y + 300));
        this.light1.cleanup();
        this.light1.setScale(0);
        this.light2.setScale(0);
        this.light1.runAction(cc.spawn(cc.fadeIn(0.5), cc.scaleTo(0.5, 1, 1)));
        this.light2.runAction(cc.spawn(cc.fadeIn(0.5), cc.scaleTo(0.5, 1, 1)));

        if (!this.particle) {
            this.particle = new cc.ParticleSystem("res/Particles/effectDice.plist");
            this.particle.setLocalZOrder(11);
            this.particle.setBlendAdditive(true);
            this.light2.addChild(this.particle);
            this.particle.setPosition(cc.p(this.light2.getContentSize().width * 0.5, 250));
        }
        if (this.cmdResult.numMoves.length <= 10) {
            this.pRollDice.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(this.effectDiceToPath.bind(this)), cc.hide()));
        }
        else {
            // tung xuc xac 100 lan, chi show ra ket qua
            this.showRollResult(false);
        }
    },

    effectDiceToPath: function () {
        MidAutumnSound.playDiceFly();
        var pDice = this.dice.convertToWorldSpace(this.diceResult.getPosition());
        pDice = (this.mapComponent.convertToNodeSpace(pDice));
        this.mapComponent.effectDiceToPath(pDice);
    },

    effectStartRollExtreme : function () {
        MidAutumnSound.playFoxJump();
        //  this.mascot.eff.gotoAndPlay("jump", -1, -1, 0);
    },

    // result effect
    showRollResult: function (isRun) {
        if(!(sceneMgr.getMainLayer() instanceof MidAutumnScene)) return;
        this.isWaitingEffectMove = false;
        // cc.log("--ShowResult : " + JSON.stringify(this.giftsResult));
        if(isRun) {
            try {
                for(var i in this.arRunFunc) {
                    clearTimeout(this.arRunFunc[i]);
                }
                this.arRunFunc = [];
            }
            catch(e) {
                cc.log("ClearFunc : " + JSON.stringify(e));
            }

            this.mascotIdle(midAutumn.mapInfo.row,midAutumn.mapInfo.col);

            try {
                // cc.log("Hide Stone Character : " + midAutumn.mapInfo.row + "_" + midAutumn.mapInfo.col);
                this.arGrid[midAutumn.mapInfo.row + "_" + midAutumn.mapInfo.col].hideStone(Math.random());
            }
            catch(e) {
                cc.log("HideStone : " + JSON.stringify(e));
            }
        }
        if (this.cmdResult)
            this.giftsResult = this.cmdResult.gifts;
        if (this.giftsResult && Object.keys(this.giftsResult).length > 0) {
            var desPos = cc.p(cc.director.getWinSize().width * 0.95, cc.director.getWinSize().height / 2);
            var autoPos = this.mapComponent.getMascotPosition();
            var gui = sceneMgr.openGUI(MD_RESULT_GUI_CLASS, MD_RESULT_GUI_ORDER, MD_RESULT_GUI_ORDER);
            if (gui) {
                gui.openGift(this.giftsResult, desPos, this.lbGold.posEffect, isRun, autoPos, this.btnLamp.pos);
            }
        }
        else {
            this.onFinishEffectShowResult();
        }
    },

    onEffectGetMoneyItem: function (value) {
        this.isEffectMoney = true;
        if (this.lbGold.realGold)
            this.curEffectMoney = this.lbGold.realGold;
        else
            this.curEffectMoney = parseInt(StringUtility.replaceAll(this.lbGold.getString(), ".", ""));

        this.deltaEffectMoney = value * 0.25;
    },

    onFinishEffectShowResult: function () {
        var f = setTimeout(function () {
            this.setIsWaitingRollResult(false);
            this.isWaitingChooseDirect = false;

            this.enableRollButton(true);
            this.updateEventInfo();
            this.updateUserInfo();

            this.removeFuncTimeout("effect_finish_func");
        }.bind(this), 500);

        this.addFuncTimeout("effect_finish_func",f);
    },

    // character

    clearPieceInMap : function () {
        // cc.log("--clear piece---" + this.arPiece.length);
        for(var i in this.arPiece) {
            try {
                this.arPiece[i].removeFromParent();
            }
            catch (e) {
                // cc.log("--crash---" + e);
            }
        }
        this.arPiece = [];
    },

    randomRange: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    generateBubbleEffect: function (nScale, timeDelay, timeBubble, yMove) {
        yMove = yMove || 100;

        if(nScale < 0.2) nScale = 0.2;
        if(nScale > 0.8) nScale = 0.8;

        var sp2 = cc.Sprite.create(MD_IMAGE_BUBBLE);
        sp2.setScale(nScale);
        sp2.setVisible(false);
        sp2.setLocalZOrder(MD_MAP_ITEM_ZODER + 9);
        sp2.runAction(cc.sequence(cc.delayTime(timeDelay + Math.random()), cc.show(), cc.sequence(cc.spawn(cc.moveBy(timeBubble, cc.p(0, yMove)),
            cc.sequence(cc.scaleTo(timeBubble / 5, nScale - 0.05), cc.scaleTo(timeBubble / 5, nScale + 0.05),
                cc.scaleTo(timeBubble / 5, nScale - 0.15), cc.scaleTo(timeBubble / 5, nScale - 0.15),
                cc.spawn(cc.scaleTo(timeBubble / 3, 0), cc.fadeOut(timeBubble))))), cc.removeSelf()
        ));
        return sp2;
    },

    bubbleEffectMap : function (maxTime,nBubble,noSound) {
        maxTime = maxTime || MD_MAX_TIME_BUBBLE_IN_MAP;
        nBubble = 100;
        var totalTime = 0;

        if(!noSound)
            MidAutumnSound.playBubbleSequence();

        for(var i = -1 ; i < MD_COL + 2 ; i++)  {
            for(var j = 0 ; j < nBubble ; j++) {
                var timeDelay = 1 - Math.random();
                var timeBubble = Math.random()*maxTime;
                var yMove = j * 25;
                var nScale = Math.random();
                var sp = this.generateBubbleEffect(nScale,timeDelay,timeBubble,j * 25);
                this.batchBubble.addChild(sp);
                var pos = this.getPosFromIndex(MD_ROW + 1,i);
                var idx = Math.random()%2 == 0 ? 1 : -1;
                pos.x += idx * Math.random() * 100;
                pos.y += Math.random() * 200;
                sp.setPosition(pos);
                totalTime = timeDelay + timeBubble;
            }
        }
        return totalTime;
    },

    // roll
    onRollResult: function (cmd) {
        this.cmdResult = cmd;
        if (cmd.result == 1) {
            //this.mapComponent.effectDiceToPath(cmd);
            this.isWaitingEffectMove = true;
            if (cmd.numMoves.length < 1) {
                this.setIsWaitingRollResult(false);
                this.mapComponent.autoGenerateMovePath();
            }
            else if (cmd.numMoves.length == 1) {
                this.setIsWaitingRollResult(false);
            }
            else {
                this.mapComponent.generateMovePath();
            }
        } else {
            this.setIsWaitingRollResult(false);
            this.isWaitingEffectMove = false;

            this.updateUserInfo();
            this.updateEventInfo();

            this.pRollDice.setVisible(false);
            sceneMgr.showOKDialog(LocalizedString.to("MD_BREAK_RESULT_" + cmd.result));
        }
    },

    // update event and user info
    updateUserInfo: function () {
        if (!this.isWaitingRollResult) {
            this.lbGold.realGold = gamedata.userData.bean;
            this.lbGold.setString(StringUtility.formatNumberSymbol(gamedata.userData.bean));

            this.isEffectMoney = false;
        }
    },

    updateEventInfo: function () {
        if(!midAutumn.isRequestedInfo) return;
        if (this.isWaitingEffectMove)
            return;

        this.isEventTime = midAutumn.isInEvent();

        this.lbHammer.setString(StringUtility.pointNumber(midAutumn.keyCoin));
        this.lbLevel.setString(midAutumn.curLevel);

        this.lbTimeRemain.updateText(0, LocalizedString.to("MD_INFO_TIME_LEFT_0") + " ");
        this.lbTimeRemain.updateText(2, LocalizedString.to("MD_INFO_TIME_LEFT_1"));

        this.barHammer.point.setString(midAutumn.getExpString());
        this.barHammer.progress.setPercent(midAutumn.getExpPercent());

        this.updateItemList();

        // load stage
        if(this.isWaitingChangeStage) return;
        if (this.isWaitingChooseDirect) return;

        this.enableRollButton(midAutumn.mapInfo.remainMove == 0,this.isWaitShowScene);
        this.mapComponent.loadMap();
        if (midAutumn.mapInfo.remainMove > 0) {
            this.generateMovePath(midAutumn.mapInfo.remainMove);
        }

        // show dialog hammer empty
        if(!this.isChangeStage && !this.isFirstJoin) {
            midAutumn.showHammerEmpty(MD_HAMMER_NOTIFY_EMPTY);
        }

        if(this.isFirstJoin) {
            this.isFirstJoin = false;
        }

        if(this.isWaitShowScene) {
            this.effectShowScene();
        }
    },

    updateGSystem: function (cmd) {
        this.lbGServer.setString("S:" + StringUtility.pointNumber(cmd.gServer));
        this.lbGUser.setString("U:" + StringUtility.pointNumber(cmd.gUser));
    },

    updateItemList: function () {
        this.uiGiftFull.uiGift.reloadData();
        this.uiGiftLite.uiGift.reloadData();
    },

    openItem: function (info) {
        // MidAutumnSound.playSoundSingle();

        this.currentItemSelect = info.id; // for cheat

        this.txItem.setString(midAutumn.getItemName(info.id));
        this.txItem.id = info.id;

        if (info.gift > 0) {
            this.showPopupInfo();
            var open = sceneMgr.openGUI(MD_OPEN_GIFT_GUI_CLASS, MD_OPEN_GIFT_GUI_ORDER, MD_OPEN_GIFT_GUI_ORDER);
            if (open) open.showGift(info);
        }
    },

    selectCheatPie: function (id) {
        var cId = id % 10;
        this.currentCheatPie = cId;

        for (var i = 0; i < this.arBtnPie.length; i++) {
            var btn = this.arBtnPie[i];
            btn.setColor((btn.getTag() != id) ? cc.color(255, 255, 255, 0) : cc.color(255, 0, 0, 0));
        }
    },

    showPopupInfo: function (inf, pos) {

        if (inf === undefined && pos === undefined) {
            this.popupItem.setVisible(false);
        } else {
            this.popupItem.setVisible(true);
            this.popupItem.lbInfo.setString(LocalizedString.to("MD_COLLECTION_PIECE"));
            this.popupItem.lbName.setString(midAutumn.getItemName(inf.id));
            this.popupItem.setPosition(pos.x - 45, pos.y);
        }
    },

    doActionItemList: function (action) {
        this.showPopupInfo();
        if (this.currentItemList == action)
            return;
        this.currentItemList = action;

        this.pFullItem.setVisible(true);
        this.pLiteItem.setVisible(true);
        var timeActionShow = 0.5;
        var timeActionHide = 0.25;
        if (action == 1) {
            this.pFullItem.setPosition(this.pFullItem.posHide);
            this.pLiteItem.setPosition(this.pLiteItem.posShow);

            this.pLiteItem.runAction(cc.sequence(new cc.EaseBackIn(cc.moveTo(timeActionHide, this.pLiteItem.posHide)), cc.hide()));
            this.pFullItem.runAction(cc.sequence(cc.delayTime(timeActionHide), new cc.EaseBackOut(cc.moveTo(timeActionShow, this.pFullItem.posShow))));
        } else {
            if (this.fAutoHideItemList) {
                clearTimeout(this.fAutoHideItemList);
                this.fAutoHideItemList = null;
            }

            this.pLiteItem.setPosition(this.pLiteItem.posHide);
            this.pFullItem.setPosition(this.pFullItem.posShow);

            this.pFullItem.runAction(cc.sequence(new cc.EaseBackIn(cc.moveTo(timeActionHide, this.pFullItem.posHide)), cc.hide()));
            this.pLiteItem.runAction(cc.sequence(cc.delayTime(timeActionHide), new cc.EaseBackOut(cc.moveTo(timeActionShow, this.pLiteItem.posShow))));
        }

    },

    // function gui
    addFuncTimeout : function (key,func) {
        this.arSceneFunc[key] = func;
    },

    removeFuncTimeout : function (key) {
        try {
            if(key in this.arSceneFunc) {
                clearTimeout(this.arSceneFunc[key]);
                delete this.arSceneFunc[key];
            }
        }
        catch(e) {
            cc.log("++RemoveFuncError : " + JSON.stringify(e));
        }
    },

    onButtonRelease: function (btn, id) {
        if (id != MD_SCENE_BTN_CLOSE && !midAutumn.isInEvent()) {
            sceneMgr.showOkDialogWithAction(LocalizedString.to("MD_EVENT_TIMEOUT"), function (buttonId) {
                this.onBack();
            });
            return;
        }
        MidAutumnSound.playBubbleSingle();
        this.doActionItemList(MD_SHOW_LIST_ITEM_MINI);
        switch (id) {
            case MD_SCENE_BTN_CLOSE: {
                this.onBack();
                break;
            }
            case MD_SCENE_BTN_HELP: {
                // var cmd = {needChooseDirection: true, numMove: 3, result: 1};
                // this.onRollResult(cmd);

                sceneMgr.openGUI(MD_HELP_GUI_CLASS, MD_HELP_GUI_ORDER,MD_HELP_GUI_ORDER);
                break;
            }
            case MD_SCENE_BTN_STAGE_UP :
            case MD_SCENE_BTN_STAGE_DOWN : {
                if (this.isWaitingRollResult) return;
                if (this.isWaitingChooseDirect) return;
                if (this.isWaitingChangeStage) return;

                var nextStage = midAutumn.mapInfo.stage + id - MD_SCENE_BTN_STAGE;
                if (nextStage < 0 || nextStage > 2) return;

                var cmd = new CmdSendMidAutumnChangeStage();
                cmd.putData(nextStage);
                GameClient.getInstance().sendPacket(cmd);

                this.effectChangeStage(midAutumn.mapInfo.stage,nextStage);
                break;
            }
            case MD_SCENE_CHEAT_ITEM: {
                if (!Config.ENABLE_CHEAT) return;

                var item = this.txItem.id;
                if (item === undefined || item == null) {
                    Toast.makeToast(Toast.SHORT, "Chua chon Item !!!");
                    return;
                }
                var num = this.txNum.getString();
                if (num == "" || isNaN(num)) {
                    num = 1;
                }

                var piece = this.currentCheatPie;

                var itemPieceId = parseInt(item) + parseInt(piece);
                cc.log("++CheatItem " + itemPieceId + " have " + num);
                var cmd = new CmdSendMidAutumnCheatItem();
                cmd.putData(itemPieceId, parseInt(num));
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case MD_SCENE_CHEAT_EXP_COIN: {
                if (!Config.ENABLE_CHEAT) return;

                var exp = this.txExp.getString();
                var coin = this.txCoin.getString();

                if (exp == "" || isNaN(exp)) {
                    exp = 0;
                }
                if (coin == "" || isNaN(coin)) {
                    coin = 0;
                }

                var cmd = new CmdSendMidAutumnCheatCoinAccumulate();
                cmd.putData(parseFloat(coin), parseInt(exp));
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case MD_SCENE_CHEAT_COIN_FREE: {
                if (!Config.ENABLE_CHEAT) return;

                var cmd = new CmdSendMidAutumnCheatCoinFree();
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case MD_SCENE_CHEAT_RESET_SERVER: {
                if (!Config.ENABLE_CHEAT) return;

                var cmd = new CmdSendMidAutumnCheatReset();
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case MD_SCENE_CHEAT_SHOW_FULLTIME: {
                if (!Config.ENABLE_CHEAT) return;

                this.lbTimeFull.setVisible(!this.lbTimeFull.isVisible());
                break;
            }
            case MD_SCENE_CHEAT_G_SERVER: {
                if (!Config.ENABLE_CHEAT) return;

                var gServer = parseFloat(this.txGServer.getString());
                if (isNaN(gServer)) gServer = 0;
                var gUser = parseFloat(this.txGUser.getString());
                if (isNaN(gUser)) gUser = 0;

                var cmd = new CmdSendMidAutumnCheatGServer();
                cmd.putData(gServer, gUser);
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case MD_SCENE_BTN_CHEAT: {
                if (!Config.ENABLE_CHEAT) return;

                if (this.pCheat.getPosition().x != this.pCheat.pos.x) {
                    this.pCheat.setPositionX(this.pCheat.pos.x);
                } else {
                    this.pCheat.setPositionX(this.pCheat.getContentSize().width * this._scale);
                }
                break;
            }
            case MD_SCENE_CHEAT_NUM_ROLL: {
                if (!Config.ENABLE_CHEAT) return;

                var nRoll = parseFloat(this.txNumRoll.getString());
                if (isNaN(nRoll)) nRoll = 0;
                if (nRoll != 0) {
                    midAutumn.saveLastGifts();
                    this.effectStartRollDice();
                    var cmd = new CmdSendMidAutumnCheatNumRoll();
                    cmd.putData(nRoll);
                    GameClient.getInstance().sendPacket(cmd);
                }
                break;
            }
            case MD_SCENE_CHEAT_PIE_1:
            case MD_SCENE_CHEAT_PIE_2:
            case MD_SCENE_CHEAT_PIE_3:
            case MD_SCENE_CHEAT_PIE_4: {
                this.selectCheatPie(id);
                break;
            }
            case MD_SCENE_BTN_ROLL_ONCE :
            case MD_SCENE_BTN_ROLL_TEN:
            case MD_SCENE_BTN_ROLL_HUNDRED: {
                this.doRoll(id - MD_SCENE_BTN_ROLL_ONCE, btn.convertToWorldSpace(cc.p(0.5, 0.5)));
                // var cmd = {needChooseDirection: true, numMove: 3, result: 1};
                // this.onRollResult(cmd);
                break;
            }
            case MD_SCENE_BTN_HISTORY : {
                sceneMgr.openGUI(MD_HISTORY_GUI_CLASS, MD_HISTORY_GUI_ORDER, MD_HISTORY_GUI_ORDER);
                break;
            }
            case MD_SCENE_BTN_NEWS : {
                NativeBridge.openWebView(midAutumn.eventLinkNews);
                break;
            }
            case MD_SCENE_BTN_LAMP : {
                midAutumn.sendGetLampInfo();
                sceneMgr.openGUI(MidAutumnLampGUI.className, MidAutumnLampGUI.tag, MidAutumnLampGUI.tag);
                break;
            }
            case MD_SCENE_BTN_SHOP : {
                //gamedata.openNapGInTab(0, MD_SCENE_CLASS,true);
                gamedata.openShop(MD_SCENE_CLASS, true);
                // gamedata.openShopTicket(MD_SCENE_CLASS,true);
                break;
            }
            case MD_SCENE_BTN_OK : {
                break;
            }
            case MD_SCENE_BTN_CHANGE: {
                var gui = sceneMgr.openGUI(MD_HISTORY_GUI_CLASS, MD_HISTORY_GUI_ORDER, MD_HISTORY_GUI_ORDER);
                gui.onButtonRelease(null, MD_SCENE_TAB_CHANGE);
                break;
            }
        }
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable()) return;

        sceneMgr.openScene(LobbyScene.className);
    },

    onExit: function () {
        BaseLayer.prototype.onExit.call(this);

        MidAutumnSound.closeLobby();

        midAutumn.midAutumnScene = null;
        midAutumn.notifyEvent = false;

        this.setIsWaitingRollResult(false);
        this.isWaitingChooseDirect = false;

        for(var s in this.arSceneFunc) {
            this.removeFuncTimeout(s);
        }
    },

    update: function (dt) {
        // Effect Money run
        if (this.isEffectMoney) {
            this.curEffectMoney += this.deltaEffectMoney;
            this.lbGold.realGold = this.curEffectMoney;
            this.lbGold.setString(StringUtility.formatNumberSymbol(this.curEffectMoney));
        }

        // update event time
        if (this.lbTimeRemain && this.isEventTime) {
            var stime = midAutumn.getTimeLeftString();
            var nTime = midAutumn.getTimeLeft();

            if (nTime <= 0) {
                if (midAutumn.checkWeek(MD_WEEK_END)) {
                    this.lbTimeRemain.updateText(0, LocalizedString.to("MD_EVENT_TIMEOUT"));
                    midAutumn.eventTime = MD_WEEK_END + 1;

                    this.enableRollButton(false);

                    // Kick user to Lobby if QC want
                    //sceneMgr.openScene(LobbyScene.className);
                } else {
                    this.lbTimeRemain.updateText(0, LocalizedString.to("MD_EVENT_NEXT_WEEK"));
                }
                this.lbTimeRemain.updateText(1, "");
                this.lbTimeRemain.updateText(2, "");

                this.isEventTime = false;
            } else {
                this.lbTimeRemain.updateText(1, stime);
            }

            this.lbTimeRemain.setPositionX(this.lbTimeRemain.parentSize.width * 0.95 - this.lbTimeRemain.getWidth());

            if (Config.ENABLE_CHEAT)
                this.lbTimeFull.setString(midAutumn.getTimeLeftString(true));
        }
        else {
            if(this.lbTimeRemain) {
                this.lbTimeRemain.updateText(0, LocalizedString.to("MD_EVENT_TIMEOUT"));
                this.lbTimeRemain.updateText(1, "");
                this.lbTimeRemain.updateText(2, "");
            }
        }



        // effect random cell
        if(this.nTimeEffect > 0) {
            this.nTimeEffect -= dt;
            if(this.nTimeEffect <= 0) {
                this.nTimeEffect = MD_CELL_EFFECT_COUNT_DOWN;

                for(var i = 0 ; i < 5 ; i++) {
                    var x = this.randomRange(0,MD_ROW - 1);
                    var y = this.randomRange(0,MD_COL - 1);
                    var grd = this.arGrid[x + "_" + y];
                    if(grd && grd instanceof MidAutumnGrid) {
                        grd.effect();
                    }
                }
            }
        }

        // effect bubble
        if(this.nTimeBubbleEffect > 0) {
            this.nTimeBubbleEffect -= dt;
            if(this.nTimeBubbleEffect <= 0) {
                this.nTimeBubbleEffect = MD_BUBBLE_EFFECT_COUNT_DOWN;

                this.randomBubbleMap();
            }
        }

        // update Map Component
        this.mapComponent.update(dt);


    },
});

var MidAutumnOpenResultGUI = BaseLayer.extend({

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

        this.isScrollGui = false;

        this.isAutoGift = false;
        this.cmd = null;

        this._super(MD_RESULT_GUI_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnOpenResultGUI.json");
    },

    initGUI: function () {
        var winSize = cc.director.getWinSize();

        this.bg = this.getControl("bg");
        var top = this.getControl("pTop");
        var bot = this.getControl("pBot");

        this.deco = this.getControl("deco", top);
        this.deco.pos = this.deco.getPosition();

        this.title = this.getControl("congrat", top);
        this.title.pos = this.title.getPosition();

        this.btn = this.customButton("btnGet", 1, bot);
        this.btn.pos = this.btn.getPosition();

        this.share = this.customButton("btnShare", 2, bot);
        this.share.pos = this.share.getPosition();

        this.logo_zp = this.getControl("logo", bot);

        this.pIgnore = this.getControl("pIgnore");
        this.pIgnore.btn = this.customButton("check", 9, this.pIgnore,false);
        this.pIgnore.tick = this.getControl("tick",this.pIgnore.btn);

        // item in list <= 10
        this.gift = this.getControl("pCenter");
        this.defaultItem = this.getControl("defaultItem", this.gift).clone();
        this.defaultItem.size = this.defaultItem.getContentSize();
        this.defaultItem.size.width *= 1.05;
        this.defaultItem.size.height *= 1.15;
        this.defaultItem.padX = this.defaultItem.size.width * 0.15;
        this.defaultItem.padY = this.defaultItem.size.height * 0.15;

        // item in list > 10
        this.list = this.getControl("pList");

        var iLeft = this.getControl("left", this.list);
        var iRight = this.getControl("right", this.list);
        this.list.left = iLeft;
        this.list.right = iRight;
        iLeft.setLocalZOrder(10);
        iRight.setLocalZOrder(10);

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
        this.setBackEnable(true);

        this.ignoreAllButtonSound();
    },

    onEnterFinish: function () {

        this.gift.removeAllChildren();

        this.title.setVisible(false);
        this.deco.setVisible(false);
        this.btn.setVisible(false);
        //this.share.setVisible(false);
        this.logo_zp.setVisible(false);

        this.title.setPosition(this.title.pos);
        this.deco.setPosition(this.deco.pos);
        this.btn.setPosition(this.btn.pos);
        // this.share.setPosition(this.share.pos);

        this.spGifts = [];

        if (!cc.sys.isNative){
            this.uiGift.setTouchEnabled(true);
        }
    },

    // open gui
    openGift: function (obj, desPos, goldPos, isRun, autoPos, lampPos) {
        // cc.log("MidAutumnOpenResultGUI::openGift " + JSON.stringify(arguments));

        this.isAutoGift = false;
        this.isScrollGui = false;

        var timeDelay = 0.5;

        this.goldPos = this.gift.convertToNodeSpace(goldPos);
        this.desPos = this.gift.convertToNodeSpace(desPos);
        this.autoPos = this.gift.convertToNodeSpace(autoPos);
        this.lampPos = this.gift.convertToNodeSpace(lampPos);

        var gifts = [];
        for (var key in obj) {
            var ooo = {};
            ooo.isStored = midAutumn.isItemStored(key);
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

        if (!isRun && midAutumn.ignoreShowResultGUI) {
            this.showGiftIgnoreGUI();
            return;
        }

        this.pIgnore.setVisible(false);
        this.pIgnore.tick.setVisible(false);
        if (!isRun) {
            this.pIgnore.runAction(cc.sequence(cc.delayTime(timeDelay), cc.show()));
        }

        if (nGift > 12) {
            MidAutumnSound.playSoundSequence();
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
        } else {
            nRow = 1;
            nCol[0] = nGift;
        }

        var timeShow = 1;
        var count = 0;
        this.spGifts = [];
        for (var j = 0; j < nRow; j++) {
            var pStart = this.calculateStartPos(nCol[j], nRow, j);
            for (var i = 0; i < nCol[j]; i++) {
                var inf = gifts[count++];

                var p = new MidAutumnResultGift();
                p.setGift(inf);
                p.setPosition(pStart.x + i * (this.defaultItem.size.width + this.defaultItem.padX), pStart.y);
                p.setScale(0);
                p.runAction(cc.sequence(cc.delayTime(timeDelay), new cc.EaseBackOut(cc.scaleTo(timeShow, 1))));
                this.gift.addChild(p);
                this.spGifts.push(p);
            }
        }

        this.runAction(cc.sequence(cc.delayTime(timeDelay), cc.callFunc(MidAutumnSound.playFinishBreak)));

        this.bg.setOpacity(0);
        this.bg.setVisible(true);
        this.bg.runAction(cc.sequence(cc.fadeTo(timeShow + timeDelay, 220), cc.callFunc(this.onFinishEffect.bind(this))));
    },

    getGiftScrollIndex: function (idx) {
        this.list.left.setVisible(false);
        this.list.right.setVisible(false);

        var ar = [];
        ar.push(this.arGifts[idx]);

        var maxCol = 0;
        var size = this.arGifts.length;
        if (size % 2 == 0) maxCol = size / 2;
        else maxCol = parseInt(size / 2) + 1;
        var cIdx = idx + maxCol;
        if (cIdx < size)
            ar.push(this.arGifts[idx + maxCol]);

        return ar;
    },

    showGiftIgnoreGUI: function () {

        this.bg.setVisible(false);
        this.pIgnore.setVisible(false);

        this.gift.removeAllChildren();
        this.gift.setVisible(true);

        this.getGiftInPanel();
    },

    showGiftScroll: function () {
        this.isScrollGui = true;
        this.list.setVisible(true);
        this.list.left.setVisible(true);
        this.list.right.setVisible(true);
        this.uiGift.reloadData();

        this.runAction(cc.sequence(cc.delayTime(0.15), cc.callFunc(MidAutumnSound.playFinishBreak)));

        this.bg.setOpacity(0);
        this.bg.setVisible(true);
        this.bg.runAction(cc.sequence(cc.fadeTo(0.25, 220), cc.callFunc(this.onFinishEffect.bind(this))));
    },

    getGiftInScroll: function () {
        var size = this.arGifts.length;
        if (size % 2 == 0) size = size / 2;
        else size = parseInt(size / 2) + 1;

        var totalTime = 0;
        var timeHide = 0.1;
        var delayTime = 0.25;
        var lastTime = 0;
        var totalEffectTime = 0;

        for (var i = 0; i < size; i++) {
            var cell = this.uiGift.cellAtIndex(i);
            if (cell) {
                var ar = cell.getDropInfo();
                for (var j = 0; j < ar.length; j++) {
                    var ggg = ar[j];
                    if (ggg && ggg.isItem) {
                        var time = 0;
                        var actDrop = null;
                        var actHide = null;
                        var startPos = this.gift.convertToNodeSpace(ggg.pos);
                        startPos.x += 128 / 4;
                        startPos.y += 330 / 4;
                        if (midAutumn.isLamp(ggg.id)) {
                            time = this.dropPiece(ggg.id, 1, startPos, this.lampPos, true); //ggg.value
                            actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id,1, startPos, this.lampPos, false)); // ggg.value
                        }
                        else if (ggg.isStored) { // pie image
                            time = this.dropPiece(ggg.id, 1, startPos, this.desPos, true); //ggg.value
                            actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id,1, startPos, this.desPos, false)); // ggg.value
                        } else {  // drop gold
                            var num = midAutumn.getItemValue(ggg.id);// * ggg.value;
                            time = this.dropGold(num, startPos, this.goldPos, true);
                            actDrop = cc.callFunc(this.dropGold.bind(this, num, startPos, this.goldPos, false));
                        }

                        if (time > lastTime) lastTime = time;

                        actHide = cc.spawn(cc.scaleTo(timeHide, 0), cc.fadeOut(timeHide));
                        totalEffectTime += lastTime;
                        cell.runAction(cc.sequence(cc.delayTime(delayTime * (i + 1) / 2), actHide, actDrop));
                    }
                }
            }
        }

        totalTime = lastTime + delayTime * size/2 + timeHide;
        this.runAction(cc.sequence(cc.delayTime(totalTime), cc.callFunc(this.onCloseGUI.bind(this))));
    },

    getGiftInPanel: function () {
        var totalTime = 0;
        var timeHide = 0.1;
        var delayTime = 0.25;
        var lastTime = 0;
        var totalEffectTime = 0;
        var size = 0;
        for (var i = 0, size = this.arGifts.length; i < size; i++) {
            var ggg = this.arGifts[i];
            var spGift = this.spGifts[i];
            var spGiftPos = spGift ? spGift.getPosition() :
                (this.autoPos ? this.autoPos : cc.p(this.gift.getContentSize().width / 2, this.gift.getContentSize().height / 2));
            var time = 0;
            var actDrop = null;
            var actHide = null;
            if (midAutumn.isLamp(ggg.id)) {
                time = this.dropPiece(ggg.id, 1, spGiftPos, this.lampPos, true); //ggg.value
                actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id, 1, spGiftPos, this.lampPos, false)); //ggg.value
            }
            else if (ggg.isStored) { // pie image
                time = this.dropPiece(ggg.id, 1, spGiftPos, this.desPos, true); //ggg.value
                actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id, 1, spGiftPos, this.desPos, false)); //ggg.value
            } else {  // drop gold
                // continue;
                var num = midAutumn.getItemValue(ggg.id)%20;// * ggg.value;
                time = this.dropGold(num, spGiftPos, this.goldPos, true);
                actDrop = cc.callFunc(this.dropGold.bind(this, num, spGiftPos, this.goldPos, false));
            }

            if (time > lastTime) lastTime = time;

            actHide = cc.spawn(cc.scaleTo(timeHide, 0), cc.fadeOut(timeHide));
            totalEffectTime += lastTime;
            if (spGift) spGift.runAction(cc.sequence(cc.delayTime(delayTime * (i + 1)/2), actHide, actDrop));
            else this.gift.runAction(cc.sequence(cc.delayTime(delayTime * (i + 1)/2), actDrop));
        }
        totalTime = lastTime + delayTime * size/2 + timeHide;
        this.runAction(cc.sequence(cc.delayTime(totalTime/4),cc.callFunc(function () {
            if(midAutumn.midAutumnScene) {
                midAutumn.midAutumnScene.clearPieceInMap();
            }
        }),cc.delayTime(totalTime*3/4), cc.callFunc(this.onCloseGUI.bind(this))));
    },

    getGift: function () {
        this.title.setVisible(true);
        this.title.setPosition(this.title.pos);
        this.title.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.title.pos.x, this.title.pos.y + 400))));

        this.deco.setVisible(true);
        this.deco.setPosition(this.deco.pos);
        this.deco.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.deco.pos.x, this.deco.pos.y + 400))));

        this.btn.setVisible(true);
        this.btn.setPosition(this.btn.pos);
        this.btn.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.btn.pos.x, this.btn.pos.y - 400))));

        //  this.share.setVisible(true);
        //  this.share.setPosition(this.share.pos);
        //  this.share.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.share.pos.x, this.share.pos.y - 400))));

        this.bg.setOpacity(220);
        this.bg.setVisible(true);
        this.bg.runAction(cc.fadeOut(2));

        this.pIgnore.setVisible(false);

        if (this.isScrollGui) {
            this.getGiftInScroll();
            return;
        }

        this.getGiftInPanel();
    },

    // effect
    dropPiece: function (id, value, pStart, pEnd, checkTime) {
        // cc.log("DropPiece " + JSON.stringify(arguments));
        var timeMove = 0.5;
        var timeHide = 0.25;
        var dTime = 0.1;
        if (checkTime) {
            return timeMove + dTime * value + timeHide;
        }

        var winSize = cc.director.getWinSize();
        for (var i = 0; i < value; i++) {
            var sp;
            if (midAutumn.isLamp(id))
                sp = new cc.Sprite(midAutumn.getPieceImage(id));
            else
                sp = new cc.Sprite(midAutumn.getPieceImage(id));
            sp.setScale(0.6);
            var rnd = parseInt(Math.random() * 10) % 2 == 0;
            var pCX = Math.random() * winSize.width;
            var pCY = Math.random() * winSize.height;
            var posCenter = cc.p(pCX, pCY);
            var actMove = new cc.BezierTo(timeMove, [pStart, posCenter, pEnd]);
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            sp.runAction(cc.sequence(cc.delayTime(dTime * i), cc.spawn(actMove, cc.callFunc(MidAutumnSound.playPiece)), actHide));
            sp.setPosition(pStart);
            this.gift.addChild(sp);
        }

        return 0;
    },

    dropGold: function (gold, pStart, pEnd, checkTime) {
        // cc.log("dropGold " + JSON.stringify(arguments));
        var num = Math.floor(gold / 100000);
        if (num < 1) num = 1;
        var goldReturn = Math.floor(gold / num);

        var timeMove = 0.5;
        var dTime = 0.3;
        var timeHide = 0.15;
        var timeShow = 0.1;

        if (checkTime) {
            return timeMove + timeHide + dTime + timeShow;
        }

        var winSize = cc.director.getWinSize();
        var rangeX = [-50, 50];
        var rangeY = [-50, 50];

        num = (num < 10) ? num : (10 + parseInt(num / 5));

        for (var i = 0; i < num; i++) {
            var sp = new CoinEffectAnim(0.05);
            sp.start(true);

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

            sp.runAction(cc.sequence(cc.delayTime(Math.random() * dTime), actShow, cc.spawn(actMove, cc.sequence(cc.delayTime(1.5 * Math.random()), cc.callFunc(MidAutumnSound.playSingleCoin))), cc.callFunc(function () {
                if (midAutumn.midAutumnScene) {
                    midAutumn.midAutumnScene.onEffectGetMoneyItem(goldReturn);
                }
            }.bind(this, goldReturn)), actHide));
        }
        return 0;
    },

    onFinishEffect: function () {
        this.title.setVisible(true);
        this.title.setPositionY(this.title.pos.y + 400);
        this.title.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.title.pos)));

        this.deco.setVisible(true);
        this.deco.setPositionY(this.deco.pos.y + 400);
        this.deco.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.deco.pos)));

        this.btn.setVisible(true);
        this.btn.setPositionY(this.btn.pos.y - 400);
        this.btn.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.btn.pos)));

        //  this.share.setVisible(true);
        //  this.share.setPositionY(this.share.pos.y - 400);
        //  this.share.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.share.pos)));
    },

    effectMoney: function (sender, value) {
        if (value === undefined || value == null) return;

        if (midAutumn.midAutumnScene) {
            midAutumn.midAutumnScene.onEffectGetMoneyItem(value);
        }
    },

    // ui function
    onButtonRelease: function (btn, id) {
        if (id == 9) {   // clear new day !

            MidAutumnSound.playBubbleSingle();
            if (midAutumn.ignoreShowResultGUI) {
                midAutumn.saveIgnoreResultGUI(false);
                this.pIgnore.btn.setColor(cc.color(255, 255, 255));
                this.pIgnore.tick.setVisible(false);
            } else {
                midAutumn.saveIgnoreResultGUI(true);
                this.pIgnore.btn.setColor(cc.color(0, 255, 0));
                this.pIgnore.tick.setVisible(true);
            }
            return;
        }
        if (id == 1) {
            this.onBack();
        } else {
            if (this.isScrollGui) return;
            this.onCapture();
        }
    },

    onBack: function () {
        MidAutumnSound.playSoundSingle();

        if (this.isAutoGift) {
            var gIds = [];
            for (var i = 0; i < this.cmd.gifts.length; i++) {
                if (midAutumn.isItemOutGame(this.cmd.gifts[i].id)) {
                    gIds.push(this.cmd.gifts[i].id);
                }
            }
            if (gIds.length > 0) {
                if (midAutumn.isRegisterSuccess) {
                    var cmd = new CmdSendMidAutumnChangeAward();
                    cmd.putData(false, gIds);
                    GameClient.getInstance().sendPacket(cmd);
                } else {
                    midAutumn.showRegisterInformation(gIds);
                }
            }
            this.onClose();
        } else {
            this.getGift();
            //this.onCloseGUI();
        }
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(128, 330);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new MidAutumnGiftCell(this);
        }
        cell.setVisible(true);
        cell.setScale(1);
        cell.setInfo(this.getGiftScrollIndex(idx));
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        var size = this.arGifts.length;
        if (size % 2 == 0) return size / 2;

        return parseInt(size / 2) + 1;
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

        this.share.setVisible(true);
        this.btn.setVisible(true);

        this.logo_zp.setVisible(false);
    },

    onCloseGUI: function () {
        if(midAutumn && midAutumn.midAutumnScene)
            midAutumn.midAutumnScene.onFinishEffectShowResult();

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
    },
});

var MidAutumnOpenGiftGUI = BaseLayer.extend({

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

        this._super(MD_OPEN_GIFT_GUI_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnOpenGiftGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");

        this.logo_zp = this.getControl("logo");

        this.panel = this.getControl("panel");

        this.pEffect = this.getControl("effect");

        this.lbNotice = this.getControl("lb", this.panel);
        this.lbName = this.getControl("gift", this.panel);
        this.gift = this.getControl("img", this.panel);
        this.gift.pos = this.gift.getPosition();
        this.btn = this.customButton("btn", 1, this.panel);
        this.share = this.customButton("share", 2, this.panel);

        this.title = this.getControl("title", this.panel);
        this.circle = this.getControl("circle", this.panel);
        this.particle = this.panel.getChildByName("particle");

        this.lbNotice.pos = this.lbNotice.getPosition();
        this.lbName.pos = this.lbName.getPosition();
        this.gift.pos = this.gift.getPosition();
        this.btn.pos = this.btn.getPosition();
        this.share.pos = this.share.getPosition();
        this.title.pos = this.title.getPosition();
        this.circle.pos = this.circle.getPosition();
        this.particle.pos = this.particle.getPosition();

        this.ignoreAllButtonSound();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {

        MidAutumnSound.playSoundSequence();

        this.bg.setOpacity(255);

        this.panel.setVisible(true);
        this.panel.setOpacity(255);

        this.pEffect.removeAllChildren();

        this.btn.setVisible(true);

        this.share.setVisible(false);
        this.logo_zp.setVisible(false);

        this.arrayFirework = [];
        this.countTimeFireWork = 0;
        this.scheduleUpdate();
    },

    doAnimate: function () {
        var time = 0;
        var tDrop = 0.3;

        this.btn.setVisible(true);
        this.share.setVisible(false);

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
        this.lbNotice.runAction(cc.sequence(cc.delayTime(time),new cc.EaseBackOut(cc.moveTo(tDrop, this.lbNotice.pos))));

        time += 0.05;
        this.lbName.setPositionY(this.lbName.pos.y + 500);
        this.lbName.runAction(cc.sequence(cc.delayTime(time),new cc.EaseBackOut(cc.moveTo(tDrop, this.lbName.pos))));

        this.btn.setPositionY(this.btn.pos.y - 400);
        this.btn.runAction(cc.sequence(cc.delayTime(time),new cc.EaseBackOut(cc.moveTo(tDrop, this.btn.pos))));

        this.share.setPositionY(this.btn.pos.y - 400);
        this.share.runAction(cc.sequence(cc.delayTime(time),new cc.EaseBackOut(cc.moveTo(tDrop, this.share.pos))));

        time += 0.15;
        this.gift.setPosition(this.gift.pos);
        this.gift.setScale(0);
        this.gift.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(MidAutumnSound.playGift),new cc.EaseBackOut(cc.scaleTo(0.5, 1))));

        this.circle.setScale(0);
        this.circle.runAction(cc.sequence(cc.spawn(cc.scaleTo(1.5, 1), cc.rotateTo(1.5, 360)), cc.repeatForever(cc.rotateBy(0.15, 5))));
        this.circle.runAction(cc.repeatForever(cc.rotateBy(0.15, 5)));
    },

    hideAnimate: function () {
        var tDrop = 0.3;

        this.btn.setVisible(true);
        this.share.setVisible(false);

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

        this.info = inf;

        this.gift.setScale(1);
        this.gift.removeAllChildren();

        if (inf.gift > 1) {
            this.lbName.setString(inf.gift + "x" + midAutumn.getItemName(this.info.id));
        } else {
            this.lbName.setString(midAutumn.getItemName(this.info.id));
        }

        // khong con phan thuong out game
        if (midAutumn.isItemOutGame(inf.id) && false)
            this.lbName.setString(((inf.gift > 1) ? (inf.gift + " ") : "") + midAutumn.getItemName(this.info.id));

        cc.log("ID GIFT " + midAutumn.getGiftImageOpen(this.info.id));
        var sp = new cc.Sprite(midAutumn.getGiftImageOpen(this.info.id));

        //sp.setScale(1.25);
        this.gift.addChild(sp);
        this.gift.setOpacity(255);
        var pSize = this.gift.getContentSize();
        sp.setPosition(pSize.width / 2, pSize.height / 2);
        this.doAnimate();
    },

    onGiftSuccess: function () {
        this.circle.setVisible(false);
        this.particle.setVisible(false);

        var numGold = (this.info.id % 1000) * 10;
        var timeDone = 1 + numGold / 100;

        this.gift.runAction(cc.fadeOut(timeDone));

        if (this.info.id == 1000020) {
            var eff = new ImageEffectLayer();
            this.pEffect.addChild(eff);
            eff.setPositionCoin(SceneMgr.convertPosToParent(this.pEffect, this.gift));
            eff.startEffect(100, ImageEffectLayer.TYPE_FLOW, "res/Lobby/GUIVipNew/iconVpointBig.png");
            eff.setCallbackFinish(this.onBack.bind(this));
        }
        else if (this.info.id == 1030 || this.info.id == 1000010) {
            var eff = new ImageEffectLayer();
            this.pEffect.addChild(eff);
            eff.setPositionCoin(SceneMgr.convertPosToParent(this.pEffect, this.gift));
            eff.startEffect(100, ImageEffectLayer.TYPE_FLOW, "res/EventMgr/MidAutumn/MidAutumnUI/iconDiamond.png");
            eff.setCallbackFinish(this.onBack.bind(this));
        }
        else {
            var eff = new CoinEffectLayer();
            eff.setPositionCoin(SceneMgr.convertPosToParent(this.pEffect, this.gift));
            eff.startEffect(numGold, CoinEffectLayer.TYPE_FLOW);
            eff.setCallbackFinish(this.onBack.bind(this));
            this.pEffect.addChild(eff);
        }


        if (this.bg) {
            this.bg.setVisible(true);
            this.bg.runAction(cc.fadeOut(timeDone));
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
    },

    onFinishEffectFirework: function (sender) {
        sender.setVisible(false);
    },

    onButtonRelease: function (button, id) {
        MidAutumnSound.playSoundSingle();

        if (id == 1) {
            if (this.isWaitResponse)
                return;
            this.hideAnimate();
            // Fix code do luat chuyen qua out game thanh in game
            if (midAutumn.isItemOutGame(this.info.id) && false && this.isAutoGift == false) {
                if (midAutumn.isRegisterSuccess) {
                    var cmd = new CmdSendMidAutumnChangeAward();
                    cmd.putData(false, this.info.id);
                    GameClient.getInstance().sendPacket(cmd);
                    NewVipManager.getInstance().setWaiting(true);
                } else {
                    midAutumn.showRegisterInformation([this.info.id]);
                }

                // this.onBack();
            } else {
                if (this.isAutoGift) {
                    this.onGiftSuccess();
                } else {
                    this.isWaitResponse = true;
                    var cmd = new CmdSendMidAutumnChangeAward();
                    if (midAutumn.isItemOutGame(this.info.id))
                        cmd.putData(false, this.info.id);
                    else
                        cmd.putData(true, this.info.id);
                    GameClient.getInstance().sendPacket(cmd);
                    NewVipManager.getInstance().setWaiting(true);
                }
            }
        } else {
            this.onCapture();
        }
    },

    onCapture: function () {
        this.share.setVisible(false);
        this.btn.setVisible(false);

        //this.girl.setVisible(true);
        this.logo_zp.setVisible(true);
        //this.logo_event.setVisible(true);

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

        this.btn.setVisible(true);
        this.share.setVisible(true);

        //this.girl.setVisible(false);
        this.logo_zp.setVisible(false);
        //this.logo_event.setVisible(false);
    },

    onBack: function () {
        this.onClose();
        this.isWaitResponse = false;
        midAutumn.showAutoGift();
        NewVipManager.checkShowUpLevelVip();
    },
});

var MidAutumnRegisterInformationGUI = BaseLayer.extend({

    ctor: function () {
        this.giftIds = [];

        this.txName = null;
        this.txAddress = null;
        this.txCmnd = null;
        this.txSdt = null;
        this.txEmail = null;

        this.btnRegister = null;

        this._super(MD_REGISTER_GUI_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnRegisterInformationGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", MD_SCENE_BTN_CLOSE, this._bg);
        this.btnFanpage = this.customButton("btnFanpage", MD_SCENE_BTN_FANPAGE, this._bg);
        this.btnFanpage.setVisible(false);
        this.btnRegister = this.customButton("complete", MD_SCENE_BTN_OK, this._bg);
        this.btnRegister.enable = false;

        this.giftName = this.getControl("gift", this._bg);

        // init editbox
        this.txName = this.createExitBox(this.getControl("bgName", this._bg), LocalizedString.to("MD_NAME"), MD_TF_NAME);
        this.txName.setMaxLength(70);
        this.txName.setFontColor(cc.color(165, 88, 46, 255));
        this._bg.addChild(this.txName);

        this.txAddress = this.createExitBox(this.getControl("bgAdd", this._bg), LocalizedString.to("MD_ADDRESS"), MD_TF_ADDRESS);
        this.txAddress.setMaxLength(70);
        this.txAddress.setFontColor(cc.color(165, 88, 46, 255));
        this._bg.addChild(this.txAddress);

        this.txCmnd = this.createExitBox(this.getControl("bgCmnd", this._bg), LocalizedString.to("MD_CMND"), MD_TF_CMND);
        this.txCmnd.setMaxLength(70);
        this.txCmnd.setFontColor(cc.color(165, 88, 46, 255));
        this._bg.addChild(this.txCmnd);

        this.txSdt = this.createExitBox(this.getControl("bgSdt", this._bg), LocalizedString.to("MD_PHONE"), MD_TF_PHONE);
        if (cc.sys.isNative){
            this.txSdt.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        }
        this.txSdt.setMaxLength(70);
        this.txSdt.setFontColor(cc.color(165, 88, 46, 255));
        this._bg.addChild(this.txSdt);

        this.txEmail = this.createExitBox(this.getControl("bgEmail", this._bg), LocalizedString.to("MD_EMAIL"), MD_TF_EMAIL);
        this.txEmail.setMaxLength(70);
        this.txEmail.setFontColor(cc.color(165, 88, 46, 255));
        this._bg.addChild(this.txEmail);

        this.ignoreAllButtonSound();

        this.enableFog();
        this.setBackEnable(true);
    },

    createExitBox: function (bg, name, tag) {
        var edb = new cc.EditBox(cc.size(bg.getContentSize().width, 30), new cc.Scale9Sprite());
        edb.setFont("fonts/tahoma.ttf", 18);
        edb.setPlaceHolder(name);
        //edb.setPlaceholderFontName("fonts/tahoma.ttf");
        // edb._placeholderLabel.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        edb.setPlaceholderFontSize(20);
        edb.setPlaceholderFontColor(cc.color(165, 88, 46, 255));
        edb.setPosition(bg.getPosition());
        if (!cc.sys.isNative) {
            edb.setPositionY(edb.getPositionY() - 5);
        }
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
        } else {
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
        } else {
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
            case MD_TF_NAME: {
                this.checkTextInput(str, 3, LocalizedString.to("MD_INPUT_NAME"));
                break;
            }
            case MD_TF_ADDRESS: {
                this.checkTextInput(str, 3, LocalizedString.to("MD_INPUT_ADDRESS"));
                break;
            }
            case MD_TF_PHONE: {
                this.checkTextInput(str, 9, LocalizedString.to("MD_INPUT_PHONE"));
                break;
            }
            case MD_TF_CMND: {
                this.checkTextInput(str, 9, LocalizedString.to("MD_INPUT_CMND"));
                break;
            }
            case MD_TF_EMAIL: {
                this.validateEmail(str, LocalizedString.to("MD_INPUT_EMAIL"));
                break;
            }
        }

        this.autoCheckRegisterEnable();
    },

    onEnterFinish: function () {
        cc.log("defuck");
        this.setShowHideAnimate(this._bg, true);

        this.txName.setString("");
        this.txAddress.setString("");
        this.txCmnd.setString("");
        this.txSdt.setString("");
        this.txEmail.setString("");

        if (!cc.sys.isNative){
            this.txName.setTouchEnabled(true);
            this.txAddress.setTouchEnabled(true);
            this.txCmnd.setTouchEnabled(true);
            this.txSdt.setTouchEnabled(true);
            this.txEmail.setTouchEnabled(true);
        }

        this.enableRegisterButton(false);
    },

    updateInfor: function (gIds) {

        var str = "";
        for (var i = 0; i < gIds.length; i++) {
            str += midAutumn.getItemName(gIds[i]);
            if (i < gIds.length - 1) {
                str += ",";
            }
        }
        this.giftName.setString(str);
        this.giftIds = gIds;
    },

    onCompleteRegister: function () {
        if (midAutumn.isWaitResponseRegister)
            return;

        this.autoCheckRegisterEnable();

        var name = this.txName.getString().trim();
        var address = this.txAddress.getString().trim();
        var cmnd = this.txCmnd.getString().trim();
        var sdt = this.txSdt.getString().trim();
        var email = this.txEmail.getString().trim();

        if (!this.checkTextInput(name, 3, LocalizedString.to("MD_INPUT_NAME"))) {
            return;
        } else if (!this.checkTextInput(address, 3, LocalizedString.to("MD_INPUT_ADDRESS"))) {
            return;
        } else if (!this.checkTextInput(cmnd, 9, LocalizedString.to("MD_INPUT_CMND"))) {
            return;
        } else if (!this.checkTextInput(sdt, 9, LocalizedString.to("MD_INPUT_PHONE"))) {
            return;
        } else if (!this.validateEmail(email, LocalizedString.to("MD_INPUT_EMAIL"))) {
            return;
        } else {
            var cmd = new CmdSendMidAutumnChangeAward();
            cmd.putData(false, this.giftIds, name, address, cmnd, sdt, email);
            GameClient.getInstance().sendPacket(cmd);
            midAutumn.isWaitResponseRegister = true;
        }
    },

    onButtonRelease: function (btn, id) {
        if (id == MD_SCENE_BTN_FANPAGE) {
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
        }
        else if (id == MD_SCENE_BTN_OK) {
            MidAutumnSound.playSoundSingle();

            if (this.btnRegister.enable)
                this.onCompleteRegister();
        } else {
            MidAutumnSound.playBubbleSingle();

            this.onBack();
        }
    },

    onBack: function () {
        this.txName.setString("");
        this.txAddress.setString("");
        this.txCmnd.setString("");
        this.txSdt.setString("");
        this.txEmail.setString("");
        this.onClose();
    }
});

var MidAutumnAccumulateGUI = BaseLayer.extend({

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

        this._super(MD_ACCUMULATE_GUI_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnAccumulateGUI.json");
    },

    initGUI: function () {
        var pEffect = this.getControl("effect");

        this.bgCoin = this.getControl("bgCoin", pEffect);
        this.text1 = this.getControl("text_1", pEffect);
        this.text1.pos = this.text1.getPosition();
        //this.text2 = this.getControl("text_2",pEffect);
        //this.text2.pos = this.text2.getPosition();

        this.coin = this.getControl("coin");
        this.coin.posStart = this.coin.getPosition();

        this.progress = this.getControl("progress");
        this.progress.setPositionY(this.progress.getPositionY() + 80);
        this.progress.defaultPos = this.progress.getPosition();

        this.coin.posDes = SceneMgr.convertPosToParent(this._layout, this.getControl("ico", this.progress));

        this.bar = this.getControl("bar", this.progress);
        this.num = this.getControl("num", this.progress);
        this.exp = this.getControl("exp", this.progress);
        this.bonus = this.getControl("bonus", this.progress);
        this.bonus.defaultPos = this.bonus.getPosition();

        this.pEffectBubble = this.getControl("effect_bubble");
        this.startPos = this.getControl("start", this.pEffectBubble).getPosition();
        this.midPos = this.getControl("mid", this.pEffectBubble).getPosition();
        this.endPos = this.getControl("end", this.pEffectBubble).getPosition();

        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.result = null;

        this.bgCoin.setVisible(false);
        this.bgCoin.setOpacity(255);
        this.text1.setVisible(false);
        //this.text2.setVisible(false);
        this.coin.setVisible(false);
        this.coin.setPosition(this.coin.posStart);
        this.coin.setScale(this._scale);
        this.coin.posDes = SceneMgr.convertPosToParent(this._layout, this.getControl("ico", this.progress));
        this.progress.setPositionX(this.progress.defaultPos.x + this.progress.getContentSize().width);

        this.bonus.setVisible(false);
        this.bonus.setString("");
        this.bonus.setPosition(this.bonus.defaultPos);
        this.exp.setString(midAutumn.curLevelExp + "/" + midAutumn.nextLevelExp);

        this.schedule(this.update, MD_ACCUMULATE_TIME_DELTA);
    },

    hideLight: function () {
        this.pEffectBubble.removeAllChildren();
        this.pEffectBubble.setPositionY(this.progress.getPositionY());
    },

    effectLight: function () {
        try {
            for (var i = 0; i < parseInt(Math.random() * 100) % 10 + 10; i++) {
                var sp2 = cc.Sprite.create("res/EventMgr/MidAutumn/MidAutumnUI/bubble.png");
                sp2.setVisible(false);
                sp2.setLocalZOrder(MD_MAP_ITEM_ZODER + 9);
                sp2.setPosition(this.startPos);

                var timeBubble = 1 + Math.random();
                var nScale = 0.5;
                sp2.setScale(nScale);

                var endPos = cc.p(
                    this.endPos.x + Math.random() * 500,
                    this.endPos.y + Math.random() * 500
                );
                var actMove = cc.BezierTo.create(timeBubble, [this.startPos, this.midPos, endPos]);
                var actEffect = cc.sequence(cc.scaleTo(timeBubble / 5, nScale - 0.05), cc.scaleTo(timeBubble / 5, nScale + 0.05),
                    cc.scaleTo(timeBubble / 5, nScale - 0.15), cc.scaleTo(timeBubble / 5, nScale - 0.15),
                    cc.scaleTo(timeBubble / 3, 0));
                sp2.runAction(cc.sequence(cc.delayTime(Math.random()), cc.show(), cc.spawn(actMove, actEffect), cc.removeSelf()));
                this.pEffectBubble.addChild(sp2);
            }
        } catch (e) {
            cc.log(e);
        }
    },

    showAccumulate: function (cmd) {
        //midAutumn.curLevelExp = 8000;
        //midAutumn.nextLevelExp = 10000;
        //midAutumn.keyCoin = 1;
        //
        //cmd = {};
        //cmd.keyCoinAdd = 20;
        //cmd.keyCoin = 20;
        //cmd.keyCoinAward = 2;
        //
        //cmd.additionExp = 13500;
        //cmd.currentLevelExp = 13500;
        //cmd.nextLevelExp = 20000;

        this.result = cmd;

        this.isKeyCoinChange = (cmd.keyCoin > midAutumn.keyCoin);

        this.curExpTmp = midAutumn.curLevelExp;
        this.nextExpTmp = midAutumn.nextLevelExp;

        var perExp = midAutumn.getExpPercent();
        this.bar.setPercent(perExp);
        this.num.setString(midAutumn.keyCoin);
        this.exp.setString(midAutumn.getExpString());

        this.hideLight();
        //  this.effectLight();

        MidAutumnSound.playBubbleSequence1();

        this.progress.runAction(cc.sequence(new cc.EaseExponentialOut(cc.moveTo(MD_ACCUMULATE_TIME_MOVE, cc.p(cc.winSize.width,this.progress.defaultPos.y))), cc.callFunc(this.endMoving.bind(this))));

        // effect coin
        if (this.result.keyCoinAward > 0) {
            this.bgCoin.setVisible(true);
            this.bgCoin.runAction(cc.repeatForever(cc.rotateBy(0.1, 10)));
            this.bgCoin.runAction(cc.sequence(cc.delayTime(1.5), cc.fadeOut(0.5)));

            this.text1.setVisible(true);
            this.text1.setOpacity(0);
            //this.text2.setVisible(true);
            //this.text2.setOpacity(0);
            this.text1.setPositionY(this.text1.pos.y - 100);
            //this.text2.setPositionY(this.text2.pos.y - 100);
            var moveUp1 = cc.spawn(new cc.EaseBackOut(cc.moveTo(0.5, this.text1.pos)), cc.fadeIn(0.5));
            //var moveUp2 = cc.spawn(cc.EaseBackOut(cc.moveTo(0.5,this.text2.pos)),cc.fadeIn(0.5));
            var upHide1 = cc.spawn(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.text1.pos.x, this.text1.pos.y + 100))), cc.fadeOut(0.5));
            //var upHide2 = cc.spawn(cc.EaseBackIn(cc.moveTo(0.5,cc.p(this.text2.pos.x,this.text2.pos.y + 100))),cc.fadeOut(0.5));
            this.text1.runAction(cc.sequence(moveUp1, cc.delayTime(1), upHide1));
            //this.text2.runAction(cc.sequence(cc.delayTime(0.1),moveUp2,cc.delayTime(1),upHide2));

            var bezier = [this.coin.posStart, cc.p(this.coin.posStart.x, this.coin.posDes.y), this.coin.posDes];
            var spawn1 = cc.spawn(new cc.EaseSineOut(cc.moveTo(0.5, this.coin.posDes)), cc.scaleTo(0.5, 0.3)); //cc.BezierTo.create(0.5, bezier)
            var showZoom = cc.spawn(new cc.EaseBackOut(cc.scaleTo(0.5, this._scale)), cc.fadeIn(0.5));
            this.coin.setVisible(true);
            this.coin.setOpacity(0);
            this.coin.setScale(0);
            this.coin.runAction(cc.sequence(showZoom, cc.delayTime(1), spawn1, cc.delayTime(0.1),
                cc.scaleTo(0.1, 0.7), cc.scaleTo(0.1, 0.25), cc.scaleTo(0.1, 0.45),
                cc.hide(), cc.callFunc(this.endCoin.bind(this))));
        }
    },

    endMoving: function () {

        // bonus
        this.bonus.setVisible(true);
        this.bonus.setString("+" + StringUtility.pointNumber(this.result.additionExp));
        this.bonus.runAction(cc.sequence(cc.scaleTo(0.15, 1.25), cc.scaleTo(0.15, 0.8), cc.scaleTo(0.15, 1)));

        // effect bar progress
        this.perLoad = [];
        this.deltaLoad = [];

        if (midAutumn.nextLevelExp > 1) {
            if (midAutumn.curLevelExp + this.result.additionExp >= midAutumn.nextLevelExp) {
                this.deltaLoad.push(midAutumn.nextLevelExp - midAutumn.curLevelExp);
                this.deltaLoad.push(this.result.additionExp - midAutumn.nextLevelExp + midAutumn.curLevelExp);

                this.perLoad.push(this.getPerLoad(midAutumn.nextLevelExp - midAutumn.curLevelExp, midAutumn.nextLevelExp));
                this.perLoad.push(this.getPerLoad(this.result.additionExp - midAutumn.nextLevelExp + midAutumn.curLevelExp, this.result.nextLevelExp));
            } else {
                this.deltaLoad.push(this.result.additionExp);
                this.perLoad.push(this.getPerLoad(this.result.additionExp, this.result.nextLevelExp));
            }
        } else {
            var oldExp = 0;
            this.exp.setString(StringUtility.pointNumber(oldExp) + "/" + StringUtility.pointNumber(this.result.nextLevelExp));
            this.bar.setPercent(parseFloat(oldExp * 100 / this.result.nextLevelExp));

            this.deltaLoad.push(this.result.currentLevelExp);
            this.perLoad.push(this.getPerLoad(this.result.currentLevelExp, this.result.nextLevelExp));
        }

        // start loading
        this.curLoad = 0;
        this.timeLoad = MD_ACCUMULATE_TIME_PROGRESS / this.perLoad.length;
        for (var i = 0; i < this.perLoad.length; i++) {
            this.perLoad[i] = MD_ACCUMULATE_TIME_DELTA * this.perLoad[i] / this.timeLoad;
            this.deltaLoad[i] = MD_ACCUMULATE_TIME_DELTA * this.deltaLoad[i] / this.timeLoad;
        }

        // update eggBreaker info
        midAutumn.curLevelExp = this.result.currentLevelExp;
        midAutumn.nextLevelExp = this.result.nextLevelExp;
        midAutumn.keyCoin = this.result.keyCoin;
    },

    endCoin: function () {
        if (this.isKeyCoinChange) {
            this.num.runAction(cc.sequence(cc.scaleTo(0.15, 1.25), cc.callFunc(function () {
                this.num.setString(midAutumn.keyCoin);

                if(this.isKeyCoinChange)
                    MidAutumnSound.playSoundSingle();
            }.bind(this)), cc.scaleTo(0.15, 0.8), cc.scaleTo(0.15, 1)));
        } else {
            this.num.setString(midAutumn.keyCoin);
        }
    },

    onFinishLoad: function () {
        if (this.curLoad >= this.perLoad.length) {
            this.bgCoin.setVisible(false);
            var perExp = midAutumn.getExpPercent();
            perExp = (perExp < 5) ? 5 : perExp;
            this.bar.setPercent(perExp);
            this.exp.setString(midAutumn.getExpString());
            this.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.onCloseGUI.bind(this))));

            if (this.result.keyCoinAward <= 0) {
                this.endCoin();
            }
        }
    },

    onCloseGUI: function () {
        var moveTo = cc.moveTo(MD_ACCUMULATE_TIME_MOVE, cc.p(this.progress.defaultPos.x + this.progress.getContentSize().width, this.progress.defaultPos.y));
        this.progress.runAction(cc.sequence(new cc.EaseExponentialOut(moveTo), cc.callFunc(this.onClose.bind(this))));
    },

    onClose: function () {
        if (midAutumn.btnInGame) {
            try {
                midAutumn.btnInGame.runAction(cc.fadeIn(0.5));
            }
            catch (e) {

            }
        }
        this._super();
    },

    getPerLoad: function (a, b) {
        return (a * 100 / b);
    },

    update: function (dt) {
        if (this.curLoad < this.perLoad.length) {
            this.bar.setPercent(this.bar.getPercent() + this.perLoad[this.curLoad]);

            this.curExpTmp += this.deltaLoad[this.curLoad];
            this.exp.setString(StringUtility.pointNumber(this.curExpTmp) + "/" + StringUtility.pointNumber(this.nextExpTmp));

            this.timeLoad -= MD_ACCUMULATE_TIME_DELTA;
            if (this.timeLoad <= 0) {
                this.curExpTmp = 0;
                if (this.result)
                    this.nextExpTmp = this.result.nextLevelExp;

                this.bar.setPercent(0);
                this.curLoad += 1;
                this.timeLoad = MD_ACCUMULATE_TIME_PROGRESS / this.perLoad.length;

                this.onFinishLoad();
            }
        }
    },
});

var MidAutumnHelpGUI = BaseLayer.extend({

    ctor: function () {

        this._currentPage = null;
        this._pageHelp = null;

        this._arrPage = null;
        this._pageInfo = null;

        this.curPage = -1;

        this._super(MD_HELP_GUI_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnHelpGUI.json");
    },

    initGUI: function () {

        var bg = this.getControl("bg");
        this._bg = bg;

        var btnClose = this.customButton("btnClose", MD_HELP_NUM_PAGE + 1, bg);
        1000010
        this._pageHelp = this.getControl("pageHelp", bg);
        var page = this._pageHelp.getPage(0);
        for (var i = 0; i < 6; i++) {
            var text = page.getChildByName("gift_" + i);
            text.setString(midAutumn.giftNames["" + (1000000 + (6-i) * 10)]);
        }
        // var game = LocalizedString.config("GAME");
        // if (game.indexOf("sam") >= 0 || game.indexOf("binh") >= 0) {
        //    // page.setBackGroundImage("res/EventMgr/PotBreaker/PotBreakerUI/help1_1.png");
        // }

        this._arrPage = [];
        for (var i = 0; i < MD_HELP_NUM_PAGE; i++) {
            this._arrPage[i] = this.customButton("btnPage" + i, i, bg);
            this._arrPage[i].setPressedActionEnabled(false);
        }

        this._currentPage = this.getControl("imgCurPage", bg);
        this._pageHelp.addEventListener(this.onPageListener.bind(this), this);
        this._pageHelp.setCustomScrollThreshold(0.3);

        this.ignoreAllButtonSound();

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
        } else {
            this._currentPage.setPosition(this._arrPage[this.curPage].getPosition());

            this.curPage = this._pageHelp.getCurPageIndex();
            var newPos = this._arrPage[this._pageHelp.getCurPageIndex()].getPosition();
            this._currentPage.runAction(cc.moveTo(0.1, newPos));
        }
    },

    onButtonRelease: function (button, id) {
        MidAutumnSound.playBubbleSingle();

        if (id >= 0 && id < MD_HELP_NUM_PAGE) {
            this._pageHelp.scrollToPage(id);
        } else {
            this.onBack();
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var MidAutumnHistoryGUI = BaseLayer.extend({

    ctor: function () {
        this.arTabRequest = [];

        this._super(MD_HISTORY_GUI_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnHistoryGUI.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");

        this.tabHistory = this.customButton("tabHistory", MD_SCENE_TAB_HISTORY, bg, false);
        this.tabHistory.ySelect = this.tabHistory.getPositionY() - 2;
        this.tabHistory.yNormal = this.tabHistory.getPositionY();
        this.tabHistory.lbTitle = this.getControl("lbTitle", this.tabHistory);
        this.tabGift = this.customButton("tabGift", MD_SCENE_TAB_GIFT, bg, false);
        this.tabGift.ySelect = this.tabGift.getPositionY() - 2;
        this.tabGift.yNormal = this.tabGift.getPositionY();
        this.tabGift.lbTitle = this.getControl("lbTitle", this.tabGift);
        this.tabInfo = this.customButton("tabInformation", MD_SCENE_TAB_INFORMATION, bg, false);
        this.tabInfo.ySelect = this.tabInfo.getPositionY() - 2;
        this.tabInfo.yNormal = this.tabInfo.getPositionY();
        this.tabInfo.lbTitle = this.getControl("lbTitle", this.tabInfo);
        this.tabChange = this.customButton("tabChange", MD_SCENE_TAB_CHANGE, bg, false);
        this.tabChange.ySelect = this.tabChange.getPositionY() - 2;
        this.tabChange.yNormal = this.tabChange.getPositionY();
        this.tabChange.lbTitle = this.getControl("lbTitle", this.tabChange);

        this.customButton("close", MD_SCENE_BTN_CLOSE, bg);

        this.pHistory = this.getControl("pHistory", bg);
        this.listHistory = new cc.TableView(this, this.pHistory.getContentSize());
        this.listHistory.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listHistory.setVerticalFillOrder(1);
        this.listHistory.setDelegate(this);
        this.pHistory.addChild(this.listHistory);
        this.pHistory.notice = this.getControl("notice", this.pHistory);
        this.listHistory.reloadData();

        this.pInfo = this.getControl("pInfo", bg);
        this.pInfo.notice = this.getControl("pInfoEmpty", bg);
        this.pInfo.fullname = this.getControl("name", this.pInfo);
        this.pInfo.address = this.getControl("add", this.pInfo);
        this.pInfo.cmnd = this.getControl("cmnd", this.pInfo);
        this.pInfo.phone = this.getControl("sdt", this.pInfo);
        this.pInfo.email = this.getControl("email", this.pInfo);
        this.btnFanpage = this.customButton("btnFanpage", MD_SCENE_BTN_FANPAGE, this.pInfo);

        this.pGift = this.getControl("pGift", bg);
        this.pGift.notice = this.getControl("pGiftEmpty", this.pGift);
        var panelGift = new MidAutumnPanelGift(this.pGift);
        this.pGift.panel = panelGift;
        this.pGift.addChild(panelGift);

        this.pChangePiece = this.getControl("pChangePiece", bg);
        var panelChange = new MidAutumnPanelChangePiece();
        this.pChangePiece.panel = panelChange;
        this.pChangePiece.addChild(panelChange);

        this.ignoreAllButtonSound();

        this.enableFog(true);
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.arTabRequest[MD_SCENE_TAB_GIFT] = false;
        this.arTabRequest[MD_SCENE_TAB_INFORMATION] = false;
        this.arTabRequest[MD_SCENE_TAB_HISTORY] = false;
        this.arTabRequest[MD_SCENE_TAB_CHANGE] = false;
        this.arTabRequest[MD_SCENE_TAB_LAMP] = false;
        this.onButtonRelease(null, MD_SCENE_TAB_HISTORY);

        if (!cc.sys.isNative){
            this.listHistory.setTouchEnabled(true);
        }
    },

    onButtonRelease: function (button, id) {
        MidAutumnSound.playBubbleSingle();
        if (id == MD_SCENE_BTN_FANPAGE) {
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

        if (id == MD_SCENE_BTN_CLOSE) {
            this.onClose();
            return;
        }

        // visible tab
        this.curTab = id;

        this.pHistory.setVisible(id == MD_SCENE_TAB_HISTORY);
        this.pInfo.setVisible(id == MD_SCENE_TAB_INFORMATION && midAutumn.isRegisterSuccess);
        this.pInfo.notice.setVisible(id == MD_SCENE_TAB_INFORMATION && !midAutumn.isRegisterSuccess);
        this.pGift.setVisible(id == MD_SCENE_TAB_GIFT);
        this.pChangePiece.setVisible(id == MD_SCENE_TAB_CHANGE);

        // change tab
        var tHisNormal = "res/EventMgr/MidAutumn/MidAutumnUI/tabSelect.png";
        var tHisSelect = "res/EventMgr/MidAutumn/MidAutumnUI/tab.png";
        var cHis = (id == MD_SCENE_TAB_HISTORY);
        this.tabHistory.loadTextures(!cHis ? tHisSelect : tHisNormal, cHis ? tHisSelect : tHisNormal, "");
        this.tabHistory.setPositionY(cHis ? this.tabHistory.ySelect : this.tabHistory.yNormal);
        this.tabHistory.lbTitle.setColor(cHis ? cc.color(35, 106, 42, 255) :  cc.color(159, 234, 105, 255));

        var cGift = (id == MD_SCENE_TAB_GIFT);
        this.tabGift.loadTextures(!cGift ? tHisSelect : tHisNormal, cGift ? tHisSelect : tHisNormal, "");
        this.tabGift.setPositionY(cGift ? this.tabGift.ySelect : this.tabGift.yNormal);
        this.tabGift.lbTitle.setColor(cGift ? cc.color(35, 106, 42, 255) :  cc.color(159, 234, 105, 255));

        var cInf = (id == MD_SCENE_TAB_INFORMATION);
        this.tabInfo.loadTextures(!cInf ? tHisSelect : tHisNormal, cInf ? tHisSelect : tHisNormal, "");
        this.tabInfo.setPositionY(cInf ? this.tabInfo.ySelect : this.tabInfo.yNormal);
        this.tabInfo.lbTitle.setColor(cInf ? cc.color(35, 106, 42, 255) :  cc.color(159, 234, 105, 255));

        var cChange = (id == MD_SCENE_TAB_CHANGE);
        this.tabChange.loadTextures(!cChange ? tHisSelect : tHisNormal, cChange ? tHisSelect : tHisNormal, "");
        this.tabChange.setPositionY(cChange ? this.tabChange.ySelect : this.tabChange.yNormal);
        this.tabChange.lbTitle.setColor(cChange ? cc.color(35, 106, 42, 255) :  cc.color(159, 234, 105, 255));

        if (this.arTabRequest[id]) return;
        switch (id) {
            case MD_SCENE_TAB_GIFT : {
                var cmd12 = new CmdSendMidAutumnGetGiftHistory();
                GameClient.getInstance().sendPacket(cmd12);
                break;
            }
            case MD_SCENE_TAB_HISTORY: {
                var cmd1 = new CmdSendMidAutumnGetRollHistory();
                GameClient.getInstance().sendPacket(cmd1);
                break;
            }
            case MD_SCENE_TAB_INFORMATION : {
                var cmd = new CmdSendMidAutumnGetRegisterInfo();
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case MD_SCENE_TAB_LAMP : {
                midAutumn.sendGetLampInfo();
                break;
            }
        }
    },


    updateRollHistory: function () {
        this.arTabRequest[MD_SCENE_TAB_HISTORY] = true;

        this.pHistory.notice.setVisible(midAutumn.arRollHistory.length <= 0);
        this.listHistory.reloadData();
    },

    updateGiftHistory: function () {
        this.arTabRequest[MD_SCENE_TAB_GIFT] = true;

        this.pGift.notice.setVisible(midAutumn.arGiftHistory.length <= 0);
        this.pGift.panel.setVisible(midAutumn.arGiftHistory.length > 0);
        this.pGift.panel.updateData();
    },

    updateInformation: function () {
        this.arTabRequest[MD_SCENE_TAB_INFORMATION] = true;

        this.pInfo.setVisible(midAutumn.isRegisterSuccess && this.curTab == MD_SCENE_TAB_INFORMATION);
        this.pInfo.notice.setVisible(!midAutumn.isRegisterSuccess && this.curTab == MD_SCENE_TAB_INFORMATION);

        if (midAutumn.isRegisterSuccess) {
            this.btnFanpage.setVisible(midAutumn.getTotalPriceGift() >= 500000);
            this.pInfo.fullname.setString(midAutumn.infoHistory.name);
            this.pInfo.phone.setString(midAutumn.infoHistory.phone);
            this.pInfo.cmnd.setString(midAutumn.infoHistory.cmnd);
            this.pInfo.address.setString(midAutumn.infoHistory.address);
            this.pInfo.email.setString(midAutumn.infoHistory.email);
        }
    },

    tableCellSizeForIndex: function (table, idx) {
        var obj = midAutumn.arRollHistory[idx];
        if (obj && obj.pieces) {
            var n = Object.keys(obj.pieces).length;
            n = (n % MD_PIECE_MAX_ROW == 0) ? (n / MD_PIECE_MAX_ROW) : parseInt(n / MD_PIECE_MAX_ROW) + 1;
            return cc.size(760, (n==0 ? 1 : n) * MD_PIECE_IMAGE_SIZE * 1.05 + 30);
        }
        return cc.size(760, MD_PIECE_IMAGE_SIZE * 1.05);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new MidAutumnPiecesHistoryCell();
        }
        cell.updateInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return midAutumn.arRollHistory.length;
    },

    onBack: function () {
        this.onClose();
    }
});

var MidAutumnPanelGift = BaseLayer.extend({

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
        return cc.size(300, 360);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new MidAutumnGiftHistoryCell();
        }
        cell.updateInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return midAutumn.arGiftHistory.length;
    },
});


// popup
var MidAutumnPieceConvertGUI = BaseLayer.extend({

    ctor: function () {
        this._super(MD_CHANGE_LAMP_GUI_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnPieceConvertGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");
        this.customButton("close", MD_SCENE_BTN_CLOSE, this._bg);

        this.pGold = this._bg.getChildByName("gold");
        this.money = new MidAutumnMoney();
        this.pGold.addChild(this.money);

        this.ignoreAllButtonSound();

        this.enableFog();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
    },

    showPieces: function (total) {
        this.money.setNumber(total);
    },

    onButtonRelease: function (btn, id) {
        MidAutumnSound.playBubbleSingle();
        this.onClose();
    },
});
MidAutumnPieceConvertGUI.BTN_OK = 0;
MidAutumnPieceConvertGUI.BTN_CANCEL = 1;


var MidAutumnEventNotifyGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(MD_NOTIFY_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnEventNotifyGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", MD_GUI_BTN_CLOSE, this._bg);
        this.btnJoin = this.customButton("join", MD_GUI_NOTIFY_BTN_JOIN, this._bg);
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
        midAutumn.saveCurrentDay();
        this.lbTime.setString(midAutumn.eventDayFrom + "-" + midAutumn.eventDayTo);
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        MidAutumnSound.playBubbleSingle();
        this.onBack();
        if (id == MD_GUI_NOTIFY_BTN_JOIN) {
            midAutumn.openEvent();
        }
        else {
            midAutumn.showHammerEmpty(MD_HAMMER_NOTIFY_EMPTY);
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var MidAutumnNapGNotifyGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(MD_NOTIFY_PROMOTE_G_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnNapGNotifyGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", MD_SCENE_BTN_CLOSE, this._bg);
        this.customButton("nap_g", MD_SCENE_BTN_CLOSE + 1, this._bg);

        this.lbTime = this.getControl("time", this._bg);
        this.lb = this.getControl("lb", this._bg);

        this.ignoreAllButtonSound();

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        midAutumn.saveCurrentDayNapG();
        this.setShowHideAnimate(this._bg, true);

        this.lbTime.setString(midAutumn.eventWeeks[midAutumn.eventTime - 1]);

        this.lbTime.setVisible(false);
        this.lb.setVisible(false);
    },

    onButtonRelease: function (btn, id) {
        MidAutumnSound.playBubbleSingle();

        this.onBack();

        if (id != MD_SCENE_BTN_CLOSE) {
            gamedata.openNapGInTab(midAutumn.idTabEventShop,MD_SCENE_CLASS);
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var MidAutumnBonusGNotifyPanel = BaseLayer.extend({

    ctor : function () {
        this._super();
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MDNotifyEventGBonus.json");
    },

    initGUI : function () {
        this.bg = this.customButton("bg",1,this._layout,false);

        this.ignoreAllButtonSound();
    },

    onButtonRelease : function (btn,id) {
        MidAutumnSound.playBubbleSingle();

        gamedata.openNapGInTab(midAutumn.idTabEventShop,LobbyScene.className,true);
    },

    onEnterFinish : function () {
        midAutumn.saveNotifyBonusGPanel();

        this.setPositionX(cc.winSize.width/2);
        this.setPositionY(cc.winSize.height + this.bg.getContentSize().height);

        this.runAction(cc.sequence(cc.delayTime(1),
            new cc.EaseBackOut(cc.moveTo(0.5,cc.p(this.getPositionX(),cc.winSize.height))),
            cc.delayTime(3),
            new cc.EaseBackIn(cc.moveTo(0.5,cc.p(this.getPositionX(),cc.winSize.height + this.bg.getContentSize().height))),
            cc.removeSelf()
        ));
    },
});

var MidAutumnBonusTicketDialog = BaseLayer.extend({

    ctor: function () {
        this._super(MD_NOTIFY_BONUS_TICKET_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnNotifyBonusTicketGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.customButton("close", MD_SCENE_BTN_CLOSE, this.bg);
        this.customButton("shop", MD_SCENE_BTN_SHOP, this.pRoll);

        this.ignoreAllButtonSound();

        this.enableFog();
        this.setBackEnable();
    },

    onEnterFinish: function () {
        this.waitAction = -1;
        this.setShowHideAnimate(this.bg,true);

        midAutumn.saveNotifyBonusTicketCurrentDay();
    },

    onButtonRelease: function (btn, id) {
        MidAutumnSound.playBubbleSingle();

        this.waitAction = id;

        this.onClose();
    },

    onCloseDone: function () {
        this.removeFromParent();

        if(this.waitAction == MD_SCENE_BTN_SHOP) this.onCloseShop();
    },

    onCloseShop: function () {
        gamedata.openNapG(MD_SCENE_CLASS);
    }
});

var MidAutumnHammerEmptyDialog = BaseLayer.extend({

    ctor: function () {
        this.waitAction = -1;
        this.typeGUI = -1;

        this._super(MD_HAMMER_EMPTY_CLASS);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnHammerEmptyDialog.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.customButton("btnClose", MD_SCENE_BTN_CLOSE, this.bg);

        this.pRoll = this.getControl("pRoll",this.bg);
        this.customButton("btnShop", MD_SCENE_BTN_SHOP, this.pRoll);
        this.customButton("btnPlay", MD_SCENE_BTN_PLAY, this.pRoll);

        this.pNotify = this.getControl("pNotify",this.bg);
        this.customButton("btnShop", MD_SCENE_BTN_SHOP, this.pNotify);

        this.pTicket = this.getControl("pTicket",this.bg);
        this.customButton("btnShop", MD_SCENE_BTN_OPEN_EVENT, this.pTicket);
        this.lbTicket = this.getControl("lbTicket", this.pTicket);

        this.ignoreAllButtonSound();

        this.enableFog();
        this.setBackEnable();
    },

    onEnterFinish: function () {
        this.waitAction = -1;
        this.setShowHideAnimate(this.bg,true);
    },

    setGUI : function (type, message) {
        this.pRoll.setVisible(type == MD_HAMMER_ROLL_EMPTY);
        this.pNotify.setVisible(type == MD_HAMMER_NOTIFY_EMPTY);
        this.pTicket.setVisible(type == MD_HAMMER_TICKET);
        if (type == MD_HAMMER_TICKET) {
            this.lbTicket.setString(message);
        }
    },

    onButtonRelease: function (btn, id) {
        this.waitAction = id;

        MidAutumnSound.playBubbleSingle();

        this.onClose();
    },

    onCloseDone: function () {
        this.removeFromParent();

        if(this.waitAction == MD_SCENE_BTN_SHOP) this.onCloseShop();
        if(this.waitAction == MD_SCENE_BTN_PLAY) this.onClosePlay();
        if(this.waitAction == MD_SCENE_BTN_OPEN_EVENT) {
            var clb = sceneMgr.getMainLayer();
            if (!(clb instanceof MidAutumnScene)) {
                event.openEvent();
            }
        }
    },

    onCloseShop: function () {
        //gamedata.openNapGInTab(midAutumn.idTabEventShop, MD_SCENE_CLASS);
        gamedata.openShop(MD_SCENE_CLASS, true);
        // gamedata.openShopTicket(MD_SCENE_CLASS,true);
    },

    onClosePlay: function () {
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
                            gamedata.openShop(MD_SCENE_CLASS, true);
                        }
                    });
                } else {
                    sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                }
            }
        }
    }
});


var MidAutumnPromoTicketGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(MidAutumnPromoTicketGUI.className);
        this.initWithBinaryFile("res/EventMgr/MidAutumn/MidAutumnPromoTicketGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", MD_GUI_BTN_CLOSE, this._bg);
        this.btnJoin = this.customButton("join", MD_GUI_NOTIFY_BTN_JOIN, this._bg);
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
            this.lbTime.setString(localized("MD_DAY") + " " + event.startPromoTicket + "-" + event.endPromoTicket);
        else
            this.lbTime.setString(localized("MD_DAY") + " " + event.startPromoTicket);
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        MidAutumnSound.playBubbleSingle();
        if (id == MD_GUI_NOTIFY_BTN_JOIN) {
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

MidAutumnPromoTicketGUI.className = "MidAutumnPromoTicketGUI";
MidAutumnPromoTicketGUI.TAG = 105;