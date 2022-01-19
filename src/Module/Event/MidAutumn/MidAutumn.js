/**
 * Created by Hunter on 5/7/2018.
 */

var audioEngine = cc.audioEngine;

MidAutumn = cc.Class.extend({

    ctor: function () {
        // config
        this.eventTime = 0; // event 0 : off event || 1-4 :: week of event || 5 :: over event , wait off event
        this.giftNames = {}; // key : id of item - value : name of item
        this.giftValues = {}; // key : id of item - value : value of item
        this.giftPrices = {};
        this.giftIds = [];
        this.giftItemImages = {}; // key : id of item - value : image path of item
        this.costRoll = [1, 10, 50, 100];     // cost to roll in event
        this.configKeyCoin = [1, 10, 100, 200];
        this.bonusCostRoll = [];  // bonus cost
        this.bonusGold = 0; // bonus change gold in event
        this.timeEventEnd = 0;
        this.notifyEvent = false;
        this.eventWeeks = [];
        this.eventDayFrom = "";
        this.eventDayTo = "";
        this.eventLinkNews = "";

        // data
        this.isRequestedInfo = false;
        this.keyCoin = 0;
        this.curLevelExp = 1;
        this.nextLevelExp = 1;
        this.curLevel = 0;
        this.gifts = []; // Object : {id:id of item,item: num item collect,gift : num gift you have, numChange: num select change to gold}
        this.arrayGiftChange = [];
        this.numChange = 0;

        this.isRegisterSuccess = false;
        this.isBuyGEvent = true;

        this.nHammerDialogShow = 0;

        // auto gift daily and next week
        this.arAutoGifts = [];
        this.currentAutoGift = 0;

        // gui
        this.ignoreShowResultGUI = false;

        // history
        this.arOldGifts = [];
        this.arRollHistory = [];
        this.arGiftHistory = [-1];
        this.infoHistory = {
            name: "",
            phone: "",
            cmnd: "",
            address: "",
            email: ""
        };

        //notify bonus G
        this.isBonusG = false;
        this.nTimeBubbleBonusG = 0;

        // scene
        this.midAutumnScene = null;
        this.buttonLobby = null;
        this.showx2_daily = true;

        this.arrayLamp = [];
        this.arrayLampToSend = [];
        this.arrayPlayer = []; // mang panel Player trong ban choi, dung mang nay de add Item vao player trong ban choi
        this.arrayLampChange = [];
        this.idTabEventShop = 0;
        this.showX2Ticket = true;
    },

    preloadResource: function () {
        cc.log("MidAutumn::preloadResource");
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Lobby/EventMgr/midAutumn/EventButton/skeleton.xml","EventButton");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Lobby/EventMgr/midAutumn/EventButton/texture.plist", "EventButton");

        if (!this.isFinishDownload)
            return;

        LocalizedString.add("res/EventMgr/MidAutumn/MidAutumnRes/MDLocalized_vi");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/EventMgr/MidAutumn/MidAutumnRes/FX_nhanqua/skeleton.xml","FX_nhanqua");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/EventMgr/MidAutumn/MidAutumnRes/FX_nhanqua/texture.plist", "FX_nhanqua");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/EventMgr/MidAutumn/MidAutumnRes/OBimat/skeleton.xml","OBimat");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/EventMgr/MidAutumn/MidAutumnRes/OBimat/texture.plist", "OBimat");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/EventMgr/MidAutumn/MidAutumnRes/Oqua/skeleton.xml","Oqua");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/EventMgr/MidAutumn/MidAutumnRes/Oqua/texture.plist", "Oqua");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/EventMgr/MidAutumn/MidAutumnRes/plane/skeleton.xml","plane");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/EventMgr/MidAutumn/MidAutumnRes/plane/texture.plist", "plane");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/EventMgr/MidAutumn/MidAutumnRes/Logo/skeleton.xml","Logo");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/EventMgr/MidAutumn/MidAutumnRes/Logo/texture.plist", "Logo");

        MidAutumnSound.preloadAllSound();
        // var obj = {id:1000010, item: [2, 2, 2, 2], gift: 0, numChange: [0, 0, 0, 0]};
        // this.arrayGiftChange.push(obj);
        //
        // obj = {id:1000020, item: [200, 0, 0, 0], gift: 0, numChange: [0, 0, 0, 0]};
        // this.arrayGiftChange.push(obj);
        //
        // obj = {id:1000030, item: [300, 0, 0, 0], gift: 0, numChange: [0, 0, 0, 0]};
        // this.arrayGiftChange.push(obj);
        //
        // obj = {id:1000040, item: [2, 0, 0, 0], gift: 0, numChange: [0, 0, 0, 0]};
        // this.arrayGiftChange.push(obj);
        //
        // obj = {id:1000050, item: [2, 0, 0, 0], gift: 0, numChange: [0, 0, 0, 0]};
        // this.arrayGiftChange.push(obj);
    },

    resetData: function () {
        // config
        this.eventTime = 0; // event 0 : off event || 1-4 :: week of event || 5 :: over event , wait off event
        this.giftNames = {}; // key : id of item - value : name of item
        this.giftValues = {}; // key : id of item - value : value of item
        this.giftItemImages = {}; // key : id of item - value : image path of item
        this.bonusCostRoll = [];  // bonus cost
        this.bonusGold = 0; // bonus change gold in event
        this.timeEventEnd = 0;
        this.notifyEvent = false;
        this.eventWeeks = [];
        this.eventDayFrom = "";
        this.eventDayTo = "";

        // data
        this.isRequestedInfo = false;
        this.keyCoin = 0;
        this.curLevelExp = 0
        this.nextLevelExp = 1000000;
        this.curLevel = 0;
        this.gifts = []; // Object : {id:id of item,item: num item collect,gift : num gift you have }

        this.isRegisterSuccess = false;
        this.isBuyGEvent = true;

        //notify bonus G
        this.isBonusG = false;

        // scene
        this.midAutumnScene = null;
        this.buttonLobby = null;
        this.showx2_daily = true;

        // gui
        this.ignoreShowResultGUI = false;

        // auto gift daily and next week
        this.arAutoGifts = [];
        this.currentAutoGift = 0;

        this.arrayLamp = [];
        this.usingLampId = -1;
        this.arrayLampChange = [];
        this.arrayGiftChange = [];
        this.arrayLampToSend = [];

        this.sendCheckNewDay = false;
        this.saveDay = -1;
    },

    requestOnShop: function () {
        // clear config
        event.updateEventConfig(true);

        if (this.isRequestedInfo) return;

        var cmd = new CmdSendMidAutumnOpen();
        GameClient.getInstance().sendPacket(cmd);
    },

    requestShopEventConfig: function () {
        setTimeout(function () {
            var cmd = new CmdSendMidAutumn();
            GameClient.getInstance().sendPacket(cmd);

            cmd = new CmdSendRequestEventShop();
            GameClient.getInstance().sendPacket(cmd);
        }, 1000);
    },

    // show gui - dialog - panel
    openEvent: function () {
        if (this.eventTime == 0) return;

        var timeLeft = this.getTimeLeft();
        if (timeLeft <= 0 && midAutumn.checkWeek(MD_WEEK_END)) {
            midAutumn.eventTime = MD_WEEK_END + 1;
            sceneMgr.showOKDialog(LocalizedString.to("MD_EVENT_TIMEOUT"));
        }

        if (midAutumn.isInEvent()) {
            var func = function () {
                sceneMgr.openScene(MD_SCENE_CLASS);
            }
            resourceManager.openGUI(MD_SCENE_CLASS, func);
        }

        if (midAutumn.isEndEvent())
            NativeBridge.openWebView(midAutumn.eventLinkNews);
    },

    showNotifyEvent: function (btn) {
        cc.log("MidAutumn::showNotifyEvent Button " + btn);
        this.buttonLobby = btn;

        // check show notify event
        if (this.keyCoin > 0) {
            this.notifyEvent = true;
        }
        for (var i = 0; i < this.gifts.length; i++) {
            if (this.gifts[i].gift > 0) {
                this.notifyEvent = true;
            }
        }

        if (this.buttonLobby.notify)
            this.buttonLobby.notify.setVisible(this.notifyEvent);

        if (this.isInEvent()) {
            this.showEventButton();

            this.ignoreShowResultGUI = this.checkIgnoreResultGUI();

            if (this.isFinishDownload) {
                if (this.checkNewDay()) {
                    var func = function () {
                        sceneMgr.openGUI(MD_NOTIFY_CLASS, MD_NOTIFY_ORDER, MD_NOTIFY_ORDER, false);
                    }
                    resourceManager.openGUI(MD_NOTIFY_CLASS, func);
                } else {
                    this.showHammerEmpty(MD_HAMMER_NOTIFY_EMPTY);
                }
                if (this.showX2G && this.showx2_daily) {
                    this.showX2G = false;
                    this.showx2_daily = false;
                    sceneMgr.openGUI(MD_NOTIFY_PROMOTE_G_CLASS, MD_NOTIFY_PROMOTE_G_ORDER, MD_NOTIFY_PROMOTE_G_ORDER, false);
                }
            }
            this.sendGetLampInfo();
        }
        else if (this.isEndEvent()) {
            //this.showEventButton();
            this.buttonLobby.setVisible(false);
        }
        else {
            this.buttonLobby.setVisible(false);
        }
    },

    showEventButton: function () {
        cc.log("MidAutumn::showEventButton");

        if (this.buttonLobby === undefined || this.buttonLobby == null) return;

        if (this.isInEvent() || this.isEndEvent()) {
            this.effectEventButton();
            this.buttonLobby.setVisible(true);
        } else {
            this.buttonLobby.setVisible(false);
        }
    },

    showPromoTicket: function () {
        if (this.checkNewDayPromoTicket()) {
            var gui = sceneMgr.openGUI(MidAutumnPromoTicketGUI.className, MidAutumnPromoTicketGUI.TAG, MidAutumnPromoTicketGUI.TAG, false);
            this.saveCurrentDayPromoTicket();
        }
        else {

        }
    },

    showRegisterInformation: function (gIds) {
        var gui = sceneMgr.openGUI(MD_REGISTER_GUI_CLASS, MD_REGISTER_GUI_ORDER, MD_REGISTER_GUI_ORDER, false);
        if (gui) gui.updateInfor(gIds);
    },

    showAutoGift: function () {
        if (this.currentAutoGift < 0 || this.currentAutoGift >= this.arAutoGifts.length) return;

        var info = this.arAutoGifts[this.currentAutoGift];
        this.currentAutoGift += 1;
        var func = function () {
            var open = sceneMgr.openGUI(MD_OPEN_GIFT_GUI_CLASS, MD_OPEN_GIFT_GUI_ORDER, MD_OPEN_GIFT_GUI_ORDER);
            if (open) open.showGift(info, true);
        }
        resourceManager.openGUI(MD_OPEN_GIFT_GUI_CLASS, func);

    },

    showNotifyBonusGPanel: function () {
        if (!this.isInEvent()) return;
        if (!this.isBonusG) return;
        if (this.checkNotifyBonusGPanel()) {
            sceneMgr.openGUI(MD_NOTIFY_BONUS_G_CLASS, MD_DIALOG_ORDER, MD_DIALOG_ORDER);
        }
    },

    showBubbleBonusG: function () {
        if (!this.isInEvent()) return;
        if (!this.isBonusG) return;

        // cc.log(this.nTimeBubbleBonusG);
        if (this.nTimeBubbleBonusG >= 0) {
            this.nTimeBubbleBonusG--;
            if (this.nTimeBubbleBonusG <= 0) {
                this.nTimeBubbleBonusG = 400;
                var clb = sceneMgr.getMainLayer();
                if (clb instanceof LobbyScene) {
                    var posG = clb.btnG.getParent().convertToWorldSpace(clb.btnG.getPosition());
                    posG.y += 20;
                    posG.x += clb.btnG.getContentSize().width / 2 - 10;
                    BubbleToast.makeBubble(5, "+100% G Nạp", posG, {
                        textColor: cc.color(255, 255, 0, 0),
                        arrowPos: -1
                    });
                }
            }
        }
    },

    showHammerEmpty: function (type) {
        if (type == MD_HAMMER_NOTIFY_EMPTY) {
            var curLayer = sceneMgr.getMainLayer();
            // if (curLayer && curLayer instanceof LobbyScene) {
            //     if (this.checkNotifyBonusTicketNewDay() && !this.isBuyGEvent) {
            //         sceneMgr.openGUI(MD_NOTIFY_BONUS_TICKET_CLASS, MD_DIALOG_ORDER, MD_DIALOG_ORDER);
            //     }
            // }

            if (curLayer && curLayer instanceof MidAutumnScene) {
                if (this.keyCoin > 0) return;

                if (this.nHammerDialogShow <= 0) {
                    this.nHammerDialogShow = MD_HAMMER_EMPTY_COUNT_DOWN_SHOW;

                    if (this.isBuyGEvent) {
                        sceneMgr.openGUI(MD_HAMMER_EMPTY_CLASS, MD_DIALOG_ORDER, MD_DIALOG_ORDER).setGUI(MD_HAMMER_NOTIFY_EMPTY);
                    } else {
                        // sceneMgr.openGUI(MD_NOTIFY_BONUS_TICKET_CLASS, MD_DIALOG_ORDER, MD_DIALOG_ORDER);
                    }
                } else {
                    this.nHammerDialogShow--;
                }
            }
        }

        if (type == MD_HAMMER_ROLL_EMPTY) {
            sceneMgr.openGUI(MD_HAMMER_EMPTY_CLASS, MD_DIALOG_ORDER, MD_DIALOG_ORDER).setGUI(MD_HAMMER_ROLL_EMPTY);
        }
    },

    effectEventButton: function () {
        try {
            if (!this.buttonLobby) return;
            this.buttonLobby.anim.removeAllChildren();
            this.buttonLobby.button.setContentSize(300, 300);
            this.buttonLobby.anim.eff = resourceManager.loadDragonbone("EventButton");
            this.buttonLobby.anim.addChild(this.buttonLobby.anim.eff);
            this.buttonLobby.anim.eff.setPosition(0, 20);
            this.buttonLobby.anim.eff.gotoAndPlay("1", -1, -1, 0);
            this.buttonLobby.notify.setVisible(this.notifyEvent);
            this.buttonLobby.time.setFontSize(16);
            //  this.buttonLobby.time.setString(midAutumn.getTimeLeft());
            this.buttonLobby.time.setColor(cc.color(159, 153, 201));
            // this.buttonLobby.time.enableOutline(cc.color(162, 153, 202), 0);
            this.buttonLobby.time.setPositionY(this.buttonLobby.time.getPositionY() - 15);
            this.buttonLobby.notify.setPosition(this.buttonLobby.notify.x + 0, this.buttonLobby.notify.y + 20);
        }
        catch (e) {
            cc.log("ERROR " + e.stack);
        }
    },

    // utils
    resetEventButton: function () {
        this.buttonLobby = null;
    },

    getTicketTexture: function(){
        return "res/EventMgr/MidAutumn/MidAutumnUI/hammer.png";
    },

    getOfferTicketImage: function (id) {
        return "res/Lobby/Offer/bonusMidAutumn.png";
    },

    getOfferTicketString: function (id) {
        return "Vé";
    },

    getNumLampChangeByType: function (type) {
        var count = 0;
        for (var i = 0; i < this.arrayLampChange.length; i++) {
            if (this.arrayLampChange[i].type == type && this.arrayLampChange[i].numChange > 0) {
                count = count + this.arrayLampChange[i].numChange;
            }
        }
        return count;
    },

    getGolLampByType: function (type) {
        for (var i = 0; i < this.lampTypeId.length; i++) {
            if (type = this.lampTypeId[i]) {
                return this.lampTypeValue[i];
            }
        }
        return 0;
    },

    isUsingLamp: function (id, index, isRolled) {
        if (midAutumn.usingLampIsRolled) {
            if (midAutumn.usingLampId == id && midAutumn.usingLampIsRolled == isRolled)
                return true;
        }
        else {
            if (midAutumn.usingLampId == id && midAutumn.usingLampIsRolled == isRolled && index == midAutumn.usingLampIndex)
                return true;
        }
        return false;
    },

    getImgType: function (type) {
        return "res/EventMgr/MidAutumn/MidAutumnUI/imgType_" + type + ".png";
    },

    getImgLamp: function (id) {
        return "res/EventMgr/MidAutumn/MidAutumnUI/lamp" + id + ".png";
    },

    checkNewDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("st_current_day_" + gamedata.userData.uID);

        if (sDay != cDay) {
            return true;
        }
        return false;
    },

    saveCurrentDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("st_current_day_" + gamedata.userData.uID, sDay);
    },

    checkNewDayPromoTicket: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("st_current_day_promoTicket" + gamedata.userData.uID);

        if (sDay != cDay) {
            return true;
        }
        return false;
    },

    saveCurrentDayPromoTicket: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("st_current_day_promoTicket" + gamedata.userData.uID, sDay);
    },

    checkNewDayNapG: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("st_current_day_napg" + gamedata.userData.uID);

        if (sDay != cDay) {
            return true;
        }
        return false;
    },

    saveCurrentDayNapG: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("st_current_day_napg" + gamedata.userData.uID, sDay);
    },

    checkIgnoreResultGUI: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("secret_tower_current_day_ignore_" + gamedata.userData.uID);

        if (sDay == cDay) {
            return true;
        }
        return false;
    },

    saveIgnoreResultGUI: function (ignore) {
        this.ignoreShowResultGUI = ignore;
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("secret_tower_current_day_ignore_" + gamedata.userData.uID, ignore ? sDay : "");
    },

    checkNotifyBonusTicketNewDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("st_notify_g_day_" + gamedata.userData.uID);

        if (sDay != cDay) {
            return true;
        }
        return false;
    },

    saveNotifyBonusTicketCurrentDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("st_notify_g_day_" + gamedata.userData.uID, sDay);
    },

    checkNotifyBonusGPanel: function () {
        var d = new Date();
        var curTime = d.getTime();
        var lastTime = cc.sys.localStorage.getItem("st_notify_bonus_g_last_time_" + gamedata.userData.uID);

        if (isNaN(lastTime)) lastTime = 0;

        if (curTime - lastTime > MD_NOTIFY_BONUS_G_COUNT_DOWN) {
            return true;
        }
        return false;
    },

    saveNotifyBonusGPanel: function () {
        var d = new Date().getTime();

        cc.sys.localStorage.setItem("st_notify_bonus_g_last_time_" + gamedata.userData.uID, d);
    },

    // gift history
    saveLastGifts: function () {
        try {
            this.arOldGifts = {};
            for (var i = 0; i < this.gifts.length; i++) {
                var obj = this.gifts[i];
                if (obj.gift > 0) {
                    for (var j = 0; j < obj.item.length; j++) {
                        this.arOldGifts[obj.id + j + 1] = 1;
                    }
                } else {
                    for (var j = 0; j < obj.item.length; j++) {
                        if (obj.item[j] > 0) {
                            this.arOldGifts[obj.id + j + 1] = 1;
                        }
                    }
                }

            }

            // cc.log("--SaveGifts : " + JSON.stringify(this.arOldGifts));
            cc.sys.localStorage.setItem("md_last_gift_" + gamedata.userData.uID, JSON.stringify(this.arOldGifts));
        } catch (e) {
            cc.log("SaveLastGifts : " + JSON.stringify(e));
        }

    },

    getLastGifts: function () {
        try {
            if (this.arOldGifts.length <= 0) {
                var sAr = cc.sys.localStorage.getItem("md_last_gift_" + gamedata.userData.uID);
                this.arOldGifts = JSON.parse(sAr);
            }
        } catch (e) {
            this.saveLastGifts();
            cc.log("--GetLastGifts Error : " + JSON.stringify(e));
        }

        return this.arOldGifts;
    },

    checkInLastGifts: function (id) {
        // cc.log("--CheckLast " + id + " in " + JSON.stringify(this.arOldGifts));
        if (!this.isItemStored(id)) return true;
        return (id in this.arOldGifts);
    },

    // GET - SET

    getTotalPriceGift: function () {
        var total = 0;
        cc.log("GETTOTALPRICE " + JSON.stringify(this.arAutoGifts));
        for (var i = 0; i < this.arAutoGifts.length; i++) {
            total = total + this.giftPrices[this.arAutoGifts[i].id];
        }
        for(var i = 0, size = this.gifts.length ; i < size ; i++) {
            var obj = this.gifts[i];
            if (obj.gift > 0) {
                total = total + this.giftPrices[obj.id];
            }
        }

        if (this.registerData) {
            cc.log( "total " + total + "REGISTERED " + JSON.stringify(this.registerData.giftIds) +  " flkdj " + JSON.stringify(this.giftPrices));
            for (var i = 0; i < this.registerData.giftIds.length; i++) {
                total = total + this.giftPrices[this.registerData.giftIds[i]];
            }
        }
        cc.log("TOTAL " + total);
        return total;
    },

    getPieceImage: function (id) {
        cc.log("GetPiece " + id);
        if (this.isLamp(id))
            return "res/EventMgr/MidAutumn/MidAutumnUI/lamp" + id + ".png";
        if (this.isItemStored(id))
            return "res/EventMgr/MidAutumn/MidAutumnUI/e" + id + ".png";
        return "res/EventMgr/MidAutumn/MidAutumnUI/icon_gold.png";
    },

    getItemName: function (id) {
        id = this.convertIdNormal(id);
        // if (midAutumn.isItemOutGame(id)) {
        //     return LocalizedString.to("MD_ITEM_FULL_" + id);
        // }

        if (id in this.giftNames) {
            return this.giftNames[id];
        }
        return id;
    },

    getItemNameSub: function (id) {
        id = this.convertIdNormal(id);
        // if (midAutumn.isItemOutGame(id)) {
        //     return LocalizedString.to("MD_ITEM_SUB_" + id);
        // }

        return this.getItemName(id);
    },

    getItemNameShort: function (id) {
        var game = LocalizedString.config("GAME");
        id = this.convertIdNormal(id);
        if (midAutumn.isItemOutGame(id) && false) {
            return LocalizedString.to("MD_ITEM_LITE_" + id + "_" + game);
        }

        return this.getItemName(id);
    },

    getItemValue: function (id) {
        id = this.convertIdNormal(id);
        if (this.isItemStored(id))
            return 1;
        if (id in this.giftValues)
            return this.giftValues[id];
        return 1;
    },

    getGiftImage: function (id) {
        id = this.convertIdNormal(id);
        if (this.isItemStored(id))
            return "res/EventMgr/MidAutumn/MidAutumnUI/enLarge" + id + ".png";
        return "res/EventMgr/MidAutumn/MidAutumnUI/en10.png"
    },

    getGiftImageOpen: function (id) {
        //id = this.convertIdNormal(id);
        //  if(this.isItemStored(id))
        return "res/EventMgr/MidAutumn/MidAutumnUI/enLarge" + id + ".png";
        //  return "res/EventMgr/MidAutumn/MidAutumnUI/en10.png"
    },

    getEggImage: function (id) {
        id = this.convertIdNormal(id);
        if (this.isItemStored(id))
            return "res/EventMgr/MidAutumn/MidAutumnUI/s" + id + ".png";
        if (id == -2) {
            return "res/EventMgr/MidAutumn/MidAutumnUI/cell_stone.png";
        }
        if (id == 0) {
            return "";
        }
        return "res/EventMgr/MidAutumn/MidAutumnUI/i10.png"
    },

    getGiftBackgroundImage: function (id) {
        id = this.convertIdNormal(id);
        if (this.isItemStored(id))
            return "res/EventMgr/MidAutumn/MidAutumnUI/eb" + id + ".png"
        return "res/EventMgr/MidAutumn/MidAutumnUI/eb10.png"
    },

    getStageId: function () {
        if (!this.mapInfo) return 0;
        return this.mapInfo.stage;
    },

    getStageImage: function (stage) {
        if (!this.mapInfo) stage = 0;
        if (stage === undefined || stage == null) stage = this.mapInfo.stage;

        if (stage < 0 || stage > 2) return "res/EventMgr/MidAutumn/MidAutumnUI/stage0.png";
        return "res/EventMgr/MidAutumn/MidAutumnUI/stage" + stage + ".png";
    },

    getStageBackgroundImage: function (stage) {
        if (!this.mapInfo) stage = 0;
        if (stage === undefined || stage == null) stage = this.mapInfo.stage;

        if (stage < 0 || stage > 2) return "res/EventMgr/MidAutumn/MidAutumnUI/bg_stage0.jpg";
        return "res/EventMgr/MidAutumn/MidAutumnUI/bg_stage" + stage + ".jpg";
    },

    getStageWaveImage: function () {
        if (!this.mapInfo) return "res/EventMgr/MidAutumn/MidAutumnUI/wave_stage0.png";
        if (this.mapInfo.stage < 0 || this.mapInfo.stage > 2) return "";
        return "res/EventMgr/MidAutumn/MidAutumnUI/wave_stage" + this.mapInfo.stage + ".png";
    },

    convertIdNormal: function (id) {
        if (this.isItemStored(id) && id % 10 != 0) {
            id = Math.floor(id / 10) * 10;
        }
        return id;
    },

    getIndexFromPoint: function (row, column) {
        return row * MD_COL + column;
    },

    getExpString: function () {
        return StringUtility.pointNumber(this.curLevelExp) + "/" + StringUtility.pointNumber(this.nextLevelExp);
    },

    getExpPercent: function () {
        if (this.nextLevelExp <= 0) this.nextLevelExp = 1;
        return parseFloat(this.curLevelExp * 100 / this.nextLevelExp);
    },

    getTimeLeft: function () {
        var timeNow = Math.floor(Date.now() / 1000);
        return (this.timeEventEnd - timeNow);
    },

    getTimeLeftString: function (fullTime) {
        if (fullTime === undefined) fullTime = false;

        var timeLeft = this.getTimeLeft();
        if (timeLeft <= 0) return 0;

        var day = parseInt(timeLeft / 86400);
        timeLeft -= day * 86400;
        var hour = parseInt(timeLeft / 3600);
        timeLeft -= hour * 3600;
        var minute = parseInt(timeLeft / 60);
        timeLeft -= minute * 60;

        var str = "";
        if (fullTime) {
            str = LocalizedString.to("MD_TIME_LEFT_FORMAT_FULL");
            str = StringUtility.replaceAll(str, "@day", day);
            str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
            str = StringUtility.replaceAll(str, "@minute", (minute < 10) ? "0" + minute : minute);
            str = StringUtility.replaceAll(str, "@second", (timeLeft < 10) ? "0" + timeLeft : timeLeft);
            return str;
        } else {
            if (day > 0) {
                str = LocalizedString.to("MD_TIME_LEFT_FORMAT_DAY");
                str = StringUtility.replaceAll(str, "@day", day);
            } else {
                //str = LocalizedString.to("MD_TIME_LEFT_FORMAT_HOURS");
                //str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
                //if (hour <= 0) {
                //    str = str.substr(str.indexOf("@minute"), str.length);
                //}
                //else {
                //    str = str.substr(str.indexOf("@minute"), str.length);
                //}

                if (hour > 0) {
                    str = LocalizedString.to("MD_TIME_LEFT_FORMAT_HOURS");
                } else if (minute > 0) {
                    str = LocalizedString.to("MD_TIME_LEFT_FORMAT_MINUTES");
                } else {
                    str = LocalizedString.to("MD_TIME_LEFT_FORMAT_SECONDS");
                }

                str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
                str = StringUtility.replaceAll(str, "@minute", (minute < 10) ? "0" + minute : minute);
                str = StringUtility.replaceAll(str, "@second", (timeLeft < 10) ? "0" + timeLeft : timeLeft);
            }
        }
        return str;

        //if (timeLeft > 0) {
        //    var str = LocalizedString.to("MD_TIME_LEFT_FORMAT_FULL");
        //    if (day > 0)
        //        str = StringUtility.replaceAll(str, "@day", day);
        //    else
        //        str = str.substr(str.indexOf("@hour"), str.length);
        //
        //    str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
        //
        //    if(day <=0 && hour <= 0)
        //    {
        //        str = str.substr(str.indexOf("@minute"), str.length);
        //    }
        //    str = StringUtility.replaceAll(str, "@minute", (minute < 10) ? "0" + minute : minute);
        //    str = StringUtility.replaceAll(str, "@second", (timeLeft < 10) ? "0" + timeLeft : timeLeft);
        //    return str;
        //}
        //
        //return timeLeft;
    },

    getCostRoll: function (type) {
        // if (type < 0 || type >= this.costRoll.length) return 0;
        return this.costRoll[type];
    },

    getBonusCostRoll: function (type) {
        if (type < 0 || type >= this.bonusCostRoll.length) return 0;
        return this.bonusCostRoll[type];
    },

    getTypeRoll: function (type) {
        return (type + 1);
    },

    getBonusDiscount: function () {
        // cc.log("lfjds************************************** " + JSON.stringify(this.costRoll));
        var price1 = this.costRoll[1] * 10;
        var price2 = this.costRoll[2];
        var per = Math.floor((price1 - price2) / price1 * 100);
        return per;
    },

    getNumChange: function () {
        var count = 0;
        for (var i = 0; i < this.arrayGiftChange.length; i++) {
            for (var j = 0; j < this.arrayGiftChange[i].numChange.length; j++) {
                count = this.arrayGiftChange[i].numChange[j] + count;
            }
        }
        return count;
    },

    getGoldChange: function () {
        var count = this.getNumChange();
        return count * 500000;
    },

    resetChange: function () {
        for (var i = 0; i < this.arrayGiftChange.length; i++) {
            this.arrayGiftChange[i].numChange = [0, 0, 0, 0];
        }
    },

    autoSelectChange: function () {
        for (var i = 0; i < this.arrayGiftChange.length; i++) {
            for (var j = 0; j < this.arrayGiftChange[i].numChange.length; j++) {
                if (this.arrayGiftChange[i].item[j] > 1)
                    this.arrayGiftChange[i].numChange[j] = this.arrayGiftChange[i].item[j] - 1;
            }
        }
    },

    resetChangeLamp: function () {
        for (var i = 0; i < this.arrayLampChange.length; i++) {
            this.arrayLampChange[i].numChange = 0;
        }
    },

    autoSelectChangeLamp: function () {
        for (var i = 0; i < this.arrayLampChange.length; i++) {
            if (this.isUsingLamp(this.arrayLampChange[i].id, this.arrayLampChange[i].index, this.arrayLampChange[i].isRolledLamp)) {
                this.arrayLampChange[i].numChange = this.arrayLampChange[i].num - 1;
            }
            else {
                this.arrayLampChange[i].numChange = this.arrayLampChange[i].num;
            }
        }
    },

    sendListChange: function () {
        var arrayId = [];
        var arrayPiece = [];
        var arrayNum = [];

        var arrayGoldId = [];
        var arrayGoldPiece = [];
        var arrayGoldNum = [];

        for (var i = 0; i < this.arrayGiftChange.length; i++) {
            for (var j = 0; j < this.arrayGiftChange[i].numChange.length; j++) {
                if (this.arrayGiftChange[i].numChange[j] > 0) {
                    if (this.isItemOutGame(this.arrayGiftChange[i].id)) {
                        arrayId.push(this.arrayGiftChange[i].id);
                        arrayPiece.push(j);
                        arrayNum.push(this.arrayGiftChange[i].numChange[j]);
                    } else {
                        arrayGoldId.push(this.arrayGiftChange[i].id);
                        arrayGoldPiece.push(j);
                        arrayGoldNum.push(this.arrayGiftChange[i].numChange[j]);
                    }
                }
            }
        }
        var cmd = new CmdSendMidAutumnChangePiece();
        cmd.putData(arrayId, arrayPiece, arrayNum, arrayGoldId, arrayGoldPiece, arrayGoldNum);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendGetLampInfo: function () {
        var cmd = new CmdSendMidAutumnGetLampInfo();
        cmd.putData();
        GameClient.getInstance().sendPacket(cmd);
    },

    sendChangeLamp: function () {
        var cmd = new CmdSendMidAutumnChangeLamp();
        var isRolledLamp = [];
        var index = [];
        var id = [];
        var num = [];
        for (var i = 0; i < this.arrayLampChange.length; i++) {
            if (this.arrayLampChange[i].numChange > 0) {
                isRolledLamp.push(this.arrayLampChange[i].isRolledLamp);
                index.push(this.arrayLampChange[i].index);
                id.push(this.arrayLampChange[i].id);
                num.push(this.arrayLampChange[i].numChange);
            }
        }
        if (isRolledLamp.length > 0) {
            cmd.putData(isRolledLamp, index, id, num);
            GameClient.getInstance().sendPacket(cmd);
        }
        else {
            ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_NOT_SELECT_LAMP_CHANGE"))
        }
    },

    sendSendLamp: function (id, toId, message) {
        var cmd = new CmdSendMidAutumnSendLamp();
        cmd.putData(id, toId, message);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendUseLamp: function (isRolledLamp, id, index) {
        var cmd = new CmdSendMidAutumnUseLamp();
        cmd.putData(isRolledLamp, id, index);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendBuyTicketG: function (cost) {
        var cmd = new CmdSendMidAutumnBuyTicketG();
        cmd.putData(cost);
        GameClient.getInstance().sendPacket(cmd);
    },

    isItemOutGame: function (id) {
        return (id > MD_ITEM_OUT_GAME);
    },

    isItemStored: function (id) {
        if (this.isLamp(id))
            return false;
        return (id > MD_ITEM_STORED);
    },

    isLamp: function (id) {
        if (id > MD_ITEM_LAMP)
            return id < MD_ITEM_OUT_GAME;
        return false;
    },

    checkWeek: function (week) {
        return (this.eventTime == week);
    },

    isInEvent: function () {
        if (this.eventTime >= MD_WEEK_START && this.eventTime <= MD_WEEK_END) return true;
        return false;
    },

    isEndEvent: function () {
        if (this.eventTime == MD_WEEK_END + 1) return true;
        return false;
    },

    isCharacterHere: function (x, y) {
        return (this.mapInfo.row == x && this.mapInfo.col == y);
    },

    // FUNCTION
    onEvent: function (cmd) {
        cc.log("##MidAutumn::onEvent " + JSON.stringify(cmd));

        this.eventTime = cmd.eventTime;

        this.giftIds = cmd.giftIds;
        for (var i = 0; i < cmd.giftIds.length; i++) {
            this.giftNames[cmd.giftIds[i] + ""] = cmd.giftNames[i];
            this.giftValues[cmd.giftIds[i] + ""] = cmd.giftValues[i];
            this.giftPrices[cmd.giftIds[i] + ""] = cmd.giftPrices[i];
            //this.giftItemImages[cmd.giftIds[i] + ""] = this.getItemImage(cmd.giftIds[i]);
        }

        this.timeEventEnd = Math.floor((Date.now() + cmd.timeLeft) / 1000);

        // this.costRoll = cmd.costs;
        //this.bonusCostRoll = cmd.bonus;

        this.isRegisterSuccess = cmd.isRegisterSuccess;
        this.isRegisterSuccess = true;
        this.eventWeeks = cmd.eventWeeks;
        this.eventDayFrom = cmd.eventDayFrom;
        this.eventDayTo = cmd.eventDayTo;
        this.showX2G = cmd.showX2G;
        this.isBonusG = cmd.showX2G;
        this.eventLinkNews = cmd.urlNews;
        this.isBuyGEvent = cmd.isBuyGEvent;
        // MidAutumnScene.doLoop();
        this.isBonusG = false;
        this.showX2G = false;

        this.showEventButton();

        var gui = sceneMgr.getMainLayer();
        if (gui && gui instanceof MidAutumnScene) {
            gui.updateEventInfo();
        }

        // update shop
        if (midAutumn.isInEvent()) {
            event.updateEventConfig();
        }

        var cmd = new CmdSendMidAutumnOpen();
        cmd.putData(0);
        GameClient.getInstance().sendPacket(cmd);

        if (CheckLogic.checkInBoard() && this.isInEvent()){
            var gui = sceneMgr.getMainLayer();
            gui.initEventMidAutumn();
        }
    },

    notifyMidAutumnAction: function (cmd) {
        this.notifyEvent = cmd.notify;

        if (cmd.gifts.length > 0) {
            this.arAutoGifts = cmd.gifts;
            this.currentAutoGift = 0;

            this.showAutoGift();
        }

        if (cmd.totalGold > 0) {
            if (this.isFinishDownload) {
                var func = function () {
                    var open = sceneMgr.openGUI(MD_PIECE_GUI_CLASS, MD_PIECE_GUI_ORDER, MD_PIECE_GUI_ORDER);
                    if (open) open.showPieces(cmd.totalGold);
                }
                resourceManager.openGUI(MD_PIECE_GUI_CLASS, func);
            }
        }
    },

    updateEventInfo: function (cmd) {
        sceneMgr.clearLoading();

        this.isRequestedInfo = true;

        this.keyCoin = cmd.keyCoin;
        this.curLevelExp = cmd.currentLevelExp;
        this.nextLevelExp = cmd.nextLevelExp;
        this.curLevel = cmd.curLevel;

        // init gifts
        this.gifts = [];
        for (var i = 0, size = this.giftIds.length; i < size; i++) {
            var id = this.giftIds[i];
            if (this.isItemStored(id)) {
                var obj = cmd.list[id];

                var item = {};
                item.id = id;
                item.item = obj ? obj.item : [0, 0, 0, 0];
                item.gift = obj ? obj.gift : 0;
                item.numChange = [0, 0, 0, 0];
                if (item.item == 0 && item.gift > 0) item.item = MD_MAX_ITEM_CONVERT_GIFT;
                this.gifts.push(item);
            }
        }

        this.mapInfo = cmd.mapInfo;

        //this.gifts.sort(function(a,b){return (a.id - b.id)});
        this.gifts.sort(function (a, b) {
            if (a.gift > 0 && b.gift > 0) {
                return (a.id - b.id);
            }
            if (a.gift <= 0 && b.gift <= 0) {
                var aItem = 0;
                for (var i = 0; i < a.item.length; i++) {
                    aItem += parseInt(a.item[i]);
                }
                var bItem = 0;
                for (var i = 0; i < b.item.length; i++) {
                    bItem += parseInt(b.item[i]);
                }
                return (aItem - bItem);
            } else {
                return (a.gift - b.gift);
            }
        });
        cc.log("++Gifts : " + JSON.stringify(midAutumn.gifts));

        this.mapInfo.remainMove = 0;

        var mainLayer = sceneMgr.getMainLayer();
        if (mainLayer instanceof ShopIapScene) {
            mainLayer.updateEventInfo();
        }

        // update eggBreaker scene
        if (this.midAutumnScene) {
            this.midAutumnScene.updateEventInfo();
        }

        // create array gift to change
        this.createListGiftOutGame();
    },

    createListGiftOutGame: function () {
        this.arrayGiftChange = [];
        for (var i = 0; i < this.gifts.length; i++) {
            // if (this.isItemOutGame(this.gifts[i].id)) {
            for (var j = 0; j < 4; j++) {
                if (this.gifts[i].item[j] > 0 && this.gifts[i].gift <= 0) {
                    this.arrayGiftChange.push(this.gifts[i]);
                    break;
                }
            }
            //  }
        }

        var gui = sceneMgr.getGUIByClassName("MidAutumnHistoryGUI");
        if (gui && gui.isVisible())
            gui.pChangePiece.panel.updateData();
    },

    createListLampChange: function () {
        this.arrayLampChange = [];
        for (var i = 0; i < this.arrayLamp.length; i++) {
            if (this.arrayLamp[i].num > 0) {
                // neu den la den ban tang, dang khong su dung thi doi duoc
                if (!this.arrayLamp[i].isRolledLamp) {
                    if (!this.isUsingLamp(this.arrayLamp[i].id, this.arrayLamp[i].index, this.arrayLamp[i].isRolledLamp)) {
                        this.arrayLampChange.push(this.arrayLamp[i]);
                    }
                }
                // neu la den quay duoc, neu dang su dung thi so den phai lon hon 1 moi doi duoc
                else {
                    if (this.isUsingLamp(this.arrayLamp[i].id, this.arrayLamp[i].index, this.arrayLamp[i].isRolledLamp)) {
                        if (this.arrayLamp[i].num > 1) {
                            this.arrayLampChange.push(this.arrayLamp[i]);
                        }
                    }
                    else {
                        this.arrayLampChange.push(this.arrayLamp[i]);
                    }
                }
            }
        }

        // var gui = sceneMgr.getGUIByClassName("MidAutumnHistoryGUI");
        // if (gui && gui.isVisible())
        //     gui.pChangePiece.panel.updateData();
    },

    onAccumulate: function (cmd) {
        var gui = sceneMgr.openGUI(MD_ACCUMULATE_GUI_CLASS, MD_ACCUMULATE_GUI_ORDER, MD_ACCUMULATE_GUI_ORDER, false);
        if (gui) gui.showAccumulate(cmd);
    },

    onRollResult: function (cmd) {
        if (this.midAutumnScene) {
            //  ToastFloat.makeToast(ToastFloat.SHORT, "RESULT ROLL: " + cmd.result);
            this.midAutumnScene.onRollResult(cmd);
        } else {
            //   ToastFloat.makeToast(ToastFloat.SHORT, "RESULT ROLL NOT SCENE : " + cmd.result);
        }
    },

    onChangeAward: function (cmd) {
        midAutumn.isWaitResponseRegister = false;
        cc.log("ON CHANGE AWARD ** ");
        if (cmd.type == CmdReceiveMidAutumnChangeAward.IN_GAME || true) {
            var gui = sceneMgr.getGUI(MD_OPEN_GIFT_GUI_ORDER);
            if (cmd.result == 1) {
                cc.log("SUCCESS");
                if (gui && gui instanceof MidAutumnOpenGiftGUI) {
                    gui.onGiftSuccess();
                }
            } else {
                cc.log("VO DAY NE ");
                sceneMgr.showOKDialog(LocalizedString.to("MD_CHANGE_AWARD_FAIL"));
                gui.isWaitResponse = false;
                if (gui && gui instanceof MidAutumnOpenGiftGUI) {
                    gui.onBack();
                }
            }
        } else {
            var gui1 = sceneMgr.getGUIByClassName(MD_OPEN_GIFT_GUI_CLASS);
            if (cmd.result == 1) {
                if (midAutumn.isRegisterSuccess) {
                    sceneMgr.showOKDialog(LocalizedString.to("MD_REGISTER_SUCCESS"));
                } else {
                    sceneMgr.showOkDialogWithAction(LocalizedString.to("MD_REGISTER_SUCCESS"), function (buttonId) {
                        var gui = sceneMgr.openGUI(MD_HISTORY_GUI_CLASS, MD_HISTORY_GUI_ORDER, MD_HISTORY_GUI_ORDER);
                        gui.onButtonRelease(null, MD_SCENE_TAB_INFORMATION);
                    });

                }

                midAutumn.isRegisterSuccess = true;
                var gui = sceneMgr.getGUI(MD_REGISTER_GUI_ORDER);
                if (gui && gui instanceof MidAutumnRegisterInformationGUI) {
                    // gui.onClose();
                    gui.onCloseDone();
                }
            } else {
                sceneMgr.showOKDialog(LocalizedString.to("MD_REGISTER_FAIL"));
            }
        }
    },

    onUserAwardSuccess: function (cmd) {
        var isOutGame = midAutumn.isItemOutGame(cmd.giftId);
        var txts = [];
        txts.push({"text": LocalizedString.to("MD_BROADCAMD_USER_AWARD_0"), "color": cc.color(255, 255, 255, 0)});
        txts.push({"text": cmd.userName, "font": SceneMgr.FONT_BOLD, "color": cc.color(85, 207, 0, 0)});
        txts.push({"text": LocalizedString.to("MD_BROADCAMD_USER_AWARD_1"), "color": cc.color(255, 255, 255, 0)});
        txts.push({
            "text": midAutumn.getItemName(cmd.giftId),
            "font": SceneMgr.FONT_BOLD,
            "color": isOutGame ? cc.color(85, 207, 0, 0) : cc.color(235, 185, 14, 0)
        });

        broadcastMgr.addMessage(Broadcast.TYPE_EVENT, txts, isOutGame ? 5 : 1, isOutGame);
    },

    onRollHistory: function (cmd) {
        this.arRollHistory = [];

        try {
            for (var s in cmd.histories) {
                var obj = cmd.histories[s];
                var rObj = {
                    roll: obj["rollTime"],
                    pieces: {},
                    isNews: {}
                };

                var totalGold = 0;
                for (var xxx in obj["gifts"]) {
                    var ggg = obj["gifts"][xxx];
                    if (midAutumn.isLamp(ggg["id"])) {
                        // neu la den thi phan tu dau tien la chi so luong
                        rObj.pieces[ggg["id"]] = ggg["number"][0];
                        if (obj["rollGiftIds"].indexOf(ggg["id"]) < 0) {
                            rObj.isNews[ggg["id"]] = true;
                        }
                        else {
                            rObj.isNews[ggg["id"]] = false;
                        }
                    }
                    else if (midAutumn.isItemStored(ggg["id"])) {
                        for (var idx = 0; idx < ggg["number"].length; idx++) {
                            if (ggg["number"][idx] > 0) {
                                // rObj.pieces.push({
                                //     id : parseInt(ggg.id) + idx + 1,
                                //     num : ggg.number[idx]
                                // });
                                var gId = parseInt(ggg["id"]) + idx + 1;
                                if (gId in rObj.pieces) {
                                    rObj.pieces[gId] += ggg["number"][idx];
                                } else {
                                    rObj.pieces[gId] = ggg["number"][idx];
                                }
                                if (obj["rollGiftIds"].indexOf(gId) < 0) {
                                    rObj.isNews[gId] = true;
                                }
                                else {
                                    rObj.isNews[gId] = false;
                                }
                            }
                        }
                    } else {
                        totalGold += midAutumn.getItemValue(ggg.id) * ggg["number"][0];
                    }
                }
                totalGold = totalGold + obj["bonusGold"];
                if (totalGold > 0) {
                    // rObj.pieces.push({
                    //     id : 0,
                    //     num : totalGold
                    // });

                    rObj.pieces[0] = totalGold;
                }
                // rObj.rollGiftIds = obj.rollGiftIds;
                this.arRollHistory.push(rObj);
            }
        } catch (e) {
            cc.log("--> ERROR " + e.stack);
        }

        // cc.log("--Roll History : " + JSON.stringify(this.arRollHistory));

        var gui = sceneMgr.getGUI(MD_HISTORY_GUI_ORDER);
        if (gui && gui instanceof MidAutumnHistoryGUI) {
            gui.updateRollHistory();
        }
    },

    onGiftHistory: function (cmd) {
        this.arGiftHistory = [];
        for (var s in cmd.ids) {
            if (midAutumn.isItemOutGame(cmd.ids[s]))
                this.arGiftHistory.push(cmd.ids[s]);
        }

        var gui = sceneMgr.getGUI(MD_HISTORY_GUI_ORDER);
        if (gui && gui instanceof MidAutumnHistoryGUI) {
            gui.updateGiftHistory();
        }
    },

    onInfoHistory: function (cmd) {
        this.infoHistory = cmd;

        var gui = sceneMgr.getGUI(MD_HISTORY_GUI_ORDER);
        if (gui && gui instanceof MidAutumnHistoryGUI) {
            gui.updateInformation();
        }
    },

    onGetLampInfo: function (cmd) {
        midAutumn.usingLampId = cmd.usingLampId;
        midAutumn.usingLampIndex = cmd.usingLampIndex;
        midAutumn.usingLampIsRolled = cmd.usingLampIsRolled;
        midAutumn.receivedLampTimeToday = cmd.receivedLampTimeToday;
        midAutumn.sendLampTimeToday = cmd.sendLampTimeToday;
        midAutumn.lampTypeId = cmd.lampTypeId;
        midAutumn.lampTypeName = cmd.lampTypeName;
        midAutumn.lampTypeValue = cmd.lampTypeValue;

        // var lastListLamp = cc.sys.localStorage.getItem("saveListLamp");
        // cc.log("LAST LIST LAMP " + lastListLamp);
        // var obj = JSON.parse(lastListLamp);
        var obj = {};

        this.arrayLamp = [];
        this.arrayLampToSend = [];
        // load list den tu viec quay
        for (var i = 0; i < cmd.rolledId.length; i++) {
            if (cmd.rolledNumber[i] > 0) {
                var lampModel = new LampModel();
                lampModel.id = cmd.rolledId[i];
                if (Array.isArray(obj)) {
                    if (obj.indexOf(lampModel.id) < 0) {
                        lampModel.isNew = true;
                    }
                    else {
                        lampModel.isNew = false;
                    }
                }
                else {
                    lampModel.isNew = true;
                }
                lampModel.index = 0;
                lampModel.fromId = -1;
                lampModel.message = "";
                lampModel.num = cmd.rolledNumber[i];
                lampModel.type = cmd.rolledType[i];
                lampModel.gold = this.getGolLampByType(lampModel.type);
                lampModel.isRolledLamp = true;
                this.arrayLamp.push(lampModel);

                var cloneModel = new LampModel();
                cloneModel.clone(lampModel);
                this.arrayLampToSend.push(cloneModel);
            }
        }

        // load list den tu nguoi choi khac tang
        for (var i = 0; i < cmd.receivedId.length; i++) {
            var lampModel = new LampModel();
            lampModel.id = cmd.receivedId[i];
            lampModel.fromId = cmd.receivedFromUserId[i];
            if (lampModel.id >= 0) {
                lampModel.num = 1;
            }
            else {
                lampModel.num = 0;
                lampModel.fromId = 1;
            }
            lampModel.index = i;
            lampModel.fromUserName = cmd.receivedFromUserName[i];
            lampModel.message = cmd.receivedMessage[i];
            lampModel.type = cmd.receivedType[i];
            lampModel.gold = this.getGolLampByType(lampModel.type);
            this.arrayLamp.push(lampModel);
        }
        //
        for (var i = 0; i < MD_MAX_FRIEND - cmd.receivedId.length; i++) {
            var lampModel = new LampModel();
            lampModel.id = -1;
            lampModel.index = 0;
            lampModel.fromId = 1;
            lampModel.message = "";
            lampModel.gold = 0;
            lampModel.type = 0;
            this.arrayLamp.push(lampModel);
        }

        // sort lai list den theo luat design, tu ban be -> lan dau xuat hien sau khi mo gui -> gia tri
        this.arrayLamp.sort(function (a, b) {
            if (a.fromId >= 0 && b.fromId >= 0) {
                if (a.id < 0) {
                    return 1;
                }
                else if (a.message.length > 0 && b.message.length > 0) {
                    return b.type - a.type;
                }
                else {
                    return -1;
                }
            }
            else if (a.fromId >= 0 && b.fromId < 0) {
                return -1;
            }
            else if (a.fromId < 0 && b.fromId >= 0) {
                return 1;
            }
            else {
                if (a.isNew && b.isNew)
                    return b.type - a.type;
                else if (a.isNew)
                    return -1;
                else if (b.isNew)
                    return 1;
                else
                    return b.type - a.type;
            }
        });

        cc.log("LIST LAMP " + JSON.stringify(this.arrayLamp));
        this.createListLampChange();
        var gui = sceneMgr.getGUIByClassName(MidAutumnLampGUI.className);
        if (gui) {
            gui.updateListLamp();
        }

        var gui = sceneMgr.getGUIByClassName(MidAutumnSendLampGUI.className);
        if (gui) {
            gui.updateListLampSend();
        }

        if (this.lobbyLamp) {
            try {
                this.lobbyLamp.setInfo(this.usingLampId);
            }
            catch (e) {

            }
        }
    },

    saveListLamp: function () {
        var arrayId = [];
        for (var i = 0; i < this.arrayLamp.length; i++) {
            var id = this.arrayLamp[i].id;
            if (id > 0) {
                if (arrayId.indexOf(id) <= 0)
                    arrayId.push(id);
            }
        }
        cc.sys.localStorage.setItem("saveListLamp", JSON.stringify(arrayId));
    },

    onChangeLamp: function (lampChange) {
        if (lampChange.getError() == 0) {
            var s = localized("MD_CHANGE_LAMP");
            //s = StringUtility.replaceAll(s, "@num", rChange.numPiece);
            s = StringUtility.replaceAll(s, "@gold", StringUtility.pointNumber(lampChange.gold));
            var dlg = sceneMgr.openGUI(Dialog.className + "_MidAutumn", Dialog.ZODER, Dialog.TAG, false);
            dlg.setOKNotify(s);
        }
        else {
            ToastFloat.makeToast(ToastFloat.SHORT, "Không thể đổi đèn");
        }
    },

    onInGameLamp: function (inGameLamp) {
        if (!this.isFinishDownload)
            return;
        for (var i = 0; i < this.arrayPlayer.length; i++) {
            var chairInClient = CommonLogic.getChairInClient(i);
            try {
                if (inGameLamp.usingLampId[i] >= 0) {
                    this.arrayPlayer[chairInClient].lamp.setVisible(true);
                    this.arrayPlayer[chairInClient].lamp.setInfo(inGameLamp.usingLampId[i]);
                }
                else {
                    this.arrayPlayer[chairInClient].lamp.setVisible(false);
                }
            }
            catch (e) {
                cc.log("ERROR ");
            }
        }
    },

    onSendLamp: function (lampSend) {
        cc.log("ON SEND LAM " + lampSend.getError());
        if (lampSend.isSender) {
            if (lampSend.getError() == CmdReceiveMidAutumnSendLamp.SUCCESS) {
                cc.log("SEND SUCCESS");
                ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_SEND_LAMP_SUCCESS"));
            }
            else if (lampSend.getError() == CmdReceiveMidAutumnSendLamp.FRIEND_RECEIVE_LIMIT) {
                cc.log("SEND LAMP FAIL ");
                ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_SEND_LAMP_FRIEND_LIMIT"));
            }
            else if (lampSend.getError() == CmdReceiveMidAutumnSendLamp.SEND_LIMIT) {
                cc.log("SEND LAMP FAIL ");
                ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_SEND_LAMP_SEND_LIMIT"));
            }
            else if (lampSend.getError() == CmdReceiveMidAutumnSendLamp.FRIEND_STORE_LIMIT) {
                cc.log("SEND LAMP FAIL ");
                ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_SEND_LAMP_FRIEND_STORE_LIMIT"));
            }
            else {
                ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_SEND_LAMP_FAIL"));
            }
        }
        else {
            if (!this.isFinishDownload)
                return;
            if (lampSend.getError() == CmdReceiveMidAutumnSendLamp.SUCCESS) {
                var gui = sceneMgr.openGUI(MidAutumnReceiveLampGUI.className, MidAutumnReceiveLampGUI.TAG, MidAutumnReceiveLampGUI.TAG);
                gui.setInfo(lampSend.id, lampSend.index, lampSend.userId, lampSend.userName, lampSend.avatar,  lampSend.message);
            }
            else {
                //ToastFloat.makeToast(ToastFloat.SHORT, "Lỗi khi nhận đèn");
            }
        }
    },

    initArrayPlayer: function (arrayPlayer, arrayPos) {
        if (!this.isFinishDownload)
            return;
        this.arrayPlayer = arrayPlayer;
        for (var i = 0; i < this.arrayPlayer.length; i++) {
            // if (!this.arrayPlayer[i].nodeLamp) {
            //     this.arrayPlayer[i].nodeLamp = new cc.Node();
            //     this.arrayPlayer[i].addChild(this.arrayPlayer[i].nodeLamp);
            //     this.arrayPlayer[i].nodeLamp.setPosition(arrayPos[i]);
            //     this.arrayPlayer[i].nodeLamp.setLocalZOrder(10);
            // }
            // this.arrayPlayer[i].nodeLamp.removeAllChildren();
            if (!this.arrayPlayer[i].lamp) {
                var lamp = new MidAutumnLampInGame();
                this.arrayPlayer[i].addChild(lamp);
                lamp.setTag(MD_LAMP_IN_GAME_TAG);
                lamp.setLocalZOrder(10);
                lamp.setPosition(arrayPos[i]);
                this.arrayPlayer[i].lamp = lamp;
            }
        }
    },

    addAccumulateGUI: function(){
        if (!this.isFinishDownload)
            return;
        try {
            if (this.btnInGame)
                this.btnInGame.setVisible(true);
        }
        catch (e) {

        }
    },

    removeAccumulateGUI: function() {
        if (!this.isFinishDownload)
            return;
        try {
            if (this.btnInGame)
                this.btnInGame.setVisible(false);
        }
        catch (e) {

        }
    },

    createEventInLobby: function (parent) {
        if (!this.isFinishDownload)
            return;
        if (parent.btnAvatar.panelItem) {
            parent.btnAvatar.panelItem.removeAllChildren();
        }
        else {
            parent.btnAvatar.panelItem = new cc.Node();
            parent.btnAvatar.panelItem.setPosition(50, 5);
            parent.btnAvatar.addChild(parent.btnAvatar.panelItem);
        }
        this.lobbyLamp = new MidAutumnLampInGame();
        parent.btnAvatar.panelItem.addChild(this.lobbyLamp);
        //lamp.setTag(MD_LAMP_IN_GAME_TAG);
        //this.arrayPlayer[i].lamp = lamp;
    },

    createButtonInGame: function (pos, parent) {
        if (!this.isFinishDownload)
            return;
        if (!this.isInEvent())
            return;
        var btn = new ccui.Button();
        btn.setPressedActionEnabled(true);
        btn.loadTextures(MD_IMAGE_BUTTON_IN_GAME, MD_IMAGE_BUTTON_IN_GAME, "");
        btn.addTouchEventListener(this.touchEvent, this);
        btn.setPosition(pos.x - btn.getContentSize().width * 0.5, pos.y + 20);
        // btn.setPosition(300, 300);
        this.btnInGame = btn;
        parent.addChild(btn);


        // var cmd = new CmdSendMidAutumnOpen();
        // GameClient.getInstance().sendPacket(cmd);

    },

    addBtnSendLamp: function (parent) {
        if (!this.isFinishDownload)
            return;
        this.btnSendLamp = new ccui.Button();
        this.btnSendLamp.loadTextures("res/EventMgr/MidAutumn/MidAutumnUI/btnActionSend.png", "res/EventMgr/MidAutumn/MidAutumnUI/btnActionSend.png", "res/EventMgr/MidAutumn/MidAutumnUI/btnActionSend.png");
        this.btnSendLamp.setPosition(this.btnSendLamp.getContentSize().width * 0.5, this.btnSendLamp.getContentSize().height * 0.5);
        parent.panel.addChild(this.btnSendLamp);
        this.btnSendLamp.guiInteract = parent;
        this.btnSendLamp.addClickEventListener(this.clickSend.bind(this));
    },

    clickSend: function () {
        if (!this.isInEvent()) {
            ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_EVENT_TIMEOUT"));
        }
        if (this.sendLampTimeToday >= 5) {
            ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_MAX_SEND_LAMP"));
            return;
        }
        try {
            this.btnSendLamp.guiInteract.onBack();
        }
        catch (e) {
            cc.log("GAME SAM khong khoi tao BTN nay");
        }
        var gui = sceneMgr.openGUI(MidAutumnSendLampGUI.className, MidAutumnSendLampGUI.TAG, MidAutumnSendLampGUI.TAG);
        gui.setUserInfo(this.btnSendLamp.guiInteract._user.uID, this.btnSendLamp.guiInteract._user.avatar);

    },

    clickSendSam: function (uid, avatar) {
        if (!this.isInEvent()) {
            ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_EVENT_TIMEOUT"));
        }
        if (this.sendLampTimeToday >= 5) {
            ToastFloat.makeToast(ToastFloat.SHORT, localized("MD_MAX_SEND_LAMP"));
            return;
        }

        var gui = sceneMgr.openGUI(MidAutumnSendLampGUI.className, MidAutumnSendLampGUI.TAG, MidAutumnSendLampGUI.TAG);
        gui.setUserInfo(uid, avatar);
    },

    touchEvent: function () {
        this.btnInGame.runAction(cc.fadeOut(0.4));
        var gui = sceneMgr.openGUI(MD_ACCUMULATE_GUI_CLASS, MD_ACCUMULATE_GUI_ORDER, MD_ACCUMULATE_GUI_ORDER, false);
        cmd = {};
        cmd.additionExp = 0;
        cmd.currentLevelExp = midAutumn.curLevelExp;
        cmd.nextLevelExp = midAutumn.nextLevelExp;

        cmd.keyCoindAdd = 0;
        cmd.keyCoin = midAutumn.keyCoin;
        cmd.keyCoinAward = 0;

        if (gui) gui.showAccumulate(cmd);
    },

    // LISTENER
    onReceive: function (cmd, data) {
        if (gamedata.checkInReview()) return;
        switch (cmd) {
            case MD_CMD_EVENT_NOTIFY: {
                var rEventNotify = new CmdReceiveMidAutumnNotify(data);
                rEventNotify.clean();

                cc.log("CMD_EVENT_NOTIFY: " + JSON.stringify(rEventNotify));
                midAutumn.onEvent(rEventNotify);
                break;
            }
            case MD_CMD_NOTIFY_ACTION: {
                var rActionNotify = new CmdReceiveMidAutumnActionNotify(data);
                rActionNotify.clean();

                cc.log("CMD_NOTIFY_ACTION: " + JSON.stringify(rActionNotify));

                midAutumn.notifyMidAutumnAction(rActionNotify);
                break;
            }
            case MD_CMD_OPEN_EVENT: {
                var rEventInfo = new CmdReceiveMidAutumnInfo(data);
                rEventInfo.clean();

                cc.log("CMD_OPEN_EVENT: " + JSON.stringify(rEventInfo));

                midAutumn.updateEventInfo(rEventInfo);
                break;
            }
            case MD_CMD_ACCUMULATE_INFO: {
                var rAccInfo = new CmdReceiveMidAutumnAccumulateInfo(data);
                rAccInfo.clean();

                cc.log("CMD_ACCUMULATE_INFO: " + JSON.stringify(rAccInfo));

                midAutumn.onAccumulate(rAccInfo);
                break;
            }
            case MD_CMD_ROLL_EVENT: {
                var rRollEvent = new CmdReceiveMidAutumnRoll(data);
                rRollEvent.clean();

                cc.log("CMD_ROLL_EVENT: " + JSON.stringify(rRollEvent));

                midAutumn.onRollResult(rRollEvent);
                break;
            }
            case MD_CMD_EVENT_END: {
                if (midAutumn.eventTime > 0) {
                    midAutumn.eventTime = MD_WEEK_END + 1;
                    var cmd = {};
                    cmd.result = 3;
                    midAutumn.onRollResult(cmd);
                }
                break;
            }
            case MD_CMD_CHANGE_AWARD: {
                var rAward = new CmdReceiveMidAutumnChangeAward(data);
                rAward.clean();

                cc.log("CMD_CHANGE_AWARD: " + JSON.stringify(rAward));

                midAutumn.onChangeAward(rAward);
                break;
            }
            case MD_CMD_USER_CHANGE_AWARD_SUCCESS: {
                var rUserAward = new CmdReceiveMidAutumnUserChangeAward(data);
                rUserAward.clean();

                cc.log("CMD_USER_CHANGE_AWARD_SUCCESS: " + JSON.stringify(rUserAward));

                midAutumn.onUserAwardSuccess(rUserAward);
                break;
            }
            case MD_CMD_CHEAT_G_SERVER: {
                var rGServer = new CmdReceiveMidAutumnGServer(data);
                rGServer.clean();

                cc.log("CMD_CHEAT_G_SERVER : " + JSON.stringify(rGServer));

                if (this.midAutumnScene) {
                    this.midAutumnScene.updateGSystem(rGServer);
                }
                break;
            }
            case MD_CMD_EVENT_SHOP_BONUS: {
                cc.log("WHY ***************************** ");
                var rEventShop = new CmdReceiveMidAutumnShopBonus(data);
                rEventShop.clean();

                cc.log("CMD_EVENT_SHOP_BONUS : " + JSON.stringify(rEventShop));

                event.onEventShopBonusNew(rEventShop, Event.MID_AUTUMN);
                this.sendCheckNewDay = false;
                this.saveDay = -1;
                break;
            }
            case MD_CMD_GET_ROLL_HISTORY: {
                var rHistory = new CmdReceiveMidAutumnRollHistory(data);
                rHistory.clean();

                cc.log("CMD_GET_ROLL_HISTORY : " + JSON.stringify(rHistory));
                midAutumn.onRollHistory(rHistory);
                break;
            }
            case MD_CMD_GET_GIFT_HISTORY: {
                var rHistory = new CmdReceiveMidAutumnGiftHistory(data);
                rHistory.clean();

                cc.log("CMD_GET_GIFT_HISTORY : " + JSON.stringify(rHistory));
                midAutumn.onGiftHistory(rHistory);
                break;
            }
            case MD_CMD_GET_REGISTER_INFORMATION: {
                var rInfo = new CmdReceiveMidAutumnRegisterInfor(data);
                rInfo.clean();
                this.registerData = rInfo;
                cc.log("CMD_GET_REGISTER_INFORMATION : " + JSON.stringify(rInfo));
                midAutumn.onInfoHistory(rInfo);
                break;
            }
            case MD_CMD_EVENT_TICKET_FROM_GOLD : {
                var rCoinBonus = new CmdReceiveMidAutumnKeyCoinBonus(data);
                rCoinBonus.clean();

                cc.log("CMD_KEY_CON_BONUS : " + JSON.stringify(rCoinBonus));

                if (rCoinBonus.keyCoin <= 0) return;

                // var clb = sceneMgr.getMainLayer();
                // if (clb instanceof MidAutumnScene) {
                //     var gui = sceneMgr.openGUI(MD_HAMMER_EMPTY_CLASS, MD_DIALOG_ORDER, MD_DIALOG_ORDER);
                //     if (gui) {
                //         gui.setGUI(MD_HAMMER_TICKET, rCoinBonus.keyCoin);
                //     }
                // }
                // else {
                var str = "";
                if (rCoinBonus.option == 14) // Mua tu Offer
                    return;
                else if (rCoinBonus.option == 5)
                    str = LocalizedString.to("MD_BUY_KEYCOIN_G");
                else if (rCoinBonus.option == 0)
                    str = LocalizedString.to("MD_KEYCOIN_BONUS");
                else
                    str = LocalizedString.to("MD_KEYCOIN_BONUS");

                str = StringUtility.replaceAll(str, "@coin", rCoinBonus.keyCoin);

                // var dlg = sceneMgr.openGUI(Dialog.className + "_MidAutumn", Dialog.ZODER, Dialog.TAG, false);
                // dlg.setOKNotify(str);

                var gui = sceneMgr.openGUI(MD_HAMMER_EMPTY_CLASS, MD_DIALOG_ORDER, MD_DIALOG_ORDER);
                if (gui) {
                    gui.setGUI(MD_HAMMER_TICKET, str);
                }
                // }

                break;
            }
            case MD_CMD_CHANGE_PIECE : {
                var rChange = new CmdReceiveMidAutumnChangePiece(data);
                cc.log("MD_CMD_CHANGE_PIECE : " + JSON.stringify(rChange));
                rChange.clean();
                if (rChange.getError() == 0) {
                    var s = localized("MD_CHANGE_PIECE");
                    s = StringUtility.replaceAll(s, "@num", rChange.numPiece);
                    s = StringUtility.replaceAll(s, "@gold", StringUtility.pointNumber(rChange.gold));
                    var dlg = sceneMgr.openGUI(Dialog.className + "_MidAutumn", Dialog.ZODER, Dialog.TAG, false);
                    dlg.setOKNotify(s);


                } else {
                    cc.log("CHANGE ERROR " + rChange.getError());
                }
                break;
            }
            case MD_CMD_GET_LAMP_INFO: {
                var rLampInfo = new CmdReceiveMidAutumnLampInfo(data);
                rLampInfo.clean();
                cc.log("MD_CMD_GET_LAMP_INFO : " + JSON.stringify(rLampInfo));
                this.onGetLampInfo(rLampInfo);
                break;
            }
            case MD_CMD_CHANGE_LAMP: {
                var rLampChange = new CmdReceiveMidAutumnChangeLamp(data);
                rLampChange.clean();
                cc.log("MD_CMD_CHANGE_LAMP : " + JSON.stringify(rLampChange));
                this.onChangeLamp(rLampChange);
                break;
            }
            case MD_CMD_SEND_LAMP: {
                var rLampSend = new CmdReceiveMidAutumnSendLamp(data);
                rLampSend.clean();
                cc.log("MD_CMD_SEND_LAMP : " + JSON.stringify(rLampSend));
                this.onSendLamp(rLampSend);
                break;
            }
            case MD_CMD_IN_GAME_LAMP: {
                var rInGameLamp = new CmdReceiveMidAutumnInGameLamp(data);
                rInGameLamp.clean();
                cc.log("MD_CMD_IN_GAME_LAMP : " + JSON.stringify(rInGameLamp));
                this.onInGameLamp(rInGameLamp);
                break;
            }
        }
    },

    checkSendNewDay: function () {
        var timeLeft = this.getTimeLeft();
        if (this.sendCheckNewDay == false && this.saveDay >= 0 && timeLeft <= 0) {
            this.requestShopEventConfig();
            this.sendCheckNewDay = true;
            this.saveDay = -1;
        }
        if (timeLeft <= 0) return 0;
        var day = parseInt(timeLeft / 86400);
        if (this.sendCheckNewDay == false && this.saveDay >= 0 && this.saveDay != day) {
            this.requestShopEventConfig();
            this.sendCheckNewDay = true;
            this.saveDay = -1;
        }
        this.saveDay = day;
    },

    // EventMgr Loop
    updateEventLoop: function () {
        if (this.eventTime <= 0)
            return;

        this.checkSendNewDay();

        var stime = midAutumn.getTimeLeftString();
        var nTime = midAutumn.getTimeLeft();

        try {
            if (nTime <= 0) {
                // if (this.eventTime >= MD_WEEK_END) {
                if (this.isFinishDownload)
                    this.buttonLobby.time.setString(LocalizedString.to("BO_EVENT_TIMEOUT"));
                else
                    this.buttonLobby.time.setString(LocalizedString.to("LOADING_EVENT"));
                midAutumn.eventTime = MD_WEEK_END + 1;
                if (this.btnInGame) {
                    this.btnInGame.setVisible(false);
                }

                if (this.lobbyLamp) {
                    this.lobbyLamp.setVisible(false);
                }
                // }
                // else {
                //     if (this.eventTime > 0) {
                //         this.timeEventEnd = 7 * 24 * 60 * 60 - 1 + new Date().getTime() / 1000;
                //         this.eventTime++;
                //     }
                // }

            } else {
                var s = LocalizedString.to("MD_INFO_TIME_LEFT_0");
                if (this.isFinishDownload)
                    this.buttonLobby.time.setString(s + " " + stime);
                else
                    this.buttonLobby.time.setString(LocalizedString.to("LOADING_EVENT"));
            }
        }
        catch (e) {

        }

        this.showBubbleBonusG();
    }
});

var MidAutumnSound = function () {
};

MidAutumnSound.playLobby = function () {
    if (gameSound.on) {
        audioEngine.stopAllEffects();
        audioEngine.stopMusic();
        audioEngine.playMusic(resSTSound.bg, true);
    }
};

MidAutumnSound.closeLobby = function () {
    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
    audioEngine.end();
};

MidAutumnSound.playBubbleSingle = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.bubble_single, false);
    }
};

