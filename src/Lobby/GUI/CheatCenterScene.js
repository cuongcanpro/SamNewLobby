/**
 * Created by Hunter on 3/20/2017.
 */

var CHEAT_MODE_LOBBY = 1;
var CHEAT_MODE_BOARD = 2;

var CARD_CHEAT_DECK = 1;
var CARD_CHEAT_PLAYER = 2;

var CHEAT_FAKE_UID = "cheat_center_fake_uid";
var CHEAT_SERVER_IP = "cheat_center_server_ip";
var CHEAT_SERVER_PORT = "cheat_center_server_port";

var CHEAT_SERVER_RANK_IP = "cheat_center_rank_ip";
var CHEAT_SERVER_RANK_PORT = "cheat_center_rank_port";

var CHEAT_ENABLE_PAYMENT = "cheat_center_enable_payment";
var CHEAT_PAYMENT_IAP = "cheat_center_enable_payment_iap";
var CHEAT_PAYMENT_DIRECT = "cheat_center_enable_payment_direct";
var CHEAT_REVIEW = "cheat_center_enable_review";
var CHEAT_LINK_FAKE_PAYMENT = "cheat_link_fake_payment";

var CHEAT_ENABLE_FAKE_SMS = "cheat_center_enable_faksesms";
var CHEAT_ENABLE_AUTO_CONSUME = "cheat_auto_consume";
var CHEAT_FAKE_SESSION = "cheat_fake_sessionkey";
var CHEAT_FAKE_SOCIAL = "cheat_fake_social";
var CHEAT_FAKE_LOGIN_DEV = "cheat_login_dev";

var CHEAT_FAKE_PORTAL = "cheat_fake_portal";

var CHEAT_OPEN = "cheat_open_from_code";
var CHEAT_OPEN_EXPIRED = "cheat_open_expired_time";

var CHEAT_CODE_EXPIRED_TIME = 43200000;
var CHEAT_CODE_CHECK_OPEN = 1308;
var CHEAT_CODE = ["00110100", "00110011", "01100001", "00110110",
    "00110000", "00111000", "01100011", "00110111",
    "01100101", "01100001", "00111001", "00110000",
    "00110011", "00110101", "00110001", "00111001",
    "01100101", "00111000", "00110100", "01100101",
    "01100011", "00110111", "01100100", "01100101",
    "01100101", "01100011", "00110011", "00110100",
    "00110010", "01100001", "00110111", "01100011"];

var CHEAT_LOG_FILE = "cheat_log.html";

var OPACITY_HIDDEN_LOGO = 0;

// CHEAT CENTER MANAGER
var CheatCenter = function () {

};

CheatCenter.ENABLE_USE_WEBSOCET = false;

CheatCenter.loadOldLog = function () {
    var writablePath = jsb.fileUtils.getWritablePath();
    var fullPath = writablePath + CHEAT_LOG_FILE;

    cc.loader.loadTxt(fullPath, function (error, txt) {
        if (error != null) {
            CheatCenter.OLD_LOG = "Empty";
        }
        else {
            CheatCenter.OLD_LOG = txt;
        }
    });
};

CheatCenter.onLogJS = function (args) {
    if (!args) return;
    //****************NOTICE**********************
    //***** DON'T PUT cc.log AT HERE *************
    try {
        var d = new Date();
        for (var i = 0; i < args.length; i++) {
            var s = args[i];
            var line = "";
            try {
                if (s.toLowerCase().indexOf("error") > -1)
                    line = "<p style='color:red'>";
                else
                    line = "<p style='color:black'>";
            }
            catch (e) {
                line = "<p style='color:black'>";
            }

            line += "<b style='color:grey;'>" + d.toLocaleString() + "</b> : ";
            line += s;
            line += "</p>";

            CheatCenterScene.instance.onLogJS(d.toLocaleString() + " : " + s);
            CheatCenter.LOGS.push(line);
        }
    }
    catch (e) {
        //***** ERROR PARSE cc.log *****
    }
};

CheatCenter.onSaveLog = function () {
    var d = new Date();

    var writablePath = jsb.fileUtils.getWritablePath();
    var fullPath = writablePath + CHEAT_LOG_FILE;
    var htmlString = "<!DOCTYPE html><html><head><title>LOG TRACKER</title></head><body>";
    htmlString += "<h1 align='center' style='color:green;\ font-size:250%;'> LOG TRACKER </h1>";
    htmlString += "<h3 align='center' style='color:red;'> Time Start : " + d.toLocaleString() + "</h3>";
    for (var i = CheatCenter.LOGS.length - 1; i >= 0; i--) {
        htmlString += CheatCenter.LOGS[i];
    }

    htmlString += "<div style='background: yellow;'> <h2 align='center' style='color:blue; font-size:150%;'\> OLD LOG </h2>" + CheatCenter.OLD_LOG + "</div>";

    htmlString += "</body></html>";

    return jsb.fileUtils.writeStringToFile(htmlString, fullPath);
};

CheatCenter.showLogJS = function () {
    var writablePath = jsb.fileUtils.getWritablePath();
    var fullPath = writablePath + CHEAT_LOG_FILE;

    if (CheatCenter.onSaveLog()) {
        if (cc.sys.os == cc.sys.OS_WINDOWS) {
            NativeBridge.openURLNative(fullPath);
        }
        else {
            NativeBridge.openHTML("file:///" + fullPath);
        }
    }
    else {
        ToastFloat.makeToast(ToastFloat.SHORT, "WRITE LOG ERROR !!!!!!");
    }
};

CheatCenter.fakeLogin = function () {
    var session = cc.sys.localStorage.getItem(CHEAT_FAKE_SESSION);
    var social = cc.sys.localStorage.getItem(CHEAT_FAKE_SOCIAL);

    if (session == null || social == null || session == "" || social == -1 || !cc.sys.isNative) {
        return false;
    }

    ToastFloat.makeToast(ToastFloat.SHORT, "Login Fake Session !");

    GameData.getInstance().socialLogined = social;
    GameData.getInstance().sessionkey = session;
    GameData.getInstance().openID = 0;

    GameClient.getInstance().connect();
    return true;
};

CheatCenter.checkOpenCheat = function (s) {
    if (!s) return false;
    if (s.length != 6) return false;

    /*
    if (!CheatCenter.CODE_OPEN_CHEAT) {
        for (var i = 0; i < CHEAT_CODE.length; i++) {
            CheatCenter.CODE_OPEN_CHEAT += String.fromCharCode(parseInt(CHEAT_CODE[i], 2));
        }
    }
    */

    //if (s == CheatCenter.CODE_OPEN_CHEAT) {
    if(generateOTP(gamedata.userData.zName) == s) {
        cc.sys.localStorage.setItem(CHEAT_OPEN, CHEAT_CODE_CHECK_OPEN);
        cc.sys.localStorage.setItem(CHEAT_OPEN_EXPIRED, Date.now());
        ToastFloat.makeToast(ToastFloat.SHORT, "Open CheatCenter success !!!!!! Restart game to apply this !");
        return true;
    }
    return false;
};

CheatCenter.checkEnableCheat = function () {
    if (!Config.ENABLE_CHEAT) {
        var cheatCode = parseInt(cc.sys.localStorage.getItem(CHEAT_OPEN));
        var cheatExpired = parseInt(cc.sys.localStorage.getItem(CHEAT_OPEN_EXPIRED));
        if (!isNaN(cheatCode) && !isNaN(cheatExpired) && (cheatCode == CHEAT_CODE_CHECK_OPEN)) {
            var cur = Date.now();

            cc.log("timeExpired " + cheatExpired + "/" + cur + "/" + (cur - cheatExpired));

            if (cur - cheatExpired < CHEAT_CODE_EXPIRED_TIME) {
                Config.ENABLE_CHEAT = true;
            }
            else {
                cc.sys.localStorage.removeItem(CHEAT_OPEN);
                cc.sys.localStorage.removeItem(CHEAT_OPEN_EXPIRED);
            }
        }
    }

    CheatCenter.enableLogJS();
};

CheatCenter.openCheatPopup = function () {
    if (Config.ENABLE_CHEAT) {
        sceneMgr.openGUI(CheatCenterScene.className, CheatCenterScene.TAG, CheatCenterScene.TAG);
    }
};

CheatCenter.enableLogJS = function () {
    var flog = cc.log;
    cc.log = function () {
        if (Config.ENABLE_CHEAT) {
            CheatCenter.onLogJS(arguments);
        }
        flog.apply(this, arguments);
    };
};

CheatCenter.LOGS = [];
CheatCenter.LIST_LOGS = [];
CheatCenter.OLD_LOG = "";

CheatCenter.IS_FAKE_UID = false;
CheatCenter.SERVER_IP = "";
CheatCenter.SERVER_PORT = "";
CheatCenter.SERVER_NEW_RANK_IP = "";
CheatCenter.SERVER_NEW_RANK_PORT = "";

CheatCenter.ENABLE_PAYMENT = false;
CheatCenter.ENABLE_PAYMENT_IAP = false;
CheatCenter.ENABLE_PAYMENT_DIRECT = false;
CheatCenter.ENABLE_REVIEW = false;

