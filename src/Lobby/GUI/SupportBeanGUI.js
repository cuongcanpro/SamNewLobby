/**
 * Created by HunterPC on 8/31/2015.
 */

var TangVangPopup = BaseLayer.extend({

    ctor: function () {
        this.nodeKM = null;
        this.typeKM = 0;

        this._super("TangVangPopup");
        this.initWithBinaryFile("TangVangPopup.json");
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customizeButton("btnOK", 1, this._bg);
        this.customizeButton("btnClose", 0, this._bg);

        this.nodeKM = this._bg.getChildByName("bonus");
        this.labelBonus = this.getControl("labelBonus", this._bg);

        this.enableFog();
    },

    onEnterFinish : function () {
        this.setShowHideAnimate(this._bg,true);
    },

    onButtonRelease: function (button, id) {
        this.onClose();

        if (id == 1) {

            var idTab = gamedata.gameConfig.getMaxChannelFirstShopBonus();
            gamedata.openShopInTab(idTab);
        }
        popUpManager.removePopUp(PopUpManager.SHOP_BONUS);
    },

    showBonus : function (type) {
        if(type == 1) this.showKhuyenmai1();
        else this.showKhuyenmai2();
    },
    
    loadInfo : function () {
       this.labelBonus.setString(gamedata.gameConfig.getMaxFirstShopBonus() + "%");
    },

    showKhuyenmai1: function () {
     //   this._bg.loadTexture("TangVang/tangvang015.png");

        this.loadInfo();
    },

    showKhuyenmai2: function () {
    //    this._bg.loadTexture("TangVang/bg2.png");

        this.loadInfo();
    }
})

TangVangPopup.createNodeMoney = function (money) {
    var node = new cc.Node();
    var str = "" + Math.abs(money);
    var thang = (money >= 0);
    var width = 0;
    var height = 0;

    var fix = 0;
    for (var i = 0; i < str.length; i++) {
        //var xx = ret.getPositionX() + ret.getContentSize().width + fix;fix = 0;
        var xx = 0;
        var ret = new cc.Sprite(TangVangPopup.getNumberPath(parseInt(str[i])));
        ret.setPositionX(xx + width);
        node.addChild(ret);
        width += ret.getContentSize().width - 10;
        height = ret.getContentSize().height;


    }
    var ret = new cc.Sprite(TangVangPopup.getNumberPath(-1));
    ret.setPositionX(xx + width);
    node.addChild(ret);
    width += ret.getContentSize().width;

    ret = new cc.Sprite("TangVang/gold.png");
    ret.setPositionX(xx + width + 40);
    node.addChild(ret);
    width += ret.getContentSize().width;

    node.setContentSize(cc.size(width, height));
    node.setAnchorPoint(cc.p(.5, .5));

    return node;
}

TangVangPopup.getNumberPath = function (number) {
    var path = "TangVang/tangvang";
    if (number == -1)
        path += "percent";
    else {
        path += ("so" + number);
    }
    path += ".png";
    return path;
}

TangVangPopup.className = "TangVangPopup";

