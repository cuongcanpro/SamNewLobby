var VipManager = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.vipLevel = 0;
        this.remainTime = 0;
        this.vPoint = 0;
        this.dailyBonusGold = 0;
        this.dataSave = null;
        this.isWaitingEffect = false;
        this.dataConvert = null;
        this.vipConfig = [];
        this.oldConfig = null;
        this.ratioGstarToVpoint = 1;
        this.benefitConfig = null;
        this.beanNeedSupportConfig = null;
        VipManager.preloadResource();
    },

    update: function (dt) {
        this.updateTimeVip(dt);
    },

    initListener: function () {
        //Add function to others event
        dispatcherMgr.addListener(LobbyMgr.EVENT_ON_ENTER_FINISH, this, this.onEnterLobby);
        dispatcherMgr.addListener(ReceivedManager.EVENT_CLOSE_GUI, this, VipManager.checkShowUpLevelVip);

        //Add event to my functions
    },

    onEnterLobby: function () {
        this.checkShowDailyBonus();
        this.sendGetVipInfo();
    },

    setConfig: function (config) {
        cc.log("THE VIP CONFIG", JSON.stringify(config));
        this.vipConfig = [];
        var vObj = config["VIP"];
        var spObj = config["beanSuports"];
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
        this.setBenefitConfig(config["VIPBenefit"]);
        this.setOldVipConfig(config["OldVIP"]);
        this.setRatioGstarToVpoint(config["VIP"]["convertGstar"]);
        this.setNumberVip(size);
        this.setBeanNeedSupportConfig(config["BeanNeedSupport"]);
    },

    resetData: function () {
        this.vipLevel = 0;
        this.remainTime = 0;
        this.vPoint = 0;
        this.dailyBonusGold = 0;
        this.dataSave = null;
        this.dataConvert = null;
        this.isWaitingEffect = false;
        this.oldConfig = null;
        this.ratioGstarToVpoint = 1;
        this.beanNeedSupportConfig = null;
    },

    // cap nhat data sau khi dien Effect
    // -> neu ko duoc dien Effect
    // -> Ko update Data
    // -> can Update Data truoc khi mo lai gui co thong tin VIP
    updateFromSaveData: function () {
        if (!this.dataSave) return;
        this.setRemainTime(this.dataSave.remainTime);
        this.setVipLevel(this.dataSave.vipLevel);
        this.setVpoint(this.dataSave.vPoint);
    },

    saveInfoVip: function (data) {
        if (!data) return;
        this.dataSave = data;
        cc.log("WAITING EFFECT **** ");
    },

    saveConvertInfo: function (data) {
        var vPoint = parseFloat(data.vPointG) + parseFloat(data.vPointV);
        if (vPoint === 0) {
            var confirm = new CmdSendConfirmFinishConvertOldVip();
            confirm.putData(0);
            GameClient.getInstance().sendPacket(confirm);
            confirm.clean();
            return;
        }
        this.dataConvert = data;
        var startLevel = 0;
        // cc.log("vPoint: ", vPoint, this.getVpointNeed(startLevel));
        while (vPoint >= this.getVpointNeed(startLevel) && startLevel < VipManager.NUMBER_VIP) {
            vPoint -= this.getVpointNeed(startLevel);
            // cc.log("vPoint1: ", vPoint);
            startLevel++;
        }
        var dataVip = {remainTime: data.remainTime, vipLevel: data.newLevel, vPoint: vPoint};
        this.saveInfoVip(dataVip);
    },

    saveDailyBonusGold: function (gold) {
        this.dailyBonusGold = gold;
    },

    checkShowDailyBonus: function () {
        var dailyBonus = this.getDailyBonusGold();

        if (dailyBonus) {
            receivedMgr.onReceivedGold(
                parseInt(dailyBonus),
                StringUtility.replaceAll(
                    LocalizedString.to("VIP_DAILY_BONUS"),
                    "@number",
                    vipMgr.getVipLevel()
                )
            );
            this.saveDailyBonusGold(0);
        }
    },

    getDailyBonusGold: function () {
        var listBenefit = vipMgr.getListBenefit(this.getVipLevel());
        var isDailyBonus = false;
        for (var i = 0; i < listBenefit.length; i++) {
            if (parseInt(listBenefit[i]["index"]) === VipManager.BENEFIT_GOLD_DAILY) {
                isDailyBonus = true;
            }
        }
        if (!isDailyBonus) return 0;
        return this.dailyBonusGold;
    },

    getDataConvert: function () {
        var data = this.dataConvert;
        if (data) {
            if (data["vPointG"] || data["vPointV"]) {
                return data;
            }
        }
        this.removeDataConvert();
        return null;
    },

    removeDataConvert: function () {
        this.dataConvert = null;
    },

    setBenefitConfig: function (benefitConfig) {
        this.benefitConfig = benefitConfig;
        cc.log("setBenefitConfig: ", JSON.stringify(this.benefitConfig));
    },

    getBenefitConfig: function () {
        return this.benefitConfig;
    },

    setOldVipConfig: function (oldVipConfig) {
        this.oldConfig = oldVipConfig;
        cc.log("setOldVipConfig: ", JSON.stringify(this.oldConfig));
    },

    getOldVipConfig: function () {
        return this.oldConfig;
    },

    setRatioGstarToVpoint: function (ratio) {
        this.ratioGstarToVpoint = ratio;
    },

    getRatioGstarToVpoint: function () {
        return this.ratioGstarToVpoint;
    },

    setNumberVip: function (number) {
        VipManager.NUMBER_VIP = number - 1;
    },

    setBeanNeedSupportConfig: function (config) {
        this.beanNeedSupportConfig = config;
        cc.log("beanNeedSupportConfig: ", JSON.stringify(this.beanNeedSupportConfig));
    },

    getBeanNeedSupportConfig: function () {
        return this.beanNeedSupportConfig;
    },

    getListLockTypeBenefit: function () {
        var listLock = [];
        var benefitConfig = this.getBenefitConfig();
        if (benefitConfig) {
            var types = benefitConfig.type;
            for (var i in types) {
                if (types[i]["isKey"]) {
                    listLock.push(parseInt(i));
                }
            }
        }
        return listLock;
    },

    // index of benefit
    getListBenefitHave: function (vipLevel, isOldVip) {
        var listBenefit = [];
        var benefitConfig = isOldVip ? this.getOldVipConfig() : this.getBenefitConfig();
        if (benefitConfig) {
            var packages = benefitConfig["package"];
            var benefit = packages[vipLevel + ""];
            for (var key in benefit) {
                if (benefit[key] && (key !== "0" && key !== "8")) {
                    listBenefit.push(parseInt(key));
                }
            }
        }
        return listBenefit;
    },

    getListBenefit: function (vipLevel, isOldVip, isGetFull) {
        var listBenefit = [];
        var benefitConfig = isOldVip ? this.getOldVipConfig() : this.getBenefitConfig();
        if (benefitConfig) {
            var packages = benefitConfig["package"];
            var benefit = packages[vipLevel + ""];
            for (var key in benefit) {
                if ((isGetFull || benefit[key]) && (key !== "0" && key !== "8")) {
                    listBenefit.push({index: key, value: benefit[key]});
                }
            }
        }
        // cc.log("benefit: ", vipLevel, JSON.stringify(listBenefit));
        return listBenefit;
    },

    getBenefitName: function (type) {
        var name = "";
        var benefitConfig = this.getBenefitConfig();
        if (benefitConfig) {
            var types = benefitConfig.type;
            return types[type + ""]["name"];
        }
        return name;
    },

    getIsLock: function (type) {
        var benefitConfig = this.getBenefitConfig();
        if (benefitConfig) {
            var types = benefitConfig.type;
            return types[type + ""]["isKey"];
        }
        return false;
    },

    getIsOneTimeReceived: function (type) {
        switch (parseInt(type)) {
            case VipManager.BENEFIT_GOLD_INSTANT:
            case VipManager.BENEFIT_HOUR_INSTANT:
                return true;
        }
        return false;
    },

    getBenefitImage: function (type) {
        type = parseInt(type);
        var folder = "res/Lobby/Vip/benefit/";
        switch (type) {
            case VipManager.BENEFIT_GOLD_INSTANT:
                folder += "gold.png";
                break;
            case VipManager.BENEFIT_GOLD_DAILY:
                folder += "daily.png";
                break;
            case VipManager.BENEFIT_GOLD_SUPPORT:
                folder += "dailySupport.png";
                break;
            case VipManager.BENEFIT_BONUS_SHOP:
                folder += "shop.png";
                break;
            case VipManager.BENEFIT_SPECIAL_EFFECT:
                folder += "effect.png";
                break;
            case VipManager.BENEFIT_SPECIAL_INTERACTION:
                folder += "interact.png";
                break;
            case VipManager.BENEFIT_BONUS_TAX:
                folder += "tax.png";
                break;
            case VipManager.BENEFIT_BONUS_SPIN:
                folder += "luckyBonus.png";
                break;
            case VipManager.BENEFIT_HOUR_INSTANT:
                folder += "time.png";
                break;
            default:
                folder += "gold.png";
                break;
        }
        return folder;
    },

    getValueBenefit: function (type, value, isUpLevelGUI) {
        var result = "";
        switch (parseInt(type)) {
            case VipManager.BENEFIT_GOLD_SUPPORT:
                result = StringUtility.formatNumberSymbol(value["value"]) + " x " + value["num"];
                break;
            case VipManager.BENEFIT_BONUS_SHOP:
            case VipManager.BENEFIT_BONUS_TAX:
            case VipManager.BENEFIT_BONUS_SPIN:
                result = value + "%";
                break;
            case VipManager.BENEFIT_SPECIAL_EFFECT:
            case VipManager.BENEFIT_SPECIAL_INTERACTION:
            case VipManager.BENEFIT_BONUS_FANPAGE:
                result = localized("VIP_TURN_ON");
                break;
            case VipManager.BENEFIT_HOUR_INSTANT:
                var str = localized("VIP_FORMAT_DAY");
                result = StringUtility.replaceAll(str, "@day", value);
                break;
            default:
                result = StringUtility.formatNumberSymbol(value);
                break;
        }
        return result;
    },

    getValuePhrase: function (type, value) {
        var result = null;
        switch (parseInt(type)) {
            case VipManager.BENEFIT_GOLD_INSTANT:
            case VipManager.BENEFIT_GOLD_DAILY:
                result = {
                    phrase: "@number",
                    type: EffectMgr.TYPE_NUMBER_FORMAT
                }
                break;
            case VipManager.BENEFIT_GOLD_SUPPORT:
                result = {
                    phrase: "@numberx" + value["num"],
                    type: EffectMgr.TYPE_NUMBER_FORMAT
                }
                break;
            case VipManager.BENEFIT_HOUR_INSTANT:
                var str = localized("VIP_FORMAT_DAY");
                str = StringUtility.replaceAll(str, "@day", "@number");
                result = {
                    phrase: str,
                    type: EffectMgr.TYPE_NUMBER
                }
                break;
            case VipManager.BENEFIT_BONUS_SPIN:
            case VipManager.BENEFIT_BONUS_SHOP:
            case VipManager.BENEFIT_BONUS_TAX:
                result = {
                    phrase: "@number%",
                    type: EffectMgr.TYPE_NUMBER
                }
                break;
            default:
                result = null;
                break;
        }
        return result;
    },

    getDataSave: function () {
        return this.dataSave;
    },

    getRemainTime: function () {
        return Math.max(0, this.remainTime);
    },

    getVipLevel: function () {
        return this.vipLevel;
    },

    getRealVipLevel: function () {
        var dataSave = this.getDataSave();
        if (dataSave) {
            return dataSave.vipLevel;
        }
        return this.vipLevel;
    },

    getRealVipVpoint: function () {
        var dataSave = this.getDataSave();
        if (dataSave) {
            return dataSave.vPoint;
        }
        return this.vPoint;
    },

    getVpoint: function () {
        return parseFloat(this.vPoint);
    },

    // lay so vpoint can thiet de len level tiep theo cua level
    getVpointNeed: function (level) {
        try {
            // cc.log("level: ", level);
            if (level >= VipManager.NUMBER_VIP) level = VipManager.NUMBER_VIP - 1;
            return parseFloat(this.vipConfig[level + 1].price);
        } catch (e) {
            cc.error("getVpointNeed: ", e);
            return 1;
        }
    },

    getTotalVpointNeeded: function (level) {
        try {
            if (level >= VipManager.NUMBER_VIP) level = VipManager.NUMBER_VIP - 1;
            var result = 0;
            for (var i = 0; i <= level; i++) {
                result += parseInt(this.vipConfig[i + 1].price);
            }
            return result;
        } catch (e) {
            cc.error("getTotalVpointNeed: ", e);
            return 1;
        }
    },

    getLevelCanUseItem: function () {
        var levelVipCanInteract = 0;
        for (var i = 0; i < VipManager.NUMBER_VIP; i++) {
            var benefitHave = this.getListBenefitHave(i, false);
            if (benefitHave.indexOf(VipManager.TYPE_BENEFIT_INTERACT_ITEM) >= 0) {
                levelVipCanInteract = i;
                break;
            }
        }
        return levelVipCanInteract;
    },

    setRemainTime: function (remainTime) {
        this.remainTime = remainTime;
    },

    setVipLevel: function (vipLevel) {
        this.vipLevel = vipLevel;
    },

    setVpoint: function (vPoint) {
        this.vPoint = vPoint;
    },

    setWaiting: function (isWaiting) {
        this.isWaitingEffect = isWaiting;
        if (!isWaiting) {
            var dataSave = this.getDataSave();
            cc.log("dataSave: ", JSON.stringify(dataSave));
            this.saveInfoVip(dataSave);
        }
    },

    isVip: function () {
        return (this.getRealVipLevel() > 0);
    },

    updateTimeVip: function (dt) {
        var remainTime = this.getRemainTime();
        if (remainTime <= 0) {
            return;
        }
        remainTime -= dt * 1000;
        this.setRemainTime(remainTime);
        if (remainTime <= 0) {
            var cmdEvent = new CmdSendRequestEventShop();
            GameClient.getInstance().sendPacket(cmdEvent);
        }
    },

    sendGetVipInfo: function () {
        var getInfoVip = new CmdSendGetVipInfo();
        GameClient.getInstance().sendPacket(getInfoVip);
        getInfoVip.clean();
    },

    showVipProgress: function () {

    },

    onReceived: function (cmd, data) {
        switch (cmd) {
            case VipManager.CMD_VIP_INFO: {
                var vipInfo = new CmdReceiveNewVipInfo(data);
                cc.log("newVipInfo: ", JSON.stringify(vipInfo));

                if (!this.dataSave) {
                    this.saveInfoVip(vipInfo);
                    this.updateFromSaveData();
                } else {
                    this.saveInfoVip(vipInfo);
                }
                break;
            }
            case VipManager.CMD_CONVERT_OLD_VIP: {
                var convertVipInfo = new CmdReceiveConvertOldVip(data);
                // cc.log("convertVipInfo: ", JSON.stringify(convertVipInfo));
                this.saveConvertInfo(convertVipInfo);
                break;
            }
            case VipManager.CMD_DAILY_BONUS: {
                var dailyBonus = new CmdReceiveDailyBonusGold(data);
                cc.log("dailyBonus VIP: ", JSON.stringify(dailyBonus));
                this.saveDailyBonusGold(parseInt(dailyBonus.dailyBonus));
                this.checkShowDailyBonus();
                break;
            }
            case VipManager.CMD_CHEAT_OLD_VIP:
            case VipManager.CMD_CHEAT_NEW_VIP: {
                var resultCheat = new CmdReceiveCheatVipNew(data);
                var result = resultCheat.getError() ? "fail" : "success";
                Toast.makeToast(ToastFloat.MEDIUM, "Cheat " + result);
                break;
            }
        }
    }
});

