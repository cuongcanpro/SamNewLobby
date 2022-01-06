
var GUIShopGoldSuccess = BaseLayer.extend({

    ctor: function () {
        this._super("GUIShopGoldSuccess");
        this.initWithBinaryFile("GUIShopGoldSuccess.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.bgText = this.getControl("bgText");
        this.bgText.pos = this.bgText.getPosition();
        this.imgCongrat = this.getControl("imgCongrat", this.bg);
        this.imgCongrat.pos = this.imgCongrat.getPosition();
        this.lbSource = this.getControl("lbSource", this.bgText);
        this.lbSource.pos = this.lbSource.getPosition();
        this.btnReceive = this.customButton("btn", 0, this.bg);
        this.btnReceive.pos = this.btnReceive.getPosition();
        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        scrollView.setBounceEnabled(true);
        //scrollView.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        scrollView.setBackGroundColor(cc.color(255,255,255));
        //scrollView.setBackGroundImageScale9Enabled(true);
        scrollView.setContentSize(cc.size(800, 300));
        scrollView.setInnerContainerSize(cc.size(GUIShopGoldSuccess.WIDTH_SCROLL, 300));
        scrollView.setAnchorPoint(cc.p(0.5, 0.5));
        scrollView.setPosition(cc.p(this.bg.getContentSize().width * 0.5, 220));
        this.bg.addChild(scrollView);
        this.scrollView = scrollView;

        this.enableFog();
        this.arrayBonusItem = [];
        this.arrayCmdShop = [];
    },

    onEnterFinish: function () {
        this.setFog(true, 200);
        this.scrollView.setVisible(true);
    },

    setInfo: function (cmd, isNewShow) {
        // nu gui van dang Show, khong phai bat dau mot lan Show moi thi dua vao hang doi
        if (isNewShow == false) {
            //if (this.arrayBonusData && this.arrayBonusData.length > 0) {
                cc.log("SET INFO *** " + this.arrayBonusData.length);
                // van dang Show giao dich cua mot goi khac
                this.arrayCmdShop.push(cmd);
                return;
            // } else {
            //     cc.log("van setInfo");
            // }
        }
        this.cmdOffer = null;
        this.cmdShop = cmd;
        this.countPurchase = 0;
        this.getInfoPurchase();
        if (this.arrayBonusData && this.arrayBonusData.length == 0) {
            this.stopAllActions();
            this.onClose();
            return;
        }
        this.setViewPurchase();
    },

    getInfoPurchase: function () {

        var i = this.countPurchase;
        // payment type: mua Gold hay G
        this.paymentType = this.cmdShop.paymentType[i];
        this.arrayBonusData = [];
        this.arrayBonusDataOffer = [];

        // set G
        var bonusG = new ShopSuccessData();
        bonusG.type = ShopSuccessData.TYPE_G;
        if (this.cmdShop.shopGG[i] > 0) {
            bonusG.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusG.arrayNum.push(this.cmdShop.shopGG[i]);
            if (bonusG.getSum() > 0) {
                this.arrayBonusData.push(bonusG);
            }
        }

        // set GOld
        var bonusGold = new ShopSuccessData();
        bonusGold.type = ShopSuccessData.TYPE_GOLD;
        cc.log("GOLD NE " + this.cmdShop.shopGoldGold[i]);
        this.isShopGold = false;
        if (this.cmdShop.shopGoldGold[i] > 0) {
            bonusGold.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusGold.arrayNum.push(this.cmdShop.shopGoldGold[i]);
            this.isShopGold = true;
        }
        if (this.cmdShop.missionGold[i] > 0) {
            bonusGold.arraySubType.push(ShopSuccessData.SUBTYPE_MISSION);
            bonusGold.arrayNum.push(this.cmdShop.missionGold[i]);
        }
        if (this.cmdShop.offerGold[i] > 0) {
            // neu mua tu ShopGold ma lai co OfferGold -> la Offer khong Fix Gia, phai day qua du lieu qua Offer de Show 1 GUI Moi
            if (!this.isShopGold) {
                bonusGold.arraySubType.push(ShopSuccessData.SUBTYPE_OFFER);
                bonusGold.arrayNum.push(this.cmdShop.offerGold[i]);
            }
            else {
                var bonusGold1 = new ShopSuccessData();
                bonusGold1.type = ShopSuccessData.TYPE_GOLD;
                bonusGold1.arraySubType.push(ShopSuccessData.SUBTYPE_OFFER);
                bonusGold1.arrayNum.push(this.cmdShop.offerGold[i]);
                this.arrayBonusDataOffer.push(bonusGold1);
            }
        }
        if (this.cmdShop.voucherGold[i] > 0) {
            bonusGold.arraySubType.push(ShopSuccessData.SUBTYPE_VOUCHER);
            bonusGold.arrayNum.push(this.cmdShop.voucherGold[i]);
        }
        if (this.cmdShop.vipGold[i] > 0) {
            bonusGold.arraySubType.push(ShopSuccessData.SUBTYPE_VIP);
            bonusGold.arrayNum.push(this.cmdShop.vipGold[i]);
        }
        if (this.cmdShop.shopEventGold[i] > 0) {
            bonusGold.arraySubType.push(ShopSuccessData.SUBTYPE_EVENT_SYSTEM);
            bonusGold.arrayNum.push(this.cmdShop.shopEventGold[i]);
        }
        if (this.cmdShop.webGold[i] > 0) {
            bonusGold.arraySubType.push(ShopSuccessData.SUBTYPE_WEB);
            bonusGold.arrayNum.push(this.cmdShop.webGold[i]);
        }
        cc.log("BONUS GOLD " + bonusGold.getSum());
        if (bonusGold.getSum() > 0) {
            this.arrayBonusData.push(bonusGold);
        }

        // Set VPoint
        var bonusVPoint = new ShopSuccessData();
        bonusVPoint.type = ShopSuccessData.TYPE_VPOINT;
        if (this.cmdShop.shopGoldVPoint[i] > 0) {
            bonusVPoint.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusVPoint.arrayNum.push(this.cmdShop.shopGoldVPoint[i]);
        }
        if (this.cmdShop.offerVPoint[i] > 0) {
            // neu mua tu ShopGold ma lai co OfferVPoint -> la Offer khong Fix Gia, phai day qua du lieu qua Offer de Show 1 GUI Moi
            if (!this.isShopGold) {
                bonusVPoint.arraySubType.push(ShopSuccessData.SUBTYPE_OFFER);
                bonusVPoint.arrayNum.push(this.cmdShop.offerVPoint[i]);
            }
            else {
                var bonusVPoint1 = new ShopSuccessData();
                bonusVPoint1.type = ShopSuccessData.TYPE_VPOINT;
                bonusVPoint1.arraySubType.push(ShopSuccessData.SUBTYPE_OFFER);
                bonusVPoint1.arrayNum.push(this.cmdShop.offerVPoint[i]);
                this.arrayBonusDataOffer.push(bonusVPoint1);
            }
        }
        if (this.cmdShop.voucherVPoint[i] > 0) {
            bonusVPoint.arraySubType.push(ShopSuccessData.SUBTYPE_VOUCHER);
            bonusVPoint.arrayNum.push(this.cmdShop.voucherVPoint[i]);
        }
        if (this.cmdShop.eventVPoint[i] > 0) {
            bonusVPoint.arraySubType.push(ShopSuccessData.SUBTYPE_EVENT);
            bonusVPoint.arrayNum.push(this.cmdShop.eventVPoint[i]);
        }
        if (bonusVPoint.getSum() > 0) {
            this.arrayBonusData.push(bonusVPoint);
        }

        // Set Hour Vip
        var bonusHourVip = new ShopSuccessData();
        bonusHourVip.type = ShopSuccessData.TYPE_HOUR_VIP;
        if (this.cmdShop.shopGoldVipHour[i] > 0) {
            bonusHourVip.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusHourVip.arrayNum.push(this.cmdShop.shopGoldVipHour[i]);
        }
        if (this.cmdShop.offerVipHour[i] > 0) {
            if (this.cmdShop.offerVPoint[i] > 0) {
                // neu mua tu ShopGold ma lai co OfferHourVip -> la Offer khong Fix Gia, phai day qua du lieu qua Offer de Show 1 GUI Moi
                if (!this.isShopGold) {
                    bonusHourVip.arraySubType.push(ShopSuccessData.SUBTYPE_OFFER);
                    bonusHourVip.arrayNum.push(this.cmdShop.offerVipHour[i]);
                }
                else {
                    var bonusHourVip1 = new ShopSuccessData();
                    bonusHourVip1.type = ShopSuccessData.TYPE_HOUR_VIP;
                    bonusHourVip1.arraySubType.push(ShopSuccessData.SUBTYPE_OFFER);
                    bonusHourVip1.arrayNum.push(this.cmdShop.offerVipHour[i]);
                    this.arrayBonusDataOffer.push(bonusHourVip1);
                }
            }
        }
        if (this.cmdShop.eventVipHour[i] > 0) {
            bonusHourVip.arraySubType.push(ShopSuccessData.SUBTYPE_EVENT);
            bonusHourVip.arrayNum.push(this.cmdShop.eventVipHour[i]);
        }
        if (bonusHourVip.getSum() > 0) {
            this.arrayBonusData.push(bonusHourVip);
        }

        //Set Diamond
        var bonusDiamond = new ShopSuccessData();
        bonusDiamond.type = ShopSuccessData.TYPE_DIAMOND;
        if (this.cmdShop.offerDiamond[i] > 0) {
            // neu mua tu ShopGold ma lai co OfferDiamond -> la Offer khong Fix Gia, phai day qua du lieu qua Offer de Show 1 GUI Moi
            if (!this.isShopGold) {
                bonusDiamond.arraySubType.push(ShopSuccessData.SUBTYPE_OFFER);
                bonusDiamond.arrayNum.push(this.cmdShop.offerDiamond[i]);
            }
            else {
                var bonusDiamond1 = new ShopSuccessData();
                bonusDiamond1.type = ShopSuccessData.TYPE_DIAMOND;
                bonusDiamond1.arraySubType.push(ShopSuccessData.SUBTYPE_OFFER);
                bonusDiamond1.arrayNum.push(this.cmdShop.offerDiamond[i]);
                this.arrayBonusDataOffer.push(bonusDiamond1);
            }
        }
        if (bonusDiamond.getSum() > 0) {
            this.arrayBonusData.push(bonusDiamond);
        }

        //Set Item
        if (this.cmdShop.offerItemType[i].length > 0) {
            var arrayType = this.cmdShop.offerItemType[i].split(";");
            var arraySubType = this.cmdShop.offerItemSubType[i].split(";");
            var arrayId = this.cmdShop.offerItemId[i].split(";");
            var arrayNum = this.cmdShop.offerItemNumber[i].split(";");
            for (var j = 0; j < arrayType.length; j++) {
                var bonusItem = new ShopSuccessData();
                bonusItem.type = ShopSuccessData.TYPE_ITEM;
                bonusItem.arraySubType.push(ShopSuccessData.SUBTYPE_OFFER);
                bonusItem.arrayNum[0] = arrayNum[j];
                bonusItem.typeItem = arrayType[j];
                bonusItem.subTypeItem = arraySubType[j];
                bonusItem.idItem = arrayId[j];
                if (!this.isShopGold)
                    this.arrayBonusData.push(bonusItem);
                else
                    this.arrayBonusDataOffer.push(bonusItem);
            }
        }

        //Set TIcket
        if (this.cmdShop.eventId[i].length > 0) {
            var arrayEventId = this.cmdShop.eventId[i].split(";");
            var arrayNum = this.cmdShop.eventTicket[i].split(";");
            var arrayReason = this.cmdShop.eventReason[i].split(";");
            for (var j = 0; j < arrayEventId.length; j++) {
                if (event.isInEvent(arrayEventId[j])) {
                    if (arrayNum[j] > 0) {
                        var bonusTicket = new ShopSuccessData();
                        bonusTicket.type = ShopSuccessData.TYPE_TICKET;
                        bonusTicket.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
                        bonusTicket.arrayNum[0] = arrayNum[j];
                        bonusTicket.idEvent = arrayEventId[j];
                        if (!this.isShopGold) {
                            this.arrayBonusData.push(bonusTicket);
                        }
                        else {
                            if (arrayReason[j] == 6) // nhan tu Offer
                                this.arrayBonusDataOffer.push(bonusTicket);
                            else
                                this.arrayBonusData.push(bonusTicket);
                        }
                    }
                }
            }
        }
    },

    setViewPurchase: function () {
        this.btnReceive.setVisible(true);
        this.setBonusItem();
        this.setInfoSource();

        this.imgCongrat.setPositionY(this.imgCongrat.pos.y + 200);
        this.imgCongrat.runAction(cc.sequence(
            cc.delayTime(0.05),
            new cc.EaseBackOut(cc.moveTo(0.7, this.imgCongrat.getPositionX(), this.imgCongrat.pos.y))
        ));

        this.bgText.setPositionY(this.bgText.pos.y + 200);
        this.bgText.runAction(new cc.EaseBackOut(cc.moveTo(0.7, this.bgText.getPositionX(), this.bgText.pos.y)));

        this.btnReceive.setPositionY(this.btnReceive.pos.y - 200);
        this.btnReceive.runAction(new cc.EaseBackOut(cc.moveTo(0.7, this.btnReceive.getPositionX(), this.btnReceive.pos.y)));

        for (var i = 0; i < this.arrayBonusItem.length; i++) {
            var pos = this.arrayBonusItem[i].getPosition();
            this.arrayBonusItem[i].setPositionX(this.arrayBonusItem[i].getPositionX() + 1000);
            this.arrayBonusItem[i].runAction(cc.sequence(
                cc.delayTime(0.05 * i),
                new cc.EaseBackOut(cc.moveTo(1.0, pos))
            ));
        }
    },

    setInfoSource: function () {
        var text = localized("SHOP_GOLD_GIFT");
        var s = "";
        var index = this.countPurchase;
        if (this.isOffer) {
            // offer khong Fix Gia
            s = localized("SHOP_GOLD_BUY_OFFER");
        }
        else if (this.cmdShop.shopGG[index] > 0) {
            s = localized("SHOP_GOLD_BUY_G");
        }
        else if (this.cmdShop.shopGoldGold[index] == 0) {
            if (this.cmdShop.offerGold[index] == 0) {
                s = localized("SHOP_GOLD_BUY_TICKET");
            }
            else {
                s = localized("SHOP_GOLD_BUY_OFFER");
            }
        }
        else {
            s = localized("SHOP_GOLD_BUY_GOLD");
        }
        text = StringUtility.replaceAll(text, "@type", s);
        text = text + " " + StringUtility.pointNumber(this.cmdShop.value[index]);
        switch (this.cmdShop.paymentType[index]) {
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
                }
                else {
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
        this.lbSource.setString(text);
    },

    setBonusItem: function () {
        cc.log("BONUS DATA " + JSON.stringify(this.arrayBonusData));
        for (var i = 0; i < this.arrayBonusItem.length; i++) {
            this.arrayBonusItem[i].setVisible(false);
        }
        var startX = 100;
        for (var i = 0; i < this.arrayBonusData.length; i++) {
            var item = this.getAraryBonusItem();
            item.setInfo(this.arrayBonusData[i]);
            item.setPosition(startX + item.getContentSize().width * (i + 0.5) + GUIShopGoldSuccess.PAD_ITEM * i, GUIShopGoldSuccess.HEIGHT_SCROLL * 0.5);
        }
        var sum = (this.arrayBonusData.length - 1) * GUIShopGoldSuccess.PAD_ITEM + this.arrayBonusData.length * this.arrayBonusItem[0].getContentSize().width + startX * 2;

        if (sum < GUIShopGoldSuccess.WIDTH_SCROLL) {
            this.scrollView.setContentSize(cc.size(sum, GUIShopGoldSuccess.HEIGHT_SCROLL));
        }
        else {
            this.scrollView.setContentSize(cc.size(GUIShopGoldSuccess.WIDTH_SCROLL, GUIShopGoldSuccess.HEIGHT_SCROLL));
        }
        this.scrollView.setInnerContainerSize(cc.size(sum, GUIShopGoldSuccess.HEIGHT_SCROLL));

    },

    getAraryBonusItem: function () {
        var i = 0;
        for (i = 0; i < this.arrayBonusItem.length; i++) {
            if (!this.arrayBonusItem[i].isVisible()) {
                this.arrayBonusItem[i].setVisible(true);
                return this.arrayBonusItem[i];
            }
        }
        var item = new ShopBonusItem();
        this.arrayBonusItem.push(item);
        this.scrollView.addChild(item);
        return item;
    },

    hideComponent: function () {
        this.btnReceive.setVisible(false);
        //   this.btnReceive.runAction(new cc.EaseBackIn(cc.moveBy(0.7, 0, -200)));
        this.imgCongrat.runAction(new cc.EaseBackIn(cc.moveBy(0.7, 0, 200)));
        this.bgText.runAction(new cc.EaseBackIn(cc.moveBy(0.7, 0, 200)));
        this._layerColor.runAction(cc.sequence(
            cc.fadeOut(2.5),
            cc.callFunc(this.onClose.bind(this))
        ));
        this.scrollView.setVisible(false);
    },

    onButtonRelease: function (btn, id) {
        cc.log("ON BUTTON RELEASE *** ");
        this.hideComponent();
        var startGold, endGold;
        var mainLayer = sceneMgr.getMainLayer();
        var delay = 0;
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        var newLevel = NewVipManager.getInstance().getRealVipLevel();
        if (mainLayer instanceof LobbyScene || mainLayer instanceof ShopIapScene) {
            this.targetGold = mainLayer.getGold();
            this.targetG = mainLayer.getG();
            this.targetDiamond = mainLayer.getDiamond();
        }
        for (var i = 0; i < this.arrayBonusData.length; i++) {
            this.arrayBonusItem[i].setVisible(false);
            var pStart = this.arrayBonusItem[i].convertToWorldSpace(cc.p(0, 0));
            var pEnd;
            if (mainLayer instanceof LobbyScene) {
                pEnd = mainLayer.getPositionComponent(this.arrayBonusData[i].type);
            }
            else if (mainLayer instanceof ShopIapScene) {
                pEnd = mainLayer.getPositionComponent(this.arrayBonusData[i].type);
            }
            else {
                pEnd = cc.p(0, 0);
            }
            var addBonus = this.arrayBonusData[i].getSum();
            if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_GOLD) {
                var timeRun = effectMgr.flyCoinEffect(sceneMgr.layerSystem, addBonus, addBonus / 20, pStart, pEnd);
                if (mainLayer instanceof LobbyScene || mainLayer instanceof ShopIapScene) {
                    startGold = Number.parseFloat(mainLayer.getGold());
                    endGold = startGold + Number.parseFloat(addBonus);

                    if (endGold <= gamedata.getUserGold()) {
                        if (mainLayer instanceof LobbyScene) {
                            effectMgr.runLabelPoint(mainLayer._uiBean, startGold, endGold, timeRun - 0.5, 50, EffectMgr.LABEL_RUN_NUMBER);
                        }
                        else {
                            effectMgr.runLabelPoint(mainLayer._uiBean, startGold, endGold, timeRun - 0.5, 50);
                        }
                        this.targetGold = endGold;
                    }
                }
                delay = delay + 0.5;
            }
            else {
                effectMgr.flyItemEffect(sceneMgr.layerSystem, this.arrayBonusData[i].getResourceIcon(), 10, pStart, pEnd, delay, false, false, true);
                delay = delay + 0.5;
                if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_HOUR_VIP) {
                    if (mainLayer instanceof ShopIapScene) {
                        var remainTime = NewVipManager.getInstance().getRemainTime();
                        NewVipManager.getInstance().setRemainTime(remainTime + addBonus);
                        setTimeout(function () {
                            var gui = sceneMgr.getMainLayer();
                            if (gui instanceof ShopIapScene) {
                                mainLayer.txtRemainVipTime.setString(NewVipManager.getRemainTimeString(NewVipManager.getInstance().getRemainTime()));
                            }
                        }.bind(this), (delay + 0.5) * 1000);
                    }
                }
                else if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_VPOINT) {
                    var vipLevel = NewVipManager.getInstance().getVipLevel();
                    var curVpoint = NewVipManager.getInstance().getVpoint();
                    NewVipManager.getInstance().setVpoint(curVpoint + addBonus);
                    if (mainLayer instanceof ShopIapScene) {
                        effectMgr.runVipProgress(mainLayer.bgProgressVip, mainLayer.progressVip, mainLayer.txtProgress, null, mainLayer.iconCurVip,
                            mainLayer.iconNextVip, addBonus, delay + 0.5, false, vipLevel, curVpoint);
                    }
                }
                else if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_G) {
                    if (mainLayer instanceof LobbyScene || mainLayer instanceof ShopIapScene) {
                        var startG = Number.parseFloat(mainLayer.getG());
                        var endG = startG + Number.parseFloat(addBonus);
                        if (endG <= gamedata.getUserCoin()) {
                            if (mainLayer instanceof LobbyScene) {
                                effectMgr.runLabelPoint(mainLayer._uiCoin, startG, endG, delay + 0.5, 50, EffectMgr.LABEL_RUN_NUMBER);
                            } else {
                                effectMgr.runLabelPoint(mainLayer._uiCoin, startG, endG, delay + 0.5, 50);
                            }
                            this.targetG = endG;
                        }
                    }
                }
                else if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_DIAMOND) {
                    if (mainLayer instanceof LobbyScene || mainLayer instanceof ShopIapScene) {
                        var startDiamond = Number.parseFloat(mainLayer.getDiamond());
                        var endDiamond = startDiamond + Number.parseFloat(addBonus);
                        if (endDiamond <= gamedata.getUserDiamond()) {
                            if (mainLayer instanceof LobbyScene) {
                                effectMgr.runLabelPoint(mainLayer._uiDiamond, startDiamond, endDiamond, delay + 0.5, 50, EffectMgr.LABEL_RUN_NUMBER);
                            } else {
                                effectMgr.runLabelPoint(mainLayer._uiDiamond, startDiamond, endDiamond, delay + 0.5, 50);
                            }
                            this.targetDiamond = endDiamond;
                        }
                    }
                }
            }
        }
        // ket thuc Effect Bay vat pham, Update lai du lieu cho cac GUI
        setTimeout(function () {
            cc.log("VO DAY MA *** Reset Bonus " + JSON.stringify(this.arrayBonusData));
            this.arrayBonusData = [];
            if (this.arrayBonusDataOffer.length == 0) {
                if (newLevel > vipLevel) {
                    NewVipManager.showUpLevelVip(vipLevel, newLevel);
                }
                NewVipManager.getInstance().setWaiting(false);
            }
            var gui = sceneMgr.getMainLayer();
            if (gui instanceof ShopIapScene || gui instanceof LobbyScene) {
                gui.updateG(this.targetG);
                gui.updateGold(this.targetGold);
                gui.updateDiamond(this.targetDiamond);
                gui.finishEffectShopSuccess();
            }
        }.bind(this), (delay + 1.8) * 1000);
    },

    checkShowNextPurchase: function () {
        cc.log("COUNT PURCHASE " + this.countPurchase + " " + this.cmdShop.paymentType.length);
        if (this.countPurchase < this.cmdShop.paymentType.length - 1) {
            return true;
        }
        if (this.arrayCmdShop.length > 0) {
            return true;
        }
        return this.arrayBonusDataOffer.length > 0;
    },

    showNextPurchase: function () {
        if (this.countPurchase < this.cmdShop.paymentType.length - 1) {
            this.countPurchase++;
            var cmdSend = new CmdSendShopGoldSuccess();
            cmdSend.putData(this.cmdShop.purchaseId[this.countPurchase]);
            GameClient.getInstance().sendPacket(cmdSend);
            cmdSend.clean();
            this.getInfoPurchase();
            this.setViewPurchase();
        }
        else if (this.arrayBonusDataOffer.length > 0) {
            this.isOffer = true;
            this.arrayBonusData = this.arrayBonusDataOffer;
            this.setViewPurchase();
            this.arrayBonusDataOffer = [];
            this.isOffer = false;
        }
        else if (this.arrayCmdShop.length > 0) {
            var cmd = this.arrayCmdShop[0];
            this.arrayCmdShop.splice(0, 1);
            this.setInfo(cmd);
        }
    },
});
GUIShopGoldSuccess.PAD_ITEM = 20;
GUIShopGoldSuccess.WIDTH_SCROLL = 750;
GUIShopGoldSuccess.HEIGHT_SCROLL = 200;

