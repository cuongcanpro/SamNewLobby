/**
 * Created by AnhLN6 on 8/18/2021
 * Define popups used in Lucky Bonus scene
 */

var NotEnoughGPopup = BaseLayer.extend({
    ctor: function(){
        this._super();
        this.initWithJsonFile("res/Lobby/GUILuckyBonusNotEnoughG.json");
    },

    initGUI: function(){
        this.bg = this.getControl("bg", this._layout);

        this.customButton("closeBtn", NotEnoughGPopup.BTN_CLOSE, this.bg);
        this.customButton("shopBtn", NotEnoughGPopup.BTN_SHOP, this.bg);

        this.enableFog();
    },

    onButtonRelease: function(btn, id){
        switch (id){
            case NotEnoughGPopup.BTN_CLOSE:
                this.onBack();
                break;

            case NotEnoughGPopup.BTN_SHOP:
                paymentMgr.openNapG();
                break;
        }
    },

    onBack: function(){
        this.onClose();
    }
});

//classname
NotEnoughGPopup.className = "NotEnoughGPopup";

//btn
NotEnoughGPopup.BTN_CLOSE = 1;
NotEnoughGPopup.BTN_SHOP = 2;

var PrizeDetailTableViewCell = cc.TableViewCell.extend({
    ctor: function(idx){
        this._super();

        this.bg = new ccui.ImageView("res/Lobby/GUILuckyBonus/popup/rowBg.png");
        this.bg.setName("bg");
        this.bg.setPosition(PrizeDetailPopup.ROW_BASE_POSITION);

        this.combination = new ccui.Layout();
        this.combination.setName("combination");
        this.combination.setContentSize(PrizeDetailPopup.ROW_COMBINATION_CONTENT_SIZE);
        this.combination.setPosition(PrizeDetailPopup.ROW_COMBINATION_POSITION);

        this.prizeFree = new ccui.ImageView("res/Lobby/GUILuckyBonus/5.png");
        this.prizeFree.setName("prizeFree");
        this.prizeFree.setPosition(PrizeDetailPopup.PRIZE_FREE_ICON_POSITION);

        this.prizeG = new ccui.ImageView("res/Lobby/GUILuckyBonus/5.png");
        this.prizeG.setName("prizeG");
        this.prizeG.setPosition(PrizeDetailPopup.PRIZE_G_ICON_POSITION);

        this.drawCombination(idx);
        this.drawPrizeFree(idx);
        this.drawPrizeG(idx);

        this.bg.addChild(this.combination);
        this.bg.addChild(this.prizeFree);
        this.bg.addChild(this.prizeG);
        this.addChild(this.bg);
    },

    setInfo: function(idx){
        this.combination.removeAllChildren();
        this.drawCombination(idx);
        this.drawPrizeFree(idx);
        this.drawPrizeG(idx);
    },

    drawPrizeFree: function(idx){
        this.prizeFree.removeAllChildren();
        var rowConfig = LuckyBonusManager.getInstance().rollResultConfig[idx];

        var value = new cc.LabelBMFont(this.formatTotalGoldValue(rowConfig.gold), "res/Lobby/GUILuckyBonus/popup/LBPopUpFont.fnt");
        value.setName("value");
        value.setScale(PrizeDetailPopup.PRIZE_VALUE_SCALE, PrizeDetailPopup.PRIZE_VALUE_SCALE);
        value.setAnchorPoint(PrizeDetailPopup.PRIZE_FREE_VALUE_ANCHOR);
        value.setPosition(PrizeDetailPopup.PRIZE_FREE_VALUE_POSITION);
        this.prizeFree.addChild(value);
    },

    drawPrizeG: function(idx){
        this.prizeG.removeAllChildren();
        var rowConfig = LuckyBonusManager.getInstance().rollResultConfig[idx];

        var labelValue = this.formatTotalGoldValue(rowConfig.gold * 20 * LuckyBonusManager.getInstance().gToGoldFactor);
        var value = new cc.LabelBMFont(labelValue, "res/Lobby/GUILuckyBonus/popup/LBPopUpFont.fnt");
        value.setName("value");
        value.setScale(PrizeDetailPopup.PRIZE_VALUE_SCALE, PrizeDetailPopup.PRIZE_VALUE_SCALE);
        value.setAnchorPoint(PrizeDetailPopup.PRIZE_G_VALUE_ANCHOR);
        value.setPosition(PrizeDetailPopup.PRIZE_G_VALUE_POSITION);
        this.prizeG.addChild(value);
    },

    drawCombination: function(idx){
        var rowConfig = LuckyBonusManager.getInstance().rollResultConfig[idx];
        var tokenPath = (rowConfig.item + 1).toString();

        //1 specific item, appears 3 times
        if (rowConfig.count === 3){
            for (var i = 0; i < 3; i++){
                var token = new ccui.ImageView("res/Lobby/GUILuckyBonus/token/" + tokenPath + ".png");
                token.setName("token_" + (i + 1).toString());
                token.setPosition(PrizeDetailPopup.TOKEN_BASE_POSITION);
                token.x += i * PrizeDetailPopup.TOKEN_POS_X_INCREMENT;
                token.setScale(PrizeDetailPopup.NORMAL_TOKEN_SCALE, PrizeDetailPopup.NORMAL_TOKEN_SCALE);
                this.combination.addChild(token);
            }
        }

        //1 specific item, appears 2 times, remaining item varies
        else if (rowConfig.count === 2){
            for (var i = 0; i < 2; i++){
                var token = new ccui.ImageView("res/Lobby/GUILuckyBonus/token/" + tokenPath + ".png");
                token.setName("token_" + (i + 1).toString());
                token.setPosition(PrizeDetailPopup.TOKEN_BASE_POSITION);
                token.x += i * PrizeDetailPopup.TOKEN_POS_X_INCREMENT;
                token.setScale(PrizeDetailPopup.NORMAL_TOKEN_SCALE, PrizeDetailPopup.NORMAL_TOKEN_SCALE);
                this.combination.addChild(token);
            }

            //remaining item can be anything
            if (rowConfig["startThirdItem"] === 0 && rowConfig["endThirdItem"] === 9){
                for (var i = 2; i < 3; i++){
                    var token = new ccui.ImageView("res/Lobby/GUILuckyBonus/token/0.png");
                    token.setName("token_" + (i + 1).toString());
                    token.setPosition(PrizeDetailPopup.TOKEN_BASE_POSITION);
                    token.x += i * PrizeDetailPopup.TOKEN_POS_X_INCREMENT;
                    token.setScale(PrizeDetailPopup.NORMAL_TOKEN_SCALE, PrizeDetailPopup.NORMAL_TOKEN_SCALE);
                    this.combination.addChild(token);
                }
            }

            //remaining item in range
            else {
                var tokenIndex = 3;
                for (var i = rowConfig["startThirdItem"]; i <= rowConfig["endThirdItem"]; i++){
                    var miniTokenPathIndex = (i + 1).toString();

                    var token = new ccui.ImageView("res/Lobby/GUILuckyBonus/token/" + miniTokenPathIndex + ".png");
                    token.setName("token_" + tokenIndex.toString());
                    token.setPosition(PrizeDetailPopup.TOKEN_BASE_POSITION);
                    token.x += 2 * PrizeDetailPopup.TOKEN_POS_X_INCREMENT;
                    token.setScale(PrizeDetailPopup.MULTI_TOKEN_SCALE, PrizeDetailPopup.MULTI_TOKEN_SCALE);

                    //draw 4 small token in stead of 1 big token
                    if (tokenIndex === 3){
                        token.x -= PrizeDetailPopup.MULTI_TOKEN_POSITION_OFFSET;
                        token.y += PrizeDetailPopup.MULTI_TOKEN_POSITION_OFFSET;
                    }
                    else if (tokenIndex === 4){
                        token.x += PrizeDetailPopup.MULTI_TOKEN_POSITION_OFFSET;
                        token.y += PrizeDetailPopup.MULTI_TOKEN_POSITION_OFFSET;
                    }
                    else if (tokenIndex === 5){
                        token.x += PrizeDetailPopup.MULTI_TOKEN_POSITION_OFFSET;
                        token.y -= PrizeDetailPopup.MULTI_TOKEN_POSITION_OFFSET;
                    }
                    else if (tokenIndex === 6){
                        token.x -= PrizeDetailPopup.MULTI_TOKEN_POSITION_OFFSET;
                        token.y -= PrizeDetailPopup.MULTI_TOKEN_POSITION_OFFSET;
                    }

                    this.combination.addChild(token);
                    tokenIndex += 1;
                }
            }
        }

        //1 specific item, appears 1 time
        else if (rowConfig.count === 1){
            for (var i = 0; i < 1; i++){
                var token = new ccui.ImageView("res/Lobby/GUILuckyBonus/token/" + tokenPath + ".png");
                token.setName("token_" + (i + 1).toString());
                token.setPosition(PrizeDetailPopup.TOKEN_BASE_POSITION);
                token.x += i * PrizeDetailPopup.TOKEN_POS_X_INCREMENT;
                token.setScale(PrizeDetailPopup.NORMAL_TOKEN_SCALE, PrizeDetailPopup.NORMAL_TOKEN_SCALE);
                this.combination.addChild(token);
            }
            for (var i = 1; i < 3; i++){
                var token = new ccui.ImageView("res/Lobby/GUILuckyBonus/token/0.png");
                token.setName("token_" + (i + 1).toString());
                token.setPosition(PrizeDetailPopup.TOKEN_BASE_POSITION);
                token.x += i * PrizeDetailPopup.TOKEN_POS_X_INCREMENT;
                token.setScale(PrizeDetailPopup.NORMAL_TOKEN_SCALE, PrizeDetailPopup.NORMAL_TOKEN_SCALE);
                this.combination.addChild(token);
            }
        }

        //any non-special combination
        else if (rowConfig.count === 0){
            for (var i = 0; i < 3; i++){
                var token = new ccui.ImageView("res/Lobby/GUILuckyBonus/token/0.png");
                token.setName("token_" + (i + 1).toString());
                token.setPosition(PrizeDetailPopup.TOKEN_BASE_POSITION);
                token.x += i * PrizeDetailPopup.TOKEN_POS_X_INCREMENT;
                token.setScale(PrizeDetailPopup.NORMAL_TOKEN_SCALE, PrizeDetailPopup.NORMAL_TOKEN_SCALE);
                this.combination.addChild(token);
            }
        }
    },

    formatTotalGoldValue: function(value){
        var totalGold = value;
        var resultString = "";

        while (Math.floor(totalGold / 1000) !== 0){
            var addedString = (totalGold % 1000).toString();
            while (addedString.length < 3){
                addedString = "0" + addedString;
            }
            resultString = "." + addedString + resultString;
            totalGold = Math.floor(totalGold / 1000);
        }

        resultString = (totalGold % 1000).toString() + resultString;
        return resultString;
    },
});

