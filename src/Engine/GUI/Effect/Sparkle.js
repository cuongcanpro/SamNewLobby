
//Sparkle
var Sparkle = cc.Node.extend({
    ctor: function () {
        this._super();
        this.heightEffect = 25 + Math.random() * 25;
        this.initChild();
    },

    initChild: function () {
        this.setCascadeOpacityEnabled(true);
        var file = "res/Lobby/Received/particle/spark.png";
        this.spriteImg = new cc.Sprite(file);
        this.addChild(this.spriteImg);
        this.spriteImg.setRotation(Math.random() * 360);
        this.spriteImg.setScale(Math.random() * 0.75 + 0.75);
    },

    setHeightEffect: function (height) {
        this.heightEffect = height;
    },

    startEffect: function (delayTime = 0) {

        this.setPositionX(Math.random() * cc.winSize.width);
        var rTime = (2.5 + Math.random() * 2.5);

        this.spriteImg.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(function () {
                var time = 0.1 + Math.random() * 0.25;
                this.spriteImg.runAction(cc.sequence(
                    cc.fadeTo(0.1, 125 * Math.random()),
                    cc.delayTime(time - 0.1),
                    cc.fadeIn(0.1)
                ));
                this.spriteImg.runAction(cc.rotateBy(0.5, Math.random() * 90 + 90));
                this.spriteImg.runAction(cc.scaleTo(0.5, Math.random() * 0.75 + 0.75));
            }.bind(this))
        ).repeatForever());

        this.spriteImg.setVisible(false);
        this.spriteImg.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.show(),
            cc.moveBy(rTime, 0, this.heightEffect).easing(cc.easeOut(2))
        ));

        this.runAction(cc.sequence(
            cc.delayTime(delayTime + rTime - 0.1),
            cc.fadeOut(0.1),
            cc.removeSelf()
        ));
    }
});