/**
 * Created by HunterPC on 9/8/2015.
 */

var FBetCell = FootballCell.extend({

    ctor : function () {
        this.match = null;

        this.lbTime = null;
        this.lbDate = null;

        this.nameTeam0 = null;
        this.flagTeam0 = null;
        this.nameTeam1 = null;
        this.flagTeam1 = null;

        this.lbWLTeam0 = null;
        this.lbWLTeam1 = null;
        this.bWLTeam0 = null;
        this.bWLTeam1 = null;

        this.lbBetScore = null;
        this.bScoreTeam0 = null;
        this.bScoreTeam1 = null;

        this._super("FBetCell");
        this.initWithJson("FBetCell.json");
    },

    customizeGUI : function () {
        var bg = this.getControl("bg");
        bg.setScaleY(this._scale);
        
        var delta = bg.getContentSize().height*(1 - this._scale)/2;
        this._layout.setPositionY(this._layout.getPositionY() - delta);

        var pTime   = this.getControl("panelTime");
        var pMatch  = this.getControl("panelInfo");
        var pWL     = this.getControl("panelBetWL");
        var pScore  = this.getControl("panelBetScore");

        this.lbTime = this.getControl("lbTime",pTime);
        this.lbDate = this.getControl("lbDate",pTime);

        this.flagTeam0 = this.replaceFlagTeam(this.getControl("flagTeam0",pMatch),pMatch);
        this.nameTeam0 = this.getControl("nameTeam0",pMatch);
        this.flagTeam1 = this.replaceFlagTeam(this.getControl("flagTeam1",pMatch),pMatch);
        this.nameTeam1 = this.getControl("nameTeam1",pMatch);

        this.flagTeam0.setPositionY(this.nameTeam0.getPositionY());
        this.flagTeam1.setPositionY(this.nameTeam1.getPositionY());
        this.customizeButton("btnBetScore",pMatch,FBetCell.BTN_BET_SCORE);

        this.lbWLTeam0 = this.getControl("lbBetWL0",pWL);
        this.lbWLTeam1 = this.getControl("lbBetWL1",pWL);
        this.bWLTeam0 = this.customizeButton("btnBWL0",pWL,FBetCell.BTN_BET_WL0);
        this.bWLTeam1 = this.customizeButton("btnBWL1",pWL,FBetCell.BTN_BET_WL1);

        this.lbBetScore = this.getControl("lbBetScore",pScore);
        this.bScoreTeam0 = this.customizeButton("btnBS0",pScore,FBetCell.BTN_BET_TS0);
        this.bScoreTeam1 = this.customizeButton("btnBS1",pScore,FBetCell.BTN_BET_TS1);
    },

    setMatch : function (index) {
        this.match = football.fData.listMatch[index];
        var team0 = football.getTeamData(this.match.home);
        var team1 = football.getTeamData(this.match.away);

        this.lbTime.setString(football.getClock(this.match.time));
        this.lbDate.setString(football.getDate(this.match.time));


        this.nameTeam0.setString(football.getTeam(this.match.home));
        this.nameTeam1.setString(football.getTeam(this.match.away));

        var pMatch  = this.getControl("panelInfo");

        this.flagTeam0.setDefaultImage();
        this.flagTeam1.setDefaultImage();

        this.flagTeam0.asyncExecuteWithUrl("Flag" + md5(football.getTeam(this.match.home)),football.getFlag(this.match.home));
        this.flagTeam1.asyncExecuteWithUrl("Flag" + md5(football.getTeam(this.match.away)),football.getFlag(this.match.away));

        this.lbWLTeam0.setVisible(false);
        this.lbWLTeam1.setVisible(false);

        if(this.match.rateWinLostHome > 0)
        {
            this.lbWLTeam0.setVisible(true);
            this.lbWLTeam0.setString(football.getFraction(this.match.rateWinLostHome));
            this.nameTeam0.setColor(sceneMgr.ccYellow);
            this.nameTeam1.setColor(sceneMgr.ccWhite);
        }
        else if(this.match.rateWinLostAway > 0)
        {
            this.lbWLTeam1.setVisible(true);
            this.lbWLTeam1.setString(football.getFraction(this.match.rateWinLostAway));
            this.nameTeam1.setColor(sceneMgr.ccYellow);
            this.nameTeam0.setColor(sceneMgr.ccWhite);
        }

        this.lbBetScore.setString(football.getFraction(this.match.rateTaiXiu));

        this.changeButtonBet(this.bWLTeam0,this.match.rateWinLostMoneyHome);
        this.changeButtonBet(this.bWLTeam1,this.match.rateWinLostMoneyAway);
        this.changeButtonBet(this.bScoreTeam0,this.match.rateMoneyTrenTaiXiu);
        this.changeButtonBet(this.bScoreTeam1,this.match.rateMoneyDuoiTaiXiu);
    },

    onBetScore : function () {
        var g = sceneMgr.openGUI(FBetScore.className,FootballScene.BET_RATE,FootballScene.BET_RATE);
        if(g) g.showBet(this.match.Id);
    },

    onBetWinLose : function (value) {
        var g = sceneMgr.openGUI(FBetRate.className,FootballScene.BET_RATE,FootballScene.BET_RATE);
        if(g) g.showBetRate(this.match.Id,value);
    },

    onBetTotalScore : function (value) {
        var g = sceneMgr.openGUI(FBetRate.className,FootballScene.BET_SCORE,FootballScene.BET_SCORE);
        if(g) g.showBetSum(this.match.Id,value);
    },

    changeButtonBet : function (button, value) {
        if(value >= 0)
        {
            button.loadTextures("GUIMinigame/btnBetXanh.png","GUIMinigame/btnBetXanh.png","");
        }
        else
        {
            button.loadTextures("GUIMinigame/btnBetDo.png","GUIMinigame/btnBetDo.png","");
        }

        this.getControl("lb",button).setString(football.getDouble(value));
    },

    onButtonRelease: function(btn,id){
        switch (id)
        {
            case FBetCell.BTN_BET_SCORE:
                this.onBetScore();
                break;
            case FBetCell.BTN_BET_WL0:
            case FBetCell.BTN_BET_WL1:
                this.onBetWinLose(id - FBetCell.BTN_BET_WL0 + 1);
                break;
            case FBetCell.BTN_BET_TS0:
            case FBetCell.BTN_BET_TS1:
                this.onBetTotalScore(id - FBetCell.BTN_BET_TS0 + 1);
                break;
        }
    }
});

