/*
 * All Receive User Action
 * Created by Hunter on 5/25/2016.
 */

var GameClientListener = cc.Class.extend({

    ctor: function () {
        this._listenerID = 0;

        this.social = new SocialNetworkListener();
        this.football = new FootballHandler();
        this.inGame = new BoardListener();
    },

    onFinishConnect: function (isSuccess) {
        if (!GameClient.checkAvailableListener(this._listenerID)) {
            cc.log("_________onFinishConnect in other client #############");
            return;
        }

        cc.log("_________onFinishConnect:" + isSuccess);
        if (isSuccess) {
            GameClient.getInstance().sendPacket(new CmdSendHandshake());
            GameClient.getInstance().connectState = ConnectState.CONNECTING;
            GameClient.connectCount = 0;
            GameClient.retryCount = 0;

            gamedata.updateNetworkOperator();
            fr.crashLytics.logGameClient("onFinishConnect");
        } else {
            GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
            GameClient.connectFailedHandle();
        }
        Config.ENABLE_NEW_OFFER = Config.ENABLE_NEW_OFFER;// && !Config.ENABLE_CHEAT;
    },

    onDisconnected: function () {
        if (!GameClient.checkAvailableListener(this._listenerID)) {
            cc.log("_______onDisconnected in other client ##############");
            return;
        }

        cc.log("_______onDisconnected________");
        GameClient.getInstance().connectServer = false;
        if (GameClient.getInstance().connectState == ConnectState.CONNECTED) {
            GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
            engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
            engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");
            sceneMgr.clearLoading();
            GameClient.destroyInstance();
            if (sceneMgr.getMainLayer() instanceof LoginScene)
                return;
            GameClient.disconnectHandle();
            fr.crashLytics.logGameClient("onDisconnected-connected");
            NewRankData.disconnectServer();
        } else if (GameClient.getInstance().connectState == ConnectState.CONNECTING) {
            GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
            engine.HandlerManager.getInstance().forceRemoveHandler("login");
            sceneMgr.clearLoading();
            GameClient.destroyInstance();
            if (sceneMgr.getMainLayer() instanceof LoginScene)
                return;
            GameClient.connectFailedHandle();
            fr.crashLytics.logGameClient("onDisconnected-connecting");
            NewRankData.disconnectServer();
        }

        GameClient.connectLai = !!CheckLogic.checkInBoard();
    },

    onReceived: function (cmd, pk) {
        if (!GameClient.checkAvailableListener(this._listenerID)) {
            cc.log(" ON RECEIVED PACKET in other client ##############");
            return;
        }

        var packet = new engine.InPacket();
        packet.init(pk);

        var pkg = pk;
        var p = pk;

        var controllerID = packet.getControllerId();
        if (!cc.sys.isNative) {
            cmd = packet._cmdId;
        }

        if (cmd != 50 && cmd != 20001 && cmd != 25004)
            cc.log(" ON RECEIVED PACKET   CMD: " + cmd + "  CONTROLLER ID: " + controllerID + " ERRO.R:  " + packet.getError());

        if (controllerID == 0) {
            switch (cmd) {
                case CMD.HAND_SHAKE: {
                    var loginpk = new CmdSendLogin();
                    if (Config.ENABLE_CHEAT && Config.ENABLE_DEV)
                        loginpk.putData(GameData.getInstance().sessionkey);
                    else
                        loginpk.putData("+++" + GameData.getInstance().sessionkey);
                    GameClient.getInstance().sendPacket(loginpk);
                    loginpk.clean();

                    break;
                }
                case CMD.CMD_PINGPONG: {
                    GameClient.getInstance().receivePingPong();
                    break;
                }
                case CMD.CMD_ANOTHER_COM: {
                    if (packet.getError() == 3) {
                        sceneMgr.clearLoading();

                        GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
                        engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
                        engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");

                        GameClient.getInstance().disconnect();
                        GameClient.destroyInstance();

                        sceneMgr.showOkCancelDialog(LocalizedString.to("DISCONNECT_LOGIN"), null, function (btnID) {
                            var checkPortal = false;
                            if (btnID == 0) {
                            } else {
                                cc.sys.localStorage.setItem("autologin", -1);
                                cc.sys.localStorage.setItem("session", "");
                                checkPortal = true;
                            }

                            gamedata.backToLoginScene(checkPortal);
                        });

                        NewRankData.disconnectServer();
                    }
                    break;
                }
            }
            packet.clean();
            return;
        }

        switch (cmd) {
            case CMD.CMD_LOGIN: {
                if (packet.getError() == 0) {
                    cc.log("_________________________________LOGIN SUCCESSFUL___________________________________");

                    GameClient.getInstance().startPingPong();
                    GameClient.getInstance().connectState = ConnectState.CONNECTED;

                    var request = new CmdSendGameInfo();
                    request.putData(NativeBridge.getDeviceModel(), NativeBridge.getOsVersion(),
                        NativeBridge.getPlatform(), NativeBridge.getDeviceID(), gamedata.appVersion, "aa", "aa",
                        Constant.APP_FOOTBALL, gamedata.detectVersionUpdate(), gamedata.getInstallDate(),
                        gamedata.gameConfig.configVersion, !GameClient.isWaitingReconnect);
                    GameClient.getInstance().sendPacket(request);
                    request.clean();

                    NewRankData.connectToServerRank();
                    broadcastMgr.onStart();
                    chatMgr.resetData();
                    StorageManager.getInstance().resetData();
                    DailyPurchaseManager.getInstance().resetData();
                    LuckyBonusManager.getInstance().resetData();
                    offerManager.resetData();
                    // gui log check install app zalopay
                    try {
                        if (fr.platformWrapper.isAndroid()) {
                            var packageName = Config.URL_ZALOPAY;
                            var isInstalled = fr.platformWrapper.checkInstallApp(packageName);
                            if (Config.ENABLE_CHEAT) {
                                packageName = Config.URL_ZALOPAY_SANBOX;
                                isInstalled += fr.platformWrapper.isInstalledApp(packageName);
                            }
                            var logClient = new CmdSendClientInfo();
                            if (isInstalled == 0) {
                                logClient.putData(isInstalled, 4);
                            } else {
                                logClient.putData("1", 4);
                            }
                            GameClient.getInstance().sendPacket(logClient);
                            logClient.clean();
                        }
                    } catch (e) {

                    }

                    if (Config.ENABLE_DECORATE_ITEM) {
                        decorateManager.reset();
                    }
                } else if (packet.getError() == -44) {
                    cc.log("_____________________LOGIN FAIL____________________");
                    sceneMgr.clearLoading();
                    socialMgr.clearSession();
                    sceneMgr.showOKDialog(LocalizedString.to("LOGIN_FAILED_MAINTAIN"), null, function (btnID) {
                        var checkPortal = false;
                        //if (btnID == 0) {
                        //
                        //}
                        //else {
                        //    cc.sys.localStorage.setItem("autologin", -1);
                        //    checkPortal = true;
                        //}

                        gamedata.backToLoginScene(checkPortal);
                    });

                    sceneMgr.clearLoading();
                } else {
                    cc.log("_______________________________________LOGIN FAIL___________________________________");
                    var log = " Login Fail: " + packet.getError() + " " + GameData.getInstance().sessionkey;
                    var s = "JavaScript error: assets/src/Lobby/Network/GameClientListener.js line 2222TypeError: " + log + " " + (new Error()).stack;
                    cc.log(s);
                    NativeBridge.logJSManual("assets/src/Lobby/Network/GameClientListener.js", "2222", s, NativeBridge.getVersionString());
                    sceneMgr.clearLoading();
                    socialMgr.clearSession();
                    sceneMgr.showOkCancelDialog(LocalizedString.to("LOGIN_FAILED") + " " + packet.getError(), null, function (btnID) {
                        var checkPortal = false;
                        if (btnID == 0) {

                        } else {
                            cc.sys.localStorage.setItem("autologin", -1);
                            checkPortal = true;
                        }

                        gamedata.backToLoginScene(checkPortal);
                    });

                    sceneMgr.clearLoading();
                    throw new Error(log);
                }
                break;
            }
            case CMD.CMD_LOGIN_FAIL: {
                cc.log("_______________________________RETRY RECONNECT OTHER SERVER________________________________");

                var cmdConnectFail = new CmdReceiveConnectFail(p);
                GameData.getInstance().ipapp = cmdConnectFail.ip;
                GameData.getInstance().portapp = cmdConnectFail.port;

                cc.sys.localStorage.setItem("ipapp", GameData.getInstance().ipapp);
                cc.sys.localStorage.setItem("portapp", GameData.getInstance().portapp);

                GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
                engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
                engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");
                GameClient.getInstance().disconnect();
                GameClient.destroyInstance();

                setTimeout(function () {
                    GameClient.getInstance().connect();
                }, 1000);

                NewRankData.disconnectServer();
                break;
            }
            case CMD.CMD_GET_CONFIG: {
                var cmd = new CmdReceivedConfig(p);
                cmd.clean();

                gamedata.setGameConfig(cmd.jsonConfig);
                break;
            }
            case CMD.CMD_LEVEL_CONFIG: {
                var cmd = new CmdReceivedLevelConfig(p);
                cmd.clean();

                gamedata.setLevelConfig(cmd);
                break;
            }
            case CMD.CMD_GET_USER_INFO: {
                sceneMgr.clearLoading();

                // READ DATA
                var info = new CmdReceivedUserInfo(p);
                gamedata.setUserInfo(info);

                // LOAD SCENE GAME
                if (!gamedata.isHolding) {
                    var cId = gamedata.gameConfig.getCurrentChanel() + 0;
                    if (cId < 0) cId = 0;
                    var pk = new CmdSendSelectChanel();
                    pk.putData(cId);
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();

                    iapHandler.responseUserInfo(info);

                    var lobby = sceneMgr.openScene(LobbyScene.className);
                    if (lobby instanceof LobbyScene)
                        lobby.onUserLoginSuccess();

                    if (this.saveSorry) {
                        var gui = sceneMgr.openGUI(GUISorry.className, GUISorry.tag, GUISorry.tag);
                        gui.setInfo(this.saveSorry.gold, this.saveSorry.gStar);

                        this.saveSorry = null;
                    }

                    if (GameClient.connectLai) {
                        Toast.makeToast(Toast.SHORT, LocalizedString.to("RECONNECT_SUCCESS"));
                        GameClient.connectLai = false;
                    }

                    // send select chanel
                    var pk = new CmdSendGetSupportBean();
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();
                    FootballHandler.WAIT_TO_RECEIVE_GIFT = false;

                    var cmdFHistory = new CmdSendGetMyHistory();
                    GameClient.getInstance().sendPacket(cmdFHistory);
                    cmdFHistory.clean();

                    // request shop event
                    var cmdEvent = new CmdSendRequestEventShop();
                    GameClient.getInstance().sendPacket(cmdEvent);

                    fr.crashLytics.setUserIdentifier(info.uId);
                    fr.crashLytics.setString(info.uId, "+++" + GameData.getInstance().sessionkey);
                }

                gamedata.loginGameSuccess();

                // sent event portal tet 2021
                try {

                    // var quests = [1, 2, 3, 4, 5, 6];
                    // var expireTime = 1610657200;
                    // if (quests.length > 0) {
                    //     var sendQuestCmd = new CmdSendPortalQuest();
                    //     sendQuestCmd.putData(quests, expireTime);
                    //     GameClient.getInstance().sendPacket(sendQuestCmd);
                    //     sendQuestCmd.clean();
                    // }

                    var data = fr.NativePortal.getInstance().getState();
                    data = JSON.parse(data);
                    cc.log("EVENT PORTAL DATA: " + JSON.stringify(data));
                    if (data) {
                        var eventQuest = data["eventTet2020"];
                        cc.log("EVENT PORTAL QUEST: " + JSON.stringify(eventQuest));
                        if (eventQuest) {
                            var list = eventQuest["listQuest"];
                            var expireTime = eventQuest["expireTime"];
                            var id = eventQuest["id"];
                            cc.log("EVENT PORTAL LIST QUEST: " + JSON.stringify(list));
                            var quests = [];
                            if (list && list.length > 0) {
                                for (var s = 0; s < list.length; s++) {
                                    if (list[s].startsWith("sam", 0)) {
                                        var questId = list[s].split("_");
                                        if (questId[1]) {
                                            quests.push(questId[1]);
                                        }
                                    }
                                }
                            }
                            cc.log("EVENT PORTAL CHECK QUESTS: " + JSON.stringify(quests));
                            if (Config.ENABLE_CHEAT) {
                                setTimeout(function () {
                                    Toast.makeToast(Toast.LONG, "id: " + id + "  " + JSON.stringify(list));
                                }, 3000);
                            }
                            //send quest to server
                            if (quests.length > 0) {
                                var sendQuestCmd = new CmdSendPortalQuest();
                                sendQuestCmd.putData(quests, expireTime, id);
                                GameClient.getInstance().sendPacket(sendQuestCmd);
                                sendQuestCmd.clean();
                            }

                        }
                    }
                } catch (e) {
                    cc.log("EVENT PORTAL ERROR! ");
                }

                if (!cc.sys.isNative) {
                    try {
                        var accType = Constant.ZINGME;
                        var type = GameData.getInstance().userData.zName.substr(0, 2);
                        if (type === "fb") {
                            accType = Constant.FACEBOOK;
                        }
                        if (type === "zl") {
                            accType = Constant.ZALO;
                        }
                        if (type === "gg") {
                            accType = Constant.GOOGLE;
                        }

                        gsntracker.login(info.uId, accType, info.uId, GameData.getInstance().userData.zName);
                    } catch (e) {
                        cc.error("Can not send login tracker: " + e);
                    }
                }

                // Log simulator
                if (fr.platformWrapper.isAndroid()) {
                    //service_name=log_simulator&username=test&userId=test&deviceId=deviceId&deviceModel=model&isSimulator=1
                    if (!gamedata.isSendCheckSimulator) {
                        var link = "http://120.138.65.103:470/";
                        //link = Constant.ZINGME_SERVICE_URL;
                        var data = "service_name=log_simulator";
                        data += "&username=" + "sam|" + GameData.getInstance().userData.zName;
                        data += "&userId=" + info.uId;
                        data += "&deviceId=" + NativeBridge.getDeviceID();
                        data += "&deviceModel=" + NativeBridge.getDeviceModel();
                        data += "&isSimulator=" + (gamedata.emulatorDetector.isEmulator() ? 1 : 0);
                        data += "&data=" + gamedata.dataEmulator;
                        cc.log("#Login::" + Constant.ZINGME_SERVICE_URL + data);
                        var onSuccess = function () {
                            cc.log("Success CHECK SIMULATOR ");
                            cc.log("TEXT RESPONSE " + this.xhrCheckSimulator.responseText);
                        }.bind(this);
                        var onError = function () {
                            cc.log("on Error CHECK SIMULATOR ");
                        }.bind(this);
                        cc.log("CHECK NE " + link + data);
                        this.xhrCheckSimulator = LoginHelper.getRequest(link, data, 10000, null, onSuccess, onError);
                    }
                    gamedata.isSendCheckSimulator = true;
                }
                break;
            }
            case CMD.CMD_UPDATE_ENABLE_PAYMENT: {
                var uep = new CmdReceivedNewUpdateEnablePayment(pkg);
                cc.log("CMD_UPDATE_ENABLE_PAYMENT: ", JSON.stringify(uep));
                if (Config.ENABLE_SERVICE_ENABLE_PAYMENT) {
                    gamedata.loadPayment(uep.payments);
                    gamedata.parseShopConfig();
                }
                break;
            }
            case CMD.CMD_SELECT_CHANEL: {
                var selectChanel = new CmdReceivedChanlel(pkg);
                selectChanel.clean();

                if (selectChanel.getError() == 0) {
                    gamedata.selectedChanel = selectChanel.chanelID;
                    sceneMgr.updateCurrentGUI();
                    var curLayer = sceneMgr.getRunningScene().getMainLayer();
                    if (curLayer.updateJackpotGUI) {
                        curLayer.updateJackpotGUI("init");
                    }
                } else {
                    var gui = sceneMgr.getRunningScene().getMainLayer();
                    if (gui instanceof ChooseRoomScene) {
                        sceneMgr.showOKDialog(LocalizedString.to("CHANGE_CHANNEL_FAIL"));
                    }
                }
                break;
            }
            case CMD.CMD_REFRESH_TABLE: {
                var table = new CmdReceivedRefreshTable(pkg);
                if (sceneMgr.getRunningScene().getMainLayer() instanceof ChooseRoomScene) {

                    gamedata.roomlist = table.list;
                    sceneMgr.updateCurrentGUI();
                }
                table.clean();
                break;
            }
            case CMD.SEARCH_TABLE: {
                if (sceneMgr.getRunningScene().getMainLayer() instanceof ChooseRoomScene) {
                    var search = new CmdReceivedUpdateSearchTable(pkg);
                    gamedata.roomlist = search.list;
                    sceneMgr.updateCurrentGUI(search);
                    search.clean();
                }
                break;
            }
            case CMD.CMD_BUY_GOLD: {
                var cBGold = new CmdReceiveBuyGold(p);
                if (cBGold.error != 0) {
                    sceneMgr.showOKDialog(LocalizedString.to("CHANGE_GOLD_FAIL"));
                }
                cBGold.clean();
                break;
            }
            case CMD.GET_DAILY_GIFT: {
                var cDG = new CmdReceiveDailyGift(p);
                gamedata.giftIndex = cDG.index;
                gamedata.showSupportStartup();
                cDG.clean();
                break;
            }
            case CMD.CMD_SHOP_GOLD: {
                var cSG = new CmdReceiveShopGold(p);
                if (cSG.isOffer)
                    return;
                var isChangeGoldSuccess = false;
                if (cSG.error == 0) {
                    if (Config.ENABLE_IAP_REFUND) {
                        if (iapHandler.waitIAP) {
                            // khong hien thi gui doi G
                        } else {
                            // sceneMgr.showOKDialog(LocalizedString.to("CHANGE_GOLD_SUCCESS"));

                            isChangeGoldSuccess = true;
                        }
                    } else {
                        isChangeGoldSuccess = true;

                        var gui = sceneMgr.getGUIByClassName(GUIInputCard.className);
                        if (gui && gui.isVisible()) {
                            gui.onBack();
                        }
                    }

                    if (isChangeGoldSuccess) {
                        NewVipManager.openChangeGoldSuccess(cSG);
                    }
                    if (cSG.channel == dailyPurchaseManager.getPromoChannel()){
                        if (cSG.packetId == dailyPurchaseManager.getPromoPackage())
                            fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_buy_promo_package");
                        else
                            fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_buy_promo_channel");
                    }
                    else fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "buy_gold");
                } else {
                    sceneMgr.showOKDialog(LocalizedString.to("CHANGE_GOLD_FAIL"));
                }
                cSG.clean();
                break;
            }
            case CMD.CMD_LOCK_ACCOUNT: {
                if (CheckLogic.checkInBoard())
                    return;
                sceneMgr.clearLoading();
                sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_IN_WAIT_ROOM"));
                break;
            }
            case CMD.ACCEPT_INVITATION: {
                var cai = new CmdReceiveAcceptInvitation(p);
                if (cai.error != 0) {
                    sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_NOT_REAL_ROOM"));
                }

                cai.clean();
                break;
            }
            case CMD.CMD_GET_GIFT_CODE_SUCCESS: {
                var cggcs = new CmdReceiveGiftCode(p);
                switch (cggcs.res) {
                    case 0:
                        sceneMgr.showOKDialog(LocalizedString.to("GIFT_CODE_FAIL"));
                        break;
                    case 1:
                        var s = LocalizedString.to("GIFT_CODE_SUCCESS");
                        s = StringUtility.replaceAll(s, "%gold", cggcs.money);
                        sceneMgr.showOKDialog(s);
                        break;
                    default :
                        sceneMgr.showOKDialog(LocalizedString.to("GIFT_CODE_FAIL"));
                        break;
                }
                cggcs.clean();
                break;
            }
            case CMD.INFO_VIP: {
                var civ = new CmdReceiveInfoVIP(p);
                gamedata.setVipInfo(civ);
                civ.clean();

                sceneMgr.updateCurrentGUI();
                break;
            }
            case CMD.REGISTER_VIP: {
                var crv = new CmdReceiveRegisterVip(p);

                switch (crv.getError()) {
                    case 0:
                        sceneMgr.showOKDialog(LocalizedString.to("VIP_REG_FAIL"));
                        break;
                    case 1:
                        sceneMgr.showOKDialog(LocalizedString.to("VIP_REG_LOW"));
                        break;
                    case 2:
                        sceneMgr.showOKDialog(LocalizedString.to("VIP_REG_FAIL_NOT_ENOUGHT"));
                        break;
                    case 3: {
                        var s = "";
                        var regMsg = "";
                        if (crv.type == 0) {
                            s = LocalizedString.to("VIP_WEEKLY");
                        } else if (crv.type == 1) {
                            s = LocalizedString.to("VIP_SILVER");
                        } else if (crv.type == 2) {
                            s = LocalizedString.to("VIP_GOLD");
                        }

                        if (gamedata.userData.typeVip != crv.type + 1) {
                            regMsg = LocalizedString.to("VIP_REG_SUCCESS");
                        } else {
                            regMsg = LocalizedString.to("VIP_EXTEND_SUCCESS");
                        }

                        regMsg = StringUtility.replaceAll(regMsg, "%vip", s);
                        regMsg = StringUtility.replaceAll(regMsg, "%gold", StringUtility.pointNumber(gamedata.gameConfig.vipConfig[crv.type].bonus));
                        if (!crv.isOffer)
                            sceneMgr.showOKDialog(regMsg);

                        gamedata.userData.typeVip = crv.type + 1;

                        var cgv = new CmdSendGetInfoVip();
                        GameClient.getInstance().sendPacket(cgv);
                        sceneMgr.updateCurrentGUI();
                        break;
                    }
                }

                crv.clean();
                break;
            }
            case CMD.VIP_OUT_OF_TIME: {
                sceneMgr.showOKDialog(LocalizedString.to("VIP_EXPIRE"));
                break;
            }
            case CMD.SUPPORT_BEAN: {
                var csb = new CmdReceiveSupportBean(p);
                csb.clean();

                gamedata.onSupportBean(csb);
                break;
            }
            case CMD.CMD_MISSION_UPDATE: {
                if (gamedata.gameConfig == null) break;

                var cmu = new CmdReceiveMission(p);
                if (gamedata.userData == null) {
                    gamedata.userData = {};
                }
                gamedata.userData.missionWork = {};
                gamedata.userData.missionWork = cmu.missions;

                var bonusGold = 0;
                var size = gamedata.gameConfig.missionConfig.numMission;
                if (size <= 0) {
                    cmu.clean();
                    return;
                }

                for (var key in cmu.missions) {
                    if (typeof cmu.missions[key] === 'object') {
                        if (cmu.missions[key].status == 2) {
                            bonusGold = gamedata.gameConfig.missionConfig[key].value;
                            break;
                        }
                    }
                }

                for (var i = 0; i < gamedata.gameConfig.shopConfig.length; i++) {
                    gamedata.gameConfig.shopConfig[i].bonusGold = bonusGold;
                }

                var gui = sceneMgr.getRunningScene().getMainLayer();

                cmu.clean();
                break;
            }
            case CMD.CMD_GETCODE: {
                var crc = new CmdReceiveCode(p);
                var data = (crc.getError() == 0) ? crc.listCodes : [];
                var gui = sceneMgr.getRunningScene().getMainLayer();
                if (gui instanceof LobbyScene)
                    gui.updateGiftCodes(data);

                crc.clean();
                break;
            }
            case CMD.CMD_GET_LIST_CODE_NEW: {
                var cglcn = new CmdReceiveListCodeNew(p);
                cc.log("CMD_GET_LIST_CODE_NEW: ", JSON.stringify(cglcn));
                var data = (cglcn.getError() == 0) ? cglcn.listCodes : [];
                var gui = sceneMgr.getRunningScene().getMainLayer();
                GiftCodeScene.list_code = data;
                if (gui instanceof LobbyScene)
                    gui.updateGiftCodes(data);

                cglcn.clean();
                break;
            }
            case CMD.CMD_USE_CODE: {
                GiftCodeScene.showResultUseGiftCode(p);
                break;
            }
            case CMD.CMD_UPDATE_COIN: {
                var pk = new CmdReceivedUpdateCoin(p);
                gamedata.userData.coin = pk.coin;
                Toast.makeToast(Toast.SHORT, LocalizedString.to("NAP_G"));
                sceneMgr.updateCurrentGUI();
                pk.clean();

                iapHandler.onUpdateMoney();

                break;
            }
            case CMD.CMD_UPDATE_BUYGOLD: {
                var pk = new CmdReceiveUpdateBuyGold(p);
                cc.log("CMD_UPDATE_BUYGOLD: ", JSON.stringify(pk));
                pk.clean();

                gamedata.gameConfig.arrayValueG = pk.arrayValueG;
                gamedata.gameConfig.arrayIsFirstG = pk.arrayIsFirstG;

                gamedata.gameConfig.arrayValueSMS = pk.arrayValueSMS;
                gamedata.gameConfig.arrayIsFirstSMS = pk.arrayIsFirstSMS;

                gamedata.gameConfig.arrayValueIAP = pk.arrayValueIAP;
                gamedata.gameConfig.arrayIsFirstIAP = pk.arrayIsFirstIAP;

                gamedata.gameConfig.arrayValueZing = pk.arrayValueZing;
                gamedata.gameConfig.arrayIsFirstZing = pk.arrayIsFirstZing;

                gamedata.gameConfig.arrayValueATM = pk.arrayValueATM;
                gamedata.gameConfig.arrayIsFirstATM = pk.arrayIsFirstATM;

                gamedata.gameConfig.arrayValueZalo = pk.arrayValueZalo;
                gamedata.gameConfig.arrayIsFirstZalo = pk.arrayIsFirstZalo;

                if (Config.TEST_SMS_VINA) {
                    gamedata.gameConfig.arrayValueSMSViettel = pk.arrayValueSMSViettel;
                    gamedata.gameConfig.arrayIsFirstSMSViettel = pk.arrayIsFirstSMSViettel;

                    gamedata.gameConfig.arrayValueSMSMobi = pk.arrayValueSMSMobi;
                    gamedata.gameConfig.arrayIsFirstSMSMobi = pk.arrayIsFirstSMSMobi;

                    gamedata.gameConfig.arrayValueSMSVina = pk.arrayValueSMSVina;
                    gamedata.gameConfig.arrayIsFirstSMSVina = pk.arrayIsFirstSMSVina;

                    gamedata.gameConfig.arrayBuyCount = pk.arrayBuyCount;
                    gamedata.gameConfig.lastBuyGoldType = pk.lastBuyGoldType;
                    gamedata.gameConfig.lastBuyGType = pk.lastBuyGType;
                }

                gamedata.gameConfig.buyGoldCount = pk.nBuyGold;
                sceneMgr.updateCurrentGUI();

                break;
            }
            case CMD.CMD_UPDATE_MONEY: {
                var update = new CmdReceivedUpdateBean(p);
                CheckLogic.onUpdateMoney(update);
                gamedata.updateMoney(update);

                // var gui = sceneMgr.getRunningScene().getMainLayer();
                // if (gui instanceof  LobbyScene || gui instanceof  ChooseRoomScene) {
                //     if (!gamedata.checkSupportBean())
                //         gamedata.timeSupport = 0;
                // }


                iapHandler.onUpdateMoney();

                update.clean();
                sceneMgr.updateCurrentGUI();
                break;
            }
            case CMD.JOIN_ROOM_FAIL: {
                if (CheckLogic.checkInBoard())
                    return;
                sceneMgr.clearLoading();
                var pkJoinRoomFail = new CmdReceivedJoinRoomFail(p);
                pkJoinRoomFail.clean();
                GameClient.holding = false;

                cc.log("### JOIN ROOM FAIL " + JSON.stringify(pkJoinRoomFail));

                switch (pkJoinRoomFail.reason) {
                    case 0:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_NOT_ENOUGHT_MONEY"));
                        break;
                    case 1:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_WRONG_PASS"));
                        break;
                    case 2:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_FULL"));
                        break;
                    case 3:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_IN_ROOM"));
                        break;
                    case 4:
                    case 11:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_DELETE_ROOM"));
                        break;
                    case 5:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_LOW_ROOM"));
                        break;
                    case 7:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_NOT_REAL_ROOM"));
                        break;
                    case 8:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_IN_WAIT_ROOM"));
                        break;
                    case 9:
                        sceneMgr.showOKDialog(LocalizedString.to("ROULETE_PLAYING"));
                        break;
                    default:
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_UNKNOWN") + pkJoinRoomFail.reason);
                        break;
                }
                break;
            }
            case CMD.CMD_CREATE_ROOM: {
                sceneMgr.clearLoading();
                var msgCmdRCreateRoom = new CmdReceiveCreateRoom(p);
                msgCmdRCreateRoom.clean();
                switch (msgCmdRCreateRoom.getError()) {
                    case 1: {
                        sceneMgr.showOKDialog(LocalizedString.to("JOIN_ROOM_FAIL_NOT_ENOUGHT_MONEY"));
                        break;
                    }
                    case 2: {
                        var nameRoom = ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].name;
                        var fullRoom = LocalizedString.to("CREATE_ROOM_FULL");
                        StringUtility.replaceAll(fullRoom, "%name", nameRoom);
                        sceneMgr.showOKDialog(LocalizedString.to(fullRoom));
                        break;
                    }
                    case 3:
                        sceneMgr.showOKDialog(LocalizedString.to("CREATE_ROOM_WRONG_BET"));
                        break;
                    case 4:
                        sceneMgr.showOKDialog(LocalizedString.to("CREATE_ROOM_QUICK"));
                        break;
                    case 5:
                        sceneMgr.showOKDialog(LocalizedString.to("CREATE_ROOM_IN_GAME"));
                        break;
                    case 8:
                        sceneMgr.showOKDialog(LocalizedString.to("ROULETE_PLAYING"));
                        break;
                    default:
                        sceneMgr.showOKDialog(LocalizedString.to("CREATE_ROOM_ERROR") + " " + msgCmdRCreateRoom.getError());
                        break;
                }

                break;
            }
            case CMD.SERVER_NOTIFY_MESSAGE: {
                var pk = new CmdReceivedServerNotifyMessage(p);
                pk.clean();

                broadcastMgr.addMessage(Broadcast.TYPE_SYSTEM, pk.message);
                break;
            }
            case CMD.CMD_PURCHASE_CARD: {
                var rPCard = new CmdReceivePurchaseCard(p);
                cc.log("CMD_PURCHASE_CARD " + JSON.stringify(rPCard));
                rPCard.clean();

                iapHandler.responsePurchaseCard(rPCard);
                break;
            }
            case CMD.CMD_PURCHASE_SMS: {
                var rPSMS = new CmdReceivePurchaseSMS(p);
                rPSMS.clean();

                iapHandler.purchaseSMS(rPSMS);
                break;
            }
            case CMD.CMD_PURCHASE_IAP_GOOGLE: {
                var rIapGoogle = new CmdReceivePurchaseIAPGoogle(p);
                rIapGoogle.clean();

                iapHandler.onResponseIapGoogle(rIapGoogle);
                break;
            }
            case CMD.CMD_PURCHASE_IAP_APPLE: {
                var rIapGoogle = new CmdReceivePurchaseIAPApple(p);
                rIapGoogle.clean();

                iapHandler.onResponseIapApple(rIapGoogle);
                break;
            }
            case CMD.CMD_BUY_ZALO_V2: {
                sceneMgr.clearLoading();
                var cmdBuyGZalo = new CmdReceivedBuyZaloV2(p);
                cc.log("PACKEG " + JSON.stringify(cmdBuyGZalo));
                if (cmdBuyGZalo.errorCode == 1) {
                    if (fr.platformWrapper.isAndroid()) {
                        gamedata.countZaloPay = 0;
                        NativeBridge.openURLNative(cmdBuyGZalo.deepLink);
                    } else {
                        //NativeBridge.openWebView(cmdBuyGZalo.qrLink, true);
                    }
                } else {
                    var str = LocalizedString.to("ZALOPAY_ERROR_" + cmdBuyGZalo.errorCode) + "\n";
                    var subErrorCode = cmdBuyGZalo.errMsg.substr(cmdBuyGZalo.errMsg.indexOf('(') + 1, 5);
                    if (subErrorCode && subErrorCode == "-1010") {
                        str += LocalizedString.to("ZALOPAY_ERROR_1010");
                    } else {
                        str = StringUtility.replaceAll(str, "@n", "\n");
                        str += cmdBuyGZalo.errMsg;
                    }
                    sceneMgr.showOKDialog(str);
                }
                break;
            }
            case CMD.CMD_IAP_PURCHASE_RESPONSE: {
                var cmd = new CmdReceivedIAPPurchase(p);
                iapHandler.onIAPPurchaseResponse(cmd);
                break;
            }
            case CMD.CMD_PURCHASE_IAP_VALIDATE: {
                var cmd = new CmdReceivedIAPValidate(p);
                iapHandler.onValidateSuccess(cmd);
                break;
            }
            case CMD.CMD_SEND_BUY_G_ATM: {
                sceneMgr.clearLoading();
                var cmdBuyGATM = new CmdReceivedBuyGATM(p);
                cc.log("PACKEG " + JSON.stringify(cmdBuyGATM));
                if (cmdBuyGATM.errorCode >= 1) { // || cmdBuyGATM.errorCode == 9) {
                    if (cc.sys.isNative) {
                        iapHandler.purchaseATM(cmdBuyGATM.urlDirect);
                    } else {
                        bankPopup.location = cmdBuyGATM.urlDirect;
                    }
                } else {
                    sceneMgr.showOKDialog(cmdBuyGATM.stringMessage + " " + cmdBuyGATM.errorCode);
                    if (!cc.sys.isNative)
                        bankPopup.close();
                }
                break;
            }
            case CMD.CMD_GET_CONFIG_SHOP: {
                var cmdGetConfigShop = new CmdReceivedConfigShop(p);
                gamedata.saveConfigShop(cmdGetConfigShop);
                cmdGetConfigShop.clean();
                break;
            }
            case CMD.CMD_MAP_ZALO: {
                var cmd = new CmdReceivedMapZalo(p);
                cc.log("CMD_MAP_ZALO" + JSON.stringify(cmd));
                sceneMgr.clearLoading();
                if (cmd.getError() == 0) {
                    cc.sys.localStorage.setItem(LoginScene.MAPPED_ZALO, 1);
                    var gui = sceneMgr.getGUIByClassName(AccountInputUI.className);
                    cc.sys.localStorage.setItem(LoginScene.USERNAME_KEY, gui._name);
                    cc.sys.localStorage.setItem(LoginScene.PASSWORD_KEY, gui._pass);
                    cc.sys.localStorage.setItem(LoginScene.AUTO_LOGIN_KEY, SocialManager.ZINGME);
                    SocialManager.getInstance()._currentSocial = SocialManager.ZINGME;
                    socialMgr.saveSession(gamedata.sessionkey, Constant.ZINGME, gamedata.openID, socialMgr._currentSocial);
                    gui.onClose();

                    var gui1 = sceneMgr.openGUI(GUIMapZaloSuccess.className, GUIMapZaloSuccess.tag, GUIMapZaloSuccess.tag);
                    gui1.setTypeMap(GUIMapZaloSuccess.MANUAL_MAP);
                    gui1.updateName(gui._name);

                    var gui2 = sceneMgr.getGUIByClassName(GUIMapZalo.className);
                    gui2.onClose();
                } else {
                    Toast.makeToast(1.0, localized("MAP_ZALO_ERROR_" + cmd.getError()));
                }

                break;
            }
            case CMD.CMD_NOTIFY_MAP_ZALO: {
                sceneMgr.openGUI(GUIMapZalo.className, GUIMapZalo.tag, GUIMapZalo.tag);
                break;
            }
            case CMD.CMD_NOTIFY_MAPPED_ZALO: {
                cc.sys.localStorage.setItem(LoginScene.MAPPED_ZALO, 1);
                timeoutConnectHandler.clearCountDown();
                sceneMgr.clearLoading();
                var cmd = new CmdReceivedNotifyMappedZalo(p);
                if (cmd.getError() == 1) { // dang nhap bang nick zalo da map lan 2
                    var s = localized("MAPPED_ZALO");
                    s = StringUtility.replaceAll(s, "@name", cmd.username);
                    if (gamedata.isPortal()) {
                        sceneMgr.showOkDialogWithAction(s, null, function (btnID) {
                            fr.portalState.setRequireLogout(true);
                            gamedata.endGame();
                        });
                    } else {
                        sceneMgr.showOKDialog(s);
                    }
                } else if (cmd.getError() == 2) { // dang nhap bang nick zalo da map lan 1
                    var gui = sceneMgr.openGUI(GUIMapZaloSuccess.className, GUIMapZaloSuccess.tag, GUIMapZaloSuccess.tag);
                    gui.setTypeMap(GUIMapZaloSuccess.AUTO_MAP);
                    gui.setInfoMap(cmd.username, cmd.sessionKey);
                    cc.sys.localStorage.setItem(LoginScene.USERNAME_KEY, cmd.username);
                    cc.sys.localStorage.setItem(LoginScene.PASSWORD_KEY, "");
                    cc.sys.localStorage.setItem(LoginScene.AUTO_LOGIN_KEY, SocialManager.ZINGME);
                    SocialManager.getInstance()._currentSocial = SocialManager.ZINGME;
                    socialMgr.saveSession(gamedata.sessionkey, Constant.ZINGME, gamedata.openID, socialMgr._currentSocial);
                } else { // dang nhap bang nick zingme da map lan 1
                    var gui = sceneMgr.openGUI(GUIMapZaloSuccess.className, GUIMapZaloSuccess.tag, GUIMapZaloSuccess.tag);
                    gui.setTypeMap(GUIMapZaloSuccess.AUTO_MAP);
                    var username = cc.sys.localStorage.getItem(LoginScene.USERNAME_KEY);
                    gui.setInfoMap(username, gamedata.sessionkey);
                }
                break;
            }
            case CMD.CMD_SORRY: {
                var cmd = new CmdReceivedSorry(p);
                cc.log("CMD_SORRY" + JSON.stringify(cmd));
                var gui = sceneMgr.getRunningScene().getMainLayer();
                if (gui instanceof LobbyScene) {
                    var gui = sceneMgr.openGUI(GUISorry.className, GUISorry.tag, GUISorry.tag);
                    gui.setInfo(cmd.gold, cmd.gStar);
                } else {
                    this.saveSorry = cmd;
                }
                break;
            }
            case NewRankData.CMD_RANK_INFO_OTHER_USER: {
                var otherInfo = new CmdReceivedOtherRankInfo(p);
                cc.log("otherInfo: ", JSON.stringify(otherInfo));
                sceneMgr.clearLoading();
                var otherInfoGUI = sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
                otherInfoGUI.setInfo(otherInfo);
                otherInfo.clean();
                break;
            }
            case CMD.CMD_LEVEL_UP: {
                var cmd = new CmdReceivedLevelUp(p);
                cc.log("level up: ", JSON.stringify(cmd));

                var gui = sceneMgr.getMainLayer();
                if (gui instanceof BoardScene) {
                    gui.showLevelUp(cmd);
                }
                break;
            }
            case CMD.CMD_TRACK_LOG_ZALO: {
                var cmd = new CmdReceivedTrackLogZaloPay(p);
                cc.log("CMD_TRACK_LOG_ZALO" + JSON.stringify(cmd));
                if (cmd.payType == CmdReceivedTrackLogZaloPay.CREATE_BINDING) {
                    if (cmd.errorCode == 1) {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "BINDING");
                    }
                    else {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "BINDING_FAIL");
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.END);
                    }
                }
                else if (cmd.payType == CmdReceivedTrackLogZaloPay.CREATE_ORDER) {
                    if (cmd.errorCode == 1) {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "ORDER");
                    }
                    else {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "ORDER_FAIL");
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.END);
                    }
                }
                else if (cmd.payType == CmdReceivedTrackLogZaloPay.PAY){
                    if (cmd.errorCode == 1 || cmd.errorCode == 3) {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "PAY");
                    }
                    else {
                        fr.tracker.logStepStart(ConfigLog.ZALO_PAY, "PAY_FAIL");
                    }
                    fr.tracker.logStepStart(ConfigLog.ZALO_PAY, ConfigLog.END);
                }

                break;
            }
            case CMD.CMD_PORTAL_GIFT_CODE: {
                var cmd = new CmdReceivedPortalGiftCode(p);
                cc.log("CMD_PORTAL_GIFT_CODE", JSON.stringify(cmd));
                if (p.error == 0) {
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("GIFT CODE SUCCESS "));
                }

                break;
            }
            default : {
                this.inGame.onReceived(cmd, pkg);
                this.football.onReceive(cmd, pkg);
                this.social.onReceived(cmd, pkg);

                if (Config.ENABLE_DECORATE_ITEM)
                    decorateManager.onReceive(cmd, pkg);

                offerManager.onReceived(cmd, pkg);
                event.onReceive(cmd, pkg);
                chatMgr.onReceive(cmd, pkg);
                NewVipManager.getInstance().onReceive(cmd, pkg);
                StorageManager.getInstance().onReceive(cmd, pkg);
                dailyPurchaseManager.onReceive(cmd, pkg);
                LuckyBonusManager.getInstance().onReceive(cmd, pkg);
                FortuneCatManager.getInstance().onReceive(cmd, pkg);

                break;
            }
        }
        packet.clean();
    }
});