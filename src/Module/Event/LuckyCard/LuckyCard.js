/**
 * Created by Hunter on 7/26/2016.
 */

var LuckyCard = cc.Class.extend({
    ctor: function () {
        // config
        this.eventTime = 0; // event 0 : off event || 1-4 :: week of event || 5 :: over event , wait off event
        this.giftNames = {}; // key : id of item - value : name of item
        this.giftValues = {}; // key : id of item - value : value of item
        this.giftIds = [];
        this.giftItemImages = {}; // key : id of item - value : image path of item
        this.costRoll = [5, 50];     // cost to roll in event
        this.arrayVPoint = [1002, 1004, 1007];
        this.arrayDiamond = [1009, 1010];
        this.bonusCostRoll = [];  // bonus cost
        this.bonusGold = 0; // bonus change gold in event
        this.timeEventEnd = 0;
        this.shopEventBonus = [];
        this.notifyEvent = false;
        this.eventWeeks = [];
        this.eventDayFrom = "";
        this.eventDayTo = "";
        this.eventLinkNews = "";
        this.isFirstTime = false;
        this.tabEventShop = false;
        this.enableFastEventFormBorad = true;
        this.firstCoinBonus = false;

        // data
        this.keyCoin = 0;
        this.curLevelExp = 1;
        this.nextLevelExp = 1;
        this.curLevel = 0;
        this.gifts = []; // Object : {id:id of item,item: num item collect,gift : num gift you have }

        this.isRegisterSuccess = false;

        // scene
        this.luckyCardScene = null;
        this.buttonLobby = null;
        this.showx2_daily = true;
        //this.preloadResource();

        this.history = [];

        this.openShopX2 = 0;
        this.initGift = false;
        this.prevGifts = [];
        this.getGiftSuccess = false;
        this.updateHist = false;

        this.eventAvailable = false;
        this.sendCheckNewDay = false;
        this.saveDay = -1;
    },

    preloadResource: function () {
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Lobby/EventMgr/halloween/ButtonEvent/skeleton.xml", "ButtonEvent");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Lobby/EventMgr/halloween/ButtonEvent/texture.plist", "ButtonEvent");

        if (!this.isFinishDownload)
            return;

        // preload
        LocalizedString.add("res/EventMgr/LuckyCard/WishStarRes/LuckyCard_vi");
        db.DBCCFactory.getInstance().loadDragonBonesData("res/EventMgr/LuckyCard/WishStarRes/Fox/skeleton.xml", "Fox");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/EventMgr/LuckyCard/WishStarRes/Fox/texture.plist", "Fox");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/EventMgr/LuckyCard/WishStarRes/RutThe/skeleton.xml", "RutThe");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/EventMgr/LuckyCard/WishStarRes/RutThe/texture.plist", "RutThe");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/EventMgr/LuckyCard/WishStarRes/NoBong/skeleton.xml", "NoBong");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/EventMgr/LuckyCard/WishStarRes/NoBong/texture.plist", "NoBong");

    },
    resetData: function () {
        // config
        this.eventTime = 0; // event 0 : off event || 1-4 :: week of event || 5 :: over event , wait off event
        this.giftNames = {}; // key : id of item - value : name of item
        this.giftValues = {}; // key : id of item - value : value of item
        this.giftItemImages = {}; // key : id of item - value : image path of item
        this.costRoll = [5, 50];     // cost to roll in event
        this.bonusCostRoll = [];  // bonus cost
        this.bonusGold = 0; // bonus change gold in event
        this.timeEventEnd = 0;
        this.notifyEvent = false;
        this.eventWeeks = [];
        this.eventDayFrom = "";
        this.eventDayTo = "";
        this.eventLinkNews = "";
        this.isFirstTime = false;
        this.tabEventShop = false;
        this.enableFastEventFormBorad = true;

        // data
        this.keyCoin = 0;
        this.curLevelExp = 1;
        this.nextLevelExp = 1;
        this.curLevel = 0;
        this.gifts = []; // Object : {id:id of item,item: num item collect,gift : num gift you have }

        this.isRegisterSuccess = false;

        // scene
        this.luckyCardScene = null;
        this.buttonLobby = null;
    },

    createCmdNotifyEvent: function () {
        var cmd = {};
        cmd.eventTime = 1;
        cmd.giftIds = [1001, 1002, 1003, 1004, 1000001, 1000002, 1000003, 1000004, 1000005];
        cmd.giftNames = ["Gold", "Gold", "Gold", "Gold", "Gold", "Gold", "Gold", "Gold", "Gold"];

        cmd.giftValues = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000];
        cmd.timeLeft = 1437779988;
        cmd.costs = [1, 10];
        cmd.bonus = [1, 10];

        cmd.isRegisterSuccess = false;


        cmd.eventWeeks = ["", "", "", ""];

        cmd.eventDayFrom = "sfdf";
        cmd.eventDayTo = "fsdf";
        cmd.showX2G = false;
        cmd.isFirstTime = false;
        // cmd.eventLinkNews = "http://pmweb.play.zing.vn/mobileservice/trungthuongV2_mm.php";
        return cmd;
    },

    createCmdInfo: function () {

        var cmd = {};
        cmd.keyCoin = 0;
        cmd.currentLevelExp = 10;
        cmd.nextLevelExp = 1000000;
        cmd.curLevel = 1;
        cmd.ids = [1001, 1000001];
        cmd.items = [1, 1];
        cmd.gifts = [1, 2];
        cmd.list = [];
        for (var i = 0; i < cmd.ids.length; i++) {
            var item = {};
            item.id = cmd.ids[i];
            item.item = cmd.items[i];
            item.gift = cmd.gifts[i];
            item.isStored = luckyCard.isItemStored(item.id);
            cmd.list.push(item);
        }
        cmd.notify = 0;
        return cmd;
    },

    isInGUIEvent: function () {
        var gui = sceneMgr.getMainLayer();
        if (gui && gui instanceof LuckyCardScene)
            return true;
        return false;
    },

    openEvent: function () {
        if (this.eventTime == 0) {
            return;
        }
        cc.log("OPEN EVENT " + this.getTimeLeft() + " " + this.isEndEvent());
        if (this.getTimeLeft() > 0 && !this.isEndEvent())
            sceneMgr.openScene(LuckyCardScene.className);
        else {
            if (this.buttonLobby) this.buttonLobby.setVisible(false);
            Toast.makeToast(2, LocalizedString.to("LUCKYCARD_EVENT_TIMEOUT"))
        }
        //NativeBridge.openWebView(this.eventLinkNews);

        // preload sound
        LuckyCardSound.preloadAllSound();
    },

    openFastEvent: function () {
        if (this.getTimeLeft() > 0 && this.isInEvent() && this.keyCoin > 0 && this.enableFastEventFormBorad) {
            this.enableFastEventFormBorad = false;
            sceneMgr.openScene(LuckyCardScene.className);
            //sceneMgr.openScene(LuckyCardScene.className);
        } else return false;
        return true;
    },

    createNotifyLobby: function () {
        var notify = cc.Sprite();
        this.buttonLobby.getParent().addChild(notify);
        notify.setPosition(this.buttonLobby.getPositionX() + 60, this.buttonLobby.getPositionY() + 60);
        this.buttonLobby.notify = notify;
        this.buttonLobby.notify.setVisible(false);
    },

    showNotifyEvent: function (btn) {
        if (btn === undefined || btn == null) return;
        if (this.buttonLobby == null)
            this.buttonLobby = btn;

        // check show notify event
        this.notifyEvent = this.keyCoin > 0;
        for (var i = 0; i < this.gifts.length; i++) {
            if (this.gifts[i].gift > 0) {
                this.notifyEvent = true;
                break;
            }
        }

        if (this.buttonLobby.notify)
            this.buttonLobby.notify.setVisible(this.notifyEvent);

        // check event popup
        if (this.isInEvent()) {
            this.showEventButton();
            if (this.isFinishDownload) {
                if (this.checkNewDay()) {
                    var gui = sceneMgr.getMainLayer();
                    if (gui && gui instanceof LobbyScene) {
                        if (popUpManager.canShow(PopUpManager.NOTIFY_IN_GAME)) {
                            sceneMgr.openGUI(LuckyCardEventNotifyGUI.className, PopUpManager.NOTIFY_IN_GAME, PopUpManager.NOTIFY_IN_GAME, false);
                        }
                    }
                }

                if (this.showX2G && this.showx2_daily) {
                    //this.showX2G = false;
                    if (this.isFinishDownload) {
                        this.showx2_daily = false;
                        sceneMgr.openGUI(LuckyCardNapGNotifyGUI.className, LuckyCard.GUI_NAP_G_NOTIFY, LuckyCard.GUI_NAP_G_NOTIFY, false);
                    }
                }
            }
        } else if (this.isEndEvent()) {
            this.showEventButton();
        } else {
            LobbyButtonManager.getInstance().removeButton(this.buttonLobby.dataEvent.idEvent, LobbyButtonManager.TYPE_EVENT);
        }
        event.updateArrayBtnEventPosition();
    },

    showEventButton: function () {
        if (this.buttonLobby === undefined || this.buttonLobby == null) return;

        if (this.isInEvent() && this.getTimeLeft() > 0) {
            this.effectEventButton();
        } else {
            LobbyButtonManager.getInstance().removeButton(this.buttonLobby.dataEvent.idEvent, LobbyButtonManager.TYPE_EVENT);
        }
    },

    effectEventButton: function () {
        if (!this.buttonLobby) return;

        this.buttonLobby.notify.setVisible(this.notifyEvent);
        this.buttonLobby.button.setTitleText("");
        this.buttonLobby.button.setColor(cc.color.WHITE);
        this.buttonLobby.button.loadTextureNormal(this.getIconEventTexture());
        this.buttonLobby.button.loadTexturePressed(this.getIconEventTexture());
        this.buttonLobby.button.loadTextureDisabled(this.getIconEventTexture());
        this.buttonLobby.button.setScale(0.7);

        //this.buttonLobby.time.setPosition(this.buttonLobby.button.getContentSize().width / 3, -1 * this.buttonLobby.button.getContentSize().height / 3 - 5);
        this.buttonLobby.time.setFontSize(13);
        this.buttonLobby.time.setFontName("fonts/tahomabd.ttf");
        this.buttonLobby.time.setColor(cc.color(239, 217, 108, 255));
        this.buttonLobby.time.retain();
        this.buttonLobby.notify.retain();
        this.buttonLobby.retain();

        var btnAnim = db.DBCCFactory.getInstance().buildArmatureNode("ngoisao_event");
        if (btnAnim) {
            this.buttonLobby.button.setOpacity(0);
            if (!this.buttonLobby.anim.eff) {
                this.buttonLobby.anim.addChild(btnAnim);
                this.buttonLobby.anim.eff = btnAnim;
                btnAnim.setScale(0.7);
            }
            btnAnim.getAnimation().gotoAndPlay("1", -1, -1, 0);
        } else {
            this.buttonLobby.button.setOpacity(255);
        }

        this.buttonLobby.button.stopAllActions();
        if (luckyCard.getTimeLeft() > 0) {
            this.buttonLobby.time.setString(luckyCard.getTimeLeftString());
        } else {
            this.buttonLobby.button.setRotation(0);
            this.buttonLobby.notify.setVisible(false);
            if (this.isFinishDownload)
                this.buttonLobby.time.setString(LocalizedString.to("LUCKYCARD_EVENT_TIMEOUT"));
            else
                this.buttonLobby.time.setString(LocalizedString.to("LOADING_EVENT"));
        }
    },

    showRegisterInformation: function (gIds) {
        var gui = sceneMgr.openGUI(LuckyCardRegisterInformationGUI.className, LuckyCard.GUI_INFORMATION, LuckyCard.GUI_INFORMATION);
        if (gui) gui.updateInfor(gIds);
    },

    randomTime: function (min, max) {
        var random = (Math.random()) / max;
        var diff = max - min;
        var r = random * diff;
        return min + r;
    },

    addAccumulateGUI: function () {
        if (!this.isFinishDownload)
            return;
        var gui = sceneMgr.getGUI(LuckyCard.GUI_ACCUMULATE);
        if (!gui) {
            var gui = sceneMgr.openGUI(LuckyCardAccumulateGUI.className, LuckyCard.GUI_ACCUMULATE, LuckyCard.GUI_ACCUMULATE, false);
            gui.setAllShow(true);
        }
    },

    removeAccumulateGUI: function () {
        if (!this.isFinishDownload)
            return;
        var gui = sceneMgr.getGUI(LuckyCard.GUI_ACCUMULATE);
        if (gui) {
            gui.removeFromParent(true);
        }
    },

    getTicketTexture: function () {
        return "res/EventMgr/LuckyCard/WishStar/iconKeyCoin.png";
    },

    getIconEventTexture: function () {
        return "res/EventMgr/LuckyCard/WishStar/iconEvent.png";
    },

    // utils
    checkNewDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("luckyCard_current_day_" + gamedata.userData.uID);

        if (sDay != cDay) {
            return true;
        }
        return false;
    },

    saveCurrentDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("luckyCard_current_day_" + gamedata.userData.uID, sDay);
    },

    checkNewDayNapG: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("luckyCard_current_day_napg" + gamedata.userData.uID);

        if (sDay != cDay) {
            return true;
        }
        return false;
    },

    saveCurrentDayNapG: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("luckyCard_current_day_napg" + gamedata.userData.uID, sDay);
    },

    // GET - SET
    getItemName: function (id) {
        if (id in this.giftNames) {
            return this.giftNames[id];
        }
        return "";
    },

    getItemValue: function (id) {
        if (this.isItemStored(id))
            return 1;
        return this.giftValues[id];
    },

    getItemImage: function (id, isBall) {
        if (isBall === undefined || isBall == null) isBall = true;

        if (this.isItemStored(id))
            return "res/EventMgr/LuckyCard/WishStar/item_" + id + ".png";

        if (this.isItemCoin(id))
            return "res/EventMgr/LuckyCard/WishStar/item_keyCoin.png";

        if (isBall)
            return "res/EventMgr/LuckyCard/WishStar/item_0.png";

        return "res/EventMgr/LuckyCard/WishStar/item_0_img.png";
    },

    getGiftImage: function (id) {
        return "res/EventMgr/LuckyCard/WishStar/item_" + id + ".png"
    },

    getInfoGift: function (id) {
        for (var pos = 0; pos < this.gifts.length; ++pos) if (this.gifts[pos].id == id) return this.gifts[pos];
        return null;
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

    getTimeLeftString: function () {
        var timeLeft = this.getTimeLeft();
        if (timeLeft <= 0) {
            str = LocalizedString.to("LUCKYCARD_TIME_LEFT_FORMAT_SECONDS");
            str = StringUtility.replaceAll(str, "@second", 0);
            return str;
        }

        var day = parseInt(timeLeft / 86400);
        timeLeft -= day * 86400;
        var hour = parseInt(timeLeft / 3600);
        timeLeft -= hour * 3600;
        var minute = parseInt(timeLeft / 60);
        timeLeft -= minute * 60;

        var str = "";
        if (day > 0) {
            str = LocalizedString.to("LUCKYCARD_TIME_LEFT_FORMAT_DAY");
            str = StringUtility.replaceAll(str, "@day", day);
        } else {
            if (hour > 0) {
                str = LocalizedString.to("LUCKYCARD_TIME_LEFT_FORMAT_HOURS");
                str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
            } else {
                if (minute > 0) {
                    str = LocalizedString.to("LUCKYCARD_TIME_LEFT_FORMAT_MINUTES");
                    str = StringUtility.replaceAll(str, "@minute", (minute < 10) ? "0" + minute : minute);
                } else {
                    str = LocalizedString.to("LUCKYCARD_TIME_LEFT_FORMAT_SECONDS");
                    str = StringUtility.replaceAll(str, "@second", (timeLeft < 10) ? "0" + timeLeft : timeLeft);
                }
            }
        }
        return str;
    },

    resetEventButton: function () {
        this.buttonLobby = null;
    },

    getCostRoll: function (type) {
        if (type < 0 || type >= this.costRoll.length) return 0;
        return this.costRoll[type];
    },

    getBonusCostRoll: function (type) {
        if (type < 0 || type >= this.bonusCostRoll.length) return 0;
        return this.bonusCostRoll[type];
    },

    getOfferTicketImage: function () {
        return "res/Lobby/Offer/bonusTicketCoin.png";
    },

    getOfferTicketString: function () {
        return "Xu";
    },

    isItemOutGame: function (id) {
        return (id > LuckyCard.ITEM_OUT_GAME);
    },

    isItemStored: function (id) {
        return (id > LuckyCard.ITEM_STORED);
    },

    isItemCoin: function (id) {
        return (id > 8 && id < 12);
    },

    isItemGold: function (id) {
        return (id > 0 && id <= 8);
    },

    checkWeek: function (week) {
        return (this.eventTime == week);
    },

    isInEvent: function () {
        if (this.eventTime >= LuckyCard.WEEK_1 && this.eventTime <= LuckyCard.WEEK_2) return true;
        return false;
    },

    isEndEvent: function () {
        if (this.eventTime == LuckyCard.WEEK_3) return true;
        return false;
    },

    isVPoint: function (id) {
        for (var i = 0; i < this.arrayVPoint.length; i++) {
            if (this.arrayVPoint[i] == id)
                return true;
        }
        return false;
    },

    isDiamond: function (id) {
        cc.log("ID " + id + " " + JSON.stringify(this.arrayDiamond));
        for (var i = 0; i < this.arrayDiamond.length; i++) {
            if (this.arrayDiamond[i] == id)
                return true;
        }
        return false;
    },

    requestOnShop: function () {
        // clear config
        event.updateEventConfig(true);

        if (this.isRequestedInfo) return;

        var cmd = new CmdSendLuckyCardOpen();
        GameClient.getInstance().sendPacket(cmd);
    },

    requestShopEvent: function () {
        cc.log("GETTING SHOP EVENT");
        var cmdEvent = new CmdSendRequestEventShop();
        GameClient.getInstance().sendPacket(cmdEvent);
        cmdEvent.clean();

    },

    requestHistory: function () {
        if (this.updateHist) {
            this.updateHist = false;
            var cmd = new CmdSendLuckyCardRequestHistory();
            GameClient.getInstance().sendPacket(cmd);
            cmd.clean();
            cc.log("send request history done");
        }
    },

    updateHistory: function (pk) {
        cc.log("History", JSON.stringify(pk));
        this.history = [];
        for (var i = 0; i < pk.listHist.length; i++) {
            this.history.push(pk.listHist[i]);
        }
    },

    sendMetricBuyCoin: function () {
        if (this.showX2G) {
            var cmd = new CmdSendLuckyCardMetricBuyCoin();
            GameClient.getInstance().sendPacket(cmd);
            cmd.clean();
        }
    },

    sendMetricOpenShopX2: function () {
        if (this.showX2G && this.openShopX2 > 0) {
            var cmd = new CmdSendLuckyCardMetricOpenShopX2();
            cmd.putData(this.openShopX2);
            GameClient.getInstance().sendPacket(cmd);
            cmd.clean();
            this.openShopX2 = 0;
        }
    },

    counterOpenShop: function () {
        if (this.showX2G) {
            this.openShopX2++;
        }
    },

    // FUNCTION
    onEvent: function (cmd) {
        this.updateHist = true;
        this.eventAvailable = true;
        this.eventTime = cmd.eventTime;

        this.giftIds = cmd.giftIds;
        this.giftStore = [];
        for (var i = 0; i < cmd.giftIds.length; i++) {
            this.giftNames[cmd.giftIds[i] + ""] = cmd.giftNames[i];
            this.giftValues[cmd.giftIds[i] + ""] = cmd.giftValues[i];
            this.giftItemImages[cmd.giftIds[i] + ""] = this.getItemImage(cmd.giftIds[i]);
            if (cmd.giftIds[i] > 1000) {
                this.giftStore.push(cmd.giftIds[i]);
            }
        }

        this.timeEventEnd = Math.floor((Date.now() + cmd.timeLeft) / 1000);

        //this.costRoll = cmd.costs;
        //this.bonusCostRoll = cmd.bonus;

        this.isRegisterSuccess = cmd.isRegisterSuccess;
        this.eventWeeks = cmd.eventWeeks;
        this.eventDayFrom = cmd.eventDayFrom;
        this.eventDayTo = cmd.eventDayTo;
        //this.showX2G = cmd.showX2G;
        this.eventLinkNews = cmd.eventLinkNews;
        //this.isFirstTime = cmd.isFirstTime;
        LuckyCardScene.doLoop();

        var gui = sceneMgr.getMainLayer();

        //if (gui && gui instanceof  LobbyScene) eventController.eventLobbyButtonUpdate(gui);
        this.showNotifyEvent(this.buttonLobby);
        //
        //if(gui && gui instanceof LuckyCardScene)
        //{
        //    if (this.isEndEvent()) {
        //        gui.onBack();
        //        setTimeout(function(){
        //            sceneMgr.openGUI(LuckyCardNotifyEndEventGUI.className);  //hien thi GUI thong bao ket thuc EventMgr
        //        }, 500);
        //    }
        //    else
        //        gui.updateEventInfo();
        //}
        //else if (gui && gui instanceof LobbyScene)
        //{
        //    if (this.isEndEvent()) {
        //        sceneMgr.openGUI(LuckyCardNotifyEndEventGUI.className);  //hien thi GUI thong bao ket thuc EventMgr
        //    }
        //}
    },

    notifyLuckyCardAction: function (cmd) {
        this.notifyEvent = cmd.notify;
        if (this.buttonLobby && this.buttonLobby.notify) {
            cc.log("show notify button lobby");
            this.buttonLobby.notify.setVisible(this.notifyEvent);
        }

        //cmd = {};
        //cmd.gifts = [{"id":1001,"num":116,"isStored":true},{"id":1002,"num":27,"isStored":true},{"id":1003,"num":8,"isStored":true},{"id":1000001,"num":5,"isStored":true},{"id":1000002,"num":1,"isStored":true},{"id":1000003,"num":1,"isStored":true},{"id":1000004,"num":2,"isStored":true},{"id":1000005,"num":12,"isStored":true}];
        if (cmd.gifts.length > 0) {
            if (this.isFinishDownload) {
                if (popUpManager.canShow(PopUpManager.RECEIVE_IN_GIFT)) {
                    var gui = sceneMgr.openGUI(LuckyCardOpenResultGUI.className, PopUpManager.RECEIVE_IN_GIFT, PopUpManager.RECEIVE_IN_GIFT);
                    if (gui) gui.openAutoGift(cmd);
                }
            }
        }
    },

    updateEventInfo: function (cmd) {
        sceneMgr.clearLoading();

        this.keyCoin = cmd.keyCoin;
        this.curLevelExp = cmd.currentLevelExp;
        this.nextLevelExp = cmd.nextLevelExp;
        this.curLevel = cmd.curLevel;
        this.gifts = [];
        for (var i = 0, size = this.giftIds.length; i < size; i++) {
            var id = this.giftIds[i];
            if (this.isItemStored(id)) {
                var obj = cmd.list[id];

                var item = {};
                item.id = id;
                item.item = obj ? obj.item : [];
                item.gift = obj ? obj.gift : 0;
                item.numChange = [0, 0, 0, 0];
                this.gifts.push(item);
            }
        }

        cc.log("LIST GIFT " + JSON.stringify(this.gifts));


        /*if (this.initGift) {
         for (var i = 0; i < this.gifts.length; i++) {
         var totalGift = this.gifts[i].item + this.gifts[i].gift * 4;
         this.gifts[i].newItem = 0;
         if (totalGift > this.prevGifts[i]) {
         this.gifts[i].newItem = totalGift - this.prevGifts[i];
         }
         }
         this.saveTotalGifts();
         }
         else { this.initGift = true; this.saveTotalGifts();}*/

        //cc.log("self Gift", JSON.stringify(this.gifts));

        //this.gifts.sort(function(a,b){return (a.id - b.id)});
        this.sortGifts(true);

        // update luckyCard scene
        if (this.luckyCardScene) {
            cc.log("getGiftSuccess" + this.getGiftSuccess);
            if (this.getGiftSuccess) {
                this.getGiftSuccess = false;
                this.luckyCardScene.updateEventInfo();
                this.luckyCardScene.updateUserInfo();
            }
        }
        this.showNotifyEvent(this.buttonLobby);
    },

    /*saveTotalGifts: function(){
     this.prevGifts = [];
     for(var i=0; i<this.gifts.length; i++){
     var totalGift = this.gifts[i].item + this.gifts[i].gift * 4;
     //cc.log("total gift", this.gifts[i].id, this.gifts[i].item, this.gifts[i].gift, totalGift);
     this.prevGifts.push(totalGift);
     }
     },*/



    sortGifts: function (inc) {
        if (inc) {
            this.gifts.sort(function (a, b) {
                if (a.gift === b.gift) {
                    if (a.item.length === b.item.length) {
                        // return LuckyCard.checkIncrease(a.id, b.id);
                        return a.gift - b.gift;
                    }
                    else return (a.item.length - b.item.length);
                } else {
                    return a.gift - b.gift;
                }
            });
        } else {
            this.gifts.sort(function (a, b) {
                if (a.gift === b.gift) {
                    if (a.item.length === b.item.length) {
                        // return LuckyCard.checkDecrease(a.id, b.id)
                        return b.gift - a.gift;
                    } else return (b.item.length - a.item.length);
                } else {
                    return b.gift - a.gift;
                }
            });
        }
        cc.log("SORTING GIFT: " + JSON.stringify(this.gifts));
    },

    initAccumulate: function (parent) {
        if (this.isFinishDownload) {
            var accumulateGUI = new LuckyCardAccumulateGUI();
            parent.addChild(accumulateGUI);
            this.accumulateGUI = accumulateGUI;
            return accumulateGUI;
        }
    },

    setAccumulateSetAllShow: function () {
        if (this.accumulateGUI) this.accumulateGUI.setAllShow(this.isInEvent());
    },

    onAccumulate: function (cmd, isAllShow) {
        if (!this.isFinishDownload) {
            return;
        }
        if (!luckyCard.isInEvent() || (!cmd && this.nextLevelExp == 1 && isAllShow)) return;
        var gui = sceneMgr.openGUI(LuckyCardAccumulateGUI.className, LuckyCard.GUI_ACCUMULATE, LuckyCard.GUI_ACCUMULATE, false);
        if (CommonLogic.checkInBoard()) {
            //cc.log("SHOW 2");
            isAllShow = true;
        } else {
        }
        if (gui || true) {
            gui.showAccumulate(cmd);
            gui.setAllShow(isAllShow);
        }
    },

    onRollResult: function (cmd) {
        if (this.luckyCardScene) {
            this.luckyCardScene.onRollResult(cmd);
        }
    },

    onChangeAward: function (cmd) {
        if (cmd.type == 1) {
            var gui = sceneMgr.getGUI(LuckyCard.GUI_OPEN_GIFT);
            if (cmd.result == 1) {
                if (gui && gui instanceof LuckyCardOpenGiftGUI) {
                    this.getGiftSuccess = true;
                    gui.onGiftSuccess();
                }
            } else {
                sceneMgr.showOKDialog(LocalizedString.to("LUCKYCARD_CHANGE_AWARD_FAIL"));
                if (gui && gui instanceof LuckyCardOpenGiftGUI) {
                    gui.onClose();
                }
                VipManager.getInstance().setWaiting(false);
            }

        } else {
            var gui2 = sceneMgr.getGUI(LuckyCard.GUI_OPEN_GIFT);
            if (gui2 && gui2 instanceof LuckyCardOpenGiftGUI) {
                gui2.onClose();
            }

            var gui = sceneMgr.getGUI(LuckyCard.GUI_INFORMATION);
            if (gui && gui instanceof LuckyCardRegisterInformationGUI) {
                gui.onClose();
            }

            if (cmd.result == 1) {
                this.getGiftSuccess = true;
                sceneMgr.showOKDialog(LocalizedString.to("LUCKYCARD_REGISTER_SUCCESS"));
                luckyCard.isRegisterSuccess = true;
            } else {
                sceneMgr.showOKDialog(LocalizedString.to("LUCKYCARD_REGISTER_FAIL"));
            }
        }
    },

    onUserAwardSuccess: function (cmd) {
        if (!this.isFinishDownload) {
            return;
        }
        var str = LocalizedString.to("LUCKYCARD_BROADCAST_USER_AWARD");
        str = StringUtility.replaceAll(str, "@name", cmd.userName);
        str = StringUtility.replaceAll(str, "@gift", luckyCard.getItemName(cmd.giftId));

        var num = 1;
        if (luckyCard.isItemOutGame(cmd.giftId)) num = 3;
        for (var i = 0; i < num; i++)
            LuckyCardScene.onMessageBroadcast(str);
    },

    getEventBonusTicket: function (type, value) {
        var pItem = 0;
        if (type == ItemIapCell.TYPE_GOLD_SMS) pItem = 0;
        else if (type == ItemIapCell.TYPE_GOLD_G) pItem = 1;
        else if (type == ItemIapCell.TYPE_GOLD_IAP) pItem = 2;
        var obj = this.shopEventBonus[pItem];
        if (obj) {
            var key = value + "";
            if (key in obj) {
                return obj[key];
            }
        }
        return 0;
    },

    getImageButtonEvent: function () {
        return "res/EventMgr/LuckyCard/WishStar/btn_sms.png";
    },

    getLogoShopEvent: function (stage) {
        return stage ? "res/EventMgr/LuckyCard/WishStar/shopTicket.png" : "res/EventMgr/LuckyCard/WishStar/shopTicket_disable.png";
    },

    getIconBonusPayment: function () {
        return "res/EventMgr/LuckyCard/WishStar/ticket_shop0.png";
    },

    getBonusCostEvent: function () {
        if (this.isInEvent() && this.showX2G)
            return 100;
        else return 0;
    },

    getShopEvent: function () {
        var smsEvent = this.shopEventBonus[3];
        var src = [];
        var nameItem = " " + LocalizedString.to("LUCKYCARD_EVENT_NAME_ITEM");
        var textInfo = LocalizedString.to("LUCKYCARD_EVENT_SMS_BONUS_HAMMER");
        var idx = 0;
        for (var s in smsEvent) {
            if (parseInt(smsEvent[s]) <= 0) continue;

            var obj = {};
            obj.img = "res/EventMgr/LuckyCard/WishStar/ticket_shop" + (idx++) + ".png";
            obj.goldOld = smsEvent[s] + nameItem;
            if (this.showX2G) obj.goldNew = Math.floor(smsEvent[s] * (1 + this.getBonusCostEvent() / 100)) + nameItem;
            else obj.goldNew = obj.goldOld;
            obj.goldColor = cc.color(240, 210, 40, 0);
            obj.bonus = textInfo;
            obj.cost = s;
            obj.star = 0;
            obj.bonusValue = "";
            obj.smsType = 1;
            src.push(obj);

            //cc.log("SHOP EVENT", JSON.stringify(obj));
        }
        return src;
    },

    requestShopEventConfig: function () {
        cc.log("requeset shop event ");
        setTimeout(function () {
            var cmd = new CmdSendLuckyCard();
            GameClient.getInstance().sendPacket(cmd);

            cmd = new CmdSendRequestEventShop();
            GameClient.getInstance().sendPacket(cmd);
        }, 1000);
    },

    checkSendNewDay: function () {
        var timeLeft = this.getTimeLeft();
        //cc.log("TIME LEFT " + timeLeft);
        if (this.sendCheckNewDay == false && this.saveDay >= 0 && timeLeft <= 0) {
            this.requestShopEventConfig();
            this.sendCheckNewDay = true;
            this.saveDay = -1;
        }
        // if (timeLeft < 0) return 0;
        var day = parseInt(timeLeft / 86400);
        if (this.sendCheckNewDay == false && this.saveDay >= 0 && this.saveDay != day) {
            this.requestShopEventConfig();
            this.sendCheckNewDay = true;
            this.saveDay = -1;
        }
        this.saveDay = day;
    },

    updateEventLoop: function (dt) {
        if (this.eventTime <= 0)
            return;
        this.checkSendNewDay();
        if (this.isEndEvent()) return;
        var stime = this.getTimeLeftString();
        var nTime = this.getTimeLeft();
        if (nTime <= 0) {
            if (this.eventTime >= LuckyCard.WEEK_END) {
                //this.buttonLobby.time.setString(LocalizedString.to("LUCKYCARD_EVENT_TIMEOUT"));
                this.eventTime = LuckyCard.WEEK_END + 1;
                this.buttonLobby.setVisible(false);
                cc.log("VO DAY NE");

            } else {
                //if (this.eventTime > 0) {
                //    this.timeEventEnd = 7 * 24 * 60 * 60 - 1 + new Date().getTime() / 1000;
                //    this.eventTime++;
                //}
            }

        } else {
            if (this.isFinishDownload) {
                this.buttonLobby.time.setString(stime);
            }
            else {
                this.buttonLobby.time.setString(LocalizedString.to("LOADING_EVENT"));
            }
        }

    },

    // LISTENER
    onReceive: function (cmd, data) {
        //if(!EventMgr.ENABLE_LUCKY_CARD) return;
        //if(gamedata.checkInReview()) return;

        cc.log("LuckyCard::onReceive", cmd);
        switch (cmd) {
            case LuckyCard.CMD_EVENT_NOTIFY: {
                var rEventNotify = new CmdReceiveLuckyCardNotify(data);
                rEventNotify.clean();

                cc.log("CMD_EVENT_NOTIFY: " + JSON.stringify(rEventNotify));

                luckyCard.onEvent(rEventNotify);

                if (this.isInEvent()) {
                    cc.log("send request luckycard open");
                    var cmd = new CmdSendLuckyCardOpen();
                    GameClient.getInstance().sendPacket(cmd);
                    cmd.clean();
                }

                break;
            }

            case LuckyCard.CMD_NOTIFY_ACTION: {
                var rActionNotify = new CmdReceiveLuckyCardActionNotify(data);
                rActionNotify.clean();

                cc.log("CMD_NOTIFY_ACTION: " + JSON.stringify(rActionNotify));

                luckyCard.notifyLuckyCardAction(rActionNotify);
                break;
            }

            case LuckyCard.CMD_OPEN_EVENT: {
                var rEventInfo = new CmdReceiveLuckyCardInfo(data);
                rEventInfo.clean();
                cc.log("CMD_OPEN_EVENT: " + JSON.stringify(rEventInfo));
                luckyCard.updateEventInfo(rEventInfo);
                break;
            }

            case LuckyCard.CMD_ACCUMULATE_INFO: {
                var rAccInfo = new CmdReceiveLuckyCardAccumulateInfo(data);
                rAccInfo.clean();

                cc.log("CMD_ACCUMULATE_INFO: " + JSON.stringify(rAccInfo));

                luckyCard.onAccumulate(rAccInfo);
                break;
            }

            case LuckyCard.CMD_ROLL_EVENT: {
                var rRollEvent = new CmdReceiveLuckyCardRoll(data);
                rRollEvent.clean();

                cc.log("CMD_ROLL_EVENT: " + JSON.stringify(rRollEvent));

                luckyCard.onRollResult(rRollEvent);
                break;
            }

            case LuckyCard.CMD_CHANGE_AWARD: {
                var rAward = new CmdReceiveLuckyCardChangeAward(data);
                rAward.clean();

                cc.log("CMD_CHANGE_AWARD: " + JSON.stringify(rAward));

                luckyCard.onChangeAward(rAward);

                if (rAward.type == 1 && rAward.result == 1) {
                    var eventScene = sceneMgr.getRunningScene().getMainLayer();
                    if (eventScene instanceof LuckyCardScene) {
                        eventScene.updateEventInfo();
                    }
                }
                break;
            }

            case LuckyCard.CMD_USER_CHANGE_AWARD_SUCCESS: {
                var rUserAward = new CmdReceiveLuckyCardUserChangeAward(data);
                rUserAward.clean();

                cc.log("CMD_USER_CHANGE_AWARD_SUCCESS: " + JSON.stringify(rUserAward));

                luckyCard.onUserAwardSuccess(rUserAward);
                break;
            }

            case LuckyCard.CMD_KEYCOIN_BONUS: {
                var rCoinBonus = new CmdReceiveLuckyCardKeyCoinBonus(data);
                rCoinBonus.clean();

                cc.log("CMD_KEY_CON_BONUS : " + JSON.stringify(rCoinBonus));

                // Mua tu Offer, khong xu li
                if (rCoinBonus.type == 14)
                    return;
                if (rCoinBonus.type == 1)
                    var str = LocalizedString.to("LUCKYCARD_KEYCOIN_BONUS");
                else
                    var str = LocalizedString.to("LUCKYCARD_KEYCOIN_BUY");

                str = StringUtility.replaceAll(str, "@coin", StringUtility.standartNumber(rCoinBonus.keyCoin));
                cc.log("receive keycoin", str);
                if (rCoinBonus.type == 14)
                    return;
                if (rCoinBonus.keyCoin > 0) {
                    var dlg = sceneMgr.openGUI(Dialog.className + "_LuckyCard", Dialog.ZODER, Dialog.TAG, false);
                    dlg.setOKNotify(str);
                    //if (rCoinBonus.type == 1) {
                    //    // var level = gamedata.userData.levelScore;
                    //    // if (level >= 2) {
                    //    //     var gui = sceneMgr.getMainLayer();
                    //    //     if (gui && gui instanceof LobbyScene) {
                    //    //         sceneMgr.openScene(LuckyCardScene.className);
                    //    //     }
                    //    // }
                    //    // sceneMgr.openGUI(LuckyCardNotifyBonusCoin.className, LuckyCard.GUI_NOTIFY_BONUS_COIN, LuckyCard.GUI_NOTIFY_BONUS_COIN, true);
                    //    //var dlg = sceneMgr.openGUI(Dialog.className + "_LuckyCard", Dialog.ZODER, Dialog.TAG, false);
                    //    //dlg.setOKNotify(str);
                    //
                    //    this.firstCoinBonus = true;
                    //} else {
                    //    this.sendMetricBuyCoin(); //metric log mua coin success
                    //    var dlg = sceneMgr.openGUI(Dialog.className + "_LuckyCard", Dialog.ZODER, Dialog.TAG, false);
                    //    dlg.setOKNotify(str);
                    //}
                }
                break;
            }

            case LuckyCard.CMD_CHEAT_G_SERVER: {
                var rGServer = new CmdReceiveLuckyCardGServer(data);
                rGServer.clean();

                cc.log("CMD_CHEAT_G_SERVER : " + JSON.stringify(rGServer));

                if (this.luckyCardScene) {
                    this.luckyCardScene.updateGSystem(rGServer);
                }
                break;
            }

            case LuckyCard.CMD_EVENT_SHOP_BONUS: {
                var rEventShop = new CmdReceiveLuckyCardShopBonus(data);
                rEventShop.clean();

                cc.log("CMD_EVENT_SHOP_BONUS : " + JSON.stringify(rEventShop));
                event.onEventShopBonusNew(rEventShop, Event.LUCKY_CARD);
                this.sendCheckNewDay = false;
                this.saveDay = -1;
                break;
            }

            case LuckyCard.CMD_CHEAT_ERROR: {
                var rEventCheatError = new CmdReceiveLuckyCardCheatError(data);
                rEventCheatError.clean();
                cc.log("CMD_EVENT_CHEAT_ERROR: " + JSON.stringify(rEventCheatError));
                sceneMgr.showOKDialog(rEventCheatError.textString);
                break;
            }

            case LuckyCard.CMD_EVENT_HISTORY: {
                var pk = new CmdReceiveLuckyCardHistory(data);
                pk.clean();
                luckyCard.updateHistory(pk);
                break;
            }
        }
    }
});

