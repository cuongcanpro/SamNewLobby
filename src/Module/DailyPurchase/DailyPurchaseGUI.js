/**
 *  Created by sonbnt on 24/08/2021
 */

var DailyPurchaseGUI = BaseLayer.extend({
    ctor: function(){
        this._super(DailyPurchaseGUI.className);

        this.readyToUse = false;
        this.waitOpenShop = false;

        this.fog = null;
        this.bg = null;
        this.title = null;
        this.imgPromo = null;

        this.txtDescription = null;
        this.txtSub = null;
        this.bgRemainTime = null;
        this.txtRemainTime = null;
        this.fastHand = null;
        this.slowHand = null;
        this.cells = [];
        this.giftCell = null;
        this.giftNodes = [];

        this.pCheat = null;
        this.txtDayIndex = null;

        this.btnGuide = null;
        this.guide = null;

        this.initWithBinaryFile("Lobby/DailyPurchaseGUI.json");
    },

    initGUI: function(){
        this.fog = this.getControl("fog");
        this.fog.setTouchEnabled(true);
        this.fog.setSwallowTouches(true);
        this.bg = this.getControl("bg");
        this.bg.setCascadeOpacityEnabled(true);
        this.title = this.getControl("title", this.bg);
        this.title.addTouchEventListener(function(widget, type){
            if (!this.readyToUse) return;
            if (type == ccui.Widget.TOUCH_ENDED) {
                this.pCheat.setVisible(!this.pCheat.isVisible());
                this.txtDayIndex.setString("");
            }
        }.bind(this), this);
        this.title.setTouchEnabled(Config.ENABLE_CHEAT);
        this.imgPromo = this.getControl("imgPromo", this.bg);
        this.customButton("btnClose", DailyPurchaseGUI.BTN_CLOSE, this.bg);
        this.btnGuide = this.customButton("btnGuide", DailyPurchaseGUI.BTN_OPEN_GUIDE, this.bg);

        this.pCheat = this.getControl("pCheat");
        this.txtDayIndex = this.getControl("txtDayIndex", this.pCheat);
        this.customButton("btnCheatData", DailyPurchaseGUI.BTN_CHEAT_DATA, this.pCheat);
        this.customButton("btnCheatReset", DailyPurchaseGUI.BTN_CHEAT_RESET, this.pCheat);

        var txtDescription = this.getControl("txtDescription", this.bg);
        txtDescription.setVisible(false);
        this.txtDescription = new CustomLabel();
        this.txtDescription.setDefaultAlignHorizontal(RichTextAlignment.CENTER);
        this.txtDescription.setDefaultAlignVertical(RichTextAlignment.MIDDLE);
        this.txtDescription.setDefaultFont(txtDescription.getFontName());
        this.txtDescription.setDefaultSize(txtDescription.getFontSize());
        this.txtDescription.setAnchorPoint(0.5, 0.5);
        this.txtDescription.setPosition(txtDescription.getPosition());
        this.bg.addChild(this.txtDescription);
        this.txtSub = this.getControl("txtSub", this.bg);
        this.txtSub.ignoreContentAdaptWithSize(true);

        this.bgRemainTime = this.getControl("bgRemainTime", this.bg);
        this.txtRemainTime = this.getControl("txtRemainTime", this.bgRemainTime);
        this.txtRemainTime.ignoreContentAdaptWithSize(true);
        this.fastHand = this.getControl("fastHand", this.bgRemainTime);
        this.slowHand = this.getControl("slowHand", this.bgRemainTime);

        var prototypeCell = this.getControl("prototypeCell", this.bg);
        prototypeCell.setVisible(false);
        DailyPurchaseGUI.CELL_SIZE = prototypeCell.getContentSize();
        DailyPurchaseGUI.CELL_Y = prototypeCell.getPositionY();

        this.giftCell = new DailyPurchaseCell(this);
        this.giftCell.setVisible(false);
        this._layout.addChild(this.giftCell);

        this.initGuide();
        this.setBackEnable(true);
    },

    initGuide: function(){
        this.guide = this.customButton("btnCloseGuide", DailyPurchaseGUI.BTN_CLOSE_GUIDE);
        this.guide.setVisible(false);

        var bgGuide = this.getControl("bgGuide", this.guide);
        bgGuide.setPosition(this.getControl("prototypeCell", this.bg).getWorldPosition());
        bgGuide.setAnchorPoint(1, 1);
        bgGuide.setPosition(bgGuide.getPositionX() + bgGuide.getContentSize().width/2 * this._scale, bgGuide.getPositionY() + bgGuide.getContentSize().height/2 * this._scale);
        bgGuide.defaultPosition = cc.p(bgGuide.getPositionX(), bgGuide.getPositionY());
        this.customButton("btnClose", DailyPurchaseGUI.BTN_CLOSE_GUIDE, bgGuide);

        //init text guide
        var view = this.getControl("view", bgGuide);
        view.setScrollBarEnabled(false);
        view.setClippingEnabled(true);
        view.setBounceEnabled(true);
    },

    customizeGUI: function(){
        var cellNum = dailyPurchaseManager.getNumTotalDay();
        for (var i = 0; i < cellNum; i++){
            var cell = new DailyPurchaseCell(this);
            var offset = i - (cellNum - 1)/2;
            cell.setPosition((cell.defaultPos = cc.p(this.bg.getContentSize().width/2 + offset * (DailyPurchaseGUI.CELL_SIZE.width + DailyPurchaseGUI.CELL_MARGIN), DailyPurchaseGUI.CELL_Y)));
            this.bg.addChild(cell);
            this.cells.push(cell);
        }
    },

    onEnterFinish: function(){
        this.pCheat.setVisible(false);
        this.readyToUse = false;
        this.waitOpenShop = false;
        this.onUpdateGUI();

        //effect, set ready to use
        this.doEffect();

        this.fastHand.setRotation(0);
        this.slowHand.setRotation(0);
        this.fastHand.stopAllActions();
        this.slowHand.stopAllActions();
        this.fastHand.runAction(cc.rotateBy(5, 360).repeatForever());
        this.slowHand.runAction(cc.rotateBy(60, 360).repeatForever());

        this.giftCell.setVisible(false);
        this.giftCell.setOpacity(255);
        for (var i = 0; i < this.giftNodes.length; i++)
            this._layout.removeChild(this.giftNodes[i]);
        this.giftNodes = [];

        this.guide.setVisible(false);
    },

    doEffect: function(){
        this.fog.setOpacity(0);
        this.fog.stopAllActions();
        this.fog.runAction(cc.fadeIn(0.25));

        this.bg.setScale(this._scale/2);
        this.bg.setOpacity(0);
        this.bg.stopAllActions();
        this.bg.runAction(cc.spawn(
            cc.fadeIn(0.25),
            cc.scaleTo(0.25, this._scale).easing(cc.easeBackOut())
        ));

        this.imgPromo.setRotation(0);
        this.imgPromo.stopAllActions();
        this.imgPromo.runAction(cc.sequence(
            cc.delayTime(2),
            cc.rotateTo(0.1, 20), cc.rotateTo(0.1, -18), cc.rotateTo(0.1, 16), cc.rotateTo(0.1, -14),
            cc.rotateTo(0.1, 12), cc.rotateTo(0.1, -10), cc.rotateTo(0.1, 8), cc.rotateTo(0.1, -6),
            cc.rotateTo(0.1, 4), cc.rotateTo(0.1, -2), cc.rotateTo(0.1, 1), cc.rotateTo(0.1, 0),
            cc.delayTime(2)
        ).repeatForever());

        var rand;
        if (dailyPurchaseManager.receivedDays.length > 0)
            rand = 1 + Math.floor(Math.random() * 2);
        else
            rand = Math.floor(Math.random() * 3);
        for (var i = 0; i < this.cells.length; i++){
            var cell = this.cells[i];

            switch(rand) {
                case 0:
                    cell.setOpacity(0);
                    cell.setScaleX(0.5);
                    cell.stopAllActions();
                    cell.runAction(cc.sequence(
                        cc.delayTime(0.2 + 0.05 * i),
                        cc.spawn(
                            cc.fadeIn(0.2),
                            cc.scaleTo(0.2, 1)
                        )
                    ));

                    cell.layerEffect.setOpacity(200);
                    cell.layerEffect.setScale(1);
                    cell.layerEffect.stopAllActions();
                    cell.layerEffect.runAction(cc.sequence(
                        cc.delayTime(0.2 + 0.05 * i),
                        cc.spawn(
                            cc.fadeOut(0.4),
                            cc.scaleTo(0.4, 1.5)
                        ),
                        cc.callFunc(function(idx){
                            if (idx == this.cells.length - 1) this.readyToUse = true;
                        }.bind(this, i))
                    ));
                    break;
                case 1:
                    cell.setPositionX(cell.defaultPos.x + 200);
                    cell.setOpacity(0);
                    cell.stopAllActions();
                    cell.runAction(cc.sequence(
                        cc.delayTime(0.05 * i),
                        cc.spawn(
                            cc.fadeIn(0.5),
                            cc.moveTo(0.5, cell.defaultPos).easing(cc.easeBackOut())
                        ),
                        cc.callFunc(function(idx){
                            if (idx == this.cells.length - 1) this.readyToUse = true;
                        }.bind(this, i))
                    ));
                    break;
                case 2:
                    cell.setPositionY(cell.defaultPos.y - 100);
                    cell.setOpacity(0);
                    cell.stopAllActions();
                    cell.runAction(cc.sequence(
                        cc.delayTime(0.05 * i),
                        cc.spawn(
                            cc.fadeIn(0.5),
                            cc.moveTo(0.5, cell.defaultPos).easing(cc.easeBackOut())
                        ),
                        cc.callFunc(function(idx){
                            if (idx == this.cells.length - 1) this.readyToUse = true;
                        }.bind(this, i))
                    ));
                    break;
            }
        }
    },

    onUpdateGUI: function(){
        this.unscheduleUpdate();
        if (dailyPurchaseManager.checkOpen()) {
            this.bgRemainTime.setVisible(true);
            this.scheduleUpdate();
            if (dailyPurchaseManager.isReceivedAll())
                this.txtSub.setString(LocalizedString.to("DAILY_PURCHASE_EVENT_FINISHED"));
            else{
                switch(dailyPurchaseManager.getCurrentDayStatus()){
                    case DailyPurchaseManager.DAY_RECEIVED:
                        this.txtSub.setString(LocalizedString.to("DAILY_PURCHASE_BACK_TOMORROW"));
                        break;
                    case DailyPurchaseManager.DAY_WAITING:
                        this.txtSub.setString(LocalizedString.to("DAILY_PURCHASE_RECEIVE_TODAY"));
                        break;
                    default:
                        this.txtSub.setString(LocalizedString.to("DAILY_PURCHASE_INFO"));
                        break;
                }
            }
        }
        else {
            this.bgRemainTime.setVisible(false);
            this.txtSub.setString(LocalizedString.to("DAILY_PURCHASE_EVENT_END"));
        }
        var currentDayMinMoney = dailyPurchaseManager.getCurrentDayMinMoney();
        this.txtDescription.clearText();
        this.txtDescription.appendText(LocalizedString.to("DAILY_PURCHASE_DES_1"), this.txtDescription._font, this.txtDescription._size, cc.color("#d1f580"));
        this.txtDescription.appendText(" " + StringUtility.pointNumber(currentDayMinMoney) + " VNĐ", this.txtDescription._font, this.txtDescription._size, cc.color("#ffd964"));
        this.txtDescription.appendText(LocalizedString.to("DAILY_PURCHASE_DES_2"), this.txtDescription._font, this.txtDescription._size, cc.color("#d1f580"));
        for (var i = 0; i < this.cells.length; i++) {
            this.cells[i].setVisible(true);
            this.cells[i].setData(i);
        }
    },

    onButtonRelease: function(button, id){
        if (!this.readyToUse) return;

        switch(id){
            case DailyPurchaseGUI.BTN_CLOSE:
                this.onBack();
                break;
            case DailyPurchaseGUI.BTN_CHEAT_DATA:
                var dayIndex = parseInt(this.txtDayIndex.getString());
                if (!Number.isNaN(dayIndex))
                    dailyPurchaseManager.sendCheatDailyPurchaseData(dayIndex);
                this.txtDayIndex.setString("");
                break;
            case DailyPurchaseGUI.BTN_CHEAT_RESET:
                dailyPurchaseManager.sendCheatDailyPurchaseReset();
                this.txtDayIndex.setString("");
                break;
            case DailyPurchaseGUI.BTN_OPEN_GUIDE:
                this.guide.setVisible(true);

                var fog = this.getControl("fog", this.guide);
                fog.setOpacity(0);
                fog.stopAllActions();
                fog.runAction(cc.fadeIn(0.25));

                var bgGuide = this.getControl("bgGuide", this.guide);
                bgGuide.setScale(this._scale/2);
                bgGuide.setPosition(this.btnGuide.getWorldPosition());
                bgGuide.setOpacity(0);
                bgGuide.stopAllActions();
                bgGuide.runAction(cc.spawn(
                    cc.scaleTo(0.25, this._scale).easing(cc.easeBackOut()),
                    cc.moveTo(0.25, bgGuide.defaultPosition).easing(cc.easeBackOut()),
                    cc.fadeIn(0.25)
                ));

                break;
            case DailyPurchaseGUI.BTN_CLOSE_GUIDE:
                var fog = this.getControl("fog", this.guide);
                fog.stopAllActions();
                fog.runAction(cc.sequence(
                    cc.fadeOut(0.25),
                    cc.callFunc(function(){
                        this.guide.setVisible(false);
                    }.bind(this))
                ));

                var bgGuide = this.getControl("bgGuide", this.guide);
                bgGuide.stopAllActions();
                bgGuide.runAction(cc.spawn(
                    cc.scaleTo(0.25, this._scale/2).easing(cc.easeBackIn()),
                    cc.moveTo(0.25, this.btnGuide.getWorldPosition()).easing(cc.easeBackIn()),
                    cc.fadeOut(0.25)
                ));

                break;
        }
    },

    onBack: function(){
        if (!this.readyToUse) return;
        if (this.guide.isVisible()){
            this.onButtonRelease(null, DailyPurchaseGUI.BTN_CLOSE_GUIDE);
            return;
        }
        this.readyToUse = false;

        this.fog.stopAllActions();
        this.fog.runAction(cc.fadeOut(0.25));

        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.spawn(
                cc.fadeOut(0.25),
                cc.scaleTo(0.25, this._scale/2).easing(cc.easeBackIn())
            ),
            cc.callFunc(function(){
                this.removeFromParent();
                popUpManager.removePopUp(PopUpManager.DAILY_PURCHASE);
                if (this.waitOpenShop)
                    gamedata.openShop(LobbyScene.className, true, gamedata.gameConfig.getShopGoldIndexById(dailyPurchaseManager.getPromoChannel()));
                else fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, ConfigLog.END);
            }.bind(this))
        ));
    },

    onTouchButtonReceive: function(index){
        if (!this.readyToUse) return;

        if (dailyPurchaseManager.checkOpen()) {
            var dayStatus = dailyPurchaseManager.getDayStatus(index);
            if (dayStatus == DailyPurchaseManager.DAY_WAITING) {
                dailyPurchaseManager.sendReceiveDailyPurchaseGift(index);
                fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_receive");
            }
            else this.onUpdateGUI();
        }
        else Toast.makeToast(Toast.LONG, LocalizedString.to("DAILY_PURCHASE_EVENT_END"));
    },

    onTouchButtonBuy: function(index) {
        if (!this.readyToUse) return;

        if (dailyPurchaseManager.checkOpen()) {
            var dayStatus = dailyPurchaseManager.getDayStatus(index);
            if (dayStatus == DailyPurchaseManager.DAY_OPENING) {
                this.waitOpenShop = true;
                this.onBack();
                fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_5000");
            }
            else {
                if (index > 0) {
                    var previousDayStatus = dailyPurchaseManager.getDayStatus(index - 1);
                    var mess = "";
                    if (previousDayStatus == DailyPurchaseManager.DAY_RECEIVED)
                        mess = LocalizedString.to("DAILY_PURCHASE_INSTRUCTION_1");
                    else mess = StringUtility.replaceAll(LocalizedString.to("DAILY_PURCHASE_INSTRUCTION_2"), "@index", index);
                    Toast.makeToast(Toast.LONG, mess);
                }
            }
        }
        else Toast.makeToast(Toast.LONG, LocalizedString.to("DAILY_PURCHASE_EVENT_END"));
    },

    update: function(dt){
        var remainTime = dailyPurchaseManager.getRemainTime();
        if (remainTime > 1000 * 60 * 60 * 24) {
            var d = Math.ceil(remainTime / (1000 * 60 * 60 * 24));
            this.txtRemainTime.setString(d + " ngày");
        }
        else {
            var s = Math.ceil(remainTime / 1000);
            var m = Math.floor(s / 60);
            s -= m * 60;
            var h = Math.floor(m / 60);
            m -= h * 60;
            this.txtRemainTime.setString((h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s);
        }
    },

    effectReceive: function(gift){
        this.readyToUse = false;

        var lobby = sceneMgr.getMainLayer();
        if (lobby instanceof LobbyScene) {
            this.fog.runAction(cc.sequence(
                cc.delayTime(1),
                cc.fadeOut(0.25)
            ));

            this.bg.runAction(cc.spawn(
                cc.fadeOut(0.25),
                cc.scaleTo(0.25, this._scale/2).easing(cc.easeBackIn())
            ));

            var cell = this.cells[gift.dayIndex];
            cell.setVisible(false);
            this.giftCell.setVisible(true);
            this.giftCell.setOpacity(255);
            this.giftCell.updateReceiveInfo(gift);
            this.giftCell.setPosition(this.bg.convertToWorldSpace(cell.getPosition()));
            this.giftCell.stopAllActions();
            this.giftCell.runAction(cc.sequence(
                cc.moveTo(0.5, cc.winSize.width/2, cc.winSize.height/2).easing(cc.easeBackInOut()),
                cc.delayTime(0.25),
                cc.callFunc(function(){
                    if (gift.gold > 0){
                        this.createGiftNode("Lobby/DailyPurchase/iconGold.png", 1, this.giftCell.getGoldIconPosition(), lobby.getGoldIconPosition());
                        effectMgr.runLabelPoint(lobby._uiBean, gamedata.userData.bean - gift.gold, gamedata.userData.bean, 0.75, null, true);
                    }
                    if (gift.vPoint > 0){
                        this.createGiftNode("Lobby/DailyPurchase/iconVPoint.png", 1, this.giftCell.getVPointIconPosition(), lobby.getVipButtonPosition());
                    }
                    if (gift.diamond > 0){
                        this.createGiftNode("Lobby/DailyPurchase/iconDiamond.png", 1, this.giftCell.getDiamondIconPosition(), lobby.getDiamondIconPosition());
                        effectMgr.runLabelPoint(lobby._uiDiamond, gamedata.userData.diamond - gift.diamond, gamedata.userData.diamond, 0.75, null, false);
                    }
                    if (gift.items.length > 0){
                        var item = gift.items[0];
                        var path = StorageManager.getItemIconPath(item.type, item.subType, item.id);
                        var scale = StorageManager.getItemIconScale(item.type) * 0.4;
                        this.createGiftNode(path, scale, this.giftCell.getItemIconPosition(), lobby.getStorageButtonPosition());
                    }
                }.bind(this)),
                cc.delayTime(0.75),
                cc.callFunc(function(){
                    this.giftCell.effectReceive();
                }.bind(this)),
                cc.delayTime(0.5),
                cc.fadeOut(0.5),
                cc.callFunc(function(){
                    VipManager.checkShowUpLevelVip();

                    this.onUpdateGUI();
                    this.doEffect();

                    this.giftCell.setVisible(false);
                    this.giftCell.setOpacity(255);
                    for (var i = 0; i < this.giftNodes.length; i++)
                        this._layout.removeChild(this.giftNodes[i]);
                    this.giftNodes = [];
                }.bind(this))
            ));
        }
        else{
            if (this.cells[gift.dayIndex]) this.cells[gift.dayIndex].effectReceive();
            this.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc(function(){
                    this.onUpdateGUI();
                    this.readyToUse = true;
                }.bind(this))
            ));
        }
    },

    createGiftNode: function(path, scale, pos, endPos){
        var node = new cc.Node();
        node.setPosition(pos);
        node.addChild(new ccui.ImageView(path), 0, "icon");
        node.getChildByName("icon").setScale(scale);
        node.getChildByName("icon").runAction(cc.sequence(
            cc.delayTime(0.75),
            cc.fadeOut(0.25)
        ));

        var midPos = cc.p((pos.x + endPos.x)/2 + 100, (pos.y + endPos.y)/2);
        node.runAction(cc.sequence(
            cc.bezierTo(0.75, [pos, midPos, endPos]).easing(cc.easeIn(2)),
            cc.callFunc(function(){
                var effect = db.DBCCFactory.getInstance().buildArmatureNode("HighlightBig");
                if (effect) {
                    this.addChild(effect);
                    effect.gotoAndPlay("1" , 0, -1, 1);
                    effect.setScale(0.5);
                }

                if (gamedata.sound) {
                    var rnd = Math.floor(Math.random() * 3) + 1;
                    cc.audioEngine.playEffect(lobby_sounds["coin" + rnd], false);
                }
            }.bind(node)),
            cc.spawn(
                cc.scaleTo(0.5, 0).easing(cc.easeBackIn()),
                cc.fadeOut(0.5)
            ),
            cc.hide()
        ));

        this._layout.addChild(node);
        this.giftNodes.push(node);
        return node;
    }
});

