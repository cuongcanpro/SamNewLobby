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

    onEnterFinish: function () {
        this.onUpdateGUI();
        channelMgr.onEnterChannel();
        supportMgr.checkCapture();
        supportMgr.checkSupportBean();

        if (Config.ENABLE_JACKPOT) {
            this.updateJackpotGUI("init");
        }

        if (!cc.sys.isNative) {
            this._uiTable.setTouchEnabled(true);
        }
    },
    createAnim: function (control, anim) {
        cc.log(anim);
        if (control === undefined || control == null || anim === undefined || anim == "") return null;

        if (control.anim) {
            control.removeChild(control.anim);
            control.anim = null;
        }

        var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim);
        // cc.log("create ok");
        if (eff) {
            control.addChild(eff);
            eff.setPosition(control.getContentSize().width / 2, control.getContentSize().height / 2);
            //eff.getAnimation().gotoAndPlay("1", -1, -1, 0);
            control.anim = eff;
            // cc.log("has effect");
        }
        return eff;
    },
    updateJackpotGUI: function (status) {
        return;
        if (!Config.ENABLE_JACKPOT || gamedata.selectedChanel == -1) {
            return;
        }

        //UPDATING_JACKPOT = true;
        var btnjp = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot");
        var jackpot = ccui.Helper.seekWidgetByName(btnjp, "jackpot");
        //cc.log("update jackpot now", JSON.stringify(gamedata.jackpot));
        jackpot.setString("$" + StringUtility.standartNumber(gamedata.jackpot[0][gamedata.selectedChanel]));
        var introJackpot = ccui.Helper.seekWidgetByName(this._layout, "introJackpot");
        //introJackpot.runAction(cc.FadeOut(0));
        if (!status) {
            return;
        }
        btnjp.stopAllActions();
        if (btnjp.anim != null) {
            btnjp.removeChild(btnjp.anim);
            btnjp.anim = null;
        }
        btnjp.setVisible(false);
        introJackpot.stopAllActions();
        introJackpot.runAction(new cc.FadeIn(0));
        var config = CheckLogic.getJackpotConfig(gamedata.selectedChanel);
        //cc.log("null", introJackpot == null);
        introJackpot.loadTexture(config.intro);
        introJackpot.setVisible(true);
        var self = this;
        introJackpot.runAction(new cc.Sequence(cc.delayTime(0.5), new cc.Spawn(new cc.CallFunc(function () {
            self.createAnim(this, "TranDiamond");
            this.anim.gotoAndPlay("1", -1);
        }, introJackpot), new cc.FadeOut(0.9))));
        var btn = ccui.Helper.seekWidgetByName(self._layout, "btnJackpot");
        //btn.setVisible(true);
        var listDiamond = ccui.Helper.seekWidgetByName(self._layout, "btnJackpot").getChildByName("listDiamond");
        var dias = listDiamond.getChildren();
        for (var i = 0; i < dias.length; i++) {
            dias[i].loadTexture(config.diamond);
            dias[i].setVisible(false);
            dias[i].stopAllActions();
        }

        btn.runAction(new cc.Sequence(new cc.FadeOut(0), cc.delayTime(1), new cc.CallFunc(function () {
            this.setVisible(true);
            this.runAction(new cc.Sequence(new cc.FadeIn(1), new cc.CallFunc(function () {

                var jackpot = ccui.Helper.seekWidgetByName(self._layout, "jackpot");
                jackpot.runAction(new cc.Sequence(new cc.ScaleTo(0.2, 0.27), new cc.ScaleTo(0.2, 0.25)));
                for (var j = 0; j < gamedata.jackpot[1][gamedata.selectedChanel]; j++) {
                    var dia = dias[j];
                    dia.runAction(new cc.Sequence(cc.delayTime(j * 0.32 + 0.4), new cc.CallFunc(function () {
                        this.setVisible(true);
                    }, dia), new cc.ScaleTo(0.1, 1.2), new cc.ScaleTo(0.1, 1)));
                }
                for (var j = 0; j < dias.length; j++) {
                    var dia = dias[j];
                    dia.runAction(new cc.Sequence(cc.delayTime(dias.length * 0.3), new cc.ScaleTo(0.3, 1.2), new cc.CallFunc(function () {
                        self.createAnim(this, "SmallDiamond");
                        this.anim.gotoAndPlay("1", -1);
                        this.anim.setCompleteListener(function () {
                            this.runAction(new cc.ScaleTo(0.1, 1));
                        }.bind(this));
                    }, dia)));
                }

            }, this)));
            this.runAction(new cc.Sequence(cc.delayTime(gamedata.jackpot[1][gamedata.selectedChanel] * 0.32 + 2.9), new cc.CallFunc(function () {
                if (gamedata.jackpot[1][gamedata.selectedChanel] == 4) {
                    self.createAnim(this, "Bang1");
                    this.anim.gotoAndPlay("1", -1);
                } else {
                    if (this.anim) {
                        this.removeChild(this.anim);
                        this.anim = null;
                    }
                }
            }, this)));
        }, btn)));
        //UPDATING_JACKPOT = false;
    },

    initGUI: function() {
        var bBot = this.getControl("bgBot");
        var bTop = this.getControl("bgTop");
        var bSub = this.getControl("bgSub");
        var bSlide = this.getControl("bgSlide");
        var bListRoom = this.getControl("listroom");

        var bSubSize = cc.director.getWinSize().height - bTop.getContentSize().height * this._scale - bBot.getContentSize().height * this._scale;
        var scaleY = bSubSize / bSub.getContentSize().height;
        bSub.setScaleY(scaleY);

        this.listRoomHeight = bSubSize - bSlide.getContentSize().height * this._scale;

        bSub.setPositionY(bTop.getPositionY() - bTop.getContentSize().height * this._scale - bSubSize / 2);
        bSlide.setPositionY(bTop.getPositionY() - bTop.getContentSize().height * this._scale - bSlide.getContentSize().height * this._scale / 2);
        bListRoom.setPositionY(bSlide.getPositionY() - bSlide.getContentSize().height * this._scale / 2 - this.listRoomHeight);

        // Right top
        var pRightTop = this.getControl("pRightTop");
        this.customButton("btnChoingay", ChooseRoomScene.BTN_CHOINGAY, pRightTop);
        this.customButton("btnTaoban", ChooseRoomScene.BTN_TAOBAN, pRightTop);
        this.customButton("btnRefresh", ChooseRoomScene.BTN_REFRESH, pRightTop);

        // left top
        var pLeftTop = this.getControl("pLeftTop");
        this.customButton("btnQuit", ChooseRoomScene.BTN_QUIT, pLeftTop);

        // user info
        var pInfo = this.getControl("pInfo");
        pInfo.setLocalZOrder(3);

        this._uiName = this.getControl("name", pInfo);
        this._uiBean = this.getControl("gold", pInfo);
        this._uiBean.ignoreContentAdaptWithSize(true);

        this.customButton("btnAvatar", ChooseRoomScene.BTN_AVATAR, pInfo).setPressedActionEnabled(false);
        var bgAvatar = this.getControl("bgAvatar", pInfo);
        this._uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        var size = bgAvatar.getContentSize();
        this._uiAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        bgAvatar.addChild(this._uiAvatar);

        this.defaultFrame = this.getControl("border", pInfo);
        this.avatarFrame = new UIAvatarFrame();
        this.avatarFrame.setPosition(cc.p(size.width / 2, size.height / 2));
        bgAvatar.addChild(this.avatarFrame);
        this.avatarFrame.setScale(0.5);

        // chanel button
        var pRightBot = this.getControl("pRightBot");
        this.tabRooms = [];
        for (var i = 0; i < 4; i++) {
            var btn = this.customButton("btn" + i, i + ChooseRoomScene.BTN_TAPSU, pRightBot, false);
            btn.select = this.getControl("select", btn);
            btn.nonselect = this.getControl("nonselect", btn);
            this.tabRooms.push(btn);
        }

        this.lbNoRoom = this.getControl("noroom");

        // group room button
        this.btnBan = this.customButton("btnBan", ChooseRoomScene.BTN_BAN);
        this.btnGold = this.customButton("btnMucCuoc", ChooseRoomScene.BTN_MUCCUOC);
        this.btnNumPlayer = this.customButton("btnSoNguoi", ChooseRoomScene.BTN_SONGUOI);

        this.btnBan.sort = this.btnBan.getChildByName("sort");
        this.btnGold.sort = this.btnGold.getChildByName("sort");
        this.btnNumPlayer.sort = this.btnNumPlayer.getChildByName("sort");

        this.btnBan.setPositionY(bSlide.getPositionY());
        this.btnGold.setPositionY(bSlide.getPositionY());
        this.btnNumPlayer.setPositionY(bSlide.getPositionY());

        this.btnBan.sort.setVisible(false);
        this.btnGold.sort.setVisible(false);
        this.btnNumPlayer.sort.setVisible(false);

        this.getControl("btnTenBan").setPositionY(bSlide.getPositionY());

        this.getControl("sp1").setPositionY(bSlide.getPositionY());
        this.getControl("sp2").setPositionY(bSlide.getPositionY());
        this.getControl("sp3").setPositionY(bSlide.getPositionY());

        // list room
        var sizeList = cc.size(cc.winSize.width, this.listRoomHeight);
        this._uiTable = new cc.TableView(this, sizeList);
        this._uiTable.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this._uiTable.setPosition(bListRoom.getPosition());
        this._uiTable.setVerticalFillOrder(0);

        var rItem = this.getControl("item", bListRoom);
        rItem.setVisible(false);
        this.cellSize = cc.size(rItem.getContentSize().width, rItem.getContentSize().height * this._scale);

        this._layout.addChild(this._uiTable);
        this._uiTable.setDelegate(this);
        this._uiTable.reloadData();

        this.setBackEnable(true);
    },

    customizeGUI: function () {
        this.switchTab(0);
    },

    onUpdateGUI: function (data) {
        if (this._uiAvatar && this._uiName && this._uiBean) {
            this._uiAvatar.asyncExecuteWithUrl(userMgr.getUserName(), userMgr.getAvatar());
            this.setLabelText(userMgr.getDisplayName(), this._uiName);
            this._uiBean.setString(StringUtility.standartNumber(userMgr.getGold()));
        }

        if (this.avatarFrame){
            this.avatarFrame.reload();
            this.defaultFrame.setVisible(!this.avatarFrame.isShow());
        }

        if (!data) {
            if (channelMgr.selectedChanel != -1) {
                this.switchTab(channelMgr.selectedChanel);
                this._listRoom = channelMgr.roomList;

                if (this.sortGroup != 0 && this.sortType != 0) {
                    this.autoSortTable();
                }
                this._uiTable.reloadData();

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
                    this._uiTable.reloadData();
                }
            }
            else {
                var mess = localized("SEARCH_TABLE_NOT_FOUND");
                Toast.makeToast(Toast.LONG, mess);
            }
        }

        sceneMgr.clearLoading();
    },

    onButtonRelease: function (button, id) {

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
            case ChooseRoomScene.BTN_CHOINGAY:
            {
                if (channelMgr.checkQuickPlay()) {
                    channelMgr.sendQuickPlayChannel();
                    sceneMgr.addLoading(LocalizedString.to("WAITING")).timeout(15);
                }
                else {
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
                        if (!channelMgr.checkDownLevel()) {
                            var message = LocalizedString.to("PLAY_MUCH_GOLD");
                            message = StringUtility.replaceAll(message, "%gold", StringUtility.pointNumber(CheckLogic.getMaxGoldCreateRoom()));
                            SceneMgr.getInstance().showOKDialog(message);
                        }
                        else {
                            sceneMgr.openGUI(CreateRoomGUI.className, ChooseRoomScene.CREATE_TABLE, ChooseRoomScene.CREATE_TABLE);
                        }
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
                this._uiTable.reloadData();
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
                this._uiTable.reloadData();
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
                this._uiTable.reloadData();
                break;
            }
            case ChooseRoomScene.BTN_JACKPOT:
            {
                sceneMgr.openGUI(JackpotGUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
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
            if (i == tabIdx) {
                this.tabRooms[i].loadTextures("ChooseRoomGUI/chanelselect.png", "ChooseRoomGUI/chanelselect.png", "");
                this.tabRooms[i].select.setVisible(true);
                this.tabRooms[i].nonselect.setVisible(false);
            }
            else {
                this.tabRooms[i].loadTextures("ChooseRoomGUI/btn.png", "ChooseRoomGUI/btn.png", "");
                this.tabRooms[i].select.setVisible(false);
                this.tabRooms[i].nonselect.setVisible(true);
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
        this.sendQuickPlayCustom(roomInfo);
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
