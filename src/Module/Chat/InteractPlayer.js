/**
 * Created by Hunter on 7/24/2017.
 */

var audioEngine = cc.audioEngine;

var InteractConfig = cc.Class.extend({

    ctor: function () {
        this.items = [];

        var arTime = [24, 50, 34, 30, 47, 44, 23, 30, 28, 23, 0, 80, 0];
        var arRotate =  [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0];
        var ratio = 0.04;

        for (var j = 0; j < 2; j++){
            var covidObj = {};
            covidObj.id = -100 + j;
            covidObj.throwImg = "Interact/interact_covid/throwable_item_" + j + ".png";
            covidObj.animFrame = j + 101;
            covidObj.soundThrow = 0;
            covidObj.frameTime = (j === 0) ? 2 : 2.9;
            covidObj.rotate = 0;

            this.items.push(covidObj);
        }

        for (var i = 0; i < arTime.length; i++) {
            var obj = {};
            obj.id = i + 1;
            obj.throwImg = "Interact/throwing_item_" + obj.id + ".png";
            obj.animFrame = this.convertIdToAnimation(obj.id);
            obj.soundAction = "item_" + obj.id;
            obj.soundThrow = (obj.id == 11) ? 11 : 0;
            obj.frameTime = arTime[i] * ratio;
            obj.rotate = arRotate[i];

            this.items.push(obj);
        }
    },

    getItem: function (id) {
        for (var i = 0, size = this.items.length; i < size; i++) {
            if (this.items[i].id == id) {
                return this.items[i];
            }
        }
        return null;
    },

    convertIdToAnimation: function (id) {
        var arrayAnimation = ["votay", "cachua", "hoahong", "thuocno", "thuocno", "nemtrung", "kiss", "nemdep", "heart", "cungly", "water_1", "cup", ""];
        return arrayAnimation[id - 1];
    }
});

