var UserDetailInfo = cc.Node.extend({
    ctor: function (isAnchorRight = false) {
        this._super();
        this.isAnchorRight = isAnchorRight;
        var itemNode = ccs.load("Lobby/UserDetailInfo.json").node;
        this.addChild(itemNode, 0, i);
        this.pInfo = itemNode;
        this.setContentSize(itemNode.getContentSize());
        this.initGUI();
    },

    initGUI: function () {
        this.btnGold = this.pInfo.getChildByName("btnGold");
        this.btnGold.defaultPos = this.btnGold.getPosition();
        this.iconGold = this.btnGold.getChildByName("icon");
        this.btnAddGold = this.btnGold.getChildByName("btn");
        this.bgGold = this.btnGold.getChildByName("bg");
        this.effGold = new CustomSkeleton("Armatures/LobbyBtn", "button", 1);
        this.iconGold.addChild(this.effGold);
        this.effGold.setPosition(this.iconGold.getContentSize().width * 0.5, this.iconGold.getContentSize().height * 0.5);
        this.effGold.setAnimation(0, "gold", -1);

        this.btnCoin = this.pInfo.getChildByName("btnCoin");
        this.btnCoin.defaultPos = this.btnCoin.getPosition();
        this.iconCoin = this.btnCoin.getChildByName("icon");
        this.btnAddCoin = this.btnCoin.getChildByName("btn");
        this.effCoin = new CustomSkeleton("Armatures/LobbyBtn", "button", 1);
        this.iconCoin.addChild(this.effCoin);
        this.effCoin.setPosition(this.iconCoin.getContentSize().width * 0.5, this.iconCoin.getContentSize().height * 0.5);
        this.effCoin.setAnimation(0, "G", -1);

        this.btnDiamond = this.pInfo.getChildByName("btnDiamond");
        this.btnDiamond.defaultPos = this.btnDiamond.getPosition();
        this.iconDiamond = this.btnDiamond.getChildByName("icon");
        this.effDiamond = new CustomSkeleton("Armatures/LobbyBtn", "button", 1);
        this.iconDiamond.addChild(this.effDiamond);
        this.effDiamond.setPosition(this.iconDiamond.getContentSize().width * 0.5, this.iconDiamond.getContentSize().height * 0.5);
        this.effDiamond.setAnimation(0, "diamond_blue", -1);

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
        this.updateSizeAndPosition();
    },

    updateDiamond: function (diamond) {
        this.lbDiamond.diamond = diamond;
        if (this.lbDiamond) this.lbDiamond.setString(StringUtility.pointNumber(this.lbDiamond.diamond));
        this.updateSizeAndPosition();
    },

    updateCoin: function (coin) {
        this.lbCoin.coin = coin;
        if (this.lbCoin) this.lbCoin.setString(StringUtility.pointNumber(this.lbCoin.coin));
        this.updateSizeAndPosition();
    },

    updateSizeAndPosition: function () {
        var labelWidth;

        //Gold
        labelWidth = this.lbGold.getAutoRenderSize().width + UserDetailInfo.PAD_TEXT * 2;
        this.btnGold.width = Math.max(labelWidth, UserDetailInfo.WIDTH_BTN);
        this.btnAddGold.x = this.btnGold.width + UserDetailInfo.PAD_ICON;
        this.lbGold.x = this.btnGold.width * 0.5;

        //G
        labelWidth = this.lbCoin.getAutoRenderSize().width + UserDetailInfo.PAD_TEXT * 2;
        this.btnCoin.width = Math.max(labelWidth, UserDetailInfo.WIDTH_BTN);
        this.btnAddCoin.x = this.btnCoin.width + UserDetailInfo.PAD_ICON;
        this.lbCoin.x = this.btnCoin.width * 0.5;

        //Diamond
        labelWidth = this.lbDiamond.getAutoRenderSize().width + UserDetailInfo.PAD_TEXT * 2;
        this.btnDiamond.width = Math.max(labelWidth, UserDetailInfo.WIDTH_BTN);
        this.lbDiamond.x = this.btnDiamond.width * 0.5 + UserDetailInfo.PAD_ICON;

        if (this.isAnchorRight) {
            this.btnDiamond.x = - (this.btnDiamond.width + UserDetailInfo.PAD_BTN * 0.5);
            this.btnCoin.x = this.btnDiamond.x - (this.btnCoin.width + UserDetailInfo.PAD_BTN);
            this.btnGold.x = this.btnCoin.x - (this.btnGold.width + UserDetailInfo.PAD_BTN);
        } else {
            this.btnGold.x = 0;
            this.btnCoin.x = this.btnGold.x + this.btnGold.width + UserDetailInfo.PAD_BTN;
            this.btnDiamond.x = this.btnCoin.x + this.btnCoin.width + UserDetailInfo.PAD_BTN;
            cc.log("WHAT IS THE PLACE", this.btnGold.width , this.btnCoin.width);
            cc.log("WHAT IS THE PLACE", this.btnGold.x, this.btnCoin.x, this.btnDiamond.x);
        }

        this.btnGold.defaultPos.x = this.btnGold.getPosition().x;
        this.btnCoin.defaultPos.x = this.btnCoin.getPosition().x;
        this.btnDiamond.defaultPos.x = this.btnDiamond.getPosition().x;
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

UserDetailInfo.PAD_TEXT = 30;
UserDetailInfo.PAD_BTN = 35;
UserDetailInfo.PAD_ICON = 5;
UserDetailInfo.PAD_TOP = 40;
UserDetailInfo.WIDTH_BTN = 132;

