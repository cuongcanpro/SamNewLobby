/**
 * Created by Hunter on 5/13/2016.
 */

var CommonLogic = function () {

};

CommonLogic.checkQuickPlay = function () {
    var minGold = ChanelConfig.instance().getMinBet() * ChanelConfig.instance().betTime;
    return (gamedata.userData.bean >= minGold);
};

CommonLogic.checkCreateRoomMinGold = function () {
    var minGold = ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].minGold;
    return (minGold > gamedata.userData.bean);
};

CommonLogic.checkCreateRoomMaxGold = function () {
    var maxGold = ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].maxGold;
    return (maxGold < gamedata.userData.bean);
};

CommonLogic.checkCaptureInBoard = function () {
    if (BoardScene.sharedPhoto) {
        BoardScene.sharedPhoto = false;

        var pk = new CmdSendTangGold();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    }
};

CommonLogic.getMinGoldCreateRoom = function () {
    return (ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].minGold);
};

CommonLogic.getMaxGoldCreateRoom = function () {
    return (ChanelConfig.instance().getMaxGoldCanPlayInChannel());
};

CommonLogic.checkNotifyNotEnoughGold = function (roomInfo) {
    if (roomInfo.type == 1) {
        if (ChanelConfig.instance().getBetAdvance(roomInfo.bet) * ChanelConfig.instance().betTime > gamedata.userData.bean) {
            SceneMgr.getInstance().showOKDialog(LocalizedString.to("PLAY_NOT_ENOUGHT_GOLD_ROOM"));
            return true;
        }
    } else {
        if (ChanelConfig.instance().getBet(roomInfo.bet) * ChanelConfig.instance().betTime > gamedata.userData.bean) {
            SceneMgr.getInstance().showOKDialog(LocalizedString.to("PLAY_NOT_ENOUGHT_GOLD_ROOM"));
            return true;
        }
    }

    return false;
};

CommonLogic.sortRoomBetAsc = function (a, b) {
    // var ax = (a.type != 1) ? ChanelConfig.instance().getBet(a.bet) : ChanelConfig.instance().getBetAdvance(a.bet);
    // var bx = (b.type != 1) ? ChanelConfig.instance().getBet(b.bet) : ChanelConfig.instance().getBetAdvance(b.bet);
    //
    // return ax < bx;
    return a.bet - b.bet;
};

CommonLogic.sortRoomBetDesc = function (a, b) {
    // var ax = (a.type != 1) ? ChanelConfig.instance().getBet(a.bet) : ChanelConfig.instance().getBetAdvance(a.bet);
    // var bx = (b.type != 1) ? ChanelConfig.instance().getBet(b.bet) : ChanelConfig.instance().getBetAdvance(b.bet);
    //
    // return ax > bx;
    return b.bet - a.bet;
};

CommonLogic.onUpdateMoney = function (update) {
    var board = sceneMgr.getRunningScene().getMainLayer();

    if (board instanceof GameLayer) {

        if(update.uID == gamedata.userData.uID)
        {
            NewRankData.checkNotifyOpenRank(update.level);
            gamedata.userData.bean = update.bean;
            gamedata.userData.coin = update.coin;
            gamedata.userData.winCount = update.winCount;
            gamedata.userData.lostCount = update.lostCount;
            gamedata.userData.levelScore = update.levelScore;
            gamedata.userData.level = update.level;
            gamedata.userData.levelExp = update.levelExp;
            gamedata.userData.diamond = update.diamond;
        }

        if (gamedata.gameLogic) {
            var localChair = gamedata.gameLogic.convertChair(update.nChair);
            if ((localChair >= 0) && (localChair <= 4) && (gamedata.gameLogic._players[localChair]._info)) {
                gamedata.gameLogic._players[localChair]._info["bean"] = update.bean;
                gamedata.gameLogic._players[localChair]._info["exp"] = update.levelScore;
                gamedata.gameLogic._players[localChair]._info["winCount"] = update.winCount;
                gamedata.gameLogic._players[localChair]._info["lostCount"] = update.lostCount;
                gamedata.gameLogic._players[localChair]._info["level"] = update.level;
                gamedata.gameLogic._players[localChair]._info["levelExp"] = update.levelExp;
                gamedata.gameLogic._players[localChair]._info["diamond"] = update.diamond;
                gamedata.gameLogic._players[localChair]._active = true;
            }
            gamedata.gameLogic._gameState = GameState.NONE;
        }

        sceneMgr.updateCurrentGUI();
    }
};

