/**
 * Created by HunterPC on 9/9/2015.
 */

var FRankCell = FootballCell.extend({

    ctor : function () {
        this.info = null;

        this.bg0 = null;
        this.bg1 = null;

        this.lbRank = null;
        this.lbName = null;
        this.lbWin = null;
        this.lbDraw = null;
        this.lbLose = null;
        this.lbPerWin = null;
        this.lbPoint = null;

        this._super("FRankCell");
        this.initWithJson("FRankCell.json");
    },

    customizeGUI : function () {
        this.bg0 = this.getControl("bg0");
        this.bg1 = this.getControl("bg1");
        this.bg0.setScaleY(this._scale);
        this.bg1.setScaleY(this._scale);
        var delta = this.bg0.getContentSize().height*(1 - this._scale)/2;
        this._layout.setPositionY(this._layout.getPositionY() - delta);

        for(var i = 0 ; i < 6 ; i++)
        {
            this.getControl("sp" + i);
        }

        this.lbRank = this.getControl("lbRank");
        this.lbName = this.getControl("lbName");
        this.lbWin = this.getControl("lbWin");
        this.lbDraw = this.getControl("lbDraw");
        this.lbLose = this.getControl("lbLose");
        this.lbPerWin = this.getControl("lbPerWin");
        this.lbPoint = this.getControl("lbPoint");
    },

    setInfo : function (idx,tab) {
        this.bg0.setVisible(idx % 2 == 0);
        this.bg1.setVisible(idx % 2 == 1);

        this.info = (tab == FTabRank.TAB_CAO_THU)?football.fData.listCaoThu[idx] : football.fData.listXuiXeo[idx];

        this.lbRank.setString(idx + 1);
        this.lbName.setString(this.info.username);
        this.lbWin.setString(StringUtility.pointNumber(this.info.nWin));
        this.lbDraw.setString(StringUtility.pointNumber(this.info.nDraw));
        this.lbLose.setString(StringUtility.pointNumber(this.info.nLost));
        this.lbPerWin.setString(StringUtility.pointNumber(this.info.rateWin) + "%");
        this.lbPoint.setString(StringUtility.formatNumberSymbol(this.info.point));
    }
});

var FTabRank = BaseLayer.extend({

    ctor : function (gSize,gPos) {
        this.tabCaothu = null;
        this.tabXuixeo = null;

        this.rankList = null;
        this.rankDetail = null;

        this.gSize = gSize;
        var sPos = JSON.stringify(gPos);
        this.gPos = JSON.parse(sPos);

        this._super("FTabResult");
        this.initWithBinaryFile("FTabRank.json");
    },

    initGUI : function () {
        var p = this.getControl("pTab");
        p.setPositionY(this.gPos.top);

        this.gSize -= p.getContentSize().height*this._scale;
        this.gPos.top -= p.getContentSize().height*this._scale;

        var sizeTab = p.getContentSize().width/2;

        this.tabCaothu = this.customButton("tabCaothu",0);
        this.tabXuixeo = this.customButton("tabXuixeo",1);

        this.tabCaothu.setScaleX(sizeTab/this.tabCaothu.getContentSize().width);
        this.tabXuixeo.setScaleX(sizeTab/this.tabCaothu.getContentSize().width);
        this.tabCaothu.setScaleY(this._scale);
        this.tabXuixeo.setScaleY(this._scale);

        this.tabCaothu.setPositionX(sizeTab/2);
        this.tabXuixeo.setPositionX(sizeTab + sizeTab/2);

        this.tabCaothu.setPositionY(p.getPositionY());
        this.tabXuixeo.setPositionY(p.getPositionY());

        this.tabCaothu.setPressedActionEnabled(false);
        this.tabXuixeo.setPressedActionEnabled(false);

        var yPos = this.tabCaothu.getPositionY() - this.tabCaothu.getContentSize().height*this._scale/2;

        this.tabCaothu.normal = this.getControl("tabCaothu0");
        this.tabCaothu.select = this.getControl("tabCaothu1");

        this.tabXuixeo.normal = this.getControl("tabXuixeo0");
        this.tabXuixeo.select = this.getControl("tabXuixeo1");

        this.tabCaothu.normal.setPosition(this.tabCaothu.getPositionX(),yPos);
        this.tabCaothu.select.setPosition(this.tabCaothu.getPositionX(),yPos);
        this.tabXuixeo.normal.setPosition(this.tabXuixeo.getPositionX(),yPos);
        this.tabXuixeo.select.setPosition(this.tabXuixeo.getPositionX(),yPos);

        this.rankList = new FRankList(this);
        this.rankList.setVisible(true);
        this.addChild(this.rankList);

        this.rankDetail = new FRankDetail(this);
        this.rankDetail.setVisible(false);
        this.addChild(this.rankDetail);

        this.switchTab(FTabRank.TAB_CAO_THU);
    },

    switchTab : function (tab) {
        this.rankDetail.setVisible(false);
        this.rankList.setVisible(true);
        this.rankList.switchTab(tab);

        this.tabCaothu.loadTextures("GUIMinigame/tabDeSelect.png","GUIMinigame/tabDeSelect.png","");
        this.tabXuixeo.loadTextures("GUIMinigame/tabDeSelect.png","GUIMinigame/tabDeSelect.png","");

        this.tabCaothu.normal.setVisible(false);
        this.tabCaothu.select.setVisible(false);

        this.tabXuixeo.select.setVisible(false);
        this.tabXuixeo.normal.setVisible(false);

        if(tab == 0)
        {
            this.tabCaothu.loadTextures("GUIMinigame/tabSelect.png","GUIMinigame/tabSelect.png","");
            this.tabCaothu.select.setVisible(true);

            this.tabXuixeo.normal.setVisible(true);
        }
        else
        {
            this.tabXuixeo.loadTextures("GUIMinigame/tabSelect.png","GUIMinigame/tabSelect.png","");
            this.tabXuixeo.select.setVisible(true);

            this.tabCaothu.normal.setVisible(true);
        }
    },

    onClickPlayer : function (name) {
        this.rankDetail.setName(name);
    },

    openRankDetail : function () {
        this.rankDetail.showDetail();
        this.rankList.setVisible(false);
    },

    closeRankDetail : function () {
        this.rankList.setVisible(true);
    },

    onButtonRelease : function (button, id) {
        switch (id)
        {
            case 0 :
            case 1 :
                this.switchTab(id);
                break;
        }
    }
});

