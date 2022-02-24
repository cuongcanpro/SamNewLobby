var RankData = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.rankConfig = null;
        this.curRankInfo = null;
        this.dataCurWeek = null;
        this.dataLastWeek = null;
        this.dataResultLastWeek = null;
        this.numberCupChange = 0;
        this.numberOldCup = 0;
        this.dataTruCup = null;
        this.topUsersData = null;

        RankData.preloadResources();
    },
    
    resetData: function(){
        this.curRankInfo = null;
        this.dataCurWeek = null;
        this.dataLastWeek = null;
        this.dataResultLastWeek = null;
        this.numberCupChange = 0;
        this.numberOldCup = 0;
        this.dataTruCup = null;
        this.topUsersData = null;
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case RankData.CMD_RANK_INFO_OTHER_USER: {
                var otherInfo = new CmdReceivedOtherRankInfo(pk);
                cc.log("otherInfo: ", JSON.stringify(otherInfo));
                sceneMgr.clearLoading();
                var otherInfoGUI = sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
                var info = new UserInfo();
                info.setInfoFromRankInfo(otherInfo);
                otherInfoGUI.setInfo(info);
                otherInfo.clean();
                return;
            }
        }
    },

    setCurRankInfo: function (curRankInfo) {
        cc.log("setCurRankInfo: ", JSON.stringify(curRankInfo));
        this.curRankInfo = curRankInfo;

        var gui = sceneMgr.getGUI(RankGUI.TAG);
        if (gui) gui.updateCurRank(this.curRankInfo);
    },

    getCurRankInfo: function () {
        return this.curRankInfo;
    },

    getNumberGoldMedal: function(){
        var curRank = this.getCurRankInfo();
        if (curRank.error !== 0){
            return 0;
        }
        try {
            if (this.getCurRankInfo()){
                return this.getCurRankInfo()["goldMedal"];
            }
        } catch (e) {
            return 0;
        }
    },

    getNumberSilverMedal: function(){
        var curRank = this.getCurRankInfo();
        if (curRank.error !== 0){
            return 0;
        }
        try {
            if (this.getCurRankInfo()){
                return this.getCurRankInfo()["silverMedal"];
            }
        } catch (e) {
            return 0;
        }
    },

    getNumberBronzeMedal: function(){
        var curRank = this.getCurRankInfo();
        if (curRank.error !== 0){
            return 0;
        }
        try {
            if (this.getCurRankInfo()){
                return this.getCurRankInfo()["bronzeMedal"];
            }
        } catch (e) {
            return 0;
        }
    },

    setRankConfig: function (rankConfig) {
        if (!!rankConfig){
            cc.log("setRankConfig: ", JSON.stringify(rankConfig.rankConfig));
            this.rankConfig = JSON.parse(rankConfig.rankConfig);
            RankData.MAX_RANK = this.rankConfig["numLevel"] - 1;
            RankData.MIN_LEVEL_JOIN_RANK = this.rankConfig["minLevelRanking"];
            RankData.MAX_PLAYER_IN_ONE_TABLE = this.rankConfig["maxUserOnRanking"];
            RankData.MAX_GAME_PER_DAY = this.rankConfig["maxAddGoldTimePerDay"];
            RankData.MINUS_CUP_NONE_PLAY = this.rankConfig["minusCupNonePlay"];
        }
    },

    getRankConfig: function () {
        if (this.rankConfig){
            return this.rankConfig;
        }
        return JSON.parse(RankData.TEMP_CONFIG);
    },

    setDataCurWeek: function(dataCurWeek){
        cc.log("setDataCurWeek: ", JSON.stringify(dataCurWeek));
        var oldPosition = -1;
        var oldGoldWin = 0;
        var oldSize = 0;
        if (this.dataCurWeek && this.dataCurWeek.topUser){
            try {
                oldSize = this.dataCurWeek.size;
                oldPosition = this.getMyRankPosition(true);
                oldGoldWin = this.dataCurWeek.topUser[oldPosition]["goldWin"];
            } catch (e) {
                oldPosition = -1;
            }
        }

        this.dataCurWeek = dataCurWeek;
        var newSize = 0;
        if (oldPosition >= 0){
            var newPosition = this.getMyRankPosition(true);
            var newGoldWin = this.dataCurWeek.topUser[newPosition]["goldWin"];
            RankData.detectUpdateGoldWin(newGoldWin - oldGoldWin, newPosition - oldPosition);
            newSize = this.dataCurWeek.size;
        }

        var gui = sceneMgr.getGUI(RankGUI.TAG);
        if (gui){
            if (newSize !== oldSize){
                gui.updateDetailRankInfo(true);
            }
        }
        if (RankData.waitOpenMiniRank){
            RankData.waitOpenMiniRank = false;
            var gui = sceneMgr.getGUI(RankData.MINI_RANK_GUI_TAG);
            if (gui) gui.showMiniRank(true);
        }
    },

    getDataCurWeek: function () {
        this.sortDataRank(this.dataCurWeek, true);
        return this.dataCurWeek;
    },

    getMyRankPosition: function(isCurWeek){
        var data = (isCurWeek) ? this.getDataCurWeek() : this.getDataLastWeek();
        for (var i = 0; i < data.topUser.length; i++){
            if (data.topUser[i].userId == userMgr.getUID()){
                return i;
            }
        }
    },

    sortDataRank: function(data, canRegister){
        if (!data || data.size === 0){
            return;
        }
        data.topUser.sort(function (a, b) {
            return b.goldWin - a.goldWin;
        });

        for (var i = 0; i < data.topUser.length; i++){
            data.topUser[i].idx = i;
            if (!!data.topUser[i].userId){
                data.topUser[i].isUser = true;
            }
        }

        if (canRegister){
            if (data.topUser[data.topUser.length - 1].isUser && data.size < RankData.MAX_PLAYER_IN_ONE_TABLE){
                var user = {};
                user.isUser = false;
                user.idx = data.size;
                data.topUser.push(user);
            }
        }
    },

    setDataLastWeek: function(dataLastWeek){
        cc.log("setDataLastWeek: ", JSON.stringify(dataLastWeek));
        this.dataLastWeek = dataLastWeek;
    },

    getDataLastWeek: function () {
        this.sortDataRank(this.dataLastWeek, false);
        return this.dataLastWeek;
    },

    setDataResultLastWeek: function(dataResult){
        this.dataResultLastWeek = dataResult;
    },

    getDataResultLastWeek: function(){
        return this.dataResultLastWeek;
    },

    setTopUsersData: function(topUsersData){
        this.topUsersData = topUsersData;
    },

    getTopUsersData: function(){
        this.sortDataRank(this.topUsersData, false);
        return this.topUsersData;
    },

    setDataTruCup: function(dataTruCup){
        this.dataTruCup = dataTruCup;
    },

    getDataTruCup: function(){
        return this.dataTruCup;
    },

    setNumberCupChange: function(numberCupChange){
        this.numberCupChange = numberCupChange;
    },

    getNumberCupChange: function(){
        return parseInt(this.numberCupChange);
    },

    setNumberOldCup: function(numberOldCup){
        this.numberOldCup = numberOldCup;
    },

    getNumberOldCup: function(){
        return parseInt(this.numberOldCup);
    },

    fakeMyDataInWeek: function(){
        var data = this.getDataCurWeek();
        var newList = [];
        for (var i = 0; i < data.size; i++){
            var newUser = {};
            newUser.userId = data.topUser[i].userId;
            newUser.userName = data.topUser[i].userName;
            newUser.avatar = data.topUser[i].avatar;
            newUser.goldWin = data.topUser[i].goldWin;
            if (data.topUser[i].userName === userMgr.getUserName()){
                newUser.goldWin = Math.random() * 10000000;
            }
            newList.push(newUser);
        }
        var newData = {};
        newData.topUser = newList;
        newData.size = newList.length;
        newData.remainTime = Math.floor(Math.random() * 7 * 86400 * 1000);

        this.setDataCurWeek(newData);

        newList.sort(function (a, b) {
            return b.goldWin - a.goldWin;
        });

        for (i = 0; i < newList.length; i++){
            if (newList[i].userName === userMgr.getUserName()){
                return i;
            }
        }

        return 0;
    }
});

