// gui
var HotNewItem = ccui.Layout.extend({

    ctor: function (p) {
        this._super();
        this.tParent = p;
        this.isShowingExtendBanner = false;
        this.isLoading = true;
        this._id = -1;
        //i don't know why but it's work =))
        var json = ccs.load("HotNewItem.json", "");
        this.btnOpen = ccui.Helper.seekWidgetByName(json.node, "btnOpen");
        this.btnOpen.addTouchEventListener(this.onButtonOpen, this);
        this.btnOpen.defaultPos = this.btnOpen.getPosition();
        this.btnOpen.removeFromParent();
        this.setContentSize(this.tParent.itemSize);
        this.defaultContentSize = this.getContentSize();
        this.setAnchorPoint(0.5, 0.5);
        this.addChild(this.btnOpen);

        this.pLargeImg = ccui.Helper.seekWidgetByName(this.btnOpen, "pLargeImg");
        this.pLargeImg.setContentSize(cc.size(this.pLargeImg.width, 0));
        this.largeImg = ccui.Helper.seekWidgetByName(this.pLargeImg, "largeImg");

        this.img = ccui.Helper.seekWidgetByName(this.btnOpen, "smallImg");

        this.pDot = ccui.Helper.seekWidgetByName(this.btnOpen, "pDot");
        this.listDot = [];
        for (var i = 0; i < 3; i++){
            this.listDot.push(ccui.Helper.seekWidgetByName(this.pDot, "dot" + i));
        }
        this.defaultDotPosY = this.listDot[0].getPositionY();

        this.hot = ccui.Helper.seekWidgetByName(this.img, "hot");
        this.hot.setVisible(false);

        this.type = -1;
        this._id = "";
        this._name = "";
        this.priority = -1;
        this.url = null;
        this.smallImgUrl = null;
        this.largeImgUrl = null;
        this.openGui = false;
        this.actionJS = null;
        this._downloading = HotNewItem.LOADING;

        this.setLoading();
    },

    setMaskSprite: function (maskAvatar) {
        if (maskAvatar && maskAvatar != "") {
            var stencil = new cc.Sprite(maskAvatar);
            this.clipping.setStencil(stencil);
        }
    },

    onButtonOpen: function (sender, type) {
        if (this.isLoading) return;
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                sender.runAction(cc.scaleTo(0.1, 0.97));
                break;
            case ccui.Widget.TOUCH_ENDED:
                sender.runAction(cc.scaleTo(0.1, 1));
                this.onButtonRelease();
                break;
            case ccui.Widget.TOUCH_CANCELED:
                sender.runAction(cc.scaleTo(0.1, 1));
                break;
        }
    },

    /**
     * priority button
     * Type: FANPAGE -> open url
     * Type: EVENT/PROMOTION: if have large img -> show img, else -> open event/shop
     */
    onButtonRelease: function () {
        switch (this.type) {
            case HotNewItem.FANPAGE: {
                if (this.largeImgUrl != "") {
                    this.showOrHideExtendBanner();
                } else if (this.url != "") {
                    NativeBridge.openFanpageHotNews(this.url);
                }
                break;
            }
            case HotNewItem.EVENT: {
                if (this.openGui) {
                    event.openEvent();
                } else if (this.largeImgUrl != "") {
                    this.showOrHideExtendBanner();
                } else if (this.url != "") {
                    NativeBridge.openURLNative(this.url);
                }
                break;
            }
            case HotNewItem.PROMOTION: {
                if (this.openGui) {
                    if (gamedata.checkEnablePayment())
                        gamedata.openShop();
                } else if (this.largeImgUrl != "") {
                    this.showOrHideExtendBanner();
                } else if (this.url != "") {
                    NativeBridge.openURLNative(this.url);
                }
                break;
            }
            case HotNewItem.ACTION : {
                if (this.actionJS) {
                    try {
                        eval(this.actionJS);
                    }
                    catch(e) {
                        cc.log("HotNewItem::actionJS error " + e);
                    }
                } else if (this.largeImgUrl != "") {
                    this.showOrHideExtendBanner();
                } else if (this.url != "") {
                    NativeBridge.openURLNative(this.url);
                }
                break;
            }
        }

        this.hot.setVisible(false);

        var logTrackingHotNews = this.type + "/" + this._name;
        cc.log("logTrackingHotNews: ", logTrackingHotNews);
        var sendLogClient = new CmdSendClientInfo();
        sendLogClient.putData(logTrackingHotNews, 2);
        GameClient.getInstance().sendPacket(sendLogClient);
        cc.sys.localStorage.setItem(HotNews.KEY_OPEN_NEWS + this._idHotNews, 1);
    },

    setData: function (data) {
        cc.log("--HotNewItem " + JSON.stringify(data));
        this.setLoading();
        this._id = data._id;
        this._idHotNews = data._id;
        this._name = data.name;
        this.type = data.type;
        this.url = data.url;
        this.openGui = data.openGui;
        this.actionJS = HotNews.getActionJS(data.action);
        this.smallImgUrl = data.smallImgUrl;
        this.largeImgUrl = data.imgUrl;

        var strs = this.smallImgUrl.split("/");
        var sPath = strs[strs.length - 1];
        sPath = sPath.split(".")[0];

        strs = this.largeImgUrl.split("/");
        var lPath = strs[strs.length - 1];
        lPath = lPath.split(".")[0];

        if (this.largeImgUrl != "") {
            this.asyncLargeImg(lPath, this.largeImgUrl);
        } else {
            this.asyncExecuteWithUrl(sPath, this.smallImgUrl);
        }
    },

    setLoading: function () {
        this.isLoading = true;
        this.pDot.setVisible(true);
        for (var i = 0; i < this.listDot.length; i++){
            var img = this.listDot[i];
            img.stopAllActions();
            var timeWaitToJump = 0.3;
            var timeJump = 0.2;
            var defaultY = this.defaultDotPosY;
            var defaultX = img.getPositionX();
            var actionJump = cc.sequence(new cc.EaseExponentialOut(cc.moveTo(timeJump, cc.p(defaultX, defaultY + 10))),
                new cc.EaseExponentialOut(cc.moveTo(timeJump, cc.p(defaultX, defaultY))));
            img.runAction(cc.sequence(cc.delayTime(i * timeWaitToJump), actionJump, cc.delayTime((3 - i) * timeWaitToJump)).repeatForever());
        }
    },

    setSmallImg: function (path) {
        if (!path) {
            this.setLoading();
            return;
        }
        this.pDot.setVisible(false);
        this.isLoading = false;
        this.img.setVisible(true);
        this.img.loadTexture(path);
        var opened = cc.sys.localStorage.getItem(HotNews.KEY_OPEN_NEWS + this._id);
        this.hot.setVisible(!opened);
    },

    asyncExecuteWithUrl: function (path, url, isReload) {
        cc.log("async smail img " + path + " " + url + " " + this._downloading);
        if (this.pathSmallImg == path && (this._downloading == HotNewItem.DOWLOADED || (!isReload && this._downloading > HotNewItem.DOWLOADED))) {
            return;
        }
        this.smallImgUrl = url;
        this.pathSmallImg = path;
        if (this._asyncDownload) {
            this._asyncDownload.setCallback(null);
            this._asyncDownload = null;
        }
        if (url == "") {
            this.setLoading();
            this._downloading = HotNewItem.LOADING;
            return;
        }
        var file = jsb.fileUtils.getWritablePath() + path + ".jpg";
        if (jsb.fileUtils.isFileExist(file)) {
            this.setSmallImg(file);
            this._downloading = HotNewItem.DOWLOADED;
            return;
        }
        if (Config.ENABLE_CHEAT) cc.log("asyncExecuteWithUrl1 " + path + " " + url + " " + this._downloading);
        var callback = function (ret, file) {
            if (Config.ENABLE_CHEAT) cc.log("###callback asyncExecuteWithUrl " + this._downloading + " " + JSON.stringify(ret) + " " + JSON.stringify(file));
            if (!cc.sys.isObjectValid(this) || !this.isVisible()) return;
            if (ret == 0) {
                this.setSmallImg(file);
                this._downloading = HotNewItem.DOWLOADED;
            } else {
                if (this._downloading < HotNewItem.REDOWNLOAD) {
                    this.asyncExecute();
                } else {
                    this._downloading = HotNewItem.LOADING;
                }
            }
        }.bind(this);
        if (cc.sys.isNative){
            this._asyncDownload = engine.AsyncDownloader.create(encodeURI(url), file, callback);
        } else {
            this._asyncDownload = new engine.AsyncDownloader();
            this._asyncDownload.initDownload(encodeURI(url), file, callback);
        }

        this._asyncDownload.startDownload();
        //if(this._downloading == 2)this._asyncDownload.setCallback(null);
        if (this._downloading != HotNewItem.LOADING) this.setLoading();
        else this._downloading = HotNewItem.DOWLOADED;
        this._downloading++;
    },

    asyncExecute: function () {
        this.asyncExecuteWithUrl(this.pathSmallImg, this.smallImgUrl, true);
    },

    asyncLargeImg: function (path, url, isReload) {
        //cc.log("async largeImg" + path + " " + url + " " + this._downloading)
        if (this._largeImgPath == path && (this._downloading == HotNewItem.DOWLOADED || (!isReload && this._downloading > HotNewItem.DOWLOADED))) {
            return;
        }
        this._largeImgUrl = url;
        this._largeImgPath = path;

        if (this._asyncDownload) {
            this._asyncDownload.setCallback(null);
            this._asyncDownload = null;
        }

        if (url == "") {
            this.setLoading();
            this._downloading = HotNewItem.LOADING;
            return;
        }

        var file = jsb.fileUtils.getWritablePath() + path + ".jpg";
        if (jsb.fileUtils.isFileExist(file)) {
            this.setLargeImg(file);
            this._downloading = HotNewItem.DOWLOADED;
            return;
        }

        if (Config.ENABLE_CHEAT) cc.log("asyncExecuteWithUrl " + path + " " + url + " " + this._downloading);
        var callback = function (ret, file) {
            if (Config.ENABLE_CHEAT) cc.log("###callback asyncExecuteWithUrl " + this._downloading + " " + JSON.stringify(ret) + " " + JSON.stringify(file));
            this._asyncDownload = null;
            if (!cc.sys.isObjectValid(this) || !this.isVisible()) return;
            if (ret == 0) {
                this.setLargeImg(file);
                this._downloading = HotNewItem.DOWLOADED;
            } else {
                if (this._downloading < HotNewItem.REDOWNLOAD) {
                    this.asyncExecuteLargeImg();
                } else {
                    this._downloading = HotNewItem.LOADING;
                }
            }
        }.bind(this);
        if (cc.sys.isNative){
            this._asyncDownload = engine.AsyncDownloader.create(encodeURI(url), file, callback);
        } else {
            this._asyncDownload = new engine.AsyncDownloader();
            this._asyncDownload.initDownload(encodeURI(url), file, callback);
        }
        this._asyncDownload.startDownload();
        //if(this._downloading == 2)this._asyncDownload.setCallback(null);
        if (this._downloading != HotNewItem.LOADING) this.setLoading();
        else this._downloading = HotNewItem.DOWLOADED;
        this._downloading++;

    },

    asyncExecuteLargeImg: function () {
        this.asyncLargeImg(this._largeImgPath, this._largeImgUrl, true);
    },

    setLargeImg: function (path) {
        this.largeImg.loadTexture(path);
        var scale = this.largeImg.getContentSize().width / this.largeImg.getVirtualRendererSize().width;
        cc.log("LargeImg 1 : " + JSON.stringify(this.largeImg.getContentSize()));
        cc.log("LargeImg 2 : " + JSON.stringify(this.largeImg.getVirtualRendererSize()));
        cc.log("Scale : " + scale);
        this.largeImg.setContentSize(cc.size(this.largeImg.getContentSize().width,this.largeImg.getVirtualRendererSize().height * scale));
        this.largeImgHeight = this.largeImg.getVirtualRendererSize().height * scale;
        var strs = this.smallImgUrl.split("/");
        var sPath = strs[strs.length - 1];
        sPath = sPath.split(".")[0];
        this.asyncExecuteWithUrl(sPath, this.smallImgUrl);
    },

    showOrHideExtendBanner: function () {
        if (this.isShowingExtendBanner) {
            this.unscheduleAllCallbacks();
            this.isShowingExtendBanner = false;
            this.schedule(this.doHidden)
        } else {
            this.unscheduleAllCallbacks();
            this.isShowingExtendBanner = true;
            this.btnOpen.setTouchEnabled(false);
            this.scrollItemToTop();
        }

    },

    doExpand: function (dt) {
        var dy = (dt / HotNewItem.TIME_EXPAND) * this.largeImgHeight;

        if (this.pLargeImg.height > this.largeImgHeight) {
            cc.log("expand done");
            this.unschedule(this.doExpand);
            this.setContentSize(cc.size(this.width, this.tParent.itemSize.height + this.largeImgHeight));
            this.btnOpen.setPositionY(this.btnOpen.defaultPos.y + this.largeImgHeight);
            this.pLargeImg.setContentSize(cc.size(this.pLargeImg.width, this.largeImgHeight));
            this.largeImg.setPositionY(this.pLargeImg.height);
            this.updateContainerOffset();
            return;
        }

        //set new contentSiz -> positon
        this.setContentSize(cc.size(this.width, this.height + dy));
        this.btnOpen.setPositionY(this.btnOpen.getPositionY() + dy);
        this.pLargeImg.setContentSize(cc.size(this.pLargeImg.width, this.pLargeImg.height + dy));
        this.largeImg.setPositionY(this.pLargeImg.height);
        this.tParent.refreshView();
        this.updateContainerOffset();

    },

    doHidden: function (dt) {
        var dy = -(dt / HotNewItem.TIME_EXPAND) * this.largeImgHeight;

        if (this.pLargeImg.height <= 0) {
            cc.log("hidden done");
            this.unschedule(this.doHidden);
            this.setContentSize(this.tParent.itemSize);
            this.btnOpen.setPosition(this.btnOpen.defaultPos);
            this.pLargeImg.setContentSize(cc.size(this.pLargeImg.width, 0));
            this.tParent.refreshView();
            this.updateContainerOffset();
            //??
            /**
             *i đin't know why but
             * if not have this, when done hidden 1st item, list view content offset jump to wrong position
             * jumpToTop not work =))
             */
            if (this._id == 0) {
                this.tParent.scrollToTop(0.2, true);
            }

            return;
        }

        //set new contentSiz -> positon
        cc.log("wtff??? 2");
        this.setContentSize(cc.size(this.width, this.height + dy));
        this.btnOpen.setPositionY(this.btnOpen.getPositionY() + dy);
        this.pLargeImg.setContentSize(cc.size(this.pLargeImg.width, this.pLargeImg.height + dy));
        this.largeImg.setPositionY(this.pLargeImg.height);
        this.tParent.refreshView();
        this.updateContainerOffset();
    },

    resetData: function () {
        this.isShowingExtendBanner = false;
        this.setContentSize(this.defaultContentSize);
        this.btnOpen.setPosition(this.btnOpen.defaultPos);
        this.btnOpen.setScale(1);
        this.btnOpen.setTouchEnabled(true);
        this.pLargeImg.setContentSize(cc.size(this.pLargeImg.width, 0));
    },

    scrollItemToTop: function () {
        //get max height(from bottom to top of current item)
        var h = 0;
        var len = this.tParent.getItems().length;
        //margin size
        h += (len - this._id) * this.tParent.getItemsMargin();

        for (var i = this._id; i < len; i++) {
            h += this.tParent.getItems()[i].height;
        }
        // h -> postionY we need scroll to
        //reverse function scroll to percent to get exact percent
        var totalHeight = this.tParent.getInnerContainerSize().height;
        var parentHeight = this.tParent.height;
        var dTime;
        var minY = parentHeight - totalHeight;
        if (h < parentHeight) {
            dTime = 0;
        } else {

            var curY = this.tParent.getInnerContainerPosition().y;
            var finalDesY = parentHeight - h;

            //calc time scroll
            var rng = Math.abs(finalDesY - curY);
            dTime = (rng / HotNewItem.SCROLL_SPEED) * 0.1;
            dTime = dTime > 0.5 ? 0.5 : dTime; //limit time scroll

            var percent = 1 - (finalDesY / minY);
            this.tParent.scrollToPercentVertical(percent * 100, dTime, false);
        }
        this.runAction(cc.sequence(cc.delayTime(dTime), cc.callFunc(function () {
            this.btnOpen.setTouchEnabled(true);
            this.schedule(this.doExpand);
        }.bind(this))))


    },

    updateContainerOffset: function () {
        //get max height(from bottom to top of current item)
        var h = 0;
        var len = this.tParent.getItems().length;
        //margin size
        h += (len - this._id) * this.tParent.getItemsMargin();

        for (var i = this._id; i < len; i++) {
            h += this.tParent.getItems()[i].height;
        }

        var parentHeight = this.tParent.height;
        if (h < parentHeight) {
            h = 0;
        } else {
            h = parentHeight - h;
        }
        this.tParent.setInnerContainerPosition(cc.p(this.tParent.getInnerContainer().getPositionX(), h));
    }
});

