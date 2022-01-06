/**
 * Created by cuongleah on 2/29/2016.
 */
var MaubinhPlayer = cc.Node.extend({

    ctor: function (gameScene) {
        this._super();
        //reference
        this.panel = null;

        this.index = 0;                   // index cua Player trong array cac Player (0  = myPlayer )
        this.moveCard = null;            // Card di chuyen effect

        this.listener = null;
        this.touchEnable = false;
        this.touched = false;
        this.vip = null;

        // infomation of player
        this.uiAvatar = null;               // avatar for player
        this.uID = "";
        this.uiName = null;                  // name for player
        this.uiGold = null;                  // gold
        this._uiTimer = null;                 // timer progress
        this.uiHome = null;
        this.type = 1;                       // 1. enemy

        this.arrayCard1 = new Array(13);
        this.arrayCard2 = new Array(13);
        this.arrayChi = null;
        this.arranged = null;
        this.arranging = null;
        this.countGen = 0;
        this.countGenDot = 0;
        this.arrangeDot = [];
        this.gameScene = gameScene;
        this.enableTouch = true;

        this.listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        });

    },

    setPanel: function(panel, index){
        this.panel = panel;
        this.index = index;
        var vip = ccui.Helper.seekWidgetByName(panel, "vip");
        vip.setVisible(false);
        this.vip = ccui.Scale9Sprite.create(NewVipManager.getIconVip(1));
        vip.getParent().addChild(this.vip);
        this.vip.setPosition(vip.getPosition());

        this.uiAvatar = new AvatarUI("Common/defaultAvatar.png", "Common/maskAvatar.png", "");
        this.bgAvatar = ccui.Helper.seekWidgetByName(panel,"bgAvatar");
        this.bgAvatar.getParent().addChild(this.uiAvatar);
        this.uiAvatar.setLocalZOrder(-1);
        // this.uiAvatar.setPosition(this.bgAvatar.getContentSize().width * 0.5, this.bgAvatar.getContentSize().height * 0.5);
        this.uiAvatar.setPosition(this.bgAvatar.getPosition());
        this.uiName = ccui.Helper.seekWidgetByName(panel,"name");
        this.uiGold = ccui.Helper.seekWidgetByName(panel,"gold");
        this.uiHome = ccui.Helper.seekWidgetByName(panel,"iconHost");
        this.background = ccui.Helper.seekWidgetByName(panel,"bg");
        this.imageSap = ccui.Helper.seekWidgetByName(panel,"imageSap");
        this.labelViewing = ccui.Helper.seekWidgetByName(panel,"labelViewing");
        this.panelItem = ccui.Helper.seekWidgetByName(panel,"panelItem");
        this.imageSap.setLocalZOrder(5);

        this.avatarFrame = new cc.Sprite();
        this.avatarFrame.setPosition(this.bgAvatar.getContentSize().width/2, this.bgAvatar.getContentSize().height/2);
        this.avatarFrame.setLocalZOrder(0);
        this.avatarFrame.setScale(0.54);
        this.bgAvatar.addChild(this.avatarFrame);

        this.arranged = ccui.Helper.seekWidgetByName(panel,"arranged");
        this.arranged.setLocalZOrder(2);
        this.initCard("card1", this.arrayCard1, 1);
        this.initCard("card2", this.arrayCard2, 2);
        for(var i = 0; i < 13; i++)
        {
            this.arrayCard2[i].setTag(i);
        }

        if(index != MaubinhPlayer.MY_INDEX)
        {
            this.card1 = cc.Sprite.create("poker/labai_52.png");
            this.card2 = cc.Sprite.create("poker/labai_52.png");
            this.card1.setScale(0.45);
            this.card2.setScale(0.45);
            this.panel.addChild(this.card1, 2);
            this.panel.addChild(this.card2, 2);
            this.card1.setVisible(false);
            this.card2.setVisible(false);
        }

        var i;
        if(index == MaubinhPlayer.MY_INDEX)
        {
            this.arrayChi = new Array(3);
            for(i = 0; i < 3; i++)
                this.arrayChi[i] = ccui.Helper.seekWidgetByName(panel, "chi" + (i + 1));

        }
        else
        {
            this.arranging = ccui.Helper.seekWidgetByName(panel,"arranging");

            this.arranging.setLocalZOrder(5);
            for(i = 0; i < 3; i++)
            {
                this.arrangeDot[i] = cc.Sprite.create("poker/dotWaitArrange.png");
                this.panel.addChild(this.arrangeDot[i], 5);
                this.arrangeDot[i].setPosition(this.arranging.getPositionX() + this.arranging.getContentSize().width * 0.5 + 10 + 7 * i, this.arranging.getPositionY() - 8);
                this.arrangeDot[i].setVisible(false);
            }
        }

        this.imageResult = cc.Sprite.create("poker/win.png");
        this.chiImage = cc.Sprite.create("poker/win.png");
        this.panel.addChild(this.imageResult);
        this.panel.addChild(this.chiImage);
        this.imageResult.setLocalZOrder(5);
        this.chiImage.setLocalZOrder(5);

        this.moneyGroup = MaubinhPlayer.createNodeMoney1(0, 1);
        this.panel.addChild(this.moneyGroup);
        if (cc.sys.isNative) {
            this.labelExp = cc.LabelTTF("+10EXP", "Arial", 20);
            this.labelExp.setColor(cc.color(8, 175, 247, 255));
            this.panel.addChild(this.labelExp, 100, 103);
        }
        else {
            this.labelExp = new ccui.Text()
            this.labelExp.setAnchorPoint(cc.p(0.5, 0.5));
            this.labelExp.setFontName(SceneMgr.FONT_NORMAL);
            this.labelExp.setFontSize(17);
            this.labelExp.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
            this.labelExp.setColor(cc.color(8, 175, 247, 255));
        }
        this.panelEffect = new cc.Node();
        this.panel.addChild(this.panelEffect);
        this.panelEffect.setPosition(this.bgAvatar.getPosition());
    },

    initCard: function(cardPanel, arrayCard1, type){
        var card1 = ccui.Helper.seekWidgetByName(this.panel, cardPanel)
        var height = card1.getContentSize().height;
        var width = card1.getContentSize().width;
        var startX = card1.getPositionX();
        var startY = card1.getPositionY();
        var i;

        for(var i = 0; i < 13; i++)
        {
            arrayCard1[i] = new MaubinhCard(52);
            if(type == 1)
            {
                if(this.index == MaubinhPlayer.MY_INDEX)
                    arrayCard1[i].setRootScale(0.7);
                else
                    arrayCard1[i].setRootScale(0.45);
            }
            else
            {
                if(this.index == MaubinhPlayer.MY_INDEX)
                    arrayCard1[i].setRootScale(0.95);
                else
                    arrayCard1[i].setRootScale(0.65);
            }
        }
        var padY = (height - arrayCard1[0].getHeight()) / 2;
        var padX = (width - arrayCard1[0].getWidth()) / 4;

        for(i = 10; i < 13; i++)
        {
            this.panel.addChild(arrayCard1[i]);
            arrayCard1[i].setPosition((i-10) * padX + arrayCard1[0].getWidth() * 0.5 + startX, arrayCard1[0].getHeight() * 0.5 + padY * 2 + startY);
        }
        for(i = 5; i < 10; i++)
        {
            this.panel.addChild(arrayCard1[i]);
            arrayCard1[i].setPosition((i-5) * padX + arrayCard1[0].getWidth() * 0.5 + startX, arrayCard1[0].getHeight() * 0.5 + padY + startY);
        }
        for(i = 0; i < 5; i++)
        {
            this.panel.addChild(arrayCard1[i]);
            arrayCard1[i].setPosition(i * padX + arrayCard1[0].getWidth() * 0.5 + startX, arrayCard1[0].getHeight() * 0.5 + startY);
        }

    },

    updateWithPlayer: function(player) {

        // status cua nguoi choi < 0 la ko co nguoi, 5 la dang view, con lai la choi
        if(player.status < 0)
        {
            this.setVisible(false);
            return;
        }

        this.setVisible(true);
        this.uiName.setString(player.info["uName"]);
        this.uiAvatar.asyncExecuteWithUrl("defaultAvatar","Common/defaultAvatar.png");
        this.uiAvatar.asyncExecuteWithUrl(player.info["uID"],player.info["avatar"]);
        this.uID = player.info["uID"];
        this.uiGold.setString(StringUtility.formatNumberSymbol(player.info["bean"])+"$");

        this.vip.setVisible(player.info["vip"] > 0);
        try {
            if (player.info["vip"] > 0){
                this.vip.initWithFile(NewVipManager.getIconVip(player.info["vip"]));
            }
        } catch (e) {
            cc.error("loi load vip: ", player.info["vip"], e);
            this.vip.setVisible(false);
        }

        if (player.info["uID"] === gamedata.getUserId()){
            var state = (NewVipManager.getInstance().getRemainTime() > 0) ? 0 : 1;
            this.vip.setState(state);
        }

        var listBenefitHave = NewVipManager.getInstance().getListBenefitHave(player.info["vip"], false);
        if(listBenefitHave.indexOf(6) >= 0) // key hieu ung vao ban
        {
            var particle = new cc.ParticleSystem("Particles/vip.plist");
            particle.setLocalZOrder(5);
            this.panel.addChild(particle);
            particle.setPosition(cc.p(this.bgAvatar.getPositionX(), this.bgAvatar.getPositionY()));
        }

        player.active = false;
        this.newGame();

    },

    updateItem: function(id) {},

    setVisible: function(visible){
        cc.Node.prototype.setVisible.call(this,visible);
        this.panel.setVisible(visible);
    },

    newGame: function(){
        this.arranged.setVisible(false);
        this.imageResult.setVisible(false);
        this.chiImage.setVisible(false);
        this.moneyGroup.setVisible(false);
        this.imageSap.setVisible(false);
        this.labelViewing.setVisible(false);
        this.labelExp.setVisible(false);
        this.panelEffect.removeAllChildren(true);
        if(this.amatureBinh)
        {
            this.amatureBinh.setVisible(false);
        }
        if(this.index != MaubinhPlayer.MY_INDEX)
        {
            this.card1.setVisible(false);
            this.card2.setVisible(false);
            this.card1.cleanup();
            this.card2.cleanup();
            this.arranging.cleanup();
            this.arranging.setVisible(false);
            for(var i = 0; i < 3; i++)
                this.arrangeDot[i].setVisible(false);
        }

        for(var i = 0; i < 13; i++)
        {
            this.arrayCard1[i].setID(52);
            this.arrayCard2[i].setID(52);
            this.arrayCard1[i].setVisible(false);
            this.arrayCard2[i].setVisible(false);
            this.arrayCard1[i].setDark(false);
        }
        if(this.index == MaubinhPlayer.MY_INDEX)
        {
            for(var i = 0; i < 3; i++)
            {
                this.arrayChi[i].loadTexture("poker/numChi" + (i + 1) + "Dis.png");
            }
        }
        this.setAvatarOpacity(255);
    },

    startGame: function(){
        this.newGame();
        if(this.index != MaubinhPlayer.MY_INDEX)
        {
            this.arranging.setVisible(true);
        }
        else
        {
            for(var i = 0; i < 13; i++)
            {
                this.arrayCard1[i].setID(gamedata.gameLogic.players[0].cards[i]);
            }
        }
    },

    randomCard: function() {
        for(var i = 0; i < 13; i++)
            this.arrayCard2[i].setVisible(false);
        this.card1.setVisible(true);
        this.card2.setVisible(true);
        var func = function(){
            this.card1.setVisible(false);
            this.card2.setVisible(false);
        };
        var rand1 = Math.floor(Math.random() * 13);
        var rand2 = Math.floor(Math.random() * 13);

        this.card1.setPosition(this.arrayCard1[rand1].getPosition());
        this.card2.setPosition(this.arrayCard1[rand2].getPosition());

        this.arrayCard1[rand1].setVisible(false);
        this.arrayCard1[rand2].setVisible(false);

        this.card1.setTag(rand2);
        this.card2.setTag(rand1);

        var func = function(sender,target){
            sender.setVisible(false);
            target.setVisible(false);
            this.arrayCard1[sender.getTag()].setVisible(true);
            this.arrayCard1[target.getTag()].setVisible(true);


            sender.runAction(cc.sequence(cc.delayTime(4), cc.callFunc(function(){
                this.randomCard();
            }.bind(sender))));
        }

        this.card1.runAction(cc.sequence(cc.moveTo(0.3, this.arrayCard1[rand2].getPositionX(), this.arrayCard1[rand2].getPositionY()), cc.callFunc(function (sender, target){
                sender.setVisible(false);
                target.setVisible(false);
                this.arrayCard1[sender.getTag()].setVisible(true);
                this.arrayCard1[target.getTag()].setVisible(true);

                this.countGen++;
                if(this.countGen < 4)
                {
                    this.randomCard();

                }
                else
                {
                    this.countGen = 0;
                    sender.runAction(cc.sequence(cc.delayTime(4), cc.callFunc(function(){
                        this.randomCard();
                    }.bind(this))));
                }
            }.bind(this)
            , this.card1, this.card2)));
        this.card2.runAction(cc.sequence(cc.moveTo(0.3, this.arrayCard1[rand1].getPositionX(), this.arrayCard1[rand1].getPositionY())));
    },

    genDot: function(){
        if(this.countGenDot >= 3) {
            this.countGenDot = 0;
            for(var i = 0; i < 3; i++)
                this.arrangeDot[i].setVisible(false);
        }
        else
        {
            this.arrangeDot[this.countGenDot].setVisible(true);
            this.countGenDot++;
        }
        this.arranging.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(function (){
            this.genDot();
        }.bind(this))));
    },

    unReady: function() {
        if(this.index != MaubinhPlayer.MY_INDEX)
        {
            cc.log("UN READY ");
            this.arranging.setVisible(true);

            this.randomCard();
        }
        this.arranged.setVisible(false);
    },

    ready: function() {
        if(this.index != MaubinhPlayer.MY_INDEX)
        {
            this.arranging.setVisible(false);
            this.arranging.cleanup();
            for(var i = 0; i < 3; i++)
                this.arrangeDot[i].setVisible(false);
            this.card1.cleanup();
            this.card2.cleanup();
            this.card1.setVisible(false);
            this.card2.setVisible(false);
            for(var i = 0; i < 13; i++)
                this.arrayCard1[i].setVisible(true);
        }

        this.arranged.setVisible(true);
    },

    endCard: function( Cards ){
        var i, j;
        this.arranged.setVisible(false);

        if(this.index != MaubinhPlayer.MY_INDEX)
        {
            this.arranging.setVisible(false);
            for(var i = 0; i<3; i++)
                this.arrangeDot[i].setVisible(false);
        }

        this.playerCard = new MaubinhPlayerCard();
        for (j = 0; j < 13; j++) {
            var group = new MaubinhGroupCardLogic();
            group.AddCardByID(Cards[j]);
            this.playerCard.AddGroupCard(group);
        }
        this.playerCard.SapXepTruocSoBai();

        for(var i = 0; i<5; i++)
        {
            gamedata.gameLogic.players[this.index].cards[i] = this.playerCard.ChiCuoi.Cards[i].ID;
        }

        for(var i = 0; i<5; i++)
        {
            gamedata.gameLogic.players[this.index].cards[5 + i] = this.playerCard.ChiGiua.Cards[i].ID;
        }

        for(var i = 0; i<3; i++)
        {
            gamedata.gameLogic.players[this.index].cards[10 + i] = this.playerCard.ChiDau.Cards[i].ID;
        }

        cc.log("PLAYER " + this.index);
        this.setAvatarOpacity(50);
    },

    setAvatarOpacity: function(opacity)
    {
        this.vip.setOpacity(opacity);
        this.uiAvatar.setOpacity(opacity);
        this.uiName.setOpacity(opacity);
        this.uiGold.setOpacity(opacity);
        this.uiAvatar.setOpacity(opacity);
        this.bgAvatar.setOpacity(opacity);
        this.uiHome.setOpacity(opacity);
        this.chiImage.setVisible(false);
    },

    setIdCard: function(arrayId){

        this.playerCard = new MaubinhPlayerCard();
        var j;
        for (j = 0; j < 13; j++) {
            var group = new MaubinhGroupCardLogic();
            group.AddCardByID(arrayId[j]);
            this.playerCard.AddGroupCard(group);
            this.arrayCard1[j].setVisible(true);
        }
        this.playerCard.SapXepTruocSoBai();
        for(var i = 0; i<5; i++)
        {
            gamedata.gameLogic.players[this.index].cards[i] = this.playerCard.ChiCuoi.Cards[i].ID;
            this.arrayCard1[i].setID(this.playerCard.ChiCuoi.Cards[i].ID);
        }

        for(var i = 0; i<5; i++)
        {
            gamedata.gameLogic.players[this.index].cards[5 + i] = this.playerCard.ChiGiua.Cards[i].ID;
            this.arrayCard1[i + 5].setID(this.playerCard.ChiGiua.Cards[i].ID);
        }

        for(var i = 0; i<3; i++)
        {
            gamedata.gameLogic.players[this.index].cards[10 + i] = this.playerCard.ChiDau.Cards[i].ID;
            this.arrayCard1[i + 10].setID(this.playerCard.ChiDau.Cards[i].ID);

        }
        for (var i = 0; i < 13; i++)
        {
            this.arrayCard2[i].setID(this.arrayCard1[i].id);

        }


        if(this.index != MaubinhPlayer.MY_INDEX)
        {
            this.card1.cleanup();
            this.card2.cleanup();
            this.card1.setVisible(false);
            this.card2.setVisible(false);
        }
        var cardKind = this.getTypeMauBinh();
        for (i = 0; i < 13; i++)
            this.arrayCard1[i].setDark(true);
        if (cardKind == MaubinhPlayerCard.EM_BINHLUNG) {
            for (i = 0; i < 13; i++)
                this.arrayCard1[i].setDark(false);

            return;
        }
        if (cardKind == MaubinhPlayerCard.EM_SANHRONG || cardKind == MaubinhPlayerCard.EM_3SANH || cardKind == MaubinhPlayerCard.EM_3THUNG || cardKind == MaubinhPlayerCard.EM_LUCPHEBON || cardKind == MaubinhPlayerCard.EM_MUOI_HAI || cardKind == MaubinhPlayerCard.EM_MUOI_BA) {
            for (i = 0; i < 13; i++)
                this.arrayCard1[i].setDark(true);

            return;
        }

        var gc = null;

        if (this.playerCard.ChiDau.GetGroupKind() != MaubinhGroupCardLogic.EG_SAMCO) {
            switch (this.playerCard.ChiDau.GetGroupKind()) {

                case MaubinhGroupCardLogic.EG_MAUTHAU:
                    gc = this.playerCard.ChiDau.getMaxCard();
                    break;
                case MaubinhGroupCardLogic.EG_THU:
                    gc = this.playerCard.ChiDau.get2DoiKhacNhau();
                    break;
                case MaubinhGroupCardLogic.EG_DOI:
                    gc = this.playerCard.ChiDau.getPair();
                    break;
            }
            if (gc) {
                for (i = 0; i < 3; i++) {
                    var stt = 10 + i;
                    for (j = 0; j < gc.Cards.length; j++) {

                        if (gc.Cards[j].ID == this.arrayCard1[stt].id) {
                            break;
                        }
                    }

                    if (j == gc.Cards.length) {
                        this.arrayCard1[stt].setDark(false);
                    }

                }

            }
        }
        if (this.playerCard.ChiGiua.GetGroupKind() != MaubinhGroupCardLogic.EG_THUNGPHASANH && this.playerCard.ChiGiua.GetGroupKind() != MaubinhGroupCardLogic.EG_THUNG && this.playerCard.ChiGiua.GetGroupKind() != MaubinhGroupCardLogic.EG_SANH && this.playerCard.ChiGiua.GetGroupKind() != MaubinhGroupCardLogic.EG_CULU) {
            switch (this.playerCard.ChiGiua.GetGroupKind()) {
                case MaubinhGroupCardLogic.EG_MAUTHAU:
                    gc = this.playerCard.ChiGiua.getMaxCard();
                    break;
                case MaubinhGroupCardLogic.EG_THU:
                    gc = this.playerCard.ChiGiua.get2DoiKhacNhau();
                    break;
                case MaubinhGroupCardLogic.EG_DOI:
                    gc = this.playerCard.ChiGiua.getPair();
                    break;
                case MaubinhGroupCardLogic.EG_SAMCO:
                    gc = this.playerCard.ChiGiua.getXamChi();
                    break;
                case MaubinhGroupCardLogic.EG_TUQUI:
                    gc = this.playerCard.ChiGiua.getFour();
                    break;
            }
            if (gc) {
                for (i = 0; i < 5; i++) {
                    var stt = 5 + i;
                    for (j = 0; j < gc.Cards.length; j++) {
                        if (gc.Cards[j].ID == this.arrayCard1[stt].id) {
                            break;
                        }
                    }

                    if (j == gc.Cards.length) {

                        this.arrayCard1[stt].setDark(false);
                    }

                }

            }
        }
        if (this.playerCard.ChiCuoi.GetGroupKind() != MaubinhGroupCardLogic.EG_THUNGPHASANH && this.playerCard.ChiCuoi.GetGroupKind() != MaubinhGroupCardLogic.EG_THUNG && this.playerCard.ChiCuoi.GetGroupKind() != MaubinhGroupCardLogic.EG_SANH && this.playerCard.ChiCuoi.GetGroupKind() != MaubinhGroupCardLogic.EG_CULU) {
            switch (this.playerCard.ChiCuoi.GetGroupKind()) {
                case MaubinhGroupCardLogic.EG_MAUTHAU:
                    gc = this.playerCard.ChiCuoi.getMaxCard();
                    break;
                case MaubinhGroupCardLogic.EG_THU:
                    gc = this.playerCard.ChiCuoi.get2DoiKhacNhau();
                    break;
                case MaubinhGroupCardLogic.EG_DOI:
                    gc = this.playerCard.ChiCuoi.getPair();
                    break;
                case MaubinhGroupCardLogic.EG_SAMCO:
                    gc = this.playerCard.ChiCuoi.getXamChi();
                    break;
                case MaubinhGroupCardLogic.EG_TUQUI:
                    gc = this.playerCard.ChiCuoi.getFour();
                    break;
            }
            if (gc) {
                for (i = 0; i < 5; i++) {
                    var stt = i;
                    for (j = 0; j < gc.Cards.length; j++) {
                        if (gc.Cards[j].ID == this.arrayCard1[stt].id) {
                            break;
                        }
                    }

                    if (j == gc.Cards.length) {

                        this.arrayCard1[stt].setDark(false);
                    }

                }

            }

        }



    },

    compareChi: function(Chi, Money, Result) {
        var num;

        if (Chi == 1)
        {
            for (var i = 0; i < 13; i++)
                this.arrayCard1[i].setVisible(false);
        }

        if (Chi <= 0)
            return;

        if (Chi == 3)
        {
            num = 3;
        }
        else
        {
            num = 5;
        }

        if(this.index != MaubinhPlayer.MY_INDEX)
        {
            if (Chi >= 2)
            {
                for (var i = 0; i < 5; i++)
                {
                    this.arrayCard2[(Chi - 2) * 5 + i].setDark(true);
                }
            }
        }
        else
        {
            for (var i = 0; i < 13; i++)
            {
                this.arrayCard2[i].setDark(true);
            }
        }

        for (var i = 0; i < num; i++)
        {
            this.arrayCard2[(Chi - 1) * 5 + i].setDark(false);
            this.arrayCard2[(Chi - 1) * 5 + i].setLocalZOrder(4);
            if(this.index != MaubinhPlayer.MY_INDEX)
            {
                this.arrayCard2[(Chi - 1) * 5 + i].runAction(cc.sequence(cc.delayTime(0.05), cc.callFunc(function(sender) {
                    sender.cleanup();
                    sender.setVisible(true);
                    sender.runAction(cc.sequence(cc.scaleTo(0.25, 0, sender.rootScale), cc.callFunc(function(sender1){
                        sender1.cleanup();
                        sender1.setVisible(true);
                        sender1.setID(gamedata.gameLogic.players[this.index].cards[sender1.getTag()]);
                        sender1.runAction(cc.scaleTo(0.25, sender1.rootScale, sender1.rootScale));
                    }.bind(this))));

                }.bind(this))));
            }

        }
        this.effectMoney(Money, 0, Result);
        if (!this.playerCard) return;

        var gKind = this.playerCard.GetPlayerCardsKind(gamedata.gameLogic.typeRoom == 1);
        if (gamedata.gameLogic.typeRoom == 0 || gKind != MaubinhPlayerCard.EM_BINHLUNG)
        {

            var groupKind;
            if (Chi == 1)
            {
                groupKind = this.playerCard.ChiCuoi.GetGroupKind();
            }
            else if (Chi == 2)
            {
                groupKind = this.playerCard.ChiGiua.GetGroupKind();
            }
            else
            {
                groupKind = this.playerCard.ChiDau.GetGroupKind();
            }

            switch (groupKind) {
                case MaubinhGroupCardLogic.EG_THUNGPHASANHTHUONG:
                {
                    this.effectParticle();
                    if (Chi == 1)
                        this.effectChi("poker/thungPhaSanh.png", Chi);
                    else
                        this.effectChi("poker/thungPhaSanhChi2.png", Chi);

                    if(this.index == MaubinhPlayer.MY_INDEX)
                    {
                        if (Money > 0)
                        {
                            gameSound.playSoundthang_thungphasanh();
                        }
                        else
                        {
                            gameSound.playSoundxepbai_thungphasanh();
                        }
                    }
                }

                    break;
                case MaubinhGroupCardLogic.EG_THUNGPHASANH:
                {
                    this.effectParticle();
                    if (Chi == 1)
                        this.effectChi("poker/thungPhaSanh.png", Chi);
                    else
                        this.effectChi("poker/thungPhaSanhChi2.png", Chi);
                    if(this.index == MaubinhPlayer.MY_INDEX)
                    {
                        if (Money > 0)
                        {
                            gameSound.playSoundthang_thungphasanh();
                        }
                        else
                        {
                            gameSound.playSoundxepbai_thungphasanh();
                        }
                    }
                }

                    break;
                case MaubinhGroupCardLogic.EG_TUQUI:
                {
                    this.effectParticle();

                    if (Chi == 1)
                        this.effectChi("poker/tuQuy.png", Chi);
                    else
                        this.effectChi("poker/tuQuyChi2.png", Chi);
                    if(this.index == MaubinhPlayer.MY_INDEX)
                    {
                        if (Money > 0)
                        {
                            gameSound.playSoundthang_tuquy();
                        }
                        else
                        {
                            gameSound.playSoundxepbai_tuquy();
                        }
                    }
                }

                    break;
                case MaubinhGroupCardLogic.EG_CULU:
                {
                    if (Chi == 2)
                        this.effectParticle();
                    if (Chi == 1)
                        this.effectChi("poker/cuLu.png", Chi);
                    else
                        this.effectChi("poker/cuLuChi2.png", Chi);
                    if(this.index == MaubinhPlayer.MY_INDEX)
                    {
                        if (Money > 0)
                        {
                            gameSound.playSoundthang_culu();
                        }
                        else
                        {
                            gameSound.playSoundxepbai_culu();
                        }
                    }
                }

                    break;
                case MaubinhGroupCardLogic.EG_THUNG:
                    this.effectChi("poker/thung.png", Chi);
                    if(this.index == MaubinhPlayer.MY_INDEX)
                    {
                        if (Money > 0)
                        {
                            gameSound.playSoundthang_thung();
                        }
                        else
                        {
                            gameSound.playSoundxepbai_thung();
                        }
                    }
                    break;
                case MaubinhGroupCardLogic.EG_SANH:
                    this.effectChi("poker/sanh.png", Chi);
                    if(this.index == MaubinhPlayer.MY_INDEX)
                    {
                        if (Money > 0)
                        {
                            gameSound.playSoundthang_sanh();
                        }
                        else
                        {
                            gameSound.playSoundxepbai_sanh();
                        }
                    }
                    break;
                case MaubinhGroupCardLogic.EG_SAMCO:
                {
                    if (Chi == 3)
                        this.effectParticle();
                    if (Chi == 3)
                        this.effectChi("poker/xamChiCuoi.png", Chi);
                    else
                        this.effectChi("poker/xamChi.png", Chi);
                    if(this.index == MaubinhPlayer.MY_INDEX)
                    {
                        if (Money > 0)
                        {
                            gameSound.playSoundthang_samchicuoi();
                        }
                        else
                        {
                            gameSound.playSoundxepbai_samchi();
                        }
                    }
                }

                    break;
                case MaubinhGroupCardLogic.EG_THU:
                    this.effectChi("poker/thu.png", Chi);
                    if(this.index == MaubinhPlayer.MY_INDEX)
                    {
                        if (Money > 0)
                        {
                            gameSound.playSoundthang_thu();
                        }
                        else
                        {
                            gameSound.playSoundxepbai_thu();
                        }
                    }
                    break;
                case MaubinhGroupCardLogic.EG_DOI:
                    this.effectChi("poker/doi.png", Chi);
                    if(this.index == MaubinhPlayer.MY_INDEX)
                    {
                        if (Money > 0)
                        {
                            gameSound.playSoundthang_doi();
                        }
                        else
                        {
                            gameSound.playSoundxepbai_doi();
                        }
                    }
                    break;
                case MaubinhGroupCardLogic.EG_MAUTHAU:

                    this.effectChi("poker/mauThau.png", Chi);
                    if(this.index == MaubinhPlayer.MY_INDEX)
                    {
                        if (Money > 0)
                        {
                            gameSound.playSoundthang_mauthau();
                        }
                        else
                        {
                            gameSound.playSoundxepbai_mauthau();
                        }
                    }
                    break;

                default:
                    this.chiImage.setVisible(false);
                    break;
            }
        }
        else
        {
            this.effectChi("poker/binhLung.png", Chi);
        }
    },

    effectParticle: function() {
        var particle = new cc.ParticleSystem("Particles/Flower.plist");
        particle.setLocalZOrder(5);
        this.panel.addChild(particle);
        particle.setPosition(cc.p(this.arrayCard2[2].getPositionX(), this.arrayCard2[7].getPositionY()));
    },

    effectChi: function(imageRes, chi) {
        this.chiImage.removeFromParent(true);
        this.chiImage = cc.Sprite.create(imageRes);
        this.panel.addChild(this.chiImage, 5);
        this.chiImage.setVisible(true);
        this.chiImage.setScale(0);
        this.chiImage.runAction(cc.scaleTo(0.9, 1, 1).easing(cc.easeBounceOut()));

        if (chi == 0)
        {
            if (this.index == 1)
            {
                if (this.arrayCard2[2].getPositionX() < this.chiImage.getContentSize().width * 0.5)
                    this.chiImage.setPosition(this.chiImage.getContentSize().width * 0.5, this.arrayCard2[7].getPositionY());
                else
                    this.chiImage.setPosition(this.arrayCard2[2].getPositionX(), this.arrayCard2[7].getPositionY());
            }
            else
                this.chiImage.setPosition(this.arrayCard2[2].getPositionX(), this.arrayCard2[7].getPositionY());
        }
        else {
            var height = this.arrayCard2[2].getHeight() * 0.25;
            var width;
            if (chi == 1) {
                width = this.arrayCard2[4].getPositionX() + this.arrayCard2[4].getWidth() - this.arrayCard2[0].getPositionX();

                if (this.index == 1) {
                    if (this.arrayCard2[2].getPositionX() < this.chiImage.getContentSize().width * 0.5)
                        this.chiImage.setPosition(this.chiImage.getContentSize().width * 0.5, this.arrayCard2[2].getPositionY() - this.arrayCard2[2].getHeight() * 0.5 + height);
                    else
                        this.chiImage.setPosition(this.arrayCard2[2].getPositionX(), this.arrayCard2[2].getPositionY() - this.arrayCard2[2].getHeight() * 0.5 + height);
                }
                else
                    this.chiImage.setPosition(this.arrayCard2[2].getPositionX(), this.arrayCard2[2].getPositionY() - this.arrayCard2[2].getHeight() * 0.5 + height);
            }
            else if (chi == 2) {
                if (this.index == 1) {
                    if (this.arrayCard2[2].getPositionX() < this.chiImage.getContentSize().width * 0.5)
                        this.chiImage.setPosition(this.chiImage.getContentSize().width * 0.5, this.arrayCard2[7].getPositionY() - this.arrayCard2[2].getHeight() * 0.5 + height);
                    else
                        this.chiImage.setPosition(this.arrayCard2[7].getPositionX(), this.arrayCard2[7].getPositionY() - this.arrayCard2[2].getHeight() * 0.5 + height);
                }
                else
                    this.chiImage.setPosition(this.arrayCard2[7].getPositionX(), this.arrayCard2[7].getPositionY() - this.arrayCard2[2].getHeight() * 0.5 + height);
            }
            else if (chi == 3) {
                if (this.index == 1) {
                    if (this.arrayCard2[1].getPositionX() < this.chiImage.getContentSize().width * 0.5)
                        this.chiImage.setPosition(this.chiImage.getContentSize().width * 0.5, this.arrayCard2[11].getPositionY() - this.arrayCard2[2].getHeight() * 0.5 + height);
                    else
                        this.chiImage.setPosition(this.arrayCard2[11].getPositionX(), this.arrayCard2[11].getPositionY() - this.arrayCard2[2].getHeight() * 0.5 + height);
                }

                else
                    this.chiImage.setPosition(this.arrayCard2[11].getPositionX(), this.arrayCard2[11].getPositionY() - this.arrayCard2[2].getHeight() * 0.5 + height);
            }

        }
    },

    effectMoney: function( chipMoney, timeDelay, result ){
        if(!result)
            result = 0;
        this.moneyGroup.cleanup();
        this.moneyGroup.removeFromParent(true);
        this.moneyGroup = MaubinhPlayer.createNodeMoney1(chipMoney, result);
        this.panel.addChild(this.moneyGroup);
        this.moneyGroup.setLocalZOrder(5);
        this.moneyGroup.setAnchorPoint(cc.p(0.5, 0.5));
        this.moneyGroup.setVisible(false);
        this.moneyGroup.setScale(0.2);
        this.moneyGroup.runAction(cc.sequence(cc.delayTime(timeDelay), cc.show(), cc.scaleTo(0.9, 1, 1).easing(cc.easeBounceOut())));

        this.moneyGroup.setPosition(this.bgAvatar.getPositionX(), this.bgAvatar.getPositionY() + this.moneyGroup.getContentSize().height * 0.5);
    },

    visibleCardSmall: function(){
        for(var i = 0; i < 13; i++)
            this.arrayCard1[i].setVisible(true);
    },

    updateViewing: function(){
        var s = this.labelViewing.getString();
        if(s.localeCompare(LocalizedString.to("VIEWING")) == 0)
        {
            this.labelViewing.setString(LocalizedString.to("VIEWING") + ".");
        }
        else if(s.localeCompare(LocalizedString.to("VIEWING") + ".") == 0)
        {
            this.labelViewing.setString(LocalizedString.to("VIEWING") + "..");
        }
        else if(s.localeCompare(LocalizedString.to("VIEWING") + "..") == 0)
        {
            this.labelViewing.setString(LocalizedString.to("VIEWING") + "...");
        }
        else if(s.localeCompare(LocalizedString.to("VIEWING") + "...") == 0)
        {
            this.labelViewing.setString(LocalizedString.to("VIEWING"));
        }

        this.labelViewing.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(function (){
            this.updateViewing();
        }.bind(this))));
    },

    setType: function (type) {
        if(type == Player.PLAYING)
        {
            this.setAvatarOpacity(255);
            this.labelViewing.setVisible(false);

            this.setVisible(true);
        }
        else if(type == Player.VIEWING)
        {
            this.setAvatarOpacity(100);
            this.labelViewing.setVisible(true);
            this.labelViewing.setString(LocalizedString.to("VIEWING"));
            this.updateViewing();
            this.setVisible(true);
        }
        else
        {
            this.setVisible(false);
        }
    },

    chiIndex: function( chi ){
        if(this.index != MaubinhPlayer.MY_INDEX)
        {
            this.arranging.setVisible(false);
            this.arranging.cleanup();
            for(var i = 0; i < 3; i++)
                this.arrangeDot[i].setVisible(false);
            this.card1.cleanup();
            this.card2.cleanup();
            this.card1.setVisible(false);
            this.card2.setVisible(false);
        }

        if (chi == 1)
        {
            for (var i = 0; i < 13; i++)
            {
                this.arrayCard1[i].setVisible(false);
            }
            if(this.index != MaubinhPlayer.MY_INDEX)
            {
                this.card1.setVisible(false);
                this.card2.setVisible(false);
            }
        }
        if(this.index == MaubinhPlayer.MY_INDEX)
        {
            for(var i = 0; i < 3; i++)
                this.arrayChi[i].loadTexture("poker/numChi" + (i+ 1) + "Dis.png");
        }
        if(chi > 0  && chi < 4)
        {
            if(this.index == MaubinhPlayer.MY_INDEX)
            {
                var s = "poker/numChi" + chi + "Small.png";
                this.arrayChi[chi - 1].loadTexture(s);
            }
        }


        this.arranged.setVisible(false);
        if(this.index != MaubinhPlayer.MY_INDEX)
        {
            this.arranging.setVisible(false);
            for(var i = 0; i < 3; i++)
                this.arrangeDot[i].setVisible(false);
        }
        if(this.moneyGroup)
            this.moneyGroup.setVisible(false);

        this.imageResult.setVisible(false);
        if(!gamedata.gameLogic.players[this.index].isCompareBai)
            this.chiImage.setVisible(false);

        for (var i = 0; i < 13; i++)
        {
            this.arrayCard2[i].setVisible(true);
            if (i < 5)
                this.arrayCard2[i].setLocalZOrder(3);
            else if (i < 10)
                this.arrayCard2[i].setLocalZOrder(2);
            else
                this.arrayCard2[i].setLocalZOrder(1);
        }
    },

    getNumChi: function(chi) {
        var groupKind;
        if (chi == 1)
        {
            groupKind = this.playerCard.ChiCuoi.GetGroupKind();
        }
        else if (chi == 2)
        {
            groupKind = this.playerCard.ChiGiua.GetGroupKind();
        }
        else
        {
            groupKind = this.playerCard.ChiDau.GetGroupKind();
        }

        switch (groupKind) {
            case 0:
            {
                if (chi == 1)
                    return 10;
                else
                    return 20;
            }

                break;
            case 1:
            {

                if (chi == 1)
                    return 10;
                else
                    return 20;
            }

                break;
            case 2:
            {
                if(chi == 1)
                {
                    if(this.playerCard.ChiCuoi.GetMaxNumber() == 14 && gamedata.gameLogic.typeRoom == 1)
                        return 20;
                    else
                        return 8;
                }
                else
                {
                    if(this.playerCard.ChiCuoi.GetMaxNumber() == 14 && gamedata.gameLogic.typeRoom == 1)
                        return 40;
                    else
                        return 16;
                }

            }

                break;
            case 3:
                if(chi == 1)
                    return 1;
                else
                    return 4;
                break;
            case 4:
                return 1;
                break;
            case 5:
            {
                return 1;
            }

                break;
            case 6:
            {
                if (chi == 3)
                    return 6;
                else
                    return 1;
            }

                break;
            case 7:
                return 1;
                break;
            case 8:
                return 1;
                break;
            case 9:
                return 1;
            default:
                return 0;
                break;
        }
    },

    updateUserInfo: function(){
        this.uiName.setString(gamedata.gameLogic.players[this.index].info["uName"]);
        this.uID = gamedata.gameLogic.players[this.index].info["uID"];
        this.uiGold.setString(StringUtility.formatNumberSymbol(gamedata.gameLogic.players[this.index].info["bean"])+"$");
    },

    getPosAvatar: function() {
        return this.panel.convertToWorldSpace(this.bgAvatar.getPosition());
    },

    endCompareChi: function(isSummary) {
        for(var i = 0; i<13; i++)
        {
            this.arrayCard1[i].setVisible(false);
        }
        if(!gamedata.gameLogic.players[this.index].isCompareBai || isSummary)
        {
            this.chiImage.setVisible(false);
        }
        this.moneyGroup.setVisible(false);
        this.imageResult.setVisible(false);
        this.imageSap.setVisible(false);
        for (var i = 0; i < 13; i++)
        {
            this.arrayCard2[i].setVisible(true);
            if (i < 5)
                this.arrayCard2[i].setLocalZOrder(3);
            else if (i < 10)
                this.arrayCard2[i].setLocalZOrder(2);
            else
                this.arrayCard2[i].setLocalZOrder(1);

            this.arrayCard2[i].setDark(false);
        }

        if(this.index == MaubinhPlayer.MY_INDEX)
        {
            for(var i = 0; i < 3; i++)
                this.arrayChi[i].loadTexture("poker/numChi" + (i+ 1) + "Dis.png");
        }
    },

    showResult: function(money){
        this.imageResult.removeFromParent(true);
        if (money >= 0)
        {
            this.imageResult = cc.Sprite.create("poker/win.png");
        }
        else
        {
            this.imageResult = cc.Sprite.create("poker/lose.png");
        }

        this.panel.addChild(this.imageResult, 5);
        this.imageResult.setPosition(this.moneyGroup.getPosition());
        if(this.index == 1|| this.index == 3) {
            if (this.imageResult.getPositionX() - this.imageResult._getWidth() * 0.5 < 0) {
                this.imageResult.setPositionX(this.imageResult._getWidth() * 0.55);
            }
            else if (this.imageResult.getPositionX() + this.imageResult._getWidth() * 0.5 > this.panel.getContentSize().width) {
                this.imageResult.setPositionX(this.panel.getContentSize().width - this.imageResult._getWidth() * 0.55);
            }
        }
        cc.log("SHOW RESULT *************** ");
        this.imageResult.setPosition(this.bgAvatar.getPositionX(), this.bgAvatar.getPositionY() - this.bgAvatar.getContentSize().height * 0.72 + this.imageResult.getContentSize().height * 0.5);
    },

    showExp: function(exp){
        this.labelExp.setString("+" + StringUtility.pointNumber(exp) + "EXP");
        this.labelExp.setVisible(true);
        this.labelExp.cleanup();
        this.labelExp.setColor(cc.color(8, 175, 247, 255));
        this.labelExp.setOpacity(255);
        this.labelExp.setPosition(this.bgAvatar.getPositionX(), this.bgAvatar.getPositionY() + 30);
        this.labelExp.runAction(cc.sequence(cc.moveBy(1.5, 0, 50).easing(cc.easeBounceOut()), cc.fadeOut(2.0)));

    },

    effectSap3Chi: function(){
        this.imageSap.setVisible(true);
        this.imageSap.setScale(0.2);
        this.imageSap.runAction(cc.scaleTo(0.9, 1, 1).easing(cc.easeBounceOut()));
        if (this.index == 1)
        {
            if (this.moneyGroup.getPositionX() < this.imageSap.getContentSize().width)
                this.imageSap.setPosition(this.imageSap.getContentSize().width * 0.5, this.moneyGroup.getPositionY() - this.moneyGroup.getContentSize().height * 1.2 - this.imageSap.getContentSize().height * 0.5);
            else
                this.imageSap.setPosition(this.moneyGroup.getPositionX(), this.moneyGroup.getPositionY() - this.moneyGroup.getContentSize().height * 1.2 - this.imageSap.getContentSize().height * 0.5);
        }
        else
        {
            this.imageSap.setPosition(this.moneyGroup.getPositionX(), this.moneyGroup.getPositionY() - this.moneyGroup.getContentSize().height * 1.2 - this.imageSap.getContentSize().height * 0.5);
        }
        this.imageSap.setPosition(this.bgAvatar.getPositionX(), this.bgAvatar.getPositionY() - this.imageSap.getContentSize().height * 1.2);
        for(var i = 0; i < 13; i++)
            this.arrayCard2[i].setDark(true);
    },

    visibleAllCard: function() {
        for(var i = 0; i<13; i++)
        {
            this.arrayCard2[i].setIdCard(gamedata.gameLogic.players[this.index].cards[i]);
            this.arrayCard2[i].setVisible(true);

        }
        this.setDark(gamedata.gameLogic.players[this.index].isBinhLung);
    },

    soBai: function( isMauBinh, Money, countMaubinh ){
        var groupKind = this.getTypeMauBinh();
        this.endCompareChi();

        for (var i = 0; i < 13; i++)
        {
            this.arrayCard1[i].setVisible(false);
        }

        if(isMauBinh)
        {
            if ((groupKind == MaubinhPlayerCard.EM_LUCPHEBON || groupKind == MaubinhPlayerCard.EM_SANHRONG || groupKind == MaubinhPlayerCard.EM_3SANH
                || groupKind == MaubinhPlayerCard.EM_3THUNG || groupKind == MaubinhPlayerCard.EM_MUOI_BA || groupKind == MaubinhPlayerCard.EM_MUOI_HAI) && gamedata.gameLogic.players[this.index].compareBinh)
            {
                this.visibleAllCard();
                switch(groupKind)
                {
                    case MaubinhPlayerCard.EM_LUCPHEBON:
                    {
                        this.effectParticle();
                        if (countMaubinh > 1)
                        {
                            this.effectMauBinh("Lucphebon", "1");
                        }
                        else
                        {
                            if(this.index == MaubinhPlayer.MY_INDEX)
                            {
                                gameSound.playSoundMauBinh();
                                gameSound.playSoundmaubinh_lucphebon();
                            }
                            else
                            {
                                gameSound.playSoundThua();
                                gameSound.playSoundbaobinh_lucphebon();
                            }

                        }
                    }

                        break;
                    case MaubinhPlayerCard.EM_SANHRONG:
                    {
                        this.effectParticle();
                        if (countMaubinh > 1)
                        {

                            this.effectMauBinh("Sanhrong", "1");
                        }
                        else
                        {
                            if(this.index == MaubinhPlayer.MY_INDEX)
                            {
                                gameSound.playSoundMauBinh();
                                gameSound.playSoundmaubinh_sanhrong();
                            }
                            else
                            {
                                gameSound.playSoundThua();
                                gameSound.playSoundbaobinh_sanhrong();
                            }

                        }
                        //effectChi(PLAYER_GROUP_SANH_RONG, 0);
                    }

                        break;
                    case MaubinhPlayerCard.EM_3SANH:
                    {
                        this.effectParticle();
                        if (countMaubinh > 1)
                        {

                            this.effectMauBinh("Bacaisanh", "1");
                        }
                        else
                        {
                            if(this.index == MaubinhPlayer.MY_INDEX)
                            {
                                gameSound.playSoundMauBinh();
                                gameSound.playSoundmaubinh_3caisanh();
                            }
                            else
                            {
                                gameSound.playSoundThua();
                                gameSound.playSoundbaobinh_3caisanh();
                            }

                        }
                        //effectChi(PLAYER_GROUP_3_CAI_SANH, 0);
                    }

                        break;
                    case MaubinhPlayerCard.EM_3THUNG:
                    {
                        this.effectParticle();
                        if (countMaubinh > 1)
                        {

                            this.effectMauBinh("Bacaithung", "1");
                        }
                        else
                        {
                            if(this.index == MaubinhPlayer.MY_INDEX)
                            {
                                gameSound.playSoundMauBinh();
                                gameSound.playSoundmaubinh_3caithung();
                            }
                            else
                            {
                                gameSound.playSoundThua();
                                gameSound.playSoundbaobinh_3caithung();
                            }

                        }
                        //effectChi(PLAYER_GROUP_3_CAI_THUNG, 0);
                    }

                        break;
                    case MaubinhPlayerCard.EM_MUOI_BA:
                    {
                        this.effectParticle();
                        if (countMaubinh > 1)
                        {

                            this.effectMauBinh("13quandongmau", "1");
                        }
                        else
                        {
                            if(this.index == MaubinhPlayer.MY_INDEX)
                            {
                                gameSound.playSoundMauBinh();
                                gameSound.playSoundmaubinh_13caydongmau();
                            }
                            else
                            {
                                gameSound.playSoundThua();
                                gameSound.playSoundbaobinh_13caydongmau();
                            }

                        }
                        //effectChi(PLAYER_GROUP_3_CAI_THUNG, 0);
                    }

                        break;
                    case MaubinhPlayerCard.EM_MUOI_HAI:
                    {
                        this.effectParticle();
                        if (countMaubinh > 1)
                        {

                            this.effectMauBinh("13quandongmau", "2");
                        }
                        else
                        {
                            if(this.index == MaubinhPlayer.MY_INDEX)
                            {
                                gameSound.playSoundMauBinh();
                                gameSound.playSoundmaubinh_12caydongmau();
                            }
                            else
                            {
                                gameSound.playSoundThua();
                                gameSound.playSoundbaobinh_12caydongmau();
                            }

                        }
                        //effectChi(PLAYER_GROUP_3_CAI_THUNG, 0);
                    }

                        break;
                }

                this.chiImage.setPosition(this.arrayCard2[2].getPositionX(), this.arrayCard2[7].getPositionY());
                gamedata.gameLogic.players[this.index].isCompareBai = true;

                this.setDark(false);
                if (countMaubinh > 1)
                    this.effectMoney(Money, 0.5);
                else
                    this.effectMoney(Money, 0.5);
            }
            else {
                this.effectMoney(Money, 0.5);
                this.setDark(true);
            }
        }
        else
        {
            if(this.index == MaubinhPlayer.MY_INDEX)
            {
                if(groupKind == MaubinhPlayerCard.EM_BINHLUNG)
                {

                    this.effectChi("poker/binhLung.png", 0);
                    gamedata.gameLogic.players[this.index].isCompareBai = true;
                    gameSound.playSoundBinhLung();
                    this.setDark(true);
                    this.effectMoney(Money, 0, -1);
                    gamedata.gameLogic.players[this.index].isBinhLung = true;
                }
                else
                {

                    this.effectMoney(Money, 0, 1);
                }
            }
            else
            {
                if(groupKind == MaubinhPlayerCard.EM_BINHLUNG)
                {
                    this.visibleAllCard();
                    this.effectChi("poker/binhLung.png", 0);
                    gamedata.gameLogic.players[this.index].isCompareBai = true;
                    this.setDark(true);
                    this.effectMoney(Money, 0, -1);
                    gamedata.gameLogic.players[this.index].isBinhLung = true;
                }
                else // tuy vao vi tri cua minh dang view hay binh lung se co cach hien thi effect tien khac nhau
                {

                    if (gamedata.gameLogic.isViewing)
                        this.effectMoney(Money, 0, 1);
                    else
                    {
                        if(sceneMgr.getRunningScene().getMainLayer().isBinhLung())
                        {
                            this.effectMoney(Money, 0, 1);
                        }
                    }
                }
            }
        }

    },

    setDark: function(isDark){
        for(var i = 0; i < 13; i++)
            this.arrayCard2[i].setDark(isDark);
    },

    getTypeMauBinh: function(){
        if (gamedata.gameLogic.typeRoom == 0)
        {
            if (gamedata.gameLogic.players[this.index].compareBinh)
                return this.playerCard.GetPlayerCardsKind();
            else
            {
                if (this.playerCard.GetPlayerCardsKind() == MaubinhPlayerCard.EM_BINHLUNG)
                    return MaubinhPlayerCard.EM_BINHLUNG;
                return MaubinhPlayerCard.EM_NORMAL;
            }
        }

        else
        {
            if (gamedata.gameLogic.players[this.index].compareBinh)
                return this.playerCard.GetPlayerCardsKindBao(false, true);
            else
            {
                if (this.playerCard.GetPlayerCardsKind(false) == MaubinhPlayerCard.EM_BINHLUNG)
                    return MaubinhPlayerCard.EM_BINHLUNG;
                return MaubinhPlayerCard.EM_NORMAL;
            }
        }
    },

    batSapLang: function(Money){
        this.effectMoney(Money, 0.5, 1);
        this.effectMauBinh("batsaplang", "1", false);
    },

    onCompleteEffect: function(animation){
        animation.removeFromParent();
    },

    onCompleteMaubinh: function(animation){
        animation.removeFromParent();
        this.showAmatureMaubinh();
    },

    showBinhEndCard: function(){
        var cardKind = this.getTypeMauBinh();

        if (cardKind == MaubinhPlayerCard.EM_LUCPHEBON || cardKind == MaubinhPlayerCard.EM_SANHRONG || cardKind == MaubinhPlayerCard.EM_3SANH || cardKind == MaubinhPlayerCard.EM_3THUNG
            || cardKind == MaubinhPlayerCard.EM_MUOI_HAI || cardKind == MaubinhPlayerCard.EM_MUOI_BA) {
            switch (cardKind) {
                case MaubinhPlayerCard.EM_LUCPHEBON:
                    this.effectChi("poker/lucPheBon.png", 1);
                    break;
                case MaubinhPlayerCard.EM_SANHRONG:
                    this.effectChi("poker/sanhRong.png", 1);
                    break;
                case MaubinhPlayerCard.EM_3SANH:
                    this.effectChi("poker/baCaiSanh.png", 1);
                    break;
                case MaubinhPlayerCard.EM_3THUNG:
                    this.effectChi("poker/baCaiThung.png", 1);
                    break;
                case MaubinhPlayerCard.EM_MUOI_HAI:
                    this.effectChi("poker/12cay.png", 1);
                    break;
                case MaubinhPlayerCard.EM_MUOI_BA:
                    this.effectChi("poker/13cay.png", 1);
                    break;
                default:
                    break;
            }

            this.chiImage.setPosition(this.arranged.getPositionX(), this.arranged.getPositionY());
        }
    },

    showAmatureMaubinh: function(){
        if(!this.amatureBinh)
        {
            this.amatureBinh = db.DBCCFactory.getInstance().buildArmatureNode("Maubinh");
            this.amatureBinh.setScale(0.6);
            this.panel.addChild(this.amatureBinh, 10);

            switch (this.index)
            {
                case 0:
                {
                    this.amatureBinh.setPositionX(this.bgAvatar.getPositionX());
                    this.amatureBinh.setPositionY(this.bgAvatar.getPositionY() + this.bgAvatar.getContentSize().height * 0.69);
                }
                    break;
                case 1:
                {
                    this.amatureBinh.setPositionX(this.bgAvatar.getPositionX());
                    this.amatureBinh.setPositionY(this.bgAvatar.getPositionY() + this.bgAvatar.getContentSize().height * 0.69);
                }
                    break;
                case 2:
                {
                    this.amatureBinh.setPositionX(this.bgAvatar.getPositionX());
                    this.amatureBinh.setPositionY(this.bgAvatar.getPositionY() - this.bgAvatar.getContentSize().height * 0.69);
                }
                    break;
                case 3:
                {
                    this.amatureBinh.setPositionX(this.bgAvatar.getPositionX());
                    this.amatureBinh.setPositionY(this.bgAvatar.getPositionY() + this.bgAvatar.getContentSize().height * 0.69);
                }
                    break;
                default:
                    break;
            }
        }
        this.amatureBinh.setVisible(true);
        this.amatureBinh.getAnimation().gotoAndPlay("1", -1, -1, -1);

    },

    effectMauBinh: function(resource, animation, isMaubinh){
        if(isMaubinh == null)
            isMaubinh = true;
        var j = db.DBCCFactory.getInstance().buildArmatureNode(resource);
        j.setScale(0.35);
        //j.setPosition(this.bgAvatar.getPosition());
        j.setPosition(this.arrayCard2[7].getPositionX(), this.arrayCard2[7].getPositionY());
        if(isMaubinh)
        {
            j.setCompleteListener(this.onCompleteMaubinh.bind(this));
        }
        else
            j.setCompleteListener(this.onCompleteEffect.bind(this));
        j.getAnimation().gotoAndPlay(animation, -1, -1, 1);

        this.panel.addChild(j, 10);
    },

    effectBinhAt: function(money, result){
        this.imageSap.setVisible(false);
        this.imageResult.setVisible(false);

        this.effectMoney(money, 0, result);

        if (result == 1)
        {
            for (var i = 2; i >= 0; i--)
            {
                var stt;
                var num;
                if (i == 2)
                {
                    num = 3;
                }
                else
                {
                    num = 5;
                }
                for (var j = 0; j < num; j++)
                {
                    stt = 5 * i + j;
                    if (this.arrayCard2[stt].id >= 48 && this.arrayCard2[stt].id < 52)
                    {
                        this.arrayCard2[stt].setVisible(false);
                        var image = new MaubinhCard(this.arrayCard2[stt].id);
                        this.panel.addChild(image);
                        image.setZOrder(10);
                        image.setRootScale(this.arrayCard2[stt].rootScale);
                        image.setPosition(this.arrayCard2[stt].getPosition());
                        image.setTag(stt);
                        image.runAction(cc.sequence(cc.scaleTo(0.2, 1.2), cc.delayTime(0.5), cc.scaleTo(0.2, this.arrayCard2[stt].rootScale), cc.callFunc(function(sender) {
                            sender.setVisible(false);
                            if (this.arrayCard2[sender.getTag()].id != 52)
                                this.arrayCard2[sender.getTag()].setVisible(true);
                        }.bind(this), image)));
                    }
                }
            }


        }
    },

    addLevelExp: function(update) {
        var levelExpAdd = update.newLevelExp - update.oldLevelExp;
        if (levelExpAdd > 0){
            var nodeExp = new ccui.Text("+" + levelExpAdd + " exp", "fonts/tahomabd.ttf", 20);
            nodeExp.ignoreContentAdaptWithSize(true);
            nodeExp.setAnchorPoint(0.5, 0.5);
            nodeExp.setOpacity(200);
            nodeExp.setColor(cc.color(225, 225, 225));
            nodeExp.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            nodeExp.setLocalZOrder(20);
            nodeExp.setPosition(this.uiAvatar.convertToWorldSpace(cc.p(0, 30)));
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
            this.gameScene.effect2D.addChild(nodeExp);

            if (update.newLevel > update.oldLevel){
                var nodeLevel = new ccui.Text("LÊN CẤP " + update.newLevel, "fonts/tahomabd.ttf", 20);
                nodeLevel.ignoreContentAdaptWithSize(true);
                nodeLevel.setAnchorPoint(0.5, 0.5);
                nodeLevel.setColor(cc.color(74, 199, 103));
                nodeLevel.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                nodeLevel.setLocalZOrder(25);
                nodeLevel.setPosition(this.uiAvatar.convertToWorldSpace(cc.p(0, -50)));
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
                this.gameScene.effect2D.addChild(nodeLevel);

                this.schedule(function(){
                    var arrow = new cc.Sprite("Offer/levelUpArrow.png");
                    var avatar = ccui.Helper.seekWidgetByName(this.panel,"bgAvatar");
                    var width = avatar.width;
                    var height = avatar.height;

                    var x = -5 + Math.random() * (width + 10);
                    var startY = -5 + Math.random() * (height/4 + 5);
                    var endY = height*3/4 + Math.random() * (height/4 + 5);
                    var lifeTime = 0.5 + Math.random() * 0.25;
                    var endPos = avatar.convertToWorldSpace(cc.p(x, endY));

                    arrow.setPosition(avatar.convertToWorldSpace(cc.p(x, startY)));
                    arrow.setOpacity(0);
                    this.gameScene.effect2D.addChild(arrow);
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
        this.panel.removeChildByName("emo");
        var emo = StorageManager.getEmoticonForPlay(id, emoId);
        var duration = emo.playAnimation(1, 2);
        emo.setPosition(this.uiAvatar.getPosition());
        var scale = StorageManager.getEmoticonScale(id) * 0.75;
        this.panel.addChild(emo, 99, "emo");
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
        return this.panel.convertToWorldSpace(this.uiAvatar.getPosition());
    },

    onExit: function(){
        this._super();
        this.panel.removeChildByName("emo");
    }
});

MaubinhPlayer.MY_INDEX = 0;
MaubinhPlayer.RESULT_WIN = 1;
MaubinhPlayer.RESULT_DRAW = 0;
MaubinhPlayer.RESULT_LOSE = -1;

MaubinhPlayer.createNodeMoney = function(money, result)
{
    var node = new cc.Node();
    var str = "" + Math.abs(money);
    var thang = (result > 0 || (!result && money >= 0) || (result == 0 && money >= 0));
    var width = 0;
    var height = 0;

    var ret = new cc.Sprite(MaubinhPlayer.getNumberPath(thang,-2));
    width += ret.getContentSize().width;
    var fix = 0;
    ret.setPositionX(ret.getContentSize().width * 0.5);
    node.addChild(ret);
    for(var i=0;i<str.length;i++)
    {
        var xx = ret.getPositionX() + ret.getContentSize().width + fix;fix = 0;
        ret = new cc.Sprite(MaubinhPlayer.getNumberPath(thang,parseInt(str[i])));
        ret.setPositionX(xx);
        node.addChild(ret);
        width += ret.getContentSize().width;
        height = ret.getContentSize().height;


        if((i < str.length - 1) && ((str.length - 1 - i) % 3 == 0))
        {
            xx = ret.getPositionX() + ret.getContentSize().width;
            ret = new cc.Sprite(MaubinhPlayer.getNumberPath(thang,-1));
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

MaubinhPlayer.createNodeMoney1 = function(money, result)
{
    var node = new cc.Node();
    var str = StringUtility.formatNumberSymbol(Math.abs(money));
    var thang = (result > 0 || (!result && money >= 0) || (result == 0 && money >= 0));
    var width = 0;
    var height = 0;

    var ret = new cc.Sprite(MaubinhPlayer.getNumberPath(thang,-2));
    width += ret.getContentSize().width;
    var fix = 0;
    ret.setPositionX(ret.getContentSize().width * 0.5);
    node.addChild(ret);
    for(var i=0;i<str.length;i++)
    {
        var xx = ret.getPositionX() + ret.getContentSize().width + fix;fix = 0;
        if(str[i] == '.')
            ret = new cc.Sprite(MaubinhPlayer.getNumberPath(thang, -1));
        else if(i != str.length - 1)
            ret = new cc.Sprite(MaubinhPlayer.getNumberPath(thang,parseInt(str[i])));
        else
            ret = new cc.Sprite(MaubinhPlayer.getNumberPath(thang,str[i]));

        if(str[i] == '.')
            fix = 4;
        else if( i != str.length - 2)
            fix = 0;
        else
            fix = 2;

        if(str[i] == '.')
            ret.setPosition(xx - 7, -9);
        else
            ret.setPositionX(xx);
        node.addChild(ret);
        width += ret.getContentSize().width;
        height = ret.getContentSize().height;
    }
    node.setContentSize(cc.size(width,height));
    node.setAnchorPoint(cc.p(.5,.5));

    return node;
}

MaubinhPlayer.getNumberPath = function(thang,number)
{
    var path = "poker/";
    if(number == -1)
    {
        if(thang)
            path += "dauphaycong";
        else
            path += "dauphaytru";
    }
    else if(number == -2)
    {
        if(thang)
            path += "daucong";
        else
            path += "dautru";
    }
    else
    {
        if(thang)
            path += ("cong_"+number);
        else
            path += ("tru_"+number);
    }


    path += ".png";
    return path;
}