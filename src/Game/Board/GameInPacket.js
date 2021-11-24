/**
 * Created by HunterPC on 1/5/2016.
 */

CmdReceivedUserJoinRoom = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.info = {};
        this.info["uID"] = this.getInt();
        this.info["bean"] = this.getDouble();
        this.info["avatar"] = this.getString();
        this.info["displayname"] = this.info["uName"] = this.getString();

        this.info["exp"] = this.getDouble();
        this.info["winCount"] = this.getInt();
        this.info["lostCount"] = this.getInt();

        this.uStatus = this.getInt();
        this.uChair = this.getByte();
        this.getString();
        this.info["vip"] = this.getByte();

        //new level and exp
        this.info["level"] = this.getInt();
        this.info["levelExp"] = Number(this.getLong());

        if(Config.ENABLE_DECORATE_ITEM) {
            cc.log("--WC::UserJoin--");
            this.wcItem = this.getInt();
        }
    }
});


CmdReceivedRegQuitRoom = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.reg = this.getBool();
    }
});


CmdReceivedAutoStart = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.isCancel = this.getBool();
        this.time = this.getByte();
    }
});

CmdReceivedFirstTurn = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.isRandom = this.getBool();
        this.chair = this.getByte();

        var size = this.getShort();
        this.cards = [];

        for (var i = 0; i < size; i++) {
            var cardServer = this.getByte();
            var cardClient = Card.convertCardID(cardServer);
            this.cards.push(cardClient);
        }
    }
});

CmdReceivedChiaBai = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        var size = this.getShort();
        this.cards = [];

        for (var i = 0; i < size; i++) {
            var id = this.getByte();
            var id1 = Card.convertCardID(id);
            this.cards.push(id1);
        }

        this.toiTrang = this.getByte();
        this.timeBaoSam = this.getByte();
    }
});


CmdReceivedDanhBai = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.chair = this.getByte();
        var size = this.getShort();
        this.cards = [];

        for (var i = 0; i < size; i++) {
            var id = this.getByte();
            var id1 = Card.convertCardID(id);

            this.cards.push(id1);
        }

        this.numberCard = this.getByte();
    }
});

CmdReceivedChatChong = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.winChair = this.getByte();
        this.lostChair = this.getByte();
        this.winGold = this.getDouble();
        this.lostGold = this.getDouble();

        cc.log(this.winGold + "   " + this.lostGold);
    }
});

CmdReceivedChangeTurn = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.newRound = this.getBool();
        this.chair = this.getByte();
        this.time = this.getByte();

    }
});

CmdReceivedQuyetDinhSam = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.chair = this.getByte();
        this.baosam = this.getBool();

    }
});

CmdReceivedBoluot = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.chair = this.getByte();

    }
});

CmdReceivedBaoSam = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.chair = this.getByte();
    }
});

CmdReceivedHuyBaoSam = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.chair = this.getByte();

    }
});

CmdReceivedUserExitRoom = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.chair = this.getByte();
        this.uID = this.getInt();
    }
});

CmdReceivedEndGame = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.winType = [];
        this.ketquaTinhTien = [];
        this.cards = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            this.winType.push(this.getByte());
        }
        size = this.getShort();
        for (var i = 0; i < size; i++) {
            this.ketquaTinhTien.push(this.getDouble());
        }

        for (var i = 0; i < 5; i++) {
            size = this.getShort();
            var card = [];
            for (var j = 0; j < size; j++) {
                card.push(Card.convertCardID(this.getByte()));
            }
            this.cards.push(card);
        }
        this.delayTime = this.getByte();

        this.roomJackpot = this.getDouble();
    }
});

CmdReceivedJackpot = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.gold = this.getDouble();
        this.uChair = this.getByte();
    }
});

CmdJackpotInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.gold = [];
        this.diamond = [];
        for (var i = 0; i <= 3 ; i++) {
            this.gold.push(parseInt(this.getLong()));
            //cc.log("golddddddddddd", this.gold[i]);
        }
        for (i = 0; i <= 3; i++) {
            this.diamond.push(this.getInt());
        }
    }
});

CmdGetJackpot = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.jackpot = parseInt(this.getLong());
        this.chair = this.getInt();
        cc.log("CHAIRRRRRRRRRRRRRR", this.chair);
    }
});


CmdNotifyGetGem = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.username = this.getString();
        this.channel = this.getInt();
    }
});

CmdNotifyGetJackpot = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.username = this.getString();
        this.jackpot = parseInt(this.getLong());
        this.channel = this.getInt();
    }
});


CmdReceivedUpdateMath = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {

        this.myChair = this.getByte();
        this.ownerChair = this.getByte();

        var size = this.getShort();
        this.hasInfo = [];
        for (var i = 0; i < size; i++) {
            this.hasInfo.push(this.getBool());
        }
        this.infos = [];
        for (var i = 0; i < size; i++) {
            var info = {};
            if (this.hasInfo[i]) {
                info["bean"] = this.getDouble();
                info["exp"] = this.getDouble();
                info["winCount"] = this.getInt();
                info["lostCount"] = this.getInt();
                info["status"] = this.getInt();
            }
            this.infos.push(info);
        }

        //new level and exp
        for (var i = 0; i < size; i++) {
            if (this.hasInfo[i]) {
                this.infos[i]["level"] = this.getInt();
                this.infos[i]["levelExp"] = Number(this.getLong());
            }
        }

        if(Config.ENABLE_DECORATE_ITEM) {
            cc.log("--WC::UpdateMatch--");
            this.wcItems = this.getInts();
        }
    }
});

