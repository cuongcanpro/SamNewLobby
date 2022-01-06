/**
 * Created by HOANG on 8/17/2015.
 */


var GameLogic = cc.Class.extend({


    ctor: function(){

            this.bet= 0            // tiec cuoc cua 1 van bai
            this.roomOwner = 0      // ghe' cua chu romm
            this.roomOwnerID = 0    // uID cua chu room
            this.myChair = -1      // ghe cua minh` tren server
            this.roomLock = false   //
            this.roomJackpot = 0;
            this.roomIndex =  0
            this.roomID= 0
            this.typeRoom= 0
            this.rCuoclon= 0
            this.zoneID= 0

            // Game play data
            this.players = [];
            this.gameState = -1             // trang thai cua 1 van choi (mac dinh la NONE)
            this.timeAutoStart =  0          // khi can` update autostart
            this.cardFirstTurn=  []         // card khi quyet dinh ng di dau`
            this.timeBaoSam = 0
            this.typeToiTrang = 0
            this.cardChiabai = []           // card cua minh` khi chia bai
            this.cardDanhbai = []           // card danh bai
            this.activeLocalChair = 0       // chair cua nguoi` dang thuc hien 1 hanh dong (vi van dau theo luot)

            this.gameAction = -1;
            this.cards = [];
            this.activeTimeRemain = 0;
            this.money = []; // tien cua tung nguoi choi khi so chi, so bai
            this.result = []; // ket qua hien thi cua tung nguoi choi

        for(var i=0;i<4;i++){
            var player = new Player();
            if(i ==0 )
                player._type = Player.MY;
            this.players.push(player);
        }
        this.jackpotValue = 0;
    },
    initWith: function(pk){
        this.gameState = GameState.JOINROOM;
        this.bet = pk.roomBet;
        this.roomOwner = pk.roomOwner;
        this.roomID = pk.roomID;
        this.roomIndex = pk.roomIndex;
        this.myChair = pk.uChair;
        this.roomOwnerID = pk.roomOwnerID;
        this.typeRoom = pk.typeRoom;

        for(var i=0;i<this.players.length;i++)
        {
            this.players[i].status = -1;
            this.players[i].ingame = false;
        }

        for(var i=0;i<this.players.length;i++)
        {
            var chair = this.convertChair(i);
            if(pk.playerStatus[i] > 0){
                this.players[chair].ingame = true;
                this.players[chair].active = true;
                this.players[chair].info = pk.playerInfo[i];
                this.players[chair].status = pk.playerStatus[i];
                this.players[chair].chairInServer = i;
                cc.log("STATUS 1 " + pk.playerStatus[i]);
            }
            if (pk.arrayItem) {
                this.players[chair].item = pk.arrayItem[i];
            }
        }
        this.isKick = false;
        this.isViewing = false;
        for (var i = 0; i < 4; i++)
        {

            var p = this.players[i];
            cc.log("STATUS ***  " + p.status);
            if (p.status > 0) {
                if (p.status == 5) {

                    p.state = Player.VIEWING;
                    if (i == 0) {
                        cc.log("SEND VIEW GASME ((((((((((  ");
                        var pk = new CmdSendViewGame();
                        pk.putData();
                        GameClient.getInstance().sendPacket(pk);
                        pk.clean();
                        this.isViewing = true;
                    }
                    else{
                    }

                } else {
                    p.state = Player.PLAYING;
                }
            } else {
                p.state = Player.NONE;
            }
        }

        if (this.players[0].state == Player.VIEWING)
        {
            this.state = GameStateMaubinh.GAME_PLAYING;
            this.isViewing = true;
        }
        else
        {
            this.isViewing = false;
            this.state = GameStateMaubinh.GAME_WAITING;
        }

        this.joinTime = new Date().getTime();
        this.isStart = false;
    },

    convertChair: function(nChair)      // Chuyen ghe tu` server thanh ghe tren local
    {
        var chair = nChair - this.myChair; // offset
        if (chair < 0)
        {
            chair = chair + 4;
        }
        else if(chair >= 4)
        {
            chair -= 4;
        }
        return chair;
    },

    userJoinRoom: function(pkg){
        this.gameState = GameState.USERJOIN;
        var chairLocal = this.convertChair(pkg.uChair);
        if((chairLocal >=0) && (chairLocal < 4))
        {
            this.activeLocalChair = chairLocal;
            this.players[chairLocal].ingame = true;
            this.players[chairLocal].active = true;
            this.players[chairLocal].info = pkg.info;
            if(pkg.uStatus == 5)
                this.players[chairLocal].state = Player.VIEWING;
            else
                this.players[chairLocal].state = Player.PLAYING;
            this.players[chairLocal].status = pkg.uStatus;
            this.players[chairLocal].chairInServer = pkg.uChair;
            this.players[chairLocal].item = 0;
            if (pkg.item) {
                this.players[chairLocal].item = pkg.item;
            }
        }
    },
    updateOwnerRoom: function(pkg)
    {
        this.roomOwner = pkg.chair;
        this.gameState = GameState.UPDATEOWNERROOM;
    },
    autoStart: function(pkg){
        this.gameState = GameState.AUTOSTART;
        this.timeAutoStart = pkg.time;
        this.state = GameStateMaubinh.GAME_TIMING;
        this.isAutoStart = pkg.isAutoStart;
    },

    chiabai: function(pk){
        cc.log("GAN STATE CHIA BAI");
        this.gameState = GameState.CHIABAI;
        this.players[0].cards = pk.cards;
        this.gameTime = pk.gameTime;
        this.isStart = true;
    },

    quitRoom: function()
    {
        this.gameState = GameState.QUIT;

    },
    jackpot: function(pk)
    {
        this.gameState = GameState.JACKPOT;
        this.jackpotEat = pk.jackpot;
        this.userIdJackpot = pk.userId;
    },
    userLeave: function(pkg){

        var chairLocal = this.convertChair(pkg.chair);
        if((chairLocal >=0) && (chairLocal < 4)) {
            var time = new Date().getTime() - this.joinTime;
            var s = "Manual Exception: LEAVEROOM ID " + chairLocal + " CHAIR IN SERVER " + pkg.chair
                + " my chair " + this.myChair + " UID SERVER " + pkg.uID + " MY ID " + gamedata.userData.uID + " TIME " + time + " IS Start " + this.isStart;
            s = s + "\n" + (new Error()).stack;
            cc.log(s);
            if (chairLocal == 0) {
                if (gamedata.userData.uID != pkg.uID) {
                    cc.log("KICK Ghe cua minh nhung khac UID ");
                    NativeBridge.logJSManual("assets/src/Game/Board/GameLogic.js", "1234", s, NativeBridge.getVersionString());
                    return;
                }
            }
            else {
                if (this.players[chairLocal]) {
                    if (this.players[chairLocal].info && this.players[chairLocal].info["uID"] != pkg.uID) {
                        cc.log("KICK Ghe Nguoi khac nhung khac UID ");
                        var s = "Manual Exception:  kick other not same UID " + pkg.uID + " client ID " +  this.players[chairLocal].info["uID"];
                        s = s + "\n" + (new Error()).stack;
                        // NativeBridge.logJSManual("assets/src/Game/Board/GameLogic.js", "1234569", s, NativeBridge.getVersionString());
                    }
                }
            }
            this.players[chairLocal].ingame = false;
            this.activeLocalChair = chairLocal;
            this.players[chairLocal].state = Player.NONE;
            this.userLeaveRoomId = chairLocal;
        }
        this.gameState = GameState.USERLEAVE;
    },

    getNumPlayer: function() {
        var i;
        var result = 0;
        for(i= 0; i < 4; i++)
        {
            if(this.players[i].state == Player.PLAYING || this.players[i].state == Player.VIEWING)
            {
                result++;
            }
        }
        return result;
    },

    newGame: function(){
        for(var i = 0; i< 4; i++)
        {
            this.players[i].isCompareBai = false;
            this.players[i].isBinhLung = false;
            this.players[i].compareBinh = this.typeRoom != 1;
        }
    },

    ready: function(pkg) {
        this.gameState = GameState.READY;
        this.chairReady = this.convertChair(pkg.nchair);
    },

    unReady: function(pkg) {
        this.gameState = GameState.UN_READY;
        this.chairUnReady = this.convertChair(pkg.nchair);
    },

    endCard: function(pkg) {
        this.gameState = GameState.END_CARD;
        this.chairEndCard = this.convertChair(pkg.PlayerID);
        this.players[this.chairEndCard].cards = pkg.Cards;
        this.state = GameStateMaubinh.GAME_COMPARE;
    },

    chiIndex: function(pkg){
        this.gameState = GameState.CHI_INDEX;
        this.chi = pkg.Chi;

    },

    compareChi: function(pkg){
        this.gameState = GameState.COMPARE_CHI;
        this.chi = pkg.Chi;

        for(var i = 0; i < 4; i++)
            this.money[this.convertChair(i)] = pkg.Money[i];

        for(var i = 0; i < 4; i++)
            this.result[this.convertChair(i)] = pkg.result[i];

    },

    summary: function(pkg){
        this.gameState = GameState.SUMMARY;
        for(var i = 0; i < 4; i++)
            this.money[this.convertChair(i)] = pkg.Money[i];

        var pk = new CmdSendAuthenConnect();
        pk.putData();
        GameClient.getInstance().sendPacket(pk);
        pk.clean();
    },

    sapBai: function(pkg){
        this.gameState = GameState.SAP_BAI;
        for(var i = 0; i < 4; i++)
            this.money[this.convertChair(i)] = pkg.Money[i];
        this.Sapbai = [];
        for(var i = 0; i < 4; i++)
            this.Sapbai[this.convertChair(i)] = pkg.Sapbai[i];

    },

    gameEnd: function(){
        this.gameState = GameState.GAME_END;
        this.state = GameStateMaubinh.GAME_WAITING;
        event.onEndGame();
    },

    soBai: function(pkg){
        this.gameState = GameState.SO_BAI;

        for(var i = 0; i < 4; i++)
        {
            this.money[this.convertChair(i)] = pkg.Money[i];
            cc.log("MONEY   " + pkg.Money[i]);
        }

        this.isMauBinh = pkg.isMaubinh;
    },

    binhSoBai: function(pkg){
        this.gameState = GameState.BINH_SO_BAI;

        for(var i = 0; i < 4; i++)
        {
            this.money[this.convertChair(i)] = pkg.Money[i];
            cc.log("MONEY   " + pkg.Money[i]);
        }

    },

    getNumPlayerPlaying: function(){
        var result = 0;
        for(var i= 0; i<4; i++)
        {
            if(this.players[i].state == Player.PLAYING)
            {
                result++;
            }
        }
        return result;
    },

    sapLang: function(pkg){
        this.gameState = GameState.SAP_LANG;

        for(var i = 0; i < 4; i++)
        {
            this.money[this.convertChair(i)] = pkg.Money[i];
        }
        this.playerSap = this.convertChair(pkg.playerId);
    },

    tinhAt: function(pkg){
        this.gameState = GameState.TINH_AT;
        this.BinhAt = [];
        for(var i = 0; i < 4; i++)
        {
            this.money[this.convertChair(i)] = pkg.Money[i];
            this.BinhAt[this.convertChair(i)] = pkg.BinhAt[i];
        }
    },

    getNumAt: function(index){
        var count = 0;
        for (var i = 0; i < 13; i++)
        {
            if (this.players[index].cards[i] >= 48)
                count++;
        }
        return count;
    },

    requestEndCard: function(){
        this.gameState = GameState.REQUEST_END_CARD;
        cc.log("REUQEST END CARD NE ** ");
    },

    baoMauBinh: function(pkg){
        var chair = this.convertChair(pkg.idBao);
        this.players[chair].compareBinh = true;
    },

    regQuit: function(pkg){
        var chair = this.convertChair(pkg.chair);
        this.chairRegQuit = chair;
        cc.log("REG %i CHAIR ", pkg.reg, chair);
        if(pkg.reg == 0 && chair == 0)
        {
            this.gameState = GameState.REG_QUIT;
        }
        else{
            this.gameState = GameState.NONE;
        }
    },

    notRegQuit: function(pkg){
        var chair = this.convertChair(pkg.chair);
        this.chairRegQuit = chair;
        if(pkg.reg == 0 && chair == 0)
        {
            this.gameState = GameState.NOT_REG_QUIT;
        }
        else{
            this.gameState = GameState.NONE;
        }
    },

    kickFromRoom: function(pkg){
        this.chairKick = this.convertChair(pkg.chair);
        cc.log("CHAIR FLDJLJ ***  %i " + pkg.chair);
        if(this.chairKick == 0)
            this.reasonKick = pkg.reason;
        this.gameState = GameState.KICK_ROOM;
    },

    updateJackpot: function(pkg){

        this.gameState = GameState.UPDATE_JACKPOT;
    },

    updateViewGame: function(pkg){
        this.gameTime = pkg.gameTime;
        this.gameStateReturn = pkg.gameState;
        for(var i=0;i<this.players.length;i++)
        {
            var chair = this.convertChair(i);
            if(this.players[chair].state == Player.PLAYING){
                this.players[chair].stateArrange = pkg.playerState[i];
            }
        }
        this.gameState = GameState.UPDATE_VIEW_GAME;
    },

    updateInfoGame: function(pk){

        this.gameState = GameState.UPDATE_INFO_GAME;
        this.bet = pk.roomBet;
        this.roomOwner = pk.roomOwner;

        this.roomIndex = pk.roomIndex;
        this.myChair = pk.uChair;
        this.roomOwnerID = pk.roomOwner;
        this.typeRoom = pk.typeRoom;

        for(var i=0;i<this.players.length;i++)
        {
            this.players[i].status = -1;
            this.players[i].ingame = false;
        }

        for(var i=0;i<this.players.length;i++)
        {
            var chair = this.convertChair(i);
            if(pk.playerStatus[i] > 0){
                this.players[chair].ingame = true;
                this.players[chair].active = true;
                this.players[chair].info = pk.playerInfo[i];
                this.players[chair].status = pk.playerStatus[i];
                this.players[chair].chairInServer = i;
                this.players[chair].stateArrange = pk.playerState[i];
                this.players[chair].cards = pk.cardId[i];
                if (pk.arrayItem) {
                    this.players[chair].item = pk.arrayItem[i];
                }
                cc.log("STATUS 1 " + pk.playerStatus[i]);
            }
        }
        this.isKick = false;
        this.isViewing = false;
        for (var i = 0; i < 4; i++)
        {
            var p = this.players[i];
            if (p.status > 0) {
                if (p.status == 5) {

                    p.state = Player.VIEWING;
                    if (i == 0) {
                        var pk = new CmdSendViewGame();
                        pk.putData();
                        GameClient.getInstance().sendPacket(pk);
                        pk.clean();
                        this.isViewing = true;
                    }
                    else{
                    }

                } else {

                    p.state = Player.PLAYING;
                }
            } else {
                p.state = Player.NONE;
            }
        }

        if (this.players[0].state == Player.VIEWING)
        {
            this.state = GameStateMaubinh.GAME_PLAYING;
            this.isViewing = true;
        }
        else
        {
            this.isViewing = false;
            this.state = GameStateMaubinh.GAME_WAITING;
        }
        this.gameTime = pk.gameTime;
        this.gameStateReturn = pk.gameState;
        cc.log("GAME STATE RETURN ", pk.gameState);
    }

})


