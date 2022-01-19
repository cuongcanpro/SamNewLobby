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
        jackpotMgr.updateButtonJackpot(this._layout, true);

        if (!cc.sys.isNative) {
            this._uiTable.setTouchEnabled(true);
        }
    },

    initGUI: function() {
        this.bg = this.getControl("bg");
        this.bg.setScale(cc.winSize.height / this.bg.getContentSize().height);

        var bSlide = this.getControl("bgSlide");
        this.listRoomHeight = bSlide.getPositionY() - bSlide.getContentSize().height;

        // Right top
        var pRightTop = this.getControl("pRightTop");
        // user info
        this.pUserInfo = new UserDetailInfo();
        pRightTop.addChild(this.pUserInfo);


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
                s = StringUtility.formatNumberSymbol(channelMgr.getMinGoldInChannel(i)) + "-" + StringUtility.formatNumberSymbol(channelMgr.getMaxGoldInChannel(i));
            }
            else {
                s = "Above " + StringUtility.formatNumberSymbol(channelMgr.getMinGoldInChannel(i));
            }
            btn.range.setString(s);
            this.tabRooms.push(btn);
        }

        this.bgBottom = this.getControl("bgBottom");
        this.bgBottom.setLocalZOrder(2);
        this.customButton("btnChoingay", ChooseRoomScene.BTN_CHOINGAY, this.bgBottom);
        this.customButton("btnTaoban", ChooseRoomScene.BTN_TAOBAN, this.bgBottom);
        this.customButton("btnRefresh", ChooseRoomScene.BTN_REFRESH, this.bgBottom);

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

    customizeGUI: function () {
        this.switchTab(0);
    },

    onUpdateGUI: function (data) {
        this.pUserInfo.updateToCurrentData();
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
                this.tabRooms[i].loadTextures("ChooseRoomGUI/btnChannelSelect.png", "ChooseRoomGUI/btnChannelSelect.png", "");
                this.tabRooms[i].select.loadTexture("ChooseRoomGUI/textChannelSelect_" + i + ".png");
                this.tabRooms[i].setLocalZOrder(1);
            }
            else {
                this.tabRooms[i].loadTextures("ChooseRoomGUI/btnChannel.png", "ChooseRoomGUI/btnChannel.png", "");
                this.tabRooms[i].select.loadTexture("ChooseRoomGUI/textChannel_" + i + ".png");
                this.tabRooms[i].setLocalZOrder(0);
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
