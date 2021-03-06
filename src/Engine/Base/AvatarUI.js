/**
 * Created by CPU02401_LOCAL on 10-May-19.
 */
var AvatarUI = cc.Node.extend({

    ctor: function (defaultImg, maskAvatar, isNoClipping) {
        this._super();
        this._defaultImg = defaultImg;
        this._urlImg = null;
        this._downloading = AvatarUI.AVATAR_DEFAULT;
        this._asyncDownload = null;

        if (false){
            this.image = new fr.Avatar(defaultImg);
        } else {
            this.image = engine.UIAvatar.createWithMask(defaultImg, isNoClipping ? defaultImg : maskAvatar, "");
        }
        if (isNoClipping){
            this.addChild(this.image);
        } else {
            this.clipping = new cc.ClippingNode();
            this.clipping.setAlphaThreshold(0.5);
            this.addChild(this.clipping);
            this.clipping.addChild(this.image);
            this.clipping.setCascadeOpacityEnabled(true);
            this.setCascadeOpacityEnabled(true);
            this.setMaskSprite(maskAvatar);
            // this.setMaskCircle(50);
        }

    },

    setImage: function(path){
        if(!path)path = this._defaultImg;
        this.image.updateAvatar(path);
    },

    setDefaultImage: function () {
        if (false){
            this.image.updateAvatar(this._defaultImg);
        } else {
            this.image.setDefaultImage();
        }
    },

    updateDefaultImg: function (defaultImg) {
        this._defaultImg = defaultImg;
        if (false) {
            this.image._defaultAvatar.setTexture(this._defaultImg);
        } else {
            this.image.setTexture(this._defaultImg);
        }
    },

    setMaskSprite: function(maskAvatar){
        if(maskAvatar && maskAvatar != ""){
            var stencil = new cc.Sprite(maskAvatar);
            this.clipping.setStencil(stencil);
        }
    },

    setMaskCircle: function(size){
        if(size){
            var stencil = new cc.DrawNode();
            stencil.drawDot(cc.p(0, 0), size);
            this.clipping.setStencil(stencil);
        }
    },

    asyncExecuteWithUrl: function(path, url, isReload){
        cc.error("asyncExecuteWithUrl: ", url, path);
        //Avatar default
        var index = url.indexOf("avatar_");
        if  (index !== -1) {
            path = url.substring(index, url.indexOf(".png"));
        }

        if (false) {
            this.image.updateAvatar(url);
        } else {
            this.image.asyncExecuteWithUrl(path, url);
        }
    },

    getImageSize: function(){
        return this.image.getImageSize();
    }
});

AvatarUI.NUM_MAX_REDOWNLOAD = 2;
AvatarUI.REDOWNLOAD_MAX = 2;
AvatarUI.AVATAR_DOWNLOAD = 0;   //da tai avatar
AvatarUI.AVATAR_DEFAULT = -1;   //dang dung avatar mac dinh
AvatarUI.AVATAR_DOWNLOADING = 1;    //dang tai avatar
AvatarUI.AVATAR_URL = 10;
AvatarUI.AVATAR_CACHE = 10;