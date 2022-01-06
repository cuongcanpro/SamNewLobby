/**
 * Created by Hunter on 11/7/2016.
 */

TabTicketPayment = cc.Layer.extend({
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

    onEnterFinish: function () {
        cc.log("TAB TICKET ON ENTER ");
        if (!cc.sys.isNative) {
            this.listButton.setTouchEnabled(true);
        }
        //event.requestShopEventConfig();
        if (this.selectedTab < 0) {
            this.selectedTab = 0;
        }
        cc.log("SELECT TAB " + this.selectedTab);
        this.selectTab(this.selectedTab);
        this.listButton.reloadData();
    },

    reloadTab: function () {
        this.selectTab(this.selectedTab);
        this.listButton.reloadData();
    },

    initGUI: function () {
        this.tabNormalPayment = new PanelIapItem(this, this.panelSize, this.itemSize);
        this.addChild(this.tabNormalPayment);
        this.tabNormalPayment.setPosition(this.panelPos);

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

    updateUserInfo: function () {
        this.listButton.reloadData();
    },

    selectTab: function (id) {
        if (id < 0)
            id = 0;
        this.selectedTab = id;
        this.tabNormalPayment.setVisible(false);
        var arrayConfigTicket = event.getArrayConfigTicket();
        if (!arrayConfigTicket || !arrayConfigTicket[id])
            return;
        var idPayment = arrayConfigTicket[id]["type"];
        if (!cc.sys.isNative) {
            //this.tabNormalPayment.getTableView().setTouchEnabled(idPayment != Payment.GOLD_SMS);
        }
        cc.log("id Payment ticket " + idPayment);
        var idPaymentCheck = idPayment - Payment.BUY_TICKET_FROM;
        this.showMaintain(false);
        if (idPaymentCheck == Payment.GOLD_SMS) {
            cc.log("VO DAY");
            for (var i = Payment.GOLD_SMS_VIETTEL; i <= Payment.GOLD_SMS_VINA; i++) {
                config = gamedata.gameConfig.getShopGoldById(i);
                // cc.log("config sms: " + JSON.stringify(config));
                if (config && config["isMaintained"][0] === 0) {
                    break;
                }

            }
            if (i === Payment.GOLD_SMS_VINA) {// tat ca cac nha mang deu bao tri
                this.showMaintain(true);
                this.tabNormalPayment.setVisible(false);
            } else {
                this.tabNormalPayment.setVisible(true);
                this.tabNormalPayment.setItemType(idPayment);
            }
        } else {
            cc.log("VO DAY 2");
            var config = gamedata.gameConfig.getShopGoldById(idPaymentCheck);
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
        var arrayConfigTicket = event.getArrayConfigTicket();
        var idPayment = arrayConfigTicket[id]["type"];
        switch (idPayment) {
            case Payment.TICKET_IAP:
                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    imageResource = "btnGoogle";

                } else if (cc.sys.os == cc.sys.OS_IOS) {
                    imageResource = "btnApple";
                }
                break;
            case Payment.TICKET_ATM:
                imageResource = "btnATM";
                break;
            case Payment.TICKET_ZALO:
                imageResource = "btnZalo";
                break;
            case Payment.TICKET_ZING:
                imageResource = "btnZing";
                break;
            case Payment.TICKET_G:
                imageResource = "btnG";
                break;
            case Payment.TICKET_SMS:
                imageResource = "btnSMS";
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
            var image = cc.Sprite.create("ShopIAP/btnGoogle.png");
            cell.addChild(image);
            image.setTag(1);
            image.setPosition(image.getContentSize().width * 0.5, 35);
            this.arrayButton.push(image);

            var effect = db.DBCCFactory.getInstance().buildArmatureNode("IconHot");
            cell.addChild(effect);
            effect.getAnimation().gotoAndPlay("1", -1, -1, -1);
            effect.setTag(2);
            effect.setPosition(image.getContentSize().width * 0.6, image.getContentSize().height);
        }
        var image = cell.getChildByTag(1);
        var effect = cell.getChildByTag(2);
        var imageResource = this.getButtonImage(idx);
        image.idButton = idx;
        image.setTexture(imageResource);
        if (idx == this.selectedTab) {
            this.currentButton = image;
        }
        if (event.promoTicket > 0) {
            effect.setVisible(true);
        } else {
            effect.setVisible(false);
        }
        return cell;
    },

    tableCellTouched: function (table, cell) {
        cc.log("goldIap touched");
        // var save = this.selectedTab;
        this.selectedTab = -1;
        for (var i = 0; i < this.arrayButton.length; i++) {
            var imageResource = this.getButtonImage(this.arrayButton[i].idButton);
            this.arrayButton[i].setTexture(imageResource);
        }

        this.selectedTab = cell.getIdx();
        var image = cell.getChildByTag(1);
        imageResource = this.getButtonImage(cell.getIdx());
        image.setTexture(imageResource);
        this.selectTab(cell.getIdx());
    },

    numberOfCellsInTableView: function (table) {
        return event.getArrayConfigTicket().length;
    }
});

TabGoldPayment = cc.Layer.extend({
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
        if (this.selectedTab >= 0) {
            this.selectTabMostBought();
        } else {
            this.selectTab(this.selectedTab);
        }
        var cmdConfig = new CmdSendGetConfigShop();
        cmdConfig.putData(CmdSendGetConfigShop.GOLD, gamedata.gameConfig.versionShopGold);
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
        for (var i = 0; i < gamedata.gameConfig.arrayShopGoldConfig.length; i++) {
            if (gamedata.gameConfig.arrayShopGoldConfig[i].type === gamedata.gameConfig.lastBuyGoldType) {
                targetTab = i;
                if (gamedata.gameConfig.arrayShopGoldConfig[i]["name"].indexOf("sms") >= 0) {
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
        if (id < 0) id = 0;
        this.selectedTab = id;
        this.tabNormalPayment.setVisible(false);
        this.tabSMS.setVisible(false);
        cc.log("selectTab: ", id + "  " + JSON.stringify(gamedata.gameConfig.arrayShopGoldConfig[id]));
        var idPayment = gamedata.gameConfig.arrayShopGoldConfig[id].id;
        if (!cc.sys.isNative) {
            this.tabNormalPayment.getTableView().setTouchEnabled(idPayment != Payment.GOLD_SMS);
        }
        cc.log("id Payment " + idPayment);
        this.showMaintain(false);
        if (idPayment == Payment.GOLD_SMS) {
            this.tabSMS.show();
            for (var i = Payment.GOLD_SMS_VIETTEL; i <= Payment.GOLD_SMS_VINA; i++) {
                config = gamedata.gameConfig.getShopGoldById(i);
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
            var config = gamedata.gameConfig.getShopGoldById(idPayment);
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
        var idPayment = gamedata.gameConfig.arrayShopGoldConfig[id].id;
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
            var image = cc.Sprite.create("ShopIAP/btnGoogle.png");
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
        var config = gamedata.gameConfig.arrayShopGoldConfig[idx];
        if (gamedata.gameConfig.isShopBonusAll && config["isShopBonus"]) {
            effect.setVisible(true);
        } else {
            if (offerManager.haveOffer()) {
                effect.setVisible(offerManager.checkHaveOfferPayment(gamedata.gameConfig.arrayShopGoldConfig[idx].id));
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
        if (gamedata.gameConfig && gamedata.gameConfig.arrayShopGoldConfig) {
            var shopGoldLength = gamedata.gameConfig.arrayShopGoldConfig.length;
            if (Config.TEST_SMS_VINA && shopGoldLength > 3) {
                shopGoldLength -= 3;
            }
            return shopGoldLength;
        }
        return 0;
    }
});

TabGPayment = cc.Layer.extend({
    ctor: function (panelSize, itemSize, panelPos, listButtonSize, listButtonPos, panelCardPos, scaleGroup) {
        this._super();
        this.panelSize = panelSize;
        this.itemSize = itemSize;
        this.panelPos = panelPos;
        this.listButtonSize = listButtonSize;
        this.listButtonPos = listButtonPos;
        this.panelCardPos = panelCardPos;
        this.scaleGroup = scaleGroup;
        this.selectedTab = -1;
        this.initGUI();
    },

    initGUI: function () {
        this.tabNormalPayment = new PanelIapItem(this, this.panelSize, this.itemSize);
        this.addChild(this.tabNormalPayment);
        this.tabNormalPayment.setPosition(this.panelPos);

        this.tabZing = new ZingCardPanel();
        this.addChild(this.tabZing);
        this.tabZing.setPosition(this.panelCardPos);

        //if(Config.ENABLE_SMS_BUY_ZINGCARD) {
        //    this.tabZing = new ZingCardPanel();
        //}
        //else {
        //    this.tabZing = new PanelCard();
        //    this.tabZing.setType(PanelCard.ZING);
        //}
        //this.addChild(this.tabZing);
        //this.tabZing.setPosition(this.getParentToNodeTransform);

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
        if (this.selectedTab < 0)
            this.selectTabMostBought();
        cc.log(" TabGPayment ********** " + this.selectedTab);
        var cmdConfig = new CmdSendGetConfigShop();
        cmdConfig.putData(CmdSendGetConfigShop.G, gamedata.gameConfig.versionShopGold);
        GameClient.getInstance().sendPacket(cmdConfig);
        this.selectTab(this.selectedTab);
        this.listButton.reloadData();
    },

    reloadTab: function () {
        cc.log("RELOAD TAB NE, SELECT TAB " + this.selectedTab);
        this.selectTab(this.selectedTab);
        this.listButton.reloadData();
    },

    selectTabMostBought: function () {
        if (!Config.TEST_SMS_VINA) {
            this.selectTab(this.selectedTab);
            return;
        }
        var maxChoose = 0;
        var indexMaxChoose = 0;
        // check trong list shop G
        var targetTab = 0;
        // lay last buy
        var i;
        for (i = 0; i < gamedata.gameConfig.arrayShopGConfig.length; i++) {
            if (gamedata.gameConfig.arrayShopGConfig[i].type === gamedata.gameConfig.lastBuyGType) {
                cc.log("dm123: " + JSON.stringify(gamedata.gameConfig.arrayShopGConfig[i]));
                targetTab = i;
                if (targetTab >= 6 && targetTab < 9) {
                    targetTab = 0;
                }
                break;
            }
        }

        cc.log("autoSelectTab: ", maxChoose, indexMaxChoose, targetTab);

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
                this.selectTab(targetTab, false);
            } else {
                this.selectTab(targetTab, false);
            }
        } catch (e) {
            this.selectTab(this.selectedTab, false);
        }
    },

    updateUserInfo: function () {
        this.listButton.reloadData();
    },

    selectTab: function (id) {
        if (id < 0) {
            id = 0;
        }
        this.selectedTab = id;
        this.tabNormalPayment.setVisible(false);
        this.tabZing.setVisible(false);
        var idPayment = gamedata.gameConfig.arrayShopGConfig[id].id;
        if (!cc.sys.isNative) {
            this.tabNormalPayment.getTableView().setTouchEnabled(idPayment != Payment.G_ZING);
        }
        cc.log("id Payment " + idPayment);
        this.showMaintain(false);
        if (idPayment == Payment.G_ZING) {
            this.tabZing.setVisible(true);
        } else {
            var config = gamedata.gameConfig.getShopGById(idPayment);
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
        cc.log("ID " + id);
        var idPayment = gamedata.gameConfig.arrayShopGConfig[id].id;
        switch (idPayment) {
            case Payment.G_IAP:
                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    imageResource = "btnGoogle";
                } else if (cc.sys.os == cc.sys.OS_IOS) {
                    imageResource = "btnApple";
                }
                break;
            case Payment.G_ATM:
                imageResource = "btnATM";
                break;
            case Payment.G_ZALO:
                imageResource = "btnZalo";
                break;
            case Payment.G_ZING:
                imageResource = "btnZing";
                break;
            case Payment.G_CARD:
                imageResource = "btnCard";
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
            var image = cc.Sprite.create("ShopIAP/btnGoogle.png");
            cell.addChild(image);
            image.setTag(1);
            image.setPosition(image.getContentSize().width * 0.5, 35);
            this.arrayButton.push(image);

            var effect = cc.Sprite.create("ShopIAP/icon_hot_bonus.png");
            cell.addChild(effect);
            effect.setTag(2);
            effect.setPosition(image.getContentSize().width * 0.92, image.getContentSize().height * 0.83);
            effect.setScale(0.6);

            var text = BaseLayer.createLabelText();
            text.setFontName(SceneMgr.FONT_BOLD);
            text.setFontSize(19);
            text.setString("100%");
            effect.addChild(text);
            text.setTag(3);
            text.setPosition(effect.getContentSize().width * 0.5, effect.getContentSize().height * 0.5);
        }
        var image = cell.getChildByTag(1);
        var imageResource = this.getButtonImage(idx);
        image.idButton = idx;
        image.setTexture(imageResource);
        if (idx == this.selectedTab) {
            this.currentButton = image;
        }
        var effect = cell.getChildByTag(2);
        var config = gamedata.gameConfig.arrayShopGConfig[idx];

        if (gamedata.gameConfig.isShopBonusAllG && config["shopBonus"] > 0) {
            effect.setVisible(true);
            var text = effect.getChildByTag(3);
            if (!cc.sys.isNative) {
                text.setFontName("tahoma");
            }
            text.setString("+" + config["shopBonus"] + "%");
        } else {
            effect.setVisible(false);
        }
        return cell;
    },

    tableCellTouched: function (table, cell) {
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
        if (gamedata.gameConfig && gamedata.gameConfig.arrayShopGConfig) {
            // cc.log("--TabG : " + gamedata.gameConfig.arrayShopGConfig.length + " in " + JSON.stringify(gamedata.gameConfig.arrayShopGConfig));
            return gamedata.gameConfig.arrayShopGConfig.length;
        }
        return 0;
    }
});

TabItemPayment = cc.Layer.extend({
    ctor: function(panelSize, panelPos, listButtonSize, listButtonPos, scale) {
        this._super();
        this.panelSize = panelSize; //size of this tab
        this.panelPos = panelPos;   //pos of this tab
        this.listButtonSize = listButtonSize;   //size of tab list button
        this.listButtonPos = listButtonPos;     //pos of tab list button
        this.scaleGroup = scale;
        this.selectedTab = -1;
        this.shopItemData = {};
        this.selectedItem = {};

        this.arrayButtonId = [TabItemPayment.BTN_TAB_AVATAR, TabItemPayment.BTN_TAB_INTERACTION, TabItemPayment.BTN_TAB_EMOTICON, TabItemPayment.BTN_TAB_VOUCHER];
        this.shopItemRef = {};
        this.shopItemRef[TabItemPayment.BTN_TAB_AVATAR] = [StorageManager.TYPE_AVATAR];
        this.shopItemRef[TabItemPayment.BTN_TAB_INTERACTION] = [StorageManager.TYPE_INTERACTION];
        this.shopItemRef[TabItemPayment.BTN_TAB_EMOTICON] = [StorageManager.TYPE_EMOTICON];
        this.shopItemRef[TabItemPayment.BTN_TAB_VOUCHER] = [StorageManager.TYPE_VOUCHER];

        this.initGUI();
    },

    initGUI: function() {
        //init list button
        this.listButton = new ccui.ListView();
        this.listButton.setAnchorPoint(cc.p(0, 0));
        this.listButton.setPosition(this.listButtonPos);
        this.listButton.setContentSize(cc.size(this.listButtonSize.width, this.listButtonSize.height / this.scaleGroup));
        this.listButton.setScale(this.scaleGroup);
        this.listButton.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listButton.setBounceEnabled(true);
        this.listButton.setScrollBarEnabled(false);
        for (var i = 0; i < this.arrayButtonId.length; i++){
            var tabId = this.arrayButtonId[i];
            var panel = new ccui.Layout();
            panel.setContentSize(this.listButton.width, 70);

            var tabImage = new cc.Sprite(this.getButtonImage(tabId));
            tabImage.setPosition(tabImage.width/2, 35);
            tabImage.setTag(1);

            var effect = db.DBCCFactory.getInstance().buildArmatureNode("IconHot");
            effect.setPosition(tabImage.getContentSize().width * 0.6, tabImage.getContentSize().height);
            effect.setScale(1.5);
            effect.setTag(2);
            effect.getAnimation().gotoAndPlay("1", -1, -1, -1);
            effect.setVisible(false);

            panel.addChild(tabImage);
            panel.addChild(effect);
            this.listButton.addChild(panel);
            panel.setTouchEnabled(true);
        }
        this.addChild(this.listButton);
        this.listButton.addEventListener(function(listButton, type){
            if (type == ccui.ListView.ON_SELECTED_ITEM_END)
                this.selectTab(this.arrayButtonId[listButton.getCurSelectedIndex()]);
        }.bind(this));

        //init preview panel
        this.pPreview = ccs.load("Lobby/ShopItemPreview.json").node;
        ccui.Helper.doLayout(this.pPreview);
        this.pPreview.setScale(this.panelSize.height / this.pPreview.height);
        this.pPreview.setPosition(cc.winSize.width - this.pPreview.width * this.pPreview.getScale(), this.panelPos.y);
        this.pPreview.setLocalZOrder(1);
        this.addChild(this.pPreview);
        this.initPanelPreview();

        //init item list
        this.tbItemSize = cc.size(this.panelSize.width - (this.pPreview.width - 10) * this.pPreview.getScale() - 10, this.panelSize.height);
        this.initPItem(this.tbItemSize);
        this.pItem = new cc.TableView(this, this.tbItemSize);
        this.pItem.setAnchorPoint(cc.p(0, 0));
        this.pItem.setPosition(this.panelPos.x + 5, this.panelPos.y);
        this.pItem.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.pItem.setVerticalFillOrder(0);
        this.pItem.setDelegate(this);
        this.addChild(this.pItem);

        this.itemHighlight = new cc.Sprite("ShopItem/itemHighlight.png");
        this.itemHighlight.retain();
        this.itemHighlight.setPosition(ShopItemCell.WIDTH/2, ShopItemCell.HEIGHT/2);

        this.emptyIcon = new cc.Sprite();
        this.emptyIcon.setPosition(this.pItem.x + this.tbItemSize.width/2, this.pItem.y + this.tbItemSize.height/2 +50);
        this.addChild(this.emptyIcon);
        this.emptyLabel = new ccui.Text("", "fonts/tahomabd.ttf", 20);
        this.emptyLabel.ignoreContentAdaptWithSize(true);
        this.emptyLabel.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.emptyLabel.enableOutline(cc.color("#42299B"), 2);
        this.emptyLabel.setSkewX(10);
        this.emptyLabel.setPosition(this.pItem.x + this.tbItemSize.width/2, this.pItem.y + this.tbItemSize.height/2 - 75);
        this.addChild(this.emptyLabel);
    },

    initPItem: function(tbItemSize) {
        var totalWidth = tbItemSize.width;
        this.numCol = ShopItemCell.MIN_COL;
        for (; this.numCol < ShopItemCell.MAX_COL; this.numCol++){
            if ((this.numCol + 1) * ShopItemCell.MIN_SCALE * ShopItemCell.WIDTH + (this.numCol + 2) * ShopItemCell.MIN_SPACE <= totalWidth){
                continue;
            }
            break;
        }
        this.itemScale = (totalWidth - (this.numCol + 1) * ShopItemCell.MIN_SPACE) / (this.numCol * ShopItemCell.WIDTH);
        this.itemSpace = ShopItemCell.MIN_SPACE;
        if (this.itemScale >= 1){
            this.itemScale = totalWidth/(this.numCol * ShopItemCell.WIDTH + (this.numCol + 1) * ShopItemCell.MIN_SPACE);
            this.itemSpace = ShopItemCell.MIN_SPACE * this.itemScale;
        }
    },

    onEnterFinish: function() {
        //send get shop item config
        StorageManager.getInstance().sendGetShopItemConfig();

        try {
            this.pPreview.avatar.asyncExecuteWithUrl(GameData.getInstance().userData.zName, GameData.getInstance().userData.avatar);
        } catch (e) {}

        var avatarFramePath = StorageManager.getInstance().getUserAvatarFramePath();
        if (avatarFramePath != "")
            this.pPreview.avatarFrame.setTexture(avatarFramePath);
        else this.pPreview.avatarFrame.setTexture(null);

        //select tab
        this.selectedItemId = {};
        for (var i = 0; i < this.arrayButtonId.length; i++)
            this.selectedItemId[this.arrayButtonId[i]] = -1;
        this.reloadTab();
    },

    reloadTab: function() {
        this.tooltip.stopAllActions();
        this.tooltip.setVisible(false);
        //call when tab item chosen or data updated
        this.selectedItem = {};
        for (var i = 0; i < this.arrayButtonId.length; i++)
            this.selectedItem[this.arrayButtonId[i]] = -1;

        this.shopItemData = {};
        var itemConfig = StorageManager.getInstance().itemConfig;
        for (var i = 0; i < this.arrayButtonId.length; i++) {
            var tabId = this.arrayButtonId[i];
            this.shopItemData[tabId] = [];
            if (StorageManager.getInstance().shopItemConfig && itemConfig) {
                for (var j = 0; j < this.shopItemRef[tabId].length; j++) {
                    var type = this.shopItemRef[tabId][j];
                    if (StorageManager.getInstance().shopItemConfig[type] && itemConfig[type]) {
                        for (var itemId in StorageManager.getInstance().shopItemConfig[type].listItem) {
                            if (!itemConfig[type][itemId].enable) continue;
                            this.shopItemData[tabId].push({
                                type: type,
                                id: Number(itemId),
                                selectedOption: 0,
                                selectedNum: 1
                            });
                            if (itemId == this.selectedItemId[tabId])
                                this.selectedItem[tabId] = this.shopItemData[tabId].length - 1;
                        }
                    }
                }
                this.shopItemData[tabId].sort(function(a, b){
                    var countA = 0, countB = 0, conditions;
                    var shopItemConfig = StorageManager.getInstance().shopItemConfig;

                    conditions = shopItemConfig[a.type].listItem[a.id].conditions;
                    for (var i = 0; i < conditions.length; i++){
                        switch(conditions[i].type){
                            case StorageManager.VIP_CONDITION:
                                countA += Number(NewVipManager.getInstance().getRealVipLevel() < conditions[i].num);
                                break;
                            case StorageManager.LEVEL_CONDITION:
                                countA += Number(gamedata.userData.level < conditions[i].num);
                                break;
                        }
                    }

                    conditions = shopItemConfig[b.type].listItem[b.id].conditions;
                    for (var i = 0; i < conditions.length; i++){
                        switch(conditions[i].type){
                            case StorageManager.VIP_CONDITION:
                                countB += Number(NewVipManager.getInstance().getRealVipLevel() < conditions[i].num);
                                break;
                            case StorageManager.LEVEL_CONDITION:
                                countB += Number(gamedata.userData.level < conditions[i].num);
                                break;
                        }
                    }

                    if (countA == countB){
                        var discountA = 0, discountB = 0, options;

                        options = shopItemConfig[a.type].listItem[a.id].options;
                        for (var i = 0; i < options.length; i++)
                            discountA = Math.max(discountA, options[i].discount);

                        options = shopItemConfig[b.type].listItem[b.id].options;
                        for (var i = 0; i < options.length; i++)
                            discountB = Math.max(discountB, options[i].discount);

                        return discountB - discountA;
                    }
                    return countA - countB;
                });
            }
            if (this.selectedItem[tabId] == -1)
                this.selectedItemId[tabId] = -1;
        }

        this.listOfferTab = [];
        if (StorageManager.getInstance().shopItemConfig) {
            for (var i = 0; i < this.arrayButtonId.length; i++){
                var tabId = this.arrayButtonId[i];
                for (var j = 0; j < this.shopItemRef[tabId].length; j++) {
                    var type = this.shopItemRef[tabId][j];
                    if (StorageManager.getInstance().shopItemConfig[type]) {
                        if (StorageManager.getInstance().shopItemConfig[type].hasDiscount || StorageManager.getInstance().shopItemConfig[type].hasLimitedItem) {
                            this.listOfferTab.push(tabId);
                            break;
                        }
                    }
                }
            }
        }
        for (var i = 0; i < this.arrayButtonId.length; i++) {
            var tabId = this.arrayButtonId[i];
            this.listButton.getItem(i).getChildByTag(2).setVisible(this.listOfferTab.indexOf(tabId) != -1);
        }
        this.selectTab(this.selectedTab);

        var scene = sceneMgr.getMainLayer();
        if (scene instanceof ShopIapScene)
            scene.showMaintain(false);
    },

    /* region Table View Delegate */
    tableCellAtIndex: function(table, idx) {
        var cell = table.dequeueCell();
        if (!cell) cell = new ShopItemCell(this.numCol, this.itemScale, this.itemSpace, this.itemHighlight, this);

        var items = [];
        var shopItemConfig = StorageManager.getInstance().shopItemConfig;
        for (var i = idx * this.numCol; i < this.shopItemData[this.selectedTab].length && i < (idx + 1) * this.numCol; i++){
            var data = this.shopItemData[this.selectedTab][i];
            var item = {};
            item.path = StorageManager.getItemIconPath(data.type, null, data.id);
            item.isSelected = i == this.selectedItem[this.selectedTab];
            item.data = shopItemConfig[data.type].listItem[data.id];
            item.selectedOption = data.selectedOption;
            item.index = i;
            switch(data.type) {
                case StorageManager.TYPE_AVATAR:
                    item.scale = 0.5;
                    break;
                case StorageManager.TYPE_INTERACTION:
                    item.scale = 0.8;
                    break;
                case StorageManager.TYPE_EMOTICON:
                    item.scale = 0.8;
                    break;
                case StorageManager.TYPE_VOUCHER:
                    item.scale = 0.75;
                    break;
            }
            items.push(item);
        }
        cell.setData(items);
        return cell;
    },

    tableCellSizeForIndex: function(table, idx) {
        return cc.size(this.pItem.getContentSize().width, StorageItemCell.HEIGHT * this.itemScale + this.itemSpace);
    },

    numberOfCellsInTableView: function(table) {
        if (!table.isVisible()) return 0;
        if (this.selectedTab == -1 || !this.shopItemData[this.selectedTab]) return 0;
        else return Math.ceil(this.shopItemData[this.selectedTab].length / this.numCol);
    },

    getButtonImage: function(tabId) {
        var imageResource = "";
        switch(tabId) {
            case TabItemPayment.BTN_TAB_AVATAR:
                imageResource = "btnTabAvatar";
                break;
            case TabItemPayment.BTN_TAB_INTERACTION:
                imageResource = "btnTabInteraction";
                break;
            case TabItemPayment.BTN_TAB_EMOTICON:
                imageResource = "btnTabEmoticon";
                break;
            case TabItemPayment.BTN_TAB_VOUCHER:
                imageResource = "btnTabVoucher";
                break;
        }
        imageResource = "Lobby/ShopIAP/" + imageResource;
        if (tabId == this.selectedTab) {
            imageResource = imageResource + "Active.png";
        } else {
            imageResource = imageResource + "Inactive.png";
        }
        return imageResource;
    },
    /* endregion Table View Delegate */

    /* region Controls */
    selectTab: function(tabId) {
        if (this.arrayButtonId.indexOf(tabId) == -1)
            tabId = this.arrayButtonId[0];
        this.selectedTab = tabId;
        for (var i = 0; i < this.arrayButtonId.length; i++){
            var tabImage = this.listButton.getItem(i).getChildByTag(1);
            tabImage.setTexture(this.getButtonImage(this.arrayButtonId[i]));
        }
        //reload table item
        this.pItem.reloadData();
        this.showNoItemInShop(this.shopItemData[this.selectedTab].length == 0);
        this.selectItem(this.selectedItem[this.selectedTab]);
    },

    selectItem: function(idx, itemNode) {
        var pos = itemNode ? itemNode.convertToWorldSpace(itemNode.getChildByName("img").getPosition()) : null;

        var oldSelectedIdx = this.selectedItem[this.selectedTab];
        this.unselectItem(oldSelectedIdx);
        if (idx < 0 || idx >= this.shopItemData[this.selectedTab].length){
            this.selectedItem[this.selectedTab] = -1;
            this.selectedItemId[this.selectedTab] = -1;
            if (oldSelectedIdx >= 0 && oldSelectedIdx < this.shopItemData[this.selectedTab].length)
                this.pItem.updateCellAtIndex(Math.floor(oldSelectedIdx/3));
            this.setPreviewItemData(null, pos);
            return;
        }
        this.selectedItem[this.selectedTab] = idx;
        this.selectedItemId[this.selectedTab] = this.shopItemData[this.selectedTab][idx].id;
        if (oldSelectedIdx >= 0 && oldSelectedIdx < this.shopItemData[this.selectedTab].length)
            this.pItem.updateCellAtIndex(Math.floor(oldSelectedIdx / this.numCol));
        this.pItem.updateCellAtIndex(Math.floor(this.selectedItem[this.selectedTab] / this.numCol));

        var data = this.shopItemData[this.selectedTab][idx];
        var shopItemConfig = StorageManager.getInstance().shopItemConfig;
        var itemConfig = StorageManager.getInstance().itemConfig;

        var itemData = {
            type: data.type,
            id: data.id,
            name: itemConfig[data.type][data.id].name,
            description: itemConfig[data.type][data.id].description,
            listItemId: itemConfig[data.type][data.id].listItemId,
            selectedOption: data.selectedOption,
            selectedNum: data.selectedNum,
            useType: shopItemConfig[data.type].useType,
            conditions: shopItemConfig[data.type].listItem[data.id].conditions,
            options: shopItemConfig[data.type].listItem[data.id].options,
            index: idx,
            ref: shopItemConfig[data.type].listItem[data.id]
        };
        this.setPreviewItemData(itemData, pos);
    },

    unselectItem: function(idx) {
        if (idx < 0 || idx >= this.shopItemData[this.selectedTab].length)
            return;
        this.shopItemData[this.selectedTab][idx].selectedOption = 0;
        this.shopItemData[this.selectedTab][idx].selectedNum = 1;
    },

    showNoItemInShop: function(show) {
        this.emptyIcon.setVisible(show);
        this.emptyLabel.setVisible(show);
        if (show){
            this.emptyIcon.setTexture("Storage/empty.png");
            this.emptyLabel.setString("Hiện không có vật phẩm nào được bán.");
            StringUtility.breakLabelToMultiLine(this.emptyLabel, this.tbItemSize.width);
        }
    },
    /* endregion Controls */

    /* region Panel Preview */
    initPanelPreview: function() {
        this.pPreview.labelNoItem = this.pPreview.getChildByName("labelNone");
        this.pPreview.pItem = this.pPreview.getChildByName("pItem");
        this.pPreview.avatarBg = this.pPreview.getChildByName("avatarBg");
        this.pPreview.avatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.pPreview.avatar.setPosition(this.pPreview.avatarBg.width/2, this.pPreview.avatarBg.height/2);
        this.pPreview.avatar.setScale(1.5);
        this.pPreview.avatarBg.addChild(this.pPreview.avatar);
        this.pPreview.avatarFrame = new cc.Sprite();
        this.pPreview.avatarFrame.setPosition(this.pPreview.avatarBg.width/2, this.pPreview.avatarBg.height/2);
        this.pPreview.avatarFrame.setScale(0.75);
        this.pPreview.avatarBg.addChild(this.pPreview.avatarFrame);

        this.pPreview.pTime = this.pPreview.getChildByName("pTime");
        this.pPreview.txtTimeDefault = this.pPreview.pTime.getChildByName("txtDefault");
        this.pPreview.pTimeLong = this.pPreview.pTime.getChildByName("bgTimeLong");
        this.pPreview.pTimeShort = this.pPreview.pTime.getChildByName("bgTimeShort");

        this.pPreview.btnBuy = this.pPreview.getChildByName("btnBuy");
        this.pPreview.btnBuy.setPressedActionEnabled(false);
        this.pPreview.iconDiamond = this.pPreview.btnBuy.getChildByName("iconDiamond");
        this.pPreview.diamond = this.pPreview.iconDiamond.getChildByName("diamond");
        this.pPreview.diamond.ignoreContentAdaptWithSize(true);
        this.pPreview.iconCondition = this.pPreview.btnBuy.getChildByName("iconCondition");
        this.pPreview.condition = this.pPreview.iconCondition.getChildByName("condition");
        this.pPreview.condition.ignoreContentAdaptWithSize(true);

        this.pPreview.descriptionBg = this.pPreview.getChildByName("descriptionBg");
        this.pPreview.name = this.pPreview.descriptionBg.getChildByName("name");
        this.pPreview.name.ignoreContentAdaptWithSize(true);

        this.pPreview.pOption = this.pPreview.descriptionBg.getChildByName("options");
        this.pPreview.optionNodes = [];
        for (var i = 0; i < this.pPreview.pOption.getChildrenCount(); i++){
            var optionNode = this.pPreview.pOption.getChildByName("option" + i);
            optionNode.setAnchorPoint(0, 0.5);
            optionNode.text = optionNode.getChildByName("text");
            optionNode.text.ignoreContentAdaptWithSize(true);
            optionNode.box = optionNode.getChildByName("box");
            optionNode.box.setTouchEnabled(false);
            optionNode.defaultPos = optionNode.getPosition();
            optionNode.index = i;
            this.pPreview.optionNodes.push(optionNode);

            optionNode.setTouchEnabled(true);
            optionNode.addTouchEventListener(function(option, type){
                if (type == ccui.Widget.TOUCH_ENDED){
                    if (!option.box.isSelected())
                        this.setPreviewOptionInfo(option.index);
                }
            }, this);
        }

        this.pPreview.pNum = this.pPreview.descriptionBg.getChildByName("pNum");
        this.pPreview.btnAdd = this.pPreview.pNum.getChildByName("btnAdd");
        this.pPreview.btnSub = this.pPreview.pNum.getChildByName("btnSub");
        this.pPreview.numProgress = this.pPreview.pNum.getChildByName("numBar");
        this.pPreview.numProgress.setTouchEnabled(true);
        this.pPreview.numProgress.addTouchEventListener(this.onTouchProgressPreviewItem.bind(this), this);
        this.pPreview.btnSlide = this.pPreview.numProgress.getChildByName("btnSlide");
        this.pPreview.labelNum = this.pPreview.pNum.getChildByName("labelNum");
        this.pPreview.selectedNum = this.pPreview.labelNum.getChildByName("num");
        this.pPreview.selectedNum.ignoreContentAdaptWithSize(true);
        this.pPreview.btnInfo = this.pPreview.getChildByName("btnInfo");
        this.pPreview.lock = this.pPreview.descriptionBg.getChildByName("lock");

        this.pPreview.pDes = this.pPreview.descriptionBg.getChildByName("pDes");
        this.pPreview.exprireTime = this.pPreview.pDes.getChildByName("expireTime");
        this.pPreview.exprireTime.ignoreContentAdaptWithSize(true);
        this.pPreview.exprireTime.defaultPosition = this.pPreview.exprireTime.getPosition();

        this.pPreview.btnAdd.addTouchEventListener(this.onAddPreviewItemNum.bind(this), this);
        this.pPreview.btnSub.addTouchEventListener(this.onSubPreviewItemNum.bind(this), this);
        this.pPreview.btnSlide.addTouchEventListener(this.onSlidePreviewItem.bind(this), this);
        this.pPreview.btnBuy.addTouchEventListener(this.onBuyItem.bind(this), this);
        this.pPreview.btnInfo.addTouchEventListener(this.onShowPreviewItemInfo.bind(this), this);

        this.initTooltip();
    },

    initTooltip: function() {
        this.tooltip = new cc.Node();
        this.tooltip.setCascadeOpacityEnabled(true);
        this.tooltip.bg = new ccui.ImageView("9patch.png");
        this.tooltip.bg.setOpacity(150);
        this.tooltip.bg.setScale9Enabled(true);
        this.tooltip.bg.setAnchorPoint(0.5, 0.5);
        this.tooltip.bg.setPosition(0, 0);
        this.tooltip.addChild(this.tooltip.bg);
        this.tooltip.panel = new ccui.Layout();
        this.tooltip.panel.setAnchorPoint(0.5, 0.5);
        this.tooltip.panel.setPosition(0, 0);
        this.tooltip.panel.setClippingEnabled(true);
        this.tooltip.text = new ccui.Text("", "fonts/tahoma.ttf", 20);
        this.tooltip.text.ignoreContentAdaptWithSize(true);
        this.tooltip.text.setAnchorPoint(0, 0);
        this.tooltip.text.setPosition(0, 0);
        this.tooltip.panel.addChild(this.tooltip.text);
        this.tooltip.addChild(this.tooltip.panel);
        this.pPreview.addChild(this.tooltip);
    },

    setPreviewItemData: function(itemData, pos) {
        this.previewItemData = itemData;
        this.pPreview.labelNoItem.setVisible(!itemData);
        this.pPreview.btnBuy.setVisible(!!itemData);
        this.pPreview.descriptionBg.setVisible(!!itemData);
        this.pPreview.pItem.setVisible(!!itemData);
        this.pPreview.btnInfo.setVisible(!!itemData);
        this.pPreview.pItem.unscheduleAllCallbacks();
        this.pPreview.pItem.removeAllChildren();
        this.pPreview.pTime.setVisible(!!itemData);
        this.pPreview.avatarBg.setVisible(!!itemData);
        this.pPreview.avatarFrame.setVisible(true);
        if (!itemData) return;
        //set common data
        this.pPreview.name.setString(itemData.name);
        switch(itemData.type){
            case StorageManager.TYPE_AVATAR:
                this.pPreview.avatarBg.setVisible(true);
                this.pPreview.avatarFrame.setVisible(false);
                var avatarSprite = new cc.Sprite(StorageManager.getItemIconPath(StorageManager.TYPE_AVATAR, null, this.previewItemData.id));
                avatarSprite.setPosition(this.pPreview.pItem.width/2, this.pPreview.pItem.height/2);
                avatarSprite.setScale(0.8);
                avatarSprite.setTag(1);
                this.pPreview.pItem.addChild(avatarSprite);
                break;
            case StorageManager.TYPE_INTERACTION:
            {
                this.pPreview.avatarBg.setVisible(true);
                var animList = StorageManager.getInteractPreviewAnimList(itemData.id);
                if (animList.length > 0) {
                    this.pPreview.pItem.animIndex = 0;
                    this.pPreview.pItem.animList = animList;
                    this.pPreview.pItem.timer = 0;
                    this.pPreview.pItem.curDuration = 0;
                    var callback = function (dt) {
                        this.timer += dt;
                        if (this.timer >= this.curDuration) {
                            this.timer = 0;
                            this.removeAllChildren();
                            var anim = this.animList[this.animIndex];
                            this.animIndex = (this.animIndex + 1) % this.animList.length;
                            var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim[0]);
                            eff.setPosition(this.width / 2, this.height / 2);
                            eff.setScale(0.8);
                            this.addChild(eff);
                            eff.getAnimation().gotoAndPlay(anim[1], -1, -1, 1);
                            this.curDuration = eff.getAnimation().getLastAnimationState().getTotalTime();
                            eff.setOpacity(255);
                            eff.stopAllActions();
                            eff.setVisible(false);
                            eff.runAction(cc.sequence(
                                cc.delayTime(1 / 60),
                                cc.show(),
                                cc.delayTime(this.curDuration * 0.8),
                                cc.fadeOut(this.curDuration * 0.2),
                                cc.delayTime(1)
                            ));
                            this.curDuration += 1;
                        }
                    }.bind(this.pPreview.pItem);
                    this.pPreview.pItem.schedule(callback, 0, cc.REPEAT_FOREVER, pos ? 5 : 0);
                }
                if (pos){
                    interactPlayer.playInteract(
                        pos, this.pPreview.convertToWorldSpace(this.pPreview.avatarBg.getPosition()),
                        itemData.id, 1, this.pPreview.pItem
                    );
                }
                break;
            }
            case StorageManager.TYPE_EMOTICON:
                this.pPreview.avatarBg.setVisible(true);
                switch(StorageManager.getEmoticonAnimationType(itemData.id)){
                    case StorageManager.ANIM_TYPE_DRAGONBONES:
                        var anim = db.DBCCFactory.getInstance().buildArmatureNode("Emoticon" + itemData.id);
                        anim.setPosition(this.pPreview.pItem.width/2, this.pPreview.pItem.height/2);
                        anim.setScale(StorageManager.getEmoticonScale(itemData.id));
                        this.pPreview.pItem.addChild(anim);
                        this.pPreview.pItem.animIndex = 0;
                        this.pPreview.pItem.listAnimId = itemData.listItemId;
                        var callback = function(anim){
                            //var animId = this.pPreview.pItem.listAnimId[this.pPreview.pItem.animIndex++ % this.pPreview.pItem.listAnimId.length];
                            var animId = this.pPreview.pItem.listAnimId[Math.floor(Math.random() * this.pPreview.pItem.listAnimId.length)];
                            anim.getAnimation().gotoAndPlay("" + animId, -1, -1, 0);
                            anim.setOpacity(255);
                            anim.stopAllActions();
                            anim.setVisible(false);
                            anim.runAction(cc.sequence(cc.delayTime(1/60), cc.show(), cc.delayTime(2.5), cc.fadeOut(0.5), cc.delayTime(1)));
                        }.bind(this, anim);
                        callback();
                        this.pPreview.pItem.schedule(callback, 4);
                        break;
                    case StorageManager.ANIM_TYPE_SPINE:
                        this.pPreview.pItem.animIndex = 0;
                        this.pPreview.pItem.listAnimId = itemData.listItemId;
                        var callback = function(){
                            this.pPreview.pItem.removeAllChildren();
                            //var animId = this.pPreview.pItem.listAnimId[this.pPreview.pItem.animIndex++ % this.pPreview.pItem.listAnimId.length];
                            var animId = this.pPreview.pItem.listAnimId[Math.floor(Math.random() * this.pPreview.pItem.listAnimId.length)];
                            var anim = new CustomSkeleton("Armatures/Emoticon/" + itemData.id, animId);
                            anim.setOpacity(255);
                            anim.setPosition(this.pPreview.pItem.width/2, this.pPreview.pItem.height/2);
                            anim.setScale(StorageManager.getEmoticonScale(itemData.id));
                            this.pPreview.pItem.addChild(anim);
                            anim.setAnimation(0, 'animation', true);
                            anim.stopAllActions();
                            anim.runAction(cc.sequence(cc.delayTime(2.5), cc.fadeOut(0.5), cc.delayTime(1)));
                        }.bind(this);
                        callback();
                        this.pPreview.pItem.schedule(callback, 4);
                        break;
                    default:
                        cc.log(StorageManager.getEmoticonAnimationType(itemData.id))
                }
                break;
            case StorageManager.TYPE_VOUCHER:
                this.pPreview.avatarBg.setVisible(false);
                var voucherSprite = new cc.Sprite(StorageManager.getItemIconPath(StorageManager.TYPE_VOUCHER, null, this.previewItemData.id));
                voucherSprite.setPosition(this.pPreview.pItem.width/2, this.pPreview.pItem.height/2);
                voucherSprite.setTag(1);
                this.pPreview.pItem.addChild(voucherSprite);
                break;
        }
        //check all conditions
        var conditions = [];
        for (var i = 0; i < itemData.conditions.length; i++){
            var condition = itemData.conditions[i];
            switch(condition.type){
                case StorageManager.VIP_CONDITION:
                    if (NewVipManager.getInstance().getRealVipLevel() < condition.num) {
                        conditions.push(condition);
                    }
                    break;
                case StorageManager.LEVEL_CONDITION:
                    if (gamedata.userData.level < condition.num) {
                        conditions.push(condition);
                    }
                    break;
            }
        }
        //set condition if there is
        this.pPreview.iconCondition.setVisible(conditions.length > 0);
        this.pPreview.iconDiamond.setVisible(conditions.length == 0);
        this.pPreview.pNum.setVisible(false);
        this.pPreview.pOption.setVisible(false);
        this.pPreview.pDes.setVisible(false);
        this.pPreview.lock.setVisible(conditions.length > 0);

        if (conditions.length > 0) {
            this.setPreviewCondition(conditions);
            this.setPreviewBtnBuyEnabled(false);
        }
        else{
            //check money
            switch(itemData.useType){
                case StorageManager.USE_BY_TIME:
                    if (itemData.options.length > 1) {
                        this.pPreview.pOption.setVisible(true);
                        this.setPreviewOptionInfo(itemData.selectedOption, itemData.options);
                    }
                    else {
                        this.pPreview.pDes.setVisible(true);
                        this.setPreviewDesInfo(itemData.options[0].expireTime, itemData.options[0].price);
                    }
                    break;
                case StorageManager.USE_BY_UNIT:
                    this.pPreview.pNum.setVisible(true);
                    this.setPreviewNumInfo(itemData.selectedNum, itemData.options);
                    break;
                case StorageManager.USE_ONCE:
                    this.pPreview.pDes.setVisible(true);
                    this.setPreviewDesInfo(itemData.options[0].expireTime, itemData.options[0].price);
                    break;
            }
        }

        this.setPreviewTimeInfo(itemData.ref);
    },

    setPreviewTimeInfo: function(itemRef) {
        this.pPreview.pTimeLong.setVisible(false);
        this.pPreview.pTimeShort.setVisible(false);
        this.pPreview.txtTimeDefault.setVisible(false);
        this.pPreview.pTime.setVisible(itemRef.remainTime >= 0);
        this.pPreview.pTime.unscheduleAllCallbacks();
        if (itemRef.remainTime >= 0){
            var convert = function(mili){
                var s = Math.ceil(mili / 1000);
                if (s >= 60 * 60){
                    var m = Math.ceil(s / 60);
                    if (m >= 60 * 24){
                        return null;
                    }
                    else{
                        var h = Math.floor(m / 60);
                        m = m - h * 60;
                        return [{value: h, unit:"h"}, {value: m, unit:"p"}];
                    }
                }
                else{
                    var m = Math.floor(s / 60);
                    s = s - m * 60;
                    return [{value: m, unit:"p"}, {value: s, unit:"s"}];
                }
            };
            var effect = function(txtOld, txtNew){
                txtOld.setPosition(txtNew.getPosition());
                txtOld.setColor(txtNew.getColor());
                txtNew.getParent().addChild(txtOld);

                txtNew.setAnchorPoint(0.5, 1);
                txtNew.setPositionY(txtNew.getPositionY() + txtNew.getContentSize().height/2);
                txtOld.setAnchorPoint(0.5, 0);
                txtOld.setPositionY(txtOld.getPositionY() - txtOld.getContentSize().height/2);
                txtNew.setScaleY(0);
                txtNew.runAction(cc.sequence(
                    cc.scaleTo(0.5, 1, 1),
                    cc.callFunc(function(){
                        this.setAnchorPoint(0.5, 0.5);
                        this.setPositionY(this.getPositionY() - this.getContentSize().height/2);
                    }.bind(txtNew))
                ));
                txtOld.setScaleY(1);
                txtOld.runAction(cc.sequence(
                    cc.scaleTo(0.5, 1, 0),
                    cc.removeSelf()
                ));
            };
            var time = convert(itemRef.remainTime);
            if (time){
                this.pPreview.pTimeShort.setVisible(true);
                for (var i = 0; i < 2; i++){
                    var bgTime = this.pPreview.pTimeShort.getChildByName("bgTime" + i);
                    bgTime.removeAllChildren();
                    var timeInfo = time[i];
                    var temp, text;
                    temp = Math.floor(timeInfo.value / 10);
                    text = new ccui.Text("" + temp, "fonts/tahomabd.ttf", 16);
                    text.setColor(cc.color("#6d80d4"));
                    text.setPosition(8, bgTime.getContentSize().height/2);
                    bgTime.addChild(text, 0, 0);
                    temp = timeInfo.value - temp * 10;
                    text = new ccui.Text("" + temp, "fonts/tahomabd.ttf", 16);
                    text.setColor(cc.color("#6d80d4"));
                    text.setPosition(18, bgTime.getContentSize().height/2);
                    bgTime.addChild(text, 0, 1);
                    this.pPreview.pTimeShort.getChildByName("txt" + i).setString(timeInfo.unit + (i == 0 ? ":" : ""));
                }
                this.pPreview.pTime.schedule(function(itemRef){
                    var time = convert(itemRef.remainTime);
                    for (var i = 0; i < 2; i++){
                        var bgTime = this.pPreview.pTimeShort.getChildByName("bgTime" + i);
                        var timeInfo = time[i];
                        var temp, text;
                        temp = Math.floor(timeInfo.value / 10);
                        if (temp != bgTime.getChildByTag(0).getString()){
                            text = new ccui.Text(bgTime.getChildByTag(0).getString(), "fonts/tahomabd.ttf", 16);
                            bgTime.getChildByTag(0).setString("" + temp);
                            effect(text, bgTime.getChildByTag(0));
                        }
                        temp = timeInfo.value - temp * 10;
                        if (temp != bgTime.getChildByTag(1).getString()){
                            text = new ccui.Text(bgTime.getChildByTag(1).getString(), "fonts/tahomabd.ttf", 16);
                            bgTime.getChildByTag(1).setString("" + temp);
                            effect(text, bgTime.getChildByTag(1));
                        }
                        this.pPreview.pTimeShort.getChildByName("txt" + i).setString(timeInfo.unit + (i == 0 ? ":" : ""));
                    }
                }.bind(this, itemRef), 1)
            }
            else{
                this.pPreview.pTimeLong.setVisible(true);
                var day = Math.ceil(itemRef.remainTime / (1000 * 60 * 60 * 24));
                this.pPreview.pTimeLong.getChildByName("txtTime").setString((day < 10) ? ("0" + day) : day);
            }
        }
    },

    setPreviewCondition: function(conditions) {
        var condition = conditions[0];
        var condStr = "";
        switch(condition.type){
            case StorageManager.VIP_CONDITION:
                condStr += "Vip ";
                break;
            case StorageManager.LEVEL_CONDITION:
                condStr += "Level ";
                break;
        }
        condStr += condition.num;

        this.pPreview.condition.setString(condStr);
        var w = this.pPreview.condition.x + this.pPreview.condition.getAutoRenderSize().width;
        var d = w/2 - this.pPreview.iconCondition.width/2;
        this.pPreview.iconCondition.setPositionX(this.pPreview.btnBuy.width/2 - d);
    },

    setPreviewDesInfo: function(expireTime, price) {
        if (expireTime >= 0) {
            this.pPreview.exprireTime.setString(expireTime + "ngày");
            this.pPreview.exprireTime.setPosition(this.pPreview.exprireTime.defaultPosition);
            this.pPreview.pDes.getChildByName("textDown").setVisible(true);
        }
        else {
            this.pPreview.exprireTime.setString("Vĩnh viễn");
            this.pPreview.exprireTime.setPositionY(this.pPreview.exprireTime.defaultPosition.y/2 + this.pPreview.pDes.getChildByName("textDown").getPositionY()/2);
            this.pPreview.pDes.getChildByName("textDown").setVisible(false);
        }
        this.setPreviewDiamond(price);
    },

    setPreviewNumInfo: function(selectedNum, options) {
        if (options){
            this.previewItemData.options = options;
            this.previewItemData.maxNum = Math.floor(gamedata.userData.diamond / this.previewItemData.options[0].price);
        }

        if (selectedNum < 1) selectedNum = 1;
        if (selectedNum > this.previewItemData.maxNum) selectedNum = this.previewItemData.maxNum;
        this.previewItemData.selectedNum = Math.max(1, selectedNum);
        this.pPreview.selectedNum.setString(StringUtility.standartNumber(this.previewItemData.selectedNum) + "/" + StringUtility.standartNumber(this.previewItemData.maxNum));
        var w = this.pPreview.selectedNum.x + this.pPreview.selectedNum.getAutoRenderSize().width;
        this.pPreview.labelNum.setPositionX(this.pPreview.pNum.width/2 - w/2);
        this.setPreviewDiamond(this.previewItemData.options[0].price * this.previewItemData.selectedNum);

        this.pPreview.btnSub.setEnabled(this.previewItemData.maxNum > 0 && this.previewItemData.selectedNum > 1);
        this.pPreview.btnAdd.setEnabled(this.previewItemData.maxNum > 0 && this.previewItemData.selectedNum < this.previewItemData.maxNum);
        this.pPreview.btnSlide.setVisible(this.previewItemData.maxNum > 1);
        this.pPreview.numProgress.setTouchEnabled(this.previewItemData.maxNum > 1);
        if (this.previewItemData.maxNum == 0)
            this.pPreview.numProgress.setPercent(100);
        else{
            var ratio = this.previewItemData.selectedNum / this.previewItemData.maxNum;
            this.pPreview.numProgress.setPercent(100 * ratio);
            this.pPreview.btnSlide.setPositionX(this.pPreview.numProgress.width * ratio);
        }

        this.shopItemData[this.selectedTab][this.previewItemData.index].selectedNum = this.previewItemData.selectedNum;
        this.pItem.updateCellAtIndex(Math.floor(this.previewItemData.index/this.numCol));
    },

    setPreviewOptionInfo: function(selectedOption, options) {
        this.previewItemData.selectedOption = selectedOption;
        if (options){
            this.previewItemData.options = options;
            var numOptions = this.previewItemData.options.length;
            var numCols = numOptions == 1 ? 1 : 2;
            var numRows = Math.ceil(numOptions / numCols);
            for (var i = 0; i < this.pPreview.optionNodes.length; i++){
                var optionNode = this.pPreview.optionNodes[i];
                if (i < numOptions){
                    optionNode.setVisible(true);
                    optionNode.setEnabled(true);
                    optionNode.setPositionY(this.pPreview.pOption.height * (1 -  (Math.floor(i/numCols) + 0.5) / numRows));
                    optionNode.text.setString(this.previewItemData.options[i].expireTime + " ngày");
                    if (numCols == 2)
                        optionNode.setPositionX(optionNode.defaultPos.x);
                    else{
                        var w = optionNode.text.x + optionNode.text.getAutoRenderSize().width;
                        optionNode.setPositionX(this.pPreview.pOption.width/2 - w/2);
                    }
                }
                else {
                    optionNode.setVisible(false);
                    optionNode.setEnabled(false);
                }
            }
        }

        if (this.previewItemData.selectedOption < 0 || this.previewItemData.selectedOption >= this.previewItemData.options.length)
            this.selectedOption = 0;
        for (var i = 0; i < this.pPreview.optionNodes.length; i++){
            var optionNode = this.pPreview.optionNodes[i];
            if (optionNode.isVisible()){
                var selected = i == this.previewItemData.selectedOption;
                if (selected != optionNode.box.isSelected())
                    optionNode.box.setSelected(selected);
            }
        }
        this.setPreviewDiamond(this.previewItemData.options[this.previewItemData.selectedOption].price);

        this.shopItemData[this.selectedTab][this.previewItemData.index].selectedOption = this.previewItemData.selectedOption;
        this.pItem.updateCellAtIndex(Math.floor(this.previewItemData.index/this.numCol));
    },

    setPreviewDiamond: function(diamond) {
        this.pPreview.diamond.setString(StringUtility.standartNumber(diamond));
        var w = this.pPreview.diamond.x + this.pPreview.diamond.getAutoRenderSize().width;
        var d = w/2 - this.pPreview.iconDiamond.width/2;
        this.pPreview.iconDiamond.setPositionX(this.pPreview.btnBuy.width/2 - d);

        this.setPreviewBtnBuyEnabled(diamond <= gamedata.userData.diamond);
    },

    setPreviewBtnBuyEnabled: function(enabled) {
        this.pPreview.btnBuy.setEnabled(enabled);
        this.pPreview.iconCondition.getVirtualRenderer().setState(enabled ? 0 : 1);
        this.pPreview.iconDiamond.getVirtualRenderer().setState(enabled ? 0 : 1);
        this.pPreview.condition.enableOutline(enabled ? cc.color("#FF9700") : cc.color("#949494"), 1);
        this.pPreview.diamond.enableOutline(enabled ? cc.color("#FF9700") : cc.color("#949494"), 1);
    },

    onAddPreviewItemNum: function(button, type) {
        switch(type){
            case ccui.Widget.TOUCH_BEGAN:
                this.waitForAddRoutine = true;
                this.addAmount = 1;
                this.addTimer = 0;
                this.schedule(this.addRoutine, 0.05, cc.REPEAT_FOREVER, 0.5);
                break;
            case ccui.Widget.TOUCH_MOVED:
                break;
            case ccui.Widget.TOUCH_ENDED:
                this.setPreviewNumInfo(this.previewItemData.selectedNum + 1);
            case ccui.Widget.TOUCH_CANCELED:
                this.waitForAddRoutine = false;
                this.unschedule(this.addRoutine);
                break;
        }
    },

    addRoutine: function(dt) {
        if (this.waitForAddRoutine){
            this.addTimer += dt;
            if (this.addTimer >= 1) {
                this.addTimer -= 1;
                this.addAmount *= 2;
            }
            this.setPreviewNumInfo(this.previewItemData.selectedNum + this.addAmount);
        }
    },

    onSubPreviewItemNum: function(button, type) {
        switch(type){
            case ccui.Widget.TOUCH_BEGAN:
                this.waitForSubRoutine = true;
                this.subAmount = 1;
                this.subTimer = 0;
                this.schedule(this.subRoutine, 0.05, cc.REPEAT_FOREVER, 0.5);
                break;
            case ccui.Widget.TOUCH_MOVED:
                break;
            case ccui.Widget.TOUCH_ENDED:
                this.setPreviewNumInfo(this.previewItemData.selectedNum - 1);
            case ccui.Widget.TOUCH_CANCELED:
                this.waitForSubRoutine = false;
                this.unschedule(this.subRoutine);
                break;
        }
    },

    subRoutine: function(dt) {
        if (this.waitForSubRoutine){
            this.subTimer += dt;
            if (this.subTimer >= 1) {
                this.subTimer -= 1;
                this.subAmount *= 2;
            }
            this.setPreviewNumInfo(this.previewItemData.selectedNum - this.subAmount);
        }
    },

    onSlidePreviewItem: function(button, type) {
        switch(type){
            case ccui.Widget.TOUCH_BEGAN:
                button.startX = button.getPositionX();
                break;
            case ccui.Widget.TOUCH_MOVED:
                button.curX = button.startX + button.getTouchMovePosition().x - button.getTouchBeganPosition().x;
                var unitX = this.pPreview.numProgress.width / this.previewItemData.maxNum;
                if (button.curX < unitX) button.curX = unitX;
                if (button.curX > this.pPreview.numProgress.width) button.curX = this.pPreview.numProgress.width;
                this.setPreviewNumInfo(Math.floor((button.curX + unitX/2) / unitX));
                break;
        }
    },

    onBuyItem: function(button, type) {
        if (type == ccui.Widget.TOUCH_ENDED){
            if (!StorageManager.getInstance().canBuyItem(this.previewItemData.type, this.previewItemData.id)) return;
            var price = this.previewItemData.options[this.previewItemData.selectedOption].price * this.previewItemData.selectedNum;
            sceneMgr.showOkCancelDialog("Bạn có chắc chắn muốn sử dụng\n" + StringUtility.standartNumber(price) + " kim cương để mua vật phẩm?", this, function(type, subType, id, num, returnCode){
                if (returnCode == Dialog.BTN_OK){
                    StorageManager.getInstance().sendBuyItem(type, subType, id, num);
                }
            }.bind(this, this.previewItemData.type, this.previewItemData.options[this.previewItemData.selectedOption].subType, this.previewItemData.id, this.previewItemData.selectedNum));
        }
    },

    onShowPreviewItemInfo: function(button, type) {
        if (type == ccui.Widget.TOUCH_ENDED){
            this.tooltip.text.setString(this.previewItemData.description);
            var margin = this.pPreview.width - this.pPreview.btnInfo.x - this.pPreview.btnInfo.width/2;
            var maxWidth = this.pPreview.width - 2 * margin;
            StringUtility.breakLabelToMultiLine(this.tooltip.text, maxWidth);
            var textSize = this.tooltip.text.getAutoRenderSize();
            // this.tooltip.bg.setContentSize(cc.size(textSize.width + 2 * TabItemPayment.TOOLTIP_PADDING, textSize.height + 2 * TabItemPayment.TOOLTIP_PADDING));
            this.tooltip.bg.setContentSize(cc.size(maxWidth, textSize.height + 2 * TabItemPayment.TOOLTIP_PADDING));
            this.tooltip.panel.setContentSize(textSize);

            var startX = this.pPreview.convertToNodeSpace(cc.p(cc.winSize.width, 0)).x;
            var endX = this.pPreview.width - margin - this.tooltip.bg.width/2;
            var y = this.pPreview.btnInfo.y - (this.pPreview.btnInfo.height + this.tooltip.bg.height)/2 - 5;
            this.tooltip.text.setPositionY(textSize.height);
            this.tooltip.setPosition(startX, y);
            this.tooltip.setVisible(true);
            this.tooltip.setOpacity(0);
            this.tooltip.stopAllActions();
            this.tooltip.runAction(cc.sequence(
                cc.spawn(
                    cc.moveTo(0.3, endX, y).easing(cc.easeSineOut()),
                    cc.sequence(cc.fadeIn(0.3))
                ),
                cc.delayTime(1.8),
                cc.spawn(
                    cc.moveTo(0.3, startX, y).easing(cc.easeSineIn()),
                    cc.sequence(cc.fadeOut(0.3))
                ),
                cc.hide()
            ));
            this.tooltip.text.stopAllActions();
            this.tooltip.text.runAction(cc.sequence(
                cc.delayTime(0.4),
                cc.moveBy(0.2, 0, -textSize.height).easing(cc.easeExponentialOut()),
                cc.delayTime(1.2),
                cc.moveBy(0.2, 0, textSize.height).easing(cc.easeExponentialIn()),
                cc.delayTime(0.4)
            ));
        }
    },

    onTouchProgressPreviewItem: function(progress, type){
        switch(type){
            case ccui.Widget.TOUCH_ENDED:
                if (this.previewItemData && this.previewItemData.maxNum) {
                    var pos = progress.convertToNodeSpace(progress.getTouchEndPosition());
                    var unitX = this.pPreview.numProgress.width / this.previewItemData.maxNum;
                    if (pos.x < unitX) pos.x = unitX;
                    if (pos.x > this.pPreview.numProgress.width) pos.x = this.pPreview.numProgress.width;
                    this.setPreviewNumInfo(Math.floor((pos.x + unitX / 2) / unitX));
                    break;
                }
        }
    }
    /* endregion Panel Preview */
});

TabItemPayment.BTN_TAB_AVATAR = 0;
TabItemPayment.BTN_TAB_INTERACTION = 1;
TabItemPayment.BTN_TAB_EMOTICON = 2;
TabItemPayment.BTN_TAB_VOUCHER = 3;
TabItemPayment.TOOLTIP_PADDING = 10;

var ShopIapScene = BaseLayer.extend({

    ctor: function () {
        this.tabGold = null;
        this.tabG = null;
        this.tabTicket = null;
        this.tabItem = null;
        this.currentTab = null;
        this._super("ShopIapScene");
        this.initWithBinaryFile("ShopIapGUI.json");
    },

    initGUI: function () {
        //main parts
        var bBot = this.getControl("bgBot");
        var bTop = this.getControl("bgTop");
        var bSub = this.getControl("bgSub");
        var bButton = this.getControl("bgButton");
        var bSubPanel = this.getControl("bgSubPanel");
        var pButton = this.getControl("pButton");
        this.panelMaintain = this.getControl("panelMaintain");
        this.panelMaintain.setVisible(false);

        //init transformation for main parts
        var bSubSize = cc.director.getWinSize().height - bTop.getContentSize().height * this._scale - bBot.getContentSize().height * this._scale;   //height of mid panel
        bSub.setScaleY(bSubSize / bSub.getContentSize().height);    //set mid panel scale Y
        bButton.setScaleY(bSubSize / bSub.getContentSize().height); //set side button background scale Y

        if (!cc.sys.isNative) {
            this.getControl("bg").setLocalZOrder(-2);
            bButton.setLocalZOrder(-1);
            bButton.setScaleY(cc.winSize.height / bButton.getContentSize().height);
        }

        bSub.setPositionY(bTop.getPositionY() - bTop.getContentSize().height * this._scale - bSubSize / 2);
        bButton.setPositionY(bSub.getPositionY());

        bSubPanel.setPositionY(bBot.getPositionY() + bBot.getContentSize().height * this._scale);
        bSubPanel.setLocalZOrder(999);
        bSubPanel.setScaleX((cc.director.getWinSize().width - bButton.getContentSize().width * this._scale) / bSubPanel.getContentSize().width);
        bSubPanel.setScaleY(this._scale);
        pButton.setPositionY(bTop.getPositionY() - bTop.getContentSize().height * this._scale);

        //top buttons
        this.btnGold = this.customButton("btnGold", ShopIapScene.BTN_GOLD, bTop);
        this.btnGold.setPressedActionEnabled(false);
        this.btnG = this.customButton("btnG", ShopIapScene.BTN_G, bTop);
        this.btnG.setPressedActionEnabled(false);
        this.btnTicket = this.customButton("btnTicket", ShopIapScene.BTN_TICKET, bTop);
        this.btnTicket.setPressedActionEnabled(false);
        this.btnItem = this.customButton("btnItem", ShopIapScene.BTN_ITEM, bTop);
        this.btnItem.setPressedActionEnabled(false);
        this.btnGold.pos = this.btnGold.getPosition();
        this.btnG.pos = this.btnG.getPosition();
        this.btnTicket.iconX2 = new cc.Sprite("LobbyGUI/iconX2.png");
        this.btnTicket.addChild(this.btnTicket.iconX2);
        this.btnTicket.iconX2.setScale(0.6);
        this.btnTicket.iconX2.setPosition(110, 40);
        this.customButton("btnClose", ShopIapScene.BTN_CLOSE);
        this.customButton("btnHelp", ShopIapScene.BTN_HELP);
        this.title = this.getControl("title", bTop);
        if (this._scale < 1){
            this.title.setScaleX(this.title.getScaleX() * this._scale);
            this.title.setPositionX(this.title.x * this._scale);
            this.btnTicket.setScaleX(this._scale);
            this.btnTicket.setPositionX(cc.winSize.width - (cc.winSize.width - this.btnTicket.x)*this._scale);
            this.btnItem.setScaleX(this._scale);
            this.btnItem.setPositionX(cc.winSize.width - (cc.winSize.width - this.btnItem.x)*this._scale);
            this.btnGold.setScaleX(this._scale);
            this.btnGold.setPositionX(cc.winSize.width - (cc.winSize.width - this.btnGold.x)*this._scale);
            this.btnG.setScaleX(this._scale);
            this.btnG.setPositionX(cc.winSize.width - (cc.winSize.width - this.btnG.x)*this._scale);
        }

        //load event ticket item
        this.iconTicketButton = this.getControl("iconTicket", this.btnTicket);
        this.iconTicketButton.loadTexture(event.getTicketTexture(-1));

        //user info layer
        var pInfo = this.getControl("pInfo");
        this._uiName = this.getControl("name", pInfo);
        this.iconGold = this.getControl("iconGold", pInfo);
        this._uiBean = this.getControl("gold", pInfo);
        this._uiBean.gold = 0;
        this.iconCoin = this.getControl("iconCoin", pInfo);
        this._uiCoin = this.getControl("coin", pInfo);
        this._uiCoin.coin = 0;
        this._uiStar = this.getControl("star", pInfo);
        this.iconDiamond = this.getControl("iconDiamond", pInfo);
        this._uiDiamond = this.getControl("diamond", this.iconDiamond);
        this._uiDiamond.diamond = 0;
        try {
            this.iconTicket = this.getControl("iconTicket", pInfo);
            this._uiTicket = this.getControl("ticket", pInfo);
            this.iconTicket.setVisible(false);
        } catch (e) {

        }

        this.btnAvatar = this.customButton("btnAvatar", ShopIapScene.BTN_USERINFO, pInfo);
        this.btnAvatar.setPressedActionEnabled(false);
        var bgAvatar = this.getControl("bgAvatar", pInfo);
        this._uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        var size = bgAvatar.getContentSize();
        this._uiAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        bgAvatar.addChild(this._uiAvatar);

        this.defaultFrame = this.getControl("border", bgAvatar);
        this.defaultFrame.setLocalZOrder(1);
        this.avatarFrame = new UIAvatarFrame();
        this.avatarFrame.setPosition(cc.p(size.width / 2, size.height / 2));
        bgAvatar.addChild(this.avatarFrame, 2);
        this.avatarFrame.setScale(0.5);

        // init panel tab
        var pItem = this.getControl("pItem");
        pItem.setPositionY(bBot.getPositionY() + bBot.getContentSize().height * this._scale);
        pItem.setPositionX(bButton.getPositionX() + bButton.getContentSize().width * this._scale);
        var item;
        try {
            item = this.getControl("item", pItem);
        } catch (e) {
            item = pItem.getChildByName("item");
        }
        if (!item) {
            item = pItem.getChildByName("item");
        }
        var panelSize = cc.size(cc.director.getWinSize().width - bButton.getContentSize().width * this._scale, bSubSize);
        var deltaItemX = panelSize.width / 2 - item.getContentSize().width * this._scale / 2;
        var itemSize = cc.size(item.getContentSize().width * this._scale, item.getContentSize().height * this._scale * 1.05);
        var positionPanel = cc.p(pItem.getPosition().x + deltaItemX, pItem.getPositionY());
        var listButtonY = this.btnAvatar.convertToWorldSpace(cc.p(0, this.btnAvatar.height)).y;
        var heightListButton = pButton.getPositionY() - listButtonY;
        var sizeListButton = cc.size(pButton.getContentSize().width, heightListButton);
        var posListButton = cc.p(pButton.getPositionX() * this._scale, listButtonY);
        var panelCardPos = cc.p(pItem.getPositionX() + panelSize.width / 2, pItem.getPositionY() + pItem.getContentSize().height / 2);

        cc.log("INIT GUI NE ");
        this.tabGold = new TabGoldPayment(panelSize, itemSize, positionPanel, sizeListButton, posListButton, this._scale);
        this._layout.addChild(this.tabGold);
        this.tabG = new TabGPayment(panelSize, itemSize, positionPanel, sizeListButton, posListButton, panelCardPos, this._scale);
        this._layout.addChild(this.tabG);
        this.tabTicket = new TabTicketPayment(panelSize, itemSize, positionPanel, sizeListButton, posListButton, this._scale);
        this._layout.addChild(this.tabTicket);
        this.tabItem = new TabItemPayment(panelSize, pItem.getPosition(), sizeListButton, posListButton, this._scale);
        this._layout.addChild(this.tabItem);

        // config common
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        cc.log(" ******* ON ENTER FINISH SHOP IAP SCENE ******* ");
        this.updateToCurrentData();
        cc.log("Payment: " + gamedata.payments.join());
        this.getControl("btnHelp").setVisible(!gamedata.checkInReview());

        // request shop event
        var cmdEvent = new CmdSendRequestEventShop();
        GameClient.getInstance().sendPacket(cmdEvent);

        var cmdConfig = new CmdSendGetConfigShop();
        cmdConfig.putData(CmdSendGetConfigShop.GOLD, gamedata.gameConfig.versionShopGold);
        GameClient.getInstance().sendPacket(cmdConfig);
        event.requestShopEventConfig();
        this.effectVipInfo();
        this.scheduleUpdate();

        this.reLayoutTab();
        cc.log("RELOAT LAYOUT TAB *******  1 ");
        this.tabGold.onEnterFinish();
        cc.log("RELOAT LAYOUT TAB *******  2 ");
        this.tabG.onEnterFinish();
        cc.log("RELOAT LAYOUT TAB *******  3 ");
        this.tabTicket.onEnterFinish();
        cc.log("RELOAT LAYOUT TAB *******  4 ");
        this.tabItem.onEnterFinish();
        cc.log("RELOAT LAYOUT TAB *******  5 ");
        this.updateEventInfo();
        cc.log("RELOAT LAYOUT TAB *******  ");
        if (event.isInEvent(Event.EGG_BREAKER))
            eggBreaker.showNotifyShopGUI();
    },

    onExit: function () {
        this._super();
    },

    reLayoutTab: function () {
        var arrayConfigTicket = event.getArrayConfigTicket();
        cc.log("ARRAY CONFIG TICKET " + arrayConfigTicket.length);
        if (arrayConfigTicket.length > 0) {
            this.btnTicket.setVisible(true);
        } else {
            this.btnTicket.setVisible(false);
        }
    },

    showMaintain: function (show) {
        this.panelMaintain.setVisible(show);
    },

    onUpdateGUI: function () {
        this.updateUserInfo();
        cc.log(" onUpdateGUI SHOPIAPSCENE");
        shopData.initShopData();
        if (!event.isHaveShopTicket()) {
            this.iconTicket.loadTexture("ShopIAP/iconCommingSoon.png");
            if (this.currentIdTab == ShopIapScene.BTN_TICKET) {
                this.selectTabShop(ShopIapScene.BTN_GOLD);
            } else {
                this.currentTab.reloadTab();
            }
            if (!cc.sys.isNative) {
                this.btnTicket.setVisible(false);
                this.btnG.setPosition(this.btnTicket.defaultPos);
                this.btnGold.setPosition(this.btnG.defaultPos);
            }
        } else {
            this.currentTab.reloadTab();
        }
    },

    updateUserInfo: function () {

        if (this._uiAvatar && this._uiName) {
            this._uiAvatar.asyncExecuteWithUrl(GameData.getInstance().userData.zName, GameData.getInstance().userData.avatar);
            this.setLabelText(GameData.getInstance().userData.displayName, this._uiName);
        }
        if (this.avatarFrame){
            this.avatarFrame.reload();
            this.defaultFrame.setVisible(!this.avatarFrame.isShow());
        }
        // check xem so tien hien tai trong Shop ma nho hon User Data thi cap nhat luon
        if (this._uiBean.gold > gamedata.getUserGold()) {
            this.updateGold(gamedata.getUserGold());
        }
        if (this._uiDiamond.diamond > gamedata.getUserDiamond()) {
            this.updateDiamond(gamedata.getUserDiamond());
        }
        if (this._uiCoin.g > gamedata.getUserCoin()) {
            this.updateG(gamedata.getUserCoin());
        }
    },

    updateToCurrentData: function () {
        cc.log("updateToCurrentData *** 1 ");
        this.onUpdateGUI();
        cc.log("updateToCurrentData *** 2 " + gamedata.getUserGold());
        this.updateGold(gamedata.getUserGold());
        this.updateG(gamedata.getUserCoin());
        this.updateDiamond(gamedata.getUserDiamond());
    },

    getGold: function () {
        return this._uiBean.gold;
    },

    getDiamond: function () {
        return this._uiDiamond.diamond;
    },

    getG: function () {
        return this._uiCoin.g;
    },

    updateGold: function (gold) {
        this._uiBean.gold = gold;
        if (this._uiBean) this._uiBean.setString(StringUtility.standartNumber(this._uiBean.gold));
    },

    updateDiamond: function (diamond) {
        this._uiDiamond.diamond = diamond;
        if (this._uiDiamond) this._uiDiamond.setString(StringUtility.standartNumber(this._uiDiamond.diamond));
    },

    updateG: function (g) {
        this._uiCoin.g = g;
        if (this._uiCoin) this._uiCoin.setString(StringUtility.standartNumber(this._uiCoin.g));
    },

    updateEventInfo: function () {
        //return;
        cc.log("UPDATE EVENT INFO **** ");
        if (event.isInMainEvent()) {
            this.iconTicketButton.loadTexture(event.getTicketTexture());
            if (event.promoTicket > 0) {
                this.btnTicket.iconX2.setVisible(true);
            } else {
                this.btnTicket.iconX2.setVisible(false);
            }
        } else {
            this.iconTicketButton.loadTexture("ShopIAP/ionCommingSoon.png");
        }
        if (this.currentIdTab == ShopIapScene.BTN_TICKET) {
            if (this.iconTicket) {
                this.iconTicket.setVisible(false);
                if (event.isInMainEvent()) {
                    this.iconTicket.setVisible(true);
                    this.iconTicket.loadTexture(event.getTicketTexture());
                    cc.log("is in main event " + event.getNumberTicket());
                    this._uiTicket.setString(StringUtility.pointNumber(event.getNumberTicket()));
                } else {

                }
            }
            this.iconCoin.setVisible(false);
            this.iconGold.setVisible(false);
        } else {
            this.iconTicket.setVisible(false);
            this.iconCoin.setVisible(true);
            this.iconGold.setVisible(true);
        }
    },

    effectVipInfo: function () {
        cc.log("CHUI VAO DAY *** ");
        NewVipManager.effectVipShopInfo(this, true);
    },

    selectTabShop: function (idTab) {
        cc.log("ID TAB " + idTab + "IN EVENT " + event.isInMainEvent());
        if (idTab == ShopIapScene.BTN_TICKET) {
            if (!event.isInMainEvent()) {
                Toast.makeToast(Toast.SHORT, localized("GACHA_EVENT_TIMEOUT"));
                return;
            }
            this.updateEventInfo();
        }
        this.tabG.setVisible(false);
        this.tabGold.setVisible(false);
        this.tabTicket.setVisible(false);
        this.tabItem.setVisible(false)
        var resourceGold = (idTab == ShopIapScene.BTN_GOLD ? "ShopIAP/btnTabGoldActive.png" : "ShopIAP/btnTabGoldInactive.png");
        var resourceG = (idTab == ShopIapScene.BTN_G ? "ShopIAP/btnTabGActive.png" : "ShopIAP/btnTabGInactive.png");
        var resourceTicket = (idTab == ShopIapScene.BTN_TICKET ? "ShopIAP/btnTabEventActive.png" : "ShopIAP/btnTabEventInactive.png");
        var resourceItem = (idTab == ShopIapScene.BTN_ITEM) ? "ShopIAP/btnTabItemActive.png" : "ShopIAP/btnTabItemInactive.png";
        this.iconTicketButton.setOpacity(idTab == ShopIapScene.BTN_TICKET ? 255 : 100);
        this.btnGold.loadTextures(resourceGold, resourceGold, resourceGold);
        this.btnG.loadTextures(resourceG, resourceG, resourceG);
        this.btnTicket.loadTextures(resourceTicket, resourceTicket, resourceTicket);
        this.btnItem.loadTextures(resourceItem, resourceItem, resourceItem);
        this.currentIdTab = idTab;
        if (this.currentIdTab == ShopIapScene.BTN_TICKET) {
            this.iconTicket.setVisible(true);
            this.iconCoin.setVisible(false);
            this.iconGold.setVisible(false);
            this.iconDiamond.setVisible(false);
        } else {
            this.iconTicket.setVisible(false);
            this.iconCoin.setVisible(true);
            this.iconGold.setVisible(true);
            this.iconDiamond.setVisible(true);
        }
        switch (idTab) {
            case ShopIapScene.BTN_GOLD:
                this.currentTab = this.tabGold;
                break;
            case ShopIapScene.BTN_G:
                this.currentTab = this.tabG;
                break;
            case ShopIapScene.BTN_TICKET:
                this.currentTab = this.tabTicket;
                this.updateEventInfo();
                break;
            case ShopIapScene.BTN_ITEM:
                this.currentTab = this.tabItem;
                break;
        }
        this.currentTab.setVisible(true);
        this.currentTab.reloadTab();
    },

    selectTabPaymentInGold: function (idPayment) {
        if (idPayment >= 0)
            this.tabGold.selectTab(idPayment);
        this.selectTabShop(ShopIapScene.BTN_GOLD);
    },

    selectTabPaymentInG: function (idPayment) {
        if (idPayment > 0)
            this.tabG.selectTab(idPayment);
        this.selectTabShop(ShopIapScene.BTN_G);
    },

    selectTabPaymentInTicket: function (idPayment) {
        if (idPayment > 0)
            this.tabTicket.selectTab(idPayment);
        this.selectTabShop(ShopIapScene.BTN_TICKET);
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case ShopIapScene.BTN_CLOSE: {
                this.onBack();
                break;
            }
            case ShopIapScene.BTN_HELP: {
                sceneMgr.openGUI(VipHelpScene.className, VipHelpScene.GUI_TAG, VipHelpScene.GUI_TAG);
                break;
            }
            case ShopIapScene.BTN_VIP: {
                NewVipManager.openVip(ShopIapScene.className);
                break;
            }
            case ShopIapScene.BTN_USERINFO: {
                sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO).setInfo(gamedata.userData);
                break;
            }
            case ShopIapScene.BTN_GOLD:
            case ShopIapScene.BTN_G:
            case ShopIapScene.BTN_TICKET: {
                this.selectTabShop(id);
                break;
            }
            case ShopIapScene.BTN_ITEM: {
                if (StorageManager.getInstance().checkEnableItem()) {
                    this.selectTabShop(id);
                }
                break;
            }
        }
    },

    effectGold: function () {
        var pStart = cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
        var pEnd = cc.p(0, 0);
        var curScene = sceneMgr.getMainLayer();
        var lbGold = null;
        var isGUI;
        if (curScene instanceof LobbyScene || curScene instanceof ChooseRoomScene || curScene instanceof ShopIapScene) {
            pEnd = SceneMgr.convertPosToParent(sceneMgr.layerGUI, curScene._uiBean);
            isGUI = true;
            lbGold = curScene._uiBean;
        }

        if (isGUI && this.saveGold) {
            effectMgr.flyCoinEffect(sceneMgr.layerGUI, this.saveGold, 100000, pStart, pEnd);
            if (lbGold)
                effectMgr.runLabelPoint(lbGold, (gamedata.userData.bean - this.saveGold), gamedata.userData.bean, 1.5);
        }
    },

    getPositionComponent: function (type) {
        switch (type) {
            case ShopSuccessData.TYPE_GOLD:
                return this.iconGold.convertToWorldSpace(cc.p(this.iconGold.getContentSize().width * 0.5, this.iconGold.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_VPOINT:
                return this.txtRemainVipTime.convertToWorldSpace(cc.p(this.txtRemainVipTime.getContentSize().width * 0.5, this.txtRemainVipTime.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_HOUR_VIP:
                return this.txtProgress.convertToWorldSpace(cc.p(this.txtProgress.getContentSize().width * 0.5, this.txtProgress.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_G:
                return this.iconCoin.convertToWorldSpace(cc.p(this.iconCoin.getContentSize().width * 0.5, this.iconCoin.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_ITEM:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_TICKET:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_DIAMOND:
                return this.iconDiamond.convertToWorldSpace(cc.p(this.iconDiamond.getContentSize().width * 0.5, this.iconDiamond.getContentSize().height * 0.5));
                break;
        }
    },

    finishEffectShopSuccess: function () {

        NewVipManager.effectVipShopInfo(this, false);
        var gui = sceneMgr.getGUIByClassName(GUIShopGoldSuccess.className);
        if (gui.checkShowNextPurchase()) {
            var gui = sceneMgr.openGUI(GUIShopGoldSuccess.className, GUIShopGoldSuccess.TAG, GUIShopGoldSuccess.TAG);
            gui.showNextPurchase();
        }
        else {
            this.updateEventInfo();
            this.updateToCurrentData();
        }
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable()) return;

        sceneMgr.openScene(LobbyScene.className);
    },

    update: function (dt) {
        if (Config.ENABLE_NEW_VIP) {
            NewVipManager.getInstance().updateTimeVip(dt);
            var remainTime = NewVipManager.getInstance().getRemainTime();
            this.txtRemainVipTime.setString(NewVipManager.getRemainTimeString(remainTime));
        }
    },

    getPositionComponent: function (type) {
        switch (type) {
            case ShopSuccessData.TYPE_GOLD:
                return this.iconGold.convertToWorldSpace(cc.p(this.iconGold.getContentSize().width * 0.5, this.iconGold.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_VPOINT:
                return this.txtRemainVipTime.convertToWorldSpace(cc.p(this.txtRemainVipTime.getContentSize().width * 0.5, this.txtRemainVipTime.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_HOUR_VIP:
                return this.txtProgress.convertToWorldSpace(cc.p(this.txtProgress.getContentSize().width * 0.5, this.txtProgress.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_G:
                return this.iconCoin.convertToWorldSpace(cc.p(this.iconCoin.getContentSize().width * 0.5, this.iconCoin.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_ITEM:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_TICKET:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_DIAMOND:
                return this.iconDiamond.convertToWorldSpace(cc.p(this.iconDiamond.getContentSize().width * 0.5, this.iconDiamond.getContentSize().height * 0.5));
                break;
        }
    }
});
ShopIapScene.className = "ShopIapScene";

ShopIapScene.TYPE_GOLD = 1;
ShopIapScene.TYPE_G = 2;
ShopIapScene.TYPE_SMS = 3;

ShopIapScene.BTN_CLOSE = 1;
ShopIapScene.BTN_HELP = 2;
ShopIapScene.BTN_VIP = 3;
ShopIapScene.BTN_USERINFO = 4;
ShopIapScene.BTN_GOLD = 10;
ShopIapScene.BTN_G = 11;
ShopIapScene.BTN_TICKET = 12;
ShopIapScene.BTN_ITEM = 13;

ShopIapScene.TAB_GPLAY = 11;
ShopIapScene.TAB_NAPG = 12;
ShopIapScene.TAB_SMS = 13;

var ItemIapCell = cc.TableViewCell.extend({

    ctor: function (p) {
        this._super();

        this.tParent = p;
        this._layout = ccs.load("ShopIapItem.json").node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);

        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.btn = ccui.Helper.seekWidgetByName(this._layout, "btn");
        this.cost = ccui.Helper.seekWidgetByName(this.btn, "vnd");
        this.currency = ccui.Helper.seekWidgetByName(this.btn, "lb");
        this.uptoLevelVip = ccui.Helper.seekWidgetByName(this._layout, "uptoLevelVip");
        this.uptoLevelVip.ignoreContentAdaptWithSize(true);
        this.iconUp = ccui.Helper.seekWidgetByName(this._layout, "iconUp");
        this.iconUp.defaultPos = this.iconUp.getPosition();
        var btn = ccui.Helper.seekWidgetByName(this.uptoLevelVip, "btnTooltip");
        btn.addTouchEventListener(this.onTouchEventHandler, this);

        this.goldOld = this.cloneLabel(ccui.Helper.seekWidgetByName(this._layout, "gold_old"));
        this.goldOld.setColor(cc.color(200, 200, 200));
        this.goldNew = this.cloneLabel(ccui.Helper.seekWidgetByName(this._layout, "gold_new"));
        this.line = ccui.Helper.seekWidgetByName(this._layout, "line");

        this.star = this.cloneLabel(ccui.Helper.seekWidgetByName(this._layout, "star"));
        this.star.ignoreContentAdaptWithSize(true);
        this.star.defaultPosition = this.star.getPosition();
        this.starOld = this.cloneLabel(ccui.Helper.seekWidgetByName(this._layout, "star_old"));
        this.starOld.ignoreContentAdaptWithSize(true);
        this.starOld.defaultPosition = this.starOld.getPosition();
        this.vPointLine = ccui.Helper.seekWidgetByName(this._layout, "vpoint_line");
        this.gStar = ccui.Helper.seekWidgetByName(this._layout, "iconStar");

        this.timeVip = this.cloneLabel(ccui.Helper.seekWidgetByName(this._layout, "timeVip"));
        this.timeVip.ignoreContentAdaptWithSize(true);
        this.iconTimeVip = ccui.Helper.seekWidgetByName(this._layout, "iconTimeVip");

        this.arrayLbGachaCoin = [];
        this.arrayIconGachaCoin = [];
        for (var i = 0; i < 2; i++) {
            this.arrayIconGachaCoin.push(ccui.Helper.seekWidgetByName(this._layout, "iconGacha_" + i));
            this.arrayLbGachaCoin.push(ccui.Helper.seekWidgetByName(this._layout, "lbGacha_" + i));
        }

        this.bgBonus = ccui.Helper.seekWidgetByName(this._layout, "bgBonus");
        this.bgBonus.text = ccui.Helper.seekWidgetByName(this.bgBonus, "text");
        this.bgBonus.bonus = ccui.Helper.seekWidgetByName(this.bgBonus, "bonus");

        this.bgBonusGold = ccui.Helper.seekWidgetByName(this._layout, "bgBonusGold");
        this.bgBonusGold.text = ccui.Helper.seekWidgetByName(this.bgBonusGold, "text");
        this.bgBonusGold.bonus = ccui.Helper.seekWidgetByName(this.bgBonusGold, "bonus");
        this.bgBonusGold.bonus.ignoreContentAdaptWithSize(true);

        this.bgBonusVip = ccui.Helper.seekWidgetByName(this._layout, "bgBonusVip");
        this.bgBonusVip.text = ccui.Helper.seekWidgetByName(this.bgBonusVip, "text");
        this.bgBonusVip.bonus = ccui.Helper.seekWidgetByName(this.bgBonusVip, "bonus");
        this.bgBonusVip.bonus.ignoreContentAdaptWithSize(true);

        this.bonusValue = ccui.Helper.seekWidgetByName(this._layout, "bonusValue");

        this.lastActionUpdate = 0;
    },

    /**
     * Info Key
     * - id : id of pack in-app-purchase google
     * - id_ios : id of pack in-app-purchase apple
     * - cost : gia tien
     * - goldNew : gold nhan dc
     * - goldOld : gold cu
     * - star : gStar nhan dc
     * - bonus : bonus nhan dc
     * @param inf
     */
    setInfo: function (inf) {
        //cc.log("IAPItemCell : " + JSON.stringify(inf));

        this.info = inf;
        this.lastActionUpdate = 0;
        this._layout.removeChildByTag(TOOLTIP_FLOAT_TAG);

        //image
        this.createImage();

        //pack cost
        if (!isNaN(inf.cost))
            this.cost.setString(StringUtility.pointNumber(inf.cost));
        else
            this.cost.setString(inf.cost);

        //level up vip
        this.uptoLevelVip.setVisible(false);
        this.iconUp.setVisible(false);
        if (inf.uptoLevelVip > 0) {
            var imgVip = NewVipManager.getIconVip(inf.uptoLevelVip);
            if (imgVip) {
                this.uptoLevelVip.loadTexture(imgVip);
                this.uptoLevelVip.setVisible(true);
                this.iconUp.setVisible(true);
                this.iconUp.stopAllActions();
                this.iconUp.setPosition(this.uptoLevelVip.getPositionX() + this.uptoLevelVip.getContentSize().width/2 - this.iconUp.width/2 - 2, this.uptoLevelVip.getPositionY() + this.uptoLevelVip.getContentSize().height/2 - this.iconUp.height/2 - 2);
                this.iconUp.runAction(cc.sequence(cc.moveBy(0.2, 0, 3), cc.moveBy(0.5, 0, -3)).repeatForever());
            }
        }

        //gold value
        if (inf.smsType == 1) {
            if (Config.ENABLE_EVENT_TET)
                this.goldNew.setString(StringUtility.pointNumber(inf.goldNew) + " " + localized("EVENT_TET_LABEL_SHOP"));
            else
                this.goldNew.setString(StringUtility.pointNumber(inf.goldNew));
        } else {
            this.goldNew.setString(StringUtility.pointNumber(inf.goldNew));
        }
        this.goldOld.setString(StringUtility.pointNumber(inf.goldOld));
        if (inf.goldColor)
            this.goldNew.setColor(inf.goldColor);
        else
            this.goldNew.setColor(cc.color(255, 171, 27, 0));
        this.goldOld.setVisible(inf.goldNew != inf.goldOld);
        this.line.setVisible(inf.goldNew != inf.goldOld);
        this.line.setPositionX(this.goldOld.getPositionX() + this.goldOld.getContentSize().width / 2);
        this.line.setScaleX(this.goldOld.getContentSize().width / this.line.getContentSize().width);

        //vip points
        this.star.setVisible(inf.vPoint > 0);
        this.gStar.setVisible(inf.vPoint > 0);
        this.star.setString("+" + StringUtility.pointNumber(inf.vPoint));
        this.starOld.setVisible(inf.vPointOld != null);
        this.vPointLine.setVisible(inf.vPointOld != null);
        if (inf.vPointOld != null){
            this.starOld.setString("+" + StringUtility.pointNumber(inf.vPointOld));
            this.vPointLine.setScaleX(this.starOld.getContentSize().width / this.vPointLine.getContentSize().width);
            this.vPointLine.setPositionX(this.starOld.getPositionX() - this.starOld.getContentSize().width/2);
        }
        this.gStar.setPositionX(this.star.getPositionX() + this.star.getContentSize().width + 5);

        //time vip
        var levelVip = NewVipManager.getInstance().getRealVipLevel();
        inf.hourBonus = inf.hourBonus || 0;
        this.timeVip.setVisible(inf.vPoint > 0 && inf.hourBonus > 0 && levelVip > 0);
        this.timeVip.setString(StringUtility.replaceAll(localized("VIP_SHOP_HOUR_BONUS"), "@number", inf.hourBonus));
        this.iconTimeVip.setVisible(inf.vPoint > 0 && inf.hourBonus > 0 && levelVip > 0);
        this.iconTimeVip.setPositionX(this.timeVip.getPositionX() + this.timeVip.getContentSize().width + 4);

        //event item bonus
        event.updateItemInShop(this.arrayLbGachaCoin, this.arrayIconGachaCoin, this.bonusValue, inf);

        //bonus
        this.bgBonusGold.setVisible(false);
        this.bgBonusVip.setVisible(false);
        if (inf.curVoucher != null){
            var bgBonus = null;
            if (inf.curVoucher.bonusType == StorageManager.BONUS_GOLD)
                bgBonus = this.bgBonusGold;
            if (inf.curVoucher.bonusType == StorageManager.BONUS_VPOINT)
                bgBonus = this.bgBonusVip;
            bgBonus.setVisible(true);
            bgBonus.bonus.setString("+" + inf.curVoucher.bonusValue + "%");
        }

        this.bgBonus.setVisible(inf.bonusValue && inf.bonusValue > 0);
        if (inf.bonusValue && inf.bonusValue > 0){
            this.bgBonus.text.setString(inf.bonus + (inf.isBonusVip ? levelVip : ""));
            this.bgBonus.bonus.setString("+" + inf.bonusValue + "%");
        }

        // check Offer
        if (inf.isOfferNoPrice) {
            this.img.removeAllChildren();

            var sp = ccui.Button.create("res/Lobby/Offer/iconSuperOffer.png");
            sp.setPressedActionEnabled(true);
            sp.loadTextures("res/Lobby/Offer/iconSuperOffer.png", "res/Lobby/Offer/iconSuperOffer.png", "");
            sp.addTouchEventListener(this.showOffer, this);
            sp.setScale(this._scale);
            this.img.addChild(sp);
            sp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
        }
    },

    showOffer: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                offerManager.showOfferNoPriceGUI(this.info.type);
                break;
        }
    },

    setButton: function (type) {
        switch (type) {
            case Payment.GOLD_G:
            case Payment.TICKET_G: {
                this.btn.loadTextures("ShopIAP/g_btn.png", "ShopIAP/g_btn.png");
                this.currency.setString(ItemIapCell.CURRENCY_G);
                this.currency.setColor(cc.color(52, 104, 2, 0));
                this.cost.setColor(cc.color(52, 104, 2, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_ATM:
            case Payment.G_ATM:
            case Payment.TICKET_ATM: {
                this.btn.loadTextures("ShopIAP/ATMBtn.png", "ShopIAP/ATMBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ATM);
                this.currency.setColor(cc.color(62, 23, 89, 0));
                this.cost.setColor(cc.color(62, 23, 89, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_ZING:
            case Payment.G_ZING:
            case Payment.TICKET_ZING: {
                this.btn.loadTextures("ShopIAP/zingBtn.png", "ShopIAP/zingBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ZING);
                this.currency.setColor(cc.color(121, 5, 48, 0));
                this.cost.setColor(cc.color(121, 5, 48, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_IAP:
            case Payment.G_IAP:
            case Payment.TICKET_IAP: {
                this.scheduleUpdate();

                this.btn.loadTextures(this.getIAPImage(), this.getIAPImage());
                this.cost.setColor(this.getIAPColor());
                this.currency.setVisible(false);
                break;
            }
            case Payment.GOLD_SMS_VIETTEL:
            case Payment.GOLD_SMS_MOBI:
            case Payment.GOLD_SMS_VINA:
            case Payment.GOLD_SMS:
            case Payment.TICKET_SMS: {
                this.btn.loadTextures("ShopIAP/btn_sms.png", "ShopIAP/btn_sms.png");
                this.currency.setString(ItemIapCell.CURRENCY_SMS);
                this.currency.setColor(cc.color(149, 64, 46, 0));
                this.cost.setColor(cc.color(149, 64, 46, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.G_ZALO:
            case Payment.GOLD_ZALO:
            case Payment.TICKET_ZALO: {
                this.btn.loadTextures("ShopIAP/zaloBtn.png", "ShopIAP/zaloBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ZALO);
                this.currency.setColor(cc.color(255, 255, 255, 0));
                this.cost.setColor(cc.color(255, 255, 255, 0));
                this.currency.setVisible(true);
                break;
            }
        }
    },

    createImage: function () {
        this.img.removeAllChildren();
        this.img.setScale(0.8);

        if (this.info.promoDailyPurchase){
            var temp = new ccui.ImageView("Lobby/DailyPurchase/btnLobby.png", 0, "DailyPurchase");
            this.img.addChild(temp);
            temp.setAnchorPoint(0.5, 0);
            temp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2 - temp.getContentSize().height / 2);

            temp.runAction(cc.sequence(
                cc.scaleTo(0.3, 0.95, 1.05).easing(cc.easeSineInOut()),
                cc.scaleTo(0.3, 1.05, 0.95).easing(cc.easeSineInOut())
            ).repeatForever());

            temp.setTouchEnabled(true);
            temp.addClickEventListener(function(){
                if (dailyPurchaseManager.checkOpen())
                    dailyPurchaseManager.openDailyPurchaseGUI();
            });
        }
        else {
            var sp = new cc.Sprite(this.info.img);
            sp.setScale(this._scale);
            this.img.addChild(sp);
            sp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
        }
    },

    getIAPImage: function () {
        if (cc.sys.os == cc.sys.OS_IOS) {
            return "ShopIAP/iap_ios_btn.png";
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            return "ShopIAP/iap_btn.png";
        }

        return "ShopIAP/iap_ios_btn.png";
    },

    getIAPColor: function () {
        if (cc.sys.os == cc.sys.OS_IOS) {
            return cc.color(12, 45, 115, 0);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            return cc.color(19, 90, 77, 0);
        }

        return cc.color(12, 45, 115, 0);
    },

    cloneLabel: function (lb) {
        var ret = BaseLayer.createLabelText();
        ret.setFontSize(lb.getFontSize());
        ret.setTextColor(lb.getTextColor());
        ret.setFontName(lb.getFontName());
        ret.setPosition(lb.getPosition());
        ret.setTextHorizontalAlignment(lb.getTextHorizontalAlignment());
        ret.setTextVerticalAlignment(lb.getTextVerticalAlignment());
        ret.setAnchorPoint(lb.getAnchorPoint());
        ret.setString(lb.getString());
        ret.setRotationX(lb.getRotationX());
        ret.setRotationY(lb.getRotationY());
        lb.getParent().addChild(ret);
        lb.setVisible(false);
        return ret;
    },

    updateButton: function (state) {
        if (this.lastActionUpdate == state) return;
        this.lastActionUpdate = state;

        if (state == 1) {
            this.btn.loadTextures(this.getIAPImage(), this.getIAPImage());
            this.cost.setColor(this.getIAPColor());
            this.currency.setVisible(false);
        } else {
            this.btn.loadTextures("ShopIAP/btn_iap_limit_time.png", "ShopIAP/btn_iap_limit_time.png");
            this.cost.setColor(cc.color(197, 197, 197, 0));
            this.currency.setVisible(true);
        }
    },

    onTouchEventHandler: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                this.onButtonRelease(sender, sender.getTag());
                break;
        }
    },

    onButtonRelease: function (btn, id) {
        if (!this.uptoLevelVip.isVisible()) {
            return;
        }

        var level = this.info.uptoLevelVip;
        var text = StringUtility.replaceAll(localized("VIP_TOOLTIP_4"), "@number", level);
        var tooltip = new TooltipFloat();
        var pos = this.btn.getPosition();
        pos.x -= this.btn.getContentSize().width / 2;
        tooltip.setTooltip(text, TooltipFloat.MEDIUM, pos, TooltipFloat.SHOW_UP_TYPE_3);
        this._layout.addChild(tooltip, TOOLTIP_FLOAT_TAG, TOOLTIP_FLOAT_TAG);
    },

    update: function (dt) {

        if (!isNaN(this.info.limitTimeIdx)) {
            var nTime = iapHandler.getTimeLimitLeft(this.info.limitTimeIdx);
            if (nTime <= 0) {
                this.updateButton(1);
            } else {
                this.updateButton(2);
            }

            this.currency.setString(iapHandler.getTimeLimitString(this.info.limitTimeIdx));
        }
    }
});
ItemIapCell.CURRENCY_IAP = "VND";
ItemIapCell.CURRENCY_SMS = "VND";
ItemIapCell.CURRENCY_G = "G";
ItemIapCell.CURRENCY_ATM = "VND";
ItemIapCell.CURRENCY_ZING = "VND";
ItemIapCell.CURRENCY_ZALO = "VND";

var OfferIapCell = cc.TableViewCell.extend({
    ctor: function (p) {
        this._super();

        this.tParent = p;
        var jsonLayout = ccs.load("OfferIapItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);

        this.img = ccui.Helper.seekWidgetByName(this._layout, "img");
        this.currentImage = null;
        this.btn = ccui.Helper.seekWidgetByName(this._layout, "btn");
        this.oldCost = ccui.Helper.seekWidgetByName(this._layout, "lbOldPrice");
        this.oldCost.ignoreContentAdaptWithSize(true);
        this.cost = ccui.Helper.seekWidgetByName(this.btn, "vnd");
        this.currency = ccui.Helper.seekWidgetByName(this.btn, "lb");
        this.goldOld = ccui.Helper.seekWidgetByName(this._layout, "lbOldGold");
        this.goldOld.ignoreContentAdaptWithSize(true);
        this.goldNew = ccui.Helper.seekWidgetByName(this._layout, "lbGold");
        this.line1 = ccui.Helper.seekWidgetByName(this._layout, "line1");
        this.line2 = ccui.Helper.seekWidgetByName(this._layout, "line2");
        this.time = ccui.Helper.seekWidgetByName(this._layout, "lbTime");
        this.time.ignoreContentAdaptWithSize(true);
        this.lbPromo1 = ccui.Helper.seekWidgetByName(this._layout, "lbPromo1");
        this.lbPromo2 = ccui.Helper.seekWidgetByName(this._layout, "lbPromo2");
        this.lbPromo2.ignoreContentAdaptWithSize(true);
        this.lbBonus = ccui.Helper.seekWidgetByName(this._layout, "lbBonus");
        this.lbBonus.ignoreContentAdaptWithSize(true);

        this.lastActionUpdate = 0;
    },

    setInfo: function (inf) {
        this.info = inf;
        this.lastActionUpdate = 0;

        this.createImage();
        if (!isNaN(inf.cost))
            this.cost.setString(StringUtility.pointNumber(inf.cost));
        else
            this.cost.setString(inf.cost);

        if (!isNaN(inf.costConfig)) {
            if (inf.costConfig == inf.cost) {
                this.oldCost.setVisible(false);
                this.line1.setVisible(false);
            } else {
                this.oldCost.setString(StringUtility.pointNumber(inf.costConfig) + " vnđ");
                this.line1.setScaleX(this.oldCost.getContentSize().width / this.line1.getContentSize().width);
            }
        } else {
            this.oldCost.setVisible(false);
            this.line1.setVisible(false);
        }

        this.goldOld.setString(StringUtility.pointNumber(inf.goldOld));
        this.goldNew.setString(StringUtility.pointNumber(inf.goldNew));
        var str = "";
        str += "+ " + StringUtility.pointNumber(inf.vPoint) + " VPoint";


        this.goldOld.setVisible(inf.goldNew != inf.goldOld);
        this.line2.setVisible(inf.goldNew != inf.goldOld);

        this.line2.setPositionX(this.goldOld.getPositionX() + this.goldOld.getContentSize().width / 2);
        this.line2.setScaleX(this.goldOld.getContentSize().width / this.line2.getContentSize().width);

        var levelVip = NewVipManager.getInstance().getRealVipLevel();
        inf.hourBonus = inf.hourBonus || 0;
        if (inf.hourBonus > 0 && inf.vPoint > 0 && levelVip > 0) {
            str += "\n+ " + inf.hourBonus + "h VIP";
        }

        if (inf.bonus.length <= 0) {
            this.lbPromo1.setVisible(false);
            this.lbPromo2.setVisible(false);
        } else {
            this.lbPromo1.setVisible(true);
            this.lbPromo2.setVisible(true);
            this.lbPromo2.setString(inf.bonus);
        }

        //set info bonus ticket
        var offerEvent = inf.offerEvents;
        for (var i = 0; i < offerEvent.length; i++) {
            var eOffer = offerEvent[i];
            str += "\n+ " + eOffer["value"] + " " + event.getOfferTicketString(eOffer["eventId"]);
        }

        //set info bonus diamond
        if (inf.diamondBonus > 0) {
            str += "\n+ " + inf.diamondBonus + " Kim cương";
        }

        if (str.length > 0) {
            this.lbBonus.setString(str);
        }
        var offer = offerManager.getOfferById(inf.offerId);
        if (offer) {
            var time = offer.getTimeLeftInSecond();
            var s = LocalizedString.to("OFFER_REMAIN_TIME_2");
            if (time >= 1) {
                var str = StringUtility.getTimeString2(time);
                s = StringUtility.replaceAll(s, "@time", str);
            } else {
                s = LocalizedString.to("OFFER_REMAIN_TIME_3");
            }
        }
        else {
            s = LocalizedString.to("OFFER_REMAIN_TIME_3");
        }
        this.time.setString(s);
        this.unscheduleUpdate();
        this.scheduleUpdate();
    },

    setButton: function (type) {
        switch (type) {
            case Payment.GOLD_G:
            case Payment.TICKET_G: {
                this.btn.loadTextures("ShopIAP/g_btn.png", "ShopIAP/g_btn.png");
                this.currency.setString(ItemIapCell.CURRENCY_G);
                this.currency.setColor(cc.color(52, 104, 2, 0));
                this.cost.setColor(cc.color(52, 104, 2, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_ATM:
            case Payment.G_ATM:
            case Payment.TICKET_ATM: {
                this.btn.loadTextures("ShopIAP/ATMBtn.png", "ShopIAP/ATMBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ATM);
                this.currency.setColor(cc.color(62, 23, 89, 0));
                this.cost.setColor(cc.color(62, 23, 89, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_ZING:
            case Payment.G_ZING:
            case Payment.TICKET_ZING: {
                this.btn.loadTextures("ShopIAP/zingBtn.png", "ShopIAP/zingBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ZING);
                this.currency.setColor(cc.color(121, 5, 48, 0));
                this.cost.setColor(cc.color(121, 5, 48, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.GOLD_IAP:
            case Payment.G_IAP:
            case Payment.TICKET_IAP: {
                this.scheduleUpdate();

                this.btn.loadTextures(this.getIAPImage(), this.getIAPImage());
                this.cost.setColor(this.getIAPColor());
                this.currency.setVisible(false);
                break;
            }
            case Payment.GOLD_SMS_VIETTEL:
            case Payment.GOLD_SMS_MOBI:
            case Payment.GOLD_SMS_VINA:
            case Payment.GOLD_SMS:
            case Payment.TICKET_SMS: {
                this.btn.loadTextures("ShopIAP/btn_sms.png", "ShopIAP/btn_sms.png");
                this.currency.setString(ItemIapCell.CURRENCY_SMS);
                this.currency.setColor(cc.color(149, 64, 46, 0));
                this.cost.setColor(cc.color(149, 64, 46, 0));
                this.currency.setVisible(true);
                break;
            }
            case Payment.G_ZALO:
            case Payment.GOLD_ZALO:
            case Payment.TICKET_ZALO: {
                this.btn.loadTextures("ShopIAP/zaloBtn.png", "ShopIAP/zaloBtn.png");
                this.currency.setString(ItemIapCell.CURRENCY_ZALO);
                this.currency.setColor(cc.color(255, 255, 255, 0));
                this.cost.setColor(cc.color(255, 255, 255, 0));
                this.currency.setVisible(true);
                break;
            }
        }
    },

    createImage: function () {
        this.img.removeAllChildren();

        var sp = cc.Sprite.create(this.info.img);
        sp.setScale(this._scale);
        this.img.addChild(sp);
        sp.setPosition(this.img.getContentSize().width / 2, this.img.getContentSize().height / 2);
    },

    getIAPImage: function () {
        if (cc.sys.os == cc.sys.OS_IOS) {
            return "ShopIAP/iap_ios_btn.png";
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            return "ShopIAP/iap_btn.png";
        }

        return "ShopIAP/iap_ios_btn.png";
    },

    getIAPColor: function () {
        if (cc.sys.os == cc.sys.OS_IOS) {
            return cc.color(12, 45, 115, 0);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            return cc.color(19, 90, 77, 0);
        }

        return cc.color(12, 45, 115, 0);
    },

    update: function (dt) {
        var offer = offerManager.getOfferById(this.info.offerId);
        if (offer) {
            var time = offer.getTimeLeftInSecond();
            var s = LocalizedString.to("OFFER_REMAIN_TIME_2");
            if (time >= 1) {
                var str = StringUtility.getTimeString2(time);
                s = StringUtility.replaceAll(s, "@time", str);
            } else {
                s = LocalizedString.to("OFFER_REMAIN_TIME_3");
            }
        }
        else {
            s = LocalizedString.to("OFFER_REMAIN_TIME_3");
        }

        this.time.setString(s);
    }
});

var ShopItemCell = cc.TableViewCell.extend({
    ctor: function(numCol, itemScale, itemSpace, highlight, tabItemPayment) {
        this._super(ShopItemCell.className);
        this.numCol = numCol;
        this.itemScale = itemScale;
        this.itemSpace = itemSpace;
        this.highlight = highlight;
        this.tabItemPayment = tabItemPayment;

        this._layout = new cc.Layer(StorageItemCell.WIDTH * this.itemScale * this.numCol + this.itemSpace * this.numCol, StorageItemCell.HEIGHT * this.itemScale + this.itemSpace);
        for (var i = 0; i < this.numCol; i++){
            var itemNode = ccs.load("Lobby/ShopItem.json").node;
            itemNode.setPosition(this.itemSpace + i * (this.itemSpace + StorageItemCell.WIDTH * this.itemScale), this.itemSpace/2);
            itemNode.setScale(this.itemScale);
            this._layout.addChild(itemNode, 0, i);
            itemNode.img = itemNode.getChildByName("img");
            itemNode.img.ignoreContentAdaptWithSize(true);
            itemNode.shadow = itemNode.getChildByName("shadow");
            itemNode.shadow.ignoreContentAdaptWithSize(true);
            itemNode.promoBg = itemNode.getChildByName("promoBg");
            itemNode.promo = itemNode.promoBg.getChildByName("promo");
            itemNode.promo.ignoreContentAdaptWithSize(true);
            itemNode.iconDiamond = itemNode.getChildByName("iconDiamond");
            itemNode.diamond = itemNode.iconDiamond.getChildByName("diamond");
            itemNode.diamond.ignoreContentAdaptWithSize(true);
            itemNode.iconLock = itemNode.getChildByName("iconLock");
            itemNode.condition = itemNode.iconLock.getChildByName("condition");
            itemNode.condition.ignoreContentAdaptWithSize(true);
            itemNode.iconLimit = itemNode.getChildByName("timeLimit");
            itemNode.iconLimit.setLocalZOrder(1);
            itemNode.getChildByName("bg").setTouchEnabled(true);
            itemNode.getChildByName("bg").setSwallowTouches(false);
            itemNode.getChildByName("bg").addTouchEventListener(function(target, type){
                switch(type){
                    case ccui.Widget.TOUCH_BEGAN:
                        target.isWaitingTouch = true;
                        break;
                    case ccui.Widget.TOUCH_MOVED:
                        if (target.isWaitingTouch) {
                            var touchBeganPos = target.getTouchBeganPosition();
                            var touchMovePos = target.getTouchMovePosition();
                            if (Math.sqrt(Math.pow(touchMovePos.x - touchBeganPos.x, 2) + Math.pow(touchMovePos.y - touchBeganPos.y, 2)) > 2)
                                target.isWaitingTouch = false;
                        }
                        break;
                    case ccui.Widget.TOUCH_ENDED:
                        if (target.isWaitingTouch)
                            this.tabItemPayment.selectItem(target.getParent().index, target.getParent());
                        break;
                    case ccui.Widget.TOUCH_CANCELED:
                        break;
                }
            }.bind(this), this);
        }
        this.addChild(this._layout);
    },

    setData: function(items) {
        for (var i = 0; i < this.numCol; i++){
            var itemNode = this._layout.getChildByTag(i);
            if (i >= items.length) itemNode.setVisible(false);
            else{
                var item = items[i];
                itemNode.setVisible(true);
                if (item.path && item.path != ""){
                    itemNode.img.setVisible(true);
                    itemNode.img.loadTexture(item.path);
                    itemNode.img.setScale(item.scale);
                    itemNode.shadow.setVisible(true);
                    itemNode.shadow.loadTexture(item.path);
                    itemNode.shadow.setScale(item.scale);
                }
                else{
                    itemNode.img.setVisible(false);
                    itemNode.shadow.setVisible(false);
                }
                itemNode.index = item.index;

                var conditions = [];
                for (var j = 0; j < item.data.conditions.length; j++){
                    var condition = item.data.conditions[j];
                    switch(condition.type){
                        case StorageManager.VIP_CONDITION:
                            if (NewVipManager.getInstance().getRealVipLevel() < condition.num)
                                conditions.push(condition);
                            break;
                        case StorageManager.LEVEL_CONDITION:
                            if (gamedata.userData.level < condition.num)
                                conditions.push(condition);
                            break;
                    }
                }
                if (conditions.length == 0){
                    itemNode.iconLock.setVisible(false);
                    itemNode.iconDiamond.setVisible(true);
                    ShopItemCell.setDiamond(itemNode, item.data.options[item.selectedOption].price);
                }
                else{
                    itemNode.iconLock.setVisible(true);
                    itemNode.iconDiamond.setVisible(false);
                    ShopItemCell.setConditions(itemNode, conditions);
                }

                itemNode.iconLimit.setVisible(item.data.remainTime >= 0);
                if (item.data.remainTime >= 0){
                    itemNode.iconLimit.stopAllActions();
                    itemNode.iconLimit.setRotation(0);
                    itemNode.iconLimit.runAction(cc.sequence(
                        cc.rotateTo(0.1, -20), cc.rotateTo(0.1, 19), cc.rotateTo(0.1, -18), cc.rotateTo(0.1, 17),
                        cc.rotateTo(0.1, -16), cc.rotateTo(0.1, 15), cc.rotateTo(0.1, -14), cc.rotateTo(0.1, 13),
                        cc.rotateTo(0.1, -12), cc.rotateTo(0.1, 11), cc.rotateTo(0.1, -10), cc.rotateTo(0.1, 9),
                        cc.rotateTo(0.1, -8), cc.rotateTo(0.1, 7), cc.rotateTo(0.1, -6), cc.rotateTo(0.1, 5),
                        cc.rotateTo(0.1, -4), cc.rotateTo(0.1, 3), cc.rotateTo(0.1, -2), cc.rotateTo(0.1, 1),
                        cc.rotateTo(0.1, 0), cc.delayTime(2)
                    ).repeatForever());
                }

                var maxDiscount = 0;
                for (var j = 0; j < item.data.options.length; j++)
                    maxDiscount = Math.max(item.data.options[j]["discount"], maxDiscount);
                ShopItemCell.setDiscount(itemNode, maxDiscount);

                if (item.isSelected){
                    this.highlight.removeFromParent();
                    itemNode.addChild(this.highlight);
                }
                else{
                    itemNode.removeChild(this.highlight);
                }
            }
        }
    }
});
ShopItemCell.setDiscount = function(itemNode, discount) {
    if (discount <= 0)
        itemNode.promoBg.setVisible(false);
    else{
        itemNode.promoBg.setVisible(true);
        itemNode.promo.setString("-" + discount + "%");
    }
};
ShopItemCell.setConditions = function(itemNode, conditions){
    if (conditions.length == 0){
        itemNode.iconLock.setVisible(false);
        return;
    }
    var cond = conditions[0];
    var condStr = "";
    switch(cond.type){
        case StorageManager.VIP_CONDITION:
            condStr += "Vip ";
            break;
        case StorageManager.LEVEL_CONDITION:
            condStr += "Level ";
    }
    condStr += cond.num;
    itemNode.condition.setString(condStr);
    var w = itemNode.condition.x + itemNode.condition.getAutoRenderSize().width;
    var d = w/2 - itemNode.iconLock.width/2;
    itemNode.iconLock.setPositionX(itemNode.width/2 - d);
};
ShopItemCell.setDiamond = function(itemNode, price) {
    itemNode.diamond.setString(StringUtility.standartNumber(price));
    var w = itemNode.diamond.x + itemNode.diamond.getAutoRenderSize().width;
    var d = w/2 - itemNode.iconDiamond.width/2;
    itemNode.iconDiamond.setPositionX(itemNode.width/2 - d);
};
ShopItemCell.className = "ShopItemCell";
ShopItemCell.WIDTH = 110;
ShopItemCell.HEIGHT = 110;
ShopItemCell.MIN_COL = 2;
ShopItemCell.MAX_COL = 3;
ShopItemCell.MIN_SPACE = 15;
ShopItemCell.MIN_SCALE = 0.75;

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
                sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    iapHandler.fakePayment(info.costConfig, Constant.G_IAP);
                } else {
                    iapHandler.purchaseItem(iapHandler.getProductIdIAP(info));
                }
                break;
            }
            case Payment.G_ATM : {
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
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
                    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
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
                            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
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
                    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
                    iapHandler.fakePayment(info.cost, Constant.GOLD_ATM, typeCheat);
                } else {
                    var gui = sceneMgr.openGUI(GUIBank.className, GUIBank.TAG, GUIBank.TAG);
                    gui.setInfoBuy(info.cost, true, typeBuy);
                }

                break;
            case Payment.GOLD_ZING:
            case Payment.TICKET_ZING:
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
                    iapHandler.fakePayment(info.cost, Constant.GOLD_ZING, typeCheat);
                } else {
                    var gui = sceneMgr.openGUI(GUIInputCard.className, GUIInputCard.TAG, GUIInputCard.TAG);
                    gui.setInfo(info.cost, typeBuy);
                }
                break;
            case Payment.GOLD_ZALO:
            case Payment.TICKET_ZALO:
                fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.BEGIN + "BUY_ZALO");
                fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "CLICK_SHOP");
                if (Config.ENABLE_NEW_OFFER) {
                    if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
                        iapHandler.fakePayment(info.cost, Constant.GOLD_ZALO, Payment.CHEAT_PAYMENT_NORMAL);
                    }
                    else {
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

var PanelCard = BaseLayer.extend({

    ctor: function () {
        this.btnViettel = null;
        this.btnMobifone = null;
        this.btnVinaphone = null;
        this.btnZing = null;
        this.btnVinamobile = null;

        this.normalColor = cc.color(152, 130, 166, 0);
        this.selectColor = cc.color(165, 215, 110, 0);

        this.curCardSelect = 0;

        this.btnPurchase = null;

        this.txCard = null;
        this.txSerial = null;

        this._super("PanelCard");
        this.initWithBinaryFile("ShopCardPanel.json");
    },

    initGUI: function () {
        this._layout.setScale(this._scale);

        this.panelCenter = this.getControl("panelCenter");
        this.panelMaintain = this.getControl("panelMaintain");
        this.btnViettel = this.customButton("viettel", PanelCard.BTN_VIETTEL);
        this.btnViettel.img = this.getControl("img", this.btnViettel);
        this.btnViettel.lb = this.getControl("lb", this.btnViettel);

        this.btnMobifone = this.customButton("mobifone", PanelCard.BTN_MOBIFONE);
        this.btnMobifone.img = this.getControl("img", this.btnMobifone);
        this.btnMobifone.lb = this.getControl("lb", this.btnMobifone);

        this.btnVinaphone = this.customButton("vinaphone", PanelCard.BTN_VINAPHONE);
        this.btnVinaphone.img = this.getControl("img", this.btnVinaphone);
        this.btnVinaphone.lb = this.getControl("lb", this.btnVinaphone);

        this.btnZing = this.customButton("zing", PanelCard.BTN_ZING);
        //this.btnZing.img = this.getControl("img", this.btnZing);
        //this.btnZing.lb = this.getControl("lb", this.btnZing);

        this.btnVinamobile = this.customButton("vinamobile", PanelCard.BTN_VINAMOBILE);
        this.btnVinamobile.img = this.getControl("img", this.btnVinamobile);
        this.btnVinamobile.lb = this.getControl("lb", this.btnVinamobile);

        this.btnPurchase = this.customButton("purchase", PanelCard.BTN_PURCHASE);

        var tfCard = this.getControl("txcard");
        var tfSerial = this.getControl("txseri");

        // if (cc.sys.isNative){
        tfCard.setVisible(false);
        this.txCard = BaseLayer.createEditBox(tfCard);
        this.txCard.setTag(AccountInputUI.TF_USERNAME);
        this.txCard.setDelegate(this);
        this.txCard.setPosition(tfCard.getPosition());
        this.panelCenter.addChild(this.txCard);

        tfSerial.setVisible(false);
        this.txSerial = BaseLayer.createEditBox(tfSerial);
        this.txSerial.setTag(AccountInputUI.TF_USERNAME);
        this.txSerial.setDelegate(this);
        this.txSerial.setPosition(tfSerial.getPosition());
        this.panelCenter.addChild(this.txSerial);
        // } else {
        //     this.txCard = tfCard;
        //     this.txSerial = tfSerial;
        // }

        this.curCardSelect = -1;
    },

    onEnterFinish: function () {
        if (this.curCardSelect < 0) {
            if (type == PanelCard.CARD) {
                this.onButtonRelease(null, PanelCard.BTN_VIETTEL);
            } else {
                this.onButtonRelease(null, PanelCard.BTN_ZING);
            }
        }

        if (this.type == PanelCard.ZING) {
            var config = gamedata.gameConfig.getShopGById(Payment.G_ZING);
            if (config) {
                this.panelCenter.setVisible(config["isMaintained"][0] == 0);
                this.panelMaintain.setVisible(config["isMaintained"][0] == 1);
            }
            this.curCardSelect = PanelCard.BTN_ZING;
        }
    },

    updateButton: function (visible) {
        //  this.btnPurchase.setVisible(visible);
    },

    setType: function (type) {
        this.type = type;
        if (type == PanelCard.CARD) {
            this.btnViettel.setVisible(true);
            this.btnVinamobile.setVisible(true);
            this.btnMobifone.setVisible(true);
            this.btnVinaphone.setVisible(true);
            this.btnZing.setVisible(false);
        } else {
            this.btnViettel.setVisible(false);
            this.btnVinamobile.setVisible(false);
            this.btnMobifone.setVisible(false);
            this.btnVinaphone.setVisible(false);
            this.btnZing.setVisible(true);
            this.curCardSelect = PanelCard.BTN_ZING;
        }

    },

    onButtonRelease: function (btn, id) {
        if (id == PanelCard.BTN_PURCHASE) {
            if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                cc.log("VAO DAY NE ");
                var card = this.txCard.getString();
                if (this.type == PanelCard.CARD) {
                    var type = "";
                    if (this.curCardSelect == PanelCard.BTN_VIETTEL)
                        type = Constant.VIETTEL;
                    else if (this.curCardSelect == PanelCard.BTN_MOBIFONE)
                        type = Constant.MOBI;
                    else if (this.curCardSelect == PanelCard.BTN_VINAPHONE)
                        type = Constant.VINA;
                    iapHandler.fakePayment(parseInt(card), type);
                } else {
                    iapHandler.fakePayment(parseInt(card), Constant.G_ZING);
                }
            } else {
                var card = this.txCard.getString();
                var seri = this.txSerial.getString();

                if (card == "") {
                    sceneMgr.showOKDialog(LocalizedString.to("GUI_ADD_G_INPUT_CODE"));
                } else if (seri == "") {
                    sceneMgr.showOKDialog(LocalizedString.to("GUI_ADD_G_INPUT_SERI"));
                } else {
                    iapHandler.purchaseCard(this.curCardSelect, card, seri, 0);
                    this.updateButton(false);
                }
            }
        } else {
            if (this.type == PanelCard.CARD) {
                this.btnViettel.img.setVisible(id == PanelCard.BTN_VIETTEL);
                this.btnViettel.lb.setColor((id == PanelCard.BTN_VIETTEL) ? this.selectColor : this.normalColor);

                this.btnMobifone.img.setVisible(id == PanelCard.BTN_MOBIFONE);
                this.btnMobifone.lb.setColor((id == PanelCard.BTN_MOBIFONE) ? this.selectColor : this.normalColor);

                this.btnVinaphone.img.setVisible(id == PanelCard.BTN_VINAPHONE);
                this.btnVinaphone.lb.setColor((id == PanelCard.BTN_VINAPHONE) ? this.selectColor : this.normalColor);

                this.btnVinamobile.img.setVisible(id == PanelCard.BTN_VINAMOBILE);
                this.btnVinamobile.lb.setColor((id == PanelCard.BTN_VINAMOBILE) ? this.selectColor : this.normalColor);
                if (gamedata.gameConfig) {
                    var config = gamedata.gameConfig.getShopGById(Payment.G_CARD);
                    if (config) {
                        if (id == PanelCard.BTN_VIETTEL) {
                            this.panelCenter.setVisible(config["isMaintained"][Payment.CARD_VIETTEL] == 0);
                            this.panelMaintain.setVisible(config["isMaintained"][Payment.CARD_VIETTEL] == 1);
                        } else if (id == PanelCard.BTN_VINAPHONE) {
                            this.panelCenter.setVisible(config["isMaintained"][Payment.CARD_VINA] == 0);
                            this.panelMaintain.setVisible(config["isMaintained"][Payment.CARD_VINA] == 1);
                        } else if (id == PanelCard.BTN_VINAMOBILE) {
                            this.panelCenter.setVisible(config["isMaintained"][Payment.CARD_VINAMOBILE] == 0);
                            this.panelMaintain.setVisible(config["isMaintained"][Payment.CARD_VINAMOBILE] == 1);
                        } else if (id == PanelCard.BTN_MOBIFONE) {
                            this.panelCenter.setVisible(config["isMaintained"][Payment.CARD_MOBI] == 0);
                            this.panelMaintain.setVisible(config["isMaintained"][Payment.CARD_MOBI] == 1);
                        }
                    }
                }
            } else {

            }
            this.curCardSelect = id;
        }
    }
});
PanelCard.CARD = 0;
PanelCard.ZING = 1;
PanelCard.BTN_VIETTEL = 4;
PanelCard.BTN_MOBIFONE = 2;
PanelCard.BTN_VINAPHONE = 3;
PanelCard.BTN_ZING = 1;
PanelCard.BTN_VINAMOBILE = 45;
PanelCard.BTN_CLOSE = 10;
PanelCard.BTN_PURCHASE = 10;

var SimOperatorPopup = BaseLayer.extend({

    ctor: function () {
        this.amount = 0;
        this.type = 0;

        this._super("SimOperatorPopup");
        this.initWithBinaryFile("SimOperatorPopup.json");
    },

    initGUI: function () {
        var p = this.getControl("bg");
        this._bg = p;

        this.btnViettel = this.customButton("viettel", PanelCard.BTN_VIETTEL, p);
        this.btnMobi = this.customButton("mobifone", PanelCard.BTN_MOBIFONE, p);
        this.btnVina = this.customButton("vinaphone", PanelCard.BTN_VINAPHONE, p);
        this.customButton("btnClose", PanelCard.BTN_CLOSE, p);

        this.iconViettel = this.getControl("iconMaintainViettel", p);
        this.iconVina = this.getControl("iconMaintainVina", p);
        this.iconMobi = this.getControl("iconMaintainMobi", p);

        this.enableFog();
        this.setBackEnable(true);
    },

    setAmount: function (a, b) {
        this.amount = parseInt(a);
        this.type = parseInt(b);
        this.typeBuy = this.type; // loai mua SMS: Gold, Ve, Offer : 0, 1, 2
        this.updateMaintain();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.updateMaintain();
    },

    updateMaintain: function () {
        var maintainViettel = gamedata.gameConfig.getShopGoldById(Payment.GOLD_SMS_VIETTEL)["isMaintained"][0];
        var maintainVina = gamedata.gameConfig.getShopGoldById(Payment.GOLD_SMS_VINA)["isMaintained"][0];
        var maintainMobi = gamedata.gameConfig.getShopGoldById(Payment.GOLD_SMS_MOBI)["isMaintained"][0];
        maintainViettel = maintainViettel || !gamedata.gameConfig.checkHavePackage(Payment.GOLD_SMS_VIETTEL, this.amount);
        maintainVina = maintainVina || !gamedata.gameConfig.checkHavePackage(Payment.GOLD_SMS_VINA, this.amount);
        maintainMobi = maintainMobi || !gamedata.gameConfig.checkHavePackage(Payment.GOLD_SMS_MOBI, this.amount);
        this.iconViettel.setVisible(maintainViettel);
        this.iconVina.setVisible(maintainVina);
        this.iconMobi.setVisible(maintainMobi);
        this.btnViettel.setOpacity(maintainViettel == 1 ? 150 : 255);
        this.btnVina.setOpacity(maintainVina == 1 ? 150 : 255);
        this.btnMobi.setOpacity(maintainMobi == 1 ? 150 : 255);
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case PanelCard.BTN_VIETTEL:
                if (this.iconViettel.isVisible()) {

                    cc.log("TYPE NE " + this.type);
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("MAINTAIN_SERVICE"));
                    return;
                } else {
                    this.type = Payment.GOLD_SMS_VIETTEL;
                }

                break;
            case PanelCard.BTN_VINAPHONE:
                if (this.iconVina.isVisible()) {

                    cc.log("TYPE NE " + this.type);
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("MAINTAIN_SERVICE"));
                    return;
                } else {
                    this.type = Payment.GOLD_SMS_VINA;
                }
                break;
            case PanelCard.BTN_MOBIFONE:
                if (this.iconMobi.isVisible()) {

                    cc.log("TYPE NE " + this.type);
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("MAINTAIN_SERVICE"));
                    return;
                } else {
                    this.type = Payment.GOLD_SMS_MOBI;
                }
                break;
        }
        if (id != PanelCard.BTN_CLOSE && !gamedata.gameConfig.checkHavePackage(this.type, this.amount)) {
            ToastFloat.makeToast(ToastFloat.SHORT, "Không hỗ trợ gói SMS này");
            this.onClose();
            return;
        }
        this.onClose();
        if (id == PanelCard.BTN_CLOSE)
            return;
        cc.log("TYPE NE " + this.type);
        cc.log("TYPE BUY " + this.typeBuy);
        if (this.typeBuy == Payment.CHEAT_PAYMENT_OFFER)
            iapHandler.requestSMSSyntax(id, parseInt(this.amount), Payment.CHEAT_PAYMENT_OFFER, parseInt(this.type), Payment.IS_OFFER);
        else if (this.typeBuy == Payment.CHEAT_PAYMENT_NORMAL)
            iapHandler.requestSMSSyntax(id, parseInt(this.amount), Payment.CHEAT_PAYMENT_NORMAL, parseInt(this.type), Payment.NO_OFFER);
        else
            iapHandler.requestSMSSyntax(id, parseInt(this.amount), Payment.CHEAT_PAYMENT_EVENT, parseInt(this.type), Payment.NO_OFFER);

        cc.log("##SimOperator::purchaseSMS : " + id + "/" + this.amount);
    },

    onBack: function () {
        this.onClose();
    }
});
SimOperatorPopup.className = "SimOperatorPopup";
SimOperatorPopup.TAG = 500;

var GUIMaintainSMS = BaseLayer.extend({

    ctor: function () {
        this.amount = 0;
        this.type = 0;

        this._super("GUIMaintainSMS");
        this.initWithBinaryFile("GUIMaintainSMS.json");
    },

    initGUI: function () {
        var p = this.getControl("bg");
        this._bg = p;

        this.customButton("btnClose", 0, p);

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        this.onClose();
    },

    onBack: function () {
        this.onClose();
    }
});
GUIMaintainSMS.className = "GUIMaintainSMS";
GUIMaintainSMS.tag = 501;

var GUIInputCard = BaseLayer.extend({

    ctor: function () {
        this.amount = 0;
        this.type = 0;
        this.typeBuy = Payment.NO_OFFER;

        this._super("GUIInputCard");
        this.initWithBinaryFile("GUIInputCard.json");
    },

    initGUI: function () {
        var p = this.getControl("bg");
        this._bg = p;
        this.btnPurchase = this.customButton("btnInput", PanelCard.BTN_PURCHASE);
        this.customButton("btnClose", 0, p);
        var tfCard = this.getControl("txcard");
        var tfSerial = this.getControl("txseri");

        // if (cc.sys.isNative){
        tfCard.setVisible(false);
        this.txCard = BaseLayer.createEditBox(tfCard);
        this.txCard.setTag(AccountInputUI.TF_USERNAME);
        this.txCard.setDelegate(this);
        this.txCard.setPosition(tfCard.getPosition());
        this._bg.addChild(this.txCard);

        tfSerial.setVisible(false);
        this.txSerial = BaseLayer.createEditBox(tfSerial);
        this.txSerial.setTag(AccountInputUI.TF_USERNAME);
        this.txSerial.setDelegate(this);
        this.txSerial.setPosition(tfSerial.getPosition());
        this._bg.addChild(this.txSerial);
        // } else {
        //     this.txCard = tfCard;
        //     this.txSerial = tfSerial;
        // }

        this.enableFog();
        this.setBackEnable(true);
    },

    updateButton: function (visible) {
        //this.btnPurchase.setVisible(visible);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.txCard.setString("");
        this.txSerial.setString("");
        this.setFog(true);
    },

    onButtonRelease: function (btn, id) {
        if (id == PanelCard.BTN_PURCHASE) {
            if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                iapHandler.fakePayment(this.amount, Constant.GOLD_ZING);
            } else {
                var card = this.txCard.getString();
                var seri = this.txSerial.getString();

                if (card == "") {
                    sceneMgr.showOKDialog(LocalizedString.to("GUI_ADD_G_INPUT_CODE"));
                } else if (seri == "") {
                    sceneMgr.showOKDialog(LocalizedString.to("GUI_ADD_G_INPUT_SERI"));
                } else {
                    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
                    iapHandler.purchaseCard(PanelCard.BTN_ZING, card, seri, 1, this.typeBuy);
                    this.updateButton(false);
                    this.onClose();
                }
            }
        } else {
            this.onClose();
        }
    },

    setInfo: function (amount, typeBuy) {
        this.amount = amount;
        if (!typeBuy)
            this.typeBuy = Payment.NO_OFFER;
        else
            this.typeBuy = typeBuy;
    },

    onBack: function () {
        this.onClose();
    }
});
GUIInputCard.className = "GUIInputCard";
GUIInputCard.tag = 502;

var GUIBank = BaseLayer.extend({

    ctor: function () {
        this.amount = 0;
        this.type = 0;
        this.isOffer = false;

        this._super("GUIBank");
        this.initWithBinaryFile("GUIBank.json");
    },

    initGUI: function () {
        var p = this.getControl("bg");
        this.panelCenter = this.getControl("panelCenter");
        this._bg = p;

        this.customButton("btnClose", 100, p);
        this.arrayImage = ["123PTPB", "123POCB", "123PPGB", "123PSGB", "123PNAB", "123PGPB", "123PABB", "123PNVB", "123PVAB", "123PHDB", "123POCEB",
            "123PVPB", "123PMB", "123PVIB", "123PMRTB", "123PSCB", "123PACB", "123PEIB", "123PBIDV", "123PAGB", "123PTCB", "123PVTB", "123PDAB", "123PVCB", "25"];
        this.arrayID = ["TPB", "OCB", "PGB", "SGB", "NAB", "GPB", "ABB", "NVB", "VAB", "HDB", "OJB",
            "VPB", "MB", "VIB", "MSB", "SCB", "ACB", "EIB", "BIDV", "VARB", "TCB", "VTB", "DAB", "VCB", "CC"];
        for (var i = 0; i < 24; i++) {
            var button = new ccui.Button();
            button.setTouchEnabled(true);
            button.loadTextures("ShopIAP/Bank" + this.arrayImage[i] + ".png", "ShopIAP/Bank" + this.arrayImage[i] + ".png", "");
            button.setPosition(button.getContentSize().width * (i % 4 + 0.5) + (3 * (i % 4) + 1), button.getContentSize().height * (Math.floor(i / 4) + 0.5) + 4 * (Math.floor(i / 4) + 1));
            this.panelCenter.addChild(button);
            button.setTag(i);
            button.setPressedActionEnabled(true);
            button.addTouchEventListener(this.onTouchEventHandler, this);
        }


        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.enableFog();
        this.setShowHideAnimate(this._bg, true);
    },

    setInfoBuy: function (value, isBuyGold, isOffer) {
        this.value = value;
        this.isBuyGold = isBuyGold;
        if (!isOffer)
            this.isOffer = Payment.NO_OFFER;
        else
            this.isOffer = isOffer;
        cc.log("IS OFFER " + this.isOffer);
    },

    onButtonRelease: function (btn, id) {
        if (id < 100) {
            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(3);
            var pk = new CmdSendBuyGATM();
            cc.log("VALUE " + this.value);
            pk.putData(this.value, this.arrayID[id], this.isBuyGold, this.isOffer);
            GameClient.getInstance().sendPacket(pk);
            if (!cc.sys.isNative)
                bankPopup = window.open("");
        }
        this.onClose();
    },

    onBack: function () {
        this.onClose();
    }
});
GUIBank.className = "GUIBank";
GUIBank.tag = 503;
var bankPopup = null

var GUISystemBonus = BaseLayer.extend({

    ctor: function () {
        this.nodeKM = null;
        this.typeKM = 0;

        this._super("GUISystemBonus");
        this.initWithBinaryFile("GUISystemBonus.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customizeButton("btnOK", 1, this._bg);
        this.customizeButton("btnClose", 0, this._bg);

        this.nodeKM = this._bg.getChildByName("bonus");
        this.labelBonus = this.getControl("labelBonus", this._bg);
        this.labelTime = this.getControl("labelTime", this._bg);
        this.lableNote = this.getControl("labelNote", this._bg);
        this.labelChannelApply = this.getControl("labelChannelApply", this._bg);
        this.lableNote.setString(localized("NOTE_BONUS_GOLD"));

        this.lbTimeRemain = new RichLabelText();
        //this.lbTimeRemain.setText(txts);
        this._bg.addChild(this.lbTimeRemain);
        //this._bg.removeChild(this.lbTimeRemain);
        this.enableFog();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.loadInfo();
    },

    onButtonRelease: function (button, id) {
        this.onClose();

        if (id == 1) {
            //sceneMgr.openScene(ShopScene.className);
            var idTab = gamedata.gameConfig.getMaxChannelBonus();
            gamedata.openShopInTab(idTab);

        }
        popUpManager.removePopUp(PopUpManager.SHOP_BONUS);
    },

    loadInfo: function () {
        var arrayBonus = gamedata.gameConfig.getMaxShopBonus();
        this.labelBonus.setString(arrayBonus[arrayBonus.length - 1] + "%");

        var txts = [];
        var applyFor = localized("APPLY_FOR");
        txts.push({"text": localized("APPLY_FOR"), "color": cc.color(237, 233, 165), "size": 15});
        if (arrayBonus.length > 2) {
            txts.push({
                "text": " " + this.getNameShop(arrayBonus[0]),
                "font": SceneMgr.FONT_BOLD,
                "color": cc.color(255, 255, 255, 0),
                "size": 15
            });
            txts.push({"text": localized("AND"), "color": cc.color(237, 233, 165, 0), "size": 15});
            applyFor += " " + this.getNameShop(arrayBonus[0]) + ",";
            for (var i = 1; i < arrayBonus.length - 1; i++) {
                var s;
                if (i < 2) {
                    s = " " + this.getNameShop(arrayBonus[i])
                } else {
                    s = ", " + this.getNameShop(arrayBonus[i]);
                }
                if (!!this.getNameShop(arrayBonus[i])) {
                    txts.push({
                        "text": s,
                        "font": SceneMgr.FONT_BOLD,
                        "color": cc.color(255, 255, 255, 0),
                        "size": 15
                    });
                    applyFor += s;
                }
            }
        } else {
            txts.push({
                "text": " " + this.getNameShop(arrayBonus[0]),
                "font": SceneMgr.FONT_BOLD,
                "color": cc.color(255, 255, 255, 0),
                "size": 15
            });
            applyFor += this.getNameShop(arrayBonus[0]);
        }

        this.removeChild(this.lbTimeRemain);
        this.lbTimeRemain = new RichLabelText();
        this.lbTimeRemain.setText(txts);
        this.lbTimeRemain.setVisible(false);
        this._bg.addChild(this.lbTimeRemain);
        this.lbTimeRemain.setPosition(this._bg.getContentSize().width * 0.9 - this.lbTimeRemain.getWidth(), 10);
        var s = localized("TIME_BONUS");
        s = StringUtility.replaceAll(s, "@time1", gamedata.gameConfig.bonusStartDate.substr(0, 5));
        s = StringUtility.replaceAll(s, "@time2", gamedata.gameConfig.bonusEndDate);
        this.labelTime.setString(s);
        if (gamedata.gameConfig.bonusStartDate === gamedata.gameConfig.bonusEndDate) {
            this.labelTime.setString(StringUtility.replaceAll(localized("DAY"), "%day", gamedata.gameConfig.bonusEndDate));
        }
        this.labelChannelApply.setString(applyFor);
    },

    getNameShop: function (id) {
        switch (id) {
            case Payment.GOLD_ATM:

                return "ATM";
                break;
            case Payment.GOLD_G:
                return "Shop Gold";
                break;
            case Payment.GOLD_ZING:
                return "Zing Card";
                break;
            case Payment.GOLD_ZALO:
                return "Zalo Pay";
                break;
            case Payment.GOLD_IAP:
                if (cc.sys.os == cc.sys.OS_IOS)
                    return "Apple Store";
                else
                    return "Google";
                break;
            case Payment.GOLD_SMS:
                return "SMS";
                break;
        }
    }
});
GUISystemBonus.className = "GUISystemBonus";
GUISystemBonus.tag = 504;

var GUIGBonus = BaseLayer.extend({

    ctor: function () {
        this.nodeKM = null;
        this.typeKM = 0;

        this._super("GUIGBonus");
        this.initWithBinaryFile("GUIGBonus.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customizeButton("btnOK", 1, this._bg);
        this.customizeButton("btnClose", 0, this._bg);

        this.nodeKM = this._bg.getChildByName("bonus");
        this.labelBonus = this.getControl("labelBonus", this._bg);
        this.labelTime = this.getControl("labelTime", this._bg);

        this.lbTimeRemain = new RichLabelText();
        this._bg.addChild(this.lbTimeRemain);
        this.enableFog();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        this.loadInfo();
    },

    onButtonRelease: function (button, id) {
        this.onClose();

        if (id == 1) {
            //sceneMgr.openScene(ShopScene.className);
            var idTab = gamedata.gameConfig.getMaxChannelGBonus();
            gamedata.openNapGInTab(idTab);
        }
        popUpManager.removePopUp(PopUpManager.SHOP_BONUS);
    },

    loadInfo: function () {
        var arrayBonus = gamedata.gameConfig.getMaxShopGBonus();
        this.labelBonus.setString(arrayBonus[arrayBonus.length - 1] + "%");

        var txts = [];
        txts.push({"text": localized("APPLY_FOR"), "color": cc.color(235, 233, 165), "size": 15});
        if (arrayBonus.length > 2) {
            txts.push({
                "text": " " + this.getNameShop(arrayBonus[0]),
                "font": SceneMgr.FONT_BOLD,
                "color": cc.color(255, 255, 255, 0),
                "size": 15
            });
            txts.push({"text": localized("AND"), "color": cc.color(237, 233, 165, 0), "size": 15});
            for (var i = 1; i < arrayBonus.length - 1; i++) {
                var s;
                if (i < 2) {
                    s = " " + this.getNameShop(arrayBonus[i])
                } else {
                    s = ", " + this.getNameShop(arrayBonus[i]);
                }
                txts.push({
                    "text": s,
                    "font": SceneMgr.FONT_BOLD,
                    "color": cc.color(255, 255, 255, 0),
                    "size": 15
                });
            }
        } else {
            txts.push({
                "text": " " + this.getNameShop(arrayBonus[0]),
                "font": SceneMgr.FONT_BOLD,
                "color": cc.color(255, 255, 255, 0),
                "size": 15
            });
        }

        this.removeChild(this.lbTimeRemain);
        this.lbTimeRemain = new RichLabelText();
        this.lbTimeRemain.setText(txts);
        this._bg.addChild(this.lbTimeRemain);
        this.lbTimeRemain.setPosition(this._bg.getContentSize().width * 0.89 - this.lbTimeRemain.getWidth(), 20);
        var s = localized("TIME_BONUS");
        s = StringUtility.replaceAll(s, "@time1", gamedata.gameConfig.bonusStartDateG);
        s = StringUtility.replaceAll(s, "@time2", gamedata.gameConfig.bonusEndDateG);
        this.labelTime.setString(s);
    },

    getNameShop: function (id) {
        switch (id) {
            case Payment.G_ATM:
                return "ATM";
                break;
            case Payment.G_CARD:
                return "Card";
                break;
            case Payment.G_ZING:
                return "Zing Card";
                break;
            case Payment.G_ZALO:
                return "Zalo Pay";
                break;
            case Payment.G_IAP:
                if (cc.sys.os == cc.sys.OS_IOS)
                    return "Apple Store";
                else
                    return "Google";
                break;

        }
    }
});
GUIGBonus.className = "GUIGBonus";
GUIGBonus.tag = 505;

var ZingCardPanel = BaseLayer.extend({

    ctor: function () {
        this.btnPurchase = null;

        this.txCard = null;
        this.txSerial = null;

        this._super("ZingCardPanel");
        this.initWithBinaryFile("ZingCardPanel.json");
    },

    initGUI: function () {
        this._layout.setScale(this._scale);

        this.pZingCardSMS = this.getControl("pZingCardSMS");
        this.pZingCardSMS.setVisible(false);

        this.pEventBonus = this.getControl("pEventBonus");
        this.pEventBonus.loadTexture("res/Event/SecretTowerUI/event_bonus_card.png");
        this.pEventBonus.setVisible(false);

        this.btnPurchase = this.customButton("purchase", ZingCardPanel.BTN_PURCHASE);
        this.btnStore = this.customButton("store", ZingCardPanel.BTN_STORE);
        this.btnSMS = this.customButton("sms", ZingCardPanel.BTN_SMS);

        this.pInput = this.getControl("pInput");

        var tfCard = this.getControl("txcard", this.pInput);
        var tfSerial = this.getControl("txseri", this.pInput);

        if (cc.sys.isNative) {
            tfCard.setVisible(false);
            this.txCard = BaseLayer.createEditBox(tfCard);
            this.txCard.setTag(AccountInputUI.TF_USERNAME);
            this.txCard.setDelegate(this);
            this.txCard.setPosition(tfCard.getPosition());
            this.pInput.addChild(this.txCard);

            tfSerial.setVisible(false);
            this.txSerial = BaseLayer.createEditBox(tfSerial);
            this.txSerial.setTag(AccountInputUI.TF_USERNAME);
            this.txSerial.setDelegate(this);
            this.txSerial.setPosition(tfSerial.getPosition());
            this.pInput.addChild(this.txSerial);
        } else {
            this.txCard = tfCard;
            this.txSerial = tfSerial;
        }
    },

    updateInfo: function () {
        this.pEventBonus.setVisible(false);
    },

    updateButton: function (visible) {
        //this.btnPurchase.setVisible(visible);
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case ZingCardPanel.BTN_PURCHASE : {
                if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_FAKE_SMS) {
                    var card = this.txCard.getString();
                    iapHandler.fakePayment(parseInt(card), Constant.G_ZING);
                } else {
                    var card = this.txCard.getString();
                    var seri = this.txSerial.getString();

                    if (card == "") {
                        sceneMgr.showOKDialog(LocalizedString.to("GUI_ADD_G_INPUT_CODE"));
                        return;
                    } else if (seri == "") {
                        sceneMgr.showOKDialog(LocalizedString.to("GUI_ADD_G_INPUT_SERI"));
                        return;
                    } else {
                        //var cmd = new CmdSendPurchaseCard();
                        //cmd.putData(this.curCardSelect, card, seri);
                        //GameClient.getInstance().sendPacket(cmd);

                        iapHandler.purchaseCard(PanelCard.BTN_ZING, card, seri);
                        this.updateButton(false);
                    }
                }

                break;
            }
            case ZingCardPanel.BTN_STORE : {
                NativeBridge.openURLNative(ZingCardPanel.STORE_URL);
                break;
            }
            case ZingCardPanel.BTN_SMS: {
                sceneMgr.openGUI(ZingCardSMSGUI.className, 200, 200);
                break;
            }
        }
    }
});
ZingCardPanel.BTN_PURCHASE = 1;
ZingCardPanel.BTN_STORE = 2;
ZingCardPanel.BTN_SMS = 3;
ZingCardPanel.SMS = [
    {
        id: 0,
        image: "res/Lobby/ShopIAP/zingcard_0.png",
        cost: 11500,
        value: 10000,
        syntax: "ZINGXU 10000",
        currency: "vnd",
        phone: "9150"
    },
    {
        id: 1,
        image: "res/Lobby/ShopIAP/zingcard_1.png",
        cost: 23000,
        value: 20000,
        syntax: "ZINGXU 20000",
        currency: "vnd",
        phone: "9150"
    },
    {
        id: 2,
        image: "res/Lobby/ShopIAP/zingcard_2.png",
        cost: 57500,
        value: 50000,
        syntax: "ZINGXU 50000",
        currency: "vnd",
        phone: "9150"
    },
    {
        id: 3,
        image: "res/Lobby/ShopIAP/zingcard_2.png",
        cost: 115000,
        value: 100000,
        syntax: "ZINGXU 100000",
        currency: "vnd",
        phone: "9150"
    }
];
ZingCardPanel.STORE_URL = "https://zingplay.com/zcard";

var ZingCardSMSGUI = BaseLayer.extend({

    ctor: function () {
        this._super("ZingCardSMSGUI");
        this.initWithBinaryFile("ZingCardSMSGUI.json");
    },

    initGUI: function () {
        var p = this.getControl("bg");
        this._bg = p;

        this.customButton("close", 1, p);

        var list = this.getControl("list", p);

        this.tbList = new cc.TableView(this, list.getContentSize());
        this.tbList.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.tbList.setPosition(list.getPosition());
        this.tbList.setVerticalFillOrder(0);
        this.tbList.setDelegate(this);
        p.addChild(this.tbList);
        this.tbList.reloadData();

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
        if (!cc.sys.isNative) {
            this.tbList.setTouchEnabled(true);
        }
    },

    onButtonRelease: function (btn, id) {
        this.onClose();
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ZingCardCell(this);
        }
        cell.setInfo(ZingCardPanel.SMS[idx]);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(505, 80);
    },

    numberOfCellsInTableView: function (table) {
        return ZingCardPanel.SMS.length;
    },

    tableCellTouched: function (table, cell) {
        var idx = cell.getIdx();
        var networkInfo = gamedata.getNetworkTelephone();
        if (networkInfo == Constant.ID_VIETTEL) {
            this.sendSMS(idx);
        } else {
            sceneMgr.showOkCancelDialog("Tin nhắn mua thẻ chỉ dành cho thuê bao Viettel ! \n Bạn có muốn tiếp tục không ?", this, function (btnID) {
                if (btnID == Dialog.BTN_OK) {
                    this.sendSMS(idx);
                }
            }.bind(this));
        }
    },

    sendSMS: function (idx) {
        try {
            var inf = ZingCardPanel.SMS[idx];
            if (inf) {
                NativeBridge.sendSMS(inf.phone, inf.syntax);
            }

            this.onBack();
        } catch (e) {

        }
    },

    onBack: function () {
        this.onClose();
    }
});
ZingCardSMSGUI.className = "ZingCardSMSGUI";

var ZingCardCell = cc.TableViewCell.extend({

    ctor: function (p) {
        this._super();

        this.tParent = p;

        var jsonLayout = ccs.load("ZingCardSMSItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.item = ccui.Helper.seekWidgetByName(this._layout, "item");
        this.value = ccui.Helper.seekWidgetByName(this._layout, "value");
        this.cost = ccui.Helper.seekWidgetByName(this._layout, "cost");
        this.phone = ccui.Helper.seekWidgetByName(this._layout, "phone");
        this.syntax = ccui.Helper.seekWidgetByName(this._layout, "syntax");
        this.currency = ccui.Helper.seekWidgetByName(this._layout, "currency");
    },

    setInfo: function (inf) {
        cc.log("Info : " + JSON.stringify(inf));

        this.item.loadTexture(inf.image);
        this.value.setString(StringUtility.pointNumber(inf.value));
        this.cost.setString(StringUtility.pointNumber(inf.cost));
        this.syntax.setString(inf.syntax);
        this.phone.setString(inf.phone);
        this.currency.setString(inf.currency);
    }
});

var WaitingPopup = cc.Node.extend({

    ctor: function (txt) {
        this._super();

        this.timeout = 0;

        this.bg = null;
        this.img = null;
        this.txt = null;

        this.bg = ccui.Scale9Sprite.create("Lobby/Common/9patch.png");
        this.addChild(this.bg);
        this.bg.setOpacity(180);

        this.img = cc.Sprite.create("common/circlewait.png");
        this.addChild(this.img);

        this.txt = BaseLayer.createLabelText();
        this.txt.setString("");
        this.addChild(this.txt);

        this.txt.setString(txt);

        this.img.stopAllActions();
        this.img.runAction(cc.repeatForever(cc.rotateBy(1.2, 360)));

        var w = this.txt.getContentSize().width + this.img.getContentSize().width;
        w *= 1.2;
        var h = this.img.getContentSize().height;
        h *= 2;

        this.bg.setPreferredSize(cc.size(w, h));

        this.img.setPositionX(-w / 2 + this.img.getContentSize().width / 1.5);
        this.txt.setPositionX(this.img.getPositionX() + this.img.getContentSize().width / 1.5 + this.txt.getContentSize().width / 2);
    },

    setTimeout: function (t) {
        if (t)
            this.runAction(cc.sequence(cc.delayTime(t), cc.removeSelf()));
    }
});
WaitingPopup.show = function (txt, timeout) {
    WaitingPopup.clear();

    var p = new WaitingPopup(txt);
    p.setTimeout(timeout);
    p.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
    sceneMgr.layerGUI.addChild(p, 1308, 1308);
};
WaitingPopup.clear = function () {
    var p = sceneMgr.layerGUI.getChildByTag(1308);
    if (p) {
        p.removeFromParent();
    }
};

var SmsSyntaxPopup = BaseLayer.extend({
    ctor: function () {
        this._super("SmsSyntaxPopup");
        this.initWithBinaryFile("SmsSyntaxPopup.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");
        this.customButton("btnClose", 1, this._bg);

        this.syntaxLb = this.getControl("syntax", this._bg);

        this.numberLb = this.getControl("number", this._bg);
    },

    setSyntax: function (syntax, number) {
        this.syntaxLb.setString(syntax);
        this.numberLb.setString(number);
    },

    onEnterFinish: function () {
        this.setFog(true);
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (btn, id) {
        this.onClose();
    }
});
SmsSyntaxPopup.className = "SmsSyntaxPopup";
SmsSyntaxPopup.tag = 504;


var ShopData = cc.Class.extend({

    ctor: function () {
        this.arrayShopData = [];
    },

    initShopData: function () {
        this.initShopGData();
        this.initShopGoldData();
    },

    initShopGoldData: function () {
        cc.log("INIT SHOP GOLD DATA ** ");
        // tab gold<-> gPlay
        this.initShopGoldOneData(Payment.GOLD_IAP, 6, cc.color(213, 188, 40, 0));
        // tab gold <-> G
        this.initShopGoldOneData(Payment.GOLD_G, 6, cc.color(213, 188, 40, 0));
        // tab gold <-> sms
        this.initShopGoldOneData(Payment.GOLD_SMS_VIETTEL, 6, cc.color(213, 188, 40, 0));
        this.initShopGoldOneData(Payment.GOLD_SMS_MOBI, 6, cc.color(213, 188, 40, 0));
        this.initShopGoldOneData(Payment.GOLD_SMS_VINA, 6, cc.color(213, 188, 40, 0));
        // tab gold <-> ATM
        this.initShopGoldOneData(Payment.GOLD_ATM, 6, cc.color(213, 188, 40, 0));
        // tab gold <-> Zalo
        this.initShopGoldOneData(Payment.GOLD_ZALO, 6, cc.color(213, 188, 40, 0));
        // tab gold <-> Zing
        this.initShopGoldOneData(Payment.GOLD_ZING, 6, cc.color(213, 188, 40, 0));
        //event.initTabGoldData(this);
        cc.log("ARAY DATA SHOP *************** " + JSON.stringify(this.arrayShopData));
    },

    initShopGoldOneData: function (type, maxSize, color) {
       // cc.log("TYPE PAYMENT SHOP DATA " + type);
        var src = [];
        var goldIap = gamedata.gameConfig.getShopGoldById(type);
        var objOffer = this.initOfferData(type);
        if (objOffer != undefined && objOffer != null) {

            for (var i = 0; i < objOffer.length; i++) {
                src.push(objOffer[i]);
            }
        }
        if (goldIap) {
            var isOfferNoPrice = false;
            var promoDailyPurchase = type != Payment.GOLD_G;
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
                obj.img = "ShopIAP/coin" + idx + ".png";
                obj.id = i;
                obj.goldColor = color;
                var missionObj;
                var typeGetBonus = type;
                switch (type) {
                    case Payment.GOLD_IAP:
                        missionObj = gamedata.gameConfig.getIsFirstGoldIAP(packageShop["value"]);
                        break;
                    case Payment.GOLD_ZING:
                        missionObj = gamedata.gameConfig.getIsFirstGoldZing(packageShop["value"]);
                        break;
                    case Payment.GOLD_ZALO:
                        missionObj = gamedata.gameConfig.getIsFirstGoldZalo(packageShop["value"]);
                        break;
                    case Payment.GOLD_ATM:
                        missionObj = gamedata.gameConfig.getIsFirstGoldATM(packageShop["value"]);
                        break;
                    case Payment.GOLD_G:
                        missionObj = gamedata.gameConfig.getIsFirstGoldG(packageShop["value"]);
                        break;
                    case Payment.GOLD_SMS_VIETTEL:
                    case Payment.GOLD_SMS_VINA:
                    case Payment.GOLD_SMS_MOBI:
                        missionObj = gamedata.gameConfig.getIsFirstGoldSMSnew(type, packageShop["value"]);
                        typeGetBonus = Payment.GOLD_SMS;
                        break;
                }
                this.initInfoPackageGold(obj, goldIap, packageShop, missionObj, isIap);
                obj.type = typeGetBonus;
                //obj.bonusGachaCoin = event.getEventBonusTicket(typeGetBonus, obj.cost);
                //if (type === Payment.GOLD_SMS_VINA && obj.cost > 20000){
                //    continue;
                //}

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
          //  cc.log("DATA OFFER " + JSON.stringify(offer));
            if (offer.isNoPrice())
                continue;
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
            var goldIap = gamedata.gameConfig.getShopGoldById(typePayment);

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
        var goldIap = gamedata.gameConfig.getShopGById(type);
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
                obj.img = "ShopIAP/xu" + idx + ".png";
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
        var vipIndex = NewVipManager.getInstance().getRealVipLevel();
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
})
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