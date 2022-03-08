
var ShopData = cc.Class.extend({

    ctor: function () {
        this.arrayShopData = [];
    },

    initShopData: function () {
        this.initShopGData();
        this.initShopGoldData();
    },

    initShopGoldData: function () {
        // tab gold<-> gPlay
        this.initShopGoldOneData(Payment.GOLD_IAP, 6, cc.color(213, 188, 40, 0));
        // tab gold <-> G
        this.initShopGoldOneData(Payment.GOLD_G, 6, cc.color(213, 188, 40, 0));
        // tab gold <-> sms
        this.initShopGoldOneData(Payment.GOLD_SMS, 6, cc.color(213, 188, 40, 0));
        // tab gold <-> ATM
        this.initShopGoldOneData(Payment.GOLD_ATM, 6, cc.color(213, 188, 40, 0));
        // tab gold <-> Zalo
        this.initShopGoldOneData(Payment.GOLD_ZALO, 6, cc.color(213, 188, 40, 0));
        // tab gold <-> Zing
        this.initShopGoldOneData(Payment.GOLD_ZING, 6, cc.color(213, 188, 40, 0));
        //event.initTabGoldData(this);
    },

    initShopGoldOneData: function (type, maxSize, color) {
        var src = [];
        var goldIap = paymentMgr.getShopGoldById(type);
        var objOffer = this.initOfferData(type);
        if (objOffer != undefined && objOffer != null) {
            for (var i = 0; i < objOffer.length; i++) {
                src.push(objOffer[i]);
            }
        }
        if (goldIap) {
            var promoDailyPurchase = type != Payment.GOLD_G;
            var isOfferNoPrice = false;
            for (var i = 0; i < goldIap.numPackage; i++) {
                var obj = {};
                var isIap = false;
                if (type == Payment.GOLD_IAP) {
                    var iapEnable = iapHandler.arrayPackageOpen;
                    isIap = true;
                    if (!iapEnable[i] && Config.ENABLE_IAP_LIMIT_TIME) continue;
                    if (Config.ENABLE_IAP_LIMIT_TIME)
                        obj.limitTimeIdx = i;
                }
                var packageShop = goldIap["packages"][i];
                var idx = i + 1;
                if (idx > maxSize) idx = maxSize;
                obj.img = "ShopIAP/IconGold/coin" + idx + ".png";
                obj.id = i;
                obj.goldColor = color;
                var missionObj;
                var typeGetBonus = type;
                switch (type) {
                    case Payment.GOLD_IAP:
                        missionObj = paymentMgr.getIsFirstGoldIAP(packageShop["value"]);
                        break;
                    case Payment.GOLD_ZING:
                        missionObj = paymentMgr.getIsFirstGoldZing(packageShop["value"]);
                        break;
                    case Payment.GOLD_ZALO:
                        missionObj = paymentMgr.getIsFirstGoldZalo(packageShop["value"]);
                        break;
                    case Payment.GOLD_ATM:
                        missionObj = paymentMgr.getIsFirstGoldATM(packageShop["value"]);
                        break;
                    case Payment.GOLD_G:
                        missionObj = paymentMgr.getIsFirstGoldG(packageShop["value"]);
                        break;
                    case Payment.GOLD_SMS:
                        missionObj = paymentMgr.getIsFirstGoldSMS(packageShop["value"]);
                        typeGetBonus = Payment.GOLD_SMS;
                        break;
                }
                this.initInfoPackageGold(obj, goldIap, packageShop, missionObj, isIap);
                obj.type = typeGetBonus;

                //apply voucher
                obj.curVoucher = StorageManager.getInstance().getCurrentShopVoucher();
                if (obj.curVoucher){
                    switch(obj.curVoucher.bonusType){
                        case StorageManager.BONUS_GOLD:
                            obj.goldNew += obj.goldOld * obj.curVoucher.bonusValue / 100;
                            break;
                        case StorageManager.BONUS_VPOINT:
                            obj.vPointOld = obj.vPoint;
                            obj.vPoint += obj.vPoint * obj.curVoucher.bonusValue / 100;
                            break;
                    }
                }

                // apply Offer Noprice
                if (!isOfferNoPrice && offerManager.isSuitableForNoPrice(type, packageShop["value"])) {
                    obj.isOfferNoPrice = true;
                    isOfferNoPrice = true;
                }

                //daily purchase
                if (promoDailyPurchase && DailyPurchaseManager.getInstance().checkOpen() && DailyPurchaseManager.getInstance().checkTodayOpening())
                    if (obj.costConfig >= DailyPurchaseManager.getInstance().getCurrentDayMinMoney()){
                        promoDailyPurchase = false;
                        obj.promoDailyPurchase = true;
                    }

                src.push(obj);
            }
        }

        this.arrayShopData[type] = src;

    },

    initOfferData: function (type) {
        if (!offerManager.haveOffer()) return null;
        var arrayOffer = [];

        for (var i = 0; i < offerManager.arrayOffer.length; i++) {
            var offer = offerManager.arrayOffer[i];
            if (!offerManager.haveOneOfferById(offer.offerId)) {
                continue;
            }
            var typePayment = offer.convertOfferPayment();
            // cc.log("TYPE PAYMENT CONVERT " + typePayment);
            if (typePayment == Payment.GOLD_SMS_VIETTEL) {
                if (type == Payment.GOLD_SMS_VIETTEL) {
                    typePayment = Payment.GOLD_SMS_VIETTEL;
                } else if (type == Payment.GOLD_SMS_MOBI) {
                    typePayment = Payment.GOLD_SMS_MOBI;
                } else if (type == Payment.GOLD_SMS_VINA) {
                    typePayment = Payment.GOLD_SMS_VINA;
                } else {
                    continue;
                }
            } else if (typePayment != type) continue;
            var goldIap = paymentMgr.getShopGoldById(typePayment);

            if (goldIap) {
                var obj = {};
                obj.isOffer = true;
                obj.offerId = offer.offerId;
                if (typePayment == Payment.GOLD_ZALO) {
                    obj.img = "ShopIAP/zalopayOffer.png";
                } else {
                    obj.img = "ShopIAP/shopOffer.png";
                }
                obj.goldColor = cc.color(213, 188, 40, 0);
                obj.offerEvents = [];
                var listBonus = offer.listBonus;

                for (var i = 0; i < listBonus.length; i++) {
                    var bonus = listBonus[i];
                    var type1 = bonus['type'];
                    switch (type1) {
                        case OfferManager.TYPE_GOLD:
                            var configOffer = offer.getConfigOffer();
                            obj.goldOld = configOffer["gold"];
                            obj.goldNew = bonus['value'];
                            obj.bonusValue = offerManager.getPercentSale(offer.offerId, OfferManager.TYPE_GOLD, obj.goldNew);
                            if (obj.bonusValue < 0) obj.bonusValue = "";
                            else obj.bonusValue = "" + obj.bonusValue + "%";
                            break;
                        case OfferManager.TYPE_G_STAR:
                            obj.vPoint = bonus['value'];
                            break;
                        case OfferManager.TYPE_TICKET:
                            obj.offerEvents.push(bonus);
                            break;
                        case OfferManager.TYPE_TIME:
                            obj.hourBonus = bonus['value'];
                            break;
                        case OfferManager.TYPE_DIAMOND:
                            obj.diamondBonus = bonus['value'];
                            break;
                    }
                }
                obj.bonus = offer.description;
                obj.type = typePayment;
                obj.cost = offer.realValue;
                obj.costConfig = offer.valueOffer;
                arrayOffer.push(obj);
            }
        }

        return arrayOffer;
    },

    initShopGData: function () {
        this.initShopGOneData(Payment.G_IAP, 4, cc.color(0, 170, 0, 0));
        this.initShopGOneData(Payment.G_ZALO, 4, cc.color(0, 170, 0, 0));
        this.initShopGOneData(Payment.G_ATM, 4, cc.color(0, 170, 0, 0));
    },

    initShopGOneData: function (type, maxSize, color) {
        var src = [];
        var goldIap = paymentMgr.getShopGById(type);
        if (goldIap) {
            var iapEnable = iapHandler.arrayPackageOpen;
            for (var i = 0; i < goldIap.numPackage; i++) {
                var obj = {};
                var isIap = false;
                if (type == Payment.G_IAP) {
                    if (!iapEnable[i] && Config.ENABLE_IAP_LIMIT_TIME) continue;
                    if (Config.ENABLE_IAP_LIMIT_TIME)
                        obj.limitTimeIdx = i;
                    isIap = true;
                }
                var packageShop = goldIap["packages"][i];
                var idx = (i > maxSize) ? maxSize : i;
                obj.img = "ShopIAP/IconG/xu" + idx + ".png";
                this.initInfoPackageG(obj, goldIap, packageShop, true);
                obj.goldColor = color;
                // obj.bonusGachaCoin = event.getEventBonusTicket(type, packageShop["value"]);

                src.push(obj);
            }
        }
        this.arrayShopData[type] = src;
    },

    initInfoPackageG: function (obj, channelShop, packageShop, isIAP) {
        if (isIAP) {
            obj.id = packageShop["androidId"];
            obj.id_ios = packageShop["iOSId"];
            obj.id_ios_portal = packageShop["portalIOSId"];
            obj.id_portal = packageShop["portalAndroidId"];
            obj.id_multi_portal = packageShop["id_gg_portal"];
            obj.id_multi_ios_portal = packageShop["id_ios_portal"];
            if (!portalMgr.isPortal()) {
                obj.cost = iapHandler.getProductPrice(obj.id, obj.id_ios, packageShop["value"]);
            } else {
                obj.cost = iapHandler.getProductPrice(obj.id_portal, obj.id_ios_portal, packageShop["value"]);
                if (Config.ENABLE_MULTI_PORTAL) {
                    obj.cost = iapHandler.getProductPrice(obj.id_multi_portal, obj.id_multi_ios_portal, packageShop["value"]);
                }
            }
            obj.costConfig = packageShop["value"];
        } else {
            obj.cost = packageShop["value"];
            obj.costConfig = packageShop["value"];
        }
        obj.goldOld = packageShop["coin"];
        obj.star = 0;
        obj.bonus = "";
        obj.bonusValue = 0;
        var bonus = 1;
        obj.goldNew = obj.goldOld * bonus;
    },

    initInfoPackageGold: function (obj, channelShop, packageShop, promoteType, isIAP) {
        if (isIAP) {
            obj.id = packageShop["androidId"];
            obj.id_ios = packageShop["iOSId"];
            obj.id_ios_portal = packageShop["portalIOSId"];
            obj.id_portal = packageShop["portalAndroidId"];
            obj.id_multi_portal = packageShop["id_gg_portal"];
            obj.id_multi_ios_portal = packageShop["id_ios_portal"];
            if (!portalMgr.isPortal()) {
                obj.cost = iapHandler.getProductPrice(obj.id, obj.id_ios, packageShop["value"]);
            } else {
                obj.cost = iapHandler.getProductPrice(obj.id_portal, obj.id_ios_portal, packageShop["value"]);
                if (Config.ENABLE_MULTI_PORTAL) {
                    obj.cost = iapHandler.getProductPrice(obj.id_multi_portal, obj.id_multi_ios_portal, packageShop["value"]);
                }
            }
            obj.costConfig = packageShop["value"];
        } else {
            obj.id_ios = "";
            obj.cost = packageShop["value"];
            obj.costConfig = packageShop["value"];
        }

        obj.goldOld = packageShop["gold"];
        obj.vPoint = packageShop["vPoint"];
        obj.hourBonus = packageShop["hourBonus"];
        obj.goldNew = obj.goldOld;
        obj.bonus = "";
        var vipRate = 0;
        var vipIndex = VipManager.getInstance().getRealVipLevel();
        if (vipIndex > 0) {
            vipRate = packageShop["vipBonus"][vipIndex];
        }
        // cc.log("vipRate: ", JSON.stringify(packageShop["vipBonus"]));
        obj.bonus = "";
        obj.bonusValue = "";
        obj.isBonusVip = false;
        obj.bonusType = promoteType;
        switch (promoteType) {
            case Payment.BONUS_NONE:
                obj.goldNew = obj.goldOld;
                obj.bonus = "";
                obj.bonusValue = 0;
                break;
            case Payment.BONUS_VIP:
                obj.goldNew = parseInt(obj.goldOld * (1 + vipRate / 100));
                var vip = localized("VIP_SHOP_CELL_BENEFIT");

                //obj.bonus = StringUtility.replaceAll(vip, "@per", vipRate);
                obj.bonus = vip;
                obj.bonusValue = vipRate;

                obj.isBonusVip = true;
                break;
            case Payment.BONUS_FIRST:
                obj.bonus = LocalizedString.to("FIRST_BUY_GOLD_IAP");
                obj.bonusValue = packageShop["firstBonus"];
                obj.goldNew = parseInt(obj.goldOld * (1 + packageShop["firstBonus"] / 100));
                // obj.bonusGachaCoin = missionObj["bonusKeyCoin"];
                //   obj.bonusGachaCoin = 0;
                break;
            case Payment.BONUS_SYSTEM:
                obj.bonus = localized("SHOP_BONUS");
                obj.bonusValue = packageShop["shopBonus"];
                obj.goldNew = parseInt(obj.goldOld * (1 + packageShop["shopBonus"] / 100));
                break;
        }
    },

    getDataByPaymentId: function (id) {
        return this.arrayShopData[id];
    }
});
ShopData._instance = null;
ShopData.hasInit = false;
ShopData.getInstance = function () {
    if (!ShopData.hasInit) {
        ShopData._instance = new ShopData();
        ShopData.hasInit = true;
    }
    shopData = ShopData._instance;
    return ShopData._instance;
};
var shopData = ShopData.getInstance();

