/**
 * Created by Hunter on 7/26/2016.
 */

var audioEngine = cc.audioEngine;

var EggBreaker = cc.Class.extend({

    ctor: function () {
        // config
        this.eventTime = 0; // event 0 : off event || 1-4 :: week of event || 5 :: over event , wait off event
        this.giftNames = {}; // key : id of item - value : name of item
        this.giftPrices = {};
        this.giftValues = {}; // key : id of item - value : value of item
        this.giftIds = [];
        this.giftItemImages = {}; // key : id of item - value : image path of item
        this.costRoll = [];     // cost to roll in event
        this.bonusCostRoll = [];  // bonus cost
        this.bonusGold = 0; // bonus change gold in event
        this.timeEventEnd = 0;
        this.notifyEvent = false;
        this.eventWeeks = [];
        this.eventDayFrom = "";
        this.eventDayTo = "";
        this.eventLinkNews = "";

        // data
        this.keyCoin = 0;
        this.curLevelExp = 1;
        this.nextLevelExp = 1;
        this.curLevel = 0;
        this.gifts = []; // Object : {id:id of item,item: num item collect,gift : num gift you have }

        this.isRegisterSuccess = false;

        // auto gift daily and next week
        this.arAutoGifts = [];
        this.currentAutoGift = 0;

        // scene
        this.eggBreakerScene = null;
        this.buttonLobby = null;
        this.showx2_daily = true;

        this.registerData = null;
    },

    createCmdNotifyEvent: function () {
        var cmd = {};
        cmd.eventTime = 1;
        cmd.giftIds = [1010, 1020, 1030, 1000010, 1000020, 1000030, 1000040, 1000050, 1000060];
        cmd.giftNames = ["Gold", "Gold","Gold","Gold","Gold","Gold","Gold","Gold","Gold"];

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

        //for(var i = 0, size = this.giftIds.length ; i < size ; i++) {
        //    var id = this.giftIds[i];
        //    if(this.isItemStored(id)) {
        //        var obj = cmd.list[id];
        //
        //        var item = {};
        //        item.id = id;
        //        item.item = obj?obj.item : [0,0,0,0];
        //        item.gift = obj?obj.gift : 0;
        //        if (item.item == 0 && item.gift > 0) item.item = EggBreaker.MAX_ITEM_CONVERT_GIFT;
        //        this.gifts.push(item);
        //    }
        //}

        var cmd = {};
        cmd.keyCoin = 0;
        cmd.currentLevelExp = 10;
        cmd.nextLevelExp = 1000000;
        cmd.curLevel = 1;
        cmd.ids = [1001, 1000001];
        cmd.items = [1, 1];
        cmd.gifts = [1, 2];
        cmd.ids = [];
        cmd.items = [];
        cmd.gifts = [];
        cmd.list = [];
        for (var i = 0; i < cmd.ids.length; i++) {
            var item = {};
            item.id = cmd.ids[i];
            item.item = cmd.items[i];
            item.gift = cmd.gifts[i];
            cmd.list.push(item);
        }
        cmd.notify = 0;
        cmd.mapInfo = {};
        cmd.mapInfo.row = 2;
        cmd.mapInfo.col = 2;
        cmd.mapInfo.data = [];
        for (var i = 0; i < EggBreakerScene.MAX_ROW; i++) {
            for (var j = 0; j < EggBreakerScene.MAX_COL; j++) {
                cmd.mapInfo.data[i * EggBreakerScene.MAX_COL + j] = 10;
            }
        }
        return cmd;
    },

    preloadResource : function () {
        // preload
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Lobby/Event/eggBreaker/EggBreakerButton/skeleton.xml","EggBreakerButton");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Lobby/Event/eggBreaker/EggBreakerButton/texture.plist", "EggBreakerButton");

        var musicOn = cc.sys.localStorage.getItem("eventEggBreakerMusic");
        cc.log("eventEggBreakerMusic" + EggBreakerSound.musicOn);
        if (!musicOn || musicOn == undefined) {
            EggBreakerSound.musicOn = true;
        }
        else {
            EggBreakerSound.musicOn = musicOn == 1;
        }
        if (!this.isFinishDownload)
            return;
        LocalizedString.add("res/Event/EggBreaker/EggBreakerRes/EggLocalized_vi");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/EggBreaker/EggBreakerRes/zingplaymascot/skeleton.xml","zingplaymascot");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/EggBreaker/EggBreakerRes/zingplaymascot/texture.plist", "zingplaymascot");



        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/EggBreaker/EggBreakerRes/EggBreakerBg/skeleton.xml","EggBreakerBg");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/EggBreaker/EggBreakerRes/EggBreakerBg/texture.plist", "EggBreakerBg");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/EggBreaker/EggBreakerRes/EggBreakerGold/skeleton.xml","EggBreakerGold");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/EggBreaker/EggBreakerRes/EggBreakerGold/texture.plist", "EggBreakerGold");

        cc.spriteFrameCache.addSpriteFrames("res/Event/EggBreaker/EggBreakerRes/gold.plist");

        EggBreakerSound.preloadAllSound();
    },

    resetData: function () {
        // config
        this.eventTime = 0; // event 0 : off event || 1-4 :: week of event || 5 :: over event , wait off event
        this.giftNames = {}; // key : id of item - value : name of item
        this.giftValues = {}; // key : id of item - value : value of item
        this.giftItemImages = {}; // key : id of item - value : image path of item
        this.costRoll = [1, 10, 10];     // cost to roll in event
        this.bonusCostRoll = [1, 10, 1];  // bonus cost
        this.bonusGold = 0; // bonus change gold in event
        this.timeEventEnd = 0;
        this.notifyEvent = false;
        this.eventWeeks = [];
        this.eventDayFrom = "";
        this.eventDayTo = "";

        // data
        this.keyCoin = 0;
        this.curLevelExp = 0;
        this.nextLevelExp = 4000000;
        this.curLevel = 0;
        this.gifts = []; // Object : {id:id of item,item: num item collect,gift : num gift you have }

        this.isRegisterSuccess = false;
        this.listRegister = [];

        // scene
        this.eggBreakerScene = null;
        this.buttonLobby = null;

        // auto gift daily and next week
        this.arAutoGifts = [];
        this.currentAutoGift = 0;

        this.registerData = null;
    },

    requestOnShop: function () {
        // clear config

    },

    requestShopEventConfig: function () {
        setTimeout(function () {
            var cmd = new CmdSendEggBreaker();
            GameClient.getInstance().sendPacket(cmd);

            cmd = new CmdSendRequestEventShop();
            GameClient.getInstance().sendPacket(cmd);
        }, 1000);
    },

    openEvent: function () {
        if (this.eventTime == 0) return;

        var timeLeft = this.getTimeLeft();
        if(timeLeft <= 0 && eggBreaker.checkWeek(EggBreaker.WEEK_4)) {
            eggBreaker.eventTime = EggBreaker.WEEK_4 + 1;
            sceneMgr.showOKDialog(LocalizedString.to("EGG_EVENT_TIMEOUT"));
        }

        if(eggBreaker.isInEvent())
            sceneMgr.openScene(EggBreakerScene.className);

        if(eggBreaker.isEndEvent())
            NativeBridge.openWebView(eggBreaker.eventLinkNews);
    },

    showNotifyEvent: function (btn) {
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
        //if(!this.buttonLobby.notify) {
        //    btn.removeAllChildren();
        //
        //    var sp = new cc.Sprite("res/Event/XmasUI/btn_event_button.png");
        //    btn.addChild(sp);
        //    sp.setPosition(btn.getContentSize().width / 2 + sp.getContentSize().width/3, btn.getContentSize().height / 2);
        //    btn.icon = sp;
        //    btn.icon.pos = sp.getPosition();
        //
        //    var notify = new cc.Sprite("res/Event/XmasUI/icon_notify_event.png");
        //    btn.addChild(notify);
        //    notify.setPosition(btn.icon.getPositionX() + btn.icon.getContentSize().width / 2,
        //        btn.icon.getPositionY() + btn.icon.getContentSize().height / 2 - notify.getContentSize().height/2);
        //    btn.notify = notify;
        //}

        // this.buttonLobby.notify.setVisible(this.notifyEvent);

        if (this.isInEvent()) {
            this.showEventButton();
            if (this.isFinishDownload) {
                if (event.openFromZalo) {
                    this.openEvent();
                }
                else if (this.checkNewDay()) {
                    sceneMgr.openGUI(EggBreakerEventNotifyGUI.className, EggBreaker.GUI_NOTIFY, EggBreaker.GUI_NOTIFY, false);
                }

                if (this.showX2G && this.showx2_daily) {
                    this.showX2G = false;
                    this.showx2_daily = false;
                    sceneMgr.openGUI(EggBreakerNapGNotifyGUI.className, EggBreaker.GUI_NAP_G_NOTIFY, EggBreaker.GUI_NAP_G_NOTIFY, false);
                }
            }
            event.openFromZalo = false;
        }

        if(this.isEndEvent()) {
            this.showEventButton();
        }
    },

    showNotifyShopGUI: function () {
        var notShow = cc.sys.localStorage.getItem("eggBreakerNotShowNotify");
        cc.log("showNotifyShopGUI");
        if (!notShow || notShow == undefined || parseInt(notShow) != 1) {
            cc.log("showNotifyShopGUI 1");
            if (this.checkNewDayNotifyShop()) {
                sceneMgr.openGUI(EggBreakerNotifyGUI.className, EggBreakerNotifyGUI.TAG, EggBreakerNotifyGUI.TAG, false);
                this.saveCurrentDayNotifyShop();
            }
        }
    },

    showEventButton: function () {
        if (this.buttonLobby === undefined || this.buttonLobby == null) return;

        if (this.isInEvent() || this.isEndEvent()) {
            // if (this.buttonLobby.isVisible()) {
            cc.log("VO DAY NE ****** 1");
            this.effectEventButton();
            // }
            // else {
            //     cc.log("VO DAY NE ****** 2");
            //     this.buttonLobby.setVisible(true);
            //     this.buttonLobby.setScale(0);
            //     this.buttonLobby.runAction(cc.sequence(cc.EaseBackOut(new cc.ScaleTo(0.5, 1)), cc.callFunc(this.effectEventButton.bind(this))));
            // }
            //this.buttonLobby.notify.setVisible(this.notifyEvent);
        }
        else {
            this.buttonLobby.setVisible(false);
        }
    },

    showRegisterInformation: function (gIds) {
        var gui = sceneMgr.openGUI(EggBreakerRegisterInformationGUI.className, EggBreaker.GUI_INFORMATION, EggBreaker.GUI_INFORMATION);
        if (gui) gui.updateInfor(gIds);
    },

    showAutoGift : function () {
        if(this.currentAutoGift < 0 || this.currentAutoGift >= this.arAutoGifts.length) return;

        var info = this.arAutoGifts[this.currentAutoGift];
        this.currentAutoGift += 1;
        var open = sceneMgr.openGUI(EggBreakerOpenGiftGUI.className, EggBreaker.GUI_OPEN_GIFT, EggBreaker.GUI_OPEN_GIFT);
        if (open) open.showGift(info,true);
    },

    showAutoConvertPiece : function (ar,total) {
        var open = sceneMgr.openGUI(EggBreakerPieceConvertGUI.className, EggBreaker.GUI_CONVERT_PIECE, EggBreaker.GUI_CONVERT_PIECE);
        if (open) open.showPieces(ar,total);

        var curScene = sceneMgr.getMainLayer();
        if(curScene instanceof EggBreakerScene) {
            curScene.updateUserInfo();
        }
    },

    effectEventButton: function () {
        if (!this.buttonLobby) return;
        //  if(this.buttonLobby.anim) return;
        cc.log("CHAY VAO DAY effectEventButton");
        // this.buttonLobby.anim = db.DBCCFactory.getInstance().buildArmatureNode("EggBreakerButton");
        // if (this.buttonLobby.anim) {
        //     this.buttonLobby.addChild(this.buttonLobby.anim);
        //     this.buttonLobby.anim.setPosition(this.buttonLobby.getContentSize().width / 1.5, this.buttonLobby.getContentSize().height / 1.5);
        //     this.buttonLobby.anim.getAnimation().gotoAndPlay("1", -1, -1, 0);
        //     //this.buttonLobby.anim.setScale(1.25);
        // }

        try {
            if (!this.buttonLobby) return;
            this.buttonLobby.anim.removeAllChildren();
            this.buttonLobby.button.setContentSize(300, 200);
            // this.buttonLobby.anim.eff = resourceManager.loadDragonbone("EggBreakerButton");
            // this.buttonLobby.anim.addChild(this.buttonLobby.anim.eff);
            // this.buttonLobby.anim.eff.setPosition(0, 20);
            // this.buttonLobby.anim.eff.gotoAndPlay("1", -1, -1, 0);

            this.buttonLobby.anim.eff = new CustomSkeleton("Lobby/Event/eggBreaker/Logo_Daptrung_2021", "Logo_Daptrung_2021", 1);
            this.buttonLobby.anim.addChild(this.buttonLobby.anim.eff);
            this.buttonLobby.anim.eff.setPosition(30, -30);
            this.buttonLobby.anim.eff.setAnimation(0, "animation", -1);
            this.buttonLobby.anim.eff.setScale(0.8);

            this.buttonLobby.notify.setVisible(this.notifyEvent);
            this.buttonLobby.time.setFontSize(16);
            this.buttonLobby.time.setVisible(false);
            //  this.buttonLobby.time.setString(midAutumn.getTimeLeft());
            this.buttonLobby.time.setColor(cc.color(159, 153, 201));
            // this.buttonLobby.time.enableOutline(cc.color(162, 153, 202), 0);
            this.buttonLobby.time.setPositionY(this.buttonLobby.time.getPositionY() - 15);
            this.buttonLobby.notify.setPosition(this.buttonLobby.notify.x + 0, this.buttonLobby.notify.y + 20);
        }
        catch (e) {
            cc.log("ERROR effectEventButton" + e.stack);
        }

        //var act1 = cc.sequence(cc.scaleTo(0.5, 0.95, 1), cc.delayTime(0.05), cc.scaleTo(0.2, 1.05, 1));
        //var act2 = cc.sequence(cc.scaleTo(0.2, 0.97, 1), cc.delayTime(0.02), cc.scaleTo(0.1, 1.03, 1));
        //var act3 = cc.sequence(cc.scaleTo(0.1, 0.985, 1), cc.delayTime(0.01), cc.scaleTo(0.075, 1.015, 1), cc.scaleTo(0.05, 1, 1)); //cc.callFunc(this.dropGiftEffectButton.bind(this)),
        //this.buttonLobby.runAction(cc.repeatForever(cc.sequence(act1, act2, act3, cc.delayTime(0.75))));
    },

    dropGiftEffectButton : function () {
        if(!this.buttonLobby.effectGold) {
            this.buttonLobby.effectGold = new EggBreakerGiftEffect();
            this.buttonLobby.effectGold.setPosition(this.buttonLobby.getContentSize().width/2,this.buttonLobby.getContentSize().height);
            this.buttonLobby.addChild(this.buttonLobby.effectGold);
        }
        this.buttonLobby.effectGold.addGold();
    },

    randomTime: function (min, max) {
        var random = (Math.random()) / max;
        var diff = max - min;
        var r = random * diff;
        return min + r;
    },

    showPromoTicket: function () {
        if (!this.isFinishDownload)
            return;
        if (this.checkNewDayPromoTicket()) {
            var gui = sceneMgr.openGUI(EggBreakerPromoTicketGUI.className, EggBreakerPromoTicketGUI.TAG, EggBreakerPromoTicketGUI.TAG, false);
            this.saveCurrentDayPromoTicket();
        }
        else {

        }
    },

    checkNewDayPromoTicket: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("st_current_day_promoTicket" + gamedata.userData.uID);

        return sDay != cDay;
    },

    saveCurrentDayPromoTicket: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("st_current_day_promoTicket" + gamedata.userData.uID, sDay);
    },

    addAccumulateGUI: function(){
        if (!this.isFinishDownload)
            return;
        //var gui = sceneMgr.getGUIByClassName(EggBreakerAccumulateGUI.className);
        var gui = sceneMgr.openGUI(EggBreakerAccumulateGUI.className, 200, 200);
        if (gui){
            gui.setAllShow(true);
        }
        else {
            //gui.setAllShow(true);
        }
    },

    removeAccumulateGUI: function(){
        if (!this.isFinishDownload)
            return;
        var gui = sceneMgr.getGUIByClassName(EggBreakerAccumulateGUI.className);
        if (gui){
            gui.removeFromParent(true);
        }
    },

    // utils
    checkNewDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("eggBreaker_current_day_" + gamedata.userData.uID);

        return sDay != cDay;
    },

    saveCurrentDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("eggBreaker_current_day_" + gamedata.userData.uID, sDay);
    },

    checkNewDayNapG: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("eggBreaker_current_day_napg" + gamedata.userData.uID);

        return sDay != cDay;
    },

    saveCurrentDayNapG: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("eggBreaker_current_day_napg" + gamedata.userData.uID, sDay);
    },

    checkNewDayNotifyShop: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("eggBreaker_current_day_notify_shop" + gamedata.userData.uID);

        return sDay != cDay;
    },

    saveCurrentDayNotifyShop: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("eggBreaker_current_day_notify_shop" + gamedata.userData.uID, sDay);
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
            cc.log( "total " + total + "REGISTERED " + JSON.stringify(this.registerData.registeredGiftIds) +  " flkdj " + JSON.stringify(this.giftPrices));
            for (var i = 0; i < this.registerData.registeredGiftIds.length; i++) {
                total = total + this.giftPrices[this.registerData.registeredGiftIds[i]];
            }
        }
        cc.log("TOTAL " + total);
        return total;
    },

    getPieceImage : function (id) {
        if(this.isItemStored(id))
            return "res/Event/EggBreaker/EggBreakerUI/e" + id + ".png";
        return "res/Event/EggBreaker/EggBreakerUI/icon_gold.png";
    },

    getItemName: function (id) {
        id = this.convertIdNormal(id);
        if (id in this.giftNames) {
            return this.giftNames[id];
        }
        return id;
    },

    getItemNameSub: function (id) {
        var name = this.getItemName(id);
        var arName = name.split(" ");
        if(name.indexOf("Sony") > -1) {
            while(arName.length > 4) {
                arName.pop();
            }
        }
        return arName.join(" ");
    },

    getItemNameShort : function (id) {
        var name = this.getItemName(id);
        var arName = name.split(" ");
        if(name.indexOf("Samsung") > -1) {
            arName.shift();
        }
        while(arName.length > 3) {
            arName.pop();
        }
        //if(arName.length > 3) {
        //    arName.pop();
        //}
        return arName.join(" ");
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
        if(this.isItemStored(id))
            return "res/Event/EggBreaker/EggBreakerUI/en" + id + ".png";
        return "res/Event/EggBreaker/EggBreakerUI/en10.png";
    },

    getTicketTexture: function () {
        return "res/Event/EggBreaker/EggBreakerUI/hammer.png";
    },

    resetEventButton: function () {
        this.buttonLobby = null;
    },

    getOfferTicketImage: function () {
        return "res/Event/EggBreaker/EggBreakerUI/offerTicket.png";
    },

    getOfferTicketString: function () {
        return "Búa";
    },

    getTextInShop: function () {
        return  LocalizedString.to("EGG_EVENT_SMS_BONUS_HAMMER");
    },

    getImgInShop: function (idx) {
        return  "res/Event/EggBreaker/EggBreakerUI/shop_hammer_" + idx + ".png";
    },

    // getGiftImageOpen: function (id) {
    //     //id = this.convertIdNormal(id);
    //   //  if(this.isItemStored(id))
    //     return "res/Event/EggBreaker/EggBreakerUI/enLarge" + id + ".png";
    //   //  return "res/Event/EggBreaker/EggBreakerUI/en10.png"
    // },

    getEggImage : function (id) {
        id = this.convertIdNormal(id);
        if(this.isItemStored(id))
            return "res/Event/EggBreaker/EggBreakerUI/en" + id + ".png";
        return "res/Event/EggBreaker/EggBreakerUI/i10.png"
    },

    getGiftBackgroundImage: function (id) {
        id = this.convertIdNormal(id);
        if(this.isItemStored(id))
            return "res/Event/EggBreaker/EggBreakerUI/eb" + id + ".png";
        return "res/Event/EggBreaker/EggBreakerUI/eb10.png";
    },

    convertIdNormal : function (id) {
        if(this.isItemStored(id) && id%10 != 0) {
            id = Math.floor(id/10) * 10;
        }
        return id;
    },

    getExpString: function () {
        return StringUtility.pointNumber(this.curLevelExp) + "/" + StringUtility.pointNumber(this.nextLevelExp);
    },

    getExpPercent: function () {
        cc.log("GET EXP jl " + this.curLevelExp + " " + this.nextLevelExp);
        if (this.nextLevelExp <= 0) this.nextLevelExp = 1;
        return parseFloat(this.curLevelExp * 100 / this.nextLevelExp);
    },

    getTimeLeft: function () {
        var timeNow = Math.floor(Date.now() / 1000);
        return (this.timeEventEnd - timeNow);
    },

    getTimeLeftString: function () {
        var timeLeft = this.getTimeLeft();
        if (timeLeft <= 0) return 0;
        var day = parseInt(timeLeft / 86400);
        timeLeft -= day * 86400;
        var hour = parseInt(timeLeft / 3600);
        timeLeft -= hour * 3600;
        var minute = parseInt(timeLeft / 60);
        timeLeft -= minute * 60;

        var str = "";
        if (day > 0) {
            str = LocalizedString.to("EGG_TIME_LEFT_FORMAT_DAY");
            str = StringUtility.replaceAll(str, "@day", day);
        }
        else {
            //str = LocalizedString.to("EGG_TIME_LEFT_FORMAT_HOURS");
            //str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
            //if (hour <= 0) {
            //    str = str.substr(str.indexOf("@minute"), str.length);
            //}
            //else {
            //    str = str.substr(str.indexOf("@minute"), str.length);
            //}

            if(hour > 0) {
                str = LocalizedString.to("EGG_TIME_LEFT_FORMAT_HOURS");
            }
            else if(minute > 0) {
                str = LocalizedString.to("EGG_TIME_LEFT_FORMAT_MINUTES");
            }
            else {
                str = LocalizedString.to("EGG_TIME_LEFT_FORMAT_SECONDS");
            }

            str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
            str = StringUtility.replaceAll(str, "@minute", (minute < 10) ? "0" + minute : minute);
            str = StringUtility.replaceAll(str, "@second", (timeLeft < 10) ? "0" + timeLeft : timeLeft);
        }
        return str;

        //if (timeLeft > 0) {
        //    var str = LocalizedString.to("EGG_TIME_LEFT_FORMAT_FULL");
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
        if (type < 0 || type >= this.costRoll.length) return 0;
        return this.costRoll[type];
    },

    getBonusCostRoll: function (type) {
        if (type < 0 || type >= this.bonusCostRoll.length) return 0;
        return this.bonusCostRoll[type];
    },

    getBonusDiscount: function() {
        cc.log("lfjds************************************** " + JSON.stringify(this.costRoll));
        var price1 = this.costRoll[1] * 10;
        var price2 = this.costRoll[2];
        return Math.floor((price1 - price2) / price1 * 100);
    },

    isItemOutGame: function (id) {
        return (id > EggBreaker.ITEM_OUT_GAME);
    },

    isItemStored: function (id) {
        return (id > EggBreaker.ITEM_STORED);
    },

    checkWeek: function (week) {
        return (this.eventTime == week);
    },

    isInEvent: function () {
        return !!(this.eventTime >= EggBreaker.WEEK_1 && this.eventTime <= EggBreaker.WEEK_4);
    },

    isEndEvent : function () {
        return this.eventTime == (EggBreaker.WEEK_4 + 1);
    },

    // FUNCTION
    onEvent: function (cmd) {
        this.eventTime = cmd.eventTime;

        this.giftIds = cmd.giftIds;
        for (var i = 0; i < cmd.giftIds.length; i++) {
            this.giftNames[cmd.giftIds[i] + ""] = cmd.giftNames[i];
            this.giftValues[cmd.giftIds[i] + ""] = cmd.giftValues[i];
            this.giftPrices[cmd.giftIds[i] + ""] = cmd.giftPrices[i];
            //this.giftItemImages[cmd.giftIds[i] + ""] = this.getItemImage(cmd.giftIds[i]);
        }

        //cmd.giftIds = [1010, 1020, 1030, 1000010, 1000020, 1000030, 1000040, 1000050, 1000060];
        //this.giftPrices = {"1010": 0, "1020": 0,"1030": 0,"1000010": 100000,"1000020": 200000,"1000030": 0,"1000040": 0,"1000050": 0,"1000060": 0};

        this.timeEventEnd = Math.floor((Date.now() + cmd.timeLeft) / 1000);

        //this.costRoll = cmd.costs;
        //this.bonusCostRoll = cmd.bonus;

        this.isRegisterSuccess = cmd.isRegisterSuccess;
        this.eventWeeks = cmd.eventWeeks;
        this.eventDayFrom = cmd.eventDayFrom;
        this.eventDayTo = cmd.eventDayTo;
        this.showX2G = cmd.showX2G;
        this.eventLinkNews = cmd.urlNews;
        EggBreakerScene.doLoop();

        this.showEventButton();

        var gui = sceneMgr.getMainLayer();
        if (gui && gui instanceof EggBreakerScene) {
            gui.updateEventInfo();
        }

        var cmd = new CmdSendEggBreakerOpen();
        cmd.putData(0);
        GameClient.getInstance().sendPacket(cmd);

        var currentScene = sceneMgr.getMainLayer();
        if (currentScene instanceof LobbyScene){
            this.showNotifyEvent(this.buttonLobby);
        }

        if (CheckLogic.checkInBoard() && this.isInEvent()){
            this.addAccumulateGUI();
        }
    },

    notifyEggBreakerAction: function (cmd) {
        this.notifyEvent = cmd.notify;
        //if (this.buttonLobby) {
        //    this.buttonLobby.notify.setVisible(this.notifyEvent);
        //}
        cc.log("WHAT THE FUCK ");
        if (cmd.gifts.length > 0) {
            this.arAutoGifts = cmd.gifts;
            this.currentAutoGift = 0;
            if (!this.isFinishDownload)
                return;
            this.showAutoGift();
        }

        if(cmd.pieces.length > 0) {
            if (!this.isFinishDownload)
                return;
            eggBreaker.showAutoConvertPiece(cmd.pieces,cmd.totalGold);
        }
    },

    updateEventInfo: function (cmd) {
        sceneMgr.clearLoading();

        this.keyCoin = cmd.keyCoin;
        this.curLevelExp = cmd.currentLevelExp;
        this.nextLevelExp = cmd.nextLevelExp;
        this.curLevel = cmd.curLevel;

        // init gifts
        this.gifts = [];
        for(var i = 0, size = this.giftIds.length ; i < size ; i++) {
            var id = this.giftIds[i];
            if(this.isItemStored(id)) {
                var obj = cmd.list[id];

                var item = {};
                item.id = id;
                item.item = obj?obj.item : [0,0,0,0];
                item.gift = obj?obj.gift : 0;
                if (item.item == 0 && item.gift > 0) item.item = EggBreaker.MAX_ITEM_CONVERT_GIFT;
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
                for(var i = 0; i < a.item.length ; i++) {
                    aItem += parseInt(a.item[i]);
                }
                var bItem = 0;
                for(var i = 0; i < b.item.length ; i++) {
                    bItem += parseInt(b.item[i]);
                }
                return (aItem - bItem);
            }
            else {
                return (a.gift - b.gift);
            }
        });

        // update eggBreaker scene
        if (this.eggBreakerScene) {
            this.eggBreakerScene.updateEventInfo();
        }

        var gui = sceneMgr.getMainLayer();
        if (gui && gui instanceof ShopIapScene) {
            gui.updateEventInfo();
        }
    },

    updateEventLoop: function () {
        if (this.eventTime <= 0)
            return;
        var timeLeft = this.getTimeLeft();
        if (this.sendCheckNewDay == false && this.saveDay >= 0 && timeLeft < 0) {
            this.requestShopEventConfig();
            this.sendCheckNewDay = true;
            this.saveDay = -1;
            this.eventTime = this.eventTime + 1;
        }
        if (timeLeft < 0) return 0;
        var day = parseInt(timeLeft / 86400);
        if (this.sendCheckNewDay == false && this.saveDay >= 0 && this.saveDay != day) {
            this.requestShopEventConfig();
            this.sendCheckNewDay = true;
            this.saveDay = -1;
        }
        this.saveDay = day;
    },

    onAccumulate: function (cmd) {
        cc.log("ON ACCUMULATE ");
        if (!this.isFinishDownload)
            return;
        var gui = sceneMgr.openGUI(EggBreakerAccumulateGUI.className, EggBreaker.GUI_ACCUMULATE, EggBreaker.GUI_ACCUMULATE);
        if (gui) {
            gui.showAccumulate(cmd);
            cc.log("ON ACCUMULATE 1");
        }
    },

    onRollResult: function (cmd) {
        if (this.eggBreakerScene) {
            this.eggBreakerScene.onRollResult(cmd);
        }
    },

    onChangeAward: function (cmd) {
        this.isSendRegister = false;
        if (cmd.type == 1) {
            var gui = sceneMgr.getGUI(EggBreaker.GUI_OPEN_GIFT);
            if (cmd.result == 1) {
                if (gui && gui instanceof  EggBreakerOpenGiftGUI) {
                    gui.onGiftSuccess();
                }
            }
            else {
                sceneMgr.showOKDialog(LocalizedString.to("EGG_CHANGE_AWARD_FAIL"));

                if (gui && gui instanceof  EggBreakerOpenGiftGUI) {
                    gui.onBack();
                }
            }
        }
        else {
            //var gui2 = sceneMgr.getGUI(EggBreaker.GUI_OPEN_GIFT);
            //if (gui2 && gui2 instanceof  EggBreakerOpenGiftGUI) {
            //    gui2.onClose();
            //}

            if (cmd.result == 1) {
                //sceneMgr.showOKDialog(LocalizedString.to("EGG_REGISTER_SUCCESS"));
                var gui = sceneMgr.getGUI(EggBreaker.GUI_INFORMATION);
                if (gui && gui instanceof  EggBreakerRegisterInformationGUI) {
                    gui.onCloseDone();
                }
                if (eggBreaker.isRegisterSuccess) {
                    this.isWaitGetRegisterInfo = true;
                }
                else {
                    sceneMgr.showOKDialog(LocalizedString.to("EGG_REGISTER_SUCCESS"));
                }

                var cmdGetRegisInfo = new CmdSendEggBreakerGetRegisterInfo();
                GameClient.getInstance().sendPacket(cmdGetRegisInfo);
                cmdGetRegisInfo.clean();

                eggBreaker.isRegisterSuccess = true;



                if (eggBreaker.eggBreakerScene){
                    if (eggBreaker.eggBreakerScene.btnRegisteredInfo) eggBreaker.eggBreakerScene.btnRegisteredInfo.setVisible(true);
                }
            }
            else {
                sceneMgr.showOKDialog(LocalizedString.to("EGG_REGISTER_FAIL"));
            }
        }
    },

    onUserAwardSuccess: function (cmd) {
        var isOutGame = eggBreaker.isItemOutGame(cmd.giftId);
        var txts = [];
        txts.push({"text": LocalizedString.to("EGG_BROADCAST_USER_AWARD_0"), "color": cc.color(255, 255, 255, 0)});
        txts.push({"text": cmd.userName , "font": SceneMgr.FONT_BOLD, "color": cc.color(85, 207, 0, 0)});
        txts.push({"text": LocalizedString.to("EGG_BROADCAST_USER_AWARD_1"), "color": cc.color(255, 255, 255, 0)});
        txts.push({"text": eggBreaker.getItemName(cmd.giftId) , "font": SceneMgr.FONT_BOLD, "color": isOutGame ? cc.color(85, 207, 0, 0) : cc.color(235, 185, 14, 0)});

        broadcastMgr.addMessage(Broadcast.TYPE_EVENT,txts,isOutGame?5:1,isOutGame);
    },



    // LISTENER
    onReceive: function (cmd, data) {
        if (gamedata.checkInReview()) return;

        switch (cmd) {
            case EggBreaker.CMD_EVENT_NOTIFY:
            {
                var rEventNotify = new CmdReceiveEggBreakerNotify(data);
                rEventNotify.clean();

                cc.log("CMD_EVENT_NOTIFY: " + JSON.stringify(rEventNotify));

                eggBreaker.onEvent(rEventNotify);
                break;
            }
            case EggBreaker.CMD_NOTIFY_ACTION:
            {
                var rActionNotify = new CmdReceiveEggBreakerActionNotify(data);
                rActionNotify.clean();

                cc.log("CMD_NOTIFY_ACTION: " + JSON.stringify(rActionNotify));

                eggBreaker.notifyEggBreakerAction(rActionNotify);
                break;
            }
            case EggBreaker.CMD_OPEN_EVENT:
            {
                var rEventInfo = new CmdReceiveEggBreakerInfo(data);
                rEventInfo.clean();

                cc.log("CMD_OPEN_EVENT: " + JSON.stringify(rEventInfo));

                eggBreaker.updateEventInfo(rEventInfo);
                break;
            }
            case EggBreaker.CMD_ACCUMULATE_INFO:
            {
                var rAccInfo = new CmdReceiveEggBreakerAccumulateInfo(data);
                rAccInfo.clean();

                cc.log("CMD_ACCUMULATE_INFO: " + JSON.stringify(rAccInfo));

                eggBreaker.onAccumulate(rAccInfo);
                break;
            }
            case EggBreaker.CMD_ROLL_EVENT:
            {
                var rRollEvent = new CmdReceiveEggBreakerRoll(data);
                rRollEvent.clean();

                cc.log("CMD_ROLL_EVENT: " + JSON.stringify(rRollEvent));

                eggBreaker.onRollResult(rRollEvent);
                break;
            }
            case EggBreaker.CMD_CHANGE_AWARD:
            {
                var rAward = new CmdReceiveEggBreakerChangeAward(data);
                rAward.clean();

                cc.log("CMD_CHANGE_AWARD: " + JSON.stringify(rAward));

                eggBreaker.onChangeAward(rAward);
                break;
            }
            case EggBreaker.CMD_USER_CHANGE_AWARD_SUCCESS:
            {
                var rUserAward = new CmdReceiveEggBreakerUserChangeAward(data);
                rUserAward.clean();

                cc.log("CMD_USER_CHANGE_AWARD_SUCCESS: " + JSON.stringify(rUserAward));

                eggBreaker.onUserAwardSuccess(rUserAward);
                break;
            }
            case EggBreaker.CMD_KEYCOIN_BONUS:
            {
                var rCoinBonus = new CmdReceiveEggBreakerKeyCoinBonus(data);
                rCoinBonus.clean();

                cc.log("CMD_KEY_CON_BONUS : " + JSON.stringify(rCoinBonus));

                if(rCoinBonus.keyCoin <= 0) return;

                if (rCoinBonus.reasonGet == CmdReceiveEggBreakerKeyCoinBonus.TYPE_COIN_OFFER)
                    return;
                if (rCoinBonus.reasonGet == CmdReceiveEggBreakerKeyCoinBonus.TYPE_COIN_BUY_TICKET) {
                    //NewVipManager.getInstance().setWaiting(true);
                    var gui = sceneMgr.openGUI(GUIBuyTicket.className, GUIBuyTicket.TAG, GUIBuyTicket.TAG);
                    gui.setInfo(rCoinBonus);
                    return;
                }

                if (rCoinBonus.reasonGet == CmdReceiveEggBreakerKeyCoinBonus.TYPE_COIN_FREE ||
                    rCoinBonus.reasonGet == CmdReceiveEggBreakerKeyCoinBonus.TYPE_COIN_BUY_TICKET
                ) {
                    var str = "";
                    if (rCoinBonus.coinFree)
                        str = LocalizedString.to("EGG_KEYCOIN_BONUS");
                    else
                        str = LocalizedString.to("EGG_KEYCOIN_BUY");

                    str = StringUtility.replaceAll(str, "@coin", rCoinBonus.keyCoin);

                    var dlg = sceneMgr.openGUI(Dialog.className + "_EggBreaker", Dialog.ZODER, Dialog.TAG, false);
                    dlg.setOKNotify(str);
                }
                // } else {
                //     var gui = sceneMgr.openGUI(EggBreakerReceiveGratefulTicket.className, EggBreaker.GUI_FREE_TICKET, EggBreaker.GUI_FREE_TICKET, false);
                //     gui.setInfoGratefullTicket(rCoinBonus.keyCoin, rCoinBonus.reasonGet);
                // }


                break;
            }
            case EggBreaker.CMD_CHEAT_G_SERVER:
            {
                var rGServer = new CmdReceiveEggBreakerGServer(data);
                rGServer.clean();

                cc.log("CMD_CHEAT_G_SERVER : " + JSON.stringify(rGServer));

                if (this.eggBreakerScene) {
                    this.eggBreakerScene.updateGSystem(rGServer);
                }
                break;
            }
            case EggBreaker.CMD_EVENT_SHOP_BONUS:
            {
                var rEventShop = new CmdReceiveEggBreakerShopBonus(data);
                rEventShop.clean();
                cc.log("CMD_EVENT_SHOP_BONUS : " + JSON.stringify(rEventShop));
                this.keyCoin = rEventShop.keyCoin;
                this.sendCheckNewDay = false;
                this.saveDay = -1;
                event.onEventShopBonusNew(rEventShop, Event.EGG_BREAKER);
                break;
            }
            case EggBreaker.CMD_REGISTER_INFO:
            {
                var regisInfo = new CmdReceiveEggBreakerRegisterInfo(data);

                cc.log("EggBreaker.CMD_REGISTER_INFO: ", JSON.stringify(regisInfo));
                this.registerData = regisInfo;
                if (this.isWaitGetRegisterInfo) {
                    var gui = sceneMgr.openGUI(EggBreakerRegisterInformationGUI.className, EggBreaker.GUI_INFORMATION, EggBreaker.GUI_INFORMATION);
                    gui.showRegisInfo(false);
                }
                this.isWaitGetRegisterInfo = false;
                break;
            }
        }
    }
});

