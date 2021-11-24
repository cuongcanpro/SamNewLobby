/**
 * Created by Hunter on 2/13/2017.
 */

var ChatEmoNewCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super("ChatEmoNewCell");

        this.bgItem = cc.Node.create();
        this.bgItem.setPosition(36, -20);
        this.addChild(this.bgItem);

        this.eff = db.DBCCFactory.getInstance().buildArmatureNode("Emoticon0");
        if (this.eff) {
            this.eff.setScale(0.7);
            this.bgItem.addChild(this.eff);
        }

        if (Config.ENABLE_INTERACT_PLAYER) {
            this.vip = cc.Sprite.create(InteractConfig.VIP_ICON);
            this.vip.setPosition(35, -20);
            this.vip.setVisible(false);
            this.addChild(this.vip);
        }
    },

    setEmotion: function (emo) {
        var eff = this.eff;
        if (eff) {
            if (emo.id > 18)
                eff.getAnimation().gotoAndPlay("" + (emo.id - 100 + 18), -1, -1, 0);
            else
                eff.getAnimation().gotoAndPlay("" + emo.id, -1, -1, 0);
        }

        if (Config.ENABLE_INTERACT_PLAYER) {
            this.vip.setVisible(emo.vip && gamedata.userData.typeVip <= 0);
            eff.setOpacity(this.vip.isVisible() ? 85 : 255);
            if(this.vip.isVisible()) {
                if (cc.sys.isNative)
                    eff.getAnimation().gotoAndStop("" + emo.id, -1, -1, 0);
                else
                    eff.getAnimation().gotoAndPlay("" + emo.id, -1, -1, 0);
            }
        }
    },

    onEnter: function () {
        cc.TableViewCell.prototype.onEnter.call(this);
    },
});

var ChatEmoPanelGUI = BaseLayer.extend({

    ctor: function () {
        this.emoList = [];

        var arVip = [0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1];
        for (var i = 0; i < 17; i++) {
            var obj = {};
            obj.id = i + 1;
            obj.vip = arVip[i];
            obj.use = 0;
            this.emoList.push(obj);
        }
        for (var i = 0; i < 12; i++) {
            var obj = {};
            obj.id = 100 + i;
            obj.vip = 0;
            obj.use = 0;
            this.emoList.push(obj);
        }

        if (Config.ENABLE_INTERACT_PLAYER) {
            this.emoList.sort(function (a, b) {
                if (a.vip > b.vip) return 1;
                if (a.vip < b.vip) return -1;
                if (a.id >= 100 && b.id >= 100)
                    return b.id - a.id;
                if (a.id >= 100)
                    return -1;
                if (b.id >= 100)
                    return 1;
                return a.id - b.id;
            });
        }

        this.defaultPos = cc.p(0, 0);

        this._super(ChatEmoPanelGUI.className);
        this.initWithBinaryFile("ChatBoardEmoPanel.json");

        this.waitTouch = 0;
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.panel = this.getControl("panel", this.bg);

        this.listView = new cc.TableView(this, cc.size(this.panel.getContentSize().width, this.panel.getContentSize().height * 1.8));
        this.listView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.listView.setVerticalFillOrder(0);
        this.listView.setDelegate(this);
        this.panel.addChild(this.listView);
       // this.listView.setPositionY(-this.panel.getContentSize().height * 0.2);
        this.listView.reloadData();

        var bgMoreListenter = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                return true;
            },
            onTouchMoved: function (touch, event) {
            },
            onTouchEnded: function (touch, event) {
                event.getCurrentTarget().onTouchBoard(touch);
            }
        });
        cc.eventManager.addListener(bgMoreListenter, this);

        this.scheduleUpdate();
    },

    onEnter: function(){
        this._super();

        if (!cc.sys.isNative){
            this.listView.setTouchEnabled(this.listView.isVisible());
            var bgMoreListenter = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: false,
                onTouchBegan: function (touch, event) {
                    return true;
                },
                onTouchMoved: function (touch, event) {
                },
                onTouchEnded: function (touch, event) {
                    event.getCurrentTarget().onTouchBoard(touch);
                }
            });
            cc.eventManager.addListener(bgMoreListenter, this);
        }
    },

    open: function () {
        this.waitTouch = false;

        var isShow = this.isVisible();

        this.setPosition(this.defaultPos);
        if (isShow) {
            this.runAction(cc.sequence(cc.moveTo(0.15, cc.p(0, -400)), cc.hide()));
        }
        else {
            this.setVisible(true);
            this.setPosition(0, -400);
            this.runAction(cc.moveTo(0.15, this.defaultPos));
        }
    },

    onTouchBoard: function (touch) {
        this.waitTouch = true;
        this.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(this.finishTouchBoard.bind(this))));
    },

    finishTouchBoard: function () {
        if (!this.waitTouch) return;
        if (!this.isVisible()) return;

        this.runAction(cc.sequence(cc.moveTo(0.15, cc.p(0, -400)), cc.hide()));
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ChatEmoNewCell();
        }
        cell.setEmotion(this.emoList[idx]);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(80, 70);
    },

    numberOfCellsInTableView: function (table) {
        return this.emoList.length;
    },

    tableCellTouched: function (table, cell) {
        var idx = cell.getIdx();
        var emo = this.emoList[idx];

        if (emo) {
            var isSend = true;
            if (Config.ENABLE_INTERACT_PLAYER) {
                if (emo.vip) {
                    if (gamedata.userData.typeVip == 0) isSend = false;
                }
            }

            if (isSend) {
                emo.use += 1;

                var pkEmotion = new CmdSendChatEmotion();
                cc.log("du ma ");
                pkEmotion.putData(ChatMgr.convertEmoToOld(emo.id));
                GameClient.getInstance().sendPacket(pkEmotion);
                pkEmotion.clean();

                if (Config.ENABLE_INTERACT_PLAYER) {
                    if (InteractConfig.AUTO_SORT_EMOTION) {
                        this.emoList.sort(function (a, b) {
                            if (a.use > b.use) return -1;
                            if (a.use < b.use) return 1;
                            if (a.vip > b.vip) return 1;
                            if (a.vip < b.vip) return -1;
                            return (a.id - b.id);
                        });

                        this.listView.reloadData();
                    }
                }

                this.runAction(cc.sequence(cc.moveTo(0.15, cc.p(0, -400)), cc.hide()));
            }
            else {
                Toast.makeToast(Toast.SHORT, LocalizedString.to("_VIP_ONLY_USE_"));
            }
        }
    },
});