RankData.detectUpdateGoldWin = function(expChange, positionChange){
    var scene = sceneMgr.getMainLayer();
    if (scene instanceof BoardScene)
        scene.effectExpRankChange(expChange, positionChange);
};

RankData.getRankImg = function(rank){
    var indexRank = Math.floor(rank/ 3);
    return "rank" + indexRank + ".png";
};

RankData.getRankLevelImg = function(rank){
    var indexLevel = (rank) % 3;
    return "level" + indexLevel + ".png";
};

RankData.getRankName = function(rank){
    var rankConfig = RankData.getInstance().getRankConfig();
    if (rankConfig){
        var level = rankConfig["level"];
        return level[rank]["name"];
    }
    return "Tân thủ";
};

RankData.getRankPointNeed = function(rank){
    try {
        var rankConfig = RankData.getInstance().getRankConfig();
        rank = rank + 1;
        if (rank >= RankData.MAX_RANK) rank = RankData.MAX_RANK - 1;
        return rankConfig["level"][rank]["cup"];
    } catch (e) {
        cc.error("getRankPointNeed: ", e);
        return 1;
    }
};

RankData.getRankByCup = function(cup){
    cup = parseInt(cup);
    var rankConfig = RankData.getInstance().getRankConfig();
    for (var i = rankConfig["numLevel"] - 2; i >= 0 ; i--){
        if (cup >= parseInt(rankConfig["level"][i]["cup"])){
            return i;
        }
    }
    return 0;
};

