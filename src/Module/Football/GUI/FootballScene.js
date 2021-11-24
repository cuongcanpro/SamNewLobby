/**
 * Created by HunterPC on 9/8/2015.
 */

var FootballScene = BaseLayer.extend({

    ctor : function () {
        this.curTab = -1;

        this.tabBet = null;
        this.tabHistory = null;
        this.tabResult = null;
        this.tabGift = null;
        this.tabRank = null;

        this.pBet = null;
        this.pHistory = null;
        this.pResult = null;
        this.pGift = null;
        this.pRank = null;

        this.imgNotice = null;
        this.lbNum = null;

        this.lbName = null;
        this.lbGStar = null;
        this.lbGold = null;
        this.lbGoldWin = null;
        this.lbGoldBet = null;
        this.lbXu = null;
        this.bgAvatar = null;
        this.imgAvatar = null;

        this.tabSize = null;
        this.tabPos = null;

        this._super(FootballScene.className);
        this.initWithBinaryFile("FootballScene.json");
    },

    initGUI : function () {
        var bBot = this.getControl("bgBot");
        var bTop = this.getControl("bgTop");

        this.tabSize = cc.director.getWinSize().height - bTop.getContentSize().height*this._scale - bBot.getContentSize().height*this._scale;
        this.tabPos = {};
        this.tabPos.top = bTop.getPositionY() - bTop.getContentSize().height*this._scale;
        this.tabPos.bot = bBot.getPositionY() + bBot.getContentSize().height*this._scale;

        var pTop = this.getControl("pTop");
        var pBottomUser = this.getControl("pBottomUser");
        var pBottomInfo = this.getControl("pBottomInfo");
        var pButtonRight = this.getControl("pButtonRight");

        pTop.setPositionY(bTop.getPositionY() - bTop.getContentSize().height*this._scale/2);
        pButtonRight.setPositionY(bTop.getPositionY() - bTop.getContentSize().height*this._scale/2);
        pBottomInfo.setPositionY(bBot.getPositionY() + bBot.getContentSize().height*this._scale/2);

        var btnClose = this.customButton("btnClose",FootballScene.BTN_CLOSE);
        btnClose.setPositionY(bTop.getPositionY() - bTop.getContentSize().height*this._scale/2);

        this.customButton("btnHelp",FootballScene.BTN_HELP,pButtonRight);
        this.customButton("btnInfo",FootballScene.BTN_INFO,pButtonRight);

        this.customButton("tabBet",FootballScene.TAB_BET,pTop);
        this.customButton("tabHistory",FootballScene.TAB_HISTORY,pTop);
        this.customButton("tabResult",FootballScene.TAB_RESULT,pTop);
        this.customButton("tabGift",FootballScene.TAB_GIFT,pTop);
        this.customButton("tabRank",FootballScene.TAB_RANK,pTop);

        this.tabBet     = this.getControl("tabBet",pTop);
        this.tabHistory = this.getControl("tabHistory",pTop);
        this.tabResult  = this.getControl("tabResult",pTop);
        this.tabGift    = this.getControl("tabGift",pTop);
        this.tabRank    = this.getControl("tabRank",pTop);

        this.tabBet.setPressedActionEnabled(false);
        this.tabHistory.setPressedActionEnabled(false);
        this.tabResult.setPressedActionEnabled(false);
        this.tabGift.setPressedActionEnabled(false);
        this.tabRank.setPressedActionEnabled(false);

        this.imgNotice  = this.getControl("img",this.tabGift);
        this.lbNum      = this.getControl("lb",this.tabGift);

        pBottomUser.setLocalZOrder(20);
        this.lbName     = this.getControl("lbName",pBottomUser);
        this.lbGold     = this.getControl("lbGold",pBottomUser);
        this.lbXu       = this.getControl("lbXu",pBottomUser);

        this.lbGoldWin  = this.getControl("lbGoldWin",pBottomInfo);
        this.lbGoldBet  = this.getControl("lbGoldBet",pBottomInfo);

        this.bgAvatar  = this.getControl("imgAvatar",pBottomUser);
        var btnAvatar = this.getControl("bgAvatar",pBottomUser);
        this.imgAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");////engine.UIAvatar.create("Common/defaultAvatar.png");
        var size = btnAvatar.getContentSize();
        this.imgAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        btnAvatar.addChild(this.imgAvatar);

        // check preLoad
        if(Config.ENABLE_PRELOAD_GUI)
        {
            //preload cell
            ccs.load("FBetCell.json");
            ccs.load("FGiftCell.json");
            ccs.load("FHistoryCell.json");
            ccs.load("FRankCell.json");
            ccs.load("FResultCell.json");

            sceneMgr.preloadGUI(FBetScore.className);
            sceneMgr.preloadGUI(FBetRate.className);

            // preload tab
            this.pBet = new FTabBet(this.tabSize,this.tabPos);
            this._layout.addChild(this.pBet);

            this.pHistory = new FTabHistory(this.tabSize,this.tabPos);
            this._layout.addChild(this.pHistory);

            this.pResult = new FTabResult(this.tabSize,this.tabPos);
            this._layout.addChild(this.pResult);

            this.pGift = new FTabGift(this.tabSize,this.tabPos);
            this._layout.addChild(this.pGift);

            this.pRank = new FTabRank(this.tabSize,this.tabPos);
            this._layout.addChild(this.pRank);
        }

        this.setBackEnable(true);
    },

    onEnterFinish : function () {
        this.updateUserInfo();

        this.switchTab(FootballScene.TAB_BET);
    },

    switchTab : function (tab) {
        this.curTab = tab;

        this.tabBet.loadTextures("GUIMinigame/tabListBet.png","GUIMinigame/tabListBet.png","");
        this.tabHistory.loadTextures("GUIMinigame/tabHistory.png","GUIMinigame/tabHistory.png","");
        this.tabResult.loadTextures("GUIMinigame/tabResult.png","GUIMinigame/tabResult.png","");
        this.tabGift.loadTextures("GUIMinigame/tabGift.png","GUIMinigame/tabGift.png","");
        this.tabRank.loadTextures("GUIMinigame/tabRank.png","GUIMinigame/tabRank.png","");

        switch (tab)
        {
            case FootballScene.TAB_BET:
                if(this.pBet ==  null)
                {
                    this.pBet = new FTabBet(this.tabSize,this.tabPos);
                    this._layout.addChild(this.pBet);
                }
                this.tabBet.loadTextures("GUIMinigame/tabSelectListBet.png","GUIMinigame/tabSelectListBet.png","");
                this.pBet.listView.reloadData();
                break;
            case FootballScene.TAB_HISTORY:
                if(this.pHistory ==  null)
                {
                    this.pHistory = new FTabHistory(this.tabSize,this.tabPos);
                    this._layout.addChild(this.pHistory);
                }
                this.tabHistory.loadTextures("GUIMinigame/tabSelectHistory.png","GUIMinigame/tabSelectHistory.png","");
                this.pHistory.listView.reloadData();
                break;
            case FootballScene.TAB_RESULT:
                if(this.pResult ==  null)
                {
                    this.pResult = new FTabResult(this.tabSize,this.tabPos);
                    this._layout.addChild(this.pResult);
                }
                this.tabResult.loadTextures("GUIMinigame/tabSelectResult.png","GUIMinigame/tabSelectResult.png","");
                this.pResult.listView.reloadData();
                break;
            case FootballScene.TAB_GIFT:
                if(this.pGift == null)
                {
                    this.pGift = new FTabGift(this.tabSize,this.tabPos);
                    this._layout.addChild(this.pGift);
                }
                this.tabGift.loadTextures("GUIMinigame/tabSelectGift.png","GUIMinigame/tabSelectGift.png","");
                this.pGift.listView.reloadData();
                break;
            case FootballScene.TAB_RANK:
                if(this.pRank == null)
                {
                    this.pRank = new FTabRank(this.tabSize,this.tabPos);
                    this._layout.addChild(this.pRank);
                }
                this.tabRank.loadTextures("GUIMinigame/tabSelectRank.png","GUIMinigame/tabSelectRank.png","");
                this.pRank.rankList.onSelect();
                break;
        }

        if(this.pBet)       this.pBet.setVisible(tab == FootballScene.TAB_BET);
        if(this.pHistory)   this.pHistory.setVisible(tab == FootballScene.TAB_HISTORY);
        if(this.pResult)    this.pResult.setVisible(tab == FootballScene.TAB_RESULT);
        if(this.pGift)      this.pGift.setVisible(tab == FootballScene.TAB_GIFT);
        if(this.pRank)      this.pRank.setVisible(tab == FootballScene.TAB_RANK);
    },

    updateUserInfo : function () {
        this.imgAvatar.asyncExecuteWithUrl(gamedata.userData.zName,gamedata.userData.avatar);

        this.setLabelText(gamedata.userData.displayName,this.lbName);
        this.lbGold.setString(StringUtility.pointNumber(gamedata.userData.bean));
        this.lbXu.setString(StringUtility.pointNumber(gamedata.userData.coin));
        //this.lbGStar.setString(StringUtility.pointNumber(gamedata.userData.gStar));

        var sum = 0;
        for(var i = 0; i< football.fData.listHistory.length ; i++)
        {

            if(football.fData.listHistory[i].moneyGet != 0)
            {
                sum = football.fData.listHistory[i].moneyGet + sum;
            }
        }
        this.lbGoldWin.setString(StringUtility.pointNumber(sum));

        sum = 0;
        for(var i = 0; i< football.fData.listHistory.length ; i++)
        {

            if(football.fData.listHistory[i].status == Football.MATCH_STATUS_NOT_DONE)
            {
                sum = football.fData.listHistory[i].moneyBet + sum;
            }
        }
        this.lbGoldBet.setString(StringUtility.pointNumber(sum));

        this.checkGiftNotify();
    },

    updateListBet : function () {
        if(this.curTab == FootballScene.TAB_BET)
        {
            this.pBet.listView.reloadData();
        }
    },
    
    updateHistory : function () {
        if(this.curTab == FootballScene.TAB_HISTORY)
        {
            this.pHistory.listView.reloadData();
        }
    },
    
    updateGift : function () {
        if(this.curTab == FootballScene.TAB_GIFT)
        {
            this.pGift.listView.reloadData();
        }
        this.checkGiftNotify();
    },

    updateRank : function () {
        if(this.curTab == FootballScene.TAB_RANK)
        {
            this.pRank.rankList.listView.reloadData();
        }
    },

    updateMyData : function () {
        if(this.curTab == FootballScene.TAB_RANK)
        {
            this.pRank.rankList.updateMyData();
        }
    },

    checkGiftNotify : function () {
        var count = 0;
        for(var i = 0; i< football.fData.listGift.length; i++)
        {
            if(football.fData.listGift[i].isReceive == false)
            {
                count++;
            }
        }

        this.imgNotice.setVisible(count > 0);
        this.lbNum.setVisible(count > 0);
        this.lbNum.setString(count);
    },

    onButtonRelease : function (button, id) {
        switch (id)
        {
            case FootballScene.BTN_CLOSE:
                this.onBack();
                break;
            case FootballScene.BTN_INFO:
                NativeBridge.openWebView("https://web.service.zingplay.com/football/index.html");
                break;
            case FootballScene.BTN_HELP:
                NativeBridge.openWebView("https://web.service.zingplay.com/football/cuoc.html");
                break;
            case FootballScene.TAB_BET:
            case FootballScene.TAB_HISTORY:
            case FootballScene.TAB_RESULT:
            case FootballScene.TAB_GIFT:
            case FootballScene.TAB_RANK:
                this.switchTab(id);
                break;
        }
    },

    onExit : function () {
        cc.Layer.prototype.onExit.call(this);
        football.guiFootball = null;
        football.inFootball = false;
    },

    onBack : function () {
        if(sceneMgr.checkBackAvailable()) return;

        sceneMgr.openScene(LobbyScene.className);
    }
});