MidAutumnSound.playSoundSingle = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.sound_single, false);
    }
};

MidAutumnSound.playSingleCoin = function () {
    if (gameSound.on) {
        var rnd = parseInt(Math.random() * 10) % 3 + 1;
        var resource = "res/Lobby/Common/coin_0" + rnd + ".mp3";
        cc.audioEngine.playEffect(resource, false);
    }
};

MidAutumnSound.playPiece = function () {
    if (gameSound.on) {
        cc.audioEngine.playEffect(resSTSound.piece, false);
    }
};

MidAutumnSound.playDiceFly = function () {
    if (gameSound.on) {
        //cc.audioEngine.playEffect(resSTSound.diceFly, false);
    }
};

MidAutumnSound.playFoxJump = function () {
    if (gameSound.on) {
        cc.audioEngine.playEffect(resSTSound.foxJump, false);
    }
};

MidAutumnSound.playBubbleSequence = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.bubble_sequence, false);
    }
};

MidAutumnSound.playBubbleSequence1 = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.bubble_sequence_1, false);
    }
};

MidAutumnSound.playBubbleSequence2 = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.bubble_sequence_2, false);
    }
};

MidAutumnSound.playSoundSequence = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.sound_sequence, false);
    }
};

MidAutumnSound.playOpenPlate = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.bubble_sequence_1, false);
    }
};