var FRankList = BaseLayer.extend({

    ctor : function (parent) {
        this.guiParent = parent;
        this.gSize = parent.gSize;
        this.gPos = parent.gPos;

        this.listView = null;

        this.lbRank = null;
        this.lbName = null;
        this.lbWin = null;
        this.lbDraw = null;
        this.lbLose = null;
        this.lbPerWin = null;
        this.lbPoint = null;

        this.curTab = -1;

        this._super("FRankList");
        this.initWithBinaryFile("FRankList.json");
    },

    initGUI : function () {
        var bgTab = this.getControl("bgTab");
        var bgInfo = this.getControl("bgInfo");
        bgTab.setPositionY(this.gPos.top - bgTab.getContentSize().height*this._scale/2);
        bgInfo.setPositionY(this.gPos.bot + bgInfo.getContentSize().height*this._scale/2);

        for(var i = 0 ; i < 7 ; i++)
        {
            this.getControl("lb" + i).setPositionY(bgTab.getPositionY());
        }
        for(var i = 0 ; i < 6 ; i++)
        {
            this.getControl("sp" + i).setPositionY(bgTab.getPositionY());
            this.getControl("sp0" + i).setPositionY(bgTab.getPositionY());
        }

        this.lbRank = this.getControl("lbRank");
        this.lbName = this.getControl("lbName");
        this.lbWin = this.getControl("lbWin");
        this.lbDraw = this.getControl("lbDraw");
        this.lbLose = this.getControl("lbLose");
        this.lbPerWin = this.getControl("lbPerWin");
        this.lbPoint = this.getControl("lbPoint");

        this.lbRank.setPositionY(bgInfo.getPositionY());
        this.lbName.setPositionY(bgInfo.getPositionY());
        this.lbWin.setPositionY(bgInfo.getPositionY());
        this.lbDraw.setPositionY(bgInfo.getPositionY());
        this.lbLose.setPositionY(bgInfo.getPositionY());
        this.lbPerWin.setPositionY(bgInfo.getPositionY());
        this.lbPoint.setPositionY(bgInfo.getPositionY());

        var _list = this.getControl("pList");
        var _size = cc.size(cc.winSize.width,this.gSize - bgTab.getContentSize().height*this._scale - bgInfo.getContentSize().height*this._scale);

        var rItem = this.getControl("cell",_list);
        rItem.setVisible(false);
        this.cellSize = cc.size(rItem.getContentSize().width,rItem.getContentSize().height*this._scale);

        this.listView = new cc.TableView(this,_size);
        this.listView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listView.setPosition(_list.getPosition().x,this.gPos.bot + bgInfo.getContentSize().height*this._scale);
        this.listView.setVerticalFillOrder(0);
        this.listView.setDelegate(this);
        this._layout.addChild(this.listView);

        this.listView.reloadData();

        this.switchTab(FTabRank.TAB_CAO_THU);
        //this.updateMyData();
    },

    onSelect : function () {
        this.updateMyData();
        this.listView.reloadData();
    },

    updateMyData : function () {
        this.lbName.setString(gamedata.userData.displayName);
        this.lbWin.setString(StringUtility.pointNumber(football.myData.nWin));
        this.lbDraw.setString(StringUtility.pointNumber(football.myData.nDraw));
        this.lbLose.setString(StringUtility.pointNumber(football.myData.nLost));
        this.lbPerWin.setString(StringUtility.pointNumber(football.myData.rateWin) + "%");
        this.lbPoint.setString(StringUtility.formatNumberSymbol(football.myData.point));
    },

    switchTab : function (tab) {
        this.curTab = tab;

        if(tab == FTabRank.TAB_CAO_THU)
        {
            this.lbRank.setString((football.myData.rankCaoThu != 0)?StringUtility.pointNumber(football.myData.rankCaoThu):"--");
        }
        else
        {
            this.lbRank.setString((football.myData.rankXuiXeo != 0)?StringUtility.pointNumber(football.myData.rankXuiXeo):"--");
        }

        this.listView.reloadData();
    },

    onClickPlayer : function (uId,uName) {
        if(uId == gamedata.userData.uID)
        {
            football.fData.listOtherHistory = football.fData.listHistory;

            this.guiParent.openRankDetail();
        }
        else
        {
            cc.log("send get history ");
            var cmd = new CmdSendGetHistory();
            cmd.putData(uId);
            GameClient.getInstance().sendPacket(cmd);

            cmd.clean();
        }

        this.guiParent.onClickPlayer(uName);
    },

    tableCellAtIndex:function (table, idx) {
        var cell = table.dequeueCell();
        if(!cell)
        {
            cell = new FRankCell();
        }
        cell.setInfo(idx,this.curTab);
        return cell;
    },

    tableCellSizeForIndex:function(table, idx){
        return this.cellSize;
    },

    numberOfCellsInTableView:function (table) {
        if(this.curTab == FTabRank.TAB_CAO_THU)
        {
            return football.fData.listCaoThu.length;
        }
        return football.fData.listXuiXeo.length;
    },

    tableCellTouched : function (table, cell) {
        this.onClickPlayer(cell.info.uId,cell.info.username);
    }
});

