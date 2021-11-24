var fr = fr || {};

var PMPK_INFO_CONFIG_KEY = "PMPK_INFO_CONFIG";
var B64_TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var URL_SERVICES = "https://login.service.zingplay.com/?service_name=get_config_iap&environment=false&os=_OS_&package_name=_PACK_";

var IAP_GAME_CONFIG = {
    package_name : "gsn.game.sam",
    license_key :"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj4Y/nt+XCQcgW3WZADCohUMyB1XW9MuL2mwTtq5KasPMzalEqPN6CaoUvtWKSfh51CeZCS9jWzvVSGwaJXYys9FihVACDK+wL7lKn2wzItqzw5idN9d0e5ZuM3uYLO3qp/9lY9eH+TZzEj8KRVueJQv4iIP4ZLfzt8tSec0c1GaPVjgqfvnCvPFWqR0YeqWsgBLb+9LKk5xzSlJVj+dscFECUSTllBncm1mfH+IVRspvbgRU+Rh/NDz3gqOXcuomTXkcDxT9vlpMoMdWZrGBwZD8/Fh+6fbAaTc2RNnam2d4A3zic78d8KWdKTLd7AdpBVabrD/HPkNATbpFLRB2MQIDAQAB",
    packages : {
        "1A":"pack_1",
        "2B":"pack_12",
        "1B":"pack_11",
        "10A":"pack_4",
        "10B":"pack_14",
        "20A":"pack_5",
        "20B":"pack_15",
        "5A":"pack_3",
        "5B":"pack_13",
        "2A":"pack_2"
    }
};
var IAP_PORTAL_CONFIG = {
    package_name : "com.gsn.zps.th",
    license_key : "Km0nHToPIjwnEzQfWEoOY1coQyciIyAyHi9/YiZ1Vh4+LCowJhMULXFwImUEFCERKRMJNTYsBxQ3HVYaAywBNwNBbgVAFEhw" +
        "HA8JDxQ9DAMOGWpAL3MXbD0zLQU8GAVWeFtTYCs9PlYlJCMmNj16SDcXQRMGFRIaLT4OOmJ7KEVcFhgxCTQ9GB00Sm8fSiw8RxQyHDMcGg" +
        "ZdEkgUPTQGIVMnPD8bPVRRDk0KHidUFxcEDgYKQWoyblxnIAMbIg07LFZKZBZ1JRhLUhVDE189CWJpPnEtGlxKNRoGQiUCUxAGSQcTMl0a" +
        "I10uLClIUVVQFi8WHREnUyF0Ggh3PmcUFBggOj4sMSk2BGYBHSpsISoZGBI8LQZoSVFzNhoWAzo9AQIHCnVXEVclLBQkKz9SOz0cdxMTRj" +
        "9rIB0ZMCklaAwfaCFtJxcGDxY1VQ4UJWVgMF4dZ0AxJiYtOyUpBg4QFEESMVQwNFwmK1pkcVdmHhwGElo6DQM9AwNLCGYaFzBQWgUsMB4/" +
        "cWM=",
    packages : {
        "1A":"com.gsn.zps.pack1",
        "1B":"com.gsn.zps.pack2",
        "2A":"com.gsn.zps.pack3",
        "2B":"com.gsn.zps.pack4",
        "5A":"com.gsn.zps.pack5",
        "5B":"com.gsn.zps.pack6",
        "10A":"com.gsn.zps.pack7",
        "10B":"com.gsn.zps.pack8",
        "20A":"com.gsn.zps.pack9",
        "20B":"com.gsn.zps.pack10",
        "50A":"com.gsn.zps.pack11",
        "50B":"com.gsn.zps.pack12",
        "100A":"com.gsn.zps.pack13",
        "100B":"com.gsn.zps.pack14"
    }
};

