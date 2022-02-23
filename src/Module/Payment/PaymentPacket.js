/**
 * Send Packet
 */
CmdSendGetConfigShop = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_GET_CONFIG_SHOP);

    },
    putData: function (type, version) {
        //pack
        this.packHeader();
        this.putByte(type);
        this.putInt(version);
        //update
        this.updateSize();
    }
});

CmdSendGetConfigShop.GOLD = 1;
CmdSendGetConfigShop.G = 2;
CmdSendGetConfigShop.ALL = 3;

CmdSendPurchaseCard = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_PURCHASE_CARD);
    },

    putData: function (type, code, seri, isBuyGold, isForOffer) {
        this.packHeader();
        this.putInt(type);
        this.putString(code);
        this.putString(seri);
        if (isBuyGold)
            this.putByte(isBuyGold);
        else
            this.putByte(0);
        if (!isForOffer)
            isForOffer = 0;
        this.putByte(isForOffer);
        cc.log("IS FOR OFFER " + isForOffer);
        this.updateSize();
    }
});

CmdSendPurchaseSMS = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_PURCHASE_SMS);
    },

    putData: function (operator, amount, event, isForOffer) {
        cc.log("++SMS Request : " + JSON.stringify(arguments));

        this.packHeader();
        this.putInt(operator);
        this.putInt(amount);
        this.putByte(event);
        this.putByte(isForOffer);
        this.updateSize();
    }
});

CmdSendPurchaseIAPGoogle = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_PURCHASE_IAP_GOOGLE);
    },

    putData: function (data, signature, isOffer) {
        this.packHeader();
        this.putString(data);
        this.putString(signature);
        this.putByte(isOffer);
        cc.log("SEND OFFER *** " + isOffer);
        this.updateSize();
    }
});

CmdSendPurchaseIAPApple = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_PURCHASE_IAP_APPLE);
    },

    putData: function (receiptData) {
        this.packHeader();
        this.putString(receiptData);
        this.updateSize();
    }
});

CmdSendRequestEventShop = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_UPDATE_BUYGOLD);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendPurchaseValidate = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_PURCHASE_IAP_VALIDATE);
    },

    putData: function (packId) {
        this.packHeader();
        this.putInt(packId);
        this.updateSize();
    }
});

CmdSendPurchaseIAPGoogleMultiPortal = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_PURCHASE_IAP_GOOGLE_MULTI_PORTAL);
    },

    putData: function (data, signature, packageName, isOffer) {
        this.packHeader();
        this.putString(data);
        cc.log("SEND PURCHAASE PORTAL " + packageName);
        this.putString(signature);
        this.putString(packageName);
        if (!isOffer)
            isOffer = 0;
        cc.log("IS OFFER **** " + isOffer);
        this.putByte(isOffer);
        this.updateSize();
    }
});

CmdSendBuyGZalo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_BUY_G_ZALO);

    },
    putData: function (number, isBuyGold, isForOffer) {
        //pack
        cc.log("isBuy Gold " + isBuyGold);
        this.packHeader();
        this.putInt(number);
        this.putByte(isBuyGold);
        this.putByte(isForOffer);
        cc.log("IS FOR OFFER " + isForOffer);
        //update
        this.updateSize();
    }
});

CmdSendBuyZaloPayV2 = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_BUY_ZALO_V2);

    },
    putData: function (number, isBuyGold, isForOffer, offerId, packageName) {
        //pack
        cc.log("isBuy Gold " + isBuyGold + " isForOffer " + isForOffer + " offerID " + offerId);
        this.packHeader();
        this.putInt(number);
        this.putByte(isBuyGold);
        this.putByte(isForOffer);
        if (offerId == undefined || offerId == null) this.putInt(-1);
        else this.putInt(offerId);
        if (packageName == undefined || packageName == null) this.putString("");
        else this.putString(packageName);
        //update
        this.updateSize();
    }
});

CmdSendBuyGATM = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_SEND_BUY_G_ATM);

    },
    putData: function (number, bankCode, isBuyGold, isForOffer) {
        //pack
        cc.log(" SEND BANK " + number + " " + bankCode + " " + isBuyGold + " IS OFFER " + isForOffer);
        this.packHeader();
        this.putInt(number);
        this.putString(bankCode);
        this.putByte(isBuyGold);
        this.putByte(isForOffer);
        //update
        this.updateSize();
    }
});

var CmdSendShopGoldSuccess = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PaymentMgr.CMD_SEND_SHOP_GOLD_SUCCESS);
    },
    putData: function (id) {
        //pack
        this.packHeader();
        this.putString(id);
        //update
        this.updateSize();
    }
});

/**
 * Receive Packet
 */

CmdReceivePurchaseCard = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.response = this.getInt();
        this.message = this.getString();
    }
});

CmdReceivePurchaseSMS = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.service = this.getString();
        this.syntax = this.getString();
    }

});

CmdReceivePurchaseIAPGoogle = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.purchaseData = this.getString();
        this.signature = this.getString();
    }
});

