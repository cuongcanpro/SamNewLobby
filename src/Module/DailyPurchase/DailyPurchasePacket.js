/**
 *  Created by sonbnt on 24/08/2021
 */

/* region SEND */
var CmdSendDailyPurchaseData = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(DailyPurchaseManager.CMD_DAILY_PURCHASE_DATA);
    },

    putData: function() {
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendReceiveDailyPurchaseGift = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(DailyPurchaseManager.CMD_RECEIVE_DAILY_PURCHASE_GIFT);
    },

    putData: function(dayIndex) {
        this.packHeader();

        this.putInt(dayIndex);

        this.updateSize();
    }
});

var CmdSendCheatDailyPurchaseData = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(DailyPurchaseManager.CMD_CHEAT_DAILY_PURCHASE_DATA);
    },

    putData: function(dayIndex) {
        this.packHeader();

        this.putInt(dayIndex);

        this.updateSize();
    }
});

var CmdSendCheatDailyPurchaseReset = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(DailyPurchaseManager.CMD_CHEAT_DAILY_PURCHASE_RESET);
    },

    putData: function() {
        this.packHeader();
        this.updateSize();
    }
});
/* endregion SEND */

/* region RECEIVE */
var CmdReceivedDailyPurchaseConfig = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.config = JSON.parse(this.getString());
    }
});

var CmdReceivedDailyPurchaseData = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.currentDayIndex = this.getInt();
        this.receivedDays = this.getInts();
        this.waitingDays = this.getInts();
        this.remainTime = Number(this.getLong());
    }
});

var CmdReceivedNotifyDailyPurchaseGift = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.dayIndex = this.getInt();
    }
});

var CmdReceivedReceiveDailyPurchaseGift = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.dayIndex = this.getInt();
        this.gold = Number(this.getLong());
        this.vPoint = this.getInt();
        this.diamond = this.getInt();

        var items = this.getStrings();
        this.items = [];
        for (var idx in items){
            var temp = items[idx].split("_");
            this.items.push({
                type: temp[0], subType: temp[1], id: temp[2], num: temp[3]
            });
        }
    }
});

var CmdReceivedCheatDailyPurchaseData = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
    }
});

var CmdReceivedCheatDailyPurchaseReset = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
    }
});
/* endregion RECEIVE */