MidAutumnSound.playClosePlate = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.closePlate, false);
    }
};

MidAutumnSound.playRollPlate = function () {
    if (gameSound.on) {
        var rand = Math.floor(Math.random() * 4);

        switch (rand) {
            case 0:
                audioEngine.playEffect(resSTSound.rollPlate1, false);
                break;
            case 1:
                audioEngine.playEffect(resSTSound.rollPlate2, false);
                break;
            case 2:
                audioEngine.playEffect(resSTSound.rollPlate3, false);
                break;
            case 3:
                audioEngine.playEffect(resSTSound.rollPlate4, false);
                break;
        }
    }
};

MidAutumnSound.preloadAllSound = function(){
    if (cc.sys.isNative){
        for(var s in resSTSound) {
            audioEngine.preloadEffect(resSTSound[s]);
        }
    }

    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
};

resSTSound = {
    bg : "res/EventMgr/MidAutumnRes/beach.mp3",
    bubble_single : "res/EventMgr/MidAutumnRes/bubble_single.mp3",
    sound_single : "res/EventMgr/MidAutumnRes/sound_single.mp3",
    bubble_sequence : "res/EventMgr/MidAutumnRes/bubble_sequence.mp3",
    bubble_sequence_1 : "res/EventMgr/MidAutumnRes/bubble_sequence_1.mp3",
    bubble_sequence_2 : "res/EventMgr/MidAutumnRes/bubble_sequence_2.mp3",
    sound_sequence : "res/EventMgr/MidAutumnRes/sound_sequence.mp3",
    piece : "res/EventMgr/MidAutumnRes/pieces.mp3",
    rollPlate1: "res/EventMgr/MidAutumnRes/xoc_dia_001.mp3",
    rollPlate2: "res/EventMgr/MidAutumnRes/xoc_dia_002.mp3",
    rollPlate3: "res/EventMgr/MidAutumnRes/xoc_dia_003.mp3",
    rollPlate4: "res/EventMgr/MidAutumnRes/xoc_dia_004.mp3",
    closePlate: "res/EventMgr/MidAutumnRes/dong_dia.mp3",
    //diceFly: "res/EventMgr/MidAutumnRes/dice_fly.mp3",
    foxJump: "res/EventMgr/MidAutumnRes/fox_jump.mp3",
};

MidAutumn._instance = null;
MidAutumn.getInstance = function () {
    if (!MidAutumn._instance) {
        MidAutumn._instance = new MidAutumn();
    }
    return MidAutumn._instance;
};
var midAutumn = MidAutumn.getInstance();

var ClassTest = cc.Class.extend({
    arrayTest: [],
    ctor: function () {

    }
})