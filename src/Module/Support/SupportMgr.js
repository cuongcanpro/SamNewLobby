var SupportMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.giftIndex = -1;
    },

    init: function () {
        dispatcherMgr.addListener(UserMgr.EVENT_ON_GET_USER_INFO, this, this.sendGetSupport);
        dispatcherMgr.addListener(UserMgr.EVENT_UPDATE_MONEY, this, this.updateMoney);
        dispatcherMgr.addListener(LobbyMgr.EVENT_ON_ENTER_FINISH, this, this.checkShowSupportStartUp);
    },

    updateMoney: function () {
        if (lobbyMgr.inLobbyScene() || channelMgr.inChooseRoomScene()) {
            this.checkSupportBean();
        }
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case SupportMgr.GET_DAILY_GIFT: {
                var cDG = new CmdReceiveDailyGift(pk);
                this.giftIndex = cDG.index;
                cc.log("GET_DAILY_GIFT" + JSON.stringify(cDG));
                this.showSupportStartup();
                cDG.clean();
                break;
            }
            case SupportMgr.SUPPORT_BEAN: {
                var csb = new CmdReceiveSupportBean(pk);
                csb.clean();
                this.onSupportBean(csb);
                break;
            }
            case SupportMgr.CMD_TANGVANG:
            {
                var pk = new CmdReceivedTangGold(pk);
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
            if (isSpecial) {
                var sp = sceneMgr.openGUI(GUISupportSpecial.className, PopUpManager.SUPPORT, PopUpManager.SUPPORT, false);
                if (sp) sp.showInfo(bean);
            }
            else {
                var sp = sceneMgr.openGUI(GUISupportInfo.className, PopUpManager.SUPPORT, PopUpManager.SUPPORT, false);
                if (sp) sp.showGUI(bean, isSpecial);
            }
        }
    },

    showSupportInLobby: function () {
        var specialSupport = this.specialSupport.bonusGold;
        if (this.numSupport <= 0){
            // het so lan ho tro, kiem tra xem show ho tro dac biet
            var checkSpecial = this.checkInSpecialTimeSupport();

            if (checkSpecial && checkSpecial.error == 0) {       //not special time yet
                var sp = sceneMgr.openGUI(GUISupportSpecial.className, PopUpManager.SUPPORT, PopUpManager.SUPPORT, false);
                if (sp) sp.showInfo(0);
            }
            else if (checkSpecial && checkSpecial.error == 1){  //in special time
                var sp = sceneMgr.openGUI(GUISupportSpecial.className, PopUpManager.SUPPORT, PopUpManager.SUPPORT, false);
                if (sp) sp.showInfo(0);
            }
            else {   //special time over
                // show GUI Support thong thuong
                var sp = sceneMgr.openGUI(GUISupportInfo.className, PopUpManager.SUPPORT, PopUpManager.SUPPORT, false);
                if (sp) sp.showGUI(0);
            }
        }
        else {
            // van con lan ho tro, nhung chua du dieu kien nhan
            var sp = sceneMgr.openGUI(GUISupportInfo.className, PopUpManager.SUPPORT, PopUpManager.SUPPORT, false);
            if (sp) sp.showGUI(0);
        }
    },

    checkShowSupportStartUp: function () {
        cc.log("checkShowSupportStartUp " + this.giftIndex);
        if (this.giftIndex >= 0) {
            this.showSupportStartup();
        } else {
            if (this.checkSupportBean()) {
                lobbyMgr.showEffectSuggestMoney();
            }
        }
    },

    showSupportStartup: function () {
        if (popUpManager.canShow(PopUpManager.STARTUP)) {
            var sp = sceneMgr.openGUI(GUIStartUp.className, PopUpManager.STARTUP, PopUpManager.STARTUP, false);
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

    checkCapture: function () {
        if (this.sharedPhoto) {
            this.sharedPhoto = false;

            var pk = new CmdSendTangGold();
            GameClient.getInstance().sendPacket(pk);
            pk.clean();
        }
    },

    sharePhoto: function (isShareImage, image) {
        if (!gameMgr.checkOldNativeVersion()) {
            var imgPath = sceneMgr.takeScreenShot(isShareImage, image);
            setTimeout(function () {
                fr.facebook.shareScreenShoot(imgPath, function (result) {
                    var message = "";
                    if (result == -1) {
                        message = localized("INSTALL_FACEBOOK");
                    } else if (result == 1) {
                        message = localized("NOT_SHARE");
                    } else if (result == 0) {
                        message = localized("FACEBOOK_DELAY");

                        var pk = new CmdSendTangGold();
                        GameClient.getInstance().sendPacket(pk);
                        pk.clean();
                    } else {
                        message = localized("FACEBOOK_ERROR");
                    }
                    Toast.makeToast(Toast.SHORT, message);
                });
            }, 500);
        } else {
            this.captureSuccess = function (social, jdata) {
                var message = "";
                var dom = StringUtility.parseJSON(jdata);
                if (dom["error"] == -1) {
                    message = localized("INSTALL_FACEBOOK");
                } else if (dom["error"] == 1) {
                    message = localized("NOT_SHARE");
                } else if (dom["error"] == 0) {
                    message = localized("FACEBOOK_DELAY");

                    var pk = new CmdSendTangGold();
                    GameClient.getInstance().sendPacket(pk);
                    pk.clean();
                } else {
                    message = localized("FACEBOOK_ERROR");
                }
                Toast.makeToast(Toast.SHORT, message);


            }.bind(this);

            socialMgr.set(this, this.captureSuccess);
            socialMgr.shareImage2(isShareImage, image);
        }
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

SupportMgr.GET_DAILY_GIFT = 1003;
SupportMgr.SUPPORT_BEAN = 1005;
SupportMgr.CMD_TANGVANG = 1014;