
var CreateRoomGUI = BaseLayer.extend({
    ctor: function() {
        this._super(CreateRoomGUI.className);

        this.initWithBinaryFile("SamCreateTableGUI.json");

        this.select = null;
        this.listbet = null;
        this.selectChanel = gamedata.selectedChanel;
    },

    customizeGUI: function(){

        this.setBackEnable(true);

        this.customizeButton("btnQuit",CreateRoomGUI.BTN_QUIT);
        this.customizeButton("btnOk",CreateRoomGUI.BTN_OK);
        this.customizeButton("btnSoNguoi",CreateRoomGUI.BTN_SONGUOI);

        this.setFog(true);
        this.onUpdateGUI();

        var bg = this.getControl("bg");
        this.bg = bg;

        var tableName = ccui.Helper.seekWidgetByName(bg,"tfTenban");
        tableName.setString(localized("TAOBAN_"+Math.floor(Math.random() * 8 + 1)));
        tableName.setTouchEnabled(false);

        this.select = ccui.Helper.seekWidgetByName(bg ,"select");
        this.select.setLocalZOrder(1);
        this.select.minX = ccui.Helper.seekWidgetByName(bg ,"dot1").getPosition().x;
        this.select.maxX = ccui.Helper.seekWidgetByName(bg ,"dot2").getPosition().x;

        //this.select.listBetX = [];
        //this.select.selectedBet = 0;
        //this.select.listBetX.push({bet:this.listbet[0], x: this.select.minX, betidx: 0 });
        //this.select.deltaX = (this.select.maxX - this.select.minX) / (this.listbet.length-1);
        //for(var i=1;i<this.listbet.length-1;i++)
        //{
        //    var xx = this.select.deltaX * i + this.select.minX;
        //    this.select.listBetX.push({bet:this.listbet[i], x: xx, betidx: i});
        //    var dot = new ccui.ImageView("CreateTableGUI/dot.png");
        //    dot.setPosition(xx,ccui.Helper.seekWidgetByName(bg ,"dot1").getPosition().y);
        //    bg.addChild(dot);
        //}
        //this.select.listBetX.push({bet:this.listbet[this.listbet.length-1], x: this.select.maxX,betidx : this.listbet.length-1});
        //this.select.bet = ccui.Helper.seekWidgetByName(bg ,"bet");
        //
        //var uGold = gamedata.userData.bean ;
        //var idx = 0;
        //
        //for(var i=this.listbet.length- 1;i>=0;i--){
        //    if(uGold >= (this.listbet[i] * 3 ))
        //    {
        //        idx = i;
        //        break;
        //    }
        //}
        //this.select.setPositionX(this.select.listBetX[idx].x);
        //ccui.Helper.seekWidgetByName(this.select.bet,"gold").setString(StringUtility.standartNumber(this.listbet[idx]));
        //this.select.selectedBet = this.select.listBetX[idx].betidx;
        //this.select.bet.setContentSize(cc.size(ccui.Helper.seekWidgetByName(this.select.bet,"gold").getContentSize().width ,this.select.bet.getContentSize().height));
        //
        //ccui.Helper.seekWidgetByName(this.select.bet,"gold").setPositionX(this.select.bet.getContentSize().width/2);
        //ccui.Helper.seekWidgetByName(this.select.bet,"arrow").setPositionX(this.select.bet.getContentSize().width/2);


        this.listDot = [];
        this._listenerSelect = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch,event){
                var select = event.getCurrentTarget();
                var pos = select.convertToWorldSpaceAR(cc.p(0,0));
                var rect = cc.rect(pos.x - select.getContentSize().width/2 ,pos.y - select.getContentSize().height/2,select.getContentSize().width,select.getContentSize().height);

                return !!cc.rectContainsPoint(rect, touch.getLocation());

            },
            onTouchMoved: function(touch,event){
                var select = event.getCurrentTarget();
                var currentPos = select.getPosition();
                var delta = touch.getDelta();

                var x = cc.pAdd(currentPos,delta).x;

                if(x < select.minX)
                    x = select.minX;
                else if(x > select.maxX)
                    x =select.maxX;
                select.setPositionX(x);

                for(var i=1;i<select.listBetX.length;i++){

                    if(x < select.listBetX[i].x)
                    {
                        if(x < (select.listBetX[i].x - select.deltaX/2) ){
                            ccui.Helper.seekWidgetByName(select.bet,"gold").setString("");
                            ccui.Helper.seekWidgetByName(select.bet,"gold").setString(StringUtility.standartNumber(select.listBetX[i-1].bet));
                            select.selectedBet = select.listBetX[i-1].betidx;
                            select.bet.setContentSize(cc.size(ccui.Helper.seekWidgetByName(select.bet,"gold").getContentSize().width ,select.bet.getContentSize().height));

                            ccui.Helper.seekWidgetByName(select.bet,"gold").setPositionX(select.bet.getContentSize().width/2);
                            ccui.Helper.seekWidgetByName(select.bet,"arrow").setPositionX(select.bet.getContentSize().width/2);
                            break;
                        }
                        else
                        {
                            ccui.Helper.seekWidgetByName(select.bet,"gold").setString("");
                            ccui.Helper.seekWidgetByName(select.bet,"gold").setString(StringUtility.standartNumber(select.listBetX[i].bet));
                            select.selectedBet = select.listBetX[i].betidx;
                            select.bet.setContentSize(cc.size(ccui.Helper.seekWidgetByName(select.bet,"gold").getContentSize().width ,select.bet.getContentSize().height));

                            ccui.Helper.seekWidgetByName(select.bet,"gold").setPositionX(select.bet.getContentSize().width/2);
                            ccui.Helper.seekWidgetByName(select.bet,"arrow").setPositionX(select.bet.getContentSize().width/2);
                            break;
                        }
                    }

                }

            },
            onTouchEnded: function(touch,event){
                var select = event.getCurrentTarget();
                var currentPos = select.getPosition();
                var delta = touch.getDelta();


                var x = cc.pAdd(currentPos,delta).x;

                if(x < select.minX)
                    x = select.minX;
                else if(x > select.maxX)
                    x =select.maxX;
                select.setPositionX(x);

                for(var i=1;i<select.listBetX.length;i++){

                    if(x < select.listBetX[i].x)
                    {
                        if(x < (select.listBetX[i].x - select.deltaX/2) ){
                            ccui.Helper.seekWidgetByName(select.bet,"gold").setString("");
                            ccui.Helper.seekWidgetByName(select.bet,"gold").setString(StringUtility.standartNumber(select.listBetX[i-1].bet));
                            select.selectedBet = select.listBetX[i-1].betidx;
                            select.bet.setContentSize(cc.size(ccui.Helper.seekWidgetByName(select.bet,"gold").getContentSize().width ,select.bet.getContentSize().height));

                            ccui.Helper.seekWidgetByName(select.bet,"gold").setPositionX(select.bet.getContentSize().width/2);
                            ccui.Helper.seekWidgetByName(select.bet,"arrow").setPositionX(select.bet.getContentSize().width/2);


                            select.runAction(new cc.EaseExponentialOut(cc.moveTo(.2,cc.p(select.listBetX[i-1].x,select.getPositionY()))));
                            break;
                        }
                        else
                        {
                            ccui.Helper.seekWidgetByName(select.bet,"gold").setString("");
                            ccui.Helper.seekWidgetByName(select.bet,"gold").setString(StringUtility.standartNumber(select.listBetX[i].bet));
                            select.selectedBet = select.listBetX[i].betidx;
                            select.bet.setContentSize(cc.size(ccui.Helper.seekWidgetByName(select.bet,"gold").getContentSize().width ,select.bet.getContentSize().height));

                            ccui.Helper.seekWidgetByName(select.bet,"gold").setPositionX(select.bet.getContentSize().width/2);
                            ccui.Helper.seekWidgetByName(select.bet,"arrow").setPositionX(select.bet.getContentSize().width/2);

                            select.runAction(new cc.EaseExponentialOut(cc.moveTo(.2,cc.p(select.listBetX[i].x,select.getPositionY()))));

                            break;
                        }
                    }

                }

            }
        });

        cc.eventManager.addListener(this._listenerSelect,this.select);


        var bgPerson = bg.getChildByName("bgPerson");
        this.customizeButton("btn2",CreateRoomGUI.BTN_2,bgPerson);
        this.customizeButton("btn3",CreateRoomGUI.BTN_3,bgPerson);
        this.customizeButton("btn4",CreateRoomGUI.BTN_4,bgPerson);
        this.customizeButton("btn5",CreateRoomGUI.BTN_5,bgPerson);

        bgPerson.setVisible(false);
        //if(this.selectChanel < 3)
        //{
        //    Toast.makeToast(3,"Lưu ý: Tính năng khóa phòng chỉ áp dụng cho kênh Triệu phú và Tỷ phú...");
        //    bg.getChildByName("pass").setEnabled(false);
        //}
        //else
        //{
        //
        //}
        this.personCount = 5;

        this.bg.getChildByName("pass").setVisible(false);
        this.bg.getChildByName("pass_1").setVisible(false);
        this.bg.getChildByName("Text_10_2").setVisible(false);
        this.bg.getChildByName("btnSoNguoi").setVisible(false);
    },

    onEnterFinish: function () {
        this.listbet = ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].bet;

        this.setShowHideAnimate(this.bg, true);
    },

    finishAnimate: function () {
        this.bg.getChildByName("pass").setString("");
        ccui.Helper.seekWidgetByName(this.bg,"tfTenban").setString(localized("TAOBAN_"+Math.floor(Math.random() * 8 + 1)));
        this.listbet = ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].bet;
        this.select.listBetX = [];
        this.select.selectedBet = 0;
        this.select.listBetX.push({bet:this.listbet[0], x: this.select.minX, betidx: 0 });
        this.select.deltaX = (this.select.maxX - this.select.minX) / (this.listbet.length-1);
        for (var i =this.listDot.length-1; i>=0; i--){
            if (this.listDot[i]) this.listDot[i].removeFromParent(true);
        }
        this.listDot = [];
        for(var i=1;i<this.listbet.length-1;i++)
        {
            var xx = this.select.deltaX * i + this.select.minX;
            this.select.listBetX.push({bet:this.listbet[i], x: xx, betidx: i});
            var dot = new ccui.ImageView("CreateTableGUI/dot.png");
            dot.setPosition(xx,ccui.Helper.seekWidgetByName(this.bg ,"dot1").getPosition().y);
            this.bg.addChild(dot);
            this.listDot.push(dot);
        }
        this.select.listBetX.push({bet:this.listbet[this.listbet.length-1], x: this.select.maxX,betidx : this.listbet.length-1});
        this.select.bet = ccui.Helper.seekWidgetByName(this.bg ,"bet");

        var uGold = gamedata.userData.bean ;
        var idx = 0;

        for(var i=this.listbet.length- 1;i>=0;i--){
            if(uGold >= (this.listbet[i] * 3 ))
            {
                idx = i;
                break;
            }
        }
        this.select.setPositionX(this.select.listBetX[idx].x);
        ccui.Helper.seekWidgetByName(this.select.bet,"gold").setString(StringUtility.standartNumber(this.listbet[idx]));
        this.select.selectedBet = this.select.listBetX[idx].betidx;

        this.select.bet.setContentSize(cc.size(ccui.Helper.seekWidgetByName(this.select.bet,"gold").getContentSize().width ,this.select.bet.getContentSize().height));

        ccui.Helper.seekWidgetByName(this.select.bet,"gold").setPositionX(this.select.bet.getContentSize().width/2);
        ccui.Helper.seekWidgetByName(this.select.bet,"arrow").setPositionX(this.select.bet.getContentSize().width/2);
        this.personCount = 5;
        this.selectChanel = gamedata.selectedChanel;
        /*
        if(this.selectChanel < 3)
        {
            Toast.makeToast(2,localized("KHOAPHONG_NOTE"));
            this.bg.getChildByName("pass").setEnabled(false);
        }
        else
        {
            this.bg.getChildByName("pass").setEnabled(true);
        }
        */
        this.onButtonRelease(null,CreateRoomGUI.BTN_5);

        if (!cc.sys.isNative){
            cc.eventManager.addListener(this._listenerSelect,this.select);
        }
    },

    onButtonRelease: function(button,id){
        switch (id){
            case CreateRoomGUI.BTN_OK:
            {
                var bg = ccui.Helper.seekWidgetByName(this._layout,"bg");
                var bgPerson = bg.getChildByName("bgPerson");
                if(bgPerson.isVisible())
                    break;
                var uGold = gamedata.userData.bean;
                if(uGold < (3 * ChanelConfig.instance().chanelConfig[gamedata.selectedChanel].bet[this.select.selectedBet]) )
                {
                    Toast.makeToast(2,"Bạn chọn mức cược quá cao");
                    break;
                }

                var tenban = ccui.Helper.seekWidgetByName(bg,"tfTenban").getString();
                var ret = "";
                for(var i=0;i<tenban.length;i++)
                {
                    var check = tenban[i];
                    if((check >= 'a' && check <= 'z') || (check >='A' && check <= 'Z') || (check>=0 && check <= 9))
                    {
                        ret += check;
                    }
                }

                var bg = ccui.Helper.seekWidgetByName(this._layout,"bg");

                var pk = new CmdSendQuickPlayCustom();
                pk.putData(gamedata.selectedChanel, this.select.selectedBet);
                GameClient.getInstance().sendPacket(pk);
                pk.clean();

                //var pk = new CmdSendCreateRoom();
                //pk.putData(tenban,this.select.selectedBet,ccui.Helper.seekWidgetByName(bg,"CheckBox_1").isSelected(),ccui.Helper.seekWidgetByName(bg,"pass").getString(),this.personCount);
                //GameClient.getInstance().sendPacket(pk);
                //pk.clean();

                this._layerColor.runAction(cc.fadeTo(.2,0));
                this.onClose();
                sceneMgr.addLoading("Chờ xíu hen...").timeout(21);

                break;
            }
            case CreateRoomGUI.BTN_QUIT:
            {
                this.onBack();
                break;
            }
            case CreateRoomGUI.BTN_SONGUOI:
            {
                if(this.selectChanel < 3)
                    break;
                var bg = ccui.Helper.seekWidgetByName(this._layout,"bg");
                var bgPerson = bg.getChildByName("bgPerson");
                bgPerson.setVisible(!bgPerson.isVisible());
                break;
            }
            case CreateRoomGUI.BTN_2:
            case CreateRoomGUI.BTN_3:
            case CreateRoomGUI.BTN_4:
            case CreateRoomGUI.BTN_5:
            {
                this.personCount = id - 1;
                var bg = ccui.Helper.seekWidgetByName(this._layout,"bg");
                var bgPerson = bg.getChildByName("bgPerson");
                bgPerson.setVisible(false);

                bg.getChildByName("btnSoNguoi").getChildByName("lb").setString(this.personCount+" người");
                break;
            }

        }
    },

    onUpdateGUI: function(){

    },

    onBack : function() {
        this.onClose();
    }
});

CreateRoomGUI.className = "CreateRoomGUI";

CreateRoomGUI.BTN_QUIT = 1;
CreateRoomGUI.BTN_OK = 2;
CreateRoomGUI.BTN_2 = 3;
CreateRoomGUI.BTN_3 = 4;
CreateRoomGUI.BTN_4 = 5;
CreateRoomGUI.BTN_5 = 6;
CreateRoomGUI.BTN_SONGUOI = 7;
