var RankGUI = BaseLayer.extend({
    ctor: function () {
        this._super();

        this.data = null;
        this.myRankIdx = -1;
        this.isCurWeek = false;
        this.isTopRank = false;

        this.timeRemainCurWeek = 0;
        this.timeAddDecor = 0;
        this.isRunningEffect = false;

        this.initWithBinaryFile("RankGUI.json");
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
        this.pCurLevel.imgRankTitle = this.getControl("imgRankTitle", this.pCurLevel);
        this.pCurLevel.imgRankTitle.ignoreContentAdaptWithSize(true);
        this.pCurLevel.pLayer = this.getControl("pLayer", this.pCurLevel);
        var processBg = this.getControl("processBg", this.pCurLevel);
        this.pCurLevel.process = this.getControl("processImg", processBg);
        this.pCurLevel.txtProcess = this.getControl("txtProcess", processBg);
        this.pCurLevel.txtProcess.ignoreContentAdaptWithSize(true);
        this.pCurLevel.iconCup = this.getControl("iconCup", processBg);

        //pNextLevel
        this.pNextLevel = this.getControl("pNextLevel", this.bg);
        this.pNextLevel.imgRank = this.getControl("imgNextRank", this.pNextLevel);
        this.pNextLevel.imgRankTitle = this.getControl("imgRankTitle", this.pNextLevel);
        this.pNextLevel.imgRankTitle.ignoreContentAdaptWithSize(true);
        this.pNextLevel.level = this.getControl("level", this.pNextLevel.imgRank);
        this.pNextLevel.level.ignoreContentAdaptWithSize(true);
        this.pNextLevel.txtRank = this.getControl("nameNextRank", this.pNextLevel);
        this.btnTooltip = this.customButton("btnTooltip", RankGUI.BTN_TOOLTIP, this.pNextLevel);

        //max rank
        this.txtMaxRank = this.getControl("txtMaxRank", this.bg);
        this.txtMaxRank.setVisible(false);

        //reset time
        this.txtLabelTime = this.getControl("txtLabelTime", this.bg);
        this.txtTime = this.getControl("txtTime", this.bg);
        this.txtTime.ignoreContentAdaptWithSize(true);

        this.title = this.bg.getChildByName("title");
        this.title.setOpacity(0);
        this.btnIndividual = this.customButton("btnIndividual", RankGUI.BTN_INDIVIDUAL, this.bg);
        this.btnIndividual.setPressedActionEnabled(false);
        this.btnTop = this.customButton("btnTop", RankGUI.BTN_TOP, this.bg);
        this.btnTop.setPressedActionEnabled(false);
        this.btnClose = this.customButton("btnClose", RankGUI.BTN_CLOSE, this.bg);
        this.btnCheat = this.customButton("btnCheat", RankGUI.BTN_CHEAT, this.title);
        this.btnCheat.setTouchEnabled(Config.ENABLE_CHEAT);

        this.titleTop = db.DBCCFactory.getInstance().buildArmatureNode("Huychuong");
        this.titleTop.setScale(RankData.TEMPORARY_SCALE);
        this.txtTop = db.DBCCFactory.getInstance().buildArmatureNode("Title_thanbai");
        this.txtTop.setScale(RankData.TEMPORARY_SCALE);
        if (this.titleTop && this.txtTop) {
            this.bg.addChild(this.titleTop, 3);
            this.titleTop.setPosition(this.title.getPositionX() - 135 * RankData.TEMPORARY_SCALE, this.title.getPositionY());
            this.titleTop.gotoAndPlay("1", 0, -1, 0);

            this.bg.addChild(this.txtTop, 3);
            this.txtTop.setPosition(this.title.getPositionX() + 29 * RankData.TEMPORARY_SCALE, this.title.getPositionY() + 4);
            this.txtTop.gotoAndPlay("1", 0, -1, 0);
        }

        this.titleIndividual = db.DBCCFactory.getInstance().buildArmatureNode("Cup");
        this.titleIndividual.setScale(RankData.TEMPORARY_SCALE);
        this.txtIndividual = db.DBCCFactory.getInstance().buildArmatureNode("Title_canhan");
        this.txtIndividual.setScale(RankData.TEMPORARY_SCALE);
        if (this.titleIndividual && this.txtIndividual) {
            this.bg.addChild(this.titleIndividual, 3);
            this.titleIndividual.setPosition(this.title.getPositionX() - 130 * RankData.TEMPORARY_SCALE, this.title.getPositionY() - 3);
            this.titleIndividual.gotoAndPlay("1", 0, -1, 0);

            this.bg.addChild(this.txtIndividual, 3);
            this.txtIndividual.setPosition(this.title.getPositionX() + 26 * RankData.TEMPORARY_SCALE, this.title.getPositionY() + 3);
            this.txtIndividual.gotoAndPlay("1", 0, -1, 0);
        }

        //table
        this.pTableRank = this.getControl("pTableRank", this.bg);
        this.pTableRank.setTouchEnabled(false);

        this.bgTableRank = this.getControl("bgTableRank", this.pTableRank);
        this.bgTableRank.ignoreContentAdaptWithSize(true);
        this.bgTableRankTop = this.getControl("bgTableRankTop", this.pTableRank);
        this.bgTableRankTop.img = this.getControl("img", this.pTableRank);

        this.txtTitleRank = this.getControl("txtTitleRank");
        this.txtTitleUser = this.getControl("txtTitleUser");
        this.txtTitleResult = this.getControl("txtTitleResult");
        this.txtTitleGift = this.getControl("txtTitleGift");

        this.bgCount = this.getControl("bgCount", this.pTableRank);
        this.bgCount.txtCount = this.getControl("txtCount", this.bgCount);
        this.bgCount.txtCount.ignoreContentAdaptWithSize(true);

        this.btnCurWeek = this.customButton("btnThisWeek", RankGUI.BTN_CUR_WEEK, this.pTableRank);
        this.btnCurWeek.setPressedActionEnabled(false);
        this.btnLastWeek = this.customButton("btnLastWeek", RankGUI.BTN_LAST_WEEK, this.pTableRank);
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
        this.myRankInfoBot = new RankPersonalInfoCell(false);
        this.psTableRank.addChild(this.myRankInfoBot);
        this.myRankInfoBot.setPosition(myRankInfoBot.getPosition());
        this.myRankInfoBot.setVisible(false);

        var myRankInfoTop = this.psTableRank.getChildByName("myRankInfoTop");
        myRankInfoTop.setVisible(false);
        this.myRankInfoTop = new RankPersonalInfoCell(false);
        this.psTableRank.addChild(this.myRankInfoTop);
        this.myRankInfoTop.setPosition(myRankInfoTop.getPosition());
        this.myRankInfoTop.setVisible(false);

        this.pCheat = this.getControl("pCheat");
        this.pCheat.setVisible(false);
        this.txtCheatGold = this.getControl("txtCheatGold", this.pCheat);
        this.customButton("btnCheatAddGoldWin", RankGUI.BTN_CHEAT_ADD_GOLD_WIN, this.pCheat);
        this.customButton("btnCheatSubGoldWin", RankGUI.BTN_CHEAT_SUB_GOLD_WIN, this.pCheat);
        this.txtCheatCup = this.getControl("txtCheatCup", this.pCheat);
        this.txtCheatMedal2 = this.getControl("txtCheatMedal2", this.pCheat);
        this.txtCheatMedal1 = this.getControl("txtCheatMedal1", this.pCheat);
        this.txtCheatMedal0 = this.getControl("txtCheatMedal0", this.pCheat);
        this.customButton("btnCheatInfo", RankGUI.BTN_CHEAT_INFO, this.pCheat);
        this.customButton("btnEfxResult", RankGUI.BTN_CHEAT_EFX_RESULT, this.pCheat);
        this.customButton("btnMiniRank", RankGUI.BTN_CHEAT_MINI_RANK, this.pCheat);

        this.animLightBg = db.DBCCFactory.getInstance().buildArmatureNode("LightBg");
        if (this.animLightBg) {
            this.pCurLevel.addChild(this.animLightBg, -1, -1);
            this.animLightBg.setPosition(130, 100);
            this.animLightBg.gotoAndPlay("1", 0, -1, 9999);
            this.animLightBg.setScale(RankData.TEMPORARY_SCALE);
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

        this.bgTableRankTop.stopAllActions();
        this.bgTableRankTop.setContentSize(0, 0);
        this.bgTableRankTop.img.stopAllActions();
        this.bgTableRankTop.img.setOpacity(0);

        this.enableFog();

        //update gui
        this.updateCurRank(RankData.getInstance().getCurRankInfo());
        this.onButtonRelease(this.btnIndividual, RankGUI.BTN_INDIVIDUAL);
        this.effectChangeButton(this.btnTop, this.btnIndividual, 0);
        this.checkOpenResultLastWeek();
        this.scheduleUpdate();

        //log num open gui
        var numberOpenGUI = cc.sys.localStorage.getItem(RankData.KEY_SAVE_NUMBER_OPEN_GUI);
        numberOpenGUI = parseInt(numberOpenGUI) + 1;
        cc.sys.localStorage.setItem(RankData.KEY_SAVE_NUMBER_OPEN_GUI, numberOpenGUI ? numberOpenGUI : 1);

        //update data
        var cmdRankInfoCurWeek = new CmdSendGetWeekRank();
        cmdRankInfoCurWeek.putData(1);
        RankGameClient.getInstance().sendPacket(cmdRankInfoCurWeek);
        cmdRankInfoCurWeek.clean();

        var cmdRankInfoLastWeek = new CmdSendGetWeekRank();
        cmdRankInfoLastWeek.putData(0);
        RankGameClient.getInstance().sendPacket(cmdRankInfoLastWeek);
        cmdRankInfoLastWeek.clean();

        var cmdGetTopUsers = new CmdSendGetTopUsers();
        cmdGetTopUsers.putData();
        RankGameClient.getInstance().sendPacket(cmdGetTopUsers);
        cmdGetTopUsers.clean();
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case RankGUI.BTN_CLOSE: {
                if (!this.isRunningEffect) {
                    this.onClose();
                }
                break;
            }
            case RankGUI.BTN_CUR_WEEK:
            case RankGUI.BTN_LAST_WEEK: {
                var isCurWeek = id === RankGUI.BTN_CUR_WEEK;
                var textureCurWeek = "Ranking/btnThisWeek" + (isCurWeek ? "" : "Inactive") + ".png";
                var textureLastWeek = "Ranking/btnLastWeek" + (isCurWeek ? "Inactive" : "") + ".png";
                this.btnCurWeek.loadTextures(textureCurWeek, textureCurWeek, "", ccui.Widget.LOCAL_TEXTURE);
                this.btnLastWeek.loadTextures(textureLastWeek, textureLastWeek, "", ccui.Widget.LOCAL_TEXTURE);
                this.btnCurWeek.setTouchEnabled(!isCurWeek);
                this.btnLastWeek.setTouchEnabled(isCurWeek);
                this.updateDetailRankInfo(isCurWeek);
                break;
            }
            case RankGUI.BTN_INDIVIDUAL:
            {
                this.effectChangeButton(this.btnTop, this.btnIndividual);
                this.title.loadTexture("titleIndividual.png", ccui.Widget.LOCAL_TEXTURE);
                this.titleIndividual.setVisible(true);
                this.txtIndividual.setVisible(true);
                this.titleIndividual.stopAllActions();
                this.titleIndividual.runAction(cc.spawn(cc.scaleTo(0.25, 1.5).easing(cc.easeBackOut()), cc.fadeIn(0.25)));
                this.txtIndividual.stopAllActions();
                this.txtIndividual.runAction(cc.spawn(cc.scaleTo(0.25, 1.5).easing(cc.easeExponentialOut()), cc.fadeIn(0.25)));
                this.titleTop.setVisible(false);
                this.txtTop.setVisible(false);
                this.titleTop.stopAllActions();
                this.titleTop.setScale(0);
                this.titleTop.setOpacity(0);
                this.txtTop.stopAllActions();
                this.txtTop.setScale(0, 1);
                this.txtTop.setOpacity(0);

                this.txtTitleRank.setTextColor(cc.color("9C8ABF"));
                this.txtTitleUser.setTextColor(cc.color("9C8ABF"));
                this.txtTitleResult.setTextColor(cc.color("9C8ABF"));
                this.txtTitleGift.setTextColor(cc.color("9C8ABF"));
                this.bgCount.stopAllActions();
                this.bgCount.runAction(cc.spawn(cc.scaleTo(0.25, 1, 1).easing(cc.easeExponentialOut()), cc.fadeIn(0.25)));

                this.updateBackground(false);
                this.updateButtonTopRight(false);
                this.onButtonRelease(this.btnCurWeek, RankGUI.BTN_CUR_WEEK);
                break;
            }
            case RankGUI.BTN_TOP:
                this.effectChangeButton(this.btnIndividual, this.btnTop);
                this.title.loadTexture("titleTop.png", ccui.Widget.LOCAL_TEXTURE);
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
                this.titleTop.runAction(cc.spawn(cc.scaleTo(0.25, 1.5).easing(cc.easeBackOut()), cc.fadeIn(0.25)));
                this.txtTop.stopAllActions();
                this.txtTop.runAction(cc.spawn(cc.scaleTo(0.25, 1.5).easing(cc.easeExponentialOut()), cc.fadeIn(0.25)));

                this.txtTitleRank.setTextColor(cc.color("B9AAE3"));
                this.txtTitleUser.setTextColor(cc.color("B9AAE3"));
                this.txtTitleResult.setTextColor(cc.color("B9AAE3"));
                this.txtTitleGift.setTextColor(cc.color("B9AAE3"));
                this.bgCount.stopAllActions();
                this.bgCount.runAction(cc.spawn(cc.scaleTo(0.25, 1, 0).easing(cc.easeExponentialIn()), cc.fadeOut(0.25)));

                this.updateBackground(true);
                this.updateButtonTopRight(true);
                this.updateTopRankInfo();
                break;
            case RankGUI.BTN_CHEAT:
                if (Config.ENABLE_CHEAT)
                    this.pCheat.setVisible(!this.pCheat.isVisible());
                break;
            case RankGUI.BTN_CHEAT_ADD_GOLD_WIN: {
                var cheatGoldWin = new CmdSendCheatGoldWin();
                var goldWin = parseInt(this.txtCheatGold.getString()) || 0;
                cheatGoldWin.putData(goldWin);
                RankGameClient.getInstance().sendPacket(cheatGoldWin);
                cheatGoldWin.clean();
                break;
            }
            case RankGUI.BTN_CHEAT_SUB_GOLD_WIN: {
                var cheatGoldWin = new CmdSendCheatGoldWin();
                var goldWin = parseInt(this.txtCheatGold.getString()) || 0;
                cheatGoldWin.putData(-goldWin);
                RankGameClient.getInstance().sendPacket(cheatGoldWin);
                cheatGoldWin.clean();
                break;
            }
            case RankGUI.BTN_CHEAT_INFO: {
                cc.log("BTN_CHEAT_INFO");
                var cheatInfo = new CmdSendCheatRankInfo();
                var cup = this.txtCheatCup.getString() || 0;
                var goldMedal = this.txtCheatMedal2.getString() || 0;
                var silverMedal = this.txtCheatMedal1.getString() || 0;
                var bronzeMedal = this.txtCheatMedal0.getString() || 0;
                cheatInfo.putData(cup, goldMedal, silverMedal, bronzeMedal);
                RankGameClient.getInstance().sendPacket(cheatInfo);
                cheatInfo.clean();
                break;
            }
            case RankGUI.BTN_CHEAT_EFX_RESULT: {
                // this.runEffectChangeCup(1000, 3000, 3, 8);

                var gui = sceneMgr.openGUI(RankResultGUI.className, RankResultGUI.TAG, RankResultGUI.TAG, false);
                // var dataTruCup = {
                //     cup: 2500,
                //     oldCup: 21000,
                //     offlineWeek: 5
                // };
                // gui.updateInfoTruCup(dataTruCup);

                var resultLastWeek = {
                    oldCup: 1000,
                    cup: 1500,
                    goldGift: 25000,
                    packId: 0,
                    rankIdx: 10,
                    goldWinLastWeek: 15000,
                    silverMedal: 1,
                    bronzeMedal: 5,
                    goldMedal: 2
                };
                gui.updateResult(resultLastWeek);

                break;
            }
            case RankGUI.BTN_CHEAT_MINI_RANK: {
                RankData.addMiniRankGUI(true);
                // RankData.showMiniRankGUI(true);
                break;
            }
            case RankGUI.BTN_TOOLTIP: {
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

        var rankPointNeed = RankData.getRankPointNeed(rank);
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
            this.pNextLevel.setVisible(rank <= RankData.MAX_RANK);
            this.txtMaxRank.setVisible(!this.pNextLevel.isVisible());
            if (rank > RankData.MAX_RANK) {
                return;
            }
            else if (rank < RankData.MAX_RANK){
                panel.imgRank.setPositionY(panel.imgRank.defaultPos.y);
                panel.txtRank.setPositionY(panel.txtRank.defaultPos.y);
            }
            else{
                panel.imgRank.setPositionY(panel.imgRank.defaultPos.y + 5);
                panel.txtRank.setPositionY(panel.txtRank.defaultPos.y + 5);
            }

            var texture = RankData.getRankImg(rank);
            panel.imgRank.loadTexture(texture, ccui.Widget.LOCAL_TEXTURE);
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
                animRank.setScale(RankData.TEMPORARY_SCALE);
            }
            panel.imgRank.setScale(1);
        }

        panel.level.setVisible(rank < RankData.MAX_RANK);
        var levelTexture = RankData.getRankLevelImg(rank);
        panel.level.loadTexture(levelTexture, ccui.Widget.LOCAL_TEXTURE);
        panel.txtRank.setString(RankData.getRankName(rank));
        panel.imgRankTitle.loadTexture(RankData.getRankNameImg(rank));
    },

    updateDetailRankInfo: function (isCurWeek) {
        this.isCurWeek = isCurWeek;
        this.myRankIdx = -1;
        this.isTopRank = false;
        this.data = isCurWeek ? RankData.getInstance().getDataCurWeek() : RankData.getInstance().getDataLastWeek();
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
                this.txtTooLate.img.loadTexture("imgTimeUp.png", ccui.Widget.LOCAL_TEXTURE);
                this.txtTooLate.setString(localized("NEW_RANK_TIME_OUT"));
                ccui.Helper.doLayout(this.txtTooLate);
                return;
            }
            else{
                this.txtLabelTime.setVisible(true);
                this.txtTime.setVisible(true);
                this.bgCount.setVisible(true);
                var numGamePlayed = RankData.getNumGamePlayed();
                this.bgCount.txtCount.setString(numGamePlayed + "/" + RankData.MAX_GAME_PER_DAY);
                this.bgCount.txtCount.setTextColor(numGamePlayed == RankData.MAX_GAME_PER_DAY ? cc.color("#FF5B5B") : cc.color("#50D685"));
            }

            for (var i = 0; i < this.data.topUser.length; i++){
                var info = this.data.topUser[i];
                if (info.isUser && info.userId == userMgr.getUID())
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
        this.data = RankData.getInstance().getTopUsersData();
        if (this.data){
            this.data.weekLevel = RankData.MAX_RANK;
            this.data.size = this.data.topUser.length;
        }
        else{
            this.data = {};
            this.data.topUser = [];
            this.data.weekLevel = RankData.MAX_RANK;
            this.data.size = 0;
        }

        if (this.data.size == 0){
            this.pTable.setVisible(false);
            this.txtTooLate.setVisible(true);
            this.txtTooLate.img.loadTexture("imgNotOpen.png", ccui.Widget.LOCAL_TEXTURE);
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
            cell = new RankPersonalInfoCell(false);
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
        var bgTexture = RankPersonalInfoCell.getBgTexture(
            this.isTopRank,
            userData.isUser,
            userData.isUser && userData.userId === userMgr.getUID(),
            idx
        );
        var bg = new ccui.ImageView("Ranking/" + bgTexture, ccui.Widget.LOCAL_TEXTURE);
        cc.log("tableCellSizeForIndex", idx);
        return cc.size(this.sTableRank.getViewSize().width, bg.height + RankGUI.PADDING_CELL);
    },

    numberOfCellsInTableView: function(){
        if (this.data) return this.data.topUser.length;
        else return 0;
    },
    /* end region */

    /* region Effect Update Rank */
    checkOpenResultLastWeek: function () {
        var resultLastWeek = RankData.getInstance().getDataResultLastWeek();
        if (!!resultLastWeek) {
            this.runAction(cc.sequence(
                cc.delayTime(1.5),
                cc.callFunc(function () {
                    var gui = sceneMgr.getGUI(RankResultGUI.TAG);
                    if (!gui) {
                        gui = sceneMgr.openGUI(RankResultGUI.className, RankResultGUI.TAG, RankResultGUI.TAG, false);
                    }
                    gui.updateResult(resultLastWeek);
                })
            ));
            this.updateFakeRankWithLastWeekData(resultLastWeek["oldCup"]);
        } else {
            this.updateFakeRankWithLastWeekData(RankData.getInstance().getNumberOldCup());
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
        if (RankData.getInstance().getNumberCupChange() === 0) {
            var dataTruCup = RankData.getInstance().getDataTruCup();
            if (!!dataTruCup) {
                oldRank = RankData.getRankByCup(dataTruCup["oldCup"]);
                dataLastWeek = RankData.getInstance().getDataLastWeek();
                if (dataLastWeek && dataLastWeek.size > 0) {
                    oldRank = dataLastWeek.weekLevel;
                }
                oldRankInfo = {rank: oldRank, rankPoint: dataTruCup["oldCup"]};
                this.updateCurRank(oldRankInfo);

                this.runAction(cc.sequence(
                    cc.delayTime(1.5),
                    cc.callFunc(function () {
                        var gui = sceneMgr.getGUI(RankResultGUI.TAG);
                        if (!gui) {
                            gui = sceneMgr.openGUI(RankResultGUI.className, RankResultGUI.TAG, RankResultGUI.TAG, false);
                        }
                        gui.updateInfoTruCup(dataTruCup);
                    })
                ));
            }
            return;
        }

        var rankInfo = RankData.getInstance().getCurRankInfo();
        if (cup === rankInfo.rankPoint) {
            return;
        }
        oldRank = RankData.getRankByCup(cup);
        dataLastWeek = RankData.getInstance().getDataLastWeek();
        if (dataLastWeek && dataLastWeek.size > 0) {
            oldRank = dataLastWeek.weekLevel;
        }
        oldRankInfo = {rank: oldRank, rankPoint: cup};
        this.updateCurRank(oldRankInfo);
    },

    effectUpdateCup: function () {
        var changeCup = RankData.getInstance().getNumberCupChange();
        if (changeCup === 0) {
            return;
        }

        var rankInfo = RankData.getInstance().getCurRankInfo();
        var oldRankPoint = RankData.getInstance().getNumberOldCup();
        var curRankPoint = rankInfo.rankPoint;
        if (curRankPoint === oldRankPoint) {
            return;
        }
        var oldRank = RankData.getRankByCup(oldRankPoint);
        var dataLastWeek = RankData.getInstance().getDataLastWeek();
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
            var nowRank = RankData.getRankByCup(nowPoint);
            var rankPointNeed = RankData.getRankPointNeed(nowRank);
            var percent = nowPoint / rankPointNeed * 100;
            var strTarget = StringUtility.pointNumber(nowPoint) + "/" + StringUtility.pointNumber(rankPointNeed);
            if (nowRank >= RankData.MAX_RANK - 1) {
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
            if (condition && curRank < RankData.MAX_RANK) {
                var data2 = {target: this, rank: nowRank};
                actions.push(cc.callFunc(function () {
                    this.target.updateInfoRank(this.rank, false);
                }.bind(data2)));
                oldRank++;
            }
        }

        if (curRank < RankData.MAX_RANK || curRank !== oldRankSave) {
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
            RankData.getInstance().setNumberOldCup(curRankPoint);
            if (oldRankSave === curRank) {
                this.isRunningEffect = false;
            }
        }.bind(this)));

        this.pCurLevel.runAction(cc.sequence(actions));
    },

    effectDownLevel: function () {
        var rankInfo = RankData.getInstance().getCurRankInfo();
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
            RankData.getInstance().setNumberCupChange(0);
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
        var rankInfo = RankData.getInstance().getCurRankInfo();
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
                effect.setScale(RankData.TEMPORARY_SCALE);
            }
        }.bind(this), 400);

        curRankImg.runAction(cc.sequence(cc.spawn(actionMove, actionScale), cc.callFunc(function () {
            this.pCurLevel.imgRank.setVisible(false);
            if (gameSound.on)
                audioEngine.playEffect("res/Lobby/Ranking/soundLevelUp.mp3", false);
        }.bind(this)), cc.delayTime(0.4), actionScale2, actionScale3, cc.callFunc(function () {
            this.updateInfoRank(curRank, true);
            this.updateInfoRank(curRank, false);
            RankData.getInstance().setNumberCupChange(0);
            this.isRunningEffect = false;
        }.bind(this)), cc.hide(), cc.removeSelf(true)));
    },

    makeIconRank: function (curRank, isUpLevel) {
        var texture = RankData.getRankImg(curRank);
        var levelTexture = RankData.getRankLevelImg(curRank);
        var curRankSprite = new cc.Sprite(texture);
        var curLevelSprite = new cc.Sprite(levelTexture);
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
        curBtn.loadTextures(textureCurBtn, textureCurBtn, "", ccui.Widget.LOCAL_TEXTURE);
        nextBtn.loadTextures(textureNextBtn, textureNextBtn, "", ccui.Widget.LOCAL_TEXTURE);
        curBtn.setTouchEnabled(true);
        nextBtn.setTouchEnabled(false);
    },

    updateBackground: function(isTopRank) {
        var curSize = this.bgTableRankTop.getContentSize();
        var desSize = isTopRank ? this.bgTableRankTop.img.getContentSize() : cc.size(0, 0);
        this.bgTableRankTop.stopAllActions();
        var actions = [];
        var numAction = 25;
        for (var i = 0; i < numAction; i++){
            actions.push(cc.delayTime(0.25 / numAction));
            actions.push(cc.callFunc(function(idx){
                this.setContentSize(curSize.width + (desSize.width - curSize.width) / numAction * (idx + 1), curSize.height + (desSize.height - curSize.height) / numAction * (idx + 1))
                this.img.setPosition(0, this.getContentSize().height);
            }.bind(this.bgTableRankTop, i)))
        }
        this.bgTableRankTop.runAction(cc.sequence(actions));

        this.bgTableRankTop.img.stopAllActions();
        this.bgTableRankTop.img.runAction(cc.fadeTo(0.25, isTopRank ? 255 : 0));
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
            var dataLastWeek = RankData.getInstance().getDataLastWeek();
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
            case RankGUI.BTN_INDIVIDUAL:
                path = "btnIndividual";
                break;
            case RankGUI.BTN_TOP:
                path = "btnTop";
                break;
        }
        if (path != "")
            return "Ranking/" + path + (active ? "" : "Inactive") + ".png";
        else return "";
    },

    getInfoTooltip: function () {
        var rankInfo = RankData.getInstance().getCurRankInfo();
        if (!rankInfo || rankInfo.error) {
            return "";
        }

        if (rankInfo.rank >= RankData.MAX_RANK) {
            return "";
        }

        if (rankInfo.rank >= RankData.MAX_RANK - 1) {
            var maxRankName = RankData.getRankName(RankData.MAX_RANK);
            return StringUtility.replaceAll(localized("NEW_RANK_MAX_RANK_NEED"), "@maxRank", maxRankName);
        }

        var str1 = localized("NEW_RANK_NEXT_RANK_NEED");
        str1 = StringUtility.replaceAll(str1, "@nextRank", RankData.getRankName(rankInfo.rank + 1));
        var cupNeed = RankData.getRankPointNeed(rankInfo.rank) - rankInfo.rankPoint;
        str1 = StringUtility.replaceAll(str1, "@number", cupNeed);

        var rankConfig = RankData.getInstance().getRankConfig();
        var dataCurWeek = RankData.getInstance().getDataCurWeek();
        if (rankConfig && dataCurWeek && (dataCurWeek.isOpening || dataCurWeek.size > 0)) {
            var winCup = rankConfig["prize"]["winCup"];
            var positionNeed = -1;
            for (var i = winCup.length - 1; i >= 0; i--) {
                var cupThisPos = RankData.getCupWinLose(dataCurWeek.weekLevel, i, RankData.MAX_PLAYER_IN_ONE_TABLE);
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
            this.timeAddDecor = RankGUI.DELTA_TIME_ADD_DECOR;
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
        var strRemainTime = RankData.getTimeRemainStr(this.timeRemainCurWeek);
        this.txtTime.setString(strRemainTime);
    }
});

RankGUI.className = "RankGUI";
RankGUI.TAG = 49;
RankGUI.LOCAL_Z_ORDER = 49;

RankGUI.BTN_CLOSE = 0;
RankGUI.BTN_CUR_WEEK = 1;
RankGUI.BTN_LAST_WEEK = 2;
RankGUI.BTN_CHEAT_ADD_GOLD_WIN = 3;
RankGUI.BTN_CHEAT_SUB_GOLD_WIN = 4;
RankGUI.BTN_CHEAT_INFO = 5;
RankGUI.BTN_TOOLTIP = 6;
RankGUI.BTN_INDIVIDUAL = 7;
RankGUI.BTN_TOP = 8;
RankGUI.BTN_CHEAT = 9;
RankGUI.BTN_CHEAT_EFX_RESULT = 10;
RankGUI.BTN_CHEAT_MINI_RANK = 11;

RankGUI.PADDING_CELL = 3;
RankGUI.DELTA_TIME_ADD_DECOR = 1.6;

var ItemDecor = cc.Node.extend({
    ctor: function (panelHeight) {
        this._super();

        var randomIdx = Math.floor(Math.random() * 3.99);
        this.item = new cc.Sprite("res/Lobby/Ranking/iconLayer" + randomIdx + ".png");
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