LuckyCard.checkIncrease = function (id1, id2) {
    if (LuckyCard.isSpecialGift(id1) && LuckyCard.isSpecialGift(id2))
        return (id1 - id2);
    else if (LuckyCard.isSpecialGift(id1))
        return -1;
    else if (LuckyCard.isSpecialGift(id2))
        return 1;
    else
        return (id1 - id2);
}

LuckyCard.checkDecrease = function (id1, id2) {

    if (LuckyCard.isSpecialGift(id1) && LuckyCard.isSpecialGift(id2))
        return (id2 - id1);
    else if (LuckyCard.isSpecialGift(id1))
        return 1;
    else if (LuckyCard.isSpecialGift(id2))
        return -1;
    else
        return (id2 - id1);
}

LuckyCard.isSpecialGift = function (id1) {
    if (id1 == 1010 || id1 == 1009)
        return true;
    return false;

}

var LuckyCardSound = function () {
};

LuckyCardSound.playLobby = function () {
    if (gamedata.sound) {
        cc.log("play music event");
        audioEngine.stopAllEffects();
        audioEngine.stopMusic();
        audioEngine.playMusic(rLuckySound.bg, true);
    }
};

LuckyCardSound.closeLobby = function () {
    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
};

LuckyCardSound.playGift = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rLuckySound.gift, false);
    }
};

