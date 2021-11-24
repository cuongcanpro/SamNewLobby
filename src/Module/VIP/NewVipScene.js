var NewVipScene = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.currentPageOtherBenefit = 0;
        NewVipScene.isFollowCurrentLevel = true;
        this.initWithBinaryFile("Vip_MainGUI.json");
    },

    onEnterFinish: function () {
        this.checkConvertOldVip();
        NewVipManager.viewedNewVip();
        this.onUpdateVipInfo();
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        var targetLevel = (vipLevel < NewVipManager.NUMBER_VIP) ? vipLevel + 1 : vipLevel;
        this.updateCurrentBenefit(targetLevel);
        this.addOtherBenefit();

        this.pCheat.setVisible(false);
        this.btnCheat.setVisible(Config.ENABLE_CHEAT);

        var pTooltipWidth = this.pTooltip.getContentSize().width;
        this.pTooltip.setPositionX(this.pTooltip.defaultPos.x + pTooltipWidth);
        this.pTooltip.stopAllActions();
        this.pTooltip.runAction(cc.sequence(cc.delayTime(2), new cc.EaseBackOut(cc.moveBy(0.5, -pTooltipWidth, 0))));
        this.scheduleUpdate();
        NewVipScene.lastTimeInteract = 0;
        if (!cc.sys.isNative) {
            cc.eventManager.addListener(this.curListener, this.btnCurrPanel);
            cc.eventManager.addListener(this.nextListener, this.btnNextPanel);
        }
    },

    onExit: function () {
        this._super();
        this.unscheduleUpdate();
        this.currentPageOtherBenefit = 0;
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.getControl("pTopLeft");
        this.getControl("pTopRight");
        this.getControl("pBotRight");
        this.btnClose = this.customButton("btnClose", NewVipScene.BTN_BACK, this._layout, false);

        this.pTooltip = this.getControl("pTooltip");
        this.pTooltip.defaultPos = this.pTooltip.getPosition();

        this.btnHelp = this.customButton("btnHelp", NewVipScene.BTN_HELP);

        var panelUserInfo = this.getControl("panelUserInfo");
        this.lbUserName = this.getControl("lbUserName", panelUserInfo);
        this.lbUserName.ignoreContentAdaptWithSize(true);
        this.lbGold = this.getControl("lbGold", panelUserInfo);
        this.lbGold.ignoreContentAdaptWithSize(true);

        var bgAvatar = this.getControl("bgAvatar", panelUserInfo);
        this._imgAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        var size = bgAvatar.getContentSize();
        this._imgAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        bgAvatar.addChild(this._imgAvatar);
        var tempSprite = new cc.Sprite("Common/defaultAvatar.png");
        this._imgAvatar.setScale(size.height / tempSprite.getContentSize().height * 1.05);

        this.defaultFrame = this.getControl("border", panelUserInfo);
        this.avatarFrame = new UIAvatarFrame();
        this.avatarFrame.setPosition(cc.p(size.width / 2, size.height / 2));
        bgAvatar.addChild(this.avatarFrame);
        this.avatarFrame.setScale(0.44);

        this.customButton("btnAvatar", NewVipScene.BTN_AVATAR, panelUserInfo, false);
        this.customButton("btnShop", NewVipScene.BTN_GO_SHOP);

        this.pFlyItem = this.getControl("pFlyItem");
        this.pFlyItemLayer = new ItemFlyLayer(this.pFlyItem);
        this.pFlyItem.addChild(this.pFlyItemLayer);
        var panelHeight = this.pFlyItem.getContentSize().height;
        this.pFlyItemLayer.setDistance(panelHeight * 0.5, panelHeight * 0.25);

        this.pDetail = this.getControl("pDetail");
        this.iconTime = this.getControl("iconTime", this.pDetail);
        this.iconTime.labelTitleTime = this.getControl("labelTitleTime", this.iconTime);
        this.iconTime.labelTime = this.getControl("labelTime", this.iconTime);
        this.btnTooltip1 = this.customButton("btnTooltip1", NewVipScene.BTN_TOOLTIP_1, this.iconTime);
        this.imgVipFree = this.getControl("imgVipFree", this.pDetail);
        this.pDecorate = this.getControl("pDecorate", this.pDetail);
        this.imgVipBig = this.getControl("imgVipBig", this.pDetail);
        this.bgProgressVip = this.getControl("bgProgressExp", this.pDetail);
        this.btnTooltip2 = this.customButton("btnTooltip2", NewVipScene.BTN_TOOLTIP_2, this.bgProgressVip);
        this.progressVip = this.getControl("progressExp", this.bgProgressVip);
        this.imgVpoint = this.getControl("imgVpoint", this.progressVip);
        this.imgVpoint.setVisible(false);
        this.txtExp = this.getControl("txtExp", this.progressVip);
        var pExpNeed = this.getControl("pExpNeed", this.bgProgressVip);
        this.txtExpNeed2 = this.getControl("txtExpNeed2", pExpNeed);
        this.expNeed = this.getControl("expNeed", pExpNeed);

        var pLevelProcess = this.getControl("pLevelProcess");
        this.btnTooltip0 = this.customButton("btnTooltip0", NewVipScene.BTN_TOOLTIP_0, pLevelProcess);
        this.listVipLevelIcons = [];
        for (var i = 1; i <= NewVipManager.NUMBER_VIP; i++) {
            var vipLevel = this.getControl("level" + i, pLevelProcess);
            vipLevel.img = this.getControl("img", vipLevel);
            this.listVipLevelIcons.push(vipLevel);
        }
        this.bgCurrent = this.getControl("bgCurrent", pLevelProcess);

        var pBenefit = this.getControl("pBenefit");
        this.pCurrentBenefit = this.getControl("pCurrentBenefit", pBenefit);
        this.currentLevel = new DetailBenefit();
        this.pCurrentBenefit.addChild(this.currentLevel);
        this.btnCurrPanel = this.customButton("btnCurrPanel", NewVipScene.BTN_CURR_PANEL, this.pCurrentBenefit);
        this.btnCurrPanel.setLocalZOrder(1);

        this.pMid = this.getControl("pMid", pBenefit);

        this.pNextLevelBenefit = this.getControl("pNextLevelBenefit", pBenefit);
        this.btnPrevious = this.customButton("btnPrevious", NewVipScene.BTN_PREVIOUS_VIP, this.pNextLevelBenefit);
        this.btnPrevious.imgArrow = this.getControl("imgArrow", this.btnPrevious);
        this.btnNext = this.customButton("btnNext", NewVipScene.BTN_NEXT_VIP, this.pNextLevelBenefit);
        this.btnNext.imgArrow = this.getControl("imgArrow", this.btnNext);
        this.pageOtherBenefit = this.getControl("pageOtherBenefit", this.pNextLevelBenefit);
        this.btnNextPanel = this.customButton("btnNextPanel", NewVipScene.BTN_NEXT_PANEL, this.pNextLevelBenefit);
        this.btnNextPanel.setLocalZOrder(1);

        this.curListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                // cc.log("TOUCH BEGAN ");
                var select = event.getCurrentTarget();
                var pos = select.convertToWorldSpaceAR(cc.p(0, 0));
                var rect = cc.rect(pos.x - select.getContentSize().width / 2, pos.y, select.getContentSize().width, select.getContentSize().height);

                if (cc.rectContainsPoint(rect, touch.getLocation())) {
                    NewVipScene.isFollowCurrentLevel = true;
                    NewVipScene.lastTimeInteract = 0;
                }
                return false;
            },
            onTouchMoved: function (touch, event) {

            },
            onTouchEnded: function (touch, event) {

            }
        });
        cc.eventManager.addListener(this.curListener, this.btnCurrPanel);

        this.nextListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                // cc.log("TOUCH BEGAN ");
                var select = event.getCurrentTarget();
                var pos = select.convertToWorldSpaceAR(cc.p(0, 0));
                var rect = cc.rect(pos.x - select.getContentSize().width / 2, pos.y, select.getContentSize().width, select.getContentSize().height);

                if (cc.rectContainsPoint(rect, touch.getLocation())) {
                    NewVipScene.isFollowCurrentLevel = false;
                    NewVipScene.lastTimeInteract = 0;
                }
                return false;
            },
            onTouchMoved: function (touch, event) {

            },
            onTouchEnded: function (touch, event) {

            }
        });
        cc.eventManager.addListener(this.nextListener, this.btnNextPanel);

        this.pCheat = this.getControl("pCheat");

        this.btnCheat = this.customButton("btnCheat", NewVipScene.BTN_CHEAT);
        this.pOldCheat = this.getControl("pOldCheat", this.pCheat);
        this.pOldCheat.level = this.getControl("level", this.pOldCheat);
        this.pOldCheat.gstar = this.getControl("gstar", this.pOldCheat);
        this.pOldCheat.remainTime = this.getControl("remainTime", this.pOldCheat);
        this.customButton("btnCheatOld", NewVipScene.BTN_CHEAT_OLD);

        this.pNewCheat = this.getControl("pNewCheat", this.pCheat);
        this.pNewCheat.level = this.getControl("level", this.pNewCheat);
        this.pNewCheat.vPoint = this.getControl("vPoint", this.pNewCheat);
        this.pNewCheat.remainTime = this.getControl("remainTime", this.pNewCheat);
        this.customButton("btnCheatNew", NewVipScene.BTN_CHEAT_NEW);

        this.setBackEnable(true);
    },

    onUpdateVipInfo: function () {
        var levelVip = NewVipManager.getInstance().getVipLevel();
        for (var i = 0; i < NewVipManager.NUMBER_VIP; i++) {
            this.listVipLevelIcons[i].img.setOpacity(0);
            this.listVipLevelIcons[i].img.setScale(0);
        }

        var timeFadeIn = 0.2;
        for (var i = 0; i < levelVip; i++) {
            // this.listVipLevelIcons[i].img.setVisible(true);
            var imgVip = this.listVipLevelIcons[i].img;
            imgVip.runAction(cc.sequence(cc.delayTime(0.2 * i), cc.spawn(new cc.EaseBackOut(cc.scaleTo(timeFadeIn, 1)), cc.fadeIn(timeFadeIn))));
        }
        this.bgCurrent.setOpacity(0);
        this.bgCurrent.setScale(0);
        this.bgCurrent.runAction(cc.sequence(cc.delayTime(0.2 * levelVip), cc.spawn(new cc.EaseBackOut(cc.scaleTo(timeFadeIn, 1)), cc.fadeIn(timeFadeIn))));


        this.bgCurrent.setVisible(levelVip > 0);
        this.pDecorate.removeAllChildren(true);
        if (levelVip > 0) {
            this.bgCurrent.setPosition(this.listVipLevelIcons[levelVip - 1].getPosition());

            NewVipScene.addEffectIconVip(this.pDecorate, 1.5, 2, cc.p(0, 0), levelVip);
        }
        this.imgVipFree.setVisible(levelVip === 0);
        this.imgVipBig.setVisible(levelVip > 0);

        this.iconTime.setVisible(levelVip > 0);
        var titleTime = StringUtility.replaceAll(localized("VIP_SCENE_TEXT_0"), "@level", levelVip);
        this.iconTime.labelTitleTime.setString(titleTime);
        this.iconTime.labelTime.setString(NewVipManager.getRemainTimeString(NewVipManager.getInstance().getRemainTime()));

        this.bgProgressVip.setVisible(levelVip < NewVipManager.NUMBER_VIP);

        var strExpNeed2 = StringUtility.replaceAll(localized("VIP_SCENE_TEXT_1"), "@level", levelVip + 1);
        this.txtExpNeed2.setString(strExpNeed2);

        this.lbUserName.setString(gamedata.getDisplayName());
        this.lbGold.setString(StringUtility.pointNumber(gamedata.getUserGold()));
        this._imgAvatar.asyncExecuteWithUrl(gamedata.getUserId(), gamedata.getUserAvatar());
        if (this.avatarFrame){
            this.avatarFrame.reload();
            this.defaultFrame.setVisible(!this.avatarFrame.isShow());
        }

        var nextLevelExp = NewVipManager.getInstance().getVpointNeed(levelVip);
        var vpoint = NewVipManager.getInstance().getVpoint();
        this.expNeed.setString(StringUtility.pointNumber(nextLevelExp - vpoint));
        var txtTemp = BaseLayer.createLabelText(this.txtExpNeed2.getString());
        txtTemp.setFontSize(this.txtExpNeed2.getFontSize());
        this.expNeed.setPositionX(this.txtExpNeed2.getPositionX() + txtTemp.getContentSize().width);
        //
        // this.txtExp.setString(vpoint + " / " + nextLevelExp);
        //
        // var percent = vpoint / nextLevelExp * 100;
        // this.progressVip.setPercent(percent);
        // this.imgVpoint.setPositionX(this.bgProgressVip.getContentSize().width * percent / 100);
        NewVipScene.runEffectProgressVip(this.bgProgressVip, this.progressVip, this.txtExp, this.imgVpoint, 0.7, 0, vpoint, levelVip);
    },

    updateCurrentBenefit: function (targetLevel) {
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        this.currentLevel.setInfoBenefit(vipLevel, targetLevel);
        if (vipLevel >= NewVipManager.NUMBER_VIP) {
            this.pCurrentBenefit.setPositionX(this.pMid.getPositionX() - this.pMid.getContentSize().width / 2);
            this.pNextLevelBenefit.setVisible(false);
        } else {
            this.pCurrentBenefit.setPositionX(this.pCurrentBenefit.defaultPos.x);
            this.pNextLevelBenefit.setVisible(true);
        }
        var winSize = cc.director.getWinSize();
        var distance = winSize.width / 2;
        this.pCurrentBenefit.setPositionX(distance + this.pCurrentBenefit.defaultPos.x);
        var timeRun = 0.7;
        var timeDelay = this.pNextLevelBenefit.isVisible() ? timeRun + 0.3 : timeRun + 0.2;
        var actionMoveBack = cc.moveBy(timeRun, -distance, 0).easing(cc.easeBackOut());
        this.pCurrentBenefit.runAction(actionMoveBack);
        this.pNextLevelBenefit.setPositionX(distance + this.pNextLevelBenefit.defaultPos.x);
        this.pNextLevelBenefit.runAction(cc.sequence(cc.delayTime(0.1), actionMoveBack.clone()));
        this.currentLevel.scrollToEnd(1, true, timeDelay);
    },

    addOtherBenefit: function () {
        this.currentPageOtherBenefit = 0;
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        if (vipLevel >= NewVipManager.NUMBER_VIP) {
            return;
        }

        this.pageOtherBenefit.removeAllPages();
        for (var i = vipLevel + 1; i <= NewVipManager.NUMBER_VIP; i++) {
            var page = new ccui.Layout();
            page.detailBenefit = new DetailBenefit();
            page.addChild(page.detailBenefit);
            this.pageOtherBenefit.addPage(page);
            page.detailBenefit.setInfoBenefit(i, vipLevel);
        }
        // cc.log("addOtherBenefit: ", this.pageOtherBenefit.getPages());
        this.pageOtherBenefit.scrollToPage(this.currentPageOtherBenefit);
        // this.pageOtherBenefit.scrollToPage(this.pageOtherBenefit.getPages().length - 1);
        this.btnPrevious.imgArrow.setOpacity(50);
        this.btnPrevious.setTouchEnabled(false);

        if (this.pageOtherBenefit.getPages().length > 1) {
            this.btnNext.imgArrow.setOpacity(255);
            this.btnNext.setTouchEnabled(true);
        } else {
            this.btnNext.imgArrow.setOpacity(50);
            this.btnNext.setTouchEnabled(false);
        }
    },

    changePageOtherBenefit: function (idButton) {
        var isNext = (idButton === NewVipScene.BTN_NEXT_VIP);
        var numberPage = this.pageOtherBenefit.getPages().length;
        if (isNext) {
            if (this.currentPageOtherBenefit >= numberPage - 1) {
                return;
            }
            this.currentPageOtherBenefit++;
        } else {
            if (this.currentPageOtherBenefit <= 0) {
                return;
            }
            this.currentPageOtherBenefit--;
        }
        // cc.log("this.currentPageOtherBenefit: ", this.currentPageOtherBenefit);
        if (this.currentPageOtherBenefit === 0) {
            this.btnPrevious.imgArrow.setOpacity(50);
            this.btnPrevious.setTouchEnabled(false);
        } else {
            this.btnPrevious.imgArrow.setOpacity(255);
            this.btnPrevious.setTouchEnabled(true);
        }

        if (this.currentPageOtherBenefit === numberPage - 1) {
            this.btnNext.imgArrow.setOpacity(50);
            this.btnNext.setTouchEnabled(false);
        } else {
            this.btnNext.imgArrow.setOpacity(255);
            this.btnNext.setTouchEnabled(true);
        }

        this.pageOtherBenefit.scrollToPage(this.currentPageOtherBenefit);
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        this.currentLevel.setInfoBenefit(vipLevel, vipLevel + this.currentPageOtherBenefit + 1);
    },

    checkConvertOldVip: function () {
        setTimeout(function () {
            var dataConvert = NewVipManager.getInstance().getDataConvert();
            if (!!dataConvert) {
                // cc.log("checkConvertOldVip: ", JSON.stringify(dataConvert));
                var convertGUI = sceneMgr.openGUI(ConvertOldVip.className, 100, 100, false);
                convertGUI.convertOldVip(dataConvert);
            }
        }, 1500);
    },

    onButtonRelease: function (btn, id) {
        var pos;
        switch (id) {
            case NewVipScene.BTN_BACK: {
                this.onBack();

                break;
            }
            case NewVipScene.BTN_HELP: {
                sceneMgr.openGUI(NewHelpVipGUI.className, true);
                break;
            }
            case NewVipScene.BTN_GO_SHOP: {
                gamedata.openShop(NewVipScene.className, true);
                break;
            }
            case NewVipScene.BTN_PREVIOUS_VIP:
            case NewVipScene.BTN_NEXT_VIP: {
                this.changePageOtherBenefit(id);
                break;
            }
            case NewVipScene.BTN_CHEAT: {
                this.pCheat.setVisible(!this.pCheat.isVisible());
                break;
            }
            case NewVipScene.BTN_CHEAT_OLD: {
                var level = this.pOldCheat.level.getString();
                var gstar = this.pOldCheat.gstar.getString();
                var remainTime = this.pOldCheat.remainTime.getString();
                level = level || 0;
                gstar = gstar || 0;
                remainTime = remainTime || 0;
                var cheatOld = new CmdSendCheatOldVip();
                cheatOld.putData(level, gstar, parseFloat(remainTime) * 1000);
                GameClient.getInstance().sendPacket(cheatOld);
                break;
            }
            case NewVipScene.BTN_CHEAT_NEW: {
                var level = this.pNewCheat.level.getString();
                var vPoint = this.pNewCheat.vPoint.getString();
                var remainTime = this.pNewCheat.remainTime.getString();
                level = level || 0;
                vPoint = vPoint || 0;
                remainTime = remainTime || 0;
                var cheatNew = new CmdSendCheatNewVip();
                cheatNew.putData(level, vPoint, parseFloat(remainTime) * 1000);
                GameClient.getInstance().sendPacket(cheatNew);
                break;
            }
            case NewVipScene.BTN_TOOLTIP_0: {
                pos = this.btnTooltip0.getParent().convertToWorldSpace(this.btnTooltip0.getPosition());
                pos.x += this.btnTooltip0.getContentSize().width / 2;
                pos.y -= this.btnTooltip0.getContentSize().height;
                TooltipFloat.makeTooltip(TooltipFloat.MEDIUM, localized("VIP_TOOLTIP_0"), pos, TooltipFloat.SHOW_UP_TYPE_0);
                break;
            }
            case NewVipScene.BTN_TOOLTIP_1: {
                pos = this.btnTooltip1.getParent().convertToWorldSpace(this.btnTooltip1.getPosition());
                pos.x += this.btnTooltip1.getContentSize().width / 2;
                TooltipFloat.makeTooltip(TooltipFloat.MEDIUM, localized("VIP_TOOLTIP_1"), pos, TooltipFloat.SHOW_UP_TYPE_1);
                break;
            }
            case NewVipScene.BTN_TOOLTIP_2: {
                pos = this.btnTooltip2.getParent().convertToWorldSpace(this.btnTooltip2.getPosition());
                pos.y += this.btnTooltip2.getContentSize().height * 2;
                TooltipFloat.makeTooltip(TooltipFloat.MEDIUM, localized("VIP_TOOLTIP_2"), pos, TooltipFloat.SHOW_UP_TYPE_2);
                break;
            }
        }
        NewVipScene.lastTimeInteract = 0;
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable()) return;

        sceneMgr.openScene(LobbyScene.className);
    },

    suggestButtonNextVip: function () {
        if (!this.btnNext.isTouchEnabled()) {
            return;
        }

        var img = this.btnNext.imgArrow;
        img.stopAllActions();
        img.setPosition(img.defaultPos);
        var actionMove = cc.moveBy(0.2, 5, 0);
        img.runAction(cc.sequence(actionMove, actionMove.reverse()).repeat(3));
    },

    update: function (dt) {
        // return;
        NewVipManager.getInstance().updateTimeVip(dt);
        var remainTime = NewVipManager.getInstance().getRemainTime();
        this.iconTime.labelTime.setString(NewVipManager.getRemainTimeString(remainTime));
        var color = remainTime > 0 ? cc.color("#5DAB06") : cc.color("#E60808");
        this.iconTime.labelTime.setColor(color);

        if (!this.pNextLevelBenefit.isVisible()) {
            return;
        }
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        if (vipLevel >= NewVipManager.NUMBER_VIP) {
            return;
        }
        var target = (NewVipScene.isFollowCurrentLevel) ? this.currentLevel : this.pageOtherBenefit.getPage(this.currentPageOtherBenefit).detailBenefit;
        var targetCopy = (NewVipScene.isFollowCurrentLevel) ? this.pageOtherBenefit.getPage(this.currentPageOtherBenefit).detailBenefit : this.currentLevel;
        var positionY = target.getPositionOffestY();
        targetCopy.setPositionOffestY(positionY);

        NewVipScene.lastTimeInteract += dt;
        if (NewVipScene.lastTimeInteract > NewVipScene.TIME_SUGGEST_NEXT_VIP) {
            NewVipScene.lastTimeInteract = 0;
            this.suggestButtonNextVip();
        }
    }
});

