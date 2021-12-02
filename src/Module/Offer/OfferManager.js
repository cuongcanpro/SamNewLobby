/**
 * Created by CPU02314_LOCAL on 12/17/2019.
 */

var OfferData = cc.Class.extend({
    ctor: function () {
        this.timeOffer = 3430;
        this.listBonus = [];
        this.valueOffer = 50000;
        this.typeOffer = "zing";
        this.title = "Offer";
        this.description = "Mus SMS @money de nhan thuong";
        this.typeGroupOffer = 0;
        this.eventId = "";
        this.offerId = -1;
        this.realValue = 0;
        this.isFirstPay = false;
        this.remainBuy = 0;
        this.maxBuy = 0;
        // var obj = {"type": 0, "value": 100};
        // this.listBonus.push(obj);
        //
        // obj = {"type": 1, "value": 100};
        // this.listBonus.push(obj);
        //
        // obj = {"type": 2, "value": 1};
        // this.listBonus.push(obj);
    },



    getTimeLeft: function () {
        var time = this.timeOffer - new Date().getTime();
        if (time <= 0) {
            this.offerId = -1;
            return 0;
        }
        return time;
    },

    getTimeLeftInSecond: function () {
        return this.getTimeLeft() / 1000;
    },

    loadConfigOffer: function () {
        try {
            cc.log("LOAD CONFING OFFER *********************** " + this.valueOffer + " ID " + this.offerId);
            var value = this.valueOffer;
            var config = gamedata.gameConfig.getShopGoldById(offerManager.convertOfferPayment(this.typeOffer));
            if (config) {
                for (var i = 0; i < config.numPackage; i++) {
                    var packageShop = config["packages"][i];
                    if (packageShop["value"] == value) {
                        this.configOffer = packageShop;
                        cc.log("FLJKDSFLDSJK " + JSON.stringify(this.configOffer));
                        return;
                    }
                }
            }

        } catch (ex) {
            cc.log("JFKLDSJFDKL: ERROR " + ex.stack);
        }
    },

    getConfigOffer: function () {
        try {
            cc.log("LOAD CONFING OFFER *********************** " + this.valueOffer + " ID " + this.offerId);
            var value = this.valueOffer;
            var config = gamedata.gameConfig.getShopGoldById(offerManager.convertOfferPayment(this.typeOffer));
            if (config) {
                for (var i = 0; i < config.numPackage; i++) {
                    var packageShop = config["packages"][i];
                    if (packageShop["value"] == value) {
                        this.configOffer = packageShop;
                        return this.configOffer;
                    }
                }
            }
            cc.log("FLJKDSFLDSJK " + JSON.stringify(config));
        } catch (ex) {
            cc.log("JFKLDSJFDKL: ERROR " + ex.stack);
        }
        return null;
    }
});

