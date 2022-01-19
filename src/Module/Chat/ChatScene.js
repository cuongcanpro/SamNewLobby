/**
 * Created by HunterPC on 3/2/2016.
 */

var ChatFriendCell = cc.TableViewCell.extend({

    ctor: function () {
        this.avatar = null;
        this.name = null;
        this.status = null;

        this.info = null;

        this._super();
        var jsonLayout = ccs.load("ChatFriendItemCell.json");

        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this._scale = cc.director.getWinSize().width/Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);

        this.customizeGUI();
    },

    customizeGUI: function () {
        this.avatar = ccui.Helper.seekWidgetByName(this._layout, "avatar");

        this._uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");////engine.UIAvatar.create("Common/defaultAvatar.png");
        var size = this.avatar.getContentSize();
        this._uiAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        this.avatar.addChild(this._uiAvatar);

        this.name = ccui.Helper.seekWidgetByName(this._layout, "name");
        this.name.defaultString = this.name.getString();
        this.status = ccui.Helper.seekWidgetByName(this._layout, "status");
        this.on = ccui.Helper.seekWidgetByName(this._layout, "on");
        this.off = ccui.Helper.seekWidgetByName(this._layout, "off");
    },

    setInfo: function (info) {
        this.info = info;

        BaseLayer.subLabelText(this.name,info.uName);
        this._uiAvatar.asyncExecuteWithUrl(info.zName, info.avatar);
        this.status.setString(info.isOnline ? "Online":"Offline");
        this.status.setColor(info.isOnline?sceneMgr.ccGreen:sceneMgr.ccWhite);
        this.on.setVisible(info.isOnline);
        this.off.setVisible(!info.isOnline);
    },

    getUserData : function () {
        var udata = {};

        udata.avatar = this.info.avatar;
        udata.levelScore = this.info.exp;
        udata.displayName= this.info.uName;
        udata.winCount= this.info.win;
        udata.lostCount= this.info.lost;
        udata.bean= this.info.gold;
        udata.uID= this.info.uId;
        udata.zName= this.info.zName;
        udata.level = this.info.level;
        udata.levelExp = this.info.levelExp;
        return udata;
    },
});

var ChatItemCell = cc.TableViewCell.extend({
    ctor: function (size,scale) {
        this.info = null;
        this.cellSize = size;

        this._super();

        if(scale == undefined)
        {
            scale = false;
        }

        this._scale = cc.director.getWinSize().width/Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;

        if(scale)
            this.setScale(this._scale);
    },

    setChat: function (obj) {
        this.info = obj;

        var isMine = obj.user.uName === gamedata.userData.displayName;

        var name = obj.name;
        var msg = obj.chat;

        this.removeAllChildren();

        cc.log("CHAT CELL SIZE", JSON.stringify(this.cellSize), msg);
        var bg = new ccui.ImageView("Board/ChatNew/bg" + (isMine? "Mine" : "Opp") + ".png");
        bg.setCapInsets(cc.rect(20, 10, 300, 39));
        bg.setAnchorPoint(cc.p(0, 0));
        bg.setPosition(cc.p(
            ChatHistoryPanel.MARGIN - ChatHistoryPanel.MARGIN_BUBBLE,
            ChatHistoryPanel.MARGIN - ChatHistoryPanel.MARGIN_BUBBLE_HEIGHT
        ));
        bg.setScale9Enabled(true);
        bg.setContentSize(cc.size(
            this.cellSize.width + ChatHistoryPanel.MARGIN_BUBBLE * 2,
            this.cellSize.height + ChatHistoryPanel.MARGIN_BUBBLE_HEIGHT * 2
        ));
        this.addChild(bg);

        var lbName = ChatMgr.createText(name, cc.color("#9b5429"));
        this.addChild(lbName);

        var lbMsg = ChatMgr.createText(msg, cc.color("#9b5429"));
        this.addChild(lbMsg);

        lbMsg.x += ChatHistoryPanel.MARGIN;
        lbMsg.setPositionY(lbMsg.getContentSize().height + ChatHistoryPanel.MARGIN);
        lbName.x += ChatHistoryPanel.MARGIN;
        lbName.setPositionY(lbMsg.getPositionY());
    },

    getUserData : function () {
        var udata = {};

        udata.avatar = this.info.user.avatar;
        udata.levelScore = this.info.user.exp;
        udata.displayName = this.info.user.uName;
        udata.winCount = this.info.user.win;
        udata.lostCount = this.info.user.lost;
        udata.bean = this.info.user.gold;
        udata.uID = this.info.user.uId;
        udata.zName = this.info.user.zName;
        udata.level = this.info.user.level;
        udata.levelExp = this.info.user.levelExp;
        return udata;
    }
});

