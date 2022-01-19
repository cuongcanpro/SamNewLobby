
var CmdSendPortalQuest = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PortalMgr.CMD_PORTAL_QUEST);
    },
    putData: function (listQuestId, expireTime, portalId) {
        //pack
        this.packHeader();
        this.putIntArray(listQuestId);
        this.putLong(expireTime);
        this.putLong(portalId);
        //update
        this.updateSize();
    }
});

var CmdSendPortalGiftCode = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(PortalMgr.CMD_PORTAL_GIFT_CODE);
    },
    putData: function (giftCode) {
        //pack
        this.packHeader();
        this.putString(giftCode);
        //update
        this.updateSize();
    }
});

CmdReceivedPortalGiftCode = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.giftCode = this.getString();
        this.error = this.getInt();
    }
});