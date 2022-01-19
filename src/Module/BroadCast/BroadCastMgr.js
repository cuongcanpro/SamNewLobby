/**
 * Created by GSN on 6/6/2016.
 */


var BroadcastHandler = cc.Class.extend({

    ctor : function (id,type,pos) {
        this.arMessage = [];
        this.currentBroadcast = null;
        this.timeoutWait = 0;
        this.handlerID = id;
        this.broadcastType = type;
        this.broadcastPos = pos;
    },

    addMessage : function (message,repeat,top) {
        var br = new BroadcastNode(message,this.broadcastType,this.broadcastPos,repeat);
        top = top || false;
        if(top)
            this.arMessage.unshift(br);
        else
            this.arMessage.push(br);

        this.checkAndPlay();
    },

    checkAndPlay : function (timeout) {
        for (var i = 0; i < broadcastMgr.arHandler.length; i++){
            if (this.handlerID !== broadcastMgr.arHandler[i].handlerID){
                if (broadcastMgr.arHandler[i].currentBroadcast) {
                    return;
                }
            }
        }
        //cc.log("++CheckPlay " + timeout);
        if(timeout) {
           if(this.currentBroadcast) {
               this.currentBroadcast.removeFromParent();
               this.currentBroadcast = false;
           }
        }

        if(this.currentBroadcast) return;
        if(this.arMessage.length <= 0) {
            for (i = 0; i < broadcastMgr.arHandler.length; i++){
                if (this.handlerID !== broadcastMgr.arHandler[i].handlerID){
                    if (broadcastMgr.arHandler[i].arMessage.length > 0){
                        broadcastMgr.arHandler[i].checkAndPlay();
                    }
                }
            }
            return;
        }

        this.timeoutWait = Broadcast.TIMEOUT_MESSAGE;

        this.currentBroadcast = this.arMessage[0];
        this.currentBroadcast.doPlay();

        this.arMessage.splice(0,1);
    },

    reloadBroadcast : function () {
        if(this.currentBroadcast) {
            this.currentBroadcast.doReload();
        }
    },

    updateHandler : function (dt) {
        if(this.timeoutWait > 0 && (this.currentBroadcast == null)) {
            this.timeoutWait -= dt;
            if(this.timeoutWait <= 0) {
                this.checkAndPlay(true);
            }
        }

        if(this.currentBroadcast) {
            this.currentBroadcast.doUpdate(dt);
            if(this.currentBroadcast.isDead) {
                this.currentBroadcast.removeFromParent();
                this.currentBroadcast = null;
                this.checkAndPlay();
            }
        }
    }
});

var BroadcastMgr = BaseMgr.extend({
    
    ctor : function () {
        this.arHandler = [];
        this.doUpdate = false;
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case CMD.SERVER_NOTIFY_MESSAGE: {
                var pk = new CmdReceivedServerNotifyMessage(p);
                pk.clean();
                broadcastMgr.addMessage(Broadcast.TYPE_SYSTEM, pk.message);
                return true;
            }
        }
        return false;
    },
    
    onStart : function () {
        var x = cc.winSize.width * 0.5 - cc.winSize.width*Broadcast.WIDTH_RATIO_DEFAULT * 0.5;
        var y = cc.winSize.height - 30;
        this.addHandler(Broadcast.TYPE_SYSTEM,Broadcast.MESSAGE_NORMAL,cc.p(x,y));

        if(Config.ENABLE_EGGBREAKER) {
            var x = cc.winSize.width * 0.5 - cc.winSize.width*Broadcast.WIDTH_RATIO_DEFAULT * 0.5;
            var y = cc.winSize.height - 30;
            this.addHandler(Broadcast.TYPE_EVENT,Broadcast.MESSAGE_RICH,cc.p(x,y));
        }
        else if (Config.ENABLE_EVENT_TET) {
            var x = cc.winSize.width - cc.winSize.width*Broadcast.WIDTH_RATIO_DEFAULT - 50;
            var y = cc.winSize.height - 80;
            this.addHandler(Broadcast.TYPE_EVENT,Broadcast.MESSAGE_RICH,cc.p(x,y));
        }
        else if (Config.ENABLE_EVENT_SECRET_TOWER) {
            var x = cc.winSize.width - cc.winSize.width*Broadcast.WIDTH_RATIO_DEFAULT - 50;
            var y = cc.winSize.height - 80;
            this.addHandler(Broadcast.TYPE_EVENT,Broadcast.MESSAGE_RICH,cc.p(x,y));
        }
    },
    
    reloadBroadcast : function () {
        this.doUpdate = true;

        // remove when login
        if(sceneMgr.checkMainLayer(LoginScene)) {
            this.arHandler = [];
            this.doUpdate = false;
            sceneMgr.layerSystem.removeAllChildren();
        }

        // reload all broadcast running
        for(var i = 0, size = this.arHandler.length ; i < size ; i++) {
            this.arHandler[i].reloadBroadcast();
        }
    },
    
    addHandler : function (id,type,pos) {
        if(!this.getHandler(id)) {
            this.arHandler.push(new BroadcastHandler(id,type,pos));
        }
    },

    getHandler : function (id) {
        for(var i = 0, size = this.arHandler.length ; i < size ; i++) {
            if(this.arHandler[i].handlerID == id) {
                return this.arHandler[i];
            }
        }
        return null;
    },

    addMessage : function (handlerId,message,repeat,top) {
        var handler = this.getHandler(handlerId);
        if(handler) {
            handler.addMessage(message,repeat,top);
        }
    },

    updateBroadcast : function (dt) {
        if(!this.doUpdate) return;

        for(var i = 0, size = this.arHandler.length ; i < size ; i++) {
            this.arHandler[i].updateHandler(dt);
        }
    }
});

BroadcastMgr._inst = null;
BroadcastMgr.getInstance = function () {
    if(!BroadcastMgr._inst) {
        BroadcastMgr._inst = new BroadcastMgr();
    }
    return BroadcastMgr._inst;
};
broadcastMgr = BroadcastMgr.getInstance();