CmdReceivedGetPlayers = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.list = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            var friends = {};
            friends["avatar"] = this.getString();
            friends["uID"] = this.getInt();
            friends["name"] = this.getString();
            friends["bean"] = this.getDouble();
            friends["invite"] = false;

            this.list.push(friends);
        }

    }
});

CmdReceivedQuitroomReason = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {
        this.reason = this.getByte();
    }
});


CmdReceivedJoinRoomSuccess = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.uChair = this.getByte();
        this.getByte();
        this.getByte();
        this.getByte();
        this.roomBet = this.getDouble();
        this.roomOwner = this.getByte();
        this.roomIndex = this.getInt();
        this.roomID = this.getInt();
        this.getByte();
        this.getByte();
        this.getByte();

        this.playerStatus = [];
        var length = this.getShort();
        for (var i = 0; i < length; i++) {
            this.playerStatus.push(this.getByte());
        }
        this.playerInfo = [];
        length = this.getShort();
        for (var i = 0; i < length; i++) {
            var info = {};
            info["avatar"] = this.getString();
            info["uID"] = this.getInt();
            info["uName"] = this.getString();
            info["bean"] = this.getDouble();
            info["exp"] = this.getDouble();
            info["winCount"] = this.getInt();
            info["lostCount"] = this.getInt();
            info["usingItem"] = this.getInt();
            this.getString();
            this.playerInfo.push(info);
        }

        this.roomOwnerID = this.getInt();
        this.roomLock = this.getBool();
        this.roomJackpot = this.getDouble();

        length = this.getShort();
        for (var i = 0; i < length; i++) {
            this.vips = this.getByte();
            this.playerInfo[i]["vip"] = this.vips;
        }

        // Game info
        this.gameAction = this.getByte();
        length = this.getShort();
        this.cards = [];
        for (var i = 0; i < length; i++) {
            this.cards.push(this.getByte());
        }
        this.currentChair = this.getByte();
        this.remainTime = this.getByte();

        length = this.getShort();
        for (var i = 0; i < length; i++){
            this.playerInfo[i]["level"] = this.getInt();
            this.playerInfo[i]["levelExp"] = Number(this.getLong());
        }

        if(Config.ENABLE_DECORATE_ITEM) {
            cc.log("--WC::JoinRoomSuccess--");
            this.wcItems = this.getInts();
        }
    }
});

CmdReceivedGameInfo = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },

    readData: function () {
        this.uChair = this.getByte();
        this.myCard = [];
        this.recentCadrs = [];
        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            this.myCard.push(Card.convertCardID(this.getByte()));
        }

        // game state
        this.baosam = this.getByte();
        this.boluot = this.getByte();
        this.typeToiTrang = this.getInt();
        this.newRound = this.getByte();

        this.gamestate = this.getByte();
        this.gameaction = this.getByte();
        this.remaintime = this.getByte();
        this.currentchair = this.getByte();

        var size = this.getShort();
        for (var i = 0; i < size; i++) {
            this.recentCadrs.push(Card.convertCardID(this.getByte()));
        }

        // room info
        this.getByte();
        this.getByte();
        this.getByte();
        this.roomBet = this.getDouble();
        this.roomOwner = this.getByte();
        this.roomIndex = this.getInt();
        this.roomID = this.getInt();
        this.getByte();
        this.getByte();
        this.getByte();
        this.roomOwnerID = this.getInt();
        this.roomLock = this.getBool();


        // user in game info
        this.playerStatus = [];
        this.playerInfo = [];

        size = this.getShort();
        var hasInfo = [];
        for (var i = 0; i < size; i++) {
            hasInfo.push(this.getByte());
            //cc.log("has" + hasInfo[hasInfo.length-1])
        }
        for (var i = 0; i < hasInfo.length; i++) {
            var info = {};

            if (!hasInfo[i]) {
                this.playerStatus.push(0);
            }
            else {
                info["cards"] = this.getByte();

                info["baosam"] = this.getByte();
                info["huybaosam"] = this.getByte();
                this.playerStatus.push(this.getByte());
                info["avatar"] = this.getString();
                info["uID"] = this.getInt();
                info["uName"] = this.getString();
                //cc.log(info["uName"])
                info["bean"] = this.getDouble();
                info["exp"] = this.getDouble();
                info["winCount"] = this.getInt();
                info["lostCount"] = this.getInt();
                info["usingItem"] = this.getInt();
                this.getString();
                info["vip"] = this.getInt();

            }
            this.playerInfo.push(info);
        }
        this.roomJackpot = this.getDouble();

        for (var i = 0; i < hasInfo.length; i++){
            if (hasInfo[i]){
                this.playerInfo[i]["level"] = this.getInt();
                this.playerInfo[i]["levelExp"] = Number(this.getLong());
            }
        }

        if(Config.ENABLE_DECORATE_ITEM) {
            cc.log("--WC::GameInfo--");
            this.wcItems = this.getInts();
        }
    }
});

CmdReceivedJoinRoomFail = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.reason = this.getByte();
        cc.log("REASON :    " + this.reason);
    }
});

CmdReceivedUpdateOwnerRoom = CmdReceivedCommon.extend({
    ctor: function (pkg) {
        this._super(pkg);
        this.readData();
    },
    readData: function () {

        this.chair = this.getByte();
    }
});