RankData.getGiftGold = function(rank, idx){
    var rankConfig = RankData.getInstance().getRankConfig();
    var winGold = rankConfig["prize"]["winGold"];
    var multiple = rankConfig["level"][rank]["prizeFactor"];
    if (idx >= winGold.length){
        return 0;
    }
    return winGold[idx] * multiple;
};

RankData.getGiftDiamond = function(rank, idx){
    var rankConfig = RankData.getInstance().getRankConfig();
    var packConfig = rankConfig["prizePack"];
    var prizePacks = rankConfig["level"][rank]["prizePacks"];
    if (idx < prizePacks.length){
        return packConfig[prizePacks[idx]]["diamond"];
    }
    else return 0;
};

RankData.getGiftItem = function(rank, idx){
    var rankConfig = RankData.getInstance().getRankConfig();
    var packConfig = rankConfig["prizePack"];
    var prizePacks = rankConfig["level"][rank]["prizePacks"];
    if (idx < prizePacks.length){
        var items = packConfig[prizePacks[idx]]["item"];
        if (items.length <= 0) return null;
        var itemValues = items[0].split("_");
        var itemType = Number(itemValues[0]);
        var itemSubType = Number(itemValues[1]);
        var itemId = Number(itemValues[2]);
        var path = StorageManager.getItemSmallIconPath(itemType, itemSubType, itemId);
        var text = StorageManager.getInstance().getExpiredText(itemType, itemSubType, itemId);
        return {path: path, text: text};
    }
    else return null;
};

RankData.getDiamondByPackId = function(packId){
    var rankConfig = RankData.getInstance().getRankConfig();
    var packConfig = rankConfig["prizePack"];
    if (packConfig[packId]){
        return packConfig[packId]["diamond"];
    }
    return 0;
};

RankData.getItemByPackId = function(packId){
    var rankConfig = RankData.getInstance().getRankConfig();
    var packConfig = rankConfig["prizePack"];
    if (packConfig[packId]){
        var items = packConfig[packId]["item"];
        if (items.length <= 0) return null;
        var itemValues = items[0].split("_");
        var itemType = Number(itemValues[0]);
        var itemSubType = Number(itemValues[1]);
        var itemId = Number(itemValues[2]);
        var path = StorageManager.getItemIconPath(itemType, itemSubType, itemId);
        var text = StorageManager.getInstance().getExpiredText(itemType, itemSubType, itemId);
        var scale = StorageManager.getItemIconScale(itemType) * 5/3;
        return {path: path, text: text, scale: scale};
    }
    return null;
};

RankData.getCupWinLose = function(rank, idx, size){
    var rankConfig = RankData.getInstance().getRankConfig();
    var winCup = rankConfig["prize"]["winCup"];
    var multiple = rankConfig["level"][rank]["prizeFactor"];
    if (idx < winCup.length){
        return winCup[idx] * multiple;
    }

    var loseIdx = size - 1 - idx;
    var loseCup = rankConfig["prize"]["lostCup"];
    if (loseIdx < loseCup.length){
        return - loseCup[loseIdx] * multiple;
    }

    return 0;
};

