/**
 * Created by HOANG on 8/19/2015.
 */


var LayerEffect2D = cc.Layer.extend({
    ctor: function(){
        this._super();
        this.effects = [];
    },

    chiabai: function(player){

        var offset = 0;
        var time = 0;
        cc.log("DEAL BAI " + player.index);
        for(var i=0;i<20;i++)
        {
            var dock = new cc.Sprite("poker/labai_52.png");
            dock.setScale(0.8);
            this.addChild(dock);
            dock.setPosition(cc.p(cc.winSize.width/2,cc.winSize.height/2 + 30 + offset));
            dock.setRotation(-90);
            offset += .75;
            dock.setVisible(false);

            dock.runAction(cc.sequence(cc.delayTime(time),cc.show(),cc.delayTime((19-i) *.0625 +.25-time),cc.removeSelf()));
            time += .0125;
        }


        //if(player._index == 0){
            var timedelay = 0.25;
            var posY = 15;

            for(var i=0;i<13;i++){
                if(i%3 == 0)
                    gameSound.playChiaBai();
                var sprite =  new cc.Sprite("poker/labai_52.png");
                this.addChild(sprite);
                sprite.setPosition(cc.p(cc.winSize.width/2,cc.winSize.height/2 + 30 + posY - i *1.5));
                sprite.setRotation(90);
                sprite.setLocalZOrder(1);
                sprite.setVisible(false);

                if(gamedata.gameLogic.typeRoom == 0)
                {
                    var pos = player.arrayCard1[i].convertToWorldSpaceAR(cc.p(0,0));
                    var actionSpawn = cc.spawn(cc.moveTo(.3,pos),cc.scaleTo(.3,player.arrayCard1[i].getWidth() / sprite.getContentSize().width),cc.rotateTo(.3,0));
                    sprite.runAction(cc.sequence(cc.delayTime(timedelay),cc.show(),actionSpawn,cc.scaleTo(.1,0,player.arrayCard1[i].getWidth() / sprite.getContentSize().width),cc.removeSelf()));
                    player.arrayCard1[i].setVisible(true);
                    player.arrayCard1[i].setScaleX(0);
                    if(player.index == 0 && i == 12)
                        player.arrayCard1[i].runAction(cc.sequence(cc.delayTime(.4+ timedelay),cc.scaleTo(.1,player.arrayCard1[i].rootScale,player.arrayCard1[i].rootScale), cc.callFunc(function(){
                            sceneMgr.getRunningScene().getMainLayer().finishDealCard();
                        })));
                    else
                        player.arrayCard1[i].runAction(cc.sequence(cc.delayTime(.4+ timedelay),cc.scaleTo(.1,player.arrayCard1[i].rootScale,player.arrayCard1[i].rootScale)));
                    timedelay += .125;
                }
                else
                {
                    var pos;
                    var scaleTo;
                    var layer = sceneMgr.getGUI(100);
                    if(player.index == 0)
                    {
                        pos = layer.arrayCard[i].getPosition();
                        layer.arrayCard[i].setVisible(true);
                        layer.arrayCard[i].setScaleX(0);
                        scaleTo = layer.arrayCard[i].rootScale;

                        if(i == 12)
                            layer.arrayCard[i].runAction(cc.sequence(cc.delayTime(.4+ timedelay),cc.scaleTo(.1,layer.arrayCard[i].rootScale,layer.arrayCard[i].rootScale), cc.callFunc(function(){
                                sceneMgr.getRunningScene().getMainLayer().finishDealCard();
                            })));
                        else
                            layer.arrayCard[i].runAction(cc.sequence(cc.delayTime(.4+ timedelay),cc.scaleTo(.1,layer.arrayCard[i].rootScale,layer.arrayCard[i].rootScale)));
                    }
                    else
                    {
                        pos = player.arrayCard1[i].convertToWorldSpaceAR(cc.p(0,0));
                        player.arrayCard1[i].setVisible(true);
                        player.arrayCard1[i].setScaleX(0);
                        scaleTo = player.arrayCard1[i].rootScale;
                        //if(i == 12)
                        //    player.arrayCard1[i].runAction(cc.sequence(cc.delayTime(.4+ timedelay),cc.scaleTo(.1,player.arrayCard1[i].rootScale,player.arrayCard1[i].rootScale), cc.callFunc(function(){
                        //        sceneMgr.getRunningScene().getMainLayer().finishDealCard();
                        //    })));
                        //else
                            player.arrayCard1[i].runAction(cc.sequence(cc.delayTime(.4+ timedelay),cc.scaleTo(.1,player.arrayCard1[i].rootScale,player.arrayCard1[i].rootScale)));

                    }


                    var actionSpawn = cc.spawn(cc.moveTo(.3,pos),cc.scaleTo(.3,scaleTo),cc.rotateTo(.3,0));
                    sprite.runAction(cc.sequence(cc.delayTime(timedelay),cc.show(),actionSpawn,cc.scaleTo(.1,0,scaleTo),cc.removeSelf()));



                    timedelay += .125;
                }


            }
        //}
        //else
        //{
        //    var timedelay = 0.25;
        //    var posY = 15;
        //    for(var i=0;i<10;i++){
        //        var sprite =  new cc.Sprite("GameGUI/_0009_Shape-221-copy-6.png");
        //        this.addChild(sprite);
        //        sprite.setPosition(cc.p(cc.winSize.width/2,cc.winSize.height/2 + 30 + posY - i *1.5));
        //        sprite.setRotation(90);
        //        sprite.setLocalZOrder(1);
        //        sprite.setVisible(false);
        //        var pos = player._card.convertToWorldSpaceAR(cc.p(0,0));
        //
        //        player._card.setVisible(false);
        //        player._card._tmpCount = 0;
        //        var func = function(sender,target){
        //            target._tmpCount++;
        //            target.setVisible(true);
        //            ccui.Helper.seekWidgetByName(target,"num").setString("" +target._tmpCount );
        //        }
        //        sprite.runAction(cc.sequence(cc.delayTime(timedelay),cc.show(),cc.callFunc(func,sprite,player._card),cc.spawn(cc.moveTo(.3,pos),cc.rotateTo(.3,0)),cc.removeSelf()));
        //        timedelay += .125;
        //    }
        //}
    },

    jackpot: function()
    {
        var particle = cc.ParticleSystem("Particles/BurstPipe.plist");
        particle.setPosition(cc.p(cc.winSize.width/2,cc.winSize.height));
        this.addChild(particle);

        var j = db.DBCCFactory.getInstance().buildArmatureNode("Jackpot");
        j.setPosition(cc.p(cc.winSize.width/2,cc.winSize.height/2));
        j.getAnimation().gotoAndPlay("1");
        this.addChild(j);
    }
});