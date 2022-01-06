var UIAvatarFrame = cc.Node.extend({
    ctor: function(defaultUrl){
        this._super();
        this.setCascadeOpacityEnabled(true);
        this.width = UIAvatarFrame.WIDTH;
        this.height = UIAvatarFrame.HEIGHT;
        if (defaultUrl === undefined) defaultUrl = "";
        this.defaultUrl = defaultUrl;
        this.currentUrl = "";

        this.avatarFrame = new cc.Sprite();
        this.avatarFrame.setAnchorPoint(0.5, 0.5);
        this.addChild(this.avatarFrame);
    },

    reload: function() {
        this.currentUrl = StorageManager.getInstance().getUserAvatarFramePath();
        if (!this.currentUrl || this.currentUrl === "")
            this.currentUrl = this.defaultUrl;
        if (this.currentUrl === "") {
            this.avatarFrame.setTexture(null);
        }
        else this.avatarFrame.setTexture(this.currentUrl === "" ? null : this.currentUrl);
        this.avatarFrame.setScale(this.width/this.avatarFrame.width);
    },

    getWidth: function() {
        return this.width;
    },

    getHeight: function() {
        return this.height;
    },

    getSize: function() {
        return cc.size(this.width, this.height);
    },

    isShow: function() {
        return this.currentUrl !== "";
    }
});
UIAvatarFrame.WIDTH = 180;
UIAvatarFrame.HEIGHT = 180;