var ChatPanelGUI = BaseLayer.extend({

    ctor: function () {
        this.hasInit = false;

        this.tabEmo = null;
        this.tabText = null;

        this.listTab = [];
        this.tabHistory = {};

        this.curTab = null;
        this.btnTab = null;
        this.tabChat = null;

        this.activeTabImage = null;

        this.isWaitingMessageUser = false;
        this.tabUserIdActive = -1;

        this._super(ChatPanelGUI.className);
        this.initWithBinaryFile("ChatPanelGUI.json");
    },

    initGUI: function () {
        this.setBackEnable(true);

        this.bg = this.getControl("bg");
        this.pButton = this.getControl("pButton");
        this.pLeft = this.getControl("pLeft");
        this.pRight = this.getControl("pRight");
        this.pTab = this.getControl("pTab");
        this.pChat = this.getControl("pChat");
        this.pQuickChat = this.getControl("pQuickChat");

        this.pChat.setVisible(true);
        this.pQuickChat.setVisible(false);

        this.btnQuickChat = this.customizeButton("btnQuickChat", ChatPanelGUI.BTN_QUICKCHAT);
        this.btnQuickChat.setPressedActionEnabled(false);
        this.btnQuickChat.setEnabled(true);
        this.btnQuickChat.icon = this.getControl("icon", this.btnQuickChat);
        this.btnQuickChat.icon.loadTexture("Board/ChatNew/iconQuickChatInactive.png");
        this.btnChat = this.customizeButton("btnChatNormal", ChatPanelGUI.BTN_CHAT);
        this.btnChat.setPressedActionEnabled(false);
        this.btnChat.setEnabled(false);
        this.btnChat.icon = this.getControl("icon", this.btnChat);
        this.btnChat.icon.loadTexture("Board/ChatNew/iconChat.png");

        var size = cc.director.getWinSize();
        // this.bg.setScaleY(this._scale);
        // this.bg.setScaleX(size.width / this.bg.getContentSize().width);

        // var posYTop = this.bg.getContentSize().height * this._scale * 0.965 - this.pButton.getContentSize().height * this._scale / 2;
        // this.pButton.setPositionY(posYTop);
        // this.pTab.setPositionY(posYTop);
        // this.pTab.removeFromParent();
        // this.addChild(this.pTab);

        var tfChat = this.getControl("tf", this.pTab);
        tfChat.setVisible(false);
        this.tfChatTemp = tfChat;
        if (cc.sys.isNative){
            this.txChat = BaseLayer.createEditBox(tfChat);
            this.txChat.setDelegate(this);
            this.pTab.addChild(this.txChat);
        }

        var panelHeight = this.bg.getContentSize().height * this._scale * 0.965 - this.pButton.getContentSize().height * this._scale;
        this.pLeft.setScaleY(panelHeight / this.pLeft.getContentSize().height);
        this.pRight.setScaleY(panelHeight / this.pRight.getContentSize().height);

        this.pLeft.setScaleX(this._scale);
        this.pRight.setScaleX(size.width - this.pLeft.getContentSize().width * this._scale / this.pRight.getContentSize().width);

        this.finishOpenGUI();

        // add touch event to auto close gui
        var bgMoreListenter = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                return true;
            },
            onTouchMoved: function (touch, event) {
            },
            onTouchEnded: function (touch, event) {
                event.getCurrentTarget().onTouchBoard(touch);
            }
        });
        cc.eventManager.addListener(bgMoreListenter, this);
    },

    onEnter: function(){
        this._super();

        if (!cc.sys.isNative){
            this.tabText.view.setTouchEnabled(true);

            var bgMoreListenter = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function (touch, event) {
                    return true;
                },
                onTouchMoved: function (touch, event) {
                },
                onTouchEnded: function (touch, event) {
                    event.getCurrentTarget().onTouchBoard(touch);
                }
            });
            cc.eventManager.addListener(bgMoreListenter, this);

            this.txChat = BaseLayer.createEditBox(this.tfChatTemp);
            this.txChat.setDelegate(this);
            this.pTab.addChild(this.txChat);
        }
    },

    onExit: function(){
        this._super();

        if (!cc.sys.isNative){
            this.txChat.removeFromParent(true);
        }
    },

    openTabButton: function (id, p) {
      //  this.tabEmo.setVisible(id == ChatPanelGUI.BTN_EMO);
        this.tabText.setVisible(id == ChatPanelGUI.BTN_TEXT);

        if (this.activeTabImage) {
            p = p || this.activeTabImage.dPos;
            this.activeTabImage.setPositionX(p.x);
        }
    },

    selectTab: function (tabIdx) {
        if (tabIdx === undefined || tabIdx == null) tabIdx = 0;

        if (tabIdx !== this.tabChat.chosenIdx) {
            var cellGet = this.tabChat.pList.cellAtIndex(this.tabChat.chosenIdx);
            if (cellGet) cellGet.setChosen(false);
            cellGet = this.tabChat.pList.cellAtIndex(tabIdx);
            if (cellGet) cellGet.setChosen(true);
        }
        this.tabChat.chosenIdx = tabIdx;

        var tab = this.listTab[tabIdx];
        this.switchHistory(tab.id);
        this.visibleTab(0);
    },

    switchHistory: function (tabId) {
        this.curTab = tabId;

        for (var key in this.tabHistory) {
            this.tabHistory[key].setVisible(tabId == key);
        }
    },

    visibleTab: function (force) {
        var isShow = null;
        if (force !== undefined || force != null) {
            isShow = (force == 1) ? true : false;
        }
        else {
            isShow = !this.tabChat.isVisible();
        }

        this.tabChat.setVisible(true);
        this.btnTab.icon.setRotation(!isShow ? 0 : 180);

        for (var s in this.tabHistory) {
            this.tabHistory[s].focus(!isShow);
        }
        this.pTab.setLocalZOrder(isShow ? 11 : 9);
    },

    addTabHistory: function (id, chatObj) {
        var p = new ChatHistoryPanel(this, this.pRight.getContentSize());
        var pSize = this.pRight.getContentSize();
        p.setPosition(this.pRight.getPosition());
        if (chatObj) {
            p.receiveChat(chatObj);
        }
        this.pChat.addChild(p);

        this.tabHistory[id] = p;
        p.setVisible(false);
        p.setScale(this._scale);
        p.setLocalZOrder(10);
        return p;
    },

    activeTabHistory: function (id) {
        this.isWaitingMessageUser = true;
        this.tabUserIdActive = id;
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case ChatPanelGUI.BTN_EMO:
            case ChatPanelGUI.BTN_TEXT:
                this.openTabButton(id, btn.getPosition());
                break;
            case ChatPanelGUI.BTN_TAB:
                this.visibleTab();
                break;
            case ChatPanelGUI.BTN_SEND:
                var s = this.txChat.getString();
                this.doSendChat(s);
                this.txChat.setString("");
                break;
            case ChatPanelGUI.BTN_EMOTE:
                this.emotePanel.readyToUse = true;
                this.emotePanel.setVisible(true);
                break;
            case ChatPanelGUI.BTN_QUICKCHAT:
                this.pChat.setVisible(false);
                this.pQuickChat.setVisible(true);

                this.btnQuickChat.setEnabled(false);
                this.btnQuickChat.icon.loadTexture("Board/ChatNew/iconQuickChat.png");
                this.btnChat.setEnabled(true);
                this.btnChat.icon.loadTexture("Board/ChatNew/iconChatInactive.png");
                break;
            case ChatPanelGUI.BTN_CHAT:
                this.pChat.setVisible(true);
                this.pQuickChat.setVisible(false);

                this.btnChat.setEnabled(false);
                this.btnChat.icon.loadTexture("Board/ChatNew/iconChat.png");
                this.btnQuickChat.setEnabled(true);
                this.btnQuickChat.icon.loadTexture("Board/ChatNew/iconQuickChatInactive.png");
                break;
        }
    },

    onEnterFinish: function () {
        this.waitTouch = false;
        if (this.hasInit) {
            this.finishOpenGUI();
        }
        this.setVisible(true);
        this.bg.setOpacity(0)
        this.bg.setPositionY(-50);
        this.bg.runAction(cc.sequence(
            cc.spawn(
                cc.fadeIn(0.25),
                cc.moveTo(0.25, cc.p(0, 0)).easing(cc.easeBackOut())
            ),
            cc.callFunc(this.finishOpenGUI.bind(this))
        ));
    },

    finishOpenGUI: function () {
        if (!this.hasInit) {
            this.hasInit = true;

            // init tab
            var bEmo = this.customButton("btnEmo", ChatPanelGUI.BTN_EMO, this.pButton);
            var bChat = this.customButton("btnChat", ChatPanelGUI.BTN_TEXT, this.pButton);
            bEmo.setVisible(false);
            bChat.setVisible(false);
            var bSend = this.customButton("btnSend", ChatPanelGUI.BTN_SEND, this.pButton);
            this.customizeButton("btnEmote", ChatPanelGUI.BTN_EMOTE).setPressedActionEnabled(false);
           // bSend.setPositionX(bSend.getPositionX() + 100);

            this.activeTabImage = this.getControl("active", this.pButton);
            this.activeTabImage.dPos = bChat.getPosition();
            this.activeTabImage.setVisible(false);

           // this.tabEmo = new ChatEmoListPanel(cc.size(this.pLeft.getContentSize().width * this._scale, this.pLeft.getContentSize().height * this._scale), this.pLeft.getPosition());
            //this.addChild(this.tabEmo);

            this.tabText = new ChatQuickTextPanel(cc.size(
                this.pLeft.getContentSize().width * this._scale,
                this.pLeft.getContentSize().height * this._scale), this.pLeft.getPosition());
            this.pQuickChat.addChild(this.tabText);

            // init tab chat
            var tabRoom = {};
            tabRoom.id = "0";
            tabRoom.name = LocalizedString.to("CHAT_ROOM");
            this.listTab.push(tabRoom);

            this.btnTab = this.customButton("btn", ChatPanelGUI.BTN_TAB, this.pTab);
            this.btnTab.icon = this.getControl("ico", this.btnTab);
            this.btnTab.lb = this.getControl("lb", this.btnTab);

            //ChatTabListItem.textColor = this.btnTab.lb.getTextColor();

            var panelTabChat = this.getControl("tab", this.pTab);
            this.tabChat = new ChatTabListPanel(this, panelTabChat);
            this.tabChat.setPosition(panelTabChat.getPosition());
            this.pTab.addChild(this.tabChat);

            this.selectTab();

            // init history chat
            this.addTabHistory("0");
            this.switchHistory("0");

            //init
            this.emotePanel = new ChatEmoGUI();
            this.bg.addChild(this.emotePanel);
            this.emotePanel.setCascadeOpacityEnabled(true);
            this.emotePanel.btnClose.setVisible(false);
            this.emotePanel.bg.setScale(1);
            this.emotePanel.chatPanel = this;
            this.emotePanel.setVisible(false);
        }

        this.emotePanel.setVisible(false);
        this.emotePanel.readyToUse = true;

        this.openTabButton(ChatPanelGUI.BTN_TEXT);
        this.updateChatHistory();

        if (this.isWaitingMessageUser && this.tabUserIdActive > 0) {
            var tabIdx = 0;
            if (!(this.tabUserIdActive in this.tabHistory)) {
                this.addTabHistory(this.tabUserIdActive).updateChatHistory(this.tabUserIdActive);
                var cObj = chatMgr.chatUsers[this.tabUserIdActive][0];
                if (cObj) {
                    var tabOther = {};
                    tabOther.id = this.tabUserIdActive;
                    tabOther.name = cObj.user.uName;
                    this.listTab.push(tabOther);
                    this.tabChat.updateTab();

                    tabIdx = this.listTab.length - 1;
                }
            }
            else {
                for (var i = 0, size = this.listTab.length; i < size; i++) {
                    if (this.listTab[i].id == this.tabUserIdActive) {
                        tabIdx = i;
                    }
                }
            }
            // active tab
            this.selectTab(tabIdx);

            this.isWaitingMessageUser = false;
            this.tabUserIdActive = -1;
        }
    },

    updateChatHistory: function () {
        for (var key in this.tabHistory) {
            this.tabHistory[key].updateChatHistory(key);
        }

        for (var s in chatMgr.activeUserChats) {
            if (!(s in this.tabHistory)) {
                this.addTabHistory(s).updateChatHistory(s);
                var cObj = chatMgr.chatUsers[s][0];
                if (cObj) {
                    var tabOther = {};
                    tabOther.id = s;
                    tabOther.name = cObj.user.uName;
                    this.listTab.push(tabOther);
                    this.tabChat.updateTab();
                }
            }
        }
    },

    onTouchBoard: function (touch) {
        this.waitTouch = true;
        this.finishTouchBoard();
    },

    finishTouchBoard: function () {
        if (!this.waitTouch) return;
        if (!this.isVisible()) return;

        this.bg.runAction(cc.sequence(
            cc.spawn(
                cc.fadeOut(0.25),
                cc.moveTo(0.25, cc.p(0, -50)).easing(cc.easeBackIn())
            ),
            cc.callFunc(this.onClose.bind(this))
        ));
    },

    editBoxReturn: function (editBox) {
        if (editBox) {
            this.doSendChat(editBox.getString());
            setTimeout(function () {
                if (this) this.setString("");
            }.bind(editBox), 100);

        }
    },

    doChatTemplate: function (type, msg) {
        if (type === undefined || msg === undefined) return;

        var str = "";

        if (type == 0) {
            if (this.curTab && this.curTab == "0") {
                var pkEmotion = new CmdSendChatEmotion();
                pkEmotion.putData(msg);
                GameClient.getInstance().sendPacket(pkEmotion);
                pkEmotion.clean();

                this.onTouchBoard();
                return;
            }
            else {
                str = chatMgr.convertEmoToString(msg);
            }
        }
        else {
            str = msg;
        }

        this.doSendChat(str);

        // check auto hide gui
        if (this.curTab && this.curTab == "0") {
            this.onTouchBoard();
        }
    },

    doSendChat: function (s) {
        if (s && s != "") {
            if (this.curTab && this.curTab == "0") {
                var cmd = new CmdSendChatString();
                cmd.putData(s);
                GameClient.getInstance().sendPacket(cmd);
                cmd.clean();

                this.txChat.setString("");
            }
            else {
                if (CheatCenter.checkOpenCheat(s))
                    return;

                var toID = this.curTab;
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

    onReceiveChat: function (type, chatObj, active) {
        cc.log("ChatPanelGUI::onReceiveChat " + type + "/" + JSON.stringify(chatObj));

        if (active === undefined || active == null) active = false;

        var key = "";
        if (type == ChatMgr.MSG_ROOM) {
            key = "0";
        }

        if (type == ChatMgr.MSG_USER) {
            var key = chatObj.user.uId + "";
        }

        var isHas = false;
        for (var i = 0; i < this.listTab.length; i++) {
            if (this.listTab[i].id == key) {
                isHas = true;
                break;
            }
        }

        if (!isHas) {
            var tabOther = {};
            tabOther.id = key;
            tabOther.name = chatObj.user.uName;
            this.listTab.push(tabOther);
            this.tabChat.updateTab();
        }

        if (key in this.tabHistory) {
            this.tabHistory[key].receiveChat(chatObj);
        }
        else {
            this.addTabHistory(key, chatObj);
        }
    },

    onBack: function () {
        this.onTouchBoard();
    },
});

ChatPanelGUI.GUI_PANEL = 200;
ChatPanelGUI.BTN_EMO = 1;
ChatPanelGUI.BTN_TEXT = 2;
ChatPanelGUI.BTN_SEND = 3;
ChatPanelGUI.BTN_TAB = 4;
ChatPanelGUI.BTN_EMOTE = 5;
ChatPanelGUI.BTN_QUICKCHAT = 6;
ChatPanelGUI.BTN_CHAT = 7;

var ChatTabListItem = cc.TableViewCell.extend({
    ctor: function (size) {
        this._super();
        this.info = null;

        this.bg = ccui.ImageView("ChatNew/bgTabChat.png");
        var sX = size.width / this.bg.getContentSize().width;
        this.bg.setScaleX(sX);
        this.bg.setScaleY(0.98);

        this.lb = BaseLayer.createLabelText();
        this.lb.setFontName("fonts/robotoLight.ttf");
        this.lb.setFontSize(15);
        this.lb.setColor(ChatTabListItem.textColor);
        this.lb.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.lb.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this.bg.setVisible(true);
        this.addChild(this.bg);
        this.addChild(this.lb);

        this.bg.setPosition(this.bg.getContentSize().width * sX / 2, this.bg.getContentSize().height / 2);
        this.lb.setPosition(this.bg.getPosition());
    },

    setInfo: function (info) {
        this.info = info;
        this.lb.setString(info.name);
    },

    setChosen: function (isChosen) {
        if (isChosen) {
            this.bg.loadTexture("ChatNew/bgTabChatChosen.png");
            this.lb.setColor(ChatTabListItem.textColorChosen);
        } else {
            this.bg.loadTexture("ChatNew/bgTabChat.png");
            this.lb.setColor(ChatTabListItem.textColor);
        }
    }
});

ChatTabListItem.textColorChosen = cc.color("#c35b50");
ChatTabListItem.textColor = cc.color("#fcf4ca");

var ChatTabListPanel = cc.Node.extend({
    ctor: function (parent, item) {
        this._super();

        this.panel = parent;
        this.panelSize = item.getContentSize();

        var sp = cc.Sprite.create("ChatNew/bgTabChat.png");
        this.itemSize = cc.size(sp.getContentSize().width, item.getContentSize().height);

        this.chosenIdx = 0;

        this.pList = new cc.TableView(this, item.getContentSize());
        this.pList.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.pList.setDelegate(this);
        this.pList.setVerticalFillOrder(0);
        this.pList.reloadData();
        this.addChild(this.pList);

        // add touch event to auto close gui
        var bgMoreListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                return true;
            },
            onTouchMoved: function (touch, event) {
            },
            onTouchEnded: function (touch, event) {
                event.getCurrentTarget().onTouchBoard(touch);
            }
        });
        cc.eventManager.addListener(bgMoreListener, this);
    },

    updateTab: function () {
        this.pList.reloadData();
    },

    onTouchBoard: function (touch) {
        var pos = this.getParent().convertToNodeSpace(touch.getLocation());
        var cp = this.getPosition();
        var rect = cc.rect(cp.x, cp.y, this.panelSize.width, this.panel.height);

        if (!cc.rectContainsPoint(rect, pos)) {
            this.panel.visibleTab(0);
        }
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ChatTabListItem(this.itemSize);
        }
        cell.setInfo(this.panel.listTab[idx]);
        cell.setChosen(this.chosenIdx === idx);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(this.itemSize.width + 10, this.itemSize.height);
    },

    numberOfCellsInTableView: function (table) {
        return this.panel.listTab.length;
    },

    tableCellTouched: function (table, cell) {
        this.panel.selectTab(cell.getIdx());
    },
});

