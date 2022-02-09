
var CreateRoomGUI = BaseLayer.extend({
    ctor: function() {
        this._super(CreateRoomGUI.className);
        this.initWithBinaryFile("CreateTableGUI.json");
        this.select = null;
        this.listbet = null;
    },

    customizeGUI: function(){
        this.setBackEnable(true);
        this.setFog(true);

        var bg = this.getControl("bg");
        this.bg = bg;
        this.customizeButton("btnQuit", CreateRoomGUI.BTN_QUIT, bg);
        this.customizeButton("btnOk", CreateRoomGUI.BTN_OK, bg);
        this.btnAdd = this.customizeButton("btnAdd", CreateRoomGUI.BTN_ADD, bg);
        this.btnSub = this.customizeButton("btnSub", CreateRoomGUI.BTN_SUB, bg);

        this.bgInfo = this.getControl("bgInfo", bg);
        this.lbGold = this.getControl("lbGold", this.bgInfo);

        this.bgSlide = this.getControl("bgSlide", bg);
        this.select = this.getControl("select", this.bgSlide);
        this.select.setLocalZOrder(1);
        this.select.minX = 120;
        this.select.maxX = this.bgSlide.getContentSize().width - 120;

        this.listDot = [];
        this._listenerSelect = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch,event){
                var select = event.getCurrentTarget();
                var pos = select.convertToWorldSpaceAR(cc.p(0,0));
                var rect = cc.rect(pos.x - select.getContentSize().width/2 ,pos.y - select.getContentSize().height/2,
                    select.getContentSize().width,select.getContentSize().height);
                return !!cc.rectContainsPoint(rect, touch.getLocation());

            },
            onTouchMoved: function(touch,event){
                var select = event.getCurrentTarget();
                var currentPos = select.getPosition();
                var delta = touch.getDelta();
                var x = cc.pAdd(currentPos, delta).x;
                this.updateSelectBetFromMove(select, x, false);
            }.bind(this),

            onTouchEnded: function(touch,event){
                var select = event.getCurrentTarget();
                var currentPos = select.getPosition();
                var delta = touch.getDelta();
                var x = cc.pAdd(currentPos,delta).x;
                this.updateSelectBetFromMove(select, x, true);
            }.bind(this)
        });
        cc.eventManager.addListener(this._listenerSelect,this.select);
    },

    updateSelectBetFromMove: function (select, x, isTouchEnd) {
        if (x < select.minX)
            x = select.minX;
        else if(x > select.maxX)
            x = select.maxX;
        select.setPositionX(x);
        for (var i = 1; i < select.listBetX.length; i++) {
            if (x < select.listBetX[i].x) {
                var index;
                if (x < (select.listBetX[i].x - select.deltaX/2) ){
                    index = i - 1;
                }
                else {
                    index = i;
                }
                select.selectedBet = select.listBetX[index].betidx;
                if (isTouchEnd) {
                    this.updateSelectBet(select.selectedBet);
                }
                break;
            }
        }
    },

    updateSelectBet: function (id) {
        this.lbGold.setString(StringUtility.standartNumber(this.select.listBetX[id].bet));
        this.select.selectedBet = id;
        this.select.runAction(new cc.EaseExponentialOut(cc.moveTo(.2, cc.p(this.select.listBetX[id].x, this.select.getPositionY()))));
        if (id == 0) {
            this.btnSub.setEnabled(false);
            this.btnSub.setBright(0);
        }
        else {
            this.btnSub.setEnabled(true);
            this.btnSub.setBright(1);
        }
        if (id == this.select.listBetX.length - 1) {
            this.btnAdd.setEnabled(false);
            this.btnAdd.setBright(0);
        }
        else {
            this.btnAdd.setEnabled(true);
            this.btnAdd.setBright(1);
        }
    },

    onEnterFinish: function () {
        this.listbet = channelMgr.getListBet();
        this.setShowHideAnimate(this.bg, true);
    },

    finishAnimate: function () {
        this.listbet = channelMgr.getListBet();
        this.select.listBetX = [];
        this.select.selectedBet = 0;
        this.select.deltaX = (this.select.maxX - this.select.minX) / (this.listbet.length-1);
        for (var i = this.listDot.length - 1; i >= 0; i--){
            if (this.listDot[i]) this.listDot[i].removeFromParent(true);
        }
        this.listDot = [];
        for(var i = 0; i < this.listbet.length; i++) {
            var xx = this.select.deltaX * i + this.select.minX;
            this.select.listBetX.push({bet:this.listbet[i], x: xx, betidx: i});
            this.listDot[i] = new cc.Sprite("CreateTableGUI/dotActive.png");
            this.listDot[i].setPosition(xx, this.bgSlide.getContentSize().height * 0.5);
            this.bgSlide.addChild(this.listDot[i]);
        }

        var idx = 0;
        for(var i = this.listbet.length- 1; i >= 0; i--){
            if(channelMgr.checkCanPlay(i)) {
                idx = i;
                break;
            }
        }
        this.updateSelectBet(this.select.listBetX[idx].betidx);

        if (!cc.sys.isNative){
            cc.eventManager.addListener(this._listenerSelect, this.select);
        }
    },

    onButtonRelease: function(button,id){
        switch (id){
            case CreateRoomGUI.BTN_OK:
            {
                if (!channelMgr.checkCanPlay(this.select.selectedBet)) {
                    Toast.makeToast(2,"Bạn chọn mức cược quá cao");
                    break;
                }

                var pk = new CmdSendQuickPlayCustom();
                pk.putData(channelMgr.selectedChanel, this.select.selectedBet);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                this._layerColor.runAction(cc.fadeTo(.2,0));
                this.onClose();
                sceneMgr.addLoading("Chờ xíu hen...").timeout(21);
                break;
            }
            case CreateRoomGUI.BTN_ADD:
            {
                this.updateSelectBet(this.select.selectedBet + 1);
                break;
            }
            case CreateRoomGUI.BTN_SUB:
            {
                this.updateSelectBet(this.select.selectedBet - 1);
                break;
            }
            case CreateRoomGUI.BTN_QUIT:
            {
                this.onBack();
                break;
            }
        }
    },

    onBack : function() {
        this.onClose();
    }
});

CreateRoomGUI.className = "CreateRoomGUI";

CreateRoomGUI.BTN_QUIT = 1;
CreateRoomGUI.BTN_OK = 2;
CreateRoomGUI.BTN_ADD = 3;
CreateRoomGUI.BTN_SUB = 4;
