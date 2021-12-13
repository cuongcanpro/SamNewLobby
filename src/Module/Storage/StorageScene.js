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
        this.descriptionView = null;
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
        this.btnBack = this.customButton("btnBack", StorageScene.BTN_BACK);
        this.btnBack.setLocalZOrder(2);
        this.tabBg = this.getControl("tabBg");
        this.barBg = this.getControl("barBg");
        this.barBg.setLocalZOrder(1);
        this.barBg.setTouchEnabled(true);
        this.barBg.setSwallowTouches(true);
        this.previewBg = this.getControl("previewBg");
        this.previewBg.setLocalZOrder(1);
        this.tabBtnList = this.getControl("btnList", this.tabBg);
        this.tabBtnList.setScrollBarEnabled(false);
        this.tabBtnList.setContentSize(cc.size(this.tabBtnList.width, this.tabBtnList.height / this._scale));
        this.tabBtnList.setScaleY(this._scale);
        this.pItem = this.getControl("itemPanel");
        this.pItem.setPositionX(this.pItem.x * this._scale);
        this.pItem.defaultPos = this.pItem.getPosition();
        this.pItem.setContentSize(cc.size(cc.winSize.width - this.pItem.x - this.previewBg.width - 27, this.pItem.getContentSize().height));
        this.pItem.setCascadeOpacityEnabled(true);
        this.pItem.setClippingEnabled(true);
        ccui.Helper.doLayout(this.pItem);
        this.initPItem();

        //TOP BAR
        this.valueG = this.getControl("label", this.getControl("GBg", this.barBg));
        this.valueG.ignoreContentAdaptWithSize(true);
        this.valueGold = this.getControl("label", this.getControl("goldBg", this.barBg));
        this.valueGold.ignoreContentAdaptWithSize(true);
        this.valueDiamond = this.getControl("label", this.getControl("diamondBg", this.barBg));
        this.valueDiamond.ignoreContentAdaptWithSize(true);
        this.title = this.getControl("title", this.barBg);
        if (Config.ENABLE_CHEAT){
            this.title.setTouchEnabled(true);
            this.title.setSwallowTouches(true);
            this.title.addTouchEventListener(function(target, type){
                if (type == ccui.Widget.TOUCH_ENDED){
                    var gui = sceneMgr.openGUI(StorageCheatGUI.className);
                    if (this.selectedTab != -1 && this.selectedItem[this.selectedTab] != -1)
                        gui.setData(this.itemData[this.selectedTab][this.selectedItem[this.selectedTab]]);
                }
            }, this);
        }
        else this.title.setTouchEnabled(false);

        //TAB BTN LIST
        var tabAvatar = this.getControl("tabBtnAvatar", this.tabBtnList);
        this.btnTabAvatarActive = this.customButton("active", StorageScene.BTN_AVATAR_TAB, tabAvatar);
        this.btnTabAvatarInactive = this.customButton("inactive", StorageScene.BTN_AVATAR_TAB, tabAvatar);
        this.btnTabAvatarActive.setPressedActionEnabled(false);
        var tabInteraction = this.getControl("tabBtnInteraction", this.tabBtnList);
        this.btnTabInteractionActive = this.customButton("active", StorageScene.BTN_INTERACTION_TAB, tabInteraction);
        this.btnTabInteractionInactive = this.customButton("inactive", StorageScene.BTN_INTERACTION_TAB, tabInteraction);
        this.btnTabInteractionActive.setPressedActionEnabled(false);
        var tabEmoticon = this.getControl("tabBtnEmoticon", this.tabBtnList);
        this.btnTabEmoticonActive = this.customButton("active", StorageScene.BTN_EMOTICON_TAB, tabEmoticon);
        this.btnTabEmoticonInactive = this.customButton("inactive", StorageScene.BTN_EMOTICON_TAB, tabEmoticon);
        this.btnTabEmoticonActive.setPressedActionEnabled(false);
        var tabVoucher = this.getControl("tabBtnVoucher", this.tabBtnList);
        this.btnTabVoucherActive = this.customButton("active", StorageScene.BTN_VOUCHER_TAB, tabVoucher);
        this.btnTabVoucherInactive = this.customButton("inactive", StorageScene.BTN_VOUCHER_TAB, tabVoucher);
        this.btnTabVoucherActive.setPressedActionEnabled(false);
        this.tabBtnActive = [this.btnTabAvatarActive, this.btnTabInteractionActive, this.btnTabEmoticonActive, this.btnTabVoucherActive];
        this.tabBtnInactive = [this.btnTabAvatarInactive, this.btnTabInteractionInactive, this.btnTabEmoticonInactive, this.btnTabVoucherInactive];

        //PREVIEW PANEL
        this.btnUse = this.customButton("btnUse", StorageScene.BTN_USE, this.previewBg);
        this.btnUnuse = this.customButton("btnUnuse", StorageScene.BTN_UNUSE, this.previewBg);
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
        this.tbItem = new cc.TableView(this, cc.size(this.pItem.getContentSize().width, this.pItem.getContentSize().height - 65 + this.storageItemSpace));
        this.tbItem.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.tbItem.setPosition(0, 48);
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
        this.itemHighlight.setScale(StorageItemCell.HIGHLIGHT_SCALE);

        this.setBackEnable(true);
    },

    onEnterFinish: function() {
        this.selectedTab = -1;
        this.onUpdateGUI();
        this.selectTab(StorageManager.getInstance().currentTab);
        this.doEffect();
    },

    doEffect: function() {
        this.barBg.stopAllActions();
        this.barBg.setOpacity(0);
        this.barBg.setPositionY(cc.winSize.height + this.barBg.height/2);
        this.barBg.runAction(cc.spawn(
            cc.moveTo(0.5, this.barBg.defaultPos).easing(cc.easeExponentialOut()),
            cc.fadeIn(0.5)
        ));

        this.tabBg.stopAllActions();
        this.tabBg.setOpacity(0);
        this.tabBg.setPositionX(-this.tabBg.width/2);
        this.tabBg.runAction(cc.spawn(
            cc.moveTo(0.5, this.tabBg.defaultPos).easing(cc.easeExponentialOut()),
            cc.fadeIn(0.5)
        ));

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
        this.barBg.stopAllActions();
        this.barBg.setOpacity(255);
        this.barBg.setPositionY(this.barBg.defaultPos.y);
        this.barBg.runAction(cc.spawn(
            cc.moveTo(0.5, this.barBg.defaultPos.x, cc.winSize.height + this.barBg.height/2).easing(cc.easeExponentialIn()),
            cc.fadeOut(0.5)
        ));

        this.tabBg.stopAllActions();
        this.tabBg.setOpacity(255);
        this.tabBg.setPositionX(this.tabBg.defaultPos.x);
        this.tabBg.runAction(cc.spawn(
            cc.moveTo(0.5, -this.tabBg.width/2, this.tabBg.defaultPos.y).easing(cc.easeExponentialIn()),
            cc.fadeOut(0.5)
        ));

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

        // update bean
        this.setGValue(userMgr.getCoin());
        this.setGoldValue(userMgr.getGold());
        this.setDiamondValue(userMgr.getDiamond());

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
                        if (CheckLogic.checkQuickPlay()) {
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

    /* region Set data */
    setGoldValue: function(num) {
        this.valueGold.setString(StringUtility.formatNumberSymbol(num));
    },

    setGValue: function(num) {
        this.valueG.setString(StringUtility.formatNumberSymbol(num));
    },

    setDiamondValue: function(num) {
        this.valueDiamond.setString(StringUtility.formatNumberSymbol(num));
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
        this.selectTabBtn(this.selectedTab, oldSelectedTab);

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
    /* endregion TABS */

    /* region Table View Delegate */
    tableCellAtIndex: function(table, idx) {
        var cell = table.dequeueCell();
        if(!cell) cell = new StorageItemCell(this.numCol, this.storageItemScale, this.storageItemSpace, this.itemHighlight, this);
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
        return cc.size(this.pItem.getContentSize().width, StorageItemCell.HEIGHT * this.storageItemScale + this.storageItemSpace);
    },

    numberOfCellsInTableView: function(table) {
        if (!table.isVisible()) return 0;
        return this.getCellNum(this.selectedTab);
    },

    getCellNum: function(tabId){
        if (tabId == -1 || !this.itemData[tabId]) return 0;
        else return Math.ceil(this.itemData[tabId].length / this.numCol);
    },

    initPItem: function() {
        var totalWidth = this.pItem.getContentSize().width;
        this.numCol = StorageItemCell.MIN_COL;
        for (; this.numCol < StorageItemCell.MAX_COL; this.numCol++){
            if ((this.numCol + 1) * StorageItemCell.MIN_SCALE * StorageItemCell.WIDTH + (this.numCol + 2) * StorageItemCell.MIN_SPACE <= totalWidth){
                continue;
            }
            break;
        }
        this.storageItemScale = (totalWidth - (this.numCol+1) * StorageItemCell.MIN_SPACE) / (this.numCol * StorageItemCell.WIDTH);
        this.storageItemSpace = StorageItemCell.MIN_SPACE;
        if (this.storageItemScale >= 1){
            this.storageItemScale = totalWidth/(this.numCol * StorageItemCell.WIDTH + (this.numCol+1) * StorageItemCell.MIN_SPACE);
            this.storageItemSpace = StorageItemCell.MIN_SPACE * this.storageItemScale;
        }
    }
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

var StorageItemCell = cc.TableViewCell.extend({
    ctor: function(numCol, itemScale, itemSpace, highlight, storageScene) {
        this.numCol = numCol;
        this.itemScale = itemScale;
        this.itemSpace = itemSpace;
        this.highlight = highlight;
        this.storageScene = storageScene;
        this._super(StorageItemCell.className);
        this.setCascadeOpacityEnabled(true);

        this._layout = new cc.Layer(StorageItemCell.WIDTH * this.itemScale * this.numCol + this.itemSpace * this.numCol, StorageItemCell.HEIGHT * this.itemScale + this.itemSpace);
        this._layout.setCascadeOpacityEnabled(true);
        for (var i = 0; i < this.numCol; i++){
            var itemNode = ccs.load("Lobby/UserItem.json").node;
            itemNode.setPosition(this.itemSpace + i * (this.itemSpace + StorageItemCell.WIDTH * this.itemScale), this.itemSpace/2);
            itemNode.setScale(this.itemScale);
            this._layout.addChild(itemNode, 0, i);
            itemNode.img = itemNode.getChildByName("img");
            itemNode.shadow = itemNode.getChildByName("shadow");
            itemNode.num = itemNode.getChildByName("num");
            itemNode.img.ignoreContentAdaptWithSize(true);
            itemNode.shadow.ignoreContentAdaptWithSize(true);
            itemNode.num.ignoreContentAdaptWithSize(true);
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
                        if (target.isWaitingTouch){
                            this.highlight.removeFromParent();
                            target.getParent().addChild(this.highlight);
                            this.storageScene.selectItem(this.getIdx() * this.numCol + target.getParent().getTag(), target.getParent());
                            this.storageScene.playSoundButton(-1);
                        }
                        break;
                    case ccui.Widget.TOUCH_CANCELED:
                        break;
                }
            }.bind(this), this);
        }
        this.addChild(this._layout);
    },

    setData: function(items){
        for (var i = 0; i < this.numCol; i++){
            var itemNode = this._layout.getChildByTag(i);
            if (i >= items.length) itemNode.setVisible(false);
            else{
                var item = items[i];
                itemNode.setVisible(true);
                itemNode.getChildByName("labelUsing").setVisible(!!item.isUsing);
                if (item.num != null) {
                    itemNode.num.setVisible(true);
                    itemNode.num.setString(item.num >= 0 ? StringUtility.standartNumber(item.num) : '\u221e');
                }
                else itemNode.getChildByName("num").setVisible(false);
                if (item.path && item.path != ""){
                    itemNode.img.setVisible(true);
                    itemNode.shadow.setVisible(true);
                    itemNode.img.loadTexture(item.path);
                    itemNode.shadow.loadTexture(item.path);
                    itemNode.img.setScale(item.scale);
                    itemNode.shadow.setScale(item.scale);
                }
                else{
                    itemNode.img.setVisible(false);
                    itemNode.shadow.setVisible(false);
                }
                if (item.isSelected){
                    this.highlight.removeFromParent();
                    itemNode.addChild(this.highlight, 0, "highlight");
                }
                else{
                    itemNode.removeChild(this.highlight);
                }
            }
        }
    }
});

