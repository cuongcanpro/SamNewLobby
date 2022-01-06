/**
 * Created by sonbnt on 3/3/2021
 */

/* region ||========== RECEIVE ===========|| */
var CmdReceivedCheatItem = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.status = this.getByte();
    }
});

var CmdReceivedCheatDiamond = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.status = this.getByte();
    }
});

var CmdReceivedGetItemConfig = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        var json = StringUtility.replaceAll(this.getString(), "@", "%");
        var o = JSON.parse(json);
        this.itemConfig = o["item"];
        this.levelEnableItem = o["levelToOpenShopItem"];
    }
});

var CmdReceivedGetUserItemInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.avatarId = this.getInts();
        this.avatarStatus = this.getBytes();
        this.avatarRemainTime = this.getLongs();

        this.emoticonId = this.getInts();
        this.emoticonStatus = this.getBytes();
        this.emoticonNum = this.getInts();
        this.emoticonRemainTime = this.getLongs();

        this.interactionId = this.getInts();
        this.interactionStatus = this.getBytes();
        this.interactionNum = this.getInts();
        this.interactionRemainTime = this.getLongs();

        this.voucherId = this.getInts();
        this.voucherStatus = this.getBytes();
        this.voucherNum = this.getInts();
        this.voucherRemainTime = this.getLongs();
    }
});

var CmdReceivedGetShopItemConfig = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.shopItemConfig = JSON.parse(this.getString());
        this.limitedItems = JSON.parse(this.getString());
        for (var type in this.shopItemConfig){
            var num = this.shopItemConfig[type][0].length;
            this.shopItemConfig[type].push(new Array(num).fill(-1));
        }
        for (var type in this.limitedItems){
            if (this.shopItemConfig[type]){
                var numAttr = this.shopItemConfig[type].length;
                for (var i = 0; i < numAttr; i++)
                    this.shopItemConfig[type][i] = this.shopItemConfig[type][i].concat(this.limitedItems[type][i]);
            }
            else this.shopItemConfig[type] = this.limitedItems[type];
        }
    }
});

var CmdReceivedUseItem = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.status = this.getByte();
        this.type = this.getInt();
        this.subType = this.getInt();
        this.id = this.getInt();
        this.index = this.getInt();
    }
});

var CmdReceivedUseInteract = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.startChair = this.getByte();
        this.endChair = this.getByte();
        this.subType = this.getInt();
        this.id = this.getInt();
    }
});

var CmdReceivedUseEmoticon = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.nChair = this.getByte();
        this.subType = this.getInt();
        this.id = this.getInt();
        this.emoId = this.getInt();
    }
});

var CmdReceivedBuyItem = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.status = this.getByte();
        this.type = this.getInt();
        this.subType = this.getInt();
        this.id = this.getInt();
        this.num = this.getInt();
        this.price = this.getDouble();
        this.index = this.getInt();
    }
});

var CmdReceivedBonusVoucherInShop = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.channel = this.getInt();
        this.packId = this.getInt();
        this.bonusGold = this.getDouble();
        this.bonusVPoint = this.getInt();
    }
});

var CmdReceivedUnlockItem = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.reason = this.getByte();
        this.oldData = this.getInt();
        this.newData = this.getInt();
        this.ids = this.getInts();
        this.types = this.getInts();
        this.subTypes = this.getInts();
        this.nums = this.getInts();
        this.remainTimes = this.getLongs();
    }
});

var CmdReceivedPopUpNewItem = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.diamond = this.getInt();
    }
});

var CmdReceivedItemInfoFromAll = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.uIDs = this.getInts();
        this.nChairs = this.getBytes();
        this.avatarIds = this.getInts();
    }
});

var CmdReceivedItemInfoToAll = CmdReceivedCommon.extend({
    ctor: function(pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function() {
        this.uID = this.getInt();
        this.nChair = this.getByte();
        this.avatarId = this.getInt();
    }
});
/* endregion ||========== RECEIVE ===========|| */


/* region ||========== SEND ===========|| */
var CmdSendCheatItem = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(StorageManager.CMD_CHEAT_ITEM);

    },
    putData: function (cheatData) {
        this.packHeader();

        var types = [];
        var subTypes = [];
        var ids = [];
        var nums = [];
        var remainTimes = [];
        var indexes = [];
        for (var i in cheatData) {
            types.push(cheatData[i].type);
            subTypes.push(cheatData[i].subType);
            ids.push(cheatData[i].id);
            nums.push(cheatData[i].num);
            remainTimes.push(cheatData[i].remainTime);
            indexes.push(cheatData[i].index);
        }
        this.putIntArray(types);
        this.putIntArray(subTypes);
        this.putIntArray(ids);
        this.putIntArray(nums);
        this.putLongArray(remainTimes);
        this.putIntArray(indexes);

        this.updateSize();
    }
});

var CmdSendCheatDiamond = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(StorageManager.CMD_CHEAT_DIAMOND);
    },

    putData: function(num) {
        this.packHeader();
        this.putLong(num);
        this.updateSize();
    }
});

var CmdSendGetItemConfig = CmdSendCommon.extend({
    ctor: function() {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(StorageManager.CMD_GET_ITEM_CONFIG);
    },

    putData: function() {
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendGetShopItemConfig = CmdSendCommon.extend({
    ctor: function() {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(StorageManager.CMD_GET_SHOP_ITEM_CONFIG);
    },

    putData: function() {
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendCheckExpireItem = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(StorageManager.CMD_CHECK_EXPIRE_ITEM);
    },

    putData: function(type, subType, id, index) {
        this.packHeader();
        this.putInt(type);
        this.putInt(subType);
        this.putInt(id);
        this.putInt(index);
        this.updateSize();
    }
});

var CmdSendUseItem = CmdSendCommon.extend({
    ctor: function() {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(StorageManager.CMD_USE_ITEM);
    },

    putData: function(type, subType, id, index) {
        this.packHeader();
        this.putInt(type);
        this.putInt(subType);
        this.putInt(id);
        this.putInt(index);
        this.updateSize();
    }
});

var CmdSendUseInteract = CmdSendCommon.extend({
    ctor: function() {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(StorageManager.CMD_USE_INTERACT);
    },

    putData: function(subType, id, nChair) {
        this.packHeader();
        this.putInt(subType);
        this.putInt(id);
        this.putByte(nChair);
        this.updateSize();
    }
});

var CmdSendUseEmoticon = CmdSendCommon.extend({
    ctor: function() {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(StorageManager.CMD_USE_EMOTICON);
    },

    putData: function(subType, id, emoId) {
        this.packHeader();
        this.putInt(subType);
        this.putInt(id);
        this.putInt(emoId);
        this.updateSize();
    }
});

var CmdSendBuyItem = CmdSendCommon.extend({
    ctor: function() {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(StorageManager.CMD_BUY_ITEM);
    },

    putData: function(type, subType, id, num) {
        this.packHeader();

        this.putInt(type);
        this.putInt(subType);
        this.putInt(id);
        this.putInt(num);

        this.updateSize();
    }
});

var CmdSendPopUpNewItem = CmdSendCommon.extend({
    ctor: function() {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(StorageManager.CMD_POP_UP_NEW_ITEM);
    },

    putData: function() {
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendCheatReset = CmdSendCommon.extend({
    ctor: function() {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(StorageManager.CMD_CHEAT_RESET);
    },

    putData: function() {
        this.packHeader();
        this.updateSize();
    }
});
/* endregion ||========== SEND ===========|| */