var StorageCheatGUI = BaseLayer.extend({
    ctor: function() {
        this._super(StorageCheatGUI.className);
        this.initWithBinaryFile("Lobby/StorageCheatGUI.json");
    },

    initGUI: function() {
        this.bg = this.getControl("bg");
        this.btnClose = this.customButton("btnClose", StorageCheatGUI.BTN_CLOSE);
        this.btnHelp = this.customButton("btnHelp", StorageCheatGUI.BTN_HELP);
        this.btnAdd = this.customButton("btnAdd", StorageCheatGUI.BTN_ADD);
        this.btnSub = this.customButton("btnSub", StorageCheatGUI.BTN_SUB);
        this.btnReset = this.customButton("btnReset", StorageCheatGUI.BTN_RESET);
        this.btnClear = this.customButton("btnClear", StorageCheatGUI.BTN_CLEAR);
        this.btnSelectCurrent = this.customButton("btnSelectCurrent", StorageCheatGUI.BTN_SELECT_CURRENT);

        this.selectBox = this.getControl("selectBox");
        this.selectBox.addTouchEventListener(function(panel, type){
            if (type == ccui.Widget.TOUCH_ENDED) {
                panel.listOption.setVisible(!panel.listOption.isVisible());
                panel.btnExpand.setRotation(180 - panel.btnExpand.getRotation());
            }
        }, this);
        this.selectBox.listOption = this.getControl("listOption", this.selectBox);
        this.selectBox.listOption.setScrollBarEnabled(false);
        this.selectBox.selectedType = this.getControl("textSelected", this.selectBox);
        this.selectBox.selectedType.ignoreContentAdaptWithSize(true);
        this.selectBox.btnExpand = this.getControl("btnExpand", this.selectBox);

        this.listItem = this.getControl("listItem");
        this.listItem.setScrollBarEnabled(false);
        this.listItem.setClippingEnabled(true);
        this.listItem.setItemsMargin(0);
        this.listItem.addEventListener(function(listView, type){
            if (type == ccui.ListView.ON_SELECTED_ITEM_END)
                this.selectId(listView.getItem(listView.getCurSelectedIndex()).id);
        }.bind(this), this);
        this.itemCells = [];

        this.textDiamond = this.getControl("textDiamond");

        this.currentNum = this.getControl("textCurrentNum");
        this.currentNum.ignoreContentAdaptWithSize(true);
        this.currentTime = this.getControl("textCurrentTime");
        this.currentTime.ignoreContentAdaptWithSize(true);
        this.boxUnlocked = this.getControl("boxUnlocked");
        this.boxUnlocked.setTouchEnabled(false);
        this.boxHad = this.getControl("boxHad");
        this.boxHad.setTouchEnabled(false);

        this.textNum = this.getControl("textNum");
        this.textTime = this.getControl("textTime");
        this.pPreview = this.getControl("pPreview");
        this.pHelp = this.getControl("pHelp");
        this.enableFog();
    },

    onEnterFinish: function() {
        this.selectedType = -1;
        //load tab
        this.selectBox.listOption.removeAllChildren();
        var itemConfig = StorageManager.getInstance().itemConfig;
        cc.log("itemConfig", JSON.stringify(itemConfig));
        if (itemConfig){
            for (var type in itemConfig){
                var panel = new ccui.Layout();
                panel.setContentSize(this.selectBox.getContentSize());
                panel.type = type;
                panel.setTouchEnabled(true);
                panel.addTouchEventListener(function(panel, type){
                    if (type == ccui.Widget.TOUCH_ENDED)
                        this.selectType(panel.type);
                }.bind(this), this);
                cc.log("WHY IS THIS WRONG", StorageCheatGUI.TYPE_NAMES[type]);
                var text = new ccui.Text(
                    StorageCheatGUI.TYPE_NAMES[type]? StorageCheatGUI.TYPE_NAMES[type] : "Unknow",
                    "res/fonts/tahomabd.ttf",
                    20
                );
                text.setAnchorPoint(0, 0.5);
                text.setPosition(10, panel.height/2);
                panel.addChild(text);
                this.selectBox.listOption.pushBackCustomItem(panel);
            }
        }

        this.clearCheat();
    },

    onButtonRelease: function(button, id){
        switch(id){
            case StorageCheatGUI.BTN_CLOSE:
                this.onBack();
                break;
            case StorageCheatGUI.BTN_ADD:
                this.sendCheat(1);
                break;
            case StorageCheatGUI.BTN_SUB:
                this.sendCheat(-1);
                break;
            case StorageCheatGUI.BTN_RESET:
                StorageManager.getInstance().sendCheatReset();
                break;
            case StorageCheatGUI.BTN_CLEAR:
                this.clearCheat();
                break;
            case StorageCheatGUI.BTN_SELECT_CURRENT:
                var scene = sceneMgr.getMainLayer();
                if (scene instanceof StorageScene){
                    if (scene.selectedTab != -1 && scene.selectedItem[scene.selectedTab] != -1)
                        this.setData(scene.itemData[scene.selectedTab][scene.selectedItem[scene.selectedTab]]);
                    else this.setData(null);
                }
                break;
            case StorageCheatGUI.BTN_HELP:
                this.pHelp.setVisible(!this.pHelp.isVisible());
                break;
        }
    },

    onBack: function(){
        this.removeFromParent();
    },

    onExit: function(){
        this._super();
        this.resetListItem();
    },

    selectType: function(type){
        this.selectedType = type;
        this.selectBox.listOption.setVisible(false);
        this.selectBox.btnExpand.setRotation(0);
        this.selectBox.selectedType.setString(type != -1 ? StorageCheatGUI.TYPE_NAMES[type] : "Select type");

        this.resetListItem();
        var itemConfig = StorageManager.getInstance().itemConfig;
        if (itemConfig && type != -1){
            var typeConfig = itemConfig[type];
            for (var id in typeConfig){
                if (!typeConfig[id].enable) continue;
                var cell;
                if (this.itemCells.length > 0) cell = this.itemCells.shift();
                else{
                    var cell = new ccui.Layout();
                    cell.setContentSize(cc.size(120, 120));
                    cell._layout = ccs.load("Lobby/UserItem.json").node;
                    cell._layout.setAnchorPoint(0.5, 0.5);
                    cell._layout.setPosition(60, 60);
                    cell._layout.getChildByName("bg").setSwallowTouches(false);
                    cell._layout.getChildByName("labelUsing").setVisible(false);
                    cell._layout.getChildByName("num").setVisible(false);
                    cell._layout.getChildByName("img").ignoreContentAdaptWithSize(true);
                    cell._layout.getChildByName("shadow").ignoreContentAdaptWithSize(true);
                    cell.setTouchEnabled(true);
                    cell.setSwallowTouches(false);
                    cell.addChild(cell._layout);
                    cell.retain();
                }
                cell.id = id;
                var path = StorageManager.getItemIconPath(type, null, id);
                if (path && path != ""){
                    cell._layout.getChildByName("img").setVisible(true);
                    cell._layout.getChildByName("shadow").setVisible(true);
                    cell._layout.getChildByName("img").loadTexture(path);
                    cell._layout.getChildByName("shadow").loadTexture(path);
                    var scale = 1;
                    switch(Number(type)){
                        case StorageManager.TYPE_AVATAR:
                            scale = 0.5; break;
                        case StorageManager.TYPE_INTERACTION:
                            scale = 0.8; break;
                        case StorageManager.TYPE_EMOTICON:
                            scale = 0.8; break;
                        case StorageManager.TYPE_VOUCHER:
                            scale = 0.75; break;
                    }
                    cell._layout.getChildByName("img").setScale(scale);
                    cell._layout.getChildByName("shadow").setScale(scale);
                }
                else{
                    cell._layout.getChildByName("img").setVisible(false);
                    cell._layout.getChildByName("shadow").setVisible(false);
                }
                this.listItem.pushBackCustomItem(cell);
            }
        }
        this.selectId(-1);
    },

    selectId: function(id){
        if (id == -1)
            this.setData(null);
        else
            this.setData({type: this.selectedType, id: id, index: -1});
    },

    setData: function(data){
        this.data = data;
        this.currentNum.setString("");
        this.currentTime.setString("");
        this.boxUnlocked.setSelected(false);
        this.boxHad.setSelected(false);
        this.textNum.setString("");
        this.textTime.setString("");
        this.pPreview.removeAllChildren();
        if (!this.data) return;

        var sprite = new cc.Sprite(StorageManager.getItemIconPath(this.data.type, null, this.data.id));
        switch(Number(this.data.type)){
            case StorageManager.TYPE_AVATAR: sprite.setScale(1); break;
            case StorageManager.TYPE_INTERACTION: sprite.setScale(1.5); break;
            case StorageManager.TYPE_EMOTICON: sprite.setScale(1.5); break;
            case StorageManager.TYPE_VOUCHER: sprite.setScale(1.25); break;
        }
        sprite.setPosition(this.pPreview.width/2, this.pPreview.height/2);
        this.pPreview.addChild(sprite);

        var itemConfig = StorageManager.getInstance().itemConfig[this.data.type][this.data.id];
        this.boxUnlocked.setSelected(vipMgr.getRealVipLevel() >= itemConfig.vip && gamedata.userData.level >= itemConfig.level);
        if (this.data.index >= 0){
            this.boxHad.setSelected(true);
            var itemInfo = StorageManager.getInstance().userItemInfo[this.data.type][this.data.id][this.data.index];
            this.currentNum.setString(itemInfo.num < 0 ? '\u221e' : itemInfo.num);
            if (itemInfo.remainTime < 0) this.currentTime.setString('\u221e');
            else {
                var s = Math.ceil(itemInfo.remainTime/1000);
                var m = Math.floor(s/60);
                s -= m * 60;
                var h = Math.floor(m/60);
                m -= h * 60;
                var d = Math.floor(h/24);
                h -= d * 24;
                this.currentTime.setString(d + "d" + h + "h" + m + "p" + s + "s");
            }
        }
    },

    resetListItem: function(){
        for (var i = 0; i < this.listItem.getItems().length; i++){
            this.itemCells.push(this.listItem.getItem(i));
        }
        this.listItem.removeAllChildren();
    },

    sendCheat: function(offset){
        if (this.textDiamond.getString() != ""){
            var diamond = parseInt(this.textDiamond.getString());
            if (!isNaN(diamond))
                StorageManager.getInstance().sendCheatDiamond(diamond * offset);
        }
        if (this.data){
            var num = parseInt(this.textNum.getString());
            num = offset * (isNaN(num) ? 0 : num);
            var remainTime = this.textTime.getString();
            var match;
            if (remainTime == "") remainTime = 0;
            else if (remainTime.match(/^[0-9]+$/))
                remainTime = parseInt(remainTime) * 1000 * offset;
            else if ((match = remainTime.match(/^(?:([0-9]+)d)?(?:([0-9]+)h)?(?:([0-9]+)p)?(?:([0-9]+)s)?$/))){
                var d = match[1] ? parseInt(match[1]) : 0;
                var h = match[2] ? parseInt(match[2]) : 0;
                var m = match[3] ? parseInt(match[3]) : 0;
                var s = match[4] ? parseInt(match[4]) : 0;
                remainTime = (((d * 24 + h) * 60 + m) * 60 + s) * 1000 * offset;
            }
            StorageManager.getInstance().sendCheatItem(this.data.type, this.data.id, this.data.index, num, remainTime);
        }

        this.clearCheat();
    },

    clearCheat: function(){
        this.textDiamond.setString("");
        this.currentNum.setString("");
        this.currentTime.setString("");
        this.boxUnlocked.setSelected(false);
        this.boxHad.setSelected(false);
        this.textNum.setString("");
        this.textTime.setString("");
        this.pHelp.setVisible(false);


        this.selectType(this.selectedType);
    }
});
StorageCheatGUI.className = "StorageCheatGUI";
StorageCheatGUI.BTN_CLOSE = 0;
StorageCheatGUI.BTN_HELP = 1;
StorageCheatGUI.BTN_ADD = 2;
StorageCheatGUI.BTN_SUB = 3;
StorageCheatGUI.BTN_RESET = 4;
StorageCheatGUI.BTN_CLEAR = 5;
StorageCheatGUI.BTN_SELECT_CURRENT = 6;

StorageCheatGUI.TYPE_NAMES = {};
StorageCheatGUI.TYPE_NAMES[StorageManager.TYPE_AVATAR] = "Avatar";
StorageCheatGUI.TYPE_NAMES[StorageManager.TYPE_INTERACTION] = "Interaction";
StorageCheatGUI.TYPE_NAMES[StorageManager.TYPE_EMOTICON] = "Emoticon";
StorageCheatGUI.TYPE_NAMES[StorageManager.TYPE_VOUCHER] = "Voucher";