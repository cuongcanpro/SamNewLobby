var ItemNotifyGUI = BaseLayer.extend({
    ctor: function() {
        this._super(ItemNotifyGUI.className);

        this.bg = null;
        this.text = null;
        this.listView = null;
        this.btnOK = null;
        this.cellCache = [];

        this.initWithBinaryFile("Lobby/ItemNotifyGUI.json");
    },

    initGUI: function() {
        this.bg = this.getControl("bg");
        this.text = this.getControl("text", this.bg);
        this.text.ignoreContentAdaptWithSize(true);
        this.btnOK = this.customButton("btnOK", ItemNotifyGUI.BTN_OK, this.bg);
        this.btnUse = this.customButton("btnUse", ItemNotifyGUI.BTN_USE, this.bg);
        this.listView = this.getControl("listView", this.bg);
        this.listView.setScrollBarEnabled(false);

        this.enableFog();
    },

    onEnterFinish: function() {
        this.setShowHideAnimate(this.bg, true);
    },

    onButtonRelease: function(button, id) {
        switch (id) {
            case ItemNotifyGUI.BTN_OK:
                this.onClose();
                break;
            case ItemNotifyGUI.BTN_USE:
                if (this.itemData) {
                    switch (this.itemData.type) {
                        case StorageManager.TYPE_AVATAR:
                            StorageManager.getInstance().sendUseItem(this.itemData.type, this.itemData.id, this.itemData.index);
                            break;
                        case StorageManager.TYPE_VOUCHER:
                            var voucherSubType = StorageManager.getInstance().getItemSubTypes(StorageManager.TYPE_VOUCHER, this.itemData.id)[0];
                            var curVoucher = StorageManager.getInstance().getCurrentVoucherBySubType(voucherSubType);
                            if (curVoucher != null) {
                                var confirmMess = "Bạn có chắc muốn sử dụng voucher này?\nVoucher cùng loại đang sử dung sẽ bị\nthay thế và xóa khỏi kho đồ.";
                                sceneMgr.showOkCancelDialog(confirmMess, this, function(id){
                                    if (id == Dialog.BTN_OK){
                                        StorageManager.getInstance().sendUseItem(this.itemData.type, this.itemData.id, this.itemData.index);
                                    }
                                }.bind(this));
                            }
                            else
                                StorageManager.getInstance().sendUseItem(this.itemData.type, this.itemData.id, this.itemData.index);
                            break;
                    }
                }
                this.onClose();
                break;
        }
    },

    show: function(data, type){
        this.text.setString(data.mess);
        var itemList = data.itemList;
        this.itemData = null;

        for (var i = 0; i < itemList.length; i++){
            var cell = this.getNewCell();
            var itemData = itemList[i];
            switch(itemData.type){
                case StorageManager.TYPE_AVATAR:
                    itemData.scale = 0.6;
                    break;
                case StorageManager.TYPE_INTERACTION:
                    itemData.scale = 1;
                    break;
                case StorageManager.TYPE_EMOTICON:
                    itemData.scale = 1;
                    break;
                case StorageManager.TYPE_VOUCHER:
                    itemData.scale = 0.75;
                    break;
            }
            cell.setData(itemData);
            this.listView.addChild(cell);
        }
        if (itemList.length < ItemNotifyGUI.MAX_ITEM){
            this.listView.setContentSize(cc.size(ItemNotifyCell.SIZE * itemList.length + this.listView.getItemsMargin() * (itemList.length - 1), ItemNotifyCell.SIZE));
            this.listView.setBounceEnabled(false);
        }
        else{
            this.listView.setContentSize(cc.size(ItemNotifyCell.SIZE * ItemNotifyGUI.MAX_ITEM + this.listView.getItemsMargin() * (ItemNotifyGUI.MAX_ITEM - 1), ItemNotifyCell.SIZE));
            this.listView.setBounceEnabled(true);
        }

        if (type == ItemNotifyGUI.TYPE_UNLOCK_ITEM){
            this.listView.setTouchEnabled(false);
            this.listView.jumpToLeft();
            for (var i = 0; i < this.listView.getItems().length; i++)
                this.listView.getItem(i).setLock();
            this.btnOK.setTouchEnabled(false);
            this.btnOK.setOpacity(0);
            this.btnOK.stopAllActions();
            this.btnUse.setTouchEnabled(false);
            this.btnUse.setOpacity(0);
            this.btnUse.stopAllActions();
            if (itemList.length == 1){
                this.itemData = itemList[0];
                switch(this.itemData.type){
                    case StorageManager.TYPE_AVATAR:
                        this.itemData.index = this.itemData.index || 0;
                        this.showBtnUse(this.itemData.id != StorageManager.getInstance().usingAvatarId);
                        break;
                    case StorageManager.TYPE_VOUCHER:
                        if (this.itemData.index)
                            this.showBtnUse(true);
                        break;
                    case StorageManager.TYPE_EMOTICON:
                    case StorageManager.TYPE_INTERACTION:
                        this.showBtnUse(false);
                        break;
                }
            }
            else this.showBtnUse(false);
            this.effectUnlock(0);
        }
        else {
            this.listView.setClippingEnabled(true);
            this.itemData = itemList[0];
            switch(this.itemData.type){
                case StorageManager.TYPE_AVATAR:
                    this.showBtnUse(this.itemData.id != StorageManager.getInstance().usingAvatarId);
                    break;
                case StorageManager.TYPE_VOUCHER:
                    this.showBtnUse(true);
                    break;
                case StorageManager.TYPE_EMOTICON:
                case StorageManager.TYPE_INTERACTION:
                    this.showBtnUse(false);
                    break;
            }
        }
    },

    getNewCell: function() {
        var cell;
        if (this.cellCache.length == 0){
            cell = new ItemNotifyCell();
            cell.retain();
        }
        else
            cell = this.cellCache.shift();
        cell.resetEffect();
        return cell;
    },

    effectUnlock: function(curIndex) {
        this.listView.setClippingEnabled(false);
        var numItem = this.listView.getItems().length;
        var count = 0;
        for (var i = 0; i < numItem; i++){
            var item = this.listView.getItem(i);
            if (i < curIndex || i >= curIndex + ItemNotifyGUI.MAX_ITEM) {
                if (curIndex > numItem - ItemNotifyGUI.MAX_ITEM)
                    item.setVisible(i >= numItem - ItemNotifyGUI.MAX_ITEM);
                else
                    item.setVisible(false);
            }
            else{
                item.setVisible(true);
                item.effectUnlock();
                count++;
            }
        }

        curIndex += count;
        if (curIndex < numItem){
            var nextCount = numItem - curIndex;
            var percent;
            if (nextCount < ItemNotifyGUI.MAX_ITEM)
                percent = 100;
            else{
                var nextIndex = curIndex + (ItemNotifyGUI.MAX_ITEM - 1)/2;
                percent = (ItemNotifyCell.SIZE/2 + nextIndex*(ItemNotifyCell.SIZE + this.listView.getItemsMargin()) - this.listView.width/2)
                    / (ItemNotifyCell.SIZE * numItem + this.listView.getItemsMargin() * (numItem-1) - this.listView.width) * 100;
            }
            this.runAction(cc.sequence(
                cc.delayTime(3),
                cc.callFunc(function(){
                    for (var i = 0; i < this.listView.getItems().length; i++){
                        this.listView.getItem(i).setVisible(true);
                    }
                    this.listView.setClippingEnabled(true);
                    this.listView.scrollToPercentHorizontal(percent, 0.25, true);
                }.bind(this)),
                cc.delayTime(0.25),
                cc.callFunc(function(){
                    this.effectUnlock(curIndex);
                }.bind(this))
            ));
        }
        else{
            this.btnOK.runAction(cc.sequence(
                cc.delayTime(3),
                cc.callFunc(function(){
                    this.listView.setTouchEnabled(true);
                    this.listView.setClippingEnabled(true);
                    this.listView.scrollToLeft(0.25, true);
                    for (var i = 0; i < this.listView.getItems().length; i++){
                        this.listView.getItem(i).setVisible(true);
                    }
                }.bind(this)),
                cc.fadeIn(0.25),
                cc.callFunc(function(){
                    this.setTouchEnabled(true);
                }.bind(this.btnOK))
            ));
            this.btnUse.runAction(cc.sequence(
                cc.delayTime(3),
                cc.fadeIn(0.25),
                cc.callFunc(function(){
                    this.setTouchEnabled(true);
                }.bind(this.btnUse))
            ));
        }
    },

    showBtnUse: function(show){
        this.btnUse.setVisible(show);
        if (show){
            this.btnUse.setPosition(this.btnUse.defaultPos);
            this.btnOK.setPosition(this.btnOK.defaultPos);
        }
        else this.btnOK.setPositionX(this.bg.width/2);
    },

    onExit: function() {
        this._super();
        for (var i = 0; i < this.listView.getItems().length; i++){
            this.cellCache.push(this.listView.getItem(i));
        }
        this.listView.removeAllChildren();
    }
});
ItemNotifyGUI.className = "ItemNotifyGUI";
ItemNotifyGUI.GUI_TAG = 3020;
ItemNotifyGUI.BTN_OK = 0;
ItemNotifyGUI.BTN_USE = 1;