var InteractPlayer = cc.Class.extend({

    ctor: function () {
        this.interactConfig = new InteractConfig();
        this.currentParent = null;
        this.currentScale = 0;
    },

    preloadResource: function () {
        db.DBCCFactory.getInstance().loadDragonBonesData("Interact/item_anim/skeleton.xml", "item_anim");
        db.DBCCFactory.getInstance().loadTextureAtlas("Interact/item_anim/texture.plist", "item_anim");
        InteractSound.preloadAllSound();

        db.DBCCFactory.getInstance().loadDragonBonesData("Interact/interact_covid/skeleton.xml", "Covid");
        db.DBCCFactory.getInstance().loadTextureAtlas("Interact/interact_covid/texture.plist", "Covid");
    },

    detectInteractMessage: function (str) {

        try {
            if (str.indexOf(" ") > -1) return false;
            if (str.indexOf(InteractPlayer.INTERACT_KEY_SEP) == -1) return false;
            if (str.indexOf(InteractPlayer.INTERACT_KEY_PREFIX) == -1) return false;

            var ar = str.split(InteractPlayer.INTERACT_KEY_SEP);
            if (ar && ar.length == InteractPlayer.INTERACT_KEY_NUM) {
                if (ar[0] != InteractPlayer.INTERACT_KEY_PREFIX || ar[InteractPlayer.INTERACT_KEY_NUM - 1] != InteractPlayer.INTERACT_KEY_PREFIX) return false;
                return true;
            }
        }
        catch (e) {
            return false;
        }

        return false;
    },

    playInteract: function (start, des, id, scale, parent) {
        if (!start || !des) return;
        if (start.x * start.y == 0 || des.x * des.y == 0) return;
        this.currentScale = scale || InteractPlayer.INTERACT_SCALE_ITEM;
        this.currentParent = parent || sceneMgr.layerGUI;
        start = this.currentParent.convertToNodeSpace(start);
        des = this.currentParent.convertToNodeSpace(des);

        var timeFly = 1;
        var itemItr = interactPlayer.interactConfig.getItem(id);
        if (itemItr) {
            switch(itemItr.id){
                case 13:
                    this.startEffectKick(itemItr, start, des);
                    break;
                case 5:
                    this.startEffectFirework(itemItr, start, des);
                    break;
                default:
                {
                    InteractSound.playThrow(itemItr.soundThrow);

                    var iteThrow = new cc.Sprite(itemItr.throwImg);
                    iteThrow.setScale(this.currentScale);
                    iteThrow.setPosition(start);
                    this.currentParent.addChild(iteThrow, InteractPlayer.ITEM_TAG);

                    var pCX = Math.random() * cc.winSize.width;
                    var pCY = Math.random() * cc.winSize.height;
                    var posCenter = cc.p(pCX, pCY);
                    var actMove = null;

                    if (itemItr.rotate)
                        actMove = cc.spawn(
                            cc.bezierTo(timeFly, [start, posCenter, des]),
                            cc.rotateTo(timeFly, 720)
                        );
                    else
                        actMove = cc.bezierTo(timeFly, [start, posCenter, des]).easing(cc.easeSineIn());
                    itemItr.des = des;

                    iteThrow.runAction(cc.sequence(
                        actMove,
                        cc.removeSelf(),
                        cc.callFunc(this.playAnimInteract.bind(this, itemItr))
                    ));
                }
            }
        }
    },

    playAnimInteract: function (item) {
        var end = item.des;
        var eff;
        if (item.id < 0){
            eff = db.DBCCFactory.getInstance().buildArmatureNode("Covid");
            if (item.id == -100) item.animFrame = (Math.random() > 0.5) ? 101 : 103;
            if (item.id == -99) item.animFrame = (end.x < 100) ? 104 : 102;
        } else {
            eff = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
        }
        if (eff) {
            InteractSound.playAction(item.soundAction);

            this.currentParent.addChild(eff, InteractPlayer.ITEM_TAG);
            eff.setScale(this.currentScale);
            eff.setPosition(end);
            eff.getAnimation().gotoAndPlay(item.animFrame, -1, -1, 1);

            eff.setCompleteListener(function(){
                this.runAction(cc.sequence(
                    cc.fadeOut(0.25),
                    cc.removeSelf()
                ))
            }.bind(eff));
        }
    },

    startEffectKick: function (item, start, des) {
        var eff = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
        if (eff) {
            this.currentParent.addChild(eff, InteractPlayer.ITEM_TAG);
            eff.setScale(this.currentScale);
            var startPos = cc.p(0, 0);
            if (start.x > des.x) {
                startPos.x = start.x - 30;
                startPos.y = start.y + 35;
            }
            else {
                startPos.x = start.x + 50;
                startPos.y = start.y + 35;
            }
            eff.setPosition(startPos);
            eff.data = {item: item, startPos: startPos, des: des};
            eff.getAnimation().gotoAndPlay("bongxoay", -1, 100000, -1);
            eff.runAction(cc.sequence(cc.delayTime(0.7), cc.callFunc(this.onFinishEffectKick.bind(this, eff))));
        }

        var effKick = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
        if (effKick) {
            InteractSound.playAction("kick");
            this.currentParent.addChild(effKick, InteractPlayer.ITEM_TAG);
            effKick.setScale(this.currentScale);
            if (start.x > des.x) {
                effKick.setScaleX(-effKick.getScaleX());
            }
            effKick.setPosition(start);
            effKick.getAnimation().gotoAndPlay("sutbong", -1, -1, -1);
            effKick.setCompleteListener(function(){
                this.runAction(cc.sequence(
                    cc.fadeOut(1),
                    cc.removeSelf()
                ))
            }.bind(effKick));
        }

    },

    onFinishEffectKick: function(eff) {
        var timeFly = 1.0;
        eff.getAnimation().gotoAndPlay("bongxoay", -1, -1, -1);

        var pCX = Math.random() * cc.director.getWinSize().width;
        var pCY = Math.random() * cc.director.getWinSize().height;
        var posCenter = cc.p(pCX, pCY);
        var actMove;

        var itemItr = eff.data.item;
        var start = eff.data.startPos;
        var des = eff.data.des;

        if(itemItr.rotate)
            actMove = cc.spawn(new cc.BezierTo(timeFly, [start, posCenter, des]), cc.rotateTo(timeFly,720));
        else
            actMove = new cc.BezierTo(timeFly, [start, posCenter, des]);

        eff.setScale(this.currentScale);
        eff.runAction(cc.sequence(
            cc.spawn(
                actMove,
                cc.scaleTo(timeFly, this.currentScale * 0.8)
            ),
            cc.removeSelf(),
            cc.callFunc(this.onFinishBall.bind(this, eff.data.des))
        ));
    },

    onFinishBall: function (end) {
        var eff = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
        if (eff) {
            this.currentParent.addChild(eff, InteractPlayer.ITEM_TAG);
            eff.setScale(this.currentScale);
            eff.setPosition(end);
            if (Math.random() > 0.5) {
                eff.getAnimation().gotoAndPlay("sutvaogon", -1, -1, -1);
                InteractSound.playAction("onGoal");
            }
            else {
                eff.getAnimation().gotoAndPlay("sutrangoai", -1, -1, -1);
                InteractSound.playAction("outGoal");
            }

            eff.setCompleteListener(function(){
                this.runAction(cc.sequence(
                    cc.fadeOut(0.25),
                    cc.removeSelf()
                ))
            }.bind(eff));
        }
    },

    startEffectFirework: function (item, start, des) {
        for (var i = 0; i < 3; i++) {
            var eff = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
            if (eff) {
                this.currentParent.addChild(eff, InteractPlayer.ITEM_TAG);
                var startPos = cc.p(start.x, start.y);
                var desPos = cc.p(des.x + (-25 + Math.random() * 50) * this.currentScale, des.y + (-25 + Math.random() * 50) * this.currentScale);
                var direc = cc.p(desPos.x - startPos.x, desPos.y - startPos.y);
                var rota = -(Math.atan2(direc.y, direc.x) / Math.PI * 180 - 45);
                var timeFly = Math.sqrt(direc.x*direc.x + direc.y*direc.y) / 500;

                eff.getAnimation().gotoAndPlay("phao" + (i + 1), -1, -1, -1);
                eff.setPosition(startPos);
                eff.setScale(this.currentScale);
                eff.setOpacity(0);
                eff.setRotation(rota);

                eff.runAction(cc.sequence(
                    cc.delayTime(i * 0.1),
                    cc.spawn(
                        cc.moveTo(timeFly, desPos).easing(cc.easeSineIn()),
                        cc.sequence(
                            cc.fadeIn(0.1),
                            cc.delayTime(timeFly - 0.2),
                            cc.callFunc(this.onFinishFirework.bind(this, desPos)),
                            cc.fadeOut(0.1)
                        )
                    ),
                    cc.removeSelf()
                ))
            }
        }
    },

    onFinishFirework: function (desPos) {
        var eff = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
        if (eff) {
            InteractSound.playAction("firework");
            this.currentParent.addChild(eff);
            eff.setScale(this.currentScale);
            eff.getAnimation().gotoAndPlay("phaohoa", -1, -1, 1);
            eff.setPosition(desPos);
            eff.setCompleteListener(function(){
                this.removeFromParent();
            }.bind(eff));
        }
    }
});

