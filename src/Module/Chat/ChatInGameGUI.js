/**
 * Created by HunterPC on 9/16/2015.
 */

// var ChatEmoCell = cc.TableViewCell.extend({
//
//     ctor: function (p) {
//         this.gParent = p;
//
//         this.arrBg = [];
//         this.curIndex = -1;
//
//         this.savePosTouch = 0;
//         this.isWaitingClick = false;
//
//         this._super("ChatEmoCell");
//         var jsonLayout = ccs.load("ChatEmoCell.json");
//         this._layout = jsonLayout.node;
//         ccui.Helper.doLayout(this._layout);
//         this.addChild(this._layout);
//
//         this.initGUI();
//     },
//
//     onEnter: function(){
//         this._super();
//         this.isWaitingClick = false;
//
//         if (!cc.sys.isNative){
//             this.addListenerEmo();
//         }
//     },
//
//     addListenerEmo: function(){
//         cc.eventManager.addListener({
//             event: cc.EventListener.TOUCH_ONE_BY_ONE,
//
//             onTouchBegan: function (touch, event) {
//                 event.getCurrentTarget().onTouch(0, touch.getLocation());
//                 return true;
//             },
//
//             onTouchEnded: function (touch, event) {
//                 event.getCurrentTarget().onTouch(2, touch.getLocation());
//             },
//
//             onTouchMoved: function (touch, event) {
//                 event.getCurrentTarget().onTouch(1, touch.getLocation());
//             }
//         }, this);
//     },
//
//     initGUI: function () {
//         this.arrBg = [];
//
//         for (var i = 0; i < ChatInGameGUI.EMOTION_ROW; i++) {
//             var eBtn = ccui.Helper.seekWidgetByName(this._layout, "emo" + i);
//             this.arrBg.push(eBtn);
//         }
//
//
//         this.addListenerEmo();
//         this.listEff = [];
//         for (var i = 0; i < ChatInGameGUI.EMOTION_ROW; i++) {
//             var bg = this.arrBg[i];
//             bg.removeAllChildren();
//
//             var eff = db.DBCCFactory.getInstance().buildArmatureNode("Emoticon0");
//             if (eff) {
//                 eff.setScale(0.7);
//                 bg.addChild(eff);
//                 var bSize = bg.getContentSize();
//                 eff.setPosition(cc.p(bSize.width / 2, bSize.height / 2));
//                 this.listEff.push(eff);
//             }
//
//             var cannotUse = new cc.Sprite("Interact/icon_vip.png");
//             bg.addChild(cannotUse);
//             cannotUse.setPosition(cc.p(bSize.width / 2, bSize.height / 2));
//             bg.cannotUse = cannotUse;
//         }
//     },
//
//     onTouch: function (type, pos) {
//         var isTouch = false;
//         var idx = -1;
//
//         if (this.isTouchCell(pos)) {
//             if (type == 0) {
//                 this.isWaitingClick = true;
//                 this.savePosTouch = pos;
//             }
//             else if (type == 1) {
//                 if (Math.abs(pos.y - this.savePosTouch.y) > 3 || Math.abs(pos.x - this.savePosTouch.x) > 3) {
//                     this.isWaitingClick = false;
//                 }
//             }
//             else if (type == 2) {
//                 if (this.isWaitingClick) {
//                     var emoIdx = this.isTouchEmo(pos);
//                     if (emoIdx > -1) {
//                         isTouch = true;
//                         idx = emoIdx;
//                     }
//                 }
//             }
//         }
//         if (idx > 0 && isTouch && this.gParent.isVisible()){
//             cc.log("idx: ", idx);
//             if (chatConfig.canUseItem(idx, true)){
//                 var pkEmotion = new CmdSendChatEmotion();
//                 pkEmotion.putData(ChatMgr.convertEmoToOld(idx));
//                 GameClient.getInstance().sendPacket(pkEmotion);
//                 pkEmotion.clean();
//
//                 this.gParent.showUp(false);
//             } else {
//                 var text = localized("VIP_NEED_TO_USE_EMO");
//                 text = StringUtility.replaceAll(text, "@number", NewVipManager.getInstance().getLevelCanUseItem());
//                 Toast.makeToast(Toast.SHORT, text);
//             }
//         }
//
//         // if (this.gParent instanceof  ChatInGameGUI && isTouch) {
//         //     if (this.gParent.curTab == ChatInGameGUI.TAB_EMOTION) {
//         //         this.gParent.doChatTemplate(idx, 0);
//         //     }
//         // }
//         //
//         // if (this.gParent instanceof  ChatScene && isTouch) {
//         //     this.gParent.doChatTemplate(idx);
//         // }
//
//     },
//
//     setEmotion: function (idx) {
//         this.curIndex = ChatInGameGUI.EMOTION_ROW * idx + 1;
//
//         for (var i = 0; i < ChatInGameGUI.EMOTION_ROW; i++) {
//             var index = (this.curIndex + i);
//             var bg = this.arrBg[i];
//             // bg.removeAllChildren();
//             if (index > ChatInGameGUI.EMOTION_NUM) {
//                 bg.setVisible(false);
//             }
//             else {
//                 bg.setVisible(true);
//                 var canUse = chatConfig.canUseItem(index, true);
//                 bg.cannotUse.setVisible(!canUse);
//                 if (this.listEff[i]) {
//                     this.listEff[i].getAnimation().gotoAndPlay("" + index, -1, -1, 0);
//                 }
//             }
//         }
//     },
//
//     isTouchCell: function (p) {
//         var pos = this.getParent().convertToNodeSpace(p);
//         var cp = this.getPosition();
//         var rect = cc.rect(cp.x, cp.y, ChatEmoCell.WIDTH, ChatEmoCell.HEIGHT);
//
//         return (cc.rectContainsPoint(rect, pos));
//     },
//
//     isTouchEmo: function (p) {
//         var pos = this.convertToNodeSpace(p);
//         for (var i = 0; i < this.arrBg.length; i++) {
//             var pE = this.arrBg[i].getPosition();
//             var pS = this.arrBg[i].getContentSize();
//             var rect = cc.rect(pE.x - pS.width / 2, pE.y - pS.height / 2, pS.width, pS.height);
//             if (cc.rectContainsPoint(rect, pos)) {
//                 return (this.curIndex + i);
//             }
//         }
//         return -1;
//     }
// });

