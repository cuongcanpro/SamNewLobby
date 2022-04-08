/**
 * Created by HunterPC on 1/5/2016.
 */

var CmdSendQuitRoom = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_QUIT_ROOM);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

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

var CmdSendDanhBai = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_DANHBAI);
    },
    putData:function(boluot,cards){
        //pack
        this.packHeader();
        this.putByte(boluot);
        if(boluot)
        {

        }
        else
        {
            this.putShort(cards.length);
            for(var i=0;i<cards.length;i++){
                this.putByte(cards[i]);
            }
        }

        //update
        this.updateSize();
    }
});

var CmdSendHuyBaoSam = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_HUYBAOSAM);
        this.putData();
    },
    putData:function(){
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

var CmdSendBaoSam = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_BAOSAM);
        this.putData();
    },
    putData:function(){
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

var CmdSendCheatBai = CmdSendCommon.extend({
    ctor:function()
    {
        this._super();
        this.initData(200);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_CHEATBAI);
    },
    putData:function(chair,cards,cheat){
        //pack
        this.packHeader();
        this.putByte(cheat);

        this.putByte(chair);

        this.putShort(cards.length);
        for(var i=0;i<cards.length;i++)
        {
            this.putByte(cards[i]);
        }
        //update
        this.updateSize();
    }
});

var CmdSendAddBot = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_ADD_BOT);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendHold = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(InGameMgr.CMD_HOLD);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});