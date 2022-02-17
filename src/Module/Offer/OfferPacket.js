var CmdReceivedNotifyOffer = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.offerId = this.getInts();
        this.typeGroupOffer = this.getInts();
        this.isFirstPay = this.getBytes();
        this.title = this.getStrings();
        this.description = this.getStrings();
        var length = this.getShort();
        this.remainedTime = [];
        for (var i = 0; i < length; i++)
            this.remainedTime[i] = this.getDouble();
        this.paymentChannel = this.getStrings();
        this.operator = this.getStrings();
        this.value = this.getStrings();
        this.realValue = this.getStrings();
        length = this.getShort();
        this.bonusGold = [];
        for (var i = 0; i < length; i++)
            this.bonusGold[i] = this.getDouble();
        this.bonusGStar = this.getInts();
        this.bonusTime = this.getInts();
        var dataEvent = this.getStrings();
        this.offerEvent = [];
        for (var i = 0; i < dataEvent.length; i++) {
            this.offerEvent[i] = JSON.parse(dataEvent[i]);
        }
        this.remainBuy = this.getInts();
        this.maxBuy = this.getInts();
        this.diamond = this.getInts();
        var dataItem = this.getStrings();
        cc.log("DATA ITEM " + dataItem);
        this.offerItem = [];
        for (var i = 0; i < dataItem.length; i++) {
            this.offerItem[i] = JSON.parse(dataItem[i]);
        }
        this.bonusPercentage = this.getInts();
    }
});

var CmdReceivedOfferSuccess = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.offerId = this.getInt();
        this.bonusGold = this.getLong();
        this.bonusGStar = this.getInt();
        this.vipType = this.getByte();
        this.channel = this.getInt();
        this.packetId = this.getInt();
        this.bonusTicket = this.getInt();
        this.bonusTime = this.getInt();
        this.offerEvent = JSON.parse(this.getString());
        this.bonusDiamond = this.getInt();
        this.offerItem = JSON.parse(this.getString());
        // cc.log("offer event success: ", JSON.stringify(this.offerEvent));
    }
});

var CmdSendLogOffer = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(OfferManager.CMD_LOG_OFFER);

    },
    putData: function (offerId, typeError) {
        //pack
        this.packHeader();
        this.putInt(offerId);
        this.putByte(typeError);
        //update
        this.updateSize();
    }
});

var CmdSendResetOfferZalo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(OfferManager.CMD_RESET_OFFER_ZALO);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();

        this.updateSize();
    }
});