var ChatInGameGUI = BaseLayer.extend({

    ctor: function () {
        this.bg = null;

        this.listEmo = null;
        this.pEmo = null;

        this.tabText = null;
        this.arrText = null;
        this.textTemplate = null;

        this.listTab = {};
        this.panelTab = null;
        this.tabDefault = null;
        this.mainTab = null;
        this.mainPanel = null;
        this.chatPanelSize = null;
        this.chatPanelParent = null;

        this.curTab = -1;
        this.curPanel = -1;

        this.txChat = null;

        this.isWaitingMessageUser = false;
        this.tabUserIdActive = -1;

        this._super(ChatInGameGUI.className);
        this.initWithBinaryFile("ChatGameGUI.json");
        this.enableFog();
    },

    initGUI: function () {
        this.bg = this.getControl("bg");

        this.tabText = this.getControl("pTabText", this.bg);
        this.pEmo = this.getControl("pEmo", this.bg);

        this.customButton("btnEmo", ChatInGameGUI.TAB_EMOTION, this.bg);
        this.customButton("btnText", ChatInGameGUI.TAB_TEXT_CHAT, this.bg);
        this.customButton("btnSend", 1, this.bg);
        this.customButton("btnClose", 2, this.bg);
        this.txChat = BaseLayer.createEditBox(this.getControl("txChat", this.bg));
        this.bg.addChild(this.txChat);
        this.getControl("txChat", this.bg).setVisible(false);
        //this.txChat.addEventListener(this.editBoxEvent,this);
        var tempChat = this.txChat;
        var self = this;
        if (!cc.sys.isNative) {
            cc._addEventListener(tempChat._edTxt, "keypress", function (e) {
                if (e.keyCode === cc.KEY.enter) {
                    self.doChatMessage();
                }
            });
        }

        this.textTemplate = this.getControl("bgTextChat", this.tabText);
        this.textTemplate.setVisible(false);

        this.setBackEnable(true);
        this.setDelayInit();
        this.setShowHideAnimate(this.bg, true);
    },
    onEnter: function () {
        this._super();
        var numberRowOfEmo = this.numberOfCellsInTableView();
        if (!cc.sys.isNative) {
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouch: true,
                onTouchBegan: function (touch, event) {
                    if (event.getCurrentTarget().isVisible()) {
                        var emoCell = event.getCurrentTarget().getChildren();
                        for (var i = 0; i < numberRowOfEmo; i++) {
                            if (emoCell[0].cellAtIndex(i)) {
                                emoCell[0].cellAtIndex(i).onTouch(0, touch.getLocation());
                            }

                        }
                        //emoCell[0].onTouch(0,touch.getLocation());
                        //return false;
                    }
                    return true;
                },
                onTouchMoved: function (touch, event) {
                    if (event.getCurrentTarget().isVisible()) {
                        var emoCell = event.getCurrentTarget().getChildren();
                        for (var i = 0; i < numberRowOfEmo; i++) {
                            if (emoCell[0].cellAtIndex(i)) {
                                emoCell[0].cellAtIndex(i).onTouch(1, touch.getLocation());
                            }

                        }
                    }
                },
                onTouchEnded: function (touch, event) {
                    if (event.getCurrentTarget().isVisible()) {
                        var emoCell = event.getCurrentTarget().getChildren();
                        for (var i = 0; i < numberRowOfEmo; i++) {
                            if (emoCell[0].cellAtIndex(i)) {
                                emoCell[0].cellAtIndex(i).onTouch(2, touch.getLocation());
                            }

                        }
                    }
                }

            }, this.pEmo);
        }

    },

    functionDelayInit: function () {
        this.initTabEmotion();
        this.initTabTextChat();
        this.initTabChatHistory();

        this.switchTab(ChatInGameGUI.TAB_CHAT_HISTORY);
    },

    initTabEmotion: function () {
        this.listEmo = new cc.TableView(this, this.pEmo.getContentSize());
        this.listEmo.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listEmo.setVerticalFillOrder(0);
        this.pEmo.addChild(this.listEmo);
        this.listEmo.reloadData();
    },

    initTabTextChat: function () {
        var size = this.textTemplate.getContentSize();
        var p = this.textTemplate.getPosition();
        this.arrText = [];
        for (var i = 0; i < ChatInGameGUI.TEXT_COL; i++) {
            for (var j = 0; j < ChatInGameGUI.TEXT_ROW; j++) {
                var index = i * ChatInGameGUI.TEXT_ROW + j;
                var bText = this.textTemplate.clone();
                var lb = this.getControl("lbText", bText);
                lb.setString(LocalizedString.to("CHAT_" + (index + 1)));
                bText.addTouchEventListener(this.onTouchEventHandler, this);
                bText.setTag(ChatInGameGUI.TEXT_CHAT_TAG + (index + 1));
                bText.setVisible(true);
                this.arrText.push(lb);
                bText.setPositionX(p.x + i * size.width);
                bText.setPositionY(p.y - j * size.height * 1.1);
                this._listButton.push(lb);
                this.tabText.addChild(bText);
            }
        }

        this.tabText.removeChild(this.textTemplate);
    },

    initTabChatHistory: function () {
        var pTab = this.getControl("pTabChat");
        var pMessage = this.getControl("pMessage");

        this.panelTab = this.getControl("pButton", pTab);
        this.tabDefault = this.customButton("tabDefault", ChatScene.BTN_TAB_DEFAULT, pTab, false);
        this.tabDefault.setVisible(false);

        this.mainTab = this.customButton("btnChatAll", ChatScene.BTN_TAB_CHAT_ALL, pTab, false);
        this.mainTab.img = this.getControl("img", this.mainTab);
        this.mainTab.notify = this.getControl("notify", this.mainTab);
        this.mainTab.num = this.getControl("num", this.mainTab.notify);
        this.mainTab.count = 0;
        this.mainTab.img.setVisible(false);
        this.mainTab.notify.setVisible(false);
        this.mainTab.notify.setVisible(false);

        this.chatPanelSize = pMessage.getContentSize();
        this.chatPanelParent = pMessage;

        this.mainPanel = new ChatGamePanel(this.chatPanelSize);
        this.mainPanel.initChat(chatMgr.chatRooms);
        this.chatPanelParent.addChild(this.mainPanel);

        this.activeMainTab(true);
        chatMgr.openChatGUI();

        if (this.isWaitingMessageUser) {
            this.activeTab(this.tabUserIdActive);

            this.isWaitingMessageUser = false;
            this.tabUserIdActive = -1;
        }
    },

    addTab: function (info) {
        var key = info.user.uId + "";
        var tab = this.tabDefault.clone();
        tab.setVisible(true);
        var panel = new ChatGamePanel(this.chatPanelSize);

        if (key in chatMgr.chatUsers) {
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
        this.chatPanelParent.addChild(panel);

        var tabObj = {tab: tab, panel: panel, id: info.user.uId};
        this.listTab[key] = tabObj;
        this.activeAtTab(tabObj, false);

        BaseLayer.subLabelText(tab.lb, info.user.uName);

        panel.setVisible(false);

        var nTab = Object.keys(this.listTab).length;
        this.panelTab.setInnerContainerSize(cc.size(this.tabDefault.getContentSize().width * nTab, this.tabDefault.getContentSize().height));
    },

    removeTab: function (id) {
        this.activeMainTab(true);

        var key = id + "";
        if (key in this.listTab) {
            var ite = this.listTab[key];
            this.chatPanelParent.removeChild(ite.panel);
            this.panelTab.removeChild(ite.tab);

            delete this.listTab[key];
        }

        var nTab = Object.keys(this.listTab).length;
        this.panelTab.setInnerContainerSize(cc.size(this.tabDefault.getContentSize().width * nTab, this.tabDefault.getContentSize().height));

        chatMgr.activeUserChat(key, false);
    },

    activeTab: function (id) {
        this.activeMainTab(id == -1);
        this.curPanel = id;

        for (var key in this.listTab) {
            var cTab = this.listTab[key];
            this.activeAtTab(cTab, key == id);
            if (key == id) {
                chatMgr.activeUserChat(id, true);
            }
        }
    },

    activeAtTab: function (tab, active) {
        if (active)
            tab.tab.loadTextures("ChatGameUIInGame/tab2.png", "ChatGameUIInGame/tab2.png", "");
        else
            tab.tab.loadTextures("ChatGameUIInGame/tab2Dis.png", "ChatGameUIInGame/tab2Dis.png", "");

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
            this.mainTab.loadTextures("ChatGameUIInGame/btnChatTong2.png", "ChatGameUIInGame/btnChatTong2.png", "");
        else
            this.mainTab.loadTextures("ChatGameUIInGame/btnChatTong2Dis.png", "ChatGameUIInGame/btnChatTong2Dis.png", "");

        this.mainTab.img.setVisible(active);
        this.mainPanel.setVisible(active);
        this.curPanel = 0;
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

    onReceiveChat: function (type, chatObj, active) {
        if (active === undefined) active = false;

        if (type == ChatMgr.MSG_ROOM) {
            if (this.mainPanel)
                this.mainPanel.receiveChat(chatObj);

            if (this.curPanel != 0) {
                this.mainTab.notify.setVisible(true);
                this.mainTab.count++;
                if (this.mainTab.count > 9) this.mainTab.count = 9;
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

            if ("notify" in chatObj) {
                this.listTab[key].tab.count = chatObj.notify;
                this.listTab[key].tab.notify.setVisible(chatObj.notify > 0);
                if (this.listTab[key].tab.count > 9) this.listTab[key].tab.count = 9;
                this.listTab[key].tab.num.setString(this.listTab[key].tab.count + "");
            }
            else {
                if (this.curPanel != chatObj.user.uId) {
                    this.listTab[key].tab.notify.setVisible(true);
                    this.listTab[key].tab.count++;
                    if (this.listTab[key].tab.count > 9) this.listTab[key].tab.count = 9;
                    this.listTab[key].tab.num.setString(this.listTab[key].tab.count + "");

                    if (active) {
                        this.activeTab(chatObj.user.uId);
                    }
                }
                else {
                    chatMgr.activeUserChat(key, true);
                }
            }
        }
    },

    waitActiveTabId: function (tabId) {
        this.isWaitingMessageUser = true;
        this.tabUserIdActive = tabId;
    },

    switchTab: function (tab) {
        this.curTab = tab;

        if (this.pEmo) this.pEmo.setVisible(tab == ChatInGameGUI.TAB_EMOTION);
        if (this.tabText) this.tabText.setVisible(tab == ChatInGameGUI.TAB_TEXT_CHAT);
        if (this.chatPanelParent) this.chatPanelParent.setVisible(tab == ChatInGameGUI.TAB_CHAT_HISTORY);
        if (this.mainPanel.histories) this.mainPanel.histories.setTouchEnabled(tab == ChatInGameGUI.TAB_CHAT_HISTORY);
    },

    doChatTemplate: function (idx, type) {
        if (type == 0 && this.curPanel == 0) {
            var pkEmotion = new CmdSendChatEmotion();
            pkEmotion.putData(idx);
            GameClient.getInstance().sendPacket(pkEmotion);
            pkEmotion.clean();

            this.onBack();
        }
        else {
            if (type == 0) this.txChat.setString(chatMgr.convertEmoToString(idx));
            else this.txChat.setString(idx);

            this.switchTab(ChatInGameGUI.TAB_CHAT_HISTORY);
        }
    },

    doChatMessage: function () {
        var s = this.txChat.getString();
        if (s && s != "") {
            if (this.curPanel == 0) {
                var cmd = new CmdSendChatString();
                cmd.putData(s);
                GameClient.getInstance().sendPacket(cmd);
                cmd.clean();

                this.txChat.setString("");
                if (!cc.sys.isNative) {
                    this.txChat._edTxt.focus();
                }
            }
            else {
                var toID = this.curPanel;
                var messType = ChatMgr.MSG_USER;

                var chat = {};
                chat.user = {};
                chat.user.uName = gamedata.userData.displayName;
                chat.user.uId = toID;
                chat.chat = s;
                chat.chat = ChatFilter.filterString(chat.chat);

                chatMgr.addChatSending(toID, chat);

                var pk = new CmdSendChatTotal();
                pk.putData(toID, messType, s);

                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                this.txChat.setString("");
            }
        }
        else {
            Toast.makeToast(Toast.SHORT, LocalizedString.to("NHAPCHAT"));
        }
    },

    editBoxEditingDidBegin: function (editbox) {
        if (this.curTab != ChatInGameGUI.TAB_CHAT_HISTORY) {
            this.switchTab(ChatInGameGUI.TAB_CHAT_HISTORY);
        }
    },
    editBoxEvent: function (textField, type) {
        switch (type) {
            case ccui.TextField.EVENT_ATTACH_WITH_IME:
            {
                if (this.curTab != ChatInGameGUI.TAB_CHAT_HISTORY) {
                    this.switchTab(ChatInGameGUI.TAB_CHAT_HISTORY);
                }
                break;
            }
            case ccui.TextField.EVENT_DETACH_WITH_IME:
            {

                break;
            }
            case ccui.TextField.EVENT_INSERT_TEXT:
            {

                break;
            }
        }
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ChatEmoCell(this);
        }
        cell.setEmotion(idx);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(ChatEmoCell.WIDTH, ChatEmoCell.HEIGHT);
    },

    numberOfCellsInTableView: function (table) {
        var a = ChatInGameGUI.EMOTION_NUM;
        var b = ChatInGameGUI.EMOTION_ROW;
        if (a % b == 0)
            return a / b;
        return parseInt(a / b) + 1;
    },

    onButtonRelease: function (button, id) {
        if (id >= ChatInGameGUI.TEXT_CHAT_TAG && id < ChatInGameGUI.TEXT_CHAT_TAG + 100) {
            this.doChatTemplate(LocalizedString.to("CHAT_" + (id - ChatInGameGUI.TEXT_CHAT_TAG)), 1);
        }
        else {
            if (id == 1) {
                this.doChatMessage();
            }
            else if (id == 2) {
                this.onBack();
            }
            else if (id == ChatScene.BTN_TAB_CHAT_ALL) {
                this.activeMainTab(true, true);
            }
            else if (id == ChatScene.BTN_TAB_CHAT) {
                this.activeTab(button.uId);
            }
            else if (id == ChatScene.BTN_TAB_CHAT_CLOSE) {
                this.removeTab(button.uId);
            }
            else {
                if (id == this.curTab)
                    id = ChatInGameGUI.TAB_CHAT_HISTORY;
                this.switchTab(id);
            }
        }
    },

    onBack: function () {
        this.onClose();
    },
});