InteractPlayer.ITEM_TAG = 99999;
InteractPlayer.INTERACT_KEY_NUM = 6;
InteractPlayer.INTERACT_KEY_SEP = "#";
InteractPlayer.INTERACT_KEY_PREFIX = "_____";
InteractPlayer.INTERACT_SCALE_ITEM = 1;

InteractPlayer._inst = null;
InteractPlayer.instance = function () {
    if (!InteractPlayer._inst) {
        InteractPlayer._inst = new InteractPlayer();
    }
    return InteractPlayer._inst;
};

interactPlayer = InteractPlayer.instance();

// SOUND
var InteractSound = function () {
};

InteractSound.playAction = function (s) {
    if (settingMgr.sound && rInteractSound[s]) {
        audioEngine.playEffect(CheckLogic.getPathResourceGame() + rInteractSound[s], false);
    }
};

InteractSound.playThrow = function (s) {
    if (!settingMgr.sound) return;

    if (s == 0) {
        var ar = [0, 1];
        var rndIdx = parseInt(Math.random() * 10) % ar.length;
        s = ar[rndIdx];
    }

    if (rInteractSound["throw_item_" + s])
        audioEngine.playEffect(rInteractSound["throw_item_" + s], false);
};

InteractSound.preloadAllSound = function () {
    for (var s in rInteractSound) {
        if (cc.sys.isNative) audioEngine.preloadEffect(rInteractSound[s]);
    }

    audioEngine.stopAllEffects();
};

rInteractSound = {
    item_1: "Interact/sound/table_item_1.mp3",
    item_2: "Interact/sound/table_item_2.mp3",
    item_3: "Interact/sound/table_item_3.mp3",
    item_4: "Interact/sound/table_item_4.mp3",
    item_5: "Interact/sound/table_item_5.mp3",
    item_6: "Interact/sound/table_item_6.mp3",
    item_7: "Interact/sound/table_item_7.mp3",
    item_8: "Interact/sound/table_item_8.mp3",
    item_9: "Interact/sound/table_item_9.mp3",
    item_10: "Interact/sound/table_item_10.mp3",
    item_11: "Interact/sound/table_item_11.mp3",
    item_12: "Interact/sound/table_item_12.mp3",
    throw_item_0: "Interact/sound/table_throwing_item_0.mp3",
    throw_item_1: "Interact/sound/table_throwing_item_1.mp3",
    throw_item_11: "Interact/sound/table_throwing_item_11.mp3",
    kick: "Interact/sound/kick.mp3",
    onGoal: "Interact/sound/goal.mp3",
    outGoal: "Interact/sound/dap_xa_ngang.mp3",
    firework: "Interact/sound/firework.mp3"
};