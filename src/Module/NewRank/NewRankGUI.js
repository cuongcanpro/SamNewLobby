var NewRankGUI = BaseLayer.extend({
    ctor: function () {
        this._super();

        this.data = null;
        this.myRankIdx = -1;
        this.isCurWeek = false;
        this.isTopRank = false;

        this.timeRemainCurWeek = 0;
        this.timeAddDecor = 0;
        this.isRunningEffect = false;

        this.initWithBinaryFile("NewRankGUI.json");
    },

    initGUI: function(){
        this.bg = this.getControl("bg");

        //pCurLevel
        this.pCurLevel = this.getControl("pCurLevel");
        this.pCurLevel.imgRank = this.getControl("imgCurRank", this.pCurLevel);
        this.pCurLevel.level = this.getControl("level", this.pCurLevel.imgRank);
        this.pCurLevel.level.ignoreContentAdaptWithSize(true);
        this.pCurLevel.txtRank = this.getControl("txtCurRank", this.pCurLevel);
        this.pCurLevel.txtRank.ignoreContentAdaptWithSize(true);
        this.pCurLevel.pLayer = this.getControl("pLayer", this.pCurLevel);
        var processBg = this.getControl("processBg", this.pCurLevel);
        this.pCurLevel.process = this.getControl("processImg", processBg);
        this.pCurLevel.txtProcess = this.getControl("txtProcess", processBg);
        this.pCurLevel.txtProcess.ignoreContentAdaptWithSize(true);
        this.pCurLevel.iconCup = this.getControl("iconCup", processBg);

        //pNextLevel
        this.pNextLevel = this.getControl("pNextLevel", this.bg);
        this.pNextLevel.imgRank = this.getControl("imgNextRank", this.pNextLevel);
        this.pNextLevel.level = this.getControl("level", this.pNextLevel.imgRank);
        this.pNextLevel.level.ignoreContentAdaptWithSize(true);
        this.pNextLevel.txtRank = this.getControl("nameNextRank", this.pNextLevel);
        this.btnTooltip = this.customButton("btnTooltip", NewRankGUI.BTN_TOOLTIP, this.pNextLevel);

        //max rank
        this.txtMaxRank = this.getControl("txtMaxRank", this.bg);
        this.txtMaxRank.setVisible(false);

        //reset time
        this.txtLabelTime = this.getControl("txtLabelTime", this.bg);
        this.txtTime = this.getControl("txtTime", this.bg);
        this.txtTime.ignoreContentAdaptWithSize(true);

        this.title = this.bg.getChildByName("title");
        this.title.setVisible(false);
        this.btnIndividual = this.customButton("btnIndividual", NewRankGUI.BTN_INDIVIDUAL, this.bg);
        this.btnIndividual.setPressedActionEnabled(false);
        this.btnTop = this.customButton("btnTop", NewRankGUI.BTN_TOP, this.bg);
        this.btnTop.setPressedActionEnabled(false);
        this.btnClose = this.customButton("btnClose", NewRankGUI.BTN_CLOSE, this.bg);
        this.btnCheat = this.customButton("btnCheat", NewRankGUI.BTN_CHEAT, this.bg);
        this.btnCheat.setTouchEnabled(Config.ENABLE_CHEAT);

        this.titleTop = db.DBCCFactory.getInstance().buildArmatureNode("Huychuong");
        this.txtTop = db.DBCCFactory.getInstance().buildArmatureNode("Title_thanbai");
        if (this.titleTop && this.txtTop) {
            this.bg.addChild(this.titleTop, 3);
            this.titleTop.setPosition(this.title.getPositionX() - 135, this.title.getPositionY());
            this.titleTop.gotoAndPlay("1", 0, -1, 0);

            this.bg.addChild(this.txtTop, 3);
            this.txtTop.setPosition(this.title.getPositionX() + 29, this.title.getPositionY() + 4);
            this.txtTop.gotoAndPlay("1", 0, -1, 0);
        }

        this.titleIndividual = db.DBCCFactory.getInstance().buildArmatureNode("Cup");
        this.txtIndividual = db.DBCCFactory.getInstance().buildArmatureNode("Title_canhan");
        if (this.titleIndividual && this.txtIndividual) {
            this.bg.addChild(this.titleIndividual, 3);
            this.titleIndividual.setPosition(this.title.getPositionX() - 130, this.title.getPositionY() - 3);
            this.titleIndividual.gotoAndPlay("1", 0, -1, 0);

            this.bg.addChild(this.txtIndividual, 3);
            this.txtIndividual.setPosition(this.title.getPositionX() + 26, this.title.getPositionY() + 3);
            this.txtIndividual.gotoAndPlay("1", 0, -1, 0);
        }

        //table
        this.pTableRank = this.getControl("pTableRank", this.bg);
        this.pTableRank.setLocalZOrder(2);
        this.pTableRank.setTouchEnabled(false);

        this.bgTableRank = this.getControl("bgTableRank", this.pTableRank);
        this.bgTableRank.ignoreContentAdaptWithSize(true);

        this.txtTitleRank = this.getControl("txtTitleRank");
        this.txtTitleUser = this.getControl("txtTitleUser");
        this.txtTitleResult = this.getControl("txtTitleResult");
        this.txtTitleGift = this.getControl("txtTitleGift");

        this.bgCount = this.getControl("bgCount", this.pTableRank);
        this.bgCount.txtCount = this.getControl("txtCount", this.bgCount);
        this.bgCount.txtCount.ignoreContentAdaptWithSize(true);

        this.btnCurWeek = this.customButton("btnThisWeek", NewRankGUI.BTN_CUR_WEEK, this.pTableRank);
        this.btnCurWeek.setPressedActionEnabled(false);
        this.btnLastWeek = this.customButton("btnLastWeek", NewRankGUI.BTN_LAST_WEEK, this.pTableRank);
        this.btnLastWeek.setPressedActionEnabled(false);

        this.pTable = this.getControl("pTable", this.pTableRank);
        this.txtTooLate = this.getControl("txtTooLate", this.pTableRank);
        this.txtTooLate.ignoreContentAdaptWithSize(true);
        this.txtTooLate.img = this.getControl("img", this.txtTooLate);
        this.txtTooLate.img.ignoreContentAdaptWithSize(true);
        this.psTableRank = this.getControl("psTableRank", this.pTable);
        var sTableRank = this.getControl("sTableRank", this.psTableRank);
        sTableRank.setVisible(false);
        this.sTableRank = new cc.TableView(this, sTableRank.getContentSize());
        this.sTableRank.setAnchorPoint(sTableRank.getAnchorPoint());
        this.sTableRank.setPosition(sTableRank.getPosition());
        this.sTableRank.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.sTableRank.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.sTableRank.setDelegate(this);
        this.psTableRank.addChild(this.sTableRank);

        var myRankInfoBot = this.psTableRank.getChildByName("myRankInfoBot");
        myRankInfoBot.setVisible(false);
        this.myRankInfoBot = new NewRankPersonalInfoCell(false);
        this.psTableRank.addChild(this.myRankInfoBot);
        this.myRankInfoBot.setPosition(myRankInfoBot.getPosition());
        this.myRankInfoBot.setVisible(false);

        var myRankInfoTop = this.psTableRank.getChildByName("myRankInfoTop");
        myRankInfoTop.setVisible(false);
        this.myRankInfoTop = new NewRankPersonalInfoCell(false);
        this.psTableRank.addChild(this.myRankInfoTop);
        this.myRankInfoTop.setPosition(myRankInfoTop.getPosition());
        this.myRankInfoTop.setVisible(false);

        this.pCheat = this.getControl("pCheat");
        this.pCheat.setVisible(false);
        this.txtCheatGold = this.getControl("txtCheatGold", this.pCheat);
        this.customButton("btnCheatAddGoldWin", NewRankGUI.BTN_CHEAT_ADD_GOLD_WIN, this.pCheat);
        this.customButton("btnCheatSubGoldWin", NewRankGUI.BTN_CHEAT_SUB_GOLD_WIN, this.pCheat);
        this.txtCheatCup = this.getControl("txtCheatCup", this.pCheat);
        this.txtCheatMedal2 = this.getControl("txtCheatMedal2", this.pCheat);
        this.txtCheatMedal1 = this.getControl("txtCheatMedal1", this.pCheat);
        this.txtCheatMedal0 = this.getControl("txtCheatMedal0", this.pCheat);
        this.customButton("btnCheatInfo", NewRankGUI.BTN_CHEAT_INFO, this.pCheat);

        this.animLightBg = db.DBCCFactory.getInstance().buildArmatureNode("LightBg");
        if (this.animLightBg) {
            this.pCurLevel.addChild(this.animLightBg, -1, -1);
            this.animLightBg.setPosition(130, 100);
            this.animLightBg.gotoAndPlay("1", 0, -1, 9999);
        }
    },

    onEnterFinish: function () {
        //set default transforms
        this.setShowHideAnimate(this.bg, true);
        this.btnCurWeek.stopAllActions();
        this.btnCurWeek.setScale(1);
        this.btnCurWeek.setOpacity(255);
        this.btnLastWeek.stopAllActions();
        this.btnLastWeek.setScale(1);
        this.btnLastWeek.setOpacity(255);
        this.bgCount.stopAllActions();
        this.bgCount.setScale(1);
        this.bgCount.setOpacity(255);
        this.titleIndividual.stopAllActions();
        this.titleIndividual.setScale(1);
        this.titleIndividual.setOpacity(255);
        this.titleTop.stopAllActions();
        this.titleTop.setScale(1);
        this.titleTop.setOpacity(255);
        this.txtIndividual.stopAllActions();
        this.txtIndividual.setScale(1);
        this.txtIndividual.setOpacity(255);
        this.txtTop.stopAllActions();
        this.txtTop.setScale(1);
        this.txtTop.setOpacity(255);
        this.pCurLevel.pLayer.removeAllChildren(true);
        this.pCheat.setVisible(false);
        this.enableFog();

        //update gui
        this.updateCurRank(NewRankData.getInstance().getCurRankInfo());
        this.onButtonRelease(this.btnIndividual, NewRankGUI.BTN_INDIVIDUAL);
        this.effectChangeButton(this.btnTop, this.btnIndividual, 0);
        this.checkOpenResultLastWeek();
        this.scheduleUpdate();

        //log num open gui
        var numberOpenGUI = cc.sys.localStorage.getItem(NewRankData.KEY_SAVE_NUMBER_OPEN_GUI);
        numberOpenGUI = parseInt(numberOpenGUI) + 1;
        cc.sys.localStorage.setItem(NewRankData.KEY_SAVE_NUMBER_OPEN_GUI, numberOpenGUI ? numberOpenGUI : 1);

        //update data
        var cmdRankInfoCurWeek = new CmdSendGetWeekRank();
        cmdRankInfoCurWeek.putData(1);
        NewRankGameClient.getInstance().sendPacket(cmdRankInfoCurWeek);
        cmdRankInfoCurWeek.clean();

        var cmdRankInfoLastWeek = new CmdSendGetWeekRank();
        cmdRankInfoLastWeek.putData(0);
        NewRankGameClient.getInstance().sendPacket(cmdRankInfoLastWeek);
        cmdRankInfoLastWeek.clean();

        var cmdGetTopUsers = new CmdSendGetTopUsers();
        cmdGetTopUsers.putData();
        NewRankGameClient.getInstance().sendPacket(cmdGetTopUsers);
        cmdGetTopUsers.clean();
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case NewRankGUI.BTN_CLOSE: {
                if (!this.isRunningEffect) {
                    this.onClose();
                }
                break;
            }
            case NewRankGUI.BTN_CUR_WEEK:
            case NewRankGUI.BTN_LAST_WEEK: {
                var isCurWeek = id === NewRankGUI.BTN_CUR_WEEK;
                var textureCurWeek = "btnThisWeek" + (isCurWeek ? "" : "Inactive") + ".png";
                var textureLastWeek = "btnLastWeek" + (isCurWeek ? "Inactive" : "") + ".png";
                this.btnCurWeek.loadTextures(textureCurWeek, textureCurWeek, "", ccui.Widget.PLIST_TEXTURE);
                this.btnLastWeek.loadTextures(textureLastWeek, textureLastWeek, "", ccui.Widget.PLIST_TEXTURE);
                this.btnCurWeek.setTouchEnabled(!isCurWeek);
                this.btnLastWeek.setTouchEnabled(isCurWeek);
                this.updateDetailRankInfo(isCurWeek);
                break;
            }
            case NewRankGUI.BTN_INDIVIDUAL:
            {
                this.effectChangeButton(this.btnTop, this.btnIndividual);
                this.title.loadTexture("titleIndividual.png", ccui.Widget.PLIST_TEXTURE);
                this.titleIndividual.setVisible(true);
                this.txtIndividual.setVisible(true);
                this.titleIndividual.stopAllActions();
                this.titleIndividual.runAction(cc.spawn(cc.scaleTo(0.25, 1).easing(cc.easeBackOut()), cc.fadeIn(0.25)));
                this.txtIndividual.stopAllActions();
                this.txtIndividual.runAction(cc.spawn(cc.scaleTo(0.25, 1).easing(cc.easeExponentialOut()), cc.fadeIn(0.25)));
                this.titleTop.setVisible(false);
                this.txtTop.setVisible(false);
                this.titleTop.stopAllActions();
                this.titleTop.setScale(0);
                this.titleTop.setOpacity(0);
                this.txtTop.stopAllActions();
                this.txtTop.setScale(0, 1);
                this.txtTop.setOpacity(0);

                this.bgTableRank.loadTexture("bgTableRank.png", ccui.Widget.PLIST_TEXTURE);
                this.txtTitleRank.setTextColor(cc.color("9C8ABF"));
                this.txtTitleUser.setTextColor(cc.color("9C8ABF"));
                this.txtTitleResult.setTextColor(cc.color("9C8ABF"));
                this.txtTitleGift.setTextColor(cc.color("9C8ABF"));
                this.bgCount.stopAllActions();
                this.bgCount.runAction(cc.spawn(cc.scaleTo(0.25, 1, 1).easing(cc.easeExponentialOut()), cc.fadeIn(0.25)));

                this.updateButtonTopRight(false);
                this.onButtonRelease(this.btnCurWeek, NewRankGUI.BTN_CUR_WEEK);
                break;
            }
            case NewRankGUI.BTN_TOP:
                this.effectChangeButton(this.btnIndividual, this.btnTop);
                this.title.loadTexture("titleTop.png", ccui.Widget.PLIST_TEXTURE);
                this.titleIndividual.setVisible(false);
                this.txtIndividual.setVisible(false);
                this.titleIndividual.stopAllActions();
                this.titleIndividual.setScale(0);
                this.titleIndividual.setOpacity(0);
                this.txtIndividual.stopAllActions();
                this.txtIndividual.setScale(0, 1);
                this.txtIndividual.setOpacity(0);
                this.titleTop.setVisible(true);
                this.txtTop.setVisible(true);
                this.titleTop.stopAllActions();
                this.titleTop.runAction(cc.spawn(cc.scaleTo(0.25, 1).easing(cc.easeBackOut()), cc.fadeIn(0.25)));
                this.txtTop.stopAllActions();
                this.txtTop.runAction(cc.spawn(cc.scaleTo(0.25, 1).easing(cc.easeExponentialOut()), cc.fadeIn(0.25)));

                this.bgTableRank.loadTexture("Lobby/NewRank/bgTopRank.png");
                this.txtTitleRank.setTextColor(cc.color("B9AAE3"));
                this.txtTitleUser.setTextColor(cc.color("B9AAE3"));
                this.txtTitleResult.setTextColor(cc.color("B9AAE3"));
                this.txtTitleGift.setTextColor(cc.color("B9AAE3"));
                this.bgCount.stopAllActions();
                this.bgCount.runAction(cc.spawn(cc.scaleTo(0.25, 1, 0).easing(cc.easeExponentialIn()), cc.fadeOut(0.25)));

                this.updateButtonTopRight(true);
                this.updateTopRankInfo();
                break;
            case NewRankGUI.BTN_CHEAT:
                if (Config.ENABLE_CHEAT)
                    this.pCheat.setVisible(!this.pCheat.isVisible());
                break;
            case NewRankGUI.BTN_CHEAT_ADD_GOLD_WIN: {
                var cheatGoldWin = new CmdSendCheatGoldWin();
                var goldWin = parseInt(this.txtCheatGold.getString()) || 0;
                cheatGoldWin.putData(goldWin);
                NewRankGameClient.getInstance().sendPacket(cheatGoldWin);
                cheatGoldWin.clean();
                break;
            }
            case NewRankGUI.BTN_CHEAT_SUB_GOLD_WIN: {
                var cheatGoldWin = new CmdSendCheatGoldWin();
                var goldWin = parseInt(this.txtCheatGold.getString()) || 0;
                cheatGoldWin.putData(-goldWin);
                NewRankGameClient.getInstance().sendPacket(cheatGoldWin);
                cheatGoldWin.clean();
                break;
            }
            case NewRankGUI.BTN_CHEAT_INFO: {
                var cheatInfo = new CmdSendCheatNewRankInfo();
                var cup = this.txtCheatCup.getString() || 0;
                var goldMedal = this.txtCheatMedal2.getString() || 0;
                var silverMedal = this.txtCheatMedal1.getString() || 0;
                var bronzeMedal = this.txtCheatMedal0.getString() || 0;
                cheatInfo.putData(cup, goldMedal, silverMedal, bronzeMedal);
                NewRankGameClient.getInstance().sendPacket(cheatInfo);
                cheatInfo.clean();
                break;
            }
            case NewRankGUI.BTN_TOOLTIP: {
                var pos = this.pNextLevel.convertToWorldSpace(cc.p(0, this.pNextLevel.getContentSize().height));
                var text = this.getInfoTooltip();
                if (text === "") {
                    return;
                }
                TooltipFloat.makeTooltip(TooltipFloat.LONG, text, pos, TooltipFloat.SHOW_UP_TYPE_1, 16, cc.p(0, 0));
                break;
            }
        }
    },

    onExit: function () {
        this._super();
        this.unscheduleUpdate();
    },

    /* region Data Update */
    updateCurRank: function (curRankInfo) {
        if (!curRankInfo || curRankInfo.error) {
            curRankInfo = {rank: 0, rankPoint: 0}
        }
        var rank = curRankInfo.rank;
        this.updateInfoRank(rank, true);
        this.updateInfoRank(rank, false);

        var rankPointNeed = NewRankData.getRankPointNeed(rank);
        if (rankPointNeed === -1 || curRankInfo.rankPoint > rankPointNeed) {
            this.pCurLevel.process.setPercent(100);

            this.pCurLevel.txtProcess.setString(StringUtility.pointNumber(curRankInfo.rankPoint));
            return;
        }
        var percent = curRankInfo.rankPoint / rankPointNeed * 100;
        this.pCurLevel.process.setPercent(percent);

        this.pCurLevel.txtProcess.setString(StringUtility.pointNumber(curRankInfo.rankPoint) + "/"
            + StringUtility.pointNumber(rankPointNeed));
    },

    updateInfoRank: function (rank, isCurRank) {
        // if (!rank) return;
        rank = parseInt(rank);
        var panel = (isCurRank) ? this.pCurLevel : this.pNextLevel;
        panel.imgRank.setVisible(true);
        if (!isCurRank) {
            rank = rank + 1;
            this.pNextLevel.setVisible(rank <= NewRankData.MAX_RANK);
            this.txtMaxRank.setVisible(!this.pNextLevel.isVisible());
            if (rank > NewRankData.MAX_RANK) {
                return;
            }
            else if (rank < NewRankData.MAX_RANK){
                panel.imgRank.setPositionY(panel.imgRank.defaultPos.y);
                panel.txtRank.setPositionY(panel.txtRank.defaultPos.y);
            }
            else{
                panel.imgRank.setPositionY(panel.imgRank.defaultPos.y + 5);
                panel.txtRank.setPositionY(panel.txtRank.defaultPos.y + 5);
            }

            var texture = NewRankData.getRankImg(rank);
            panel.imgRank.loadTexture(texture, ccui.Widget.PLIST_TEXTURE);
            panel.imgRank.stopAllActions();
            panel.imgRank.setScale(0.5);
        } else {
            var oldAnim = panel.imgRank.getChildByTag(50);
            if (oldAnim) {
                oldAnim.removeFromParent(true);
            }
            var animRank = db.DBCCFactory.getInstance().buildArmatureNode("Rank");
            if (animRank) {
                panel.imgRank.addChild(animRank, 50, 50);
                var imgRankSize = panel.imgRank.getContentSize();
                animRank.setPosition(imgRankSize.width / 2, imgRankSize.height / 2);
                var indexLevel = Math.floor(rank / 3) + 1;
                animRank.gotoAndPlay(indexLevel, 0, -1, 9999);
            }
            panel.imgRank.setScale(1);
        }

        panel.level.setVisible(rank < NewRankData.MAX_RANK);
        var levelTexture = NewRankData.getRankLevelImg(rank);
        panel.level.loadTexture(levelTexture, ccui.Widget.PLIST_TEXTURE);
        panel.txtRank.setString(NewRankData.getRankName(rank));
    },

    updateDetailRankInfo: function (isCurWeek) {
        this.isCurWeek = isCurWeek;
        this.myRankIdx = -1;
        this.isTopRank = false;
        this.data = isCurWeek ? NewRankData.getInstance().getDataCurWeek() : NewRankData.getInstance().getDataLastWeek();
        if (!this.data){
            this.data = {};
            this.data.topUser = [];
            this.data.weekLevel = 0;
            this.data.isOpening = false;
            this.data.remainTime = 0;
            this.data.size = 0;
        }

        if (isCurWeek){
            this.timeRemainCurWeek = parseFloat(this.data.remainTime) / 1000;
            if (this.data.size === 0 && !this.data.isOpening){
                this.txtLabelTime.setVisible(false);
                this.txtTime.setVisible(false);
                this.bgCount.setVisible(false);
                this.pTable.setVisible(false);
                this.txtTooLate.setVisible(true);
                this.txtTooLate.img.loadTexture("imgTimeUp.png", ccui.Widget.PLIST_TEXTURE);
                this.txtTooLate.setString(localized("NEW_RANK_TIME_OUT"));
                ccui.Helper.doLayout(this.txtTooLate);
                return;
            }
            else{
                this.txtLabelTime.setVisible(true);
                this.txtTime.setVisible(true);
                this.bgCount.setVisible(true);
                var numGamePlayed = NewRankData.getNumGamePlayed();
                this.bgCount.txtCount.setString(numGamePlayed + "/" + NewRankData.MAX_GAME_PER_DAY);
                this.bgCount.txtCount.setTextColor(numGamePlayed == NewRankData.MAX_GAME_PER_DAY ? cc.color("#FF5B5B") : cc.color("#50D685"));
            }

            for (var i = 0; i < this.data.topUser.length; i++){
                var info = this.data.topUser[i];
                if (info.isUser && info.userId == gamedata.getUserId())
                    this.updateMyInfo(info, this.data.size, i, this.data.weekLevel);
            }
        }

        this.pTable.setVisible(true);
        this.txtTooLate.setVisible(false);
        this.myRankInfoBot.setVisible(false);
        this.myRankInfoTop.setVisible(false);
        this.sTableRank.unscheduleAllCallbacks();
        this.sTableRank.reloadData();
        this.effectIn();
    },

    updateTopRankInfo: function(){
        this.isCurWeek = false;
        this.myRankIdx = -1;
        this.isTopRank = true;
        this.data = NewRankData.getInstance().getTopUsersData();
        if (this.data){
            this.data.weekLevel = NewRankData.MAX_RANK;
            this.data.size = this.data.topUser.length;
        }
        else{
            this.data = {};
            this.data.topUser = [];
            this.data.weekLevel = NewRankData.MAX_RANK;
            this.data.size = 0;
        }

        if (this.data.size == 0){
            this.pTable.setVisible(false);
            this.txtTooLate.setVisible(true);
            this.txtTooLate.img.loadTexture("imgNotOpen.png", ccui.Widget.PLIST_TEXTURE);
            this.txtTooLate.setString(localized("NEW_RANK_NOT_OPEN"));
            ccui.Helper.doLayout(this.txtTooLate);
            return;
        }

        this.pTable.setVisible(true);
        this.txtTooLate.setVisible(false);
        this.myRankInfoBot.setVisible(false);
        this.myRankInfoTop.setVisible(false);
        this.sTableRank.unscheduleAllCallbacks();
        this.sTableRank.reloadData();
        this.effectIn();
    },

    updateMyInfo: function (myInfo, size, idx, weekLevel) {
        this.myRankIdx = idx;

        this.myRankInfoTop.updateInfo(myInfo, size, weekLevel, false);
        this.myRankInfoTop._layout.setPositionY(0);
        this.myRankInfoTop.stopAllActions();

        this.myRankInfoBot.updateInfo(myInfo, size, weekLevel, false);
        this.myRankInfoBot._layout.setPositionY(0);
        this.myRankInfoBot.stopAllActions();
    },

    effectIn: function() {
        var cells = this.sTableRank.getContainer().getChildren();
        for (var i = 0; i < cells.length; i++){
            cells[i]._layout.setScaleY(0);
            cells[i]._layout.stopAllActions();
            cells[i]._layout.runAction(cc.sequence(
                cc.delayTime(0.1 + 0.05 * i),
                cc.scaleTo(0.15, 1)
            ));
        }
    },

    tableCellAtIndex: function(table, idx){
        var cell = table.dequeueCell();
        if (!cell){
            cell = new NewRankPersonalInfoCell(false);
            cell._layout.setPositionX(this.sTableRank.getViewSize().width/2);
        }
        cell.setVisible(true);
        cell._layout.stopAllActions();
        cell._layout.setScaleY(1);
        cell.updateInfo(this.data.topUser[idx], this.data.size, this.data.weekLevel, this.isTopRank);
        return cell;
    },

    tableCellSizeForIndex: function(table, idx){
        var userData = this.data.topUser[idx];
        var bgTexture = NewRankPersonalInfoCell.getBgTexture(this.isTopRank, userData.isUser, userData.isUser && userData.userId == gamedata.getUserId(), idx);
        var textureType = NewRankPersonalInfoCell.getTextureType(this.isTopRank);
        var bg = new ccui.ImageView(bgTexture, textureType);
        return cc.size(this.sTableRank.getViewSize().width, bg.getContentSize().height + NewRankGUI.PADDING_CELL);
    },

    numberOfCellsInTableView: function(){
        if (this.data) return this.data.topUser.length;
        else return 0;
    },
    /* end region */

    /* region Effect Update Rank */
    checkOpenResultLastWeek: function () {
        var resultLastWeek = NewRankData.getInstance().getDataResultLastWeek();
        if (!!resultLastWeek) {
            this.runAction(cc.sequence(
                cc.delayTime(1.5),
                cc.callFunc(function () {
                    var gui = sceneMgr.getGUI(NewRankResultGUI.TAG);
                    if (!gui) {
                        gui = sceneMgr.openGUI(NewRankResultGUI.className, NewRankResultGUI.TAG, NewRankResultGUI.TAG, false);
                    }
                    gui.updateResult(resultLastWeek);
                })
            ));
            this.updateFakeRankWithLastWeekData(resultLastWeek["oldCup"]);
        } else {
            this.updateFakeRankWithLastWeekData(NewRankData.getInstance().getNumberOldCup());
            this.runAction(cc.sequence(
                cc.delayTime(1),
                cc.callFunc(function () {
                    this.effectUpdateCup();
                }.bind(this))
            ));
        }
    },

    updateFakeRankWithLastWeekData: function (cup) {
        var oldRank, oldRankInfo, dataLastWeek;
        if (NewRankData.getInstance().getNumberCupChange() === 0) {
            var dataTruCup = NewRankData.getInstance().getDataTruCup();
            if (!!dataTruCup) {
                oldRank = NewRankData.getRankByCup(dataTruCup["oldCup"]);
                dataLastWeek = NewRankData.getInstance().getDataLastWeek();
                if (dataLastWeek && dataLastWeek.size > 0) {
                    oldRank = dataLastWeek.weekLevel;
                }
                oldRankInfo = {rank: oldRank, rankPoint: dataTruCup["oldCup"]};
                this.updateCurRank(oldRankInfo);

                this.runAction(cc.sequence(
                    cc.delayTime(1.5),
                    cc.callFunc(function () {
                        var gui = sceneMgr.getGUI(NewRankResultGUI.TAG);
                        if (!gui) {
                            gui = sceneMgr.openGUI(NewRankResultGUI.className, NewRankResultGUI.TAG, NewRankResultGUI.TAG, false);
                        }
                        gui.updateInfoTruCup(dataTruCup);
                    })
                ));
            }
            return;
        }

        var rankInfo = NewRankData.getInstance().getCurRankInfo();
        if (cup === rankInfo.rankPoint) {
            return;
        }
        oldRank = NewRankData.getRankByCup(cup);
        dataLastWeek = NewRankData.getInstance().getDataLastWeek();
        if (dataLastWeek && dataLastWeek.size > 0) {
            oldRank = dataLastWeek.weekLevel;
        }
        oldRankInfo = {rank: oldRank, rankPoint: cup};
        this.updateCurRank(oldRankInfo);
    },

    effectUpdateCup: function () {
        var changeCup = NewRankData.getInstance().getNumberCupChange();
        if (changeCup === 0) {
            return;
        }

        var rankInfo = NewRankData.getInstance().getCurRankInfo();
        var oldRankPoint = NewRankData.getInstance().getNumberOldCup();
        var curRankPoint = rankInfo.rankPoint;
        if (curRankPoint === oldRankPoint) {
            return;
        }
        var oldRank = NewRankData.getRankByCup(oldRankPoint);
        var dataLastWeek = NewRankData.getInstance().getDataLastWeek();
        if (dataLastWeek && dataLastWeek.size > 0) {
            oldRank = dataLastWeek.weekLevel;
        }
        var curRank = rankInfo.rank;

        this.runEffectChangeCup(curRankPoint, oldRankPoint, curRank, oldRank);
    },

    runEffectChangeCup: function (curRankPoint, oldRankPoint, curRank, oldRank) {
        this.isRunningEffect = true;
        var actions = [];
        var totalTime = Math.ceil(Math.abs(curRankPoint - oldRankPoint) / 1000);
        if (totalTime > 4) totalTime = 4;
        var numberFrame = 25 * totalTime;
        var rankPointChangeEachFrame = (curRankPoint - oldRankPoint) / numberFrame;
        var actionDelay = cc.delayTime(totalTime / numberFrame);
        var isUp = curRank - oldRank > 0;
        var oldRankSave = oldRank;
        if (isUp) oldRank++;
        for (var i = 1; i <= numberFrame; i++) {
            var nowPoint = Math.round(oldRankPoint + i * rankPointChangeEachFrame);
            var nowRank = NewRankData.getRankByCup(nowPoint);
            var rankPointNeed = NewRankData.getRankPointNeed(nowRank);
            var percent = nowPoint / rankPointNeed * 100;
            var strTarget = StringUtility.pointNumber(nowPoint) + "/" + StringUtility.pointNumber(rankPointNeed);
            if (nowRank >= NewRankData.MAX_RANK - 1) {
                strTarget = StringUtility.pointNumber(nowPoint);
            }
            var data = {
                txtTarget: this.pCurLevel.txtProcess,
                processTarget: this.pCurLevel.process,
                str: strTarget,
                percent: percent
            };
            var action = cc.callFunc(function () {
                this.txtTarget.setString(this.str);
                this.processTarget.setPercent(this.percent);
            }.bind(data));
            actions.push(actionDelay);
            actions.push(action);
            var condition;
            if (isUp) {
                condition = (oldRank < nowRank);
            } else {
                condition = false;
            }
            if (condition && curRank < NewRankData.MAX_RANK) {
                var data2 = {target: this, rank: nowRank};
                actions.push(cc.callFunc(function () {
                    this.target.updateInfoRank(this.rank, false);
                }.bind(data2)));
                oldRank++;
            }
        }

        if (curRank < NewRankData.MAX_RANK || curRank !== oldRankSave) {
            if (oldRankSave - curRank > 0) {
                actions.push(cc.callFunc(function () {
                    this.effectDownLevel();
                }.bind(this)));
            } else if (oldRankSave - curRank < 0) {
                actions.push(cc.callFunc(function () {
                    this.effectUpLevel();
                }.bind(this)));
            }
        } else {
            actions.push(cc.callFunc(function () {
                this.isRunningEffect = false;
            }.bind(this)));
        }

        actions.push(cc.callFunc(function () {
            NewRankData.getInstance().setNumberOldCup(curRankPoint);
            if (oldRankSave === curRank) {
                this.isRunningEffect = false;
            }
        }.bind(this)));

        this.pCurLevel.runAction(cc.sequence(actions));
    },

    effectDownLevel: function () {
        var rankInfo = NewRankData.getInstance().getCurRankInfo();
        var curRank = rankInfo.rank;

        var curRankSprite = this.makeIconRank(curRank);

        curRankSprite.setScale(4);
        curRankSprite.setOpacity(0);
        this.pCurLevel.imgRank.runAction(cc.scaleTo(0.25, 0).easing(cc.easeBackIn()));
        this.pCurLevel.addChild(curRankSprite);
        curRankSprite.setPosition(this.pCurLevel.imgRank.getPosition());

        var timeAction = 0.3;
        var actionFaceIn = cc.fadeIn(timeAction);
        var actionScaleIn = cc.scaleTo(timeAction, 1).easing(cc.easeExponentialIn());
        curRankSprite.runAction(cc.sequence(cc.delayTime(0.5), cc.spawn(actionFaceIn, actionScaleIn), cc.callFunc(function () {
            this.updateInfoRank(curRank, true);
            NewRankData.getInstance().setNumberCupChange(0);
        }.bind(this)), cc.hide(), cc.removeSelf()));

        var delayNextLevel = 1;
        var nextRankSprite = this.makeIconRank(curRank + 1);
        nextRankSprite.setScale(2);
        nextRankSprite.setOpacity(0);
        this.pNextLevel.imgRank.runAction(cc.sequence(cc.delayTime(delayNextLevel),
            cc.scaleTo(0.25, 0).easing(cc.easeBackIn())));
        this.pNextLevel.addChild(nextRankSprite);
        nextRankSprite.setPosition(this.pNextLevel.imgRank.getPosition());
        var actionScaleIn2 = cc.scaleTo(timeAction, 0.5).easing(cc.easeExponentialIn());
        nextRankSprite.runAction(cc.sequence(cc.delayTime(0.5 + delayNextLevel), cc.spawn(actionScaleIn2, actionFaceIn.clone()),
            cc.callFunc(function () {
                this.updateInfoRank(curRank, false);
                this.isRunningEffect = false;
            }.bind(this)), cc.hide(), cc.removeSelf()
        ));
    },

    effectUpLevel: function () {
        var rankInfo = NewRankData.getInstance().getCurRankInfo();
        var curRank = rankInfo.rank;
        var curRankImg = this.makeIconRank(curRank, true);

        curRankImg.setScale(0.5);
        this.pCurLevel.addChild(curRankImg);
        var oldPos = this.pCurLevel.convertToNodeSpace(this.pNextLevel.imgRank.getWorldPosition());
        curRankImg.setPosition(oldPos);

        var newPos = this.pCurLevel.imgRank.getPosition();
        var centerPos = cc.p((oldPos.x + newPos.x) / 2, (oldPos.y + newPos.y) / 2);

        var timeAction = 0.45;
        // var typeEasing = cc.easeExponentialIn();
        var actionMove = new cc.BezierTo(timeAction, [oldPos, centerPos, newPos]);
        // var actionScale = cc.scaleTo(timeAction, 1).easing(typeEasing).easing(cc.easeBackOut());
        // var actionMove = cc.moveTo(timeAction, newPos.x, newPos.y);
        var actionScale = cc.scaleTo(timeAction, 1);
        var actionScale2 = cc.scaleBy(0.1, 1.2);
        var actionScale3 = cc.scaleTo(0.035, 1);

        this.pNextLevel.imgRank.setVisible(false);

        setTimeout(function () {
            var effect = db.DBCCFactory.getInstance().buildArmatureNode("HighlightBig");
            if (effect) {
                this.pCurLevel.addChild(effect, 101);
                var imgRankPos = this.pCurLevel.imgRank.getPosition();
                effect.setPosition(imgRankPos.x, imgRankPos.y);
                effect.gotoAndPlay("1", 0, 1.2, 1);
            }
        }.bind(this), 400);

        curRankImg.runAction(cc.sequence(cc.spawn(actionMove, actionScale), cc.callFunc(function () {
            this.pCurLevel.imgRank.setVisible(false);
            if (gameSound.on)
                audioEngine.playEffect("res/Lobby/NewRank/soundLevelUp.mp3", false);
        }.bind(this)), cc.delayTime(0.4), actionScale2, actionScale3, cc.callFunc(function () {
            this.updateInfoRank(curRank, true);
            this.updateInfoRank(curRank, false);
            NewRankData.getInstance().setNumberCupChange(0);
            this.isRunningEffect = false;
        }.bind(this)), cc.hide(), cc.removeSelf(true)));
    },

    makeIconRank: function (curRank, isUpLevel) {
        var texture = NewRankData.getRankImg(curRank);
        var levelTexture = NewRankData.getRankLevelImg(curRank);
        var curRankSprite = new cc.Sprite("#" + texture);
        var curLevelSprite = new cc.Sprite("#" + levelTexture);
        if (isUpLevel)
            curRankSprite.addChild(curLevelSprite);
        curLevelSprite.setPosition(curRankSprite.getContentSize().width / 2, curRankSprite.getContentSize().height * 1.05);

        return curRankSprite;
    },
    /* endregion */

    /* region Layout Update */
    effectChangeButton: function(curBtn, nextBtn, duration){
        if (duration == undefined) duration = 0.25;

        var textureCurBtn = this.getButtonTexture(curBtn.getTag(), false);
        var textureNextBtn = this.getButtonTexture(nextBtn.getTag(), true);
        curBtn.loadTextures(textureCurBtn, textureCurBtn, "", ccui.Widget.PLIST_TEXTURE);
        nextBtn.loadTextures(textureNextBtn, textureNextBtn, "", ccui.Widget.PLIST_TEXTURE);
        curBtn.setTouchEnabled(false);
        nextBtn.setTouchEnabled(false);

        curBtn.removeAllChildren();
        curBtn.stopAllActions();
        curBtn.setPositionX(this.btnIndividual.defaultPos.x);
        curBtn.setLocalZOrder(1);
        curBtn.addChild(new ccui.ImageView(this.getButtonTexture(curBtn.getTag(), true), ccui.Widget.PLIST_TEXTURE), 0, 0);
        curBtn.getChildByTag(0).setAnchorPoint(0, 0);
        curBtn.getChildByTag(0).runAction(cc.sequence(cc.fadeOut(duration), cc.removeSelf()));
        curBtn.runAction(cc.sequence(
            cc.moveBy(duration/5, -12, 0),
            cc.callFunc(function(){this.setLocalZOrder(0);}.bind(curBtn)),
            cc.moveTo(duration * 4/5, this.btnTop.defaultPos),
            cc.callFunc(function(){this.setTouchEnabled(true);}.bind(curBtn))
        ));

        nextBtn.removeAllChildren();
        nextBtn.stopAllActions();
        nextBtn.setPositionX(this.btnTop.defaultPos.x);
        nextBtn.setLocalZOrder(0);
        nextBtn.addChild(new ccui.ImageView(this.getButtonTexture(nextBtn.getTag(), false), ccui.Widget.PLIST_TEXTURE), 0, 0);
        nextBtn.getChildByTag(0).setAnchorPoint(0, 0);
        nextBtn.getChildByTag(0).runAction(cc.sequence(cc.fadeOut(duration), cc.removeSelf()));
        nextBtn.runAction(cc.sequence(
            cc.moveBy(duration/5, 12, 0),
            cc.callFunc(function(){this.setLocalZOrder(1);}.bind(nextBtn)),
            cc.moveTo(duration * 4/5, this.btnIndividual.defaultPos)
        ));
    },

    updateButtonTopRight: function (isTopRank) {
        if (isTopRank){
            this.btnCurWeek.setTouchEnabled(false);
            this.btnLastWeek.setTouchEnabled(false);
            this.btnCurWeek.stopAllActions();
            this.btnCurWeek.runAction(cc.spawn(cc.scaleTo(0.25, 0).easing(cc.easeBackIn()), cc.fadeOut(0.25)));
            this.btnLastWeek.stopAllActions();
            this.btnLastWeek.runAction(cc.spawn(cc.scaleTo(0.25, 0).easing(cc.easeBackIn()), cc.fadeOut(0.25)));
        }
        else {
            this.btnCurWeek.setTouchEnabled(true);
            this.btnLastWeek.setTouchEnabled(true);
            var dataLastWeek = NewRankData.getInstance().getDataLastWeek();
            this.btnLastWeek.setEnabled(dataLastWeek && dataLastWeek.size > 0);

            this.btnCurWeek.stopAllActions();
            this.btnCurWeek.runAction(cc.spawn(cc.scaleTo(0.25, 1).easing(cc.easeBackOut()), cc.fadeIn(0.25)));
            this.btnLastWeek.stopAllActions();
            this.btnLastWeek.runAction(cc.spawn(cc.scaleTo(0.25, 1).easing(cc.easeBackOut()), cc.fadeIn(0.25)));
        }
    },

    getButtonTexture: function(btnId, active){
        var path = "";
        switch(btnId){
            case NewRankGUI.BTN_INDIVIDUAL:
                path = "btnIndividual";
                break;
            case NewRankGUI.BTN_TOP:
                path = "btnTop";
                break;
        }
        if (path != "")
            return path + (active ? "" : "Inactive") + ".png";
        else return "";
    },

    getInfoTooltip: function () {
        var rankInfo = NewRankData.getInstance().getCurRankInfo();
        if (!rankInfo || rankInfo.error) {
            return "";
        }

        if (rankInfo.rank >= NewRankData.MAX_RANK) {
            return "";
        }

        if (rankInfo.rank >= NewRankData.MAX_RANK - 1) {
            var maxRankName = NewRankData.getRankName(NewRankData.MAX_RANK);
            return StringUtility.replaceAll(localized("NEW_RANK_MAX_RANK_NEED"), "@maxRank", maxRankName);
        }

        var str1 = localized("NEW_RANK_NEXT_RANK_NEED");
        str1 = StringUtility.replaceAll(str1, "@nextRank", NewRankData.getRankName(rankInfo.rank + 1));
        var cupNeed = NewRankData.getRankPointNeed(rankInfo.rank) - rankInfo.rankPoint;
        str1 = StringUtility.replaceAll(str1, "@number", cupNeed);

        var rankConfig = NewRankData.getInstance().getRankConfig();
        var dataCurWeek = NewRankData.getInstance().getDataCurWeek();
        if (rankConfig && dataCurWeek && (dataCurWeek.isOpening || dataCurWeek.size > 0)) {
            var winCup = rankConfig["prize"]["winCup"];
            var positionNeed = -1;
            for (var i = winCup.length - 1; i >= 0; i--) {
                var cupThisPos = NewRankData.getCupWinLose(dataCurWeek.weekLevel, i, NewRankData.MAX_PLAYER_IN_ONE_TABLE);
                if (cupThisPos >= cupNeed) {
                    positionNeed = i;
                    break;
                }
            }
            if (positionNeed >= 0) {
                var str2 = localized("NEW_RANK_NEXT_RANK_POSITION_NEED");
                str2 = StringUtility.replaceAll(str2, "@number", positionNeed + 1);
                str1 += " " + str2;
            }
        }
        return str1;
    },
    /* endregion */

    checkMyRankIsOnScreen: function () {
        if (!this.isCurWeek || this.myRankIdx == -1) {
            this.myRankInfoBot.setVisible(false);
            this.myRankInfoTop.setVisible(false);
            return;
        }

        var myRankInfoCell = this.sTableRank.cellAtIndex(this.myRankIdx);
        if (myRankInfoCell){
            var myRankY = myRankInfoCell.bg.getWorldPosition().y;
            var botY = this.myRankInfoBot.bg.getWorldPosition().y;
            var topY = this.myRankInfoTop.bg.getWorldPosition().y;

            if (myRankY >= botY - 1 && myRankY <= topY + 1) {   //add 1 offset for better effect
                myRankInfoCell.setVisible(true);
                this.myRankInfoBot.setVisible(false);
                this.myRankInfoTop.setVisible(false);
            } else {
                myRankInfoCell.setVisible(false);
                this.myRankInfoBot.setVisible(myRankY < botY - 1);
                this.myRankInfoTop.setVisible(myRankY > topY + 1);
            }
        }
        else{
            this.myRankInfoBot.setVisible(false);
            this.myRankInfoTop.setVisible(false);
            var cells = this.sTableRank.getContainer().getChildren();
            if (cells.length > 0){
                var minIdx = cells[0].getIdx();
                var maxIdx = cells[cells.length - 1].getIdx();
                if (this.myRankIdx < minIdx) this.myRankInfoTop.setVisible(true);
                if (this.myRankIdx > maxIdx) this.myRankInfoBot.setVisible(true);
            }
        }
    },

    update: function (dt) {
        if (this.myRankIdx != -1) {
            this.checkMyRankIsOnScreen();
        }

        this.timeAddDecor -= dt;
        if (this.timeAddDecor < 0) {
            this.timeAddDecor = NewRankGUI.DELTA_TIME_ADD_DECOR;
            var decor = new ItemDecor(this.pCurLevel.pLayer.getContentSize().height);
            this.pCurLevel.pLayer.addChild(decor);
            decor.setPositionX(Math.random() * this.pCurLevel.pLayer.getContentSize().width);
        }

        if (this.timeRemainCurWeek < 0) {
            this.txtLabelTime.setVisible(false);
            this.txtTime.setVisible(false);
            return;
        }
        this.txtLabelTime.setVisible(true);
        this.txtTime.setVisible(true);
        this.timeRemainCurWeek -= dt;
        var strRemainTime = NewRankData.getTimeRemainStr(this.timeRemainCurWeek);
        this.txtTime.setString(strRemainTime);
    }
});

