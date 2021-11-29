/**
 * Created by Hunter on 11/20/2017.
 */


var EventData = cc.Class.extend({
    ctor: function (id, name, isMain, isActive, contentVersion) {
        this.shopEventBonusNew = [];
        this.arrayConfigTicket = [];
        this.promoTicket = 0;
        this.startPromoTicket = "";
        this.endPromoTicket = "";
        this.idEvent = id;
        this.isMain = isMain;
        this.name = name;
        this.isActive = isActive;
        this.contentVersion = contentVersion;
        this.openFromZalo = false;
        //this.path = path; // duong dan den project.manifest cua event
    },

    onEventShopBonusNew: function (data) {
        this.shopEventBonusNew = [];
        if (data.g2GoldFirstValue) {
            var size = data.g2GoldFirstValue.length;
            var g2GOLD = {};
            g2GOLD["type"] = Payment.GOLD_G;
            for (var i = 0; i < size; i++) {
                g2GOLD["" + data.g2GoldFirstValue[i]] = data.g2GoldFirstTicket[i];
            }
            this.shopEventBonusNew.push(g2GOLD);
        }

        size = data.smsGoldFirstValue.length;
        var smsGOLD = {};
        smsGOLD["type"] = Payment.GOLD_SMS;
        for (var i = 0; i < size; i++) {
            smsGOLD["" + data.smsGoldFirstValue[i]] = data.smsGoldFirstTicket[i];
        }
        this.shopEventBonusNew.push(smsGOLD);
        size = data.iapGoldFirstValue.length;
        var iapGOLD = {};
        iapGOLD["type"] = Payment.GOLD_IAP;
        for (var i = 0; i < size; i++) {
            iapGOLD["" + data.iapGoldFirstValue[i]] = data.iapGoldFirstTicket[i];
        }
        this.shopEventBonusNew.push(iapGOLD);
        size = data.zingGoldFirstValue.length;
        var zingGOLD = {};
        zingGOLD["type"] = Payment.GOLD_ZING;
        for (var i = 0; i < size; i++) {
            zingGOLD["" + data.zingGoldFirstValue[i]] = data.zingGoldFirstTicket[i];
        }
        this.shopEventBonusNew.push(zingGOLD);
        size = data.atmGoldFirstValue.length;
        var atmGOLD = {};
        atmGOLD["type"] = Payment.GOLD_ATM;
        for (var i = 0; i < size; i++) {
            atmGOLD["" + data.atmGoldFirstValue[i]] = data.atmGoldFirstTicket[i];
        }
        this.shopEventBonusNew.push(atmGOLD);
        size = data.zaloPayGoldFirstValue.length;
        var zaloGOLD = {};
        zaloGOLD["type"] = Payment.GOLD_ZALO;
        for (var i = 0; i < size; i++) {
            zaloGOLD["" + data.zaloPayGoldFirstValue[i]] = data.zaloPayGoldFirstTicket[i];
        }
        this.shopEventBonusNew.push(zaloGOLD);


        eventMgr.promoTicket = data.promoTicket;
        //event.promoTicket = 200;
        eventMgr.startPromoTicket = data.startPromoTicket;
        eventMgr.endPromoTicket = data.endPromoTicket;
        if (this.isMain) {
            cc.log("INIT SHOP DATA *** ");
            this.initShopData(data);
        }


        if (eventMgr.promoTicket > 0) {
            if (this.eventInstance.showPromoTicket)
                this.eventInstance.showPromoTicket();
        }
    },

    getEventTicketConfig: function (type) {
        if (type == Payment.GOLD_SMS_VIETTEL) {
            type = Payment.GOLD_SMS;
        }
        for (var i = 0; i < this.shopEventBonusNew.length; i++) {
            if (this.shopEventBonusNew[i].type == type) {
                var obj = this.shopEventBonusNew[i];
                return obj;
            }
        }
        return null;
    },

    getEventBonusTicket: function (type, value) {
        var data = this.shopEventBonusNew;
        for (var i = 0; i < data.length; i++) {
            if (data[i].type == type) {
                cc.log("get event shop bonus: ", type, "  ", value);
                var obj = data[i];
                if (obj) {
                    var key = "" + value;
                    if (key in obj) {
                        if (obj[key] <= 0)
                            return null;
                        var dataTicket = {};
                        dataTicket.idEvent = this.idEvent;
                        dataTicket.numTicket = obj[key];
                        return dataTicket;
                    }
                }
            }
        }
        return null;
    },

    initShopData: function (data) {
        this.arrayConfigTicket = [];
        //this.arrayConfigTicket.push(this.initOnePayment(Payment.TICKET_G, data.gTicketValues, data.gTicketTickets, cc.color(243, 243, 243, 0)));
        if (gamedata.payments[Payment.GOLD_SMS]) {
            this.initOnePayment(Payment.TICKET_SMS, data.smsTicketValues, data.smsTicketTickets, cc.color(243, 243, 243, 0), data.smsDirectVPoint, data.smsDirectVipHour);
        }
        if (gamedata.payments[Payment.GOLD_IAP]) {
            this.initOnePayment(Payment.TICKET_IAP, data.iapTicketValues, data.iapTicketTickets, cc.color(243, 243, 243, 0), data.iapDirectVPoint, data.iapDirectVipHour);
        }
        if (gamedata.payments[Payment.GOLD_ZING]) {
            this.initOnePayment(Payment.TICKET_ZING, data.zingTicketValues, data.zingTicketTickets, cc.color(243, 243, 243, 0), data.zingDirectVPoint, data.zingDirectVipHour);
        }
        if (gamedata.payments[Payment.GOLD_ATM]) {
            this.initOnePayment(Payment.TICKET_ATM, data.atmTicketValues, data.atmTicketTickets, cc.color(243, 243, 243, 0), data.atmDirectVPoint, data.atmDirectVipHour);
        }
        if (gamedata.payments[Payment.GOLD_ZALO]) {
            this.initOnePayment(Payment.TICKET_ZALO, data.zaloTicketValues, data.zaloTicketTickets, cc.color(243, 243, 243, 0), data.zaloPayDirectVPoint, data.zaloPayDirectVipHour);
        }
        cc.log("CONFIG *** " + JSON.stringify(this.arrayConfigTicket));
    },

    initOnePayment: function (typePayment, value, ticket, color, vPoint, hourVip) {
        var payment = {};
        var src = [];
        var idx = 0;
        if (!gamedata.gameConfig)
            return;
        var goldIap = gamedata.gameConfig.getShopGoldById(Payment.TICKET_IAP - Payment.BUY_TICKET_FROM);
        for (var i = 0; i < value.length; i++) {
            if (ticket[i] <= 0)
                continue;
            idx++;
            if (idx > 5) idx = 5;
            var obj = {};
            if (typePayment == Payment.TICKET_IAP) {
                var packageShop = goldIap["packages"][i];
                cc.log("PACKAGE SHOP ** " + JSON.stringify(packageShop));

                var iapEnable = iapHandler.arrayPackageOpen;
                if (!iapEnable[i] && Config.ENABLE_IAP_LIMIT_TIME) continue;
                if (Config.ENABLE_IAP_LIMIT_TIME)
                    obj.limitTimeIdx = i;

                obj.id = packageShop["androidId"];
                obj.id_ios = packageShop["iOSId"];
                obj.id_ios_portal = packageShop["portalIOSId"];
                obj.id_portal = packageShop["portalAndroidId"];
                obj.id_multi_portal = packageShop["id_gg_portal"];
                obj.id_multi_ios_portal = packageShop["id_ios_portal"];
                if (!gamedata.isPortal()) {
                    obj.cost = iapHandler.getProductPrice(obj.id, obj.id_ios, packageShop["value"]);
                } else {
                    obj.cost = iapHandler.getProductPrice(obj.id_portal, obj.id_ios_portal, packageShop["value"]);
                    if (Config.ENABLE_MULTI_PORTAL) {
                        obj.cost = iapHandler.getProductPrice(obj.id_multi_portal, obj.id_multi_ios_portal, packageShop["value"]);
                    }
                }
                obj.costConfig = packageShop["value"];
            } else {
                obj.cost = value[i];
                obj.costConfig = value[i];
            }

            obj.img = "MidAutumn/MidAutumnUI/shop_hammer_" + idx + ".png";
            if (this.eventInstance.getImgInShop)
                obj.img = this.eventInstance.getImgInShop(idx);
            cc.log(obj.img);
            obj.goldColor = color;

            //if (midAutumn.showX2Ticket)
            //    obj.goldNew = sConfig[s].new * 2;
            //else
            obj.goldNew = ticket[i] * (event.promoTicket / 100 + 1);
            obj.star = 0;
            obj.goldOld = ticket[i];
            obj.bonus = "";
            // obj.bonus = LocalizedString.to("MD_EVENT_SMS_BONUS_HAMMER");
            if (this.eventInstance.getTextInShop)
                obj.bonus = this.eventInstance.getTextInShop();
            else
                obj.bonus = "";
            obj.bonusValue = "";
            obj.hourBonus = hourVip[i];
            obj.vPoint = vPoint[i];
            src.push(obj);
        }
        payment["type"] = typePayment;
        payment["data"] = src;
        this.arrayConfigTicket.push(payment);
        return payment;
    },

    getDataPaymentById: function (id) {
        cc.log("ID **** " + id + " " + JSON.stringify(this.arrayConfigTicket));
        for (var i = 0; i < this.arrayConfigTicket.length; i++) {
            if (this.arrayConfigTicket[i]["type"] == id)
                return this.arrayConfigTicket[i]["data"];
        }
    },
})

