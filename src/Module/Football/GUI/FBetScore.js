/**
 * Created by HunterPC on 9/9/2015.
 */

var FBetScore = BaseLayer.extend({

    ctor : function () {
        this.match = null;
        this.matchId = -1;
        this.money = 0;

        this.flagTeam0 = null;
        this.flagTeam1 = null;
        this.nameTeam0 = null;
        this.nameTeam1 = null;
        this.scoreTeam0 = null;
        this.scoreTeam1 = null;
        this.txGoldBet = null;
        this.lbGoldGet = null;
        this.txScore0 = null;
        this.txScore1 = null;
        this.lbNote = null;

        this._super(FBetScore.className);
        this.initWithBinaryFile("FBetScore.json");
    },

    initGUI : function () {
        this.enableFog();
        this.setBackEnable(true);

        var bg = this.getControl("bg");
        this._bg = bg;

        this.customizeButton("btnOK",0,bg);
        this.customizeButton("btnCancel",1,bg);

        this.flagTeam0 = this.replaceFlagTeam(this.getControl("flagTeam0",bg),bg);
        this.flagTeam1 = this.replaceFlagTeam(this.getControl("flagTeam1",bg),bg);
        this.nameTeam0 = this.getControl("nameTeam0","bg");
        this.nameTeam1 = this.getControl("nameTeam1","bg");
        this.flagTeam0.setPositionY(this.nameTeam0.getPositionY());
        this.flagTeam1.setPositionY(this.nameTeam1.getPositionY());

        this.lbGoldGet = this.getControl("txGoldGet","bg");
        this.lbNote = this.getControl("lbInfo","bg");

        var st0 = this.getControl("scoreTeam0","bg");
        var st1 = this.getControl("scoreTeam1","bg");
        var txGold = this.getControl("txGoldBet","bg");

        if (cc.sys.isNative) {
            st0.setVisible(false);
            st1.setVisible(false);
            txGold.setVisible(false);

            this.scoreTeam0 = BaseLayer.createEditBox(st0);
            this.scoreTeam0.setDelegate(this);
            this.scoreTeam0.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
            bg.addChild(this.scoreTeam0);

            this.scoreTeam1 = BaseLayer.createEditBox(st1);
            this.scoreTeam1.setDelegate(this);
            this.scoreTeam1.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
            bg.addChild(this.scoreTeam1);

            this.txGoldBet = BaseLayer.createEditBox(txGold);
            this.txGoldBet.setDelegate(this);
            this.txGoldBet.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
            bg.addChild(this.txGoldBet);
        }
        else {
            this.txGoldBet = txGold;
            this.scoreTeam0 = st0;
            this.scoreTeam1 = st1;
            this.scoreTeam0.addEventListener(this.editBoxEvent, this);
            this.scoreTeam1.addEventListener(this.editBoxEvent, this);
            this.txGoldBet.addEventListener(this.editBoxEvent, this);
        }

        this.scoreTeam0.setPlaceHolder("0");
        this.txGoldBet.setPlaceHolder(LocalizedString.to("INPUT_BET"));
        this.scoreTeam1.setPlaceHolder("0");

        this.scoreTeam0.setTag(FBetScore.TX_SCORE_HOME);
        this.scoreTeam1.setTag(FBetScore.TX_SCORE_AWAY);
        this.txGoldBet.setTag(FBetScore.TX_GOLD_BET);

        var s = LocalizedString.to("NOTE");
        s = StringUtility.replaceAll(s, "@num", football.miniGame.rateScore);
        this.lbNote.setString(s);
    },

    onEnterFinish : function () {
        this.setShowHideAnimate(this._bg,true);
    },

    showBet : function (matchId) {
        this.matchId = matchId;

        this.money = 0;
        this.match = {};

        for(var i = 0 ; i < football.fData.listMatch.length ; i++)
        {
            if(football.fData.listMatch[i].Id == this.matchId)
            {
                this.match = football.fData.listMatch[i];
                break;
            }
        }

        var sTeamName0 = football.getTeam(this.match.home);
        var sTeamName1 = football.getTeam(this.match.away);

        this.nameTeam0.setString(sTeamName0);
        this.nameTeam1.setString(sTeamName1);

        this.flagTeam0.setDefaultImage();
        this.flagTeam1.setDefaultImage();

        this.flagTeam0.asyncExecuteWithUrl("Flag" + md5(sTeamName0),football.getFlag(this.match.home));
        this.flagTeam1.asyncExecuteWithUrl("Flag" + md5(sTeamName1),football.getFlag(this.match.away));

        this.scoreTeam0.setString("");
        this.scoreTeam1.setString("");
        this.txGoldBet.setString("");
        this.lbGoldGet.setString("");
    },

    onAcceptBet : function () {
        var minBet = football.miniGame.minBet;
        var maxBet = football.miniGame.maxBet;

        if(this.money < minBet)
        {
            var s = LocalizedString.to("NOTE_1");
            s = StringUtility.replaceAll(s, "@money", StringUtility.pointNumber(minBet));

            Toast.makeToast(Toast.LONG,s);
            return;
        }

        if(this.money > maxBet)
        {
            var s = LocalizedString.to("NOTE_2");
            s = StringUtility.replaceAll(s, "@money", StringUtility.pointNumber(maxBet));

            Toast.makeToast(Toast.LONG,s);
            return;
        }

        var sScore0 = this.scoreTeam0.getString();
        if(sScore0 < 0)
        {
            this.scoreTeam0.setString("");
            Toast.makeToast(Toast.LONG,LocalizedString("NEGATIVE"));
            return;
        }


        var sScore1 = this.scoreTeam1.getString();
        if(sScore1 < 0)
        {
            this.scoreTeam1.setString("");
            Toast.makeToast(Toast.LONG,LocalizedString("NEGATIVE"));
            return;
        }

        var cmd = new CmdSendBetMatch();
        cmd.putData(this.matchId, Football.RESULT, this.money, 1, sScore0, sScore1);
        GameClient.getInstance().sendPacket(cmd);
        cmd.clean();

        this.removeFromParent();
    },

    checkMoney : function () {
        var num = this.txGoldBet.getString();
        if(isNaN(num))num = 0;
        if(num < 0) num = 0;
        if (this.txGoldBet.getString() === "") num = 0;

        if(num > gamedata.userData.bean){
            num = gamedata.userData.bean;
        }


        if(num > football.miniGame.maxBet)
        {
            num = football.miniGame.maxBet;
            var s = LocalizedString.to("NOTE_2");
            s = StringUtility.replaceAll(s,"@money",StringUtility.pointNumber(num));

            Toast.makeToast(Toast.LONG,s);
        }
        if (this.txGoldBet.getString() === "") {
            this.txGoldBet.setPlaceHolder(LocalizedString.to("INPUT_BET"));
        } else {
            var goldBet = StringUtility.pointNumber(num);
            this.txGoldBet.setString(goldBet);
        }

        this.money = num;

        var moneyEat = this.money * football.miniGame.rateScore;

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

    editBoxEvent : function (textField, type) {
        if(type == ccui.TextField.EVENT_INSERT_TEXT)
        {
            this.checkingNumber(textField);
        }

        if(textField.getTag() == FBetScore.TX_GOLD_BET)
        {
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
        }
        else
        {
            if(type == ccui.TextField.EVENT_ATTACH_WITH_IME)
            {
                if(textField.getTag() == FBetScore.TX_SCORE_HOME) this.scoreTeam0.setString("");
                if(textField.getTag() == FBetScore.TX_SCORE_AWAY) this.scoreTeam1.setString("");
            }
            else if(type == ccui.TextField.EVENT_DETACH_WITH_IME)
            {
                // this.checkScore();
            }
        }
    },

    editBoxEditingDidBegin: function (editBox) {
        switch (editBox.getTag())
        {
            case FBetScore.TX_GOLD_BET:
                this.txGoldBet.setString("");
                this.lbGoldGet.setString("0");
                this.txGoldBet.setPlaceHolder("");
                this.money = 0;
                break;
            case FBetScore.TX_SCORE_HOME:
                this.scoreTeam0.setString("");
                this.scoreTeam0.setPlaceHolder("");
                break;
            case FBetScore.TX_SCORE_AWAY:
                this.scoreTeam1.setString("");
                this.scoreTeam1.setPlaceHolder("");
                break;
        }
    },

    editBoxEditingDidEnd: function (editBox) {
        switch (editBox.getTag())
        {
            case FBetScore.TX_GOLD_BET:
                this.checkMoney();
                var txtGold = this.txGoldBet.getString();
                setTimeout(function () {
                    editBox.setString(txtGold);
                },100);
                break;
            case FBetScore.TX_SCORE_HOME:
            case FBetScore.TX_SCORE_AWAY:
                var sc1 = editBox.getString();
                if(isNaN(sc1)) sc1 = 0;
                if(sc1 < 0) sc1 = 0;
                if(sc1 > 99) sc1 = 99;
                editBox.setString(sc1);
                if (this.scoreTeam0.getString() === "") this.scoreTeam0.setPlaceHolder("0");
                if (this.scoreTeam1.getString() === "") this.scoreTeam1.setPlaceHolder("0");
                break;
        }
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

FBetScore.className = "FBetScore";

FBetScore.TX_SCORE_HOME = 10;
FBetScore.TX_SCORE_AWAY = 11;

FBetScore.TX_GOLD_BET = 20;