DailyPurchaseGUI.className = "DailyPurchaseGUI";
DailyPurchaseGUI.GUI_TAG = 308;
DailyPurchaseGUI.CELL_MARGIN = 5;
DailyPurchaseGUI.CELL_SIZE = cc.size(0, 0);
DailyPurchaseGUI.CELL_Y = 0;

DailyPurchaseGUI.BTN_CLOSE = 0;
DailyPurchaseGUI.BTN_CHEAT_DATA = 1;
DailyPurchaseGUI.BTN_CHEAT_RESET = 2;
DailyPurchaseGUI.BTN_OPEN_GUIDE = 3;
DailyPurchaseGUI.BTN_CLOSE_GUIDE = 4;

var DailyPurchaseCell = BaseLayer.extend({
    ctor: function(dailyPurchaseGUI){
        this._super();
        this.setAnchorPoint(0, 0);
        this.setCascadeOpacityEnabled(true);

        this.dailyPurchaseGUI = dailyPurchaseGUI;
        this.dayIndex = -1;

        this._layout = ccs.load("Lobby/DailyPurchaseCell.json").node;
        this._layout.setAnchorPoint(0.5, 0.5);
        this._layout.ignoreAnchorPointForPosition(false);
        this.addChild(this._layout);
        this.initGUI();
    },

    initGUI: function(){
        this.bg = this.getControl("bg");
        this.bgHighlight = this.getControl("bgHighlight");
        this.title = this.getControl("title");
        this.lastDay = this.getControl("lastDay");

        this.pGold = this.getControl("pGold");
        this.txtGold = this.getControl("txt", this.pGold);
        this.txtGold.ignoreContentAdaptWithSize(true);
        this.pVPoint = this.getControl("pVPoint");
        this.txtVPoint = this.getControl("txt", this.pVPoint);
        this.txtVPoint.ignoreContentAdaptWithSize(true);
        this.pDiamond = this.getControl("pDiamond");
        this.txtDiamond = this.getControl("txt", this.pDiamond);
        this.txtDiamond.ignoreContentAdaptWithSize(true);
        this.pItem = this.getControl("pItem");
        this.iconItem = this.getControl("icon", this.pItem);
        this.shadowItem = this.getControl("shadow", this.pItem);
        this.txtItemName = this.getControl("name", this.pItem);
        this.txtItemDes = this.getControl("des", this.pItem);
        this.iconItem.ignoreContentAdaptWithSize(true);
        this.shadowItem.ignoreContentAdaptWithSize(true);
        this.txtItemName.ignoreContentAdaptWithSize(true);
        this.txtItemDes.ignoreContentAdaptWithSize(true);

        this.giftPosY = [
            this.pGold.getPositionY(),
            this.pVPoint.getPositionY(),
            this.pDiamond.getPositionY(),
            this.pItem.getPositionY()
        ];

        this.btnBuy = this.customButton("btnBuy", DailyPurchaseCell.BTN_BUY);
        this.btnBuy.setPressedActionEnabled(false);
        this.btnReceive = this.customButton("btnReceive", DailyPurchaseCell.BTN_RECEIVE);
        this.btnReceive.setPressedActionEnabled(false);
        this.txtMinMoney = this.getControl("price", this.btnBuy);
        this.txtMinMoney.ignoreContentAdaptWithSize(true);

        this.imgHover = this.getControl("imgHover");
        this.imgReceived = this.getControl("imgReceived");

        this.layerEffect = new ccui.ImageView("Lobby/DailyPurchase/bgCell.png");
        this.layerEffect.setAnchorPoint(0.5, 0.5);
        this.layerEffect.setPosition(this.bg.getPosition());
        this.layerEffect.setOpacity(0);
        this._layout.addChild(this.layerEffect);

        this.effectHighlight0 = new ccui.ImageView("Lobby/DailyPurchase/bgCellHighlight.png");
        this.effectHighlight0.setAnchorPoint(0.5, 0.5);
        this.effectHighlight0.setPosition(this.bgHighlight.getPosition());
        this.effectHighlight0.setOpacity(0);
        this._layout.addChild(this.effectHighlight0);

        this.effectHighlight1 = new ccui.ImageView("Lobby/DailyPurchase/bgCellHighlight.png");
        this.effectHighlight1.setAnchorPoint(0.5, 0.5);
        this.effectHighlight1.setPosition(this.bgHighlight.getPosition());
        this.effectHighlight1.setOpacity(0);
        this._layout.addChild(this.effectHighlight1);
    },

    onEnterFinish: function(){
        this.setAnchorPoint(0, 0);
        this.btnReceive.stopAllActions();
        this.btnReceive.setScale(1);
        this.btnReceive.setOpacity(255);
        this.lastDay.stopAllActions();
        this.lastDay.setScale(1);
        this.lastDay.setOpacity(255);

        this.bg.setOpacity(255);
        this.bgHighlight.setOpacity(255);

        this.effectRunning = false;
    },

    onButtonRelease: function(button, id){
        switch(id){
            case DailyPurchaseCell.BTN_BUY:
                this.dailyPurchaseGUI.onTouchButtonBuy(this.dayIndex);
                break;
            case DailyPurchaseCell.BTN_RECEIVE:
                this.dailyPurchaseGUI.onTouchButtonReceive(this.dayIndex);
                break;
        }
    },

    setData: function(dayIndex){
        this.dayIndex = dayIndex;
        var gift = dailyPurchaseManager.getGift(this.dayIndex);
        cc.log(JSON.stringify(gift));
        var dayStatus = dailyPurchaseManager.getDayStatus(this.dayIndex);
        var isCurrentDay = dailyPurchaseManager.isCurrentDayIndex(this.dayIndex);
        var isLastDay = dailyPurchaseManager.isLastDayIndex(this.dayIndex);
        this.title.setString("Ngày " + (this.dayIndex + 1));
        if (isLastDay && dayStatus != DailyPurchaseManager.DAY_RECEIVED){
            this.lastDay.setVisible(true);
            this.title.setTextColor(cc.color("#fdf0c6"));
        }
        else{
            this.lastDay.setVisible(false);
            this.title.setTextColor(cc.color("#8a2214"));
        }
        this.bg.setVisible(!isCurrentDay || dayStatus == DailyPurchaseManager.DAY_RECEIVED);
        this.bgHighlight.setVisible(isCurrentDay && dayStatus != DailyPurchaseManager.DAY_RECEIVED);
        if (isCurrentDay && dayStatus != DailyPurchaseManager.DAY_RECEIVED){
            this.effectRunning = true;
            this.setLocalZOrder(1);
            this.effectHighlight0.stopAllActions();
            this.effectHighlight0.runAction(cc.sequence(
                cc.hide(),
                cc.delayTime(2),
                cc.callFunc(function(){
                    if (this.effectRunning) {
                        this.effectHighlight0.setVisible(true);
                        this.effectHighlight0.setOpacity(150);
                        this.effectHighlight0.setScale(1);
                    }
                    else this.effectHighlight0.stopAllActions();
                }.bind(this)),
                cc.spawn(
                    cc.fadeOut(0.5),
                    cc.scaleTo(0.5, 1.25)
                ),
                cc.delayTime(0.3)
            ).repeatForever());
            this.effectHighlight1.stopAllActions();
            this.effectHighlight1.runAction(cc.sequence(
                cc.hide(),
                cc.delayTime(2.3),
                cc.callFunc(function(){
                    if (this.effectRunning) {
                        this.effectHighlight1.setVisible(true);
                        this.effectHighlight1.setOpacity(100);
                        this.effectHighlight1.setScale(1);
                    }
                    else this.effectHighlight1.stopAllActions();
                }.bind(this)),
                cc.spawn(
                    cc.fadeOut(0.5),
                    cc.scaleTo(0.5, 1.25)
                )
            ).repeatForever());
        }
        else{
            this.effectRunning = false;
            this.setLocalZOrder(0);
            this.effectHighlight0.stopAllActions();
            this.effectHighlight0.setOpacity(0);
            this.effectHighlight1.stopAllActions();
            this.effectHighlight1.setOpacity(0);
        }
        this.imgHover.setVisible(dayStatus == DailyPurchaseManager.DAY_RECEIVED);
        this.imgReceived.setVisible(dayStatus == DailyPurchaseManager.DAY_RECEIVED);

        this.txtMinMoney.setString(StringUtility.pointNumber(gift.minMoney) + " VNĐ");
        this.btnReceive.setVisible(dayStatus == DailyPurchaseManager.DAY_WAITING);
        this.btnReceive.setTouchEnabled(dayStatus == DailyPurchaseManager.DAY_WAITING);
        this.btnBuy.setVisible(dayStatus == DailyPurchaseManager.DAY_UNOPENED || dayStatus == DailyPurchaseManager.DAY_OPENING);
        if (dayStatus == DailyPurchaseManager.DAY_OPENING){
            this.btnBuy.loadTextures("DailyPurchase/btnBuyEnable.png", "DailyPurchase/btnBuyEnable.png", "");
            this.txtMinMoney.setTextColor(cc.color("#ffffff"));
            this.txtMinMoney.enableOutline(cc.color("#3dbc18"), 1);
            this.txtMinMoney.setPosition(this.txtMinMoney.defaultPos);
        }
        else{
            this.btnBuy.loadTextures("DailyPurchase/btnBuyDisable.png", "DailyPurchase/btnBuyDisable.png", "");
            this.txtMinMoney.setTextColor(cc.color("#f79863"));
            this.txtMinMoney.disableEffect();
            this.txtMinMoney.setPosition(this.btnBuy.getContentSize().width/2, this.btnBuy.getContentSize().height/2);
        }

        this.setGiftInfo(gift.gold, gift.vPoint, gift.diamond, gift.items);
    },

    setGiftInfo: function(gold, vPoint, diamond, items){
        var count = 0;
        if (gold > 0){
            this.pGold.setVisible(true);
            this.pGold.setPositionY(this.giftPosY[count++]);
            this.txtGold.setString(StringUtility.formatNumberSymbol(gold));
        }
        else this.pGold.setVisible(false);
        if (vPoint > 0){
            this.pVPoint.setVisible(true);
            this.pVPoint.setPositionY(this.giftPosY[count++]);
            this.txtVPoint.setString(StringUtility.pointNumber(vPoint));
        }
        else this.pVPoint.setVisible(false);
        if (diamond > 0){
            this.pDiamond.setVisible(true);
            this.pDiamond.setPositionY(this.giftPosY[count++]);
            this.txtDiamond.setString(StringUtility.pointNumber(diamond));
        }
        else this.pDiamond.setVisible(false);

        if (items.length > 0){
            var item = items[0];
            var texture = StorageManager.getItemIconPath(item.type, item.subType, item.id);
            this.pItem.setVisible(true);
            this.pItem.setPositionY(this.giftPosY[count]);
            if (texture && texture != "") {
                this.iconItem.loadTexture(texture);
                this.shadowItem.loadTexture(texture);
                var scale = StorageManager.getItemIconScale(item.type) * 0.4;
                this.iconItem.setScale(scale);
                this.shadowItem.setScale(scale);
            }
            else{
                this.iconItem.loadTexture("");
                this.shadowItem.loadTexture("");
            }
            var itemName = StorageManager.getInstance().itemConfig ? StorageManager.getInstance().itemConfig[item.type][item.id].name : "";
            this.setLabelText(itemName, this.txtItemName);
            var des = "";
            switch(StorageManager.getItemUseType(item.type)){
                case StorageManager.USE_BY_TIME:
                    des = StorageManager.getInstance().getExpiredText(item.type, item.subType, item.id);
                    break;
                case StorageManager.USE_BY_UNIT:
                    des = "x " + StringUtility.pointNumber(item.num);
                    break;
                case StorageManager.USE_ONCE:
                    des = StorageManager.getInstance().getExpiredText(item.type, item.subType, item.id) + " x " + StringUtility.pointNumber(item.num);
                    break;
            }
            this.txtItemDes.setString(des);
        }
        else this.pItem.setVisible(false);
    },

    updateReceiveInfo: function(gift){
        var dayStatus = dailyPurchaseManager.getDayStatus(gift.dayIndex);
        var isCurrentDay = dailyPurchaseManager.isCurrentDayIndex(gift.dayIndex);
        var isLastDay = dailyPurchaseManager.isLastDayIndex(gift.dayIndex);

        this.title.setString("Ngày " + (gift.dayIndex + 1));
        if (isLastDay && dayStatus != DailyPurchaseManager.DAY_RECEIVED){
            this.lastDay.setVisible(true);
            this.title.setTextColor(cc.color("#fdf0c6"));
        }
        else{
            this.lastDay.setVisible(false);
            this.title.setTextColor(cc.color("#8a2214"));
        }
        this.bg.setVisible(!isCurrentDay || dayStatus == DailyPurchaseManager.DAY_RECEIVED);
        this.bgHighlight.setVisible(isCurrentDay && dayStatus != DailyPurchaseManager.DAY_RECEIVED);
        if (!isCurrentDay || dayStatus == DailyPurchaseManager.DAY_RECEIVED){
            this.bg.runAction(cc.fadeOut(0.5));
            this.bgHighlight.setVisible(true);
            this.bgHighlight.setOpacity(0);
            this.bgHighlight.runAction(cc.fadeIn(0.5));
        }

        this.imgHover.setVisible(false);
        this.imgReceived.setVisible(false);
        this.setGiftInfo(gift.gold, gift.vPoint, gift.diamond, gift.items);

        this.btnBuy.setVisible(false);
        this.btnBuy.setTouchEnabled(false);
        this.btnReceive.setVisible(true);
        this.btnReceive.setTouchEnabled(false);
        this.btnReceive.runAction(cc.spawn(
            cc.scaleTo(0.5, 0.5).easing(cc.easeBackIn()),
            cc.fadeOut(0.5)
        ));
    },

    effectReceive: function(){
        this.effectRunning = false;

        this.lastDay.stopAllActions();
        this.lastDay.runAction(cc.sequence(
            cc.spawn(
                cc.scaleTo(0.25, 0.5, 1).easing(cc.easeBackIn()),
                cc.fadeOut(0.25)
            ),
            cc.hide(),
            cc.callFunc(function(){
                this.lastDay.setScale(1);
                this.lastDay.setOpacity(255);
            }.bind(this))
        ));

        this.btnReceive.setTouchEnabled(false);
        this.btnReceive.stopAllActions();
        this.btnReceive.runAction(cc.sequence(
            cc.spawn(
                cc.scaleTo(0.25, 0.5).easing(cc.easeBackIn()),
                cc.fadeOut(0.25)
            ),
            cc.hide(),
            cc.callFunc(function(){
                this.btnReceive.setScale(1);
                this.btnReceive.setOpacity(255);
            }.bind(this))
        ));

        this.imgHover.setVisible(true);
        this.imgHover.setOpacity(0);
        this.imgHover.stopAllActions();
        this.imgHover.runAction(cc.fadeIn(0.5));

        this.imgReceived.setVisible(true);
        this.imgReceived.setOpacity(0);
        this.imgReceived.setScale(1.5);
        this.imgReceived.stopAllActions();
        this.imgReceived.runAction(cc.spawn(
            cc.fadeIn(0.5).easing(cc.easeSineIn()),
            cc.scaleTo(0.5, 1).easing(cc.easeSineIn())
        ));
    },

    getGoldIconPosition: function(){
        return this.pGold.convertToWorldSpace(this.pGold.getChildByName("icon").getPosition());
    },

    getVPointIconPosition: function(){
        return this.pVPoint.convertToWorldSpace(this.pVPoint.getChildByName("icon").getPosition());
    },

    getDiamondIconPosition: function(){
        return this.pDiamond.convertToWorldSpace(this.pDiamond.getChildByName("icon").getPosition());
    },

    getItemIconPosition: function(){
        return this.pItem.convertToWorldSpace(this.pItem.getChildByName("icon").getPosition());
    }
});
DailyPurchaseCell.BTN_BUY = 0;
DailyPurchaseCell.BTN_RECEIVE = 1;

