var BoardVoucherGUI = BaseLayer.extend({
    ctor: function() {
        this._super(BoardVoucherGUI.className);

        this.time = null;
        this.img = null;
        this.btnVoucher = null;
        this.voucherRef = null;
        this.hasVoucher = false;

        this.initWithBinaryFile("Lobby/BoardVoucherGUI.json");
    },

    initGUI: function() {
        this.btnVoucher = this.getControl("btnVoucher");
        this.btnVoucher.defaultPosition = this.btnVoucher.getPosition();
        this.img = this.getControl("img");
        this.img.ignoreContentAdaptWithSize(true);
        this.time = this.getControl("time");
        this.time.ignoreContentAdaptWithSize(true);
    },

    onEnterFinish: function() {
        this.hasVoucher = false;
        this.voucherRef = null;
        this.btnVoucher.setVisible(false);
        this.onUpdateGUI();
    },

    onUpdateGUI: function() {
        this.unschedule(this.update);
        var currentVoucher = StorageManager.getInstance().getCurrentBoardVoucher();
        if (currentVoucher) this.voucherRef = currentVoucher.ref;
        else this.voucherRef = null;
        if (this.voucherRef){
            this.img.loadTexture(currentVoucher.imgPath);
            this.setTime(this.voucherRef.remainTime);
            if (!this.hasVoucher){
                this.hasVoucher = true;
                this.btnVoucher.setVisible(true);
                this.btnVoucher.setPositionX(cc.winSize.width + this.btnVoucher.width);
                this.btnVoucher.setOpacity(0);
                this.btnVoucher.stopAllActions();
                this.btnVoucher.runAction(cc.spawn(
                    cc.fadeIn(1),
                    cc.moveTo(1, this.btnVoucher.defaultPosition.x, this.btnVoucher.defaultPosition.y).easing(cc.easeBackOut())
                ));
            }
            this.schedule(this.update, 1);
        }
        else{
            this.setTime(0);
            if (this.hasVoucher){
                this.hasVoucher = false;
                this.btnVoucher.setVisible(true);
                this.btnVoucher.setPositionX(this.btnVoucher.defaultPosition.x);
                this.btnVoucher.setOpacity(255);
                this.btnVoucher.stopAllActions();
                this.btnVoucher.runAction(cc.sequence(
                    cc.spawn(
                        cc.fadeOut(1),
                        cc.moveTo(1, cc.winSize.width + this.btnVoucher.width, this.btnVoucher.defaultPosition.y).easing(cc.easeBackIn())
                    )
                ));
            }
        }
    },

    onButtonRelease: function(button, id) {
        switch(id) {
            case BoardVoucherGUI.BTN_VOUCHER:
                break;
        }
    },

    update: function(dt) {
        if (this.voucherRef && this.voucherRef.remainTime){
            this.setTime(this.voucherRef.remainTime);
        }
        else this.setTime(0);
    },

    setTime: function(remainTime) {
        var s = Math.ceil(remainTime / 1000);
        var m = Math.floor(s / 60);
        s -= m * 60;
        var h = Math.floor(m / 60);
        m -= h * 60;
        var textColor;
        if (h > 0){
            this.time.setString((h < 10 ? "0" : "") + h + "h:" + (m < 10 ? "0" : "") + m + "p");
            textColor = cc.color("#4FFF95");
        }
        else{
            this.time.setString((m < 10 ? "0" : "") + m + "p:" + (s < 10 ? "0" : "") + s + "s");
            if (m >= 5) textColor = cc.color("#4FFF95");
            else textColor = cc.color("#FF6A6A");
        }
        this.time.setTextColor(textColor);
    }
});
BoardVoucherGUI.className = "BoardVoucherGUI";
BoardVoucherGUI.GUI_TAG = 318;
BoardVoucherGUI.BTN_VOUCHER = 0;