CheatCenter.ENABLE_FAKE_SMS = false;

CheatCenter.ENABLE_LOGIN_DEV = false;

CheatCenter.ENABLE_PORTAL = false;

CheatCenter.CODE_OPEN_CHEAT = "";

// CHEAT CENTER SCENE
var CheatCenterScene = BaseLayer.extend({

    ctor: function () {
        CheatCenterScene.instance = this;

        this.pLobby = null;
        this.pBoard = null;
        this.pFakeLogin = null;
        this.pTab = null;

        this.arLogs = [];

        this.oldPos = {x : 0, y : 0};

        this.isMove = false;

        this.isCheckEnoughCard = true;

        this.isAutoHideCheat = false;

        Array.min = function( array ){
            return Math.min.apply( Math, array );
        };

        this.guisListener = [];

        this._super(CheatCenterScene.className);
        this.initWithBinaryFile("CheatCenterScene.json");
    },

    initGUI: function () {
        var winSize = cc.director.getWinSize();
        this.pMove = this.getControl("pMove");
        var size = this.pMove.getContentSize();
        this.pMove.setPosition(size.width/2,winSize.height - size.height/2);
        this.pMove.stateVisible = false;
        this.pMove.setOpacity(OPACITY_HIDDEN_LOGO);

        this.pTab = this.getControl("pTab");
        this.customButton("cheatCard", CheatCenterScene.BTN_CHEAT_CARD, this.pTab);
        this.customButton("cheatInfo", CheatCenterScene.BTN_CHEAT_INFO, this.pTab);
        this.pTab.setVisible(Config.ENABLE_CHEAT && !cc.sys.isNative);

        this.pTab.pos = this.pTab.getPosition();

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,

            onTouchBegan: function (touch, event) {
                var gui = sceneMgr.getGUI(CheatCenterScene.TAG);
                if (gui)
                    gui.onTouch(0, touch.getLocation());
                return true;
            },

            onTouchEnded: function (touch, event) {
                var gui = sceneMgr.getGUI(CheatCenterScene.TAG);
                if (gui)
                    gui.onTouch(2, touch.getLocation());
            },

            onTouchMoved: function (touch, event) {
                var gui = sceneMgr.getGUI(CheatCenterScene.TAG);
                if (gui)
                    gui.onTouch(1, touch.getLocation());
            }
        }, this.pTab);

        this.pLobby = this.getControl("pLobby");
        this.pBoard = this.getControl("pBoard");
        this.pFakeLogin = this.getControl("pLogin");
        this.pFakeZalo = this.getControl("pCheatSessionZalo");

        this.pBoard.setVisible(false);
        this.pLobby.setVisible(false);
        this.pFakeLogin.setVisible(false);
        this.pFakeZalo.setVisible(false);

        this.loadLobby();
        this.loadBoard();
        this.loadFakeLogin();
        this.loadFakeZalo();
        this.loadCache();
        // this.loadLogPanel();

        cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, CheatCenter.onSaveLog);
    },

    onEnterFinish : function () {
        this.pMove.stateVisible = true;
        this.schedule(this.onUpdateUI,1);
        if (!cc.sys.isNative){
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,

                onTouchBegan: function (touch, event) {
                    var gui = sceneMgr.getGUI(CheatCenterScene.TAG);
                    if (gui)
                        gui.onTouch(0, touch.getLocation());
                    return true;
                },

                onTouchEnded: function (touch, event) {
                    var gui = sceneMgr.getGUI(CheatCenterScene.TAG);
                    if (gui)
                        gui.onTouch(2, touch.getLocation());
                },

                onTouchMoved: function (touch, event) {
                    var gui = sceneMgr.getGUI(CheatCenterScene.TAG);
                    if (gui)
                        gui.onTouch(1, touch.getLocation());
                }
            }, this.pTab);
        }
    },

    onUpdateUI : function (dt) {
        OPACITY_HIDDEN_LOGO = this.isAutoHideCheat ? 0 : 125;

        var stateVisible = this.pTab.isVisible();
        this.pMove.stopAllActions();

        if(this.pMove.stateVisible == stateVisible) {
            this.pMove.setOpacity(this.pMove.stateVisible?255:OPACITY_HIDDEN_LOGO);
            return;
        }

        this.pMove.stopAllActions();
        if(stateVisible) {
            this.pMove.stateVisible = true;
            this.pMove.setOpacity(OPACITY_HIDDEN_LOGO);
            this.pMove.runAction(cc.fadeTo(1,255));
        }
        else {
            this.pMove.stateVisible = false;
            this.pMove.setOpacity(0);
            this.pMove.runAction(cc.fadeOut(1));
        }
    },

    onTouch: function (type, pos) {
        if (this.isTouchMove(pos)) {
            switch (type) {
                case 0:
                {
                    this.isMove = true;
                    this.deltaPos = cc.p(pos.x - this.pMove.getPositionX(), pos.y - this.pMove.getPositionY());
                    this.oldPos = this.pMove.getPosition();
                    this.timeStartTouch = new Date().getTime();
                    break;
                }
                case 2:
                {
                    var dX = Math.abs(this.pMove.getPositionX() - this.oldPos.x);
                    var dY = Math.abs(this.pMove.getPositionY() - this.oldPos.y);
                    this.isMove = false;
                    var deltaTime = (new Date().getTime()) - this.timeStartTouch;

                    if((deltaTime < 100) || (dX < 5 && dY < 5)) {
                        this.pTab.setVisible(!this.pTab.isVisible());

                        try {
                            for(var i in this.guisListener)
                                this.guisListener[i].visibleCheat(this.pTab.isVisible());
                        }
                        catch(e) {

                        }

                        if(!this.pTab.isVisible()) {
                            this.pBoard.setVisible(false);
                            this.pLobby.setVisible(false);
                            this.pFakeLogin.setVisible(false);
                        }
                    }

                    var pos = this.pMove.getPosition();
                    var winSize = cc.director.getWinSize();
                    var size = this.pMove.getContentSize();
                    size.width *= this._scale;
                    size.height *= this._scale;

                    // check 4 direct
                    var arPos = [];
                    arPos.push(cc.p(size.width / 2,pos.y));
                    arPos.push(cc.p(winSize.width - size.width / 2,pos.y));
                    arPos.push(cc.p(pos.x,size.height / 2));
                    arPos.push(cc.p(pos.x,winSize.height - size.height / 2));

                    var arP = [];
                    arP.push(Math.abs(pos.x - size.width / 2));
                    arP.push(Math.abs(pos.x - (winSize.width - size.width / 2)));
                    arP.push(Math.abs(pos.y - size.height / 2));
                    arP.push(Math.abs(pos.y - (winSize.height - size.height / 2)));
                    var min = Array.min(arP);

                    var nextPos = cc.p(0,0);
                    for(var i = 0; i < 4 ; i++) {
                        if(arP[i] == min) {
                            nextPos = arPos[i];
                        }
                    }

                    this.pMove.stopAllActions();
                    this.pMove.runAction(new cc.EaseSineOut(cc.moveTo(0.15,nextPos)));
                    break;
                }
            }
        }

        if (type == 1 && this.isMove) {
            this.pMove.setPosition(pos.x - this.deltaPos.x, pos.y - this.deltaPos.y);

            var pos = this.pMove.getPosition();
            var size = this.pMove.getContentSize();
            size = cc.size(size.width * this._scale, size.height * this._scale);

            var winSize = cc.director.getWinSize();

            var nextPos = JSON.parse(JSON.stringify(pos));

            if (pos.x <= size.width / 2) {
                nextPos.x = (size.width / 2);
            }

            if (pos.x >= (winSize.width - size.width / 2)) {
                nextPos.x = (winSize.width - size.width / 2);
            }

            if (pos.y <= size.height / 2) {
                nextPos.y = (size.height / 2);
            }

            if (pos.y >= (winSize.height - size.height / 2)) {
                nextPos.y = (winSize.height - size.height / 2);
            }

            this.pMove.setPosition(nextPos);
        }
    },

    isTouchMove: function (p) {
        var pos = this.pMove.getParent().convertToNodeSpace(p);
        var cp = this.pMove.getPosition();
        var csize = this.pMove.getContentSize();
        var rect = cc.rect(cp.x - csize.width / 2, cp.y - csize.height / 2, csize.width, csize.height);

        return (cc.rectContainsPoint(rect, pos));
    },

    loadCache: function () {
        if (cc.sys.isNative)
            CheatCenter.loadOldLog();

        var sIP = cc.sys.localStorage.getItem(CHEAT_SERVER_IP);
        var sPort = parseInt(cc.sys.localStorage.getItem(CHEAT_SERVER_PORT));

        if ((this.validateIPAddress(sIP) || !cc.sys.isNative) && sPort) {
            CheatCenter.SERVER_IP = sIP;
            CheatCenter.SERVER_PORT = sPort;
        }
        else {
            if(Config.ENABLE_DEV) {
                CheatCenter.SERVER_IP = Config.SERVER_DEV;
                CheatCenter.SERVER_PORT = Config.PORT_DEV;
            }
            else {
				if (cc.sys.isNative) {
	                CheatCenter.SERVER_IP = Config.SERVER_PRIVATE;
	                CheatCenter.SERVER_PORT = Config.PORT;
	            }
	            else {
	                CheatCenter.SERVER_IP = Config.SERVER_PRIVATE_WEB;
	                CheatCenter.SERVER_PORT = Config.PORT_WEB;
	            }
            }

            cc.sys.localStorage.setItem(CHEAT_SERVER_IP, CheatCenter.SERVER_IP);
            cc.sys.localStorage.setItem(CHEAT_SERVER_PORT, CheatCenter.SERVER_PORT);
        }

        var rankIp = cc.sys.localStorage.getItem(CHEAT_SERVER_RANK_IP);
        var rankPort = cc.sys.localStorage.getItem(CHEAT_SERVER_RANK_PORT);

        if (this.validateIPAddress(rankIp) && rankPort || !cc.sys.isNative) {
            CheatCenter.SERVER_NEW_RANK_IP = rankIp;
            CheatCenter.SERVER_NEW_RANK_PORT = rankPort;
        } else {
            if (cc.sys.isNative) {
                CheatCenter.SERVER_NEW_RANK_IP = NewRankData.IP_DEV;
                CheatCenter.SERVER_NEW_RANK_PORT = NewRankData.PORT_DEV;
            } else {
                CheatCenter.SERVER_NEW_RANK_IP = NewRankData.IP_DEV_WEB;
                CheatCenter.SERVER_NEW_RANK_PORT = NewRankData.PORT_DEV;
            }

            cc.sys.localStorage.setItem(CHEAT_SERVER_RANK_IP, CheatCenter.SERVER_NEW_RANK_IP);
            cc.sys.localStorage.setItem(CHEAT_SERVER_RANK_PORT, CheatCenter.SERVER_NEW_RANK_PORT);
        }

        this.txIP.setString(CheatCenter.SERVER_IP);
        this.txPort.setString(CheatCenter.SERVER_PORT);

        var sPayment = parseInt(cc.sys.localStorage.getItem(CHEAT_ENABLE_PAYMENT));
        var sIAP = parseInt(cc.sys.localStorage.getItem(CHEAT_PAYMENT_IAP));
        var sDirect = parseInt(cc.sys.localStorage.getItem(CHEAT_PAYMENT_DIRECT));
        var sReview = parseInt(cc.sys.localStorage.getItem(CHEAT_REVIEW));
        var sFakeSMS = parseInt(cc.sys.localStorage.getItem(CHEAT_ENABLE_FAKE_SMS));
        var sFakeId = parseInt(cc.sys.localStorage.getItem(CHEAT_FAKE_UID));
        var sFakePortal = parseInt(cc.sys.localStorage.getItem(CHEAT_FAKE_PORTAL));
        var sAutoConsume = parseInt(cc.sys.localStorage.getItem(CHEAT_ENABLE_AUTO_CONSUME));
        var sLoginDev = parseInt(cc.sys.localStorage.getItem(CHEAT_FAKE_LOGIN_DEV));

        CheatCenter.ENABLE_PAYMENT = sPayment;
        CheatCenter.ENABLE_PAYMENT_IAP = sIAP;
        CheatCenter.ENABLE_PAYMENT_DIRECT = sDirect;
        CheatCenter.ENABLE_REVIEW = sReview;
        CheatCenter.ENABLE_FAKE_SMS = sFakeSMS;
        CheatCenter.ENABLE_LOGIN_DEV = sLoginDev;
        Config.ENABLE_DEV = CheatCenter.ENABLE_LOGIN_DEV;
        this.cbLoginDev.setSelected(sLoginDev);
        CheatCenter.IS_FAKE_UID = sFakeId;
        CheatCenter.ENABLE_AUTO_CONSUME = sAutoConsume;

        this.cbPayment.setSelected(sPayment);
        this.cbPaymentIAP.setSelected(sIAP);
        this.cbPaymentDirect.setSelected(sDirect);
        this.cbEnableReview.setSelected(sReview);
        this.cbFakeSMS.setSelected(sFakeSMS);
        this.cbFakeId.setSelected(sFakeId);
        this.cbAutoConsume.setSelected(sAutoConsume);

        CheatCenter.ENABLE_FAKE_PORTAL = sFakePortal;
        this.cbPortal.setSelected(sFakePortal);

        this.cbPaymentIAP.setVisible(sPayment);
        this.cbPaymentDirect.setVisible(sPayment);
        this.cbEnableReview.setVisible(sPayment);

        // load version.manifest
        var resPath = jsb.fileUtils.fullPathForFilename("version.manifest");

        if(jsb.fileUtils.isFileExist(resPath)) {
            cc.loader.loadTxt(resPath, function (error, txt) {
                if (error != null) {

                }
                else {
                    try {
                        var str = JSON.parse(txt);
                        this.urlUpdateVersion = str["packageUrl"];
                    }
                    catch(e) {

                    }
                }
            }.bind(this));
        }
    },

    loadLobby: function () {
        this.txGold = this.addEditbox("txGold", this.pLobby);
        this.txG = this.addEditbox("txG", this.pLobby);
        this.txGStar = this.addEditbox("txGStar", this.pLobby);
        this.txEXP = this.addEditbox("txEXP", this.pLobby);
        this.txJackpot = this.addEditbox("txJackpot", this.pLobby);
        this.txUrlDownload = this.addEditbox("txURLUpdate", this.pLobby);
        this.txVersionUpdate = this.addEditbox("txVersionUpdate", this.pLobby);
        this.txUrlDownload.setString(Config.MANIFEST_URL_PRIVATE);

        this.txLinkCheatSms = this.addEditbox("txLinkCheatSms", this.pLobby);
        var linkCheat = cc.sys.localStorage.getItem(CHEAT_LINK_FAKE_PAYMENT);
        linkCheat = linkCheat || Constant.SMS_PRIVATE;
        this.txLinkCheatSms.setString(linkCheat);

        this.txIP = this.addEditbox("txIP", this.pLobby);
        this.txPort = this.addEditbox("txPort", this.pLobby);

        if (cc.sys.isNative) {
            this.txGold.setInputFlag(cc.EDITBOX_INPUT_MODE_NUMERIC);
            this.txG.setInputFlag(cc.EDITBOX_INPUT_MODE_NUMERIC);
            this.txGStar.setInputFlag(cc.EDITBOX_INPUT_MODE_NUMERIC);
            this.txEXP.setInputFlag(cc.EDITBOX_INPUT_MODE_NUMERIC);
            this.txJackpot.setInputFlag(cc.EDITBOX_INPUT_MODE_NUMERIC);
            this.txPort.setInputFlag(cc.EDITBOX_INPUT_MODE_NUMERIC);
        }

        this.customButton("add", CheatCenterScene.BTN_CHEAT_ADD, this.pLobby);
        this.customButton("sub", CheatCenterScene.BTN_CHEAT_SUB, this.pLobby);

        this.customButton("change_url", CheatCenterScene.BTN_CHANGE_URL_DOWNLOAD, this.pLobby);
        this.customButton("change_version_update", CheatCenterScene.BTN_CHANGE_VERSION_UPDATE, this.pLobby);
        this.customButton("change_link_cheat", CheatCenterScene.BTN_CHANGE_LINK_CHEAT_SMS, this.pLobby);

        this.customButton("resetCache", CheatCenterScene.BTN_CLEAR_CACHE, this.pLobby);
        this.customButton("testFunc", CheatCenterScene.BTN_TEST_FUNC, this.pLobby);
        this.customButton("changeServer", CheatCenterScene.BTN_CHANGE_SERVER, this.pLobby);
        this.customButton("privateServer", CheatCenterScene.BTN_DEFAULT_SERVER, this.pLobby);
        this.customButton("liveServer", CheatCenterScene.BTN_DEFAULT_SERVER_LIVE, this.pLobby);
        this.customButton("fakeLogin", CheatCenterScene.BTN_FAKE_LOGIN_PANEL, this.pLobby);
        this.customButton("showFPS", CheatCenterScene.BTN_SHOW_FPS, this.pLobby);
        this.customButton("btnResetMap", CheatCenterScene.BTN_RESET_MAP, this.pLobby);
        this.customButton("btnFakeZalo", CheatCenterScene.BTN_FAKE_ZALO, this.pLobby);

        this.customButton("showLog", CheatCenterScene.BTN_SHOW_LOG, this.pLobby);
        this.customButton("clearLog", CheatCenterScene.BTN_CLEAR_LOG, this.pLobby);
        this.customButton("showLogFloat", CheatCenterScene.BTN_SHOW_LOG_FLOAT, this.pLobby);

        this.cbPayment = this.getControl("enablePayment", this.pLobby);
        this.cbPaymentIAP = this.getControl("enableIAP", this.pLobby);
        this.cbPaymentDirect = this.getControl("enableDirect", this.pLobby);
        this.cbEnableReview = this.getControl("enableInReview", this.pLobby);
        this.cbFakeSMS = this.getControl("enableFakeSMS", this.pLobby);
        this.cbFakeId = this.getControl("fakeId", this.pLobby);
        this.cbAutoConsume = this.getControl("enableAutoConsume", this.pLobby);

        this.cbPayment.setTag(CheatCenterScene.CB_PAYMENT);
        this.cbPaymentIAP.setTag(CheatCenterScene.CB_PAYMENT_IAP);
        this.cbPaymentDirect.setTag(CheatCenterScene.CB_PAYMENT_DIRECT);
        this.cbEnableReview.setTag(CheatCenterScene.CB_REVIEW);
        this.cbFakeId.setTag(CheatCenterScene.CB_FAKE_ID);
        this.cbFakeSMS.setTag(CheatCenterScene.CB_FAKE_SMS);
        this.cbAutoConsume.setTag(CheatCenterScene.CB_AUTO_CONSUME);

        this.cbPayment.addEventListener(this.selectedStateEvent, this);
        this.cbPaymentIAP.addEventListener(this.selectedStateEvent, this);
        this.cbPaymentDirect.addEventListener(this.selectedStateEvent, this);
        this.cbEnableReview.addEventListener(this.selectedStateEvent, this);
        this.cbFakeSMS.addEventListener(this.selectedStateEvent, this);
        this.cbFakeId.addEventListener(this.selectedStateEvent, this);
        this.cbAutoConsume.addEventListener(this.selectedStateEvent, this);
    },

    loadFakeZalo: function() {
        this.tfSessionInputZalo = this.addEditbox("sessionInput", this.pFakeZalo);

        this.customButton("fakeSession", CheatCenterScene.BTN_SEND_FAKE_ZALO, this.pFakeZalo);
        this.customButton("close", CheatCenterScene.BTN_CLOSE_FAKE_ZALO, this.pFakeZalo);
    },

    loadFakeLogin: function () {
        this.tfSessionCache = this.addEditbox("sessionCache", this.pFakeLogin);
        this.tfATKInput = this.addEditbox("accesstokenInput", this.pFakeLogin);
        this.tfSessionInput = this.addEditbox("sessionInput", this.pFakeLogin);

        this.cbGoogle = this.getControl("cbGoogle", this.pFakeLogin);
        this.cbGoogle.setTag(CheatCenterScene.CB_GOOGLE);
        this.cbGoogle.addEventListener(this.selectedStateEvent, this);

        this.cbFacebook = this.getControl("cbFacebook", this.pFakeLogin);
        this.cbFacebook.setTag(CheatCenterScene.CB_FACEBOOK);
        this.cbFacebook.addEventListener(this.selectedStateEvent, this);

        this.cbZalo = this.getControl("cbZalo", this.pFakeLogin);
        this.cbZalo.setTag(CheatCenterScene.CB_ZALO);
        this.cbZalo.addEventListener(this.selectedStateEvent, this);

        this.cbZingme = this.getControl("cbZingme", this.pFakeLogin);
        this.cbZingme.setTag(CheatCenterScene.CB_ZINGME);
        this.cbZingme.addEventListener(this.selectedStateEvent, this);

        this.customButton("getSession", CheatCenterScene.BTN_GET_SESSION_FROM_ATK, this.pLogin);
        this.customButton("clearFake", CheatCenterScene.BTN_CLEAR_SESSION, this.pLogin);
        this.customButton("fakeSession", CheatCenterScene.BTN_FAKE_SESSION, this.pLogin);
        this.customButton("close", CheatCenterScene.BTN_CLOSE_FAKE_LOGIN, this.pLogin);

        this.cbPortal = this.getControl("cbPortal", this.pFakeLogin);
        this.cbPortal.setTag(CheatCenterScene.CB_PORTAL);
        this.cbPortal.addEventListener(this.selectedStateEvent, this);

        this.cbLoginDev = this.getControl("cbLoginDev", this.pFakeLogin);
        this.cbLoginDev.setTag(CheatCenterScene.CB_LOGINDEV);
        this.cbLoginDev.addEventListener(this.selectedStateEvent, this);

        this.selectSocialLogin(0, false);
    },

    onLogJS : function (s) {
        if(this.pLog && this.pLog.isVisible() && this.pLog.panel) {
            this.pLog.panel.onLogJS(s);
        }
    },

    selectedStateEvent: function (sender, type) {
        var isSelect = (type == ccui.CheckBox.EVENT_SELECTED);

        var needRestart = true;
        switch (sender.getTag()) {
            case CheatCenterScene.CB_PAYMENT:
            {
                CheatCenter.ENABLE_PAYMENT = isSelect ? 1 : 0;
                cc.sys.localStorage.setItem(CHEAT_ENABLE_PAYMENT, CheatCenter.ENABLE_PAYMENT);

                this.cbPaymentIAP.setVisible(isSelect);
                this.cbPaymentDirect.setVisible(isSelect);
                this.cbEnableReview.setVisible(isSelect);

                if (isSelect) {
                    this.cbPaymentIAP.setSelected(CheatCenter.ENABLE_PAYMENT_IAP);
                    this.cbPaymentDirect.setSelected(CheatCenter.ENABLE_PAYMENT_DIRECT);
                    this.cbEnableReview.setSelected(CheatCenter.ENABLE_REVIEW);
                }
                break;
            }
            case CheatCenterScene.CB_PAYMENT_IAP:
            {
                CheatCenter.ENABLE_PAYMENT_IAP = isSelect ? 1 : 0;
                cc.sys.localStorage.setItem(CHEAT_PAYMENT_IAP, CheatCenter.ENABLE_PAYMENT_IAP);
                break;
            }
            case CheatCenterScene.CB_PAYMENT_DIRECT:
            {
                CheatCenter.ENABLE_PAYMENT_DIRECT = isSelect ? 1 : 0;
                cc.sys.localStorage.setItem(CHEAT_PAYMENT_DIRECT, CheatCenter.ENABLE_PAYMENT_DIRECT);
                break;
            }
            case CheatCenterScene.CB_REVIEW:
            {
                CheatCenter.ENABLE_REVIEW = isSelect ? 1 : 0;
                cc.sys.localStorage.setItem(CHEAT_REVIEW, CheatCenter.ENABLE_REVIEW);
                break;
            }
            case CheatCenterScene.CB_FAKE_ID:
            {
                CheatCenter.IS_FAKE_UID = isSelect ? 1 : 0;
                cc.sys.localStorage.setItem(CHEAT_FAKE_UID, CheatCenter.IS_FAKE_UID);
                break;
            }
            case CheatCenterScene.CB_CHECK_ENOUGH:
            {
                needRestart = false;
                this.isCheckEnoughCard = isSelect ? 1 : 0;
            }
            case CheatCenterScene.CB_GOOGLE:
            case CheatCenterScene.CB_FACEBOOK:
            case CheatCenterScene.CB_ZINGME:
            case CheatCenterScene.CB_ZALO:
            {
                this.selectSocialLogin(sender.getTag(), isSelect);
                needRestart = false;
                break;
            }
            case CheatCenterScene.CB_PORTAL:
            {
                var isOK = this.fakePortal(isSelect);
                if (isOK) {
                    needRestart = true;
                }
                else {
                    needRestart = false;
                    this.cbPortal.setSelected(false);
                }
                break;
            }
            case CheatCenterScene.CB_LOGINDEV:
            {
                needRestart = true;
                CheatCenter.ENABLE_LOGIN_DEV = isSelect ? 1 : 0;
                Config.ENABLE_DEV = CheatCenter.ENABLE_LOGIN_DEV;
                cc.sys.localStorage.setItem(CHEAT_FAKE_LOGIN_DEV, CheatCenter.ENABLE_LOGIN_DEV);
                break;
            }
            case CheatCenterScene.CB_FAKE_SMS:
            {
                needRestart = false;
                CheatCenter.ENABLE_FAKE_SMS = isSelect ? 1 : 0;
                cc.sys.localStorage.setItem(CHEAT_ENABLE_FAKE_SMS, CheatCenter.ENABLE_FAKE_SMS);
                break;
            }
            case CheatCenterScene.CB_AUTO_CONSUME:
            {
                needRestart = false;
                CheatCenter.ENABLE_AUTO_CONSUME = isSelect ? 1 : 0;
                cc.sys.localStorage.setItem(CHEAT_ENABLE_AUTO_CONSUME, CheatCenter.ENABLE_AUTO_CONSUME);
                break;
            }
        }

        // if(Config.ENABLE_CHEAT && CheatCenter.ENABLE_PAYMENT)
        // {
        //     if(CheatCenter.ENABLE_REVIEW)
        //         gamedata.payments = [false,false,false];
        //     else
        //         gamedata.payments = [CheatCenter.ENABLE_PAYMENT_IAP,CheatCenter.ENABLE_PAYMENT_IAP,CheatCenter.ENABLE_PAYMENT_DIRECT];
        // }

        if (needRestart)
            ToastFloat.makeToast(ToastFloat.SHORT, "Re-Login Game to apply this !");
    },

    addEditbox: function (name, parent) {
        var old = this.getControl(name, parent);
        if (!cc.sys.isNative)
            return old;
        var tf = BaseLayer.createEditBox(old);
        parent.addChild(tf);
        tf.setPosition(old.getPosition());
        old.setVisible(false);
        return tf;
    },

    loadBoard: function () {
        // load ui
        this.pCard = this.getControl("pCard", this.pBoard);
        this.cards = [];

        this.customButton("reset", CheatCenterScene.BTN_RESET, this.pBoard);
        this.customButton("randomAll", CheatCenterScene.BTN_RANDOM, this.pBoard);
        this.customButton("randomSelect", CheatCenterScene.BTN_RANDOM_SELECT, this.pBoard);
        this.customButton("send", CheatCenterScene.BTN_SEND, this.pBoard);

        this.cbCheckEnough = this.getControl("checkEnough", this.pBoard);
        this.cbCheckEnough.setTag(CheatCenterScene.CB_CHECK_ENOUGH);
        this.cbCheckEnough.addEventListener(this.selectedStateEvent, this);

        this.pPlayers = [];
        this.pBgs = [];
        this.currentPlayer = -1;
        for (var i = 1; i <= 5; i++) {
            var p = this.getControl("p" + i, this.pBoard);
            p.setVisible(!(i > Config.CHEAT_MAX_PLAYER));

            var btn = this.customButton("btn" + i, CheatCenterScene.BTN_PLAYER + i - 1, this.pBoard);
            btn.setVisible(!(i > Config.CHEAT_MAX_PLAYER));

            var bg = this.getControl("bg" + i, this.pBoard);
            bg.setVisible(false);
            bg.setVisible(!(i > Config.CHEAT_MAX_PLAYER));
            this.pBgs.push(bg);

            p.cards = [];
            this.pPlayers.push(p);
        }

        // load card
        var startPos = cc.p(5, 5);
        for (var i = 0; i < 7; i++) {
            for (var j = 0; j < 8; j++) {
                var id = i * 8 + j;
                if (id >= 52) continue;
                var card = new CardCheat(id, this, CARD_CHEAT_DECK);
                card.setCardSize(Config.CARD_CHEAT_SCALE_DECK);
                card.setPosition(startPos.x + card.getCardWidth() / 2 + card.getCardWidth() * j * 1.05, startPos.y + card.getCardHeight() / 2 + card.getCardHeight() * i);
                this.pCard.addChild(card);
                this.cards.push(card);
            }
        }

        this.resetCardDeck();
    },

    resetCardDeck: function () {
        for (var i = 0; i < this.cards.length; i++) {
            this.cards[i].setVisible(true);
        }

        for (var i = 0; i < this.pPlayers.length; i++) {
            var p = this.pPlayers[i];
            p.removeAllChildren();
            p.cards = [];
        }

        this.selectPlayer(0);
    },

    selectPlayer: function (id) {
        this.currentPlayer = id;
        for (var i = 0; i < this.pBgs.length; i++) {
            this.pBgs[i].setVisible(i == id);
        }
    },

    visibleLobby: function () {
        this.pBoard.setVisible(false);
        this.pLobby.setVisible(!this.pLobby.isVisible());
    },

    visibleBoard: function () {
        this.pLobby.setVisible(false);
        this.pBoard.setVisible(!this.pBoard.isVisible());
    },

    visibleFakeLogin: function () {
        var ss = cc.sys.localStorage.getItem("session");
        if (ss)
            this.tfSessionCache.setString(ss);
        var social = cc.sys.localStorage.getItem("typesocial");
        switch (parseInt(social)) {
            case SocialManager.GOOGLE:
                this.cbGoogle.setSelected(true);
                break;
            case SocialManager.FACEBOOK:
                this.cbFacebook.setSelected(true);
                break;
            case SocialManager.ZINGME:
                this.cbZingme.setSelected(true);
                break;
            case SocialManager.ZALO:
                this.cbZalo.setSelected(true);
                break;
        }

        this.pLobby.setVisible(false);
        this.pFakeLogin.setVisible(!this.pFakeLogin.isVisible());
    },

    sortCardPlayer: function (p) {
        var cxxx = new CardCheat(0);
        cxxx.setCardSize(Config.CARD_CHEAT_SCALE_PLAYER);
        var startPos = cc.p(0, 0);
        if (Config.CARD_CHEAT_PLAYER_LINE == 1) {
            startPos = cc.p(0, this.pPlayers[0].getContentSize().height / 2 - cxxx.getCardHeight() / 2);
        }

        var maxLineCard;
        if (Config.CHEAT_MAX_CARD % Config.CARD_CHEAT_PLAYER_LINE == 0) maxLineCard = Config.CHEAT_MAX_CARD / Config.CARD_CHEAT_PLAYER_LINE;
        else maxLineCard = parseInt(Config.CHEAT_MAX_CARD / Config.CARD_CHEAT_PLAYER_LINE) + 1;

        var count = 0;
        var line = 0;
        for (var i = 0; i < p.cards.length; i++) {
            if (i == maxLineCard) {
                count = 0;
                line++;
            }
            var c = p.cards[i];
            c.setPosition(startPos.x + c.getCardWidth() / 2 + c.getCardWidth() * count, startPos.y + c.getCardHeight() / 2 + c.getCardHeight() * line);

            count++;
        }
    },

    randomCardPlayer: function () {
        for (var i = 0; i < Config.CHEAT_MAX_PLAYER; i++) {
            this.randomCardPlayerIndex(i);
        }
    },

    randomCardPlayerIndex: function (i) {
        var p = this.pPlayers[i];
        if (!p) return;

        var nCard = Config.CHEAT_MAX_CARD - p.cards.length;
        if (nCard > 0) {
            for (var j = 0; j < nCard; j++) {
                var ccc = this.getCardInDeckAvailable();
                if (ccc) {
                    ccc.setVisible(false);

                    var card = new CardCheat(ccc.id, this, CARD_CHEAT_PLAYER, i);
                    card.setCardSize(Config.CARD_CHEAT_SCALE_PLAYER);
                    p.cards.push(card);
                    p.addChild(card);
                }
            }

            this.sortCardPlayer(p);
        }
    },

    cheatLobby: function (gold, xu, gstar, exp, jackpot) {
        if (!gold) gold = 0;
        if (!xu) xu = 0;
        if (!gstar) gstar = 0;
        if (!exp) exp = 0;
        if (!jackpot) jackpot = 0;

        var pk = new CmdSendCheatMoney();
        pk.putData(gold, xu, exp);
        GameClient.getInstance().sendPacket(pk);
        pk.clean();

        var pk1 = new CmdSendCheatEXP();
        pk1.putData(exp);
        GameClient.getInstance().sendPacket(pk1);
        pk1.clean();

        var pk2 = new CmdSendCheatGStar();
        pk2.putData(gstar);
        GameClient.getInstance().sendPacket(pk2);
        pk2.clean();

        var pk3 = new CmdSendCheatJackpot();
        pk3.putData(jackpot);
        GameClient.getInstance().sendPacket(pk3);
        pk3.clean();

        this.notifySuccess();
    },

    cheatConfigCard: function () {
        // get info card
        var arCards = [];
        var isNotEnough = false;
        var pIndex = 1;
        for (var i = 0; i < Config.CHEAT_MAX_PLAYER; i++) {
            var p = this.pPlayers[i];
            if (!p) continue;
            var nCard = Config.CHEAT_MAX_CARD - p.cards.length;
            if (nCard <= 0 || !this.isCheckEnoughCard) // card no enough
            {
                for (var j = 0; j < p.cards.length; j++) {
                    arCards.push(p.cards[j].id);
                }
            }
            else {
                if (p.cards.length > 0) {
                    pIndex = i + 1;
                    isNotEnough = true;
                    break;
                }
            }
        }

        if (isNotEnough || arCards.length == 0) {
            ToastFloat.makeToast(ToastFloat.SHORT, "PLAYER " + pIndex + " NOT ENOUGH CARD !!!!");
        }
        else {
            var cmd = new CmdSendCheatConfigCard();

            cmd.putData(CheckLogic.convertCardCheat(arCards));
            GameClient.getInstance().sendPacket(cmd);
            cmd.clean();

            this.notifySuccess();
        }
    },

    notifySuccess: function () {

        ToastFloat.makeToast(ToastFloat.SHORT, "Send Cheat Success !!");
    },

    onSelectCardDeck: function (ccc) {
        if (ccc.id == 52) {
            ToastFloat.makeToast(ToastFloat.SHORT, "WHAT THE FUCKK !!!");
            return;
        }

        if (this.currentPlayer == -1) {
            ToastFloat.makeToast(ToastFloat.SHORT, "PLAYER NOT SELECTED !!!");
            return;
        }

        var p = this.pPlayers[this.currentPlayer];
        if (!p) {
            ToastFloat.makeToast(ToastFloat.SHORT, "PLAYER SELECTED ERROR !!!");
            return;
        }

        if (p.cards.length >= Config.CHEAT_MAX_CARD) {
            ToastFloat.makeToast(ToastFloat.SHORT, "MAX CARD !!!");
            return;
        }

        ccc.setVisible(false);

        var card = new CardCheat(ccc.id, this, CARD_CHEAT_PLAYER, this.currentPlayer);
        card.setCardSize(Config.CARD_CHEAT_SCALE_PLAYER);
        p.cards.push(card);
        p.addChild(card);

        this.sortCardPlayer(p);
    },

    onSelectCardPlayer: function (ccc) {
        var p = this.pPlayers[ccc.curPlayer];
        if (!p) return;

        //ccc.setVisible(false);

        for (var i = 0; i < p.cards.length; i++) {
            var c = p.cards[i];
            if (c.id == ccc.id) {
                c.removeFromParent();

                p.cards.splice(i, 1);
                break;
            }
        }
        this.sortCardPlayer(p);

        for (var i = 0; i < this.cards.length; i++) {
            var card = this.cards[i];
            if (card.id == ccc.id) {
                card.setVisible(true);
            }
        }
    },

    getCardInDeckAvailable: function () {
        var arIdxs = [];
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i] && this.cards[i].isVisible()) {
                arIdxs.push(i);
            }
        }

        var rndIdx = parseInt(Math.random() * 100) % arIdxs.length;

        return this.cards[arIdxs[rndIdx]];
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case CheatCenterScene.BTN_OPEN_CHEAT:
            {
                this.pTab.setVisible(!this.pTab.isVisible());
                break;
            }
            case CheatCenterScene.BTN_CHEAT_INFO:
            {
                this.visibleLobby();
                break;
            }
            case CheatCenterScene.BTN_CHEAT_CARD:
            {
                this.visibleBoard();
                break;
            }
            case CheatCenterScene.BTN_SHOW_LOG:
            {
                CheatCenter.showLogJS();
                break;
            }
            case CheatCenterScene.BTN_SHOW_LOG_FLOAT:
            {
                this.pLog.setVisible(!this.pLog.isVisible());
                break;
            }
            case CheatCenterScene.BTN_CLEAR_LOG:
            {
                CheatCenter.LOGS = [];
                CheatCenter.OLD_LOG = "";
                break;
            }
            case CheatCenterScene.BTN_CHEAT_ADD:
            case CheatCenterScene.BTN_CHEAT_SUB:
            {
                var gold = id * parseFloat(this.txGold.getString());
                var g = id * parseFloat(this.txG.getString());
                var gStar = id * parseFloat(this.txGStar.getString());
                var exp = id * parseFloat(this.txEXP.getString());
                var jackpot = id * parseFloat(this.txJackpot.getString());

                this.cheatLobby(gold, g, gStar, exp, jackpot);
                break;
            }
            case CheatCenterScene.BTN_CHANGE_URL_DOWNLOAD:
            {
                this.changeUpdateURL();
                break;
            }
            case CheatCenterScene.BTN_CHANGE_VERSION_UPDATE:
            {
                this.changeVersionUpdate();
                break;
            }
            case CheatCenterScene.BTN_CHANGE_LINK_CHEAT_SMS:
            {
                this.changeLinkCheatSms();
                break;
            }
            case CheatCenterScene.BTN_RESET:
            {
                this.resetCardDeck();
                break;
            }
            case CheatCenterScene.BTN_SEND:
            {
                this.cheatConfigCard();
                break;
            }
            case CheatCenterScene.BTN_RANDOM:
            {
                this.randomCardPlayer();
                break;
            }
            case CheatCenterScene.BTN_RANDOM_SELECT:
            {
                this.randomCardPlayerIndex(this.currentPlayer);
                break;
            }
            case CheatCenterScene.BTN_FAKE_DEVICE:
            {
                cc.sys.localStorage.clear();

                ToastFloat.makeToast(ToastFloat.SHORT, "Restart Game to apply this !");
                break;
            }
            case CheatCenterScene.BTN_CLEAR_CACHE:
            {
                cc.sys.localStorage.clear();

                ToastFloat.makeToast(ToastFloat.SHORT, "Restart Game to apply this !");
                break;
            }
            case CheatCenterScene.BTN_CHANGE_SERVER:
            {
                var sIp = this.txIP.getString();
                if (!this.validateIPAddress(sIp) && cc.sys.isNative) {
                    ToastFloat.makeToast(ToastFloat.SHORT, "IP address format error !!!");
                    return;
                }

                var sPort = parseInt(this.txPort.getString());
                if (!sPort) {
                    ToastFloat.makeToast(ToastFloat.SHORT, "Port error !!!");
                    return;
                }

                CheatCenter.SERVER_IP = sIp;
                CheatCenter.SERVER_PORT = sPort;

                cc.sys.localStorage.setItem(CHEAT_SERVER_IP, CheatCenter.SERVER_IP);
                cc.sys.localStorage.setItem(CHEAT_SERVER_PORT, CheatCenter.SERVER_PORT);

                this.txIP.setString(CheatCenter.SERVER_IP);
                this.txPort.setString(CheatCenter.SERVER_PORT);

                ToastFloat.makeToast(ToastFloat.SHORT, "Restart Game to apply this !");
                break;
            }
            case CheatCenterScene.BTN_DEFAULT_SERVER:
            {
                if (cc.sys.isNative) {
                    CheatCenter.SERVER_IP = Config.SERVER_PRIVATE;
                    CheatCenter.SERVER_PORT = Config.PORT;
                }
                else {
                    CheatCenter.SERVER_IP = Config.SERVER_PRIVATE_WEB;
                    CheatCenter.SERVER_PORT = Config.PORT_WEB;
                }

                cc.sys.localStorage.setItem(CHEAT_SERVER_IP, CheatCenter.SERVER_IP);
                cc.sys.localStorage.setItem(CHEAT_SERVER_PORT, CheatCenter.SERVER_PORT);

                CheatCenter.SERVER_NEW_RANK_IP = (cc.sys.isNative) ? NewRankData.IP_DEV : NewRankData.IP_DEV_WEB;
                CheatCenter.SERVER_NEW_RANK_PORT = NewRankData.PORT_DEV;

                cc.sys.localStorage.setItem(CHEAT_SERVER_RANK_IP, CheatCenter.SERVER_NEW_RANK_IP);
                cc.sys.localStorage.setItem(CHEAT_SERVER_RANK_PORT, CheatCenter.SERVER_NEW_RANK_PORT);

                this.txIP.setString(CheatCenter.SERVER_IP);
                this.txPort.setString(CheatCenter.SERVER_PORT);

                ToastFloat.makeToast(ToastFloat.SHORT, "Restart Game to apply this !");
                break;
            }
            case CheatCenterScene.BTN_DEFAULT_SERVER_LIVE:
            {
                if (cc.sys.localStorage.getItem("ipapp")) {
                    CheatCenter.SERVER_IP = cc.sys.localStorage.getItem("ipapp");
                    CheatCenter.SERVER_PORT = cc.sys.localStorage.getItem("portapp");
                }
                else {
                    if (cc.sys.isNative) {
                        CheatCenter.SERVER_IP = Config.SERVER_LIVE;
                        CheatCenter.SERVER_PORT = Config.PORT_LIVE;
                    }
                    else {
                        CheatCenter.SERVER_IP = Config.SERVER_LIVE_WEB;
                        CheatCenter.SERVER_PORT = Config.PORT_LIVE_WEB;
                    }
                }

                cc.sys.localStorage.setItem(CHEAT_SERVER_IP, CheatCenter.SERVER_IP);
                cc.sys.localStorage.setItem(CHEAT_SERVER_PORT, CheatCenter.SERVER_PORT);

                this.txIP.setString(CheatCenter.SERVER_IP);
                this.txPort.setString(CheatCenter.SERVER_PORT);

                CheatCenter.SERVER_NEW_RANK_IP = (cc.sys.isNative) ? NewRankData.IP_LIVE : NewRankData.IP_LIVE_WEB;
                CheatCenter.SERVER_NEW_RANK_PORT = NewRankData.PORT_LIVE;

                cc.sys.localStorage.setItem(CHEAT_SERVER_RANK_IP, CheatCenter.SERVER_NEW_RANK_IP);
                cc.sys.localStorage.setItem(CHEAT_SERVER_RANK_PORT, CheatCenter.SERVER_NEW_RANK_PORT);

                ToastFloat.makeToast(ToastFloat.SHORT, "Restart Game to apply this !");
                break;
            }
            case CheatCenterScene.BTN_TEST_FUNC:
            {
                this.onTestFunc();
                break;
            }
            case CheatCenterScene.BTN_FAKE_LOGIN_PANEL:
            case CheatCenterScene.BTN_CLOSE_FAKE_LOGIN:
            {
                this.visibleFakeLogin();
                break;
            }
            case CheatCenterScene.BTN_GET_SESSION_FROM_ATK:
            {
                this.getSessionFromAccessToken();
                break;
            }
            case CheatCenterScene.BTN_CLEAR_SESSION:
            {
                this.clearSession();
                break;
            }
            case CheatCenterScene.BTN_FAKE_SESSION:
            {
                this.fakeSession();
                break;
            }
            case CheatCenterScene.BTN_SHOW_FPS:
            {
                this.visibleFPS();
                break;
            }
            case CheatCenterScene.BTN_RESET_MAP:
            {
                var pk = new CmdSendResetMapZalo();
                pk.putData();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();
                break;
            }
            case CheatCenterScene.BTN_CLOSE_FAKE_ZALO:
            {
                this.pLobby.setVisible(true);
                this.pFakeZalo.setVisible(false);
                break;
            }
            case CheatCenterScene.BTN_FAKE_ZALO:
            {
                //this.pLobby.setVisible(false);
                //this.pFakeZalo.setVisible(true);

                // cheat reset zalo
                var pk = new CmdSendResetOfferZalo();
                pk.putData();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();
                break;
                break;
            }
            case CheatCenterScene.BTN_SEND_FAKE_ZALO:
            {
                cc.log("lkjfdl");
                //socialMgr._currentSocial = varant.ZALO;
                //GameData.getInstance().sessionkey = this.tfSessionInputZalo.getString();
                ////  GameData.getInstance().sessionkey = "aWQ9Mzc0NDUxNzMmdXNlcm5hbWU9c2ltbzMyJnNvY2lhbD16aW5nbWUmc29jaWFsbmFtZT1zaW1vMzImYXZhdGFyPWh0dHAlM0ElMkYlMkZ6aW5ncGxheS5zdGF0aWMuZzYuemluZy52biUyRmltYWdlcyUyRnpwcCUyRnpwZGVmYXVsdC5wbmcmdGltZT0xNTI2NTQzMTYwJm90aGVyPWRpc190aWVubGVuJTNBJTNBZGVmYXVsdCUzQSUzQTM3NDQ1MTczJTNBJTNBOTk5JnRva2VuS2V5PTM3NTQ0ODM4NzdmNTNiMGMyZjBiNDFjNWQ1YTNiNDk4";
                //GameClient.getInstance().connect();
                var session = this.tfSessionInputZalo.getString();
                socialMgr.saveSession(session, Constant.ZALO, "", SocialManager.ZALO);
                break;
            }
        }

        if (id >= CheatCenterScene.BTN_PLAYER) {
            this.selectPlayer(id - CheatCenterScene.BTN_PLAYER);
        }
    },

    validateIPAddress: function (ip) {
        if (!ip) return false;

        var re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return re.test(ip);
    },

    selectSocialLogin: function (type, isSelect) {
        this.cbGoogle.setSelected(type == CheatCenterScene.CB_GOOGLE && isSelect);
        this.cbFacebook.setSelected(type == CheatCenterScene.CB_FACEBOOK && isSelect);
        this.cbZingme.setSelected(type == CheatCenterScene.CB_ZINGME && isSelect);
        this.cbZalo.setSelected(type == CheatCenterScene.CB_ZALO && isSelect);
    },

    getSessionFromAccessToken: function () {
        var _social = "";
        var accesstoken = this.tfATKInput.getString().trim();

        if (this.cbGoogle.isSelected())
            _social = "google";
        if (this.cbFacebook.isSelected())
            _social = "facebook";
        if (this.cbZalo.isSelected())
            _social = "zalo";
        if (this.cbZingme.isSelected())
            _social = "zingme";

        if (accesstoken == "" || _social == "") {
            ToastFloat.makeToast(ToastFloat.SHORT, "AccessToken empty or Social not selected !");
            return;
        }

        var data = "service_name=getSessionKey&clientInfo=" + _social + gamedata.source + "&gameId=" + LocalizedString.config("GAME") + "&social=" + _social + "&accessToken=" + accesstoken;
        this.xhr = LoginHelper.getRequest(Constant.PORTAL_SERVICE_URL, data, 10000, null, this.responseSessionFromToken.bind(this), this.errorGetSessionToken.bind(this));
    },

    errorGetSessionToken: function () {
        ToastFloat.makeToast(ToastFloat.SHORT, "Get SessionKey error http !");
    },

    responseSessionFromToken: function (data) {
        var obj = {};
        try {
            obj = JSON.parse(this.xhr.responseText);
        }
        catch (e) {
            obj["error"] = 1;
        }

        if (obj["error"] == 0) {
            this.tfSessionInput.setString(obj["sessionKey"]);
        }
        else {
            this.tfSessionInput.setString(JSON.stringify(obj));
        }
    },

    fakePortal: function (isSelect) {
        if (isSelect) {
            var session = this.tfSessionInput.getString().trim();
            if (session == "") {
                ToastFloat.makeToast(ToastFloat.LONG, "Need Session Key to fake portal !!!");
                return false;
            }

            cc.sys.localStorage.setItem(CHEAT_FAKE_SESSION, session);
        }

        CheatCenter.ENABLE_FAKE_PORTAL = isSelect ? 1 : 0;
        cc.sys.localStorage.setItem(CHEAT_FAKE_PORTAL, CheatCenter.ENABLE_FAKE_PORTAL);

        return true;
    },

    clearSession: function () {
        cc.sys.localStorage.removeItem(CHEAT_FAKE_SESSION);
        cc.sys.localStorage.removeItem(CHEAT_FAKE_SOCIAL);


        ToastFloat.makeToast(ToastFloat.SHORT, "Logout game to apply this !");
    },

    fakeSession: function () {
        var session = this.tfSessionInput.getString().trim();
        var social = -1;
        if (this.cbFacebook.isSelected())
            social = SocialManager.FACEBOOK;
        else if (this.cbGoogle.isSelected())
            social = SocialManager.GOOGLE;
        else if (this.cbZalo.isSelected())
            social = SocialManager.ZALO;
        else if (this.cbZingme.isSelected())
            social = SocialManager.ZINGME;

        if (session == "" || social == -1) {
            ToastFloat.makeToast(ToastFloat.LONG, "SessionKey empty OR social not selected !!");
            return;
        }

        cc.sys.localStorage.setItem(CHEAT_FAKE_SESSION, session);
        cc.sys.localStorage.setItem(CHEAT_FAKE_SOCIAL, social);


        ToastFloat.makeToast(ToastFloat.SHORT, "Logout game to apply this !");
    },

    changeUpdateURL : function () {
        // get default link
        var curURL = Config.MANIFEST_URL_LIVE;
        var desURL = Config.MANIFEST_URL_PRIVATE;

        if(this.urlUpdateVersion) {
            curURL = this.urlUpdateVersion;
        }

        var sDes = this.txUrlDownload.getString().trim();
        if(sDes != "") {
            desURL = sDes;
        }

        var fVersion = "version.manifest";
        var fProject = "project.manifest";

        this.readManifestFile(fVersion,curURL,desURL);
        this.readManifestFile(fProject,curURL,desURL);
    },

    changeVersionUpdate : function () {
        var sDes = parseInt(this.txVersionUpdate.getString().trim());
        if(isNaN(sDes)) {
            sDes = 1;
        }

        var fVersion = "version.manifest";
        var fProject = "project.manifest";

        this.changeVersionManifest(fVersion,sDes);
        this.changeVersionManifest(fProject,sDes);
    },

    changeLinkCheatSms: function(){
        Constant.SMS_PRIVATE = this.txLinkCheatSms.getString();
        cc.sys.localStorage.setItem(CHEAT_LINK_FAKE_PAYMENT, Constant.SMS_PRIVATE);
    },

    readManifestFile : function (fName,cur,des) {
        var downPath = fr.NativeService.getFolderUpdateAssets() + "/" + fName;
        var resPath = jsb.fileUtils.fullPathForFilename(fName);

        var fName = "";
        if(jsb.fileUtils.isFileExist(downPath)) {
            fName = downPath;
        }
        else if(jsb.fileUtils.isFileExist(resPath)) {
            fName = resPath;
        }
        else {
            fName = "";
        }

        if(fName) {
            cc.loader.loadTxt(fName, function (error, txt) {
                if (error != null) {
                    ToastFloat.makeToast(ToastFloat.SHORT,"Error load " + fName);
                }
                else {
                    var str = txt;
                    str = StringUtility.replaceAll(str,cur,des);

                    var success = jsb.fileUtils.writeStringToFile(str, downPath);
                    if(success) {
                        ToastFloat.makeToast(ToastFloat.SHORT,"Change URL Download success. Restart game to apply this !");
                    }
                    else {
                        ToastFloat.makeToast(ToastFloat.SHORT,"Error change URL !");
                    }
                }
            });
        }
    },

    changeVersionManifest : function (fName,cur) {
        var downPath = fr.NativeService.getFolderUpdateAssets() + "/" + fName;
        var resPath = jsb.fileUtils.fullPathForFilename(fName);

        var fName = "";
        if(jsb.fileUtils.isFileExist(downPath)) {
            fName = downPath;
        }
        else if(jsb.fileUtils.isFileExist(resPath)) {
            fName = resPath;
        }
        else {
            fName = "";
        }

        if(fName) {
            cc.loader.loadTxt(fName, function (error, txt) {
                if (error != null) {
                    ToastFloat.makeToast(ToastFloat.SHORT,"Error load " + fName);
                }
                else {
                    var str = txt;

                    var jsVersion = cc.sys.localStorage.getItem(LocalizedString.config("KEY_JS_VERSION"));
                    if(jsVersion === undefined || jsVersion == null || jsVersion == "") jsVersion = "0";

                    var sNEW = "\"version\" : \"" + cur + "\"";
                    var sOLD = "\"version\" : \"" + jsVersion + "\"";
                    str = StringUtility.replaceAll(str,sOLD,sNEW);

                    var success = jsb.fileUtils.writeStringToFile(str, downPath);
                    if(success) {
                        ToastFloat.makeToast(ToastFloat.SHORT,"Change Version Update Success. Restart game to apply this !");
                    }
                    else {
                        ToastFloat.makeToast(ToastFloat.SHORT,"Error change version !");
                    }
                }
            });
        }
        else {
            ToastFloat.makeToast(ToastFloat.SHORT,"Cannot Read Manifest !!!");
        }
    },

    visibleFPS : function () {
        var fName = "project.json";
        var downPath = fr.NativeService.getFolderUpdateAssets() + "/" + fName;
        var resPath = jsb.fileUtils.fullPathForFilename(fName);

        var fName = "";
        if(jsb.fileUtils.isFileExist(downPath)) {
            fName = downPath;
        }
        else if(jsb.fileUtils.isFileExist(resPath)) {
            fName = resPath;
        }
        else {
            fName = "";
        }

        if(fName) {
            cc.loader.loadTxt(fName, function (error, txt) {
                if (error != null) {
                    ToastFloat.makeToast(ToastFloat.SHORT,"Can't change FPS" + fName);
                }
                else {
                    var obj = JSON.parse(txt);
                    obj.showFPS = !obj.showFPS;

                    var str = JSON.stringify(obj);
                    var success = jsb.fileUtils.writeStringToFile(str, downPath);
                    if(success) {
                        ToastFloat.makeToast(ToastFloat.SHORT,"Show FPS " + obj.showFPS + " ! Restart game to apply this !");
                    }
                    else {
                        ToastFloat.makeToast(ToastFloat.SHORT,"Error Show PFS !");
                    }
                }
            });
        }
    },

    onTestFunc: function () {
        cc.log("++Fuck " + this.isAutoHideCheat);
        this.isAutoHideCheat = !this.isAutoHideCheat;
        OPACITY_HIDDEN_LOGO = this.isAutoHideCheat ? 0 : 125;

        cc.log("++ABC " + OPACITY_HIDDEN_LOGO);

        ToastFloat.makeToast(ToastFloat.SHORT, "Auto Hide Cheat " + (this.isAutoHideCheat ? "ENABLE" : "DISABLE"));
    }
});

