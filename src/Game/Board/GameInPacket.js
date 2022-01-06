CmdReceivedJoinRoomSuccess = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.uChair = this.getByte();
        this.roomBet = this.getByte();
        this.roomOwner = this.getByte();
        this.roomIndex = this.getInt();
        this.roomID = this.getInt();
        this.typeRoom = this.getByte();
        this.playerStatus = [];
        var length = this.getShort();
        for(var i=0;i<length;i++)
        {
            this.playerStatus.push(this.getByte());

        }
        cc.log("PLAYER STATUS " + JSON.stringify(this.playerStatus));
        this.playerInfo = new Array(4);
        var count = 0;
        this.getShort();
        for(var i=0;i<length;i++)
        {
            if(this.playerStatus[i] != 0) {
                var info = {};
                info["avatar"] = this.getString();
                info["uID"] = this.getInt();
                info["uName"] = this.getString();
                info["zName"] = info["uName"];
                info["displayName"] = info["uName"];
                info["bean"] = this.getDouble();
                info["exp"] = this.getDouble();
                info["winCount"] = this.getInt();
                info["lostCount"] = this.getInt();
                this.getInt();
                this.getInt();
                this.playerInfo[i] = info;
                cc.log("NAME " + info["displayName"] );
            }
            //count++;
        }
        this.roomOwnerID = this.getInt();
        cc.log("ROOM OWNER ID " + this.roomOwnerID);
        this.roomLock = this.getBool();
        //this.roomJackpot = this.getDouble();

        length = this.getShort();
        for(var i=0;i<length;i++)
        {
            this.vips = this.getByte();
            if(this.playerStatus[i] != 0) {
                this.playerInfo[i]["vip"] = this.vips;
                count++;
            }
        }

        length = this.getShort();
        for (var i = 0; i < length; i++){
            if (this.playerStatus[i] != 0) {
                this.playerInfo[i]["level"] = this.getInt();
                this.playerInfo[i]["levelExp"] = this.getDouble();
            }
        }
        if (Config.ENABLE_DECORATE_ITEM) {
            this.arrayItem = this.getInts();
            cc.log("ARRAY ITEM " + JSON.stringify(this.arrayItem));
        }
    }
})

CmdReceivedUpdateOwnerRoom = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.chair = this.getByte();
        cc.log("ROOM OWNER ID " + this.chair);
    }
})


CmdReceivedUserJoinRoom = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.info = {};
        this.info["uID"] = this.getInt();
        this.info["avatar"] = this.getString();
        this.info["zName"] = this.info["displayName"] = this.info["uName"] = this.getString();
        this.info["bean"]= this.getDouble();
        this.info["exp"] = this.getDouble();
        this.info["winCount"] = this.getInt();
        this.info["lostCount"] = this.getInt();
        this.getInt();
        this.getInt();
        this.uStatus = this.getByte();
        this.uChair = this.getByte();
        this.info["vip"] = this.getByte();
        this.info["level"] = this.getInt();
        this.info["levelExp"] = this.getDouble();

        if (Config.ENABLE_DECORATE_ITEM)
            this.item = this.getInt();
    }
})

CmdReceivedRegQuitRoom = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.chair = this.getByte();
        this.reg = this.getByte();
    }
})

CmdReceivedNotRegQuitRoom = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.chair = this.getByte();
        this.reg = this.getByte();
    }
})


CmdReceivedAutoStart = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.isAutoStart = this.getBool();
        this.time = this.getInt();
    }
})

CmdReceivedChiaBai = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        var size = this.getShort();
        this.cards = [];

        for(var i =0;i<size;i++)
        {
            var id = this.getByte();
            //var id1 = Card.convertCardID(id);
            this.cards.push(id);
        }

        this.nGameCount = this.getInt();
        this.gameTime = this.getInt();
        //this.isPlaying = this.getByte();
    }
})

CmdReceivedReady = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.nchair = this.getByte();
    }
})

CmdReceivedUnReady = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.nchair = this.getByte();
    }
})

CmdReceivedEndCard = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.getShort();
        this.Cards = new Array(13);
        for(var i = 0; i < 13; i++)
            this.Cards[i] = this.getByte();
        this.getByte();
        this.PlayerID = this.getByte();
    }
})

CmdReceivedChiIndex = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.Chi = this.getByte();
    }
})

CmdReceivedCompareChiNew = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.Money = [];
        var length = this.getShort();
        for(var i = 0; i < length; i++)
            this.Money[i] = this.getDouble();
        this.Chi = this.getByte();
        length = this.getShort();
        this.result = [];
        for(var i = 0; i < length; i++)
            this.result[i] = this.getInt();

    }
})

CmdReceivedSummary = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.Money = [];
        var length = this.getShort();
        for(var i = 0; i < length; i++)
            this.Money[i] = this.getDouble();

    }
})

CmdReceivedXapBaiNew = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.Money = [];
        var length = this.getShort();
        for(var i = 0; i < length; i++)
            this.Money[i] = this.getDouble();
        this.getShort();
        this.Sapbai = [];
        for(var i = 0; i < length; i++)
            this.Sapbai[i] = this.getByte();

        for (var i = 0; i < 4; i++)
        {
            if (this.Sapbai[i] > 200)
                this.Sapbai[i] = -1;
        }

    }
})

