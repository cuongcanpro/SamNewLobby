var WChallenge = cc.Class.extend({
    ctor: function () {
        this.scheduleLoadUserId = null;
        this.inEvent = false;
        this.tasksConfig = null;
        this.goldRewards = null;
        this.cloverRewards = null;
        this.goldPerClover = -1;
        this.nbOfBasicRewards = -1;
        this.premiumPrice = null;
        this.startTime = -1; // start time after calculated follow client time
        this.currClovers = -1;
        this.isPremium = -1;
        this.challengeDay = -1;
        this.currProgress = -1;
        this.currMaxProgress = -1;
        this.currTaskId = -1;
        this.currTaskName = '';
        this.nextTaskId = '';
        this.nextTaskName = '';
        this.nextProgress = -1;
        this.nextMaxProgress = -1;
        this.autoTakeGoldReward = -1;
        this.autoTakeCloverReward = -1;
        this.rewardStates = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        this.taskProgresses = [0,0,0,0,0,0,0];
        this.enteredGUI = null;
        this.isUserInfoLoaded = false;
        this.isConfigLoaded = false;
        this.gui = null;

        this.delayGetConfigFlag = false;
        this.delayOpenMainGuiFlag = false;
        this.claimRewardInGameFlag = false;

        this.arrayCloverProgress = [];
        this.arrayGoldProgress = [];
        this.arrayGiftProgress = [];

        //this.preloadResource();
    },
    preloadResource: function () {
        if (!this.isFinishDownload)
            return;
        LocalizedString.add("res/Event/WeeklyChallenge/Localized/WC_Localized_vi");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/WeeklyChallenge/Popup/anim/Light_shop/skeleton.xml", "FX_Light");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/WeeklyChallenge/Popup/anim/Light_shop/texture.plist", "FX_Light");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/WeeklyChallenge/Popup/anim/Shop_Muala/skeleton.xml", "Muala");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/WeeklyChallenge/Popup/anim/Shop_Muala/texture.plist", "Muala");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Event/WeeklyChallenge/Popup/anim/bt_lock/skeleton.xml", "Lock");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Event/WeeklyChallenge/Popup/anim/bt_lock/texture.plist", "Lock");
    },
    setInEvent: function (inEvent) {
        if(inEvent === this.inEvent) {
            return;
        }
        this.inEvent = inEvent;
        if(this.inEvent === true) {
            if(this.buttonLobby) {
                cc.log("SHOW BUTTON ne 1 ** fds");
                this.buttonLobby.setVisible(true);
            }
        } else {
            if(this.buttonLobby) {
                cc.log("VO DAY ne 1 **fds ");
                this.buttonLobby.setVisible(false);
            }
        }
        event.reloadLayoutButton();
    },
    isInEvent: function () {
        if(this.inEvent === false) {
            return false;
        }
        if(this.startTime !== -1 && this.startTime + 86400 * (this.nbOfBasicRewards + 1) < Date.now() / 1000) {
            this.inEvent = false;
        }
        return this.inEvent && !this.isExchangedCloverGold;
    },
    isEndEvent: function () {
        return this.inEvent;
    },
    onReceive: function (cmd, data) {
        switch (cmd) {
            case WChallenge.CMD_CONFIG: {
                var pk = new CmdReceivedWChallengeConfig(data);
                if(pk.status !== 0) {
                    return;
                }
                cc.log("CONFIG WCHALLENGE " + JSON.stringify(pk));
                this.nbOfBasicRewards = pk.nbOfBasicRewards;
                this.goldPerClover = pk.goldPerClover;
                this.isConfigLoaded = true;
                this.tasksConfig = pk.tasksConfig;
                this.goldRewards = pk.goldRewards;
                this.cloverRewards = pk.cloverRewards;
                this.diamondRewards = pk.diamondRewards;
                this.premiumPrice = pk.premiumPrice;
                this.startTime = pk.startTime + Math.round(Date.now() / 1000) - pk.currTime;
                this.buyGoldToClover = pk.buyGoldToClover;
                this.challengeDay = Math.ceil((Date.now() / 1000 - this.startTime) / 86400);
                cc.log("CHALLENGE DAY " + this.challengeDay);
                if (this.challengeDay == 8) {
                    this.setInEvent(false);
                    this.haveEvent = false;
                    if (this.buttonLobby)
                        this.buttonLobby.setVisible(false);
                    return;
                }
                this.scheduleLoadUserInfo();
                this.updateCurrTask();
                this.setInEvent(true);
                this.haveEvent = true;
                this.arrayCloverProgress = pk.arrayClover;
                this.arrayGoldProgress = pk.arrayGold;
                this.openEvent();
                pk.clean();
                var event = new cc.EventCustom(WChallenge.EVENT.WCHALLENGE_LOAD_CONFIG);
                cc.eventManager.dispatchEvent(event);

                var rEventShop = {};

                rEventShop.smsGoldFirstValue = [];
                rEventShop.smsGoldFirstTicket = [];
                rEventShop.iapGoldFirstValue = [];
                rEventShop.iapGoldFirstTicket = [];
                rEventShop.zingGoldFirstValue = [];
                rEventShop.zingGoldFirstTicket = [];
                rEventShop.atmGoldFirstValue = [];
                rEventShop.atmGoldFirstTicket = [];
                rEventShop.zaloPayGoldFirstValue = [];
                rEventShop.zaloPayGoldFirstTicket = [];

                for (var r in this.buyGoldToClover[Payment.GOLD_SMS]) {
                    rEventShop.smsGoldFirstValue.push(r);
                    rEventShop.smsGoldFirstTicket.push(StringUtility.standartNumber(this.buyGoldToClover[Payment.GOLD_SMS][r]));
                }
                for (var r in this.buyGoldToClover[Payment.GOLD_IAP]) {
                    rEventShop.iapGoldFirstValue.push(r);
                    rEventShop.iapGoldFirstTicket.push(StringUtility.standartNumber(this.buyGoldToClover[Payment.GOLD_IAP][r]));
                }
                for (var r in this.buyGoldToClover[Payment.GOLD_ZING]) {
                    rEventShop.zingGoldFirstValue.push(r);
                    rEventShop.zingGoldFirstTicket.push(StringUtility.standartNumber(this.buyGoldToClover[Payment.GOLD_ZING][r]));
                }
                for (var r in this.buyGoldToClover[Payment.GOLD_ATM]) {
                    rEventShop.atmGoldFirstValue.push(r);
                    rEventShop.atmGoldFirstTicket.push(StringUtility.standartNumber(this.buyGoldToClover[Payment.GOLD_ATM][r]));
                }
                for (var r in this.buyGoldToClover[Payment.GOLD_ZALO]) {
                    rEventShop.zaloPayGoldFirstValue.push(r);
                    rEventShop.zaloPayGoldFirstTicket.push(StringUtility.standartNumber(this.buyGoldToClover[Payment.GOLD_ZALO][r]));
                }
                Event.instance().onEventShopBonusNew(rEventShop, Event.WEEKLY_CHALLENGE);


                break;
            }
            case WChallenge.CMD_USER_INFO: {
                var pk = new CmdReceivedWChallengeUserInfo(data);
                cc.log(" CMD_USER_INFO " + JSON.stringify(pk));
                this.isUserInfoLoaded = true;
                this.currClovers = pk.currClovers;
                this.isPremium = pk.isPremium;
                this.isExchangedCloverGold = pk.isExchangedCloverGold;
                //if(this.challengeDay === WChallenge.getInstance().nbOfBasicRewards + 1) {
                //    if (this.currClovers == 0)
                //        this.isExchangedCloverGold = 1;
                //}
                this.rewardStates = pk.rewardStates;
                this.taskProgresses = pk.taskProgresses;
                this.isAnimatedUnlockPremium = pk.isAnimatedUnlockPremium;
                this.enteredGUI = pk.enteredGUI;
                this.updateCurrTask();
                // schedule for change day
                if (this.challengeDay < 8) {
                    if (this.buttonLobby) {
                        try {
                            this.buttonLobby.setVisible(true);
                            Event.instance().reloadLayoutButton();
                        } catch (e) {

                        }
                    }
                }
                pk.clean();
                this.arrayGiftProgress = pk.giftLists;
                var event = new cc.EventCustom(WChallenge.EVENT.WCHALLENGE_LOAD_USER_INFO);
                cc.eventManager.dispatchEvent(event);

                break;
            }
            case WChallenge.CMD_TAKE_ALL_REWARDS: {
                var pk = new CmdReceivedWChallengeTakeAllReward(data);
                cc.log(" WChallenge.CMD_TAKE_ALL_REWARDS " + JSON.stringify(pk));
                if (pk.status == W_CHALLENGE_PACKET_NOT_OK) {
                    this.claimRewardInGameFlag = true;
                    Toast.makeToast(Toast.LONG, LocalizedString.to("WC_CLAIM_REWARD_AFTER_END_GAME"));
                    break;
                }
                var event = new cc.EventCustom(WChallenge.EVENT.WCHALLENGE_TAKE_ALL_REWARD);
                event.setUserData({
                    goldReceived: pk.goldReceived,
                    cloverReceived: pk.cloverReceived,
                    diamondReceived: pk.diamondReceived
                });
                cc.eventManager.dispatchEvent(event);
                this.claimRewardInGameFlag = false;

                break;
            }
            case WChallenge.CMD_AUTO_TAKE_REWARD: {
                if (!this.isFinishDownload)
                    return;
                // show popup auto take reward
                var pk = new CmdReceivedWChallengeAutoTakeReward(data);
                this.autoTakeGoldReward = pk.goldReceived;
                this.autoTakeCloverReward = pk.cloverReceived;
                this.autoTakeDiamondReward = pk.diamondReceived;
                this.oldDay = pk.day;
                if(this.autoTakeCloverReward > 0 || this.autoTakeCloverReward > 0) {
                    sceneMgr.openGUI(WChallengeAutoGetRewardGUI.className, 1000, 1000, false);
                }
                break;
            }
            case WChallenge.CMD_BUY_PREMIUM: {
                var pk = new CmdReceivedBuyPremium(data);
                if (pk.errorCode === 1) {
                    SceneMgr.getInstance().showAddGDialog(LocalizedString.to("GUI_SHOP_NOT_ENOUGHT_G"), this, function (btnID) {
                        if (btnID == Dialog.BTN_OK) {
                            gamedata.openNapG();
                        }
                    });
                }
                break;
            }
            case WChallenge.CMD_BONUS_CLOVER_FROM_SHOP: {
                var pk = new CmdReceivedBuyGoldBonus(data);
                if (pk.isOffer)
                    return;
                return;
                if (pk.clovers > 0) {
                    var popup = sceneMgr.openGUI(WChallengeBonusPopup.className);
                    popup.setCloversBonus(pk.clovers);
                }
                break;
            }
            case WChallenge.CMD_GET_GIFT_PROGRESS: {
                var pk = new CmdReceivedGiftProgress(data);
                cc.log("CMD_GET_GIFT_PROGRESS" + JSON.stringify(pk));
                this.arrayGiftProgress = pk.giftLists;
                if (pk.gold > 0) {
                    var gui = sceneMgr.openGUI(GUIReceiveGift.className, GUIReceiveGift.TAG, GUIReceiveGift.TAG);
                    var pEndGold = cc.p(-1, -1);
                    try {
                        if (this.gui && this.gui.isShow) {
                            this.gui.pCloverProgress.updateInfo();
                            this.gui.pCloverInfo.updateInfo();
                            pEndGold = this.gui.getPositionGold();
                        }
                    }
                    catch (e) {
                        cc.log("ERROR " + e.stack);
                    }
                    var bonusData = new BonusData(pk.gold, ShopSuccessData.TYPE_GOLD, pEndGold);
                    var array = [];
                    array.push(bonusData);
                    gui.pushArrayBonus(array, localized("RECEIVE_GIFT"));

                }
            }
        }
    },

    getKeyTask: function (taskId) {
        return LocalizedString.config("GAME") + "_" + taskId;
    },

    getTaskName: function (taskId, max) {
        var s = LocalizedString.to(this.getKeyTask(taskId));
        s = StringUtility.replaceAll(s, "@num", max);
        return s;
    },

    updateCurrTask: function () {
        var nbOfBasicRewards = WChallenge.getInstance().nbOfBasicRewards;
        if(!this.isConfigLoaded || !this.isUserInfoLoaded) {
            return;
        }
        if(this.challengeDay <= nbOfBasicRewards) {
            this.currProgress = this.taskProgresses[this.challengeDay - 1];
            this.currMaxProgress = this.tasksConfig[this.challengeDay - 1].number;
            this.currTaskId =  this.tasksConfig[this.challengeDay - 1].taskId;
            this.currTaskName = LocalizedString.to(this.getKeyTask(this.currTaskId));
            this.currTaskName = StringUtility.replaceAll(this.currTaskName, "@num", this.currMaxProgress);
        }
        else {
            this.currTaskId =  '';
            this.currTaskName =  '';
            this.currProgress = -1;
            this.currMaxProgress = -1;
        }
        if(this.challengeDay < nbOfBasicRewards) {
            this.nextProgress = this.taskProgresses[this.challengeDay];
            this.nextMaxProgress = this.tasksConfig[this.challengeDay].number;
            this.nextTaskId =  this.tasksConfig[this.challengeDay].taskId;
            this.nextTaskName = LocalizedString.to(this.getKeyTask(this.nextTaskId));
            this.nextTaskName = StringUtility.replaceAll(this.nextTaskName, "@num", this.nextMaxProgress);
        }
        else {
            this.nextTaskId =  '';
            this.nextTaskName =  '';
            this.nextProgress = -1;
            this.nextMaxProgress = -1;
        }
        var event = new cc.EventCustom(WChallenge.EVENT.WCHALLENGE_UPDATE_DATA);
        cc.eventManager.dispatchEvent(event);
    },
    showNotifyEvent: function (btn) {
        if(btn)
            this.buttonLobby = btn;
        this.buttonLobby.retain();
        if(!this.buttonLobby)return;
        this.buttonLobby.hideComponent();
        try {
            this.buttonLobby.setScale(0.85);
            this.buttonLobby.anim.removeAllChildren();
            this.wChallengeLobbyBtn = new WChallengeLobbyBtn(WChallengeLobbyBtn.LOBBY_CTX);
            this.wChallengeLobbyBtn.setPosition(this.buttonLobby.width * 0.0, this.buttonLobby.height * 0.1);
            this.wChallengeLobbyBtn.setScale(0.8);
            this.buttonLobby.anim.addChild(this.wChallengeLobbyBtn);
        }
        catch (e) {
            cc.log("ERROR " + e.stack);
        }

        // if (!this.wChallengeLobbyBtn) {
        //     this.wChallengeLobbyBtn = new WChallengeLobbyBtn(WChallengeLobbyBtn.LOBBY_CTX);
        //     this.wChallengeLobbyBtn.setPosition(this.buttonLobby.width * 0.1, this.buttonLobby.height * 0.1);
        //     this.wChallengeLobbyBtn.setScale(0.8);
        //     this.buttonLobby.addChild(this.wChallengeLobbyBtn);
        // }
        if (this.inEvent || this.haveEvent) {
            this.buttonLobby.setVisible(true);

        } else {
            this.buttonLobby.setVisible(false);
        }
    },
    openEvent: function () {
        if (!this.isInEvent())
            return;
        var lastOpenDay = cc.sys.localStorage.getItem(WChallenge.LAST_OPENED_DAY_KEY);
        if(this.challengeDay.toString() === lastOpenDay) {
            return;
        }
        cc.sys.localStorage.setItem(WChallenge.LAST_OPENED_DAY_KEY, this.challengeDay.toString());
        this.openMainGUI();
    },
    resetData: function () {
        this.inEvent = false;
        this.haveEvent = false;
    },
    isReceivedTodayReward: function () {
        return this.rewardStates[(this.challengeDay - 1) * 2] === WChallenge.SERVER_REWARD_STATE.RECEIVED_REWARD &&
            (this.isPremium === 0 ||
                (this.isPremium === 1
                    && this.rewardStates[(this.challengeDay - 1) * 2 + 1] === WChallenge.SERVER_REWARD_STATE.RECEIVED_REWARD))
    },

    checkRewardNotReceive: function () {
        cc.log("REWARD STATE " + JSON.stringify(this.rewardStates));
        return (this.rewardStates[(this.challengeDay - 1) * 2] == WChallenge.SERVER_REWARD_STATE.CAN_RECEIVE_REWARD ||
            this.rewardStates[(this.challengeDay - 1) * 2 + 1] == WChallenge.SERVER_REWARD_STATE.CAN_RECEIVE_REWARD);
        // for (var i = 0; i < 7; i++) {
        //     if (this.rewardStates[i * 2] == WChallenge.SERVER_REWARD_STATE.CAN_RECEIVE_REWARD ||
        //         this.rewardStates[i * 2 + 1] == WChallenge.SERVER_REWARD_STATE.CAN_RECEIVE_REWARD)
        //         return true;
        // }
        // return false;
    },

    openUnlockPremiumGUI: function () {
        sceneMgr.openGUI(WChallengeBuyPremiumPopup.className, 100, 100, false);
    },
    openMainGUI: function () {
        if (!this.isFinishDownload)
            return;
        this.gui = sceneMgr.openGUI(WChallengePopup.className, 100, 100, false);
    },
    scheduleLoadUserInfo: function () {
        if(this.scheduleLoadUserId !== null) {
            clearTimeout(this.scheduleLoadUserId);
        }
        this.scheduleLoadUserId = setTimeout(function(){
            if (!(sceneMgr.getMainLayer() instanceof LobbyScene)) {
                this.delayGetConfigFlag = true;
                return;
            }
            this.loadUserInfo();
        }.bind(this), (this.startTime + 86400 * this.challengeDay - Math.round(Date.now() / 1000) + 2) * 1000);
    },

    loadUserInfo: function () {
        if(this.challengeDay === WChallenge.getInstance().nbOfBasicRewards + 1) {
            this.setInEvent(false);
            this.haveEvent = false;
        } else {
            cc.log("LOAD USER INFO *");
            var cmd = new CmdSendWChallengeLoadUserInfo();
            GameClient.getInstance().sendPacket(cmd);
            cmd = new CmdSendWChallengeLoadConfig();
            GameClient.getInstance().sendPacket(cmd);
        }
    },

    onEndGame: function () {
        if (!this.isInEvent())
            return;
        if (this.claimRewardInGameFlag) {
            var cmd = new CmdSendWChallengeTakeAllReward();
            GameClient.getInstance().sendPacket(cmd);
        }
    },

    addAccumulateGUI: function () {
        if (!this.isFinishDownload)
            return;
        var tag = 1030;
        var board = sceneMgr.getMainLayer();
        if (board._layout.getChildByTag(tag)) {
            if(this.challengeDay === WChallenge.getInstance().nbOfBasicRewards + 1) {
                this.wChallengeBtn.setVisible(false);
            }
            else {
                this.wChallengeBtn.setVisible(true);
            }
            return;
        }
        var avatarPos = CheckLogic.getPosFromPlayer(gamedata.userData.uID);
        this.wChallengeBtn = new WChallengeLobbyBtn(WChallengeLobbyBtn.IN_GAME_CTX, avatarPos.x, avatarPos.y);
        this.wChallengeBtn.retain();
        this.wChallengeBtn.setPosition(CheckLogic.getPosWeeklyChallenge());
        //this.wChallengeBtn.setPositionX(this.wChallengeBtn.getPositionX() - Math.random() * 50);
        board._layout.addChild(this.wChallengeBtn, 10, tag);
        if(this.challengeDay === WChallenge.getInstance().nbOfBasicRewards + 1) {
            this.wChallengeBtn.setVisible(false);
        }
        else {
            this.wChallengeBtn.setVisible(true);
        }
    },

    removeAccumulateGUI: function () {
        if (!this.isFinishDownload)
            return;
        try {
            if (this.wChallengeBtn) {
                this.wChallengeBtn.removeFromParent(true);
            }
        }
        catch (e) {

        }
    },

    resetEventButton: function () {
        this.wChallengeLobbyBtn = null;
    },

    getTicketTexture: function() {
        return "res/Event/WeeklyChallenge/Popup/Icons/CloverIcon.png";
    },

    getOfferTicketImage: function (id) {
        return "res/Lobby/Offer/bonusTicketClover.png";
    },

    getOfferTicketString: function () {
        return "Cỏ";
    },

    sendGetPogressGift: function(index, isAll) {
        var cmd = new CmdSendGetGiftProgress();
        cmd.putData(index, isAll);
        GameClient.getInstance().sendPacket(cmd);
    }
});

