/**
 * Created by AnhLN6 on 11/4/2021
 * Contains senders, listeners, handlers for packets
 * Stores logical variables and configs for Fortune Cat
 */

var FortuneCatManager = BaseMgr.extend({
    ctor: function(){
        this._super();
        ///user info
        this.userNumBell = null;
        this.userCatIdList = null;
        this.userOpenCatId = null;
        this.userOpenRemainTime = null;
        this.unlockingCatIndex = null;
        this.recentCatId = null;
        this.secondCounter = 0;

        this.userVipLevel = null;
        this.userVipRemainTime = null;

        ///distinguish user click on fortune cat icon or just receive data from server
        this.userClickedFortuneCatIcon = false;

        ///check if already check for auto pop GUI in lobby
        this.checkedAutoPopGUI = true;

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
        this.isIngameIcon = false;
    },

    init: function () {
        dispatcherMgr.addListener(LobbyMgr.EVENT_ON_ENTER_FINISH, this, this.onEnterLobby);
    },

    updateUserVipInfo: function(){
        this.userVipLevel = VipManager.getInstance().getVipLevel();
        this.userVipRemainTime = VipManager.getInstance().getRemainTime();
        if (!this.userVipRemainTime || this.userVipRemainTime <= 0){
            this.userVipLevel = 0;
        }
    },
    ///listeners
    onReceived: function(cmd, data){
        switch (cmd){
            case FortuneCatManager.CMD_CONFIG:
                var pk = new CmdFortuneCatConfig(data);
                pk.clean();
                this.onReceiveConfig(pk);
                return true;

            case FortuneCatManager.CMD_USER_DATA:
                var pk = new CmdFortuneCatUserData(data);
                pk.clean();
                this.onReceiveUserData(pk);
                return true;

            case FortuneCatManager.CMD_UNLOCK_AUTHORIZED:
                var pk = new CmdFortuneCatUnlockAuthorized(data);
                pk.clean();
                this.onReceiveUnlockAuthorized(pk);
                return true;

            case FortuneCatManager.CMD_RECEIVE_REWARD:
                var pk = new CmdReceiveFortuneCatReward(data);
                pk.clean();
                this.onReceiveReward(pk);
                return true;

            case FortuneCatManager.CMD_RECEIVE_BELL:
                var pk = new CmdReceiveFortuneCatBell(data);
                pk.clean();

                cc.log("FortuneCatManager.CMD_RECEIVE_BELL", JSON.stringify(pk));
                this.onReceiveBell(pk);
                return true;

            case FortuneCatManager.CMD_RECEIVE_CAT:
                var pk = new CmdReceiveFortuneCat(data);
                pk.clean();
                this.onReceiveCat(pk);
                return true;
        }
    },

    ///start - handlers
    onReceiveConfig: function(pk){
        this.maxCat = pk.maxCat;
        this.maxBell = pk.maxBell;
        this.catConfigList = pk.catConfig;
        for (var i = 0; i < this.catConfigList.length; i++){
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
            if (this.checkNotifyCondition()){
                this.lobbyIcon.notifyFinishUnlocking(true);
            }
        }

        ///distinguish user receive this packet when enter lobby GUI or when click the icon
        this.checkShowNotify();
        if (this.userClickedFortuneCatIcon){
            this.userClickedFortuneCatIcon = false;
            this.fortuneCatMainLayer = sceneMgr.openGUI(FortuneCatMainLayer.className, FortuneCatMainLayer.tag, FortuneCatMainLayer.tag);
            if (this.isIngameIcon){
                this.fortuneCatMainLayer.animateIngameLayoutIn();
            }
            else {
                this.fortuneCatMainLayer.animateLayoutIn();
            }
        } else {
            this.isIngameIcon = false;
            if (!this.checkedAutoPopGUI){
                this.checkAutoPopGUI();
                this.checkedAutoPopGUI = true;
            }
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
            "Rước Mèo May Mắn",
            "🎁 Lộc về. Lộc về 🎁",
            "🔥 Đăng nhập ngay để nhận gold từ mèo may mắn",
            true
        );


        ///Notify user 12 hours after a cat is unlocked
        LocalNotification.getInstance().addNotify(
            Date.now() + this.catConfigList[pk.catId].openTime + 43200000,
            "Rước Mèo May Mắn",
            "🎁 Đừng bỏ lỡ cơ hội nhận " + FortuneCatUtility.formatCatGold(this.catConfigList[pk.catId].gold) + " gold miễn phí 🎁",
            "🔥 Đăng nhập ngay",
            true
        );

        LocalNotification.getInstance().showNotify();

        if (this.fortuneCatMainLayer !== null){
            this.fortuneCatMainLayer.updateUnlockingCatInfo(this.userOpenCatId, this.unlockingCatIndex);
            this.fortuneCatMainLayer.updateCatSlotList(this.userCatIdList);
            this.fortuneCatMainLayer.updateProgressValue(this.userNumBell, this.userCatIdList.length);
        }

        ///turn off ingame highlight if possible
        if (sceneMgr.getMainLayer() instanceof BoardScene){
            this.ingameIcon.stopHighlight();
            this.ingameIcon.checkFullCat();
        }
    },

    onReceiveReward: function(pk){
        if (this.fortuneCatMainLayer !== null){
            this.userOpenCatId = -1;

            this.fortuneCatMainLayer.btnReceiveReward.setVisible(false);
            this.fortuneCatMainLayer.mainCatClock.setVisible(true);
            this.fortuneCatMainLayer.mainCatBody.setVisible(false);
            this.fortuneCatMainLayer.mainCatSilhouette.setVisible(true);
            this.fortuneCatMainLayer.btnReceiveReward.stopAllActions();
            this.fortuneCatMainLayer.btnReceiveReward.setScale(1);
            this.fortuneCatMainLayer.animatePlayNowButton();

            this.lobbyIcon.notifyFinishUnlocking(false);

            // var gui = sceneMgr.openGUI(FortuneCatUnlockedReward.className, FortuneCatUnlockedReward.TAG, FortuneCatUnlockedReward.TAG);
            // var bonusData = new BonusData(pk.gold, ShopSuccessData.TYPE_GOLD);
            // var array = [];
            //
            // array.push(bonusData);
            // gui.pushArrayBonus(array, localized("RECEIVE_GIFT"));

            receivedMgr.setReceivedGUIInfo(
                [new ReceivedGUIData(ReceivedCell.TYPE_GOLD, pk.gold)],
                "Phần thưởng rước Mèo may mắn"
            );
            receivedMgr.openGUI();

            ///cancel 2nd noti
            LocalNotification.getInstance().cancelAllNotification();
            cc.log("Cancel noti");
        }
    },

    onReceiveBell: function(pk){
        this.updateBell(pk.numBell);

        if (this.ingameIcon) this.ingameIcon.endGameFx();
    },

    onReceiveCat: function(pk){
        this.userCatIdList.push(pk.catId);
        this.recentCatId = pk.catId;

        this.ingameIcon.addFlyCatFx(this.recentCatId, 1);
        this.ingameIcon.checkNoCatUnlock();
        this.recentCatId = null;
    },
    ///end - handlers

    ///start - senders
    sendGetUserData: function(){
        var pk = new CmdGetUserFortuneCatData();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendUnlockFortuneCat: function(catIndex){
        var pk = new CmdUnlockFortuneCat();
        pk.putData(catIndex);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendGetFortuneCatReward: function(){
        var pk = new CmdGetFortuneCatReward();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatBell: function(numBell){
        var pk = new CmdCheatFortuneCatBell();
        pk.putData(numBell);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatCat: function(catIdList){
        var pk = new CmdCheatFortuneCat();
        pk.putData(catIdList);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendCheatUnlock: function(){
        var pk = new CmdCheatUnlockFortuneCat();
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
        var fortuneCatMgr = FortuneCatManager.getInstance();

        if (!this.lobbyIcon) {
            var gui = sceneMgr.getRunningScene().getMainLayer();
            if (gui instanceof LobbyScene) {
                this.lobbyIcon = new FortuneCatIcon(false);
                gui.pRightButton.addChild(this.lobbyIcon);
                gui.arrayTopRight.push(this.lobbyIcon);
            }
        }
        if (!this.lobbyIcon) return;

        var btn = this.lobbyIcon;
        ///check show noti or not
        if (this.checkNotifyCondition()){
            btn.notifyFinishUnlocking(true);
        } else {
            btn.notifyFinishUnlocking(false);
        }

        ///check show remain time or not
        if (fortuneCatMgr.userOpenRemainTime > 0){
            fortuneCatMgr.lobbyIcon.updateRemainTime(Math.floor(fortuneCatMgr.userOpenRemainTime / 1000));
        } else{
            fortuneCatMgr.lobbyIcon.showProgress();
        }
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
    },

    onEnterLobby: function () {
        this.sendGetUserData();
        this.checkShowNotify();
    },
    ///end - notify logic
    ///start - auto pop GUI logic
    checkAutoPopGUI: function(){
        if (
            this.userOpenCatId !== null &&
            this.userOpenCatId !== -1 &&
            this.userOpenRemainTime == 0
        ){
            if (gamedata.getUserGold() <= 5000000){
                this.userClickedFortuneCatIcon = true;
                this.sendGetUserData();
            }
        }
    }
    ///end - auto pop GUI logic
});

FortuneCatManager.instance = null;
FortuneCatManager.getInstance = function(){
    if (!FortuneCatManager.instance){
        FortuneCatManager.instance = new FortuneCatManager();
    }
    return FortuneCatManager.instance;
}

var fortuneCatMgr = FortuneCatManager.getInstance();

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
