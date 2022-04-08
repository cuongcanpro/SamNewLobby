/**
 * Created by Hunter on 11/20/2017.
 */

var EventMgr = BaseMgr.extend({

    ctor: function () {
        this._super();
        this.btnMainEvent = null;
        this.arrayEvent = [];
        this.arrayBtnEvent = [];
        this.checkedDeepLink = false;
    },

    init: function () {
// this.arrayEvent.push(this.createEvent(EventMgr.WEEKLY_CHALLENGE, EventMgr.WEEKLY_CHALLENGE_NAME, false, WChallenge.getInstance(), false, true, 2));
        // this.arrayEvent.push(this.createEvent(EventMgr.LUCKY_CARD, EventMgr.LUCKY_CARD_NAME, false, luckyCard, false, true, 1));
        this.arrayEvent.push(this.createEvent(EventMgr.POT_BREAKER, EventMgr.POT_BREAKER_NAME, false, potBreaker, false, true, 2));
        // this.arrayEvent.push(this.createEvent(EventMgr.BLUE_OCEAN, EventMgr.BLUE_OCEAN_NAME, true, blueOcean, true, true, 1));
        this.arrayEvent.push(this.createEvent(EventMgr.MID_AUTUMN, EventMgr.MID_AUTUMN_NAME, true, midAutumn, false, true, 2));

        // this.arrayEvent.push(this.createEvent(EventMgr.EGG_BREAKER, EventMgr.EGG_BREAKER_NAME, true, eggBreaker, false, true, 3));

        // this.arrayEvent.push(new EventData(EventMgr.MID_AUTUMN, true));
        // this.arrayEvent.push(this.createEvent(EventMgr.EVENT_TET, EventMgr.EVENT_TET_NAME, true, eventTet, true));
        //this.startDownloadContent();
        cc.log("VO DAy nay 2 ***** ");
    },

    createEvent: function (id, name, isMain, event, isFinishDownload, isActive, contentVersion) {
        event.dataEvent = new EventData(id, name, isMain, isActive, contentVersion);
        event.dataEvent.eventInstance = event;
        event.isFinishDownload = isFinishDownload;
        return event;
    },

    startDownloadContent: function () {
        cc.log("START DOWNLOAD CONTENT *** " + downloadEventManager.currentIdDownload);
        //if (downloadEventManager.isUpdating)
        // return;
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (!this.arrayEvent[i].isFinishDownload && !this.arrayEvent[i].downloadFail) {
                cc.log("Content VERSION " + this.arrayEvent[i].dataEvent.idEvent + " " + this.arrayEvent[i].dataEvent.contentVersion);
                downloadEventManager.startDownload(this.arrayEvent[i].dataEvent.idEvent, this.arrayEvent[i].dataEvent.contentVersion);
                break;
            }
        }
    },

    finishDownload: function (isFinish, idDownload) {
        cc.log("tai sao ********************************** ");
        cc.log("FINISH DOWNLOAD EVENT NE " + idDownload + " isFINISH " + isFinish);
        var event = this.getEventById(idDownload);
        if (!event)
            return;
        cc.log("FINISH 1 " + idDownload);
        if (event.buttonLobby && event.buttonLobby.finishDownload) {
            event.buttonLobby.finishDownload(isFinish);
        }
        if (isFinish) {
            event.isFinishDownload = true;
            this.initEvent();
            //   this.showButtonEvent();
            // this.showHideButtonEventInGame();
        } else {
            event.downloadFail = true;
        }
        this.startDownloadContent();
        //var currentSceen = sceneMgr.getMainLayer();
        //if (currentSceen instanceof LobbyScene)
        //  event.openEvent();
    },

    initEvent: function () {
        cc.log("EventMgr::initEvent");
        for (var i = 0; i < this.arrayEvent.length; i++) {
            cc.log("EVENT ID " + this.arrayEvent[i].dataEvent.idEvent + " DOWNLOAD " + this.arrayEvent[i].isFinishDownload);
            if (this.arrayEvent[i] && this.arrayEvent[i].preloadResource && this.arrayEvent[i].dataEvent.isActive) {
                this.arrayEvent[i].preloadResource();
            }
        }
    },

    getIdMainEvent: function () {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].dataEvent.isMain) {
                return this.arrayEvent[i].dataEvent.idEvent;
            }
        }
    },

    getContentVersion: function (id) {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].dataEvent.idEvent == id) {
                return this.arrayEvent[i].dataEvent.contentVersion;
            }
        }
        return 1000;
    },

    getEventById: function (id) {
        if (id < 0 || id === undefined) {
            id = this.getIdMainEvent();
        }
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].dataEvent.idEvent == id) {
                return this.arrayEvent[i];
            }
        }
        return null;
    },

    getEventByName: function (name) {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].dataEvent.name == name) {
                return this.arrayEvent[i];
            }
        }
        return null;
    },

    showButtonEvent: function (btn) {
        cc.log("SHOW BUTTON EVENT ** ");
        if (this.btnMainEvent) {
            this.btnMainEvent.removeFromParent();
        }
        else {
            this.btnMainEvent = new EventButton(true);
            this.btnMainEvent.retain();
        }

        this.btnMainEvent.nodeDownload.setScale(1.0);
        btn.removeAllChildren();
        btn.addChild(this.btnMainEvent);
        this.btnMainEvent.setVisible(false);
        this.btnMainEvent.setPosition(btn.getContentSize().width * 0.5, btn.getContentSize().height * 0.5);
        var event = this.getEventById();
        if (event && !event.isFinishDownload) {
            this.btnMainEvent.waitDownload();
        }

        if (event && event.showNotifyEvent) {
            this.btnMainEvent.setInfo(event.dataEvent);
            event.showNotifyEvent(this.btnMainEvent);
        }
        this.showHideButtonEventInGame();
    },

    showHideButtonEventInGame: function () {
        cc.log("showHideButtonEventInGame ******** " + this.arrayEvent.length);
        //var currentScene = sceneMgr.getMainLayer();
        //if (!(currentScene instanceof LobbyScene))
        //    return;
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].dataEvent.isActive && this.arrayEvent[i].dataEvent.isMain == false) {
                cc.log("MAKE BUTTON EVENT " + this.arrayEvent[i].dataEvent.idEvent);
                var btn = LobbyButtonManager.getInstance().getButton(this.arrayEvent[i].dataEvent.idEvent, LobbyButtonManager.TYPE_EVENT);
                if (!btn) {
                    cc.log("ADD EVENT BUTTON ***** " + this.arrayEvent[i].dataEvent.idEvent);
                    btn = new EventButton();
                    btn.retain();
                    btn.setInfo(this.arrayEvent[i].dataEvent);
                    LobbyButtonManager.getInstance().addButton(btn, this.arrayEvent[i].dataEvent.idEvent, LobbyButtonManager.TYPE_EVENT);
                }
                if (!this.arrayEvent[i].isFinishDownload) {
                    btn.waitDownload();
                }
                if (this.arrayEvent[i].showNotifyEvent) {
                    // tung event se duoc gan voi button nay, them effect, chay update time
                    this.arrayEvent[i].showNotifyEvent(btn);
                }
            }
        }
    },

    updateItemInShop: function (arrayLbGachaCoin, arrayIconGachaCoin, bonusValue, inf) {
        for (var i = 0; i < arrayLbGachaCoin.length; i++) {
            arrayLbGachaCoin[i].setVisible(false);
            arrayIconGachaCoin[i].setVisible(false);
        }

        var arrayBonusTicket = this.getEventBonusTicket(inf.type, inf.costConfig);
        cc.log("ARAY BONUS TICKET *** " + JSON.stringify(arrayBonusTicket));
        var count = 0;
        for (var i = 0; i < arrayBonusTicket.length; i++) {
            if (arrayBonusTicket[i].numTicket > 0) {
                arrayLbGachaCoin[i].setVisible(true);
                arrayIconGachaCoin[i].setVisible(true);
                arrayLbGachaCoin[count].ignoreContentAdaptWithSize(true);
                if (count == 0) {
                    var strBonus = bonusValue.getString().trim();
                    if (strBonus == "")
                        arrayLbGachaCoin[count].setString("+" + arrayBonusTicket[i].numTicket);
                    else
                        arrayLbGachaCoin[count].setString(" & " + arrayBonusTicket[i].numTicket);
                    arrayLbGachaCoin[count].setPositionX(bonusValue.getPositionX() + bonusValue.getContentSize().width + 3);
                } else {
                    arrayLbGachaCoin[count].setString(" & " + arrayBonusTicket[i].numTicket);
                    arrayLbGachaCoin[count].setPositionX(arrayIconGachaCoin[count - 1].getPositionX() +
                        arrayIconGachaCoin[count - 1].getContentSize().width * 0.5);
                }
                arrayIconGachaCoin[count].setPositionX(arrayLbGachaCoin[count].getPositionX() + arrayLbGachaCoin[count].getContentSize().width + arrayIconGachaCoin[count].getContentSize().width * 0.5);
                arrayIconGachaCoin[count].loadTexture(this.getTicketTexture(arrayBonusTicket[i].idEvent));
                count++;
            }
        }
    },

    openEvent: function (id) {
        var event = this.getEventById(id);
        // hien tai thi cach mo EventMgr chinh va phu nhu nhau
        this.openEventInGame(event.idEvent);
        // if (event && event.openEvent) {
        //     event.openEvent();
        // }
    },

    openEventInGame: function (id) {
        var event = this.getEventById(id);
        if (event && event.openEvent) {
            if (event.isFinishDownload) {
                event.openEvent();
            } else {
                if (downloadEventManager.isUpdating) {
                    cc.log("CURRENT " + downloadEventManager.currentIdDownload + " NEXT " + id);
                    if (downloadEventManager.currentIdDownload.localeCompare(id) == 0) {
                        ToastFloat.makeToast(ToastFloat.SHORT, LocalizedString.to("LOADING_EVENT"));
                    } else {
                        event.buttonLobby.queueDownload();
                    }
                } else {
                    event.downloadFail = false;
                    downloadEventManager.startDownload(id);
                    if (event.buttonLobby) {
                        event.buttonLobby.startDownload();
                    }
                }
            }
        }
    },

    isInEvent: function (id) {
        var event = this.getEventById(id);
        if (event && event.isInEvent) {
            return event.isInEvent();
        }
        return false;
    },

    isEndEvent: function (id) {
        var event = this.getEventById(id);
        if (event && event.isEndEvent) {
            return event.isEndEvent();
        }
        return false;
    },

    isInMainEvent: function () {
        return this.isInEvent();
    },

    isHaveShopTicket: function () {
        if (!this.isInMainEvent())
            return false;
        var arrayConfigTicket = this.getArrayConfigTicket();
        if (!arrayConfigTicket)
            return false;
        if (arrayConfigTicket.length == 0)
            return false;
        return true;
    },

    // check dang co Main EventMgr hay khong (co the da ket thuc)
    haveMainEvent: function () {
        return this.isInEvent() || this.isEndEvent();
    },

    checkFreeTicket: function (id) {
        var event = this.getEventById(id);
        if (event && event.checkFreeTicket) {
            return event.checkFreeTicket();
        }
    },

    getTicketTexture: function (id) {
        var event = this.getEventById(id);
        if (event && event.getTicketTexture) {
            return event.getTicketTexture();
        }
        return "";
    },

    getNumberTicket: function (id) {
        var event = this.getEventById(id);
        if (event && event.keyCoin) {
            return event.keyCoin;
        }
        return 0;
    },

    // get Mang config Shop EventMgr theo loai Payment (dung cho mua ve truc tiep)
    getDataPaymentById: function (id) {
        var event = this.getEventById();
        if (event)
            return event.dataEvent.getDataPaymentById(id);
        return null;
    },

    onEndGame: function () {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].onEndGame) {
                this.arrayEvent[i].onEndGame();
            }
        }
    },

    addGuiInGame: function () {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (!this.isInEvent(this.arrayEvent[i].dataEvent.idEvent)) {
                if (this.arrayEvent[i].removeAccumulateGUI)
                    this.arrayEvent[i].removeAccumulateGUI();
            } else {
                if (this.arrayEvent[i].addAccumulateGUI)
                    this.arrayEvent[i].addAccumulateGUI();
            }
        }
    },

    showTicketInGame: function (id) {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].showTicketInGame) {
                this.arrayEvent[i].showTicketInGame();
            }
        }
    },

    resetData: function () {
        this.getDeepLink();
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].resetData) {
                this.arrayEvent[i].resetData();
            }
        }
    },

    onReceived: function (cmd, pkg) {
        cc.log("ON RECEIVE EVENT " + cmd);
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].dataEvent.isActive && this.arrayEvent[i].onReceive) {
                this.arrayEvent[i].onReceive(cmd, pkg);
            }
        }

        switch (cmd) {
            case EventMgr.CMD_NOTIFY_EVENT_REGISTER: {
                var cmd = new CmdReceivedNotifyEventRegister(pkg);
                cc.log("CMD_NOTIFY_EVENT_REGISTER", JSON.stringify(cmd));
                this.notifyEventRegister(cmd);
                return true;
            }
            case EventMgr.CMD_SEND_EVENT_REGISTER: {
                var cmd = new CmdReceivedSendEventRegister(pkg);
                var message = localized("REGISTER_GIFT_" + cmd.getError());
                cc.log("MESSAGE CMD_SEND_EVENT_REGISTER  " + message);
                sceneMgr.showOKDialog(message, null, function (btnID) {

                });
                return true;
            }
        }
    },

    updateEventLoop: function (dt) {
        try {
            if (sceneMgr.getMainLayer() instanceof LobbyScene || sceneMgr.getMainLayer() instanceof ShopIapScene) {
                for (var i = 0; i < this.arrayEvent.length; i++) {
                    if (this.arrayEvent[i].updateEventLoop) {
                        this.arrayEvent[i].updateEventLoop(dt);
                    }
                }
            }
        } catch (e) {

        }
    },

    onEventShopBonusNew: function (data, id) {
        cc.log("++EventShopBonusNew : " + JSON.stringify(data));
        var event = this.getEventById(id);
        if (event)
            event.dataEvent.onEventShopBonusNew(data);
        sceneMgr.updateCurrentGUI();
    },

    // tra ve mang Ve tang them khi mua GOld trong Shop (dung de Show mang tang kem trong Shop)
    getEventBonusTicket: function (type, value) {
        var arrayBonusTicket = [];
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.isInEvent(this.arrayEvent[i].dataEvent.idEvent) && this.arrayEvent[i].isFinishDownload) {
                var bonus = this.arrayEvent[i].dataEvent.getEventBonusTicket(type, value);
                cc.log("lfjsl getEventBonusTicket " + bonus + " type " + type + " value " + value);
                if (bonus)
                    arrayBonusTicket.push(bonus);
            }
        }
        return arrayBonusTicket;
    },

    // tra ve mang con fig ve bonus them voi type (SMS, ATM, IAP) (dung de Show trong Offer)
    getEventTicketConfig: function (type, id) {
        var event = this.getEventById(id);
        if (!event)
            return null;
        return event.dataEvent.getEventTicketConfig(type);
    },

    // tra ve mang config Ticket cua EventMgr chinh dang chay (thuong la EventMgr Out Game, ban ve truc tiep)
    getArrayConfigTicket: function () {
        var event = this.getEventById();
        if (event) {
            return event.dataEvent.arrayConfigTicket;
        }
        return [];
    },

    updateEventConfig: function (resetEvent, id) {
        if (resetEvent) {
            for (var i = 0; i < this.arrayEvent.length; i++) {
                if (this.arrayEvent[i].idEvent == id) {
                    this.arrayEvent[i].arrayConfigTicket = [];
                    return;
                }
            }
        }
    },

    requestShopEventConfig: function () {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].requestShopEventConfig) {
                this.arrayEvent[i].requestShopEventConfig();
            }
        }
    },

    buyGTicket: function (info) {
        if (Config.ENABLE_EVENT_SECRET_TOWER && secretTower.isInEvent() ||
            Config.ENABLE_MID_AUTUMN && midAutumn.isInEvent()) {
            cc.log(JSON.stringify(info));
            var xu = info.cost;
            if (gamedata.userData.coin < xu) {
                SceneMgr.getInstance().showOKDialog(LocalizedString.to("MD_KEYCOIN_BUY_NEED_G"));
                SceneMgr.getInstance().showAddGDialog(LocalizedString.to("MD_KEYCOIN_BUY_NEED_G"), this, function (btnID) {
                    if (btnID == Dialog.BTN_OK) {
                        gamedata.openNapGInTab(1);
                    }
                });
            } else {
                var msg = LocalizedString.to("MD_KEYCOIN_BUY_CONFIRM");
                msg = StringUtility.replaceAll(msg, "@cost", StringUtility.pointNumber(xu));
                msg = StringUtility.replaceAll(msg, "@coin", StringUtility.pointNumber(info.goldNew));
                SceneMgr.getInstance().showOkCancelDialog(msg, this, function (btnID) {
                    if (btnID == Dialog.BTN_OK) {
                        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                        midAutumn.sendBuyTicketG(parseInt(info.cost));
                    }
                });
            }
        }
    },

    buySMSTicket: function (info) {
        var networkInfo = gamedata.getNetworkTelephone();
        var operator = 0;
        switch (networkInfo) {
            case Constant.ID_VIETTEL: {
                operator = PanelCard.BTN_VIETTEL;
                break;
            }
            case Constant.ID_MOBIFONE: {
                operator = PanelCard.BTN_MOBIFONE;
                break;
            }
            case Constant.ID_VINAPHONE: {
                operator = PanelCard.BTN_VINAPHONE;
                break;
            }
            default : {
                operator = 0;
                break;
            }
        }
        if (operator == 0) {
            sceneMgr.openGUI(SimOperatorPopup.className, SimOperatorPopup.TAG, SimOperatorPopup.TAG).setAmount(info.cost, info.smsType);
        } else {
            PaymentUtils.requestSMSSyntax(operator, parseInt(info.cost), parseInt(info.smsType));
        }
    },

    resetEventButton: function () {
        this.btnMainEvent = null;
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].resetEventButton) {
                this.arrayEvent[i].resetEventButton();
            }
        }
    },

    getOfferTicketImage: function (id) {
        var event = this.getEventById(id);
        if (event && event.getOfferTicketImage) {
            return event.getOfferTicketImage();
        }
        return "res/Lobby/Offer/bonusTicket.png";
    },

    getOfferTicketString: function (id) {
        var event = this.getEventById(id);
        if (event && event.getOfferTicketString) {
            return event.getOfferTicketString();
        }
        return "Vé";
    },

    getEventIdByName: function (name) {
        var event = this.getEventByName(name);
        if (event) {
            return event.idEvent;
        }
        return 0;
    },

    createEventInLobby: function (lobby) {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].createEventInLobby) {
                this.arrayEvent[i].createEventInLobby(lobby);
            }
        }
    },

    updateDownload: function (idEvent, percent) {
        // cc.log("UPDATE DOWNLOAD " + idEvent + " " + percent);
        var event = this.getEventById(idEvent);
        if (event) {
            if (event.dataEvent.isActive && event.buttonLobby) {
                try {
                    event.buttonLobby.updateDownload(percent);
                } catch (e) {
                    cc.log(e.stack);
                }
            }
        }
    },

    notifyEventRegister: function (cmd) {
        this.eventIdRegister = cmd.eventId;
        this.giftId = cmd.giftId;
        this.giftName = cmd.giftName;
        // lay id thuc su cua EventMgr: eggbreaker#date
        var arrayString = this.eventIdRegister.split("#");
        var curEvent = this.getEventById(arrayString[0]);
        if (curEvent && curEvent.getOfferTicketString) {
            curEvent.showRegisterAfterEvent();
        }
    },

    getDeepLink: function () {
        if (this.checkedDeepLink == false) {
            if (typeof injection != "undefined" && injection != null && injection.deeplink != null) {
                var data = injection.deeplink.getData();
                cc.log("DATA DEEPLINK " + data);
                if (data.indexOf("zalopayevent") !== -1) {
                    this.openFromZalo = true;
                }
                else {
                    this.openFromZalo = false;
                }
            }
            else {
                cc.log("NO DATA DEEPLINK");
                this.openFromZalo = false;
            }
            this.checkedDeepLink = true;
        }
    },

    setupButtonInGame: function (gameScene) {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.isInEvent(this.arrayEvent[i].dataEvent.idEvent)) {
                if (this.arrayEvent[i].addAccumulateGUI) {
                    this.arrayEvent[i].addAccumulateGUI();
                    if (!this.arrayEvent[i].isSpecialAccumulate || !this.arrayEvent[i].isSpecialAccumulate()) {
                        gameScene.updateButtonEvent(
                            this.arrayEvent[i].isFinishDownload,
                            this.arrayEvent[i].keyCoin,
                            (this.arrayEvent[i].curLevelExp / this.arrayEvent[i].nextLevelExp) * 100,
                            this.arrayEvent[i].getTicketTexture(),
                            this.arrayEvent[i]
                        );
                    }
                    break;
                }
            }
        }
    },
});