var ChatGamePanel = BaseLayer.extend({

    ctor: function (size) {
        this.panelSize = size;

        this.histories = null;
        this.list = [];

        this._super();
        this.initWithBinaryFile("ChatHistoryNode.json");
    },

    initGUI: function () {
        var ls = this.getControl("panel");

        ls.setScaleX(this.panelSize.width / ls.getContentSize().width);
        ls.setScaleY(this.panelSize.height / ls.getContentSize().height);

        this.histories = new cc.TableView(this, this.panelSize);
        this.histories.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.histories.setVerticalFillOrder(0);
        this.histories.setDelegate(this);
        this.addChild(this.histories);
        this.histories.reloadData();
    },

    initChat: function (list) {
        var lst = [];
        for (var i = 0; i < list.length; i++) {
            var str = JSON.stringify(list[i]);
            var obj = JSON.parse(str);

            obj.name = "";
            if (obj.user.uName != "") {
                obj.name = obj.user.uName + ": ";
            }
            var fullMsg = ChatMgr.getFullMessage(obj.name, obj.chat, this.panelSize.width);
            var lbMsg = ChatMgr.createText(fullMsg);
            obj.chat = fullMsg;
            obj.size = cc.size(this.panelSize.width, lbMsg.getContentSize().height);

            lst.push(obj);
        }

        this.list = lst;
        this.histories.reloadData();
        this.histories.setContentOffset(cc.p(0, 0));
    },

    receiveChat: function (sobj) {
        if (sobj.chat == "") return;

        var str = JSON.stringify(sobj);
        var obj = JSON.parse(str);

        obj.name = "";
        if (obj.user.uName != "") {
            obj.name = obj.user.uName + ": ";
        }
        var fullMsg = ChatMgr.getFullMessage(obj.name, obj.chat, this.panelSize.width, 1);
        var lbMsg = ChatMgr.createText(fullMsg);
        obj.chat = fullMsg;
        obj.size = cc.size(this.panelSize.width, lbMsg.getContentSize().height);

        if (this.list.length > 30) {
            this.list.splice(0, 5);
        }
        this.list.push(obj);

        this.histories.reloadData();
        this.histories.setContentOffset(cc.p(0, 0));
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ChatItemCell(this.panelSize);
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
        if (cell.info && cell.info.system && cell.info.system == 1) return;

        //sceneMgr.getRunningScene().getMainLayer().addChild(new UserInfoGUI(uObj), LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
        sceneMgr.openGUI(CheckLogic.getUserInfoClassName(), LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO).setInfo(uObj);
    },
});