NewRankGUI.className = "NewRankGUI";
NewRankGUI.TAG = 49;
NewRankGUI.LOCAL_Z_ORDER = 49;

NewRankGUI.BTN_CLOSE = 0;
NewRankGUI.BTN_CUR_WEEK = 1;
NewRankGUI.BTN_LAST_WEEK = 2;
NewRankGUI.BTN_CHEAT_ADD_GOLD_WIN = 3;
NewRankGUI.BTN_CHEAT_SUB_GOLD_WIN = 4;
NewRankGUI.BTN_CHEAT_INFO = 5;
NewRankGUI.BTN_TOOLTIP = 6;
NewRankGUI.BTN_INDIVIDUAL = 7;
NewRankGUI.BTN_TOP = 8;
NewRankGUI.BTN_CHEAT = 9;

NewRankGUI.PADDING_CELL = 3;
NewRankGUI.DELTA_TIME_ADD_DECOR = 1.6;

var ItemDecor = cc.Node.extend({
    ctor: function (panelHeight) {
        this._super();

        var randomIdx = Math.floor(Math.random() * 3.99);
        this.item = new cc.Sprite("#iconLayer" + randomIdx + ".png");
        this.addChild(this.item);
        this.item.setOpacity(50 + Math.random() * 100);
        this.scheduleUpdate();
        this.isSpeedUp = false;
        this.speed = ItemDecor.SPEED_NORMAL;
        var scaleImg = Math.random() * 0.5 + 0.5;
        this.item.setScale(scaleImg);
        this.maxScaleX = scaleImg;
        this.startSpeed = 0.5 + Math.random() * ItemDecor.SPEED_NORMAL * scaleImg;
        var scaleMax = 5;
        var scaleMin = 1;
        this.itemScaleX = Math.random() * (scaleMax - scaleMin) + scaleMin;
        this.speedScale = 0;
        this.scaleXisUping = true;
        this.panelHeight = panelHeight;
        this.itemOpacity = this.item.getOpacity();
    },

    update: function (dt) {
        if (this.isSpeedUp) {
            this.speed += dt * ItemDecor.SPEED_UP_EACH_FRAME;
            if (this.speed > ItemDecor.MAX_SPEED) {
                this.speed = ItemDecor.MAX_SPEED;
            }
        } else {
            this.speed = this.startSpeed;
        }
        this.item.y += this.speed;

        if (this.scaleXisUping) {
            this.speedScale += dt * this.itemScaleX;
            if (this.speedScale > this.maxScaleX) {
                this.speedScale = this.maxScaleX;
                this.scaleXisUping = false;
            }
        } else {
            this.speedScale -= dt * this.itemScaleX;
            if (this.speedScale < 0) {
                this.speedScale = 0;
                this.scaleXisUping = true;
            }
        }

        this.item.scaleX = this.speedScale;

        if (this.item.y > this.panelHeight * 0.7) {
            this.itemOpacity -= ItemDecor.SPEED_HIDE;
            if (this.itemOpacity >= 0) {
                this.item.setOpacity(this.itemOpacity);
            } else {
                this.item.setOpacity(0);
            }
        }
    }
});

