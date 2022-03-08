var GameData = cc.Class.extend({

    ctor: function () {
        this.userData = {};
    },

    openShop: function (waiting, callback, defaultTab) {
        paymentMgr.openShop(waiting, callback, defaultTab);
    },

    openShopTicket: function (waiting, callback) {
        paymentMgr.openShopTicket(waiting, callback);
    }
})

GameData.instance = null;
GameData.getInstance = function () {
    if (!GameData.instance) {
        GameData.instance = new GameData();
    }
    return GameData.instance;
};
var gamedata = GameData.getInstance();