/**
 * Created by Hunter on 8/11/2016.
 */

var VoteAppGUI = BaseLayer.extend({

    ctor: function () {
        this._super();
        this.initWithBinaryFile("VoteGUI.json");
    },

    customizeGUI : function () {
        this._bg = ccui.Helper.seekWidgetByName(this._layout,"bg");

        this.customizeButton("vote",0,this._bg);
        this.customizeButton("close",1,this._bg);

        var bonus = this.getControl("bonus",this._bg);
        bonus.setString(StringUtility.pointNumber(gamedata.voteAppBonus) + " $");

        this.enableFog();
        this.setBackEnable(true);
    },

    onEnterFinish : function () {
        this.setShowHideAnimate(this._bg,true);
    },

    onButtonRelease : function (button, id) {
        switch (id)
        {
            case 0:
            {
                NativeBridge.openURLNative(gamedata.storeUrl);
                GameClient.getInstance().sendPacket( new CmdSendVoteApp());
                this.onBack();
                break;
            }
            case 1:
            {
                this.onBack();
                break;
            }
        }
    },

    onBack : function () {
        var countShowVote = cc.sys.localStorage.getItem("vote_app_bonus_count");
        if(countShowVote === undefined || countShowVote == null || countShowVote == "")
        {
            countShowVote = 0;
        }
        countShowVote = parseInt(countShowVote);
        if(isNaN(countShowVote)) countShowVote = 0;

        cc.sys.localStorage.setItem("vote_app_bonus_count",countShowVote + 1);

        this.onClose();
    }
});

VoteAppGUI.className = "VoteAppGUI";