StorageItemCell.className = "StorageItemCell";
StorageItemCell.WIDTH = 110;
StorageItemCell.HEIGHT = 110;
StorageItemCell.MIN_COL = 2;
StorageItemCell.MAX_COL = 3;
StorageItemCell.MIN_SPACE = 8;
StorageItemCell.MIN_SCALE = 0.75;
StorageItemCell.HIGHLIGHT_POS = cc.p(55, 56.25);
StorageItemCell.HIGHLIGHT_SCALE = 0.925;

var StorageCheatGUI = BaseLayer.extend({
    ctor: function() {
        this._super(StorageCheatGUI.className);
        this.initWithBinaryFile("Lobby/StorageCheatGUI.json");
    },

    initGUI: function() {
        this.bg = this.getControl("bg");
        this.btnClose = this.customButton("btnClose", StorageCheatGUI.BTN_CLOSE);
        this.btnHelp = this.customButton("btnHelp", StorageCheatGUI.BTN_HELP);
        this.btnAdd = this.customButton("btnAdd", StorageCheatGUI.BTN_ADD);
        this.btnSub = this.customButton("btnSub", StorageCheatGUI.BTN_SUB);
        this.btnReset = this.customButton("btnReset", StorageCheatGUI.BTN_RESET);
        this.btnClear = this.customButton("btnClear", StorageCheatGUI.BTN_CLEAR);
        this.btnSelectCurrent = this.customButton("btnSelectCurrent", StorageCheatGUI.BTN_SELECT_CURRENT);

        this.selectBox = this.getControl("selectBox");
        this.selectBox.addTouchEventListener(function(panel, type){
            if (type == ccui.Widget.TOUCH_ENDED) {
                panel.listOption.setVisible(!panel.listOption.isVisible());
                panel.btnExpand.setRotation(180 - panel.btnExpand.getRotation());
            }
        }, this);
        this.selectBox.listOption = this.getControl("listOption", this.selectBox);
        this.selectBox.listOption.setScrollBarEnabled(false);
        this.selectBox.selectedType = this.getControl("textSelected", this.selectBox);
        this.selectBox.selectedType.ignoreContentAdaptWithSize(true);
        this.selectBox.btnExpand = this.getControl("btnExpand", this.selectBox);

        this.listItem = this.getControl("listItem");
        this.listItem.setScrollBarEnabled(false);
        this.listItem.setClippingEnabled(true);
        this.listItem.setItemsMargin(0);
        this.listItem.addEventListener(function(listView, type){
            if (type == ccui.ListView.ON_SELECTED_ITEM_END)
                this.selectId(listView.getItem(listView.getCurSelectedIndex()).id);
        }.bind(this), this);
        this.itemCells = [];

        this.textDiamond = this.getControl("textDiamond");

        this.currentNum = this.getControl("textCurrentNum");
        this.currentNum.ignoreContentAdaptWithSize(true);
        this.currentTime = this.getControl("textCurrentTime");
        this.currentTime.ignoreContentAdaptWithSize(true);
        this.boxUnlocked = this.getControl("boxUnlocked");
        this.boxUnlocked.setTouchEnabled(false);
        this.boxHad = this.getControl("boxHad");
        this.boxHad.setTouchEnabled(false);

        this.textNum = this.getControl("textNum");
        this.textTime = this.getControl("textTime");
        this.pPreview = this.getControl("pPreview");
        this.pHelp = this.getControl("pHelp");
        this.enableFog();
    },

    onEnterFinish: function() {
        this.selectedType = -1;
        //load tab
        this.selectBox.listOption.removeAllChildren();
        var itemConfig = StorageManager.getInstance().itemConfig;
        if (itemConfig){
            for (var type in itemConfig){
                var panel = new ccui.Layout();
                panel.setContentSize(this.selectBox.getContentSize());
                panel.type = type;
                panel.setTouchEnabled(true);
                panel.addTouchEventListener(function(panel, type){
                    if (type == ccui.Widget.TOUCH_ENDED)
                        this.selectType(panel.type);
                }.bind(this), this);
                var text = new ccui.Text(StorageCheatGUI.TYPE_NAMES[type], "fonts/tahomabd.ttf", 20);
                text.setAnchorPoint(0, 0.5);
                text.setPosition(10, panel.height/2);
                panel.addChild(text);
                this.selectBox.listOption.pushBackCustomItem(panel);
            }
        }

        this.clearCheat();
    },

    onButtonRelease: function(button, id){
        switch(id){
            case StorageCheatGUI.BTN_CLOSE:
                this.onBack();
                break;
            case StorageCheatGUI.BTN_ADD:
                this.sendCheat(1);
                break;
            case StorageCheatGUI.BTN_SUB:
                this.sendCheat(-1);
                break;
            case StorageCheatGUI.BTN_RESET:
                StorageManager.getInstance().sendCheatReset();
                break;
            case StorageCheatGUI.BTN_CLEAR:
                this.clearCheat();
                break;
            case StorageCheatGUI.BTN_SELECT_CURRENT:
                var scene = sceneMgr.getMainLayer();
                if (scene instanceof StorageScene){
                    if (scene.selectedTab != -1 && scene.selectedItem[scene.selectedTab] != -1)
                        this.setData(scene.itemData[scene.selectedTab][scene.selectedItem[scene.selectedTab]]);
                    else this.setData(null);
                }
                break;
            case StorageCheatGUI.BTN_HELP:
                this.pHelp.setVisible(!this.pHelp.isVisible());
                break;
        }
    },

    onBack: function(){
        this.removeFromParent();
    },

    onExit: function(){
        this._super();
        this.resetListItem();
    },

    selectType: function(type){
        this.selectedType = type;
        this.selectBox.listOption.setVisible(false);
        this.selectBox.btnExpand.setRotation(0);
        this.selectBox.selectedType.setString(type != -1 ? StorageCheatGUI.TYPE_NAMES[type] : "Select type");

        this.resetListItem();
        var itemConfig = StorageManager.getInstance().itemConfig;
        if (itemConfig && type != -1){
            var typeConfig = itemConfig[type];
            for (var id in typeConfig){
                if (!typeConfig[id].enable) continue;
                var cell;
                if (this.itemCells.length > 0) cell = this.itemCells.shift();
                else{
                    var cell = new ccui.Layout();
                    cell.setContentSize(cc.size(120, 120));
                    cell._layout = ccs.load("Lobby/UserItem.json").node;
                    cell._layout.setAnchorPoint(0.5, 0.5);
                    cell._layout.setPosition(60, 60);
                    cell._layout.getChildByName("bg").setSwallowTouches(false);
                    cell._layout.getChildByName("labelUsing").setVisible(false);
                    cell._layout.getChildByName("num").setVisible(false);
                    cell._layout.getChildByName("img").ignoreContentAdaptWithSize(true);
                    cell._layout.getChildByName("shadow").ignoreContentAdaptWithSize(true);
                    cell.setTouchEnabled(true);
                    cell.setSwallowTouches(false);
                    cell.addChild(cell._layout);
                    cell.retain();
                }
                cell.id = id;
                var path = StorageManager.getItemIconPath(type, null, id);
                if (path && path != ""){
                    cell._layout.getChildByName("img").setVisible(true);
                    cell._layout.getChildByName("shadow").setVisible(true);
                    cell._layout.getChildByName("img").loadTexture(path);
                    cell._layout.getChildByName("shadow").loadTexture(path);
                    var scale = 1;
                    switch(Number(type)){
                        case StorageManager.TYPE_AVATAR:
                            scale = 0.5; break;
                        case StorageManager.TYPE_INTERACTION:
                            scale = 0.8; break;
                        case StorageManager.TYPE_EMOTICON:
                            scale = 0.8; break;
                        case StorageManager.TYPE_VOUCHER:
                            scale = 0.75; break;
                    }
                    cell._layout.getChildByName("img").setScale(scale);
                    cell._layout.getChildByName("shadow").setScale(scale);
                }
                else{
                    cell._layout.getChildByName("img").setVisible(false);
                    cell._layout.getChildByName("shadow").setVisible(false);
                }
                this.listItem.pushBackCustomItem(cell);
            }
        }
        this.selectId(-1);
    },

    selectId: function(id){
        if (id == -1)
            this.setData(null);
        else
            this.setData({type: this.selectedType, id: id, index: -1});
    },

    setData: function(data){
        this.data = data;
        this.currentNum.setString("");
        this.currentTime.setString("");
        this.boxUnlocked.setSelected(false);
        this.boxHad.setSelected(false);
        this.textNum.setString("");
        this.textTime.setString("");
        this.pPreview.removeAllChildren();
        if (!this.data) return;

        var sprite = new cc.Sprite(StorageManager.getItemIconPath(this.data.type, null, this.data.id));
        switch(Number(this.data.type)){
            case StorageManager.TYPE_AVATAR: sprite.setScale(1); break;
            case StorageManager.TYPE_INTERACTION: sprite.setScale(1.5); break;
            case StorageManager.TYPE_EMOTICON: sprite.setScale(1.5); break;
            case StorageManager.TYPE_VOUCHER: sprite.setScale(1.25); break;
        }
        sprite.setPosition(this.pPreview.width/2, this.pPreview.height/2);
        this.pPreview.addChild(sprite);

        var itemConfig = StorageManager.getInstance().itemConfig[this.data.type][this.data.id];
        this.boxUnlocked.setSelected(VipManager.getInstance().getRealVipLevel() >= itemConfig.vip && userMgr.getLevel() >= itemConfig.level);
        if (this.data.index >= 0){
            this.boxHad.setSelected(true);
            var itemInfo = StorageManager.getInstance().userItemInfo[this.data.type][this.data.id][this.data.index];
            this.currentNum.setString(itemInfo.num < 0 ? '\u221e' : itemInfo.num);
            if (itemInfo.remainTime < 0) this.currentTime.setString('\u221e');
            else {
                var s = Math.ceil(itemInfo.remainTime/1000);
                var m = Math.floor(s/60);
                s -= m * 60;
                var h = Math.floor(m/60);
                m -= h * 60;
                var d = Math.floor(h/24);
                h -= d * 24;
                this.currentTime.setString(d + "d" + h + "h" + m + "p" + s + "s");
            }
        }
    },

    resetListItem: function(){
        for (var i = 0; i < this.listItem.getItems().length; i++){
            this.itemCells.push(this.listItem.getItem(i));
        }
        this.listItem.removeAllChildren();
    },

    sendCheat: function(offset){
        if (this.textDiamond.getString() != ""){
            var diamond = parseInt(this.textDiamond.getString());
            if (!isNaN(diamond))
                StorageManager.getInstance().sendCheatDiamond(diamond * offset);
        }
        if (this.data){
            var num = parseInt(this.textNum.getString());
            num = offset * (isNaN(num) ? 0 : num);
            var remainTime = this.textTime.getString();
            var match;
            if (remainTime == "") remainTime = 0;
            else if (remainTime.match(/^[0-9]+$/))
                remainTime = parseInt(remainTime) * 1000 * offset;
            else if ((match = remainTime.match(/^(?:([0-9]+)d)?(?:([0-9]+)h)?(?:([0-9]+)p)?(?:([0-9]+)s)?$/))){
                var d = match[1] ? parseInt(match[1]) : 0;
                var h = match[2] ? parseInt(match[2]) : 0;
                var m = match[3] ? parseInt(match[3]) : 0;
                var s = match[4] ? parseInt(match[4]) : 0;
                remainTime = (((d * 24 + h) * 60 + m) * 60 + s) * 1000 * offset;
            }
            StorageManager.getInstance().sendCheatItem(this.data.type, this.data.id, this.data.index, num, remainTime);
        }

        this.clearCheat();
    },

    clearCheat: function(){
        this.textDiamond.setString("");
        this.currentNum.setString("");
        this.currentTime.setString("");
        this.boxUnlocked.setSelected(false);
        this.boxHad.setSelected(false);
        this.textNum.setString("");
        this.textTime.setString("");
        this.pHelp.setVisible(false);


        this.selectType(this.selectedType);
    }
});
StorageCheatGUI.className = "StorageCheatGUI";
StorageCheatGUI.BTN_CLOSE = 0;
StorageCheatGUI.BTN_HELP = 1;
StorageCheatGUI.BTN_ADD = 2;
StorageCheatGUI.BTN_SUB = 3;
StorageCheatGUI.BTN_RESET = 4;
StorageCheatGUI.BTN_CLEAR = 5;
StorageCheatGUI.BTN_SELECT_CURRENT = 6;

