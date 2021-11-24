/**
 * Created by HunterPC on 3/4/2016.
 */

var ChatTableGUI = BaseLayer.extend({

    ctor: function () {
        this.histories = null;
        this.list = [];

        this.panelSize = null;

        this._super();
        this.initWithBinaryFile("ChatTableGUI.json");
    },

    initGUI: function () {
        var ls = this.getControl("chatList");

        this.histories = new cc.TableView(this, ls.getContentSize());
        this.histories.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.histories.setPosition(ls.getPosition());
        this.histories.setVerticalFillOrder(0);
        this.histories.setDelegate(this);
        this.addChild(this.histories);
        this.histories.setScale(this._scale);

        this.panelSize = ls.getContentSize();
    },
    
    updateChats : function () {
        this.list = [];
        var list = chatMgr.chatTotals;
        var size = list.length;
        var nStart = (size > 3)?size-3:0;
        for(var i = nStart ; i < size; i++)
        {
            var str = JSON.stringify(list[i]);
            var obj = JSON.parse(str);

            obj.name = "";
            if(obj.user.uName != "")
            {
                obj.name = obj.user.uName + ": ";
            }
            var fullMsg = ChatMgr.getFullMessage(obj.name,obj.chat,this.panelSize.width);
            var lbMsg = ChatMgr.createText(fullMsg);
            obj.chat = fullMsg;
            obj.size = cc.size(this.panelSize.width,lbMsg.getContentSize().height);

            this.list.push(obj);
        }

        this.histories.reloadData();
        this.histories.setContentOffset(cc.p(0, 0));
    },

    receiveChat: function (sobj) {
        if(sobj.chat == "") return;

        var str = JSON.stringify(sobj);
        var obj = JSON.parse(str);

        obj.name = "";
        if(obj.user.uName != "")
        {
            obj.name = obj.user.uName + ": ";
        }
        var fullMsg = ChatMgr.getFullMessage(obj.name,obj.chat,this.panelSize.width);
        var lbMsg = ChatMgr.createText(fullMsg);
        obj.chat = fullMsg;
        obj.size = cc.size(this.panelSize.width,lbMsg.getContentSize().height);

        if(this.list.length > 8)
        {
            this.list.splice(0,3);
        }
        this.list.push(obj);

        this.histories.reloadData();
        this.histories.setContentOffset(cc.p(0, 0));
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ChatItemCell();
        }
        cell.setChat(this.list[idx]);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return this.list[idx].size;
    },

    numberOfCellsInTableView: function (table) {
        return this.list.length;
    },
});