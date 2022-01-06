/**
 * Created by Hunter on 2/13/2017.
 */

var ChatPanelGUI = BaseLayer.extend({
    ctor: function(){
        this._super(ChatPanelGUI.className);

        this.btnClose = null;
        this.btnTab = null;
        this.btnSend = null;
        this.tfChat = null;

        this.bg = null;
        this.pTab = null;
        this.pLeft = null;
        this.pRight = null;
        this.pTabChat = null;
        this.lvTabChat = null;

        this.chatQuickTextPanel = null;
        this.tbChat = null;

        this.listTab = [];
        this.selectedTab = -1;
        this.selectedTabId = -1;
        this.isOpenTabList = false;

        this.initWithBinaryFile("ChatPanelGUI.json");
    },

    initGUI: function(){
        this.bg = this.getControl("bg");
        if (this._scale < 1) this.bg.setScale(this._scale);
        else {
            this.bg.setContentSize(cc.winSize.width, this.bg.getContentSize().height);
            ccui.Helper.doLayout(this.bg);
        }
        this.pTab = this.getControl("pTab", this.bg);
        this.pTab.setLocalZOrder(1);
        this.pLeft = this.getControl("pLeft", this.bg);
        this.pLeft.setCascadeOpacityEnabled(true);
        this.pRight = this.getControl("pRight", this.bg);
        this.pRight.setCascadeOpacityEnabled(true);
        this.pLeft.setContentSize(this.bg.getContentSize().width - this.pRight.getContentSize().width, this.pLeft.getContentSize().height);

        this.btnClose = this.customButton("btnClose", ChatPanelGUI.BTN_CLOSE);
        this.btnTab = this.customButton("btn", ChatPanelGUI.BTN_TAB, this.pTab);
        this.btnTab.setPressedActionEnabled(false);
        this.btnTab.lb = this.getControl("lb", this.btnTab);
        this.btnTab.ico = this.getControl("ico", this.btnTab);
        this.btnTab.notify = this.getControl("notify", this.btnTab);
        this.btnSend = this.customButton("btnSend", ChatPanelGUI.BTN_SEND, this.bg)
        var tfChat = this.getControl("tf");
        var tfSize = tfChat.getContentSize();
        tfChat.setVisible(false);
        tfChat.setContentSize(tfSize.width - this.bg.getContentSize().width + Constant.WIDTH, tfSize.height);
        this.tfChat = BaseLayer.createEditBox(tfChat);
        this.tfChat.setDelegate(this);
        this.tfChat.setCascadeOpacityEnabled(true);
        this.bg.addChild(this.tfChat);

        this.pTabChat = this.getControl("tab", this.pTab);
        this.pTabChat.cellSize = this.pTabChat.getContentSize();
        this.lvTabChat = this.getControl("lv", this.pTabChat);
        this.lvTabChat.setScrollBarEnabled(false);
        this.lvTabChat.setBounceEnabled(false);
        this.lvTabChat.setClippingEnabled(true);
        this.lvTabChat.addEventListener(function(lv, type){
            if (type == ccui.ListView.ON_SELECTED_ITEM_END){
                this.selectTab(lv.getCurSelectedIndex());
            }
        }.bind(this));

        this.chatQuickTextPanel = new ChatQuickTextPanel(this.pRight, this);
        this.tbChat = new cc.TableView(this, this.pLeft.getContentSize());
        this.tbChat.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.tbChat.setAnchorPoint(0, 0);
        this.tbChat.setPosition(0, 0);
        this.tbChat.setVerticalFillOrder(cc.TABLEVIEW_FILL_BOTTOMUP);
        this.tbChat.setDelegate(this);
        this.tbChat.setBounceable(false);
        this.tbChat.setClippingToBounds(true);
        this.tbChat.setCascadeOpacityEnabled(true);
        this.tbChat.getContainer().setCascadeOpacityEnabled(true);
        this.pLeft.addChild(this.tbChat);

        this.setBackEnable(true);
    },

    onEnterFinish: function(){
        this.bg.setPositionY(this.bg.defaultPos.y - this.bg.getContentSize().height);
        this.bg.setOpacity(0);
        this.bg.stopAllActions();
        this.bg.runAction(cc.spawn(
            cc.moveTo(0.25, this.bg.defaultPos).easing(cc.easeSineIn()),
            cc.fadeIn(0.25)
        ));

        this.onUpdateGUI();
        this.showTabList(false, 0);
        this.chatQuickTextPanel.reloadData();
    },

    onUpdateGUI: function(){
        this.selectedTab = -1;
        this.updateTabList();
        this.selectTab(this.selectedTab);
    },

    onButtonRelease: function(button, id){
        switch(id){
            case ChatPanelGUI.BTN_CLOSE:
                this.onBack();
                break;
            case ChatPanelGUI.BTN_TAB:
                this.showTabList(!this.isOpenTabList);
                break;
            case ChatPanelGUI.BTN_SEND:
                this.onSendChat(this.tfChat.getString().trim());
                break;
        }
    },

    onBack: function(){
        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(0.25, this.bg.defaultPos.x, this.bg.defaultPos.y - this.bg.getContentSize().height).easing(cc.easeSineIn()),
                cc.fadeOut(0.25)
            ),
            cc.callFunc(function(){
                this.removeFromParent();
            }.bind(this))
        ));
    },

    /* region tabs */
    addTab: function(id, name){
        this.listTab.push({id: id, name:name});
        var tabItem = new ccui.Layout();
        tabItem.setTouchEnabled(true);
        tabItem.setContentSize(this.lvTabChat.getContentSize().width, this.pTabChat.cellSize.height);
        var tabName = new ccui.Text(name, "fonts/tahoma.ttf", 15);
        tabName.subText = 12;
        this.setLabelText(name, tabName);
        tabName.setPosition(tabItem.getContentSize().width/2, tabItem.getContentSize().height/2);
        tabItem.addChild(tabName);
        tabItem.setTouchEnabled(true);
        tabItem.notify = new ccui.ImageView("ChatNew/redDot.png");
        tabItem.notify.setScale(0.6);
        tabItem.notify.setAnchorPoint(0.5, 0.5);
        tabItem.notify.setPosition(
            this.pTabChat.getContentSize().width + (this.lvTabChat.getContentSize().width - this.pTabChat.getContentSize().width)/2,
            this.pTabChat.cellSize.height - tabItem.notify.getContentSize().height/2 * tabItem.notify.getScale()
        );
        tabItem.addChild(tabItem.notify);
        this.lvTabChat.pushBackCustomItem(tabItem);

        this.reloadListTabSize();
    },

    reloadListTabSize: function(){
        this.pTabChat.setContentSize(this.pTabChat.getContentSize().width, this.pTabChat.cellSize.height * Math.min(ChatPanelGUI.MAX_VISIBLE_TAB, this.listTab.length));
        ccui.Helper.doLayout(this.pTabChat);
    },

    selectTabById: function(id){
        var idx = -1;
        for (var i = 0; i < this.listTab.length; i++){
            if (this.listTab[i].id == id){
                idx = i;
                break;
            }
        }
        this.selectTab(idx);
    },

    selectTab: function(idx){
        if (idx < 0 || idx >= this.listTab.length) idx = 0;
        this.selectedTab = idx;
        this.selectedTabId = this.listTab[idx].id;

        var tab = this.listTab[this.selectedTab];
        this.setLabelText(tab.name, this.btnTab.lb);
        this.showTabList(false);
        this.tbChat.reloadData();
        this.tbChat.setContentOffset(cc.p(0, 0));

        chatMgr.onNotify(this.selectedTabId, false);
    },

    updateTabList: function(){
        this.lvTabChat.removeAllChildren();
        this.listTab = [];
        this.addTab(0, LocalizedString.to("CHAT_ROOM"));
        this.lvTabChat.getItem(0).notify.setVisible(chatMgr.chatRoom.notify);
        if (this.selectedTabId == 0) this.selectedTab = 0;
        for (var i = 0; i < chatMgr.userTrack.length; i++) {
            var id = chatMgr.userTrack[i];
            this.addTab(Number(id), chatMgr.chatUsers[id].userName);
            this.lvTabChat.getItem(i + 1).notify.setVisible(chatMgr.chatUsers[id].notify);
            if (this.selectedTabId == id) this.selectedTab = i + 1;
        }
        if (this.selectedTab == -1) this.selectedTabId = -1;
    },

    showTabList: function(show, duration){
        if (duration == undefined) duration = Math.min(0.075 * this.listTab.length, 0.25);
        this.pTabChat.stopAllActions();
        this.btnTab.ico.stopAllActions();
        this.btnTab.notify.stopAllActions();
        this.isOpenTabList = show;

        if (show){
            this.pTabChat.runAction(cc.sequence(
                cc.show(),
                cc.spawn(
                    cc.fadeIn(duration),
                    cc.moveTo(duration, this.pTabChat.defaultPos).easing(cc.easeSineOut())
                )
            ));
            this.btnTab.ico.runAction(cc.rotateTo(duration, 0));
            this.btnTab.notify.runAction(cc.fadeOut(duration));
        }
        else {
            this.pTabChat.runAction(cc.sequence(
                cc.spawn(
                    cc.fadeOut(duration),
                    cc.moveTo(duration, this.pTabChat.defaultPos.x, this.pTabChat.defaultPos.y + this.pTabChat.getContentSize().height).easing(cc.easeSineOut())
                ),
                cc.hide()
            ));
            this.btnTab.ico.runAction(cc.rotateTo(duration, 180));
            this.btnTab.notify.runAction(cc.fadeIn(duration));
        }
    },
    /* endregion tabs */

    /* region chat history */
    tableCellAtIndex: function(table, idx){
        var cell = table.dequeueCell();
        if (!cell) cell = new ChatItemCell(this.pLeft.getContentSize().width);
        var tab = this.listTab[this.selectedTab];
        var tabData = tab.id == 0 ? chatMgr.chatRoom.dialog : chatMgr.chatUsers[tab.id].dialog;
        var chatInfo = tabData[tabData.length - idx - 1];
        cell.setInfo(chatInfo);
        return cell;
    },

    tableCellSizeForIndex: function(table, idx){
        var tab = this.listTab[this.selectedTab];
        var tabData = tab.id == 0 ? chatMgr.chatRoom.dialog : chatMgr.chatUsers[tab.id].dialog;
        var chatInfo = tabData[tabData.length - idx - 1];
        if (chatInfo.cellSize) return chatInfo.cellSize;
        else return (chatInfo.cellSize = ChatItemCell.getCellSize(
            ChatItemCell.getFullMessage(chatInfo.userName, chatInfo.message),
            this.pLeft.getContentSize().width - ChatItemCell.PADDING * 2
        ));
    },

    numberOfCellsInTableView: function(table) {
        if (this.selectedTab < 0 || this.selectedTab >= this.listTab.length) return 0;
        var tab = this.listTab[this.selectedTab];
        var tabData = tab.id == 0 ? chatMgr.chatRoom.dialog : chatMgr.chatUsers[tab.id].dialog;
        return tabData ? tabData.length : 0;
    },

    tableCellTouched: function(table, cell){
        var tab = this.listTab[this.selectedTab];
        var tabData = tab.id == 0 ? chatMgr.chatRoom.dialog : chatMgr.chatUsers[tab.id].dialog;
        var chatInfo = tabData[tabData.length - cell.getIdx() - 1];
        if (chatInfo.uId == gamedata.userData.uID){
            var gui = sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
            gui.setInfo(gamedata.userData);
            this.onBack();
        }
        else {
            if (chatInfo.userName != "") {
                chatMgr.sendGetOtherInfo(chatInfo.uId);
                this.onBack();
            }
        }
    },

    editBoxReturn: function (editBox) {
        this.onSendChat(editBox.getString().trim());
    },

    onSendChat: function(message){
        this.tfChat.setString(message);
        if (message != "") {
            if (message.length > ChatMgr.MESSAGE_MAX_LENGTH){
                Toast.makeToast(Toast.SHORT, StringUtility.replaceAll(LocalizedString.to("CHATLONG"), "@num", ChatMgr.MESSAGE_MAX_LENGTH));
                return;
            }
            else message = ChatFilter.filterString(message);
            var dialog = [];
            if (this.selectedTab == 0)
                dialog = chatMgr.chatRoom.dialog;
            else if(this.selectedTab > 0 && this.selectedTab < this.listTab.length)
                dialog = chatMgr.chatUsers[this.listTab[this.selectedTab].id].dialog;
            if (dialog.length > 0 && dialog[dialog.length - 1].uId == gamedata.userData.uID && message == dialog[dialog.length - 1].message){
                Toast.makeToast(Toast.SHORT, LocalizedString.to("CHATSAME"));
                return;
            }
            if (this.selectedTab == 0)
                chatMgr.sendChatRoom(message);
            else if(this.selectedTab > 0 && this.selectedTab < this.listTab.length)
                chatMgr.sendChatUser(this.listTab[this.selectedTab].id, message);
            this.tfChat.setString("");
            this.onBack();
        }
    },

    onReceiveChat: function(id){
        if (this.selectedTabId == id){
            this.tbChat.reloadData();
            this.tbChat.setContentOffset(cc.p(0, 0));
            chatMgr.onNotify(id, false);
        }
    },

    onNotify: function(id, notify){
        for (var i = 0; i < this.listTab.length; i++){
            if (this.listTab[i].id == id){
                this.lvTabChat.getItem(i).notify.setVisible(notify);
            }
        }
        if (notify) this.btnTab.notify.setVisible(true);
        else this.btnTab.notify.setVisible(chatMgr.isNotify());
    }
    /* endregion chat history */
});

