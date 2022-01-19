
var Broadcast = function () {};

Broadcast.UPDATE_DELTA_TIME = 1/60;
Broadcast.WIDTH_RATIO_DEFAULT = 0.3;
Broadcast.ANCHOR_DEFAULT = cc.p(0,0.5);

Broadcast.MESSAGE_NORMAL = 1;
Broadcast.MESSAGE_RICH = 2;

Broadcast.TYPE_SYSTEM = "system_broadcast";
Broadcast.TYPE_EVENT = "event_broadcast";

Broadcast.TIMEOUT_MESSAGE = 30;

var BroadcastNode = cc.Node.extend({

    ctor : function (message,type,pos,rp) {
        this._super();

        this.lbMessage = null;

        this.doMessage = false;
        this.moveX = 0;

        this.numRepeat = rp || 0;

        this.isDead = false;

        this.ID = new Date().getTime();
        this.sprite = new cc.Sprite("Common/bgBroadcast.png");
        this.sprite.setOpacity(150);
        this.addChild(this.sprite);
        var length = cc.winSize.width*Broadcast.WIDTH_RATIO_DEFAULT;
        this.sprite.setPosition(pos.x + length * 0.5, pos.y + 10);
        this.node = new cc.Node();
        this.addChild(this.node);
        this.node.setPosition(pos);
        switch (type) {
            case Broadcast.MESSAGE_NORMAL: {
                this.createMessage(message,pos);
                break;
            }
            case Broadcast.MESSAGE_RICH: {
                this.createRichMessage(message,pos);
                break;
            }
        }

        this.setVisible(false);
        this.retain();

        sceneMgr.layerSystem.addChild(this);
    },

    createMessage : function (message,pos) {
        message = message || "";

        var length = cc.winSize.width*Broadcast.WIDTH_RATIO_DEFAULT;
        this.lbMessage = new ccui.Text();
        this.lbMessage.setAnchorPoint(Broadcast.ANCHOR_DEFAULT);
        this.lbMessage.setFontName(SceneMgr.FONT_NORMAL);
        this.lbMessage.setFontSize(SceneMgr.FONT_SIZE_DEFAULT);
        this.lbMessage.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        this.lbMessage.setColor(sceneMgr.ccWhite);
        this.lbMessage.setString(message);
        this.lbMessage.x = length;
        this.lbMessage.saveX = length;
        this.lbMessage.y = 10;
        this.lbMessage.overX = -this.lbMessage.getContentSize().width;

        this.clipNode(pos);
    },

    createRichMessage : function (msgArr, pos) {
        var length = cc.winSize.width*Broadcast.WIDTH_RATIO_DEFAULT;

        this.lbMessage = new RichLabelText();
        this.lbMessage.setText(msgArr);
        this.lbMessage.setAnchorPoint(Broadcast.ANCHOR_DEFAULT);
        this.lbMessage.x = length;
        this.lbMessage.saveX = length;
        this.lbMessage.overX = -this.lbMessage.getWidth();

        this.clipNode(pos);
    },

    clipNode : function (pos) {
        var length = cc.winSize.width*Broadcast.WIDTH_RATIO_DEFAULT;

        var shape = new cc.DrawNode();
        var green = cc.color(0, 255, 0, 255);
        shape.drawRect(cc.p(0, 0), cc.p(length, 70), green);

        var clipper = new cc.ClippingNode();
        clipper.tag = 100;
        clipper.anchorX = 1;
        clipper.anchorY = 0.5;
        //clipper.x = pos.x;
        //clipper.y = pos.y;
        //   this.node.x = pos.x;
        // this.node.y = pos.y;
        clipper.stencil = shape;
        clipper.addChild(this.lbMessage);
        var scale = cc.director.getWinSize().width/Constant.WIDTH;
        scale = (scale > 1) ? 1 : scale;
        clipper.setScale(scale);

        var toX = 0;
        if(this.lbMessage instanceof RichLabelText)
            toX = -this.lbMessage.getWidth() - length;
        else
            toX = -this.lbMessage.getContentSize().width - length;
        this.nTimeoutMessage = Math.abs(toX/30);
        this.moveX = -1;

        this.node.addChild(clipper);
    },

    doPlay : function () {
        //cc.log("++Start " + this.ID + " | " + this.lbMessage.x + " | " + this.lbMessage.overX + " | " + this.timeoutMessage);

        this.numRepeat --;
        this.timeoutMessage = this.nTimeoutMessage;
        this.lbMessage.x = this.lbMessage.saveX;
        this.doMessage = true;
        this.setVisible(true);

        //cc.log("++newPlay " + this.ID + " | " + this.timeoutMessage + " | " + this.numRepeat);

        if(!this.getParent()) {
            this.retain();
            sceneMgr.layerSystem.addChild(this);
        }
    },

    doReload : function () {
        if(this.doMessage) {
            sceneMgr.layerSystem.addChild(this);
        }
    },

    doFinish : function () {
        if(this.numRepeat <= 0) {
            this.doMessage = false;
            this.isDead = true;
            //cc.log("++Clear Current Message+++");
        }
        else {
            this.doPlay();
        }
    },

    doUpdate : function (dt) {
        if(this.doMessage && this.getParent()) {
            this.lbMessage.x += this.moveX;
            this.timeoutMessage -= dt;
            if(this.timeoutMessage <= 0 || this.lbMessage.x <= this.lbMessage.overX)
            {
                //cc.log("++Finish " + this.timeoutMessage + " | " + this.lbMessage.x);
                this.doFinish();
            }
        }
    }
});