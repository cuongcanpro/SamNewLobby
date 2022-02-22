var EffectMgr = cc.Class.extend({
    ctor: function () {
        this.arLbPoints = [];   // array of label effect change value point
        this.runTimeEffect = [];

        // load sprite frame
        cc.spriteFrameCache.addSpriteFrames("res/Lobby/Common/gold.plist");
        cc.spriteFrameCache.addSpriteFrames("res/Lobby/Common/coin.plist");
        cc.spriteFrameCache.addSpriteFrames("res/Lobby/Common/coinNew.plist");
    },

    runLabelPoint: function (label, cur, des, delayTime, numChange, type) {
        numChange = numChange || 50;
        delayTime = delayTime || 0;
        type = type || EffectMgr.LABEL_RUN_POINT;
        var lb = null;
        var isNew = true;
        for (var i = 0, size = this.arLbPoints.length; i < size; i++) {
            if (this.arLbPoints[i] == label) {
                lb = label;
                isNew = false;
                break;
            }
        }

        if(isNew) {
            lb = label;
        }
        lb.type = type;
        lb.cur = cur;
        lb.des = des;
        lb.delta = parseInt((des - cur) / numChange);
        lb.delay = delayTime;
        if (type == EffectMgr.LABEL_RUN_POINT)
            lb.setString(StringUtility.pointNumber(lb.cur));
        else
            lb.setString(StringUtility.formatNumberSymbol(lb.cur));
        if(isNew) {
            this.arLbPoints.push(lb);
        }
    },

    flyCoinEffect: function (parent, gold, ratio, pStart, pEnd, fGoldDone, checkTime) {
        if (!parent) return 0;

        ratio = ratio || 100000; // default 100K gold
        var num = Math.floor(gold / ratio);
        if (num < 1) num = 1;
        var goldReturn = Math.floor(gold / num);

        var timeMove = 1.5;
        var dTime = 0.5;
        var timeHide = 0.25;
        var timeShow = 0.15;

        if (checkTime) {
            return timeMove + timeHide + dTime + timeShow;
        }

        var winSize = cc.director.getWinSize();
        var rangeX = [-50, 50];
        var rangeY = [-50, 50];

        num = (num < 10) ? num : (10 + parseInt(num / 5));
        num = (num < 200) ? num : 200;

        for (var i = 0; i < num; i++) {
            var sp = new CoinEffect();
            sp.start();

            // random pos start
            var rndX = Math.random() * (rangeX[1] - rangeX[0]) + rangeX[0];
            var rndY = Math.random() * (rangeY[1] - rangeY[0]) + rangeY[0];

            var rndRotate = -(Math.random() * 360);

            var pCX = Math.random() * winSize.width;
            var pCY = Math.random() * winSize.height;

            var posStart = cc.p(pStart.x + rndX, pStart.y + rndY);
            var posCenter = cc.p(pCX, pCY);

            var actShow = new cc.EaseBackOut(cc.scaleTo(timeShow, 0.4));
            var actMove = new cc.EaseSineOut(cc.BezierTo.create(timeMove, [posStart, posCenter, pEnd]));
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            sp.setPosition(posStart);
            sp.setRotation(rndRotate);
            parent.addChild(sp);
            sp.setScale(0);

            sp.runAction(cc.sequence(cc.delayTime(Math.random() * dTime),
                actShow,
                cc.spawn(actMove,
                    cc.sequence(cc.delayTime(1.5 * Math.random()), cc.callFunc(function () {
                        //if (gamedata.sound) {
                        //    if (this % 3 === 0){
                        //        var rnd = parseInt(Math.random() * 10) % 3 + 1;
                        //        cc.audioEngine.playEffect(lobby_sounds["coin" + rnd], false);
                        //    }
                        //}
                    }.bind(i)))), cc.callFunc(function () {
                    if (fGoldDone) fGoldDone.apply(this, arguments);
                }.bind(this, goldReturn)), actHide));
        }
        return (timeMove + timeHide + dTime + timeShow);
    },

    dropCoinEffect: function (parent, gold, pos, type, func) {
        pos = pos || cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
        type = type || CoinEffect.TYPE_FLOW;

        //var scale = cc.director.getWinSize().width/Constant.WIDTH;
        //scale = (scale > 1) ? 1 : scale;

        var eff = new CoinEffectLayer();
        eff.setPositionCoin(pos);
        eff.startEffect(gold, type);
        eff.setCallbackFinish(func);
        //eff.setScale(scale);
        parent.addChild(eff);
    },

    flyCoinEffect2: function (parent, gold, pStart, pEnd, timeDelay, checkTime) {
        if (!parent) return 0;

        var num = 2 + Math.floor(Math.random() * 2);
        if (gold > 10000000) num = 3 + Math.floor(Math.random() * 2);
        if (gold > 100000000) num = 4 + Math.floor(Math.random() * 2);
        if (gold > 1000000000) num = 5 + Math.floor(Math.random() * 2);

        var timeMove = 1;
        var dTime = 0.25;
        var timeHide = 0.25;
        var timeShow = 0.15;

        if (checkTime) {
            return timeMove + timeHide + dTime + timeShow;
        }

        // cc.log("flyCoinEffect2: ", gold, num, JSON.stringify(pStart));
        for (var i = 0; i < num; i++) {
            var sp = new CoinEffect2();
            sp.start();

            var posStart = pStart;
            var posCenter = cc.p((pStart.x + pEnd.x) / 2 - 20, (pStart.y + pEnd.y) / 2 + 20);

            var actShow = new cc.EaseBackOut(cc.scaleTo(timeShow, 0.4));
            var actMove = new cc.BezierTo(timeMove, [posStart, posCenter, pEnd]);
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            sp.setPosition(posStart);
            parent.addChild(sp, 101);
            sp.setScale(0);
            var data = {par : parent, num: i};
            var actHightlight = cc.callFunc(function () {
                if (this.num === 0){
                    var effect = db.DBCCFactory.getInstance().buildArmatureNode("HighlightBig");
                    if (effect) {
                        this.par.addChild(effect, 102);
                        effect.gotoAndPlay("1" , 0, -1, 1);
                        effect.setPosition(pEnd);
                    }
                }
            }.bind(data));


            sp.runAction(cc.sequence(cc.delayTime(timeDelay + dTime * i),
                actShow,
                cc.spawn(cc.sequence(actMove, actHightlight, actHide),
                    cc.sequence(cc.delayTime(1.5 * Math.random()), cc.callFunc(function () {
                        if (gamedata.sound) {
                            var rnd = parseInt(Math.random() * 10) % 3 + 1;
                            cc.audioEngine.playEffect(lobby_sounds["coin" + rnd], false);
                        }
                    })))));
        }
        return (timeMove + timeHide + dTime * num - 0.5 + timeShow);
    },

    flyItemEffect: function(parent, spriteName, itemCount, pStart, pEnd, delay, isVpoint, checkTime) {
        if (!parent) return 0;

        var num = 2 + Math.floor(Math.random() * 2);
        if (itemCount > 10000000) num = 3 + Math.floor(Math.random() * 2);
        if (itemCount > 100000000) num = 4 + Math.floor(Math.random() * 2);
        if (itemCount > 1000000000) num = 5 + Math.floor(Math.random() * 2);
        //if (!isVpoint) num = 1;

        var timeMove = 0.7;
        var dTime = 0.25;
        var timeHide = 0.25;
        var timeShow = 0.15;

        if (checkTime){
            return (timeShow  + timeMove);
        }

        // cc.log("flyCoinEffect2: ", gold, num, JSON.stringify(pStart));
        for (var i = 0; i < num; i++) {
            var sp = new cc.Sprite(spriteName);
            var posCenter = cc.p((pStart.x + pEnd.x) / 2 + 100, (pStart.y + pEnd.y) / 2);

            var actShow = new cc.EaseBackOut(cc.scaleTo(timeShow, 1));
            var actMove = new cc.BezierTo(timeMove, [pStart, posCenter, pEnd]).easing(cc.easeIn(2.0));
            var actHide = cc.spawn(new cc.EaseBackIn(cc.scaleTo(timeHide, 0)), cc.fadeOut(timeHide));
            sp.setPosition(pStart);
            sp.setVisible(false);
            parent.addChild(sp, 102);
            var data = {par : parent, num: i};
            var actHightlight = cc.callFunc(function () {
                if (isVpoint && this.num === 0){
                    var effect = db.DBCCFactory.getInstance().buildArmatureNode("HighlightBig");
                    if (effect) {
                        this.par.addChild(effect, 102);
                        effect.gotoAndPlay("1" , 0, -1, 1);
                        effect.setScale(0.3);
                        effect.setPosition(pEnd);
                    }
                }
            }.bind(data));

            sp.runAction(cc.sequence(cc.delayTime(delay + dTime * i),
                cc.show(), actShow,
                cc.spawn(cc.sequence(actMove, actHightlight, actHide),
                    cc.sequence(cc.delayTime(1.5 * Math.random()), cc.callFunc(function () {
                        if (settingMgr.sound) {
                            var rnd = parseInt(Math.random() * 10) % 3 + 1;
                            cc.audioEngine.playEffect(lobby_sounds["coin" + rnd], false);
                        }
                    })))));
        }
        return (timeShow + timeMove);
    },

    runVipProgress: function(bgProgress, progress, txtExp, imgVpoint, imgCurrVip, imgNextVip, totalVpoint, delay, checkTime, vipLevel, curVpoint){
        var nextLevel = vipLevel;
        var listUpVpoint = [];
        var newLevel = vipLevel + 1;
        var isUpLevel = false;
        var vPointNeed;
        if (vipLevel >= VipManager.NUMBER_VIP){
            vPointNeed = VipManager.getInstance().getVpointNeed(nextLevel);
            listUpVpoint.push({startPoint: curVpoint, endPoint: curVpoint + totalVpoint, levelVip: VipManager.NUMBER_VIP});
        }
        while (totalVpoint > 0 && vipLevel < VipManager.NUMBER_VIP){
            if (nextLevel >= VipManager.NUMBER_VIP){
                listUpVpoint.push({startPoint: 0, endPoint: totalVpoint, levelVip: VipManager.NUMBER_VIP});
                break;
            }
            vPointNeed = VipManager.getInstance().getVpointNeed(nextLevel);
            if (!isUpLevel){
                if (curVpoint + totalVpoint >= vPointNeed){
                    isUpLevel = true;
                    totalVpoint -= (vPointNeed - curVpoint);
                    listUpVpoint.push({startPoint: curVpoint, endPoint: vPointNeed, levelVip: nextLevel});
                    newLevel = nextLevel + 1;
                } else {
                    listUpVpoint.push({startPoint: curVpoint, endPoint: curVpoint + totalVpoint, levelVip: nextLevel});
                    totalVpoint = 0;
                }
            } else {
                if (totalVpoint >= vPointNeed){
                    totalVpoint -= vPointNeed;
                    listUpVpoint.push({startPoint: 0, endPoint: vPointNeed, levelVip: nextLevel});
                    newLevel = nextLevel + 1;
                } else {
                    listUpVpoint.push({startPoint: 0, endPoint: totalVpoint, levelVip: nextLevel});
                    totalVpoint = 0;
                }
            }
            nextLevel++;
        }

        // cc.log("runVipProgress: ", isUpLevel, JSON.stringify(listUpVpoint));

        var timeRun = 0.8 + 0.3 * (listUpVpoint.length - 1);
        if (checkTime){
            return timeRun;
        }
        var actions = [];
        actions.push(cc.delayTime(delay));
        var timeRunEachAction = timeRun / listUpVpoint.length;
        for (var i = 0; i < listUpVpoint.length; i++){
            var data = listUpVpoint[i];
            var action = cc.callFunc(function () {
                VipScene.runEffectProgressVip(bgProgress, progress, txtExp, imgVpoint,  timeRun / listUpVpoint.length, this.startPoint, this.endPoint, this.levelVip, imgCurrVip, imgNextVip);
            }.bind(data));
            actions.push(action);
            actions.push(cc.delayTime(timeRunEachAction));
        }
        actions.push(cc.delayTime(timeRunEachAction));
        bgProgress.getParent().stopAllActions();
        bgProgress.getParent().runAction(cc.sequence(actions));
        return timeRun;
    },

    countdownLabelEffect: function (label, time, delay, startCountTime) {
        label.stopAllActions();
        label.setScale(0);
        label._time = time;
        label._startCountTime = startCountTime;
        label.setString(startCountTime);
        label.runAction(cc.sequence(
            cc.delayTime(delay),
            cc.sequence(
                cc.callFunc(function () {
                    if (this._time <= this._startCountTime) {
                        this.runAction(cc.sequence(
                            cc.scaleTo(0.1, 1),
                            cc.delayTime(0.7),
                            cc.scaleTo(0.1, 0),
                            cc.callFunc(function () {
                                this.setString(Math.floor(this._time));
                            }.bind(this))
                        ));
                    }
                    this._time--;
                }.bind(label)),
                cc.delayTime(1)
            ).repeat(Math.floor(time + 1))
        ));
    },

    updateEffect: function (dt) {
        for (var i = this.arLbPoints.length - 1; i >= 0; i--) {
            try {
                var lb = this.arLbPoints[i];
                if (lb.delay > 0) {
                    lb.delay -= dt;
                    continue;
                }

                lb.cur += lb.delta;
                lb.setString(lb.isFormat ? StringUtility.formatNumberSymbol(lb.cur) : StringUtility.pointNumber(lb.cur));
                if (lb.cur > lb.des) {
                    lb.setString(lb.isFormat ? StringUtility.formatNumberSymbol(lb.des) : StringUtility.pointNumber(lb.des));
                    this.arLbPoints.splice(i, 1);
                }
            }
            catch (e) {
                this.arLbPoints.splice(i, 1);
            }
        }

        for (var i = this.runTimeEffect.length - 1; i >= 0; i--) {
            try {
                var obj = this.runTimeEffect[i];
                if (obj.delay > 0) {
                    obj.delay -= dt;
                    continue;
                }
                obj.deltaFunc();
                obj.num--;
                if (obj.num <= 0) {
                    this.runTimeEffect.splice(i, 1);
                }
            } catch (e) {
                this.runTimeEffect.splice(i, 1);
            }
        }
    },

    receivedEffect: function (parent, createSample, num, pStart, pEnd, delay, tweaks = {
        timeMove: EffectMgr.RECEIVED_TIME_MOVE,
        dTime: EffectMgr.RECEIVED_TIME_DELTA,
        timeHide: EffectMgr.RECEIVED_TIME_HIDE,
        timeShow: EffectMgr.RECEIVED_TIME_SHOW,
    }) {
        var timeMove = tweaks.timeMove;
        var dTime = tweaks.dTime;
        var timeHide = tweaks.timeHide;
        var timeShow = tweaks.timeShow;

        for (var i = 0; i < num; i++) {
            var sp = createSample();
            sp.setPosition(pStart);
            sp.setVisible(false);
            parent.addChild(sp, 102);

            var posCenter = cc.p(
                (pStart.x + pEnd.x) / 2 + 100 * Math.random(),
                (pStart.y + pEnd.y) / 2 + 100 * Math.random()
            );

            //Act show
            var array = [];
            array.push(cc.show());
            if (sp.actShow) {
                array.push(sp.actShow);
            } else {
                array.push(cc.scaleTo(timeShow, 1).easing(cc.easeIn(2)));
            }
            var actShow = cc.sequence(array);
            //Act move
            array = [];
            if (sp.actMove) {
                array.push(sp.actMove);
            } else {
                array.push(cc.bezierTo(timeMove, [pStart, posCenter, pEnd]).easing(cc.easeOut(2)));
            }
            if (sp.actMoving) {
                array.push(sp.actMoving);
            }
            var actMove = cc.spawn(array);
            //Act hide
            array = [];
            if (sp.actHide) {
                array.push(sp.actHide);
            } else {
                array.push(cc.spawn(
                    cc.scaleTo(timeHide, 0).easing(cc.easeBackIn()),
                    cc.fadeOut(timeHide)
                ));
            }
            if (sp.actEnd) {
                array.push(sp.actEnd);
            }
            array.push(cc.removeSelf());
            var actHide = cc.sequence(array);

            sp.runAction(cc.sequence(
                cc.delayTime(delay + dTime * i),
                actShow,
                actMove,
                actHide
            ));
        }
        return (timeShow + timeMove + delay + dTime * (num - 1));
    },

    runWithTimeEffect: function (object, deltaFunc, delay, num, type) {
        object.deltaFunc = deltaFunc;
        object.num = num;
        object.delay = delay || 0;
        object.type = type || 0;

        if (object.type > 0) {
            var isNew = true;
            for (var i = 0, size = this.runTimeEffect.length; i < size; i++) {
                if (this.runTimeEffect[i] === object &&
                    this.runTimeEffect[i].type === object.type) {
                    isNew = false;
                    break;
                }
            }
            if (!isNew) return;
        }

        this.runTimeEffect.push(object);
    },

    runNumberLabelEffect: function (label, cur, des, delayTime, numChange, typeNumber = 0, phrase = "@number") {
        numChange = numChange? numChange : Math.round(Math.abs(des - cur));
        delayTime = delayTime || 0;

        label.cur = cur;
        label.des = des;
        label.delta = Math.ceil((des - cur) / numChange);
        label.typeNumber = typeNumber || 0;
        label.phrase = phrase;

        this.runWithTimeEffect(
            label,
            function () {
                try {
                    this.cur += this.delta;
                    this.cur = this.delta > 0? Math.min(this.des, this.cur) : Math.max(this.des, this.cur);
                    var number = this.cur;
                    var final = this.phrase.slice();
                    switch (this.typeNumber) {
                        case EffectMgr.TYPE_NUMBER_POINT:
                            number = StringUtility.pointNumber(this.cur);
                            break;
                        case EffectMgr.TYPE_NUMBER_FORMAT:
                            number = StringUtility.formatNumberSymbol(this.cur);
                            break;
                    }
                    final = StringUtility.replaceAll(final, "@number", number);
                    this.setString(final);
                } catch (e) {
                    this.num = 0;
                }
            },
            delayTime,
            numChange,
            EffectMgr.TYPE_RUN_LABEL
        );
    },

    runProgressBarEffect: function (progressBar, cur, des, delayTime, numChange) {
        numChange = numChange? numChange : Math.round(Math.abs(des - cur));
        delayTime = delayTime || 0;

        progressBar.cur = cur;
        progressBar.des = des;
        progressBar.delta = (des - cur) / numChange;

        this.runWithTimeEffect(
            progressBar,
            function () {
                try {
                    this.cur += this.delta;
                    this.cur = Math.min(this.des, this.cur);
                    this.setPercent(this.cur);
                } catch (e) {
                    this.num = 0;
                }
            },
            delayTime,
            numChange,
            EffectMgr.TYPE_RUN_PROGRESS_BAR
        );
    }
});
EffectMgr.RECEIVED_TIME_MOVE = 0.7;
EffectMgr.RECEIVED_TIME_DELTA = 0.1;
EffectMgr.RECEIVED_TIME_HIDE = 0.25;
EffectMgr.RECEIVED_TIME_SHOW = 0.15;

