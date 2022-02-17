/**
 * Created by sonbnt on 3/3/2021
 */

var StorageManager = BaseMgr.extend({
    ctor: function() {
        this._super();
        this.resetData();
        cc.director.getScheduler().schedule(this.update, this, 1, cc.REPEAT_FOREVER, 0, false, "StorageUpdate");
    },

    /* region Data Manipulating */
    resetData: function() {
        this.itemConfig = null;
        this.shopItemConfig = null;
        this.usingAvatarId = -1;
        this.levelEnableItem = 9999;

        this.userItemInfo = {};
        this.avatarInfo = {};
        this.interactionInfo = {};
        this.emoticonInfo = {};
        this.voucherInfo = {};

        this.waitShowNotify = false;
        this.diamondNewItem = false;
        this.waitDiamondNewItem = false;
        this.waitShowUnlockItemVip = false;
        this.dataUnlockItemVip = null;
        this.waitShowUnlockItemLevel = false;
        this.dataUnlockItemLevel = null;
        this.waitShowUnlockItemRank = false;
        this.dataUnlockItemRank = null;
        this.cacheOtherAvatarId = {}
    },

    update: function(dt) {
        for (var type in this.userItemInfo){
            var typeInfo = this.userItemInfo[type];
            for (var itemId in typeInfo){
                var itemInfo = typeInfo[itemId];
                for (var i = 0; i < itemInfo.length; i++){
                    var item = itemInfo[i];
                    if (item.remainTime <= 0) continue;
                    item.remainTime -= dt * 1000;
                    if (item.remainTime <= 0) {
                        item.remainTime = 0;
                        this.sendCheckExpire(type, itemId, i);
                    }
                }
            }
        }
        if (this.shopItemConfig){
            var expired = false;
            for (var type in this.shopItemConfig){
                var typeInfo = this.shopItemConfig[type];
                for (var itemId in typeInfo.listItem){
                    var itemInfo = typeInfo.listItem[itemId];
                    if (itemInfo.remainTime < 0) continue;
                    itemInfo.remainTime -= dt * 1000;
                    if (itemInfo.remainTime <= 0){
                        delete typeInfo.listItem[itemId];
                        expired = true;
                    }
                }
            }
            if (expired){
                var scene = sceneMgr.getMainLayer();
                if (scene instanceof ShopIapScene)
                    scene.onUpdateGUI();
            }
        }
    },
    /* endregion Data Manipulating */

    /* region GUI Controllers */
    openStorage: function() {
        if (CheckLogic.checkInBoard()){
            this.openInboardStorageGUI();
        }
        else this.openStorageScene();
    },

    openStorageScene: function() {
        this.openStorageSceneAtTab(StorageScene.BTN_AVATAR_TAB);
    },

    openStorageSceneAtTab: function(id) {
        if (!this.checkEnableItem()){
            return;
        }
        this.currentTab = id;
        sceneMgr.openScene(StorageScene.className);
    },

    openInboardStorageGUI: function() {
        this.openInboardStorageGUIAtTab(InboardStorageGUI.BTN_AVATAR_TAB);
    },

    openInboardStorageGUIAtTab: function(id) {
        if (!this.checkEnableItem()){
            return;
        }
        this.currentTab = id;
        var gui = sceneMgr.openGUI(InboardStorageGUI.className, InboardStorageGUI.GUI_TAG, InboardStorageGUI.GUI_TAG);
        gui.show();
    },

    openChatEmoGUI: function(id){
        id = id || -1;
        var gui = sceneMgr.openGUI(ChatEmoGUI.className, ChatEmoGUI.GUI_TAG, ChatEmoGUI.GUI_TAG);
        gui.show(id);
    },

    showNotifyStorage: function() {
        if (this.waitShowNotify){
            if (popUpManager.canShow(PopUpManager.NEW_ITEM)) {
                this.waitShowNotify = false;
                sceneMgr.openGUI(StorageNotifyGUI.className, PopUpManager.NEW_ITEM, PopUpManager.NEW_ITEM, false);
            }
        }
    },

    showUnlockItemVip: function() {
        if (this.waitShowUnlockItemVip){
            this.waitShowUnlockItemVip = false;
            this.showUnlockItem(this.dataUnlockItemVip);
            this.dataUnlockItemVip = null;
            return true;
        }
        else return false;
    },

    showUnlockItemLevel: function() {
        if (this.waitShowUnlockItemLevel){
            this.waitShowUnlockItemLevel = false;
            this.showUnlockItem(this.dataUnlockItemLevel);
            this.dataUnlockItemLevel = null;
            return true;
        }
        else return false;
    },

    showUnlockItemRank: function() {
        if (this.waitShowUnlockItemRank){
            this.waitShowUnlockItemRank = false;
            this.showUnlockItem(this.dataUnlockItemRank);
            this.dataUnlockItemRank = null;
            return true;
        }
        else return false;
    },

    showUnlockItem: function(data) {
        var gui = sceneMgr.openGUI(ItemNotifyGUI.className, ItemNotifyGUI.GUI_TAG, ItemNotifyGUI.GUI_TAG);
        gui.show(data, ItemNotifyGUI.TYPE_UNLOCK_ITEM);
    },
    /* endregion GUI Controllers */

    /* region Listener and Handlers */
    onReceived: function(cmd, data) {
        switch(cmd){
            case StorageManager.CMD_GET_ITEM_CONFIG:
                var pk = new CmdReceivedGetItemConfig(data);
                pk.clean();
                this.onReceiveItemConfig(pk);
                return true;
            case StorageManager.CMD_GET_USER_ITEM_INFO:
                var pk = new CmdReceivedGetUserItemInfo(data);
                cc.log("CMD_GET_USER_ITEM_INFO" + JSON.stringify(pk));
                pk.clean();
                this.onReceiveUserItemInfo(pk);
                return true;
            case StorageManager.CMD_GET_SHOP_ITEM_CONFIG:
                var pk = new CmdReceivedGetShopItemConfig(data);
                pk.clean();
                this.onReceiveShopItemConfig(pk);
                return true;
            case StorageManager.CMD_CHEAT_ITEM:
                var pk = new CmdReceivedCheatItem(data);
                pk.clean();
                Toast.makeToast(Toast.SHORT, "Cheat item response: " + pk.status);
                return true;
            case StorageManager.CMD_CHEAT_DIAMOND:
                var pk = new CmdReceivedCheatDiamond(data);
                pk.clean();
                Toast.makeToast(Toast.SHORT, "Cheat diamond response: " + pk.status);
                return true;
            case StorageManager.CMD_USE_ITEM:
                var pk = new CmdReceivedUseItem(data);
                pk.clean();
                this.onReceiveUseItem(pk);
                return true;
            case StorageManager.CMD_USE_INTERACT:
                var pk = new CmdReceivedUseInteract(data);
                pk.clean();
                this.onReceiveUseInteract(pk);
                return true;
            case StorageManager.CMD_USE_EMOTICON:
                var pk = new CmdReceivedUseEmoticon(data);
                pk.clean();
                this.onReceiveUseEmoticon(pk);
                return true;
            case StorageManager.CMD_BUY_ITEM:
                var pk = new CmdReceivedBuyItem(data);
                pk.clean();
                this.onReceiveBuyItem(pk);
                return true;
            case StorageManager.CMD_BONUS_VOUCHER_IN_SHOP:
                var pk = new CmdReceivedBonusVoucherInShop(data);
                pk.clean();
                // this.onReceiveBonusVoucherInShop(pk);
                return true;
            case StorageManager.CMD_UNLOCK_ITEM:
                var pk = new CmdReceivedUnlockItem(data);
                pk.clean();
                this.onReceiveUnlockItem(pk);
                return true;
            case StorageManager.CMD_POP_UP_NEW_ITEM:
                var pk = new CmdReceivedPopUpNewItem(data);
                pk.clean();
                this.onReceivePopUpNewItem(pk);
                return true;
            case StorageManager.CMD_ITEM_INFO_FROM_ALL:
                var pk = new CmdReceivedItemInfoFromAll(data);
                pk.clean();
                this.onReceiveItemInfoFromAll(pk);
                return true;
            case StorageManager.CMD_ITEM_INFO_TO_ALL:
                var pk = new CmdReceivedItemInfoToAll(data);
                pk.clean();
                this.onReceiveItemInfoToAll(pk);
                return true;
        }
    },

    onReceiveItemConfig: function(pk) {
        //rewrite config
        this.itemConfig = {};

        for (var typeName in pk.itemConfig) {
            var typeData = pk.itemConfig[typeName];
            var type = typeData["type"];
            var typeConfig = {};
            for (var subTypeName in typeData["listSubType"]) {
                var subTypeData = typeData["listSubType"][subTypeName];
                var subType = subTypeData["subType"];
                for (var itemName in subTypeData["listItem"]) {
                    var itemData = subTypeData["listItem"][itemName];
                    var id = itemData["id"];
                    if (typeConfig[id] == null) {
                        typeConfig[id] = {
                            id: id,
                            name: itemData["name"],
                            description: itemData["description"],
                            enable: itemData["enable"],
                            vip: itemData["vip"],
                            level: itemData["level"],
                            listItemId: itemData["listItemId"],
                            groups: itemData["groups"],
                            bonusType: itemData["bonusType"],
                            bonusValue: itemData["bonusValue"],
                            bonusTime: itemData["bonusTime"],
                            subTypes: {}
                        }
                    }
                    typeConfig[id].subTypes[subType] = {
                        subType: subType,
                        price: itemData["price"],
                        startTime: itemData["startTime"],
                        expireTime: itemData["expireTime"]
                    };
                }
            }
            this.itemConfig[type] = typeConfig;
        }
        this.levelEnableItem = pk.levelEnableItem;

        cc.log("Item Config: " + JSON.stringify(this.itemConfig));
        this.sendGetShopItemConfig();

        var scene = sceneMgr.getMainLayer();
        if (scene instanceof StorageScene){
            scene.onUpdateGUI();
        }
        else if (scene instanceof LobbyScene){
            scene.onUpdateGUI();
        }
        else if (scene instanceof ShopIapScene){
            scene.onUpdateGUI();
        }
        else if (CommonLogic.checkInBoard()){
            var gui;
            gui = sceneMgr.getGUIByClassName(BoardVoucherGUI.className);
            if (gui) gui.onUpdateGUI();
            gui = sceneMgr.getGUIByClassName(InboardStorageGUI.className);
            if (gui) gui.onUpdateGUI();
        }

    },

    onReceiveUserItemInfo: function(pk) {
        //NEW
        this.userItemInfo = {};
        this.usingAvatarId = -1;

        this.avatarInfo = {};
        for (var i in pk.avatarId){
            this.avatarInfo[pk.avatarId[i]] = [{
                status: pk.avatarStatus[i],
                num: 1,
                remainTime: pk.avatarRemainTime[i]
            }];
            if (pk.avatarStatus[i] == StorageManager.ITEM_STATUS.USING)
                this.usingAvatarId = pk.avatarId[i];
        }
        this.userItemInfo[StorageManager.TYPE_AVATAR] = this.avatarInfo;

        this.interactionInfo = {};
        for (var i in pk.interactionId){
            this.interactionInfo[pk.interactionId[i]] = [{
                status: pk.interactionStatus[i],
                num: pk.interactionNum[i],
                remainTime: pk.interactionRemainTime[i]
            }];
        }
        this.userItemInfo[StorageManager.TYPE_INTERACTION] = this.interactionInfo;

        this.emoticonInfo = {};
        for (var i in pk.emoticonId){
            this.emoticonInfo[pk.emoticonId[i]] = [{
                status: pk.emoticonStatus[i],
                num: pk.emoticonNum[i],
                remainTime: pk.emoticonRemainTime[i]
            }];
        }
        this.userItemInfo[StorageManager.TYPE_EMOTICON] = this.emoticonInfo;

        this.voucherInfo = {};
        while (pk.voucherId.length > 0) {
            var curVoucherId = pk.voucherId.shift();
            if (this.voucherInfo[curVoucherId] == null)
                this.voucherInfo[curVoucherId] = [];
            this.voucherInfo[curVoucherId].push({
                status: pk.voucherStatus.shift(),
                num: pk.voucherNum.shift(),
                remainTime: pk.voucherRemainTime.shift()
            });
        }
        this.userItemInfo[StorageManager.TYPE_VOUCHER] = this.voucherInfo;

        cc.log("User Item Info: " + JSON.stringify(this.userItemInfo));

        var scene = sceneMgr.getMainLayer();
        if (scene instanceof StorageScene){
            scene.onUpdateGUI();
        }
        else if (scene instanceof LobbyScene){
            scene.onUpdateGUI();
        }
        else if (scene instanceof ShopIapScene){
            scene.onUpdateGUI();
        }
        else if (CommonLogic.checkInBoard()){
            var gui;
            gui = sceneMgr.getGUIByClassName(BoardVoucherGUI.className);
            if (gui && gui.getParent()) gui.onUpdateGUI();
            gui = sceneMgr.getGUIByClassName(InboardStorageGUI.className);
            if (gui && gui.getParent()) gui.onUpdateGUI();
        }
    },

    onReceiveShopItemConfig: function(pk) {
        this.shopItemConfig = {};
        var itemConfig = this.itemConfig;
        if (!itemConfig) {
            this.sendGetItemConfig();
            return;
        }

        for (var type in pk.shopItemConfig){
            var shopTypeConfig = {
                listItem: {},
                useType: StorageManager.getItemUseType(Number(type)),
                hasDiscount: false,
                hasLimitedItem: false
            };
            var listItemId = pk.shopItemConfig[type][0];
            var listItemSubType = pk.shopItemConfig[type][1];
            var listItemPrice = pk.shopItemConfig[type][2];
            var listItemTime = pk.shopItemConfig[type][3];
            for (var i = 0; i < listItemId.length; i++){
                var itemId = listItemId[i];
                var itemSubType = listItemSubType[i];
                var itemPrice = listItemPrice[i];
                if (!itemConfig[type][itemId].enable) continue;
                if (!shopTypeConfig.listItem[itemId]){
                    shopTypeConfig.listItem[itemId] = {
                        conditions: [],
                        options: [],
                        remainTime: listItemTime[i]
                    };
                    shopTypeConfig.listItem[itemId].conditions.push({
                        type: StorageManager.VIP_CONDITION,
                        num: this.itemConfig[type][itemId]["vip"]
                    });
                    shopTypeConfig.listItem[itemId].conditions.push({
                        type: StorageManager.LEVEL_CONDITION,
                        num: this.itemConfig[type][itemId]["level"]
                    });
                    if (listItemTime[i] >= 0) shopTypeConfig.hasLimitedItem = true;
                }
                var option;
                shopTypeConfig.listItem[itemId].options.push((option = {
                    subType: itemSubType,
                    price: itemPrice,
                    discount: Math.round(100 - (itemPrice*100 / this.itemConfig[type][itemId]["subTypes"][itemSubType]["price"])),  //percent
                    expireTime: this.itemConfig[type][itemId]["subTypes"][itemSubType]["expireTime"]
                }));
                if (option.discount > 0) shopTypeConfig.hasDiscount = true;
            }
            this.shopItemConfig[type] = shopTypeConfig;
        }

        var scene = sceneMgr.getMainLayer();
        if (scene instanceof ShopIapScene)
            scene.onUpdateGUI();

        cc.log("Shop Item Config: " + JSON.stringify(this.shopItemConfig));
    },

    onReceiveUseItem: function(pk) {
        switch(pk.status){
            case StorageManager.USE_ERROR.SUCCESS:
                Toast.makeToast(Toast.SHORT, "Sử dụng " + StorageManager.TYPE_NAMES[pk.type].toLowerCase() + " thành công!");
                break;
            case StorageManager.USE_ERROR.NO_ITEM:
                sceneMgr.showOKDialog("Có lỗi xảy ra.\nVật phẩm không tồn tại.");
                break;
            case StorageManager.USE_ERROR.OUT_OF_NUM:
                sceneMgr.showOKDialog("Có lỗi xảy ra.\nĐã sử dụng hết số lượng vật phẩm.");
                break;
            case StorageManager.USE_ERROR.OUT_OF_DATE:
                sceneMgr.showOKDialog("Có lỗi xảy ra.\nVật phẩm đã hết hạn sử dụng.");
                break;
        }
    },

    onReceiveUseInteract: function(pk) {
        var scene = sceneMgr.getMainLayer();
        if (CommonLogic.checkInBoard()){
            var startPos = scene.getPosFromServerChair(pk.startChair);
            var endPos = scene.getPosFromServerChair(pk.endChair);
            interactPlayer.playInteract(startPos, endPos, pk.id);
        }
    },

    onReceiveUseEmoticon: function(pk) {
        var scene = sceneMgr.getMainLayer();
        if (CommonLogic.checkInBoard()){
            scene.onUseEmoticon(pk.nChair, pk.id, pk.emoId);
        }
    },

    onReceiveBuyItem: function(pk) {
        switch(pk.status){
            case StorageManager.BUY_ERROR.SUCCESS:
                var scene = sceneMgr.getMainLayer();
                if (scene instanceof ShopIapScene) {
                    var itemData = {};
                    itemData.id = pk.id;
                    itemData.type = pk.type;
                    itemData.index = pk.index;
                    itemData.path = StorageManager.getItemIconPath(itemData.type, null, itemData.id);

                    switch (StorageManager.getItemUseType(itemData.type)) {
                        case StorageManager.USE_BY_TIME:
                            var itemConfig = this.itemConfig[itemData.type][itemData.id];
                            var subType = pk.subType;
                            itemData.text = itemConfig.subTypes[subType].expireTime + " ngày";
                            break;
                        case StorageManager.USE_BY_UNIT:
                            itemData.text = StringUtility.standartNumber(pk.num);
                            break;
                        case StorageManager.USE_ONCE:
                            itemData.text = StringUtility.standartNumber(pk.num);
                            break;
                    }

                    var mess = "Bạn đã sử dụng " + StringUtility.standartNumber(pk.price) + " kim cương\n để mua vật phẩm.";
                    var data = {
                        mess: mess,
                        itemList: [itemData]
                    };

                    var gui = sceneMgr.openGUI(ItemNotifyGUI.className, ItemNotifyGUI.GUI_TAG, ItemNotifyGUI.GUI_TAG);
                    gui.show(data, ItemNotifyGUI.TYPE_BUY_ITEM);
                }
                else{
                    Toast.makeToast(Toast.LONG, "Mua vật phẩm thành công.");
                }
                break;
            case StorageManager.BUY_ERROR.NOT_ENOUGH_DIAMOND:
                sceneMgr.showOKDialog("Không đủ kim cương!");
                break;
            case StorageManager.BUY_ERROR.ITEM_NOT_AVAILABLE:
                sceneMgr.showOKDialog("Vật phẩm không thể mua!");
                break;
        }
    },

    onReceiveBonusVoucherInShop: function(pk) {
        var mess = "";
        if (pk.bonusGold > 0) mess = pk.bonusGold + " Gold";
        else if (pk.bonusVPoint > 0) mess = pk.bonusVPoint + " VPoint";
        else return;
        mess = "Bạn nhận thêm " + mess + " từ voucher.\nVoucher sẽ được tự động xóa khỏi kho đồ.";
        sceneMgr.showOKDialog(mess);
    },

    onReceiveUnlockItem: function(pk) {
        var itemList = [];
        for (var i = 0; i < pk.ids.length; i++){
            var itemData = {};
            itemData.id = pk.ids[i];
            itemData.type = pk.types[i];
            itemData.path = StorageManager.getItemIconPath(itemData.type, null, itemData.id);

            switch (StorageManager.getItemUseType(itemData.type)) {
                case StorageManager.USE_BY_TIME:
                    if (pk.remainTimes[i] == 0) continue;
                    itemData.text = pk.remainTimes[i] >= 0 ? Math.ceil(pk.remainTimes[i]/1000/60/60/24) + " ngày" : "Vĩnh viễn";
                    break;
                case StorageManager.USE_BY_UNIT:
                    if (pk.nums[i] == 0) continue;
                    itemData.text = StringUtility.standartNumber(pk.nums[i]);
                    break;
                case StorageManager.USE_ONCE:
                    if (pk.remainTimes[i] == 0) continue;
                    itemData.text = StringUtility.standartNumber(pk.nums[i]);
                    break;
            }
            itemList.push(itemData);
        }

        var mess = "Bạn đã mở khóa các vật phẩm sau:";
        switch (pk.reason){
            case StorageManager.UNLOCK_REASON.LEVEL:
                mess = "Chúc mừng bạn đã đạt " + "level " + pk.newData + "!\nThêm nhiều vật phẩm đã được mở khóa!\nXin gửi bạn một món quà dùng thử.";
                break;
            case StorageManager.UNLOCK_REASON.VIP:
                mess = "Chúc mừng bạn đã đạt " + "vip " + pk.newData + "!\nThêm nhiều vật phẩm đã được mở khóa!\nXin gửi bạn một món quà dùng thử.";
                break;
            case StorageManager.UNLOCK_REASON.RANK:
                mess = "Chúc mừng bạn đã được xếp hạng Thần Bài ở tuần này!\nBạn nhận được phần thưởng Khung Thần bài 7 ngày.";
                break;
        }
        var data = {
            mess: mess,
            itemList: itemList
        };

        if (itemList.length > 0) {
            switch (pk.reason){
                case StorageManager.UNLOCK_REASON.LEVEL:
                    this.waitShowUnlockItemLevel = true;
                    this.dataUnlockItemLevel = data;
                    this.showUnlockItemLevel();
                    break;
                case StorageManager.UNLOCK_REASON.VIP:
                    this.waitShowUnlockItemVip = true;
                    this.dataUnlockItemVip = data;
                    break;
                case StorageManager.UNLOCK_REASON.RANK:
                    this.waitShowUnlockItemRank = true;
                    this.dataUnlockItemRank = data;
                    break;
                default:
                    this.showUnlockItem(data);
            }
        }
    },

    onReceivePopUpNewItem: function(pk) {
        this.waitShowNotify = true;
        this.diamondNewItem = pk.diamond;
        if (sceneMgr.getMainLayer() instanceof LobbyScene){
            this.showNotifyStorage();
        }
    },

    onReceiveItemInfoFromAll: function(pk) {
        for (var i = 0; i < pk.uIDs.length; i++){
            this.addOtherAvatarId(pk.uIDs[i], pk.avatarIds[i]);
        }

        var scene = sceneMgr.getMainLayer();
        if (CommonLogic.checkInBoard()) {
            for (var i = 0; i < pk.nChairs.length; i++) {
                if (pk.nChairs[i] != -1) {
                    scene.updateAvatarFrame(pk.nChairs[i], StorageManager.getAvatarFramePath(pk.avatarIds[i]));
                }
            }
        }
    },

    onReceiveItemInfoToAll: function(pk) {
        this.addOtherAvatarId(pk.uID, pk.avatarId);

        var scene = sceneMgr.getMainLayer();
        if (CommonLogic.checkInBoard()) {
            if (pk.nChair != -1){
                scene.updateAvatarFrame(pk.nChair, StorageManager.getAvatarFramePath(pk.avatarId));
            }
        }
    },
    /* endregion Listener and Handlers */

    /* region GET - SET */
    getItemSubTypes: function(type, id){
        if (!this.itemConfig) return [];
        var itemInfo = this.itemConfig[type][id];
        var subTypes = [];
        for (var subType in itemInfo.subTypes)
            subTypes.push(Number(subType))
        return subTypes;
    },
    /* endregion GET - SET */

    /* region Utility */

    /* region Utility */

    /* region Sender */
    sendGetItemConfig: function() {
        var pk = new CmdSendGetItemConfig();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendGetShopItemConfig: function() {
        var pk = new CmdSendGetShopItemConfig();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheckExpire: function(type, id, index) {
        var pk = new CmdSendCheckExpireItem();
        pk.putData(type, 0, id, index);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendUseItem: function(type, id, index) {
        var pk = new CmdSendUseItem();
        pk.putData(type, 0, id, index);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendUseInteract: function(nChair, id) {
        var pk = new CmdSendUseInteract();
        pk.putData(0, id, nChair);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendUseEmoticon: function(id, emoId) {
        var pk = new CmdSendUseEmoticon();
        pk.putData(0, id, emoId);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendBuyItem: function(type, subType, id, num) {
        var pk = new CmdSendBuyItem();
        pk.putData(type, subType, id, num);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendPopUpNewItem: function() {
        var pk = new CmdSendPopUpNewItem();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatReset: function() {
        var pk = new CmdSendCheatReset();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatDiamond: function(num) {
        var pk = new CmdSendCheatDiamond();
        pk.putData(num);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatItem: function(type, id, index, num, remainTime){
        var subType = this.getListSubTypes(type, id)[0];
        var pk = new CmdSendCheatItem();
        pk.putData([{type: type, id: id, index: index, num: num, remainTime: remainTime, subType: subType}]);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },
    /* region Sender */

    /* region APIs */
    getUserAvatarFramePath: function() {
        if (this.usingAvatarId == -1) return "";
        else
            return StorageManager.getItemIconPath(StorageManager.TYPE_AVATAR, null, this.usingAvatarId);
    },

    hasItemConfig: function() {
        return !!this.itemConfig;
    },

    hasShopConfig: function() {
        return !!this.shopItemConfig;
    },

    getCurrentShopVoucher: function() {
        return this.getCurrentVoucherBySubType(StorageManager.SUBTYPE_VOUCHER.USE_IN_SHOP);
    },

    getCurrentBoardVoucher: function() {
        return this.getCurrentVoucherBySubType(StorageManager.SUBTYPE_VOUCHER.USE_IN_ROOM);
    },

    getCurrentVoucherBySubType: function(subType){
        if (!this.itemConfig || !this.itemConfig[StorageManager.TYPE_VOUCHER])
            return null;
        if (!this.userItemInfo[StorageManager.TYPE_VOUCHER])
            return null;

        var voucherConfig = this.itemConfig[StorageManager.TYPE_VOUCHER];
        var voucherInfo = this.userItemInfo[StorageManager.TYPE_VOUCHER];
        for (var voucherId in voucherInfo){
            var voucherSubType = this.getItemSubTypes(StorageManager.TYPE_VOUCHER, voucherId)[0];
            if (voucherSubType != subType) continue;
            for (var i = 0; i < voucherInfo[voucherId].length; i++){
                var voucher = voucherInfo[voucherId][i];
                if (voucher.status == StorageManager.VOUCHER_STATUS.USING){
                    var bonusType = voucherConfig[voucherId].bonusType;
                    var bonusValue = voucherConfig[voucherId].bonusValue;
                    var imgPath = "";
                    switch(subType){
                        case StorageManager.SUBTYPE_VOUCHER.USE_IN_SHOP:
                            switch(bonusType) {
                                case StorageManager.BONUS_GOLD:
                                    imgPath = "Lobby/ShopIAP/gold" + bonusValue + ".png";
                                    break;
                                case StorageManager.BONUS_VPOINT:
                                    imgPath = "Lobby/ShopIAP/vPoint" + bonusValue + ".png";
                                    break;
                            }
                            break;
                        case StorageManager.SUBTYPE_VOUCHER.USE_IN_ROOM:
                            imgPath = "Lobby/Items/voucher/" + voucherId + ".png";
                            break;
                    }
                    var remainTime = voucher.remainTime;
                    return {bonusType: bonusType, bonusValue: bonusValue, imgPath: imgPath, ref: voucher};
                }
            }
        }
        return null;
    },

    checkEnableItem: function(){
        var open = this.levelEnableItem && userMgr.getLevel() >= this.levelEnableItem;
        if (!open){
            Toast.makeToast(Toast.LONG, "Lên level "+ this.levelEnableItem +" để mở khóa tính năng kho đồ.");
        }
        return open;
    },

    addOtherAvatarId: function(uID, avatarId){
        this.cacheOtherAvatarId[uID] = avatarId;
    },

    getListSubTypes: function(type, id){
        var subTypes = [];
        if (this.itemConfig){
            for (var subType in this.itemConfig[type][id].subTypes)
                subTypes.push(subType);
        }
        return subTypes;
    },

    canBuyItem: function(type, id){
        var typeConfig;
        if (this.shopItemConfig && (typeConfig = this.shopItemConfig[type])){
            var itemConfig;
            if ((itemConfig = typeConfig.listItem[id])){
                for (var i in itemConfig.conditions){
                    var cond = itemConfig.conditions[i];
                    switch(cond.type){
                        case StorageManager.VIP_CONDITION:
                            if (VipManager.getInstance().getRealVipLevel() < cond.num) return false;
                            break;
                        case StorageManager.LEVEL_CONDITION:
                            if (userMgr.getLevel() < cond.num) return false;
                            break;
                    }
                }
                return true;
            }
        }
        return false;
    },

    getExpiredText: function(type, subType, id){
        if (this.itemConfig){
            var typeConfig = this.itemConfig[type];
            if (typeConfig){
                var itemConfig = typeConfig[id];
                if (itemConfig){
                    var day = itemConfig.subTypes[subType].expireTime;
                    if (day < 0) return "Vĩnh viễn";
                    else return day + " ngày";
                }
            }
        }
        return "";
    }
    /* endregion APIs */
});

StorageManager._instance = null;
StorageManager.getInstance = function() {
    if (!StorageManager._instance){
        StorageManager._instance = new StorageManager();
    }
    return StorageManager._instance;
};
var storageMgr = StorageManager.getInstance();

/* region STORAGE CMD DEFINE */
StorageManager.CMD_GET_ITEM_CONFIG = 16001;
StorageManager.CMD_GET_USER_ITEM_INFO = 16002;
StorageManager.CMD_USE_ITEM = 16003;
StorageManager.CMD_USE_INTERACT = 16004;
StorageManager.CMD_USE_EMOTICON = 16005;
StorageManager.CMD_ITEM_INFO_FROM_ALL = 16006;
StorageManager.CMD_ITEM_INFO_TO_ALL = 16007;
StorageManager.CMD_BUY_ITEM = 16008;
StorageManager.CMD_CHECK_EXPIRE_ITEM = 16009;
StorageManager.CMD_GET_SHOP_ITEM_CONFIG = 16010;
StorageManager.CMD_BONUS_VOUCHER_IN_SHOP = 16011;
StorageManager.CMD_UNLOCK_ITEM = 16012;
StorageManager.CMD_POP_UP_NEW_ITEM = 16013;
StorageManager.CMD_CHEAT_ITEM = 16020;
StorageManager.CMD_CHEAT_ONE_ITEM = 16021;
StorageManager.CMD_CHEAT_DIAMOND = 16022;
StorageManager.CMD_CHEAT_RESET = 16023;

StorageManager.USE_ERROR = {
    SUCCESS: 0,
    NO_ITEM: 1,
    OUT_OF_NUM: 2,
    OUT_OF_DATE: 3,
    ALREADY_IN_USE: 4
};

StorageManager.BUY_ERROR = {
    SUCCESS: 0,
    NOT_ENOUGH_DIAMOND: 1,
    ITEM_NOT_AVAILABLE:2
};

StorageManager.UNLOCK_REASON = {
    LEVEL: 0,
    VIP: 1,
    RANK: 5
};
/* endregion STORAGE CMD DEFINE */

StorageManager.getItemName = function(type, id) {
    type = Number(type);
    id = Number(id);
    var itemConfig = StorageManager.getInstance().itemConfig;
    return itemConfig[type][id].name;
}

StorageManager.getItemIconPath = function(type, subType, id) {
    /**
     * Description: All item icon path (to display in shop and storage) go here!
     */
    var path;
    type = Number(type);
    id = Number(id);
    switch(Number(type)){
        case StorageManager.TYPE_AVATAR:
            if(jsb.fileUtils.isFileExist((path = "Items/avatar/" + id + ".png")))
                return path;
            break;
        case StorageManager.TYPE_INTERACTION:
            if (id < 0) {
                if(jsb.fileUtils.isFileExist((path = "Interact/interact_covid/throwable_item_" + (100 + id) + ".png")))
                    return path;
            }
            else{
                if(jsb.fileUtils.isFileExist((path = "Interact/throwable_item_" + id + ".png")))
                    return path;
            }
            break;
        case StorageManager.TYPE_EMOTICON:
            if(jsb.fileUtils.isFileExist((path = "Items/emoticon/" + id + ".png")))
                return path;
            break;
        case StorageManager.TYPE_VOUCHER:
            if(jsb.fileUtils.isFileExist((path = "Items/voucher/" + id + ".png")))
                return path;
            break;
    }
    return "";
};

StorageManager.getItemSmallIconPath = function(type, subType, id) {
    /**
     * Description: All item icon path (to display in shop and storage) go here!
     */
    var path;
    type = Number(type);
    id = Number(id);
    switch(Number(type)){
        case StorageManager.TYPE_AVATAR:
            if(jsb.fileUtils.isFileExist((path = "Items/avatar/small" + id + ".png")))
                return path;
            break;
        case StorageManager.TYPE_INTERACTION:
            if(jsb.fileUtils.isFileExist((path = "Items/interaction/small" + id + ".png")))
                return path;
            break;
        case StorageManager.TYPE_EMOTICON:
            if(jsb.fileUtils.isFileExist((path = "Items/emoticon/small" + id + ".png")))
                return path;
            break;
        case StorageManager.TYPE_VOUCHER:
            if(jsb.fileUtils.isFileExist((path = "Items/voucher/small" + id + ".png")))
                return path;
            break;
    }
    return StorageManager.getItemIconPath(type, subType, id);
};

StorageManager.getItemIconScale = function(type){
    switch(Number(type)){
        case StorageManager.TYPE_AVATAR:
            return 0.6;
        case StorageManager.TYPE_INTERACTION:
            return 0.8;
        case StorageManager.TYPE_EMOTICON:
            return 0.8;
        case StorageManager.TYPE_VOUCHER:
            return 0.75;
    }
    return 1;
}

StorageManager.getItemUseType = function(type) {
    type = Number(type);

    var useByTimeTypes = [StorageManager.TYPE_AVATAR, StorageManager.TYPE_EMOTICON];
    var useByUnitTypes = [StorageManager.TYPE_INTERACTION];
    var useOnceTypes = [StorageManager.TYPE_VOUCHER];
    if (useByTimeTypes.indexOf(type) != -1)
        return StorageManager.USE_BY_TIME;
    else if (useByUnitTypes.indexOf(type) != -1)
        return StorageManager.USE_BY_UNIT;
    else //if (useOnceTypes.indexOf(type) != -1)
        return StorageManager.USE_ONCE
};

StorageManager.getAvatarFramePath = function(id) {
    return StorageManager.getItemIconPath(StorageManager.TYPE_AVATAR, null, id);
};

StorageManager.getEmoticonForPlay = function(id, emoId){
    switch(StorageManager.getEmoticonAnimationType(id)){
        case StorageManager.ANIM_TYPE_DRAGONBONES:
            var anim = db.DBCCFactory.getInstance().buildArmatureNode("Emoticon" + id);
            anim.playAnimation = function(minRepeat, minTime){
                this.gotoAndPlay("" + emoId, -1, -1, 0);
                var unitTime = this.getAnimation().getLastAnimationState().getTotalTime();
                var realRepeat = 0;
                while(unitTime * realRepeat < minTime) realRepeat++;
                return unitTime * realRepeat;
            }.bind(anim);
            return anim;
            break;
        case StorageManager.ANIM_TYPE_SPINE:
            var anim = new CustomSkeleton("Armatures/Emoticon/" + id, emoId);
            anim.playAnimation = function(minRepeat, minTime){
                anim.setAnimation(0, 'animation', true);
                var unitTime = anim.getDuration();
                var realRepeat = 0;
                while(unitTime * realRepeat < minTime) realRepeat++;
                return unitTime * realRepeat;
            }.bind(anim);
            return anim;
            break;
    }
};

StorageManager.getEmoticonAnimationType = function(id) {
    switch(Number(id)) {
        case 0:
            return StorageManager.ANIM_TYPE_DRAGONBONES;
        case 1:
            return StorageManager.ANIM_TYPE_SPINE;
    }
};

StorageManager.getEmoticonScale = function(id) {
    switch (Number(id)) {
        case 0: return 1;
        case 1: return 0.16;
    }
};

StorageManager.getInteractPreviewAnimList = function(id) {
    var animList = [];
    var animName;
    var frameName;
    if (id == -99 || id == -100){
        animName = "Covid";
        if (id == -99)
            animList = [[animName, 102], [animName, 104]];
        else
            animList = [[animName, 101], [animName, 103]];
    }
    else if (id == 13){
        animName = "item_anim";
        animList = [[animName, "sutbong"], [animName, "bongxoay"], [animName, "sutvaogon"], [animName, "sutrangoai"]];
    }
    else if (id == 5){
        animName = "item_anim";
        animList = [[animName, "phao1"], [animName, "phao2"], [animName, "phao3"], [animName, "phaohoa"]];
    }
    else{
        animName = "item_anim";
        switch(id) {
            case 1: frameName = "votay"; break;
            case 2: frameName = "cachua"; break;
            case 3: frameName = "hoahong"; break;
            case 4: frameName = "thuocno"; break;
            case 6: frameName = "nemtrung"; break;
            case 7: frameName = "kiss"; break;
            case 8: frameName = "nemdep"; break;
            case 9: frameName = "heart"; break;
            case 10: frameName = "cungly"; break;
            case 11: frameName = "water_1"; break;
            case 12: frameName = "cup"; break;
        }
        animList = [[animName, frameName]];
    }
    return animList;
};

StorageManager.TYPE_AVATAR = 0;
StorageManager.TYPE_INTERACTION = 1;
StorageManager.TYPE_EMOTICON = 2;
StorageManager.TYPE_VOUCHER = 3;

StorageManager.TYPE_NAMES = {};
StorageManager.TYPE_NAMES[StorageManager.TYPE_AVATAR] = "Khung avatar";
StorageManager.TYPE_NAMES[StorageManager.TYPE_INTERACTION] = "Tương tác";
StorageManager.TYPE_NAMES[StorageManager.TYPE_EMOTICON] = "Biểu cảm";
StorageManager.TYPE_NAMES[StorageManager.TYPE_VOUCHER] = "Phiếu giảm giá";


StorageManager.SUBTYPE_AVATAR = {
    FOREVER: 0,
    LIMIT_7_DAY: 1,
    LIMIT_1_DAY: 2,
    EVENT_ONLY: 3
};
StorageManager.SUBTYPE_INTERACTION = {
    DEFAULT: 0
};
StorageManager.SUBTYPE_EMOTICON = {
    DEFAULT: 0,
    LIMIT_7_DAY: 1,
    LIMIT_30_DAY: 2,
    EVENT_ONLY: 3
};
StorageManager.SUBTYPE_VOUCHER = {
    USE_IN_SHOP: 0,
    USE_IN_ROOM: 1
};

StorageManager.ITEM_STATUS = {
    DISABLE: 0,
    ENABLE: 1,
    USING: 2
};
StorageManager.AVATAR_STATUS = {
    DISABLE: 0,
    ENABLE: 1,
    USING: 2
};
StorageManager.INTERACTION_STATUS = {
    DISABLE: 0,
    ENABLE: 1
};
StorageManager.EMOTICON_STATUS = {
    DISABLE: 0,
    ENABLE: 1
};
StorageManager.VOUCHER_STATUS = {
    DISABLE: 0,
    ENABLE: 1,
    USING: 2
};

StorageManager.USE_BY_TIME = 0;
StorageManager.USE_BY_UNIT = 1;
StorageManager.USE_ONCE = 2;

StorageManager.VIP_CONDITION = 0;
StorageManager.LEVEL_CONDITION = 1;

StorageManager.BONUS_GOLD = 0;
StorageManager.BONUS_VPOINT = 1;
StorageManager.BONUS_EXP = 2;

StorageManager.ANIM_TYPE_DRAGONBONES = 0;
StorageManager.ANIM_TYPE_SPINE = 1;