CommonLogic.checkInBoard = function () {
    var gui = sceneMgr.getRunningScene().getMainLayer();
    return (gui instanceof BoardScene);
};

CommonLogic.convertChatPlayerInfo = function (user) {
    var data = {};
    data.avatar = user["avtURL"];
    data.exp = user["levelScore"];
    data.uName = user["name"];
    data.displayName = data.uName;
    data.win = user["winCount"];
    data.lost = user["lostCount"];
    data.gold = user["bean"];
    data.uId = user["uId"];
    data.uID = data.uId;
    data.uName = user["uName"];
    data.level = user["level"];
    data.levelExp = user["levelExp"];
    return data;
};

CommonLogic.convertUserInfo = function (user) {
    var inf = {};
    inf.avatar = user.avatar;
    inf.uID = user.uID;
    inf.displayName = user.uName;
    inf.zName = user.uName;
    inf.bean = user.bean;
    inf.levelScore = user.levelScore;
    inf.winCount = user.winCount;
    inf.lostCount = user.lostCount;
    return inf;
};

CommonLogic.convertCardCheat = function (arrCard) {
    for (var i = 0; i < arrCard.length; i++) {
        if (arrCard[i] >= 4) {
            arrCard[i] -= 4;
        } else {
            arrCard[i] = arrCard[i] + 52 - 4;
        }
    }
    return arrCard;
};

CommonLogic.showNotifyNetworkSlow = function (isSlow) {
    if (CheckLogic.checkInBoard()) {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        if (gui) gui.networkSlow(isSlow);
    }
};

CommonLogic.getDialogClassName = function () {
    if (CheckLogic.checkInBoard())
        return (Dialog.className + "_inboard");

    return Dialog.className;
};

CommonLogic.getUserInfoClassName = function () {
    if (CheckLogic.checkInBoard())
        return (UserInfoPanel.className + "_inboard");

    return UserInfoPanel.className;
};

CommonLogic.addIgnoreSceneCache = function () {
    sceneMgr.ignoreGuis.push("BoardScene");
};

CommonLogic.updateDesignSolution = function (layer) {
    if (!cc.sys.isNative) {
        // cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.SHOW_ALL);
        return;
    }
    var isFixWidth = false;
    if (layer == GameLayer.className) {
        var winSize = cc.director.getWinSize();
        if (winSize.width / winSize.height <= Constant.WIDTH / Constant.HEIGHT) {
            isFixWidth = true;
        }
    }
    if (isFixWidth) {
        cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.FIXED_WIDTH);
        sceneMgr.nDesignResolution = 1;
    } else {
        cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.FIXED_HEIGHT);
        sceneMgr.nDesignResolution = 0;
    }
};

CommonLogic.checkPlayNewEmoticon = function () {
    return true;
};

CommonLogic.checkVisibleNewEmoticon = function () {
    return true;
};

CommonLogic.checkMessageFriendNewGUI = function () {
    return true;
};

CommonLogic.getCardResource = function (id) {
    var _card = "res/common/cards/labai_";
    _card += id;
    _card += ".png";

    return _card;
};

CommonLogic.updateNetworkState = function (abc) {

};

CommonLogic.getPositionEvent = function () {
    return 200;
};

CommonLogic.getJackpotConfig = function (id) {
    return gamedata.jackpotJson[id];
};

CommonLogic.getPosFromPlayer = function (id) {
    var board = sceneMgr.getMainLayer();
    if (board && board instanceof BoardScene) {
        return board.getPosFromPlayer(id);
    }
    return cc.p(0, 0);
};

CommonLogic.getPathResourceGame = function () {
    return "res/Board/";
};

CommonLogic.getChairInClient = function (chair) {
    if (gamedata.gameLogic) {
        return gamedata.gameLogic.convertChair(chair);
    }
    return chair;
};

CommonLogic.getPosWeeklyChallenge = function () {
    if(CheckLogic.checkInBoard()) {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        return gui.getPosWeeklyChallenge();
    }
    return cc.p(0,0);
};