var EggBreakerSound = function () {
};

EggBreakerSound.playLobby = function () {
    if (EggBreakerSound.musicOn) {
        audioEngine.stopAllEffects();
        audioEngine.stopMusic();
        audioEngine.playMusic(rEggSound.bg, true);
    }
};

EggBreakerSound.closeLobby = function () {
    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
    audioEngine.end();
};

EggBreakerSound.playGift = function () {
    if (EggBreakerSound.musicOn) {
        audioEngine.playEffect(rEggSound.gift, false);
    }
};

EggBreakerSound.playFinishBreak = function () {
    if (EggBreakerSound.musicOn) {
        audioEngine.playEffect(rEggSound.end_break, false);
    }
};

EggBreakerSound.playCoin = function () {
    if (EggBreakerSound.musicOn) {
        audioEngine.playEffect(rEggSound.coin, false);
    }
};

EggBreakerSound.playPiece = function () {
    if (EggBreakerSound.musicOn) {
        audioEngine.playEffect(rEggSound.pieces, false);
    }
};

EggBreakerSound.playSingleCoin = function () {
    if (EggBreakerSound.musicOn) {
        var rnd = parseInt(Math.random()*10)%3 + 1;
        audioEngine.playEffect(rEggSound["coin_" + rnd], false);
    }
};

