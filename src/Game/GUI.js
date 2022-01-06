/**
 * Created by Hunter on 5/13/2016.
 */

var TableRoomCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();
        var jsonLayout = ccs.load("RoomItemCell.json");
        this._layout = jsonLayout.node;
        this._layout.setContentSize(cc.winSize.width, this._layout.getContentSize().height);
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.initCell();
    },

    initCell: function () {
        var scale = cc.winSize.width / Constant.WIDTH;
        scale = (scale > 1) ? 1 : scale;

        var bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        var pInfo = ccui.Helper.seekWidgetByName(this._layout, "pInfo");
        var pBet = ccui.Helper.seekWidgetByName(this._layout, "pBet");
        var pNum = ccui.Helper.seekWidgetByName(this._layout, "pNum");

        this.id = ccui.Helper.seekWidgetByName(this._layout, "id");

        this.name = ccui.Helper.seekWidgetByName(pInfo, "name");
        this.name.defaultString = this.name.getString();
        this.bet = ccui.Helper.seekWidgetByName(pBet, "bet");
        this.lock = ccui.Helper.seekWidgetByName(pInfo, "lock");
        this.star = ccui.Helper.seekWidgetByName(pBet, "star");

        var sp0 = ccui.Helper.seekWidgetByName(this._layout, "sp0");
        var sp1 = ccui.Helper.seekWidgetByName(this._layout, "sp1");
        var sp2 = ccui.Helper.seekWidgetByName(this._layout, "sp2");

        this.num = [];
        this.numAvaiable = [];
        for (var i = 0; i < TableRoomCell.NUM_PLAYER; i++) {
            this.num.push(ccui.Helper.seekWidgetByName(pNum, "num" + i));
            this.numAvaiable.push(ccui.Helper.seekWidgetByName(pNum, "numA" + i));
        }

        this.type = [];
        for (var i = 0; i < 2; i++) {
            this.type.push(ccui.Helper.seekWidgetByName(pInfo, "type" + i));
        }

        // scale
        bg.setScaleY(scale);
        sp0.setScaleY(scale);
        sp1.setScaleY(scale);
        sp2.setScaleY(scale);
        pInfo.setScale(scale);
        pBet.setScale(scale);
        pNum.setScale(scale);
        this.id.setScale(scale);

        var delta = bg.getContentSize().height * (1 - scale) / 4;
        this._layout.setPositionY(this._layout.getPositionY() - delta);
    },

    setInfo: function (inf) {
        try {
            this.id.setString(inf.tableIndex);
            BaseLayer.subLabelText(this.name, inf.tableName);
            this.lock.setVisible(inf.requirePass);

            this.star.setVisible(inf.bigBet);
            for (var i = 0; i < this.num.length; i++) {
                this.num[i].setVisible(i < inf.totalCount);
                this.numAvaiable[i].setVisible(i < inf.personCount);
            }

            for (var i = 0; i < this.type.length; i++) {
                this.type[i].setVisible(i == inf.type);
            }
            this.bet.setString(StringUtility.formatNumberSymbol(ChanelConfig.instance().getBet(inf.bet)));
        } catch (e) {

        }

    }
});

