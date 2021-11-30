CmdJackpotInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.gold = [];
        this.diamond = [];
        for (var i = 0; i <= 3 ; i++) {
            this.gold.push(parseInt(this.getLong()));
            //cc.log("golddddddddddd", this.gold[i]);
        }
        for (i = 0; i <= 3; i++) {
            this.diamond.push(this.getInt());
        }
    }
});

CmdGetJackpot = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.jackpot = parseInt(this.getLong());
        this.chair = this.getInt();
        cc.log("CHAIRRRRRRRRRRRRRR", this.chair);
    }
});


CmdNotifyGetGem = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.username = this.getString();
        this.channel = this.getInt();
    }
});

CmdNotifyGetJackpot = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.username = this.getString();
        this.jackpot = parseInt(this.getLong());
        this.channel = this.getInt();
    }
});