var OfferManager = cc.Class.extend({
    ctor: function () {
        this.kickInGame = false;
        this.groupOffer = null;
        this.arrayOffer = [];
    },

    resetData: function () {
        this.arrayOffer = [];
    },

    setGroupOffer: function (pOffer) {
        if (pOffer.groupOffer)
            return;
        cc.log("RUN HERRE *** 2 ");
        this.groupOffer = new GroupOfferButton();
        this.groupOffer.retain();
        pOffer.addChild(this.groupOffer);
        pOffer.groupOffer = this.groupOffer;
        this.addOfferToGroup();
    },

    addOfferToGroup: function () {
        if (!this.groupOffer)
            return;
        cc.log("RUN HERRE *** 1 " + this.arrayOffer.length);
        for (var i = 0; i < this.arrayOffer.length; i++) {
            this.groupOffer.addButton(this.arrayOffer[i]);
        }
    },

    updateOffer: function () {
        //this.removeOfferNotAvailable();
        this.groupOffer.updateOffer();
        this.groupOffer.setPositionY(-this.groupOffer.getContentSize().height);
    },

    isOfferIAP: function () {
        var isOffer = cc.sys.localStorage.getItem(OfferManager.IAP_OFFER_CACHE);
        if (!isOffer || isOffer === undefined) {
            isOffer = 0;
        }
        return parseInt(isOffer);
    },

    setOfferIAP: function (isOffer) {
        cc.sys.localStorage.setItem(OfferManager.IAP_OFFER_CACHE, isOffer);
    },

    haveOffer: function () {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].getTimeLeft() > 0) {
                return true;
            }
        }
        return false;
    },

    haveOneOfferById: function (offerId) {
        var offer = this.getOfferById(offerId);
        if (offer == null)
            return false;
        return offer.getTimeLeft() > 0;
    },

    getOfferByGroup: function (typeGroupOffer) {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].typeGroupOffer == typeGroupOffer)
                return this.arrayOffer[i];
        }
        return null;
    },

    getOfferById: function (offerId) {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].offerId == offerId)
                return this.arrayOffer[i];
        }
        return null;
    },

    getPercentSale: function (offerId, typeOfferBonus, value, eventId) {
        // cc.log("TYPE NE ***** " + typeOfferBonus);
        var oldValue = 0;
        var percent = 0;
        var offer = this.getOfferById(offerId);
        cc.log("OFFER NE " + JSON.stringify(offer) + " TYPE OFFER BONUS " + typeOfferBonus);
        cc.log(" CONFIG OFFER " + JSON.stringify(offer.configOffer));
        var configOffer = offer.getConfigOffer();
        if (configOffer) {
            switch (typeOfferBonus) {
                case OfferManager.TYPE_GOLD:
                    oldValue = configOffer["gold"];
                    cc.log("OLD VALUE la " + oldValue);
                    break;
                case OfferManager.TYPE_G_STAR:
                    oldValue = configOffer["vPoint"];
                    break;
                case OfferManager.TYPE_TIME:
                    oldValue = configOffer["hourBonus"];
                    break;
                case OfferManager.TYPE_TICKET:
                    cc.log("GET PERCENT TICKET " + offer.typeOffer + " " + eventId);
                    var config = event.getEventTicketConfig(this.convertOfferPayment(offer.typeOffer), eventId);
                    cc.log("CONFIG TICKET " + JSON.stringify(config));
                    //var convert = this.valueOffer / 100;
                    if (config && config != null && config != undefined)
                        oldValue = config[offer.valueOffer];
                    else
                        oldValue = 0; // khong lay duoc config ve -> gan gia tri lon de coi nhu khong co khuyen mai
                    break;
                case OfferManager.TYPE_DIAMOND:
                    oldValue = 0;
                    break;
            }
            if (oldValue > 0)
                percent = Math.floor(value / oldValue * 100 - 100);
            else percent = 0;
        }
        // cc.log("PERCENT SALE **** " + percent);
        return percent;
    },

    convertOfferPayment: function (typeOfferPayment) {
        if (typeOfferPayment == OfferManager.TYPE_IAP) {
            return Payment.GOLD_IAP;
        } else if (typeOfferPayment == OfferManager.TYPE_SMS) {
            return Payment.GOLD_SMS_VIETTEL;
        } else if (typeOfferPayment == OfferManager.TYPE_ZALOPAY) {
            return Payment.GOLD_ZALO;
        } else if (typeOfferPayment == OfferManager.TYPE_ZING) {
            return Payment.GOLD_ZING;
        } else if (typeOfferPayment == OfferManager.TYPE_ATM) {
            return Payment.GOLD_ATM;
        }
    },

    checkHaveOfferPayment: function (id) {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            var idPayment = this.convertOfferPayment(this.arrayOffer[i].typeOffer);
            if (idPayment == Payment.GOLD_SMS_VIETTEL)
                idPayment = Payment.GOLD_SMS;
            if (idPayment == id) {
                return true;
            }
        }
        return false;
    },

    reloadOffer: function () {
        if (this.arrayOffer.length == 0)
            return;
        if (gamedata.payments.length == 0)
            return;
        for (var i = 0; i < this.arrayOffer.length; i++) {
            var offer = this.arrayOffer[i];
            var saveOfferId = offer.offerId;
            var cmdLog = new CmdSendLogOffer();
            var config;
            if (gamedata.gameConfig) {
                config = gamedata.gameConfig.getShopGoldById(this.convertOfferPayment(offer.typeOffer));
            } else {
                offer.offerId = -1;
                return;
            }
            if (!config || config["isMaintained"][0]) {
                // cc.log("NOT SHOW 1 " + JSON.stringify(gamedata.gameConfig.arrayShopGoldConfig) + " " + this.convertOfferPayment(this.typeOffer));
                offer.offerId = -1;
                // detect reason
                if (offer.typeOffer == Payment.GOLD_IAP) {
                    if (!cc.sys.isNative) {
                        cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_WEB);
                    } else if (cc.sys.os == cc.sys.OS_IOS) {
                        cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_IOS);
                    } else {
                        cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_ENABLE_PAYMENT);
                    }
                } else {
                    cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_ENABLE_PAYMENT);
                }
            } else if (offer.typeOffer == Payment.GOLD_IAP) {
                if (!cc.sys.isNative) {
                    offer.offerId = -1;
                    cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_WEB);
                } else if (cc.sys.os == cc.sys.OS_IOS) {
                    offer.offerId = -1;
                    cmdLog.putData(saveOfferId, OfferManager.NOT_SHOW_IOS);
                }
            } else {
                cmdLog.putData(saveOfferId, OfferManager.SHOW_BUTTON);
            }
            GameClient.getInstance().sendPacket(cmdLog);
        }
        this.removeOfferNotAvailable();
    },

    removeOfferNotAvailable: function () {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].offerId < 0) {
                this.arrayOffer.splice(i, 1);
                i--;
            }
        }
    },

    showOfferGUIKick: function () {
        if (!this.haveOffer()) {
            return;
        }
        if (this.kickInGame) {
            this.showOfferGUI(true, this.arrayOffer[0]);
        }
        this.kickInGame = false;
    },

    showOfferGUILogin: function () {
        cc.log("showOfferGUILogin");
        if (!this.haveOffer()) {
            return;
        }

        var cur = sceneMgr.getRunningScene().getMainLayer();
        if (cur instanceof LobbyScene) {
            // var random = Math.floor(Math.random() * this.arrayOffer.length * 0.999);
            // this.showOfferGUI(true, this.arrayOffer[random]);
            var show = this.showOfferPrioriy(OfferManager.TYPE_GROUP_ZALO);
            if (!show) {
                show = this.showOfferPrioriy(OfferManager.TYPE_GROUP_PROMO);
            }
            if (!show) {
                this.showOfferPrioriy(OfferManager.TYPE_GROUP_NORMAL);
            }
        }
        // var check = cc.sys.localStorage.getItem("showOfferGUILogin" + gamedata.userData.uID);
        // //check = false;
        // if (!check || check == undefined || check == null) {
        //     cc.sys.localStorage.setItem("showOfferGUILogin" + gamedata.userData.uID, 1);
        // } else {

        // }
    },

    showOfferPrioriy: function (type) {
        for (var i = 0; i < this.arrayOffer.length; i++) {
            if (this.arrayOffer[i].typeGroupOffer == type) {
                this.showOfferGUI(true, this.arrayOffer[i]);
                return true;
            }
        }
        return false;
    },

    getResourceTypePayment: function (typePayment) {
        var resource;
        switch (typePayment) {
            case OfferManager.TYPE_ATM:
                resource = "Lobby/Offer/iconATM.png";
                break;
            case OfferManager.TYPE_SMS:
                resource = "Lobby/Offer/iconSMS.png";
                break;
            case OfferManager.TYPE_ZALOPAY:
                resource = "Lobby/Offer/iconZaloPay.png";
                break;
            case OfferManager.TYPE_ZING:
                resource = "Lobby/Offer/iconZing.png";
                break;
            case OfferManager.TYPE_IAP:
                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    resource = "Lobby/Offer/iconGoogle.png";
                } else {
                    resource = "Lobby/Offer/iconApple.png";
                }
                break;
        }
        return resource;
    },

    showOfferGUI: function (forceShow, offer) {
        var show = false;
        if (forceShow) {
            show = true;
        }
        //else {
        //    var today = new Date();
        //    var check = cc.sys.localStorage.getItem("showOfferGUI") + "";
        //    if (check != today.toISOString().substring(0, 10)) {
        //        cc.sys.localStorage.setItem("showOfferGUI", today.toISOString().substring(0, 10));
        //        show = true;
        //    }
        //}

        // var gui = sceneMgr.getGUIByClassName(GUIOffer.className);
        // if (gui && gui.isShow) {
        //     show = false;
        //     cc.log("OFFER IS SHOW ******** ");
        // }

        if (show) {
            var idPopUp = PopUpManager.OFFER;
            if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_NORMAL) {
                idPopUp = PopUpManager.OFFER;
            }
            else {
                idPopUp = PopUpManager.OFFER_ZALO;
            }
            if (popUpManager.canShow(idPopUp)) {
                var cmdLog = new CmdSendLogOffer();
                cmdLog.putData(offer.offerId, OfferManager.SHOW_POP_UP);
                GameClient.getInstance().sendPacket(cmdLog);

                var gui;
                if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_NORMAL) {
                    cc.log("SHOW HERE *********** ");
                    if (offer.offerId == 173 || offer.offerId == 174 || offer.offerId == 175 || offer.offerId == 176) {
                        gui = sceneMgr.openGUI(GUIOfferQuocKhanh.className, GUIOfferQuocKhanh.tag, GUIOfferQuocKhanh.tag);
                        gui.setInfo(offer);
                    }
                    else {
                        gui = sceneMgr.openGUI(GUIOffer.className, GUIOffer.tag, GUIOffer.tag);
                        gui.setInfo(offer);
                    }
                }
                else if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_ZALO) {
                    if (offer.isFirstPay) {
                        gui = sceneMgr.openGUI(GUIOfferZaloFirstPay.className, GUIOfferZaloFirstPay.tag, GUIOfferZaloFirstPay.tag);
                        gui.setInfo(offer);
                    }
                    else {
                        gui = sceneMgr.openGUI(GUIOfferZaloRepay.className, GUIOfferZaloRepay.tag, GUIOfferZaloRepay.tag);
                        gui.setInfo(offer);
                    }
                }
                else {
                    if (offer.isFirstPay) {
                        gui = sceneMgr.openGUI(GUIOfferZaloFirstPay.className, GUIOfferZaloFirstPay.tag, GUIOfferZaloFirstPay.tag);
                        gui.setInfo(offer);
                    }
                    else {
                        gui = sceneMgr.openGUI(GUIOfferRepay.className, GUIOfferRepay.tag, GUIOfferRepay.tag);
                        gui.setInfo(offer);
                    }
                }

            }
        }
    },

    onReceived: function (cmd, data) {
        //return;
        switch (cmd) {
            case OfferManager.CMD_NOTIFY_OFFER:
                this.arrayOffer = [];
                var cmd = new CmdReceivedNotifyOffer(data);
                cc.log("CMD_NOTIFY_OFFER " + JSON.stringify(cmd));
                for (var i = 0; i < cmd.offerId.length; i++) {
                    var offer = new OfferData();
                    offer.typeOffer = cmd.paymentChannel[i];
                    offer.offerId = cmd.offerId[i];
                    offer.timeOffer = cmd.remainedTime[i] + new Date().getTime();
                    offer.valueOffer = parseInt(cmd.value[i]);
                    offer.title = cmd.title[i];
                    offer.description = cmd.description[i];
                    offer.realValue = cmd.realValue[i];
                    offer.typeGroupOffer = cmd.typeGroupOffer[i];
                    offer.isFirstPay = cmd.isFirstPay[i];
                    offer.remainBuy = cmd.remainBuy[i];
                    offer.maxBuy = cmd.maxBuy[i];
                    var cheat = false;
                    if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_PROMO) {
                        // vai tro cua realValue va value trong Offer nay lai nguoc voi ZaloPay -> Dao vai tro lai
                        var temp = offer.valueOffer;
                        offer.valueOffer = offer.realValue;
                        offer.realValue = temp;
                    }
                    //cheat = true;

                    if (cheat) {
                        offer.offerId = 4;
                        offer.typeOffer = OfferManager.TYPE_ATM;
                        offer.timeOffer = 10000 + new Date().getTime();
                        cmd.bonusGold = 200000000;
                        cmd.bonusGStar = 1000;
                        offer.valueOffer = 50000;
                        offer.description = "khi nao can mua ao giap sat";
                    }

                    if (cmd.bonusGold[i] > 0) {
                        var obj = {"type": OfferManager.TYPE_GOLD, "value": cmd.bonusGold[i]};
                        offer.listBonus.push(obj);
                    }
                    if (cmd.bonusGStar[i] > 0) {
                        var obj = {"type": OfferManager.TYPE_G_STAR, "value": cmd.bonusGStar[i]};
                        offer.listBonus.push(obj);
                    }
                    if (cmd.offerEvent[i] && cmd.offerEvent[i].length > 0) {
                        for (var j = 0; j < cmd.offerEvent[i].length; j++) {
                            var tmp = cmd.offerEvent[i][j];
                            var eventId = event.getEventIdByName(tmp["eventName"]);
                            var obj = {
                                "type": OfferManager.TYPE_TICKET,
                                "eventId": tmp["eventName"],
                                "value": tmp['ticket']
                            };
                            if (tmp["ticket"] > 0)
                                offer.listBonus.push(obj);
                        }
                    }
                    if (cmd.bonusTime[i] > 0) {
                        var obj = {"type": OfferManager.TYPE_TIME, "value": cmd.bonusTime[i]};
                        offer.listBonus.push(obj);
                    }
                    if (cmd.diamond[i] > 0) {
                        var obj = {"type": OfferManager.TYPE_DIAMOND, "value": cmd.diamond[i]};
                        offer.listBonus.push(obj);
                    }
                    // net khong co bonus nao thi coi nhu khong co Offer
                    if (offer.listBonus.length != 0) {
                        this.arrayOffer.push(offer);
                    }
                }

                this.reloadOffer();
                if (this.haveOffer()) {
                    for (var i = 0; i < this.arrayOffer.length; i++) {
                        this.arrayOffer[i].loadConfigOffer();
                    }
                }

                this.addOfferToGroup();

                var cur = sceneMgr.getRunningScene().getMainLayer();
                if (cur instanceof LobbyScene && !offerManager.buySuccess) {
                    // show Offer gui sau khi login
                    setTimeout(this.showOfferGUILogin.bind(this), 1000);
                }
                offerManager.buySuccess = false;
                break;
            case OfferManager.CMD_OFFER_SUCCESS:
                var cmd = new CmdReceivedOfferSuccess(data);
                //cmd.bonusGold = 0;
                //cmd.bonusGStar = 0;
                //cmd.bonusTime = 0;
                //cmd.bonusTicket = 10;
                cc.log("CMD_OFFER_SUCCESS" + JSON.stringify(cmd));
                var arrayBonus = [];
                if (cmd.bonusGold > 0) {
                    var obj = {"type": OfferManager.TYPE_GOLD, "value": cmd.bonusGold};
                    arrayBonus.push(obj);
                }
                if (cmd.bonusGStar > 0) {
                    var obj = {"type": OfferManager.TYPE_G_STAR, "value": cmd.bonusGStar};
                    arrayBonus.push(obj);
                }
                //if (cmd.vipType >= 0) {
                //    var obj = {"type": OfferManager.TYPE_VIP, "value": cmd.vipType};
                //    arrayBonus.push(obj);
                //}
                // if (cmd.bonusTicket > 0 && event.isInEvent()) {
                //     var obj = {"type": OfferManager.TYPE_TICKET, "value": cmd.bonusTicket};
                //     arrayBonus.push(obj);
                // }
                // else {
                //     cmd.bonusTicket = 0;
                // }

                var oEvent = [];
                if (cmd.offerEvent && cmd.offerEvent.length > 0) {
                    for (var i = 0; i < cmd.offerEvent.length; i++) {
                        var tmp = cmd.offerEvent[i];
                        var eventId = event.getEventIdByName(tmp['eventName']);
                        var obj = {
                            "type": OfferManager.TYPE_TICKET,
                            "eventId": tmp['eventName'],
                            "value": tmp['ticket']
                        };
                        if (tmp["ticket"] > 0) {
                            arrayBonus.push(obj);
                            oEvent.push(obj);
                        }
                    }
                }

                if (arrayBonus.length == 0)
                    return;

                if (cmd.bonusTime > 0) {
                    var obj = {"type": OfferManager.TYPE_TIME, "value": cmd.bonusTime};
                    arrayBonus.push(obj);
                }
                if (cmd.bonusDiamond > 0){
                    var obj = {"type": OfferManager.TYPE_DIAMOND, "value": cmd.bonusDiamond};
                    arrayBonus.push(obj);
                }

                var dataOffer = {
                    error: cmd.getError(),
                    isOffer: true,
                    channel: cmd.channel,
                    packetId: cmd.packetId,
                    goldGet: cmd.bonusGold
                };
                offerManager.buySuccess = true;
                VipManager.openChangeGoldSuccess(dataOffer, cmd.bonusGStar, cmd.bonusTime, oEvent, cmd.bonusDiamond);
                break;
        }
    }
});