fr.paymentInfo = {
    nRetry : 5,

    isServerConfig : false,
    isConfig : false,
    config : null,

    init : function () {
        fr.portalState.init();

        this.loadCacheInfo();
        this.loadInfo();
    },

    hasInit : function () {
        if(this.isServerConfig) return true;

        if(this.nRetry <= 0) return true;

        return false;
    },

    // load config
    loadInfo: function () {
        var url = URL_SERVICES;
        var packageName = fr.platformWrapper.getPackageName() || "";
        var os = "";
        if (cc.sys.os === cc.sys.OS_IOS) {
            os = "apple";
        } else {
            os = "google";
        }
        url = StringUtility.replaceAll(url,"_OS_",os);
        url = StringUtility.replaceAll(url,"_PACK_",packageName);

        cc.log("##Portal::Load Payment Info " + url);
        this.requestJsonGet(url, this.responseInfo.bind(this));
    },

    loadCacheInfo : function () {
        var sCache = null;
        try {
            sCache = cc.sys.localStorage.getItem(PMPK_INFO_CONFIG_KEY);
            cc.log("##Portal::cacheConfig " + sCache);
            sCache = JSON.parse(sCache);
            if(sCache)
                this.setConfig(sCache);
        }
        catch(e) {
            cc.log("##Portal::cannot parse cache " + e);
        }
    },

    saveCacheInfo : function () {
        try {
            var txt = JSON.stringify(this.config);
            cc.sys.localStorage.setItem(PMPK_INFO_CONFIG_KEY, txt);
        }
        catch(e) {

        }
    },

    responseInfo : function (result, response) {
        if (result && (response.error == 0 || response.error == null)) {
            this.setConfig(response, true);

            this.openIAP();
        }
        else {
            if(this.isServerConfig) return;

            if(this.nRetry > 0 && gamedata.isPortal()) {
                this.nRetry--;

                this.loadInfo();
            }
            else {
                if(!this.isConfig) {
                    if(gamedata.isPortal())
                        this.setConfig(IAP_PORTAL_CONFIG, true);
                    else
                        this.setConfig(IAP_GAME_CONFIG, true);
                }

                this.openIAP();
            }
        }
    },

    setConfig: function (config, isSave) {
        cc.log("##Portal::setConfig " + JSON.stringify(config) + "|" + isSave);

        this.isConfig = true;
        this.isServerConfig = isSave;
        this.config = config;
        if (isSave && this.config) {
            this.saveCacheInfo();
        }
        this.unloadLicenseKey();
    },

    openIAP : function () {
        cc.log("fr.paymentInfo.openIAP ", this.isServerConfig, this.nRetry);
        if(GameClient.getInstance().connectState == ConnectState.CONNECTED) {
            if(this.isServerConfig || this.nRetry <= 0 || !gamedata.isPortal()) {
                fr.googleIap.init();
            }
        }
    },

    // get package id
    getProductID: function (pkgKey) {
        var packages;
        if (this.config)
            packages = this.config.packages;
        cc.log("getProductID packages: " + JSON.stringify(packages));
        if (this.config && packages && pkgKey in packages) {
            return packages[pkgKey];
        }
        return pkgKey;
    },

    getAllProductsID: function() {
        var ar = [];

        if(fr.paymentInfo && fr.paymentInfo.config) {
            var packages = fr.paymentInfo.config.packages;
            if(packages) {
                for(var s in packages) {
                    ar.push(packages[s]);
                }
            }
        }

        return ar;
    },

    // get base64 api
    getLicenseKey: function () {
        if (this.config) {
            return this.config.license_key;
        }
        return "";
    },

    unloadLicenseKey: function () {
        // if (!gamedata.isPortal()){
        //     return;
        // }
        if (this.config && this.config.license_key != null && this.config.license_key != "") {
            this.config.license_key = this.decodeXOR(this.config.license_key, "g$n_secret_n0!");
        }
    },

    // services and decode
    xmlHttpRequestGet: function (urlRequest, callbackFunc) {
        var timeout = setTimeout(function () {
            cc.log("xmlHttpRequestGet:request time out");
            if (callbackFunc != undefined) {
                callbackFunc(false, "Request time out!");
            }
        }, 10000);

        var callBack = function (result, data) {
            clearTimeout(timeout);
            if (callbackFunc != undefined) {
                callbackFunc(result, data);
            }
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
        xhr.open("GET", urlRequest, true);
        xhr.send();
    },

    requestJsonGet: function (urlRequest, callbackFunc) {
        this.xmlHttpRequestGet(urlRequest, function (result, response) {
            if (result) {
                var data = JSON.parse(response);
                cc.log("##Portal::ServicesResponse  " + response);
                if (data) {
                    callbackFunc(true, data);
                } else {
                    callbackFunc(false, "parse error: " + urlRequest + " : " + response);
                }
            } else {
                callbackFunc(false, response);
            }
        });
    },

    // decode base 64
    decodeXOR: function (data, key) {
        data = this.b64_decode(data);
        return this.xor_decrypt(key, data);
    },

    b64_decode: function (data) {
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, result = [];
        if (!data) {
            return data;
        }
        data += "";
        do {
            h1 = B64_TABLE.indexOf(data.charAt(i++));
            h2 = B64_TABLE.indexOf(data.charAt(i++));
            h3 = B64_TABLE.indexOf(data.charAt(i++));
            h4 = B64_TABLE.indexOf(data.charAt(i++));
            bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
            o1 = bits >> 16 & 0xff;
            o2 = bits >> 8 & 0xff;
            o3 = bits & 0xff;
            result.push(o1);
            if (h3 !== 64) {
                result.push(o2);
                if (h4 !== 64) {
                    result.push(o3);
                }
            }
        } while (i < data.length);
        return result;
    },

    xor_decrypt: function (key, data) {
        var self = this;
        var str = "";
        for (var i = 0; i < data.length; i++) {
            str += String.fromCharCode(data[i] ^ self.keyCharAt(key, i));
        }
        return str;
    },

    keyCharAt: function (key, i) {
        return key.charCodeAt(Math.floor(i % key.length));
    },
};

fr.portalState = {
    init:function() {
        this.loadState();
    },

    getDataPath:function() {
        return jsb.fileUtils.getWritablePath() + "/portal_state";
    },

    loadState:function() {
        var txt = jsb.fileUtils.getStringFromFile(this.getDataPath());

        if(txt == "" || txt == undefined) {
            this._state = {};
        }
        else {
            try {
                this._state = JSON.parse(txt);
            }
            catch(e){

            }
        }
        if(!this._state)
        {
            this._state = {}
        }
    },

    saveState:function() {
        var data = JSON.stringify(this._state);
        jsb.fileUtils.writeStringToFile(data, this.getDataPath());
    },

    setRequireLogout:function(isNeedLogout) {
        this._state.isNeedLogout = isNeedLogout;
        this.saveState();
    },

    isRequireLogout:function() {
        return this._state.isNeedLogout;
    },
    getAccessToken:function()
    {
        return this._state.accessToken
    }
};