VipManager.getLevelWithVpoint = function (vPoint) {
    var startLevel = 0;
    while (vPoint >= VipManager.getInstance().getVpointNeed(startLevel) && startLevel < VipManager.NUMBER_VIP) {
        vPoint -= VipManager.getInstance().getVpointNeed(startLevel);
        startLevel++;
    }
    return startLevel--;
};

VipManager.getRemainVpoint = function (vPoint) {
    var startLevel = 0;
    while (vPoint >= VipManager.getInstance().getVpointNeed(startLevel) && startLevel < VipManager.NUMBER_VIP) {
        vPoint -= VipManager.getInstance().getVpointNeed(startLevel);
        startLevel++;
    }
    return vPoint;
};

VipManager.getRemainTimeString = function (remainTime, isNewFormat) {
    var totalSeconds = Math.floor(remainTime / 1000);
    var numSeconds = totalSeconds % 60;
    var totalMinutes = Math.floor(totalSeconds / 60);
    var numMinutes = totalMinutes % 60;
    var totalHour = Math.floor(totalMinutes / 60);
    var numHours = totalHour % 24;
    var totalDay = Math.floor(totalHour / 24);

    var keyDay = isNewFormat ? "VIP_FORMAT_DAY_2" : "VIP_FORMAT_DAY";
    var keyHour = isNewFormat ? "VIP_FORMAT_HOURS_2" : "VIP_FORMAT_HOURS";
    var keyMinute = isNewFormat ? "VIP_FORMAT_MINUTES_2" : "VIP_FORMAT_MINUTES";
    var keySecond = isNewFormat ? "VIP_FORMAT_SECONDS_2" : "VIP_FORMAT_SECONDS";
    var strDays = StringUtility.replaceAll(localized(keyDay), "@day", totalDay);
    var strHours = StringUtility.replaceAll(localized(keyHour), "@hour", numHours);
    var strMinutes = StringUtility.replaceAll(localized(keyMinute), "@minute", numMinutes);
    var strSeconds = StringUtility.replaceAll(localized(keySecond), "@second", numSeconds);

    var remainTimeStr = "";
    var enoughInfoTime = false;
    if (totalDay > 0) {
        remainTimeStr += strDays;
        remainTimeStr += strHours;
        enoughInfoTime = true;
    }

    if (numHours > 0 && !enoughInfoTime) {
        remainTimeStr += strHours;
        remainTimeStr += strMinutes;
        enoughInfoTime = true;
    }

    if (numMinutes > 0 && !enoughInfoTime) {
        remainTimeStr += strMinutes;
        remainTimeStr += strSeconds;
        enoughInfoTime = true;
    }

    if (!enoughInfoTime && numSeconds > 0) {
        remainTimeStr += strSeconds;
    }

    if (remainTimeStr === "") {
        remainTimeStr = localized("VIP_TIME_UP");
    }

    return remainTimeStr;
};

