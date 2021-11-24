/**
 * Created by Hunter on 7/24/2017.
 */

var audioEngine = cc.audioEngine;

// Model
var InteractConfig = cc.Class.extend({

    ctor: function () {
        this.items = [];

        var arTime = [24, 50, 34, 30, 47, 44, 23, 30, 28, 23, 0, 80, 0];
        // var arVip =     [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1];
        var arRotate =  [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0];
        var arSpecial = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1];
        var ratio = 0.04;



        if (Config.ENABLE_INTERACT_COVID){
            for (var j = 0; j < 2; j++){
                var covidObj = {};
                covidObj.id = -100 + j;
                covidObj.use = 0;
                covidObj.itemImg = "Interact/interact_covid/throwable_item_" + j + ".png";
                covidObj.throwImg = "Interact/interact_covid/throwable_item_" + j + ".png";
                //obj.animFrame = "run_" + obj.id;
                covidObj.animFrame = j + 101;
                covidObj.frameTime = (j ===0 ) ? 2 : 2.9;
                covidObj.vip = 0;
                covidObj.rotate = 0;
                covidObj.special = 0;
                covidObj.isCovidInteract = true;

                this.items.push(covidObj);
            }
        }

        for (var i = 0; i < arTime.length; i++) {
            var obj = {};
            obj.id = i + 1;
            obj.use = 0;
            obj.itemImg = "Interact/throwable_item_" + obj.id + ".png";
            obj.throwImg = "Interact/throwing_item_" + obj.id + ".png";
            //obj.animFrame = "run_" + obj.id;
            obj.animFrame = this.convertIdToAnimation(obj.id);
            obj.soundAction = "item_" + obj.id;
            obj.soundThrow = (obj.id == 11) ? 11 : 0;
            obj.frameTime = arTime[i] * ratio;
            obj.vip = 0;
            obj.rotate = arRotate[i];
            obj.special = arSpecial[i];

            this.items.push(obj);
        }

        this.items.sort(function (a, b) {
            if (a.vip > b.vip) return 1;
            if (a.vip < b.vip) return -1;
            return (a.id - b.id);
        });
    },

    getItem: function (id) {
        for (var i = 0, size = this.items.length; i < size; i++) {
            if (this.items[i].id == id) {
                return this.items[i];
            }
        }
        return null;
    },

    useItem: function (id) {
        var ite = this.getItem(id);
        if (ite) ite.use += 1;

        if (InteractConfig.AUTO_SORT_ITEM) {
            this.items.sort(function (a, b) {
                if (a.use > b.use) return -1;
                if (a.use < b.use) return 1;
                if (a.vip > b.vip) return 1;
                if (a.vip < b.vip) return -1;
                return (a.id - b.id);
            });
        }

        return ite;
    },

    convertIdToAnimation: function (id) {
        var arrayAnimation = ["votay", "cachua", "hoahong", "thuocno", "thuocno", "nemtrung", "kiss", "nemdep", "heart", "cungly", "water_1", "cup", ""];
        return arrayAnimation[id - 1];
    },
});

InteractConfig.VIP_ICON = "Interact/icon_vip.png";

InteractConfig.AUTO_SORT_ITEM = false;
InteractConfig.AUTO_SORT_EMOTION = false;

var INTERACT_KEY_NUM = 6;
var INTERACT_KEY_SEP = "#";
var INTERACT_KEY_PREFIX = "_____";
var INTERACT_MSG_SAMPLE = "_____#fromID#toID#interactID#timeId#_____";
var INTERACT_SCALE_ITEM = 0.65;

