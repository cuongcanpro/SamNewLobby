var PotBreaker = cc.Class.extend({
    ctor: function () {
        this.potBreakerScene = null;
        this.potBreakerAccumulateGUI = null;
        this.buttonLobby = null;
    },

    resetData: function () {
        // config
        this.eventTime = 0; // event 0 : off event || 1-4 :: week of event || 5 :: over event , wait off event
        this.giftNames = {}; // key : id of item - value : name of item
        this.giftValues = {}; // key : id of item - value : value of item
        this.giftItemImages = {}; // key : id of item - value : image path of item
        this.costRoll = [];     // cost to roll in event
        this.bonusCostRoll = [];  // bonus cost
        this.bonusGold = 0; // bonus change gold in event
        this.timeEventEnd = 0;
        this.notifyEvent = false;
        this.eventWeeks = [];
        this.eventDayFrom = "";
        this.eventDayTo = "";

        this.historyTopRank = [];
        this.historyMyRank = [];
        this.curTotalNumberToken = [0, 0, 0, 0];
        this.registerInfo = {};
        this.myCurRank = 1;
        this.mapInfo = [];
        for (var i = 0; i < PotBreaker.NUMBER_POT_IN_MAP; i++){
            this.mapInfo[i] = 1;
        }

        // data
        this.keyCoin = 0;
        this.gifts = []; // Object : {id:id of item,item: num item collect,gift : num gift you have }

        this.isRegisterSuccess = false;

        // scene
        this.potBreakerScene = null;
        this.potBreakerAccumulateGUI = null;
        this.buttonLobby = null;
        this.numberTicket = 0;

        // auto gift daily and next week
        this.arAutoGifts = [];
        this.currentAutoGift = 0;
        this.numGoldPot = 0;
        this.unreceivedTopGiftId = -1;
        this.sendCheckNewDay = false;
        this.saveDay = -1;
    },

    preloadResource : function () {
        // preload
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Lobby/Event/potBreaker/Icon_daovang/skeleton.xml","Icon_daovang");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Lobby/Event/potBreaker/Icon_daovang/texture.plist", "Icon_daovang");
        if (!this.isFinishDownload)
            return;
        if (Config.ENABLE_CHEAT) {
            //if (LocalizedString.config("GAME") != "tienlen" && false) {
            //    if (CheatCenter.SERVER_PORT != 443) {
            //         PotBreaker.NUMBER_TOP_RANK = 10;
            //         PotBreaker.NUMBER_TOP_RANK_VIP = 3;
            //         PotBreaker.ITEM_IN_GAME = 10003;
            //}
            //}
        }

        rPotSound["coin_1"] = rPotSound.coin_1;
        rPotSound["coin_2"] = rPotSound.coin_2;
        rPotSound["coin_3"] = rPotSound.coin_3;

        var musicOn = cc.sys.localStorage.getItem("eventPotBreakerMusic");
        cc.log("eventPotBreakerMusic" + PotBreakerSound.musicOn);
        if (!musicOn) {
            PotBreakerSound.musicOn = true;
        }
        else {
            PotBreakerSound.musicOn = musicOn === 1;
        }

        LocalizedString.add("res/Event/PotBreaker/PotBreakerRes/PotLocalized_vi");

        cc.spriteFrameCache.addSpriteFrames("res/Event/PotBreaker/PotBreakerRes/gold.plist");

        db.DBCCFactory.getInstance().loadDragonBonesData(PotBreaker.DEFAUT_FOLDER_RES + "LightBg/skeleton.xml","LightBg");
        db.DBCCFactory.getInstance().loadTextureAtlas(PotBreaker.DEFAUT_FOLDER_RES + "LightBg/texture.plist", "LightBg");

        db.DBCCFactory.getInstance().loadDragonBonesData(PotBreaker.DEFAUT_FOLDER_RES + "Daquy/skeleton.xml","Daquy");
        db.DBCCFactory.getInstance().loadTextureAtlas(PotBreaker.DEFAUT_FOLDER_RES + "Daquy/texture.plist", "Daquy");

        db.DBCCFactory.getInstance().loadDragonBonesData(PotBreaker.DEFAUT_FOLDER_RES + "Ruongqua/skeleton.xml","Ruongqua");
        db.DBCCFactory.getInstance().loadTextureAtlas(PotBreaker.DEFAUT_FOLDER_RES + "Ruongqua/texture.plist", "Ruongqua");

        db.DBCCFactory.getInstance().loadDragonBonesData(PotBreaker.DEFAUT_FOLDER_RES + "Cuoc/skeleton.xml","Cuoc");
        db.DBCCFactory.getInstance().loadTextureAtlas(PotBreaker.DEFAUT_FOLDER_RES + "Cuoc/texture.plist", "Cuoc");
        this.countEnter = 0;
        PotBreakerSound.preloadAllSound();
    },

    openEvent: function () {
        cc.log("IS FINISH DOWNLOAD " + this.isFinishDownload);
        // if (false) {
        if (this.isFinishDownload) {
            sceneMgr.clearLoading();
            if (this.eventTime == 0) return;

            var timeLeft = this.remainedTime;
            if(timeLeft <= 0 && potBreaker.checkWeek(PotBreaker.WEEK_END)) {
                this.eventTime = PotBreaker.WEEK_END + 1;
                // sceneMgr.showOKDialog(LocalizedString.to("POT_EVENT_TIMEOUT"));
            }

            if(potBreaker.isInEvent()) {
                var func = function () {
                    sceneMgr.openScene(PotBreakerScene.className);
                }
                resourceManager.openGUI(PotBreakerScene.className, func);
            }

            if(potBreaker.isEndEvent()){
                if (this.isRegisterSuccess) {
                    var scene = sceneMgr.openGUI(PotBreakerHelpGUI.className, PotBreaker.GUI_HELP, PotBreaker.GUI_HELP);
                    if (scene){
                        scene.onButtonRelease(null, PotBreakerHelpGUI.BTN_TAB_REGISTER_INFO);
                    }
                }
                else if (this.unreceivedTopGiftId > 0) {
                    var cmd = {};
                    cmd.idGift = this.unreceivedTopGiftId;
                    if (cmd.idGift > PotBreaker.ITEM_OUT_GAME) {
                        if (popUpManager.canShow(PopUpManager.RECEIVE_OUT_GIFT)) {
                            var open = sceneMgr.openGUI(PotBreakerOpenGiftGUI.className, PopUpManager.RECEIVE_OUT_GIFT, PopUpManager.RECEIVE_OUT_GIFT);
                            if (open) open.showGift(cmd);
                        }
                    }
                }
                else {
                    var cmd = new CmdSendPotBreaker();
                    GameClient.getInstance().sendPacket(cmd);
                    //NativeBridge.openWebView(potBreaker.eventLinkNews);

                    var func = function () {
                        sceneMgr.openGUI(PotBreakerRankGUI.className, PotBreaker.GUI_RANK, PotBreaker.GUI_RANK);
                    }
                    resourceManager.openGUI(PotBreakerRankGUI.className, func);
                }

            }
        }
        else {
            cc.log("VAO DAY *****888 ");
            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(5);
            var s = "Test Download Content " + "\n" + (new Error()).stack;
            NativeBridge.logJSManual("assets/src/Lobby/Event/PotBreaker/PotBreaker.js", "3333", s, NativeBridge.getVersionString());
            event.startDownloadContent();
            event.startTime = (new Date()).getTime();
            this.isFinishDownload = true;
        }
        this.countEnter++;

    },

    checkWeek: function (week) {
        return (this.eventTime == week);
    },

    getTimeLeft: function () {
        var timeNow = Math.floor(Date.now() / 1000);
        return (this.timeEventEnd - timeNow);
    },

    getTimeLeftString: function (fullTime) {
        if(fullTime === undefined) fullTime = false;

        var timeLeft = this.getTimeLeft();
        if (timeLeft <= 0) return 0;

        var day = parseInt(timeLeft / 86400);
        timeLeft -= day * 86400;
        var hour = parseInt(timeLeft / 3600);
        timeLeft -= hour * 3600;
        var minute = parseInt(timeLeft / 60);
        timeLeft -= minute * 60;

        var str = "";
        if(fullTime) {
            str = LocalizedString.to("POT_TIME_LEFT_FORMAT_FULL");
            str = StringUtility.replaceAll(str, "@day", day);
            str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
            str = StringUtility.replaceAll(str, "@minute", (minute < 10) ? "0" + minute : minute);
            str = StringUtility.replaceAll(str, "@second", (timeLeft < 10) ? "0" + timeLeft : timeLeft);
            return str;
        }
        else {
            if (day > 0) {
                str = LocalizedString.to("POT_TIME_LEFT_FORMAT_DAY");
                str = StringUtility.replaceAll(str, "@day", day);
            }
            else {
                if(hour > 0) {
                    str = LocalizedString.to("POT_TIME_LEFT_FORMAT_HOURS");
                }
                else if(minute > 0) {
                    str = LocalizedString.to("POT_TIME_LEFT_FORMAT_MINUTES");
                }
                else {
                    str = LocalizedString.to("POT_TIME_LEFT_FORMAT_SECONDS");
                }

                str = StringUtility.replaceAll(str, "@hour", (hour < 10) ? "0" + hour : hour);
                str = StringUtility.replaceAll(str, "@minute", (minute < 10) ? "0" + minute : minute);
                str = StringUtility.replaceAll(str, "@second", (timeLeft < 10) ? "0" + timeLeft : timeLeft);
            }
        }
        return str;
    },

    getTimeRemainString: function(){
        var timeRemain = this.remainedTime;
        var totalSeconds = Math.floor(timeRemain / 1000);
        var numSeconds = totalSeconds % 60;
        var totalMinutes = Math.floor(totalSeconds / 60);
        var numMinutes = totalMinutes % 60;
        var totalHour = Math.floor(totalMinutes / 60);
        var numHours = totalHour % 24;
        var totalDay = Math.floor(totalHour / 24);

        // cc.log("updateRemainTime: " , totalDay , numHours , numMinutes , numSeconds);

        var strDays = StringUtility.replaceAll(localized("POT_TIME_LEFT_FORMAT_DAY"), "@day", totalDay);
        var strHours = StringUtility.replaceAll(localized("POT_TIME_LEFT_FORMAT_HOURS"), "@hour", numHours);
        var strMinutes = StringUtility.replaceAll(localized("POT_TIME_LEFT_FORMAT_MINUTES"), "@minute", numMinutes);
        var strSeconds = StringUtility.replaceAll(localized("POT_TIME_LEFT_FORMAT_SECONDS"), "@second", numSeconds);

        var remainTimeStr = "";
        var enoughInfoTime = false;
        if (totalDay > 0){
            remainTimeStr += strDays;

            enoughInfoTime = true;
        }

        if (numHours > 0 && !enoughInfoTime){
            remainTimeStr += strHours;

            enoughInfoTime = true;
        }

        if (numMinutes > 0 && !enoughInfoTime){
            remainTimeStr += strMinutes;

            enoughInfoTime = true;
        }

        if (!enoughInfoTime && numSeconds >= 0){
            remainTimeStr += strSeconds;
        }

        if (remainTimeStr === ""){
            remainTimeStr = localized("POT_EVENT_TIMEOUT");
        }

        return remainTimeStr;
    },

    showAutoGift : function () {
        if(this.currentAutoGift < 0 || this.currentAutoGift >= this.arAutoGifts.length) return;

        var info = this.arAutoGifts[this.currentAutoGift];
        this.currentAutoGift += 1;
        var func = function () {
            var open = sceneMgr.openGUI(PotBreakerOpenGiftGUI.className, PotBreaker.GUI_OPEN_GIFT, PotBreaker.GUI_OPEN_GIFT);
            if (open) open.showGift(info,true);
        }
        resourceManager.openGUI(PotBreakerOpenGiftGUI.className, func);
    },

    showRegisterInformation: function (gIds) {
        var gui = sceneMgr.openGUI(PotBreakerRegisterInformationGUI.className, PopUpManager.RECEIVE_OUT_GIFT, PopUpManager.RECEIVE_OUT_GIFT, true);
        if (gui) gui.updateInfor(gIds);
    },

    showRegisterAfterEvent: function () {
        var gui = sceneMgr.openGUI(PotBreakerRegisterInformationGUI.className, PopUpManager.RECEIVE_OUT_GIFT, PopUpManager.RECEIVE_OUT_GIFT, true);
        if (gui) gui.updateInfoGiftAfterEvent();
    },

    breakPot: function(id, position){
        cc.log("break Pot: ", id, position);
        if (this.potBreakerScene){
            this.potBreakerScene.enableRollButton(false);
            this.potBreakerScene.isWaitingResult = true;
        }
        var notEnoughTicket = false;
        if (id === PotBreaker.ID_BREAK_ONCE){
            if (this.numberTicket < PotBreaker.ID_BREAK_ONCE){
                notEnoughTicket = true;
            }
        } else if (id === PotBreaker.ID_BREAK_MAX){
            if (this.numberTicket < PotBreaker.ROLL_MAX_NUM){
                notEnoughTicket = true;
            }
        } else {
            if (this.numberTicket < id){
                notEnoughTicket = true;
            }
        }

        if (notEnoughTicket){
            if (this.potBreakerScene){
                this.potBreakerScene.enableRollButton(true);
            }
            this.potBreakerScene.isWaitingResult = false;
            sceneMgr.openGUI(PotBreakerHammerDialog.className, PotBreaker.GUI_TICKET_DIALOG, PotBreaker.GUI_TICKET_DIALOG);
            return false;
        }

        var cmdRoll = new CmdSendPotBreakerRoll();
        cmdRoll.putData(id, position);
        GameClient.getInstance().sendPacket(cmdRoll);
        return true;

    },

    onChangeAward: function (cmd) {
        if (cmd.isTop == 0) {
            // var gui = sceneMgr.getGUI(PotBreaker.GUI_OPEN_GIFT);
            if (cmd.result == 1) {
                // if (gui && gui instanceof  PotBreakerOpenGiftGUI) {
                //     gui.onGiftSuccess();
                // }
                // var number =
                var data =  {result: cmd.result,giftsResult:[0],numGifts:[cmd.bonusGold],listBrokenPot:[],isSpecialPot:[]};
                // potBreaker.onRollResult(data);
                potBreaker.onReceiveToken(data, cmd.idGift);
            }
            else {
                sceneMgr.showOKDialog(LocalizedString.to("POT_CHANGE_AWARD_FAIL"));

                // if (gui && gui instanceof  PotBreakerOpenGiftGUI) {
                //     gui.onBack();
                // }
            }
        }
        else {
            var gui = sceneMgr.getGUIByClassName(PotBreakerRegisterInformationGUI.className);
            var gui1 = sceneMgr.getGUIByClassName(PotBreakerOpenGiftGUI.className);
            if (cmd.result == 1) {
                // sceneMgr.showOKDialog(LocalizedString.to("POT_REGISTER_SUCCESS"));
                potBreaker.isRegisterSuccess = true;
                //
                // var gui = sceneMgr.getGUI(PotBreaker.GUI_INFORMATION);
                // if (gui && gui instanceof  PotBreakerRegisterInformationGUI) {
                //     gui.onClose();
                // }

                // if (cmd.idGift > PotBreaker.ITEM_OUT_GAME) {
                //     var open = sceneMgr.openGUI(PotBreakerOpenGiftGUI.className, PotBreaker.GUI_OPEN_GIFT, PotBreaker.GUI_OPEN_GIFT);
                //     if (open) open.showGift(cmd);
                // }
                cc.log("vo day ne")
                if (gui && gui instanceof  PotBreakerRegisterInformationGUI) {
                    cc.log("WHY NOT HERE");
                    gui.onRegisterSuccess();
                }

                if (cmd.idGift > PotBreaker.ITEM_OUT_GAME) {
                    if (gui1)
                        gui1.onGiftSuccess();
                }
                this.unreceivedTopGiftId = -1;
            }
            else {
                if (gui && gui instanceof  PotBreakerRegisterInformationGUI) {
                    gui.isWaitResponse = false;
                }
                if (gui && gui instanceof PotBreakerOpenGiftGUI) {
                    gui.isWaitResponse = false;
                }
                sceneMgr.showOKDialog(LocalizedString.to("POT_REGISTER_FAIL"));
            }
        }
    },

    onAutoReceiveToken: function(data){
        var desPos = cc.p(cc.director.getWinSize().width * 0.95, cc.director.getWinSize().height / 2);
        var lobbyScene = sceneMgr.getRunningScene().getMainLayer();
        if (lobbyScene instanceof LobbyScene){
            desPos = lobbyScene._uiBean.getParent().convertToWorldSpace(lobbyScene._uiBean.getPosition());
        }

        if (lobbyScene instanceof PotBreakerScene){
            desPos = lobbyScene.infoGold.posEffect;
        }

        if (popUpManager.canShow(PopUpManager.RECEIVE_IN_GIFT)) {
            var gui = sceneMgr.openGUI(PotBreakerOpenResultGUI.className, PopUpManager.RECEIVE_IN_GIFT, PopUpManager.RECEIVE_IN_GIFT);
            if (gui) {
                gui.openGift(data.giftsResult, data.numGifts, desPos, desPos, true);
            }
        }
    },

    notifyPotBreakerAction: function(data){
        cc.log("notifyPotBreakerAction: " + JSON.stringify(data));
        if (data.bonusGold > 0){
            //     for (var i = 0; i < data.unreceivedInGiftId.length; i++){
            //         var pChange = new CmdSendPotBreakerChangeAward();
            //         pChange.putData(false, data.unreceivedInGiftId[i]);
            //         GameClient.getInstance().sendPacket(pChange);
            //     }
            var data2 =  {result:1, giftsResult:[0], numGifts:[data.bonusGold], listBrokenPot:[], isSpecialPot:[]};
            if (this.isFinishDownload)
                potBreaker.onAutoReceiveToken(data2);
        }


        if (data.unreceivedTopGiftId > 0){
            var cmd = {};
            cmd.idGift = data.unreceivedTopGiftId;
            if (cmd.idGift > PotBreaker.ITEM_OUT_GAME) {
                if (this.isFinishDownload) {
                    if (popUpManager.canShow(PopUpManager.RECEIVE_OUT_GIFT)) {
                        var open = sceneMgr.openGUI(PotBreakerOpenGiftGUI.className, PopUpManager.RECEIVE_OUT_GIFT, PopUpManager.RECEIVE_OUT_GIFT);
                        if (open) open.showGift(cmd);
                    }
                }
            }
            this.unreceivedTopGiftId = data.unreceivedTopGiftId;
        }
    },

    getItemName: function (id) {
        if (id in this.giftNames) {
            return this.giftNames[id];
        }
        return id;
    },

    getItemColor: function (id) {
        return cc.color("#F7F30D");
    },

    isItemStored: function (id) {
        return (id > PotBreaker.ITEM_STORED);
    },

    getTokenLocalId: function(id){
        return (id - PotBreaker.ITEM_STORED - 11) / 10;
    },

    getItemValue: function (id) {
        if (id in this.giftValues)
            return this.giftValues[id];
        return 1;
    },

    getPieceImage : function (id) {
        if(this.isItemStored(id))
            return "res/Event/PotBreaker/PotBreakerUI/iconToken" + id + ".png";
        return "res/Event/PotBreaker/PotBreakerUI/icon_gold.png";
    },

    getTopGiftImage: function(id){
        var outGiftId = this.getOutGiftId(id);
        return PotBreaker.DEFAUT_FOLDER_UI + "outGift"+ outGiftId + ".png";
    },

    getTopGiftImageMini: function(id){
        var outGiftId = this.getOutGiftId(id);
        return PotBreaker.DEFAUT_FOLDER_UI + "miniGift"+ outGiftId + ".png";
    },

    getOutGiftId: function(id){
        if (id > PotBreaker.ITEM_OUT_GAME){
            var convert = (id - PotBreaker.ITEM_OUT_GAME - 1);
            if (convert <= PotBreaker.NUMBER_TOP_RANK_VIP_1) {
                return 0;
            }
            else if (convert <= PotBreaker.NUMBER_TOP_RANK_VIP_2) {
                return 1;
            }
            //else if (convert <= PotBreaker.NUMBER_TOP_RANK_VIP * 2) return "02";
            else return 2;
        }

        // if (id > PotBreaker.ITEM_OUT_GAME){
        //     var convert = (id - PotBreaker.ITEM_OUT_GAME - 1);
        //     if (convert <= PotBreaker.NUMBER_TOP_RANK_VIP) {
        //         var game = LocalizedString.config("GAME");
        //         if (game.indexOf("sam") < 0 && game.indexOf("binh") < 0) {
        //             return "01";
        //         }
        //         else {
        //             return "02";
        //         }
        //     }
        //     //else if (convert <= PotBreaker.NUMBER_TOP_RANK_VIP * 2) return "02";
        //     else return 1;
        // }

        // if (Config.ENABLE_CHEAT) {
        //     if (id > PotBreaker.ITEM_OUT_GAME){
        //         var convert = (id - PotBreaker.ITEM_OUT_GAME - 1);
        //         if (convert <= 2) return "01";
        //         else if (convert <= 4) return "02";
        //         else return 1;
        //     }
        //     return 1;
        // }
        // else {
        //     if (id > PotBreaker.ITEM_OUT_GAME){
        //         var convert = (id - PotBreaker.ITEM_OUT_GAME - 1);
        //         if (convert <= 20) return "01";
        //         else if (convert <= 40) return "02";
        //         else return 1;
        //     }
        //     return 1;
        // }

    },

    getGiftIdFromRank: function (rank, week) {
        return rank + 1 + PotBreaker.ITEM_OUT_GAME;
        // if (rank <= PotBreaker.NUMBER_TOP_RANK_VIP_1) {
        //     if (week == PotBreaker.WEEK_START) {
        //         return rank + 1 + PotBreaker.ITEM_OUT_GAME;
        //     }
        //     else {
        //         return rank + 1 + PotBreaker.ITEM_OUT_GAME + PotBreaker.NUMBER_TOP_RANK_VIP;
        //     }
        // }
        // else {
        //     return rank + 1 + PotBreaker.ITEM_OUT_GAME + PotBreaker.NUMBER_TOP_RANK_VIP;
        // }

        // Event co 2 tuan voi 2 muc qua: 1->20 la id qua cho tuan 1, 20->40 la id qua cho tuan 2
        // if (rank <= PotBreaker.NUMBER_TOP_RANK_VIP) {
        //     if (week == PotBreaker.WEEK_START) {
        //         return rank + 1 + PotBreaker.ITEM_OUT_GAME;
        //     }
        //     else {
        //         return rank + 1 + PotBreaker.ITEM_OUT_GAME + PotBreaker.NUMBER_TOP_RANK_VIP;
        //     }
        // }
        // else {
        //     return rank + 1 + PotBreaker.ITEM_OUT_GAME + PotBreaker.NUMBER_TOP_RANK_VIP;
        // }

        // if (Config.ENABLE_CHEAT) {
        //     if (rank <= 2) {
        //         if (week == PotBreaker.WEEK_START)  {
        //             return rank + 1 + PotBreaker.ITEM_OUT_GAME;
        //         }
        //         else {
        //             return rank + 1 + PotBreaker.ITEM_OUT_GAME + 2;
        //         }
        //     }
        //     else {
        //         return rank + 1 + PotBreaker.ITEM_OUT_GAME + 2;
        //     }
        //
        // }
        // else {
        //     if (rank <= 20) {
        //         if (week == PotBreaker.WEEK_START)  {
        //             return rank + 1 + PotBreaker.ITEM_OUT_GAME;
        //         }
        //         else {
        //             return rank + 1 + PotBreaker.ITEM_OUT_GAME + 20;
        //         }
        //     }
        //     else {
        //         return rank + 1 + PotBreaker.ITEM_OUT_GAME + 20;
        //     }
        // }
    },

    getOfferTicketImage: function (id) {
        return "res/Lobby/Offer/bonusTicketHoe.png";
    },

    getOfferTicketString: function (id) {
        return "Cuốc";
    },

    getNumberGoldEffect: function(gold, isBreakeMax){
        var num = Math.floor(gold / 100000);
        if (isBreakeMax){
            if (num < 1) num = 2;
        } else {
            if (num < 2) num = Math.floor(Math.random() * 5) + 5;
        }

        if (gold > 10000000) num = Math.floor(gold / 1000000);

        num = (num < 10) ? num : (10 + parseInt(num / 5));
        if (num > 100)
            num = 100;
        return num;
    },

    getLixiImage : function (id) {
        if (id >= 0 && id < PotBreaker.NUMBER_TOKEN_TYPE){
            return "res/Event/PotBreaker/PotBreakerUI/token" + id + ".png";
        }
        return "res/Event/PotBreaker/PotBreakerUI/token0.png";
    },

    getCostRoll: function(){
        var numNormalPot = 0;
        for (var i = 0; i < this.mapInfo.length; i++){
            if (this.mapInfo[i] === PotBreaker.TYPE_NORMAL_POT){
                numNormalPot++;
            }
        }

        if (numNormalPot < PotBreaker.NUMBER_POT_IN_MAP){
            if (this.numberTicket === 0){
                return numNormalPot;
            }
            return (numNormalPot < this.numberTicket) ? numNormalPot : this.numberTicket;
        }

        if (this.numberTicket < PotBreaker.ROLL_MAX_NUM) {
            if (this.numberTicket === 0){
                return numNormalPot;
            }
            return (this.numberTicket < numNormalPot) ? this.numberTicket : numNormalPot;
        } else {
            return PotBreaker.ROLL_MAX_NUM;
        }
    },

    getLastNormalPotId: function(){
        if (this.getCostRoll() !== 1){
            return -128;
        }

        for (var i = 0; i < this.mapInfo.length; i++){
            if (this.mapInfo[i] === PotBreaker.TYPE_NORMAL_POT){
                return i;
            }
        }
    },

    getListNormalPotId: function(){
        var normalPots = [];
        for (var i = 0; i < this.mapInfo.length; i++){
            if (this.mapInfo[i] === PotBreaker.TYPE_NORMAL_POT){
                normalPots.push(i);
            }
        }

        return normalPots;
    },

    showNotifyEvent: function (btn) {
        this.buttonLobby = btn;

        // check show notify event
        if (this.keyCoin > 0) {
            this.notifyEvent = true;
        }
        for (var i = 0; i < this.gifts.length; i++) {
            if (this.gifts[i].gift > 0) {
                this.notifyEvent = true;
            }
        }

        if (this.isInEvent()) {
            this.showEventButton();
            if (this.isFinishDownload && this.checkNewDay()) {
                var gui = sceneMgr.getGUI(PotBreaker.GUI_GIFT_RESULT);
                if (gui){
                    return;
                }
                gui = sceneMgr.getGUI(PotBreaker.GUI_FREE_TICKET);
                if (gui){
                    return;
                }

                if (popUpManager.canShow(PopUpManager.NOTIFY_IN_GAME)) {
                    sceneMgr.openGUI(PotBreakerEventNotifyGUI.className, PopUpManager.NOTIFY_IN_GAME, PopUpManager.NOTIFY_IN_GAME, false);
                }

            }
        }
        else if(this.isEndEvent()) {
            this.showEventButton();
        }
        else {
            if (btn) {
                btn.setVisible(false);
            }
        }
    },

    showEventButton: function () {
        //return;
        if (this.isFinishDownload) {
            if (this.isInEvent()){
                this.addTooltipMini();
            } else {
                this.removeTooltipMini();
            }
        }

        if (this.buttonLobby === undefined || this.buttonLobby == null) return;

        if (this.isInEvent() || this.isEndEvent()) {
            this.buttonLobby.setVisible(true);
            this.buttonLobby.setScale(1);
            this.effectEventButton();
        }
        else {
            this.buttonLobby.setVisible(false);
        }

    },

    effectEventButton: function () {
        cc.log("effectEventButton 0 *******");
        if (!this.buttonLobby) return;
        cc.log("effectEventButton 1 *******");
        this.buttonLobby.setVisible(true);
        this.buttonLobby.notify.setVisible(this.notifyEvent);
        this.buttonLobby.button.setTitleText("");
        this.buttonLobby.button.setColor(cc.color.WHITE);
        this.buttonLobby.time.setFontSize(13);
        this.buttonLobby.time.setFontName("fonts/tahomabd.ttf");
        this.buttonLobby.time.setColor(cc.color(239, 217, 108, 255));
        this.buttonLobby.time.ignoreContentAdaptWithSize(true);
        this.buttonLobby.button.stopAllActions();

        var btnAnim = resourceManager.loadDragonbone("Icon_daovang");
        if (btnAnim) {
            this.buttonLobby.button.setOpacity(0);
            if (!this.buttonLobby.anim.eff) {
                this.buttonLobby.anim.addChild(btnAnim);
                this.buttonLobby.anim.eff = btnAnim;
            }
            this.buttonLobby.anim.setScale(0.7);
            btnAnim.setPosition(0, 0);
            btnAnim.getAnimation().gotoAndPlay("1", -1, -1, 0);
        } else {
            this.buttonLobby.button.setOpacity(255);
        }
        if (this.isFinishDownload) {
            if (this.getTimeLeft() > 0) {
                this.buttonLobby.time.setString(this.getTimeLeftString());
            } else {
                this.buttonLobby.time.setString(LocalizedString.to("POT_EVENT_TIMEOUT_SHORT"));
            }
        }
        else {
            this.buttonLobby.time.setString(LocalizedString.to("LOADING_EVENT"));
        }
    },

    isInEvent: function () {
        return this.eventTime >= PotBreaker.WEEK_START && this.eventTime < PotBreaker.WEEK_END;
    },

    isEndEvent : function () {
        return this.eventTime >= PotBreaker.WEEK_END;
    },

    getTicketTexture: function(){
        return "res/Event/PotBreaker/PotBreakerUI/iconTicket.png";
    },

    getPosFromPlayer: function(uId){
        var scene = sceneMgr.getRunningScene().getMainLayer();
        if (sceneMgr.checkInBoard()){
            return scene.getPosFromPlayer(uId);
        }

        return cc.p(0, 0);
    },

    // utils
    checkNewDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("potBreaker_current_day_" + gamedata.userData.uID);

        return sDay !== cDay;
    },

    saveCurrentDay: function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("potBreaker_current_day_" + gamedata.userData.uID, sDay);
    },

    addTooltipMini: function(){
        return;
        var scene = sceneMgr.getRunningScene().getMainLayer();
        if (!(scene instanceof LobbyScene)){
            return;
        }
        var btnShopGold = scene.btnGold;
        if (!btnShopGold){
            return;
        }
        this.btnShopGold = btnShopGold;
        if (!this.btnShopGold.tooltip){
            var jsonLayout = ccs.load("res/Event/PotBreaker/PotBreakerTooltipMini.json");
            ccui.Helper.doLayout(jsonLayout.node);
            this.btnShopGold.tooltip = jsonLayout.node;
            this.btnShopGold.addChild(this.btnShopGold.tooltip);
            var btnSize = this.btnShopGold.getContentSize();
            this.btnShopGold.tooltip.setPosition(btnSize.width/2, btnSize.height * 3/4);
            this.btnShopGold.tooltip.imgTicket = this.btnShopGold.tooltip.getChildByName("ticket");
            this.btnShopGold.tooltip.txtBonus = this.btnShopGold.tooltip.getChildByName("txtBonus");
        }

        if (this.btnShopGold.tooltip){
            this.btnShopGold.tooltip.stopAllActions();
            this.btnShopGold.tooltip.setScale(0);
            var timeScale1 = 0.5;
            var actionScale1 = new cc.EaseBackOut(cc.scaleTo(timeScale1, 1));
            var timeScale2 = 0.2;
            var actionScale2 = cc.scaleTo(timeScale2, 1.1);
            var actionScale2_1 = cc.scaleTo(timeScale2, 1);
            var actions = [];
            actions.push(actionScale1);
            actions.push(actionScale2);
            actions.push(actionScale2_1);
            actions.push(cc.delayTime(2));
            var actionScale3 = new cc.EaseExponentialOut(cc.scaleTo(timeScale1, 0));
            actions.push(actionScale3);
            this.btnShopGold.tooltip.runAction(cc.sequence(actions).repeatForever());

            var maxBonusArr = gamedata.gameConfig.getMaxShopBonus();
            this.bonusGold = (maxBonusArr.length > 0) ? maxBonusArr[maxBonusArr.length - 1] : 0;
            this.btnShopGold.tooltip.txtBonus.setVisible(this.bonusGold > 0);
            this.btnShopGold.tooltip.imgTicket.setVisible(this.bonusGold === 0);
            if (this.bonusGold > 0){
                var strBonus = localized("POT_GOLD_PRIZE");
                strBonus = StringUtility.replaceAll(strBonus, "@prize", this.bonusGold + "%");
                this.btnShopGold.tooltip.txtBonus.setString(strBonus);
            }
        }
    },

    removeTooltipMini: function(){
        if (this.btnShopGold && this.btnShopGold.tooltip){
            try {
                this.btnShopGold.tooltip.removeFromParent(true);
                this.btnShopGold.tooltip = null;
            }
            catch (e) {
                cc.log(" ERROR *** ");
            }
        }
    },

    onEvent: function (cmd) {
        this.remainedTime = cmd.timeLeft;
        this.eventTime = cmd.eventTime;

        if (potBreaker.isEndEvent() && cmd.timeLeft <= 0){
            if (sceneMgr.getRunningScene() instanceof PotBreakerScene){
                sceneMgr.showOkDialogWithAction(LocalizedString.to("POT_EVENT_TIMEOUT"), this, function (btnID) {
                    sceneMgr.openScene(LobbyScene.className);
                });
            }
        }

        this.giftIds = cmd.giftIds;
        for (var i = 0; i < cmd.giftIds.length; i++) {
            this.giftNames[cmd.giftIds[i] + ""] = cmd.giftNames[i];
            this.giftValues[cmd.giftIds[i] + ""] = cmd.giftValues[i];
            //this.giftItemImages[cmd.giftIds[i] + ""] = this.getItemImage(cmd.giftIds[i]);
        }

        this.timeEventEnd = Math.floor((Date.now() + cmd.timeLeft) / 1000);

        this.costRoll = cmd.costs;
        this.bonusCostRoll = cmd.bonus;

        this.isRegisterSuccess = cmd.isRegisterSuccess;
        cc.log("REGISTER ***** + " + this.isRegisterSuccess);
        this.eventWeeks = cmd.eventWeeks;
        this.eventDayFrom = cmd.eventDayFrom;
        this.eventDayTo = cmd.eventDayTo;
        this.eventLinkNews = cmd.urlNews;

        this.showEventButton();

        var maxWeek = (potBreaker.eventTime < PotBreaker.WEEK_END) ? potBreaker.eventTime : PotBreaker.WEEK_END;
        for (i = PotBreaker.WEEK_START; i <= maxWeek; i++){
            var cmd3 = new CmdSendPotBreakerGetInfoTop();
            cmd3.putData(i);
            GameClient.getInstance().sendPacket(cmd3);
        }

        var gui = sceneMgr.getMainLayer();
        if (gui && gui instanceof PotBreakerScene) {
            gui.updateEventInfo();
        }

        var cmdNumberTicket = new CmdSendPotBreakerGetNumberTicket();
        GameClient.getInstance().sendPacket(cmdNumberTicket);

        if (this.isInEvent()) {
            var cmd = new CmdSendPotBreakerOpen();
            cmd.putData(0);
            GameClient.getInstance().sendPacket(cmd);
        }

        if (sceneMgr.checkInBoard() && this.isInEvent()){
            this.addAccumulateGUI();
        }
    },

    updateEventInfo: function (cmd) {
        sceneMgr.clearLoading();

        this.numberTicket = cmd.numberTicket;
        var tokenInfos = [];
        for (var i = 0; i < cmd.numberToken.length; i++){
            var tokenInf = {};
            tokenInf.ids = cmd.ids[i];
            tokenInf.numberToken = cmd.numberToken[i];
            tokenInf.numberTokenNeedToClaim = cmd.numberTokenNeedToClaim[i];
            tokenInfos.push(tokenInf);
        }

        this.tokenInfos = tokenInfos;
        this.mapInfo = cmd.mapInfo;
        this.unreceivedInGiftId = cmd.unreceivedInGiftId;
        this.unreceivedTopGiftId = cmd.unreceivedTopGiftId;
        this.numGoldPot = cmd.numGoldPot;
        this.curLevelExp = cmd.currentLevelExp;
        this.nextLevelExp = cmd.nextLevelExp;
        this.curLevel = cmd.curLevel;

        // update potBreaker scene
        if (this.potBreakerScene) {
            this.potBreakerScene.updateEventInfo();
        }
    },

    saveNumberTicket: function(cmd){
        this.numberTicket = cmd.numberTickets;
    },

    addAccumulateGUI: function(){
        if (!this.isFinishDownload)
            return;
        var gui = sceneMgr.getGUI(PotBreaker.GUI_ACCUMULATE);
        if (!gui){
            gui = sceneMgr.openGUI(PotBreakerAccumulateGUI.className, PotBreaker.GUI_ACCUMULATE, PotBreaker.GUI_ACCUMULATE, false);
            gui.setVisible(true);
        }
    },

    removeAccumulateGUI: function(){
        if (!this.isFinishDownload)
            return;
        cc.log("REMOVE ACCUMULATE **************** ");
        var gui = sceneMgr.getGUI(PotBreaker.GUI_ACCUMULATE);
        if (gui){
            gui.setVisible(false);
            gui.removeFromParent(true);
        }
    },

    onAccumulate: function (cmd) {
        if (!this.isFinishDownload) {
            return;
        }
        if (!this.isInEvent()) return;
        if (sceneMgr.checkInBoard()) {
            var gui = sceneMgr.openGUI(PotBreakerAccumulateGUI.className, PotBreaker.GUI_ACCUMULATE, PotBreaker.GUI_ACCUMULATE, false);
            if (gui) {
                gui.showAccumulate(cmd);
            }
        }
    },

    onRollResult: function (cmd) {
        if (this.potBreakerScene) {
            this.potBreakerScene.onRollResult(cmd);
        }
    },

    onReceiveToken: function(data, idGift){
        if (this.potBreakerScene) {
            this.potBreakerScene.onReceiveToken(data, idGift);
        }
    },

    saveRegisterInfo: function(cmd){
        var registerInfo = {};
        registerInfo.fullName = cmd.fullName;
        registerInfo.phone = cmd.phone;
        registerInfo.identity = cmd.identity;
        registerInfo.address = cmd.address;
        registerInfo.email = cmd.email;
        registerInfo.registerGiftIds = cmd.registerGiftIds;

        this.isRegisterSuccess = registerInfo.registerGiftIds.length > 0;
        // this.isRegisterSuccess = true;
        cc.log("REGISTER ***** 434 + " + this.isRegisterSuccess);
        this.registerInfo = registerInfo;

        var scene = sceneMgr.getGUI(PotBreaker.GUI_HELP);
        if (scene){
            scene.updateRegisterInfo();
        }
    },

    saveTopInfo: function(cmd){
        var indexThisWeekInfo = -1;
        for (var i = 0; i < this.historyTopRank.length; i++){
            if (this.historyTopRank[i].week === cmd.week){
                indexThisWeekInfo = i;
                break;
            }
        }

        var weekInfo = {};
        weekInfo.week = cmd.week;
        weekInfo.topRanks = cmd.topRanks;
        weekInfo.topUserIds = cmd.topUserIds;
        weekInfo.topNames = cmd.topNames;
        weekInfo.topAvatars = cmd.topAvatars;
        weekInfo.topTokens = cmd.topTokens;
        weekInfo.topAward = cmd.topAward;

        // khong tim thay trong list lich su da luu, them moi
        if (indexThisWeekInfo < 0){
            this.historyTopRank.push(weekInfo);
        } else {
            this.historyTopRank[indexThisWeekInfo] = weekInfo;
        }

        //if (cmd.week === this.eventTime){
        this.remainedTime = cmd.remainedTime;
        var scene = sceneMgr.getRunningScene().getMainLayer();
        if (scene instanceof LobbyScene){
        }

        var gui = sceneMgr.getGUI(PotBreaker.GUI_RANK);
        if (gui){
            gui.updateListTop(weekInfo.week);
        }
        //}
    },

    saveMyRankInfo: function(cmd){
        if (cmd.week === this.eventTime){
            this.myCurRank = cmd.myRank;
            this.curTotalNumberToken = cmd.totalNumberToken;
            if (this.curTotalNumberToken.length === 0){
                this.curTotalNumberToken = [0, 0, 0, 0];
            }
        }

        var indexThisWeekInfo = -1;
        for (var i = 0; i < this.historyMyRank.length; i++){
            if (this.historyMyRank[i] && this.historyMyRank[i].week == cmd.week){
                indexThisWeekInfo = i;
                break;
            }
        }

        // khong tim thay trong list lich su da luu, them moi
        var myRankInfo = {};
        myRankInfo.week = cmd.week;
        myRankInfo.myRank = cmd.myRank;
        myRankInfo.totalNumberToken = cmd.totalNumberToken;
        if (myRankInfo.length === 0){
            myRankInfo = [0, 0, 0, 0];
        }

        if (indexThisWeekInfo < 0){
            this.historyMyRank.push(myRankInfo);
        } else {
            this.historyMyRank[indexThisWeekInfo] = myRankInfo;
        }

        // update potBreaker scene
        if (this.potBreakerScene) {
            this.potBreakerScene.updateMyRankInfo();
        }

        var gui = sceneMgr.getGUI(PotBreaker.GUI_RANK);
        if (gui){
            gui.updateMyRank(myRankInfo.week);
        }

        var gui2 = sceneMgr.getGUIByClassName(PotBreakerOpenGiftGUI.className);
        if (gui2){
            gui2.updateMyRank();
        }
    },

    getExpString: function () {
        return StringUtility.pointNumber(this.curLevelExp) + "/" + StringUtility.pointNumber(this.nextLevelExp);
    },

    getExpPercent: function () {
        if (this.nextLevelExp <= 0) this.nextLevelExp = 1;
        return parseFloat(this.curLevelExp * 100 / this.nextLevelExp);
    },

    getTopRankData: function(week){
        var data = null;
        for (var j = 0; j < this.historyTopRank.length; j++){
            if (this.historyTopRank[j].week === week){
                data = this.historyTopRank[j];
                break;
            }
        }

        return data;
    },

    getMyRankData: function(week){
        var data = null;
        for (var j = 0; j < this.historyMyRank.length; j++){
            if (this.historyMyRank[j].week === week){
                data = this.historyMyRank[j];
                break;
            }
        }

        return data;
    },

    checkNotifyBonusGPanel: function () {
        // cc.log("checkNotifyBonusGPanel");
        var d = new Date();
        var curTime = d.getTime();
        var lastTime = PotBreaker.LAST_TIME_SHOW_BONUS_GOLD;

        if (isNaN(lastTime)) lastTime = 0;

        return curTime - lastTime > PotBreaker.NOTIFY_BONUS_G_COUNT_DOWN;
    },

    saveNotifyBonusGPanel: function () {
        PotBreaker.LAST_TIME_SHOW_BONUS_GOLD = new Date().getTime();
    },

    // LISTENER
    onReceive: function (cmd, data) {
        switch (cmd) {
            case PotBreaker.CMD_EVENT_NOTIFY:
            {
                var rEventNotify = new CmdReceivePotBreakerNotify(data);
                rEventNotify.clean();

                cc.log("CMD_EVENT_NOTIFY: " + JSON.stringify(rEventNotify));


                potBreaker.onEvent(rEventNotify);
                break;
            }
            case PotBreaker.CMD_NOTIFY_ACTION:
            {
                var rActionNotify = new CmdReceivePotBreakerActionNotify(data);
                rActionNotify.clean();

                cc.log("CMD_NOTIFY_ACTION: " + JSON.stringify(rActionNotify));

                potBreaker.notifyPotBreakerAction(rActionNotify);
                break;
            }
            case PotBreaker.CMD_OPEN_EVENT:
            {
                var rEventInfo = new CmdReceivePotBreakerInfo(data);
                rEventInfo.clean();

                cc.log("CMD_OPEN_EVENT: " + JSON.stringify(rEventInfo));

                potBreaker.updateEventInfo(rEventInfo);
                break;
            }
            case PotBreaker.CMD_ROLL_EVENT:
            {
                var rRollEvent = new CmdReceivePotBreakerRoll(data);
                rRollEvent.clean();

                cc.log("CMD_ROLL_EVENT: " + JSON.stringify(rRollEvent));

                potBreaker.onRollResult(rRollEvent);
                break;
            }
            case PotBreaker.CMD_CHANGE_AWARD:
            {
                var rAward = new CmdReceivePotBreakerChangeAward(data);
                rAward.clean();

                cc.log("CMD_CHANGE_AWARD: " + JSON.stringify(rAward));

                potBreaker.onChangeAward(rAward);
                break;
            }
            case PotBreaker.CMD_ACCUMULATE_INFO:
            {
                var rAccInfo = new CmdReceivePotBreakerAccumulateInfo(data);
                rAccInfo.clean();
                cc.log("CMD_ACCUMULATE_INFO: " + JSON.stringify(rAccInfo));
                potBreaker.onAccumulate(rAccInfo);
                break;
            }
            case PotBreaker.CMD_CHEAT_G_SERVER:
            {
                var rGServer = new CmdReceivePotBreakerGServer(data);
                rGServer.clean();

                cc.log("CMD_CHEAT_G_SERVER : " + JSON.stringify(rGServer));

                if (this.potBreakerScene) {
                    this.potBreakerScene.updateGSystem(rGServer);
                }
                break;
            }
            case PotBreaker.CMD_EVENT_SHOP_BONUS:
            {
                var rEventShop = new CmdReceivePotBreakerShopBonus(data);
                rEventShop.clean();

                cc.log("CMD_EVENT_SHOP_BONUS : " + JSON.stringify(rEventShop));

                event.onEventShopBonusNew(rEventShop, Event.POT_BREAKER);
                this.sendCheckNewDay = false;
                this.saveDay = -1;
                break;
            }
            case PotBreaker.CMD_TOP_INFO:
            {
                var rTopInfo = new CmdReceivePotBreakerTopInfo(data);
                rTopInfo.clean();

                cc.log("PotBreaker.CMD_TOP_INFO : " + JSON.stringify(rTopInfo));
                potBreaker.saveTopInfo(rTopInfo);
                break;
            }
            case PotBreaker.CMD_MY_RANK:
            {
                var rMyRank = new CmdReceivePotBreakerMyRankInfo(data);
                rMyRank.clean();

                cc.log("PotBreaker.CMD_MY_RANK : " + JSON.stringify(rMyRank));
                potBreaker.saveMyRankInfo(rMyRank);
                break;
            }
            case PotBreaker.CMD_GET_REGISTER_INFO:{
                var pRegisterInfo = new CmdReceivePotBreakerRegisterInfo(data);
                pRegisterInfo.clean();
                cc.log("PotBreaker.CMD_GET_REGISTER_INFO : " + JSON.stringify(pRegisterInfo));
                potBreaker.saveRegisterInfo(pRegisterInfo);
                break;
            }
            case PotBreaker.CMD_GAME_TICKET_INFO:{
                var pGameTicketInfo = new CmdReceivePotBreakerTicketInfo(data);
                pGameTicketInfo.clean();
                cc.log("PotBreaker.CMD_GAME_TICKET_INFO : " + JSON.stringify(pGameTicketInfo));
                potBreaker.updateInfoTicketIngame(pGameTicketInfo);
                break;
            }
            case PotBreaker.CMD_GET_NUMBER_TICKET:{
                var pNumberTicket = new CmdReceivePotBreakerNumberTicket(data);
                pNumberTicket.clean();
                cc.log("PotBreaker.CMD_GET_NUMBER_TICKET : " + JSON.stringify(pNumberTicket));
                potBreaker.saveNumberTicket(pNumberTicket);
                break;
            }


            // }
        }
    },

    checkFreeTicket: function () {
        cc.log("POT BREAKER UPDATE MONEY ");
        if (GameData.getInstance().userData.bean < 100000) {
            var cmd = new CmdSendPotBreakerGetFreeTicket();
            GameClient.getInstance().sendPacket(cmd);
            cmd.clean();
            cc.log("SEND GET FREE TICKET ");
        }
    },

    sendEventPotBreaker: function () {
        var pk = new CmdSendPotBreaker();
        GameClient.getInstance().sendPacket(pk);

    },

    resetEventButton: function () {
        cc.log("RESET EVENT BUTTON *****  ");
        this.buttonLobby = null;
    },

    requestShopEventConfig: function () {
        setTimeout(function () {
            var cmd = new CmdSendPotBreaker();
            GameClient.getInstance().sendPacket(cmd);

            cmd = new CmdSendRequestEventShop();
            GameClient.getInstance().sendPacket(cmd);
        }, 1000);
    },

    checkSendNewDay: function () {
        var timeLeft = this.getTimeLeft();
        if (this.sendCheckNewDay == false && this.saveDay >= 0 && timeLeft <= 0) {
            this.requestShopEventConfig();
            this.sendCheckNewDay = true;
            this.saveDay = -1;
        }
        if (timeLeft <= 0) return 0;
        var day = parseInt(timeLeft / 86400);
        if (this.sendCheckNewDay == false && this.saveDay >= 0 && this.saveDay != day) {
            this.requestShopEventConfig();
            this.sendCheckNewDay = true;
            this.saveDay = -1;
        }
        this.saveDay = day;
    },

    // Event Loop
    updateEventLoop: function (dt) {
        if (this.eventTime <= 0)
            return;

        this.checkSendNewDay();
        if (this.isEndEvent()){
            if (this.isFinishDownload) {
                if (this.buttonLobby.time)
                    this.buttonLobby.time.setString(localized("POT_EVENT_TIMEOUT_SHORT"));
            }
            else {
                this.buttonLobby.time.setString(LocalizedString.to("LOADING_EVENT"));
            }
            return;
        }
        if (this.remainedTime > 0){
            this.remainedTime -= dt * 1000;
        } else {
            this.remainedTime = 0;
        }

        if (this.remainedTime <= 0) {
            if (this.isFinishDownload) {
                if (this.buttonLobby && this.buttonLobby.time)
                    this.buttonLobby.time.setString(localized("POT_EVENT_TIMEOUT_SHORT"));
            }
            else {
                this.buttonLobby.time.setString(LocalizedString.to("LOADING_EVENT"));
            }
            this.eventTime ++;
            if (this.btnShopGold && this.btnShopGold.tooltip) {
                this.btnShopGold.tooltip.setVisible(false);
            }
            return;
        }

        if (!this.isInEvent()){
            if (this.btnShopGold && this.btnShopGold.tooltip) {
                this.btnShopGold.tooltip.setVisible(false);
            }
            return;
        }
        var remainTimeStr = this.getTimeRemainString();
        var strTitleTime = (this.checkWeek(PotBreaker.WEEK_END)) ? localized("POT_EVENT_TITLE_TIME_EVENT") : localized("POT_TITLE_WEEK_REMAIN");
        strTitleTime = StringUtility.replaceAll(strTitleTime, "@week", this.eventTime);

        if (this.isEndEvent()) strTitleTime = "";
        var timeStr = strTitleTime + " " + remainTimeStr;
        timeStr = remainTimeStr;
        if (this.isFinishDownload) {
            if (this.buttonLobby && this.buttonLobby.time)
                this.buttonLobby.time.setString(timeStr);
        }
        else {
            this.buttonLobby.time.setString(LocalizedString.to("LOADING_EVENT"));
        }
    }
});

