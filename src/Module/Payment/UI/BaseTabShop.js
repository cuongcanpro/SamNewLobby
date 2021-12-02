BaseTabShop = cc.Layer.extend({
    ctor: function (panelSize, itemSize, panelPos, listButtonSize, listButtonPos, scale) {
        this._super();
        this.panelSize = panelSize;
        this.itemSize = itemSize;
        this.panelPos = panelPos;
        this.listButtonSize = listButtonSize;
        this.listButtonPos = listButtonPos;
        this.scaleGroup = scale;
        this.selectedTab = -1;
        this.initGUI();
    },

    initGUI: function () {
        this.tabNormalPayment = new PanelIapItem(this, this.panelSize, this.itemSize);
        this.addChild(this.tabNormalPayment);
        this.tabNormalPayment.setPosition(this.panelPos);

        this.tabSMS = new NewSMSGUI(this, this.panelSize, this.itemSize);
        this.addChild(this.tabSMS);
        this.tabSMS.setPosition(this.panelPos);

        this.arrayButton = [];

        this.listButton = new cc.TableView(this, cc.size(this.listButtonSize.width, this.listButtonSize.height / this.scaleGroup));
        this.listButton.setAnchorPoint(cc.p(0, 0));
        this.listButton.setPosition(this.listButtonPos);
        this.listButton.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listButton.setVerticalFillOrder(0);
        this.listButton.setDelegate(this);
        this.addChild(this.listButton);
        this.listButton.setScale(this.scaleGroup);
        this.listButton.reloadData();
    },

    onEnterFinish: function () {
        if (!cc.sys.isNative) {
            this.listButton.setTouchEnabled(true);
        }
        if (this.selectedTab < 0) {
            this.selectTabMostBought();
        } else {
            this.selectTab(this.selectedTab);
        }
        var cmdConfig = new CmdSendGetConfigShop();
        cmdConfig.putData(CmdSendGetConfigShop.GOLD, paymentMgr.versionShopGold);
        GameClient.getInstance().sendPacket(cmdConfig);
        this.listButton.reloadData();
    },

    reloadTab: function () {
        cc.log("RELOAD TAB GOLD ** ");
        this.selectTab(this.selectedTab);
        this.listButton.reloadData();
    },

    selectTabMostBought: function () {
        cc.log("selectTabMostBought ");
        if (!Config.TEST_SMS_VINA) {
            this.selectTab(this.selectedTab);
            return;
        }
        var targetTab = 0;
        cc.log("selectTabMostBought 1");
        // lay last buy
        for (var i = 0; i < paymentMgr.arrayShopGoldConfig.length; i++) {
            if (paymentMgr.arrayShopGoldConfig[i].type === paymentMgr.lastBuyGoldType) {
                targetTab = i;
                if (paymentMgr.arrayShopGoldConfig[i]["name"].indexOf("sms") >= 0) {
                    targetTab = 0;
                }
                break;
            }
        }

        try {
            var cell = this.listButton.cellAtIndex(targetTab);
            if (cell) {
                this.selectedTab = targetTab;
                for (i = 0; i < this.arrayButton.length; i++) {
                    var imageResource = this.getButtonImage(this.arrayButton[i].idButton);
                    this.arrayButton[i].setTexture(imageResource);
                }

                var image = cell.getChildByTag(1);
                imageResource = this.getButtonImage(cell.getIdx());
                image.setTexture(imageResource);
                this.currentButton = image;
                cc.log("selectTabMostBought 2 " + cell.getIdx());
                this.selectTab(cell.getIdx());
            } else {
                cc.log("selectTabMostBought 2 " + targetTab);
                this.selectTab(targetTab);
            }
        } catch (e) {
            cc.log("InAppPurchase: ", this.selectedTab, e.stack);
            this.selectTab(this.selectedTab);
        }
    },

    updateUserInfo: function () {
        this.listButton.reloadData();
    },

    selectTab: function (id) {
        cc.log("selectTab ** FIRST : ", id);
        if (paymentMgr.arrayShopGoldConfig[id] == null) id = 0;
        this.selectedTab = id;
        this.tabNormalPayment.setVisible(false);
        this.tabSMS.setVisible(false);
        cc.log("selectTab: ", id + "  " + JSON.stringify(paymentMgr.arrayShopGoldConfig[id]));
        var idPayment = paymentMgr.arrayShopGoldConfig[id].id;
        if (!cc.sys.isNative) {
            this.tabNormalPayment.getTableView().setTouchEnabled(idPayment != Payment.GOLD_SMS);
        }
        cc.log("id Payment " + idPayment);
        this.showMaintain(false);
        if (idPayment == Payment.GOLD_SMS) {
            this.tabSMS.show();
            for (var i = Payment.GOLD_SMS_VIETTEL; i <= Payment.GOLD_SMS_VINA; i++) {
                config = paymentMgr.getShopGoldById(i);
                // cc.log("config sms: " + JSON.stringify(config));
                if (config && config["isMaintained"][0] === 0) {
                    break;
                }

            }
            if (i === Payment.GOLD_SMS_VINA) {// tat ca cac nha mang deu bao tri
                this.showMaintain(true);
                this.tabSMS.setVisible(false);
            }
        } else {
            var config = paymentMgr.getShopGoldById(idPayment);
            if (config && config["isMaintained"][0]) {
                this.showMaintain(true);
            } else {
                this.tabNormalPayment.setVisible(true);
                this.tabNormalPayment.setItemType(idPayment);
            }
        }
    },

    showMaintain: function (maintain) {
        var shop = sceneMgr.getMainLayer();
        if (shop instanceof ShopIapScene)
            shop.showMaintain(maintain);
    },

    getButtonImage: function (id) {
        var imageResource = "btnGoogle";
        var idPayment = paymentMgr.arrayShopGoldConfig[id].id;
        switch (idPayment) {
            case Payment.GOLD_IAP:
                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    imageResource = "btnGoogle";

                } else if (cc.sys.os == cc.sys.OS_IOS) {
                    imageResource = "btnApple";
                }
                break;
            case Payment.GOLD_ATM:
                imageResource = "btnATM";
                break;
            case Payment.GOLD_ZALO:
                imageResource = "btnZalo";
                break;
            case Payment.GOLD_ZING:
                imageResource = "btnZing";
                break;
            case Payment.GOLD_G:
                imageResource = "btnG";
                break;
            case Payment.GOLD_SMS:
                imageResource = "btnSMS";
                break;
            case Payment.G_EVENT_TICKET:
                imageResource = "btnGTicket";
                break;
            case Payment.SMS_EVENT_TICKET:
                imageResource = "btnSMSTicket";
                break;
        }
        imageResource = "res/Lobby/ShopIAP/" + imageResource;
        if (id == this.selectedTab) {
            imageResource = imageResource + "Select.png";
        } else {
            imageResource = imageResource + ".png";
        }
        return imageResource;
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(139, 70);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new cc.TableViewCell();
            var image = new cc.Sprite("ShopIAP/btnGoogle.png");
            cell.addChild(image);
            image.setTag(1);
            image.setPosition(image.getContentSize().width * 0.5, 35);
            this.arrayButton.push(image);

            var effect = db.DBCCFactory.getInstance().buildArmatureNode("IconHot");
            cell.addChild(effect);
            effect.setScale(1.5);
            effect.getAnimation().gotoAndPlay("1", -1, -1, -1);
            effect.setTag(2);
            effect.setPosition(image.getContentSize().width * 0.6, image.getContentSize().height);
        }
        var image = cell.getChildByTag(1);
        var effect = cell.getChildByTag(2);
        var imageResource = this.getButtonImage(idx);
        image.idButton = idx;
        image.setTexture(imageResource);
        var config = paymentMgr.arrayShopGoldConfig[idx];
        if (paymentMgr.isShopBonusAll && config["isShopBonus"]) {
            effect.setVisible(true);
        } else {
            if (offerManager.haveOffer()) {
                effect.setVisible(offerManager.checkHaveOfferPayment(paymentMgr.arrayShopGoldConfig[idx].id));
            } else {
                effect.setVisible(false);
            }
        }

        return cell;
    },

    tableCellTouched: function (table, cell) {
        cc.log("goldIap touched");
        // var save = this.selectedTab;
        this.selectedTab = -1;
        //var imageResource = this.getButtonImage(save);
        //this.currentButton.setTexture(imageResource);
        for (var i = 0; i < this.arrayButton.length; i++) {
            var imageResource = this.getButtonImage(this.arrayButton[i].idButton);
            this.arrayButton[i].setTexture(imageResource);
        }

        this.selectedTab = cell.getIdx();
        var image = cell.getChildByTag(1);
        imageResource = this.getButtonImage(cell.getIdx());
        image.setTexture(imageResource);
        this.currentButton = image;
        this.selectTab(cell.getIdx());
    },

    numberOfCellsInTableView: function (table) {
        if (paymentMgr && paymentMgr.arrayShopGoldConfig) {
            var shopGoldLength = paymentMgr.arrayShopGoldConfig.length;
            if (Config.TEST_SMS_VINA && shopGoldLength > 3) {
                shopGoldLength -= 3;
            }
            return shopGoldLength;
        }
        return 0;
    }
});