VipManager.getIconVip = function (vipLevel) {
    if (vipLevel < 1 || vipLevel > VipManager.NUMBER_VIP) {
        return "";
    }
    return "res/Lobby/Vip/iconVip/iconVip" + vipLevel + ".png";
};

VipManager.getDisableIconVip = function (vipLevel) {
    if (vipLevel < 1 || vipLevel > VipManager.NUMBER_VIP) {
        return "";
    }
    return "res/Lobby/Vip/bgIconVip/bgIconVip" + vipLevel + ".png";
};

VipManager.getImageVip = function (vipLevel) {
    if (vipLevel < 1 || vipLevel > VipManager.NUMBER_VIP) {
        return "res/Lobby/Vip/imgVipFree.png";
    }
    return "res/Lobby/Vip/iconVipNormal/iconVipNormal" + vipLevel + ".png";
};

VipManager.getImageUpVip = function (vipLevel, isWhite) {
    if (vipLevel < 1 || vipLevel > VipManager.NUMBER_VIP) {
        return "res/Lobby/Vip/imgVipFree.png";
    }
    return "res/Lobby/Vip/imgUpLevel/imgUpVip" + vipLevel + (isWhite ? "_w" : "") + ".png";
};

VipManager.getIconVpoint = function () {
    return "res/Lobby/Vip/iconVpoint.png";
};

