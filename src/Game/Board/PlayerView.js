/**
 * Created by HOANGNGUYEN on 7/28/2015.
 */

var PlayerView = cc.Node.extend({
    
    ctor: function(gameScene){
        this._super();
        //reference
        this._cardPanel = null;
        this._panel = null;
        this._card = null;                    // doi voi enemy thi co quan card up

        this._handOnCards = [];             // danh sach card tren tay nguoi choi
        this._eatenCards = [];              // danh sach cac quan da an
        this._throwCards = [];              // danh sach cac quan nem ra
        this._listPhom   = [];              // danh sach cac phom

        this._logicCards = new TalaGroupCard([]);              // luu danh sach card cua enemy

        this._index = 0;                   // index cua Player trong array cac Player (0  = myPlayer )
        this._moveCard = null;            // Card di chuyen effect
        this.enemyCard = null;              // Card cua doi thu vut ra. de kiem tra xem minh co an dc ko
        this.canGetCard = false;            // co quyen duoc boc' bai` ko
        this.canGetCardFromEnemy = false;   // co an duoc bai` cua thang` gan minh ko
        this.showPhom = false;              // den luc show phom thi` moi dc chon nhieu quan bai
        this.cotheGuiBai = false;          // danh dau minh` co the gui bai hay khong (bug : khong an nut gui bai thi van con arrow)
        this.daGuiBai = false;
        this._listener = null;
        this._touchEnable = false;
        this._touched = false;

        // infomation of player
        this._uiAvatar  = null;               // avatar for player
        this.uID = "";
        this._uiName = null;                  // name for player
        this._uiGold = null;                  // gold
        this._uiTimer = null;                 // timer progress
        this._uiNen= null;                   // nen nhap nhay
        this._uiHome= null;
        this._type= 1;                       // 1-> enemy

        this._gameScene = gameScene;
        this._enableTouch = true;

        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        });

    },
    setPanel: function(panel){
        this._panel = panel;

        var avatar = new AvatarUI("Common/defaultAvatar.png","avatar/mask.png","");
        panel.addChild(avatar);
        avatar.setPosition(ccui.Helper.seekWidgetByName(panel,"btn").getPosition());
        avatar.setLocalZOrder(1);
        panel.getChildByName("mask").setLocalZOrder(2);
        var vip = panel.getChildByName("mask").getChildByName("vip");
        vip.ignoreContentAdaptWithSize(true);
        vip.setVisible(false);
        vip.ignoreContentAdaptWithSize(true);
        this.vip = ccui.Scale9Sprite.create(VipManager.getIconVip(1));
        vip.getParent().addChild(this.vip);
        this.vip.setPosition(vip.getPosition());
        this.vip.setLocalZOrder(3);
        panel.getChildByName("home").setLocalZOrder(5);

        this.avatarFrame = new cc.Sprite();
        var size = panel.getChildByName("mask").getContentSize()
        this.avatarFrame.setPosition(size.width/2, size.height/2);
        this.avatarFrame.setLocalZOrder(0);
        this.avatarFrame.setScale(0.54);
        panel.getChildByName("mask").addChild(this.avatarFrame);

        this._uiAvatar = avatar;
        this._uiName = ccui.Helper.seekWidgetByName(panel,"name");
        this._uiGold = ccui.Helper.seekWidgetByName(panel,"gold");
        this._uiHome = ccui.Helper.seekWidgetByName(panel,"home");
        this._uiNen = panel.getChildByName("mask").getChildByName("nen");
        this.iconBlackList = ccui.Helper.seekWidgetByName(panel, "iconBlackList");
        this.iconBlackList.setLocalZOrder(6);
        this.iconIP = ccui.Helper.seekWidgetByName(panel, "iconIP");
        this.iconIP.setLocalZOrder(6);

        var sprite = new cc.Sprite("GameGUI/_0004_Shape-241.png");
        sprite.setColor(cc.GREEN);
        this._uiTimer = new cc.ProgressTimer(sprite);
        this._uiTimer.setType(cc.ProgressTimer.TYPE_RADIAL);
        this._uiTimer.setReverseDirection(true);
        var size = panel.getChildByName("mask").getContentSize();
        this._uiTimer.setPosition(size.width/2,size.height/2);
        this._uiTimer.setPercentage(0);
        this._uiTimer.setLocalZOrder(-1);
        this._uiTimer.setScale(0.9);
        panel.getChildByName("mask").addChild(this._uiTimer);
        panel.getChildByName("panel_haphom").setLocalZOrder(3);

        var panel_throw = panel.getChildByName("panel_throw");

        switch (this._index)
        {
            case 1:
            case 3:
            {
                var y = panel_throw.getPosition().y;
                panel_throw.setPositionY(y * cc.winSize.height / Constant.HEIGHT);
                break;
            }
            case 2:
            case 0:
                panel_throw.setPositionX(panel_throw.getPosition().x * cc.winSize.width / Constant.WIDTH);
                break;
        }


    },

    updateItem: function(id) {
        cc.log("UPDATE ITEM ************8 " + id);
    },

    initCards: function(cards){

        var height = this._cardPanel.getContentSize().height;
        for(var i = 0;i<cards.length;i++)
        {
            var card = new TalaCard(cards[i]);
            //card.setScale(Constant.HEIGHT / 480);
            card._startY = height/2;
            this._handOnCards.push(card);
            this.addChild(card);
            card.setLocalZOrder(i);
            card.setVisible(false);
        }
        this.fixPositionHandOnCardForMy();

    },
    /* init for myPlayer */
    initForMy: function(){
        if(!this._cardPanel)
        {
            return;
        }
        this.setPosition(this._cardPanel.getPosition().x,this._cardPanel.getPosition().y);
        this._cardPanel.setVisible(false);
        var width = cc.director.getWinSize().width - 800 + this._cardPanel.getContentSize().width;
        var height = this._cardPanel.getContentSize().height;

        this._index = 0;
        cc.eventManager.addListener(this._listener,this);
        this._touchEnable = true;
        this.touchID = -1;
        if(!this._moveCard)
        {
            this._moveCard = new TalaCard(52);
            this.addChild(this._moveCard);
            this._moveCard.setVisible(false);
            this._moveCard.setOpacity(100);
            this._moveCard.setLocalZOrder(20);
        }
        this._type = 0;

    },
    /* myPlayer ; fix position cards khi danh quan bai */
    fixPositionHandOnCardForMy: function(){
        if(!this._cardPanel)
        {
            return;
        }
        if(this._handOnCards.length === 0)
            return;
        var mainLayer = sceneMgr.getMainLayer();
        cc.log("cc.director.getWinSize().width " + cc.director.getWinSize().width + " " + this._cardPanel.getContentSize().width);
        var width = cc.director.getWinSize().width - Constant.WIDTH + this._cardPanel.getContentSize().width;
        var height = this._cardPanel.getContentSize().height;
        this.setContentSize(cc.size(width,height));

        var cardW = this._handOnCards[0].getContentSize().width * mainLayer._layout.getScale();
        //var cardH = this._handOnCards[0].getContentSize().height;

        var xx = (width - cardW) / 9;       // khoang cach giua 2 card

        if((this._handOnCards.length % 2 ) == 0)
        {
            var idx = this._handOnCards.length / 2 - 1;

            for(var i = idx;i>= 0 ;i--)
            {
                this._handOnCards[i].forceDOWN();
                this._handOnCards[i].setPosition(cc.p(width / 2 - xx / 2 - (idx - i) * xx , height /2));
            }
            for(var i = idx + 1;i< this._handOnCards.length ;i++)
            {
                this._handOnCards[i].forceDOWN();
                this._handOnCards[i].setPosition(cc.p(width / 2 + xx / 2 + (i - idx - 1) * xx , height /2));
            }
        }
        else
        {
            var idx = Math.floor(this._handOnCards.length / 2);
            for(var i = idx;i>= 0 ;i--)
            {
                this._handOnCards[i].forceDOWN();
                this._handOnCards[i].setPosition(cc.p(width / 2 - (idx - i) * xx , height /2));
            }
            for(var i = idx ;i< this._handOnCards.length ;i++)
            {
                this._handOnCards[i].forceDOWN();
                this._handOnCards[i].setPosition(cc.p(width / 2 + (i - idx ) * xx , height /2));
            }
        }
    },

    _chooseCard: null,
    _cardMoveTo: null,
    _firstOrEnd: false,
    _needMove: false,
    _startPoint: cc.p(-1,-1),
    rect: function(){
        if (this._handOnCards.length == 0)
            if (this._handOnCards.length == 0)
            {
                return cc.rect(0,0,0,0);
            }
        var pos = this.getPosition();
        pos.x += (this._handOnCards[0].getPositionX() - this._handOnCards[0].getContentSize().width * this._handOnCards[0].getAnchorPoint().x);
        pos.y += (this._handOnCards[0].getPositionY() - this._handOnCards[0].getContentSize().height * this._handOnCards[0].getAnchorPoint().y);
        var width = (this._handOnCards[this._handOnCards.length - 1].getPositionX() - this._handOnCards[0].getPositionX()) + this._handOnCards[0].getContentSize().width;
        var height = this._handOnCards[0].getContentSize().height;

        return cc.rect(pos.x,pos.y,width,height);
    },

    onTouchBegan: function(touch,event)
    {
        var target = event.getCurrentTarget();
        var needTouch = true
        if (!cc.sys.isNative && touch.getID() === undefined){
            touch._id = 0;
        }

        if(target._handOnCards.length == 0)
            needTouch = false;
        for(var i=0;i<target._handOnCards.length;i++) {
            if(!target._handOnCards[i].isVisible()){
                needTouch = false;
                break;
            }
        }
        if(touch.getID() != 0 || !target._touchEnable || !needTouch)
            return false;

        target.touchID = touch.getID();
        target._touched = true;
        target._needMove = false;
        target._chooseCard = null;
        target._cardMoveTo = null;

        for (var i = target._handOnCards.length-1;i>=0;i--)
        {
            if (target._handOnCards[i].containTouchPoint(touch.getLocation()))
            {
                target._startPoint = touch.getLocation();
                target._chooseCard = target._handOnCards[i];

                var anchor = target._chooseCard.calculateAnchorPoint(touch.getLocation());
                target._moveCard.setAnchorPoint(anchor);
                return true;
            }
        }
        return false;
    },

    onTouchMoved: function(touch,event)
    {
        var target = event.getCurrentTarget();
        if (touch.getID() != 0 || !target._touchEnable || !target._touched || (touch.getID() != target.touchID))
            return;

        if (target._startPoint.x == -1 || !target._chooseCard)
            return;
        var distance = cc.pSub(touch.getLocation(),target._startPoint);
        var length = distance.x * distance.x + distance.y * distance.y;
        if (!target._needMove && (length >= 15 * 15) )
        {
            target._needMove = true;
        }
        if (!target._needMove)
            return;

        target._firstOrEnd = false;
        target._moveCard.setVisible(true);
        try {
            if (target._chooseCard && target._chooseCard.setVisible)
                target._chooseCard.setVisible(false);
        }
        catch (ex) {
            return;
        }

        target._moveCard.setID(target._chooseCard.id);
        target._moveCard.setOpacity(100);
        target._moveCard.setLocalZOrder(20);
        target._moveCard.setPosition(target.convertToNodeSpace(touch.getLocation())); 


        var rect = target.rect();
        for (var i = target._handOnCards.length-1;i >=0 ; i--)
        {
            target._handOnCards[i].setColor(cc.WHITE);
            target._handOnCards[i].forceDOWN();
        }
        target._cardMoveTo = null;
        if (0 && ((touch.getLocation().y < (rect.y - rect.height * .5)) || (touch.getLocation().y > (rect.y + rect.height * 1.5 ))))
        {
            target._touchEnable = false;
            target._touched = false;
            var pos = target.convertToNodeSpace(target._chooseCard.convertToWorldSpaceAR(cc.p(0,0)));
            var newPosWithAnchor0_5 = target._moveCard.calculateNewPositionWithNewAnchor(cc.p(.5,.5));
            target._moveCard.setAnchorPoint(cc.p(.5,.5));
            target._moveCard.setOpacity(255);

            target._moveCard.setPosition(newPosWithAnchor0_5);
            target._moveCard.setLocalZOrder(target._chooseCard.getLocalZOrder());
            target._moveCard.runAction(new cc.Sequence(new cc.EaseExponentialOut(new cc.MoveTo(.35,pos)),new cc.CallFunc(function(sender,pTarget){
                pTarget._touchEnable = true;
            },target,target),new cc.Hide()));

            target._chooseCard.setOpacity(100);
            //target.runAction(new cc.Sequence(new cc.DelayTime(.35),new cc.CallFunc(target.registerTouch,target,target)));
            target._chooseCard.runAction(new cc.Sequence(new cc.DelayTime(.325),new cc.Show(),new cc.FadeTo(.025,255)));
        }
        else
        {
            var x = touch.getLocation().x;
            if(target._handOnCards.length == 1)
            {
                target._cardMoveTo = target._handOnCards[0];
                return;
            }
            for (var i= target._handOnCards.length-1;i>=0;i--)
            {
                var anchor1 = target._handOnCards[i].convertToWorldSpace(cc.p(0,0)).x;
                var anchor2 = anchor1 + target._handOnCards[i].getContentSize().width;
                if (i == target._handOnCards.length-1)
                {
                    if (x >= anchor1)
                    {
                        target._handOnCards[i].setColor(cc.color(100,100,100));
                        target._cardMoveTo = target._handOnCards[i];
                        if (x >= anchor2)
                        {
                            target._firstOrEnd = true;
                        }
                        break;
                    }
                }
                else if(i == 0)
                {
                    if (x < target._handOnCards[i+1].convertToWorldSpace(cc.p(0,0)).x)
                    {
                        target._handOnCards[i].setColor(cc.color(100,100,100));
                        target._cardMoveTo = target._handOnCards[i];
                        if (x <anchor1)
                        {
                            target._firstOrEnd = true;
                        }
                        break;
                    }
                }
                else
                {
                    var anchor3 = target._handOnCards[i+1].convertToWorldSpace(cc.p(0,0)).x;
                    var anchor = Math.max(anchor3,anchor1);
                    if(x >= anchor1 && x < anchor)
                    {
                        target._handOnCards[i].setColor(cc.color(100,100,100));
                        target._cardMoveTo = target._handOnCards[i];
                        break;
                    }


                }

            }
        }

    },
    onTouchEnded: function(touch,event)
    {
        var target = event.getCurrentTarget();
        if (touch.getID() != 0 || !target._touchEnable || (touch.getID() != target.touchID))
            return;

        target._touched = false;
        if (!target._needMove)
        {
            for (var i = target._handOnCards.length-1;i>=0;i--)
            {
                if (target._handOnCards[i].containTouchPoint(touch.getLocation()) && target._handOnCards[i].isVisible())
                {
                    if(!target.showPhom)
                    {
                        for (var j = target._handOnCards.length-1;j>=0;j--)
                        {
                            if(i != j)
                            {
                                target._handOnCards[j].down();
                            }
                        }
                    }
                    target._handOnCards[i].updown();
                    gameSound.clickQuanbai();

                    return;
                }
            }
        }

        if (target._cardMoveTo && target._chooseCard)
        {
            var idxChooseCard = -1;
            var idxCardMoveTo = -1;
            for (var i = target._handOnCards.length-1;i>=0;i--)
            {
                if (target._cardMoveTo.id == target._handOnCards[i].id)
                {
                    idxCardMoveTo = i;
                }
                if (target._chooseCard.id == target._handOnCards[i].id)
                {
                    idxChooseCard = i;
                }
            }

            if (idxCardMoveTo == -1 || idxChooseCard == -1)
                return;

            if (idxCardMoveTo == idxChooseCard)
            {
                target._touchEnable = false;
                var pos = target.convertToNodeSpace(target._chooseCard.convertToWorldSpaceAR(cc.p(0,0)));
                var newPosWithAnchor0_5 = target._moveCard.calculateNewPositionWithNewAnchor(cc.p(.5,.5));
                target._moveCard.setAnchorPoint(cc.p(.5,.5));
                target._moveCard.setLocalZOrder(target._chooseCard.getLocalZOrder());
                target._moveCard.setPosition(newPosWithAnchor0_5);
                //target._moveCard.runAction(CCSequence::create(CCEaseExponentialOut::create(CCMoveTo::create(.25,pos)),CCCallFuncND::create(this,callfuncND_selector(Player::callbackMoveCard),NULL),CCHide::create(),NULL));
                target._moveCard.runAction(new cc.Sequence(new cc.EaseExponentialOut(new cc.moveTo(.25,pos)),new cc.CallFunc(function(sender,pTarget){
                    pTarget._touchEnable = true;
                },target,target),new cc.Hide()));
                target._chooseCard.setColor(cc.WHITE);
                target._chooseCard.runAction(new cc.Sequence(new cc.DelayTime(.25),new cc.Show()));
            }
            else if(idxChooseCard < idxCardMoveTo)
            {

                var id = target._handOnCards[idxChooseCard].id;
                var eaten = target._handOnCards[idxChooseCard].m_IsEaten;
                for (var i = idxChooseCard;i<idxCardMoveTo;i++)
                {
                    target._handOnCards[i].setID(target._handOnCards[i+1].id);
                    target.addEatenForCard(target._handOnCards[i],target._handOnCards[i+1].m_IsEaten);
                    target._handOnCards[i].setVisible(false);
                    target._handOnCards[i].runAction(new cc.Sequence(new cc.DelayTime(.25),new cc.Show()));

                    var cardEffect = new TalaCard(target._handOnCards[i+1].id);
                    cardEffect.setLocalZOrder(target._handOnCards[i].getLocalZOrder());
                    target.addChild(cardEffect);
                    cardEffect.setPosition(target._handOnCards[i+1].getPosition());
                    cardEffect.runAction(new cc.Sequence(new cc.EaseExponentialOut(new cc.MoveTo(.25,target._handOnCards[i].getPosition())),new cc.RemoveSelf()));

                }
                target._handOnCards[idxCardMoveTo].setID(id);
                target.addEatenForCard(target._handOnCards[idxCardMoveTo],eaten);
                target._handOnCards[idxCardMoveTo].setVisible(false);
                target._handOnCards[idxCardMoveTo].setColor(cc.WHITE);
                target._handOnCards[idxCardMoveTo].runAction(new cc.Sequence(new cc.DelayTime(.25),new cc.Show()));

                target._touchEnable = false;
                var pos = target.convertToNodeSpace(target._cardMoveTo.convertToWorldSpaceAR(cc.p(0,0)));
                var newPosWithAnchor0_5 = target._moveCard.calculateNewPositionWithNewAnchor(cc.p(.5,.5));
                target._moveCard.setLocalZOrder(target._cardMoveTo.getLocalZOrder());

                target._moveCard.setAnchorPoint(cc.p(.5,.5));
                target._moveCard.setOpacity(255);
                target._moveCard.setPosition(newPosWithAnchor0_5);
                target._moveCard.runAction(new cc.Sequence(new cc.EaseExponentialOut(new cc.moveTo(.25,pos)),new cc.CallFunc(function(sender,pTarget){
                    pTarget._touchEnable = true;
                },target,target),new cc.Hide()));
            }
            else
            {
                if (idxCardMoveTo == 0 && target._firstOrEnd)
                {
                    var id = target._handOnCards[idxChooseCard].id;
                    var eaten = target._handOnCards[idxChooseCard].m_IsEaten;
                    for (var i = idxChooseCard;i> idxCardMoveTo;i--)
                    {

                        target._handOnCards[i].setID(target._handOnCards[i-1].id);
                        target.addEatenForCard(target._handOnCards[i],target._handOnCards[i-1].m_IsEaten);
                        target._handOnCards[i].setVisible(false);
                        target._handOnCards[i].runAction(new cc.Sequence(new cc.DelayTime(.25),new cc.Show()));

                        var cardEffect = new TalaCard(target._handOnCards[i-1].id);
                        cardEffect.setLocalZOrder(target._handOnCards[i].getLocalZOrder());
                        target.addChild(cardEffect);
                        cardEffect.setPosition(target._handOnCards[i-1].getPosition());
                        cardEffect.runAction(new cc.Sequence(new cc.EaseExponentialOut(new cc.MoveTo(.25,target._handOnCards[i].getPosition())),new cc.RemoveSelf()));
                    }

                    target._handOnCards[idxCardMoveTo].setID(id);
                    target.addEatenForCard(target._handOnCards[idxCardMoveTo],eaten);
                    target._handOnCards[idxCardMoveTo].setVisible(false);
                    target._handOnCards[idxCardMoveTo].setColor(cc.WHITE);
                    target._handOnCards[idxCardMoveTo].runAction(new cc.Sequence(new cc.DelayTime(.25),new cc.Show()));

                    target._touchEnable = false;
                    var pos = target.convertToNodeSpace(target._cardMoveTo.convertToWorldSpaceAR(cc.p(0,0)));
                    var newPosWithAnchor0_5 = target._moveCard.calculateNewPositionWithNewAnchor(cc.p(.5,.5));
                    target._moveCard.setLocalZOrder(target._cardMoveTo.getLocalZOrder());

                    target._moveCard.setAnchorPoint(cc.p(.5,.5));
                    target._moveCard.setOpacity(255);
                    target._moveCard.setPosition(newPosWithAnchor0_5);
                    target._moveCard.runAction(new cc.Sequence(new cc.EaseExponentialOut(new cc.moveTo(.25,pos)),new cc.CallFunc(function(sender,pTarget){
                        pTarget._touchEnable = true;
                    },target,target),new cc.Hide()));
                }
                else
                {
                    if (idxChooseCard == (idxCardMoveTo +1))
                    {
                        target._touchEnable = false;
                        var pos = target.convertToNodeSpace(target._chooseCard.convertToWorldSpaceAR(cc.p(0,0)));
                        var newPosWithAnchor0_5 = target._moveCard.calculateNewPositionWithNewAnchor(cc.p(.5,.5));
                        target._moveCard.setLocalZOrder(target._cardMoveTo.getLocalZOrder());

                        target._moveCard.setAnchorPoint(cc.p(.5,.5));
                        target._cardMoveTo.setColor(cc.WHITE);
                        target._moveCard.setPosition(newPosWithAnchor0_5);
                        target._moveCard.runAction(new cc.Sequence(new cc.EaseExponentialOut(new cc.moveTo(.25,pos)),new cc.CallFunc(function(sender,pTarget){
                            pTarget._touchEnable = true;
                        },target,target),new cc.Hide()));
                        target._chooseCard.setColor(cc.WHITE);
                        target._chooseCard.runAction(new cc.Sequence(new cc.DelayTime(.25),new cc.Show()));

                    }
                    else
                    {
                        var id = target._handOnCards[idxChooseCard].id;
                        var eaten = target._handOnCards[idxChooseCard].m_IsEaten;
                        for (var i = idxChooseCard;i> idxCardMoveTo + 1;i--)
                        {

                            target._handOnCards[i].setID(target._handOnCards[i-1].id);
                            target.addEatenForCard(target._handOnCards[i],target._handOnCards[i-1].m_IsEaten);
                            target._handOnCards[i].setVisible(false);
                            target._handOnCards[i].runAction(new cc.Sequence(new cc.DelayTime(.25),new cc.Show()));

                            var cardEffect = new TalaCard(target._handOnCards[i-1].id);
                            cardEffect.setLocalZOrder(target._handOnCards[i].getLocalZOrder());
                            target.addChild(cardEffect);
                            cardEffect.setPosition(target._handOnCards[i-1].getPosition());
                            cardEffect.runAction(new cc.Sequence(new cc.EaseExponentialOut(new cc.MoveTo(.25,target._handOnCards[i].getPosition())),new cc.RemoveSelf()));
                        }
                        target._handOnCards[idxCardMoveTo + 1].setID(id);
                        target.addEatenForCard(target._handOnCards[idxCardMoveTo + 1],eaten);
                        target._handOnCards[idxCardMoveTo + 1].setVisible(false);
                        target._handOnCards[idxCardMoveTo + 1].setColor(cc.WHITE);
                        target._handOnCards[idxCardMoveTo + 1].runAction(new cc.Sequence(new cc.DelayTime(.25),new cc.Show()));

                        target._cardMoveTo.setColor(cc.WHITE);

                        target._touchEnable = false;
                        var pos = target.convertToNodeSpace(target._handOnCards[idxCardMoveTo +1].convertToWorldSpaceAR(cc.p(0,0)));
                        var newPosWithAnchor0_5 = target._moveCard.calculateNewPositionWithNewAnchor(cc.p(.5,.5));

                        target._moveCard.setLocalZOrder(target._cardMoveTo.getLocalZOrder());
                        target._moveCard.setAnchorPoint(cc.p(.5,.5));
                        target._moveCard.setOpacity(255);
                        target._moveCard.setPosition(newPosWithAnchor0_5);
                        target._moveCard.runAction(new cc.Sequence(new cc.EaseExponentialOut(new cc.moveTo(.25,pos)),new cc.CallFunc(function(sender,pTarget){
                            pTarget._touchEnable = true;
                        },target,target),new cc.Hide()));

                    }
                }
            }

        }

        target._cardMoveTo = null;
        target._needMove = false;
        target._firstOrEnd = false;
        target._startPoint = cc.p(-1,-1);
        target._chooseCard = null;
    },

    safeSetDownCard: function() // chuyen cac card ve vi tri ban dau
    {
        var target = this;
        for (var i = target._handOnCards.length-1;i>=0;i--)
        {
            target._handOnCards[i].down();
            target._handOnCards[i].setVisible(true);
            target._handOnCards[i].setColor(cc.WHITE);

        }
        target._cardMoveTo = null;
        target._needMove = false;
        target._firstOrEnd = false;
        target._startPoint = cc.p(-1,-1);
        target._chooseCard = null;

        if(this._moveCard)
        {
            this._moveCard.stopAllActions();
            this._moveCard.setVisible(false);
        }
    },

    updateWithPlayer: function(player)
    {

        if(!player._ingame)
        {
            this.setVisible(false);
            return;
        }
        if(!player._active)
        {
            return;
        }

        if (!player._info || !player._info["uName"]) {
            return;
        }

        if (Config.ENABLE_CHEAT && Config.ENABLE_RECORD_VIDEO){
            var avatar = "http://120.138.65.103/sources/apk/tala/mobileWeb/RecordVideoAvatar/";
            var nameTemp;
            var isIdRecord = true;
            if (player._info["uID"] === 1){
                avatar += "mrT.png";
                nameTemp = "Mr.T";
            } else if (player._info["uID"] === 2){
                avatar += "phuong.png";
                nameTemp = "Phương";
            } else if (player._info["uID"] === 3){
                avatar += "tho.png";
                nameTemp = "Thọ";
            } else if (player._info["uID"] === 4){
                avatar += "ngoc.png";
                nameTemp = "Ngọc";
            } else {
                isIdRecord = false;
            }
            if (isIdRecord){
                player._info["avatar"] = avatar;
                player._info["uName"] = nameTemp;
                player._info["ip"] = Math.random() * 100000 + "";
            }
            cc.log("player._info: ", JSON.stringify(player._info));
        }

        this.info = player._info;
        this.setVisible(true);
        var name = StringUtility.replaceNameInValid(player._info["uName"]);
        this._uiName.setString(StringUtility.subStringTextLength(name,12));
        try {
            // this._uiAvatar.asyncExecuteWithUrl(player._info["uID"],"Common/defaultAvatar.png");
            this._uiAvatar.asyncExecuteWithUrl(player._info["uID"],player._info["avatar"]);
            cc.log("avatar: ", player._info["uID"], player._info["avatar"]);
        }
        catch (ex) {
            cc.error("loi anh: ", ex);
            var log = player._info["uID"] + "  " + player._info["avatar"];
            NativeBridge.logJSManual("PlayerView.js", "111111", log , NativeBridge.getVersionString());
        }

        this.uID = player._info["uID"];
        this._uiGold.setString(StringUtility.formatNumberSymbol(player._info["bean"]));

        this.vip.setVisible(player._info["vip"] > 0);
        try {
            if (player._info["vip"] > 0){
                this.vip.initWithFile(VipManager.getIconVip(player._info["vip"]));
            }
        } catch (e) {
            cc.error("loi load vip: ", player._info["vip"]);
            if (player._info["vip"] > 0) {
                this.vip.setVisible(false);
            }
        }

        if (player._info["uID"] === userMgr.getUID()){
            var state = (VipManager.getInstance().getRemainTime() > 0) ? 0 : 1;
            this.vip.setState(state);
        }

        this.addVipEffect();


        if(player._status == 4)     // dang xem
        {
            this.viewing(true);
            if(this._index != 0)
                this._card.setVisible(false);
        }
        else if(player._status == 0)
        {
            this.setVisible(false);
            if(this._index != 0)
                this._card.setVisible(false);
        }
        else
        {
            this.viewing(false);

        }

        player._active = false;
        this.checkBlackList();

    },
    addEmoticon: function(vui)
    {
        var path = "Armatures/Emoticon/";
        if(vui)
            path += "vui";
        else
            path += "buon"
        var rand =  Math.floor(1 + Math.random() * 3);rand = (rand > 3)?3:rand;
        path += (rand + ".png");

        var sprite = new cc.Sprite(path);sprite.setLocalZOrder(55)
        this._panel.addChild(sprite);var pos = this._panel.getChildByName("btn").getPosition();
        if(!vui && (rand == 3))
            sprite.setPosition(pos.x,pos.y + 13);
        else
            sprite.setPosition(pos.x,pos.y + 0);
        sprite.setOpacity(0);
        sprite.runAction(cc.sequence(cc.fadeIn(.25),cc.sequence(cc.moveBy(.25,cc.p(0,20)),cc.moveBy(.25,cc.p(0,-20))).repeat(5),cc.fadeOut(.25),cc.removeSelf()));

    },

    checkBlackList: function() {
        if (!this.info) {
            this.iconBlackList.setVisible(false);
            this.iconIP.setVisible(false);
            return;
        }

        this.iconBlackList.setVisible(false);
        this.iconIP.setVisible(false);
    },

    updateState:function(state)
    {
        var node = this._panel.getChildByName("state");
        node.removeAllChildren(true);
        node.setLocalZOrder(6);
        if(state == "dangboc")
        {
            var sprite = new cc.Sprite("NewGameGUI/hoang_0002_-ang-B-c.png");
            node.addChild(sprite);
        }
        else if(state == "dangdanh")
        {
            var sprite = new cc.Sprite("NewGameGUI/hoang_0003_-ang---nh.png");
            node.addChild(sprite);
        }
        else if(state == "dangha")
        {
            var sprite = new cc.Sprite("NewGameGUI/hoang_0001_-ang-H-.png");
            node.addChild(sprite);
        }
        else if(state == "danggui")
        {
            var sprite = new cc.Sprite("NewGameGUI/hoang_0000_-ang-G-i.png");
            node.addChild(sprite);
        }
    },
    viewing: function(view){
        if(view)
        {
            this._panel.setColor({r:150,g:150,b:150});
            this._uiAvatar.setColor({r:150,g:150,b:150});
            this._panel.getChildByName("view").setVisible(true);
            this._panel.getChildByName("view").setLocalZOrder(10);
            if(this._index == 0)
            {
                this._panel.setColor(cc.WHITE);
                this._uiAvatar.setColor(cc.WHITE);
                var node = this._panel.getChildByName("view").getChildByName("wait");

                if (node.getChildByTag(25))
                {
                    node.getChildByTag(25).stopAllActions();
                    node.getChildByTag(25).removeFromParent(true);
                }

                var animation = new cc.Animation();
                for (var i = 0;i<4;i++)
                {
                    animation.addSpriteFrameWithFile("res/common/animation/viewing2/viewing_" + i+".png");
                }
                animation.setDelayPerUnit(.085);

                var _wait = cc.Sprite.create("res/common/animation/viewing2/viewing_0.png");
                _wait.setTag(25)
                node.addChild(_wait,25);

                _wait.runAction(new cc.RepeatForever(cc.animate(animation)));
            }
        }
        else
        {
            this._panel.setColor(cc.WHITE);
            this._uiAvatar.setColor(cc.WHITE);
            this._panel.getChildByName("view").setVisible(false);
            if(this._index == 0) {
                var node = this._panel.getChildByName("view").getChildByName("wait");

                if (node.getChildByTag(25))
                {
                    node.getChildByTag(25).stopAllActions();
                    node.getChildByTag(25).removeFromParent(true);
                }
            }
        }

    },
    addVipEffect: function(){
        if (!this.info) return;

        var listBenefitHave = VipManager.getInstance().getListBenefitHave(this.info["vip"], false);
        if(listBenefitHave.indexOf(6) >= 0) // key hieu ung vao ban
        {
            var particle = new cc.ParticleSystem("Particles/card.plist");
            particle.setLocalZOrder(5);
            this._panel.addChild(particle);
            particle.setPosition(ccui.Helper.seekWidgetByName(this._panel,"btn").getPosition());
        }
    },
    setVisible: function(visible){
        cc.Node.prototype.setVisible.call(this,visible);
        this._panel.setVisible(visible);
    },
    danhbai: function(cards){
        var ret = []
        if(this._type == Player.MY)
        {
            this.safeSetDownCard();
            for(var j=0;j<this._handOnCards.length;j++){
                this._handOnCards[j].forceDOWN();
                this._handOnCards[j].setVisible(true);
            }

            var check = [];
            for(var i=0;i<cards.length;i++){
                for(var j=0;j<this._handOnCards.length;j++){
                    if(this._handOnCards[j].id == cards[i])
                    {
                        ret.push({id:this._handOnCards[j].id,x: this._handOnCards[j].convertToWorldSpaceAR(cc.p(0,0)).x,y : this._handOnCards[j].convertToWorldSpaceAR(cc.p(0,0)).y});
                        check.push(j);
                        break;
                    }
                }
            }

            for(var i = check.length-1;i>= 0;i--){
                this._handOnCards[check[i]].removeFromParent(true);
                this._handOnCards.splice(check[i],1);
            }
            this.fixPositionHandOnCardForMy();
        }
        else{
            for(var i=0;i<cards.length;i++) {
                ret.push({
                    id: cards[i],
                    x: this._card.convertToWorldSpaceAR(cc.p(0,0)).x,
                    y: this._card.convertToWorldSpaceAR(cc.p(0,0)).y
                });
            }
        }
        return ret;
    },
    addEffectTime: function(time,timeRemain){
        this.stopEffectTime();
        var percent = 1;
        if(timeRemain)
            percent = timeRemain / time;
        this._uiTimer.setVisible(true);
        this._uiTimer.setPercentage(percent * 100);
        var effect = engine.TimeProgressEffect.create(this._uiTimer,time,percent);
        this._uiTimer.runAction(effect);

        this._uiTimer._time = time;
        this._uiTimer.canhbao = true;
        if(this._index == 0)
            this._uiTimer.runAction(cc.sequence(cc.callFunc(function()
            {
                if(this._time < 5)
                {
                    gameSound.playTimer();
                    if(this.canhbao)
                    {
                        gameSound.playTimeNoi();
                        this.canhbao = false;
                    }
                }
                this._time--;
            }.bind(this._uiTimer)),cc.delayTime(1)).repeat(Math.max(Math.floor(time),1)));

        var size = this._panel.getChildByName("mask").getContentSize();
        var node= new cc.Node();
        node.setLocalZOrder(11);

        node.setPosition(cc.p(size.width/2,size.height/2))
        this._panel.getChildByName("mask").addChild(node);
        node.setTag(111);

        var sun = new cc.ParticleSun();
        sun.texture = cc.textureCache.addImage("res/common/particles/fire.png");
        node.addChild(sun);
        sun.setPosition(cc.p(0,0))
        sun.setScale(.25)
        node.runAction(cc.sequence(engine.MoveCircle.create(time,size.width/2 - 7,0,6.28),cc.removeSelf()))
    },
    stopEffectTime: function()
    {
        this._uiTimer.stopAllActions();
        this._uiTimer.setVisible(false);
        this._uiNen.setVisible(false);

        if(this._panel.getChildByName("mask").getChildByTag(111))
        {
            this._panel.getChildByName("mask").getChildByTag(111).stopAllActions();
            this._panel.getChildByName("mask").getChildByTag(111).removeFromParent(true);
        }

    },
    sapxep: function(){
        var cards = new TalaGroupCard([]);             // card original (de return)
        var tmpCards = new TalaGroupCard([]);

        for(var i=0;i<this._handOnCards.length;i++)
        {
            var card1 = new Card(this._handOnCards[i].id);card1.isEaten = this._handOnCards[i].m_IsEaten;
            cards.cards.push(card1);
            var card2 = new Card(this._handOnCards[i].id);card2.isEaten = this._handOnCards[i].m_IsEaten;
            tmpCards.cards.push(card2);
        }

        var groupSapxep = TalaGameRule.arrangeCard(tmpCards);

        for (var i=0;i<this._handOnCards.length;i++)
        {
            this._handOnCards[i].setID(groupSapxep.cards[i].id);
            var eaten = false;
            for(var j=0;j<cards.cards.length;j++)
            {
                if(groupSapxep.cards[i].id == cards.cards[j].id)
                {
                    eaten = cards.cards[j].isEaten;
                    break;
                }
            }
            this.addEatenForCard(this._handOnCards[i],eaten);
        }
        return cards;
    },
    clearBai : function()
    {
        for(var i=0;i<this._handOnCards.length;i++){
            this._handOnCards[i].removeFromParent();
        }
        this._handOnCards = [];
        inGameMgr.gameLogic.logInitCard = "RESET CARD";
    },
    addMoney: function(money,time,fly)           // Effect tien` khi het van' choi
    {
        var _time = 0;
        if(time)
            _time = time;
        var nodeMoney = PlayerView.createNodeMoney(money);
        nodeMoney.setLocalZOrder(10);
        nodeMoney.setOpacity(100);
        nodeMoney.setScale(2.75);
        var scale = 1.1;
        var scale2 = .85;
        switch (this._index)
        {
            case 0:
            {
                scale = 1.35;
                scale2 = 1.2;
                nodeMoney.setPosition(cc.pAdd(cc.p(this._cardPanel.getContentSize().width/2,120),this._panel.convertToWorldSpace(cc.p(0,0))));
                break;
            }
            case 1:
            {
                nodeMoney.setPosition(cc.pAdd(cc.p(105,70),this._panel.convertToWorldSpace(cc.p(0,0))));
                break;
            }
            case 2:
            {
                nodeMoney.setPosition(cc.pAdd(cc.p(30,70),this._panel.convertToWorldSpace(cc.p(0,0))));
                break;
            }
            case 3:
            {
                nodeMoney.setPosition(cc.pAdd(cc.p(10,70),this._panel.convertToWorldSpace(cc.p(0,0))));
                break;
            }
        }

        nodeMoney.setVisible(false);

        if(fly)

            nodeMoney.runAction(cc.sequence(cc.delayTime(0),cc.show(),cc.spawn(cc.fadeIn(.5),new cc.EaseBounceOut(cc.scaleTo(.5,scale))),cc.delayTime(3),cc.spawn(cc.moveBy(.85,cc.p(0,this._index == 2 ? 80:80)),cc.fadeOut(.5)),cc.removeSelf()));
        else

            nodeMoney.runAction(cc.sequence(cc.delayTime(0),cc.show(),cc.spawn(cc.fadeIn(.5),new cc.EaseBounceOut(cc.scaleTo(.5,scale2))),cc.delayTime(2.5),cc.fadeOut(.5),cc.removeSelf()));

        this._gameScene._effect2D.addChild(nodeMoney);
    },
    addEatenForCard: function(talacard,eaten)
    {
        if(eaten !== undefined)
        {
            if(eaten)
            {
                if(talacard.getChildByTag(101))
                {
                    return;
                }
            }
            else
            {
                if(talacard.getChildByTag(101))
                {
                    talacard.getChildByTag(101).removeFromParent();
                    talacard.m_IsEaten = false;
                }
                return;
            }
        }
        if(talacard.getChildByTag(101))
            return;
        var anim = new cc.Animation();
        for(var i=0;i<4;i++)
        {
            anim.addSpriteFrameWithFile("res/common/animation/eaten/eaten_"+i+".png");
        }
        anim.setDelayPerUnit(.1);

        var size = talacard.getContentSize();
        var sprite = new cc.Sprite("res/common/animation/eaten/eaten_0.png");
        sprite.setPosition(cc.p(size.width/2,size.height/2));
        talacard.addChild(sprite);
        sprite.setTag(101);
        sprite.runAction(cc.repeatForever(cc.animate(anim)));
        talacard.m_IsEaten = true;
    },
    addTalaCardEaten: function (cardID)             // them 1 la bai` vao danh sach cacs card da an
    {
        var talacard = new TalaCard(cardID);
        this.addEatenForCard(talacard);
        if(this._index == 0)
        {
            this.safeSetDownCard();
            var height = this._cardPanel.getContentSize().height;
            talacard._startY = height/2;
            talacard.setLocalZOrder(this._handOnCards.length == 0 ? 0:(this._handOnCards[this._handOnCards.length - 1].getLocalZOrder() +1 ));
            this._handOnCards.push(talacard);
            this.addChild(talacard);
            var obj = {};obj.id = cardID;
            this._eatenCards.push(obj);

            this.fixPositionHandOnCardForMy();
        }
        else if(this._index == 1 || this._index == 3)
        {
            talacard.setScale(.658);
            var panel = this._panel.getChildByName("panel_eat");
            panel.addChild(talacard);
            this._eatenCards.push(talacard);
            talacard.setPosition(cc.p(panel.getContentSize().width/2,(-.5 - this._eatenCards.length) * 25));
        }
        else if(this._index == 2)
        {
            talacard.setScale(.658);
            var panel = this._panel.getChildByName("panel_eat");
            panel.addChild(talacard);
            this._eatenCards.push(talacard);
            talacard.setPosition(cc.p((.5 + this._eatenCards.length) * -25,panel.getContentSize().height/2));
            talacard.setLocalZOrder(10 - this._eatenCards.length);
        }
        return talacard;
    },
    addTalaCardThrow: function (cardID)// them 1 la bai vao danh sach cac card nem ra
    {
        var talacard = new TalaCard(cardID);
        this._throwCards.push(talacard);
        talacard.setScale(.66);
        var panel = this._panel.getChildByName("panel_throw");
        panel.addChild(talacard);
        talacard.setPosition(cc.p((.5 + this._throwCards.length) * 25,panel.getContentSize().height/2));
        return talacard;
    },
    throwTalaCard: function(cardID)         // nem 1 card kem effect
    {
        this.safeSetDownCard();
        var pos = this.removeCardFromHandOn(cardID);
        var cardAdd = this.addTalaCardThrow(cardID);
        cardAdd.posOfCardThrow = pos;
        return cardAdd;
    },
    getThrowCard: function(cardID)
    {
        for(var i=0;i<this._throwCards.length;i++)
        {
            if(this._throwCards[i].id == cardID)
            {
                return this._throwCards[i];
            }
        }
        return null;
    },
    removeThrowCard: function(cardID)
    {
        for(var i=0;i<this._throwCards.length;i++)
        {
            if(this._throwCards[i].id == cardID)
            {
                this._throwCards[i].removeFromParent();
                this._throwCards.splice(i,1);
                return;
            }
        }
    },
    addTalaCard: function(cardID,eaten)           // an 1 card binh thuong tu dock ( minh` dung`)
    {
        if(eaten)
        {
            return this.addTalaCardEaten(cardID);
        }
        else
        {
            if(this._index == 0)
            {
                this.safeSetDownCard();
                var talacard = new TalaCard(cardID);
                var height = this._cardPanel.getContentSize().height;
                talacard._startY = height/2;
                var tmpZ = this._handOnCards.length == 0?0:(this._handOnCards[this._handOnCards.length - 1].getLocalZOrder() + 1);
                this._handOnCards.push(talacard);
                this.addChild(talacard);
                talacard.setLocalZOrder(Math.max(tmpZ,this._handOnCards.length - 1));

                this.fixPositionHandOnCardForMy();
                return talacard;
            }
        }

    },
    getCardHandOn: function(cardID)
    {
        if (this._handOnCards.length == 0)
        {
            return null;
        }
        for (var i=0;i<this._handOnCards.length;i++)
        {
            if (this._handOnCards[i].id == cardID)
            {
                return this._handOnCards[i];
            }
        }
        return null;
    },
    removeCardFromHandOn: function(cardID)
    {
        if(this._index != 0)
        {

            for (var i=0;i<this._logicCards.cards.length;i++)
            {
                if (this._logicCards.cards[i].id == cardID)
                {
                    this._logicCards.cards.splice(i,1);
                    break;
                }
            }

        }
        for (var i=0;i<this._handOnCards.length;i++)
        {
            if (this._handOnCards[i].id == cardID)
            {
                var pos = this._handOnCards[i].convertToWorldSpaceAR(cc.p(.5,.5));
                this._handOnCards[i].removeFromParent();
                this._handOnCards.splice(i,1);
                this.fixPositionHandOnCardForMy();
                return pos;
            }
        }
        return false;
    },
    showPhomHandOn : function(group)
    {
        for (var i=0;i<this._handOnCards.length;i++)
        {
            this._handOnCards[i].forceDOWN();
        }
        for (var i=0;i<this._handOnCards.length;i++)
        {
            for (var j=0;j<group.cards.length;j++)
            {
                if(this._handOnCards[i].id == group.cards[j].id)
                {
                    this._handOnCards[i].setVisible(true);
                    this._handOnCards[i].len();
                    break;
                    }
            }
        }

    },
    setLogicCard: function(allcard,eatencard)   // enemy function
    {
        this._logicCards.clearGroup();
        for(var i=0;i<allcard.length;i++)
        {
            var card = new Card(allcard[i]);
            card.isEaten = eatencard[i];
            this._logicCards.putCardIn(card);
        }
    },
    displayLogicCard: function(dark)         // enemy function
    {
        if(this._index == 0)
            return;
        if(this._card)
            this._card.setVisible(false);
        var deltaX = 0,deltaY = 0;
        var node = new cc.Node();
        this._panel.addChild(node);node.setTag(116);
        switch (this._index)
        {
            case 1:
            case 3:
            {
                deltaX = 0;deltaY = 25 * cc.winSize.height/ 480;
                break;
            }
            case 2:
            {
                deltaX = 25 * cc.winSize.width/ 800;deltaY = 0;
                break;
            }
        }
        for(var i=0;i<this._logicCards.cards.length;i++)
        {
            var card = new TalaCard(this._logicCards.cards[i].id);
            card.setDark(dark === undefined?true:dark);
            card.setScale(.69);
            card.setPosition(-i * deltaX,-i * deltaY)

            this._handOnCards.push(card);
            node.addChild(card);
            if(this._index == 2)
            {
                card.setLocalZOrder(15 - i);
            }
        }
        if(this._index == 2)
            node.setPosition(this._panel.getChildByName("card").getPosition());
        else
        {
            var y = (this._logicCards.cards.length + 2) * deltaY / 2;
            node.setPosition(this._panel.getChildByName("card").getPosition().x,y);
        }
    },
    addLogicCard: function(cardID,eaten)   // enemy function
    {
        if((this._logicCards.findCard(cardID) < 0) && (this._logicCards.length > 0))
        {
            var card = new Card(cardID);
            card.isEaten = eaten;
            this._logicCards.putCardIn(card);
        }
    },
    removeLogicCard: function(cardID)   // enemy function
    {
        var idx = this._logicCards.findCard(cardID)
        if(idx >= 0)
        {
            this._logicCards.cards.splice(idx,1);
        }
    },
    haphom: function(cards,direct)
    {
        var allSoll = {};

        if(cards instanceof TalaSolution)
        {
            allSoll = cards;

        }
        else
        {
            cc.log("dech1    " + this._index +"    "  + cards.length);
            var phomCard = new TalaGroupCard([]);
            for(var i=0;i<cards.length;i++)
            {
                var id = cards[i];
                var card = new Card(id);
                for(var j=0;j<this._eatenCards.length;j++)
                {
                    if(this._eatenCards[j].id == id)
                    {
                        card.isEaten = true;
                        break;
                    }
                }
                phomCard.cards.push(card);
            }
            var allCard = TalaGameRule.copyCardGroup(phomCard);
            allSoll = TalaGameRule.kiemtraHaBai(allCard,phomCard);
        }
        cc.log("dech2    " + this._index +"    "  +allSoll.suit.length);
        if(allSoll.suit.length > 0)
        {
            for(var i=0;i<allSoll.suit.length;i++)
            {
                var suit = [];

                for(var j=0;j<allSoll.suit[i].cards.length;j++)
                {
                    suit.push(allSoll.suit[i].cards[j].id);
                }
                this.add_1_phom(suit,direct);
            }


            var particle = new cc.ParticleSystem("Particles/card.plist");
            particle.setLocalZOrder(10);
            this._gameScene._effect2D.addChild(particle);
            var pos = this._listPhom[Math.floor(this._listPhom.length / 2)][1].convertToWorldSpaceAR(cc.p(.5,.5));
            pos = this._gameScene._effect2D.convertToNodeSpace(pos);
            particle.setPosition(pos);
        }
    },
    add_1_phom: function(cards,direct)
    {
        var deltaX = 20;
        var deltaY = 40;

        deltaX = ((this._index == 3 || this._index == 2))?-deltaX:deltaX;
        deltaY = (this._index == 0) ?deltaY:-deltaY;


        var currentPhomCount = this._listPhom.length;
        var panelPhom = this._panel.getChildByName("panel_haphom");

        var suit = [];
        var posCard = [];               // vi tri card se them
        for(var i=0;i<cards.length;i++)
        {
            var talacard = new TalaCard(cards[i]);
            talacard.setScale(.69);
            var pos = cc.p(i * deltaX,this._panel.getChildByName("panel_haphom").getContentSize().height / 2 + currentPhomCount * deltaY);
            suit.push(talacard);
            panelPhom.addChild(talacard);
            talacard.setPosition(pos);
            posCard.push(this._gameScene._effect2D.convertToNodeSpace(talacard.convertToWorldSpaceAR(cc.p(.5,.5))));

            talacard.setLocalZOrder(this._index == 0 ? 31 - currentPhomCount * 10 + i:(this._index == 1 )?currentPhomCount * 10+i:((currentPhomCount + 1) * 10 -i));

            for(var j = 0;j<this._eatenCards.length;j++)
            {
                if(cards[i] == this._eatenCards[j].id)
                {
                    this.addEatenForCard(talacard);
                    break;
                }
            }
        }
        this._listPhom.push(suit);
        if(this._index != 0)
        {
            for(var j = 0;j<this._eatenCards.length;j++)
            {
                this._eatenCards[j].removeFromParent();
            }
            this._eatenCards = [];
        }


        if(direct)
        {
            for(var i=0;i<cards.length;i++)
            {
                this.removeCardFromHandOn(cards[i]);
            }
            return;
        }



        var posHandOn = [];             // vi tri card tren tay (chuan bi cho effect move)
        for(var i=0;i<cards.length;i++)
        {
            var eaten = false;
            var idx = -1;
            for(var j = 0;j<this._eatenCards.length;j++)
            {
                if(cards[i] == this._eatenCards[j].id)
                {
                    eaten = true;
                    idx = j;
                    break;
                }
            }

            if(this._index == 0)
            {
                for(var j=0;j<this._handOnCards.length;j++)
                {
                    if(cards[i] == this._handOnCards[j].id)
                    {
                        posHandOn.push(this._gameScene._effect2D.convertToNodeSpace(this._handOnCards[j].convertToWorldSpaceAR(cc.p(.5,.5))));
                        break;
                    }
                }
            }
            else
            {
                if(eaten)
                {
                    posHandOn.push(this._gameScene._effect2D.convertToNodeSpace(this._eatenCards[idx].convertToWorldSpaceAR(cc.p(.5,.5))));

                }
                else
                {
                    posHandOn.push(this._gameScene._effect2D.convertToNodeSpace(this._panel.getChildByName("card").convertToWorldSpaceAR(cc.p(.5,.5))));

                }
            }


        }
        for(var i=0;i<cards.length;i++)
        {
            var cardEff = new TalaCard(cards[i]);cardEff.setScale(this._index==0?1:.69)
            this._gameScene._effect2D.addChild(cardEff);
            if (cc.isUndefined(posHandOn[i]) || posHandOn[i] == null) {
                var s = "MyCard: " + JSON.stringify(this._handOnCards) + " HaPhomCard: " + JSON.stringify(cards);
               // NativeBridge.logJSManual("PlayerView.js", 10000, s, NativeBridge.getVersionString());
            }
            else {
                cardEff.setPosition(posHandOn[i]);
                GameLayer.effectCardMove(.25,cardEff,suit[i],.69,posCard[i]);
            }
        }
        for(var i=0;i<cards.length;i++)
        {
            this.removeCardFromHandOn(cards[i]);
        }
    },
    displayKQ :function(rank,time)
    {
        if(!inGameMgr.gameLogic._players[this._index]._ingame || inGameMgr.gameLogic._players[this._index]._status == 4)
        {
            return;
        }
        this.removeKQ();
        var rankNode = new cc.Node();
        rankNode.setLocalZOrder(6);
        rankNode.setTag(112);
        this._panel.addChild(rankNode);
        rankNode.setPosition(this._panel.getChildByName("btn").getPosition());


        var key = "";
        var index = "";
        var scale = .8;
        switch(rank)
        {
            case 0:  // nhat
            {
                key = "Ukhan";index = "4";
                scale = .65;
                break;
            }
            case 1:  // nhi
            {
                key = "Nhi";index = "1";

                break;
            }
            case 2:  // ba
            {
                key = "Nhi";index = "2";

                break;
            }
            case 3:  // bet
            {
                key = "Bet";index = "1";

                break;
            }
            case 4:  // u khan
            {
                key = "Ukhan";index = "1";
                scale = .65;
                break;
            }
            case 5:  // u tron
            {

                key = "Ukhan";index = "2";
                scale = .65;
                break;
            }
            case 6:  // u bt
            {

                key = "Ukhan";index = "3";

                break;
            }
            default :       // mom
            {
                key = "Bet";index = "3";

            }
        }

        var anim = db.DBCCFactory.getInstance().buildArmatureNode(key);
        if(!anim)
        {
            return;
        }
        anim.setScale(scale);
        rankNode.addChild(anim);
        anim.getAnimation().gotoAndPlay(index,-1,-1,1);
        rankNode.setLocalZOrder(10);
        rankNode.runAction(cc.sequence(cc.delayTime(time < 0?60:time),cc.removeSelf()));
    },
    dentien: function(){

        this.removeKQ();

        var rankNode = new cc.Node();
        rankNode.setLocalZOrder(6);
        rankNode.setTag(112);
        this._panel.addChild(rankNode);
        rankNode.setPosition(this._panel.getChildByName("btn").getPosition());


        var anim = db.DBCCFactory.getInstance().buildArmatureNode("Bet");
        if(!anim)
        {
            return;
        }
        rankNode.addChild(anim);
        anim.getAnimation().gotoAndPlay("3",-1,-1,1);

        var time = 5;

        rankNode.runAction(cc.sequence(cc.delayTime(time < 0?60:time),cc.removeSelf()));

    },
    myKQ :function(rank,time)
    {
        if(!inGameMgr.gameLogic._players[this._index]._ingame || inGameMgr.gameLogic._players[this._index]._status == 4)
        {
            return;
        }

        var rankNode = new cc.Node();
        rankNode.setLocalZOrder(6);
        rankNode.setTag(113);
        this._gameScene._effect2D.addChild(rankNode);
        rankNode.setPosition(this._gameScene._effect2D.size.width * 0.5,this._gameScene._effect2D.size.height * 0.5);

        var key = "";
        var index = "";
        var time = 4.75;
        switch(rank)
        {
            case 0:  // nhat
            {
                key = "Nhat_U";index = "42";
                gameSound.playThangNoi();
                gameSound.playThang();
                break;
            }
            case 1:  // nhi
            {
                key = "Nhi_ba";index = "1";
                gameSound.playThuaNoi();
                gameSound.playThua();

                break;
            }
            case 2:  // ba
            {
                key = "Nhi_ba";index = "3";
                gameSound.playThuaNoi();gameSound.playThua();
                break;
            }
            case 3:  // bet
            {
                key = "Bet_mom";index = "1";
                gameSound.playThuaNoi();gameSound.playThua();

                break;
            }
            case 4:  // u khan
            {
                key = "Nhat_U";index = "11";
                gameSound.playUNoi();                gameSound.playU();
                time = 1.5;
                break;
            }
            case 5:  // u tron
            {

                key = "Nhat_U";index = "31";
                gameSound.playUTronNoi();                gameSound.playU();
                break;
            }
            case 6:  // u bt
            {

                key = "Nhat_U";index = "21";
                gameSound.playUNoi();                gameSound.playU();
                break;
            }
            default :       // mom
            {
                key = "Bet_mom";index = "3";
                gameSound.playThuaNoi();                gameSound.playMom();
            }
        }

        var anim = db.DBCCFactory.getInstance().buildArmatureNode(key);
        if(!anim)
        {
            return;
        }
        rankNode.addChild(anim);
        anim.getAnimation().gotoAndPlay(index,-1,-1,1);

        rankNode.runAction(cc.sequence(cc.delayTime(time),cc.removeSelf()));

        return;
        var bg1= "",bg2 = "",rankImg = "";

        switch(rank)
        {
            case 0:  // nhat
            {
                bg1 = "res/Armatures/rank/nenThang.png"
                bg2 = "res/Armatures/rank/bgU.png"
                rankImg = "res/Armatures/rank/nhat.png"
                gameSound.playThangNoi();
                gameSound.playThang();

                break;
            }
            case 1:  // nhi
            {
                bg1 = "res/Armatures/rank/nenThua.png"
                bg2 = "res/Armatures/rank/bgNhi.png"
                rankImg = "res/Armatures/rank/nhi.png"
                gameSound.playThuaNoi();
                gameSound.playThua();
                break;
            }
            case 2:  // ba
            {
                bg1 = "res/Armatures/rank/nenThua.png"
                bg2 = "res/Armatures/rank/bgNhi.png"
                rankImg = "res/Armatures/rank/ba.png"
                gameSound.playThuaNoi();gameSound.playThua();

                break;
            }
            case 3:  // bet
            {
                bg1 = "res/Armatures/rank/nenThua.png"
                bg2 = "res/Armatures/rank/bgNhi.png"
                rankImg = "res/Armatures/rank/bet.png"
                gameSound.playThuaNoi();gameSound.playThua();

                break;
            }
            case 4:  // u khan
            {
                bg1 = "res/Armatures/rank/nenThang.png"
                bg2 = "res/Armatures/rank/bgU.png"
                rankImg = "res/Armatures/rank/uKhan.png"
                gameSound.playUNoi();                gameSound.playU();


                break;
            }
            case 5:  // u tron
            {
                bg1 = "res/Armatures/rank/nenThang.png"
                bg2 = "res/Armatures/rank/bgU.png"
                rankImg = "res/Armatures/rank/uTron.png"

                gameSound.playUTronNoi();                gameSound.playU();

                break;
            }
            case 6:  // u bt
            {
                bg1 = "res/Armatures/rank/nenThang.png"
                bg2 = "res/Armatures/rank/bgU.png"
                rankImg = "res/Armatures/rank/u.png"
                gameSound.playUNoi();                gameSound.playU();



                break;
            }
            default :       // mom
            {
                bg1 = "res/Armatures/rank/nenThua.png"
                bg2 = "res/Armatures/rank/bgNhi.png"
                rankImg = "res/Armatures/rank/mom.png"
                gameSound.playThuaNoi();                gameSound.playMom();


            }
        }

        return;
        var bg1Sprite = new cc.Sprite(bg1);bg1Sprite.setScale(.75);
        var bg2Sprite = new cc.Sprite(bg2);bg2Sprite.setScale(0);
        var rankImgSprite = new cc.Sprite(rankImg);rankImgSprite.setScale(0);

        var rankNode = new cc.Node();
        rankNode.setLocalZOrder(5);
        rankNode.setTag(114);
        rankNode.setPosition(cc.winSize.width/2,cc.winSize.height/2 + 55);

        this._gameScene._effect2D.addChild(rankNode);

        rankNode.addChild(bg1Sprite);
        rankNode.addChild(bg2Sprite);
        rankNode.addChild(rankImgSprite);

        bg1Sprite.runAction(new cc.RepeatForever(cc.rotateBy(2.5,-360)));
        bg2Sprite.runAction(new cc.EaseBounceOut(cc.scaleTo(.75,1)));
        rankImgSprite.runAction(new cc.EaseBounceOut(cc.scaleTo(.75,1)));

        if(time === undefined)
            time = 5.5;
        rankNode.runAction(cc.sequence(cc.delayTime(5.5),cc.removeSelf()));
    },
    removeKQ: function()
    {
        if(this._panel.getChildByTag(112))
            this._panel.getChildByTag(112).removeFromParent();
    },
    setDarkAllCard: function()
    {
        for(var i=0;i<this._throwCards.length;i++)
        {
            this._throwCards[i].setDark(true);
        }
    },
    setDarkHandOnCard: function()
    {
        for(var i=0;i<this._handOnCards.length;i++)
        {
            this._handOnCards[i].setDark(true);
        }
    },
    tailuot: function()
    {
        var rankNode = new cc.Node();
        rankNode.setLocalZOrder(10);
        rankNode.setTag(112);
        this._panel.addChild(rankNode);
        rankNode.setPosition(this._panel.getChildByName("btn").getPosition());
        var bg1= "",bg2 = "",rankImg = "";var scaleTo = 1;
        bg1 = "res/Armatures/rank/nenThang.png"
        bg2 = "res/Armatures/rank/bgU.png"
        rankImg = "res/Armatures/rank/tailuot.png";

        var bg1Sprite = new cc.Sprite(bg1);bg1Sprite.setScale(.55);
        var bg2Sprite = new cc.Sprite(bg2);bg2Sprite.setScale(0);
        var rankImgSprite = new cc.Sprite(rankImg);rankImgSprite.setScale(0);

        rankNode.addChild(bg1Sprite);
        rankNode.addChild(bg2Sprite);
        rankNode.addChild(rankImgSprite);

        bg1Sprite.runAction(new cc.RepeatForever(cc.rotateBy(2.5,-360)));
        bg2Sprite.runAction(new cc.EaseBounceOut(cc.scaleTo(.75,.425)));
        rankImgSprite.runAction(new cc.EaseBounceOut(cc.scaleTo(.75,scaleTo)));

        rankNode.runAction(cc.sequence(cc.delayTime(4),cc.removeSelf()));

    },
    selectPhom: function(point)
    {
        var idx = -1;
        if(this._index == 0)
        {
            for(var i=0;i<this._listPhom.length;i++)
            {
                for(var j=this._listPhom[i].length-1;j>=0;j--)
                {
                    if(this._listPhom[i][j].containTouchPoint(point))
                    {
                        return i;
                    }
                }
            }
        }
        else
        {
            for(var i=this._listPhom.length-1;i>=0;i--)
            {
                for(var j=this._listPhom[i].length-1;j>=0;j--)
                {
                    //cc.log("touchpoint  " + point.x +"  " + point.y);
                    if(this._listPhom[i][j].containTouchPoint(point))
                    {
                        return i;
                    }
                }
            }
        }
        return idx;
    },
    addCardToPhom: function(cardAdd,cardTarget)
    {
        for(var i=0;i<this._listPhom.length;i++)
        {
            var idx = -1;
            for(var j=0;j<this._listPhom[i].length;j++)
            {
                if(this._listPhom[i][j].id == cardTarget)
                {
                    idx = i;
                    break;
                }
            }

            if(idx > -1)
            {
                var suit = new TalaSuit();
                var maxID = 0;
                var minID = 1000;
                for(var j=0;j<this._listPhom[idx].length;j++)
                {
                    suit.cards.push(new Card(this._listPhom[idx][j].id));
                    if(this._listPhom[idx][j].id > maxID)
                        maxID = this._listPhom[idx][j].id;
                    if(this._listPhom[idx][j].id < minID)
                        minID = this._listPhom[idx][j].id;

                }
                suit.genSuitType();

                var deltaX = 20;
                var deltaY = 30;

                deltaX = ((this._index == 3 || this._index == 2))?-deltaX:deltaX;
                deltaY = (this._index == 0) ?deltaY:-deltaY;
                var talacard = new TalaCard(cardAdd);
                talacard.setScale(.69);
                var currentPhomCount = this._listPhom.length;
                var panelPhom = this._panel.getChildByName("panel_haphom");

                panelPhom.addChild(talacard);
                var last = this._listPhom[idx][this._listPhom[idx].length-1];
                if(suit.suitType == 0)      // bo cung so
                {
                    talacard.setPosition(last.getPositionX() + deltaX,last.getPositionY());
                    this._listPhom[idx].push(talacard);
                    talacard.setLocalZOrder(last.getLocalZOrder()+((this._index == 0 || this._index == 1 )?1:-1));

                }
                else
                {
                    if(cardAdd > maxID)
                    {
                        talacard.setLocalZOrder(last.getLocalZOrder()+((this._index == 0 || this._index == 1 )?1:-1));

                        talacard.setPosition(last.getPositionX() + deltaX,last.getPositionY());
                        this._listPhom[idx].push(talacard);
                    }
                    else if(cardAdd < minID)
                    {
                        talacard.setLocalZOrder(this._listPhom[idx][0].getLocalZOrder());
                        talacard.setPosition(this._listPhom[idx][0].getPosition());

                        cc.log("first " +talacard.getLocalZOrder() )

                        for(var k=0;k<this._listPhom[idx].length;k++)
                        {
                            this._listPhom[idx][k].setLocalZOrder(this._listPhom[idx][k].getLocalZOrder() +((this._index == 0 || this._index == 1)?1:-1));
                            this._listPhom[idx][k].setPositionX(this._listPhom[idx][k].getPositionX() + deltaX);
                        }
                        this._listPhom[idx].splice(0,0,talacard);

                    }
                }


                return talacard;
            }
        }
        return null;
    },
    reset: function()
    {
        this.safeSetDownCard();
        this.updateState("");
        this.daGuiBai = false;

        this._logicCards.clearGroup();
        for(var i=0;i<this._handOnCards.length;i++)
        {
            this._handOnCards[i].removeFromParent();
        }
        this._handOnCards = [];
        inGameMgr.gameLogic.logInitCard = "RESET CARD";
        if(this._index != 0)
        {
            for(var i=0;i<this._eatenCards.length;i++)
            {
                this._eatenCards[i].removeFromParent();
            }
        }
        this._eatenCards = [];

        for(var i=0;i<this._throwCards.length;i++)
        {
            this._throwCards[i].removeFromParent();
        }
        this._throwCards = [];

        for(var i=0;i<this._listPhom.length;i++)
        {
            var suit  = this._listPhom[i];
            for(var j=0;j<suit.length;j++)
            {
                suit[j].removeFromParent();
            }
        }
        this._listPhom = [];

        if(this._panel.getChildByTag(116))
        {
            this._panel.getChildByTag(116).removeFromParent();
        }
        if(this._panel.getChildByName("panel_eat"))this._panel.getChildByName("panel_eat").removeAllChildren(true);
        if(this._panel.getChildByName("panel_throw"))this._panel.getChildByName("panel_throw").removeAllChildren(true);
        if(this._panel.getChildByName("panel_haphom"))this._panel.getChildByName("panel_haphom").removeAllChildren(true);

    },

    getPosAvatar: function () {
     //   var posWorldSpace = this.convertToWorldSpace(this._layout);
        return this._panel.convertToWorldSpace(this._uiAvatar);
    },

    addLevelExp: function(update) {
        if (this._index != 0)
            return;
        var levelExpAdd = update.newLevelExp - update.oldLevelExp;
        if (levelExpAdd > 0){
            var nodeExp = new ccui.Text("+" + levelExpAdd + " exp", "fonts/tahomabd.ttf", 20);
            nodeExp.ignoreContentAdaptWithSize(true);
            nodeExp.setAnchorPoint(0.5, 0.5);
            nodeExp.setOpacity(200);
            nodeExp.setColor(cc.color(225, 225, 225));
            nodeExp.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            nodeExp.setLocalZOrder(20);
            nodeExp.setPosition(this._uiAvatar.convertToWorldSpace(cc.p(0, 30)));
            nodeExp.enableOutline(cc.color(1, 52, 89), 1);

            nodeExp.setVisible(false);
            nodeExp.runAction(cc.sequence(
                cc.delayTime(2.5),
                cc.show(),
                cc.spawn(
                    cc.moveBy(3,0, 40).easing(cc.easeSineOut()),
                    cc.sequence(
                        cc.delayTime(2.5),
                        cc.fadeOut(0.5)
                    )
                ),
                cc.removeSelf()
            ));
            this._gameScene._effect2D.addChild(nodeExp);

            if (update.newLevel > update.oldLevel){
                var nodeLevel = new ccui.Text("LÊN CẤP " + update.newLevel, "fonts/tahomabd.ttf", 20);
                nodeLevel.ignoreContentAdaptWithSize(true);
                nodeLevel.setAnchorPoint(0.5, 0.5);
                nodeLevel.setColor(cc.color(74, 199, 103));
                nodeLevel.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                nodeLevel.setLocalZOrder(25);
                nodeLevel.setPosition(this._uiAvatar.convertToWorldSpace(cc.p(0, -50)));
                nodeLevel.enableOutline(cc.color(0, 0, 0), 1);

                nodeLevel.setOpacity(0);
                nodeLevel.runAction(cc.sequence(
                    cc.delayTime(3),
                    cc.spawn(
                        cc.sequence(
                            cc.fadeIn(0.5),
                            cc.delayTime(1)
                        ),
                        cc.moveBy(2, 0, 150).easing(cc.easeQuadraticActionOut())
                    ),
                    cc.spawn(
                        cc.moveBy(1, 0, -20),
                        cc.fadeOut(1)
                    ),
                    cc.removeSelf()
                ));
                this._gameScene._effect2D.addChild(nodeLevel);

                this.schedule(function(){
                    var arrow = new cc.Sprite("Offer/levelUpArrow.png");
                    var avatar = this._panel.getChildByName("mask");
                    var width = avatar.width;
                    var height = avatar.height;

                    var x = -5 + Math.random()
                        * (width + 10);
                    var startY = -5 + Math.random() * (height/4 + 5);
                    var endY = height*3/4 + Math.random() * (height/4 + 5);
                    var lifeTime = 0.5 + Math.random() * 0.25;
                    var endPos = avatar.convertToWorldSpace(cc.p(x, endY));

                    arrow.setPosition(avatar.convertToWorldSpace(cc.p(x, startY)));
                    arrow.setOpacity(0);
                    this._gameScene._effect2D.addChild(arrow);
                    arrow.runAction(cc.sequence(
                        cc.spawn(
                            cc.sequence(
                                cc.fadeIn(lifeTime * 0.2),
                                cc.delayTime(lifeTime * 0.6),
                                cc.fadeOut(lifeTime * 0.2)
                            ),
                            cc.moveTo(lifeTime, endPos.x, endPos.y).easing(cc.easeSineInOut())
                        ),
                        cc.removeSelf()
                    ));
                }.bind(this), 0.1, 25, 3);
            }
        }
    },

    useEmoticon: function(id, emoId){
        this._panel.removeChildByName("emo");
        var emo = StorageManager.getEmoticonForPlay(id, emoId);
        var duration = emo.playAnimation(1, 2);
        emo.setPosition(this._uiAvatar.getPosition());
        var scale = StorageManager.getEmoticonScale(id) * 0.75;
        this._panel.addChild(emo, 99, "emo");
        emo.setOpacity(100);
        emo.setScale(scale * 0.5);
        emo.runAction(cc.sequence(
            cc.spawn(
                cc.fadeTo(0.2, 255),
                cc.scaleTo(0.2, scale).easing(cc.easeBackOut())
            ),
            cc.delayTime(duration - 0.4),
            cc.spawn(
                cc.fadeTo(0.2, 100),
                cc.scaleTo(0.2, scale * 0.5).easing(cc.easeBackIn())
            ),
            cc.removeSelf()
        ));
    },

    setAvatarFrame: function(path){
        if (path === undefined || path == "") {
            this.avatarFrame.setTexture(null);
            this.avatarFrame.setVisible(false);
        }
        else{
            this.avatarFrame.setTexture(path);
            this.avatarFrame.setVisible(true);
        }
    },

    getAvatarPosition: function(){
        return this._panel.convertToWorldSpace(this._uiAvatar.getPosition());
    },

    onExit: function(){
        this._super();
        this._panel.removeChildByName("emo");
    }
})

