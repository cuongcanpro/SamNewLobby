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
        var arrayConfigTicket = eventMgr.getArrayConfigTicket();
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
                config = paymentMgr.getShopGoldById(i);
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
            var config = paymentMgr.getShopGoldById(idPaymentCheck);
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
        var arrayConfigTicket = eventMgr.getArrayConfigTicket();
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
            var image = new cc.Sprite("ShopIAP/btnGoogle.png");
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
        if (eventMgr.promoTicket > 0) {
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
        return eventMgr.getArrayConfigTicket().length;
    }
});