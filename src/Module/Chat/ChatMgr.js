/**
 * Created by HunterPC on 3/2/2016.
 */

var ChatMgr = cc.Class.extend({
    ctor: function () {
        this.chatTotal = [];
        this.chatRoom = {notify: false, dialog: []};
        this.chatUsers = {};
        this.userTrack = [];    //keep track of dialog order
    },

    /* region data */
    resetData: function () {
        this.chatTotal = [];
        this.chatRoom = {notify: false, dialog: []};
        this.chatUsers = {};
        this.userTrack = [];
    },

    onJoinRoom: function () {
        this.chatRoom = {notify: false, dialog: []};
        var gui = sceneMgr.getGUIByClassName(ChatPanelGUI.className);
        if (gui) gui.onUpdateGUI();
    },

    addTabUser: function (id, userName) {
        if (this.userTrack.length >= ChatMgr.MAX_DIALOG_KEEP)
            this.removeTabUser(this.userTrack[this.userTrack.length - 1]);
        this.chatUsers[id] = {userName: userName, dialog: [], notify: false};
        this.userTrack.unshift(id);

        var gui = sceneMgr.getGUIByClassName(ChatPanelGUI.className);
        if (gui) gui.updateTabList();
    },

    removeTabUser: function (id) {
        if (id in this.chatUsers) {
            delete this.chatUsers[id];
            this.userTrack.splice(this.userTrack.indexOf(id), 1)
            var gui = sceneMgr.getGUIByClassName(ChatPanelGUI.className);
            if (gui) gui.updateTabList();
        }
    },

    addChatUser: function (sender, toId, message) {
        if (sender.uId == 0) {
            this.addChatTotal(sender, message);
            return;
        }

        var chatId = (sender.uId == gamedata.userData.uID) ? toId : sender.uId;
        if (!(chatId in this.chatUsers))    //message init from other user
            this.addTabUser(sender.uId, sender.uName);
        if (this.chatUsers[chatId].dialog.length >= ChatMgr.DIALOG_MAX_LENGTH)
            this.chatUsers[chatId].dialog.splice(0, 5);
        this.chatUsers[chatId].dialog.push({
            uId: sender.uId, userName: sender.uName, message: (message = ChatFilter.filterString(message))
        });
        this.onNotify(chatId, true);
        this.userTrack.splice(this.userTrack.indexOf(chatId), 1);
        this.userTrack.unshift(chatId);

        if (CheckLogic.checkInBoard() && gamedata.gameLogic) {
            for (var i = 0; i < gamedata.gameLogic._players.length; i++) {
                if (gamedata.gameLogic._players[i]._ingame && gamedata.gameLogic._players[i]._info != null && sender.uId == gamedata.gameLogic._players[i]._info["uID"]) {
                    var mess = LocalizedString.to("CHAT_PRIVATE");
                    mess = StringUtility.replaceAll(mess, "@user", toId == gamedata.userData.uID ? LocalizedString.to("BAN").toLowerCase() : this.chatUsers[chatId].userName);
                    mess = StringUtility.replaceAll(mess, "@mess", message);
                    ChatMgr.playChatEffect(i, mess);
                    break;
                }
            }
        }

        var gui = sceneMgr.getGUIByClassName(ChatPanelGUI.className);
        if (gui) {
            gui.updateTabList();
            gui.onReceiveChat(chatId);
        }
    },

    addChatRoom: function (uId, username, message) {
        if (this.chatRoom.dialog.length >= ChatMgr.DIALOG_MAX_LENGTH)
            this.chatRoom.dialog.splice(0, 5);
        this.chatRoom.dialog.push({
            uId: uId, userName: username, message: message
        });
        this.onNotify(0, true);

        var gui = sceneMgr.getGUIByClassName(ChatPanelGUI.className);
        if (gui) gui.onReceiveChat(0);
    },

    addChatTotal: function (sender, message) {
        if (this.chatTotal.length >= ChatMgr.DIALOG_MAX_LENGTH)
            this.chatTotal.splice(0, 5);
        this.chatTotal.push({
            uId: sender.uId, userName: sender.uName, message: message
        });
    },

    onNotify: function (id, notify) {
        if (id == 0) this.chatRoom.notify = notify;
        else this.chatUsers[id].notify = notify;

        var gui = sceneMgr.getGUIByClassName(ChatPanelGUI.className);
        if (gui) gui.onNotify(id, notify);
    },

    isNotify: function () {
        if (this.chatRoom.notify) return true;
        for (var id in this.chatUsers)
            if (this.chatUsers[id].notify) return true;
        return false;
    },
    /* endregion data */

    /* region GUI controllers */
    openChatGUI: function () {
        sceneMgr.openGUI(ChatPanelGUI.className, ChatPanelGUI.TAG, ChatPanelGUI.TAG);
    },

    openChatGUIAtTab: function (id, name) {
        if (!(id in this.chatUsers))
            this.addTabUser(id, name);
        var gui = sceneMgr.openGUI(ChatPanelGUI.className, ChatPanelGUI.TAG, ChatPanelGUI.TAG);
        gui.selectTabById(id);
        gui.emotePanel.setVisible(false);
        gui.onButtonRelease(gui.btnChat, ChatPanelGUI.BTN_CHAT);
    },
    /* endregion GUI controllers */

    /* region listeners */
    onReceive: function (cmd, data) {
        switch (cmd) {
            case CMD.CMD_CHAT_TOTAL:
                var pk = new CmdReceiveChatTong(data);
                cc.log("CMD.CMD_CHAT_TOTAL", JSON.stringify(pk));
                pk.clean();
                this.onReceiveChatTotal(pk);
                break;
            case CMD.CMD_SYSTEM_CHAT:
                var pk = new CmdReceiveSystemNotify(data);
                cc.log("CMD.CMD_SYSTEM_CHAT", JSON.stringify(pk));
                pk.clean();
                this.onReceiveChatSystem(pk);
                break;
            case CMD.CMD_SEND_MESSAGE:
                var pk = new CmdReceiveMessage(data);
                cc.log("CMD.CMD_SEND_MESSAGE", JSON.stringify(pk));
                pk.clean();
                this.onReceiveChatRoom(pk);
                break;
        }
    },

    onReceiveChatTotal: function (pk) {
        if (pk.response) {
            if (this.chatUsers[pk.toID]) {
                var error = pk.getError();
                if (error != 0) {
                    var message = "";
                    switch (error) {
                        case 1:
                            message = LocalizedString.to("CHAT_NOTE1");
                            break;
                        case 2:
                            message = LocalizedString.to("CHAT_NOTE3");
                            break;
                        case 6:
                            message = LocalizedString.to("CHATFAST");
                            break;
                        default:
                            message = StringUtility.replaceAll("message error (code: @error)", "@error", error);
                            break;
                    }
                    this.addChatUser({uId: pk.toID, uName: ""}, gamedata.userData.uID, message);
                    return;
                }
            }
        }

        switch (pk.msgType) {
            case ChatMgr.MSG_SERVER:
                if ((pk.content = pk.content.trim()) == "") return;
                this.addChatTotal(pk.sender, pk.content);
                break;
            case ChatMgr.MSG_USER:
                if (pk.sender != null) {
                    if ((pk.content = pk.content.trim()) == "") return;
                    if (pk.sender.uId != gamedata.userData.uID && pk.toID != gamedata.userData.uID) return;
                    this.addChatUser(pk.sender, pk.toID, pk.content);
                }
                break;
            case ChatMgr.MSG_SYSTEM:
                if (pk.sender != null) {
                    if (pk.sender.uId == gamedata.userData.uID || pk.toID != gamedata.userData.uID) return;
                    var message = StringUtility.replaceAll(LocalizedString.to("CHAT_NOTE2"), "@name", pk.sender.uName);
                    this.addChatUser(pk.sender, pk.toID, message);
                }
                break;
        }
    },

    onReceiveChatSystem: function (pk) {
        //cam chat
        var mess = "";
        if (pk.reason.localeCompare(LocalizedString.to("CHAT_NOTE6")) === 0)
            mess = pk.reason;
        else {
            if (pk.exprired < 0) {
                mess = LocalizedString.to("CHAT_NOTE5");
            } else if (pk.exprired > 0) {
                mess = LocalizedString.to("CHAT_NOTE4");
                mess = StringUtility.replaceAll(mess, "@gio", pk.hour);
                mess = StringUtility.replaceAll(mess, "@ngay", pk.exprired);
            }
            mess = StringUtility.replaceAll(mess, "@reason", pk.reason);
            mess = StringUtility.replaceAll(mess, "@name", pk.response ? LocalizedString.to("BAN") : pk.name);
        }
        Toast.makeToast(Toast.LONG, mess);
    },

    onReceiveChatRoom: function (pk) {
        if (!CheckLogic.checkInBoard()) return;
        if (interactPlayer.detectInteractMessage(pk.message) || (pk.message = pk.message.trim()) == "") return;
        pk.message = ChatFilter.filterString(pk.message);

        if (gamedata.gameLogic) {
            var uId = -1;
            var username = "";
            for (var i = 0; i < gamedata.gameLogic._players.length; i++) {
                if (gamedata.gameLogic._players[i]._ingame && gamedata.gameLogic._players[i]._chairInServer != null && pk.playerId == gamedata.gameLogic._players[i]._chairInServer) {
                    ChatMgr.playChatEffect(i, pk.message);
                    uId = gamedata.gameLogic._players[i]._info["uID"];
                    username = gamedata.gameLogic._players[i]._info["uName"];
                    break;
                }
            }
            if (uId >= 0) this.addChatRoom(uId, username, pk.message);
        }
    },
    /* endregion listeners */

    /* region senders */
    sendChatRoom: function (message) {
        var pk = new CmdSendChatString();
        pk.putData(message);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendChatUser: function (toId, message) {
        var pk = new CmdSendChatTotal();
        pk.putData(toId, ChatMgr.MSG_USER, message);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendGetOtherInfo: function (uId) {
        var pk = new CmdSendGetOtherRankInfo();
        pk.putData(uId);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    }
    /* endregion senders */
});

ChatMgr._instance = null;
ChatMgr.getInstance = function () {
    if (!ChatMgr._instance)
        ChatMgr._instance = new ChatMgr();
    return ChatMgr._instance;
};
chatMgr = ChatMgr.getInstance();

ChatMgr.MSG_USER = 1;
ChatMgr.MSG_ROOM = 2;
ChatMgr.MSG_SERVER = 3;
ChatMgr.MSG_SYSTEM = 4;
ChatMgr.MESSAGE_MAX_LENGTH = 120;
ChatMgr.DIALOG_MAX_LENGTH = 30;
ChatMgr.MAX_DIALOG_KEEP = 5;

ChatMgr.playChatEffect = function (index, message) {
    var isMine = index === 0;

    if (message.length > ChatMgr.MAX_MESSAGE_DISPLAY_LENGTH)
        message = message.substr(0, ChatMgr.MAX_MESSAGE_DISPLAY_LENGTH) + "...";

    if (message.length > ChatMgr.MAX_MESSAGE_DISPLAY_LENGTH / 2) {
        var count = 20;
        while (count < message.length) {
            if (message[count] == " ") {
                message = message.substr(0, count) + "\n" + message.substr(count + 1);
                break;
            }
            count++;
        }
    }
    var node = new cc.Node();
    sceneMgr.layerGUI.addChild(node);

    var txt = new ccui.Text();
    txt.ignoreContentAdaptWithSize(true);
    txt.setFontName("fonts/robotoLight.ttf");
    txt.setFontSize(16);
    txt.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    txt.setColor(cc.color("#9b5429"));
    txt.setString(message);
    node.addChild(txt, 1);

    var chatBg = new cc.Scale9Sprite("ChatNew/bg" + (isMine? "Mine" : "Opp") + ".png");
    chatBg.setCapInsets(cc.rect(20, 10, 300, 39));
    chatBg.setScale9Enabled(true);
    chatBg.setContentSize(
        txt.getContentSize().width + 2 * ChatMgr.CHAT_PADDING_WIDTH,
        txt.getContentSize().height + 2 * ChatMgr.CHAT_PADDING_HEIGHT
    );
    chatBg.setAnchorPoint(0.5, 0);
    chatBg.setPosition(chatBg.width / 2, 0);
    node.addChild(chatBg, 0);

    var avatarPos = sceneMgr.getMainLayer().getAvatarPosition(index);
    switch (index) {
        case 0: //self
            txt.setAnchorPoint(0, 0);
            txt.setPosition(ChatMgr.CHAT_PADDING_WIDTH, ChatMgr.CHAT_PADDING_HEIGHT);
            avatarPos.y += 20;
            avatarPos.x += 45;
            chatBg.setScaleX(-1);
            chatBg.setPosition(chatBg.width / 2, 0);
            break;
        case 1:
        case 2:
            txt.setAnchorPoint(1, 0);
            txt.setPosition(-ChatMgr.CHAT_PADDING_WIDTH, ChatMgr.CHAT_PADDING_HEIGHT);
            avatarPos.y += 20;
            avatarPos.x -= 45;
            chatBg.setScaleX(-1);
            chatBg.setPosition(-chatBg.width / 2, 0);
            break;
        case 3:
        case 4:
            txt.setAnchorPoint(0, 0);
            txt.setPosition(ChatMgr.CHAT_PADDING_WIDTH, ChatMgr.CHAT_PADDING_HEIGHT);
            avatarPos.y += 20;
            avatarPos.x += 45;
            chatBg.setScaleX(1);
            chatBg.setPosition(chatBg.width / 2, 0);
            break;
    }
    node.setPosition(avatarPos);
    node.setScale(0);
    node.setOpacity(0);
    node.runAction(cc.sequence(
        cc.spawn(
            cc.fadeIn(0.25),
            cc.scaleTo(0.25, 1).easing(cc.easeBackOut())
        ),
        cc.delayTime(2),
        cc.spawn(
            cc.fadeOut(0.25),
            cc.scaleTo(0.25, 0).easing(cc.easeBackIn())
        ),
        cc.removeSelf()
    ));
};
ChatMgr.MAX_MESSAGE_DISPLAY_LENGTH = 40;
ChatMgr.CHAT_PADDING = 5;
ChatMgr.CHAT_PADDING_WIDTH = 20;
ChatMgr.CHAT_PADDING_HEIGHT = 10;