EffectMgr.TYPE_RUN_LABEL = 1;
EffectMgr.TYPE_NUMBER = 0;
EffectMgr.TYPE_NUMBER_POINT = 1;
EffectMgr.TYPE_NUMBER_FORMAT = 2;

EffectMgr.TYPE_RUN_PROGRESS_BAR = 2;

EffectMgr.LABEL_RUN_POINT = 0;
EffectMgr.LABEL_RUN_NUMBER = 1;
EffectMgr._inst = null;

EffectMgr.getInstance = function () {
    if (!EffectMgr._inst) {
        EffectMgr._inst = new EffectMgr();
    }
    return EffectMgr._inst;
};

effectMgr = EffectMgr.getInstance();

// Coin Effect
var CoinEffectLayer = cc.Layer.extend({

    ctor: function () {
        this._super();
        this.listCoin = [];
        this.numEffect = 0;
        this.numCoinNow = 0;
        this.callBack = null;
        this.timeCount = 0;
        this.positionCoin = [0, 0];
        this.isRun = false;
        this.typeEffect = 0;

        this.timeCountOut = 0;
        this.emitter = 0;
    },

    setCallbackFinish: function (cb) {
        this.callBack = cb;
    },

    setPositionCoin: function (p) {
        this.positionCoin = p;
    },

    setData: function (timeOut, numEmitter) {
        this.timeCountOut = timeOut;
        this.emitter = numEmitter;
    },

    update: function (dt) {
        var coin;
        var isFinish = true;
        for (var i = 0; i < this.listCoin.length; i++) {
            coin = this.listCoin[i];
            if (coin.visible) {
                coin.updateCoin(dt);
                isFinish = false;
            }
        }
        if (this.numCoinNow > 0) {
            this.timeCount += dt;
            if (this.timeCount >= this.timeCountOut) {
                var num;
                if (this.typeEffect == CoinEffectLayer.TYPE_FLOW) {
                    num = CoinEffectLayer.NUM_COIN_EACH_TIME * this.timeCount;
                    this.timeCount = 0;
                }
                else if (this.typeEffect == CoinEffectLayer.TYPE_RAIN) {
                    num = CoinEffectLayer.NUM_COIN_RATE_RAIN * 0.05;
                    this.timeCount = 0;
                    //this.timeCount = CoinEffectLayer.TIME_OUT_COIN - 0.05;
                }
                num = this.emitter;
                for (i = 0; i < num; i++) {
                    //coin = this.listCoin[this.numCoinNow--];
                    this.numCoinNow = this.numCoinNow - 1;
                    coin = this.getCoinItem();
                    coin.start();
                    if (this.numCoinNow == 0)break;
                }
            }
            //cc.log("NUM " + this.listCoin.length);
        }
        else {
            if (isFinish) {
                this.unscheduleUpdate();
                if (this.callBack) {
                    this.callBack.call();
                }
                this.isRun = false;
            }
        }
    },

    startEffect: function (numEffect, type) {
        if (this.isRun)this.stopEffect();
        var coin;
        this.typeEffect = type;
        this.numEffect = numEffect;
        this.numCoinNow = numEffect - 1;
        this.timeCount = 0;
        this.scheduleUpdate();
        this.setVisible(true);
        this.isRun = true;
        this.runAction(cc.sequence(cc.delayTime(CoinEffectLayer.DELAY_PLAY_SOUND), cc.callFunc(function () {
            if (gamedata.sound) {
                cc.audioEngine.playEffect(lobby_sounds.coinFall, false);
            }
        })));
        this.timeCountOut = CoinEffectLayer.TIME_OUT_COIN;
        this.emitter = 10;
    },

    stopEffect: function () {
        for (var i = 0; i < this.listCoin.length; i++) {
            this.listCoin[i].setVisible(false);
        }
    },

    getCoinItem: function () {
        //return new CoinEffect();
        var coin;
        var i;
        for (i = 0; i < this.listCoin.length; i++) {
            if (!this.listCoin[i].isVisible()) {
                coin = this.listCoin[i];
                break;
            }
        }
        if (i == this.listCoin.length) {
            coin = new CoinEffect();
            this.listCoin.push(coin);
            this.addChild(coin);
        }
        coin.stop();
        coin.initCoin(type);
        return coin;
    }
});

