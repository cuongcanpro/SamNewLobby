/**
 * Created by Hunter on 5/7/2018.
 */

var audioEngine = cc.audioEngine;

BlueOcean = cc.Class.extend({

    ctor: function () {
        // config
        this.eventTime = 0; // event 0 : off event || 1-4 :: week of event || 5 :: over event , wait off event
        this.giftNames = {}; // key : id of item - value : name of item
        this.giftValues = {}; // key : id of item - value : value of item
        this.giftPrices = {};
        this.giftIds = [];
        this.giftItemImages = {}; // key : id of item - value : image path of item
        this.costRoll = [1, 20, 50, 100];     // cost to roll in event
        this.configKeyCoin = [1, 20, 50, 100];
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
        this.blueOceanScene = null;
        this.buttonLobby = null;
        this.showx2_daily = true;

        this.idTabEventShop = 0;
        this.showX2Ticket = true;
    },

    preloadResource: function () {
        if (!this.isFinishDownload)
            return;
        cc.log("BlueOcean::preloadResource");
        LocalizedString.add("res/Event/BlueOcean/BlueOceanRes/MDLocalized_vi");

        // cc.spriteFrameCache.addSpriteFrames("res/Event/BlueOcean/BlueOceanUI/event.plist");
        //  cc.spriteFrameCache.addSpriteFrames("res/Event/BlueOcean/BlueOceanUI/pieceGift.plist");
        //db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/BlueOceanRes/zingplaymascot/skeleton.xml","zingplaymascot");
        //db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/BlueOceanRes/zingplaymascot/texture.plist", "zingplaymascot");
        // game_animations.push({
        //     folderpath: "res/Event/BlueOceanRes/cao/",
        //     skeleton: "skeleton.xml",
        //     texture: "texture.plist",
        //     key: "cao"
        // });

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/BlueOcean/BlueOceanRes/FX_nhanqua/skeleton.xml","FX_nhanqua");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/BlueOcean/BlueOceanRes/FX_nhanqua/texture.plist", "FX_nhanqua");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/BlueOcean/BlueOceanRes/cao/skeleton.xml","cao");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/BlueOcean/BlueOceanRes/cao/texture.plist", "cao");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/BlueOcean/BlueOceanRes/BubbleBreak/skeleton.xml","BubbleBreak");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/BlueOcean/BlueOceanRes/BubbleBreak/texture.plist", "BubbleBreak");

        BlueOceanSound.preloadAllSound();
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
        this.blueOceanScene = null;
        this.buttonLobby = null;
        this.showx2_daily = true;

        // gui
        this.ignoreShowResultGUI = false;

        // auto gift daily and next week
        this.arAutoGifts = [];
        this.currentAutoGift = 0;

        this.sendCheckNewDay = false;
        this.saveDay = -1;
    },

    requestOnShop: function () {
        // clear config
        event.updateEventConfig(true);

        if (this.isRequestedInfo) return;

        var cmd = new CmdSendBlueOceanOpen();
        GameClient.getInstance().sendPacket(cmd);
    },

    requestShopEventConfig: function () {
        setTimeout(function () {
            var cmd = new CmdSendBlueOcean();
            GameClient.getInstance().sendPacket(cmd);

            cmd = new CmdSendRequestEventShop();
            GameClient.getInstance().sendPacket(cmd);
        }, 1000);
    },

    // show gui - dialog - panel
    openEvent: function () {
        cc.log("OPEN EVENT *** " + blueOcean.eventTime + " IME " + this.getTimeLeft());
        if (this.eventTime == 0) return;
        this.newLandPositionX = [];
        var timeLeft = this.getTimeLeft();
        if (timeLeft <= 0 && blueOcean.checkWeek(BO_WEEK_END)) {
            blueOcean.eventTime = BO_WEEK_END + 1;
            sceneMgr.showOKDialog(LocalizedString.to("BO_EVENT_TIMEOUT"));
        }

        if (blueOcean.isInEvent()) {
            var func = function () {
                sceneMgr.openScene(BO_SCENE_CLASS);
            }
            resourceManager.openGUI(BO_SCENE_CLASS, func);
        }
        else if (blueOcean.isEndEvent()) {
            NativeBridge.openWebView(blueOcean.eventLinkNews);
        }
    },

    showNotifyEvent: function (btn) {
        cc.log("BlueOcean::showNotifyEvent Button " + btn);
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
                        sceneMgr.openGUI(BO_NOTIFY_CLASS, BO_NOTIFY_ORDER, BO_NOTIFY_ORDER, false);
                    }
                    resourceManager.openGUI(BO_NOTIFY_CLASS, func);
                } else {
                    this.showHammerEmpty(BO_HAMMER_NOTIFY_EMPTY);
                }

                if (this.showX2G && this.showx2_daily) {
                    this.showX2G = false;
                    this.showx2_daily = false;
                    sceneMgr.openGUI(BO_NOTIFY_PROMOTE_G_CLASS, BO_NOTIFY_PROMOTE_G_ORDER, BO_NOTIFY_PROMOTE_G_ORDER, false);
                }
            }
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
        cc.log("BlueOcean::showEventButton");

        if (this.buttonLobby === undefined || this.buttonLobby == null) return;

        if (this.isInEvent() || this.isEndEvent()) {
            this.buttonLobby.setVisible(true);
            this.effectEventButton();
            //this.buttonLobby.notify.setVisible(this.notifyEvent);
        } else {
            this.buttonLobby.setVisible(false);
        }
    },

    effectEventButton: function () {
        if (!this.buttonLobby) return;
        this.buttonLobby.anim.removeAllChildren();
        this.buttonLobby.button.setContentSize(300, 300);
        this.buttonLobby.anim.eff = new CustomSkeleton("Lobby/Event/summer/IconEvent", "Icon_thosan", 1);
        this.buttonLobby.anim.addChild(this.buttonLobby.anim.eff);
        this.buttonLobby.anim.eff.setPosition(0, 5);
        this.buttonLobby.anim.eff.setAnimation(0, "animation", -1);
        this.buttonLobby.anim.eff.setScale(0.8);
        this.buttonLobby.notify.setVisible(this.notifyEvent);
        this.buttonLobby.time.setFontSize(16);
        this.buttonLobby.time.setColor(cc.color(162, 153, 202));
        // this.buttonLobby.time.enableOutline(cc.color(162, 153, 202), 0);
        this.buttonLobby.time.setPositionY(this.buttonLobby.time.getPositionY() - 15);
        this.buttonLobby.notify.setPosition(this.buttonLobby.notify.x + 0, this.buttonLobby.notify.y + 20);
    },

    showPromoTicket: function () {
        if (this.checkNewDayPromoTicket()) {
            var gui = sceneMgr.openGUI(BlueOceanPromoTicketGUI.className, BlueOceanPromoTicketGUI.TAG, BlueOceanPromoTicketGUI.TAG, false);
            this.saveCurrentDayPromoTicket();
        }
        else {

        }
    },

    showRegisterInformation: function (gIds) {
        var gui = sceneMgr.openGUI(BO_REGISTER_GUI_CLASS, BO_REGISTER_GUI_ORDER, BO_REGISTER_GUI_ORDER, false);
        if (gui) gui.updateInfor(gIds);
    },

    showAutoGift: function () {
        if (!this.isFinishDownload)
            return;
        if (this.currentAutoGift < 0 || this.currentAutoGift >= this.arAutoGifts.length) return;

        var info = this.arAutoGifts[this.currentAutoGift];
        this.currentAutoGift += 1;
        var func = function () {
            var open = sceneMgr.openGUI(BO_OPEN_GIFT_GUI_CLASS, BO_OPEN_GIFT_GUI_ORDER, BO_OPEN_GIFT_GUI_ORDER);
            if (open) open.showGift(info, true);
        }
        resourceManager.openGUI(BO_OPEN_GIFT_GUI_CLASS, func);

    },

    showNotifyBonusGPanel: function () {
        if (!this.isInEvent()) return;
        if (!this.isBonusG) return;
        if (this.checkNotifyBonusGPanel()) {
            sceneMgr.openGUI(BO_NOTIFY_BONUS_G_CLASS, BO_DIALOG_ORDER, BO_DIALOG_ORDER);
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
        if (type == BO_HAMMER_NOTIFY_EMPTY) {
            var curLayer = sceneMgr.getMainLayer();
            // if (curLayer && curLayer instanceof LobbyScene) {
            //     if (this.checkNotifyBonusTicketNewDay() && !this.isBuyGEvent) {
            //         sceneMgr.openGUI(BO_NOTIFY_BONUS_TICKET_CLASS, BO_DIALOG_ORDER, BO_DIALOG_ORDER);
            //     }
            // }

            if (curLayer && curLayer instanceof BlueOceanScene) {
                if (this.keyCoin > 0) return;

                if (this.nHammerDialogShow <= 0) {
                    this.nHammerDialogShow = BO_HAMMER_EMPTY_COUNT_DOWN_SHOW;

                    if (this.isBuyGEvent) {
                        sceneMgr.openGUI(BO_HAMMER_EMPTY_CLASS, BO_DIALOG_ORDER, BO_DIALOG_ORDER).setGUI(BO_HAMMER_NOTIFY_EMPTY);
                    } else {
                        // sceneMgr.openGUI(BO_NOTIFY_BONUS_TICKET_CLASS, BO_DIALOG_ORDER, BO_DIALOG_ORDER);
                    }
                } else {
                    this.nHammerDialogShow--;
                }
            }
        }

        if (type == BO_HAMMER_ROLL_EMPTY) {
            sceneMgr.openGUI(BO_HAMMER_EMPTY_CLASS, BO_DIALOG_ORDER, BO_DIALOG_ORDER).setGUI(BO_HAMMER_ROLL_EMPTY);
        }
    },

    // utils
    getTicketTexture: function(){
        return "res/Event/BlueOcean/BlueOceanUI/hammer.png";
    },

    getOfferTicketImage: function (id) {
        return "res/Event/BlueOcean/BlueOceanUI/bonusTicketOffer.png";
    },

    getOfferTicketString: function (id) {
        return " Sao";
    },

    getListGiftInChest: function () {
        var arrayGift = [];
        for (var i = 0; i < this.treasureRewardTypeOpen.length; i++) {
            if (this.treasureRewardTypeOpen[i] != "treasure") {
                var obj = {
                    "type" : this.treasureRewardTypeOpen[i],
                    "value" : this.treasureRewardValueOpen[i] * this.treasureRewardNumberOpen[i]
                }
                var isExist = false;
                for (var j = 0; j < arrayGift.length; j++) {
                    if (this.treasureRewardTypeOpen[i] == arrayGift[j]["type"]) {
                        if (arrayGift[j]["type"] == "gold" || arrayGift[j]["type"] == "diamond") {
                            arrayGift[j]["value"] = arrayGift[j]["value"] +  this.treasureRewardValueOpen[i] * this.treasureRewardNumberOpen[i];
                        }
                        isExist = true;
                        break;
                    }
                    else {

                    }
                }
                if (!isExist)
                    arrayGift.push(obj);
            }
        }
        return arrayGift;
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

        if (curTime - lastTime > BO_NOTIFY_BONUS_G_COUNT_DOWN) {
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

    convertLevelChestToLevelTreasure: function (level) {
        if (level == -1)
            return BO_NUM_LEVEL;

        if (level > this.numLevel) {
            return BO_NUM_LEVEL;
        }
        else {
            if (this.treasureRewardLevel) {
                return this.treasureRewardLevel[level - 1];
            }
            else {
                return 1;
            }
        }
    },

    // GET - SET

    getAllBonusInChest: function () {
        var bonusData = {};
        bonusData.gold = 0;
        bonusData.diamond = 0;
        bonusData.piece = 0;
        for (var i = this.levelReceived + 1; i < this.chestLevel; i++) {
            bonusData.gold = bonusData.gold + this.arrayBonusData[i].getValue(BlueOcean.BONUS_GOLD);
            bonusData.diamond = bonusData.diamond + this.arrayBonusData[i].getValue(BlueOcean.BONUS_DIAMOND);
            bonusData.piece = bonusData.piece + this.arrayBonusData[i].getValue(BlueOcean.BONUS_PIECE);
        }
        return bonusData;
    },

    getTotalPriceGift: function () {
        var total = 0;
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
        if (this.isItemStored(id))
            return "res/Event/BlueOcean/BlueOceanUI/e" + id + ".png";
        return "res/Event/BlueOcean/BlueOceanUI/icon_gold.png";
    },

    getItemName: function (id) {
        id = this.convertIdNormal(id);
        // if (blueOcean.isItemOutGame(id)) {
        //     return LocalizedString.to("BO_ITEM_FULL_" + id);
        // }

        if (id in this.giftNames) {
            return this.giftNames[id];
        }
        return id;
    },

    getItemNameSub: function (id) {
        id = this.convertIdNormal(id);
        // if (blueOcean.isItemOutGame(id)) {
        //     return LocalizedString.to("BO_ITEM_SUB_" + id);
        // }

        return this.getItemName(id);
    },

    getItemNameShort: function (id) {
        var game = LocalizedString.config("GAME");
        id = this.convertIdNormal(id);
        if (blueOcean.isItemOutGame(id) && false) {
            return LocalizedString.to("BO_ITEM_LITE_" + id + "_" + game);
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
            return "res/Event/BlueOcean/BlueOceanUI/enLarge" + id + ".png";
        return "res/Event/BlueOcean/BlueOceanUI/en10.png"
    },

    getGiftImageOpen: function (id) {
        //id = this.convertIdNormal(id);
        //  if(this.isItemStored(id))
        return "res/Event/BlueOcean/BlueOceanUI/enLarge" + id + ".png";
        //  return "res/Event/BlueOcean/BlueOceanUI/en10.png"
    },

    getEggImage: function (id) {
        id = this.convertIdNormal(id);
        if (this.isItemStored(id))
            return "res/Event/BlueOcean/BlueOceanUI/s" + id + ".png";
        if (id == -2) {
            return "res/Event/BlueOcean/BlueOceanUI/cell_stone.png";
        }
        if (id == 0) {
            return "";
        }
        return "res/Event/BlueOcean/BlueOceanUI/i10.png"
    },

    getGiftBackgroundImage: function (id) {
        id = this.convertIdNormal(id);
        if (this.isItemStored(id))
            return "res/Event/BlueOcean/BlueOceanUI/eb" + id + ".png"
        return "res/Event/BlueOcean/BlueOceanUI/eb10.png"
    },

    getStageId: function () {
        if (!this.mapInfo) return 0;
        return this.mapInfo.stage;
    },

    getStageImage: function (stage) {
        if (!this.mapInfo) stage = 0;
        if (stage === undefined || stage == null) stage = this.mapInfo.stage;

        if (stage < 0 || stage > 2) return "res/Event/BlueOcean/BlueOceanUI/stage0.png";
        return "res/Event/BlueOcean/BlueOceanUI/stage" + stage + ".png";
    },

    getStageBackgroundImage: function (stage) {
        if (!this.mapInfo) stage = 0;
        if (stage === undefined || stage == null) stage = this.mapInfo.stage;

        if (stage < 0 || stage > 2) return "res/Event/BlueOcean/BlueOceanUI/bg_stage0.jpg";
        return "res/Event/BlueOcean/BlueOceanUI/bg_stage" + stage + ".jpg";
    },

    getStageWaveImage: function () {
        if (!this.mapInfo) return "res/Event/BlueOcean/BlueOceanUI/wave_stage0.png";
        if (this.mapInfo.stage < 0 || this.mapInfo.stage > 2) return "";
        return "res/Event/BlueOcean/BlueOceanUI/wave_stage" + this.mapInfo.stage + ".png";
    },

    convertIdNormal: function (id) {
        if (this.isItemStored(id) && id % 10 != 0) {
            id = Math.floor(id / 10) * 10;
        }
        return id;
    },

    getIndexFromPoint: function (row, column) {
        return row * BO_COL + column;
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
            str = LocalizedString.to("BO_TIME_LEFT_FORMAT_FULL");
            str = StringUtility.replaceAll(str, "@day", day);
            str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
            str = StringUtility.replaceAll(str, "@minute", (minute < 10) ? "0" + minute : minute);
            str = StringUtility.replaceAll(str, "@second", (timeLeft < 10) ? "0" + timeLeft : timeLeft);
            return str;
        } else {
            if (day > 0) {
                str = LocalizedString.to("BO_TIME_LEFT_FORMAT_DAY");
                str = StringUtility.replaceAll(str, "@day", day);
            } else {
                //str = LocalizedString.to("BO_TIME_LEFT_FORMAT_HOURS");
                //str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
                //if (hour <= 0) {
                //    str = str.substr(str.indexOf("@minute"), str.length);
                //}
                //else {
                //    str = str.substr(str.indexOf("@minute"), str.length);
                //}

                if (hour > 0) {
                    str = LocalizedString.to("BO_TIME_LEFT_FORMAT_HOURS");
                } else if (minute > 0) {
                    str = LocalizedString.to("BO_TIME_LEFT_FORMAT_MINUTES");
                } else {
                    str = LocalizedString.to("BO_TIME_LEFT_FORMAT_SECONDS");
                }

                str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
                str = StringUtility.replaceAll(str, "@minute", (minute < 10) ? "0" + minute : minute);
                str = StringUtility.replaceAll(str, "@second", (timeLeft < 10) ? "0" + timeLeft : timeLeft);
            }
        }
        return str;

        //if (timeLeft > 0) {
        //    var str = LocalizedString.to("BO_TIME_LEFT_FORMAT_FULL");
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
        return count * this.changeToGold;
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
        var cmd = new CmdSendBlueOceanChangePiece();
        cmd.putData(arrayId, arrayPiece, arrayNum, arrayGoldId, arrayGoldPiece, arrayGoldNum);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendOpenChest: function (level) {
        var cmd = new CmdSendBlueOceanOpenChest();
        cmd.putData(level);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendBuyTicketG: function (cost) {
        var cmd = new CmdSendBlueOceanBuyTicketG();
        cmd.putData(cost);
        GameClient.getInstance().sendPacket(cmd);
    },

    isItemOutGame: function (id) {
        return (id > BO_ITEM_OUT_GAME);
    },

    isItemStored: function (id) {
        return (id > BO_ITEM_STORED);
    },

    checkWeek: function (week) {
        return (this.eventTime == week);
    },

    isInEvent: function () {
        if (this.eventTime >= BO_WEEK_START && this.eventTime <= BO_WEEK_END) return true;
        return false;
    },

    isEndEvent: function () {
        if (this.eventTime == BO_WEEK_END + 1) return true;
        return false;
    },

    isCharacterHere: function (x, y) {
        return (this.mapInfo.row == x && this.mapInfo.col == y);
    },

    // FUNCTION
    onEvent: function (cmd) {
        cc.log("##BlueOcean::onEvent " + JSON.stringify(cmd));

        this.eventTime = cmd.eventTime;

        this.giftIds = cmd.giftIds;
        for (var i = 0; i < cmd.giftIds.length; i++) {
            this.giftNames[cmd.giftIds[i] + ""] = cmd.giftNames[i];
            this.giftValues[cmd.giftIds[i] + ""] = cmd.giftValues[i];
            // this.giftPrices[cmd.giftIds[i] + ""] = cmd.giftPrices[i];
            //this.giftItemImages[cmd.giftIds[i] + ""] = this.getItemImage(cmd.giftIds[i]);
        }

        this.timeEventEnd = Math.floor((Date.now() + cmd.timeLeft) / 1000);
        this.isRegisterSuccess = cmd.isRegisterSuccess;
        this.isRegisterSuccess = true;
        this.eventWeeks = cmd.eventWeeks;
        this.eventDayFrom = cmd.eventDayFrom;
        this.eventDayTo = cmd.eventDayTo;

        // Do Bat dau EventMgr User da co Levl Ruong la 1, nen moi Logic se lay Level cua ruong tru di 1
        this.arrayBonusData = [];
        this.numLevel = cmd.treasureRewardExp.length;
        this.treasureRewardExp = cmd.treasureRewardExp;
        this.treasureRewardLevel = cmd.treasureRewardLevel;
        this.changeToGold = cmd.changeToGold;

        for (var i = 0; i < cmd.treasureRewardName.length; i++) {
            this.arrayBonusData[i] = new ChestBonusData(cmd.treasureRewardType[i], cmd.treasureRewardName[i], cmd.treasureRewardValue[i]);
        }
        this.arrayLevelTreasure = [];
        var count = 0;
        for (var i = 0; i < this.treasureRewardLevel.length; i++) {
            if (this.treasureRewardLevel[i] > count) {
                this.arrayLevelTreasure[count] = i;
                count++;
            }
        }
        this.showEventButton();

        var gui = sceneMgr.getMainLayer();
        if (gui && gui instanceof BlueOceanScene) {
            gui.updateEventInfo();
        }

        // update shop
        if (blueOcean.isInEvent()) {
            event.updateEventConfig();
        }

        var cmd = new CmdSendBlueOceanOpen();
        cmd.putData(0);
        GameClient.getInstance().sendPacket(cmd);

        if (CheckLogic.checkInBoard() && this.isInEvent()){
            var gui = sceneMgr.getMainLayer();
            //gui.initEventBlueOcean();
        }
    },

    notifyBlueOceanAction: function (cmd) {
        this.notifyEvent = cmd.notify;

        if (cmd.gifts.length > 0) {
            this.arAutoGifts = cmd.gifts;
            this.currentAutoGift = 0;
            this.showAutoGift();
        }

        if (this.isFinishDownload && cmd.totalGold > 0) {
            var func = function () {
                var open = sceneMgr.openGUI(BO_PIECE_GUI_CLASS, BO_PIECE_GUI_ORDER, BO_PIECE_GUI_ORDER);
                if (open) open.showPieces(cmd.totalGold);
            }
            resourceManager.openGUI(BO_PIECE_GUI_CLASS, func);
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
                if (item.item == 0 && item.gift > 0) item.item = BO_MAX_ITEM_CONVERT_GIFT;
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
        cc.log("++Gifts : " + JSON.stringify(blueOcean.gifts));

        this.mapInfo.remainMove = cmd.remainedMoveValue;
        this.mapInfo.moveNumberToChangeMap = cmd.moveNumberToChangeMap;

        this.chestLevel = cmd.chestLevel;
        this.currentChestExp = cmd.currentChestExp;
        this.needChestExp = cmd.needChestExp;
        this.levelReceived = cmd.levelReceived;
        this.passTreasureLevel = this.treasureLevel;
        this.treasureLevel = this.convertLevelChestToLevelTreasure(this.chestLevel);

        var mainLayer = sceneMgr.getMainLayer();
        if (mainLayer instanceof ShopIapScene) {
            mainLayer.updateEventInfo();
        }

        // update eggBreaker scene
        if (this.blueOceanScene) {
            this.blueOceanScene.updateEventInfo();
            var gui = sceneMgr.getGUIByClassName(BlueOceanChestInfoGUI.className);
            if (gui) {
                gui.updateInfo();
            }
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

        var gui = sceneMgr.getGUIByClassName("BlueOceanHistoryGUI");
        if (gui && gui.isVisible())
            gui.pChangePiece.panel.updateData();
    },

    onAccumulate: function (cmd) {
        var gui = sceneMgr.openGUI(BO_ACCUMULATE_GUI_CLASS, BO_ACCUMULATE_GUI_ORDER, BO_ACCUMULATE_GUI_ORDER, false);
        if (gui) gui.showAccumulate(cmd);
    },

    onRollResult: function (cmd) {
        if (!cmd.isNeedUserChooseDirection) {
            blueOcean.additionalChestExpByStep = cmd.additionalChestExpByStep;
            blueOcean.additionalChestExp = cmd.additionalChestExp;
        }

        if (this.blueOceanScene) {
            //  ToastFloat.makeToast(ToastFloat.SHORT, "RESULT ROLL: " + cmd.result);
            this.blueOceanScene.onRollResult(cmd);
        } else {
            //   ToastFloat.makeToast(ToastFloat.SHORT, "RESULT ROLL NOT SCENE : " + cmd.result);
        }

    },

    onChangeAward: function (cmd) {
        blueOcean.isWaitResponseRegister = false;
        cc.log("ON CHANGE AWARD ** ");
        if (cmd.type == CmdReceiveBlueOceanChangeAward.IN_GAME || true) {
            var gui = sceneMgr.getGUI(BO_OPEN_GIFT_GUI_ORDER);
            if (cmd.result == 1) {
                cc.log("SUCCESS");
                if (gui && gui instanceof BlueOceanOpenGiftGUI) {
                    gui.onGiftSuccess();
                }
            } else {
                cc.log("VO DAY NE ");
                sceneMgr.showOKDialog(LocalizedString.to("BO_CHANGE_AWARD_FAIL"));
                gui.isWaitResponse = false;
                if (gui && gui instanceof BlueOceanOpenGiftGUI) {
                    gui.onBack();
                }
            }
        } else {
            var gui1 = sceneMgr.getGUIByClassName(BO_OPEN_GIFT_GUI_CLASS);
            if (cmd.result == 1) {
                if (blueOcean.isRegisterSuccess) {
                    sceneMgr.showOKDialog(LocalizedString.to("BO_REGISTER_SUCCESS"));
                } else {
                    sceneMgr.showOkDialogWithAction(LocalizedString.to("BO_REGISTER_SUCCESS"), function (buttonId) {
                        var gui = sceneMgr.openGUI(BO_HISTORY_GUI_CLASS, BO_HISTORY_GUI_ORDER, BO_HISTORY_GUI_ORDER);
                        gui.onButtonRelease(null, BO_SCENE_TAB_INFORMATION);
                    });

                }

                blueOcean.isRegisterSuccess = true;
                var gui = sceneMgr.getGUI(BO_REGISTER_GUI_ORDER);
                if (gui && gui instanceof BlueOceanRegisterInformationGUI) {
                    // gui.onClose();
                    gui.onCloseDone();
                }
            } else {
                sceneMgr.showOKDialog(LocalizedString.to("BO_REGISTER_FAIL"));
            }
        }
    },

    onUserAwardSuccess: function (cmd) {
        var isOutGame = blueOcean.isItemOutGame(cmd.giftId);
        var txts = [];
        txts.push({"text": LocalizedString.to("BO_BROADCABO_USER_AWARD_0"), "color": cc.color(255, 255, 255, 0)});
        txts.push({"text": cmd.userName, "font": SceneMgr.FONT_BOLD, "color": cc.color(85, 207, 0, 0)});
        txts.push({"text": LocalizedString.to("BO_BROADCABO_USER_AWARD_1"), "color": cc.color(255, 255, 255, 0)});
        txts.push({
            "text": blueOcean.getItemName(cmd.giftId),
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
                    if (blueOcean.isItemStored(ggg["id"])) {
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
                        totalGold += blueOcean.getItemValue(ggg.id) * ggg["number"][0];
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

        var gui = sceneMgr.getGUI(BO_HISTORY_GUI_ORDER);
        if (gui && gui instanceof BlueOceanHistoryGUI) {
            gui.updateRollHistory();
        }
    },

    onGiftHistory: function (cmd) {
        this.arGiftHistory = [];
        for (var s in cmd.ids) {
            if (blueOcean.isItemOutGame(cmd.ids[s]))
                this.arGiftHistory.push(cmd.ids[s]);
        }

        var gui = sceneMgr.getGUI(BO_HISTORY_GUI_ORDER);
        if (gui && gui instanceof BlueOceanHistoryGUI) {
            gui.updateGiftHistory();
        }
    },

    onInfoHistory: function (cmd) {
        this.infoHistory = cmd;

        var gui = sceneMgr.getGUI(BO_HISTORY_GUI_ORDER);
        if (gui && gui instanceof BlueOceanHistoryGUI) {
            gui.updateInformation();
        }
    },

    addAccumulateGUI: function(){
        try {
            if (this.btnInGame)
                this.btnInGame.setVisible(true);
        }
        catch (e) {

        }
    },

    removeAccumulateGUI: function() {
        try {
            if (this.btnInGame)
                this.btnInGame.setVisible(false);
        }
        catch (e) {

        }
    },

    createButtonInGame: function (pos, parent) {
        (!this.isFinishDownload)
            return;
        if (!this.isInEvent())
            return;
        var btn = new ccui.Button();
        btn.setPressedActionEnabled(true);
        btn.loadTextures(BO_IMAGE_BUTTON_IN_GAME, BO_IMAGE_BUTTON_IN_GAME, BO_IMAGE_BUTTON_IN_GAME);
        btn.addTouchEventListener(this.touchEvent, this);
        btn.setPosition(pos.x - btn.getContentSize().width * 0.5, pos.y + 20);
        // btn.setPosition(300, 300);
        this.btnInGame = btn;
        parent.addChild(btn);


        // var cmd = new CmdSendBlueOceanOpen();
        // GameClient.getInstance().sendPacket(cmd);

    },

    touchEvent: function () {
        this.btnInGame.setEnabled(false);
        this.btnInGame.runAction(cc.fadeOut(0.4));
        var gui = sceneMgr.openGUI(BO_ACCUMULATE_GUI_CLASS, BO_ACCUMULATE_GUI_ORDER, BO_ACCUMULATE_GUI_ORDER, false);
        var cmd = {};
        cmd.additionExp = 0;
        cmd.currentLevelExp = blueOcean.curLevelExp;
        cmd.nextLevelExp = blueOcean.nextLevelExp;

        cmd.keyCoindAdd = 0;
        cmd.keyCoin = blueOcean.keyCoin;
        cmd.keyCoinAward = 0;

        if (gui) gui.showAccumulate(cmd);
    },

    resetEventButton: function () {
        this.buttonLobby = null;
    },

    // LISTENER
    onReceive: function (cmd, data) {
        // if (gamedata.checkInReview()) return;
        switch (cmd) {
            case BO_CMD_EVENT_NOTIFY: {
                var rEventNotify = new CmdReceiveBlueOceanNotify(data);
                rEventNotify.clean();

                cc.log("CBO_EVENT_NOTIFY: " + JSON.stringify(rEventNotify));
                blueOcean.onEvent(rEventNotify);
                break;
            }
            case BO_CMD_NOTIFY_ACTION: {
                var rActionNotify = new CmdReceiveBlueOceanActionNotify(data);
                rActionNotify.clean();

                cc.log("CBO_NOTIFY_ACTION: " + JSON.stringify(rActionNotify));

                blueOcean.notifyBlueOceanAction(rActionNotify);
                break;
            }
            case BO_CMD_OPEN_EVENT: {
                var rEventInfo = new CmdReceiveBlueOceanInfo(data);
                rEventInfo.clean();

                cc.log("CBO_OPEN_EVENT: " + JSON.stringify(rEventInfo));

                blueOcean.updateEventInfo(rEventInfo);
                break;
            }
            case BO_CMD_ACCUMULATE_INFO: {
                var rAccInfo = new CmdReceiveBlueOceanAccumulateInfo(data);
                rAccInfo.clean();

                cc.log("CBO_ACCUMULATE_INFO: " + JSON.stringify(rAccInfo));

                blueOcean.onAccumulate(rAccInfo);
                break;
            }
            case BO_CMD_ROLL_EVENT: {
                var rRollEvent = new CmdReceiveBlueOceanRoll(data);
                rRollEvent.clean();

                cc.log("CBO_ROLL_EVENT: " + JSON.stringify(rRollEvent));

                blueOcean.onRollResult(rRollEvent);
                break;
            }
            case BO_CMD_EVENT_END: {
                if (blueOcean.eventTime > 0) {
                    blueOcean.eventTime = BO_WEEK_END + 1;
                    var cmd = {};
                    cmd.result = 3;
                    blueOcean.onRollResult(cmd);
                }
                break;
            }
            case BO_CMD_CHANGE_AWARD: {
                var rAward = new CmdReceiveBlueOceanChangeAward(data);
                rAward.clean();

                cc.log("CBO_CHANGE_AWARD: " + JSON.stringify(rAward));

                blueOcean.onChangeAward(rAward);
                break;
            }
            case BO_CMD_USER_CHANGE_AWARD_SUCCESS: {
                var rUserAward = new CmdReceiveBlueOceanUserChangeAward(data);
                rUserAward.clean();

                cc.log("CBO_USER_CHANGE_AWARD_SUCCESS: " + JSON.stringify(rUserAward));

                blueOcean.onUserAwardSuccess(rUserAward);
                break;
            }
            case BO_CMD_CHEAT_G_SERVER: {
                var rGServer = new CmdReceiveBlueOceanGServer(data);
                rGServer.clean();

                cc.log("CBO_CHEAT_G_SERVER : " + JSON.stringify(rGServer));

                if (this.blueOceanScene) {
                    this.blueOceanScene.updateGSystem(rGServer);
                }
                break;
            }
            case BO_CMD_EVENT_SHOP_BONUS: {
                cc.log("WHY ***************************** ");
                var rEventShop = new CmdReceiveBlueOceanShopBonus(data);
                rEventShop.clean();

                cc.log("CBO_EVENT_SHOP_BONUS : " + JSON.stringify(rEventShop));

                event.onEventShopBonusNew(rEventShop, Event.BLUE_OCEAN);
                this.sendCheckNewDay = false;
                this.saveDay = -1;
                break;
            }
            case BO_CMD_GET_ROLL_HISTORY: {
                var rHistory = new CmdReceiveBlueOceanRollHistory(data);
                rHistory.clean();

                cc.log("CBO_GET_ROLL_HISTORY : " + JSON.stringify(rHistory));
                blueOcean.onRollHistory(rHistory);
                break;
            }
            case BO_CMD_GET_GIFT_HISTORY: {
                var rHistory = new CmdReceiveBlueOceanGiftHistory(data);
                rHistory.clean();

                cc.log("CBO_GET_GIFT_HISTORY : " + JSON.stringify(rHistory));
                blueOcean.onGiftHistory(rHistory);
                break;
            }
            case BO_CMD_GET_REGISTER_INFORMATION: {
                var rInfo = new CmdReceiveBlueOceanRegisterInfor(data);
                rInfo.clean();
                this.registerData = rInfo;
                cc.log("CBO_GET_REGISTER_INFORMATION : " + JSON.stringify(rInfo));
                blueOcean.onInfoHistory(rInfo);
                break;
            }
            case BO_CMD_EVENT_TICKET_FROM_GOLD : {
                var rCoinBonus = new CmdReceiveBlueOceanKeyCoinBonus(data);
                rCoinBonus.clean();

                cc.log("CBO_KEY_CON_BONUS : " + JSON.stringify(rCoinBonus));

                if (rCoinBonus.keyCoin <= 0) return;

                // var clb = sceneMgr.getMainLayer();
                // if (clb instanceof BlueOceanScene) {
                //     var gui = sceneMgr.openGUI(BO_HAMMER_EMPTY_CLASS, BO_DIALOG_ORDER, BO_DIALOG_ORDER);
                //     if (gui) {
                //         gui.setGUI(BO_HAMMER_TICKET, rCoinBonus.keyCoin);
                //     }
                // }
                // else {
                var str = "";
                return;
                if (rCoinBonus.option == 14) // Mua tu Offer
                    return;
                else if (rCoinBonus.option == 5)
                    str = LocalizedString.to("BO_BUY_KEYCOIN_G");
                else if (rCoinBonus.option == 0)
                    str = LocalizedString.to("BO_KEYCOIN_BONUS");
                else
                    str = LocalizedString.to("BO_KEYCOIN_BONUS");

                str = StringUtility.replaceAll(str, "@coin", rCoinBonus.keyCoin);

                // var dlg = sceneMgr.openGUI(Dialog.className + "_BlueOcean", Dialog.ZODER, Dialog.TAG, false);
                // dlg.setOKNotify(str);

                var gui = sceneMgr.openGUI(BO_HAMMER_EMPTY_CLASS, BO_DIALOG_ORDER, BO_DIALOG_ORDER);
                if (gui) {
                    gui.setGUI(BO_HAMMER_TICKET, str);
                }
                // }

                break;
            }
            case BO_CMD_CHANGE_PIECE : {
                var rChange = new CmdReceiveBlueOceanChangePiece(data);
                cc.log("BO_CMD_CHANGE_PIECE : " + JSON.stringify(rChange));
                rChange.clean();
                blueOcean.resetChange();
                var gui = sceneMgr.getGUIByClassName(BlueOceanPieceChangeGUI.className);
                if (gui)
                    gui.updateData();
                if (rChange.getError() == 0) {
                    var s = localized("BO_CHANGE_PIECE");
                    s = StringUtility.replaceAll(s, "@num", rChange.numPiece);
                    s = StringUtility.replaceAll(s, "@gold", StringUtility.pointNumber(rChange.gold));
                    var dlg = sceneMgr.openGUI(Dialog.className + "_BlueOcean", Dialog.ZODER, Dialog.TAG, false);
                    dlg.setOKNotify(s);
                } else {
                    cc.log("CHANGE ERROR " + rChange.getError());
                }
                break;
            }
            case BO_CMD_OPEN_CHEST: {
                var rOpenChest = new CmdReceiveBlueOceanOpenChest(data);
                cc.log("BO_CMD_CHANGE_PIECE : " + JSON.stringify(rOpenChest));
                rOpenChest.clean();
                if (rOpenChest.getError() == 0) {
                    blueOcean.treasureRewardTypeOpen = rOpenChest.treasureRewardType;
                    blueOcean.treasureRewardNameOpen = rOpenChest.treasureRewardName;
                    blueOcean.treasureRewardValueOpen = rOpenChest.treasureRewardValue;
                    blueOcean.treasureRewardNumberOpen = rOpenChest.treasureRewardNumber;
                    this.blueOceanScene.openChestGUI(rOpenChest.chestLevel);
                }
                else {
                    var s = LocalizedString.to("BO_OPEN_CHEST_" + rOpenChest.getError());
                    var dlg = sceneMgr.openGUI(Dialog.className + "_BlueOcean", Dialog.ZODER, Dialog.TAG, false);
                    dlg.setOKNotify(s);
                }
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
        // if (!this.isInEvent()) {
        //     if (this.checkWeek(BO_WEEK_END)) {
        //         this.buttonLobby.time.setString(LocalizedString.to("BO_EVENT_TIMEOUT"));
        //     }
        //     else {
        //         this.buttonLobby.setVisible(false);
        //     }
        //     return;
        // }
        // else {
        //
        // }
        if (this.eventTime <= 0)
            return;

        this.checkSendNewDay();

        var stime = blueOcean.getTimeLeftString();
        var nTime = blueOcean.getTimeLeft();

        try {
            if (nTime <= 0) {
                // if (this.eventTime >= BO_WEEK_END) {
                if (this.isFinishDownload)
                    this.buttonLobby.time.setString(LocalizedString.to("BO_EVENT_TIMEOUT"));
                else
                    this.buttonLobby.time.setString(LocalizedString.to("LOADING_EVENT"));
                blueOcean.eventTime = BO_WEEK_END + 1;
                if (this.btnInGame) {
                    this.btnInGame.setVisible(false);
                }

                // }
                // else {
                //     if (this.eventTime > 0) {
                //         this.timeEventEnd = 7 * 24 * 60 * 60 - 1 + new Date().getTime() / 1000;
                //         this.eventTime++;
                //     }
                // }

            } else {
                var s = LocalizedString.to("BO_INFO_TIME_LEFT_0");
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

var BlueOceanSound = function () {
};

BlueOceanSound.playLobby = function () {
    if (gameSound.on) {
        audioEngine.stopAllEffects();
        audioEngine.stopMusic();
        audioEngine.playMusic(resSTSound.bg, true);
    }
};

BlueOceanSound.closeLobby = function () {
    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
    audioEngine.end();
};

BlueOceanSound.playBubbleSingle = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.bubble_single, false);
    }
};

BlueOceanSound.playSoundSingle = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.sound_single, false);
    }
};

BlueOceanSound.playSingleCoin = function () {
    if (gameSound.on) {
        var rnd = parseInt(Math.random() * 10) % 3 + 1;
        var resource = "res/Lobby/Common/coin_0" + rnd + ".mp3";
        cc.audioEngine.playEffect(resource, false);
    }
};

BlueOceanSound.playPiece = function () {
    if (gameSound.on) {
        cc.audioEngine.playEffect(resSTSound.piece, false);
    }
};

BlueOceanSound.playDiceFly = function () {
    if (gameSound.on) {
        //cc.audioEngine.playEffect(resSTSound.diceFly, false);
    }
};

BlueOceanSound.playFoxJump = function () {
    if (gameSound.on) {
        cc.audioEngine.playEffect(resSTSound.foxJump, false);
    }
};

BlueOceanSound.playBubbleSequence = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.bubble_sequence, false);
    }
};

BlueOceanSound.playBubbleSequence1 = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.bubble_sequence_1, false);
    }
};

BlueOceanSound.playBubbleSequence2 = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.bubble_sequence_2, false);
    }
};

