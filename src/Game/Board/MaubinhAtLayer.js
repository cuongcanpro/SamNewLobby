/**
 * Created by cuongleah on 3/7/2016.
 */
var MaubinhAtLayer = BaseLayer.extend({

    ctor: function () {
        cc.log("KHOI tao")

        this.labelChi = new Array(3);
        this.arrayCard = [];
        this.arrayCardArrange = new Array(13);
        this.arrayBgCard = new Array(13);
        this.moveCard = new Array(13);
        this.arrayBai = new Array(10);
        this.arrayBinh = new Array(10);
        this.arrayBaiImage = new Array(10);
        this.arrayBinhImage = new Array(10);
        this.isSort = false;
        this.canArrange = true;
        this.touchMoveCard = -1;
        this.saveTouchCard = -1;
        this.touchCard = -1;
        this.arrayId = new Array(13);
        this.dataBai = new Array(10);
        this.dataBinh = new Array(10);
        this.countHelp = -1;
        this.countShowHelp = 0;

        this._super("MaubinhAtLayer");
        this.initWithBinaryFile("BinhAt.json");
    },
    onEnter: function () {
        BaseLayer.prototype.onEnter.call(this);
        this.onUpdateGUI();
        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        });
        cc.eventManager.addListener(this._listener, this);
        cc.log("ON ENTER MAUBINH AT LAYER");
        this.bgDark.cleanup();
        this.bgDark.setOpacity(0);
        this.bgDark.runAction(cc.fadeTo(2.0, 200));
        if (this.time >= 0) {
            this.startTime(this.time);
        }
        // GameClient.getInstance().setTargetNotifyNetworkSlow(this);
    },
    onExit: function () {
        BaseLayer.prototype.onExit.call(this);
    },

    initGUI: function () {
        cc.log("INIT 1");
        this.panelCenter = this.getControl("panelCenter");
        this.bgCard = this.getControl("bgCard");
        this.bgDark = this.getControl("bgDark");
        this.initButton();
        this.effectImage = cc.Sprite.create("poker/tuQuy.png");
        this.addChild(this.effectImage);
        this.effectImage.setVisible(false);
        this.effectImage.setLocalZOrder(20);

        this.initGroupCard();
        this.initGroupTypeCard();
        for(var i = 0; i < 13; i++) {
            this.arrayBgCard[i].setVisible(false);
            this.arrayCardArrange[i].setVisible(false);
        }
        this.showGroupCard(false);
        this.btnCancel.setVisible(false);
        this.btnComplete.setVisible(false);
        this._layerColor.setVisible(true);
        this._layerColor.setOpacity(0);
        this._layerColor.runAction(cc.fadeTo(0.5, 150));

        this.btnCancel.setPosition(this.arrayCardArrange[9].getPositionX() + this.arrayCardArrange[9].getWidth() * 0.5 - this.btnCancel.getContentSize().width * 0.5,
            this.arrayCardArrange[9].getPositionY() + this.arrayCardArrange[9].getHeight() * 0.5 + this.btnCancel.getContentSize().height * 0.7);

        this.bgProgress = ccui.Helper.seekWidgetByName(this._layout, "bgProgress");
        var progress = new cc.Sprite("poker/progress.png");
        this._uiTimer = new cc.ProgressTimer(progress);
        this._uiTimer.setType(cc.ProgressTimer.TYPE_BAR);
        this.bgProgress.addChild(this._uiTimer);
        this._uiTimer.setMidpoint(cc.p(0, 0));
        this._uiTimer.setBarChangeRate(cc.p(0, 1));
        this._uiTimer.setPosition(cc.p(this.bgProgress.getContentSize().width * 0.5, this.bgProgress.getContentSize().height * 0.5));
        this.bgProgress.setVisible(false);
        this.stateSort = 0;
        if(cc.sys.localStorage.getItem("numLogin") != null) {
            this.numLogin = cc.sys.localStorage.getItem("numLogin");
        }
        else {
            this.numLogin = 0;
        }

        this.countHelp = cc.sys.localStorage.getItem("countShowHelp");
        if (!this.countHelp || this.countHelp == undefined) {
            this.countHelp = MaubinhAtLayer.STATE_HELP_1;
        }
        //   this.countHelp = 1;

        if(MaubinhGameData.getInstance().initData == false) {
            cc.sys.localStorage.setItem("numLogin", (this.numLogin + 1));
            MaubinhGameData.getInstance().initData = true;
        }
    },

    initButton: function () {
        this.btnCancel = this.customButton("btnCancel", MaubinhAtLayer.BTN_CANCEL);
        this.btnComplete = this.customButton("btnComplete", MaubinhAtLayer.BTN_COMPLETE);
        this.btnBao = this.customButton("btnBao", MaubinhAtLayer.BTN_BAO);
        this.btnBinh = this.customButton("btnBinh", MaubinhAtLayer.BTN_BINH);
        this.btnBai = this.customButton("btnBai", MaubinhAtLayer.BTN_BAI);
        this.btnBao.setVisible(false);
        this.btnBao.setLocalZOrder(20);

        var j = db.DBCCFactory.getInstance().buildArmatureNode("Bt_xepxong");
        j.setPosition(cc.p(this.btnComplete.getContentSize().width * 0.5, this.btnComplete.getContentSize().height * 0.5));
        j.getAnimation().gotoAndPlay("1", -1, -1, 0);
        this.btnComplete.addChild(j);

        j = db.DBCCFactory.getInstance().buildArmatureNode("Bt_huybo");
        j.setPosition(cc.p(this.btnCancel.getContentSize().width * 0.5, this.btnCancel.getContentSize().height * 0.5));
        j.getAnimation().gotoAndPlay("1", -1, -1, 0);
        this.btnCancel.addChild(j);

        j = db.DBCCFactory.getInstance().buildArmatureNode("Baomaubinh");
        j.setPosition(cc.p(this.btnBao.getContentSize().width * 0.5, this.btnBao.getContentSize().height * 0.5));
        j.getAnimation().gotoAndPlay("1", -1, -1, 0);
        this.btnBao.addChild(j);
    },

    initGroupCard: function () {
        var bgCenter = this.getControl("panelCenter");
        var card1 = ccui.Helper.seekWidgetByName(this._layout, "bgCardArrange");
        var height = card1.getContentSize().height * bgCenter.getScale();
        var width = card1.getContentSize().width * bgCenter.getScale();
        var startX = (bgCenter.getPositionX() - bgCenter.getContentSize().width * 0.5 * bgCenter.getScale()) + (card1.getPositionX() - card1.getContentSize().width * 0.5) * bgCenter.getScale();
        var startY = (bgCenter.getPositionY() - bgCenter.getContentSize().height * 0.5 * bgCenter.getScale()) + (card1.getPositionY() - card1.getContentSize().height * 0.5) * bgCenter.getScale();
        var i;

        for (var i = 0; i < 13; i++) {
            if(i < 5)
                this.arrayBgCard[i] = cc.Sprite.create("poker/bgBaiAt1.png");
            else
                this.arrayBgCard[i] = cc.Sprite.create("poker/bgBaiAt2.png");

            this.arrayCardArrange[i] = new MaubinhCard(52);
            var scale = width / 5 / this.arrayCardArrange[i].getContentSize().width;
            this.arrayCardArrange[i].setRootScale(scale);
            this.moveCard[i] = new MaubinhCard(50);
            this.moveCard[i].setRootScale(1.11 * scale);
            this.moveCard[i].setVisible(false);
            this.addChild(this.moveCard[i], 1);
            this.arrayBgCard[i].setScale(this.moveCard[i].rootScale * 1.00);
        }
        var padY = (height - this.arrayCardArrange[0].getHeight()) / 2;
        var padX = this.arrayCardArrange[0].getWidth();

        // khoi tao bgCard phia ben tren
        for (i = 10; i < 13; i++) {
            this.addChild(this.arrayBgCard[i]);
            this.arrayBgCard[i].setPosition((i - 10) * padX + this.arrayCardArrange[0].getWidth() * 0.5 + startX, this.arrayCardArrange[0].getHeight() * 0.5 + padY * 2 + startY);
        }
        for (i = 5; i < 10; i++) {
            this.addChild(this.arrayBgCard[i]);
            this.arrayBgCard[i].setPosition((i - 5) * padX + this.arrayCardArrange[0].getWidth() * 0.5 + startX, this.arrayCardArrange[0].getHeight() * 0.5 + padY + startY);
        }
        for (i = 0; i < 5; i++) {
            this.addChild(this.arrayBgCard[i]);
            this.arrayBgCard[i].setPosition(i * padX + this.arrayCardArrange[0].getWidth() * 0.5 + startX, this.arrayCardArrange[0].getHeight() * 0.5 + startY);
        }

        // khoi tao card phia ben tren
        for (i = 10; i < 13; i++) {
            this.addChild(this.arrayCardArrange[i]);
            this.arrayCardArrange[i].setPosition((i - 10) * padX + this.arrayCardArrange[0].getWidth() * 0.5 + startX, this.arrayCardArrange[0].getHeight() * 0.5 + padY * 2 + startY);
        }
        for (i = 5; i < 10; i++) {
            this.addChild(this.arrayCardArrange[i]);
            this.arrayCardArrange[i].setPosition((i - 5) * padX + this.arrayCardArrange[0].getWidth() * 0.5 + startX, this.arrayCardArrange[0].getHeight() * 0.5 + padY + startY);
        }
        for (i = 0; i < 5; i++) {
            this.addChild(this.arrayCardArrange[i]);
            this.arrayCardArrange[i].setPosition(i * padX + this.arrayCardArrange[0].getWidth() * 0.5 + startX, this.arrayCardArrange[0].getHeight() * 0.5 + startY);
        }

        // khoi tao 13 card ben duoi
        card1 = ccui.Helper.seekWidgetByName(this._layout, "bgCard");
        var sizeCard = cc.winSize.width * 1.00 / (13 - 12 * 0.35);
        var pad = sizeCard * -0.35;
        var randomCard = [23, 12, 21, 30, 19, 42, 15, 8, 41, 48, 3, 31, 50];
        for(var i = 0; i < 13; i++) {
            var id = Math.floor(Math.random() * 52);
            this.arrayCard[i] = new MaubinhCard(gamedata.gameLogic.players[0].cards[i]);
            // this.arrayCard[i] = new MaubinhCard(randomCard[i]);
            this.arrayCard[i].setRootScale(1);
            this.addChild(this.arrayCard[i]);
        }
        var scale = sizeCard / this.arrayCard[0].getWidth();
        for(var i = 0; i < 13; i++) {
            this.arrayCard[i].setRootScale(scale);
            this.arrayCard[i].setPosition(sizeCard * i + pad * i + sizeCard * 0.5, sizeCard * 0.75);
            this.arrayCard[i].setLocalZOrder(i);
            this.arrayCardArrange[i].setLocalZOrder(13 - i);
            this.arrayCard[i].saveInfoCard();
            this.arrayCardArrange[i].saveInfoCard();
        }
        this.bgCard.setScaleY(this.arrayCard[0].getHeight() * 1.2 / this.bgCard.getContentSize().height);

        // vung vuot vao man hinh de Sort bai
        this.bgTouch = cc.Sprite.create("poker/bgYellow.png");
        this._layout.addChild(this.bgTouch);
        var scaleX = cc.winSize.width / this.bgTouch.getContentSize().width;
        this.bgTouch.setScaleX(scaleX);
        var height = startY - 10 - sizeCard * 1.3;
        var scaleY = height / this.bgTouch.getContentSize().height;
        this.bgTouch.setScaleY(scaleY);
        this.bgTouch.setPosition(cc.winSize.width * 0.5, startY - 10 - height * 0.5);
        this.bgTouch.setVisible(false);
    },

    // show loai cua bo bai hay cua tung chi o goc phai man hinh
    initGroupTypeCard: function () {
        this.bgGroupCard = ccui.Helper.seekWidgetByName(this._layout, "bgGroupCard");
        var pad = 25;
        for(var i = 0; i < 9; i++) {
            var divide = cc.Sprite.create("poker/divide.png");
            this.bgGroupCard.addChild(divide);
            divide.setPosition(this.bgGroupCard.getContentSize().width * 0.5, this.bgGroupCard.getContentSize().height * 0.83 - pad * i);
        }
        for(var i = 0; i < 10; i++) {
            this.arrayBai[i] = new cc.LabelTTF(LocalizedString.to("GROUPKIND_" + i), "Arial", 15);
            this.arrayBai[i].setColor(cc.color(150, 150, 150, 250));
            this.bgGroupCard.addChild(this.arrayBai[i]);
            this.arrayBai[i].x = this.bgGroupCard.getContentSize().width * 0.5;
            this.arrayBai[i].y = this.bgGroupCard.getContentSize().height * 0.87 - pad * i;

            this.arrayBinh[i] = new cc.LabelTTF(LocalizedString.to("CARDKIND_" + i), "Arial", 15);
            this.arrayBinh[i].setColor(cc.color(200, 200, 200, 255));
            this.bgGroupCard.addChild(this.arrayBinh[i]);
            this.arrayBinh[i].setPosition(this.arrayBai[i].getPosition());

            this.arrayBaiImage[i] = cc.Sprite.create("poker/typechi_" + i + ".png");
            this.bgGroupCard.addChild(this.arrayBaiImage[i]);
            this.arrayBaiImage[i].setPosition(this.arrayBai[i].getPosition());

            this.arrayBinhImage[i] = cc.Sprite.create("poker/binh_" + i + ".png");
            this.bgGroupCard.addChild(this.arrayBinhImage[i]);
            this.arrayBinhImage[i].setPosition(this.arrayBai[i].getPosition());
            this.dataBai[i] = 0;
            this.dataBinh[i] = 0;
        }
        this.stateGroup = MaubinhAtLayer.GROUP_BAI;
    },

    startTime:function (time){
        cc.log("START TIME ******* " + time);
        this.time = time;
        if (cc.sys.isNative) this._uiTimer.stopAllActions();
        this._uiTimer.setPercentage(100);
        var action = cc.progressTo(time, 0);
        this._uiTimer.runAction(action);
        this.bgProgress.setVisible(true);
    },

    showGroupCard: function(visible){
        this.bgGroupCard.setVisible(visible);
        this.btnBai.setVisible(visible);
        this.btnBinh.setVisible(visible);
        if(visible) {
            if (this.stateGroup == MaubinhAtLayer.GROUP_BAI) {
                this.btnBai.loadTextures("poker/btnBoBaiSelect.png", "poker/btnBoBaiSelect.png");
                this.btnBinh.loadTextures("poker/btnBinh.png", "poker/btnBinh.png");
                for(var i = 0; i < 10; i++)
                {
                    this.arrayBinh[i].setVisible(false);
                    this.arrayBinhImage[i].setVisible(false);
                    if(this.dataBai[i] == 0)
                    {
                        this.arrayBai[i].setVisible(true);
                        this.arrayBaiImage[i].setVisible(false);
                    }
                    else
                    {
                        this.arrayBai[i].setVisible(false);
                        this.arrayBaiImage[i].setVisible(true);
                    }
                }
            }
            else
            {
                this.btnBai.loadTextures("poker/btnBoBai.png", "poker/btnBoBai.png");
                this.btnBinh.loadTextures("poker/btnBinhSelect.png", "poker/btnBinhSelect.png");
                for(var i = 0; i < 10; i++)
                {
                    this.arrayBai[i].setVisible(false);
                    this.arrayBaiImage[i].setVisible(false);
                    if(this.dataBinh[i] == 0)
                    {
                        this.arrayBinh[i].setVisible(true);
                        this.arrayBinhImage[i].setVisible(false);
                    }
                    else
                    {
                        this.arrayBinh[i].setVisible(false);
                        this.arrayBinhImage[i].setVisible(true);
                    }
                }
            }
        }
    },

    onTouchBegan: function(touch, event) {
        if (!cc.sys.isNative && touch.getID() === undefined){
            touch._id = 0;
        }
        if (touch.getID() != 0) {
            return true;
        }

        if (this.isSort == true || this.canArrange == false)
            return true;

        var target = event.getCurrentTarget();
        var point = touch.getLocation();

        target.touchCard = target.getLocationDown(point, true);
        if(target.touchCard >= 0)
            return true;

        var location = target.getLocation(point, true, -1);
        if(location >= 0) {
            if (target.arrayCardArrange[location].id != 52) {
                target.arrayCardArrange[location].setColor(cc.color(242, 245, 181));
            }
            target.touchCard = 13 + location;
            return true;
        }
        return true;
    },

    onTouchMoved: function(touch, event) {

        if (touch.getID() != 0)
            return;
        var target = event.getCurrentTarget();
        if (Math.sqrt(touch.getDelta().x * touch.getDelta().x + touch.getDelta().y * touch.getDelta().y) < target.arrayCard[0].getWidth() * 0.016)
            return;
        if (target.isSort || target.canArrange == false)
            return;

        if(target.touchCard >= 0 && target.touchCard < 13)
            return true;

        if(target.touchCard >= 0) {
            target.touchMoveCard = target.touchCard;
            target.touchCard = -1;
        }

        if(target.touchMoveCard >= 0) {
            var convert = target.touchMoveCard % 13;
            if(target.touchMoveCard < 13) {
                target.arrayCard[convert].setPosition(touch.getLocation().x, touch.getLocation().y);
                target.arrayCard[convert].setLocalZOrder(20);
            }
            else {
                target.arrayCardArrange[convert].setPosition(touch.getLocation().x, touch.getLocation().y);
                target.arrayCardArrange[convert].setLocalZOrder(20);
            }
            for (var i = 0; i < 13; i++) {
                target.arrayCardArrange[i].setDark(false);
                target.arrayCard[i].setDark(false);
            }

            var location = target.getLocation(touch.getLocation(), true, convert);
            if (location >= 0) {
                target.arrayCardArrange[location].setDark(true);
            }
            else {
                location = target.getLocationDown(touch.getLocation(), true);
                if (location >= 0) {
                    target.arrayCard[location].setDark(true);
                }
            }
        }
        if (target.touchCard < 0 && target.touchMoveCard < 0) {
            // var i = 0;
            // for (i = 0;  i < 13; i++)
            //     if (target.moveCard[i].isVisible())
            //         break;
            // if (i == 13)
            // {
                if (Math.abs(touch.getDelta().x) > 20)
                {
                    target.sortCard();
                }
            // }
        }
        target.saveTouchCard = -1;
    },

    onTouchEnded: function(touch, event) {
        var target = event.getCurrentTarget();

        if (touch.getID() != 0) {
            target.isSort = false;
            return;
        }
        if (target.isSort || target.canArrange == false)
            return;

        var setDark = true;
        if (target.touchCard >= 0) { // chi co cham vao quan bai, khong move quan bai
            if (target.checkEnoughCard()) {
                target.defineChiGoal(target.touchCard);
            }
            if (target.touchCard < 13) {
                // bay quan card tu duoi len tren
                target.moveCardToCenter(target.arrayCard[target.touchCard]);
                target.saveTouchCard = -1;
            }
            else {
                if (target.saveTouchCard < 0) {
                    target.saveTouchCard = target.touchCard;
                    setDark = false;
                }
                else if (target.saveTouchCard != target.touchCard) {
                    // doi cho 2 quan bai
                    var convert1 = target.saveTouchCard % 13;
                    var convert2 = target.touchCard % 13;
                    target.swapCard(target.arrayCardArrange[convert1], target.arrayCardArrange[convert2]);
                    target.saveTouchCard = -1;
                }
                else {
                    // dua quan card tu ben tren xuong duoi
                    var convert1 = target.touchCard % 13;
                    target.moveCardToBottom(target.arrayCardArrange[convert1]);
                    target.saveTouchCard = -1;
                    target.touchCard = -1;
                }
            }
            target.checkShowButton(setDark);
        }
        else if (target.touchMoveCard >= 0) { // co di chuyen quan bai
            var location = target.getLocation(touch.getLocation(), false, target.touchMoveCard);
            if (location != -1) { // tim duoc vi tri thay the o bo bai ben tren
                if (target.checkEnoughCard()) {
                    target.defineChiGoal(location);
                }

                if (target.arrayCardArrange[location].isVisible()) {
                    var convert = target.touchMoveCard % 13;
                    if (target.touchMoveCard < 13) {
                        // dao cho quan bai ben tren va ben duoi
                        target.swapCard(target.arrayCardArrange[location], target.arrayCard[target.touchMoveCard]);
                    }
                    else {
                        // dao cho 2 quan bai ben tren
                        var convert1 = target.touchMoveCard % 13;
                        var convert2 = location % 13;
                        target.swapCard(target.arrayCardArrange[convert1], target.arrayCardArrange[convert2]);
                        target.saveTouchCard = -1;
                    }
                }
                else {
                    // di chuyen quan bai den vi tri trong
                    cc.log("DI CHUYEN DEN QUAN BAI TRONG ");
                    var convert = target.touchMoveCard % 13;
                    if (target.touchMoveCard >= 13) {
                        if (convert != location) {
                            target.arrayCardArrange[convert].setVisible(false);
                            target.arrayCardArrange[location].copyCard(target.arrayCardArrange[convert]);
                            target.arrayCardArrange[convert].setPosition(target.arrayCardArrange[convert].defaultPos);
                        }
                    }
                    else {
                        target.arrayCard[convert].setVisible(false);
                        target.arrayCardArrange[location].copyCard(target.arrayCard[convert]);
                        target.arrayCard[convert].setPosition(target.arrayCard[convert].defaultPos);
                    }
                    target.arrayCardArrange[location].moveToDefault(0.2);
                }
            }
            else { // xet xuong bo bai ben duoi
                var convert = target.touchMoveCard % 13;
                var location = target.getLocationDown(touch.getLocation(), false);
                if (target.touchMoveCard < 13) {
                    if (location < 0) {
                        target.arrayCard[convert].moveToDefault(0.2);
                    }
                    else if (target.arrayCard[location].isVisible()) {
                        // doi cho 2 quan bai ben duoi
                        var convert1 = target.touchMoveCard;
                        target.swapCard(target.arrayCard[convert1], target.arrayCard[location]);
                        target.saveTouchCard = -1;
                    }
                    else {
                        // di chuyen quan card vao vi tri trong
                        target.arrayCard[target.touchMoveCard].setVisible(false);
                        target.arrayCard[location].setIdCard(target.arrayCard[target.touchMoveCard].id);
                        target.arrayCard[location].moveToDefault(0.2);
                        target.arrayCard[target.touchMoveCard].setPosition(target.arrayCard[target.touchMoveCard].defaultPos);
                    }
                }
                else {
                    if (location >= 0) {
                        if (target.arrayCard[location].isVisible()) {
                            // doi cho 2 quan bai tren duoi
                            target.swapCard(target.arrayCard[location], target.arrayCardArrange[convert]);
                        }
                        else {
                            // dua quan bai ben tren vao vi tri trong o ben duoi
                            target.arrayCardArrange[convert].setVisible(false);
                            target.arrayCard[location].copyCard(target.arrayCardArrange[convert]);
                            target.arrayCard[location].moveToDefault(0.2);
                            target.arrayCardArrange[convert].setPosition(target.arrayCardArrange[convert].defaultPos);
                        }
                    }
                    else {
                        // quay lai vi tri cu
                        target.arrayCardArrange[convert].moveToDefault(0.2);
                    }
                }
            }
            if (setDark) {
                for (var i = 0; i < 13; i++) {
                    target.arrayCardArrange[i].setDark(false);
                    target.arrayCard[i].setDark(false);
                }
            }
            target.checkShowButton(setDark);
        }
        else {
            if(target.saveTouchCard >= 0)
                target.arrayCardArrange[target.saveTouchCard % 13].setDark(false);
            target.saveTouchCard = -1;
        }
        target.touchCard = -1;
        target.touchMoveCard = -1;
    },

    checkShowButton: function (setDark) {
        if (this.checkEnoughCard()) {
            if (setDark) {
                this.highLightCard(true);
                this.btnComplete.setVisible(true);
                if(this.btnBao.isVisible())
                    this.btnComplete.setPosition(this.btnCancel.getPositionX(), this.btnCancel.getPositionY() + this.btnCancel.getContentSize().height * 1.1);
                else
                    this.btnComplete.setPosition(cc.winSize.width * 0.5, this.btnBao.getPositionY() + this.btnComplete.getContentSize().height * 0.2);
            }
        }
        else {
            this.btnComplete.setVisible(false);
        }
        this.btnCancel.setVisible(false);
        for (var i = 0; i < 13; i++) {
            if (this.arrayCardArrange[i].isVisible()) {
                this.btnCancel.setVisible(true);
                break;
            }
        }
    },

    defineChiGoal: function (chi) {
        if (chi < 5)
            this.chiGoal = 1;
        else if (chi < 10)
            this.chiGoal = 2;
        else
            this.chiGoal = 3;
    },

    moveCardToCenter: function (card) {
        var cardMove;
        for (var i = 0; i < 13; i++) {
            if (!this.arrayCardArrange[i].isVisible()) {
                cardMove = this.arrayCardArrange[i];
                break;
            }
        }
        cardMove.copyCard(card);
        cardMove.setVisible(true);
        cardMove.moveToDefault(0.2);
        cardMove.setDark(false);
        card.setVisible(false);
        if (this.countHelp == MaubinhAtLayer.STATE_HELP_2) {
            cc.sys.localStorage.setItem("countShowHelp", MaubinhAtLayer.STATE_HELP_3);
            this.countHelp = MaubinhAtLayer.STATE_HELP_3;
            this.hideHelp();
        }
    },

    moveCardToBottom: function (card) {
        var cardMove;
        for (var i = 0; i < 13; i++) {
            if (!this.arrayCard[i].isVisible()) {
                cardMove = this.arrayCard[i];
                break;
            }
        }
        cardMove.copyCard(card);
        cardMove.setVisible(true);
        cardMove.moveToDefault(0.2);
        cardMove.setDark(false);
        card.setVisible(false);
        if (this.countHelp == MaubinhAtLayer.STATE_HELP_4)
            this.hideHelp();
    },

    swapCard: function (card1, card2) {
        card1.setLocalZOrder(0);
        card2.setLocalZOrder(0);
        var saveId = card1.id;
        var savePos = card1.getPosition();
        var saveScale = card1.getScale();
        card1.copyCard(card2);
        card2.setIdCard(saveId);
        card2.setPosition(savePos);
        card2.setScale(saveScale);
        card1.moveToDefault(0.2);
        card2.moveToDefault(0.2);
    },

    // lay vi tri quan card o 13 quan bai ben tren
    getLocation: function( touch, needVisible, exceptPos) {
        var i, j, num, stt;
        for(i = 0; i <= 2; i++) {
            if(i == 2)
                num = 3;
            else
                num = 5;
            for(j = num - 1; j >= 0; j-- ) {
                stt = i * 5 + j;
                var card = this.arrayCardArrange[stt];
                if (stt != exceptPos % 13) {
                    if (card.getPositionX() - card.getWidth() / 2 < touch.x && card.getPositionX() + card.getWidth() / 2 > touch.x
                        && card.getPositionY() - card.getHeight() / 2 < touch.y && card.getPositionY() + card.getHeight() / 2 > touch.y) {
                        if (needVisible) {
                            if (card.isVisible()) {
                                return stt;
                            }
                        }
                        else {
                            return stt;
                        }
                    }
                }
            }
        }
        return -1;
    },

    // kiem tra xem da di chuyen du 13 quan bai len ben tren hay chua
    checkEnoughCard: function(){
        for (var i = 0; i < 13; i++) {
            if (!this.arrayCardArrange[i].isVisible())
                return false;
        }
        if (this.countHelp == MaubinhAtLayer.STATE_HELP_3) {
            this.hideHelp();
            this.showHelp();
            this.countHelp = MaubinhAtLayer.STATE_HELP_4;
            cc.sys.localStorage.setItem("countShowHelp", MaubinhAtLayer.STATE_HELP_4);
        }
        else {
            this.hideHelp();
        }
        return true;
    },

    // lay vi tri di chuyen card o phia 13 quan bai ben duoi
    getLocationDown: function( point, needVisible ) {
        for(var i = 12; i >= 0; i--) {
            var card = this.arrayCard[i];
            if(card.getPositionX() - card.getWidth() / 2 < point.x && card.getPositionX() + card.getWidth() / 2 > point.x
                && card.getPositionY() - card.getHeight() / 2 < point.y && card.getPositionY() + card.getHeight() / 2 > point.y) {
                if (needVisible) {
                    if(card.isVisible()) {
                        return i;
                    }
                }
                else {
                    return i;
                }
            }
        }
        return -1;
    },

    sortCard: function() {
        if (this.isSort)
            return;
        this.isSort = true;
        cc.log("SORT CARD ");
        if (this.countHelp == MaubinhAtLayer.STATE_HELP_1) {
            cc.sys.localStorage.setItem("countShowHelp", MaubinhAtLayer.STATE_HELP_2);
            this.hideHelp();
            this.countHelp = MaubinhAtLayer.STATE_HELP_2;
            this.showHelp();
        }
        else if (this.countHelp == MaubinhAtLayer.STATE_HELP_2 && (!this.tut || !this.tut.isVisible())) {
            this.hideHelp();
            this.showHelp();
        }

        // xep tu nho den lon
        var arrayArrange = new Array(13); // mang luu lai ID cua cacs quan card duoc xap xep
        var arraySavePos = new Array(13); // mang luu lai vi tri ban dau cua tung quan card
        var count = 0;
        for (var i = 0; i < 13; i++)
            arrayArrange[i] = -1;
        for (var i = 0; i < 13; i++) {
            if (this.arrayCard[i].isVisible()) {
                arrayArrange[count] = this.arrayCard[i].id;
                count++;
            }
        }
        this.sortArrayId(arrayArrange, count);

        for (var i = 0; i < count; i++) {
            for (var j = 0; j < 13; j++) {
                if (this.arrayCard[j].isVisible() && arrayArrange[i] == this.arrayCard[j].id) {
                    arraySavePos[i] = j;
                }
            }
        }
        cc.log("ARRAY SAVE POS " + JSON.stringify(arraySavePos));
        for (var i = 0; i < 13; i++) {
            this.arrayCard[i].setVisible(false);
            if (i < count) {
                this.arrayCard[i].setVisible(true);
                this.arrayCard[i].setIdCard(arrayArrange[i]);
                this.arrayCard[i].setPosition(this.arrayCard[arraySavePos[i]].defaultPos);
                this.arrayCard[i].runAction(cc.moveTo(0.3, this.arrayCard[i].defaultPos));
            }
        }
        this.stateSort = 1 - this.stateSort;
        this.runAction(cc.sequence(cc.delayTime(0.35), cc.callFunc(this.callbackSortCard.bind(this))));
    },

    callbackSortCard: function () {
        this.isSort = false;
    },

    sortArrayId: function (arrayArrange, count) {
        for (var i = 0; i < count - 1; i++) {
            for (var j = i + 1; j < count; j++) {
                if (this.stateSort == 0) {
                    if (arrayArrange[i] > arrayArrange[j]) {
                        var temp = arrayArrange[j];
                        arrayArrange[j] = arrayArrange[i];
                        arrayArrange[i] = temp;
                    }
                }
                else {
                    var remaneti = arrayArrange[i] % 4;
                    var remanetj = arrayArrange[j] % 4;

                    remaneti = this.convert(remaneti);
                    remanetj = this.convert(remanetj);

                    if (remaneti > remanetj || (remaneti == remanetj && arrayArrange[i] > arrayArrange[j])) {
                        var temp = arrayArrange[j];
                        arrayArrange[j] = arrayArrange[i];
                        arrayArrange[i] = temp;
                    }
                }
            }
        }
    },
    // ham danh gia do manh yeu cua mot chat: ro co bich tep (theo mong muon cua Design) de hien thi khi Sort Card
    convert: function(id) {
        switch (id) {
            case 0:
                return 0;
            case 1:
                return 2;
            case 2:
                return 1;
            case 3:
                return 3;
            default:
                break;
        }
    },

    highLightCard: function(sound) {
        this.effectImage.setVisible(false);
        var playerCard = new MaubinhPlayerCard();
        //  vector<MaubinhGroupCardLogic*> groupCard;
        var i, j, num;
        this.effectImage.setVisible(false);
        for (i = 12; i >= 0; i--) {
            var group = new MaubinhGroupCardLogic();
            group.AddCardByID(this.arrayCardArrange[i].id);
            playerCard.AddGroupCard(group);
        }

        playerCard.SapXepTruocSoBai();
        var cardKind = playerCard.GetPlayerCardsKindBao(false, true);
        cc.log("Cardkind " + cardKind);
        var isEffect = false;
        var mauBinh = false;
        var isLung = playerCard.isLung();
        var showBinh = false;
        this.checkBoBai(mauBinh, cardKind, playerCard, isEffect, isLung);
        this.playSoundChi(mauBinh, sound, playerCard);
        if (!isLung)
            this.checkTypeChi(mauBinh, showBinh, isEffect, playerCard);

        if (showBinh) {
            this.stateGroup = MaubinhAtLayer.GROUP_BINH;
            this.showGroupCard(true);
        }
        else {
            this.stateGroup = MaubinhAtLayer.GROUP_BAI;
            this.showGroupCard(true);
        }
        this.showDarkCard(mauBinh, cardKind, playerCard);
    },

    // hien thi loai bo bai xem co mau binh hay khong
    checkBoBai: function (mauBinh, cardKind, playerCard, isEffect, isLung) {
        for (var i = 0; i < 10; i++) {
            this.dataBai[i] = 0;
            this.dataBinh[i] = 0;
        }
        switch (cardKind) {
            case MaubinhPlayerCard.EM_LUCPHEBON:
                this.dataBinh[MaubinhAtLayer.GROUP_LUC_PHE_BON] = 1;
                break;
            case MaubinhPlayerCard.EM_SANHRONG:
                this.dataBinh[MaubinhAtLayer.GROUP_SANH_RONG] = 1;
                break;
            case MaubinhPlayerCard.EM_3SANH:
                this.dataBinh[MaubinhAtLayer.GROUP_BA_CAI_SANH] = 1;
                break;
            case MaubinhPlayerCard.EM_3THUNG:
                this.dataBinh[MaubinhAtLayer.GROUP_BA_CAI_THUNG] = 1;
                break;
            case MaubinhPlayerCard.EM_MUOI_BA:
                this.dataBinh[MaubinhAtLayer.GROUP_MUOI_BA] = 1;
                break;
            case MaubinhPlayerCard.EM_MUOI_HAI:
                this.dataBinh[MaubinhAtLayer.GROUP_MUOI_HAI] = 1;
                break;
            default:
                break;
        }
        if (cardKind == MaubinhPlayerCard.EM_LUCPHEBON || cardKind == MaubinhPlayerCard.EM_SANHRONG || cardKind == MaubinhPlayerCard.EM_3SANH
            || cardKind == MaubinhPlayerCard.EM_3THUNG || cardKind == MaubinhPlayerCard.EM_MUOI_BA || cardKind == MaubinhPlayerCard.EM_MUOI_HAI) {
            this.stateGroup = MaubinhAtLayer.GROUP_BINH;
            this.showGroupCard(true);
            showBinh = true;
            this.btnBao.setVisible(true);
        }
        else
        {
            this.dataBai[playerCard.ChiCuoi.GetGroupKind()] = 1;
            this.dataBai[playerCard.ChiGiua.GetGroupKind()] = 1;
            this.dataBai[playerCard.ChiDau.GetGroupKind()] = 1;
            this.btnBao.setVisible(false);
        }
        this.dataBai[playerCard.ChiCuoi.GetGroupKind()] = 1;
        this.dataBai[playerCard.ChiGiua.GetGroupKind()] = 1;
        this.dataBai[playerCard.ChiDau.GetGroupKind()] = 1;
        if (isLung)
        {
            this.effectBoBai("poker/binhLungBig.png");
            mauBinh = false;
            isEffect = true;
        }
    },

    // thong bao loai cua tung chi khi di chuyen quan Card
    playSoundChi: function (mauBinh, sound, playerCard) {

        if (!mauBinh && sound)
        {
            var typeGroup = -1;
            switch (this.chiGoal)
            {
                case 1:
                    typeGroup = playerCard.ChiCuoi.GetGroupKind();
                    break;
                case 2:
                    typeGroup = playerCard.ChiGiua.GetGroupKind();
                    break;
                case 3:
                    typeGroup = playerCard.ChiDau.GetGroupKind();
                    break;
                default:
                    break;
            }

            switch (typeGroup)
            {
                case MaubinhGroupCardLogic.EG_MAUTHAU:
                    gameSound.playSoundxepbai_mauthau();
                    break;
                case MaubinhGroupCardLogic.EG_DOI:
                    gameSound.playSoundxepbai_doi();
                    break;
                case MaubinhGroupCardLogic.EG_THU:
                    gameSound.playSoundxepbai_thu();
                    break;
                case MaubinhGroupCardLogic.EG_SAMCO:
                    gameSound.playSoundxepbai_samchi();
                    break;
                case MaubinhGroupCardLogic.EG_SANH:
                    gameSound.playSoundxepbai_sanh();
                    break;
                case MaubinhGroupCardLogic.EG_THUNG:
                    gameSound.playSoundxepbai_thung();
                    break;
                case MaubinhGroupCardLogic.EG_TUQUI:
                    gameSound.playSoundxepbai_tuquy();
                    break;
                case MaubinhGroupCardLogic.EG_THUNGPHASANH:
                    gameSound.playSoundxepbai_thungphasanh();
                    break;
                case MaubinhGroupCardLogic.EG_CULU:
                    gameSound.playSoundxepbai_culu();
                    break;
                default:
                    break;
            }
        }
    },

    // hien thi loai cua tung loai bai cua tung chi 1
    checkTypeChi: function (mauBinh, showBinh, isEffect, playerCard) {
        //uu tien hien thi effect dac biet cua chi giua
        switch (playerCard.ChiGiua.GetGroupKind()) {
            case MaubinhGroupCardLogic.EG_TUQUI:
                if (!isEffect)
                {
                    this.effectBoBai("poker/tuQuyChi2.png");
                    this.effectParticle();
                    isEffect = true;
                }
                break;
            case MaubinhGroupCardLogic.EG_THUNGPHASANH:
                if (!isEffect)
                {
                    isEffect = true;
                    this.effectBoBai("poker/thungPhaSanhChi2.png");
                    this.effectParticle();
                }
                break;
        }
        switch (playerCard.ChiCuoi.GetGroupKind()) {
            case MaubinhGroupCardLogic.EG_THUNGPHASANH:
                if (!isEffect) {
                    isEffect = true;
                    this.effectBoBai("poker/thungPhaSanh.png");
                    this.effectParticle();
                }
                if (mauBinh) {
                    // con mau binh so trang hay khong
                    //	bgCompareChi.visible = true;
                    //compare.setVisible(false);
                    //compareBinh.setVisible(true);
                    //compareChi.setVisible(true);
                }
                break;
            case MaubinhGroupCardLogic.EG_TUQUI:
                if (!isEffect) {
                    isEffect = true;
                    this.effectBoBai("poker/tuQuy.png");
                    this.effectParticle();
                }
                break;
        }
        switch (playerCard.ChiDau.GetGroupKind()) {
            case MaubinhGroupCardLogic.EG_SAMCO:
                if (!isEffect) {
                    isEffect = true;
                    this.effectBoBai("poker/xamChiCuoi.png");
                    this.effectParticle();
                }
                this.dataBinh[MaubinhAtLayer.GROUP_SAM_CHI_CUOI] = 1;
                showBinh = true;
                break;
        }
        switch (playerCard.ChiGiua.GetGroupKind()) {
            case MaubinhGroupCardLogic.EG_CULU:
                if (!isEffect)
                {
                    this.effectBoBai("poker/cuLuChi2.png");
                    this.effectParticle();
                    isEffect = true;
                }
                this.dataBinh[MaubinhAtLayer.GROUP_CU_LU_CHI_HAI] = 1;
                showBinh = true;
                break;
            case MaubinhGroupCardLogic.EG_TUQUI:
                if (!isEffect)
                {
                    this.effectBoBai("poker/tuQuyChi2.png");
                    this.effectParticle();
                    isEffect = true;
                }
                this.dataBinh[MaubinhAtLayer.GROUP_TU_QUY_CHI_HAI] = 1;
                showBinh = true;
                break;
            case MaubinhGroupCardLogic.EG_THUNGPHASANH:
                if (!isEffect)
                {
                    this.effectBoBai("poker/thungPhaSanhChi2.png");
                    this.effectParticle();
                    isEffect = true;
                }
                this.dataBinh[MaubinhAtLayer.GROUP_THUNG_PHA_SANH_CHI_HAI] = 1;
                showBinh = true;
                break;
        }
    },

    // lam toi nhung quan bai tao thanh bo trong chi
    showDarkCard: function (mauBinh, cardKind, playerCard) {
        var i, j;
        cc.log("MAU BINH " + mauBinh + " lfdsjf ");
        for (i = 0; i < 13; i++)
            this.arrayCardArrange[i].setDark(true);
        if (cardKind == MaubinhPlayerCard.EM_BINHLUNG) {
            for (i = 0; i < 13; i++)
                this.arrayCardArrange[i].setDark(false);
            return;
        }
        if (cardKind == MaubinhPlayerCard.EM_SANHRONG || cardKind == MaubinhPlayerCard.EM_3SANH || cardKind == MaubinhPlayerCard.EM_3THUNG || cardKind == MaubinhPlayerCard.EM_LUCPHEBON || cardKind == MaubinhPlayerCard.EM_MUOI_HAI || cardKind == MaubinhPlayerCard.EM_MUOI_BA) {
            for (i = 0; i < 13; i++)
                this.arrayCardArrange[i].setDark(true);
            return;
        }
        cc.log("DU MA NO CHU SAO KO VAO DAY ");
        var gc = null;
        if (!mauBinh) {
            if (playerCard.ChiDau.GetGroupKind() != MaubinhGroupCardLogic.EG_SAMCO) {
                switch (playerCard.ChiDau.GetGroupKind()) {
                    case MaubinhGroupCardLogic.EG_MAUTHAU:
                        gc = playerCard.ChiDau.getMaxCard();
                        break;
                    case MaubinhGroupCardLogic.EG_THU:
                        gc = playerCard.ChiDau.get2DoiKhacNhau();
                        break;
                    case MaubinhGroupCardLogic.EG_DOI:
                        gc = playerCard.ChiDau.getPair();
                        break;
                }
                if (gc) {
                    for (i = 0; i < 3; i++) {
                        var stt = 10 + i;
                        for (j = 0; j < gc.Cards.length; j++) {
                            if (gc.Cards[j].ID == this.arrayCardArrange[stt].id) {
                                break;
                            }
                        }
                        if (j == gc.Cards.length) {
                            this.arrayCardArrange[stt].setDark(false);
                        }
                    }
                }
            }
            this.showDarkCardBigChi(1, playerCard); // chi giua
            this.showDarkCardBigChi(0, playerCard); // chi cuoi
        }
    },

    showDarkCardBigChi: function (chi, playerCard) {
        var gc = null;
        var groupChi;
        if (chi == 1)
            groupChi = playerCard.ChiGiua;
        else
            groupChi = playerCard.ChiCuoi;
        if (groupChi.GetGroupKind() != MaubinhGroupCardLogic.EG_THUNGPHASANH && groupChi.GetGroupKind() != MaubinhGroupCardLogic.EG_THUNG && groupChi.GetGroupKind() != MaubinhGroupCardLogic.EG_SANH && groupChi.GetGroupKind() != MaubinhGroupCardLogic.EG_CULU) {
            switch (groupChi.GetGroupKind()) {
                case MaubinhGroupCardLogic.EG_MAUTHAU:
                    gc = groupChi.getMaxCard();
                    break;
                case MaubinhGroupCardLogic.EG_THU:
                    gc = groupChi.get2DoiKhacNhau();
                    break;
                case MaubinhGroupCardLogic.EG_DOI:
                    gc = groupChi.getPair();
                    break;
                case MaubinhGroupCardLogic.EG_SAMCO:
                    gc = groupChi.getXamChi();
                    break;
                case MaubinhGroupCardLogic.EG_TUQUI:
                    gc = groupChi.getFour();
                    break;
            }
            if (gc) {
                for (var i = 0; i < 5; i++) {
                    var stt = 5 * chi + i;
                    for (var j = 0; j < gc.Cards.length; j++) {
                        if (gc.Cards[j].ID == this.arrayCardArrange[stt].id) {
                            break;
                        }
                    }
                    if (j == gc.Cards.length) {
                        this.arrayCardArrange[stt].setDark(false);
                    }
                }
            }
        }
    },

    effectBoBai: function(resource) {
        cc.log("resource " + resource);
        this.effectImage.removeFromParent(true);
        this.effectImage = cc.Sprite.create(resource);
        this.addChild(this.effectImage);
        this.effectImage.setVisible(true);
        this.effectImage.setPosition(this.arrayCardArrange[2].defaultPos.x, this.arrayCardArrange[2].defaultPos.y - 10);
        this.effectImage.setScale(0, 1);
        this.effectImage.runAction(cc.scaleTo(0.2, this.panelCenter.getScale(), this.panelCenter.getScale()));
        this.effectImage.setLocalZOrder(20);
    },

    effectParticle: function(){
        var particle = new cc.ParticleSystem("Particles/Flower.plist");
        particle.setLocalZOrder(5);
        this.addChild(particle);
        particle.setPosition(cc.p(cc.winSize.width * 0.5, this.panelCenter.getPositionY()));
    },

    cancelArrange: function(){
        for (var i = 0; i < 13; i++) {
            if (this.arrayCardArrange[i].isVisible()) {
                this.moveCardToBottom(this.arrayCardArrange[i]);
            }
        }
        this.btnCancel.setVisible(false);
        this.btnComplete.setVisible(false);
        this.effectImage.setVisible(false);
        for (var i = 0; i < 10; i++) {
            this.dataBai[i] = 0;
        }
        this.stateGroup = MaubinhAtLayer.GROUP_BAI;
        this.showGroupCard(true);
    },

    getIdCard: function() {
        var i;
        var j = 12;
        for (i = 0; i < 13; i++) {
            if (this.arrayCardArrange[12-i].isVisible())
                this.arrayId[i] = this.arrayCardArrange[12 - i].id;
            else {
                for (; j >= 0; j--) {
                    if (this.arrayCard[j].isVisible()) {
                        this.arrayId[i] = this.arrayCard[j].id;
                        j--;
                        break;
                    }
                }
            }
        }
        return this.arrayId;
    },

    sendCompare: function(typeSend) {
        this.getIdCard();
        //  this.removeFromParent(true);

        cc.log("HOAN THANH GUI READY ");
        var pkReady = new CmdSendReady();
        pkReady.putData(13, this.arrayId, typeSend);
        GameClient.getInstance().sendPacket(pkReady);
        pkReady.clean();

        cc.log("LAY DU LIEU ");
        for(var i = 0; i < 13; i++)
            gamedata.gameLogic.players[0].cards[i] = this.arrayId[i];
        var time =  Math.floor(this.time * this._uiTimer.getPercentage() / 100);
        cc.log("PERCENT " + time);

        gamedata.gameLogic.gameTime = time;
///        sceneMgr.getRunningScene().getMainLayer().addAutoStart(time);
        this.removeFromParent();
        sceneMgr.getRunningScene().getMainLayer().updateIdCard();
    },

    finishDealCard: function(){
        cc.log("FINISH DEAL CARD MAUBINH AT");
        for(var i = 0; i < 13; i++)
        {
            this.arrayBgCard[i].setVisible(true);
        }
        this.startTime(gamedata.gameLogic.gameTime);
        this.showGroupCard(true);
        var showHelp;
        cc.log("COUNT HELP " + this.countHelp);
        // this.countHelp = 1;

        if(this.countHelp == MaubinhAtLayer.STATE_HELP_1)
        {
            this.showHelp();
        }

        var playerCard = new MaubinhPlayerCard();
        //  vector<MaubinhGroupCardLogic*> groupCard;
        var i, j, num;
        this.effectImage.setVisible(false);
        for (i = 12; i >= 0; i--) {
            var group = new MaubinhGroupCardLogic();
            group.AddCardByID(gamedata.gameLogic.players[0].cards[i]);
            playerCard.AddGroupCard(group);
        }

        playerCard.SapXepTruocSoBai();

        var cardKind = playerCard.GetPlayerCardsKindBao(false, true);
        cc.log(" Cardkind " + cardKind);
        var isEffect = false;
        var mauBinh = false;
        var isLung = playerCard.isLung();
        var showBinh = false;
        for (var i = 0; i < 10; i++) {
            this.dataBai[i] = 0;
            this.dataBinh[i] = 0;
        }
        switch (cardKind) {
            case MaubinhPlayerCard.EM_LUCPHEBON:
                this.dataBinh[MaubinhAtLayer.GROUP_LUC_PHE_BON] = 1;
                break;
            case MaubinhPlayerCard.EM_SANHRONG:
                this.dataBinh[MaubinhAtLayer.GROUP_SANH_RONG] = 1;
                break;
            case MaubinhPlayerCard.EM_3SANH:
                this.dataBinh[MaubinhAtLayer.GROUP_BA_CAI_SANH] = 1;
                break;
            case MaubinhPlayerCard.EM_3THUNG:
                this.dataBinh[MaubinhAtLayer.GROUP_BA_CAI_THUNG] = 1;
                break;
            case MaubinhPlayerCard.EM_MUOI_BA:
                this.dataBinh[MaubinhAtLayer.GROUP_MUOI_BA] = 1;
                break;
            case MaubinhPlayerCard.EM_MUOI_HAI:
                this.dataBinh[MaubinhAtLayer.GROUP_MUOI_HAI] = 1;
                break;
            default:
                break;
        }
        if (cardKind == MaubinhPlayerCard.EM_LUCPHEBON || cardKind == MaubinhPlayerCard.EM_SANHRONG || cardKind == MaubinhPlayerCard.EM_3SANH
            || cardKind == MaubinhPlayerCard.EM_3THUNG || cardKind == MaubinhPlayerCard.EM_MUOI_BA || cardKind == MaubinhPlayerCard.EM_MUOI_HAI) {
            this.stateGroup = MaubinhAtLayer.GROUP_BINH;
            this.showGroupCard(true);
            showBinh = true;
            this.btnBao.setVisible(true);
        }

        cc.log("FINISH DEAL CARD MAUBINH AT 2");
    },

    callbackTut: function(){
        this.tut.setVisible(false);
        //this.countHelp++;
        //if(this.countHelp == 2)
        //{
        //    this.showHelp();
        //}

        this.countHelp = MaubinhAtLayer.STATE_HELP_NONE;
        this.text.hide();
    },

    hideHelp: function() {
        if (this.tut) {
            this.tut.setVisible(false);
            //  this.tut.removeFromParent();
            this.text.hide();
        }

        if (this.bgTouch) {
            this.bgTouch.setVisible(false);
            this.bgTouch.cleanup();
        }
    },

    showHelp: function()
    {
        //   if (this.tut)
        //     this.tut.removeFromParent();
        if (!this.text || this.text == undefined) {
            this.text = new HelpText();
            this._layout.addChild(this.text);

        }
        cc.log("SHOW HELP ");
        this.tut = db.DBCCFactory.getInstance().buildArmatureNode("Hand_tut");
        this.tut.setLocalZOrder(30);
        //j.setPosition(cc.p(this.btnComplete.getContentSize().width * 0.5, this.btnComplete.getContentSize().height * 0.5));
        if(this.countHelp == MaubinhAtLayer.STATE_HELP_1) {
            this.tut.setPosition(cc.p(cc.winSize.width * 0.2, this.arrayCard[0].getHeight() * 1.4));
            this.bgTouch.setVisible(true);
            this.bgTouch.cleanup();
            this.bgTouch.setOpacity(0);
            this.bgTouch.runAction(cc.repeatForever(cc.sequence(cc.fadeIn(0.4), cc.fadeTo(0.4, 200))));

            this.text.showText(LocalizedString.to("TUT_" + this.countHelp), cc.winSize.width * 0.5, this.bgTouch.getContentSize().height * 0.5 * this.bgTouch.getScaleY() * 0.5 + this.bgTouch.getPositionY());
            this.tut.getAnimation().gotoAndPlay(this.countHelp, -1, -1, -1);
            this.addChild(this.tut);
            //this.tut.setVisible(false);
            //this.tut.setCompleteListener(this.callbackTut.bind(this));
        }
        else if(this.countHelp == MaubinhAtLayer.STATE_HELP_2) {
            this.text.showText(LocalizedString.to("TUT_" + this.countHelp), cc.winSize.width * 0.5, this.bgTouch.getContentSize().height * 0.5 * this.bgTouch.getScaleY() * 0.5 + this.bgTouch.getPositionY());
            this.tut.getAnimation().gotoAndPlay(this.countHelp, -1, -1, -1);
            this.addChild(this.tut);
            this.tut.setPosition(cc.p(this.arrayCard[2].getPositionX() + this.arrayCard[2].getWidth() * 0.15, this.arrayCard[2].getPositionY() - this.arrayCard[2].getHeight() * 0.15));
            //   cc.sys.localStorage.setItem("countShowHelp", 2);
        }
        else {
            this.text.showText(LocalizedString.to("TUT_" + this.countHelp), cc.winSize.width * 0.5, -this.bgTouch.getContentSize().height * 0.5 * this.bgTouch.getScaleY() * 0.5 + this.bgTouch.getPositionY());
            this.tut.getAnimation().gotoAndPlay(this.countHelp, -1, -1, 3);
            this.addChild(this.tut);
            this.tut.setCompleteListener(this.callbackTut.bind(this));
            this.tut.setPosition(cc.p(this.arrayCardArrange[4].getPositionX() + this.arrayCardArrange[4].getWidth() * 0.35, this.arrayCardArrange[4].getPositionY() - this.arrayCardArrange[4].getHeight() * 0.15));
            this.countHelp = MaubinhAtLayer.STATE_HELP_4;
            // cc.sys.localStorage.setItem("countShowHelp", 3);
        }

        //Toast.makeToast(3.0, LocalizedString.to("TUT_" + s), this);
        //this.tut.getAnimation().gotoAndPlay(s, -1, -1, 3);
        //this.addChild(this.tut);
        //this.tut.setCompleteListener(this.callbackTut.bind(this));

    },

    onButtonRelease: function(button,id){
        switch (id) {
            case MaubinhAtLayer.BTN_BAI:
            {
                this.stateGroup = MaubinhAtLayer.GROUP_BAI;
                this.showGroupCard(true);
                break;
            }
            case MaubinhAtLayer.BTN_BINH:
            {
                this.stateGroup = MaubinhAtLayer.GROUP_BINH;
                this.showGroupCard(true);
                break;
            }
            case MaubinhAtLayer.BTN_CANCEL:
            {
                this.cancelArrange();
                break;
            }
            case MaubinhAtLayer.BTN_COMPLETE:
            {
                if(gamedata.gameLogic.state == GameStateMaubinh.GAME_PLAYING) {
                    var pkConfirm = new CmdSendConfirmInTable();
                    pkConfirm.putData();
                    GameClient.getInstance().sendPacket(pkConfirm);
                    pkConfirm.clean();
                    gameSound.playSoundfinishgroupcard();
                    this.sendCompare(1);
                }
                else {
                    this.removeFromParent();
                    sceneMgr.getRunningScene().getMainLayer().updateIdCard();
                }

                break;
            }
            case MaubinhAtLayer.BTN_BAO:
            {
                var pkConfirm = new CmdSendConfirmInTable();
                pkConfirm.putData();
                GameClient.getInstance().sendPacket(pkConfirm);
                pkConfirm.clean();

                var cmd = new CmdSendNotifyBaoBinh();
                GameClient.getInstance().sendPacket(cmd);
                cmd.clean();
                this.getIdCard();

                var playerCard = new MaubinhPlayerCard();
                //  vector<MaubinhGroupCardLogic*> groupCard;
                var i, j, num;
                this.effectImage.setVisible(false);
                for (i = 12; i >= 0; i--) {
                    var group = new MaubinhGroupCardLogic();
                    group.AddCardByID(this.arrayId[i]);
                    playerCard.AddGroupCard(group);
                }

                playerCard.SapXepTruocSoBai();
                var cardKind = playerCard.GetPlayerCardsKindBao(false, true);

                this.arrayArrangeId = playerCard.ArrangePlayerCardsBao();
                var effectBay = false;
                for (var i = 0; i < 13; i++){
                    if (this.arrayCard[i].isVisible()) {
                        this.moveCardToCenter(this.arrayCard[i]);
                        effectBay = true;
                    }
                }
                var time = 0;
                if (effectBay) {
                    time = 1.0;
                }
                this.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(function () {
                    for (var i = 0; i < 13; i++) {
                        cc.log("ID " + this.arrayArrangeId[i]);
                        this.arrayCardArrange[i].setIdCard(this.arrayArrangeId[i]);
                    }
                    this.sendCompare(1);
                }.bind(this))));
                this.btnBao.setVisible(false);
                break;
            }
        }
    }
})

