/**
 * Created by sonbnt on 23/02/2021
 */

var AssetsManager = cc.Class.extend({
    DOWNLOAD_URL_PREFIX: "localhost/high/",
    DES_PREFIX: "",
    ASSET_PREFIX: "",

    ctor: function() {
        this.groupAssets = [];
    },

    /* region INITIALIZATION */
    init:function() {
        if (cc.sys.isNative) {
            this.ASSET_PREFIX = fr.NativeService.getFolderUpdateAssets() + "/";
        }

        this.localFileDownload = {};
        this.remoteFileDownload = {};
        this.listFileNeedDownLoad = [];

        this.getLocalDownloadManifest();
        this.getRemoteDownloadManifest();

        this.checkAllFilesValid();
    },

    getLocalDownloadManifest:function() {
        if (!jsb.fileUtils.isFileExist(this.ASSET_PREFIX + "res/local_download.txt"))
            return;
        var data = jsb.fileUtils.getStringFromFile(this.ASSET_PREFIX + "res/local_download.txt");
        try{
            this.localFileDownload = JSON.parse(data);
        }
        catch(e) {
            this.localFileDownload = {};
        }
        cc.log("this.localFileDownload:" + JSON.stringify(this.localFileDownload));
    },

    getRemoteDownloadManifest:function() {
        var data = jsb.fileUtils.getStringFromFile(this.getProjectManifestPath());

        if(!cc.sys.isNative)
            jsb.fileUtils.writeStringToFile(data, ("download.manifest"));
        else
            jsb.fileUtils.writeStringToFile(data, (this.ASSET_PREFIX +  "download.manifest"));

        var json = JSON.parse(data);
        if(json != null) {
            this.remoteFileDownload = json;

            this.initPrefixUrl();
            this.initGroup();

            cc.log("this.remoteFileDownload:" + json);
        }
    },

    initGroup: function() {
        this.defineGroup("TestEvent", "res/TestEvent/");
    },

    initPrefixUrl:function() {
        if (!cc.sys.isNative) {
            this.DES_PREFIX = "dwnld/";
        }
        else {
            this.DES_PREFIX = fr.NativeService.getFolderUpdateAssets() + "/";
            if (this.remoteFileDownload["packageUrl"]) {
                this.DOWNLOAD_URL_PREFIX = this.remoteFileDownload["packageUrl"] + "/";
            }
        }
        cc.log("this.DES_PREFIX = " + this.DES_PREFIX);
    },
    /* endregion INITIALIZATION */

    /* region GET - SET */
    defineGroup: function(groupName, path) {
        // this.groupAssets[groupName] = new AssetsGroup(groupName, path);;
    },

    getAssetsGroupByName: function(name) {
        return this.groupAssets[name];
    },

    getProjectManifestPath:function(){
        if (jsb.fileUtils.isFileExist("project.manifest"))
            return "project.manifest";
        else
            return "project.dat";
    },

    getNumFileInGroup: function(groupName){
        if (this.remoteFileDownload['group'] == null) {
            return -1;
        }
        var cfg = this.remoteFileDownload['group'][groupName];
        if (cfg == null)
            return 0;
        else return cfg.length;
    },

    addFileInfoToLocal:function(path, md5) {
        this.localFileDownload[path] = md5;
        jsb.fileUtils.writeStringToFile(JSON.stringify(this.localFileDownload), (this.ASSET_PREFIX + "res/local_download.txt"));
    },
    /* endregion GET - SET */

    /* region CHECKING */
    isNotSupportDownload: function(){
        if (cc.sys.platform == cc.sys.WP8 || cc.sys.platform == cc.sys.WINRT || cc.sys.platform == cc.sys.WIN32) return true;
        return !fr.NativeService.downloadFile;
    },

    checkAllFilesValidInGroup: function(groupName) {
        if(!cc.sys.isNative) return true;
        var list = this.remoteFileDownload['group'][groupName];
        // cc.log("list = " + JSON.stringify(list));
        for (var i = 0; i < list.length; ++i) {
            var path = list[i];
            // cc.log("Check file: " + path);
            if (this.remoteFileDownload['assets'][path] == null ||
                this.remoteFileDownload['assets'][path]['md5'] != this.localFileDownload[path]) {
                cc.log("Outdated path: " + path);
                return false;
            }
        }
        return true;
    },

    checkFilesValid:function(list) {
        var flagSave = false;

        //kiem tra md5 cua tat ca cac file da download trong list
        for (var i = 0; i < list.length; ++i) {
            var path = list[i];
            cc.log("check file valid: " + path);
            var localMd5 = this.localFileDownload[path];

            //md5 khong co trong local -> khong lam gi ca (sau khi check se download)
            if (localMd5 == null) continue;

            //md5 co trong local -> so sanh voi md5 remote
            //neu remote ko co path tuong ung || md5 cua path tuong ung khong trung voi local -> xoa file (sau do file moi se duoc download)
            if (this.remoteFileDownload['assets'][path] == null || this.remoteFileDownload['assets'][path]['md5'] != localMd5)
            {
                cc.log("check md5| remote md5: " + this.remoteFileDownload['assets'][path]['md5'] + ", local md5: " + localMd5);
                fr.download.deleteFile(this.DES_PREFIX + path);  // xoa file resource trong folder local
                delete this.localFileDownload[path];    // xoa path trong local download manifest (local_download.txt) 
                flagSave = true;
            }
        }
        if (flagSave) {
            cc.log("rewrite local_download.txt ");
            jsb.fileUtils.writeStringToFile(JSON.stringify(this.localFileDownload), this.ASSET_PREFIX + "res/local_download.txt");
        }
    },

    checkAllFilesValid:function() {
        var flagSave = false;
        for (var path in this.localFileDownload) {
            if (this.remoteFileDownload['assets'][path] == null ||
                this.remoteFileDownload['assets'][path]['md5'] != this.localFileDownload[path]) {
                fr.download.deleteFile(this.DES_PREFIX + path);
                delete this.localFileDownload[path];
                flagSave = true;
            }
        }
        if (flagSave) {
            cc.log("rewrite local_download.txt ");
            jsb.fileUtils.writeStringToFile(JSON.stringify(this.localFileDownload), this.ASSET_PREFIX + "res/local_download.txt");
        }
    },
    /* region CHECKING */

    // getCharacterAnimationFileMissing: function (_contentId){
    //     var retVal = [];
    //     var path = resAni[_contentId];
    //     var selectResourcePath = fr.ClientConfig.getInstance()._selectResource.folder + "/";
    //     cc.log("des prefix = " + AssetsManager.getInstance().DES_PREFIX + "  selectResourcePath: " + selectResourcePath);
    //     if ( !jsb.fileUtils.isFileExist(AssetsManager.getInstance().DES_PREFIX + "res/common/" + path + "/skeleton.xml")
    //         && !jsb.fileUtils.isFileExist("res/common/" + path + "/skeleton.xml")
    //     ) {
    //         retVal.push(path + "/skeleton.xml");
    //     }
    //     if (!jsb.fileUtils.isFileExist(AssetsManager.getInstance().DES_PREFIX + selectResourcePath + path + "/texture.plist")
    //         && !jsb.fileUtils.isFileExist(selectResourcePath + path + "/texture.plist")
    //     ) {
    //         retVal.push(path + "/texture.plist");
    //     }
    //     if (!jsb.fileUtils.isFileExist(AssetsManager.getInstance().DES_PREFIX + selectResourcePath + path + "/texture.png")
    //         && !jsb.fileUtils.isFileExist(selectResourcePath + path + "/texture.png")
    //     ) {
    //         retVal.push(path + "/texture.png");
    //     }
    //     cc.log("retVal:" + JSON.stringify(retVal));
    //     return retVal;
    // },
    //
    // checkDownloadCharacterAnimationFile: function (_contentId, callBack){
    //     var fileMissing = this.getCharacterAnimationFileMissing(_contentId);
    //     if (fileMissing.length <= 0 || this.isNotSupportDownload())
    //         return;
    //
    //     if (fileMissing.length > 0){
    //         var downloadResult = function(result){
    //             callBack(_contentId, result);
    //         };
    //         this.downloadListFiles(fileMissing, downloadResult);
    //     }
    // },

    /* region CORE DOWNLOAD FUNCTIONS */
    downloadGroup: function(groupName, callback) {
        var assetsGroup = this.getAssetsGroupByName(groupName);
        if(!assetsGroup) {
            Toast.makeToast("ERROR_DOWNLOAD_GROUP_" + groupName, Toast.LONG);
            return;
        }
        assetsGroup.downloadAllFiles(callback);
    },

    downloadListFiles:function(list, callback, isRecursiveCall, isRetry) {
        if(!cc.sys.isNative){
            callback(DOWNLOAD_ERROR.SUCCESS);
            return;
        }

        if (!isRecursiveCall) {     //first time this function called
            if (this.isNotSupportDownload()) {
                cc.log("not support download");
                callback(DOWNLOAD_ERROR.SUCCESS);
                return;
            }
            if (this.remoteFileDownload['packageUrl'] == null) {
                callback(DOWNLOAD_ERROR.FAILED);
                return;
            }

            this.checkFilesValid(list);
            list = this.addPrefixPath(list);
        }

        var onFileDownloadFinish = function() {
            AssetsManager.getInstance().downloadListFiles(list, callback, true);
        };

        var onFileDownloadError = function() {
            if (isRetry) {  // the download has failed twice on 1 file
                callback(DOWNLOAD_ERROR.FAILED);
                return;
            }
            AssetsManager.getInstance().downloadListFiles(list, callback, true, true);
        };

        for (var i = list.length - 1; i >= 0; i--){
            var curDownloadPath = list[i];
            if (curDownloadPath == "" || jsb.fileUtils.isFileExist(this.DES_PREFIX + curDownloadPath)) {
                list.splice(list.length - 1, 1);
                if (list.length == 0) {
                    cc.log("finish all file");
                    callback(DOWNLOAD_ERROR.SUCCESS);
                }
                else {
                    callback(DOWNLOAD_ERROR.FINISH_ONE_FILE);
                }
                if (curDownloadPath != "") {
                    cc.log("file  " + this.DES_PREFIX + curDownloadPath +"\n");
                    this.addFileInfoToLocal(curDownloadPath, this.remoteFileDownload['assets'][curDownloadPath]["md5"]);
                }
                continue;
            }
            cc.log("download file = " + curDownloadPath + "\n");
            fr.download.downloadFile(
                this.DOWNLOAD_URL_PREFIX + curDownloadPath,
                this.DES_PREFIX + curDownloadPath,
                this.remoteFileDownload['assets'][curDownloadPath]["md5"],
                function(result) {
                    if (result == -1) {
                        onFileDownloadFinish();
                    }
                    else if (result == -2) {
                        onFileDownloadError();
                    }
                }
            );
            break;
        }
    },

    // downloadOnBackground:function(numFiles) {
    //     if (this.listFileNeedDownLoad.length < numFiles){
    //         this.downloadListFiles(this.listFileNeedDownLoad, function(){});
    //     }
    //     else{
    //         var listFile = this.listFileNeedDownLoad.slice(0, numFiles);
    //         this.downloadListFiles(listFile, function(){});
    //     }
    // },
    /* endregion CORE DOWNLOAD FUNCTIONS */

    /* region UTILITIES */
    addPrefixPath:function(list) {
        for (var i = 0; i < list.length; ++i) {
            list[i] = this.addPrefixOnePath(list[i]);
        }
        return list;
    },

    addPrefixOnePath:function(path) {
        for (var fPath in this.remoteFileDownload['assets']) {
            if (fPath.indexOf(path) != -1) {
                return fPath;
            }
        }
        cc.log("Cannot resolve path to download: " + path);
        return "";
    }
    /* endregion UTILITIES */
});