LuckyCardSound.playCard = function () {
    // if(gamedata.sound){
    //     audioEngine.playEffect(rLuckySound.card,false);
    // }
};

LuckyCardSound.playRollOneStar = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rLuckySound.roll1Star, false);
    }
};
LuckyCardSound.playRollTenStar = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rLuckySound.roll10Star, false);
    }
};

LuckyCardSound.playOneToss = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rLuckySound.oneToss, false);
    }
};

LuckyCardSound.playTenToss = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rLuckySound.tentoss, false);
    }
};

LuckyCardSound.playLightWell = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rLuckySound.lightwell, false);
    }
};

LuckyCardSound.playStarFall = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rLuckySound.starfall, false);
    }
};

LuckyCardSound.playPumpkinExplode = function () {
    // if (gamedata.sound) {
    //     audioEngine.playEffect(rLuckySound.pumpkinExplode, false);
    // }
};

LuckyCardSound.playPumpkinDrop = function () {
    // if (gamedata.sound) {
    //     audioEngine.playEffect(rLuckySound.pumpkinDrop, false);
    // }
};

LuckyCardSound.batFly = function () {
    // if (gamedata.sound) {
    //     audioEngine.playEffect(rLuckySound.bat, false);
    // }
};

LuckyCardSound.playCoin = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rLuckySound.coin, false);
    }
};

