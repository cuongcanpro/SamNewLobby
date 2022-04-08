/**
 * Created by Hunter on 5/13/2016.
 */
var CheckLogic = function () {

};

/**
 * ===============================================================
 * =======================CONFIG COMMON GAME=======================
 * ===============================================================
 */

/**
 * ===============================================================
 * =======================LOGIC COMMON GAME=======================
 * ===============================================================
 */
CheckLogic.checkQuickPlay = function () {
    try {
        return channelMgr.checkQuickPlay();
    } catch (e) {
        cc.log("ERROR: CommonLogic.checkQuickPlay " + e);
        return false;
    }
};

CheckLogic.checkCreateRoomMinGold = function () {
    try {
        return CommonLogic.checkCreateRoomMinGold();
    } catch (e) {
        cc.log("ERROR: CommonLogic.checkCreateRoomMinGold " + e);
        return false;
    }
};

CheckLogic.checkCreateRoomMaxGold = function () {
    try {
        return CommonLogic.checkCreateRoomMaxGold();
    } catch (e) {
        cc.log("ERROR: CommonLogic.checkCreateRoomMaxGold " + e);
        return false;
    }
};

CheckLogic.checkCaptureInBoard = function () {
    try {
        CommonLogic.checkCaptureInBoard();
    } catch (e) {
        cc.log("ERROR: CommonLogic.checkCaptureInBoard " + e);
    }
};

CheckLogic.getMinGoldCreateRoom = function () {
    try {
        return CommonLogic.getMinGoldCreateRoom();
    } catch (e) {
        cc.log("ERROR: CommonLogic.getMinGoldCreateRoom " + e);
        return 0;
    }
};

CheckLogic.getMaxGoldCreateRoom = function () {
    try {
        return CommonLogic.getMaxGoldCreateRoom();
    } catch (e) {
        cc.log("ERROR: CommonLogic.getMaxGoldCreateRoom " + e);
        return 0;
    }
};

CheckLogic.checkNotifyNotEnoughGold = function (roomInfo) {

    try {
        return CommonLogic.checkNotifyNotEnoughGold(roomInfo);
    } catch (e) {
        cc.log("ERROR: CheckLogic.checkNotifyNotEnoughGold " + e);
    }
};

CheckLogic.sortRoomBetAsc = function (a, b) {
    try {
        return CommonLogic.sortRoomBetAsc(a, b);
    } catch (e) {
        cc.log("ERROR: CommonLogic.sortRoomBetAsc " + e);
        return true;
    }
};

CheckLogic.sortRoomBetDesc = function (a, b) {
    try {
        return CommonLogic.sortRoomBetDesc(a, b);
    } catch (e) {
        cc.log("ERROR: CommonLogic.sortRoomBetDesc " + e);
        return true;
    }
};

CheckLogic.onUpdateMoney = function (update) {

    try {
        CommonLogic.onUpdateMoney(update);
    } catch (e) {
        cc.log("ERROR: CommonLogic.onUpdateMoney " + e);
    }
};

CheckLogic.checkInBoard = function () {
    try {
        return CommonLogic.checkInBoard();
    } catch (e) {
        cc.log("ERROR:  CommonLogic.checkInBoard " + e);
        return false;
    }
};

CheckLogic.convertChatPlayerInfo = function (user) {
    try {
        return CommonLogic.convertChatPlayerInfo(user);
    } catch (e) {
        cc.log("ERROR:  CommonLogic.convertChatPlayerInfo " + e);
        return {};
    }
};

CheckLogic.convertUserInfo = function (user) {
    try {
        return CommonLogic.convertUserInfo(user);
    } catch (e) {
        cc.log("ERROR:  CommonLogic.convertUserInfo " + e);
        return {};
    }
};

CheckLogic.showNotifyNetworkSlow = function (isSlow) {
    try {
        CommonLogic.showNotifyNetworkSlow(isSlow);
    } catch (e) {
        cc.log("ERROR:  CommonLogic.showNotifyNetworkSlow " + e);
    }
};

CheckLogic.getDialogClassName = function () {
    try {
        return CommonLogic.getDialogClassName();
    } catch (e) {
        cc.log("ERROR: CommonLogic.getDialogClassName " + e);
        return Dialog.className;
    }
};

CheckLogic.getUserInfoClassName = function () {
    try {
        return CommonLogic.getUserInfoClassName();
    } catch (e) {
        cc.log("ERROR: CommonLogic.getUserInfoClassName " + e);
        return UserInfoPanel.className;
    }
};

CheckLogic.addIgnoreSceneCache = function () {
    try {
        CommonLogic.addIgnoreSceneCache();
    } catch (e) {
        cc.log("ERROR: CommonLogic.addIgnoreSceneCache " + e);
    }
};

CheckLogic.checkShowTutorial = function () {
    try {
        CommonLogic.checkShowTutorial();
    } catch (e) {
        cc.log("ERROR: CommonLogin.checkShowTutorial " + e);
    }
};