var FTabBet = BaseLayer.extend({

    ctor : function (gSize,gPos) {
        this.listView = null;
        this.gSize = gSize;
        this.gPos = gPos;
        this.cellSize = null;

        this._super("FTabBet");
        this.initWithBinaryFile("FTabBet.json");
    },

    initGUI : function () {
        var bgTab = this.getControl("bgTab");
        bgTab.setPositionY(this.gPos.top - bgTab.getContentSize().height*this._scale/2);

        for(var i = 0 ; i < 4 ; i++)
        {
            this.getControl("lb" + i).setPositionY(bgTab.getPositionY());
        }
        for(var i = 0 ; i < 3 ; i++)
        {
            this.getControl("sp" + i).setPositionY(bgTab.getPositionY());
        }

        var _list = this.getControl("pList");
        var _size = cc.size(cc.winSize.width,this.gSize - bgTab.getContentSize().height*this._scale);

        var rItem = this.getControl("cell",_list);
        rItem.setVisible(false);
        this.cellSize = cc.size(rItem.getContentSize().width,rItem.getContentSize().height*this._scale);

        this.listView = new cc.TableView(this,_size);
        this.listView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listView.setPosition(_list.getPosition().x,this.gPos.bot);
        this.listView.setVerticalFillOrder(0);
        this._layout.addChild(this.listView);

        this.listView.reloadData();
    },

    tableCellAtIndex:function (table, idx) {
        var cell = table.dequeueCell();
        if(!cell)
        {
            cell = new FBetCell();
        }
        cell.setMatch(idx);
        return cell;
    },

    tableCellSizeForIndex:function(table, idx){
        return this.cellSize;
    },

    numberOfCellsInTableView:function (table) {
        return football.fData.listMatch.length;
    }
});

FBetCell.BTN_BET_SCORE = 0;

FBetCell.BTN_BET_WL0 = 10;
FBetCell.BTN_BET_WL1 = 11;

FBetCell.BTN_BET_TS0 = 20;
FBetCell.BTN_BET_TS1 = 21;