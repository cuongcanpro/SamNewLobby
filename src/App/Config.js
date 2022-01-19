/**
 * Created by Hunter on 5/25/2016.
 */
var Config = function () {
};
Config.ZALO_SECRET = "ldiEluvVsK3DDEtGE7BB";
Config.ZALO_APPID = "3554569838779270945";

Config.SERVER_PRIVATE = "120.138.72.33";
Config.PORT_PRIVATE = 10102;

Config.PORT_PRIVATE_WEB = 10134;
Config.SERVER_PRIVATE_WEB = "socket-dev.service.zingplay.com:10184";

//Config.SERVER_PRIVATE = "10.198.48.179";
//Config.PORT = 443;

Config.SERVER_LIVE = "118.102.3.24";
Config.PORT_LIVE = 443;

Config.SERVER_DEV = "127.0.0.1";
Config.PORT_DEV = 443;

Config.SERVER_LIVE_WEB = "samloc-game.service.zingplay.com:843";
Config.PORT_LIVE_WEB = 843;

Config.ENABLE_CHEAT = true;
Config.ENABLE_DEV = false;

Config.ENABLE_EVENT_SECRET_TOWER = false;

Config.WITHOUT_LOGIN = true;
Config.HARD_CODE_FONT_WEB = true;
Config.ENABLE_IAP_LIMIT_TIME = true;
Config.ENABLE_FBAPI_FIX_UPDATE = false;
Config.ENABLE_MAINTAIN_MOBILE_CARD = true;
Config.ENABLE_SMS_BUY_ZINGCARD = true;
Config.ENABLE_SPINE = true;

Config.DISABLE_IAP_PORTAL = false;
Config.ENABLE_MULTI_PORTAL = true;

Config.PRELOAD_LAYER = true;

Config.SECRETKEY = "Utn&6rdbn=g5Z&2G";
Config.CHEAT_MAX_PLAYER = 5;
Config.CHEAT_MAX_CARD = 10;
Config.CARD_CHEAT_SCALE_DECK = 0.25;
Config.CARD_CHEAT_SCALE_PLAYER = 0.15;
Config.CARD_CHEAT_PLAYER_LINE = 2;
Config.APP_VERSION_ANDROID_DEFAULT = 999;
Config.APP_VERSION_IOS_DEFAULT = 50;
Config.APP_VERSION_NEW_REVIEW = 42;

Config.DEFAULT_PLATFORM = Constant.PLATFORM_ANDROID;

Config.GOOGLE_IAP_BASE64 = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj4Y/nt+XCQcgW3WZADCohUMyB1XW9MuL2mwTtq5KasPMzalEqPN6CaoUvtWKSfh51CeZCS9jWzvVSGwaJXYys9FihVACDK+wL7lKn2wzItqzw5idN9d0e5ZuM3uYLO3qp/9lY9eH+TZzEj8KRVueJQv4iIP4ZLfzt8tSec0c1GaPVjgqfvnCvPFWqR0YeqWsgBLb+9LKk5xzSlJVj+dscFECUSTllBncm1mfH+IVRspvbgRU+Rh/NDz3gqOXcuomTXkcDxT9vlpMoMdWZrGBwZD8/Fh+6fbAaTc2RNnam2d4A3zic78d8KWdKTLd7AdpBVabrD/HPkNATbpFLRB2MQIDAQAB";
Config.ZALO_PAY_ID = "15";

Config.OLD_VERSION = 56;

Config.MANIFEST_URL_LIVE = "https://static.service.zingplay.com/sam/mobile_38";
Config.MANIFEST_URL_PRIVATE = "http://120.138.65.103/sources/apk/zpindo/sam";


Config.BONUS_ZINGCARD_IAP_PROMOTE = 0;      // bat promote zingcard + iap
Config.ENABLE_MAINTAIN_MOBILE_CARD = false; // bao tri kenh nap card

Config.ENABLE_EVENT_TET = false;
Config.ENABLE_JACKPOT = true;

Config.ENABLE_DECORATE_ITEM = false;

// config cheat
Config.ENABLE_CHEAT = true;                // ENABLE CHEAT CENTER IN GAME

Config.CHEAT_MAX_PLAYER = 4;                // NUM PLAYER IN GAME
Config.CHEAT_MAX_CARD = 13;                 // NUM CARD OF PLAYER

Config.CARD_CHEAT_SCALE_DECK = 0.25;       // SCALE CARD
Config.CARD_CHEAT_SCALE_PLAYER = 0.15;      // SCALE CARD PLAYER

Config.CARD_CHEAT_PLAYER_LINE = 2;          // NUM LINE OF DECK CARD CHEAT

// test update private
Config.MANIFEST_URL_LIVE = "";              // LINK STATIC UPDATE
Config.MANIFEST_URL_PRIVATE = "";           // DEFAULT LINK STATIC PRIVATE UPDATE

// version open JNI function
Config.APP_VERSION_JNI_AVAIABLE = 0;        // APPVERSION JNI FUNCTION AVAIABLE

// enable timeout when connect server
Config.TIMEOUT_CONNECT_SERVER = 0;

// new framework
Config.TEST_SMS_VINA = true;
Config.DISABLE_FOOTBALL = true;
Config.ENABLE_NEW_OFFER = true;

Config.ENABLE_SERVICE_ENABLE_PAYMENT = false;

Config.ENABLE_NEW_RANK = true;
Config.ENABLE_TESTING_NEW_RANK = false; // trang thai chi connect den server ranking ma khong xu ly cac goi tin rank

Config.ENABLE_QR_SMS_SYNTAX = false;

Config.URL_ZALOPAY = "vn.com.vng.zalopay";
Config.URL_ZALOPAY_SANBOX = "vn.com.vng.zalopay.sbmc";

var vec3 = cc.math.vec3;