NewVipScene.className = "NewVipScene";

NewVipScene.BTN_BACK = 0;
NewVipScene.BTN_HELP = 1;
NewVipScene.BTN_GO_SHOP = 2;
NewVipScene.BTN_AVATAR = 3;
NewVipScene.BTN_NEXT_VIP = 4;
NewVipScene.BTN_PREVIOUS_VIP = 5;
NewVipScene.BTN_CURR_PANEL = 6;
NewVipScene.BTN_NEXT_PANEL = 7;
NewVipScene.BTN_CHEAT_OLD = 8;
NewVipScene.BTN_CHEAT_NEW = 9;
NewVipScene.BTN_CHEAT = 10;
NewVipScene.BTN_TOOLTIP_0 = 11;
NewVipScene.BTN_TOOLTIP_1 = 12;
NewVipScene.BTN_TOOLTIP_2 = 13;

NewVipScene.isFollowCurrentLevel = true;
NewVipScene.lastTimeInteract = 0;
NewVipScene.TIME_SUGGEST_NEXT_VIP = 5;

NewVipScene.runEffectProgressVip = function (bgProgress, progress, txtExp, imgVpoint, timeRun, startVpoint, targetVpoint, currentLevelVip, imgCurVip, imgNextVip) {
    // cc.log("NewVipScene.runEffectProgressVip: ", startVpoint, targetVpoint, currentLevelVip);
    startVpoint = startVpoint || 0;
    // if (currentLevelVip >= NewVipManager.NUMBER_VIP){
    //     txtExp.setString(targetVpoint);
    //     progress.setPercent(100);
    //     if (imgVpoint) imgVpoint.setPositionX(progress.getContentSize().width);
    //     if (imgNextVip){
    //         imgNextVip.setVisible(false);
    //     }
    //     return;
    // }
    var totalFrame = 24;
    var actionDelay = cc.delayTime(timeRun / totalFrame);
    var actions = [];
    var totalVpoint = NewVipManager.getInstance().getVpointNeed(currentLevelVip);
    var addVpointEachFrame = (targetVpoint - startVpoint) / totalFrame;
    for (var i = 0; i < totalFrame; i++) {
        var vpoint = startVpoint + addVpointEachFrame * i;
        var progressPercent = vpoint / totalVpoint * 100;
        if (currentLevelVip >= NewVipManager.NUMBER_VIP) {
            progressPercent = 100;
        }
        var data = {
            vPoint: Math.floor(startVpoint + addVpointEachFrame * i),
            progressBar: progress,
            img: imgVpoint,
            txt: txtExp,
            per: progressPercent
        };
        var action = cc.callFunc(function () {
            this.txt.setString(StringUtility.pointNumber(this.vPoint) + " / " + StringUtility.pointNumber(totalVpoint));
            if (currentLevelVip >= NewVipManager.NUMBER_VIP) {
                this.txt.setString(StringUtility.pointNumber(this.vPoint));
            }
            this.progressBar.setPercent(this.per);
            if (this.img) this.img.setPositionX(this.per * this.progressBar.getContentSize().width / 100);
        }.bind(data));

        actions.push(action);
        actions.push(actionDelay);
    }

    var actionFinal = cc.callFunc(function () {
        txtExp.setString(StringUtility.pointNumber(targetVpoint) + " / " + StringUtility.pointNumber(totalVpoint));
        progress.setPercent(targetVpoint / totalVpoint * 100);
        if (currentLevelVip >= NewVipManager.NUMBER_VIP) {
            txtExp.setString(targetVpoint);
            progress.setPercent(100);
        }
        if (imgVpoint) {
            imgVpoint.setPositionX(progress.getContentSize().width * targetVpoint / totalVpoint);
        }
        if (targetVpoint >= totalVpoint) {
            var newLevel = currentLevelVip + 1;
            if (newLevel <= NewVipManager.NUMBER_VIP) {
                var newTotal = NewVipManager.getInstance().getVpointNeed(newLevel);
                txtExp.setString("0 / " + StringUtility.pointNumber(newTotal));
                progress.setPercent(0);
                if (imgVpoint) imgVpoint.setPositionX(0);
                if (imgCurVip) {
                    imgCurVip.setVisible(true);
                    imgCurVip.ignoreContentAdaptWithSize(true);
                    imgCurVip.loadTexture(NewVipManager.getIconVip(newLevel));
                    var newLevel2 = newLevel + 1;
                    if (newLevel2 <= NewVipManager.NUMBER_VIP) {
                        imgNextVip.loadTexture(NewVipManager.getIconVip(newLevel2));
                        imgNextVip.ignoreContentAdaptWithSize(true);
                    }
                    NewVipScene.addEffectHighlight(imgNextVip, 0.3, 0.8, cc.p(15, 15));
                    imgNextVip.setVisible(newLevel2 <= NewVipManager.NUMBER_VIP);
                }
            }
        }
    });
    actions.push(actionFinal);
    bgProgress.runAction(cc.sequence(actions));
};

NewVipScene.addEffectHighlight = function (parent, scale, time, position) {
    var effect2 = db.DBCCFactory.getInstance().buildArmatureNode("Highlight");
    if (effect2) {
        parent.addChild(effect2, 1);
        effect2.setPosition(position);
        effect2.gotoAndPlay("1", 0, time, 1);
        effect2.setScale(scale);
        effect2.setVisible(false);
        effect2.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(function () {
            this.setVisible(true);
        }.bind(effect2))));
        effect2.setCompleteListener(function () {
            this.setVisible(false);
        }.bind(effect2));
    }
};

NewVipScene.addEffectIconVip = function (parent, scale, time, position, levelVip) {
    NewVipScene.addEffectHighlight(parent, scale, time, position);

    setTimeout(function () {
        var effect = db.DBCCFactory.getInstance().buildArmatureNode("Ngoc1");
        if (effect) {
            parent.addChild(effect);
            effect.gotoAndPlay("lv" + levelVip + "_0", -1, -1, 1);
            effect.setScale(0);
            effect.runAction(cc.scaleTo(0.2, 1).easing(cc.easeExponentialOut()));
            effect.setCompleteListener(function () {
                effect.gotoAndPlay("lv" + levelVip + "_1", -1, -1, 0);
            }.bind(effect));
            // return;
            if (levelVip < 4) {
                return;
            }
            var ngoc = new cc.Sprite(NewVipManager.getImageUpVip(levelVip));
            var light = new cc.Sprite("res/Lobby/GUIVipNew/fireMask.png");
            var light2 = new cc.Sprite("res/Lobby/GUIVipNew/fireMask.png");
            // parent.addChild(light);
            // parent.addChild(light2);
            this.clipping = new cc.ClippingNode();
            this.clipping.setAlphaThreshold(0.5);
            this.clipping.addChild(light);
            this.clipping.addChild(light2);

            light.setBlendFunc(cc.DST_COLOR, cc.ONE);
            light2.setBlendFunc(cc.DST_COLOR, cc.ONE);
            this.clipping.setCascadeOpacityEnabled(true);
            parent.addChild(this.clipping);
            this.clipping.setStencil(ngoc);

            var lightHeight = light.getContentSize().height;
            var ngocHeight = ngoc.getContentSize().height;
            var distance = lightHeight + ngocHeight;
            var timeRun = 6;
            var actionMove = cc.moveBy(timeRun, 0, distance);
            var y = -ngoc.getContentSize().height * 2;
            var timeDelay = timeRun * (distance + y) / distance;

            light.setPositionY(y);
            light2.setPositionY(y);

            var light2action = cc.callFunc(function () {
                this.runAction(cc.sequence(actionMove.clone(),
                    cc.moveTo(0.001, distance / 3 - Math.random() * distance * 2 / 3, y),
                    cc.delayTime(timeDelay)).repeatForever());
            }.bind(light2));


            light.runAction(cc.sequence(actionMove, cc.callFunc(function () {
                this.setPosition(distance / 3 - Math.random() * distance * 2 / 3, y);
            }.bind(light)), cc.delayTime(timeDelay)).repeatForever());
            light2.runAction(cc.sequence(cc.delayTime(timeRun * lightHeight / distance), light2action));
        }
    }, time * 250);
};

NewVipScene.scrollToPercentHorizonal = function (tableView, percent, actionTime, isBounceable) {
    var contentHeight = tableView.getContainer().getContentSize().height;
    var viewHeight = tableView.getViewSize().height;
    if (viewHeight > contentHeight) {
        return;
    }
    var numFrame = 50;
    var actionDelay = cc.delayTime(actionTime / numFrame);
    var actions = [];
    var distance = viewHeight - contentHeight;
    var targetY = distance * (100 - percent) / 100; // vi day la vi tri nguoc, 0% tuong duong vi tri tren cung
    if ((percent === 0 || percent === 100) && isBounceable) {
        targetY = targetY * 1.1;
    } else {
        isBounceable = false;
    }
    var currentPosY = tableView.getContainer().getPositionY();
    var miniY = (targetY - currentPosY) / numFrame;
    for (var i = 0; i < numFrame; i++) {
        var data = {target: tableView, posY: currentPosY + miniY * i};
        var action = cc.callFunc(function () {
            this.target.setContentOffset(cc.p(0, this.posY), false);
        }.bind(data));
        actions.push(action);
        actions.push(actionDelay);
    }
    actions.push(cc.callFunc(function () {
        tableView.setContentOffset(cc.p(0, targetY), false);
    }));
    if (isBounceable) {
        actions.push(cc.callFunc(function () {
            NewVipScene.scrollToPercentHorizonal(tableView, 0, actionTime / 5, false);
        }));
    }
    tableView.runAction(cc.sequence(actions));
};