OfferManager.getValueOfferToBuy = function (offer) {
    if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_PROMO) {
        // rieng promo loai nay phai dao nguoc gia tri goi mua, goi mua thuc chat lai la realValue, do ben tren da doi 2 gia tri de xu ly chung 1 Flow duoi Client
        return offer.realValue;
    }
    else {
        return offer.valueOffer;
    }
};

OfferManager.getValueOfferToShow = function (offer) {
    if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_ZALO || offer.typeGroupOffer == OfferManager.TYPE_GROUP_PROMO) {
        return offer.realValue;
    }
    else {
        return offer.valueOffer;
    }
};

OfferManager.buyOffer = function (isInShop, offerId) {
    var offer = offerManager.getOfferById(offerId);
    if (!offerManager.haveOneOfferById(offerId)) {
        var msg = LocalizedString.to("OFFER_ERROR_1");

        if (offer.getTimeLeft() <= 0) {
            msg = LocalizedString.to("OFFER_ERROR_2");
        }
        sceneMgr.showOKDialog(msg);
        return;
    }

    if (offer.typeOffer == OfferManager.TYPE_SMS) {
        var networkInfo = gamedata.getNetworkTelephone();
        var operator = 0;
        // var type = this.getIdSMS(networkInfo);
        var configSMS;
        var type = 0;
        switch (networkInfo) {
            case Constant.ID_VIETTEL: {
                operator = PanelCard.BTN_VIETTEL;
                configSMS = gamedata.gameConfig.getShopGoldById(Payment.GOLD_SMS_VIETTEL);
                type = Payment.GOLD_SMS_VIETTEL;
                break;
            }
            case Constant.ID_MOBIFONE: {
                operator = PanelCard.BTN_MOBIFONE;
                configSMS = gamedata.gameConfig.getShopGoldById(Payment.GOLD_SMS_MOBI);
                type = Payment.GOLD_SMS_MOBI;
                break;
            }
            case Constant.ID_VINAPHONE: {
                operator = PanelCard.BTN_VINAPHONE;
                configSMS = gamedata.gameConfig.getShopGoldById(Payment.GOLD_SMS_VINA);
                type = Payment.GOLD_SMS_VINA;
                break;
            }
            default : {
                operator = 0;
                break;
            }
        }

        if (operator == 0) {
            sceneMgr.openGUI(SimOperatorPopup.className, SimOperatorPopup.TAG, SimOperatorPopup.TAG).setAmount(OfferManager.getValueOfferToBuy(offer), Payment.CHEAT_PAYMENT_OFFER);
        } else {
            //var configSMS = gamedata.gameConfig.getShopGoldById(Payment.GOLD_SMS);
            if (!configSMS || configSMS["isMaintained"][0]) {
                sceneMgr.openGUI(GUIMaintainSMS.className, GUIMaintainSMS.TAG, GUIMaintainSMS.TAG);
            } else {
                iapHandler.requestSMSSyntax(operator, OfferManager.getValueOfferToBuy(offer), Payment.CHEAT_PAYMENT_OFFER, type, Payment.IS_OFFER);
            }
        }
    } else if (offer.typeOffer == OfferManager.TYPE_ATM) {
        if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
            iapHandler.fakePayment(OfferManager.getValueOfferToBuy(offer), Constant.GOLD_ATM, Payment.CHEAT_PAYMENT_OFFER);
        } else {
            var gui = sceneMgr.openGUI(GUIBank.className, GUIBank.TAG, GUIBank.TAG);
            gui.setInfoBuy(OfferManager.getValueOfferToBuy(offer), true, Payment.IS_OFFER);
        }
    } else if (offer.typeOffer == OfferManager.TYPE_ZALOPAY) {
        // if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
        //     iapHandler.fakePayment(offerManager.valueOffer, Constant.GOLD_ZALO, Payment.CHEAT_PAYMENT_OFFER);
        // }
        // else {
        //}
        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.BEGIN + "BUY_ZALO");
        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "CLICK_OFFER");
        if (Config.ENABLE_NEW_OFFER) {
            if (CheckLogic.checkZaloPay()) {
                var curGui = sceneMgr.getRunningScene().getMainLayer();
                var msg = LocalizedString.to("ZALOPAY_MSG");
                msg = StringUtility.replaceAll(msg, "@value", StringUtility.pointNumber(OfferManager.getValueOfferToShow(offer)));
                sceneMgr.showOkCancelDialog(msg, curGui, function (btnId) {
                    if (btnId == Dialog.BTN_OK) {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "SEND_BUY");
                        var packageName = fr.platformWrapper.getPackageName();
                        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(5);
                        var cmd = new CmdSendBuyZaloPayV2();
                        cmd.putData(OfferManager.getValueOfferToBuy(offer), 1, Payment.IS_OFFER, offer.offerId, packageName);
                        GameClient.getInstance().sendPacket(cmd);
                        cmd.clean();
                    }
                });
            }
        }
        else {
            if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                iapHandler.fakePayment(OfferManager.getValueOfferToBuy(offer), Constant.GOLD_ZALO, Payment.CHEAT_PAYMENT_OFFER);
            }
            else {
                sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                var cmd = new CmdSendBuyGZalo();
                cmd.putData(OfferManager.getValueOfferToBuy(offer), 1, Payment.IS_OFFER);
                GameClient.getInstance().sendPacket(cmd);
            }
        }
    } else if (offer.typeOffer == OfferManager.TYPE_ZING) {
        if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
            iapHandler.fakePayment(OfferManager.getValueOfferToBuy(offer), Constant.GOLD_ZING, Payment.CHEAT_PAYMENT_OFFER);
        } else {
            var gui = sceneMgr.openGUI(GUIInputCard.className, GUIInputCard.TAG, GUIInputCard.TAG);
            gui.setInfo(OfferManager.getValueOfferToBuy(offer), Payment.IS_OFFER);
        }
    } else if (offer.typeOffer == OfferManager.TYPE_IAP) {
        var goldIap = gamedata.gameConfig.getShopGoldById(Payment.GOLD_IAP);
        var obj = {};
        if (goldIap) {
            for (var i = 0; i < goldIap.numPackage; i++) {

                var packageShop = goldIap["packages"][i];
                if (packageShop["value"] == OfferManager.getValueOfferToBuy(offer)) {
                    obj.id = packageShop["androidId"];
                    obj.id_ios = packageShop["iOSId"];
                    obj.id_ios_portal = packageShop["portalIOSId"];
                    obj.id_portal = packageShop["portalAndroidId"];
                    obj.id_multi_portal = packageShop["id_gg_portal"];
                    obj.id_multi_ios_portal = packageShop["id_ios_portal"];
                    obj.cost = iapHandler.getProductPrice(obj.id, obj.id_ios, packageShop["value"]);
                    obj.costConfig = packageShop["value"];
                }
            }
        }
        if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
            iapHandler.fakePayment(obj.costConfig, Constant.GOLD_IAP, Payment.CHEAT_PAYMENT_OFFER);
        } else {
            cc.log("PURCHASE IAP ***** ");
            offerManager.setOfferIAP(1);
            iapHandler.purchaseItem(iapHandler.getProductIdIAP(obj));
        }
    }

    popUpManager.removePopUp(PopUpManager.OFFER);
};

