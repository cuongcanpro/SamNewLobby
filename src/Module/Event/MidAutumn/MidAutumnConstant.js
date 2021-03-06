// cmd id
var MD_CMD_EVENT_NOTIFY = 15801;
var MD_CMD_NOTIFY_ACTION = 15802;
var MD_CMD_OPEN_EVENT = 15803;
var MD_CMD_ACCUMULATE_INFO = 15804;
var MD_CMD_ROLL_EVENT = 15807;
var MD_CMD_ROLL_CHOOSE_DIRECT = 15806;
var MD_CMD_CHANGE_STAGE = 15807;
var MD_CMD_CHANGE_AWARD = 15808;
var MD_CMD_USER_CHANGE_AWARD_SUCCESS = 15809;
var MD_CMD_EVENT_TICKET_FROM_GOLD = 15811;
var MD_CMD_EVENT_BUY_TICKET_BY_G = 15830;
var MD_CMD_EVENT_SHOP_BONUS = 15806;
var MD_CMD_GET_REGISTER_INFORMATION = 15819;
var MD_CMD_GET_ROLL_HISTORY = 15823;
var MD_CMD_GET_GIFT_HISTORY = 15824;
var MD_CMD_CHANGE_PIECE= 15825;
var MD_CMD_EVENT_END = 15818;

var MD_CMD_GET_LAMP_INFO = 15820;
var MD_CMD_CHANGE_LAMP = 15821;
var MD_CMD_USE_LAMP = 15826;
var MD_CMD_SEND_LAMP = 15822;
var MD_CMD_IN_GAME_LAMP = 15828;

var MD_CMD_CHEAT_G_SERVER = 15815;
var MD_CMD_CHEAT_COIN_ACCUMULATE = 15814;
var MD_CMD_CHEAT_RESET = 15817;
var MD_CMD_CHEAT_COIN_FREE_DAY = 15813;
var MD_CMD_CHEAT_ITEM = 15812;
var MD_CMD_CHEAT_NUM_ROLL = 15829;

// var MD_CMD_EVENT_NOTIFY = 15851;
// var MD_CMD_NOTIFY_ACTION = 15852;
// var MD_CMD_OPEN_EVENT = 15853;
// var MD_CMD_ACCUMULATE_INFO = 15854;
// var MD_CMD_EVENT_SHOP_BONUS = 15856;
// var MD_CMD_ROLL_EVENT = 15857;
// var MD_CMD_CHANGE_AWARD = 15858;
// var MD_CMD_USER_CHANGE_AWARD_SUCCESS = 15859;
// var MD_CMD_KEYCOIN_BONUS = 15861;
// var MD_CMD_CHEAT_ITEM = 15862;
// var MD_CMD_CHEAT_COIN_FREE_DAY = 15863;
// var MD_CMD_CHEAT_COIN_ACCUMULATE = 15864;
// var MD_CMD_CHEAT_G_SERVER = 15865;
// var MD_CMD_CHEAT_BREAK_DIRECT = 15866;
// var MD_CMD_CHEAT_RESET = 15867;
// var MD_CMD_NOT_IN_EVENT = 15868;

// var
var MD_WEEK_START = 1;
var MD_WEEK_END = 1;

var MD_ITEM_STORED = 999;
var MD_ITEM_OUT_GAME = 999999;
var MD_ITEM_LAMP = 9999;

var MD_MAX_ITEM_CONVERT_GIFT = 3;

var MD_NUM_ROLL_TYPE = 3;  // 1 - 10 - 100
var MD_MAX_FRIEND = 5;
var MD_ROW = 7;
var MD_COL = 7;
var MD_NUM_LAMP_CHANGE = 3;
var MD_NUM_PIECE = 4;

var MD_MOVE_DIRECT = [
    [-1,0],[0,1],[1,0],[0,-1]
];// UP - RIGHT - DOWN - LEFT

var MD_UP = 0;
var MD_DOWN = 2;
var MD_RIGHT = 1;
var MD_LEFT = 3;

var MD_SPECIAL_POINT = [0, 3];

var MD_MOVE_SPLIT_VERTICAL = 3; // nhung hang lon hon hang 3 thi chi duoc di qua trai
var MD_MOVE_SPLIT_HORIZONTAL = 3; // nhung cot o ben trai thi chi di thang, nhung cot o ben phai thi chi di xuong

var MD_PIECE_IMAGE_SIZE = 115;
var MD_PIECE_MAX_ROW = 5;

var MD_CELL_ITEM = 2;
var MD_CELL_GOLD = 0;
var MD_CELL_LAMP = 1;
var MD_CELL_EMPTY = -1;