var ChatHistoryPanel = BaseLayer.extend({

    ctor: function (p, size) {
        this.panel = p;
        this.panelSize = size;

        this.datas = [];
        this.histories = null;

        this._super("");
        this.initGUI();
    },

    initGUI: function () {
        this.histories = new cc.TableView(this, this.panelSize);
        this.histories.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.histories.setVerticalFillOrder(0);
        this.histories.setDelegate(this);
        this.addChild(this.histories);
        this.histories.reloadData();
    },

    updateChatHistory: function (id) {
        if (!id) return;

        this.datas = [];

        var lst = null;
        if (id == "0") {
            lst = chatMgr.chatRooms;
        }
        else {
            if (id in chatMgr.chatUsers) {
                lst = chatMgr.chatUsers[id];
            }
        }

        if (lst) {
            for (var i = 0, size = lst.length; i < size; i++) {
                this.receiveChat(lst[i]);
            }
        }
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ChatItemCell();
        }
        cell.cellSize = this.datas[idx].size;
        cell.setChat(this.datas[idx]);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(
            this.datas[idx].size.width + ChatHistoryPanel.MARGIN * 2,
            this.datas[idx].size.height + ChatHistoryPanel.MARGIN * 2
        );
    },

    numberOfCellsInTableView: function (table) {
        return this.datas.length;
    },

    tableCellTouched: function (table, cell) {
        var uObj = cell.getUserData();
        if (cell.info && cell.info.system && cell.info.system == 1) return;

        sceneMgr.openGUI(CheckLogic.getUserInfoClassName(), LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO).setInfo(uObj);
    },

    receiveChat: function (sobj) {
        if (sobj.chat == "") return;

        var str = JSON.stringify(sobj);
        var obj = JSON.parse(str);

        obj.name = "";
        if (obj.user.uName != "") {
            obj.name = obj.user.uName + ": ";
        }
        var fullMsg = ChatMgr.getFullMessage(obj.name, obj.chat, this.panelSize.width - ChatHistoryPanel.MARGIN * 2, 1);
        var lbMsg = ChatMgr.createText(fullMsg);
        obj.chat = fullMsg;
        obj.size = cc.size(this.panelSize.width - ChatHistoryPanel.MARGIN * 2, lbMsg.getContentSize().height);

        if (this.datas.length > 30) {
            this.datas.splice(0, 5);
        }
        this.datas.push(obj);

        this.histories.reloadData();
        this.histories.setContentOffset(cc.p(0, 0));
    },

    focus: function (enable) {
        this.histories.setTouchEnabled(enable);
    },
});
ChatHistoryPanel.MARGIN = 25;
ChatHistoryPanel.MARGIN_BUBBLE = 20;
ChatHistoryPanel.MARGIN_BUBBLE_HEIGHT = 10;