var ChatPlayer = function () {
}

ChatPlayer.showChatMessage = function (msg, type, parent, pos) {
    fr.crashLytics.log("ChatPlayer.showChatMessage 0: " + msg + " " + type + " "  + JSON.stringify(pos));
    if(Config.ENABLE_INTERACT_PLAYER) {
        if(interactPlayer.detectInteractMessage(msg,true)){
            fr.crashLytics.log("ChatPlayer.showChatMessage 0.5");
            return;
        }
    }

    var node = new cc.Node();
    parent.addChild(node, 200);

    var bgChat = new cc.Scale9Sprite("ChatNew/bgChat.png");
    var arrow = cc.Sprite.create("ChatNew/arrow.png");
    var aSize = arrow.getContentSize();
    node.addChild(bgChat, 0);
    node.addChild(arrow, 1);
    var minSize = bgChat.getContentSize();

    if (msg.length > 40) {
        msg = msg.substring(0, 40) + "...";
    }

    fr.crashLytics.log("ChatPlayer.showChatMessage 1");
    if (msg.length > 20) {
        var count = 20;
        var done = false;
        while (!done) {
            if (msg.charAt(count) == " ") {
                msg = msg.substring(0, count) + "\n" + msg.substring(count, msg.length);
                done = true;
            }
            count++;

            if (count >= msg.length) done = true;
        }
    }

    var ret = new ccui.Text();
    ret.setAnchorPoint(cc.p(0.5, 0.5));
    ret.setFontName(SceneMgr.FONT_NORMAL);
    ret.setFontSize(SceneMgr.FONT_SIZE_DEFAULT);
    ret.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    ret.setColor(cc.color.WHITE);
    ret.setString(msg);
    node.addChild(ret, 2);

    fr.crashLytics.log("ChatPlayer.showChatMessage 2");
    var scale = cc.director.getWinSize().width / Constant.WIDTH;
    scale = (scale > 1) ? 1 : scale;

    var tSize = ret.getBoundingBox();
    var rW, rH;

    if (tSize.width > minSize.width)
        rW = tSize.width * 1.35;
    else
        rW = minSize.width * 1.35;

    if (tSize.height > minSize.height)
        rH = tSize.height * 1.5;
    else
        rH = minSize.height * 1.5;

    bgChat.setContentSize(cc.size(rW, rH));
    bgChat.setScale(scale);
    ret.setScale(scale);
    arrow.setScale(scale);

    rW *= scale;
    rH *= scale;
    aSize = cc.size(aSize.width * scale, aSize.height * scale);

    var dX = 0;
    var dY = 0;
    var pX = 2.5;
    var pXMid = 1.25;
    var pY = 2;
    switch (type) {
        case ChatInGameGUI.BOT_RIGHT:// convert to TOP - LEFT
        {
            dX = -rW / pX;
            dY = minSize.height * pY;
            arrow.setRotation(0);
            arrow.setPosition(rW / 2 - aSize.width, -rH / 2 - aSize.height / 2);
            break;
        }
        case ChatInGameGUI.BOT_LEFT:// convert to TOP - RIGHT
        {
            dX = rW / pX;
            dY = minSize.height * pY;
            arrow.setRotation(0);
            arrow.setPosition(-rW / 2 + aSize.width, -rH / 2 - aSize.height / 2);
            break;
        }
        case ChatInGameGUI.TOP_LEFT:// convert to MID - RIGHT
        {
            dX = -rW / pXMid;
            dY = 0;
            arrow.setRotation(-90);
            arrow.setPosition(rW / 2 + aSize.height / 2, 0);
            break;
        }
        case ChatInGameGUI.TOP_RIGHT:// convert to MID - LEFT
        {
            dX = rW / pXMid;
            dY = 0;
            arrow.setRotation(90);
            arrow.setPosition(-rW / 2 - aSize.height / 2, 0);
            break;
        }
    }
    node.setPosition(pos.x + dX, pos.y + dY);
    fr.crashLytics.log("ChatPlayer.showChatMessage 3");
    // effect
    node.setScale(0);
    bgChat.setOpacity(0);
    ret.setOpacity(0);
    arrow.setOpacity(0);
    var timeShow = 0.35;
    var timeHide = 0.25;
    var timeDelay = 2;
    node.runAction(cc.sequence(new cc.EaseBackOut(cc.scaleTo(timeShow, 1)), cc.delayTime(timeDelay), new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.removeSelf()));
    bgChat.runAction(cc.sequence(cc.fadeTo(timeShow, 150), cc.delayTime(timeDelay), cc.fadeOut(timeHide), cc.removeSelf()));
    arrow.runAction(cc.sequence(cc.fadeTo(timeShow, 150), cc.delayTime(timeDelay), cc.fadeOut(timeHide), cc.removeSelf()));
    ret.runAction(cc.sequence(cc.fadeIn(timeShow), cc.delayTime(timeDelay), cc.fadeOut(timeHide), cc.removeSelf()));
    fr.crashLytics.log("ChatPlayer.showChatMessage 4");
};