CmdReceivedSapLang = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.playerId = this.getByte();
        this.Money = [];
        var length = this.getShort();
        for(var i = 0; i < length; i++)
            this.Money[i] = this.getDouble();
    }
})

CmdReceivedSoBai = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.isMaubinh = this.getBool();
        this.getShort();
        this.Money = [];
        for(var i = 0; i < 4; i++)
            this.Money[i] = this.getDouble();
    }
})

CmdReceivedBinhAt = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.getShort();
        this.Money = [];
        for(var i = 0; i < 4; i++)
            this.Money[i] = this.getDouble();
        this.getShort();
        this.BinhAt = [];
        for(var i = 0; i < 4; i++)
            this.BinhAt[i] = this.getBool();
    }
})

CmdReceivedBinhSoBai = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.getShort();
        this.Money = [];
        for(var i = 0; i < 4; i++)
            this.Money[i] = this.getDouble();
    }
})

CmdReceivedBaoMauBinh = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.idBao = this.getByte();
    }
})

CmdReceivedKickFromRoom = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.chair = this.getByte();
        this.reason = this.getByte();
    }
})

CmdReceivedNotifyJackpot = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.jackpot = this.getDouble();
    }
})

CmdReceivedJackpot = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.getString();
        this.jackpot = this.getDouble();
        this.getInt();
        this.userId = this.getInt();
    }
})

CmdReceivedUserExitRoom = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){

        this.chair = this.getByte();
        this.uID = this.getInt();
        cc.log("USER ID QUIT ************** " + this.uID);
    }
})

CmdReceivedUpdateGameInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.uChair = this.getByte();
        this.roomOwner = this.getByte();
        this.roomBet = this.getByte();
        this.typeRoom = this.getByte();
        this.roomIndex = this.getInt();
        this.gameState = this.getByte();
        this.gameTime = this.getInt();

        cc.log("GAME TIME " + this.gameTime);
        this.getShort();
        this.isPlaying = [];
        for(var i = 0; i < 4; i++)
            this.isPlaying[i] = this.getBool();
        this.getShort();
        this.playerState = [];
        for(var i = 0; i < 4; i++)
            this.playerState[i] = this.getBool();
        cc.log("GAME TIME " + this.playerState[0]);


        this.cardId = [];
        for(var j = 0; j < 4; j++)
        {
            cc.log("J INDEX " + j);
            var length = this.getShort();
            cc.log("LENG TH " + length);
            this.cardId[j] = [];
            for(var i = 0; i < length; i++) {
                this.cardId[j].push(this.getByte());
                cc.log("ID CARD " + this.cardId[j][i]);
            }
        }


        this.getShort();
        this.playerStatus = [];
        for(var i = 0; i < 4; i++)
            this.playerStatus[i] = this.getByte();


        this.playerInfo = new Array(4);
        var count = 0;
        var lengfjdl = this.getShort();
        cc.log("LENGPLAYER " + lengfjdl);
        for(var i=0; i < 4;i++)
        {
            if(this.playerStatus[i] != 0) {
                var info = {};
                info["avatar"] = this.getString();
                info["uID"] = this.getInt();

                info["uName"] = this.getString();
                info["zName"] = info["uName"];
                info["bean"] = this.getDouble();
                info["exp"] = this.getDouble();
                info["winCount"] = this.getInt();
                info["lostCount"] = this.getInt();
                this.getInt();
                this.getInt();
                this.playerInfo[i] = info;
                cc.log("NAME " + info["uName"]);
            }
            //count++;
        }
     //   this.getBytes();
        var length = this.getShort();
        cc.log("LENGTH VIP " + length);
        for (var i=0; i<length; i++) {
            this.vips = this.getByte();
            if(this.playerStatus[i] != 0) {
                this.playerInfo[i]["vip"] = this.vips;
                count++;
            }
        }

        length = this.getShort();
        for (var i=0; i<length; i++) {
            if(this.playerStatus[i] != 0) {
                this.playerInfo[i]["level"] = this.getInt();
                this.playerInfo[i]["levelExp"] = this.getDouble();
            }
        }

        if (Config.ENABLE_DECORATE_ITEM) {
            this.arrayItem = this.getInts();
            cc.log("ARRAY ITEM " + JSON.stringify(this.arrayItem));
        }
    }
})

CmdReceivedViewGame = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.gameState = this.getByte();
        this.gameTime = this.getInt();

        this.getShort();
        this.isPlaying = [];
        for(var i = 0; i < 4; i++)
            this.isPlaying[i] = this.getBool();
        this.getShort();
        this.playerState = [];
        for(var i = 0; i < 4; i++)
            this.playerState[i] = this.getBool();

        if (Config.ENABLE_DECORATE_ITEM) {
            this.arrayItem = this.getInts();
            cc.log("ARRAY ITEM " + JSON.stringify(this.arrayItem));
        }
    }
});

CmdReceiveMessage = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.playerId = this.getByte();
        this.getString();
        this.message = this.getString();
    }
});

CmdReceiveRegLog = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.listUser = this.getString();
        this.data = this.getString();
        this.chair = this.getByte();
        this.uId = this.getInt();
        this.playerCount = this.getByte();
        this.arrayStatus = this.getBytes();
        this.arrayIsPlaying = this.getBytes();
    }
});

