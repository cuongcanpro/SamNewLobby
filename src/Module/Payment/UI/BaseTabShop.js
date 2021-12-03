BaseTabShop = cc.Layer.extend({
    ctor: function (height) {
        this._super();
        this.heightTab = height;
        this.arrayChannelButton = [];
        this.arrayChannelData = [];
        this.initGUI();
    },

    initGUI: function () {
        this.tabNormalPayment = new PanelIapItem(this);
        this.addChild(this.tabNormalPayment);

        var scrollView = new ccui.ScrollView();
        scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
        scrollView.setTouchEnabled(true);
        scrollView.setBounceEnabled(true);
        //scrollView.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        scrollView.setBackGroundColor(cc.color(255,255,255));
        //scrollView.setBackGroundImageScale9Enabled(true);
        scrollView.setContentSize(cc.size(800, 300));
        scrollView.setInnerContainerSize(cc.size(GUIBuyTicket.WIDTH_SCROLL, 300));
        scrollView.setAnchorPoint(cc.p(0.0, 0.5));
        this.addChild(scrollView);
        this.scrollView = scrollView;
    },

    onEnterFinish: function () {
        if (!cc.sys.isNative) {
            this.scrollView.setTouchEnabled(true);
        }

    },

    loadArrayChannel: function (arrayChannelData) {
          this.arrayChannelData = arrayChannelData;
          for (var i = 0; i < this.arrayChannelButton.length; i++)
              this.arrayChannelButton[i].setVisible(false);
          var padX = 10;
          for (var i = 0; i < arrayChannelData.length; i++) {
              var btn = this.getButton();
              btn.setPosition(padX + btn.getContentSize().width * (i + 0.5), btn.getContentSize().height * 0.5);
              btn.setData(arrayChannelData[i]);
              btn.setSelect(false);
          }
    },

    getButton: function () {

        for (var i = 0; i < this.arrayChannelButton.length; i++) {
            if (!this.arrayChannelButton[i].isVisible())
                return this.arrayChannelButton[i];
        }
        var btn = new ChannelPaymentButton();
        this.arrayChannelButton.push(btn);
        this.scrollView.addChild(btn);
        return btn;
    }
});


var ChannelPaymentButton = ccui.Button.extend({
    ctor: function () {
        this._super();
        this.iconHot = new cc.Sprite("");
    },

    setData: function (data) {
        this.data = data;
    },

    selectButton: function (isSelect) {
        var s = isSelect ? data.getResourceSelect() : data.getResource();
        this.loadTextures(s, s, s);
    }
})