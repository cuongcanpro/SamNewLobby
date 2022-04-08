var RankPersonalInfoCell = cc.TableViewCell.extend({
    ctor: function (isMiniRank) {
        this._super();
        var jsonLayout;
        if (isMiniRank) jsonLayout = ccs.load("RankPersonalInfoInGame.json");
        else jsonLayout = ccs.load("RankPersonalInfo.json");

        this.isMiniRank = isMiniRank;
        this._layout = jsonLayout.node;
        this._layout.setContentSize(cc.winSize.width, this._layout.getContentSize().height);
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.initCell();
    },

    initCell: function () {
        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.bg.ignoreContentAdaptWithSize(!this.isMiniRank);

        this.borderMe = ccui.Helper.seekWidgetByName(this.bg, "borderMe");
        this.txtRank = ccui.Helper.seekWidgetByName(this.bg, "txtRank");
        this.txtName = ccui.Helper.seekWidgetByName(this.bg, "txtName");
        this.txtExp = ccui.Helper.seekWidgetByName(this.bg, "txtExp");
        this.txtWait = ccui.Helper.seekWidgetByName(this.bg, "txtWait");
        this.pInfoRank = ccui.Helper.seekWidgetByName(this.bg, "pInfoRank");

        this.txtRank.ignoreContentAdaptWithSize(true);
        this.txtExp.ignoreContentAdaptWithSize(true);
        this.txtWait.ignoreContentAdaptWithSize(true);

        var bgAvatar = ccui.Helper.seekWidgetByName(this.bg, "bgAvatar");
        bgAvatar.setLocalZOrder(1);
        this.uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.uiAvatar.setScale(2);
        this.uiAvatar.setPosition(bgAvatar.getContentSize().width/2, bgAvatar.getContentSize().height/2);
        bgAvatar.addChild(this.uiAvatar, 0);

        this.defaultFrame = ccui.Helper.seekWidgetByName(bgAvatar, "border");
        this.defaultFrame.setLocalZOrder(1);
        this.avatarFrame = ccui.ImageView();
        this.avatarFrame.setPosition(bgAvatar.getContentSize().width/2, bgAvatar.getContentSize().height/2);
        bgAvatar.addChild(this.avatarFrame, 1);

        this.btnAvatar = ccui.Helper.seekWidgetByName(bgAvatar, "btnAvatar");
        this.btnAvatar.addTouchEventListener(this.onTouchEventHandler, this);

        if (!this.isMiniRank) {
            this.pReward = ccui.Helper.seekWidgetByName(this.pInfoRank, "pReward");
            this.pReward.ignoreContentAdaptWithSize(true);

            this.txtGiftGold = ccui.Helper.seekWidgetByName(this.pReward, "gold");
            this.txtGiftCup = ccui.Helper.seekWidgetByName(this.pReward, "cup");
            this.txtGiftDiamond = ccui.Helper.seekWidgetByName(this.pReward, "diamond");
            this.txtGiftItem = ccui.Helper.seekWidgetByName(this.pReward, "item");
            this.imgGiftItem = ccui.Helper.seekWidgetByName(this.txtGiftItem, "img");

            this.txtGiftGold.ignoreContentAdaptWithSize(true);
            this.txtGiftCup.ignoreContentAdaptWithSize(true);
            this.txtGiftDiamond.ignoreContentAdaptWithSize(true);
            this.txtGiftItem.ignoreContentAdaptWithSize(true);
            this.imgGiftItem.ignoreContentAdaptWithSize(true);

            this.txtGiftCup.defaultPos = this.txtGiftCup.getPosition();
            this.txtGiftGold.defaultPos = this.txtGiftCup.getPosition();
            this.txtGiftDiamond.defaultPos = this.txtGiftCup.getPosition();
            this.txtGiftItem.defaultPos = this.txtGiftCup.getPosition();
        }
    },

    onTouchEventHandler: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_ENDED:
                this.onButtonRelease(sender, sender.getTag());
                fr.crashLytics.logPressButton(this._id + sender.getTag());
                break;
        }
    },

    onButtonRelease: function () {
        if (this.userData.isUser) {
            if (this.userData.userId == userMgr.getUID()){
                userMgr.openUserInfoGUI(userMgr.userInfo, UserInfoTab.TAB_INFROMATION);
            } else {
                var otherInfo = new CmdSendGetOtherRankInfo();
                otherInfo.putData(this.userData.userId);
                GameClient.getInstance().sendPacket(otherInfo);
                otherInfo.clean();
                sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
                sceneMgr.addLoading().timeout(5);
            }
        }
    },

    updateInfo: function (data, size, weekLevel, isTopRank) {
        weekLevel = weekLevel || 0;
        this.userData = data;

        var textureBg = RankPersonalInfoCell.getBgTexture(isTopRank, data.isUser, data.isUser && data.userId === userMgr.getUID(), data.idx);
        var textureReward = RankPersonalInfoCell.getRewardBgTexture(isTopRank, data.idx);
        this.bg.loadTexture("Ranking/" + textureBg, ccui.Widget.LOCAL_TEXTURE);
        if (!this.isMiniRank){
            this.pReward.loadTexture("Ranking/" + textureReward, ccui.Widget.LOCAL_TEXTURE);
            ccui.Helper.doLayout(this.bg);
        }
        this._layout.setPositionY((this.bg.getContentSize().height + RankGUI.PADDING_CELL)/2);

        if (!data.isUser) {
            this.pInfoRank.setVisible(false);
            this.txtWait.setVisible(true);
            this.txtRank.setVisible(true);
            this.txtRank.setString(data.idx + 1 + "+");
            this.txtRank.enableOutline(cc.color("#9483b9"), 1);
            return;
        }

        this.txtWait.setVisible(false);
        this.pInfoRank.setVisible(true);
        this.txtRank.setString(data.idx + 1);
        this.txtRank.setVisible(data.idx > 2);
        this.txtRank.enableOutline((data.userId === userMgr.getUID()) ? cc.color("#9483b9") : cc.color("#6e98b4"), 1);

        this.txtName.setString(data.userName.length > 13 ? data.userName.substr(0, 13) + "..." : data.userName);
        this.txtExp.setString(StringUtility.pointNumber(data.goldWin) + " EXP");
        this.txtExp.setTextColor(data.goldWin == 0 ? cc.color("#FF5B5B") : cc.color("#7DD6FF"));
        this.borderMe.setVisible(!isTopRank && data.userId === userMgr.getUID());
        this.uiAvatar.asyncExecuteWithUrl(data.userId, data.userId == userMgr.getUID() ? userMgr.getAvatar() : data.avatar);
        var avatarFramePath = "";
        if (data.userId == userMgr.getUID())
            avatarFramePath = StorageManager.getInstance().getUserAvatarFramePath();
        else if (StorageManager.getInstance().cacheOtherAvatarId[data.userId] != null)
            avatarFramePath = StorageManager.getAvatarFramePath(StorageManager.getInstance().cacheOtherAvatarId[data.userId]);
        this.avatarFrame.setVisible(avatarFramePath != null && avatarFramePath != "");
        this.avatarFrame.loadTexture(avatarFramePath);
        this.defaultFrame.setVisible(!this.avatarFrame.isVisible());

        if (!this.isMiniRank) {
            if (data.goldWin > 0) {
                var goldGift = RankData.getGiftGold(weekLevel, data.idx);
                var winLoseCup = RankData.getCupWinLose(weekLevel, data.idx, size);
                var diamondGift = RankData.getGiftDiamond(weekLevel, data.idx);
                var itemGift = RankData.getGiftItem(weekLevel, data.idx);

                this.txtGiftGold.setVisible(goldGift > 0);
                this.txtGiftCup.setVisible(winLoseCup !== 0);
                this.txtGiftDiamond.setVisible(diamondGift > 0);
                this.txtGiftItem.setVisible(itemGift && itemGift.path != "");

                this.txtGiftGold.setString("+" + StringUtility.formatNumberSymbol(goldGift));
                var strWinLoseCup = (winLoseCup > 0) ? "+" : "-";
                strWinLoseCup += StringUtility.pointNumber(Math.abs(winLoseCup));
                this.txtGiftCup.setString(strWinLoseCup);
                this.txtGiftDiamond.setString(diamondGift);
                if (itemGift && itemGift.path != "") {
                    this.txtGiftItem.setString(itemGift.text);
                    this.imgGiftItem.loadTexture(itemGift.path);
                    var itemSize = this.imgGiftItem.getContentSize();
                    this.imgGiftItem.setScale(40 / (itemSize.width + itemSize.height));
                }
            }
            else{
                this.txtGiftCup.setVisible(true);
                this.txtGiftCup.setString("-" + StringUtility.pointNumber(RankData.getMinusCupNonePlay(weekLevel)));

                this.txtGiftGold.setVisible(false);
                this.txtGiftDiamond.setVisible(false);
                this.txtGiftItem.setVisible(false);
            }
        }
    }
});

RankPersonalInfoCell.getBgTexture = function(isTopRank, isUser, isMe, idx){
    if (isTopRank){
        if (idx > 2) return "bgTop.png";
        else return "bgTop" + (idx + 1) + ".png";
    }
    else {
        if (!isUser) return "bgRankOther.png";
        if (idx > 2) return isMe ? "bgRankOtherMe.png" : "bgRankOther.png";
        else return "bgRank" + (idx + 1) + ".png"
    }
};

RankPersonalInfoCell.getRewardBgTexture = function(isTopRank, idx){
    if (isTopRank){
        if (idx > 2) return "bgRewardTop.png";
        else return "bgRewardTop" + (idx == 0 ? "1" : "23") + ".png";
    }
    else return "bgGoldWin.png";
};