var DetailBenefit = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.listBenefit = [];
        this.listTargetBenefit = [];
        this.isCurrentLevel = false;
        this.isNewVip = true;
        this.initWithBinaryFile("Vip_DetailLevelBenefit.json");
    },

    onEnterFinish: function () {
        if (!cc.sys.isNative) this.viewBenefit.setTouchEnabled(true);
    },

    initGUI: function () {
        this.pDetailLevelBenefit = this.getControl("pDetailLevelBenefit");
        this.pBenefitDetail = this.getControl("pBenefitDetail", this.pDetailLevelBenefit);
        // this.bgBenefit = this.getControl("bgBenefit", this.pDetailLevelBenefit);
        this.iconVip = this.getControl("iconVip", this.pDetailLevelBenefit);
        this.iconVip.ignoreContentAdaptWithSize(true);
        this.cellTemp = this.pDetailLevelBenefit.getChildByName("cellTemp");

        this.viewBenefit = new cc.TableView(this, this.pBenefitDetail.getContentSize());
        this.viewBenefit.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.viewBenefit.setPosition(0, 0);
        this.viewBenefit.setVerticalFillOrder(0);
        this.viewBenefit.setDelegate(this);
        this.pBenefitDetail.addChild(this.viewBenefit);
    },

    setInfoBenefit: function (level, targetLevel) {
        var texture = NewVipManager.getImageVip(level);
        if (texture) {
            this.iconVip.loadTexture(texture);
        }
        var iconScale = (level > 0) ? 1 : 0.35;
        this.iconVip.setScale(iconScale);
        this.iconVip.setVisible(!!texture);
        this.listBenefit = NewVipManager.getInstance().getListBenefit(level);
        for (var i = 0; i < this.listBenefit.length; i++) {
            this.listBenefit[i].myBenefit = true;
        }

        var listTemp = NewVipManager.getInstance().getListBenefit(targetLevel);
        this.listBenefit = this.sortListBenefit(this.listBenefit, listTemp);
        listTemp = this.sortListBenefit(listTemp, this.listBenefit);
        listTemp = (listTemp.length > this.listBenefit.length) ? listTemp : this.listBenefit;
        this.listTargetBenefit = this.makeTargetListBenefit(listTemp);

        this.isCurrentLevel = (level <= targetLevel);
        this.viewBenefit.reloadData();
    },

    sortListBenefit: function (listA, listB) {
        listA.sort(function (a, b) {
            var isAinOtherList = 0;
            for (var i = 0; i < listB.length; i++) {
                if (listB[i].index === a.index) {
                    isAinOtherList = 1;
                    break;
                }
            }

            var isBinOtherList = 0;
            for (i = 0; i < listB.length; i++) {
                if (listB[i].index === b.index) {
                    isBinOtherList = 1;
                    break;
                }
            }
            if (isAinOtherList === isBinOtherList) {
                return (a.index - b.index);
            }
            return isBinOtherList - isAinOtherList;
        }.bind(this));
        return listA;
    },

    makeTargetListBenefit: function (listBenefit) {
        var listTargetBenefit = listBenefit;
        var listFull = NewVipManager.getInstance().getListBenefit(NewVipManager.NUMBER_VIP);
        var listFullHave = NewVipManager.getInstance().getListBenefitHave(NewVipManager.NUMBER_VIP);
        // cc.log("makeTargetList: ", JSON.stringify(listFullHave), JSON.stringify(listBenefit));
        for (var i = 0; i < listFullHave.length; i++) {
            var didHave = false;
            for (var j in listBenefit) {
                if (parseInt(listBenefit[j]["index"]) === parseInt(listFullHave[i])) {
                    didHave = true;
                    break;
                }
            }
            if (!didHave) {
                listTargetBenefit.push(listFull[i]);
            }
        }
        // cc.log("makeTargetListBenefit: ", JSON.stringify(listBenefit), JSON.stringify(listTargetBenefit));
        return listTargetBenefit;
    },

    // tao thong tin so sanh giua vip cu va vip moi duoc convert
    setInfoBenefit2: function (oldVipLevel, newVipLevel, oldVipTime, newVipTime, isNewType, goldBonus) {
        if (isNewType) {
            this.iconVip.loadTexture(NewVipManager.getImageVip(newVipLevel));
        } else {
            if (oldVipLevel >= 0) {
                var imgSrc = "res/Lobby/GUIVipNew/imgOldVip" + oldVipLevel + ".png";
                var sprite = new cc.Sprite(imgSrc);
                this.iconVip.loadTexture("res/Lobby/GUIVipNew/imgOldVip" + oldVipLevel + ".png");
                var oldHeight = this.iconVip.getContentSize().height;
                this.iconVip.setContentSize(sprite.getContentSize());
                this.iconVip.setScale(oldHeight / sprite.getContentSize().height);
            }
            this.iconVip.setVisible(oldVipLevel >= 0);
        }
        oldVipLevel += 1; // vi trong config cua oldBenefit cac index cua vip tang len 1
        var thisLevel = (isNewType) ? newVipLevel : oldVipLevel;
        var targetLevel = (isNewType) ? oldVipLevel : newVipLevel;
        this.listBenefit = this.makeFullListBenefit(thisLevel, targetLevel, isNewType);
        this.listTargetBenefit = this.makeFullListBenefit(targetLevel, thisLevel, !isNewType);
        var i;
        var hasRemainTimeOldType = false;
        for (i = 0; i < this.listBenefit.length; i++) {
            if (this.listBenefit[i]["index"] === "9") {
                hasRemainTimeOldType = true;
                break;
            }
        }
        if (!hasRemainTimeOldType) {
            this.listBenefit.push({"index": "9", "value": 0});
        }
        for (i = 0; i < this.listBenefit.length; i++) {
            if (this.listBenefit[i]["index"] === "9") {
                this.listBenefit[i]["index"] = ConvertOldVip.INDEX_TIME_REMAIN;
                var time = (isNewType) ? newVipTime : oldVipTime;
                this.listBenefit[i]["value"] = NewVipManager.getRemainTimeString(time, true);
            } else if (this.listBenefit[i]["index"] === "1" && goldBonus === 0) { // neu khong co gold bonus thi khong hien thi gold tang ngay
                this.listBenefit.splice(i, 1);
                this.listTargetBenefit.splice(i, 1);
            }
        }
        for (i = 0; i < this.listTargetBenefit.length; i++) {
            this.listTargetBenefit[i].myBenefit = false;
        }

        this.isCurrentLevel = !isNewType;
        this.isNewVip = isNewType;
        this.viewBenefit.reloadData();
    },

    // tao ra 2 mang benefit co so luong bang nhau de so sanh vip cu va moi
    makeFullListBenefit: function (thisLevel, targetLevel, isNewType) {
        var i;
        var listAHave = NewVipManager.getInstance().getListBenefitHave(thisLevel, !isNewType);
        var listBHave = NewVipManager.getInstance().getListBenefitHave(targetLevel, isNewType);
        var listA = NewVipManager.getInstance().getListBenefit(thisLevel, !isNewType);
        var listB = NewVipManager.getInstance().getListBenefit(targetLevel, isNewType);
        for (i = 0; i < listA.length; i++) {
            listA[i].myBenefit = true;
        }
        for (i = 0; i < listB.length; i++) {
            listB[i].myBenefit = false;
        }
        for (i = 0; i < listBHave.length; i++) {
            var index = listAHave.indexOf(listBHave[i]);
            if (index < 0) {
                listA.push(listB[i]);
            }
        }
        listA = listA.sort(function (a, b) {
            return a.index - b.index;
        });
        return listA;
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new DetailBenefitCell();
        }

        var info = this.listBenefit[idx] ? this.listBenefit[idx] : this.listTargetBenefit[idx];
        // info.myBenefit = !!this.listBenefit[idx];
        cell.setInfo(info, this.isCurrentLevel, this.isNewVip);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return this.cellTemp.getContentSize();
    },

    numberOfCellsInTableView: function (table) {
        return this.listBenefit.length > this.listTargetBenefit.length ? this.listBenefit.length : this.listTargetBenefit.length;
    },

    getPositionOffestY: function () {
        return this.viewBenefit.getContainer().getPositionY();
    },

    setPositionOffestY: function (positionY) {
        try {
            this.viewBenefit.setContentOffset(cc.p(0, positionY), false);
        } catch (e) {

        }
    },

    scrollToEnd: function (actionTime, isBounceable, delayTime) {
        this.viewBenefit.setContentOffset(cc.p(0, 0), false);
        setTimeout(function () {
            NewVipScene.scrollToPercentHorizonal(this.viewBenefit, 0, actionTime, isBounceable);
        }.bind(this), delayTime * 1000);
    }
});

var DetailBenefitCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("Vip_BenefitCell.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);
        this.iconBenefit = ccui.Helper.seekWidgetByName(this._layout, "iconBenefit");
        this.iconLockBenefit = ccui.Helper.seekWidgetByName(this._layout, "iconLockBenefit");
        this.value = ccui.Helper.seekWidgetByName(this._layout, "value");
        this.detail = ccui.Helper.seekWidgetByName(this._layout, "detail");
        this.bigFontSize = this.value.getFontSize();
        this.smallFontSize = this.detail.getFontSize();
    },

    setInfo: function (inf, isCurrentLevel, isNewVip) {
        // cc.log("DetailBenefitCell: ", JSON.stringify(inf));
        // if (!inf.myBenefit){
        //     this.iconBenefit.setVisible(false);
        //     this.detail.setVisible(false);
        //     this.iconLockBenefit.setVisible(false);
        //     this.value.setString(localized("VIP_HAVE_NOT"));
        //     if (isCurrentLevel){
        //         this.value.setColor(cc.color("#57d7e9"));
        //     }
        //     return;
        // }
        this.iconBenefit.setVisible(true);
        this.detail.setVisible(true);
        this.iconLockBenefit.setVisible(true);

        var remainTime = NewVipManager.getInstance().getRemainTime();
        if (inf.index === ConvertOldVip.INDEX_TIME_REMAIN) { // case dac biet cho gui convert
            this.value.setString(inf.value);
            this.detail.setString(localized("VIP_REMAIN_TIME"));
            this.iconBenefit.loadTexture(NewVipManager.getInstance().getImageBenefit(2));
            this.iconLockBenefit.setVisible(false);
        } else {
            this.detail.setString(NewVipManager.getInstance().getBenefitName(inf.index));
            this.value.setString(NewVipManager.getInstance().getValueBenefit(inf.index, inf.value, false));
            this.iconLockBenefit.setVisible(NewVipManager.getInstance().getIsLock(inf.index) && isNewVip && (NewVipManager.getInstance().getVipLevel() > 0 || !isCurrentLevel));
            this.iconBenefit.loadTexture(NewVipManager.getInstance().getImageBenefit(inf.index));
        }
        var notMyBenefit = false;
        if (isCurrentLevel) {
            this.detail.setColor(cc.color("#b5f6ff"));
            this.value.setColor(cc.color("#57d7e9"));
            if (remainTime <= 0 && this.iconLockBenefit.isVisible() || !inf.myBenefit) {
                // this.detail.setColor(cc.color("#888888"));
                // this.value.setColor(cc.color("#888888"));
                // if (!cc.sys.isNative){
                //     this.detail.setColor(cc.color("#BFBFBF"));
                // }
                notMyBenefit = true;
            }
            // cc.log("DetailBenefitCell: ", JSON.stringify(inf), NewVipManager.getInstance().getValueBenefit(inf.index, inf.value));
        } else {
            this.detail.setColor(cc.color("#d5c9ff"));
            this.value.setColor(cc.color("#ffdc54"));
            if (!inf.myBenefit) {
                // this.detail.setColor(cc.color("#888888"));
                // this.value.setColor(cc.color("#888888"));
                // if (!cc.sys.isNative){
                //     this.detail.setColor(cc.color("#BFBFBF"));
                // }
                notMyBenefit = true;
            }
        }

        var color = cc.sys.isNative ? "#888888" : "#BFBFBF";
        if (notMyBenefit) {
            this.detail.setColor(cc.color(color));
            this.value.setColor(cc.color(color));
        }

        var fontSize = inf.myBenefit ? this.bigFontSize : this.smallFontSize;
        this.value.setFontSize(fontSize);
        if (!inf.myBenefit) {
            this.iconLockBenefit.setVisible(false);
            this.value.setString(localized("VIP_HAVE_NOT"));
        }
    }
});

var NewHelpVipGUI = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.curPage = -1;
        this.initWithBinaryFile("Vip_HelpGUI.json");
    },

    onEnterFinish: function () {
        this.onButtonRelease(null, NewHelpVipGUI.BTN_BENEFIT);

        this.setBackEnable(true);

        for (var i = 0; i < NewVipManager.NUMBER_VIP + 1; i++) {
            var detail = this.listDetail[i];
            detail.setBenefit(i);
        }
        this.onUpdateLevel();
    },

    initGUI: function () {
        // this.blurLayer = new BlurLayer(sceneMgr.getRunningScene().getMainLayer());
        // this._layout.addChild(this.blurLayer, -1);

        this.bg = this.getControl("bg");

        this.customButton("btnClose", NewHelpVipGUI.BTN_CLOSE, this.bg);
        this.pTooltip = this.getControl("pTooltip");

        this.pButton = this.getControl("pButton", this.bg);
        this.btnBenefit = this.customButton("btnBenefit", NewHelpVipGUI.BTN_BENEFIT, this.pButton);
        this.btnBenefit.imgDis = this.getControl("imgDis", this.btnBenefit);
        this.btnGuide = this.customButton("btnGuide", NewHelpVipGUI.BTN_GUIDE, this.pButton);
        this.btnGuide.imgDis = this.getControl("imgDis", this.btnGuide);

        var i;
        this.pBenefitDetail = this.getControl("pBenefitDetail");
        this.pDetail = this.getControl("pDetail", this.pBenefitDetail);
        this.listDetail = [];
        for (i = 0; i < NewVipManager.NUMBER_VIP + 1; i++) {
            var detail = new BenefitDetailColumn();
            var width = detail.bg.getContentSize().width;
            detail.setPositionX(width * i);
            this.pDetail.addChild(detail);
            this.listDetail.push(detail);
            detail.setBenefit(i);
        }

        this.currentLevel = this.getControl("currentLevel", this.pBenefitDetail);
        this.pListLock = this.getControl("pListLock", this.pBenefitDetail);

        this.currentLevel.listLock = [];
        this.currentLevel.listExpired = [];

        for (i = 0; i < NewVipManager.NUMBER_BENEFIT; i++) {
            var lock = this.getControl("iconLock" + i, this.pListLock);
            var expired = this.getControl("iconExpired" + i, this.currentLevel);
            this.currentLevel.listLock.push(lock);
            this.currentLevel.listExpired.push(expired);
            lock.setVisible(false);
            expired.setVisible(false);
            var title = this.getControl("txtTitle" + i, this.pListLock);
            title.setString(NewVipManager.getInstance().getBenefitName(i));
            title.setVisible(i !== 8); // tam an fanpage VIP di
        }

        this.listPanelVip = [];
        for (i = 0; i <= NewVipManager.NUMBER_VIP; i++) {
            var pVip = this.getControl("pVip" + i, this.pBenefitDetail);
            this.listPanelVip.push(pVip);
            pVip.setVisible(false);
        }

        this.pGuide = this.getControl("pGuide");
        this._pageHelp = this.getControl("pageHelp", this.pGuide);
        this._pageHelp.addEventListener(this.onPageListener.bind(this), this);
        this._pageHelp.setCustomScrollThreshold(150);
        this._currentPage = this.getControl("imgBtnPage", this.pGuide);

        this._arrPage = [];
        for (i = 0; i < 2; i++) {
            this._arrPage[i] = this.customButton("btnPage" + i, NewHelpVipGUI.BTN_PAGE_1 + i, this.pGuide);
            this._arrPage[i].setPressedActionEnabled(false);
        }
    },

    onPageListener: function () {
        if (this.curPage === -1) {
            this.curPage = this._pageHelp.getCurPageIndex();
            this._currentPage.setPosition(this._arrPage[this.curPage].getPosition());
        } else {
            this._currentPage.setPosition(this._arrPage[this.curPage].getPosition());

            this.curPage = this._pageHelp.getCurPageIndex();
            var newPos = this._arrPage[this._pageHelp.getCurPageIndex()].getPosition();
            this._currentPage.runAction(cc.moveTo(0.1, newPos));
        }
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case NewHelpVipGUI.BTN_CLOSE: {
                this.onClose();
                break;
            }

            case NewHelpVipGUI.BTN_GUIDE:
            case NewHelpVipGUI.BTN_BENEFIT: {
                this.pBenefitDetail.setVisible(id === NewHelpVipGUI.BTN_BENEFIT);
                this.pGuide.setVisible(id !== NewHelpVipGUI.BTN_BENEFIT);

                this.btnBenefit.imgDis.setVisible(id === NewHelpVipGUI.BTN_BENEFIT);
                this.btnGuide.imgDis.setVisible(id !== NewHelpVipGUI.BTN_BENEFIT);
                if (id === NewHelpVipGUI.BTN_GUIDE) {
                    this.onButtonRelease(null, NewHelpVipGUI.BTN_PAGE_1);
                }
                break;
            }
            case NewHelpVipGUI.BTN_PAGE_1:
            case NewHelpVipGUI.BTN_PAGE_2: {
                this._pageHelp.scrollToPage(id - NewHelpVipGUI.BTN_PAGE_1);
                this.onPageListener();
                break;
            }
        }
    },

    onUpdateLevel: function () {
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        this.currentLevel.setPositionX(this.listPanelVip[vipLevel].getPositionX());
        var listLock = NewVipManager.getInstance().getListLockTypeBenefit();
        var listBenefitHave = NewVipManager.getInstance().getListBenefitHave(vipLevel);
        // listLock = listLock.filter(value => -1 !== listBenefitHave.indexOf(value));
        var remainTime = NewVipManager.getInstance().getRemainTime();
        var benefitCell = this.listDetail[vipLevel];
        for (var i = 0; i < this.currentLevel.listLock.length; i++) {
            var isLock = listLock.indexOf(i) >= 0 && vipLevel > 0 && (i === 0 || listBenefitHave.indexOf(i) >= 0);

            // this.currentLevel.listLock[i].setVisible(isLock);
            this.currentLevel.listExpired[i].setVisible(isLock && remainTime <= 0);
            var isExpired = this.currentLevel.listExpired[i].isVisible();
            var color = (isExpired) ? cc.color("#888888") : cc.color("#A4E0F1");
            benefitCell.listTxtType[i].setColor(color);
            benefitCell.listTxtType[i].removeAllChildren();
        }

        for (i = 0; i < this.currentLevel.listLock.length; i++) {
            isLock = listLock.indexOf(i) >= 0;
            this.currentLevel.listLock[i].setVisible(isLock);
        }

    },

    onClose: function () {
        this._super();
        // this.blurLayer.onClose();
    }
});