var PotBreakerSound = function () {
};

PotBreakerSound.playLobby = function () {
    if (gamedata.sound) {
        audioEngine.stopAllEffects();
        audioEngine.stopMusic();
        audioEngine.playMusic(rPotSound.bg, true);
    }
};

PotBreakerSound.closeLobby = function () {
    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
    audioEngine.end();
};

PotBreakerSound.playGift = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rPotSound.gift, false);
    }
};

PotBreakerSound.playFinishBreak = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rPotSound.end_break, false);
    }
};

PotBreakerSound.playCoin = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rPotSound.coin, false);
    }
};

PotBreakerSound.playPiece = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rPotSound.pieces, false);
    }
};

PotBreakerSound.doBreak = function () {
    if (gamedata.sound) {
        audioEngine.playEffect(rPotSound.break, false);
    }
};

PotBreakerSound.playSingleCoin = function () {
    if (gamedata.sound) {
        var rnd = parseInt(Math.random()*10) % 3 + 1;
        audioEngine.playEffect(rPotSound["coin_" + rnd], false);
    }
};

PotBreakerSound.preloadAllSound = function(){
    if (cc.sys.isNative) {
        for (var s in rPotSound) {
            audioEngine.preloadEffect(rPotSound[s]);
        }
    }

    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
};

