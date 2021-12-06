/**
 * Created by HOANG on 9/7/2015.
 */

var SocialNetworkListener = cc.Class.extend({

    onReceived: function(cmd, pkg) {
        switch (cmd)
        {
            case CMD.CMD_SOCIAL_FRIENDS_INFO:
            {
                var pk = new CmdReceivedFriendInfo(pkg);

                var tuannay = [];
                var tuannaykhongcodiem = [];
                var tuantruoc = [];
                var topServerFinal = [];

                var myInfo = {};

                var dom = JSON.parse(pk.json);
                for(var i=0;i<dom.length;i++)
                {
                    var topInfo = {};
                    topInfo["social"] = SocialManager.getInstance()._currentSocial;
                    topInfo["username"] = dom[i]["username"];
                    topInfo["displayname"] = dom[i]["displayName"];
                    topInfo["openID"] = dom[i]["openId"];
                    topInfo["activeWeek"] = ((dom[i]["activeWeek"] + 0) == pk.currentWeek);
                    topInfo["goldWin"] = dom[i]["goldWin"];
                    topInfo["uId"] = dom[i]["uId"];
                    topInfo["avatar"] = dom[i]["avatar"];

                    if(topInfo["activeWeek"])
                    {
                        if(topInfo["goldWin"] > 0 )
                        {
                            tuannay.push(topInfo);
                        }
                        else
                        {
                            tuannaykhongcodiem.push(topInfo);
                        }
                    }
                    else
                    {
                        tuantruoc.push(topInfo);
                    }
                }

                tuannay.sort(function(a,b){return a["goldWin"]< b["goldWin"]});
                tuantruoc.sort(function(a,b){return a["goldWin"]< b["goldWin"]});

                for(var i=0;i<tuannay.length;i++)
                {
                    tuannay[i]["rank"] = i+ 1;
                    if(tuannay[i]["openID"] == gamedata.userData.openID)
                    {
                        myInfo = tuannay[i];
                    }
                    topServerFinal.push(tuannay[i]);
                }
                for(var i=0;i<tuantruoc.length;i++)
                {
                    tuantruoc[i]["rank"] = i+ 1 + tuannay.length;
                    if(tuantruoc[i]["openID"] == gamedata.userData.openID)
                    {
                        myInfo = tuantruoc[i];
                    }
                    topServerFinal.push(tuantruoc[i]);

                }
                for(var i=0;i<tuannaykhongcodiem.length;i++)
                {
                    tuannaykhongcodiem[i]["rank"] = i+ 1 + tuannay.length + tuantruoc.length;
                    if(tuannaykhongcodiem[i]["openID"] == gamedata.userData.openID)
                    {
                        myInfo = tuannaykhongcodiem[i];
                    }
                    topServerFinal.push(tuannaykhongcodiem[i]);
                }
                myInfo["social"] = SocialManager.getInstance()._currentSocial;
                if(topServerFinal.length > 10)
                {
                    topServerFinal.splice(10,topServerFinal.length - 10);
                }
                if(myInfo["rank"] > 10)
                {
                    topServerFinal.push(myInfo);
                }

                socialMgr.topServer = topServerFinal;
                sceneMgr.updateCurrentGUI();

                pk.clean();
                break;
            }
            case CMD.CMD_SOCIAL_GETMONEY:
            {
                var pk = new CmdReceivedGetMoney(pkg);
                if (pk.getError() == 0)
                {
                    var mess = localized("GOLD_SUPPORT_ZALO");
                    mess = StringUtility.replaceAll(mess,"@gold",StringUtility.standartNumber(pk.goldSupport));
                    mess = StringUtility.replaceAll(mess,"@num",pk.numFriends+"");

                    Toast.makeToast(Toast.SHORT,mess);
                }
                else if(pk.getError() == 1)
                {
                    var mess = localized("GOLD_SUPPORT_ZALO_ERROR1");
                    mess = StringUtility.replaceAll(mess,"@gold",StringUtility.standartNumber(pk.goldLimit)+"");
                    Toast.makeToast(Toast.SHORT,mess);
                }
                else if(pk.getError() == 2)
                {
                    var mess = localized("GOLD_SUPPORT_ZALO_ERROR2");
                    mess = StringUtility.replaceAll(mess,"@gold",StringUtility.standartNumber(pk.maxGoldSupport)+"");
                    Toast.makeToast(Toast.SHORT,mess);

                }

                var today = new Date();
                var sDay = today.toISOString().substring(0, 10);
                cc.sys.localStorage.setItem("invite_success_day_" + gamedata.userData.uID,sDay);

                pk.clean();
                break;
            }
            case CMD.CMD_TANGVANG:
            {
                var pk = new CmdReceivedTangGold(pkg);
                if(pk.getError() == 0)
                {
                    var mess = localized("SHARE_RESULT");
                    mess = StringUtility.replaceAll(mess,"@money",""+pk.gold);
                    Toast.makeToast(Toast.SHORT,mess);
                }
                else
                {
                    var mess = localized("SHARE_RESULT_ERROR");
                    Toast.makeToast(Toast.SHORT,mess);
                }

                var today = new Date();
                var sDay = today.toISOString().substring(0, 10);
                cc.sys.localStorage.setItem("capture_success_day",sDay);

                pk.clean();
                break;
            }

        }
    }
});