VipManager.getIconHour = function () {
    return "res/Lobby/Vip/iconTime.png";
};

VipManager.preloadResource = function () {
    var folder = "res/Lobby/Vip/";
    LocalizedString.add(folder + "VipLocalized_vi");

    db.DBCCFactory.getInstance().loadDragonBonesData(folder + "animation/Gem/skeleton.xml", "Gem");
    db.DBCCFactory.getInstance().loadTextureAtlas(folder + "animation/Gem/texture.plist", "Gem");

    db.DBCCFactory.getInstance().loadDragonBonesData(folder + "animation/Highlight/skeleton.xml", "Highlight");
    db.DBCCFactory.getInstance().loadTextureAtlas(folder + "animation/Highlight/texture.plist", "Highlight");

    db.DBCCFactory.getInstance().loadDragonBonesData(folder + "animation/HighlightBig/skeleton.xml", "HighlightBig");
    db.DBCCFactory.getInstance().loadTextureAtlas(folder + "animation/HighlightBig/texture.plist", "HighlightBig");
};

VipManager.checkNotifyNewVip = function () {
    var installDate = new Date(VipManager.changeFormatDate(gameMgr.getInstallDate()));
    var installTime = installDate.getTime();

    var releaseDay = new Date(VipManager.changeFormatDate(VipManager.RELEASE_DATE));
    var releaseTime = releaseDay.getTime();

    var thisTime = new Date().getTime();
    var oneMonthAfterRelease = releaseTime + 1000 * 86400 * 30;

    var dataConvert = VipManager.getInstance().getDataConvert();

    return (releaseTime > installTime && thisTime < oneMonthAfterRelease && !VipManager.getHasViewNewVip() || !!dataConvert);
};