RankData.getTimeRemainStr = function(timeRemain){
    var str;
    var numDay = Math.floor(timeRemain / 86400);
    var numHour = Math.floor((timeRemain - numDay * 86400) / 3600);
    var numMinus = Math.floor((timeRemain - numDay * 86400 - numHour * 3600) / 60);
    var numSecond = Math.floor(timeRemain - numDay * 86400 - numHour * 3600 - numMinus * 60);

    var number = numDay;

    if (numDay > 0){
        str = localized("NEW_RANK_TXT_REMAIN_TIME_TYPE_DAY");
    } else if (numHour > 0){
        str = localized("NEW_RANK_TXT_REMAIN_TIME_TYPE_HOUR");
        number = numHour;
    } else if (numMinus > 0){
        str = localized("NEW_RANK_TXT_REMAIN_TIME_TYPE_MINUTE");
        number = numMinus;
    } else {
        str = localized("NEW_RANK_TXT_REMAIN_TIME_TYPE_SECOND");
        number = numSecond;
    }

    str = StringUtility.replaceAll(str, "@number", number < 10 ? ("0" + number) : number);
    return str;
};

RankData.getNumGamePlayed = function(){
    var numGamePlayed = RankData.getInstance().getDataCurWeek().numGameToday;
    if (numGamePlayed != null)
        return numGamePlayed;
    else return RankData.MAX_GAME_PER_DAY;
};

RankData.getMinusCupNonePlay = function(rank){
    var rankConfig = RankData.getInstance().getRankConfig();
    var multiple = rankConfig["level"][rank]["prizeFactor"];
    return multiple * RankData.MINUS_CUP_NONE_PLAY;
};

RankData.openTableRank = function(){
    if (!Config.ENABLE_NEW_RANK || Config.ENABLE_TESTING_NEW_RANK){
        Toast.makeToast(Toast.LONG, localized("NEW_RANK_COMING_SOON"));
        return;
    }

    var checkOpen = RankData.checkOpenRank(true);
    if (checkOpen){
        sceneMgr.openGUI(RankGUI.className, RankGUI.TAG, RankGUI.LOCAL_Z_ORDER);
        RankData.numberOpenGuiRankTracking++;
    }
    return checkOpen;
};

RankData.checkOpenRank = function(isNotify){
    if (!Config.ENABLE_NEW_RANK || Config.ENABLE_TESTING_NEW_RANK){
        return false;
    }
    if (userMgr.getLevel() >= RankData.MIN_LEVEL_JOIN_RANK) {
        if (RankGameClient.getInstance().isRankConnected()) {
            var rankConfig = RankData.getInstance().getRankConfig();
            if (!rankConfig || rankConfig["isMaintain"]) {
                if (isNotify){
                    Toast.makeToast(ToastFloat.MEDIUM, "Hệ thống đang bảo trì");

                }
                return false;
            }
            if (isNotify){
                var data = RankData.getInstance().getCurRankInfo();
                if (data && data.rank){
                    if (data.rank < 0){
                        Toast.makeToast(ToastFloat.MEDIUM, "Hệ thống đang xử lý thông tin");
                        return false;
                    }
                }
            }
            return true;
        } else {
            if (isNotify){
                Toast.makeToast(ToastFloat.MEDIUM, "Hệ thống đang xử lý thông tin");
            }

            var now = new Date().getTime();
            if (now - RankData.lastTimeTryToConnect - RankData.DELTA_TIME_TO_NEW_CONNECT * 1000 > 0){
                RankData.lastTimeTryToConnect = now;
                RankData.connectToServerRank();
            }
            return false;
        }
    } else {
        if (isNotify){
            var str = localized("NEW_RANK_NOT_ENOUGH_LEVEL_TO_JOIN");
            str = StringUtility.replaceAll(str, "@level", RankData.MIN_LEVEL_JOIN_RANK);
            Toast.makeToast(ToastFloat.SHORT, str);
        }
    }

    return false;
};

RankData.sendTrackingOpenGUI = function (){
    if (!RankData.numberOpenGuiRankTracking){
        return;
    }
    var sendLogClient = new CmdSendClientInfo();
    sendLogClient.putData(RankData.numberOpenGuiRankTracking, 3);
    GameClient.getInstance().sendPacket(sendLogClient);
    RankData.numberOpenGuiRankTracking = 0;
};

RankData.getOpenResultLastWeek = function(){
    var dataLastWeek = RankData.getInstance().getDataResultLastWeek();
    if (!!dataLastWeek){
        var numberOpenGUI = cc.sys.localStorage.getItem(RankData.KEY_SAVE_NUMBER_OPEN_GUI);
        if (dataLastWeek["goldGift"] > 0 || numberOpenGUI >= RankData.NUMBER_OPEN_RANK_HIGH){
            var gui = sceneMgr.getGUI(RankResultGUI.TAG);
            if (!gui){
                gui = sceneMgr.openGUI(RankResultGUI.className, RankResultGUI.TAG, RankResultGUI.TAG, false);
            }
            gui.updateResult(dataLastWeek);
            return true;
        }

        if (dataLastWeek["cup"] !== 0){
            var lobby = sceneMgr.getRunningScene().getMainLayer();
            if (lobby && lobby instanceof LobbyScene){
                lobby.onUpdateBtnRankCallFunc(dataLastWeek["cup"]);
            }
        }

        return true;
    }

    return false;
};