var InteractPlayer = cc.Class.extend({

    ctor: function () {
        this.interactConfig = new InteractConfig();
    },

    preloadResource: function () {
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Board/Interact/item_anim/skeleton.xml", "item_anim");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Board/Interact/item_anim/texture.plist", "item_anim");
        InteractSound.preloadAllSound();

        if (Config.ENABLE_INTERACT_COVID){
            db.DBCCFactory.getInstance().loadDragonBonesData("res/Board/Interact/interact_covid/skeleton.xml", "Covid");
            db.DBCCFactory.getInstance().loadTextureAtlas("res/Board/Interact/interact_covid/texture.plist", "Covid");
        }
    },

    openEnemyGUI: function (data) {
        sceneMgr.openGUI(UserInfoEnemyUI.className, UserInfoEnemyUI.TAG, UserInfoEnemyUI.TAG).setInfo(data);

    },

    openMyGUI: function () {
        sceneMgr.openGUI(CheckLogic.getUserInfoClassName(), LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO).setInfo(gamedata.userData);
    },

    doSendInteract: function (enemy, id) {
        var item = this.interactConfig.getItem(id);
        if (item && item.vip) {
            if (gamedata.userData.typeVip == 0) return;
        }

        var fromId = gamedata.userData.uID;

        var str = INTERACT_MSG_SAMPLE;
        str = StringUtility.replaceAll(str, "fromID", fromId);
        str = StringUtility.replaceAll(str, "toID", enemy);
        str = StringUtility.replaceAll(str, "interactID", id);
        str = StringUtility.replaceAll(str, "timeId", new Date().getTime());

        var cmd = new CmdSendChatString();
        cmd.putData(str);
        GameClient.getInstance().sendPacket(cmd);
        cmd.clean();
    },

    doReceiveInteract: function (fromId, toId, id) {
        var pStart = CheckLogic.getPosFromPlayer(fromId);
        var pEnd = CheckLogic.getPosFromPlayer(toId);
        this.playInteract(pStart, pEnd, id);
    },

    doReceiveInteractAll: function (fromId, id) {
        var arPosEnd = CheckLogic.getPlayerPosExcepted(fromId);
        var pStart = CheckLogic.getPosFromPlayer(fromId);

        if (arPosEnd && arPosEnd.length > 0) {
            for (var i = 0, size = arPosEnd.length; i < size; i++) {
                this.playInteract(pStart, arPosEnd[i], id);
            }
        }
    },

    detectInteractMessage: function (str, check) {
        if (check === undefined || check == null) check = true;

        try {
            if (str.indexOf(" ") > -1) return false;
            if (str.indexOf(INTERACT_KEY_SEP) == -1) return false;
            if (str.indexOf(INTERACT_KEY_PREFIX) == -1) return false;

            var ar = str.split(INTERACT_KEY_SEP);
            if (ar && ar.length == INTERACT_KEY_NUM) {
                if (ar[0] != INTERACT_KEY_PREFIX || ar[INTERACT_KEY_NUM - 1] != INTERACT_KEY_PREFIX) return false;

                var fromID = ar[1];
                var toID = ar[2];
                var interactID = ar[3];
                if (check) return true;

                if (toID == INTERACT_KEY_PREFIX) {
                    this.doReceiveInteractAll(fromID, interactID);
                }
                else {
                    this.doReceiveInteract(fromID, toID, interactID);
                }
                return true;
            }
        }
        catch (e) {
            return false;
        }

        return false;
    },

    canInteract: function (id) {
        var item = this.interactConfig.getItem(id);
        // if (item.vip) {
        //     if (gamedata.userData.typeVip == 0) return false;
        // }
        if (Config.ENABLE_INTERACT_COVID && item.isCovidInteract){
            return true;
        }

        return chatConfig.canUseItem(id, false);
        // return true;
    },

    playInteract: function (start, des, id) {
        fr.crashLytics.log("InteractPlayer.playInteract 0");
        if (!start || !des) return;
        if (start.x * start.y == 0) return;
        if (des.x * des.y == 0) return;
        var gui = sceneMgr.layerGUI;
        var scale = cc.director.getWinSize().width / Constant.WIDTH;
        scale = (scale > 1) ? 1 : scale;

        var timeFly = 1;
        var itemItr = interactPlayer.interactConfig.useItem(id);
        if (itemItr) {
            if (itemItr.special) {
                fr.crashLytics.log("InteractPlayer.playInteract 1");
                switch (itemItr.id) {
                    case InteractPlayer.ITEM_KICK_BALL:
                        this.startEffectKick(itemItr, start, des);
                        break;
                    case InteractPlayer.ITEM_FIREWORK:
                        this.startEffectFirework(itemItr, start, des);
                        break;
                }
            }
            else {
                fr.crashLytics.log("InteractPlayer.playInteract 2 " + JSON.stringify(des) + " " + JSON.stringify(start));
                InteractSound.playThrow(itemItr.soundThrow);

                var iteThrow = cc.Sprite.create(itemItr.throwImg);
                iteThrow.setScale(scale);
                iteThrow.setPosition(start);
                gui.addChild(iteThrow, InteractPlayer.ITEM_TAG);

                var pCX = Math.random() * cc.director.getWinSize().width;
                var pCY = Math.random() * cc.director.getWinSize().height;
                var posCenter = cc.p(pCX, pCY);
                var actMove = null;

                var targetX = des.x;
                var targetY = des.y;
                if (Config.ENABLE_INTERACT_COVID && itemItr.isCovidInteract && itemItr.animFrame % 2 === 0){
                    var distance = 90;
                    if (des.x < 100){
                        targetX += distance;
                        iteThrow.setFlippedX(true);
                    } else {
                        targetX -= distance;
                    }
                    targetY += 15;
                }

                if(itemItr.rotate) {
                    actMove = cc.spawn(cc.BezierTo.create(timeFly, [start, posCenter, des]),cc.rotateTo(timeFly,720));
                }
                else {
                    actMove = new cc.EaseSineIn(cc.BezierTo.create(timeFly, [start, posCenter, cc.p(targetX, targetY)]));
                }
                itemItr.des = des;

                var actHide = cc.removeSelf();
                var actAnim = cc.callFunc(this.playAnimInteract.bind(this, itemItr));
                iteThrow.setScale(INTERACT_SCALE_ITEM);
                iteThrow.runAction(cc.sequence(actMove, actHide, actAnim));
            }
        }
        fr.crashLytics.log("InteractPlayer.playInteract 3");
    },

    playAnimInteract: function (item) {
        fr.crashLytics.log("InteractPlayer.playAnimInteract");
        var end = item.des;
        var eff;
        if (item.isCovidInteract && Config.ENABLE_INTERACT_COVID){
            eff = db.DBCCFactory.getInstance().buildArmatureNode("Covid");
            if (item.animFrame === 101 || item.animFrame === 103){
                item.animFrame = (Math.random() > 0.5) ? 101 : 103;
            }

            if (item.animFrame === 102 || item.animFrame === 104){
                item.animFrame = (end.x < 100) ? 104 : 102;
            }
        } else {
            eff = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
        }
        if (eff) {
            InteractSound.playAction(item.soundAction);

            sceneMgr.layerGUI.addChild(eff);
            eff.setScale(INTERACT_SCALE_ITEM);
            eff.setPosition(end);
            eff.getAnimation().gotoAndPlay(item.animFrame, -1, -1, 1);
            cc.log("playAnimInteract: ", item.animFrame);

            eff.setCompleteListener(function () {
                this.removeFromParent(true);
            }.bind(eff));
            // eff.runAction(cc.sequence(cc.delayTime(item.frameTime), cc.removeSelf()));
        }
    },

    startEffectKick: function (item, start, des) {
        fr.crashLytics.log("InteractPlayer.startEffectKick 0");
        var eff1 = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
        if (eff1) {
            fr.crashLytics.log("InteractPlayer.startEffectKick 1");
            sceneMgr.layerGUI.addChild(eff1);
            eff1.setScale(INTERACT_SCALE_ITEM);
            var startPos = cc.p(0, 0);
            if (start.x > des.x) {
                startPos.x = start.x - 30;
                startPos.y = start.y + 35;
            }
            else {
                startPos.x = start.x + 50;
                startPos.y = start.y + 35;
            }
            eff1.setPosition(startPos);
            eff1.data = {item: item, startPos: startPos, des: des};
            eff1.getAnimation().gotoAndPlay("bongxoay", -1, 100000, -1);
            var actAnim = cc.callFunc(this.onFinishEffectKick1.bind(this, eff1));
            eff1.runAction(cc.sequence(cc.delayTime(0.7), actAnim));
        }

        var eff = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
        if (eff) {
            fr.crashLytics.log("InteractPlayer.startEffectKick 2");
            InteractSound.playAction("kick");
            sceneMgr.layerGUI.addChild(eff);
            eff.setScale(INTERACT_SCALE_ITEM);
            if (start.x > des.x) {
                eff.setScaleX(-eff.getScaleX());
            }
            eff.setPosition(start);
            eff.getAnimation().gotoAndPlay("sutbong", -1, -1, -1);
            eff.setCompleteListener(this.onFinishEffectKick.bind(this, eff));
        }

    },

    onFinishEffectKick1: function(eff) {
        var timeFly = 1.0;
        eff.getAnimation().gotoAndPlay("bongxoay", -1, -1, -1);

        var pCX = Math.random() * cc.director.getWinSize().width;
        var pCY = Math.random() * cc.director.getWinSize().height;
        var posCenter = cc.p(pCX, pCY);
        var actMove = null;

        var itemItr = eff.data.item;
        var start = eff.data.startPos;
        var des = eff.data.des;

        if(itemItr.rotate) {
            //actMove = cc.spawn(new cc.EaseSineIn(cc.BezierTo.create(timeFly, [start, posCenter, des])), cc.rotateTo(timeFly,720));
            actMove = cc.spawn(new cc.BezierTo(timeFly, [start, posCenter, des]), cc.rotateTo(timeFly,720));
            //   actMove = cc.spawn(cc.MoveTo(timeFly, des), cc.rotateTo(timeFly,720));
        }
        else {
            actMove = new cc.BezierTo(timeFly, [start, posCenter, des]);
        }

        var actHide = cc.removeSelf();
        var actAnim = cc.callFunc(this.onFinishBall.bind(this, eff.data.des));
        var actScale = cc.scaleTo(timeFly, INTERACT_SCALE_ITEM * 0.8);
        eff.setScale(INTERACT_SCALE_ITEM);
        eff.runAction(cc.sequence(cc.spawn(actMove, actScale), actHide, actAnim));
    },

    onFinishEffectKick: function(eff) {
        eff.runAction(cc.sequence(cc.fadeOut(3.0),cc.removeSelf()));
    },

    onFinishBall: function (end) {
        var eff = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
        if (eff) {
            //  InteractSound.playAction(item.soundAction);

            sceneMgr.layerGUI.addChild(eff);
            eff.setScale(INTERACT_SCALE_ITEM);
            eff.setPosition(end);
            if (Math.random() > 0.5) {
                eff.getAnimation().gotoAndPlay("sutvaogon", -1, -1, -1);
                InteractSound.playAction("onGoal");
            }
            else {
                eff.getAnimation().gotoAndPlay("sutrangoai", -1, -1, -1);
                InteractSound.playAction("outGoal");
            }

            // eff.runAction(cc.sequence(cc.delayTime(item.frameTime), cc.removeSelf()));
            eff.setCompleteListener(this.removeEffect.bind(this, eff));
        }
    },

    startEffectFirework: function (item, start, des) {
        fr.crashLytics.log("startEffectFirework");
        for (var i = 0; i < 3; i++) {
            var eff = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
            if (eff) {
                //InteractSound.playAction(item.soundAction);
                sceneMgr.layerGUI.addChild(eff);
                eff.setScale(INTERACT_SCALE_ITEM);
                var startPos;
                startPos = cc.p(start.x, start.y);
                //if (i == 0) {
                //    startPos = cc.p(start.x, start.y);
                //
                //}
                //else if (i == 1) {
                //    startPos = cc.p(start.x - 15, start.y + 15);
                //}
                //else {
                //    startPos = cc.p(start.x + 18, start.y - 13);
                //}
                var desPos = cc.p(des.x - 40 + Math.random() * 70, des.y - 40 + Math.random() * 70);
                var direc = cc.p(desPos.x - startPos.x, desPos.y - startPos.y);
                var rota = - Math.atan2(direc.y, direc.x) / Math.PI * 180;
                rota = rota + 30;
                var isFlip = rota > -90 && rota < 90;
                var dis = Math.sqrt(direc.x*direc.x + direc.y*direc.y);

                var timeFly = dis / 560;
                //tinh diem o giua
                var cosX = rota / 180 * Math.PI;    //dung lai bien de tinh goc
                var sinX = Math.sin(cosX);
                cosX = Math.cos(cosX);
                if(!isFlip)sinX = -sinX;
                dis = dis * 0.1;
                var between = cc.p((startPos.x + desPos.x)/ 2 + dis * sinX, (startPos.y + desPos.y)/ 2 + Math.abs(dis * cosX) );


                eff.setPosition(startPos);
                eff.getAnimation().gotoAndPlay("phao" + (i + 1), -1, -1, -1);

                //  iteThrow.setScale((Math.random() + 1) * INTERACT_SCALE_ITEM, (Math.random() * 0.2 + 0.8) * INTERACT_SCALE_ITEM);
                eff.setOpacity(0);
                // eff.setFlippedY(!isFlip);
                eff.setRotation(rota);

                var actHide = cc.removeSelf();
                sceneMgr.layerGUI.desPos = desPos;
                var actAnim = cc.callFunc(this.onFinishFirework.bind(this, sceneMgr.layerGUI.desPos));
                //var action = new cc.EaseSineIn(cc.BezierTo.create(timeFly, [startPos, between, desPos]));
                var action = new cc.EaseSineIn(cc.moveTo(timeFly, desPos));
                var actMove  = cc.spawn(action, cc.sequence(cc.fadeIn(0.1), cc.delayTime(timeFly - 0.35), actAnim));

                eff.runAction(cc.sequence(cc.delayTime(i * 0.1), actMove, cc.fadeOut(0.1), actHide));
                //  EffectMgr.getInstance().arrayInteract.push(eff);

                //
                //  var pCX = Math.random() * cc.director.getWinSize().width;
                //  var pCY = Math.random() * cc.director.getWinSize().height;
                //  var posCenter = cc.p(pCX, pCY);
                //  var actMove = cc.BezierTo.create(timeFly, [startPos, posCenter, desPos]);
                //
                //  var actHide = cc.removeSelf();
                //  var actAnim = cc.callFunc(this.onFinishFirework.bind(this, item, desPos));
                ////  iteThrow.setScale(INTERACT_SCALE_ITEM);
                //  eff.runAction(cc.sequence(actMove, actHide, actAnim));
            }
        }
    },

    onFinishFirework: function (desPos) {
        fr.crashLytics.log("onFinishFirework " + JSON.stringify(desPos));
        var eff = db.DBCCFactory.getInstance().buildArmatureNode("item_anim");
        if (eff) {
            InteractSound.playAction("firework");
            sceneMgr.layerGUI.addChild(eff);
            eff.setScale(INTERACT_SCALE_ITEM);
            eff.getAnimation().gotoAndPlay("phaohoa", -1, -1, 1);
            eff.setPosition(desPos);
            eff.setCompleteListener(this.removeEffect.bind(this, eff));
        }
    },

    removeEffect: function (eff) {
        fr.crashLytics.log("removeEffect");
        eff.removeFromParent(true);
    }
});