ChatPlayer.showChatEmotionNew = function (emo, parent, pos) {
    var eff = db.DBCCFactory.getInstance().buildArmatureNode("Emoticon0");
    if (eff) {
        var scale = cc.director.getWinSize().width / Constant.WIDTH;
        scale = (scale > 1) ? 1 : scale;

        eff.setScale(0);
        eff.getAnimation().gotoAndPlay("" + ChatMgr.convertEmoToNew(emo), -1, -1, 0);
        eff.setPosition(pos.x, pos.y);
        parent.addChild(eff);
        eff.setOpacity(0);
        eff.setLocalZOrder(99);

        eff.runAction(cc.sequence(cc.spawn(new cc.EaseBackOut(cc.scaleTo(0.35, 0.75 * scale)), cc.fadeIn(0.35)), cc.delayTime(3), cc.spawn(new cc.EaseBackIn(cc.scaleTo(0.25, 0)), cc.fadeOut(0.25)), cc.removeSelf()));

        return true;
    }

    return false;
};

ChatPlayer.showChatEmotion = function (emo, parent, pos) {
    if (CheckLogic.checkPlayNewEmoticon()) {
        ChatPlayer.showChatEmotionNew(emo, parent, pos);
        return;
    }

    var imgEmo = cc.Sprite.create("ChatGameUIInGame/Emo" + emo + ".png");
    cc.log("ChatGameUIInGame/Emo" + emo + ".png")
    parent.addChild(imgEmo);


    imgEmo.setPosition(pos);


    var actMove1 = cc.moveTo(0.4, cc.p(pos.x, pos.y + imgEmo.getContentSize().height / 3));
    var actMove2 = cc.moveTo(0.5, pos);
    imgEmo.runAction(cc.sequence(cc.repeat(cc.sequence(actMove1, actMove2), 4), cc.fadeOut(0.2), cc.removeSelf()));

    var scale = cc.director.getWinSize().width / Constant.WIDTH;
    scale = (scale > 1) ? 1 : scale;
    imgEmo.setScale(scale);
    imgEmo.setLocalZOrder(5);
};

// ChatEmoCell.WIDTH = 392;
// ChatEmoCell.HEIGHT = 110;

ChatInGameGUI.className = "ChatInGameGUI";

ChatInGameGUI.EMOTION_NUM = 29;
ChatInGameGUI.EMOTION_ROW = 4;

ChatInGameGUI.TEXT_COL = 2;
ChatInGameGUI.TEXT_ROW = 6;

ChatInGameGUI.TAB_EMOTION = 10;
ChatInGameGUI.TAB_TEXT_CHAT = 11;
ChatInGameGUI.TAB_CHAT_HISTORY = 12;

ChatInGameGUI.TEXT_CHAT_TAG = 100;

ChatInGameGUI.TOP_LEFT = 1;
ChatInGameGUI.TOP_RIGHT = 2;
ChatInGameGUI.BOT_LEFT = 3;
ChatInGameGUI.BOT_RIGHT = 4;