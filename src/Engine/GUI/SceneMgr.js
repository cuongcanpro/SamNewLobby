/*
 * SCENE MRG
 * - OpenGUI as Scene
 * - Loading Toast
 * - Dialog
 */
var LOADING_TAG = 9998;
var WAITING_TAG = 9997;

var BUBBLE_TOAST_TAG = 99997;
var TOAST_FLOAT_TAG = 99998;
var LOADING_FLOAT_TAG = 99999;
var TOOLTIP_FLOAT_TAG = 99996;

// Scene and Manager
var SceneMgr = cc.Class.extend({

    ctor: function () {
        this.ccWhite = cc.color(203, 204, 206, 0);
        this.ccYellow = cc.color(251, 212, 93, 0);
        this.ccGreen = cc.color(9, 212, 9, 0);
        this.ccBlue = cc.color(132, 140, 220, 0);

        this.curGui = "";
        this.arGuis = {};
        this.arPopups = {};

        this.layerGUI = null;
        this.layerSystem = null;

        this.nDesignResolution = 0; // 0 : WIDTH, 1 : HEIGHT

        this.ignoreGuis = [];
    },

    getRunningScene: function () {
        var currentScene = cc.director.getRunningScene();
        if (currentScene instanceof cc.TransitionScene) {
            currentScene = cc.director.getRunningScene().getInScene();
        }
        return currentScene;
    },

    getMainLayer: function () {
        var curScene = this.getRunningScene();
        if (curScene === undefined || curScene == null) return null;
        return curScene.getMainLayer();
    },

    checkMainLayer: function (layer) {
        return (this.getMainLayer() instanceof layer);
    },

    addLoading: function (text, fog) {
        var loading = this.layerGUI.getChildByTag(LOADING_TAG);
        if (loading) {
            loading.stopAllActions();
            loading.removeFromParent();
        }

        var loading = new Loading(text, fog);
        this.layerGUI.addChild(loading);
        loading.setLocalZOrder(LOADING_TAG);
        loading.setTag(LOADING_TAG);
        return loading;
    },

    clearLoading: function () {

        var loading = this.layerGUI.getChildByTag(LOADING_TAG);
        if (loading) {
            loading.stopAllActions();
            loading.removeFromParent();
        }
    },

    addWaiting: function () {
        var loading = this.layerGUI.getChildByTag(WAITING_TAG);
        if (loading) {
            loading.stopAllActions();
            loading.removeFromParent();
        }

        var loading = new Waiting();
        this.layerGUI.addChild(loading);

        loading.setLocalZOrder(WAITING_TAG);
        loading.setTag(WAITING_TAG);
        return loading;
    },

    clearWaiting: function () {
        var loading = this.layerGUI.getChildByTag(WAITING_TAG);
        if (loading) {
            loading.stopAllActions();
            loading.removeFromParent();
        }
    },

    takeScreenShot: function (isShareImage, layout) {
        var fileName = (isShareImage) ? "shareImg.png" : "screenshot.png";
        if (jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath() + fileName)) {
            jsb.fileUtils.removeFile(jsb.fileUtils.getWritablePath() + fileName);
        }
        var winWidth = (isShareImage) ? Constant.WIDTH : cc.winSize.width;
        var winHeight = (isShareImage) ? Constant.HEIGHT : cc.winSize.height;
        var text = new cc.RenderTexture(winWidth, winHeight, cc.Texture2D.PIXEL_FORMAT_RGBA8888, 0x88F0);
        text.setPosition(winWidth / 2, winHeight / 2);

        text.begin();
        if (isShareImage){
            layout.visit();
        } else {
            sceneMgr.getRunningScene().visit();
        }
        text.end();

        var ret = text.saveToFile(fileName, 1);

        var path = "";
        if (ret) {
            if (gamedata.sound && !isShareImage) {
                cc.audioEngine.playEffect(lobby_sounds.chupanh, false);
            }
            path = jsb.fileUtils.getWritablePath() + fileName;
        }
        return path;
    },

    updateCurrentGUI: function (data) {
        var gui = this.getRunningScene().getMainLayer();
        gui.onUpdateGUI(data);
    },

    // hungdd's function
    openWithScene: function (layer, callback, direct) {
        var curLayer = null;

        if (layer instanceof  LoginScene) {
            this._isWaitingCallBack = false;
            this._waitingScene = "";
        }

        if (direct === undefined) {
            direct = false;
        }
        if (this._isWaitingCallBack && !direct) {
            curLayer = new window[this._waitingScene];

            this._isWaitingCallBack = false;
            this._waitingScene = "";
        }
        else {
            curLayer = layer;
        }

        if (callback !== undefined) {
            if (callback != "" || callback != null) {
                this._isWaitingCallBack = true;
                this._waitingScene = callback;
            }
        }

        var scene = new BaseScene();
        scene.addChild(curLayer);

        cc.director.runScene(new cc.TransitionFade(BaseLayer.TIME_APPEAR_GUI, scene));
    },

    preloadScene: function (layer) {
        if (!(layer in this.arGuis)) {
            var cLayer = new window[layer];
            cLayer.retain();
            this.arGuis[layer] = cLayer;
        }
    },

    preloadGUI: function (slayer) {
        if (!(slayer in this.arPopups)) {
            var _class = this.getClassGUI(slayer);
            var cLayer = new window[_class];
            cLayer.retain();
            this.arPopups[slayer] = cLayer;
        }
    },

    openScene: function (layer, callback, direct) {
        cc.log("_________OPEN__SCENE___" + layer + "/" + this.curGui);

        CheckLogic.updateDesignSolution(layer);
        popUpManager.resetPopUp();
        var isCallback = true;
        if (layer == LoginScene.className) {
            isCallback = false;
        }

        if (layer == this.curGui) {
            return this.curGui;
        }

        if (this.layerGUI !== undefined && this.layerGUI && this.layerGUI.getParent()) {
            this.layerGUI.removeAllChildren(cc.sys.isNative);  // voi ban web neu clean up thi se bi mat listener của editbox
            this.layerGUI.retain();
        }

        if (this.layerSystem !== undefined && this.layerSystem && this.layerSystem.getParent()) {
            this.layerSystem.removeAllChildren();
            this.layerSystem.retain();
        }

        if (!isCallback) {
            this._isWaitingCallBack = false;
            this._waitingScene = "";
        }
        else {
            if (direct === undefined) {
                direct = false;
            }

            if (this._isWaitingCallBack && !direct) {
                layer = this._waitingScene;

                this._isWaitingCallBack = false;
                this._waitingScene = "";
            }

            if (callback !== undefined) {
                if (callback != "" || callback != null) {
                    this._isWaitingCallBack = true;
                    this._waitingScene = callback;
                }
            }
        }

        var curLayer = null;
        if (this.curGui in this.arGuis) {
            cc.log("____REMOVE___CUR__GUI___" + this.curGui);
            this.arGuis[this.curGui].retain();
        }

        this.curGui = layer;

        var isCache = true;
        for (var i = 0; i < this.ignoreGuis.length; i++) {
            if (this.ignoreGuis[i] == layer) {
                isCache = false;
                break;
            }
        }

        if (isCache) {
            if (layer in this.arGuis) {
                cc.log("____LOAD___CACHE___GUI__" + layer);
                curLayer = this.arGuis[layer];
                curLayer.removeFromParent(false);  // !cc.sys.isNative
            }
            else {
                cc.log("____CREATE___NEW___GUI__" + layer);
                curLayer = new window[layer];

                this.arGuis[layer] = curLayer;
            }
        }
        else {
            curLayer = new window[layer];
        }
        // if (curLayer.saveScene)
        //      curLayer.saveScene.removeAllChildren();
        var scene = new BaseScene();
        scene.addChild(curLayer);
       // curLayer.saveScene = scene;
        cc.director.runScene(scene);

        fr.crashLytics.logScene(layer);

        return curLayer;
    },

    openGUI: function (slayer, zoder, tag, isCache) {

        if (slayer === undefined || slayer == "") return null;

        if(slayer == Dialog.className) {
            sceneMgr.detectDialog();
        }

        var layer = null;

        if (isCache === undefined) isCache = true;

        if (isCache) {
            if (slayer in this.arPopups) {
                cc.log("____LOAD___CACHE___POPUP__" + slayer);
                layer = this.arPopups[slayer];
            }
            else {
                cc.log("____CREATE___NEW___POPUP__WITH___CACHE__" + slayer);
                var _class = this.getClassGUI(slayer);
                layer = new window[_class];
                this.arPopups[slayer] = layer;
            }
        }
        else {
            cc.log("____CREATE___POPUP__NOT_CACHE___" + slayer);
            var _class = this.getClassGUI(slayer);
            layer = new window[_class];
        }

        if (layer !== undefined && layer != null) {
            if (layer.getParent()) {
                layer.removeFromParent();
            }
        }

        if (zoder === undefined) zoder = 1;
        if (tag === undefined) tag = 1;

        if (layer !== undefined && layer != null) {
            layer.setAsPopup(true, isCache);
            this.layerGUI.addChild(layer, zoder, tag);
        }
        fr.crashLytics.logGUI(slayer);
        return layer;
    },

    getClassGUI: function (cName) {
        if (cName === undefined || cName == null || cName == "")
            return cName;

        var cIdx = cName.indexOf("_");
        if (cIdx > -1) {
            cName = cName.substr(0, cIdx);
        }

        return cName;
    },

    getGUI: function (tag) {
        return this.layerGUI.getChildByTag(tag);
    },

    getGUIByClassName: function (classname) {
        if (!classname) return null;
        if (classname in this.arPopups) return this.arPopups[classname];
        return null;
    },

    initialLayer: function () {
        cc.log("_______INITIAL____LAYER___GUI_____");

        if (this.layerGUI == null) {
            this.layerGUI = new cc.Layer();
        }
        else {
            if (this.layerGUI.getParent()) {
                this.layerGUI.removeFromParent();
            }
        }

        if (this.layerSystem == null) {
            this.layerSystem = new cc.Layer();
        }
        else {
            if (this.layerSystem.getParent()) {
                this.layerSystem.removeFromParent();
            }
        }

        this.getRunningScene().addChild(this.layerGUI, BaseScene.TAG_GUI, BaseScene.TAG_GUI);
        this.getRunningScene().addChild(this.layerSystem, BaseScene.TAG_GUI + 1, BaseScene.TAG_GUI + 1);

        gameMgr.onEnterScene();
    },

    updateScene: function (dt) {
        effectMgr.updateEffect(dt);
        gameMgr.onUpdateScene(dt);
    },

    checkBackAvailable: function (ignores) {
        if (ignores === undefined) ignores = [];
        for (var s in this.arPopups) {
            var check = true;
            for (var i = 0; i < ignores.length; i++) {
                if (s == ignores[i]) {
                    check = false;
                    break;
                }
            }

            if (check) {
                var g = this.arPopups[s];
                if (g && g.getParent() && !(g instanceof  CheatCenterScene) && g._enableBack) {
                    return true;
                }
            }
        }

        return false;
    },

    // dialog
    showOkCancelDialog: function (message, target, selector) {
        cc.log("#showOkCancelDialog : " + message);

        var dlg = this.openGUI(CheckLogic.getDialogClassName(), Dialog.ZODER, Dialog.TAG);
        dlg.setOkCancel(message, target, selector);
    },

    showOkDialogWithAction: function (message, target, selector) {
        cc.log("#showOkDialogWithAction : " + message);

        var dlg = this.openGUI(CheckLogic.getDialogClassName(), Dialog.ZODER, Dialog.TAG);
        dlg.setOkWithAction(message, target, selector);
    },

    showOKDialog: function (message) {
        cc.log("#showOKDialog : " + message);

        var dlg = this.openGUI(CheckLogic.getDialogClassName(), Dialog.ZODER, Dialog.TAG);
        dlg.setOKNotify(message);
    },

    showChangeGoldDialog: function (message, target, selector) {
        cc.log("#showChangeGoldDialog : " + message);

        var dlg = this.openGUI(CheckLogic.getDialogClassName(), Dialog.ZODER, Dialog.TAG);
        dlg.setChangeGold(message, target, selector);
    },

    showAddGDialog: function (message, target, selector) {
        cc.log("#showAddGDialog : " + message);

        var dlg = this.openGUI(CheckLogic.getDialogClassName(), Dialog.ZODER, Dialog.TAG);
        dlg.setAddG(message, target, selector);
    },

    showPlayNowDialog: function(message, target, selector) {
        cc.log("#showPlayNowDialog : " + message);

        var dlg = this.openGUI(CheckLogic.getDialogClassName(), Dialog.ZODER, Dialog.TAG);
        dlg.setPlayNow(message, target, selector);
    },

    //dialog
    detectDialog : function () {
        var popup = sceneMgr.getGUI(WebviewUI.Z_ODER);
        if(popup && popup instanceof WebviewUI) {
            popup.closeUI();
        }
    }
});