var CoinEffect = cc.Sprite.extend({

    ctor: function () {
        this._super();
        var animation = cc.animationCache.getAnimation(CoinEffectLayer.NAME_ANIMATION_COIN);
        if (!animation) {
            var arr = [];
            var cache = cc.spriteFrameCache;
            var aniFrame;
            // for (var i = 0; i < CoinEffectLayer.NUM_SPRITE_ANIMATION_COIN; i++) {
            //     aniFrame = new cc.AnimationFrame(cache.getSpriteFrame(CoinEffectLayer.NAME_ANIMATION_COIN + i + ".png"), CoinEffectLayer.TIME_ANIMATION_COIN);
            //     arr.push(aniFrame);
            // }
            // for (i = CoinEffectLayer.NUM_SPRITE_ANIMATION_COIN - 2; i >= 1; i--) {
            //     aniFrame = new cc.AnimationFrame(cache.getSpriteFrame(CoinEffectLayer.NAME_ANIMATION_COIN + i + ".png"), CoinEffectLayer.TIME_ANIMATION_COIN);
            //     arr.push(aniFrame);
            // }
            for (var i = 0; i < 8; i++) {
                aniFrame = new cc.AnimationFrame(cache.getSpriteFrame("coin" + i + ".png"), CoinEffectLayer.TIME_ANIMATION_COIN);
                arr.push(aniFrame);
            }
            animation = new cc.Animation(arr, CoinEffectLayer.TIME_ANIMATION_COIN);
            cc.animationCache.addAnimation(animation, CoinEffectLayer.NAME_ANIMATION_COIN);
        }
        this.anim = animation;
        this.setVisible(false);
    },

    initCoin: function (type) {
        this.isCollided = false; //kiem tra da cham dat 1 lan chua
        this.opacity = 0;
        var valueRan;
        if (type == CoinEffectLayer.TYPE_FLOW) {
            this.speedX = 2 * Math.random() * CoinEffectLayer.RATE_SPEED_X - CoinEffectLayer.RATE_SPEED_X;
            //this.speedY = Math.random() * CoinEffectLayer.RATE_SPEED_Y + CoinEffectLayer.DEFAULT_SPEED_Y;
            var def = Math.random() * 800 + 800;
            this.speedY = Math.sqrt(def * def - this.speedX * this.speedX);
            this.speedR = 2 * Math.random() * CoinEffectLayer.RATE_SPEED_R - CoinEffectLayer.RATE_SPEED_R;
            valueRan = Math.random() * (CoinEffectLayer.MAX_SCALE - CoinEffectLayer.MIN_SCALE) + CoinEffectLayer.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var p = cc.p(this.getParent().positionCoin.x + (Math.random() - 0.5) * CoinEffectLayer.RATE_Position_X,
                this.getParent().positionCoin.y + (Math.random() - 0.5) * CoinEffectLayer.RATE_Position_Y);
            this.setPosition(p);
        }
        else if (type == CoinEffectLayer.TYPE_RAIN) {
            this.speedX = 0;
            this.speedY = Math.random() * CoinEffectLayer.RATE_SPEED_X;
            this.speedR = 2 * Math.random() * CoinEffectLayer.RATE_SPEED_R - CoinEffectLayer.RATE_SPEED_R;
            valueRan = Math.random() * (CoinEffectLayer.MAX_SCALE - CoinEffectLayer.MIN_SCALE) + CoinEffectLayer.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var parent = this.getParent();
            this.setPosition(Math.random() * parent.width, parent.height + this.height + Math.random() * CoinEffectLayer.RATE_Position_Y);
        }
        this.setVisible(false);
    },

    start: function () {
        this.setVisible(true);
        var ani = cc.animate(this.anim);
        //ani.setSpeed(Math.random() * 0.5 + 0.5);
        this.runAction(ani.repeatForever());
    },

    stop: function () {
        this.setVisible(false);
        this.stopAllActions();
    },

    updateCoin: function (dt) {
        var opa = this.opacity;
        opa += 1500 * dt;
        if (opa > 255)this.opacity = 255;
        else this.opacity = opa;
        this.x += this.speedX * dt;
        this.y += this.speedY * dt;
        this.speedY -= CoinEffectLayer.GRAVITY * dt;
        this.rotation += this.speedR;
        //cham dat thi cho nhay len 1 lan roi roi tiep
        if (this.y < this.getContentSize().height / 2 && !this.isCollided) {
            this.isCollided = true;
            this.speedY = -this.speedY * (Math.random() * CoinEffectLayer.RATE_JUMP_BACK);
            this.speedX = 0;
        }
        else if (this.y + (this.height * this.scale) < 0 && this.isCollided) {
            this.stop();
        }
    }
});

