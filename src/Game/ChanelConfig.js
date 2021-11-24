/**
 * Created by Hunter on 5/25/2016.
 */

var ChanelConfig = cc.Class.extend({

    ctor: function () {
        this.betTime = 100;
        this.chanelConfig = [];
    },

    setConfig: function (obj, chankenh) {
        this.betTime = 3;
        this.chanelConfig = [];
        var maxChanel = obj["maxChannel"];
        for (var i = 0; i < maxChanel; i++) {
            var chanelObj = obj["" + i];

            var chanel = {
                leafEnd: chanelObj["leafEnd"],
                leafStart: chanelObj["leafStart"],
                minGold: chanelObj["minGold"],
                maxGold: chanelObj["maxGold"],
                comission: chanelObj["comission"],
                jackpot: chanelObj["jackpot"],
                jackpotLevel: chanelObj["jackpotLevel"],
                name: chanelObj["name"],
                bet: chanelObj["betsAdvange"],
                betAdvance: chanelObj["betsAdvange"],
                canPlay: chankenh[i]
            };

            this.chanelConfig.push(chanel);
        }
    },

    getCurChanel: function () {
        var i;
        if (gamedata.userData.bean == 0)
            return -1;

        for (i = 0; i < this.chanelConfig.length; i++) {

            if (this.chanelConfig[i].maxGold >= gamedata.userData.bean) {

                if (this.chanelConfig[i].bet[0] * this.betTime <= gamedata.userData.bean)
                    return i;
                else
                    return i - 1;

            } else {
                if (this.chanelConfig[i].maxGold == -1) {
                    return i;
                }
            }
        }

        return i;
    },

    getMinBet: function () {
        return this.chanelConfig[0].betAdvance[0];
    },

    getBet: function (id) {
        return this.chanelConfig[gamedata.selectedChanel].bet[id];
    },

    getBetAdvance: function (id) {
        return this.chanelConfig[gamedata.selectedChanel].betAdvance[id];
    },

    betLevel: function (gold) {
        var i;
        if (gold == 0)
            return -1;

        for (i = 0; i < this.chanelConfig.length; i++) {
            if (this.chanelConfig[i].maxGold >= gold) {
                if (this.chanelConfig[i].bet[0] * this.betTime <= gold)
                    return i;
                else
                    return i - 1;

            } else {
                if (this.chanelConfig[i].maxGold == -1) {
                    return i;
                }
            }
        }

        return i;
    },

    getSuitableBet: function () {
        for (var i = this.chanelConfig[gamedata.selectedChanel].bet.length - 1; i >= 0; i--) {
            if (this.chanelConfig[gamedata.selectedChanel].bet[i] * this.betTime < gamedata.userData.bean) {
                return i;
            }
        }
        return 0;
    },

    getCurrentChannel: function () {
        var i;
        if (gamedata.userData.bean == 0)
            return -1;

        for (i = 0; i < this.chanelConfig.length; i++) {

            if (this.chanelConfig[i].maxGold >= gamedata.userData.bean) {

                if (this.chanelConfig[i].bet[0] * this.betTime <= gamedata.userData.bean)
                    return i;
                else
                    return i - 1;

            } else {
                if (this.chanelConfig[i].maxGold == -1) {
                    return i;
                }
            }
        }

        return i;
    },

    checkDownLevel: function () {
        var i;

        var currentChannel = this.getCurrentChannel();
        for (i = 0; i < this.chanelConfig[currentChannel].canPlay.length; i++) {
            if (this.chanelConfig[currentChannel].canPlay[i] == gamedata.selectedChanel)
                return true;
        }
        return false;
    },

    getMaxGoldCanPlayInChannel: function () {
        for (var i = this.chanelConfig.length - 1; i >= 0; i--) {
            for (var j = 0; j < this.chanelConfig[i].canPlay.length; j++)
                if (this.chanelConfig[i].canPlay[j] == gamedata.selectedChanel) {
                    return this.chanelConfig[i].maxGold + 1;
                }

        }
        return 0;
    }
});

ChanelConfig.firstInit = true;
ChanelConfig._inst = null;

ChanelConfig.instance = function () {
    if (ChanelConfig.firstInit) {
        ChanelConfig._inst = new ChanelConfig();
        ChanelConfig.firstInit = false;
    }
    return ChanelConfig._inst;
};

var chanelConfigInstance = ChanelConfig.instance();