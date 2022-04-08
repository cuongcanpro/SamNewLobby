var PanelStar = cc.Node.extend({
    ctor: function (width, height, dEffect) {
        this._super();
        this.setContentSize(width, height);
        this.dEffect = dEffect;
        this.arrayStar = [];
    },

    startEffect: function () {
        this.unscheduleAllCallbacks();
        this.schedule(this.updateStar, this.dEffect, cc.REPEAT_FOREVER, 0);
        for (var i = 0; i < this.arrayStar.length; i++) {
            this.arrayStar[i].setVisible(false);
        }
    },

    updateStar: function () {
        var star = this.getStar();
        star.stopAllActions();
        var randomX = this.getContentSize().width * (0.5 - Math.random());
        var randomY = this.getContentSize().height * (0.5 - Math.random());
        star.setPosition(randomX, randomY);
        var rootScale = 0.5 + Math.random() * 1.5;
        star.setScale(0);
        star.runAction(cc.sequence(
            cc.scaleTo(0.5, rootScale),
            cc.scaleTo(1.0, 0.0)
        ))
        star.runAction(cc.sequence(
            cc.fadeIn(0.2),
            cc.delayTime(0.8),
            cc.fadeOut(1.0),
            cc.hide()
        ))
        star.runAction(cc.rotateBy(3.0,359));
    },

    getStar: function () {
        var i;
        var star;
        for (i = 0; i < this.arrayStar.length; i++) {
            if (this.arrayStar[i].isVisible()) {
                star = this.arrayStar[i];
            }
        }
        if (i == this.arrayStar.length) {
            star = new cc.Sprite("Common/iconLight.png");
            this.addChild(star);
            this.arrayStar.push(star);
        }
        star.setVisible(true);
        return star;
    },
})