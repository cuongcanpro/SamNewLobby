
var CmdReceivedUserJoinRoom = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.info = {};
        this.info["uID"] = this.getInt();

        this.info["avatar"] = this.getString();
        this.info["displayname"] = this.info["uName"] = this.getString();
        this.info["bean"]= this.getDouble();
        this.info["exp"] = this.getDouble();
        this.info["winCount"] = this.getInt();
        this.info["lostCount"] = this.getInt();


        this.uChair = this.getByte();
        this.uStatus = this.getInt();
        this.info["ip"] = this.getString();
        this.info["vip"] = this.getByte();
        this.info["level"] = this.getInt();
        this.info["levelExp"] = this.getDouble();

        this.item = 0;
    }
});

var CmdReceivedUserView= CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.info = {};
        this.uChair = this.getByte();
        this.uStatus = this.getByte();
        this.autoKickTime = this.getByte();


        this.info["avatar"] = this.getString();
        this.info["uID"] = this.getInt();
        this.info["displayname"] = this.info["uName"] = this.getString();
        this.info["bean"]= this.getDouble();
        this.info["exp"] = this.getDouble();
        this.info["winCount"] = this.getInt();
        this.info["lostCount"] = this.getInt();

        this.getInt();
        this.info["ip"] = this.getString();
        this.info["vip"] = this.getByte();
        this.info["idItem"] = 0;
    }
});

var CmdReceivedViewGameInfo= CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.players = [];
        this.playerCards = [];
        this.dockCard = -1;
        this.currentChair = -1;
        this.turnTime = 0;
        this.playerAction = -1;

        var size  = this.getShort();
        for(var i=0;i<size;i++)
        {
            this.players.push(this.getBool());
        }
        size = this.getShort();
        for(var i=0;i<size;i++)
        {
            var obj = {};
            obj["isShowCard"] = this.getBool();
            obj["handOnCards"] = [];
            obj["isEatens"] = [];
            obj["throwCards"] = [];
            obj["phom"] = [];
            var hand = this.getShort();
            for(var j=0;j<hand;j++)
            {
                obj["handOnCards"].push(this.getInt());
            }
            hand = this.getShort();
            for(var j=0;j<hand;j++)
            {
                obj["isEatens"].push(this.getInt());
            }
            obj["handCardSize"] = this.getInt();
            var hand = this.getShort();
            for(var j=0;j<hand;j++)
            {
                obj["throwCards"].push(this.getInt());
            }

            var lengthPhom = this.getShort();
            for(var j=0;j<lengthPhom;j++)
            {
                var pi = this.getShort();
                var phomi = [];
                for(var k=0;k<pi;k++)
                {
                    phomi.push(this.getInt());
                }
                obj["phom"].push(phomi);
            }
            this.playerCards.push(obj);
        }

        this.dockCard = this.getByte();
        this.currentChair = this.getInt();
        this.turnTime = this.getInt();
        this.playerAction = this.getInt();
        this.arrayItem = [0, 0, 0, 0];
    }
});

var CmdReceivedAutoStart = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.isAutoStart = this.getBool();
        this.time = this.getByte();
        this.autoType = this.getByte();
        this.chairStart = this.getByte();
    }
});

var CmdReceivedNotifyStartGame = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        var size = this.getShort();
        this.isPlaying = [];
        for(var i=0;i<size;i++)
        {
            this.isPlaying.push(this.getBool());
        }
        this.firstTurn = this.getByte();
        this.nDeckCard = this.getByte();
    }
});

var CmdReceivedUpdateMyCard = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.nCard = this.getByte();
        var size = this.getShort();
        this.cards = [];

        for(var i =0;i<size;i++)
        {
            var id = this.getByte();
            this.cards.push(id);
        }
    }
});

var CmdReceivedThrowCard = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.chair = this.getByte();
        this.cardID = this.getByte();
    }
});

var CmdReceivedRequestShowPhom = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.turnTime = this.getByte();
        this.chair = this.getByte();
        var size = this.getShort();
        this.allCard = [];
        for(var i =0 ;i<size;i++)
        {
            this.allCard.push(this.getByte());
        }

        this.nCard = this.getByte();

        this.eatCards = [];
        size = this.getShort();
        for(var i =0 ;i<size;i++)
        {
            this.eatCards.push(this.getBool());
        }

        this.mom = this.getBool();
    }
});

var CmdReceivedRequestGuibai = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.chair = this.getByte();
        this.turnTime = this.getByte();
    }
});

var CmdReceivedGuibai = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.senderChair = this.getByte();
        this.senderCardID = this.getByte();
        this.targetChair = this.getByte();
        this.targetCardID = this.getByte();
    }
});

