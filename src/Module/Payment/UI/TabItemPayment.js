TabItemPayment = cc.Layer.extend({
    ctor: function(panelSize) {
        this._super();
        this.panelSize = panelSize; //size of this tab
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
        this.bgChannel = new cc.Sprite("res/Lobby/Common/bgColumn.png");
        this.addChild(this.bgChannel);
        this.bgChannel.setScaleX(cc.winSize.width / this.bgChannel.getContentSize().width);
        this.bgChannel.setPosition(cc.winSize.width * 0.5, this.panelSize.height - this.bgChannel.getContentSize().height * 0.5);

        var heightTableView = this.panelSize.height - this.bgChannel.getContentSize().height;
        this.listButton = new ccui.ListView();
        this.listButton.setAnchorPoint(cc.p(0, 0));
        this.listButton.setPosition(0, heightTableView);
        this.listButton.setContentSize(cc.size(cc.winSize.width, this.bgChannel.getContentSize().height));
        this.listButton.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        this.listButton.setBounceEnabled(true);
        this.listButton.setScrollBarEnabled(false);
        for (var i = 0; i < this.arrayButtonId.length; i++){
            var tabId = this.arrayButtonId[i];
            var panel = new ccui.Layout();
            panel.setContentSize(210, this.bgChannel.getContentSize().height);

            var tabImage = new cc.Sprite(this.getButtonImage(tabId));
            tabImage.setPosition(tabImage.width/2, this.bgChannel.getContentSize().height * 0.5);
            tabImage.setTag(1);

            var effect = db.DBCCFactory.getInstance().buildArmatureNode("IconHot");
            effect.setPosition(tabImage.getContentSize().width * 0.6, tabImage.getContentSize().height);
            effect.setScale(1.5);
            //effect.setTag(2);
            effect.getAnimation().gotoAndPlay("1", -1, -1, -1);
            effect.setVisible(false);

            panel.addChild(tabImage);
            panel.addChild(effect);

            this.imgHot = new cc.Sprite("Lobby/ShopIAP/iconHot.png");
            panel.addChild(this.imgHot, 2, 2);
            this.imgHot.setPosition(29, 40);
            this.imgHot.setVisible(false);

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
        this.pPreview.setScale(heightTableView / this.pPreview.height);
        this.pPreview.setPosition(cc.winSize.width - this.pPreview.width * this.pPreview.getScale(), 0);
        this.pPreview.setLocalZOrder(1);
        this.addChild(this.pPreview);
        this.initPanelPreview();

        //init item list
        this.tbItemSize = cc.size(this.panelSize.width - (this.pPreview.width - 10) * this.pPreview.getScale() - 10, heightTableView);
        this.initPItem(this.tbItemSize);
        this.pItem = new cc.TableView(this, this.tbItemSize);
        this.pItem.setAnchorPoint(cc.p(0, 0));
        this.pItem.setPosition( 5, 0);
        this.pItem.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.pItem.setVerticalFillOrder(0);
        this.pItem.setDelegate(this);
        this.addChild(this.pItem);

        this.itemHighlight = new cc.Sprite("ShopIAP/ShopItem/itemHighlight.png");
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
        cc.log("ON ENTER FINISH TAB ITEM ");
        StorageManager.getInstance().sendGetShopItemConfig();

        try {
            this.pPreview.avatar.asyncExecuteWithUrl(userMgr.getUserName(), userMgr.getAvatar());
        } catch (e) {}

        var avatarFramePath = StorageManager.getInstance().getUserAvatarFramePath();
        if (avatarFramePath != "")
            this.pPreview.avatarFrame.setTexture(avatarFramePath);
        else this.pPreview.avatarFrame.setTexture(null);

        //select tab
        this.selectedItemId = {};
        cc.log("KHOI TAO SELECTED ITEM " + JSON.stringify(this.selectedItemId));
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
                                countA += Number(VipManager.getInstance().getRealVipLevel() < conditions[i].num);
                                break;
                            case StorageManager.LEVEL_CONDITION:
                                countA += Number(userMgr.getLevel() < conditions[i].num);
                                break;
                        }
                    }

                    conditions = shopItemConfig[b.type].listItem[b.id].conditions;
                    for (var i = 0; i < conditions.length; i++){
                        switch(conditions[i].type){
                            case StorageManager.VIP_CONDITION:
                                countB += Number(VipManager.getInstance().getRealVipLevel() < conditions[i].num);
                                break;
                            case StorageManager.LEVEL_CONDITION:
                                countB += Number(userMgr.getLevel() < conditions[i].num);
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
            item.name = StorageManager.getItemName(data.type,data.id);
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
            item.scale = item.scale * 1.3;
            items.push(item);
        }
        cell.setData(items);
        return cell;
    },

    tableCellSizeForIndex: function(table, idx) {
        return cc.size(this.pItem.getContentSize().width, ShopItemCell.HEIGHT * this.itemScale + this.itemSpace);
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
        imageResource = "Lobby/ShopIAP/ShopItem/" + imageResource;
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
        this.pPreview.avatar.setScale(1.85);
        this.pPreview.avatarBg.addChild(this.pPreview.avatar);
        this.pPreview.avatarFrame = new cc.Sprite();
        this.pPreview.avatarFrame.setPosition(this.pPreview.avatarBg.width/2, this.pPreview.avatarBg.height/2);
        this.pPreview.avatarFrame.setScale(0.9);
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
        this.pPreview.name = this.pPreview.getChildByName("name");
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
        this.pPreview.bgNum = this.pPreview.pNum.getChildByName("bgNum");
        this.pPreview.btnAdd = this.pPreview.bgNum.getChildByName("btnAdd");
        this.pPreview.btnSub = this.pPreview.bgNum.getChildByName("btnSub");
        this.pPreview.btnFive = this.pPreview.bgNum.getChildByName("btnFive");
        this.pPreview.selectedNum = this.pPreview.bgNum.getChildByName("num");
        this.pPreview.selectedNum.ignoreContentAdaptWithSize(true);
        this.pPreview.labelNum = this.pPreview.pNum.getChildByName("labelNum");

        this.pPreview.btnInfo = this.pPreview.getChildByName("btnInfo");
        this.pPreview.lock = this.pPreview.descriptionBg.getChildByName("lock");

        this.pPreview.pDes = this.pPreview.descriptionBg.getChildByName("pDes");
        this.pPreview.exprireTime = this.pPreview.pDes.getChildByName("expireTime");
        this.pPreview.exprireTime.ignoreContentAdaptWithSize(true);
        this.pPreview.exprireTime.defaultPosition = this.pPreview.exprireTime.getPosition();

        this.pPreview.btnAdd.addTouchEventListener(this.onAddPreviewItemNum.bind(this), this);
        this.pPreview.btnSub.addTouchEventListener(this.onSubPreviewItemNum.bind(this), this);
        this.pPreview.btnFive.addTouchEventListener(this.onFivePreviewItemNum.bind(this), this);
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
        this.pPreview.name.setVisible(!!itemData);
        if (!itemData) return;
        //set common data
        this.pPreview.name.setString(itemData.name);
        switch(itemData.type){
            case StorageManager.TYPE_AVATAR:
                this.pPreview.avatarBg.setVisible(true);
                this.pPreview.avatarFrame.setVisible(false);
                var avatarSprite = new cc.Sprite(StorageManager.getItemIconPath(StorageManager.TYPE_AVATAR, null, this.previewItemData.id));
                avatarSprite.setPosition(this.pPreview.pItem.width/2, this.pPreview.pItem.height * 0.55);
                avatarSprite.setScale(1.0);
                avatarSprite.setTag(1);
                this.pPreview.pItem.addChild(avatarSprite);
                break;
            case StorageManager.TYPE_INTERACTION:
                this.pPreview.avatarBg.setVisible(true);
                var animList = StorageManager.getInteractPreviewAnimList(itemData.id);
                if (animList.length > 0){
                    if (false) {
                        var anim = animList[0];
                        var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim[0]);
                        eff.setPosition(this.pPreview.pItem.width / 2, this.pPreview.pItem.height / 2);
                        eff.setScale(0.8);
                        this.pPreview.pItem.addChild(eff, 0, 1);
                        eff.getAnimation().gotoAndPlay(anim[1], -1, -1, 0);
                    }
                    else{
                        this.pPreview.pItem.animIndex = 0;
                        this.pPreview.pItem.animList = animList;
                        this.pPreview.pItem.timer = 0;
                        this.pPreview.pItem.curDuration = 0;
                        var callback = function(dt) {
                            this.timer += dt;
                            if (this.timer >= this.curDuration){
                                this.timer = 0;
                                this.removeChildByTag(1);
                                var anim = this.animList[this.animIndex];
                                this.animIndex = (this.animIndex + 1) % this.animList.length;
                                var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim[0]);
                                eff.setPosition(this.width / 2, this.height / 2);
                                eff.setScale(0.8);
                                this.addChild(eff, 0, 1);
                                eff.getAnimation().gotoAndPlay(anim[1], -1, -1, 1);
                                this.curDuration = eff.getAnimation().getLastAnimationState().getTotalTime();
                                eff.setOpacity(255);
                                eff.stopAllActions();
                                eff.setVisible(false);
                                eff.runAction(cc.sequence(
                                    cc.delayTime(1/60),
                                    cc.show(),
                                    cc.delayTime(this.curDuration * 0.8),
                                    cc.fadeOut(this.curDuration * 0.2),
                                    cc.delayTime(1)
                                ));
                                this.curDuration += 1;
                            }
                        }.bind(this.pPreview.pItem);
                        this.pPreview.pItem.schedule(callback);
                    }
                }
                break;
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
                    if (VipManager.getInstance().getRealVipLevel() < condition.num) {
                        conditions.push(condition);
                    }
                    break;
                case StorageManager.LEVEL_CONDITION:
                    if (userMgr.getLevel() < condition.num) {
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
            this.previewItemData.maxNum = Math.floor(userMgr.getDiamond() / this.previewItemData.options[0].price);
        }

        if (selectedNum < 1) selectedNum = 1;
        if (selectedNum > this.previewItemData.maxNum) selectedNum = this.previewItemData.maxNum;
        this.previewItemData.selectedNum = Math.max(1, selectedNum);
        this.pPreview.selectedNum.setString(StringUtility.standartNumber(this.previewItemData.selectedNum));
        var w = this.pPreview.selectedNum.x + this.pPreview.selectedNum.getAutoRenderSize().width;
        this.pPreview.labelNum.setPositionX(this.pPreview.pNum.width/2 - w/2);
        this.setPreviewDiamond(this.previewItemData.options[0].price * this.previewItemData.selectedNum);

        this.pPreview.btnSub.setEnabled(this.previewItemData.maxNum > 0 && this.previewItemData.selectedNum > 1);
        this.pPreview.btnAdd.setEnabled(this.previewItemData.maxNum > 0 && this.previewItemData.selectedNum < this.previewItemData.maxNum);
        this.pPreview.btnFive.setEnabled(this.previewItemData.maxNum >= 5);

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

        this.setPreviewBtnBuyEnabled(diamond <= userMgr.getDiamond());
    },

    setPreviewBtnBuyEnabled: function(enabled) {
        this.pPreview.btnBuy.setEnabled(enabled);
        this.pPreview.iconCondition.getVirtualRenderer().setState(enabled ? 0 : 1);
        this.pPreview.iconDiamond.getVirtualRenderer().setState(enabled ? 0 : 1);
        // this.pPreview.condition.enableOutline(enabled ? cc.color("#FF9700") : cc.color("#949494"), 1);
        // this.pPreview.diamond.enableOutline(enabled ? cc.color("#FF9700") : cc.color("#949494"), 1);
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

    onFivePreviewItemNum: function(button, type) {
        switch(type){
            case ccui.Widget.TOUCH_ENDED:
                this.setPreviewNumInfo(this.previewItemData.selectedNum + 5);
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

    /* endregion Panel Preview */
});

TabItemPayment.BTN_TAB_AVATAR = 0;
TabItemPayment.BTN_TAB_INTERACTION = 1;
TabItemPayment.BTN_TAB_EMOTICON = 2;
TabItemPayment.BTN_TAB_VOUCHER = 3;
TabItemPayment.TOOLTIP_PADDING = 10;