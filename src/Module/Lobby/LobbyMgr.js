var LobbyMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.preloadResource();
    },

    preloadResource: function () {
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/firework2/skeleton.xml","firework2");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/firework2/texture.plist", "firework2");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/firework1/skeleton.xml","firework1");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/firework1/texture.plist", "firework1");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/firework3/skeleton.xml","firework3");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/firework3/texture.plist", "firework3");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Choingay/skeleton.xml","Choingay");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Choingay/texture.plist", "Choingay");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Chonban/skeleton.xml","Chonban");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Chonban/texture.plist", "Chonban");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/MinigameBTN/skeleton.xml","MinigameBTN");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/MinigameBTN/texture.plist", "MinigameBTN");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/shopwithtag/skeleton.xml","shopwithtag");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/shopwithtag/texture.plist", "shopwithtag");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/bt_vip_xephang/skeleton.xml","bt_vip_xephang");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/bt_vip_xephang/texture.plist", "bt_vip_xephang");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/VipBTN/skeleton.xml","VipBTN");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/VipBTN/texture.plist", "VipBTN");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Girl/skeleton.xml","Girl");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Girl/texture.plist", "Girl");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/BtnCoin/skeleton.xml","BtnCoin");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/BtnCoin/texture.plist", "BtnCoin");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/LogoSmall/skeleton.xml","LogoSmall");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/LogoSmall/texture.plist", "LogoSmall");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/AddGBTN/skeleton.xml","AddGBTN");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/AddGBTN/texture.plist", "AddGBTN");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Lasvegas/skeleton.xml","Lasvegas");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Lasvegas/texture.plist", "Lasvegas");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/ShopBTN/skeleton.xml","ShopBTN");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/ShopBTN/texture.plist", "ShopBTN");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Emoticon/0/skeleton.xml","Emoticon0");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Emoticon/0/texture.plist", "Emoticon0");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Emoticon/skeleton.xml","Emoticon");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Emoticon/texture.plist", "Emoticon");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Coin/skeleton.xml","Coin");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Coin/texture.plist", "Coin");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/IconHot/skeleton.xml","IconHot");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/IconHot/texture.plist", "IconHot");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/DotEff/skeleton.xml","DotEff");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/DotEff/texture.plist", "DotEff");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/LightBg/skeleton.xml","LightBg");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/LightBg/texture.plist", "LightBg");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/Notify/skeleton.xml","Notify");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/Notify/texture.plist", "Notify");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Board/Interact/item_anim/skeleton.xml", "item_anim");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Board/Interact/item_anim/texture.plist", "item_anim");

        db.DBCCFactory.getInstance().loadDragonBonesData("res/Board/Interact/interact_covid/skeleton.xml", "Covid");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Board/Interact/interact_covid/texture.plist", "Covid");
    },

    initListener: function () {
        dispatcherMgr.addListener(UserMgr.EVENT_ON_GET_USER_INFO, this, this.openLobbyScene);
        dispatcherMgr.addListener(UserMgr.EVENT_GET_POS_COMPONENT, this, this.getPosComponent);
        dispatcherMgr.addListener(UserMgr.EVENT_GET_VALUE, this, this.getValue);
        dispatcherMgr.addListener(UserMgr.EVENT_EFFECT_LABEL, this, this.getPosComponent);
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