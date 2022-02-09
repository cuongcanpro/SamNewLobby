/**
 * Created by HOANGNGUYEN on 7/28/2015.
 */

var SamCard = cc.Sprite.extend({
    ctor: function (id) {
        this._super("res/Board/cards/defaultCard.png");
        this._id = id;
        cc.log("SAM CARD SIZE", JSON.stringify(this.getContentSize()));
        this.setTexture(cc.textureCache.addImage(this.getCardResource(id)));
        this._up = false;
        this._startY = 0;
        this.addEfxFire();
    },

    addEfxBan: function () {
        if (this.efxBan) return;
        this.efxBan = new cc.Sprite("cards/efxBan.png");
        this.efxBan.setPosition(this.width / 2, this.height / 2);
        this.efxBan.setVisible(false);
        this.addChild(this.efxBan);
    },

    showEfxBan: function () {
        if (!this.efxBan) return;
        this.efxBan.setVisible(true);
    },

    hideEfxBan: function () {
        if (!this.efxBan) return;
        this.efxBan.setVisible(false);
    },

    addEfxFire: function () {
        this.efxFire = new CustomSkeleton("Animation/fire", "skeleton", 0.9);
        this.efxFire.setPosition(this.width / 2 - 2, this.height);
        this.efxFire.setTimeScale(1.5);
        this.efxFire.setAnimation(1, "animation", -1);
        this.efxFire.setLocalZOrder(-1);
        this.efxFire.setVisible(false);
        this.addChild(this.efxFire);
    },

    playEfxFire: function () {
        if (!this.efxFire) return;
        this.efxFire.stopAllActions();
        this.efxFire.setOpacity(0);
        this.efxFire.setVisible(true);
        this.efxFire.runAction(cc.fadeIn(0.25));
        this.efxFire.setAnimation(1, "animation", -1);
    },

    hideEfxFire: function () {
        if (!this.efxFire) return;
        this.efxFire.stopAllActions();
        this.efxFire.runAction(cc.sequence(
            cc.fadeOut(0.25),
            cc.hide()
        ));
    },

    getCardResource: function (id) {
        var _card = "res/common/cards/labai_";
        _card += id - 8;
        _card += ".png";

        return _card;
    },

    setID: function (id) {
        cc.log("SET ID CARD " + id);
        this._id = id;
        this.setTexture(cc.textureCache.addImage(this.getCardResource(id)));
    },

    upDown: function () {
        cc.log("CARD ACTION: upDown");
        this.stopAllActions();
        this.setPosition(cc.p(this.getPositionX(), this._startY + (this._up? 0 : 15)));
        this._up = !this._up;
        if (!this._up) this.hideEfxFire();
    },

    up: function () {
        cc.log("CARD ACTION: up");
        if (!this._up) {
            this.stopAllActions();
            this.setPosition(cc.p(this.getPositionX(), this._startY + 15));
            this._up = true;
        }
    },

    forceUP: function () {
        // cc.log("CARD ACTION: forceUP");
        this.stopAllActions();
        this.setPositionY(this._startY + 15);
        this._up = true;
    },

    forceDOWN: function () {
        // cc.log("CARD ACTION: forceDOWN");
        this.stopAllActions();
        this.setPositionY(this._startY);
        this._up = false;
        if (!this._up) this.hideEfxFire();
    },

    containTouchPoint: function (point) {
        var size = this.getContentSize();
        var rect = cc.rect(-size.width / 2, -size.height / 2, size.width, size.height);
        //var aa = this.convertToNodeSpaceAR(point);
        //
        //var ccc = cc.rectContainsPoint(rect,this.convertToNodeSpaceAR(point));

        return cc.rectContainsPoint(rect, this.convertToNodeSpaceAR(point));
    },

    calculateAnchorPoint: function (point) {
        var size = this.getContentSize();
        var rect = cc.rect(-size.width / 2, -size.height / 2, size.width, size.height);
        var aa = this.convertToNodeSpaceAR(point);

        if (!cc.rectContainsPoint(rect, aa)) {
            return cc.p(-1, -1);
        }

        var xx = (aa.x - rect.x) / rect.width;
        var yy = (aa.y - rect.y) / rect.height;

        return cc.p(xx, yy);
    },

    calculateNewPositionWithNewAnchor: function (anchor) {
        var newPos = cc.p(0, 0);
        newPos.x = this.getPositionX() + (-this.getAnchorPoint().x + anchor.x) * this.getContentSize().width;
        newPos.y = this.getPositionY() + (-this.getAnchorPoint().y + anchor.y) * this.getContentSize().height;

        return newPos;
    }
});
SamCard.ORG_WIDTH = 141;
SamCard.ORG_HEIGHT = 180;

SamCard.getCardResource = function (id, isSmall) {
    var _card = "res/common/cards/labai_";
    if (isSmall) _card = "res/common/cardsSmall/labai_";
    _card += id - 8;
    _card += ".png";

    return _card;
}