InteractPlayer.ITEM_TAG = 99999;
InteractPlayer.ITEM_KICK_BALL = 13;
InteractPlayer.ITEM_FIREWORK = 5;

InteractPlayer._inst = null;
InteractPlayer.instance = function () {
    if (!InteractPlayer._inst) {
        InteractPlayer._inst = new InteractPlayer();
    }
    return InteractPlayer._inst;
};

interactPlayer = InteractPlayer.instance();

// UI
var InteractItemCell = cc.TableViewCell.extend({
    ctor: function () {
        this._super();

        var jsonLayout = ccs.load("InteractItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.initGUI();
    },

    initGUI: function () {
        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.item = ccui.Helper.seekWidgetByName(this._layout, "item");
        this.vip = ccui.Helper.seekWidgetByName(this._layout, "vip");
        this.lb = ccui.Helper.seekWidgetByName(this._layout, "lb");
    },

    setInfo: function (ite) {
        this.info = ite;

        this.item.removeAllChildren();

        var sp = cc.Sprite.create(ite.itemImg);
        this.item.addChild(sp);
        sp.setPosition(this.item.getContentSize().width / 2, this.item.getContentSize().height / 2);

        var canUseItem = chatConfig.canUseItem(ite.id, false);
        if (Config.ENABLE_INTERACT_COVID && ite.isCovidInteract){
            canUseItem = true;
        }

        this.vip.setVisible(!canUseItem);
        sp.setOpacity(this.vip.isVisible() ? 75 : 255);

        this.lb.setString(ite.id + "|" + ite.use);
        this.lb.setVisible(false);
    },
});

var UserInfoEnemyUI = BaseLayer.extend({

    ctor: function () {
        this.btnAddFriend = null;
        this.btnRemoveFriend = null;
        this.btnSendMessage = null;

        this.enableTouchList = false;

        this._super(UserInfoEnemyUI.className);
        this.initWithBinaryFile("UserInfoEnemyUI.json");
    },

    initGUI: function () {
        var bg = this.getControl("bg");
        this._bg = bg;

        this.customButton("btnQuit", UserInfoEnemyUI.BTN_CLOSE, bg);
        this.btnAddFriend = this.customButton("btnAddFriend", UserInfoEnemyUI.BTN_ADD, bg);
        this.btnSendMessage = this.customButton("btnSendMessage", UserInfoEnemyUI.BTN_MESSAGE, bg);
        this.btnRemoveFriend = this.customButton("btnRemoveFriend", UserInfoEnemyUI.BTN_REMOVE, bg);
        this.btnBlackList = this.customButton("btnBlackList", UserInfoEnemyUI.BTN_BLACK_LIST, this._bg);
        if (!Config.ENABLE_BLACK_LIST) {
            if (this.btnBlackList)
                this.btnBlackList.setVisible(false);
        }

        // add avatar
        var bgAvatar = this.getControl("bgAvatar");
        this._uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        var size = bgAvatar.getContentSize();
        this._uiAvatar.setPosition(cc.p(size.width / 2, size.height / 2));
        bgAvatar.addChild(this._uiAvatar);

        // init list
        this.panel = this.getControl("list");

        if (event.isInEvent(Event.MID_AUTUMN)) {
            var add = 100;
            this.listItem = new cc.TableView(this, cc.size(this.panel.getContentSize().width - add, this.panel.getContentSize().height));
            this.listItem.setPositionX(this.listItem.getPositionX() + 100);
            midAutumn.addBtnSendLamp(this);
        }
        else {
            this.listItem = new cc.TableView(this, this.panel.getContentSize());
        }
        this.listItem.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this.listItem.setVerticalFillOrder(0);
        this.listItem.setDelegate(this);
        this.panel.addChild(this.listItem);
        this.listItem.reloadData();

        // default
        this.enableFog();
        this.setBackEnable(true);
    },

    setInfo: function (inf) {
        this._user = inf;

        // check zname
        if (!this._user.zName) {
            this._user.zName = this._user.displayName;
        }

        // load info
        try {
            // var lv = gamedata.gameConfig.getLevel(this._user.levelScore);
            this.getControl("name", this._bg).setString(this._user.displayName);
            this.getControl("win", this._bg).setString(StringUtility.pointNumber(this._user.winCount));
            this.getControl("lost", this._bg).setString(StringUtility.pointNumber(this._user.lostCount));
            this.getControl("taisan", this._bg).setString(StringUtility.standartNumber(this._user.bean) + " $");
            // this.getControl("danhthu", this._bg).setString(gamedata.gameConfig.levelName[lv]);
            this.getControl("level", this._bg).setString(gamedata.gameConfig.getLevelString(this._user.level, this._user.levelExp));
            this.getControl("zingid", this._bg).setString(this._user.uID);

            var isFriend = chatMgr.checkIsFriend(this._user.uID);
            this.btnAddFriend.setVisible(!isFriend && this._user.uID != gamedata.userData.uID);
            this.btnRemoveFriend.setVisible(isFriend && this._user.uID != gamedata.userData.uID);
            this.btnSendMessage.setVisible(this._user.uID != gamedata.userData.uID);
            // this.btnSendMessage.setVisible(false);
            this._uiAvatar.asyncExecuteWithUrl(this._user.uID, this._user.avatar);
        }
        catch (e) {

        }

        // load version
        try {
            this.getControl("version", this._bg).setString(NativeBridge.getVersionString());
        }
        catch (e) {

        }

        if (Config.ENABLE_BLACK_LIST) {
            this.updateButtonBlackList();
        }
    },

    updateButtonBlackList: function() {
        if (blackList.hasInBlackList(this._user.uID)) {
            this.btnBlackList.loadTextures("BlackList/iconBlackListDisable.png", "BlackList/iconBlackListDisable.png");
            this.state = UserInfoGUI.DISABLE_BLACK_LIST;
        }
        else {
            this.btnBlackList.loadTextures("BlackList/iconBlackListEnable.png", "BlackList/iconBlackListEnable.png");
            this.state = UserInfoGUI.ENABLE_BLACK_LIST;
        }
    },

    onEnterFinish: function () {
        this.enableFog();
        this.setShowHideAnimate(this._bg, true);
        this.listItem.reloadData();
        this.listItem.setTouchEnabled(false);
        this.enableTouchList = false;
    },

    finishAnimate: function () {
        this.enableTouchList = true;
        this.listItem.setTouchEnabled(true);
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case UserInfoGUI.BTN_CLOSE:
            {
                break;
            }
            case UserInfoGUI.BTN_ADD:
            {
                chatMgr.addFriend(this._user.uID);
                this.onBack();
                break;
            }
            case UserInfoGUI.BTN_REMOVE:
            {
                chatMgr.removeFriend(this._user.uID);
                break;
            }
            case UserInfoGUI.BTN_MESSAGE:
            {
                chatMgr.doMessageFriend(this._user);
                break;
            }
            case UserInfoGUI.BTN_BLACK_LIST:
            {

                // add nguoi nay vao danh sach black list
                if (this.state == UserInfoGUI.ENABLE_BLACK_LIST) {
                    if (blackList.arrayBlackList.length < BlackListManager.MAX_PREVENT) {
                        sceneMgr.openGUI(ConfirmBlackUserGUI.className, BlackListGUI.CONFIRM_BLACK_USER_GUI, BlackListGUI.CONFIRM_BLACK_USER_GUI).setInfo(this._user.displayName, this._user.uID, this._user.avatar);
                        cc.sys.localStorage.setItem("blackListBubble2", 1);
                    }
                    else {
                        var s = localized("BLACK_LIST_MAX_PREVENT");
                        s = StringUtility.replaceAll(s, "@num", BlackListManager.MAX_PREVENT);
                        ToastFloat.makeToast(ToastFloat.SHORT, s);
                    }
                }
                else {
                    blackList.sendRemoveBlackList(this._user.uID);
                    cc.sys.localStorage.setItem("blackListBubble3", 1);
                }
                break;
            }
        }

        this.onBack();
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new InteractItemCell();
        }
        cell.setInfo(interactPlayer.interactConfig.items[idx]);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(95, 95);
    },

    numberOfCellsInTableView: function (table) {
        var interactConfig = chatConfig.getInteractConfig();
        var length = 0;
        for (var key in interactConfig){
            length += interactConfig[key].length;
        }
        return length;
    },

    tableCellTouched: function (table, cell) {
        if (!this.enableTouchList) return;

        try {
            if (interactPlayer.canInteract(cell.info.id)) {
                if (gamedata.userData.uID == this._user.uID)
                    interactPlayer.doSendInteract(INTERACT_KEY_PREFIX, cell.info.id);
                else
                    interactPlayer.doSendInteract(this._user.uID, cell.info.id);

                this.listItem.reloadData();

                this.onBack();
            }
            else {
                // Toast.makeToast(Toast.SHORT, LocalizedString.to("_VIP_ONLY_USE_"));
                var text = localized("VIP_NEED_TO_USE_INTERACT");
                text = StringUtility.replaceAll(text, "@number", NewVipManager.getInstance().getLevelCanUseItem());
                Toast.makeToast(Toast.SHORT, text);
            }
        }
        catch (e) {

        }
    },

    onBack: function () {
        this.listItem.setTouchEnabled(false);
        this.isKeypadEnabled = false;
        this.onClose();
    }
});