AssetsManager._instance = null;
AssetsManager.getInstance = function() {
    if(AssetsManager._instance == null) {
        AssetsManager._instance = new AssetsManager();
    }
    return AssetsManager._instance;
};
assetsManager = AssetsManager.getInstance();

AssetsManager.MERIC_START = 0;
AssetsManager.MERIC_DONE = 1;
AssetsManager.MERIC_UPDATE = 2;

var AssetsGroup = cc.Class.extend({

    ctor: function(name, rootPath) {
        this.groupName = name;
        this.rootPath = rootPath;
        this.listFileNeedDowload = [];
        this.numDownloaded = 0;
        this.numFilesTotal = this.getNumFileInGroup();
        this.assetState = AssetsGroup.OUTDATE;      // UP_TO_DATE | OUT_DATE | DOWNLOADING

        this.updateState();
    },

    updateState: function() {
        if(this.checkFileValid()) {
            this.assetState = AssetsGroup.UPTODATE;
            this.numDownloaded = this.numFilesTotal;
        }
        else
            this.assetState = AssetsGroup.OUTDATE;
    },

    /* region GET - SET */
    getListFile: function() {
        if(AssetsManager.getInstance().remoteFileDownload['group'] == null) {
            return [];
        }
        return AssetsManager.getInstance().remoteFileDownload['group'][this.groupName];
    },

    getNumFileInGroup: function() {
        return AssetsManager.getInstance().getNumFileInGroup(this.groupName);
    },

    setLayerDL: function(layer) {
        this.layerDL = layer;
    },

    getAssetState: function() {
        return this.assetState;
    },

    checkFileValid: function() {
        return AssetsManager.getInstance().checkAllFilesValidInGroup(this.groupName);
    },
    /* endregion GET - SET */

    /* region CORE DOWNLOAD FUNCTIONS */
    updateListFileNeededDownload: function() {
        this.numDownloaded = 0;
        var localFileDownload = AssetsManager.getInstance().localFileDownload;
        var remoteFileDownload = AssetsManager.getInstance().remoteFileDownload;
        var list = this.getListFile();
        var listNeedDownload = [];
        for(var i = 0; i < list.length; i++) {
            var path = list[i];

            if(remoteFileDownload['assets'][path] == null) {
                continue;
            }

            if(localFileDownload[path] == null || remoteFileDownload['assets'][path]["md5"] != localFileDownload[path])
                listNeedDownload.push(path);
            else this.numDownloaded++;
        }
        // this.listFileNeedDownload.length = 0;
        this.listFileNeedDownload = listNeedDownload;

    },

    downloadAllFiles: function(callback) {
        this.updateListFileNeededDownload();
        if(this.listFileNeedDownload.length == 0) {
            if(callback) callback();
            return;
        }

        var downloadResult = function(result) {
            this.onUpdate(result, callback);
        }.bind(this);

        this.assetState = AssetsGroup.DOWNLOADING;
        AssetsManager.getInstance().downloadListFiles(this.listFileNeedDownload, downloadResult);

        if(this.numDownloaded > 0) {
            AssetsManager.sendMetricLog(AssetsManager.MERIC_UPDATE, this.name);
        } else {
            AssetsManager.sendMetricLog(AssetsManager.MERIC_START, this.name);
        }

        if(this.layerDL && this.layerDL.updateGUI) {
            this.layerDL.updateGUI();
        }
    },

    onUpdate: function(state, callback) {
        switch(state) {
            case DOWNLOAD_ERROR.SUCCESS:
                this.numDownloaded++;
                cc.log("DOWNLOAD SUCCESSFUL! " + this.groupName);
                this.assetState = AssetsGroup.UPTODATE;
                callback();
                break;
            case DOWNLOAD_ERROR.FILE_UP_TO_DATE:
            case DOWNLOAD_ERROR.FINISH_ONE_FILE:
                this.numDownloaded++;
                cc.log("UPDATE PROCESS - " + this.groupName + ": " + this.numDownloaded  + "/" + this.numFilesTotal);
                if(this.numDownloaded == this.numFilesTotal) {
                    AssetsManager.sendMetricLog(AssetsManager.MERIC_DONE, this.name);
                }
                break;
            case DOWNLOAD_ERROR.FAILED:
                cc.log("DOWNLOAD FAILED! " + this.groupName);
                sceneMgr.showOKDialog("Download error. Pls try again");
                this.assetState = AssetsGroup.OUTDATE;
                break;
        }

        if(this.layerDL && this.layerDL.updateGUI) {
            this.layerDL.updateGUI();
        }
    }
    /* endregion CORE DOWNLOAD FUNCTIONS */

    // onDownloadFinished: function() {
    //     if(this.layerDL) {
    //         this.layerDL.onUpdateGUI();
    //     }
    // },

    // onDownloadFailed: function() {
    //     if(this.layerDL) {
    //         this.layerDL.onUpdateGUI();
    //     }
    // },

    // onFinishOnFile: function() {
    //     if(this.layerDL) {
    //         this.layerDL.onUpdateGUI();
    //     }
    // }
});

AssetsGroup.OUTDATE = 0;
AssetsGroup.DOWNLOADING = 1;
AssetsGroup.UPTODATE = 2;

CmdSendMetricDownloadFeature = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_METRIC_UPDATE_FEATURE);
    },

    putData: function (action, feature) {
        var versionCode = NativeBridge.getVersionCode();
        //pack
        this.packHeader();
        this.putByte(action);
        this.putByte(feature);
        this.putInt(versionCode);
        this.updateSize();
    }
});

AssetsManager.sendMetricLog = function(action, name) {
    var feature = 0;
    switch(name) {
        case "bauCua":
            feature = 0;
            break;
        case "videoPoker":
            feature = 1;
            break
    }
    var cmd = new  CmdSendMetricDownloadFeature();
    cmd.putData(action, feature);
    GameClient.getInstance().sendPacket(cmd);
};