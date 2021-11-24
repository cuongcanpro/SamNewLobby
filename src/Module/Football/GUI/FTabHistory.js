/**
 * Created by HunterPC on 9/8/2015.
 */

var FHistoryCell = FootballCell.extend({
    ctor : function () {
        this.bg0 = null;
        this.bg1 = null;

        this.match = null;

        this.lbTime = null;
        this.lbDate = null;

        this.nameTeam0 = null;
        this.flagTeam0 = null;
        this.nameTeam1 = null;
        this.flagTeam1 = null;
        this.betInfo = null;

        this.lbRate = null;
        this.lbGoldBet = null;
        this.lbGoldGet = null;
        this.lbResult = null;

        this._super("FHistoryCell");
        this.initWithJson("FHistoryCell.json");
    },

    customizeGUI : function () {
        this.bg0 = this.getControl("bg0");
        this.bg1 = this.getControl("bg1");
        this.bg0.setScaleY(this._scale);
        this.bg1.setScaleY(this._scale);
        var delta = this.bg0.getContentSize().height*(1 - this._scale)/2;
        this._layout.setPositionY(this._layout.getPositionY() - delta);

        for(var i = 0 ; i < 5 ; i++)
        {
            this.getControl("sp" + i);
        }

        var pTime   = this.getControl("panelTime");
        var pMatch  = this.getControl("panelInfo");

        this.lbTime = this.getControl("lbTime",pTime);
        this.lbDate = this.getControl("lbDate",pTime);

        this.flagTeam0 = this.replaceFlagTeam(this.getControl("flagTeam0",pMatch),pMatch);
        this.nameTeam0 = this.getControl("nameTeam0",pMatch);
        this.flagTeam1 = this.replaceFlagTeam(this.getControl("flagTeam1",pMatch),pMatch);
        this.nameTeam1 = this.getControl("nameTeam1",pMatch);
        this.flagTeam0.setPositionY(this.nameTeam0.getPositionY());
        this.flagTeam1.setPositionY(this.nameTeam1.getPositionY());
        this.lbBetInfo = this.getControl("lbInfoResult",pMatch);

        this.lbRate = this.getControl("lbRate");
        this.lbGoldBet = this.getControl("lbBet");
        this.lbGoldGet = this.getControl("lbGet");
        this.lbResult = this.getControl("lbResult");
    },

    setMatch : function (index,myHistory) {
        this.bg0.setVisible(index % 2 == 0);
        this.bg1.setVisible(index % 2 == 1);

        this.match = myHistory?football.fData.listHistory[index]:football.fData.listOtherHistory[index];
        var team0 = football.getTeamData(this.match.homeId);
        var team1 = football.getTeamData(this.match.awayId);

        var sNameTeam0 = football.getTeam(this.match.homeId);
        var sNameTeam1 = football.getTeam(this.match.awayId);

        this.lbTime.setString(football.getClock(this.match.time));
        this.lbDate.setString(football.getDate(this.match.time));

        this.nameTeam0.setString(sNameTeam0);
        this.nameTeam1.setString(sNameTeam1);

        this.flagTeam0.setDefaultImage();
        this.flagTeam1.setDefaultImage();

        this.flagTeam0.asyncExecuteWithUrl("Flag" + md5(sNameTeam0), football.getFlag(this.match.homeId));
        this.flagTeam1.asyncExecuteWithUrl("Flag" + md5(sNameTeam1), football.getFlag(this.match.awayId));

        var s = "";
        if(this.match.betType == Football.RESULT)
        {
            s = LocalizedString.to("RESULT") + " " + this.match.duDoanScoreHome + " - " + this.match.duDoanScoreAway;
        }
        else if(this.match.betType == Football.RESULT_RATE)
        {
            s = ((this.match.betValue == 1)? sNameTeam0 : sNameTeam1) + " " + football.getFraction(this.match.rateMatch);
            this.changeSpecialText(this.lbBetInfo,this.match.rateMatch <= 0);

        }
        else
        {
            s = (this.match.betValue == 1)?LocalizedString.to("ABOVE"):LocalizedString.to("BELLOW") + " " + football.getFraction(this.match.rateMatch);
        }
        this.lbBetInfo.setString(s);

        this.lbRate.setString(football.getDouble(this.match.rateMoney));
        this.changeSpecialText(this.lbRate,this.match.rateMoney <= 0);

        this.lbGoldBet.setString(StringUtility.formatNumberSymbol(this.match.moneyBet));
        if(this.match.nResult == 1)
        {
            this.changeSpecialText(this.lbGoldGet,this.match.moneyGet < 0);
            this.lbGoldGet.setString(StringUtility.formatNumberSymbol(this.match.moneyGet));
        }
        else
        {
            this.lbGoldGet.setString("0");
            this.changeSpecialText(this.lbGoldGet,false);
        }

        switch (this.match.status)
        {
            case Football.MATCH_STATUS_DONE:
                s = this.match.scoreHome + " - " + this.match.scoreAway;
                break;
            case Football.MATCH_STATUS_DELAY:
                s = LocalizedString.to("DELAY");
                break;
            case Football.MATCH_STATUS_NOT_DONE:
                s = "-- --";
                break;
        }
        this.lbResult.setString(s);
    },

    changeSpecialText : function (lb, b) {
        if(b)
        {
            lb.setColor(sceneMgr.ccYellow);
        }
        else
        {
            lb.setColor(sceneMgr.ccWhite);
        }
    }
});

var FTabHistory = BaseLayer.extend({

    ctor : function (size,pos) {
        this.listView = null;
        this.gSize = size;
        this.gPos = pos;
        this.cellSize = null;

        this._super("FTabHistory");
        this.initWithBinaryFile("FTabHistory.json");
    },

    initGUI : function () {
        var bgTab = this.getControl("bgTab");
        bgTab.setPositionY(this.gPos.top - bgTab.getContentSize().height*this._scale/2);

        for(var i = 0 ; i < 6 ; i++)
        {
            this.getControl("lb" + i).setPositionY(bgTab.getPositionY());
        }
        for(var i = 0 ; i < 5 ; i++)
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
            cell = new FHistoryCell();
        }
        cell.setMatch(idx,true);
        return cell;
    },

    tableCellSizeForIndex:function(table, idx){
        return this.cellSize;
    },

    numberOfCellsInTableView:function (table) {
        return football.fData.listHistory.length;
    }
});