var CheatLogPanel = BaseLayer.extend({
    ctor : function (pLog) {
        this._super("CheatLogPanel");
        this.pLog = pLog;
        this.arLog = [];

        this.lastTimeUpdate = 0;

        this.listLog = new cc.TableView(this,this.pLog.getContentSize());
        this.listLog.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.listLog.setVerticalFillOrder(0);
        this.pLog.addChild(this.listLog);
        this.listLog.reloadData();
    },

    onLogJS : function (s) {
        var fullMsg = ChatMgr.getFullMessage("",s, this.pLog.getContentSize().width, 1);
        var lbMsg = ChatMgr.createText(fullMsg);

        var objLog = {};
        objLog.msg = fullMsg;
        objLog.size = cc.size(this.pLog.getContentSize().width,lbMsg.getContentSize().height);

        this.arLog.unshift(objLog);

        var cTime = new Date().getTime();
        if(cTime - this.lastTimeUpdate > 1000) {
            this.listLog.reloadData();
            this.lastTimeUpdate = cTime;
        }
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new CheatLogItem();
        }
        cell.setLog(this.arLog[idx]);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return this.arLog[idx].size;
    },

    numberOfCellsInTableView: function (table) {
        return this.arLog.length;
    }
});

var CheatLogItem = cc.TableViewCell.extend({
    ctor: function () {
        this._super();
    },

    setLog: function (obj) {
        this.info = obj;
        this.removeAllChildren();

        var lbMsg = ChatMgr.createText(obj.msg);
        this.addChild(lbMsg);
        lbMsg.setPositionY(lbMsg.getContentSize().height);
    }
});

