/**
 * Created by HunterPC on 9/7/2015.
 */

var Football = cc.Class.extend({
    ctor : function () {

        this.fData = {};
        this.fData.listCaoThu = [];
        this.fData.listXuiXeo= [];
        this.fData.listMatch= [];
        this.fData.listMatchDone= [];
        this.fData.listGift= [];
        this.fData.listHistory = [];
        this.fData.listOtherHistory= [];
        this.fData.listTeam = {};

        this.myData = {};

        this.numListMatch = 0;

        this.guiFootball = null;
        this.inFootball = false;

        this.isRequestListMatch = false;
        this.isRequestHistory = false;
        this.isRequestConfig = false;
        this.isRequestInfo = false;
    },

    init : function () {
        this.getConfig();
    },
    
    resetData : function () {
        this.isRequestListMatch = false;
        this.isRequestHistory = false;
        this.isRequestInfo = false;
    },

    getListMatch : function () {
        if(this.isRequestListMatch) return;

        var cmdFB = new CmdSendListMatch();
        GameClient.getInstance().sendPacket(cmdFB);
        cmdFB.clean();
    },

    getConfig : function () {
        if(this.isRequestConfig) return;

        var cmdFB = new CmdSendGetConfigWC();
        GameClient.getInstance().sendPacket(cmdFB);
        cmdFB.clean();
    },
    
    showFootball : function () {
        //ToastFloat.makeToast(ToastFloat.LONG, "Chức năng đang bảo trì !");
        //return;
        this.guiFootball = sceneMgr.openScene(FootballScene.className);
        this.inFootball = true;

        if(!this.isRequestInfo)
        {
            cc.log("--->RequestInfo");
            var cmdInfo = new CmdSendGetWCInfo();
            GameClient.getInstance().sendPacket(cmdInfo);
            cmdInfo.clean();
        }

        if(!this.isRequestHistory)
        {
            cc.log("--->RequestHistory");
            var cmdFHistory = new CmdSendGetMyHistory();
            GameClient.getInstance().sendPacket(cmdFHistory);
            cmdFHistory.clean();
        }
    },

    showNotifyEuro : function () {
        if(this.checkNewDay())
        {
            sceneMgr.openGUI(FootballEuroUI.className,LobbyScene.GUI_EURO_EVENT,LobbyScene.GUI_EURO_EVENT,false);
        }
    },

    showListMatch : function (count) {
        this.isRequestListMatch = true;
        this.numListMatch = count;

        var gui = sceneMgr.getMainLayer();
        if(gui instanceof LobbyScene)
        {
            gui.updateMinigames();
        }
    },

    checkNewDay : function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
        var cDay = cc.sys.localStorage.getItem("current_day");

        return sDay != cDay;
    },

    saveCurrentDay : function () {
        var d = new Date();
        var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();

        cc.sys.localStorage.setItem("current_day",sDay);
    },

    checkExistTeam : function (match) {
        return !!(match.home in this.fData.listTeam && match.away in this.fData.listTeam);
    },

    checkExistTeamHistory : function (match) {
        return !!(match.homeId in this.fData.listTeam && match.awayId in this.fData.listTeam);
    },

    getTeam : function (teamId) {
        var sKey = "" + teamId;
        if(sKey in this.fData.listTeam)
        {
            var team = this.fData.listTeam[sKey];

            if(team.name.length > 12)
            {
                return team.shortName;
            }
            return team.name;
        }
        return sKey;
    },

    getFlag : function (teamId) {
        var sKey = "" + teamId;
        if(sKey in this.fData.listTeam)
        {
            var sRet = this.fData.listTeam[sKey].flag;
            if(sRet.indexOf("http://") < 0 && (sRet != ""))
            {
                sRet = "http://" + sRet;
            }

            return sRet;
        }
        return "";
    },

    getTeamData : function (teamId) {
        var sKey = "" + teamId;
        if(sKey in this.fData.listTeam)
        {
            return this.fData.listTeam[sKey];
        }
        return null;
    },

    getContent : function (num,type,name,rateMoney) {
        var numInt = parseInt(num);
        var convert = (num - numInt) * 100;
        var s = "";
        if (numInt == 0)
        {
            if (type == 1) // danh chap
            {
                if (convert < 1)
                {
                    s = LocalizedString.to("TYLECHAP0");
                }
                else if (convert <= 26)
                {
                    s = LocalizedString.to("TYLECHAP1/4TREN");

                }
                else if (convert <= 50)
                {
                    s = LocalizedString.to("TYLECHAP1/2TREN");
                }
                else if (convert <= 75)
                {
                    s = LocalizedString.to("TYLECHAP3/4TREN");
                }
            }
            else
            {
                if (convert < 1)
                {
                    s = LocalizedString.to("TYLECHAP0");
                }
                else if (convert <= 26)
                {
                    s = LocalizedString.to("TYLECHAP1/4DUOI");

                }
                else if (convert <= 50)
                {
                    s = LocalizedString.to("TYLECHAP1/2DUOI");
                }
                else if (convert <= 75)
                {
                    s = LocalizedString.to("TYLECHAP3/4DUOI");
                }
            }
        }
        else
        {
            if (type == 1) // danh chap
            {
                if (convert < 1)
                {
                    s = LocalizedString.to("TYLECHAP1TREN");
                }
                else if (convert <= 26)
                {
                    s = LocalizedString.to("TYLECHAP11/4TREN");

                }
                else if (convert <= 50)
                {
                    s = LocalizedString.to("TYLECHAP11/2TREN");
                }
                else if (convert <= 75)
                {
                    s = LocalizedString.to("TYLECHAP13/4TREN");
                }
            }
            else
            {
                if (convert < 1)
                {
                    s = LocalizedString.to("TYLECHAP1DUOI");
                }
                else if (convert <= 26)
                {
                    s = LocalizedString.to("TYLECHAP11/4DUOI");

                }
                else if (convert <= 50)
                {
                    s = LocalizedString.to("TYLECHAP11/2DUOI");
                }
                else if (convert <= 75)
                {
                    s = LocalizedString.to("TYLECHAP13/4DUOI");
                }
            }

            s = StringUtility.replaceAll(s, "@b+1", numInt + 1);
            s = StringUtility.replaceAll(s, "@b", numInt);

        }


        s = StringUtility.replaceAll(s, "@doi", name);

        s = s + LocalizedString.to("TYLETIEN");

        var money1, money2;
        if (rateMoney >= 0)
        {
            money1 = 100;
            money2 = Math.abs(rateMoney) * 100;

        }
        else
        {
            money2 = 100;
            money1 = Math.abs(rateMoney) * 100;
        }
        s = StringUtility.replaceAll(s, "@tien1", money1);
        s = StringUtility.replaceAll(s, "@tien2", money2);
        return s;
    },

    getContentSum : function (num,type,rateMoney) {
        var numInt = parseInt(num);
        var convert = (num - numInt) * 100;
        var s = "";

        if (type == 1) // danh tren
        {
            if (convert < 1)
            {
                s = LocalizedString.to("TYLETONG2TREN");
            }
            else if (convert <= 26)
            {
                s = LocalizedString.to("TYLETONG21/4TREN");

            }
            else if (convert <= 50)
            {
                s = LocalizedString.to("TYLETONG21/2TREN");
            }
            else if (convert <= 75)
            {
                s = LocalizedString.to("TYLETONG23/4TREN");
            }

            s = StringUtility.replaceAll(s, "@tai", LocalizedString.to("ABOVE"));
        }
        else
        {
            if (convert < 1)
            {
                s = LocalizedString.to("TYLETONG2DUOI");
            }
            else if (convert <= 26)
            {
                s = LocalizedString.to("TYLETONG21/4DUOI");

            }
            else if (convert <= 50)
            {
                s = LocalizedString.to("TYLETONG21/2DUOI");
            }
            else if (convert <= 75)
            {
                s = LocalizedString.to("TYLETONG23/4DUOI");
            }
            s = StringUtility.replaceAll(s, "@tai", LocalizedString.to("BELLOW"));
        }

        s = StringUtility.replaceAll(s, "@b+1", numInt + 1);
        s = StringUtility.replaceAll(s, "@b", numInt);


        s = s + LocalizedString.to("TYLETIEN");

        var money1, money2;
        if (rateMoney >= 0)
        {
            money1 = 100;
            money2 = Math.abs(rateMoney) * 100;

        }
        else
        {
            money2 = 100;
            money1 = Math.abs(rateMoney) * 100;
        }
        s = StringUtility.replaceAll(s, "@tien1", money1);
        s = StringUtility.replaceAll(s, "@tien2", money2);

        return s;
    },

    getFraction : function (num) {
        var numInt = parseInt(Math.abs(num));
        var convert = (Math.abs(num)-numInt) * 100;

        var s = "" + numInt;
        if (num < 0)
            s = "-" + s;
        if (convert < 1)
        {
            return s;
        }
        else
        {
            if (numInt == 0)
            {
                s = "";
                if (num < 0)
                    s = "-";
            }


            if (convert <= 26)
            {
                return s + " 1/4";

            }
            else if (convert <= 50)
            {
                return s + " 1/2";
            }
            else if (convert <= 75)
            {
                return s + " 3/4";
            }
        }
    },

    getDouble : function (value) {
        var numInt = Math.abs(parseInt(value));
        var convert = (Math.abs(value) - numInt) * 100;

        var s = "" + numInt;
        if (value < 0)
            s = "-" + s;
        if (convert < 10)
        {
            s = s + ".0" + parseInt(convert);
        }
        else
        {
            s = s + "." + parseInt(convert);
        }
        return s;
    },

    getDoubleMoney : function (money, rateMoney) {
        return money*1.0 + money*Math.abs(rateMoney);
    },

    getDate : function (time) {
        var d = new Date(time);
        return this.getZeroNumber(d.getDate()) + "/" + this.getZeroNumber((d.getMonth() + 1));
    },

    getClock : function (time) {
        var d = new Date(time);
        return this.getZeroNumber(d.getHours()) + ":" + this.getZeroNumber(d.getMinutes());
    },

    getClockAndDate : function (time) {
        return this.getDate() + " " + this.getClock();
    },

    getZeroNumber : function (number) {
        return ((number > 9 ) ? number : "0" + number);
    }
});

Football.RESULT_RATE    = 1;
Football.RESULT_SUM     = 2;
Football.RESULT         = 3;

Football.MATCH_STATUS_NOT_DONE  = 1;
Football.MATCH_STATUS_DONE      = 2;
Football.MATCH_STATUS_DELAY     = 3;

Football._instance = null;
Football.getInstance = function(){
    if(!Football._instance)
    {
        Football._instance = new Football();
    }
    return Football._instance;
};
var football = Football.getInstance();