ChatPanelGUI.className = "ChatPanelGUI";
ChatPanelGUI.TAG = 301;
ChatPanelGUI.BTN_CLOSE = 0;
ChatPanelGUI.BTN_TAB = 1;
ChatPanelGUI.BTN_SEND = 2;
ChatPanelGUI.MAX_VISIBLE_TAB = 4;

var ChatItemCell = cc.TableViewCell.extend({
    ctor: function(maxWidth){
        this._super();
        this.maxWidth = maxWidth;

        this._layout = new ccui.Layout();
        this._layout.setPositionX(ChatItemCell.PADDING);
        this.addChild(this._layout);
        this.txtName = new ccui.Text("", "fonts/tahoma.ttf", 16);
        this.txtName.setAnchorPoint(0, 1);
        this.txtName.ignoreContentAdaptWithSize(true);
        this.txtMess = new ccui.Text("", "fonts/tahoma.ttf", 16);
        this.txtMess.setAnchorPoint(0, 1);
        this.txtMess.ignoreContentAdaptWithSize(true);
        this._layout.addChild(this.txtName, 1);
        this._layout.addChild(this.txtMess, 0);
    },

    setInfo: function(chatInfo){
        this.txtName.setString(chatInfo.userName != "" ? chatInfo.userName + ":" : "");
        this.txtName.setColor(chatInfo.uId == gamedata.userData.uID ? sceneMgr.ccBlue : sceneMgr.ccYellow);
        this.txtMess.setString(ChatItemCell.getFullMessage(chatInfo.userName, chatInfo.message));
        this.txtMess.setColor(chatInfo.userName != "" ? cc.WHITE : cc.RED);
        StringUtility.breakLabelToMultiLine(this.txtMess, this.maxWidth - 2 * ChatItemCell.PADDING);
        this.txtMess.setPositionY(this.txtMess.getContentSize().height);
        this.txtName.setPositionY(this.txtMess.getContentSize().height);
        this._layout.setContentSize(this.maxWidth - ChatItemCell.PADDING * 2, this.txtMess.getContentSize().height);
    }
});