EggBreakerSound.doBreak = function () {
    if (EggBreakerSound.musicOn) {
        var rnd = parseInt(Math.random()*10)%2==0;
        if(rnd) audioEngine.playEffect(rEggSound.break1, false);
        else audioEngine.playEffect(rEggSound.break2, false);
    }
};

EggBreakerSound.preloadAllSound = function (){
    for(var s in rEggSound) {
        audioEngine.preloadEffect(rEggSound[s]);
    }

    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
};

rEggSound = {
    bg : "res/Event/EggBreaker/EggBreakerRes/music_minigame.mp3",
    break1 : "res/Event/EggBreaker/EggBreakerRes/daptrung_01.mp3",
    break2 : "res/Event/EggBreaker/EggBreakerRes/daptrung_02.mp3",
    gift : "res/Event/EggBreaker/EggBreakerRes/gifteffect.mp3",
    end_break : "res/Event/EggBreaker/EggBreakerRes/finish_daptrung.mp3",
    coin : "res/Event/EggBreaker/EggBreakerRes/coinFall.mp3",
    coin_1 : "res/Event/EggBreaker/EggBreakerRes/coin_01.mp3",
    coin_2 : "res/Event/EggBreaker/EggBreakerRes/coin_02.mp3",
    coin_3 : "res/Event/EggBreaker/EggBreakerRes/coin_03.mp3",
    pieces : "res/Event/EggBreaker/EggBreakerRes/pieces.mp3"
};