StorageCheatGUI.TYPE_NAMES = {};
StorageCheatGUI.TYPE_NAMES[StorageManager.TYPE_AVATAR] = "Avatar";
StorageCheatGUI.TYPE_NAMES[StorageManager.TYPE_INTERACTION] = "Interaction";
StorageCheatGUI.TYPE_NAMES[StorageManager.TYPE_EMOTICON] = "Emoticon";
StorageCheatGUI.TYPE_NAMES[StorageManager.TYPE_VOUCHER] = "Voucher";

var ChatEmoGUI = BaseLayer.extend({
    ctor: function() {
        this._super(ChatEmoGUI.className);

        this.btnClose = null;
        this.btnList = null;
        this.bgLock = null;
        this.lockText = null;
        this.pItem = null;
        this.prototypeCell = null;
        this.prototypeItems = [];

        this.tbSize = null;
        this.tbPos = null;
        this.cellSize = null;
        this.emoSize = null;
        this.emoPos = [];

        this.emoData = [];
        this.selectedTab = -1;

        this.initWithBinaryFile("Lobby/ChatEmoGUI.json");
    },

    /* region Base Flows */
    initGUI: function() {
        this.btnClose = this.customButton("btnClose", ChatEmoGUI.BTN_CLOSE);
        this.bg = this.getControl("bg");
        this.bg.defaultPosition = this.bg.getPosition();
        this.bg.setCascadeOpacityEnabled(true);
        this.btnList = this.getControl("btnList", this.bg);
        this.btnList.setScrollBarEnabled(false);
        this.btnList.addEventListener(function(lv, type){
            switch(type){
                case ccui.ListView.ON_SELECTED_ITEM_END:
                    this.selectTab(lv.getCurSelectedIndex());
            }
        }.bind(this), this);

        this.bgLock = this.getControl("bgLock", this.bg);
        this.lockText = this.getControl("text", this.bgLock);
        this.pItem = this.getControl("emoPanel", this.bg);
        this.pItem.setVisible(false);
        this.pItem.setLocalZOrder(1);
        this.pItem.setTouchEnabled(true);
        this.prototypeCell = this.getControl("emoCell", this.pItem);
        this.numCol = this.prototypeCell.getChildrenCount();
        for (var i = 0; i < this.numCol; i++) {
            this.prototypeItems.push(this.prototypeCell.getChildByName("emoItem" + i));
            this.emoPos.push(this.prototypeItems[i].getPosition());
        }

        this.tbSize = this.pItem.getContentSize();
        this.tbPos = this.pItem.getPosition();
        this.cellSize = this.prototypeCell.getContentSize();
        this.emoSize = this.prototypeItems[0].getContentSize();

        //init table emo
        this.tbEmo = new cc.TableView(this, this.tbSize);
        this.tbEmo.setAnchorPoint(0, 0);
        this.tbEmo.setPosition(this.tbPos);
        this.tbEmo.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.tbEmo.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.tbEmo.setDelegate(this);
        this.tbEmo.setCascadeOpacityEnabled(true);
        this.tbEmo.getContainer().setCascadeOpacityEnabled(true);
        this.bg.addChild(this.tbEmo);
        this.bg.setTouchEnabled(true);

        this.setBackEnable(true);
    },

    onEnterFinish: function() {
        this.readyToUse = false;
        this.emoData = [];
        if (StorageManager.getInstance().itemConfig) {
            var emoConfig = StorageManager.getInstance().itemConfig[StorageManager.TYPE_EMOTICON];
            if (emoConfig && StorageManager.getInstance().userItemInfo[StorageManager.TYPE_EMOTICON]) {
                for (var emoId in emoConfig) {
                    var emoItemConfig = emoConfig[emoId];
                    if (!emoItemConfig.enable) continue;
                    var emo = {
                        id: emoId,
                        vip: emoItemConfig.vip,
                        level: emoItemConfig.level,
                        listItemId: emoItemConfig.listItemId.slice(),
                        subTypes: []
                    };
                    if (emoItemConfig.groups) {
                        var groups = emoItemConfig.groups;
                        emo.groups = [];
                        for (var i in groups) {
                            emo.groups.push({
                                listItemId: groups[i]["listItemId"],
                                vip: groups[i]["vip"],
                                level: groups[i]["level"]
                            });
                        }
                        emo.listItemId.sort(function (a, b) {
                            var idxA = 0, idxB = 0;
                            for (var i = 0; i < this.length; i++) {
                                if (this[i].listItemId.indexOf(Number(a)) != -1) idxA = i;
                                if (this[i].listItemId.indexOf(Number(b)) != -1) idxB = i;
                            }
                            return idxA - idxB;
                        }.bind(emo.groups))
                    }
                    for (var subType in emoItemConfig.subTypes) {
                        emo.subTypes.push(Number(subType));
                    }
                    this.emoData.push(emo);
                }
            }
        }

        this.btnList.removeAllChildren();
        for (var i in this.emoData){
            var emoId = this.emoData[i].id;

            var btnActive = new cc.Sprite("Storage/emo_panel/tabActive" + emoId + ".png");
            var btnSize = btnActive.getContentSize();
            btnActive.setAnchorPoint(0, 0);
            var timeText = new ccui.Text("", "fonts/tahomabd.ttf", 12);
            timeText.setAnchorPoint(0.5, 0.5);
            timeText.setPosition(38, 9);
            timeText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            timeText.ignoreContentAdaptWithSize(true);
            timeText.enableOutline(cc.color("#be4929"), 1);

            var btnInactive = new cc.Sprite("Storage/emo_panel/tabInactive" + emoId + ".png");
            btnInactive.setAnchorPoint(0.5, 0.5);
            btnInactive.setPosition(this.getBtnTabInactivePos(emoId));

            var panel = new ccui.Layout();
            panel.setContentSize(btnSize);
            panel.addChild(btnInactive, 0, "inactive");
            panel.addChild(btnActive, 0, "active");
            panel.addChild(timeText, 0, "time");
            panel.setTouchEnabled(true);
            panel.setSwallowTouches(false);

            this.btnList.pushBackCustomItem(panel);
        }
        if (this.emoData.length > 0)
            this.selectTab(this.selectedTab);
        else{
            this.selectedTab = -1;
        }
    },

    onButtonRelease: function(button, id) {
        if (!this.readyToUse) return;
        switch (id) {
            case ChatEmoGUI.BTN_CLOSE:
                this.hide();
                break;
        }
    },

    onBack: function() {
        this.onButtonRelease(null, ChatEmoGUI.BTN_CLOSE);
    },

    show: function(id) {
        if (id !== undefined){
            for (var i = 0; i < this.emoData.length; i++){
                if (this.emoData[i].id == id) {
                    this.selectTab(i);
                }
            }
        }
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

    hide: function() {
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
            }.bind(this))
        ))
    },
    /* endregion Base Flows */

    //table delegate
    tableCellAtIndex: function(table, idx) {
        var cell = table.dequeueCell();
        if (!cell)
            cell = new ChatEmoCell(this.numCol, this.emoSize, this.emoPos, this.cellSize, this);

        var emoData = [];
        var data = this.emoData[this.selectedTab];
        for (var i = idx * this.numCol; i < data.listItemId.length && i < (idx + 1) * this.numCol; i++){
            var emo = {
                id: data.id,
                emoId: data.listItemId[i],
                animType: StorageManager.getEmoticonAnimationType(data.id),
                scale: this.getEmoticonScale(data.id)
            };
            if (data.groups){
                for (var j = 0; j < data.groups.length; j++){
                    if (data.groups[j].listItemId.indexOf(Number(emo.emoId)) != -1){
                        if (VipManager.getInstance().getRealVipLevel() < data.groups[j].vip) {
                            emo.isLock = true;
                            emo.lockMess = "Vip " + data.groups[j].vip;
                        }
                        else if (userMgr.getLevel() < data.groups[j].level){
                            emo.isLock = true;
                            emo.lockMess = "Level " + data.groups[j].level;
                        }
                        else emo.isLock = false;
                        break;
                    }
                }
            }
            else emo.isLock = false;

            emoData.push(emo);
        }

        cell.setColor(this.isLock ? cc.color("#aaaaaa") : cc.color("#ffffff"));
        cell.setOpacity(this.isLock ? 100 : 255);
        cell.setData(emoData);
        return cell;
    },

    tableCellSizeForIndex: function(table, idx) {
        return this.cellSize;
    },

    numberOfCellsInTableView: function(table) {
        if (!this.emoData[this.selectedTab]) return 0;
        else return Math.ceil(this.emoData[this.selectedTab].listItemId.length / this.numCol);
    },

    selectTab: function(id) {
        var oldSelectedTab = this.selectedTab;
        if (id < 0 || id >= this.emoData.length) id = 0;
        this.selectedTab = id;
        this.setSelectedButton(this.selectedTab);

        if (VipManager.getInstance().getRealVipLevel() < this.emoData[this.selectedTab].vip)
            this.setLock(true, "Cần vip #d để mở khóa".replace("#d",  this.emoData[this.selectedTab].vip));
        else if (userMgr.getLevel() < this.emoData[this.selectedTab].level)
            this.setLock(true, "Cần level #d để mở khóa".replace("#d", this.emoData[this.selectedTab].level));
        else{
            var emoId = this.emoData[this.selectedTab].id;
            var selectedEmoInfo = StorageManager.getInstance().userItemInfo[StorageManager.TYPE_EMOTICON][emoId];
            if (selectedEmoInfo)
                this.setLock(false);
            else{
                if (this.emoData[this.selectedTab].subTypes.indexOf(StorageManager.SUBTYPE_EMOTICON.LIMIT_7_DAY) != -1
                    || this.emoData[this.selectedTab].subTypes.indexOf(StorageManager.SUBTYPE_EMOTICON.LIMIT_30_DAY) != -1)
                    this.setLock(true, "Mở khóa trong cửa hàng");
                else if (this.emoData[this.selectedTab].subTypes.indexOf(StorageManager.SUBTYPE_EMOTICON.EVENT_ONLY) != -1)
                    this.setLock(true, "Mở khóa trong sự kiện");
                else
                    this.setLock(true, "Bộ biểu cảm đang bị tạm khóa");
            }
        }

        this.tbEmo.reloadData();
    },

    setSelectedButton: function(id){
        for (var i = 0; i < this.btnList.getItems().length; i++){
            var btn = this.btnList.getItem(i);
            btn.getChildByName("inactive").setVisible(i != id);
            btn.getChildByName("active").setVisible(i == id);
            btn.getChildByName("time").setVisible(i == id);

            if (i == id){
                var emoId = this.emoData[i].id;
                var selectedEmoInfo = StorageManager.getInstance().userItemInfo[StorageManager.TYPE_EMOTICON][emoId];
                if (selectedEmoInfo){
                    var remainTime = selectedEmoInfo[0].remainTime;
                    if (remainTime < 0) btn.getChildByName("time").setVisible(false);
                    else{
                        var m = Math.ceil(remainTime / 60000);
                        var h = Math.floor(m / 60);
                        m -= h * 60;
                        var d = Math.floor(h / 24);
                        h -= d * 24;
                        var timeStr = "";
                        if (d > 0)
                            timeStr = d + "d" + ":" + (h < 10 ? "0":"") + h + "h";
                        else
                            timeStr = (h < 10 ? "0":"") + h + "h" + ":" + (m < 10 ? "0":"") + m + "p";
                        btn.getChildByName("time").setString(timeStr);
                    }
                }
                else btn.getChildByName("time").setVisible(false);
            }
        }
    },

    setLock: function(isLock, mess){
        this.bgLock.setVisible(isLock);
        this.pItem.setVisible(isLock);
        this.tbEmo.setColor(cc.color(100, 100, 100));
        this.isLock = isLock;
        if (isLock)
            this.lockText.setString(mess);
    },

    useEmoticon: function(emoIdx){
        if (!this.readyToUse || !this.emoData[this.selectedTab]) return;
        var id = this.emoData[this.selectedTab].id;
        var emoId = this.emoData[this.selectedTab].listItemId[emoIdx];
        StorageManager.getInstance().sendUseEmoticon(id, emoId);
        this.hide();
    },

    //switch case things
    getBtnTabInactivePos: function(emoId){
        switch(Number(emoId)){
            case 0:
                return cc.p(35, 45);
            case 1:
                return cc.p(36, 49);
        }
        return cc.p(0, 0);
    },

    getEmoticonScale: function(emoId){
        switch(Number(emoId)){
            case 0:
                return 0.7;
            case 1:
                return 0.1;
        }
        return 1;
    }
});

