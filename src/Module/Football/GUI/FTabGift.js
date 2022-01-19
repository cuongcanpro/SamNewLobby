/**
 * Created by HunterPC on 9/8/2015.
 */

var FGiftCell = FootballCell.extend({

    ctor : function () {
        this.bg0 = null;
        this.bg1 = null;

        this.lbTime = null;
        this.lbDate = null;
        this.flagTeam0 = null;
        this.nameTeam0 = null;
        this.flagTeam1 = null;
        this.nameTeam1 = null;
        this.lbBetInfo = null;

        this.lbMoney = null;
        this.lbGameName = null;
        this.btnGetGift = null;
        this.imgGetGift = null;

        this._super("FGiftCell");
        this.initWithJson("FGiftCell.json",cc.size(cc.winSize.width,FGiftCell.HEIGHT));
    },

    customizeGUI : function () {
        this.bg0 = this.getControl("bg0");
        this.bg1 = this.getControl("bg1");
        this.bg0.setScaleY(this._scale);
        this.bg1.setScaleY(this._scale);
        var delta = this.bg0.getContentSize().height*(1 - this._scale)/2;
        this._layout.setPositionY(this._layout.getPositionY() - delta);

        for(var i = 0 ; i < 4 ; i++)
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

        this.lbMoney = this.getControl("lbWin");
        this.lbGameName = this.getControl("lbGame");
        this.imgGetGift = this.getControl("imgAccepted");

        this.btnGetGift = this.customizeButton("btnAccept",this._layout,1);
    },

    onGetGift : function () {
        var cmd = new CmdSendGetBet();
        cmd.putData(this.match.historyBetId, this.match.game);
        GameClient.getInstance().sendPacket(cmd);
        cmd.clean();
    },

    setGift : function (index) {
        this.bg0.setVisible(index % 2 == 0);
        this.bg1.setVisible(index % 2 == 1);

        this.match = football.fData.listGift[index];
        var team0 = football.getTeamData(this.match.homeId);
        var team1 = football.getTeamData(this.match.awayId);

        var sNameTeam0 = football.getTeam(this.match.homeId);
        var sNameTeam1 = football.getTeam(this.match.awayId);

        this.lbTime.setString(football.getClock(this.match.time));
        this.lbDate.setString(football.getDate(this.match.time));

        this.nameTeam0.setString(sNameTeam0);
        this.nameTeam1.setString(sNameTeam1);

        this.flagTeam0.asyncExecuteWithUrl("Flag" + md5(sNameTeam0), football.getFlag(this.match.homeId));
        this.flagTeam1.asyncExecuteWithUrl("Flag" + md5(sNameTeam1),football.getFlag(this.match.awayId));

        this.lbMoney.setString(StringUtility.formatNumberSymbol(this.match.totalMoneyGet));
        this.lbGameName.setString(this.match.game);

        this.btnGetGift.setVisible(!this.match.isReceive);
        this.imgGetGift.setVisible(this.match.isReceive);

        var s = "";
        if(this.match.betType == Football.RESULT)
        {
            s = LocalizedString.to("RESULT") + " " + this.match.duDoanScoreHome + " - " + this.match.duDoanScoreAway;
        }
        else if(this.match.betType == Football.RESULT_RATE)
        {
            if(this.match.betValue == 1)
            {
                s = sNameTeam0;
                s = s + " " + football.getFraction(this.match.rateMatch);
            }
            else
            {
                s = sNameTeam1;
                s = s + " " + football.getFraction(this.match.rateMatch);
            }
        }
        else
        {
            if(this.match.betValue == 1)
            {
                s = LocalizedString.to("ABOVE") + " " + football.getFraction(this.match.rateMatch);
            }
            else
            {
                s = LocalizedString.to("BELLOW") + " " + football.getFraction(this.match.rateMatch);
            }
        }
        this.lbBetInfo.setString(s);
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
    },

    onButtonRelease : function(btn,id){
        if(id == 1)
        {
            this.onGetGift();
        }
    }
});

var FTabGift = BaseLayer.extend({

    ctor : function (size,pos) {
        this.listView = null;
        this.gSize = size;
        this.gPos = pos;
        this.cellSize = null;

        this._super("FTabGift");
        this.initWithBinaryFile("FTabGift.json");
    },

    initGUI : function () {
        var bgTab = this.getControl("bgTab");
        bgTab.setPositionY(this.gPos.top - bgTab.getContentSize().height*this._scale/2);

        for(var i = 0 ; i < 5 ; i++)
        {
            this.getControl("lb" + i).setPositionY(bgTab.getPositionY());
        }
        for(var i = 0 ; i < 4 ; i++)
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
            cell = new FGiftCell();
        }
        cell.setGift(idx);
        return cell;
    },

    tableCellSizeForIndex:function(table, idx){
        return this.cellSize;
    },

    numberOfCellsInTableView:function (table) {
        return football.fData.listGift.length;
    }
});