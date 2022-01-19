/**
 * Created by AnhLN6 on 8/13/2021
 * Define packets used in Lucky Bonus
 */

//SEND
var CmdSendGetUserLuckyBonusInfo = CmdSendCommon.extend({
    ctor: function() {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyBonusManager.CMD_GET_USER_LUCKY_BONUS_INFO);
    },

    putData: function(userOpenLuckyBonusGUI){
        this.packHeader();
        this.putByte(userOpenLuckyBonusGUI);
        this.updateSize();
    }
});

var CmdSendCheatUserLuckyBonusData = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyBonusManager.CMD_CHEAT_USER_LUCKY_BONUS_DATA);
    },

    putData: function(streakIndex, numSpin){
        this.packHeader();
        //user current streak
        this.putInt(streakIndex);
        //user number of free spins
        this.putInt(numSpin);
        this.updateSize();
    }
});

var CmdSendRollLuckyBonus = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyBonusManager.CMD_ROLL_LUCKY_BONUS);
    },

    putData: function(type, num){
        this.packHeader();
        //0: free, 1: G
        this.putByte(type);
        //number of G/ticket used
        this.putInt(num);
        this.updateSize();
    }
});

var CmdSendCheatUserLuckyBonusData = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyBonusManager.CMD_CHEAT_USER_LUCKY_BONUS_DATA);
    },

    putData: function(streakIndex, numSpin){
        this.packHeader();
        //user current streak
        this.putInt(streakIndex);
        //number of free spins
        this.putInt(numSpin);
        this.updateSize();
    }
});

var CmdSendCheatRollResult = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyBonusManager.CMD_CHEAT_ROLL_RESULT);
    },

    putData: function(numG, result){
        this.packHeader();
        //bet G
        this.putInt(numG);
        //result type: 0#0#0
        cc.log("pack " + result);
        this.putString(result);
        this.updateSize();
    }
});

var CmdSendCheckRollRatio = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyBonusManager.CMD_CHECK_ROLL_RATIO);
    },

    putData: function(numRoll, itemCheck){
        this.packHeader();
        this.putInt(numRoll);
        //array represent the first array.length item(s) in result
        this.putIntArray(itemCheck);
        this.updateSize();
    }
});

var CmdSendLogTooltipEffect = CmdSendCommon.extend({
    ctor: function(){
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(LuckyBonusManager.CMD_LOG_TOOLTIP_EFFECT);
    },

    putData: function(type){
        this.packHeader();
        this.putByte(type);
        this.updateSize();
    }
});

//END SEND
//RECEIVE
var CmdReceiveGetUserLuckyBonusInfo = CmdReceivedCommon.extend({
    ctor: function(pk) {
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.streakIndex = this.getInt();
        this.numSpin = this.getInt();
        this.isReceiveFreeTicket = this.getBool();
    }
});

var CmdReceiveCheatUserLuckyBonusData = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){

    }
});

var CmdReceiveRollLuckyBonus = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.isRolling = this.getBool();
        this.rollResult = this.getString();
        this.totalGold = this.getLong();
        this.baseGold = this.getLong();
        this.streakIndex = this.getInt();
        this.remainSpin = this.getInt();
    }
});

var CmdReceiveLuckyBonusConfig = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.config = this.getString();
    }
});

var CmdReceiveRollRatio = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.ratio = this.getDoubles();
    }
});
//END RECEIVE