var ChatEmoListItem = cc.TableViewCell.extend({

    ctor: function (panel, size) {
        this.gParent = panel;
        this.curIndex = -1;
        this.arPos = [];

        var iWidth = size.width / 4;
        this.iSize = cc.size(iWidth, size.height);

        for (var i = 0; i < ChatEmoListItem.NUM_EMO_IN_ROW; i++) {
            this.arPos.push(cc.p(i * iWidth + this.iSize.width / 2, this.iSize.height / 2));
        }

        this.savePosTouch = 0;
        this.isWaitingClick = false;

        this._super("");
        this.initGUI();
    },

    initGUI: function () {
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,

            onTouchBegan: function (touch, event) {
                event.getCurrentTarget().onTouch(0, touch.getLocation());
                return true;
            },

            onTouchEnded: function (touch, event) {
                event.getCurrentTarget().onTouch(2, touch.getLocation());
            },

            onTouchMoved: function (touch, event) {
                event.getCurrentTarget().onTouch(1, touch.getLocation());
            }
        }, this);
    },

    onTouch: function (type, pos) {
        if (!this.gParent.isVisible()) return;

        var isTouch = false;
        var idx = -1;

        if (this.isTouchCell(pos)) {
            if (type == 0) {
                this.isWaitingClick = true;
                this.savePosTouch = pos;
            }
            else if (type == 1) {
                if (Math.abs(pos.y - this.savePosTouch.y) > 3 || Math.abs(pos.x - this.savePosTouch.x) > 3) {
                    this.isWaitingClick = false;
                }
            }
            else if (type == 2) {
                if (this.isWaitingClick) {
                    var emoIdx = this.isTouchEmo(pos);
                    if (emoIdx > -1) {
                        isTouch = true;
                        idx = emoIdx;
                    }
                }
            }
        }

        if (isTouch) {
            var gui = sceneMgr.getGUI(ChatMgr.GUI_CHAT_IN_GAME);
            if (gui && gui instanceof  ChatPanelGUI) {
                gui.doChatTemplate(0, ChatMgr.convertEmoToOld(idx));
            }
        }
    },

    setEmotion: function (idx) {
        this.removeAllChildren();

        this.curIndex = ChatEmoListItem.NUM_EMO_IN_ROW * idx + 1;

        for (var i = 0; i < ChatEmoListItem.NUM_EMO_IN_ROW; i++) {
            var index = (this.curIndex + i);
            if (index <= ChatEmoListItem.NUM_EMO_MAX) {
                var eff = db.DBCCFactory.getInstance().buildArmatureNode("Emoticon0");
                if (eff) {
                    eff.setScale(0.3);
                    eff.setPosition(this.arPos[i]);
                    this.addChild(eff);
                    eff.getAnimation().gotoAndPlay("" + index, -1, -1, 0);
                }
            }
        }
        this.addListnerWeb();
    },

    addListnerWeb: function () {
        if (!cc.sys.isNative){
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,

                onTouchBegan: function (touch, event) {
                    event.getCurrentTarget().onTouch(0, touch.getLocation());
                    return true;
                },

                onTouchEnded: function (touch, event) {
                    event.getCurrentTarget().onTouch(2, touch.getLocation());
                },

                onTouchMoved: function (touch, event) {
                    event.getCurrentTarget().onTouch(1, touch.getLocation());
                }
            }, this);
            cc.log("addListnerWeb");
        }
    },

    isTouchCell: function (p) {
        var pos = this.getParent().convertToNodeSpace(p);
        var cp = this.getPosition();
        var rect = cc.rect(cp.x, cp.y, this.iSize.width * ChatEmoListItem.NUM_EMO_IN_ROW, this.iSize.height);

        return (cc.rectContainsPoint(rect, pos));
    },

    isTouchEmo: function (p) {
        var pos = this.convertToNodeSpace(p);
        for (var i = 0; i < ChatEmoListItem.NUM_EMO_IN_ROW; i++) {
            var pE = this.arPos[i];
            var pS = this.iSize;
            var rect = cc.rect(pE.x - pS.width / 2, pE.y - pS.height / 2, pS.width, pS.height);
            if (cc.rectContainsPoint(rect, pos)) {
                return (this.curIndex + i);
            }
        }
        return -1;
    },

    onEnter: function () {
        cc.TableViewCell.prototype.onEnter.call(this);
    },
});

