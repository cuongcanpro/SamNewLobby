CmdSendAuthenConnect = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_AUTHEN_CONNECT);
        },
        putData:function(){
            //pack
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdSendConfirmInTable = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_CONFIRM_IN_TABLE);
        },
        putData:function(){
            //pack
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdSendNotifyBaoBinh = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_NOTIFY_BAO_MAU_BINH);
            this.putData();
        },
        putData:function(){
            //pack
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdSendNotRegQuit = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_NOT_REG_QUIT);
            this.putData();
        },
        putData:function(){
            //pack
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdSendRegQuit = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_REG_QUIT);
            this.putData();
        },
        putData:function(){
            //pack
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdSendReady = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_READY);
        },
        putData:function(numCard, arrayCard, typeSend){
            //pack
            this.packHeader();
            this.putByte(numCard);
            this.putShort(13);
            for(var i = 0; i < 13; i++)
                this.putByte(arrayCard[i]);
            // 1 la nguoi choi gui, 2 tu dong gui
            this.putByte(typeSend);
            this.updateSize();
        }
    }
)

CmdSendUnReady = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_UN_READY);
        },
        putData:function(){
            //pack
            this.packHeader();
            this.updateSize();
        }
    }
)

CmdSendViewGame = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_VIEW_GAME);
        },
        putData:function(){
            //pack
            this.packHeader();
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

CmdSendRegLog = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_REG_LOG);
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