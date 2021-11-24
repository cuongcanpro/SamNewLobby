/**
 * Created by HOANG on 9/7/2015.
 */


CmdSendRequestFriendInfo= CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_SOCIAL_FRIENDS_INFO);

        },
        putData:function(friends){
            //pack
            this.packHeader();
            this.putShort(friends.length);

            for(var i=0;i<friends.length;i++)
            {
                this.putString(""+friends[i]);
            }
            //update
            this.updateSize();
        }
    }
);

CmdSendGetMoney = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_SOCIAL_GETMONEY);

        },
        putData:function(numFriends){
            //pack
            this.packHeader();
            this.putInt(numFriends);
            //update
            this.updateSize();
        }
    }
);

CmdSendTangGold = CmdSendCommon.extend(
    {
        ctor:function()
        {
            this._super();
            this.initData(100);
            this.setControllerId(1);
            this.setCmdId(CMD.CMD_TANGVANG);
            this.putData();

        },
        putData:function(){
            //pack
            this.packHeader();
            //update
            this.updateSize();
        }
    }
);

CmdReceivedTangGold  = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.gold = this.getDouble();
    }
});


CmdReceivedFriendInfo = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.currentWeek = this.getInt();
        this.json = this.getString();
    }
});

CmdReceivedGetMoney = CmdReceivedCommon.extend({
    ctor :function(pkg)
    {
        this._super(pkg);
        this.readData();
    },
    readData: function(){
        this.goldSupport = this.getDouble();

        this.numFriends = this.getInt();
        this.goldLimit = this.getDouble();
        this.maxGoldSupport = this.getDouble();
    }
});