VipManager.changeFormatDate = function (date) {
    var arrTime = date.split("-");
    return arrTime[1] + "/" + arrTime[0] + "/" + arrTime[2];
};

VipManager.getHasViewNewVip = function () {
    var keySave = "has_view_new_vip";
    var strHasViewed = cc.sys.localStorage.getItem(keySave);
    return !!strHasViewed;
};

VipManager.viewedNewVip = function () {
    var keySave = "has_view_new_vip";
    cc.sys.localStorage.setItem(keySave, "true");
};

VipManager.openVip = function (oldScene) {
    if (vipMgr.getVipLevel() > 0) {
        sceneMgr.openScene(VipScene.className, oldScene);
    } else {
        sceneMgr.openGUI(VipStarter.className);
    }
};

VipManager.effectVipShopInfo = function (scene, isEffect) {
    var nVip = scene._layout.getChildByName("nVip");
    scene.pVip = scene.getControl("pVip", nVip);
    scene.pVip.setLocalZOrder(1);
    scene.customButton("btnEnterVip", ShopIapScene.BTN_VIP, scene.pVip);
    scene.bgProgressVip = scene.getControl("bgProgress", scene.pVip);
    scene.imgVpoint = scene.getControl("imgVpoint", scene.pVip);
    scene.imgVpoint.setVisible(false);
    scene.progressVip = scene.getControl("progressVip", scene.pVip);
    scene.txtProgress = scene.getControl("txtProgress", scene.pVip);
    scene.iconNextVip = scene.getControl("iconNextVip", scene.pVip);
    scene.iconCurVip = scene.getControl("iconCurVip", scene.pVip);
    scene.iconNextVip.ignoreContentAdaptWithSize(true);
    scene.iconCurVip.ignoreContentAdaptWithSize(true);
    scene.txtVip1 = scene.getControl("txtVip1", scene.pVip);
    scene.txtRemainVipTime = scene.getControl("txtRemainTime", scene.pVip);

    var levelVip = VipManager.getInstance().getVipLevel();
    scene.txtVip1.setVisible(levelVip > 0);
    scene.iconCurVip.setVisible(levelVip > 0);
    scene.txtRemainVipTime.setVisible(levelVip > 0);
    var titvarime = StringUtility.replaceAll(localized("VIP_SHOP_TEXT_0"), "@level", levelVip);
    scene.txtVip1.setString(titvarime);
    scene.txtRemainVipTime.setString(VipManager.getRemainTimeString(VipManager.getInstance().getRemainTime()));
    var txtTemp = BaseLayer.createLabelText(scene.txtVip1.getString());
    txtTemp.setFontSize(scene.txtVip1.getFontSize());
    scene.txtRemainVipTime.setPositionX(scene.txtVip1.getPositionX() + txtTemp.getContentSize().width + 3);

    var texture = VipManager.getIconVip(levelVip);
    if (texture !== "") {
        scene.iconCurVip.loadTexture(texture);
    }
    if (levelVip >= VipManager.NUMBER_VIP) {
        scene.iconNextVip.setVisible(false);
    } else {
        var texture2 = VipManager.getIconVip(levelVip + 1);
        if (texture2 !== "") {
            scene.iconNextVip.loadTexture(texture2);
        }
        scene.iconNextVip.setVisible(true);
    }

    var nextLevelExp = VipManager.getInstance().getVpointNeed(levelVip);
    var vpoint = VipManager.getInstance().getVpoint();
    // cc.log("vPoint: ", vpoint);
    if (isEffect) {
        VipSceneOld.runEffectProgressVip(scene.bgProgressVip, scene.progressVip, scene.txtProgress, scene.imgVpoint, 0.7, 0, vpoint, levelVip, scene.iconCurVip, scene.iconNextVip);
    } else {
        scene.txtProgress.setString(StringUtility.pointNumber(vpoint) + " / " + StringUtility.pointNumber(nextLevelExp));
        var percent = vpoint / nextLevelExp * 100;
        if (levelVip + 1 > VipManager.NUMBER_VIP) {
            scene.txtProgress.setString(StringUtility.pointNumber(vpoint));
            percent = 100;
        }
        scene.progressVip.setPercent(percent);
        scene.imgVpoint.setPositionX(scene.bgProgressVip.getContentSize().width * percent / 100);
    }
    scene.arrayDot = [];
    var padX = 22;
    var startX = 45;
    var startY = 12;
    for (var i = 0; i < 34; i++) {
        if (i < 12) {
            scene.arrayDot[i] = new ccui.ImageView("Lobby/Common/dotNormal.png");
            scene.arrayDot[i].setPosition(startX + padX * i, startY);
            scene.pVip.addChild(scene.arrayDot[i]);
        } else if (i > 16 && i < 29) {
            scene.arrayDot[i] = new ccui.ImageView("Lobby/Common/dotNormal.png");
            scene.arrayDot[i].setPosition(startX + padX * (28 - i), startY + 71);
            scene.pVip.addChild(scene.arrayDot[i]);
        } else {
            scene.arrayDot[i] = scene.getControl("dot" + i, scene.pVip);
        }
    }
};

