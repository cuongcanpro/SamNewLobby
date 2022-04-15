
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
        this.btnSolo = this.customizeButton("btnSolo", CreateRoomGUI.BTN_MODE_SOLO, bg);
        this.btnNormal = this.customizeButton("btnNormal", CreateRoomGUI.BTN_MODE_NORMAL, bg);
        this.btnBigBet = this.customizeButton("btnBigBet", CreateRoomGUI.BTN_BIG_BET, bg);

        this.checkBoxBigBet = this.getControl("checkBoxBigBet", this.btnBigBet);

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
        var index = 0;
        for (var i = 1; i < select.listBetX.length; i++) {
            if (x < select.listBetX[i].x) {
                if (x < (select.listBetX[i].x - select.deltaX/2) ){
                    index = i - 1;
                }
                else {
                    index = i;
                }
                break;
            }
            else if (i == select.listBetX.length - 1) {
                index = i;
            }
        }
        if (index < 0) {
            index = 0;
        }
        else if (index >= select.listBetX.length) {
            index = select.listBetX.length - 1;
        }
        select.selectedBet = select.listBetX[index].betidx - this.startIdx;
        // if (isTouchEnd) {
            this.updateSelectBet(select.selectedBet, isTouchEnd);
        // }
    },

    updateSelectBet: function (id, isTouchEnd) {
        this.lbGold.setString(StringUtility.standartNumber(this.select.listBetX[id].bet));
        this.select.selectedBet = id;
        cc.log("id update select bet " + id + " " + this.select.listBetX.length + " " + this.select.listBetX[id].x + " " + this.select.getPositionY());
        if (isTouchEnd) {
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
        }

    },

    onEnterFinish: function () {
        this.onButtonRelease(this.btnNormal, CreateRoomGUI.BTN_MODE_NORMAL);
        this.setShowHideAnimate(this.bg, true);
    },

    finishAnimate: function () {
       // this.listbet = channelMgr.getListBetByChannel();
        this.autoSelectBet();
        if (!cc.sys.isNative){
            cc.eventManager.addListener(this._listenerSelect, this.select);
        }
    },

    autoSelectBet: function () {
        this.select.listBetX = [];
        this.select.selectedBet = 0;
        if (this.listbet.length == 1)
            this.select.deltaX = 0;
        else
            this.select.deltaX = (this.select.maxX - this.select.minX) / (this.listbet.length - 1);

        for (var i = this.listDot.length - 1; i >= 0; i--){
            if (this.listDot[i]) this.listDot[i].removeFromParent(true);
        }
        this.listDot = [];
        this.startIdx = channelMgr.getBetIndex(this.listbet[0]);
        for(var i = 0; i < this.listbet.length; i++) {
            var xx = this.select.deltaX * i + this.select.minX;
            this.select.listBetX.push({bet:this.listbet[i], x: xx, betidx: this.startIdx + i});
            this.listDot[i] = new cc.Sprite("CreateTableGUI/dotActive.png");
            this.listDot[i].setPosition(xx, this.bgSlide.getContentSize().height * 0.5);
            this.bgSlide.addChild(this.listDot[i]);
        }

        var idx = 0;
        cc.log("LIST BET " + JSON.stringify(this.select.listBetX));
        for (var i = this.listbet.length - 1; i >= 0; i--) {
            cc.log("BET " + this.select.listBetX[i].bet);
            if(userMgr.getGold() >= channelMgr.betTime * this.select.listBetX[i].bet) {
                idx = i;
                break;
            }
        }
        // return;
        this.updateSelectBet(this.select.listBetX[idx].betidx - this.startIdx);
    },

    onButtonRelease: function(button,id){
        switch (id){
            case CreateRoomGUI.BTN_OK:
            {
                var pk = new CmdSendQuickPlayCustom();
                var roomMode = this.isSolo ? CmdSendQuickPlayCustom.ROOM_SOLO : CmdSendQuickPlayCustom.ROOM_NORMAL;
                pk.putData(this.select.selectedBet + 10, CmdSendQuickPlayCustom.TYPE_SELECT_ROOM, roomMode, this.checkBoxBigBet.isSelected() ? CmdSendQuickPlayCustom.BIG_BET : CmdSendQuickPlayCustom.NORMAL_BET);
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
            case CreateRoomGUI.BTN_BIG_BET:
            {
                this.checkBoxBigBet.setSelected(!this.checkBoxBigBet.isSelected());
                break;
            }
            case CreateRoomGUI.BTN_MODE_SOLO:
            case CreateRoomGUI.BTN_MODE_NORMAL:
            {
                this.isSolo = (id === CreateRoomGUI.BTN_MODE_SOLO);
                if (this.isSolo){
                    if (!channelMgr.checkCanPlaySolo()){
                        if (paymentMgr.checkEnablePayment()) {
                            var text = localized("PLAY_SOLO_NOTICE");
                            text = StringUtility.replaceAll(text, "@gold", StringUtility.formatNumberSymbol(channelMgr.minGoldSolo));
                            sceneMgr.showChangeGoldDialog(text, this, function (buttonId) {
                                if (buttonId == Dialog.BTN_OK) {
                                    gamedata.openShop(this._id,true);
                                }
                            });
                        }
                        else {
                            sceneMgr.showOKDialog(LocalizedString.to("NOT_ENOUGH_GOLD"));
                        }
                        return;
                    }
                }
                if (id == CreateRoomGUI.BTN_MODE_SOLO) {
                    this.btnNormal.loadTextures("CreateTableGUI/modeNormalOff.png", "CreateTableGUI/modeNormalOff.png", "CreateTableGUI/modeNormalOff.png");
                    this.btnSolo.loadTextures("CreateTableGUI/modeSoloOn.png", "CreateTableGUI/modeSoloOn.png", "CreateTableGUI/modeSoloOn.png");

                }
                else {
                    this.btnNormal.loadTextures("CreateTableGUI/ModeNormalOn.png", "CreateTableGUI/ModeNormalOn.png", "CreateTableGUI/ModeNormalOn.png");
                    this.btnSolo.loadTextures("CreateTableGUI/modeSoloOff.png", "CreateTableGUI/modeSoloOff.png", "CreateTableGUI/modeSoloOff.png");
                }
                this.listbet = channelMgr.getListBetByChannel(channelMgr.getSelectedChannel(), userMgr.getGold(), this.isSolo);
                this.autoSelectBet();
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
CreateRoomGUI.BTN_MODE_SOLO = 5;
CreateRoomGUI.BTN_MODE_NORMAL = 6;
CreateRoomGUI.BTN_BIG_BET = 7;