var PrizeDetailPopup = BaseLayer.extend({
    ctor: function(){
        this._super();
        this.initWithJsonFile("res/Lobby/GUILuckyBonusRewardInfo.json");
    },

    initGUI: function(){
        this.bg = this.getControl("bg", this._layout);

        this.customButton("closeBtn", NotEnoughGPopup.BTN_CLOSE, this.bg);

        this.enableFog();

        this.loadPrizeDetail();
    },

    loadPrizeDetail: function(){
        this.prizeDetail = this.getControl("prizeDetail", this.bg);

        var prizeDetailTableView = new cc.TableView(this, cc.size(PrizeDetailPopup.TABLE_WIDTH, PrizeDetailPopup.TABLE_HEIGHT));
        prizeDetailTableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        prizeDetailTableView.setAnchorPoint(0, 0);
        prizeDetailTableView.x = 0;
        prizeDetailTableView.y = 0;
        prizeDetailTableView.setDelegate(this);
        prizeDetailTableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.prizeDetail.addChild(prizeDetailTableView);
        prizeDetailTableView.reloadData();
    },

    tableCellAtIndex: function(table, idx){
        var cell = table.dequeueCell();
        var str = idx.toFixed(0);
        if (!cell){
            cell = new PrizeDetailTableViewCell(str);
        }
        else {
            cell.setInfo(str);
        }
        return cell;
    },

    tableCellSizeForIndex: function(table, idx){
        return PrizeDetailPopup.TABLE_CELL_SIZE;
    },

    numberOfCellsInTableView: function(table, idx){
        return LuckyBonusManager.getInstance().rollResultConfig.length;
    },

    onButtonRelease: function(btn, id){
        switch (id){
            case PrizeDetailPopup.BTN_CLOSE:
                this.onBack();
                break;
        }
    },
    
    onBack: function(){
        this.onClose();
    }
});

