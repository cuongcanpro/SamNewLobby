/**
 * Created by HOANGNGUYEN on 7/28/2015.
 */

var TalaCard = cc.Sprite.extend({
    ctor : function(id){
        this._super("res/common/cards/labai_52.png");
        this.id = id;
        this.setTexture(cc.textureCache.addImage(TalaCard.getCardResource(id)));
        this._up =  false;
        this.m_IsEaten = false;
        this.m_IsDark = false;
        this.m_IsInSuit = false;

        this._startY= 0;
    },
    setID: function(id){
        this.id = id;
        this.setTexture(cc.textureCache.addImage(TalaCard.getCardResource(id)));
    },
    setDark: function(dark)
    {
        if(dark != this.m_IsDark)
        {
            this.m_IsDark = dark;
            if(dark)
            {
                this.setColor({r:100 , g:100 , b:100});
            }
            else{
                this.setColor(cc.WHITE);

            }
        }
    },
    updown: function()
    {
        if(!this._up){
            this.stopAllActions();
            this.runAction(new cc.MoveTo(.065,cc.p(this.getPositionX(),this._startY + 15)));
            this._up = true;
        }
        else
        {
            this.stopAllActions();
            this.runAction(new cc.MoveTo(.065,cc.p(this.getPositionX(),this._startY )));
            this._up = false;
        }
    },
    len: function()
    {
        if(!this._up){
            this.stopAllActions();
            this.setPositionY(this._startY);
            this.runAction(new cc.MoveTo(.065,cc.p(this.getPositionX(),this._startY + 15)));
            this._up = true;
        }
    },
    down: function()
    {
        if(this._up){
            this.stopAllActions();
            this.setPositionY(this._startY + 15);
            this.runAction(new cc.MoveTo(.065,cc.p(this.getPositionX(),this._startY)));
            this._up = false;
        }
    },
    forceUP: function(){
        this.stopAllActions();
        this.setPositionY(this._startY + 15);
        this._up = true;
    },
    forceDOWN: function(){
        this.stopAllActions();
        this.setPositionY(this._startY);
        this._up = false;
    },
    containTouchPoint: function(point){
        var size = this.getContentSize();
        var rect = cc.rect(-size.width/2,-size.height/2,size.width,size.height);
        //var aa = this.convertToNodeSpaceAR(point);
        //
        //var ccc = cc.rectContainsPoint(rect,this.convertToNodeSpaceAR(point));

        return cc.rectContainsPoint(rect,this.convertToNodeSpaceAR(point));
    },
    calculateAnchorPoint: function(point){
        var size = this.getContentSize();
        var rect = cc.rect(-size.width/2,-size.height/2,size.width,size.height);
        var aa = this.convertToNodeSpaceAR(point);

        if(!cc.rectContainsPoint(rect,aa))
        {
            return cc.p(-1,-1);
        }

        var xx = (aa.x - rect.x) / rect.width;
        var yy = (aa.y - rect.y) / rect.height;

        return cc.p(xx,yy);

    },
    calculateNewPositionWithNewAnchor: function(anchor){
        var newPos = cc.p(0,0);
        newPos.x = this.getPositionX() + ( - this.getAnchorPoint().x + anchor.x )* this.getContentSize().width ;
        newPos.y = this.getPositionY() + ( -this.getAnchorPoint().y + anchor.y )* this.getContentSize().height;

        return newPos;
    },
    addArrow: function()
    {
        if(this.getChildByTag(15))
        {
            this.getChildByTag(15).removeFromParent();
        }

        var arrow = new cc.Sprite("GameGUI/arrow.png");
        arrow.setTag(15);
        this.addChild(arrow);
        var size = this.getContentSize();
        arrow.setPosition(cc.p(size.width/2,size.height + 17));
        arrow.runAction(cc.sequence(cc.moveBy(.2, cc.p(0, 15)), cc.moveBy(.2, cc.p(0, -15))).repeatForever());
    },
    removeArrow: function()
    {
        if(this.getChildByTag(15))
        {
            this.getChildByTag(15).removeFromParent();
        }
    },
    addEffectStar: function()
    {
        var particle = new cc.ParticleSystem("res/Particles/card.plist");
        particle.setLocalZOrder(1);
        this.addChild(particle);
        particle.setPosition(this.getContentSize().width/2,this.getContentSize().height/2);
    },
    addEatable: function()
    {
        var anim = new cc.Animation();
        for(var i=0;i<3;i++)
        {
            anim.addSpriteFrameWithFile("res/common/animation/eatable/eat_"+i+".png");
        }
        anim.setDelayPerUnit(.1);

        var size = this.getContentSize();
        var sprite = new cc.Sprite("res/common/animation/eatable/eat_0.png");
        sprite.setPosition(cc.p(size.width/2,size.height/2-4));
        this.addChild(sprite);
        sprite.setTag(102);
        sprite.setScale(1.3);
        sprite.runAction(cc.repeatForever(cc.animate(anim)));
    },
    removeEatable: function()
    {
        if(this.getChildByTag(102))
        {
            this.getChildByTag(102).removeFromParent();
        }
    }


})

TalaCard.getCardResource =  function(id){
    if (id < 0 || id > 52)
    {
        return "";
    }
    var _card = "res/common/cards/labai_";
    if(id == 52)
    {
        //
    }
    else if (id < 4)
    {
        id += 48;
    }
    else
    {
        id -= 4;
    }
    _card += id;
    _card += ".png";
    return _card;
}

