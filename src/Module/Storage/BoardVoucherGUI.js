var BoardVoucherGUI = BaseLayer.extend({
    ctor: function () {
        this._super(BoardVoucherGUI.className);

        this.time = null;
        this.img = null;
        this.btnVoucher = null;
        this.voucherRef = null;
        this.hasVoucher = false;

        this.initWithBinaryFile("Lobby/BoardVoucher.json");
    },

    initGUI: function () {
        this.btnVoucher = this.getControl("btnVoucher");
        this.btnVoucher.setPosition(cc.p(0, 0));
        this.img = this.getControl("img");
        this.img.ignoreContentAdaptWithSize(true);
        this.time = this.getControl("time");
        this.time.ignoreContentAdaptWithSize(true);
    },

    onEnterFinish: function () {
        cc.log(
            "BoardVoucherGUI",
            JSON.stringify(this.btnVoucher.getPosition()),
            JSON.stringify(this._layout.getPosition()),
            JSON.stringify(this.getPosition())
        );
        this.hasVoucher = false;
        this.voucherRef = null;
        this.btnVoucher.setVisible(false);
        this.defaultScale = 0.75;
        this.onUpdateGUI();

        // var scene = sceneMgr.getMainLayer();
        // if (scene instanceof BoardScene) {
        //     var position = scene._players[0].getVoucherPosition();
        //     cc.log("THE POSITION", JSON.stringify(position));
        //     this.setPosition(position);
        // }
    },

    onUpdateGUI: function () {
        this.unschedule(this.update);
        var currentVoucher = StorageManager.getInstance().getCurrentBoardVoucher();
        if (currentVoucher) this.voucherRef = currentVoucher.ref;
        else this.voucherRef = null;
        if (this.voucherRef) {
            this.img.loadTexture(currentVoucher.imgPath);
            this.setTime(this.voucherRef.remainTime);
            if (!this.hasVoucher) {
                this.hasVoucher = true;
                this.btnVoucher.stopAllActions();
                this.btnVoucher.setVisible(true);
                this.btnVoucher.setOpacity(0);
                this.btnVoucher.setScale(0);
                this.btnVoucher.runAction(cc.spawn(
                    cc.fadeIn(1),
                    cc.scaleTo(1, this.defaultScale).easing(cc.easeBackOut())
                ));
            }
            this.schedule(this.update, 1);
        } else {
            this.setTime(0);
            if (this.hasVoucher) {
                this.hasVoucher = false;
                this.btnVoucher.stopAllActions();
                this.btnVoucher.setVisible(true);
                this.btnVoucher.setOpacity(255);
                this.btnVoucher.setScale(this.defaultScale);
                this.btnVoucher.runAction(cc.sequence(
                    cc.spawn(cc.fadeOut(1)).easing(cc.easeOut(2.5)),
                    cc.scaleTo(1, 0).easing(cc.easeBackIn())
                ));
            }
        }
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case BoardVoucherGUI.BTN_VOUCHER:
                break;
        }
    },

    update: function (dt) {
        if (this.voucherRef && this.voucherRef.remainTime) {
            this.setTime(this.voucherRef.remainTime);
        } else this.setTime(0);
    },

    setTime: function (remainTime) {
        var s = Math.ceil(remainTime / 1000);
        var m = Math.floor(s / 60);
        s -= m * 60;
        var h = Math.floor(m / 60);
        m -= h * 60;
        var d = Math.floor(h / 24);
        h -= d * 24;

        if (d > 0) {
            this.time.setString(d + " ngày");
        } else if (h > 0) {
            this.time.setString((h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m);
        } else {
            this.time.setString((m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s);
        }
    }
});
BoardVoucherGUI.className = "BoardVoucherGUI";
BoardVoucherGUI.GUI_TAG = 318;
BoardVoucherGUI.BTN_VOUCHER = 0;