EggBreaker._instance = null;
EggBreaker.getInstance = function () {
    if (!EggBreaker._instance) {
        EggBreaker._instance = new EggBreaker();
    }
    return EggBreaker._instance;
};
var eggBreaker = EggBreaker.getInstance();

EggBreaker.CMD_EVENT_NOTIFY = 15001;
EggBreaker.CMD_NOTIFY_ACTION = 15002;
EggBreaker.CMD_OPEN_EVENT = 15003;
EggBreaker.CMD_ACCUMULATE_INFO = 15004;
EggBreaker.CMD_EVENT_SHOP_BONUS = 15005;
EggBreaker.CMD_ROLL_EVENT = 15006;
EggBreaker.CMD_CHANGE_AWARD = 15007;
EggBreaker.CMD_USER_CHANGE_AWARD_SUCCESS = 15008;
EggBreaker.CMD_KEYCOIN_BONUS = 15009;
EggBreaker.CMD_CHEAT_ITEM = 15012;
EggBreaker.CMD_CHEAT_COIN_FREE_DAY = 15013;
EggBreaker.CMD_CHEAT_COIN_ACCUMULATE = 15013;
EggBreaker.CMD_CHEAT_G_SERVER = 15014;
EggBreaker.CMD_CHEAT_BREAK_DIRECT = 15016;
EggBreaker.CMD_CHEAT_RESET = 15015;
EggBreaker.CMD_REGISTER_INFO = 15011;