EventMgr.LUCKY_CARD = "halloween";
EventMgr.POT_BREAKER = "potBreaker";
EventMgr.EGG_BREAKER = "eggBreaker";
EventMgr.MID_AUTUMN = "midAutumn";
EventMgr.EVENT_TET = "tet2018";
EventMgr.WEEKLY_CHALLENGE = "weeklyChallenge";
EventMgr.BLUE_OCEAN = "summer";

EventMgr.LUCKY_CARD_NAME = "halloween";
EventMgr.POT_BREAKER_NAME = "potBreaker";
EventMgr.MID_AUTUMN_NAME = "midAutumn";
EventMgr.EVENT_TET_NAME = "tet2018";
EventMgr.EGG_BREAKER_NAME = "eggBreaker";
EventMgr.WEEKLY_CHALLENGE_NAME = "weeklyChallenge";
EventMgr.BLUE_OCEAN_NAME = "summer";

var Event = {};
Event.LUCKY_CARD = "halloween";
Event.POT_BREAKER = "potBreaker";
Event.EGG_BREAKER = "eggBreaker";
Event.MID_AUTUMN = "midAutumn";
Event.EVENT_TET = "tet2018";
Event.WEEKLY_CHALLENGE = "weeklyChallenge";
Event.BLUE_OCEAN = "summer";