var GameState = function(){}

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
GameState.READY = 20;
GameState.UN_READY = 21;
GameState.END_CARD = 22;
GameState.CHI_INDEX = 23;
GameState.COMPARE_CHI = 24;
GameState.SUMMARY = 25;
GameState.SAP_BAI = 26;
GameState.GAME_END = 27;
GameState.SO_BAI = 28;
GameState.SAP_LANG = 29;
GameState.TINH_AT = 30;
GameState.REQUEST_END_CARD = 31;
GameState.BINH_SO_BAI = 32;
GameState.REG_QUIT = 33;
GameState.NOT_REG_QUIT = 34;
GameState.KICK_ROOM = 35;
GameState.UPDATE_INFO_GAME = 36;
GameState.UPDATE_JACKPOT = 37;
GameState.UPDATE_VIEW_GAME = 38;

var GameStateMaubinh = function(){}
GameStateMaubinh.GAME_WAITING = 0;
GameStateMaubinh.GAME_PLAYING = 1;
GameStateMaubinh.GAME_TIMING = 2;
GameStateMaubinh.GAME_COMPARE = 3;
GameStateMaubinh.GAME_EFFECT = 4;
GameStateMaubinh.GAME_VIEWING = 5;

var MaubinhGameData = cc.Class.extend({
    ctor: function()
    {
        this.firstInit = true;
        this.initData = false;
        this.countShowHelp = 0;
    }
});
MaubinhGameData.firstInit = true;
MaubinhGameData.instance = null;

MaubinhGameData.getInstance = function () {
    if (MaubinhGameData.firstInit) {
        MaubinhGameData.instance = new MaubinhGameData();
        MaubinhGameData.firstInit = false;
    }
    return MaubinhGameData.instance;
};