var CoinEffectAnim = cc.Sprite.extend({

    ctor: function (time) {
        this._super();

        time = time || CoinEffectLayer.TIME_ANIMATION_COIN;

        var animation = cc.animationCache.getAnimation("coin");
        if (!animation) {
            var arr = [];
            var cache = cc.spriteFrameCache;
            var aniFrame;
            for (var i = 0; i < 8; i++) {
                aniFrame = new cc.AnimationFrame(cache.getSpriteFrame("coin" + i + ".png"), time);
                arr.push(aniFrame);
            }
            aniFrame = new cc.AnimationFrame(cache.getSpriteFrame("coin0.png"), time);
            arr.push(aniFrame);
            animation = new cc.Animation(arr,time);
            cc.animationCache.addAnimation(animation, "coin");
        }
        this.anim = animation;
    },

    start: function (repeat) {
        this.stopAllActions();

        var ani = repeat ? cc.repeatForever(cc.animate(this.anim)) : cc.animate(this.anim);
        this.runAction(ani);
    },
});

CoinEffectLayer.RATE_SPEED_Y = 600;
CoinEffectLayer.DEFAULT_SPEED_Y = 850;
CoinEffectLayer.RATE_SPEED_X = 350;
CoinEffectLayer.RATE_SPEED_R = 10;
CoinEffectLayer.RATE_Position_X = 70;
CoinEffectLayer.RATE_Position_Y = 70;
CoinEffectLayer.MIN_SCALE = 0.32;
CoinEffectLayer.MAX_SCALE = 0.42;
CoinEffectLayer.RATE_JUMP_BACK = 0.5;
CoinEffectLayer.GRAVITY = 2300;
CoinEffectLayer.POSI = 90;
CoinEffectLayer.NAME_ANIMATION_COIN = "gold";
CoinEffectLayer.NUM_SPRITE_ANIMATION_COIN = 5;
CoinEffectLayer.NUM_COIN_EACH_TIME = 100;
CoinEffectLayer.NUM_COIN_RATE_RAIN = 100;
CoinEffectLayer.TIME_ANIMATION_COIN = 0.3;
CoinEffectLayer.TIME_OUT_COIN = 0.05;
CoinEffectLayer.TYPE_FLOW = 0;
CoinEffectLayer.TYPE_RAIN = 1;
CoinEffectLayer.DELAY_PLAY_SOUND = 0.3;

var EffectTouchLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        this.setContentSize(cc.winSize);

        this.iconTouch = new cc.Sprite();
        this.iconTouch.setVisible(false);
        this.addChild(this.iconTouch);
        this.sttIcon = 0;

        var NUM_DECO = 3;
        this.arrayDeco = [];
        for(var i = 0; i < NUM_DECO; i++){
            var deco = new cc.Sprite("Lobby/Common/touchDeco.png");
            deco.setBlendFunc(cc.DST_COLOR, cc.ONE);
            this.addChild(deco);
            var square = new cc.Sprite("Lobby/Common/touchSquare.png");
            deco.addChild(square);
            deco.square = square;
            square.setBlendFunc(cc.DST_COLOR, cc.ONE);
            deco.setCascadeOpacityEnabled(false);
            square.setPosition(deco.width / 2, deco.height / 2);
            square.setScale(1.05, 1.05);
            this.arrayDeco.push(deco);
            deco.setVisible(false)
        }

        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: this.onTouchBegan
        });
        cc.eventManager.addListener(this._listener,this);
    },

    onExit: function() {
        this.iconTouch.setVisible(false);
        for(var i in this.arrayDeco)this.arrayDeco[i].setVisible(false);
    },

    effectTouch: function(pos){
        var EFF_TIME = 0.7;
        var iconTouch = this.iconTouch;
        iconTouch.initWithFile("res/Lobby/Common/touchIcon" + this.sttIcon + ".png");
        this.sttIcon ++;
        if(this.sttIcon >= 4)this.sttIcon = 0;
        iconTouch.setBlendFunc(cc.DST_COLOR, cc.ONE);
        iconTouch.setPosition(pos);
        iconTouch.setVisible(true);
        iconTouch.setScale(0);
        iconTouch.setOpacity(255);
        iconTouch.stopAllActions();
        iconTouch.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.spawn(
                cc.scaleTo(0.6, 1.5).easing(cc.easeSineOut()),
                cc.fadeOut(0.6).easing(cc.easeSineIn()))
        ));

        for(var i in this.arrayDeco){
            var deco = this.arrayDeco[i];
            deco.stopAllActions();
            deco.setVisible(true);
            deco.setPosition(pos);
            deco.setRotation(Math.random() * 90);
            deco.setOpacity(0);
            deco.setScale(0.2);
            deco.square.setOpacity(0);
            deco.square.stopAllActions();
            //
            var angle = Math.random() * Math.PI * 2;
            var del = Math.random() * 85 + 15;
            var pDelta = cc.p(del* Math.cos(angle), del * Math.sin(angle));
            var scale = 0.5 + Math.random()*0.7;
            deco.runAction(cc.spawn(
                cc.rotateBy(EFF_TIME, (Math.random() - 0.5) * 360),
                cc.moveBy(EFF_TIME, pDelta).easing(cc.easeSineOut()),
                cc.sequence(cc.scaleTo(0.2, scale), cc.scaleTo(0.5, scale * 0.5))
            ));
            deco.runAction(cc.sequence(
                cc.fadeIn(0.4),
                cc.fadeOut(0.1),
                cc.fadeTo(0.15, 150),
                cc.fadeOut(0.1)
            ));
            deco.square.runAction(cc.sequence(
                cc.fadeIn(0.25),
                cc.fadeOut(0.1),
                cc.fadeTo(0.2, 150),
                cc.fadeOut(0.15)
            ));
        }

    },

    onTouchBegan: function(touch,event){
        var pos = touch.getLocation();
        event.getCurrentTarget().effectTouch(pos);
        this.lastShowTime = new Date().getTime();
        return true;
    }
});
EffectTouchLayer.instance = null;
EffectTouchLayer.TAG = 10000;
EffectTouchLayer.TIME_SHOW_ICON = 0.6;
EffectTouchLayer.getInstance = function () {
    if (!EffectTouchLayer.instance) {
        EffectTouchLayer.instance = new EffectTouchLayer();
    }

    return EffectTouchLayer.instance;
};