VipManager.openChangeGoldSuccess = function (data, vpointGet, bonusTime, offerEvent, bonusDiamond) {
    var gui = sceneMgr.openGUI(VipChangeGoldSuccess.className);
    if (gui) {
        gui.setInfoChangeGold(data, vpointGet, bonusTime, offerEvent, bonusDiamond);
    }
};

VipManager.showUpLevelVip = function (oldLevel, newLevel) {
    cc.log("VipManager.showUpLevelVip");
    var scene = sceneMgr.openGUI(VipLevelUp.className);
    scene.setInfo(oldLevel, newLevel);
};

VipManager.showUpLevelVipBonus = function (oldLevel, newLevel) {
    var info = [];
    for (var i = oldLevel + 1; i <= newLevel; i++) {
        var listBenefit = vipMgr.getListBenefit(i);
        for (var j = 0; j < listBenefit.length; j++) {
            if (vipMgr.getIsOneTimeReceived(listBenefit[j]["index"])) {
                switch (parseInt(listBenefit[j]["index"])) {
                    case VipManager.BENEFIT_GOLD_INSTANT:
                        info.push(new ReceivedGUIData(
                            ReceivedCell.TYPE_GOLD,
                            listBenefit[j]["value"],
                            "Vàng"
                        ));
                        break;
                    case VipManager.BENEFIT_HOUR_INSTANT:
                        info.push(new ReceivedGUIData(
                            ReceivedCell.TYPE_VHOUR,
                            listBenefit[j]["value"] * 24,
                            "Giờ VIP"
                        ));
                        break;
                }
            }
        }
    }
    receivedMgr.setReceivedGUIInfo(info, LocalizedString.to("VIP_LEVEL_UP_INSTANT"));
    receivedMgr.openGUI();
};