var ChatScene = BaseLayer.extend({

    ctor: function () {
        this.friendDatas = [];
        this.listFriends = null;
        this.friendSize = {};

        this.listTab = {};

        this.panelTab = null;
        this.tabDefault = null;
        this.chatPanelSize = null;
        this.chatPanelPos = null;

        this.mainTab = null;
        this.mainPanel = null;

        this.emoPanel = null;

        this.curTab = -1;

        this.txChat = null;

        this._super(ChatScene.className);
        this.initWithBinaryFile("ChatScene.json");
    },

    customizeGUI: function () {
        var titleFriend = this.getControl("titleFriend");
        var txFriend = this.getControl("txt",titleFriend);
        txFriend.setPosition(titleFriend.getContentSize().width/2,titleFriend.getContentSize().height/2);
        var bgFriend = this.getControl("bgFriend");
        titleFriend.setPosition(bgFriend.getPositionX(),bgFriend.getPositionY() + bgFriend.getContentSize().height/2 - titleFriend.getContentSize().height);

        this.listTab = [];

        var pBotRight = this.getControl("pBotRight");
        var tfChat = this.getControl("chat",pBotRight);
        tfChat.setVisible(false);
        this.txChat = BaseLayer.createEditBox(tfChat);
        pBotRight.addChild(this.txChat);
        this.customButton("send", ChatScene.BTN_SEND_CHAT,pBotRight);

        this.customButton("close", ChatScene.BTN_CLOSE);

        // tab chat button
        var pTab = this.getControl("pTab");
        var bgChat = this.getControl("bgChat");

        this.panelTab = this.getControl("pButton",pTab);
        this.tabDefault = this.customButton("tabDefault", ChatScene.BTN_TAB_DEFAULT,pTab, false);
        this.tabDefault.setVisible(false);

        pTab.setPosition(bgChat.getPositionX() - bgChat.getContentSize().width/2 + this.tabDefault.getContentSize().width/6,bgChat.getPositionY() + bgChat.getContentSize().height/2);

        this.mainTab = this.customButton("btnChatAll", ChatScene.BTN_TAB_CHAT_ALL,pTab, false);
        this.mainTab.img = this.getControl("img", this.mainTab);
        this.mainTab.notify = this.getControl("notify", this.mainTab);
        this.mainTab.num = this.getControl("num", this.mainTab.notify);
        this.mainTab.count = 0;
        this.mainTab.img.setVisible(false);
        this.mainTab.notify.setVisible(false);
        this.mainTab.notify.setVisible(false);

        var bgChatPos = bgChat.getPosition();
        var bgChatSize = bgChat.getContentSize();
        this.chatPanelSize = cc.size(bgChatSize.width*0.98,bgChatSize.height*0.95);
        this.chatPanelPos = cc.p(bgChatPos.x - this.chatPanelSize.width/2,bgChatPos.y - this.chatPanelSize.height/2);

        this.mainPanel = new ChatPanel(this.chatPanelSize);
        this.mainPanel.initChat(chatMgr.chatTotals);
        this.mainPanel.setPosition(this.chatPanelPos);
        this.addChild(this.mainPanel);

        // Friend Panel
        var itemFriend = this.getControl("itemFriend");
        itemFriend.setVisible(false);
        var fSize = cc.size(itemFriend.getContentSize().width,bgFriend.getContentSize().height*0.98 - titleFriend.getContentSize().height*0.8);
        var bgPos = bgFriend.getPosition();
        var bgSize = bgFriend.getContentSize();
        var fPos = cc.p(bgPos.x - bgSize.width/2 + bgSize.width*this._scaleRealX/2 - itemFriend.getContentSize().width*this._scale/2,bgPos.y - bgSize.height/2.05);

        this.friendSize = cc.size(fSize.width,itemFriend.getContentSize().height*this._scale*1.05);

        this.listFriends = new cc.TableView(this, fSize);
        this.listFriends.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listFriends.setDelegate(this);
        this.listFriends.setPosition(fPos);

        this.addChild(this.listFriends);
        this.updateFriends(chatMgr.friends);

        // emo panel
        //this.customButton("emotion",ChatScene.BTN_EMOTION);
        //this.emoPanel = new ChatEmoPanel(this);
        //this.emoPanel.setPosition(100,100);
        //this.addChild(this.emoPanel);
        //this.emoPanel.setVisible(false);
        //this.emoPanel.setScale(this._scale);

        chatMgr.openChatGUI();
        this.activeMainTab(true);

        this.setBackEnable(true);
    },

    addTab: function (info) {
        var key = info.user.uId + "";
        var tab = this.tabDefault.clone();
        tab.setVisible(true);
        var panel = new ChatPanel(this.chatPanelSize);
        panel.setPosition(this.chatPanelPos);

        if(key in chatMgr.chatUsers)
        {
            panel.initChat(chatMgr.chatUsers[key]);
        }

        tab.setTag(ChatScene.BTN_TAB_CHAT);

        tab.img = this.getControl("img", tab);
        tab.notify = this.getControl("notify", tab);
        tab.num = this.getControl("num", tab.notify);
        tab.count = 0;
        tab.btn = this.customButton("btn", ChatScene.BTN_TAB_CHAT_CLOSE, tab);
        tab.lb = this.getControl("lb", tab);
        tab.uId = tab.btn.uId = info.user.uId;

        this.panelTab.addChild(tab);
        this.addChild(panel);

        var tabObj = {tab: tab, panel: panel, id: info.user.uId};
        this.listTab[key] = tabObj;
        this.activeAtTab(tabObj, false);

        BaseLayer.subLabelText(tab.lb,info.user.uName);

        panel.setVisible(false);

        var nTab = Object.keys(this.listTab).length;
        this.panelTab.setInnerContainerSize(cc.size(this.tabDefault.getContentSize().width * nTab, this.tabDefault.getContentSize().height));
    },

    removeTab: function (id) {
        this.activeMainTab(true);

        var key = id + "";
        if (key in this.listTab) {
            var ite = this.listTab[key];
            this.removeChild(ite.panel);
            this.panelTab.removeChild(ite.tab);

            delete this.listTab[key];
        }

        var nTab = Object.keys(this.listTab).length;
        this.panelTab.setInnerContainerSize(cc.size(this.tabDefault.getContentSize().width * nTab, this.tabDefault.getContentSize().height));

        chatMgr.activeUserChat(key,false);
    },

    activeTab: function (id) {
        this.activeMainTab(id == -1);
        this.curTab = id;

        for (var key in this.listTab) {
            var cTab = this.listTab[key];
            this.activeAtTab(cTab, key == id);
            if(key == id)
            {
                chatMgr.activeUserChat(id,true);
            }
        }
    },

    activeAtTab: function (tab, active) {
        if (active)
            tab.tab.loadTextures("ChatGameUI/tab2.png", "ChatGameUI/tab2.png", "");
        else
            tab.tab.loadTextures("ChatGameUI/tab2Dis.png", "ChatGameUI/tab2Dis.png", "");

        tab.tab.img.setVisible(active);
        tab.tab.btn.setVisible(active);
        tab.panel.setVisible(active);

        if (active) {
            tab.tab.notify.setVisible(false);
            tab.tab.count = 0;
        }
    },

    activeMainTab: function (active, all) {

        if (active)
            this.mainTab.loadTextures("ChatGameUI/btnChatTong2.png", "ChatGameUI/btnChatTong2.png", "");
        else
            this.mainTab.loadTextures("ChatGameUI/btnChatTong2Dis.png", "ChatGameUI/btnChatTong2Dis.png", "");

        this.mainTab.img.setVisible(active);
        this.mainPanel.setVisible(active);
        this.curTab = 0;
        if (active) {
            this.mainTab.notify.setVisible(false);
            this.mainTab.count = 0;
        }

        if (all !== undefined && all) {
            for (var key in this.listTab) {
                this.activeAtTab(this.listTab[key], false);
            }
        }
    },

    onReceiveChat: function (type, chatObj,active) {
        if(active === undefined) active = false;

        if (type == ChatMgr.MSG_SERVER) {
            this.mainPanel.receiveChat(chatObj);

            if(this.curTab != 0)
            {
                this.mainTab.notify.setVisible(true);
                this.mainTab.count++;
                if(this.mainTab.count > 9) this.mainTab.count = 9;
                this.mainTab.num.setString(this.mainTab.count + "");
            }
        }

        if (type == ChatMgr.MSG_USER) {
            var key = chatObj.user.uId + "";
            if (key in this.listTab) {
                this.listTab[key].panel.receiveChat(chatObj);
            }
            else {
                this.addTab(chatObj);
            }

            if("notify" in chatObj)
            {
                this.listTab[key].tab.count = chatObj.notify;
                this.listTab[key].tab.notify.setVisible(chatObj.notify > 0);
                if(this.listTab[key].tab.count > 9) this.listTab[key].tab.count = 9;
                this.listTab[key].tab.num.setString(this.listTab[key].tab.count + "");
            }
            else
            {
                if(this.curTab != chatObj.user.uId)
                {
                    this.listTab[key].tab.notify.setVisible(true);
                    this.listTab[key].tab.count++;
                    if(this.listTab[key].tab.count > 9) this.listTab[key].tab.count = 9;
                    this.listTab[key].tab.num.setString(this.listTab[key].tab.count + "");

                    if(active)
                    {
                        this.activeTab(chatObj.user.uId);
                    }
                }
                else
                {
                    chatMgr.activeUserChat(key,true);
                }
            }
        }
    },

    updateFriends : function (friends) {
        this.friendDatas = [];
        for(var key in friends)
        {
            this.friendDatas.push(friends[key]);
        }
        this.listFriends.reloadData();
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case ChatScene.BTN_CLOSE:
            {
                sceneMgr.openScene(ChooseRoomScene.className);
                break;
            }
            case ChatScene.BTN_SEND_CHAT:
            {
                var message = this.txChat.getString().trim();
                if (message == "")
                {
                    Toast.makeToast(Toast.SHORT, LocalizedString.to("NHAPCHAT"));
                }
                else
                {
                    var toID = this.curTab;
                    var messType = (toID == 0) ? ChatMgr.MSG_SERVER : ChatMgr.MSG_USER;
                    var canSend = 0;
                    if(messType == ChatMgr.MSG_SERVER)
                    {
                        canSend = chatMgr.canSendMessage(message);
                    }

                    if(messType == ChatMgr.MSG_USER)
                    {
                        if(CheatCenter.checkOpenCheat(message))
                            return;
                    }

                    switch (canSend)
                    {
                        case 0:
                        {
                            var chat = {};
                            chat.user = {};
                            chat.user.uName = gamedata.userData.displayName;
                            chat.user.uId = toID;
                            chat.chat = message;
                            chat.chat = ChatFilter.filterString(chat.chat);

                            chatMgr.addChatSending(toID, chat);

                            var pk = new CmdSendChatTotal();
                            pk.putData(toID, messType, message);

                            GameClient.getInstance().sendPacket(pk);
                            pk.clean();

                            break;
                        }
                        case 1:
                        {
                            Toast.makeToast(Toast.SHORT, LocalizedString.to("CHATSAME"));
                            break;
                        }
                        case 2:
                        {
                            Toast.makeToast(Toast.SHORT, LocalizedString.to("CHATLONG"));
                            break;
                        }
                    }

                    this.txChat.setString("");
                }
                break;
            }
            case ChatScene.BTN_EMOTION:
            {
                this.emoPanel.setVisible(!this.emoPanel.isVisible());
                break;
            }
            case ChatScene.BTN_TAB_CHAT_ALL:
            {
                this.activeMainTab(true, true);
                break;
            }
            case ChatScene.BTN_TAB_CHAT:
            {
                this.activeTab(btn.uId);
                break;
            }
            case ChatScene.BTN_TAB_CHAT_CLOSE:
            {
                this.removeTab(btn.uId);
                break;
            }
        }
    },

    doChatTemplate : function (emo) {
        this.emoPanel.setVisible(false);
        this.txChat.setString(chatMgr.convertEmoToString(emo));
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ChatFriendCell();
        }
        cell.setInfo(this.friendDatas[idx]);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return this.friendSize;
    },

    numberOfCellsInTableView: function (table) {
        return this.friendDatas.length;
    },

    tableCellTouched: function (table, cell) {
        //sceneMgr.getRunningScene().getMainLayer().addChild(new UserInfoGUI(cell.getUserData()), 999, LobbyScene.GUI_USER_INFO);
        sceneMgr.openGUI(CheckLogic.getUserInfoClassName(),LobbyScene.GUI_USER_INFO,LobbyScene.GUI_USER_INFO).setInfo(cell.getUserData());

    },
    
    onBack : function () {
        if(sceneMgr.checkBackAvailable()) return;

        sceneMgr.openScene(ChooseRoomScene.className);
    }
});