var CoinEffect2 = cc.Sprite.extend({
    ctor: function () {
        this._super();
        var animation = cc.animationCache.getAnimation(CoinEffect2.NAME_ANIMATION);
        if (!animation) {
            var arr = [];
            var cache = cc.spriteFrameCache;
            var aniFrame;
            for (var i = 0; i < 6; i++) {
                aniFrame = new cc.AnimationFrame(cache.getSpriteFrame("coinNew" + i + ".png"), CoinEffect2.TIME_ANIMATION);
                arr.push(aniFrame);
            }
            animation = new cc.Animation(arr, CoinEffect2.TIME_ANIMATION);
            cc.animationCache.addAnimation(animation, CoinEffect2.NAME_ANIMATION);
        }
        this.anim = animation;
        this.setVisible(false);
    },

    start: function () {
        this.setVisible(true);
        var ani = cc.animate(this.anim);
        //ani.setSpeed(Math.random() * 0.5 + 0.5);
        this.runAction(ani.repeatForever());
    },

    stop: function () {
        this.setVisible(false);
        this.stopAllActions();
    }
});

CoinEffect2.NAME_ANIMATION = "coinNew";
CoinEffect2.TIME_ANIMATION = 0.25;

// Coin Effect
var ImageEffectLayer = cc.Layer.extend({

    ctor: function (w, h, rate, playSound) {
        this._super();
        this.listCoin = [];
        this.numEffect = 0;
        this.numCoinNow = 0;
        this.callBack = null;
        this.timeCount = 0;
        this.positionCoin = [0, 0];
        this.isRun = false;
        this.typeEffect = 0;
        this.playSound = true;
        this.timeCountOut = 0;
        this.emitter = 0;
        this.rate = 1;
        if (w && h) {
            this.width = w;
            this.height = h;
            this.rate = rate;
            this.playSound = playSound;
        }
        cc.log("ImageEffectLayer*** " + this.width +   " " + this.height);
    },

    setCallbackFinish: function (cb) {
        this.callBack = cb;
    },

    setPositionCoin: function (p) {
        this.positionCoin = p;
    },

    setData: function (timeOut, numEmitter) {
        this.timeCountOut = timeOut;
        this.emitter = numEmitter;
    },

    update: function (dt) {
        var coin;
        var isFinish = true;
        for (var i = 0; i < this.listCoin.length; i++) {
            coin = this.listCoin[i];
            if (coin.visible) {
                coin.updateCoin(dt);
                isFinish = false;
            }
        }
        if (this.numCoinNow > 0) {
            this.timeCount += dt;
            if (this.timeCount >= this.timeCountOut) {
                var num;
                if (this.typeEffect == ImageEffectLayer.TYPE_FLOW) {
                    num = ImageEffectLayer.NUM_COIN_EACH_TIME * this.timeCount;
                    this.timeCount = 0;
                }
                else if (this.typeEffect == ImageEffectLayer.TYPE_RAIN) {
                    num = ImageEffectLayer.NUM_COIN_RATE_RAIN * 0.05;
                    this.timeCount = 0;
                    //this.timeCount = ImageEffectLayer.TIME_OUT_COIN - 0.05;
                }
                num = this.emitter;
                for (i = 0; i < num; i++) {
                    //coin = this.listCoin[this.numCoinNow--];
                    this.numCoinNow = this.numCoinNow - 1;
                    coin = this.getCoinItem();
                    coin.start();
                    if (this.numCoinNow == 0)break;
                }
            }
            //cc.log("NUM " + this.listCoin.length);
        }
        else {
            if (isFinish) {
                this.unscheduleUpdate();
                if (this.callBack) {
                    this.callBack.call();
                }
                this.isRun = false;
            }
        }
    },

    startEffect: function (numEffect, type, srcPath) {
        if (this.isRun)this.stopEffect();
        var coin;
        this.srcPath = srcPath;
        this.typeEffect = type;
        this.numEffect = numEffect;
        this.numCoinNow = numEffect - 1;
        this.timeCount = 0;
        this.scheduleUpdate();
        this.setVisible(true);
        this.isRun = true;
        if (this.playSound) {
            this.runAction(cc.sequence(cc.delayTime(ImageEffectLayer.DELAY_PLAY_SOUND), cc.callFunc(function () {
                if (gamedata.sound) {
                    cc.audioEngine.playEffect(lobby_sounds.coinFall, false);
                }
            })));
        }

        this.timeCountOut = ImageEffectLayer.TIME_OUT_COIN;
        this.emitter = 10;
    },

    stopEffect: function () {
        for (var i = 0; i < this.listCoin.length; i++) {
            this.listCoin[i].setVisible(false);
        }
    },

    getCoinItem: function () {
        //return new CoinEffect();
        var coin;
        var i;
        for (i = 0; i < this.listCoin.length; i++) {
            if (!this.listCoin[i].isVisible()) {
                coin = this.listCoin[i];
                break;
            }
        }
        if (i == this.listCoin.length) {
            coin = new ImageEffect(this.srcPath, this.rate);
            this.listCoin.push(coin);
            this.addChild(coin);
        }
        coin.stop();
        coin.initCoin(type);
        return coin;
    }
});