NewHelpVipGUI.className = "NewHelpVipGUI";

NewHelpVipGUI.BTN_CLOSE = 1;
NewHelpVipGUI.BTN_BENEFIT = 2;
NewHelpVipGUI.BTN_GUIDE = 3;
NewHelpVipGUI.BTN_PAGE_1 = 4;
NewHelpVipGUI.BTN_PAGE_2 = 5;

var BenefitDetailColumn = cc.Layer.extend({
    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("VIP_DetailBenefitHelpGUI.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);
        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.txtVipName = ccui.Helper.seekWidgetByName(this._layout, "txtVipName");
        this.imgVip = ccui.Helper.seekWidgetByName(this._layout, "imgVip");
        this.listTxtType = [];
        for (var i = 0; i < NewVipManager.NUMBER_BENEFIT; i++) {
            this.listTxtType.push(ccui.Helper.seekWidgetByName(this._layout, "txtType" + i));
        }
    },

    setBenefit: function (level) {
        var listBenefit = NewVipManager.getInstance().getListBenefit(level, false, true);
        // cc.log("listBenefit: ", JSON.stringify(listBenefit));
        if (level > 0) {
            this.txtVipName.setFontName(SceneMgr.FONT_BOLD);
            var vipName = localized("VIP_NAME");
            vipName = StringUtility.replaceAll(vipName, "@level", level);
            this.txtVipName.setString(vipName);
        } else {
            this.txtVipName.setFontName(SceneMgr.FONT_NORMAL);
        }
        this.txtVipName.setColor(this.getVipColor(level));
        this.imgVip.setVisible(level > 0);
        this.imgVip.loadTexture(NewVipManager.getIconVip(level));
        this.imgVip.ignoreContentAdaptWithSize(true);
        for (var i = 1; i < this.listTxtType.length; i++) {
            if (i === 8) {
                this.listTxtType[i].setVisible(false);
                continue;
            }
            var value;
            var benefit = listBenefit[0];
            for (var j = 0; j < listBenefit.length; j++) {
                if (parseInt(listBenefit[j]["index"]) === i) {
                    benefit = listBenefit[j];
                    break;
                }
            }
            if (benefit) {
                value = (benefit["value"]) ? NewVipManager.getInstance().getValueBenefit(benefit["index"], benefit["value"], false) : "-";
            } else {
                value = "-"
            }
            if (value === localized("VIP_TURN_ON")) {
                this.listTxtType[i].setVisible(false);
                var img = new cc.Sprite("GUIVipNew/iconTick.png");
                this.bg.addChild(img);
                img.setPosition(this.listTxtType[i].getPosition());
            } else {
                this.listTxtType[i].setVisible(true);
            }
            this.listTxtType[i].setString(value);
            this.listTxtType[i].setColor(cc.color("#A4E0F1"));
        }
    },

    getVipColor: function (level) {
        switch (level) {
            case 0:
                return cc.color("#A4E0F1");
            case 1:
                return cc.color("#E56BB8");
            case 2:
                return cc.color("#07DB40");
            case 3:
                return cc.color("#F5DD91");
            case 4:
                return cc.color("#B988F9");
            case 5:
                return cc.color("#3D7CF4");
            case 6:
                return cc.color("#CF4850");
            case 7:
                return cc.color("#08B546");
            case 8:
                return cc.color("#EFD78E");
            case 9:
                return cc.color("#7EB1F2");
            case 10:
                return cc.color("#F44F51");
        }
    }
});

//----------------------------------------------------------------------------------------------------------------------
var VipIntroGUI = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.listIntroImg = [];
        this.initWithBinaryFile("Vip_IntroGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.pEffect = this.getControl("pEffect", this.bg);
        this.listIntroImg = [];
        for (var i = 0; i < 6; i++) {
            this.listIntroImg.push(this.getControl("intro" + i, this.bg));
        }

        this.btnEnterVip = this.customButton("btnEnterVip", 1, this.bg);
        this.btnClose = this.customButton("btnClose", 0, this.bg);

        // this.blurLayer = new BlurLayer(sceneMgr.getRunningScene().getMainLayer());
        // this._layout.addChild(this.blurLayer, -1);
    },

    onEnterFinish: function () {
        this.runEffectIntro();
    },

    onExit: function () {
        this._super();
        // this.blurLayer.onClose();
    },

    runEffectIntro: function () {
        // cc.log("runEffectIntro");
        this.bg.stopAllActions();
        this.bg.setPositionX(this.bg.defaultPos.x - this.bg.getContentSize().width);
        this.bg.runAction(new cc.EaseBackOut(cc.moveBy(0.5, this.bg.getContentSize().width, 0)));
        setTimeout(function () {
            var effect = db.DBCCFactory.getInstance().buildArmatureNode("HighlightBig");
            if (effect) {
                this.pEffect.addChild(effect, 101);
                effect.gotoAndPlay("1", 0, 0.8, 1);
            }
        }.bind(this), 400);
        var timeAction = 0.5;
        for (var i = 0; i < this.listIntroImg.length; i++) {
            var imgIntro = this.listIntroImg[i];
            // imgIntro.setScaleY(0);
            imgIntro.setPositionX(imgIntro.defaultPos.x - imgIntro.getContentSize().width);
            imgIntro.setOpacity(0);
            var actionMove = new cc.EaseBackOut(cc.moveBy(timeAction, imgIntro.width, 0));
            var actionFadeIn = cc.fadeIn(timeAction);
            imgIntro.runAction(cc.sequence(cc.delayTime(1 + timeAction / 4 * i), cc.spawn(actionMove, actionFadeIn)));
        }

        this.btnEnterVip.stopAllActions();
        this.btnEnterVip.setScale(0);
        var callFunc = cc.callFunc(function () {
            var actionScaleUp = new cc.EaseExponentialOut(cc.scaleTo(0.5, 1.2));
            var actionScaleDown = cc.scaleTo(0.5, 1);
            this.runAction(cc.sequence(actionScaleUp, actionScaleDown).repeatForever());
        }.bind(this.btnEnterVip));
        this.btnEnterVip.runAction(cc.sequence(cc.delayTime(timeAction * this.listIntroImg.length - 1), callFunc));
    },

    onButtonRelease: function (btn, id) {
        if (id > 0) {
            sceneMgr.openScene(NewVipScene.className);
            return;
        }
        this.onClose();
    }
});

VipIntroGUI.className = "VipIntroGUI";

