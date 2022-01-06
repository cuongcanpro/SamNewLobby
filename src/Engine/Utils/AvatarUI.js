/**
 * Created by CPU02401_LOCAL on 10-May-19.
 */
var AvatarUI = cc.Node.extend({

    ctor: function (defaultImg, maskAvatar) {
        this._super();
        this._defaultImg = defaultImg;
        this._urlImg = null;
        this._downloading = AvatarUI.AVATAR_DEFAULT;
        this._asyncDownload = null;
        this.clipping = new cc.ClippingNode();
        this.clipping.setAlphaThreshold(0.5);
        this.addChild(this.clipping);
        if (cc.sys.isNative){
            this.image = new fr.Avatar(defaultImg);
        } else {
            this.image = engine.UIAvatar.createWithMask(defaultImg, maskAvatar, "");
        }
        this.clipping.addChild(this.image);
        this.clipping.setCascadeOpacityEnabled(true);
        this.setCascadeOpacityEnabled(true);
        this.setMaskSprite(maskAvatar);
    },

    setImage: function(path){
        if(!path)path = this._defaultImg;
        this.image.updateAvatar(path);
    },

    setDefaultImage: function () {
        if (cc.sys.isNative){
            this.image.updateAvatar(this._defaultImg);
        } else {
            this.image.setDefaultImage();
        }
    },

    setMaskSprite: function(maskAvatar){
        if(maskAvatar && maskAvatar != ""){
            var stencil = new cc.Sprite(maskAvatar);
            this.clipping.setStencil(stencil);
        }
    },

    asyncExecuteWithUrl: function(path, url, isReload){
        if (cc.sys.isNative){
            this.image.updateAvatar(url);
        } else {
            // cc.error("asyncExecuteWithUrl: ", url);
            this.image.asyncExecuteWithUrl(path, url);
        }
    },

    getImageSize: function(){
        return this.image.getImageSize();
    }
});

AvatarUI.REDOWNLOAD_MAX = 2;
AvatarUI.AVATAR_DOWNLOAD = 0;
AvatarUI.AVATAR_DEFAULT = -1;
AvatarUI.AVATAR_DOWNLOADING = 1;