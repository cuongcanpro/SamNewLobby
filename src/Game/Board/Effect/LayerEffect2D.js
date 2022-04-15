/**
 * Created by HOANG on 8/19/2015.
 */


var LayerEffect2D = cc.Layer.extend({
    ctor: function(size){
        this._super();
        this.effects = [];
        this.cardEffects = [];
        this.showingCard = false;
        this.myPlayer = null;
        this.size = size;
    },

    checkShowCard: function()
    {
        this.showingCard = false;
        this.myPlayer._touchEnable = false;
        this.myPlayer.runAction(cc.sequence(cc.delayTime(1),cc.callFunc(function(target){
            target._touchEnable = true;
        })));
        if(inGameMgr.gameLogic._cardChiabai[0] != 52)
        {
            var timedelay = 0;
            for(var i=0;i<10;i++){
                var sprite =  this.cardEffects[i];
                if (sprite) {
                    if(inGameMgr.gameLogic._cardChiabai.length < 10 && i==9)
                    {
                        sprite.removeFromParent(true);
                        break;
                    }
                    else
                    {
                        if (cc.isUndefined(this.myPlayer._handOnCards[i])) {
                            var s = "i: " + i + "HandOnCard: " + this.myPlayer._handOnCards.length;
                            // NativeBridge.logJSManual("LayerEffect2D.js", 10000, s, NativeBridge.getVersionString());
                        }
                        else {
                            sprite.runAction(cc.sequence(cc.delayTime(timedelay),cc.scaleTo(.1,0,this.myPlayer._handOnCards[i].getContentSize().width / sprite.getContentSize().width),cc.removeSelf()));
                            this.myPlayer._handOnCards[i].setVisible(true);
                            var scale = this.myPlayer._handOnCards[i].getScale();
                            this.myPlayer._handOnCards[i].setScaleX(0);
                            this.myPlayer._handOnCards[i].runAction(cc.sequence(cc.delayTime(.1+ timedelay),cc.scaleTo(.1, scale, scale),new cc.CallFunc(function(target){
                                target.addEffectStar();
                            })));
                            timedelay += .025 + i * .0075;
                        }
                    }
                }
            }

        }


    },
    chiabai: function(player){

        this.showingCard = true;
        if(player._index == 0){
            var timedelay = 0.25;
            var posY = 15;

            for(var i=0;i<10;i++){
                var sprite =  new cc.Sprite("cards/labai_52__.png");
                this.addChild(sprite);
                sprite.setPosition(cc.p(this.size.width/2,this.size.height/2 + 30 + posY - i *1.5));
                sprite.setRotation(90);
                sprite.setLocalZOrder(1);
                sprite.setVisible(false);

                this.cardEffects.push(sprite);
                var pos = player._handOnCards[i].convertToWorldSpaceAR(cc.p(0,0));
                pos = this.convertToNodeSpace(pos);

                var actionSpawn = cc.spawn(new cc.EaseSineOut(cc.moveTo(.3,pos)),cc.scaleTo(.3,player._handOnCards[i].getContentSize().width / sprite.getContentSize().width),cc.rotateTo(.3,0));
                if(i != 9)
                    sprite.runAction(cc.sequence(cc.delayTime(timedelay),cc.show(),actionSpawn));
                else
                {
                    sprite.runAction(cc.sequence(cc.delayTime(timedelay),cc.show(),actionSpawn,cc.callFunc(this.checkShowCard.bind(this))));
                }

                player._handOnCards[i].setVisible(false);
                timedelay += .125;
            }
        }
        else
        {
            var timedelay = 0.25;
            var posY = 15;
            for(var i=0;i<10;i++){
                var sprite =  new cc.Sprite("cards/labai_52__.png");
                this.addChild(sprite);
                sprite.setPosition(cc.p(this.size.width/2,this.size.height/2 + 30 + posY - i *1.5));
                sprite.setRotation(90);
                sprite.setLocalZOrder(1);
                sprite.setVisible(false);
                var pos = player._card.convertToWorldSpaceAR(cc.p(0,0));
                pos = this.convertToNodeSpace(pos);

                player._card.setVisible(false);
                player._card._tmpCount = 0;
                var func = function(sender,target){
                    target._tmpCount++;
                    target.setVisible(true);
                    //ccui.Helper.seekWidgetByName(target,"num").setString("" +target._tmpCount );
                }
                sprite.runAction(cc.sequence(cc.delayTime(timedelay),cc.show(),cc.callFunc(func,sprite,player._card),cc.spawn(cc.moveTo(.3,pos),cc.rotateTo(.3,0)),cc.removeSelf()));
                timedelay += .125;
            }
        }
    },

    clearEffect: function()
    {
        this.removeAllChildren(true);
        this.effects = [];
        this.cardEffects = [];


    },

    sapxepForPlayer: function(player){

        if(!player._touchEnable)
            return;
        var needTouch = true;
        for(var i=0;i<player._handOnCards.length;i++) {
            if(!player._handOnCards[i].isVisible()){
                needTouch = false;
                break;
            }
        }
        if(!needTouch)
            return;


        var originalCards = player.sapxep();
        var sortedCards = [];
        for (var i=0;i<player._handOnCards.length;i++)
        {
            player._handOnCards[i].forceDOWN();
            //player._handOnCards[i].setVisible(false);
            sortedCards.push(new Card(player._handOnCards[i].id));
        }

        var _2dCards = [];
        for (var i=0;i<originalCards.cards.length;i++)
        {
            var card = new TalaCard(originalCards.cards[i].id);
            var pos = player._handOnCards[i].convertToWorldSpaceAR(cc.p(0,0));
            card.setPosition(this.convertToNodeSpace(pos));
            card.setLocalZOrder(i);
            this.addChild(card);
            _2dCards.push(card);
        }

        for (var i=0;i<_2dCards.length;i++)
        {
            for (var j=0;j<sortedCards.length;j++)
            {
                if (sortedCards[j].id == originalCards.cards[i].id)
                {
                    if (j != i) {
                        var posMove = _2dCards[j].getPosition();
                        var move = new cc.EaseExponentialOut(cc.moveTo(.25 ,posMove));
                        _2dCards[i].setLocalZOrder(j);

                        _2dCards[i].runAction(cc.sequence(move,cc.removeSelf()));
                        player._handOnCards[j].stopAllActions();
                        //player._handOnCards[j].setVisible(false);
                        player._handOnCards[j].runAction(cc.sequence(cc.delayTime(.28),cc.show()));
                    }
                    else {
                        _2dCards[i].removeFromParent(true);
                    }
                    break;
                }
            }
        }
    },

    addAnchot: function(){
        var anim = db.DBCCFactory.getInstance().buildArmatureNode("Anchot");
        if(!anim)
        {
            return;
        }
        this.addChild(anim);
        anim.getAnimation().gotoAndPlay("1",-1,-1,1);

        anim.setPosition(cc.p(this.size.width/2,this.size.height/2 + 50));

        var time = 5;
        anim.runAction(cc.sequence(cc.delayTime(time < 0?60:time),cc.removeSelf()));
    },

    jackpot: function()
    {
        this.runAction(cc.sequence(cc.delayTime(1.5),cc.CallFunc(function(){
            var particle = cc.ParticleSystem("Particles/BurstPipe.plist");
            particle.setPosition(cc.p(this.size.width/2,this.size.height));
            this.addChild(particle);

            var j = db.DBCCFactory.getInstance().buildArmatureNode("jackpot");
            j.setPosition(cc.p(this.size.width/2,this.size.height/2 + 100) );
            j.getAnimation().gotoAndPlay("1");
            this.addChild(j);
        }.bind(this)),this));

    }
});