OfferManager.TYPE_GOLD = 0;
OfferManager.TYPE_G_STAR = 1;
OfferManager.TYPE_VIP = 2;
OfferManager.TYPE_TICKET = 3;
OfferManager.TYPE_TIME = 4;
OfferManager.TYPE_DIAMOND = 5;

OfferManager.TYPE_SMS = "sms";
OfferManager.TYPE_IAP = "iap";
OfferManager.TYPE_ZING = "zing";
OfferManager.TYPE_ATM = "atm";
OfferManager.TYPE_ZALOPAY = "zalopay";

OfferManager.TYPE_GROUP_NORMAL = 0;
OfferManager.TYPE_GROUP_ZALO = 1;
OfferManager.TYPE_GROUP_PROMO = 2;

OfferManager.NOT_SHOW_WEB = 2;
OfferManager.NOT_SHOW_ENABLE_PAYMENT = 3;
OfferManager.NOT_SHOW_IOS = 4;
OfferManager.SHOW_BUTTON = 0;
OfferManager.SHOW_POP_UP = 1;

OfferManager.CMD_NOTIFY_OFFER = 8934;
OfferManager.CMD_OFFER_SUCCESS = 8932;
OfferManager.CMD_LOG_OFFER = 8933;
OfferManager.CMD_RESET_OFFER_ZALO = 8013;

OfferManager.IAP_OFFER_CACHE = "iapOffer";

OfferManager.isInited = false;
OfferManager.instance = null;
OfferManager.getInstance = function () {
    if (OfferManager.isInited == false) {
        OfferManager.isInited = true;
        OfferManager.instance = new OfferManager();
    }
    return OfferManager.instance;
};

var offerManager = OfferManager.getInstance();


CmdReceivedNotifyOffer = CmdReceivedCommon.extend({
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
    }
});

CmdReceivedOfferSuccess = CmdReceivedCommon.extend({
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
        cc.log("offer event success: ", JSON.stringify(this.offerEvent));
    }
});


CmdSendLogOffer = CmdSendCommon.extend({
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


CmdSendResetOfferZalo = CmdSendCommon.extend({
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