TableRoomCell.NUM_PLAYER = 4;
var CreateRoomGUI = BaseLayer.extend({

    ctor: function () {
        this.bg = null;
        this.typePage = null;

        this.dot = [];
        this.btnSlide = null;
        this.btnAccept = null;
        this.roomType = -1;
        this.betRoom = 0;
        this.bets = [];

        this._super("CreateRoomGUI");
        this.initWithBinaryFile("CreateRoomGUI.json");
    },

    customizeGUI: function () {
        this.bg = this.getControl("bg");

        this.typePage = this.getControl("pageType", this.bg);
        this.typePage.addEventListener(this.onPageListener.bind(this), this);

        this.customButton("bLeft", CreateRoomGUI.BTN_LEFT, this.bg);
        this.customButton("bRight", CreateRoomGUI.BTN_RIGHT, this.bg);

        this.customButton("close", CreateRoomGUI.BTN_CLOSE, this.bg);
        this.btnAccept = this.customButton("accept", CreateRoomGUI.BTN_ACCEPT, this.bg);

        this.dot = [];
        for (var i = 0; i < 2; i++) {
            this.dot.push(this.getControl("dot" + i, this.bg));
        }

        this.btnSlide = this.getControl("btnSlide");
        this.btnSlide.lb = this.getControl("lb", this.btnSlide);
        this._listenerSelect = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                cc.log("TOUCH BEGAN ");
                var select = event.getCurrentTarget();
                var pos = select.convertToWorldSpaceAR(cc.p(0, 0));
                var rect = cc.rect(pos.x - select.getContentSize().width / 2, pos.y - select.getContentSize().height / 2, select.getContentSize().width, select.getContentSize().height);

                return cc.rectContainsPoint(rect, touch.getLocation());
            },
            onTouchMoved: function (touch, event) {
                var select = event.getCurrentTarget();
                var currentPos = select.getPosition();
                var delta = touch.getDelta();

                var x = cc.pAdd(currentPos, delta).x;
                if (select && !select.listBetX)
                    return;
                if (x < select.minX)
                    x = select.minX
                else if (x > select.maxX)
                    x = select.maxX;
                select.setPositionX(x);

                for (var i = 1; i < select.listBetX.length; i++) {

                    if (x < select.listBetX[i].x) {
                        if (x < (select.listBetX[i].x - select.deltaX / 2)) {
                            select.lb.setString(StringUtility.standartNumber(select.listBetX[i - 1].bet));
                            select.selectedBet = select.listBetX[i - 1].betidx;
                            select.lb.setPositionX(select.getContentSize().width / 2);
                            break;
                        }
                        else {
                            select.lb.setString(StringUtility.standartNumber(select.listBetX[i].bet));
                            select.selectedBet = select.listBetX[i].betidx;
                            select.lb.setPositionX(select.getContentSize().width / 2);
                            break;
                        }
                    }
                }


            },
            onTouchEnded: function (touch, event) {
                var select = event.getCurrentTarget();
                var currentPos = select.getPosition();
                var delta = touch.getDelta();


                var x = cc.pAdd(currentPos, delta).x;

                if (x < select.minX)
                    x = select.minX
                else if (x > select.maxX)
                    x = select.maxX;
                select.setPositionX(x);

                for (var i = 1; i < select.listBetX.length; i++) {

                    if (x < select.listBetX[i].x) {
                        if (x < (select.listBetX[i].x - select.deltaX / 2)) {
                            select.lb.setString(StringUtility.standartNumber(select.listBetX[i - 1].bet));
                            select.selectedBet = select.listBetX[i - 1].betidx;
                            select.lb.setPositionX(select.getContentSize().width / 2);
                            select.runAction(new cc.EaseExponentialOut(cc.moveTo(.2, cc.p(select.listBetX[i - 1].x, select.getPositionY()))));
                            break;
                        }
                        else {
                            select.lb.setString(StringUtility.standartNumber(select.listBetX[i].bet));
                            select.selectedBet = select.listBetX[i].betidx;
                            select.lb.setPositionX(select.getContentSize().width / 2);
                            select.runAction(new cc.EaseExponentialOut(cc.moveTo(.2, cc.p(select.listBetX[i].x, select.getPositionY()))));

                            break;
                        }
                    }

                }

            }
        });
        cc.eventManager.addListener(this._listenerSelect, this.btnSlide);

        this.setBackEnable(true);
        this.setFog(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true);

        this.roomType = -1;
        this.betRoom = 0;
        this.bets = [];
    },

    finishAnimate: function () {
        this.typePage.scrollToPage(0);
        this.roomType = 0;
        this.updateCreateRoom();
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case CreateRoomGUI.BTN_CLOSE:
            {
                this.onBack();
                break;
            }
            case CreateRoomGUI.BTN_ACCEPT:
            {
                this.betRoom = this.btnSlide.selectedBet;

                if (this.roomType == 0) {
                    if (gamedata.userData.bean < ChanelConfig.instance().getBet[this.betRoom] * ChanelConfig.instance().betTime) {
                        Toast.makeToast(1.0, LocalizedString.to("CREATE_TABLE_NOT_ENOUGHT_GOLD"));
                        return;
                    }
                }
                else {
                    if(gamedata.selectedChanel < 2)
                    {
                        if(this.roomType == 1)
                        {
                            Toast.makeToast(1.0, LocalizedString.to("CREATE_TABLE_NOT_SUITABLE"));
                            return;
                        }
                        else
                        {
                            if (gamedata.userData.bean < ChanelConfig.instance().getBet[this.betRoom] * ChanelConfig.instance().betTime) {
                                Toast.makeToast(1.0, LocalizedString.to("CREATE_TABLE_NOT_ENOUGHT_GOLD"));
                                return;
                            }
                        }
                    }
                    else
                    {
                        if (gamedata.userData.bean < ChanelConfig.instance().getBet[this.betRoom] * ChanelConfig.instance().betTimeAt) {
                            Toast.makeToast(1.0, LocalizedString.to("CREATE_TABLE_NOT_ENOUGHT_GOLD"));
                            return;
                        }
                    }

                }

                var type = 0;
                switch (this.roomType) {
                    case 0:
                        type = 0;
                        break;
                    case 1:
                        type = 1;
                        break;
                    default:
                        type = 0;
                        break;
                }

                var pk = new CmdSendQuickPlayCustom();
                pk.putData(gamedata.selectedChanel, this.betRoom, type);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();
                sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(5);
                break;
            }
            case CreateRoomGUI.BTN_LEFT:
            {
                this.typePage.scrollToPage(this.typePage.getCurPageIndex() - 1);
                break;
            }
            case CreateRoomGUI.BTN_RIGHT:
            {
                this.typePage.scrollToPage(this.typePage.getCurPageIndex() + 1);
                break;
            }

            default :
            {

                break;
            }
        }
    },

    onPageListener: function () {
        if (this.roomType == this.typePage.getCurPageIndex()) return;

        this.roomType = this.typePage.getCurPageIndex();
        this.updateCreateRoom();
    },

    updateCreateRoom: function () {
        this.bets = [];
        this.bets = ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].bet;
        this.btnSlide.minX = this.dot[0].getPositionX();
        this.btnSlide.maxX = this.dot[1].getPositionX();
        this.btnSlide.listBetX = [];
        this.btnSlide.selectedBet = 0;
        this.btnSlide.listBetX.push({bet: this.bets[0], x: this.btnSlide.minX, betidx: 0});
        this.btnSlide.deltaX = (this.btnSlide.maxX - this.btnSlide.minX) / (this.bets.length - 1);
        cc.log("BET LENGTH " + this.bets.length);
        for (var i = 1; i < this.bets.length - 1; i++) {
            var xx = this.btnSlide.deltaX * i + this.btnSlide.minX;
            this.btnSlide.listBetX.push({bet: this.bets[i], x: xx, betidx: i});
            var dot = new ccui.ImageView("Other/CreateTableGUI/dot.png");
            dot.setPosition(xx, this.dot[0].getPositionY());
            this.bg.addChild(dot);
        }
        this.btnSlide.listBetX.push({
            bet: this.bets[this.bets.length - 1],
            x: this.btnSlide.maxX,
            betidx: this.bets.length - 1
        });

        var uGold = gamedata.userData.bean;
        var idx = 0;

        for (var i = this.bets.length - 1; i >= 0; i--) {
            var value;
            if(this.roomType == 0)
            {
                value = this.bets[i] * ChanelConfig.instance().betTime;
            }
            else
            {
                if(ChanelConfig.instance().getCurChanel() < 2)
                    value = this.bets[i] * ChanelConfig.instance().betTime;
                else
                    value = this.bets[i] * ChanelConfig.instance().betTimeAt;
            }
            cc.log("VALUE " + value);
            if (uGold >= value) {
                idx = i;
                break;
            }
        }
        this.btnSlide.setPositionX(this.btnSlide.listBetX[idx].x);
        this.btnSlide.lb.setString(StringUtility.standartNumber(this.bets[idx]));
        this.btnSlide.selectedBet = this.btnSlide.listBetX[idx].betidx;

        this.betRoom = this.btnSlide.selectedBet;
    },

    onBack: function () {
        this.onClose();
    }
});