RankData.checkNotifyOpenRank = function(newLevel){
    if (userMgr.getLevel() < RankData.MIN_LEVEL_JOIN_RANK){
        if (newLevel >= RankData.MIN_LEVEL_JOIN_RANK){
            if (CheckLogic.checkInBoard()){
                userMgr.setLevel(newLevel);
                RankData.addMiniRankGUI(true);
                RankData.isEnoughLevelJoinRank = true;
            }
        }
    }
};

RankData.addMiniRankGUI = function(isTooltip){
    if (userMgr.getLevel() >= RankData.MIN_LEVEL_JOIN_RANK){
        var gui = sceneMgr.getGUI(RankData.MINI_RANK_GUI_TAG);
        if (!gui) {
            cc.log("addMiniRankGUI");
            var miniRank = sceneMgr.openGUI(RankMiniGUI.className, RankData.MINI_RANK_GUI_TAG, RankData.MINI_RANK_GUI_TAG, false);
            if (isTooltip) miniRank.showTooltipOpenRank();
            miniRank.btnMiniRank.setVisible(!CheckLogic.checkInBoard());
            RankData.waitOpenMiniRank = false;
        }
    }
};

RankData.removeMiniRankGUI = function(){
    var gui = sceneMgr.getGUI(RankData.MINI_RANK_GUI_TAG);
    if (gui){
        gui.removeFromParent(true);
    }
};

RankData.showMiniRankGUI = function(show){
    var gui = sceneMgr.getGUI(RankData.MINI_RANK_GUI_TAG);
    if (gui){
        if (show){
            RankData.waitOpenMiniRank = true;
            var cmdRankInfoWeek = new CmdSendGetWeekRank();
            cmdRankInfoWeek.putData(1);
            RankGameClient.getInstance().sendPacket(cmdRankInfoWeek);
            cmdRankInfoWeek.clean();
        }
        else gui.showMiniRank(false);
    }
};

RankData.connectToServerRank = function(){
    if (Config.ENABLE_NEW_RANK){
        RankGameClient.getInstance().connect();
    }
};

RankData.disconnectServer = function(){
    cc.log("RankData.disconnectServer ");
    try {
        RankGameClient.getInstance().disconnect();
        RankGameClient.getInstance().connectState = ConnectState.DISCONNECTED;
        engine.HandlerManager.getInstance().forceRemoveHandler("RankPingPong");
        engine.HandlerManager.getInstance().forceRemoveHandler("received_RankPingPong");
        RankGameClient.destroyInstance();
    } catch (e){
        cc.error("RankData.disconnectServer ", e.stack);
        NativeBridge.logJSManual("assets/src/Lobby/Module/Rank/RankData.js", 533, e.stack);
    }

};

RankData.preloadResources = function(){
    cc.spriteFrameCache.addSpriteFrames("res/Lobby/Ranking/Rank.plist");
    LocalizedString.add("res/Lobby/Ranking/Rank_Localize_vi");

    var forderAnim = "res/Lobby/Ranking/Animation/";

    db.DBCCFactory.getInstance().loadDragonBonesData(forderAnim + "HighlightBig/skeleton.xml","HighlightBig");
    db.DBCCFactory.getInstance().loadTextureAtlas(forderAnim + "HighlightBig/texture.plist", "HighlightBig");

    db.DBCCFactory.getInstance().loadDragonBonesData(forderAnim + "Rank/skeleton.xml","Rank");
    db.DBCCFactory.getInstance().loadTextureAtlas(forderAnim + "Rank/texture.plist", "Rank");

    db.DBCCFactory.getInstance().loadDragonBonesData(forderAnim + "TitleRank/skeleton.xml","TitleRank");
    db.DBCCFactory.getInstance().loadTextureAtlas(forderAnim + "TitleRank/texture.plist", "TitleRank");

    db.DBCCFactory.getInstance().loadDragonBonesData(forderAnim + "Huychuong/skeleton.xml","Huychuong");
    db.DBCCFactory.getInstance().loadTextureAtlas(forderAnim + "Huychuong/texture.plist", "Huychuong");

    db.DBCCFactory.getInstance().loadDragonBonesData(forderAnim + "Title_thanbai/skeleton.xml","Title_thanbai");
    db.DBCCFactory.getInstance().loadTextureAtlas(forderAnim + "Title_thanbai/texture.plist", "Title_thanbai");

    db.DBCCFactory.getInstance().loadDragonBonesData(forderAnim + "Title_canhan/skeleton.xml","Title_canhan");
    db.DBCCFactory.getInstance().loadTextureAtlas(forderAnim + "Title_canhan/texture.plist", "Title_canhan");

    db.DBCCFactory.getInstance().loadDragonBonesData(forderAnim + "Cup/skeleton.xml","Cup");
    db.DBCCFactory.getInstance().loadTextureAtlas(forderAnim + "Cup/texture.plist", "Cup");
};

