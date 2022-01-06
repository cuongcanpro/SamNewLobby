/*
 * All Receive User Action
 * Created by Hunter on 5/25/2016.
 */

var GameClientListener = cc.Class.extend({

    ctor: function () {
        this._listenerID = 0;

        this.social = new SocialNetworkListener();
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

        GameClient.connectLai = CheckLogic.checkInBoard();
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

        var dateLog = new Date();
        var time = dateLog.toTimeString() + ", " + dateLog.getTime() + ": ";
        fr.crashLytics.setString(cmd.toString(), time);

        var controllerID = packet.getControllerId();
        if (!cc.sys.isNative) {
            cmd = packet._cmdId;
        }

        if (cmd != 50 && cmd != 20001)
            cc.log(" ON RECEIVED PACKET   CMD: " + cmd + "  CONTROLLER ID: " + controllerID + " ERRO.R:  " + packet.getError());

        if (controllerID == 0) {
            switch (cmd) {
                case CMD.HAND_SHAKE: {
                    cc.log("++HandShake Success -> Process Login");

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
                        NewRankData.disconnectServer();

                        sceneMgr.showOkCancelDialog(LocalizedString.to("DISCONNECT_LOGIN"), null, function (btnID) {
                            if (!cc.sys.isNative) {
                                GameClient.connectCount = 0;
                                GameClient.processRetryConnect();
                            } else {
                                var checkPortal = false;
                                if (btnID == 0) {
                                } else {
                                    cc.sys.localStorage.setItem("autologin", -1);
                                    cc.sys.localStorage.setItem("session", "");
                                    checkPortal = true;
                                }

                                gamedata.backToLoginScene(checkPortal);
                            }
                        });
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
                    cc.log("_____________________LOGIN SUCCESSFUL_____________________");

                    var mobile = new CmdSendMobile();
                    var platform = 0;
                    if (cc.sys.os == cc.sys.OS_ANDROID) {
                        platform = 3;
                    } else if (cc.sys.os == cc.sys.OS_IOS) {
                        platform = 1;
                    } else if (!cc.sys.isNative) {
                        platform = 0;
                    } else {
                        platform = Config.PLATFORM_MOBILE_DEFAULT;
                    }
                    mobile.putData(NativeBridge.getDeviceModel(), NativeBridge.getOsVersion(), platform, NativeBridge.getDeviceID(), gamedata.detectVersionUpdate(), gamedata.getInstallDate());
                    GameClient.getInstance().sendPacket(mobile);
                    mobile.clean();

                    var cmdGetDid = new CmdSendGetDID();
                    var currDid = cc.sys.localStorage.getItem(LoginScene.KEY_DID);
                    cmdGetDid.putData(!currDid ? "" : currDid);
                    GameClient.getInstance().sendPacket(cmdGetDid);
                    cmdGetDid.clean();

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

                    offerManager.resetData();
                    StorageManager.getInstance().resetData();
                    ChatMgr.getInstance().resetData();
                    NewVipManager.getInstance().resetData();
                    NewRankData.getInstance().resetData();
                    NewRankData.connectToServerRank();
                    DailyPurchaseManager.getInstance().resetData();
                    LobbyButtonManager.getInstance().hideAll();

                } else if (packet.getError() == -44) {
                    cc.log("_____________________LOGIN FAIL____________________ " + packet.getError());
                    sceneMgr.clearLoading();
                    socialMgr.clearSession();
                    sceneMgr.showOKDialog(LocalizedString.to("LOGIN_FAILED_MAINTAIN"), null, function (btnID) {
                        var checkPortal = false;
                        gamedata.backToLoginScene(checkPortal);
                    });

                    sceneMgr.clearLoading();
                } else {
                    cc.log("_____________________LOGIN FAIL____________________");
                    sceneMgr.clearLoading();
                    socialMgr.clearSession();
                    sceneMgr.showOkCancelDialog(LocalizedString.to("LOGIN_FAILED"), null, function (btnID) {
                        var checkPortal = false;
                        if (btnID == 0) {

                        } else {
                            cc.sys.localStorage.setItem("autologin", -1);
                            checkPortal = true;
                        }

                        gamedata.backToLoginScene(checkPortal);
                    });

                    sceneMgr.clearLoading();
                }
                break;
            }
            case CMD.CMD_LOGIN_FAIL: {
                cc.log("__________________RETRY RECONNECT OTHER SERVER____________________");

                var cmdConnectFail = new CmdReceiveConnectFail(p);

                if (!cc.sys.isNative) {
                    if (Config.ENABLE_CHEAT) {
                        if (parseInt(GameData.getInstance().portapp) == Config.PORT_WEB) {
                            GameData.getInstance().portapp = Config.PORT_WEB2;
                        } else {
                            GameData.getInstance().portapp = Config.PORT_WEB;
                        }
                    } else {
                        if (GameData.getInstance().ipapp.localeCompare(Config.SERVER_LIVE_WEB) == 0) {
                            GameData.getInstance().ipapp = Config.SERVER_LIVE_WEB2;
                        } else {
                            GameData.getInstance().ipapp = Config.SERVER_LIVE_WEB;
                        }
                    }
                } else {
                    GameData.getInstance().ipapp = cmdConnectFail.ip;
                    GameData.getInstance().portapp = cmdConnectFail.port;
                }

                cc.sys.localStorage.setItem("ipapp", GameData.getInstance().ipapp);
                cc.sys.localStorage.setItem("portapp", GameData.getInstance().portapp);

                GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
                engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
                engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");
                GameClient.getInstance().disconnect();
                GameClient.destroyInstance();
                NewRankData.disconnectServer();

                setTimeout(function () {
                    GameClient.getInstance().connect();
                }, 1000);

                break;
            }
            case CMD.CMD_MOBILE: {
                var rMobile = new CmdReceiveMobile(p);
                rMobile.clean();

                cc.log("CMD_MOBILE : " + JSON.stringify(rMobile));

                gamedata.enablepayment = rMobile.enablepayment;
                gamedata.payments = rMobile.payments;

                //for (var i = 0; i < gamedata.payments.length - 1; i++) {
                //    if (gamedata.payments[i]) {
                //        gamedata.enablepayment = true;
                //    }
                //}

                //if (Config.ENABLE_CHEAT && CheatCenter.ENABLE_PAYMENT) {
                //    if (CheatCenter.ENABLE_REVIEW)
                //        gamedata.payments = [false, false, false, false];
                //    else
                //        gamedata.payments = [CheatCenter.ENABLE_PAYMENT_IAP, CheatCenter.ENABLE_PAYMENT_IAP, CheatCenter.ENABLE_PAYMENT_DIRECT];
                //}

                if (gamedata.isPortal()) {
                    if (Config.DISABLE_IAP_PORTAL) {
                        gamedata.payments[Payment.GOLD_IAP] = false;
                        gamedata.payments[Payment.G_IAP] = false;
                    }
                    for (var i = 0; i < gamedata.payments.length; i++) {
                        if (i == Payment.GOLD_IAP || i == Payment.G_IAP) {
                            if (fr && fr.NativePortal && fr.NativePortal.getInstance().isShowInappShop) {
                                gamedata.payments[i] = fr.NativePortal.getInstance().isShowInappShop() && gamedata.payments[i];
                            }
                        } else {
                            if (fr && fr.NativePortal && fr.NativePortal.getInstance().isShowLocalShop) {
                                gamedata.payments[i] = fr.NativePortal.getInstance().isShowLocalShop() && gamedata.payments[i];
                            }
                        }
                    }

                    if (cc.sys.os == cc.sys.OS_IOS) {
                        //gamedata.payments[Payment.GOLD_IAP] = false;
                        //gamedata.payments[Payment.G_IAP] = false;

                        var n = 0;
                        for (var i = 0; i < gamedata.payments.length; i++) {
                            if (i != Payment.GOLD_G && gamedata.payments[i]) n = 1;
                        }
                        if (n == 0) gamedata.payments[Payment.GOLD_G] = false;
                    }
                }
                //gamedata.payments = [true, true, false, false];
                //gamedata.payments[Payment.G_ZALO] = false;
                //gamedata.payments[Payment.G_ATM] = false;
                // gamedata.payments[Payment.GOLD_ZALO] = true;
                // gamedata.payments[Payment.GOLD_ZING] = false;
                //gamedata.payments[Payment.GOLD_ATM] = false;
                gamedata.payments[Payment.G_CARD] = false;
                if (!cc.sys.isNative) {
                    gamedata.payments[Payment.G_IAP] = false;
                    gamedata.payments[Payment.GOLD_IAP] = false;
                    gamedata.payments[Payment.GOLD_ZALO] = false;
                }

                if (Config.ENABLE_CHEAT) {
                    if (CheatCenter.ENABLE_PAYMENT) {
                        for (var s in gamedata.payments) {
                            gamedata.payments[s] = true;
                        }
                    }
                    gamedata.payments[Payment.GOLD_ZALO] = true;
                    // gamedata.payments[Payment.G_ZALO] = false;
                    // gamedata.payments[Payment.GOLD_ZING] = false;
                    // gamedata.payments[Payment.GOLD_ATM] = false;
                    // gamedata.payments[Payment.GOLD_IAP] = false;
                    //gamedata.payments[Payment.GOLD_G] = false;
                    // gamedata.payments[Payment.GOLD_SMS] = false;
                    // gamedata.payments[Payment.G_ATM] = false;
                    // gamedata.payments[Payment.G_ZING] = false;
                    // gamedata.payments[Payment.G_IAP] = false;
                    // gamedata.payments[Payment.GOLD_ZALO] = true;
                    gamedata.payments[Payment.G_ZALO] = true;
                }

                // gamedata.payments[Payment.GOLD_ZALO] = true;
                // gamedata.payments[Payment.G_ZALO] = true;

                cc.log("***PAYMENT : " + gamedata.payments.join());
                if (Config.ENABLE_CHEAT) {
                    setTimeout(function () {
                        Toast.makeToast(Toast.SHORT, "Payments : " + gamedata.payments.join());
                    }, 2000);
                }

                var pk = new CmdSendGetConfig();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                break;
            }
            case CMD.CMD_GET_CONFIG: {
                var config = new CmdReceivedConfig(pkg);
                cc.log("CMD_GET_CONFIG" + JSON.stringify(config));
                gamedata.setGameConfig(config);
                if (gamedata.saveCmdConfigShop)
                    gamedata.gameConfig.setDataShop(gamedata.saveCmdConfigShop);

                var pk = new CmdSendGetUserInfo();
                GameClient.getInstance().sendPacket(pk);

                pk.clean();
                config.clean();

                gamedata.selectedChanel = -1;
                break;
            }
            case CMD.CMD_LEVEL_CONFIG: {
                var cmd = new CmdReceivedLevelConfig(p);
                cmd.clean();

                gamedata.setLevelConfig(cmd);
                break;
            }
            case CMD.CMD_GET_USER_INFO: {
                var info = new CmdReceivedUserInfo(pkg);
                gamedata.setUserInfo(info);
                cc.log("CMD_GET_USER_INFO :" + JSON.stringify(info));

                if (!GameClient.holding) {
                    var cId = gamedata.gameConfig.getCurrentChanel() + 0;
                    if (cId < 0) cId = 0;
                    var pk = new CmdSendSelectChanel();
                    pk.putData(cId);
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();
                }

                event.onGetUserInfoSuccess();
                iapHandler.responseUserInfo(info);

                // save session cache
                var typeLogin = Constant.ZINGME;

                switch (socialMgr._currentSocial) {
                    case SocialManager.FACEBOOK:
                        typeLogin = Constant.FACEBOOK;
                        break;
                    case SocialManager.GOOGLE:
                        typeLogin = Constant.GOOGLE;
                        break;
                    case SocialManager.ZALO:
                        typeLogin = Constant.ZALO;
                        break;
                    case SocialManager.ZINGME:
                        typeLogin = Constant.ZINGME;
                        break;
                }

                try {
                    if (gamedata.isPortal()) {
                        typeLogin = fr.NativePortal.getInstance().getSocialType();
                        switch (typeLogin) {
                            case Constant.FACEBOOK:
                                socialMgr._currentSocial = SocialManager.FACEBOOK;
                                break;
                            case Constant.GOOGLE:
                                socialMgr._currentSocial = SocialManager.GOOGLE;
                                break;
                            case Constant.ZALO:
                                socialMgr._currentSocial = SocialManager.ZALO;
                                break;
                            case Constant.ZINGME:
                                socialMgr._currentSocial = SocialManager.ZINGME;
                                break;
                        }
                    }
                } catch (e) {
                    typeLogin = Constant.ZINGME;
                }
                socialMgr.saveSession(gamedata.sessionkey, typeLogin, gamedata.openID, socialMgr._currentSocial);

                if (!gamedata.userData.zName || gamedata.userData.zName.localeCompare("") == 0) {
                    cc.log("ZNAME EMPTY ");
                    var jsVersion = cc.sys.localStorage.getItem(LocalizedString.config("KEY_JS_VERSION"));
                    var log = "UID: " + GameData.getInstance().userData.uID + " " + typeLogin + "PACKAGE: " + JSON.stringify(info) + " SESSION KEY: " + gamedata.sessionkey + " USERINFO PARSE: " + JSON.stringify(GameData.getInstance().userData);
                    //if (gamedata.isPortal())
                    //    NativeBridge.logJSManual("GameClienListener", "123456", log , "PORTAL " + jsVersion);
                    //else
                    //    NativeBridge.logJSManual("GameClienListener", "123456", log, jsVersion);
                    // co loi xay ra, load lai game
                    GameClient.getInstance().retryConnectInGame();
                }

                NativeBridge.sendLoginGSN(GameData.getInstance().userData.uID + "", typeLogin, gamedata.openID + "", gamedata.userData.zName);
                NativeBridge.sendLogin(GameData.getInstance().userData.uID + "", typeLogin, gamedata.source);

                fr.crashLytics.setUserIdentifier(info.uId);
                fr.crashLytics.setString(info.uId, "+++" + GameData.getInstance().sessionkey);
                fr.crashLytics.setString("Social", typeLogin);

                // request shop event
                var cmdEvent = new CmdSendRequestEventShop();
                GameClient.getInstance().sendPacket(cmdEvent);

                // sent event portal tet 2021
                try {


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
                                    if (list[s].startsWith("binh", 0)) {
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
                                    Toast.makeToast(Toast.LONG, "id: " + id + "  " + JSON.stringify(quests));
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
                        data += "&username=" + "binh|" + GameData.getInstance().userData.zName;
                        data += "&userId=" + info.uId;
                        data += "&deviceId=" + NativeBridge.getDeviceID();
                        data += "&deviceModel=" + NativeBridge.getDeviceModel();
                        data += "&isSimulator=" + (gamedata.emulatorDetector.isEmulator() ? 1 : 0);
                        data += "&data=" + gamedata.dataEmulator;
                        cc.log("#Login::" + Constant.ZINGME_SERVICE_URL + data);
                        var onSuccess = function () {
                            cc.log("Success CHECK SIMULATOR ");
                            cc.log("TEXT RESPONSE " + xhr.responseText);
                        }
                        var onError = function () {
                            cc.log("on Error CHECK SIMULATOR ");
                        }
                        cc.log("CHECK NE " + link + data);
                        var xhr = LoginHelper.getRequest(link, data, 10000, null, onSuccess, onError);
                    }
                    gamedata.isSendCheckSimulator = true;
                }
                break;
            }
            case CMD.CMD_IS_HOLDING: {
                GameClient.getInstance().connectState = ConnectState.CONNECTED;
                GameClient.getInstance().startPingPong();

                var holding = new CmdReceivedIsHolding(pkg);
                holding.clean();

                // cc.log("#### HOLDING IN ROOM " + JSON.stringify(holding));

                broadcastMgr.onStart();
                sceneMgr.clearLoading();
                if (holding.getError() == 0) {
                    GameClient.holding = true;
                    GameClient.holdingRoom = holding.roomID;
                    GameClient.holdingPass = holding.pass;

                    var pk = new CmdSendSelectChanel();
                    pk.putData(holding.chanelID);
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();
                } else {

                    if (Config.ENABLE_NEW_LOBBY && gamedata.checkInReview()) {
                        var lobby = sceneMgr.openScene(LobbySceneFake.className);
                    } else {
                        var lobby = sceneMgr.openScene(LobbyScene.className);
                        if (lobby instanceof LobbyScene)
                            lobby.onUserLoginSuccess();

                        if (GameClient.connectLai) {
                            Toast.makeToast(Toast.SHORT, LocalizedString.to("RECONNECT_SUCCESS"));
                            GameClient.connectLai = false;
                        }

                        // send select chanel
                        var pk = new CmdSendGetSupportBean();
                        GameClient.getInstance().sendPacket(pk);
                        pk.clean();

                        if (this.saveSorry) {
                            var gui = sceneMgr.openGUI(GUISorry.className, GUISorry.tag, GUISorry.tag);
                            gui.setInfo(this.saveSorry.gold, this.saveSorry.gStar);
                            this.saveSorry = null;
                        }
                    }

                }
                break;
            }
            case CMD.CMD_SELECT_CHANEL: {
                var selectChanel = new CmdReceivedChanlel(pkg);
                selectChanel.clean();

                if (GameClient.holding) {
                    cc.log("JOIN TU DAY ********** ");
                    var cmdJoinRomm = new CmdSendJoinRoom();
                    cmdJoinRomm.putData(GameClient.holdingRoom, GameClient.holdingPass);
                    GameClient.getInstance().sendPacket(cmdJoinRomm);
                    cmdJoinRomm.clean();
                    GameClient.holding = false;
                }

                if (selectChanel.getError() == 0) {
                    gamedata.selectedChanel = selectChanel.chanelID;
                    gamedata.jackpot = selectChanel.jackpot;
                    sceneMgr.updateCurrentGUI();
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
            case CMD.CMD_NOTIFY_DAILY_GIFT: {
                var cDG = new CmdReceiveDailyGift(p);
                gamedata.giftIndex = cDG.index;
                gamedata.showSupportStartup();
                cDG.clean();
                break;
            }
            case CMD.CMD_SHOP_GOLD: {
                var cSG = new CmdReceiveShopGold(p);
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
                        if (gui && gui.isVisible()) {i
                            gui.onBack();
                        }
                    }

                    if (isChangeGoldSuccess) {
                        NewVipManager.getInstance().setWaiting(true);
                        // NewVipManager.openChangeGoldSuccess(cSG);
                    }
                    if (cSG.channel == dailyPurchaseManager.getPromoChannel()){
                        if (cSG.packetId == dailyPurchaseManager.getPromoPackage())
                            fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_buy_promo_package");
                        else
                            fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "btn_buy_promo_channel");
                    }
                    else fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, "buy_gold");
                } else {
                    WaitingPopup.clear();
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

                cc.log("++VipInfo " + JSON.stringify(civ));

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
            case CMD.NAP_CARD: {
                var cnc = new CmdReceiveNapCard(p);
                switch (cnc.response) {
                    case 1:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD1"));
                        break;
                    case 2:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD2"));
                        break;
                    case 3:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD3"));
                        break;
                    case 4:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD4"));
                        break;
                    case -100:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD5"));
                        break;
                    case -101:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD6"));
                        break;
                    case 1001:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD7"));
                        break;
                    case 5000:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD8"));
                        break;
                    case 6000:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD9"));
                        break;
                    case 6100:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD10"));
                        break;
                    case 6200:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD11"));
                        break;
                    case 6206:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD12"));
                        break;
                    case 7400:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD13"));
                        break;
                    case 7500:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD14"));
                        break;
                    case 7501:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD15"));
                        break;
                    case 7502:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD16"));
                        break;
                    case 7503:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD17"));
                        break;
                    case 7504:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD18"));
                        break;
                    case 7505:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD19"));
                        break;
                    case 7506:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD20"));
                        break;
                    case 7507:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD21"));
                        break;
                    case 7508:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD22"));
                        break;
                    case 7509:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD23"));
                        break;
                    case 7510:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD24"));
                        break;
                    case 7511:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD25"));
                        break;
                    case 7512:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD26"));
                        break;

                    default:
                        sceneMgr.showOKDialog(LocalizedString.to("INPUT_CARD27"));
                        break;
                }
                cnc.clean();
                break;
            }
            case CMD.VIP_OUT_OF_TIME: {
                sceneMgr.showOKDialog(LocalizedString.to("VIP_EXPIRE"));
                break;
            }
            case CMD.SUPPORT_BEAN: {
                var csb = new CmdReceiveSupportBean(p);
                csb.clean();

                gamedata.numSupport = csb.numSuport;
                gamedata.timeSupport = csb.delay;
                gamedata.isWaitingSpecialSupport = csb.isWaitingSpecialSupport;
                gamedata.specialSupportRemainStart = csb.remainStart;
                gamedata.specialSupportRemainEnd = csb.remainEnd;
                cc.log("SUPPORT BEAN *********** ");
                cc.log("jdf " + csb.numSuport + " " + gamedata.gameConfig.buyGoldCount);

                if (gamedata.userData.bean < ChanelConfig.instance().chanelConfig[0].minGold) {
                    if ((csb.numSuport <= 0)) // het tien ma chua nap
                    {
                        if (offerManager.haveOffer()) {
                            offerManager.showOfferGUI();
                        } else {
                            if ((gamedata.gameConfig.buyGoldCount == 0))
                                gamedata.showTangVangPopup();
                            else if (gamedata.gameConfig.buyGoldCount == 1)
                                gamedata.showTangVangPopup2();
                        }
                    }
                }

                cc.director.getScheduler().unschedule("SpecialSupportUpdate", gamedata);
                if (gamedata.isWaitingSpecialSupport){
                    cc.director.getScheduler().schedule(function(){
                        gamedata.specialSupportRemainStart -= 1000;
                        gamedata.specialSupportRemainEnd -= 1000;
                    }.bind(gamedata), gamedata, 1, cc.REPEAT_FOREVER, 0, false, "SpecialSupportUpdate");
                }

                if (csb.getError() > 0) {
                    if (csb.nBean > 0) {
                        gamedata.showSupportBean(csb.nBean, csb.isSpecial);
                    }
                } else {
                    if (csb.delay > 0) {
                        if (gamedata.showSupportTime) {
                            var spTime = sceneMgr.openGUI(SupportTimeGUI.className, Dialog.SUPPORT, Dialog.SUPPORT, false);
                            if (spTime) spTime.showSupport(csb.delay);
                        }
                    }
                }
                gamedata.showSupportTime = false;
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

                cc.log("CMD_UPDATE_BUYGOLD : " + JSON.stringify(pk))

                //   var obj = JSON.parse(pk.updateBuy);

                //gamedata.gameConfig.missionBuyGold = obj["shopMissions"];
                //gamedata.gameConfig.missionBuySMS = obj["smsMissions"];
                //gamedata.gameConfig.missionBuyGoldIap = obj["iapShopMissions"];

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

                gamedata.gameConfig.buyGoldCount = pk.numberBuyGold;

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
                sceneMgr.updateCurrentGUI();

                pk.clean();
                break;
            }
            case CMD.CMD_UPDATE_MONEY: {
                var update = new CmdReceivedUpdateBean(p);
                cc.log("UPDATE MONEY", JSON.stringify(update));
                NewRankData.checkNotifyOpenRank(update.level);
                gamedata.updateMoney(update);

                var gui = sceneMgr.getRunningScene().getMainLayer();
                if (gui instanceof LobbyScene || gui instanceof ChooseRoomScene) {
                    if (!gamedata.checkSupportBean())
                        gamedata.timeSupport = 0;
                }

                CheckLogic.onUpdateMoney(update);

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
                    case 11:
                        break;
                    case 14:
                        sceneMgr.showOKDialog(LocalizedString.to("MINIGAME_PLAYING"));
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
                        fullRoom = StringUtility.replaceAll(fullRoom, "%name", nameRoom);
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
                    case 10:
                        sceneMgr.showOKDialog(LocalizedString.to("MINIGAME_PLAYING"));
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
            case CMD.CMD_VOTE_APP_SHOW: {
                var voteBonus = new CmdReceiveVoteAppBonus(p);
                voteBonus.clean();

                gamedata.voteAppEnable = true;
                gamedata.voteAppBonus = voteBonus.money;

                break;
            }
            case CMD.CMD_VOTE_APP: {
                var rVote = new CmdReceiveVoteAppBonus(p);
                rVote.clean();

                if (rVote.getError() == 0) {
                    var str = LocalizedString.to("VOTE_APP_BONUS");
                    str = StringUtility.replaceAll(str, "@money", StringUtility.pointNumber(rVote.money));
                    gamedata.voteAppEnable = false;
                    sceneMgr.showOKDialog(str);
                }
                break;
            }
            case CMD.CMD_PURCHASE_CARD: {
                var rPCard = new CmdReceivePurchaseCard(p);
                rPCard.clean();
                cc.log("PURCHASE CARD " + JSON.stringify(rPCard));
                iapHandler.responsePurchaseCard(rPCard);
                break;
            }
            case CMD.CMD_PURCHASE_SMS: {
                var rPSMS = new CmdReceivePurchaseSMS(p);
                rPSMS.clean();

                iapHandler.purchaseSMS(rPSMS);
                break;
            }
            case CMD.CMD_PURCHASE_IAP_GOOGLE:
            case CMD.CMD_PURCHASE_IAP_GOOGLE_PORTAL: {
                var rIapGoogle = new CmdReceivePurchaseIAPGoogle(p);
                rIapGoogle.clean();

                iapHandler.onResponseIapGoogle(rIapGoogle);
                break;
            }
            case CMD.CMD_PURCHASE_IAP_APPLE:
            case CMD.CMD_PURCHASE_IAP_APPLE_PORTAL: {
                var rIapGoogle = new CmdReceivePurchaseIAPApple(p);
                rIapGoogle.clean();

                iapHandler.onResponseIapApple(rIapGoogle);
                break;
            }
            case CMD.CMD_BUY_G_ZALO: {
                var cmdBuyGZalo = new CmdReceivedBuyGZalo(p);
                cc.log("PACKEG Zalo: " + JSON.stringify(cmdBuyGZalo));
                if (cmdBuyGZalo.errorCode == 8 || cmdBuyGZalo.errorCode == 0) {
                    iapHandler.purchaseZalo(cmdBuyGZalo.zptranstoken);
                } else {
                    sceneMgr.clearLoading();
                    sceneMgr.showOKDialog(cmdBuyGZalo.stringMessage + " " + cmdBuyGZalo.errorCode);
                }
                break;
            }
            case CMD.CMD_BUY_G_ATM: {
                var cmdBuyGATM = new CmdReceivedBuyGATM(p);
                cc.log("PACKEG " + JSON.stringify(cmdBuyGATM));
                if (cmdBuyGATM.errorCode == 1 || cmdBuyGATM.errorCode == 9) {
                    if (cc.sys.isNative) {
                        iapHandler.purchaseATM(cmdBuyGATM.urlDirect);
                    } else {
                        bankPopup.location = cmdBuyGATM.urlDirect;
                    }
                } else {
                    sceneMgr.clearLoading();
                    sceneMgr.showOKDialog(cmdBuyGATM.stringMessage + " " + cmdBuyGATM.errorCode);
                }
                break;
            }
            case CMD.CMD_SEND_BUY_G_ATM: {

                var cmdBuyGATM = new CmdReceivedBuyGATM(p);
                cc.log("PACKEG " + JSON.stringify(cmdBuyGATM));
                if (cmdBuyGATM.errorCode >= 1) {
                    if (cc.sys.isNative) {
                        iapHandler.purchaseATM(cmdBuyGATM.urlDirect);
                    } else {
                        bankPopup.location = cmdBuyGATM.urlDirect;
                    }
                } else {
                    sceneMgr.clearLoading();
                    sceneMgr.showOKDialog(cmdBuyGATM.stringMessage + " " + cmdBuyGATM.errorCode);
                }
                break;
            }
            case CMD.CMD_GET_CONFIG_SHOP: {
                var cmdGetConfigShop = new CmdReceivedConfigShop(p);
                // cc.log("CMD_GET_CONFIG_SHOP " + JSON.stringify(cmdGetConfigShop));
                if (gamedata.gameConfig) {
                    gamedata.gameConfig.setDataShop(cmdGetConfigShop);
                } else {
                    gamedata.saveCmdConfigShop = cmdGetConfigShop;
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
            case CMD.CMD_GET_DID: {
                var cmdDid = new CmdReceivedDID(p);
                var lcDid = cc.sys.localStorage.getItem(LoginScene.KEY_DID);
                if (!lcDid) {
                    cc.sys.localStorage.setItem(LoginScene.KEY_DID, cmdDid.did);
                }
                cmdDid.clean();
                break;
            }
            case CMD.CMD_BUY_ZALO_V2: {
                var cmdBuyGZalo = new CmdReceivedBuyZaloV2(p);
                cc.log("PACKEG " + JSON.stringify(cmdBuyGZalo));
                if (cmdBuyGZalo.errorCode == 1) {
                    if (fr.platformWrapper.isAndroid()) {
                        NativeBridge.openURLNative(cmdBuyGZalo.deepLink);
                        gamedata.countZaloPay = 0;
                    } else {
                        NativeBridge.openWebView(cmdBuyGZalo.qrLink, true);
                    }
                } else {
                    sceneMgr.clearLoading();
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
            case CMD.CMD_LEVEL_UP: {
                var cmd = new CmdReceivedLevelUp(p);
                cc.log("level up", JSON.stringify(cmd));

                var scene = sceneMgr.getMainLayer();
                if (scene instanceof MaubinhLayer){
                    scene.showLevelUp(cmd);
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
            case CMD.CMD_SHOP_GOLD_SUCCESS: {
                WaitingPopup.clear();
                sceneMgr.clearLoading();
                var cmd = new CmdReceivedShopGoldSuccess(p);
                cc.log("CMD_SHOP_GOLD_SUCCESS", JSON.stringify(cmd));
                var cmdSend = new CmdSendShopGoldSuccess();
                cmdSend.putData(cmd.purchaseId[0]);
                GameClient.getInstance().sendPacket(cmdSend);
                cmdSend.clean();
                var gui = sceneMgr.getGUIByClassName(GUIShopGoldSuccess.className);
                if (gui && gui.isShow) {
                    cc.log("is SHOW " + gui.isShow + " " + gui.isVisible());
                    gui.setInfo(cmd, false);
                }
                else {
                    gui = sceneMgr.openGUI(GUIShopGoldSuccess.className, GUIShopGoldSuccess.TAG, GUIShopGoldSuccess.TAG);
                    gui.setInfo(cmd, true);
                }
                break;
            }
            case CMD.GET_DAILY_GIFT:
                var gui = sceneMgr.getMainLayer();
                if (gui && gui.updateToCurrentData) {
                    gui.updateToCurrentData();
                }
                break;
            case NewRankData.CMD_RANK_INFO_OTHER_USER: {
                var otherInfo = new CmdReceivedOtherRankInfo(p);
                cc.log("otherInfo: ", JSON.stringify(otherInfo));
                sceneMgr.clearLoading();
                var otherInfoGUI = sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
                otherInfoGUI.setInfo(otherInfo);
                otherInfo.clean();
                break;
            }
            default : {
                this.inGame.onReceived(cmd, pkg);
                this.social.onReceived(cmd, pkg);

                chatMgr.onReceive(cmd, pkg);
                event.onReceive(cmd, pkg);
                offerManager.onReceived(cmd, pkg);
                NewVipManager.getInstance().onReceive(cmd, pkg);
                StorageManager.getInstance().onReceive(cmd, pkg);
                dailyPurchaseManager.onReceive(cmd, pkg);
                break;
            }
        }
        packet.clean();
    }
});