SceneMgr.sharedInstance = null;

SceneMgr.FONT_NORMAL = cc.sys.isNative ? "fonts/tahoma.ttf" : "tahoma";
SceneMgr.FONT_BOLD = cc.sys.isNative ? "fonts/tahomabd.ttf" : "tahoma";
SceneMgr.FONT_SIZE_DEFAULT = 17;

SceneMgr.convertPosToParent = function (parent, target) {
    if (!parent || !target || !target.getParent()) return cc.p(0, 0);
    return parent.convertToNodeSpace(target.getParent().convertToWorldSpace(target.getPosition()));
};

SceneMgr.getInstance = function () {
    if (!SceneMgr.sharedInstance) {
        SceneMgr.sharedInstance = new SceneMgr();
    }
    return SceneMgr.sharedInstance;
};

var sceneMgr = SceneMgr.getInstance();

// Loading and Waiting
var Loading = cc.Layer.extend({

    ctor: function (text, fog) {

        this._layerColor = null;
        this._message = "";
        this._fog = true;
        this._super();
        if (text)
            this._message = text;
        if (fog != null) {
            this._fog = fog;
        }
    },

    timeout: function (time) {
        this.runAction(cc.sequence(cc.delayTime(time), cc.removeSelf()));
    },

    timeoutWithFunction: function (time, func, binder) {
        this.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(func.bind(binder)), cc.removeSelf()));
    },

    onEnter: function () {
        cc.Layer.prototype.onEnter.call(this);
        if (this._fog) {
            this._layerColor = new cc.LayerColor(cc.BLACK);
            this._layerColor.runAction(cc.fadeTo(.25, 150));
            this.addChild(this._layerColor);
        }

        var winSize = cc.director.getWinSize();
        var scale = winSize.width / 800;
        scale = (scale > 1) ? 1 : scale;

        //this.spIcon = new cc.Sprite("icon_loading.png");
        //this.spLoading = new cc.Sprite("loading.png");
        //this.spIcon.setPosition(winSize.width/2,winSize.height/2 + 50);
        //this.spLoading.setPosition(winSize.width/2,winSize.height/2 + 50);
        //this.spLoading.runAction(cc.repeatForever(cc.rotateBy(1.5,360)));
        //this.spIcon.setScale(0.75);
        //this.spLoading.setScale(0.75);
        //this.addChild(this.spIcon);
        //this.addChild(this.spLoading);

        var eff = db.DBCCFactory.getInstance().buildArmatureNode("loadingZP");
        if (eff) {
            this.addChild(eff);
            eff.setPosition(winSize.width / 2, winSize.height / 2 + 50);
            eff.getAnimation().gotoAndPlay("loading", -1, -1, 0);
            eff.getAnimation().setTimeScale(5);
        }

        this._label = new ccui.Text();
        this._label.setAnchorPoint(cc.p(0.5, 0.5));
        this._label.setFontName("fonts/tahoma.ttf");
        this._label.setFontSize(17);
        this._label.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._label.setColor(sceneMgr.ccWhite);
        this._label.setString(this._message);
        this._label.setScale(scale);
        this._label.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        this.addChild(this._label);

        if (this._fog) {
            this._listener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan,
                onTouchMoved: this.onTouchMoved,
                onTouchEnded: this.onTouchEnded
            });

            cc.eventManager.addListener(this._listener, this);
        }

    },

    remove: function () {
        if (this._layerColor) {
            this._layerColor.runAction(cc.fadeTo(0.2, 0));
        }
        this.runAction(cc.sequence(cc.delayTime(0.2), cc.removeSelf()));
    },

    onTouchBegan: function (touch, event) {
        return true;
    },

    onTouchMoved: function (touch, event) {

    },

    onTouchEnded: function (touch, event) {

    }
});

