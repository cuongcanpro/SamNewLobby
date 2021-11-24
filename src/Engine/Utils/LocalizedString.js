/**
 * Created by HunterPC on 8/27/2015.
 */

var g_localization = null;

var NUMBER_LOAD_FAIL = 0;

var LocalizedString = cc.Class.extend({

    ctor : function () {
        this._localizedStrings = {};
        this._gameConfigs = {};
    },

    preloadLocalized : function (onFinishFunc) {
        // this.loadLocalized();
        // this.gameConfig();

        this.onFinishFunc = onFinishFunc;
        this.loadLocalized(function () {
            this.gameConfig(function () {
                this.onFinishFunc.call();
            }.bind(this),this);
        }.bind(this),"" );
    },

    loadLocalized : function (onFinish, key) {
        var contents = "";
        var fname = "res/Localized_vi";

        if (key !== ""){
            fname = key;
        }


        if (!cc.sys.isNative){
            fname += versionCode;
            fname = srcPath + fname;
        }
        cc.log("###Load Localized : " + fname);
        cc.loader.loadTxt(fname, function (error, txt) {
            if (error != null) {
                cc.log("Load localization file error!");
                if (NUMBER_LOAD_FAIL < 10){
                    NUMBER_LOAD_FAIL ++;
                    this.loadLocalized(onFinish, "");
                } else {
                    if (onFinish !== null){
                        onFinish.call();
                    }
                }
            }
            else {
                contents = txt;
                this.loadRawLocalized(contents);
                if (onFinish !== null){
                    onFinish.call();
                }
            }
        }.bind(this));
    },
    loadRawLocalized: function(contents){
        var lines = contents.split('\n');

        for(var i in lines) {
            var line = lines[i];
            if (line.indexOf("/*", 0) == -1 &&
                line.indexOf("//", 0) == -1 &&
                line.indexOf("*/", 0) == -1) //filter the valid string of one line
            {
                var validPos = line.indexOf('=', 0);
                if (validPos != -1) {
                    var keyStr = line.substring(0, validPos - 1);
                    // get valid string
                    var subStr = line.substring(validPos + 1, line.length - 1);

                    //trim space
                    keyStr = keyStr.slice(this.findFirstNotOf(keyStr, " \t"));
                    keyStr = keyStr.slice(0, this.findLastNotOf(keyStr, " \t") + 1);

                    subStr = subStr.slice(this.findFirstNotOf(subStr, " \t"));
                    subStr = subStr.slice(0, this.findLastNotOf(subStr, " \t") + 1);

                    //trim \"
                    keyStr = keyStr.slice(this.findFirstNotOf(keyStr, "\""));
                    keyStr = keyStr.slice(0, this.findLastNotOf(keyStr, "\"") + 1);
                    var findPosition = subStr.indexOf('\"', 0);
                    subStr = subStr.slice(this.findFirstNotOf(subStr, "\""));

                    //trim ; character and last \" character
                    subStr = subStr.slice(0, this.findLastNotOf(subStr, ";") + 1);
                    subStr = subStr.slice(0, this.findLastNotOf(subStr, "\"") + 1);

                    //replace line feed with \n
                    subStr = subStr.replace(/\\n/g, "\n");

                    if (keyStr in this._localizedStrings) {
                        cc.log("ERROR : LocalizedString added key " + keyStr + " in " );
                    }
                    else {
                        this._localizedStrings[keyStr] = subStr;
                    }
                }
            }
        }
    },

    gameConfig : function (onFinish,target) {
        var contents = "";
        if(cc.sys.isNative || true){
            var config = "res/GameConfig";
            if (!cc.sys.isNative){
                config += versionCode;
                config = srcPath + config;
            }
            cc.log("###Load gameConfig : " + config);
            cc.loader.loadTxt(config, function (error, txt) {
                if (error != null) {
                    cc.log("Load GameConfig file error!");
                    onFinish.call(target,false);

                }
                else {
                    contents = txt;
                    this.loadRawGameConfig(contents);
                    onFinish.call(target,true);
                }
            }.bind(this));
        }

        else
            contents = cc.loader._loadTxtSync(srcPath + "res/GameConfig"+ versionCode);

    },
    loadRawGameConfig: function(contents)
    {
        var lines = contents.split('\n');

        for(var i in lines)
        {
            var line = lines[i];
            if (line.indexOf("/*",0) == -1 &&
                line.indexOf("//",0) == -1 &&
                line.indexOf("*/",0) == -1) //filter the valid string of one line
            {
                var validPos = line.indexOf('=', 0);
                if (validPos != -1)
                {
                    var keyStr = line.substring(0, validPos - 1);
                    // get valid string
                    var subStr = line.substring(validPos + 1, line.length - 1);

                    //trim space
                    keyStr = keyStr.slice(this.findFirstNotOf(keyStr," \t"));
                    keyStr = keyStr.slice(0,this.findLastNotOf(keyStr," \t") +1);

                    subStr = subStr.slice(this.findFirstNotOf(subStr," \t"));
                    subStr = subStr.slice(0,this.findLastNotOf(subStr," \t") +1);

                    //trim \"
                    keyStr = keyStr.slice(this.findFirstNotOf(keyStr,"\""));
                    keyStr = keyStr.slice(0,this.findLastNotOf(keyStr,"\"") +1);
                    var  findPosition = subStr.indexOf('\"', 0);
                    subStr = subStr.slice(this.findFirstNotOf(subStr,"\""));

                    //trim ; character and last \" character
                    subStr = subStr.slice(0,this.findLastNotOf(subStr,";") +1);
                    subStr = subStr.slice(0,this.findLastNotOf(subStr,"\"") +1);

                    //replace line feed with \n
                    subStr.replace(/\\n/g,"\n");

                    this._gameConfigs[keyStr] = subStr;
                }
            }
        }
    },

    findLastNotOf:function(strSource,text) {
        var sourceLen = strSource.length;
        var strLen = text.length;
        if (strLen >sourceLen)
        {
            return -1;
        }
        var i = sourceLen - 1;
        while (i >= 0)
        {
            var result = false;
            for (var k = 0; k < strLen; k++)
            {
                if (text[k] == strSource[i])
                {
                    result = true;
                    break;
                }
            }
            if(result)
            {
                i-=1;
            }
            else
            {
                return i;
            }
        }
        return -1;
    },

    findFirstNotOf:function(strSource, text) {
        var sourceLen = strSource.length;
        var strLen = text.length;
        var i = 0;
        while (i < sourceLen - 1) {
            var result = false;
            for (var k = 0; k < strLen; k++) {
                if (text[k] == strSource[i]) {
                    result = true;
                    break;
                }
            }
            if (result) {
                i += 1;
            } else {
                return i;
            }

        }
        return -1;
    },

    getText : function (key) {
        if(key in this._localizedStrings)
        {
            return this._localizedStrings[key];
        }
        return key;
    },

    getGameConfig : function (key) {
        if(key in this._gameConfigs)
        {
            return this._gameConfigs[key];
        }
        return key;
    }
});

LocalizedString.preload = function (callFunc) {
    if(g_localization == null)
    {
        g_localization = new LocalizedString();
    }
    return g_localization.preloadLocalized(callFunc);
},

LocalizedString.add = function (fname) {
    if(g_localization == null)
    {
        g_localization = new LocalizedString();
    }
    return g_localization.loadLocalized(null, fname);
};

LocalizedString.to = function (keyLocalized) {
    if(g_localization == null)
    {
        g_localization = new LocalizedString();
    }
    return g_localization.getText(keyLocalized);
};

var GameConfig = function () {
    
};

LocalizedString.config = function (key) {
    if(g_localization == null)
    {
        g_localization = new LocalizedString();
    }
    return g_localization.getGameConfig(key);
};

var localized = function(keyLocalized) {
    return LocalizedString.to(keyLocalized)
};