VipManager.checkShowUpLevelVip = function () {
    cc.log("EVENT TO HERE checkCloseLevelUp");
    var gui = sceneMgr.getGUIByClassName(VipLevelUp.className);
    cc.log("IS THERE A GUI:", gui);
    if (gui && gui.isShow) {
        gui.effectReceived();
    }

    var vipLevel = VipManager.getInstance().getVipLevel();
    var newLevel = VipManager.getInstance().getRealVipLevel();
    cc.log("CHECK SHOW LEVEL UP", vipLevel, newLevel);
    if (newLevel > vipLevel) {
        VipManager.showUpLevelVip(vipLevel, newLevel);
    }
    vipMgr.updateFromSaveData();
}

VipManager.setNextLevelVip = function (data) {
    var vipLevel = VipManager.getInstance().getRealVipLevel();
    for (var i = 0; i < data.length; i++) {
        data[i].uptoLevelVip = 0;
    }
    if (vipLevel < VipManager.NUMBER_VIP) {
        var vPoint = VipManager.getInstance().getRealVipVpoint();
        var nextLevel = vipLevel + 1;
        for (var i = 0; i < data.length; i++) {
            var dataItem = data[i];
            if (dataItem.isOffer) continue;

            var totalVPoint = parseInt(vPoint) + dataItem.vPoint;
            var neededVPoint = 0;
            for (var level = vipLevel; level < nextLevel; level++)
                neededVPoint += VipManager.getInstance().getVpointNeed(level);
            while (true) {
                if (totalVPoint >= neededVPoint && neededVPoint > 0) {
                    data[i].uptoLevelVip = nextLevel;
                    nextLevel++;
                    if (nextLevel > VipManager.NUMBER_VIP) break;
                    else neededVPoint += VipManager.getInstance().getVpointNeed(nextLevel - 1);
                } else break;
            }
            if (nextLevel > VipManager.NUMBER_VIP) break;
        }
    }
}
VipManager.BENEFIT_GOLD_INSTANT = 1;
VipManager.BENEFIT_GOLD_DAILY = 2;
VipManager.BENEFIT_GOLD_SUPPORT = 3;
VipManager.BENEFIT_BONUS_SHOP = 4;
VipManager.BENEFIT_SPECIAL_EFFECT = 5;
VipManager.BENEFIT_SPECIAL_INTERACTION = 6;
VipManager.BENEFIT_BONUS_TAX = 7;
VipManager.BENEFIT_BONUS_FANPAGE = 8;
VipManager.BENEFIT_HOUR_INSTANT = 9;
VipManager.BENEFIT_BONUS_SPIN = 10;
VipManager.BENEFIT_ORDER = [
    -1,
    3, //VipManager.BENEFIT_GOLD_INSTANT
    1, //VipManager.BENEFIT_GOLD_DAILY
    0, //VipManager.BENEFIT_GOLD_SUPPORT
    6, //VipManager.BENEFIT_BONUS_SHOP
    7, //VipManager.BENEFIT_SPECIAL_EFFECT
    8, //VipManager.BENEFIT_SPECIAL_INTERACTION
    2, //VipManager.BENEFIT_BONUS_TAX
    5, //VipManager.BENEFIT_BONUS_FANPAGE
    4, //VipManager.BENEFIT_HOUR_INSTANT
    5, //VipManager.BENEFIT_BONUS_SPIN
];

