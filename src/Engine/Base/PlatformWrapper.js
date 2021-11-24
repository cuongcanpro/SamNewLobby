/**
 * Created by KienVN on 10/23/2015.
 */
var fr = fr || {};
fr.platformWrapper = {
    init: function () {
        if (plugin.PluginManager == null) return false;
        if (fr.platformWrapper.pluginPlatform == null) {
            var pluginManager = plugin.PluginManager.getInstance();
            fr.platformWrapper.pluginPlatform = pluginManager.loadPlugin("PlatformWrapper");
        }
        return true;
    },

    getScriptVersion:function() {
        var project_manifest_path = fr.NativeService.getFolderUpdateAssets()+ '/' + 'project.manifest';
        var manifestData = jsb.fileUtils.getStringFromFile(project_manifest_path);
        var version = "0";
        try{
            var version = JSON.parse(manifestData).version;
        }catch(e){

        }
        return version;
    },

    getPhoneNumber: function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getPhoneNumber");
        }

        return "";
    },

    getMailAccount: function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getMailAccount");
        }
        return "";
    },

    getDeviceModel: function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getDeviceModel");
        }
        return "";
    },

    getAvailableRAM: function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getAvailableRAM");
        }
        return -1;
    },

    getVersionCode: function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getVersionCode");
        }
        return -1;
    },

    getOSVersion: function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getOSVersion");
        }
        return "";
    },

    getConnectionStatus: function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("getConnectionStatus");
        }
        return -1;
    },

    hasNetwork: function () {
        if (fr.platformWrapper.getConnectionStatus() == CONNECTION_STATUS.NO_NETWORK) {
            return false;
        } else return true;
    },

    getConnectionStatusName: function () {
        var connectionType = this.getConnectionStatus();
        switch (connectionType) {
            case 0:
                return "unknown";
            case 1:
                return "3g";
            case 2:
                return "wifi";
        }
        return "";
    },

    getOsName: function () {
        if (cc.sys.platform == cc.sys.WIN32) {
            return "Win32";
        }
        if (cc.sys.platform == cc.sys.ANDROID) {
            return "Android";
        }
        if (cc.sys.platform == cc.sys.IPAD || cc.sys.platform == cc.sys.IPHONE) {
            return "IOS";
        }
        if (cc.sys.platform == cc.sys.WP8) {
            return "WindowPhone8";
        }
        return "";
    },

    getClientVersion: function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getAppVersion");
        }
        return "1.0";
    },

    getExternalDataPath: function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getExternalDataPath");
        }
        return jsb.fileUtils.getWritablePath();
    },

    addNotify: function (notify) {
        if (this.pluginPlatform != null) {
            this.pluginPlatform.callFuncWithParam("addNotify",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(notify)));
        }
    },

    showNotify: function () {
        if (this.pluginPlatform != null) {
            this.pluginPlatform.callFuncWithParam("showNotify", null);
        }
    },

    cancelAllNotification: function () {
        if (this.pluginPlatform != null) {
            this.pluginPlatform.callFuncWithParam("cancelAllNotification", null);
        }
    },

    getDeviceID: function () {
        if (this.pluginPlatform != null) {
            var deviceID = this.pluginPlatform.callStringFuncWithParam("getDeviceID");
            if (deviceID == "") {
                return this.getMailAccount();
            }
            return deviceID;
        }
        return "";
    },

    //accountType: google , zingme , facebook , zalo
    //openAccount: socialID, voi zingme la username
    trackLoginGSN: function (_accountId, _accountType, _openAccount, _zingName) {
        if (this.pluginPlatform != null) {
            var data = {
                accountId: _accountId,
                accountType: _accountType,
                openAccount: _openAccount,
                zingName: _zingName
            };

            this.pluginPlatform.callFuncWithParam("trackLoginGSN",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
        } else {
            cc.error("trackLoginGSN-pluginPlatform is null");
        }
    },

    //zalo uri = "com.zing.zalo";
    isInstalledApp: function (url) {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callIntFuncWithParam("isInstalledApp",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, url));
        }
        return 0;
    },

    isInstalledFacebookApp: function () {
        if (this.isAndroid()) {
            return this.isInstalledApp("com.facebook.katana");
        } else if (this.isIOs()) {
            return true;
        }

        return false;
    },

    isInstalledZaloApp: function () {
        if (this.isAndroid()) {
            return this.isInstalledApp("com.zing.zalo");
        } else if (this.isIOs()) {
            return true;
        }
        return false;
    },

    getSimOperator: function () {
        if (this.isAndroid()) {
            if (this.pluginPlatform != null) {
                return this.pluginPlatform.callStringFuncWithParam("getSimOperator").toLowerCase();
            }
        } else if (this.isIOs()) {
            return "";
        }

        return "";
    },

    getNetworkOperator: function () {
        if (this.isAndroid()) {
            if (this.pluginPlatform != null) {
                return this.pluginPlatform.callStringFuncWithParam("getNetworkOperator").toLowerCase();
            }
        } else if (this.isIOs()) {
            return "";
        }

        return "";
    },

    getSimState: function () {
        if (this.isAndroid()) {
            if (this.pluginPlatform != null) {
                return this.pluginPlatform.callIntFuncWithParam("getSimState");
            }
        } else if (this.isIOs()) {
            return SIM_STATE.READY;
        }

        return 0;
    },

    getTotalUpdateAssetMemorySize: function () {
        if (this.isMobile()) {
            if (this.pluginPlatform != null) {
                return this.pluginPlatform.callIntFuncWithParam("getTotalUpdateAssetMemorySize");
            }
        }
        return -1;
    },

    getAvailableUpdateAssetMemorySize: function () {
        if (this.isMobile()) {
            if (this.pluginPlatform != null) {
                return this.pluginPlatform.callIntFuncWithParam("getAvailableUpdateAssetMemorySize");
            }
        }
        return -1;
    },

    getAvailableInternalMemorySize: function () {
        if (this.isAndroid()) {
            if (this.pluginPlatform != null) {
                return this.pluginPlatform.callIntFuncWithParam("getAvailableInternalMemorySize");
            }
        } else if (this.isIOs()) {
            return null;
        }

        return -1;
    },

    getTotalInternalMemorySize: function () {
        if (this.isAndroid()) {
            if (this.pluginPlatform != null) {
                return this.pluginPlatform.callIntFuncWithParam("getTotalInternalMemorySize");
            }
        }

        return -1;
    },

    getAvailableExternalMemorySize: function () {
        if (this.isAndroid()) {
            if (this.pluginPlatform != null) {
                return this.pluginPlatform.callIntFuncWithParam("getAvailableExternalMemorySize");
            }
        } else if (this.isIOs()) {
            return null;
        }

        return -1;
    },

    getTotalExternalMemorySize: function () {
        if (this.isAndroid()) {
            if (this.pluginPlatform != null) {
                return this.pluginPlatform.callIntFuncWithParam("getTotalExternalMemorySize");
            }
        } else if (this.isIOs()) {
            return null;
        }

        return 1;
    },

    getPackageName: function () {
        if (this.pluginPlatform) {
            return this.pluginPlatform.callStringFuncWithParam("getPackageName");
        }
        return null;
    },

    sendSMS: function (content, serviceNumber) {
        if (this.pluginPlatform != null) {
            var data = {
                message: content,
                recipent: serviceNumber
            };
            this.pluginPlatform.callFuncWithParam("sendMessage",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
        }
    },

    isAndroid: function () {
        return cc.sys.os === cc.sys.OS_ANDROID;
    },

    isIOs: function () {
        return cc.sys.os === cc.sys.OS_IOS;
    },

    isMobile: function () {
        return cc.sys.os === cc.sys.OS_ANDROID || cc.sys.os === cc.sys.OS_IOS || cc.sys.os === cc.sys.OS_WP8 || cc.sys.os === cc.sys.OS_WINRT;
    },

    isEmulator : function () {

    },

    // add zingplay
    getRefer : function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getRefer");
        }
        return "";
    },

    openURL : function (url) {
        if (this.pluginPlatform != null) {
            this.pluginPlatform.callFuncWithParam("openURL",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, url));
        }
    },

    getVersionName : function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getAppVersion");
        }
        return "";
    },

    getGameVersion : function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callStringFuncWithParam("getGameVersion");
        }
        return "";
    },

    logJSError: function(fName, line, msg, jsVersion) {
        // jsb.reflection.callStaticMethod("com.gsn.tracker.GSNTracker", "logJSError", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
        //     fName + "", line + "", msg + "", jsVersion);
        if (this.pluginPlatform != null) {
            var data = {
                Param1: fName,
                Param2: line,
                Param3: msg,
                Param4: jsVersion
            };

            this.pluginPlatform.callFuncWithParam("logJSError",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeStringMap, data));
        } else {
            cc.error("logJSError-pluginPlatform is null");
        }
    },

    crashlyticsLog:function(msg) {
        if(this.pluginPlatform != null) {
            this.pluginPlatform.callFuncWithParam("crashlyticsLog",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, msg));
        }
    },
    crashlyticsSetString:function(key, value) {
        if(this.pluginPlatform != null) {
            var data = {key:key, value:value};
            this.pluginPlatform.callFuncWithParam("crashlyticsSetString",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
        }
    },
    crashlyticsSetBool:function(key, value) {
        if(this.pluginPlatform != null) {
            var data = {key:key, value:value};
            this.pluginPlatform.callFuncWithParam("crashlyticsSetBool",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
        }
    },
    crashlyticsSetDouble:function(key, value) {
        if(this.pluginPlatform != null) {
            var data = {key:key, value:value};
            this.pluginPlatform.callFuncWithParam("crashlyticsSetDouble",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
        }
    },
    crashlyticsSetInt:function(key, value) {
        if(this.pluginPlatform != null) {
            var data = {key:key, value:value};
            this.pluginPlatform.callFuncWithParam("crashlyticsSetInt",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
        }
    },
    crashlyticsSetUserIdentifier:function(userId) {
        if(this.pluginPlatform != null) {
            this.pluginPlatform.callFuncWithParam("crashlyticsSetUserIdentifier",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, userId));
        }
    },
    testCrashlytics:function()
    {
        fr.platformWrapper.crashlyticsSetString("last_UI_action", "logged_in" /* string value */);
        fr.platformWrapper.crashlyticsSetBool("is_vip", true /* boolean value */);
        fr.platformWrapper.crashlyticsSetDouble("Gold", 100000.0 /* double value */);
        fr.platformWrapper.crashlyticsSetInt("current_level", 1 /* int value */);
        fr.platformWrapper.crashlyticsLog("test");
        fr.platformWrapper.crashlyticsSetUserIdentifier("demo");
    },

    // x86
    isX86Device : function () {
        if (this.pluginPlatform != null) {
            return this.pluginPlatform.callBoolFuncWithParam("isX86Device");
        }
        return false;
    },

    logDevice : function () {
        try {
            var isX86 = fr.platformWrapper.isX86Device();
            fr.platformWrapper.logCustom("DEVICE",isX86 ? "X86" : "ARM");
        }
        catch(e) {

        }
    },

    checkInstallApp: function (packageName) {
        try {
            var isInstall = fr.tracker.isPackageExisted(packageName);
            return parseInt(isInstall);
        }
        catch (e) {
            return 0;
        }
    }
};

var SIM_STATE = {
    UNKNOWN: 0,
    ABSENT: 1,
    PIN_REQUIRED: 2,
    PUK_REQUIRED: 3,
    NETWORK_LOCKED: 4,
    READY: 5,
};

var CONNECTION_STATUS = {
    NO_NETWORK: 0,
    CELULAR_DATA: 1,
    WIFI: 2
};