var Waiting = cc.Layer.extend({

    ctor: function () {

        this._layerColor = null;
        this._message = "";
        this._fog = true;
        this._super();
    },

    timeout: function (time) {
        this.runAction(cc.sequence(cc.delayTime(time), cc.removeSelf()));
    },

    onEnter: function () {
        cc.Layer.prototype.onEnter.call(this);

        this._layerColor = new cc.LayerColor(cc.BLACK);
        this._layerColor.runAction(cc.fadeTo(.25, 150));
        this.addChild(this._layerColor);

        var size = cc.director.getWinSize();
        var scale = size.width / 800;

        scale = (scale > 1) ? 1 : scale;

        this._sprite = new cc.Sprite("common/circlewait.png");
        this.addChild(this._sprite);
        this._sprite.runAction(cc.repeatForever(cc.rotateBy(1.2, 360)));
        this._sprite.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        this._sprite.setVisible(true);

        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        });

        cc.eventManager.addListener(this._listener, this);
    },

    remove: function () {
        if (this._layerColor) {
            this._layerColor.runAction(cc.fadeTo(0.2, 0));
        }
        this.runAction(cc.sequence(cc.delayTime(0.2), cc.removeSelf()));
    },

    onTouchBegan: function (touch, event) {
        return true;
    },

    onTouchMoved: function (touch, event) {

    },

    onTouchEnded: function (touch, event) {

    }
});

