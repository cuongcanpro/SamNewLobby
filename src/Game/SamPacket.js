/**
 * Created by Hunter on 5/25/2016.
 */



CmdSendCheatMoney = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_MONEY);
    },
    putData: function (money, coin, exp) {
        //pack
        this.packHeader();
        this.putLong(money);
        this.putLong(coin);
        this.putLong(exp);
        cc.log("SEND EXP " + exp);

        //update
        this.updateSize();
    }
});

CmdSendCheatJackpot = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_JACKPOT);
    },

    putData: function (jp) {
        //pack
        this.packHeader();
        this.putInt(jp);
        //update
        this.updateSize();
    }
});

CmdSendCheatEXP = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_EXP);
    },

    putData: function (exp) {
        //pack
        this.packHeader();
        this.putLong(exp);

        //update
        this.updateSize();
    }
});

CmdSendCheatOldExp = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_OLD_EXP);
    },

    putData: function(oldExp) {
        //pack
        this.packHeader();
        this.putLong(oldExp);
        cc.log("Send cheat old exp: " + oldExp);
        //update
        this.updateSize();
    }
});

CmdSendCheatGStar = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_GSTAR);
    },

    putData: function (gstar) {
        //pack
        this.packHeader();
        this.putLong(gstar);

        //update
        this.updateSize();
    }
});

CmdSendCheatConfigCard = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CHEAT_CARD);
    },
    putData: function (cards) {
        //pack
        this.packHeader();

        if (Config.ENABLE_CHEAT) {
            this.putByte(1);
        } else {
            this.putByte(0);
        }

        this.putByte(1);

        this.putShort(cards.length);
        for (var i = 0; i < cards.length; i++) {
            this.putByte(cards[i]);
        }

        //update
        this.updateSize();
    }
});