ChannelPaymentData = cc.Class.extend({
    ctor: function (index, resource, isHot) {
        this.index = index;
        this.resource = resource;
        this.isHot = isHot;
    },

    getResourceSelect: function () {
        return "res/Lobby/ShopIAP/BtnChannelPayment/" + this.resource + "Select.png";
    },

    getResource: function () {
        return "res/Lobby/ShopIAP/BtnChannelPayment/" + this.resource + ".png";
    }
})

var ShopBonusData = cc.Class.extend({
    ctor: function (type, num, idEvent) {
        this.type = type;
        this.num = num;
        this.idEvent = idEvent;
    },

    getSource: function (index) {
        var s = localized("SHOP_GOLD_SOURCE_" + this.arraySubType[index]);
        var percent = Math.floor(this.arrayNum[index] / this.arrayNum[0] * 100);
        if (index != 0)
            return s + " " + percent + "%";
        else
            return s;
    },

    getScaleRate: function () {
        if (this.type == ShopBonusData.TYPE_VPOINT) {
            return 1.0
        } else if (this.type == ShopBonusData.TYPE_TICKET) {
            return 1.0;
        }
        else if (this.type == ShopBonusData.TYPE_HOUR_VIP) {
            return 0.8;
        }
        else if (this.type == ShopBonusData.TYPE_UP_VIP) {
            return 0.8;
        }
        else {
            return 1.0;
        }
    },

    getResourceIcon: function () {
        switch (this.type) {
            case ShopBonusData.TYPE_G:
                return "res/Lobby/ShopIAP/ShopSuccess/iconG.png";
                break;
            case ShopBonusData.TYPE_GOLD:
                return "res/Lobby/ShopIAP/ShopSuccess/iconGold.png";
                break;
            case ShopBonusData.TYPE_VPOINT:
                return "res/Lobby/GUIVipNew/iconVpoint.png";
                break;
            case ShopBonusData.TYPE_HOUR_VIP:
                return "res/Lobby/GUIVipNew/iconTime.png";
                break;
            case ShopBonusData.TYPE_DIAMOND:
                return "res/Lobby/LobbyGUI/iconDiamond.png";
                break;
            case ShopBonusData.TYPE_TICKET:
                return eventMgr.getTicketTexture(this.idEvent);
                break;
            case ShopBonusData.TYPE_UP_VIP:
                return VipManager.getIconVip(this.num);
                break;
        }
    },

    getTitle: function () {
        var s = "";
        if (this.type != ShopBonusData.TYPE_UP_VIP)
            s = this.num + " ";
        switch (this.type) {
            case ShopBonusData.TYPE_G:
                s = s + "G";
                break;
            case ShopBonusData.TYPE_GOLD:
                s = s + "Gold";
                break;
            case ShopBonusData.TYPE_VPOINT:
                s = s + "VPoint";
                break;
            case ShopBonusData.TYPE_HOUR_VIP:
                s = s + localized("SHOP_GOLD_HOUR_VIP");
                break;
            case ShopBonusData.TYPE_DIAMOND:
                s = s + localized("DIAMOND");
                break;
            case ShopBonusData.TYPE_TICKET:
                s = s + eventMgr.getOfferTicketString(this.idEvent);
                break;
            case ShopBonusData.TYPE_UP_VIP:
                s = "Len Vip " + this.num;
                break;
        }
        return s;
    },
})