var ChatEmoPanel = BaseLayer.extend({
    ctor: function (p) {
        this.chatScene = p;

        this._super();
        this.initWithBinaryFile("ChatEmoPanel.json");
    },

    onEnterFinish: function(){
        this.listEmo.reloadData();
        if (!cc.sys.isNative){
            this.listEmo.setTouchEnabled(true);
        }
    },

    initGUI: function () {
        var ls = this.getControl("panel");

        this.bg = this.getControl("bg");
        this.customButton("btnClose", 1, this._layout);
        //
        this.listEmo = new cc.TableView(this,ls.getContentSize());
        this.listEmo.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listEmo.setVerticalFillOrder(0);
        ls.addChild(this.listEmo);
    },

    showUp: function(isShowUp){
        // this.setVisible(isShowUp);
        var bgHeight = this.bg.getContentSize().height;
        if (isShowUp){
            this.setPositionY(-bgHeight);
            this.runAction(cc.sequence(cc.show(), cc.moveTo(0.5, 0, 0).easing(cc.easeBackOut())));
        } else {
            this.setPositionY(0);
            this.runAction(cc.sequence(cc.moveTo(0.5, 0, -bgHeight).easing(cc.easeBackIn()), cc.hide()));
        }
    },

    tableCellAtIndex:function (table, idx) {
        var cell = table.dequeueCell();
        if(!cell)
        {
            cell = new ChatEmoCell(this);
        }
        cell.setEmotion(idx);
        return cell;
    },

    tableCellSizeForIndex:function(table, idx){
        return cc.size(ChatEmoCell.WIDTH,ChatEmoCell.HEIGHT);
    },

    numberOfCellsInTableView:function (table) {
        var a = ChatInGameGUI.EMOTION_NUM;
        var b = ChatInGameGUI.EMOTION_ROW;
        if(a%b == 0)
            return a/b;
        return parseInt(a/b) + 1;
    },

    onButtonRelease: function () {
        this.showUp(false);
    },

    open: function () {
        this.showUp(true);
    }
})