// Toast Float center scene
var ToastFloat = cc.Node.extend({

    ctor: function () {
        this._super();

        this.timeDelay = -1;
        this.isRunningDelay = false;

        this.lb = null;
        this.bg = null;

        this.bg = new cc.Scale9Sprite("res/common/9patch.png");
        this.addChild(this.bg);

        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);
    },

    onEnter: function () {
        cc.Layer.prototype.onEnter.call(this);

        this.bg.setOpacity(0);
        this.lb.setOpacity(0);

        this.bg.runAction(cc.fadeIn(0.5));
        this.lb.runAction(cc.fadeIn(0.5));

        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.finishEffect.bind(this))));
    },

    finishEffect: function () {
        this.isRunningDelay = true;
    },

    setToast: function (txt, time) {
        if (txt) {
            this.lb = BaseLayer.createLabelText(txt);
            this.lb.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this.lb.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this.lb.ignoreContentAdaptWithSize(false);
            this.addChild(this.lb);
            var winSize = cc.director.getWinSize();

            var lbSize = this.lb.getContentSize();
            var deltaWidth = winSize.width * ToastFloat.DELTA_WIDTH;
            if(lbSize.width > deltaWidth)
            {

                this.lb.setContentSize(cc.size(deltaWidth, lbSize.height * 2));
            }

            this.bg.setContentSize(this.lb.getContentSize().width + ToastFloat.PAD_SIZE, this.lb.getContentSize().height + ToastFloat.PAD_SIZE);
        }

        if (time === undefined || time == null) time = ToastFloat.SHORT;
        this.timeDelay = time;
        this.scheduleUpdate();
    },

    setColor: function(color) {
        this.bg.setColor(color);
    },

    clearToast: function () {
        this.bg.runAction(cc.fadeOut(0.5));
        this.lb.runAction(cc.fadeOut(0.5));

        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.removeFromParent.bind(this))));
    },

    update: function (dt) {
        if (this.timeDelay > 0 && this.isRunningDelay) {
            this.timeDelay -= dt;
            if (this.timeDelay <= 0) {
                this.clearToast();
            }
        }
    }
});

ToastFloat.makeToast = function (time, text) {
    var toast = new ToastFloat();
    toast.setToast(text, time);
    var winSize = cc.director.getWinSize();
    toast.setPosition(winSize.width / 2, winSize.height * ToastFloat.POSITION_Y);

    sceneMgr.layerGUI.addChild(toast);
    toast.setLocalZOrder(TOAST_FLOAT_TAG);
};

ToastFloat.SHORT = 1.0;
ToastFloat.LONG = 3.0;
ToastFloat.MEDIUM = 2.0;

ToastFloat.POSITION_Y = 1 / 3;
ToastFloat.DELTA_WIDTH = 0.8;
ToastFloat.PAD_SIZE = 35;

// Loading Float center scene
var LoadingFloat = cc.Node.extend({

    ctor: function () {
        this._super();

        this.img = null;
        this.fog = null;
        this._listener = null;
        this.lb = null;

        this.funcTimeOut = null;

        // init
        this.img = new cc.Sprite("common/circlewait.png");
        this.img.setPositionY(this.img.getContentSize().height / 2);
        this.addChild(this.img);

        // set default
        var wSize = cc.director.getWinSize();
        this.setPosition(wSize.width / 2, wSize.height / 2);
    },

    onExit: function () {
        LoadingFloat.instance = null;

        cc.Node.prototype.onExit.call(this);
    },

    setText: function (text, fog) {
        var wSize = cc.director.getWinSize();

        this.img.cleanup();
        this.img.runAction(cc.repeatForever(cc.rotateBy(0.01, 5)));
        this.scheduleUpdate();

        if (text) {
            this.lb = BaseLayer.createLabelText(text);
            this.lb.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this.lb.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this.lb.setPositionY(this.img.getPositionY() - this.img.getContentSize().height);
            this.addChild(this.lb);
        }

        if (fog) {
            this.fog = new cc.LayerColor(cc.BLACK);
            this.fog.setVisible(true);
            this.fog.setPosition(-wSize.width / 2, -wSize.height / 2);
            this.addChild(this.fog, -1);

            this._listener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function (touch, event) {
                    return true;
                },
                onTouchMoved: function (touch, event) {
                },
                onTouchEnded: function (touch, event) {
                }
            });

            cc.eventManager.addListener(this._listener, this);
            this.fog.setOpacity(150);
        }
        else {
            if (this.fog) this.fog.removeFromParent();
            if (this._listener) cc.eventManager.removeListener(this._listener);

            this.fog = null;
            this._listener = null;
        }
    },

    setTimeOut: function (t, func) {
        this.timeOutDelay = t;
        this.funcTimeOut = func;
    },

    finishLoading: function () {
        if (this.funcTimeOut) {
            this.funcTimeOut();
        }

        if (this.fog) this.fog.removeFromParent();
        if (this._listener) cc.eventManager.removeListener(this._listener);
        this.fog = null;
        this._listener = null;

        LoadingFloat.instance.removeFromParent();
    },

    update: function (dt) {
        if (this.timeOutDelay !== undefined && this.timeOutDelay != null && this.timeOutDelay > 0) {
            this.timeOutDelay -= dt;
            if (this.timeOutDelay <= 0) {
                this.finishLoading();
            }
        }
    }
});

LoadingFloat.instance = null;

LoadingFloat.makeLoading = function (txt, fog, timeout, callback) {
    if (LoadingFloat.instance) {
        LoadingFloat.instance.removeFromParent();
        LoadingFloat.instance = null;
    }

    if (LoadingFloat.instance == null) {
        LoadingFloat.instance = new LoadingFloat();

        sceneMgr.layerGUI.addChild(LoadingFloat.instance);
        LoadingFloat.instance.setLocalZOrder(LOADING_FLOAT_TAG);
    }

    LoadingFloat.instance.setVisible(true);
    LoadingFloat.instance.setText(txt, fog);
    LoadingFloat.instance.setTimeOut(timeout, callback);

};

