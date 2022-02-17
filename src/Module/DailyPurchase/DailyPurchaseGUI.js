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
        this.bgRemainTime.setAnchorPoint(0.5, 0.5);
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
                this.setSubText(LocalizedString.to("DAILY_PURCHASE_EVENT_FINISHED"));
            else{
                switch(dailyPurchaseManager.getCurrentDayStatus()){
                    case DailyPurchaseManager.DAY_RECEIVED:
                        if (dailyPurchaseManager.checkTodayLastDay())
                            this.setSubText(LocalizedString.to("DAILY_PURCHASE_FINISH_TODAY"));
                        else
                            this.setSubText(LocalizedString.to("DAILY_PURCHASE_BACK_TOMORROW"));
                        break;
                    case DailyPurchaseManager.DAY_WAITING:
                        this.setSubText(LocalizedString.to("DAILY_PURCHASE_RECEIVE_TODAY"));
                        break;
                    default:
                        this.setSubText(LocalizedString.to("DAILY_PURCHASE_INFO"));
                        break;
                }
            }
        }
        else {
            this.bgRemainTime.setVisible(false);
            this.setSubText(LocalizedString.to("DAILY_PURCHASE_EVENT_END"));
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
                if (this.waitOpenShop) {
                    var shopTabIdx = gamedata.gameConfig.getShopGoldIndexById(dailyPurchaseManager.getPromoChannel());
                    var shop = sceneMgr.getMainLayer();
                    if (shop instanceof ShopIapScene)
                        shop.selectTabPaymentInGold(shopTabIdx);
                    else
                        gamedata.openShop(LobbyScene.className, true, shopTabIdx);
                }
                else{
                    NewVipManager.checkShowUpLevelVip();
                    fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, ConfigLog.END);
                }
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
    },

    setSubText: function(str){
        this.txtSub.setString(str);
        if (str === ""){
            this.bgRemainTime.setPositionX(this.bg.getContentSize().width / 2);
        }
        else{
            if (this.bgRemainTime.isVisible()){
                var width = this.txtSub.getContentSize().width + 10 + this.bgRemainTime.getContentSize().width;
                this.txtSub.setAnchorPoint(0, 0.5);
                this.txtSub.setPositionX(this.bg.getContentSize().width / 2 - width / 2);
                this.bgRemainTime.setPositionX(this.txtSub.getPositionX() + this.txtSub.getContentSize().width + 10 + this.bgRemainTime.getContentSize().width / 2);
            }
            else{
                this.txtSub.setAnchorPoint(0.5, 0.5);
                this.txtSub.setPositionX(this.bg.getContentSize().width / 2);
            }
        }
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