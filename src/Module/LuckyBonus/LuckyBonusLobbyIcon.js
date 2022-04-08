/**
 * Created by AnhLN6 on 10/8/2021
 * Animate lucky bonus icon in lobby
 */

var LuckyBonusButton = cc.Node.extend({
    ctor: function(){
        this._super();
        this.setCascadeOpacityEnabled(true);

        this.exclamation = new cc.Node();
        let exclamationX = 40;
        let exclamationY = 40;
        this.exclamation.setPosition(exclamationX, exclamationY);
        this.exclamation.setVisible(false);
        let anim = db.DBCCFactory.getInstance().buildArmatureNode("Notify");
        anim.gotoAndPlay("1", -1, -1, 0);
        this.exclamation.addChild(anim);
        this.addChild(this.exclamation, 1);

        this.btn = new ccui.Button(
            "Lobby/GUILuckyBonus/btnLobby.png",
            "Lobby/GUILuckyBonus/btnLobby.png",
            "Lobby/GUILuckyBonus/btnLobby.png"
        );
        this.btn.ignoreContentAdaptWithSize(false);
        this.btn.setAnchorPoint(0.5, 0.5);
        this.btn.setPressedActionEnabled(true);
        this.btn.addClickEventListener(function(){
            LuckyBonusManager.getInstance().enterLuckyBonusScene = true;
            LuckyBonusManager.getInstance().userClickedLuckyBonusIcon = true;
            LuckyBonusManager.getInstance().sendGetUserInfo(1);
        });
        this.addChild(this.btn);
    },

    onEnter: function(){
        this._super();
        this.showNotify(false);
    },

    showNotify: function(show){
        this.exclamation.setVisible(show);
    }
});
LuckyBonusButton.NUMBER_OF_REELS = 3;
LuckyBonusButton.REEL_SIZE = cc.size(9, 17);
LuckyBonusButton.REEL_POS = cc.p(5, 8);
