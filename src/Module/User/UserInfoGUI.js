
var UserInfoPanel = BaseLayer.extend({
    ctor: function() {
        this._super();

        this.bg = null;
        this.btnClose = null;
        this.btnAddFriend = null;
        this.btnRemoveFriend = null;
        this.btnSendMessage = null;
        this.btnPersonalInfo = null;
        this.btnStorage = null;

        this.btnTabInfo = null;
        this.btnTabInteract = null;
        this.tabs = {};
        this.tabButtons = {};

        this.displayName = null;
        this.zName = null;
        this.uID = null;
        this.bean = null;
        this.level = null;
        this.winCount = null;
        this.lostCount = null;
        this.version = null;

        this.defaultFrame = null;
        this.avatarBg = null;
        this.avatar = null;
        this.avatarFrame = null;

        this.pMedal = null;
        this.goldMedal = null;
        this.silverMedal = null;
        this.bronzeMedal = null;
        this.rankNotice = null;

        this.imgRank = null;
        this.txtRank = null;
        this.levelRank = null;

        this.tbInteract = null;
        this.cellSize = null;
        this.itemSize = null;
        this.numRow = null;

        //DATA
        this.selectedTab = -1;
        this.interactData = [];

        this.initWithBinaryFile("Lobby/UserInfoPanel.json");
    },

    /* region Base Flow */
    initGUI: function() {
        //main parts
        this.bg = this.getControl("bg");
        this.bgImage = this.getControl("bgImage", this.bg);
        var pAvatar = this.getControl("pAvatar", this.bg);
        var pUserInfo = this.getControl("pUserInfo", this.bg);
        var tabBg = this.getControl("tabBg", this.bg);

        //buttons
        this.btnClose = this.customButton("btnClose", UserInfoPanel.BTN_ClOSE, this.bg);
        this.customButton("btnCloseOther", UserInfoPanel.BTN_ClOSE);
        this.btnSendMessage = this.customButton("btnChat", UserInfoPanel.BTN_SEND_CHAT, this.bg);
        this.btnAddFriend = this.customButton("btnAddFriend", UserInfoPanel.BTN_ADD_FRIEND, this.bg);
        this.btnRemoveFriend = this.customButton("btnRemoveFriend", UserInfoPanel.BTN_REMOVE_FRIEND, this.bg);
        this.btnPersonalInfo = this.customButton("btnPersonalInfo", UserInfoPanel.BTN_PERSONAL_INFO, this.bg);
        this.btnStorage = this.customButton("btnStorage", UserInfoPanel.BTN_STORAGE, this.bg);
        this.btnChangeAvatar = this.customizeButton("btnChangeAvatar", UserInfoPanel.BTN_CHANGE_AVATAR);
        this.btnChangeAvatar.setLocalZOrder(5);
        this.btnChangeAvatar.setPressedActionEnabled(false);
        this.customizeButton("btnCloseAvatar", UserInfoPanel.BTN_CHANGE_AVATAR);
        this.version = this.getControl("version", this.bg);
        this.version.ignoreContentAdaptWithSize(true);

        //pAvatar
        this.defaultFrame = this.getControl("defaultFrame", pAvatar);
        this.avatarBg = this.getControl("avatarBg", pAvatar);
        this.avatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.avatar.setPosition(this.avatarBg.width/2, this.avatarBg.height/2);
        this.avatar.setScale(3.05);
        this.avatarBg.addChild(this.avatar);
        this.avatarFrame = new cc.Sprite();
        this.avatarFrame.setPosition(this.avatarBg.width/2, this.avatarBg.height/2);
        this.avatarFrame.setScale(1.5);
        this.avatarBg.addChild(this.avatarFrame);

        //pUserInfo
        this.displayName = this.getControl("username", pUserInfo);
        this.displayName.ignoreContentAdaptWithSize(true);
        this.zName = this.getControl("account", pUserInfo);
        this.zName.ignoreContentAdaptWithSize(true);
        this.uID = this.getControl("id", pUserInfo);
        this.uID.ignoreContentAdaptWithSize(true);
        this.bean = this.getControl("bean", pUserInfo);
        this.bean.ignoreContentAdaptWithSize(true);

        //pChooseAvatar
        this.pChooseAvatar = this.getControl("pChooseAvatar");
        this.pChooseAvatar.setScaleY(0);
        this.pChooseAvatar.isOpen = false;

        //tabs
        this.btnTabInfo = this.customButton("btnTabInfo", UserInfoPanel.BTN_TAB_INFO, tabBg);
        this.btnTabInfo.setZoomScale(0);
        this.tabButtons[UserInfoPanel.BTN_TAB_INFO] = this.btnTabInfo;
        this.btnTabInteract = this.customButton("btnTabInteract", UserInfoPanel.BTN_TAB_INTERACT, tabBg);
        this.btnTabInteract.setZoomScale(0);
        this.tabButtons[UserInfoPanel.BTN_TAB_INTERACT] = this.btnTabInteract;
        var tabInfo = this.tabs[UserInfoPanel.BTN_TAB_INFO] = this.getControl("pInfo", tabBg);
        var tabInteract = this.tabs[UserInfoPanel.BTN_TAB_INTERACT] = this.getControl("pInteract", tabBg);

        //info
        this.winCount = this.getControl("win", tabInfo);
        this.winCount.ignoreContentAdaptWithSize(true);
        this.lostCount = this.getControl("lose", tabInfo);
        this.lostCount.ignoreContentAdaptWithSize(true);
        this.level = this.getControl("level", this.getControl("pLevel", tabInfo));
        this.level.ignoreContentAdaptWithSize(true);

        this.imgRank = this.getControl("imgRank", tabInfo);
        this.imgRank.ignoreContentAdaptWithSize(true);
        this.levelRank = this.getControl("level", this.imgRank);
        this.levelRank.ignoreContentAdaptWithSize(true);
        this.txtRank = this.getControl("text", this.imgRank);
        this.txtRank.ignoreContentAdaptWithSize(true);
        this.pMedal = this.getControl("pMedal",tabInfo);
        this.rankNotice = this.getControl("rankNotice", tabInfo);
        this.rankNotice.ignoreContentAdaptWithSize(true);

        this.goldMedal = this.getControl("textGoldMedal", this.pMedal);
        this.goldMedal.ignoreContentAdaptWithSize(true);
        this.silverMedal = this.getControl("textSilverMedal", this.pMedal);
        this.silverMedal.ignoreContentAdaptWithSize(true);
        this.bronzeMedal = this.getControl("textBronzeMedal", this.pMedal);
        this.bronzeMedal.ignoreContentAdaptWithSize(true);

        //interact
        this.initTabInteract();
        var pTable = this.getControl("pTable", tabInteract);
        this.tbInteract = new cc.TableView(this, pTable.getContentSize());
        this.tbInteract.setAnchorPoint(0, 0);
        this.tbInteract.setPosition(0, 0);
        this.tbInteract.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.tbInteract.setVerticalFillOrder(0);
        this.tbInteract.setDelegate(this);
        pTable.addChild(this.tbInteract);

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish: function() {
        this.setShowHideAnimate(this.bg, true);
        this.waitOpenStorage = false;
        this.canUseInteract = true;
        this.pChooseAvatar.setScaleY(0);
        this.pChooseAvatar.setVisible(false);
        this.pChooseAvatar.isOpen = false;
    },

    onButtonRelease: function(button, id) {
        cc.log("PRESS THE BUTTON", button.getName());
        switch (id) {
            case UserInfoPanel.BTN_ClOSE:
                this.onBack();
                break;
            case UserInfoPanel.BTN_ADD_FRIEND:
                chatMgr.addFriend(this._user.uID);
                break;
            case UserInfoPanel.BTN_REMOVE_FRIEND:
                chatMgr.removeFriend(this._user.uID);
                break;
            case UserInfoPanel.BTN_SEND_CHAT:
                chatMgr.doMessageFriend(this._user);
                this.onBack();
                break;
            case UserInfoPanel.BTN_PERSONAL_INFO:
                PersonalInfoGUI.openGUI();
                this.onBack();
                break;
            case UserInfoPanel.BTN_TAB_INFO:
            case UserInfoPanel.BTN_TAB_INTERACT:
                this.selectTab(id);
                break;
            case UserInfoPanel.BTN_STORAGE:
                if(!StorageManager.getInstance().checkEnableItem()){
                    return;
                }
                this.waitOpenStorage = true;

                this.onBack();
                break;
            case UserInfoPanel.BTN_CHANGE_AVATAR:
                cc.log("BTN_CHANGE_AVATAR", this.pChooseAvatar.isOpen);
                this.pChooseAvatar.isOpen = !this.pChooseAvatar.isOpen;

                this.pChooseAvatar.stopAllActions();
                if (this.pChooseAvatar.isOpen) {
                    this.pChooseAvatar.runAction(cc.sequence(
                        cc.show(),
                        cc.scaleTo(0.25, 1).easing(cc.easeBackOut())
                    ));
                } else {
                    this.pChooseAvatar.runAction(cc.sequence(
                        cc.scaleTo(0.25, 1, 0).easing(cc.easeBackIn()),
                        cc.hide()
                    ));
                }
                break;
        }
    },

    onBack: function() {
        this.onClose();
    },

    onCloseDone: function() {
        this._super();
        if (this.waitOpenStorage){
            if (CheckLogic.checkInBoard()) {
                var gui = sceneMgr.openGUI(InboardStorageGUI.className, InboardStorageGUI.GUI_TAG, InboardStorageGUI.GUI_TAG);
                gui.show();
            }
            else StorageManager.getInstance().openStorageScene();
        }
    },
    /* endregion Base Flow */

    /* region Tabs Control */
    selectTab: function(id) {
        if (this.tabs[id] == null) id = UserInfoPanel.BTN_TAB_INFO;
        this.selectedTab = id;

        for (var i in this.tabs){
            this.tabs[i].setVisible(i == this.selectedTab);
            var img = this.getButtonImage(i);
            this.tabButtons[i].loadTextures(img, img, img);
        }
    },

    getButtonImage: function(id) {
        var str = "";
        switch(Number(id)) {
            case UserInfoPanel.BTN_TAB_INFO:
                str = "tabInfo";
                break;
            case UserInfoPanel.BTN_TAB_INTERACT:
                str = "tabInteract";
                break;
        }
        if (id != this.selectedTab)
            str += "Inactive";
        return "Lobby/UserInfoPanel/" + str + ".png";
    },
    /* endregion Tabs Control */

    /* region Tab Interact */
    initTabInteract: function() {
        var tabInteract = this.tabs[UserInfoPanel.BTN_TAB_INTERACT];
        var tbSize = tabInteract.getContentSize();
        this.numRow = UserInfoPanelInteractCell.NUM_ROW;
        this.itemSize = (tbSize.height - (UserInfoPanelInteractCell.PADDING * this.numRow * 2)) / this.numRow;
        this.cellSize = cc.size(UserInfoPanelInteractCell.PADDING * 2 + this.itemSize + UserInfoPanelInteractCell.MARGIN * 2, tbSize.height);
        this.itemSize = UserInfoPanelInteractCell.SIZE;
        this.cellSize = cc.size(225, 125);
    },

    loadInteractData: function() {
        this.interactData = [];
        if (!StorageManager.getInstance().itemConfig) return;
        if (!StorageManager.getInstance().userItemInfo) return;
        var interactConfig = StorageManager.getInstance().itemConfig[StorageManager.TYPE_INTERACTION];
        var interactInfo = StorageManager.getInstance().userItemInfo[StorageManager.TYPE_INTERACTION];
        if (!interactConfig || !interactInfo) return;

        //id, num, condition{type, num}
        var availableInteract = [];
        var outOfNumInteract = [];
        var unavailableInteract = [];
        for (var interactId in interactConfig){
            var config = interactConfig[interactId];
            var info = interactInfo[interactId];
            var interact = {
                id: Number(interactId),
                num: 0,
                cond: null
            };
            if (info == null){
                interact.cond = {};
                if (NewVipManager.getInstance().getRealVipLevel() < config.vip) {
                    interact.cond = {
                        type: StorageManager.VIP_CONDITION,
                        num: config.vip
                    }
                    unavailableInteract.push(interact);
                }
                else if (userMgr.getLevel() < config.level) {
                    interact.cond = {
                        type: StorageManager.LEVEL_CONDITION,
                        num: config.level
                    }
                    unavailableInteract.push(interact);
                }
            }
            else{
                interact.num = info[0].num;
                if (interact.num == 0) outOfNumInteract.push(interact);
                else availableInteract.push(interact);
            }
        }
        this.interactData = [].concat(availableInteract, outOfNumInteract, unavailableInteract);

        if (event.isInEvent(Event.MID_AUTUMN)) {
            var interact = {
                id: 1001,
                num: 1,
                cond: null
            };
            this.interactData.splice(0, 0, interact);
        }
    },

    tableCellAtIndex: function(table, idx) {
        var cell = table.dequeueCell();
        if (!cell) cell = new UserInfoPanelInteractCell(this.itemSize, this.cellSize, this.numRow, this);

        var interacts = [];
        for (var i = idx * this.numRow; i < this.interactData.length && i < (idx + 1) * this.numRow; i++)
            interacts.push(this.interactData[i]);

        cell.setData(interacts);
        return cell;
    },

    tableCellSizeForIndex: function() {
        return this.cellSize;
    },

    numberOfCellsInTableView: function() {
        return Math.ceil(this.interactData.length / this.numRow);
    },

    useInteract: function(index) {
        var interact = this.interactData[index];
        if (interact.id >= 1000) {
            // danh rieng cho EventMgr
            midAutumn.clickSendSam(this._user.uID, this._user.avatar);
            return;
        }
        if (interact.cond){
            var mess = "Đạt @cond để sử dụng tương tác này.";
            var condStr = "";
            switch(interact.cond.type){
                case StorageManager.VIP_CONDITION:
                    condStr = "vip";
                    break;
                case StorageManager.LEVEL_CONDITION:
                    condStr = "level";
                    break;
            }
            mess = mess.replace("@cond", condStr + " " + interact.cond.num);
            Toast.makeToast(Toast.SHORT, mess);
        }
        else{
            if (interact.num != 0){
                if (this.canUseInteract) {
                    if (this._user.uID != userMgr.getUID() && CheckLogic.checkInBoard()) {
                        var nChair = null;
                        for (var i = 0; i < gamedata.gameLogic._players.length; i++) {
                            if ((gamedata.gameLogic._players[i]._info != null) && (this._user.uID == gamedata.gameLogic._players[i]._info["uID"])) {
                                nChair = gamedata.gameLogic._players[i]._chairInServer;
                                break;
                            }
                        }
                        if (nChair != null) {
                            StorageManager.getInstance().sendUseInteract(nChair, interact.id);
                        }
                    }
                    this.canUseInteract = false;
                    this.onBack();
                }
            }
            else{
                Toast.makeToast(Toast.SHORT, "Đã hết số lần sử dụng tương tác này.");
            }
        }
    },
    /* endregion Tab Interact */

    /* region Tab Info */
    setInfo: function(inf) {
        cc.log("SET USER INFO", JSON.stringify(inf));
        this._user = inf;
        if (!this._user.zName)
            this._user.zName = this._user.displayName;
        if (!this._user.uID)
            this._user.uID = this._user.uId;

        try{
            this.avatar.asyncExecuteWithUrl(this._user.uID, this._user.avatar);
            this.displayName.setString(this._user.displayName);
            this.zName.setString(this._user.zName);
            this.uID.setString(this._user.uID);
            this.bean.setString(StringUtility.pointNumber(this._user.bean) + "$");

            this.winCount.setString(StringUtility.pointNumber(this._user.winCount));
            this.lostCount.setString(StringUtility.pointNumber(this._user.lostCount));

            this.tabs[UserInfoPanel.BTN_TAB_INFO].setVisible(true);
            var avatarFramePath = null;
            if (this._user.uID == userMgr.getUID()) {
                cc.log("MY INFO");
                this.bgImage.setAnchorPoint(cc.p(0.5, 0.5));
                this.level.setString(levelMgr.getLevelString(this._user.level, this._user.levelExp));
                this.btnAddFriend.setVisible(false);
                this.btnRemoveFriend.setVisible(false);
                this.btnSendMessage.setVisible(false);
                this.btnPersonalInfo.setVisible(true);
                this.btnStorage.setVisible(true);
                this.tabs[UserInfoPanel.BTN_TAB_INTERACT].setVisible(false);
                this.btnClose.setVisible(true);
                avatarFramePath = StorageManager.getInstance().getUserAvatarFramePath()
            } else {
                cc.log("OTHERS INFO");
                this.bgImage.setAnchorPoint(cc.p(0.69, 0.5));
                this.level.setString(this._user.level);
                var isFriend = chatMgr.checkIsFriend(this._user.uID);
                this.btnAddFriend.setVisible(!isFriend);
                this.btnRemoveFriend.setVisible(isFriend);
                var scene = sceneMgr.getMainLayer();
                this.btnSendMessage.setVisible(scene instanceof ChatScene || CheckLogic.checkInBoard());
                this.btnPersonalInfo.setVisible(false);
                this.btnStorage.setVisible(false);
                this.tabs[UserInfoPanel.BTN_TAB_INTERACT].setVisible(true);
                this.btnClose.setVisible(false);

                if (StorageManager.getInstance().cacheOtherAvatarId[this._user.uID] != null)
                    avatarFramePath = StorageManager.getAvatarFramePath(StorageManager.getInstance().cacheOtherAvatarId[this._user.uID]);
                else
                    avatarFramePath = ""
            }
            this.bgImage.setPosition(cc.p(0, 0));

            if (avatarFramePath == null || avatarFramePath == ""){
                this.avatarFrame.setTexture(null);
                this.avatarFrame.setVisible(false);
                this.defaultFrame.setVisible(true);
            } else{
                this.avatarFrame.setTexture(avatarFramePath);
                this.avatarFrame.setVisible(true);
                this.defaultFrame.setVisible(false);
            }
        }
        catch(e) { cc.log(e); }

        try {
            this.setInfoRank();
        } catch(e) { cc.error(e); }

        try {
            this.version.setString(NativeBridge.getVersionString());
        } catch(e) {}

        //load interact data
        this.loadInteractData();
        this.btnTabInteract.setVisible(this._user.uID != userMgr.getUID());
        this.tbInteract.reloadData();
        //this.selectTab(this._user.uID == gamedata.userData.uID ? UserInfoPanel.BTN_TAB_INFO : UserInfoPanel.BTN_TAB_INTERACT);
    },

    setInfoRank: function() {
        var canJoinRank = this._user.level >= NewRankData.MIN_LEVEL_JOIN_RANK && !Config.ENABLE_TESTING_NEW_RANK && Config.ENABLE_NEW_RANK;
        this.rankNotice.setVisible(!canJoinRank);
        this.txtRank.setVisible(canJoinRank);
        this.pMedal.setVisible(canJoinRank);
        this.imgRank.setColor((canJoinRank) ? cc.color("#ffffff") : cc.color("#000000"));
        var conditionKey = (this._user.uID === userMgr.getUID()) ? "NEW_RANK_MY_CONDITION" : "NEW_RANK_OTHER_CONDITION";
        if (Config.ENABLE_TESTING_NEW_RANK || !Config.ENABLE_NEW_RANK) conditionKey = "NEW_RANK_COMING_SOON";
        var conditionStr = StringUtility.replaceAll(localized(conditionKey), "@number", NewRankData.MIN_LEVEL_JOIN_RANK);
        this.rankNotice.setString(conditionStr);
        StringUtility.breakLabelToMultiLine(this.rankNotice, this.rankNotice.getParent().width - 80);
        if (!canJoinRank) {
            return;
        }

        var goldMedal = this._user.goldMedal;
        var silverMedal = this._user.silverMedal;
        var bronzeMedal = this._user.bronzeMedal;
        var rank = this._user.rank;
        if (this._user.uID === userMgr.getUID()) {
            goldMedal = NewRankData.getInstance().getNumberGoldMedal();
            silverMedal = NewRankData.getInstance().getNumberSilverMedal() || 0;
            bronzeMedal = NewRankData.getInstance().getNumberBronzeMedal() || 0;
            rank = NewRankData.getInstance().getCurRankInfo()["rank"] || 0;
        }
        this.goldMedal.setString(StringUtility.pointNumber(goldMedal));
        this.silverMedal.setString(StringUtility.pointNumber(silverMedal));
        this.bronzeMedal.setString(StringUtility.pointNumber(bronzeMedal));
        this.txtRank.setString(NewRankData.getRankName(rank).toUpperCase());
        this.imgRank.loadTexture(NewRankData.getRankImg(rank), ccui.Widget.PLIST_TEXTURE);
        this.levelRank.loadTexture(NewRankData.getRankLevelImg(rank), ccui.Widget.PLIST_TEXTURE);
        this.levelRank.setVisible(rank < NewRankData.MAX_RANK);

        var oldAnim = this.imgRank.getChildByTag(50);
        if (oldAnim) {
            oldAnim.removeFromParent(true);
        }
        var animRank = db.DBCCFactory.getInstance().buildArmatureNode("Rank");
        if (animRank) {
            this.imgRank.addChild(animRank, 50, 50);
            var imgRankSize = this.imgRank.getContentSize();
            animRank.setPosition(imgRankSize.width / 2, imgRankSize.height / 2);
            var indexLevel = Math.floor(rank / 3) + 1;
            animRank.gotoAndPlay(indexLevel, 0, -1, 9999);
        }
    }
    /* endregion Tab Info */
});

UserInfoPanel.className = "UserInfoPanel";
UserInfoPanel.BTN_ClOSE = 0;
UserInfoPanel.BTN_ADD_FRIEND = 1;
UserInfoPanel.BTN_REMOVE_FRIEND = 2;
UserInfoPanel.BTN_SEND_CHAT = 3;
UserInfoPanel.BTN_PERSONAL_INFO = 4;
UserInfoPanel.BTN_STORAGE = 5;
UserInfoPanel.BTN_TAB_INFO = 6;
UserInfoPanel.BTN_TAB_INTERACT = 7;
UserInfoPanel.BTN_CHANGE_AVATAR = 8;

var UserInfoPanelInteractCell = cc.TableViewCell.extend({
    ctor: function(itemSize, cellSize, numRow, userInfoPanel) {
        this._super();
        this.itemSize = itemSize;
        this.cellSize = cellSize;
        this.numRow = numRow;
        this.userInfoPanel = userInfoPanel;

        this.initGUI();
    },

    initGUI: function() {
        this._layout = new cc.Layer(this.cellSize.width, this.cellSize.height);
        this.addChild(this._layout);

        for (var i = 0; i < this.numRow; i++){
            var itemNode = ccs.load("Lobby/InteractItemCell.json").node;
            itemNode.setPosition(
                this.cellSize.width - (i + 1) * this.itemSize - (2 * i + 1) * UserInfoPanelInteractCell.PADDING,
                UserInfoPanelInteractCell.PADDING + UserInfoPanelInteractCell.MARGIN
            );
            itemNode.setScale(this.itemSize / UserInfoPanelInteractCell.SIZE);
            this._layout.addChild(itemNode, 0, i);
            itemNode.img = itemNode.getChildByName("img");
            itemNode.shadow = itemNode.getChildByName("shadow");
            itemNode.num = itemNode.getChildByName("num");
            itemNode.img.ignoreContentAdaptWithSize(true);
            itemNode.shadow.ignoreContentAdaptWithSize(true);
            itemNode.num.ignoreContentAdaptWithSize(true);
            itemNode.bg = itemNode.getChildByName("bg");
            itemNode.bg.setTouchEnabled(true);
            itemNode.bg.setSwallowTouches(false);
            itemNode.bg.addTouchEventListener(function(target, type){
                switch(type){
                    case ccui.Widget.TOUCH_BEGAN:
                        target.isWaitingTouch = true;
                        break;
                    case ccui.Widget.TOUCH_MOVED:
                        if (target.isWaitingTouch) {
                            var touchBeganPos = target.getTouchBeganPosition();
                            var touchMovePos = target.getTouchMovePosition();
                            if (Math.sqrt(Math.pow(touchMovePos.x - touchBeganPos.x, 2) + Math.pow(touchMovePos.y - touchBeganPos.y, 2)) > 2)
                                target.isWaitingTouch = false;
                        }
                        break;
                    case ccui.Widget.TOUCH_ENDED:
                        if (target.isWaitingTouch){
                            this.userInfoPanel.useInteract(this.getIdx() * 2 + target.getParent().getTag());
                            this.userInfoPanel.playSoundButton(-1);
                        }
                        break;
                    case ccui.Widget.TOUCH_CANCELED:
                        break;
                }
            }.bind(this), this);

            itemNode.iconLock = itemNode.getChildByName("iconLock");
            itemNode.textLock = itemNode.iconLock.getChildByName("text");
            itemNode.textLock.ignoreContentAdaptWithSize(true);
        }
    },

    setData: function(interacts) {
        for (var i = 0; i < this.numRow; i++){
            var itemNode = this._layout.getChildByTag(i);
            if (i >= interacts.length) itemNode.setVisible(false);
            else{
                var interact = interacts[i];
                itemNode.setVisible(true);
                if (interact.id < 1000) {
                    var path = StorageManager.getItemIconPath(StorageManager.TYPE_INTERACTION, null, interact.id);
                    var scale = 0.8;
                    //itemNode.bg.loadTexture("Lobby/UserInfoPanel/itemBg.png");
                    if (path && path != ""){
                        itemNode.img.setVisible(true);
                        itemNode.shadow.setVisible(true);
                        itemNode.img.loadTexture(path);
                        itemNode.shadow.loadTexture(path);
                        itemNode.img.setScale(scale);
                        itemNode.shadow.setScale(scale);
                    }
                    else{
                        itemNode.img.setVisible(false);
                        itemNode.shadow.setVisible(false);
                    }

                    if (!interact.cond){
                        itemNode.num.setVisible(true);
                        itemNode.iconLock.setVisible(false);
                        this.setNum(itemNode, interact.num);
                    }
                    else{
                        itemNode.num.setVisible(false);
                        itemNode.iconLock.setVisible(true);
                        this.setTextLock(itemNode, interact.cond);
                        //itemNode.bg.loadTexture("Lobby/UserInfoPanel/itemBgGray.png");
                        itemNode.img.getVirtualRenderer().setState(1);
                    }
                }
                else {
                    // danh cho su kien EventMgr
                    itemNode.img.setVisible(false);
                    //itemNode.bg.loadTexture("res/EventMgr/MidAutumn/MidAutumnUI/btnActionSendSam.png");
                    itemNode.shadow.setVisible(false);
                    itemNode.num.setVisible(false);
                    itemNode.iconLock.setVisible(false);
                }
            }
        }
    },

    setTextLock: function(node, cond) {
        var str = "";
        switch(cond.type){
            case StorageManager.VIP_CONDITION:
                str = "Vip";
                break;
            case StorageManager.LEVEL_CONDITION:
                str = "Level";
                break;
        }
        str += (" " + cond.num);
        node.textLock.setString(str);
        node.iconLock.setPositionX(node.width - (node.textLock.x + node.textLock.getAutoRenderSize().width) * node.iconLock.getScale());
    },

    setNum: function(node, num) {
        node.num.setString(num >= 0 ? num : '\u221e');
        node.num.setTextColor(num != 0 ? cc.color("#ffffff") : cc.color("#ff5b5b"));
        node.num.enableOutline(num != 0 ? cc.color("#4c3093") : cc.color("#6a2035"));
        node.img.getVirtualRenderer().setState(num > 0 ? 0 : 1);
        //node.bg.loadTexture(num != 0 ? "Lobby/UserInfoPanel/itemBg.png" : "Lobby/UserInfoPanel/itemBgGray.png")
    }
});
UserInfoPanelInteractCell.PADDING = 0;
UserInfoPanelInteractCell.NUM_ROW = 2;
UserInfoPanelInteractCell.SIZE = 113;
UserInfoPanelInteractCell.MARGIN = 0;
