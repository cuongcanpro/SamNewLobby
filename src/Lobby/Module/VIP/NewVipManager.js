var NewVipManager = cc.Class.extend({
    ctor: function () {
        this.vipLevel = 0;
        this.remainTime = 0;
        this.vPoint = 0;
        this.dailyBonusGold = 0;
        this.dataSave = null;
        this.isWaitingEffect = false;
        this.dataConvert = null;

        this.oldConfig = null;
        this.ratioGstarToVpoint = 1;
        this.benefitConfig = null;
        this.beanNeedSupportConfig = null;
        NewVipManager.preloadResource();
        // this.dataConvert =  {"gstar":"1000","oldVip":1,"oldTime":"86334447","newLevel":0,"vPointG":"875","vPointV":"4400","remainTime":"86399999","goldBonus":"1000"};
        // this.saveDailyBonusGold(200000);
    },

    resetData: function(){
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

    // cap nhat data sau khi dien Effect -> neu ko duoc dien Effect -> Ko update Data -> can Update Data truoc khi mo lai gui co thong tin VIP
    updateFromSaveData: function () {
        this.isWaitingEffect = false;
        this.saveInfoVip(this.dataSave);
    },

    saveInfoVip: function(data){
        if (!data) return;
        // cc.log("saveInfoVip: ", JSON.stringify(data));
        if (this.isWaitingEffect){
            this.dataSave = data;
            cc.log("WAITING EFFECT **** ");
            return;
        }
        else {
            cc.log(" GAN LAI GIA TRI");
        }
        this.setRemainTime(data.remainTime);
        this.setVipLevel(data.vipLevel);
        this.setVpoint(data.vPoint);
        this.dataSave = null;
    },

    saveConvertInfo: function(data){
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
        while (vPoint >= this.getVpointNeed(startLevel) && startLevel < NewVipManager.NUMBER_VIP){
            vPoint -= this.getVpointNeed(startLevel);
            // cc.log("vPoint1: ", vPoint);
            startLevel++;
        }
        var dataVip = {remainTime: data.remainTime, vipLevel: data.newLevel, vPoint: vPoint};
        this.saveInfoVip(dataVip);
    },

    saveDailyBonusGold: function(gold){
        this.dailyBonusGold = gold;
    },

    getDailyBonusGold: function(){
        return this.dailyBonusGold;
    },

    getDataConvert: function(){
        var data = this.dataConvert;
        if (data){
            if (data["vPointG"] || data["vPointV"]){
                return data;
            }
        }
        this.removeDataConvert();
        return null;
    },

    removeDataConvert: function(){
        this.dataConvert = null;
    },

    setBenefitConfig: function(benefitConfig){
        this.benefitConfig = benefitConfig;
        cc.log("setBenefitConfig: ", JSON.stringify(this.benefitConfig));
    },

    getBenefitConfig: function(){
        return this.benefitConfig;
    },

    setOldVipConfig: function(oldVipConfig){
        this.oldConfig = oldVipConfig;
        cc.log("setOldVipConfig: ", JSON.stringify(this.oldConfig));
    },

    getOldVipConfig: function(){
        return this.oldConfig;
    },

    setRatioGstarToVpoint: function(ratio){
        this.ratioGstarToVpoint = ratio;
    },

    getRatioGstarToVpoint: function(){
        return this.ratioGstarToVpoint;
    },

    setNumberVip: function(number){
        NewVipManager.NUMBER_VIP = number - 1;
    },

    setBeanNeedSupportConfig: function(config){
        this.beanNeedSupportConfig = config;
        cc.log("beanNeedSupportConfig: ", JSON.stringify(this.beanNeedSupportConfig));
    },

    getBeanNeedSupportConfig: function(){
        return this.beanNeedSupportConfig;
    },

    getListLockTypeBenefit: function(){
        var listLock = [];
        var benefitConfig = this.getBenefitConfig();
        if (benefitConfig){
            var types = benefitConfig.type;
            for (var i in types){
                if (types[i]["isKey"]){
                    listLock.push(parseInt(i));
                }
            }
        }
        return listLock;
    },

    // index of benefit
    getListBenefitHave: function(vipLevel, isOldVip){
        var listBenefit = [];
        var benefitConfig = isOldVip ? this.getOldVipConfig() :this.getBenefitConfig();
        if (benefitConfig){
            var packages = benefitConfig["package"];
            var benefit = packages[vipLevel + ""];
            for (var key in benefit){
                if (benefit[key] && (key !== "0" && key !== "8")){
                    listBenefit.push(parseInt(key));
                }
            }
        }
        return listBenefit;
    },

    getListBenefit: function(vipLevel, isOldVip, isGetFull){
        var listBenefit = [];
        var benefitConfig = isOldVip ? this.getOldVipConfig() : this.getBenefitConfig();
        if (benefitConfig){
            var packages = benefitConfig["package"];
            var benefit = packages[vipLevel + ""];

            for (var key in benefit){
                if ((isGetFull || benefit[key]) && (key !== "0" && key !== "8")){
                    listBenefit.push({index: key, value:benefit[key]});
                }
            }
        }
        // cc.log("benefit: ", vipLevel, JSON.stringify(listBenefit));
        return listBenefit;
    },

    getBenefitName: function(type){
        var name = "";
        var benefitConfig = this.getBenefitConfig();
        if (benefitConfig){
            var types = benefitConfig.type;
            return types[type + ""]["name"];
        }
        return name;
    },

    getIsLock: function(type){
        var benefitConfig = this.getBenefitConfig();
        if (benefitConfig){
            var types = benefitConfig.type;
            return types[type + ""]["isKey"];
        }
        return false;
    },

    getImageBenefit: function(type){
        type = parseInt(type);
        var folder = "res/Lobby/GUIVipNew/";
        switch (type) {
            case 4:
            case 7:
            case 1:{
                return folder + "typeMoney.png";
            }
            case 2:{
                return folder + "typeDate.png";
            }
            case 3:{
                return folder + "typeSupport.png";
            }
            case 5:
            case 6:
            case 8:
            case 9:{
                return folder + "typeVipTime.png";
            }
            default:{
                return folder + "type0.png";
            }
        }
    },

    getValueBenefit: function(type, value, isUpLevelGUI){
        if (type === "3"){ // ho tro hang ngay
            return StringUtility.formatNumberSymbol(value["value"]) + " x " + value["num"];
        } else if (type === "9" ){ // bonus ngay vip
            var str = localized("VIP_FORMAT_DAY");
            return StringUtility.replaceAll(str, "@day", value);
        } else if (type === "4" || type === "7"){ // bonus shop & giam phe
            return value + "%";
        } else if (type === "5" || type === "6" || type === "8"){
            if (isUpLevelGUI) {
                return "";
            }
            return localized("VIP_TURN_ON");
        }
        return StringUtility.formatNumberSymbol(value);
    },

    getDataSave: function(){
        return this.dataSave;
    },

    getRemainTime: function () {
        return Math.max(0, this.remainTime);
    },

    getVipLevel: function(){
        return this.vipLevel;
    },

    getRealVipLevel: function(){
        var dataSave = this.getDataSave();
        if (dataSave){
            return dataSave.vipLevel;
        }
        return this.vipLevel;
    },

    getRealVipVpoint: function(){
        var dataSave = this.getDataSave();
        if (dataSave){
            return dataSave.vPoint;
        }
        return this.vPoint;
    },

    getVpoint: function(){
        return parseFloat(this.vPoint);
    },

    // lay so vpoint can thiet de len level tiep theo cua level
    getVpointNeed: function(level){
        try {
            // cc.log("level: ", level);
            if (level >= NewVipManager.NUMBER_VIP) level = NewVipManager.NUMBER_VIP - 1;
            return parseFloat(gamedata.gameConfig.vipConfig[level + 1].price);
        } catch (e) {
            cc.error("getVpointNeed: ", e);
            return 1;
        }
    },

    getLevelCanUseItem: function(){
        var levelVipCanInteract = 0;
        for (var i = 0; i < NewVipManager.NUMBER_VIP; i++){
            var benefitHave = this.getListBenefitHave(i, false);
            if (benefitHave.indexOf(NewVipManager.TYPE_BENEFIT_INTERACT_ITEM) >= 0){
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

    setWaiting: function(isWaiting){
        this.isWaitingEffect = isWaiting;
        if (!isWaiting){
            var dataSave = this.getDataSave();
            cc.log("dataSave: ", JSON.stringify(dataSave));
            this.saveInfoVip(dataSave);
        }
    },

    isVip: function(){
        return (this.getRealVipLevel() > 0);
    },

    onReceive: function (cmd, data) {
        switch (cmd) {
            case NewVipManager.CMD_VIP_INFO: {
                var vipInfo = new CmdReceiveNewVipInfo(data);
                cc.log("newVipInfo: ", JSON.stringify(vipInfo));
                this.saveInfoVip(vipInfo);
                break;
            }
            case NewVipManager.CMD_CONVERT_OLD_VIP: {
                var convertVipInfo = new CmdReceiveConvertOldVip(data);
                // cc.log("convertVipInfo: ", JSON.stringify(convertVipInfo));
                this.saveConvertInfo(convertVipInfo);
                break;
            }
            case NewVipManager.CMD_DAILY_BONUS:{
                var dailyBonus = new CmdReceiveDailyBonusGold(data);
                // cc.log("dailyBonus: ", JSON.stringify(dailyBonus));
                this.saveDailyBonusGold(parseFloat(dailyBonus.dailyBonus));
                var scene = sceneMgr.getRunningScene().getMainLayer();
                if (scene instanceof LobbyScene){
                    if (popUpManager.canShow(PopUpManager.DAILY_BONUS_VIP)) {
                        var gui = sceneMgr.openGUI(VipDailyGoldBonusGUI.className, PopUpManager.DAILY_BONUS_VIP, PopUpManager.DAILY_BONUS_VIP);
                        gui.setInfoDailyBonus(dailyBonus.dailyBonus);
                    }
                }
                break;
            }
            case NewVipManager.CMD_CHEAT_OLD_VIP:
            case NewVipManager.CMD_CHEAT_NEW_VIP:{
                var resultCheat = new CmdReceiveCheatVipNew(data);
                var result = resultCheat.getError() ? "fail" : "success";
                Toast.makeToast(ToastFloat.MEDIUM, "Cheat " + result);
                break;
            }
        }
    },

    updateTimeVip: function (dt) {
        var remainTime = this.getRemainTime();
        if (remainTime <= 0){
            return;
        }
        remainTime -= dt * 1000;
        this.setRemainTime(remainTime);
        if (remainTime <= 0){
            var cmdEvent = new CmdSendRequestEventShop();
            GameClient.getInstance().sendPacket(cmdEvent);
        }
    }
});

NewVipManager.getLevelWithVpoint = function(vPoint){
    var startLevel = 0;
    while (vPoint >= NewVipManager.getInstance().getVpointNeed(startLevel) && startLevel < NewVipManager.NUMBER_VIP){
        vPoint -= NewVipManager.getInstance().getVpointNeed(startLevel);
        startLevel++;
    }
    return startLevel--;
};

NewVipManager.getRemainVpoint = function(vPoint){
    var startLevel = 0;
    while (vPoint >= NewVipManager.getInstance().getVpointNeed(startLevel) && startLevel < NewVipManager.NUMBER_VIP){
        vPoint -= NewVipManager.getInstance().getVpointNeed(startLevel);
        startLevel++;
    }
    return vPoint;
};

NewVipManager.getRemainTimeString = function(remainTime, isNewFormat){
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
    if (totalDay > 0){
        remainTimeStr += strDays;
        remainTimeStr += strHours;
        enoughInfoTime = true;
    }

    if (numHours > 0 && !enoughInfoTime){
        remainTimeStr += strHours;
        remainTimeStr += strMinutes;
        enoughInfoTime = true;
    }

    if (numMinutes > 0 && !enoughInfoTime){
        remainTimeStr += strMinutes;
        remainTimeStr += strSeconds;
        enoughInfoTime = true;
    }

    if (!enoughInfoTime && numSeconds > 0){
        remainTimeStr += strSeconds;
    }

    if (remainTimeStr === ""){
        remainTimeStr = localized("VIP_TIME_UP");
    }

    return remainTimeStr;
};

NewVipManager.getIconVip = function (vipLevel) {
    if (vipLevel < 1 || vipLevel > NewVipManager.NUMBER_VIP){
        return "";
    }
    return "res/Lobby/GUIVipNew/iconVip/iconVip" + vipLevel + ".png";
};

NewVipManager.getDisableIconVip = function (vipLevel) {
    if (vipLevel < 1 || vipLevel > NewVipManager.NUMBER_VIP){
        return "";
    }
    return "res/Lobby/GUIVipNew/bgIconVip/bgIconVip" + vipLevel + ".png";
};

NewVipManager.getImageVip = function (vipLevel) {
    if (vipLevel < 1 || vipLevel > NewVipManager.NUMBER_VIP){
        return "res/Lobby/GUIVipNew/imgVipFree.png";
    }
    return "res/Lobby/GUIVipNew/iconVipNormal/iconVipNormal" + vipLevel + ".png";
};

NewVipManager.getImageUpVip = function (vipLevel) {
    if (vipLevel < 1 || vipLevel > NewVipManager.NUMBER_VIP){
        return "res/Lobby/GUIVipNew/imgVipFree.png";
    }
    return "res/Lobby/GUIVipNew/imgUpLevel/imgUpVip" + vipLevel + ".png";
};

NewVipManager.preloadResource = function(){
    var folder = "res/Lobby/GUIVipNew/vipRes/";
    LocalizedString.add(folder + "VipLocalized_vi");

    // cc.spriteFrameCache.addSpriteFrames("Event/PotBreakerRes/gold.plist");

    db.DBCCFactory.getInstance().loadDragonBonesData(folder + "Ngoc1/skeleton.xml","Ngoc1");
    db.DBCCFactory.getInstance().loadTextureAtlas(folder + "Ngoc1/texture.plist", "Ngoc1");

    db.DBCCFactory.getInstance().loadDragonBonesData(folder + "Highlight/skeleton.xml","Highlight");
    db.DBCCFactory.getInstance().loadTextureAtlas(folder + "Highlight/texture.plist", "Highlight");

    db.DBCCFactory.getInstance().loadDragonBonesData(folder + "HighlightBig/skeleton.xml","HighlightBig");
    db.DBCCFactory.getInstance().loadTextureAtlas(folder + "HighlightBig/texture.plist", "HighlightBig");
};

NewVipManager.checkNotifyNewVip = function(){
    var installDate = new Date(NewVipManager.changeFormatDate(gamedata.getInstallDate()));
    var installTime = installDate.getTime();

    var releaseDay = new Date(NewVipManager.changeFormatDate(NewVipManager.RELEASE_DATE));
    var releaseTime = releaseDay.getTime();

    var thisTime = new Date().getTime();
    var oneMonthAfterRelease = releaseTime + 1000*86400*30;

    var dataConvert = NewVipManager.getInstance().getDataConvert();

    return (releaseTime > installTime && thisTime < oneMonthAfterRelease && !NewVipManager.getHasViewNewVip() || !!dataConvert);
};

NewVipManager.changeFormatDate = function(date){
    var arrTime = date.split("-");
    return arrTime[1] + "/" + arrTime[0] + "/" + arrTime[2];
};

NewVipManager.getHasViewNewVip = function(){
    var keySave = "has_view_new_vip";
    var strHasViewed = cc.sys.localStorage.getItem(keySave);
    return !!strHasViewed;
};

NewVipManager.viewedNewVip = function(){
    var keySave = "has_view_new_vip";
    cc.sys.localStorage.setItem(keySave, "true");
};

NewVipManager.openVip = function(oldScene){
    var scene = sceneMgr.getRunningScene().getMainLayer();
    if (scene instanceof LobbyScene && NewVipManager.checkNotifyNewVip()) {
        sceneMgr.openGUI(VipIntroGUI.className);
        return;
    }
    sceneMgr.openScene(NewVipScene.className, oldScene);
};

NewVipManager.effectVipShopInfo = function(scene, isEffect){
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

    var levelVip = NewVipManager.getInstance().getVipLevel();
    scene.txtVip1.setVisible(levelVip > 0);
    scene.iconCurVip.setVisible(levelVip > 0);
    scene.txtRemainVipTime.setVisible(levelVip > 0);
    var titvarime = StringUtility.replaceAll(localized("VIP_SHOP_TEXT_0"), "@level", levelVip);
    scene.txtVip1.setString(titvarime);
    scene.txtRemainVipTime.setString(NewVipManager.getRemainTimeString(NewVipManager.getInstance().getRemainTime()));
    var txtTemp = BaseLayer.createLabelText(scene.txtVip1.getString());
    txtTemp.setFontSize(scene.txtVip1.getFontSize());
    scene.txtRemainVipTime.setPositionX(scene.txtVip1.getPositionX() + txtTemp.getContentSize().width + 3);

    var texture = NewVipManager.getIconVip(levelVip);
    if (texture !== ""){
        scene.iconCurVip.loadTexture(texture);
    }
    if (levelVip >= NewVipManager.NUMBER_VIP){
        scene.iconNextVip.setVisible(false);
    } else {
        var texture2 = NewVipManager.getIconVip(levelVip + 1);
        if (texture2 !== ""){
            scene.iconNextVip.loadTexture(texture2);
        }
        scene.iconNextVip.setVisible(true);
    }

    var nextLevelExp = NewVipManager.getInstance().getVpointNeed(levelVip);
    var vpoint = NewVipManager.getInstance().getVpoint();
    // cc.log("vPoint: ", vpoint);
    if (isEffect){
        NewVipScene.runEffectProgressVip(scene.bgProgressVip, scene.progressVip, scene.txtProgress, scene.imgVpoint, 0.7, 0, vpoint, levelVip, scene.iconCurVip, scene.iconNextVip);
    } else {
        scene.txtProgress.setString(StringUtility.pointNumber(vpoint) + " / " + StringUtility.pointNumber(nextLevelExp));
        var percent = vpoint / nextLevelExp * 100;
        if (levelVip + 1 > NewVipManager.NUMBER_VIP){
            scene.txtProgress.setString(StringUtility.pointNumber(vpoint));
            percent = 100;
        }
        scene.progressVip.setPercent(percent);
        scene.imgVpoint.setPositionX(scene.bgProgressVip.getContentSize().width * percent / 100);
    }
    //
    //
    //

};

NewVipManager.openChangeGoldSuccess = function(data, vpointGet, bonusTime, offerEvent, bonusDiamond){
    var gui =sceneMgr.openGUI(VipChangeGoldSuccess.className);
    if (gui){
        gui.setInfoChangeGold(data, vpointGet, bonusTime, offerEvent, bonusDiamond);
    }
};

NewVipManager.showUpLevelVip = function(oldLevel, newLevel){
    cc.log("NewVipManager.showUpLevelVip");
    var scene = sceneMgr.openGUI(VipUpLevelGUI.className);
    scene.setChangeBenefit(oldLevel, newLevel);
};

NewVipManager.checkShowUpLevelVip = function () {
    cc.log("CHECK SHOW LEVEL UP");
    var vipLevel = NewVipManager.getInstance().getVipLevel();
    var newLevel = NewVipManager.getInstance().getRealVipLevel();
    if (newLevel > vipLevel){
        NewVipManager.showUpLevelVip(vipLevel, newLevel);
    }
    NewVipManager.getInstance().setWaiting(false);
}

NewVipManager.NUMBER_VIP = 10;
NewVipManager.NUMBER_BENEFIT = 10;

NewVipManager.TYPE_BENEFIT_INTERACT_ITEM = 6;

NewVipManager.RELEASE_DATE = "17-07-2020";

NewVipManager.instance = null;

NewVipManager.getInstance = function () {
    if (NewVipManager.instance == null){
        NewVipManager.instance = new NewVipManager();
    }

    return NewVipManager.instance;
};

//----------------------------------------------------------------------------------------------------------------------

NewVipManager.CMD_VIP_INFO = 6022;
NewVipManager.CMD_CONVERT_OLD_VIP = 6021;
NewVipManager.CMD_DAILY_BONUS = 1030;
NewVipManager.CMD_CHEAT_OLD_VIP = 6023;
NewVipManager.CMD_CHEAT_NEW_VIP = 6024;

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
        this.setCmdId(NewVipManager.CMD_CHEAT_NEW_VIP);
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
        this.setCmdId(NewVipManager.CMD_CHEAT_OLD_VIP);
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
        this.setCmdId(NewVipManager.CMD_CONVERT_OLD_VIP);
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
        this.setCmdId(NewVipManager.CMD_VIP_INFO);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});