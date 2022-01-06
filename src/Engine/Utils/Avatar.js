var fr = fr||{};
fr.Avatar = cc.Node.extend({
    ctor: function (defaultAvatar) {
        this._super();
        // this._size = 160;
        this.setCascadeOpacityEnabled(true);

        this._defaultAvatar = cc.Sprite.create(defaultAvatar);//, this, 0, 0, 0.5, 0.5);
        this._defaultAvatar.setAnchorPoint(0.5,0.5);
        this._defaultAvatar.setCascadeOpacityEnabled(true);
        this.addChild(this._defaultAvatar);
        this._avatar = null;
        return true;
    },

    updateAvatar : function(url)
    {
        // cc.log("updateAvatar: ", url);
        if (url.indexOf("zdn.vn") >= 0){
            return;
        }
        // if(_.isEmpty(url))
        // {
        //     return;
        // }
        if(this._avatar == null)
        {
            this._avatar = fr.AsyncSprite.create(this._defaultAvatar.getContentSize(), this.onFinishLoad.bind(this));
            this.addChild(this._avatar);
        }
        //cc.log("Url", url);
        this._defaultAvatar.setVisible(true);
        this._avatar.setVisible(false);
        this._avatar.updatePath(url,this.getStorePath(url));
    },
    onFinishLoad:function(result)
    {
        if(result)
        {
            //cc.log("Load Finish");
            this._defaultAvatar.setVisible(false);
            this._avatar.setVisible(true);
        }
        else
        {
            //cc.log("Load Failed");
            this._defaultAvatar.setVisible(true);
            this._avatar.setVisible(false);
        }
    },
    getStorePath:function(url)
    {
        return jsb.fileUtils.getWritablePath() + md5(url);
    },

    getImageSize: function () {
        if (this._avatar){
            return this._avatar.getContentSize();
        } else {
            return this._defaultAvatar.getContentSize();
        }
    }
});