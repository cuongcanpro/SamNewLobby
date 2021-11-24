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
        if (gamedata.gameConfig.arrayShopGConfig[id] == null) id = 0;
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
            var image = new cc.Sprite("ShopIAP/btnGoogle.png");
            cell.addChild(image);
            image.setTag(1);
            image.setPosition(image.getContentSize().width * 0.5, 35);
            this.arrayButton.push(image);

            var effect = new cc.Sprite("ShopIAP/icon_hot_bonus.png");
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