rPotSound = {
    bg : "res/Event/PotBreaker/PotBreakerRes/bgm.mp3",
    break : "res/Event/PotBreaker/PotBreakerRes/dapnieu_don.mp3",
    gift : "res/Event/PotBreaker/PotBreakerRes/molixi.mp3",
    end_break : "res/Event/PotBreaker/PotBreakerRes/finish_dapnieu.mp3",
    coin : "res/Event/PotBreaker/PotBreakerRes/coinFall.mp3",
    coin_1 : "res/Event/PotBreaker/PotBreakerRes/coin_01.mp3",
    coin_2 : "res/Event/PotBreaker/PotBreakerRes/coin_02.mp3",
    coin_3 : "res/Event/PotBreaker/PotBreakerRes/coin_03.mp3",
    pieces : "res/Event/PotBreaker/PotBreakerRes/tulinh.mp3",
};

PotBreaker._instance = null;
PotBreaker.getInstance = function () {
    if (!PotBreaker._instance) {
        PotBreaker._instance = new PotBreaker();
    }
    return PotBreaker._instance;
};
var potBreaker = PotBreaker.getInstance();

PotBreaker.CMD_EVENT_NOTIFY = 15301;
PotBreaker.CMD_NOTIFY_ACTION = 15302;
PotBreaker.CMD_OPEN_EVENT = 15303;
PotBreaker.CMD_ACCUMULATE_INFO = 15309;
PotBreaker.CMD_ROLL_EVENT = 15305;
PotBreaker.CMD_CHANGE_AWARD = 15306;
PotBreaker.CMD_TOP_INFO = 15307;
PotBreaker.CMD_MY_RANK = 15308;
PotBreaker.CMD_EVENT_SHOP_BONUS = 15310;
PotBreaker.CMD_GAME_TICKET_INFO = 15311;
PotBreaker.CMD_CHEAT_ITEM = 15312;
PotBreaker.CMD_CHEAT_TICKET = 15313;
PotBreaker.CMD_CHEAT_RESET_EVENT = 15314;
PotBreaker.CMD_GET_REGISTER_INFO = 15315;
PotBreaker.CMD_GET_NUMBER_TICKET = 15317;
PotBreaker.CMD_GET_FREE_TICKET = 15318;


