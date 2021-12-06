
// GUI
var BlueOceanScene = BaseLayer.extend({

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

        this._super(BO_SCENE_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanScene.json");
    },

    initGUI: function () {
        var winSize = cc.director.getWinSize();
        this.bgScene = this.getControl("bg");
        this.panel = this.getControl("panel");

        var scaleX = cc.winSize.width / this.panel.getContentSize().width;
        var scaleY = cc.winSize.height / this.panel.getContentSize().height;
        if (scaleX > scaleY) {
            this.panel.setScale(scaleY);
        }
        else {
            this.panel.setScale(scaleX);
        }

        var sprite = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/bg.jpg");
        this.bgScene.addChild(sprite);
        var scale = cc.winSize.height / sprite.getContentSize().height;
        sprite.setScale(scale);

        var bgWater = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/bgWater.png");
        this.nodeWave = new cc.NodeGrid();
        sprite.addChild(this.nodeWave);
        bgWater.setAnchorPoint(0, 0);
        this.nodeWave.addChild(bgWater);
        this.nodeWave.runAction(cc.repeatForever(cc.waves(10, cc.size(15, 10), 5, 5, true, false)));

        this.bgWave = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/bgWave.png");
        this.bgWave.setScaleX(winSize.width/ this.bgWave.getContentSize().width);
        this.bgWave.setScaleY(winSize.height/ this.bgWave.getContentSize().height);
        this.bgWave.setVisible(false);
        this._layout.addChild(this.bgWave);

        this.nodeWaveBubble = new cc.NodeGrid();
        this.nodeWaveBubble.setCascadeColorEnabled(true);
        this.nodeWaveBubble.setCascadeOpacityEnabled(true);
        this.bgWave.setAnchorPoint(0, 0);
        // this.nodeWaveBubble.addChild(this.bgWave);

        this._layout.addChild(this.nodeWaveBubble);
        this.nodeWaveBubble.setVisible(false);
     //   bgWater.setPosition(sprite.getContentSize().width * 0.5, sprite.getContentSize().height * 0.5);
        //this.bgScene.pos = this.bgScene.getPosition();


        this.bgBoard = this.getControl("board");
        this.bgBoard.pos = this.bgBoard.getPosition();

        var pButton = this.getControl("pButton");
        var pLeftTop = this.getControl("pLeftTop");
        var pLeftBottom = this.getControl("pLeftBottom");
        var pRightBottom = this.getControl("pRightBottom");

        // effect
        this.panelLeftBottom = pLeftBottom;
        this.panelLeftBottom.posShow = pLeftBottom.getPosition();
        this.panelRightBottom = pRightBottom;
        this.panelRightBottom.posShow = pRightBottom.getPosition();
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
        this.mapComponent = new BlueOceanMap();
        this.bgBoard.addChild(this.mapComponent);

        // roll button
        this.btnRollOnce = this.customButton("roll1", BO_SCENE_BTN_ROLL_ONCE, pButton, false);
        this.btnRollOnce.cost = this.getControl("cost", this.btnRollOnce);

        this.btnRollTen = this.customButton("roll10", BO_SCENE_BTN_ROLL_TEN, pButton, false);
        this.btnRollTen.cost = this.getControl("cost", this.btnRollTen);

        this.costImage = this.getControl("costEffect");
        this.costImage.lb = this.getControl("lb", this.costImage);
        this.costImage.setVisible(false);

        // user info
        var bGold = this.customButton("gold", BO_SCENE_BTN_SHOP, this.panelLeftBottom);
        this.lbGold = this.getControl("lb", bGold);
        this.customButton("btnBuy",BO_SCENE_BTN_SHOP, bGold);
        var iconGold = this.getControl("Image_1", bGold);
        this.lbGold.posEffect = bGold.convertToWorldSpace(iconGold.getPosition());
        if (!cc.sys.isNative){
            this.lbGold.posEffect = this.panelLeftBottom.convertToWorldSpace(bGold.getPosition());
        }
        //this.lbGold.posEffect.x -= 55;

        this.bgHarmer = this.getControl("bgTicket", this.panelRightBottom);
        this.lbHammer = this.getControl("lbHarmer", this.bgHarmer);
        this.customButton("buyTicket",BO_SCENE_BTN_SHOP, this.bgHarmer);

        // popup item
        this.popupItem = this.getControl("pInfoItem");
        this.popupItem.lbInfo = this.getControl("lb", this.popupItem);
        this.popupItem.lbName = this.getControl("name", this.popupItem);
        this.btnChange = this.customButton("btnChange", BO_SCENE_BTN_CHANGE, this.popupItem);
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

        this.uiGiftFull = new BlueOceanCollectionsExpandGUI(this.pFullItem);
        this.uiGiftLite = new BlueOceanCollectionsCollapseGUI(this.pLiteItem);

        // event time
        var pTime = this.getControl("pTime");
        var txts = [];
        txts.push({"text": LocalizedString.to("BO_INFO_TIME_LEFT_0") + " ", "color": cc.color(255, 247, 211, 0), "size": 15});
        txts.push({"text": "", "font": SceneMgr.FONT_BOLD, "color": cc.color(194, 255, 73, 0), "size": 15});
        txts.push({"text": LocalizedString.to("BO_INFO_TIME_LEFT_1"), "color": cc.color(255, 247, 211, 0), "size": 15});
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
        this.customButton("btnNumRoll", BO_SCENE_CHEAT_NUM_ROLL, this.pCheat);
        this.customButton("cheat_item", BO_SCENE_CHEAT_ITEM, this.pCheat);
        this.txCoin = this.getControl("coin", this.pCheat);
        this.txExp = this.getControl("exp", this.pCheat);
        this.txtChest = this.getControl("txtChest", this.pCheat);
        this.customButton("cheat_coin", BO_SCENE_CHEAT_EXP_COIN, this.pCheat);
        this.customButton("cheat_coin_free", BO_SCENE_CHEAT_COIN_FREE, this.pCheat);
        this.txGServer = this.getControl("txGServer", this.pCheat);
        this.txGUser = this.getControl("txGUser", this.pCheat);
        this.lbGServer = this.getControl("g_server", this.pCheat);
        this.lbGUser = this.getControl("g_user", this.pCheat);
        this.lbLevel = this.getControl("level", this.pCheat);
        this.txtRock = this.getControl("txtRock", this.pCheat);
        this.txtMap = this.getControl("txtMap", this.pCheat);
        this.txtRowPos = this.getControl("txtRowPos", this.pCheat);
        this.txtColumnPos = this.getControl("txtColumnPos", this.pCheat);
        this.txtRowConvert = this.getControl("txtRowConvert", this.pCheat);
        this.txtColumnConvert = this.getControl("txtColumnConvert", this.pCheat);
        this.customButton("cheat_g_server", BO_SCENE_CHEAT_G_SERVER, this.pCheat);
        this.customButton("btnReset", BO_SCENE_CHEAT_RESET_SERVER, this.pCheat);
        this.customButton("btnFullTime", BO_SCENE_CHEAT_SHOW_FULLTIME, this.pCheat);
        this.customButton("btnRock", BO_SCENE_CHEAT_ROCK, this.pCheat);
        this.customButton("btnMap", BO_SCENE_CHEAT_MAP, this.pCheat);
        this.customButton("btnPos", BO_SCENE_CHEAT_POS, this.pCheat);
        this.customButton("btnConvert", BO_SCENE_CHEAT_CONVERT, this.pCheat);
        this.arBtnPie = [];
        for (var i = 1; i <= 4; i++) {
            this.arBtnPie.push(this.customButton("pie" + i, (BO_SCENE_CHEAT_PIE_1 + i - 1), this.pCheat));
        }
        this.selectCheatPie(BO_SCENE_CHEAT_PIE_1);

        if (Config.ENABLE_CHEAT) {
            this.iconDice = this.customButton("dice", BO_SCENE_BTN_CHEAT, this.pButtonRoll);
            this.iconDice.setPositionX(this.btnRollTen.getPositionX() + 100);
        }
        else {
            this.iconDice = this.getControl("dice", this.pButtonRoll);
            this.iconDice.setVisible(false);
        }

        // button scene
        this.customButton("close", BO_SCENE_BTN_CLOSE, pLeftTop);
        this.customButton("help", BO_SCENE_BTN_HELP, pLeftTop);
        this.customButton("news", BO_SCENE_BTN_NEWS, pLeftTop);
        this.customButton("history", BO_SCENE_BTN_HISTORY, this.pLiteItem);

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
    },

    initSizeBoard: function () {
        // var pButton = this.getControl("pButton");
        // var pLeftTop = this.getControl("pLeftTop");
        // var pLeftBottom = this.getControl("pLeftBottom");
        // var pRightBottom = this.getControl("pRightBottom");
        // var pGroupItem = this.getControl("pGroupItem");
        // var w = (cc.winSize.width - this.pLiteItem.getContentSize().width * this._scale);
        // var h = (cc.winSize.height - pLeftTop.getContentSize().height * this._scale - pButton.getContentSize().height * this._scale);
        // var scale;
        // if (cc.winSize.width / cc.winSize.height >= 479 / 800) {
        //     scale = 1;
        // }
        // else {
        //     scale = 0.95;
        // }
        // var pSizeReal = cc.size(
        //     w * scale,
        //     h * scale
        // );
        // var rate1 = pSizeReal.width / pSizeReal.height;
        // var rate2 = this.mapComponent.mapSize.width / this.mapComponent.mapSize.height;
        // if (rate1 > rate2) {
        //     // lay theo chieu cao
        //     var scale = pSizeReal.height / this.mapComponent.mapSize.height;
        //     this.bgBoard.setScale(scale);
        // }
        // else {
        //     // lay theo chieu rong
        //     var scale = pSizeReal.width / this.mapComponent.mapSize.width;
        //     this.bgBoard.setScale(scale);
        // }
        // this.bgBoard.setPosition(w * 0.5, pButton.getContentSize().height * this._scale + pSizeReal.height * 0.5);
        // this.pButtonRoll.setPositionX(w * 0.5);
        // this.pButtonRoll.posShow = this.pButtonRoll.getPosition();
        // this.pRollDice.setPositionX(w / 2);
        // pLeftTop.setPositionX((w - this.mapComponent.mapSize.width * this.bgBoard.getScale()) * 0.5);
        // pLeftBottom.setPositionX(pLeftTop.getPositionX());
        // pRightBottom.setPositionX((w + this.mapComponent.mapSize.width * this.bgBoard.getScale()) * 0.5);
        // pGroupItem.setPositionX(pRightBottom.getPositionX() + this.pLiteItem.getContentSize().width * this._scale * 1.1);
    },

    setIsWaitingRollResult: function (value) {
        this.isWaitingRollResult = value;
    },

    onUpdateGUI: function () {
        this.updateUserInfo();
    },

    onEnterFinish: function () {
        BlueOceanSound.playLobby();

      //  this.lbGold.posEffect = this.lbGold.getParent().convertToWorldSpace(this.lbGold.getPosition());
//        this.lbGold.posEffect.x = this.lbGold.posEffect.x - 45;
        // init scene
        blueOcean.blueOceanScene = this;

        // reset
        this.setIsWaitingRollResult(false);
        this.isWaitingEffectMove = false;
        this.lbHammer.setString("");

        // clean effect
        this.pRollDice.setVisible(false);

        // reset time effect random cell
        this.nTimeEffect = BO_CELL_EFFECT_COUNT_DOWN;

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

        //this.panelRightTop.setVisible(false);
        // this.panelLeftTop.setVisible(false);
        this.pLiteItem.setVisible(false);
        this.pFullItem.setVisible(false);

        this.enableRollButton(false);
        this.pButtonRoll.setVisible(true);

        // get event info
        var cmd = new CmdSendBlueOceanOpen();
        cmd.putData(1);
        GameClient.getInstance().sendPacket(cmd);


        // update scene
        this.scheduleUpdate();

        if (!cc.sys.isNative){
            this.uiGiftFull.uiGift.setTouchEnabled(true);
        }

    },

    onTouchBoard: function (touch) {
        if(touch.getLocation().x < cc.director.getWinSize().width*3/4) {
            if(this.currentItemList == 1) {
                this.doActionItemList(BO_SHOW_LIST_ITEM_MINI);
            }
        }
    },

    enableRollButton: function (enable,effect) {
        if(!blueOcean.isInEvent()) enable = false;

        effect = false;
        if(enable) {
            this.btnRollTen.setColor(cc.color(255, 255, 255));
            this.btnRollOnce.setColor(cc.color(255, 255, 255));
        }
        else {
            this.btnRollTen.setColor(cc.color(150, 150, 150));
            this.btnRollOnce.setColor(cc.color(150, 150, 150));
        }
        if(effect) {
            if(enable) {
                // this.pButtonRoll.setVisible(true);
                // this.pButtonRoll.setPositionY(-500);
                // this.pButtonRoll.runAction(new cc.EaseBackOut(cc.moveTo(0.25,this.pButtonRoll.posShow)));

            }
            else {
                // this.pButtonRoll.setVisible(true);
                // this.pButtonRoll.setPosition(this.pButtonRoll.posShow);
                // this.pButtonRoll.runAction(new cc.EaseBackOut(cc.moveTo(0.25,cc.p(this.pButtonRoll.posShow.x,-500))));

            }
        }
        else {
            // this.pButtonRoll.setVisible(enable);
        }

        this.btnRollOnce.cost.setString(StringUtility.pointNumber(
            blueOcean.getCostRoll(0)));
        this.btnRollTen.setVisible(true);

        this.btnRollTen.typeRoll = 1;
        var s = "";
        if (blueOcean.keyCoin < 50) {
            s = "res/Event/BlueOcean/BlueOceanUI/btnRoll20.png";
            this.btnRollTen.typeRoll = 1;
            this.btnRollTen.cost.setString(20);
        }
        else {
            s = "res/Event/BlueOcean/BlueOceanUI/btnRoll50.png";
            this.btnRollTen.typeRoll = 2;
            this.btnRollTen.cost.setString(50);
        }
        this.btnRollTen.loadTextures(s, s, s);
        // quay nhieu lan phan lam nhieu truong hop, nho nhat la type roll co id = 2

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
        // this.panelLeftTop.setVisible(true);
        // this.panelLeftTop.setPositionY(cc.winSize.height + 500);

        // this.panelLeftTop.runAction(new cc.EaseBackOut(cc.moveTo(0.25,this.panelLeftTop.posShow)));
      //  this.panelRightTop.runAction(new cc.EaseBackOut(cc.moveTo(0.25,this.panelRightTop.posShow)));
        this.currentItemList = -1;
        this.doActionItemList(BO_SHOW_LIST_ITEM_MINI);
        // this.doActionItemList(BO_SHOW_LIST_ITEM_FULL);
        // if (this.fAutoHideItemList) {
        //     clearTimeout(this.fAutoHideItemList);
        // }
        // this.fAutoHideItemList = setTimeout(function () {
        //     this.doActionItemList(BO_SHOW_LIST_ITEM_MINI);
        // }.bind(this), 2000);

        this.updateItemList();
    },

    generateMovePath: function (nMove) {
        //    BlueOceanSound.playFoxJump();
        this.mapComponent.generateMovePath(nMove);
        this.isWaitingChooseDirect = true;
        this.isWaitingSelectDestination = false;
        this.enableRollButton(false);
    },

    doRoll: function (idx, pos) {
        cc.log("ISWAITING " + this.isWaitingChooseDirect);
        if (this.mapComponent.isRunEffectLoadMap)
            return;
        if (this.isWaitingRollResult) return;
        if (this.isWaitingChooseDirect) return;
        // quay extreme, gia quay se khac, tuy vao so ve ma user dang co, quay 30, 50, 100 lan
        var cost;

        var cost;
        if (idx == 0) {
            cost = 1;
        }
        else {
            if (this.btnRollTen.typeRoll == 1) {
                cost = 20;
            }
            else {
                cost = 50;
            }
        }
        if (cost <= blueOcean.keyCoin) {
            this.costImage.lb.setString("-" + StringUtility.pointNumber(cost));
            var p = (pos === undefined) ? cc.p(0, 0) : pos;
            this.costImage.setPosition(p);
            this.costImage.setVisible(true);
            this.costImage.stopAllActions();
            this.costImage.runAction(cc.sequence(cc.moveTo(1, cc.p(p.x, p.y + 50)), cc.hide()));

            this.lbHammer.setString(StringUtility.pointNumber(blueOcean.keyCoin - cost));
            this.mapComponent.moveObject = null;
            if (idx == 0)
                this.effectStartRollDice();
            else if (idx == 1) {
                this.effectStartRollExtreme();
                idx = this.btnRollTen.typeRoll;
            }
            else {
                //this.mapComponent.autoGenerateMovePath();
            }

            this.setIsWaitingRollResult(true);
            this.mapComponent.moveObject = null;

            var cmd = new CmdSendBlueOceanRoll();
            cmd.putData(blueOcean.getTypeRoll(idx));
            GameClient.getInstance().sendPacket(cmd);

            this.enableRollButton(false);

            blueOcean.saveLastGifts();
        } else {
            blueOcean.showHammerEmpty(BO_HAMMER_ROLL_EMPTY);
        }
    },

    // effect roll
    effectStartRollDice : function () {
        this.countRoll = 0;
        this.maxCountRoll = BO_ROLL_DICE_TIME;

        this.pRollDice.setVisible(true);
        this.upDice.setVisible(true);
        this.upDice.setPosition(this.upDice.pos.x, this.upDice.pos.y + 300);
        this.upDice.runAction(cc.spawn(cc.moveTo(BO_UP_DICE_MOVE, this.upDice.pos.x, this.upDice.pos.y),
            cc.sequence(cc.scaleTo(0.3, 1.1, 0.9),
                cc.callFunc(this.effectRollDiceClosePlate.bind(this)),
                new cc.EaseBounceOut(cc.scaleTo(0.5, 1.0, 1.0)))));
        this.light1.runAction(cc.fadeOut(0.5));
        this.light2.runAction(cc.spawn(cc.scaleTo(0.5, 0, 1.0), cc.fadeOut(0.5)));
        this.diceResult.loadTexture("res/Event/BlueOcean/BlueOceanUI/dice1.png");
        // this.diceResult.runAction(cc.sequence(cc.delayTime(BO_UP_DICE_MOVE/2),cc.show()));
    },

    effectRollDiceClosePlate: function () {
        var distance = 20;
        var x = Math.random() * distance;
        var y = Math.random() * distance;

        this.rotateValue = 5;
        this.effectRotatePlate();

        BlueOceanSound.playClosePlate();
    },

    effectRotatePlate: function () {
        if (this.rotateValue == 0) {
            this.dice.runAction(cc.sequence(cc.rotateTo(BO_PLATE_DICE_CHANGE_DIRECT, this.rotateValue),
                cc.callFunc(this.effectRollDiceShow.bind(this))));
            this.setPosition(0, 0);
        } else {
            this.dice.runAction(cc.sequence(cc.rotateTo(BO_PLATE_DICE_CHANGE_DIRECT, this.rotateValue),
                cc.callFunc(this.effectRotatePlate.bind(this))));
            var temp = Math.abs(this.rotateValue);
            temp = temp - 1;
            this.rotateValue = temp * (this.rotateValue / Math.abs(this.rotateValue));
            this.rotateValue = this.rotateValue * -1;

            var x = Math.random() * 2;
            x = Math.random() > 0.5 ? x : -x;

            var y = Math.random() * 2;
            y = Math.random() > 0.5 ? y : -y;

            this.runAction(cc.moveTo(BO_PLATE_DICE_MOVE, x, y));
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

            BlueOceanSound.playRollPlate();
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
        BlueOceanSound.playOpenPlate();

        var count = 0;
        var numMove = this.cmdResult.numMoves;
        this.diceResult.loadTexture("res/Event/BlueOcean/BlueOceanUI/dice" + numMove + ".png");

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
        if (this.cmdResult.numMoves > 0) {
            this.pRollDice.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(this.effectDiceToPath.bind(this)), cc.hide()));
        }
        else {
            // tung xuc xac 100 lan, chi show ra ket qua
            this.showRollResult(false);
        }
    },

    effectDiceToPath: function () {
        BlueOceanSound.playDiceFly();
        var pDice = this.dice.convertToWorldSpace(this.diceResult.getPosition());
        pDice = (this.mapComponent.convertToNodeSpace(pDice));
        this.mapComponent.effectDiceToPath(pDice);
    },

    effectStartRollExtreme : function () {
        BlueOceanSound.playFoxJump();
        //  this.mascot.eff.gotoAndPlay("jump", -1, -1, 0);
    },

    // result effect
    showRollResult: function (isRun) {
        if(!(sceneMgr.getMainLayer() instanceof BlueOceanScene)) return;
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

            this.mapComponent.mascotIdle(blueOcean.mapInfo.row,blueOcean.mapInfo.col);

            try {
                // cc.log("Hide Stone Character : " + blueOcean.mapInfo.row + "_" + blueOcean.mapInfo.col);
                // this.arGrid[blueOcean.mapInfo.row + "_" + blueOcean.mapInfo.col].hideStone(Math.random());
            }
            catch(e) {
                cc.log("HideStone : " + JSON.stringify(e));
            }
        }
        if (this.cmdResult)
            this.giftsResult = this.cmdResult.gifts;
        if (this.giftsResult && Object.keys(this.giftsResult).length > 0) {
            var desPos = cc.p(this.panel.getPositionX() + this.panel.getContentSize().width * 0.5 * this.panel.getScaleX(), cc.director.getWinSize().height / 2);
            var autoPos = this.mapComponent.getMascotPosition();
            var gui = sceneMgr.openGUI(BO_RESULT_GUI_CLASS, BO_RESULT_GUI_ORDER, BO_RESULT_GUI_ORDER);
            if (gui) {
                var chestPos = this.mapComponent.getPositionChest();
                gui.openGift(this.giftsResult, desPos, this.lbGold.posEffect, isRun, autoPos, chestPos);
            }
        }
        else {
            this.onFinishEffectShowResult();
        }
    },

    showWave: function () {
        this.bgWave.setVisible(true);
        //this.nodeWaveBubble.runAction(cc.repeatForever(cc.waves(10, cc.size(15, 10), 5, 5, true, false)));
       this.bgWave.setPosition(0, -500);
        this.bgWave.setOpacity(0);
        this.bgWave.runAction(cc.sequence(
            cc.delayTime(2.0),
            cc.fadeTo(1.5, 220),
            cc.delayTime(0.5),
            cc.fadeOut(1.5),
            cc.hide()
        ));
        this.bgWave.runAction(cc.sequence(
            cc.delayTime(1.0),
            cc.EaseBackOut(cc.moveTo(1.0, 0, 0))
        ));
        this.bubbleEffectMap();
    },


    // Effect Bubble
    generateBubbleEffect: function (nScale, timeDelay, timeBubble, yMove) {
        yMove = yMove || 100;

        if(nScale < 0.2) nScale = 0.2;
        if(nScale > 0.8) nScale = 0.8;

        var sp2 = cc.Sprite.create(BO_IMAGE_BUBBLE);
        sp2.setScale(nScale);
        sp2.setVisible(false);
        sp2.setLocalZOrder(BO_MAP_ITEM_ZODER + 9);
        sp2.runAction(cc.sequence(cc.delayTime(timeDelay + Math.random()), cc.show(), cc.sequence(cc.spawn(cc.moveBy(timeBubble, cc.p(0, yMove)),
            cc.sequence(cc.scaleTo(timeBubble / 5, nScale - 0.05), cc.scaleTo(timeBubble / 5, nScale + 0.05),
                cc.scaleTo(timeBubble / 5, nScale - 0.15), cc.scaleTo(timeBubble / 5, nScale - 0.15),
                cc.spawn(cc.scaleTo(timeBubble / 3, 0), cc.fadeOut(timeBubble))))), cc.removeSelf()
        ));
        return sp2;
    },

    bubbleEffectMap : function (maxTime,nBubble,noSound) {
        maxTime = maxTime || BO_MAX_TIME_BUBBLE_IN_MAP;
        nBubble = 5;
        var totalTime = 0;

        if(!noSound)
            BlueOceanSound.playBubbleSequence();


        for(var i = -1 ; i < BO_COL + 2 ; i++)  {
            for(var j = 0 ; j < nBubble ; j++) {
                var timeDelay = 3 - Math.random();
                var timeBubble = Math.random()*maxTime;
                var yMove = j * 25;
                var nScale = Math.random();
                var sp = this.generateBubbleEffect(nScale,timeDelay,timeBubble,j * 25);
                this.layerEffect.addChild(sp);
                //var pos = this.getPosFromIndex(BO_ROW + 1,i);
                var pos1 = BO_ROW + 1;
                var pos = cc.p(BlueOceanMap.WIDTH_ISO * (i + 0.5), cc.winSize.height - BlueOceanMap.HEIGHT_ISO * (pos1 + 0.8));
                var idx = Math.random()%2 == 0 ? 1 : -1;
                pos.x += idx * Math.random() * 100;
                pos.y += Math.random() * 200;
                sp.setPosition(pos);
                totalTime = timeDelay + timeBubble;
            }
        }
        return totalTime;
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
        cc.log("FINISH SHOW RESULT ");
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

    openChestGUI: function (level) {
        var gui = sceneMgr.openGUI(BlueOceanOpenChesttGUI.className);
        var desPos = cc.p(this.panel.getPositionX() + this.panel.getContentSize().width * 0.5 * this.panel.getScaleX(), cc.director.getWinSize().height / 2);
        gui.openChest(desPos, this.lbGold.posEffect, level);
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

    // roll
    onRollResult: function (cmd) {
        this.cmdResult = cmd;
        if (cmd.result == 1) {
            if (cmd.isNeedUserChooseDirection) {
                this.setIsWaitingRollResult(false);
                this.numMoveAvailable = cmd.numMoves;
                this.isWaitingChooseDirect = true;
            } else {
                this.mapComponent.processMoveCmd(cmd);
            }
            //this.mapComponent.effectDiceToPath(cmd);
            this.isWaitingEffectMove = true;
        } else {
            this.setIsWaitingRollResult(false);
            this.isWaitingEffectMove = false;

            this.updateUserInfo();
            this.updateEventInfo();

            this.pRollDice.setVisible(false);
            sceneMgr.showOKDialog(LocalizedString.to("BO_BREAK_RESULT_" + cmd.result));
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
        if(!blueOcean.isRequestedInfo) return;
        if (this.isWaitingEffectMove)
            return;

        this.isEventTime = blueOcean.isInEvent();

        this.lbHammer.setString(StringUtility.pointNumber(blueOcean.keyCoin));
        this.lbLevel.setString(blueOcean.curLevel);

        this.lbTimeRemain.updateText(0, LocalizedString.to("BO_INFO_TIME_LEFT_0") + " ");
        this.lbTimeRemain.updateText(2, LocalizedString.to("BO_INFO_TIME_LEFT_1"));

        this.updateItemList();

        // load stage
        if(this.isWaitingChangeStage) return;
        if (this.isWaitingChooseDirect) return;

        this.enableRollButton(blueOcean.mapInfo.remainMove == 0,this.isWaitShowScene);
        this.mapComponent.loadMap();
        if (blueOcean.mapInfo.remainMove > 0) {
            this.generateMovePath(blueOcean.mapInfo.remainMove);
        }

        // show dialog hammer empty
        if(!this.isChangeStage && !this.isFirstJoin) {
            blueOcean.showHammerEmpty(BO_HAMMER_NOTIFY_EMPTY);
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
        // BlueOceanSound.playSoundSingle();

        this.currentItemSelect = info.id; // for cheat

        this.txItem.setString(blueOcean.getItemName(info.id));
        this.txItem.id = info.id;

        if (info.gift > 0) {
            this.showPopupInfo();
            var open = sceneMgr.openGUI(BO_OPEN_GIFT_GUI_CLASS, BO_OPEN_GIFT_GUI_ORDER, BO_OPEN_GIFT_GUI_ORDER);
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
            this.popupItem.lbInfo.setString(LocalizedString.to("BO_COLLECTION_PIECE"));
            this.popupItem.lbName.setString(blueOcean.getItemName(inf.id));
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
        if (id != BO_SCENE_BTN_CLOSE && !blueOcean.isInEvent()) {
            sceneMgr.showOkDialogWithAction(LocalizedString.to("BO_EVENT_TIMEOUT"), function (buttonId) {
                this.onBack();
            });
            return;
        }
        BlueOceanSound.playBubbleSingle();
        this.doActionItemList(BO_SHOW_LIST_ITEM_MINI);
        switch (id) {
            case BO_SCENE_BTN_CLOSE: {
                this.onBack();
                break;
            }
            case BO_SCENE_BTN_HELP: {
                // var cmd = {needChooseDirection: true, numMove: 3, result: 1};
                // this.onRollResult(cmd);
                sceneMgr.openGUI(BO_HELP_GUI_CLASS, BO_HELP_GUI_ORDER,BO_HELP_GUI_ORDER);
                break;
            }
            case BO_SCENE_CHEAT_ITEM: {
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
                var cmd = new CmdSendBlueOceanCheatItem();
                cmd.putData(itemPieceId, parseInt(num));
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case BO_SCENE_CHEAT_EXP_COIN: {
                if (!Config.ENABLE_CHEAT) return;

                var exp = this.txExp.getString();
                var coin = this.txCoin.getString();
                var chest = this.txtChest.getString();

                if (exp == "" || isNaN(exp)) {
                    exp = 0;
                }
                if (coin == "" || isNaN(coin)) {
                    coin = 0;
                }
                if (chest == "" || isNaN(chest)) {
                    chest = 0;
                }

                var cmd = new CmdSendBlueOceanCheatCoinAccumulate();
                cmd.putData(parseFloat(coin), parseInt(exp), parseInt(chest));
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case BO_SCENE_CHEAT_COIN_FREE: {
                if (!Config.ENABLE_CHEAT) return;

                var cmd = new CmdSendBlueOceanCheatCoinFree();
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case BO_SCENE_CHEAT_RESET_SERVER: {
                if (!Config.ENABLE_CHEAT) return;

                var cmd = new CmdSendBlueOceanCheatReset();
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case BO_SCENE_CHEAT_SHOW_FULLTIME: {
                if (!Config.ENABLE_CHEAT) return;

                this.lbTimeFull.setVisible(!this.lbTimeFull.isVisible());
                break;
            }
            case BO_SCENE_CHEAT_G_SERVER: {
                if (!Config.ENABLE_CHEAT) return;

                var gServer = parseFloat(this.txGServer.getString());
                if (isNaN(gServer)) gServer = 0;
                var gUser = parseFloat(this.txGUser.getString());
                if (isNaN(gUser)) gUser = 0;

                var cmd = new CmdSendBlueOceanCheatGServer();
                cmd.putData(gServer, gUser);
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case BO_SCENE_BTN_CHEAT: {
                if (!Config.ENABLE_CHEAT) return;

                if (this.pCheat.getPosition().x != this.pCheat.pos.x) {
                    this.pCheat.setPositionX(this.pCheat.pos.x);
                } else {
                    this.pCheat.setPositionX(this.pCheat.getContentSize().width * this._scale);
                }
                break;
            }
            case BO_SCENE_CHEAT_NUM_ROLL: {
                if (!Config.ENABLE_CHEAT) return;

                var nRoll = parseFloat(this.txNumRoll.getString());
                if (isNaN(nRoll)) nRoll = 0;
                if (nRoll != 0) {
                    cc.log("NUM ROLL " + nRoll);
                    blueOcean.saveLastGifts();
                    this.effectStartRollDice();
                    for (var i = 0; i < nRoll; i++) {
                        var cmd = new CmdSendBlueOceanRoll();
                        cmd.putData(blueOcean.getTypeRoll(0));
                        GameClient.getInstance().sendPacket(cmd);
                    }
                    // var cmd = new CmdSendBlueOceanCheatNumRoll();
                    // cmd.putData(nRoll);
                    // GameClient.getInstance().sendPacket(cmd);
                }
                break;
            }
            case BO_SCENE_CHEAT_ROCK: {
                if (!Config.ENABLE_CHEAT) return;

                var nRoll = parseFloat(this.txtRock.getString());
                var nRoll1 = parseFloat(this.txtMap.getString());
                if (isNaN(nRoll)) nRoll = 0;
                if (isNaN(nRoll1)) nRoll1 = 0;
                if (nRoll != 0 && nRoll1 != 0) {
                    var cmd = new CmdSendBlueOceanCheatRock();
                    cmd.putData(nRoll, nRoll1);
                    GameClient.getInstance().sendPacket(cmd);
                }
                break;
            }
            case BO_SCENE_CHEAT_POS: {
                if (!Config.ENABLE_CHEAT) return;

                var nRoll = parseFloat(this.txtRowPos.getString());
                var nRoll1 = parseFloat(this.txtColumnPos.getString());
                if (isNaN(nRoll)) nRoll = 0;
                if (isNaN(nRoll1)) nRoll1 = 0;
                if (nRoll != 0 && nRoll1 != 0) {
                    var cmd = new CmdSendBlueOceanCheatPos();
                    cmd.putData(nRoll, nRoll1);
                    GameClient.getInstance().sendPacket(cmd);
                }
                break;
            }
            case BO_SCENE_CHEAT_CONVERT: {
                if (!Config.ENABLE_CHEAT) return;

                var nRoll = parseFloat(this.txtRowConvert.getString());
                var nRoll1 = parseFloat(this.txtColumnConvert.getString());
                if (isNaN(nRoll)) nRoll = 0;
                if (isNaN(nRoll1)) nRoll1 = 0;
                if (nRoll != 0 && nRoll1 != 0) {
                    var cmd = new CmdSendBlueOceanCheatConvert();
                    cmd.putData(nRoll, nRoll1);
                    GameClient.getInstance().sendPacket(cmd);
                }
                break;
            }
            case BO_SCENE_CHEAT_PIE_1:
            case BO_SCENE_CHEAT_PIE_2:
            case BO_SCENE_CHEAT_PIE_3:
            case BO_SCENE_CHEAT_PIE_4: {
                this.selectCheatPie(id);
                break;
            }
            case BO_SCENE_BTN_ROLL_ONCE :
            case BO_SCENE_BTN_ROLL_TEN:
            case BO_SCENE_BTN_ROLL_HUNDRED: {
                var p = btn.convertToWorldSpace(cc.p(btn.getContentSize().width * 0.7, 0.5));
                p = this.panel.convertToNodeSpace(p);
                this.doRoll(id - BO_SCENE_BTN_ROLL_ONCE, p);
                // var cmd = {needChooseDirection: true, numMove: 3, result: 1};
                // this.onRollResult(cmd);
                break;
            }
            case BO_SCENE_BTN_HISTORY : {
                sceneMgr.openGUI(BO_HISTORY_GUI_CLASS, BO_HISTORY_GUI_ORDER, BO_HISTORY_GUI_ORDER);
                break;
            }
            case BO_SCENE_BTN_NEWS : {
                NativeBridge.openWebView(blueOcean.eventLinkNews);
                break;
            }
            case BO_SCENE_BTN_SHOP : {
                //gamedata.openNapGInTab(0, BO_SCENE_CLASS,true);
                gamedata.openShop(BO_SCENE_CLASS, true);
                // gamedata.openShopTicket(BO_SCENE_CLASS,true);
                break;
            }
            case BO_SCENE_BTN_OK : {
                break;
            }
            case BO_SCENE_BTN_CHANGE: {
                var gui = sceneMgr.openGUI(BlueOceanPieceChangeGUI.className, 100, 100);
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

        BlueOceanSound.closeLobby();

        blueOcean.blueOceanScene = null;
        blueOcean.notifyEvent = false;

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
            var stime = blueOcean.getTimeLeftString();
            var nTime = blueOcean.getTimeLeft();

            if (nTime <= 0) {
                if (blueOcean.checkWeek(BO_WEEK_END)) {
                    this.lbTimeRemain.updateText(0, LocalizedString.to("BO_EVENT_TIMEOUT"));
                    blueOcean.eventTime = BO_WEEK_END + 1;

                    this.enableRollButton(false);

                    // Kick user to Lobby if QC want
                    //sceneMgr.openScene(LobbyScene.className);
                } else {
                    this.lbTimeRemain.updateText(0, LocalizedString.to("BO_EVENT_NEXT_WEEK"));
                }
                this.lbTimeRemain.updateText(1, "");
                this.lbTimeRemain.updateText(2, "");

                this.isEventTime = false;
            } else {
                this.lbTimeRemain.updateText(1, stime);
            }

            this.lbTimeRemain.setPositionX(this.lbTimeRemain.parentSize.width * 0.95 - this.lbTimeRemain.getWidth());

            if (Config.ENABLE_CHEAT)
                this.lbTimeFull.setString(blueOcean.getTimeLeftString(true));
        }
        else {
            if(this.lbTimeRemain) {
                this.lbTimeRemain.updateText(0, LocalizedString.to("BO_EVENT_TIMEOUT"));
                this.lbTimeRemain.updateText(1, "");
                this.lbTimeRemain.updateText(2, "");
            }
        }



        // effect random cell
        if(this.nTimeEffect > 0) {
            this.nTimeEffect -= dt;
            if(this.nTimeEffect <= 0) {
                this.nTimeEffect = BO_CELL_EFFECT_COUNT_DOWN;

                for(var i = 0 ; i < 5 ; i++) {
                    var x = this.randomRange(0,BO_ROW - 1);
                    var y = this.randomRange(0,BO_COL - 1);
                    var grd = this.arGrid[x + "_" + y];
                    if(grd && grd instanceof BlueOceanGrid) {
                        grd.effect();
                    }
                }
            }
        }

        // effect bubble
        // if(this.nTimeBubbleEffect > 0) {
        //     this.nTimeBubbleEffect -= dt;
        //     if(this.nTimeBubbleEffect <= 0) {
        //         this.nTimeBubbleEffect = BO_BUBBLE_EFFECT_COUNT_DOWN;
        //
        //         this.randomBubbleMap();
        //     }
        // }

        // update Map Component
        this.mapComponent.update(dt);


    },
});

var BlueOceanOpenResultGUI = BaseLayer.extend({

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

        this._super(BO_RESULT_GUI_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanOpenResultGUI.json");
    },

    initGUI: function () {
        var winSize = cc.director.getWinSize();

        this.bg = this.getControl("bg");
        var top = this.getControl("pTop");
        var bot = this.getControl("pBot");

        this.bgExp = this.getControl("bgExp", top);
        this.lbExp = this.getControl("lbExp", this.bgExp);
        this.bgExp.setVisible(false);

        this.decoLeft = this.getControl("decoLeft", this._layout);
        this.decoLeft.pos = this.decoLeft.getPosition();

        this.decoRight = this.getControl("decoRight", this._layout);
        this.decoRight.pos = this.decoRight.getPosition();

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
        this.defaultItem.size.width *= 1.15;
        this.defaultItem.size.height *= 1.25;
        this.defaultItem.padX = this.defaultItem.size.width * 0.25;
        this.defaultItem.padY = this.defaultItem.size.height * 0.35;

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
        this.bgExp.setScale(0);
        this.title.setVisible(false);
        this.decoLeft.setVisible(false);
        this.decoRight.setVisible(false);
        this.btn.setVisible(false);
        //this.share.setVisible(false);
        this.logo_zp.setVisible(false);

        this.title.setPosition(this.title.pos);
        this.decoLeft.setPosition(this.decoLeft.pos);
        this.decoRight.setPosition(this.decoRight.pos);
        this.btn.setPosition(this.btn.pos);
        // this.share.setPosition(this.share.pos);

        this.spGifts = [];

        if (!cc.sys.isNative){
            this.uiGift.setTouchEnabled(true);
        }
    },

    // open gui
    openGift: function (obj, desPos, goldPos, isRun, autoPos, chestPos) {
        // cc.log("BlueOceanOpenResultGUI::openGift " + JSON.stringify(arguments));
        this.lbExp.setString("+" + blueOcean.additionalChestExp);
        this.isAutoGift = false;
        this.isScrollGui = false;

        var timeDelay = 0.5;

        this.goldPos = this.gift.convertToNodeSpace(goldPos);
        this.desPos = this.gift.convertToNodeSpace(desPos);
        this.autoPos = this.gift.convertToNodeSpace(autoPos);
        this.chestPos = this.gift.convertToNodeSpace(chestPos);


        var gifts = [];
        for (var key in obj) {
            var ooo = {};
            ooo.isStored = blueOcean.isItemStored(key);
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

        if (!isRun && blueOcean.ignoreShowResultGUI) {
            this.showGiftIgnoreGUI();
            return;
        }

        this.pIgnore.setVisible(false);
        this.pIgnore.tick.setVisible(false);
        if (!isRun) {
            this.pIgnore.runAction(cc.sequence(cc.delayTime(timeDelay), cc.show()));
        }

        if (nGift > 12) {
            // this.arGifts.splice(12, nGift - 12);
            // nGift = 12;
            BlueOceanSound.playSoundSequence();
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

                var p = new BlueOceanResultGift();
                p.setGift(inf);
                p.setPosition(pStart.x + i * (this.defaultItem.size.width + this.defaultItem.padX), pStart.y);
                p.setScale(0);
                p.runAction(cc.sequence(cc.delayTime(timeDelay), new cc.EaseBackOut(cc.scaleTo(timeShow, 1))));
                this.gift.addChild(p);
                this.spGifts.push(p);
            }
        }

        this.runAction(cc.sequence(cc.delayTime(timeDelay), cc.callFunc(BlueOceanSound.playFinishBreak)));

        this.bg.setOpacity(0);
        this.bg.setVisible(true);
        this.bg.runAction(cc.sequence(cc.fadeTo(timeShow + timeDelay, 220), cc.callFunc(this.onFinishEffect.bind(this))));
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

        this.runAction(cc.sequence(cc.delayTime(0.15), cc.callFunc(BlueOceanSound.playFinishBreak)));

        this.bg.setOpacity(0);
        this.bg.setVisible(true);
        this.bg.runAction(cc.sequence(cc.fadeTo(0.25, 220), cc.callFunc(this.onFinishEffect.bind(this))));
    },

    getGiftInScroll: function () {
        var size = this.arGifts.length;
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
                        if (ggg.id == BO_EXP_GIFT_EXTRA_ID) {
                            time = this.dropPiece(ggg.id, 1, startPos, this.chestPos, true); //ggg.value
                            actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id,1, startPos, this.chestPos, false)); // ggg.value
                        }
                        else if (ggg.isStored) { // pie image
                            time = this.dropPiece(ggg.id, 1, startPos, this.desPos, true); //ggg.value
                            actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id,1, startPos, this.desPos, false)); // ggg.value
                        } else {  // drop gold
                            var num = blueOcean.getItemValue(ggg.id);// * ggg.value;
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
            if (ggg.id == BO_EXP_GIFT_EXTRA_ID) {
                time = this.dropPiece(ggg.id, 1, spGiftPos, this.chestPos, true); //ggg.value
                actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id, 1, spGiftPos, this.chestPos, false)); //ggg.value
            }
            else if (ggg.isStored) { // pie image
                time = this.dropPiece(ggg.id, 1, spGiftPos, this.desPos, true); //ggg.value
                actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id, 1, spGiftPos, this.desPos, false)); //ggg.value
            } else {  // drop gold
                // continue;
                var num = blueOcean.getItemValue(ggg.id)%20;// * ggg.value;
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
            if(blueOcean.blueOceanScene) {
                blueOcean.blueOceanScene.clearPieceInMap();
            }
        }),cc.delayTime(totalTime*3/4), cc.callFunc(this.onCloseGUI.bind(this))));
    },

    getGift: function () {
        this.title.setVisible(true);
        this.title.setPosition(this.title.pos);
        this.title.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.title.pos.x, this.title.pos.y + 400))));

        this.decoLeft.setVisible(true);
        this.decoLeft.setPosition(this.decoLeft.pos);
        this.decoLeft.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.decoLeft.pos.x, this.decoLeft.pos.y + 400))));

        this.decoRight.setVisible(true);
        this.decoRight.setPosition(this.decoRight.pos);
        this.decoRight.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.decoRight.pos.x, this.decoRight.pos.y + 400))));

        this.btn.setVisible(true);
        this.btn.setPosition(this.btn.pos);
        this.btn.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.btn.pos.x, this.btn.pos.y - 400))));

        this.bgExp.runAction(new cc.EaseBackIn(cc.scaleTo(0.5, 0)));


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
            if (id == BO_EXP_GIFT_EXTRA_ID)
                sp = new cc.Sprite("res/Event/BlueOcean/BlueOceanUI/cellNormal.png");
            else
                sp = new cc.Sprite(blueOcean.getPieceImage(id));
            sp.setScale(0.6);
            var rnd = parseInt(Math.random() * 10) % 2 == 0;
            var pCX = Math.random() * winSize.width;
            var pCY = Math.random() * winSize.height;
            var posCenter = cc.p(pCX, pCY);
            var actMove = new cc.BezierTo(timeMove, [pStart, posCenter, pEnd]);
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            sp.runAction(cc.sequence(cc.delayTime(dTime * i), cc.spawn(actMove, cc.callFunc(BlueOceanSound.playPiece)), actHide));
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

            sp.runAction(cc.sequence(cc.delayTime(Math.random() * dTime), actShow, cc.spawn(actMove, cc.sequence(cc.delayTime(1.5 * Math.random()), cc.callFunc(BlueOceanSound.playSingleCoin))), cc.callFunc(function () {
                if (blueOcean.blueOceanScene) {
                    blueOcean.blueOceanScene.onEffectGetMoneyItem(goldReturn);
                }
            }.bind(this, goldReturn)), actHide));
        }
        return 0;
    },

    onFinishEffect: function () {
        this.title.setVisible(true);
        this.title.setPositionY(this.title.pos.y + 400);
        this.title.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.title.pos)));

        this.decoLeft.setVisible(true);
        this.decoLeft.setPositionY(this.decoLeft.pos.y + 400);
        this.decoLeft.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.decoLeft.pos)));

        this.decoRight.setVisible(true);
        this.decoRight.setPositionY(this.decoRight.pos.y + 400);
        this.decoRight.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.decoRight.pos)));

        this.btn.setVisible(true);
        this.btn.setPositionY(this.btn.pos.y - 400);
        this.btn.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.btn.pos)));

        this.bgExp.runAction(
            cc.sequence(
                new cc.EaseBackOut(cc.scaleTo(0.5, 1),
                cc.rotateTo(0.2, 20, 0),
                cc.repeatForever(
                    cc.sequence(cc.rotateBy(0.4, -40, 0), cc.rotateBy(0.4, 40, 0)))
                )
            )
        );

        var func = function () {
            this.bgExp.runAction(cc.repeatForever(
                cc.sequence(
                    cc.rotateBy(0.4, -20),
                    cc.rotateBy(0.4, 20)
                )
            ));
        };
        this.bgExp.runAction(cc.sequence(
                new cc.EaseBackOut(cc.scaleTo(0.5, 1)),
                cc.rotateTo(0.2, 10),
                cc.callFunc(func.bind(this))
        ));
        //  this.share.setVisible(true);
        //  this.share.setPositionY(this.share.pos.y - 400);
        //  this.share.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.share.pos)));
    },

    effectMoney: function (sender, value) {
        if (value === undefined || value == null) return;

        if (blueOcean.blueOceanScene) {
            blueOcean.blueOceanScene.onEffectGetMoneyItem(value);
        }
    },

    // ui function
    onButtonRelease: function (btn, id) {
        if (id == 9) {   // clear new day !

            BlueOceanSound.playBubbleSingle();
            if (blueOcean.ignoreShowResultGUI) {
                blueOcean.saveIgnoreResultGUI(false);
                this.pIgnore.btn.setColor(cc.color(255, 255, 255));
                this.pIgnore.tick.setVisible(false);
            } else {
                blueOcean.saveIgnoreResultGUI(true);
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
        BlueOceanSound.playSoundSingle();

        if (this.isAutoGift) {
            var gIds = [];
            for (var i = 0; i < this.cmd.gifts.length; i++) {
                if (blueOcean.isItemOutGame(this.cmd.gifts[i].id)) {
                    gIds.push(this.cmd.gifts[i].id);
                }
            }
            if (gIds.length > 0) {
                if (blueOcean.isRegisterSuccess) {
                    var cmd = new CmdSendBlueOceanChangeAward();
                    cmd.putData(false, gIds);
                    GameClient.getInstance().sendPacket(cmd);
                } else {
                    blueOcean.showRegisterInformation(gIds);
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
            cell = new BlueOceanGiftCell(this);
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
        cc.log("ON CLOSE GUI *** ");
        if(blueOcean && blueOcean.blueOceanScene)
            blueOcean.blueOceanScene.onFinishEffectShowResult();

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

var BlueOceanOpenGiftGUI = BaseLayer.extend({

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

        this._super(BO_OPEN_GIFT_GUI_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanOpenGiftGUI.json");
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

        BlueOceanSound.playSoundSequence();

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
        this.gift.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(BlueOceanSound.playGift),new cc.EaseBackOut(cc.scaleTo(0.5, 1))));

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
            this.lbName.setString(inf.gift + "x " + blueOcean.getItemName(this.info.id));
        } else {
            this.lbName.setString(blueOcean.getItemName(this.info.id));
        }

        // khong con phan thuong out game
        if (blueOcean.isItemOutGame(inf.id) && false)
            this.lbName.setString(((inf.gift > 1) ? (inf.gift + " ") : "") + blueOcean.getItemName(this.info.id));

        cc.log("ID GIFT " + blueOcean.getGiftImageOpen(this.info.id));
        var sp = new cc.Sprite(blueOcean.getGiftImageOpen(this.info.id));

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

        if (this.info.id == 1000010 || this.info.id == 1000020) {
            var eff = new ImageEffectLayer();
            this.pEffect.addChild(eff);
            eff.setPositionCoin(SceneMgr.convertPosToParent(this.pEffect, this.gift));
            eff.startEffect(100, ImageEffectLayer.TYPE_FLOW, "res/Event/BlueOcean/BlueOceanUI/iconDiamond.png");
            eff.setCallbackFinish(this.onBack.bind(this));
        }
        else if (this.info.id == 1000030) {
            this.onBack();
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
        BlueOceanSound.playSoundSingle();

        if (id == 1) {
            if (this.isWaitResponse)
                return;
            this.hideAnimate();
            // Fix code do luat chuyen qua out game thanh in game
            if (blueOcean.isItemOutGame(this.info.id) && false && this.isAutoGift == false) {
                if (blueOcean.isRegisterSuccess) {
                    var cmd = new CmdSendBlueOceanChangeAward();
                    cmd.putData(false, this.info.id);
                    GameClient.getInstance().sendPacket(cmd);
                    NewVipManager.getInstance().setWaiting(true);
                } else {
                    blueOcean.showRegisterInformation([this.info.id]);
                }

                // this.onBack();
            } else {
                if (this.isAutoGift) {
                    this.onGiftSuccess();
                } else {
                    this.isWaitResponse = true;
                    var cmd = new CmdSendBlueOceanChangeAward();
                    if (blueOcean.isItemOutGame(this.info.id))
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
        blueOcean.showAutoGift();
        NewVipManager.checkShowUpLevelVip();
    },
});

var BlueOceanRegisterInformationGUI = BaseLayer.extend({

    ctor: function () {
        this.giftIds = [];

        this.txName = null;
        this.txAddress = null;
        this.txCmnd = null;
        this.txSdt = null;
        this.txEmail = null;

        this.btnRegister = null;

        this._super(BO_REGISTER_GUI_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanRegisterInformationGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", BO_SCENE_BTN_CLOSE, this._bg);
        this.btnFanpage = this.customButton("btnFanpage", BO_SCENE_BTN_FANPAGE, this._bg);
        this.btnFanpage.setVisible(false);
        this.btnRegister = this.customButton("complete", BO_SCENE_BTN_OK, this._bg);
        this.btnRegister.enable = false;

        this.giftName = this.getControl("gift", this._bg);

        // init editbox
        this.txName = this.createExitBox(this.getControl("bgName", this._bg), LocalizedString.to("BO_NAME"), BO_TF_NAME);
        this.txName.setMaxLength(70);
        this.txName.setFontColor(cc.color(165, 88, 46, 255));
        this._bg.addChild(this.txName);

        this.txAddress = this.createExitBox(this.getControl("bgAdd", this._bg), LocalizedString.to("BO_ADDRESS"), BO_TF_ADDRESS);
        this.txAddress.setMaxLength(70);
        this.txAddress.setFontColor(cc.color(165, 88, 46, 255));
        this._bg.addChild(this.txAddress);

        this.txCmnd = this.createExitBox(this.getControl("bgCmnd", this._bg), LocalizedString.to("BO_CMND"), BO_TF_CMND);
        this.txCmnd.setMaxLength(70);
        this.txCmnd.setFontColor(cc.color(165, 88, 46, 255));
        this._bg.addChild(this.txCmnd);

        this.txSdt = this.createExitBox(this.getControl("bgSdt", this._bg), LocalizedString.to("BO_PHONE"), BO_TF_PHONE);
        if (cc.sys.isNative){
            this.txSdt.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        }
        this.txSdt.setMaxLength(70);
        this.txSdt.setFontColor(cc.color(165, 88, 46, 255));
        this._bg.addChild(this.txSdt);

        this.txEmail = this.createExitBox(this.getControl("bgEmail", this._bg), LocalizedString.to("BO_EMAIL"), BO_TF_EMAIL);
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
            case BO_TF_NAME: {
                this.checkTextInput(str, 3, LocalizedString.to("BO_INPUT_NAME"));
                break;
            }
            case BO_TF_ADDRESS: {
                this.checkTextInput(str, 3, LocalizedString.to("BO_INPUT_ADDRESS"));
                break;
            }
            case BO_TF_PHONE: {
                this.checkTextInput(str, 9, LocalizedString.to("BO_INPUT_PHONE"));
                break;
            }
            case BO_TF_CMND: {
                this.checkTextInput(str, 9, LocalizedString.to("BO_INPUT_CMND"));
                break;
            }
            case BO_TF_EMAIL: {
                this.validateEmail(str, LocalizedString.to("BO_INPUT_EMAIL"));
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
            str += blueOcean.getItemName(gIds[i]);
            if (i < gIds.length - 1) {
                str += ",";
            }
        }
        this.giftName.setString(str);
        this.giftIds = gIds;
    },

    onCompleteRegister: function () {
        if (blueOcean.isWaitResponseRegister)
            return;

        this.autoCheckRegisterEnable();

        var name = this.txName.getString().trim();
        var address = this.txAddress.getString().trim();
        var cmnd = this.txCmnd.getString().trim();
        var sdt = this.txSdt.getString().trim();
        var email = this.txEmail.getString().trim();

        if (!this.checkTextInput(name, 3, LocalizedString.to("BO_INPUT_NAME"))) {
            return;
        } else if (!this.checkTextInput(address, 3, LocalizedString.to("BO_INPUT_ADDRESS"))) {
            return;
        } else if (!this.checkTextInput(cmnd, 9, LocalizedString.to("BO_INPUT_CMND"))) {
            return;
        } else if (!this.checkTextInput(sdt, 9, LocalizedString.to("BO_INPUT_PHONE"))) {
            return;
        } else if (!this.validateEmail(email, LocalizedString.to("BO_INPUT_EMAIL"))) {
            return;
        } else {
            var cmd = new CmdSendBlueOceanChangeAward();
            cmd.putData(false, this.giftIds, name, address, cmnd, sdt, email);
            GameClient.getInstance().sendPacket(cmd);
            blueOcean.isWaitResponseRegister = true;
        }
    },

    onButtonRelease: function (btn, id) {
        if (id == BO_SCENE_BTN_FANPAGE) {
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
        else if (id == BO_SCENE_BTN_OK) {
            BlueOceanSound.playSoundSingle();

            if (this.btnRegister.enable)
                this.onCompleteRegister();
        } else {
            BlueOceanSound.playBubbleSingle();

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

var BlueOceanAccumulateGUI = BaseLayer.extend({

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

        this._super(BO_ACCUMULATE_GUI_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanAccumulateGUI.json");
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
        this.exp.setString(blueOcean.curLevelExp + "/" + blueOcean.nextLevelExp);

        this.schedule(this.update, BO_ACCUMULATE_TIME_DELTA);
    },

    hideLight: function () {
        this.pEffectBubble.removeAllChildren();
        this.pEffectBubble.setPositionY(this.progress.getPositionY());
    },

    effectLight: function () {
        try {
            for (var i = 0; i < parseInt(Math.random() * 100) % 10 + 10; i++) {
                var sp2 = cc.Sprite.create("res/Event/BlueOcean/BlueOceanUI/bubble.png");
                sp2.setVisible(false);
                sp2.setLocalZOrder(BO_MAP_ITEM_ZODER + 9);
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
        //blueOcean.curLevelExp = 8000;
        //blueOcean.nextLevelExp = 10000;
        //blueOcean.keyCoin = 1;
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

        this.isKeyCoinChange = (cmd.keyCoin > blueOcean.keyCoin);

        this.curExpTmp = blueOcean.curLevelExp;
        this.nextExpTmp = blueOcean.nextLevelExp;

        var perExp = blueOcean.getExpPercent();
        this.bar.setPercent(perExp);
        this.num.setString(blueOcean.keyCoin);
        this.exp.setString(blueOcean.getExpString());

        this.hideLight();
        //  this.effectLight();

        BlueOceanSound.playBubbleSequence1();

        this.progress.runAction(cc.sequence(new cc.EaseExponentialOut(cc.moveTo(BO_ACCUMULATE_TIME_MOVE, cc.p(cc.winSize.width,this.progress.defaultPos.y))), cc.callFunc(this.endMoving.bind(this))));

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

        if (blueOcean.nextLevelExp > 1) {
            if (blueOcean.curLevelExp + this.result.additionExp >= blueOcean.nextLevelExp) {
                this.deltaLoad.push(blueOcean.nextLevelExp - blueOcean.curLevelExp);
                this.deltaLoad.push(this.result.additionExp - blueOcean.nextLevelExp + blueOcean.curLevelExp);

                this.perLoad.push(this.getPerLoad(blueOcean.nextLevelExp - blueOcean.curLevelExp, blueOcean.nextLevelExp));
                this.perLoad.push(this.getPerLoad(this.result.additionExp - blueOcean.nextLevelExp + blueOcean.curLevelExp, this.result.nextLevelExp));
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
        this.timeLoad = BO_ACCUMULATE_TIME_PROGRESS / this.perLoad.length;
        for (var i = 0; i < this.perLoad.length; i++) {
            this.perLoad[i] = BO_ACCUMULATE_TIME_DELTA * this.perLoad[i] / this.timeLoad;
            this.deltaLoad[i] = BO_ACCUMULATE_TIME_DELTA * this.deltaLoad[i] / this.timeLoad;
        }

        // update eggBreaker info
        blueOcean.curLevelExp = this.result.currentLevelExp;
        blueOcean.nextLevelExp = this.result.nextLevelExp;
        blueOcean.keyCoin = this.result.keyCoin;
    },

    endCoin: function () {
        if (this.isKeyCoinChange) {
            this.num.runAction(cc.sequence(cc.scaleTo(0.15, 1.25), cc.callFunc(function () {
                this.num.setString(blueOcean.keyCoin);

                if(this.isKeyCoinChange)
                    BlueOceanSound.playSoundSingle();
            }.bind(this)), cc.scaleTo(0.15, 0.8), cc.scaleTo(0.15, 1)));
        } else {
            this.num.setString(blueOcean.keyCoin);
        }
    },

    onFinishLoad: function () {
        if (this.curLoad >= this.perLoad.length) {
            this.bgCoin.setVisible(false);
            var perExp = blueOcean.getExpPercent();
            perExp = (perExp < 5) ? 5 : perExp;
            this.bar.setPercent(perExp);
            this.exp.setString(blueOcean.getExpString());
            this.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(this.onCloseGUI.bind(this))));

            if (this.result.keyCoinAward <= 0) {
                this.endCoin();
            }
        }
    },

    onCloseGUI: function () {
        var moveTo = cc.moveTo(BO_ACCUMULATE_TIME_MOVE, cc.p(this.progress.defaultPos.x + this.progress.getContentSize().width, this.progress.defaultPos.y));
        this.progress.runAction(cc.sequence(new cc.EaseExponentialOut(moveTo), cc.callFunc(this.onClose.bind(this))));
    },

    onClose: function () {
        if (blueOcean.btnInGame) {
            try {
                var func = function () {
                    blueOcean.btnInGame.setEnabled(true);
                }
                blueOcean.btnInGame.setEnabled(true);
                blueOcean.btnInGame.runAction(cc.fadeIn(0.5));
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

            this.timeLoad -= BO_ACCUMULATE_TIME_DELTA;
            if (this.timeLoad <= 0) {
                this.curExpTmp = 0;
                if (this.result)
                    this.nextExpTmp = this.result.nextLevelExp;

                this.bar.setPercent(0);
                this.curLoad += 1;
                this.timeLoad = BO_ACCUMULATE_TIME_PROGRESS / this.perLoad.length;

                this.onFinishLoad();
            }
        }
    },
});

var BlueOceanHelpGUI = BaseLayer.extend({

    ctor: function () {

        this._currentPage = null;
        this._pageHelp = null;

        this._arrPage = null;
        this._pageInfo = null;

        this.curPage = -1;

        this._super(BO_HELP_GUI_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanHelpGUI.json");
    },

    initGUI: function () {

        var bg = this.getControl("bg");
        this._bg = bg;

        var btnClose = this.customButton("btnClose", BO_HELP_NUM_PAGE + 1, bg);
        this._pageHelp = this.getControl("pageHelp", bg);

        // var game = LocalizedString.config("GAME");
        // if (game.indexOf("sam") >= 0 || game.indexOf("binh") >= 0) {
        //    // page.setBackGroundImage("res/Event/PotBreaker/PotBreakerUI/help1_1.png");
        // }

        this._arrPage = [];
        for (var i = 0; i < BO_HELP_NUM_PAGE; i++) {
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
        BlueOceanSound.playBubbleSingle();

        if (id >= 0 && id < BO_HELP_NUM_PAGE) {
            this._pageHelp.scrollToPage(id);
        } else {
            this.onBack();
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var BlueOceanHistoryGUI = BaseLayer.extend({

    ctor: function () {
        this.arTabRequest = [];

        this._super(BO_HISTORY_GUI_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanHistoryGUI.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");

        this.tabHistory = this.customButton("tabHistory", BO_SCENE_TAB_HISTORY, bg, false);
        this.tabHistory.ySelect = this.tabHistory.getPositionY() - 2;
        this.tabHistory.yNormal = this.tabHistory.getPositionY();
        this.tabHistory.lbTitle = this.getControl("lbTitle", this.tabHistory);
        this.tabGift = this.customButton("tabGift", BO_SCENE_TAB_GIFT, bg, false);
        this.tabGift.ySelect = this.tabGift.getPositionY() - 2;
        this.tabGift.yNormal = this.tabGift.getPositionY();
        this.tabGift.lbTitle = this.getControl("lbTitle", this.tabGift);
        this.tabInfo = this.customButton("tabInformation", BO_SCENE_TAB_INFORMATION, bg, false);
        this.tabInfo.ySelect = this.tabInfo.getPositionY() - 2;
        this.tabInfo.yNormal = this.tabInfo.getPositionY();
        this.tabInfo.lbTitle = this.getControl("lbTitle", this.tabInfo);
        this.tabChange = this.customButton("tabChange", BO_SCENE_TAB_CHANGE, bg, false);
        this.tabChange.ySelect = this.tabChange.getPositionY() - 2;
        this.tabChange.yNormal = this.tabChange.getPositionY();
        this.tabChange.lbTitle = this.getControl("lbTitle", this.tabChange);

        this.customButton("close", BO_SCENE_BTN_CLOSE, bg);

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
        this.btnFanpage = this.customButton("btnFanpage", BO_SCENE_BTN_FANPAGE, this.pInfo);

        this.pGift = this.getControl("pGift", bg);
        this.pGift.notice = this.getControl("pGiftEmpty", this.pGift);
        var panelGift = new BlueOceanPanelGift(this.pGift);
        this.pGift.panel = panelGift;
        this.pGift.addChild(panelGift);

        this.pChangePiece = this.getControl("pChangePiece", bg);
        var panelChange = new BlueOceanPanelChangePiece();
        this.pChangePiece.panel = panelChange;
        this.pChangePiece.addChild(panelChange);

        this.ignoreAllButtonSound();

        this.enableFog(true);
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.arTabRequest[BO_SCENE_TAB_GIFT] = false;
        this.arTabRequest[BO_SCENE_TAB_INFORMATION] = false;
        this.arTabRequest[BO_SCENE_TAB_HISTORY] = false;
        this.arTabRequest[BO_SCENE_TAB_CHANGE] = false;
        this.arTabRequest[BO_SCENE_TAB_LAMP] = false;
        this.onButtonRelease(null, BO_SCENE_TAB_HISTORY);

        if (!cc.sys.isNative){
            this.listHistory.setTouchEnabled(true);
        }
    },

    onButtonRelease: function (button, id) {
        BlueOceanSound.playBubbleSingle();
        if (id == BO_SCENE_BTN_FANPAGE) {
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

        if (id == BO_SCENE_BTN_CLOSE) {
            this.onClose();
            return;
        }

        // visible tab
        this.curTab = id;

        this.pHistory.setVisible(id == BO_SCENE_TAB_HISTORY);
        this.pInfo.setVisible(id == BO_SCENE_TAB_INFORMATION && blueOcean.isRegisterSuccess);
        this.pInfo.notice.setVisible(id == BO_SCENE_TAB_INFORMATION && !blueOcean.isRegisterSuccess);
        this.pGift.setVisible(id == BO_SCENE_TAB_GIFT);
        this.pChangePiece.setVisible(id == BO_SCENE_TAB_CHANGE);

        // change tab
        var tHisNormal = "res/Event/BlueOcean/BlueOceanUI/tabSelect.png";
        var tHisSelect = "res/Event/BlueOcean/BlueOceanUI/tab.png";
        var cHis = (id == BO_SCENE_TAB_HISTORY);
        this.tabHistory.loadTextures(!cHis ? tHisSelect : tHisNormal, cHis ? tHisSelect : tHisNormal, "");
        this.tabHistory.setPositionY(cHis ? this.tabHistory.ySelect : this.tabHistory.yNormal);
        this.tabHistory.lbTitle.setColor(cHis ? cc.color(35, 106, 42, 255) :  cc.color(159, 234, 105, 255));

        var cGift = (id == BO_SCENE_TAB_GIFT);
        this.tabGift.loadTextures(!cGift ? tHisSelect : tHisNormal, cGift ? tHisSelect : tHisNormal, "");
        this.tabGift.setPositionY(cGift ? this.tabGift.ySelect : this.tabGift.yNormal);
        this.tabGift.lbTitle.setColor(cGift ? cc.color(35, 106, 42, 255) :  cc.color(159, 234, 105, 255));

        var cInf = (id == BO_SCENE_TAB_INFORMATION);
        this.tabInfo.loadTextures(!cInf ? tHisSelect : tHisNormal, cInf ? tHisSelect : tHisNormal, "");
        this.tabInfo.setPositionY(cInf ? this.tabInfo.ySelect : this.tabInfo.yNormal);
        this.tabInfo.lbTitle.setColor(cInf ? cc.color(35, 106, 42, 255) :  cc.color(159, 234, 105, 255));

        var cChange = (id == BO_SCENE_TAB_CHANGE);
        this.tabChange.loadTextures(!cChange ? tHisSelect : tHisNormal, cChange ? tHisSelect : tHisNormal, "");
        this.tabChange.setPositionY(cChange ? this.tabChange.ySelect : this.tabChange.yNormal);
        this.tabChange.lbTitle.setColor(cChange ? cc.color(35, 106, 42, 255) :  cc.color(159, 234, 105, 255));

        if (this.arTabRequest[id]) return;
        switch (id) {
            case BO_SCENE_TAB_GIFT : {
                var cmd12 = new CmdSendBlueOceanGetGiftHistory();
                GameClient.getInstance().sendPacket(cmd12);
                break;
            }
            case BO_SCENE_TAB_HISTORY: {
                var cmd1 = new CmdSendBlueOceanGetRollHistory();
                GameClient.getInstance().sendPacket(cmd1);
                break;
            }
            case BO_SCENE_TAB_INFORMATION : {
                var cmd = new CmdSendBlueOceanGetRegisterInfo();
                GameClient.getInstance().sendPacket(cmd);
                break;
            }
            case BO_SCENE_TAB_LAMP : {
                blueOcean.sendGetLampInfo();
                break;
            }
        }
    },


    updateRollHistory: function () {
        this.arTabRequest[BO_SCENE_TAB_HISTORY] = true;

        this.pHistory.notice.setVisible(blueOcean.arRollHistory.length <= 0);
        this.listHistory.reloadData();
    },

    updateGiftHistory: function () {
        this.arTabRequest[BO_SCENE_TAB_GIFT] = true;

        this.pGift.notice.setVisible(blueOcean.arGiftHistory.length <= 0);
        this.pGift.panel.setVisible(blueOcean.arGiftHistory.length > 0);
        this.pGift.panel.updateData();
    },

    updateInformation: function () {
        this.arTabRequest[BO_SCENE_TAB_INFORMATION] = true;

        this.pInfo.setVisible(blueOcean.isRegisterSuccess && this.curTab == BO_SCENE_TAB_INFORMATION);
        this.pInfo.notice.setVisible(!blueOcean.isRegisterSuccess && this.curTab == BO_SCENE_TAB_INFORMATION);

        if (blueOcean.isRegisterSuccess) {
            this.btnFanpage.setVisible(blueOcean.getTotalPriceGift() >= 500000);
            this.pInfo.fullname.setString(blueOcean.infoHistory.name);
            this.pInfo.phone.setString(blueOcean.infoHistory.phone);
            this.pInfo.cmnd.setString(blueOcean.infoHistory.cmnd);
            this.pInfo.address.setString(blueOcean.infoHistory.address);
            this.pInfo.email.setString(blueOcean.infoHistory.email);
        }
    },

    tableCellSizeForIndex: function (table, idx) {
        var obj = blueOcean.arRollHistory[idx];
        if (obj && obj.pieces) {
            var n = Object.keys(obj.pieces).length;
            n = (n % BO_PIECE_MAX_ROW == 0) ? (n / BO_PIECE_MAX_ROW) : parseInt(n / BO_PIECE_MAX_ROW) + 1;
            return cc.size(760, (n==0 ? 1 : n) * BO_PIECE_IMAGE_SIZE * 1.05 + 30);
        }
        return cc.size(760, BO_PIECE_IMAGE_SIZE * 1.05);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new BlueOceanPiecesHistoryCell();
        }
        cell.updateInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return blueOcean.arRollHistory.length;
    },

    onBack: function () {
        this.onClose();
    }
});

var BlueOceanPanelGift = BaseLayer.extend({

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
            cell = new BlueOceanGiftHistoryCell();
        }
        cell.updateInfo(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return blueOcean.arGiftHistory.length;
    },
});

// popup
var BlueOceanPieceChangeGUI = BaseLayer.extend({

    ctor: function () {
        this._super(BlueOceanPieceChangeGUI.className);
        this.initWithBinaryFile("res/Event/BlueOcean/BOChangePiece.json");
    },

    initGUI: function (parent) {
        this.bg = this.getControl("bg", this._layout);
        this.panelItem = ccui.Helper.seekWidgetByName(this._layout, "panelItem");
        this.btnChange = this.customButton("btnChange", BlueOceanPieceChangeGUI.BTN_CHANGE, this._layout);
        this.btnClose = this.customButton("btnClose", BlueOceanPieceChangeGUI.BTN_CLOSE, this._layout);
        // this.checkBox = ccui.Helper.seekWidgetByName(this._layout, "checkBox");
        this.btnDeselect = this.customButton("btnDeselect", BlueOceanPieceChangeGUI.BTN_CANCEL, this._layout);
        this.btnSelect = this.customButton("btnSelectAll", BlueOceanPieceChangeGUI.BTN_SELECT_ALL, this._layout);
        this.lbNum = this.getControl("lbNum", this._layout);
        this.lbGold = this.getControl("lbGold", this.btnChange);
        this.lbNoPiece = this.getControl("lbNoPiece", this.panelItem);

        this.listItem = new cc.TableView(this, cc.size(300, this.panelItem.getContentSize().height));
        this.listItem.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listItem.setVerticalFillOrder(1);
        this.listItem.setDelegate(this);
        this.panelItem.addChild(this.listItem);
        this.listItem.reloadData();

        this.enableFog();
        this.setBackEnable(true);
    },

    onBack: function () {
        this.onClose();
    },

    onEnterFinish: function () {
        if (blueOcean.arrayGiftChange.length > 0) {
            this.lbNoPiece.setVisible(false);
        }
        else {
            this.lbNoPiece.setVisible(true);
        }

        this.updateData();
    },

    updateButtonChange: function () {
        this.lbGold.setString(StringUtility.pointNumber(blueOcean.getGoldChange()));
        this.lbNum.setString(blueOcean.getNumChange() + " * " + StringUtility.pointNumber(blueOcean.changeToGold));
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case BlueOceanPieceChangeGUI.BTN_CHANGE:
                cc.log("CHANGE ITEM");
                blueOcean.sendListChange();
                break;
            case BlueOceanPieceChangeGUI.BTN_CANCEL:
                cc.log("DESELECT");
                blueOcean.resetChange();
                this.updateButtonChange();
                this.listItem.reloadData();
                break;
            case BlueOceanPieceChangeGUI.BTN_SELECT_ALL:
                blueOcean.autoSelectChange();
                this.updateButtonChange();
                this.listItem.reloadData();
                break;
            case BlueOceanPieceChangeGUI.BTN_CLOSE:
                this.onBack();
                break;
            default:
                break;
        }

    },

    updateData: function () {
        this.listItem.reloadData();
        this.updateButtonChange();
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(240, 250);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new BlueOceanFullCell();
            cell.setType(BO_ITEM_IN_CHANGE_SCENE);
        }
        cell.updateInfoChange(idx);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return blueOcean.arrayGiftChange.length;
    },
});

BlueOceanPieceChangeGUI.BTN_SELECT_ALL = 0;
BlueOceanPieceChangeGUI.BTN_CANCEL = 1;
BlueOceanPieceChangeGUI.BTN_CLOSE = 2;
BlueOceanPieceChangeGUI.BTN_CHANGE = 3;
BlueOceanPieceChangeGUI.className = "BlueOceanPieceChangeGUI";

var BlueOceanPieceConvertGUI = BaseLayer.extend({

    ctor: function () {
        this._super(BO_PIECE_GUI_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanPieceConvertGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");
        this.customButton("close", BO_SCENE_BTN_CLOSE, this._bg);

        this.pGold = this._bg.getChildByName("gold");
        this.money = new BlueOceanMoney();
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
        BlueOceanSound.playBubbleSingle();
        this.onClose();
    },
});
BlueOceanPieceConvertGUI.BTN_OK = 0;
BlueOceanPieceConvertGUI.BTN_CANCEL = 1;

var BlueOceanEventNotifyGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(BO_NOTIFY_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanEventNotifyGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", BO_GUI_BTN_CLOSE, this._bg);
        this.btnJoin = this.customButton("join", BO_GUI_NOTIFY_BTN_JOIN, this._bg);
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
        blueOcean.saveCurrentDay();
        this.lbTime.setString(blueOcean.eventDayFrom + "-" + blueOcean.eventDayTo);
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        BlueOceanSound.playBubbleSingle();
        this.onBack();
        if (id == BO_GUI_NOTIFY_BTN_JOIN) {
            blueOcean.openEvent();
        }
        else {
            blueOcean.showHammerEmpty(BO_HAMMER_NOTIFY_EMPTY);
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var BlueOceanNapGNotifyGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(BO_NOTIFY_PROMOTE_G_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanNapGNotifyGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", BO_SCENE_BTN_CLOSE, this._bg);
        this.customButton("nap_g", BO_SCENE_BTN_CLOSE + 1, this._bg);

        this.lbTime = this.getControl("time", this._bg);
        this.lb = this.getControl("lb", this._bg);

        this.ignoreAllButtonSound();

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        blueOcean.saveCurrentDayNapG();
        this.setShowHideAnimate(this._bg, true);

        this.lbTime.setString(blueOcean.eventWeeks[blueOcean.eventTime - 1]);

        this.lbTime.setVisible(false);
        this.lb.setVisible(false);
    },

    onButtonRelease: function (btn, id) {
        BlueOceanSound.playBubbleSingle();

        this.onBack();

        if (id != BO_SCENE_BTN_CLOSE) {
            gamedata.openNapGInTab(blueOcean.idTabEventShop,BO_SCENE_CLASS);
        }
    },

    onBack: function () {
        this.onClose();
    }
});

var BlueOceanBonusGNotifyPanel = BaseLayer.extend({

    ctor : function () {
        this._super();
        this.initWithBinaryFile("res/Event/BlueOcean/BONotifyEventGBonus.json");
    },

    initGUI : function () {
        this.bg = this.customButton("bg",1,this._layout,false);

        this.ignoreAllButtonSound();
    },

    onButtonRelease : function (btn,id) {
        BlueOceanSound.playBubbleSingle();

        gamedata.openNapGInTab(blueOcean.idTabEventShop,LobbyScene.className,true);
    },

    onEnterFinish : function () {
        blueOcean.saveNotifyBonusGPanel();

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

var BlueOceanBonusTicketDialog = BaseLayer.extend({

    ctor: function () {
        this._super(BO_NOTIFY_BONUS_TICKET_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanNotifyBonusTicketGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.customButton("close", BO_SCENE_BTN_CLOSE, this.bg);
        this.customButton("shop", BO_SCENE_BTN_SHOP, this.pRoll);

        this.ignoreAllButtonSound();

        this.enableFog();
        this.setBackEnable();
    },

    onEnterFinish: function () {
        this.waitAction = -1;
        this.setShowHideAnimate(this.bg,true);

        blueOcean.saveNotifyBonusTicketCurrentDay();
    },

    onButtonRelease: function (btn, id) {
        BlueOceanSound.playBubbleSingle();

        this.waitAction = id;

        this.onClose();
    },

    onCloseDone: function () {
        this.removeFromParent();

        if(this.waitAction == BO_SCENE_BTN_SHOP) this.onCloseShop();
    },

    onCloseShop: function () {
        gamedata.openNapG(BO_SCENE_CLASS);
    }
});

var BlueOceanHammerEmptyDialog = BaseLayer.extend({

    ctor: function () {
        this.waitAction = -1;
        this.typeGUI = -1;

        this._super(BO_HAMMER_EMPTY_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanHammerEmptyDialog.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.customButton("btnClose", BO_SCENE_BTN_CLOSE, this.bg);

        this.pRoll = this.getControl("pRoll",this.bg);
        this.customButton("btnShop", BO_SCENE_BTN_SHOP, this.pRoll);
        this.customButton("btnPlay", BO_SCENE_BTN_PLAY, this.pRoll);

        this.pNotify = this.getControl("pNotify",this.bg);
        this.customButton("btnShop", BO_SCENE_BTN_SHOP, this.pNotify);

        this.pTicket = this.getControl("pTicket",this.bg);
        this.customButton("btnShop", BO_SCENE_BTN_OPEN_EVENT, this.pTicket);
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
        this.pRoll.setVisible(type == BO_HAMMER_ROLL_EMPTY);
        this.pNotify.setVisible(type == BO_HAMMER_NOTIFY_EMPTY);
        this.pTicket.setVisible(type == BO_HAMMER_TICKET);
        if (type == BO_HAMMER_TICKET) {
            this.lbTicket.setString(message);
        }
    },

    onButtonRelease: function (btn, id) {
        this.waitAction = id;

        BlueOceanSound.playBubbleSingle();

        this.onClose();
    },

    onCloseDone: function () {
        this.removeFromParent();

        if(this.waitAction == BO_SCENE_BTN_SHOP) this.onCloseShop();
        if(this.waitAction == BO_SCENE_BTN_PLAY) this.onClosePlay();
        if(this.waitAction == BO_SCENE_BTN_OPEN_EVENT) {
            var clb = sceneMgr.getMainLayer();
            if (!(clb instanceof BlueOceanScene)) {
                event.openEvent();
            }
        }
    },

    onCloseShop: function () {
        //gamedata.openNapGInTab(blueOcean.idTabEventShop, BO_SCENE_CLASS);
        gamedata.openShop(BO_SCENE_CLASS, true);
        // gamedata.openShopTicket(BO_SCENE_CLASS,true);
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
                            gamedata.openShop(BO_SCENE_CLASS, true);
                        }
                    });
                } else {
                    sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                }
            }
        }
    }
});

var BlueOceanPromoTicketGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(BlueOceanPromoTicketGUI.className);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanPromoTicketGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", BO_GUI_BTN_CLOSE, this._bg);
        this.btnJoin = this.customButton("join", BO_GUI_NOTIFY_BTN_JOIN, this._bg);
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
        //blueOcean.saveCurrentDay();
        if (event.startPromoTicket.localeCompare(event.endPromoTicket) != 0)
            this.lbTime.setString(localized("BO_DAY") + " " + event.startPromoTicket + "-" + event.endPromoTicket);
        else
            this.lbTime.setString(localized("BO_DAY") + " " + event.startPromoTicket);
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        BlueOceanSound.playBubbleSingle();
        if (id == BO_GUI_NOTIFY_BTN_JOIN) {
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
BlueOceanPromoTicketGUI.className = "BlueOceanPromoTicketGUI";
BlueOceanPromoTicketGUI.TAG = 105;

var BlueOceanOpenChesttGUI = BaseLayer.extend({

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

        this._super(BO_RESULT_GUI_CLASS);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanOpenChestGUI.json");
    },

    initGUI: function () {
        var winSize = cc.director.getWinSize();

        this.bg = this.getControl("bg");
        var top = this.getControl("pTop");
        var bot = this.getControl("pBot");
        var center = this.getControl("pCenter");
        this.pCenter = center;

        this.decoLeft = this.getControl("decoLeft", this._layout);
        this.decoLeft.pos = this.decoLeft.getPosition();

        this.decoRight = this.getControl("decoRight", this._layout);
        this.decoRight.pos = this.decoRight.getPosition();

        this.title = this.getControl("congrat", top);
        this.title.pos = this.title.getPosition();

        this.btn = this.customButton("btnGet", 1, bot);
        this.btn.pos = this.btn.getPosition();

        this.share = this.customButton("btnShare", 2, bot);
        this.share.pos = this.share.getPosition();

        this.logo_zp = this.getControl("logo", bot);

        this.chestEffect = new CustomSkeleton("res/Event/BlueOcean/BlueOceanRes/Spine", "ruong", 1);
        this.addChild(this.chestEffect);
        this.chestEffect.setAnimation(0, "1", 0);
        this.chestEffect.setScale(1.0);
        this.chestEffect.setPosition(winSize.width * 0.5, winSize.height * 0.5);

        this.pEffect = new cc.Node();
        this.addChild(this.pEffect);
        this.arrayLabelEffect = [];
        this.pEffect.setPosition(winSize.width * 0.5, winSize.height * 0.5);

        var eff = new ImageEffectLayer(400, 400, 0.5);
        eff.setPositionY(-40);
        this.pEffect.addChild(eff);
        eff.setPositionCoin(cc.p(0, 50));
        this.effectDiamond = eff;

        var effGold = new ImageEffectLayer(400, 400, 0.5);
        effGold.setPositionY(-40);
        this.pEffect.addChild(effGold);
        effGold.setPositionCoin(cc.p(0, 50));
        this.effectGold = effGold;

        // update pos
        this.enableFog();
        this.setBackEnable(true);

        this.ignoreAllButtonSound();
        this.arrayGift = [];
    },

    onEnterFinish: function () {

        //  this.gift.removeAllChildren();
        this.title.setVisible(false);
        this.decoLeft.setVisible(false);
        this.decoRight.setVisible(false);
        this.btn.setVisible(false);
        //this.share.setVisible(false);
        this.logo_zp.setVisible(false);

        this.title.setPosition(this.title.pos);
        this.decoLeft.setPosition(this.decoLeft.pos);
        this.btn.setPosition(this.btn.pos);
        // this.share.setPosition(this.share.pos);

        if (!cc.sys.isNative){
            this.uiGift.setTouchEnabled(true);
        }
        this.effectDiamond.setVisible(false);
        this.effectGold.setVisible(false);
    },

    openChest: function (desPos, goldPos, level) {
        var treasureLevel = blueOcean.convertLevelChestToLevelTreasure(level);
        this.chestEffect.setVisible(true);
        this.desPos = desPos;
        this.goldPos = goldPos;

        this.chestEffect.setAnimation(0, "" + treasureLevel + "_open", 0);
        this.runAction(cc.sequence(cc.delayTime(1.3), cc.callFunc(this.callbackOpen1.bind(this))));
    },

    callbackOpen1: function () {
        this.listGift = blueOcean.getListGiftInChest();
        var showGold = false, showDiamond = false;
        for (var i = 0; i < this.listGift.length; i++) {
            var giftData = this.listGift[i];
            if (giftData["type"] == BlueOcean.BONUS_GOLD) {
                showGold = true;
            }
            else if (giftData["type"] == BlueOcean.BONUS_DIAMOND) {
                showDiamond = true;
            }
        }
        if (showDiamond) {
            this.effectDiamond.startEffect(50, ImageEffectLayer.TYPE_FLOW, "res/Event/BlueOcean/BlueOceanUI/iconDiamond.png");
        }
        if (showGold) {
            this.effectGold.startEffect(50, ImageEffectLayer.TYPE_FLOW, "res/Event/BlueOcean/BlueOceanUI/icon_gold.png");
        }
        if (gamedata.sound) {
            cc.audioEngine.playEffect(lobby_sounds.coinFall, false);
        }
        this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.callbackOpen2.bind(this))));
    },

    callbackOpen2: function () {
        this.openGift(this.desPos, this.goldPos);
        this.chestEffect.setVisible(false);
    },

    // open gui
    openGift: function (desPos, goldPos) {
        this.pCenter.removeAllChildren();
        this.spGifts = [];
        this.arGifts = [];
        var winSize = this.pCenter.getContentSize();
        this.listGift = blueOcean.getListGiftInChest();
        this.arrayPiece = [];

        this.goldPos = this.pCenter.convertToNodeSpace(goldPos);
        this.desPos = this.pCenter.convertToNodeSpace(desPos);
        for (var i = 0; i < this.listGift.length; i++) {
            var giftData = this.listGift[i];
            if (giftData["type"] == BlueOcean.BONUS_GOLD) {
                giftData.id = BO_GOLD_GIFT_EXTRA_ID;
            }
            else if (giftData["type"] == BlueOcean.BONUS_DIAMOND) {
                giftData.id = BO_DIAMOND_GIFT_EXTRA_ID;
            }
            else {
                giftData.id = giftData["type"];
                giftData.isStored = true;
            }
            this.arrayPiece.push(giftData);
        }
        cc.log("MANG QUA ** " + JSON.stringify(this.arrayPiece));
        this.arGifts = this.arrayPiece;
        var startX = winSize.width * 0.5 - (BlueOceanOpenChesttGUI.WIDTH_ITEM * this.arrayPiece.length + BlueOceanOpenChesttGUI.PAD_ITEM * (this.arrayPiece.length - 1)) * 0.5;
        for (var i = 0; i < this.arrayGift.length; i++) {
            this.arrayGift[i].setVisible(false);
        }
        for (var i = 0; i < this.arrayPiece.length; i++) {
            var gift;
            gift = new BlueOceanResultGift();
            this.spGifts.push(gift);
            this.pCenter.addChild(gift);
            gift.setGift(this.arrayPiece[i]);
            gift.setPosition(startX + (i + 0.5) *  BlueOceanOpenChesttGUI.WIDTH_ITEM + i * BlueOceanOpenChesttGUI.PAD_ITEM, this.pCenter.getContentSize().height * 0.5);
            //gift.setPosition(startX + 0.5 * BlueOceanOpenChesttGUI.WIDTH_ITEM, this.pCenter.getContentSize().height * 0.5);
        }
        blueOcean.treasureRewardNumberOpen = [];
        blueOcean.treasureRewardTypeOpen = [];
        blueOcean.treasureRewardValueOpen = [];
        blueOcean.treasureRewardNameOpen = [];
        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(BlueOceanSound.playFinishBreak)));
        this.bg.setOpacity(0);
        this.bg.setVisible(true);
        this.bg.runAction(cc.sequence(cc.fadeTo(0.5, 220), cc.callFunc(this.onFinishEffect.bind(this))));
        //if (gi)
        // this.runAction(cc.sequence(cc.delayTime(timeDelay), cc.callFunc(BlueOceanSound.playFinishBreak)));
        //
        // this.bg.setOpacity(0);
        // this.bg.setVisible(true);
        // this.bg.runAction(cc.sequence(cc.fadeTo(timeShow + timeDelay, 220), cc.callFunc(this.onFinishEffect.bind(this))));
    },

    getGift: function () {
        this.title.setVisible(true);
        this.title.setPosition(this.title.pos);
        this.title.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.title.pos.x, this.title.pos.y + 400))));

        this.decoLeft.setVisible(true);
        this.decoLeft.setPosition(this.decoLeft.pos);
        this.decoLeft.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.decoLeft.pos.x, this.decoLeft.pos.y + 400))));

        this.decoRight.setVisible(true);
        this.decoRight.setPosition(this.decoRight.pos);
        this.decoRight.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.decoRight.pos.x, this.decoRight.pos.y + 400))));

        this.btn.setVisible(true);
        this.btn.setPosition(this.btn.pos);
        this.btn.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.btn.pos.x, this.btn.pos.y - 400))));


        //  this.share.setVisible(true);
        //  this.share.setPosition(this.share.pos);
        //  this.share.runAction(new cc.EaseBackIn(cc.moveTo(0.5, cc.p(this.share.pos.x, this.share.pos.y - 400))));

        this.bg.setOpacity(220);
        this.bg.setVisible(true);
        this.bg.runAction(cc.fadeOut(2));

        this.getGiftInPanel();
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
            // var spGiftPos = spGift ? spGift.getPosition() :
            //     (this.autoPos ? this.autoPos : cc.p(this.gift.getContentSize().width / 2, this.gift.getContentSize().height / 2));
            var spGiftPos = cc.p(this.pCenter.getContentSize().width / 2, this.pCenter.getContentSize().height / 2);
            var time = 0;
            var actDrop = null;
            var actHide = null;
            if (ggg.isStored) { // pie image
                time = this.dropPiece(ggg.id, 1, spGiftPos, this.desPos, true); //ggg.value
                actDrop = cc.callFunc(this.dropPiece.bind(this, ggg.id, 1, spGiftPos, this.desPos, false)); //ggg.value
            } else {  // drop gold
                // continue;
                var num = this.arrayPiece[i].value;// * ggg.value;
                time = this.dropGold(num, spGiftPos, this.goldPos, true);
                actDrop = cc.callFunc(this.dropGold.bind(this, num, spGiftPos, this.goldPos, false));
            }

            if (time > lastTime) lastTime = time;

            actHide = cc.spawn(cc.scaleTo(timeHide, 0), cc.fadeOut(timeHide));
            totalEffectTime += lastTime;
            if (spGift) spGift.runAction(cc.sequence(cc.delayTime(delayTime * (i + 1)/2), actHide, actDrop));
            else this.pCenter.runAction(cc.sequence(cc.delayTime(delayTime * (i + 1)/2), actDrop));
        }
        totalTime = lastTime + delayTime * size/2 + timeHide;
        this.runAction(cc.sequence(cc.delayTime(totalTime/4),cc.callFunc(function () {

        }),cc.delayTime(totalTime*3/4), cc.callFunc(this.onCloseGUI.bind(this))));
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
            sp = new cc.Sprite(blueOcean.getPieceImage(id));
            sp.setScale(0.6);
            var rnd = parseInt(Math.random() * 10) % 2 == 0;
            var pCX = Math.random() * winSize.width;
            var pCY = Math.random() * winSize.height;
            var posCenter = cc.p(pCX, pCY);
            var actMove = new cc.BezierTo(timeMove, [pStart, posCenter, pEnd]);
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            sp.runAction(cc.sequence(cc.delayTime(dTime * i), cc.spawn(actMove, cc.callFunc(BlueOceanSound.playPiece)), actHide));
            sp.setPosition(pStart);
            this.pCenter.addChild(sp);
        }

        return 0;
    },

    dropGold: function (gold, pStart, pEnd, checkTime) {
        // cc.log("dropGold " + JSON.stringify(arguments));
        var num = Math.floor(gold / 10000);
        if (num < 1) num = 1;
        var goldReturn = Math.floor(gold / num);
        if (num > 20)
            num = 20;
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
        cc.log("NUM NAY fds f " + num );
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
            this.pCenter.addChild(sp);
            sp.setScale(0);

            sp.runAction(cc.sequence(cc.delayTime(Math.random() * dTime), actShow, cc.spawn(actMove, cc.sequence(cc.delayTime(1.5 * Math.random()), cc.callFunc(BlueOceanSound.playSingleCoin))), cc.callFunc(function () {
                if (blueOcean.blueOceanScene) {
                    blueOcean.blueOceanScene.onEffectGetMoneyItem(goldReturn);
                }
            }.bind(this, goldReturn)), actHide));
        }
        return 0;
    },

    onFinishEffect: function () {
        this.title.setVisible(true);
        this.title.setPositionY(this.title.pos.y + 400);
        this.title.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.title.pos)));

        this.decoLeft.setVisible(true);
        this.decoLeft.setPositionY(this.decoLeft.pos.y + 400);
        this.decoLeft.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.decoLeft.pos)));

        this.decoRight.setVisible(true);
        this.decoRight.setPositionY(this.decoRight.pos.y + 400);
        this.decoRight.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.decoRight.pos)));

        this.btn.setVisible(true);
        this.btn.setPositionY(this.btn.pos.y - 400);
        this.btn.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.btn.pos)));

        //  this.share.setVisible(true);
        //  this.share.setPositionY(this.share.pos.y - 400);
        //  this.share.runAction(new cc.EaseBackOut(cc.moveTo(0.35, this.share.pos)));
    },

    effectMoney: function (sender, value) {
        if (value === undefined || value == null) return;

        if (blueOcean.blueOceanScene) {
            blueOcean.blueOceanScene.onEffectGetMoneyItem(value);
        }
    },

    // ui function
    onButtonRelease: function (btn, id) {

        if (id == 1) {
            this.getGift();
        } else {
            this.onCapture();
        }
    },

    onBack: function () {
        BlueOceanSound.playSoundSingle();
        this.onClose();
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
        if(blueOcean && blueOcean.blueOceanScene)
            blueOcean.blueOceanScene.onFinishEffectShowResult();

        this.onClose();
    }

});
BlueOceanOpenChesttGUI.className = "BlueOceanOpenChesttGUI";
BlueOceanOpenChesttGUI.WIDTH_ITEM = 100;
BlueOceanOpenChesttGUI.PAD_ITEM = 50;