var HelpText = cc.LayerGradient.extend({
    ctor: function(){
        this._super(cc.color(0,0,0,0), cc.color(98,99,117,0));
        this.batchNode = new cc.SpriteBatchNode("poker/bgBubble.png");
        this.bgText = new cc.Scale9Sprite();
        this.bgText.updateWithBatchNode(this.batchNode, cc.rect(0, 0, 54, 54), false, cc.rect(10, 10, 34, 34));
        this.addChild(this.bgText);

        this._label = new ccui.Text();
        this._label.setAnchorPoint(cc.p(0.5,1.0));
        this._label.ignoreContentAdaptWithSize(false);
        this._label._customSize = true;
        this._label.setFontName("fonts/tahoma.ttf");
        this._label.setFontSize(15);
        this._label.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._label.setColor(sceneMgr.ccWhite);
        this._label.setString("");
        //this._label.setScale(scale);
        this._label._setWidth(cc.winSize.width * 0.9);
        this._label._setHeight(50);
        this.bgText.addChild(this._label);

        this.bgText.width = this._label.getAutoRenderSize().width + 20;
        this.bgText.height = this._label.getBoundingBox().height + 10;
        this._label.setPosition(this.bgText.width * 0.5, this.bgText.height * 0.5);
    },

    showText: function(message, posX, posY) {
        this.setVisible(true);
        this._label.setString(message);
        //cc.log("HEIGHT BOX *** " +  this._label.getVirtualRenderer().getStringNumLines() + "  " + this._label.getBoundingBox().height + " " + this._label.getContentSize().height);
        cc.log("HEIGHT BOX *** " +  this._label.getAutoRenderSize().width  + " "  + this._label.getVirtualRenderer().getContentSize().width + " " + cc.winSize.width);
        if (this._label.getAutoRenderSize().width >= cc.winSize.width * 0.9) {
            this.bgText.width = this._label.getVirtualRendererSize().width + 10;
        }
        else {
            this.bgText.width = this._label.getAutoRenderSize().width + 20;
        }

        this.bgText.width = this._label.getBoundingBox().width + 10;
        if (cc.sys.isNative){
            this.bgText.height = this._label.getVirtualRenderer().getStringNumLines() * this._label.getVirtualRenderer().getLineHeight() + 15;
        } else {
            this.bgText.height = this._label.getVirtualRenderer()._getBoundingHeight();
        }

        this._label.setPosition(this.bgText.width * 0.5, this.bgText.height - 7);
        this.bgText.setPosition(posX, posY);
        this.bgText.setOpacity(0);
        this.bgText.cleanup();
        this.bgText.runAction(cc.fadeIn(0.5));
        this._label.setOpacity(0);
        this._label.cleanup();
        this._label.runAction(cc.fadeIn(0.5));
        //this.setOpacity(0);
        //this.runAction(cc.fadeIn(0.5));
    },

    hide: function() {
        this.bgText.runAction(cc.fadeOut(0.5));
        this._label.runAction(cc.fadeOut(0.5));
    }
})


