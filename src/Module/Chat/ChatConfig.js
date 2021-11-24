var ChatConfig = cc.Class.extend({
    ctor: function () {
        // this._super();
        this.emotionConfig = null;
        this.interactiveConfig = null;
        this.vipCanUseConfig = null;
    },

    resetData: function(){
        this.emotionConfig = null;
        this.interactiveConfig = null;
        this.vipCanUseConfig = null;
    },

    setChatConfig: function (config) {
        try {
            this.emoConfig = config["emotion"];
            this.interactiveConfig = config["interactive"];
            this.interactiveConfig["0"].push(8);
            cc.log("INTERACT TIVE CONFIG " + JSON.stringify(this.interactiveConfig));
            this.vipCanUseConfig = config["vip"];
        } catch (e) {

        }

        // cc.log("setEmoConfig: ", JSON.stringify(this.emoConfig), JSON.stringify(this.interactiveConfig), JSON.stringify(this.vipCanUseConfig));
    },

    getEmoConfig: function () {
        return this.emoConfig;
    },

    getInteractConfig: function () {
        return this.interactiveConfig;
    },

    getVipUseConfig: function () {
        return this.vipCanUseConfig;
    },

    canUseItem: function (itemIdx, isEmo) {
        var vipLevel = NewVipManager.getInstance().getVipLevel();
        var vipCanUse = this.getVipUseConfig();
        var itemConfig = isEmo ? this.getEmoConfig() : this.getInteractConfig();
        var key;
        for (key in itemConfig){
            if (itemConfig[key].indexOf(itemIdx) >= 0){
                break;
            }
        }
        var keyStr = isEmo ? "emotion" : "interactive";
        if (!vipCanUse){
            return false;
        }
        // cc.log("canUseItem: ", vipLevel, vipCanUse[vipLevel + ""][keyStr], key, keyStr);
        if (JSON.stringify(vipCanUse[vipLevel + ""][keyStr]).indexOf(key) >= 0){
            return true;
        } else {
            // Toast.makeToast(Toast.SHORT, LocalizedString.to("_VIP_ONLY_USE_"));
            return false;
        }
    }
});

ChatConfig.instance = null;
ChatConfig.getInstance = function () {
    if (ChatConfig.instance == null){
        ChatConfig.instance = new ChatConfig();
    }

    return ChatConfig.instance;
};

var chatConfig = ChatConfig.getInstance();

