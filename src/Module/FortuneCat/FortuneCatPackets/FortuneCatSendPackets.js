/**
 * Created by AnhLN6 on 11/4/2021
 * Defines send-packet used for Fortune Cat
 */

var CmdGetUserFortuneCatData = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(FortuneCatManager.CMD_GET_USER_DATA);
    },

    putData: function(){
        this.packHeader();

        this.updateSize();
    }
});

var CmdUnlockFortuneCat = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(FortuneCatManager.CMD_UNLOCK);
    },

    putData: function(catIndex){
        this.packHeader();

        this.putInt(catIndex);

        this.updateSize();
    }
});

var CmdGetFortuneCatReward = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(FortuneCatManager.CMD_GET_REWARD);
    },

    putData: function(){
        this.packHeader();

        this.updateSize();
    }
});

var CmdCheatFortuneCatBell = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(FortuneCatManager.CMD_CHEAT_BELL);
    },

    putData: function(numBell){
        this.packHeader();

        this.putInt(numBell);

        this.updateSize();
    }
});

var CmdCheatFortuneCat = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(FortuneCatManager.CMD_CHEAT_CAT);
    },

    putData: function(catIds){
        this.packHeader();

        this.putIntArray(catIds);

        this.updateSize();
    }
});

var CmdCheatUnlockFortuneCat = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(FortuneCatManager.CMD_CHEAT_UNLOCK);
    },

    putData: function(){
        this.packHeader();

        this.updateSize();
    }
});

