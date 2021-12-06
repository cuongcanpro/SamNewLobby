/**
 * Created by AnhLN6 on 11/4/2021
 * Contains senders, listeners, handlers for packets
 * Stores logical variables and configs for Fortune Cat
 */

let FortuneCatManager = cc.Class.extend({
    ctor: function(){
        ///user info
        this.userNumBell = null;
        this.userCatIdList = null;
        this.userOpenCatId = null;
        this.userOpenRemainTime = null;
        this.unlockingCatIndex = null;
        this.numRecentBell = 0;
        this.recentCatId = null;
        this.secondCounter = 0;

        this.userVipLevel = null;
        this.userVipRemainTime = null;

        ///distinguish user click on fortune cat icon or just receive data from server
        this.userClickedFortuneCatIcon = false;

        ///main scene
        this.fortuneCatMainLayer = null;

        ///config
        this.maxCat = null;
        this.maxBell = null;
        this.catConfigList = null;
        this.vipBonusList = null;

        ///icon
        this.lobbyIcon = null;
        this.ingameIcon = null;
    },

    updateUserVipInfo: function(){
        this.userVipLevel = NewVipManager.getInstance().getVipLevel();
        this.userVipRemainTime = NewVipManager.getInstance().getRemainTime();
        if (!this.userVipRemainTime || this.userVipRemainTime <= 0){
            this.userVipLevel = 0;
        }
    },

    ///listeners
    onReceive: function(cmd, data){
        switch (cmd){
            case FortuneCatManager.CMD_CONFIG:
                var pk = new CmdFortuneCatConfig(data);
                pk.clean();
                this.onReceiveConfig(pk);
                break;

            case FortuneCatManager.CMD_USER_DATA:
                var pk = new CmdFortuneCatUserData(data);
                pk.clean();
                this.onReceiveUserData(pk);
                break;

            case FortuneCatManager.CMD_UNLOCK_AUTHORIZED:
                var pk = new CmdFortuneCatUnlockAuthorized(data);
                pk.clean();
                this.onReceiveUnlockAuthorized(pk);
                break;

            case FortuneCatManager.CMD_RECEIVE_REWARD:
                var pk = new CmdReceiveFortuneCatReward(data);
                pk.clean();
                this.onReceiveReward(pk);
                break;

            case FortuneCatManager.CMD_RECEIVE_BELL:
                var pk = new CmdReceiveFortuneCatBell(data);
                pk.clean();
                this.onReceiveBell(pk);
                break;

            case FortuneCatManager.CMD_RECEIVE_CAT:
                var pk = new CmdReceiveFortuneCat(data);
                pk.clean();
                this.onReceiveCat(pk);
                break;
        }
    },

    ///start - handlers
    onReceiveConfig: function(pk){
        this.maxCat = pk.maxCat;
        this.maxBell = pk.maxBell;
        this.catConfigList = pk.catConfig;
        for (let i = 0; i < this.catConfigList.length; i++){
            this.catConfigList[i] = JSON.parse(this.catConfigList[i]);
        }
        this.vipBonusList = pk.vipBonus;
    },

    onReceiveUserData: function(pk){
        this.userNumBell = pk.numBell;
        this.userCatIdList = pk.catIds;
        this.userOpenCatId = pk.openId;
        this.userOpenRemainTime = pk.remainTime;

        this.updateUserVipInfo();

        if (this.lobbyIcon){
            ///update number of bells owned
            this.lobbyIcon.updateProgress();

            if (this.checkNotifyCondition()){
                this.lobbyIcon.notifyFinishUnlocking(true);
            }
        }

        if (this.ingameIcon && sceneMgr.getMainLayer() instanceof BoardScene){
            this.ingameIcon.updateProgress();
        }

        ///distinguish user receive this packet when enter lobby GUI or when click the icon
        if (this.userClickedFortuneCatIcon){
            this.userClickedFortuneCatIcon = false;
            this.fortuneCatMainLayer = sceneMgr.openGUI(FortuneCatMainLayer.className, FortuneCatMainLayer.tag, FortuneCatMainLayer.tag);
        }
    },

    onReceiveUnlockAuthorized: function(pk){
        this.userOpenCatId = pk.catId;
        this.unlockingCatIndex = pk.catIndex;

        ///show unlock progress in icon
        this.lobbyIcon.showUnlocking();

        ///turn off notify
        this.lobbyIcon.notifyFinishUnlocking(false);

        ///update cat list
        this.userCatIdList.splice(this.unlockingCatIndex, 1);

        ///Notify user when cat is unlocked (device level)
        LocalNotification.getInstance().addNotify(
            Date.now() + this.catConfigList[pk.catId].openTime,
            "Mèo may mắn",
            "Hoàn thành mở khóa",
            "Đăng nhập ngay để nhận phần thưởng",
            true
        );
        LocalNotification.getInstance().showNotify();

        if (this.fortuneCatMainLayer !== null){
            this.fortuneCatMainLayer.updateUnlockingCatInfo(this.userOpenCatId, this.unlockingCatIndex);
            this.fortuneCatMainLayer.updateCatSlotList(this.userCatIdList);
            this.fortuneCatMainLayer.updateProgressValue(this.userNumBell, this.userCatIdList.length);
        }
    },

    onReceiveReward: function(pk){
        if (this.fortuneCatMainLayer !== null){
            this.fortuneCatMainLayer.btnReceiveReward.setVisible(false);
            this.fortuneCatMainLayer.mainCatBody.setVisible(false);
            this.fortuneCatMainLayer.mainCatSilhouette.setVisible(true);
            this.fortuneCatMainLayer.btnReceiveReward.stopAllActions();
            this.fortuneCatMainLayer.btnReceiveReward.setScale(1);

            this.lobbyIcon.notifyFinishUnlocking(false);

            let gui = sceneMgr.openGUI(FortuneCatUnlockedReward.className, FortuneCatUnlockedReward.TAG, FortuneCatUnlockedReward.TAG);
            let bonusData = new BonusData(pk.gold, ShopSuccessData.TYPE_GOLD);
            let array = [];

            array.push(bonusData);
            gui.pushArrayBonus(array, localized("RECEIVE_GIFT"));
        }
    },

    onReceiveBell: function(pk){
        this.updateBell(pk.numBell);
        this.numRecentBell = pk.numBell;
    },

    onReceiveCat: function(pk){
        this.userCatIdList.push(pk.catId);
        this.recentCatId = pk.catId;
    },
    ///end - handlers

    ///start - senders
    sendGetUserData: function(){
        let pk = new CmdGetUserFortuneCatData();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendUnlockFortuneCat: function(catIndex){
        let pk = new CmdUnlockFortuneCat();
        pk.putData(catIndex);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendGetFortuneCatReward: function(){
        let pk = new CmdGetFortuneCatReward();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatBell: function(numBell){
        let pk = new CmdCheatFortuneCatBell();
        pk.putData(numBell);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatCat: function(catIdList){
        let pk = new CmdCheatFortuneCat();
        pk.putData(catIdList);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatUnlock: function(){
        let pk = new CmdCheatUnlockFortuneCat();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },
    ///end - senders

    ///start - update user's fortune cat resource
    updateBell: function(addedBell){
        if (this.userCatIdList.length === 3){
            return;
        }
        else if (this.userCatIdList.length === 2){
            if (this.userNumBell + addedBell >= this.maxBell){
                this.userNumBell = 0;
            }
            else {
                this.userNumBell += addedBell;
            }
        }
        else {
            if (this.userNumBell + addedBell >= this.maxBell){
                this.userNumBell = this.userNumBell + addedBell - this.maxBell;
            }
            else {
                this.userNumBell += addedBell;
            }
        }
    },
    ///end - update user's fortune cat resource

    ///start - notify logic
    ///called everytime user enter lobby GUI
    checkShowNotify: function(){
        let fortuneCatMgr = FortuneCatManager.getInstance();

        this.sendGetUserData();
        let btn = this.lobbyIcon;
        btn.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function(){
                ///check show noti or not
                if (this.checkNotifyCondition()){
                    btn.notifyFinishUnlocking(true);
                }
                else {
                    btn.notifyFinishUnlocking(false);
                }

                ///check show remain time or not
                if (fortuneCatMgr.userOpenRemainTime > 0){
                    fortuneCatMgr.lobbyIcon.updateRemainTime(Math.floor(fortuneCatMgr.userOpenRemainTime / 1000));
                }
                else{
                    fortuneCatMgr.lobbyIcon.showProgress();
                }
            }.bind(this))
        ));
    },

    ///need to show the exclamation on the icon or not?
    checkNotifyCondition: function(){
        ///user has cat but not unlocking any or user has an unlocked cat
        if (
            this.userOpenCatId !== null &&
            this.userOpenCatId !== -1 &&
            this.userOpenRemainTime == 0 ||
            this.userCatIdList !== null &&
            this.userCatIdList.length > 0 &&
            this.userOpenCatId == -1
        ){
            return true;
        }
        else {
            return false;
        }
    }
    ///end - notify logic
});

FortuneCatManager.instance = null;
FortuneCatManager.getInstance = function(){
    if (!FortuneCatManager.instance){
        FortuneCatManager.instance = new FortuneCatManager();
    }
    return FortuneCatManager.instance;
}

///send-packet id list
FortuneCatManager.CMD_GET_USER_DATA = 24002;
FortuneCatManager.CMD_UNLOCK = 24003;
FortuneCatManager.CMD_GET_REWARD = 24004;
FortuneCatManager.CMD_CHEAT_BELL = 24010
FortuneCatManager.CMD_CHEAT_CAT = 24011;
FortuneCatManager.CMD_CHEAT_UNLOCK = 24012;

///receive-packet id list
FortuneCatManager.CMD_CONFIG = 24001;
FortuneCatManager.CMD_USER_DATA = 24002;
FortuneCatManager.CMD_UNLOCK_AUTHORIZED = 24003;
FortuneCatManager.CMD_RECEIVE_REWARD = 24004;
FortuneCatManager.CMD_RECEIVE_BELL = 24005;
FortuneCatManager.CMD_RECEIVE_CAT = 24006;

///check user knew guide storage key
FortuneCatManager.IS_USER_KNEW_RULE = "isUserKnewFortuneCatRule";