GUIShopGoldSuccess.PAYMENT_TYPE_G_GOLD = 0;
GUIShopGoldSuccess.className = "GUIShopGoldSuccess";
GUIShopGoldSuccess.TAG = 2000;

ShopBonusItem =  cc.Node.extend({
    ctor: function () {
        this._super();
        this.setAnchorPoint(cc.p(0, 0));
        this.setCascadeOpacityEnabled(true);

        this.bg = new cc.Sprite("res/Lobby/ShopIAP/ShopSuccess/bgBonus.png");
        this.addChild(this.bg, 1);
        this.bg.setAnchorPoint(cc.p(1.0, 1.0));
        this.bg.setPosition(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.5);

        this.icon = new cc.Sprite("res/Lobby/ShopIAP/ShopSuccess/iconGold.png");
        this.addChild(this.icon);

        this.labelDescrible = BaseLayer.createLabelText("fkdsjl fjsdj fsld ", cc.color(255, 246, 220, 255));
        this.labelDescrible.setFontName(SceneMgr.FONT_BOLD);
        this.labelDescrible.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.labelDescrible.setAnchorPoint(cc.p(0.5, 0.5));
        this.labelDescrible.setFontSize(16);
        this.labelDescrible.setPosition(0, this.bg.getContentSize().height * 0.35);
        this.labelDescrible.ignoreContentAdaptWithSize(false);
        this.addChild(this.labelDescrible);

        // this.labelValue = BaseLayer.createLabelText("fkdsjl fjsdj fsl", cc.color(255, 246, 220, 255));
        // this.labelValue.setFontName(SceneMgr.FONT_BOLD);
        // this.labelValue.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        // this.labelValue.setAnchorPoint(cc.p(0.5, 0.5));
        // this.labelValue.setFontSize(16);
        // this.labelValue.setPosition(0, -this.bg.getContentSize().height * 0.3);
        // this.labelValue.ignoreContentAdaptWithSize(false);
        // this.addChild(this.labelValue);

        this.btnInfo = new ccui.Button();
        this.btnInfo.setPressedActionEnabled(true);
        this.btnInfo.loadTextures("res/Lobby/ShopIAP/ShopSuccess/btnInfo.png", "res/Lobby/ShopIAP/ShopSuccess/btnInfo.png", "");
        this.btnInfo.addTouchEventListener(this.onTouchEventHandler, this);
        this.btnInfo.setPosition(this.bg.getContentSize().width * 0.35, this.bg.getContentSize().height * 0.4);
        this.addChild(this.btnInfo, 1);

        var p = cc.p(this.bg.getContentSize().width * 0.5, this.bg.getContentSize().height * 0.9);
        this.lbTitle =  this.createLabel("Gold", cc.color(201, 214, 253, 255), p, this.bg);
        this.lbTitle.setAnchorPoint(cc.p(0.5, 0.5));
        this.lbTitle.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this.startX = this.bg.getContentSize().width * 0.05;

        var lb = this.createLabel(localized("SUM"), cc.color(180, 165, 197, 255), cc.p(this.startX, this.bg.getContentSize().height * 0.2), this.bg);
        this.lbSum = this.createLabel("0", cc.color(254, 221, 151, 255), cc.p(this.startX, this.bg.getContentSize().height * 0.08), this.bg);
        this.setContentSize(this.bg.getContentSize());

        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        scrollView.setTouchEnabled(true);
        scrollView.setBounceEnabled(true);
        //   scrollView.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        scrollView.setBackGroundColor(cc.color(255,255,255));
        //scrollView.setBackGroundImageScale9Enabled(true);
        scrollView.setContentSize(cc.size(this.bg.getContentSize().width, 70));
        scrollView.setAnchorPoint(cc.p(0, 1.0));
        scrollView.setPosition(cc.p(0, this.bg.getContentSize().height * 0.75));
        this.bg.addChild(scrollView);
        this.scrollView = scrollView;

    },

    createLabel: function (text, color, pos, parent) {
        var lbSum =  BaseLayer.createLabelText(text, color);
        lbSum.setFontName(SceneMgr.FONT_BOLD);
        parent.addChild(lbSum);
        lbSum.setAnchorPoint(cc.p(0, 0.5));
        lbSum.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        lbSum.setPosition(pos);
        lbSum.setFontSize(14);
        return lbSum;
    },

    onTouchEventHandler: function(sender,type){
        switch (type){
            case ccui.Widget.TOUCH_BEGAN:
                break;
            case ccui.Widget.TOUCH_ENDED:
                this.showInfo();
                break;
        }
    },

    // show thong tin cu the cua Bonus den tu nhieu nguon
    showInfo: function () {
        this.bg.stopAllActions();
        if (!this.bg.isShow)
            this.bg.runAction(new cc.EaseExponentialOut(cc.scaleTo(0.5, 1.0, 1.0)));
        else
            this.bg.runAction(new cc.EaseExponentialOut(cc.scaleTo(0.5, 0.0, 0.0)));
        this.bg.isShow = !this.bg.isShow;
    },

    // set thong tin chung cua Bonus
    setInfo: function (bonusData) {
        this.bg.isShow = false;
        this.bg.setScale(0);
        //if (bonusData.type != ShopSuccessData.TYPE_ITEM || bonusData.typeItem)
        if (this.groupValue) {
            this.groupValue.removeFromParent();
        }
        this.groupValue = this.createNodeNumber(bonusData.getSum());
        this.addChild(this.groupValue);
        this.groupValue.setPosition(0, -this.bg.getContentSize().height * 0.3);
        this.icon.setTexture(bonusData.getResourceIcon());
        this.icon.setScale(bonusData.getScaleRate());
        this.labelDescrible.setString(bonusData.getTitle());
        this.lbTitle.setString(bonusData.getTitle());

        if (bonusData.arraySubType.length > 1) {
            this.btnInfo.setVisible(true);
            this.setDetailInfo(bonusData);
        }
        else {
            this.btnInfo.setVisible(false);
        }
    },

    // thong tin cu the cua tung Bonus den tu nhung nguon nao
    setDetailInfo: function (bonusData) {
        this.scrollView.removeAllChildren();
        this.lbSum.setString(StringUtility.pointNumber(bonusData.getSum()));
        var count = 0;
        var total = bonusData.arraySubType.length * 2 - 1;
        for (var i = 0; i < bonusData.arraySubType.length; i++) {
            var source = bonusData.getSource(i);
            var value = "+" + StringUtility.pointNumber(bonusData.arrayNum[i]);
            var lbSource = this.createLabel(source,cc.color(180, 165, 197, 255), cc.p(this.startX, ShopBonusItem.PAD_Y * (total - count + 0.7)), this.scrollView);
            count++;
            var lbValue = this.createLabel(value,cc.color(254, 221, 151, 255), cc.p(this.startX, ShopBonusItem.PAD_Y * (total - count + 0.7)), this.scrollView);
            count++;
        }
        this.scrollView.setInnerContainerSize(cc.size(this.bg.getContentSize().width,count * ShopBonusItem.PAD_Y));
    },

    createNodeNumber: function(money) {
        var node = new cc.Node();
        var str = StringUtility.formatNumberSymbol(Math.abs(money));
        var width = 0;
        var height = 0;
        var resource = "res/Lobby/ShopIAP/ShopSuccess/num_";

        var fix = 0;
        var ret;
        for(var i = 0; i < str.length; i++) {
            var xx;
            if (ret) {
                xx = ret.getPositionX() + ret.getContentSize().width * 0.5 + fix;
                fix = 0;
            } else {
                xx = 0;
                fix = 0;
            }
            if(str[i] == '.')
                ret = new cc.Sprite(resource + "dot.png");
            else
                ret = new cc.Sprite(resource + str[i] + ".png");

            if(str[i] == '.')
                fix = 0;
            else
                fix = 0;

            if(str[i] == '.')
                ret.setPosition(xx + ret.getContentSize().width * 0.5, -8);
            else
                ret.setPositionX(xx + ret.getContentSize().width * 0.5);
            node.addChild(ret);
        }
        width = ret.getPositionX() + ret.getContentSize().width * 0.5;
        height = ret.getContentSize().height;
        node.setContentSize(cc.size(width,height));
        node.setAnchorPoint(cc.p(.5,.5));
        return node;
    }
});
ShopBonusItem.PAD_Y = 18;

