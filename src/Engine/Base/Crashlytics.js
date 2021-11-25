var fr = fr || {};

fr.crashLytics = {

    init : function () {
        cc.log("init crashlytic success");
        if (gameMgr.checkOldNativeVersion()) return;
        // default log
        fr.crashLytics.logScene(LoginScene.className);
        fr.crashLytics.setString("Version: ", NativeBridge.getVersionString());
    },

    logScene : function (scene) {
        if (gameMgr.checkOldNativeVersion()){
            return;
        }
        fr.crashLytics.log("OpenScene::" + scene);
    },

    logGUI : function (gui) {
        if (gameMgr.checkOldNativeVersion()){
            return;
        }
        fr.crashLytics.log("OpenGUI::" + gui);
    },

    logPressButton : function (btn) {
        if (gameMgr.checkOldNativeVersion()){
            return;
        }
        fr.crashLytics.log("PressButton::" + btn);
    },

    logGameClient : function (state) {
        if (gameMgr.checkOldNativeVersion()){
            return;
        }
        fr.crashLytics.log("LogGameClient::" + state);
    },

    log : function(msg) {
        if (gameMgr.checkOldNativeVersion()){
            return;
        }
        cc.log("Crashlytics::log " + msg);
        if(fr.platformWrapper.pluginPlatform != null) {
            fr.platformWrapper.pluginPlatform.callFuncWithParam("crashlyticsLog",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, msg));
        }
    },

    setString : function(key, value) {

        if (gameMgr.checkOldNativeVersion()){
            return;
        }
        // cc.log("Crashlytics::setString " + key, value);
        if(fr.platformWrapper.pluginPlatform != null) {
            var data = {key:key, value:value};
            fr.platformWrapper.pluginPlatform.callFuncWithParam("crashlyticsSetString",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
        }
    },

    setBool:function(key, value) {
        if (gameMgr.checkOldNativeVersion()){
            return;
        }
        if(fr.platformWrapper.pluginPlatform != null) {
            var data = {key:key, value:value};
            fr.platformWrapper.pluginPlatform.callFuncWithParam("crashlyticsSetBool",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
        }
    },

    setDouble:function(key, value) {
        if (gameMgr.checkOldNativeVersion()){
            return;
        }
        if(fr.platformWrapper.pluginPlatform != null) {
            var data = {key:key, value:value};
            fr.platformWrapper.pluginPlatform.callFuncWithParam("crashlyticsSetDouble",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
        }
    },

    setInt:function(key, value) {
        if (gameMgr.checkOldNativeVersion()){
            return;
        }
        if(fr.platformWrapper.pluginPlatform != null) {
            var data = {key:key, value:value};
            fr.platformWrapper.pluginPlatform.callFuncWithParam("crashlyticsSetInt",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, JSON.stringify(data)));
        }
    },

    setUserIdentifier:function(userId) {
        if (gameMgr.checkOldNativeVersion()){
            return;
        }
        if(fr.platformWrapper.pluginPlatform != null) {
            fr.platformWrapper.pluginPlatform.callFuncWithParam("crashlyticsSetUserIdentifier",
                new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, userId));
        }
    },
};