ShopBonusData.getArrayBonus = function (shopPackage) {
    var arrayBonus = [];
    //vip points
    if (shopPackage.vPoint > 0) {
        arrayBonus.push(new ShopBonusData(ShopBonusData.TYPE_VPOINT, shopPackage.vPoint, ""));
    }

    //time vip
    var levelVip = VipManager.getInstance().getRealVipLevel();
    shopPackage.hourBonus = shopPackage.hourBonus || 0;
    if (shopPackage.vPoint > 0 && shopPackage.hourBonus > 0 && levelVip > 0) {
        arrayBonus.push(new ShopBonusData(ShopBonusData.TYPE_HOUR_VIP, shopPackage.hourBonus, ""));
    }

    //event item bonus
    var arrayBonusTicket = eventMgr.getEventBonusTicket(shopPackage.type, shopPackage.costConfig);
    for (var i = 0; i < arrayBonusTicket.length; i++) {
        if (arrayBonusTicket[i].numTicket > 0) {
            arrayBonus.push(new ShopBonusData(ShopBonusData.TYPE_TICKET, arrayBonusTicket[i].numTicket, arrayBonusTicket[i].idEvent));
        }
    }
    //uptoLevelVip
    if (shopPackage.uptoLevelVip > 0) {
        arrayBonus.push(new ShopBonusData(ShopBonusData.TYPE_UP_VIP, shopPackage.uptoLevelVip, ""));
    }

    return arrayBonus;
}