var ChatPanel = BaseLayer.extend({

    ctor: function (size) {
        this.panelSize = size;

        this.histories = null;
        this.list = [];

        this._super();
        this.initWithBinaryFile("ChatPanelNode.json");
    },

    initGUI: function () {
        var ls = this.getControl("panel");

        ls.setScaleX(this.panelSize.width/ls.getContentSize().width);
        ls.setScaleY(this.panelSize.height/ls.getContentSize().height);

        this.histories = new cc.TableView(this, this.panelSize);
        this.histories.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.histories.setVerticalFillOrder(0);
        this.histories.setDelegate(this);
        this.addChild(this.histories);
        this.histories.reloadData();
    },

    initChat: function (list) {
        var lst = [];
        for(var i = 0 ; i < list.length ; i++)
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

            lst.push(obj);
        }

        this.list = lst;
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

        if(this.list.length > 30)
        {
            this.list.splice(0,5);
        }
        this.list.push(obj);

        this.histories.reloadData();
        this.histories.setContentOffset(cc.p(0, 0));
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ChatItemCell(this.panelSize,true);
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

    tableCellTouched: function (table, cell) {
        var uObj = cell.getUserData();
        if(cell.info && cell.info.system && cell.info.system == 1) return;

        //sceneMgr.getRunningScene().getMainLayer().addChild(new UserInfoGUI(uObj), LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
        sceneMgr.openGUI(CheckLogic.getUserInfoClassName(),LobbyScene.GUI_USER_INFO,LobbyScene.GUI_USER_INFO).setInfo(uObj);
    },
});

