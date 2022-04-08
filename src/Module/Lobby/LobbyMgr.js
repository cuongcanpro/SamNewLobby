var LobbyMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
    },

    init: function () {
        this.preloadResource();
        this.initListener();
    },

    preloadResource: function () {
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/firework2/skeleton.xml","firework2");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/firework2/texture.plist", "firework2");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/firework1/skeleton.xml","firework1");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/firework1/texture.plist", "firework1");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/firework3/skeleton.xml","firework3");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/firework3/texture.plist", "firework3");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/LogoSmall/skeleton.xml","LogoSmall");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/LogoSmall/texture.plist", "LogoSmall");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Emoticon/0/skeleton.xml","Emoticon0");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Emoticon/0/texture.plist", "Emoticon0");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Emoticon/skeleton.xml","Emoticon");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Emoticon/texture.plist", "Emoticon");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/IconHot/skeleton.xml","IconHot");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/IconHot/texture.plist", "IconHot");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/LightBg/skeleton.xml","LightBg");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/LightBg/texture.plist", "LightBg");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Notify/skeleton.xml","Notify");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Notify/texture.plist", "Notify");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Board/Interact/item_anim/skeleton.xml", "item_anim");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Board/Interact/item_anim/texture.plist", "item_anim");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Board/Interact/interact_covid/skeleton.xml", "Covid");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Board/Interact/interact_covid/texture.plist", "Covid");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/iconBottom/skeleton.xml", "iconBottom");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/iconBottom/texture.plist", "iconBottom");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/iconTop/skeleton.xml", "iconTop");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/iconTop/texture.plist", "iconTop");
    },

    initListener: function () {
        dispatcherMgr.addListener(UserMgr.EVENT_ON_GET_USER_INFO, this, this.openLobbyScene);
        dispatcherMgr.addListener(UserMgr.EVENT_GET_POS_COMPONENT, this, this.getPosComponent);
        dispatcherMgr.addListener(UserMgr.EVENT_GET_VALUE, this, this.getValue);
        dispatcherMgr.addListener(UserMgr.EVENT_EFFECT_LABEL, this, this.getPosComponent);
        dispatcherMgr.addListener(UserMgr.EVENT_UPDATE_MONEY, this, this.updateMoney);
    },

    updateMoney: function () {
        var lobby = sceneMgr.getMainLayer()
        if (lobby instanceof LobbyScene) {
            lobby.updateToCurrentData();
        }
    },

    onGetUserInfo: function (eventName, eventData) {
        if (!eventData.isHolding) {
            this.openLobbyScene();
        }
    },

    getPosComponent: function (eventName, type) {
        if (this.inLobbyScene()) {
            var gui = sceneMgr.getRunningScene().getMainLayer();
            return gui.pUserInfo.getPositionComponent(type);
        }
    },

    getValue: function (eventName, type) {
        if (this.inLobbyScene()) {
            var gui = sceneMgr.getRunningScene().getMainLayer();
            return gui.pUserInfo.getValue(type);
        }
    },

    effectLabel: function (eventName, type) {
        if (this.inLobbyScene()) {
            var gui = sceneMgr.getRunningScene().getMainLayer();
            gui.pUserInfo.effectRunLabel(type);
        }
    },

    inLobbyScene: function () {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        if (gui instanceof LobbyScene) {
            return true;
        }
        return false;
    },

    onReceived: function (cmd, pk) {
        return false;
    },

    openLobbyScene: function () {
        cc.log("OPEN LOBBY SCENE");
        var lobby = sceneMgr.openScene(LobbyScene.className);
    },

    showEffectSuggestMoney: function () {
        var curLayer = sceneMgr.getMainLayer();
        if (curLayer instanceof LobbyScene) {
            curLayer.onEffectSuggestMoney();
        }
    },
})

LobbyMgr.EVENT_ON_ENTER_FINISH = "lobbyMgrOnEnterFinish";

LobbyMgr.instance = null;
LobbyMgr.getInstance = function () {
    if (!LobbyMgr.instance) {
        LobbyMgr.instance = new LobbyMgr();
    }
    return LobbyMgr.instance;
};
var lobbyMgr = LobbyMgr.getInstance();