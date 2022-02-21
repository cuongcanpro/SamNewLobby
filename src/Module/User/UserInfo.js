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
        this.gold = gold;
    },

    setCoin: function (coin) {
        this.coin = coin;
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
    },

    setAvatar: function (avatar) {
        this.avatar = avatar;
    },

    setWinCount: function (winCount) {
        this.winCount = winCount;
    },

    setLostCount: function (lostCount) {
        this.lostCount = lostCount;
    },

    setUID: function (uID) {
        this.uID = uID;
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

    setUserInfo: function (info) {
        var strInfo = JSON.stringify(info);
        cc.log("+++setUserInfo " + strInfo.length + " : " + strInfo);
        // check payments
        if (!Config.ENABLE_SERVICE_ENABLE_PAYMENT) {
            paymentMgr.loadPayment(info.payments);
        }
        paymentMgr.loadConfig();

        // check holding
        this.isHolding = info.isHolding;
        this.enablepayment = info.enablePayment;

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