ChatScene.className = "ChatScene";

ChatScene.BTN_CLOSE = 0;
ChatScene.BTN_SEND_CHAT = 1;
ChatScene.BTN_TAB_DEFAULT = 2;
ChatScene.BTN_TAB_CHAT_ALL = 3;
ChatScene.BTN_EMOTION = 4;
ChatScene.BTN_TAB_CHAT = 500;
ChatScene.BTN_TAB_CHAT_CLOSE = 600;

var ChatMgr = cc.Class.extend({

    ctor: function () {
        this.chatTotals = [];
        this.chatRooms = [];
        this.chatUsers = {};

        this.chatSending = {};

        this.activeUserChats = {};

        this.friends = {};

        this.lastMessage = "";

        this.emotions = [":)", ":*", ":d", ":-o", ":p", "(:|", "=p~", ":((", ":-$", "I-)", ":\">", ":-bd", "8-}", ":-h", "[-(" , "o:o", ":-/", "X(", ":-\\", ":-("];
    },

    clear : function () {
        this.chatTotals = [];
        this.chatRooms = [];
        this.chatUsers = {};
        this.chatSending = {};
        this.activeUserChats = {};
        this.friends = {};
        this.lastMessage = "";
    },

    openChatGUI : function () {
        for(var key in this.activeUserChats)
        {
            var notify  = this.activeUserChats[key];

            if(key in this.chatUsers)
            {
                var chatLst = this.chatUsers[key];
                if(chatLst && chatLst.length > 0 && chatLst[0].user)
                {
                    var chat = {};
                    chat.user = chatLst[0].user;
                    chat.chat = "";
                    chat.notify = notify;

                    this.addChatUser(key,chat,false);
                }
            }
        }
    },

    openChatInGame : function (activeTabId) {
        if(CheckLogic.checkInBoard())
        {
            //var gui = sceneMgr.getRunningScene().getMainLayer();
            //var chat = new ChatInGameGUI();
            //gui.addChild(chat, ChatMgr.GUI_CHAT_IN_GAME, ChatMgr.GUI_CHAT_IN_GAME);

            if(CheckLogic.checkMessageFriendNewGUI())
            {
                if(activeTabId !== undefined && activeTabId != null)
                {
                    var chat = sceneMgr.openGUI(ChatPanelGUI.className,ChatMgr.GUI_CHAT_IN_GAME,ChatMgr.GUI_CHAT_IN_GAME);
                    chat.activeTabHistory(activeTabId);
                }
            }
            else
            {
                var chat = sceneMgr.openGUI(ChatInGameGUI.className ,ChatMgr.GUI_CHAT_IN_GAME, ChatMgr.GUI_CHAT_IN_GAME,false);
                if(activeTabId !== undefined)
                {
                    chat.waitActiveTabId(activeTabId);
                }
            }
        }
    },

    onChatTotal: function (pk) {
        //cc.log("onChat " + JSON.stringify(pk));

        if (pk.response) {
            var error = pk.getError();

            this.onChatSent(pk.toID, pk.msgType, pk.getError());
        }
        else {
            if (pk.msgType == ChatMgr.MSG_SERVER) {
                // chat kênh server
                if (pk.sender != null) {
                    var chat = {};
                    chat.user = pk.sender;
                    chat.chat = ChatFilter.filterString(pk.content);
                    chatMgr.addChatTotal(chat);
                }
            }
            else if (pk.msgType == ChatMgr.MSG_USER) {
                // chat riêng cho user
                if (pk.sender != null) {
                    var chat = {};
                    chat.user = pk.sender;
                    chat.chat = pk.content;
                    if (chat.user.uId == gamedata.userData.id) {
                        return;
                    }
                    chatMgr.addChatUser(chat.user.uId, chat);

                }
            }
            else if (pk.msgType == ChatMgr.MSG_SYSTEM) {
                // thông báo của server
                if (pk.sender != null) {
                    var chat = {};
                    chat.user = pk.sender;

                    var mess = LocalizedString.to("CHAT_NOTE2");
                    mess = StringUtility.replaceAll(mess, "@name", chat.user.uName);
                    chat.chat = mess;
                    chat.error = 3;
                    if (chat.user.uId == gamedata.userData.id) {
                        return;
                    }
                    chatMgr.addChatUser(chat.user.uId, chat);
                }
            }
        }
    },

    onChatRoom : function (info,msg) {
        fr.crashLytics.log("onChatRoom 1");
        if(Config.ENABLE_INTERACT_PLAYER) {
            if(interactPlayer.detectInteractMessage(msg,false)){
                fr.crashLytics.log("onChatRoom 2");
                return;
            }

        }
        fr.crashLytics.log("onChatRoom 3");
        var chat = {};
        chat.user = this.convertPlayerToData(info);
        chat.chat = msg;

        this.addChatRoom(chat);
        fr.crashLytics.log("onChatRoom 4");
    },

    onReceiveAllFriend: function (pk) {
        //cc.log("CMD_RECEIVE_ALLFRIEND Friend " + JSON.stringify(pk.json));

        if(pk.json == null) return;

        for(var i  = 0 ; i < pk.json.length ; i++)
        {
            var fObj = pk.json[i];
            if(!fObj || !fObj.uId || fObj.uId in this.friends) continue;
            this.friends[fObj.uId] = fObj;
        }

        cc.log("FriendList : " + JSON.stringify(this.friends));
    },

    onUpdateFriendStatus: function (pk) {
        cc.log("CMD_UPDATE_STATTUS_FRIEND " + JSON.stringify(pk));
    },

    onModFriend: function (pk) {
        if(pk.friendJson == null) return;

        var fObj = pk.friendJson;
        if (pk.action == 1)
        {
            var key = fObj.uId;
            if(!(key in this.friends))
            {
                this.friends[key] = fObj;

                var mess = LocalizedString.to("ADD_FRIEND");
                mess = StringUtility.replaceAll(mess,"@name",fObj.uName);
                Toast.makeToast(Toast.SHORT,mess);
            }
        }
        else if (pk.action == 2)
        {
            var key = fObj.uId;
            if(key in this.friends)
            {
                var mess = LocalizedString.to("DELETE_FRIEND");
                mess = StringUtility.replaceAll(mess,"@name",fObj.uName);
                Toast.makeToast(Toast.SHORT,mess);

                delete this.friends[key];
            }

        }

        var gui = sceneMgr.getRunningScene().getMainLayer();
        if(gui instanceof ChatScene)
        {
            gui.updateFriends(this.friends);
        }
    },

    onSystemChat: function (pk) {
        cc.log("CMD_SYSTEM_CHAT " + JSON.stringify(pk));

        var mess ="";

        if (pk.exprired < 0) {
            mess = LocalizedString.to("CHAT_NOTE5");
        }
        else if (pk.exprired > 0)// Cam chat trong thoi` han.
        {
            mess = LocalizedString.to("CHAT_NOTE4");
            mess = StringUtility.replaceAll(mess, "@gio", pk.hour);
            mess = StringUtility.replaceAll(mess, "@ngay", pk.exprired);
        }

        mess = StringUtility.replaceAll(mess, "@reason", pk.reason);

        if(pk.response)
        {
            mess = StringUtility.replaceAll(mess,"@name",LocalizedString.to("BAN"));
        }
        else
        {
            mess = StringUtility.replaceAll(mess,"@name",pk.name);

        }
        //Dang le reason phai la kieu int roi tu do client tu dua ra thong bao loi. Nhung do client ngay truoc ko update duoc
        // va doi khi server can dua ra thong bao loi tu phia server len de kieu string
        //cmd nay co reason lai la String. va chi dua vao exprired de dua ra thong bao.
        //Trong truong hop ko du dieu kieu chat thi thong bao dua ra lung cung. ko ro nghia
        //Fix tam bang cach duoi
        //Ko du dieu kien Chat:
        if(pk.reason.localeCompare(LocalizedString.to("CHAT_NOTE6")) === 0){
            mess = pk.reason;
        }
        Toast.makeToast(Toast.LONG, mess);
    },

    addFriend : function (id) {
        var pk = new CmdSendModFriend();
        pk.putData(1,id);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    removeFriend : function (id) {
        var pk = new CmdSendModFriend();
        pk.putData(2,id);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    doMessageFriend : function (user) {
        var data = this.convertUserToData(user);

        var chat = {};
        chat.user = data;
        chat.chat = "";

        this.addChatUser(data.uId,chat,true);

        if(CheckLogic.checkInBoard())
        {
            //var gui = sceneMgr.getRunningScene().getMainLayer();
            var cGui = sceneMgr.getGUI(ChatMgr.GUI_CHAT_IN_GAME);// gui.getChildByTag(ChatMgr.GUI_CHAT_IN_GAME);
            if(cGui === undefined || cGui == null)
            {
                chatMgr.openChatInGame(data.uId);
            }
        }
    },

    addChatTotal: function (chatObj) {

        if(chatObj.chat != "")
        {
            if (this.chatTotals.length > 30) {
                this.chatTotals.splice(0, 5);
            }
            this.chatTotals.push(chatObj);
        }

        var gui = sceneMgr.getRunningScene().getMainLayer();
        if(gui instanceof ChooseRoomScene)
        {
            gui.chatPanel.receiveChat(chatObj);
        }
        if(gui instanceof ChatScene)
        {
            gui.onReceiveChat(ChatMgr.MSG_SERVER, chatObj);
        }
    },

    addChatUser: function (id, cObj,active) {
        if(active === undefined) active = false;

        if (id == 0) {
            this.addChatTotal(cObj);
            return;
        }

        var key = id + "";
        if(cObj.chat != "")
        {
            if (key in this.chatUsers) {
                if(this.chatUsers[key].length > 30)
                {
                    this.chatUsers[key].splice(0,5);
                }
                this.chatUsers[key].push(cObj);
            }
            else {
                this.chatUsers[key] = [];
                this.chatUsers[key].push(cObj);
            }
        }
        else
        {
            if (!(key in this.chatUsers)) {
                this.chatUsers[key] = [];
                this.chatUsers[key].push(cObj);
            }
        }

        if(cObj.notify === undefined)
            chatMgr.activeUserChat(key,true,1);

        if(CheckLogic.checkInBoard())
        {
            var chat = sceneMgr.getGUI(ChatMgr.GUI_CHAT_IN_GAME);
            if (chat != null && chat instanceof ChatInGameGUI) {
                chat.onReceiveChat(ChatMgr.MSG_USER,cObj,active);
            }

            if(chat != null && chat instanceof  ChatPanelGUI)
            {
                chat.onReceiveChat(ChatMgr.MSG_USER,cObj,active);
            }
            else
            {
                // CheckLogic.onChatPrivateMessage(cObj);
            }
        }

        var gui = sceneMgr.getRunningScene().getMainLayer();
        if(gui instanceof ChatScene)
        {
            gui.onReceiveChat(ChatMgr.MSG_USER, cObj,active);
        }
    },

    addChatRoom : function (chatObj) {
        if(chatObj.chat != "")
        {
            if (this.chatRooms.length > 30) {
                this.chatRooms.splice(0, 5);
            }
            this.chatRooms.push(chatObj);

            if(CheckLogic.checkInBoard())
            {
                var chat = sceneMgr.getGUI(ChatMgr.GUI_CHAT_IN_GAME);
                if (chat != null && chat instanceof  ChatInGameGUI) {
                    chat.onReceiveChat(ChatMgr.MSG_ROOM,chatObj)
                }

                var chatPanelNew = sceneMgr.getGUI(ChatMgr.GUI_CHAT_IN_GAME);
                if (chatPanelNew != null && chatPanelNew instanceof  ChatPanelGUI) {
                    chatPanelNew.onReceiveChat(ChatMgr.MSG_ROOM,chatObj)
                }
            }
        }
    },

    addChatSending: function (id, cObj) {
        var key = id + "";
        if (key in this.chatSending) {
            this.chatSending[key].push(cObj);
        }
        else {
            this.chatSending[key] = [];
            this.chatSending[key].push(cObj);
        }

        cc.log("chatSending " + JSON.stringify(this.chatSending));
    },

    activeUserChat : function (id, active , notify) {
        var strLog = "active " + id + "/" + active + "/" + notify;
        if(active === undefined) active = true;
        if(notify === undefined) notify = 0;
        if(!active)
        {
            delete  this.activeUserChats[id];
        }
        else
        {
            if(id in this.activeUserChats)
            {
                var n = this.activeUserChats[id];
                if(notify <= 0)
                {
                    this.activeUserChats[id] = 0;
                }
                else
                {
                    if(n <= 0)
                    {
                        this.activeUserChats[id] = notify;
                    }
                    else
                    {
                        this.activeUserChats[id] += notify;
                    }
                }
            }
            else
            {
                this.activeUserChats[id] = notify;
            }
        }

        // var gui = sceneMgr.getRunningScene().getMainLayer();
        // if(gui instanceof ChooseRoomScene)
        // {
        //     gui.updateChatPrivateNotify();
        // }
        //
        // if(CheckLogic.checkInBoard())
        // {
        //     CheckLogic.updateChatPrivateNotifyInBoard();
        // }

        cc.log("ActiveUser " + strLog + "-->" + JSON.stringify(this.activeUserChats));
    },

    onChatSent: function (id, type, error) {
        var key = id + "";
        if (key in this.chatSending) {
            var cList = this.chatSending[key];
            var cObj = cList[0];

            if (error != 0) {
                var msg = "";
                if(error == 1) msg = LocalizedString.to("CHAT_NOTE1");
                else if(error == 2) msg = LocalizedString.to("CHAT_NOTE3");
                else if(error == 6) msg = LocalizedString.to("CHATFAST");
                else msg = "Error" + error;

                msg = StringUtility.replaceAll(msg,"@name",cObj.user.uName);

                cObj.chat = msg;
                cObj.user.uName = "";
                cObj.system = 1;

                this.addChatUser(id, cObj);
            }
            else {
                if (id != 0)
                    this.addChatUser(id, cObj);
            }

            cList.splice(0, 1);
            if (cList.length == 0)
                delete  this.chatSending[key];
        }

    },

    convertUserToData : function (user) {
        var data = {};

        data.avatar = user.avatar;
        data.exp = user.levelScore;
        data.uName = user.displayName;
        data.win = user.winCount;
        data.lost = user.lostCount;
        data.gold = user.bean;
        data.uId = user.uID;
        data.zName = user.zName;
        data.level = user.level;
        data.levelExp = user.levelExp;

        return data;
    },

    convertPlayerToData : function (user) {
        return CheckLogic.convertChatPlayerInfo(user);
    },

    checkIsFriend : function (uId) {
        if(uId === undefined) return false;
        return (uId in this.friends);
    },

    canSendMessage : function (msg) {
        if(msg == this.lastMessage) return 1;
        if(msg.length > ChatMgr.MAX_LENGHT_AVAILABLE) return 2;
        this.lastMessage = msg;

        return 0;
    },

    getChatPrivateNotify : function () {
        var count = 0;
        for(var key in this.activeUserChats)
        {
            if(this.activeUserChats[key] > 0)
            {
                count ++;
            }
        }

        if(count > 9) count = 9;
        return count;
    },

    convertEmoToString : function (emoIdx) {
        emoIdx -=1;
        if(emoIdx < 0 || emoIdx >= this.emotions.length)
        {
            return this.emotions[0];
        }
        return this.emotions[emoIdx];
    },
});

ChatMgr._instance = null;
ChatMgr.hasInit = false;
ChatMgr.getInstance = function () {
    if (!ChatMgr.hasInit) {
        ChatMgr._instance = new ChatMgr();
        ChatMgr.hasInit = true;
    }
    return ChatMgr._instance;
};
var chatMgr = ChatMgr.getInstance();

ChatMgr.MSG_USER = 1;
ChatMgr.MSG_ROOM = 2;
ChatMgr.MSG_SERVER = 3;
ChatMgr.MSG_SYSTEM = 4;

ChatMgr.MAX_LENGHT_AVAILABLE = 120;

ChatMgr.GUI_CHAT_IN_GAME = 301;

ChatMgr.getFullMessage = function (name, msg , width , scale) {
    if(!name) name = "";
    if(!msg) msg = "";

    var start = new Date().getTime();
    if(scale === undefined)
    {
        scale = cc.director.getWinSize().width/Constant.WIDTH;
        scale = (scale > 1) ? 1 : scale;
    }

    var sName = name;
    var lbName = ChatMgr.createText(sName);
    var lbSpace = ChatMgr.createText("");
    var sSpace = "";
    var nSize = lbName.getContentSize().width;
    while(lbSpace.getContentSize().width < nSize)
    {
        sSpace += "  ";
        lbSpace.setString(sSpace);
    }

    /*
    cc.log("--" + JSON.stringify(lbName.getContentSize()) + "/" + JSON.stringify(lbSpace.getContentSize()));
    var spaceWidth = Math.ceil(lbName.getContentSize().width/lbSpace.getContentSize().width);

    cc.log("--spaceWidth " + spaceWidth);


    for(var i = 0 ; i < spaceWidth ; i++)
    {
        sSpace += "  ";
    }

    var sDemo = ChatMgr.createText(sSpace);
    cc.log("--> " + JSON.stringify(sDemo.getContentSize()));
    */

    var message = sSpace + msg;
    var strArr = msg.split(" ");
    var lbMsg = ChatMgr.createText("");
    var sLine = sSpace;
    var str = sSpace;
    var sLength = strArr.length;
    for(var i = 0; i < sLength ; i++)
    {
        sLine += strArr[i] + " ";
        str += strArr[i] + " ";
        lbMsg.setString(sLine);
        var isBreak = false;
        if(lbMsg.getBoundingBox().width*scale > width)
        {
            isBreak = true;
        }
        else
        {
            if(i+1 < sLength)
            {
                var tmp = sLine + strArr[i+1];
                lbMsg.setString(tmp);
                if(lbMsg.getBoundingBox().width*scale > width)
                {
                    isBreak = true;
                }
            }
        }

        if(isBreak)
        {
            //cc.log("Line : " + sLine);
            str += "\n";
            sLine = "";
        }
    }

    var end = new Date().getTime();
    //cc.log("Time create full text : " + (end - start));
    return str;
};

ChatMgr.createText = function (text, color) {
    if (color === undefined) {
        color = sceneMgr.ccWhite;
    }
    var ret = new ccui.Text()
    ret.setAnchorPoint(cc.p(0, 1));
    ret.setFontName("fonts/tahoma.ttf");
    ret.setFontSize(17);
    ret.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
    ret.setColor(color);
    ret.setString(text);
    return ret;
};

ChatMgr.convertEmoToNew = function (emoIdx) {
    cc.log("--convertEmoToNew " + emoIdx);
    emoIdx = parseInt(emoIdx);
    return emoIdx;
};

ChatMgr.convertEmoToOld = function (emoIdx) {
    cc.log("--convertEmoToOld " + emoIdx);
    emoIdx = parseInt(emoIdx);
    return emoIdx;
};
