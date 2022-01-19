/**
 * Created by HunterPC on 9/7/2015.
 */

var FootballHandler = cc.Class.extend({
    ctor : function () {

    },

    onReceive : function (cmd, data)
    {
        switch (cmd) {
            case FootballHandler.EVENT_WORLD_CUP_UPDATE_LIST_MATCH:
            {
                var pk = new CmdReceiveUpdateListMatch(data);
                cc.log("EVENT_WORLD_CUP_UPDATE_LIST_MATCH " + JSON.stringify(pk));

                football.isRequestInfo = true;
                football.fData.listMatch = [];
                football.fData.listMatchDone = [];

                for(var i = 0 ; i < pk.listHistory.length ; i++)
                {
                    var hObj = pk.listHistory[i];
                    if(football.checkExistTeam(hObj))
                    {
                        if(hObj.status == FootballHandler.NOT_DONE)
                        {
                            football.fData.listMatch.push(hObj);
                        }
                        else
                        {
                            football.fData.listMatchDone.push(hObj);
                        }
                    }
                }
                pk.clean();

                if(football.inFootball && football.guiFootball)
                {
                    football.guiFootball.updateListBet();
                }

                //var gui = sceneMgr.getRunningScene().getMainLayer();
                //if(gui && gui instanceof LobbyScene)
                //{
                //    gui.updateMinigames();
                //}
                break;
            }
            case FootballHandler.EVENT_WORLD_CUP_UPDATE_HISTORY_BET:
            {
                var pk = new CmdReceiveHistoryBetToUser(data);
                cc.log("EVENT_WORLD_CUP_UPDATE_HISTORY_BET: " , JSON.stringify(pk));

                if(pk.isMyHistory) {
                    football.isRequestHistory = true;
                    football.fData.listGift = [];
                    football.fData.listHistory = pk.listHistory;

                    for (var i = 0; i < pk.listHistory.length; i++) {
                        var hObj = pk.listHistory[i];
                        if (hObj.totalMoneyGet > 0) {
                            football.fData.listGift.push(hObj);
                            if (!hObj.isReceive){
                                FootballHandler.WAIT_TO_RECEIVE_GIFT = true;
                            }
                        }
                    }

                    if (football.inFootball && football.guiFootball) {
                        football.guiFootball.updateHistory();
                        football.guiFootball.updateGift();
                        football.guiFootball.updateUserInfo();
                    }
                }
                else
                {
                    football.fData.listOtherHistory = [];
                    for(var i = 0 ; i < pk.listHistory.length ; i++)
                    {
                        var hObj = pk.listHistory[i];
                        if(football.checkExistTeamHistory(hObj))
                        {
                            football.fData.listOtherHistory.push(hObj);
                        }
                    }

                    if(football.inFootball && football.guiFootball)
                    {
                        football.guiFootball.pRank.openRankDetail();
                    }
                }

                pk.clean();
                break;
            }
            case FootballHandler.EVENT_WORLD_CUP_TOP_CAO_THU:
            {
                cc.log("EVENT_WORLD_CUP_TOP_CAO_THU");
                var pk = new CmdReceiveTopCaoThu(data);
                football.fData.listCaoThu = pk.listRank;
                if(football.inFootball && football.guiFootball)
                {
                    football.guiFootball.updateRank();
                }
                pk.clean();
                break;
            }
            case FootballHandler.EVENT_WORLD_CUP_TOP_XUI_XEO:
            {
                cc.log("EVENT_WORLD_CUP_TOP_XUI_XEO");
                var pk = new CmdReceiveTopXuiXeo(data);
                football.fData.listXuiXeo = pk.listRank;
                if(football.inFootball && football.guiFootball)
                {
                    football.guiFootball.updateRank();
                }
                pk.clean();
                break;
            }
            case FootballHandler.EVENT_WORLD_CUP_USER_INFO:
            {

                var pk = new CmdReceiveInfoEvent(data);
                cc.log("EVENT_WORLD_CUP_USER_INFO: ", JSON.stringify(pk));
                football.myData = pk.data;
                if(football.inFootball && football.guiFootball)
                {
                    football.guiFootball.updateMyData();
                }
                pk.clean();
                break;
            }
            case FootballHandler.EVENT_WORLD_CUP_UPDATE_HISTORY_BET_A_MATCH:
            {
                var pk = new CmdReceiveHistoryBetAMatchToUser(data);
                cc.log("EVENT_WORLD_CUP_UPDATE_HISTORY_BET_A_MATCH: ", JSON.stringify(pk));

                if(pk.listHistory[0].historyBetId == 0)
                {
                    football.fData.listHistory.splice(0,0,pk.listHistory[0]);
                }
                else
                {
                    for(var i = 0 ; i < football.fData.listHistory.length ; i++)
                    {
                        if(football.fData.listHistory[i].historyBetId == pk.listHistory[0].historyBetId)
                        {
                            football.fData.listHistory[i].isReceive = true;
                            break;
                        }
                    }

                    for(var i = 0 ; i < football.fData.listGift.length ; i++)
                    {
                        if(football.fData.listGift[i].historyBetId == pk.listHistory[0].historyBetId)
                        {
                            football.fData.listGift[i].isReceive = true;
                            break;
                        }
                    }
                }
                pk.clean();

                if(football.inFootball && football.guiFootball)
                {
                    football.guiFootball.updateHistory();
                    football.guiFootball.updateGift();
                    football.guiFootball.updateUserInfo();
                }
                break;
            }
            case FootballHandler.EVENT_WORLD_CUP_GET_MONEY:
            {

                var pk = new CmdReceiveGetBet(data);
                cc.log("EVENT_WORLD_CUP_GET_MONEY: ", JSON.stringify(pk));

                var error = pk.getError();
                if(error > 100)
                {
                    error -= 256;
                }
                if(error != 0)
                {
                    var s = "";
                    switch (error)
                    {
                        case -1:
                            s = LocalizedString.to("ERROR_NO_MONEY");
                            break;
                        case -2:
                            s = LocalizedString.to("ERROR_RECEIVED");
                            break;
                        case -3:
                            s = LocalizedString.to("ERROR_GAMEID");
                            break;
                        default :
                            s = LocalizedString.to("ERROR_RECEIVE_GIFT") + error;
                            break;
                    }

                    sceneMgr.showOKDialog(s);
                }

                pk.clean();
                break;
            }
            case FootballHandler.EVENT_WORLD_CUP_BET:
            {
                var pk = new CmdReceiveUserBet(data);
                cc.log("EVENT_WORLD_CUP_BET: ", JSON.stringify(pk));

                var error = pk.getError();
                if(error > 100)
                {
                    error -= 256;
                }

                if(error == 0)
                {
                    Toast.makeToast(Toast.LONG,LocalizedString.to("BET_SUCCESS"));
                }
                else
                {
                    switch (error)
                    {
                        case FootballHandler.ERROR_NOT_ENOUGH_MONEY:
                            s = LocalizedString.to("ERROR_NOT_ENOUGH_MONEY");
                            break;
                        case FootballHandler.ERROR_WARRING_MONEY_MIN:
                            s = LocalizedString.to("ERROR_WARRING_MONEY_MIN");
                            break;
                        case FootballHandler.ERROR_WARRING_MONEY_MAX:
                            s = LocalizedString.to("ERROR_WARRING_MONEY_MAX");
                            break;
                        case FootballHandler.ERROR_TIME_BET:
                            s = LocalizedString.to("ERROR_TIME_BET");
                            break;
                        case FootballHandler.ERROR_NOT_MATCH:
                            s = LocalizedString.to("ERROR_NO_MATCH");
                            break;
                        case FootballHandler.ERROR_LITMIT_BET:
                            s = LocalizedString.to("ERROR_LITMIT_BET");
                            break;
                        default:
                            s = "";
                            break;
                    }

                    if(s != "")
                    {
                        sceneMgr.showOKDialog(s);
                    }
                }

                pk.clean();
                break;
            }
            case FootballHandler.EVENT_WORLD_CUP_GET_CONFIG:
            {
                var pk = new CmdReceiveGetConfigWC(data);
                // cc.log("EVENT_WORLD_CUP_GET_CONFIG: ", JSON.stringify(pk));

                var config = JSON.parse(pk.config);

                football.isRequestConfig = true;
                football.fData.listTeam = {};
                if(config instanceof  Array)
                {
                    for(var i = 0 ; i < config.length ; i++)
                    {
                        var id = config[i]["idteams"];

                        var tObj = {};
                        tObj.name = config[i]["longname"];
                        tObj.shortName = config[i]["shortname"];
                        tObj.flag = StringUtility.replaceAll(pk.host,"@ID",encodeURI(tObj.shortName));

                        football.fData.listTeam["" + id] = tObj;
                    }
                }

                pk.clean();
                break;
            }
            case FootballHandler.EVENT_WORLD_CUP_LIST_MATCH:
            {
                var cmd = new CmdReceiveListMath(data);
                cmd.clean();

                cc.log("EVENT_WORLD_CUP_LIST_MATCH " + JSON.stringify(cmd));

                football.showListMatch(cmd.matchCount);
                break;
            }
        }

        //if(cmd > 12000 && cmd < 13000)
        //{
        //    cc.log("$ " + JSON.stringify(football.fData));
        //}
    }
});

