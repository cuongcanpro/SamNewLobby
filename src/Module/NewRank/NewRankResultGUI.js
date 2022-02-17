var NewRankResultGUI = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("NewRankLastWeekResult.json");
        this.typeMedal = -1;
    },

    initGUI: function () {
        this.bg = this.getControl("bg");

        //pWin
        this.pWin = this.getControl("pWin", this.bg);
        this.titleWin = this.getControl("titleWin", this.pWin);
        var txtWin = this.getControl("txtWin", this.pWin);
        this.txtWin = new RichLabelText();
        this.txtWin.setPosition(txtWin.getPosition());
        txtWin.setVisible(false);
        txtWin.getParent().addChild(this.txtWin);

        var infoWin = this.pWin.getChildByName("infoWin");
        infoWin.setVisible(false);
        this.infoWin = new NewRankPersonalInfoCell(true);
        infoWin.getParent().addChild(this.infoWin);
        this.infoWin.setPosition(infoWin.getPosition());

        this.imgMedal = this.getControl("imgMedal", this.pWin);
        this.medal = this.getControl("medal", this.imgMedal);
        this.txtMedal = this.getControl("txtMedal", this.imgMedal);
        this.imgCup = this.getControl("imgCup", this.pWin);
        this.iconCupWin = this.getControl("iconCupWin", this.imgCup);
        this.txtCup = this.getControl("txtCup", this.imgCup);
        this.imgGold = this.getControl("imgGold", this.pWin);
        this.txtGoldWin = this.getControl("txtGoldWin", this.pWin);
        this.imgDiamond = this.getControl("imgDiamond", this.pWin);
        this.txtDiamond = this.getControl("txtDiamond", this.pWin);
        this.imgItem = this.getControl("imgItem", this.pWin);
        this.imgItem.img = this.getControl("img", this.imgItem);
        this.imgItem.txt = this.getControl("txtItem", this.imgItem);

        this.txtMedal.ignoreContentAdaptWithSize(true);
        this.txtCup.ignoreContentAdaptWithSize(true);
        this.txtGoldWin.ignoreContentAdaptWithSize(true);
        this.txtDiamond.ignoreContentAdaptWithSize(true);
        this.imgItem.img.ignoreContentAdaptWithSize(true);
        this.imgItem.txt.ignoreContentAdaptWithSize(true);

        this.rewardMinDistance = (this.imgItem.getPositionX() - this.imgMedal.getPositionX()) / 4;
        this.rewardMaxDistance = this.imgMedal.getContentSize().width;

        this.customButton("btnReceive", NewRankResultGUI.BTN_RECEIVE_NOW);

        //pLose
        this.pNoWin = this.getControl("pNoWin", this.bg);
        var txtInfo = this.getControl("txtInfo", this.pNoWin);
        this.txtInfo = new RichLabelText();
        this.txtInfo.setPosition(txtInfo.getPosition());
        txtInfo.setVisible(false);
        txtInfo.getParent().addChild(this.txtInfo);
        this.txtInfo2 = txtInfo;
        this.txtInfo2.ignoreContentAdaptWithSize(true);
        this.txtInfo2.setAnchorPoint(0.5, 0);
        this.txtInfo2.setPositionX(this.pNoWin.getContentSize().width/2);

        var infoNoWin = this.pNoWin.getChildByName("infoNoWin");
        infoNoWin.setVisible(false);
        this.infoNoWin = new NewRankPersonalInfoCell(true);
        infoNoWin.getParent().addChild(this.infoNoWin);
        this.infoNoWin.setPosition(infoNoWin.getPosition());

        this.txtLose = this.getControl("txtLose", this.pNoWin);
        this.imgNoLose0 = this.getControl("imgNoLose0", this.pNoWin);
        this.imgNoLose1 = this.getControl("imgNoLose1", this.pNoWin);
        this.txtLoseCup = this.getControl("txtLoseCup", this.pNoWin);
        this.txtLoseCup.ignoreContentAdaptWithSize(true);
        this.iconCup = this.getControl("iconCup", this.txtLoseCup);
        this.imgTruCup = this.getControl("imgTruCup", this.pNoWin);
        this.imgNoWin = this.getControl("imgBgNoWin", this.pNoWin);
        this.titleNoWin = this.getControl("titleNoWin", this.pNoWin);
        this.btnUnderstood = this.customButton("btnUnderstood", NewRankResultGUI.BTN_UNDER_STOOD);
    },

    updateResult: function (dataLastWeek) {
        this.isTypeTruCup = false;
        var numberCup = dataLastWeek["cup"];
        var goldGift = dataLastWeek["goldGift"];
        var packId = dataLastWeek.packId;
        var diamond = NewRankData.getDiamondByPackId(packId);
        var item = NewRankData.getItemByPackId(packId);

        var isWin = numberCup > 0;
        this.pWin.setVisible(isWin);
        this.pNoWin.setVisible(!this.pWin.isVisible());

        this.updateMyInfo(dataLastWeek);

        var strLoseCup = StringUtility.replaceAll(localized("NEW_RANK_RECEIVE_GIFT_TXT_LOSE_CUP"),
            "@number", StringUtility.pointNumber(Math.abs(numberCup)));
        this.txtLoseCup.setString(strLoseCup);
        this.txtLoseCup.getChildByName("iconCup").setPositionX(this.txtLoseCup.getContentSize().width + 13);

        var txts = [];
        var strRank = StringUtility.replaceAll(localized("NEW_RANK_RECEIVE_GIFT_RANK"), "@rank", dataLastWeek["rankIdx"] + 1);
        txts.push({
            "text": localized("NEW_RANK_RECEIVE_GIFT_TXT_0"),
            "color": cc.color("#ffffff"),
            "size": 16,
            "font": SceneMgr.FONT_BOLD
        });
        txts.push({"text": strRank, "color": cc.color("#FFF577"), "size": 16, "font": SceneMgr.FONT_BOLD});
        txts.push({
            "text": localized("NEW_RANK_RECEIVE_GIFT_TXT_1"),
            "color": cc.color("#ffffff"),
            "size": 16,
            "font": SceneMgr.FONT_BOLD
        });
        this.txtWin.setText(txts);
        if (dataLastWeek.goldWinLastWeek > 0) {
            this.txtInfo.setVisible(true);
            this.txtInfo2.setVisible(false);
            this.txtInfo.setText(txts);
        }
        else{
            this.txtInfo.setVisible(false);
            this.txtInfo2.setVisible(true);
            this.txtInfo2.setString(localized("NEW_RANK_NOT_PLAY_LAST_WEEK"));
        }

        if (isWin) {
            this.updateMedal(dataLastWeek);
            this.imgCup.setVisible(numberCup !== 0);
            this.txtCup.setString("Cúp x" + StringUtility.pointNumber(numberCup));
            this.imgGold.setVisible(goldGift != 0);
            this.txtGoldWin.setString(StringUtility.pointNumber(goldGift) + " Gold");
            this.imgDiamond.setVisible(diamond != 0);
            this.txtDiamond.setString(StringUtility.pointNumber(diamond) + " Kim cương");
            if (item && item.path != ""){
                this.imgItem.setVisible(true);
                this.imgItem.img.loadTexture(item.path);
                this.imgItem.img.setScale(item.scale);
                this.imgItem.txt.setString(item.text);
            }
            else this.imgItem.setVisible(false);

            this.updatePositionGiftWin();
        } else {
            var isLose = dataLastWeek["cup"] < 0;
            this.txtLoseCup.setVisible(isLose);
            this.imgNoLose1.setVisible(!isLose);
            this.imgNoLose0.setVisible(!isLose);
            this.typeMedal = -1;
            this.titleNoWin.setVisible(true);
            this.infoNoWin.setVisible(true);
            this.imgTruCup.setVisible(false);
            this.btnUnderstood.setPosition(this.btnUnderstood.defaultPos);
            this.txtLoseCup.setPosition(this.txtLoseCup.defaultPos);
            this.txtInfo.setVisible(true);
        }

        this.dataLastWeek = dataLastWeek;
    },

    updateMyInfo: function (dataLastWeek) {
        var dataRankLastWeek = {};
        dataRankLastWeek.userId = userMgr.getUID();
        dataRankLastWeek.userName = userMgr.getUserName();
        dataRankLastWeek.avatar = userMgr.getAvatar();
        dataRankLastWeek.goldWin = dataLastWeek["goldWinLastWeek"];
        dataRankLastWeek.idx = dataLastWeek["rankIdx"];
        dataRankLastWeek.isUser = true;
        this.infoWin.updateInfo(dataRankLastWeek);
        this.infoWin._layout.setPositionY(0);
        this.infoNoWin.updateInfo(dataRankLastWeek);
        this.infoNoWin._layout.setPositionY(0);
        this.infoWin.borderMe.setVisible(false);
        this.infoNoWin.borderMe.setVisible(false);
    },

    updateMedal: function (dataLastWeek) {
        var strMedal = localized("NEW_RANK_RECEIVE_GIFT_MEDAL_GOLD");
        var imgMedal = "iconMedalBig2.png";
        if (dataLastWeek["silverMedal"] > 0) {
            strMedal = localized("NEW_RANK_RECEIVE_GIFT_MEDAL_SILVER");
            imgMedal = "iconMedalBig1.png";
            this.typeMedal = 1;
        } else if (dataLastWeek["bronzeMedal"] > 0) {
            strMedal = localized("NEW_RANK_RECEIVE_GIFT_MEDAL_BRONZE");
            imgMedal = "iconMedalBig0.png";
            this.typeMedal = 0;
        } else if (dataLastWeek["goldMedal"] > 0) {
            this.typeMedal = 2;
        } else {
            this.typeMedal = -1;
        }
        if (this.typeMedal > -1) {
            this.txtMedal.setString(strMedal);
            this.medal.loadTexture(imgMedal, ccui.Widget.PLIST_TEXTURE);
        }
        this.imgMedal.setVisible(this.typeMedal > -1);
    },

    updatePositionGiftWin: function () {
        var gifts = [];
        if (this.imgMedal.isVisible()) gifts.push(this.imgMedal);
        if (this.imgCup.isVisible()) gifts.push(this.imgCup);
        if (this.imgGold.isVisible()) gifts.push(this.imgGold);
        if (this.imgDiamond.isVisible()) gifts.push(this.imgDiamond);
        if (this.imgItem.isVisible()) gifts.push(this.imgItem);

        if (gifts.length <= 1){
            gifts[0].setPositionX(gifts[0].getParent().getContentSize().width/2);
            return;
        }

        var distance = this.rewardMinDistance * 4 / (gifts.length - 1);
        if (distance > this.rewardMaxDistance) distance = this.rewardMinDistance;
        for (var i = 0; i < gifts.length; i++){
            var k = i - (gifts.length - 1)/2;
            gifts[i].setPositionX(gifts[i].getParent().getContentSize().width/2 + k * distance);
        }
    },

    updateInfoTruCup: function (dataTruCup) {
        this.isTypeTruCup = true;
        this.pWin.setVisible(false);
        this.pNoWin.setVisible(true);
        this.imgNoLose1.setVisible(false);
        this.imgNoLose0.setVisible(false);

        this.imgNoWin.setVisible(false);
        this.titleNoWin.setVisible(false);
        this.infoNoWin.setVisible(false);
        this.imgTruCup.setVisible(true);
        this.btnUnderstood.setPositionY(this.btnUnderstood.defaultPos.y - 45); // 60 la lay vi tri tren gui cocos studio
        this.txtLoseCup.setPositionY(this.txtLoseCup.defaultPos.y - 55);
        this.txtLoseCup.setString(StringUtility.replaceAll(localized("NEW_RANK_RECEIVE_GIFT_TXT_LOSE_CUP"),
            "@number", StringUtility.pointNumber(Math.abs(dataTruCup["cup"]))));
        this.txtLoseCup.getChildByName("iconCup").setPositionX(this.txtLoseCup.getContentSize().width + 13);

        this.txtInfo.setVisible(false);
        this.txtInfo2.setVisible(true);
        var strTruCup = localized("NEW_RANK_OFFLINE");
        strTruCup = StringUtility.replaceAll(strTruCup, "@number", dataTruCup["offlineWeek"]);
        this.txtInfo2.setString(strTruCup);
        this.dataTruCup = dataTruCup;
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg, true);
    },

    onButtonRelease: function () {
        this.onClose();
        var isLose = true;
        var confirm, numberCup, numOldCup;
        if (!this.isTypeTruCup) {
            confirm = new CmdSendConfirmResultLastWeek();
            NewRankGameClient.getInstance().sendPacket(confirm);
            NewRankData.getInstance().setDataResultLastWeek(null);
            var dataLastWeek = this.dataLastWeek;
            if (dataLastWeek["cup"] === 0) return;
            isLose = dataLastWeek["cup"] < 0;
            numberCup = dataLastWeek["cup"];
            numOldCup = dataLastWeek["oldCup"];

            this.actionMoveMedal();

            if (!isLose) {
                var gui = sceneMgr.getRunningScene().getMainLayer();
                if (gui && gui instanceof LobbyScene) {
                    gui.effectGold(dataLastWeek["goldGift"], this.imgGold.getWorldPosition());

                    var diamond = NewRankData.getDiamondByPackId(dataLastWeek["packId"]);
                    if (diamond > 0) gui.effectDiamond(diamond, this.imgDiamond.getWorldPosition());
                }
            }
        } else {
            numberCup = this.dataTruCup["cup"];
            numOldCup = this.dataTruCup["oldCup"];
            NewRankData.getInstance().setDataTruCup(null);
            confirm = new CmdSendConfirmTruCup();
            NewRankGameClient.getInstance().sendPacket(confirm);
        }
        NewRankData.getInstance().setNumberOldCup(numOldCup);

        this.actionMoveCup(isLose, numberCup);
        confirm.clean();
    },

    actionMoveCup: function (isLose, numberCup) {
        var guiRank = sceneMgr.getGUI(NewRankGUI.TAG);

        var targetLosePosition, targetSpriteName;
        var callFunc = function(){};
        try {
            if (guiRank) {
                targetLosePosition = guiRank.pCurLevel.iconCup.getWorldPosition();
                targetSpriteName = "#iconCup.png";
                callFunc = cc.callFunc(function () {
                    this.effectUpdateCup(numberCup);
                }.bind(guiRank));
            } else {
                var lobby = sceneMgr.getRunningScene().getMainLayer();
                if (lobby instanceof LobbyScene) {
                    targetLosePosition = lobby.btnRank.getWorldPosition();
                    targetSpriteName = "#iconRankLobby.png";
                    callFunc = cc.callFunc(function () {
                        this.onUpdateBtnRankCallFunc(numberCup);
                        var dataTruCup = NewRankData.getInstance().getDataTruCup();
                        if (!!dataTruCup) {
                            this.runAction(cc.sequence(
                                cc.delayTime(0.5),
                                cc.callFunc(function () {
                                    var gui = sceneMgr.getGUI(NewRankResultGUI.TAG);
                                    if (!gui) {
                                        gui = sceneMgr.openGUI(NewRankResultGUI.className, NewRankResultGUI.TAG, NewRankResultGUI.TAG, false);
                                    }
                                    gui.updateInfoTruCup(dataTruCup);
                                })
                            ));
                        }
                    }.bind(lobby));
                }
                else{
                    targetLosePosition = cc.p(cc.winSize.width + 10, -10);
                    targetSpriteName = "#iconCup";
                }
            }
        } catch (e) {
            cc.error(e);
            targetLosePosition = cc.p(cc.winSize.width + 10, -10);
            targetSpriteName = "#iconCup";
        }

        var timeAction = 1;
        var actionMove = cc.moveTo(timeAction, targetLosePosition.x, targetLosePosition.y).easing(cc.easeExponentialInOut());

        var spriteName = (isLose) ? "#iconCup.png" : "#iconCupBig.png";
        var targetSprite = new cc.Sprite(targetSpriteName);
        var startPositionCup = (isLose) ? this.iconCup.getWorldPosition() : this.iconCupWin.getWorldPosition();
        var endScale = targetSprite.getContentSize().width / this.iconCupWin.getContentSize().width;
        if (isLose) endScale = targetSprite.getContentSize().width / this.iconCup.getContentSize().width;
        var actionScale = cc.scaleTo(timeAction, endScale);

        for (var i = 0; i < 3; i++) {
            var iconCup = new cc.Sprite(spriteName);
            sceneMgr.layerGUI.addChild(iconCup, NewRankResultGUI.TAG + 1);
            iconCup.setPosition(startPositionCup);
            var callFuncIdx = (i === 0) ? callFunc : cc.callFunc(function(){});
            iconCup.runAction(cc.sequence(cc.delayTime(0.2 * i), cc.spawn(actionMove.clone(),
                actionScale.clone()), callFuncIdx, cc.fadeOut(0.3), cc.removeSelf()));
        }

        NewRankData.getInstance().setNumberCupChange(numberCup);
    },

    actionMoveMedal: function () {
        var typeMedal = this.typeMedal;
        if (typeMedal < 0) {
            return;
        }

        var spriteMedalName = "#iconMedalBig" + typeMedal + ".png";
        var medal = new cc.Sprite(spriteMedalName);
        sceneMgr.layerGUI.addChild(medal, NewRankResultGUI.TAG + 1);
        medal.setPosition(this.medal.getWorldPosition());
        var timeAction = 0.8;
        var lobby = sceneMgr.getRunningScene().getMainLayer();
        var targetPos = lobby._uiAvatar.getParent().convertToWorldSpace(lobby._uiAvatar.getPosition());
        var actionMove = cc.moveTo(timeAction, targetPos.x, targetPos.y).easing(cc.easeExponentialInOut());
        var actionScale = cc.scaleTo(timeAction, 0.5);
        medal.runAction(cc.sequence(cc.spawn(actionMove, actionScale), cc.fadeOut(0.5), cc.removeSelf()));
    },

    onCloseDone: function(){
        this._super();
        if (StorageManager.getInstance().showUnlockItemRank()){
            //show unlock item
        }
    }
});

NewRankResultGUI.className = "NewRankResultGUI";
NewRankResultGUI.TAG = 51;
NewRankResultGUI.BTN_RECEIVE_NOW = 1;
NewRankResultGUI.BTN_UNDER_STOOD = 2;