var DailyPurchaseButton = cc.Node.extend({
    ctor: function(){
        this._super();

        this.btn = new ccui.ImageView("Lobby/DailyPurchase/btnLobby.png");
        this.btn.setAnchorPoint(0.5, 0.5);
        this.btn.setTouchEnabled(true);
        this.btn.addTouchEventListener(function(btn, type){
            if (type == ccui.Widget.TOUCH_ENDED) {
                if (sceneMgr.getMainLayer() instanceof LobbyScene) {
                    if (dailyPurchaseManager.checkOpen()) {
                        dailyPurchaseManager.openDailyPurchaseGUI();
                        fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, ConfigLog.BEGIN + "gui_lobby");
                    }
                    else dailyPurchaseManager.sendDailyPurchaseData();
                }
            }
        }.bind(this), this);
        this.addChild(this.btn);

        this.txtTime = new ccui.Text("23:59:59", "fonts/tahomabd.ttf", 13);
        this.txtTime.ignoreContentAdaptWithSize(true);
        this.txtTime.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.txtTime.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.txtTime.setAnchorPoint(0.5, 0.5);
        this.txtTime.setPosition(0, -32);
        this.txtTime.setColor(cc.color(239, 217, 108));
        this.txtTime.enableOutline(cc.color(131, 73, 52), 1);
        this.addChild(this.txtTime);

        this.hot = new cc.Node();
        this.hot.setPosition(30, 20);
        this.addChild(this.hot);
    },

    onEnter: function(){
        this._super();
        this.scheduleUpdate();
        this.hot.removeAllChildren();
        var anim = db.DBCCFactory.getInstance().buildArmatureNode("Notify");
        anim.gotoAndPlay("1", -1, -1, 0);
        this.hot.addChild(anim);
    },

    onExit: function(){
        this._super();
        this.unscheduleUpdate();
    },

    update: function(){
        var remainTime = dailyPurchaseManager.getRemainTime();
        if (remainTime > 1000 * 60 * 60 * 24) {
            var d = Math.ceil(remainTime / (1000 * 60 * 60 * 24));
            this.txtTime.setString(d + " ngày");
        }
        else{
            var s = Math.ceil(remainTime / 1000);
            var m = Math.floor(s / 60);
            s -= m * 60;
            var h = Math.floor(m / 60);
            m -= h * 60;
            this.txtTime.setString((h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s);
        }
    },

    showNotify: function(notify){
        this.hot.setVisible(notify);
    }
});