FootballHandler.NOT_DONE = 1;
FootballHandler.DONE = 2;
FootballHandler.DELAY = 3;

FootballHandler.ERROR_NO_MONEY = -1; //ko co tien de nhan
FootballHandler.ERROR_RECEVIED = -2; // da nhan roi
FootballHandler.ERROR_GAMEID = -3; //sai param, ko co ban ghi duoc tra ve
FootballHandler.SUCCESS = 0; //thanh cong
FootballHandler.ERROR_PROCESS = -4; //co loi update du lieu sau khi select
FootballHandler.ERROR_NO_DATA = -5; // ko co du lieu
FootballHandler.ERROR_IN_GAME = -8;

FootballHandler.ERROR_NOT_ENOUGH_MONEY = -2;
FootballHandler.ERROR_WARRING_MONEY_MIN = -3;
FootballHandler.ERROR_WARRING_MONEY_MAX = -4;
FootballHandler.ERROR_TIME_BET = -5;
FootballHandler.ERROR_LITMIT_BET = -6;
FootballHandler.ERROR_NOT_MATCH = -7;

FootballHandler.EVENT_WORLD_CUP_INFO  = 12000;
FootballHandler.EVENT_WORLD_CUP_BET  = 12001;
FootballHandler.EVENT_WORLD_CUP_UPDATE_LIST_MATCH  = 12002;
FootballHandler.EVENT_WORLD_CUP_UPDATE_HISTORY_BET  = 12003;
FootballHandler.EVENT_WORLD_CUP_UPDATE_HISTORY_BET_A_MATCH  = 12004;
FootballHandler.EVENT_WORLD_CUP_USER_INFO  = 12005;
FootballHandler.EVENT_WORLD_CUP_GET_MONEY  = 12006;
FootballHandler.EVENT_WORLD_CUP_NOTIFY  = 12007;
FootballHandler.EVENT_WORLD_CUP_TOP_CAO_THU  = 12008;
FootballHandler.EVENT_WORLD_CUP_TOP_XUI_XEO  = 12009;
FootballHandler.EVENT_WORLD_CUP_HISTORY_TOP_USER  = 12010;
FootballHandler.EVENT_WORLD_CUP_REGISTER_GIFT  = 12011;
FootballHandler.EVENT_WORLD_CUP_REQUEST_RANK  = 12011;
FootballHandler.EVENT_WORLD_CUP_GET_CONFIG  = 12012;
FootballHandler.EVENT_WORLD_CUP_LIST_MATCH = 12013;

FootballHandler.WAIT_TO_RECEIVE_GIFT = false;