RankData.instance = null;
RankData.getInstance = function () {
    if (RankData.instance == null){
        RankData.instance = new RankData();
    }
    return RankData.instance;
};
RankData.TEMPORARY_SCALE = 1.5;

RankData.MAX_RANK = 9;
RankData.MIN_LEVEL_JOIN_RANK = 3;
RankData.MAX_PLAYER_IN_ONE_TABLE = 100;
RankData.MAX_GAME_PER_DAY = 30;
RankData.MINUS_CUP_NONE_PLAY = 500;

RankData.MINI_RANK_GUI_TAG = 52;
RankData.DELTA_TIME_TO_NEW_CONNECT = 10;
RankData.NUMBER_OPEN_RANK_HIGH = 30;

RankData.lastTimeTryToConnect = 0;
RankData.numberOpenGuiRankTracking = 0;
RankData.isEnoughLevelJoinRank = false;
RankData.waitOpenMiniRank = false;

RankData.PORT_DEV = 10126;
RankData.IP_DEV = "120.138.72.33";
RankData.IP_DEV_WEB = "socket-dev.service.zingplay.com:10273";

RankData.PORT_LIVE = 443;
RankData.IP_LIVE = "61.28.254.205";
RankData.IP_LIVE_WEB = "sam-ranking.service.zingplay.com:843";

RankData.CMD_LOGIN = 1;
RankData.CMD_GET_RANK_CONFIG = 1005;
RankData.CMD_GET_RANK_INFO_USER = 1004;
RankData.CMD_GIFT_LAST_WEEK = 1002;
RankData.CMD_LIST_RANK_INFO_IN_WEEK = 1008;
RankData.CMD_SUB_CUP_OFFLINE = 1003;
RankData.CMD_GET_TOP_USERS = 1009;
RankData.CMD_RANK_INFO_OTHER_USER = 17001;
RankData.CMD_CHEAT_GOLD_WIN = 1011;
RankData.CMD_CHEAT_INFO = 1010;
RankData.CMD_PINGPONG = 50;

RankData.KEY_SAVE_NUMBER_OPEN_GUI = "keySaveNumberOpenGUI";
RankData.TEMP_CONFIG = "{\"isMaintain\":true,\"minLevelRanking\":3,\"level\":{\"0\":{\"prizeFactor\":1,\"name\":\"Tân Thủ\",\"cup\":0},\"1\":{\"prizeFactor\":2,\"name\":\"Tập Sự\",\"cup\":250},\"2\":{\"prizeFactor\":3,\"name\":\"NΓng Cao\",\"cup\":500},\"3\":{\"prizeFactor\":4,\"name\":\"Nghiệp Dư\",\"cup\":1000},\"4\":{\"prizeFactor\":5,\"name\":\"Chuyên Nghiệp\",\"cup\":2000},\"5\":{\"prizeFactor\":6,\"name\":\"Tinh Anh\",\"cup\":3500},\"6\":{\"prizeFactor\":7,\"name\":\"╨?i Cao Th?\",\"cup\":5000},\"7\":{\"prizeFactor\":8,\"name\":\"Thiên Tài\",\"cup\":7000},\"8\":{\"prizeFactor\":9,\"name\":\"Đỉnh Cao\",\"cup\":10000},\"9\":{\"prizeFactor\":10,\"name\":\"Thần Bài\",\"cup\":-1}},\"numLevel\":10,\"prize\":{\"winCup\":[1000,900,800,600,500,450,400,350,300,250],\"winGold\":[1500000,1000000,800000,700000,600000,350000,250000,150000,100000,50000],\"lostCup\":[200,200,200,200,200,100,100,100,100,100]}}";