var DownloadEventManager = cc.Class.extend({
    ctor: function () {
        this.currentIdDownload = "";
        // chi tu dong download 1 lan khi chay Game, goi tu dong download khi nhan goi tin vao lobby
        this.autoDownloaded = false;
        this.countTryDownload = 0;
        this.sendLogDowloadFail = false;
        this.isUpdating = false;
    },

    startAutoDownload: function (idEvent) {
        if (this.countTryDownload > 2) {
            // neu da thu download qua nhieu lan thi khong tu dong Download nua
            cc.log("DOWNLOAD FAIL " + idEvent);
            this.isUpdating = false;
            event.finishDownload(false, idEvent);
            cc.log("KHO HIEU QUA ");
            return;
        }
        if (this.autoDownloaded) {
            return;
        }
        this.countTryDownload++;
        this.autoDownloaded = true;
        if (this.sendLogDowloadFail == false) {
            var needToLogDownload = cc.sys.localStorage.getItem(DownloadEventManager.KEY_NEED_LOG_DOWNLOAD);
            if (needToLogDownload) {
                var convert = parseInt(needToLogDownload);
                if (convert > 0) {
                    cc.log("CAN GHI LOG " + needToLogDownload);

                    // user nay da tung download fail
                    var log = " Download Fail lan thu " + convert;
                    var s = "JavaScript error: assets/src/Lobby/EventMgr/DownloadEventManager.js line 2222TypeError: " + log + " " + (new Error()).stack;
                    cc.log(s);
                    NativeBridge.logJSManual("assets/src/Lobby/EventMgr/DownloadEventManager.js", "2222", s, NativeBridge.getVersionString());
                    convert++;
                    cc.sys.localStorage.setItem(DownloadEventManager.KEY_NEED_LOG_DOWNLOAD, convert);
                }
                else {
                    cc.log("KO CAN GHI LOG " + needToLogDownload);
                    cc.sys.localStorage.setItem(DownloadEventManager.KEY_NEED_LOG_DOWNLOAD, 1);
                }
            }
            else {
                cc.log("KO CAN GHI LOG " + needToLogDownload);
                cc.sys.localStorage.setItem(DownloadEventManager.KEY_NEED_LOG_DOWNLOAD, 1);
            }
            this.sendLogDowloadFail = true;
        }
        this.startDownload(idEvent);
    },

    startDownload: function (idEvent, version) {
        if (this.isUpdating)
            return;
        this.isUpdating = true;
        this.currentIdDownload = idEvent;
        //var manifestPath = "res/project.manifest";
        var manifestPath, storagePath;
        storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "");
        if (Config.ENABLE_CHEAT) {
            manifestPath = DownloadEventManager.LOCAL_PATH + idEvent + "/projectPrivate.manifest";
            storagePath = storagePath + DownloadEventManager.STORAGE_PATH_PRIVATE + idEvent;
        }
        else {
            manifestPath = DownloadEventManager.LOCAL_PATH + idEvent + "/project.manifest";
            storagePath = storagePath + DownloadEventManager.STORAGE_PATH + idEvent;
        }

        cc.log("Storage path for this test : " + storagePath);
        if (this._am){
            this._am.release();
            this._am = null;
        }
        cc.log("Local path for this test : " + manifestPath);

        this._am = new jsb.AssetsManager(manifestPath, storagePath);
        this._am.retain();

        if (!this._am.getLocalManifest().isLoaded()){
            cc.log("Fail to update assets, step skipped.");
            // that.clickMeShowTempLayer();
        } else {
            cc.log("VERSION DOWNLOAD " + version);
            var localVersion = parseInt(this._am.getLocalManifest().getVersion());
            // Tang version content tren Client de co the Download
            if (localVersion >= version) {
                cc.log("Local Version >= Version");
                downloadEventManager.finishDownload();
                cc.sys.localStorage.setItem(DownloadEventManager.KEY_NEED_LOG_DOWNLOAD, 0);
                return;
            }
            var listener = new jsb.EventListenerAssetsManager(this._am, function (event) {
                var scene;
                switch (event.getEventCode()) {
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                        cc.log("No local manifest file found, skip assets update.");
                        //that.clickMeShowTempLayer();
                        break;
                    case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                        downloadEventManager.countFileDownload++;
                        var percent = downloadEventManager.countFileDownload / downloadEventManager._am.getTotalToDownload();
                        if (percent > 1)
                            percent = 1;
                        Event.instance().updateDownload(downloadEventManager.currentIdDownload, percent * 100);
                       // cc.log("FILE DOWNLOAD SUCCESS " + downloadEventManager.countFileDownload);
                        break;
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        cc.log("Fail to download manifest file, update skipped.");
                        // that.clickMeShowTempLayer();
                        break;
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                    case jsb.EventAssetsManager.UPDATE_FINISHED:
                        cc.log("Update finished. " + event.getMessage());
                        downloadEventManager.pauseDownload();
                        downloadEventManager.finishDownload();
                        var needToLogDownload = cc.sys.localStorage.getItem(DownloadEventManager.KEY_NEED_LOG_DOWNLOAD);
                        if (needToLogDownload) {
                            var convert = parseInt(needToLogDownload);
                            if (convert > 1) {
                                // user nay da tung download fail, ghi log Download thanh cong sau khi da tung that bai
                                var log = " Download thanh cong sau lan thu " + convert;
                                var s = "JavaScript error: assets/src/Lobby/EventMgr/DownloadEventManager.js line 3333TypeError: " + log + " " + (new Error()).stack;
                                cc.log(s);
                                NativeBridge.logJSManual("assets/src/Lobby/EventMgr/DownloadEventManager.js", "3333", s, NativeBridge.getVersionString());
                            }
                        }
                        cc.sys.localStorage.setItem(DownloadEventManager.KEY_NEED_LOG_DOWNLOAD, 0);

                        // gui log len server
                        var isLog = cc.sys.localStorage.getItem("writeLogDownload");
                        if (!isLog || isLog == undefined || isLog == "") {
                            cc.log("SEND LOG DOWNLOAD ");
                             var time = (new Date()).getTime();
                             time = time - downloadEventManager.startTime;
                            var logDownload = new CmdSendClientInfo();
                            logDownload.putData(time + "", 3);
                            GameClient.getInstance().sendPacket(logDownload);
                            cc.sys.localStorage.setItem("writeLogDownload", 1);
                        }
                        // logDownload.clean();
                        break;
                    case jsb.EventAssetsManager.UPDATE_FAILED:
                        cc.log("Update failed. " + event.getMessage());
                        var log = " Download Fail ";
                        var s = "JavaScript error: assets/src/Lobby/EventMgr/DownloadEventManager.js line 5555TypeError: " + log + " " + (new Error()).stack;
                        cc.log(s);
                        //NativeBridge.logJSManual("assets/src/Lobby/EventMgr/DownloadEventManager.js", "5555", s, NativeBridge.getVersionString());
                        downloadEventManager.pauseDownload();
                        downloadEventManager.reDownload();
                        break;
                    case jsb.EventAssetsManager.ERROR_UPDATING:
                        cc.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
                        break;
                    case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                        cc.log(event.getMessage());
                        break;
                    default:
                        break;
                }
            });
            downloadEventManager.startTime = (new Date()).getTime();
            cc.eventManager.addListener(listener, 1);
            this._am.update();
            this.countFileDownload = 0;
            this.isUpdating = true;
        }
    },

    finishDownload: function () {
        cc.log("DOWNLOAD EVENT MANAGER FINISH DOWNLOAD " + this.currentIdDownload);
        this.isUpdating = false;
        var idDownload = this.currentIdDownload;
        this.currentIdDownload = "";

        Event.instance().finishDownload(true, idDownload);
    },

    pauseDownload: function ()
    {
        if(this.isUpdating)
        {
            if (this._am) {
                this._am.saveDownloadState();
                this._am.cancelDownload();
                this._am = null;
            }
            this.isUpdating = false;
        }
    },

    reDownload: function () {
        cc.log("REDOWNLOAD " + this.countTryDownload);
        this.autoDownloaded = false;
        this.startAutoDownload(this.currentIdDownload);
    },

    updateDownload: function () {
        // cc.log("UPDATE DOWNLOAD ")
        if (this.isUpdating) {
            var time = (new Date()).getTime();
            time = time - downloadEventManager.startTime;
            if (time > 30000) {
            // if (time > 20000) {
                // neu thoi gian tu dong Download > 20s, thu Download lai lan nua
                this.pauseDownload();
                this.reDownload();
            }
        }
    },

    // kiem tra xem version content trong may da la moi nhat chua
    checkDownloadedManifest: function (path) {
        cc.log("checkDownloadedManifest *** " + path);
        var pathManifest = path + "/project.manifest1";

        try {
            cc.log("DIEN TIET ");
            var localManifest = new cc.Manifest(pathManifest);
            cc.log("DIEN TIET 1");
        }
        catch (e) {
            cc.log("EDFJLS " + e.stack);
        }

        cc.log("CHECK DOWNLOAD ");
        try {
            if (localManifest.isLoaded()) {
                var localVersion = localManifest.getVersion();
                cc.log("DA CO TRONG MAY");
                if (parseInt(localVersion >= event.getContentVersion(this.currentIdDownload))) {
                    cc.log("VERSION TRONG MAY THOA MAN " + path);
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        catch (e) {
            cc.log("EXCEPTION " + e.stack);
            return false;
        }
        //
        // if (jsb.fileUtils.isFileExist(pathManifest)) {
        //     try {
        //         var data = jsb.fileUtils.getStringFromFile(pathManifest);
        //     }
        //     catch (e) {
        //         return false;
        //     }
        //     cc.log("DA CO TRONG MAY");
        //     try{
        //         this.dataJson = JSON.parse(data);
        //         cc.log("JSON VERSION **** " + this.dataJson.version + " event id " + this.currentIdDownload);
        //         if (this.dataJson.version >= event.getContentVersion(this.currentIdDownload)) {
        //             jsb.fileUtils.addSearchPath(path, true);
        //             cc.log("VERSION TRONG MAY THOA MAN " + path);
        //             return true;
        //         }
        //         else {
        //             return false;
        //         }
        //     }
        //     catch(e) {
        //         return false;
        //     }
        // }
        // else {
        //     return false;
        // }
    },
})

DownloadEventManager.LOCAL_PATH = "res/Lobby/EventMgr/";
DownloadEventManager.STORAGE_PATH = "contentEventCardLive/";
DownloadEventManager.STORAGE_PATH_PRIVATE = "contentEventCardPrivate/";
DownloadEventManager.KEY_NEED_LOG_DOWNLOAD = "needToLogDownload1";

DownloadEventManager._inst = null;
DownloadEventManager.instance = function () {
    if (!DownloadEventManager._inst) {
        DownloadEventManager._inst = new DownloadEventManager();
    }
    return DownloadEventManager._inst;
};
var downloadEventManager = DownloadEventManager.instance();