var HotNewsGUI = BaseLayer.extend({

    ctor: function () {
        this.lastTimeGetConfig = 0;
        this._super(HotNewsGUI.className);
        this.initWithBinaryFile("HotNewGUI.json");
    },

    initGUI: function () {
        this.pHotNews = this.getControl("pNews");
        this.resetDefaultPosition(this.pHotNews);
        this.btnClose = this.customButton("btnHide", 0, this._layout);
        this.listBanner = this.getControl("listBanner",this.pHotNews);
        this.noNews = this.getControl("noNews",this.pHotNews);
        this.bg = this.getControl("bg",this.pHotNews);
        // this.bg.setContentSize(680, this.bg.getContentSize().height);
        this.noNews.setPositionX(350);

        this.listBanner.itemSize = cc.size(675, 270);
        this.listBanner.setScrollBarEnabled(false);

        this.listBanner.addEventListener(this.logEvent, this);

        this.setBackEnable(true);
    },

    logEvent: function () {
        cc.log("ListView Content Size = " + JSON.stringify(this.listBanner.getContentSize()));
        cc.log("Container size = " + JSON.stringify(this.listBanner.getInnerContainer().getContentSize()));
        cc.log("content offset = " + JSON.stringify(this.listBanner.getInnerContainer().getPosition()))
    },

    onEnterFinish: function () {
        this.loadBanner();
        this.pHotNews.setPositionX(this.pHotNews.getPositionX() - this.pHotNews.getContentSize().width - 20);
        this.pHotNews.runAction(cc.moveTo(0.5, this.pHotNews.defaultPos).easing(cc.easeSineOut()));
        if (!cc.sys.isNative){
            this.listBanner.setTouchEnabled(true);
        }

        hotNews.saveShowHot();
        var timeNow = Date.now() / 1000;
        if (timeNow - this.lastTimeGetConfig > HotNewsGUI.TIME_UPDATE_CONFIG || this.listBanner.getItems().length == 0) {
            this.lastTimeGetConfig = timeNow;
            this.showLoading();
            hotNews.requestNews();
        }
    },

    showLoading: function () {
        this.listBanner.setVisible(false);
        this.noNews.setVisible(false);
    },

    loadBanner: function () {
        cc.log("HotNewsGUI::loadBanner " + hotNews.hotNewConfig.length);

        this.listBanner.removeAllItems();

        var arNews = hotNews.getNewsActive();
        if (arNews.length == 0) {
            this.listBanner.setVisible(false);
            this.noNews.setVisible(true);
            return;
        }

        this.noNews.setVisible(false);
        this.listBanner.setVisible(true);
        for (var i = 0; i < arNews.length; i++) {
            var banner = new HotNewItem(this.listBanner);
            banner.setData(arNews[i]);
            banner._id = i;
            this.listBanner.pushBackCustomItem(banner);
        }
    },

    onButtonRelease: function (sender, id) {
        this.onClose();
    },

    onBack: function(){
        cc.log("onBack");
        this.onClose();
    },

    onClose: function () {
        this.pHotNews.runAction(cc.sequence(cc.moveBy(0.5, -this.pHotNews.getContentSize().width, 0).easing(cc.easeSineIn()), cc.callFunc(this.onCloseDone, this)));
    },

    onCloseDone: function () {
        this.removeFromParent();
    }
});