var VipChangeGoldSuccess = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.data = null;
        this.distanceY = 0;
        this.initWithBinaryFile("Vip_ChangeGoldGUI.json");
    },

    onEnterFinish: function () {
        NewVipManager.getInstance().setWaiting(true);
        this.updateUserInfo();
        this.updateVipInfo();
        this.startEffect();
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.decorate = this.getControl("decorate", this.bg);
        this.txtGold = this.getControl("txtGold", this.bg);
        this.txtGold.ignoreContentAdaptWithSize(true);
        this.txtVpoint = this.getControl("txtVpoint", this.bg);
        this.txtVpoint.ignoreContentAdaptWithSize(true);
        this.txtTime = this.getControl("txtTime", this.bg);
        this.txtTime.ignoreContentAdaptWithSize(true);

        this.imgGold = this.getControl("imgGold", this.bg);
        this.imgVpoint = this.getControl("imgVpoint", this.bg);
        this.imgTimeBonus = this.getControl("imgTimeBonus", this.bg);
        this.txtBonusReason = this.getControl("txtBonusReason", this.bg);
        this.txtBonusReason.ignoreContentAdaptWithSize(true);
        this.txtBonusVipReason = this.getControl("txtBonusVipReason", this.bg);
        this.txtBonusVipReason.ignoreContentAdaptWithSize(true);
        this.pTxtChangeGold = this.getControl("pTxtChangeGold", this.bg);
        this.txtTicket = this.getControl("txtTicket", this.bg);
        this.txtTicket.ignoreContentAdaptWithSize(true);
        this.imgTicket = this.getControl("imgTicket", this.bg);
        this.imgTicket.ignoreContentAdaptWithSize(true);
        this.imgTicket.pos = this.imgTicket.getPosition();
        this.txtTicket.pos = this.txtTicket.getPosition();
        this.imgTicket.loadTexture(event.getTicketTexture());
        this.ticketNode = this.bg.getChildByName("ticketNode");
        this.txtDiamond = this.getControl("txtDiamond", this.bg);
        this.imgDiamond = this.getControl("imgDiamond", this.bg);
        this.txtDiamond.ignoreContentAdaptWithSize(true);

        this.pBot = this.getControl("pBot");
        this.pTest = this.getControl("pTest");
        this.pVip2 = this.getControl("pVip2");
        this.bgBot = this.getControl("bgBot");
        this.bgProgressVip = this.getControl("bgProgress", this.pVip2);
        this.progressVip = this.getControl("progressVip", this.pVip2);
        this.txtProgress = this.getControl("txtProgress", this.pVip2);
        this.iconNextVip = this.getControl("iconNextVip", this.pVip2);
        this.iconCurVip = this.getControl("iconCurVip", this.pVip2);
        this.iconCurVip.ignoreContentAdaptWithSize(true);
        this.iconNextVip.ignoreContentAdaptWithSize(true);
        this.txtVip1 = this.getControl("txtVip1", this.pVip2);
        this.txtRemainVipTime = this.getControl("txtRemainTime", this.pVip2);

        var pInfo = this.getControl("pInfo");
        this._uiName = this.getControl("name", pInfo);
        this._uiBean = this.getControl("gold", pInfo);
        this._uiBean.ignoreContentAdaptWithSize(true);
        this._uiCoin = this.getControl("coin", pInfo);
        this._uiCoin.ignoreContentAdaptWithSize(true);
        this.iconDiamond = this.getControl("iconDiamond", pInfo);
        this._uiDiamond = this.getControl("diamond", pInfo);
        this._uiDiamond.ignoreContentAdaptWithSize(true);
        this.pInfo = pInfo;

        var bgAvatar = this.getControl("bgAvatar", pInfo);
        this._uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        var size = bgAvatar.getContentSize();
        this._uiAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        bgAvatar.addChild(this._uiAvatar);

        this.btnOK = this.customButton("btnOK", 1, this.bg);
    },

    startEffect: function () {
        this.distanceY = this.pBot.getContentSize().height;
        this.pTest.setPositionY(this.pTest.defaultPos.y - this.distanceY);
        this.bgBot.setPositionY(this.bgBot.defaultPos.y - this.distanceY);
        this.pInfo.setPositionY(this.pInfo.defaultPos.y - this.distanceY);

        this.bg.setScale(0);
        var action = cc.callFunc(function () {
            var effect = db.DBCCFactory.getInstance().buildArmatureNode("HighlightBig");
            if (effect) {
                this.decorate.addChild(effect, 101);
                effect.gotoAndPlay("1", 0, 0.8, 1);
                var contentSize = this.decorate.getContentSize();
                var anchor = this.decorate.getAnchorPoint();
                effect.setPosition(contentSize.width * anchor.x, contentSize.height * anchor.y);
            }
        }.bind(this));
        this.bg.runAction(cc.sequence(new cc.EaseBackOut(cc.scaleTo(0.5, 1)), action));
        this.btnOK.setVisible(true);
        this.bg.setPosition(this.bg.defaultPos);
    },

    updateVipInfo: function () {
        var levelVip = NewVipManager.getInstance().getVipLevel();
        this.txtVip1.setVisible(levelVip > 0);
        this.iconCurVip.setVisible(levelVip > 0);
        this.txtRemainVipTime.setVisible(levelVip > 0);
        var titvarime = StringUtility.replaceAll(localized("VIP_SHOP_TEXT_0"), "@level", levelVip);
        this.txtVip1.setString(titvarime);
        this.txtRemainVipTime.setString(NewVipManager.getRemainTimeString(NewVipManager.getInstance().getRemainTime()));

        var texture = NewVipManager.getIconVip(levelVip);
        if (texture !== "") {
            this.iconCurVip.loadTexture(texture);
        }

        if (levelVip >= NewVipManager.NUMBER_VIP) {
            this.iconNextVip.setVisible(false);
        } else {
            var texture2 = NewVipManager.getIconVip(levelVip + 1);
            if (texture2 !== "") {
                this.iconNextVip.loadTexture(texture2);
            }
            this.iconNextVip.setVisible(true);
        }

        var nextLevelExp = NewVipManager.getInstance().getVpointNeed(levelVip);
        var vpoint = NewVipManager.getInstance().getVpoint();
        this.txtProgress.setString(vpoint + " / " + nextLevelExp);
        this.progressVip.setPercent(vpoint / nextLevelExp * 100);
        if (!this.iconNextVip.isVisible()) {
            this.txtProgress.setString(vpoint);
            this.progressVip.setPercent(100);
        }
    },

    updateUserInfo: function () {
        if (this._uiAvatar && this._uiName) {
            this._uiAvatar.asyncExecuteWithUrl(gamedata.getUserName(), gamedata.getUserName());
            this.setLabelText(gamedata.getDisplayName(), this._uiName);
        }

        if (this._uiBean) this._uiBean.setString(StringUtility.standartNumber(gamedata.getUserGold()));
        if (this._uiCoin) this._uiCoin.setString(StringUtility.standartNumber(gamedata.getUserCoin()));
        if (this._uiDiamond) this._uiDiamond.setString(StringUtility.standartNumber(gamedata.getUserDiamond()));
    },

    setInfoChangeGold: function (data, vpointGet, bonusTime, offerEvent, bonusDiamond) {
        var channelBought = gamedata.gameConfig.getShopGoldByType(data.channel);
        cc.log("setInfoChangeGold: ", JSON.stringify(data), JSON.stringify(channelBought));
        if (!channelBought) {
            sceneMgr.showOkDialogWithAction(LocalizedString.to("CHANGE_GOLD_SUCCESS"), null, function (btnID) {
                var gui = sceneMgr.getRunningScene().getMainLayer();
                if (gui && gui instanceof ShopIapScene) {
                    gui.effectGold();
                }
            });
            this.onClose();
            return;
        }
        var packageBought = channelBought["packages"][data.packetId];
        if (!packageBought) {
            sceneMgr.showOkDialogWithAction(LocalizedString.to("CHANGE_GOLD_SUCCESS"), null, function (btnID) {
                var gui = sceneMgr.getRunningScene().getMainLayer();
                if (gui && gui instanceof ShopIapScene) {
                    gui.effectGold();
                }
            });
            this.onClose();
            return;
        }
        var hourBonus = bonusTime || packageBought.hourBonus;
        var vpointBonus = vpointGet || packageBought.vPoint;
        var diamondBonus;
        //var ticketBonus = bonusTicket || 0;

        if (data.isOffer) {
            hourBonus = bonusTime;
            vpointBonus = vpointGet;
            //ticketBonus = bonusTicket;
            diamondBonus = bonusDiamond;
        } else {
            hourBonus = packageBought.hourBonus;
            vpointBonus = packageBought.vPoint;
            //ticketBonus = 0;
            offerEvent = [];
            var paymentType = channelBought.id;
            if (paymentType == Payment.GOLD_SMS_VINA || paymentType == Payment.GOLD_SMS_VIETTEL || paymentType == Payment.GOLD_SMS_MOBI)
                paymentType = Payment.GOLD_SMS;
            var ticketBonus = event.getEventBonusTicket(paymentType, packageBought["value"]);
            for (var i = 0; i < ticketBonus.length; i++){
                offerEvent.push({value: ticketBonus[i].numTicket, eventId: ticketBonus[i].idEvent});
            }
            diamondBonus = 0;
        }
        vpointBonus += (data.voucherVPoint != null ? data.voucherVPoint : 0);

        var vipLevel = NewVipManager.getInstance().getVipLevel();
        var vPointVip1 = NewVipManager.getInstance().getVpointNeed(0);
        if (vipLevel < 1) {
            hourBonus = 0;
        }

        var height = 195;
        if (data.goldGet > 0) {
            this.txtGold.setString(StringUtility.pointNumber(data.goldGet) + " Gold");
            this.txtGold.setPositionY(height);
            this.imgGold.setPositionY(height);
            this.txtBonusReason.setPositionY(height);
            height -= 30;
        } else {
        }
        this.txtGold.setVisible(data.goldGet > 0);
        this.imgGold.setVisible(data.goldGet > 0);
        if (!data.isOffer && data.goldGet > 0) {
            this.txtBonusReason.setVisible(true);
            this.txtBonusReason.setPositionX(this.txtGold.getAutoRenderSize().width + this.txtGold.getPositionX() + 5);
            this.txtBonusReason.setString(this.getBonusType(channelBought.id, packageBought, data.goldGet, data.voucherGold != null ? data.voucherGold : 0));
        } else {
            this.txtBonusReason.setVisible(false);
        }

        if (vpointBonus > 0) {
            this.txtVpoint.setString(StringUtility.pointNumber(vpointBonus) + " Vpoint");
            this.txtVpoint.setPositionY(height);
            this.imgVpoint.setPositionY(height);
            this.txtBonusVipReason.setPositionY(height);
            height -= 30;
        } else {
        }
        this.txtVpoint.setVisible(vpointBonus > 0);
        this.imgVpoint.setVisible(vpointBonus > 0);
        if (!data.isOffer && data.voucherVPoint != null && data.voucherVPoint > 0){
            this.txtBonusVipReason.setVisible(true);
            this.txtBonusVipReason.setPositionX(this.txtVpoint.getAutoRenderSize().width + this.txtVpoint.getPositionX() + 5);
            this.txtBonusVipReason.setString("(Voucher " + (data.voucherVPoint / (vpointBonus - data.voucherVPoint) * 100) + "%)");
        }
        else this.txtBonusVipReason.setVisible(false);

        if (hourBonus > 0) {
            this.txtTime.setString(StringUtility.replaceAll(localized("VIP_SHOP_HOUR_BONUS"), "@number", hourBonus));
            this.txtTime.setPositionY(height);
            this.imgTimeBonus.setPositionY(height);
            height -= 30;
        } else {
        }
        this.txtTime.setVisible(hourBonus > 0);
        this.imgTimeBonus.setVisible(hourBonus > 0);

        this.ticketNode.removeAllChildren();
        if (offerEvent && offerEvent.length > 0) {
            // var s = localized("VIP_FORMAT_TICKET");
            // var s = "";
            var x = 0;
            var dist = this.txtTicket.getPositionX() - this.imgTicket.getPositionX();
            var iconWidth = this.imgTicket.getContentSize().width * this.imgTicket.getScale() * 0.8;

            for (var i = 0; i < offerEvent.length; i++) {
                var tmp = offerEvent[i];
                var s = tmp.value + " " + event.getOfferTicketString(tmp.eventId);
                var txtTicket = new ccui.Text(s, this.txtTicket.getFontName(), this.txtTicket.getFontSize());
                var imgTicket = new ccui.ImageView(event.getTicketTexture(tmp.eventId));
                imgTicket.setScale(iconWidth / imgTicket.getContentSize().width);
                imgTicket.setPositionX(x);
                txtTicket.setPositionX(x + dist);
                txtTicket.setAnchorPoint(0, 0.5);
                this.ticketNode.addChild(imgTicket);
                this.ticketNode.addChild(txtTicket);
                if (i != offerEvent.length - 1) {
                    var sep = new ccui.ImageView("Lobby/Common/dot.png");
                    sep.setPositionX(x + dist + txtTicket.getContentSize().width + 10);
                    this.ticketNode.addChild(sep);
                    x = x + dist + txtTicket.getContentSize().width + 20 + iconWidth/2;
                }
                // if (i == 0) {
                //     s += (tmp.value + " " + event.getOfferTicketString(tmp.eventId));
                // } else {
                //     s += (" + " + tmp.value + " " + event.getOfferTicketString(tmp.eventId));
                // }
                // this.imgTicket.loadTexture(event.getTicketTexture(tmp.eventId));
            }
            // this.txtTicket.ignoreContentAdaptWithSize(true);
            // this.txtTicket.setString(s);
            // this.txtTicket.setVisible(true);
            // this.imgTicket.setVisible(true);
            // this.txtTicket.setPositionY(height);
            // this.imgTicket.setPositionY(height);
            this.ticketNode.setPositionY(height);
            height -= 30;
        } else {
            this.txtTicket.setVisible(false);
            this.imgTicket.setVisible(false);
        }
        this.txtTicket.setVisible(false);
        this.imgTicket.setVisible(false);

        if (diamondBonus > 0){
            this.txtDiamond.setString(StringUtility.pointNumber(diamondBonus) + " Kim cương");
            this.txtDiamond.setPositionY(height);
            this.imgDiamond.setPositionY(height);
        }
        else{}
        this.txtDiamond.setVisible(diamondBonus > 0);
        this.imgDiamond.setVisible(diamondBonus > 0);

        if (data.isOffer && data.goldGet <= 0) {
            this.pTxtChangeGold.removeAllChildren();
            var text = BaseLayer.createLabelText("", cc.color(255, 255, 255, 255));
            this.pTxtChangeGold.addChild(text);
            text.setString(localized("VIP_BUY_TICKET"));
        } else {
            this.updateDetailChangeGold(channelBought.id, packageBought);
        }
        this.data = data;
        this.data.vPoint = vpointBonus;
        this.data.hourBonus = hourBonus * 60 * 60 * 1000;
        this.data.diamondBonus = diamondBonus;
    },

    getBonusType: function (channelId, packageBought, totalGold, voucherGold) {
        var promoteType;
        switch (channelId) {
            case Payment.GOLD_G: {
                promoteType = gamedata.gameConfig.getIsFirstGoldG(packageBought["value"]);
                break;
            }
            case Payment.GOLD_IAP: {
                promoteType = gamedata.gameConfig.getIsFirstGoldIAP(packageBought["value"]);
                break;
            }
            case Payment.GOLD_SMS_VIETTEL:
            case Payment.GOLD_SMS_MOBI:
            case Payment.GOLD_SMS_VINA:
            case Payment.GOLD_SMS: {
                promoteType = gamedata.gameConfig.getIsFirstGoldSMSnew(channelId, packageBought["value"]);
                break;
            }
            case Payment.GOLD_ATM: {
                promoteType = gamedata.gameConfig.getIsFirstGoldATM(packageBought["value"]);
                break;
            }
            case Payment.GOLD_ZALO: {
                promoteType = gamedata.gameConfig.getIsFirstGoldZalo(packageBought["value"]);
                break;
            }
            case Payment.GOLD_ZING: {
                promoteType = gamedata.gameConfig.getIsFirstGoldZing(packageBought["value"]);
                break;
            }
            default: {
                promoteType = Payment.BONUS_NONE;
                break;
            }
        }

        var strBonus = "";
        var voucherRate = 0;
        switch (promoteType) {
            case Payment.BONUS_NONE:
                if (voucherGold > 0) voucherRate = voucherGold / (totalGold - voucherGold) * 100;
                strBonus = "";
                break;
            case Payment.BONUS_VIP:
                var vip = localized("VIP_BONUS_GOLD") + " ";
                var vipIndex = NewVipManager.getInstance().getVipLevel();
                var vipRate = packageBought["vipBonus"][vipIndex];
                if (voucherGold > 0) voucherRate = voucherGold / ((totalGold - voucherGold)/(100 + vipRate)*100) * 100;
                strBonus = vip + localized("VIP_VIP_LEVEL") + vipRate + "%";
                strBonus = StringUtility.replaceAll(strBonus, "@number", "");
                break;
            case Payment.BONUS_FIRST:
                var rate = packageBought["firstBonus"];
                if (voucherGold > 0) voucherRate = voucherGold / ((totalGold - voucherGold)/(100 + rate)*100) * 100;
                strBonus = localized("FIRST_BUY_GOLD_IAP") + rate + "%";
                break;
            case Payment.BONUS_SYSTEM:
                var rate = packageBought["shopBonus"];
                if (voucherGold > 0) voucherRate = voucherGold / ((totalGold - voucherGold)/(100 + rate)*100) * 100;
                strBonus = localized("SHOP_BONUS") + " " + rate + "%";
                break;
        }

        if (voucherRate > 0) strBonus += (strBonus == "" ? "" : " + ") + "Voucher " + voucherRate + "%";
        if (strBonus != "") strBonus = "(" + strBonus + ")";
        return strBonus;
    },

    updateDetailChangeGold: function (channelId, packageBought) {
        // cc.log("updateDetailChangeGold: ", channelId, JSON.stringify(packageBought));
        this.pTxtChangeGold.removeAllChildren();
        var txtDetails = new RichLabelText();
        var txts = [];
        txts.push({"text": localized("VIP_CHANGE_GOLD_TEXT_0"), "color": cc.color(255, 255, 255), "size": 15});
        var value;
        switch (channelId) {
            case Payment.GOLD_IAP: {
                value = "In App Purchase ";
                break;
            }
            case Payment.GOLD_SMS_VIETTEL:
            case Payment.GOLD_SMS_MOBI:
            case Payment.GOLD_SMS_VINA:
            case Payment.GOLD_SMS: {
                value = "SMS ";
                break;
            }
            case Payment.GOLD_ATM: {
                value = "ATM ";
                break;
            }
            case Payment.GOLD_ZALO: {
                value = "ZaloPay ";
                break;
            }
            case Payment.GOLD_ZING: {
                value = "ZingCard ";
                break;
            }
            case Payment.GOLD_G:
            default: {
                value = "";
                break;
            }
        }
        var cost = StringUtility.pointNumber(packageBought["value"]);
        if (channelId === Payment.GOLD_IAP) {
            if (!gamedata.isPortal()) {
                cost = iapHandler.getProductPrice(packageBought["androidId"], packageBought["iOSId"], packageBought["value"]);
            } else {
                cost = StringUtility.pointNumber(iapHandler.getProductPrice(packageBought["portalAndroidId"], packageBought["portalIOSId"], packageBought["value"]));
                if (Config.ENABLE_MULTI_PORTAL) {
                    cost = StringUtility.pointNumber(iapHandler.getProductPrice(packageBought["id_gg_portal"], packageBought["id_ios_portal"], packageBought["value"]));
                }
            }
        } else if (channelId === Payment.GOLD_G) {
            cost += "G";
        }
        value += cost;
        txts.push({"text": value, "font": SceneMgr.FONT_BOLD, "color": cc.color(10, 218, 30), "size": 15});
        txts.push({"text": localized("VIP_CHANGE_GOLD_TEXT_1"), "color": cc.color(255, 255, 255), "size": 15});
        txts.push({
            "text": StringUtility.pointNumber(packageBought["gold"]) + " Gold",
            "font": SceneMgr.FONT_BOLD,
            "color": cc.color(255, 246, 1),
            "size": 15
        });
        txtDetails.setText(txts);
        txtDetails.setPositionX(-txtDetails.getWidth() / 2);
        this.pTxtChangeGold.addChild(txtDetails);
    },

    effectChangeGoldSuccess: function () {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        var newLevel = NewVipManager.getInstance().getRealVipLevel();
        if (!(gui instanceof ShopIapScene) || !this.data) {
            if (newLevel > vipLevel) {
                NewVipManager.showUpLevelVip(vipLevel, newLevel);
            }
            NewVipManager.getInstance().setWaiting(false);
            gui.onUpdateGUI();
            this.onClose();
            return;
        }
        var distanceBg = 15;
        var pStart = this.getWorldPos(this.imgGold);
        pStart.y += distanceBg;
        var pEnd = this.getWorldPos(this._uiAvatar);
        pEnd.y += this.distanceY;
        var timeRun = 0.3;
        var gold = this.data.goldGet;
        var actionMove = cc.moveBy(timeRun, 0, this.distanceY);
        this.pInfo.runAction(actionMove);
        this.pTest.runAction(actionMove.clone());
        this.bgBot.runAction(actionMove.clone());

        this.bg.setPositionY(this.bg.defaultPos.y);
        this.bg.runAction(cc.moveBy(timeRun, 0, distanceBg));
        timeRun = timeRun * 2;

        // setTimeout(function () {
        timeRun += effectMgr.flyCoinEffect2(sceneMgr.layerGUI, gold, pStart, pEnd, timeRun);
        // }, timeRun * 1000);

        effectMgr.runLabelPoint(this._uiBean, (gamedata.userData.bean - gold), gamedata.userData.bean, timeRun);
        var vpoint = this.data.vPoint;
        var timeBonus = this.data.hourBonus;
        var diamondBonus = this.data.diamondBonus;
        var vPointPos = this.getWorldPos(this.imgVpoint);
        vPointPos.y += distanceBg;
        var vPointSpriteName = "res/Lobby/GUIVipNew/iconVpoint.png";
        var vPointEnd = this.getWorldPos(this.txtProgress);
        vPointEnd.y += this.distanceY;
        var timeBonusPos = this.getWorldPos(this.imgTimeBonus);
        timeBonusPos.y += distanceBg;
        var diamondBonusPos = this.getWorldPos(this.imgDiamond);
        diamondBonusPos.y += distanceBg;

        timeRun += effectMgr.flyItemEffect(sceneMgr.layerGUI, vPointSpriteName, vpoint, vPointPos, vPointEnd, timeRun, true);
        var curVpoint = NewVipManager.getInstance().getVpoint();
        timeRun += effectMgr.runVipProgress(this.bgProgressVip, this.progressVip, this.txtProgress, null, this.iconCurVip,
            this.iconNextVip, vpoint, timeRun, false, vipLevel, curVpoint);

        if (timeBonus > 0) {
            var timeBonusSpriteName = "res/Lobby/GUIVipNew/iconTime.png";
            var timeBonusEnd = this.getWorldPos(this.txtRemainVipTime);
            timeBonusEnd.y += this.distanceY;
            timeRun += effectMgr.flyItemEffect(sceneMgr.layerGUI, timeBonusSpriteName, timeBonus, timeBonusPos, timeBonusEnd, timeRun);
        }
        if (diamondBonus > 0) {
            var diamondBonusSpriteName = "res/Lobby/LobbyGUI/iconDiamond.png";
            var diamondBonusEnd = this.getWorldPos(this.iconDiamond);
            diamondBonusEnd.y += this.distanceY;
            timeRun += effectMgr.flyItemEffect(sceneMgr.layerGUI, diamondBonusSpriteName, diamondBonus, diamondBonusPos, diamondBonusEnd, timeRun);
            effectMgr.runLabelPoint(this._uiDiamond, (gamedata.userData.diamond - diamondBonus), gamedata.userData.diamond, timeRun);
        }
        setTimeout(function () {
            var levelVip = NewVipManager.getInstance().getRealVipLevel();
            var isVip = NewVipManager.getInstance().isVip();
            var txtVip1 = this.txtVip1;
            var lbTimeBonus = this.txtRemainVipTime;
            lbTimeBonus.setVisible(isVip);
            txtVip1.setVisible(isVip);
            var titleTime = StringUtility.replaceAll(localized("VIP_SHOP_TEXT_0"), "@level", levelVip);
            txtVip1.setString(titleTime);

            var txtTemp = BaseLayer.createLabelText(txtVip1.getString());
            txtTemp.setFontSize(txtVip1.getFontSize());
            lbTimeBonus.setPositionX(txtVip1.getPositionX() + txtTemp.getContentSize().width + 3);

            NewVipManager.getInstance().setWaiting(false);
            this.txtRemainVipTime.setString(NewVipManager.getRemainTimeString(NewVipManager.getInstance().getRemainTime()));
        }.bind(this), timeRun * 1000);

        setTimeout(function () {
            if (newLevel > vipLevel) {
                NewVipManager.showUpLevelVip(vipLevel, newLevel);
            }
            var action = cc.callFunc(function () {
                this.onClose();
            }.bind(this));
            this.bg.runAction(cc.sequence(new cc.EaseBackIn(cc.scaleTo(0.5, 0)), action));
            if (gui instanceof ShopIapScene) {
                gui.updateVipInfo();
                gui.onUpdateGUI();
            }
        }.bind(this), (timeRun + 1) * 1000);
    },

    onButtonRelease: function (btn, id) {
        this.updateUserInfo();
        this.effectChangeGoldSuccess();
        this.btnOK.setVisible(false);
    },

    getWorldPos: function (target) {
        return target.getParent().convertToWorldSpace(target.getPosition());
    }
});

