/**
 * Trong Moi mot Tab Payment se chua Mot PanelIapItem la list cac Goi Shop Gold, G
 */
var PanelIapItem = BaseLayer.extend({

    ctor: function (_parent, _tbSize, _itemSize) {
        this.guiParent = _parent;
        this.tbList = null;
        this.tbSize = _tbSize;
        this.itemSize = _itemSize;
        this.srcList = [];
        this.itemType = -1;
        this.imgCaches = {};

        this._super("");

        this.tbList = new cc.TableView(this, this.tbSize);
        this.tbList.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.tbList.setPosition(0, 0);
        this.tbList.setVerticalFillOrder(0);
        this.tbList.setDelegate(this);
        this.addChild(this.tbList);
    },

    onEnter: function () {
        this._super();
        if (!cc.sys.isNative) {
            this.tbList.setTouchEnabled(true);
        }
    },

    setItemType: function (type) {
        cc.log("SELECT TYPE " + type);
        this.itemType = type;
        var data;
        if (type < Payment.BUY_TICKET_FROM) {
            data = shopData.getDataByPaymentId(type);
        } else {
            data = event.getDataPaymentById(type);
        }
        cc.log("DATA NE **:  " + type + "    " + JSON.stringify(data));
        if (data) {
            this.setData(data);
            this.tbList.reloadData();
        }
    },

    setData: function (data) {
        cc.log("DATA NE in Panel: " + JSON.stringify(data));
        if (Config.ENABLE_NEW_VIP) {
            var vipLevel = NewVipManager.getInstance().getRealVipLevel();
            for (var i = 0; i < data.length; i++) {
                data[i].uptoLevelVip = 0;
            }
            if (vipLevel < NewVipManager.NUMBER_VIP) {
                var vPoint = NewVipManager.getInstance().getRealVipVpoint();
                var nextLevel = vipLevel + 1;
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                    if (dataItem.isOffer) continue;

                    var totalVPoint = parseInt(vPoint) + dataItem.vPoint;
                    var neededVPoint = 0;
                    for (var level = vipLevel; level < nextLevel; level++)
                        neededVPoint += NewVipManager.getInstance().getVpointNeed(level);
                    while(true){
                        if (totalVPoint >= neededVPoint && neededVPoint > 0){
                            data[i].uptoLevelVip = nextLevel;
                            nextLevel++;
                            if (nextLevel > NewVipManager.NUMBER_VIP) break;
                            else neededVPoint += NewVipManager.getInstance().getVpointNeed(nextLevel - 1);
                        }
                        else break;
                    }
                    if (nextLevel > NewVipManager.NUMBER_VIP) break;

                    // var totalVpointNeed = 0;
                    // for (var j = vipLevel; j < nextLevel; j++) {
                    //     totalVpointNeed += NewVipManager.getInstance().getVpointNeed(j);
                    // }
                    // if (dataItem.vPoint + parseInt(vPoint) >= totalVpointNeed && totalVpointNeed > 0) {
                    //     data[i].uptoLevelVip = nextLevel;
                    //     nextLevel++;
                    //     if (nextLevel >= NewVipManager.NUMBER_VIP) {
                    //         break;
                    //     }
                    // }
                }
            }
        }
        this.srcList = data;
        this.tbList.reloadData();
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        var info = this.srcList[idx];
        if (!cell) {
            cell = new ItemIapCell(this);
        }
        if (info.isOffer && idx == 0) {
            if (cell instanceof OfferIapCell) {

            } else {
                cell = new OfferIapCell(this);
            }
        } else {
            if (cell instanceof OfferIapCell) {
                cell = new ItemIapCell(this);
            }
        }
        this.srcList[idx].itemType = this.itemType;
        cell.setInfo(info);
        cell.setButton(this.itemType);

        cc.log("table at index: " + idx);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        var info = this.srcList[idx];
        if (info.isOffer) return cc.size(this.itemSize.width, this.itemSize.height * 1.55);
        return this.itemSize;
    },

    numberOfCellsInTableView: function (table) {
        return this.srcList.length;
    },

    tableCellTouched: function (table, cell) {
        try {
            cc.log("##ShopIAP : " + this.itemType + " -> " + JSON.stringify(cell.info));

            this.selectItem(cell.info, this.itemType);
        } catch (e) {
            cc.log("Touch Item error " + e);
        }
    },

    selectItem: function (info, type) {
        if (info.isOffer) {
            OfferManager.buyOffer(true, info.offerId);
            shopData.initShopGoldData();
            this.setItemType(type);
            return;
        }

        cc.log("not buy offer");
        this.saveGold = info.goldNew;
        var typeBuy = Payment.NO_OFFER;
        var typeCheat = Payment.CHEAT_PAYMENT_NORMAL;
        if (type >= Payment.BUY_TICKET_FROM) {
            typeBuy = Payment.BUY_TICKET;
            typeCheat = Payment.CHEAT_PAYMENT_EVENT;
        }
        switch (type) {
            case Payment.G_IAP : {
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    iapHandler.fakePayment(info.costConfig, Constant.G_IAP);
                } else {
                    iapHandler.purchaseItem(iapHandler.getProductIdIAP(info));
                }
                break;
            }
            case Payment.G_ATM : {
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    iapHandler.fakePayment(info.cost, Constant.G_ATM);
                } else {
                    var gui = sceneMgr.openGUI(GUIBank.className, GUIBank.TAG, GUIBank.TAG);
                    gui.setInfoBuy(info.cost, false);
                }
                break;
            }
            case Payment.G_ZALO : {
                if (Config.ENABLE_NEW_OFFER) {
                    if (CheckLogic.checkZaloPay()) {
                        var msg = LocalizedString.to("ZALOPAY_MSG");
                        msg = StringUtility.replaceAll(msg, "@value", StringUtility.pointNumber(info.cost));
                        sceneMgr.showOkCancelDialog(msg, this, function (btnId) {
                            if (btnId == Dialog.BTN_OK) {
                                var packageName = fr.platformWrapper.getPackageName();
                                sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
                                var cmd = new CmdSendBuyZaloPayV2();
                                cmd.putData(info.cost, 0, 0, -1, packageName);
                                GameClient.getInstance().sendPacket(cmd);
                                cmd.clean();
                            }
                        });
                    }
                }
                else {
                    if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                        iapHandler.fakePayment(info.cost, Constant.G_ZALO);
                    }
                    else {
                        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                        var cmd = new CmdSendBuyGZalo();
                        cmd.putData(info.cost, 0);
                        GameClient.getInstance().sendPacket(cmd);
                    }
                }
                break;
            }
            case Payment.GOLD_IAP:
            case Payment.TICKET_IAP: {
                // Khi mua IAP tu Shop, gan lai gia tri iSOffer ve mac dinh
                offerManager.setOfferIAP(0);
                iapHandler.typeBuy = typeBuy;
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    iapHandler.fakePayment(info.costConfig, Constant.GOLD_IAP, typeCheat);
                } else {
                    cc.log("PURCHASE IAP ***** ");
                    iapHandler.purchaseItem(iapHandler.getProductIdIAP(info));
                }
                break;
            }
            case Payment.GOLD_G: {
                var xu = info.cost;
                var gold = info.goldNew;
                if (gamedata.userData.coin < xu) {
                    SceneMgr.getInstance().showAddGDialog(LocalizedString.to("GUI_SHOP_NOT_ENOUGHT_G"), this, function (btnID) {
                        if (btnID == Dialog.BTN_OK) {
                            //this.selectTabShop(ShopIapScene.BTN_G);
                            var gui = sceneMgr.getMainLayer();
                            if (gui instanceof ShopIapScene)
                                gui.selectTabShop(ShopIapScene.BTN_G);
                        }
                    });
                } else {
                    var msg = LocalizedString.to("GUI_SHOP_CONFIRM");
                    msg = StringUtility.replaceAll(msg, "%xu", StringUtility.pointNumber(xu));
                    msg = StringUtility.replaceAll(msg, "%gold", StringUtility.pointNumber(gold));
                    SceneMgr.getInstance().showOkCancelDialog(msg, this, function (btnID) {
                        if (btnID == Dialog.BTN_OK) {
                            var cmd = new CmdBuyGold();
                            cmd.putData(info.id);
                            GameClient.getInstance().sendPacket(cmd);
                        }
                    });
                }
                break;
            }
            case Payment.GOLD_SMS_VIETTEL:
            case Payment.GOLD_SMS_MOBI:
            case Payment.GOLD_SMS_VINA: {
                var configSMS = gamedata.gameConfig.getShopGoldById(type);
                var operator = 0;
                switch (type) {
                    case Payment.GOLD_SMS_VIETTEL: {
                        operator = PanelCard.BTN_VIETTEL;
                        break;
                    }
                    case Payment.GOLD_SMS_MOBI: {
                        operator = PanelCard.BTN_MOBIFONE;
                        break;
                    }
                    case Payment.GOLD_SMS_VINA: {
                        operator = PanelCard.BTN_VINAPHONE;
                        break;
                    }
                }
                if (configSMS && configSMS["isMaintained"][0]) {
                    sceneMgr.openGUI(GUIMaintainSMS.className, GUIMaintainSMS.TAG, GUIMaintainSMS.TAG);
                } else {
                    iapHandler.requestSMSSyntax(operator, parseInt(info.cost), parseInt(info.smsType), type);
                }
                break;
            }
            case Payment.GOLD_ATM:
            case Payment.TICKET_ATM:
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    iapHandler.fakePayment(info.cost, Constant.GOLD_ATM, typeCheat);
                } else {
                    var gui = sceneMgr.openGUI(GUIBank.className, GUIBank.TAG, GUIBank.TAG);
                    gui.setInfoBuy(info.cost, true, typeBuy);
                }

                break;
            case Payment.GOLD_ZING:
            case Payment.TICKET_ZING:
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    iapHandler.fakePayment(info.cost, Constant.GOLD_ZING, typeCheat);
                } else {
                    var gui = sceneMgr.openGUI(GUIInputCard.className, GUIInputCard.TAG, GUIInputCard.TAG);
                    gui.setInfo(info.cost, typeBuy);
                }
                break;
            case Payment.GOLD_ZALO:
            case Payment.TICKET_ZALO:
                cc.log("TYPE BUY ZALO " + typeBuy);
                fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.BEGIN + "BUY_ZALO");
                fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "CLICK_SHOP");
                if (Config.ENABLE_NEW_OFFER) {
                    if (CheckLogic.checkZaloPay()) {
                        var msg = LocalizedString.to("ZALOPAY_MSG");
                        msg = StringUtility.replaceAll(msg, "@value", StringUtility.pointNumber(info.cost));
                        sceneMgr.showOkCancelDialog(msg, this, function (btnId) {
                            if (btnId == Dialog.BTN_OK) {
                                fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "SEND_BUY");
                                var packageName = fr.platformWrapper.getPackageName();
                                sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
                                var cmd = new CmdSendBuyZaloPayV2();
                                cmd.putData(info.cost, 1, typeBuy, -1, packageName);
                                GameClient.getInstance().sendPacket(cmd);
                                cmd.clean();
                            }
                        });
                    }
                }
                else {
                    if (Config.ENABLE_CHEAT&& CheatCenter.ENABLE_FAKE_SMS) {
                        iapHandler.fakePayment(info.cost, Constant.GOLD_ZALO, typeCheat);
                    }
                    else {
                        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                        var cmd = new CmdSendBuyGZalo();
                        cmd.putData(info.cost, 1, typeBuy);
                        GameClient.getInstance().sendPacket(cmd);
                    }
                }
                break;
            case Payment.G_EVENT_TICKET : {
                event.buyGTicket(info);
                break;
            }
            case Payment.TICKET_SMS: {
                event.buySMSTicket(info);
                break;
            }
        }
        if (type == dailyPurchaseManager.getPromoChannel()){
            if (info.id == dailyPurchaseManager.getPromoPackage())
                fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_promo_package");
            else
                fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_promo_channel");
        }
    },

    getTableView: function () {
        return this.tbList;
    }
});
