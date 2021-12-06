/**
 * Created by AnhLN6 on 11/4/2021
 * Defines receive-packet used for Fortune Cat
 */

let CmdFortuneCatConfig = CmdReceivedCommon.extend({
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

let CmdFortuneCatUserData = CmdReceivedCommon.extend({
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

let CmdFortuneCatUnlockAuthorized = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.catId = this.getInt();
        this.catIndex = this.getInt();
    }
});

let CmdReceiveFortuneCatReward = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.catId = this.getInt();
        this.gold = this.getLong();
    }
});

let CmdReceiveFortuneCatBell = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.numBell = this.getInt();
    }
});

let CmdReceiveFortuneCat = CmdReceivedCommon.extend({
    ctor: function(pk){
        this._super(pk);
        this.readData();
    },

    readData: function(){
        this.catId = this.getInt();
    }
});