var MD_CELL_GOLD_SCALE = 0.4;

var MD_CELL_EFFECT_COUNT_DOWN = 3;

var MD_STONE_MAX_CHANGE = 5;

// character effect
var MD_TIME_MOVE_IN_CELL = 0.25;
var MD_CHARACTER_EXTREME_RUN = 2000;
var MD_CHARACTER_NUMBER_EXTREME_RUN = 1;
var MD_CHARACTER_PATH_EXTREME_RUN = 20;
var MD_CHARACTER_SPEED_EXTREME_RUN = 0.25;

var MD_BUBBLE_TIME_EXTREME_RUN = 10;
var MD_CHARACTER_SHADOW_RATIO = 15;

var MD_MAX_TIME_BUBBLE_IN_MAP = 5;
var MD_TIME_BUBBLE_RESULT_ROLL = 10;

var MD_TIME_CHANGE_MAP = 2;
var MD_BUBBLE_CHANGE_MAP = 50;
var MD_BUBBLE_RESULT_ROLL = 100;

// roll dice
var MD_ROLL_EXTRA_LIMIT = 10;
var MD_GOLD_GIFT_EXTRA_ID = 88;
var MD_ROLL_DICE_TIME = 10;
var MD_UP_DICE_MOVE = 0.5;
var MD_PLATE_DICE_CHANGE_DIRECT = 0.05;
var MD_PLATE_DICE_MOVE = 0.025;

// GUI
var MD_GUI_BTN_CLOSE = 0;
var MD_GUI_NOTIFY_BTN_JOIN = 1;

var MD_MAP_ITEM_ZODER = 9999;
var MD_MAP_MOVE_ZODER = 999;

// button main scene
var MD_SCENE_BTN_STAGE_UP     = 10001;
var MD_SCENE_BTN_STAGE        = 10000;

var MD_SCENE_BTN_ROLL_ONCE        = 100;
var MD_SCENE_BTN_ROLL_TEN         = 101;
var MD_SCENE_BTN_ROLL_HUNDRED     = 102;

var MD_SCENE_CHEAT_G_SERVER       = 501;
var MD_SCENE_CHEAT_RESET_SERVER       = 502;
var MD_SCENE_CHEAT_ITEM = 503;
var MD_SCENE_CHEAT_SHOW_FULLTIME = 504;
var MD_SCENE_CHEAT_EXP_COIN = 505;
var MD_SCENE_CHEAT_COIN_FREE = 506;
var MD_SCENE_CHEAT_NUM_ROLL = 507;

var MD_SCENE_CHEAT_PIE_1 = 531;
var MD_SCENE_CHEAT_PIE_2 = 532;
var MD_SCENE_CHEAT_PIE_3 = 533;
var MD_SCENE_CHEAT_PIE_4 = 534;

var MD_SCENE_BTN_STAGE_DOWN       = 9999;

var MD_SCENE_BTN_HISTORY          = 11001;
var MD_SCENE_BTN_CLOSE          = 11002;
var MD_SCENE_BTN_HELP          = 11003;
var MD_SCENE_BTN_CHEAT          = 11004;
var MD_SCENE_BTN_SOUND          = 11005;
var MD_SCENE_BTN_NEWS          = 11006;
var MD_SCENE_BTN_SHOP          = 11007;
var MD_SCENE_BTN_PLAY          = 11008;
var MD_SCENE_BTN_OK          = 11009;
var MD_SCENE_BTN_LAMP         = 11012;
var MD_SCENE_BTN_OPEN_EVENT          = 11035;

var MD_SCENE_BTN_FANPAGE         = 11200;

var MD_SCENE_BTN_CHANGE     = 150;

var MD_PANEL_CHANGE = 40001;
var MD_PANEL_DESELECT = 40002;
var MD_PANEL_SELECT_ALL = 40003;

var MD_SCENE_TAB_HISTORY      = 1;
var MD_SCENE_TAB_GIFT      = 2;
var MD_SCENE_TAB_INFORMATION      = 3;
var MD_SCENE_TAB_CHANGE      = 4;
var MD_SCENE_TAB_LAMP      = 5;
var MD_SCENE_BTN_CHANGE_LAMP = 6;

var MD_HELP_NUM_PAGE = 6;
var MD_SHOW_LIST_ITEM_FULL = 1;
var MD_SHOW_LIST_ITEM_MINI = 0;

MD_ACCUMULATE_TIME_PROGRESS = 1;
MD_ACCUMULATE_TIME_MOVE = 0.5;
MD_ACCUMULATE_TIME_DELTA = 0.05;