MaubinhAtLayer.className = "MaubinhAtLayer";
MaubinhAtLayer.BTN_COMPLETE = 1;
MaubinhAtLayer.BTN_CANCEL = 2;
MaubinhAtLayer.BTN_BAO = 3;
MaubinhAtLayer.BTN_BINH = 4;
MaubinhAtLayer.BTN_BAI = 5;

MaubinhAtLayer.GROUP_BAI = 0;
MaubinhAtLayer.GROUP_BINH = 1;

MaubinhAtLayer.GROUP_SANH_RONG = 0;
MaubinhAtLayer.GROUP_MUOI_BA = 1;
MaubinhAtLayer.GROUP_MUOI_HAI = 2;
MaubinhAtLayer.GROUP_BA_CAI_THUNG = 3;
MaubinhAtLayer.GROUP_BA_CAI_SANH = 4;
MaubinhAtLayer.GROUP_LUC_PHE_BON = 5;
MaubinhAtLayer.GROUP_THUNG_PHA_SANH_CHI_HAI = 6;
MaubinhAtLayer.GROUP_TU_QUY_CHI_HAI = 7;
MaubinhAtLayer.GROUP_SAM_CHI_CUOI = 8;
MaubinhAtLayer.GROUP_CU_LU_CHI_HAI = 9;

MaubinhAtLayer.STATE_HELP_NONE = -1;
MaubinhAtLayer.STATE_HELP_1 = 1;
MaubinhAtLayer.STATE_HELP_2 = 2;
MaubinhAtLayer.STATE_HELP_3 = 3;
MaubinhAtLayer.STATE_HELP_4 = 4;