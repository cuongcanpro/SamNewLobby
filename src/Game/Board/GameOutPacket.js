/**
 * Created by HunterPC on 1/5/2016.
 */


var CmdSendStartGame = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_STARTGAME);
        this.putData();
    },
    putData:function(){
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

var CmdSendCard = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_RECEIVEDCARD);
    },
    putData:function(chair){
        //pack
        this.packHeader();

        this.putByte(chair);
        //update
        this.updateSize();
    }
});

var CmdSendDanhBai = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_DANHBAI);
    },
    putData:function(cardID){
        //pack
        this.packHeader();
        this.putByte(cardID);

        //update
        this.updateSize();
    }
});

var CmdSendNotifyShowPhom = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_HAPHOM);
    },
    putData:function(chair,cards){
        //pack
        this.packHeader();
        this.putByte(chair);
        this.putByte(cards.length);
        this.putShort(cards.length);

        for(var i=0;i<cards.length;i++)
        {
            this.putByte(cards[i]);
        }

        //update
        this.updateSize();
    }
});

var CmdSendConnectRoom = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(3400);
        this.putData();
    },
    putData:function(){
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

var CmdSendQuitRoom = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_QUIT_ROOM);
        this.putData();
    },
    putData:function(){
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

var CmdSendViewGame = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(3100);

        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

var CmdSendGuibai = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_GUIBAI);
    },
    putData:function(senderChair,senderCard,targetChair,targetCard){
        //pack
        this.packHeader();
        this.putByte(senderChair)
        this.putByte(senderCard)
        this.putByte(targetChair)
        this.putByte(targetCard)

        //update
        this.updateSize();
    }
});

var CmdSendClientInfo = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_GET_INFO_CLIENT);
    },
    putData: function (log, type) {
        //pack
        this.packHeader();
        this.putString(log);
        this.putByte(type);
        //update
        this.updateSize();
    }
});


var CmdSendCheatBot = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_CHEAT_BOT);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
})