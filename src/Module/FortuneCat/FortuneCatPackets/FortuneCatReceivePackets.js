/**
 * Created by AnhLN6 on 11/4/2021
 * Defines receive-packet used for Fortune Cat
 */

var CmdFortuneCatConfig = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.maxCat = this.getInt();
        this.maxBell = this.getInt();
        this.catConfig = this.getStrings();
        this.vipBonus = this.getInts();
    }
});

var CmdFortuneCatUserData = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.numBell = this.getInt();
        this.catIds = this.getInts();
        this.openId = this.getInt();
        this.remainTime = this.getLong();
    }
});

var CmdFortuneCatUnlockAuthorized = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.catId = this.getInt();
        this.catIndex = this.getInt();
    }
});

var CmdReceiveFortuneCatReward = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.catId = this.getInt();
        this.gold = this.getLong();
    }
});

var CmdReceiveFortuneCatBell = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.numBell = this.getInt();
    }
});

var CmdReceiveFortuneCat = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.catId = this.getInt();
    }
});