//classname list
PrizeDetailPopup.className = "PrizeDetailPopup";

//btn
PrizeDetailPopup.BTN_CLOSE = 1;

//row position config
PrizeDetailPopup.TOKEN_SIZE = cc.size(100, 100);
PrizeDetailPopup.TOKEN_BASE_POSITION = cc.p(25, 25);
PrizeDetailPopup.TOKEN_POS_X_INCREMENT = 60;
PrizeDetailPopup.NORMAL_TOKEN_SCALE = 0.5;
PrizeDetailPopup.MULTI_TOKEN_POSITION_OFFSET = 12.5;
PrizeDetailPopup.MULTI_TOKEN_SCALE = 0.2;

PrizeDetailPopup.ROW_BASE_POSITION = cc.p(262.5, 28.5);
PrizeDetailPopup.ROW_COMBINATION_CONTENT_SIZE = cc.size(175, 47);
PrizeDetailPopup.ROW_COMBINATION_POSITION = cc.p(5, 5);
PrizeDetailPopup.ROW_HEIGHT = 60;

PrizeDetailPopup.PRIZE_FREE_ICON_POSITION = cc.p(205, 30);
PrizeDetailPopup.PRIZE_FREE_VALUE_POSITION = cc.p(27.6, 13);
PrizeDetailPopup.PRIZE_FREE_VALUE_ANCHOR = cc.p(0, 0.5);
PrizeDetailPopup.PRIZE_G_ICON_POSITION = cc.p(365, 30);
PrizeDetailPopup.PRIZE_G_VALUE_POSITION = cc.p(28.6, 13);
PrizeDetailPopup.PRIZE_G_VALUE_ANCHOR = cc.p(0, 0.5);
PrizeDetailPopup.PRIZE_VALUE_SCALE = 0.6;

PrizeDetailPopup.TABLE_WIDTH = 525;
PrizeDetailPopup.TABLE_HEIGHT = 250;
PrizeDetailPopup.TABLE_CELL_SIZE = cc.size(525, 60);





