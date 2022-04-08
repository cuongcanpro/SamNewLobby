var SettingMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.sound = true;
        this.music = true;
        this.vibrate = true;
        this.acceptFriend = true;
        this.acceptInvite = true;
    },

    init: function () {
        // load storage variable
        if (cc.sys.localStorage.getItem("sound")) {
            var sound = cc.sys.localStorage.getItem("sound");
            this.sound = sound > 2;
        }

        var vibrate = cc.sys.localStorage.getItem("vibrate");
        if (vibrate !== undefined && vibrate != null) {
            this.vibrate = (vibrate == 1);
        }

        var invite = cc.sys.localStorage.getItem("invite");
        if (invite !== undefined && invite != null) {
            this.acceptInvite = (invite == 1);
        }

        var friend = cc.sys.localStorage.getItem("friend");
        if (friend !== undefined && friend != null) {
            this.acceptFriend = (friend == 1);
        }
    },

    onReceived: function (cmd, pk) {
        return false;
    },

    openSettingGUI: function () {
        sceneMgr.openGUI(SettingGUI.className, LobbyScene.GUI_SETTING, LobbyScene.GUI_SETTING);
    }
})

SettingMgr.instance = null;
SettingMgr.getInstance = function () {
    if (!SettingMgr.instance) {
        SettingMgr.instance = new SettingMgr();
    }
    return SettingMgr.instance;
};
var settingMgr = SettingMgr.getInstance();