LoadingFloat.clearLoading = function () {
    if (LoadingFloat.instance && LoadingFloat.instance.getParent()) {
        LoadingFloat.instance.removeFromParent();
        LoadingFloat.instance = null;
    }
};

// Bubble Text
var BubbleToast = cc.Node.extend({

    ctor: function () {
        this._super();

        this.timeDelay = -1;
        this.isRunningDelay = false;

        this.lb = null;
        this.bg = null;

        this.bg = new cc.Scale9Sprite("res/common/9patch.png");
        this.addChild(this.bg);

        this.arrow = new cc.Sprite("res/common/arrow.png");
        this.addChild(this.arrow);

        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);
    },

    onEnter: function () {
        cc.Layer.prototype.onEnter.call(this);

        this.bg.setOpacity(0);
        this.lb.setOpacity(0);
        this.arrow.setOpacity(0);

        this.bg.runAction(cc.fadeTo(0.5,200));
        this.lb.runAction(cc.fadeTo(0.5,255));
        this.arrow.runAction(cc.fadeTo(0.5,200));

        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.finishEffect.bind(this))));
    },

    finishEffect: function () {
        this.isRunningDelay = true;
    },

    setBubble: function (txt, time,pos,att) {
        att = att || {};
        if (txt) {
            this.lb = BaseLayer.createLabelText(txt);
            this.lb.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this.lb.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this.lb.ignoreContentAdaptWithSize(false);
            if(att.textColor) {
                this.lb.setColor(att.textColor);
            }
            this.addChild(this.lb);
            var winSize = cc.director.getWinSize();

            var lbSize = this.lb.getContentSize();
            var deltaWidth = winSize.width * BubbleToast.DELTA_WIDTH;
            if(lbSize.width > deltaWidth)
            {
                this.lb.setContentSize(cc.size(deltaWidth, lbSize.height * 2));
            }

            this.bg.setContentSize(this.lb.getContentSize().width + BubbleToast.PAD_SIZE, this.lb.getContentSize().height + BubbleToast.PAD_SIZE);
        }

        if (time === undefined || time == null) time = BubbleToast.SHORT;
        this.timeDelay = time;
        this.scheduleUpdate();

        // position bubble
        this.arrow.setRotation(180);
        this.arrow.setPositionX(0);
        this.arrow.setPositionY(-this.bg.getContentSize().height/2 - this.arrow.getContentSize().height/2);

        var arrowOverX = 0;
        if(pos.x - this.bg.getContentSize().width/1.5 < 0) {
            arrowOverX = -1;
        }
        else if(pos.x + this.bg.getContentSize().width/1.5 > cc.winSize.width) {
            arrowOverX = 1;
        }

        if(att.arrowPos) {
            arrowOverX = att.arrowPos;
        }

        switch (arrowOverX) {
            case -1 :  {
                this.arrow.setPositionX(-this.bg.getContentSize().width/3);
                break;
            }
            case 0 :  {
                this.arrow.setPositionX(0);
                break;
            }
            case 1 :  {
                this.arrow.setPositionX(this.bg.getContentSize().width/3);
                break;
            }
        }

        this.setPositionX(pos.x - this.arrow.getPositionX());
        this.setPositionY(pos.y + this.bg.getContentSize().height/2 + this.arrow.getContentSize().height/2);
    },

    setColor: function(color) {
        this.bg.setColor(color);
    },

    clearBubble : function () {
        this.bg.runAction(cc.fadeOut(0.5));
        this.lb.runAction(cc.fadeOut(0.5));
        this.arrow.runAction(cc.fadeOut(0.5));

        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.removeFromParent.bind(this))));
    },

    update: function (dt) {
        if (this.timeDelay > 0 && this.isRunningDelay) {
            this.timeDelay -= dt;
            if (this.timeDelay <= 0) {
                this.clearBubble();
            }
        }
    }
});

BubbleToast.makeBubble = function (time, text,pos,att) {
    var toast = new BubbleToast();
    toast.setBubble(text, time,sceneMgr.layerGUI.convertToNodeSpace(pos),att);
    sceneMgr.layerGUI.addChild(toast);
    toast.setLocalZOrder(BUBBLE_TOAST_TAG);
};

BubbleToast.SHORT = 1.0;
BubbleToast.LONG = 3.0;
BubbleToast.MEDIUM = 2.0;

BubbleToast.POSITION_Y = 1 / 3;
BubbleToast.DELTA_WIDTH = 0.8;
BubbleToast.PAD_SIZE = 35;

