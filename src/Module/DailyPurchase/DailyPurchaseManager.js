/**
 *  Created by sonbnt on 24/08/2021
 */

var DailyPurchaseManager = BaseMgr.extend({
    ctor: function(){
        this._super();
        this.btnLobby = new DailyPurchaseButton();
        this.btnLobby.retain();

        this.resetData();
    },

    /* region data */
    resetData: function(){
        this.config = null;
        this.currentDayIndex = -1;
        this.remainTime = 0;
        this.receivedDays = [];
        this.waitingDays = [];
        this.notifyGift = false;
        this.firstTime = true;
        this.btnLobby.showNotify(false);
    },

    update: function(dt){
        if (this.checkOpen()){
            var oldDay = Math.ceil(this.remainTime / (1000 * 60 * 60 * 24));
            this.remainTime = Math.max(0, this.remainTime - dt * 1000);
            var newDay = Math.ceil(this.remainTime / (1000 * 60 * 60 * 24));
            if (oldDay != newDay) {
                VipManager.getInstance().setWaiting(true);
                this.sendDailyPurchaseData();
            }
        }
    },
    /* endregion data */

    /* region listeners */
    onReceived: function(cmd, data){
        switch(cmd){
            case DailyPurchaseManager.CMD_DAILY_PURCHASE_CONFIG:
                var pk = new CmdReceivedDailyPurchaseConfig(data);
                pk.clean();
                this.onReceiveDailyPurchaseConfig(pk);
                return true;
            case DailyPurchaseManager.CMD_DAILY_PURCHASE_DATA:
                var pk = new CmdReceivedDailyPurchaseData(data);
                pk.clean();
                this.onReceiveDailyPurchaseData(pk);
                return true;
            case DailyPurchaseManager.CMD_NOTIFY_DAILY_PURCHASE_GIFT:
                var pk = new CmdReceivedNotifyDailyPurchaseGift(data);
                pk.clean();
                this.onReceiveNotifyDailyPurchaseGift(pk);
                return true;
            case DailyPurchaseManager.CMD_RECEIVE_DAILY_PURCHASE_GIFT:
                var pk = new CmdReceivedReceiveDailyPurchaseGift(data);
                pk.clean();
                this.onReceiveReceiveDailyPurchaseGift(pk);
                return true;
            case DailyPurchaseManager.CMD_CHEAT_DAILY_PURCHASE_DATA:
                var pk = new CmdReceivedCheatDailyPurchaseData(data);
                pk.clean();
                Toast.makeToast(Toast.LONG, "Cheat daily purchase data: " + (pk.getError() == 0 ? "successful" : "failed"));
                return true;
            case DailyPurchaseManager.CMD_CHEAT_DAILY_PURCHASE_RESET:
                var pk = new CmdReceivedCheatDailyPurchaseReset(data);
                pk.clean();
                Toast.makeToast(Toast.LONG, "Cheat daily purchase reset: " + (pk.getError() == 0 ? "successful" : "failed"));
                return true;
            default:
                return;
        }
        cc.log("DailyPurchase received:", cmd);
    },

    onReceiveDailyPurchaseConfig: function(pk){
        //read config
        var config = pk.config;

        this.config = {
            promoChannel: config.promoChannel,
            promoPackage: config.promoPackage,
            gifts: []
        };
        for (var i = 0; i < config.gifts.length; i++){
            var gift = {
                id: config.gifts[i].id,
                minMoney: config.gifts[i].minMoney,
                gold: config.gifts[i].gold,
                diamond: config.gifts[i].diamond,
                vPoint: config.gifts[i].vPoint,
                items: []
            };
            for (var j = 0; j < config.gifts[i].items.length; j++){
                var temp =  config.gifts[i].items[j].split("_");
                gift.items.push({type: temp[0], subType: temp[1], id: temp[2], num: temp[3]});
            }
            this.config.gifts.push(gift);
        }
        cc.log("Daily Purchase Config:", JSON.stringify(this.config));

        //send get data
        this.sendDailyPurchaseData();
    },

    onReceiveDailyPurchaseData: function(pk){
        this.currentDayIndex = pk.currentDayIndex;
        this.remainTime = pk.remainTime;
        this.receivedDays = pk.receivedDays;
        this.waitingDays = pk.waitingDays;
        cc.log("Daily Purchase Data:", JSON.stringify(pk));

        if (this.checkOpen()) {
            cc.director.getScheduler().schedule(this.update, this, 1, cc.REPEAT_FOREVER, 0, false, "DailyPurchaseUpdate");
            LobbyButtonManager.getInstance().addButton(this.btnLobby, "DailyPurchase");
            this.btnLobby.showNotify(this.waitingDays.length > 0 || (this.getCurrentDayStatus() == DailyPurchaseManager.DAY_OPENING && !sceneMgr.getGUI(DailyPurchaseGUI.GUI_TAG)));
        }
        else {
            cc.director.getScheduler().unschedule("DailyPurchaseUpdate", this);
            LobbyButtonManager.getInstance().removeButton("DailyPurchase");
            this.btnLobby.showNotify(false);
        }

        var gui = sceneMgr.getGUI(DailyPurchaseGUI.GUI_TAG);
        if (gui) gui.onUpdateGUI();
        else this.checkNotifyGift();
    },

    onReceiveNotifyDailyPurchaseGift: function(pk){
        if (this.waitingDays.length > 0) {
            this.btnLobby.showNotify(true);
            this.notifyGift = true;
            this.checkNotifyGift();
        }
    },

    onReceiveReceiveDailyPurchaseGift: function(pk){
        if (this.checkOpen()) {
            for (var i = 0; i < this.waitingDays.length; i++) {
                if (this.waitingDays[i] == pk.dayIndex) {
                    this.waitingDays.splice(i, 1);
                    this.receivedDays.push(pk.dayIndex);
                    var gui = sceneMgr.getGUIByClassName(DailyPurchaseGUI.className);
                    if (gui && this.checkOpen()) {
                        sceneMgr.clearLoading();
                        gui.effectReceive(pk);
                    }
                    break;
                }
            }
            if (this.waitingDays.length == 0) this.btnLobby.showNotify(false);
        }
        else{
            setTimeout(function(){
                var gui = sceneMgr.getGUI(DailyPurchaseGUI.GUI_TAG);
                if (!gui){
                    if (!CheckLogic.checkInBoard()) {
                        VipManager.checkShowUpLevelVip();
                    }
                    else VipManager.getInstance().setWaiting(false);
                }
            }, 500);
            var scene = sceneMgr.getMainLayer();
            if (scene && scene["updateToCurrentData"] !== undefined)
                scene.updateToCurrentData();
        }
    },
    /* endregion listener */

    /* region senders */
    sendDailyPurchaseData: function(){
        var pk = new CmdSendDailyPurchaseData();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendReceiveDailyPurchaseGift: function(dayIndex){
        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
        VipManager.getInstance().setWaiting(true);

        var pk = new CmdSendReceiveDailyPurchaseGift();
        pk.putData(dayIndex);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatDailyPurchaseData: function(dayIndex){
        var pk = new CmdSendCheatDailyPurchaseData();
        pk.putData(dayIndex);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatDailyPurchaseReset: function(){
        var pk = new CmdSendCheatDailyPurchaseReset();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },
    /* endregion senders */

    /* region APIs */
    checkOpen: function(){
        return this.config && this.currentDayIndex >= 0 && this.remainTime > 0;
    },

    checkNotifyGift: function(){
        if (!this.checkOpen()) return;

        var show = this.notifyGift || (this.firstTime && !this.isReceivedAll());

        if (show && sceneMgr.getMainLayer() instanceof LobbyScene){
            if (popUpManager.canShow(PopUpManager.DAILY_PURCHASE)) {
                this.notifyGift = false;
                this.firstTime = false;
                this.openDailyPurchaseGUI();
                fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, ConfigLog.BEGIN + "gui_popup");
            }
        }
    },

    checkTodayOpening: function(){
        return this.getCurrentDayStatus() == DailyPurchaseManager.DAY_OPENING;
    },

    checkTodayLastDay: function(){
        return this.remainTime <= 1000 * 60 * 60 * 24;
    },

    openDailyPurchaseGUI: function(){
        sceneMgr.openGUI(DailyPurchaseGUI.className, DailyPurchaseGUI.GUI_TAG, DailyPurchaseGUI.GUI_TAG);
        if (this.waitingDays.length == 0) this.btnLobby.showNotify(false);
    },

    getPromoChannel: function(){
        if (this.config) return this.config.promoChannel;
        return -1;
    },

    getPromoPackage: function(){
        if (this.config) return this.config.promoPackage;
        return -1;
    },

    getGift: function(dayIndex){
        if (dayIndex < 0 || dayIndex >= this.config.gifts.length) dayIndex = 0;
        return this.config.gifts[dayIndex];
    },

    getRemainTime: function(){
        return this.remainTime;
    },

    getCurrentDayStatus: function(){
        return this.getDayStatus(this.currentDayIndex);
    },

    getCurrentDayMinMoney: function(){
        if (!this.checkOpen()) return 5000;
        return this.config.gifts[this.currentDayIndex].minMoney;
    },

    /**
     * @param {Number} dayIndex
     * @return {Number} dayStatus
     */
    getDayStatus: function(dayIndex){
        if (this.receivedDays.indexOf(dayIndex) != -1) return DailyPurchaseManager.DAY_RECEIVED;
        if (this.waitingDays.indexOf(dayIndex) != -1) return DailyPurchaseManager.DAY_WAITING;
        if (this.currentDayIndex == -1)
            return DailyPurchaseManager.DAY_UNOPENED;
        else{
            if (dayIndex > this.currentDayIndex) return DailyPurchaseManager.DAY_UNOPENED;
            return DailyPurchaseManager.DAY_OPENING;
        }
    },

    isCurrentDayIndex: function(dayIndex){
        return dayIndex == this.currentDayIndex;
    },

    getNumTotalDay: function(){
        if (!this.config) return 0;
        return this.config.gifts.length;
    },

    isLastDayIndex: function(dayIndex){
        return dayIndex + 1 == this.getNumTotalDay();
    },

    isPopularDayIndex: function(dayIndex){
        return dayIndex == DailyPurchaseManager.POPULAR_DAY_INDEX;
    },

    isReceivedAll: function(){
        for (var i = 0; i < this.getNumTotalDay(); i++)
            if (this.receivedDays.indexOf(i) == -1) return false;
        return true;
    }
    /* endregion APIs */
});

DailyPurchaseManager.instance = null;
DailyPurchaseManager.getInstance = function(){
    if (!DailyPurchaseManager.instance)
        DailyPurchaseManager.instance = new DailyPurchaseManager();
    return DailyPurchaseManager.instance;
};
var dailyPurchaseManager = DailyPurchaseManager.getInstance();

DailyPurchaseManager.CMD_DAILY_PURCHASE_CONFIG = 10001;
DailyPurchaseManager.CMD_DAILY_PURCHASE_DATA = 10002;
DailyPurchaseManager.CMD_NOTIFY_DAILY_PURCHASE_GIFT = 10003;
DailyPurchaseManager.CMD_RECEIVE_DAILY_PURCHASE_GIFT = 10004;
DailyPurchaseManager.CMD_CHEAT_DAILY_PURCHASE_DATA = 10010;
DailyPurchaseManager.CMD_CHEAT_DAILY_PURCHASE_RESET = 10011;

DailyPurchaseManager.DAY_UNOPENED = 0;
DailyPurchaseManager.DAY_OPENING = 1;
DailyPurchaseManager.DAY_WAITING = 2;
DailyPurchaseManager.DAY_RECEIVED = 3;

DailyPurchaseManager.POPULAR_DAY_INDEX = 1;