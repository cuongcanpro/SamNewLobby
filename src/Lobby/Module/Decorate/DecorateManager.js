/**
 * Created by cuongcan_pro on 7/31/2017.
 */

// ------------- RECEIVE -----------------------------
CmdReceivedDecorate = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.reason = this.getByte();
        cc.log("reason " + this.reason);
        this.zingId = this.getInt();
        cc.log("ID " + this.zingId);
        this.userName = this.getString();
        this.avatar = "";
        cc.log("Name " + this.name);
    }
});


CmdReceivedDecorateBuy = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

    }
});

CmdReceivedDecorateUse = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.id = this.getInt();
        this.time = this.getDouble();
    }
});

CmdReceivedDecorateConfig = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.config = this.getString();
    }
});

CmdReceivedDecorateList = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        var length = this.getShort();
        this.arrayId = [];
        this.arrayTime = [];
        for (var i = 0; i < length; i++) {
            this.arrayId.push(this.getInt());
            this.arrayTime.push(this.getDouble());
        }
    }
});

// ------------- SEND -----------------------------
CmdSendBuyDecorateItem = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(DecorateManager.CMD_BUY_DECORATE_ITEM);
    },

    putData: function (id, type) {
        this.packHeader();
        this.putInt(id);
        this.putInt(type);
        this.updateSize();
    }
});

CmdSendUseDecorateItem = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(DecorateManager.CMD_USE_DECORATE_ITEM);
    },

    putData: function (id) {
        this.packHeader();
        this.putInt(id);
        this.updateSize();
    }
});

CmdSendConfigDecorateItem = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(DecorateManager.CMD_CONFIG_DECORATE_ITEM);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendListDecorateItem = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(DecorateManager.CMD_LIST_DECORATE_ITEM);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});


