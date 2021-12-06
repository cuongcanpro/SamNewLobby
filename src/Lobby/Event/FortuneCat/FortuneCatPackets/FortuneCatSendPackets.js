/**
 * Created by AnhLN6 on 11/4/2021
 * Defines send-packet used for Fortune Cat
 */

let CmdGetUserFortuneCatData = CmdSendCommon.extend({
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

let CmdUnlockFortuneCat = CmdSendCommon.extend({
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

let CmdGetFortuneCatReward = CmdSendCommon.extend({
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

let CmdCheatFortuneCatBell = CmdSendCommon.extend({
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

let CmdCheatFortuneCat = CmdSendCommon.extend({
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

let CmdCheatUnlockFortuneCat = CmdSendCommon.extend({
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