BlueOceanSound.playSoundSequence = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.sound_sequence, false);
    }
};

BlueOceanSound.playOpenPlate = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.bubble_sequence_1, false);
    }
};

BlueOceanSound.playClosePlate = function () {
    if (gameSound.on) {
        audioEngine.playEffect(resSTSound.closePlate, false);
    }
};

BlueOceanSound.playRollPlate = function () {
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

BlueOceanSound.preloadAllSound = function(){
    if (cc.sys.isNative){
        for(var s in resSTSound) {
            audioEngine.preloadEffect(resSTSound[s]);
        }
    }

    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
};

resSTSound = {
    bg : "res/Event/BlueOceanRes/beach.mp3",
    bubble_single : "res/Event/BlueOceanRes/bubble_single.mp3",
    sound_single : "res/Event/BlueOceanRes/sound_single.mp3",
    bubble_sequence : "res/Event/BlueOceanRes/bubble_sequence.mp3",
    bubble_sequence_1 : "res/Event/BlueOceanRes/bubble_sequence_1.mp3",
    bubble_sequence_2 : "res/Event/BlueOceanRes/bubble_sequence_2.mp3",
    sound_sequence : "res/Event/BlueOceanRes/sound_sequence.mp3",
    piece : "res/Event/BlueOceanRes/pieces.mp3",
    rollPlate1: "res/Event/BlueOceanRes/xoc_dia_001.mp3",
    rollPlate2: "res/Event/BlueOceanRes/xoc_dia_002.mp3",
    rollPlate3: "res/Event/BlueOceanRes/xoc_dia_003.mp3",
    rollPlate4: "res/Event/BlueOceanRes/xoc_dia_004.mp3",
    closePlate: "res/Event/BlueOceanRes/dong_dia.mp3",
    //diceFly: "res/Event/BlueOceanRes/dice_fly.mp3",
    foxJump: "res/Event/BlueOceanRes/fox_jump.mp3",
};

BlueOcean._instance = null;
BlueOcean.getInstance = function () {
    if (!BlueOcean._instance) {
        BlueOcean._instance = new BlueOcean();
    }
    return BlueOcean._instance;
};
var blueOcean = BlueOcean.getInstance();

var ClassTest = cc.Class.extend({
    arrayTest: [],
    ctor: function () {

    }
})

var ChestBonusData = cc.Class.extend({
    ctor: function (type, name, value) {
        this.arrayType = [];
        this.arrayName = [];
        this.arrayValue = [];
        this.arrayName = name.split(";");
        this.arrayType = type.split(";");
        this.arrayValue = value.split(";");
        for (var i = 0; i < this.arrayType.length; i++) {
            if (this.arrayType[i] != BlueOcean.BONUS_GOLD && this.arrayType[i] != BlueOcean.BONUS_DIAMOND) {
                this.arrayType[i] = BlueOcean.BONUS_PIECE;
            }
            this.arrayValue[i] = parseInt(this.arrayValue[i]);
        }
    },

    getValue: function (type) {
        for (var i = 0; i < this.arrayType.length; i++) {
            if (this.arrayType[i] == type) {
                if (type == BlueOcean.BONUS_PIECE) {
                }
                return this.arrayValue[i];
            }
        }
        return 0;
    }
})

BlueOcean.BONUS_GOLD = "gold";
BlueOcean.BONUS_DIAMOND = "diamond";
BlueOcean.BONUS_PIECE = "piece";