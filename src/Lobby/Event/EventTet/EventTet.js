/**
 * Created by cuongcan_pro on 12/21/2017.
 */

var EventTetSound = function () {
};

EventTetSound.playLobby = function () {
    if (EventTetSound.musicOn) {
        audioEngine.stopAllEffects();
        audioEngine.stopMusic();
        audioEngine.playMusic(rEventTetSound.bg, true);
    }
};

EventTetSound.playFinishBreak = function () {
    if (EventTetSound.musicOn) {
        audioEngine.playEffect(rEventTetSound.end_break, false);
    }
};

EventTetSound.playFirework = function () {
    if (EventTetSound.musicOn) {
        audioEngine.playEffect(rEventTetSound.firework, false);
    }
};

EventTetSound.playCoinIn = function () {
    if (EventTetSound.musicOn) {
        audioEngine.playEffect(rEventTetSound.coinIn, false);
    }
};

EventTetSound.playGift = function () {
    if (EventTetSound.musicOn) {
        audioEngine.playEffect(rEventTetSound.gift, false);
    }
};

EventTetSound.playCoin = function () {

};

EventTetSound.playPiece = function () {

};

EventTetSound.playSingleCoin = function () {
    if (EventTetSound.musicOn) {
        var rnd = parseInt(Math.random()*10)%3 + 1;
        audioEngine.playEffect(rEventTetSound["coin_" + rnd], false);
    }
};

EventTetSound.stopLobby = function () {
    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
};

EventTetSound.preloadAllSound = function () {
    for (var s in rEventTetSound) {
        audioEngine.preloadEffect(rEventTetSound[s]);
    }

    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
};

EventTetSound.playCoinFall = function () {
    if (EventTetSound.musicOn) {
        audioEngine.playEffect(rEventTetSound.coinFall, false);
    }
};

EventTetSound.playFoxSay = function (index) {
    // if (EventTetSound.musicOn) {
    audioEngine.playEffect(rEventTetSound.foxSay + index + ".mp3", false);
    // }
};

EventTetSound.playOneTouch = function () {
    if (EventTetSound.musicOn) {
        audioEngine.playEffect(rEventTetSound.oneTouch, false);
    }
};

EventTetSound.playTenTouch = function () {
    if (EventTetSound.musicOn) {
        audioEngine.playEffect(rEventTetSound.tenTouch, false);
    }
};

EventTetSound.playBaoLixi = function () {
    //if (EventTetSound.musicOn) {
    audioEngine.playEffect(rEventTetSound.baolixi, false);
    // }
};

EventTetSound.playClickFox = function () {
    // if (EventTetSound.musicOn) {
    audioEngine.playEffect(rEventTetSound.clickFox, false);
    // }
};

EventTetSound.playStep = function () {
    // if (EventTetSound.musicOn) {
    audioEngine.playEffect(rEventTetSound.step, false);
    //}
};

rEventTetSound = {
    bg: "res/res/Event/EventTet/EventTetRes/music.mp3",
    coinFall: "res/res/Event/EventTet/EventTetRes/coinFall.mp3",
    coin_1 : "res/Event/EventTet/EventTetRes/coin_01.mp3",
    coin_2 : "res/Event/EventTet/EventTetRes/coin_02.mp3",
    coin_3 : "res/Event/EventTet/EventTetRes/coin_03.mp3",
    end_break : "res/Event/EventTet/EventTetRes/finish_daptrung.mp3",
    gift : "res/Event/EventTet/EventTetRes/gifteffect.mp3",
    coinIn : "res/Event/EventTet/EventTetRes/coinIn.mp3",
    firework : "res/Event/EventTet/EventTetRes/firework.mp3",
    foxSay : "res/Event/EventTet/EventTetRes/fox_say_hello_",
    oneTouch : "res/Event/EventTet/EventTetRes/1Touch.mp3",
    tenTouch : "res/Event/EventTet/EventTetRes/10Touch.mp3",
    baolixi : "res/Event/EventTet/EventTetRes/baolixi.mp3",
    clickFox : "res/Event/EventTet/EventTetRes/clickonFox.mp3",
    step : "res/Event/EventTet/EventTetRes/step.mp3"
};