var ShopSuccessData = cc.Class.extend({
    ctor: function () {
        this.type = 0;
        this.arraySubType = [];
        this.arrayNum = [];

        this.typeItem = "";
        this.subTypeItem = "";
        this.idItem = "";
        this.idEvent = "";
    },

    getSum: function () {
        var sum = 0;
        for (var i = 0; i < this.arraySubType.length; i++) {
            sum = sum + this.arrayNum[i];
        }
        return sum;
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
        if (this.type == ShopSuccessData.TYPE_ITEM) {
            if (this.typeItem == StorageManager.TYPE_AVATAR) {
                return 0.5;
            }
            else {
                return 0.7;
            }
        } else if (this.type == ShopSuccessData.TYPE_TICKET) {
            return 0.7;
        }
        else {
            return 1.0;
        }
    },

    getResourceIcon: function () {
        switch (this.type) {
            case ShopSuccessData.TYPE_G:
                return "res/Lobby/ShopIAP/ShopSuccess/iconG.png";
                break;
            case ShopSuccessData.TYPE_GOLD:
                return "res/Lobby/ShopIAP/ShopSuccess/iconGold.png";
                break;
            case ShopSuccessData.TYPE_VPOINT:
                return "res/Lobby/ShopIAP/ShopSuccess/iconVPoint.png";
                break;
            case ShopSuccessData.TYPE_HOUR_VIP:
                return "res/Lobby/ShopIAP/ShopSuccess/iconHourVip.png";
                break;
            case ShopSuccessData.TYPE_TICKET:
                cc.log("GET Resource ticket " + this.idEvent + " " + event.getOfferTicketImage(this.idEvent));
                return event.getOfferTicketImage(this.idEvent);
                break;
            case ShopSuccessData.TYPE_DIAMOND:
                return "res/Lobby/ShopIAP/ShopSuccess/iconDiamond.png";
                break;
            case ShopSuccessData.TYPE_ITEM:
                return StorageManager.getItemIconPath(this.typeItem, this.subTypeItem, this.idItem);
                break;
        }
    },

    getTitle: function () {
        switch (this.type) {
            case ShopSuccessData.TYPE_G:
                return "G";
                break;
            case ShopSuccessData.TYPE_GOLD:
                return "Gold";
                break;
            case ShopSuccessData.TYPE_VPOINT:
                return "VPoint";
                break;
            case ShopSuccessData.TYPE_HOUR_VIP:
                return localized("SHOP_GOLD_HOUR_VIP");
                break;
            case ShopSuccessData.TYPE_TICKET:
                return event.getOfferTicketString(this.idEvent);
                break;
            case ShopSuccessData.TYPE_DIAMOND:
                return localized("OFFER_DIAMOND");
                break;
            case ShopSuccessData.TYPE_ITEM:
                return localized("SHOP_GOLD_ITEM");
                break;
        }
    },
})