ImageEffectLayer.RATE_SPEED_Y = 600;
ImageEffectLayer.DEFAULT_SPEED_Y = 850;
ImageEffectLayer.RATE_SPEED_X = 350;
ImageEffectLayer.RATE_SPEED_R = 10;
ImageEffectLayer.RATE_Position_X = 70;
ImageEffectLayer.RATE_Position_Y = 70;
ImageEffectLayer.MIN_SCALE = 0.32;
ImageEffectLayer.MAX_SCALE = 0.8;
ImageEffectLayer.RATE_JUMP_BACK = 0.5;
ImageEffectLayer.GRAVITY = 2300;
ImageEffectLayer.POSI = 90;
ImageEffectLayer.NAME_ANIMATION_COIN = "gold";
ImageEffectLayer.NUM_SPRITE_ANIMATION_COIN = 5;
ImageEffectLayer.NUM_COIN_EACH_TIME = 100;
ImageEffectLayer.NUM_COIN_RATE_RAIN = 100;
ImageEffectLayer.TIME_ANIMATION_COIN = 0.3;
ImageEffectLayer.TIME_OUT_COIN = 0.05;
ImageEffectLayer.TYPE_FLOW = 0;
ImageEffectLayer.TYPE_RAIN = 1;
ImageEffectLayer.DELAY_PLAY_SOUND = 0.3;