// Tooltip
var TooltipFloat = cc.Node.extend({

    ctor: function () {
        this._super();

        this.timeDelay = -1;
        this.isRunningDelay = false;

        this.lb = null;
        this.bg = null;

        this.panel = new ccui.Layout();
        this.panel.setContentSize(100, 100);
        this.panel.setClippingEnabled(true);
        this.panel.setTouchEnabled(true);


        this.panel.setAnchorPoint(0.5, 0.5);
        this.addChild(this.panel);

        this.bg = new cc.Scale9Sprite("res/common/9patch.png");
        this.panel.addChild(this.bg);
        // this.bg.setAnchorPoint(0, 0);
        // this.bg.setPosition(0, 0);

        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
        this._scale = (this._scale > 1) ? 1 : this._scale;
        this.setScale(this._scale);
    },

    onEnter: function () {
        cc.Layer.prototype.onEnter.call(this);

        // this.bg.setOpacity(0);
        // this.lb.setOpacity(0);
        //
        // this.bg.runAction(cc.fadeIn(0.5));
        // this.lb.runAction(cc.fadeIn(0.5));
        //
        // this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.finishEffect.bind(this))));
    },

    /**
     * hien thi theo cac cach
     * @param type: 0: tu tren xuong duoi, text xuat hien tu trai qua phai
     * 1: tu trai qua phai, text xuat hien tu tren xuong duoi
     * 2: tu duoi len tren, text xuat hien tu trai qua phai
     * 3: tu phai qua trai, text xhuat hien tu tren xuong duoi
     */
    showUpByType: function(type){
        this.showUpType = type;
        var contentSize = this.bg.getContentSize();
        var timeRunBg = TooltipFloat.TIME_RUN_BG;
        var timeRunLb = TooltipFloat.TIME_RUN_LB;

        this.bg.setOpacity(0);
        if (type === TooltipFloat.SHOW_UP_TYPE_0 || type === TooltipFloat.SHOW_UP_TYPE_2){
            var directionY = (type === TooltipFloat.SHOW_UP_TYPE_0) ? contentSize.height : - contentSize.height;
            this.panel.setPosition(0, directionY);
            this.bg.setPosition(this.bg.defaultPos.x, this.bg.defaultPos.y - directionY);
            this.lb.setPosition(this.lb.defaultPos.x - contentSize.width, this.lb.defaultPos.y);
        } else if (type === TooltipFloat.SHOW_UP_TYPE_1 || type === TooltipFloat.SHOW_UP_TYPE_3){
            var directionX = (type === TooltipFloat.SHOW_UP_TYPE_1) ? -contentSize.width : contentSize.width;
            this.panel.setPosition(directionX, 0);
            this.bg.setPosition(this.bg.defaultPos.x - directionX, this.bg.defaultPos.y);
            this.lb.setPosition(this.lb.defaultPos.x, this.lb.defaultPos.y + contentSize.height);
        }

        var actionMove1 = cc.moveTo(timeRunBg, cc.p(this.panel.defaultPos));
        var actionMove2 = cc.moveTo(timeRunBg, cc.p(this.bg.defaultPos));
        var actionMove3 = cc.moveTo(timeRunLb, cc.p(this.lb.defaultPos));
        this.panel.runAction(actionMove1);
        this.bg.runAction(cc.spawn(actionMove2, cc.fadeTo(timeRunBg, 200)));
        this.lb.runAction(cc.sequence(cc.delayTime(timeRunBg), actionMove3, cc.callFunc(this.finishEffect.bind(this))));
    },

    finishEffect: function () {
        this.isRunningDelay = true;
    },

    setTooltip: function (txt, time, pos, type, fontSize, anchor) {
        if (txt) {
            this.lb = BaseLayer.createLabelText(txt);
            this.lb.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this.lb.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            this.lb.ignoreContentAdaptWithSize(false);
            if (fontSize) this.lb.setFontSize(fontSize);
            if (anchor) this.panel.setAnchorPoint(anchor);
            // this.lb.setAnchorPoint(0, 0);
            // this.lb.setPosition(0, 0);
            this.panel.addChild(this.lb);
            var winSize = cc.director.getWinSize();

            var lbSize = this.lb.getContentSize();
            var deltaWidth = winSize.width * TooltipFloat.DELTA_WIDTH;
            var numRow = 1;
            while (deltaWidth * numRow < lbSize.width){
                numRow++;
            }
            this.lb.setContentSize(cc.size(deltaWidth, lbSize.height * numRow));

            this.bg.setContentSize(this.lb.getContentSize().width + ToastFloat.PAD_SIZE, this.lb.getContentSize().height + TooltipFloat.PAD_SIZE);
            var conentSize = this.bg.getContentSize();
            this.bg.setPosition(conentSize.width / 2, conentSize.height/2);
            this.lb.setPosition(conentSize.width / 2, conentSize.height/2);
            this.panel.setContentSize(this.bg.getContentSize());

            this.bg.defaultPos = this.bg.getPosition();
            this.lb.defaultPos = this.bg.defaultPos;
        }

        if (time === undefined || time == null) time = TooltipFloat.SHORT;
        this.timeDelay = time;
        this.setPosition(pos);
        this.showUpByType(type);
        this.scheduleUpdate();
    },

    setColor: function(color) {
        this.bg.setColor(color);
    },

    clearTooltip: function () {
        var contentSize = this.bg.getContentSize();
        var timeRunBg = TooltipFloat.TIME_RUN_BG;
        var timeRunLb = TooltipFloat.TIME_RUN_LB;
        this.panel.stopAllActions();
        this.bg.stopAllActions();
        this.lb.stopAllActions();

        var type = this.showUpType;
        var actionMove1, actionMove2;
        if (type === TooltipFloat.SHOW_UP_TYPE_0 || type === TooltipFloat.SHOW_UP_TYPE_2){
            var directionY = (type === TooltipFloat.SHOW_UP_TYPE_0) ? -contentSize.height : contentSize.height;
            actionMove1 = cc.moveBy(timeRunBg, 0, -directionY);


            actionMove2 = cc.moveTo(timeRunLb, this.lb.defaultPos.x  - contentSize.width, this.lb.defaultPos.y);
            this.lb.runAction(actionMove2);
        } else if (type === TooltipFloat.SHOW_UP_TYPE_1 || type === TooltipFloat.SHOW_UP_TYPE_3){
            var directionX = (type === TooltipFloat.SHOW_UP_TYPE_1) ? contentSize.width : -contentSize.width;
            actionMove1 = cc.moveBy(timeRunBg, -directionX, 0);

            actionMove2 = cc.moveTo(timeRunLb, this.lb.defaultPos.x, this.lb.defaultPos.y + contentSize.height);
            this.lb.runAction(actionMove2);
        }

        this.panel.runAction(cc.sequence(cc.delayTime(timeRunLb), actionMove1, cc.callFunc(this.removeFromParent.bind(this))));
        this.bg.runAction(cc.sequence(cc.delayTime(timeRunLb),cc.spawn(actionMove1.reverse(), cc.fadeOut(timeRunBg))));

        // this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.removeFromParent.bind(this))));
    },

    update: function (dt) {
        if (this.timeDelay > 0 && this.isRunningDelay) {
            this.timeDelay -= dt;
            if (this.timeDelay <= 0) {
                this.clearTooltip();
            }
        }
    }
});

