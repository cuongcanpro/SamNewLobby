
// Setting GUI
var SettingGUI = BaseLayer.extend({

    ctor: function (user) {
        this._super();
        this._layerColor = new cc.LayerColor(cc.BLACK);
        this.addChild(this._layerColor);
        this.initWithBinaryFile("SettingGUI.json");
        this._user = user;
    },

    customizeGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this.customButton("close", SettingGUI.BTN_CLOSE, bg);

        this.btnSound = this.customButton("sound", SettingGUI.BTN_SOUND, bg);
        this.btnVibrate = this.customButton("vibrate", SettingGUI.BTN_VIBRATE, bg);
        this.btnInvite = this.customButton("invite", SettingGUI.BTN_INVITE, bg);
        this.btnFriend = this.customButton("friend", SettingGUI.BTN_FRIEND, bg);
        this.btnSound.setPressedActionEnabled(false);
        this.btnVibrate.setPressedActionEnabled(false);
        this.btnInvite.setPressedActionEnabled(false);
        this.btnFriend.setPressedActionEnabled(false);

        this.customButton("logout", SettingGUI.BTN_LOGOUT, bg).setVisible(cc.sys.isNative || !Config.WITHOUT_LOGIN);
        this.customButton("support", SettingGUI.BTN_SUPPORT, bg);
        this.customButton("fanpage", SettingGUI.BTN_FANPAGE, bg);

        var version = this.getControl("version", bg);
        version.setString(NativeBridge.getVersionString());

        this.setFog(true);
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
    },

    finishAnimate: function () {
        this.updateButton(this.btnInvite, settingMgr.acceptInvite);
        this.updateButton(this.btnFriend, settingMgr.acceptFriend);
        this.updateButton(this.btnSound, settingMgr.sound);
        this.updateButton(this.btnVibrate, settingMgr.vibrate);
    },

    updateButton: function (btn, value) {
        if (value) {
            btn.loadTextures("Lobby/GUISetting/btnOn.png", "Lobby/GUISetting/btnOn.png");
        }
        else {
            btn.loadTextures("Lobby/GUISetting/btnOff.png", "Lobby/GUISetting/btnOff.png");
        }
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case SettingGUI.BTN_CLOSE: {
                this.onClose();
                break;
            }
            case SettingGUI.BTN_SOUND: {
                settingMgr.sound = !settingMgr.sound;
                gameSound.on = settingMgr.sound;
                cc.sys.localStorage.setItem("sound", settingMgr.sound ? 3 : 1);
                this.updateButton(this.btnSound, settingMgr.sound);
                break;
            }
            case SettingGUI.BTN_VIBRATE: {
                settingMgr.vibrate = !settingMgr.vibrate;
                cc.sys.localStorage.setItem("vibrate", settingMgr.vibrate ? 1 : 0);
                this.updateButton(this.btnVibrate, settingMgr.vibrate);
                break;
            }
            case SettingGUI.BTN_FRIEND: {
                settingMgr.acceptFriend = !settingMgr.acceptFriend;
                cc.sys.localStorage.setItem("friend", settingMgr.acceptFriend ? 1 : 0);
                this.updateButton(this.btnFriend, settingMgr.acceptFriend);
                break;
            }
            case SettingGUI.BTN_INVITE: {
                settingMgr.acceptInvite = !settingMgr.acceptInvite;
                cc.sys.localStorage.setItem("invite", settingMgr.acceptInvite ? 1 : 0);
                this.updateButton(this.btnInvite, settingMgr.acceptInvite);
                break;
            }
            case SettingGUI.BTN_LOGOUT: {
                var message = portalMgr.isPortal() ? LocalizedString.to("LOGOUT_GAME_TO_PORTAL") : LocalizedString.to("_ASKLOGOUT_");
                sceneMgr.showOkCancelDialog(message, this, function (btnID) {
                    if (btnID == 0) {
                        if (portalMgr.isPortal()) {
                            gameMgr.endGame();
                        } else {
                            socialMgr.clearSession();
                            GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
                            GameClient.getInstance().disconnect();
                            GameClient.destroyInstance();
                            // RankGameClient.getInstance().disconnect()
                            // socialMgr.logout();

                            cc.sys.localStorage.setItem("autologin", -1);
                            this.runAction(new cc.Sequence([new cc.DelayTime(.1), new cc.CallFunc(function () {
                                loginMgr.backToLoginScene();
                            }, this, null)]));

                            RankData.getInstance().resetData();
                            RankData.disconnectServer();
                        }
                    }
                });
                break;
            }
            case SettingGUI.BTN_SUPPORT: {
                if (gameMgr.isAppSupport) {
                    NativeBridge.openHotro(gameMgr.support, userMgr.getUserName());
                } else {
                    NativeBridge.openWebView(gameMgr.support);
                }
                break;
            }
            case SettingGUI.BTN_FANPAGE: {
                NativeBridge.openWebView(gameMgr.forum);
                break;
            }
        }
    },

    onBack: function () {
        this.onClose();
    }
});


SettingGUI.className = "SettingGUI";

SettingGUI.BTN_CLOSE = 1;
SettingGUI.BTN_SOUND = 2;
SettingGUI.BTN_VIBRATE = 3;
SettingGUI.BTN_INVITE = 4;
SettingGUI.BTN_FRIEND = 5;
SettingGUI.BTN_LOGOUT = 6;
SettingGUI.BTN_SUPPORT = 7;
SettingGUI.BTN_FANPAGE = 8;