ChatEmoGUI.className = "ChatEmoGUI";
ChatEmoGUI.BTN_CLOSE = 0;
ChatEmoGUI.GUI_TAG = 820;

ChatEmoGUI.TYPE_DRAGONBONE = 0;
ChatEmoGUI.TYPE_SPINE = 1;

var ChatEmoCell = cc.TableViewCell.extend({
    ctor: function(numCol, emoSize, emoPos, cellSize, chatEmoGUI) {
        this._super();
        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);

        this.numCol = numCol;
        this.emoSize = emoSize;
        this.emoPos = emoPos;
        this.cellSize = cellSize;
        this.chatEmoGUI = chatEmoGUI;

        this._layout = new cc.Layer(this.cellSize.width, this.cellSize.height);
        this._layout.setCascadeColorEnabled(true);
        this._layout.setCascadeOpacityEnabled(true);
        this.addChild(this._layout);

        for (var i = 0; i < this.numCol; i++){
            var panel = new ccui.Layout();
            panel.setContentSize(this.emoSize);
            panel.setPosition(this.emoPos[i]);
            panel.setTouchEnabled(true);
            panel.setSwallowTouches(false);
            panel.setCascadeColorEnabled(true);
            panel.setCascadeOpacityEnabled(true);
            panel.addTouchEventListener(function(target, type){
                if (target.isLock) return;
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
                        if (target.isWaitingTouch){
                            this.chatEmoGUI.useEmoticon(this.getIdx() * this.numCol + target.getTag());
                        }
                        break;
                    case ccui.Widget.TOUCH_CANCELED:
                        break;
                }
            }.bind(this), this);

            panel.emoLock = new cc.Sprite("Storage/emo_panel/emoLock.png");
            panel.emoLock.setAnchorPoint(0.5, 0.5);
            panel.emoLock.setPosition(this.emoSize.width/2, this.emoSize.height/2);
            panel.addChild(panel.emoLock, 1, 0);
            panel.lockText = new ccui.Text("", "fonts/tahoma.ttf", 13);
            panel.lockText.setAnchorPoint(0.5, 0.5);
            panel.lockText.setPosition(this.emoSize.width/2, 28);
            panel.lockText.setTextColor(cc.color("#e8dff0"));
            panel.lockText.ignoreContentAdaptWithSize(true);
            panel.lockText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            panel.lockText.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
            panel.addChild(panel.lockText, 1, 1);

            this._layout.addChild(panel, 0, i);
        }

        this.cacheAnim = [];
        for (var i = 0; i < this.numCol; i++)
            this.cacheAnim.push({});
    },

    setData: function(emoData) {
        for (var i = 0; i < this.numCol; i++){
            var panel = this._layout.getChildByTag(i);
            if (i >= emoData.length) panel.setVisible(false);
            else{
                panel.setVisible(true);
                var emo = emoData[i];
                panel.emoLock.setVisible(emo.isLock);
                panel.lockText.setVisible(emo.isLock);
                panel.isLock = emo.isLock;
                if (emo.isLock){
                    panel.lockText.setString(emo.lockMess);
                }

                panel.removeChildByTag(999);
                var anim;
                switch(emo.animType) {
                    case StorageManager.ANIM_TYPE_DRAGONBONES:
                        anim = this.cacheAnim[i][emo.id];
                        if (!anim){
                            anim = db.DBCCFactory.getInstance().buildArmatureNode("Emoticon" + emo.id);
                            anim.setPosition(this.emoSize.width / 2, this.emoSize.height / 2);
                            anim.retain();
                            anim.setScale(emo.scale);
                            this.cacheAnim[i][emo.id] = anim;
                        }
                        anim.getAnimation().gotoAndPlay("" + emo.emoId, -1, -1, 0);
                        break;
                    case StorageManager.ANIM_TYPE_SPINE:
                        if (!this.cacheAnim[i][emo.id])
                            this.cacheAnim[i][emo.id] = {};
                        anim = this.cacheAnim[i][emo.id][emo.emoId];
                        if (!anim){
                            anim = new CustomSkeleton("Armatures/Emoticon/" + emo.id, emo.emoId);
                            anim.setPosition(this.emoSize.width / 2, this.emoSize.height / 2);
                            anim.retain();
                            anim.setScale(emo.scale);
                            anim.setAnimation(0, 'animation', true);
                            this.cacheAnim[i][emo.id][emo.emoId] = anim;
                        }
                        break;
                }
                panel.addChild(anim, 0, 999);
            }
        }
    }
});

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

