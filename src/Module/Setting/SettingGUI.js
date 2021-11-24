
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

        this.swSound = this.createSwitchButton(bg, this.getControl("sound", bg), SettingGUI.BTN_SOUND, gamedata.sound);
        this.swVibrate = this.createSwitchButton(bg, this.getControl("vibrate", bg), SettingGUI.BTN_VIBRATE, gamedata.vibrate);
        this.swInvite = this.createSwitchButton(bg, this.getControl("invite", bg), SettingGUI.BTN_INVITE, gamedata.acceptInvite);
        this.swFriend = this.createSwitchButton(bg, this.getControl("friend", bg), SettingGUI.BTN_FRIEND, gamedata.acceptFriend);

        this.customButton("logout", SettingGUI.BTN_LOGOUT, bg).setVisible(cc.sys.isNative || !Config.WITHOUT_LOGIN);
        this.customButton("support", SettingGUI.BTN_SUPPORT, bg);
        this.customButton("fanpage", SettingGUI.BTN_FANPAGE, bg);

        this.getControl("txMail", bg).setString(!gamedata.isAppSupport ? gamedata.support : gamedata.supporturl);
        this.getControl("txPhone", bg).setString(gamedata.supportphone);

        var version = this.getControl("version", bg);
        version.setString(NativeBridge.getVersionString());

        this.setFog(true);
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
    },

    finishAnimate: function () {
        this.swSound.setOn(gamedata.sound, true);
        this.swVibrate.setOn(gamedata.vibrate, true);
        this.swInvite.setOn(gamedata.acceptInvite, true);
        this.swFriend.setOn(gamedata.acceptFriend, true);
    },

    createSwitchButton: function (parent, btn, id, value) {
        var switchControl = new cc.ControlSwitch
        (
            new cc.Sprite("GUISetting/bgBtn.png"),
            new cc.Sprite("GUISetting/btnOn.png"),
            new cc.Sprite("GUISetting/btnOff.png"),
            new cc.Sprite("GUISetting/icon.png"),
            new cc.LabelTTF("", "Arial", 16),
            new cc.LabelTTF("", "Arial", 16)
        );
        btn.setVisible(false);
        switchControl.setOn(value, true);
        switchControl.setPosition(btn.getPosition());
        switchControl.setTag(id);
        parent.addChild(switchControl);

        var mask = new cc.Sprite("GUISetting/maskBtn.png");
        parent.addChild(mask);
        mask.setPosition(btn.getPosition());

        switch (id) {
            case SettingGUI.BTN_SOUND:
                switchControl.addTargetWithActionForControlEvents(this, this.changeSound, cc.CONTROL_EVENT_VALUECHANGED);
                break;
            case SettingGUI.BTN_FRIEND:
                switchControl.addTargetWithActionForControlEvents(this, this.changeFriend, cc.CONTROL_EVENT_VALUECHANGED);
                break;
            case SettingGUI.BTN_VIBRATE:
                switchControl.addTargetWithActionForControlEvents(this, this.changeVibrate, cc.CONTROL_EVENT_VALUECHANGED);
                break;
            case SettingGUI.BTN_INVITE:
                switchControl.addTargetWithActionForControlEvents(this, this.changeInvite, cc.CONTROL_EVENT_VALUECHANGED);
                break;
        }
        return switchControl;
    },

    changeSound: function (sender, controlEvent) {
        var value = sender.isOn();
        cc.sys.localStorage.setItem("sound", value ? 3 : 1);
        gamedata.sound = value;
        gameSound.on = value;
    },

    changeVibrate: function (sender, controlEvent) {
        var value = sender.isOn();
        cc.sys.localStorage.setItem("vibrate", value ? 1 : 0);
        gamedata.vibrate = value;
    },

    changeFriend: function (sender, controlEvent) {
        var value = sender.isOn();
        cc.sys.localStorage.setItem("friend", value ? 1 : 0);
        gamedata.acceptFriend = value;
    },

    changeInvite: function (sender, controlEvent) {
        var value = sender.isOn();
        cc.sys.localStorage.setItem("invite", value ? 1 : 0);
        gamedata.acceptInvite = value;
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case SettingGUI.BTN_CLOSE: {
                this.onClose();
                //gameSound.playSoundxepbai_samchi();
                break;
            }
            case SettingGUI.BTN_LOGOUT: {
                var message = gamedata.isPortal() ? LocalizedString.to("LOGOUT_GAME_TO_PORTAL") : LocalizedString.to("_ASKLOGOUT_");
                sceneMgr.showOkCancelDialog(message, this, function (btnID) {
                    if (btnID == 0) {
                        if (gamedata.isPortal()) {
                            gamedata.endGame();
                        } else {
                            socialMgr.clearSession();
                            GameClient.getInstance().connectState = ConnectState.DISCONNECTED;
                            engine.HandlerManager.getInstance().forceRemoveHandler("pingpong");
                            engine.HandlerManager.getInstance().forceRemoveHandler("received_pingpong");
                            GameClient.getInstance().disconnect();
                            GameClient.destroyInstance();
                            // NewRankGameClient.getInstance().disconnect()
                            // socialMgr.logout();

                            cc.sys.localStorage.setItem("autologin", -1);
                            this.runAction(new cc.Sequence([new cc.DelayTime(.1), new cc.CallFunc(function () {
                                gamedata.backToLoginScene();
                            }, this, null)]));

                            NewRankData.getInstance().resetData();
                            NewRankData.disconnectServer();
                        }
                    }
                });
                break;
            }
            case SettingGUI.BTN_SUPPORT: {
                if (gamedata.isAppSupport) {
                    NativeBridge.openHotro(gamedata.support, gamedata.userData.zName);
                } else {
                    NativeBridge.openWebView(gamedata.support);
                }
                break;
            }
            case SettingGUI.BTN_FANPAGE: {
                NativeBridge.openWebView(gamedata.forum);
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
