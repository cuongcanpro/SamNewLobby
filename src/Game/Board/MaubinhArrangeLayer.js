/**
 * Created by cuongleah on 3/1/2016.
 */
var MaubinhArrangeLayer = BaseLayer.extend({

    ctor: function () {
        this._super("MaubinhArrangeLayer");
        this.initWithBinaryFile("ArrangeCard.json");
        // this.enableFog();
        this.labelChi = new Array(3);
        this.arrayCard = new Array(13);
        this.moveCard = new Array(13);
        this.isSort = false;
        this.canArrange = true;
        this.touchMoveCard = -1;
        this.saveTouchCard = -1;
        this.arrayId = new Array(13);

        //  this.setFog(true);
    },
    onEnter: function () {
        BaseLayer.prototype.onEnter.call(this);
        this.onUpdateGUI();
        this._listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        });
        cc.eventManager.addListener(this._listener, this);
        this.bgDark.cleanup();
        this.bgDark.setOpacity(0);
        this.bgDark.runAction(cc.fadeTo(1.0, 230));
        // GameClient.getInstance().setTargetNotifyNetworkSlow(this);
    },
    onExit: function () {

        BaseLayer.prototype.onExit.call(this);
        //GameClient.getInstance().setTargetNotifyNetworkSlow(null);
    },

    customizeGUI: function () {
        this.groupCard = this.getControl("groupCard");
        this.bgDark = this.getControl("bgDark");
        this.customButton("btnComplete",MaubinhArrangeLayer.BTN_COMPLETE);
        this.btnSwap = this.customButton("btnSwap",MaubinhArrangeLayer.BTN_SWAP);
        this.bgClock = this.getControl("bgClock");
        this.labelClock = this.getControl("labelClock");
        this.iconTrue = [];
        this.bgTypeChi = [];
        this.typeChi = [];
        this.iconFalse = [];

        for(var i = 0; i < 3; i++) {
            this.iconTrue[i] = this.getControl("iconTrue" + i);
            this.iconFalse[i] = this.getControl("iconFalse" + i);
            this.bgTypeChi[i] = this.getControl("bgTypeChi" + i);
            this.typeChi[i] = cc.Sprite.create("poker/typechi_0.png");
            this.bgTypeChi[i].addChild(this.typeChi[i]);
        }

        this.effectImage = cc.Sprite.create("poker/tuQuy.png");
        this.addChild(this.effectImage);
        this.btnComplete = this.getControl("btnComplete");

        var j = db.DBCCFactory.getInstance().buildArmatureNode("Bt_xepxong");
        j.setPosition(cc.p(this.btnComplete.getContentSize().width * 0.5, this.btnComplete.getContentSize().height * 0.5));
        j.getAnimation().gotoAndPlay("1", -1, -1, 0);
        //j.getCCSlot("Layer 5").getCCChildArmature().getAnimation().gotoAndPlay("2");
        j.setScale(0.87);
        this.btnComplete.addChild(j);

        this.initGroupCard();
        this.btnSwap.setPosition(this.iconTrue[0].getPositionX(), this.arrayCard[0].getPositionY() + this.arrayCard[0].getHeight() * 0.55);
        this.initClock();
        //this.startTime(gamedata.gameLogic.gameTime);
        this.highLightCard(true);
    },

    initGroupCard: function () {
        var card1 = ccui.Helper.seekWidgetByName(this._layout, "groupCard");
        var height = card1.getContentSize().height * card1.getScale();
        var width = card1.getContentSize().width * card1.getScale() * 0.96;
        var startX = card1.getPositionX() - width * 0.503;
        var startY = card1.getPositionY();
        var i;

        var scale = 0;
        for(var i = 0; i < 13; i++) {
            //this.arrayCard[i] = new MaubinhCard(Math.floor(Math.random() * 52));
            this.arrayCard[i] = new MaubinhCard(gamedata.gameLogic.players[0].cards[i]);
            var scale = width / 5.05 / this.arrayCard[i].getContentSize().width;
            this.arrayCard[i].setRootScale(scale);
        }
        var padY = this.arrayCard[0].getHeight() * 1.12;
        var padX = this.arrayCard[0].getWidth() * 1.01;

        for(i = 10; i < 13; i++) {
            this.arrayCard[i].setPosition((i-10) * padX + this.arrayCard[0].getWidth() * 0.5 + startX, this.arrayCard[0].getHeight() * 0.5 + padY * 2 + startY);
        }
        for(i = 5; i < 10; i++) {
            this.arrayCard[i].setPosition((i-5) * padX + this.arrayCard[0].getWidth() * 0.5 + startX, this.arrayCard[0].getHeight() * 0.5 + padY + startY);
        }
        for(i = 0; i < 5; i++) {
            this.arrayCard[i].setPosition(i * padX + this.arrayCard[0].getWidth() * 0.5 + startX, this.arrayCard[0].getHeight() * 0.5 + startY);
        }
        for(var i = 0; i < 13; i++) {
            this._layout.addChild(this.arrayCard[i]);
            this.arrayCard[i].saveInfoCard();
        }

        for(var i = 0; i < 3; i++) {
            this.bgTypeChi[i].setLocalZOrder(1);
            this.bgTypeChi[i].setPosition(this.arrayCard[i * 5].getPositionX() - this.arrayCard[i * 5].getWidth() * 0.5 + this.bgTypeChi[i].getContentSize().width * 0.5 * this.bgTypeChi[i].scaleX,
                this.arrayCard[i * 5].getPositionY() - this.arrayCard[i * 5].getHeight() * 0.5 + this.bgTypeChi[i].getContentSize().height * 0.5 * this.bgTypeChi[i].scaleY);
        }

        this.arrayClipper = [];
        for(var i = 0; i < 3; i++) {
            var border = this.getControl("border" + i, card1);
            var clipper = this.getControl("clipper" + i);
            clipper.setLocalZOrder(3)
            this.arrayClipper.push(clipper);
            clipper.setContentSize(border.getContentSize().width * card1.getScale(), border.getContentSize().height * card1.getScale());
            var pos = card1.convertToWorldSpace(border.getPosition());
            clipper.setPosition(pos);
            this.iconTrue[i].setPosition(this.arrayCard[i * 5].getPositionX() - this.iconTrue[i].getContentSize().width * 1.5 - this.arrayCard[i * 5].getWidth() * 0.5, this.arrayCard[i* 5].getPositionY());
            this.iconFalse[i].setPosition(this.iconTrue[i].getPositionX(), this.iconTrue[i].getPositionY());
        }
    },

    initClock: function () {
        this.labelClock.setString(gamedata.gameLogic.gameTime);
        this.callbackAuto = function(){
            gamedata.gameLogic.gameTime--;
            this.labelClock.setString(gamedata.gameLogic.gameTime);
            if(gamedata.gameLogic.gameTime < 0)
            {
                this.bgClock.setVisible(false);
                this.labelClock.setVisible(false);
                this.labelClock.cleanup();
                return;
            }
            if(gamedata.gameLogic.gameTime < 10)
            {
                this.labelClock.cleanup();
                this.labelClock.setScale(1);
                this.labelClock.runAction(cc.sequence(new cc.EaseBounceOut(cc.scaleTo(0.3, 1.4)), cc.delayTime(0.4),new cc.EaseBounceIn(cc.scaleTo(0.3, 0.5)), cc.callFunc(this.callbackAuto.bind(this),this,null)));
            }
        }
        this.labelClock.setScale(1);
        this.labelClock.runAction(new cc.RepeatForever(cc.sequence(cc.delayTime(1),cc.callFunc(this.callbackAuto.bind(this),this,null))));
    },

    onTouchBegan: function(touch, event) {
        if (!cc.sys.isNative && touch.getID() === undefined){
            touch._id = 0;
        }
        if (touch.getID() != 0)
        {
            return true;
        }
        if (this.isSort == true || this.canArrange == false)
            return true;

        var target = event.getCurrentTarget();
        var point = touch.getLocation();
        var location = target.getLocation(point, true, -1);
        if(location >= 0)
        {
            if (target.arrayCard[location].id != 52)
            {
                target.arrayCard[location].setDark(true);
            }
            target.touchCard = location;
            return true;
        }
        return true;
    },

    onTouchMoved: function(touch, event) {
        if (touch.getID() != 0)
            return;
        var target = event.getCurrentTarget();
        if (Math.sqrt(touch.getDelta().x * touch.getDelta().x + touch.getDelta().y * touch.getDelta().y) < target.arrayCard[0].getWidth() * 0.017)
            return;
        if (target.isSort || target.canArrange == false)
            return;
        if(target.touchCard >= 0) {
            target.touchMoveCard = target.touchCard;
            target.touchCard = -1;
        }

        if(target.touchMoveCard >= 0) {
            target.arrayCard[target.touchMoveCard].setLocalZOrder(1);
            target.arrayCard[target.touchMoveCard].setPosition(touch.getLocation().x, touch.getLocation().y);
            for (var i = 0; i < 13; i++) {
                target.arrayCard[i].setDark(false);
            }
            var location = target.getLocation(touch.getLocation(), true, target.touchMoveCard);
            if (location >= 0) {
                target.arrayCard[location].setDark(true);
            }
        }
        target.saveTouchCard = -1;
    },

    onTouchEnded: function(touch, event) {
        var target = event.getCurrentTarget();

        if (touch.getID() != 0) {
            target.isSort = false;
            return;
        }

        if (target.isSort || target.canArrange == false)
            return;

        var setDark = -1; // luu lai vi tri quan bai vua click de setdark
        if (target.touchCard >= 0) {
            target.defineChiGoal(target.touchCard);

            if (target.saveTouchCard < 0) {
                target.saveTouchCard = target.touchCard;
                setDark = target.saveTouchCard;
            }
            else if (target.saveTouchCard != target.touchCard) {
                // trao doi quan bai trong truong hop click vao quan card
                target.swapCard(target.arrayCard[target.saveTouchCard], target.arrayCard[target.touchCard]);
                target.saveTouchCard = -1;
            }
            else {
                // bo trang thai chon quan bai khi click vao cung mot vi tri
                target.arrayCard[target.saveTouchCard].setDark(false);
                target.saveTouchCard = -1;
                target.touchCard = -1;
            }

            target.highLightCard(true);
            if (setDark >= 0) {
                target.arrayCard[setDark].setColor(cc.color(242, 245, 181));
            }
        }
        else if (target.touchMoveCard >= 0) {
            var location = target.getLocation(touch.getLocation(), true, target.touchMoveCard);
            if (location != -1) {
                target.defineChiGoal(location);
                // trao doi 2 quan bai trong truong hop movecard
                // trong binh truyen thong thi chi co truong hop tha ra vao vi tri cac quan bai da co san
                target.swapCard(target.arrayCard[target.touchMoveCard], target.arrayCard[location]);
                target.saveTouchCard = -1;
            }
            else {
                // back quan bai lai vi tri ma no duoc nhac ra ban dau
                cc.log("MOVE TO DEFAULT " + target.touchMoveCard);
                target.arrayCard[target.touchMoveCard].setLocalZOrder(0);
                target.arrayCard[target.touchMoveCard].moveToDefault(0.2);
            }
            target.highLightCard(true);
        }
        target.touchCard = -1;
        target.touchMoveCard = -1;
    },

    swapCard: function (card1, card2) {
        card1.setLocalZOrder(0);
        card2.setLocalZOrder(0);
        var saveId = card1.id;
        var savePos = card1.getPosition();
        card1.setIdCard(card2.id);
        card1.setPosition(card2.getPosition());
        card2.setIdCard(saveId);
        card2.setPosition(savePos);
        card1.moveToDefault(0.2);
        card2.moveToDefault(0.2);
    },

    defineChiGoal: function (chi) {
        if (chi < 5)
            this.chiGoal = 1;
        else if (chi < 10)
            this.chiGoal = 2;
        else
            this.chiGoal = 3;
    },

    onButtonRelease: function(button,id) {
        switch (id) {
            case MaubinhArrangeLayer.BTN_COMPLETE:
            {
                if(gamedata.gameLogic.state == GameStateMaubinh.GAME_PLAYING) {
                    var pkConfirm = new CmdSendConfirmInTable();
                    pkConfirm.putData();
                    GameClient.getInstance().sendPacket(pkConfirm);
                    pkConfirm.clean();
                    cc.log("HOAN THANH GUI CONFIRM ");
                    gameSound.playSoundfinishgroupcard();
                    this.sendCompare(1);
                }
                else {
                    this.removeFromParent();
                    sceneMgr.getRunningScene().getMainLayer().updateIdCard();
                }
            }
                break;
            case MaubinhArrangeLayer.BTN_SWAP:
                for(var i = 0; i < 5; i++) {
                    this.swapCard(this.arrayCard[i], this.arrayCard[i + 5]);
                }
                this.highLightCard(false);
                break;
        }
    },

    sendCompare: function(typeSend) {
        this.getIdCard();
        // this.removeFromParent(true);

        cc.log("HOAN THANH GUI READY ");
        var pkReady = new CmdSendReady();
        pkReady.putData(13, this.arrayId, typeSend);
        GameClient.getInstance().sendPacket(pkReady);
        pkReady.clean();

        cc.log("LAY DU LIEU ");
        for(var i = 0; i < 13; i++)
            gamedata.gameLogic.players[0].cards[i] = this.arrayId[i];
        this.removeFromParent();
        sceneMgr.getRunningScene().getMainLayer().updateIdCard();
    },

    getIdCard: function() {
        var i;
        for(i = 0; i<13; i++)
        {
            this.arrayId[i] = this.arrayCard[12-i].id;

        }
        return this.arrayId;
    },

    getLocation: function( touch, needVisible, exceptPos) {
        var i, j, num, stt;
        for(i = 0; i <= 2; i++) {
            if(i == 2)
                num = 3;
            else
                num = 5;
            for(j = num - 1; j >= 0; j-- ) {
                stt = i * 5 + j;
                if (stt != exceptPos % 13) {
                    if (needVisible) {
                        if (this.arrayCard[stt].isVisible() && this.arrayCard[stt].id != 52) {
                            if (this.arrayCard[stt].getPositionX() - this.arrayCard[stt].getWidth() / 2 < touch.x && this.arrayCard[stt].getPositionX() + this.arrayCard[stt].getWidth() / 2 > touch.x
                                && this.arrayCard[stt].getPositionY() - this.arrayCard[stt].getHeight() / 2 < touch.y && this.arrayCard[stt].getPositionY() + this.arrayCard[stt].getHeight() / 2 > touch.y)
                                return stt;
                        }
                    }
                    else {
                        if (this.arrayCard[stt].getPositionX() - this.arrayCard[stt].getWidth() / 2 < touch.x && this.arrayCard[stt].getPositionX() + this.arrayCard[stt].getWidth() / 2 > touch.x
                            && this.arrayCard[stt].getPositionY() - this.arrayCard[stt].getHeight() / 2 < touch.y && this.arrayCard[stt].getPositionY() + this.arrayCard[stt].getHeight() / 2 > touch.y)
                            return stt;
                    }
                }
            }
        }
        return -1;
    },

    showLabelChi: function(show){

    },

    showTypeChi: function(chi, type, binh){
        this.typeChi[chi].removeFromParent(true);
        if(binh)
        {
            this.typeChi[chi] = cc.Sprite.create("poker/binh_" + type + ".png");
        }
        else
        {
            this.typeChi[chi] = cc.Sprite.create("poker/typechi_" + type + ".png");
        }
        this.bgTypeChi[chi].addChild(this.typeChi[chi]);
        this.typeChi[chi].setPosition(this.typeChi[chi].getContentSize().width * 0.5 + 6, this.typeChi[chi].getContentSize().height * 0.5 + 4);
    },

    highLightCard: function(sound){
        var playerCard = new MaubinhPlayerCard();
        //  vector<MaubinhGroupCardLogic*> groupCard;
        var i, j, num;
        this.effectImage.setVisible(false);
        for(i = 12; i >= 0; i--)
        {
            var group = new MaubinhGroupCardLogic();
            group.AddCardByID(this.arrayCard[i].id);
            playerCard.AddGroupCard(group);
        }

        playerCard.SapXepTruocSoBai();
        var cardKind = playerCard.GetPlayerCardsKind(false);
        if (cardKind == MaubinhPlayerCard.EM_NORMAL) {
            this.showLabelChi(true);
        }
        else {
            this.showLabelChi(false);
        }

        var mauBinh = false;
        this.checkBoBai(mauBinh, cardKind, playerCard);
        this.playSoundChi(mauBinh, sound, playerCard);
        this.checkTypeChi(playerCard);
        this.showDarkCard(mauBinh, cardKind, playerCard);
    },

    // hien thi loai bo bai xem co mau binh hay khong
    checkBoBai: function (mauBinh, cardKind, playerCard) {
        for(var i = 0; i < 3 ;i ++)
        {
            this.iconTrue[i].setVisible(true);
            this.iconFalse[i].setVisible(false);
        }
        switch (cardKind) {
            case MaubinhPlayerCard.EM_BINHLUNG:
                //  this.effectBoBai("poker/binhLungBig.png");
                mauBinh = false;
                //gameSound.playSoundBinhlung();
                var wrongChi = playerCard.getWrongChi2(false);
                if(wrongChi)
                {
                    this.iconTrue[2].setVisible(false);
                    this.iconFalse[2].setVisible(true);
                }
                wrongChi = playerCard.getWrongChi1(false);
                if(wrongChi)
                {
                    this.iconTrue[1].setVisible(false);
                    this.iconFalse[1].setVisible(true);
                }
                break;
            case MaubinhPlayerCard.EM_LUCPHEBON:
                this.effectBoBai("poker/lucPheBon.png");
                mauBinh = true;
                gameSound.playSoundmaubinh_lucphebon();
                gameSound.playSoundThang();
                break;
            case MaubinhPlayerCard.EM_3SANH:
                this.effectBoBai("poker/baCaiSanh.png");
                mauBinh = true;
                gameSound.playSoundmaubinh_3caisanh();
                gameSound.playSoundThang();
                break;
            case MaubinhPlayerCard.EM_3THUNG:
                this.effectBoBai("poker/baCaiThung.png");
                mauBinh = true;
                gameSound.playSoundmaubinh_3caithung();
                gameSound.playSoundThang();
                break;
            case MaubinhPlayerCard.EM_SANHRONG:
                this.effectBoBai("poker/sanhRong.png");
                // mauBinh = true;
                gameSound.playSoundmaubinh_sanhrong();
                gameSound.playSoundThang();
                break;
            default:
                mauBinh = false;
                break;
        }
    },

    // thong bao loai cua tung chi khi di chuyen quan Card
    playSoundChi: function (mauBinh, sound, playerCard) {
        if (!mauBinh  && sound)
        {
            var typeGroup = -1;
            switch (this.chiGoal)
            {
                case 1:
                    typeGroup = playerCard.ChiCuoi.GetGroupKind();
                    break;
                case 2:
                    typeGroup = playerCard.ChiGiua.GetGroupKind();
                    break;
                case 3:
                    typeGroup = playerCard.ChiDau.GetGroupKind();
                    break;
                default:
                    break;
            }

            switch (typeGroup)
            {
                case MaubinhGroupCardLogic.EG_MAUTHAU:
                    gameSound.playSoundxepbai_mauthau();
                    break;
                case MaubinhGroupCardLogic.EG_DOI:
                    gameSound.playSoundxepbai_doi();
                    break;
                case MaubinhGroupCardLogic.EG_THU:
                    gameSound.playSoundxepbai_thu();
                    break;
                case MaubinhGroupCardLogic.EG_SAMCO:
                    gameSound.playSoundxepbai_samchi();
                    if(this.chiGoal == 3)
                    {
                        this.effectChi(this.chiGoal - 1);
                    }
                    break;
                case MaubinhGroupCardLogic.EG_SANH:
                    gameSound.playSoundxepbai_sanh();
                    this.effectChi(this.chiGoal - 1);
                    break;
                case MaubinhGroupCardLogic.EG_THUNG:
                    gameSound.playSoundxepbai_thung();
                    this.effectChi(this.chiGoal - 1);
                    break;
                case MaubinhGroupCardLogic.EG_TUQUI:
                    gameSound.playSoundxepbai_tuquy();
                    this.effectChi(this.chiGoal - 1);
                    break;
                case MaubinhGroupCardLogic.EG_THUNGPHASANH:
                    gameSound.playSoundxepbai_thungphasanh();
                    this.effectChi(this.chiGoal - 1);
                    break;
                case MaubinhGroupCardLogic.EG_CULU:
                    gameSound.playSoundxepbai_culu();
                    this.effectChi(this.chiGoal - 1);
                    break;
                default:
                    break;
            }
        }
    },

    // hien thi loai cua tung loai bai cua tung chi 1
    checkTypeChi: function (playerCard) {
        switch (playerCard.ChiGiua.GetGroupKind()) {
            case MaubinhGroupCardLogic.EG_THUNGPHASANH:
                this.showTypeChi(1, 6, true);
                break;
            case MaubinhGroupCardLogic.EG_TUQUI:
                this.showTypeChi(1, 7, true);
                break;
            case MaubinhGroupCardLogic.EG_CULU:
                this.showTypeChi(1, 9, true);
                break;
            default :
                this.showTypeChi(1, playerCard.ChiGiua.GetGroupKind(), false);
                break;
        }

        switch (playerCard.ChiCuoi.GetGroupKind()) {
            case MaubinhGroupCardLogic.EG_THUNGPHASANH:
                this.showTypeChi(0, 11, true);
                break;
            case MaubinhGroupCardLogic.EG_TUQUI:
                this.showTypeChi(0, 10, true);
                break;
            default :
                this.showTypeChi(0, playerCard.ChiCuoi.GetGroupKind(), false);
                break;
        }

        switch (playerCard.ChiDau.GetGroupKind()) {
            case MaubinhGroupCardLogic.EG_SAMCO:
                this.showTypeChi(2, 8, true);
                break;
            default :
                this.showTypeChi(2, playerCard.ChiDau.GetGroupKind(), false);
                break;
        }
    },

    // lam toi nhung quan bai tao thanh bo trong chi
    showDarkCard: function (mauBinh, cardKind, playerCard) {
        var i, j;
        for (i = 0; i < 13; i++)
            this.arrayCard[i].setDark(true);
        if (cardKind == MaubinhPlayerCard.EM_BINHLUNG) {
            for (i = 0; i < 13; i++)
                this.arrayCard[i].setDark(false);
            return;
        }
        if (cardKind == MaubinhPlayerCard.EM_SANHRONG || cardKind == MaubinhPlayerCard.EM_3SANH || cardKind == MaubinhPlayerCard.EM_3THUNG || cardKind == MaubinhPlayerCard.EM_LUCPHEBON || cardKind == MaubinhPlayerCard.EM_MUOI_HAI || cardKind == MaubinhPlayerCard.EM_MUOI_BA) {
            for (i = 0; i < 13; i++)
                this.arrayCard[i].setDark(true);
            return;
        }

        var gc = null;
        if (!mauBinh) {
            if (playerCard.ChiDau.GetGroupKind() != MaubinhGroupCardLogic.EG_SAMCO) {
                switch (playerCard.ChiDau.GetGroupKind()) {
                    case MaubinhGroupCardLogic.EG_MAUTHAU:
                        gc = playerCard.ChiDau.getMaxCard();
                        break;
                    case MaubinhGroupCardLogic.EG_THU:
                        gc = playerCard.ChiDau.get2DoiKhacNhau();
                        break;
                    case MaubinhGroupCardLogic.EG_DOI:
                        gc = playerCard.ChiDau.getPair();
                        break;
                }
                if (gc) {
                    for (i = 0; i < 3; i++) {
                        var stt = 10 + i;
                        for (j = 0; j < gc.Cards.length; j++) {
                            if (gc.Cards[j].ID == this.arrayCard[stt].id) {
                                break;
                            }
                        }
                        if (j == gc.Cards.length) {
                            this.arrayCard[stt].setDark(false);
                        }
                    }
                }
            }
            this.showDarkCardBigChi(1, playerCard); // chi giua
            this.showDarkCardBigChi(0, playerCard); // chi cuoi
        }
    },
    
    showDarkCardBigChi: function (chi, playerCard) {
        var gc = null;
        var groupChi;
        if (chi == 1)
            groupChi = playerCard.ChiGiua;
        else
            groupChi = playerCard.ChiCuoi;
        if (groupChi.GetGroupKind() != MaubinhGroupCardLogic.EG_THUNGPHASANH && groupChi.GetGroupKind() != MaubinhGroupCardLogic.EG_THUNG && groupChi.GetGroupKind() != MaubinhGroupCardLogic.EG_SANH && groupChi.GetGroupKind() != MaubinhGroupCardLogic.EG_CULU) {
            switch (groupChi.GetGroupKind()) {
                case MaubinhGroupCardLogic.EG_MAUTHAU:
                    gc = groupChi.getMaxCard();
                    break;
                case MaubinhGroupCardLogic.EG_THU:
                    gc = groupChi.get2DoiKhacNhau();
                    break;
                case MaubinhGroupCardLogic.EG_DOI:
                    gc = groupChi.getPair();
                    break;
                case MaubinhGroupCardLogic.EG_SAMCO:
                    gc = groupChi.getXamChi();
                    break;
                case MaubinhGroupCardLogic.EG_TUQUI:
                    gc = groupChi.getFour();
                    break;
            }
            if (gc) {
                for (var i = 0; i < 5; i++) {
                    var stt = 5 * chi + i;
                    for (var j = 0; j < gc.Cards.length; j++) {
                        if (gc.Cards[j].ID == this.arrayCard[stt].id) {
                            break;
                        }
                    }
                    if (j == gc.Cards.length) {
                        this.arrayCard[stt].setDark(false);
                    }
                }
            }
        }
    },

    effectChi: function(chi){
        var j = db.DBCCFactory.getInstance().buildArmatureNode("FX_xepbaimaubinh");
        j.getAnimation().gotoAndPlay("1", -1, -1, 1);
        j.setPosition(100, this.arrayCard[12].getHeight() * 0.5);
        j.setCompleteListener(this.onCompleteEffect.bind(this));
        this.arrayClipper[chi].addChild(j);
    },

    onCompleteEffect: function(animation){
        animation.removeFromParent();
    },

    effectBoBai: function(resource) {
        this.effectImage.removeFromParent(true);
        this.effectImage = cc.Sprite.create(resource);
        this.effectImage.setScale(this.groupCard.getScale());
        this.addChild(this.effectImage);
        this.effectImage.setVisible(true);
        this.effectImage.setPosition(this.arrayCard[2].getPositionX(), this.arrayCard[2].getPositionY() - this.arrayCard[2].getHeight() * 0.5 + this.effectImage.getContentSize().height * 0.5);
        this.effectImage.setScale(0, 1);
        this.effectImage.runAction(cc.scaleTo(0.2, this.groupCard.getScale(), this.groupCard.getScale()));
        this.effectImage.setLocalZOrder(5);
    }
})

MaubinhArrangeLayer.className = "MaubinhArrangeLayer";
MaubinhArrangeLayer.BTN_COMPLETE = 1;
MaubinhArrangeLayer.BTN_SWAP = 2;