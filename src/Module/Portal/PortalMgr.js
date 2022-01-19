var PortalMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
    },

    initListener: function () {
        dispatcherMgr.addListener(UserMgr.EVENT_ON_GET_USER_INFO, this, this.onGetUserInfo);
        dispatcherMgr.addListener(LobbyMgr.EVENT_ON_ENTER_FINISH, this, this.checkEventPortal);
    },

    onGetUserInfo: function () {
        this.checkEvent();
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case PortalMgr.CMD_PORTAL_GIFT_CODE: {
                var cmd = new CmdReceivedPortalGiftCode(p);
                cc.log("CMD_PORTAL_GIFT_CODE", JSON.stringify(cmd));
                if (p.error == 0) {
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("GIFT CODE SUCCESS "));
                }
                return true;
            }
        }
        return false;
    },

    isPortal : function () {
        if (Config.ENABLE_CHEAT) {
            if (CheatCenter.ENABLE_FAKE_PORTAL) return true;
        }
        try {
            return (cc.director.isUsePortal && cc.director.isUsePortal());
        } catch (e) {

        }
        return false;
    },


    endGame: function () {
        if (this.isPortal()) {
            try {
                fr.NativeService.endGame();
            } catch (e) {
                cc.director.end();
            }
        } else {
            if (cc.sys.os == cc.sys.OS_IOS)
                engine.HandlerManager.getInstance().exitIOS();
            else
                cc.director.end();
        }
    },

    getSessionKeyPortal : function () {
        if (!cc.sys.isNative) {
            return loginMgr.getSessionKey();
        }

        try {
            return fr.NativePortal.getInstance().getSessionKey();
        } catch (e) {

        }
        return "";
    },

    getVersionJS : function () {
        if (this.jsVersion === undefined || this.jsVersion == null || this.jsVersion == "") {
            if (this.isPortal()) {
                var project_manifest_path = fr.NativeService.getFolderUpdateAssets() + '/' + 'project.manifest';
                var project_manifest_path_ios = fr.NativeService.getFolderUpdateAssets() + '/' + 'project.dat';
                var manifestData = jsb.fileUtils.getStringFromFile(project_manifest_path);
                if (!manifestData) {
                    manifestData = jsb.fileUtils.getStringFromFile(project_manifest_path_ios);
                }

                try {
                    this.jsVersion = JSON.parse(manifestData).version + "";
                } catch (e) {
                    this.jsVersion = "1";
                }
            } else {
                this.jsVersion = cc.sys.localStorage.getItem(LocalizedString.config("KEY_JS_VERSION"));

                if (this.jsVersion === undefined || this.jsVersion == null || this.jsVersion == "") this.jsVersion = "0";
            }
        }
        return this.jsVersion;
    },

// sent event portal tet 2021
    checkEvent : function () {
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
    },

    /**
     * EventMgr Portal He 2021
     */
    checkEventPortal : function () {
        if (!this.checkPortal) {
            cc.log("CHAY VO DAY NAY KIEM TRA QUEST PORTAL 3");
            if (typeof injection != "undefined" && injection != null && injection.scopes != null) {
                injection.scopes.init(["quest", "giftcode"], function(result) {
                    cc.log("DU LIEU NE " + result);
                    if (result) {
                        cc.log("LAY THANH CONG ");
                        var quest1 = injection.scopes.getQuest();
                        this.giftCode = injection.scopes.getGiftCode();
                        var portalId = injection.scopes.getPortalId();
                        var expireTime = quest1["expireTime"];

                        cc.log("QUEST " + JSON.stringify(quest1["list"]));
                        cc.log("GIFT CODE " + JSON.stringify(this.giftCode));
                        cc.log("PORTAL ID " + portalId);
                        var list = quest1["list"];
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
                                //  Toast.makeToast(Toast.LONG, "id: " + id + "  " + JSON.stringify(quests));
                            }, 3000);
                        }
                        //send quest to server
                        if (quests.length > 0) {
                            var sendQuestCmd = new CmdSendPortalQuest();
                            sendQuestCmd.putData(quests, expireTime, portalId);
                            GameClient.getInstance().sendPacket(sendQuestCmd);
                            sendQuestCmd.clean();
                        }
                        if (this.giftCode.length > 0) {
                            var s = localized("EVENT_PORTAL");
                            s = StringUtility.replaceAll(s, "@x", this.giftCode.length);
                            s = StringUtility.replaceAll(s, "@money", StringUtility.pointNumber(100000 * this.giftCode.length));
                            sceneMgr.showOkDialogWithAction(s, this, function (buttonId) {
                                if (buttonId == Dialog.BTN_OK) {
                                    for (var i = 0; i < this.giftCode.length; i++) {
                                        var cmd = new CmdSendPortalGiftCode();
                                        cc.log("SEND GIFT CODE " + this.giftCode[i]);
                                        cmd.putData(this.giftCode[i]);
                                        GameClient.getInstance().sendPacket(cmd);
                                        cmd.clean();
                                    }
                                }
                            });
                        }

                    }
                    else {
                        cc.log("LAY THAT BAI ");
                        // Get data error
                    }
                });
            }
            else {
                cc.log("KHONG CO DU LIEU TU PORTAL ***** ");
            }
        }
        this.checkPortal = true;
    }
})

PortalMgr.instance = null;
PortalMgr.getInstance = function () {
    if (!PortalMgr.instance) {
        PortalMgr.instance = new PortalMgr();
    }
    return PortalMgr.instance;
};
var portalMgr = PortalMgr.getInstance();

PortalMgr.CMD_PORTAL_QUEST = 1405;
PortalMgr.CMD_PORTAL_GIFT_CODE = 1406;