UserInfoEnemyUI.className = "UserInfoEnemyUI";
UserInfoEnemyUI.TAG = 300;

UserInfoEnemyUI.BTN_CLOSE = 1;
UserInfoEnemyUI.BTN_ADD = 2;
UserInfoEnemyUI.BTN_REMOVE = 3;
UserInfoEnemyUI.BTN_MESSAGE = 4;
UserInfoEnemyUI.BTN_BLACK_LIST = 5;

// SOUND
var InteractSound = function () {
};

InteractSound.playAction = function (s) {
    if (gamedata.sound && rInteractSound[s]) {
        audioEngine.playEffect(CheckLogic.getPathResourceGame() + rInteractSound[s], false);
    }
};

InteractSound.playThrow = function (s) {
    if (!gamedata.sound) return;

    if (s == 0) {
        var ar = [0, 5];
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
    item_12: "Interact/sound/CUP.mp3",
    throw_item_0: "Interact/sound/table_throwing_item.mp3",
    throw_item_5: "Interact/sound/table_throwing_item_5.mp3",
    throw_item_11: "Interact/sound/table_throwing_item_11.mp3",
    kick: "Interact/sound/kick.mp3",
    onGoal: "Interact/sound/goal.mp3",
    outGoal: "Interact/sound/dap_xa_ngang.mp3",
    firework: "Interact/sound/firework.mp3",
};