/**
 * Created by Hunter on 5/13/2016.
 */


var GUILoader = function () {

};

GUILoader.checkInBoard = function () {
    var gui = sceneMgr.getRunningScene().getMainLayer();
    return !!(gui instanceof BoardScene);

};

GUILoader.loadDialog = function () {
    if (GUILoader.checkInBoard()) {
        return "Dialog.json";
    }
    return "Dialog.json";
};

var CoinFallEffect = cc.Layer.extend({

    ctor: function () {
        this._super();
        this.listCoin = [];
        this.numEffect = 0;
        this.numCoinNow = 0;
        this.callBack = null;
        this.timeCount = 0;
        this.positionCoin = [0, 0];
        this.isRun = false;
        this.isAutoRemove = false;
        this.typeEffect = 0;
        var cacheFrames = cc.spriteFrameCache;
        cacheFrames.addSpriteFrames("Particles/gold.plist", "Particles/gold.png");
    },

    setCallbackFinish: function (cb, target, data) {
        this.callBack = cb;
        this.callBack.target = target;
        this.callBack.data = data;
    },

    setPositionCoin: function (p) {
        this.positionCoin = p;
    },

    setAutoRemove: function (bool) {
        this.isAutoRemove = bool;
    },

    update: function (dt) {
        this.timeCount += dt;
        if (this.timeCount < 0)return;
        var coin;
        var isFinish = true;
        for (var i = this.numCoinNow; i < this.numEffect; i++) {
            coin = this.listCoin[i];
            if (coin.isVisible()) {
                coin.updateCoin(dt);
                isFinish = false;
            }
        }
        if (this.numCoinNow > 0) {
            if (this.timeCount >= CoinFallEffect.TIME_OUT_COIN) {
                var num = 10;
                if (this.typeEffect == CoinFallEffect.TYPE_FLOW) {
                    num = CoinFallEffect.NUM_COIN_EACH_TIME * this.timeCount;
                    this.timeCount = 0;
                }
                else if (this.typeEffect == CoinFallEffect.TYPE_RAIN) {
                    num = CoinFallEffect.NUM_COIN_RATE_RAIN * 0.05;
                    this.timeCount = CoinFallEffect.TIME_OUT_COIN - 0.05;
                }
                for (i = 0; i < num; i++) {
                    coin = this.listCoin[this.numCoinNow--];
                    coin.start();
                    if (this.numCoinNow == 0)break;
                }
            }
        }
        else {
            if (isFinish) {
                this.unscheduleUpdate();
                this.setVisible(false);
                this.isRun = false;
                if (this.callBack) {
                    this.callBack.apply(this.callBack.target, this.callBack.data);
                }
                if (this.isAutoRemove) {
                    this.removeEffect();
                }
            }
        }
    },

    startEffect: function (numEffect, type, delay) {
        if (this.isRun)this.stopEffect();
        delay = delay || 0;
        var coin;
        this.typeEffect = type;
        this.numEffect = numEffect;
        var i, len;
        if (numEffect > this.listCoin.length) {
            for (i = 0, len = numEffect - this.listCoin.length; i < len; i++) {
                coin = this.getCoinItem();
                this.listCoin.push(coin);
                this.addChild(coin);
            }
        }
        for (i = 0; i < numEffect; i++) {
            coin = this.listCoin[i];
            coin.stop();
            coin.initCoin(type);
        }
        this.numCoinNow = numEffect - 1;
        this.timeCount = -delay;
        this.scheduleUpdate();
        this.setVisible(true);
        this.isRun = true;
        //this.runAction(cc.sequence(cc.delayTime(CoinFallEffect.DELAY_PLAY_SOUND + delay), cc.callFunc(gameSound.playCoinFall)));
    },

    stopEffect: function () {
        for (var i = 0; i < this.listCoin.length; i++) {
            this.listCoin[i].setVisible(false);
        }
        this.unscheduleUpdate();
    },

    removeEffect: function () {
        this.stopEffect();
        this.listCoin = [];
        this.removeFromParent(true);
    },

    getCoinItem: function () {
        return new CoinEffect();
    }
});

//CoinFallEffect.IMAGE_COIN = "GUIVideoPoker/coinParticle.png";
CoinFallEffect.RATE_SPEED_Y = 600;
CoinFallEffect.DEFAULT_SPEED_Y = 850;
CoinFallEffect.RATE_SPEED_X = 350;
CoinFallEffect.RATE_SPEED_R = 10;
CoinFallEffect.RATE_Position_X = 70;
CoinFallEffect.RATE_Position_Y = 70;
CoinFallEffect.MIN_SCALE = 0.32;
CoinFallEffect.MAX_SCALE = 0.42;
CoinFallEffect.RATE_JUMP_BACK = 0.5;
CoinFallEffect.GRAVITY = 2300;
CoinFallEffect.POSI = 90;
CoinFallEffect.NAME_ANIMATION_COIN = "gold";
CoinFallEffect.NUM_SPRITE_ANIMATION_COIN = 8;
CoinFallEffect.NUM_COIN_EACH_TIME = 100;
CoinFallEffect.NUM_COIN_RATE_RAIN = 100;
CoinFallEffect.TIME_ANIMATION_COIN = 0.3;
CoinFallEffect.TIME_OUT_COIN = 0.05;
CoinFallEffect.TYPE_FLOW = 0;
CoinFallEffect.TYPE_RAIN = 1;
CoinFallEffect.DELAY_PLAY_SOUND = 0.3;
CoinFallEffect.TIME_FADE_IN_COIN = 0.15;
CoinFallEffect.TIME_FADE_OUT_COIN = 0.15;

CoinFallEffect.STATE_COIN_NONE = 0;
CoinFallEffect.STATE_COIN_START = 1;
CoinFallEffect.STATE_COIN_COLLIDED = 2;
CoinFallEffect.STATE_COIN_FINISH = 3;