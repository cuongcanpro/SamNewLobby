var SettingMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.sound = true;
        this.music = true;
        this.vibrate = true;
        this.acceptFriend = true;
        this.acceptInvite = true;
    },

    onReceived: function (cmd, pk) {
        return false;
    },
})

SettingMgr.instance = null;
SettingMgr.getInstance = function () {
    if (!SettingMgr.instance) {
        SettingMgr.instance = new SettingMgr();
    }
    return SettingMgr.instance;
};
var settingMgr = SettingMgr.getInstance();