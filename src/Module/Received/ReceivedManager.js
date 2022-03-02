let ReceivedManager = BaseMgr.extend({
    ctor: function () {
        this._super();
        this._callbackOnClose = function () {
        };

        this.arrayReceived = [];
    },

    initListener: function () {
        dispatcherMgr.addListener(PaymentMgr.EVENT_SHOP_GOLD_SUCCESS, this, this.onShopGoldSuccess);
        dispatcherMgr.addListener(LobbyMgr.EVENT_ON_ENTER_FINISH, this, this.openGUI);
    },

    openGUI: function () {
        if (this.arrayReceived <= 0) return;
        var gui = sceneMgr.getGUIByClassName(ReceivedGUI.className);
        if (!gui || !gui.isShow) {
            sceneMgr.openGUI(ReceivedGUI.className);
        }
    },

    onReceivedGold: function (gold, title) {
        cc.log("onReceivedGold ReceivedGUI", gold, title);
        if (gold > 0) {
            this.arrayReceived.push({
                info: [new ReceivedGUIData(ReceivedCell.TYPE_GOLD, gold, "Gold")],
                title: title
            });
            this.openGUI();
        }
    },

    onShopGoldSuccess: function (eventName, cmdShopSuccessGold) {
        cc.log("CAN THE FUNCTION RECEIVED THE INFO", eventName, JSON.stringify(cmdShopSuccessGold));
        this.setShopGoldSuccessInfo(cmdShopSuccessGold);
        this.openGUI();
    },

    setShopGoldSuccessInfo: function (cmd) {
        for (var i = 0; i < cmd["purchaseId"].length; i++) {
            var items = [];
            var itemsOffer = [];
            var textTitle = "";
            var modifyPercent = 0;
            var base = 0;
            var context = "";
            var isShopGold = cmd["shopGoldGold"][i] > 0;
            var receivedGUIData;

            /** GOLD **/
            textTitle = "Vàng";
            modifyPercent = 0;
            base = 0;
            for (var key in ReceivedManager.SUBTYPE_GOLD)
                if (cmd[key][i] > 0) {
                modifyPercent = base > 0? Math.floor(cmd[key][i] * 100 / base) : 0;
                context = LocalizedString.to("SHOP_GOLD_SOURCE_" + ReceivedManager.SUBTYPE_GOLD[key]);
                if (context != "") textTitle = context;
                if (ReceivedManager.SUBTYPE_GOLD[key] === ReceivedManager.SUBTYPE_GOLD.vipGold) {
                    textTitle = StringUtility.replaceAll(textTitle, "@num", vipMgr.getVipLevel());
                }
                receivedGUIData = new ReceivedGUIData(
                    ReceivedCell.TYPE_GOLD,
                    cmd[key][i],
                    textTitle,
                    modifyPercent > 0? "+" + modifyPercent + "%" : ""
                );
                if (ReceivedManager.SUBTYPE_GOLD[key] === ReceivedManager.SUBTYPE_GOLD.offerGold && isShopGold) {
                    itemsOffer.push(receivedGUIData);
                } else {
                    items.push(receivedGUIData);
                }
                if (base === 0) base = cmd[key][i];
            }

            /** V-POINT **/
            textTitle = "VPoint";
            modifyPercent = 0;
            base = 0;
            for (var key in ReceivedManager.SUBTYPE_VPOINT)
                if (cmd[key][i] > 0) {
                    modifyPercent = base > 0? Math.floor(cmd[key][i] * 100 / base) : 0;
                    context = LocalizedString.to("SHOP_GOLD_SOURCE_" + ReceivedManager.SUBTYPE_VPOINT[key]);
                    if (context != "") textTitle = context;
                    receivedGUIData = new ReceivedGUIData(
                        ReceivedCell.TYPE_VPOINT,
                        cmd[key][i],
                        textTitle,
                        modifyPercent > 0? "+" + modifyPercent + "%" : ""
                    );
                    if (ReceivedManager.SUBTYPE_VPOINT[key] === ReceivedManager.SUBTYPE_VPOINT.offerVPoint && isShopGold) {
                        itemsOffer.push(receivedGUIData);
                    } else {
                        items.push(receivedGUIData);
                    }
                    if (base === 0) base = cmd[key][i];
                }

            /** VIP HOURS **/
            cmd["offerVipHour"][i] = 1000;
            textTitle = "Giờ VIP";
            modifyPercent = 0;
            base = 0;
            for (var key in ReceivedManager.SUBTYPE_VIP_HOUR)
                if (cmd[key][i] > 0) {
                    modifyPercent = base > 0? Math.floor(cmd[key][i] * 100 / base) : 0;
                    context = LocalizedString.to("SHOP_GOLD_SOURCE_" + ReceivedManager.SUBTYPE_VIP_HOUR[key]);
                    if (context != "") textTitle = context;
                    receivedGUIData = new ReceivedGUIData(
                        ReceivedCell.TYPE_VHOUR,
                        cmd[key][i],
                        textTitle,
                        modifyPercent > 0? "+" + modifyPercent + "%" : ""
                    );
                    if (ReceivedManager.SUBTYPE_VIP_HOUR[key] === ReceivedManager.SUBTYPE_VIP_HOUR.offerVipHour && isShopGold) {
                        itemsOffer.push(receivedGUIData);
                    } else {
                        items.push(receivedGUIData);
                    }
                    if (base === 0) base = cmd[key][i];
                }

            /** DIAMONDS **/
            key = "offerDiamond";
            if (cmd[key][i] > 0) {
                modifyPercent = base > 0? Math.floor(cmd[key][i] * 100 / base) : 0;
                context = LocalizedString.to("SHOP_GOLD_SOURCE_2");
                receivedGUIData = new ReceivedGUIData(
                    ReceivedCell.TYPE_DIAMOND,
                    cmd[key][i],
                    context
                );
                if (isShopGold) {
                    itemsOffer.push(receivedGUIData);
                } else {
                    items.push(receivedGUIData);
                }
            }

            /** ITEMS **/
            key = "offerItemType";
            if (cmd[key][i].length > 0) {
                var arrayType = cmd.offerItemType[i].split(";");
                var arraySubType = cmd.offerItemSubType[i].split(";");
                var arrayId = cmd.offerItemId[i].split(";");
                var arrayNum = cmd.offerItemNumber[i].split(";");
                for (var i = 0; i < arrayType.length; i++) {
                    context = LocalizedString.to("SHOP_GOLD_SOURCE_2");
                    receivedGUIData = new ReceivedGUIData(
                        ReceivedCell.TYPE_OBJ,
                        arrayNum[i],
                        context,
                        "",
                        new cc.Sprite(StorageManager.getItemIconPath(arrayType[i], arraySubType[i], arrayId[i]))
                    );

                    if (isShopGold) {
                        itemsOffer.push(receivedGUIData);
                    } else {
                        items.push(receivedGUIData);
                    }
                }
            }

            /** TICKETS **/
            key = "eventId";
            if (cmd[key][i].length > 0) {
                var arrayEventId = cmd.eventId[i].split(";");
                var arrayTicketNum = cmd.eventTicket[i].split(";");
                var arrayReason = cmd.eventReason[i].split(";");
                for (var i = 0; i < arrayEventId.length; i++) {
                    if (eventMgr.isInEvent(arrayEventId[j])) {
                        if (arrayNum[j] > 0) {
                            var bonusTicket = new ShopSuccessData();
                            receivedGUIData = new ReceivedGUIData(
                                ReceivedCell.TYPE_OBJ,
                                arrayTicketNum[i],
                                "",
                                "",
                                new cc.Sprite(eventMgr.getOfferTicketImage(arrayEventId[i]))
                            );

                            if (isShopGold) {
                                if (arrayReason[i] == 6) {// nhan tu Offer
                                    itemsOffer.push(bonusTicket)
                                } else {
                                    items.push(bonusTicket);
                                }
                            } else {
                                items.push(receivedGUIData);
                            }
                        }
                    }
                }
            }

            if (items.length > 0) {
                this.arrayReceived.push({
                    purchaseId: cmd["purchaseId"][i],
                    info: items,
                    title: this.shopGoldGetTitle(cmd, i, isShopGold)
                });
            }
            if (itemsOffer.length > 0) {
                this.arrayReceived.push({
                    purchaseId: cmd["purchaseId"][i],
                    info: itemsOffer,
                    title: this.shopGoldGetTitle(cmd, i, true)
                });
            }
        }

        cc.log("WHAT IS THIS INFO", JSON.stringify(this.arrayReceived));
    },

    shopGoldGetTitle: function (cmd, index, isOffer) {
        //Set Info Sources
        var text = LocalizedString.to("SHOP_GOLD_GIFT");
        var s = "";
        if (isOffer) {
            // offer khong Fix Gia
            s = LocalizedString.to("SHOP_GOLD_BUY_OFFER");
        } else if (cmd["shopGG"][index] > 0) {
            s = LocalizedString.to("SHOP_GOLD_BUY_G");
        } else if (cmd.shopGoldGold[index] === 0) {
            if (cmd["offerGold"][index] === 0) {
                s = LocalizedString.to("SHOP_GOLD_BUY_TICKET");
            } else {
                s = LocalizedString.to("SHOP_GOLD_BUY_OFFER");
            }
        } else {
            s = LocalizedString.to("SHOP_GOLD_BUY_GOLD");
        }
        text = StringUtility.replaceAll(text, "@type", s);
        text = text + " " + StringUtility.pointNumber(cmd["value"][index]);
        switch (cmd["paymentType"][index]) {
            case 0:
            case 8:
            case 7:
                s = "G";
                break;
            case 3:
            case 1:
            case 9:
            case 10:
            case 11:
                s = "SMS";
                break;
            case 12:
            case 2:
            case 1602:
                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    s = "Google Play";
                } else {
                    s = "Apple";
                }
                break;
            case 13:
            case 4:
            case 1604:
                s = "Zing Card";
                break;
            case 14:
            case 5:
            case 1605:
                s = "ATM";
                break;
            case 15:
            case 6:
            case 1606:
                s = "ZaloPay";
                break;
        }
        text = text + " " + s;
        return text;
    },

    /**
     * @param {[ReceivedGUIData]} info
     * @param {String} title
     */
    setReceivedGUIInfo: function (info, title) {
        this.arrayReceived.push({
            info: info,
            title: title
        });
    },

    getReceivedGUIInfo: function () {
        if (this.arrayReceived.length <= 0) return null;

        var info = this.arrayReceived[0];
        var purchaseId = this.arrayReceived[0].purchaseId;
        if (purchaseId) {
            var cmdSend = new CmdSendShopGoldSuccess();
            cmdSend.putData(purchaseId);
            this.sendPacket(cmdSend);
            cmdSend.clean();
        }
        return info;
    },

    removeReceivedGUIInfo: function () {
        this.arrayReceived.splice(0, 1);
    },

    isFinishData: function () {
        return this.arrayReceived.length <= 0;
    },

    setCallbackOnClose: function (callback) {
        this._callbackOnClose = callback;
    },

    getCallbackOnClose: function () {
        return this._callbackOnClose;
    },
});
ReceivedManager._instance = null;
ReceivedManager.getInstance = function () {
    if (ReceivedManager._instance === null) {
        ReceivedManager._instance = new ReceivedManager();
    }

    return ReceivedManager._instance;
}
var receivedMgr = ReceivedManager.getInstance();

ReceivedManager.EVENT_RECEIVED_PRIZE = "receivedMgrReceivedPrize"
ReceivedManager.EVENT_SHOP_GOLD_SUCCESS = "receivedMgrShopGoldSuccess"
ReceivedManager.EVENT_CLOSE_GUI = "receivedMgrCloseGUI"

ReceivedManager.SUBTYPE_GOLD = {
    shopGoldGold: 0,
    missionGold: 1,
    offerGold: 2,
    voucherGold: 3,
    vipGold: 4,
    shopEventGold: 5,
    webGold: 7
}
ReceivedManager.SUBTYPE_VPOINT = {
    shopGoldVPoint: 0,
    offerVPoint: 2,
    voucherVPoint: 3,
    eventVPoint: 6
}
ReceivedManager.SUBTYPE_VIP_HOUR = {
    shopGoldVipHour: 0,
    offerVipHour: 2,
    eventVipHour: 6
}


/**
 * @param {Number | String} type
 * @param {Number} number
 * @param {String} title
 * @param {String} modify
 * @param {Object} obj
 */

let ReceivedGUIData = function (type, number, title, modify = "", obj = null) {
    this.type = type;
    this.number = number;
    this.title = title;
    this.modify = modify;
    this.obj = obj;
}