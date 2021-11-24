var LobbyMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
    },

    onReceived: function (cmd, pk) {
        return false;
    },

    openLobbyScene: function () {
        var lobby = sceneMgr.openScene(LobbyScene.className);
    }
})

LobbyMgr.instance = null;
LobbyMgr.getInstance = function () {
    if (!LobbyMgr.instance) {
        LobbyMgr.instance = new LobbyMgr();
    }
    return LobbyMgr.instance;
};
var lobbyMgr = LobbyMgr.getInstance();