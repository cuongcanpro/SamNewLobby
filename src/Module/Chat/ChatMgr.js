/**
 * Created by HunterPC on 3/2/2016.
 */

var ChatMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.chatTotal = [];
        this.chatRoom = {notify: false, dialog: []};
        this.chatUsers = {};
        this.userTrack = [];    //keep track of dialog order
    },

    /* region data */
    resetData: function(){
        this.chatTotal = [];
        this.chatRoom = {notify: false, dialog: []};
        this.chatUsers = {};
        this.userTrack = [];
    },

    onJoinRoom: function(){
        this.chatRoom = {notify: false, dialog: []};
        var gui = sceneMgr.getGUIByClassName(ChatPanelGUI.className);
        if (gui) gui.onUpdateGUI();
    },

    addTabUser: function(id, userName){
        if (this.userTrack.length >= ChatMgr.MAX_DIALOG_KEEP)
            this.removeTabUser(this.userTrack[this.userTrack.length - 1]);
        this.chatUsers[id] = {userName: userName, dialog: [], notify: false};
        this.userTrack.unshift(id);

        var gui = sceneMgr.getGUIByClassName(ChatPanelGUI.className);
        if (gui) gui.updateTabList();
    },

    removeTabUser: function(id){
        if (id in this.chatUsers){
            delete this.chatUsers[id];
            this.userTrack.splice(this.userTrack.indexOf(id), 1)
            var gui = sceneMgr.getGUIByClassName(ChatPanelGUI.className);
            if (gui) gui.updateTabList();
        }
    },

    addChatUser: function(sender, toId, message){
        if (sender.uId == 0) {
            this.addChatTotal(sender, message);
            return;
        }

        var chatId = (sender.uId == userMgr.getUID()) ? toId : sender.uId;
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

        if (sceneMgr.checkInBoard() && inGameMgr.gameLogic){
            for (var i = 0; i < inGameMgr.gameLogic._players.length; i++){
                if (inGameMgr.gameLogic._players[i]._ingame && inGameMgr.gameLogic._players[i]._info != null && sender.uId == inGameMgr.gameLogic._players[i]._info["uID"]) {
                    var mess = LocalizedString.to("CHAT_PRIVATE");
                    mess = StringUtility.replaceAll(mess, "@user", toId == userMgr.getUID() ? LocalizedString.to("BAN").toLowerCase() : this.chatUsers[chatId].userName);
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

    addChatRoom: function(uId, username, message){
        if (this.chatRoom.dialog.length >= ChatMgr.DIALOG_MAX_LENGTH)
            this.chatRoom.dialog.splice(0, 5);
        this.chatRoom.dialog.push({
            uId: uId, userName: username, message: message
        });
        this.onNotify(0, true);

        var gui = sceneMgr.getGUIByClassName(ChatPanelGUI.className);
        if (gui) gui.onReceiveChat(0);
    },

    addChatTotal: function(sender, message){
        if (this.chatTotal.length >= ChatMgr.DIALOG_MAX_LENGTH)
            this.chatTotal.splice(0, 5);
        this.chatTotal.push({
            uId: sender.uId, userName: sender.uName, message: message
        });
    },

    onNotify: function(id, notify){
        if (id == 0) this.chatRoom.notify = notify;
        else this.chatUsers[id].notify = notify;

        var gui = sceneMgr.getGUIByClassName(ChatPanelGUI.className);
        if (gui) gui.onNotify(id, notify);
    },

    isNotify: function(){
        if (this.chatRoom.notify) return true;
        for (var id in this.chatUsers)
            if (this.chatUsers[id].notify) return true;
        return false;
    },
    /* endregion data */

    /* region GUI controllers */
    openChatGUI: function(){
        sceneMgr.openGUI(ChatPanelGUI.className, ChatPanelGUI.TAG, ChatPanelGUI.TAG);
    },

    openChatGUIAtTab: function(id, name){
        if (!(id in this.chatUsers))
            this.addTabUser(id, name);
        var gui = sceneMgr.openGUI(ChatPanelGUI.className, ChatPanelGUI.TAG, ChatPanelGUI.TAG);
        gui.selectTabById(id);
    },
    /* endregion GUI controllers */

    /* region listeners */
    onReceived: function(cmd, data) {
        var isReceive = false;
        switch(cmd){
            case CMD.CMD_CHAT_TOTAL:
                var pk = new CmdReceiveChatTong(data);
                pk.clean();
                this.onReceiveChatTotal(pk);
                isReceive = true;
                break;
            case CMD.CMD_SYSTEM_CHAT:
                var pk = new CmdReceiveSystemNotify(data);
                pk.clean();
                this.onReceiveChatSystem(pk);
                isReceive = true;
                break;
            case CMD.CMD_SEND_MESSAGE:
                var pk = new CmdReceiveMessage(data);
                pk.clean();
                this.onReceiveChatRoom(pk);
                isReceive = true;
                break;
            default:
                return;
        }
        if (isReceive)
            cc.log("Chat Receive: ", cmd);
        return isReceive;
    },

    onReceiveChatTotal: function(pk){
        if (pk.response){
            if (this.chatUsers[pk.toID]) {
                var error = pk.getError();
                if (error != 0) {
                    var message;
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
                    this.addChatUser({uId: pk.toID, uName: ""}, userMgr.getUID(), message);
                    return;
                }
            }
        }

        switch(pk.msgType){
            case ChatMgr.MSG_SERVER:
                if ((pk.content = pk.content.trim()) == "") return;
                this.addChatTotal(pk.sender, pk.content);
                break;
            case ChatMgr.MSG_USER:
                if (pk.sender != null){
                    if ((pk.content = pk.content.trim()) == "") return;
                    if (pk.sender.uId != userMgr.getUID() && pk.toID != userMgr.getUID()) return;
                    this.addChatUser(pk.sender, pk.toID, pk.content);
                }
                break;
            case ChatMgr.MSG_SYSTEM:
                if (pk.sender != null){
                    if (pk.sender.uId == userMgr.getUID() || pk.toID != userMgr.getUID()) return;
                    var message = StringUtility.replaceAll(LocalizedString.to("CHAT_NOTE2"), "@name", pk.sender.uName);
                    this.addChatUser(pk.sender, pk.toID, message);
                }
                break;
        }
    },

    onReceiveChatSystem: function(pk){
        //cam chat
        var mess ="";
        if(pk.reason.localeCompare(LocalizedString.to("CHAT_NOTE6")) === 0)
            mess = pk.reason;
        else{
            if (pk.exprired < 0) {
                mess = LocalizedString.to("CHAT_NOTE5");
            }
            else if (pk.exprired > 0)
            {
                mess = LocalizedString.to("CHAT_NOTE4");
                mess = StringUtility.replaceAll(mess, "@gio", pk.hour);
                mess = StringUtility.replaceAll(mess, "@ngay", pk.exprired);
            }
            mess = StringUtility.replaceAll(mess, "@reason", pk.reason);
            mess = StringUtility.replaceAll(mess, "@name", pk.response ? LocalizedString.to("BAN") : pk.name);
        }
        Toast.makeToast(Toast.LONG, mess);
    },

    onReceiveChatRoom: function(pk){
        if (!sceneMgr.checkInBoard()) return;
        if (interactPlayer.detectInteractMessage(pk.message) || (pk.message = pk.message.trim()) == "") return;
        pk.message = ChatFilter.filterString(pk.message);
        if (inGameMgr.gameLogic){
            var uId = -1;
            var username = "";
            for (var i = 0; i < inGameMgr.gameLogic._players.length; i++){
                if (inGameMgr.gameLogic._players[i]._ingame && inGameMgr.gameLogic._players[i]._chairInServer != null && pk.playerId == inGameMgr.gameLogic._players[i]._chairInServer) {
                    ChatMgr.playChatEffect(i, pk.message);
                    uId = inGameMgr.gameLogic._players[i]._info["uID"];
                    username = inGameMgr.gameLogic._players[i]._info["uName"];
                    break;
                }
            }
            if (uId >= 0) this.addChatRoom(uId, username, pk.message);
        }
    },
    /* endregion listeners */

    /* region senders */
    sendChatRoom: function(message){
        var pk = new CmdSendChatString();
        pk.putData(message);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendChatUser: function(toId, message){
        var pk = new CmdSendChatTotal();
        pk.putData(toId, ChatMgr.MSG_USER, message);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sendGetOtherInfo: function(uId){
        var pk = new CmdSendGetOtherRankInfo();
        pk.putData(uId);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    }
    /* endregion senders */
});

ChatMgr._instance = null;
ChatMgr.getInstance = function(){
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

ChatMgr.playChatEffect = function(index, message){
    var _scale = Math.min(cc.winSize.width / Constant.WIDTH, 1);

    if (message.length > ChatMgr.MAX_MESSAGE_DISPLAY_LENGTH)
        message = message.substr(0, ChatMgr.MAX_MESSAGE_DISPLAY_LENGTH) + "...";

    if (message.length > ChatMgr.MAX_MESSAGE_DISPLAY_LENGTH/2){
        var count = 20;
        while(count < message.length){
            if (message[count] == " "){
                message = message.substr(0, count) + "\n" + message.substr(count + 1);
                break;
            }
            count++;
        }
    }

    var txt = new ccui.Text();
    txt.ignoreContentAdaptWithSize(true);
    txt.setAnchorPoint(0, 0);
    txt.setPosition(ChatMgr.CHAT_PADDING, ChatMgr.CHAT_PADDING);
    txt.setFontName("fonts/tahoma.ttf");
    txt.setFontSize(24);
    txt.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    txt.setColor(cc.color.WHITE);
    txt.setString(message);

    var chatBg = new cc.Scale9Sprite("ChatNew/bgChat.png");
    chatBg.setContentSize(txt.getContentSize().width + 2 * ChatMgr.CHAT_PADDING, txt.getContentSize().height + 2 * ChatMgr.CHAT_PADDING);
    chatBg.addChild(txt);

    var node = new cc.Node();
    var arrow = new cc.Sprite("ChatNew/arrow.png");
    arrow.setScale(0.5);
    node.addChild(arrow);
    node.addChild(chatBg);
    sceneMgr.layerGUI.addChild(node);

    var avatarPos = sceneMgr.getMainLayer().getAvatarPosition(index);
    switch(index){
        case 0: //self
            arrow.setPosition(0, arrow.getContentSize().height * arrow.getScale()/2);
            chatBg.setAnchorPoint(0, 0);
            chatBg.setPosition(-Math.min(chatBg.getContentSize().width/2, 15), arrow.getContentSize().height * arrow.getScale());
            node.setPosition(avatarPos.x, avatarPos.y + 65 * _scale);
            break;
        case 3:
            arrow.setRotation(-90);
            arrow.setPosition(-arrow.getContentSize().height * arrow.getScale()/2, 0);
            chatBg.setAnchorPoint(1, 0.5);
            chatBg.setPosition(-arrow.getContentSize().height * arrow.getScale(), 0);
            node.setPosition(avatarPos.x - 65 * _scale, avatarPos.y);
            break;
        case 2:
            arrow.setRotation(180);
            arrow.setPosition(0, -arrow.getContentSize().height * arrow.getScale()/2);
            chatBg.setAnchorPoint(1, 1);
            chatBg.setPosition(Math.min(chatBg.getContentSize().width/2, 15), -arrow.getContentSize().height * arrow.getScale());
            node.setPosition(avatarPos.x, avatarPos.y - 65 * _scale);
            break;
        case 1:
            arrow.setRotation(90);
            arrow.setPosition(arrow.getContentSize().height * arrow.getScale()/2, 0);
            chatBg.setAnchorPoint(0, 0.5);
            chatBg.setPosition(arrow.getContentSize().height * arrow.getScale(), 0);
            node.setPosition(avatarPos.x + 65 * _scale, avatarPos.y);
            break;
    }

    node.setScale(0);
    node.setOpacity(0);
    node.runAction(cc.sequence(
        cc.spawn(
            cc.fadeIn(0.25),
            cc.scaleTo(0.25, _scale).easing(cc.easeBackOut())
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
ChatMgr.CHAT_PADDING = 8;

ChatMgr.instance = null;
ChatMgr.getInstance = function () {
    if (!ChatMgr.instance) {
        ChatMgr.instance = new ChatMgr();
    }
    return ChatMgr.instance;
};
var chatMgr = ChatMgr.getInstance();