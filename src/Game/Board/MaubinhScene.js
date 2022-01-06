/**
 * Created by cuongleah on 2/25/2016.
 */

var MaubinhLayer = BaseLayer.extend({

    ctor: function () {
        this._super("GameScene");
        this.players = [];
        this.effect2D = null;

        this.initWithBinaryFile("GUIGame.json");
    },
    onEnter: function () {
        cc.log("ON ENTER ");
        BaseLayer.prototype.onEnter.call(this);

        this.onUpdateGUI();
        this.updateGroupButton();
        this.setBackEnable(true);

        Event.instance().addGuiInGame();
        if (event.sendLogInGame) {
            event.sendLogInGame = false;
            var s = "Test 2 Download Content : User vao duoc game " + "\n" + (new Error()).stack;
            cc.log(s);
            NativeBridge.logJSManual("assets/src/Game/Board/MaubinhScene.js", "5555", s, NativeBridge.getVersionString());
        }

        this.effect2D.removeAllChildren();
        this.effect2D.effects = [];

        NewRankData.addMiniRankGUI(false);
        sceneMgr.openGUI(BoardVoucherGUI.className, BoardVoucherGUI.GUI_TAG, BoardVoucherGUI.GUI_TAG);
    },
    onExit: function () {
        BaseLayer.prototype.onExit.call(this);
    },
    networkSlow: function (visible) {
        this.groupWifi.setVisible(visible);
    },

    playSoundButton: function (id) {
    },

    initGUI: function () {

        this.getControl("panelBtn");
        this.getControl("panelBack");
        this.getControl("panelRight");
        this.panelCenter = this.getControl("panelCenter");
        this.panel0 = this.getControl("Panel_0");

        this.customizeButton("btnBack",MaubinhLayer.BTN_QUIT);
        this.customizeButton("btnStart",MaubinhLayer.BTN_START);
        this.customizeButton("btnArrange",MaubinhLayer.BTN_ARRANGE);
        this.customizeButton("btnHelp",MaubinhLayer.BTN_HELP);
        this.customizeButton("btnJackpot",MaubinhLayer.BTN_JACKPOT);
        this.customizeButton("btnChatEmo",MaubinhLayer.BTN_CHAT_EMO, this.panel0);
        this.customizeButton("btnChatMessage",MaubinhLayer.BTN_CHAT_MESSAGE, this.panel0);

        for(var i = 0; i < 4; i++)
            this.customizeButton("buttonPlayer" + i, 20 + i);

        this.bgClock = ccui.Helper.seekWidgetByName(this._layout,"bgClock");
        this.labelClock = ccui.Helper.seekWidgetByName(this._layout,"labelClock");
        this.waitOtherPlayer = ccui.Helper.seekWidgetByName(this._layout,"waitOtherPlayer");
        this.logoGame = ccui.Helper.seekWidgetByName(this._layout,"typeRoom");
        this.afterTime = ccui.Helper.seekWidgetByName(this._layout,"afterTime");
        this.imageChi = ccui.Helper.seekWidgetByName(this._layout,"imageChi");
        this.finishImage = ccui.Helper.seekWidgetByName(this._layout,"finishImage");
        this.btnStart = ccui.Helper.seekWidgetByName(this._layout,"btnStart");
        this.bgDark = ccui.Helper.seekWidgetByName(this._layout,"bgDark");
        this.btnQuit = ccui.Helper.seekWidgetByName(this._layout,"btnBack");
        this.btnHelp = ccui.Helper.seekWidgetByName(this._layout,"btnHelp");
        this.btnQuit.getChildByName("btnQuitSelect").setVisible(false);
        this.waitNewGame = ccui.Helper.seekWidgetByName(this._layout,"waitNewGame");
        this.btnJackpot = ccui.Helper.seekWidgetByName(this._layout, "btnJackpot");
        this.labelJackpot = this.btnJackpot.getChildByName("labelJackpotNumber");

        var s = StringUtility.standartNumber(gamedata.jackpotValue) + "$";
        this.labelJackpot.setString(s);

        this.groupWifi = this.getControl("groupWifi");
        this.groupWifi.state = this.getControl("wifi",this.groupWifi);
        this.groupWifi.state.runAction(cc.sequence(cc.delayTime(0.5),cc.hide(),cc.delayTime(0.5),cc.show()).repeatForever());
        this.groupWifi.setVisible(false);

        var j = db.DBCCFactory.getInstance().buildArmatureNode("BT_Vang");
        j.setPosition(cc.p(this.btnStart.getContentSize().width * 0.5, this.btnStart.getContentSize().height * 0.5));
        j.getAnimation().gotoAndPlay("1", -1, -1, 0);
        if (cc.sys.isNative)
            j.getCCSlot("Layer 5").getCCChildArmature().getAnimation().gotoAndPlay("5");
        else
            j.getArmature().getSlot("Layer 5").getChildArmature().animation.gotoAndPlay("5");
        this.btnStart.addChild(j);

        this.btnArrange = ccui.Helper.seekWidgetByName(this._layout,"btnArrange");

        var j = db.DBCCFactory.getInstance().buildArmatureNode("BT_xanh");
        j.setPosition(cc.p(this.btnArrange.getContentSize().width * 0.5, this.btnArrange.getContentSize().height * 0.5));
        j.getAnimation().gotoAndPlay("1", -1, -1, 0);
        // j.getCCSlot("Layer 5").getCCChildArmature().getAnimation().gotoAndPlay("5");
        this.btnArrange.addChild(j);

        this.waitDot = new Array(3);
        this.countGenDot = 0;
        for(i = 0; i < 3; i++)
        {
            this.waitDot[i] = cc.Sprite.create("poker/dotWait.png");
            this.panelCenter.addChild(this.waitDot[i], 1);
            this.waitDot[i].setPosition(this.waitOtherPlayer.getPositionX() + this.waitOtherPlayer.getContentSize().width * 0.5 + 7 + 10 * i, this.waitOtherPlayer.getPositionY() - 8);
            this.waitDot[i].setVisible(false);
        }

        for(var i=0;i<4;i++)
        {
            var panel = this.getControl("Panel_"+i);
            var player = new MaubinhPlayer(this);
            player.setPanel(panel, i);
            this.addChild(player);
            this.players.push(player);
        }

        this.effect2D = new LayerEffect2D();
        this.addChild(this.effect2D);
        this.effect2D.setLocalZOrder(2);
        this.newGame();
        this.updateGroupButton();

        sceneMgr.openGUI(BoardVoucherGUI.className, BoardVoucherGUI.GUI_TAG, BoardVoucherGUI.GUI_TAG);
        chatMgr.onJoinRoom();

        this.setBackEnable(true);

        this.onUpdateGUI();

        if (event.isInEvent(Event.MID_AUTUMN)) {
            this.initEventMidAutumn();
        }
        if (event.isInEvent(Event.BLUE_OCEAN)) {
            this.initEventBlueOcean();
        }

        if (Config.ENABLE_CHEAT) {
            this.btnCheatBot = new ccui.Button();
            this.addChild(this.btnCheatBot);
            this.btnCheatBot.setTitleText("BOT");
            this.btnCheatBot.setTitleFontSize(25);
            this.btnCheatBot.setPosition(30, 100);
            this.btnCheatBot.addClickEventListener(this.onSendBot.bind(this));
        }
    },

    onSendBot: function () {
        cc.log("Send Bot***");
        var pkQuit = new CmdSendCheatBot();
        GameClient.getInstance().sendPacket(pkQuit);
        pkQuit.clean();
    },

    initEventBlueOcean: function () {
        blueOcean.createButtonInGame(cc.p(cc.winSize.width , cc.winSize.height * 0.3), this);
    },

    initEventMidAutumn: function () {
        var array = [];
        var arrayPos = [];
        for (var i = 0; i < this.players.length; i++) {
            array.push(this.players[i].bgAvatar);
            arrayPos.push(cc.p(5, 60));
        }
        midAutumn.initArrayPlayer(array, arrayPos);
        midAutumn.createButtonInGame(cc.p(cc.winSize.width , cc.winSize.height * 0.3), this);
    },

    getPosWeeklyChallenge: function () {
        var pos = cc.p(cc.winSize.width - 40, cc.winSize.height - 80);
        var parent = this.btnJackpot.getParent();
        pos = cc.p(this.btnJackpot.getPositionX() - this.btnJackpot.getContentSize().width * 0.5 * parent.getScale() - 40, this.btnJackpot.getPositionY());
        pos = parent.convertToWorldSpace(pos);
        return pos;
    },

    updatePosTime: function(time){
        var chuc = Math.floor(time / 10);
        var donvi = Math.floor(time % 10);
        var sChuc = this.panelCenter.getChildByTag(21);
        var sDonvi = this.panelCenter.getChildByTag(22);
        if(chuc == 0)
        {
            if(this.afterTime.isVisible())
            {
                sDonvi.setPosition(this.afterTime.getPositionX() + this.afterTime.getContentSize().width * 0.5 + 20, this.afterTime.getPositionY());
            }
        }
        else
        {
            if(this.afterTime.isVisible())
            {
                sChuc.setPosition(this.afterTime.getPositionX() + this.afterTime.getContentSize().width * 0.5 + 20, this.afterTime.getPositionY());
                sDonvi.setPosition(this.afterTime.getPositionX() + this.afterTime.getContentSize().width * 0.5 + 50, this.afterTime.getPositionY());
            }
        }
    },

    addAutoStart: function(time){
        this.stopAutoStart();

        var chuc = Math.floor(time / 10);
        var donvi = Math.floor(time % 10);

        var sChuc = new cc.Sprite(this.getImgByNum(chuc));
        var sDonvi = new cc.Sprite(this.getImgByNum(donvi));

        this.panelCenter.addChild(sChuc,21,21);
        this.panelCenter.addChild(sDonvi,22,22);

        if(chuc == 0)
        {
            sChuc.setVisible(false);
            this.updatePosTime(time);
        }
        else
        {
            this.updatePosTime(time);
        }

        this.autoStart = time;

        this.callbackAuto = function(){
            this.autoStart--;
            gamedata.gameLogic.gameTime--;
            if(this.autoStart < 0)
                return;
            var chuc = Math.floor(this.autoStart / 10);
            var donvi = Math.floor(this.autoStart % 10);

            var sChuc = this.panelCenter.getChildByTag(21);
            var sDonvi = this.panelCenter.getChildByTag(22);
            if(sChuc && sDonvi)
            {
                sChuc.setTexture(this.getImgByNum(chuc));
                sDonvi.setTexture(this.getImgByNum(donvi));
                this.updatePosTime(time);
            }
        }

        this.afterTime.cleanup();
        this.afterTime.runAction(new cc.RepeatForever(cc.sequence(cc.delayTime(1),cc.callFunc(this.callbackAuto.bind(this),this,null))));
    },

    getImgByNum: function(num) {
        return "res/Other/poker/start_"+num+".png";
    },

    stopAutoStart: function(){
        if (this.panelCenter.getChildByTag(20))
        {
            this.panelCenter.getChildByTag(20).stopAllActions();
            this.panelCenter.getChildByTag(20).removeFromParent();
        }
        if (this.panelCenter.getChildByTag(21))
        {
            this.panelCenter.getChildByTag(21).removeFromParent();
        }
        if (this.panelCenter.getChildByTag(22))
        {
            this.panelCenter.getChildByTag(22).removeFromParent();
        }
        this.afterTime.cleanup();
    },

    genDot: function(){

        if(this.countGenDot >= 3) {
            this.countGenDot = 0;
            for(var i = 0; i < 3; i++)
                this.waitDot[i].setVisible(false);
        }
        else
        {
            this.waitDot[this.countGenDot].setVisible(true);
            this.countGenDot++;
        }
        this.waitOtherPlayer.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(function (){
            this.genDot();
        }.bind(this))));
    },

    updateWaitOther: function() {
        for(var i = 0; i < 4; i++)
            cc.log("STATE NE %i ", gamedata.gameLogic.players[i].state);
        var wait = (gamedata.gameLogic.state != GameStateMaubinh.GAME_PLAYING && gamedata.gameLogic.state!= GameStateMaubinh.GAME_EFFECT &&
            gamedata.gameLogic.state != GameStateMaubinh.GAME_COMPARE && gamedata.gameLogic.getNumPlayer() < 2);
        cc.log("WAIT " + wait + " " + gamedata.gameLogic.state + " " + gamedata.gameLogic.getNumPlayer());
        this.waitOtherPlayer.setVisible(wait);
        this.waitOtherPlayer.cleanup();
        if(wait)
        {
            this.waitOtherPlayer.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(function (){
                this.genDot();
            }.bind(this))));
        }
        else
        {
            for(var i = 0; i < 3; i++)
                this.waitDot[i].setVisible(false);
        }
    },

    newGame: function() {
        // NEu dang choi hoac dang trong dem time thi ko can new game
        if(!gamedata.gameLogic) {
            return;
        }

        if(!gamedata.gameLogic.isViewing && (gamedata.gameLogic.state == GameStateMaubinh.GAME_PLAYING || gamedata.gameLogic.state == GameStateMaubinh.GAME_TIMING)) {
            return;
        }

        cc.log("NEW GAME NAY ******** ");
        this.waitOtherPlayer.setVisible(false);
        this.afterTime.setVisible(false);
        this.imageChi.setVisible(false);
        this.btnArrange.setVisible(false);
        this.finishImage.setVisible(false);
        this.btnStart.setVisible(false);
        this.waitNewGame.setVisible(false);
        this.bgClock.setVisible(false);
        this.labelClock.setVisible(false);
        this.labelClock.cleanup();
        this.stopAutoStart();
        this.btnQuit.getChildByName("btnQuitSelect").setVisible(false);

        for(var i = 0; i < 3; i++) {
            this.waitDot[i].setVisible(false);

        }

        var i;
        gamedata.gameLogic.newGame();
        for(i = 0; i < 4; i++)
        {
            this.players[i].newGame();
        }

        //remove effect jackpot
        // de xac dinh dang chia 2 la dau trong truong hop view game thi bo qua luon

        this.updateWaitOther();
    },

    updateStartBtn: function() {
        cc.log("FUNCTION UDATE START BUTTON " + gamedata.gameLogic.roomOwner + "  " + gamedata.gameLogic.myChair + " num " + gamedata.gameLogic.getNumPlayer() + " state " +gamedata.gameLogic.state );
        cc.log("UPDATE START BUTTON " + (gamedata.gameLogic.roomOwner == gamedata.gameLogic.myChair) + "  " + gamedata.gameLogic.getNumPlayer() >= 2);
        if (gamedata.gameLogic.state != GameStateMaubinh.GAME_PLAYING && gamedata.gameLogic.state != GameStateMaubinh.GAME_EFFECT && gamedata.gameLogic.state!= GameStateMaubinh.GAME_COMPARE
            && gamedata.gameLogic.roomOwner == gamedata.gameLogic.myChair && gamedata.gameLogic.getNumPlayer() >= 2) {
            this.btnStart.setVisible(true);
            this.waitOtherPlayer.setVisible(false);
            cc.log("HIEN BUTTON");

        } else
        {
            this.btnStart.setVisible(false);
        }
    },

    finishDealCard: function() {
        if(gamedata.gameLogic.typeRoom == 0)
        {
            SceneMgr.getInstance().openGUI(MaubinhArrangeLayer.className, 100, 100, false);
            this.btnArrange.setVisible(false);
        }
        else
        {
            var layer = SceneMgr.getInstance().getGUI(100);
            layer.finishDealCard();
        }
        this.players[0].setVisible(false);
    },

    updateIdCard: function() {

        if(gamedata.gameLogic.typeRoom == 0 && gamedata.gameLogic.state == GameStateMaubinh.GAME_PLAYING)
        {
            this.btnArrange.setVisible(true);
        }

        this.players[0].setVisible(true);
        this.players[0].setIdCard(gamedata.gameLogic.players[0].cards);
    },

    onUpdateMoney: function (cmd) {
        if (cmd.nChair == -1 || cmd.nChair > 4)
            return;

        var localChair = gamedata.gameLogic.convertChair(cmd.nChair);
        if((localChair>= 0) && (localChair < 4) && (gamedata.gameLogic.players[localChair].info)){
            gamedata.gameLogic.players[localChair].info["bean"] = cmd.bean;
            gamedata.gameLogic.players[localChair].info["exp"] = cmd.levelScore;
            gamedata.gameLogic.players[localChair].info["winCount"] = cmd.winCount;
            gamedata.gameLogic.players[localChair].info["lostCount"] = cmd.lostCount;
            gamedata.gameLogic.players[localChair].info["level"] = cmd.level;
            gamedata.gameLogic.players[localChair].info["levelExp"] = cmd.levelExp;
            gamedata.gameLogic.players[localChair].active = true;
            this.updateUserInfo(localChair);
        }

    },

    updateUserInfo: function(chair){
        this.players[chair].updateUserInfo();
    },

    isBinhLung: function() {
        return this.players[0].getTypeMauBinh() == MaubinhPlayerCard.EM_BINHLUNG;
    },

    callbackVisibleCardBinh: function(){
        for (var i = 0; i < 4; i++)
        {
            var _typeMaubinh = -1;
            cc.log("STATE %i ", gamedata.gameLogic.players[i].state);
            if (gamedata.gameLogic.players[i].state == Player.PLAYING)
            {
                _typeMaubinh = this.players[i].getTypeMauBinh();
                cc.log("TYPE MAU BINH %i ", _typeMaubinh);
                if (_typeMaubinh == MaubinhPlayerCard.EM_LUCPHEBON || _typeMaubinh == MaubinhPlayerCard.EM_SANHRONG || _typeMaubinh == MaubinhPlayerCard.EM_3SANH
                    || _typeMaubinh == MaubinhPlayerCard.EM_3THUNG || _typeMaubinh == MaubinhPlayerCard.EM_MUOI_HAI || _typeMaubinh == MaubinhPlayerCard.EM_MUOI_BA)
                {
                    this.players[i].visibleAllCard();
                }
            }

        }

        this.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(this.callbackAppearBinh.bind(this))));

    },

    callbackAppearBinh: function(){
        if (gamedata.gameLogic.state != GameStateMaubinh.GAME_COMPARE)
            return;
        var countMaubinh = 0;
        var typeMaubinh;

        cc.log("CALL BACK APPEAR BINH");
        var myMaubinh = false;
        for (var i = 0; i < 4; i++)
        {
            var _typeMaubinh = -1;
            if (i == 0 && !gamedata.gameLogic.isViewing)
            {
                _typeMaubinh = this.players[i].getTypeMauBinh();
                myMaubinh = true;
            }
            else if (gamedata.gameLogic.players[i].state == Player.PLAYING)
            {
                _typeMaubinh = this.players[i].getTypeMauBinh();

            }
            cc.log("TYPE MAU BINH " + _typeMaubinh);
            if (_typeMaubinh == MaubinhPlayerCard.EM_LUCPHEBON || _typeMaubinh == MaubinhPlayerCard.EM_SANHRONG || _typeMaubinh == MaubinhPlayerCard.EM_3SANH
                || _typeMaubinh == MaubinhPlayerCard.EM_3THUNG || _typeMaubinh == MaubinhPlayerCard.EM_MUOI_BA || _typeMaubinh == MaubinhPlayerCard.EM_MUOI_HAI)
            {
                countMaubinh++;
                typeMaubinh = _typeMaubinh;
            }
        }

        if (countMaubinh >= 1)
        {
            this.bgDark.setVisible(true);
        }

        cc.log("COUNT MAU BINH " + countMaubinh);
        if (countMaubinh == 1)
        {
            switch (typeMaubinh)
            {
                case MaubinhPlayerCard.EM_LUCPHEBON:
                    this.effectMauBinh("Lucphebon", "1");
                    if (!myMaubinh)
                        gameSound.playSoundbaobinh_lucphebon();
                    break;
                case MaubinhPlayerCard.EM_SANHRONG:
                    this.effectMauBinh("Sanhrong", "1");
                    if (!myMaubinh)
                        gameSound.playSoundbaobinh_sanhrong();
                    break;
                case MaubinhPlayerCard.EM_3SANH:
                    this.effectMauBinh("Bacaisanh", "1");
                    if (!myMaubinh)
                        gameSound.playSoundbaobinh_3caisanh();
                    break;
                case MaubinhPlayerCard.EM_3THUNG:
                    this.effectMauBinh("Bacaithung", "1");
                    if (!myMaubinh)
                        gameSound.playSoundbaobinh_3caithung();
                    break;
                case MaubinhPlayerCard.EM_MUOI_BA:
                    this.effectMauBinh("13quandongmau", "1");
                    if (!myMaubinh)
                        gameSound.playSoundbaobinh_13caydongmau();
                    break;
                case MaubinhPlayerCard.EM_MUOI_HAI:
                    this.effectMauBinh("13quandongmau", "2");
                    if (!myMaubinh)
                        gameSound.playSoundbaobinh_12caydongmau();
                    break;

                default:
                    break;
            }
        }
        else if (countMaubinh > 1 && !myMaubinh)
        {
            gameSound.playSoundThua();
        }

        for (var i = 0; i < 4; i++)
        {
            if (gamedata.gameLogic.players[i].state == Player.PLAYING)
            {
                cc.log("MONEY *** " + gamedata.gameLogic.money[i]);
                this.players[i].soBai(true, gamedata.gameLogic.money[i], countMaubinh);
            }
        }

        var count = 0;
        for (var i = 0; i < 4; i++)
        {
            if (gamedata.gameLogic.players[i].isCompareBai)
                count++;
        }

        if (gamedata.gameLogic.getNumPlayerPlaying() - 1 <= count)
        {
            for (var i = 0; i < 4; i++)
            {
                if (gamedata.gameLogic.players[i].state == Player.PLAYING)
                {
                    this.players[i].visibleAllCard();
                    if (!gamedata.gameLogic.players[i].isCompareBai)
                        this.players[i].setDark(true);
                }

            }
        }

    },

    onCompleteEffect: function(animation){
        animation.removeFromParent();
    },

    onCompleteMaubinh: function(animation){
        animation.removeFromParent();
        this.bgDark.setVisible(false);

        for (var i = 0; i < 4; i++)
        {
            var _typeMaubinh = -1;
            if (gamedata.gameLogic.players[i].state == Player.PLAYING)
            {
                _typeMaubinh = this.players[i].getTypeMauBinh();

            }
            if (_typeMaubinh == MaubinhPlayerCard.EM_LUCPHEBON || _typeMaubinh == MaubinhPlayerCard.EM_SANHRONG || _typeMaubinh == MaubinhPlayerCard.EM_3SANH
                || _typeMaubinh == MaubinhPlayerCard.EM_3THUNG || _typeMaubinh == MaubinhPlayerCard.EM_MUOI_BA || _typeMaubinh == MaubinhPlayerCard.EM_MUOI_HAI)
            {
                this.players[i].showAmatureMaubinh();
            }
        }
    },

    showAmatureMaubinh: function(){
        if(!this.amatureBinh)
        {
            this.amatureBinh = db.DBCCFactory.getInstance().buildArmatureNode("Maubinh");
            this.amatureBinh.setScale(0.6);
            this.addChild(this.amatureBinh, 10);

            switch (type)
            {
                case 0:
                {
                    this.amatureBinh.setPositionX(this.uiAvatar.getPositionX());
                    this.amatureBinh.setPositionY(this.uiAvatar.getPositionY() - this.vip.getContentSize().height * 0.65);
                }
                    break;
                case 1:
                {
                    this.amatureBinh.setPositionX(this.uiAvatar.getPositionX());
                    this.amatureBinh.setPositionY(this.uiAvatar.getPositionY() + this.vip.getContentSize().height * 0.65);
                }
                    break;
                case 2:
                {
                    this.amatureBinh.setPositionX(this.uiAvatar.getPositionX());
                    this.amatureBinh.setPositionY(this.uiAvatar.getPositionY() - this.vip.getContentSize().height * 0.65);
                }
                    break;
                case 3:
                {
                    this.amatureBinh.setPositionX(this.uiAvatar.getPositionX());
                    this.amatureBinh.setPositionY(this.uiAvatar.getPositionY() + this.vip.getContentSize().height * 0.65);
                }
                    break;
                default:
                    break;
            }
        }
        this.setVisible(true);
        this.getAnimation().gotoAndPlay("1", -1, -1, -1);

    },

    effectMauBinh: function(resource, animation, isMaubinh){
        if(isMaubinh == null)
            isMaubinh = true;
        var j = db.DBCCFactory.getInstance().buildArmatureNode(resource);
        j.setPosition(cc.p(this.panelCenter.getContentSize().width * 0.5, this.panelCenter.getContentSize().height * 0.3));
        if(isMaubinh)
            j.setCompleteListener(this.onCompleteMaubinh.bind(this));
        else
            j.setCompleteListener(this.onCompleteEffect.bind(this));
        j.getAnimation().gotoAndPlay(animation, -1, -1, 1);
        this.panelCenter.addChild(j, 10);
    },

    quitGame: function()
    {
        if(typeof gamedata.gameLogic.reasonKick == "undefined")
        {
            SceneMgr.getInstance().openScene(LobbyScene.className);
            gamedata.gameLogic = new GameLogic();
        }
        else
        {

        }
        if (Config.ENABLE_EVENT_TET) {
            // eventTet.checkOpenEvent();
        }
    },

    updateJackpot: function() {
        cc.log("CHANGE JACKPOT " + gamedata.changeJackpot);
        gamedata.oldJackpot = gamedata.oldJackpot + gamedata.changeJackpot;
        if(Math.abs(gamedata.oldJackpot - gamedata.jackpotValue) <= Math.abs(gamedata.changeJackpot))
        {
            gamedata.oldJackpot = gamedata.jackpotValue;
        }
        else
        {
            this.labelJackpot.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(this.updateJackpot.bind(this))));
        }
        var s = StringUtility.standartNumber(gamedata.oldJackpot) + "$";
        this.labelJackpot.setString(s);
    },

    callbackVisible: function(sender){
        sender.setVisible(false);
    },

    showExp: function(exp){
        this.players[0].showExp(exp);
    },

    onBack: function () {
        // if (sceneMgr.checkBackAvailable([BoardVoucherGUI.className]))
        //     return;

        var state = gamedata.gameLogic.state;
        if(state == GameStateMaubinh.GAME_WAITING || state == GameStateMaubinh.GAME_TIMING || gamedata.gameLogic.isViewing || state == GameStateMaubinh.GAME_EFFECT )
        {
            var pkQuit = new CmdSendQuitRoom();
            GameClient.getInstance().sendPacket(pkQuit);
            pkQuit.clean();
        }
        else
        {
            //GUIManager::getInstance().guiDialog.showGUI(CCLocalizedString("CONFIRM_QUIT_ROOM").c_str(), &sendQuitRoom, false);
            if(this.btnQuit.getChildByName("btnQuitSelect").isVisible())
            {
                var pkQuit = new CmdSendNotRegQuit();
                GameClient.getInstance().sendPacket(pkQuit);
                pkQuit.clean();


            }
            else
            {
                var pkQuit = new CmdSendRegQuit();
                GameClient.getInstance().sendPacket(pkQuit);
                pkQuit.clean();
            }
        }
    },

    updateGroupButton: function(){
        if (gamedata.gameLogic.typeRoom == 0) {
            this.btnJackpot.setPositionX(this.btnHelp.getPositionX() + this.btnHelp.getContentSize().width * 0.5 - this.btnJackpot.getContentSize().width * 0.5);
            this.btnHelp.setVisible(false);
        }
        else {
            this.btnJackpot.setPositionX(this.btnHelp.getPositionX() - 3 - this.btnHelp.getContentSize().width * 0.5 - this.btnJackpot.getContentSize().width * 0.5);
            this.btnHelp.setVisible(true);
        }
    },

    onUpdateGUI: function(data) {
        if (!gamedata.gameLogic)
            return;
        cc.log("GAME STATE NE " + gamedata.gameLogic.gameState);
        switch (gamedata.gameLogic.gameState) {
            case GameState.JOINROOM:
            {
                var muccuoc = ccui.Helper.seekWidgetByName(this._layout,"bet");
                var ban = ccui.Helper.seekWidgetByName(this._layout,"room");

                for(var i=0;i<4;i++)
                {
                    this.players[i].updateWithPlayer(gamedata.gameLogic.players[i]);
                    this.players[i].uiHome.setVisible(false);
                    this.players[i].updateItem(gamedata.gameLogic.players[i].item);
                }
                this.newGame();
                ban.setString(StringUtility.pointNumber(gamedata.gameLogic.roomIndex));
                cc.log("muc tien cuoc: " + gamedata.selectedChanel, JSON.stringify(ChanelConfig.instance().chanelConfig[gamedata.selectedChanel]));
                muccuoc.setString(StringUtility.formatNumberSymbol(ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].bet[gamedata.gameLogic.bet]) + "$");

                var index = gamedata.gameLogic.convertChair(gamedata.gameLogic.roomOwner);
                cc.log("INDEX " + index );
                if(index >= 0)
                    this.players[gamedata.gameLogic.convertChair(gamedata.gameLogic.roomOwner)].uiHome.setVisible(true);

                var randValue = Math.floor(Math.random() * 2);
                if (randValue == 0)
                    gameSound.playSoundchaomung_1();
                else
                    gameSound.playSoundchaomung_2();

                if (gamedata.gameLogic.typeRoom == 0)
                {
                    this.logoGame.loadTexture("poker/logoTruyenThong.png");
                }
                else
                {
                    this.logoGame.loadTexture("poker/logoTinhAt.png");
                }

                this.waitOtherPlayer.setVisible(false);
                if(gamedata.gameLogic.players[0].state == Player.VIEWING)
                {
                    this.waitOtherPlayer.setVisible(false);
                }
                for (var i = 0; i < 4; i++)
                {
                    var p = gamedata.gameLogic.players[i];
                    if (p.status > 0) {
                        if (p.status == 5) {
                            this.players[i].setType(Player.VIEWING);
                        } else {
                            this.players[i].setType(Player.PLAYING);
                        }
                    } else {
                        this.players[i].setType(Player.NONE);
                    }
                }
                this.updateWaitOther();
                break;
            }
            case GameState.CHIABAI:
            {
                cc.log("UPDATE CHIA BAI ");
                this.newGame();
                gamedata.gameLogic.state = GameStateMaubinh.GAME_PLAYING;
                this.afterTime.setVisible(false);
                this.btnStart.setVisible(false);
                gameSound.playSoundstart_1();
                this.stopAutoStart();
                if (gamedata.gameLogic.typeRoom == 1)
                {
                    SceneMgr.getInstance().openGUI(MaubinhAtLayer.className, 100, 100, false);
                    this.players[0].setVisible(false);

                }

                for (var i = 0; i < 4; i++)
                {
                    if(gamedata.gameLogic.players[i].state == Player.PLAYING)
                    {
                        this.players[i].startGame();
                        this.players[i].unReady();
                        this.effect2D.chiabai(this.players[i]);
                    }
                }

                break;

            }
            case GameState.USERJOIN:
            {
                this.players[gamedata.gameLogic.activeLocalChair].updateWithPlayer(gamedata.gameLogic.players[gamedata.gameLogic.activeLocalChair]);
                this.players[gamedata.gameLogic.activeLocalChair].updateItem(gamedata.gameLogic.players[gamedata.gameLogic.activeLocalChair].item);
                if (gamedata.gameLogic.players[gamedata.gameLogic.activeLocalChair].status == 5)
                    this.players[gamedata.gameLogic.activeLocalChair].setType(Player.VIEWING);
                else
                    this.players[gamedata.gameLogic.activeLocalChair].setType(Player.PLAYING);
                break;

            }
            case GameState.AUTOSTART:
            {
                if (gamedata.gameLogic.isAutoStart) {
                    this.newGame();
                    this.waitOtherPlayer.setVisible(false);
                    this.waitOtherPlayer.cleanup();
                    for(var i = 0; i < 3; i++)
                        this.waitDot[i].setVisible(false);
                    this.afterTime.setVisible(true);
                    cc.log("ITME STASRT " + gamedata.gameLogic.timeAutoStart);
                    this.addAutoStart(gamedata.gameLogic.timeAutoStart);
                }
                else
                {
                    this.stopAutoStart();
                    this.afterTime.setVisible(false);
                }

                // cap nhat lai thong tin ban choi vi goi tin Autostart den truoc khi cap nhat thong tin o goi joinRoom
                if (!cc.sys.isNative){
                    if (gamedata.gameLogic.typeRoom === 0)
                    {
                        this.logoGame.loadTexture("poker/logoTruyenThong.png");
                    }
                    else
                    {
                        this.logoGame.loadTexture("poker/logoTinhAt.png");
                    }
                    muccuoc = ccui.Helper.seekWidgetByName(this._layout,"bet");
                    ban = ccui.Helper.seekWidgetByName(this._layout,"room");
                    ban.setString("");
                    muccuoc.setString("");
                    ban.setString(StringUtility.pointNumber(gamedata.gameLogic.roomIndex));
                    muccuoc.setString(StringUtility.formatNumberSymbol(ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].bet[gamedata.gameLogic.bet]) + "$");

                    for(var i=0;i<4;i++)
                    {
                        this.players[i].updateWithPlayer(gamedata.gameLogic.players[i]);
                        //  this._players[i].addVipEffect();
                    }
                }

                this.updateStartBtn();
                break;

            }

            case GameState.READY:
            {
                if(gamedata.gameLogic.chairReady == 0)
                {
                    this.bgClock.setVisible(true);
                    this.labelClock.setVisible(true);
                    this.labelClock.cleanup();
                    this.labelClock.setString(gamedata.gameLogic.gameTime);
                    this.callbackAuto = function(){
                        gamedata.gameLogic.gameTime--;
                        if (gamedata.gameLogic.gameTime < 0) {
                            this.labelClock.stopAllActions();
                            return;
                        }
                        this.labelClock.setString(gamedata.gameLogic.gameTime);
                    }
                    this.labelClock.runAction(new cc.RepeatForever(cc.sequence(cc.delayTime(1),cc.callFunc(this.callbackAuto.bind(this),this,null))));
                    var arrangeLayer = SceneMgr.getInstance().getGUI(100);
                    if(arrangeLayer)
                    {
                        this.players[0].setIdCard(arrangeLayer.arrayId);
                        arrangeLayer.removeFromParent(true);
                    }
                    if(gamedata.gameLogic.typeRoom == 0)
                    {
                        this.btnArrange.setVisible(true);
                    }
                    this.players[0].showBinhEndCard();
                }
                this.players[gamedata.gameLogic.chairReady].ready();
                this.players[gamedata.gameLogic.chairReady].setVisible(true);
                break;
            }

            case GameState.UN_READY:
            {
                cc.log("UPDATE UN_READY ");
                this.players[gamedata.gameLogic.chairUnReady].unReady();
                if(gamedata.gameLogic.chairUnReady == 0)
                {
                    this.finishDealCard();
                    this.labelClock.setVisible(false);
                    this.bgClock.setVisible(false);
                    this.labelClock.cleanup();
                }
                break;
            }

            case GameState.END_CARD:
            {
                cc.log("UPDATE END CARD ");
                if (gamedata.gameLogic.chairEndCard == 0)
                {
                    this.players[gamedata.gameLogic.chairEndCard].setIdCard(gamedata.gameLogic.players[0].cards);
                    this.players[gamedata.gameLogic.chairEndCard].arranged.setVisible(false);
                    this.players[gamedata.gameLogic.chairEndCard].setAvatarOpacity(50);
                }
                else{
                    this.players[gamedata.gameLogic.chairEndCard].endCard(gamedata.gameLogic.players[gamedata.gameLogic.chairEndCard].cards);
                }
                this.players[gamedata.gameLogic.chairEndCard].setVisible(true);

                var arrangeLayer = SceneMgr.getInstance().getGUI(100);
                if(arrangeLayer)
                {
                    arrangeLayer.removeFromParent(true);
                }

                if(!gamedata.gameLogic.isViewing)
                    this.players[0].setVisible(true);

                this.stopAutoStart();
                this.btnArrange.setVisible(false);
                this.bgClock.setVisible(false);
                this.labelClock.setVisible(false);
                this.labelClock.cleanup();
                break;
            }

            case GameState.CHI_INDEX:
            {
                if (gamedata.gameLogic.state != GameStateMaubinh.GAME_COMPARE)
                    return;
                if (gamedata.gameLogic.chi <= 0)
                    return;

                var i;
                for (i = 0; i < 4; i++)
                {
                    if (gamedata.gameLogic.players[i].state == Player.PLAYING)
                        this.players[i].chiIndex(gamedata.gameLogic.chi);
                }

                if(gamedata.gameLogic.chi < 4)
                {
                    var s = "poker/chi_%num.png";
                    s = StringUtility.replaceAll(s, "%num", gamedata.gameLogic.chi);
                    this.imageChi.setVisible(true);
                    this.imageChi.cleanup();
                    this.imageChi.loadTexture(s);
                    this.imageChi.setOpacity(0);
                    this.imageChi.runAction(cc.fadeIn(0.3));
                }
                else{
                    this.imageChi.setVisible(false);
                }
                break;
            }

            case GameState.COMPARE_CHI:
            {
                if (gamedata.gameLogic.state != GameStateMaubinh.GAME_COMPARE)
                    return;

                var valueRand = Math.floor(Math.random() * 3);
                if (valueRand == 0)
                {
                    gameSound.playSoundsobai_00();
                }
                else if (valueRand == 1)
                {
                    gameSound.playSoundsobai_00();
                }
                else{
                    gameSound.playSoundsobai_00();
                }

                // Thang id dau tien la id cua minh
                var countChi = 0;
                if (gamedata.gameLogic.chi != 4) {

                    for (var i = 0; i < 4; i++) {
                        if (gamedata.gameLogic.isViewing || gamedata.gameLogic.players[0].isCompareBai) {

                            if (gamedata.gameLogic.players[i].state == Player.PLAYING && !gamedata.gameLogic.players[i].isCompareBai) {
                                this.players[i].compareChi(gamedata.gameLogic.chi, gamedata.gameLogic.money[i], -2);
                            }
                        }
                        else {
                            if (i == 0 && !gamedata.gameLogic.players[0].isCompareBai) {
                                //myPlayer.compareChi(pkSoChiNew.chi, pkSoChiNew.Money[i], true);
                            }
                            else {
                                if (gamedata.gameLogic.players[i].state == Player.PLAYING && !gamedata.gameLogic.players[i].isCompareBai) {
                                    this.players[i].compareChi(gamedata.gameLogic.chi, gamedata.gameLogic.money[i], -gamedata.gameLogic.result[i]);

                                    if (gamedata.gameLogic.result[i] == 1) // minh so voi no la thang
                                        countChi = countChi + this.players[0].getNumChi(gamedata.gameLogic.chi);
                                    else if (gamedata.gameLogic.result[i] == -1) // minh so voi no la thua
                                        countChi = countChi - this.players[i].getNumChi(gamedata.gameLogic.chi);
                                }
                            }
                        }
                    }

                    cc.log("MONEY GAME " + JSON.stringify(gamedata.gameLogic.money));
                    if (!gamedata.gameLogic.isViewing && !gamedata.gameLogic.players[0].isCompareBai) {
                        var result;
                        if (gamedata.gameLogic.money[0] == 0) {
                            if (countChi > 0)
                                result = 1;
                            else if (countChi < 0)
                                result = -1;
                            else
                                result = 0;
                        }
                        else {
                            if (gamedata.gameLogic.money[0] > 0) {
                                result = 1;
                            }
                            else {
                                result = -1;
                            }

                        }
                        this.players[0].compareChi(gamedata.gameLogic.chi, gamedata.gameLogic.money[0], result);
                    }
                }
                break;
            }
            case GameState.SUMMARY:
            {
                if (gamedata.gameLogic.state != GameStateMaubinh.GAME_COMPARE)
                    return;
                cc.log("NOTIFY SUMMARY ");
                var i;
                this.imageChi.setVisible(false);
                this.bgDark.setVisible(false);
                this.finishImage.setVisible(true);
                this.finishImage.setScale(0.2);
                this.finishImage.cleanup();
                this.finishImage.runAction(cc.scaleTo(0.3, 1, 1));

                for (i = 0; i < 4; i++) {
                    if (i == 0 && !gamedata.gameLogic.isViewing) {
                        var randValue = Math.floor(Math.random() * 3);
                        if (gamedata.gameLogic.money[i] >= 0)
                        {
                            gameSound.playSounds_win();
                            switch (randValue)
                            {
                                case 0:
                                    gameSound.playSoundwin_1();
                                    break;
                                case 1:
                                    gameSound.playSoundwin_2();
                                    break;
                                case 2:
                                    gameSound.playSoundwin_3();
                                    break;
                                default:
                                    break;
                            }
                        }
                        else
                        {
                            gameSound.playSounds_lose();
                            gameSound.playSoundThua();
                            //switch (randValue)
                            //{
                            //    case 0:
                            //        gameSound.playSoundThua();
                            //        break;
                            //    case 1:
                            //        gameSound.playSoundThua_2();
                            //        break;
                            //    case 2:
                            //        gameSound.playSoundThua_3();
                            //        break;
                            //    default:
                            //        break;
                            //}
                        }
                    }
                    if (gamedata.gameLogic.players[i].state == Player.PLAYING) {
                        this.players[i].endCompareChi(true);
                        this.players[i].effectMoney(gamedata.gameLogic.money[i], 0);
                        this.players[i].showResult(gamedata.gameLogic.money[i]);
                    }
                }
                break;

            }
            case GameState.SAP_BAI:
            {
                if (gamedata.gameLogic.state != GameStateMaubinh.GAME_COMPARE)
                    return;
                var myMoney = 0;
                var effectSap = false;
                var i;
                this.imageChi.setVisible(false);
                var isSap = false;
                cc.log("SAP BAI ********** ")
                if (gamedata.gameLogic.Sapbai[0] != -1 && gamedata.gameLogic.Sapbai[0] < 200)
                {
                    // Nguoi choi tham gia vao qua trinh bat sap
                    for (i = 0; i < 4; i++) {
                        if (gamedata.gameLogic.players[i].state == Player.PLAYING)
                            this.players[i].endCompareChi();

                        if (i != 0)
                        {
                            cc.log("PLAYING " + gamedata.gameLogic.players[i].state + "SAP BAI " + gamedata.gameLogic.Sapbai[i]);
                            if (gamedata.gameLogic.players[i].state == Player.PLAYING && gamedata.gameLogic.Sapbai[i] == 1) {
                                // 1 la ghe nay bi sap minh
                                isSap = true;
                                this.players[i].effectMoney(gamedata.gameLogic.money[i], 0, -1);
                                this.players[i].effectSap3Chi();
                                cc.log("EFFECT SAP ");
                            }
                            else if (gamedata.gameLogic.players[i].state == Player.PLAYING && gamedata.gameLogic.Sapbai[i] == 0) {
                                // 0 la ghe nay bat sap minh
                                effectSap = true;
                                this.players[i].effectMoney(gamedata.gameLogic.money[i], 0, 1);
                            }
                        }
                        else
                        {
                            myMoney = gamedata.gameLogic.money[i];
                        }
                    }
                }
                else
                {
                    for (i = 0; i < 4; i++) {
                        if (gamedata.gameLogic.players[i].state == Player.PLAYING)
                            this.players[i].endCompareChi();

                        if (i != 0)
                        {
                            if (gamedata.gameLogic.players[i].state == Player.PLAYING && gamedata.gameLogic.Sapbai[i] == 0) {
                                // 0 la ghe nay bi bat sap
                                isSap = true;
                                this.players[i].effectMoney(gamedata.gameLogic.money[i], 0, -1);
                                this.players[i].effectSap3Chi();
                            }
                            else if (gamedata.gameLogic.players[i].state == Player.PLAYING && gamedata.gameLogic.Sapbai[i] == 1) {
                                // 1 la ghe nay chi di bat sap nguoi khac
                                effectSap = true;
                                this.players[i].effectMoney(gamedata.gameLogic.money[i], 0, 1);
                            }
                        }
                        else
                        {
                            myMoney = gamedata.gameLogic.money[0];
                        }

                    }
                }

                if(this.players[0].state == Player.PLAYING)
                    this.players[0].endCompareChi();

                if (gamedata.gameLogic.Sapbai[0] != -1 && gamedata.gameLogic.Sapbai[0] < 200)
                {
                    if (isSap)
                    {
                        if (effectSap)
                        {
                            this.players[0].effectMoney(myMoney, 0);
                            this.players[0].effectSap3Chi(true);

                            gameSound.playSoundsaproi();
                        }
                        else
                        {
                            this.players[0].effectMoney(myMoney, 0);
                        }

                        if (isSap && !effectSap)
                        {
                            gameSound.playSoundbatsapnay();
                        }
                    }
                    else
                    {
                        this.players[0].effectMoney(myMoney, 0, -1);

                        if (effectSap) {
                            this.players[0].effectSap3Chi(false);
                            gameSound.playSoundsaproi();
                        }
                    }
                }
                break;
            }

            case GameState.GAME_END:
            {
                cc.log("GAME END *********** ");
                this.finishImage.setVisible(false);
                var i;
                for (i = 0; i < 4; i++) {
                    if (gamedata.gameLogic.players[i].state == Player.VIEWING) {

                        this.players[i].setType(Player.PLAYING);
                        gamedata.gameLogic.players[i].state = Player.PLAYING;
                        gamedata.gameLogic.players[i].status = 1;
                    }
                }

                gamedata.gameLogic.isViewing = false;
                this.newGame();

                var randValue = Math.floor(Math.random() * 3);
                switch (randValue)
                {
                    case 1:
                        gameSound.playSoundrematch_1();
                        break;
                    case 2:
                        gameSound.playSoundrematch_2();
                        break;
                    case 3:
                        gameSound.playSoundrematch_3();
                        break;
                    default:
                        break;
                }
                break;
            }

            case GameState.SO_BAI:
            {
                var i;
                if (gamedata.gameLogic.state == GameStateMaubinh.GAME_VIEWING)
                    return;

                cc.log("SO BAI ******* ");
                if (gamedata.gameLogic.isMauBinh)
                {
                    this.finishImage.setVisible(true);
                    this.finishImage.setOpacity(0.0);
                    this.finishImage.cleanup();
                    this.finishImage.runAction(cc.scaleTo(0.3, 1, 1));
                    this.finishImage.runAction(cc.sequence(cc.fadeIn(0.2), cc.delayTime(0.5), cc.fadeOut(0.3), cc.callFunc(function(){
                        this.callbackVisibleCardBinh();
                    }.bind(this))));
                    return;

                }

                for(i = 0; i<4; i++)
                {
                    if(gamedata.gameLogic.players[i].state == Player.PLAYING)
                    {
                        this.players[i].soBai(gamedata.gameLogic.isMaubinh, gamedata.gameLogic.money[i], 0);
                    }
                }

                var count = 0;
                for(var i = 0; i< 4; i++)
                {
                    cc.log("IS COMPARRE BAI " + gamedata.gameLogic.players[i].isCompareBai);
                    if(gamedata.gameLogic.players[i].isCompareBai)
                    {

                        count++;
                    }

                }

                cc.log("NUM PLAYING " + gamedata.gameLogic.getNumPlayerPlaying() + "COUNT COMPARE " + count);
                cc.log("VI SAO LAI THE ");
                if(gamedata.gameLogic.getNumPlayerPlaying() - 1 <= count)
                {
                    for(i = 0; i<4; i++)
                    {
                        cc.log("PLAYER STATE " + i + " " + gamedata.gameLogic.players[i].state);
                        if(gamedata.gameLogic.players[i].state == Player.PLAYING)
                        {
                            this.players[i].visibleAllCard();
                        }
                    }
                }
                break;
            }

            case GameState.BINH_SO_BAI:
            {
                if (gamedata.gameLogic.state == GameStateMaubinh.GAME_VIEWING)
                    return;
                this.finishImage.setVisible(true);
                this.finishImage.setOpacity(0.0);
                this.finishImage.cleanup();
                this.finishImage.runAction(cc.scaleTo(0.3, 1, 1));
                this.finishImage.runAction(cc.sequence(cc.fadeIn(0.2), cc.delayTime(0.5), cc.fadeOut(0.3), cc.callFunc(function(){
                    this.callbackVisibleCardBinh();
                }.bind(this))));
                break;
            }

            case GameState.SAP_LANG:
            {
                if (!gamedata.gameLogic.isViewing)
                {
                    if (gamedata.gameLogic.playerSap == 0) // ghe cua minh
                    {
                        for (var i = 0; i < 4; i++)
                        {
                            if (i == 0)
                            {
                                this.players[i].effectMoney(gamedata.gameLogic.money[i], 0, 1);
                            }
                            else if (this.players[i].state == Player.PLAYING && i != 0)
                            {
                                this.players[i].effectMoney(gamedata.gameLogic.money[i], 0, -1);
                            }
                            this.players[i].imageSap.setVisible(false);
                        }
                        this.effectMauBinh("batsaplang", "1");
                    }
                    else
                    {
                        for (var i = 0; i < 4; i++)
                        {
                            if (i == gamedata.gameLogic.playerSap)
                            {
                                this.players[i].batSapLang(gamedata.gameLogic.money[i]);
                            }
                            else
                            {
                                this.players[i].effectMoney(gamedata.gameLogic.money[i], 0, -1);
                                this.players[i].imageSap.setVisible(false);
                            }
                        }
                    }

                }
                break;
            }

            case GameState.TINH_AT:
            {
                if (gamedata.gameLogic.state != GameStateMaubinh.GAME_COMPARE)
                    return;

                for (var i = 0; i < 4; i++) {
                    if(gamedata.gameLogic.players[i].state == Player.PLAYING)
                    {
                        this.players[i].endCompareChi(false);
                        if(gamedata.gameLogic.getNumAt(i) > 1)
                        {
                            this.players[i].effectBinhAt(gamedata.gameLogic.money[i], 1);
                        }
                        else if(gamedata.gameLogic.getNumAt(i) == 0)
                        {
                            this.players[i].effectBinhAt(gamedata.gameLogic.money[i], -1);
                        }
                    }
                }
                break;
            }

            case GameState.USERLEAVE:
            {
                this.players[gamedata.gameLogic.userLeaveRoomId].setType(Player.NONE);
                this.updateStartBtn();
                this.updateWaitOther();
                break;
            }

            case GameState.QUIT:
            {
                this.quitGame();
                break;
            }

            case GameState.REQUEST_END_CARD:
            {
                var arrangeLayer = SceneMgr.getInstance().getGUI(100);
                // arrangeLayer.sendCompare(0);

                cc.log("REQUEST END CARD ");
                if(arrangeLayer) {
                    cc.log("SEND END CARD ");
                    arrangeLayer.sendCompare(0);
                }
                break;
            }

            case GameState.REG_QUIT:
            {

                Toast.makeToast(2.5,"Bạn sẽ được thoát khỏi phòng khi ván chơi kết thúc. Nhấn lần nữa để hủy!!!");
                gameSound.playSounde_OutVol();
                this.btnQuit.getChildByName("btnQuitSelect").setVisible(true);


                break;
            }

            case GameState.NOT_REG_QUIT:
            {

                Toast.makeToast(2.5,"Bạn đã hủy đăng ký rời phòng...");
                gameSound.playSounde_OutCan();
                this.btnQuit.getChildByName("btnQuitSelect").setVisible(false);

                break;
            }

            case GameState.KICK_ROOM:
            {
                cc.log("CHAIR KICK " + gamedata.gameLogic.chairKick + " reason " + gamedata.gameLogic.reasonKick);
                if(gamedata.gameLogic.chairKick == 0)
                {
                    var reason;
                    switch (gamedata.gameLogic.reasonKick) {
                        case 0:
                            offerManager.kickInGame = true;
                            reason = LocalizedString.to("QUESTION_CHANGE_GOLD");
                            break;
                        case 6:
                            reason = LocalizedString.to("KICK_NOT_PLAY");
                            break;
                        case 2:
                            reason = LocalizedString.to("KICK_NOT_PLAYER");
                            break;
                        case 1:
                            reason = LocalizedString.to("KICK_NOT_READY");
                            break;
                        case 11:
                            reason = LocalizedString.to("KICK_NOT_INTERACT_SERVER");
                            break;
                        default:
                            reason = LocalizedString.to("KICK_ROOM_ERROR");
                            break;
                    }

                    this.isKick = true;
                    if (gamedata.gameLogic.reasonKick == 0) {
                        if (gamedata.enablepayment != 0) {
                            SceneMgr.getInstance().showChangeGoldDialog(reason, this, function (btnID) {
                                if (btnID == Dialog.BTN_OK) {
                                    //SceneMgr.getInstance().openScene(ShopIapScene.className,sceneMgr._waitingScene,true);
                                    gamedata.openShop(sceneMgr._waitingScene, true);
                                }
                                if (btnID == Dialog.BTN_CANCEL || btnID == Dialog.BTN_QUIT) {
                                    SceneMgr.getInstance().openScene(LobbyScene.className);
                                }
                            });
                        }
                        else {
                            SceneMgr.getInstance().showOkDialogWithAction(reason, this, function (btnID) {
                                if (btnID == Dialog.BTN_OK) {
                                    SceneMgr.getInstance().openScene(LobbyScene.className);
                                }
                            });
                        }
                    }
                    else {
                        SceneMgr.getInstance().showOkDialogWithAction(reason, this, function (btnID) {
                            if (btnID == Dialog.BTN_OK) {
                                SceneMgr.getInstance().openScene(LobbyScene.className);
                            }
                        });
                    }
                }
                else
                {
                    this.players[gamedata.gameLogic.chairKick].setType(Player.NONE);
                    this.updateStartBtn();
                    this.updateWaitOther();
                }

                break;
            }

            case GameState.UPDATE_JACKPOT:
            {
                var s = StringUtility.standartNumber(gamedata.oldJackpot) + "$";
                this.labelJackpot.setString(s);
                this.labelJackpot.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(this.updateJackpot.bind(this))));
                break;
            }

            case GameState.JACKPOT:
            {
                var j = db.DBCCFactory.getInstance().buildArmatureNode("jackpot");
                j.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
                j.setCompleteListener(this.onCompleteEffect.bind(this));
                j.getAnimation().gotoAndPlay("1", -1, -1, 1);
                this.addChild(j, 10);

                for(var i = 0; i < 4; i++)
                {
                    if(gamedata.gameLogic.players[i].state == Player.PLAYING) {
                        this.players[i].endCompareChi(true);
                        if (gamedata.gameLogic.players[i].info["uID"] == gamedata.gameLogic.userIdJackpot) {
                            this.players[i].effectMoney(gamedata.gameLogic.jackpotEat, 0, 1);
                            break;
                        }
                    }
                }

                var particle = new cc.ParticleSystem("Particles/BurstPipe.plist");
                particle.setLocalZOrder(11);
                this.addChild(particle);
                particle.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.9));

                break;
            }

            case GameState.UPDATE_VIEW_GAME:
            {
                if(gamedata.gameLogic.gameStateReturn == 1) // dang choi chu chua so bai
                {
                    gamedata.gameLogic.state = GameStateMaubinh.GAME_PLAYING;
                    if (gamedata.gameLogic.gameTime > 0) {
                        //this.addAutoStart(gamedata.gameLogic.gameTime);

                    } else {
                        // wait next game
                    }

                    for (i = 0; i < 4; i++) {
                        if (gamedata.gameLogic.players[i].state == Player.PLAYING) {

                            if(i != 0)
                            {
                                this.players[i].visibleCardSmall();
                            }

                            if (gamedata.gameLogic.players[i].stateArrange == 1) {
                                this.players[i].ready();

                            } else {
                                this.players[i].unReady();

                            }
                        }
                    }
                }
                else
                {
                    gamedata.gameLogic.state = GameStateMaubinh.GAME_VIEWING;
                    this.waitNewGame.setVisible(true);
                    // visible next game

                }

                break;
            }
            case GameState.UPDATE_INFO_GAME:
            {
                cc.log("DU MA ");
                var muccuoc = ccui.Helper.seekWidgetByName(this._layout,"bet");
                var ban = ccui.Helper.seekWidgetByName(this._layout,"room");
                //  var jackpot = ccui.Helper.seekWidgetByName(this._layout,"jackpot");

                ban.setString(StringUtility.pointNumber(gamedata.gameLogic.roomIndex));
                muccuoc.setString(StringUtility.formatNumberSymbol(ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].bet[gamedata.gameLogic.bet]) + "$");
                //   jackpot.setString(StringUtility.standartNumber(gamedata.gameLogic.roomJackpot) + "$");

                for(var i=0;i<4;i++)
                {
                    this.players[i].updateWithPlayer(gamedata.gameLogic.players[i]);
                    this.players[i].uiHome.setVisible(false);
                    //  this._players[i].addVipEffect();
                    this.players[i].updateItem(gamedata.gameLogic.players[i].item);
                }
                cc.log("ROOM OWNER " + gamedata.gameLogic.roomOwner);
                if (gamedata.gameLogic.convertChair(gamedata.gameLogic.roomOwner) >= 0 && gamedata.gameLogic.convertChair(gamedata.gameLogic.roomOwner) < 4)
                    this.players[gamedata.gameLogic.convertChair(gamedata.gameLogic.roomOwner)].uiHome.setVisible(true);
                var randValue = Math.floor(Math.random() * 2);
                if(gamedata.gameLogic.gameStateReturn != 1) // dang choi chu chua so bai
                {
                    gamedata.gameLogic.state = GameStateMaubinh.GAME_VIEWING;
                }

                this.newGame();
                if (gamedata.gameLogic.typeRoom == 0)
                {
                    this.logoGame.loadTexture("poker/logoTruyenThong.png");
                }
                else
                {
                    this.logoGame.loadTexture("poker/logoTinhAt.png");
                }

                for (var i = 0; i < 4; i++)
                {
                    var p = gamedata.gameLogic.players[i];
                    if (p.status > 0) {
                        if (p.status == 5) {
                            this.players[i].setType(Player.VIEWING);
                        } else {
                            this.players[i].setType(Player.PLAYING);
                        }
                    } else {
                        this.players[i].setType(Player.NONE);
                    }
                }

                cc.log("FLDKJS ***  ",  gamedata.gameLogic.gameStateReturn);
                var arrangeLayer = SceneMgr.getInstance().getGUI(100);
                if(arrangeLayer)
                {
                    arrangeLayer.removeFromParent(true);
                }
                if(gamedata.gameLogic.gameStateReturn == 1) // dang choi chu chua so bai
                {
                    cc.log("DM ** ");
                    gamedata.gameLogic.state = GameStateMaubinh.GAME_PLAYING;

                    this.players[0].setIdCard(gamedata.gameLogic.players[0].cards);

                    if (gamedata.gameLogic.gameTime > 0) {
                        if(gamedata.gameLogic.players[0].stateArrange == 1) // minh da xep xong, doi nguoi choi khac
                        {
                            this.bgClock.setVisible(true);
                            this.labelClock.setVisible(true);
                            this.labelClock.setString(gamedata.gameLogic.gameTime);
                            this.callbackAuto = function(){
                                gamedata.gameLogic.gameTime--;
                                this.labelClock.setString(gamedata.gameLogic.gameTime);
                            }
                            this.labelClock.runAction(new cc.RepeatForever(cc.sequence(cc.delayTime(1),cc.callFunc(this.callbackAuto.bind(this),this,null))));
                        }
                        else
                        {
                            this.bgClock.setVisible(false);
                            this.labelClock.setVisible(false);
                            this.labelClock.cleanup();
                        }
                    } else {
                        // wait next game
                    }

                    for (i = 0; i < 4; i++) {
                        if (gamedata.gameLogic.players[i].state == Player.PLAYING) {
                            //if( i == myChair)
                            //{
                            //    myPlayer.setIdCard(pkUpdateInfo.cardId[i]);
                            //}

                            if(i != 0)
                            {
                                this.players[i].visibleCardSmall();
                            }

                            if (gamedata.gameLogic.players[i].stateArrange == 1) {
                                this.players[i].ready();
                                if(i == 0)
                                {
                                    //    this.players[0].setIdCard(gamedata.gameLogic.players[0].cards);
                                    if(gamedata.gameLogic.typeRoom == 0)
                                    {
                                        this.btnArrange.setVisible(true);
                                    }
                                    else
                                    {
                                        this.btnArrange.setVisible(false);
                                    }
                                }

                            } else {
                                this.players[i].unReady();
                                if(i == 0)
                                {
                                    this.players[i].setVisible(false);

                                    if(gamedata.gameLogic.typeRoom == 0)
                                    {
                                        SceneMgr.getInstance().openGUI(MaubinhArrangeLayer.className, 100, 100, false);
                                        this.btnArrange.setVisible(false);

                                    }
                                    else
                                    {
                                        cc.log("FINISH DEAL CARD UPDATE INFO GAME");
                                        var arrangeLayer = SceneMgr.getInstance().openGUI(MaubinhAtLayer.className, 100, 100, false);
                                        arrangeLayer.finishDealCard();
                                        this.stopAutoStart();
                                    }
                                }
                            }
                        }
                    }
                }
                else
                {
                    cc.log("DANG SO BAI");
                    gamedata.gameLogic.state = GameStateMaubinh.GAME_VIEWING;

                    // visible next game
                    this.waitNewGame.setVisible(true);
                    // hien card small
                    for(var i = 0; i < 4; i++)
                    {
                        if(gamedata.gameLogic.players[i].state == Player.PLAYING)
                        {
                            this.players[i].setIdCard(gamedata.gameLogic.players[i].cards);
                        }
                    }
                }
                break;
            }
        }

        gamedata.gameLogic.gameState = GameState.NONE;
    },

    getPosFromPlayer: function(zingId) {
        for(var i=0; i<4; i++) {
            if(gamedata.gameLogic.players[i] && gamedata.gameLogic.players[i].info) {
                if (gamedata.gameLogic.players[i].info["uID"] == zingId) {
                    return this.players[i].getPosAvatar();
                }
            }
        }
        return cc.p(0, 0);
    },

    onButtonRelease: function(button,id) {
        cc.log("onButtonRelease: ", id);
        switch (id) {
            case MaubinhLayer.BTN_CHAT_MESSAGE:
            {
                chatMgr.openChatGUI();
                break;
            }
            case MaubinhLayer.BTN_CHAT_EMO:
            {
                StorageManager.getInstance().openChatEmoGUI();
                break;
            }
            case MaubinhLayer.BTN_START:
            {
                var pk = new CmdSendStartGame();
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                this.btnStart.setVisible(false);
                break;
            }
            case MaubinhLayer.BTN_ARRANGE:
            {
                var pkUnReady = new CmdSendUnReady();
                pkUnReady.putData();
                GameClient.getInstance().sendPacket(pkUnReady);
                pkUnReady.clean();

                break;
            }
            case MaubinhLayer.BTN_HELP:
            {
                SceneMgr.getInstance().openGUI(HelpScene.className, 100, 101);
                break;
            }

            case MaubinhLayer.BTN_JACKPOT:
            {
                if (Config.ENABLE_CHEAT) {
                    cc.log("REG LOG ");
                    var pkUnReady = new CmdSendRegLog();
                    pkUnReady.putData();
                    GameClient.getInstance().sendPacket(pkUnReady);
                    pkUnReady.clean();
                }
                else {
                    SceneMgr.getInstance().openGUI(HelpJackpotScene.className, 100, 101);
                }
                break;
            }
            case MaubinhLayer.BTN_QUIT:
            {
                this.onBack();
                break;

            }
            default:{
                var uID = gamedata.gameLogic.players[id - 20].info.uID;
                if (uID === gamedata.getUserId()){
                    var guiInfo = sceneMgr.openGUI(UserInfoPanel.className, LobbyScene.GUI_USER_INFO, LobbyScene.GUI_USER_INFO);
                    guiInfo.setInfo(gamedata.userData);
                } else {
                    var otherInfo = new CmdSendGetOtherRankInfo();
                    otherInfo.putData(uID);
                    GameClient.getInstance().sendPacket(otherInfo);
                    otherInfo.clean();
                }
                break;
            }
        }
    },

    onUseEmoticon: function(nChair, id, emoId) {
        var pView = this.players[gamedata.gameLogic.convertChair(nChair)];
        if (pView != null && pView instanceof MaubinhPlayer) {
            pView.useEmoticon(id, emoId);
        }
    },

    getPosFromServerChair: function(chairInServer) {
        for (var i = 0; i < gamedata.gameLogic.players.length; i++) {
            try {
                if (gamedata.gameLogic.players[i].chairInServer == chairInServer) {
                    return this.players[i].getPosAvatar();
                }
            }
            catch (e) {

            }
        }
        return cc.p(0, 0);
    },

    showLevelUp: function(cmd){
        var localChair = gamedata.gameLogic.convertChair(cmd.nChair);
        this.players[localChair].addLevelExp(cmd);
    },

    updateAvatarFrame: function(nChair, path) {
        var localChair = gamedata.gameLogic.convertChair(nChair);
        this.players[localChair].setAvatarFrame(path);
    },

    getAvatarPosition: function(index){
        return this.players[index].getAvatarPosition();
    }
});