ChatEmoListItem.NUM_EMO_MAX = 17;
ChatEmoListItem.NUM_EMO_IN_ROW = 4;

var ChatEmoListPanel = BaseLayer.extend({

    ctor: function (size, pos) {
        this._super("");

        this.view = null;

        this.pSize = size;
        this.iSize = cc.size(size.width, size.height / 4);

        this.setPosition(pos.x - size.width, pos.y);
        this.initGUI();
    },

    initGUI: function () {
        this.view = new cc.TableView(this, this.pSize);
        this.view.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.view.setVerticalFillOrder(0);
        this.view.setDelegate(this);
        this.view.reloadData();
        this.addChild(this.view);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ChatEmoListItem(this, this.iSize);
        }
        cell.setEmotion(idx);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return this.iSize;
    },

    numberOfCellsInTableView: function (table) {
        var a = ChatEmoListItem.NUM_EMO_MAX;
        var b = ChatEmoListItem.NUM_EMO_IN_ROW;
        if (a % b == 0)
            return a / b;
        return parseInt(a / b) + 1;
    },
});

var ChatQuickTextItem = cc.TableViewCell.extend({

    ctor: function (p) {
        this._super("ChatQuickTextItem");

        this.initGUI();
    },

    initGUI: function () {
        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);

        this.sp = cc.Sprite.create("ChatNew/bgText.png");
        this.lb = BaseLayer.createLabelText();
        this.lb.setColor(cc.color("#f3e2b6"));
        this.lb.setFontSize(20);

        this.sp.setPosition(this.sp.getContentSize().width / 2, this.sp.getContentSize().height / 2);
        this.lb.setAnchorPoint(cc.p(0, 0.5));
        this.lb.setPosition(cc.p(35, this.sp.getContentSize().height / 2));

        this.addChild(this.sp);
        this.addChild(this.lb);
    },

    setChat: function (txt) {
        this.lb.setString(txt);
    },

    onEnter: function () {
        cc.TableViewCell.prototype.onEnter.call(this);
    },
});