WChallenge._instance = null;
WChallenge.getInstance = function () {
    if(WChallenge._instance === null) {
        WChallenge._instance = new WChallenge();
    }
    return WChallenge._instance;
};

WChallenge.CMD_CONFIG = 31000;
WChallenge.CMD_RECEIVE_REWARD = 31001;
WChallenge.CMD_CHEAT_TASK = 31002;
WChallenge.CMD_BUY_PREMIUM = 31003;
WChallenge.CMD_USER_INFO = 31004;
WChallenge.CMD_AUTO_TAKE_REWARD = 31005;
WChallenge.CMD_EXCHANGE_GOLD_CLOVER = 31006;
WChallenge.CMD_TAKE_ALL_REWARDS = 31007;
WChallenge.CMD_ANIMATED_UNLOCK_PREMIUM = 31008;
WChallenge.CMD_OPEN_GUI = 31009;
WChallenge.CMD_BONUS_CLOVER_FROM_SHOP = 31010;
WChallenge.CMD_CHEAT_RESET_INFO = 31011;
WChallenge.CMD_CHEAT_DAY = 31012;
WChallenge.CMD_GET_GIFT_PROGRESS = 31020;
WChallenge.EVENT = {};
WChallenge.EVENT.WCHALLENGE_LOAD_CONFIG = 'WCHALLENGE_LOAD_CONFIG';
WChallenge.EVENT.WCHALLENGE_LOAD_USER_INFO = 'WCHALLENGE_LOAD_USER_INFO';
WChallenge.EVENT.WCHALLENGE_UPDATE_DATA = 'WCHALLENGE_UPDATE_DATA';
WChallenge.EVENT.WCHALLENGE_TAKE_ALL_REWARD = 'WCHALLENGE_TAKE_ALL_REWARD';
WChallenge.SERVER_REWARD_STATE = {
    CANNOT_RECEIVE_REWARD: 0,
    CAN_RECEIVE_REWARD: 1,
    RECEIVED_REWARD: 2,
    MISS_REWARD: 3
};
WChallenge.LAST_OPENED_DAY_KEY = 'WCHALLENGE_LAST_OPEND_DAY_KEY';

WChallenge.NO_GIFT = -1;
WChallenge.HAVE_GIFT = 0;
WChallenge.RECEIVED_GIFT = 0;