VipChangeGoldSuccess.className = "VipChangeGoldSuccess";

var VipUpLevelGUI = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.listChangeBenefit = [];
        this.testVipIndex = 0;
        this.initWithBinaryFile("Vip_UpLevel.json");
    },
    onEnterFinish: function () {
        this.testVipIndex = 0;
        // this.setChangeBenefit(this.testVipIndex, 1);
        this.setBackEnable(true);
    },
    initGUI: function () {
        this.bg = this.getControl("bg");
        this.txtVip = this.getControl("txtVip", this.bg);
        this.imgDecorate = this.getControl("imgDecorate", this.bg);
        this.imgDecorate1 = this.getControl("imgDecorate1", this.imgDecorate);
        this.pIconVip = this.getControl("pIconVip", this.imgDecorate);
        this.pBenefitChange = this.getControl("pBenefitChange", this.bg);
        this.btnOK = this.customButton("btnOK", 1, this.bg);
        var btnNext = this.customButton("btnNext", 2, this.bg);
        btnNext.setVisible(false);

        this.viewBenefitChange = new cc.TableView(this, this.pBenefitChange.getContentSize());
        this.viewBenefitChange.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.viewBenefitChange.setPosition(0, 0);
        this.viewBenefitChange.setVerticalFillOrder(0);
        this.viewBenefitChange.setDelegate(this);
        this.viewBenefitChange.defaultPos = this.viewBenefitChange.getPosition();
        this.pBenefitChange.addChild(this.viewBenefitChange);
    },

    setChangeBenefit: function (oldLevel, newLevel) {
        cc.log("setChangeBenefit: ", oldLevel, newLevel);
        this.txtVip.setString(StringUtility.replaceAll(localized("VIP_NAME"), "@level", newLevel));
        var oldBenefit = NewVipManager.getInstance().getListBenefit(oldLevel);
        var newBenefit = NewVipManager.getInstance().getListBenefit(newLevel);
        // cc.log("setChangeBenefit: ", JSON.stringify(oldBenefit), JSON.stringify(newBenefit))
        this.listChangeBenefit = [];
        var i;
        for (i in newBenefit) {
            var benefit = newBenefit[i];
            var isSameBenefit = false;
            var j;
            for (j in oldBenefit) {
                // cc.log("check smae: ", JSON.stringify(oldBenefit[j]), JSON.stringify(benefit), JSON.stringify(oldBenefit[j]) === JSON.stringify(benefit));
                if (JSON.stringify(oldBenefit[j]) === JSON.stringify(benefit)) {
                    isSameBenefit = true;
                    break;
                }
            }
            if (isSameBenefit) {
                continue;
            }

            benefit.isNewBenefit = 1;
            benefit.oldValue = 0;
            benefit.upFromFreeVip = (oldLevel === 0);
            for (j in oldBenefit) {
                if (benefit["index"] === oldBenefit[j]["index"]) {
                    benefit.isNewBenefit = 0;
                    benefit.oldValue = oldBenefit[j]["value"];
                    break;
                }
            }
            this.listChangeBenefit.push(benefit);
        }

        this.listChangeBenefit = this.listChangeBenefit.sort(function (a, b) {
            if (a.isNewBenefit === b.isNewBenefit) {
                return a["index"] - b["index"];
            }
            return a.isNewBenefit - b.isNewBenefit;
        });
        this.viewBenefitChange.reloadData();
        this.changeIconVip(oldLevel, newLevel);
    },

    changeIconVip: function (oldLevel, newLevel) {
        this.pIconVip.removeAllChildren(true);
        var delayTime = 0;
        if (oldLevel > 0 && oldLevel <= NewVipManager.NUMBER_VIP) {
            var imgOldVip = new ccui.Button(NewVipManager.getImageVip(oldLevel));
            imgOldVip.setScale(2);
            this.pIconVip.addChild(imgOldVip);
            var actionDark = cc.callFunc(function () {
                this.setBright(false);
            }.bind(imgOldVip));
            var delayDark = 0.5;
            var timeMove = 0.5;
            var actionMove = new cc.EaseBackIn(cc.moveBy(timeMove, -cc.winSize.width / 2, 0));
            imgOldVip.runAction(cc.sequence(actionMove));
            // delayTime += delayDark + timeMove * 2;
            delayTime = timeMove;
        }
        this.imgDecorate1.stopAllActions();
        this.imgDecorate1.setPosition(this.imgDecorate1.defaultPos);
        var timeAction = 0.3;
        setTimeout(function () {
            var effect = db.DBCCFactory.getInstance().buildArmatureNode("Ngoc1");
            if (effect) {
                var levelVip = newLevel;
                this.pIconVip.addChild(effect);
                effect.gotoAndPlay("lv" + levelVip + "_0", -1, -1, 1);
                effect.runAction(cc.scaleTo(0.2, 1).easing(cc.easeExponentialOut()));
                effect.setCompleteListener(function () {
                    effect.gotoAndPlay("lv" + levelVip + "_1", -1, -1, 0);
                }.bind(effect));
            }
            effect.setOpacity(0);
            effect.setScale(10);
            var actionFadeIn = new cc.EaseExponentialOut(cc.fadeIn(timeAction));
            var actionZoomIn = new cc.EaseExponentialOut(cc.scaleTo(timeAction, 1));
            var actionBlink = cc.callFunc(function () {
                NewVipScene.addEffectHighlight(this.pIconVip, 1, 1, cc.p(0, 0));
            }.bind(this));

            effect.runAction(cc.spawn(actionFadeIn, cc.sequence(actionZoomIn, actionBlink)));
            this.effectDecorate();
        }.bind(this), delayTime * 1000);

        this.showViewBenefit(delayTime + timeAction * 2);
    },

    showViewBenefit: function (delayTime) {
        this.pBenefitChange.stopAllActions();
        var distance = this.pBenefitChange.height;
        this.pBenefitChange.setPositionY(this.pBenefitChange.defaultPos.y + distance);
        this.viewBenefitChange.stopAllActions();
        this.viewBenefitChange.setPositionY(this.viewBenefitChange.defaultPos.y - distance);
        var timeMove = 1;
        var actionMove = cc.moveBy(timeMove, 0, -distance);
        this.pBenefitChange.runAction(cc.sequence(cc.delayTime(delayTime), actionMove));
        var actionScroll = cc.callFunc(function () {
            this.scrollToEnd(1);
        }.bind(this));
        this.viewBenefitChange.runAction(cc.sequence(cc.delayTime(delayTime), actionMove.clone().reverse(), actionScroll));

        this.btnOK.setOpacity(0);
        this.btnOK.runAction(cc.sequence(cc.delayTime(delayTime + timeMove), cc.fadeIn(timeMove)));
    },

    effectDecorate: function () {
        var defaultX = this.imgDecorate1.defaultPos.x;
        var defaultY = this.imgDecorate1.defaultPos.y;

        var array1 = [cc.p(defaultX - 5, defaultY + 5), cc.p(defaultX, defaultY + 7), cc.p(defaultX + 5, defaultY + 5)];
        var array2 = [cc.p(defaultX + 5, defaultY + 5), cc.p(defaultX + 7, defaultY), cc.p(defaultX + 5, defaultY - 5)];
        var array3 = [cc.p(defaultX + 5, defaultY - 5), cc.p(defaultX, defaultY - 7), cc.p(defaultX - 5, defaultY - 5)];
        var array4 = [cc.p(defaultX - 5, defaultY - 5), cc.p(defaultX - 7, defaultY), cc.p(defaultX - 5, defaultY + 5)];
        var timeMove1 = 0.2;
        var actionQuick = cc.callFunc(function () {

            var easeAction = cc.easeOut(1.5);
            var actionUp = new cc.BezierTo(timeMove1, array1).easing(easeAction);
            var actionRight = new cc.BezierTo(timeMove1, array2).easing(easeAction);
            var actionDown = new cc.BezierTo(timeMove1, array3).easing(easeAction);
            var actionLeft = new cc.BezierTo(timeMove1, array4).easing(easeAction);
            this.runAction(cc.sequence(actionUp, actionRight, actionDown, actionLeft).repeat(2));
        }.bind(this.imgDecorate1));

        var timeMove = 0.5;
        var actionSlow = cc.callFunc(function () {

            var easeAction = cc.easeOut(1.5);
            var actionUp = new cc.BezierTo(timeMove, array1).easing(easeAction);
            var actionRight = new cc.BezierTo(timeMove, array2).easing(easeAction);
            var actionDown = new cc.BezierTo(timeMove, array3).easing(easeAction);
            var actionLeft = new cc.BezierTo(timeMove, array4).easing(easeAction);

            this.runAction(cc.sequence(actionUp, actionRight, actionDown, actionLeft).repeatForever());
        }.bind(this.imgDecorate1));

        this.imgDecorate1.runAction(cc.sequence(actionQuick, cc.delayTime(timeMove1 * 8), actionSlow));
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new BenefitChangeCell();
        }

        var info = this.listChangeBenefit[idx];
        cell.setInfo(info);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(377, 38);
    },

    numberOfCellsInTableView: function (table) {
        return this.listChangeBenefit.length;
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case 1: {
                this.onClose();
                break;
            }
            case 2: {
                this.testVipIndex++;
                this.setChangeBenefit(this.testVipIndex, this.testVipIndex + 1);
                break;
            }
        }
    },

    onClose: function () {
        this._super();
        var dailyBonus = NewVipManager.getInstance().getDailyBonusGold();
        if (dailyBonus) {
            var gui = sceneMgr.openGUI(VipDailyGoldBonusGUI.className);
            gui.setInfoDailyBonus(dailyBonus);
        }
        else if (StorageManager.getInstance().showUnlockItemVip()){
            //unlock item show
        }
    },

    scrollToEnd: function (actionTime) {
        NewVipScene.scrollToPercentHorizonal(this.viewBenefitChange, 100, actionTime);
    }
});

VipUpLevelGUI.className = "VipUpLevelGUI";

var BenefitChangeCell = cc.TableViewCell.extend({

    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("Vip_BenefitChangeCell.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);
        this.imgType = ccui.Helper.seekWidgetByName(this._layout, "imgType");
        this.benefitDetail = ccui.Helper.seekWidgetByName(this._layout, "benefitDetail");
        this.oldBenefit = ccui.Helper.seekWidgetByName(this._layout, "oldBenefit");
        this.newBenefit = ccui.Helper.seekWidgetByName(this._layout, "newBenefit");
        this.txtTmp = ccui.Helper.seekWidgetByName(this._layout, "txtTmp");
    },

    setInfo: function (inf) {
        // cc.log("BenefitChangeCell: ", JSON.stringify(inf));
        this.benefitDetail.setString(NewVipManager.getInstance().getBenefitName(inf.index));
        this.imgType.loadTexture(NewVipManager.getInstance().getImageBenefit(inf.index));
        this.newBenefit.setString(NewVipManager.getInstance().getValueBenefit(inf.index, inf.value, true));
        this.oldBenefit.setString(NewVipManager.getInstance().getValueBenefit(inf.index, inf.oldValue, true));
        this.newBenefit.setVisible(inf.value !== inf.oldValue);
        this.oldBenefit.setVisible(!inf.upFromFreeVip);
        this.txtTmp.setVisible(this.newBenefit.isVisible() && this.oldBenefit.isVisible() && this.newBenefit.getString() !== "");

        // this.oldBenefit.setVisible(!inf.isNewBenefit);
    }
});

var VipDailyGoldBonusGUI = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("Vip_DailyBonusGUI.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.txtGold = this.getControl("txtGold", this.bg);
        this.txtVip = this.getControl("txtVip", this.bg);
        this.imgVip = this.getControl("imgVip", this.bg);
        this.imgVip.ignoreContentAdaptWithSize(true);
        this.decorate = this.getControl("decorate", this.bg);
        this.btnOK = this.customButton("btnOK", 1, this.bg);

        // this.blurLayer = new BlurLayer(sceneMgr.getRunningScene().getMainLayer());
        // this._layout.addChild(this.blurLayer, -1);

        var pInfo = this.getControl("bot");//this.getControl("bot");

        var bgAvatar = this.getControl("bgAvatar", pInfo);
        this._uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");////engine.UIAvatar.create("Common/defaultAvatar.png");
        var size = bgAvatar.getContentSize();
        this._uiAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        bgAvatar.addChild(this._uiAvatar, 0);

        this.imgVipUser = this.getControl("imgVipUser", pInfo);
        this.imgVipUser.ignoreContentAdaptWithSize(true);

        this._uiName = this.getControl("name", pInfo);
        this._uiCoin = this.getControl("xu", this.btnG);
        this._uiBean = this.getControl("gold", this.btnGoldSmall);
        this.pInfo = pInfo;
        this.imgBot = this.getControl("imgBot");
    },

    onEnterFinish: function () {
        this.onUpdateUserInfo();
        this.startEffect();
    },

    setInfoDailyBonus: function (gold) {
        this.goldGet = gold;
        this.txtGold.setString(StringUtility.pointNumber(gold));
        var levelVip = NewVipManager.getInstance().getRealVipLevel();
        this.imgVip.loadTexture(NewVipManager.getIconVip(levelVip));
        this.imgVipUser.loadTexture(NewVipManager.getIconVip(levelVip));
        this.txtVip.setString(StringUtility.replaceAll(localized("VIP_NAME"), "@level", levelVip));
        NewVipManager.getInstance().saveDailyBonusGold(0);
    },

    startEffect: function () {
        this.distanceY = this.pInfo.getContentSize().height * 1.2;
        this.imgBot.setPositionY(this.imgBot.defaultPos.y - this.distanceY);
        this.pInfo.setPositionY(this.pInfo.defaultPos.y - this.distanceY);

        this.bg.setScale(0);
        var action = cc.callFunc(function () {
            var effect = db.DBCCFactory.getInstance().buildArmatureNode("HighlightBig");
            if (effect) {
                this.decorate.addChild(effect, 101);
                effect.gotoAndPlay("1", 0, -1, 1);
                var contentSize = this.decorate.getContentSize();
                var anchor = this.decorate.getAnchorPoint();
                effect.setPosition(contentSize.width * anchor.x, contentSize.height * anchor.y);
            }
        }.bind(this));
        this.bg.runAction(cc.sequence(cc.delayTime(1), new cc.EaseBackOut(cc.scaleTo(0.5, 1)), action));
        this.btnOK.setVisible(true);
        this.bg.setPosition(this.bg.defaultPos);
    },

    effectCReceiveGold: function () {
        var gui = sceneMgr.getRunningScene().getMainLayer();
        if (!(gui instanceof LobbyScene)) {
            gui.onUpdateGUI();
            this.onClose();
            return;
        }
        var distanceBg = 15;
        var pStart = this.getWorldPos(this.txtGold);
        pStart.y += distanceBg;
        var pEnd = this.getWorldPos(this._uiAvatar);
        pEnd.y += this.distanceY;
        var timeRun = 0.3;
        var gold = this.goldGet;
        var actionMove = cc.moveBy(timeRun, 0, this.distanceY);
        this.pInfo.runAction(actionMove);
        this.imgBot.runAction(actionMove.clone());

        this.bg.setPositionY(this.bg.defaultPos.y);
        this.bg.runAction(cc.moveBy(timeRun, 0, distanceBg));
        timeRun = timeRun * 2;

        timeRun += effectMgr.flyCoinEffect2(sceneMgr.layerSystem, gold, pStart, pEnd, timeRun);
        effectMgr.runLabelPoint(this._uiBean, (gamedata.userData.bean - gold), gamedata.userData.bean, timeRun);
        setTimeout(function () {
            var action = cc.callFunc(function () {
                this.onClose();
            }.bind(this));
            this.bg.runAction(cc.sequence(new cc.EaseBackIn(cc.scaleTo(0.5, 0)), action));
            if (gui instanceof LobbyScene) {
                gui.onUpdateGUI();
            }
        }.bind(this), (timeRun + 1) * 1000);
    },

    onUpdateUserInfo: function () {
        if (this._uiAvatar && this._uiName) {
            this._uiAvatar.asyncExecuteWithUrl(gamedata.getUserName(), gamedata.getUserName());
            this.setLabelText(gamedata.getDisplayName(), this._uiName);
        }

        if (this._uiBean) this._uiBean.setString(StringUtility.standartNumber(gamedata.getUserGold()));
        if (this._uiCoin) this._uiCoin.setString(StringUtility.standartNumber(gamedata.getUserCoin()));
    },

    onButtonRelease: function (btn, id) {
        this.effectCReceiveGold();
        this.btnOK.setVisible(false);
        popUpManager.removePopUp(PopUpManager.DAILY_BONUS_VIP);
    },

    getWorldPos: function (target) {
        return target.getParent().convertToWorldSpace(target.getPosition());
    },

    onCloseDone: function() {
        this._super();
        if (StorageManager.getInstance().showUnlockItemVip()){
            //show unlock item
        }
    }
});