CreateRoomGUI.className = "CreateRoomGUI";

CreateRoomGUI.BTN_CLOSE = 0;
CreateRoomGUI.BTN_LEFT = 1;
CreateRoomGUI.BTN_RIGHT = 2;
CreateRoomGUI.BTN_NUM_PLAYER = 3;
CreateRoomGUI.BTN_BIG_BET = 4;
CreateRoomGUI.BTN_ACCEPT = 5;
CreateRoomGUI.BTN_NUM_CHOOSE = 10;

var GUILoader = function () {

};

GUILoader.loadDialog = function () {
    if (CheckLogic.checkInBoard()) {
        return "Dialog.json";
    }
    return "Dialog.json";
};

var CoinFallEffect = cc.Layer.extend({

    ctor: function () {
        this._super();
        this.listCoin = [];
        this.numEffect = 0;
        this.numCoinNow = 0;
        this.callBack = null;
        this.timeCount = 0;
        this.positionCoin = [0, 0];
        this.isRun = false;
        this.isAutoRemove = false;
        this.typeEffect = 0;
        var cacheFrames = cc.spriteFrameCache;
        cacheFrames.addSpriteFrames("Particles/gold.plist", "Particles/gold.png");
    },

    setCallbackFinish: function (cb, target, data) {
        this.callBack = cb;
        this.callBack.target = target;
        this.callBack.data = data;
    },

    setPositionCoin: function (p) {
        this.positionCoin = p;
    },

    setAutoRemove: function (bool) {
        this.isAutoRemove = bool;
    },

    update: function (dt) {
        this.timeCount += dt;
        if (this.timeCount < 0)return;
        var coin;
        var isFinish = true;
        for (var i = this.numCoinNow; i < this.numEffect; i++) {
            coin = this.listCoin[i];
            if (coin.isVisible()) {
                coin.updateCoin(dt);
                isFinish = false;
            }
        }
        if (this.numCoinNow > 0) {
            if (this.timeCount >= CoinFallEffect.TIME_OUT_COIN) {
                var num = 10;
                if (this.typeEffect == CoinFallEffect.TYPE_FLOW) {
                    num = CoinFallEffect.NUM_COIN_EACH_TIME * this.timeCount;
                    this.timeCount = 0;
                }
                else if (this.typeEffect == CoinFallEffect.TYPE_RAIN) {
                    num = CoinFallEffect.NUM_COIN_RATE_RAIN * 0.05;
                    this.timeCount = CoinFallEffect.TIME_OUT_COIN - 0.05;
                }
                for (i = 0; i < num; i++) {
                    coin = this.listCoin[this.numCoinNow--];
                    coin.start();
                    if (this.numCoinNow == 0)break;
                }
            }
        }
        else {
            if (isFinish) {
                this.unscheduleUpdate();
                this.setVisible(false);
                this.isRun = false;
                if (this.callBack) {
                    this.callBack.apply(this.callBack.target, this.callBack.data);
                }
                if (this.isAutoRemove) {
                    this.removeEffect();
                }
            }
        }
    },

    startEffect: function (numEffect, type, delay) {
        if (this.isRun)this.stopEffect();
        delay = delay || 0;
        var coin;
        this.typeEffect = type;
        this.numEffect = numEffect;
        var i;
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
        this.timeCount = -delay;
        this.scheduleUpdate();
        this.setVisible(true);
        this.isRun = true;
        //this.runAction(cc.sequence(cc.delayTime(CoinFallEffect.DELAY_PLAY_SOUND + delay), cc.callFunc(gameSound.playCoinFall)));
    },

    stopEffect: function () {
        for (var i = 0; i < this.listCoin.length; i++) {
            this.listCoin[i].setVisible(false);
        }
        this.unscheduleUpdate();
    },

    removeEffect: function () {
        this.stopEffect();
        this.listCoin = [];
        this.removeFromParent(true);
    },

    getCoinItem: function () {
        return new CoinEffect();
    }
});

