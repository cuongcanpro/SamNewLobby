
var GameConfig = cc.Class.extend({
    ctor: function () {
        this.clear(true);
    },

    clear: function (isInit) {
        this.config = {};
        this.configVersion = -1;
    },

    loadCacheConfig: function () {
        this.clear();
        var version = -1;
        var json = "";
        var obj = {};

        var version = parseInt(cc.sys.localStorage.getItem(GameConfig.KEY_SAVE_CONFIG_VERSION));
        if (isNaN(version)) {
            version = -1;
        }

        if (version >= 0) {
            var json = cc.sys.localStorage.getItem(GameConfig.KEY_SAVE_CONFIG_JSON);
            if (json) {
                cc.log("+++GameConfig Cache : " + json);

                try {
                    obj = JSON.parse(json);
                } catch (e) {
                    version = -1;
                }
            } else {
                version = -1;
            }
        }

        if (version >= 0) {
            try {
                this.config = obj;
                this.configVersion = version;

                this.parseConfig();
            } catch (e) {
                this.config = {};
                this.configVersion = -1;
            }
        }
    },

    loadServerConfig: function (json) {
        this.clear();
        cc.log("+++GameConfig : " + json.length + " -> " + json);
        try {
            this.config = JSON.parse(json);
            this.configVersion = this.config.configVersion;
            this.parseConfig();
            this.saveConfig();
        } catch (e) {
            cc.error("###GameData::server config error " + e.stack);
        }
    },

    saveConfig: function () {
        if (this.config && this.configVersion >= 0) {
            cc.sys.localStorage.setItem(GameConfig.KEY_SAVE_CONFIG_JSON, JSON.stringify(this.config));
            cc.sys.localStorage.setItem(GameConfig.KEY_SAVE_CONFIG_VERSION, this.configVersion);
        }
    },

    parseConfig: function () {
        channelMgr.setConfig(this.config["Channel"], this.config["chankenh"]);
        vipMgr.setConfig(this.config);
        supportMgr.setConfig(this.config);
       // football.loadConfig(this.config);
    },
});

GameConfig.KEY_SAVE_CONFIG_JSON = "game_json_config_server";
GameConfig.KEY_SAVE_CONFIG_VERSION = "game_version_config_server";


GameConfig.instance = null;
GameConfig.getInstance = function () {
    if (!GameConfig.instance) {
        GameConfig.instance = new GameConfig();
    }
    return GameConfig.instance;
};
var gameConfig = GameConfig.getInstance();