var UIAvatarFrame = cc.Node.extend({
    ctor: function(defaultUrl){
        this._super();
        this.setCascadeOpacityEnabled(true);
        this.width = UIAvatarFrame.WIDTH;
        this.height = UIAvatarFrame.HEIGHT;
        if (defaultUrl === undefined) defaultUrl = "";
        this.defaultUrl = defaultUrl;
        this.currentUrl = "";

        this.avatarFrame = new cc.Sprite();
        this.avatarFrame.setAnchorPoint(0.5, 0.5);
        this.addChild(this.avatarFrame);
    },

    reload: function() {
        this.currentUrl = StorageManager.getInstance().getUserAvatarFramePath();
        if (!this.currentUrl || this.currentUrl === "")
            this.currentUrl = this.defaultUrl;
        if (this.currentUrl === "") {
            this.avatarFrame.setTexture(null);
        }
        else this.avatarFrame.setTexture(this.currentUrl === "" ? null : this.currentUrl);
        this.avatarFrame.setScale(this.width/this.avatarFrame.width);
    },

    getWidth: function() {
        return this.width;
    },

    getHeight: function() {
        return this.height;
    },

    getSize: function() {
        return cc.size(this.width, this.height);
    },

    isShow: function() {
        return this.currentUrl !== "";
    }
});
UIAvatarFrame.WIDTH = 180;
UIAvatarFrame.HEIGHT = 180;

var BoardVoucherGUI = BaseLayer.extend({
    ctor: function() {
        this._super(BoardVoucherGUI.className);

        this.time = null;
        this.img = null;
        this.btnVoucher = null;
        this.voucherRef = null;
        this.hasVoucher = false;

        this.initWithBinaryFile("Lobby/BoardVoucherGUI.json");
    },

    initGUI: function() {
        this.btnVoucher = this.getControl("btnVoucher");
        this.btnVoucher.defaultPosition = this.btnVoucher.getPosition();
        this.img = this.getControl("img");
        this.img.ignoreContentAdaptWithSize(true);
        this.time = this.getControl("time");
        this.time.ignoreContentAdaptWithSize(true);
    },

    onEnterFinish: function() {
        this.hasVoucher = false;
        this.voucherRef = null;
        this.btnVoucher.setVisible(false);
        this.onUpdateGUI();
    },

    onUpdateGUI: function() {
        this.unschedule(this.update);
        var currentVoucher = StorageManager.getInstance().getCurrentBoardVoucher();
        if (currentVoucher) this.voucherRef = currentVoucher.ref;
        else this.voucherRef = null;
        if (this.voucherRef){
            this.img.loadTexture(currentVoucher.imgPath);
            this.setTime(this.voucherRef.remainTime);
            if (!this.hasVoucher){
                this.hasVoucher = true;
                this.btnVoucher.setVisible(true);
                this.btnVoucher.setPositionX(cc.winSize.width + this.btnVoucher.width);
                this.btnVoucher.setOpacity(0);
                this.btnVoucher.stopAllActions();
                this.btnVoucher.runAction(cc.spawn(
                    cc.fadeIn(1),
                    cc.moveTo(1, this.btnVoucher.defaultPosition.x, this.btnVoucher.defaultPosition.y).easing(cc.easeBackOut())
                ));
            }
            this.schedule(this.update, 1);
        }
        else{
            this.setTime(0);
            if (this.hasVoucher){
                this.hasVoucher = false;
                this.btnVoucher.setVisible(true);
                this.btnVoucher.setPositionX(this.btnVoucher.defaultPosition.x);
                this.btnVoucher.setOpacity(255);
                this.btnVoucher.stopAllActions();
                this.btnVoucher.runAction(cc.sequence(
                    cc.spawn(
                        cc.fadeOut(1),
                        cc.moveTo(1, cc.winSize.width + this.btnVoucher.width, this.btnVoucher.defaultPosition.y).easing(cc.easeBackIn())
                    )
                ));
            }
        }
    },

    onButtonRelease: function(button, id) {
        switch(id) {
            case BoardVoucherGUI.BTN_VOUCHER:
                break;
        }
    },

    update: function(dt) {
        if (this.voucherRef && this.voucherRef.remainTime){
            this.setTime(this.voucherRef.remainTime);
        }
        else this.setTime(0);
    },

    setTime: function(remainTime) {
        var s = Math.ceil(remainTime / 1000);
        var m = Math.floor(s / 60);
        s -= m * 60;
        var h = Math.floor(m / 60);
        m -= h * 60;
        var textColor;
        if (h > 0){
            this.time.setString((h < 10 ? "0" : "") + h + "h:" + (m < 10 ? "0" : "") + m + "p");
            textColor = cc.color("#4FFF95");
        }
        else{
            this.time.setString((m < 10 ? "0" : "") + m + "p:" + (s < 10 ? "0" : "") + s + "s");
            if (m >= 5) textColor = cc.color("#4FFF95");
            else textColor = cc.color("#FF6A6A");
        }
        this.time.setTextColor(textColor);
    }
});
BoardVoucherGUI.className = "BoardVoucherGUI";
BoardVoucherGUI.GUI_TAG = 318;
BoardVoucherGUI.BTN_VOUCHER = 0;

