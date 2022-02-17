/**
 *  Created by sonbnt on 24/08/2021
 */

var DailyPurchaseCell = BaseLayer.extend({
    ctor: function(dailyPurchaseGUI){
        this._super();
        this.setAnchorPoint(0, 0);
        this.setCascadeOpacityEnabled(true);

        this.dailyPurchaseGUI = dailyPurchaseGUI;
        this.dayIndex = -1;

        this._layout = ccs.load("Lobby/DailyPurchaseCell.json").node;
        this._layout.setAnchorPoint(0.5, 0.5);
        this._layout.ignoreAnchorPointForPosition(false);
        this.addChild(this._layout);
        this.initGUI();
    },

    initGUI: function(){
        this.bg = this.getControl("bg");
        this.bgHighlight = this.getControl("bgHighlight");
        this.title = this.getControl("title");
        this.lastDay = this.getControl("lastDay");

        this.pGold = this.getControl("pGold");
        this.txtGold = this.getControl("txt", this.pGold);
        this.txtGold.ignoreContentAdaptWithSize(true);
        this.pVPoint = this.getControl("pVPoint");
        this.txtVPoint = this.getControl("txt", this.pVPoint);
        this.txtVPoint.ignoreContentAdaptWithSize(true);
        this.pDiamond = this.getControl("pDiamond");
        this.txtDiamond = this.getControl("txt", this.pDiamond);
        this.txtDiamond.ignoreContentAdaptWithSize(true);
        this.pItem = this.getControl("pItem");
        this.iconItem = this.getControl("icon", this.pItem);
        this.shadowItem = this.getControl("shadow", this.pItem);
        this.txtItemName = this.getControl("name", this.pItem);
        this.txtItemDes = this.getControl("des", this.pItem);
        this.iconItem.ignoreContentAdaptWithSize(true);
        this.shadowItem.ignoreContentAdaptWithSize(true);
        this.txtItemName.ignoreContentAdaptWithSize(true);
        this.txtItemDes.ignoreContentAdaptWithSize(true);

        this.giftPosY = [
            this.pGold.getPositionY(),
            this.pVPoint.getPositionY(),
            this.pDiamond.getPositionY(),
            this.pItem.getPositionY()
        ];

        this.btnBuy = this.customButton("btnBuy", DailyPurchaseCell.BTN_BUY);
        this.btnBuy.setPressedActionEnabled(false);
        this.btnReceive = this.customButton("btnReceive", DailyPurchaseCell.BTN_RECEIVE);
        this.btnReceive.setPressedActionEnabled(false);
        this.txtMinMoney = this.getControl("price", this.btnBuy);
        this.txtMinMoney.ignoreContentAdaptWithSize(true);

        this.wrapPopular = this.getControl("wrapPopular");
        this.tagPopular = this.getControl("tagPopular", this.wrapPopular);

        this.imgHover = this.getControl("imgHover");
        this.imgReceived = this.getControl("imgReceived");

        this.layerEffect = new ccui.ImageView("Lobby/DailyPurchase/bgCell.png");
        this.layerEffect.setAnchorPoint(0.5, 0.5);
        this.layerEffect.setPosition(this.bg.getPosition());
        this.layerEffect.setOpacity(0);
        this._layout.addChild(this.layerEffect);

        this.effectHighlight0 = new ccui.ImageView("Lobby/DailyPurchase/bgCellHighlight.png");
        this.effectHighlight0.setAnchorPoint(0.5, 0.5);
        this.effectHighlight0.setPosition(this.bgHighlight.getPosition());
        this.effectHighlight0.setOpacity(0);
        this._layout.addChild(this.effectHighlight0);

        this.effectHighlight1 = new ccui.ImageView("Lobby/DailyPurchase/bgCellHighlight.png");
        this.effectHighlight1.setAnchorPoint(0.5, 0.5);
        this.effectHighlight1.setPosition(this.bgHighlight.getPosition());
        this.effectHighlight1.setOpacity(0);
        this._layout.addChild(this.effectHighlight1);
    },

    onEnterFinish: function(){
        this.setAnchorPoint(0, 0);
        this.btnReceive.stopAllActions();
        this.btnReceive.setScale(1);
        this.btnReceive.setOpacity(255);
        this.lastDay.stopAllActions();
        this.lastDay.setScale(1);
        this.lastDay.setOpacity(255);

        this.bg.setOpacity(255);
        this.bgHighlight.setOpacity(255);

        this.effectRunning = false;
    },

    onButtonRelease: function(button, id){
        switch(id){
            case DailyPurchaseCell.BTN_BUY:
                this.dailyPurchaseGUI.onTouchButtonBuy(this.dayIndex);
                break;
            case DailyPurchaseCell.BTN_RECEIVE:
                this.dailyPurchaseGUI.onTouchButtonReceive(this.dayIndex);
                break;
        }
    },

    setData: function(dayIndex){
        this.dayIndex = dayIndex;
        var gift = dailyPurchaseManager.getGift(this.dayIndex);

        var dayStatus = dailyPurchaseManager.getDayStatus(this.dayIndex);
        var isCurrentDay = dailyPurchaseManager.isCurrentDayIndex(this.dayIndex);
        var isLastDay = dailyPurchaseManager.isLastDayIndex(this.dayIndex);
        var isPopularDay = dailyPurchaseManager.isPopularDayIndex(this.dayIndex);
        this.title.setString("Ngày " + (this.dayIndex + 1));
        if (isLastDay && dayStatus != DailyPurchaseManager.DAY_RECEIVED){
            this.lastDay.setVisible(true);
            this.title.setTextColor(cc.color("#fdf0c6"));
        }
        else{
            this.lastDay.setVisible(false);
            this.title.setTextColor(cc.color("#8a2214"));
        }
        this.bg.setVisible(!isCurrentDay || dayStatus == DailyPurchaseManager.DAY_RECEIVED);
        this.bgHighlight.setVisible(isCurrentDay && dayStatus != DailyPurchaseManager.DAY_RECEIVED);
        if (isCurrentDay && dayStatus != DailyPurchaseManager.DAY_RECEIVED){
            this.effectRunning = true;
            this.setLocalZOrder(1);
            this.effectHighlight0.stopAllActions();
            this.effectHighlight0.runAction(cc.sequence(
                cc.hide(),
                cc.delayTime(2),
                cc.callFunc(function(){
                    if (this.effectRunning) {
                        this.effectHighlight0.setVisible(true);
                        this.effectHighlight0.setOpacity(150);
                        this.effectHighlight0.setScale(1);
                    }
                    else this.effectHighlight0.stopAllActions();
                }.bind(this)),
                cc.spawn(
                    cc.fadeOut(0.5),
                    cc.scaleTo(0.5, 1.25)
                ),
                cc.delayTime(0.3)
            ).repeatForever());
            this.effectHighlight1.stopAllActions();
            this.effectHighlight1.runAction(cc.sequence(
                cc.hide(),
                cc.delayTime(2.3),
                cc.callFunc(function(){
                    if (this.effectRunning) {
                        this.effectHighlight1.setVisible(true);
                        this.effectHighlight1.setOpacity(100);
                        this.effectHighlight1.setScale(1);
                    }
                    else this.effectHighlight1.stopAllActions();
                }.bind(this)),
                cc.spawn(
                    cc.fadeOut(0.5),
                    cc.scaleTo(0.5, 1.25)
                )
            ).repeatForever());
        }
        else{
            this.effectRunning = false;
            this.setLocalZOrder(0);
            this.effectHighlight0.stopAllActions();
            this.effectHighlight0.setOpacity(0);
            this.effectHighlight1.stopAllActions();
            this.effectHighlight1.setOpacity(0);
        }
        this.wrapPopular.setContentSize(this.wrapPopular.getContentSize().width, 0);
        this.tagPopular.stopAllActions();
        if (isPopularDay && (dayStatus == DailyPurchaseManager.DAY_OPENING || dayStatus == DailyPurchaseManager.DAY_UNOPENED)){
            var numFrames = 20;
            var duration = 0.2;

            var actions = [];
            actions.push(cc.delayTime(1.5));
            for (var i = 0; i < numFrames; i++){
                actions.push(cc.delayTime(duration/numFrames));
                actions.push(cc.callFunc(function(index){
                    this.wrapPopular.setContentSize(this.wrapPopular.getContentSize().width, this.tagPopular.getContentSize().height * (index + 1)/numFrames);
                }.bind(this, i)));
            }

            this.tagPopular.runAction(cc.sequence(actions));
        }
        this.imgHover.setVisible(dayStatus == DailyPurchaseManager.DAY_RECEIVED);
        this.imgReceived.setVisible(dayStatus == DailyPurchaseManager.DAY_RECEIVED);

        this.txtMinMoney.setString(StringUtility.pointNumber(gift.minMoney) + " VNĐ");
        this.btnReceive.setVisible(dayStatus == DailyPurchaseManager.DAY_WAITING);
        this.btnReceive.setTouchEnabled(dayStatus == DailyPurchaseManager.DAY_WAITING);
        this.btnBuy.setVisible(dayStatus == DailyPurchaseManager.DAY_UNOPENED || dayStatus == DailyPurchaseManager.DAY_OPENING);
        if (dayStatus == DailyPurchaseManager.DAY_OPENING){
            this.btnBuy.loadTextures("DailyPurchase/btnBuyEnable.png", "DailyPurchase/btnBuyEnable.png", "");
            this.txtMinMoney.setTextColor(cc.color("#ffffff"));
            this.txtMinMoney.enableOutline(cc.color("#3dbc18"), 1);
            this.txtMinMoney.setPosition(this.txtMinMoney.defaultPos);
        }
        else{
            this.btnBuy.loadTextures("DailyPurchase/btnBuyDisable.png", "DailyPurchase/btnBuyDisable.png", "");
            this.txtMinMoney.setTextColor(cc.color("#f79863"));
            this.txtMinMoney.disableEffect();
            this.txtMinMoney.setPosition(this.btnBuy.getContentSize().width/2, this.btnBuy.getContentSize().height/2);
        }

        this.setGiftInfo(gift.gold, gift.vPoint, gift.diamond, gift.items);
    },

    setGiftInfo: function(gold, vPoint, diamond, items){
        var count = 0;
        if (gold > 0){
            this.pGold.setVisible(true);
            this.pGold.setPositionY(this.giftPosY[count++]);
            this.txtGold.setString(StringUtility.formatNumberSymbol(gold));
        }
        else this.pGold.setVisible(false);
        if (vPoint > 0){
            this.pVPoint.setVisible(true);
            this.pVPoint.setPositionY(this.giftPosY[count++]);
            this.txtVPoint.setString(StringUtility.pointNumber(vPoint));
        }
        else this.pVPoint.setVisible(false);
        if (diamond > 0){
            this.pDiamond.setVisible(true);
            this.pDiamond.setPositionY(this.giftPosY[count++]);
            this.txtDiamond.setString(StringUtility.pointNumber(diamond));
        }
        else this.pDiamond.setVisible(false);

        if (items.length > 0){
            var item = items[0];
            var texture = StorageManager.getItemIconPath(item.type, item.subType, item.id);
            this.pItem.setVisible(true);
            this.pItem.setPositionY(this.giftPosY[count]);
            if (texture && texture != "") {
                this.iconItem.loadTexture(texture);
                this.shadowItem.loadTexture(texture);
                var scale = StorageManager.getItemIconScale(item.type) * 0.4;
                this.iconItem.setScale(scale);
                this.shadowItem.setScale(scale);
            }
            else{
                this.iconItem.loadTexture("");
                this.shadowItem.loadTexture("");
            }
            var itemName = StorageManager.getInstance().itemConfig ? StorageManager.getInstance().itemConfig[item.type][item.id].name : "";
            this.setLabelText(itemName, this.txtItemName);
            var des = "";
            switch(StorageManager.getItemUseType(item.type)){
                case StorageManager.USE_BY_TIME:
                    des = StorageManager.getInstance().getExpiredText(item.type, item.subType, item.id);
                    break;
                case StorageManager.USE_BY_UNIT:
                    des = "x " + StringUtility.pointNumber(item.num);
                    break;
                case StorageManager.USE_ONCE:
                    des = StorageManager.getInstance().getExpiredText(item.type, item.subType, item.id) + " x " + StringUtility.pointNumber(item.num);
                    break;
            }
            this.txtItemDes.setString(des);
        }
        else this.pItem.setVisible(false);
    },

    updateReceiveInfo: function(gift){
        var dayStatus = dailyPurchaseManager.getDayStatus(gift.dayIndex);
        var isCurrentDay = dailyPurchaseManager.isCurrentDayIndex(gift.dayIndex);
        var isLastDay = dailyPurchaseManager.isLastDayIndex(gift.dayIndex);

        this.title.setString("Ngày " + (gift.dayIndex + 1));
        if (isLastDay && dayStatus != DailyPurchaseManager.DAY_RECEIVED){
            this.lastDay.setVisible(true);
            this.title.setTextColor(cc.color("#fdf0c6"));
        }
        else{
            this.lastDay.setVisible(false);
            this.title.setTextColor(cc.color("#8a2214"));
        }
        this.bg.setVisible(!isCurrentDay || dayStatus == DailyPurchaseManager.DAY_RECEIVED);
        this.bgHighlight.setVisible(isCurrentDay && dayStatus != DailyPurchaseManager.DAY_RECEIVED);
        if (!isCurrentDay || dayStatus == DailyPurchaseManager.DAY_RECEIVED){
            this.bg.runAction(cc.fadeOut(0.5));
            this.bgHighlight.setVisible(true);
            this.bgHighlight.setOpacity(0);
            this.bgHighlight.runAction(cc.fadeIn(0.5));
        }

        this.wrapPopular.setContentSize(this.wrapPopular.getContentSize().width, 0);
        this.tagPopular.stopAllActions();
        this.imgHover.setVisible(false);
        this.imgReceived.setVisible(false);
        this.setGiftInfo(gift.gold, gift.vPoint, gift.diamond, gift.items);

        this.btnBuy.setVisible(false);
        this.btnBuy.setTouchEnabled(false);
        this.btnReceive.setVisible(true);
        this.btnReceive.setTouchEnabled(false);
        this.btnReceive.runAction(cc.spawn(
            cc.scaleTo(0.5, 0.5).easing(cc.easeBackIn()),
            cc.fadeOut(0.5)
        ));
    },

    effectReceive: function(){
        this.effectRunning = false;

        this.lastDay.stopAllActions();
        this.lastDay.runAction(cc.sequence(
            cc.spawn(
                cc.scaleTo(0.25, 0.5, 1).easing(cc.easeBackIn()),
                cc.fadeOut(0.25)
            ),
            cc.hide(),
            cc.callFunc(function(){
                this.lastDay.setScale(1);
                this.lastDay.setOpacity(255);
            }.bind(this))
        ));

        this.btnReceive.setTouchEnabled(false);
        this.btnReceive.stopAllActions();
        this.btnReceive.runAction(cc.sequence(
            cc.spawn(
                cc.scaleTo(0.25, 0.5).easing(cc.easeBackIn()),
                cc.fadeOut(0.25)
            ),
            cc.hide(),
            cc.callFunc(function(){
                this.btnReceive.setScale(1);
                this.btnReceive.setOpacity(255);
            }.bind(this))
        ));

        this.imgHover.setVisible(true);
        this.imgHover.setOpacity(0);
        this.imgHover.stopAllActions();
        this.imgHover.runAction(cc.fadeIn(0.5));

        this.imgReceived.setVisible(true);
        this.imgReceived.setOpacity(0);
        this.imgReceived.setScale(1.5);
        this.imgReceived.stopAllActions();
        this.imgReceived.runAction(cc.spawn(
            cc.fadeIn(0.5).easing(cc.easeSineIn()),
            cc.scaleTo(0.5, 1).easing(cc.easeSineIn())
        ));
    },

    getGoldIconPosition: function(){
        return this.pGold.convertToWorldSpace(this.pGold.getChildByName("icon").getPosition());
    },

    getVPointIconPosition: function(){
        return this.pVPoint.convertToWorldSpace(this.pVPoint.getChildByName("icon").getPosition());
    },

    getDiamondIconPosition: function(){
        return this.pDiamond.convertToWorldSpace(this.pDiamond.getChildByName("icon").getPosition());
    },

    getItemIconPosition: function(){
        return this.pItem.convertToWorldSpace(this.pItem.getChildByName("icon").getPosition());
    }
});
DailyPurchaseCell.BTN_BUY = 0;
DailyPurchaseCell.BTN_RECEIVE = 1;