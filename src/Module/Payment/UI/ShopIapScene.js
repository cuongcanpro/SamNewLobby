/**
 * Created by Hunter on 11/7/2016.
 */

var ShopIapScene = BaseLayer.extend({

    ctor: function () {
        this.tabGold = null;
        this.tabG = null;
        this.tabTicket = null;
        this.tabItem = null;
        this.currentTab = null;
        this._super("ShopIapScene");
        this.initWithBinaryFile("ShopIapGUI.json");
    },

    initGUI: function () {
        //main parts
        this.panelTop = this.getControl("panelTop");
        this.panelMaintain = this.getControl("panelMaintain");
        this.panelMaintain.setVisible(false);

        //top buttons
        this.btnGold = this.customButton("btnGold", ShopIapScene.BTN_GOLD, this.panelTop);
        this.btnGold.setPressedActionEnabled(false);
        this.btnG = this.customButton("btnG", ShopIapScene.BTN_G, this.panelTop);
        this.btnG.setPressedActionEnabled(false);
        this.btnTicket = this.customButton("btnTicket", ShopIapScene.BTN_TICKET, this.panelTop);
        this.btnTicket.setPressedActionEnabled(false);
        this.btnItem = this.customButton("btnItem", ShopIapScene.BTN_ITEM, this.panelTop);
        this.btnItem.setPressedActionEnabled(false);
        this.btnGold.pos = this.btnGold.getPosition();
        this.btnG.pos = this.btnG.getPosition();
        this.btnTicket.iconX2 = new cc.Sprite("LobbyGUI/iconX2.png");
        this.btnTicket.addChild(this.btnTicket.iconX2);
        this.btnTicket.iconX2.setScale(0.6);
        this.btnTicket.iconX2.setPosition(110, 40);
        this.customButton("btnClose", ShopIapScene.BTN_CLOSE);
        this.customButton("btnHelp", ShopIapScene.BTN_HELP);
        this.title = this.getControl("title", this.panelTop);

        //load event ticket item
        this.iconTicketButton = this.getControl("iconTicket", this.btnTicket);
        this.iconTicketButton.loadTexture(eventMgr.getTicketTexture(-1));

        //user info layer
        this.pInfo = this.getControl("pInfo");
        this._uiName = this.getControl("name", this.pInfo);
        this.iconGold = this.getControl("iconGold", this.pInfo);
        this._uiBean = this.getControl("gold", this.pInfo);
        this.iconCoin = this.getControl("iconCoin", this.pInfo);
        this._uiCoin = this.getControl("coin", this.pInfo);
        this._uiStar = this.getControl("star", this.pInfo);
        this.iconDiamond = this.getControl("iconDiamond", this.pInfo);
        this._uiDiamond = this.getControl("diamond", this.iconDiamond);
        try {
            this.iconTicket = this.getControl("iconTicket");
            this._uiTicket = this.getControl("ticket");
            this.iconTicket.setVisible(false);
        } catch (e) {

        }

        // init panel tab
        var heightTab = cc.winSize.height - this.panelTop.getContentSize().height;
        this.tabGold = new TabGoldPayment(heightTab);
        this._layout.addChild(this.tabGold);
        this.tabG = new TabGPayment(heightTab);
        this._layout.addChild(this.tabG);
        this.tabTicket = new TabTicketPayment(heightTab);
        this._layout.addChild(this.tabTicket);
        this.tabItem = new TabItemPayment(cc.size(300, 300), cc.p(3, 3), cc.size(200, 200), cc.p(3,3), this._scale);
        this._layout.addChild(this.tabItem);

        // config common
        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        cc.log(" ******* ON ENTER FINISH SHOP IAP SCENE ******* ");
        this.onUpdateGUI();
        this.getControl("btnHelp").setVisible(!paymentMgr.checkInReview());

        // request shop event
        paymentMgr.sendUpdateBuyGold();
        paymentMgr.sendGetConfigShop(CmdSendGetConfigShop.GOLD, paymentMgr.versionShopGold);
        eventMgr.requestShopEventConfig();
        this.effectVipInfo();
        this.scheduleUpdate();
        this.reLayoutTab();
        this.tabGold.onEnterFinish();
        this.tabG.onEnterFinish();
        this.tabTicket.onEnterFinish();
        this.tabItem.onEnterFinish();
        this.updateEventInfo();
    },

    onExit: function () {
        this._super();
    },

    reLayoutTab: function () {
        var arrayConfigTicket = eventMgr.getArrayConfigTicket();
        cc.log("ARRAY CONFIG TICKET " + arrayConfigTicket.length);
        if (arrayConfigTicket.length > 0) {
            this.btnTicket.setVisible(true);
        } else {
            this.btnTicket.setVisible(false);
        }
    },

    showMaintain: function (show) {
        this.panelMaintain.setVisible(show);
    },

    onUpdateGUI: function () {
        this.updateUserInfo();
        shopData.initShopData();
        if (!eventMgr.isHaveShopTicket()) {
            this.iconTicket.loadTexture("ShopIAP/ionCommingSoon.png");
            if (this.currentIdTab == ShopIapScene.BTN_TICKET) {
                this.selectTabShop(ShopIapScene.BTN_GOLD);
            } else {
                this.currentTab.reloadTab();
            }
            if (!cc.sys.isNative) {
                this.btnTicket.setVisible(false);
            }
        } else {
            this.currentTab.reloadTab();
        }
        this.updateEventInfo();
    },

    updateUserInfo: function () {
        if (this._uiBean) this._uiBean.setString(StringUtility.standartNumber(userMgr.getGold()));
        if (this._uiCoin) this._uiCoin.setString(StringUtility.standartNumber(userMgr.getCoin()));
        if (this._uiDiamond) this._uiDiamond.setString(StringUtility.standartNumber(userMgr.getDiamond()));
    },

    updateVipInfo: function () {
        VipManager.effectVipShopInfo(this, false);
    },

    updateEventInfo: function () {
        //return;
        if (eventMgr.isInMainEvent()) {
            this.iconTicketButton.loadTexture(eventMgr.getTicketTexture());
            if (eventMgr.promoTicket > 0) {
                this.btnTicket.iconX2.setVisible(true);
            } else {
                this.btnTicket.iconX2.setVisible(false);
            }
        } else {
            this.iconTicketButton.loadTexture("ShopIAP/ionCommingSoon.png");
        }
        if (this.currentIdTab == ShopIapScene.BTN_TICKET) {
            if (this.iconTicket) {
                this.iconTicket.setVisible(false);
                if (eventMgr.isInMainEvent()) {
                    this.iconTicket.setVisible(true);
                    this.iconTicket.loadTexture(eventMgr.getTicketTexture());
                    cc.log("is in main event " + eventMgr.getNumberTicket());
                    this._uiTicket.setString(StringUtility.pointNumber(eventMgr.getNumberTicket()));
                } else {

                }
            }
            this.iconCoin.setVisible(false);
            this.iconGold.setVisible(false);
        } else {
            this.iconTicket.setVisible(false);
            this.iconCoin.setVisible(true);
            this.iconGold.setVisible(true);
        }
    },

    effectVipInfo: function () {
        VipManager.effectVipShopInfo(this, true);
    },

    selectTabShop: function (idTab) {
        cc.log("ID TAB " + idTab + "IN EVENT " + eventMgr.isInMainEvent());
        if (idTab == ShopIapScene.BTN_TICKET) {
            if (!eventMgr.isInMainEvent()) {
                Toast.makeToast(Toast.SHORT, localized("GACHA_EVENT_TIMEOUT"));
                return;
            }
            this.updateEventInfo();
        }
        this.tabG.setVisible(false);
        this.tabGold.setVisible(false);
        this.tabTicket.setVisible(false);
        this.tabItem.setVisible(false);
        var resourceGold = (idTab == ShopIapScene.BTN_GOLD ? "ShopIAP/btnTabGoldActive.png" : "ShopIAP/btnTabGoldInactive.png");
        var resourceG = (idTab == ShopIapScene.BTN_G ? "ShopIAP/btnTabGActive.png" : "ShopIAP/btnTabGInactive.png");
        var resourceTicket = (idTab == ShopIapScene.BTN_TICKET ? "ShopIAP/btnTabEventActive.png" : "ShopIAP/btnTabEventInactive.png");
        var resourceItem = (idTab == ShopIapScene.BTN_ITEM) ? "ShopIAP/btnTabItemActive.png" : "ShopIAP/btnTabItemInactive.png";
        this.iconTicketButton.setOpacity(idTab == ShopIapScene.BTN_TICKET ? 255 : 100);
        this.btnGold.loadTextures(resourceGold, resourceGold, resourceGold);
        this.btnG.loadTextures(resourceG, resourceG, resourceG);
        this.btnTicket.loadTextures(resourceTicket, resourceTicket, resourceTicket);
        this.btnItem.loadTextures(resourceItem, resourceItem, resourceItem);
        this.currentIdTab = idTab;
        if (this.currentIdTab == ShopIapScene.BTN_TICKET) {
            this.iconTicket.setVisible(true);
            this.pInfo.setVisible(false);
        } else {
            this.iconTicket.setVisible(false);
            this.pInfo.setVisible(true);
        }
        switch (idTab) {
            case ShopIapScene.BTN_GOLD:
                this.currentTab = this.tabGold;
                break;
            case ShopIapScene.BTN_G:
                this.currentTab = this.tabG;
                break;
            case ShopIapScene.BTN_TICKET:
                this.currentTab = this.tabTicket;
                this.updateEventInfo();
                break;
            case ShopIapScene.BTN_ITEM:
                this.currentTab = this.tabItem;
                break;
        }
        this.currentTab.setVisible(true);
        this.currentTab.reloadTab();
    },

    selectTabPaymentInGold: function (idPayment) {
        if (idPayment > 0)
            this.tabGold.selectTab(idPayment);
        this.selectTabShop(ShopIapScene.BTN_GOLD);
    },

    selectTabPaymentInG: function (idPayment) {
        if (idPayment > 0)
            this.tabG.selectTab(idPayment);
        this.selectTabShop(ShopIapScene.BTN_G);
    },

    selectTabPaymentInTicket: function (idPayment) {
        if (idPayment > 0)
            this.tabTicket.selectTab(idPayment);
        this.selectTabShop(ShopIapScene.BTN_TICKET);
    },

    selectTabPaymentInItem: function(idPayment) {

    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case ShopIapScene.BTN_CLOSE: {
                this.onBack();
                break;
            }
            case ShopIapScene.BTN_HELP: {
                sceneMgr.openGUI(VipHelpScene.className, VipHelpScene.TAG, VipHelpScene.TAG);
                break;
            }
            case ShopIapScene.BTN_VIP: {
                VipManager.openVip(ShopIapScene.className);
                break;
            }
            case ShopIapScene.BTN_USERINFO: {
                sceneMgr.openGUI(CheckLogic.getUserInfoClassName(), LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO).setInfo(gamedata.userData);
                break;
            }
            case ShopIapScene.BTN_GOLD:
            case ShopIapScene.BTN_G:
            case ShopIapScene.BTN_TICKET: {
                this.selectTabShop(id);
                break;
            }
            case ShopIapScene.BTN_ITEM: {
                if (StorageManager.getInstance().checkEnableItem()) {
                    this.selectTabShop(id);
                }
                break;
            }
            //default :
            //{
            //    this.selectTab(id);
            //    break;
            //}
        }
    },

    effectGold: function () {
        var pStart = cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
        var pEnd = cc.p(0, 0);
        var curScene = sceneMgr.getMainLayer();
        var lbGold = null;
        var isGUI;
        if (curScene instanceof LobbyScene || curScene instanceof ChooseRoomScene || curScene instanceof ShopIapScene) {
            pEnd = SceneMgr.convertPosToParent(sceneMgr.layerGUI, curScene._uiBean);
            isGUI = true;
            lbGold = curScene._uiBean;
        }

        if (isGUI && this.saveGold) {
            effectMgr.flyCoinEffect(sceneMgr.layerGUI, this.saveGold, 100000, pStart, pEnd);
            if (lbGold)
                effectMgr.runLabelPoint(lbGold, (userMgr.getGold() - this.saveGold), userMgr.getGold(), 1.5);
        }
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable()) return;

        sceneMgr.openScene(LobbyScene.className);
        fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, ConfigLog.END);
    },

    update: function (dt) {
        VipManager.getInstance().updateTimeVip(dt);
        var remainTime = VipManager.getInstance().getRemainTime();
        this.txtRemainVipTime.setString(VipManager.getRemainTimeString(remainTime));
    },

    getPositionComponent: function (type) {
        switch (type) {
            case ShopSuccessData.TYPE_GOLD:
                return this.iconGold.convertToWorldSpace(cc.p(this.iconGold.getContentSize().width * 0.5, this.iconGold.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_VPOINT:
                return this.txtRemainVipTime.convertToWorldSpace(cc.p(this.txtRemainVipTime.getContentSize().width * 0.5, this.txtRemainVipTime.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_HOUR_VIP:
                return this.txtProgress.convertToWorldSpace(cc.p(this.txtProgress.getContentSize().width * 0.5, this.txtProgress.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_G:
                return this.iconCoin.convertToWorldSpace(cc.p(this.iconCoin.getContentSize().width * 0.5, this.iconCoin.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_ITEM:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_TICKET:
                return this.btnAvatar.convertToWorldSpace(cc.p(this.btnAvatar.getContentSize().width * 0.5, this.btnAvatar.getContentSize().height * 0.5));
                break;
            case ShopSuccessData.TYPE_DIAMOND:
                return this.iconDiamond.convertToWorldSpace(cc.p(this.iconDiamond.getContentSize().width * 0.5, this.iconDiamond.getContentSize().height * 0.5));
                break;
        }
    },
});
ShopIapScene.className = "ShopIapScene";

ShopIapScene.TYPE_GOLD = 1;
ShopIapScene.TYPE_G = 2;
ShopIapScene.TYPE_SMS = 3;

ShopIapScene.BTN_CLOSE = 1;
ShopIapScene.BTN_HELP = 2;
ShopIapScene.BTN_VIP = 3;
ShopIapScene.BTN_USERINFO = 4;
ShopIapScene.BTN_GOLD = 10;
ShopIapScene.BTN_G = 11;
ShopIapScene.BTN_TICKET = 12;
ShopIapScene.BTN_ITEM = 13;

ShopIapScene.TAB_GPLAY = 11;
ShopIapScene.TAB_NAPG = 12;
ShopIapScene.TAB_SMS = 13;