TooltipFloat.makeTooltip = function (time, text, pos, type, fontSize, anchor) {
    var oldTooltip = sceneMgr.layerGUI.getChildByTag(TOOLTIP_FLOAT_TAG);
    var timeWait = 0;
    if (oldTooltip){
        if (oldTooltip.lb.getString() === text){
            return;
        }
        timeWait = TooltipFloat.TIME_RUN_LB + TooltipFloat.TIME_RUN_BG;
        oldTooltip.clearTooltip();
    }

    setTimeout(function () {
        var tooltip = new TooltipFloat();
        tooltip.setTooltip(text, time, pos, type, fontSize, anchor);

        sceneMgr.layerGUI.addChild(tooltip, TOOLTIP_FLOAT_TAG, TOOLTIP_FLOAT_TAG);
    }, timeWait * 1000);

};

TooltipFloat.SHORT = 1.0;
TooltipFloat.LONG = 3.0;
TooltipFloat.MEDIUM = 2.0;

TooltipFloat.TIME_RUN_LB = 0.2;
TooltipFloat.TIME_RUN_BG = 0.25;

TooltipFloat.POSITION_Y = 1 / 3;
TooltipFloat.DELTA_WIDTH = 0.3;
TooltipFloat.PAD_SIZE = 20;

TooltipFloat.SHOW_UP_TYPE_0 = 0; // tu tren xuong duoi, text xuat hien tu trai qua phai
TooltipFloat.SHOW_UP_TYPE_1 = 1; // tu trai qua phai, text xuat hien tu tren xuong duoi
TooltipFloat.SHOW_UP_TYPE_2 = 2; // tu duoi len tren, text xuat hien tu trai qua phai
TooltipFloat.SHOW_UP_TYPE_3 = 3; // tu phai qua trai, text xhuat hien tu tren xuong duoi

// effect 
var EffectMgr = cc.Class.extend({

    ctor: function () {
        this.arLbPoints = [];   // array of label effect change value point
    },

    runLabelPoint: function (label, cur, des, delayTime, numChange, isFormat) {
        numChange = numChange || 50;
        delayTime = delayTime || 0;
        isFormat = isFormat || false;
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

        lb.cur = cur;
        lb.des = des;
        lb.delta = parseInt((des - cur) / numChange);
        lb.delay = delayTime;
        lb.isFormat = isFormat;
        lb.setString(isFormat ? StringUtility.formatNumberSymbol(lb.cur) : StringUtility.pointNumber(lb.cur));
        if(isNew)
            this.arLbPoints.push(lb);
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
        if (!isVpoint) num = 1;

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
                        if (gamedata.sound) {
                            var rnd = parseInt(Math.random() * 10) % 3 + 1;
                            cc.audioEngine.playEffect(lobby_sounds["coin" + rnd], false);
                        }
                    })))));
        }
        return (timeShow  + timeMove);
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
    },
});

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