var FootballCell = cc.TableViewCell.extend({
    ctor : function (id) {
        this._super();
        this.Id = id;

        this._scale = cc.winSize.width/Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
    },

    initWithJson : function (json) {
        var jsonLayout = ccs.load(json);
        this._layout = jsonLayout.node;
        this._layout.setContentSize(cc.winSize.width,this._layout.getContentSize().height);
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);
        this.customizeGUI();
    },

    customizeButton : function (name,parent,tag) {
        var btn = this.getControl(name,parent);
        btn.setPressedActionEnabled(true);
        btn.setTag(tag);
        btn.addTouchEventListener(this.onTouchEventHandler,this);
        return btn;
    },

    getControl : function (cName,parent) {
        var p = null;
        if(typeof  parent === 'undefined')
        {
            p = this._layout;
        }
        else if(typeof parent === 'string')
        {
            p = ccui.Helper.seekWidgetByName(this._layout,parent);
        }
        else
        {
            p = parent;
        }

        var control = ccui.Helper.seekWidgetByName(p,cName);
        if(control == null)
        {
            cc.log("$getControl error " + cName);
            return null;
        }

        this.analyzeCustomControl(control);

        return control;
    },

    analyzeCustomControl : function (control) {
        if(control.customData === undefined)
        {
            if(control.getTag() < 0) // scale theo ty le nho nhat
            {
                this.processScaleControl(control);
            }
            return;
        }

        var s = control.customData;

        if(s.indexOf("scale") > -1) // scale theo ty le nho nhat
        {
            this.processScaleControl(control);
        }

        if(s.indexOf("subText") > -1) // set text gioi han string
        {
            control["subText"] = control.getString().length;
        }
    },

    processScaleControl : function (control) {
        control.setScale(this._scale);
    },

    onTouchEventHandler: function(sender,type){
        if(type == ccui.Widget.TOUCH_ENDED)
        {
            this.onButtonRelease(sender,sender.getTag());
        }
    },

    onEnter: function() {
        cc.TableViewCell.prototype.onEnter.call(this);
    },
    
    replaceFlagTeam : function (curFlag,parent) {
        var flag = engine.UIAvatar.create("GUIMinigame/flagDefault.png");
        flag.setPosition(curFlag.getPosition());
        parent.addChild(flag);
        curFlag.setVisible(false);
        return flag;
    },

    setLabelText : function (text, control) {
        if(typeof  text === 'undefined') return;
        if(typeof  control === 'undefined') return;
        if(control == null) return;
        if(typeof  control.getString === 'undefined') return;
        if(typeof  control.setString === 'undefined') return;

        var str = control.getString();
        var len1 = str.length;
        var len2 = text.length;

        if(len2 <= len1)
        {
            control.setString(text);
        }
        else
        {
            control.setString(text.substring(0,len1-3) + "...");
        }
    },

    changeFlagTeam : function (curFlag,flagUrl) {
        if(typeof  curFlag === 'undefined') return;
        if(typeof  flagUrl === 'undefined') return;
        if(typeof curFlag.asyncExecuteWithUrl === 'undefined') return;

        curFlag.asyncExecuteWithUrl(flagUrl,flagUrl);
    },

    initGUI : function () {

    },

    onButtonRelease : function (button,id) {

    }
});