var type = 0;

CheatCenterScene.className = "CheatCenterScene";

CheatCenterScene.BTN_CHEAT_CARD = 10;
CheatCenterScene.BTN_CHEAT_INFO = 11;

CheatCenterScene.BTN_RESET = 20;
CheatCenterScene.BTN_SEND = 30;
CheatCenterScene.BTN_RANDOM = 40;
CheatCenterScene.BTN_CHECK_ENOUGH = 42;
CheatCenterScene.BTN_RANDOM_SELECT = 41;

CheatCenterScene.BTN_CHEAT_ADD = 1;
CheatCenterScene.BTN_CHEAT_SUB = -1;
CheatCenterScene.BTN_FAKE_DEVICE = 2;
CheatCenterScene.BTN_CLEAR_CACHE = 3;
CheatCenterScene.BTN_CHANGE_SERVER = 4;
CheatCenterScene.BTN_DEFAULT_SERVER = 5;
CheatCenterScene.BTN_DEFAULT_SERVER_LIVE = 6;
CheatCenterScene.BTN_SHOW_LOG = 7;
CheatCenterScene.BTN_CLEAR_LOG = 8;
CheatCenterScene.BTN_TEST_FUNC = 9;
CheatCenterScene.BTN_SHOW_FPS = 15;
CheatCenterScene.BTN_RESET_MAP = 16;
CheatCenterScene.BTN_FAKE_ZALO = 17;
CheatCenterScene.BTN_SHOW_LOG_FLOAT = 18;

