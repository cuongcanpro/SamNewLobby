var UserDetailInfo = cc.Node.extend({
    ctor: function () {
        this._super();
        var itemNode = ccs.load("Lobby/UserDetailInfo.json").node;
        //itemNode.setPosition(this.itemSpace + i * (this.itemSpace + StorageItemCell.WIDTH * this.itemScale), this.itemSpace/2);
        this.addChild(itemNode, 0, i);
        this.pInfo = itemNode;
        this.setContentSize(itemNode.getContentSize());
        this.initGUI();
    },
    initGUI: function () {
        this.btnGold = this.pInfo.getChildByName("btnGold");
        this.btnCoin = this.pInfo.getChildByName("btnCoin");
        this.btnDiamond = this.pInfo.getChildByName("btnDiamond");
        this.btnGold.addClickEventListener(this.clickBtnGold.bind(this));
        this.btnCoin.addClickEventListener(this.clickBtnCoin.bind(this));

        this.lbGold = this.btnGold.getChildByName("lb");
        this.lbCoin = this.btnCoin.getChildByName("lb");
        this.lbDiamond = this.btnDiamond.getChildByName("lb");

        this.imgGold = this.btnGold.getChildByName("icon");
        this.imgCoin = this.btnCoin.getChildByName("icon");
        this.imgDiamond = this.btnDiamond.getChildByName("icon");
    },

    clickBtnGold: function () {
        paymentMgr.openShop();
    },

    clickBtnCoin: function () {
        paymentMgr.openNapG();
    },

    updateToCurrentData: function () {
        this.updateGold(userMgr.getGold());
        this.updateCoin(userMgr.getCoin());
        this.updateDiamond(userMgr.getDiamond());
    },

    getGold: function () {
        return this.lbGold.gold;
    },

    getDiamond: function () {
        return this.lbDiamond.diamond;
    },

    getCoin: function () {
        return this.lbCoin.coin;
    },

    updateGold: function (gold) {
        this.lbGold.gold = gold;
        if (this.lbGold) this.lbGold.setString(StringUtility.pointNumber(this.lbGold.gold));
    },

    updateDiamond: function (diamond) {
        this.lbDiamond.diamond = diamond;
        if (this.lbDiamond) this.lbDiamond.setString(StringUtility.pointNumber(this.lbDiamond.diamond));
    },

    updateCoin: function (coin) {
        this.lbCoin.coin = coin;
        if (this.lbCoin) this.lbCoin.setString(StringUtility.pointNumber(this.lbCoin.coin));
    },

    getPosGold: function () {
        return this.imgGold.convertToWorldSpace(cc.p(this.imgGold.getContentSize().width * 0.5, this.imgGold.getContentSize().height * 0.5));
    },

    getPosCoin: function () {
        return this.imgCoin.convertToWorldSpace(cc.p(this.imgCoin.getContentSize().width * 0.5, this.imgCoin.getContentSize().height * 0.5));
    },

    getPosDiamond: function () {
        return this.imgDiamond.convertToWorldSpace(cc.p(this.imgDiamond.getContentSize().width * 0.5, this.imgDiamond.getContentSize().height * 0.5));
    },

    getPositionComponent: function (type) {
        switch (type) {
            case UserMgr.TYPE_DATA_GOLD:
                return this.getPosGold();
                break;
            case UserMgr.TYPE_DATA_COIN:
                return this.getPosCoin();
                break;
            case UserMgr.TYPE_DATA_DIAMOND:
                return this.getPosDiamond();
                break;
        }
    },

    getValue: function (type) {
        switch (type) {
            case UserMgr.TYPE_DATA_GOLD:
                return this.getGold();
                break;
            case UserMgr.TYPE_DATA_COIN:
                return this.getCoin();
                break;
            case UserMgr.TYPE_DATA_DIAMOND:
                return this.getDiamond();
                break;
        }
    },

    effectRunLabel: function (type, end, delayTime) {
        var lb;
        var start;
        switch (type) {
            case UserMgr.TYPE_DATA_GOLD:
                lb = this.lbGold;
                start = this.getGold();
                this.updateGold(end);
                break;
            case UserMgr.TYPE_DATA_COIN:
                lb = this.lbCoin;
                start = this.getCoin();
                this.updateCoin(end);
                break;
            case UserMgr.TYPE_DATA_DIAMOND:
                lb = this.lbDiamond;
                start = this.getDiamond();
                this.updateDiamond(end);
                break;
        }
        effectMgr.runLabelPoint(lb, start, end, delayTime, 50, EffectMgr.LABEL_RUN_NUMBER);

    },
})

UserDetailInfo.BTN_GOLD = 0;
UserDetailInfo.BTN_COIN = 1;
UserDetailInfo.BTN_DIAMOND = 2;
UserDetailInfo.BTN_VPOINT = 3;