var StorageNotifyGUI = BaseLayer.extend({
    ctor: function() {
        this._super(StorageNotifyGUI.className);

        this.bg = null;
        this.btnNext = null;
        this.btnPrev = null;
        this.btnGo = null;
        this.btnDone = null;

        this.pagination = null;
        this.pageView = null;

        this.initWithBinaryFile("Lobby/StorageNotifyGUI.json");
    },

    initGUI: function() {
        this.bg = this.getControl("bg");
        this.btnNext = this.customButton("btnNext", StorageNotifyGUI.BTN_NEXT, this.bg);
        this.btnNext.defaultPosition = this.btnNext.getPosition();
        this.btnPrev = this.customButton("btnPrev", StorageNotifyGUI.BTN_PREV, this.bg);
        this.btnPrev.defaultPosition = this.btnPrev.getPosition();
        this.btnGo = this.customButton("btnGo", StorageNotifyGUI.BTN_GO, this.bg);
        this.btnDone = this.customButton("btnDone", StorageNotifyGUI.BTN_DONE, this.bg);

        this.pagination = this.getControl("pagination", this.bg);
        this.pageView = this.getControl("pageView", this.bg);
        for (var i = 0; i < this.pagination.getChildrenCount(); i++){
            this.pagination.getChildByName(i).index = i;
            this.pagination.getChildByName(i).addEventListener(function(box, type){
                switch(type){
                    case ccui.CheckBox.EVENT_UNSELECTED:
                        box.setSelected(true);
                        break;
                    case ccui.CheckBox.EVENT_SELECTED:
                        this.pageView.scrollToPage(box.index);
                        this.resetPageViewButtons();
                        break;
                }
            }.bind(this), this);
        }
        this.pageView.addEventListener(function(pageView, type){
            switch(type){
                case ccui.PageView.EVENT_TURNING:
                    this.resetPageViewButtons();
            }
        }.bind(this), this);
        this.pageView.setCustomScrollThreshold(0.2);
        this.enableFog();

        var page = this.pageView.getPage(0);
        page.itemAvatar = this.getControl("itemAvatar", page);
        page.itemVoucher = this.getControl("itemVoucher", page);
        page.title = this.getControl("title", page);

        page = this.pageView.getPage(1);
        page.itemStorage = this.getControl("itemStorage", page);
        page.itemShop = this.getControl("itemShop", page);
        page.title = this.getControl("title", page);

        page = this.pageView.getPage(2);
        page.itemDiamond = this.getControl("itemDiamond", page);
        page.textDiamond = this.getControl("textDiamond", page);
        page.textDiamond.defaultSize = page.textDiamond.getContentSize();
        page.title = this.getControl("title", page);
    },

    onEnterFinish: function() {
        this.pageView.setTouchEnabled(false);
        this.doEffectIn();
        this.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(function(){
                this.pageView.setVisible(true);
                this.doEffectPageIn(0);
            }.bind(this))
        ));
    },

    onButtonRelease: function(button, id) {
        switch(id) {
            case StorageNotifyGUI.BTN_PREV:
                this.pageView.scrollToPage(this.pageView.getCurPageIndex() - 1);
                this.resetPageViewButtons();
                break;
            case StorageNotifyGUI.BTN_NEXT:
                this.pageView.scrollToPage(this.pageView.getCurPageIndex() + 1);
                this.resetPageViewButtons();
                break;
            case StorageNotifyGUI.BTN_GO:
                var delay = this.doEffectPageOut(this.pageView.getCurPageIndex());
                this.runAction(cc.sequence(
                    cc.delayTime(delay),
                    cc.callFunc(function(){
                        this.pageView.setCurPageIndex(this.pageView.getCurPageIndex() + 1);
                        this.doEffectPageIn(this.pageView.getCurPageIndex());
                    }.bind(this))
                ));
                break;
            case StorageNotifyGUI.BTN_DONE:
                this.btnDone.setTouchEnabled(false);
                StorageManager.getInstance().waitDiamondNewItem = true;
                StorageManager.getInstance().sendPopUpNewItem();
                var delay = this.doEffectPageOut(this.pageView.getCurPageIndex());
                this.btnNext.setVisible(false);
                this.btnPrev.setVisible(false);
                this.pagination.setVisible(false);
                this.runAction(cc.sequence(
                    cc.delayTime(delay),
                    cc.callFunc(function(){
                        this.pageView.setVisible(false);
                        this.doEffectOut();
                    }.bind(this)),
                    cc.delayTime(0.75),
                    cc.callFunc(function(){
                        var scene = sceneMgr.getMainLayer();
                        if (scene instanceof LobbyScene) {
                            effectMgr.runLabelPoint(scene._uiDiamond, userMgr.getDiamond() - StorageManager.getInstance().diamondNewItem, userMgr.getDiamond(), 0.5);
                        }
                        popUpManager.removePopUp(PopUpManager.NEW_ITEM);
                    }),
                    cc.removeSelf()
                ));
                break;
        }
    },

    resetAllPositions: function() {
        var page = this.pageView.getPage(0);
        this.resetDefaultPosition(page.itemAvatar);
        this.resetDefaultPosition(page.itemVoucher);
        this.resetDefaultPosition(page.title);
        page.itemAvatar.setOpacity(255);
        page.itemVoucher.setOpacity(255);
        page.title.setScale(1);

        page = this.pageView.getPage(1);
        this.resetDefaultPosition(page.itemStorage);
        this.resetDefaultPosition(page.itemShop);
        this.resetDefaultPosition(page.title);
        page.itemStorage.setOpacity(255);
        page.itemShop.setOpacity(255);
        page.title.setScale(1);

        page = this.pageView.getPage(2);
        this.resetDefaultPosition(page.itemDiamond);
        this.resetDefaultPosition(page.title);
        page.itemDiamond.setOpacity(255);
        page.textDiamond.setContentSize(page.textDiamond.defaultSize);
        page.title.setOpacity(255);
    },
    //effect
    doEffectIn: function() {
        this._fog.setVisible(true);
        this._fog.setOpacity(0);
        this._fog.stopAllActions();
        this._fog.runAction(cc.fadeTo(0.25, 150));

        this.pageView.setVisible(false);
        this.pagination.setVisible(false);
        this.btnPrev.setVisible(false);
        this.btnNext.setVisible(false);
        this.btnGo.setVisible(false);
        this.btnDone.setVisible(false);

        this.bg.setVisible(true);
        this.bg.setScaleX(0);
        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.delayTime(0.25),
            cc.scaleTo(0.5, this._scale, this._scale).easing(cc.easeExponentialOut())
        ));

        this.doEffectButtons();
    },

    doEffectOut: function() {
        this._fog.stopAllActions();
        this._fog.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.fadeOut(0.25)
        ));

        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.delayTime(0.25),
            cc.scaleTo(0.25, 0, this._scale).easing(cc.easeExponentialIn())
        ));

        this.btnDone.setTouchEnabled(false);
        this.btnDone.stopAllActions();
        this.btnDone.runAction(cc.sequence(
            cc.spawn(
                cc.fadeOut(0.25),
                cc.scaleTo(0.25, 0).easing(cc.easeBackIn())
            ),
            cc.callFunc(function(){
                var scene = sceneMgr.getMainLayer();
                if (scene instanceof LobbyScene) {
                    var btnDiamond = scene.btnDiamond;
                    var pEnd = btnDiamond.convertToWorldSpace(btnDiamond.getChildByName("icon").getPosition());
                    effectMgr.flyItemEffect(
                        sceneMgr.layerGUI,
                        "Lobby/LobbyGUI/iconDiamond.png",
                        100,
                        this.btnDone.convertToWorldSpace(cc.p(this.btnDone.width / 2, this.btnDone.height / 2)),
                        pEnd, 0, true, false
                    );
                }
            }.bind(this))
        ));
    },

    doEffectButtons: function() {
        this.btnNext.stopAllActions();
        this.btnNext.runAction(cc.sequence(
            cc.moveTo(0.4, this.btnNext.defaultPosition.x + 8, this.btnNext.defaultPosition.y).easing(cc.easeSineOut()),
            cc.moveTo(0.4, this.btnNext.defaultPosition)
        ).repeatForever());
        this.btnPrev.stopAllActions();
        this.btnPrev.runAction(cc.sequence(
            cc.moveTo(0.4, this.btnPrev.defaultPosition.x - 8, this.btnPrev.defaultPosition.y).easing(cc.easeSineOut()),
            cc.moveTo(0.4, this.btnPrev.defaultPosition)
        ).repeatForever());
    },

    doEffectPageIn: function(index) {
        var page = this.pageView.getPage(index);
        page.title.setScale(0);
        page.title.setPositionY(page.title.defaultPos.y - 10);
        page.title.stopAllActions();
        page.title.runAction(cc.spawn(
            cc.scaleTo(0.25, 1).easing(cc.easeBackOut()),
            cc.moveTo(0.25, page.title.defaultPos).easing(cc.easeBackOut())
        ));

        var btn = null;
        if (index < this.pageView.getPages().length - 1){
            btn = this.btnGo;
        }
        else{
            btn = this.btnDone;
        }
        btn.setVisible(true);
        btn.setTouchEnabled(false);
        btn.setOpacity(0);
        btn.setPositionY(btn.defaultPos.y - 50);
        btn.stopAllActions();
        btn.runAction(cc.sequence(
            cc.delayTime(1),
            cc.spawn(
                cc.fadeIn(0.5),
                cc.moveTo(0.5, btn.defaultPos).easing(cc.easeBackOut())
            ),
            cc.callFunc(function(){
                btn.setTouchEnabled(true)
            }.bind(this))
        ));
        switch(index){
            case 0:
                page.itemAvatar.setOpacity(0);
                page.itemAvatar.setPositionX(this.pageView.width + page.itemAvatar.width/2);
                page.itemAvatar.stopAllActions();
                page.itemAvatar.getChildByName("text").setOpacity(0);
                page.itemAvatar.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.fadeIn(0.5),
                        cc.moveTo(0.5, page.itemAvatar.defaultPos).easing(cc.easeQuarticActionOut())
                    ),
                    cc.delayTime(0.25),
                    cc.callFunc(function(){
                        page.itemAvatar.getChildByName("text").runAction(cc.fadeIn(0.5))
                    })
                ));

                page.itemVoucher.setOpacity(0);
                page.itemVoucher.setPositionX(-page.itemVoucher.width/2);
                page.itemVoucher.stopAllActions();
                page.itemVoucher.getChildByName("text").setOpacity(0);
                page.itemVoucher.runAction(cc.sequence(
                    cc.delayTime(0.5),
                    cc.spawn(
                        cc.fadeIn(0.5),
                        cc.moveTo(0.5, page.itemVoucher.defaultPos).easing(cc.easeQuarticActionOut())
                    ),
                    cc.callFunc(function(){
                        page.itemVoucher.getChildByName("text").runAction(cc.fadeIn(0.5))
                    })
                ));
                break;
            case 1:
                page.itemStorage.setOpacity(0);
                page.itemStorage.setPositionX(this.pageView.width + page.itemStorage.width/2);
                page.itemStorage.stopAllActions();
                page.itemStorage.getChildByName("text").setOpacity(0);
                page.itemStorage.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.fadeIn(0.5),
                        cc.moveTo(0.5, page.itemStorage.defaultPos).easing(cc.easeQuarticActionOut())
                    ),
                    cc.delayTime(0.25),
                    cc.callFunc(function(){
                        page.itemStorage.getChildByName("text").runAction(cc.fadeIn(0.5))
                    })
                ));

                page.itemShop.setOpacity(0);
                page.itemShop.setPositionX(-page.itemShop.width/2);
                page.itemShop.stopAllActions();
                page.itemShop.getChildByName("text").setOpacity(0);
                page.itemShop.runAction(cc.sequence(
                    cc.delayTime(0.5),
                    cc.spawn(
                        cc.fadeIn(0.5),
                        cc.moveTo(0.5, page.itemShop.defaultPos).easing(cc.easeQuarticActionOut())
                    ),
                    cc.callFunc(function(){
                        page.itemShop.getChildByName("text").runAction(cc.fadeIn(0.5))
                    })
                ));
                break;
            case 2:
                page.itemDiamond.setScale(0);
                page.itemDiamond.setOpacity(0);
                page.itemDiamond.setRotation(0);
                page.itemDiamond.stopAllActions();
                page.itemDiamond.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.scaleTo(0.5, 1).easing(cc.easeBackOut()),
                        cc.fadeIn(0.5),
                        cc.rotateBy(0.5, 360).easing(cc.easeExponentialOut())
                    )
                ));

                page.textDiamond.setContentSize(page.textDiamond.defaultSize.x, 0);
                page.textDiamond.timer = 0;
                page.textDiamond.schedule(function(dt){
                    this.timer += dt;
                    if (this.timer < 0.75) return;
                    if (this.timer >= 1)
                        this.timer = 1;
                    this.setContentSize(this.defaultSize.width, (this.timer-0.75) / 0.25 * this.defaultSize.height);
                    this.getChildByName("text").setPositionY(this.getContentSize().height);

                    if (this.timer == 1)
                        this.unscheduleAllCallbacks();
                }.bind(page.textDiamond));

                this.runAction(cc.sequence(
                    cc.delayTime(1),
                    cc.callFunc(function(){
                        this.resetAllPositions();
                        this.pageView.setTouchEnabled(true);
                        this.pagination.setVisible(true);
                        this.resetPageViewButtons();
                    }.bind(this))
                ));
                break;
        }
    },

    doEffectPageOut: function(index) {
        var page = this.pageView.getPage(index);
        if (this.btnGo.isVisible()) {
            this.btnGo.setTouchEnabled(false);
            this.btnGo.stopAllActions();
            this.btnGo.runAction(cc.sequence(
                cc.spawn(
                    cc.fadeOut(0.5),
                    cc.moveTo(0.5, this.btnGo.defaultPos.x, this.btnGo.defaultPos.y - 50).easing(cc.easeBackIn())
                ),
                cc.callFunc(function () {
                    if (index == this.pageView.getPages().length - 2)
                        this.btnGo.setVisible(false);
                }.bind(this))
            ));
        }
        switch(index){
            case 0:
                page.itemAvatar.stopAllActions();
                page.itemAvatar.runAction(cc.sequence(
                    cc.delayTime(0.5),
                    cc.spawn(
                        cc.fadeOut(0.5),
                        cc.moveTo(0.5, -page.itemAvatar.width/2, page.itemAvatar.defaultPos.y).easing(cc.easeSineOut())
                    )
                ));

                page.itemVoucher.stopAllActions();
                page.itemVoucher.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.fadeOut(0.5),
                        cc.moveTo(0.5, this.pageView.width + page.itemVoucher.width/2, page.itemVoucher.defaultPos.y).easing(cc.easeSineOut())
                    )
                ));

                page.title.stopAllActions();
                page.title.runAction(cc.sequence(
                    cc.delayTime(0.75),
                    cc.spawn(
                        cc.scaleTo(0.25, 0).easing(cc.easeBackIn()),
                        cc.moveTo(0.25, page.title.defaultPos.x, page.title.defaultPos.y - 10).easing(cc.easeBackIn())
                    )
                ));

                return 1;
                break;
            case 1:
                page.itemStorage.stopAllActions();
                page.itemStorage.runAction(cc.sequence(
                    cc.delayTime(0.5),
                    cc.spawn(
                        cc.fadeOut(0.5),
                        cc.moveTo(0.5, -page.itemStorage.width/2, page.itemStorage.defaultPos.y).easing(cc.easeSineOut())
                    )
                ));

                page.itemShop.stopAllActions();
                page.itemShop.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.fadeOut(0.5),
                        cc.moveTo(0.5, this.pageView.width + page.itemShop.width/2, page.itemShop.defaultPos.y).easing(cc.easeSineOut())
                    )
                ));

                page.title.stopAllActions();
                page.title.runAction(cc.sequence(
                    cc.delayTime(0.75),
                    cc.spawn(
                        cc.scaleTo(0.25, 0).easing(cc.easeBackIn()),
                        cc.moveTo(0.25, page.title.defaultPos.x, page.title.defaultPos.y - 10).easing(cc.easeBackIn())
                    )
                ));

                return 1;
                break;
            case 2:
                page.itemDiamond.stopAllActions();
                page.itemDiamond.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.scaleTo(0.5, 0).easing(cc.easeBackIn()),
                        cc.fadeOut(0.5),
                        cc.rotateBy(0.5, -360).easing(cc.easeExponentialIn())
                    )
                ));

                page.textDiamond.timer = 0;
                page.textDiamond.schedule(function(dt){
                    this.timer += dt;
                    if (this.timer >= 0.25)
                        this.timer = 0.25;
                    this.setContentSize(this.defaultSize.width, (0.25 - this.timer) / 0.25 * this.defaultSize.height);
                    this.getChildByName("text").setPositionY(this.getContentSize().height);

                    if (this.timer == 0.25)
                        this.unscheduleAllCallbacks();
                }.bind(page.textDiamond));

                page.title.stopAllActions();
                page.title.runAction(cc.sequence(
                    cc.delayTime(0.75),
                    cc.spawn(
                        cc.scaleTo(0.25, 0).easing(cc.easeBackIn()),
                        cc.moveTo(0.25, page.title.defaultPos.x, page.title.defaultPos.y - 10).easing(cc.easeBackIn())
                    )
                ));

                return 1;
                break;
        }
    },

    resetPageViewButtons: function(){
        this.btnPrev.setVisible(this.pageView.getCurPageIndex() > 0);
        this.btnNext.setVisible(this.pageView.getCurPageIndex() < this.pageView.getPages().length - 1);
        for (var i = 0; i < this.pagination.getChildrenCount(); i++){
            this.pagination.getChildByName(i).setSelected(i == this.pageView.getCurPageIndex());
        }
    }
});
StorageNotifyGUI.className = "StorageNotifyGUI";
StorageNotifyGUI.GUI_TAG = 381;
StorageNotifyGUI.BTN_PREV = 0;
StorageNotifyGUI.BTN_NEXT = 1;
StorageNotifyGUI.BTN_DONE = 2;
StorageNotifyGUI.BTN_GO = 3;