CheckLogic.checkPlayNewEmoticon = function (emo, parent, pos) {
    try {
        return CommonLogic.checkPlayNewEmoticon(emo, parent, pos);
    } catch (e) {
        cc.log("ERROR: CommonLogic.checkPlayNewEmoticon " + e);
    }

    return false;
};

CheckLogic.checkVisibleNewEmoticon = function () {
    try {
        return CommonLogic.checkVisibleNewEmoticon();
    } catch (e) {
        cc.log("ERROR: CommonLogic.checkVisibleNewEmoticon " + e);
    }

    return false;
};

CheckLogic.checkMessageFriendNewGUI = function () {
    try {
        return CommonLogic.checkMessageFriendNewGUI();
    } catch (e) {
        cc.log("ERROR: CommonLogic.checkMessageFriendNewGUI " + e);
    }

    return false;
};

CheckLogic.checkNoticeDailyMission = function () {
    try {
        return CommonLogic.checkNoticeDailyMission();
    } catch (e) {
        cc.log("ERROR: CommonLogic.checkNoticeDailyMission " + e);
    }
    return false;
};

CheckLogic.showDailyMissionGUI = function () {
    try {
        CommonLogic.showDailyMissionGUI();
    } catch (e) {
        cc.log("ERROR: CommonLogic.showDailyMissionGUI " + e);
    }
};

CheckLogic.updateDesignSolution = function (layer) {
    try {
        CommonLogic.updateDesignSolution(layer);
    } catch (e) {
        cc.log("ERROR: CommonLogic.updateDesignSolution " + e);
    }
};

CheckLogic.getCardResource = function (id) {
    try {
        return CommonLogic.getCardResource(id);
    } catch (e) {
        cc.log("ERROR: CommonLogic.getCardResource " + e);
    }
    return "";
};

CheckLogic.updateNetworkState = function (nState) {
    try {
        CommonLogic.updateNetworkState(nState);
    } catch (e) {
        //cc.log("ERROR: CommonLogic.updateNetworkState " + e);
    }
};

CheckLogic.retryConnectInBoard = function (isRetry) {
    try {
        CommonLogic.retryConnectInBoard(isRetry);
    } catch (e) {
        //cc.log("ERROR: CommonLogic.retryConnectInBoard " + e);
    }
};

CheckLogic.preloadLayer = function () {
    try {
        CommonLogic.preloadLayer();
    } catch (e) {
        cc.log("ERROR: CommonLogic.preloadLayer " + e);
    }
};

CheckLogic.getPosFromPlayer = function (id) {
    try {
        return CommonLogic.getPosFromPlayer(id);
    } catch (e) {
        cc.log("ERROR: CommonLogic.getPosFromPlayer " + e);
    }
    return cc.p(0, 0);
};

CheckLogic.getPlayerPosExcepted = function (id) {
    try {
        return CommonLogic.getPlayerPosExcepted(id);
    } catch (e) {
        cc.log("ERROR: CommonLogic.getAllPosPlayer " + e);
    }
    return [];
};

CheckLogic.playerInGame = function (zingId) {
    try {
        return CommonLogic.playerInGame(zingId);
    } catch (e) {
        cc.log("ERROR: CommonLogic.addBlackList " + e);
    }
};

CheckLogic.getPositionEvent = function () {
    try {
        return CommonLogic.getPositionEvent();
    } catch (e) {
        cc.log("ERROR: CommonLogic.getCardResVideoPoker " + e);
    }
    return 94;
};


CheckLogic.getJackpotConfig = function (channel) {
    try {
        return CommonLogic.getJackpotConfig(channel);
    } catch (e) {
        cc.log("ERROR: CommomLogic.addBlackList " + e);
    }
};

CheckLogic.convertCardCheat = function (arrCard) {
    try {
        return CommonLogic.convertCardCheat(arrCard);
    } catch (e) {
        cc.log("ERROR: CommonLogic.convertCardCheat " + e);
        return arrCard;
    }
};

CheckLogic.getPathResourceGame = function () {
    try {
        return CommonLogic.getPathResourceGame();
    } catch (e) {
        cc.log("ERROR: CommonLogic.convertCardCheat " + e);
        return "res/Board/";
    }
};

CheckLogic.getPosWeeklyChallenge = function () {
    try {
        return CommonLogic.getPosWeeklyChallenge();
    } catch (e) {
        cc.log("ERROR: CommonLogic.getPosWeeklyChallenge " + e);
        return cc.p(0, 0);
    }
};

CheckLogic.isGame = function (name) {
    var game = LocalizedString.config("GAME");
    if (game.indexOf(name) >= 0) {
        return true;
    }
    return false;
}

CheckLogic.isNewLobby = function () {
    var arrayGame = ["sam"];
    for (var i = 0; i < arrayGame.length; i++) {
        if (CheckLogic.isGame(arrayGame[i]))
            return true;
    }
    return false;
}

CheckLogic.checkEnoughGold = function () {
    return channelMgr.checkQuickPlay();
}