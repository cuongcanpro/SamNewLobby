/**
 * Created by Hunter on 5/13/2016.
 */

var Config = function () {
};

var CheckLogic = function () {

};

/**
 * ===============================================================
 * =======================CONFIG COMMON GAME=======================
 * ===============================================================
 */
Config.ZALO_SECRET = "";                    // ZALO SECRET
Config.ZALO_APPID = "";                     // GAME ID IN ZALO

// config server
Config.SERVER_PRIVATE = "";   // IP SERVER PRIVATE
Config.PORT = 0;                          // PORT SERVER PRIVATE

Config.SERVER_LIVE = "";        // IP SERVER LIVE ( DEFAULT SERVICES OFF )
Config.PORT_LIVE = 0;                     // PORT SERVER LIVE

Config.SERVER_PRIVATE_WEB = "socket-dev.service.zingplay.com:10151";   // IP SERVER PRIVATE
Config.PORT_WEB = 10151;                          // PORT SERVER PRIVATE

Config.SERVER_LIVE_WEB = "maubinh-game.service.zingplay.com:843";
Config.PORT_LIVE_WEB = 843;                     // PORT SERVER LIVE

// config preload player
Config.PRELOAD_LAYER = false;                // ENABLE PRELOAD GUI AND SCENE

// config event,mini game and feature
Config.ENABLE_TUTORIAL = false;             // TUTORIAL POKER
Config.ENABLE_MINIGAME = false;             // MINI GAME ROULETE
Config.ENABLE_EVENT = false;                // EVENT GACHA
Config.ENABLE_LUCKY_CARD = true;           // EVENT LUCKY CARD
Config.ENABLE_ROLLDICE = false;             // EVENT ROLL DICE
Config.ENABLE_EGGBREAKER = true;           // EVENT EGG BREAKER
Config.ENABLE_POTBREAKER = false;           // EVENT POT BREAKER
Config.ENABLE_VIDEO_POKER = false;          // EVENT VIDEO POKER
Config.ENABLE_BLACK_LIST = false;           // CHONG DANH CAP
Config.ENABLE_IAP_REFUND = false;           // bat IAP moi , chong refund
Config.ENABLE_NEW_LOBBY = false;            // thay content Lobby moi cho review IOS
Config.ENABLE_EVENT_XMAS = false;           // bat IAP moi , chong refund
Config.ENABLE_IAP_LIMIT_TIME = false;       // bat IAP moi , han che thoi gian mua goi
Config.ENABLE_IAP_BONUS_TEMP = false;       // bat bonus iap temp
Config.ENABLE_FBAPI_FIX_UPDATE = false;     // tat chuc nang ban be khi update facebook api
Config.ENABLE_SMS_BUY_ZINGCARD = false;     // mua the zingcard bang sms viettel
Config.APP_VERSION_ANDROID_NEW_FACE = 10000;// version code cua phien ban game co facebook moi

Config.BONUS_ZINGCARD_IAP_PROMOTE = 0;      // bat promote zingcard + iap
Config.ENABLE_MAINTAIN_MOBILE_CARD = false; // bao tri kenh nap card

Config.ENABLE_INTERACT_PLAYER = false;      // FEATURE INTERACT PLAYER IN BOARD
Config.ENABLE_TAI_XIU = false;              // MINIGAME TAI XIU
Config.ENABLE_VINA_MOBILE = false ;          // Them nha mang VinaMobile
Config.ENABLE_EVENT_TET = false;            // EVENT Tet
Config.ENABLE_EVENT_SECRET_TOWER = false;            // EVENT Secret Tower
Config.ENABLE_MID_AUTUMN = false;            // EVENT Trung Thu

Config.DISABLE_FACEBOOK_VIRAL = false;      // disable facebook share viral
Config.DISABLE_IAP_PORTAL = false;          // disable IAP khi game chay trong Portal
Config.ENABLE_DECORATE_ITEM = false;
Config.ENABLE_MULTI_PORTAL = false;
Config.APP_VERSION_NEW_REVIEW = 100000;

Config.CHEAT_MAX_PLAYER = 4;                // NUM PLAYER IN GAME
Config.CHEAT_MAX_CARD = 13;                 // NUM CARD OF PLAYER

Config.CARD_CHEAT_SCALE_DECK = 0.525;       // SCALE CARD
Config.CARD_CHEAT_SCALE_PLAYER = 0.35;      // SCALE CARD PLAYER

