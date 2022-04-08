/**
 * Created by sonbnt on 3/3/2021
 */

var StorageScene = BaseLayer.extend({
    ctor: function() {
        this._super(StorageScene.className);

        //GUI
        this.btnBack = null;
        this.btnTabAvatarActive = null;
        this.btnTabInteractionActive = null;
        this.btnTabVoucherActive = null;
        this.btnTabAvatarInactive = null;
        this.btnTabInteractionInactive = null;
        this.btnTabVoucherInactive = null;

        this.btnUse = null;
        this.btnUnuse = null;

        this.title = null;
        this.valueGold = null;
        this.valueG = null;
        this.valueDiamond = null;

        this.labelNoItem = null;
        this.itemName = null;
        this.itemDescription = null;
        this.itemExpiredDate = null;

        this.pItemPreview = null;
        this.avatarBg = null;
        this.avatar = null;
        this.avatarFrame = null;

        this.pItem = null;
        this.tbItem = null;
        this.labelMess = null;
        this.tabBtnList = null;

        //DATA
        this.selectedTab = -1;
        this.itemData = {};
        this.selectedItem = {};
        this.arrayButtonId = [StorageScene.BTN_AVATAR_TAB, StorageScene.BTN_INTERACTION_TAB, StorageScene.BTN_EMOTICON_TAB, StorageScene.BTN_VOUCHER_TAB];
        this.resetSelectedItem();

        this.initWithBinaryFile("Lobby/StorageGUI.json");
    },

    initGUI: function() {
        //main parts
        this.previewBg = this.getControl("previewBg");
        this.previewBg.setLocalZOrder(1);
        this.pItem = this.getControl("itemPanel");
        this.pItem.setCascadeOpacityEnabled(true);
        this.pItem.setClippingEnabled(true);

        //PREVIEW PANEL
        this.btnUse = this.customButton("btnUse", StorageScene.BTN_USE, this.previewBg);
        this.btnUnuse = this.customButton("btnUnuse", StorageScene.BTN_UNUSE, this.previewBg);
        this.btnUnuse.setVisible(false); this.btnUnuse.setEnabled(false);
        this.pItemPreview = this.getControl("itemPreview", this.previewBg);
        this.avatarBg = this.getControl("avatarBg", this.previewBg);
        this.pText = this.getControl("pText", this.previewBg);
        this.itemName = this.getControl("title", this.pText);
        this.itemName.ignoreContentAdaptWithSize(true);
        this.itemDescription = this.getControl("des", this.pText);
        this.itemDescription.ignoreContentAdaptWithSize(true);
        this.itemExpiredDate = this.getControl("time", this.pText);
        this.itemExpiredDate.ignoreContentAdaptWithSize(true);
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
        this.tbItem = new cc.TableView(this, cc.size(this.pItem.getContentSize().width, this.pItem.getContentSize().height));
        this.tbItem.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.tbItem.setPosition(0, 0);
        this.tbItem.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.tbItem.setDelegate(this);
        this.tbItem.setCascadeOpacityEnabled(true);
        this.tbItem.setClippingToBounds(false);
        this.tbItem.getContainer().setCascadeOpacityEnabled(true);
        this.pItem.addChild(this.tbItem);

        this.labelMess = this.getControl("mess", this.pItem);
        this.labelMess.ignoreContentAdaptWithSize(true);
        this.imgMess = this.getControl("messImg", this.pItem);
        this.imgMess.ignoreContentAdaptWithSize(true);

        this.itemHighlight = new cc.Sprite("Storage/itemHighlight.png");
        this.itemHighlight.retain();
        this.itemHighlight.setPosition(StorageItemCell.HIGHLIGHT_POS);
        //this.itemHighlight.setScale(StorageItemCell.HIGHLIGHT_SCALE);

        this.setBackEnable(true);
    },

    onEnterFinish: function() {
        this.selectedTab = -1;
        this.onUpdateGUI();
        this.selectTab(StorageManager.getInstance().currentTab);
        this.doEffect();
    },

    doEffect: function() {
        return;
        this.previewBg.stopAllActions();
        this.previewBg.setOpacity(0);
        this.previewBg.setPositionX(cc.winSize.width + this.previewBg.width/2);
        this.previewBg.runAction(cc.spawn(
            cc.moveTo(0.5, this.previewBg.defaultPos).easing(cc.easeExponentialOut()),
            cc.fadeIn(0.5)
        ));

        this.pItem.setOpacity(0);
        this.pItem.setPositionY(-this.pItem.height/2);
        this.pItem.runAction(cc.spawn(
            cc.moveTo(0.5, this.pItem.defaultPos).easing(cc.easeExponentialOut()),
            cc.fadeIn(0.5)
        ));
    },

    effectOut: function() {
        return;
        this.previewBg.stopAllActions();
        this.previewBg.setOpacity(255);
        this.previewBg.setPositionX(this.previewBg.defaultPos.x);
        this.previewBg.runAction(cc.spawn(
            cc.moveTo(0.5, cc.winSize.width + this.previewBg.width/2, this.previewBg.defaultPos.y).easing(cc.easeExponentialIn()),
            cc.fadeOut(0.5)
        ));

        this.pItem.setOpacity(255);
        this.pItem.setPositionY( this.pItem.defaultPos.y);
        this.pItem.runAction(cc.spawn(
            cc.moveTo(0.5, this.pItem.defaultPos.x, -this.pItem.height/2).easing(cc.easeExponentialIn()),
            cc.fadeOut(0.5)
        ));
    },

    onButtonRelease: function(button, id) {
        switch(id) {
            case StorageScene.BTN_BACK:{
                this.onBack();
                break;
            }
            case StorageScene.BTN_AVATAR_TAB:
            case StorageScene.BTN_INTERACTION_TAB:
            case StorageScene.BTN_EMOTICON_TAB:
            case StorageScene.BTN_VOUCHER_TAB:
                this.selectTab(id);
                break;
            case StorageScene.BTN_USE:{
                this.useCurrentItem();
                break;
            }
            case StorageScene.BTN_UNUSE:{
                //currently do nothing
                break;
            }
        }
    },

    onUpdateGUI: function() {
        //reset selected
        this.resetSelectedItem();

        // update avatar
        try {
            this.avatar.asyncExecuteWithUrl(userMgr.getUserName(), userMgr.getAvatar());
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

    onBack: function() {
        if (sceneMgr.checkBackAvailable()) return;
        this.effectOut();
        this.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(function(){
                sceneMgr.openScene(LobbyScene.className);
            }.bind(this))
        ));
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
            case StorageManager.TYPE_EMOTICON:
                sceneMgr.showPlayNowDialog("Vật phẩm này được sử dụng trong bàn chơi.\nBạn có muốn vào chơi ngay?", this, function(id){
                    if (id == Dialog.BTN_OK){
                        if (channelMgr.checkQuickPlay()) {
                            var pk = new CmdSendQuickPlay();
                            GameClient.getInstance().sendPacket(pk);
                            pk.clean();

                            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                        }
                        else{
                            Toast.makeToast(Toast.LONG, LocalizedString.to("QUESTION_CHANGE_GOLD"));
                        }
                    }
                });
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
        this.pText.setVisible(!!itemData);
        this.btnUse.setVisible(!!itemData);
        this.pItemPreview.setVisible(!!itemData);
        this.avatarBg.setVisible(!!itemData);
        this.avatarFrame.setVisible(true);
        this.pItemPreview.unscheduleAllCallbacks();
        if (!itemData) return;


        this.itemName.setString(itemData.name);
        // StringUtility.breakLabelToMultiLine(this.itemName, this.descriptionView.width);
        this.itemDescription.ignoreContentAdaptWithSize(false);
        this.itemDescription.setContentSize(cc.size(250, 80));
        this.itemDescription.setString(itemData.description);
     //   StringUtility.breakLabelToMultiLine(this.itemDescription, this.pText.getContentSize().width);

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

    onErrorStorage: function() {
        this.tbItem.setVisible(false);
        this.labelMess.setVisible(true);
        this.labelMess.setString("Có lỗi xảy ra, vui lòng thử lại.");
        StringUtility.breakLabelToMultiLine(this.labelMess, this.pItem.width);
        this.imgMess.setVisible(true);
        this.imgMess.loadTexture("Storage/error.png");
    },

    resetSelectedItem: function() {
        for (var i = 0; i < this.arrayButtonId.length; i++)
            this.selectedItem[this.arrayButtonId[i]] = -1;
    },
    /* endregion Set data */

    /* region TABS */
    selectTab: function(id) {
        var oldSelectedTab = this.selectedTab;
        this.selectedTab = (id && id != -1) ? id : StorageScene.BTN_AVATAR_TAB;
        var callback = function() {
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
        this.pItem.setOpacity(255);
        this.pItem.stopAllActions();
        if (oldSelectedTab == -1 || this.selectedTab == oldSelectedTab){
            callback();
        }
        else{
            this.pItem.runAction(cc.sequence(
                cc.fadeTo(0.1, 180),
                cc.callFunc(function(){
                    callback()
                }.bind(this)),
                cc.fadeIn(0.1)
            ));
        }

        // this.resetDefaultPosition(this.previewBg);
        this.previewBg.setOpacity(255);
        this.previewBg.setScaleX(1);
        this.previewBg.stopAllActions();
        if (oldSelectedTab == -1 || this.selectedTab == oldSelectedTab){
            this.selectItem(this.selectedItem[this.selectedTab]);
        }
        else{
            this.previewBg.runAction(cc.sequence(
                cc.spawn(
                    cc.scaleTo(0.1, 0, 1),
                    cc.fadeTo(0.1, 100)
                ),
                cc.callFunc(function(){
                    this.selectItem(this.selectedItem[this.selectedTab]);
                }.bind(this)),
                cc.spawn(
                    cc.scaleTo(0.1, 1, 1),
                    cc.fadeIn(0.1)
                )
            ));
        }

    },
    /* endregion TABS */

    /* region Table View Delegate */
    tableCellAtIndex: function(table, idx) {
        var cell = table.dequeueCell();
        if(!cell) cell = new StorageItemCell(this.itemHighlight, this);
        var items = [];
        for (var i = idx * StorageItemCell.NUM_COL; i < this.itemData[this.selectedTab].length && i < (idx + 1) * StorageItemCell.NUM_COL; i++){
            var data = this.itemData[this.selectedTab][i];
            var item = {};
            var itemRef = StorageManager.getInstance().userItemInfo[data.type][data.id][data.index];
            item.isSelected = i == this.selectedItem[this.selectedTab];
            item.path = StorageManager.getItemIconPath(data.type, null, data.id);
            item.num = itemRef.num;
            item.name = StorageManager.getItemName(data.type, data.id);
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
        return cc.size(this.pItem.getContentSize().width, StorageItemCell.HEIGHT);
    },

    numberOfCellsInTableView: function(table) {
        if (!table.isVisible()) return 0;
        return this.getCellNum(this.selectedTab);
    },

    getCellNum: function(tabId){
        if (tabId == -1 || !this.itemData[tabId]) return 0;
        else return Math.ceil(this.itemData[tabId].length / StorageItemCell.NUM_COL);
    },
    /* endregion Table View Delegate */
});

StorageScene.className = "StorageScene";
StorageScene.BTN_BACK = 0;
StorageScene.BTN_AVATAR_TAB = 1;
StorageScene.BTN_INTERACTION_TAB = 2;
StorageScene.BTN_EMOTICON_TAB = 3;
StorageScene.BTN_VOUCHER_TAB = 4;
StorageScene.BTN_USE = 5;
StorageScene.BTN_UNUSE = 6;