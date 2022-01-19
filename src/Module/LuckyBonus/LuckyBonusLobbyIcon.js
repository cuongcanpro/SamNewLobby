/**
 * Created by AnhLN6 on 10/8/2021
 * Animate lucky bonus icon in lobby
 */

var LuckyBonusButton = cc.Node.extend({
    ctor: function(){
        this._super();

        this.bg = ccui.ImageView("Lobby/GUILuckyBonus/iconLobby/slotMachine.png");
        this.addChild(this.bg);

        this.reels = new ccui.ImageView("Lobby/GUILuckyBonus/iconLobby/reels.png");
        this.reels.setPosition(0.5, 10);
        this.addChild(this.reels);

        this.lever = new cc.Sprite("Lobby/GUILuckyBonus/iconLobby/lever_1.png");
        this.lever.setPosition(-25, 10);
        this.addChild(this.lever, -1);

        this.exclamation = new cc.Node();
        let exclamationX = 18;
        let exclamationY = 24;
        this.exclamation.setPosition(exclamationX, exclamationY);
        this.exclamation.setVisible(false);
        let anim = db.DBCCFactory.getInstance().buildArmatureNode("Notify");
        anim.gotoAndPlay("1", -1, -1, 0);
        this.exclamation.addChild(anim);
        this.addChild(this.exclamation, 1);

        for (var i = 0; i < LuckyBonusButton.NUMBER_OF_REELS; i++){
            var reel = new ccui.Layout();
            reel.setAnchorPoint(0.5, 0.5);
            reel.setContentSize(LuckyBonusButton.REEL_SIZE);
            reel.setPosition(LuckyBonusButton.REEL_SIZE.width/2 + 10 * i, 1 + LuckyBonusButton.REEL_SIZE.height/2);
            reel.setClippingEnabled(true);
            this.reels.addChild(reel, 0, i);

            var slot = new ccui.ImageView("Lobby/GUILuckyBonus/iconLobby/slot.png");
            slot.setPosition(LuckyBonusButton.REEL_POS.x, LuckyBonusButton.REEL_POS.y);
            reel.addChild(slot, 0, 0);

            slot = new ccui.ImageView("Lobby/GUILuckyBonus/iconLobby/slot.png");
            slot.setPosition(LuckyBonusButton.REEL_POS.x, LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
            reel.addChild(slot, 0, 1);
        }

        this.btn = new ccui.Button();
        this.btn.ignoreContentAdaptWithSize(false);
        this.btn.setContentSize(this.bg.getContentSize());
        this.btn.setAnchorPoint(0.5, 0.5);
        this.addChild(this.btn);
        this.btn.addClickEventListener(function(){
            LuckyBonusManager.getInstance().enterLuckyBonusScene = true;
            LuckyBonusManager.getInstance().userClickedLuckyBonusIcon = true;
            LuckyBonusManager.getInstance().sendGetUserInfo(1);
        });
    },

    onEnter: function(){
        this._super();

        for (var i = 0; i < LuckyBonusButton.NUMBER_OF_REELS; i++){
            var reel = this.reels.getChildByTag(i);
            var slot0 = reel.getChildByTag(0);
            slot0.setPositionY(LuckyBonusButton.REEL_POS.y);
            slot0.stopAllActions();
            slot0.runAction(cc.sequence(
                cc.delayTime(1.1),
                cc.sequence(
                    cc.moveBy(0.4, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineIn()),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot0)),
                    cc.moveBy(0.05, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineIn())
                ),
                cc.sequence(
                    cc.moveBy(0.025, 0, -LuckyBonusButton.REEL_SIZE.height),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot0)),
                    cc.moveBy(0.025, 0, -LuckyBonusButton.REEL_SIZE.height)
                ).repeat(28 + i * 10),
                cc.sequence(
                    cc.moveBy(0.05, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineOut()),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot0)),
                    cc.moveBy(0.4, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineOut()).easing(cc.easeBackOut())
                ),
                cc.delayTime(3.4 + 10 * (LuckyBonusButton.NUMBER_OF_REELS - i - 1) * 0.05)
            ).repeatForever());

            var slot1 = reel.getChildByTag(1);
            slot1.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
            slot1.runAction(cc.sequence(
                cc.delayTime(1.1),
                cc.sequence(
                    cc.moveBy(0.4, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineIn()),
                    cc.moveBy(0.05, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineIn()),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot1))
                ),
                cc.sequence(
                    cc.moveBy(0.05, 0, -2 * LuckyBonusButton.REEL_SIZE.height),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot1))
                ).repeat(28 + i * 10),
                cc.sequence(
                    cc.moveBy(0.05, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineOut()),
                    cc.moveBy(0.4, 0, -LuckyBonusButton.REEL_SIZE.height).easing(cc.easeSineOut()).easing(cc.easeBackOut()),
                    cc.callFunc(function(){
                        this.setPositionY(LuckyBonusButton.REEL_POS.y + LuckyBonusButton.REEL_SIZE.height);
                    }.bind(slot1))
                ),
                cc.delayTime(3.4 + 10 * (LuckyBonusButton.NUMBER_OF_REELS - i - 1) * 0.05)
            ).repeatForever());
        }

        var frames = [];
        for (var i = 0; i < 3; i++){
            var frame = new cc.SpriteFrame("Lobby/GUILuckyBonus/iconLobby/lever_" + (i+1).toString() + ".png", cc.rect(0, 0, 17, 33));
            frames.push(frame);
        }
        var anim = new cc.Animation(frames, 0.05);

        this.lever.setTexture("Lobby/GUILuckyBonus/iconLobby/lever_1.png");
        this.lever.runAction(cc.sequence(
            cc.delayTime(1),
            cc.animate(anim).easing(cc.easeSineOut()),
            cc.delayTime(0.2),
            cc.animate(anim).reverse().easing(cc.easeSineIn()),
            cc.delayTime(6.3)
        ).repeatForever());

        this.showNotify(false);
    },

    showNotify: function(show){
        this.exclamation.setVisible(show);
    }
});
LuckyBonusButton.NUMBER_OF_REELS = 3;
LuckyBonusButton.REEL_SIZE = cc.size(9, 17);
LuckyBonusButton.REEL_POS = cc.p(5, 8);
