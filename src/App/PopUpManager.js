/**
 * Created by CPU12842-local on 11/12/2020.
 */

var PopUpManager = cc.Class.extend({
    ctor: function () {
        this.arrayPopUp = [];
        this.arrayUniqe = [PopUpManager.STARTUP, PopUpManager.DAILY_BONUS_VIP, PopUpManager.SUPPORT, PopUpManager.INPUT_INFORMATION, PopUpManager.SHOP_BONUS,
            PopUpManager.NOTIFY_OUT_GAME, PopUpManager.OFFER, PopUpManager.OFFER_ZALO];
    },

    addPopUp: function (id, data) {


    },

    resetPopUp: function () {
        this.arrayPopUp = [];
    },

    canShow: function (id) {
        if (this.arrayUniqe.indexOf(id) >= 0) {
            for (var i = 0; i < this.arrayPopUp.length; i++) {
                if (this.arrayPopUp[i] == id) {
                    return false;
                }
            }
        }
        cc.log("LENGTH POP UP " + this.arrayPopUp.length);
        if (id >= PopUpManager.MUST_SHOW) {
            this.arrayPopUp.push(id);
            return true;
        }
        else if (this.arrayPopUp.length < PopUpManager.MAX_SHOW) {
            this.arrayPopUp.push(id);
            return true;
        }
        return false;
    },

    removePopUp: function (id) {
        //var num = PopUpManager.MAX_SHOW > this.addPopUp.length ? PopUpManager.MAX_SHOW : this.arrayPopUp.length;
        var index = this.arrayPopUp.indexOf(id);
        if (index >= 0) {
            this.arrayPopUp.splice(index, 1);
        }
    }

});

PopUpManager.MAX_SHOW = 4;
PopUpManager.STARTUP = 10000;
PopUpManager.PURCHASE = 9999;
PopUpManager.DAILY_BONUS_VIP = 9998;
PopUpManager.SUPPORT = 9997;
PopUpManager.RECEIVE_OUT_GIFT = 9996;
PopUpManager.RECEIVE_IN_GIFT = 9995;
PopUpManager.INPUT_INFORMATION = 9994;
PopUpManager.SHOP_BONUS = 9993;
PopUpManager.NOTIFY_OUT_GAME = 9992;
PopUpManager.NOTIFY_IN_GAME = 9991;
PopUpManager.OFFER_ZALO = 9990;
PopUpManager.OFFER = 9989;
PopUpManager.NEW_ITEM = 9988;
PopUpManager.DAILY_PURCHASE = 9987;
PopUpManager.MUST_SHOW = PopUpManager.RECEIVE_IN_GIFT;

PopUpManager.instance = null;

PopUpManager.getInstance = function () {
    if (PopUpManager.instance == null){
        PopUpManager.instance = new PopUpManager();
    }

    return PopUpManager.instance;
};

popUpManager = PopUpManager.getInstance();