Config.CARD_CHEAT_PLAYER_LINE = 2;          // NUM LINE OF DECK CARD CHEAT

// test update private
Config.MANIFEST_URL_LIVE = "";              // LINK STATIC UPDATE
Config.MANIFEST_URL_PRIVATE = "";           // DEFAULT LINK STATIC PRIVATE UPDATE

// version open JNI function
Config.APP_VERSION_JNI_AVAIABLE = 0;        // APPVERSION JNI FUNCTION AVAIABLE

// enable timeout when connect server
Config.TIMEOUT_CONNECT_SERVER = 0;

// default app version
Config.APP_VERSION_ANDROID_DEFAULT = 0;
Config.APP_VERSION_IOS_DEFAULT = 0;

Config.PLATFORM_MOBILE_DEFAULT = 3;
Config.WITHOUT_LOGIN = true;

Config.TEST_SMS_VINA = true;

Config.ENABLE_NEW_VIP = true;
Config.ENABLE_NEW_RANK = true;
Config.ENABLE_TESTING_NEW_RANK = false;
Config.ENABLE_NEW_OFFER = true;

Config.OLD_VERSION = 56;
Config.ZALO_PAY_ID = "15";
Config.GOOGLE_IAP_BASE64 = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjHtB2l+zG8vAMZAw9a8afdu577b57PhMbZYX7X30MXDIcjLvljVd9UGonr1+L0cN3nFkJQ8tkGIqstiK/4D6CB2jjGXVQVMru9+crlmU3P82Ca/LdY0kE6KFe67aom4+9R/toZn+3GlMrJQcCDZFUDSAcUPe/PsEQqRMX9wrvKDoBmmosRs0hkV/ptfC5VHw9t9vplcshORvnBKwYCahOlPSXzUOCTCHHSJ4kaKcMPvVke3ILau+PT3vLVNMeDS579mVH5/S7qunYbKdQeqzWCCU/dJmt+yBiuzUf3416yAG7v9sm+yU9MzyFuAwUoQDm4caENm4HwVnbH2EW5x4MwIDAQAB";

Config.URL_ZALOPAY = "vn.com.vng.zalopay";
Config.URL_ZALOPAY_SANBOX = "vn.com.vng.zalopay.sbmc";

Config.enableMinigame = function () {
    return Config.ENABLE_MINIGAME || Config.ENABLE_TAI_XIU;
}

/**
 * ===============================================================
 * =======================LOGIC COMMON GAME=======================
 * ===============================================================
 */
CheckLogic.checkQuickPlay = function () {
    try {
        return CommonLogic.checkQuickPlay();
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.checkQuickPlay " + e);
        return false;
    }
};

CheckLogic.checkCreateRoomMinGold = function () {
    try {
        return CommonLogic.checkCreateRoomMinGold();
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.checkCreateRoomMinGold " + e);
        return false;
    }
};

CheckLogic.checkCreateRoomMaxGold = function () {
    try {
        return CommonLogic.checkCreateRoomMaxGold();
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.checkCreateRoomMaxGold " + e);
        return false;
    }
};

CheckLogic.checkCaptureInBoard = function () {
    try {
        CommonLogic.checkCaptureInBoard();
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.checkCaptureInBoard " + e);
    }
}

CheckLogic.getMinGoldCreateRoom = function () {
    try {
        return CommonLogic.getMinGoldCreateRoom();
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.getMinGoldCreateRoom " + e);
        return 0;
    }
};

CheckLogic.getMaxGoldCreateRoom = function () {
    try {
        return CommonLogic.getMaxGoldCreateRoom();
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.getMaxGoldCreateRoom " + e);
        return 0;
    }
};

CheckLogic.checkNotifyNotEnoughGold = function (roomInfo) {

    try {
        return CommonLogic.checkNotifyNotEnoughGold(roomInfo);
    }
    catch (e) {
        cc.log("ERROR: CheckLogic.checkNotifyNotEnoughGold " + e);
    }
};

CheckLogic.sortRoomBetAsc = function (a, b) {
    try {
        return CommonLogic.sortRoomBetAsc(a, b);
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.sortRoomBetAsc " + e);
        return true;
    }
};

CheckLogic.sortRoomBetDesc = function (a, b) {
    try {
        return CommonLogic.sortRoomBetDesc(a, b);
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.sortRoomBetDesc " + e);
        return true;
    }
};

