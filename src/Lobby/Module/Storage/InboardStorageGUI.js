var InboardStorageGUI = BaseLayer.extend({
    ctor: function() {
        this._super(InboardStorageGUI.className);
        this.tabBtnActive = [];
        this.tabBtnInactive = [];

        this.bg = null;
        this.btnClose = null;
        this.btnUse = null;
        this.btnUnuse = null;

        this.labelNoItem = null;
        this.descriptionView = null;
        this.itemName = null;
        this.itemDescription = null;
        this.itemExpiredDate = null;
        this.tabName = null;

        this.pItemPreview = null;
        this.avatarBg = null;
        this.avatar = null;
        this.avatarFrame = null;

        this.pItem = null;
        this.tbItem = null;
        this.labelMess = null;
        this.tabBtnList = null;

        this.readyToUse = false;
        this.selectedTab = -1;
        this.itemData = {};
        this.selectedItem = {};
        this.arrayButtonId = [
            InboardStorageGUI.BTN_AVATAR_TAB,
            InboardStorageGUI.BTN_INTERACTION_TAB,
            InboardStorageGUI.BTN_EMOTICON_TAB,
            InboardStorageGUI.BTN_VOUCHER_TAB
        ];

        this.initWithBinaryFile("Lobby/InboardStorageGUI.json");
    },

    /* region Base Flows */
    initGUI: function() {
        this.btnClose = this.customButton("btnClose", InboardStorageGUI.BTN_CLOSE);
        this.bg = this.getControl("bg");
        this.bg.defaultPosition = this.bg.getPosition();
        this.bg.setCascadeOpacityEnabled(true);
        this.customButton("btnClose", InboardStorageGUI.BTN_CLOSE, this.bg);

        this.tabBtnList = this.getControl("btnList", this.bg);
        this.tabBtnList.setScrollBarEnabled(false);
        this.pItem = this.getControl("itemPanel");
        this.initPItem();
        this.previewBg = this.getControl("previewBg");
        this.previewBg.setLocalZOrder(1);

        //TOP BAR
        this.tabName = this.getControl("labelTabName", this.bg);
        this.tabName.ignoreContentAdaptWithSize(true);

        //BTN LIST
        var tabs = [
            this.getControl("tabAvatar", this.tabBtnList),
            this.getControl("tabInteraction", this.tabBtnList),
            this.getControl("tabEmoticon", this.tabBtnList),
            this.getControl("tabVoucher", this.tabBtnList)
        ];
        for (var i = 0; i < tabs.length; i++){
            this.tabBtnActive.push(this.customButton("active", this.arrayButtonId[i], tabs[i]));
            this.tabBtnInactive.push(this.customButton("inactive", this.arrayButtonId[i], tabs[i]));
        }

        //PREVIEW PANEL
        this.btnUse = this.customButton("btnUse", InboardStorageGUI.BTN_USE, this.previewBg);
        this.btnUnuse = this.customButton("btnUnuse", InboardStorageGUI.BTN_UNUSE, this.previewBg);
        this.btnUnuse.setVisible(false); this.btnUnuse.setEnabled(false);
        this.pItemPreview = this.getControl("itemPreview", this.previewBg);
        this.avatarBg = this.getControl("avatarBg", this.previewBg);
        this.descriptionBg = this.getControl("descriptionBg", this.previewBg);
        this.descriptionView = this.getControl("textView", this.descriptionBg);
        this.descriptionView.setScrollBarEnabled(false);
        this.itemName = this.getControl("title", this.descriptionView);
        this.itemName.ignoreContentAdaptWithSize(true);
        this.itemName.setAnchorPoint(0, 1);
        this.itemDescription = this.getControl("des", this.descriptionView);
        this.itemDescription.ignoreContentAdaptWithSize(true);
        this.itemDescription.setAnchorPoint(0, 1);
        this.itemExpiredDate = this.getControl("time", this.descriptionView);
        this.itemExpiredDate.ignoreContentAdaptWithSize(true);
        this.itemExpiredDate.setAnchorPoint(0, 1);
        this.labelNoItem = this.getControl("labelNone", this.previewBg);
        this.avatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.avatar.setPosition(this.avatarBg.width/2, this.avatarBg.height/2);
        this.avatar.setScale(1.975);
        this.avatarBg.addChild(this.avatar);
        this.avatarFrame = new UIAvatarFrame();
        this.avatarFrame.setPosition(this.avatarBg.width/2, this.avatarBg.height/2);
        this.avatarFrame.setScale(0.95);
        this.avatarBg.addChild(this.avatarFrame);

        //ITEM PANEL
        this.tbItem = new cc.TableView(this, this.pItem.getContentSize());
        this.tbItem.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.tbItem.setAnchorPoint(0, 0);
        this.tbItem.setPosition(0, 0);
        this.tbItem.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.tbItem.setDelegate(this);
        this.tbItem.setCascadeOpacityEnabled(true);
        this.tbItem.getContainer().setCascadeOpacityEnabled(true);
        this.pItem.addChild(this.tbItem);
        this.labelMess = this.getControl("mess", this.pItem);
        this.labelMess.ignoreContentAdaptWithSize(true);
        this.imgMess = this.getControl("messImg", this.pItem);
        this.imgMess.ignoreContentAdaptWithSize(true);

        this.itemHighlight = new cc.Sprite("Storage/itemHighlight.png");
        this.itemHighlight.retain();
        this.itemHighlight.setPosition(StorageItemCell.HIGHLIGHT_POS);
        this.itemHighlight.setScale(StorageItemCell.HIGHLIGHT_SCALE);

        this.setBackEnable(true);
    },

    initPItem: function() {
        var totalWidth = this.pItem.getContentSize().width;
        this.numCol = InboardStorageGUI.NUM_COL;
        this.itemScale = (totalWidth - (this.numCol+1) * StorageItemCell.MIN_SPACE) / (this.numCol * StorageItemCell.WIDTH);
        this.itemSpace = StorageItemCell.MIN_SPACE;
        if (this.itemScale >= 1){
            this.itemScale = totalWidth/(this.numCol * StorageItemCell.WIDTH + (this.numCol+1) * StorageItemCell.MIN_SPACE);
            this.itemSpace = StorageItemCell.MIN_SPACE * this.itemScale;
        }
    },

    onEnterFinish: function() {
        this.readyToUse = false;
        this.onUpdateGUI();
        this.selectTab(this.selectedTab);
    },

    onUpdateGUI: function() {
        //reset selected
        this.resetSelectedItem();

        // update avatar
        try {
            this.avatar.asyncExecuteWithUrl(GameData.getInstance().userData.zName, GameData.getInstance().userData.avatar);
        } catch (e) {}
        this.avatarFrame.reload();

        this.itemData = {};
        for (var i = 0; i < this.arrayButtonId.length; i++)
            this.itemData[this.arrayButtonId[i]] = [];

        var itemConfig = StorageManager.getInstance().itemConfig;
        var userItemInfo = StorageManager.getInstance().userItemInfo;
        if (itemConfig && userItemInfo) {
            //tab avatar
            var avatarInfo = userItemInfo[StorageManager.TYPE_AVATAR];
            for (var avatarId in avatarInfo) {
                if (!itemConfig[StorageManager.TYPE_AVATAR][avatarId].enable) continue;
                var item = {
                    type: StorageManager.TYPE_AVATAR,
                    id: Number(avatarId),
                    index: 0
                };
                if (avatarInfo[avatarId][0].status == StorageManager.AVATAR_STATUS.USING)
                    this.itemData[StorageScene.BTN_AVATAR_TAB].unshift(item);
                else
                    this.itemData[StorageScene.BTN_AVATAR_TAB].push(item);
            }

            //tab interaction
            var interactionInfo = userItemInfo[StorageManager.TYPE_INTERACTION];
            for (var interactionId in interactionInfo) {
                if (!itemConfig[StorageManager.TYPE_INTERACTION][interactionId].enable || interactionInfo[interactionId][0].num == 0) continue;
                this.itemData[StorageScene.BTN_INTERACTION_TAB].push({
                    type: StorageManager.TYPE_INTERACTION,
                    id: Number(interactionId),
                    index: 0
                });
            }

            //tab emoticon
            var emoticonInfo = userItemInfo[StorageManager.TYPE_EMOTICON];
            for (var emoticonId in emoticonInfo) {
                if (!itemConfig[StorageManager.TYPE_EMOTICON][emoticonId].enable) continue;
                this.itemData[StorageScene.BTN_EMOTICON_TAB].push({
                    type: StorageManager.TYPE_EMOTICON,
                    id: Number(emoticonId),
                    index: 0
                });
            }

            //tab voucher
            var voucherInfo = userItemInfo[StorageManager.TYPE_VOUCHER];
            var usingVouchers = [];
            for (var voucherId in voucherInfo) {
                if (!itemConfig[StorageManager.TYPE_VOUCHER][voucherId].enable) continue;
                for (var i in voucherInfo[voucherId]) {
                    var item = {
                        type: StorageManager.TYPE_VOUCHER,
                        id: Number(voucherId),
                        index: i
                    };
                    if (voucherInfo[voucherId][i].status == StorageManager.VOUCHER_STATUS.USING)
                        usingVouchers.push(item);
                    else
                        this.itemData[StorageScene.BTN_VOUCHER_TAB].push(item);
                }
            }
            this.itemData[StorageScene.BTN_VOUCHER_TAB] = usingVouchers.concat(this.itemData[StorageScene.BTN_VOUCHER_TAB]);
        }

        if (this.selectedTab != -1)
            this.selectTab(this.selectedTab);
    },

    resetSelectedItem: function() {
        for (var i = 0; i < this.arrayButtonId.length; i++)
            this.selectedItem[this.arrayButtonId[i]] = -1;
    },

    onErrorStorage: function() {
        this.tbItem.setVisible(false);
        this.labelMess.setVisible(true);
        this.labelMess.setString("Có lỗi xảy ra, vui lòng thử lại.");
        StringUtility.breakLabelToMultiLine(this.labelMess, this.pItem.width);
        this.imgMess.setVisible(true);
        this.imgMess.loadTexture("Storage/error.png");
    },

    onButtonRelease: function(button, id){
        if (!this.readyToUse) return;
        switch(id){
            case InboardStorageGUI.BTN_CLOSE:
                this.hide();
                break;
            case InboardStorageGUI.BTN_AVATAR_TAB:
            case InboardStorageGUI.BTN_INTERACTION_TAB:
            case InboardStorageGUI.BTN_EMOTICON_TAB:
            case InboardStorageGUI.BTN_VOUCHER_TAB:
                this.selectTab(id);
                break;
            case InboardStorageGUI.BTN_USE:
                this.useCurrentItem();
                break;
            case InboardStorageGUI.BTN_UNUSE:
                //currently do nothing
                break;
        }
    },

    onBack: function() {
        this.onButtonRelease(null, InboardStorageGUI.BTN_CLOSE);
    },
    /* endregion Base Flows */

    /* region Table Delegate */
    tableCellAtIndex: function(table, idx) {
        var cell = table.dequeueCell();
        if(!cell) cell = new StorageItemCell(this.numCol, this.itemScale, this.itemSpace, this.itemHighlight, this);
        var items = [];
        for (var i = idx * this.numCol; i < this.itemData[this.selectedTab].length && i < (idx + 1) * this.numCol; i++){
            var data = this.itemData[this.selectedTab][i];
            var item = {};
            var itemRef = StorageManager.getInstance().userItemInfo[data.type][data.id][data.index];
            item.isSelected = i == this.selectedItem[this.selectedTab];
            item.path = StorageManager.getItemIconPath(data.type, null, data.id);
            item.num = itemRef.num;
            switch(data.type) {
                case StorageManager.TYPE_AVATAR:
                    item.scale = 0.5;
                    item.isUsing = (itemRef.status == StorageManager.AVATAR_STATUS.USING);
                    item.num = null;
                    break;
                case StorageManager.TYPE_INTERACTION:
                    item.scale = 0.8;
                    break;
                case StorageManager.TYPE_EMOTICON:
                    item.scale = 0.8;
                    item.num = null;
                    break;
                case StorageManager.TYPE_VOUCHER:
                    item.scale = 0.75;
                    item.isUsing = (itemRef.status == StorageManager.VOUCHER_STATUS.USING);
                    item.num = null;
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
        if (this.selectedTab == -1 || !this.itemData[this.selectedTab]) return 0;
        else return Math.ceil(this.itemData[this.selectedTab].length / this.numCol);
    },
    /* endregion Table Delegate */

    /* region Select and Use */
    selectTab: function(id) {
        var oldSelectedTab = this.selectedTab;
        this.selectedTab = (id && id != -1) ? id : InboardStorageGUI.BTN_AVATAR_TAB;
        this.selectTabBtn(this.selectedTab, oldSelectedTab);

        var tabName = InboardStorageGUI.TAB_NAMES[this.selectedTab];
        this.tabName.stopAllActions();
        this.tabName.setOpacity(255);
        if (oldSelectedTab == -1 || oldSelectedTab == this.selectedTab)
            this.tabName.setString(tabName);
        else {
            this.tabName.runAction(cc.sequence(
                cc.fadeOut(0.1),
                cc.callFunc(function() {
                    this.setString(tabName);
                }.bind(this.tabName)),
                cc.fadeIn(0.1)
            ))
        }

        this.pItem.stopAllActions();
        this.pItem.setOpacity(255);
        var callback = function(){
            if (!StorageManager.getInstance().itemConfig) {
                this.onErrorStorage();
                this.resetSelectedItem();
            } else {
                this.tbItem.setVisible(true);
                if (!this.itemData[this.selectedTab] || this.itemData[this.selectedTab].length == 0) {
                    this.labelMess.setVisible(true);
                    this.labelMess.setString("Bạn không có đồ gì trong kho.");
                    StringUtility.breakLabelToMultiLine(this.labelMess, this.pItem.width);
                    this.imgMess.setVisible(true);
                    this.imgMess.loadTexture("Storage/empty.png");
                } else {
                    this.labelMess.setVisible(false);
                    this.imgMess.setVisible(false);
                }
            }
            this.tbItem.reloadData();
        }.bind(this);
        if (oldSelectedTab == -1 || oldSelectedTab == this.selectedTab) {
            callback();
        }
        else{
            this.pItem.runAction(cc.sequence(
                cc.fadeTo(0.1, 180),
                cc.callFunc(function(){
                    callback();
                }),
                cc.fadeIn(0.1)
            ));
        }

        this.previewBg.setOpacity(255);
        this.previewBg.setScaleX(0.95);
        this.previewBg.stopAllActions();
        if (oldSelectedTab == -1 || oldSelectedTab == this.selectedTab) {
            this.selectItem(this.selectedItem[this.selectedTab]);
        }
        else{
            this.previewBg.runAction(cc.sequence(
                cc.spawn(
                    cc.scaleTo(0.1, 0, 0.95),
                    cc.fadeTo(0.1, 100)
                ),
                cc.callFunc(function(){
                    this.selectItem(this.selectedItem[this.selectedTab]);
                }.bind(this)),
                cc.spawn(
                    cc.scaleTo(0.1, 0.95, 0.95),
                    cc.fadeIn(0.1)
                )
            ))
        }
    },

    selectTabBtn: function(id, oldId) {
        if (oldId == -1 || id == oldId) {
            for (var i in this.tabBtnActive) {
                var tabBtn = this.tabBtnActive[i];
                tabBtn.stopAllActions();
                tabBtn.setVisible(tabBtn.getTag() == id);
                tabBtn.setTouchEnabled(true);
                tabBtn.setPosition(tabBtn.defaultPos);
                tabBtn.setOpacity(255);
            }
        }
        else{
            var curActiveBtn, nextActiveBtn;
            for (var i = 0; i < this.tabBtnActive.length; i++) {
                if (this.tabBtnActive[i].getTag() == oldId) curActiveBtn = this.tabBtnActive[i];
                else if (this.tabBtnActive[i].getTag() == id) nextActiveBtn = this.tabBtnActive[i];
                else
                    this.tabBtnActive[i].setVisible(false);
                this.tabBtnActive[i].stopAllActions();
            }

            var worldStartPos = curActiveBtn.getParent().convertToWorldSpace(curActiveBtn.defaultPos);
            var worldEndPos = nextActiveBtn.getParent().convertToWorldSpace(nextActiveBtn.defaultPos);

            curActiveBtn.setPosition(curActiveBtn.defaultPos);
            curActiveBtn.setOpacity(255);
            curActiveBtn.setVisible(true);
            curActiveBtn.setTouchEnabled(false);
            nextActiveBtn.setPosition(nextActiveBtn.getParent().convertToNodeSpace(worldStartPos));
            nextActiveBtn.setOpacity(0);
            nextActiveBtn.setVisible(true);
            nextActiveBtn.setTouchEnabled(false);

            curActiveBtn.runAction(cc.sequence(
                cc.spawn(
                    cc.moveTo(0.2, curActiveBtn.getParent().convertToNodeSpace(worldEndPos)).easing(cc.easeSineOut()),
                    cc.fadeOut(0.2).easing(cc.easeExponentialOut())
                ),
                cc.callFunc(function(){
                    this.setVisible(false);
                    this.setTouchEnabled(true)
                }.bind(curActiveBtn))
            ));

            nextActiveBtn.runAction(cc.sequence(
                cc.spawn(
                    cc.moveTo(0.2, nextActiveBtn.defaultPos).easing(cc.easeSineOut()),
                    cc.fadeIn(0.2).easing(cc.easeExponentialOut())
                ),
                cc.callFunc(function(){
                    this.setTouchEnabled(true);
                }.bind(nextActiveBtn))
            ));
        }
    },

    selectItem: function(idx, itemNode) {
        if (idx < 0 || idx >= this.itemData[this.selectedTab].length){
            this.selectedItem[this.selectedTab] = -1;
            this.itemHighlight.removeFromParent();
            this.setPreviewItemData(null, itemNode);
        }
        else {
            this.selectedItem[this.selectedTab] = idx;
            var itemData = {};
            var data = this.itemData[this.selectedTab][idx];
            var itemConfig = StorageManager.getInstance().itemConfig[data.type][data.id];
            var itemRef = StorageManager.getInstance().userItemInfo[data.type][data.id][data.index];
            itemData.type = data.type;
            itemData.id = data.id;
            itemData.remainTime = itemRef.remainTime;
            itemData.name = itemConfig.name;
            itemData.description = itemConfig.description;
            itemData.status = itemRef.status;
            itemData.listItemId = itemConfig.listItemId;
            itemData.ref = itemRef;

            this.setPreviewItemData(itemData, itemNode);
        }
    },

    setPreviewItemData: function(itemData, itemNode) {
        this.labelNoItem.setVisible(!itemData);
        this.descriptionBg.setVisible(!!itemData);
        this.btnUse.setVisible(!!itemData);
        this.pItemPreview.setVisible(!!itemData);
        this.avatarBg.setVisible(!!itemData);
        this.avatarFrame.setVisible(true);
        this.pItemPreview.unscheduleAllCallbacks();
        if (!itemData) return;

        this.itemName.setString(itemData.name);
        // StringUtility.breakLabelToMultiLine(this.itemName, this.descriptionView.width);
        this.itemDescription.setString(itemData.description);
        StringUtility.breakLabelToMultiLine(this.itemDescription, this.descriptionView.width);

        var callback = function(itemRef){
            var expireStr = "Vĩnh viễn";
            var remainTime = itemRef == null ? 0 : itemRef.remainTime;
            if (remainTime >= 0) {
                if (remainTime > 1000*60*60*24)
                    expireStr = StringUtility.customFormatDate(Date.now() + itemData.remainTime, "#DD#/#MM#/#YYYY#");
                else {
                    var s = Math.ceil(remainTime / 1000);
                    if (s > 300){
                        var m = Math.ceil(s / 60);
                        var h = Math.floor(m / 60);
                        m = m - h * 60;
                        expireStr = "Còn " + (h < 10 ? "0" : "") + h + "h" + ":" + (m < 10 ? "0" : "") + m + "p";
                    }
                    else{
                        var m = Math.floor(s / 60);
                        s = s - m * 60;
                        expireStr = "Còn " + (m < 10 ? "0" : "") + m + "p" + ":" + (s < 10 ? "0" : "") + s + "s";
                    }
                }
            }
            this.itemExpiredDate.setString("Hạn sử dụng: " + expireStr);
        }.bind(this, itemData.ref);
        callback();
        if (itemData.remainTime >= 0)
            this.pItemPreview.schedule(callback, 1);
        ccui.Helper.doLayout(this.descriptionBg);

        var typesNeedAvatar = [StorageManager.TYPE_AVATAR, StorageManager.TYPE_INTERACTION, StorageManager.TYPE_EMOTICON];
        this.avatarBg.setVisible(typesNeedAvatar.indexOf(itemData.type) != -1);
        //show item preview
        this.pItemPreview.removeAllChildren();
        switch(itemData.type) {
            case StorageManager.TYPE_AVATAR:
                var avatarSprite = new cc.Sprite(StorageManager.getItemIconPath(StorageManager.TYPE_AVATAR, null, itemData.id));
                avatarSprite.setPosition(this.pItemPreview.width/2, this.pItemPreview.height/2);
                avatarSprite.setScale(0.95);
                this.pItemPreview.addChild(avatarSprite);
                this.btnUse.setVisible(itemData.status != StorageManager.AVATAR_STATUS.USING);
                this.avatarFrame.setVisible(false);
                break;
            case StorageManager.TYPE_INTERACTION:
            {
                var animList = StorageManager.getInteractPreviewAnimList(itemData.id);
                if (animList.length > 0) {
                    this.pItemPreview.animIndex = 0;
                    this.pItemPreview.animList = animList;
                    this.pItemPreview.timer = 0;
                    this.pItemPreview.curDuration = 0;
                    var callback = function (dt) {
                        this.timer += dt;
                        if (this.timer >= this.curDuration) {
                            this.timer = 0;
                            this.removeAllChildren();
                            var anim = this.animList[this.animIndex];
                            this.animIndex = (this.animIndex + 1) % this.animList.length;
                            var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim[0]);
                            eff.setOpacity(255);
                            eff.setPosition(this.width / 2, this.height / 2);
                            eff.setScale(1);
                            this.addChild(eff);
                            eff.getAnimation().gotoAndPlay(anim[1], -1, -1, 1);
                            this.curDuration = eff.getAnimation().getLastAnimationState().getTotalTime();
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
                    }.bind(this.pItemPreview);
                    this.pItemPreview.schedule(callback, 0, cc.REPEAT_FOREVER, itemNode ? 5 : 0);
                }
                if (itemNode){
                    interactPlayer.playInteract(
                        itemNode.convertToWorldSpace(itemNode.getChildByName("img").getPosition()),
                        this.previewBg.convertToWorldSpace(this.avatarBg.getPosition()),
                        itemData.id, 1, this.pItemPreview
                    );
                }
                break;
            }
            case StorageManager.TYPE_EMOTICON:
                this.btnUse.setVisible(true);
                switch(StorageManager.getEmoticonAnimationType(itemData.id)){
                    case StorageManager.ANIM_TYPE_DRAGONBONES:
                        var anim = db.DBCCFactory.getInstance().buildArmatureNode("Emoticon" + itemData.id);
                        anim.setPosition(this.pItemPreview.width/2, this.pItemPreview.height/2);
                        anim.setScale(StorageManager.getEmoticonScale(itemData.id) * 1.25);
                        this.pItemPreview.addChild(anim);
                        this.pItemPreview.animIndex = 0;
                        this.pItemPreview.listAnimId = itemData.listItemId;
                        var callback = function(anim){
                            // var animId = this.pItemPreview.listAnimId[this.pItemPreview.animIndex++ % this.pItemPreview.listAnimId.length];
                            var animId = this.pItemPreview.listAnimId[Math.floor(Math.random() * this.pItemPreview.listAnimId.length)];
                            anim.setOpacity(255);
                            anim.getAnimation().gotoAndPlay("" + animId, -1, -1, 0);
                            anim.stopAllActions();
                            anim.setVisible(false);
                            anim.runAction(cc.sequence(cc.delayTime(1/60), cc.show(), cc.delayTime(2.5), cc.fadeOut(0.5), cc.delayTime(1)));
                        }.bind(this, anim);
                        callback();
                        this.pItemPreview.schedule(callback, 4);
                        break;
                    case StorageManager.ANIM_TYPE_SPINE:
                        this.pItemPreview.animIndex = 0;
                        this.pItemPreview.listAnimId = itemData.listItemId;
                        this.pItemPreview.listAnim = {};
                        var callback = function(){
                            this.pItemPreview.removeAllChildren();
                            // var animId = this.pItemPreview.listAnimId[this.pItemPreview.animIndex++ % this.pItemPreview.listAnimId.length];
                            var animId = this.pItemPreview.listAnimId[Math.floor(Math.random() * this.pItemPreview.listAnimId.length)];
                            var anim = new CustomSkeleton("Armatures/Emoticon/" + itemData.id, animId);
                            anim.setOpacity(255);
                            anim.setPosition(this.pItemPreview.width/2, this.pItemPreview.height/2);
                            anim.setScale(StorageManager.getEmoticonScale(itemData.id) * 1.25);
                            this.pItemPreview.addChild(anim);
                            anim.setAnimation(0, 'animation', true);
                            anim.stopAllActions();
                            anim.runAction(cc.sequence(cc.delayTime(2.5), cc.fadeOut(0.5), cc.delayTime(1)));
                        }.bind(this);
                        callback();
                        this.pItemPreview.schedule(callback, 4);
                        break;
                }
                break;
            case StorageManager.TYPE_VOUCHER:
                var voucherSprite = new cc.Sprite(StorageManager.getItemIconPath(StorageManager.TYPE_VOUCHER, null, itemData.id));
                voucherSprite.setPosition(this.pItemPreview.width/2, this.pItemPreview.height/2);
                voucherSprite.setScale(1.2);
                this.pItemPreview.addChild(voucherSprite);
                this.btnUse.setVisible(itemData.status != StorageManager.VOUCHER_STATUS.USING);
                break;
        }
    },

    useCurrentItem: function() {
        if (this.selectedTab == -1 || this.selectedItem[this.selectedTab] == -1) return;
        var data = this.itemData[this.selectedTab][this.selectedItem[this.selectedTab]];
        var itemRef = StorageManager.getInstance().userItemInfo[data.type][data.id][data.index];
        var confirmMess = "";
        switch(data.type){
            case StorageManager.TYPE_AVATAR:
                if (itemRef.status == StorageManager.AVATAR_STATUS.USING)
                    this.onUpdateGUI();
                else
                    StorageManager.getInstance().sendUseItem(data.type, data.id, data.index);
                break;
            case StorageManager.TYPE_INTERACTION:
                Toast.makeToast(Toast.SHORT, "Ấn vào avatar của người chơi khác trong bàn chơi để sử dụng.");
                break;
            case StorageManager.TYPE_EMOTICON:
                var callback = function(id) {
                    if (CommonLogic.checkInBoard()){
                        var gui = sceneMgr.openGUI(ChatEmoGUI.className, ChatEmoGUI.GUI_TAG, ChatEmoGUI.GUI_TAG);
                        gui.show(id);
                    }
                }.bind(this, data.id);
                this.hide(callback);
                break;
            case StorageManager.TYPE_VOUCHER:
                if(itemRef.status == StorageManager.VOUCHER_STATUS.USING)
                    this.onUpdateGUI();
                else {
                    var voucherSubType = StorageManager.getInstance().getItemSubTypes(StorageManager.TYPE_VOUCHER, data.id)[0];
                    var curVoucher = StorageManager.getInstance().getCurrentVoucherBySubType(voucherSubType);
                    if (curVoucher != null) {
                        confirmMess = "Bạn có chắc muốn sử dụng voucher này?\nVoucher cùng loại đang sử dung sẽ bị\nthay thế và xóa khỏi kho đồ.";
                        sceneMgr.showOkCancelDialog(confirmMess, this, function(id){
                            if (id == Dialog.BTN_OK){
                                StorageManager.getInstance().sendUseItem(data.type, data.id, data.index);
                            }
                        });
                    }
                    else
                        StorageManager.getInstance().sendUseItem(data.type, data.id, data.index);
                }
                break;
            default:
                this.onUpdateGUI();
                return;
        }
    },
    /* endregion Select and Use */

    /* region Animation */
    show: function() {
        this.readyToUse = false;
        this.btnClose.setVisible(true);
        this.bg.setPositionX(this.bg.defaultPosition.x - this.bg.width);
        this.bg.setOpacity(0);
        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(0.4, this.bg.defaultPosition.x, this.bg.defaultPosition.y).easing(cc.easeBackOut()),
                cc.fadeIn(0.4)
            ),
            cc.callFunc(function(){
                this.readyToUse = true;
            }.bind(this))
        ));
    },

    hide: function(callback) {
        this.readyToUse = true;
        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(0.4, this.bg.defaultPosition.x - this.bg.width, this.bg.defaultPosition.y).easing(cc.easeBackIn()),
                cc.fadeOut(0.4)
            ),
            cc.callFunc(function(){
                this.btnClose.setVisible(false);
                this.removeFromParent();
                if (callback) callback();
            }.bind(this))
        ))
    }
});
InboardStorageGUI.className = "InboardStorageGUI";
InboardStorageGUI.GUI_TAG = 821;
InboardStorageGUI.BTN_CLOSE = 0;
InboardStorageGUI.BTN_AVATAR_TAB = 1;
InboardStorageGUI.BTN_INTERACTION_TAB = 2;
InboardStorageGUI.BTN_EMOTICON_TAB = 3;
InboardStorageGUI.BTN_VOUCHER_TAB = 4;
InboardStorageGUI.BTN_USE = 5;
InboardStorageGUI.BTN_UNUSE = 6;
InboardStorageGUI.NUM_COL = 2;

InboardStorageGUI.TAB_NAMES = {};
InboardStorageGUI.TAB_NAMES[InboardStorageGUI.BTN_AVATAR_TAB] = "Khung avatar";
InboardStorageGUI.TAB_NAMES[InboardStorageGUI.BTN_INTERACTION_TAB] = "Tương tác";
InboardStorageGUI.TAB_NAMES[InboardStorageGUI.BTN_EMOTICON_TAB] = "Biểu cảm";
InboardStorageGUI.TAB_NAMES[InboardStorageGUI.BTN_VOUCHER_TAB] = "Phiếu giảm giá";