var ImageEffect = cc.Sprite.extend({

    ctor: function (srcPath, rate) {
        this._super(srcPath);
        this.rate = rate;
        //this.setTexture(srcPath);
        //this.setVisible(false);
    },


    initCoin: function (type) {
        this.isCollided = false; //kiem tra da cham dat 1 lan chua
        this.opacity = 0;
        var valueRan;
        if (type == ImageEffectLayer.TYPE_FLOW) {
            this.speedX = 2 * Math.random() * ImageEffectLayer.RATE_SPEED_X - ImageEffectLayer.RATE_SPEED_X;
            this.speedX = this.speedX * this.rate;
            //this.speedY = Math.random() * ImageEffectLayer.RATE_SPEED_Y + ImageEffectLayer.DEFAULT_SPEED_Y;
            var def = Math.random() * 800 + 800;
            def = def * this.rate;
            this.speedY = Math.sqrt(def * def - this.speedX * this.speedX);
            this.speedR = 2 * Math.random() * ImageEffectLayer.RATE_SPEED_R - ImageEffectLayer.RATE_SPEED_R;
            valueRan = Math.random() * (ImageEffectLayer.MAX_SCALE - ImageEffectLayer.MIN_SCALE) + ImageEffectLayer.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var p = cc.p(this.getParent().positionCoin.x + (Math.random() - 0.5) * ImageEffectLayer.RATE_Position_X * this.rate,
                this.getParent().positionCoin.y + (Math.random() - 0.5) * ImageEffectLayer.RATE_Position_Y * this.rate);
            this.setPosition(p);
        }
        else if (type == ImageEffectLayer.TYPE_RAIN) {
            this.speedX = 0;
            this.speedY = Math.random() * ImageEffectLayer.RATE_SPEED_X * this.rate;
            this.speedR = 2 * Math.random() * ImageEffectLayer.RATE_SPEED_R - ImageEffectLayer.RATE_SPEED_R;
            valueRan = Math.random() * (ImageEffectLayer.MAX_SCALE - ImageEffectLayer.MIN_SCALE) + ImageEffectLayer.MIN_SCALE;
            this.setScale(valueRan, valueRan);
            this.setRotation(Math.random() * 360);
            var parent = this.getParent();
            this.setPosition(Math.random() * parent.width, parent.height + this.height + Math.random() * ImageEffectLayer.RATE_Position_Y * this.rate);
        }
        this.setVisible(false);
    },

    start: function () {
        this.setVisible(true);
    },

    stop: function () {
        this.setVisible(false);
        this.stopAllActions();
    },

    updateCoin: function (dt) {

        var opa = this.opacity;
        opa += 1500 * dt;
        if (opa > 255)this.opacity = 255;
        else this.opacity = opa;

        this.x += this.speedX * dt;
        this.y += this.speedY * dt;
        this.speedY -= ImageEffectLayer.GRAVITY * dt * this.rate;
        this.rotation += this.speedR;
        //cham dat thi cho nhay len 1 lan roi roi tiep
        if (this.y < this.getContentSize().height / 2 && !this.isCollided) {
            this.isCollided = true;
            this.speedY = -this.speedY * (Math.random() * ImageEffectLayer.RATE_JUMP_BACK);
            this.speedX = 0;
        }
        else if (this.y + (this.height * this.scale) < 0 && this.isCollided) {
            this.stop();
        }
    }
});