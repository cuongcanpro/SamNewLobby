/**
 * Trong Moi mot Tab Payment se chua Mot PanelIapItem la list cac Goi Shop Gold, G
 */
var PanelIapItem = BaseLayer.extend({
    ctor: function () {
        this.tbList = null;
        this.srcList = [];
        this.itemType = -1;
        this.imgCaches = {};

        this._super("");
        this.tbList = new cc.TableView(this, cc.size(cc.winSize.width, ItemIapCell.HEIGHT_ITEM));
        this.tbList.setCascadeOpacityEnabled(true);
        this.tbList.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.tbList.setPosition(0, 0);
        this.tbList.setVerticalFillOrder(0);
        this.tbList.setDelegate(this);
        this.addChild(this.tbList);
        this.tbList.setOpacity(50);
        this.effectTime = 0;
        this.setCascadeOpacityEnabled(true);
    },

    onEnter: function () {
        this._super();
        if (!cc.sys.isNative) {
            this.tbList.setTouchEnabled(true);
        }
    },

    /**
     * Set Mang du lieu cho Panel nay, la mang du lieu ve cac goi Mua Gold, G, hay Ticket
     * @param type
     */
    setItemType: function (type) {
        cc.log("SELECT TYPE " + type);
        this.itemType = type;
        var data;
        if (type < Payment.BUY_TICKET_FROM) {
            data = shopData.getDataByPaymentId(type);
        } else {
            data = eventMgr.getDataPaymentById(type);
        }
        cc.log("DATA NE **:  " + type + "    " + JSON.stringify(data));
        if (data) {
            VipManager.setNextLevelVip(data);
            this.srcList = data;
            this.tbList.reloadData();
        }
    },

    effectTable: function () {
        var cells = this.tbList.getContainer().getChildren();
        for (var i = 0; i < cells.length; i++) {
            cells[i].setCascadeOpacityEnabled(true);
            cells[i].setOpacity(0);
            cells[i].y = -ItemIapCell.HEIGHT_ITEM * 0.25;
            cells[i].runAction(cc.sequence(
                cc.delayTime(0.075 * i),
                cc.spawn(
                    cc.fadeIn(0.25),
                    cc.moveTo(0.25, cells[i].x, 0).easing(cc.easeBackOut())
                )
            ));
        }
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        var info = this.srcList[idx];
        if (!cell) {
            cell = new ItemIapCell(this);
        }
        if (info.isOffer && idx == 0) {
            if (cell instanceof OfferIapCell) {

            } else {
                cell = new OfferIapCell(this);
            }
        } else {
            if (cell instanceof OfferIapCell) {
                cell = new ItemIapCell(this);
            }
        }
        this.srcList[idx].itemType = this.itemType;
        cell.setInfo(info);
        cell.setOpacity(255);
        cell.y = 0;

        cc.log("table at index: " + idx);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(ItemIapCell.WIDTH_ITEM, ItemIapCell.HEIGHT_ITEM);
    },

    numberOfCellsInTableView: function (table) {
        return this.srcList.length;
    },

    tableCellTouched: function (table, cell) {
        try {
            cc.log("##ShopIAP : " + this.itemType + " -> " + JSON.stringify(cell.info));
            if (cell.info.isOffer) {
                OfferManager.buyOffer(true, cell.info.offerId);
            }
            else {
                if(!cell.isTouchedBonus()) {
                    paymentMgr.initiatePayment(cell.info, this.itemType);
                }
            }
        } catch (e) {
            cc.log("Touch Item error " + e.stack);
        }
    },

    selectItem: function (info, type) {
        if (info.isOffer) {
            OfferManager.buyOffer(true, info.offerId);
            return;
        }
        paymentMgr.initiatePayment(info, type);
    },

    getTableView: function () {
        return this.tbList;
    }
});

PanelIapItem.HEIGHT_PANEL = 300;