LuckyCardSound.playMoreBat = function () {
    // if (gamedata.sound) {
    //     audioEngine.playEffect(rLuckySound.batSwarm, false);
    // }
};

LuckyCardSound.playGift = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rLuckySound.simpleGift, false);
    }
};

LuckyCardSound.playSpecialGift = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rLuckySound.specialGift, false);
    }
};



LuckyCardSound.preloadAllSound = function () {
    // audioEngine.preloadEffect(rLuckySound.bg);
    // audioEngine.preloadEffect(rLuckySound.gift);
    // audioEngine.preloadEffect(rLuckySound.card);
    // audioEngine.preloadEffect(rLuckySound.oneToss);
    // audioEngine.preloadEffect(rLuckySound.coin);
    // audioEngine.preloadEffect(rLuckySound.bat);
    // audioEngine.preloadEffect(rLuckySound.batSwarm);
    // audioEngine.preloadEffect(rLuckySound.simpleGift);;
    // audioEngine.preloadEffect(rLuckySound.specialGift);

    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
};

var rLuckySound = {
    bg: "res/EventMgr/LuckyCard/WishStarRes/sound/wishingStar.mp3",
    roll1Star: "res/EventMgr/LuckyCard/WishStarRes/sound/1_star.mp3",
    roll10Star: "res/EventMgr/LuckyCard/WishStarRes/sound/10_stars.mp3",
    oneToss: "res/EventMgr/LuckyCard/WishStarRes/sound/coin_toss.mp3",
    tentoss: "res/EventMgr/LuckyCard/WishStarRes/sound/10_coin_toss.mp3",
    coin: "res/EventMgr/LuckyCard/WishStarRes/sound/coin_get.mp3",
    simpleGift: "res/EventMgr/LuckyCard/WishStarRes/sound/gift.mp3",
    specialGift: "res/EventMgr/LuckyCard/WishStarRes/sound/gifteffect.mp3",
    starfall: "res/EventMgr/LuckyCard/WishStarRes/sound/star_fall.mp3",
    lightwell: "res/EventMgr/LuckyCard/WishStarRes/sound/light_from_wells.mp3"
};

