/**
 * Created by HOANG on 8/17/2015.
 */


var GameLogic = cc.Class.extend({


    ctor: function(){

            this._bet= 0            // tiec cuoc cua 1 van bai
            this._roomOwner = 0      // ghe' cua chu romm (tren server)
            this._roomOwnerID = 0    // uID cua chu room
            this._myChair = -1      // ghe cua minh` tren server
            this.roomLock = false   //
            this._roomIndex = 0

            // Game play data
            this._players = []
            this._gameState = -1             // trang thai cua 1 van choi (mac dinh la NONE)
            this._timeAutoStart =  0          // khi can` update autostart
            this._bigbet = false;
            this._cardChiabai = []           // card cua minh` khi chia bai
            this._cardDanhbai = []           // card danh bai
            this._activeLocalChair = 0       // chair cua nguoi` dang thuc hien 1 hanh dong (vi van dau theo luot)

            this.gamePlaying = false;
            this.cards = [];
            this.chairStart = -1;


        for(var i=0;i<4;i++){
            var player = new Player();
            if(i ==0 )
                player._type = Player.MY;
            this._players.push(player);
        }
    },
    initWith: function(pk){
        this.isModeSolo = pk.isModeSolo || false;
        this._gameState = GameState.JOINROOM;
        this._bet = pk.roomBet;
        this._roomOwner = pk.roomOwner;
        this._roomIndex = pk.roomIndex;
        this._myChair = pk.uChair;
        this._roomOwnerID = pk.roomOwnerID;
        this.roomLock = pk.roomLock;

        for(var i=0;i<this._players.length;i++)
        {
            this._players[i]._ingame = false;
        }

        for(var i=0;i<this._players.length;i++)
        {
            var chair = this.convertChair(i);
            if(pk.playerStatus[i] != 0){
                this._players[chair]._ingame = true;
                this._players[chair]._active = true;
                this._players[chair]._info = pk.playerInfo[i];
                this._players[chair]._status = pk.playerStatus[i];
                this._players[chair]._chairInServer = i;
                if (pk.arrayItem)
                    this._players[chair].idItem = pk.arrayItem[i];
            }
        }
    },
    reset: function()
    {

    },
    continueWith: function (pk) {
        this._gameState = GameState.PLAYCONTINUE;

        this.isModeSolo = pk.isModeSolo || false;
        this._bet = pk.roomBet;
        this._roomOwner = pk.roomOwner;
        this._roomIndex = pk.roomIndex;
        this._myChair = pk.myChair;
        this._roomOwnerID = pk.roomOwnerID;


        for(var i=0;i<this._players.length;i++)
        {
            this._players[i]._ingame = false;
        }

        for(var i=0;i<this._players.length;i++)
        {
            var chair = this.convertChair(i);
            if(pk.playerStatus[i] != 0){
                this._players[chair]._ingame = true;
                this._players[chair]._active = true;
                this._players[chair]._info = pk.playerList[i];
                this._players[chair]._status = pk.playerStatus[i];
                this._players[chair]._chairInServer = i;
                if (pk.arrayItem)
                    this._players[chair].idItem = pk.arrayItem[i];
            }
        }

    },
    convertChair: function(nChair)      // Chuyen ghe tu` server thanh ghe tren local
    {
        var chair = nChair - this._myChair; // offset
        if (this.isModeSolo){
            if (Math.abs(chair) === 2){
                chair = 3;
            }
            if (this._myChair === 0 && chair === 1){
                chair = 2;
            }
            if (this._myChair === 1 && chair === -1){
                chair = 2;
            }
        }
        if (chair < 0)
        {
            chair = chair + 4;
        }
        else if(chair > 3)
        {
            chair -= 4;
        }
        return chair;
    },
    numberPlayer: function(){
        var num = 0;
        for(var i=0;i<4;i++)
        {
            if(this._players[i]._ingame && (this._players[i]._status != 4)){
                num ++;
            }
        }
        return num;
    },
    userJoinRoom: function(pkg){
        this._gameState = GameState.USERJOIN;
        var chairLocal = this.convertChair(pkg.uChair);
        if((chairLocal >=0) && (chairLocal <= 4))
        {
            this._activeLocalChair = chairLocal;
            this._players[chairLocal]._ingame = true;
            this._players[chairLocal]._active = true;
            this._players[chairLocal]._info = pkg.info;
            this._players[chairLocal]._status = pkg.uStatus;
            this._players[chairLocal]._chairInServer = pkg.uChair;
            this._players[chairLocal].idItem = pkg.item;
            //cc.log("fuck " + this._players[chairLocal]._status)
        }
    },
    userTakeChair: function(pk)
    {
        this._gameState = GameState.USERTAKECHAIR;
    },
    userView: function(pk)
    {
        this._gameState = GameState.USERVIEW;
    },
    userLeave: function(pkg){
        var chairLocal = this.convertChair(pkg.chair);
        if((chairLocal >=0) && (chairLocal <= 4)) {
            this._players[chairLocal]._ingame = false;
            this._activeLocalChair = chairLocal;
        }
        this._gameState = GameState.USERLEAVE;
    },
    updateOwnerRoom: function(pkg)
    {
        this._roomOwner = pkg.chair;
        this._gameState = GameState.UPDATEOWNERROOM;
    },
    autoStart: function(pkg){
        this._gameState = GameState.AUTOSTART;
        this._timeAutoStart = pkg.time;
    },
    updateJackpot: function(pkg){
        this._gameState = GameState.JACKPOT;
    },

    notifyStart: function(pk){
        this._gameState = GameState.NOTIFY_START;
        for (var i = 0; i < 4; i++){
            var localChair = this.convertChair(i);
            if (pk.isPlaying[i]){
            //     cc.log("abc");
                this._players[localChair]._status = 1;
                this._players[localChair]._active = true;
            }
        }

    },
    updateMyCard: function(pk){
        this._gameState = GameState.UPDATE_MYCARD;
    },
    getCard: function(pk)
    {
        this._gameState = GameState.RECEIVED_CARD;
    },
    danhbai: function(pk){
        this._gameState = GameState.DANHBAI;
        this._cardDanhbai = pk.cards;
        var chairLocal = this.convertChair(pk.chair);
        if((chairLocal >=0) && (chairLocal <= 4))
        {

            this._activeLocalChair = chairLocal;
        }

    },
    changeturn: function(pk){
        this._gameState = GameState.CHANGETURN;
        var chairLocal = this.convertChair(pk.chair);
        if((chairLocal >=0) && (chairLocal <= 4))
        {
            this._activeLocalChair = chairLocal;
        }
    },
    tailuot: function()
    {
        this._gameState = GameState.TAI_LUOT;
    },
    requestguibai: function()
    {
        this._gameState = GameState.REQUEST_GUIBAI;
    },
    guibai: function()
    {
        this._gameState = GameState.GUI_BAI;
    },
    viewgame: function()
    {
        this._gameState = GameState.VIEWGAMEINFO;
    },
    quitRoom: function()
    {
        this._gameState = GameState.QUIT;

    },
    requestShowPhom: function()
    {
        this._gameState = GameState.REQUEST_SHOWPHOM;
    },
    haphom : function()
    {
        this._gameState = GameState.HA_PHOM;
    },
    rateBigbet: function()
    {
        this._gameState = GameState.RATE_BIGBET;
    },
    jackpot: function(pk)
    {
        this._gameState = GameState.JACKPOT;
    },
    u: function(pk)
    {
        this._gameState = GameState.U;
    },
    endgame: function(pk)
    {
        this._gameState = GameState.ENDGAME;
        event.onEndGame();
    },
    gameresult: function(pk)
    {
        this._gameState = GameState.GAME_RESULT;
    },
    outroom: function()
    {
        this._gameState = GameState.OUTROOM;

    },
    updateMath: function(pk){
        this._gameState = GameState.UPDATEMATH;
        this._myChair = pk.myChair;

        for(var i=0;i<4;i++)
        {
            var local = this.convertChair(i);
            this._players[local]._ingame = false;

            if(pk.playerStatus[i] != 0)
                 this._players[local]._ingame = true;
            this._players[local]._active = true;
            this._players[local]._status = pk.playerStatus[i];
            var saveIp = "";
            var saveVip = -1;
            if (this._players[local] && this._players[local]._info && this._players[local]._info["ip"])
                saveIp = this._players[local]._info["ip"];
            if (this._players[local] && this._players[local]._info)
                saveVip = this._players[local]._info["vip"];
            this._players[local]._info = pk.infos[i];
            this._players[local]._info.ip = saveIp;
            this._players[local]._info.vip = saveVip;
            this._players[local]._chairInServer = i;
            if (pk.arrayItem)
                this._players[local].idItem = pk.arrayItem[i];
        }

    }
});

var GameState = function(){}

GameState.NONE = -1;
GameState.AUTOSTART = 0;
GameState.JOINROOM = 4;
GameState.NOTIFY_START = 1;
GameState.UPDATE_MYCARD = 2;
GameState.CHANGETURN = 3;
GameState.USERJOIN = 5;
GameState.DANHBAI = 6;
GameState.BOLUOT = 7;
GameState.QUIT = 8;
GameState.RECEIVED_CARD = 9;
GameState.REQUEST_SHOWPHOM = 10;
GameState.HA_PHOM = 11;
GameState.USERLEAVE = 12;
GameState.UPDATEMATH = 14;
GameState.UPDATEOWNERROOM = 15;
GameState.PLAYCONTINUE = 16;
GameState.JACKPOT = 18;
GameState.REASONQUIT = 19;
GameState.GAME_RESULT = 20;
GameState.ENDGAME = 21;
GameState.RATE_BIGBET = 22;
GameState.TAI_LUOT = 23;
GameState.GUI_BAI = 24;
GameState.REQUEST_GUIBAI = 25;
GameState.U = 26;
GameState.OUTROOM = 27;
GameState.USERTAKECHAIR = 28;
GameState.USERVIEW = 29;
GameState.VIEWGAMEINFO = 30;