CheckLogic.onUpdateMoney = function (update) {

    try {
        CommonLogic.onUpdateMoney(update);
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.onUpdateMoney " + e);
    }
};

CheckLogic.checkInBoard = function () {
    try {
        return CommonLogic.checkInBoard();
    }
    catch (e) {
        cc.log("ERROR:  CommonLogic.checkInBoard " + e);
        return false;
    }
};

CheckLogic.showNotifyNetworkSlow = function (isSlow) {
    try {
        CommonLogic.showNotifyNetworkSlow(isSlow);
    }
    catch (e) {
        cc.log("ERROR:  CommonLogic.showNotifyNetworkSlow " + e);
    }
};

CheckLogic.getDialogClassName = function () {
    try {
        return CommonLogic.getDialogClassName();
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.getDialogClassName " + e);
        return Dialog.className;
    }
};

CheckLogic.updateDesignSolution = function (layer){
    try {
        CommonLogic.updateDesignSolution(layer);
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.updateDesignSolution " + e);
    }
};

CheckLogic.getCardResource = function (id) {
    try {
        return CommonLogic.getCardResource(id);
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.getCardResource " + e);
    }
    return "";
};

CheckLogic.updateNetworkState = function (nState) {
    try {
        CommonLogic.updateNetworkState(nState);
    }
    catch (e) {
        //cc.log("ERROR: CommonLogic.updateNetworkState " + e);
    }
};

CheckLogic.retryConnectInBoard = function (isRetry) {
    try {
        CommonLogic.retryConnectInBoard(isRetry);
    }
    catch (e) {
        //cc.log("ERROR: CommonLogic.retryConnectInBoard " + e);
    }
};

CheckLogic.preloadLayer = function () {
    try {
        CommonLogic.preloadLayer();
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.preloadLayer " + e);
    }
};

CheckLogic.getPosFromPlayer = function (id) {
    try {
        return CommonLogic.getPosFromPlayer(id);
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.getPosFromPlayer " + e);
    }
    return cc.p(0,0);
};

CheckLogic.getPlayerPosExcepted = function (id) {
    try {
        return CommonLogic.getPlayerPosExcepted(id);
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.getAllPosPlayer " + e);
    }
    return [];
};

CheckLogic.playerInGame = function (zingId) {
    try {
        return CommonLogic.playerInGame(zingId);
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.addBlackList " + e);
    }
};

CheckLogic.getPositionEvent = function () {
    try{
        return CommonLogic.getPositionEvent();
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.getCardResVideoPoker " + e);
    }
    return 94;
};

CheckLogic.convertCardCheat = function (arrCard) {
    try{
        return CommonLogic.convertCardCheat(arrCard);
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.convertCardCheat " + e);
        return arrCard;
    }
};

CheckLogic.getPathResourceGame = function () {
    try{
        return CommonLogic.getPathResourceGame();
    }
    catch (e) {
        cc.log("ERROR: CommonLogic.convertCardCheat " + e);
        return "res/Board/";
    }
};

CheckLogic.getPosWeeklyChallenge = function () {
    try {
        return CommonLogic.getPosWeeklyChallenge();
    } catch (e) {
        cc.log("ERROR: CommonLogic.getPosWeeklyChallenge " + e);
        return cc.p(0, 0);
    }
};


CheckLogic.checkZaloPay = function () {
    if (cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os == cc.sys.OS_ANDROID)
        return true;
    try {
        if (!fr.platformWrapper.isAndroid()) {
            var str = LocalizedString.to("ZALOPAY_ERROR_10");
            sceneMgr.showOKDialog(str);
            return false;
        }
        if (Config.ENABLE_CHEAT) {
            if (!fr.platformWrapper.isInstalledApp(Config.URL_ZALOPAY_SANBOX)) {
                var str = LocalizedString.to("ZALOPAY_ERROR_INSTALL");
                //sceneMgr.showOKDialog(str);
                Toast.makeToast(Toast.SHORT, str);
                return false;
            }
        } else {
            if (!fr.platformWrapper.isInstalledApp(Config.URL_ZALOPAY)) {
                var str = LocalizedString.to("ZALOPAY_ERROR_INSTALL");
                //sceneMgr.showOKDialog(str);
                Toast.makeToast(Toast.SHORT, str);
                return false;
            }
        }
        return true;
    } catch (e) {
        cc.log("ERROR: CommonLogic.checkInstallZaloPay " + e);
    }
};