LuckyCard._instance = null;
LuckyCard.hasInit = false;
LuckyCard.getInstance = function () {
    if (!LuckyCard.hasInit) {
        LuckyCard._instance = new LuckyCard();
        LuckyCard.hasInit = true;
    }
    luckyCard = LuckyCard._instance;
    return LuckyCard._instance;
};
var luckyCard = LuckyCard.getInstance();

LuckyCard.CMD_EVENT_NOTIFY = 15901;
LuckyCard.CMD_NOTIFY_ACTION = 15902;
LuckyCard.CMD_OPEN_EVENT = 15903;
LuckyCard.CMD_ACCUMULATE_INFO = 15904;
LuckyCard.CMD_ROLL_EVENT = 15906;
LuckyCard.CMD_CHANGE_AWARD = 15907;
LuckyCard.CMD_USER_CHANGE_AWARD_SUCCESS = 15908;
LuckyCard.CMD_KEYCOIN_BONUS = 15909;
LuckyCard.CMD_CHEAT_ITEM = 15913;
LuckyCard.CMD_CHEAT_COIN_FREE_DAY = 15913;
LuckyCard.CMD_CHEAT_COIN_ACCUMULATE = 15914;
LuckyCard.CMD_CHEAT_G_SERVER = 15915;
LuckyCard.CMD_CHEAT_RESET_DATA = 15916;
LuckyCard.CMD_CHEAT_ERROR = 15917;
LuckyCard.CMD_CHEAT_REGISTER = 15918;
LuckyCard.CMD_EVENT_SHOP_BONUS = 15905;
LuckyCard.CMD_EVENT_HISTORY = 15910;
LuckyCard.CMD_EVENT_METRIC_LOG = 15922;
LuckyCard.CMD_EVENT_METRIC_BUY_SUCCESS = 15923; //mua coin event thanh cong
LuckyCard.CMD_EVENT_METRIC_OPEN_SHOP_X2 = 15924; //openGUI shop - 1 truong kieu int