VipDailyGoldBonusGUI.className = "VipDailyGoldBonusGUI";

var ConvertOldVip = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("Vip_ConvertOldVipGUI.json");
        this.data = null;
        this.currentPhase = 0;
    },

    onEnterFinish: function () {
        this.scheduleUpdate();
    },

    onExit: function () {
        this._super();
        this.unscheduleUpdate();
    },

    initGUI: function () {
        this.bgConvert = this.getControl("bgConvert");
        this.txtTilteOldVip = this.getControl("txtTilteOldVip", this.bgConvert);
        this.txtTilteNewVip = this.getControl("txtTilteNewVip", this.bgConvert);
        this.imgOldVip = this.getControl("imgOldVip", this.bgConvert);
        this.txtOldRemainTime = this.getControl("txtOldRemainTime", this.bgConvert);
        this.txtRatioConvert = this.getControl("txtRatioConvert", this.bgConvert);
        this.txtBonusGold = this.getControl("txtBonusGold", this.txtRatioConvert);
        this.pProgress = this.getControl("pProgress", this.bgConvert);
        this.bgProgressExp = this.getControl("bgProgressExp", this.pProgress);
        this.progressExp = this.getControl("progressExp", this.bgProgressExp);
        this.txtExp = this.getControl("txtExp", this.progressExp);
        this.iconCurVip = this.getControl("iconCurVip", this.pProgress);
        this.iconNextVip = this.getControl("iconNextVip", this.pProgress);
        this.iconCurVip.ignoreContentAdaptWithSize(true);
        this.iconNextVip.ignoreContentAdaptWithSize(true);
        this.txtVpoint = this.getControl("txtVpoint", this.bgConvert);
        this.imgVpoint = this.getControl("imgVpoint", this.bgConvert);
        this.pArrow = this.getControl("pArrow", this.bgConvert);
        this.imgArrow = this.getControl("imgArrow", this.pArrow);
        this.txtGstar = this.getControl("txtGstar", this.bgConvert);
        this.pMid = this.getControl("pMid", this.bgConvert);
        this.txtTilteReceive = this.getControl("txtTilteReceive", this.bgConvert);
        this.pDecorate = this.getControl("pDecorate", this.bgConvert);
        this.imgVipBig = this.getControl("imgVipBig", this.bgConvert);
        this.imgVipFree = this.getControl("imgVipFree", this.bgConvert);
        this.txtContinue = this.getControl("txtContinue", this.bgConvert);
        this.title = this.getControl("title", this.bgConvert);
        this.btnContinue = this.customButton("btnContinue", ConvertOldVip.BTN_CONTINUE, this.bgConvert);
        this.btnContinue.setVisible(false);

        this.pFlyItem = this.getControl("fog");
        this.pBlurItemLayer = new ItemBlurLayer(this.pFlyItem);
        this.pFlyItem.addChild(this.pBlurItemLayer);
        this.pFlyItemLayer = new ItemFlyLayer(this.pFlyItem);
        this.pFlyItem.addChild(this.pFlyItemLayer);
        var panelHeight = this.pFlyItem.getContentSize().height;
        this.pFlyItemLayer.setDistance(panelHeight * 0.5, panelHeight * 0.25);

        this.bgConvert.setOpacity(0);
        var panelWidth = this.bgConvert.getContentSize().width;
        this.txtTilteOldVip.setPositionX(panelWidth / 2);
        this.imgOldVip.setPositionX(panelWidth / 2);
        this.txtOldRemainTime.setPositionX(panelWidth / 2);
        this.txtGstar.setPositionX(panelWidth / 2);
        this.txtRatioConvert.setPositionX(panelWidth / 2);
        this.txtVpoint.setOpacity(0);
        this.imgVpoint.setOpacity(0);
        this.txtTilteNewVip.setOpacity(0);
        this.pProgress.setOpacity(0);
        this.imgArrow.setVisible(false);
        this.txtGstar.setOpacity(0);
        this.txtTilteReceive.setOpacity(0);
        this.pDecorate.setOpacity(0);
        this.imgVipBig.setOpacity(0);
        this.imgVipFree.setOpacity(0);
        this.title.setOpacity(0);
        this.iconCurVip.setVisible(false);
        this.txtContinue.setOpacity(0);

        this.bgEqualBenefit = this.getControl("bgEqualBenefit");
        this.pOldBenefit = this.getControl("pOldBenefit", this.bgEqualBenefit);
        this.pNewBenefit = this.getControl("pNewBenefit", this.bgEqualBenefit);
        this.btnCurrPanel = this.getControl("btnCurrPanel", this.pOldBenefit);
        this.btnNextPanel = this.getControl("btnNextPanel", this.pNewBenefit);
        this.pOldTarget = this.getControl("pOldTarget", this.bgEqualBenefit);
        this.pNewTarget = this.getControl("pNewTarget", this.bgEqualBenefit);
        this.pOldBenefit.setPosition(this.pOldTarget.getPosition());
        this.pNewBenefit.setPosition(this.pNewTarget.getPosition());
        // this.bgEqualBenefit.setVisible(false);
        this.bgEqualBenefit.setPositionX(this.bgEqualBenefit.defaultPos.x + this.bgEqualBenefit.getContentSize().width);
        this.btnConfirm = this.customButton("btnConfirm", ConvertOldVip.BTN_CONFIRM);
        this.btnConfirm.setVisible(false);

        this.pOldBenefit.viewBenefit = new DetailBenefit();
        this.pOldBenefit.addChild(this.pOldBenefit.viewBenefit);

        this.pNewBenefit.viewBenefit = new DetailBenefit();
        this.pNewBenefit.addChild(this.pNewBenefit.viewBenefit);
        this.btnCurrPanel.setLocalZOrder(1);
        this.btnNextPanel.setLocalZOrder(1);

        var curListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                var select = event.getCurrentTarget();
                var pos = select.convertToWorldSpaceAR(cc.p(0, 0));
                var rect = cc.rect(pos.x - select.getContentSize().width / 2, pos.y, select.getContentSize().width, select.getContentSize().height);

                if (cc.rectContainsPoint(rect, touch.getLocation())) {
                    ConvertOldVip.isFollowCurrentLevel = true;
                }
                return false;
            },
            onTouchMoved: function (touch, event) {

            },
            onTouchEnded: function (touch, event) {

            }
        });
        cc.eventManager.addListener(curListener, this.btnCurrPanel);

        var nextListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                var select = event.getCurrentTarget();
                var pos = select.convertToWorldSpaceAR(cc.p(0, 0));
                var rect = cc.rect(pos.x - select.getContentSize().width / 2, pos.y, select.getContentSize().width, select.getContentSize().height);

                if (cc.rectContainsPoint(rect, touch.getLocation())) {
                    ConvertOldVip.isFollowCurrentLevel = false;
                }
                return false;
            },
            onTouchMoved: function (touch, event) {

            },
            onTouchEnded: function (touch, event) {

            }
        });
        cc.eventManager.addListener(nextListener, this.btnNextPanel);
    },

    convertOldVip: function (data) {
        this.data = data;
        this.onButtonRelease(null, ConvertOldVip.BTN_CONTINUE);
        this.setDataBenefitEqual();
    },

    setDataBenefitEqual: function () {
        var data = this.data;
        var vPointV = parseFloat(data.vPointV);
        var vPointG = parseFloat(data.vPointG);
        var goldBonus = parseFloat(data.goldBonus);
        var levelVip = NewVipManager.getLevelWithVpoint(vPointV + vPointG);
        this.pOldBenefit.viewBenefit.setInfoBenefit2(data.oldVip, levelVip, data.oldTime, data.remainTime, false, goldBonus);
        this.pOldBenefit.viewBenefit.iconVip.setScale(0.3);
        this.pNewBenefit.viewBenefit.setInfoBenefit2(data.oldVip, levelVip, data.oldTime, data.remainTime, true, goldBonus);
        var newScale = (levelVip > 0) ? 1 : 0.3;
        this.pNewBenefit.viewBenefit.iconVip.setScale(newScale);
    },

    getActionsByPhase: function (phase) {
        var data = this.data;
        var vPointPos = this.bgConvert.convertToWorldSpace(this.imgVpoint.getPosition());
        var vPointEnd = this.txtExp.getParent().convertToWorldSpace(this.txtExp.getPosition());
        var vPointV = parseFloat(data.vPointV);
        var vPointG = parseFloat(data.vPointG);
        var levelVip = NewVipManager.getLevelWithVpoint(vPointV + vPointG);
        var actions = [];
        var timeFadeIn = 1;
        var timeFadeOut = 1;
        var timeDelayMini = 0.1;
        var timeDelayNormal = 0.4;
        if (vPointV <= 0 && phase === 0) {
            phase = 1;
            this.currentPhase++;
        }
        if (vPointG <= 0 && phase === 1) {
            phase = 2;
            this.currentPhase++;
        }

        var actionFirstMove = cc.callFunc(function () {
            var distanceX = this.txtTilteOldVip.getPositionX() - this.txtTilteOldVip.defaultPos.x;
            var actionMove = cc.moveBy(0.2, -distanceX, 0);
            this.txtTilteOldVip.runAction(actionMove);
            this.imgOldVip.runAction(actionMove.clone());
            this.txtOldRemainTime.runAction(actionMove.clone());
            this.txtRatioConvert.runAction(actionMove.clone());
            this.txtGstar.runAction(actionMove.clone());
        }.bind(this));
        var actionTxtTimeBlink = cc.callFunc(function () {
            var time = 1;
            this.txtContinue.runAction(cc.sequence(cc.fadeIn(time), cc.delayTime(time), cc.fadeOut(time), cc.delayTime(time)).repeatForever());
        }.bind(this));

        if (phase === 0) {
            this.iconNextVip.loadTexture(NewVipManager.getIconVip(1));
            this.progressExp.setPercent(0);
            this.txtExp.setString("0 / " + NewVipManager.getInstance().getVpointNeed(0));
            this.getActionFadeIn(actions, this.bgConvert, timeFadeIn, timeDelayNormal);
            actions.push(actionFirstMove);
            actions.push(cc.delayTime(timeDelayNormal));
            if (vPointV > 0) {
                // this.getActionVisible(actions, this.btnContinue, false, 0);
                // this.getActionFadeIn(actions, this.imgArrow, timeFadeIn, timeDelayNormal);
                this.getActionArrowMove(actions, timeDelayNormal, timeDelayNormal);
                this.getActionFadeIn(actions, this.txtTilteNewVip, timeFadeIn, 0);
                this.getActionFadeIn(actions, this.pProgress, timeFadeIn, 0);
                this.getActionFadeIn(actions, this.txtVpoint, timeFadeIn, 0);
                this.getActionFadeIn(actions, this.imgVpoint, timeFadeIn, 1);

                this.getActionAddVpoint(actions, vPointV, vPointPos, vPointEnd, this.bgProgressExp, this.progressExp, this.txtExp, null, this.iconCurVip, this.iconNextVip, 0, 0);

                // this.getActionFadeIn(actions, this.txtContinue, timeFadeIn, timeDelayMini);
                actions.push(actionTxtTimeBlink);
                this.getActionVisible(actions, this.btnContinue, true, 0);

                this.imgOldVip.loadTexture("GUIVipNew/imgOldVip" + data.oldVip + ".png");
                var strTxt = localized("VIP_REMAIN_TIME_TITLE");
                strTxt += NewVipManager.getRemainTimeString(data.oldTime);
                this.txtOldRemainTime.setString(strTxt);
                this.txtVpoint.setString("+ " + vPointV);

                var oldConfig = NewVipManager.getInstance().getOldVipConfig();
                var oldPackage = oldConfig[data.oldVip + ""];
                var content = localized("VIP_CONVERT_REASON_0");
                content = StringUtility.replaceAll(content, "@type", localized("VIP_OLD_TYPE_" + data.oldVip));
                content = StringUtility.replaceAll(content, "@number", oldPackage["time"]);
                content = StringUtility.replaceAll(content, "@numVpoint", oldPackage["price"]);
                this.txtRatioConvert.setString(content);
                this.txtBonusGold.setString(localized("VIP_CONVERT_OLD_VIP_TEXT_3"));
            }
            return actions;
        } else if (phase === 1) {
            var level = NewVipManager.getLevelWithVpoint(vPointV);
            var vPointRemain = NewVipManager.getRemainVpoint(vPointV);
            this.iconCurVip.loadTexture(NewVipManager.getIconVip(level));
            this.iconNextVip.loadTexture(NewVipManager.getIconVip(level + 1));
            var newVpointNeed = NewVipManager.getInstance().getVpointNeed(level);
            this.progressExp.setPercent(vPointRemain / newVpointNeed * 100);
            this.txtExp.setString(vPointRemain + " / " + newVpointNeed);
            if (level >= NewVipManager.NUMBER_VIP) {
                this.progressExp.setPercent(100);
                this.txtExp.setString(vPointRemain);
            }
            actions = [];
            actions.push(actionFirstMove);
            actions.push(cc.delayTime(timeDelayMini));
            if (vPointV > 0) {
                this.getActionFadeOut(actions, this.imgOldVip, timeFadeOut, 0);
                this.getActionFadeOut(actions, this.txtOldRemainTime, timeFadeOut, 0);
                this.getActionFadeOut(actions, this.txtRatioConvert, timeFadeOut, 0);
            } else {
                this.getActionVisible(actions, this.imgOldVip, false, 0);
                this.getActionVisible(actions, this.txtOldRemainTime, false, 0);
                this.txtRatioConvert.setOpacity(0);
            }
            this.getActionFadeIn(actions, this.bgConvert, timeDelayNormal, timeDelayNormal);
            this.getActionFadeOut(actions, this.txtContinue, timeFadeOut, 0);
            this.getActionFadeOut(actions, this.imgVpoint, timeFadeOut, 0);
            this.getActionFadeOut(actions, this.txtRatioConvert, timeFadeOut, 0);

            // this.getActionFadeOut(actions, this.imgArrow, timeFadeOut, 0);
            this.getActionVisible(actions, this.imgArrow, false, 0);
            var timeDelay = (vPointV > 0) ? 1 : 0;
            this.getActionFadeOut(actions, this.txtVpoint, timeFadeOut, timeDelay);

            if (vPointG > 0) {
                actions.push(cc.callFunc(function () {
                    this.txtVpoint.setString("+ " + vPointG);

                    var content2 = localized("VIP_CONVERT_REASON_1");
                    var ratio = NewVipManager.getInstance().getRatioGstarToVpoint();
                    content2 = StringUtility.replaceAll(content2, "@number", ratio);
                    this.txtRatioConvert.setString(content2);
                    var content3 = "";
                    if (data.goldBonus > 0) {
                        content3 = localized("VIP_CONVERT_OLD_VIP_TEXT_2");
                        content3 = StringUtility.replaceAll(content3, "@number", StringUtility.pointNumber(data.goldBonus));
                    }
                    this.txtBonusGold.setString(content3);
                }.bind(this)));
                this.getActionFadeIn(actions, this.txtGstar, timeFadeIn, timeDelayMini);
                this.getActionFadeIn(actions, this.txtRatioConvert, timeFadeIn, timeDelayMini);
                this.getActionArrowMove(actions, timeDelayNormal, timeDelayNormal);
                // this.getActionFadeIn(actions, this.imgArrow, timeFadeIn, timeDelayNormal);
                this.getActionFadeIn(actions, this.txtTilteNewVip, timeFadeIn, timeDelayMini);
                this.getActionFadeIn(actions, this.txtVpoint, timeFadeIn, timeDelayMini);
                this.getActionFadeIn(actions, this.pProgress, timeFadeIn, timeDelayMini);
                this.getActionFadeIn(actions, this.imgVpoint, timeFadeIn, timeDelayNormal);

                this.getActionAddVpoint(actions, vPointG, vPointPos, vPointEnd, this.bgProgressExp, this.progressExp, this.txtExp, null, this.iconCurVip, this.iconNextVip, level, vPointRemain);
                // this.getActionFadeIn(actions, this.txtContinue, timeFadeIn, timeDelayMini);
                actions.push(actionTxtTimeBlink);
                this.getActionVisible(actions, this.btnContinue, true, 0);

                this.txtGstar.setString(data.gstar);
            }
            return actions;
        } else if (phase === 2) {
            actions = [];

            // this.getActionVisible(actions, this.btnContinue, false, 0);
            this.getActionFadeOut(actions, this.imgOldVip, timeFadeOut, 0);
            this.getActionFadeOut(actions, this.txtOldRemainTime, timeFadeOut, 0);
            this.getActionFadeOut(actions, this.txtGstar, timeFadeOut, 0);
            this.getActionFadeOut(actions, this.txtContinue, timeFadeOut, 0);
            this.getActionFadeOut(actions, this.txtVpoint, timeFadeOut, 0);
            // this.getActionFadeOut(actions, this.imgArrow, timeFadeOut, 0);
            this.getActionVisible(actions, this.imgArrow, false, 0);
            this.getActionFadeOut(actions, this.txtTilteOldVip, timeFadeOut, 0);
            this.getActionFadeOut(actions, this.txtRatioConvert, timeFadeOut, 0);
            this.getActionFadeOut(actions, this.imgVpoint, timeFadeOut, 0);
            this.getActionFadeOut(actions, this.txtTilteNewVip, timeFadeOut, 1);

            var actionMoveProgress = cc.callFunc(function () {
                var startPoint = this.pProgress.getPosition();
                var endPoint = this.pMid.getPosition();
                var midPoint = cc.p(startPoint.x, endPoint.y);
                var actionMove = new cc.BezierTo(0.5, [startPoint, midPoint, endPoint]);
                this.pProgress.runAction(actionMove);
            }.bind(this));
            actions.push(actionMoveProgress);
            actions.push(cc.delayTime(1));

            this.getActionFadeIn(actions, this.title, timeFadeIn, timeDelayMini);
            this.getActionFadeIn(actions, this.txtTilteReceive, timeFadeIn, timeDelayMini);
            this.getActionFadeIn(actions, this.imgVipBig, timeFadeIn, timeDelayMini);
            this.getActionFadeIn(actions, this.pDecorate, timeFadeIn, timeDelayMini);
            this.getActionFadeIn(actions, this.imgVipFree, timeFadeIn, timeDelayMini);

            this.imgVipFree.setVisible(levelVip === 0);
            this.imgVipBig.setVisible(levelVip > 0);
            var actionCreateVip = cc.callFunc(function () {
                this.pDecorate.removeAllChildren(true);
                if (levelVip > 0) {
                    NewVipScene.addEffectIconVip(this.pDecorate, 1, 2, cc.p(0, 0), levelVip);
                }
            }.bind(this));
            actions.push(actionCreateVip);
            actions.push(cc.delayTime(3));

            actions.push(cc.callFunc(function () {
                this.runAction(cc.moveBy(0.5, -this.getContentSize().width / 4, 0));
            }.bind(this.bgConvert)));

            actions.push(cc.callFunc(function () {
                this.bgEqualBenefit.runAction(cc.moveBy(0.5, -this.bgEqualBenefit.getContentSize().width, 0));
                this.btnConfirm.setVisible(true);
            }.bind(this)));

            var strLevel = (levelVip > 0) ? levelVip : "FREE";
            this.txtTilteReceive.setString(StringUtility.replaceAll(localized("VIP_CONVERT_OLD_VIP_TEXT"), "@level", strLevel));
            return actions;
        }

        return actions;
    },

    getActionFadeIn: function (actions, target, timeFadeIn, timeDelay) {
        var action = cc.callFunc(function () {
            this.runAction(cc.fadeIn(timeFadeIn));
        }.bind(target));
        actions.push(action);
        actions.push(cc.delayTime(timeDelay));
    },

    getActionFadeOut: function (actions, target, timeFadeOut, timeDelay) {
        var action = cc.callFunc(function () {
            this.stopAllActions();
            this.runAction(cc.fadeOut(timeFadeOut));
        }.bind(target));

        actions.push(action);
        actions.push(cc.delayTime(timeDelay));
    },

    getActionArrowMove: function (actions, timeMove, timeDelay) {
        var action = cc.callFunc(function () {
            this.pArrow.stopAllActions();
            this.imgArrow.stopAllActions();
            var distanceX = this.pArrow.getContentSize().width;
            this.pArrow.setPositionX(this.pArrow.defaultPos.x - distanceX);
            this.imgArrow.setPositionX(this.imgArrow.defaultPos.x + distanceX);
            var actionMoveBy = cc.moveBy(timeMove, distanceX, 0);
            this.imgArrow.setVisible(true);
            this.pArrow.runAction(actionMoveBy);
            this.imgArrow.runAction(actionMoveBy.clone().reverse());
        }.bind(this));
        actions.push(action);
        actions.push(cc.delayTime(timeDelay));
    },

    getActionVisible: function (actions, target, isVisible, timeDelay) {
        var action = cc.callFunc(function () {
            this.setVisible(isVisible);
        }.bind(target));
        actions.push(action);
        actions.push(cc.delayTime(timeDelay));
    },

    getActionAddVpoint: function (actions, vpoint, vPointPos, vPointEnd, bgProgress, progressVpoint, lbVpoint, imgVpoint, imgCurVip, imgNextVip, vipLevel, curPoint) {
        var actionFly = cc.callFunc(function () {
            var vPointSpriteName = "res/Lobby/GUIVipNew/iconVpoint.png";
            effectMgr.flyItemEffect(sceneMgr.layerGUI, vPointSpriteName, vpoint, vPointPos, vPointEnd, 0, true, false);
        });
        actions.push(actionFly);

        var timeCheck = effectMgr.flyItemEffect(sceneMgr.layerGUI, "", vpoint, vPointPos, vPointEnd, 0, true, true);
        actions.push(cc.delayTime(timeCheck));

        var actionRunProgress = cc.callFunc(function () {
            effectMgr.runVipProgress(bgProgress, progressVpoint, lbVpoint, imgVpoint, imgCurVip, imgNextVip, vpoint, 0, false, vipLevel, curPoint);
        }.bind(this));
        actions.push(actionRunProgress);

        timeCheck = effectMgr.runVipProgress(bgProgress, progressVpoint, lbVpoint, imgVpoint, imgCurVip, imgNextVip, vpoint, 0, true, vipLevel, curPoint);
        actions.push(cc.delayTime(timeCheck));
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case ConvertOldVip.BTN_CONTINUE: {
                if (this.currentPhase < 3) {
                    var actions = this.getActionsByPhase(this.currentPhase);
                    this.currentPhase++;
                    this.bgConvert.stopAllActions();
                    this.bgConvert.runAction(cc.sequence(actions));
                    this.btnContinue.setVisible(false);
                }

                break;
            }
            case ConvertOldVip.BTN_CONFIRM: {
                NewVipManager.getInstance().removeDataConvert();
                var confirm = new CmdSendConfirmFinishConvertOldVip();
                confirm.putData(0);
                GameClient.getInstance().sendPacket(confirm);
                confirm.clean();
                this.onClose();
                break;
            }
        }
    },

    update: function (dt) {
        var target = (ConvertOldVip.isFollowCurrentLevel) ? this.pOldBenefit.viewBenefit : this.pNewBenefit.viewBenefit;
        var targetCopy = (ConvertOldVip.isFollowCurrentLevel) ? this.pNewBenefit.viewBenefit : this.pOldBenefit.viewBenefit;
        var positionY = target.getPositionOffestY();
        targetCopy.setPositionOffestY(positionY);
    }
});

