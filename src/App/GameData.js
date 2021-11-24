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
};

var GameConfig = cc.Class.extend({

    ctor: function () {
        this.clear(true);
    },

    clear: function (isInit) {
        this.config = {};
        this.configVersion = -1;

        this.shopConfig = [];
        if (isInit)
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

        this.shopGoldIap = [];
        this.shopGIap = [];

        this.versionShopGold = -1;
        this.versionShopG = -1;
        this.isConfigShop = false;
        this.bonusStartDate = "";
        this.bonusEndDate = "";
        this.bonusStartDateG = "";
        this.bonusEndDateG = "";

        this.arrayShopGConfig = [];
        this.arrayShopGoldConfig = [];
    },



    setDayliGiftConfig: function () {
        this.dailyGift = this.config["beanMobile"];
        cc.log("GET DAY LY GIFT CONFIG " + this.dailyGift);
    },

    setNewShopGoldConfig: function (stringConfig) {

        var configGold = JSON.parse(stringConfig);
        cc.log("Config GOLD " + JSON.stringify(configGold));
        this.versionShopGold = configGold["version"];
        //configGold = JSON.parse()
        this.arrayShopGoldConfig = [];
        var length = (Config.TEST_SMS_VINA) ? 9 : 6;
        for (var i = 0; i < length; i++) {
            var config = configGold["channels"][i + ""];

            //test zalopay
            //if (Config.ENABLE_CHEAT) {
            //     if (config["id"] == Payment.GOLD_ZALO) {
            //         for (var cId = 0; cId < config["isMaintained"].length; cId++) {
            //             config["isMaintained"][cId] = 0;
            //         }
            //     }
            //}
            //-------------

            if (gamedata.payments[config.id]) {
                var count = 0;
                for (var key in config["packages"]) {
                    count = count + 1;
                }
                config.numPackage = count;
                var priority = config["priority"];
                var j;
                for (j = 0; j < this.arrayShopGoldConfig.length; j++) {
                    if (priority < this.arrayShopGoldConfig[j]["priority"]) {
                        this.arrayShopGoldConfig.splice(j, 0, config);
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
        var s = day + "-" + month + "-" + year;
        cc.log("*************** TIME STAMP " + s);
        this.bonusEndDate = s;
        cc.log("CONFIG NEW SHOP GOLD " + JSON.stringify(this.arrayShopGoldConfig));

        array1 = bonusStartDate.split("-");
        var newDate = "";
        this.bonusStartDate = "";
        for (var i = 0; i < 3 && i < array1.length; i++) {
            if (i == 0) {
                this.bonusStartDate = this.bonusStartDate + array1[2 - i];
            } else {
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

            //test zalopay
            //if (Config.ENABLE_CHEAT) {
            //     if (config["id"] == Payment.G_ZALO) {
            //         for (var cId = 0; cId < config["isMaintained"].length; cId++) {
            //             config["isMaintained"][cId] = 0;
            //         }
            //     }
            //}
            //-------------

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
                        this.arrayShopGConfig.splice(j, 0, config);
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
        var s = day + "-" + month + "-" + year;
        cc.log("*************** TIME STAMP " + s);
        this.bonusEndDateG = s;

        array1 = bonusStartDate.split("-");
        var newDate = "";
        this.bonusStartDateG = "";
        for (var i = 0; i < 3 && i < array1.length; i++) {
            if (i == 0) {
                this.bonusStartDateG = this.bonusStartDateG + array1[2 - i];
            } else {
                this.bonusStartDateG = this.bonusStartDateG + "-" + array1[2 - i];
            }
        }
        cc.log("CONFIG NEW SHOP G " + JSON.stringify(this.arrayShopGConfig));
    },

    setChanelConfig: function () {
        ChanelConfig.instance().setConfig(this.config["Channel"], this.config["chankenh"]);
    },

    updateEventConfig: function (resetEvent) {
        // cc.log("==EventMgr shop== " + JSON.stringify(arguments));

        if (resetEvent) {
            if (Config.ENABLE_EVENT_SECRET_TOWER) {
                if (secretTower.isInEvent()) return;
                secretTower.idTabEventShop = 0;
            } else if (Config.ENABLE_MID_AUTUMN) {
                if (midAutumn.isInEvent()) return;
                midAutumn.idTabEventShop = 0;
            }

            for (var i = this.arrayShopGConfig.length - 1; i >= 0; i--) {
                if (this.arrayShopGConfig[i].id == Payment.G_EVENT_TICKET || this.arrayShopGConfig[i].id == Payment.SMS_EVENT_TICKET) {
                    this.arrayShopGConfig.splice(i, 1);
                }
            }

            for (var i = this.arrayShopGoldConfig.length - 1; i >= 0; i--) {
                if (this.arrayShopGoldConfig[i].id == Payment.G_EVENT_TICKET || this.arrayShopGoldConfig[i].id == Payment.SMS_EVENT_TICKET) {
                    this.arrayShopGoldConfig.splice(i, 1);
                }
            }

            // cc.log("--> ShopG : " + JSON.stringify(this.arrayShopGConfig));
            return;
        }

        if (Config.ENABLE_EVENT_SECRET_TOWER && secretTower.isInEvent()
            || Config.ENABLE_MID_AUTUMN && midAutumn.isInEvent()) {

            this.arrayShopGoldConfig.unshift({
                id: Payment.SMS_EVENT_TICKET,
                priority: 2
            });

            //this.arrayShopGConfig.unshift({
            //    id : Payment.SMS_EVENT_TICKET,
            //    priority :2
            //});

            this.arrayShopGConfig.unshift({
                id: Payment.G_EVENT_TICKET,
                priority: 2
            });

            this.arrayShopGoldConfig.unshift({
                id: Payment.G_EVENT_TICKET,
                priority: 2
            });
        }

        // cc.log("1--> ShopG : " + JSON.stringify(this.arrayShopGConfig));
    },

    loadLevelConfig: function(levelConfig) {
        this.levelConfig = [];
        var json = JSON.stringify(levelConfig);
        cc.log("+++LevelConfig : " + json.length + " -> " + json);

        try {
            var levelData;
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

    setLevelConfig: function () {
        var obj = this.config["Degree"];
        for (var i = 1; i <= 80; i++) {
            var leveldata = {};
            leveldata["level"] = i;
            leveldata["exp"] = obj["" + i] + 0;
            this.levelConfig.push(leveldata);
        }
        for (var i = 0; i < 80; i++) {
            var s = "ACHIEVEMENT_";
            var index = Math.floor(i / 10);
            s = s + index;
            s = localized(s);

            var mod = i % 10;
            switch (mod) {

                case 0:
                case 1:
                case 2:

                    s = s + "*";
                    break;
                case 3:
                case 4:
                case 5:

                    s = s + "**";
                    break;
                case 6:
                case 7:
                case 8:
                case 9:
                    s = s + "**";
                    break;

                default:
                    break;
            }
            this.levelName.push(s);
        }
    },

    getCurrentChanel: function () {
        return ChanelConfig.instance().getCurChanel();
    },

    setShopConfig: function () {
        this.dailyGift = this.config["beanMobile"];
        var vipConvertGStar = this.config["VIP"]["convertGStar"];

        var obj = this.config["ShopGold"];
        var num = this.config["ShopGoldNum"];
        for (var i = 0; i < num; i++) {
            var shopObj = obj["" + i];
            var shop = {};
            shop.coin = shopObj["coin"];
            shop.bonus = shopObj["bonus"];
            shop.bean = shopObj["gold"];
            shop.gStar = vipConvertGStar[shop.coin];
            shop.bonusGold = 0;
            this.shopConfig.push(shop);
        }

        var oSMS = this.config["BuyGSMS"];
        this.smsSyntax = oSMS["Syntax"];
        var size = oSMS["VND"].length;
        for (var i = 0; i < size; i++) {
            var sms = {};
            sms.vnd = oSMS["VND"][i];
            sms.gold = oSMS["Gold"][i];
            sms.number = oSMS["Number"][i];

            this.smsConfig.push(sms);
        }
    },

    setShopZaloConfig: function () {
        if (this.config["BuyGZaloPay"]) {
            var zaloObject = this.config["BuyGZaloPay"];
            var zaloVnd = zaloObject["Zalo_VND"];
            var zaloG = zaloObject["Zalo_G"];

            var size = zaloVnd.length;
            this.zaloGConfig = [];
            for (var i = 0; i < size; i++) {
                var obj = {};
                obj["vnd"] = zaloVnd[i];
                obj["G"] = zaloG[i];
                this.zaloGConfig.push(obj);
            }
        } else {
            this.zaloGConfig = [];
        }

    },

    setShopIapConfig: function () {
        var iapObj = this.config["IAPShopGold"];
        var count = parseInt(this.config["IAPShopGoldNum"]);
        for (var i = 0; i < count; i++) {
            this.shopGoldIap.push(iapObj[i + ""]);
        }

        count = parseInt(this.config["BuyGNum"]);
        iapObj = this.config["BuyG"];
        for (var i = 0; i < count; i++) {
            this.shopGIap.push(iapObj[i + ""]);
        }
        if (Config.ENABLE_IAP_REFUND) {
            this.arrayDayIAP = this.config["IAPShopGoldIndex"]["days"];
            this.arrayDayIAP = this.config["IAPShopGoldIndex"]["days"];
            this.arrayGIAP = this.config["IAPShopGoldIndex"]["totalG"];
        }

    },

    setVipConfig: function () {
        var vObj = this.config["VIP"];
        var spObj = this.config["beanSuports"];
        var size = vObj["num"];
        for (var i = 0; i < size; i++) {
            var vipData = {};
            vipData.bonus = vObj["" + i]["bonusMobile"];
            vipData.time = vObj["" + i]["time"];
            vipData.price = vObj["" + i]["price"];
            vipData.rate = vObj["" + i]["rate"];

            vipData.support = spObj["" + i];

            this.vipConfig.push(vipData);
        }

        if (Config.ENABLE_NEW_VIP) {
            NewVipManager.getInstance().setBenefitConfig(this.config["VIPBenefit"]);
            NewVipManager.getInstance().setOldVipConfig(this.config["OldVIP"]);
            NewVipManager.getInstance().setRatioGstarToVpoint(this.config["VIP"]["convertGstar"]);
            NewVipManager.getInstance().setNumberVip(size);
            NewVipManager.getInstance().setBeanNeedSupportConfig(this.config["BeanNeedSupport"]);
        }
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

    setMissionInfo: function (info) {
        this.missionBuyGold = [];
        this.missionBuySMS = [];
        this.missionBuyGoldIap = [];

        for (var i = 0, size = info.shopValue.length; i < size; i++) {
            var obj = {};
            obj.isFirstBuy = info.shopFirstBuy[i];
            obj.coin = info.shopValue[i];
            obj.bonusPercentage = info.shopBonusPer[i];

            this.missionBuyGold.push(obj);
        }

        for (var i = 0, size = info.smsValue.length; i < size; i++) {
            var obj = {};
            obj.isFirstBuy = info.smsFirstBuy[i];
            obj.vnd = info.smsValue[i];
            obj.bonusPercentage = info.smsBonusPer[i];

            this.missionBuySMS.push(obj);
        }

        for (var i = 0, size = info.iapValue.length; i < size; i++) {
            var obj = {};
            obj.isFirstBuy = info.iapFirstBuy[i];
            obj.vnd = info.iapValue[i];
            obj.bonusPercentage = info.iapBonusPer[i];

            this.missionBuyGoldIap.push(obj);
        }
    },



    getLevel: function (exp) {
        if (this.levelConfig.length == 0) return 0;
        if (exp > this.levelConfig[this.levelConfig.length - 1]["exp"]) {
            return this.levelConfig.length - 1;
        }

        for (var i = 0; i < this.levelConfig.length; i++) {
            if (exp < this.levelConfig[i]["exp"]) {
                return i;
            }
        }
        return 0;
    },



    getTotalSupportBean: function(level, bean) {
        if (!this.levelConfig || this.levelConfig.length == 0)
            return bean;
        return Math.floor(bean * (1 + this.levelConfig[level].bonus/100));
    },


    checkDownLevel: function () {
        return ChanelConfig.instance().checkDownLevel();
    },

    getMissionIAPGold: function (vnd) {
        if (!vnd) return null;

        try {
            for (var j = 0; j < gamedata.gameConfig.missionBuyGoldIap.length; j++) {
                if (vnd == gamedata.gameConfig.missionBuyGoldIap[j]["vnd"]) {
                    return gamedata.gameConfig.missionBuyGoldIap[j];
                }
            }
        } catch (e) {

        }
        return null;
    },

    getMissionShopGold: function (zmoney) {
        if (!zmoney) return null;

        for (var j = 0; j < gamedata.gameConfig.missionBuyGold.length; j++) {
            if (zmoney == gamedata.gameConfig.missionBuyGold[j]["coin"]) {
                return gamedata.gameConfig.missionBuyGold[j];
            }
        }
        return null;
    },

    getMissionSMS: function (vnd) {
        if (!vnd) return null;

        for (var j = 0; j < gamedata.gameConfig.missionBuySMS.length; j++) {
            if (vnd == gamedata.gameConfig.missionBuySMS[j]["vnd"]) {
                return gamedata.gameConfig.missionBuySMS[j];
            }
        }
        return null;
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

    getIsFirstGoldSMS: function (value) {
        if (cc.isUndefined(this.arrayValueSMS))
            return 0;
        for (var i = 0; i < this.arrayValueSMS.length; i++) {
            if (this.arrayValueSMS[i] == value)
                return this.arrayIsFirstSMS[i];
        }
        return 0;
    },

    getIsFirstGoldSMSnew: function (paymentType, value) {
        var arrayValueSMS = this.arrayValueSMSViettel;
        var arrayIsFirstSMS = this.arrayIsFirstSMSViettel;
        if (paymentType === Payment.GOLD_SMS_MOBI) {
            arrayValueSMS = this.arrayValueSMSMobi;
            arrayIsFirstSMS = this.arrayIsFirstSMSMobi;
        } else if (paymentType === Payment.GOLD_SMS_VINA) {
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

    getShopGoldIndexById: function(id){
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



    getMaxVipBonus: function (vipIndex) {
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

GameConfig.KEY_SAVE_CONFIG_JSON = "game_json_config_server";
GameConfig.KEY_SAVE_CONFIG_VERSION = "game_version_config_server";

var GameData = cc.Class.extend({

    ctor: function () {
        this.hasLoadedInfor = false;

        // variable
        this.access_token = "";
        this.sessionkey = "";
        this.openID = "";
        this.sessionExpiredTime = 0;
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

        this.networkOperator = "";
        this.jackpotJson = null;


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
        this.jackpot = [];
        this.roomlist = [];

        // app version
        this.appVersion = "";
        this.old_version_link = "";

        // setting
        this.sound = true;
        this.vibrate = true;
        this.acceptInvite = false;
        this.acceptFriend = false;

        // game config
        this.gameConfig = new GameConfig();

        this.countZaloPay = -1;
        cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function()
        {
            gamedata.countZaloPay = -1;
        });
    },

    // FLOW START GAME
    startGame: function () {
        cc.log("_______________START_GAME___________________");

        // load app version
        if (cc.sys.localStorage.getItem(LocalizedString.config("KEY_APP_VERSION"))) {
            this.appVersion = cc.sys.localStorage.getItem(LocalizedString.config("KEY_APP_VERSION"));
        } else {
            if (cc.sys.os == cc.sys.OS_ANDROID)
                this.appVersion = Config.APP_VERSION_ANDROID_DEFAULT;
            else
                this.appVersion = Config.APP_VERSION_IOS_DEFAULT;
        }

        var isOldNative = this.checkOldNativeVersion();
        cc.log("start game end load app version: " + isOldNative);
        // init framework
        if (!isOldNative && cc.sys.isNative) {
            fr.google.init();
            fr.facebook.init();
            fr.zaloPay.init(Config.ZALO_PAY_ID);
            fr.platformWrapper.init();
            fr.fcm.init();
            fr.crashLytics.init();
            fr.paymentInfo.init();
            fr.tracker.enableLogErrorJSNew();
            fr.tracker.logCheckAPK(Config.URL_ZALOPAY);
        }
        // AssetsManager.getInstance().init();

        CheckLogic.addIgnoreSceneCache();

        CheatCenter.checkEnableCheat();

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/LogoLarge/skeleton.xml", "LogoLarge");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/LogoLarge/texture.plist", "LogoLarge");

        // LocalizedString.preload();

        if (gamedata.isPortal()) {
            if (Config.ENABLE_MULTI_PORTAL)
                fr.paymentInfo.loadInfo();
            fr.portalState.init();
        }

        this.hasLoadedInfor = false;
        cc.director.runScene(makeScene(new LoginScene()));
        //cc.director.runScene(makeScene(new FishingEventScene()));
        //cc.director.runScene(makeScene(new GUIOfferSuccess()));

        NativeBridge.getTelephoneInfo();
        NativeBridge.getNetworkOperator();

        if (!cc.sys.isNative) {
            if (Config.ENABLE_CHEAT) {
                var bakLog = cc._cocosplayerLog || cc.log;

                cc.log = function () {
                    bakLog.call(this, cc.formatStr.apply(cc, arguments));
                };
            } else {
                cc.log = function () {
                };
            }
        }

        NewRankData.preloadResources();

        if (gamedata.isPortal()) {
            cc.sys.localStorage.setItem(LocalizedString.config("KEY_JS_VERSION"), fr.platformWrapper.getScriptVersion());
        }

        fr.platformWrapper.logDevice();
        cc.log("Khoi tao EMULATOR DETECTOR ");
        this.emulatorDetector =  new EmulatorDetector(function (detect, data) {
            if (detect)
                gamedata.dataEmulator = JSON.stringify(data);
            else
                gamedata.dataEmulator = "";
        }.bind(this));
        cc.log("INIT XONG " + gamedata.emulatorDetector);
    },

    loadGameInformation: function () {
        if (this.hasLoadedInfor) return;
        this.hasLoadedInfor = true;

        // first init
        Football.getInstance();
        ChatMgr.getInstance();

        if (Config.ENABLE_EVENT)
            Gacha.getInstance();

        if (Config.ENABLE_LUCKY_CARD)
            LuckyCard.getInstance();

        if (Config.ENABLE_ROLLDICE)
            RollDice.getInstance();

        if (Config.ENABLE_MINIGAME) {
            ccs.load("RouleteScene.json");
            Roulete.preloadAllSound();

        }

        if (Config.ENABLE_VIDEO_POKER) {
            ccs.load("VideoPokerScene.json");
            VideoPokerSound.preloadFirstSound();
            VideoPokerSound.preloadAllSound();
        }
        Event.instance().startDownloadContent();
        Event.instance().startDownloadContent();
        Event.instance().initEvent();

        var startPreload = new Date().getTime();
        InteractPlayer.instance().preloadResource();

        // load cache config
        this.gameConfig.loadCacheConfig();

        // preload animation
        engine.preLoadAllAnimation();

        var url = "res/Jackpot/jackpot.json";
        if (!cc.sys.isNative) {
            url = srcPath + url;
        }
        cc.loader.loadJson(url, function (error, data) {
            if (!error) {
                this.setJackpotJson(data);
            }
        }.bind(this));

        // load sprite frame
        cc.spriteFrameCache.addSpriteFrames("res/Lobby/Common/gold.plist");
        cc.spriteFrameCache.addSpriteFrames("res/Lobby/Common/coin.plist");
        cc.spriteFrameCache.addSpriteFrames("res/Lobby/Common/coinNew.plist");

        if (Config.PRELOAD_LAYER && cc.sys.isNative) {
            sceneMgr.preloadScene(ChooseRoomScene.className);
            sceneMgr.preloadScene(FootballScene.className);
            sceneMgr.preloadScene(NewVipScene.className);
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

        var endPreload = new Date().getTime();
        cc.log("------------------------ Time PreLoad : " + (endPreload - startPreload));

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
        } catch (e) {

        }

        // load storage variable
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
        } else {
            try {
                cc.log("__AppVersionFromCache : " + data);
                this.readGameService(StringUtility.parseJSON(data));
            } catch (e) {
                this.checkAppVersion();
            }
        }
    },

    setJackpotJson: function (data) {
        this.jackpotJson = data;
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

        //if ((obj["enablepayment"] != null)) {
        //    cc.sys.localStorage.setItem("enablepayment", obj["enablepayment"]);
        //    gamedata.enablepayment = obj["enablepayment"];
        //}

        if ((obj["enablefacebook"] != null)) {
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
        } else {
            gamedata.source = "";
        }

        if (obj["enableAdultIcon"] != null) {
            gamedata.enableAdult = (obj["enableAdultIcon"] == 1);
        } else {
            gamedata.enableAdult = true;
        }

        if (obj["update_link"] != null) {
            gamedata.storeUrl = obj["update_link"];
            cc.sys.localStorage.setItem("update_link", obj["update_link"]);
        }

        if (obj["defautlogin"] != null) {
            gamedata.defaultlogin = obj["defautlogin"];
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
        } else {
            gamedata.regZing = "0";
        }

        if (obj["ssl"] != null) {
            gamedata.domainLoginWss = obj["ssl"];
            cc.sys.localStorage.setItem("ssl", obj["ssl"]);
        }

        if (obj["sslRank"] != null) {
            cc.sys.localStorage.setItem("sslRank", obj["sslRank"]);
        }

        if (obj["ipAppRank"] && obj["portAppRank"]) {

            cc.sys.localStorage.setItem("ipAppRank", obj["ipAppRank"]);
            cc.sys.localStorage.setItem("portAppRank", obj["portAppRank"]);
        }
        // finish loading
        this.onFinishLoadInformation();
    },

    checkAppVersion: function () {
        var data = "";
        if (!cc.sys.isNative) {
            var game = LocalizedString.config("GAME_WEB");
            if (game === "GAME_WEB") game = "sam_web";
            data += "game=" + game;
        } else {
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
        if (!cc.sys.isNative && (!this.xhr || (this.xhr.readyState !== XMLHttpRequest.DONE)))
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

    // READ GAME INFOR
    setGameConfig: function (jsonConfig) {
        this.gameConfig.loadServerConfig(jsonConfig);
    },

    setLevelConfig: function(levelConfig) {
        this.gameConfig.loadLevelConfig(levelConfig);
    },

    saveConfigShop: function (cmd) {
        this.cmdShopConfig = cmd;
        this.parseShopConfig();
    },

    parseShopConfig: function () {
        if (!this.cmdShopConfig) return;

        var cmdGetConfigShop = this.cmdShopConfig;
        cc.log("PACKEG " + JSON.stringify(cmdGetConfigShop));
        if (cmdGetConfigShop.type == CmdSendGetConfigShop.GOLD) {
            gamedata.gameConfig.isShopBonusAll = cmdGetConfigShop.isShopBonus;
            gamedata.gameConfig.setNewShopGoldConfig(cmdGetConfigShop.stringConfigGold);
            sceneMgr.updateCurrentGUI();
        } else if (cmdGetConfigShop.type == CmdSendGetConfigShop.G) {
            gamedata.gameConfig.isShopBonusAllG = cmdGetConfigShop.isShopBonusG;
            gamedata.gameConfig.setNewShopGConfig(cmdGetConfigShop.stringConfigG);
            sceneMgr.updateCurrentGUI();
        } else {
            gamedata.gameConfig.isShopBonusAll = cmdGetConfigShop.isShopBonus;
            gamedata.gameConfig.isShopBonusAllG = cmdGetConfigShop.isShopBonusG;
            gamedata.gameConfig.setNewShopGoldConfig(cmdGetConfigShop.stringConfigGold);
            gamedata.gameConfig.setNewShopGConfig(cmdGetConfigShop.stringConfigG);
            cc.log("lfdkjf sl ");
            if (sceneMgr.getRunningScene().getMainLayer() instanceof LobbyScene) {
                gamedata.checkShowSystemBonus();
            }
        }
    },

    setUserInfo: function (info) {
        var strInfo = JSON.stringify(info);
        cc.log("+++UserData " + strInfo.length + " : " + strInfo);

        // check payments
        if (!Config.ENABLE_SERVICE_ENABLE_PAYMENT) {
            this.loadPayment(info.payments);
        }
        this.parseShopConfig();

        // check holding
        this.isHolding = info.isHolding;
        this.enablepayment = info.enablePayment;
        //cc.log("^^^^^^^^^^^^^^^ : " + this.enablepayment);

        // read user info
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

        if (Config.ENABLE_IAP_BONUS_TEMP)
            this.bonusIAPTemp = info.bonusIAPTemp;
    },

    setVipInfo: function (info) {
        cc.log("+++VipInfo " + JSON.stringify(info));

        this.userData.gStar = info.gStar;
        this.userData.typeVip = info.type + 1;
        this.userData.timeVip = info.time;
    },



    // READ INSTALL CONFIG
    detectVersionUpdate: function () {
        var checkUpdate = cc.sys.localStorage.getItem("game_update_iap");
        cc.log("GameData::detectUpdate " + checkUpdate);
        if (checkUpdate && checkUpdate == "1") {
            return true;
        } else {
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

    getNetworkTelephone: function () {
        return -1;
        /*
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
        */
    },

    updateNetworkOperator: function () {
        cc.log("##UpdateNetwork Operator");
        this.networkOperator = "";
        this.networkOperator = NativeBridge.getTelephoneInfo();
        if (this.networkOperator == "") {
            this.networkOperator = NativeBridge.getNetworkOperator();
        }
        cc.log("##NetworkOperator : " + this.networkOperator);
    },


    // function scene
    onEnterScene: function () {
        CheatCenter.openCheatPopup();

        PingPongHandler.getInstance().checkNeedPing();
        BroadcastMgr.getInstance().reloadBroadcast();
    },

    onUpdateScene: function (dt) {
        BroadcastMgr.getInstance().updateBroadcast(dt);
        PingPongHandler.getInstance().updatePing(dt);
        TimeoutConnectHandler.getInstance().updateCountDown(dt);

        if (gamedata.countZaloPay >= 0) {
            gamedata.countZaloPay = gamedata.countZaloPay + dt;
            if (gamedata.countZaloPay > 10) {
                // show thong bao cai zalo
                gamedata.countZaloPay = -1;
                var str = LocalizedString.to("ZALOPAY_ERROR_INSTALL");
                Toast.makeToast(Toast.SHORT, str);
            }
        }
        Event.instance().updateEventLoop(dt);
        try {
            downloadEventManager.updateDownload();
        } catch (e) {

        }
    },

    checkDisableFacebook: function () {
        if (Config.ENABLE_FBAPI_FIX_UPDATE) {
            return (cc.sys.os == cc.sys.OS_ANDROID);
        }
        return false;
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
        return gamedata.userData.bean;
    },

    getUserCoin: function () {
        return gamedata.userData.coin;
    },

    getUserDiamond: function() {
        return gamedata.userData.diamond;
    },

    getUserLevel: function () {
        return gamedata.userData.level;
    },

    /**
     * bat dau tao session ghi log tracking offer, khoi tao gia tri trackingOffer
     */
    startTrackingOffer: function () {
        gamedata.trackingOffer = {};
        gamedata.trackingOffer.viewOffer = 1;
        gamedata.trackingOffer.clickBuyNow = 0;
        gamedata.trackingOffer.clickEnterShop = 0;
        gamedata.trackingOffer.numberBuyGold = 0;
    },

    /**
     * cap nhat so luong action trong tracking offer
     * @param typeUpdate: 1: action mua ngay, 2: action mo shop, 3: so lan mua gold trong session
     */
    updateInfoTrackingOffer: function (typeUpdate) {
        if (gamedata.trackingOffer == null) {
            return;
        }
        switch (typeUpdate) {
            case 1: {
                gamedata.trackingOffer.clickBuyNow++;
                break;
            }
            case 2: {
                gamedata.trackingOffer.clickEnterShop++;
                break;
            }
            case 3: {
                gamedata.trackingOffer.numberBuyGold++;
                break;
            }
        }
    },

    /**
     * gui tracking len server, tra ve trackingOffer gia tri null tranh ghi thua log
     */
    sendTrackingOffer: function () {
        if (gamedata.trackingOffer == null) {
            return;
        }
        var logTrackingOffer = gamedata.trackingOffer.viewOffer + "_" + gamedata.trackingOffer.clickBuyNow + "_" +
            gamedata.trackingOffer.clickEnterShop + "_" + gamedata.trackingOffer.numberBuyGold;

        cc.log("trackingOffer: " + JSON.stringify(gamedata.trackingOffer), logTrackingOffer);
        var sendLogClient = new CmdSendClientInfo();
        sendLogClient.putData(logTrackingOffer, 1);
        GameClient.getInstance().sendPacket(sendLogClient);
        gamedata.trackingOffer = null;
    },


});

GameData.UPDATE_MONEY_EVENT = "GAME_DATA_UPDATE_MONEY_EVENT";
GameData.instance = null;
GameData.getInstance = function () {
    if (!GameData.instance) {
        GameData.instance = new GameData();
    }
    return GameData.instance;
};
var gamedata = GameData.getInstance();

var Payment = function () {
};

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

Payment.G_IAP = 1;
Payment.G_ATM = 3;
Payment.G_ZALO = 5;
Payment.G_ZING = 7;
Payment.G_CARD = 9;

Payment.GOLD_SMS_VIETTEL = 11;
Payment.GOLD_SMS_MOBI = 12;
Payment.GOLD_SMS_VINA = 13;

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

Payment.BUY_SMS_INDEX = 1;
Payment.BUY_IAP_INDEX = 2;
Payment.BUY_ZING_INDEX = 4;
Payment.BUY_ATM_INDEX = 5;
Payment.BUY_ZALO_INDEX = 6;
Payment.BUY_SMS_VIETTEL_INDEX = 7;
Payment.BUY_SMS_MOBI_INDEX = 8;
Payment.BUY_SMS_VINA_INDEX = 9;

ConfigLog = {};
ConfigLog.ZALO_PAY = "ZALO_PAY";
ConfigLog.DAILY_PURCHASE = "DAILY_PURCHASE";
ConfigLog.BEGIN = "_begin_";
ConfigLog.END = "_end_";