LuckyCard.GUI_ACCUMULATE = 200;
LuckyCard.GUI_GIFT_RESULT = 201;
LuckyCard.GUI_OPEN_GIFT = 202;
LuckyCard.GUI_HELP = 203;
LuckyCard.GUI_COLLECTION = 204;
LuckyCard.GUI_NOTIFY = 204;
LuckyCard.GUI_INFORMATION = 205;
LuckyCard.GUI_NAP_G_NOTIFY = 206;
LuckyCard.GUI_HISTORY = 207;
LuckyCard.GUI_ALERT = 208;
LuckyCard.GUI_NOTIFY_BONUS_COIN = 209;

LuckyCard.ITEM_STORED = 999;
LuckyCard.ITEM_OUT_GAME = 999999;

LuckyCard.MAX_ITEM_CONVERT_GIFT = 4;

LuckyCard.ROLL_ONCE = 1;
LuckyCard.ROLL_XTREME = 2;
LuckyCard.ROLL_NORMAL_XTREME = 3;
LuckyCard.ROLL_NORMAL_ONCE = 0;

LuckyCard.WEEK_1 = 1;
LuckyCard.WEEK_2 = 1;
LuckyCard.WEEK_3 = 2;

LuckyCard.WEEK_END = 1;

LuckyCard.URL_POLICY = "http://zingplay.com/privacy/";
LuckyCard.URL_TOP = "http://pmweb.play.zing.vn/mobileservice/trungthuongV2_th.php";
LuckyCard.EVENT_NAME = "halloween";