var FRankDetail  = BaseLayer.extend({
    ctor : function (_parent) {
        this.guiParent = _parent;
        this.gSize = _parent.gSize;
        this.gPos = _parent.gPos;
        this.cellSize = null;

        this.listView = null;
        this.lbUserInfo = null;

        this._super("FRankDetail");
        this.initWithBinaryFile("FRankDetail.json");
    },

    initGUI : function () {

        var bgTab = this.getControl("bgTab");
        var bgInfo = this.getControl("bgInfo");
        bgInfo.setPositionY(this.gPos.top - bgInfo.getContentSize().height*this._scale/2);
        bgTab.setPositionY(this.gPos.top - bgTab.getContentSize().height*this._scale - bgInfo.getContentSize().height*this._scale/2);

        for(var i = 0 ; i < 6 ; i++)
        {
            this.getControl("lb" + i).setPositionY(bgTab.getPositionY());
        }
        for(var i = 0 ; i < 5 ; i++)
        {
            this.getControl("sp" + i).setPositionY(bgTab.getPositionY());
        }

        this.lbUserInfo = this.getControl("lbUserInfo");
        var btn = this.customButton("btnClose",0);
        var icon = this.getControl("icon");
        btn.setPositionY(bgInfo.getPositionY());
        icon.setPositionY(bgInfo.getPositionY());
        this.lbUserInfo.setPositionY(bgInfo.getPositionY());

        var _list = this.getControl("pList");
        var _size = cc.size(cc.winSize.width,this.gSize - bgTab.getContentSize().height*this._scale - bgInfo.getContentSize().height*this._scale);

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

    setName : function (name) {
        this.lbUserInfo.setString(LocalizedString.to("INFO_BET_TOP") + name);
    },

    showDetail : function () {
        this.setVisible(true);
        this.listView.reloadData();
    },

    onButtonRelease : function (button, id) {
        if(id == 0)
        {
            this.setVisible(false);
            this.guiParent.closeRankDetail();
        }
    },

    tableCellAtIndex:function (table, idx) {
        var cell = table.dequeueCell();
        if(!cell)
        {
            cell = new FHistoryCell();
        }
        cell.setMatch(idx,false);
        return cell;
    },

    tableCellSizeForIndex:function(table, idx){
        return this.cellSize;
    },

    numberOfCellsInTableView:function (table) {
        return football.fData.listOtherHistory.length;
    }
});

FTabRank.TAB_CAO_THU = 0;
FTabRank.TAB_XUI_XEO = 1;