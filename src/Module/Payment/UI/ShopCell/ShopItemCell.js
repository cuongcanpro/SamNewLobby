
/**
 * SHOP ITEM
 */

var ShopItemCell = cc.TableViewCell.extend({
    ctor: function(numCol, itemScale, itemSpace, highlight, tabItemPayment) {
        this._super(ShopItemCell.className);
        this.numCol = numCol;
        this.itemScale = itemScale;
        this.itemSpace = itemSpace;
        this.highlight = highlight;
        this.tabItemPayment = tabItemPayment;

        this._layout = new cc.Layer(ShopItemCell.WIDTH * this.itemScale * this.numCol + this.itemSpace * this.numCol, ShopItemCell.HEIGHT * this.itemScale + this.itemSpace);
        for (var i = 0; i < this.numCol; i++){
            var itemNode = ccs.load("Lobby/ShopItem.json").node;
            itemNode.setPosition(this.itemSpace + i * (this.itemSpace + ShopItemCell.WIDTH * this.itemScale), this.itemSpace/2);
            itemNode.setScale(this.itemScale);
            this._layout.addChild(itemNode, 0, i);
            itemNode.img = itemNode.getChildByName("img");
            itemNode.img.ignoreContentAdaptWithSize(true);
            itemNode.lbName = itemNode.getChildByName("lbName");
            itemNode.lbName.ignoreContentAdaptWithSize(true);
            itemNode.promoBg = itemNode.getChildByName("promoBg");
            itemNode.promo = itemNode.promoBg.getChildByName("promo");
            itemNode.promo.ignoreContentAdaptWithSize(true);
            itemNode.iconDiamond = itemNode.getChildByName("iconDiamond");
            itemNode.diamond = itemNode.iconDiamond.getChildByName("diamond");
            itemNode.diamond.ignoreContentAdaptWithSize(true);
            itemNode.iconLock = itemNode.getChildByName("iconLock");
            itemNode.condition = itemNode.iconLock.getChildByName("condition");
            itemNode.condition.ignoreContentAdaptWithSize(true);
            itemNode.iconLimit = itemNode.getChildByName("timeLimit");
            itemNode.iconLimit.setLocalZOrder(1);
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
                        if (target.isWaitingTouch)
                            this.tabItemPayment.selectItem(target.getParent().index, target.getParent());
                        break;
                    case ccui.Widget.TOUCH_CANCELED:
                        break;
                }
            }.bind(this), this);
        }
        this.addChild(this._layout);
    },

    setData: function(items) {
        for (var i = 0; i < this.numCol; i++){
            var itemNode = this._layout.getChildByTag(i);
            if (i >= items.length) itemNode.setVisible(false);
            else{
                var item = items[i];
                itemNode.setVisible(true);
                cc.log("DA TA ITEM **** " + JSON.stringify(item));
                itemNode.lbName.setString(item.name);
                if (item.path && item.path != ""){
                    itemNode.img.setVisible(true);
                    itemNode.img.loadTexture(item.path);
                    itemNode.img.setScale(item.scale);
                }
                else{
                    itemNode.img.setVisible(false);
                }
                itemNode.index = item.index;

                var conditions = [];
                for (var j = 0; j < item.data.conditions.length; j++){
                    var condition = item.data.conditions[j];
                    switch(condition.type){
                        case StorageManager.VIP_CONDITION:
                            if (VipManager.getInstance().getRealVipLevel() < condition.num)
                                conditions.push(condition);
                            break;
                        case StorageManager.LEVEL_CONDITION:
                            if (userMgr.getLevel() < condition.num)
                                conditions.push(condition);
                            break;
                    }
                }
                if (conditions.length == 0){
                    itemNode.iconLock.setVisible(false);
                    itemNode.iconDiamond.setVisible(true);
                    ShopItemCell.setDiamond(itemNode, item.data.options[item.selectedOption].price);
                }
                else{
                    itemNode.iconLock.setVisible(true);
                    itemNode.iconDiamond.setVisible(false);
                    ShopItemCell.setConditions(itemNode, conditions);
                }

                itemNode.iconLimit.setVisible(item.data.remainTime >= 0);
                if (item.data.remainTime >= 0){
                    itemNode.iconLimit.stopAllActions();
                    itemNode.iconLimit.setRotation(0);
                    itemNode.iconLimit.runAction(cc.sequence(
                        cc.rotateTo(0.1, -20), cc.rotateTo(0.1, 19), cc.rotateTo(0.1, -18), cc.rotateTo(0.1, 17),
                        cc.rotateTo(0.1, -16), cc.rotateTo(0.1, 15), cc.rotateTo(0.1, -14), cc.rotateTo(0.1, 13),
                        cc.rotateTo(0.1, -12), cc.rotateTo(0.1, 11), cc.rotateTo(0.1, -10), cc.rotateTo(0.1, 9),
                        cc.rotateTo(0.1, -8), cc.rotateTo(0.1, 7), cc.rotateTo(0.1, -6), cc.rotateTo(0.1, 5),
                        cc.rotateTo(0.1, -4), cc.rotateTo(0.1, 3), cc.rotateTo(0.1, -2), cc.rotateTo(0.1, 1),
                        cc.rotateTo(0.1, 0), cc.delayTime(2)
                    ).repeatForever());
                }

                var maxDiscount = 0;
                for (var j = 0; j < item.data.options.length; j++)
                    maxDiscount = Math.max(item.data.options[j]["discount"], maxDiscount);
                ShopItemCell.setDiscount(itemNode, maxDiscount);

                if (item.isSelected){
                    this.highlight.removeFromParent();
                    itemNode.addChild(this.highlight);
                }
                else{
                    itemNode.removeChild(this.highlight);
                }
            }
        }
    }
});
ShopItemCell.setDiscount = function(itemNode, discount) {
    if (discount <= 0)
        itemNode.promoBg.setVisible(false);
    else{
        itemNode.promoBg.setVisible(true);
        itemNode.promo.setString("-" + discount + "%");
    }
};
ShopItemCell.setConditions = function(itemNode, conditions){
    if (conditions.length == 0){
        itemNode.iconLock.setVisible(false);
        return;
    }
    var cond = conditions[0];
    var condStr = "";
    switch(cond.type){
        case StorageManager.VIP_CONDITION:
            condStr += "Vip ";
            break;
        case StorageManager.LEVEL_CONDITION:
            condStr += "Level ";
    }
    condStr += cond.num;
    itemNode.condition.setString(condStr);
    var w = itemNode.condition.x + itemNode.condition.getAutoRenderSize().width;
    var d = w/2 - itemNode.iconLock.width/2;
    itemNode.iconLock.setPositionX(itemNode.width/2 - d);
};
ShopItemCell.setDiamond = function(itemNode, price) {
    itemNode.diamond.setString(StringUtility.standartNumber(price));
    var w = itemNode.diamond.x + itemNode.diamond.getAutoRenderSize().width;
    var d = w/2 - itemNode.iconDiamond.width/2;
    itemNode.iconDiamond.setPositionX(itemNode.width/2 - d);
};
ShopItemCell.className = "ShopItemCell";
ShopItemCell.WIDTH = 213;
ShopItemCell.HEIGHT = 309;
ShopItemCell.MIN_COL = 4;
ShopItemCell.MAX_COL = 4;
ShopItemCell.MIN_SPACE = 15;
ShopItemCell.MIN_SCALE = 0.75;