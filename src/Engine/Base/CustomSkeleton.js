var CustomSkeleton = cc.Node.extend({
    ctor: function (path, key, scale) {
        this._super();
        if (!scale) scale = 1;
        this.type = CustomSkeleton.OLD_VERSION;
        this.animationMode = CustomSkeleton.SCALE_ACTION;

        if (!jsb.fileUtils.isFileExist(path + "/" + key + "_static.png")) {
            var s = (new Error()).stack;
            cc.log("ERROR " + s);
        }
        this.path = path;
        this.key = key;
        /**
         * Doi voi ban cu thi chi Load anh mac dinh, khi co Animtion la Spine thi phai di kem mot anh sprite.png trong folder cua Animation
         */
        try {
            // if (!Config.ENABLE_SPINE) throw new Error("Spine not enable");
            this.skeleton =  new sp.SkeletonAnimation(path + "/" + key + ".json", path + "/" + key + ".atlas", scale);
            this.addChild(this.skeleton);
            this.type = CustomSkeleton.NORMAL;
        }
        catch (e) {
            if (jsb.fileUtils.isFileExist(path + "/" + key + "_static.png")) {
                this.sprite = new cc.Sprite(path + "/" + key + "_static.png");
                this.addChild(this.sprite);
            }
            else {
                cc.log("ERROR: Not Sprite " + e.stack);
            }
        }
        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);
    },

    setAnimation: function (trackIndex, animation, loop, mode, resource) {
        this.loop = loop;
        if (this.type == CustomSkeleton.NORMAL) {
            this.skeleton.setAnimation(trackIndex, animation, loop);
        }
        else {
            var s = this.path + "/" + this.key + "_static" + resource + ".png";
            if (jsb.fileUtils.isFileExist(s)) {
                this.sprite.setTexture(s);
            }
            if (mode !== undefined) this.animationMode = mode;
            this.doAction();
        }
    },

    callbackAction: function () {
        if (this.loop) {
            if (this.callback)
                this.callback();
            this.doAction();
        }
    },

    doAction: function () {
        switch (this.animationMode) {
            case CustomSkeleton.FADE_ACTION:
                this.sprite.setScale(1);
                this.sprite.setOpacity(0);
                this.sprite.setPosition(0, 0);
                this.sprite.runAction(cc.sequence(
                    cc.fadeIn(0.5),
                    cc.delayTime(1.0),
                    cc.fadeOut(0.5),
                    cc.callFunc(this.callbackAction.bind(this))
                ));
                break;
            case CustomSkeleton.SCALE_ACTION:
                this.sprite.setScale(0.5);
                this.sprite.setOpacity(0);
                this.sprite.setPosition(0, 0);
                this.sprite.runAction(cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.5, 1.0).easing(cc.easeBackOut()),
                        cc.fadeIn(0.5)
                    ),
                    cc.delayTime(1.0),
                    cc.spawn(
                        cc.scaleTo(0.5, 0).easing(cc.easeBackIn()),
                        cc.fadeOut(0.5)
                    ),
                    cc.callFunc(this.callbackAction.bind(this))
                ));
                break;
            case CustomSkeleton.JUMP_ACTION:
                this.sprite.setScale(1);
                this.sprite.setOpacity(0);
                this.sprite.setPosition(0, 0);
                this.sprite.runAction(cc.sequence(
                    cc.spawn(
                        cc.sequence(
                            cc.moveBy(0.25, 0, 50).easing(cc.easeSineOut()),
                            cc.moveBy(0.25, 0, -50).easing(cc.easeSineIn())
                        ),
                        cc.fadeIn(0.5)
                    ),
                    cc.delayTime(1),
                    cc.spawn(
                        cc.sequence(
                            cc.moveBy(0.25, 0, 50).easing(cc.easeSineOut()),
                            cc.moveBy(0.25, 0, -50).easing(cc.easeSineIn())
                        ),
                        cc.fadeOut(0.5)
                    ),
                    cc.callFunc(this.callbackAction.bind(this))));
                break;
        }
    },

    getDuration: function(name) {
        if (this.type == CustomSkeleton.NORMAL)
            return this.skeleton.findAnimation(name? name : "animation").duration;
        else{
            switch(this.animationMode){
                case CustomSkeleton.FADE_ACTION:
                    return 2;
                case CustomSkeleton.SCALE_ACTION:
                    return 2;
                case CustomSkeleton.JUMP_ACTION:
                    return 2;
            }
        }
    },

    setCompleteListener: function (callback, selector) {
        if (this.type == CustomSkeleton.NORMAL) {
            this.skeleton.setCompleteListener(callback);
        }
        else {
            this.callback = callback;
        }
    },
})

CustomSkeleton.NORMAL = 0;
CustomSkeleton.OLD_VERSION = 1; // cho cac framework cu

CustomSkeleton.FADE_ACTION = 0;
CustomSkeleton.SCALE_ACTION = 1;
CustomSkeleton.JUMP_ACTION = 2;