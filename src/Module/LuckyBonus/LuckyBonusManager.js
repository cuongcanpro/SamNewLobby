/**
 * Created by AnhLN6 on 8/13/2021
 * Contains listeners, senders, handlers; stores logical variables and config for Lucky Bonus
 */

var LuckyBonusManager = cc.Class.extend({
    ctor: function(){
        //user info
        this.userCurrentStreak = null;
        this.userNumberOfFreeSpin = null;
        this.isReceiveFreeTicket = null;
        this.userVipLevel = null;
        this.userVipRemainTime = null;
        this.userClickedLuckyBonusIcon = false;

        //cheat info, merge with user info when receive cheat response from server
        this.userCurrentStreakCheat = null;
        this.userNumberOfFreeSpinCheat = null;

        //scene
        this.luckyBonusScene = null;

        //lobby icon info
        this.hotFlickerCounter = 0;

        //distinguish enter lucky bonus scene or just get user lucky bonus info from server
        this.enterLuckyBonusScene = false;

        //config
        this.rollResult = null;
        this.rollResultConfig = [];
        this.itemList = [];
        this.allowG = [];
        this.streakBonus = [];
        this.vipBonus = [];
        this.gToGoldFactor = null;
    },

    //listeners and handlers
    onReceive: function(cmd, data){
        switch (cmd){
            case LuckyBonusManager.CMD_GET_USER_LUCKY_BONUS_INFO:
                var pk = new CmdReceiveGetUserLuckyBonusInfo(data);
                pk.clean();
                this.onReceiveUserInfo(pk);
                break;

            case LuckyBonusManager.CMD_CHEAT_USER_LUCKY_BONUS_DATA:
                var pk = new CmdReceiveCheatUserLuckyBonusData(data);
                pk.clean();
                this.onReceiveCheatUserInfo();
                break;

            case LuckyBonusManager.CMD_LUCKY_BONUS_RESULT:
                var pk = new CmdReceiveRollLuckyBonus(data);
                pk.clean();
                this.onReceiveLuckyBonusResult(pk);
                break;

            case LuckyBonusManager.CMD_LUCKY_BONUS_CONFIG:
                var pk = new CmdReceiveLuckyBonusConfig(data);
                pk.clean();
                this.onReceiveLuckyBonusConfig(pk);
                break;

            case LuckyBonusManager.CMD_ROLL_RATIO:
                var pk = new CmdReceiveRollRatio(data);
                pk.clean();
                this.onReceiveRollRatio(pk);
                break;
        }
    },

    onReceiveUserInfo: function(pk){
        this.userCurrentStreak = pk.streakIndex;
        this.userNumberOfFreeSpin = pk.numSpin;
        this.isReceiveFreeTicket = pk.isReceiveFreeTicket;
        this.updateUserVipInfo();
        if (this.luckyBonusScene !== null){
            this.luckyBonusScene.updateStreak(this.userCurrentStreak);
            this.luckyBonusScene.updateVipInfo();
            this.luckyBonusScene.updateUserResource();
            this.luckyBonusScene.updateSpinBtn();
        }
        if (this.enterLuckyBonusScene){
            this.enterLuckyBonusScene = false;
            this.luckyBonusScene = sceneMgr.openScene(LuckyBonusScene.className);
        }
    },

    onReceiveCheatUserInfo: function(){
        this.userCurrentStreak = this.userCurrentStreakCheat;
        this.userNumberOfFreeSpin = this.userNumberOfFreeSpinCheat;
    },

    onReceiveLuckyBonusResult: function(pk){
        if (pk.isRolling){
            //if this is free roll and causes streak to increase
            if (pk.streakIndex > this.userCurrentStreak){
                this.luckyBonusScene.updateStreakAfterFreeSpin = true;
            }
            this.userCurrentStreak = pk.streakIndex;
            this.userNumberOfFreeSpin = pk.remainSpin;
            var result = pk.rollResult.split("#");
            var rollResult = [];
            for (var i = 0; i < LuckyBonusScene.NUMBER_OF_REELS; i++){
                rollResult.push(parseInt(result[i]));
            }
            this.rollResult = rollResult;
            if (this.luckyBonusScene){
                this.luckyBonusScene.updateUserG();
                this.luckyBonusScene.totalGold = pk.totalGold;
                this.luckyBonusScene.baseGold = pk.baseGold;
                this.luckyBonusScene.spinWheels(this.rollResult);
            }
        }
        else {
            //if isRolling, these actions will be done by the time spin end
            this.luckyBonusScene.setBackEnable(true);
            this.luckyBonusScene.enableAllBtn();
        }
    },

    onReceiveLuckyBonusConfig: function(pk){
        this.rollResultConfig = [];
        this.itemList = [];
        this.allowG = [];
        this.streakBonus = [];
        this.vipBonus = [];
        this.gToGoldFactor = null;

        var config = JSON.parse(pk.config);
        var goldList = config["goldList"];
        var itemList = config["itemList"];
        var allowG = config["allowG"];
        var streakBonus = config["streakBonus"];
        var vipBonus = config["vipBonus"];
        this.gToGoldFactor = config["gToGoldFactor"];

        for (var i = goldList.length - 1; i >= 0; i--){
            this.rollResultConfig.push(goldList[i]);
        }

        for (var i = 0; i < itemList.length; i++){
            this.itemList.push(itemList[i]);
        }

        for (var i = 0; i < allowG.length; i++){
            this.allowG.push(allowG[i]);
        }

        for (var i = 0; i < streakBonus.length; i++){
            this.streakBonus.push(streakBonus[i]);
        }

        for (var i = 0; i < vipBonus.length; i++){
            this.vipBonus.push(vipBonus[i]);
        }
    },

    onReceiveRollRatio: function(pk){
        this.rollResultRatio = pk.ratio;
        for (var i = 0; i < this.rollResultRatio.length; i++){
            cc.log("Ratio of item " + this.itemList[i] + " is: " + this.rollResultRatio[i].toFixed(2));
        }
    },

    //senders
    sendGetUserInfo: function(userOpenLuckyBonusGUI){
        var pk = new CmdSendGetUserLuckyBonusInfo();
        pk.putData(userOpenLuckyBonusGUI);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatUserLuckyBonusData: function(streakIndex, numSpin){
        this.updateUserVipInfo();
        this.luckyBonusScene.updateVipInfo();
        this.userCurrentStreakCheat = streakIndex;
        this.userNumberOfFreeSpinCheat = numSpin;
        var pk = new CmdSendCheatUserLuckyBonusData();
        pk.putData(streakIndex, numSpin);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendRollLuckyBonus: function(type, num){
        var pk = new CmdSendRollLuckyBonus();
        pk.putData(type, num);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatRollResult: function(numG, result){
        var pk = new CmdSendCheatRollResult();
        pk.putData(numG, result);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheckRollRatio: function(numRoll, itemCheck){
        var pk = new CmdSendCheckRollRatio();
        pk.putData(numRoll, itemCheck);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendLogTooltipEffect: function(type){
        var pk = new CmdSendLogTooltipEffect();
        pk.putData(type);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    resetData: function(){
        this.userClickedLuckyBonusIcon = false;
        this.enterLuckyBonusScene = false;
    },

    updateUserVipInfo: function(){
        this.userVipLevel = NewVipManager.getInstance().getVipLevel();
        this.userVipRemainTime = NewVipManager.getInstance().getRemainTime();
        if (!this.userVipRemainTime || this.userVipRemainTime <= 0){
            this.userVipLevel = 0;
        }
    },

    checkShowNotify: function(btn){
        var luckyBonusMgr = LuckyBonusManager.getInstance();
        this.sendGetUserInfo(0);
        btn.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function(){
                if (
                    luckyBonusMgr.userNumberOfFreeSpin != null &&
                    luckyBonusMgr.userNumberOfFreeSpin > 0 &&
                    !luckyBonusMgr.userClickedLuckyBonusIcon
                ){
                    btn.showNotify(true);
                }
                else btn.showNotify(false);
            }.bind(this))
        ));
    }
});

LuckyBonusManager._instance = null;
LuckyBonusManager.getInstance = function() {
    if (!LuckyBonusManager._instance){
        LuckyBonusManager._instance = new LuckyBonusManager();
    }
    return LuckyBonusManager._instance;
};

//CMD
//SEND PACKET
LuckyBonusManager.CMD_GET_USER_LUCKY_BONUS_INFO = 23002;
LuckyBonusManager.CMD_ROLL_LUCKY_BONUS = 23003;
LuckyBonusManager.CMD_LOG_TOOLTIP_EFFECT = 23004;
LuckyBonusManager.CMD_CHECK_ROLL_RATIO = 23010;
LuckyBonusManager.CMD_CHEAT_USER_LUCKY_BONUS_DATA = 23011;
LuckyBonusManager.CMD_CHEAT_ROLL_RESULT = 23012;

//RECEIVE PACKET
LuckyBonusManager.CMD_LUCKY_BONUS_CONFIG = 23001;
LuckyBonusManager.CMD_USER_LUCKY_BONUS_INFO = 23002;
LuckyBonusManager.CMD_LUCKY_BONUS_RESULT = 23003;
LuckyBonusManager.CMD_ROLL_RATIO = 23010;

//GUI TAG
LuckyBonusManager.FREE_SPIN_POP_UP = 1;
LuckyBonusManager.NOT_ENOUGH_G_POP_UP = 2;
LuckyBonusManager.PRIZE_DETAIL_POP_UP = 3;

//config
LuckyBonusManager.REQUEST_CHECK_ROLL_RATIO_ARRAY_ITEM_MAX_LENGTH = 2;

//lobby icon
LuckyBonusManager.LOBBY_BTN_POS_X_WITH_CAMERA_BTN = 60;
LuckyBonusManager.LOBBY_BTN_POS_X_WITHOUT_CAMERA_BTN = 110;
LuckyBonusManager.LOBBY_BTN_POS_Y = 15;