ItemDecor.SPEED_NORMAL = 1.5;
ItemDecor.MAX_SPEED = 50;
ItemDecor.SPEED_UP_EACH_FRAME = 10;
ItemDecor.SPEED_HIDE = 2;

var NewRankPersonalInfoCell = cc.TableViewCell.extend({
    ctor: function (isMiniRank) {
        this._super();
        var jsonLayout;
        if (isMiniRank) jsonLayout = ccs.load("NewRankPersonalInfoInGame.json");
        else jsonLayout = ccs.load("NewRankPersonalInfo.json");

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
            if (this.userData.userId == gamedata.userData.uID){
                var guiInfo = sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
                guiInfo.setInfo(gamedata.userData);
            }
            else {
                var otherInfo = new CmdSendGetOtherRankInfo();
                otherInfo.putData(this.userData.userId);
                GameClient.getInstance().sendPacket(otherInfo);
                otherInfo.clean();
                sceneMgr.addLoading().timeout(5);
            }
        }
    },

    updateInfo: function (data, size, weekLevel, isTopRank) {
        weekLevel = weekLevel || 0;
        this.userData = data;

        var textureBg = NewRankPersonalInfoCell.getBgTexture(isTopRank, data.isUser, data.isUser && data.userId === gamedata.getUserId(), data.idx);
        var textureReward = NewRankPersonalInfoCell.getRewardBgTexture(isTopRank, data.idx);
        var textureType = NewRankPersonalInfoCell.getTextureType(isTopRank);
        this.bg.loadTexture(textureBg, textureType);
        if (!this.isMiniRank){
            this.pReward.loadTexture(textureReward, textureType);
            ccui.Helper.doLayout(this.bg);
        }
        this._layout.setPositionY((this.bg.getContentSize().height + NewRankGUI.PADDING_CELL)/2);

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
        this.txtRank.enableOutline((data.userId === gamedata.getUserId()) ? cc.color("#9483b9") : cc.color("#6e98b4"), 1);

        this.txtName.setString(data.userName.length > 13 ? data.userName.substr(0, 13) + "..." : data.userName);
        this.txtExp.setString(StringUtility.pointNumber(data.goldWin) + " EXP");
        this.txtExp.setTextColor(data.goldWin == 0 ? cc.color("#FF5B5B") : cc.color("#7DD6FF"));
        this.borderMe.setVisible(!isTopRank && data.userId === gamedata.getUserId());
        this.uiAvatar.asyncExecuteWithUrl(data.userId, data.userId == gamedata.getUserId() ? gamedata.getUserAvatar() : data.avatar);
        var avatarFramePath = "";
        if (data.userId == gamedata.userData.uID)
            avatarFramePath = StorageManager.getInstance().getUserAvatarFramePath();
        else if (StorageManager.getInstance().cacheOtherAvatarId[data.userId] != null)
            avatarFramePath = StorageManager.getAvatarFramePath(StorageManager.getInstance().cacheOtherAvatarId[data.userId]);
        this.avatarFrame.setVisible(avatarFramePath != null && avatarFramePath != "");
        this.avatarFrame.loadTexture(avatarFramePath);
        this.defaultFrame.setVisible(!this.avatarFrame.isVisible());

        if (!this.isMiniRank) {
            if (data.goldWin > 0) {
                var goldGift = NewRankData.getGiftGold(weekLevel, data.idx);
                var winLoseCup = NewRankData.getCupWinLose(weekLevel, data.idx, size);
                var diamondGift = NewRankData.getGiftDiamond(weekLevel, data.idx);
                var itemGift = NewRankData.getGiftItem(weekLevel, data.idx);

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
                this.txtGiftCup.setString("-" + StringUtility.pointNumber(NewRankData.getMinusCupNonePlay(weekLevel)));

                this.txtGiftGold.setVisible(false);
                this.txtGiftDiamond.setVisible(false);
                this.txtGiftItem.setVisible(false);
            }
        }
    }
});