// manager
var HotNews = cc.Class.extend({

    hotNewConfig: [],
    btnNews : null,

    ctor: function () {

    },

    checkEnable : function() {
        if (!cc.sys.isNative) return false;
        return HotNews.ENABLE;
    },

    show: function () {
        sceneMgr.openGUI(HotNewsGUI.className, HotNewsGUI.TAG, HotNewsGUI.TAG);
    },

    showNewsButton : function (btn) {
        this.btnNews = btn;

        btn.setVisible(hotNews.checkEnable());
        btn.hot.setVisible(hotNews.checkNoticeHot());
    },

    saveShowHot : function() {
        var isHot = cc.sys.localStorage.getItem("hot_new_tool_first_time_open");
        if(isHot != 1) {
            cc.sys.localStorage.setItem("hot_new_tool_first_time_open", 1);
        }

        this.btnNews.hot.setVisible(false);
        this.btnNews.setRotation(0);
        this.btnNews.stopAllActions();
    },

    getNewsActive : function () {
        var ar = [];
        for (var i = 0; i < hotNews.hotNewConfig.length; i++) {
            if (hotNews.hotNewConfig[i].active) {
                if(HotNews.requireActive(hotNews.hotNewConfig[i].action))
                    ar.push(hotNews.hotNewConfig[i]);
            }
        }
        return ar;
    },

    checkNoticeHot: function () {
        if (hotNews.hotNewConfig.length === 0){
            return false;
        }

        for (var i = 0; i < hotNews.hotNewConfig.length; i++){
            var opened = cc.sys.localStorage.getItem(HotNews.KEY_OPEN_NEWS + hotNews.hotNewConfig[i]._id);
            cc.log("checkNoticeHot: ", opened, hotNews.hotNewConfig[i]._id);
            if (!opened){
                return true;
            }
        }

        return false;
    },

    requestNews: function () {
        if (!cc.sys.isNative || cc.sys.os !== cc.sys.OS_ANDROID){
            return;
        }
        var timeout = setTimeout(function () {
            cc.log("HotNewGUI.requestHotNewConfig time out");
            hotNews.responseNews(false, "Request time out!");
        }, 10000);

        var callBack = function (result, data) {
            clearTimeout(timeout);
            hotNews.responseNews(result, data);
        };

        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                callBack(true, xhr.responseText);
            } else {
                if (!cc.sys.isNative && (xhr.status == 200 || xhr.status == 0)) {
                    return;
                }
                callBack(false, "error: " + xhr.readyState + "," + xhr.status);
            }
        };
        xhr.onerror = function () {
            cc.log("Request error!");
            callBack(false, "onerror");
        };
        xhr.ontimeout = function () {
            cc.log("Request time out!");
            callBack(false, "ontimeout");
        };
        xhr.onabort = function () {
            cc.log("Request aborted!");
            callBack(false, "ontimeout");
        };
        xhr.timeout = 10000;
        var url = (Config.ENABLE_CHEAT) ? HotNews.URL_HOT_NEWS_PRIVATE : HotNews.URL_HOT_NEWS_LIVE;
        xhr.open("GET", url + LocalizedString.config("GAME"), true);
        xhr.send();
    },

    responseNews: function (result, data) {
        cc.log("HOT NEW RESPONSE :  " + JSON.stringify(arguments));
        if (result) {
            data = JSON.parse(data);
            cc.log("sort by priority");
            for (var i = 0; i < data.length - 1; i++) {
                for (var j = i; j < data.length; j++) {
                    var tmp;
                    if (data[j].priority >= data[i].priority) {
                        tmp = data[i];
                        data[i] = data[j];
                        data[j] = tmp
                    }
                }
            }
            cc.log("SORT DONE:  " + JSON.stringify(data));
            hotNews.hotNewConfig.length = 0;
            hotNews.hotNewConfig = data;
            var gui = sceneMgr.getGUI(HotNewsGUI.TAG);
            if (gui instanceof HotNewsGUI) {
                gui.loadBanner();
            }
            this.preloadImgs();
        } else {
            cc.log("GET HOT NEW CONFIG ERROR: " + JSON.stringify(data));
            hotNews.requestNews();
        }
    },

    preloadImgs: function(){
        if ( hotNews.hotNewConfig.length === 0){
            return;
        }

        for (var i = 0; i < hotNews.hotNewConfig.length; i++){
            this.preloadImg(hotNews.hotNewConfig[i].smallImgUrl);
        }
    },

    preloadImg: function(url){
        var strs = url.split("/");
        var sPath = strs[strs.length - 1];
        sPath = sPath.split(".")[0];
        var file = jsb.fileUtils.getWritablePath() + sPath + ".jpg";
        if (jsb.fileUtils.isFileExist(file)) {
            return;
        }
        this._asyncDownload = engine.AsyncDownloader.create(encodeURI(url), file, function () {

        });
        this._asyncDownload.startDownload();
    },

    requestNewDay: function () {
        var date = new Date();
        var today = date.getDate() + "/" + date.getMonth();
        var keyLocal = "requestHotNewsToday" + today;
        var shownPopupBrand = cc.sys.localStorage.getItem(keyLocal);
        if (shownPopupBrand == null || !shownPopupBrand) {
            hotNews.requestNews();
            cc.sys.localStorage.setItem(keyLocal, 1);
        }
    }
});