var CmdReceivedHaPhom = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.chair = this.getByte();
        this.nCard = this.getByte();
        var size = this.getShort();
        this.cards = [];
        for(var i =0 ;i<size;i++)
        {
            this.cards.push(this.getByte());
        }
    }
});

var CmdReceivedChangeTurn = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.cangetcard = this.getBool();
        this.chair = this.getByte();
        this.time = this.getByte();

    }
});

var CmdReceivedGetCard = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.srcCardChair = this.getByte();
        this.targetCardChair = this.getByte();
        this.throwCardChair = this.getByte();
        this.cardID = this.getByte();
        this.chotha = this.getBool();
        this.nEaten = this.getByte();
        this.nMoney = this.getDouble();
        this.nDeckCard = this.getByte();
        this.money = this.getDouble();
    }
});

var CmdReceivedOutRoomResult= CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.result = this.getByte();
    }
});

var CmdReceivedTailuot = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.chair = this.getByte();

    }
});

var CmdReceivedU = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.chair = this.getByte();
        this.nCard = this.getByte();

        var size = this.getShort();
        this.allCard = [];
        for(var i=0;i<size;i++)
        {
            this.allCard.push(this.getByte());
        }
        size = this.getShort();
        this.eatCard = [];
        for(var i=0;i<size;i++)
        {
            this.eatCard.push(this.getBool());
        }
        size = this.getShort();
        this.playerMoney = [];
        for(var i=0;i<size;i++)
        {
            this.playerMoney.push(this.getDouble());
        }
        size = this.getShort();
        this.dMoney = [];
        for(var i=0;i<size;i++)
        {
            this.dMoney.push(this.getDouble());
        }

        this.isDentien = this.getByte();
        this.uTron = this.getBool();
        this.hasJackpot = this.getBool();
    }
});

var CmdReceivedUserExitRoom = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.chair = this.getByte();
        this.takenChair = this.getByte();
    }
});

var CmdReceivedGameResult = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.moneyGet = [];
        this.rank = [];
        this.money = [];
        this.mom = [];
        this.jackpot = false;

        var size = this.getShort();
        for(var i = 0;i<size;i++)
        {
            this.moneyGet.push(this.getDouble());
        }
        size = this.getShort();
        for(var i = 0;i<size;i++)
        {
            this.rank.push(this.getByte());
        }

        size = this.getShort();
        for(var i = 0;i<size;i++)
        {
            this.money.push(this.getDouble());
        }

        size = this.getShort();
        for(var i = 0;i<size;i++)
        {
            this.mom.push(this.getBool());
        }
        this.jackpot = this.getBool();

    }
});

var CmdReceivedEndGame = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){


    }
});

var CmdReceivedRateBigbet = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.bigbet = this.getByte();
    }
});

var CmdReceivedJackpot = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.gold = this.getDouble();
        this.uChair = this.getByte();
    }
});

var CmdReceivedUpdateMath = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.roomID = this.getInt();
        this.myChair = this.getByte();
        this.commision = this.getByte();
        this.commisionJackpot = this.getByte();
        this.betType = this.getByte();

        var size = this.getShort();
        this.infos = [];
        for(var i=0;i<size;i++){
            var info = {};
            info["avatar"] = this.getString();
            info["uID"] = this.getInt();
            info["displayname"] = info["uName"] = this.getString();
            info["bean"] = this.getDouble();
            info["exp"] = this.getDouble();
            info["winCount"] = this.getInt();
            info["lostCount"] = this.getInt();
            info["vip"] = -1;
            this.infos.push(info);
        }
        size = this.getShort();
        this.playerStatus = [];
        for(var i=0;i<size;i++)
        {
            this.playerStatus.push(this.getByte());
        }
        size = this.getShort();
        this.willView = [];
        for(var i=0;i<size;i++)
        {
            this.willView.push(this.getBool());
        }
        this.getLong();

        size = this.getShort();
        for (var i=0; i<size; i++) {
            this.infos[i]["level"] = this.getInt();
            this.infos[i]["levelExp"] = this.getDouble();
        }

        this.arrayItem = [0, 0, 0, 0];
    }
});

var CmdReceivedUserTakeChair = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.error = this.getByte();
        this.uChair = this.getByte();
    }
});

var CmdReceivedUpdateCoin = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.coin = this.getDouble();
    }
});

var CmdUpdateJackpot  = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.jackpot = this.getDouble();
    }
});

var CmdReceivedQuitroomReason = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.chair = this.getByte();
        this.reason = this.getByte();
    }
});