var ChatQuickTextPanel = BaseLayer.extend({

    ctor: function (size, pos) {
        this.list = [];
        this.view = null;

        this.pSize = size;
        this.iSize = null;

        this._super("");
        this.setPosition(pos.x - size.width, pos.y);
        this.initGUI();
    },

    initGUI: function () {
        for (var i = 1; i <= 12; i++) {
            this.list.push(LocalizedString.to("CHAT_" + i));
        }

        var sp = cc.Sprite.create("ChatNew/bgText.png");
        this.iSize = cc.size(this.pSize.width, sp.getContentSize().height * this._scale * 1.1);

        this.view = new cc.TableView(this, this.pSize);
        this.view.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.view.setVerticalFillOrder(0);
        this.view.setDelegate(this);
        this.view.reloadData();
        this.addChild(this.view);
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ChatQuickTextItem();
        }
        cell.setChat(this.list[idx]);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return this.iSize;
    },

    numberOfCellsInTableView: function (table) {
        return this.list.length;
    },

    tableCellTouched: function (table, cell) {
        var gui = sceneMgr.getGUI(ChatMgr.GUI_CHAT_IN_GAME);
        if (gui && gui instanceof ChatPanelGUI) {
            gui.doChatTemplate(1, this.list[cell.getIdx()]);
        }
    },
});

ChatPanelGUI.className = "ChatPanelGUI";