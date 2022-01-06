/**
 * Created by cuongleah on 2/29/2016.
 */
var MaubinhCard = cc.Sprite.extend({
    ctor : function(id){
        this._super("res/Other/poker/labai_50.png");
        this.id = id;
        this.setTexture(cc.textureCache.addImage(this.getCardResource(id)));
        this._up =  false;
        this._startY= 0;
    },
    getCardResource: function(id){

        if(id === undefined || id < 0 || id > 52) id = 52;

        var _card = "res/Other/poker/labai_";
        _card += id;
        _card += ".png";

        return _card;
    },
    setID: function(id){
        if(id === undefined || id < 0 || id > 52) id = 52;
        this.id = id;
        this.setTexture(cc.textureCache.addImage(this.getCardResource(id)));
    },

    setIdCard: function(id){
        if(id === undefined || id < 0 || id > 52) id = 52;
        this.id = id;
        this.setTexture(cc.textureCache.addImage(this.getCardResource(id)));
    },

    getId: function() {
        return this.id;
    },
    up: function()
    {
        if(!this._up){
            this.stopAllActions();
            this.runAction(new cc.MoveTo(.065,cc.p(this.getPositionX(),this._startY + 15)));
            this._up = true;
        }
    },
    getWidth: function() {
        return this.getContentSize().width * this.getScaleX();
    },

    getHeight: function() {
        return this.getContentSize().height * this.getScaleY();
    },

    setRootScale: function(scale){
        this.setScale(scale);
        this.rootScale = scale;
    },

    setDark: function(isDark){
        if(isDark)
        {
            this.setColor(cc.color(170, 170, 170));
        }
        else
        {
            this.setColor(cc.color(255, 255, 255));
        }
    },

    saveInfoCard: function () {
        this.defaultPos = this.getPosition();
        this.rootScale = this.getScale();
        this.rootZOrder = this.getLocalZOrder();
    },

    moveToDefault: function (time) {
        this.stopAllActions();
        this.setLocalZOrder(this.rootZOrder);
        this.setVisible(true);
        this.runAction(cc.spawn(
            cc.moveTo(time, this.defaultPos),
            cc.scaleTo(time, this.rootScale)
        ));
    },

    copyCard: function (card) {
        this.setPosition(card.getPosition());
        this.setScale(card.getScale());
        this.setIdCard(card.id);
    }
})


MaubinhCard.getCardResource =  function(id){
    var _card = "cards/labai_";
    _card += id - 8;
    _card += ".png";

    return _card;
}