ShopBonusData.getArrayBonusOffer = function (shopPackage) {
    var arrayBonus = [];
    //vip points
    if (shopPackage.vPoint > 0) {
        arrayBonus.push(new ShopBonusData(ShopBonusData.TYPE_VPOINT, shopPackage.vPoint, ""));
    }

    //time vip
    var levelVip = VipManager.getInstance().getRealVipLevel();
    shopPackage.hourBonus = shopPackage.hourBonus || 0;
    if (shopPackage.vPoint > 0 && shopPackage.hourBonus > 0 && levelVip > 0) {
        arrayBonus.push(new ShopBonusData(ShopBonusData.TYPE_HOUR_VIP, shopPackage.hourBonus, ""));
    }

    //bonus diamond
    if (shopPackage.diamondBonus > 0) {
        arrayBonus.push(new ShopBonusData(ShopBonusData.TYPE_DIAMOND, shopPackage.diamondBonus, ""));
    }

    //event item bonus
    var arrayBonusTicket = shopPackage.offerEvents;
    for (var i = 0; i < arrayBonusTicket.length; i++) {
        var eOffer = arrayBonusTicket[i];
        if (eOffer["value"] > 0) {
            arrayBonus.push(new ShopBonusData(ShopBonusData.TYPE_TICKET, eOffer["value"], eOffer["eventId"]));
        }
    }


    return arrayBonus;
}

ShopBonusData.TYPE_G = 0;
ShopBonusData.TYPE_GOLD = 1;
ShopBonusData.TYPE_VPOINT = 2;
ShopBonusData.TYPE_HOUR_VIP = 3;
ShopBonusData.TYPE_TICKET = 4;
ShopBonusData.TYPE_DIAMOND = 5;
ShopBonusData.TYPE_UP_VIP = 6;