CoinFallEffect.RATE_SPEED_Y = 600;
CoinFallEffect.DEFAULT_SPEED_Y = 850;
CoinFallEffect.RATE_SPEED_X = 350;
CoinFallEffect.RATE_SPEED_R = 10;
CoinFallEffect.RATE_Position_X = 70;
CoinFallEffect.RATE_Position_Y = 70;
CoinFallEffect.MIN_SCALE = 0.32;
CoinFallEffect.MAX_SCALE = 0.42;
CoinFallEffect.RATE_JUMP_BACK = 0.5;
CoinFallEffect.GRAVITY = 2300;
CoinFallEffect.POSI = 90;
CoinFallEffect.NAME_ANIMATION_COIN = "gold";
CoinFallEffect.NUM_SPRITE_ANIMATION_COIN = 8;
CoinFallEffect.NUM_COIN_EACH_TIME = 100;
CoinFallEffect.NUM_COIN_RATE_RAIN = 100;
CoinFallEffect.TIME_ANIMATION_COIN = 0.3;
CoinFallEffect.TIME_OUT_COIN = 0.05;
CoinFallEffect.TYPE_FLOW = 0;
CoinFallEffect.TYPE_RAIN = 1;
CoinFallEffect.DELAY_PLAY_SOUND = 0.3;
CoinFallEffect.TIME_FADE_IN_COIN = 0.15;
CoinFallEffect.TIME_FADE_OUT_COIN = 0.15;

CoinFallEffect.STATE_COIN_NONE = 0;
CoinFallEffect.STATE_COIN_START = 1;
CoinFallEffect.STATE_COIN_COLLIDED = 2;
CoinFallEffect.STATE_COIN_FINISH = 3;