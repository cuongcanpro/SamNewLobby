
var LoadingScene = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("LoadingGUI.json");
    },

    initGUI: function () {
        this.bgProgress = this.getControl("bgProgress", this._layout);
        this.progress = this.getControl("progress", this._layout);
        this.scheduleUpdate();
        this.count = 0;
    },

    update: function (dt) {
        if (this.count < 80) {
            this.count = this.count + 1;
            this.progress.setPercent(this.count);
        }
    },

    onEnterFinish: function () {
        if(gameMgr.hasLoadedInfor) {
            //loginMgr.autoLoginPortal();
        }
        else {
            setTimeout(gameMgr.loadGameInformation.bind(gameMgr),1.0);
        }
    }
})