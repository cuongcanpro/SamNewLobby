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
    if (MaubinhLayer.sharedPhoto) {
        MaubinhLayer.sharedPhoto = false;

        var pk = new CmdSendTangGold();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    }
}

CommonLogic.getMinGoldCreateRoom = function () {
    return (ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].minGold);
};

CommonLogic.getMaxGoldCreateRoom = function () {
    return (ChanelConfig.instance().getMaxGoldCanPlayInChannel());
};

CommonLogic.checkNotifyNotEnoughGold = function (roomInfo) {
    var notEnoughGold = false;
    if (roomInfo.type == 1) {
        if(ChanelConfig.instance().getCurChanel() < 2) {
            if (ChanelConfig.instance().getBet(roomInfo.bet) * ChanelConfig.instance().betTime > gamedata.userData.bean) {
                notEnoughGold = true;
            }
        }
        else
        {
            if (ChanelConfig.instance().getBet(roomInfo.bet) * ChanelConfig.instance().betTimeAt > gamedata.userData.bean) {
                notEnoughGold = true;
            }
        }
    }
    else {
        if (ChanelConfig.instance().getBet(roomInfo.bet) * ChanelConfig.instance().betTime > gamedata.userData.bean) {
            notEnoughGold = true;
        }
    }
    if (notEnoughGold){
        var message = localized("PLAY_NOT_ENOUGHT_GOLD_ROOM");
        if (gamedata.checkEnablePayment()) {
            SceneMgr.getInstance().showChangeGoldDialog(message, this, function (btnID) {
                if (btnID == Dialog.BTN_OK) {
                    gamedata.openShop(this._id,true);
                }
            });
        }
        else {
            sceneMgr.showOKDialog(message);
        }
    }
    return notEnoughGold;
};

CommonLogic.sortRoomBetAsc = function (a, b) {
    var ax = ChanelConfig.instance().getBet(a.bet);
    var bx = ChanelConfig.instance().getBet(b.bet);

    return ax - bx;
};

CommonLogic.sortRoomBetDesc = function (a, b) {
    var ax = ChanelConfig.instance().getBet(a.bet);
    var bx = ChanelConfig.instance().getBet(b.bet);

    return bx - ax;
};

CommonLogic.onUpdateMoney = function (update) {
    var board = sceneMgr.getRunningScene().getMainLayer();
    if (board instanceof MaubinhLayer) {
        board.onUpdateMoney(update);
    }
};

CommonLogic.checkInBoard = function () {
    var gui = sceneMgr.getRunningScene().getMainLayer();
    return (gui instanceof  MaubinhLayer);
};

CommonLogic.showNotifyNetworkSlow = function (isSlow) {
    if(sceneMgr.getRunningScene().getMainLayer() instanceof MaubinhLayer)
    {
        sceneMgr.getRunningScene().getMainLayer().networkSlow(isSlow);
    }
};

CommonLogic.getDialogClassName = function () {
    if(CheckLogic.checkInBoard())
    {
        return Dialog.className + "_";
    }

    return Dialog.className;
};

CommonLogic.updateNetworkState = function () {
};

CommonLogic.getCardResource = function (id) {
    if(id === undefined || id < 0 || id > 52) id = 52;

    var _card = "poker/labai_";
    _card += id;
    _card += ".png";

    return _card;
};

CommonLogic.getPositionevent = function () {
    return 94;
}
CommonLogic.getPosFromPlayer = function (id) {
    if(CheckLogic.checkInBoard()) {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        return gui.getPosFromPlayer(id);
    }
    return cc.p(0,0);
};

CommonLogic.getPathResourceGame = function () {
    return "res/Other/";
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