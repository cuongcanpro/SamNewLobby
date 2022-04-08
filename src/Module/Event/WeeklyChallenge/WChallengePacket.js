var W_CHALLENGE_PACKET_OK = 0;
var W_CHALLENGE_PACKET_NOT_OK = 1;

engine.InPacket.extend = cc.Class.extend;
var CommonCmdReceivedWChallenge = engine.InPacket.extend({
    ctor: function (pkg) {
        this._super();
        this.init(pkg);
    },
    getInts: function () {
        var arr = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            arr.push(this.getInt());
        }
        return arr;
    }
});
var CmdReceivedWChallengeConfig = CommonCmdReceivedWChallenge.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.status = this.getInt();
        if(this.status === W_CHALLENGE_PACKET_OK) {
            this.nbOfBasicRewards = this.getInt();
            // tasks config
            this.tasksConfig = [];
            for(var i = 0; i < this.nbOfBasicRewards; i++) {
                var taskConfig = {
                    taskId: this.getString(),
                    number: this.getInt()
                };
                this.tasksConfig.push(taskConfig);
            }
            this.goldRewards = this.getInts();
            this.cloverRewards = this.getInts();
            this.goldPerClover = this.getInt();
            this.premiumPrice = this.getDouble();
            this.currTime = this.getInt();
            this.startTime = this.getInt();
            this.duration = this.getInt();
            var goldCloverShopLen = this.getInt();
            this.buyGoldToClover = {};
            var paymentMethods = [Payment.GOLD_SMS, Payment.GOLD_IAP, Payment.GOLD_ZING, Payment.GOLD_ATM, Payment.GOLD_ZALO];
            for (var idx of paymentMethods) {
                this.buyGoldToClover[idx] = {};
                goldCloverShopLen = this.getInt();
                for (var i = 0; i < goldCloverShopLen; ++i) {
                    this.buyGoldToClover[idx][this.getInt()] = this.getInt();
                }
            }
            this.diamondRewards = this.getInts();

            var length = this.getShort();
            this.arrayClover = [];
            this.arrayGold = [];
            for (var i = 0; i < length; i++) {
                this.arrayClover[i] = this.getInt();
                this.arrayGold[i] = this.getLong();
            }
        }
    }
});

var CmdReceivedWChallengeUserInfo = CommonCmdReceivedWChallenge.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.status = this.getInt();
        if(this.status === W_CHALLENGE_PACKET_OK) {
            this.currClovers = this.getInt();
            this.isPremium = this.getInt();
            this.isExchangedCloverGold = this.getInt();
            this.rewardStates = this.getInts();
            this.taskProgresses = this.getInts();
            this.isAnimatedUnlockPremium = this.getInt();
            this.enteredGUI = this.getInts();
            var length = this.getShort();
            this.giftLists = [];
            for (var i = 0; i < length; i++)
                this.giftLists[i] = this.getByte();
        }
    }
});

var CmdReceivedWChallengeTakeAllReward = CommonCmdReceivedWChallenge.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.status = this.getInt();
        if(this.status === W_CHALLENGE_PACKET_OK) {
            this.goldReceived = this.getInt();
            this.cloverReceived = this.getInt();
            this.day = this.getInt();
            this.diamondReceived = this.getDouble();
        }
    }
});

var CmdReceivedBuyGoldBonus = CommonCmdReceivedWChallenge.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.clovers = this.getInt();
        this.isOffer = this.getByte();
    }
});


var CmdReceivedGiftProgress = CommonCmdReceivedWChallenge.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.gold = this.getLong();
        var length = this.getShort();
        this.giftLists = [];
        for (var i = 0; i < length; i++)
            this.giftLists[i] = this.getByte();
    }
});

var CmdReceivedWChallengeAutoTakeReward = CmdReceivedWChallengeTakeAllReward;

var CmdReceivedBuyPremium = CommonCmdReceivedWChallenge.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.errorCode = this.getInt();
    }
});

var CmdSendWChallengeGetReward = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_RECEIVE_REWARD);
    },
    putData: function (rewardId) {
        this.packHeader();
        this.putInt(rewardId);
        this.updateSize();
    }
});


var CmdSendWChallengeAnimatedUnlockPremium = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_ANIMATED_UNLOCK_PREMIUM);
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendWChallengeExchangeGoldClover = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_EXCHANGE_GOLD_CLOVER);
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendWChallengeLoadUserInfo = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_USER_INFO);
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendWChallengeLoadConfig = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_CONFIG);
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendWChallengeCheatTask = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_CHEAT_TASK);
    },
    putData: function (progress) {
        this.packHeader();
        this.putInt(progress);
        this.updateSize();
    }
});

var CmdSendWChallengeBuyPremium = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_BUY_PREMIUM);
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendWChallengeTakeAllReward = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_TAKE_ALL_REWARDS);
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendWChallengeOpenGUI = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_OPEN_GUI);
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendCheatResetInfo = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_CHEAT_RESET_INFO);
        this.putData();
    },

    putData: function() {
        this.packHeader();
        this.updateSize();
    }
});

var CmdSendCheatDay = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_CHEAT_DAY);
    },

    putData: function(day) {
        this.packHeader();
        this.putInt(day);
        this.updateSize();
    }
});


var CmdSendGetGiftProgress = engine.OutPacket.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(WChallenge.CMD_GET_GIFT_PROGRESS);
    },

    putData: function(index, isAll) {
        this.packHeader();
        this.putInt(index);
        this.putByte(isAll);
        this.updateSize();
    }
});