ShopSuccessData.TYPE_G = 0;
ShopSuccessData.TYPE_GOLD = 1;
ShopSuccessData.TYPE_VPOINT = 2;
ShopSuccessData.TYPE_HOUR_VIP = 3;
ShopSuccessData.TYPE_DIAMOND = 4;
ShopSuccessData.TYPE_ITEM = 5;
ShopSuccessData.TYPE_TICKET = 6;

ShopSuccessData.SUBTYPE_SHOP_GOLD = 0;
ShopSuccessData.SUBTYPE_MISSION = 1;
ShopSuccessData.SUBTYPE_OFFER = 2;
ShopSuccessData.SUBTYPE_VOUCHER = 3;
ShopSuccessData.SUBTYPE_VIP = 4;
ShopSuccessData.SUBTYPE_EVENT_SYSTEM = 5; // khuyen mai toan he thong
ShopSuccessData.SUBTYPE_EVENT = 6; // Mua ve Event duoc them
ShopSuccessData.SUBTYPE_WEB = 7; // Mua tu Web duoc tang them Gold

var GUIReceiveGift = BaseLayer.extend({

    ctor: function () {
        this._super("GUIReceiveGift");
        this.initWithBinaryFile("GUIShopGoldSuccess.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.bgText = this.getControl("bgText");
        this.bgText.pos = this.bgText.getPosition();
        this.imgCongrat = this.getControl("imgCongrat", this.bg);
        this.imgCongrat.pos = this.imgCongrat.getPosition();
        this.lbSource = this.getControl("lbSource", this.bgText);
        this.lbSource.pos = this.lbSource.getPosition();
        this.btnReceive = this.customButton("btn", 0, this.bg);
        this.btnReceive.pos = this.btnReceive.getPosition();
        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        scrollView.setBounceEnabled(true);
        //scrollView.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        scrollView.setBackGroundColor(cc.color(255,255,255));
        //scrollView.setBackGroundImageScale9Enabled(true);
        scrollView.setContentSize(cc.size(800, 300));
        scrollView.setInnerContainerSize(cc.size(GUIReceiveGift.WIDTH_SCROLL, 300));
        scrollView.setAnchorPoint(cc.p(0.5, 0.5));
        scrollView.setPosition(cc.p(this.bg.getContentSize().width * 0.5, 220));
        this.bg.addChild(scrollView);
        this.scrollView = scrollView;

        this.enableFog();
        this.arrayBonusItem = [];
        this.arrayBonusData = [];
        this.arrayPosEnd = [];
    },

    onEnterFinish: function () {
        this.setFog(true, 200);
        this.scrollView.setVisible(true);
    },

    resetData: function () {
        this.arrayBonusData = [];
        this.arrayPosEnd = [];
    },

    pushArrayBonus: function (arrayBonus, title) {
        this.resetData();
        for (var i = 0; i < arrayBonus.length; i++) {
            switch (arrayBonus[i].type) {
                case ShopSuccessData.TYPE_GOLD:
                    this.pushGold(arrayBonus[i].num, arrayBonus[i].posEnd);
                    break;
                case ShopSuccessData.TYPE_HOUR_VIP:
                    this.pushHourVip(arrayBonus[i].num, arrayBonus[i].posEnd);
                    break;
                case ShopSuccessData.TYPE_VPOINT:
                    this.pushVPoint(arrayBonus[i].num, arrayBonus[i].posEnd);
                    break;
                case ShopSuccessData.TYPE_TICKET:
                    this.pushTicket(arrayBonus[i].num, arrayBonus[i].posEnd);
                    break;
            }
        }
        this.setViewPurchase();
        this.lbSource.setString(title);
    },

    pushGold: function (gold, posEnd) {
        cc.log("POS END " + JSON.stringify(posEnd));
        // set GOLD
        var bonusGold = new ShopSuccessData();
        bonusGold.type = ShopSuccessData.TYPE_GOLD;
        if (gold > 0) {
            bonusGold.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusGold.arrayNum.push(gold);
        }

        if (bonusGold.getSum() > 0) {
            this.arrayBonusData.push(bonusGold);
            if (posEnd) {
                this.arrayPosEnd.push(posEnd);
            }
            else {
                this.arrayPosEnd.push(cc.p(-1, -1));
            }
        }
    },

    pushVPoint: function (vPoint, posEnd) {
        // Set VPoint
        var bonusVPoint = new ShopSuccessData();
        bonusVPoint.type = ShopSuccessData.TYPE_VPOINT;
        if (vPoint > 0) {
            bonusVPoint.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusVPoint.arrayNum.push(vPoint);
        }

        if (bonusVPoint.getSum() > 0) {
            this.arrayBonusData.push(bonusVPoint);
            if (posEnd) {
                this.arrayPosEnd.push(posEnd);
            }
            else {
                this.arrayPosEnd.push(cc.p(-1, -1));
            }
        }
    },

    pushHourVip: function (hourVip, posEnd) {
        // Set Hour Vip
        var bonusHourVip = new ShopSuccessData();
        bonusHourVip.type = ShopSuccessData.TYPE_HOUR_VIP;
        if (hourVip > 0) {
            bonusHourVip.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusHourVip.arrayNum.push(hourVip);
        }
        if (bonusHourVip.getSum() > 0) {
            this.arrayBonusData.push(bonusHourVip);
            if (posEnd) {
                this.arrayPosEnd.push(posEnd);
            }
            else {
                this.arrayPosEnd.push(cc.p(-1, -1));
            }
        }
    },

    pushTicket: function (ticket, posEnd) {
        //Set TIcket
        var bonusTicket = new ShopSuccessData();
        bonusTicket.type = ShopSuccessData.TYPE_TICKET;
        if (ticket > 0) {
            bonusTicket.arraySubType.push(ShopSuccessData.SUBTYPE_SHOP_GOLD);
            bonusTicket.arrayNum.push(ticket);
            bonusTicket.idEvent = event.getIdMainEvent();
        }
        if (bonusTicket.getSum() > 0) {
            this.arrayBonusData.push(bonusTicket);
            if (posEnd) {
                this.arrayPosEnd.push(posEnd);
            }
            else {
                this.arrayPosEnd.push(cc.p(-1, -1));
            }
        }
    },

    setViewPurchase: function () {
        this.btnReceive.setVisible(true);
        this.setBonusItem();

        this.imgCongrat.setPositionY(this.imgCongrat.pos.y + 200);
        this.imgCongrat.runAction(cc.sequence(
            cc.delayTime(0.05),
            new cc.EaseBackOut(cc.moveTo(0.7, this.imgCongrat.getPositionX(), this.imgCongrat.pos.y))
        ));

        this.bgText.setPositionY(this.bgText.pos.y + 200);
        this.bgText.runAction(new cc.EaseBackOut(cc.moveTo(0.7, this.bgText.getPositionX(), this.bgText.pos.y)));

        this.btnReceive.setPositionY(this.btnReceive.pos.y - 200);
        this.btnReceive.runAction(new cc.EaseBackOut(cc.moveTo(0.7, this.btnReceive.getPositionX(), this.btnReceive.pos.y)));

        for (var i = 0; i < this.arrayBonusItem.length; i++) {
            var pos = this.arrayBonusItem[i].getPosition();
            this.arrayBonusItem[i].setPositionX(this.arrayBonusItem[i].getPositionX() + 1000);
            this.arrayBonusItem[i].runAction(cc.sequence(
                cc.delayTime(0.05 * i),
                new cc.EaseBackOut(cc.moveTo(1.0, pos))
            ));
        }

    },

    setBonusItem: function () {
        cc.log("BONUS DATA " + JSON.stringify(this.arrayBonusData));
        var startX = 100;
        for (var i = 0; i < this.arrayBonusData.length; i++) {
            var item = this.getAraryBonusItem();
            item.setInfo(this.arrayBonusData[i]);
            item.setPosition(startX + item.getContentSize().width * (i + 0.5) + GUIReceiveGift.PAD_ITEM * i, GUIReceiveGift.HEIGHT_SCROLL * 0.5);
        }
        var sum = (this.arrayBonusData.length - 1) * GUIReceiveGift.PAD_ITEM + this.arrayBonusData.length * this.arrayBonusItem[0].getContentSize().width + 2 * startX;

        if (sum < GUIReceiveGift.WIDTH_SCROLL) {
            this.scrollView.setContentSize(cc.size(sum, GUIReceiveGift.HEIGHT_SCROLL));
        }
        else {
            this.scrollView.setContentSize(cc.size(GUIReceiveGift.WIDTH_SCROLL, GUIReceiveGift.HEIGHT_SCROLL));
        }
        this.scrollView.setInnerContainerSize(cc.size(sum, GUIReceiveGift.HEIGHT_SCROLL));

    },

    getAraryBonusItem: function () {
        var i = 0;
        for (i = 0; i < this.arrayBonusItem.length; i++) {
            if (!this.arrayBonusItem[i].isVisible()) {
                this.arrayBonusItem[i].setVisible(true);
                return this.arrayBonusItem[i];
            }
        }
        var item = new ShopBonusItem();
        this.arrayBonusItem.push(item);
        this.scrollView.addChild(item);
        return item;
    },

    hideComponent: function () {
        this.btnReceive.setVisible(false);
        //   this.btnReceive.runAction(new cc.EaseBackIn(cc.moveBy(0.7, 0, -200)));
        this.imgCongrat.runAction(new cc.EaseBackIn(cc.moveBy(0.7, 0, 200)));
        this.bgText.runAction(new cc.EaseBackIn(cc.moveBy(0.7, 0, 200)));
        this._layerColor.runAction(cc.sequence(
            cc.fadeOut(2.5),
            cc.callFunc(this.onClose.bind(this))
        ));
        this.scrollView.setVisible(false);
    },

    onButtonRelease: function (btn, id) {
        cc.log("ON BUTTON RELEASE *** ");
        this.hideComponent();
        var startGold, endGold;
        var mainLayer = sceneMgr.getMainLayer();
        var delay = 0;
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        var newLevel = NewVipManager.getInstance().getRealVipLevel();

        for (var i = 0; i < this.arrayBonusData.length; i++) {
            this.arrayBonusItem[i].setVisible(false);
            var pStart = this.arrayBonusItem[i].convertToWorldSpace(cc.p(0, 0));
            var pEnd;
            if (mainLayer instanceof LobbyScene) {
                pEnd = mainLayer.getPositionComponent(this.arrayBonusData[i].type);
            }
            else if (mainLayer instanceof ShopIapScene) {
                pEnd = mainLayer.getPositionComponent(this.arrayBonusData[i].type);
            }
            else {
                pEnd = cc.p(0, 0);
            }
            var addBonus = this.arrayBonusData[i].getSum();
            if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_GOLD) {
                if (this.arrayPosEnd[i].x >= 0)
                    pEnd = this.arrayPosEnd[i];
                var timeRun = effectMgr.flyCoinEffect(sceneMgr.layerSystem, addBonus, addBonus / 20, pStart, pEnd);
                this.arrayPosEnd[i].x = -1;
            }
            else {
                effectMgr.flyItemEffect(sceneMgr.layerSystem, this.arrayBonusData[i].getResourceIcon(), 10, pStart, pEnd, delay, false, false, true);
            }

            delay = delay + 0.5;
            // if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_HOUR_VIP) {
            //     if (mainLayer instanceof ShopIapScene) {
            //         var remainTime = NewVipManager.getInstance().getRemainTime();
            //         NewVipManager.getInstance().setRemainTime(remainTime + addBonus);
            //         setTimeout(function () {
            //             var gui = sceneMgr.getMainLayer();
            //             if (gui instanceof ShopIapScene) {
            //                 mainLayer.txtRemainVipTime.setString(NewVipManager.getRemainTimeString(NewVipManager.getInstance().getRemainTime()));
            //             }
            //         }.bind(this), (delay + 0.5) * 1000);
            //     }
            // }
            // else if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_VPOINT) {
            //     var vipLevel = NewVipManager.getInstance().getVipLevel();
            //     var curVpoint = NewVipManager.getInstance().getVpoint();
            //     NewVipManager.getInstance().setVpoint(curVpoint + addBonus);
            //     if (mainLayer instanceof ShopIapScene) {
            //         effectMgr.runVipProgress(mainLayer.bgProgressVip, mainLayer.progressVip, mainLayer.txtProgress, null, mainLayer.iconCurVip,
            //             mainLayer.iconNextVip, addBonus, delay + 0.5, false, vipLevel, curVpoint);
            //     }
            // }
            // else if (this.arrayBonusData[i].type == ShopSuccessData.TYPE_DIAMOND) {
            //     if (mainLayer instanceof LobbyScene || mainLayer instanceof ShopIapScene) {
            //         var startDiamond = Number.parseFloat(mainLayer.getDiamond());
            //         var endDiamond = startDiamond + Number.parseFloat(addBonus);
            //         if (mainLayer instanceof LobbyScene) {
            //             effectMgr.runLabelPoint(mainLayer._uiDiamond, startDiamond, endDiamond, delay + 0.5, 50, EffectMgr.LABEL_RUN_NUMBER);
            //         }
            //         else {
            //             effectMgr.runLabelPoint(mainLayer._uiDiamond, startDiamond, endDiamond, delay + 0.5, 50);
            //         }
            //         this.targetDiamond = endDiamond;
            //     }
            // }
            //
        }
        // ket thuc Effect Bay vat pham, Update lai du lieu cho cac GUI
        setTimeout(function () {
            cc.log("VO DAY MA *** Reset Bonus " + JSON.stringify(this.arrayBonusData));
            this.arrayBonusData = [];
            if (newLevel > vipLevel) {
                NewVipManager.showUpLevelVip(vipLevel, newLevel);
            }
            NewVipManager.getInstance().setWaiting(false);
            var mainLayer = sceneMgr.getMainLayer();
            if (mainLayer instanceof ShopIapScene) {
                mainLayer.updateVipInfo();
            }
            gamedata.updateUserInfoNow();
        }.bind(this), (delay + 1.8) * 1000);
    },
});
GUIReceiveGift.PAD_ITEM = 20;
GUIReceiveGift.WIDTH_SCROLL = 750;
GUIReceiveGift.HEIGHT_SCROLL = 200;

GUIReceiveGift.className = "GUIReceiveGift";
GUIReceiveGift.TAG = 201;

var BonusData = cc.Class.extend({
    ctor: function (num, type, posEnd) {
        this.num = num;
        this.type = type;
        this.posEnd = posEnd;
    }
})