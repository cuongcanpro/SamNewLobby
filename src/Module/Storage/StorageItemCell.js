var StorageItemCell = cc.TableViewCell.extend({
    ctor: function(numCol, itemScale, itemSpace, highlight, storageScene) {
        this.numCol = numCol;
        this.itemScale = itemScale;
        this.itemSpace = itemSpace;
        this.highlight = highlight;
        this.storageScene = storageScene;
        this._super(StorageItemCell.className);
        this.setCascadeOpacityEnabled(true);

        this._layout = new cc.Layer(StorageItemCell.WIDTH * this.itemScale * this.numCol + this.itemSpace * this.numCol, StorageItemCell.HEIGHT * this.itemScale + this.itemSpace);
        this._layout.setCascadeOpacityEnabled(true);
        for (var i = 0; i < this.numCol; i++){
            var itemNode = ccs.load("Lobby/UserItem.json").node;
            itemNode.setPosition(this.itemSpace + i * (this.itemSpace + StorageItemCell.WIDTH * this.itemScale), this.itemSpace/2);
            itemNode.setScale(this.itemScale);
            this._layout.addChild(itemNode, 0, i);
            itemNode.img = itemNode.getChildByName("img");
            itemNode.shadow = itemNode.getChildByName("shadow");
            itemNode.num = itemNode.getChildByName("num");
            itemNode.img.ignoreContentAdaptWithSize(true);
            itemNode.shadow.ignoreContentAdaptWithSize(true);
            itemNode.num.ignoreContentAdaptWithSize(true);
            itemNode.getChildByName("bg").setTouchEnabled(true);
            itemNode.getChildByName("bg").setSwallowTouches(false);
            itemNode.getChildByName("bg").addTouchEventListener(function(target, type){
                switch(type){
                    case ccui.Widget.TOUCH_BEGAN:
                        target.isWaitingTouch = true;
                        break;
                    case ccui.Widget.TOUCH_MOVED:
                        if (target.isWaitingTouch) {
                            var touchBeganPos = target.getTouchBeganPosition();
                            var touchMovePos = target.getTouchMovePosition();
                            if (Math.sqrt(Math.pow(touchMovePos.x - touchBeganPos.x, 2) + Math.pow(touchMovePos.y - touchBeganPos.y, 2)) > 2)
                                target.isWaitingTouch = false;
                        }
                        break;
                    case ccui.Widget.TOUCH_ENDED:
                        if (target.isWaitingTouch){
                            this.highlight.removeFromParent();
                            target.getParent().addChild(this.highlight);
                            this.storageScene.selectItem(this.getIdx() * this.numCol + target.getParent().getTag(), target.getParent());
                            this.storageScene.playSoundButton(-1);
                        }
                        break;
                    case ccui.Widget.TOUCH_CANCELED:
                        break;
                }
            }.bind(this), this);
        }
        this.addChild(this._layout);
    },

    setData: function(items){
        for (var i = 0; i < this.numCol; i++){
            var itemNode = this._layout.getChildByTag(i);
            if (i >= items.length) itemNode.setVisible(false);
            else{
                var item = items[i];
                itemNode.setVisible(true);
                itemNode.getChildByName("labelUsing").setVisible(!!item.isUsing);
                if (item.num != null) {
                    itemNode.num.setVisible(true);
                    itemNode.num.setString(item.num >= 0 ? StringUtility.standartNumber(item.num) : '\u221e');
                }
                else itemNode.getChildByName("num").setVisible(false);
                if (item.path && item.path != ""){
                    itemNode.img.setVisible(true);
                    itemNode.shadow.setVisible(true);
                    itemNode.img.loadTexture(item.path);
                    itemNode.shadow.loadTexture(item.path);
                    itemNode.img.setScale(item.scale);
                    itemNode.shadow.setScale(item.scale);
                }
                else{
                    itemNode.img.setVisible(false);
                    itemNode.shadow.setVisible(false);
                }
                if (item.isSelected){
                    this.highlight.removeFromParent();
                    itemNode.addChild(this.highlight, 0, "highlight");
                }
                else{
                    itemNode.removeChild(this.highlight);
                }
            }
        }
    }
});

StorageItemCell.className = "StorageItemCell";
StorageItemCell.WIDTH = 213;
StorageItemCell.HEIGHT = 309;
StorageItemCell.MIN_COL = 2;
StorageItemCell.MAX_COL = 3;
StorageItemCell.MIN_SPACE = 8;
StorageItemCell.MIN_SCALE = 0.75;
StorageItemCell.HIGHLIGHT_POS = cc.p(55, 56.25);
StorageItemCell.HIGHLIGHT_SCALE = 0.925;