CheatCenterScene.BTN_FAKE_LOGIN_PANEL = 60;
CheatCenterScene.BTN_FAKE_SESSION = 61;
CheatCenterScene.BTN_CLEAR_SESSION = 62;
CheatCenterScene.BTN_CLOSE_FAKE_LOGIN = 63;
CheatCenterScene.BTN_GET_SESSION_FROM_ATK = 64;

CheatCenterScene.BTN_SEND_FAKE_ZALO = 80;
CheatCenterScene.BTN_CLOSE_FAKE_ZALO = 81;

CheatCenterScene.BTN_CHANGE_URL_DOWNLOAD = 70;
CheatCenterScene.BTN_CHANGE_VERSION_UPDATE = 71;
CheatCenterScene.BTN_CHANGE_LINK_CHEAT_SMS = 72;

CheatCenterScene.BTN_OPEN_CHEAT = 9999;

CheatCenterScene.CB_GOOGLE = 10;
CheatCenterScene.CB_FACEBOOK = 11;
CheatCenterScene.CB_ZALO = 12;
CheatCenterScene.CB_ZINGME = 13;

CheatCenterScene.CB_PORTAL = 14;
CheatCenterScene.CB_LOGINDEV = 15;

CheatCenterScene.CB_PAYMENT = 1;
CheatCenterScene.CB_PAYMENT_IAP = 2;
CheatCenterScene.CB_PAYMENT_DIRECT = 3;
CheatCenterScene.CB_REVIEW = 4;
CheatCenterScene.CB_ENABLE_LOG = 5;
CheatCenterScene.CB_FAKE_ID = 6;
CheatCenterScene.CB_FAKE_SMS = 7;
CheatCenterScene.CB_REALTIME_LOG = 8;
CheatCenterScene.CB_AUTO_CONSUME = 9;