var SupportBeanGUI = BaseLayer.extend({

    ctor: function () {
        this._lbNotice = null;
        this._posMoney = null;
        this._moneyGroup = null;
        this._imgGold = null;
        this._type = -1;
        this.titles = [];

        this._super(SupportBeanGUI.className);
        this.initWithBinaryFile("SupportBeanGUI.json");
    },

    initGUI : function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this.titles[0] = this.getControl("title0",bg);
        this.titles[1] = this.getControl("title1",bg);

        this.customizeButton("btnOK",1,bg);

        this._lbTitle = ccui.Helper.seekWidgetByName(bg,"lbTitle");
        this._lbNotice = ccui.Helper.seekWidgetByName(bg,"lbNotice");
        this._moneyGroup = new NumberGroup();
        bg.addChild(this._moneyGroup);

        this._imgGold = this.getControl("imgGold",bg);
        this._posMoney = this.getControl("imgMoney",bg).getPosition();
        this._moneyGroup.setPosition(this._posMoney);

        this.enableFog();
    },

    onEnterFinish : function () {
        this.setShowHideAnimate(this._bg,true);
    },

    showSupportBean : function ( money , numSupport) {
        this._type = SupportBeanGUI.BEAN;
        for(var i = 0 ; i < this.titles.length ; i++)
        {
            this.titles[i].setVisible(this._type == i);
        }

        this._moneyGroup.setNumber(money);

        this._lbNotice.setVisible(true);
        if (gamedata.numSupport == 0)
            this._lbNotice.setString(LocalizedString.to("SUPPORT_MONEY3"));
        else if (gamedata.numSupport == 1)
            this._lbNotice.setString(LocalizedString.to("SUPPORT_MONEY2"));
        else if (gamedata.numSupport == 2)
            this._lbNotice.setString(LocalizedString.to("SUPPORT_MONEY1"));
        else
            this._lbNotice.setString("");
    },

    showSupportStartup : function () {
        this._type = SupportBeanGUI.START_UP;
        for(var i = 0 ; i < this.titles.length ; i++)
        {
            this.titles[i].setVisible(this._type == i);
        }

        this._lbNotice.setVisible(false);
        this._moneyGroup.setNumber(gamedata.gameConfig.dailyGift);

        this._imgGold.setPositionY(this._imgGold.getPositionY() - this._lbNotice.getContentSize().height);
        this._moneyGroup.setPositionY(this._moneyGroup.getPositionY() - this._lbNotice.getContentSize().height);
    },

    onButtonRelease : function (button, id) {
        if(id == 1)
        {
            if(this._type == SupportBeanGUI.START_UP)
            {
                if(gamedata.giftIndex >= 0)
                {
                    var sendGetDailyGift = new CmdSendGetDailyGift();
                    sendGetDailyGift.putData(gamedata.giftIndex);
                    GameClient.getInstance().sendPacket(sendGetDailyGift);

                    gamedata.giftIndex = -1;
                }
            }
        }
        if (this._type == SupportBeanGUI.START_UP) {
            popUpManager.removePopUp(PopUpManager.STARTUP);
        }
        this.onClose();

    }
});

SupportBeanGUI.className= "SupportBeanGUI";

var SupportTimeGUI = Dialog.extend({

    ctor : function () {
        this.currentTime = 0;

        this._super();
        this.scheduleUpdate();
    },

    showSupport : function (time) {
        this.currentTime = time;

        this.setChangeGold("", this, function (btnID) {
            if (btnID == Dialog.BTN_OK) {
                gamedata.openShop(sceneMgr.getRunningScene().getMainLayer()._id);
            }
        });

        this.updateTimeSupport();
    },

    updateTimeSupport : function () {
        var minute = parseInt(this.currentTime / 60);
        var second = parseInt(this.currentTime % 60);

        var sMinute;
        var sSecond;
        if(minute < 10)
        {
            sMinute = "0" + minute;
        }
        else
        {
            sMinute = minute;
        }

        if(second < 10)
        {
            sSecond = "0" +  second;
        }
        else
        {
            sSecond = second;
        }
        var timeString = LocalizedString.to("SUPPORT_TIME");
        timeString = StringUtility.replaceAll(timeString, "%minute", sMinute);
        timeString = StringUtility.replaceAll(timeString, "%second", sSecond);

        this._lb_message.setString(timeString);
    },

    update : function (delta) {
        this.currentTime -= delta;
        if(this.currentTime <= 0)
        {
            gamedata.checkSupportBean();
        }
        else
        {
            this.updateTimeSupport();
        }
    }
});

SupportTimeGUI.className= "SupportTimeGUI";

SupportBeanGUI.BEAN         = 0;
SupportBeanGUI.START_UP     = 1;