NewRankPersonalInfoCell.getBgTexture = function(isTopRank, isUser, isMe, idx){
    if (isTopRank){
        if (idx > 2) return "Lobby/NewRank/bgTop.png";
        else return "Lobby/NewRank/bgTop" + (idx + 1) + ".png";
    }
    else {
        if (!isUser) return "bgRankOther.png";
        if (idx > 2) return isMe ? "bgRankOtherMe.png" : "bgRankOther.png";
        else return "bgRank" + (idx + 1) + ".png"
    }
};

NewRankPersonalInfoCell.getRewardBgTexture = function(isTopRank, idx){
    if (isTopRank){
        if (idx > 2) return "Lobby/NewRank/bgRewardTop.png";
        else return "Lobby/NewRank/bgRewardTop" + (idx == 0 ? "1" : "23") + ".png";
    }
    else return "bgGoldWin.png";
};

NewRankPersonalInfoCell.getTextureType = function(isTopRank){
    return isTopRank ? ccui.Widget.LOCAL_TEXTURE : ccui.Widget.PLIST_TEXTURE;
};

var NewRankMiniGUI = BaseLayer.extend({
    ctor: function () {
        this._super();

        this.myRankInfoCell = null;
        this.myRankIdx = -1;
        this.data = null;

        this.isOpening = false;
        this.isHolding = false;
        this.timeOpenMiniRank = 0;

        this.initWithBinaryFile("NewRankInGameLayer.json");
    },

    initGUI: function () {
        this.pMiniRank = this.getControl("pMiniRank");
        this.pTable = this.getControl("pTable");
        var sTableRank = this.getControl("sTableRank", this.pMiniRank);
        sTableRank.setVisible(false);
        this.sTableRank = new cc.TableView(this, sTableRank.getContentSize());
        this.sTableRank.setAnchorPoint(sTableRank.getAnchorPoint());
        this.sTableRank.setPosition(sTableRank.getPosition());
        this.sTableRank.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.sTableRank.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this.sTableRank.setDelegate(this);
        this.sTableRank.ignoreAnchorPointForPosition(false);
        this.pTable.addChild(this.sTableRank);

        this.btnMiniRank = this.customButton("btnMiniRank", NewRankMiniGUI.BTN_MINI_RANK);
        this.btnClose = this.customButton("btnClose", NewRankMiniGUI.BTN_CLOSE);
        this.btnTest = this.customButton("btnTest", NewRankMiniGUI.BTN_TEST);
        this.btnTest.setVisible(false);

        this.pArrow = this.getControl("pArrow", this.btnMiniRank);
        this.pArrow.setClippingEnabled(true);
        this.txtExpChange = this.getControl("txtExpChange", this.btnMiniRank);
        this.txtExpChange.setVisible(false);
        this.txtExpChange.ignoreContentAdaptWithSize(true);
        var pTouch = this.getControl("pTouch");
        pTouch.setTouchEnabled(true);
        pTouch.setLocalZOrder(100);
        pTouch.addTouchEventListener(function(layout, type){
            switch(type){
                case ccui.Widget.TOUCH_BEGAN:
                    this.isHolding = true;
                    break;
                case ccui.Widget.TOUCH_ENDED:
                case ccui.Widget.TOUCH_CANCELED:
                    this.isHolding = false;
                    this.timeOpenMiniRank = NewRankMiniGUI.TIME_CLOSE_MINI_RANK * 1000;
                    break;
            }
        }.bind(this), this);

        this.title = this.getControl("title", this.pMiniRank);
        this.title.setVisible(false);
        this.animTitle = db.DBCCFactory.getInstance().buildArmatureNode("TitleRank");
        var imgRankPos = this.title.getPosition();
        if (this.animTitle) {
            this.title.getParent().addChild(this.animTitle);
            this.animTitle.setPosition(imgRankPos.x, imgRankPos.y);
            this.animTitle.gotoAndPlay("1", 0, -1, 9999);
        }

        this.txtTooLate = this.getControl("txtTooLate", this.pMiniRank);
        this.myRankInfoCell = new NewRankPersonalInfoCell(true);
        this.myRankInfoCell.setVisible(false);
        this.pTable.addChild(this.myRankInfoCell);
    },

    onEnterFinish: function () {
        this.pMiniRank.setPositionX(this.pMiniRank.defaultPos.x + this.pMiniRank.getContentSize().width);
        this.btnClose.setVisible(false);
        this.txtExpChange.setVisible(false);
        this.pArrow.removeAllChildren(true);

        this.myRankIdx = -1;
        this.myRankInfoCell.setVisible(false);
        this.updateDetailRankInfo(true);
        this.scheduleUpdate();
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case NewRankMiniGUI.BTN_CLOSE: {   //btnClose
                NewRankData.showMiniRankGUI(false);
                break;
            }
            case NewRankMiniGUI.BTN_MINI_RANK: {   //btnMiniRank
                if (NewRankData.checkOpenRank(true)) {
                    NewRankData.numberOpenGuiRankTracking++;
                    NewRankData.showMiniRankGUI(true);
                }
                break;
            }
            case NewRankMiniGUI.BTN_TEST: {   //btnTest
                NewRankData.getInstance().fakeMyDataInWeek();
                break;
            }
        }
    },

    onExit: function () {
        this._super();
        NewRankData.sendTrackingOpenGUI();
    },

    showTooltipOpenRank: function () {
        var pos = this.btnMiniRank.getWorldPosition();
        pos.x -= 164;
        var text = localized("NEW_RANK_HAS_OPENED");
        TooltipFloat.makeTooltip(TooltipFloat.LONG, text, pos, TooltipFloat.SHOW_UP_TYPE_3, 15);
    },

    showMiniRank: function (isShow) {
        this.pMiniRank.stopAllActions();
        if (isShow){
            this.updateDetailRankInfo(false);

            this.txtTooLate.setVisible(this.data.size == 0 && !this.data.isOpening);
            this.sTableRank.setVisible(this.data.size > 0 || this.data.isOpening);
            this.getControl("pTouch").setSwallowTouches(true);

            this.pMiniRank.setPositionX(this.pMiniRank.defaultPos.x + this.pMiniRank.getContentSize().width);
            this.pMiniRank.runAction(cc.moveTo(0.5, this.pMiniRank.defaultPos).easing(cc.easeBackOut()));
            this.timeOpenMiniRank = NewRankMiniGUI.TIME_CLOSE_MINI_RANK * 1000;

            if (this.myRankIdx != -1) {
                var myRankIdx = NewRankData.getInstance().getMyRankPosition(true);
                if (this.myRankIdx == myRankIdx) {
                    this.pMiniRank.runAction(cc.sequence(
                        cc.delayTime(0.5),
                        cc.callFunc(function(){this.scrollToIdx(myRankIdx, 0.5);}.bind(this)),
                        cc.delayTime(0.5),
                        cc.callFunc(function(){
                            this.getControl("pTouch").setSwallowTouches(false);
                            this.timeOpenMiniRank = NewRankMiniGUI.TIME_CLOSE_MINI_RANK * 1000;
                        }.bind(this))
                    ));
                }
                else{
                    var oldIdx = this.myRankIdx;
                    this.myRankIdx = myRankIdx;
                    this.pMiniRank.runAction(cc.sequence(
                        cc.callFunc(function(){ this.jumpToIdx(oldIdx); }.bind(this)),
                        cc.callFunc(function(){ this.effectRankChange(oldIdx, myRankIdx); }.bind(this))
                    ));
                }
            }
        }
        else{
            this.pMiniRank.runAction(
                cc.moveTo(0.5, this.pMiniRank.defaultPos.x + this.pMiniRank.getContentSize().width, this.pMiniRank.defaultPos.y).easing(cc.easeBackIn())
            );
        }
        this.isOpening = isShow;
        this.btnClose.setVisible(isShow);
    },

    showExpChange: function (expChange, positionChange) {
        if (expChange === 0) {
            this.txtExpChange.setVisible(false);
            this.pArrow.removeAllChildren();
            return;
        }

        this.txtExpChange.setVisible(true);
        this.txtExpChange.setString("+" + StringUtility.pointNumber(expChange) + " EXP");
        this.txtExpChange.setOpacity(255);
        this.txtExpChange.setPositionY(this.txtExpChange.defaultPos.y - 20);
        this.txtExpChange.runAction(cc.spawn(
            cc.moveTo(1.5, this.txtExpChange.defaultPos.x, this.txtExpChange.defaultPos.y + 20),
            cc.sequence(
                cc.delayTime(1),
                cc.fadeOut(0.5),
                cc.hide()
            )
        ));

        if (positionChange === 0) return;
        var pArrowSize = this.pArrow.getContentSize();
        var actionMove = cc.moveBy(0.75, 0, pArrowSize.height * 2);
        var spriteName, posY, actionRun;
        if (positionChange > 0) { // bi tut hang
            spriteName = "#iconDownLevel.png";
            posY = pArrowSize.height * 1.5;
            actionRun = actionMove.reverse();
        } else {
            spriteName = "#iconUpLevel.png";
            posY = -pArrowSize.height * 0.5;
            actionRun = actionMove;
        }
        for (var i = 0; i < 10; i++) {
            var icon = new cc.Sprite(spriteName);
            icon.setPositionY(posY);
            icon.setScale(0.7);
            icon.setPositionX(pArrowSize.width * Math.random());
            this.pArrow.addChild(icon);
            icon.runAction(cc.sequence(
                cc.delayTime(0.1 * i),
                actionRun.clone(),
                cc.removeSelf()
            ));
        }
    },

    updateDetailRankInfo: function (forceUpdateIdx) {
        this.data = NewRankData.getInstance().getDataCurWeek();
        if (!this.data){
            this.data = {};
            this.data.topUser = [];
            this.data.weekLevel = 0;
            this.data.isOpening = false;
            this.data.size = 0;
        }
        if (this.myRankIdx < 0 || this.myRankIdx >= this.data.size)
            this.myRankIdx = -1;

        if (this.data.size == 0 && !this.data.isOpening) return;
        for (var i = 0; i < this.data.topUser.length; i++) {
            var info = this.data.topUser[i];
            if (info.isUser && info.userId == gamedata.getUserId()) {
                this.myRankInfoCell.updateInfo(info, this.data.size, this.data.weekLevel, false);
                this.myRankInfoCell._layout.setPositionY(0);
                if (forceUpdateIdx || this.myRankIdx == -1) this.myRankIdx = info.idx;
            }
        }

        this.sTableRank.unscheduleAllCallbacks();
        this.sTableRank.reloadData();
    },

    effectRankChange: function(oldIdx, curIdx){
        if (oldIdx < 0) oldIdx = 0;
        if (oldIdx >= this.data.size) oldIdx = this.data.size - 1;
        if (oldIdx == curIdx || oldIdx == -1) return;

        var startPos = this.pTable.convertToNodeSpace(this.indexToPosition(oldIdx));
        var endPos = this.pTable.convertToNodeSpace(this.indexToPosition(curIdx));
        var cellHeight = this.myRankInfoCell.bg.getContentSize().height + NewRankGUI.PADDING_CELL;

        this.myRankInfoCell.setPosition(startPos);
        this.myRankInfoCell.setScale(1);
        this.myRankInfoCell.stopAllActions();
        this.myRankInfoCell.runAction(cc.sequence(
            cc.show(),
            cc.callFunc(function(){
                this.schedule(this.hideCurCell);
                var offset = (oldIdx - curIdx) / Math.abs(oldIdx - curIdx);
                var idx = oldIdx;
                while(idx != curIdx){
                    var cell = this.sTableRank.cellAtIndex(idx);
                    if (cell){
                        cell._layout.setPositionY(cell._layout.getPositionY() + offset * cellHeight);
                        cell._layout.stopAllActions();
                        cell._layout.runAction(cc.sequence(
                            cc.delayTime(0.5),
                            cc.moveTo(0.25, cell._layout.getPositionX(), cell._layout.getPositionY() - offset * cellHeight)
                        ));
                    }
                    idx -= offset;
                }
            }.bind(this)),
            cc.delayTime(0.5),
            cc.scaleTo(0.25, 1.1),
            cc.callFunc(function(){
                this.scrollToIdx(curIdx, 0.5);
            }.bind(this)),
            cc.moveTo(0.5, endPos),
            cc.scaleTo(0.25, 1),
            cc.hide(),
            cc.callFunc(function(){
                this.unschedule(this.hideCurCell);
                this.showCurCell();
                this.getControl("pTouch").setSwallowTouches(false);
                this.timeOpenMiniRank = NewRankMiniGUI.TIME_CLOSE_MINI_RANK * 1000;
            }.bind(this))
        ));
    },

    indexToPosition: function(idx){
        var cellHeight = this.myRankInfoCell.bg.getContentSize().height + NewRankGUI.PADDING_CELL;
        var tableHeight = this.sTableRank.getViewSize().height;
        var tableWidth = this.sTableRank.getViewSize().width;
        var tableInnerHeight = this.sTableRank.getContentSize().height;
        if (tableHeight < tableInnerHeight){
            var cellY = (this.data.topUser.length - idx - 1 + 1/2) * cellHeight;
            if (cellY <= tableHeight/2) return this.sTableRank.convertToWorldSpace(cc.p(tableWidth/2, cellY));
            if (cellY >= tableInnerHeight - tableHeight/2) return this.sTableRank.convertToWorldSpace(cc.p(tableWidth/2, tableHeight - (tableInnerHeight - cellY)));
            return this.sTableRank.convertToWorldSpace(cc.p(tableWidth/2, tableHeight/2));
        }
        else{
            var cellY = (this.data.topUser.length - idx - 1 + 1/2) * cellHeight + tableHeight - tableInnerHeight;
            return this.sTableRank.convertToWorldSpace(cc.p(tableWidth/2, cellY));
        }
    },

    hideCurCell: function(){
        var cell = this.sTableRank.cellAtIndex(this.myRankIdx);
        if (cell) cell.setVisible(false);
    },

    showCurCell: function(){
        var cell = this.sTableRank.cellAtIndex(this.myRankIdx);
        if (cell) cell.setVisible(true);
    },

    tableCellAtIndex: function(table, idx){
        var cell = table.dequeueCell();
        if (!cell){
            cell = new NewRankPersonalInfoCell(true);
            cell._layout.setPositionX(this.sTableRank.getViewSize().width/2);
        }
        cell.setVisible(true);
        cell._layout.stopAllActions();
        cell.updateInfo(this.data.topUser[idx], this.data.size, this.data.weekLevel, false);
        return cell;
    },

    tableCellSizeForIndex: function(){
        return cc.size(this.sTableRank.getViewSize().width, this.myRankInfoCell.bg.getContentSize().height + NewRankGUI.PADDING_CELL);
    },

    numberOfCellsInTableView: function(){
        if (this.data) return this.data.topUser.length;
        else return 0;
    },

    scrollToIdx: function(idx, time){
        var tableHeight = this.sTableRank.getViewSize().height;
        var tableInnerHeight = this.sTableRank.getContentSize().height;
        var cellY = (this.data.topUser.length - idx - 1 + 1/2) * this.tableCellSizeForIndex(null, 0).height;
        if (tableHeight < tableInnerHeight) {
            var offset = tableInnerHeight - cellY - tableHeight / 2;
            var totalOffset = tableInnerHeight - tableHeight;
            var percent = offset / totalOffset;
            percent = 1 - Math.min(1, Math.max(0, percent));
            this.sTableRank.setContentOffsetInDuration(cc.p(0, this.sTableRank.minContainerOffset().y * percent), time);
        }
    },

    jumpToIdx: function(idx){
        var tableHeight = this.sTableRank.getViewSize().height;
        var tableInnerHeight = this.sTableRank.getContentSize().height;
        var cellY = (this.data.topUser.length - idx - 1 + 1/2) * this.tableCellSizeForIndex(null, 0).height;
        if (tableHeight < tableInnerHeight) {
            var offset = tableInnerHeight - cellY - tableHeight / 2;
            var totalOffset = tableInnerHeight - tableHeight;
            var percent = offset / totalOffset;
            percent = 1 - Math.min(1, Math.max(0, percent));
            this.sTableRank.setContentOffset(cc.p(0, this.sTableRank.minContainerOffset().y * percent));
        }
    },

    update: function (dt) {
        if (this.isOpening && !this.isHolding) {
            this.timeOpenMiniRank -= dt * 1000;
            if (this.timeOpenMiniRank < 0) {
                this.showMiniRank(false);
            }
        }
    }
});

NewRankMiniGUI.className = "NewRankMiniGUI";
NewRankMiniGUI.TIME_CLOSE_MINI_RANK = 3;
NewRankMiniGUI.BTN_CLOSE = 0;
NewRankMiniGUI.BTN_MINI_RANK = 1;
NewRankMiniGUI.BTN_TEST = 2;

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
        dataRankLastWeek.userId = gamedata.getUserId();
        dataRankLastWeek.userName = gamedata.getUserName();
        dataRankLastWeek.avatar = gamedata.getUserAvatar();
        dataRankLastWeek.goldWin = dataLastWeek["goldWinLastWeek"];
        dataRankLastWeek.idx = dataLastWeek["rankIdx"];
        dataRankLastWeek.isUser = true;
        this.infoWin.updateInfo(dataRankLastWeek);
        this.infoNoWin.updateInfo(dataRankLastWeek);
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