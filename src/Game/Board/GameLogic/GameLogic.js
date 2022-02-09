/**
 * Created by HOANG on 8/17/2015.
 */


var GameLogic = cc.Class.extend({


    ctor: function(){

        this._bet= 0;           // tiec cuoc cua 1 van bai
        this._roomOwner = 0;    // ghe' cua chu romm
        this._roomOwnerID = 0;  // uID cua chu room
        this._myChair = -1;     // ghe cua minh` tren server
        this._roomIndex = 0;

        // Game play data
        this._players = [];
        this._gameState = -1;           // trang thai cua 1 van choi (mac dinh la NONE)
        this._timeAutoStart =  0;       // khi can` update autostart
        this._cardFirstTurn=  [];       // card khi quyet dinh ng di dau`
        this._timeBaoSam = 0;
        this._cardChiabai = [];         // card cua minh` khi chia bai
        this._cardDanhbai = [];         // card danh bai
        this._activeLocalChair = 0;     // chair cua nguoi` dang thuc hien 1 hanh dong (vi van dau theo luot)

        this.gameAction = -1;
        this.cards = [];
        this.activeTimeRemain = 0;

        this.wcItems = [];

        for(var i=0;i<5;i++){
            var player = new Player();
            if(i ==0 )
                player._type = Player.MY;
            this._players.push(player);
        }
    },
    initWith: function(pk){
        this._gameState = GameState.JOINROOM;
        this._bet = pk.roomBet;
        this._roomOwner = pk.roomOwner;
        this._roomIndex = pk.roomIndex;
        this._myChair = pk.uChair;
        this._roomOwnerID = pk.roomOwnerID;
        this.gameAction = pk.gameAction;
        this.activeTimeRemain = pk.remainTime;
        this._activeLocalChair = this.convertChair(pk.currentChair);
        this.cards = pk.cards;

        this.wcItems = pk.wcItems;

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
                this._players[chair]._remainCard = pk.cards[i];
            }
        }

        this.joinTime = new Date().getTime();
        this.isDealCard = false;
        this.sendQuitRoom = false;
    },
    continueWith: function (pk) {
        this._gameState = GameState.PLAYCONTINUE;
        this._bet = pk.roomBet;
        this._roomOwner = pk.roomOwner;
        this._roomIndex = pk.roomIndex;
        this._myChair = pk.uChair;
        this._cardChiabai = pk.myCard;
        this._cardRecent = pk.recentCadrs;
        this._roomOwnerID = pk.roomOwnerID;

        this._serverGameState = pk.gamestate;
        this._serverGameAction = pk.gameaction;

        this._chairTurn = pk.currentchair;
        this._timeRemain = pk.remaintime;
        this.newRound = pk.newRound;
        this.typeToiTrang = pk.typeToiTrang;

        this.wcItems = pk.wcItems;

        for(var i=0;i<this._players.length;i++)
        {
            this._players[i]._ingame = false;
        }

        pk.playerStatus[pk.uChair] = 2;
        for(var i=0;i<this._players.length;i++)
        {
            var chair = this.convertChair(i);
            if(pk.playerStatus[i] != 0){
                this._players[chair]._ingame = true;
                this._players[chair]._active = true;
                this._players[chair]._info = pk.playerInfo[i];
                this._players[chair]._status = pk.playerStatus[i];
                cc.log("status in reconnect : chair:" + chair+ " status:"+pk.playerStatus[i]);
                this._players[chair]._chairInServer = i;
            }
        }

    },
    convertChair: function(nChair)      // Chuyen ghe tu` server thanh ghe tren local
    {
        var chair = nChair - this._myChair; // offset
        if (chair < 0)
        {
            chair = chair + 5;
        }
        else if(chair > 4)
        {
            chair -= 5;
        }
        return chair;
    },
    numberPlayer: function(){
        var num = 0;
        for(var i=0;i<5;i++)
        {
            if(this._players[i]._ingame && (this._players[i]._status > 1)){
                num ++;
            }
        }
        return num;
    },
    userJoinRoom: function(pkg){
        this._gameState = GameState.USERJOIN;
        this.wcObject = {
            item : pkg.wcItem,
            chair : pkg.uChair
        };

        var chairLocal = this.convertChair(pkg.uChair);
        if((chairLocal >=0) && (chairLocal <= 4))
        {
            this._activeLocalChair = chairLocal;
            this._players[chairLocal]._ingame = true;
            this._players[chairLocal]._active = true;
            this._players[chairLocal]._info = pkg.info;
            this._players[chairLocal]._status = pkg.uStatus;
            this._players[chairLocal]._chairInServer = pkg.uChair;
            //cc.log("fuck " + this._players[chairLocal]._status)
        }
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

    firstTurn: function(pk){
        this._gameState = GameState.FIRSTTURN;
        if (pk.isRandom) {
            this._cardFirstTurn = pk.cards;
        }

    },

    chiabai: function(pk){
        this._gameState = GameState.CHIABAI;
        this._cardChiabai = pk.cards;
        this._timeBaoSam = pk.timeBaoSam;
        this.isDealCard = true;
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
    boluot: function(pk){
        this._gameState = GameState.BOLUOT;
    },
    changeturn: function(pk){
        this._gameState = GameState.CHANGETURN;
        var chairLocal = this.convertChair(pk.chair);
        if((chairLocal >=0) && (chairLocal <= 4))
        {
            this._activeLocalChair = chairLocal;
        }
    },
    quitRoom: function()
    {
        this._gameState = GameState.QUIT;

    },
    chatchong: function(pk)
    {
        this._gameState = GameState.CHATCHONG;
    },
    baosam: function(pk){
        this._gameState = GameState.BAOSAM;

        var chairLocal = this.convertChair(pk.chair);
        if (chairLocal === 0){
			if (event.isInEvent(Event.POT_BREAKER))
				event.showTicketInGame(Event.POT_BREAKER);
        }
    },
    huybaosam: function(pk){
        this._gameState = GameState.HUYBAOSAM;

        var chairLocal = this.convertChair(pk.chair);
        if (chairLocal === 0){
            if (event.isInEvent(Event.POT_BREAKER))
                event.showTicketInGame(Event.POT_BREAKER);
        }
    },
    quyetdinhsam: function(pk){
        this._gameState = GameState.QUYETDINHSAM;

        if (event.isInEvent(Event.POT_BREAKER))
            event.showTicketInGame(Event.POT_BREAKER);
    },
    jackpot: function(pk)
    {
        this._gameState = GameState.JACKPOT;
    },
    userLeave: function(pkg){
        var chairLocal = this.convertChair(pkg.chair);
        if((chairLocal >=0) && (chairLocal <= 4)) {
            this._players[chairLocal]._ingame = false;
            this._activeLocalChair = chairLocal;
        }
        this._gameState = GameState.USERLEAVE;
    },
    endgame: function(pk)
    {
        this._gameState = GameState.ENDGAME;

    },
    updateMath: function(pk){
        this._gameState = GameState.UPDATEMATH;
        this._myChair = pk.myChair;
        this._roomOwner = pk.ownerChair;

        this.wcItems = pk.wcItems;

        for(var i=0;i<pk.hasInfo.length;i++){
            if(pk.hasInfo[i])
            {
                var local = this.convertChair(i);
                if(this._players[local]._ingame)
                {
                    this._players[local]._info["bean"] = pk.infos[i]["bean"];
                    this._players[local]._info["exp"] = pk.infos[i]["exp"];
                    this._players[local]._info["winCount"] = pk.infos[i]["winCount"];
                    this._players[local]._info["lostCount"] = pk.infos[i]["lostCount"];
                    this._players[local]._info["level"] = pk.infos[i]["level"];
                    this._players[local]._info["levelExp"] = pk.infos[i]["levelExp"];
                    cc.log(this._players[local]._info["exp"] +"     "+this._players[local]._info["winCount"]+"     " + this._players[local]._info["lostCount"]);
                    this._players[local]._active = true;
                    this._players[local]._status = pk.infos[i]["status"];
                }
            }
        }

        event.onEndGame();
    },

    changeAvatar: function (pk) {
        this._gameState = GameState.NONE;
        for (var i = 0; i <  this._players.length; i++)
            if (this._players[i]._info["uID"] === pk.uID) {
                this._players[i]._info["avatar"] = pk.avatar;
                this._players[i]._active = true;
                break;
            }
    }
});


var GameState = function(){};

GameState.NONE = -1;
GameState.AUTOSTART = 0;
GameState.JOINROOM = 4;
GameState.FIRSTTURN = 1;
GameState.CHIABAI = 2;
GameState.CHANGETURN = 3;
GameState.USERJOIN = 5;
GameState.DANHBAI = 6;
GameState.BOLUOT = 7;
GameState.QUIT = 8;
GameState.BAOSAM = 9;
GameState.HUYBAOSAM = 10;
GameState.QUYETDINHSAM = 11;
GameState.USERLEAVE = 12;
GameState.ENDGAME = 13;
GameState.UPDATEMATH = 14;
GameState.UPDATEOWNERROOM = 15;
GameState.PLAYCONTINUE = 16;
GameState.CHATCHONG = 17;
GameState.JACKPOT = 18;
GameState.REASONQUIT = 19;