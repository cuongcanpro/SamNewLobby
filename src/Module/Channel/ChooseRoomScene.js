/**
 * ChooseRoomScene
 * Created by hungdd on 25/05/2016.
 */

var ChooseRoomScene = BaseLayer.extend({

    ctor: function () {
        this._listRoom = [];
        this.tabRooms = [];

        this.listRoomHeight = 0;
        this.cellSize = {};

        this.sortType = 0;
        this.sortGroup = 0;

        this.btnBan = null;
        this.btnGold = null;
        this.btnNumPlayer = null;
        this.lbNoRoom = null;
        this.tfSearch = null;
        this.notifyChat = null;
        this.saveChannel = 0;

        this._super(ChooseRoomScene.className);
        this.initWithBinaryFile("ChooseRoomGUI.json");
    },

    initGUI: function() {
        this.bg = this.getControl("bg");
        this.bg.setScale(cc.winSize.height / this.bg.getContentSize().height);
        if (cc.winSize.width > this.bg.getContentSize().width) {
            this.bg.setScaleX(cc.winSize.width / this.bg.getContentSize().width);
        }
        this.bg.setScaleY(cc.winSize.height / this.bg.getContentSize().height);
        this.bg.setVisible(true);

        var bSlide = this.getControl("bgSlide");
        this.listRoomHeight = bSlide.getPositionY() - bSlide.getContentSize().height;

        // Right top
        var pRightTop = this.getControl("pRightTop");
        // user info
        this.pUserInfo = new UserDetailInfo(true);
        this._layout.addChild(this.pUserInfo);
        this.arrayTopRight = [];
        this.arrayTopRight.push(this.pUserInfo.btnGold);
        this.arrayTopRight.push(this.pUserInfo.btnCoin);
        this.arrayTopRight.push(this.pUserInfo.btnDiamond);

        // left top
        this.pLeftTop = this.getControl("pLeftTop");
        this.customButton("btnQuit", ChooseRoomScene.BTN_QUIT, this.pLeftTop);
        // chanel button
        this.tabRooms = [];
        for (var i = 0; i < 4; i++) {
            var btn = this.customButton("btn" + i, i + ChooseRoomScene.BTN_TAPSU, this.pLeftTop, false);
            btn.select = this.getControl("select", btn);
            btn.range = this.getControl("range", btn);
            var s = "";
            if (channelMgr.getMaxGoldInChannel(i) > 0) {
                s = StringUtility.formatNumberSymbol(channelMgr.getMinGoldInChannel(i)) + " - " + StringUtility.formatNumberSymbol(channelMgr.getMaxGoldInChannel(i));
            }
            else {
                s = StringUtility.formatNumberSymbol(channelMgr.getMinGoldInChannel(i)) + "+";
            }
            btn.range.setString(s);
            this.tabRooms.push(btn);
        }

        this.bgBottom = this.getControl("bgBottom");
        this.bgBottom.setLocalZOrder(2);
        this.customButton("btnChoingay", ChooseRoomScene.BTN_CHOINGAY, this.bgBottom);
        this.customButton("btnTaoban", ChooseRoomScene.BTN_TAOBAN, this.bgBottom);
        this.customButton("btnSolo", ChooseRoomScene.BTN_SOLO, this.bgBottom);

        this.lbNoRoom = this.getControl("noroom");

        // group room button
        this.btnBan = this.customButton("btnBan", ChooseRoomScene.BTN_BAN);
        this.btnGold = this.customButton("btnMucCuoc", ChooseRoomScene.BTN_MUCCUOC);
        this.btnNumPlayer = this.customButton("btnSoNguoi", ChooseRoomScene.BTN_SONGUOI);

        this.btnBan.sort = this.btnBan.getChildByName("sort");
        this.btnGold.sort = this.btnGold.getChildByName("sort");
        this.btnNumPlayer.sort = this.btnNumPlayer.getChildByName("sort");

        this.btnBan.setPositionY(bSlide.getPositionY() - bSlide.getContentSize().height * 0.5);
        this.btnGold.setPositionY(this.btnBan.getPositionY());
        this.btnNumPlayer.setPositionY(this.btnBan.getPositionY());

        this.btnBan.sort.setVisible(false);
        this.btnGold.sort.setVisible(false);
        this.btnNumPlayer.sort.setVisible(false);

        this.getControl("btnTenBan").setPositionY(this.btnBan.getPositionY());

        // list room
        var sizeList = cc.size(cc.winSize.width, this.listRoomHeight);
        this._uiTable = new cc.TableView(this, sizeList);
        this._uiTable.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this._uiTable.setVerticalFillOrder(0);

        this.cellSize = cc.size(cc.winSize.width, 60);
        this._layout.addChild(this._uiTable);
        this._uiTable.setDelegate(this);
        this._uiTable.reloadData();

        this.setBackEnable(true);
    },

    onEnterFinish: function () {
        this.effectIn();

        this.onUpdateGUI();
        channelMgr.onEnterChannel();
        supportMgr.checkCapture();
        supportMgr.checkSupportBean();

        if (!cc.sys.isNative) {
            this._uiTable.setTouchEnabled(true);
        }
    },

    effectIn: function () {
        var effectTime = 0.5;
        var delayTime = 0;

        this.bgBottom.stopAllActions();
        this.bgBottom.setPosition(cc.p(this.bgBottom.defaultPos.x, -cc.winSize.height));
        this.bgBottom.setOpacity(0);
        this.bgBottom.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.fadeIn(effectTime * 0.5),
                cc.moveTo(effectTime, this.bgBottom.defaultPos).easing(cc.easeOut(2.5))
            )
        ));
        delayTime += effectTime;

        var btnChoingay = this.getControl("btnChoingay", this.bgBottom);
        btnChoingay.setPosition(cc.p(btnChoingay.defaultPos.x, -btnChoingay.height * 0.5));
        btnChoingay.setOpacity(0);
        btnChoingay.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.fadeIn(effectTime * 0.5),
                cc.moveTo(effectTime, btnChoingay.defaultPos).easing(cc.easeBackOut(2.5))
            )
        ));
        delayTime += 0.1;

        var btnTaoban = this.getControl("btnTaoban", this.bgBottom);
        btnTaoban.setPosition(cc.p(btnTaoban.defaultPos.x, -btnTaoban.height * 0.5));
        btnTaoban.setOpacity(0);
        btnTaoban.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.fadeIn(effectTime * 0.5),
                cc.moveTo(effectTime, btnTaoban.defaultPos).easing(cc.easeBackOut(2.5))
            )
        ));

        var btnClose = this.getControl("btnQuit", this.pLeftTop);
        btnClose.stopAllActions();
        btnClose.setPosition(cc.p(btnClose.defaultPos.x, this.pLeftTop.height + btnClose.width * 0.5));
        btnClose.setOpacity(0);
        btnClose.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.fadeIn(effectTime * 0.5).easing(cc.easeOut(2.5)),
                cc.moveTo(effectTime, btnClose.defaultPos).easing(cc.easeBackOut())
            )
        ));
        delayTime += 0.1;

        var title = this.getControl("title", this.pLeftTop);
        title.stopAllActions();
        title.setPosition(cc.p(title.defaultPos.x, this.pLeftTop.height + title.width * 0.5));
        title.setOpacity(0);
        title.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.fadeIn(effectTime * 0.5).easing(cc.easeOut(2.5)),
                cc.moveTo(effectTime, title.defaultPos).easing(cc.easeBackOut())
            )
        ));
        delayTime += 0.1;

        for (var i = 0; i < this.arrayTopRight.length; i++) {
            var comp = this.arrayTopRight[i];
            comp.y = 200;
            comp.setOpacity(0);
            comp.runAction(cc.sequence(
                cc.delayTime(delayTime),
                cc.spawn(
                    cc.fadeIn(effectTime * 0.5).easing(cc.easeOut(2.5)),
                    cc.moveBy(effectTime, 0, -200).easing(cc.easeBackOut())
                )
            ));
            delayTime += 0.1;
        }
    },

    effectTable: function () {
        this._uiTable.reloadData();
        var cells = this._uiTable.getContainer().getChildren();
        for (var i = 0; i < cells.length; i++){
            cells[i].setCascadeOpacityEnabled(true);
            cells[i].setOpacity(0);
            cells[i].runAction(cc.sequence(
                cc.delayTime(0.075 * i),
                cc.fadeIn(0.15)
            ));
        }
    },

    customizeGUI: function () {
        this.switchTab(0);
    },

    onUpdateGUI: function (data) {
        this.updateToCurrentData();
        if (!data) {
            if (channelMgr.selectedChanel != -1) {
                this.switchTab(channelMgr.selectedChanel);
                this._listRoom = channelMgr.roomList;

                if (this.sortGroup != 0 && this.sortType != 0) {
                    this.autoSortTable();
                }
                this.effectTable();

                if (this._listRoom.length == 0) {
                    this.lbNoRoom.setVisible(true);
                }
                else {
                    this.lbNoRoom.setVisible(false);
                }
            }
        }
        else {
            this.lbNoRoom.setVisible(false);
            if (data.getError() == 0) {
                if (channelMgr.selectedChanel != -1) {
                    this.switchTab(channelMgr.selectedChanel);
                    this._listRoom = channelMgr.roomList;
                    if (this.sortGroup != 0 && this.sortType != 0) {
                        this.autoSortTable();
                    }
                    this.effectTable();
                }
            }
            else {
                var mess = localized("SEARCH_TABLE_NOT_FOUND");
                Toast.makeToast(Toast.LONG, mess);
            }
        }

        sceneMgr.clearLoading();
    },

    updateToCurrentData: function () {
        this.pUserInfo.updateToCurrentData();
        this.pUserInfo.setPosition(
            cc.winSize.width,
            cc.winSize.height - UserDetailInfo.PAD_TOP);
    },

    onButtonRelease: function (button, id) {
        var infoChannel = channelMgr.channelGroup[channelMgr.getSelectedChannel()];
        var minGold, maxGold;
        if (infoChannel){
            minGold = infoChannel["minGold"];
            maxGold = infoChannel["maxGold"];
        }
        switch (id) {
            case ChooseRoomScene.BTN_QUIT:
            {
                this.onBack();
                break;
            }
            case ChooseRoomScene.BTN_REFRESH:
            {
                channelMgr.sendRefreshTable();
                sceneMgr.addLoading("", false);
                break;
            }
            case ChooseRoomScene.BTN_TAPSU:
            case ChooseRoomScene.BTN_TADIEN:
            //case ChooseRoomScene.BTN_DIACHU:
            case ChooseRoomScene.BTN_TRIEUPHU:
            case ChooseRoomScene.BTN_TYPHU:
            {
                if (channelMgr.selectedChanel != (id - 6)) {
                    channelMgr.sendSelectChannel(id - 6);
                    this.switchTab(id - 6);
                    sceneMgr.addLoading("").timeout(15);
                }
                break;
            }
            case ChooseRoomScene.BTN_AVATAR:
            {
                sceneMgr.openGUI(CheckLogic.getUserInfoClassName(), LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO).setInfo(gamedata.userData);
                break;
            }
            case ChooseRoomScene.BTN_SOLO:
            {
                var maxChannelCanJoin = paymentMgr.getCurrentChanel();
                var channelSolo = -1;
                if (!channelMgr.checkQuickPlay()) {
                    if (paymentMgr.checkEnablePayment()) {
                        var msg = LocalizedString.to("QUESTION_CHANGE_GOLD");
                        sceneMgr.showChangeGoldDialog(msg, this, function (buttonId) {
                            if (buttonId == Dialog.BTN_OK) {
                                paymentMgr.openShop(this._id, true);
                            }
                        });
                    }
                    else {
                        sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                    }
                }
                else {
                    if (!CheckLogic.checkCreateRoomMinGold() && !CheckLogic.checkCreateRoomMaxGold()) {
                        channelSolo = gamedata.selectedChanel;
                    } else {
                        channelSolo = maxChannelCanJoin;
                    }
                }
                var cannotPlayNow = false;
                if (id === ChooseRoomScene.BTN_SOLO_NOW){
                    if (gamedata.getUserGold() < ChanelConfig.instance().minGoldSolo){
                        cannotPlayNow = true;
                    }
                }
                if (!cannotPlayNow && CheckLogic.checkQuickPlay()) {
                    var channelSolo = -1;
                    if (!CheckLogic.checkCreateRoomMinGold() && !CheckLogic.checkCreateRoomMaxGold()) {
                        channelSolo = gamedata.selectedChanel;
                    } else {
                        if (id === ChooseRoomScene.BTN_SOLO_NOW){
                            channelSolo = maxChannelCanJoin;
                        }
                    }

                    cc.log("channelSolo: ", channelSolo, CheckLogic.checkCreateRoomMinGold(), CheckLogic.checkCreateRoomMaxGold());
                    if (channelSolo < 0){
                        if (CheckLogic.checkCreateRoomMinGold()) {
                            message = LocalizedString.to("PLAY_NOT_ENOUGHT_GOLD_JOIN");
                            message = StringUtility.replaceAll(message, "%gold", StringUtility.formatNumberSymbol(minGold));
                            SceneMgr.getInstance().showChangeGoldDialog(message, this, function (btnID) {
                                if (btnID == Dialog.BTN_OK) {
                                    gamedata.openShop(this._id,true);
                                }
                            });
                        } else {
                            message = LocalizedString.to("PLAY_NOT_IN_RANGE_GOLD");
                            message = StringUtility.replaceAll(message, "@min", StringUtility.formatNumberSymbol(minGold));
                            message = StringUtility.replaceAll(message, "@max", StringUtility.formatNumberSymbol(maxGold));
                            SceneMgr.getInstance().showOKDialog(message);
                        }
                        break;
                    } else {
                        pk = new CmdSendQuickPlayCustom();
                        var typeQuickPlay = (this.isQuickPlayByRoom) ? 2 : 1;
                        pk.putData(channelSolo, typeQuickPlay, (id === ChooseRoomScene.BTN_SOLO_NOW) ? 1 : 0, 2);
                        GameClient.getInstance().sendPacket(pk);
                        pk.clean();
                        this.isQuickPlayByRoom = false;
                    }

                    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                } else {
                    cannotPlayNow = true;
                }

                if (cannotPlayNow){
                    if (gamedata.timeSupport > 0) {
                        var pk = new CmdSendGetSupportBean();
                        GameClient.getInstance().sendPacket(pk);
                        gamedata.showSupportTime = true;
                        pk.clean();
                    }
                    else {
                        if (gamedata.checkEnablePayment()) {
                            var text = localized("PLAY_SOLO_NOTICE");
                            text = StringUtility.replaceAll(text, "@gold", StringUtility.formatNumberSymbol(ChanelConfig.instance().minGoldSolo));
                            var msg = (id === ChooseRoomScene.BTN_SOLO_NOW) ? text : LocalizedString.to("QUESTION_CHANGE_GOLD");
                            sceneMgr.showChangeGoldDialog(msg, this, function (buttonId) {
                                if (buttonId == Dialog.BTN_OK) {
                                    gamedata.openShop(this._id,true);
                                }
                            });
                        }
                        else {
                            sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                        }
                    }
                }
            }
            case ChooseRoomScene.BTN_CHOINGAY:
            {
                if (!channelMgr.checkQuickPlay()) {
                    if (paymentMgr.checkEnablePayment()) {
                        var msg = LocalizedString.to("QUESTION_CHANGE_GOLD");
                        sceneMgr.showChangeGoldDialog(msg, this, function (buttonId) {
                            if (buttonId == Dialog.BTN_OK) {
                                paymentMgr.openShop(this._id, true);
                            }
                        });
                    }
                    else {
                        sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                    }
                }
                else {
                    if (channelMgr.checkCreateRoomMinGold() || channelMgr.checkCreateRoomMaxGold()) {
                        message = LocalizedString.to("PLAY_NOT_IN_RANGE_GOLD");
                        message = StringUtility.replaceAll(message, "@min", StringUtility.formatNumberSymbol(minGold));
                        message = StringUtility.replaceAll(message, "@max", StringUtility.formatNumberSymbol(maxGold));
                        sceneMgr.showOKDialog(message);
                    }
                    else {
                        pk = new CmdSendQuickPlayCustom();
                        var typeQuickPlay = (this.isQuickPlayByRoom) ? 2 : 1;
                        pk.putData(channelMgr.getSelectedChannel(), typeQuickPlay, 0, 2);
                        GameClient.getInstance().sendPacket(pk);
                        pk.clean();
                        this.isQuickPlayByRoom = false;
                    }
                }
                break;
            }
            case ChooseRoomScene.BTN_TAOBAN:
            {
                if (channelMgr.checkCreateRoomMinGold()) {
                    if (paymentMgr.checkEnablePayment()) {
                        var message = LocalizedString.to("PLAY_NOT_ENOUGHT_GOLD");
                        message = StringUtility.replaceAll(message, "%gold", StringUtility.pointNumber(channelMgr.getMinGoldCreateRoom()));

                        SceneMgr.getInstance().showChangeGoldDialog(message, this, function (btnID) {
                            if (btnID == Dialog.BTN_OK) {
                                paymentMgr.openShop(this._id, true);
                            }
                        });
                    }
                    else {
                        sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                    }
                }
                else {
                    if (channelMgr.checkCreateRoomMaxGold()) {
                        var message = LocalizedString.to("PLAY_MUCH_GOLD");
                        message = StringUtility.replaceAll(message, "%gold", StringUtility.pointNumber(channelMgr.getMaxGoldCreateRoom()));
                        SceneMgr.getInstance().showOKDialog(message);
                    }
                    else {
                        sceneMgr.openGUI(CreateRoomGUI.className, ChooseRoomScene.CREATE_TABLE, ChooseRoomScene.CREATE_TABLE);
                    }
                }
                break;
            }
            case ChooseRoomScene.BTN_BAN:
            {
                this.btnBan.sort.setVisible(false);
                this.btnGold.sort.setVisible(false);
                this.btnNumPlayer.sort.setVisible(false);

                this.btnBan.sort.setVisible(true);

                if (this.btnBan.sortType === undefined) {
                    this.sortType = ChooseRoomScene.SORT_ASC;
                    this.btnBan.sortType = ChooseRoomScene.SORT_ASC;
                    this.sortBan(ChooseRoomScene.SORT_ASC);
                }
                else {
                    if (this.btnBan.sortType == ChooseRoomScene.SORT_ASC) {
                        this.sortType = ChooseRoomScene.SORT_DESC;
                        this.btnBan.sortType = ChooseRoomScene.SORT_DESC;
                        this.sortBan(ChooseRoomScene.SORT_DESC);
                        this.btnBan.sort.setFlippedY(true);
                    }
                    else {
                        this.sortType = ChooseRoomScene.SORT_ASC;
                        this.btnBan.sortType = ChooseRoomScene.SORT_ASC;
                        this.sortBan(ChooseRoomScene.SORT_ASC);
                        this.btnBan.sort.setFlippedY(false);
                    }
                }

                this.sortGroup = id;
                this.effectTable();
                break;
            }
            case ChooseRoomScene.BTN_MUCCUOC:
            {
                this.btnBan.sort.setVisible(false);
                this.btnGold.sort.setVisible(false);
                this.btnNumPlayer.sort.setVisible(false);

                this.btnGold.sort.setVisible(true);

                if (this.btnGold.sortType === undefined) {
                    this.sortType = ChooseRoomScene.SORT_ASC;
                    this.btnGold.sortType = ChooseRoomScene.SORT_ASC;
                    this.sortGoldBet(ChooseRoomScene.SORT_ASC);
                }
                else {
                    if (this.btnGold.sortType == ChooseRoomScene.SORT_ASC) {
                        this.sortType = ChooseRoomScene.SORT_DESC;
                        this.btnGold.sortType = ChooseRoomScene.SORT_DESC;
                        this.sortGoldBet(ChooseRoomScene.SORT_DESC);
                        this.btnGold.sort.setFlippedY(true);
                    }
                    else {
                        this.sortType = ChooseRoomScene.SORT_ASC;
                        this.btnGold.sortType = ChooseRoomScene.SORT_ASC;
                        this.sortGoldBet(ChooseRoomScene.SORT_ASC);
                        this.btnGold.sort.setFlippedY(false);

                    }
                }

                this.sortGroup = id;
                this.effectTable();
                break;
            }
            case ChooseRoomScene.BTN_SONGUOI:
            {
                this.btnBan.sort.setVisible(false);
                this.btnGold.sort.setVisible(false);
                this.btnNumPlayer.sort.setVisible(false);

                this.btnNumPlayer.sort.setVisible(true);

                if (this.btnNumPlayer.sortType === undefined) {
                    this.sortType = ChooseRoomScene.SORT_ASC;
                    this.btnNumPlayer.sortType = ChooseRoomScene.SORT_ASC;
                    this.sortNumPlayer(ChooseRoomScene.SORT_ASC);
                }
                else {
                    if (this.btnNumPlayer.sortType == ChooseRoomScene.SORT_ASC) {
                        this.sortType = ChooseRoomScene.SORT_DESC;
                        this.btnNumPlayer.sortType = ChooseRoomScene.SORT_DESC;
                        this.sortNumPlayer(ChooseRoomScene.SORT_DESC);
                        this.btnNumPlayer.sort.setFlippedY(true);
                    }
                    else {
                        this.sortType = ChooseRoomScene.SORT_ASC;
                        this.btnNumPlayer.sortType = ChooseRoomScene.SORT_ASC;
                        this.sortNumPlayer(ChooseRoomScene.SORT_ASC);
                        this.btnNumPlayer.sort.setFlippedY(false);
                    }
                }

                this.sortGroup = id;
                this.effectTable();
                break;
            }
        }
    },

    autoSortTable: function () {
        switch (this.sortGroup) {
            case ChooseRoomScene.BTN_BAN:
            {
                this.btnBan.sort.setVisible(true);
                this.sortBan(this.sortType);
                break;
            }
            case ChooseRoomScene.BTN_MUCCUOC:
            {
                this.btnGold.sort.setVisible(true);
                this.sortGoldBet(this.sortType);
                break;
            }
            case ChooseRoomScene.BTN_SONGUOI:
            {
                this.btnNumPlayer.sort.setVisible(true);
                this.sortNumPlayer(this.sortType);
                break;
            }
        }
    },

    sortBan: function (type) {
        if (type == ChooseRoomScene.SORT_ASC) {
            this._listRoom.sort(function (a, b) {
                return a.tableIndex < b.tableIndex;
            });
        }
        else {
            this._listRoom.sort(function (a, b) {
                return a.tableIndex > b.tableIndex;
            });
        }
    },

    sortGoldBet: function (type) {
        if (type == ChooseRoomScene.SORT_ASC) {
            this._listRoom.sort(function (a, b) {
                return CheckLogic.sortRoomBetAsc(a, b);
            });
        }
        else {
            this._listRoom.sort(function (a, b) {
                return CheckLogic.sortRoomBetDesc(a, b);
            });
        }
    },

    sortNumPlayer: function (type) {
        if (type == ChooseRoomScene.SORT_ASC) {
            this._listRoom.sort(function (a, b) {
                return b.personCount - a.personCount;
            });
        }
        else {
            this._listRoom.sort(function (a, b) {
                return a.personCount - b.personCount;
            });
        }
    },

    switchTab: function (tabIdx) {
        for (var i = 0; i < 4; i++) {
            this.tabRooms[i].stopAllActions();
            this.tabRooms[i].select.stopAllActions();
            this.tabRooms[i].range.stopAllActions();
            if (i == tabIdx) {
                this.tabRooms[i].setEnabled(false);
                this.tabRooms[i].select.loadTexture("ChooseRoomGUI/textChannelSelect_" + i + ".png");
                this.tabRooms[i].setLocalZOrder(1);
                this.tabRooms[i].range.setColor(cc.color("#ffffff"));
                this.tabRooms[i].runAction(cc.moveTo(0.15,
                    this.tabRooms[i].defaultPos
                ).easing(cc.easeOut(2.5)));
                this.tabRooms[i].select.runAction(cc.moveTo(0.15,
                    this.tabRooms[i].select.defaultPos
                ).easing(cc.easeOut(2.5)));
                this.tabRooms[i].range.runAction(cc.moveTo(0.15,
                    this.tabRooms[i].range.defaultPos
                ).easing(cc.easeOut(2.5)));
            }
            else {
                this.tabRooms[i].setEnabled(true);
                this.tabRooms[i].select.loadTexture("ChooseRoomGUI/textChannel_" + i + ".png");
                this.tabRooms[i].setLocalZOrder(0);
                this.tabRooms[i].range.setColor(cc.color("#5163ae"));
                this.tabRooms[i].runAction(cc.moveTo(0.1,
                    this.tabRooms[i].defaultPos.x,
                    this.tabRooms[i].defaultPos.y - 15
                ).easing(cc.easeOut(2.5)));
                this.tabRooms[i].select.runAction(cc.moveTo(0.1,
                    this.tabRooms[i].select.defaultPos.x,
                    this.tabRooms[i].select.defaultPos.y + 7.5
                ).easing(cc.easeOut(2.5)));
                this.tabRooms[i].range.runAction(cc.moveTo(0.1,
                    this.tabRooms[i].range.defaultPos.x,
                    this.tabRooms[i].range.defaultPos.y + 7.5
                ).easing(cc.easeOut(2.5)));
            }
        }
        this.saveChannel = tabIdx;
    },

    tableCellSizeForIndex: function (table, idx) {
        return this.cellSize;
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new TableRoomCell();
        }
        cell.setInfo(this._listRoom[idx]);
        cell.setOpacity(255);
        return cell;
    },

    tableCellTouched: function (table, cell) {
        var idx = cell.getIdx();
        var roomInfo = this._listRoom[idx];

        if (channelMgr.checkCreateRoomMinGold()) {
            var message = LocalizedString.to("PLAY_NOT_ENOUGHT_GOLD_JOIN");
            message = StringUtility.replaceAll(message, "%gold", StringUtility.pointNumber(channelMgr.getMinGoldCreateRoom()));
            if (paymentMgr.checkEnablePayment()) {
                SceneMgr.getInstance().showChangeGoldDialog(message, this, function (btnID) {
                    if (btnID == Dialog.BTN_OK) {
                        paymentMgr.openShop(this._id, true);
                    }
                });
            }
            else {
                sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
            }
            return;
        } else {

            if (channelMgr.checkCreateRoomMaxGold()) {
                if (!channelMgr.checkDownLevel()) {
                    var message = LocalizedString.to("JOIN_MUCH_GOLD");
                    message = StringUtility.replaceAll(message, "%gold", StringUtility.pointNumber(channelMgr.getMaxGoldCreateRoom()));
                    SceneMgr.getInstance().showOKDialog(message);
                    return;
                }
            }

            if (channelMgr.checkNotifyNotEnoughGold(roomInfo))
                return;
        }
        channelMgr.sendQuickPlayCustom(roomInfo);
        sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
    },

    numberOfCellsInTableView: function (table) {
        return this._listRoom.length;
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable()) return;

        sceneMgr.openScene(LobbyScene.className);
    }
});