ConvertOldVip.className = "ConvertOldVip";
ConvertOldVip.BTN_CONTINUE = 1;
ConvertOldVip.BTN_CONFIRM = 2;
ConvertOldVip.isFollowCurrentLevel = true;
ConvertOldVip.INDEX_TIME_REMAIN = 100;

var ItemFlyLayer = cc.Layer.extend({
    ctor: function (panel) {
        this._super();
        this.panel = panel;

        this.countTime = 0;
        this.addDefaultItem();
    },

    onEnter: function () {
        this._super();
        this.scheduleUpdate();
        this.countTime = 0;
    },

    addDefaultItem: function () {
        var height = this.panel.getContentSize().height;
        for (var i = 0; i < 3; i++) {
            var item = new ItemFly(this.panel.getContentSize().width);
            item.setDistanceChange(this.distanceChange);
            item.setDistanceEnd(this.distanceEnd);
            this.panel.addChild(item);
            item.setPositionY(height / 5 + Math.random() * height / 2);
        }
    },

    onExit: function () {
        this._super();
        this.unscheduleUpdate();
    },

    setDistance: function (distanceChange, distanceEnd) {
        this.distanceChange = distanceChange;
        this.distanceEnd = distanceEnd;
    },

    update: function (dt) {
        this.countTime += dt;
        if (this.countTime >= ItemFlyLayer.TIME_CREATE_NEW_ITEM) {
            this.countTime -= ItemFlyLayer.TIME_CREATE_NEW_ITEM;
            var item = new ItemFly(this.panel.getContentSize().width);
            item.setDistanceChange(this.distanceChange);
            item.setDistanceEnd(this.distanceEnd);
            this.panel.addChild(item);
        }
    }
});

ItemFlyLayer.TIME_CREATE_NEW_ITEM = 3;

var ItemFly = cc.Node.extend({
    ctor: function (panelWidth) {
        this._super();
        var random = Math.floor(Math.random() * 3.9);
        this.imgFly = new cc.Sprite("res/Lobby/GUIVipNew/iconFly" + random + ".png");
        this.imgFly.setScale(ItemFly.SCALE_DEFAULT + Math.random() * ItemFly.SCALE_RANGE);
        this.imgScale = this.imgFly.getScale();
        this.imgFly.setOpacity(ItemFly.OPACITY);

        this.addChild(this.imgFly);
        this.distanceChange = ItemFly.DEFAUTL_DISTANCE_CHANGE;
        this.distanceEnd = ItemFly.DEFAUTL_DISTANCE_END * Math.random();
        this.speedRotate = ItemFly.MAX_ROTATE - Math.random() * ItemFly.MAX_ROTATE * 2;
        this.isEnding = false;
        this.imgFly.setPosition(Math.random() * panelWidth, 0);
    },

    onEnter: function () {
        this._super();
        this.scheduleUpdate();
    },

    onExit: function () {
        this._super();
        this.unscheduleUpdate();
    },

    setDistanceChange: function (distanceChagne) {
        this.distanceChange = distanceChagne;
    },

    setDistanceEnd: function (distanceEnd) {
        this.distanceEnd = distanceEnd;
    },

    ending: function () {
        if (this.isEnding) {
            return;
        }

        this.isEnding = true;
        this.imgFly.runAction(cc.spawn(cc.scaleTo(0.5, 1.5 * this.imgScale), cc.sequence(cc.delayTime(0.3), cc.fadeOut(0.2))));
    },

    update: function (dt) {
        var addMoreRotation = this.speedRotate;
        if (this.imgFly.y > this.distanceChange) {
            if (this.imgFly.y > this.distanceChange + this.distanceEnd) {
                this.ending();
            }
        }
        this.imgFly.rotation += addMoreRotation;
        this.imgFly.y += ItemFly.SPEED_UP * dt;

    }
});

ItemFly.SPEED_UP = 30;
ItemFly.OPACITY = 60;
ItemFly.SCALE_DEFAULT = 0.4;
ItemFly.SCALE_RANGE = 0.3;
ItemFly.SPEED_ROTATE_UP = 500;
ItemFly.MAX_ROTATE = 5;
ItemFly.DEFAUTL_DISTANCE_CHANGE = 150;
ItemFly.DEFAUTL_DISTANCE_END = 50;

var ItemBlurLayer = cc.Layer.extend({
    ctor: function (panel) {
        this._super();
        this.panel = panel;

        this.countTime = 0;
        this.addDefaultItem();
    },

    onEnter: function () {
        this._super();
        this.scheduleUpdate();
        this.countTime = 0;
    },

    addDefaultItem: function () {
        var panelSize = this.panel.getContentSize();
        for (var i = 0; i < 15; i++) {
            var item = new ItemBlur(panelSize);
            this.panel.addChild(item);
            item.itemBlur.setOpacity(ItemBlur.OPACITY);
            item.itemBlur.isShow = true;
        }
    },

    onExit: function () {
        this._super();
        this.unscheduleUpdate();
    },

    update: function (dt) {
        this.countTime += dt;
        if (this.countTime >= ItemFlyLayer.TIME_CREATE_NEW_ITEM) {
            this.countTime -= ItemFlyLayer.TIME_CREATE_NEW_ITEM;
            var item = new ItemBlur(this.panel.getContentSize());
            this.panel.addChild(item);
        }
    }
});

ItemFlyLayer.TIME_CREATE_NEW_ITEM = 2;

var ItemBlur = cc.Node.extend({
    ctor: function (panelSize) {
        this._super();
        var random = Math.floor(Math.random() * 2.9);
        this.itemBlur = new cc.Sprite("res/Lobby/GUIVipNew/imgBlur" + random + ".png");

        this.itemBlur.isShow = false;
        var opacity = (this.itemBlur.isShow) ? ItemBlur.OPACITY : 0;
        this.itemBlur.setOpacity(opacity);
        this.itemBlur.setScale(1 + Math.random() * ItemBlur.MAX_EXTRA_SCALE);
        this.itemBlur.speedX = ItemBlur.RANDOM_SPEED - Math.random() * 2 * ItemBlur.RANDOM_SPEED;
        this.itemBlur.speedY = ItemBlur.RANDOM_SPEED - Math.random() * 2 * ItemBlur.RANDOM_SPEED;
        this.itemBlur.timeChangeShowHide = ItemBlur.MIN_CHANGE_TIME + ItemBlur.TIME_CHANGE_SHOW_HIDE * Math.random();
        this.timeCheckShowHide = 0;

        this.addChild(this.itemBlur);
        this.itemBlur.setPosition(Math.random() * panelSize.width, Math.random() * panelSize.height);
    },

    onEnter: function () {
        this._super();
        this.scheduleUpdate();
    },

    onExit: function () {
        this._super();
        this.unscheduleUpdate();
    },

    update: function (dt) {
        this.timeCheckShowHide += dt;
        if (this.timeCheckShowHide > this.itemBlur.timeChangeShowHide * 2) {
            this.timeCheckShowHide -= this.itemBlur.timeChangeShowHide * 2;
            this.itemBlur.isShow = !this.itemBlur.isShow;
            var opacity = (this.itemBlur.isShow) ? ItemBlur.OPACITY : 0;
            this.itemBlur.runAction(cc.fadeTo(this.itemBlur.timeChangeShowHide, opacity));
        }
        this.itemBlur.x += this.itemBlur.speedX * dt;
        this.itemBlur.y += this.itemBlur.speedY * dt;
    }
});

ItemBlur.OPACITY = 80;
ItemBlur.MAX_EXTRA_SCALE = 0.3;
ItemBlur.SCALE_DEFAULT = 0.4;
ItemBlur.RANDOM_SPEED = 15;
ItemBlur.MIN_CHANGE_TIME = 1;
ItemBlur.TIME_CHANGE_SHOW_HIDE = 2;

var VipHelpScene = BaseLayer.extend({

    ctor: function () {

        this._currentPage = null;
        this._pageHelp = null;

        this._arrPage= null;
        this._pageInfo = null;

        this.curPage = -1;

        this._super(VipHelpScene.className);
        this.initWithBinaryFile("VipHelpGUI.json");
    },

    initGUI : function() {
        var title = this.getControl("title");
        var bBot = this.getControl("bgBot");
        var bTop = this.getControl("bgTop");
        var bSub = this.getControl("bgSub");

        var bSubSize = cc.director.getWinSize().height - bTop.getContentSize().height*this._scale - bBot.getContentSize().height*this._scale;
        bSub.setScaleY(bSubSize/bSub.getContentSize().height);
        bSub.setPositionY(bTop.getPositionY() - bTop.getContentSize().height*this._scale - bSubSize/2);
        title.setPositionY(bTop.getPositionY() - bTop.getContentSize().height*this._scale/2);

        var btnClose = this.customButton("btnClose",5);
        this.customButton("btnShop",6);
        this.getControl("content");

        this.enableFog();
        this.setBackEnable(true);
    },

    onButtonRelease:function(button,id) {
        if(id == 5)
        {
            this.onBack();
        }
        else if(id == 6)
        {
            if( sceneMgr.getRunningScene().getMainLayer() instanceof ShopIapScene)
                this.onBack();
            else
                gamedata.openShop();
        }
    },

    onBack : function () {
        this.onClose();
    }
});
VipHelpScene.className = "VipHelpScene";
VipHelpScene.TAG = 500;