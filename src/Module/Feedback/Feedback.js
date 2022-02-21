/**
 * Created by kienlt3 on 12/15/2021.
 */

var FeedbackGUI = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile('res/Lobby/FeedbackGUI.json');
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customizeButton("btnClose", FeedbackGUI.BTN_CLOSE);
        this.customizeButton("btnSend", FeedbackGUI.BTN_SEND);

        this.textField = this.getControl("textField");
        this.textField.setMaxLength(FeedbackGUI.MAX_CHARACTER);
        this.textField.setMaxLengthEnabled(true);
        this.enableFog();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg);

        fr.feedbackService.setAccountInfo(
            userMgr.getUID(),
            userMgr.getUserName()
        );
    },

    onButtonRelease : function (btn, id) {
        switch (id) {
            case FeedbackGUI.BTN_CLOSE:
                break;
            case FeedbackGUI.BTN_SEND:
                cc.log("FeedbackGUI SEND FEEDBACK:", this.textField.getString());
                fr.feedbackService.sendFeedback(this.textField.getString());
                sceneMgr.openGUI(FeedbackSuccessGUI.className);

                var d = new Date();
                var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
                cc.sys.localStorage.setItem(FeedbackGUI.KEY_LOCAL + userMgr.getUID(), sDay);
                break;
        }

        this.onBack();
    },

    onBack: function () {
        this.onClose();
    }
});
FeedbackGUI.className = "FeedbackGUI";
FeedbackGUI.BTN_CLOSE = 0;
FeedbackGUI.BTN_SEND = 1;
FeedbackGUI.KEY_LOCAL = "FeedbackGUI";
FeedbackGUI.MAX_CHARACTER = 300;
FeedbackGUI.checkNewDay = function () {
    var d = new Date();
    var sDay = "" + d.getDate() + d.getMonth() + d.getFullYear();
    var cDay = cc.sys.localStorage.getItem(FeedbackGUI.KEY_LOCAL + userMgr.getUID());
    if (sDay != cDay || Config.ENABLE_CHEAT) {
        return true;
    }
    Toast.makeToast(Toast.LONG, "Bạn đã gửi góp ý cho ngày hôm nay. Xin cám ơn!");
    return false;
};

var FeedbackSuccessGUI = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile('res/Lobby/FeedbackSuccess.json');
    },

    initGUI: function () {
        this._bg = this.getControl("bg");

        this.customizeButton("btnClose", FeedbackSuccessGUI.BTN_CLOSE);
        this.enableFog();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg);
    },

    onButtonRelease : function (btn, id) {
        this.onBack();
    },

    onBack: function () {
        this.onClose();
    }

});
FeedbackSuccessGUI.className = "FeedbackSuccessGUI";
FeedbackSuccessGUI.BTN_CLOSE = 0;