FootballScene.className = "FootballScene";

FootballScene.BTN_CLOSE         = 0;
FootballScene.BTN_INFO          = 1;
FootballScene.BTN_HELP          = 2;

FootballScene.TAB_BET           = 10;
FootballScene.TAB_HISTORY       = 11;
FootballScene.TAB_RESULT        = 12;
FootballScene.TAB_GIFT          = 13;
FootballScene.TAB_RANK          = 14;

FootballScene.BET_RATE          = 600;
FootballScene.BET_SCORE         = 601;

var FootballEuroUI = BaseLayer.extend({

    ctor : function () {
        this.info = null;

        this._super("FootballEuroUI");
        this.initWithBinaryFile("FootballEuroUI.json");
    },

    customizeGUI: function () {
        var bg = this.getControl("bg");

        this.customButton("close", FootballEuroUI.BTN_CLOSE, bg);
        this.customButton("join", FootballEuroUI.BTN_JOIN, bg);

        this.customButton("homepage", FootballEuroUI.BTN_HOMEPAGE, bg).setPressedActionEnabled(false);
        this.customButton("fanpage", FootballEuroUI.BTN_FANPAGE, bg).setPressedActionEnabled(false);

        this.setFog(true,200);
        this.setShowHideAnimate(bg, true);
        this.setBackEnable(true);
    },

    onButtonRelease : function (btn, id) {

        switch (id)
        {
            case FootballEuroUI.BTN_CLOSE:
            {
                this.onBack();
                break;
            }
            case FootballEuroUI.BTN_JOIN:
            {
                this.onBack();

                football.showFootball();
                break;
            }
            case FootballEuroUI.BTN_HOMEPAGE:
            {
                NativeBridge.openWebView(gamedata.urlnews);
                break;
            }
            case FootballEuroUI.BTN_FANPAGE:
            {
                NativeBridge.openWebView(gamedata.forum);
                break;
            }
        }
    },

    onBack: function () {
        football.saveCurrentDay();

        this.onClose();
    }

});

FootballEuroUI.BTN_CLOSE = 1;
FootballEuroUI.BTN_JOIN = 2;
FootballEuroUI.BTN_HOMEPAGE = 3;
FootballEuroUI.BTN_FANPAGE = 4;

FootballEuroUI.className = "FootballEuroUI";