CmdReceivePurchaseIAPApple = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.success = [];
        this.failed = [];

        var n = this.getShort();
        for (var i = 0; i < n; i++) {
            var obj = {};
            obj.id = this.getString();
            obj.num = this.getInt();
            this.success.push(obj);
        }

        n = this.getShort();
        for (var i = 0; i < n; i++) {
            var obj = {};
            obj.id = this.getString();
            obj.num = this.getInt();
            this.failed.push(obj);
        }
    },

    getIdSuccess: function () {
        var ret = "";
        for (var i = 0, sizz = this.success.length; i < sizz; i++) {
            if (portalMgr.isPortal() && Config.ENABLE_MULTI_PORTAL)
                ret += fr.PaymentInfo.getPackageID(this.success[i].id);
            else
                ret += this.success[i].id;
            if (i < sizz - 1) {
                ret += ",";
            }
        }
        return ret;
    },

    getIdFailed: function () {
        var ret = "";
        for (var i = 0, sizz = this.failed.length; i < sizz; i++) {
            if (portalMgr.isPortal() && Config.ENABLE_MULTI_PORTAL)
                ret += fr.PaymentInfo.getPackageID(this.failed[i].id);
            else
                ret += this.failed[i].id;
            // ret += this.failed[i].id;
            if (i < sizz - 1) {
                ret += ",";
            }
        }
        return ret;
    },

    getIds: function () {
        return this.getIdSuccess() + "," + this.getIdFailed();
    }
});

CmdReceivedIAPValidate = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.packId = this.getInt();
        this.enable = this.getBool();
    }
});

CmdReceivedBuyGZalo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.errorCode = this.getInt();
        this.stringMessage = this.getString();
        this.zptranstoken = this.getString();
    }
});

CmdReceivedBuyZaloV2 = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.errorCode = this.getInt();
        this.deepLink = this.getString();
        this.qrLink = this.getString();
        this.errMsg = this.getString();
    }
});

CmdReceivedIAPDailyGold = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.gold = this.getInt();
        this.totalDay = this.getInt();
        this.dayReceived = this.getInt();
        this.index = this.getInt();
        this.GStar = this.getInt();
    }
});

CmdReceivedIAPPurchase = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.enables = this.getBools();
        this.times = this.getLongs();
    }
});

CmdReceivedBuyGATM = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.errorCode = this.getInt();
        this.stringMessage = this.getString();
        this.urlDirect = this.getString();
    }
});

CmdReceivedConfigShop = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.type = this.getByte();
        var typeShopBonus = this.getByte();
        if (typeShopBonus == 1) {
            this.isShopBonus = true;
            this.isShopBonusG = false;
        } else if (typeShopBonus == 2) {
            this.isShopBonus = false;
            this.isShopBonusG = true;
        } else if (typeShopBonus == 3) {
            this.isShopBonus = true;
            this.isShopBonusG = true;
        } else {
            this.isShopBonus = false;
            this.isShopBonusG = false;
        }

        this.stringConfigGold = this.getString();
        this.stringConfigG = this.getString();

    }
});

CmdReceiveShopGold = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.error = this.getInt();
        this.isOffer = this.getByte();
        this.channel = this.getInt();
        this.packetId = this.getInt();
        this.goldGet = this.getLong();
        this.voucherGold = this.getLong();
        this.voucherVPoint = this.getInt();
        cc.log("CmdReceiveShopGold: ", JSON.stringify(this));
    }
});

CmdReceiveUpdateBuyGold = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.nBuyGold = this.getInt();

        this.arrayValueG = this.getInts();
        this.arrayIsFirstG = this.getBytes();

        this.arrayValueSMS = this.getInts();
        this.arrayIsFirstSMS = this.getBytes();

        this.arrayValueIAP = this.getInts();
        this.arrayIsFirstIAP = this.getBytes();

        this.arrayValueZing = this.getInts();
        this.arrayIsFirstZing = this.getBytes();

        this.arrayValueATM = this.getInts();
        this.arrayIsFirstATM = this.getBytes();

        this.arrayValueZalo = this.getInts();
        this.arrayIsFirstZalo = this.getBytes();

        if (Config.TEST_SMS_VINA) {
            this.arrayValueSMSViettel = this.getInts();
            this.arrayIsFirstSMSViettel = this.getBytes();

            this.arrayValueSMSMobi = this.getInts();
            this.arrayIsFirstSMSMobi = this.getBytes();

            this.arrayValueSMSVina = this.getInts();
            this.arrayIsFirstSMSVina = this.getBytes();

            this.arrayBuyCount = this.getInts();

            this.lastBuyGoldType = this.getByte();
            this.lastBuyGType = this.getByte();
        }
    }
});

CmdReceivedShopGoldSuccess = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.shopGG = [0];
        this.shopGoldGold = [0];
        this.shopGoldVPoint = [0];
        this.shopGoldVipHour = [0];
        this.shopGG = [0];
        this.shopGG = [0];
        this.shopGG = [0];
        this.readData();
    },
    readData: function () {
        this.purchaseId = this.getStrings();
        this.createdTime = this.getLongs();
        this.paymentType = this.getInts();
        this.value = this.getInts();
        this.shopGG = this.getInts();
        this.shopGoldGold = this.getLongs();
        this.shopGoldVPoint = this.getInts();
        this.shopGoldVipHour = this.getInts();
        this.missionGold = this.getLongs();
        this.offerGold = this.getLongs();
        this.offerDiamond = this.getInts();
        this.offerVPoint = this.getInts();
        this.offerVipHour = this.getInts();
        this.offerItemType = this.getStrings();
        this.offerItemSubType = this.getStrings();
        this.offerItemId = this.getStrings();
        this.offerItemNumber = this.getStrings();

        this.voucherGold = this.getLongs();
        this.voucherVPoint = this.getInts();
        this.vipGold = this.getLongs();
        this.shopEventGold = this.getLongs();
        this.eventId = this.getStrings();
        this.eventTicket = this.getStrings();
        this.eventReason = this.getStrings();

        this.eventVPoint = this.getInts();
        this.eventVipHour = this.getInts();

        this.webGold = this.getLongs();
    }
});