// Tooltip
//var TooltipFloat = cc.Node.extend({
//
//    ctor: function () {
//        this._super();
//
//        this.timeDelay = -1;
//        this.isRunningDelay = false;
//
//        this.lb = null;
//        this.bg = null;
//
//        this.panel = new ccui.Layout();
//        this.panel.setContentSize(100, 100);
//        this.panel.setClippingEnabled(true);
//        this.panel.setTouchEnabled(true);
//
//
//        this.panel.setAnchorPoint(0.5, 0.5);
//        this.addChild(this.panel);
//
//        this.bg = new cc.Scale9Sprite("res/common/9patch.png");
//        this.panel.addChild(this.bg);
//        // this.bg.setAnchorPoint(0, 0);
//        // this.bg.setPosition(0, 0);
//
//        this._scale = cc.director.getWinSize().width / Constant.WIDTH;
//        this._scale = (this._scale > 1) ? 1 : this._scale;
//        this.setScale(this._scale);
//    },
//
//    onEnter: function () {
//        cc.Layer.prototype.onEnter.call(this);
//
//        // this.bg.setOpacity(0);
//        // this.lb.setOpacity(0);
//        //
//        // this.bg.runAction(cc.fadeIn(0.5));
//        // this.lb.runAction(cc.fadeIn(0.5));
//        //
//        // this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.finishEffect.bind(this))));
//    },
//
//    /**
//     * hien thi theo cac cach
//     * @param type: 0: tu tren xuong duoi, text xuat hien tu trai qua phai
//     * 1: tu trai qua phai, text xuat hien tu tren xuong duoi
//     * 2: tu duoi len tren, text xuat hien tu trai qua phai
//     * 3: tu phai qua trai, text xhuat hien tu tren xuong duoi
//     */
//    showUpByType: function(type){
//        this.showUpType = type;
//        var contentSize = this.bg.getContentSize();
//        var timeRunBg = TooltipFloat.TIME_RUN_BG;
//        var timeRunLb = TooltipFloat.TIME_RUN_LB;
//
//        this.bg.setOpacity(0);
//        if (type === TooltipFloat.SHOW_UP_TYPE_0 || type === TooltipFloat.SHOW_UP_TYPE_2){
//            var directionY = (type === TooltipFloat.SHOW_UP_TYPE_0) ? contentSize.height : - contentSize.height;
//            this.panel.setPosition(0, directionY);
//            this.bg.setPosition(this.bg.defaultPos.x, this.bg.defaultPos.y - directionY);
//            this.lb.setPosition(this.lb.defaultPos.x - contentSize.width, this.lb.defaultPos.y);
//        } else if (type === TooltipFloat.SHOW_UP_TYPE_1 || type === TooltipFloat.SHOW_UP_TYPE_3){
//            var directionX = (type === TooltipFloat.SHOW_UP_TYPE_1) ? -contentSize.width : contentSize.width;
//            this.panel.setPosition(directionX, 0);
//            this.bg.setPosition(this.bg.defaultPos.x - directionX, this.bg.defaultPos.y);
//            this.lb.setPosition(this.lb.defaultPos.x, this.lb.defaultPos.y + contentSize.height);
//        }
//
//        var actionMove1 = cc.moveTo(timeRunBg, cc.p(this.panel.defaultPos));
//        var actionMove2 = cc.moveTo(timeRunBg, cc.p(this.bg.defaultPos));
//        var actionMove3 = cc.moveTo(timeRunLb, cc.p(this.lb.defaultPos));
//        this.panel.runAction(actionMove1);
//        this.bg.runAction(cc.spawn(actionMove2, cc.fadeTo(timeRunBg, 200)));
//        this.lb.runAction(cc.sequence(cc.delayTime(timeRunBg), actionMove3, cc.callFunc(this.finishEffect.bind(this))));
//    },
//
//    finishEffect: function () {
//        this.isRunningDelay = true;
//    },
//
//    setTooltip: function (txt, time, pos, type) {
//        if (txt) {
//            this.lb = BaseLayer.createLabelText(txt);
//            this.lb.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
//            this.lb.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
//            this.lb.ignoreContentAdaptWithSize(false);
//            // this.lb.setAnchorPoint(0, 0);
//            // this.lb.setPosition(0, 0);
//            this.panel.addChild(this.lb);
//            var winSize = cc.director.getWinSize();
//
//            var lbSize = this.lb.getContentSize();
//            var deltaWidth = winSize.width * TooltipFloat.DELTA_WIDTH;
//            var numRow = 1;
//            while (deltaWidth * numRow < lbSize.width){
//                numRow++;
//            }
//            this.lb.setContentSize(cc.size(deltaWidth, lbSize.height * numRow));
//
//            this.bg.setContentSize(this.lb.getContentSize().width + ToastFloat.PAD_SIZE, this.lb.getContentSize().height + TooltipFloat.PAD_SIZE);
//            var conentSize = this.bg.getContentSize();
//            this.bg.setPosition(conentSize.width / 2, conentSize.height/2);
//            this.lb.setPosition(conentSize.width / 2, conentSize.height/2);
//            this.panel.setContentSize(this.bg.getContentSize());
//
//            this.bg.defaultPos = this.bg.getPosition();
//            this.lb.defaultPos = this.bg.defaultPos;
//        }
//
//        if (time === undefined || time == null) time = TooltipFloat.SHORT;
//        this.timeDelay = time;
//        this.setPosition(pos);
//        this.showUpByType(type);
//        this.scheduleUpdate();
//    },
//
//    setColor: function(color) {
//        this.bg.setColor(color);
//    },
//
//    clearTooltip: function () {
//        var contentSize = this.bg.getContentSize();
//        var timeRunBg = TooltipFloat.TIME_RUN_BG;
//        var timeRunLb = TooltipFloat.TIME_RUN_LB;
//        this.panel.stopAllActions();
//        this.bg.stopAllActions();
//        this.lb.stopAllActions();
//
//        var type = this.showUpType;
//        var actionMove1, actionMove2;
//        if (type === TooltipFloat.SHOW_UP_TYPE_0 || type === TooltipFloat.SHOW_UP_TYPE_2){
//            var directionY = (type === TooltipFloat.SHOW_UP_TYPE_0) ? -contentSize.height : contentSize.height;
//            actionMove1 = cc.moveBy(timeRunBg, 0, -directionY);
//
//
//            actionMove2 = cc.moveTo(timeRunLb, this.lb.defaultPos.x  - contentSize.width, this.lb.defaultPos.y);
//            this.lb.runAction(actionMove2);
//        } else if (type === TooltipFloat.SHOW_UP_TYPE_1 || type === TooltipFloat.SHOW_UP_TYPE_3){
//            var directionX = (type === TooltipFloat.SHOW_UP_TYPE_1) ? contentSize.width : -contentSize.width;
//            actionMove1 = cc.moveBy(timeRunBg, -directionX, 0);
//
//            actionMove2 = cc.moveTo(timeRunLb, this.lb.defaultPos.x, this.lb.defaultPos.y + contentSize.height);
//            this.lb.runAction(actionMove2);
//        }
//
//        this.panel.runAction(cc.sequence(cc.delayTime(timeRunLb), actionMove1, cc.callFunc(this.removeFromParent.bind(this))));
//        this.bg.runAction(cc.sequence(cc.delayTime(timeRunLb),cc.spawn(actionMove1.reverse(), cc.fadeOut(timeRunBg))));
//
//        // this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.removeFromParent.bind(this))));
//    },
//
//    update: function (dt) {
//        if (this.timeDelay > 0 && this.isRunningDelay) {
//            this.timeDelay -= dt;
//            if (this.timeDelay <= 0) {
//                this.clearTooltip();
//            }
//        }
//    }
//});
//
//TooltipFloat.makeTooltip = function (time, text, pos, type) {
//    var oldTooltip = sceneMgr.layerGUI.getChildByTag(TOOLTIP_FLOAT_TAG);
//    var timeWait = 0;
//    if (oldTooltip){
//        if (oldTooltip.lb.getString() === text){
//            return;
//        }
//        timeWait = TooltipFloat.TIME_RUN_LB + TooltipFloat.TIME_RUN_BG;
//        oldTooltip.clearTooltip();
//    }
//
//    setTimeout(function () {
//        var tooltip = new TooltipFloat();
//        tooltip.setTooltip(text, time, pos, type);
//
//        sceneMgr.layerGUI.addChild(tooltip, TOOLTIP_FLOAT_TAG, TOOLTIP_FLOAT_TAG);
//    }, timeWait * 1000);
//
//};
//
//TooltipFloat.SHORT = 1.0;
//TooltipFloat.LONG = 3.0;
//TooltipFloat.MEDIUM = 2.0;
//
//TooltipFloat.TIME_RUN_LB = 0.2;
//TooltipFloat.TIME_RUN_BG = 0.25;
//
//TooltipFloat.POSITION_Y = 1 / 3;
//TooltipFloat.DELTA_WIDTH = 0.3;
//TooltipFloat.PAD_SIZE = 20;
//
//TooltipFloat.SHOW_UP_TYPE_0 = 0; // tu tren xuong duoi, text xuat hien tu trai qua phai
//TooltipFloat.SHOW_UP_TYPE_1 = 1; // tu trai qua phai, text xuat hien tu tren xuong duoi
//TooltipFloat.SHOW_UP_TYPE_2 = 2; // tu duoi len tren, text xuat hien tu trai qua phai
//TooltipFloat.SHOW_UP_TYPE_3 = 3; // tu phai qua trai, text xhuat hien tu tren xuong duoi


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