EggBreaker.GUI_ACCUMULATE = 200;
EggBreaker.GUI_GIFT_RESULT = 201;
EggBreaker.GUI_OPEN_GIFT = 202;
EggBreaker.GUI_HELP = 203;
EggBreaker.GUI_COLLECTION = 204;
EggBreaker.GUI_NOTIFY = 204;
EggBreaker.GUI_INFORMATION = 205;
EggBreaker.GUI_NAP_G_NOTIFY = 206;
EggBreaker.GUI_CONVERT_PIECE = 207;
EggBreaker.GUI_HAMMER_DIALOG = 208;
EggBreaker.GUI_FREE_TICKET = 209;

EggBreaker.ITEM_STORED = 999;
EggBreaker.ITEM_OUT_GAME = 999999;

EggBreaker.MAX_ITEM_CONVERT_GIFT = 3;

EggBreaker.NUM_PIECE = 4;

EggBreaker.ROLL_ONCE = 0;
EggBreaker.ROLL_XTREME = 1;
//EggBreaker.ROLL_NORMAL_XTREME = 3;
//EggBreaker.ROLL_NORMAL_ONCE = 0;

EggBreaker.WEEK_1 = 1;
EggBreaker.WEEK_2 = 2;
EggBreaker.WEEK_3 = 3;
EggBreaker.WEEK_4 = 4;