var BlueOceanChestInfoGUI = BaseLayer.extend({

    ctor: function () {
        this.lbTime = null;

        this._super(BlueOceanChestInfoGUI.className);
        this.initWithBinaryFile("res/Event/BlueOcean/BlueOceanChestInfoGUI.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customButton("close", BO_GUI_BTN_CLOSE, this._bg);
        this.scrollView = this.getControl("scrollView", this._bg);

        this.totalWidthProgress = BlueOceanChestInfoGUI.PAD_ITEM * (blueOcean.arrayBonusData.length - 1) + 10;
        this.bgProgress = cc.Scale9Sprite.create("res/Event/BlueOcean/BlueOceanUI/bgProgressChest2.png");
        this.bgProgress.setAnchorPoint(0, 0);
        this.scrollView.addChild(this.bgProgress);
        this.bgProgress.setInsetLeft(10);
        this.bgProgress.setInsetRight(10);
        this.bgProgress.setContentSize(this.totalWidthProgress, this.bgProgress.getContentSize().height);
        this.bgProgress.setPositionY(this.scrollView.getContentSize().height * 0.43);

        this.progress = cc.Scale9Sprite.create("res/Event/BlueOcean/BlueOceanUI/progressChest2.png");
        this.progress.setAnchorPoint(0, 0);
        this.scrollView.addChild(this.progress);
        this.progress.setInsetLeft(10);
        this.progress.setInsetRight(10);
        this.progress.setContentSize(this.totalWidthProgress, this.progress.getContentSize().height);
        this.progress.setPositionY(this.bgProgress.getPositionY() + 2);

        this.arrayInfo = [];
        for (var i = 0; i < blueOcean.arrayBonusData.length - 1; i++) {
            this.arrayInfo[i] = new BlueOceanChestInfoItem(i, blueOcean.arrayBonusData[i]);
            this.scrollView.addChild(this.arrayInfo[i]);
            this.arrayInfo[i].setPosition(BlueOceanChestInfoGUI.PAD_ITEM * (1 + i), this.bgProgress.getPositionY() + 7);
        }

        var pad = 10;
        this.bonusAll = new BlueOceanBonusAll();
        this.scrollView.addChild(this.bonusAll);
        this.bonusAll.setPositionX(this.totalWidthProgress + BlueOceanBonusAll.WIDTH * 0.5 + pad);
        this.bonusAll.setPositionY(this.bgProgress.getPositionY() + 7);

        this.scrollView.setInnerContainerSize(cc.size(this.totalWidthProgress + BlueOceanBonusAll.WIDTH + pad, this.scrollView.getInnerContainerSize().height));

        for (var i = 0; i < 3; i++) {
            var icon = cc.Sprite.create("res/Event/BlueOcean/BlueOceanUI/chest" + (i + 1) + ".png");
            this.scrollView.addChild(icon);
            var index = blueOcean.arrayLevelTreasure[i];
            icon.setPosition(this.arrayInfo[index].getPosition());
            icon.setPositionY(icon.getPositionY() - 3);
        }

        this.bgHelp = this.getControl("bgHelp", this._bg);
        this.bgHelp.setLocalZOrder(2);
        this.lbHelp = this.getControl("lbHelp", this.bgHelp);

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.updateInfo();
    },

    updateInfo: function () {
        for (var i = 0; i < this.arrayInfo.length; i++) {
            this.arrayInfo[i].updateInfo();
        }
        var percent = 1;
        if (blueOcean.chestLevel - 1 < blueOcean.numLevel - 1) {
            percent = (blueOcean.chestLevel - 1) / (blueOcean.numLevel - 1);
            var percentOneLevel = 1 / (blueOcean.numLevel - 1);
            var percentInOneLevel = (blueOcean.currentChestExp / blueOcean.needChestExp) * percentOneLevel;
            percent = percent + percentInOneLevel;
            this.bgHelp.setPositionX(this.arrayInfo[blueOcean.chestLevel - 1].getPositionX());
            var s = localized("BO_HELP_1");
            s = StringUtility.replaceAll(s,"@num", blueOcean.treasureRewardExp[blueOcean.chestLevel - 1]);
            this.lbHelp.setString(s);
        }
        else {
            this.bgHelp.setPositionX(this.bonusAll.getPositionX());
            var s = localized("BO_HELP_2");
            s = StringUtility.replaceAll(s,"@num", blueOcean.needChestExp);
            this.lbHelp.setString(s);
        }
        this.progress.setContentSize(this.totalWidthProgress * percent, this.progress.getContentSize().height);
        this.bonusAll.updateInfo();
        this.scrollView.scrollToPercentHorizontal(percent * 100, 0.2, true);
    },

    onButtonRelease: function (btn, id) {
        BlueOceanSound.playBubbleSingle();
        if (id == BO_GUI_NOTIFY_BTN_JOIN) {
        }
        else {
            this.onBack();
        }
    },

    onBack: function () {
        this.onClose();
    }
});
BlueOceanChestInfoGUI.className = "BlueOceanChestInfoGUI";
BlueOceanChestInfoGUI.TAG = 105;
BlueOceanChestInfoGUI.PAD_ITEM = 80;