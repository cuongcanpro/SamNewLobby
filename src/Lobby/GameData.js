engine.preLoadAllAnimation = function () {
    cc.log("____LOAD___LOBBY___ANIMS_____");
    for (var i in lobby_animations) {
        db.DBCCFactory.getInstance().loadDragonBonesData(lobby_animations[i].folderpath + lobby_animations[i].skeleton, lobby_animations[i].key);
        db.DBCCFactory.getInstance().loadTextureAtlas(lobby_animations[i].folderpath + lobby_animations[i].texture, lobby_animations[i].key);
    }

    cc.log("____LOAD___GAME___ANIMS_____");
    for (var i in game_animations) {
        db.DBCCFactory.getInstance().loadDragonBonesData(game_animations[i].folderpath + game_animations[i].skeleton, game_animations[i].key);
        db.DBCCFactory.getInstance().loadTextureAtlas(game_animations[i].folderpath + game_animations[i].texture, game_animations[i].key);
    }
}

var GameConfig = cc.Class.extend({

    ctor: function (json) {
        this.config = JSON.parse(json);
        cc.log("CONFIG GAME " + JSON.stringify(this.config));
        this.shopConfig = [];
        this.levelConfig = [];
        this.levelName = [];
        this.smsConfig = [];
        this.smsSyntax = "";
        this.vipConfig = [];
        this.missionConfig = {};
        this.missionBuyGold = {};
        this.missionBuySMS = {};
        this.dailyGift = 0;
        this.miniGame = {};

        this.paymentType = 0;
        this.smsType = 0;
        this.enableSMS = false;
        this.enableCard = false;

        this.shareSupport = 0;
        this.versionShopGold = -1;
        this.versionShopG = -1;
        this.isConfigShop = false;
        this.bonusStartDate = "";
        this.bonusEndDate = "";
        this.bonusStartDateG = "";
        this.bonusEndDateG = "";
        this.shopGoldIap = [];
        this.shopGIap = [];
        this.arrayShopGConfig = [];
        this.arrayShopGoldConfig = [];

        this.setChanelConfig();
        this.setVipConfig();
        this.setConfigMinigame();
        this.setDayliGiftConfig();
        this.setSpecialSupportConfig();
    },

    setDayliGiftConfig: function () {
        this.dailyGift = this.config["DailyGift"]["1"]["beanMobile"];
    },

    setServerConfig: function (p) {
        this.smsSyntax = p.syntaxSms;
        this.paymentType = p.paymentType;
        this.smsType = p.smsType;
        this.enableSMS = p.enableSMS;
        this.enableCard = p.enableCard;

        cc.log("#Payment Info : " + this.smsSyntax + "/" + this.paymentType + "/" + this.smsType + "/" + this.enableSMS + "/" + this.enableCard);
    },

    setChanelConfig: function () {
        ChanelConfig.instance().setConfig(this.config["Channel"], this.config["chankenh"]);
    },

    loadLevelConfig: function(levelConfig) {
        this.levelConfig = [];

        try {
            for (var i = 0; i <= levelConfig.maxLevel; i++){
                this.levelConfig.push({
                    level: i,
                    exp: Number(levelConfig.level[i]),
                    bonus: Number(levelConfig.bonus[i]["percentBonus"])
                });
            }
        } catch (e) {
            cc.error("###GameData::level config error " + e);
        }
    },

    getCurrentChanel: function () {
        return ChanelConfig.instance().getCurChanel();
    },

    setDataShop: function (cmdGetConfigShop) {
        if (cmdGetConfigShop.type == CmdSendGetConfigShop.GOLD) {
            this.isShopBonusAll = cmdGetConfigShop.isShopBonus;
            this.setNewShopGoldConfig(cmdGetConfigShop.stringConfigGold);
            sceneMgr.updateCurrentGUI();
        }
        else if (cmdGetConfigShop.type == CmdSendGetConfigShop.G) {
            this.isShopBonusAllG = cmdGetConfigShop.isShopBonusG;
            this.setNewShopGConfig(cmdGetConfigShop.stringConfigG);
            sceneMgr.updateCurrentGUI();
        }
        else {
            this.isShopBonusAll = cmdGetConfigShop.isShopBonus;
            this.isShopBonusAllG = cmdGetConfigShop.isShopBonusG;
            this.setNewShopGoldConfig(cmdGetConfigShop.stringConfigGold);
            this.setNewShopGConfig(cmdGetConfigShop.stringConfigG);
            if (sceneMgr.getRunningScene().getMainLayer() instanceof LobbyScene) {
                gamedata.checkShowSystemBonus();
            }
        }
    },

    setNewShopGoldConfig: function (stringConfig) {

        var configGold = JSON.parse(stringConfig);
        // cc.log("Config GOLD " + JSON.stringify(configGold));
        this.versionShopGold = configGold["version"];
        //configGold = JSON.parse()
        this.arrayShopGoldConfig = [];
        var length = (Config.TEST_SMS_VINA) ? 9 : 6;
        for (var i = 0; i < length; i++) {
            var config = configGold["channels"][i + ""];
            // cc.log("config gold: " + JSON.stringify(config));
            if (gamedata.payments[config.id]) {
                var count = 0;
                for(var key in config["packages"]){
                    count = count + 1;
                }
                config.numPackage = count;
                var priority = config["priority"];
                var j;
                for (j = 0; j < this.arrayShopGoldConfig.length; j++) {
                    if (priority < this.arrayShopGoldConfig[j]["priority"]) {
                        this.arrayShopGoldConfig.splice(j, 0, config)
                        break;
                    }
                }
                if (j == this.arrayShopGoldConfig.length)
                    this.arrayShopGoldConfig.push(config);
            }
        }
        var bonusStartDate = configGold["bonusStartDate"];
        var bonusEndDate = configGold["bonusEndDate"];
        var array1 = bonusEndDate.split("-");
        for (var i = 0; i < 3 && i < array1.length; i++) {
            if (i == 0)
                this.bonusEndDate = this.bonusEndDate + array1[2 - i];
            else
                this.bonusEndDate = this.bonusEndDate + "-" + array1[2 - i];
        }

        newDate = array1[1] + "/" + array1[2] + "/" + array1[0];
        var timestamp = new Date(newDate).getTime() - 1;
        cc.log("*************** TIME STAMP " + timestamp);
        var date = new Date(timestamp);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var s = (day < 10 ? ("0" + day) : day) + "-" + (month < 10 ? ("0" + month) : month) + "-" + year;
        cc.log("*************** TIME STAMP " + s);
        this.bonusEndDate = s;
        // cc.log("CONFIG NEW SHOP GOLD " + JSON.stringify(this.arrayShopGoldConfig));

        array1 = bonusStartDate.split("-");
        var newDate = "";
        this.bonusStartDate = "";
        for (var i = 0; i < 3 && i < array1.length; i++) {
            if (i == 0) {
                this.bonusStartDate = this.bonusStartDate + array1[2 - i];
            }
            else {
                this.bonusStartDate = this.bonusStartDate + "-" + array1[2 - i];
            }
        }

    },

    setNewShopGConfig: function (stringConfig) {
        var configG = JSON.parse(stringConfig);
        this.versionShopG = configG["version"];
        //configGold = JSON.parse()
        this.arrayShopGConfig = [];
        for (var i = 0; i < 5; i++) {
            var config = configG["channels"][i + ""];
            if (gamedata.payments[config.id]) {
                var count = 0;
                for (var key in config["packages"]) {
                    count = count + 1;
                }
                config.numPackage = count;
                var priority = config["priority"];
                var j;
                for (j = 0; j < this.arrayShopGConfig.length; j++) {
                    if (priority < this.arrayShopGConfig[j]["priority"]) {
                        this.arrayShopGConfig.splice(j, 0, config)
                        break;
                    }
                }
                if (j == this.arrayShopGConfig.length)
                    this.arrayShopGConfig.push(config);
            }
        }

        var bonusStartDate = configG["bonusStartDate"];
        var bonusEndDate = configG["bonusEndDate"];
        if (bonusEndDate == "" || !bonusEndDate)
            return;
        var array1 = bonusEndDate.split("-");
        for (var i = 0; i < 3 && i < array1.length; i++) {
            if (i == 0)
                this.bonusEndDateG = this.bonusEndDateG + array1[2 - i];
            else
                this.bonusEndDateG = this.bonusEndDateG + "-" + array1[2 - i];
        }

        newDate = array1[1] + "/" + array1[2] + "/" + array1[0];
        var timestamp = new Date(newDate).getTime() - 1;
        cc.log("*************** TIME STAMP " + timestamp);
        var date = new Date(timestamp);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var s = (day < 10 ? ("0" + day) : day) + "-" + (month < 10 ? ("0" + month) : month) + "-" + year;
        cc.log("*************** TIME STAMP " + s);
        this.bonusEndDateG = s;

        array1 = bonusStartDate.split("-");
        var newDate = "";
        this.bonusStartDateG = "";
        for (var i = 0; i < 3 && i < array1.length; i++) {
            if (i == 0) {
                this.bonusStartDateG = this.bonusStartDateG + array1[2 - i];
            }
            else {
                this.bonusStartDateG = this.bonusStartDateG + "-" + array1[2 - i];
            }
        }
    },

    setVipConfig: function () {
        var vObj = this.config["VIP"];
        var spObj = this.config["Support"]["beanSuports"];
        var size = vObj["num"];
        for (var i = 0; i < size; i++) {
            var vipData = {};
            vipData.bonus = vObj["" + i]["bonusMobile"];
            vipData.time = vObj["" + i]["time"];
            vipData.price = vObj["" + i]["price"];

            vipData.support = spObj["" + i];

            this.vipConfig.push(vipData);
        }

        NewVipManager.getInstance().setBenefitConfig(this.config["VIPBenefit"]);
        NewVipManager.getInstance().setOldVipConfig(this.config["OldVIP"]);
        NewVipManager.getInstance().setRatioGstarToVpoint(this.config["VIP"]["convertGstar"]);
        NewVipManager.getInstance().setNumberVip(size);
        NewVipManager.getInstance().setBeanNeedSupportConfig(this.config["BeanNeedSupport"]);
    },

    setSpecialSupportConfig: function () {
        var special = this.config["support"]["special"];
        var specialSupport = {};
        specialSupport["bonusGold"] = special["specialSupportGold"];
        specialSupport["numSupport"] = special["SpecialSupportNumber"];
        specialSupport["minGold"] = special["specialSupportMinGold"];
        var supportTime = special["specialSupportTime"];
        var startHour = [];
        var startMinute = [];
        var endHour = [];
        var endMinute = [];
        for (var i = 0; i < supportTime.length; i++) {
            var time = supportTime[i];
            var timeSplit = time.split("-");
            var start = timeSplit[0].split(":");
            var end = timeSplit[1].split(":");

            startHour.push(parseInt(start[0]));
            startMinute.push(parseInt(start[1]));
            endHour.push(parseInt(end[0]));
            endMinute.push(parseInt(end[1]));
        }
        specialSupport["time"] = supportTime;
        specialSupport["startHour"] = startHour;
        specialSupport["startMinute"] = startMinute;
        specialSupport["endHour"] = endHour;
        specialSupport["endMinute"] = endMinute;

        this.specialSupport = specialSupport;

        cc.log("special support config: ", JSON.stringify(this.specialSupport));
    },

    setConfigMinigame: function () {
        if ("Mission" in this.config) {
            var mission = this.config["EventWC"];

            this.miniGame.maxBet = mission["maxMoneyBet"];
            this.miniGame.minBet = mission["minMoneyBet"];
            this.miniGame.rateScore = mission["rateEatScore"];
        }
    },

    getLevelString: function(level, levelExp) {
        if (!this.levelConfig || this.levelConfig.length == 0)
            return level + "(0%)";
        var percentStr = "max";
        if (level < this.levelConfig.length - 1)
            percentStr = Math.floor(this.getCurrentLevelCompleted(level, levelExp) * 100).toFixed(0) + "%";
        return level + " (" + percentStr + ")";
    },

    getCurrentLevelCompleted: function(level, levelExp) {
        if (!this.levelConfig || this.levelConfig.length == 0) return 0;
        if (level >= this.levelConfig.length - 1) return 0;

        var currentLevelExp = levelExp - this.levelConfig[level].exp;
        var maxLevelExp = this.levelConfig[level + 1].exp - this.levelConfig[level].exp;
        return currentLevelExp/maxLevelExp;
    },

    getTotalSupportBean: function(level, bean) {
        if (!this.levelConfig || this.levelConfig.length == 0)
            return bean;
        return Math.floor(bean * (1 + this.levelConfig[level].bonus/100));
    },

    getLevelBonus: function(level) {
        if (!this.levelConfig || this.levelConfig.length == 0)
            return 0;
        return this.levelConfig[level].bonus;
    },

    checkDownLevel: function () {
        return ChanelConfig.instance().checkDownLevel();
    },

    getIsFirstGoldG: function (value) {
        if (cc.isUndefined(this.arrayValueG))
            return 0;
        for (var i = 0; i < this.arrayValueG.length; i++) {
            if (this.arrayValueG[i] == value)
                return this.arrayIsFirstG[i];
        }
        return 0;
    },

    getIsFirstGoldIAP: function (value) {
        if (cc.isUndefined(this.arrayValueIAP))
            return 0;
        for (var i = 0; i < this.arrayValueIAP.length; i++) {
            if (this.arrayValueIAP[i] == value)
                return this.arrayIsFirstIAP[i];
        }
        return 0;
    },

    getIsFirstGoldSMSnew: function(paymentType, value){
        var arrayValueSMS = this.arrayValueSMSViettel;
        var arrayIsFirstSMS = this.arrayIsFirstSMSViettel;
        if (paymentType === Payment.GOLD_SMS_MOBI){
            arrayValueSMS = this.arrayValueSMSMobi;
            arrayIsFirstSMS = this.arrayIsFirstSMSMobi;
        } else if (paymentType === Payment.GOLD_SMS_VINA){
            arrayValueSMS = this.arrayValueSMSVina;
            arrayIsFirstSMS = this.arrayIsFirstSMSVina;
        }
        if (cc.isUndefined(arrayValueSMS))
            return 0;
        for (var i = 0; i < arrayValueSMS.length; i++) {
            if (arrayValueSMS[i] === value)
                return arrayIsFirstSMS[i];
        }
        return 0;
    },

    getIsFirstGoldZing: function (value) {
        if (cc.isUndefined(this.arrayValueZing))
            return 0;
        for (var i = 0; i < this.arrayValueZing.length; i++) {
            if (this.arrayValueZing[i] == value)
                return this.arrayIsFirstZing[i];
        }
        return 0;
    },

    getIsFirstGoldZalo: function (value) {
        if (cc.isUndefined(this.arrayValueZalo))
            return 0;
        for (var i = 0; i < this.arrayValueZalo.length; i++) {
            if (this.arrayValueZalo[i] == value)
                return this.arrayIsFirstZalo[i];
        }
        return 0;
    },

    getIsFirstGoldATM: function (value) {
        if (cc.isUndefined(this.arrayValueATM))
            return 0;
        for (var i = 0; i < this.arrayValueATM.length; i++) {
            if (this.arrayValueATM[i] == value)
                return this.arrayIsFirstATM[i];
        }
        return 0;
    },

    getShopGoldById: function (id) {
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            if (this.arrayShopGoldConfig[i].id == id)
                return this.arrayShopGoldConfig[i];
        }
    },

    getShopGoldIndexById: function (id) {
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            if (this.arrayShopGoldConfig[i].id == id)
                return i;
        }
        return 0;
    },

    getShopGoldByType: function (id) {
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            if (this.arrayShopGoldConfig[i].type == id)
                return this.arrayShopGoldConfig[i];
        }
    },

    getShopGById: function (id) {
        for (var i = 0; i < this.arrayShopGConfig.length; i++) {
            if (this.arrayShopGConfig[i].id == id)
                return this.arrayShopGConfig[i];
        }
    },

    getLastShopGoldId: function () {
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            if (this.arrayShopGoldConfig[i].type == this.lastBuyGoldType) {
                if (this.arrayShopGoldConfig[i].id == Payment.GOLD_SMS_VIETTEL || this.arrayShopGoldConfig[i].id == Payment.GOLD_SMS_VINA ||
                    this.arrayShopGoldConfig[i].id == Payment.GOLD_SMS_MOBI) {
                    return Payment.GOLD_SMS;

                }
                else
                    return this.arrayShopGoldConfig[i].id;
            }
        }
        return Payment.GOLD_SMS;
    },

    checkHavePackage: function (type, value) {
        //if (type === Payment.GOLD_SMS_VINA && value > 20000){
        //    return false;
        //}
        var config = gamedata.gameConfig.getShopGoldById(type);
        cc.log("CONFIG PACKAGE *** " + JSON.stringify(config));
        for (var i = 0; i < config.numPackage; i++) {
            var packageShop = config["packages"][i];
            if (packageShop["value"] == value) {
                return true;
            }
        }
        return false;
    },

    getMaxShopBonus: function() {
        var arrayBonus = [];
        if (!gamedata.gameConfig.isShopBonusAll) {
            return arrayBonus;
        }
        var max = 0;
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            var config = this.arrayShopGoldConfig[i];
            if (config.isShopBonus) {
                arrayBonus.push(config.id);
                for (var j = 0; j < config.numPackage; j++) {
                    if (config["packages"][j + ""]["shopBonus"] > max) {
                        max = config["packages"][j + ""]["shopBonus"];
                    }
                }
            }
        }
        if (arrayBonus.length > 0) {
            arrayBonus.push(max); // lay ra mang cac goi khuyen mai, phan tu cuoi cung la gia tri khuyen mai lon nhat
        }
        return arrayBonus;
    },

    getMaxShopGBonus: function() {
        var arrayBonus = [];
        if (!gamedata.gameConfig.isShopBonusAllG) {
            return arrayBonus;
        }
        var max = 0;
        for (var i = 0; i < this.arrayShopGConfig.length; i++) {
            var config = this.arrayShopGConfig[i];
            if (config["shopBonus"] > 0) {
                arrayBonus.push(config.id);
                if (config["shopBonus"] > max)
                    max = config["shopBonus"];
            }
        }
        if (arrayBonus.length > 0) {
            arrayBonus.push(max); // lay ra mang cac goi khuyen mai, phan tu cuoi cung la gia tri khuyen mai lon nhat
        }
        return arrayBonus;
    },

    getMaxChannelBonus: function() { // lay ra kenh co khuyen mai lon nhat
        var max = 0;
        var channel = 0;
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            var config = this.arrayShopGoldConfig[i];
            if (config.isShopBonus) {
                for (var j = 0; j < config.numPackage; j++) {
                    if (config["packages"][j + ""]["shopBonus"] > max) {
                        max = config["packages"][j + ""]["shopBonus"];
                        channel = i;
                    }
                }
            }
        }
        return channel;
    },

    getMaxChannelGBonus: function() { // lay ra kenh co khuyen mai lon nhat
        var max = 0;
        var channel = 0;
        for (var i = 0; i < this.arrayShopGConfig.length; i++) {
            var config = this.arrayShopGConfig[i];
            if (config["shopBonus"] > 0) {
                if (config["shopBonus"] > max) {
                    max = config["shopBonus"];
                    channel = i;
                }
            }
        }
        return channel;
    },

    getMaxChannelFirstShopBonus: function() {
        var max = 0;
        var channel = 0;
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            var config = this.arrayShopGoldConfig[i];
            for (var j = 0; j < config.numPackage; j++) {
                if (config["packages"][j + ""]["firstBonus"] > max) {
                    max = config["packages"][j + ""]["firstBonus"];
                    channel = i;
                }
            }
        }
        return channel;
    },

    getMaxFirstShopBonus: function() {
        var max = 0;
        for (var i = 0; i < this.arrayShopGoldConfig.length; i++) {
            var config = this.arrayShopGoldConfig[i];
            if (Config.TEST_SMS_VINA){
                if (config["name"] === "sms") continue;
            } else {
                if (config["name"].indexOf("sms_") >= 0) continue;
            }
            for (var j = 0; j < config.numPackage; j++) {
                if (config["packages"][j + ""]["firstBonus"] > max) {
                    max = config["packages"][j + ""]["firstBonus"];
                }
            }
        }
        return max;
    },

    getMaxVipBonus: function(vipIndex) {
        var goldIap = gamedata.gameConfig.getShopGoldById(Payment.GOLD_G);
        var max = 0;
        if (goldIap) {
            for (var i = 0; i < goldIap.numPackage; i++) {

                var packageShop = goldIap["packages"][i];
                var vipRate = 0;
                if (vipIndex > 0) {
                    switch (vipIndex) {
                        case 1:
                            vipRate = packageShop["weekVIPBonus"];
                            break;
                        case 2:
                            vipRate = packageShop["silverVIPBonus"];
                            break;
                        case 3:
                            vipRate = packageShop["goldVIPBonus"];
                            break;
                    }
                    if (max < vipRate) {
                        max = vipRate;
                    }
                }
            }

        }
        return max;
    }

});

