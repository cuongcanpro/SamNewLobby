/**
 * Created by HunterPC on 9/9/2015.
 */

var FBetRate = BaseLayer.extend({

    ctor : function () {
        this.matchId = 0;
        this.betValue = 0;
        this.money = 0;
        this.match = {};

        this.lbTeam = null;
        this.flagTeam = null;
        this.lbBet = null;

        this.lbTeam0 = null;
        this.flagTeam0 = null;

        this.lbTeam1 = null;
        this.flagTeam1 = null;

        this.txGoldBet = null;
        this.lbGoldGet = null;
        this.lbBetMin = null;
        this.lbBetMax = null;
        this.lbBetInfo = null;

        this.actionBetType = null;

        this._super(FBetRate.className);
        this.initWithBinaryFile("FBetRate.json");
    },

    initGUI : function () {

        this.setBackEnable(true);

        var bg = this.getControl("bg");
        this._bg = bg;

        this.customizeButton("btnOK",0,bg);
        this.customizeButton("btnCancel",1,bg);

        this.lbBet = this.getControl("lbBet",bg);

        this.lbTeam = this.getControl("nameTeam","bg");
        this.flagTeam = this.replaceFlagTeam(this.getControl("flagTeam",bg),bg);
        this.flagTeam.setPositionY(this.lbTeam.getPositionY());

        this.lbTeam0 = this.getControl("nameTeam0","bg");
        this.flagTeam0 = this.replaceFlagTeam(this.getControl("flagTeam0",bg),bg);
        this.flagTeam0.setPositionY(this.lbTeam0.getPositionY());

        this.lbTeam1 = this.getControl("nameTeam1","bg");
        this.flagTeam1 = this.replaceFlagTeam(this.getControl("flagTeam1",bg),bg);
        this.flagTeam1.setPositionY(this.lbTeam1.getPositionY());

        var txGold = this.getControl("txGoldBet",bg);
        if (cc.sys.isNative) {
            txGold.setVisible(false);

            this.txGoldBet = BaseLayer.createEditBox(txGold);
            this.txGoldBet.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
            this.txGoldBet.setDelegate(this);
            bg.addChild(this.txGoldBet);
        }
        else {
            this.txGoldBet = txGold;
            this.txGoldBet.addEventListener(this.editBoxEvent, this);
        }
        this.txGoldBet.setPlaceHolder(LocalizedString.to("INPUT_BET"));

        this.lbGoldGet = this.getControl("txGoldGet","bg");
        this.lbBetMin = this.getControl("lbBetMin","bg");
        this.lbBetMax = this.getControl("lbBetMax","bg");
        this.lbBetInfo = this.getControl("lbBetInfo","bg");

        this.lbBetMin.setString(LocalizedString.to("MIN") + " : " + StringUtility.pointNumber(football.miniGame.minBet));
        this.lbBetMax.setString(LocalizedString.to("MAX") + " : " + StringUtility.pointNumber(football.miniGame.maxBet));
    },

    editBoxEvent : function (textField, type) {
        if(type == ccui.TextField.EVENT_INSERT_TEXT)
        {
            this.checkingNumber(textField);
        }

        // if(textField.getTag() == FBetScore.TX_GOLD_BET)
        // {
            switch (type) {
                case ccui.TextField.EVENT_ATTACH_WITH_IME:
                {
                    this.txGoldBet.setString("");
                    this.lbGoldGet.setString("");
                    this.money = 0;
                    break;
                }
                case ccui.TextField.EVENT_DETACH_WITH_IME:
                {
                    this.checkMoney();
                    break;
                }
            }
        // }

    },
    
    onEnterFinish : function () {
        this.enableFog();
        this.setShowHideAnimate(this._bg,true);
    },

    showBetRate : function (mId, bValue) {
        this.matchId = mId;
        this.betValue = bValue;
        this.actionBetType = Football.RESULT_RATE;

        this.showBetRateDone();
    },

    showBetSum : function (mId, bValue) {
        this.matchId = mId;
        this.betValue = bValue;
        this.actionBetType = Football.RESULT_SUM;

        this.showBetSumDone();
    },
    
    showBetRateDone : function () {
        this.money = 0;

        for(var i = 0; i< football.fData.listMatch.length; i++)
        {

            if(football.fData.listMatch[i].Id == this.matchId)
            {
                this.match = football.fData.listMatch[i];
                break;
            }
        }

        var isHomeBet = (this.betValue == 1);
        var sTeamHome = football.getTeam(this.match.home);
        var sTeamAway = football.getTeam(this.match.away);
        var sBet = "";

        this.lbTeam0.setString(sTeamHome);
        this.lbTeam1.setString(sTeamAway);
        this.flagTeam0.setDefaultImage();
        this.flagTeam1.setDefaultImage();
        this.flagTeam.setDefaultImage();
        this.flagTeam0.asyncExecuteWithUrl("Flag" + md5(sTeamHome),football.getFlag(this.match.home));
        this.flagTeam1.asyncExecuteWithUrl("Flag" + md5(sTeamAway),football.getFlag(this.match.away));
        if(isHomeBet)
        {
            sBet = football.getDouble(this.match.rateWinLostMoneyHome);
            this.lbTeam.setString(sTeamHome);
            this.flagTeam.asyncExecuteWithUrl("Flag" + md5(sTeamHome),football.getFlag(this.match.home));
        }
        else
        {
            sBet = football.getDouble(this.match.rateWinLostMoneyAway);
            this.lbTeam.setString(sTeamAway);
            this.flagTeam.asyncExecuteWithUrl("Flag" +  md5(sTeamAway),football.getFlag(this.match.away));
        }

        var str = "";
        var sBetTitle = "";
        if(this.match.rateWinLostHome == 0 && this.match.rateWinLostAway == 0)
        {
            if(isHomeBet)
                str = football.getContent(this.match.rateWinLostHome,1,sTeamHome,this.match.rateWinLostMoneyHome);
            else
                str = football.getContent(this.match.rateWinLostHome,2,sTeamAway,this.match.rateWinLostMoneyAway);

            sBetTitle = football.getFraction(this.match.rateWinLostHome);
        }
        else if(this.match.rateWinLostHome > 0)
        {
            if(isHomeBet)
                str = football.getContent(this.match.rateWinLostHome,1,sTeamHome,this.match.rateWinLostMoneyHome);
            else
                str = football.getContent(this.match.rateWinLostHome,2,sTeamAway,this.match.rateWinLostMoneyAway);

            sBetTitle =  (isHomeBet?"-":"") + football.getFraction(this.match.rateWinLostHome);
        }
        else
        {
            if(isHomeBet)
                str = football.getContent(this.match.rateWinLostAway,2,sTeamHome,this.match.rateWinLostMoneyHome);
            else
                str = football.getContent(this.match.rateWinLostAway,1,sTeamAway,this.match.rateWinLostMoneyAway);

            sBetTitle = (isHomeBet?"":"-") + football.getFraction(this.match.rateWinLostAway);
        }

        this.lbBet.setString(sBetTitle + "   " + sBet);
        this.setLabelText(str,this.lbBetInfo);
        //this.lbBetInfo.setString(str);

        this.txGoldBet.setString("");
        this.lbGoldGet.setString("");
    },

    showBetSumDone : function () {
        this.flagTeam.setVisible(false);

        this.money = 0;
        this.match = {};

        for(var i = 0; i< football.fData.listMatch.length; i++)
        {

            if(football.fData.listMatch[i].Id == this.matchId)
            {
                this.match = football.fData.listMatch[i];
                break;
            }
        }

        var isHomeBet = (this.betValue == 1);
        var sTeamHome = football.getTeam(this.match.home);
        var sTeamAway = football.getTeam(this.match.away);

        this.lbTeam0.setString(sTeamHome);
        this.lbTeam1.setString(sTeamAway);
        this.flagTeam0.setDefaultImage();
        this.flagTeam1.setDefaultImage();
        this.flagTeam0.asyncExecuteWithUrl("Flag" +  md5(sTeamHome),football.getFlag(this.match.home));
        this.flagTeam1.asyncExecuteWithUrl("Flag" + md5(sTeamAway),football.getFlag(this.match.away));
        var sBet = "";
        var sInfo = "";
        if(isHomeBet)
        {
            this.lbTeam.setString(LocalizedString.to("TAI"));

            sInfo = football.getContentSum(this.match.rateTaiXiu , 1 , this.match.rateMoneyTrenTaiXiu);
            sBet = LocalizedString.to("ABOVE") + " " + football.getFraction(this.match.rateTaiXiu) + "    " + football.getDouble(this.match.rateMoneyTrenTaiXiu);
        }
        else
        {
            this.lbTeam.setString(LocalizedString.to("XIU"));

            sInfo = football.getContentSum(this.match.rateTaiXiu,2,this.match.rateMoneyDuoiTaiXiu);
            sBet = LocalizedString.to("BELLOW") + " " + football.getFraction(this.match.rateTaiXiu) + "    " + football.getDouble(this.match.rateMoneyDuoiTaiXiu);
        }

        this.lbBet.setString(sBet);
        this.setLabelText(sInfo,this.lbBetInfo);
        //this.lbBetInfo.setString(sInfo);

        this.txGoldBet.setString("");
        this.lbGoldGet.setString("");
    },

    onAcceptBet : function () {
        var minBet = football.miniGame.minBet;
        var maxBet = football.miniGame.maxBet;

        if(this.money < minBet)
        {
            var s = LocalizedString.to("NOTE_1");
            s = StringUtility.replaceAll(s,"@money",StringUtility.pointNumber(minBet));
            Toast.makeToast(Toast.LONG,s);
            return;
        }

        if(this.money > maxBet)
        {
            var s = LocalizedString.to("NOTE_2");
            s = StringUtility.replaceAll(s,"@money",StringUtility.pointNumber(maxBet));
            Toast.makeToast(Toast.LONG,s);
            return;
        }

        var cmd = new CmdSendBetMatch();
        cmd.putData(this.matchId,this.actionBetType,this.money,this.betValue,0,0);
        GameClient.getInstance().sendPacket(cmd);
        cmd.clean();

        this.removeFromParent();
    },
    
    checkMoney : function () {
        var num = this.txGoldBet.getString();
        if (num === "") num = 0;
        if(isNaN(num))num = 0;
        if(num < 0) num = 0;

        if(num > gamedata.userData.bean)
        {
            num = gamedata.userData.bean;
        }

        if(num > football.miniGame.maxBet)
        {
            num = football.miniGame.maxBet;
            var s = LocalizedString.to("NOTE_2");
            s = StringUtility.replaceAll(s,"@money",StringUtility.pointNumber(num));
            Toast.makeToast(Toast.LONG,s);
        }

        if (this.txGoldBet.getString() !== ""){
            this.txGoldBet.setString(StringUtility.pointNumber(num));
        } else {
            this.txGoldBet.setPlaceHolder(LocalizedString.to("INPUT_BET"));
        }

        this.money = num;

        var moneyEat;

        if(this.actionBetType == Football.RESULT_RATE)
        {
            if(this.betValue == 1)
            {
                moneyEat = football.getDoubleMoney(this.money,this.match.rateWinLostMoneyHome);
            }
            else
            {
                moneyEat = football.getDoubleMoney(this.money,this.match.rateWinLostMoneyAway);
            }
        }
        else if(this.actionBetType == Football.RESULT_SUM)
        {
            if(this.betValue == 1)
            {
                moneyEat = football.getDoubleMoney(this.money,this.match.rateMoneyTrenTaiXiu);
            }
            else
            {
                moneyEat = football.getDoubleMoney(this.money,this.match.rateMoneyDuoiTaiXiu);
            }
        }

        this.lbGoldGet.setString(StringUtility.pointNumber(moneyEat));
    },

    checkingNumber : function (tf) {
        var s = tf.getString();
        while(isNaN(s) && s.length > 0)
        {
            s = s.substring(0, s.length - 1);
        }
        tf.setString(s);
    },

    editBoxEditingDidBegin: function (editBox) {
        this.txGoldBet.setString("");
        this.lbGoldGet.setString("0");
        this.txGoldBet.setPlaceHolder("");
        this.money = 0;
    },

    editBoxEditingDidEnd: function (editBox) {
        this.checkMoney();
        var goldBet = this.txGoldBet.getString();
        setTimeout(function () {
            editBox.setString(goldBet);
        },100);
        if (goldBet === "") this.txGoldBet.setPlaceHolder(LocalizedString.to("INPUT_BET"));
    },

    editBoxTextChanged: function (editBox, text) {

    },

    editBoxReturn: function (editBox) {

    },

    onButtonRelease : function (button, id) {
        switch (id)
        {
            case  0:
                this.onAcceptBet();
                break;
            case 1 :
                this.onBack();
                break;
        }
    },

    replaceFlagTeam : function (curFlag,parent) {
        var flag = engine.UIAvatar.create("GUIMinigame/flagDefault.png");
        flag.setPosition(curFlag.getPosition());
        parent.addChild(flag);
        curFlag.setVisible(false);
        return flag;
    },

    onBack : function () {
        this.onClose();
    }
});

FBetRate.className = "FBetRate";