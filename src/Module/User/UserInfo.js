var UserInfo = cc.Class.extend({
    ctor: function () {
        this.isHolding = false;
        this.enablepayment = true;

        // read user info
        this.avatar = "";
        this.displayName = "";
        this.userName = "";
        this.name = "";
        this.bean = 0;
        this.gold = 0;
        this.coin = 0;
        this.levelScore = 0;
        this.winCount = 0;
        this.lostCount = 0;
        this.star = 0;
        this.uID = "";
        this.level = 0;
        this.levelExp = 0;
        this.diamond = 0;
        this.isShopBonus = false;
        this.isShopIAPBonus = false;
        this.openID = "";
        this.bonusIAPTemp = false;
    },

    setGold: function (gold) {
        gamedata.userData.bean = gold;
        this.gold = gold;
    },

    setCoin: function (coin) {
        this.coin = coin;
        gamedata.userData.coin = coin;
    },

    setDiamond: function (diamond) {
        this.diamond = diamond;
    },

    setLevel: function (level) {
        this.level = level;
    },

    setLevelExp: function (levelExp) {
        this.levelExp = levelExp;
    },

    setUserName: function (userName) {
        this.userName = userName;
    },

    setDisplayName: function (displayName) {
        this.displayName = displayName;
        gamedata.userData.displayName = displayName;
    },

    setAvatar: function (avatar) {
        this.avatar = avatar;
        gamedata.userData.avatar = avatar;
    },

    setWinCount: function (winCount) {
        this.winCount = winCount;
    },

    setLostCount: function (lostCount) {
        this.lostCount = lostCount;
    },

    setUID: function (uID) {
        gamedata.userData.uID = uID;
        this.uID = uID;
    },

    setOpenID: function (openID) {
        this.openID =  openID;
    },

    getGold: function () {
        return this.gold;
    },

    getCoin: function () {
        return this.coin;
    },

    getDiamond: function () {
        return this.diamond;
    },

    getLevel: function () {
        return this.level;
    },

    getLevelExp: function () {
        return this.levelExp;
    },

    getUserName: function () {
        if (!this.userName)
            return this.getDisplayName();
        return this.userName;
    },

    getDisplayName: function () {
        return this.displayName;
    },

    getAvatar: function () {
        return this.avatar;
    },

    getWinCount: function () {
        return this.winCount;
    },

    getLostCount: function () {
        return this.lostCount;
    },

    getUID: function () {
        return this.uID;
    },

    getIsHolding: function () {
        return this.isHolding;
    },

    getOpenId: function () {
        return this.openID;
    },

    setUserInfo: function (info) {
        var strInfo = JSON.stringify(info);
        cc.log("+++setUserInfo " + strInfo.length + " : " + strInfo);
        // check payments


        // read user info
        this.setAvatar(info.avatar);
        this.setDisplayName(info.userName);
        this.setUserName(info.zName);
        this.setGold(info.gold);
        this.setCoin(info.zMoney);
        this.setLevelExp(info.levelExp);
        this.setWinCount(info.winCount);
        this.setLostCount(info.lostCount);
        this.setUID(info.uId);
        this.setLevel(info.level);
        this.setDiamond(info.diamond);


        // this.isShopBonus = info.isShopBonus;
        // this.isShopIAPBonus = info.isShopIAPBonus;
        // this.userData.openID = this.openID;
        //
        // if (Config.ENABLE_IAP_BONUS_TEMP)
        //     this.bonusIAPTemp = info.bonusIAPTemp;
    },

    setInfoFromRankInfo: function (rankInfo) {
        this.setGold(rankInfo.bean);
        this.setLevel(rankInfo.level);
        this.setWinCount(rankInfo.winCount);
        this.setLostCount(rankInfo.lostCount);
        this.setUID(rankInfo.uID);
        this.setDisplayName(rankInfo.displayName);
        this.setAvatar(rankInfo.avatar);
        this.rank = rankInfo.rank;
        this.goldMedal = rankInfo.goldMedal;
        this.silverMedal = rankInfo.silverMedal;
        this.bronzeMedal = rankInfo.bronzeMedal;

    }
})