var EventTet = cc.Class.extend({

    ctor: function () {
        // cc.log( "CONFIG EVENT " + Config.ENABLE_EVENT_TET);
        this.eventTime = 0; // event 0 : off event || 1-4 :: week of event || 5 :: over event , wait off event
        this.giftNames = {}; // key : id of item - value : name of item
        this.giftValues = {}; // key : id of item - value : value of item
        this.giftPrices = {};
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
        this.arrayPrice = [2, 2, 2, 6];

        // data
        this.keyCoin = 0;
        this.arrayNumText = [];
        this.curLevelExp = 1;
        this.nextLevelExp = 1;
        this.curLevel = 0;
        this.arrayLixi = []; // Object : {id:id of item,item: num item collect,gift : num gift you have }
        this.historyTopRank = [];
        this.historyMyRank = [];
        this.numToken = 0;
        this.myRank = -1;

        this.isRegisterSuccess = false;

        // auto gift daily and next week
        this.arAutoGifts = [];
        this.currentAutoGift = 0;

        // scene
        this.EventTetScene = null;
        this.buttonLobby = null;
        this.showx2_daily = true;

        this.arrayOpen = [];
        this.arrayOpen[0] = [];
        this.currentLixi = 0;
        for (var i = 0; i < 24; i++) {
            this.arrayOpen[0].push(false);
        }

        this.arrayIdGift = [];
        this.arrayIdGift[1] = 1;
        this.arrayIdGift[2] = 2;
        this.arrayIdGift[3] = 3;
        for (var i = 4; i < 11; i++) {
            this.arrayIdGift[i] = 4;
        }
        for (var i = 11; i < 21; i++) {
            this.arrayIdGift[i] = 5;
        }
        this.resetData();
    },

    preloadResource: function () {
        var musicOn = cc.sys.localStorage.getItem("eventTetMusic");
        if (!musicOn || musicOn == undefined) {
            EventTetSound.musicOn = true;
        }
        else {
            EventTetSound.musicOn = musicOn == 1;
        }
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Lobby/Event/eventTet/iconEvent/skeleton.xml", "iconEvent");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Lobby/Event/eventTet/iconEvent/texture.plist", "iconEvent");

        if (!this.isFinishDownload)
            return;

        LocalizedString.add("res/Event/EventTet/EventTetRes/Localized_vi");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/EventTet/EventTetRes/Cayvang/skeleton.xml", "Cayvang");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/EventTet/EventTetRes/Cayvang/texture.plist", "Cayvang");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/EventTet/EventTetRes/CoinTet/skeleton.xml", "CoinTet");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/EventTet/EventTetRes/CoinTet/texture.plist", "CoinTet");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/EventTet/EventTetRes/Molixi/skeleton.xml", "Molixi");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/EventTet/EventTetRes/Molixi/texture.plist", "Molixi");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/EventTet/EventTetRes/phaohoa1/skeleton.xml", "phaohoa1");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/EventTet/EventTetRes/phaohoa1/texture.plist", "phaohoa1");

        //for (var i = 0; i < 3; i++) {
        //db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/EventTet/EventTetRes/phaohoa" + (i + 1) + "/skeleton.xml", "phaohoa" + (i + 1));
        //db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/EventTet/EventTetRes/phaohoa" + (i + 1) + "/texture.plist", "phaohoa" + (i + 1));
        //}

        //
        //db.DBCCFactory.getInstance().loadDragonBonesData("Event/XmasRes/XmasLeaf/skeleton.xml", "XmasLeaf");
        //db.DBCCFactory.getInstance().loadTextureAtlas("Event/XmasRes/XmasLeaf/texture.plist", "XmasLeaf");
        //
        //db.DBCCFactory.getInstance().loadDragonBonesData("Event/XmasRes/XmasHeart/skeleton.xml", "XmasHeart");
        //db.DBCCFactory.getInstance().loadTextureAtlas("Event/XmasRes/XmasHeart/texture.plist", "XmasHeart");
        //
        //for(var i = 1; i <= 8 ; i++) {
        //    db.DBCCFactory.getInstance().loadDragonBonesData("Event/XmasRes/Deer" + i + "/skeleton.xml", "Deer" + i);
        //    db.DBCCFactory.getInstance().loadTextureAtlas("Event/XmasRes/Deer" + i + "/texture.plist", "Deer" + i);
        //}
    },

    resetData: function() {

        // config
        this.eventTime = 0; // event 0 : off event || 1-4 :: week of event || 5 :: over event , wait off event
        this.giftNames = {}; // key : id of item - value : name of item
        this.giftValues = {}; // key : id of item - value : value of item
        this.giftItemImages = {}; // key : id of item - value : image path of item
        this.costRoll = [];     // cost to roll in event
        this.bonusCostRoll = [];  // bonus cost
        this.bonusGold = 0; // bonus change gold in event
        this.timeEventEnd = 0;
        this.notifyEvent = false;
        this.eventWeeks = [];
        this.eventDayFrom = "";
        this.eventDayTo = "";
        this.registerData = {};
        this.registerData.fullName = "";
        this.registerData.address = "";
        this.registerData.identity = "";
        this.registerData.phone = "";
        this.registerData.email = "";
        this.registerData.registeredGiftIds = [];
        gamedata.shopEventBonus = [];

        // data
        this.keyCoin = 0;
        this.arrayNumText = [0, 0, 0, 0];
        this.curLevelExp = 0;
        this.nextLevelExp = 1;
        this.curLevel = 0;
        this.gifts = []; // Object : {id:id of item,item: num item collect,gift : num gift you have }

        this.isRegisterSuccess = false;
        this.arAutoGifts = [];
        this.currentDay = -1; // ngay lookback

        this.historyTopRank = [];
        this.historyMyRank = [];
        this.numToken = 0;
        this.myRank = -1;

        //for (var i = 0; i < 10; i++) {
        //    this.giftNames["" + i] = "gift" + i;
        //    if (i < 10)
        //        this.giftValues["" + i] = 1;
        //    else
        //        this.giftValues["" + i] = Math.random() * 1000000;
        //
        //}
        //
        //var numGift = 6;
        //for (var i = 0; i < numGift; i++) {
        //    var obj = {"id" : EventTet.RANK_GIFT_1 + i, "num": Math.floor(Math.random() * 10)};
        //    this.arrayLixi.push(obj);
        //    cc.log("ARRAY LIS XI 12 " + JSON.stringify(this.arrayLixi));
        //}
        //cc.log("ARRAY LIS XI 1" + JSON.stringify(this.arrayLixi));
        //
        //for (var i = 0; i < numGift - 1; i++) {
        //    for (var j = i + 1; j < numGift; j++) {
        //        if (this.arrayLixi[i].num > this.arrayLixi[j].num) {
        //            var temp = this.arrayLixi[i];
        //            this.arrayLixi[i] = this.arrayLixi[j];
        //            this.arrayLixi[j] = temp;
        //        }
        //    }
        //}
        //cc.log("ARRAY LIS XI " + JSON.stringify(this.arrayLixi));

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
        cmd.giftPrices = [1, 10, 100];
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
        cmd.keyCoin = 5000;
        cmd.arrayNumText = [50, 200, 300, 500];
        cmd.currentLevelExp = 10;
        cmd.nextLevelExp = 1000000;
        cmd.curLevel = 1;
        cmd.lixi = [];
        for (var i = 0; i < 3; i++) {
            cmd.lixi[i] = Math.floor(Math.random() * 10);
        }
        return cmd;
    },

    createCmdTop: function () {
        var cmd = {};
        cmd.week = 1;
        cmd.remainedTime = 43432;
        cmd.topRanks = [];
        cmd.topUserIds = [];
        cmd.topNames = [];
        cmd.topAvatars = [];
        cmd.topTokens = [];
        cmd.topAward = [];
        for (var i = 0; i < 20; i++) {
            cmd.topRanks[i] = i + 1;
            cmd.topUserIds[i] = Math.floor(Math.random() * 10000);
            cmd.topNames[i] = "user" + i;
            cmd.topAvatars[i] = "";
            cmd.topTokens[i] = 1000 - i;
            cmd.topAward[i] = 10000 + i;
        }
        return cmd;
    },

    createCmdMyRank: function () {
        var cmd = {};
        cmd.week = 1;
        cmd.myRank = 4;
        cmd.numToken = 1000;
    },

    openEvent: function () {
        if (this.eventTime == 0) return;

        if (this.isInEvent()) {
            this.sendOpenEvent();

            return;
        }
        if (this.isEndEvent()) {
            cc.log("LINK NEW " + this.eventLinkNews);
            NativeBridge.openWebView(this.eventLinkNews);
        }
    },

    sendOpenEvent: function () {
        var cmd = new CmdSendEventTetOpen();
        cmd.putData(1);
        GameClient.getInstance().sendPacket(cmd);
        this.isWaitOpenEvent = true;
        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeoutWithFunction(5, this.callbackTimeout, this);
        this.sendGetMyRank(this.eventTime);
         // eventTet.updateEventInfo(this.createCmdInfo());
        // EventTetSound.playLobby();
        //  var gui = sceneMgr.openScene(EventTetScene.className);
    },

    sendVibrateTree: function() {
        var cmd = new CmdSendEventTetVibrate();
        GameClient.getInstance().sendPacket(cmd);
        cmd.clean();
    },

    sendGetInfoRegister: function() {
        var cmd = new CmdSendEventTetGetInfoRegister();
        GameClient.getInstance().sendPacket(cmd);
        cmd.clean();
    },

    sendGetGiftRegister: function() {
        var cmd = new CmdSendEventTetGetGiftRegister();
        GameClient.getInstance().sendPacket(cmd);
        cmd.clean();
    },

    sendGetFreeText: function() {
        cc.log("GET FREE TEXT ");
        var cmd = new CmdSendEventTetGetFreeText();
        GameClient.getInstance().sendPacket(cmd);
        cmd.clean();
    },

    sendOpenLixi: function(position) {
        cc.log("POSITION " + position);
        var cmd = new CmdSendEventTetOpenLixi();
        cmd.putData(this.indexLixi, position);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendGetMap: function(index) {
        cc.log("INDEX " + index);
        var cmd = new CmdSendEventTetGetMap();
        cmd.putData(index);
        GameClient.getInstance().sendPacket(cmd);
        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(5);
        this.indexLixi = index;
    },

    sendCheatText: function(specialText, exp, data) {
        cc.log("CHEAT TEXT " + JSON.stringify(data));
        var cmd = new CmdSendEventTetCheatText();
        cmd.putData(specialText, exp, data);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendCheatLixi: function(id, num) {
        var cmd = new CmdSendEventTetCheatLixi();
        cmd.putData(id, num);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendVibrate: function (type) {
        cc.log("VIBRATE " + type);
        var cmd = new CmdSendEventTetVibrate();
        cmd.putData(type);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendGetFreeCombo: function () {
        var cmd = new CmdSendEventTetFreeCombo();
        GameClient.getInstance().sendPacket(cmd);
    },

    sendCheatG: function (numGServer, numGUser) {
        cc.log("CHEAT G " + numGServer);
        var cmd = new CmdSendEventTetCheatG();
        cmd.putData(numGServer, numGUser);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendCheatExp: function (numG) {
        cc.log("CHEAT Exp " + numG);
        var cmd = new CmdSendEventTetCheatExp();
        cmd.putData(numG);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendCheatToken: function (userId, arrToken) {
        cc.log("CHEAT TOKEN " + JSON.stringify(arrToken));
        var cmd = new CmdSendEventTetCheatToken();
        cmd.putData(userId, arrToken);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendReset: function () {
        cc.log("RESET SERVER ");
        var cmd = new CmdSendEventTetReset();
        GameClient.getInstance().sendPacket(cmd);
    },

    sendReceiveLookBack: function () {
        cc.log("Receive LookBaack ");
        var cmd = new CmdSendEventTetGetLookBack();
        GameClient.getInstance().sendPacket(cmd);
    },

    sendGetLookBackIno: function () {
        cc.log("GET LOOKBACK");
        var cmd = new CmdSendEventTetLookBack();
        GameClient.getInstance().sendPacket(cmd);
    },

    sendGetMyRank: function (week) {
        cc.log("GET MY RANK " + week);
        var cmd = new CmdSendEventTetGetMyRank();
        cmd.putData(week);
        GameClient.getInstance().sendPacket(cmd);
    },

    sendGetTop: function (week) {
        cc.log("GET TOP INFO " + week);
        var cmd = new CmdSendEventTetGetInfoTop();
        cmd.putData(week);
        GameClient.getInstance().sendPacket(cmd);
    },

    callbackTimeout: function () {
        cc.log("CALLBACK TIME OUT " + this.getTimeLeft());
        if (this.getTimeLeft() < 0 && this.eventTime >= EventTet.WEEK4) {
            // het event
            if (this.buttonLobby)
                this.buttonLobby.setVisible(false);
            ToastFloat.makeToast(ToastFloat.SHORT, localized("EVENT_TET_TIMEOUT"));
            this.eventTime = EventTet.WEEK4 + 2; // de du lieu Event la da het Event
            gamedata.shopEventBonus = [];
        }
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

    getNumKeyToVibrate: function (num) {
        var count = 0;
        for (var i = 0; i < this.arrayNumText.length; i++) {
            if (num > this.arrayNumText[i]) {
                count = count + (num - this.arrayNumText[i]);
            }
        }
        return count;
    },

    getPrice: function (type) {
        var countMoney = 0;
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            if (eventTet.keyCoin[i] < type) {
                countMoney = countMoney + (type - eventTet.keyCoin[i]) * eventTet.arrayPrice[i];
            }
        }

        return countMoney;
    },

    getPriceDiscount: function () {
        return Math.ceil(this.getPrice(EventTet.TEN_VIBRATE) * (1- this.discountTen / 100));
    },

    getTimeLeft : function () {
        var timeNow = Math.floor(Date.now() / 1000);
        return (this.timeEventEnd - timeNow);
    },

    getTimeLeftString: function () {
        var timeLeft = this.getTimeLeft();
        if(timeLeft <= 0) return 0;

        var day = parseInt(timeLeft / 86400);
        timeLeft -= day * 86400;
        var hour = parseInt(timeLeft / 3600);
        timeLeft -= hour * 3600;
        var minute = parseInt(timeLeft / 60);
        timeLeft -= minute * 60;

        var str = "";
        if(day > 0)
        {
            str = LocalizedString.to("EVENT_TET_TIME_LEFT_FORMAT_DAY");
            str = StringUtility.replaceAll(str, "@day", day);
        }
        else
        {
            if(hour > 0) {
                str = LocalizedString.to("EVENT_TET_TIME_LEFT_FORMAT_HOURS");
            }
            else if(minute > 0) {
                str = LocalizedString.to("EVENT_TET_TIME_LEFT_FORMAT_MINUTES");
            }
            else {
                str = LocalizedString.to("EVENT_TET_TIME_LEFT_FORMAT_SECONDS");
            }

            str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
            str = StringUtility.replaceAll(str, "@minute", (minute < 10) ? "0" + minute : minute);
            str = StringUtility.replaceAll(str, "@second", (timeLeft < 10) ? "0" + timeLeft : timeLeft);
        }
        return str;
    },

    getExpString: function () {
        return StringUtility.pointNumber(this.curLevelExp) + "/" + StringUtility.pointNumber(this.nextLevelExp);
    },

    getExpPercent: function () {
        if (this.nextLevelExp <= 0) this.nextLevelExp = 1;
        return parseFloat(this.curLevelExp * 100 / this.nextLevelExp);
    },

    getSaveExpString: function () {
        return StringUtility.pointNumber(this.saveCurLevelExp) + "/" + StringUtility.pointNumber(this.saveNextLevelExp);
    },

    getSaveExpPercent: function () {
        if (this.saveNextLevelExp <= 0) this.saveNextLevelExp = 1;
        return parseFloat(this.saveCurLevelExp * 100 / this.saveNextLevelExp);
    },

    getPieceImage : function (id) {
        if (id == EventTet.GOLD_ID)
            return "res/Event/EventTet/EventTetUI/Lixi/lixi7.png";
        if(this.isItemStored(id))
            return "res/Event/EventTet/EventTetUI/Lixi/lixi" + (id - EventTet.RANK_GIFT_1) + ".png";
        if (eventTet.getItemValue(id) < 500000)
            return "res/Event/EventTet/EventTetUI/Lixi/lixi6.png";
        else
            return "res/Event/EventTet/EventTetUI/Lixi/lixi7.png";
    },

    getItemName: function (id) {
        if (id in this.giftNames) {
            return this.giftNames[id];
        }
        else {
            return StringUtility.formatNumberSymbol(id);
        }
    },

    getItemValue: function (id) {
        //id = this.convertIdNormal(id);
        if (this.isItemStored(id))
            return 1;
        if (id in this.giftValues)
            return this.giftValues[id];
        return 1;
    },

    getGiftImage: function (id, type) {
        //id = this.convertIdNormal(id);
        if (type == EventTet.TYPE_TOKEN) {
            return "res/Event/EventTet/EventTetUI/Gift/gift0.png";
        }
        else if (type == EventTet.TYPE_DIAMOND) {
            return "res/Event/EventTet/EventTetUI/Gift/gift1.png";
        }
        else if (type == EventTet.TYPE_OUT_GAME || type == EventTet.TYPE_GOLD_DIAMOND) {
            return "res/Event/EventTet/EventTetUI/GiftTop/giftTop" + id + ".png";
        }
        else {
            return "res/Event/EventTet/EventTetUI/Gift/gift" + this.getIdMoney(id) + ".png";
        }
    },

    getImageInMap: function (data) {
        if (data.isToken()) {
            return "res/Event/EventTet/EventTetUI/Lixi/lixiOpen0.png";
        }
        else if (data.isDiamond()) {
            return "res/Event/EventTet/EventTetUI/Lixi/lixiOpen1.png";
        }
        else { // gold
            return "res/Event/EventTet/EventTetUI/Lixi/lixiOpen" + this.getIdMoney(data.value) + ".png";
        }
    },

    getImageInMapWithId: function (id, type) {
        if (type == EventTet.TYPE_TOKEN) {
            return "res/Event/EventTet/EventTetUI/Lixi/lixiOpen0.png";
        }
        else if (type == EventTet.TYPE_DIAMOND) {
            return "res/Event/EventTet/EventTetUI/Lixi/lixiOpen1.png";
        }
        else {
            return "res/Event/EventTet/EventTetUI/Lixi/lixiOpen" + this.getIdMoney(id) + ".png";
        }
    },

    getIdMoney: function (id) {
        if (id < 10000000) {
            return 2;
        }
        else if (id < 100000000) {
            return 3;
        }
        else if (id < 1000000000) {
            return 4;
        }
        else {
            return 5;
        }
    },

    getLixiFromId: function(id) {
        for (var i = 0; i < this.arrayLixi.length; i++) {
            if (this.arrayLixi[i].id == id)
                return this.arrayLixi[i];
        }
    },

    convertIdNormal : function (id) {
        //if(this.isItemStored(id) && id%10 != 0) {
        //    id = Math.floor(id/10) * 10;
        //}
        return id;
    },

    isItemStored: function(id) {
        if (id >= EventTet.RANK_GIFT_1 && id < EventTet.RANK_GIFT_2) {
            cc.log("DU MA " + id);
            return true;
        }
        return false;
    },

    isItemOutGame: function(id) {
        return id < 10;
    },

    isOpenLixi: function (pos) {
        return this.mapLixi[pos] > 0;
    },

    isOpenAll: function () {
        for (var i = 0; i < this.mapLixi.length; i++) {
            if (!this.mapLixi[i].isOpen())
                return false;
        }
        return true;
    },

    checkOpenEvent: function () {
        var open = true;
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            if (this.keyCoin[i] <= 0) {
                open = false;
                break;
            }
        }
        if (open) {
            this.sendOpenEvent();
        }
    },

    // FUNCTION
    checkShowedLookBack: function () {
        var showed = cc.sys.localStorage.getItem("showedLookBack");
        cc.log("SHOW LOOK BACK " + showed);
        this.saveShowedLookBack();
        return showed;
    },

    saveShowedLookBack: function () {
        cc.sys.localStorage.setItem("showedLookBack", 1);
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

    showPromoTicket: function () {
        if (this.checkNewDayPromoTicket()) {
            var gui = sceneMgr.openGUI(EventTetPromoTicketGUI.className, EventTetPromoTicketGUI.TAG, EventTetPromoTicketGUI.TAG, false);
            this.saveCurrentDayPromoTicket();
        }
        else {

        }
    },

    onEvent: function (cmd) {

        this.eventTime = cmd.eventTime;

        this.giftIds = cmd.giftIds;
        for (var i = 0; i < cmd.giftIds.length; i++) {
            this.giftNames[cmd.giftIds[i] + ""] = cmd.giftNames[i];
            this.giftValues[cmd.giftIds[i] + ""] = cmd.giftValues[i];
            //this.giftPrices[cmd.giftIds[i] + ""] = cmd.giftPrices[i];
            //this.giftItemImages[cmd.giftIds[i] + ""] = this.getItemImage(cmd.giftIds[i]);
        }

        this.timeEventEnd = Math.floor((Date.now() + cmd.timeLeft) / 1000);
        cc.log("THOI GIAN CON LAI " + this.getTimeLeftString());

        this.isRegisterSuccess = cmd.isRegisterSuccess;
        this.eventWeeks = cmd.eventWeeks;
        this.eventDayFrom = cmd.eventDayFrom;
        this.eventDayTo = cmd.eventDayTo + "/2021";
        this.showX2G = cmd.showX2G;
        //this.showX2G = true;
        this.eventLinkNews = cmd.urlNews;
        if (this.isInEvent()) {
            var cmd1 = new CmdSendEventTetGetShop();
            GameClient.getInstance().sendPacket(cmd1);

            this.sendGetLookBackIno();
            var cmd = new CmdSendEventTetOpen();
            cmd.putData(0);
            GameClient.getInstance().sendPacket(cmd);
            this.sendGetFreeText();

        }
        // this.showEventButton();
        this.showNotifyEvent(this.buttonLobby);

        var gui = sceneMgr.getMainLayer();
        if (gui) {
            if (this.getTimeLeft() > 0)
                gui.isEventTime = true;
        }

        if (CheckLogic.checkInBoard() && this.isInEvent()){
            this.addAccumulateGUI();
        }
    },

    updateEventInfo: function (cmd) {

        sceneMgr.clearLoading();

        this.keyCoin = cmd.keyCoin;
        this.arrayNumText = cmd.arrayNumText;
        this.curLevelExp = cmd.currentLevelExp;
        this.nextLevelExp = cmd.nextLevelExp;
        this.curLevel = cmd.curLevel;

        this.arrayLixi = cmd.lixi;
        var numGift = 6;
        this.arrayLixi = [];
        for (var i = 0; i < cmd.lixi.length; i++) {
            var obj = {"id" : EventTet.RANK_GIFT_1 + i, "num": cmd.lixi[i]};
            this.arrayLixi.push(obj);
        }
        cc.log("ARRAY LIXI " + JSON.stringify(this.arrayLixi));
        this.sortLixi();
        cc.log("ARRAY LIXI **  " + JSON.stringify(this.arrayLixi));

        // update eggBreaker scene
        if (this.eventTetScene) {
            this.eventTetScene.updateEventInfo();
        }

        var mainLayer = sceneMgr.getMainLayer();
        if (mainLayer instanceof ShopIapScene) {
            mainLayer.updateEventInfo();
        }
    },

    addAccumulateGUI: function() {
        cc.log("ADD addAccumulateGUI");
        if (!this.isFinishDownload)
            return;

        //var gui = sceneMgr.getGUIByClassName(EggBreakerAccumulateGUI.className);
        var gui = sceneMgr.openGUI(EventTetAccumulateGUI.className, 200, 200);
        if (gui){
            gui.setAllShow(true);
        }
        else {
            //gui.setAllShow(true);
        }
    },

    createEventInLobby: function (lobby) {
        cc.log("*** createEventInLobby ");
        // var lobby = sceneMgr.getMainLayer();
        // if (lobby instanceof LobbyScene) {
        //     cc.log("ADD BUTTON ");
        var pRightTop = lobby.getControl("pRightTop");
        this.btnLookBack = new ccui.Button("res/Event/EventTet/EventTetUI/iconLookBack.png", "res/Event/EventTet/EventTetUI/iconLookBack.png", "res/Event/EventTet/EventTetUI/iconLookBack.png");
        this.btnLookBack.retain();
        pRightTop.addChild(this.btnLookBack);
        this.btnLookBack.setPosition(lobby.btnSupport.getPositionX() - 120, lobby.btnSupport.getPositionY());
        if (this.currentDay >= 0) {
            this.btnLookBack.setVisible(true);
            if (!this.checkShowedLookBack()) {
                sceneMgr.openGUI(EventTetLookBackGUI.className, EventTetLookBackGUI.TAG, EventTetLookBackGUI.TAG);
            }
        }
        else {
            this.btnLookBack.setVisible(false);
        }
        this.btnLookBack.addTouchEventListener(this.touchEvent, this);
        // }
    },

    touchEvent: function () {
        sceneMgr.openGUI(EventTetLookBackGUI.className, EventTetLookBackGUI.TAG, EventTetLookBackGUI.TAG);
    },

    removeAccumulateGUI: function(){
        var gui = sceneMgr.getGUIByClassName(EventTetAccumulateGUI.className);
        if (gui){
            gui.removeFromParent(true);
        }
    },

    onUserAwardSuccess: function (cmd) {
        var isOutGame = eventTet.isItemStored(cmd.giftId);
        var txts = [];
        txts.push({"text": LocalizedString.to("EVENT_TET_BROADCAST_USER_AWARD_0"), "color": cc.color(255, 255, 255, 0)});
        txts.push({"text": cmd.userName , "font": SceneMgr.FONT_BOLD, "color": cc.color(85, 207, 0, 0)});
        txts.push({"text": LocalizedString.to("EVENT_TET_BROADCAST_USER_AWARD_1"), "color": cc.color(255, 255, 255, 0)});
        txts.push({"text": eventTet.getItemName(cmd.giftId) , "font": SceneMgr.FONT_BOLD, "color": isOutGame ? cc.color(85, 207, 0, 0) : cc.color(235, 185, 14, 0)});
        cc.log("LKFJd " + JSON.stringify(txts));
        broadcastMgr.addMessage(Broadcast.TYPE_EVENT,txts,isOutGame?5:1,isOutGame);
    },

    isInEvent: function () {
        return this.eventTime >= EventTet.WEEK_START && this.eventTime <= EventTet.WEEK_END;
    },

    isEndEvent : function () {
        return this.eventTime >= (EventTet.WEEK_END + 1);
    },

    sortLixi: function () {
        for (var i = 0; i < EventTet.NUM_GIFT - 1; i++) {
            for (var j = i + 1; j < EventTet.NUM_GIFT; j++) {
                if (this.arrayLixi[i].num < this.arrayLixi[j].num || (this.arrayLixi[i].num == this.arrayLixi[j].num && this.arrayLixi[i].id < this.arrayLixi[j].id)) {
                    var temp = this.arrayLixi[i];
                    this.arrayLixi[i] = this.arrayLixi[j];
                    this.arrayLixi[j] = temp;
                }
            }
        }
    },

    exchangeLixi: function () {
        var arrayLixi = [];
        var arrayLixiRandom = [];
        for (var i = 0; i < EventTet.NUM_LIXI; i++) {
            if (!this.mapLixi[i].isOpen()) {
                arrayLixi.push(this.mapLixi[i]);
            }
        }
        while (arrayLixi.length > 0) {
            var randomValue = Math.floor(Math.random() * arrayLixi.length);
            arrayLixiRandom.push(arrayLixi[randomValue]);
            arrayLixi.splice(randomValue, 1);
        }
        var count = 0;
        for (var i = 0; i < EventTet.NUM_LIXI; i++) {
            if (!this.mapLixi[i].isOpen()) {
                this.mapLixi[i] = arrayLixiRandom[count];
                count++;
            }
        }
    },

    saveTopInfo: function(cmd){
        var weekInfo = {};
        weekInfo.week = cmd.week;
        weekInfo.topRanks = cmd.topRanks;
        weekInfo.topUserIds = cmd.topUserIds;
        weekInfo.topNames = cmd.topNames;
        weekInfo.topAvatars = cmd.topAvatars;
        weekInfo.topTokens = cmd.topTokens;
        weekInfo.topAward = cmd.topAward;
        this.historyTopRank[cmd.week] = weekInfo;

        //if (cmd.week === this.eventTime){
        this.remainedTime = cmd.remainedTime;
        var gui = sceneMgr.getGUIByClassName(EventTetRankGUI.className);
        if (gui){
            gui.updateListTop(weekInfo.week);
        }
    },

    saveMyRankInfo: function(cmd){
        if (cmd.week === this.eventTime){
            this.myRank = cmd.myRank;
            this.numToken = cmd.numToken;
        }

        // khong tim thay trong list lich su da luu, them moi
        var myRankInfo = {};
        myRankInfo.week = cmd.week;
        myRankInfo.myRank = cmd.myRank;
        myRankInfo.numToken = cmd.numToken;
        myRankInfo.giftId = cmd.giftId;
        this.historyMyRank[cmd.week] = myRankInfo;

        // update potBreaker scene
        var mainLayer = sceneMgr.getMainLayer();
        if (mainLayer instanceof EventTetScene) {
            mainLayer.updateMyRankInfo();
        }

        var gui = sceneMgr.getGUIByClassName(EventTetRankGUI.className);
        if (gui){
            gui.updateMyRank(myRankInfo.week);
        }

        var gui2 = sceneMgr.getGUIByClassName(PotBreakerOpenGiftGUI.className);
        if (gui2){
            gui2.updateMyRank();
        }
    },

    // utils
    // phan thuong dua Top la Gold + Diamond
    isGoldDiamond: function (id) {
        var convertId = id - EventTet.START_TOP_GIFT;
        if (convertId % EventTet.NUM_GIFT_TOP == 5 || convertId % EventTet.NUM_GIFT_TOP == 6) {
            return true;
        }
        return false;
    },

    checkNewDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("eventTet_current_day_" + gamedata.userData.uID);

        return sDay != cDay;
    },

    saveCurrentDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("eventTet_current_day_" + gamedata.userData.uID, sDay);
    },

    checkNewDayNapG: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("eventTet_current_day_napg" + gamedata.userData.uID);

        return sDay != cDay;
    },

    saveCurrentDayNapG: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("eventTet_current_day_napg" + gamedata.userData.uID, sDay);
    },

    showNotifyEvent: function (btn) {
        if (!btn)
            return;
        this.buttonLobby = btn;
        this.buttonLobby.retain();

        // check show notify event
        if (this.keyCoin > 0) {
            this.notifyEvent = true;
        }
        for (var i = 0; i < this.gifts.length; i++) {
            if (this.gifts[i].gift > 0) {
                this.notifyEvent = true;
            }
        }

        cc.log("SHOW NOTIFY " + this.isInEvent() + " " + this.eventTime);
        if (this.isInEvent()) {
           this.showEventButton();
            if (this.checkNewDay() && this.isFinishDownload) {
                sceneMgr.openGUI(EventTetNotifyGUI.className, EventTet.GUI_NOTIFY, EventTet.GUI_NOTIFY, false);
            }
        }

        if(this.isEndEvent()) {
            this.showEventButton();
        }
    },

    showEventButton: function () {
        if (this.buttonLobby === undefined || this.buttonLobby == null) return;
        if (this.isInEvent() || this.isEndEvent()) {
            this.effectEventButton();
        }
        else {
            this.buttonLobby.setVisible(false);
        }
    },

    effectEventButton: function () {
        if (!this.buttonLobby) return;
        this.buttonLobby.setVisible(true);
        this.buttonLobby.anim.removeAllChildren();
        this.buttonLobby.button.setContentSize(300, 300);
        this.buttonLobby.anim.eff = db.DBCCFactory.getInstance().buildArmatureNode("iconEvent");
        this.buttonLobby.anim.eff.gotoAndPlay("1", -1, -1, -1);
        this.buttonLobby.anim.addChild(this.buttonLobby.anim.eff);
        this.buttonLobby.anim.eff.setPosition(0, 5);
        this.buttonLobby.anim.eff.setScale(0.8);
        this.buttonLobby.notify.setVisible(this.notifyEvent);
        this.buttonLobby.time.setFontSize(16);
        this.buttonLobby.time.setColor(cc.color(162, 153, 202));
        // this.buttonLobby.time.enableOutline(cc.color(162, 153, 202), 0);
        this.buttonLobby.time.setPositionY(this.buttonLobby.time.getPositionY() - 15);
        this.buttonLobby.notify.setPosition(this.buttonLobby.notify.x + 0, this.buttonLobby.notify.y + 20);
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

    requestShopEventConfig: function () {
        setTimeout(function () {
            var cmd = new CmdSendEventTet();
            GameClient.getInstance().sendPacket(cmd);

            cmd = new CmdSendRequestEventShop();
            GameClient.getInstance().sendPacket(cmd);
        }, 5000);
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

    checkCanVibrate100: function () {
        var min = 10000000;
        for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
            if (eventTet.arrayNumText[i] < min) {
                min = eventTet.arrayNumText[i];
            }
        }
        cc.log(" min " + min + " " + (eventTet.keyCoin / 4));
        var num = min + eventTet.keyCoin / 4;
        if (num >= 200)
            return true;
        return false;
    },

    // Event Loop
    updateEventLoop: function () {
        if (this.eventTime <= 0)
            return;
        this.checkSendNewDay();
        if (!this.buttonLobby)
            return;
        // sceneMgr.arGuis[LobbyScene.className].btnEvent.setVisible(false);
        var stime = this.getTimeLeftString();
        var nTime = this.getTimeLeft();

        if (nTime <= 0) {
            if (this.eventTime >= EventTet.WEEK_END) {
                this.buttonLobby.time.setString(LocalizedString.to("EVENT_TET_TIMEOUT"));
                this.eventTime = EventTet.WEEK_END + 1;
            }
            else {
                if (this.eventTime > 0) {
                    this.timeEventEnd = 7 * 24 * 60 * 60 - 1 + new Date().getTime() / 1000;
                    this.eventTime++;
                }
            }

        } else {
            var s = LocalizedString.to("EVENT_TET_INFO_TIME_LEFT_0");
            // this.buttonLobby.time.setString(s + " " + stime);
            try {
                 this.buttonLobby.time.setString(eventTet.eventDayFrom + "-" + eventTet.eventDayTo);
            }
            catch (e) {

            }
           
        }
    },

    getOfferTicketImage: function (id) {
        return "res/Event/EventTet/EventTetUI/bonusTicketPaper.png";
    },

    getOfferTicketString: function () {
        return  LocalizedString.to("EVENT_TET_LABEL_SHOP");
    },

    getTextInShop: function () {
        return  LocalizedString.to("EVENT_TET_SMS_BONUS_HAMMER");
    },

    getImgInShop: function (idx) {
        return  "res/Event/EventTet/EventTetUI/shop_hammer_" + idx + ".png";
    },

    getTicketTexture: function () {
        return  "res/Event/EventTet/EventTetUI/iconKeyCoinMedium.png";
    },

    resetEventButton: function () {
        // this.buttonLobby = null;
        // this.btnLookBack = null;
    },

    getTopRankData: function(week){
        return this.historyTopRank[week];
    },

    getMyRankData: function(week){
        return this.historyMyRank[week];
    },

    getTopGiftImage: function(id, week){
        if (week < EventTet.WEEK_END) {
            return EventTet.DEFAUT_UI + "GiftTop/giftTop" + id + ".png";
        }
        else {
            var game = LocalizedString.config("GAME");
            if (game.indexOf("sam") >= 0) {
                return EventTet.DEFAUT_UI + "GiftTop/giftTopSam" +  id + ".png";
            }
            else {
                return EventTet.DEFAUT_UI + "GiftTop/giftTop" + id + ".png";
            }
        }
    },

    getGiftIdFromRank: function (rank, week) {
        // moi mot tuan co 7 Loai qua cho cac Top
        return 10011;
        return 10000 + EventTet.NUM_GIFT_TOP * (week - 1)+ rank;
    },

    getIsTop: function () {
        for (var i = EventTet.WEEK_START; i < EventTet.WEEK_END; i++) {
            var data = this.historyTopRank[i];
            if (data) {
                if (data.myRank < EventTet.NUMBER_TOP_RANK) {
                    return cc.p(data.myRank, i);
                }
            }
        }
        return cc.p(-1, -1);
    },

    getTimeRemainString: function(){
        var timeRemain = this.remainedTime;
        var totalSeconds = Math.floor(timeRemain / 1000);
        var numSeconds = totalSeconds % 60;
        var totalMinutes = Math.floor(totalSeconds / 60);
        var numMinutes = totalMinutes % 60;
        var totalHour = Math.floor(totalMinutes / 60);
        var numHours = totalHour % 24;
        var totalDay = Math.floor(totalHour / 24);

        // cc.log("updateRemainTime: " , totalDay , numHours , numMinutes , numSeconds);

        var strDays = StringUtility.replaceAll(localized("EVENT_TET_TIME_LEFT_FORMAT_DAY"), "@day", totalDay);
        var strHours = StringUtility.replaceAll(localized("EVENT_TET_TIME_LEFT_FORMAT_HOURS"), "@hour", numHours);
        var strMinutes = StringUtility.replaceAll(localized("EVENT_TET_TIME_LEFT_FORMAT_MINUTES"), "@minute", numMinutes);
        var strSeconds = StringUtility.replaceAll(localized("EVENT_TET_TIME_LEFT_FORMAT_SECONDS"), "@second", numSeconds);

        var remainTimeStr = "";
        var enoughInfoTime = false;
        if (totalDay > 0){
            remainTimeStr += strDays;

            enoughInfoTime = true;
        }

        if (numHours > 0 && !enoughInfoTime){
            remainTimeStr += strHours;

            enoughInfoTime = true;
        }

        if (numMinutes > 0 && !enoughInfoTime){
            remainTimeStr += strMinutes;

            enoughInfoTime = true;
        }

        if (!enoughInfoTime && numSeconds >= 0){
            remainTimeStr += strSeconds;
        }

        if (remainTimeStr === ""){
            remainTimeStr = localized("EVENT_TET_EVENT_TIMEOUT");
        }

        return remainTimeStr;
    },

    getEndWeek: function(startWeekDate){
        var temp = startWeekDate.split("/");
        var day = temp[0], month = temp[1];
        var today = new Date();
        var year = today.getFullYear();
        var startWeek = new Date(month + "/" + day + "/" + year);
        var weekend = new Date(startWeek.getTime() + 6*24*60*60*1000);
        var weekendMonth = weekend.getMonth() + 1;
        return weekend.getDate() + "/" + weekendMonth;
    },

    // LISTENER
    onReceive: function (cmd, data) {

        // if (gamedata.checkInReview()) return;

        switch (cmd) {
            case EventTet.CMD_EVENT_NOTIFY:
            {
                var rEventNotify = new CmdReceiveEventTetNotify(data);
                rEventNotify.clean();

                cc.log("CMD_EVENT_NOTIFY: " + JSON.stringify(rEventNotify));
                if (rEventNotify.timeLeft < 0) {
                    rEventNotify.timeLeft = 0;
                    rEventNotify.eventTime = rEventNotify.eventTime + 1;
                }
                var save = eventTet.eventTime;
                eventTet.onEvent(rEventNotify);
                if (save < eventTet.eventTime || rEventNotify.timeLeft < 0) {
                    var currentScene = sceneMgr.getRunningScene().getMainLayer();
                    if (currentScene instanceof EventTetOpenLixiGUI) {
                        sceneMgr.openScene(EventTetScene.className);
                        ToastFloat.makeToast(ToastFloat.SHORT, localized("EVENT_TET_NEXT_WEEK"));
                    }
                }
                break;
            }
            case EventTet.CMD_OPEN_EVENT:
            {
                var rEventInfo = new CmdReceiveEventTetInfo(data);
                rEventInfo.clean();

                cc.log("CMD_OPEN_EVENT: " + JSON.stringify(rEventInfo));

                eventTet.updateEventInfo(rEventInfo);
                if (this.isWaitOpenEvent) {
                    EventTetSound.playLobby();
                    var gui = sceneMgr.openScene(EventTetScene.className);
                }
                else {
                    if (eventTet.eventTetScene) {
                        var currentScene = sceneMgr.getRunningScene().getMainLayer();
                        if (currentScene instanceof EventTetScene) {
                            // eventTet.updateEventInfo(rEventInfo);
                            eventTet.eventTetScene.updateEventInfo();
                        }
                        else if (currentScene instanceof EventTetOpenLixiGUI) {
                            currentScene.updateEventInfo();
                        }
                    }
                }
                this.isWaitOpenEvent = false;
                //gui.onReceiveStartGame(event);

                break;
            }
            case EventTet.CMD_NOTIFY_ACTION:
            {
                var rEventNotify = new CmdReceiveEventTetActionNotify(data);
                rEventNotify.clean();
                cc.log("CMD_NOTIFY_ACTION : " + JSON.stringify(rEventNotify));
                var currentScene = sceneMgr.getRunningScene().getMainLayer();
                if (currentScene instanceof LobbyScene) {
                    if (rEventNotify.ids.length > 0) {
                        this.gifts = [];
                        var gui = sceneMgr.openGUI(EventTetReceiveOpenGiftGUI.className, EventTet.GUI_RECEIVE_OPEN_GIFT, EventTet.GUI_RECEIVE_OPEN_GIFT);

                        for (var i = 0; i < rEventNotify.ids.length; i++) {
                            var gift = {"gift": rEventNotify.numbers[i], "id": rEventNotify.ids[i]};
                            if (this.isGoldDiamond(rEventNotify.ids[i])) {
                                gift["type"] = EventTet.TYPE_GOLD_DIAMOND;
                            }
                            else {
                                gift["type"] = EventTet.TYPE_OUT_GAME;
                            }

                            this.gifts.push(gift);
                        }
                        gui.showGift(this.gifts[this.gifts.length - 1], true);
                    }
                }

                break;
            }
            case EventTet.CMD_ACCUMULATE_INFO:
            {
                if (!this.isFinishDownload)
                    return;
                var rAccInfo = new CmdReceiveEventTetAccumulateInfo(data);
                rAccInfo.clean();
                cc.log("CMD_ACCUMULATE_INFO: " + JSON.stringify(rAccInfo));
                if (rAccInfo.additionExp > 0) {
                    var gui = sceneMgr.getGUIByClassName(EventTetAccumulateGUI.className);
                    if (!gui || !gui.isShow)
                        gui = sceneMgr.openGUI(EventTetAccumulateGUI.className, EventTet.GUI_ACCUMULATE, EventTet.GUI_ACCUMULATE);
                    if (gui) gui.showAccumulate(rAccInfo);
                }
                else {
                    var haveKey = false;
                    for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
                        if (rAccInfo.keyCoinAdd[i] > 0) {
                            haveKey = true;
                            break;
                        }
                    }
                    // cap nhat lai thong tin
                    if (haveKey) {
                        // var gui = sceneMgr.openGUI(EventTetAccumulateGUI.className, EventTet.GUI_ACCUMULATE, EventTet.GUI_ACCUMULATE);
                        //var gui = sceneMgr.getGUIByClassName(EventTetAccumulateGUI.className);
                        if (gui) gui.updateCmd(rAccInfo);
                        eventTet.arrayNumText = rAccInfo.keyCoin;
                    }
                }

                break;
            }
            case EventTet.CMD_USER_CHANGE_AWARD_SUCCESS:
            {
                var rUserAward = new CmdReceiveEventTetUserChangeAward(data);
                rUserAward.clean();
                cc.log("CMD_USER_CHANGE_AWARD_SUCCESS: " + JSON.stringify(rUserAward));
                eventTet.onUserAwardSuccess(rUserAward);
                break;
            }
            case EventTet.CMD_KEYCOIN_BONUS:
            {
                var rCoinBonus = new CmdReceiveEventTetKeyCoinBonus(data);
                rCoinBonus.clean();

                cc.log("CMD_KEY_CON_BONUS : " + JSON.stringify(rCoinBonus));
                var str = "";
                if (rCoinBonus.keyCoin > 0) {
                    if (rCoinBonus.option == 1) { // mua Gold
                        str = LocalizedString.to("EVENT_TET_KEYCOIN_BONUS");
                        str = StringUtility.replaceAll(str, "@coin", rCoinBonus.keyCoin);
                    }
                    else if (rCoinBonus.option == 5) { // mua truc tiep
                        str = LocalizedString.to("EVENT_TET_KEYCOIN_BUY");
                        str = StringUtility.replaceAll(str, "@coin", rCoinBonus.keyCoin);
                    }
                    else if (rCoinBonus.option == 14) { // mua Offer
                        return;
                    }
                    else {
                        str = LocalizedString.to("EVENT_TET_KEYCOIN_BONUS");
                        str = StringUtility.replaceAll(str, "@coin", rCoinBonus.keyCoin);
                    }
                    // var dlg = sceneMgr.openGUI(Dialog.className + "_EventTet", Dialog.ZODER, Dialog.TAG, false);
                    // dlg.setOKNotify(str);
                    var gui = sceneMgr.openGUI(EventTetReceiveText.className, EventTet.GUI_RECEIVE_TEXT, EventTet.GUI_RECEIVE_TEXT);
                    gui.setMessage(rCoinBonus.keyCoin, -1);
                }
                else {
                    if (rCoinBonus.option == 0) // nhan chu trong ban choi
                        return;
                    var num = 0;
                    var index = 0;
                    for (i = 0; i < rCoinBonus.arrayText.length; i++) {
                        if (rCoinBonus.arrayText[i] > 0) {
                            num = rCoinBonus.arrayText[i];
                            index = i;
                            break;
                        }
                    }
                    if (num <= 0)
                        return;
                    var gui = sceneMgr.openGUI(EventTetReceiveText.className, EventTet.GUI_RECEIVE_TEXT, EventTet.GUI_RECEIVE_TEXT);
                    gui.setMessage(num, index);
                }
                break;
            }
            case EventTet.CMD_CHEAT_G:
            {
                var rGServer = new CmdReceiveEventTetCheatG(data);
                rGServer.clean();

                cc.log("CMD_CHEAT_G_SERVER : " + JSON.stringify(rGServer));

                if (this.EventTetScene) {
                    // this.EventTetScene.updateGSystem(rGServer);
                }
                break;
            }
            case EventTet.GET_SHOP_INFO:
            {
                var rEventShop = new CmdReceiveEventTetShopBonus(data);
                rEventShop.clean();
                cc.log("GET_SHOP_INFO : " + JSON.stringify(rEventShop));
                event.onEventShopBonusNew(rEventShop, Event.EVENT_TET);
                this.sendCheckNewDay = false;
                this.saveDay = -1;
                break;
            }

            case EventTet.CMD_GET_MAP:
            {
                var rEventMap = new CmdReceiveEventTetMapLixi(data);
                rEventMap.clean();
                cc.log("CMD_GET_MAP : " + JSON.stringify(rEventMap));
                eventTet.mapLixi = rEventMap.arrayData;
                eventTet.isOpenAllLixi = rEventMap.isOpenAllLixi;
                this.exchangeLixi();
                var mainLayer = sceneMgr.getMainLayer();
                if (!(mainLayer instanceof EventTetOpenLixiGUI)) {
                    var gui = sceneMgr.openScene(EventTetOpenLixiGUI.className);
                    gui.waitCloseLixi = true;
                }
                else {
                    mainLayer.resetMap();
                }

                // if (gui instanceof EventTetOpenLixiGUI)
                //     gui.setInfoMap();
                break;
            }

            case EventTet.CMD_OPEN_LIXI:
            {
                var rEventOpen = new CmdReceiveEventTetOpenLixi(data);
                rEventOpen.clean();
                cc.log("CMD_OPEN_LIXI : " + JSON.stringify(rEventOpen));
                this.mapLixi = rEventOpen.arrayData;
                this.exchangeLixi();
                var lixi = this.getLixiFromId(this.indexLixi);
                lixi.num = rEventOpen.numLixi;
                var gui = sceneMgr.getMainLayer();
                if (gui)
                    gui.onReceiveResult(rEventOpen);
                break;
            }

            case EventTet.CMD_VIBRATE_EVENT:
            {
                var rEventVibrate = new CmdReceiveEventTetVibrate(data);
                rEventVibrate.clean();
                cc.log("CMD_VIBRATE_EVENT : " + JSON.stringify(rEventVibrate));
                eventTet.eventTetScene.onReceiveVibrate(rEventVibrate)
                break;
            }
            case EventTet.CMD_SHOP_TEXT:
            {
                var rEventShopText = new CmdReceiveEventTetShopText(data);
                rEventShopText.clean();
                cc.log("rEventShopText : " + JSON.stringify(rEventShopText));
                var gui = sceneMgr.openGUI(EventTetReceiveText.className, EventTet.GUI_RECEIVE_TEXT, EventTet.GUI_RECEIVE_TEXT);
                gui.setMessage(rEventShopText.ids[0]); // 4 gia tri trong mang nay giong nhau
                for (var i = 0; i < EventTet.NUM_COLLECT; i++) {
                    eventTet.keyCoin[i] = eventTet.keyCoin[i] + rEventShopText.ids[0];
                }
                break;
            }
            case EventTet.CMD_NOTIFY_LUCKY_USER:
            {
                var gui = sceneMgr.getGUIByClassName(EventTetAccumulateGUI.className);
                if (!gui || !gui.isShow)
                    gui = sceneMgr.openGUI(EventTetAccumulateGUI.className, EventTet.GUI_ACCUMULATE, EventTet.GUI_ACCUMULATE);
                if (gui)
                    gui.showFox();
                break;
            }
            case EventTet.CMD_REGISTER:
            {
                var rAward = new CmdReceiveEventTetChangeAward(data);
                rAward.clean();

                cc.log("CMD_REGISTER: " + JSON.stringify(rAward));
                if (rAward.result == 1) {
                    if (this.isGoldDiamond(rAward.idGift)) {
                        sceneMgr.showOKDialog(LocalizedString.to("EVENT_TET_REGISTER_SUCCESS"));
                        eventTet.isRegisterSuccess = true;

                        var gui = sceneMgr.getGUI(EventTet.GUI_REGISTER);
                        if (gui && gui instanceof  EventTetRegisterInformationGUI) {
                            gui.onRegisterSuccess();
                        }
                    }
                    else {
                        var guiOpenGift = sceneMgr.getGUIByClassName(EventTetReceiveOpenGiftGUI.className);
                        if (guiOpenGift && guiOpenGift.isShow) {
                            guiOpenGift.onGiftSuccess();
                        }
                    }
                    // Event nay khong co nhan nhieu qua cung luc
                    // if (this.isAutoGift) {
                    //     this.gifts.splice(this.gifts.length - 1, 1);
                    //     if (this.gifts.length > 0) {
                    //         var gui = sceneMgr.openGUI(EventTetReceiveOpenGiftGUI.className, EventTet.GUI_RECEIVE_OPEN_GIFT, EventTet.GUI_RECEIVE_OPEN_GIFT);
                    //         gui.showGift(this.gifts[this.gifts.length - 1], true);
                    //     }
                    // }
                }
                else {
                    this.isWaitResponse = false;
                    sceneMgr.showOKDialog(LocalizedString.to("EVENT_TET_REGISTER_FAIL"));
                }
                break;
            }
            case EventTet.CMD_GET_GIFT_REGISTER: {
                var rAward = new CmdReceiveEventTetGiftRegister(data);
                rAward.clean();
                this.registerData.registeredGiftIds = rAward.giftIds;
                cc.log("CMD_GET_GIFT_REGISTER: " + JSON.stringify(rAward));
                var gui = sceneMgr.getGUIByClassName(EventTetHistoryGUI.className);
                if (gui) {
                    gui.updateInfoRegister();
                }
                break;
            }
            case EventTet.CMD_GET_INFO_REGISTER: {
                var rAward = new CmdReceiveEventTetInfoRegister(data);
                rAward.clean();
                this.registerData.fullName = rAward.fullName;
                this.registerData.phone = rAward.phone;
                this.registerData.identity = rAward.identity;
                this.registerData.address = rAward.address;
                this.registerData.email = rAward.email;
                var gui = sceneMgr.getGUIByClassName(EventTetHistoryGUI.className);
                if (gui) {
                    gui.updateInfoRegister();
                }
                cc.log("CMD_GET_INFO_REGISTER: " + JSON.stringify(rAward));
                break;
            }
            case EventTet.CMD_GET_LOOK_BACK: {
                var rAward = new CmdReceiveEventTetLookBack(data);
                rAward.clean();
                eventTet.currentDay = rAward.currentDay;
                cc.log("CMD_GET_LOOK_BACK: " + JSON.stringify(rAward));
                this.pkgLookBack = rAward;
                if (this.btnLookBack) {
                    this.btnLookBack.setVisible(true);
                    if (!this.checkShowedLookBack()) {
                        sceneMgr.openGUI(EventTetLookBackGUI.className, EventTetLookBackGUI.TAG, EventTetLookBackGUI.TAG);
                    }
                }
                var gui = sceneMgr.getGUIByClassName(EventTetLookBackGUI.className);
                if (gui) {
                    gui.setInfo(rAward);
                }
                break;
            }
            case EventTet.CMD_RECEIVE_LOOK_BACK: {
                var rAward = new CmdReceiveEventTetGetLookBack(data);
                rAward.clean();
                cc.log("CMD_RECEIVE_LOOK_BACK: " + JSON.stringify(rAward));
                var gui = sceneMgr.getGUIByClassName(EventTetLookBackGUI.className);
                if (gui) {
                    gui.onReceiveLookBack(rAward.getError());
                }
                break;
            }
            case EventTet.CMD_TOP_INFO:
            {
                var rTopInfo = new CmdReceiveEventTetTopInfo(data);
                rTopInfo.clean();
                cc.log("EventTet.CMD_TOP_INFO : " + JSON.stringify(rTopInfo));
                this.saveTopInfo(rTopInfo);
                break;
            }
            case EventTet.CMD_MY_RANK:
            {
                var rMyRank = new CmdReceiveEventTetMyRankInfo(data);
                rMyRank.clean();
                cc.log("EventTet.CMD_MY_RANK : " + JSON.stringify(rMyRank));
                this.saveMyRankInfo(rMyRank);
                break;
            }
        }
    }

})

EventTet.CMD_EVENT_NOTIFY = 15351;
EventTet.CMD_OPEN_EVENT = 15353;
EventTet.GET_SHOP_INFO = 15355;
EventTet.CMD_GET_MAP = 15361;
EventTet.CMD_OPEN_LIXI = 15362;
EventTet.CMD_KEYCOIN_BONUS = 15209;
EventTet.CMD_CHEAT_TEXT = 15365;
EventTet.CMD_CHEAT_LIXI = 15368 ;
EventTet.CMD_GET_FREE = 15360;
EventTet.CMD_VIBRATE_EVENT = 15356;
EventTet.CMD_SHOP_TEXT = 15481;
EventTet.CMD_FREE_COMBO = 15475;
EventTet.CMD_NOTIFY_LUCKY_USER = 15483;
EventTet.CMD_ACCUMULATE_INFO = 15354;
EventTet.CMD_USER_CHANGE_AWARD_SUCCESS = 15358;
EventTet.CMD_NOTIFY_ACTION = 15352;
EventTet.CMD_REGISTER = 15357;
EventTet.CMD_CHEAT_G = 15366;
EventTet.CMD_CHEAT_EXP = 15365;
EventTet.CMD_CHEAT_TOKEN = 15369;
EventTet.CMD_RESET = 15367;
EventTet.CMD_GET_INFO_REGISTER = 15367;
EventTet.CMD_GET_GIFT_REGISTER = 15368;
EventTet.CMD_GET_LOOK_BACK = 1403;
EventTet.CMD_RECEIVE_LOOK_BACK = 1404;
EventTet.CMD_TOP_INFO = 15363;
EventTet.CMD_MY_RANK = 15364;

EventTet.GUI_ACCUMULATE = 1;
EventTet.GUI_OPEN_GIFT = 2;
EventTet.GUI_RECEIVE_VIBRATE_GIFT = 3;
EventTet.GUI_REGISTER = 4;
EventTet.GUI_ALERT = 5;
EventTet.GUI_RECEIVE_OPEN_GIFT = 6;
EventTet.GUI_HELP = 7;
EventTet.GUI_NOTIFY = 8;
EventTet.GUI_RECEIVE_TEXT = 9;
EventTet.GUI_NAP_G_NOTIFY = 10;
EventTet.GUI_ALERT_TEXT = 11;
EventTet.GUI_GIFT = 12;

EventTet.NUM_LIXI = 24;
EventTet.NUM_COLLECT = 4;
EventTet.NUM_GIFT = 3;
EventTet.WEEK1 = 1;
EventTet.WEEK2 = 2;
EventTet.WEEK3 = 3;
EventTet.WEEK4 = 4;
EventTet.RANK_GIFT_1 = 10101;
EventTet.RANK_GIFT_2 = 100000;

EventTet.WEEK_END = 4;
EventTet.WEEK_START = 1;

EventTet.ONE_VIBRATE = 1;
EventTet.TEN_VIBRATE = 10;
EventTet.FIFTY_VIBRATE = 50;
EventTet.HUNDRED_VIBRATE = 100;

EventTet.ONE_VIBRATE_ID = 1;
EventTet.TEN_VIBRATE_ID = 2;
EventTet.FIFTY_VIBRATE_ID = 3;
EventTet.HUNDRED_VIBRATE_ID = 4;

EventTet.GOLD_ID = 987;
EventTet.NUMBER_TOP_RANK = 100;
EventTet.NUMBER_TOP_RANK_VIP = 10;
EventTet.NUMBER_TOP_RANK_VIP_1 = 3;
EventTet.NUMBER_TOP_RANK_VIP_2 = 10;
EventTet.DEFAUT_UI = "res/Event/EventTet/EventTetUI/";
EventTet.ITEM_OUT_GAME = [0, 9999, 9999, 9999, 9999];
EventTet.START_TOP_GIFT = 10000;
EventTet.NUM_GIFT_TOP = 7;

EventTet._instance = null;
EventTet.getInstance = function () {
    if (!EventTet._instance) {
        EventTet._instance = new EventTet();
    }
    return EventTet._instance;
};
var eventTet = EventTet.getInstance();

var LixiData = cc.Class.extend({
    ctor: function () {
        this.state = 0;
        this.type = "";
        this.value = 0;
    },

    isOpen: function () {
        return this.state == LixiData.OPEN;
    },

    isGold: function () {
        return this.type == EventTet.TYPE_GOLD;
    },

    isDiamond: function () {
        return this.type == EventTet.TYPE_DIAMOND;
    },

    isToken: function () {
        return this.type == EventTet.TYPE_TOKEN;
    }
})

EventTet.TYPE_GOLD = "gold";
EventTet.TYPE_DIAMOND = "diamond";
EventTet.TYPE_TOKEN = "point";
EventTet.TYPE_OUT_GAME = "outGame";
EventTet.TYPE_GOLD_DIAMOND = "goldDiamond";

LixiData.OPEN = 0;
LixiData.CLOSE = 1;