Event.LUCKY_CARD_NAME = "halloween";
Event.POT_BREAKER_NAME = "potBreaker";
Event.MID_AUTUMN_NAME = "midAutumn";
Event.EVENT_TET_NAME = "tet2018";
Event.EGG_BREAKER_NAME = "eggBreaker";
Event.WEEKLY_CHALLENGE_NAME = "weeklyChallenge";
Event.BLUE_OCEAN_NAME = "summer";



//EventMgr.LUCKY_CARD_PATH = "res/Lobby/Event/WishingStar/project.manifest";

EventMgr._inst = null;
EventMgr.instance = function () {
    if (!EventMgr._inst) {
        EventMgr._inst = new EventMgr();
    }
    return EventMgr._inst;
};
var eventMgr = EventMgr.instance();
var event = eventMgr;
Event.instance = function () {
    return EventMgr._inst;
}
EventMgr.CMD_NOTIFY_EVENT_REGISTER = 1600;
EventMgr.CMD_SEND_EVENT_REGISTER = 1601;

CmdReceivedNotifyEventRegister = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.eventId = this.getString();
        this.giftId = this.getInt();
        this.giftName = this.getString();
    }
});

CmdReceivedSendEventRegister = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.eventId = this.getString();
        this.giftId = this.getInt();
        this.giftName = this.getString();
    }
});

var CmdSendEventChangeAward = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(EventMgr.CMD_SEND_EVENT_REGISTER);
    },

    putData: function (idEvent, id, name, add, cmnd, phone, email) {
        if (name === undefined) name = "";
        if (phone === undefined) phone = "";
        if (cmnd === undefined) cmnd = "";
        if (add === undefined) add = "";
        if (email === undefined) email = "";

        cc.log("#SendChangeAward : " + idEvent + "," + id + "," + name + " , " + phone + " , " + cmnd + " , " + add + " , " + email);

        this.packHeader();
        this.putString(idEvent);
        this.putInt(id);

        this.putString(name);
        this.putString(phone);
        this.putString(cmnd);
        this.putString(add);
        this.putString(email);
        this.updateSize();
    },
});