var CmdReceivedJoinRoomSuccess = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.uChair = this.getByte();
        this.getByte();
        this.getByte();
        this.getByte();
        this.roomBet = this.getDouble();
        this.roomOwner = this.getByte();
        this.roomIndex = this.getInt();
        this.roomID = this.getInt();
        this.getByte();                 // room type

        this.playerStatus = [];
        var length = this.getShort();
        for(var i=0;i<length;i++)
        {
            this.playerStatus.push(this.getByte());
        }


        this.playerInfo = [];
        length = this.getShort();
        for(var i=0;i<length;i++)
        {
            var info = {};
            info["avatar"] = this.getString();
            info["uID"] = this.getInt();
            info["uName"] = this.getString();
            info["bean"] = this.getDouble();
            info["exp"] = this.getDouble();
            info["winCount"] = this.getInt();
            info["lostCount"] = this.getInt();
            info["usingItem"] = this.getInt();
            info["ip"] = this.getString();
            // cc.log("IP " + info["ip"]);
            this.playerInfo.push(info);
        }

        this.roomOwnerID = this.getInt();
        this.roomLock = this.getBool();

        this.bigBet = this.getByte();

        length = this.getShort();
        for(var i=0;i<length;i++)
        {
            this.vips = this.getByte();
            this.playerInfo[i]["vip"] = this.vips;
        }
        this.arrayItem = [0, 0, 0, 0];
        this.arrayItem = this.getInts();
        cc.log("ARRAY ITEM " + JSON.stringify(this.arrayItem));
        this.isModeSolo = this.getByte();

        length = this.getShort();
        for (var i = 0; i < length; i++){
            this.playerInfo[i]["level"] = this.getInt();
            this.playerInfo[i]["levelExp"] = this.getDouble();
        }
    }
});

var CmdReceivedGameInfo = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.myChair = this.getByte();
        this.roomBet = this.getDouble();
        this.roomOwner = this.getByte();
        this.roomOwnerID = this.getInt();

        this.roomIndex = this.getInt();
        this.roomID = this.getInt();
        this.isCuocLon = this.getBool();
        this.rateCuoclon = this.getByte();
        this.turnTime = this.getInt();
        this.currentChair = this.getInt();
        this.deckCard = this.getByte();
        this.playerAction = this.getInt();
        var size = this.getShort();
        this.playerStatus=[];
        this.playerList = [];
        for(var i=0;i<size;i++)
        {
            this.playerStatus.push(this.getByte());
        }
        size = this.getShort();
        for(var i=0;i<size;i++)
        {
            var obj = {};
            obj["avatar"] = this.getString();
            obj["uID"] = this.getInt();
            obj["displayName"] = obj["uName"] = this.getString();
            obj["bean"] = this.getDouble();
            obj["exp"] = this.getDouble();
            obj["winCount"] = this.getInt();
            obj["lostCount"] = this.getInt();

            this.getInt();
            obj["ip"] = this.getString();

            this.playerList.push(obj);
        }
        size = this.getShort();
        for(var i=0;i<size;i++)
        {
            this.playerList[i]["vip"] = this.getByte();
        }

        this.playerCards =[];
        size = this.getShort();
        for(var i=0;i<size;i++)
        {
            var obj = {};
            obj["isShowCard"] = this.getBool();
            obj["handOnCards"] = [];
            obj["isEatens"] = [];
            obj["throwCards"] = [];
            obj["phom"] = [];
            var hand = this.getShort();
            for(var j=0;j<hand;j++)
            {
                obj["handOnCards"].push(this.getInt());
            }
            hand = this.getShort();
            for(var j=0;j<hand;j++)
            {
                obj["isEatens"].push(this.getInt());
            }
            obj["handCardSize"] = this.getInt();
            var hand = this.getShort();
            for(var j=0;j<hand;j++)
            {
                obj["throwCards"].push(this.getInt());
            }

            var lengthPhom = this.getShort();
            for(var j=0;j<lengthPhom;j++)
            {
                var pi = this.getShort();
                var phomi = [];
                for(var k=0;k<pi;k++)
                {
                    phomi.push(this.getInt());
                }
                obj["phom"].push(phomi);
            }
            this.playerCards.push(obj);
        }
        this.getByte();
        this.getByte();
        this.getBytes();
        this.arrayItem = [0, 0, 0, 0];
        this.arrayItem = this.getInts();
        cc.log("ARRAY ITEM ******** " + JSON.stringify(this.arrayItem));

        this.isModeSolo = this.getByte();

        size = this.getShort();
        for (var i = 0; i < size; i++){
            this.playerList[i]["level"] = this.getInt();
            this.playerList[i]["levelExp"] = this.getDouble();
        }
    }
});

var CmdReceivedJoinRoomFail = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.reason = this.getByte();
    }
});

var CmdReceivedUpdateOwnerRoom = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.chair = this.getByte();
    }
});