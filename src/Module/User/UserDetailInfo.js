var UserDetailInfo = BaseLayer.extend({
    ctor: function () {
        this._super("UserDetailInfo");
        this.initWithBinaryFile("UserDetailInfo.json");
    },
    initGUI: function () {
        this.btnGold = this.customButton("btnGold", UserDetailInfo.BTN_GOLD, this._layout);
        this.btnCoin = this.customButton("btnCoin", UserDetailInfo.BTN_COIN, this._layout);
        this.btnDiamond = this.customButton("btnDiamond", UserDetailInfo.BTN_DIAMOND, this._layout);

        this.lbGold = this.getControl("lb", this.btnGold);
        this.lbCoin = this.getControl("lb", this.btnCoin);
        this.lbDiamond = this.getControl("lb", this.btnDiamond);

        this.imgGold = this.getControl("icon", this.btnGold);
        this.imgCoin = this.getControl("icon", this.btnCoin);
        this.imgDiamond = this.getControl("icon", this.btnDiamond);
    },

    updateToCurrentData: function () {
        this.updateGold(userMgr.getGold());
        this.updateCoin(userMgr.getCoin());
        this.updateDiamond(userMgr.getDiamond());
        this.onUpdateGUI();
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
        if (this.lbGold) this.lbGold.setString(StringUtility.formatNumberSymbol(this.lbGold.gold));
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
})

UserDetailInfo.BTN_GOLD = 0;
UserDetailInfo.BTN_COIN = 1;
UserDetailInfo.BTN_DIAMOND = 2;
UserDetailInfo.BTN_VPOINT = 3;