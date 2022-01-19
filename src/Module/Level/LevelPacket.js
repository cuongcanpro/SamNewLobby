
CmdReceivedLevelUp = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function() {
        this.uId = this.getInt();
        this.nChair = this.getByte();
        this.oldLevel = this.getInt();
        this.newLevel = this.getInt();
        this.oldLevelExp = Number(this.getLong());
        this.newLevelExp = Number(this.getLong());
    }
});

CmdReceivedLevelConfig = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function() {
        this.maxLevel = this.getInt();
        this.levelExpAdd = JSON.parse(this.getString());
        this.level = JSON.parse(this.getString());
        this.bonus = JSON.parse(this.getString());
    }
});