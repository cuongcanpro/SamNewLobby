

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
