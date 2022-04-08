BaseTabShop = cc.Layer.extend({
    ctor: function (heightTab) {
        this._super();
        this.heightTab = heightTab;
        this.arrayChannelButton = [];
        this.arrayChannelData = [];
        this.tabNormalPayment = null;
        this.selectedTab = -1;
        this.initGUI();
    },

    initGUI: function () {
        this.bgChannel = new cc.Sprite("res/Lobby/Common/bgColumn.png");
        this.addChild(this.bgChannel);
        this.bgChannel.setScaleX(cc.winSize.width / this.bgChannel.getContentSize().width);
        this.bgChannel.setPosition(cc.winSize.width * 0.5, this.heightTab - this.bgChannel.getContentSize().height * 0.5);

        var startY = this.heightTab - this.bgChannel.getContentSize().height;

        this.tabNormalPayment = new PanelIapItem(this);
        this.addChild(this.tabNormalPayment);
        this.tabNormalPayment.setPosition(10, startY * 0.5 - ItemIapCell.HEIGHT_ITEM * 0.5 );

        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        scrollView.setBounceEnabled(true);
        scrollView.setScrollBarEnabled(false);
        //scrollView.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        scrollView.setBackGroundColor(cc.color(255,255,255));
        //scrollView.setBackGroundImageScale9Enabled(true);
        scrollView.setContentSize(cc.size(cc.winSize.width, this.bgChannel.getContentSize().height));

        scrollView.setAnchorPoint(cc.p(0.0, 0));
        scrollView.setPosition(0, startY);
        this.addChild(scrollView);
        this.scrollView = scrollView;

    },

    onEnterFinish: function () {
        if (!cc.sys.isNative) {
            this.scrollView.setTouchEnabled(true);
        }
    },

    loadArrayChannel: function (arrayChannelData) {
        cc.log("Load array Channel " + arrayChannelData.length, JSON.stringify(arrayChannelData));
        this.arrayChannelData = arrayChannelData;
        for (var i = 0; i < this.arrayChannelButton.length; i++)
            this.arrayChannelButton[i].setVisible(false);
        var padX = 10;
        for (var i = 0; i < arrayChannelData.length; i++) {
            var btn = this.getButton();
            btn.setVisible(true);
            btn.setData(arrayChannelData[i]);
            btn.setSelect(false);
            btn.setPosition(padX * (i + 1) + btn.getContentSize().width * (i + 0.5), this.scrollView.getContentSize().height * 0.5);
        }
        if (this.arrayChannelButton.length == 0)
            return;
        var width =  padX * (this.arrayChannelButton.length + 1) + this.arrayChannelButton[0].getContentSize().width * (this.arrayChannelButton.length);
        this.scrollView.setInnerContainerSize(cc.size(width, this.bgChannel.getContentSize().height));
    },

    getButton: function () {
        for (var i = 0; i < this.arrayChannelButton.length; i++) {
            if (!this.arrayChannelButton[i].isVisible())
                return this.arrayChannelButton[i];
        }
        var btn = new ChannelPaymentButton(this);
        this.arrayChannelButton.push(btn);
        this.scrollView.addChild(btn);
        return btn;
    },

    selectTab: function (index) {
        cc.log("LENGTH Data " + index + " " + this.arrayChannelData.length + " " + this.arrayChannelButton.length);
        for (var i = 0; i < this.arrayChannelData.length; i++) {
            this.arrayChannelButton[i].setSelect(index == i);
        }
        this.selectedTab = index;
    },

    showMaintain: function (maintain) {
        var shop = sceneMgr.getMainLayer();
        if (shop instanceof ShopIapScene)
            shop.showMaintain(maintain);
    },
});


var ChannelPaymentButton = ccui.Button.extend({
    ctor: function (parent) {
        this._super();
        var effect = db.DBCCFactory.getInstance().buildArmatureNode("IconHot");
        this.addChild(effect);
        effect.setScale(1.5);
        effect.getAnimation().gotoAndPlay("1", -1, -1, -1);
        effect.setTag(2);
        this.iconHot = effect;
        this.addClickEventListener(this.onClickPaymentButton.bind(this));
        this.tabParent = parent;

        this.imgHot = new cc.Sprite("Lobby/ShopIAP/iconHot.png");
        this.addChild(this.imgHot);
        this.imgHot.setPosition(28, 32);
        this.setCascadeOpacityEnabled(true);
    },

    onClickPaymentButton: function () {
        this.tabParent.selectTab(this.data.index);
    },

    setData: function (data) {
        this.data = data;
        this.iconHot.setVisible(data.isHot);
        this.iconHot.setVisible(false);
        this.imgHot.setVisible(data.isHot);
    },

    setSelect: function (isSelect) {
        var s = isSelect ? this.data.getResourceSelect() : this.data.getResource();
        cc.log("SET SELECT " + s);
        this.loadTextures(s, s, s);
    },

})