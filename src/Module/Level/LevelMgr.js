var LevelMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.levelConfig = [];
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case LevelMgr.CMD_LEVEL_CONFIG: {
                var cmd = new CmdReceivedLevelConfig(pk);
                cmd.clean();
                this.loadConfig(cmd);
                return true;
            }
            case LevelMgr.CMD_LEVEL_UP: {
                var cmd = new CmdReceivedLevelUp(pk);
                cc.log("level up: ", JSON.stringify(cmd));

                var gui = sceneMgr.getMainLayer();
                if (gui instanceof BoardScene) {
                    gui.showLevelUp(cmd);
                }
                break;
            }

        }
        return false;
    },

    loadConfig: function (levelConfig) {
        this.levelConfig = [];
        var json = JSON.stringify(levelConfig);
        cc.log("+++LevelConfig : " + json.length + " -> " + json);

        try {
            var levelData;
            for (var i = 0; i <= levelConfig.maxLevel; i++){
                this.levelConfig.push({
                    level: i,
                    exp: Number(levelConfig.level[i]),
                    bonus: Number(levelConfig.bonus[i]["percentBonus"])
                });
            }
        } catch (e) {
            cc.error("###GameData::level config error " + e);
        }
    },

    getLevelString: function(level, levelExp) {
        if (!this.levelConfig || this.levelConfig.length == 0)
            return level + "(0%)";
        var percentStr = "max";
        if (level < this.levelConfig.length - 1)
            percentStr = Math.floor(this.getCurrentLevelCompleted(level, levelExp) * 100).toFixed(0) + "%";
        return level + " (" + percentStr + ")";
    },

    getCurrentLevelCompleted: function(level, levelExp) {
        if (!this.levelConfig || this.levelConfig.length == 0) return 0;
        if (level >= this.levelConfig.length - 1) return 0;

        var currentLevelExp = levelExp - this.levelConfig[level].exp;
        var maxLevelExp = this.levelConfig[level + 1].exp - this.levelConfig[level].exp;
        return currentLevelExp/maxLevelExp;
    },

    getLevelBonus: function(level) {
        if (!this.levelConfig || this.levelConfig.length == 0)
            return 0;
        return this.levelConfig[level].bonus;
    },

    getTotalSupportBean: function (level, bean) {
        if (!this.levelConfig || this.levelConfig.length == 0)
            return bean;
        return Math.floor(bean * (1 + this.levelConfig[level].bonus / 100));
    },

})

LevelMgr.instance = null;
LevelMgr.getInstance = function () {
    if (!LevelMgr.instance) {
        LevelMgr.instance = new LevelMgr();
    }
    return LevelMgr.instance;
};
var levelMgr = LevelMgr.getInstance();

LevelMgr.CMD_LEVEL_UP = 1110;
LevelMgr.CMD_LEVEL_CONFIG = 1111;