HotNews.requireActive = function (sAction) {
    cc.log("--check active " + sAction);
    if(sAction == "") return true;

    try {
        var obj = JSON.parse(sAction);

        var s = eval('(function() {' + obj.require + '}())');
        cc.log("-->result : " + s);
        return s;
    }
    catch(e) {
        cc.log("error " + e);
        return true;
    }
};

HotNews.getActionJS = function (sAction) {
    cc.log("sAction " + sAction);
    try {
        var obj = JSON.parse(sAction);
        if(obj.action && obj.action != null) return obj.action;
    }
    catch(e) {
        cc.log("error parser " , sAction, e);
    }
    return "";
};

HotNews._inst = null;
HotNews.instance = function () {
    if (HotNews._inst == null) {
        HotNews._inst = new HotNews();
    }
    return HotNews._inst;
};
hotNews = HotNews.instance();

HotNews.KEY_OPEN_NEWS = "hot_new_openned_";

// const
HotNews.ENABLE = true;
HotNews.URL_HOT_NEWS_LIVE = "https://news.service.zingplay.com:8456/news?gameId=";
HotNews.URL_HOT_NEWS_PRIVATE = "https://news.service.zingplay.com:8456/news?gameId=";

HotNewItem.EVENT = 0;
HotNewItem.PROMOTION = 1;
HotNewItem.FANPAGE = 2;
HotNewItem.ACTION = 3;

HotNewItem.DOWLOADED = 0;
HotNewItem.DOWNLOADING = 1;
HotNewItem.REDOWNLOAD = 2;
HotNewItem.LOADING = -1;

HotNewItem.SCROLL_SPEED = 70;
HotNewItem.TIME_EXPAND = 0.5;
HotNewItem.DEFAULT_IMG = "HotNew/defaultBg.png";

HotNewsGUI.className = "HotNewsGUI";
HotNewsGUI.TAG = 193;
HotNewsGUI.TIME_UPDATE_CONFIG = 1200; // 20p