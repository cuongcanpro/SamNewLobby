/**
 * Dialog common using Game
 * Change background in board of Game
 */

var Dialog = BaseLayer.extend({

    ctor: function () {
        this._bg = null;
        this._btnOK = null;
        this._btnCancel = null;
        this._pCenter = null;
        this._pLeft = null;
        this._pRight = null;
        this._lb_message = null;

        this._target = null;
        this._callback = null;
        this._btnId = -1;

        this._super(Dialog.className);
        this.initWithBinaryFile("Dialog.json");
    },

    customizeGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this._btnOK = this.customButton("btnOK", Dialog.BTN_OK, bg);
        this._btnCancel = this.customButton("btnCancel", Dialog.BTN_CANCEL, bg);
        this._btnClose = this.customButton("btnQuit", Dialog.BTN_QUIT, bg);

        this.lbOk = this.getControl("lbOk", this._btnOK);
        this.lbCancel = this.getControl("lbCancel", this._btnCancel);
        this._lb_message = this.getControl("lb_message", bg);

        this._pLeft = this._btnOK.getPosition();
        this._pRight = this._btnCancel.getPosition();
        this._pCenter = ccui.Helper.seekWidgetByName(ccui.Helper.seekWidgetByName(this._layout, "bg"), "btnCenter").getPosition();

        this.setFog(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
    },

    resetButton: function () {
        this._btnOK.setVisible(false);
        this._btnCancel.setVisible(false);

        this._btnOK.setPosition(this._pLeft);
        this._btnCancel.setPosition(this._pRight);

        this._target = null;
        this._callback = null;
        this._btnId = -1;
    },

    onButtonRelease: function (sender, id) {
        this._btnId = id;
        this.onClose();
    },

    onCloseDone: function () {
        BaseLayer.prototype.onCloseDone.call(this);

        if (this._callback != null)
            this._callback.call(this._target, this._btnId);
    },

    setOkCancel: function (message, target, selector) {
        this.setMessage(message);
        this._target = target;
        this._callback = selector;

        this._btnOK.loadTextures("Common/btnYellow.png", "Common/btnYellow.png");
        this.lbOk.setString(localized("AGREE"));
        this.lbCancel.setString(localized("CANCEL"));

        this._btnOK.setPosition(this._pLeft);
        this._btnCancel.setPosition(this._pRight);
        this._btnOK.setVisible(true);
        this._btnCancel.setVisible(true);
    },

    setOkWithAction: function (message, target, selector) {
        this.setMessage(message);
        this._target = target;
        this._callback = selector;

        this._btnOK.loadTextures("Common/btnYellow.png", "Common/btnYellow.png");
        this.lbOk.setString(localized("AGREE"));
        this._btnOK.setVisible(true);
        this._btnOK.setPosition(this._pCenter);

        this._btnCancel.setVisible(false);
        this._btnClose.setVisible(false);
    },

    setOKNotify: function (message) {
        this.setMessage(message);

        this._btnOK.loadTextures("Common/btnYellow.png", "Common/btnYellow.png");
        this.lbOk.setString(localized("AGREE"));
        this._btnOK.setVisible(true);
        this._btnOK.setPosition(this._pCenter);

        this._btnCancel.setVisible(false);
    },

    setChangeGold: function (message, target, selector) {
        this.setMessage(message);
        this._target = target;
        this._callback = selector;

        this._btnOK.loadTextures("Common/btnYellow.png", "Common/btnYellow.png");
        this.lbOk.setString(localized("AGREE"));
        this._btnOK.setVisible(true);
        this._btnOK.setPosition(this._pLeft);

        this._btnCancel.setVisible(true);
        this._btnCancel.setPosition(this._pRight);
    },

    setAddG: function (message, target, selector) {
        this.setMessage(message);
        this._target = target;
        this._callback = selector;

        this._btnOK.loadTextures("Common/btnGreen.png", "Common/btnGreen.png");
        this.lbOk.setString(localized("NAP_G"));
        this._btnOK.setVisible(true);
        this._btnOK.setPosition(this._pLeft);

        this._btnCancel.setVisible(true);
        this._btnCancel.setPosition(this._pRight);
    },

    setPlayNow: function(message, target, selector) {
        this.setMessage(message);
        this._target = target;
        this._callback = selector;

        this._btnOK.loadTextures("Common/btnYellow.png", "Common/btnYellow.png");
        this.lbOk.setString(localized("PLAY_NOW"));
        this._btnOK.setVisible(true);
        this._btnOK.setPosition(this._pLeft);

        this._btnCancel.setVisible(true);
        this._btnCancel.setPosition(this._pRight);
    },

    setMessage: function (message) {
        this.resetButton();
        this.setLabelText(message, this._lb_message);
    }
});

Dialog.className = "Dialog";

Dialog.BTN_OK = 0;
Dialog.BTN_CANCEL = 1;
Dialog.BTN_QUIT = 2;

Dialog.ZODER = 10000;
Dialog.TAG = 10000;

Dialog.SUPPORT = 800;