MaubinhLayer.BTN_CAMERA = 1;
MaubinhLayer.BTN_CHAT = 2;
MaubinhLayer.BTN_QUIT = 3;
MaubinhLayer.BTN_START = 4;
MaubinhLayer.BTN_ARRANGE = 5;
MaubinhLayer.BTN_HELP = 6;
MaubinhLayer.BTN_JACKPOT = 7;
MaubinhLayer.BTN_FUNCTION = 8;
MaubinhLayer.BTN_CHAT_MESSAGE = 9;
MaubinhLayer.BTN_CHAT_EMO = 10;

MaubinhLayer.CHAT_GUI = 1000;

var HelpScene = BaseLayer.extend({
    ctor: function()
    {
        this._super("helpScene");
        this.initWithBinaryFile("GUIHelp.json");

    },
    customizeGUI: function() {
        this.bg = this.getControl("bgHelp_1");
        this.pageHelp = this.getControl("pageHelp", this.bg);

        this.pageHelp.addEventListener(this.onPageListener.bind(this));

        this.customizeButton("btnLeft",HelpScene.BTN_LEFT, this.bg);
        this.customizeButton("btnRight",HelpScene.BTN_RIGHT, this.bg);
        this.customizeButton("btnClose",HelpScene.BTN_CLOSE, this.bg);
        this.btnLeft = this.getControl("btnLeft", this.bg);
        this.btnRight = this.getControl("btnRight", this.bg);
        this.btnClose = this.getControl("btnClose", this.bg);


        this.btnLeft.setEnabled(false);
        this.btnLeft.setBright(false);
    },

    onPageListener: function(){
        cc.log("PAGE EVEENT " + this.pageHelp.getCurPageIndex());
        if(this.pageHelp.getCurPageIndex() == 0)
        {
            this.btnLeft.setEnabled(false);
            this.btnRight.setEnabled(true);
            this.btnLeft.setBright(false);
        }
        else if(this.pageHelp.getCurPageIndex() == 3)
        {
            this.btnRight.setEnabled(false);
            this.btnLeft.setEnabled(true);
            this.btnRight.setBright(false);
        }
        else{
            this.btnRight.setEnabled(true);
            this.btnLeft.setEnabled(true);
            this.btnLeft.setBright(true);
            this.btnRight.setBright(true);

        }
    },

    onButtonRelease: function(button,id) {
        switch (id) {
            case HelpScene.BTN_LEFT:
            {
                this.pageHelp.scrollToPage(this.pageHelp.getCurPageIndex() - 1);
                break;
            }
            case HelpScene.BTN_RIGHT:
            {
                this.pageHelp.scrollToPage(this.pageHelp.getCurPageIndex() + 1);
                break;
            }
            case HelpScene.BTN_CLOSE:
            {
                this.removeFromParent();
                break;
            }
        }
    }

})
HelpScene.className = "HelpScene";

var HelpJackpotScene = BaseLayer.extend({
    ctor: function()
    {
        this._super("helpJackpotScene");
        this.initWithBinaryFile("GUIHelpJackpot.json");

    },
    customizeGUI: function() {
        this.bg = this.getControl("Image_1");
        this.customizeButton("btnClose",HelpScene.BTN_CLOSE, this.bg);
    },

    onButtonRelease: function(button,id) {
        switch (id) {
            case HelpScene.BTN_CLOSE:
            {
                this.removeFromParent();
                break;
            }
        }
    }

})
HelpJackpotScene.className = "HelpJackpotScene";

MaubinhLayer.className = "MaubinhLayer";
HelpScene.BTN_LEFT = 0;
HelpScene.BTN_RIGHT = 1;
HelpScene.BTN_CLOSE = 2;