var GameData = cc.Class.extend({

    ctor: function () {
        this.hasLoadedInfor = false;

        // variable
        this.access_token = "";
        this.sessionkey = "";
        this.openID = "";
        this.socialLogined = 0;
        this.gameConfig = null;
        this.userData = {};

        this.urlnews = "https://www.play.zing.vn/mobile";
        this.source = "";
        this.forum = "https://www.facebook.com/fanpagezingplay";
        this.isAppSupport = 1;
        this.support = "vng.cs.td.hotro";
        this.supporturl = "http://hotro.zing.vn";
        this.supportphone = "";
        this.autologin = 3;
        this.enablefacebook = true;
        this.enablepayment = true;
        this.payments = [];
        this.enableDailyMission = false;
        this.disablesocial = -1;
        this.ipapp = "";
        this.portapp = 0;
        this.giftIndex = -1;
        this.networkOperator = "";

        this.storeUrl = "";
        var game = LocalizedString.config("GAME");

        if (cc.sys.os == cc.sys.OS_ANDROID) {
            switch (game) {
                case 'pokerhk':
                    this.storeUrl = "market://details?id=gsn.game.zingplaynew5";
                    break;
                default :
                    this.storeUrl = "market://details?id=gsn.game.zingplaynew1";
                    break;
            }
        }
        if (cc.sys.os == cc.sys.OS_IOS) {
            switch (game) {
                case 'pokerhk':
                    this.storeUrl = "https://itunes.apple.com/vn/app/zingplay-xi-to/id887752917?mt=8";
                    break;
                default :
                    this.storeUrl = "https://itunes.apple.com/us/app/zingplay-tien-len/id908617867?l=vi&ls=1&mt=8";
                    break;
            }
        }

        this.voteAppEnable = false;
        this.voteAppBonus = 0;

        this.enableAdult = true;

        // shop + quest
        this.isShopBonus = false;
        this.isShopIAPBonus = false;
        this.giftIndex = -1;
        this.defaultlogin = 0;

        // event shop
        this.shopEventBonus = {};
        this.shopEventBonusNew = {};

        // suport
        this.numSupport = -1;
        this.timeSupport = -1;
        this.showSupportTime = false;

        // player info in game
        this.selectedChanel = -1;
        this.jackpot = 0;
        this.roomlist = [];

        // app version
        this.appVersion = "";
        this.old_version_link = "";
        this.jsVersion = "";

        // setting
        this.sound = true;
        this.vibrate = true;
        this.acceptInvite = false;
        this.acceptFriend = false;

        this.countZaloPay = -1;
        cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function()
        {
            gamedata.countZaloPay = -1;
        });

        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
        });
    },

    setUserInfo: function (info) {
        this.userData.avatar = info.avatar;
        this.userData.displayName = info.userName;
        this.userData.zName = info.zName;
        this.userData.name = info.zName;
        this.userData.bean = info.gold;
        this.userData.coin = info.zMoney;
        this.userData.levelScore = info.levelScore;
        this.userData.winCount = info.winCount;
        this.userData.lostCount = info.lostCount;
        this.userData.star = 0;
        this.userData.uID = info.uId;
        this.userData.level = info.level;
        this.userData.levelExp = info.levelExp;
        this.userData.diamond = info.diamond;

        this.isShopBonus = info.isShopBonus;
        this.isShopIAPBonus = info.isShopIAPBonus;
        this.userData.openID = this.openID;

    },

    setVipInfo: function (info) {
        this.userData.gStar = info.gStar;
        this.userData.typeVip = info.type + 1;
        this.userData.timeVip = info.time;
    },

    updateMoney: function (update) {
        if (update.uID == this.userData.uID) {
            this.userData.bean = update.bean;
            this.userData.coin = update.coin;
            this.userData.winCount = update.winCount;
            this.userData.lostCount = update.lostCount;
            this.userData.levelScore = update.levelScore;
            this.userData.level = update.level;
            this.userData.levelExp = update.levelExp;
            this.userData.diamond = update.diamond;

            //dispatch event update weekly challenge GUI
            var event = new cc.EventCustom(GameData.UPDATE_MONEY_EVENT);
            cc.eventManager.dispatchEvent(event);
        }
    },

    startGame: function () {
        cc.log("_______________START_GAME___________________");
        this.joinTime = new Date().getTime();
        downloadEventManager.lobbyTime = 0;
        // init framework
        if (cc.sys.isNative){
            fr.google.init();
            fr.facebook.init();
            fr.zaloPay.init(Config.ZALO_PAY_ID);
            fr.platformWrapper.init();
            fr.paymentInfo.init();
            fr.tracker.enableLogErrorJSNew();
            fr.tracker.logCheckAPK(Config.URL_ZALOPAY);
        }

        CheatCenter.checkEnableCheat();

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/LogoLarge/skeleton.xml", "LogoLarge");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/LogoLarge/texture.plist", "LogoLarge");

        // LocalizedString.preload();

        // load app version
        if (cc.sys.localStorage.getItem(LocalizedString.config("KEY_APP_VERSION"))) {
            this.appVersion = cc.sys.localStorage.getItem(LocalizedString.config("KEY_APP_VERSION"));
        }
        else {
            if(cc.sys.os === cc.sys.OS_ANDROID)
                this.appVersion = Config.APP_VERSION_ANDROID_DEFAULT;
            else
                this.appVersion = Config.APP_VERSION_IOS_DEFAULT;
        }

        // log crashlytic
        fr.crashLytics.init();

        if (gamedata.isPortal()) {
            if (Config.ENABLE_MULTI_PORTAL)
                fr.paymentInfo.loadInfo();
            fr.portalState.init();

        }

        this.hasLoadedInfor = false;
        cc.director.runScene(makeScene(new LoginScene()));

        if (cc.sys.os == cc.sys.OS_IOS) {
            NativeBridge.sendLoginGSN("", "", "idfv_" + NativeBridge.getDeviceID(), "");
        }

        // request network info
        NativeBridge.getTelephoneInfo();
        NativeBridge.getNetworkOperator();

        if (!cc.sys.isNative){
            if (Config.ENABLE_CHEAT){
                var bakLog = cc._cocosplayerLog || cc.log;
                cc.error = function(){
                    bakLog.call(this, "ERROR :  " + cc.formatStr.apply(cc, arguments));
                };
                cc.assert = function(cond, msg) {
                    if (!cond && msg) {
                        var args = [];
                        for (var i = 1; i < arguments.length; i++)
                            args.push(arguments[i]);
                        bakLog("Assert: " + cc.formatStr.apply(cc, args));
                    }
                };

                cc.warn = function(){
                    bakLog.call(this, "WARN :  " + cc.formatStr.apply(cc, arguments));
                };

                cc.log = function(){
                    bakLog.call(this, cc.formatStr.apply(cc, arguments));
                };
                cc.log("defuck");
            } else {
                cc.log = function(){};
                // console.log = function(){};
            }
        }

        if(gamedata.isPortal()) {
            cc.sys.localStorage.setItem(LocalizedString.config("KEY_JS_VERSION"),fr.platformWrapper.getScriptVersion());
        }

        //fr.platformWrapper.logDevice();
        this.emulatorDetector =  new EmulatorDetector(function (detect, data) {
            if (detect)
                gamedata.dataEmulator = JSON.stringify(data);
            else
                gamedata.dataEmulator = "";
        }.bind(this));
    },

    loadGameInformation: function () {
        if (this.hasLoadedInfor) return;
        this.hasLoadedInfor = true;

        Event.instance();
        Event.instance().startDownloadContent();
        event.initEvent();

        InteractPlayer.instance().preloadResource();
        NewRankData.preloadResources();

        // load animation
        engine.preLoadAllAnimation();

        if(Config.ENABLE_NEW_LOBBY) {
            db.DBCCFactory.getInstance().loadDragonBonesData("Lobby/Event/Light_BG/skeleton.xml", "Light_BG");
            db.DBCCFactory.getInstance().loadTextureAtlas("Lobby/Event/Light_BG/texture.plist", "Light_BG");

            db.DBCCFactory.getInstance().loadDragonBonesData("Lobby/Event/Girl_Trungthu/skeleton.xml", "Girl_Trungthu");
            db.DBCCFactory.getInstance().loadTextureAtlas("Lobby/Event/Girl_Trungthu/texture.plist", "Girl_Trungthu");
        }

        // load sound
        try {
            for(var s in lobby_sounds) {
                cc.audioEngine.preloadEffect(lobby_sounds[s]);
            }
        }
        catch(e) {
            cc.log("Load lobby sound cache error " + e);
        }

        try {
            for(var s in g_sounds) {
                cc.audioEngine.preloadEffect(g_sounds[s]);
            }
        }
        catch(e) {
            cc.log("Load game sound cache error " + e);
        }

        // load sprite frame
        cc.spriteFrameCache.addSpriteFrames("res/Lobby/Common/gold.plist");
        cc.spriteFrameCache.addSpriteFrames("res/Lobby/Common/coin.plist");
        cc.spriteFrameCache.addSpriteFrames("res/Lobby/Common/coinNew.plist");

        if(Config.PRELOAD_LAYER && cc.sys.isNative) {
            sceneMgr.preloadScene(ChooseRoomScene.className);
            sceneMgr.preloadScene(ShopIapScene.className);
            sceneMgr.preloadScene(StorageScene.className);
            sceneMgr.preloadGUI(SettingGUI.className);
            sceneMgr.preloadGUI(UserInfoPanel.className);
            sceneMgr.preloadGUI(Dialog.className);
            sceneMgr.preloadGUI(GiftCodeScene.className);
            sceneMgr.preloadGUI(SupportBeanGUI.className);
            sceneMgr.preloadGUI(DailyPurchaseGUI.className);

            // preload gui in game
            CheckLogic.preloadLayer();
        }

        // load userdefault
        try {
            var uname = cc.sys.localStorage.getItem(LocalizedString.config("KEY_USERNAME_NEW"));
            var pwd = cc.sys.localStorage.getItem(LocalizedString.config("KEY_PASSWORD_NEW"));
            var login = cc.sys.localStorage.getItem(LocalizedString.config("KEY_LOGIN_NEW"));

            if (login !== undefined && login != null && login != "-10") {
                var autologin = cc.sys.localStorage.getItem(LoginScene.AUTO_LOGIN_KEY);
                if (autologin !== undefined && autologin != -1) {
                    cc.log("---" + login);
                    cc.sys.localStorage.setItem(LoginScene.AUTO_LOGIN_KEY, login);
                }
                cc.sys.localStorage.setItem(LocalizedString.config("KEY_LOGIN_NEW"), "-10");
            }

            if (uname !== undefined && pwd !== undefined && uname != null && pwd != null && uname != "" && pwd != "") {
                cc.sys.localStorage.setItem(LoginScene.USERNAME_KEY, uname);
                cc.sys.localStorage.setItem(LoginScene.PASSWORD_KEY, pwd);

                cc.sys.localStorage.setItem(LocalizedString.config("KEY_USERNAME_NEW"), "");
                cc.sys.localStorage.setItem(LocalizedString.config("KEY_PASSWORD_NEW"), "");
            }

            cc.log("___LOAD__USER__DEFAULT " + uname + "/" + pwd + "/" + login);
        }
        catch (e) {

        }

        // load storage variable
        if (cc.sys.localStorage.getItem(LocalizedString.config("KEY_APP_VERSION"))) {
            this.appVersion = cc.sys.localStorage.getItem(LocalizedString.config("KEY_APP_VERSION"));
        }
        else {
            if(cc.sys.os == cc.sys.OS_ANDROID)
                this.appVersion = Config.APP_VERSION_ANDROID_DEFAULT;
            else
                this.appVersion = Config.APP_VERSION_IOS_DEFAULT;
        }

        if (cc.sys.localStorage.getItem("sound")) {
            var sound = cc.sys.localStorage.getItem("sound");

            gamedata.sound = sound > 2;
            gameSound.on = gamedata.sound;
        }

        var vibrate = cc.sys.localStorage.getItem("vibrate");
        if (vibrate !== undefined && vibrate != null) {
            gamedata.vibrate = (vibrate == 1);
        }

        var invite = cc.sys.localStorage.getItem("invite");
        if (invite !== undefined && invite != null) {
            gamedata.acceptInvite = (invite == 1);
        }

        var friend = cc.sys.localStorage.getItem("friend");
        if (friend !== undefined && friend != null) {
            gamedata.acceptFriend = (friend == 1);
        }

        // load data gameservices
        var data = cc.sys.localStorage.getItem(LocalizedString.config("KEY_DATA_URL"));
        if (data == null || data === undefined || data == "") {
            this.checkAppVersion();
        }
        else {
            try {
                cc.log("__AppVersionFromCache : " + data);
                this.readGameService(StringUtility.parseJSON(data));
            }
            catch (e) {
                this.checkAppVersion();
            }
        }
    },

    onFinishLoadInformation: function () {
        var g = sceneMgr.getRunningScene().getMainLayer();
        if (!Config.WITHOUT_LOGIN || cc.sys.isNative) {
            g.showLogin();
        } else {
            g.autoLogin();
        }
    },

    readGameService: function (obj) {
        // parse services
        if (obj["ipapp"] && obj["portapp"]) {
            GameData.getInstance().ipapp = "" + obj["ipapp"];
            GameData.getInstance().portapp = "" + obj["portapp"];

            cc.sys.localStorage.setItem("ipapp", GameData.getInstance().ipapp);
            cc.sys.localStorage.setItem("portapp", GameData.getInstance().portapp);
        }

        if ((obj["enablefacebook"] != null )) {
            GameData.getInstance().enablefacebook = false;
            cc.sys.localStorage.setItem("enablefacebook", obj["enablefacebook"]);
        }

        if (obj["disableLoginSocial"] != null) {
            gamedata.disablesocial = obj["disableLoginSocial"];
            cc.sys.localStorage.setItem("disableLoginSocial", obj["disableLoginSocial"]);
        }

        if (obj["source"] != null) {
            gamedata.source = obj["source"];
            cc.sys.localStorage.setItem("source", obj["source"]);
        }
        else {
            gamedata.source = "";
        }

        if (obj["enableAdultIcon"] != null) {
            gamedata.enableAdult = (obj["enableAdultIcon"] == 1);
        }
        else {
            gamedata.enableAdult = true;
        }

        if (obj["update_link"] != null) {
            gamedata.storeUrl = obj["update_link"];
            cc.sys.localStorage.setItem("update_link", obj["update_link"]);
        }

        if (obj["defautlogin"] != null) {
            cc.sys.localStorage.setItem("defaultlogin", obj["defautlogin"]);
        }

        if (obj["isAppSupport"] != null) {
            gamedata.isAppSupport = (obj["isAppSupport"] == 1);
            cc.sys.localStorage.setItem("isAppSupport", obj["isAppSupport"]);
        }

        if ((obj["support"] != null) && (obj["forum"] != null)) {
            gamedata.support = obj["support"];
            gamedata.forum = obj["forum"];

            if (gamedata.isAppSupport)
                gamedata.supporturl = "http://hotro.zing.vn";
            else
                gamedata.supporturl = gamedata.support;

            gamedata.supportphone = "";

            cc.sys.localStorage.setItem("support", obj["support"]);
            cc.sys.localStorage.setItem("forum", obj["forum"]);

            cc.sys.localStorage.setItem("supporturl", gamedata.supporturl);
            cc.sys.localStorage.setItem("supportphone", gamedata.supportphone);
        }

        if (obj["urlnews"] != null) {
            gamedata.urlnews = obj["urlnews"];
            cc.sys.localStorage.setItem("urlnews", obj["urlnews"]);
        }
        if (obj["old_version"] != null) {
            gamedata.old_version_link = obj["old_version"];
            cc.sys.localStorage.setItem("old_version", obj["old_version"]);
        }
        if (obj["regZing"] != null) {
            gamedata.regZing = obj["regZing"];
        }
        else {
            gamedata.regZing = "0";
        }

        if (obj["ssl"] != null) {
            gamedata.domainLoginWss = obj["ssl"];
            cc.sys.localStorage.setItem("ssl", obj["ssl"]);
        }

        // finish loading
        this.onFinishLoadInformation();
    },

    checkAppVersion: function () {
        var data = "";
        if (!cc.sys.isNative) {
            data += "game=" + LocalizedString.config("GAME_WEB");
        }
        else {
            if (cc.sys.os == cc.sys.OS_ANDROID)
                data += "game=" + LocalizedString.config("GAME_ANDROID");
            else if (cc.sys.os == cc.sys.OS_IOS)
                data += "game=" + LocalizedString.config("GAME_IOS");
            else
                data += "game=" + LocalizedString.config("GAME_ANDROID");
        }


        data += ("&device=" + NativeBridge.getDeviceID() + "&version=" + gamedata.appVersion);
        data += ("&referer=" + NativeBridge.getRefer());

        engine.HandlerManager.getInstance().forceRemoveHandler("check_version");
        engine.HandlerManager.getInstance().addHandler("check_version", this.onTimeout.bind(this));
        engine.HandlerManager.getInstance().getHandler("check_version").setTimeOut(10, true);

        this.xhr = LoginHelper.getRequest(Constant.APP_VERSION_URL, data, null, null, this.onResponse.bind(this));
        cc.log("# JsonRequest " + Constant.APP_VERSION_URL + "?" + data);
        // this.onFinishLoadInformation();
    },

    onResponse: function () {
        if(!cc.sys.isNative && (!this.xhr || (this.xhr.readyState != XMLHttpRequest.DONE)))
            return;
        cc.log("__AppVersionFromServices : " + this.xhr.responseText);
        var obj = StringUtility.parseJSON(this.xhr.responseText);
        this.readGameService(obj);

        engine.HandlerManager.getInstance().forceRemoveHandler("check_version");
    },

    onTimeout: function () {
        cc.log("__________TIMEOUT___CHECK___VERSION_______________");
        this.xhr.abort();

        this.onFinishLoadInformation();
    },

    setGameConfig: function (config) {
        this.gameConfig = new GameConfig(config.jsonConfig);
        this.gameConfig.setServerConfig(config);
    },

    setLevelConfig: function(levelConfig) {
        this.gameConfig.loadLevelConfig(levelConfig);
    },

    showSupportBean: function (bean, isSpecial) {
        //var sp = sceneMgr.openGUI(SupportBeanGUI.className, Dialog.SUPPORT, Dialog.SUPPORT, false);
        //if (sp) sp.showSupportBean(bean, numSupport);

        if (popUpManager.canShow(PopUpManager.SUPPORT)) {
            var sp = sceneMgr.openGUI(GUISupportInfo.className, PopUpManager.SUPPORT, PopUpManager.SUPPORT, false);
            if (sp) sp.showGUI(bean, isSpecial);
        }
    },

    showSystemBonus: function () {
        var isShow = false;
        for (var i = 0; i < gamedata.payments.length; i++) {
            if (i == Payment.GOLD_G) {
                if (gamedata.payments[i]) {
                    isShow = true;
                }
            }
        }
        if (!isShow) return;

        var show = false;
        if (cc.sys.localStorage.getItem("systemBonus") == null) {
            show = true;
            var today = new Date();
            cc.sys.localStorage.setItem("systemBonus", today.toISOString().substring(0, 10));
        }
        else {
            var today = new Date();
            var check = cc.sys.localStorage.getItem("systemBonus") + "";
            if (check != today.toISOString().substring(0, 10)) {
                cc.sys.localStorage.setItem("systemBonus", today.toISOString().substring(0, 10));
                show = true;
            }

        }

        if (show) {
            if (popUpManager.canShow(PopUpManager.SHOP_BONUS)) {
                var sp = sceneMgr.openGUI(GUISystemBonus.className, PopUpManager.SHOP_BONUS, GUISystemBonus.tag, false);
            }
        }
    },

    showSystemBonusG: function () {
        var isShow = false;
        for (var i = 0; i < gamedata.payments.length; i++) {
            if (i == Payment.GOLD_G) {
                if (gamedata.payments[i]) {
                    isShow = true;
                }
            }
        }
        if (!isShow) return;

        var show = false;
        if (cc.sys.localStorage.getItem("systemBonusG") == null) {
            show = true;
            var today = new Date();
            cc.sys.localStorage.setItem("systemBonusG", today.toISOString().substring(0, 10));
        }
        else {
            var today = new Date();
            var check = cc.sys.localStorage.getItem("systemBonusG") + "";
            if (check != today.toISOString().substring(0, 10)) {
                cc.sys.localStorage.setItem("systemBonusG", today.toISOString().substring(0, 10));
                show = true;
            }

        }
        if (show) {
            if (popUpManager.canShow(PopUpManager.SHOP_BONUS)) {
                var sp = sceneMgr.openGUI(GUIGBonus.className, PopUpManager.SHOP_BONUS, GUIGBonus.tag, false);
            }
        }
    },

    showSupportStartup: function () {
        if (popUpManager.canShow(PopUpManager.STARTUP)) {
            var sp = sceneMgr.openGUI(SupportBeanGUI.className, PopUpManager.STARTUP, PopUpManager.STARTUP, false);
            if (sp) sp.showSupportStartup();
        }
    },

    showTangVangPopup: function () {
        var isShow = false;
        for (var i = 0; i < gamedata.payments.length; i++) {
            if (i == Payment.GOLD_G) {
                if (gamedata.payments[i]) {
                    isShow = true;
                }
            }
        }
        cc.log("SHOW TANG VANG 1");
        if (!isShow) return;

        var show = false;
        if (cc.sys.localStorage.getItem("popuptangvang") == null) {
            show = true;
            var today = new Date();
            cc.sys.localStorage.setItem("popuptangvang", today.toISOString().substring(0, 10));
        }
        else {
            var today = new Date();
            var check = cc.sys.localStorage.getItem("popuptangvang") + "";
            if (check != today.toISOString().substring(0, 10)) {
                cc.sys.localStorage.setItem("popuptangvang", today.toISOString().substring(0, 10));
                show = true;
            }

        }

        if (show) {
            if (popUpManager.canShow(PopUpManager.SHOP_BONUS)) {
                var sp = sceneMgr.openGUI(TangVangPopup.className, PopUpManager.SHOP_BONUS, Dialog.SUPPORT, false);
                if (sp) sp.showBonus(1);
            }
        }

    },

    showTangVangPopup2: function () {
        var isShow = false;
        for (var i = 0; i < gamedata.payments.length; i++) {
            if (i == Payment.IDX_SHOP_G) {
                if (gamedata.payments[i]) {
                    isShow = true;
                }
            }
        }

        if (!isShow) return;

        var show = false;
        if (cc.sys.localStorage.getItem("popuptangvang2") == null) {
            show = true;
            var today = new Date();
            cc.sys.localStorage.setItem("popuptangvang2", today.toISOString().substring(0, 10));
        }
        else {
            var today = new Date();
            var check = cc.sys.localStorage.getItem("popuptangvang2") + "";
            if (check != today.toISOString().substring(0, 10)) {
                cc.sys.localStorage.setItem("popuptangvang2", today.toISOString().substring(0, 10));
                show = true;
            }

        }
        if (show) {
            if (popUpManager.canShow(PopUpManager.SHOP_BONUS)) {
                var sp = sceneMgr.openGUI(TangVangPopup.className, PopUpManager.SHOP_BONUS, Dialog.SUPPORT, false);
                if (sp) sp.showBonus(2);
            }
        }

    },

    checkSupportBean: function (waitSupport) {

        if (gamedata.giftIndex >= 0)
            return false;

        var ret = false;

        var vipLevel = NewVipManager.getInstance().getVipLevel();
        var beanConfig = NewVipManager.getInstance().getBeanNeedSupportConfig();
        // cc.log("CHECK SUPPORTY BEAN ", vipLevel, beanConfig[vipLevel]);
        if (beanConfig && gamedata.userData.bean < parseFloat(beanConfig[vipLevel])) {
            var cmd = new CmdSendGetSupportBean();
            GameClient.getInstance().sendPacket(cmd);
            cmd.clean();
            ret = true;
        }
        else {
            ret = false;
        }

        if (waitSupport !== undefined && waitSupport != null) {
            gamedata.showSupportTime = waitSupport;
        }

        return ret;
    },

    checkInSpecialTimeSupport: function() {
        if (this.isWaitingSpecialSupport){
            var now = Date.now();
            var startTime = now + this.specialSupportRemainStart;
            var endTime = now + this.specialSupportRemainEnd;
            var startTimeStr = StringUtility.customFormatDate(startTime, "#hhhh#:#mm#");
            var endTimeStr = StringUtility.customFormatDate(endTime - 1000 * 60, "#hhhh#:#mm#");
            if (now < startTime) {
                return {error: 0, time:startTimeStr + "-" + endTimeStr};
            }
            if (now < endTime){
                return {error: 1, time:startTimeStr + "-" + endTimeStr};
            }
            var cmd = new CmdSendGetSupportBean();
            GameClient.getInstance().sendPacket(cmd);
            cmd.clean();
            return null;
        }
        else return null;
    },

    detectVersionUpdate: function () {
        var checkUpdate = cc.sys.localStorage.getItem("game_update_iap");
        cc.log("GameData::detectUpdate " + checkUpdate);
        if (checkUpdate && checkUpdate == "1") {
            return true;
        }
        else {
            var versionCode = NativeBridge.getVersionCode();
            cc.log("GameData::detectVersion " + versionCode);
            if (versionCode < 0)
                return true;
        }
        return false;
    },

    getInstallDate: function () {
        var strInstallDate = cc.sys.localStorage.getItem("game_install_date");
        cc.log("GameData::InstallDate: ", strInstallDate);
        if (strInstallDate) {
            return strInstallDate;
        } else {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            var strDate = dd + '-' + mm + '-' + yyyy;
            cc.sys.localStorage.setItem("game_install_date", strDate);
            cc.log("GameData::InstallDate: new Install", strDate);
            return strDate;
        }
    },

    // payment
    openShop: function (waiting, callback, defaultTab) {
        if (gamedata.checkEnablePayment()) {
            var cmd = new CmdSendGetConfigShop();
            var versionGold = (gamedata.gameConfig.isShopBonusAll) ? -1 : gamedata.gameConfig.versionShopGold;
            cmd.putData(CmdSendGetConfigShop.GOLD, versionGold);
            GameClient.getInstance().sendPacket(cmd);

            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
            if(gui instanceof ShopIapScene) {
                if (defaultTab) {
                    gui.selectTabPaymentInGold(defaultTab);
                }
                else {
                    gui.selectTabPaymentInGold(-1);
                }
            }
        }
    },

    openShopInTab: function (id) {
        if (gamedata.checkEnablePayment()) {
            var cmd = new CmdSendGetConfigShop();
            var versionGold = (gamedata.gameConfig.isShopBonusAll) ? -1 : gamedata.gameConfig.versionShopGold;
            cmd.putData(CmdSendGetConfigShop.GOLD, versionGold);
            GameClient.getInstance().sendPacket(cmd);

            var gui = sceneMgr.openScene(ShopIapScene.className);
            if(gui instanceof ShopIapScene) {
                gui.selectTabPaymentInGold(id);
            }
        }
    },

    openNapG: function (waiting, callback) {
        if (gamedata.checkEnablePayment() && gamedata.checkEnableNapG()) {
            var cmd = new CmdSendGetConfigShop();
            var versionG = (gamedata.gameConfig.isShopBonusAll) ? -1 : gamedata.gameConfig.versionShopG;
            cmd.putData(CmdSendGetConfigShop.G, versionG);
            GameClient.getInstance().sendPacket(cmd);
            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
            if(gui instanceof ShopIapScene) {
                gui.selectTabPaymentInG(-1);
            }
        }
    },

    openNapGInTab: function (id,waiting, callback) {
        if (gamedata.checkEnablePayment() && gamedata.checkEnableNapG()) {
            var cmd = new CmdSendGetConfigShop();
            var versionG = (gamedata.gameConfig.isShopBonusAll) ? -1 : gamedata.gameConfig.versionShopG;
            cmd.putData(CmdSendGetConfigShop.G, versionG);
            GameClient.getInstance().sendPacket(cmd);

            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
            if(gui instanceof ShopIapScene)
                gui.selectTabPaymentInG(id);
        }
    },

    openShopTicket: function (waiting, callback) {
        if (gamedata.checkEnablePayment()) {
            var cmd = new CmdSendGetConfigShop();
            var versionGold = (gamedata.gameConfig.isShopBonusAll) ? -1 : gamedata.gameConfig.versionShopGold;
            cmd.putData(CmdSendGetConfigShop.GOLD, versionGold);
            GameClient.getInstance().sendPacket(cmd);

            var gui = sceneMgr.openScene(ShopIapScene.className, waiting, callback);
            if(gui instanceof ShopIapScene)
                gui.selectTabPaymentInTicket(-1);
        }
    },

    checkEnableNapG: function() {
        return this.payments[Payment.G_IAP] || this.payments[Payment.G_CARD] || this.payments[Payment.G_ZALO] || this.payments[Payment.G_ZING] || this.payments[Payment.G_ATM]
    },

    checkEnablePayment: function () {
        for (var i = 0; i < gamedata.payments.length; i++) {
            if (i == Payment.GOLD_G) {
                if (gamedata.payments[i]) {
                    return true;
                }
            }
            else {
                if (gamedata.payments[i] && !gamedata.isPortal()) {
                    return true;
                }
            }
        }

        return false;
    },

    checkInReview: function () {
        if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_PAYMENT && CheatCenter.ENABLE_REVIEW) {
            return true;
        }

        var disablePayment = !gamedata.enablepayment;

        if (disablePayment === undefined || disablePayment == null) disablePayment = false;
        var platformDisable = false;
        if (cc.sys.os == cc.sys.OS_IOS) {
            platformDisable = true;
        }
        return (disablePayment && platformDisable);
    },

    checkInReviewVisibleHelp: function () {
        if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_PAYMENT && CheatCenter.ENABLE_REVIEW) {
            return true;
        }

        var disablePayment = !gamedata.enablepayment;
        if (disablePayment === undefined || disablePayment == null) disablePayment = false;
        return (disablePayment);
    },

    checkShowPopupBrand: function () {
        var myDate="26-02-2012";
        myDate=myDate.split("-");
        var newDate= myDate[1]+","+myDate[0]+","+myDate[2];
        var minDate = "03/04/2019";
        var maxDate = "03/10/2019";
        var minDateNum = new Date(minDate).getTime();
        var maxDateNum = new Date(maxDate).getTime();
        var currentTime = new Date().getTime();
        cc.log("min max " + minDateNum + " " + maxDateNum);
        if (currentTime < maxDateNum && currentTime > minDateNum) {
            var shownPopupBrand = cc.sys.localStorage.getItem("shownPopupBrand");
            if (shownPopupBrand == null || !shownPopupBrand) {
                var gui = sceneMgr.openGUI(GUIPopupBrand.className, GUIPopupBrand.tag, GUIPopupBrand.tag);
                cc.sys.localStorage.setItem("shownPopupBrand", 1);
            }
        }
    },

    getNetworkTelephone: function () {
        return -1; // don't get mcc network from dual sim

        var teleInfo = NativeBridge.getTelephoneInfo();
        var operator = -1;
        switch (teleInfo) {
            case Constant.TELE_VIETTEL:
            {
                operator = Constant.ID_VIETTEL;
                break;
            }
            case Constant.TELE_MOBIFONE:
            {
                operator = Constant.ID_MOBIFONE;
                break;
            }
            case Constant.TELE_VINAPHONE:
            {
                operator = Constant.ID_VINAPHONE;
                break;
            }
            default :
            {
                operator = -1;
                break;
            }
        }

        return operator;
    },

    updateNetworkOperator : function () {
        cc.log("##UpdateNetwork Operator");
        this.networkOperator = "";
        this.networkOperator = NativeBridge.getTelephoneInfo();
        if(this.networkOperator == "") {
            this.networkOperator = NativeBridge.getNetworkOperator();
        }
        cc.log("##NetworkOperator : " + this.networkOperator);
    },

    // Portal comunicate
    isPortal: function () {
        if(Config.ENABLE_CHEAT)
        {
            if(CheatCenter.ENABLE_FAKE_PORTAL) return true;
        }
        try {
            return (cc.director.isUsePortal && cc.director.isUsePortal());
        }
        catch (e) {

        }

        return false;
    },

    endGame: function () {
        if (gamedata.isPortal()) {
            try {
                fr.NativeService.endGame();
            }
            catch (e) {
                cc.director.end();
            }
        }
        else {
            if (cc.sys.os == cc.sys.OS_IOS)
                engine.HandlerManager.getInstance().exitIOS();
            else
                cc.director.end();
        }
    },

    getSessionKeyPortal: function () {
        // if(Config.ENABLE_CHEAT)
        // {
        //     var session = cc.sys.localStorage.getItem(CHEAT_FAKE_SESSION);
        //     cc.log("++SessionPortal : " + session);
        //     return session;
        // }
        if (!cc.sys.isNative){
            return GameData.getInstance().sessionkey;
        }

        try {
            return fr.NativePortal.getInstance().getSessionKey();
        }
        catch (e) {

        }

        return "";
        //return "aWQ9MTc5NDAyNTUmdXNlcm5hbWU9c2ltbzA4JnNvY2lhbD16aW5nbWUmc29jaWFsbmFtZT1zaW1vMDgmYXZhdGFyPWh0dHAlM0ElMkYlMkZ6aW5ncGxheS5zdGF0aWMuZzYuemluZy52biUyRmltYWdlcyUyRnpwcCUyRnpwZGVmYXVsdC5wbmcmdGltZT0xNDgxNTk3MTU1Jm90aGVyPWRlZmF1bHQlM0ElM0F6aW5nbWUlN0N1bmtub3duJTdDdW5rbm93biUzQSUzQTE3OTQwMjU1JnRva2VuS2V5PWYwM2RlMGQ3ZjlmMTA5MTgxY2EzMTE0NDA0NmZiZWVm";
    },

    getVersionJS : function () {
        if(this.jsVersion === undefined || this.jsVersion == null || this.jsVersion == "") {
            if (this.isPortal()) {
                var project_manifest_path = fr.NativeService.getFolderUpdateAssets() + '/' + 'project.manifest';
                var project_manifest_path_ios = fr.NativeService.getFolderUpdateAssets() + '/' + 'project.dat';
                var manifestData = jsb.fileUtils.getStringFromFile(project_manifest_path);
                if(!manifestData) {
                    manifestData = jsb.fileUtils.getStringFromFile(project_manifest_path_ios);
                }

                try {
                    this.jsVersion = JSON.parse(manifestData).version + "";
                }
                catch (e) {
                    this.jsVersion = "1";
                }
            }
            else {
                this.jsVersion = cc.sys.localStorage.getItem(LocalizedString.config("KEY_JS_VERSION"));

                if (this.jsVersion === undefined || this.jsVersion == null || this.jsVersion == "") this.jsVersion = "0";
            }
        }

        return this.jsVersion;
    },

    // login
    backToLoginScene: function (checkPortal) {
        if (checkPortal && gamedata.isPortal()) {
            gamedata.endGame();
            return;
        }

        var curScene = sceneMgr.getMainLayer();
        if (curScene instanceof  LoginScene && (gamedata.isPortal() || !cc.sys.isNative)) {
            curScene.autoLoginPortal();
        }
        else {
            sceneMgr.openScene(LoginScene.className);
        }
    },

    onEventShopBonusNew : function (data) {
        cc.log("++EventShopBonusNew : " + JSON.stringify(data));
        this.shopEventBonusNew = [];

        var size = data.g2GoldFirstValue.length;
        var g2GOLD = {};
        g2GOLD["type"] = Payment.GOLD_G;
        for(var i = 0;i < size ; i++) {
            g2GOLD["" + data.g2GoldFirstValue[i]] = data.g2GoldFirstTicket[i];
        }
        this.shopEventBonusNew.push(g2GOLD);

        size = data.smsGoldFirstValue.length;
        var smsGOLD = {};
        smsGOLD["type"] = Payment.GOLD_SMS;
        for(var i = 0;i < size ; i++) {
            smsGOLD["" + data.smsGoldFirstValue[i]] = data.smsGoldFirstTicket[i];
        }
        this.shopEventBonusNew.push(smsGOLD);

        size = data.iapGoldFirstValue.length;
        var iapGOLD = {};
        iapGOLD["type"] = Payment.GOLD_IAP;
        for(var i = 0;i < size ; i++) {
            iapGOLD["" + data.iapGoldFirstValue[i]] = data.iapGoldFirstTicket[i];
        }
        this.shopEventBonusNew.push(iapGOLD);

        size = data.zingGoldFirstValue.length;
        var zingGOLD = {};
        zingGOLD["type"] = Payment.GOLD_ZING;
        for(var i = 0;i < size ; i++) {
            zingGOLD["" + data.zingGoldFirstValue[i]] = data.zingGoldFirstTicket[i];
        }
        this.shopEventBonusNew.push(zingGOLD);

        size = data.atmGoldFirstValue.length;
        var atmGOLD = {};
        atmGOLD["type"] = Payment.GOLD_ATM;
        for(var i = 0;i < size ; i++) {
            atmGOLD["" + data.atmGoldFirstValue[i]] = data.atmGoldFirstTicket[i];
        }
        this.shopEventBonusNew.push(atmGOLD);

        size = data.zaloPayGoldFirstValue.length;
        var zaloGOLD = {};
        zaloGOLD["type"] = Payment.GOLD_ZALO;
        for(var i = 0;i < size ; i++) {
            zaloGOLD["" + data.zaloPayGoldFirstValue[i]] = data.zaloPayGoldFirstTicket[i];
        }
        this.shopEventBonusNew.push(zaloGOLD);

        /**
         * Buy Ticket By G
         */
        size = data.gTicketValues.length;
        var gTicket = {};
        gTicket["type"] = Payment.G_EVENT_TICKET;
        for(var i = 0;i < size ; i++) {
            gTicket["" + data.gTicketValues[i]] = {
                // old : data.gTicketRealTickets[i],
                new : data.gTicketTickets[i]
            }
        }
        this.shopEventBonusNew.push(gTicket);

        sceneMgr.updateCurrentGUI();
    },

    getEventBonusTicket : function (type,value) {
        var data = (!Config.ENABLE_EVENT_SECRET_TOWER && !Config.ENABLE_MID_AUTUMN) ? this.shopEventBonus : this.shopEventBonusNew;
        if (Event.instance().isInEvent()){
            for (var i = 0; i < data.length; i++) {
                if (data[i].type == type) {
                    var obj = data[i];
                    if(obj) {
                        var key = value + "";
                        if(key in obj) {
                            return obj[key];
                        }
                    }
                }
            }
        }

        return 0;
    },

    getEventTicketConfig : function (type) {
        // cc.log("Get Ticket Config : " + type + " in " + JSON.stringify(this.shopEventBonusNew));
        if (Config.ENABLE_EVENT_SECRET_TOWER || Config.ENABLE_MID_AUTUMN) {
            for (var i = 0; i < this.shopEventBonusNew.length; i++) {
                if (this.shopEventBonusNew[i].type == type) {
                    return this.shopEventBonusNew[i];
                }
            }
        }
        return null;
    },

    checkShowSystemBonus: function () {
        // cc.log("CHECK SHOW SYSTEM BONUS ");
        if (!gamedata.gameConfig)
            return;
        var arrayBonus = gamedata.gameConfig.getMaxShopBonus();
        if (arrayBonus.length > 0) {
            gamedata.showSystemBonus();
        }

        var arrayBonusG = gamedata.gameConfig.getMaxShopGBonus();
        if (arrayBonusG.length > 0) {
            gamedata.showSystemBonusG();
        }
    },

    // function scene
    onEnterScene : function () {
        CheatCenter.openCheatPopup();

        PingPongHandler.getInstance().checkNeedPing();
        BroadcastMgr.getInstance().reloadBroadcast();
    },

    onUpdateScene : function (dt) {
        try {
            BroadcastMgr.getInstance().updateBroadcast(dt);
        }
        catch(e) {

        }
        try {
            PingPongHandler.getInstance().updatePing(dt);
        }
        catch(e) {

        }
        try {
            TimeoutConnectHandler.getInstance().updateCountDown(dt);
        }
        catch(e) {

        }
        if (gamedata.countZaloPay >= 0) {
            gamedata.countZaloPay = gamedata.countZaloPay + dt;
            if (gamedata.countZaloPay > 10) {
                // show thong bao cai zalo
                gamedata.countZaloPay = -1;
                var str = LocalizedString.to("ZALOPAY_ERROR_INSTALL");
                Toast.makeToast(Toast.SHORT, str);
            }
        }
        event.updateEventLoop(dt);
        try {
            downloadEventManager.updateDownload();
        } catch (e) {

        }
    },

    // check social login
    checkDisableSocialViral : function () {
        if(Config.DISABLE_FACEBOOK_VIRAL && socialMgr._currentSocial != SocialManager.ZALO) {
            return true;
        }
        // khong cho user duoi level 2 thay nut share
        // if (this.gameConfig.getLevel(this.userData.levelScore) < 2){
        //     return true;
        // }
        // return false;
        return this.userData.level < 2;
    },
    // new framework
    checkOldNativeVersion: function () {
        // if(this.isPortal()) return true;
        if (cc.sys.os == cc.sys.OS_WINDOWS) return true;
        if (cc.sys.os == cc.sys.OS_IOS) return true;
        cc.log("#checkOldNativeVersion " + gamedata.appVersion + " vs " + Config.OLD_VERSION + " -> " + (gamedata.appVersion <= Config.OLD_VERSION));
        return gamedata.appVersion <= Config.OLD_VERSION;
    },

    getUserName: function () {
        return gamedata.userData.zName;
    },

    getDisplayName: function () {
        return gamedata.userData.displayName;
    },

    getUserId: function () {
        return gamedata.userData.uID;
    },

    getUserAvatar: function () {
        return gamedata.userData.avatar;
    },

    getUserGold: function () {
        return  gamedata.userData.bean;
    },

    getUserCoin: function () {
        return  gamedata.userData.coin;
    },

    getUserDiamond: function() {
        return gamedata.userData.diamond;
    },

    getUserLevel: function () {
        return gamedata.userData.level;
    },

    /**
     * Event Portal
     */
    checkEventPortal: function () {
        if (!this.checkPortal) {
            cc.log("CHAY VO DAY NAY KIEM TRA QUEST PORTAL 3");
            if (typeof injection != "undefined" && injection != null && injection.scopes != null) {
                injection.scopes.init(["quest", "giftcode"], function(result) {
                    cc.log("DU LIEU NE " + result);
                    if (result) {
                        cc.log("LAY THANH CONG ");
                        var quest1 = injection.scopes.getQuest();
                        gamedata.giftCode = injection.scopes.getGiftCode();
                        var portalId = injection.scopes.getPortalId();
                        var expireTime = quest1["expireTime"];

                        cc.log("QUEST " + JSON.stringify(quest1["list"]));
                        cc.log("GIFT CODE " + JSON.stringify(gamedata.giftCode));
                        cc.log("PORTAL ID " + portalId);
                        var list = quest1["list"];
                        var quests = [];
                        if (list && list.length > 0) {
                            for (var s = 0; s < list.length; s++) {
                                if (list[s].startsWith("binh", 0)) {
                                    var questId = list[s].split("_");
                                    if (questId[1]) {
                                        quests.push(questId[1]);
                                    }
                                }
                            }
                        }
                        cc.log("EVENT PORTAL CHECK QUESTS: " + JSON.stringify(quests));
                        if (Config.ENABLE_CHEAT) {
                            setTimeout(function () {
                                //  Toast.makeToast(Toast.LONG, "id: " + id + "  " + JSON.stringify(quests));
                            }, 3000);
                        }
                        //send quest to server
                        if (quests.length > 0) {
                            var sendQuestCmd = new CmdSendPortalQuest();
                            sendQuestCmd.putData(quests, expireTime, portalId);
                            GameClient.getInstance().sendPacket(sendQuestCmd);
                            sendQuestCmd.clean();
                        }
                        if (gamedata.giftCode.length > 0) {
                            var s = localized("EVENT_PORTAL");
                            s = StringUtility.replaceAll(s, "@x", gamedata.giftCode.length);
                            s = StringUtility.replaceAll(s, "@money", StringUtility.pointNumber(100000 * gamedata.giftCode.length));
                            sceneMgr.showOkDialogWithAction(s, this, function (buttonId) {
                                if (buttonId == Dialog.BTN_OK) {
                                    for (var i = 0; i < gamedata.giftCode.length; i++) {
                                        var cmd = new CmdSendPortalGiftCode();
                                        cc.log("SEND GIFT CODE " + gamedata.giftCode[i]);
                                        cmd.putData(gamedata.giftCode[i]);
                                        GameClient.getInstance().sendPacket(cmd);
                                        cmd.clean();
                                    }
                                }
                            });
                        }

                    }
                    else {
                        cc.log("LAY THAT BAI ");
                        // Get data error
                    }
                });
            }
            else {
                cc.log("KHONG CO DU LIEU TU PORTAL ***** ");
            }
        }
        this.checkPortal = true;
    },

    updateUserInfoNow: function () {
        var gui = sceneMgr.getMainLayer();
        if (gui && gui.updateToCurrentData) {
            gui.updateToCurrentData();
        }
    }
});