var ItemNotifyGUI = BaseLayer.extend({
    ctor: function() {
        this._super(ItemNotifyGUI.className);

        this.bg = null;
        this.text = null;
        this.listView = null;
        this.btnOK = null;
        this.cellCache = [];

        this.initWithBinaryFile("Lobby/ItemNotifyGUI.json");
    },

    initGUI: function() {
        this.bg = this.getControl("bg");
        this.text = this.getControl("text", this.bg);
        this.text.ignoreContentAdaptWithSize(true);
        this.btnOK = this.customButton("btnOK", ItemNotifyGUI.BTN_OK, this.bg);
        this.btnUse = this.customButton("btnUse", ItemNotifyGUI.BTN_USE, this.bg);
        this.listView = this.getControl("listView", this.bg);
        this.listView.setScrollBarEnabled(false);

        this.enableFog();
    },

    onEnterFinish: function() {
        this.setShowHideAnimate(this.bg, true);
    },

    onButtonRelease: function(button, id) {
        switch (id) {
            case ItemNotifyGUI.BTN_OK:
                this.onClose();
                break;
            case ItemNotifyGUI.BTN_USE:
                if (this.itemData) {
                    switch (this.itemData.type) {
                        case StorageManager.TYPE_AVATAR:
                            StorageManager.getInstance().sendUseItem(this.itemData.type, this.itemData.id, this.itemData.index);
                            break;
                        case StorageManager.TYPE_VOUCHER:
                            var voucherSubType = StorageManager.getInstance().getItemSubTypes(StorageManager.TYPE_VOUCHER, this.itemData.id)[0];
                            var curVoucher = StorageManager.getInstance().getCurrentVoucherBySubType(voucherSubType);
                            if (curVoucher != null) {
                                var confirmMess = "Bạn có chắc muốn sử dụng voucher này?\nVoucher cùng loại đang sử dung sẽ bị\nthay thế và xóa khỏi kho đồ.";
                                sceneMgr.showOkCancelDialog(confirmMess, this, function(id){
                                    if (id == Dialog.BTN_OK){
                                        StorageManager.getInstance().sendUseItem(this.itemData.type, this.itemData.id, this.itemData.index);
                                    }
                                }.bind(this));
                            }
                            else
                                StorageManager.getInstance().sendUseItem(this.itemData.type, this.itemData.id, this.itemData.index);
                            break;
                    }
                }
                this.onClose();
                break;
        }
    },

    show: function(data, type){
        this.text.setString(data.mess);
        var itemList = data.itemList;
        this.itemData = null;

        for (var i = 0; i < itemList.length; i++){
            var cell = this.getNewCell();
            var itemData = itemList[i];
            switch(itemData.type){
                case StorageManager.TYPE_AVATAR:
                    itemData.scale = 0.6;
                    break;
                case StorageManager.TYPE_INTERACTION:
                    itemData.scale = 1;
                    break;
                case StorageManager.TYPE_EMOTICON:
                    itemData.scale = 1;
                    break;
                case StorageManager.TYPE_VOUCHER:
                    itemData.scale = 0.75;
                    break;
            }
            cell.setData(itemData);
            this.listView.addChild(cell);
        }
        if (itemList.length < ItemNotifyGUI.MAX_ITEM){
            this.listView.setContentSize(cc.size(ItemNotifyCell.SIZE * itemList.length + this.listView.getItemsMargin() * (itemList.length - 1), ItemNotifyCell.SIZE));
            this.listView.setBounceEnabled(false);
        }
        else{
            this.listView.setContentSize(cc.size(ItemNotifyCell.SIZE * ItemNotifyGUI.MAX_ITEM + this.listView.getItemsMargin() * (ItemNotifyGUI.MAX_ITEM - 1), ItemNotifyCell.SIZE));
            this.listView.setBounceEnabled(true);
        }

        if (type == ItemNotifyGUI.TYPE_UNLOCK_ITEM){
            this.listView.setTouchEnabled(false);
            this.listView.jumpToLeft();
            for (var i = 0; i < this.listView.getItems().length; i++)
                this.listView.getItem(i).setLock();
            this.btnOK.setTouchEnabled(false);
            this.btnOK.setOpacity(0);
            this.btnOK.stopAllActions();
            this.btnUse.setTouchEnabled(false);
            this.btnUse.setOpacity(0);
            this.btnUse.stopAllActions();
            if (itemList.length == 1){
                this.itemData = itemList[0];
                switch(this.itemData.type){
                    case StorageManager.TYPE_AVATAR:
                        this.itemData.index = this.itemData.index || 0;
                        this.showBtnUse(this.itemData.id != StorageManager.getInstance().usingAvatarId);
                        break;
                    case StorageManager.TYPE_VOUCHER:
                        if (this.itemData.index)
                            this.showBtnUse(true);
                        break;
                    case StorageManager.TYPE_EMOTICON:
                    case StorageManager.TYPE_INTERACTION:
                        this.showBtnUse(false);
                        break;
                }
            }
            else this.showBtnUse(false);
            this.effectUnlock(0);
        }
        else {
            this.listView.setClippingEnabled(true);
            this.itemData = itemList[0];
            switch(this.itemData.type){
                case StorageManager.TYPE_AVATAR:
                    this.showBtnUse(this.itemData.id != StorageManager.getInstance().usingAvatarId);
                    break;
                case StorageManager.TYPE_VOUCHER:
                    this.showBtnUse(true);
                    break;
                case StorageManager.TYPE_EMOTICON:
                case StorageManager.TYPE_INTERACTION:
                    this.showBtnUse(false);
                    break;
            }
        }
    },

    getNewCell: function() {
        var cell;
        if (this.cellCache.length == 0){
            cell = new ItemNotifyCell();
            cell.retain();
        }
        else
            cell = this.cellCache.shift();
        cell.resetEffect();
        return cell;
    },

    effectUnlock: function(curIndex) {
        this.listView.setClippingEnabled(false);
        var numItem = this.listView.getItems().length;
        var count = 0;
        for (var i = 0; i < numItem; i++){
            var item = this.listView.getItem(i);
            if (i < curIndex || i >= curIndex + ItemNotifyGUI.MAX_ITEM) {
                if (curIndex > numItem - ItemNotifyGUI.MAX_ITEM)
                    item.setVisible(i >= numItem - ItemNotifyGUI.MAX_ITEM);
                else
                    item.setVisible(false);
            }
            else{
                item.setVisible(true);
                item.effectUnlock();
                count++;
            }
        }

        curIndex += count;
        if (curIndex < numItem){
            var nextCount = numItem - curIndex;
            var percent;
            if (nextCount < ItemNotifyGUI.MAX_ITEM)
                percent = 100;
            else{
                var nextIndex = curIndex + (ItemNotifyGUI.MAX_ITEM - 1)/2;
                percent = (ItemNotifyCell.SIZE/2 + nextIndex*(ItemNotifyCell.SIZE + this.listView.getItemsMargin()) - this.listView.width/2)
                    / (ItemNotifyCell.SIZE * numItem + this.listView.getItemsMargin() * (numItem-1) - this.listView.width) * 100;
            }
            this.runAction(cc.sequence(
                cc.delayTime(3),
                cc.callFunc(function(){
                    for (var i = 0; i < this.listView.getItems().length; i++){
                        this.listView.getItem(i).setVisible(true);
                    }
                    this.listView.setClippingEnabled(true);
                    this.listView.scrollToPercentHorizontal(percent, 0.25, true);
                }.bind(this)),
                cc.delayTime(0.25),
                cc.callFunc(function(){
                    this.effectUnlock(curIndex);
                }.bind(this))
            ));
        }
        else{
            this.btnOK.runAction(cc.sequence(
                cc.delayTime(3),
                cc.callFunc(function(){
                    this.listView.setTouchEnabled(true);
                    this.listView.setClippingEnabled(true);
                    this.listView.scrollToLeft(0.25, true);
                    for (var i = 0; i < this.listView.getItems().length; i++){
                        this.listView.getItem(i).setVisible(true);
                    }
                }.bind(this)),
                cc.fadeIn(0.25),
                cc.callFunc(function(){
                    this.setTouchEnabled(true);
                }.bind(this.btnOK))
            ));
            this.btnUse.runAction(cc.sequence(
                cc.delayTime(3),
                cc.fadeIn(0.25),
                cc.callFunc(function(){
                    this.setTouchEnabled(true);
                }.bind(this.btnUse))
            ));
        }
    },

    showBtnUse: function(show){
        this.btnUse.setVisible(show);
        if (show){
            this.btnUse.setPosition(this.btnUse.defaultPos);
            this.btnOK.setPosition(this.btnOK.defaultPos);
        }
        else this.btnOK.setPositionX(this.bg.width/2);
    },

    onExit: function() {
        this._super();
        for (var i = 0; i < this.listView.getItems().length; i++){
            this.cellCache.push(this.listView.getItem(i));
        }
        this.listView.removeAllChildren();
    }
});
ItemNotifyGUI.className = "ItemNotifyGUI";
ItemNotifyGUI.GUI_TAG = 3020;
ItemNotifyGUI.BTN_OK = 0;
ItemNotifyGUI.BTN_USE = 1;

