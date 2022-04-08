/**
 *  Created by sonbnt on 24/08/2021
 */

var DailyPurchaseButton = cc.Node.extend({
    ctor: function(){
        this._super();

        this.btn = new ccui.ImageView("Lobby/DailyPurchase/btnLobby.png");
        this.btn.setAnchorPoint(0.5, 0.5);
        this.btn.setTouchEnabled(true);
        this.btn.addTouchEventListener(function(btn, type){
            if (type == ccui.Widget.TOUCH_ENDED) {
                if (sceneMgr.getMainLayer() instanceof LobbyScene) {
                    if (dailyPurchaseManager.checkOpen()) {
                        dailyPurchaseManager.openDailyPurchaseGUI();
                        fr.tracker.logStepStart(ConfigLog.DAILY_PURCHASE, ConfigLog.BEGIN + "gui_lobby");
                    }
                    else dailyPurchaseManager.sendDailyPurchaseData();
                }
            }
        }.bind(this), this);
        this.addChild(this.btn);

        this.txtTime = new ccui.Text("23:59:59", "fonts/tahoma.ttf", 16);
        this.txtTime.ignoreContentAdaptWithSize(true);
        this.txtTime.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.txtTime.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.txtTime.setAnchorPoint(0.5, 0.5);
        this.txtTime.setPosition(0, -50);
        //this.txtTime.setColor(cc.color(239, 217, 108));
        //this.txtTime.enableOutline(cc.color(131, 73, 52), 1);
        this.addChild(this.txtTime);

        this.hot = new cc.Node();
        this.hot.setPosition(30, 20);
        this.addChild(this.hot);
    },

    onEnter: function(){
        this._super();
        this.scheduleUpdate();
        this.hot.removeAllChildren();
        var anim = db.DBCCFactory.getInstance().buildArmatureNode("Notify");
        anim.gotoAndPlay("1", -1, -1, 0);
        this.hot.addChild(anim);
    },

    onExit: function(){
        this._super();
        this.unscheduleUpdate();
    },

    update: function(){
        var remainTime = dailyPurchaseManager.getRemainTime();
        if (remainTime > 1000 * 60 * 60 * 24) {
            var d = Math.ceil(remainTime / (1000 * 60 * 60 * 24));
            this.txtTime.setString(d + " ngày");
        }
        else{
            var s = Math.ceil(remainTime / 1000);
            var m = Math.floor(s / 60);
            s -= m * 60;
            var h = Math.floor(m / 60);
            m -= h * 60;
            this.txtTime.setString((h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s);
        }
    },

    showNotify: function(notify){
        this.hot.setVisible(notify);
    }
});