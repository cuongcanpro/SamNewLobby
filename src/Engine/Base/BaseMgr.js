var BaseMgr = cc.Class.extend({
    ctor: function () {
        gameMgr.addToArrayMgr(this);
    },

    onReceived: function (cmd, pk) {

    },

    sendPacket: function (cmd) {
        GameClient.getInstance().send(cmd);
    },

    resetData: function () {

    }
})