var MD_TF_NAME = 1;
var MD_TF_ADDRESS = 2;
var MD_TF_PHONE = 3;
var MD_TF_CMND = 4;
var MD_TF_EMAIL = 5;

var MD_LAMP_IN_GAME_TAG = 100;

var MD_SCENE_DELAY_LOADING = 500;
var MD_CONFIG_TYPE_LAMP = [0, 9, 13];

// class
var MD_SCENE_CLASS = "MidAutumnScene";
var MD_RESULT_GUI_CLASS = "MidAutumnOpenResultGUI";
var MD_OPEN_GIFT_GUI_CLASS = "MidAutumnOpenGiftGUI";
var MD_REGISTER_GUI_CLASS = "MidAutumnRegisterInformationGUI";
var MD_ACCUMULATE_GUI_CLASS = "MidAutumnAccumulateGUI";
var MD_HELP_GUI_CLASS = "MidAutumnHelpGUI";
var MD_HISTORY_GUI_CLASS = "MidAutumnHistoryGUI";
var MD_CHANGE_LAMP_GUI_CLASS = "MidAutumnChangeLampGUI";
var MD_PIECE_GUI_CLASS = "MidAutumnPieceConvertGUI";
var MD_NOTIFY_CLASS = "MidAutumnEventNotifyGUI";
var MD_CHANGE_ITEM_CLASS = "MidAutumnPanelChangeItem";

var MD_NOTIFY_PROMOTE_G_CLASS = "MidAutumnNapGNotifyGUI";
var MD_NOTIFY_BONUS_G_CLASS = "MidAutumnBonusGNotifyPanel";
var MD_NOTIFY_BONUS_TICKET_CLASS = "MidAutumnBonusTicketDialog";
var MD_HAMMER_EMPTY_CLASS = "MidAutumnHammerEmptyDialog";

var MD_HAMMER_ROLL_EMPTY = 0;
var MD_HAMMER_NOTIFY_EMPTY = 1;
var MD_HAMMER_TICKET = 2;

var MD_NOTIFY_ORDER = 206;
var MD_NOTIFY_PROMOTE_G_ORDER = 206;
var MD_PIECE_GUI_ORDER = 207;
var MD_RESULT_GUI_ORDER = 201;
var MD_OPEN_GIFT_GUI_ORDER = 202;
var MD_REGISTER_GUI_ORDER = 205;
var MD_ACCUMULATE_GUI_ORDER = 200;
var MD_HELP_GUI_ORDER = 203;
var MD_HISTORY_GUI_ORDER = 203;
var MD_DIALOG_ORDER = 208;
var MD_NOTIFY_BONUS_G_ORDER = 209;

// Notify EventMgr
var MD_HAMMER_EMPTY_COUNT_DOWN_SHOW = 2;

var MD_BUBBLE_EFFECT_COUNT_DOWN = 5;

var MD_NOTIFY_BONUS_G_COUNT_DOWN = 300000;    // 5p

// image
var MD_IMAGE_CELL_MOVE = "res/Event/MidAutumn/MidAutumnUI/cell_move.png";
var MD_IMAGE_CHARACTER_SHADOW = "res/Event/MidAutumn/MidAutumnUI/mascotZP.png";
var MD_IMAGE_CHARACTER_SHADOW_LIGHT = "res/Event/MidAutumn/MidAutumnUI/shadow_mascot.png";
var MD_IMAGE_BUBBLE = "res/Event/MidAutumn/MidAutumnUI/bubble.png";
var MD_IMAGE_CELL_NORMAL = "res/Event/MidAutumn/MidAutumnUI/cell_normal.png";
var MD_IMAGE_STONE_REMAIN = "res/Event/MidAutumn/MidAutumnUI/stone_remain_move.png";
var MD_IMAGE_STONE = "res/Event/MidAutumn/MidAutumnUI/cell_stone.png";
var MD_IMAGE_BG_GIFT = "res/Event/MidAutumn/MidAutumnUI/cell_gift.png";
var MD_IMAGE_CELL_NORMAL_LEVEL = "res/Event/MidAutumn/MidAutumnUI/cell_normal";
var MD_IMAGE_BG_GIFT_LEVEL = "res/Event/MidAutumn/MidAutumnUI/cell_gift";
var MD_IMAGE_STONE_LEVEL = "res/Event/MidAutumn/MidAutumnUI/stone";
var MD_IMAGE_BUTTON_IN_GAME = "res/Event/MidAutumn/MidAutumnUI/btnEventInGame.png";

// Type Item
var MD_ITEM_IN_MAIN_SCENE = 0;
var MD_ITEM_IN_CHANGE_SCENE = 1;