PotBreaker.GUI_ACCUMULATE = 50;
PotBreaker.GUI_GIFT_RESULT = 220;
PotBreaker.GUI_OPEN_GIFT = 202;
PotBreaker.GUI_HELP = 203;
PotBreaker.GUI_COLLECTION = 204;
PotBreaker.GUI_NOTIFY = 204;
PotBreaker.GUI_INFORMATION = 205;
PotBreaker.GUI_TICKET_DIALOG = 206;
PotBreaker.GUI_RANK = 208;
PotBreaker.GUI_FREE_TICKET = 201;

PotBreaker.GUI_HELP = 203;

PotBreaker.ITEM_STORED = 999;
PotBreaker.ITEM_OUT_GAME = 9999;
PotBreaker.ITEM_IN_GAME = 10010;

PotBreaker.WEEK_START = 1;
PotBreaker.WEEK_END = 2;

PotBreaker.NUMBER_TOP_RANK = 100;
PotBreaker.NUMBER_TOP_RANK_VIP = 10;
PotBreaker.NUMBER_TOP_RANK_VIP_1 = 3;
PotBreaker.NUMBER_TOP_RANK_VIP_2 = 10;

PotBreaker.NUMBER_TOKEN_NEED_TO_CLAIM = 4;
PotBreaker.NUMBER_TOKEN_TYPE = 4;
PotBreaker.ROLL_MAX_NUM = 90;
PotBreaker.NUMBER_POT_IN_MAP = 9;

PotBreaker.ID_BREAK_ONCE = 1;
PotBreaker.ID_BREAK_MAX = 10;

PotBreaker.DEFAUT_FOLDER_RES = "res/Event/PotBreaker/PotBreakerRes/";
PotBreaker.DEFAUT_FOLDER_UI = "res/Event/PotBreaker/PotBreakerUI/";

PotBreaker.KEY_SAVE_INFO = "PotBreaker_SAVE_INFO";
PotBreaker.SPLIT_SYMBOL = "!@#$%^";

PotBreaker.TYPE_NORMAL_POT = 1;
PotBreaker.TYPE_BROKEN_POT = 0;
PotBreaker.TYPE_GOLD_BROKEN_POT = 2;

PotBreaker.NOTIFY_BONUS_G_COUNT_DOWN = 600000;
PotBreaker.LAST_TIME_SHOW_BONUS_GOLD = 0;