ItemNotifyGUI.TYPE_BUY_ITEM = 0;
ItemNotifyGUI.TYPE_UNLOCK_ITEM = 1;
ItemNotifyGUI.MAX_ITEM = 3;

var ItemNotifyCell = ccui.Layout.extend({
    ctor: function() {
        this._super();
        this.setContentSize(ItemNotifyCell.SIZE, ItemNotifyCell.SIZE);
        this._layout = ccs.load("Lobby/ItemNotifyCell.json").node;

        this.padding = (ItemNotifyCell.SIZE - ItemNotifyCell.INNER_SIZE)/2;
        this._layout.setPosition(this.padding, this.padding);
        this.addChild(this._layout);

        this.bg = this._layout.getChildByName("bg");
        this.img = this.bg.getChildByName("img");
        this.img.ignoreContentAdaptWithSize(true);
        this.shadow = this.bg.getChildByName("shadow");
        this.shadow.ignoreContentAdaptWithSize(true);
        this.text = this.bg.getChildByName("text");
        this.text.ignoreContentAdaptWithSize(true);

        this.bgLock = this.bg.getChildByName("bgLock");
        this.lock = this.bg.getChildByName("lock");
        this.unlock = this.bg.getChildByName("unlock");
        this.unlock.defaultPosition = this.unlock.getPosition();
        this.light1 = this.bg.getChildByName("light1");
        this.light2 = this.bg.getChildByName("light2");
        this.light3 = this.bg.getChildByName("light3");

        this.effHL = db.DBCCFactory.getInstance().buildArmatureNode("Highlight");
        this.effHL.setPosition(this.bg.width/2, this.bg.height/2);
        this.bg.addChild(this.effHL);
        this.effHL.setCompleteListener(function(){
            this.setVisible(false);
        }.bind(this.effHL));
    },

    resetEffect: function() {
        this.bgLock.setVisible(false);
        this.bgLock.stopAllActions();
        this.lock.setVisible(false);
        this.lock.stopAllActions();
        this.unlock.setVisible(false);
        this.unlock.stopAllActions();
        this.light1.setVisible(false);
        this.light1.stopAllActions();
        this.light2.setVisible(false);
        this.light2.stopAllActions();
        this.light3.setVisible(false);
        this.light3.stopAllActions();

        this.effHL.setVisible(false);
        this.effHL.stopAllActions();
        this.stopAllActions();
    },

    setLock: function() {
        this.bgLock.setVisible(true);
        this.bgLock.setOpacity(255);
        this.lock.setVisible(true);
        this.lock.runAction(cc.sequence(
            cc.rotateTo(0.025, 10),
            cc.rotateTo(0.05, -10),
            cc.rotateTo(0.025, 0)
        ).repeatForever());
    },

    setData: function(itemData){
        this.img.loadTexture(itemData.path);
        this.shadow.loadTexture(itemData.path);
        this.img.setScale(itemData.scale);
        this.shadow.setScale(itemData.scale);

        this.text.setString(itemData.text);
    },

    effectUnlock: function() {
        this.bgLock.setVisible(true);
        this.bgLock.setOpacity(255);
        this.bgLock.runAction(cc.sequence(
            cc.delayTime(2),
            cc.fadeOut(1)
        ));

        this.lock.setVisible(true);
        this.lock.runAction(cc.sequence(
            cc.delayTime(1.5),
            cc.hide()
        ));

        this.unlock.setOpacity(255);
        this.unlock.setPosition(this.unlock.defaultPosition.x, this.unlock.defaultPosition.y + 10);
        this.unlock.runAction(cc.sequence(
            cc.delayTime(1.5),
            cc.show(),
            cc.spawn(
                cc.sequence(cc.delayTime(0.5), cc.fadeOut(1)),
                cc.moveBy(1.5, 0, -20)
            )
        ));

        this.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(function(){
                this.effHL.setVisible(true);
                this.effHL.gotoAndPlay("1", -1, -1, 1);
            }.bind(this))
        ));

        this.effHL.setOpacity(255);
        this.effHL.runAction(cc.sequence(
            cc.delayTime(2),
            cc.fadeOut(0.5)
        ));

        this.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function(){
                this.effectLight();
            }.bind(this))
        ));
    },

    effectLight: function() {
        this.light1.setVisible(true);
        this.light2.setVisible(true);
        this.light3.setVisible(true);

        this.light1.setOpacity(0);
        this.light1.setScale(0.4);
        this.light2.setOpacity(0);
        this.light2.setScale(0.8);
        this.light3.setOpacity(0);
        this.light3.setScale(0.8);

        this.light3.stopAllActions();
        this.light3.runAction(cc.rotateBy(2, 60));
        this.light3.runAction(cc.sequence(cc.fadeIn(1), cc.fadeOut(1)));

        this.light2.stopAllActions();
        this.light2.runAction(cc.rotateBy(2, 30));
        this.light2.runAction(cc.sequence(cc.fadeIn(1), cc.fadeOut(1)));

        this.light1.stopAllActions();
        this.light1.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(1.25, 0.8), cc.fadeIn(1.25)),
            cc.spawn(cc.scaleTo(0.75, 1), cc.fadeOut(0.75))
        ));
    }
});

ItemNotifyCell.SIZE = 110;
ItemNotifyCell.INNER_SIZE = 100;