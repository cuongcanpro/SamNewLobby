/**
 * Created by Hunter on 5/25/2016.
 */
var Config = function () {
};

Config.ZALO_SECRET = "sTV0sKYRrF72XeALUo1v";
Config.ZALO_APPID = "783468779544570951";

Config.SERVER_PRIVATE = "120.138.72.33";
Config.PORT_PRIVATE = 10142;

Config.SERVER_LIVE = "118.102.3.30";
Config.PORT_LIVE = 443;

Config.SERVER_PRIVATE_WEB = "socket-dev.service.zingplay.com:10169";
Config.PORT_WEB = 10022;

Config.SERVER_PRIVATE_WEB2 = "118.102.3.28";
Config.PORT_WEB2 = 10025;

Config.SERVER_LIVE_WEB = "tala-2-game.service.zingplay.com:843";
Config.PORT_LIVE_WEB = 843;

Config.SERVER_LIVE_WEB2 = "tala-3-game.service.zingplay.com:843";
Config.PORT_LIVE_WEB2 = 80;

Config.SERVER_DEV = "127.0.0.1";
Config.PORT_DEV = 442;

Config.ENABLE_CHEAT = true;
Config.DEV_LOCAL = false;

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

Config.SECRETKEY = "dTs*2Q6Rr6^atRz2";
Config.CHEAT_MAX_PLAYER = 5;
Config.CHEAT_MAX_CARD = 10;
Config.CARD_CHEAT_SCALE_DECK = 0.25;
Config.CARD_CHEAT_SCALE_PLAYER = 0.15;
Config.CARD_CHEAT_PLAYER_LINE = 2;
Config.APP_VERSION_ANDROID_DEFAULT = 999;
Config.APP_VERSION_IOS_DEFAULT = 50;
Config.APP_VERSION_NEW_REVIEW = 42;

Config.DEFAULT_PLATFORM = Constant.PLATFORM_ANDROID;

Config.GOOGLE_IAP_BASE64 = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwJemwKEbqAtLDuSjnyQ0JwE1JgHG54fQgrScRS7a0chW+SGQdD4FUGxZvPVWYMW8MAFx43AzpKLCv2Tcy+6ZdlKCBUYuDV+YvXnEZv4SGj8rdZHx3vc2KjQOYtpB0Q7/fSMkBFU2eu3Mox0K5PgJVv2gvZ8U2wvIfrTr3j6qhk9wRfJUZ/ZtOKBBKZQPDu8oNkj7ZGw/ZT4rlDlQxLpYsYsjGKVm1gQWdSRO7n0iCjMQD2GLLKx/hb2KtgmpinwomsPDo+Dcq/xz8xRSww4zu7u0LGKqcEXy5awTLGsRR6Amo1HHcD0207pOk2yB0HkCu4stfuwdqXaxEuzAXf9rjwIDAQAB";Config.KEY_LAST_ERROR = "key_last_error";       // key ghi lai nguyen nhan lan cuoi khong vao duoc gui game
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
Config.ENABLE_PAYMENT_SERVICE = false;
Config.URL_ZALOPAY = "vn.com.vng.zalopay";
Config.URL_ZALOPAY_SANBOX = "vn.com.vng.zalopay.sbmc";
Config.ZALOPAY_DEEP_LINK = "zalopay://launch/app/731?view=top_up&amount=@amount&redirect_url=zps://@package";
var vec3 = cc.math.vec3;