ChooseRoomScene.className = "ChooseRoomScene";

ChooseRoomScene.BTN_QUIT = 1;
ChooseRoomScene.BTN_AVATAR = 2;
ChooseRoomScene.BTN_CHOINGAY = 3;
ChooseRoomScene.BTN_TAOBAN = 4;
ChooseRoomScene.BTN_REFRESH = 5;
ChooseRoomScene.BTN_SOLO = 40;

ChooseRoomScene.BTN_TAPSU = 6;
ChooseRoomScene.BTN_TADIEN = 7;
//ChooseRoomScene.BTN_DIACHU = 8;
ChooseRoomScene.BTN_TRIEUPHU = 8;
ChooseRoomScene.BTN_TYPHU = 9;

ChooseRoomScene.BTN_BAN = 11;
ChooseRoomScene.BTN_TENBAN = 12;
ChooseRoomScene.BTN_MUCCUOC = 13;
ChooseRoomScene.BTN_SONGUOI = 14;

ChooseRoomScene.SORT_ASC = 1;
ChooseRoomScene.SORT_DESC = 2;

ChooseRoomScene.BTN_X = 15;
ChooseRoomScene.BTN_SEARCH = 16;

ChooseRoomScene.BTN_CHAT = 17;
ChooseRoomScene.BTN_JACKPOT = 18;

ChooseRoomScene.CREATE_TABLE = 600;
ChooseRoomScene.INPUT_PASS = 601;
ChooseRoomScene.USER_INFO = 602;