GameData.UPDATE_MONEY_EVENT = "GAME_DATA_UPDATE_MONEY_EVENT";

GameData.firstInit = true;
GameData.instance = null;

GameData.getInstance = function () {
    if (GameData.firstInit) {
        GameData.instance = new GameData();
        GameData.firstInit = false;
    }
    return GameData.instance;
};

var gamedata = GameData.getInstance();

var Payment = function () {
}
Payment.SO6 = 1;
Payment.ZALO = 2;

Payment.IDX_IAP_G = 0;
Payment.IDX_IAP_GOLD = 1;
Payment.IDX_SHOP_G = 2;
Payment.IDX_ZALO_G = 3;

Payment.GOLD_IAP = 0;
Payment.GOLD_ATM = 2;
Payment.GOLD_ZALO = 4;
Payment.GOLD_ZING = 6;
Payment.GOLD_G = 10;
Payment.GOLD_SMS = 8;

Payment.GOLD_SMS_VIETTEL = 11;
Payment.GOLD_SMS_MOBI = 12;
Payment.GOLD_SMS_VINA = 13;

Payment.G_IAP = 1;
Payment.G_ATM = 3;
Payment.G_ZALO = 5;
Payment.G_ZING = 7;
Payment.G_CARD = 9;

Payment.TICKET_G = 30;
Payment.TICKET_SMS = 28;
Payment.TICKET_ZING = 26;
Payment.TICKET_IAP = 20;
Payment.TICKET_ATM = 22;
Payment.TICKET_ZALO = 24;

Payment.SMS_VIETTEL = 0;
Payment.SMS_VINA = 1;
Payment.SMS_MOBI = 2;

Payment.CARD_VIETTEL = 0;
Payment.CARD_VINA = 1;
Payment.CARD_MOBI = 2;
Payment.CARD_VINAMOBILE = 3;

Payment.BONUS_NONE = 0;
Payment.BONUS_FIRST = 1;
Payment.BONUS_VIP = 2;
Payment.BONUS_SYSTEM = 3;

Payment.CHEAT_PAYMENT_NORMAL = 0;
Payment.CHEAT_PAYMENT_EVENT = 1;
Payment.CHEAT_PAYMENT_OFFER = 2;

Payment.IS_OFFER = 1;
Payment.NO_OFFER = 0;
Payment.BUY_TICKET = 3;

Payment.BUY_TICKET_FROM = 20;

ConfigLog = {};
ConfigLog.ZALO_PAY = "ZALO_PAY";
ConfigLog.DAILY_PURCHASE = "DAILY_PURCHASE";
ConfigLog.BEGIN = "_begin_";
ConfigLog.END = "_end_";