PlayerView.createNodeMoney = function(money)
{
    var node = new cc.Layer();
    var str = ""+Math.abs(money);
    var thang = (money >= 0);
    var width = 0;
    var height = 0;

    var ret = new cc.Sprite(PlayerView.getNumberPath(thang,-2));
    width += ret.getContentSize().width;
    var fix = 0;
    node.addChild(ret);
    for(var i=0;i<str.length;i++)
    {
        var xx = ret.getPositionX() + ret.getContentSize().width + fix;fix = 0;
        ret = new cc.Sprite(PlayerView.getNumberPath(thang,parseInt(str[i])));
        ret.setPositionX(xx);
        node.addChild(ret);
        width += ret.getContentSize().width;
        height = ret.getContentSize().height;


        if((i < str.length - 1) && ((str.length - 1 - i) % 3 == 0))
        {
            xx = ret.getPositionX() + ret.getContentSize().width;
            ret = new cc.Sprite(PlayerView.getNumberPath(thang,-1));
            ret.setPosition(xx - 7,-9);
            node.addChild(ret);
            fix = 4;
            width += ret.getContentSize().width;
        }
    }
    node.setContentSize(cc.size(width,height));
    node.setAnchorPoint(cc.p(.5,.5));

    return node;
}

PlayerView.getNumberPath = function(thang,number)
{
    var path = "common/";
    if(thang)
        path += "bosothang/";
    else
        path += "bosothua/";
    if(number == -1)
        path += "dot";
    else if(number == -2)
    {
        if(thang)
            path += "cong";
        else
            path += "tru";
    }
    else
    {
        path += ("so"+number);
    }
    path += ".png";
    return path;
}