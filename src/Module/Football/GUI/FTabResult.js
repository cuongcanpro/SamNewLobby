/**
 * Created by HunterPC on 9/8/2015.
 */

var FResultCell = FootballCell.extend({

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

        this.lbScore = null;
        this.lbStatus = null;
        this.imgStatus = null;

        this._super("FResultCell");
        this.initWithJson("FResultCell.json");
    },

    customizeGUI : function () {
        this.bg0 = this.getControl("bg0");
        this.bg1 = this.getControl("bg1");
        this.bg0.setScaleY(this._scale);
        this.bg1.setScaleY(this._scale);

        var delta = this.bg0.getContentSize().height*(1 - this._scale)/2;
        this._layout.setPositionY(this._layout.getPositionY() - delta);

        for(var i = 0 ; i < 3 ; i++)
        {
            this.getControl("sp" + i);
        }

        var pTime    = this.getControl("panelTime");
        var pMatch   = this.getControl("panelInfo");
        var pStatus  = this.getControl("panelStatus");

        this.lbTime = this.getControl("lbTime",pTime);
        this.lbDate = this.getControl("lbDate",pTime);

        this.flagTeam0 = this.replaceFlagTeam(this.getControl("flagTeam0",pMatch),pMatch);
        this.nameTeam0 = this.getControl("nameTeam0",pMatch);
        this.flagTeam1 = this.replaceFlagTeam(this.getControl("flagTeam1",pMatch),pMatch);
        this.nameTeam1 = this.getControl("nameTeam1",pMatch);
        this.flagTeam0.setPositionY(this.nameTeam0.getPositionY());
        this.flagTeam1.setPositionY(this.nameTeam1.getPositionY());

        this.lbScore = this.getControl("lbResult");

        this.lbStatus = this.getControl("lbState",pStatus);
        this.imgStatus = this.getControl("imgState",pStatus);
    },

    setMatch : function (index) {
        this.bg0.setVisible(index % 2 == 0);
        this.bg1.setVisible(index % 2 == 1);

        this.match = football.fData.listMatchDone[index];
        var team0 = football.getTeamData(this.match.home);
        var team1 = football.getTeamData(this.match.away);

        var sNameTeam0 = football.getTeam(this.match.home);
        var sNameTeam1 = football.getTeam(this.match.away);

        this.lbTime.setString(football.getClock(this.match.time));
        this.lbDate.setString(football.getDate(this.match.time));

        this.nameTeam0.setString(sNameTeam0);
        this.nameTeam1.setString(sNameTeam1);

        this.flagTeam0.setDefaultImage();
        this.flagTeam1.setDefaultImage();

        this.flagTeam0.asyncExecuteWithUrl("Flag" + md5(sNameTeam0), football.getFlag(this.match.home));
        this.flagTeam1.asyncExecuteWithUrl("Flag" + md5(sNameTeam1), football.getFlag(this.match.away));

        this.lbScore.setString(this.match.scoreResultHome + " - " + this.match.scoreResultAway);

        var s = "";
        if(this.match.status == Football.MATCH_STATUS_DONE)
        {
            s = LocalizedString.to("END");
            this.imgStatus.setVisible(true);
        }
        else
        {
            s = LocalizedString.to("DELAY");
            this.lbScore.setString("-- --");
            this.imgStatus.setVisible(false);
        }

        this.lbStatus.setString(s);
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

var FTabResult = BaseLayer.extend({

    ctor : function (size,pos) {
        this.listView = null;
        this.gSize = size;
        this.gPos = pos;
        this.cellSize = null;

        this._super("FTabResult");
        this.initWithBinaryFile("FTabResult.json");
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
        this.listView.setVerticalFillOrder(1);
        this._layout.addChild(this.listView);

        this.listView.reloadData();
    },

    tableCellAtIndex:function (table, idx) {
        var cell = table.dequeueCell();
        if(!cell)
        {
            cell = new FResultCell();
        }
        cell.setMatch(idx);
        return cell;
    },

    tableCellSizeForIndex:function(table, idx){
        return this.cellSize;
    },

    numberOfCellsInTableView:function (table) {
        return football.fData.listMatchDone.length;
    }
});