CheatCenterScene.CB_CHECK_ENOUGH = 20;

CheatCenterScene.BTN_PLAYER = 100;

CheatCenterScene.TAG = 99997;

CheatCenterScene.instance = null;

var CardCheat = cc.Node.extend({

    ctor: function (id, p, type, cp) {
        this._super();
        this.cheatCenter = p;
        this.cardMode = type;
        this.curPlayer = cp;

        this.id = -1;
        this.setIdCard(id);
    },

    setIdCard: function (id) {
        if (id < 0 || id > 52) id = 52;
        this.id = id;

        if (this.cardBtn !== undefined && this.cardBtn != null)
            this.cardBtn.removeFromParent(true);

        this.cardBtn = new ccui.Button();
        this.cardBtn.setTouchEnabled(true);
        this.cardBtn.loadTextures(this.getResource(), this.getResource(), "");
        this.cardBtn.addTouchEventListener(this.touchEvent, this);

        var size = this.cardBtn.getContentSize();
        this.addChild(this.cardBtn);
    },

    touchEvent: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
            {

                break;
            }
            case ccui.Widget.TOUCH_MOVED:
            {

                break;
            }

            case ccui.Widget.TOUCH_ENDED:
            {
                if (this.cardMode == CARD_CHEAT_DECK) {
                    this.cheatCenter.onSelectCardDeck(this);
                }
                else {
                    this.cheatCenter.onSelectCardPlayer(this);
                }
                break;
            }
            case ccui.Widget.TOUCH_CANCELED:
            {

                break;
            }
            default:
            {

                break;
            }
        }
    },

    setCardSize: function (scale) {
        this.cardScale = scale;
        this.setScale(scale);
    },

    getCardWidth: function () {
        if (this.cardBtn !== undefined && this.cardBtn != null) {
            return this.cardBtn.getContentSize().width * this.cardScale;
        }

        return 0;
    },

    getCardHeight: function () {
        if (this.cardBtn !== undefined && this.cardBtn != null) {
            return this.cardBtn.getContentSize().height * this.cardScale;
        }

        return 0;
    },

    getResource: function () {
        return CheckLogic.getCardResource(this.id);
    }
});
