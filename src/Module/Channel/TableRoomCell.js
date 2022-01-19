
var TableRoomCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();
        var jsonLayout = ccs.load("RoomItemCell.json");
        this._layout = jsonLayout.node;
        this._layout.setContentSize(cc.winSize.width, this._layout.getContentSize().height);
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.initCell();
    },

    initCell: function () {
        var scale = cc.winSize.width / Constant.WIDTH;
        scale = (scale > 1) ? 1 : scale;

        var bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        sceneMgr.getRunningScene().getMainLayer()._listButton.push(bg);
        var pInfo = ccui.Helper.seekWidgetByName(this._layout, "pInfo");
        var pBet = ccui.Helper.seekWidgetByName(this._layout, "pBet");
        var pNum = ccui.Helper.seekWidgetByName(this._layout, "pNum");

        this.id = ccui.Helper.seekWidgetByName(this._layout, "id");

        this.name = ccui.Helper.seekWidgetByName(pInfo, "name");
        this.name.defaultString = this.name.getString();
        this.bet = ccui.Helper.seekWidgetByName(pBet, "bet");
        this.star = ccui.Helper.seekWidgetByName(pBet, "star");

        this.arrayNum = [];
        for (var i = 0; i < 5; i++) {
            this.arrayNum[i] = new cc.Sprite("ChooseRoomGUI/imgPeople.png");
            pNum.addChild(this.arrayNum[i]);
            this.arrayNum[i].setPosition(40 * (i + 0.5), 20);
        }
        this.type = ccui.Helper.seekWidgetByName(pInfo, "type");

        // scale
        bg.setScaleY(scale);
        pInfo.setScale(scale);
        pBet.setScale(scale);
        pNum.setScale(scale);
        this.id.setScale(scale);

        var delta = bg.getContentSize().height * (1 - scale) / 4;
        this._layout.setPositionY(this._layout.getPositionY() - delta);
    },

    setInfo: function (inf) {
        this.id.setString(inf.tableIndex);
        BaseLayer.subLabelText(this.name, decodeURI(inf.tableName));
        if (inf.type != 1) {
            this.bet.setString(StringUtility.formatNumberSymbol(channelMgr.getBet(inf.bet)));
        }
        else {
            this.bet.setString(StringUtility.formatNumberSymbol(channelMgr.getBetAdvance(inf.bet)));
        }

        this.star.setVisible(inf.bigBet);
        cc.log("TOTAL COUNT " + inf.to)
        for (var i = 0; i < 5; i++) {
            if (i < inf.personCount) {
                this.arrayNum[i].setTexture("ChooseRoomGUI/imgPeople.png");
            }
            else {
                this.arrayNum[i].setTexture("ChooseRoomGUI/imgPeopleEmpty.png");
            }
        }
    }
});