DecorateManager = cc.Class.extend({
    ctor: function() {
        this.reset();
        this.initDataDecorateDefault();
        if (Config.ENABLE_DECORATE_ITEM)
            this.preloadResource();
        this.arrayResource = ["cup", "Vietnam", "Duc", "Brazil", "Argentina", "Taybannha", "Anh", "Phap", "Nga", "Bodaonha", "Bi", "Balan", "Thuysi", "Croatia", "Colombia", "Mexico", "Uruguay",
        "Danmach", "Thuydien", "Aicap", "Nhat", "Hanquoc", "Peru", "Costarica", "Tunisia", "Senegal", "Iran", "Iceland", "Serbia", "Australia", "Maroc", "Panama", "ArapSaudi", "Nigeria"];

    },

    reset: function() {
        this.arrayDecorate = [];
        this.currentItem = -1;
        this.currentSelect = 0;
        this.notLoadConfig = true;
    },

    preloadResource : function () {
        // preload

      //  LocalizedString.add("Event/EggBreakerRes/EggLocalized_vi");
        LocalizedString.add("Lobby/DecorateItem/Res/Decorate_vi");

        db.DBCCFactory.getInstance().loadDragonBonesData("Lobby/DecorateItem/Res/IconFlag/skeleton.xml","IconFlag");
        db.DBCCFactory.getInstance().loadTextureAtlas("Lobby/DecorateItem/Res/IconFlag/texture.plist", "IconFlag");

        db.DBCCFactory.getInstance().loadDragonBonesData("Lobby/DecorateItem/Res/BtnWorldCup/skeleton.xml","BtnWorldCup");
        db.DBCCFactory.getInstance().loadTextureAtlas("Lobby/DecorateItem/Res/BtnWorldCup/texture.plist", "BtnWorldCup");
    },

    getResource: function (id) {
        cc.log("ID " + id);
        this.arrayString = [];
       // if (this.isFlag(id)) { // co
            this.arrayString.push("IconFlag");
            this.arrayString.push(this.arrayResource[id - 1]);
     //   }
        //else {
        //    switch (id) {
        //        case 1:
        //            this.arrayString.push("IconCup");
        //            this.arrayString.push("1");
        //            break;
        //    }
        //}
        return this.arrayString;
    },

    isFlag: function (id) {
        return !!(id >= DecorateManager.MIN_FLAG && id <= DecorateManager.MAX_FLAG);
    },

    initDataDecorateDefault: function() {
        for (var i = 0; i < 32; i++) {
            var data = {};
            data.id = i;
            if (Math.random() > 0.5)
                data.time = Math.floor(1000000 * Math.random());
            else
                data.time = 0;
            data.configGold = [10000, 20000, 30000];
            data.isUse = false;
            this.arrayDecorate.push(data);
        }
    },

    initDataDecorate: function(data) {
        this.arrayDecorate = [];
        var count = 0;
        for(var key in data){
            count = count + 1;
        }

        for (var i = 1; i <= count; i++) {
            var config = data["" + i];
            if (config["Enable"]) {
                var dataObject = {};
                dataObject.id = i;
                dataObject.time = 0;
                dataObject.configGold = [];
                dataObject.configTime = [];
                for (var j = 0; j < 3; j++) {
                    dataObject.configGold.push(config["Items"]["" + (j + 1)]["Cost"]);
                    dataObject.configTime.push(config["Items"]["" + (j + 1)]["Time"]);
                }
                dataObject.isUse = false;
                dataObject.name = config["Name"];
                this.arrayDecorate.push(dataObject);
            }
        }

        for (var i = 0; i < this.arrayDecorate.length; i++) {
            for (var j = 0; j < this.arrayDecorate.length; j++) {
                if (this.arrayDecorate[i].configGold[0] > this.arrayDecorate[j].configGold[0]) {
                    var temp = this.arrayDecorate[i];
                    this.arrayDecorate[i] = this.arrayDecorate[j];
                    this.arrayDecorate[j] = temp;
                }
            }
        }

        cc.log("DATA ************** " + JSON.stringify(this.arrayDecorate));
    },

    updateTime: function() {
        for (var i = 0; i < this.arrayDecorate.length; i++) {
            if (this.arrayDecorate[i].time > 0) {
                this.arrayDecorate[i].time = this.arrayDecorate[i].time - 1000;
                if (this.arrayDecorate[i].time <= 0) {
                    this.arrayDecorate[i].time = 0;
                    this.arrayDecorate[i].isUse = false;
                    if (this.arrayDecorate[i].id == this.currentItem) {
                        var guiItem = sceneMgr.getGUIByClassName(GUIDecorateItem.className);
                        guiItem.setItem(0);

                        var gui = sceneMgr.getRunningScene().getMainLayer();
                        if (gui instanceof LobbyScene) {
                            gui.updateItem(null);
                        }
                        this.currentItem = 0;
                    }
                }
            }
        }
    },

    sendGetConfig: function() {
        cc.log("SEND GET CONFIG ");
        var pk = new CmdSendConfigDecorateItem();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();

    },

    sendGetListItem: function() {
        var pkList = new CmdSendListDecorateItem();
        GameClient.getInstance().sendPacket(pkList);
        pkList.clean();
    },

    sendBuyItem: function(id, day) {
        var pk = new CmdSendBuyDecorateItem();
        pk.putData(id, day);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendUseItem: function(id) {
        var pk = new CmdSendUseDecorateItem();
        pk.putData(id);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    openDecorate: function () {
        if (this.notLoadConfig) {
            decorateManager.sendGetConfig();
            sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(5);
        }
        else {
            sceneMgr.openGUI(GUIDecorateItem.className, GUIDecorateItem.tag, GUIDecorateItem.tag);
        }
    },

    addDecoInGame: function(id, parent) {
        var oldItem = parent.getChildByTag(10);
        if (oldItem) {
            oldItem.removeFromParent(true);
        }

        if (id > 0) {
            var arrayResource = decorateManager.getResource(id);
            var item = db.DBCCFactory.getInstance().buildArmatureNode(arrayResource[0]);
            if (decorateManager.isFlag(id)) {
                item.setScale(0.5);
            }
            else {
                switch (id) {
                    case 1:
                        item.setScale(0.4);
                        break;
                }
            }

            item.gotoAndPlay(arrayResource[1], -1, -1, -1);
            parent.addChild(item);
            item.setTag(10);
        }
    },

    showEventButton: function (btn) {
        cc.log("SHOW EVENT BUTTON ");
        this.buttonLobby = btn;
        cc.log("SHOW EVENT BUTTON 1 ");
        if (this.buttonLobby.isVisible()) {
            this.effectEventButton();
        }
        else {
            this.buttonLobby.setVisible(true);
            this.buttonLobby.setScale(0);
            this.buttonLobby.runAction(cc.sequence(cc.EaseBackOut(new cc.ScaleTo(0.5, 1)), cc.callFunc(this.effectEventButton.bind(this))));
        }
    },

    effectEventButton: function () {
        cc.log("SHOW EVENT BUTTON 2 ");
        if (!this.buttonLobby) return;
        if(this.buttonLobby.anim) return;
        cc.log("SHOW EVENT BUTTON 3 ");
        this.buttonLobby.anim = db.DBCCFactory.getInstance().buildArmatureNode("BtnCup");
        if (this.buttonLobby.anim) {
            cc.log("SHOW EVENT BUTTON 4 ");
            this.buttonLobby.addChild(this.buttonLobby.anim);
            this.buttonLobby.anim.setPosition(this.buttonLobby.getContentSize().width / 1.25, this.buttonLobby.getContentSize().height / 1.5);
            this.buttonLobby.anim.getAnimation().gotoAndPlay("1", -1, -1, 0);
            //this.buttonLobby.anim.setScale(1.25);
        }
    },

    updateCurrentItem: function(time) {
        for (var i = 0; i < this.arrayDecorate.length; i++) {
            if (this.arrayDecorate[i].id == this.currentItem) {
                this.arrayDecorate[i].isUse = true;
                if (time)
                    this.arrayDecorate[i].time = time;
            }
            else {
                this.arrayDecorate[i].isUse = false;
            }
        }
    },

    updateItemLobby: function () {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        if (gui instanceof LobbyScene) {
            if (this.currentItem > 0) {
                var arrayResource = decorateManager.getResource(this.currentItem);
                var item = db.DBCCFactory.getInstance().buildArmatureNode(arrayResource[0]);
                if (decorateManager.isFlag(this.currentItem)) {
                    item.setScale(0.5);
                }
                else {
                    switch (this.currentItem) {
                        case 1:
                            item.setScale(0.4);
                            break;
                    }
                }

                item.gotoAndPlay(arrayResource[1], -1, -1, -1);
                gui.updateItem(item);
            }
            else {
                gui.updateItem(null);
            }
        }
    },

    onReceive: function (cmd, data) {
        if (!Config.ENABLE_DECORATE_ITEM) return;

        switch (cmd) {
            case DecorateManager.CMD_CONFIG_DECORATE_ITEM:
                var cmdConfig = new CmdReceivedDecorateConfig(data);
                var configGold = JSON.parse(cmdConfig.config);
                cc.log("CONIFG ITEM " + JSON.stringify(configGold));
                this.initDataDecorate(configGold);
                this.notLoadConfig = false;
                this.sendGetListItem();

                break;
            case DecorateManager.CMD_LIST_DECORATE_ITEM:
                var cmdList = new CmdReceivedDecorateList(data);
                cc.log("CMD_LIST_DECORATE_ITEM: " + JSON.stringify(cmdList));
                for (var i = 0; i < cmdList.arrayId.length; i++) {
                    for (var j = 0; j < this.arrayDecorate.length; j++) {
                        if (cmdList.arrayId[i] == this.arrayDecorate[j].id) {
                            this.arrayDecorate[j].time = cmdList.arrayTime[i];
                            //this.arrayDecorate[i].time = Math.random() * 10000;
                            break;
                        }
                    }
                }
                this.updateCurrentItem();
                sceneMgr.clearLoading();
                sceneMgr.openGUI(GUIDecorateItem.className, GUIDecorateItem.tag, GUIDecorateItem.tag);
                break;
            case DecorateManager.CMD_BUY_DECORATE_ITEM:
                var cmdBuy = new CmdReceivedDecorateBuy(data);
                ToastFloat.makeToast(ToastFloat.SHORT, localized("BUY_DECORATE_ERROR_" + cmdBuy.getError()));
                cc.log("CMD_BUY_DECORATE_ITEM " + JSON.stringify(cmdBuy));
                var gui = sceneMgr.getGUIByClassName(GUIBuyDecorateItem.className);
                var guiItem = sceneMgr.getGUIByClassName(GUIDecorateItem.className);
                if (cmdBuy.getError() == 0) {
                    if (gui && gui.isVisible()) {
                        gui.onBack();
                        guiItem.updateUserInfo();
                    }
                }
                break;
            case DecorateManager.CMD_USE_DECORATE_ITEM:
                var cmdUse = new CmdReceivedDecorateUse(data);
                this.currentItem = cmdUse.id;
                cc.log("CMD_USE_DECORATE_ITEM " + JSON.stringify(cmdUse));
                if (cmdUse.getError() == 0) {
                    this.updateItemLobby();
                    this.updateCurrentItem(cmdUse.time);
                }
                else {
                    ToastFloat.makeToast(ToastFloat.SHORT, localized("USE_DECORATE_ERROR_" + cmdUse.getError()));
                }
                var gui = sceneMgr.getGUIByClassName(GUIDecorateItem.className);

                if (gui && gui.isVisible()) {
                    gui.updatePosView();
                    gui.setItem(this.currentItem);
                }
                break;
        }
    }
});

DecorateManager.isInited = false;
DecorateManager.instance = null;
DecorateManager.getInstance = function () {
    if (DecorateManager.isInited == false) {
        DecorateManager.isInited = true;
        DecorateManager.instance = new DecorateManager();
    }
    return DecorateManager.instance;
};

var decorateManager = DecorateManager.getInstance();
DecorateManager.MAX_PREVENT = 50;

DecorateManager.CMD_BUY_DECORATE_ITEM = 4101;
DecorateManager.CMD_USE_DECORATE_ITEM = 4102;
DecorateManager.CMD_CONFIG_DECORATE_ITEM = 4100;
DecorateManager.CMD_LIST_DECORATE_ITEM = 4103;

DecorateManager.MIN_FLAG = 2;
DecorateManager.MAX_FLAG = 34;