VipManager.NUMBER_VIP = 10;
VipManager.NUMBER_BENEFIT = 10;

VipManager.TYPE_BENEFIT_INTERACT_ITEM = 6;

VipManager.RELEASE_DATE = "17-07-2020";

VipManager.EVENT_SHOW_VIP_PROGRESS = "vipMgrShowVIPProgress";
VipManager.instance = null;
VipManager.getInstance = function () {
    if (VipManager.instance == null) {
        VipManager.instance = new VipManager();
    }

    return VipManager.instance;
};

var vipMgr = VipManager.getInstance();

//----------------------------------------------------------------------------------------------------------------------

VipManager.CMD_VIP_INFO = 6022;
VipManager.CMD_CONVERT_OLD_VIP = 6021;
VipManager.CMD_DAILY_BONUS = 1030;
VipManager.CMD_CHEAT_OLD_VIP = 6023;
VipManager.CMD_CHEAT_NEW_VIP = 6024;

var CmdReceiveNewVipInfo = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.vPoint = this.getLong();
        this.vipLevel = this.getInt();
        this.remainTime = this.getLong();
    }
});

var CmdReceiveCheatVipNew = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    }
});

var CmdReceiveCheatVipOld = CmdReceivedCommon.extend({

    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    }
});

var CmdReceiveConvertOldVip = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.gstar = this.getLong();
        this.oldVip = this.getInt();
        this.oldTime = this.getLong();
        this.newLevel = this.getInt();
        this.vPointG = this.getLong();
        this.vPointV = this.getLong();
        this.remainTime = this.getLong();
        this.goldBonus = this.getLong();
    }
});

var CmdReceiveDailyBonusGold = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.dailyBonus = this.getLong();
    }
});

//----------------------------------------------------------------------------------------------------------------------

var CmdSendCheatNewVip = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(VipManager.CMD_CHEAT_NEW_VIP);
    },

    putData: function (level, vpoint, remainTime) {
        this.packHeader();
        this.putInt(level);
        this.putLong(vpoint);
        this.putLong(remainTime);
        this.updateSize();
    }
});

var CmdSendCheatOldVip = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(VipManager.CMD_CHEAT_OLD_VIP);
    },

    putData: function (level, gstar, remainTime) {
        this.packHeader();
        this.putInt(level);     // -1 normal, 0: vip week, 1: vip silver, 2: vip gold
        this.putLong(gstar);
        this.putLong(remainTime);
        this.updateSize();
    }
});

var CmdSendConfirmFinishConvertOldVip = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(VipManager.CMD_CONVERT_OLD_VIP);
    },

    putData: function (isError) {
        this.packHeader();
        this.putShort(isError);
        this.updateSize();
    }
});

var CmdSendGetVipInfo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(VipManager.CMD_VIP_INFO);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});