var EventMgr = cc.Class.extend({

    ctor: function () {
        // this.initEvent();
        this.btnMainEvent = null;
        this.arrayEvent = [];
        this.arrayBtnEvent = [];
        // this.arrayEvent.push(this.createEvent(EventMgr.WEEKLY_CHALLENGE, EventMgr.WEEKLY_CHALLENGE_NAME, false, WChallenge.getInstance(), false, true, 2));
        // this.arrayEvent.push(this.createEvent(EventMgr.LUCKY_CARD, EventMgr.LUCKY_CARD_NAME, false, luckyCard, false, true, 1));
        this.arrayEvent.push(this.createEvent(EventMgr.POT_BREAKER, EventMgr.POT_BREAKER_NAME, false, potBreaker, false, true, 2));
        // this.arrayEvent.push(this.createEvent(EventMgr.BLUE_OCEAN, EventMgr.BLUE_OCEAN_NAME, true, blueOcean, true, true, 1));
        // this.arrayEvent.push(this.createEvent(EventMgr.MID_AUTUMN, EventMgr.MID_AUTUMN_NAME, true, midAutumn, false, true, 1));

        this.arrayEvent.push(this.createEvent(EventMgr.EGG_BREAKER, EventMgr.EGG_BREAKER_NAME, true, eggBreaker, false, true, 3));

        // this.arrayEvent.push(new EventData(EventMgr.MID_AUTUMN, true));
        // this.arrayEvent.push(this.createEvent(EventMgr.EVENT_TET, EventMgr.EVENT_TET_NAME, true, eventTet, true));
        //this.startDownloadContent();
        cc.log("VO DAy nay 2 ***** ");
        this.checkedDeepLink = false;
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
        this.btnMainEvent.setPosition(btn.getContentSize().width * 0.5, btn.getContentSize().height * 0.5);
        var event = this.getEventById();
        if (event && !event.isFinishDownload) {
            this.btnMainEvent.waitDownload();
        }
        if (event && event.showNotifyEvent) {
            this.btnMainEvent.setInfo(event.dataEvent);
            event.showNotifyEvent(this.btnMainEvent);
        }
    },

    showHideButtonEventInGame: function () {
        cc.log("showHideButtonEventInGame ******** " + this.arrayEvent.length);
        //var currentScene = sceneMgr.getMainLayer();
        //if (!(currentScene instanceof LobbyScene))
        //    return;
        this.groupBtnEvent.hideAllButton();
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
                    this.groupBtnEvent.reloadContentSize();
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

    reloadLayoutButton: function () {
        try {
            if (this.groupBtnEvent)
                this.groupBtnEvent.reloadContentSize();
        } catch (e) {
            cc.log("CHUA DUOC KHOI TAO");
        }
    },

    initArrayBtnEvent: function (pEvent) {
        if (pEvent.groupBtnEvent)
            return;
        this.groupBtnEvent = new GroupEventButton();
        this.groupBtnEvent.retain();
        pEvent.addChild(this.groupBtnEvent);
        pEvent.groupBtnEvent = this.groupBtnEvent;
        // this.arrayPosition = [];
        // this.arrayBtnEvent = arrayBtnEvent;
        // for (var i = 0; i < arrayBtnEvent.length; i++) {
        //     this.arrayPosition.push(arrayBtnEvent[i].getPosition());
        // }
    },

    updateArrayBtnEventPosition: function () {
        this.groupBtnEvent.reloadContentSize();
        // cc.log("UPDATE POSITION BUTTON ");
        // var count = 0;
        // for (var i = 0; i < this.arrayBtnEvent.length; i++) {
        //     cc.log("LFJDSK " + i + " VISIBLE " + this.arrayBtnEvent[i].isVisible());
        //     if (this.arrayBtnEvent[i].isVisible()) {
        //         this.arrayBtnEvent[i].setPosition(this.arrayPosition[count]);
        //         count++;
        //         cc.log("COUNT " + count);
        //     }
        // }
    },

    showTicketInGame: function (id) {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].showTicketInGame) {
                this.arrayEvent[i].showTicketInGame();
            }
        }
    },

    onGetUserInfoSuccess: function () {
        this.getDeepLink();
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].resetData) {
                this.arrayEvent[i].resetData();
            }
        }
    },

    onReceive: function (cmd, pkg) {
        cc.log("ON RECEIVE EVENT " + cmd);
        for (var i = 0; i < this.arrayEvent.length; i++) {
            if (this.arrayEvent[i].dataEvent.isActive && this.arrayEvent[i].onReceive) {
                this.arrayEvent[i].onReceive(cmd, pkg);
            }
        }

        switch (cmd) {
            case CMD.CMD_NOTIFY_EVENT_REGISTER: {
                var cmd = new CmdReceivedNotifyEventRegister(pkg);
                cc.log("CMD_NOTIFY_EVENT_REGISTER", JSON.stringify(cmd));
                this.notifyEventRegister(cmd);
                break;
            }
            case CMD.CMD_SEND_EVENT_REGISTER: {
                var cmd = new CmdReceivedSendEventRegister(pkg);
                var message = localized("REGISTER_GIFT_" + cmd.getError());
                cc.log("MESSAGE CMD_SEND_EVENT_REGISTER  " + message);
                sceneMgr.showOKDialog(message, null, function (btnID) {

                });
                break;
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
            iapHandler.requestSMSSyntax(operator, parseInt(info.cost), parseInt(info.smsType));
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

    // chceck user co the quay trong event
    checkUserCanRoll: function () {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            var event = this.arrayEvent[i];
            try {
                if (!event.isInEvent()) {
                    continue;
                }

                if (event.costRoll && event.costRoll.length > 0) {
                    if (event.keyCoin >= event.costRoll[0]) {
                        return true;
                    }
                }
            } catch (e) {
                cc.log(e);
            }
        }
        return false;
    },

    checkUserHasGift: function () {
        for (var i = 0; i < this.arrayEvent.length; i++) {
            var event = this.arrayEvent[i];
            try {
                if (!event.isInEvent()) {
                    continue;
                }

                if (event.gifts && event.gifts.length > 0) {
                    for (var j = 0; j < event.gifts.length; j++) {
                        var item = event.gifts[j];
                        if (item && item.gift > 0) {
                            return true;
                        }
                    }
                }
            } catch (e) {
                cc.log(e);
            }
        }
        return false;
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

//EventMgr.LUCKY_CARD_PATH = "res/Lobby/EventMgr/WishingStar/project.manifest";

EventMgr._inst = null;
EventMgr.instance = function () {
    if (!EventMgr._inst) {
        EventMgr._inst = new EventMgr();
    }
    return EventMgr._inst;
};
var eventMgr = EventMgr.instance();


// EVENT GUI

var EventButton = cc.Node.extend({
    ctor: function (isMainEvent) {
        this._super();
        this.isMainEvent = isMainEvent || false;
        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);
        // hinh anh mac dinh cho EventMgr, se duoc hien thi neu khong co animation
        this.button = new ccui.Button("LobbyGUI/btnOffer.png");
        this.addChild(this.button);
        this.button.setScale9Enabled(true);
        this.button.addClickEventListener(this.touchEvent.bind(this));
        this.button.setOpacity(0);
        this.button.setScale(0.7);

        // node animation, de them effect vao button EventMgr, tung EventMgr se cai dat rieng
        this.anim = new cc.Node();
        this.anim.setCascadeColorEnabled(true);
        this.anim.setCascadeOpacityEnabled(true);
        this.addChild(this.anim);

        // notification khi event can hien thi
        this.notify = new cc.Node();
        this.addChild(this.notify);
        this.notify.setPosition(this.isMainEvent ? this.button.getContentSize().width * 0.4 : 30, this.isMainEvent ? this.button.getContentSize().height * 0.4 : 20);

        // label time
        this.time = new ccui.Text("", SceneMgr.FONT_BOLD, 13);
        this.addChild(this.time);
        this.time.ignoreContentAdaptWithSize(true);
        this.time.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.time.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.time.setPosition(0, this.isMainEvent ? -this.button.getContentSize().height * 0.35 : -32);
        this.time.setAnchorPoint(0.5, 0.5);
        this.time.setColor(cc.color(247, 233, 187));
        this.time.enableOutline(cc.color(131, 73, 52), 1);
        this.time.pos = this.time.getPosition();

        this.nodeDownload = new cc.Node();
        this.addChild(this.nodeDownload);
        this.nodeDownload.setScale(0.7);

        this.bgDownload = new cc.Sprite("res/Lobby/EventMgr/bgDownload.png");
        this.nodeDownload.addChild(this.bgDownload);

        this.bgProgress = new cc.Sprite("res/Lobby/EventMgr/bgProgress.png");
        this.bgDownload.addChild(this.bgProgress);
        this.bgProgress.setPosition(this.bgDownload.getContentSize().width * 0.5, this.bgDownload.getContentSize().height * 0.5);

        this.progress = new cc.ProgressTimer(new cc.Sprite("res/Lobby/EventMgr/progress.png"));
        this.progress.setType(cc.ProgressTimer.TYPE_RADIAL);
        this.progress.setPercentage(50);
        this.progress.setPosition(this.bgProgress.getContentSize().width/2,this.bgProgress.getContentSize().height/2);
        this.bgProgress.addChild(this.progress);

        this.lbPercent = new ccui.Text();
        this.bgProgress.addChild(this.lbPercent);
        this.lbPercent.setFontName(SceneMgr.FONT_BOLD);
        this.lbPercent.setString("100");
        this.lbPercent.setPosition(this.bgProgress.getContentSize().width * 0.5, this.bgProgress.getContentSize().height * 0.5);
        this.lbPercent.setFontSize(20);

        this.iconDownload = new cc.Sprite("res/Lobby/EventMgr/iconDownload.png");
        this.bgDownload.addChild(this.iconDownload);
        this.iconDownload.setPosition(this.bgDownload.getContentSize().width * 0.5, this.bgDownload.getContentSize().height * 0.5);

        this.haveData = false;
        this.isDownloading = false;
        this.bgDownload.setVisible(false);
    },

    onEnter: function(){
        this._super();
        this.notify.removeAllChildren();
        var anim = db.DBCCFactory.getInstance().buildArmatureNode("Notify");
        anim.gotoAndPlay("1", -1, -1, 0);
        this.notify.addChild(anim);
    },

    reset: function () {
        this.setVisible(false);
        this.anim.removeAllChildren(false);
        this.notify.setVisible(false);
        this.time.setVisible(false);
        this.button.setVisible(false);
        this.anim.eff = null;
        this.dataEvent = null;
        this.haveData = false;
    },

    hideComponent: function () {
        this.notify.setVisible(false);
        this.time.setVisible(false);
        this.button.setVisible(false);
    },

    touchEvent: function () {
        eventMgr.openEventInGame(this.dataEvent.idEvent);
    },

    setInfo: function (dataEvent) {
        this.dataEvent = dataEvent;
        // Do EventMgr WChallenge an het cac thanh phan cua Button EventMgr, phai show lai
        this.notify.setVisible(true);
        this.time.setVisible(true);
        this.button.setVisible(true);
        this.setVisible(true);
        this.haveData = true;
    },

    waitDownload: function () {
        this.iconDownload.setScaleX(1);
        this.bgDownload.setVisible(true);
        this.bgProgress.setVisible(false);
        this.iconDownload.setVisible(true);
        this.iconDownload.setTexture("res/Lobby/EventMgr/iconDownload.png");
    },

    queueDownload: function () {
        cc.log("QUEUE DOWNLOAD *** ");
        this.bgProgress.setVisible(true);
        this.progress.setPercentage(0);
        this.lbPercent.setVisible(false);
        this.count = 0;
        this.callbackIconDownloadQueue();
        this.iconDownload.setScaleX(0);
    },

    callbackIconDownloadQueue: function () {
        var timeRotate = 0.4;
        if (this.count >= 4) {
            this.count = 0;
        }
        this.iconDownload.setTexture("res/Lobby/EventMgr/iconLoading_" + this.count + ".png");
        this.iconDownload.runAction(cc.sequence(
            cc.scaleTo(timeRotate, 1, 1),
            cc.scaleTo(timeRotate, 0, 1),
            cc.callFunc(this.callbackIconDownload.bind(this))
        ));
        this.count++;
    },

    startDownload: function () {
        this.bgDownload.setVisible(true);
        this.isDownloading = true;
        this.bgProgress.setVisible(true);
        this.progress.setPercentage(0);
        this.lbPercent.setString("0");
        this.lbPercent.setVisible(true);
        this.iconDownload.setVisible(true);
        this.iconDownload.stopAllActions();
        this.lbPercent.stopAllActions();
        var timeRotate = 0.4;
        var timeDelay = 0.0;
        this.bgDownload.setScale(0);
        this.lbPercent.runAction(cc.repeatForever(
            cc.sequence(
                cc.scaleTo(timeRotate, 1, 1),
                cc.delayTime(timeDelay),
                cc.scaleTo(timeRotate, 0, 1.0),
                cc.delayTime(timeDelay + timeRotate * 2)
            )
        ));
        this.count = 0;
        this.callbackIconDownload();
        this.anim.setOpacity(150);
        this.bgDownload.runAction(cc.EaseBackOut(cc.scaleTo(0.5, 1, 1)));
    },

    callbackIconDownload: function () {
        var timeRotate = 0.4;
        var timeDelay = 0.0;
        if (this.count >= 4) {
            this.count = 0;
        }
        this.iconDownload.setTexture("res/Lobby/EventMgr/iconLoading_" + this.count + ".png");
        this.iconDownload.runAction(cc.sequence(
            cc.delayTime(timeDelay + timeRotate * 2),
            cc.scaleTo(timeRotate, 1, 1),
            cc.delayTime(timeDelay),
            cc.scaleTo(timeRotate, 0, 1),
            cc.callFunc(this.callbackIconDownload.bind(this))
        ));
        this.count++;
    },

    updateDownload: function (percent) {
        if (!this.isDownloading) {
            this.startDownload();
        }
        this.progress.setPercentage(percent);
        this.lbPercent.setString(Math.floor(percent));
    },

    finishDownload: function (isFinish) {
        if (!isFinish) {
            // download Fail
            this.lbPercent.setVisible(false);
            this.iconDownload.stopAllActions();
            this.iconDownload.setScaleX(1);
            this.lbPercent.stopAllActions();
            this.iconDownload.setTexture("res/Lobby/EventMgr/iconDownloadFail.png");
            this.anim.setOpacity(150);
            this.bubbleFail = new cc.Sprite("res/Lobby/EventMgr/bubbleFail.png");
            this.nodeDownload.addChild(this.bubbleFail);
            this.bubbleFail.setPosition(60, 50);
            this.bubbleFail.setScale(0);
            this.bubbleFail.runAction(cc.sequence(
                cc.EaseBackOut(cc.scaleTo(0.5, 1, 1)),
                cc.delayTime(0.5),
                cc.EaseBackIn(cc.scaleTo(0, 0, 0)),
                cc.removeSelf(),
                cc.callFunc(this.waitDownload.bind(this))
            ));
        }
        else {
            this.lbPercent.setVisible(false);
            this.iconDownload.stopAllActions();
            this.lbPercent.stopAllActions();
            this.iconDownload.setTexture("res/Lobby/EventMgr/iconDownloadDone.png");
            this.iconDownload.runAction(cc.EaseBackOut(cc.scaleTo(0.3, 1, 1)));
            this.bgDownload.runAction(cc.sequence(
                cc.delayTime(1.0),
                cc.EaseBackIn(cc.scaleTo(0.5, 0, 0))
            ));
            this.anim.setOpacity(255);
        }
    }
})

var GroupEventButton = cc.Node.extend({
    ctor: function () {
        this._super();
        this.resetContent();
    },

    resetContent: function () {
        this.removeAllChildren(true);
        this.arrayButtonEvent = [];
        for (var i = 0; i < GroupEventButton.MAX_BUTTON; i++) {
            var btn = new EventButton();
            this.addChild(btn);
            btn.setPosition(0, btn.getContentSize().height * (i + 0.5));
            // btn.setPosition(50, 100 * (i + 0.5));
            this.arrayButtonEvent.push(btn);
            btn.setVisible(false);
            btn.retain();
        }
    },

    hideAllButton: function () {
        for (var i = 0; i < GroupEventButton.MAX_BUTTON; i++) {
            this.arrayButtonEvent[i].reset();
        }
    },

    addButton: function (dataEvent) {
        cc.log("ADD BUTTON " + dataEvent.idEvent);
        // kiem tra truoc xem EventMgr nay da duoc add chua
        for (var i = 0; i < this.arrayButtonEvent.length; i++) {
            if (this.arrayButtonEvent[i].haveData && this.arrayButtonEvent[i].dataEvent) {
                if (this.arrayButtonEvent[i].dataEvent.idEvent == dataEvent.idEvent) {
                    return this.arrayButtonEvent[i];
                }
            }
        }
        var btn;
        for (var i = 0; i < this.arrayButtonEvent.length; i++) {
            if (!this.arrayButtonEvent[i].haveData) {
                cc.log("CHOOSE BUTTON " + i);
                this.arrayButtonEvent[i].setInfo(dataEvent);
                btn = this.arrayButtonEvent[i];
                break;
            }
        }
        // this.reloadContentSize();
        return btn;
    },

    removeButtonById: function (idEvent) {
        for (var i = 0; i < this.arrayButtonEvent.length; i++) {
            if (this.arrayButtonEvent[i].dataEvent.idEvent == idEvent) {
                this.arrayButtonEvent[i].setVisible(false);
                break;
            }
        }
        this.reloadContentSize();
    },

    reloadContentSize: function () {
        var count = 0;
        try {
            for (var i = 0; i < this.arrayButtonEvent.length; i++) {
                if (this.arrayButtonEvent[i].isVisible()) {
                    this.arrayButtonEvent[i].setPosition(0, this.arrayButtonEvent[i].getContentSize().height * (count + 0.5));
                    count++;
                }
            }
            cc.log("COUNT NE ** " + count);
            this.setContentSize(this.arrayButtonEvent[0].getContentSize().width, this.arrayButtonEvent[0].getContentSize().height * (count));
            this.setPosition(this.getPositionX(), -this.getContentSize().height);
        } catch (e) {
            cc.log("ERROR " + e.stack);
        }
    },

    removeButtonByIndex: function (index) {
        cc.log("Remove buton by Index " + index);
        this.arrayButtonEvent[index].setVisible(false);
        this.reloadContentSize();
    },

})

GroupEventButton.MAX_BUTTON = 3;