ItemNotifyGUI.TYPE_BUY_ITEM = 0;
ItemNotifyGUI.TYPE_UNLOCK_ITEM = 1;
ItemNotifyGUI.MAX_ITEM = 3;

var ItemNotifyCell = ccui.Layout.extend({
    ctor: function() {
        this._super();
        this.setContentSize(ItemNotifyCell.SIZE, ItemNotifyCell.SIZE);
        this._layout = ccs.load("Lobby/ItemNotifyCell.json").node;

        this.padding = (ItemNotifyCell.SIZE - ItemNotifyCell.INNER_SIZE)/2;
        this._layout.setPosition(this.padding, this.padding);
        this.addChild(this._layout);

        this.bg = this._layout.getChildByName("bg");
        this.img = this.bg.getChildByName("img");
        this.img.ignoreContentAdaptWithSize(true);
        this.shadow = this.bg.getChildByName("shadow");
        this.shadow.ignoreContentAdaptWithSize(true);
        this.text = this.bg.getChildByName("text");
        this.text.ignoreContentAdaptWithSize(true);

        this.bgLock = this.bg.getChildByName("bgLock");
        this.lock = this.bg.getChildByName("lock");
        this.unlock = this.bg.getChildByName("unlock");
        this.unlock.defaultPosition = this.unlock.getPosition();
        this.light1 = this.bg.getChildByName("light1");
        this.light2 = this.bg.getChildByName("light2");
        this.light3 = this.bg.getChildByName("light3");

        this.effHL = db.DBCCFactory.getInstance().buildArmatureNode("Highlight");
        this.effHL.setPosition(this.bg.width/2, this.bg.height/2);
        this.bg.addChild(this.effHL);
        this.effHL.setCompleteListener(function(){
            this.setVisible(false);
        }.bind(this.effHL));
    },

    resetEffect: function() {
        this.bgLock.setVisible(false);
        this.bgLock.stopAllActions();
        this.lock.setVisible(false);
        this.lock.stopAllActions();
        this.unlock.setVisible(false);
        this.unlock.stopAllActions();
        this.light1.setVisible(false);
        this.light1.stopAllActions();
        this.light2.setVisible(false);
        this.light2.stopAllActions();
        this.light3.setVisible(false);
        this.light3.stopAllActions();

        this.effHL.setVisible(false);
        this.effHL.stopAllActions();
        this.stopAllActions();
    },

    setLock: function() {
        this.bgLock.setVisible(true);
        this.bgLock.setOpacity(255);
        this.lock.setVisible(true);
        this.lock.runAction(cc.sequence(
            cc.rotateTo(0.025, 10),
            cc.rotateTo(0.05, -10),
            cc.rotateTo(0.025, 0)
        ).repeatForever());
    },

    setData: function(itemData){
        this.img.loadTexture(itemData.path);
        this.shadow.loadTexture(itemData.path);
        this.img.setScale(itemData.scale);
        this.shadow.setScale(itemData.scale);

        this.text.setString(itemData.text);
    },

    effectUnlock: function() {
        this.bgLock.setVisible(true);
        this.bgLock.setOpacity(255);
        this.bgLock.runAction(cc.sequence(
            cc.delayTime(2),
            cc.fadeOut(1)
        ));

        this.lock.setVisible(true);
        this.lock.runAction(cc.sequence(
            cc.delayTime(1.5),
            cc.hide()
        ));

        this.unlock.setOpacity(255);
        this.unlock.setPosition(this.unlock.defaultPosition.x, this.unlock.defaultPosition.y + 10);
        this.unlock.runAction(cc.sequence(
            cc.delayTime(1.5),
            cc.show(),
            cc.spawn(
                cc.sequence(cc.delayTime(0.5), cc.fadeOut(1)),
                cc.moveBy(1.5, 0, -20)
            )
        ));

        this.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(function(){
                this.effHL.setVisible(true);
                this.effHL.gotoAndPlay("1", -1, -1, 1);
            }.bind(this))
        ));

        this.effHL.setOpacity(255);
        this.effHL.runAction(cc.sequence(
            cc.delayTime(2),
            cc.fadeOut(0.5)
        ));

        this.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function(){
                this.effectLight();
            }.bind(this))
        ));
    },

    effectLight: function() {
        this.light1.setVisible(true);
        this.light2.setVisible(true);
        this.light3.setVisible(true);

        this.light1.setOpacity(0);
        this.light1.setScale(0.4);
        this.light2.setOpacity(0);
        this.light2.setScale(0.8);
        this.light3.setOpacity(0);
        this.light3.setScale(0.8);

        this.light3.stopAllActions();
        this.light3.runAction(cc.rotateBy(2, 60));
        this.light3.runAction(cc.sequence(cc.fadeIn(1), cc.fadeOut(1)));

        this.light2.stopAllActions();
        this.light2.runAction(cc.rotateBy(2, 30));
        this.light2.runAction(cc.sequence(cc.fadeIn(1), cc.fadeOut(1)));

        this.light1.stopAllActions();
        this.light1.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(1.25, 0.8), cc.fadeIn(1.25)),
            cc.spawn(cc.scaleTo(0.75, 1), cc.fadeOut(0.75))
        ));
    }
});

ItemNotifyCell.SIZE = 110;
ItemNotifyCell.INNER_SIZE = 100;