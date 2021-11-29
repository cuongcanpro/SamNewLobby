var SupportMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.giftIndex = -1;
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case CMD.GET_DAILY_GIFT: {
                var cDG = new CmdReceiveDailyGift(pk);
                this.giftIndex = cDG.index;
                this.showSupportStartup();
                cDG.clean();
                break;
            }
            case CMD.SUPPORT_BEAN: {
                var csb = new CmdReceiveSupportBean(pk);
                csb.clean();
                this.onSupportBean(csb);
                break;
            }
        }
        return false;
    },

    setConfig: function (config) {
        var special = config["support"]["special"];
        var specialSupport = {};
        specialSupport["bonusGold"] = special["specialSupportGold"];
        specialSupport["numSupport"] = special["SpecialSupportNumber"];
        specialSupport["minGold"] = special["specialSupportMinGold"];
        var supportTime = special["specialSupportTime"];
        var startHour = [];
        var startMinute = [];
        var endHour = [];
        var endMinute = [];
        for (var i = 0; i < supportTime.length; i++) {
            var time = supportTime[i];
            var timeSplit = time.split("-");
            var start = timeSplit[0].split(":");
            var end = timeSplit[1].split(":");

            startHour.push(parseInt(start[0]));
            startMinute.push(parseInt(start[1]));
            endHour.push(parseInt(end[0]));
            endMinute.push(parseInt(end[1]));
        }
        specialSupport["time"] = supportTime;
        specialSupport["startHour"] = startHour;
        specialSupport["startMinute"] = startMinute;
        specialSupport["endHour"] = endHour;
        specialSupport["endMinute"] = endMinute;

        this.specialSupport = specialSupport;
        this.dailyGift = config["beanMobile"];
        cc.log("special support config: ", JSON.stringify(this.specialSupport));
    },

    showSupportBean: function (bean, isSpecial) {
        if (popUpManager.canShow(PopUpManager.SUPPORT)) {
            var sp = sceneMgr.openGUI(GUISupportInfo.className, PopUpManager.SUPPORT, PopUpManager.SUPPORT, false);
            if (sp) sp.showGUI(bean, isSpecial);
        }
    },

    checkShowSupportStartUp: function () {
        if (this.giftIndex > 0) {
            this.showSupportStartup();
        } else {
            if (this.checkSupportBean()) {
                lobbyMgr.showEffectSuggestMoney();
            }
        }
    },

    showSupportStartup: function () {
        if (popUpManager.canShow(PopUpManager.STARTUP)) {
            var sp = sceneMgr.openGUI(SupportBeanGUI.className, PopUpManager.STARTUP, PopUpManager.STARTUP, false);
            if (sp) sp.showSupportStartup();
        }
    },

    sendGetSupport: function () {
        var pk = new CmdSendGetSupportBean();
        this.sendPacket(pk);
        pk.clean();
    },


    checkSupportBean: function () {
        cc.log("CHECK SUPPORTY BEAN ");
        var ret = false;
        if (userMgr.getGold() < channelMgr.getMinGoldSupport()) {
            this.sendGetSupport();
            ret = true;
        } else {
            ret = false;
        }
        return ret;
    },

    onSupportBean: function (csb) {
        this.numSupport = csb.numSupport;
        this.timeSupport = csb.delay;
        this.isWaitingSpecialSupport = csb.isWaitingSpecialSupport;
        this.specialSupportRemainStart = csb.remainStart;
        this.specialSupportRemainEnd = csb.remainEnd;
     //   cc.log("onSupportBean buyGoldCount = " + this.gameConfig.buyGoldCount, csb.numSupport);
        if (userMgr.getGold() < channelMgr.getMinGoldSupport()) {
            if ((csb.numSupport <= 0)) // het tien ma chua nap
            {
                if (offerManager.haveOffer()) {
                    offerManager.showOfferGUI();
                } else {
                    if ((paymentMgr.buyGoldCount === 0))
                        paymentMgr.showTangVangPopup();
                    else
                        paymentMgr.showTangVangPopup2();
                }
            }
        }

        cc.director.getScheduler().unschedule("SpecialSupportUpdate", this);
        if (this.isWaitingSpecialSupport){
            cc.director.getScheduler().schedule(function(){
                this.specialSupportRemainStart -= 1000;
                this.specialSupportRemainEnd -= 1000;
            }.bind(this), this, 1, cc.REPEAT_FOREVER, 0, false, "SpecialSupportUpdate");
        }

        if (csb.getError() > 0) {
            if (csb.nBean > 0) {
                this.showSupportBean(csb.nBean, csb.isSpecial);
            }
        }
    },

    checkInSpecialTimeSupport: function() {
        if (this.isWaitingSpecialSupport){
            var now = Date.now();
            var startTime = now + this.specialSupportRemainStart;
            var endTime = now + this.specialSupportRemainEnd;
            var startTimeStr = StringUtility.customFormatDate(startTime, "#hhhh#:#mm#");
            var endTimeStr = StringUtility.customFormatDate(endTime - 1000 * 60, "#hhhh#:#mm#");
            if (now < startTime) {
                return {error: 0, time:startTimeStr + "-" + endTimeStr};
            }
            if (now < endTime){
                return {error: 1, time:startTimeStr + "-" + endTimeStr};
            }
            var cmd = new CmdSendGetSupportBean();
            GameClient.getInstance().sendPacket(cmd);
            cmd.clean();
            return null;
        }
        else return null;
    },
})

SupportMgr.instance = null;
SupportMgr.getInstance = function () {
    if (!SupportMgr.instance) {
        SupportMgr.instance = new SupportMgr();
    }
    return SupportMgr.instance;
};
var supportMgr = SupportMgr.getInstance();