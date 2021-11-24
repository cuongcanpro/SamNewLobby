/**
 * Created by HunterPC on 1/5/2016.
 */

CmdSendQuitRoom = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_QUIT_ROOM);
        this.putData();
    },
    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendConfirmInTable = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_CONFIRM_IN_TABLE);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendDetermineInTable = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_SEND_DETERMINE_IN_TABLE);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendGetUserInfo = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_GET_USER_INFO);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendLeaveRoom = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_LEAVE_ROOM);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendNotRegQuit = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_NOT_REG_QUIT);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendPassTurn = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_PASS_TURN);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendPlayCard = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_SEND_PLAY_CARD);
    },

    putData: function (num, card) {
        this.packHeader();
        this.putByte(num);
        this.putShort(num);
        for (var i = 0; i < card.length; i++) {
            this.putByte(card[i]);
        }
        this.updateSize();
    }
});

CmdSendPlayNow = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_QUICK_PLAY);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendReady = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_READY);
    },

    putData: function (num, card) {
        this.packHeader();
        this.putByte(num);
        this.putShort(num);
        for (var i = 0; i < card.length; i++) {
            this.putByte(card[i]);
        }
        this.updateSize();
    }
});

CmdSendRegQuit = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_REG_QUIT);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendSelectChannel = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_SELECT_CHANNEL);
    },

    putData: function (num) {
        this.packHeader();
        this.putByte(num);
        this.updateSize();
    }
});

CmdSendStartGame = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.START_GAME);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendUpdateInfoGame = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_UPDATE_INFO_GAME);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendViewGame = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_VIEW_GAME);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendAuthenConnect = CmdSendCommon.extend({

    ctor: function () {
        this._super();
        this.initData(1000);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_AUTHEN_CONNECT);
        this.putData();
    },

    putData: function () {
        this.packHeader();
        this.updateSize();
    }
});

CmdSendGetPlayers = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_GETPLAYERS);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});

CmdSendStartGame = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_STARTGAME);
            this.putData();
        },
        putData:function(){
            //pack
            this.packHeader();
            //update
            this.updateSize();
        }
    }
)
CmdSendDanhBai = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_DANHBAI);
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
    }
)

CmdSendQuitRoom = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_QUIT_ROOM);
            this.putData();
        },
        putData:function(){
            //pack
            this.packHeader();
            //update
            this.updateSize();
        }
    }
)

CmdSendHuyBaoSam = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_HUYBAOSAM);
            this.putData();
        },
        putData:function(){
            //pack
            this.packHeader();
            //update
            this.updateSize();
        }
    }
)

CmdSendBaoSam = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_BAOSAM);
            this.putData();
        },
        putData:function(){
            //pack
            this.packHeader();
            //update
            this.updateSize();
        }
    }
)

CmdSendGetPlayers = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_GETPLAYERS);
            this.putData();
        },
        putData:function(){
            //pack
            this.packHeader();
            //update
            this.updateSize();
        }
    }
)

CmdSendInvite = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_INVITE);
        },
        putData:function(uid){
            //pack
            this.packHeader();
            this.putInt(uid);
            //update
            this.updateSize();
        }
    }
)

CmdSendCreateRoom = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_CREATE_ROOM);
        },
        putData:function(name,bet,bigbet,password,numpeople){
            //pack
            this.packHeader();

            this.putString(name);
            this.putByte(bet);
            this.putByte(1);
            this.putString(password);
            this.putByte(numpeople);
            this.putByte(bigbet);

            //update
            this.updateSize();
        }
    }
)

CmdSendCheatBai = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(200);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_CHEATBAI);
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
    }
)

CmdSendAddBot = CmdSendCommon.extend({
    ctor: function () {
        this._super();
        this.initData(100);
        this.setControllerId(1);
        this.setCmdId(CMD.CMD_ADD_BOT);
        this.putData();
    },

    putData: function () {
        //pack
        this.packHeader();
        //update
        this.updateSize();
    }
});