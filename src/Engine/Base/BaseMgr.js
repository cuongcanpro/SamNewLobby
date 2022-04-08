var BaseMgr = cc.Class.extend({
    ctor: function () {
        gameMgr.addToArrayMgr(this);
    },

    init: function () {

    },

    onReceived: function (cmd, pk) {

    },

    sendPacket: function (cmd) {
        GameClient.getInstance().sendPacket(cmd);
    },

    resetData: function () {

    },

    update: function (dt) {

    },

    initListener: function () {

    }
})