ChatItemCell.PADDING = 3;

ChatItemCell.getFullMessage = function(userName, message){
    if (userName != "")
        return userName + ": " + message;
    else return message;
};

ChatItemCell.getCellSize = function(message, maxWidth){
    var lb = new ccui.Text(message, "fonts/tahoma.ttf", 16);
    StringUtility.breakLabelToMultiLine(lb, maxWidth);
    return cc.size(maxWidth, lb.getContentSize().height);
};

var ChatQuickTextPanel = cc.Class.extend({
    ctor: function(_layout, panel){
        this.panel = panel;

        this.listTxt = [];
        for (var i = 0; i < ChatQuickTextPanel.NUM_TXT; i++){
            this.listTxt.push(LocalizedString.to("CHAT_" + (i + 1)));
        }

        this._layout = _layout;
        this.tbTxt = new cc.TableView(this, this._layout.getContentSize());
        this.tbTxt.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.tbTxt.setAnchorPoint(0, 0);
        this.tbTxt.setPosition(0, 0);
        this.tbTxt.setVerticalFillOrder(0);
        this.tbTxt.setDelegate(this);
        this.tbTxt.setCascadeOpacityEnabled(true);
        this.tbTxt.getContainer().setCascadeOpacityEnabled(true);
        this._layout.addChild(this.tbTxt);
    },

    tableCellAtIndex: function(table, idx){
        var cell = table.dequeueCell();
        if (!cell) cell = new ChatQuickTextCell();
        cell.setChat(this.listTxt[idx]);
        return cell;
    },

    tableCellSizeForIndex: function(table, idx){
        return ChatQuickTextCell.SIZE;
    },

    numberOfCellsInTableView: function(table){
        return this.listTxt.length;
    },

    tableCellTouched: function(table, cell){
        this.panel.onSendChat(this.listTxt[cell.getIdx()]);
    },

    reloadData: function(){
        this.tbTxt.reloadData();
    }
});

ChatQuickTextPanel.NUM_TXT = 12;

var ChatQuickTextCell = cc.TableViewCell.extend({
    ctor: function(){
        this._super();

        this._layout = new cc.Layer(ChatQuickTextCell.SIZE);
        this._layout.setCascadeOpacityEnabled(true);
        this.addChild(this._layout);
        this.bg = new cc.Sprite("ChatNew/bgText.png");
        this.bg.setAnchorPoint(0.5, 0.5);
        this.bg.setPosition(ChatQuickTextCell.SIZE.width/2, ChatQuickTextCell.SIZE.height/2);
        this._layout.addChild(this.bg);
        this.txt = new ccui.Text("", "fonts/tahoma.ttf", 16);
        this.txt.setColor(cc.color(44, 16, 0, 0));
        this.txt.setAnchorPoint(0.5, 0.5);
        this.txt.setPosition(ChatQuickTextCell.SIZE.width/2, ChatQuickTextCell.SIZE.height/2);
        this._layout.addChild(this.txt);
    },

    setChat: function(txt) {
        this.txt.setString(txt);
    }
});

ChatQuickTextCell.SIZE = cc.size(270, 38);