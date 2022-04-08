/**
 * GUIDisconnect common using Game
 * Change background in board of Game
 */

var GUIDisconnect = BaseLayer.extend({

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

        this._super(GUIDisconnect.className);
        this.initWithBinaryFile("GUIDisconnect.json");
    },

    customizeGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this._btnOK = this.customButton("btnOK", GUIDisconnect.BTN_OK, bg);
        this._btnCancel = this.customButton("btnCancel", GUIDisconnect.BTN_CANCEL, bg);
        this._btnClose = this.customButton("btnQuit", GUIDisconnect.BTN_QUIT, bg);

        this.lbOk = this.getControl("lbOk", this._btnOK);
        this.lbCancel = this.getControl("lbCancel", this._btnCancel);
        this._lb_message = this.getControl("lb_message", bg);

        this._pLeft = this._btnOK.getPosition();
        this._pRight = this._btnCancel.getPosition();

        this.setFog(true);
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this._bg, true);
    },

    onButtonRelease: function (sender, id) {
        this._btnId = id;
        this.onClose();
    },

    onCloseDone: function () {
        BaseLayer.prototype.onCloseDone.call(this);

        if (this._callback != null)
            this._callback.call(this._target, this._btnId);

        // var checkPortal = false;
        // if (this._btnId == 0) {
        //     // no action
        // }
        // else {
        //     cc.sys.localStorage.setItem("autologin", -1);
        //     checkPortal = true;
        // }
        // loginMgr.backToLoginScene(checkPortal);
    },

    setMessage: function (message, target, selector) {
        this.setLabelText(message, this._lb_message);
        this._target = target;
        this._callback = selector;
    },
});

GUIDisconnect.className = "GUIDisconnect";

GUIDisconnect.BTN_OK = 0;
GUIDisconnect.BTN_CANCEL = 1;
GUIDisconnect.BTN_QUIT = 2;

GUIDisconnect.ZODER = 10001;
GUIDisconnect.TAG = 10001;

GUIDisconnect.SUPPORT = 800;

